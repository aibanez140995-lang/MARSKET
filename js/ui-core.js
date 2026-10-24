// js/ui-core.js
// --- MÓDULO UI CORE: ENRUTAMIENTO, HUD, BLINDAJE LÉXICO Y ONBOARDING (v1.1.24) ---

// Constante global GOOGLE_DRIVE_REGEX centralizada en js/config.js

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '', evalClassFilter: 'ALL',
    activeMilestoneGroup: 'ACTIVE',
    ordersFilterTab: 'EN_PROCESO',
    ordersVisibleCount: 5,
    currentSubView: null,
    _lastFocusedElement: null,
    _toastTimer: null,
    _layerStack: [],
    _layerCounter: 0,
    _isPoppingState: false,
    _cleanupHooks: [],
    _delegationAttached: false,

    onCleanup(fn) {
        if (typeof fn === 'function') {
            this._cleanupHooks.push(fn);
        }
    },

    beforeRenderCleanup() {
        for (const fn of this._cleanupHooks) {
            try {
                fn();
            } catch (err) {
                console.error('[UI] Error en cleanup hook:', err);
            }
        }
        this._cleanupHooks.length = 0;
    },

    initEventDelegation() {
        if (this._delegationAttached) return;
        const vp = document.getElementById('viewport');
        if (!vp) {
            console.warn('[UI] #viewport no encontrado para delegación.');
            return;
        }

        vp.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;
            const action = actionEl.getAttribute('data-action');
            const rawPayload = actionEl.getAttribute('data-payload');
            let payload = null;
            if (rawPayload !== null && rawPayload !== undefined) {
                try {
                    payload = JSON.parse(rawPayload);
                } catch {
                    payload = rawPayload;
                }
            }
            if (typeof this[action] === 'function') {
                this[action](payload, actionEl, e);
            } else if (typeof window[action] === 'function') {
                window[action](payload, actionEl, e);
            }
        });

        vp.addEventListener('change', (e) => {
            const changeEl = e.target.closest('[data-change]');
            if (!changeEl) return;
            const handler = changeEl.dataset.change || changeEl.getAttribute('data-change');
            const val = changeEl.type === 'checkbox' ? changeEl.checked : changeEl.value;
            if (typeof this[handler] === 'function') {
                this[handler](val, changeEl.dataset.extra, changeEl, e);
            }
        });

        this._delegationAttached = true;
    },

    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    escapeAttr(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    },

    cleanInput(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    },

    toast(message, tone = 'info', duration = 4000) {
        return this.notify(message, tone, duration);
    },

    showToast(message, tone = 'info', duration = 4000) {
        return this.notify(message, tone, duration);
    },

    renderAll() {
        return this.render();
    },

    notify(message, type = 'info', duration = 5000) {
        const cleanMsg = String(message || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
        let tone = type;
        if (cleanMsg.startsWith('❌') || cleanMsg.startsWith('🚨') || cleanMsg.includes('ALERTA LOPD') || cleanMsg.toLowerCase().includes('error') || cleanMsg.toLowerCase().includes('incorrecto') || cleanMsg.toLowerCase().includes('insuficientes') || cleanMsg.toLowerCase().includes('denegad') || cleanMsg.toLowerCase().includes('rechazad')) {
            tone = 'error';
        } else if (cleanMsg.startsWith('⚠️') || cleanMsg.startsWith('⏳') || cleanMsg.startsWith('⚠')) {
            tone = 'warning';
        } else if (cleanMsg.startsWith('✅') || cleanMsg.startsWith('✓')) {
            tone = 'success';
        }

        let container = document.getElementById('hud-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hud-toast-container';
            container.className = 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[70] flex flex-col gap-2 pointer-events-none';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const borderColors = {
            info: 'border-mars-cyan bg-slate-950/95 text-mars-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]',
            success: 'border-mars-green bg-slate-950/95 text-mars-green shadow-[0_0_15px_rgba(0,255,102,0.25)]',
            warning: 'border-mars-yellow bg-slate-950/95 text-mars-yellow shadow-[0_0_15px_rgba(255,183,3,0.25)]',
            error: 'border-mars-magenta bg-slate-950/95 text-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.3)]'
        };
        toast.className = `pointer-events-auto terminal-border border-l-4 ${borderColors[tone] || borderColors.info} p-3.5 text-xs font-mono flex items-start justify-between gap-3 animate-in fade-in duration-200`;
        toast.innerHTML = `
            <div class="leading-relaxed text-white break-words flex-grow">${this.escapeHTML(cleanMsg)}</div>
            <button type="button" aria-label="Cerrar aviso" class="w-11 h-11 min-w-[44px] min-h-[44px] text-slate-300 hover:text-white font-black flex items-center justify-center shrink-0 border border-slate-700 bg-black/60" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.parentElement) toast.remove();
        }, duration || 5000);
    },

    confirmAction(title, message, onConfirm, confirmLabel = 'Confirmar Operación', isDanger = false) {
        this._pendingConfirmFn = onConfirm;
        const btnClass = isDanger
            ? 'bg-mars-magenta text-white hover:bg-white hover:text-mars-magenta border border-mars-magenta'
            : 'bg-mars-cyan text-black hover:bg-white border border-mars-cyan';
        const body = `<p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${this.escapeHTML(message)}</p>`;
        const actions = `<button type="button" onclick="ui.executeConfirmAction()" class="${btnClass} px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all min-h-[44px]">${this.escapeHTML(confirmLabel)}</button>`;
        this.showModal(title, body, actions);
    },

    executeConfirmAction() {
        const fn = this._pendingConfirmFn;
        this._pendingConfirmFn = null;
        this.closeModal();
        if (typeof fn === 'function') fn();
    },

    confirmModal(title, message, onConfirm, confirmLabel = 'Confirmar Operación', isDanger = false) {
        return new Promise((resolve) => {
            this.confirmAction(title, message, () => {
                if (typeof onConfirm === 'function') onConfirm();
                resolve(true);
            }, confirmLabel, isDanger);
        });
    },

    confirmHUD(title, message, onConfirm, confirmLabel = 'Confirmar Operación', isDanger = false) {
        return this.confirmModal(title, message, onConfirm, confirmLabel, isDanger);
    },

    renderLogin() {
        this.current = 'login';
        this.render();
    },

    setOfflineContainment(isOffline) {
        const overlay = document.getElementById('hud-offline-containment');
        const mainContainer = document.querySelector('body > div');
        if (!overlay) return;
        if (isOffline) {
            overlay.classList.remove('hidden');
            if (mainContainer) {
                mainContainer.setAttribute('inert', '');
                mainContainer.classList.add('pointer-events-none', 'select-none');
            }
        } else {
            overlay.classList.add('hidden');
            if (mainContainer) {
                mainContainer.removeAttribute('inert');
                mainContainer.classList.remove('pointer-events-none', 'select-none');
            }
        }
    },

    navigate(view) {
        this.current = view;
        this.currentSubView = null;
        this.render();
    },

    setCompanySubTab(tab) {
        this.companySubTab = tab;
        this.render();
    },

    toggleDossierShowAll() {
        this.dossierShowAll = !this.dossierShowAll;
        this.render();
    },

    viewCompany(vp) {
        const subTab = this.companySubTab || 'resolutions';
        const subTabs = [
            { id: 'resolutions', label: '⚖️ Gobernanza & Asamblea' },
            { id: 'orders', label: '📋 Historial de Órdenes' },
            { id: 'market', label: '🛒 SUPERMARS-KET' }
        ];

        const navHtml = `
        <div class="mb-6 flex flex-wrap gap-2 border-b border-slate-800 pb-3" role="tablist">
            ${subTabs.map(t => {
                const isActive = (subTab === t.id);
                return `
                <button type="button" role="tab" aria-selected="${isActive}" onclick="ui.setCompanySubTab('${t.id}')"
                    class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all rounded-sm flex items-center gap-2 ${
                        isActive
                            ? 'bg-mars-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }">
                    ${t.label}
                </button>
                `;
            }).join('')}
        </div>
        <div id="company-subtab-container" class="w-full"></div>
        `;

        const wrapper = document.createElement('div');
        wrapper.className = 'w-full animate-in fade-in duration-300';
        wrapper.innerHTML = navHtml;
        vp.appendChild(wrapper);

        const subContainer = wrapper.querySelector('#company-subtab-container');
        if (subTab === 'resolutions') {
            this.viewResolutions(subContainer);
        } else if (subTab === 'orders') {
            this.viewOrders(subContainer);
        } else if (subTab === 'market') {
            this.viewMarket(subContainer);
        }
    },

    setSubView(subView, skipHistory = false) {
        if (subView) {
            this.currentSubView = subView;
            this.pushLayer('subview', (skipHist) => this.setSubView(null, skipHist));
        } else {
            this.currentSubView = null;
            this.closeLayer('subview', skipHistory);
        }
        this.render();
    },

    toggleMilestoneAccordion(groupId) {
        this.activeMilestoneGroup = (this.activeMilestoneGroup === groupId) ? 'NONE' : groupId;
        this.render();
    },

    setOrdersFilterTab(tab) {
        this.ordersFilterTab = tab || 'EN_PROCESO';
        this.ordersVisibleCount = 5;
        this.render();
    },

    loadMoreOrders() {
        this.ordersVisibleCount = (this.ordersVisibleCount || 5) + 5;
        this.render();
    },

    openDrawer(title, bodyHtml) {
        this._lastFocusedElement = document.activeElement;
        const overlay = document.getElementById('hud-drawer-overlay');
        const titleEl = document.getElementById('hud-drawer-title');
        const bodyEl = document.getElementById('hud-drawer-body');
        const sheet = document.getElementById('hud-drawer-sheet');
        const handle = document.getElementById('hud-drawer-handle-zone');
        if (!overlay || !titleEl || !bodyEl || !sheet || !handle) return;

        titleEl.innerText = title || 'INSPECCIÓN TÁCTICA';
        bodyEl.innerHTML = bodyHtml || '';
        overlay.classList.remove('hidden');

        this._touchStartY = 0;
        this._lastDeltaY = 0;

        this._boundTouchMove = (e) => {
            const deltaY = e.touches[0].clientY - this._touchStartY;
            if (deltaY > 0) {
                this._lastDeltaY = deltaY;
                sheet.style.transform = `translateY(${deltaY}px)`;
            }
        };
        this._boundTouchEnd = () => {
            const deltaY = this._lastDeltaY || 0;
            if (deltaY > 75) {
                this.closeDrawer();
            } else {
                sheet.style.transition = 'transform 0.2s ease-out';
                sheet.style.transform = 'translateY(0px)';
            }
            window.removeEventListener('touchmove', this._boundTouchMove);
            window.removeEventListener('touchend', this._boundTouchEnd);
        };

        if (this._boundTouchStart && this._drawerHandleEl) {
            this._drawerHandleEl.removeEventListener('touchstart', this._boundTouchStart);
        }
        this._drawerHandleEl = handle;
        this._boundTouchStart = (e) => {
            this._touchStartY = e.touches[0].clientY;
            this._lastDeltaY = 0;
            sheet.style.transition = '';
        };
        handle.addEventListener('touchstart', this._boundTouchStart, { passive: true });

        window.addEventListener('touchmove', this._boundTouchMove, { passive: true });
        window.addEventListener('touchend', this._boundTouchEnd);

        this.pushLayer('drawer', (skipHistory) => this.closeDrawer(skipHistory));
        setTimeout(() => {
            const firstBtn = overlay.querySelector('button:not([disabled]), a[href], input:not([disabled])');
            if (firstBtn) firstBtn.focus();
        }, 40);
    },

    closeDrawer(skipHistory = false) {
        if (this._boundTouchMove) window.removeEventListener('touchmove', this._boundTouchMove);
        if (this._boundTouchEnd) window.removeEventListener('touchend', this._boundTouchEnd);
        if (this._boundTouchStart && this._drawerHandleEl) {
            this._drawerHandleEl.removeEventListener('touchstart', this._boundTouchStart);
            this._boundTouchStart = null;
            this._drawerHandleEl = null;
        }
        const sheet = document.getElementById('hud-drawer-sheet');
        if (sheet) {
            sheet.style.transform = '';
            sheet.style.transition = '';
        }
        const overlay = document.getElementById('hud-drawer-overlay');
        if (overlay) overlay.classList.add('hidden');
        this.closeLayer('drawer', skipHistory);
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
        }
    },

    // G6 · Pipeline de normalización de texto seguro en orden riguroso:
    // NFKC → quitar invisibles → minúsculas → mapa de homoglifos → NFD sin diacríticos → leet → colapsar letras sueltas → borrar no alfanumérico → colapsar repeticiones
    normalizeTextPipeline(text) {
        if (!text) return { cleanText: '', collapsed: '', tokens: [] };

        // 1. Unicode NFKC
        let s = String(text).normalize('NFKC');

        // 2. Quitar caracteres invisibles y de control (U+200B–U+200F, U+2060, U+FEFF, U+00AD, selectores de variación)
        s = s.replace(/[\u200B-\u200F\u2060\uFEFF\u00AD\uFE00-\uFE0F]/g, '');

        // 3. Minúsculas
        s = s.toLowerCase();

        // 4. Mapa de homoglifos (cirílico y griego confusables -> latino) ANTES del borrado
        const homoglyphs = typeof LEXICON_HOMOGLYPHS !== 'undefined' ? LEXICON_HOMOGLYPHS : {
            'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x', 
            'к': 'k', 'м': 'm', 'н': 'h', 'т': 't', 'в': 'b', 'і': 'i', 'ј': 'j', 
            'ѕ': 's', 'ё': 'e', 'п': 'n',
            'ο': 'o', 'α': 'a', 'ν': 'v', 'ρ': 'p', 'ι': 'i', 'κ': 'k', 'τ': 't', 
            'υ': 'u', 'χ': 'x', 'β': 'b'
        };
        s = s.replace(/[аеорсухкмнтвіјѕёпоανρικτυχβ]/g, ch => homoglyphs[ch] || ch);

        // 5. NFD sin diacríticos
        s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // 6. Leet: @->a 4->a 3->e 1->i (probado también como l) 0->o 5->$->s 7->t 8->b (NO sustituir v por u)
        s = s.replace(/[@4]/g, 'a')
             .replace(/3/g, 'e')
             .replace(/[1!|]/g, 'i')
             .replace(/0/g, 'o')
             .replace(/[5$]/g, 's')
             .replace(/7/g, 't')
             .replace(/8/g, 'b');

        // 7. Colapsar solo letras sueltas separadas ("p e d r o", "p.e.d.r.o", "p_e_d_r_o") con regex de caracteres individuales
        let prev = '';
        while (prev !== s) {
            prev = s;
            s = s.replace(/(?<=(?:^|[\s.,_\-\/]))([a-z0-9])[.\s_\-\/]+(?=[a-z0-9](?:[\s.,_\-\/]|$))/gi, '$1');
        }

        // 8. Borrar lo no alfanumérico (dejando espacios entre palabras completas)
        s = s.replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

        // 9. Colapsar repeticiones de 3 o más letras
        const collapsed = s.replace(/(.)\1{2,}/g, '$1$1');

        const tokens = collapsed.split(' ').filter(Boolean);
        return { cleanText: s, collapsed, tokens };
    },

    // MÓDULO C (v1.0.19 / G6): Validador Centralizado Anti-Impropios y LOPD Contextual No Destructivo
    validateSafeText(text) {
        if (!text || !String(text).trim()) {
            return { valid: true, reason: '', matches: [] };
        }

        const { cleanText, collapsed, tokens } = this.normalizeTextPipeline(text);
        if (!collapsed) {
            return { valid: true, reason: '', matches: [] };
        }

        const words = typeof FORBIDDEN_WORDS !== 'undefined' ? FORBIDDEN_WORDS : [];
        const roleAliases = ['mario', 'alex', 'alejandro', 'coordinador', 'director', 'profe', 'profesor'];
        const profanityList = words.filter(w => !roleAliases.includes(w.toLowerCase()));

        const safeWords = typeof LEXICON_SAFE_WORDS !== 'undefined' ? LEXICON_SAFE_WORDS : [
            'calculo', 'vehiculo', 'obstaculo', 'espectaculo', 'computo', 'computadora', 
            'disputa', 'penetracion', 'metal exterior', 'asombro', 'dispuesto'
        ];

        const eponyms = typeof SCIENTIFIC_EPONYMS !== 'undefined' ? SCIENTIFIC_EPONYMS : [
            'newton', 'kepler', 'hubble', 'gagarin', 'armstrong', 'tsiolkovsky', 'goddard', 
            'bernoulli', 'reynolds', 'hooke', 'coriolis', 'kennedy', 'johnson', 'curie', 
            'einstein', 'hawking', 'galileo', 'copernico', 'brahe', 'sagan', 'huygens'
        ];

        const firstNames = new Set(typeof LOPD_FIRST_NAMES !== 'undefined' ? LOPD_FIRST_NAMES : ['juana', 'maria', 'alejandro', 'pedro', 'lucia', 'carlos', 'sofia', 'mario', 'alex', 'john', 'mohammed', 'yan', 'fatima']);
        const surnames = new Set(typeof LOPD_SURNAMES !== 'undefined' ? LOPD_SURNAMES : ['garcia', 'gonzalez', 'rodriguez', 'fernandez', 'lopez', 'martinez', 'sanchez', 'perez', 'gomez', 'smith']);
        const baseWhitelist = typeof AEROSPACE_WHITELIST !== 'undefined' ? AEROSPACE_WHITELIST : ['luna', 'marte', 'roca', 'franco', 'sierra', 'corona', 'cruz', 'blanco', 'polo', 'vega', 'sol', 'carbon', 'silicio'];
        const whitelist = new Set([...baseWhitelist, ...eponyms]);

        const matches = [];
        let violationType = null;

        // Comprobación de palabras seguras (evitar falsos positivos como calculo -> culo o disputa -> puta)
        const isSafeContext = (word) => {
            return safeWords.some(sw => sw === word || (sw.includes(word) && (cleanText.includes(sw) || tokens.some(t => t.includes(sw)))));
        };

        // 1. Comprobación de lenguaje soez / impropio
        for (const bad of profanityList) {
            const normBad = bad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            if (!normBad) continue;

            const isShort = normBad.length < 5;
            const boundaryRx = new RegExp(`\\b${normBad}\\b`, 'i');

            let matched = false;
            if (isShort) {
                // Menos de 5 letras: exigir límite de palabra estricto
                if (boundaryRx.test(collapsed) || boundaryRx.test(cleanText)) {
                    if (!isSafeContext(normBad)) matched = true;
                }
            } else {
                // 5 o más letras: permitir raíz o inclusión salvo si forma parte de palabra segura
                if (boundaryRx.test(collapsed) || boundaryRx.test(cleanText) || collapsed.includes(normBad)) {
                    if (!isSafeContext(normBad)) matched = true;
                }
            }

            if (matched) {
                matches.push(bad);
                violationType = 'PROFANITY';
            }
        }

        if (matches.length > 0) {
            return {
                valid: false,
                type: 'PROFANITY',
                reason: "ALERTA LOPD // Texto no autorizado detectado: Modifique los nombres personales o términos señalados para continuar.",
                matches: Array.from(new Set(matches))
            };
        }

        // 2. Tokenización y análisis contextual LOPD (Nombres, Apellidos y Lista Blanca Aeroespacial/Científica)
        const isUnambiguousPersonalToken = (tok) => {
            if (!tok || whitelist.has(tok)) return false;
            const tokCollapsed = tok.replace(/(.)\1+/g, '$1');
            if (whitelist.has(tokCollapsed)) return false;
            return firstNames.has(tok) || surnames.has(tok) || roleAliases.includes(tok) ||
                   firstNames.has(tokCollapsed) || surnames.has(tokCollapsed) || roleAliases.includes(tokCollapsed);
        };

        for (let i = 0; i < tokens.length; i++) {
            const tok = tokens[i];
            const tokCollapsed = tok.replace(/(.)\1+/g, '$1');

            if (whitelist.has(tok) || whitelist.has(tokCollapsed)) {
                // Es un término aeroespacial o epónimo científico en Lista Blanca.
                // Solo se bloquea si va precedido o seguido inmediatamente por un nombre/apellido personal no técnico.
                const prevTok = i > 0 ? tokens[i - 1] : null;
                const nextTok = i < tokens.length - 1 ? tokens[i + 1] : null;
                if (isUnambiguousPersonalToken(prevTok) || isUnambiguousPersonalToken(nextTok)) {
                    matches.push(tok);
                    violationType = 'NAME';
                }
                continue;
            }

            if (isUnambiguousPersonalToken(tok)) {
                matches.push(tok);
                violationType = 'NAME';
            }
        }

        // 3. Patrón estructural de firma personal explícita ("hecho por X", "fdo: X", "soy X", "me llamo X")
        const signatureRx = /\b(?:hecho por|autor|autora|firmado por|fdo|soy|me llamo|alumno|alumna)\s+([a-z]{3,})/i;
        const sigMatch = cleanText.match(signatureRx);
        if (sigMatch && sigMatch[1] && !whitelist.has(sigMatch[1])) {
            matches.push(sigMatch[1]);
            violationType = 'NAME';
        }

        if (matches.length > 0) {
            return {
                valid: false,
                type: violationType || 'NAME',
                reason: "ALERTA LOPD // Texto no autorizado detectado: Modifique los nombres personales o términos señalados para continuar.",
                matches: Array.from(new Set(matches))
            };
        }

        return { valid: true, reason: '', matches: [] };
    },

    validateZeroPII(text) {
        if (!text || !String(text).trim()) {
            return { pass: true, clean: true, valid: true, matches: [], reason: '' };
        }
        const str = String(text);
        const piiMatches = [];

        // 1. Detección de Correos Electrónicos
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
        const emailMatches = str.match(emailRegex);
        if (emailMatches) {
            piiMatches.push(...emailMatches);
        }

        // 2. Detección de Teléfonos (fijos, móviles, secuencias de 9 dígitos con o sin prefijo)
        const phoneRegex = /(?:(?:\+|00)34[\s.-]?)?(?:\b[6789]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}\b|\b[6789]\d{8}\b)/g;
        const phoneMatches = str.match(phoneRegex);
        if (phoneMatches) {
            piiMatches.push(...phoneMatches);
        }

        // 3. Detección de Documentos de Identidad (DNI/NIE español)
        const dniRegex = /\b(?:\d{8}[- ]?[A-HJ-NP-TV-Z]|[XYZ][- ]?\d{7}[- ]?[A-HJ-NP-TV-Z])\b/gi;
        const dniMatches = str.match(dniRegex);
        if (dniMatches) {
            piiMatches.push(...dniMatches);
        }

        // 4. Detección de Nombres y Apellidos personales mediante motor LOPD
        const safeCheck = this.validateSafeText(str);
        if (!safeCheck.valid) {
            if (safeCheck.matches && safeCheck.matches.length > 0) {
                piiMatches.push(...safeCheck.matches);
            } else {
                piiMatches.push('DATOS_IDENTIFICATIVOS');
            }
        }

        const uniqueMatches = Array.from(new Set(piiMatches));
        const isClean = uniqueMatches.length === 0;

        return {
            pass: isClean,
            clean: isClean,
            valid: isClean,
            matches: uniqueMatches,
            reason: isClean ? '' : 'Se han detectado datos identificativos personales'
        };
    },

    highlightInvalidField(rawText, targetEl = null) {
        let field = null;
        if (targetEl && typeof targetEl === 'string') {
            field = document.getElementById(targetEl);
        } else if (targetEl && targetEl.nodeType === 1) {
            field = targetEl;
        }
        if (!field && document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            field = document.activeElement;
        }
        if (!field && rawText) {
            const cleanNeedle = this.cleanInput(rawText);
            const candidates = Array.from(document.querySelectorAll('input[type="text"], input[type="url"], input:not([type]), textarea'));
            field = candidates.find(el => el.offsetParent !== null && this.cleanInput(el.value) === cleanNeedle) ||
                    candidates.find(el => this.cleanInput(el.value) === cleanNeedle) ||
                    candidates.find(el => el. value && el.value.includes(cleanNeedle));
        }
        if (field) {
            field.classList.add('input-lopd-error', 'border-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
            field.setAttribute('aria-invalid', 'true');
            if (!field._lopdListenerAttached) {
                field._lopdListenerAttached = true;
                field.addEventListener('input', () => {
                    const recheck = this.validateSafeText(field.value);
                    if (recheck.valid) {
                        field.classList.remove('input-lopd-error', 'border-red-500', 'shadow-[0_0_10px_rgba(239,68,68,0.5)]');
                        field.removeAttribute('aria-invalid');
                    }
                });
            }
            try { field.focus(); } catch (e) {}
        }
    },

    checkLexicon(text, context = 'Actividad General') {
        const res = this.validateSafeText(text);
        if (!res.valid) {
            const matchedWord = res.matches[0] || 'termino';
            const sev = res.type === 'PROFANITY' ? 'PROFANITY' : 'NAME';
            this.recordSecurityIncident(sev, text, context, matchedWord);
            return { pass: false, type: sev, word: matchedWord, reason: res.reason, matches: res.matches };
        }
        return { pass: true };
    },

    recordSecurityIncident(severity, rawText, context, matchedWord) {
        const teamId = (state.user && !state.user.admin) ? state.user.coId : (state.currentUser?.coId || 'AEE');
        const studentAlias = (state.user && !state.user.admin) ? state.user.role : (state.currentUser?.role || 'ESTUDIANTE');
        const offendingText = this.cleanInput(rawText);
        const timestamp = new Date().toISOString();

        // Enviar payload silencioso: POST /api/moderation/report
        try {
            if (typeof fetch !== 'undefined') {
                fetch('/api/moderation/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        team_id: teamId,
                        student_alias: studentAlias,
                        offending_text: offendingText,
                        matched_term: matchedWord,
                        timestamp: timestamp
                    })
                }).catch(() => {});
            }
        } catch(e) {}

        if (!state.user || state.user.admin) return;
        state.data.securityIncidents = state.data.securityIncidents || [];
        state.data.securityIncidents.unshift({
            id: 'SEC-' + Date.now(),
            coId: teamId,
            team_id: teamId,
            role: studentAlias,
            student_alias: studentAlias,
            severity: severity,
            word: matchedWord,
            matched_term: matchedWord,
            context: context,
            text: offendingText,
            offending_text: offendingText,
            date: new Date().toLocaleString(),
            timestamp: timestamp,
            resolved: false
        });
        telemetry.log("SECURITY", `[${severity}] Interceptado en ${context}: "${matchedWord}"`);
        state.save();
    },

    hasForbiddenWords(text, context = 'Actividad General', targetEl = null) {
        const check = this.checkLexicon(text, context);
        if (!check.pass) {
            this.highlightInvalidField(text, targetEl);
            this.notify(`ALERTA LOPD // Texto no autorizado detectado: Modifique los nombres personales o términos señalados para continuar. (${check.word})`, 'error');
            return true;
        }
        return false;
    },

    getDeadlineStatus(dateString) {
        if(!dateString) return { text: "NO DEFINIDO", class: "bg-slate-800 text-slate-300" };
        const now = new Date();
        const dl = new Date(dateString);
        const diffHours = (dl - now) / (1000 * 60 * 60);
        if (diffHours < 0) return { text: "VENCIDO: RIESGO AEE", class: "bg-red-900 text-white animate-pulse shadow-[0_0_10px_red]" };
        if (diffHours < 24) return { text: "CRÍTICO: < 24H", class: "bg-red-600 text-white animate-pulse" };
        if (diffHours < 72) return { text: "ATENCIÓN: PRÓXIMO CIERRE", class: "bg-mars-yellow text-black" };
        return { text: `EN PLAZO (${Math.floor(diffHours/24)}d)`, class: "bg-mars-cyan text-black" };
    },

    setupNavigationHistory() {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#05070f');

        // Al cargar, si history.state?.layer existe, haz replaceState limpio
        if (typeof window !== 'undefined' && window.history && window.history.state && window.history.state.layer !== undefined) {
            try {
                window.history.replaceState({ layer: 0 }, document.title);
            } catch (e) {}
        }

        this._layerStack = [];
        this._layerCounter = 0;
        this._isPoppingState = false;

        if (!this._navHistoryAttached && typeof window !== 'undefined') {
            this._navHistoryAttached = true;
            window.addEventListener('popstate', (e) => {
                // El listener popstate cierra la capa superior SIN volver a llamar a back
                if (this._layerStack && this._layerStack.length > 0) {
                    this._isPoppingState = true;
                    const topLayer = this._layerStack.pop();
                    if (topLayer && typeof topLayer.closeFn === 'function') {
                        try {
                            topLayer.closeFn(true); // true = skipHistoryBack
                        } catch (err) {
                            console.error("Error en cierre de capa popstate:", err);
                        }
                    }
                    this._isPoppingState = false;
                }
            });
        }

        this.setupKeyboardListeners();
    },

    setupPwaBlackIcon() {
        return this.setupNavigationHistory();
    },

    pushLayer(type, closeFn) {
        this._layerCounter = (this._layerCounter || 0) + 1;
        const n = this._layerCounter;
        this._layerStack = this._layerStack || [];
        this._layerStack.push({ layer: n, type, closeFn });
        if (!this._isPoppingState && typeof window !== 'undefined' && window.history) {
            try {
                window.history.pushState({ layer: n, type }, document.title);
            } catch (e) {}
        }
    },

    closeLayer(type, skipHistory = false) {
        this._layerStack = this._layerStack || [];
        if (this._layerStack.length === 0) return;
        const idx = type 
            ? this._layerStack.map(l => l.type).lastIndexOf(type) 
            : this._layerStack.length - 1;
        if (idx !== -1) {
            this._layerStack.splice(idx, 1);
            if (!skipHistory && !this._isPoppingState && typeof window !== 'undefined' && window.history) {
                try {
                    window.history.back();
                } catch (e) {}
            }
        }
    },

    setupKeyboardListeners() {
        if (!this._keyListenerAttached && typeof document !== 'undefined') {
            this._keyListenerAttached = true;
            document.addEventListener('keydown', (e) => {
                const modalOverlay = document.getElementById('modal-overlay');
                const onboardingOverlay = document.getElementById('onboarding-overlay');
                const drawerOverlay = document.getElementById('hud-drawer-overlay');
                const isModalOpen = modalOverlay && !modalOverlay.classList.contains('hidden');
                const isOnboardingOpen = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');
                const isDrawerOpen = drawerOverlay && !drawerOverlay.classList.contains('hidden');

                if (e.key === 'Escape') {
                    if (isDrawerOpen) { e.preventDefault(); this.closeDrawer(); return; }
                    if (isModalOpen) { e.preventDefault(); this.closeModal(); return; }
                    if (isOnboardingOpen) { e.preventDefault(); this.closeOnboarding(); return; }
                }

                if (e.key === 'Tab' && (isModalOpen || isOnboardingOpen || isDrawerOpen)) {
                    const activeOverlay = isDrawerOpen ? drawerOverlay : (isModalOpen ? modalOverlay : onboardingOverlay);
                    const focusable = Array.from(activeOverlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
                    if (focusable.length > 0) {
                        const first = focusable[0];
                        const last = focusable[focusable.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }

                // Physical keyboard support for PIN keypad on Login Step 2
                if (!state.user && typeof auth !== 'undefined' && auth.verifiedCoId && !isModalOpen && !isOnboardingOpen && !isDrawerOpen) {
                    const activeTag = document.activeElement ? document.activeElement.tagName : '';
                    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
                        if (/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                            auth.press(e.key);
                        } else if (e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            auth.clear();
                        } else if (e.key === 'Enter' && state.pin.length === 4) {
                            e.preventDefault();
                            auth.verify();
                        }
                    }
                }
            });
        }
    },

    pushNotification(coId, targetRole, message, type = 'info') {
        const co = state.data.companies[coId];
        if (!co) return;
        
        co.notifications = co.notifications || [];
        co.notifications.unshift({
            id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
            role: targetRole,
            message: message,
            type: type,
            date: new Date().toLocaleString(),
            read: false,
            updatedAt: Date.now()
        });
        
        if (co.notifications.length > 50) co.notifications.pop();
        co.updatedAt = Date.now();
        state.save(coId);
    },

    renderWorkflowTracker(steps, currentIndex) {
        if (!steps || !steps.length) return '';
        let html = `<div class="flex items-center justify-between w-full relative mb-6 mt-4 px-2 sm:px-4" role="list" aria-label="Progreso del flujo operativo">`;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0"></div>`;
        const activeWidth = currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-mars-green z-0 transition-all duration-500" style="width: ${activeWidth}%"></div>`;
        
        steps.forEach((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const colorClass = isCompleted ? 'bg-mars-green text-black border-mars-green shadow-[0_0_10px_#00ff66]' : 'bg-slate-900 text-slate-300 border-slate-700';
            const textClass = isCompleted ? 'text-mars-green font-bold' : 'text-slate-300';
            html += `
            <div role="listitem" class="relative z-10 flex flex-col items-center gap-2">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${colorClass}">
                    ${isCompleted ? '✓' : idx + 1}
                </div>
                <span class="text-xs uppercase tracking-wider text-center w-20 sm:w-24 leading-tight ${textClass}">${this.escapeHTML(step)}</span>
            </div>`;
        });
        html += `</div>`;
        return html;
    },

    showWelcomeModal() {
        return this.showOnboarding();
    },

    getOnboardingContent(role) {
        const isDocente = role === 'DOCENTE' || (state.user && state.user.admin);
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const coId = state.user?.coId;
        const co = coId ? state.data.companies?.[coId] : null;
        const docs = co?.deliverables || {};

        if (isDocente) {
            const isCoord = Boolean(state.user && state.user.role && state.user.role.startsWith('COORD_'));
            return `
            <div class="space-y-2 font-mono text-xs leading-relaxed text-slate-200">
                <!-- 1. Atención Rápida en Aula -->
                <details open class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                    <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                        <span>⚡ 1. Atención Rápida en Aula</span>
                        <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                    </summary>
                    <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                        <p><strong class="text-white">Aduana B2B:</strong> Supervisa y aprueba transferencias de material secundario entre startups para liberar fondos retenidos en el Libro Mayor.</p>
                        <p><strong class="text-white">Identidades de Marca:</strong> Revisa propuestas de eslogan y misión corporativa antes de su proyección pública en el HUD.</p>
                        <p><strong class="text-white">Alertas Léxicas y Régimen AEE:</strong> Monitoriza incidencias en tiempo real (nombres propios o lenguaje soez) con imposición de sanciones disciplinarias.</p>
                    </div>
                </details>

                <!-- 2. Evaluación Curricular -->
                <details class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                    <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                        <span>🎖️ 2. Evaluación Curricular Ponderada (100%)</span>
                        <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                    </summary>
                    <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                        <p><strong class="text-white">Calificación por Rúbricas:</strong> Accede a los módulos específicos por materia (FYQ 25%, LYE 40%, LEN 15%, ECO 10%, MAT 5%, ING 5%) con ponderación automatizada.</p>
                        <p><strong class="text-white">Evidencias en Google Drive:</strong> Inspecciona enlaces oficiales entregados y contrástalos con las plantillas docentes programadas.</p>
                        <p><strong class="text-white">Acta Oficial CSV:</strong> Generación y descarga directa del acta consolidada para secretaría y claustro.</p>
                    </div>
                </details>

                <!-- 3. Herramientas de Coordinación (Solo COORD_*) -->
                ${isCoord ? `
                <details class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                    <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                        <span>🔐 3. Herramientas de Coordinación y Seguridad</span>
                        <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                    </summary>
                    <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                        <p><strong class="text-white">Cronograma y Candados:</strong> Modifica plazos límite, programa fechas de apertura y vincula plantillas oficiales de Google Docs.</p>
                        <p><strong class="text-white">Llavero Maestro:</strong> Consulta y reasigna PINs docentes de 4 dígitos con sincronización criptográfica atómica.</p>
                        <p><strong class="text-white">Backups Cloudflare D1:</strong> Gestión de instantáneas del estado global y descargas de seguridad JSON.</p>
                    </div>
                </details>` : ''}
            </div>`;
        }

        // Estructura para Alumnos segmentada en 4 Acordeones Interactivos
        const roleDeliverables = defs.filter(d => d.role === role);
        const roleDeliverablesHtml = roleDeliverables.length > 0 ? roleDeliverables.map(d => {
            const docObj = docs[d.key];
            const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[d.key]) || {};
            const openDate = sched.openDate || d.defaultOpenDate;
            const isLocked = Boolean(openDate && !isNaN(new Date(openDate).getTime()) && (new Date() < new Date(openDate)));
            const lockLabel = isLocked ? '<span class="text-amber-400 font-bold">[🔒 BLOQUEADO]</span>' : '<span class="text-mars-green font-bold">[🟢 ACTIVO]</span>';
            const statusLabel = docObj ? '<span class="text-mars-green font-bold">✓ Entregado</span>' : '<span class="text-mars-magenta font-bold">⏳ Pendiente</span>';
            return `<li class="border-b border-slate-800/80 pb-1.5 flex justify-between items-center gap-2 flex-wrap"><span><strong class="text-white">${this.escapeHTML(d.shortName || d.name)}</strong> (${this.escapeHTML(d.subject)}): ${statusLabel}</span>${lockLabel}</li>`;
        }).join('') : '<li class="text-slate-400 italic">No tienes entregables curriculares asignados directamente a tu rol. Supervisa o asiste al equipo en el Dossier.</li>';

        let roleActionsHtml = '';
        let roleCollabHtml = '';
        switch(role) {
            case 'CEO':
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Supervisión y Gobernanza:</strong> Modera la asamblea general, ejerce tu voto de calidad en empates y tramita mociones colegiadas.</p>
                    <p><strong class="text-white">Aprobación Jerárquica:</strong> Audita los entregables antes de elevarlos a los docentes y valida o devuelve con motivo justificado.</p>
                    <p><strong class="text-white">Gabinete de Crisis:</strong> Difunde el Comunicado Oficial Inmutable ante expedientes sancionadores de la AEE.</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                        <button type="button" onclick="ui.navigate('orders'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bóveda de Órdenes</button>
                        <button type="button" onclick="ui.navigate('brand'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Marca & Campañas</button>
                    </div>
                </div>`;
                roleCollabHtml = `El CEO supervisa el semáforo temporal en el Dossier, coordina las compras iniciadas por I+D y aprobadas por Finanzas, y garantiza la entrega a tiempo de todas las áreas.`;
                break;
            case 'TECNICO':
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Aprovisionamiento I+D:</strong> Explora el catálogo SUPERMARS-KET y añade piezas al borrador técnico adjuntando la memoria técnica en Google Drive.</p>
                    <p><strong class="text-white">Mercado Secundario (B2B):</strong> Vende componentes sobrantes y compra ofertas de otras startups con control de precio estricto.</p>
                    <p><strong class="text-white">Banco de Pruebas:</strong> Registra las mediciones de apogeo y calcula la eficiencia aeroespacial del propulsor.</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('tech'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a I+D & Vuelos</button>
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                    </div>
                </div>`;
                roleCollabHtml = `I+D solicita componentes a Finanzas; una vez aprobados, Operaciones los recibe en el taller y verifica el coste real físico.`;
                break;
            case 'FINANZAS':
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Auditoría Presupuestaria:</strong> Aprueba o rechaza solicitudes de componentes de I+D y campañas de marketing según liquidez disponible.</p>
                    <p><strong class="text-white">Libro Mayor Inmutable:</strong> Monitoriza ingresos por patrocinio, cargos de adquisiciones y retenciones B2B en Aduana.</p>
                    <p><strong class="text-white">Entregables de Economía:</strong> Elabora en Google Sheets y entrega los balances y cuentas de resultados oficiales.</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('finance'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Finanzas & Balances</button>
                        <button type="button" onclick="ui.navigate('orders'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bóveda de Órdenes</button>
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                    </div>
                </div>`;
                roleCollabHtml = `Finanzas garantiza la solvencia de la startup impidiendo sobrecostes y audita las partidas de inversión propuestas por I+D y Marketing.`;
                break;
            case 'MARKETING':
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Identidad Corporativa:</strong> Propón el eslogan y la misión en el HUD; el envío queda en staging hasta su aprobación en Coordinación.</p>
                    <p><strong class="text-white">Campañas Publicitarias:</strong> Contrata paquetes predefinidos con enlace de justificación en Google Drive (cero texto libre).</p>
                    <p><strong class="text-white">Dossier y Pitch:</strong> Sube las evidencias en Drive de LyE (40%), Lengua (15%) e Inglés (5%).</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('brand'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Marca & Campañas</button>
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                    </div>
                </div>`;
                roleCollabHtml = `Marketing diseña la identidad y solicita fondos a Finanzas para campañas; coordina con CEO la defensa del modelo de negocio.`;
                break;
            case 'OPERACIONES_IA':
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Logística en Taller:</strong> Valida pedidos aprobados registrando el coste real (€) y las piezas físicas recibidas.</p>
                    <p><strong class="text-white">Bitácora Ética IA:</strong> Registra y audita todos los prompts generativos con validación humana explícita.</p>
                    <p><strong class="text-white">Hoja de Taller (BOM):</strong> Configura el escandallo de materiales oficial para Física y Química.</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('cart'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Logística Física</button>
                        <button type="button" onclick="ui.navigate('ailog'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bitácora IA</button>
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                    </div>
                </div>`;
                roleCollabHtml = `Operaciones une el plano virtual con el taller físico y custodia la integridad documental y ética del uso de Inteligencia Artificial.`;
                break;
            default:
                roleActionsHtml = `
                <div class="space-y-2">
                    <p><strong class="text-white">Veeduría y Apoyo:</strong> Participa en las asambleas, apoya al departamento al que estás vinculado y audita el avance global.</p>
                    <div class="pt-2 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier y Cronograma</button>
                        <button type="button" onclick="ui.navigate('market'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3 py-1 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Catálogo & B2B</button>
                    </div>
                </div>`;
                roleCollabHtml = `El rol auxiliar colabora activamente en la gobernanza y aporta visión externa para resolver cuellos de botella.`;
                break;
        }

        return `
        <div class="space-y-2 font-mono text-xs leading-relaxed text-slate-200">
            <!-- 1. ¿Qué puedo hacer yo en mi puesto? -->
            <details open class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                    <span>🎯 1. ¿Qué puedo hacer yo en mi puesto?</span>
                    <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                </summary>
                <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                    ${roleActionsHtml}
                </div>
            </details>

            <!-- 2. ¿Cómo colaboro con mi equipo? -->
            <details class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                    <span>🤝 2. ¿Cómo colaboro con mi equipo?</span>
                    <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                </summary>
                <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                    <p class="leading-relaxed">${roleCollabHtml}</p>
                </div>
            </details>

            <!-- 3. ¿Qué entregas tenemos pendientes? -->
            <details class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                    <span>📁 3. ¿Qué entregas tenemos pendientes?</span>
                    <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                </summary>
                <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                    <p class="text-[11px] text-slate-400">Entregables oficiales vinculados a tu rol (consulta el estado y los candados de apertura):</p>
                    <ul class="space-y-1.5 pl-1">
                        ${roleDeliverablesHtml}
                    </ul>
                </div>
            </details>

            <!-- 4. Reglas de Oro AEE -->
            <details class="group bg-slate-900/80 border border-slate-800 rounded p-3 mb-2 transition-colors">
                <summary class="cursor-pointer font-bold text-xs uppercase flex justify-between items-center text-mars-cyan select-none min-h-[44px]">
                    <span>⚖️ 4. Reglas de Oro AEE</span>
                    <span class="text-slate-400 group-open:rotate-180 transition-transform font-mono text-sm">▼</span>
                </summary>
                <div class="pt-3 border-t border-slate-800/60 mt-2 space-y-2 text-slate-300">
                    <p><strong class="text-white">Privacidad RGPD:</strong> Prohibido estrictamente introducir nombres reales o datos personales; utiliza únicamente roles corporativos.</p>
                    <p><strong class="text-white">Canal Exclusivo Google Drive:</strong> Todos los documentos entregados deben ser URLs válidas de Google Drive con permisos públicos de lectura ("Cualquiera con el enlace puede ver").</p>
                    <p><strong class="text-white">Bitácora Ética IA:</strong> Todo prompt generado con IA debe declararse en la Bitácora con verificación humana crítica.</p>
                </div>
            </details>
        </div>`;
    },

    showOnboarding() {
        if (sessionStorage.getItem('hideWelcome')) return;
        this._lastFocusedElement = document.activeElement;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        const elTitle = document.getElementById('onboarding-title');
        if(elTitle) elTitle.innerText = `ORDEN DE OPERACIONES: ${role.replace('_',' ')} 🚀`;
        
        let content = this.getOnboardingContent(role);
        let dynamicStatusHtml = '';
        if (role === 'DOCENTE') {
            const totalCos = Object.keys(state.data.companies || {}).length;
            const pendingB2BCount = (state.data.b2bContracts || []).filter(c => c.status === 'PENDIENTE_ADUANA').length;
            const pendingBrandsCount = Object.values(state.data.companies || {}).filter(c => c.brandApproval && c.brandApproval.status === 'PENDIENTE').length;
            const pendingNamesCount = Object.values(state.data.companies || {}).filter(c => c.nameChangeRequest && c.nameChangeRequest.status === 'PENDIENTE').length;
            const totalCustoms = pendingB2BCount + pendingBrandsCount + pendingNamesCount;
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const dlMap = state.data.config?.deadlines || {};
            const now = new Date();
            const upcomingCount = defs.filter(d => new Date(dlMap[d.key] || d.defaultDate) >= now).length;
            const d1StatusText = state.isCloudOnline ? 'SINCRONIZADO EN VIVO (HTTP 200)' : 'MODO CONTENCIÓN / LOCAL';
            const d1StatusColor = state.isCloudOnline ? 'text-mars-green border-mars-green/60 bg-mars-green/10' : 'text-mars-yellow border-mars-yellow/60 bg-mars-yellow/10';

            dynamicStatusHtml = `
            <div class="bg-slate-950 border border-mars-cyan/60 p-3.5 space-y-2.5 mt-2">
                <div class="flex justify-between items-center border-b border-slate-800 pb-1.5 flex-wrap gap-2">
                    <span class="text-xs font-orbitron font-black text-mars-cyan uppercase tracking-wider">📡 Telemetría en Vivo del Aula (v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.1.16'})</span>
                    <span class="text-xs font-bold uppercase px-2 py-0.5 border ${d1StatusColor}">[D1: ${d1StatusText}]</span>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-xs">
                    <div class="bg-slate-900 border border-slate-800 p-2">
                        <span class="block text-mars-cyan font-orbitron font-black text-base">${totalCos}</span>
                        <span class="text-slate-300 uppercase">Startups Activas</span>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2">
                        <span class="block text-mars-magenta font-orbitron font-black text-base">${totalCustoms}</span>
                        <span class="text-slate-300 uppercase">Aduanas / Mercantil</span>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2">
                        <span class="block text-mars-yellow font-orbitron font-black text-base">${upcomingCount}/${defs.length}</span>
                        <span class="text-slate-300 uppercase">Plazos Vigentes</span>
                    </div>
                </div>
                <div class="pt-1">
                    <button type="button" onclick="ui.closeOnboarding(); ui.adminTab='startups'; ui.navigate('admin');" class="min-h-[44px] w-full bg-mars-cyan/20 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs py-2 px-3 tracking-wider transition-all">
                        [ 🔑 ACCESO DIRECTO AL LLAVERO MAESTRO (STARTUPS &amp; PINs) ]
                    </button>
                </div>
            </div>`;
        } else if (state.user && !state.user.admin) {
            const co = state.data.companies?.[state.user.coId];
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const effectiveRole = role === 'AUXILIAR' ? (co?.auxRoleDept || 'CEO') : role;
            const roleDefs = effectiveRole === 'CEO' ? defs : defs.filter(d => d.role === effectiveRole);
            const pendingDocs = roleDefs.filter(d => !co?.deliverables?.[d.key]);
            const nextPending = pendingDocs[0];
            const dlDate = nextPending ? (state.data.config?.deadlines?.[nextPending.key] || nextPending.defaultDate) : null;
            const dlBadge = dlDate ? this.getDeadlineStatus(dlDate) : null;

            dynamicStatusHtml = `
            <div class="bg-slate-950 border border-mars-cyan/60 p-3.5 space-y-2 mt-2 text-xs">
                <div class="flex justify-between items-center border-b border-slate-800 pb-1.5 flex-wrap gap-1">
                    <span class="font-orbitron font-black text-mars-cyan uppercase">🔐 Estado Operativo y Custodia de Credenciales</span>
                    <span class="text-mars-green font-bold uppercase">[TOKEN ACTIVO v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.1.16'}]</span>
                </div>
                <p class="text-slate-200 leading-relaxed">
                    <strong>Custodia de PIN:</strong> Tu sesión está protegida mediante huella criptográfica (<code class="text-mars-cyan">authToken</code>). Si Coordinación modifica el PIN de tu puesto o el código de empresa, esta terminal cerrará la sesión en caliente de forma inmediata.
                </p>
                <div class="bg-slate-900 border border-slate-800 p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span class="text-mars-yellow font-bold uppercase block">Entregables Pendientes (${this.escapeHTML(effectiveRole)}): ${pendingDocs.length} de ${roleDefs.length}</span>
                        <span class="text-slate-300">${nextPending ? `Próximo hito: ${this.escapeHTML(nextPending.shortName || nextPending.name)}` : '¡Todos los entregables de tu departamento están registrados!'}</span>
                    </div>
                    ${dlBadge ? `<span class="px-2 py-1 font-black uppercase text-xs shrink-0 ${dlBadge.class}">${this.escapeHTML(dlBadge.text)}</span>` : ''}
                </div>
            </div>`;
        }

        content += `
        ${dynamicStatusHtml}
        <div class="bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300 uppercase mt-2 space-y-1">
            <p>🛡️ <strong class="text-mars-yellow">Norma de Seguridad y LOPD Activa (v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.1.16'}):</strong> Todos los formularios cuentan con validación LOPD contextual no destructiva (<code class="text-mars-cyan">ui.validateSafeText</code>). Los nombres personales o términos indebidos se señalan con borde neón rojo sin borrar el texto.</p>
            <p>📱 <strong class="text-mars-cyan">Ergonomía Táctil y Bóveda Descongestionada:</strong> Entradas tipográficas a 16px (anti-zoom móvil), acordeones por hitos con detalle en Drawer táctil y pasarela docente oculta Web Crypto SHA-256.</p>
        </div>
        </div>`;

        const elBody = document.getElementById('onboarding-body');
        if(elBody) elBody.innerHTML = content;
        
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) {
            elOverlay.classList.remove('hidden');
            setTimeout(() => {
                const btn = elOverlay.querySelector('button');
                if (btn) btn.focus();
            }, 50);
        }
    },

    closeOnboarding() {
        const elSkip = document.getElementById('skip-onboarding');
        if(elSkip && elSkip.checked) {
            sessionStorage.setItem('hideWelcome', 'true');
        }
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) elOverlay.classList.add('hidden');
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
        }
    },

    modalChangelog() {
        const logs = typeof APP_CHANGELOG !== 'undefined' ? APP_CHANGELOG : [];
        let html = `<div class="space-y-6 font-mono text-xs">`;
        
        if (logs.length === 0) {
            html += `<p class="text-slate-300 italic">No hay registros de versión disponibles.</p>`;
        } else {
            logs.forEach(log => {
                const itemsHtml = (log.highlights || []).map(h => {
                    let badgeClass = 'bg-mars-cyan/20 text-mars-cyan border-mars-cyan';
                    if (h.type === 'NUEVO') badgeClass = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (h.type === 'MEJORA') badgeClass = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow';
                    if (h.type === 'FIX') badgeClass = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';
                    if (h.type === 'SISTEMA') badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500';
                    
                    return `
                    <li class="flex items-start gap-2.5 pb-2 border-b border-slate-800/80 last:border-0">
                        <span class="text-xs font-black uppercase px-1.5 py-0.5 border shrink-0 mt-0.5 ${badgeClass}">${this.escapeHTML(h.type)}</span>
                        <span class="text-slate-200 text-xs leading-relaxed">${this.escapeHTML(h.text)}</span>
                    </li>`;
                }).join('');

                html += `
                <div class="bg-slate-900/90 border border-mars-border p-4">
                    <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-3">
                        <div>
                            <span class="text-mars-green font-orbitron font-black text-sm">v${this.escapeHTML(log.version)}</span>
                            <h4 class="text-white font-bold uppercase text-xs mt-0.5">${this.escapeHTML(log.title)}</h4>
                        </div>
                        <span class="text-xs text-slate-300 bg-black px-2 py-1 border border-slate-800">${this.escapeHTML(log.date)}</span>
                    </div>
                    <ul class="space-y-2">
                        ${itemsHtml}
                    </ul>
                </div>`;
            });
        }
        html += `</div>`;
        this.showModal("Registro de Novedades y Versiones", html, "");
    },

    switchGuideRole(role) {
        const targetRole = role || 'CEO';
        const container = document.getElementById('guide-role-content');
        if (container) {
            container.innerHTML = this.getOnboardingContent(targetRole);
        }
        document.querySelectorAll('.guide-role-pill').forEach(btn => {
            const r = btn.getAttribute('data-role');
            if (r === targetRole) {
                btn.className = 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-mars-cyan text-black border border-mars-cyan transition-all shadow-[0_0_8px_rgba(0,240,255,0.4)]';
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.className = 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition-all';
                btn.setAttribute('aria-selected', 'false');
            }
        });
    },

    showGuide(defaultRole = null) {
        const currentVer = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.1.16';
        let initialRole = defaultRole;
        if (!initialRole) {
            if (state.user) {
                initialRole = state.user.admin ? 'DOCENTE' : state.user.role;
            } else {
                initialRole = 'CEO';
            }
        }

        const rolesList = [
            { key: 'CEO', label: '👑 CEO' },
            { key: 'TECNICO', label: '🧪 TÉCNICO' },
            { key: 'FINANZAS', label: '💰 FINANZAS' },
            { key: 'MARKETING', label: '📢 MARKETING' },
            { key: 'OPERACIONES_IA', label: '🤖 OPS & IA' },
            { key: 'AUXILIAR', label: '👁️ AUXILIAR' },
            { key: 'DOCENTE', label: '🎓 DOCENTE' }
        ];

        const pillsHtml = rolesList.map(r => {
            const isSelected = r.key === initialRole;
            const cls = isSelected
                ? 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-mars-cyan text-black border border-mars-cyan transition-all shadow-[0_0_8px_rgba(0,240,255,0.4)]'
                : 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition-all';
            return `<button type="button" role="tab" aria-selected="${isSelected}" data-role="${r.key}" onclick="ui.switchGuideRole('${r.key}')" class="${cls}">${r.label}</button>`;
        }).join('');

        const roleContentHtml = this.getOnboardingContent(initialRole);

        const html = `
        <div class="space-y-4 font-mono text-xs leading-relaxed text-slate-200">
            <!-- Encabezado de la Guía Táctica -->
            <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                <div class="flex justify-between items-center flex-wrap gap-2 mb-1">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Manual Táctico y Guía de Usuario MARS-KET 2.0</p>
                    <span class="text-[10px] bg-black text-mars-green border border-mars-green/50 px-2 py-0.5 font-bold uppercase font-mono">v${currentVer} OFICIAL</span>
                </div>
                <p class="text-slate-300 text-xs">Simulación de emprendimiento aeroespacial interdisciplinar (AEE / ESA). Consulta los protocolos globales de la misión y explora las funciones específicas de cualquier puesto operativo.</p>
            </div>

            <!-- Directivas Clave de la Misión (Acordeón Rápido) -->
            <div class="bg-black/60 border border-slate-800 p-3 space-y-2">
                <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">⚡ Protocolos Maestros de Convivencia y Operación:</p>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                    <div class="border border-slate-800 p-2 bg-slate-950">
                        <strong class="text-white block mb-0.5">🛒 Flujo de Compras B2C:</strong>
                        <span>I+D añade piezas al borrador → Finanzas aprueba presupuesto → Operaciones retira en taller registrando coste real.</span>
                    </div>
                    <div class="border border-slate-800 p-2 bg-slate-950">
                        <strong class="text-white block mb-0.5">📁 Repositorio de 19 Entregables (Google Drive Exclusivo):</strong>
                        <span>Canal corporativo verificado exclusivamente para URLs de Google Drive (Docs, Sheets, Slides, Carpetas) configuradas con permisos de lectura compartidos ("Cualquiera con el enlace puede ver"). Enlaces a plataformas no autorizadas (OneDrive, Canva u otros) quedan estrictamente bloqueados por directiva RGPD para mitigar fugas de datos.</span>
                    </div>
                    <div class="border border-slate-800 p-2 bg-slate-950">
                        <strong class="text-white block mb-0.5">🤖 Gobernanza y Ética IA:</strong>
                        <span>Todo uso de IA generativa debe quedar documentado en la Bitácora IA con verificación y validación humana explícita.</span>
                    </div>
                    <div class="border border-slate-800 p-2 bg-slate-950">
                        <strong class="text-white block mb-0.5">⚖️ Convivencia, Privacidad RGPD y Filtro Léxico AEE:</strong>
                        <span>Protección de privacidad (RGPD/LOPD): Prohibido introducir nombres reales, apellidos, correos o teléfonos. Alumnos: operar exclusivamente bajo alias de equipo. Docentes: gestión y trazabilidad de incidencias mediante identificadores seudonimizados.</span>
                    </div>
                </div>
            </div>

            <!-- Selector de Roles -->
            <div>
                <p class="text-mars-cyan font-bold uppercase text-xs mb-2">Selecciona un Rol Operativo para ver su Manual:</p>
                <div role="tablist" aria-label="Manuales de Rol" class="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2.5">
                    ${pillsHtml}
                </div>
            </div>

            <!-- Contenedor Dinámico del Rol -->
            <div id="guide-role-content" class="bg-slate-950/80 border border-mars-border p-3.5 min-h-[200px]">
                ${roleContentHtml}
            </div>

            <div class="pt-2 flex flex-wrap gap-2 justify-between">
                <button type="button" onclick="ui.closeModal(); sessionStorage.removeItem('hideWelcome'); ui.showWelcomeModal();" class="min-h-[44px] bg-mars-yellow/20 border border-mars-yellow text-mars-yellow font-black px-4 py-2 text-xs uppercase tracking-wider hover:bg-mars-yellow hover:text-black transition-all">
                    🚀 Abrir Asistente de Bienvenida (Tour)
                </button>
                <button type="button" onclick="ui.closeModal();" class="min-h-[44px] bg-slate-800 border border-slate-600 text-white font-bold px-5 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all">
                    Entendido / Cerrar
                </button>
            </div>
        </div>`;

        this.showModal("Manual Táctico y Guía de Usuario", html, "");
        setTimeout(() => {
            if (typeof ui.switchGuideRole === 'function') {
                ui.switchGuideRole(initialRole);
            }
        }, 20);
    },

    modalSuggestion() {
        const allSuggs = state.data.suggestionsToAlex || [];
        const myCoId = state.user ? (state.user.admin ? 'DOCENTE' : state.user.coId) : 'ANON';
        const filteredSuggs = allSuggs.filter(s => {
            if (state.user && state.user.admin) return s.coId === 'DOCENTE' || (s.author && s.author.includes('DOCENTE'));
            return s.coId === myCoId || (s.author && state.data.companies[myCoId] && s.author.includes(state.data.companies[myCoId].name));
        });

        const history = filteredSuggs.slice(0, 8).map(s => {
            const cat = s.category || 'MEJORA';
            const status = s.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            const stBadge = status === 'IMPLEMENTADO' ? 'text-mars-green' : (status === 'EN_REVISION' ? 'text-mars-yellow' : 'text-slate-300');

            return `
            <div class="border-b border-slate-800 pb-2 mb-2 last:border-0">
                <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-black uppercase px-1.5 py-0.5 border ${catBadge}">${this.escapeHTML(cat)}</span>
                        <span class="text-white font-bold uppercase text-xs">${this.escapeHTML(s.author)}</span>
                    </div>
                    <span class="text-xs font-bold uppercase ${stBadge}">[${this.escapeHTML(status)}] • ${this.escapeHTML(s.date)}</span>
                </div>
                <p class="text-slate-200 italic text-xs mt-1 pl-2 border-l-2 border-slate-700 break-words">"${this.escapeHTML(s.text)}"</p>
            </div>`;
        }).join('') || '<p class="text-slate-300 italic text-xs">No has enviado reportes desde esta entidad todavía.</p>';

        const html = `
            <p class="text-xs text-slate-300 mb-3 uppercase leading-relaxed">¿Has detectado un fallo técnico (bug), tienes una idea o una duda normativa? El reporte es privado y pasa por filtro léxico antes de llegar a Coordinación.</p>
            <div class="mb-3">
                <label for="sugg-category" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Categoría del Reporte</label>
                <select id="sugg-category" class="w-full bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-xs text-white uppercase font-bold outline-none focus:border-mars-yellow min-h-[44px]">
                    <option value="BUG">🐛 Bug / Error Técnico en la App</option>
                    <option value="MEJORA">💡 Sugerencia de Mejora / Idea</option>
                    <option value="REGLAS">⚖️ Consulta sobre Normativa / Rúbricas</option>
                </select>
            </div>
            <div class="mb-2 p-2 bg-mars-magenta/10 border border-mars-magenta/40 text-[11px] font-mono text-mars-magenta font-bold">
                ⚠️ ALERTA DE SEGURIDAD: Prohibido introducir nombres reales, apellidos, correos o teléfonos. Utiliza únicamente tu alias de equipo.
            </div>
            <label for="sugg-text" class="sr-only">Descripción del reporte</label>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-base sm:text-xs text-white h-24 focus:border-mars-yellow outline-none mb-4" placeholder="Describe el reporte... (El uso de lenguaje ofensivo o nombres propios bloqueará el envío)"></textarea>
            <div class="bg-black/60 border border-slate-800 p-3 max-h-44 overflow-y-auto">
                <h4 class="text-mars-cyan text-xs uppercase font-bold mb-2 border-b border-slate-800 pb-1">Mis Envíos Recientes (Privado)</h4>
                ${history}
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitSuggestion()" class="bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-white transition-all min-h-[44px]">Transmitir a Buzón Dev</button>`;
        this.showModal("Canal Directo con Desarrollo (Buzón Alex)", html, actions);
    },

    submitSuggestion() {
        const elText = document.getElementById('sugg-text');
        const elCat = document.getElementById('sugg-category');
        if(!elText) return;
        const text = this.cleanInput(elText.value);
        const category = elCat ? elCat.value : 'MEJORA';
        if(text.length < 5) return this.notify("Describe tu reporte con más detalle (mínimo 5 caracteres).", "warning");

        // WP3: Filtro activo anti-PII en Cliente (Nombres, emails, teléfonos, DNIs)
        const piiCheck = this.validateZeroPII(text);
        if (!piiCheck.clean) {
            this.highlightInvalidField(text, elText);
            this.notify("Envío bloqueado: Se han detectado datos identificativos personales", "error");
            return;
        }

        if(this.hasForbiddenWords(text, 'Buzón de Sugerencias', elText)) return;
        
        const isDocente = state.user && state.user.admin;
        const coId = state.user ? (isDocente ? 'DOCENTE' : state.user.coId) : 'ANON';
        const entityName = isDocente ? 'CLAUSTRO DOCENTE' : (state.data.companies[coId]?.name || 'STARTUP');
        const author = state.user ? `${state.user.role} (${entityName})` : 'ANÓNIMO';
        
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.suggestionsToAlex.unshift({ 
            id: 'SUG-' + Date.now(), coId: coId, category: category, status: 'RECIBIDO',
            author: author, text: text, date: new Date().toLocaleString() 
        });
        
        state.save();
        this.closeModal();
        this.notify("✅ Reporte registrado y enviado a Coordinación.", "success");
    },

    handleHudSuggClick() {
        if (state.user && state.user.admin && state.user.role && String(state.user.role).startsWith('COORD')) {
            this.modalCoordinatorInbox();
        } else {
            this.modalSuggestion();
        }
    },

    modalCoordinatorInbox(filterCategory = 'TODOS') {
        const allSuggs = state.data.suggestionsToAlex || [];
        const isResolvedStatus = (s) => s.status === 'IMPLEMENTADO' || s.status === 'RESUELTO' || s.resolved === true;
        const activeSuggs = allSuggs.filter(s => !isResolvedStatus(s));
        const resolvedSuggs = allSuggs.filter(s => isResolvedStatus(s));

        const bugCount = activeSuggs.filter(s => s.category === 'BUG').length;
        const improveCount = activeSuggs.filter(s => s.category === 'MEJORA').length;
        const rulesCount = activeSuggs.filter(s => s.category === 'REGLAS').length;

        let displayList = allSuggs;
        if (filterCategory === 'BUGS') displayList = allSuggs.filter(s => s.category === 'BUG');
        else if (filterCategory === 'MEJORAS') displayList = allSuggs.filter(s => s.category === 'MEJORA');
        else if (filterCategory === 'REGLAS') displayList = allSuggs.filter(s => s.category === 'REGLAS');
        else if (filterCategory === 'PENDIENTES') displayList = activeSuggs;
        else if (filterCategory === 'RESUELTOS') displayList = resolvedSuggs;

        const itemsHtml = displayList.map(sugg => {
            const cat = sugg.category || 'MEJORA';
            const status = sugg.status || 'RECIBIDO';
            const isRes = isResolvedStatus(sugg);
            const catBadge = cat === 'BUG'
                ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10'
                : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            const statusColor = status === 'IMPLEMENTADO' ? 'text-mars-green' : (status === 'EN_REVISION' ? 'text-mars-yellow' : 'text-slate-300');

            return `
            <div class="bg-slate-900 border ${isRes ? 'border-slate-800 opacity-70' : 'border-mars-border'} p-3.5 text-xs mb-2.5 transition-all">
                <div class="flex justify-between items-start mb-2 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${catBadge}">${this.escapeHTML(cat)}</span>
                        <span class="text-white font-bold uppercase">${this.escapeHTML(sugg.author || 'ANÓNIMO')}</span>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-[10px] uppercase font-bold px-2 py-0.5 bg-black border border-slate-700 ${statusColor}">[${this.escapeHTML(status)}]</span>
                        <select aria-label="Cambiar estado" onchange="ui.updateSuggestionStatus('${this.escapeHTML(sugg.id)}', this.value); ui.modalCoordinatorInbox('${filterCategory}');" class="min-h-[44px] bg-black border border-slate-700 text-white p-1 text-xs uppercase font-bold outline-none focus:border-mars-cyan">
                            <option value="RECIBIDO" ${status==='RECIBIDO'?'selected':''}>Recibido</option>
                            <option value="EN_REVISION" ${status==='EN_REVISION'?'selected':''}>En Revisión</option>
                            <option value="IMPLEMENTADO" ${status==='IMPLEMENTADO'?'selected':''}>Implementado</option>
                        </select>
                        <button type="button" onclick="ui.deleteSuggestion('${this.escapeHTML(sugg.id)}'); ui.modalCoordinatorInbox('${filterCategory}');" aria-label="Eliminar reporte" class="min-h-[44px] px-2.5 bg-black text-mars-magenta border border-mars-magenta/40 hover:bg-mars-magenta hover:text-white font-black text-xs transition-all">✕</button>
                    </div>
                </div>
                <p class="text-slate-200 italic mb-2 bg-black/60 p-2.5 border border-slate-800 break-words font-mono">"${this.escapeHTML(sugg.text)}"</p>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                    <span>ID: ${this.escapeHTML(sugg.id)}</span>
                    <span>${this.escapeHTML(sugg.date)}</span>
                </div>
            </div>`;
        }).join('') || '<p class="text-slate-400 italic text-xs py-4 text-center">No hay reportes que coincidan con este filtro.</p>';

        const filterPills = [
            { id: 'TODOS', label: `Todos (${allSuggs.length})` },
            { id: 'PENDIENTES', label: `Pendientes (${activeSuggs.length})` },
            { id: 'BUGS', label: `🐛 Bugs (${bugCount})` },
            { id: 'MEJORAS', label: `💡 Ideas (${improveCount})` },
            { id: 'REGLAS', label: `⚖️ Dudas (${rulesCount})` },
            { id: 'RESUELTOS', label: `Resueltos (${resolvedSuggs.length})` }
        ].map(f => {
            const isSel = filterCategory === f.id;
            const cls = isSel
                ? 'min-h-[44px] px-3 py-1.5 text-xs font-black uppercase bg-mars-yellow text-black border border-mars-yellow transition-all shadow-[0_0_8px_rgba(255,200,0,0.4)]'
                : 'min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase bg-slate-900 text-slate-300 border border-slate-700 hover:text-white transition-all';
            return `<button type="button" onclick="ui.modalCoordinatorInbox('${f.id}')" class="${cls}">${f.label}</button>`;
        }).join('');

        const html = `
        <div class="space-y-4 font-mono text-xs text-slate-200">
            <!-- Resumen superior de telemetría de buzón -->
            <div class="bg-mars-yellow/10 border border-mars-yellow p-3 flex justify-between items-center flex-wrap gap-2">
                <div>
                    <h3 class="text-mars-yellow font-black uppercase text-xs sm:text-sm">📬 Buzón de Coordinación y Feedback de Alumnos</h3>
                    <p class="text-slate-300 text-xs mt-0.5">Mensajes directos de los 6 grupos de trabajo (dudas normativas, sugerencias de mejora y reporte de bugs).</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs uppercase font-bold px-2 py-1 bg-black border border-mars-yellow text-mars-yellow">${activeSuggs.length} Activos</span>
                </div>
            </div>

            <!-- Filtros rápidos -->
            <div class="flex flex-wrap gap-1.5 border-b border-slate-800 pb-2">
                ${filterPills}
            </div>

            <!-- Listado con scroll acotado -->
            <div class="max-h-[380px] overflow-y-auto pr-1">
                ${itemsHtml}
            </div>

            <!-- Acciones -->
            <div class="pt-2 flex flex-wrap gap-2 justify-between border-t border-slate-800">
                <button type="button" onclick="ui.modalSuggestion()" class="min-h-[44px] bg-slate-800 border border-slate-600 text-white font-bold px-4 py-2 text-xs uppercase hover:bg-white hover:text-black transition-all">
                    + Redactar Nuevo Mensaje
                </button>
                <button type="button" onclick="ui.closeModal(); ui.adminTab='settings'; ui.render();" class="min-h-[44px] bg-mars-cyan text-black font-black px-4 py-2 text-xs uppercase hover:bg-white transition-all">
                    ⚙️ Ir a Panel de Ajustes y Plazos
                </button>
            </div>
        </div>`;

        this.showModal("Buzón de Coordinación", html, "");
    },

    generateHeroBanner() {
        if (!state.user || state.user.admin) return '';
        const co = state.data.companies[state.user.coId];
        if (!co) { auth.logout(); return ''; }

        const isBrandPending = co.brandApproval && co.brandApproval.status === 'PENDIENTE';
        const hasApprovedLogo = co.logo && (!co.brandApproval || co.brandApproval.status === 'APROBADO');
        const activeLogoSrc = hasApprovedLogo ? this.escapeHTML(co.logo) : 'logo.png';
        const roleLabel = this.escapeHTML(state.user.role.replace('_', ' '));
        const coName = this.escapeHTML(co.name);
        const balanceStr = Number(co.balance || 0).toFixed(2);

        return `
        <div class="h-16 max-h-16 flex items-center justify-between px-4 bg-[#07090E]/90 border-b border-cyan-500/20 backdrop-blur sticky top-0 z-30 w-full mb-4 terminal-border overflow-hidden">
            <!-- Izquierda: Miniatura del logotipo (40x40px) + Nombre Orbitron + Badge Rol Activo -->
            <div class="flex items-center gap-3 min-w-0">
                <div class="relative w-10 h-10 flex-shrink-0 p-0.5 hex-clip bg-mars-bg ${isBrandPending ? 'border border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.4)]' : 'border border-mars-cyan shadow-neon-cyan'}">
                    <div class="w-full h-full hex-clip overflow-hidden">
                        <img src="${activeLogoSrc}" alt="Logo de ${coName}" width="40" height="40" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full ${hasApprovedLogo ? 'object-cover' : 'object-contain p-1 bg-black'}">
                    </div>
                </div>
                <div class="flex items-center gap-2 truncate">
                    <span class="font-orbitron font-black text-sm sm:text-base text-mars-cyan tracking-wider uppercase truncate" title="${coName}">${coName}</span>
                    <span class="bg-mars-cyan/10 border border-mars-cyan/40 text-mars-cyan text-[10px] sm:text-xs font-bold px-2 py-0.5 uppercase tracking-wider whitespace-nowrap">${roleLabel}</span>
                </div>
            </div>

            <!-- Centro: Saldo corporativo disponible en verde neón font-mono -->
            <div class="flex items-center justify-center px-2">
                <span class="text-mars-green font-mono font-bold text-sm sm:text-base tracking-wider whitespace-nowrap bg-mars-green/10 border border-mars-green/30 px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(0,255,150,0.2)]">
                    ${balanceStr} €v
                </span>
            </div>

            <!-- Derecha: Acceso directo a la bitácora de IA [ 🤖 IA ] que invoca ui.navigate('ailog') -->
            <div class="flex items-center gap-2 flex-shrink-0">
                <button type="button" onclick="ui.navigate('ailog')" class="bg-blue-600/20 border border-blue-500 text-blue-300 hover:bg-blue-500 hover:text-white px-2.5 sm:px-3 py-1.5 text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] min-h-[36px] flex items-center gap-1" title="Bitácora y Registro de Prompts IA">
                    <span>🤖</span> <span class="hidden sm:inline">IA</span>
                </button>
            </div>
        </div>`;
    },

    updateBadges() {
        if (!state.user) return;

        if (state.user.admin) {
            const isCoord = state.user.role && String(state.user.role).startsWith('COORD');
            const allSuggs = state.data.suggestionsToAlex || [];
            const isResolvedStatus = (s) => s.status === 'IMPLEMENTADO' || s.status === 'RESUELTO' || s.resolved === true;
            const activeSuggs = allSuggs.filter(s => !isResolvedStatus(s));
            const pendingCount = activeSuggs.length;

            const btnSugg = document.getElementById('hud-btn-suggs');
            if (btnSugg) {
                if (isCoord && pendingCount > 0) {
                    btnSugg.innerHTML = `[ 📬 BUZÓN <span class="bg-mars-yellow text-black px-1.5 py-0.5 rounded text-[10px] font-black animate-pulse ml-1">${pendingCount}</span> ]`;
                    btnSugg.className = 'min-h-[44px] bg-mars-yellow/20 border-2 border-mars-yellow text-mars-yellow py-2 px-2 text-xs font-black uppercase tracking-wider hover:bg-mars-yellow hover:text-black transition-all flex items-center justify-center text-center shadow-[0_0_12px_rgba(255,200,0,0.4)]';
                    btnSugg.title = `${pendingCount} reporte(s) de mejora o bugs pendientes en Buzón`;
                } else if (isCoord) {
                    btnSugg.innerHTML = `[ 📬 BUZÓN DEV ]`;
                    btnSugg.className = 'min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow py-2 px-2 text-xs font-bold uppercase tracking-wider hover:bg-mars-yellow hover:text-black transition-all flex items-center justify-center text-center';
                    btnSugg.title = 'Buzón de Desarrollo y Consultas de Alumnos';
                } else {
                    btnSugg.innerHTML = `[ 💡 SUGERENCIA ]`;
                    btnSugg.className = 'min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow py-2 px-2 text-xs font-bold uppercase tracking-wider hover:bg-mars-yellow hover:text-black transition-all flex items-center justify-center text-center';
                }
            }

            const tabSettingsBadge = document.getElementById('tab-badge-settings');
            if (tabSettingsBadge) {
                if (pendingCount > 0) {
                    tabSettingsBadge.innerText = pendingCount;
                    tabSettingsBadge.classList.remove('hidden');
                } else {
                    tabSettingsBadge.classList.add('hidden');
                }
            }

            if (isCoord && typeof this._lastKnownSuggCount === 'number' && pendingCount > this._lastKnownSuggCount) {
                const newest = activeSuggs[0];
                const cat = newest ? (newest.category || 'REPORTE') : 'REPORTE';
                const author = newest ? (newest.author || 'ALUMNO') : 'ALUMNO';
                this.notify(`📬 ALERTA COORDINACIÓN: Nuevo mensaje recibido en Buzón ([${cat}] de ${author})`, "warning");
            }
            this._lastKnownSuggCount = pendingCount;
            return;
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const elRes = document.getElementById('badge-resolutions');
        if (elRes) {
            const pendingMotions = (co.votingMotions || []).filter(m => m.status === 'ABIERTA' && (!m.votes || !m.votes[state.user.role])).length;
            if (pendingMotions > 0) { elRes.innerText = pendingMotions; elRes.classList.remove('hidden'); }
            else { elRes.classList.add('hidden'); }
        }

        const elOrders = document.getElementById('badge-orders');
        if (elOrders) {
            let pendingOrders = 0;
            if (state.user.role === 'FINANZAS') {
                const iDOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
                const mktOrders = (co.marketingCampaigns || []).filter(m => m.status === 'PENDIENTE_FINANZAS').length;
                pendingOrders = iDOrders + mktOrders;
            }
            if (pendingOrders > 0) { elOrders.innerText = pendingOrders; elOrders.classList.remove('hidden'); }
            else { elOrders.classList.add('hidden'); }
        }

        const elCart = document.getElementById('badge-cart');
        if (elCart) {
            const pendingLogistics = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS' && o.type !== 'MARKETING').length;
            if (pendingLogistics > 0) { elCart.innerText = pendingLogistics; elCart.classList.remove('hidden'); }
            else { elCart.classList.add('hidden'); }
        }

        const elAILog = document.getElementById('badge-ailog');
        if (elAILog) {
            const pendingAI = (co.aiPrompts || []).filter(p => p.status === 'PENDIENTE_VALIDACION').length;
            if (pendingAI > 0) { elAILog.innerText = pendingAI; elAILog.classList.remove('hidden'); }
            else { elAILog.classList.add('hidden'); }
        }
    },

    updateHUD() {
        if(!state.user) return;
        const verEl = document.getElementById('hud-version');
        if (verEl && typeof APP_VERSION !== 'undefined') verEl.innerText = `v${APP_VERSION}`;

        const balEl = document.getElementById('hud-balance');
        const infoEl = document.getElementById('hud-info');
        const cloudEl = document.getElementById('hud-cloud-status');
        const miniLogo = document.getElementById('hud-mini-logo');
        
        if (state.user.admin) {
            if(balEl) balEl.innerText = '∞ €v';
            if(infoEl) {
                const teacherInfo = `ENTITY: CLAUSTRO | ROLE: ${state.data.config.teachers[state.user.role]?.name.toUpperCase() || 'ROOT'}`;
                infoEl.innerText = teacherInfo;
                infoEl.title = teacherInfo;
            }
            if(miniLogo) {
                miniLogo.classList.add('hidden');
                miniLogo.innerHTML = '';
            }
        } else {
            const co = state.data.companies[state.user.coId];
            if(co && balEl) balEl.innerText = `${co.balance.toFixed(2)} €v`;
            if(co && infoEl) {
                const entityInfo = `ENTITY: ${co.name.toUpperCase()} | ROLE: ${state.user.role.replace('_',' ')}`;
                infoEl.innerText = entityInfo;
                infoEl.title = entityInfo;
            }
            
            if(miniLogo && co) {
                miniLogo.classList.remove('hidden');
                const hasApprovedLogo = co.logo && (!co.brandApproval || co.brandApproval.status === 'APROBADO');
                const hudLogoSrc = hasApprovedLogo ? this.escapeHTML(co.logo) : 'logo.png';
                miniLogo.innerHTML = `<img src="${hudLogoSrc}" alt="Logo startup ${this.escapeHTML(co.name)}" width="36" height="36" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full ${hasApprovedLogo ? 'object-cover' : 'object-contain p-0.5'}">`;
            }
        }

        if(cloudEl) {
            if(state.isSyncing) {
                cloudEl.className = 'text-xs font-bold uppercase tracking-normal sm:tracking-wider px-2 sm:px-2.5 py-1 border border-mars-cyan text-mars-cyan bg-mars-cyan/10 animate-pulse whitespace-nowrap';
                cloudEl.innerText = '[CLOUD: SYNCING]';
            } else if(state.isCloudOnline) {
                cloudEl.className = 'text-xs font-bold uppercase tracking-normal sm:tracking-wider px-2 sm:px-2.5 py-1 border border-mars-green/60 text-mars-green bg-mars-green/10 whitespace-nowrap';
                cloudEl.innerText = '[D1: SYNCED]';
            } else {
                cloudEl.className = 'text-xs font-bold uppercase tracking-normal sm:tracking-wider px-2 sm:px-2.5 py-1 border border-mars-yellow/60 text-mars-yellow bg-slate-900 whitespace-nowrap';
                cloudEl.innerText = '[D1: OFFLINE]';
            }
        }

        const loginNotice = document.getElementById('login-offline-notice');
        if (loginNotice) {
            if (!state.isCloudOnline) {
                loginNotice.className = 'mt-3 pt-2 border-t border-mars-yellow/30 text-center';
                loginNotice.innerHTML = '<p class="text-xs text-mars-yellow font-mono tracking-wider">⚠️ MODO LOCAL // SIN CONEXIÓN CON NUBE D1</p>';
            } else {
                loginNotice.className = 'hidden';
                loginNotice.innerHTML = '';
            }
        }

        if (state.user) {
            this.setHUDVisibility(true);
            const hdrLogo = document.getElementById('hud-marsket-logo') || document.getElementById('marsket-logo');
            if (hdrLogo) hdrLogo.id = 'marsket-logo';
            if (typeof auth !== 'undefined' && typeof auth.buildNav === 'function') {
                auth.buildNav(!!state.user.admin);
            }
        }

        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.remove('tab-active', 'text-mars-cyan');
            t.setAttribute('aria-selected', 'false');
            const tabId = t.getAttribute('data-tab-id') || '';
            const oc = t.getAttribute('onclick') || '';
            if (tabId === this.current || oc.includes(`('${this.current}')`)) {
                t.classList.add('tab-active', 'text-mars-cyan');
                t.setAttribute('aria-selected', 'true');
            }
        });

        const activeTabEl = document.querySelector(`.nav-tab[data-tab-id="${this.current}"]`);
        if (activeTabEl && typeof window !== 'undefined' && window.innerWidth <= 640) {
            activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }

        this.updateBadges();
    },

    setHUDVisibility(isLoggedIn) {
        const hdr = document.getElementById('hud-header');
        const nav = document.getElementById('hud-nav');
        const ftr = document.getElementById('hud-footer');
        const appContainer = document.getElementById('app-container') || document.querySelector('.max-w-7xl');
        const actionBar = document.getElementById('hud-action-bar');
        const navContainer = document.getElementById('nav-container');
        if (isLoggedIn) {
            if (appContainer) appContainer.classList.remove('hidden');
            if (hdr) hdr.classList.remove('hidden');
            if (nav) nav.classList.remove('hidden');
            if (ftr) ftr.classList.remove('hidden');
            if (actionBar) actionBar.style.visibility = 'visible';
            if (navContainer) navContainer.style.visibility = 'visible';
        } else {
            if (appContainer) appContainer.classList.add('hidden');
            if (hdr) hdr.classList.add('hidden');
            if (nav) nav.classList.add('hidden');
            if (ftr) ftr.classList.add('hidden');
            if (actionBar) actionBar.style.visibility = 'hidden';
            if (navContainer) navContainer.style.visibility = 'hidden';
            const infoEl = document.getElementById('hud-info');
            const balEl = document.getElementById('hud-balance');
            const miniLogo = document.getElementById('hud-mini-logo');
            if (infoEl) {
                infoEl.innerText = 'ENTITY: -- | ROLE: --';
                infoEl.title = 'ENTITY: -- | ROLE: --';
            }
            if (balEl) balEl.innerText = '-- €v';
            if (miniLogo) {
                miniLogo.classList.add('hidden');
                miniLogo.innerHTML = '';
            }
        }
    },
    
    render() {
        this.beforeRenderCleanup();
        this.initEventDelegation();
        const vp = document.getElementById('viewport');
        if(!vp) return;
        const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
        const activeId = typeof document !== 'undefined' && document.activeElement && document.activeElement.id ? document.activeElement.id : null;

        vp.innerHTML = '';
        if(!state.user) {
            this.setHUDVisibility(false);
            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                loginScreen.style.display = 'flex';
                loginScreen.style.opacity = '1';
                this.viewLogin(loginScreen);
            } else {
                this.viewLogin(vp);
            }
            return;
        }
        
        if (!state.user.admin && !state.data.companies[state.user.coId]) {
            auth.logout();
            return;
        }

        const loginScreen = document.getElementById('login-screen');
        if (loginScreen && loginScreen.style.opacity !== '0' && loginScreen.style.display !== 'none') {
            loginScreen.style.display = 'none';
            loginScreen.classList.add('hidden');
        }
        this.setHUDVisibility(true);

        const role = state.user.role;
        const co = !state.user.admin ? state.data.companies[state.user.coId] : null;

        const roleAllowedMap = {
            'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
            'TECNICO': ['tech', 'market', 'cart', 'orders', 'dossier', 'resolutions'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market', 'resolutions'],
            'MARKETING': ['brand', 'dossier', 'market', 'resolutions'],
            'OPERACIONES_IA': ['cart', 'ailog', 'dossier', 'market', 'resolutions']
        };

        let currentAllowed = [];
        if (state.user.admin) {
            currentAllowed = ['admin', 'market', 'dossier'];
            if (!currentAllowed.includes(this.current)) this.current = 'admin';
        } else {
            const validViews = ['orders', 'finance', 'tech', 'market', 'brand', 'cart', 'ailog', 'dossier', 'resolutions', 'company', 'work'];
            if (!validViews.includes(this.current)) {
                const landingByRole = {
                    'TECNICO': 'market',
                    'FINANZAS': 'orders',
                    'OPERACIONES_IA': 'cart',
                    'OPERACIONES': 'cart',
                    'CEO': 'orders',
                    'MARKETING': 'brand'
                };
                const auxDept = (role === 'AUXILIAR') ? co?.auxRoleDept : null;
                this.current = (role === 'AUXILIAR' ? landingByRole[auxDept] : landingByRole[role]) || 'orders';
            }
        }
        
        this.updateHUD();
        const hero = this.generateHeroBanner();
        const notifs = state.user.admin ? '' : (this.renderNotifications ? this.renderNotifications() : '');
        
        switch(this.current) {
            case 'market': vp.innerHTML = hero + notifs; this.viewMarket(vp); break;
            case 'cart': vp.innerHTML = hero + notifs; this.viewCart(vp); break;
            case 'orders': vp.innerHTML = hero + notifs; this.viewOrders(vp); break;
            case 'finance': vp.innerHTML = hero + notifs; this.viewFinance(vp); break;
            case 'admin': this.viewAdmin(vp); break;
            case 'dossier': {
                vp.innerHTML = hero + notifs;
                this.viewDossier(vp);
                if (this.renderCronogramaSection) {
                    const cronoDiv = document.createElement('div');
                    cronoDiv.className = 'mt-6';
                    cronoDiv.innerHTML = this.renderCronogramaSection();
                    vp.appendChild(cronoDiv);
                }
                break;
            }
            case 'brand': vp.innerHTML = hero + notifs; this.viewBrand(vp); break;
            case 'ailog': vp.innerHTML = hero + notifs; this.viewAILog(vp); break;
            case 'tech': vp.innerHTML = hero + notifs; this.viewTech(vp); break;
            case 'resolutions': vp.innerHTML = hero + notifs; this.viewResolutions(vp); break;
            case 'company': vp.innerHTML = hero + notifs; this.viewCompany(vp); break;
            default: {
                vp.innerHTML = hero + notifs;
                this.viewOrders(vp);
                break;
            }
        }

        if (activeId) {
            const restoredEl = document.getElementById(activeId);
            if (restoredEl && typeof restoredEl.focus === 'function') {
                try { restoredEl.focus({ preventScroll: true }); } catch (e) {}
            }
        }
        if (typeof window !== 'undefined' && prevScrollY > 0) {
            window.scrollTo({ top: prevScrollY, behavior: 'instant' });
        }
    },

    setCronogramaSubjectFilter(subj) {
        this.cronogramaFilter = subj;
        this.render();
    },

    toggleCronograma() {
        this.cronogramaExpanded = !this.cronogramaExpanded;
        this.render();
    },

    renderCronogramaSection() {
        const co = (state.user && state.user.coId && state.data.companies) ? state.data.companies[state.user.coId] : null;
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const activeSubj = this.cronogramaFilter || 'ALL';
        let filteredDefs = activeSubj === 'ALL' ? defs : defs.filter(d => d.subject === activeSubj);
        const deadlinesData = (state.data.config && state.data.config.deadlines) ? state.data.config.deadlines : {};

        const showAll = !!this.dossierShowAll;
        const now = Date.now();
        const fifteenDaysAhead = now + (15 * 24 * 60 * 60 * 1000);

        if (!showAll) {
            const reactiveDefs = filteredDefs.filter(d => {
                const dateStr = deadlinesData[d.key] || d.defaultDate;
                const dTime = new Date(dateStr).getTime();
                if (!isNaN(dTime) && dTime <= fifteenDaysAhead) return true;
                const item = co?.deliverables?.[d.key];
                if (item && item.status !== 'DELIVERED_TO_TEACHER') return true;
                return false;
            });
            if (reactiveDefs.length > 0) {
                filteredDefs = reactiveDefs;
            }
        }

        const subjectColors = {
            'FYQ': 'text-mars-cyan border-mars-cyan bg-mars-cyan/10',
            'LYE': 'text-mars-yellow border-mars-yellow bg-mars-yellow/10',
            'ECO': 'text-mars-green border-mars-green bg-mars-green/10',
            'MAT': 'text-amber-400 border-amber-400 bg-amber-400/10',
            'LEN': 'text-mars-magenta border-mars-magenta bg-mars-magenta/10',
            'ING': 'text-blue-400 border-blue-400 bg-blue-400/10'
        };

        const subjectNavButtons = [
            { id: 'ALL', label: `TODOS (${defs.length})` },
            { id: 'FYQ', label: 'FYQ' },
            { id: 'LYE', label: 'LYE' },
            { id: 'ECO', label: 'ECO' },
            { id: 'MAT', label: 'MAT' },
            { id: 'LEN', label: 'LEN' },
            { id: 'ING', label: 'ING' }
        ].map(btn => `
            <button type="button" role="tab" aria-selected="${activeSubj === btn.id}" onclick="ui.setCronogramaSubjectFilter('${btn.id}')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${activeSubj === btn.id ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">
                ${btn.label}
            </button>
        `).join('');

        const deadlineCardsHtml = filteredDefs.map(d => {
            const dateStr = deadlinesData[d.key] || d.defaultDate;
            const st = this.getDeadlineStatus(dateStr);
            const isDelivered = !!(co && co.deliverables && co.deliverables[d.key]);
            const sBadge = subjectColors[d.subject] || 'text-white border-white bg-white/10';
            const displayDate = String(dateStr).replace('T', ' ');

            return `
            <div class="terminal-border bg-slate-950 p-3.5 sm:p-4 border border-slate-800 flex flex-col justify-between hover:border-mars-cyan/60 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-2 flex-wrap gap-1.5">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${sBadge}">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                        ${isDelivered 
                            ? `<span class="text-xs font-black uppercase text-mars-green bg-mars-green/10 border border-mars-green/50 px-2 py-0.5">✓ ENTREGADO</span>`
                            : `<span class="text-xs font-bold uppercase text-slate-300 bg-black border border-slate-700 px-2 py-0.5">PENDIENTE</span>`}
                    </div>
                    <h4 class="text-white font-bold text-xs sm:text-sm uppercase leading-snug mb-1.5 break-words">${this.escapeHTML(d.name)}</h4>
                    <span class="text-xs text-slate-300 block mb-2.5 uppercase font-mono">Resp: ${this.escapeHTML(d.role.replace('_',' '))}</span>
                </div>
                <div>
                    <div class="flex justify-between items-center text-xs font-mono text-white mb-2 pt-2 border-t border-slate-800 gap-2">
                        <span class="text-slate-300 text-xs uppercase">Límite:</span>
                        <span class="font-bold tracking-tight">${this.escapeHTML(displayDate)}</span>
                    </div>
                    <div class="w-full text-center py-1.5 text-xs font-black uppercase tracking-wider ${st.class}">
                        ${this.escapeHTML(st.text)}
                    </div>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-mars-border pb-3">
                <div>
                    <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base uppercase tracking-tighter font-black">Cronograma Maestro Curricular</h3>
                    <p class="text-xs text-slate-300 uppercase mt-1">Hoja de ruta estratégica de entregables curriculares y plazos de entrega.</p>
                </div>
                <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button type="button" onclick="ui.toggleDossierShowAll()" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all ${showAll ? 'bg-mars-yellow text-black border-mars-yellow' : 'bg-slate-900 text-mars-cyan border-mars-cyan hover:bg-mars-cyan hover:text-black'}">
                        ${showAll ? '🎯 Filtrar Próximos 15 Días / Fase Activa' : `🔍 Expandir Histórico Completo (${defs.length})`}
                    </button>
                    ${(state.user && state.user.role === 'CEO') ? `<button type="button" onclick="ui.modalCreateAuxRole()" class="min-h-[44px] bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-mars-cyan hover:text-black transition-all shrink-0 w-full sm:w-auto">Gestionar Rol Observador</button>` : ''}
                </div>
            </div>

            <!-- Filtros por Materia -->
            <div role="tablist" aria-label="Filtrar entregables por asignatura" class="flex flex-wrap gap-2 pb-2 mb-4">
                ${subjectNavButtons}
            </div>

            <button type="button" aria-expanded="${!!this.cronogramaExpanded}" onclick="ui.toggleCronograma()" class="sm:hidden w-full min-h-[44px] mb-3 bg-slate-900 border border-mars-yellow/60 text-mars-yellow font-black uppercase text-xs py-2 px-3">
                ${this.cronogramaExpanded ? '▲ PLEGAR PLAZOS' : `▼ DESPLEGAR ${filteredDefs.length} PLAZOS`}
            </button>
            <div class="${this.cronogramaExpanded ? 'grid' : 'hidden sm:grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                ${deadlineCardsHtml}
            </div>
        </div>`;
    },

    renderDocBadge(title, docObj, short=false) {
        if (!docObj) {
            return `<div class="bg-black/60 border border-mars-border border-dashed p-3 mb-2 flex justify-between items-center gap-2 text-xs"><span class="text-slate-300 font-bold uppercase break-words">${this.escapeHTML(title)}</span><span class="text-mars-magenta font-black uppercase shrink-0">[PENDIENTE]</span></div>`;
        }
        const item = (typeof docObj === 'object' && docObj !== null)
            ? (docObj.driveUrl ? docObj : { ...docObj, driveUrl: docObj.dataUrl || docObj.url || '' })
            : { driveUrl: String(docObj || '') };
        const isValidDriveUrl = item.driveUrl && GOOGLE_DRIVE_REGEX.test(item.driveUrl);
        const status = item.status || 'DELIVERED_TO_TEACHER';
        
        let statusBadgeHtml = '';
        if (status === 'SUBMITTED_TO_CEO') {
            statusBadgeHtml = `<span class="bg-mars-yellow/20 text-mars-yellow border border-mars-yellow px-2 py-0.5 text-[10px] font-black uppercase shrink-0">[PENDIENTE SUPERVISIÓN CEO]</span>`;
        } else if (status === 'CEO_REVISION') {
            statusBadgeHtml = `<span class="bg-mars-magenta/20 text-mars-magenta border border-mars-magenta px-2 py-0.5 text-[10px] font-black uppercase shrink-0">[⚠️ REVISIÓN REQUERIDA POR CEO]</span>`;
        } else {
            statusBadgeHtml = `<span class="bg-mars-green/20 text-mars-green border border-mars-green px-2 py-0.5 text-[10px] font-black uppercase shrink-0">[✓ ENTREGADO A DOCENTE]</span>`;
        }

        let actionHtml = '';
        if (isValidDriveUrl) {
            const tipoDoc = item.driveUrl.includes('/document/') ? 'Doc'
              : item.driveUrl.includes('/spreadsheets/') ? 'Sheet'
              : item.driveUrl.includes('/presentation/') ? 'Slide'
              : item.driveUrl.includes('/folders/') ? 'Carpeta'
              : 'Archivo Drive';
            const safeHref = encodeURI(item.driveUrl).replace(/"/g, '&quot;');
            actionHtml = `<div class="flex items-center gap-2 shrink-0">
  ${statusBadgeHtml}
  <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors">
    <span>Abrir ${tipoDoc} ↗</span>
  </a>
</div>`;
        } else {
            actionHtml = `<div class="flex items-center gap-2 shrink-0">${statusBadgeHtml}<span class="text-xs text-amber-500/80 font-mono italic">[Contenido legacy no accesible por directiva RGPD]</span></div>`;
        }

        const dateStr = item.updatedAt || item.date || '';
        const reasonBanner = (status === 'CEO_REVISION' && (item.returnReason || item.returnReasonId))
            ? `<div class="mt-2 bg-red-950/50 border border-red-500/40 p-2 text-[11px] text-red-300 rounded"><strong class="text-red-400 uppercase">Motivo de Subsanación (CEO):</strong> ${this.escapeHTML(item.returnReason || item.returnReasonId)}</div>`
            : '';

        return `<div class="bg-mars-cyan/10 border border-mars-cyan/60 p-3 mb-2 text-xs">
                    <div class="flex justify-between items-center gap-2">
                        <div class="overflow-hidden pr-2">
                            <span class="text-mars-cyan font-bold uppercase block truncate">${this.escapeHTML(title)}</span>
                            <span class="text-xs text-slate-300 block truncate">GOOGLE DRIVE | ${this.escapeHTML(String(dateStr).slice(0,10))}</span>
                        </div>
                        ${actionHtml}
                    </div>
                    ${reasonBanner}
                </div>`;
    },
    
    renderDriveLinkBox(title, desc, docKey, currentDoc) {
        const isCEO = (typeof state !== 'undefined' && state.user && state.user.role === 'CEO');
        const item = (typeof currentDoc === 'object' && currentDoc !== null) ? currentDoc : null;
        const status = item?.status;

        const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        const isLocked = Boolean(openDate && !isNaN(new Date(openDate).getTime()) && (new Date() < new Date(openDate)));

        const lockBadge = isLocked
            ? `<span class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
            : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`;

        const templateBtn = sched.guideDocUrl
            ? `<div class="mb-2"><a href="${encodeURI(sched.guideDocUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-mars-cyan border border-mars-cyan/30 rounded hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"><span>📄 VER PLANTILLA DOCENTE ↗</span></a></div>`
            : '';

        let ceoControlsHtml = '';
        if (isCEO && item && (status === 'SUBMITTED_TO_CEO' || status === 'CEO_REVISION')) {
            ceoControlsHtml = `
            <div class="bg-slate-950 border border-mars-cyan/40 p-3 mt-2 flex flex-col sm:flex-row gap-2 justify-end">
                <button type="button" onclick="ui.approveDeliverableByCEO('${docKey}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ ✓ APROBAR Y ELEVAR A DOCENTE ]</button>
                <button type="button" onclick="ui.modalCeoReturnDeliverable('${docKey}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER CON MOTIVO ]</button>
            </div>
            `;
        }

        return `
        <div class="border-b border-slate-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <div class="flex justify-between items-start gap-2 flex-wrap mb-1">
                <h3 class="text-mars-cyan font-bold text-xs sm:text-sm uppercase">${this.escapeHTML(title)}</h3>
                ${lockBadge}
            </div>
            <p class="text-xs text-slate-300 mb-2 uppercase leading-relaxed">${this.escapeHTML(desc)}</p>
            ${templateBtn}
            ${this.renderDocBadge(title, currentDoc)}
            ${ceoControlsHtml}
            <div class="bg-slate-900 border border-slate-700 p-3 mt-2 space-y-2">
                <label for="input-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">${isLocked ? '🔒 Entrega Bloqueada hasta la Fecha de Apertura' : (isCEO ? 'Entregar o Actualizar Enlace Google Drive' : 'Subir Enlace para Supervisión del CEO')}</label>
                <div class="space-y-1.5">
                  <input type="url" 
                         id="input-drive-url" 
                         name="driveUrl" 
                         ${isLocked ? 'disabled' : 'required'} 
                         placeholder="${isLocked ? '🔒 Entrega bloqueada hasta ' + new Date(openDate).toLocaleString() : 'https://docs.google.com/... o https://drive.google.com/...'}" 
                         class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white rounded font-mono outline-none focus:border-mars-cyan ${isLocked ? 'opacity-50 cursor-not-allowed bg-slate-950' : ''}">
                  <p class="text-[10px] text-slate-400">
                    ${isLocked ? 'El equipo docente ha programado la apertura de este entregable. Podéis consultar la plantilla oficial arriba.' : 'Pega únicamente el enlace de tu archivo o carpeta en Google Drive configurado con permisos de lectura.'}
                  </p>
                </div>
                <div class="flex justify-end pt-1">
                    <button type="button" ${isLocked ? 'disabled' : ''} onclick="ui.submitDeliverable('${docKey}', this)" class="bg-mars-cyan text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white flex-shrink-0 w-full sm:w-auto min-h-[44px] ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}">${isLocked ? '🔒 Entrega Bloqueada' : (isCEO ? 'Entregar y Elevar a Docente' : 'Enviar a Supervisión CEO')}</button>
                </div>
            </div>
        </div>`;
    },

    modalCeoReturnDeliverable(docKey) {
        if (!state.user || state.user.role !== 'CEO') return;
        const reasons = (typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [
            { id: "ENLACE_INVALIDO", label: "Enlace a Google Drive inexistente o con formato incorrecto" },
            { id: "PERMISOS_BLOQUEADOS", label: "Documento sin permisos de acceso/lectura para el equipo docente" },
            { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial corporativa/curricular" },
            { id: "CHECKLIST_INCOMPLETO", label: "Faltan apartados obligatorios según la guía de la materia" },
            { id: "DISCREPANCIA_DATOS", label: "Discrepancia entre datos de la app y el documento adjunto" },
            { id: "REVISION_PENDIENTE", label: "Requiere subsanación técnica interna antes de elevar a evaluación" }
        ]);

        const optionsHtml = reasons.map(r => `<option value="${this.escapeHTML(r.id)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <div class="space-y-3">
                <p class="text-xs text-slate-300 leading-relaxed">Selecciona el motivo tipificado para devolver este entregable al departamento responsable. No se permite texto libre (directiva RGPD/Gobernanza).</p>
                <div>
                    <label for="ceo-return-reason" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Motivo Tipificado de Devolución</label>
                    <select id="ceo-return-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white outline-none focus:border-white">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmCeoReturnDeliverable('${docKey}')" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Confirmar Devolución</button>`;
        this.showModal("Supervisión CEO: Devolver Entregable", html, actions);
    },

    confirmCeoReturnDeliverable(docKey) {
        if (!state.user || state.user.role !== 'CEO') return;
        const el = document.getElementById('ceo-return-reason');
        if (!el) return;
        const reasonId = el.value;
        this.closeModal();
        state.returnDeliverableByCEO(docKey, reasonId);
    },

    approveDeliverableByCEO(docKey) {
        if (!state.user || state.user.role !== 'CEO') return;
        state.approveDeliverableByCEO(docKey);
    },

    submitDeliverable(docType, btnEl = null) {
        const inputFromBtn = (btnEl && btnEl.closest) ? (btnEl.closest('.bg-slate-900')?.querySelector('input[name="driveUrl"]') || btnEl.closest('.border-b')?.querySelector('input[name="driveUrl"]')) : null;
        const driveUrl = (inputFromBtn?.value || (document.getElementById(`input-drive-url-${docType}`)?.value || document.getElementById('input-drive-url')?.value || '')).trim();

        if (!GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            this.notify("Solo se admiten enlaces válidos a recursos de Google Drive.", "error");
            return;
        }

        state.submitDeliverable(docType, { driveUrl });
    },

    handleDeliverableLinkSubmit(docType) {
        return this.submitDeliverable(docType);
    },

    inspectDeliverableDrawer(coId, docKey) {
        const co = state.data.companies?.[coId];
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey);
        if (!co || !def) return;
        const doc = co.deliverables?.[docKey];
        const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        const isLocked = Boolean(openDate && !isNaN(new Date(openDate).getTime()) && (new Date() < new Date(openDate)));
        const dlDate = sched.deadline || ((state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? state.data.config.deadlines[def.key] : def.defaultDate);
        const dlBadge = this.getDeadlineStatus(dlDate);
        const lockBadge = isLocked
            ? `<span class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
            : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`;
        const templateBtn = sched.guideDocUrl
            ? `<a href="${encodeURI(sched.guideDocUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-mars-cyan border border-mars-cyan/30 rounded hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"><span>📄 VER PLANTILLA DOCENTE ↗</span></a>`
            : '';
        const rubric = (typeof RUBRIC_CONFIG !== 'undefined' && RUBRIC_CONFIG[def.subject]) ? RUBRIC_CONFIG[def.subject] : null;
        const criteriaHtml = rubric && rubric.criteria ? rubric.criteria.map(c => `
            <li class="flex justify-between items-center py-1 border-b border-slate-800/80 last:border-0">
                <span class="text-slate-200">${this.escapeHTML(c.name)}</span>
                <span class="text-mars-cyan font-bold">${Math.round(c.weight * 100)}%</span>
            </li>
        `).join('') : '';

        const item = (typeof doc === 'object' && doc !== null)
            ? (doc.driveUrl ? doc : { ...doc, driveUrl: doc.dataUrl || doc.url || '' })
            : { driveUrl: String(doc || '') };
        const isValidDriveUrl = item.driveUrl && GOOGLE_DRIVE_REGEX.test(item.driveUrl);
        let deliveryStatusHtml = '';
        if (doc) {
            const dateStr = item.updatedAt || item.date || '';
            const status = item.status || 'DELIVERED_TO_TEACHER';
            let pipelineLabel = '';
            if (status === 'SUBMITTED_TO_CEO') pipelineLabel = '<span class="text-mars-yellow font-bold uppercase text-xs">[PENDIENTE SUPERVISIÓN CEO]</span>';
            else if (status === 'CEO_REVISION') pipelineLabel = '<span class="text-mars-magenta font-bold uppercase text-xs">[⚠️ REVISIÓN REQUERIDA POR CEO]</span>';
            else pipelineLabel = '<span class="text-mars-green font-bold uppercase text-xs">[✓ ENTREGADO A DOCENTE]</span>';

            if (isValidDriveUrl) {
                const tipoDoc = item.driveUrl.includes('/document/') ? 'Doc'
                  : item.driveUrl.includes('/spreadsheets/') ? 'Sheet'
                  : item.driveUrl.includes('/presentation/') ? 'Slide'
                  : item.driveUrl.includes('/folders/') ? 'Carpeta'
                  : 'Archivo Drive';
                const safeHref = encodeURI(item.driveUrl).replace(/"/g, '&quot;');
                deliveryStatusHtml = `
                    <div class="flex items-center gap-2 mb-1">
                        ${pipelineLabel}
                        <span class="text-slate-400 text-xs font-mono">(${this.escapeHTML(String(dateStr).slice(0, 10))})</span>
                    </div>
                    ${status === 'CEO_REVISION' && (item.returnReason || item.returnReasonId) ? `<div class="bg-red-950/40 border border-red-500/40 p-2 text-xs text-red-300 mb-2 rounded"><strong class="uppercase">Motivo:</strong> ${this.escapeHTML(item.returnReason || item.returnReasonId)}</div>` : ''}
                    <div class="mt-2 flex items-center gap-2">
                        <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors">
                            <span>Abrir ${tipoDoc} ↗</span>
                        </a>
                        ${(state.user && state.user.role === 'CEO' && (status === 'SUBMITTED_TO_CEO' || status === 'CEO_REVISION')) ? `
                            <button type="button" onclick="ui.approveDeliverableByCEO('${docKey}'); ui.closeDrawer()" class="px-2.5 py-1 text-xs bg-mars-green text-black font-black uppercase hover:bg-white transition-all">Aprobar CEO</button>
                            <button type="button" onclick="ui.modalCeoReturnDeliverable('${docKey}'); ui.closeDrawer()" class="px-2.5 py-1 text-xs bg-red-700 text-white font-black uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Devolver</button>
                        ` : ''}
                    </div>
                `;
            } else {
                deliveryStatusHtml = `
                    <div class="flex items-center gap-2 mb-1">${pipelineLabel} <span class="text-slate-400 text-xs font-mono">(${this.escapeHTML(String(dateStr).slice(0, 10))})</span></div>
                    <div class="mt-1"><span class="text-xs text-amber-500/80 font-mono italic">[Contenido legacy no accesible por directiva RGPD]</span></div>
                `;
            }
        } else {
            deliveryStatusHtml = `<p class="text-mars-magenta font-bold uppercase text-xs">⚠️ PENDIENTE DE ENTREGA POR ${this.escapeHTML(def.role.replace('_',' '))}</p>`;
        }

        const bodyHtml = `
            <div class="space-y-3">
                <div class="bg-slate-900 border border-slate-700 p-3 space-y-1.5">
                    <div class="flex justify-between items-center gap-2 flex-wrap">
                        <span class="text-xs font-black px-2 py-0.5 border border-mars-cyan text-mars-cyan uppercase">${this.escapeHTML(def.subject)} • ${this.escapeHTML(def.weight)}</span>
                        <span class="text-xs font-black px-2 py-0.5 uppercase ${dlBadge.class}">${this.escapeHTML(dlBadge.text)}</span>
                    </div>
                    <div class="pt-1 flex items-center gap-2 flex-wrap">
                        ${lockBadge}
                        ${templateBtn}
                    </div>
                    <p class="text-white font-bold uppercase text-xs sm:text-sm pt-1">${this.escapeHTML(def.name)}</p>
                    <p class="text-slate-300 text-xs uppercase">Departamento Responsable: <strong class="text-mars-yellow">${this.escapeHTML(def.role.replace('_',' '))}</strong> | Límite: <strong>${this.escapeHTML(dlDate.replace('T', ' '))}</strong></p>
                </div>
                <div class="bg-black/70 border border-slate-800 p-3">
                    <p class="text-mars-yellow font-bold uppercase text-xs mb-2 border-b border-slate-800 pb-1">Estado de Entrega Cloud</p>
                    ${deliveryStatusHtml}
                </div>
                ${criteriaHtml ? `
                <div class="bg-slate-900/80 border border-slate-800 p-3">
                    <p class="text-mars-cyan font-bold uppercase text-xs mb-1.5 border-b border-slate-800 pb-1">Rúbrica Oficial de ${this.escapeHTML(rubric.name)}</p>
                    <ul class="space-y-1 text-xs">${criteriaHtml}</ul>
                </div>` : ''}
            </div>
        `;
        this.openDrawer(`INSPECCIÓN DE HITO // ${def.shortName || def.name}`, bodyHtml);
    },

    inspectOrderDrawer(coId, orderId, isMkt = false) {
        const co = state.data.companies?.[coId];
        if (!co) return;
        const list = isMkt ? (co.marketingCampaigns || []) : (co.orders || []);
        const ord = list.find(o => String(o.id) === String(orderId));
        if (!ord) return;

        const itemsHtml = isMkt
            ? `<li class="py-1 text-mars-magenta font-bold">Campaña Publicitaria: ${this.escapeHTML(ord.packName)} (${this.escapeHTML(ord.packType)})</li>`
            : (ord.items || []).map(i => `<li class="flex justify-between py-1 border-b border-slate-800/80 last:border-0"><span>${i.qty}x ${this.escapeHTML(i.name)} <span class="text-slate-400">(${this.escapeHTML(i.id)})</span></span><span class="text-mars-yellow font-bold">${(i.price * i.qty).toFixed(2)} €v</span></li>`).join('');

        const bodyHtml = `
            <div class="space-y-3">
                <div class="flex justify-between items-center bg-slate-900 border border-slate-700 p-3">
                    <div>
                        <span class="text-white font-orbitron font-black text-sm block">${this.escapeHTML(ord.id)}</span>
                        <span class="text-slate-300 text-xs uppercase">${this.escapeHTML(ord.date || '')}</span>
                    </div>
                    <div class="text-right">
                        <span class="text-mars-yellow font-orbitron font-black text-base block">-${Number(ord.total || ord.price || 0).toFixed(2)} €v</span>
                        <span class="text-xs font-bold uppercase text-mars-cyan">[${this.escapeHTML((ord.status || '').replace('_',' '))}]</span>
                    </div>
                </div>
                <div class="bg-black/70 border border-slate-800 p-3">
                    <p class="text-mars-cyan font-bold uppercase text-xs mb-1.5 border-b border-slate-800 pb-1">Desglose de Partidas</p>
                    <ul class="space-y-1 text-xs">${itemsHtml}</ul>
                </div>
                <div class="bg-slate-900 border border-slate-800 p-3">
                    <p class="text-mars-yellow font-bold uppercase text-xs mb-1">Informe Técnico de Especificación</p>
                    ${(ord.driveUrl && GOOGLE_DRIVE_REGEX.test(ord.driveUrl))
                        ? `<a href="${encodeURI(ord.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Informe Técnico en Docs ↗</span></a>`
                        : `<span class="text-xs text-amber-500/80 font-mono italic">[Memoria técnica legacy archivada por protocolo RGPD]</span>`
                    }
                    ${ord.realStore ? `<p class="text-mars-green text-xs font-bold uppercase mt-2 pt-2 border-t border-slate-800">Comercio Real: ${this.escapeHTML(ord.realStore)} | Coste Físico: ${Number(ord.realCost || 0).toFixed(2)} €</p>` : ''}
                </div>
            </div>
        `;
        this.openDrawer(`AUDITORÍA DE ORDEN // ${ord.id}`, bodyHtml);
    },

    inspectRubricDrawer(coId, sub) {
        const co = state.data.companies?.[coId];
        const config = (typeof RUBRIC_CONFIG !== 'undefined') ? RUBRIC_CONFIG[sub] : null;
        if (!co || !config) return;
        const grade = (co.grades && co.grades[sub]) ? co.grades[sub] : { scores: {}, feedback: '', final: null };
        const rows = config.criteria.map(c => `
            <div class="flex justify-between text-xs uppercase border-b border-slate-800/80 pb-1.5 gap-2">
                <span class="text-slate-300">${this.escapeHTML(c.name)} (${Math.round(c.weight * 100)}%)</span>
                <span class="font-mono font-bold ${grade.scores && grade.scores[c.id] !== undefined ? 'text-white' : 'text-slate-400'}">${grade.scores && grade.scores[c.id] !== undefined ? this.escapeHTML(grade.scores[c.id]) : '-'}</span>
            </div>`).join('');
        const fb = grade.feedback ? `<div class="bg-black p-3 border border-slate-700 text-xs text-slate-200 italic mt-2 break-words"><span class="text-mars-yellow font-bold not-italic block mb-1 uppercase text-xs">Feedback Docente:</span>"${this.escapeHTML(grade.feedback)}"</div>` : '';
        this.openDrawer(`RÚBRICA // ${config.name}`, `<div class="space-y-2">${rows}${fb}</div>`);
    },

    inspectMktCampDrawer(campId) {
        if (!state.user) return;
        const co = state.data.companies?.[state.user.coId];
        const camp = (co?.marketingCampaigns || []).find(c => String(c.id) === String(campId));
        if (!camp) return;
        const pkg = camp.packageName || camp.type || 'Campaña Publicitaria';
        const body = `
            <div class="space-y-3">
                <p class="text-white font-bold uppercase text-xs">${this.escapeHTML(camp.title || camp.type || 'Acción Comercial')}</p>
                <div class="bg-slate-900 border border-slate-800 p-3">
                    <p class="text-mars-yellow font-bold uppercase text-xs mb-1">Dossier / Justificación ROI</p>
                    ${(camp.driveUrl && GOOGLE_DRIVE_REGEX.test(camp.driveUrl))
                        ? `<a href="${encodeURI(camp.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Dossier ROI en Docs ↗</span></a>`
                        : `<span class="text-xs text-amber-500/80 font-mono italic">[Justificación ROI legacy archivada por protocolo RGPD]</span>`
                    }
                </div>
            </div>`;
        this.openDrawer(`JUSTIFICACIÓN ROI // ${pkg}`, body);
    },

    showModal(title, body, actions) {
        this._lastFocusedElement = document.activeElement;
        const elTitle = document.getElementById('modal-title');
        const elBody = document.getElementById('modal-body');
        const elActions = document.getElementById('modal-actions');
        const elOverlay = document.getElementById('modal-overlay');
        
        if(elTitle) elTitle.innerText = title; 
        if(elBody) elBody.innerHTML = body; 
        if(elActions) elActions.innerHTML = actions + `<button type="button" onclick="ui.closeModal()" class="bg-slate-800 text-white px-5 py-2.5 text-xs font-bold uppercase hover:bg-slate-700 transition-all shadow-md border border-slate-600 min-h-[44px]">Cerrar</button>`; 
        if(elOverlay) {
            elOverlay.classList.remove('hidden');
            setTimeout(() => {
                const firstFocusable = elOverlay.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
                if (firstFocusable) firstFocusable.focus();
            }, 40);
        }
    },

    openRgpdModal() {
        const html = `
            <div class="space-y-3 text-xs text-slate-200 font-mono leading-relaxed">
                <div class="p-2.5 bg-slate-900 border border-cyan-500/30">
                    <p><strong class="text-cyan-400">RESPONSABLE DEL TRATAMIENTO:</strong> Colegio Miravalles-El Redín</p>
                    <p class="mt-1"><strong class="text-cyan-400">FINALIDAD:</strong> Simulación aeroespacial y evaluación pedagógica competencial del alumnado.</p>
                    <p class="mt-1"><strong class="text-cyan-400">LEGITIMACIÓN:</strong> Misión de interés público y función docente (Art. 6.1.e RGPD).</p>
                    <p class="mt-1"><strong class="text-cyan-400">DESTINATARIOS:</strong> Sin cesión de datos a terceros ni transferencias internacionales.</p>
                    <p class="mt-1"><strong class="text-cyan-400">DERECHOS:</strong> Acceso, rectificación y supresión ante la dirección o profesorado del centro.</p>
                </div>
                <p class="text-[11px] text-slate-400 italic">La plataforma opera bajo el principio de minimización de datos: prohibido el uso de nombres reales o datos de contacto.</p>
            </div>
        `;
        this.showModal("Protocolo de Privacidad y RGPD (Art. 13)", html, "");
    },

    closeModal() { 
        const elOverlay = document.getElementById('modal-overlay');
        if(elOverlay) elOverlay.classList.add('hidden');
        const modalBox = document.querySelector('#modal-overlay > div');
        if (modalBox && modalBox.classList.contains('max-w-5xl')) {
            modalBox.classList.remove('max-w-5xl');
            modalBox.classList.add('max-w-lg');
        }
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
        }
    }
};