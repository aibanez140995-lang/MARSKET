// js/ui-core.js
// --- MÓDULO UI CORE: ENRUTAMIENTO, HUD, BLINDAJE LÉXICO Y ONBOARDING (v1.1.44) ---

// Constante global GOOGLE_DRIVE_REGEX centralizada en js/config.js

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '', evalClassFilter: 'ALL',
    activeMilestoneGroup: 'ACTIVE',
    ceoTrayFilter: 'ALL',
    ordersFilterTab: 'EN_PROCESO',
    ordersDeptFilter: 'ALL',
    ordersVisibleCount: 5,
    currentSubView: null,
    _lastFocusedElement: null,
    _toastTimer: null,
    _layerStack: [],
    _layerCounter: 0,
    _isPoppingState: false,
    _cleanupHooks: [],
    _delegationAttached: false,
    _playedPhaseDangerKey: null,

    isDocsEditorUrl(url) {
        if (!url || typeof url !== 'string') return false;
        return /^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\//i.test(url.trim());
    },

    getGoogleViewUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim();
        if (!this.isDocsEditorUrl(trimmed)) return trimmed;
        if (/\/(view|preview)([\?#].*)?$/i.test(trimmed) && !/\/template\/preview/i.test(trimmed)) {
            return trimmed;
        }
        if (/\/(edit|copy|template\/preview)([\?#].*)?$/i.test(trimmed)) {
            return trimmed.replace(/\/(edit|copy|template\/preview)([\?#].*)?$/i, '/preview');
        }
        if (/\/d\/[a-zA-Z0-9_-]+\/?$/i.test(trimmed)) {
            return trimmed.replace(/\/?$/, '/preview');
        }
        return trimmed;
    },

    getGoogleCopyUrl(url) {
        if (!url || typeof url !== 'string') return '';
        const trimmed = url.trim();
        if (!this.isDocsEditorUrl(trimmed)) return trimmed;
        if (/\/copy([\?#].*)?$/i.test(trimmed)) return trimmed;
        if (/\/(edit|view|preview|template\/preview)([\?#].*)?$/i.test(trimmed)) {
            return trimmed.replace(/\/(edit|view|preview|template\/preview)([\?#].*)?$/i, '/copy');
        }
        if (/\/d\/[a-zA-Z0-9_-]+\/?$/i.test(trimmed)) {
            return trimmed.replace(/\/?$/, '/copy');
        }
        return trimmed;
    },

    getDeliverableTemplateUrl(docKey) {
        if (!docKey) return '';
        const schedMap = (typeof state !== 'undefined' && state.data?.config?.deliverableSchedule) ? state.data.config.deliverableSchedule : {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const templates = typeof OFFICIAL_DOC_TEMPLATES !== 'undefined' ? OFFICIAL_DOC_TEMPLATES : {};

        const curPhase = this.getCurrentPhaseKey ? this.getCurrentPhaseKey() : 'I';
        const preferredDiary = curPhase === 'IV' ? 'decisionDiary_apr' : 'decisionDiary_dec';
        const secondaryDiary = preferredDiary === 'decisionDiary_apr' ? 'decisionDiary_dec' : 'decisionDiary_apr';

        let candidateKeys = [docKey];
        if (docKey === 'DOC_10_HOJA_TALLER') candidateKeys = ['DOC_10_HOJA_TALLER', 'hoja_taller_fyq'];
        else if (docKey === 'hoja_taller_fyq') candidateKeys = ['hoja_taller_fyq', 'DOC_10_HOJA_TALLER'];
        else if (docKey === 'DOC_4_BITACORA_IA') candidateKeys = ['DOC_4_BITACORA_IA', preferredDiary, secondaryDiary];
        else if (docKey === 'decisionDiary_dec' || docKey === 'decisionDiary_apr') candidateKeys = [docKey, 'DOC_4_BITACORA_IA'];

        // 1. Revisar si el entregable o su alias tiene override explícito o fue limpiado (clearedGuide)
        for (const k of candidateKeys) {
            const s = schedMap[k];
            if (s && s.guideDocUrl && String(s.guideDocUrl).trim()) {
                return String(s.guideDocUrl).trim();
            }
            if (s && s.clearedGuide === true && (k === docKey || k === 'hoja_taller_fyq' || k === preferredDiary)) {
                return '';
            }
        }

        // 2. Fallback a defaultGuideDocUrl en DELIVERABLES_DEF
        for (const k of candidateKeys) {
            const def = defs.find(d => d.key === k);
            if (def && def.defaultGuideDocUrl && String(def.defaultGuideDocUrl).trim()) {
                return String(def.defaultGuideDocUrl).trim();
            }
        }

        // 3. Fallback a OFFICIAL_DOC_TEMPLATES
        for (const k of candidateKeys) {
            if (templates[k] && templates[k].copyUrl && String(templates[k].copyUrl).trim()) {
                return String(templates[k].copyUrl).trim();
            }
        }

        return '';
    },

    renderDocTemplateBtn(docKey, customLabel = null) {
        const tplUrl = this.getDeliverableTemplateUrl(docKey);
        if (!tplUrl) return '';

        if (this.isDocsEditorUrl(tplUrl)) {
            const viewUrl = this.getGoogleViewUrl(tplUrl);
            const copyUrl = this.getGoogleCopyUrl(tplUrl);
            const viewLabel = customLabel || '📄 Ver Plantilla Oficial';

            return `
            <div class="inline-flex flex-wrap items-center gap-2">
                <a href="${encodeURI(viewUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 min-h-[44px] bg-slate-900 border border-blue-500/70 hover:border-cyan-400 text-blue-300 hover:text-white px-3.5 py-2 text-xs font-bold uppercase transition-all shadow-sm group rounded">
                    <span>${viewLabel}</span>
                    <span class="text-xs text-cyan-400 font-mono group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>
                <a href="${encodeURI(copyUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-1.5 min-h-[44px] bg-cyan-950/60 border border-mars-cyan/70 hover:bg-mars-cyan hover:text-black text-mars-cyan px-3.5 py-2 text-xs font-black uppercase transition-all shadow-sm group rounded">
                    <span>📋 Hacer Copia en Drive</span>
                    <span class="text-xs font-mono group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>
            </div>
            `;
        }

        const singleLabel = customLabel || '📄 Abrir Plantilla en Drive';
        return `
            <div class="inline-flex items-center">
                <a href="${encodeURI(tplUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 min-h-[44px] bg-slate-900 border border-blue-500/70 hover:border-cyan-400 text-blue-300 hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all shadow-sm group rounded">
                    <span>${singleLabel}</span>
                    <span class="text-xs text-cyan-400 font-mono group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>
            </div>
        `;
    },

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

    getEffectiveRole(co = null) {
        if (typeof state !== 'undefined' && typeof state.getEffectiveRole === 'function') {
            return state.getEffectiveRole(state.user, co);
        }
        return state.user?.role || '';
    },

    navigate(view, opts = null) {
        if (!state.user?.admin && view === 'dossier') {
            this.current = 'role_deliverables';
            this.currentSubView = null;
            this.roleDeliverablesSection = (opts && (opts.section || (opts.subTab === 'docs' ? 'deliverables' : (opts.subTab === 'eval' ? 'grades' : null)))) || 'grades';
            this.render();
            return;
        }
        if (view === 'role_deliverables' && opts && opts.section) {
            this.roleDeliverablesSection = opts.section;
        }
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
            { id: 'market', label: '🛒 SUPER-MARSKET' }
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
        if (groupId && groupId.startsWith('PHASE_') && !state.user?.admin) {
            const pCode = groupId.replace('PHASE_', '');
            if (!this.isPhaseUnlocked(pCode)) {
                this.notify(`La Fase ${pCode} aún no ha comenzado.`, 'warning');
                return;
            }
        }
        this.activeMilestoneGroup = (this.activeMilestoneGroup === groupId) ? 'NONE' : groupId;
        this.render();
    },

    setOrdersFilterTab(tab) {
        this.ordersFilterTab = tab || 'EN_PROCESO';
        this.ordersVisibleCount = 5;
        this.render();
    },

    setOrdersDeptFilter(dept) {
        this.ordersDeptFilter = dept || 'ALL';
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
        const headerBar = document.getElementById('hud-drawer-header-bar') || handle;
        if (!overlay || !titleEl || !bodyEl || !sheet || !handle) return;

        titleEl.innerText = title || 'INSPECCIÓN TÁCTICA';
        bodyEl.innerHTML = bodyHtml || '';
        overlay.classList.remove('hidden');

        this._isDraggingDrawer = false;
        this._touchStartY = 0;
        this._lastDeltaY = 0;

        this._boundTouchMove = (e) => {
            if (!this._isDraggingDrawer) return;
            const deltaY = e.touches[0].clientY - this._touchStartY;
            if (deltaY > 0) {
                this._lastDeltaY = deltaY;
                sheet.style.transform = `translateY(${deltaY}px)`;
            }
        };
        this._boundTouchEnd = () => {
            if (!this._isDraggingDrawer) return;
            this._isDraggingDrawer = false;
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
            if (this._drawerHeaderEl) this._drawerHeaderEl.removeEventListener('touchstart', this._boundTouchStart);
        }
        this._drawerHandleEl = handle;
        this._drawerHeaderEl = headerBar;
        this._boundTouchStart = (e) => {
            this._isDraggingDrawer = true;
            this._touchStartY = e.touches[0].clientY;
            this._lastDeltaY = 0;
            sheet.style.transition = '';
            window.addEventListener('touchmove', this._boundTouchMove, { passive: true });
            window.addEventListener('touchend', this._boundTouchEnd);
        };
        handle.addEventListener('touchstart', this._boundTouchStart, { passive: true });
        if (headerBar && headerBar !== handle) {
            headerBar.addEventListener('touchstart', this._boundTouchStart, { passive: true });
        }

        this.pushLayer('drawer', (skipHistory) => this.closeDrawer(skipHistory));
        setTimeout(() => {
            const firstBtn = overlay.querySelector('button:not([disabled]), a[href], input:not([disabled])');
            if (firstBtn) firstBtn.focus();
        }, 40);
    },

    closeDrawer(skipHistory = false) {
        this._isDraggingDrawer = false;
        if (this._boundTouchMove) window.removeEventListener('touchmove', this._boundTouchMove);
        if (this._boundTouchEnd) window.removeEventListener('touchend', this._boundTouchEnd);
        if (this._boundTouchStart) {
            if (this._drawerHandleEl) this._drawerHandleEl.removeEventListener('touchstart', this._boundTouchStart);
            if (this._drawerHeaderEl) this._drawerHeaderEl.removeEventListener('touchstart', this._boundTouchStart);
            this._boundTouchStart = null;
            this._drawerHandleEl = null;
            this._drawerHeaderEl = null;
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

    getCurrentPhaseInfo() {
        const phasesDef = (typeof PROJECT_PHASES_DEF !== 'undefined') ? PROJECT_PHASES_DEF : {};
        const now = Date.now();
        let currentKey = 'I';
        if (now >= new Date('2027-05-19T00:00:00').getTime()) currentKey = 'V';
        else if (now >= new Date('2027-03-31T00:00:00').getTime()) currentKey = 'IV';
        else if (now >= new Date('2027-02-15T00:00:00').getTime()) currentKey = 'III';
        else if (now >= new Date('2026-12-15T00:00:00').getTime()) currentKey = 'II';
        else currentKey = 'I';

        const def = phasesDef[currentKey] || {
            id: currentKey,
            name: `Fase ${currentKey}`,
            startDate: '2026-11-02'
        };

        const phaseDeadlines = {
            'I': '15/12/2026 23:59',
            'II': '15/02/2027 23:59',
            'III': '31/03/2027 23:59',
            'IV': '18/05/2027 23:59',
            'V': '19/05/2027 23:59'
        };

        return {
            id: currentKey,
            key: currentKey,
            name: def.name || `Fase ${currentKey}`,
            desc: def.desc || '',
            deadline: phaseDeadlines[currentKey] || '15/12/2026 23:59'
        };
    },

    getDeliverableDeadlineTs(def) {
        if (!def) return 9999999999999;
        const sched = (state.data?.config?.deliverableSchedule && state.data.config.deliverableSchedule[def.key]) || {};
        const dlStr = sched.deadline || (state.data?.config?.deadlines && state.data.config.deadlines[def.key]) || def.defaultDate || '2099-12-31';
        const ts = new Date(dlStr).getTime();
        return isNaN(ts) ? 9999999999999 : ts;
    },

    /**
     * Calcula de forma centralizada la telemetria temporal y estado de riesgo de la fase activa.
     */
    getPhaseClockMetrics(co = null) {
        const phaseInfo = this.getCurrentPhaseInfo ? this.getCurrentPhaseInfo() : { key: 'I', name: 'Fase I: Preparación, Identidad y Presupuesto Inicial', deadline: '15/12/2026 23:59' };
        const pDefsSource = typeof PROJECT_PHASES_DEF !== 'undefined' ? PROJECT_PHASES_DEF : {};
        const phaseConfig = pDefsSource[phaseInfo.key] || {};
        const phaseStartDate = phaseConfig.startDate ? new Date(phaseConfig.startDate + 'T00:00:00').getTime() : new Date('2026-11-02T00:00:00').getTime();

        let phaseEndDate = 0;
        if (phaseInfo.deadline) {
            const parts = String(phaseInfo.deadline).split(' ');
            const dParts = parts[0]?.split('/');
            if (dParts && dParts.length === 3) {
                phaseEndDate = new Date(`${dParts[2]}-${dParts[1]}-${dParts[0]}T${parts[1] || '23:59'}:00`).getTime();
            }
        }
        if (!phaseEndDate || isNaN(phaseEndDate)) {
            phaseEndDate = new Date('2026-12-15T23:59:59').getTime();
        }

        const nowTs = Date.now();
        const totalPhaseDuration = Math.max(1, phaseEndDate - phaseStartDate);
        const elapsedPhaseTime = Math.max(0, Math.min(totalPhaseDuration, nowTs - phaseStartDate));
        const timeProgressPct = Math.min(100, Math.max(0, Math.round((elapsedPhaseTime / totalPhaseDuration) * 100)));
        const msRemaining = Math.max(0, phaseEndDate - nowTs);
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
        const isDeadlinePassed = nowTs > phaseEndDate;

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const phaseDefs = defs.filter(d => (this.getDeliverablePhase ? this.getDeliverablePhase(d.key) : (d.phase || 'I')) === phaseInfo.key);
        const phaseTotalCount = phaseDefs.length;

        const docs = co?.deliverables || {};
        const phaseDeliveredCount = co
            ? phaseDefs.filter(d => {
                const doc = docs[d.key];
                return doc && (doc.status === 'DELIVERED_TO_TEACHER' || (typeof doc === 'string' && doc.length > 0));
            }).length
            : 0;
        const phaseCeoCount = co
            ? phaseDefs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO').length
            : 0;
        const phaseReturnedCount = co
            ? phaseDefs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO')).length
            : 0;
        const phasePct = phaseTotalCount > 0 ? Math.round((phaseDeliveredCount / phaseTotalCount) * 100) : 0;
        const pendingDeliverablesCount = Math.max(0, phaseTotalCount - phaseDeliveredCount);

        const inCriticalWindow = daysRemaining <= 3;
        const isDanger = Boolean(co && inCriticalWindow && phaseTotalCount > 0 && pendingDeliverablesCount > 0);
        const isAllDoneSafe = Boolean(co && inCriticalWindow && phaseTotalCount > 0 && pendingDeliverablesCount === 0);
        const isTeacherBottleneck = Boolean(co && inCriticalWindow && phaseTotalCount > 0 && (phaseDeliveredCount / phaseTotalCount) < 0.5);

        return {
            phaseInfo,
            phaseStartDate,
            phaseEndDate,
            nowTs,
            timeProgressPct,
            msRemaining,
            daysRemaining,
            isDeadlinePassed,
            phaseDefs,
            phaseTotalCount,
            phaseDeliveredCount,
            phaseCeoCount,
            phaseReturnedCount,
            pendingDeliverablesCount,
            phasePct,
            inCriticalWindow,
            isDanger,
            isAllDoneSafe,
            isTeacherBottleneck
        };
    },

    isPhaseDangerAudioMuted() {
        try {
            return typeof localStorage !== 'undefined' && localStorage.getItem('marsket_mute_danger_audio') === '1';
        } catch (e) {
            return false;
        }
    },

    togglePhaseDangerMute() {
        const nextMuted = !this.isPhaseDangerAudioMuted();
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('marsket_mute_danger_audio', nextMuted ? '1' : '0');
            }
        } catch (e) {}
        this.notify(
            nextMuted ? '🔕 Alerta sonora de cierre de fase silenciada en este equipo.' : '🔔 Alerta sonora suave de cierre de fase activada.',
            'info'
        );
        this.render();
    },

    playPhaseDangerChime(phaseKey = 'I') {
        if (this.isPhaseDangerAudioMuted()) return;
        const playKey = `${state.user?.coId || 'co'}_${phaseKey}`;
        if (this._playedPhaseDangerKey === playKey) return;
        try {
            if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('marsket_chime_' + playKey) === '1') {
                this._playedPhaseDangerKey = playKey;
                return;
            }
        } catch (e) {}

        this._playedPhaseDangerKey = playKey;
        try {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('marsket_chime_' + playKey, '1');
            }
        } catch (e) {}

        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;

            const playTone = (freq, startOffset, duration) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + startOffset);
                gain.gain.setValueAtTime(0.0001, now + startOffset);
                gain.gain.exponentialRampToValueAtTime(0.04, now + startOffset + 0.03);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now + startOffset);
                osc.stop(now + startOffset + duration + 0.02);
            };

            playTone(587.33, 0.0, 0.22);
            playTone(440.00, 0.24, 0.30);
            setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1000);
        } catch (e) {}
    },

    setCeoTrayFilter(mode) {
        this.ceoTrayFilter = (mode === 'URGENT') ? 'URGENT' : 'ALL';
        this.render();
    },

    getDeadlineStatus(dateString, isDelivered = false) {
        if (isDelivered) {
            return {
                text: "✅ ENTREGADO EN PLAZO",
                class: "bg-mars-green/20 text-mars-green border border-mars-green/60 font-black shadow-[0_0_8px_rgba(0,255,102,0.2)]",
                status: 'DELIVERED'
            };
        }
        if(!dateString) return { text: "NO DEFINIDO", class: "bg-slate-800 text-slate-300", status: 'UNDEFINED' };
        const now = new Date();
        const dl = new Date(dateString);
        const diffHours = (dl - now) / (1000 * 60 * 60);
        if (diffHours < 0) {
            return {
                text: "⚠️ PLAZO EXPIRADO",
                class: "bg-red-950/90 text-red-300 border border-red-500 animate-pulse shadow-[0_0_10px_rgba(255,0,0,0.5)] font-bold",
                status: 'EXPIRED'
            };
        }
        if (diffHours < 24) {
            const h = Math.max(1, Math.floor(diffHours));
            return {
                text: `🔥 ¡ÚLTIMAS ${h}H!`,
                class: "bg-red-600 text-white font-black animate-pulse shadow-[0_0_12px_rgba(255,0,0,0.6)]",
                status: 'CRITICAL'
            };
        }
        if (diffHours < 72) {
            const d = Math.floor(diffHours / 24);
            const h = Math.floor(diffHours % 24);
            return {
                text: `⚠️ CIERRE INMINENTE (${d > 0 ? d + 'd ' : ''}${h}h)`,
                class: "bg-orange-500 text-black font-black shadow-[0_0_8px_rgba(255,140,0,0.4)]",
                status: 'URGENT'
            };
        }
        if (diffHours < 168) {
            const d = Math.max(1, Math.floor(diffHours / 24));
            return {
                text: `📅 ESTA SEMANA (${d}d)`,
                class: "bg-mars-yellow text-black font-bold shadow-[0_0_6px_rgba(255,230,0,0.3)]",
                status: 'WARNING'
            };
        }
        const d = Math.floor(diffHours / 24);
        return {
            text: `⏳ EN PLAZO (${d}d)`,
            class: "bg-mars-cyan text-black font-bold",
            status: 'OK'
        };
    },

    initTextZoom() {
        if (typeof window === 'undefined' || !window.localStorage) return;
        const currentZoom = localStorage.getItem('marsket_text_zoom') || 'normal';
        this.applyTextZoom(currentZoom);
    },

    toggleTextZoom() {
        const levels = ['normal', 'large', 'xlarge'];
        const current = (typeof document !== 'undefined' && document.documentElement.getAttribute('data-text-zoom')) || 'normal';
        const nextIdx = (levels.indexOf(current) + 1) % levels.length;
        const nextZoom = levels[nextIdx];
        this.applyTextZoom(nextZoom);
        const labels = { normal: '100% (Estándar)', large: '110% (Grande)', xlarge: '120% (Extra)' };
        this.notify(`🔠 Tamaño de texto: ${labels[nextZoom] || '100%'}`, 'info');
    },

    applyTextZoom(level) {
        if (typeof document === 'undefined') return;
        const validLevels = ['normal', 'large', 'xlarge'];
        const target = validLevels.includes(level) ? level : 'normal';
        if (target === 'normal') {
            document.documentElement.removeAttribute('data-text-zoom');
        } else {
            document.documentElement.setAttribute('data-text-zoom', target);
        }
        try {
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('marsket_text_zoom', target);
            }
        } catch(e) {}
        this.updateZoomButtonUI(target);
    },

    updateZoomButtonUI(level) {
        const lbl = document.getElementById('hud-zoom-label');
        const btn = document.getElementById('hud-btn-zoom');
        const labels = { normal: '100%', large: '110%', xlarge: '120%' };
        const text = labels[level] || '100%';
        if (lbl) lbl.innerText = text;
        if (btn) {
            btn.title = `Tamaño de texto: ${text}. Pulsa para alternar (100% ➔ 110% ➔ 120%)`;
            if (level === 'large' || level === 'xlarge') {
                btn.className = 'min-h-[44px] min-w-[44px] px-2.5 py-1.5 bg-mars-cyan/20 border-2 border-mars-cyan text-mars-cyan font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all rounded-sm shadow-[0_0_10px_rgba(0,240,255,0.3)] active:scale-95';
            } else {
                btn.className = 'min-h-[44px] min-w-[44px] px-2.5 py-1.5 bg-black/60 border border-slate-700 hover:border-mars-cyan text-slate-300 hover:text-mars-cyan font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 transition-all rounded-sm shadow-sm active:scale-95';
            }
        }
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

    _pushNotificationToCompany(co, targetRole, message, type = 'info', targetMeta = null) {
        if (!co) return;
        co.notifications = co.notifications || [];
        const rawTarget = String(targetRole || 'ALL').toUpperCase();
        const normalizedTarget = rawTarget === 'OPERACIONES' ? 'OPERACIONES_IA' : rawTarget;
        let recipients = [normalizedTarget];
        if (normalizedTarget === 'ALL') {
            recipients = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
            if (!co.auxRoleDept) recipients.push('AUXILIAR');
        }
        const now = Date.now();
        const dateStr = new Date().toLocaleString();
        recipients.forEach((roleKey, idx) => {
            co.notifications.unshift({
                id: 'NOTIF-' + now + '-' + idx + '-' + Math.random().toString(36).substr(2, 4),
                role: roleKey,
                message: message,
                type: type,
                date: dateStr,
                read: false,
                updatedAt: now,
                target: targetMeta || null
            });
        });

        while (co.notifications.length > 150) {
            const lastReadIdx = co.notifications.map(n => !!n.read).lastIndexOf(true);
            if (lastReadIdx !== -1) co.notifications.splice(lastReadIdx, 1);
            else co.notifications.pop();
        }
        co.updatedAt = now;
    },

    pushNotification(coId, targetRole, message, type = 'info', targetMeta = null) {
        if (coId === 'ALL') {
            const companies = state.data?.companies || {};
            let touched = false;
            Object.entries(companies).forEach(([cid, co]) => {
                if (!co || cid === 'ADMIN') return;
                this._pushNotificationToCompany(co, targetRole, message, type, targetMeta);
                touched = true;
            });
            if (touched) state.save();
            return;
        }

        const co = state.data.companies?.[coId];
        if (!co) return;
        this._pushNotificationToCompany(co, targetRole, message, type, targetMeta);
        state.save(coId);
    },

    resolveNotificationTarget(notif) {
        const isAdmin = Boolean(state.user?.admin);
        const coId = state.user?.coId;
        const co = coId ? state.data.companies?.[coId] : null;
        const effectiveRole = this.getEffectiveRole(co) || '';

        if (!notif) {
            return isAdmin ? { view: 'admin' } : { view: 'role_deliverables', section: 'deliverables' };
        }

        const rawNotifRole = String(notif.role || '').toUpperCase();
        let role = (!rawNotifRole || rawNotifRole === 'ALL') ? effectiveRole : rawNotifRole;
        if (role === 'OPERACIONES') role = 'OPERACIONES_IA';
        if (role === 'AUXILIAR' && co?.auxRoleDept) role = this.getEffectiveRole(co);

        if (notif.target && typeof notif.target === 'object' && notif.target.view) {
            const explicit = { ...notif.target };
            if (!isAdmin && explicit.view === 'dossier') {
                explicit.view = 'role_deliverables';
                explicit.section = explicit.section || (explicit.subTab === 'eval' ? 'grades' : 'deliverables');
            }
            if (explicit.view === 'brand' && role === 'CEO') {
                return { ...explicit, view: 'resolutions', anchorId: 'ceo-slogan-approval-panel' };
            }
            if (explicit.view === 'brand' && explicit.subTab === 'slogan') {
                explicit.anchorId = explicit.anchorId || 'brand-slogan-section';
                delete explicit.subTab;
            }
            if (explicit.view === 'mkt-campaigns-section') {
                return { view: 'campaigns', anchorId: 'mkt-campaigns-section' };
            }
            if (explicit.view === 'tech' && !isAdmin && role && role !== 'TECNICO' && role !== 'AUXILIAR') {
                return role === 'CEO' ? { ...explicit, view: 'dashboard' } : { view: 'role_deliverables', section: 'deliverables' };
            }
            return explicit;
        }

        const msg = String(notif.message || '').toLowerCase();

        // Prensa, Crónica AEE y Tablón de Noticias
        if (msg.includes('nota de prensa') || msg.includes('crónica') || msg.includes('tablón de noticias') || msg.includes('aee prensa')) {
            return { view: 'news' };
        }

        // Licencia de Lanzamiento AESA
        if (msg.includes('licencia') || msg.includes('aesa')) {
            if (msg.includes('aprobada') || msg.includes('desbloqueado')) {
                if (role === 'TECNICO') return { view: 'tech' };
                if (role === 'CEO') return { view: 'dashboard' };
                return { view: 'role_deliverables', section: 'deliverables' };
            }
            return role === 'CEO' ? { view: 'dashboard' } : { view: 'role_deliverables', section: 'deliverables' };
        }

        // Balance de Cierre de Fase (DOC_17)
        if (msg.includes('balance de cierre') || msg.includes('balance de fase') || msg.includes('doc_17')) {
            if (role === 'CEO') return { view: 'dashboard', anchorId: 'ceo-balance-approval-panel' };
            if (role === 'FINANZAS') return { view: 'finance' };
            return { view: 'role_deliverables', section: 'deliverables' };
        }

        // Material I+D Especial fuera de catálogo
        if (msg.includes('i+d especial') || msg.includes('material i+d') || msg.includes('fuera de catálogo')) {
            if (role === 'CEO') return { view: 'dashboard', anchorId: 'ceo-special-items-panel' };
            return { view: 'tech', anchorId: 'tech-special-items-panel' };
        }

        // Bitácora IA
        if (!msg.includes('entregable') && /\b(ia|ai|inteligencia artificial)\b|prompt|bitácora/i.test(msg)) {
            return { view: 'ailog', anchorId: 'ailog-section' };
        }

        // Sanciones y Crisis (sin 'expediente' para no colisionar con Slogan/Identidad)
        if (msg.includes('sanción') || msg.includes('disciplin') || msg.includes('crisis')) {
            const crisis = (co?.crisisAlerts || []).find(a => notif.crisisId && String(a.id) === String(notif.crisisId)) || (co?.crisisAlerts || []).find(a => !a.read || !a.notified);
            const isPending = Boolean(crisis && !crisis.notified);
            if (role === 'CEO' && isPending) {
                return { view: 'orders', modal: 'crisis', crisisId: crisis ? crisis.id : notif.crisisId };
            }
            return { view: 'resolutions', anchorId: 'crisis-resolutions-panel' };
        }

        // Slogan e Identidad
        if (msg.includes('slogan') || msg.includes('eslogan') || msg.includes('logotipo') || msg.includes('identidad corporativa')) {
            if (role === 'MARKETING') return { view: 'brand', anchorId: 'brand-slogan-section' };
            return { view: 'resolutions', anchorId: 'ceo-slogan-approval-panel' };
        }

        // Patrocinios y Contratos Comerciales
        if (msg.includes('patrocinio') || msg.includes('contrato comercial')) {
            return role === 'FINANZAS' ? { view: 'finance' } : { view: 'contracts' };
        }

        // Ledger / Libro Mayor
        if (msg.includes('ledger') || msg.includes('libro mayor')) {
            return (role === 'FINANZAS' || role === 'CEO') ? { view: 'finance' } : { view: 'orders', filter: 'COMPLETADAS', dept: 'TECNICO' };
        }

        // Marketing y Campañas
        if (msg.includes('campaña') || msg.includes('publicit') || msg.includes('marketing') || msg.includes('acción') || msg.includes('paquete')) {
            if (role === 'MARKETING') return { view: 'campaigns', anchorId: 'mkt-campaigns-section' };
            if (role === 'CEO' || role === 'FINANZAS') {
                const filter = (msg.includes('rechaz') || msg.includes('deneg')) ? 'DENEGADAS' : 'EN_PROCESO';
                return { view: 'orders', filter, dept: 'MARKETING' };
            }
            return { view: 'orders', filter: 'EN_PROCESO', dept: 'MARKETING' };
        }

        // B2B y Aduanas
        if (msg.includes('b2b') || msg.includes('aduana')) {
            if (role === 'FINANZAS') return { view: 'finance' };
            if (role === 'OPERACIONES_IA') return { view: 'cart', anchorId: 'ops-orders-tracking-panel' };
            if (role === 'TECNICO') {
                if (msg.includes('devuelto la propuesta') || msg.includes('retirado del mercado') || msg.includes('propuesta b2b')) {
                    return { view: 'tech_workshop' };
                }
                if (msg.includes('publicado en b2b')) return { view: 'market' };
                if (msg.includes('rechaz') || msg.includes('deneg') || msg.includes('cancelad')) {
                    return { view: 'orders', filter: 'DENEGADAS', dept: 'TECNICO' };
                }
                if (msg.includes('aprobó la venta')) return { view: 'orders', filter: 'COMPLETADAS', dept: 'TECNICO' };
                if (msg.includes('autoriz') || msg.includes('conseguido') || msg.includes('formalizado') || msg.includes('compra')) {
                    return { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' };
                }
                return { view: 'market' };
            }
            return { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' };
        }

        // Hoja de Taller y Ensamble
        if (msg.includes('hoja de taller') || msg.includes('taller') || msg.includes('ensambl')) {
            if (role === 'OPERACIONES_IA') return { view: 'cart', anchorId: 'ops-orders-tracking-panel' };
            if (role === 'TECNICO') return { view: 'tech_workshop', anchorId: 'tech-hoja-taller-panel' };
            if (role === 'CEO') return { view: 'role_deliverables', section: 'deliverables', docKey: 'hoja_taller_fyq' };
            return { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' };
        }

        // Órdenes de compra y pedidos
        if (msg.includes('orden') || msg.includes('pedido') || msg.includes('compra') || msg.includes('presupuesto')) {
            if (role === 'OPERACIONES_IA') return { view: 'cart', anchorId: 'ops-orders-tracking-panel' };
            const filter = (msg.includes('rechaz') || msg.includes('denegad')) ? 'DENEGADAS' : ((msg.includes('completad') || msg.includes('ejecutad')) ? 'COMPLETADAS' : 'EN_PROCESO');
            return { view: 'orders', filter: filter, dept: 'TECNICO' };
        }

        // Gobernanza, Denominación, Rol Auxiliar, Inactividad HR, Mociones, Actas
        if (msg.includes('denominación') || msg.includes('mercantil') || msg.includes('auxiliar') || msg.includes('inactividad') || msg.includes('moción') || msg.includes('voto') || msg.includes('acta de comité') || msg.includes('estatutaria')) {
            return { view: 'resolutions' };
        }

        // Calificaciones y notas
        if (msg.includes('calific') || msg.includes('nota') || msg.includes('acta') || msg.includes('rúbrica')) {
            return isAdmin ? { view: 'dossier', subTab: 'eval' } : { view: 'role_deliverables', section: 'grades' };
        }

        // Entregables y visado
        if (msg.includes('entregable') || msg.includes('dossier') || msg.includes('visado') || msg.includes('subsan') || msg.includes('doc_')) {
            return isAdmin ? { view: 'dossier', subTab: 'docs' } : { view: 'role_deliverables', section: 'deliverables' };
        }

        return isAdmin ? { view: 'admin' } : { view: 'role_deliverables', section: 'deliverables' };
    },

    openNotificationTarget(notifId) {
        if (!state.user) return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        co.notifications = co.notifications || [];
        const notif = co.notifications.find(n => n.id === notifId);
        const effectiveRole = this.getEffectiveRole(co) || state.user.role;
        if (notif) {
            if (String(notif.role).toUpperCase() === 'ALL') {
                notif.readBy = notif.readBy || {};
                notif.readBy[effectiveRole] = true;
            } else {
                notif.read = true;
            }
            notif.updatedAt = Date.now();
            co.updatedAt = Date.now();
            state.save(coId);
        }

        this.updateBadges();
        this.closeDrawer();
        this.closeModal();

        const target = this.resolveNotificationTarget(notif);
        if (target.dept || target.deptFilter) this.ordersDeptFilter = target.dept || target.deptFilter;
        if (target.filter) this.ordersFilterTab = target.filter;

        if (target.view) {
            this.navigate(target.view, target);
        }

        if (target.subTab) {
            if (target.view === 'dossier' && typeof this.showDossierTab === 'function' && state.user?.admin) {
                this.showDossierTab(target.subTab);
            } else if (target.view === 'company' && typeof this.setCompanySubTab === 'function') {
                this.setCompanySubTab(target.subTab);
            }
        }

        if (target.modal === 'crisis') {
            setTimeout(() => {
                if (typeof this.modalCrisisAction === 'function') {
                    this.modalCrisisAction(target.crisisId);
                }
            }, 150);
        }

        if (target.docKey && typeof this.inspectDeliverableDrawer === 'function') {
            setTimeout(() => {
                this.inspectDeliverableDrawer(coId, target.docKey);
            }, 300);
        }

        setTimeout(() => {
            if (target.anchorId) {
                const el = document.getElementById(target.anchorId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('ring-mars-cyan');
                    setTimeout(() => el.classList.remove('ring-mars-cyan'), 2500);
                    return;
                }
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
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
        let targetRole = role || 'CEO';
        if (targetRole === 'OPERACIONES') targetRole = 'OPERACIONES_IA';
        if (targetRole === 'SECRETARIO') targetRole = 'AUXILIAR';

        const isDocente = targetRole === 'DOCENTE';
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const coId = state.user?.coId;
        const co = coId ? state.data.companies?.[coId] : null;
        const docs = co?.deliverables || {};

        if (isDocente) {
            if (state.user && !state.user.admin) {
                return `
                <div class="terminal-border border-dashed p-6 text-center text-mars-magenta font-mono text-xs uppercase bg-black/60">
                    🔒 Acceso denegado: El perfil y manual del Claustro Docente está reservado exclusivamente a profesores evaluadores.
                </div>`;
            }
            const isCoord = Boolean(state.user && state.user.role && state.user.role.startsWith('COORD_'));
            return `
            <div class="space-y-4 font-mono text-xs leading-relaxed text-slate-200">
                <!-- 1. Encabezado Operativo y Ficha de Puesto -->
                <div class="bg-mars-cyan/10 border-l-4 border-mars-cyan p-3.5 bg-slate-950">
                    <div class="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <span class="text-xs font-black uppercase text-mars-cyan tracking-wider">🎓 PUESTO: CLAUSTRO DOCENTE // EVALUADOR INTERDISCIPLINAR</span>
                        <span class="text-[10px] bg-black text-mars-green border border-mars-green/40 px-2 py-0.5 font-bold uppercase">v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '2.0.02'} OFICIAL</span>
                    </div>
                    <p class="text-white text-xs font-semibold leading-relaxed mb-3">
                        Supervisar el aprendizaje competencial de las 6 materias LOMLOE, evaluar los <strong>18 entregables oficiales</strong> en Google Drive mediante rúbricas ponderadas (0-10), arbitrar trámites aduaneros y coordinar las startups del consorcio.
                    </p>

                    <!-- Bloque Checklist de Aula en 3 Minutos -->
                    <div class="bg-slate-900/90 border border-mars-cyan/30 p-2.5 rounded mb-3">
                        <p class="text-mars-cyan font-black uppercase text-[11px] mb-1.5 flex items-center gap-1.5">
                            <span>⚡ TU RUTINA DE AULA EN 3 MINUTOS (CHECKLIST DE ENTRADA):</span>
                        </p>
                        <ul class="space-y-2 text-xs text-slate-300 pl-1">
                            <li>[ ] <strong>1. Filtra por clases con entregas pendientes (🟡 N):</strong> En la barra superior de <strong>Rúbricas</strong>, pulsa sobre las clases que muestren un badge amarillo pulsante (ej. <span class="text-amber-300 font-bold bg-amber-950/80 px-1 py-0.5 rounded border border-amber-500/40">🟡 2</span>). Esas clases tienen startups con entregas esperando tu calificación.</li>
                            <li>[ ] <strong>2. Consulta el Asistente Contextual:</strong> El monitor <em>"¿Qué me toca hacer hoy?"</em> identifica tu materia y fase activa. Pulsa <strong class="text-mars-cyan">[⚡ Evaluar siguiente pendiente ➔]</strong> para saltar en 1 clic a la empresa que te toca revisar.</li>
                            <li>[ ] <strong>3. Califica o Devuelve en 1 Clic:</strong> Abre el Google Doc del alumno en la columna derecha de evidencias. Califica con notas de <strong>0 a 10</strong> (la ponderación oficial se calcula sola al 100%). Si el enlace está privado o incompleto, pulsa <strong class="text-red-400">[↩ Subsanar]</strong> seleccionando el motivo tipificado.</li>
                            <li>[ ] <strong>4. Resuelve la Aduana:</strong> En <strong>🛃 Validaciones y Aduana</strong> autoriza licencias de vuelo AESA (FYQ), creatividades publicitarias (LYE) o compraventas de piezas B2B entre startups.</li>
                        </ul>
                    </div>

                    <!-- Botones de Navegación Rápida Docente -->
                    <div class="pt-1 flex flex-wrap gap-2">
                        <button type="button" onclick="ui.adminTab='eval'; ui.navigate('admin'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px] hover:bg-white transition-all shadow-sm">Ir a Rúbricas y Entregas</button>
                        <button type="button" onclick="ui.adminTab='dash'; ui.navigate('admin'); ui.closeModal();" class="text-xs bg-mars-yellow text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px] hover:bg-white transition-all shadow-sm">Ir a Validaciones y Aduana</button>
                        <button type="button" onclick="ui.adminTab='contracts'; ui.navigate('admin'); ui.closeModal();" class="text-xs bg-slate-800 border border-slate-600 text-white px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px] hover:bg-slate-700 transition-all">Ir a Contratos &amp; Misiones</button>
                        ${isCoord ? `<button type="button" onclick="ui.adminMode='coord'; ui.adminTab='startups'; ui.navigate('admin'); ui.closeModal();" class="text-xs bg-amber-400 text-black px-3.5 py-2 font-black font-mono uppercase rounded min-h-[44px] hover:bg-white transition-all">🔑 Llavero de Startups (TIC)</button>` : ''}
                    </div>
                </div>

                <!-- 2. Matriz Oficial de Evaluación por Asignaturas (18 Entregables y 100% Ponderado) -->
                <div class="bg-slate-950 border border-slate-800 p-3.5">
                    <div class="flex justify-between items-center mb-2 flex-wrap gap-1">
                        <p class="text-mars-cyan font-bold uppercase text-xs flex items-center gap-1.5">
                            <span>📁 Matriz Oficial de Evaluación por Asignatura (18 Entregables):</span>
                        </p>
                        <span class="text-[10px] text-slate-400 font-mono">100% ACTA GENERAL LOMLOE</span>
                    </div>

                    <div class="space-y-3">
                        <!-- FYQ -->
                        <div class="bg-black/60 border border-cyan-500/40 p-2.5 rounded">
                            <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                                <span class="text-cyan-400 font-bold uppercase text-xs">🧪 Física y Química (25% del Proyecto)</span>
                                <span class="text-[10px] font-mono text-cyan-300">5 Criterios</span>
                            </div>
                            <ul class="text-[11px] text-slate-300 space-y-1 pl-1">
                                <li>• <strong>1. Informe Preliminar, Boceto y Foto (10%):</strong> Fase I (Dpto. Técnico). Enlace a Docs.</li>
                                <li>• <strong>2. Hoja Oficial de Taller DOC_10 y BOM (10%):</strong> Fase III (Técnico + Operaciones).</li>
                                <li>• <strong>3. Informe Técnico Final Exhaustivo (30%):</strong> Fase IV (Dpto. Técnico).</li>
                                <li>• <strong>4. Prototipo Físico y Prueba de Lanzamiento (30%):</strong> Fases II a V (Evaluación directa en aula).</li>
                                <li>• <strong>5. Media de Test de Rol y Defensa Q&amp;A (20%):</strong> Fases I a IV (Evaluación directa en aula).</li>
                                <li class="text-amber-400 pt-0.5">• <em>Trámite en Aduana:</em> Autorización de Licencia de Vuelo AESA (DOC_14, 50 €v).</li>
                            </ul>
                        </div>

                        <!-- LYE -->
                        <div class="bg-black/60 border border-purple-500/40 p-2.5 rounded">
                            <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                                <span class="text-purple-400 font-bold uppercase text-xs">💼 Liderazgo y Emprendimiento (40% del Proyecto)</span>
                                <span class="text-[10px] font-mono text-purple-300">7 Criterios</span>
                            </div>
                            <ul class="text-[11px] text-slate-300 space-y-1 pl-1">
                                <li>• <strong>1A. Nombre, Logo y Tagline (10%):</strong> Fase I (Marketing).</li>
                                <li>• <strong>1B. Identidad de Marca y Manual (10%):</strong> Fase III (Marketing).</li>
                                <li>• <strong>2. Business Model — Documento Escrito (25%):</strong> Fase III (Marketing).</li>
                                <li>• <strong>3. Business Model Canvas (15%):</strong> Fase IV (Marketing).</li>
                                <li>• <strong>4A. Diario de Decisiones e IA Dic (10%, DOC_4):</strong> Fase I (Operaciones e IA).</li>
                                <li>• <strong>4B. Diario de Decisiones e IA Abr (10%, DOC_4):</strong> Fase IV (Operaciones e IA).</li>
                                <li>• <strong>Defensas Orales de Emprendimiento (20%):</strong> Fases I a V (Evaluación directa en aula).</li>
                                <li class="text-amber-400 pt-0.5">• <em>Trámite en Aduana:</em> Validación de Fichas de Campaña Publicitaria (DOC_12).</li>
                            </ul>
                        </div>

                        <!-- LEN -->
                        <div class="bg-black/60 border border-blue-500/40 p-2.5 rounded">
                            <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                                <span class="text-blue-400 font-bold uppercase text-xs">📚 Lengua Castellana (15% del Proyecto)</span>
                                <span class="text-[10px] font-mono text-blue-300">3 Criterios</span>
                            </div>
                            <ul class="text-[11px] text-slate-300 space-y-1 pl-1">
                                <li>• <strong>1. Producción Oral / Pitch (50%):</strong> Fases I a V (Evaluación directa en aula).</li>
                                <li>• <strong>2. Producción Escrita / Dossier para Inversores (40%):</strong> Fase IV (Marketing). Texto argumentativo en Docs.</li>
                                <li>• <strong>3. Conjunto de Notas de Prensa DOC_15 (10%):</strong> Fases I a IV (CEO a Lengua y Coordinación). Visualizador directo de los 4 comunicados de prensa en panel.</li>
                            </ul>
                        </div>

                        <!-- ECO -->
                        <div class="bg-black/60 border border-emerald-500/40 p-2.5 rounded">
                            <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1.5">
                                <span class="text-emerald-400 font-bold uppercase text-xs">📈 Economía (10% del Proyecto)</span>
                                <span class="text-[10px] font-mono text-emerald-300">5 Criterios</span>
                            </div>
                            <ul class="text-[11px] text-slate-300 space-y-1 pl-1">
                                <li>• <strong>1. Presupuesto Inicial (20%):</strong> Fase I (Dpto. Financiero).</li>
                                <li>• <strong>2. Presupuesto Post-Prototipo (20%):</strong> Fase II (Dpto. Financiero).</li>
                                <li>• <strong>3. Balance de Situación (20%):</strong> Fase III (Dpto. Financiero).</li>
                                <li>• <strong>4. Cuenta de Resultados (20%):</strong> Fase IV (Dpto. Financiero).</li>
                                <li>• <strong>Test Evaluativo de Economía (20%):</strong> Fases I a IV (Evaluación directa en aula).</li>
                            </ul>
                        </div>

                        <!-- MAT & ING -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div class="bg-black/60 border border-amber-500/40 p-2.5 rounded">
                                <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1">
                                    <span class="text-amber-400 font-bold uppercase text-[11px]">📐 Matemáticas (5%)</span>
                                    <span class="text-[10px] font-mono text-amber-300">4 Criterios (Fase II)</span>
                                </div>
                                <ul class="text-[10px] text-slate-300 space-y-0.5 pl-1">
                                    <li>• Goniómetro (25%)</li>
                                    <li>• Distancia Fija Conocida (25%)</li>
                                    <li>• Dos Mediciones Angulares (25%)</li>
                                    <li>• Informe Comparativo Final (25%)</li>
                                    <li class="text-slate-400 italic">Entregados por Operaciones e IA.</li>
                                </ul>
                            </div>
                            <div class="bg-black/60 border border-pink-500/40 p-2.5 rounded">
                                <div class="flex justify-between items-center border-b border-slate-800 pb-1 mb-1">
                                    <span class="text-pink-400 font-bold uppercase text-[11px]">🇬🇧 Inglés (5%)</span>
                                    <span class="text-[10px] font-mono text-pink-300">2 Criterios</span>
                                </div>
                                <ul class="text-[10px] text-slate-300 space-y-0.5 pl-1">
                                    <li>• 1. Expresión Oral / Micro-Pitch (70%) — Fases I a V</li>
                                    <li>• 2. Expresión Escrita / Fichas (30%) — Fases I a IV</li>
                                    <li class="text-slate-400 italic">Evaluación directa en aula.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 3. Manual Exhaustivo y Procedimientos de Gestión (Desplegable) -->
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none flex items-center justify-between">
                        <span>⚙️ Manual Exhaustivo de Gestión Docente (Modo Aula &amp; Modo TIC)</span>
                        <span class="text-slate-400 text-[10px] font-mono">Ver detalle ▼</span>
                    </summary>
                    <div class="mt-2.5 space-y-3 text-slate-300 border-t border-slate-800 pt-2.5 leading-relaxed text-xs">
                        <div>
                            <strong class="text-white uppercase block mb-1">1. Subsanación de Entregas con Motivo Tipificado:</strong>
                            <p>Si un documento está en modo privado, no abre o está incompleto, no pongas un 0 provisional. Pulsa <strong class="text-red-400">[↩ Subsanar]</strong> junto al documento en evidencias adjuntas, selecciona el motivo tipificado (o redacta la corrección docente) y la app notificará a la startup abriendo la reentrega.</p>
                        </div>
                        <div>
                            <strong class="text-white uppercase block mb-1">2. Arbitraje de Aduana B2B (Anti-Doble Venta):</strong>
                            <p>En compras de 2ª mano entre startups, el material sigue el circuito <em>Técnico propone ➔ Finanzas autoriza ➔ Aduana valida</em>. Al aprobar el traspaso en Aduana, el sistema transfiere los fondos y, si hubiera solicitudes duplicadas de otras empresas por esa misma pieza única, las cancela y reembolsa de inmediato el 100% en sus respectivos balances.</p>
                        </div>
                        <div>
                            <strong class="text-white uppercase block mb-1">3. Liquidación de Contratos Comerciales (Fases I a IV):</strong>
                            <p>El CEO firma 1 contrato comercial durante los 3 primeros días lectivos de cada fase. Al cierre de fase, el docente comprueba en la pestaña <strong>Contratos &amp; Misiones</strong> si cumplieron el hito y pulsa <strong class="text-mars-green">[Aprobar Recompensa]</strong> o <strong class="text-mars-magenta">[Penalizar]</strong>.</p>
                        </div>
                        ${isCoord ? `
                        <div class="border-t border-slate-800 pt-2">
                            <strong class="text-amber-400 uppercase block mb-1">4. Funciones de Coordinación y TIC (Modo TIC):</strong>
                            <ul class="space-y-1 text-slate-300 pl-2">
                                <li>• <strong>Llavero Maestro:</strong> Genera PINs de acceso para los alumnos e imprime tarjetas en PDF A4.</li>
                                <li>• <strong>Cronograma Maestro:</strong> Abre o bloquea fechas límite para los 18 hitos y responde sugerencias del alumnado.</li>
                                <li>• <strong>Catálogo Oficial Imprimible:</strong> Descarga el catálogo limpio en PDF A4 o CSV sin piezas especiales de I+D.</li>
                                <li>• <strong>Crónicas Nano Banana 3:</strong> Publica noticias con texto enriquecido y portadas de IA.</li>
                                <li>• <strong>Copias Cloud D1:</strong> Descarga snapshots JSON de seguridad o fuerza sincronización en la nube.</li>
                            </ul>
                        </div>` : ''}
                    </div>
                </details>

                <!-- 4. Aviso Clave -->
                <div class="bg-slate-900/80 border border-amber-400/40 p-3.5 text-xs text-slate-300 space-y-1">
                    <p class="text-amber-400 font-bold uppercase text-xs mb-1">⚠️ Aviso Clave y Protección del Menor:</p>
                    <p>Los enlaces de Google Drive deben estar en modo <em>"Cualquiera con el enlace puede ver"</em>. Exige el cumplimiento estricto de la política <strong>Zero-PII</strong> (sin nombres ni datos personales de alumnos en los documentos).</p>
                    <p class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">Cualquier consulta o reporte disciplinario debe gestionarse mediante motivos tipificados en la plataforma.</p>
                </div>
            </div>`;
        }

        // Estructura limpia de 3 bloques para los 6 roles de alumno
        let roleDeliverables = defs.filter(d => d.role === targetRole);
        if (!state.user?.admin) {
            roleDeliverables = roleDeliverables.filter(d => !this.isDeliverableLocked(d.key, co));
        }
        const roleDeliverablesHtml = roleDeliverables.length > 0 ? roleDeliverables.map(d => {
            const docObj = docs[d.key];
            const isLocked = this.isDeliverableLocked(d.key, co);
            const lockLabel = isLocked ? '<span class="text-amber-400 font-bold">[🔒 BLOQUEADO]</span>' : '<span class="text-mars-green font-bold">[🟢 ACTIVO]</span>';
            const statusLabel = docObj ? '<span class="text-mars-green font-bold">✓ Entregado</span>' : '<span class="text-mars-magenta font-bold">⏳ Pendiente</span>';
            const tplUrl = this.getDeliverableTemplateUrl(d.key);
            let tplBadge = '';
            if (tplUrl) {
                if (this.isDocsEditorUrl(tplUrl)) {
                    const viewUrl = this.getGoogleViewUrl(tplUrl);
                    const copyUrl = this.getGoogleCopyUrl(tplUrl);
                    tplBadge = `<span class="inline-flex flex-wrap items-center gap-1.5 mt-1 sm:mt-0 sm:ml-2"><a href="${encodeURI(viewUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2.5 py-1.5 bg-slate-900 border border-blue-500/50 rounded text-[11px] text-blue-300 hover:border-cyan-400 hover:text-white font-mono transition-colors">📄 Ver Plantilla ↗</a><a href="${encodeURI(copyUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2.5 py-1.5 bg-cyan-950/60 border border-mars-cyan/50 rounded text-[11px] text-mars-cyan hover:bg-mars-cyan hover:text-black font-mono font-bold transition-colors">📋 Clonar en Drive ↗</a></span>`;
                } else {
                    tplBadge = `<a href="${encodeURI(tplUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2.5 py-1.5 bg-slate-900 border border-blue-500/50 rounded text-[11px] text-blue-300 hover:border-cyan-400 hover:text-white font-mono ml-1.5 transition-colors">📄 Plantilla Drive ↗</a>`;
                }
            }
            return `<li class="border-b border-slate-800/80 py-2 flex justify-between items-center gap-2 flex-wrap"><span class="flex flex-wrap items-center gap-1.5"><strong class="text-white">${this.escapeHTML(d.shortName || d.name)}</strong> <span class="text-slate-400">(${this.escapeHTML(d.subject)})</span>: ${statusLabel}${tplBadge}</span>${lockLabel}</li>`;
        }).join('') : '<li class="text-slate-400 italic">No tienes entregables curriculares activos asignados directamente a tu rol en esta fase. Supervisa o asiste al equipo en el Dossier.</li>';

        let roleTitle = '';
        let roleDesc = '';
        let checklist3Min = '';
        let teamChain = '';
        let contingencyHtml = '';
        let roleButtons = '';
        let roleWarning = '';

        switch(targetRole) {
            case 'CEO':
                roleTitle = 'DIRECCIÓN GENERAL // CEO';
                roleDesc = 'Liderar la estrategia global de la empresa, visar entregables en el Dossier, validar campañas de marketing y coordinar la gobernanza corporativa.';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Revisa el saldo:</strong> Comprueba el capital en el HUD superior antes de autorizar decisiones de gasto.</li>
                    <li>[ ] <strong>2. Revisa entregables:</strong> Entra en <strong>[📋 Dossier]</strong>, abre los enlaces de tu equipo en Google Drive y pulsa <strong>[✓ APROBAR Y ELEVAR A DOCENTE]</strong>.</li>
                    <li>[ ] <strong>3. Valida Marketing:</strong> Entra en <strong>[🎨 Marca & MKT]</strong> para autorizar las acciones publicitarias presentadas por tu equipo.</li>
                </ul>`;
                teamChain = `Tus directores (Técnico, Finanzas, Marketing, Operaciones) redactan en Google Drive ➔ Tú revisas en Dossier ➔ Elevas la entrega al Claustro Docente.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Sanciones y Gobernanza)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Expediente AEE:</strong> Si recibes una sanción, pulsa <strong>[📢 Redactar Comunicado de Crisis]</strong>, redacta el descargo en el modelo DOC_3 y difúndelo con su enlace.</p>
                        <p>• <strong>Asamblea de Socios:</strong> En <strong>[⚖️ Gobernanza]</strong> convoca votaciones de socios y avala la propuesta oficial de eslogan ante Coordinación.</p>
                        <p>• <strong>Devolución de entregables:</strong> Si un documento no cumple la rúbrica o tiene permisos cerrados, pulsa <strong>[↩ DEVOLVER CON MOTIVO]</strong> para que el departamento subsane.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier</button>
                    <button type="button" onclick="ui.navigate('orders'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bóveda de Órdenes</button>
                    <button type="button" onclick="ui.navigate('brand'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Marca & MKT</button>
                `;
                roleWarning = 'Nunca apruebes un documento o acción sin abrir su enlace de Google Drive para comprobar que la plantilla oficial está completa y con permisos de lectura abiertos.';
                break;

            case 'TECNICO':
                roleTitle = 'DPTO. TÉCNICO // I+D';
                roleDesc = 'Diseñar el prototipo aeroespacial, adquirir componentes en SUPER-MARSKET y registrar lanzamientos en el Banco de Pruebas.';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Selecciona material:</strong> Entra en <strong>[🛒 SUPER-MARSKET]</strong>, añade componentes al carrito y remite el pedido a Finanzas.</li>
                    <li>[ ] <strong>2. Registra vuelos:</strong> En <strong>[🧪 Banco I+D]</strong>, introduce vinagre (ml), bicarbonato (g) y la altura en <strong>milímetros (mm)</strong> (puedes adjuntar el enlace opcional a tu vídeo calculando E en Drive).</li>
                    <li>[ ] <strong>3. Comunica al taller:</strong> Coordina con Operaciones e IA para asegurar que las piezas recepcionadas se montan en el cohete.</li>
                </ul>`;
                teamChain = `Tú solicitas componentes en SUPER-MARSKET ➔ Finanzas autoriza el presupuesto ➔ Operaciones recepciona y monta en taller.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Aduana B2B y Pedidos)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Mercado Secundario B2B:</strong> Si necesitas vender componentes sobrantes a otra startup (o recuperar capital si bajáis a ≤ 0 €v), tramita la oferta ante la Aduana Docente.</p>
                        <p>• <strong>Órdenes Rechazadas:</strong> Si Finanzas rechaza un pedido por falta de fondos, ajusta las cantidades en el carrito y reenvía.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('market'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a SUPER-MARSKET</button>
                    <button type="button" onclick="ui.navigate('tech'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Banco I+D</button>
                    <button type="button" onclick="ui.navigate('tech_workshop'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Taller</button>
                `;
                roleWarning = 'La altura del lanzamiento se registra siempre en milímetros (mm) y toda justificación técnica o de aduana requiere enlace oficial de Google Drive (el vídeo de cálculo de E es opcional).';
                break;

            case 'FINANZAS':
                roleTitle = 'DPTO. FINANCIERO // TESORERÍA';
                roleDesc = 'Administrar el capital en euros virtuales (€v), auditar órdenes en la Bóveda y vigilar el balance presupuestario.';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Controla tesorería:</strong> En <strong>[💰 Finanzas & ECO]</strong>, audita el saldo y comprueba los fondos disponibles.</li>
                    <li>[ ] <strong>2. Audita pedidos:</strong> En <strong>[🔐 Bóveda Órdenes]</strong>, revisa las solicitudes de Técnico y Marketing.</li>
                    <li>[ ] <strong>3. Decide liberación:</strong> Pulsa <strong>[Aprobar]</strong> si la startup tiene fondos o <strong>[Rechazar]</strong> si excede el presupuesto.</li>
                </ul>`;
                teamChain = `Técnico o Marketing te envían peticiones de compra ➔ Tú autorizas los fondos en la Bóveda ➔ Se descuenta del saldo líquido.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Patrocinios y Números Rojos)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Patrocinios:</strong> Si la empresa obtiene un patrocinador (Oro, Plata, Bronce), el descuento se aplica automáticamente a los costes operativos.</p>
                        <p>• <strong>Bloqueo en Números Rojos (≤ 0 €v):</strong> Si el saldo cae a 0 €v o entra en negativo por tasas o sanciones, todas las compras, pedidos y tasas quedan congelados hasta recuperar saldo positivo con Contratos, Patrocinios o ventas B2B.</p>
                        <p>• <strong>Balances de Economía:</strong> En <strong>[📋 Dossier]</strong> entrega los balances y cuentas de resultados en Google Sheets cuando se abra la fase.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('orders'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bóveda de Órdenes</button>
                    <button type="button" onclick="ui.navigate('finance'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Finanzas & ECO</button>
                    <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier</button>
                `;
                roleWarning = 'No apruebes pedidos que dejen la cuenta en 0 €v o negativo: entrar en «números rojos» (≤ 0 €v) bloquea gastos, pedidos, I+D y campañas hasta recuperar liquidez.';
                break;

            case 'MARKETING':
                roleTitle = 'DPTO. MARKETING // COMUNICACIÓN';
                roleDesc = 'Construir la identidad corporativa, redactar el slogan oficial (DOC_11) y publicar acciones promocionales (DOC_12).';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Eslogan de marca:</strong> En <strong>[🎨 Marca & MKT]</strong>, pulsa <strong>[📄 Modelo DOC_11]</strong>, redacta en Docs y elévalo al CEO.</li>
                    <li>[ ] <strong>2. Contrata paquete:</strong> Elige un pack de difusión y adjunta el dossier ROI (DOC_5) para validación de Finanzas.</li>
                    <li>[ ] <strong>3. Publica acción:</strong> Tras el visto bueno financiero, pulsa <strong>[+ Publicar Acción]</strong> con la ficha técnica DOC_12 y remite al CEO.</li>
                </ul>`;
                teamChain = `Tú formulas la creatividad publicitaria ➔ Finanzas aprueba la partida presupuestaria ➔ CEO autoriza la publicación oficial.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Subsanación de Acciones)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Subsanación CEO:</strong> Si el CEO devuelve una acción con observaciones, corrige el documento en Drive y pulsa <strong>[✏️ Subsanar Enlace y Reenviar]</strong>.</p>
                        <p>• <strong>Logotipo:</strong> El logotipo corporativo debe cumplir las normas de diseño marciano y recibir validación previa.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('brand'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Marca & MKT</button>
                    <button type="button" onclick="ui.navigate('campaigns'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Campañas</button>
                    <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier</button>
                `;
                roleWarning = 'Cada acción publicitaria requiere adjuntar la Ficha Técnica oficial (DOC_12) en Google Drive con permisos de lectura antes de entregarla al CEO.';
                break;

            case 'OPERACIONES_IA':
                roleTitle = 'DPTO. OPERACIONES E IA // TALLER';
                roleDesc = 'Gestionar la recepción física de piezas en Taller Ensamble, confeccionar la Hoja de Taller (BOM) y auditar prompts en la Bitácora de IA.';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Recepción en taller:</strong> En <strong>[📦 Taller Ensamble]</strong>, recepciona los pedidos aprobados y anota su coste en euros reales (€).</li>
                    <li>[ ] <strong>2. Confecciona BOM:</strong> Completa la Hoja de Taller (DOC_10) garantizando la trazabilidad de cada material del cohete.</li>
                    <li>[ ] <strong>3. Bitácora ética:</strong> En <strong>[🤖 Bitácora IA]</strong>, registra obligatoriamente cada prompt y herramienta de IA utilizada por el equipo.</li>
                </ul>`;
                teamChain = `Finanzas libera los fondos ➔ Tú recepcionas las piezas físicas y ensamblas en taller ➔ Registras el uso ético en la Bitácora IA.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Auditoría de IA y Taller)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Evidencias Éticas de IA:</strong> Documenta siempre el prompt, el modelo usado y la comprobación humana; el uso opaco de IA conlleva sanción.</p>
                        <p>• <strong>Entrega de Hoja de Taller:</strong> Cuando el prototipo esté montado, el Técnico eleva la Hoja de Taller completada a revisión del CEO.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('cart'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Taller Ensamble</button>
                    <button type="button" onclick="ui.navigate('ailog'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Bitácora IA</button>
                    <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier</button>
                `;
                roleWarning = 'El uso de IA no declarado en Bitácora acarrea sanción disciplinaria docente; documenta siempre el prompt, la herramienta y la respuesta verificada.';
                break;

            default: // AUXILIAR
                roleTitle = 'OBSERVADOR AUXILIAR // CALIDAD';
                roleDesc = 'Apoyar operativamente a los departamentos de la empresa, auditar permisos de Google Drive y ejercer derecho a voto en las asambleas de socios.';
                checklist3Min = `
                <ul class="space-y-1.5 text-xs text-slate-300 pl-1">
                    <li>[ ] <strong>1. Auditoría Drive:</strong> En <strong>[📋 Dossier]</strong>, abre todos los enlaces del equipo en ventana de incógnito para verificar acceso público.</li>
                    <li>[ ] <strong>2. Voto Asambleario:</strong> En <strong>[⚖️ Gobernanza]</strong>, vota en las mociones y resoluciones de socios.</li>
                    <li>[ ] <strong>3. Apoyo operativo:</strong> Ayuda al departamento que tenga mayor carga de trabajo en la sesión de hoy.</li>
                </ul>`;
                teamChain = `Auditas permisos y calidad de enlaces de Drive ➔ Respaldas al departamento con más carga ➔ Desbloqueas votaciones con tu voto.`;
                contingencyHtml = `
                <details class="bg-black/60 border border-slate-800 p-2.5 rounded text-xs mt-3">
                    <summary class="cursor-pointer text-mars-cyan font-bold uppercase select-none">⚙️ Procedimientos Especiales (Rol Asignado)</summary>
                    <div class="mt-2 space-y-2 text-slate-300 border-t border-slate-800 pt-2 leading-relaxed">
                        <p>• <strong>Vinculación Departamental Plena:</strong> Cuando Coordinación te vincula a un departamento, heredas sus mismas herramientas operativas, envíos, autorizaciones y notificaciones (mostrando <code>AUXILIAR (DPTO)</code> en tu HUD) mientras conservas tu propio PIN y voto personal en Asamblea.</p>
                    </div>
                </details>`;
                roleButtons = `
                    <button type="button" onclick="ui.navigate('dossier'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Dossier</button>
                    <button type="button" onclick="ui.navigate('resolutions'); ui.closeModal();" class="text-xs bg-mars-cyan text-black px-3.5 py-2 font-bold font-mono uppercase rounded min-h-[44px]">Ir a Gobernanza</button>
                `;
                roleWarning = 'Tu misión esencial es el control de calidad de accesos en Google Drive y el desbloqueo de decisiones asamblearias.';
                break;
        }

        return `
        <div class="space-y-4 font-mono text-xs leading-relaxed text-slate-200">
            <!-- 1. Tarjeta de Misión y Checklist de Entrada (3 Minutos) -->
            <div class="bg-mars-cyan/10 border-l-4 border-mars-cyan p-3.5 bg-slate-950">
                <div class="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                    <span class="text-xs font-black uppercase text-mars-cyan tracking-wider">🎯 PUESTO: ${roleTitle}</span>
                    <span class="text-[10px] bg-black text-mars-green border border-mars-green/40 px-2 py-0.5 font-bold uppercase">FICHA OPERATIVA</span>
                </div>
                <p class="text-white text-xs font-semibold leading-relaxed mb-3">${roleDesc}</p>

                <!-- Bloque 3 Minutos -->
                <div class="bg-slate-900/90 border border-mars-cyan/30 p-2.5 rounded mb-3">
                    <p class="text-mars-cyan font-black uppercase text-[11px] mb-1.5 flex items-center gap-1.5">
                        <span>⚡ TU MISIÓN EN 3 MINUTOS (CHECKLIST DE ENTRADA):</span>
                    </p>
                    ${checklist3Min}
                </div>

                <!-- Bloque Cadena en Equipo -->
                <div class="bg-black/60 border border-slate-800 p-2.5 rounded mb-3 text-xs text-slate-300">
                    <span class="text-mars-yellow font-bold uppercase text-[10px] block mb-1">🔄 CADENA DE TRABAJO EN EQUIPO:</span>
                    <p class="text-white font-mono text-[11px] leading-relaxed">${teamChain}</p>
                </div>

                <div class="pt-1 flex flex-wrap gap-2">
                    ${roleButtons}
                </div>
            </div>

            <!-- 2. Entregables Asignados a tu Puesto -->
            <div class="bg-slate-950 border border-slate-800 p-3.5">
                <p class="text-mars-cyan font-bold uppercase text-xs mb-2 flex items-center gap-1.5">
                    <span>📁 Entregables Asignados a tu Puesto:</span>
                </p>
                <ul class="space-y-1.5 pl-1">
                    ${roleDeliverablesHtml}
                </ul>
            </div>

            <!-- 3. Contingencias y Procedimientos Especiales (Desplegable) -->
            ${contingencyHtml}

            <!-- 4. Aviso Clave -->
            <div class="bg-slate-900/80 border border-amber-400/40 p-3.5 text-xs text-slate-300 space-y-1">
                <p class="text-amber-400 font-bold uppercase text-xs mb-1">⚠️ Aviso Clave:</p>
                <p>${roleWarning}</p>
                <p class="text-[11px] text-slate-400 pt-1 border-t border-slate-800">Recuerda: Prohibido usar nombres reales (política Zero-PII). Todos los documentos deben ir en enlaces públicos de Google Drive.</p>
            </div>
        </div>`;
    },

    showOnboarding() {
        if (sessionStorage.getItem('hideWelcome')) return;
        this._lastFocusedElement = document.activeElement;
        let role = state.user ? state.user.role : '';
        if (state.user && state.user.admin) {
            role = 'DOCENTE';
        } else if (state.user) {
            const co = state.data.companies?.[state.user.coId];
            const eff = this.getEffectiveRole(co);
            if (role === 'AUXILIAR' && eff && eff !== 'AUXILIAR') role = eff;
        }
        
        const elTitle = document.getElementById('onboarding-title');
        if(elTitle) {
            const rawRole = state.user?.role || '';
            const titleLabel = (!state.user?.admin && rawRole === 'AUXILIAR' && role !== 'AUXILIAR')
                ? `AUXILIAR (${role.replace('_',' ')})`
                : role.replace('_',' ');
            elTitle.innerText = role === 'DOCENTE' ? 'CENTRO DE CONTROL DOCENTE 🎓' : `BIENVENIDA // ${titleLabel} 🚀`;
        }
        
        let content = '';
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
            const d1StatusText = state.isCloudOnline ? 'EN LÍNEA' : 'MODO LOCAL';
            const d1StatusColor = state.isCloudOnline ? 'text-mars-green border-mars-green/60 bg-mars-green/10' : 'text-mars-yellow border-mars-yellow/60 bg-mars-yellow/10';

            content = `
            <div class="space-y-3 font-mono text-xs leading-relaxed text-slate-200">
                <div class="bg-slate-950 border border-mars-cyan/60 p-3.5 space-y-2.5">
                    <div class="flex justify-between items-center border-b border-slate-800 pb-1.5 flex-wrap gap-2">
                        <span class="text-xs font-orbitron font-black text-mars-cyan uppercase tracking-wider">📡 Estado de la Sesión de Aula</span>
                        <span class="text-xs font-bold uppercase px-2 py-0.5 border ${d1StatusColor}">[${d1StatusText}]</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2 text-center text-xs">
                        <div class="bg-slate-900 border border-slate-800 p-2">
                            <span class="block text-mars-cyan font-orbitron font-black text-base">${totalCos}</span>
                            <span class="text-slate-300 uppercase text-[10px]">Startups</span>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 p-2">
                            <span class="block text-mars-magenta font-orbitron font-black text-base">${totalCustoms}</span>
                            <span class="text-slate-300 uppercase text-[10px]">Aduanas/Trámites</span>
                        </div>
                        <div class="bg-slate-900 border border-slate-800 p-2">
                            <span class="block text-mars-yellow font-orbitron font-black text-base">${upcomingCount}/${defs.length}</span>
                            <span class="text-slate-300 uppercase text-[10px]">Plazos Activos</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 p-3 space-y-2">
                    <p class="text-mars-yellow font-bold uppercase text-xs flex items-center gap-1.5">
                        <span>⚡ Rutina de Aula en 3 Clics para Profesores:</span>
                    </p>
                    <ol class="space-y-1.5 text-xs text-slate-300 pl-4 list-decimal">
                        <li><strong>1. Asistente Contextual:</strong> En <strong class="text-mars-cyan">📝 Rúbricas y Entregas</strong>, el monitor <em>"¿Qué me toca hacer hoy?"</em> detecta tu materia y fase activa, y te lleva con el botón <strong class="text-mars-cyan">[⚡ Evaluar siguiente pendiente ➔]</strong>.</li>
                        <li><strong>2. Filtra por Avisos 🟡 N:</strong> Pulsa sobre las clases que muestren un aviso amarillo pulsante (<code>🟡 N</code>) con entregas listas, abre el Google Doc y califica (0 a 10) o pulsa <strong class="text-red-400">[↩ Subsanar]</strong> si faltan apartados.</li>
                        <li><strong>3. Aduanas y Misiones:</strong> En <strong class="text-mars-cyan">🛃 Validaciones y Aduana</strong> autoriza licencias AESA (FYQ), campañas (LYE) o mercado B2B, y en <strong class="text-mars-cyan">🤝 Contratos</strong> liquida misiones comerciales.</li>
                    </ol>
                </div>

                <div class="pt-1 flex flex-col sm:flex-row gap-2">
                    <button type="button" onclick="ui.closeOnboarding(); ui.adminTab='eval'; ui.navigate('admin');" class="min-h-[44px] flex-1 bg-mars-cyan text-black font-black uppercase text-xs py-2 px-3 tracking-wider hover:bg-white transition-all text-center">
                        [ 📝 EVALUAR Y RÚBRICAS ]
                    </button>
                    <button type="button" onclick="ui.closeOnboarding(); ui.adminTab='dash'; ui.navigate('admin');" class="min-h-[44px] flex-1 bg-mars-yellow text-black font-black uppercase text-xs py-2 px-3 tracking-wider hover:bg-white transition-all text-center">
                        [ 🛃 ADUANA &amp; TRÁMITES ]
                    </button>
                    <button type="button" onclick="ui.closeOnboarding(); ui.showGuide('DOCENTE');" class="min-h-[44px] flex-1 bg-slate-800 border border-slate-600 text-white font-bold uppercase text-xs py-2 px-3 tracking-wider hover:bg-slate-700 transition-all text-center">
                        [ ❓ MANUAL DOCENTE ]
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
            const coName = co?.name || 'TU EMPRESA';

            content = `
            <div class="space-y-3 font-mono text-xs leading-relaxed text-slate-200">
                <!-- Estado Activo -->
                <div class="bg-slate-950 border border-mars-cyan/60 p-3 space-y-2">
                    <div class="flex justify-between items-center border-b border-slate-800 pb-1.5 flex-wrap gap-1">
                        <span class="font-orbitron font-black text-mars-cyan uppercase tracking-wider">${this.escapeHTML(coName)}</span>
                        <span class="text-mars-green font-bold uppercase text-[11px]">[SESIÓN ACTIVA: ${role.replace('_', ' ')}]</span>
                    </div>
                    <div class="bg-slate-900 border border-slate-800 p-2.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <span class="text-mars-yellow font-bold uppercase block">Próximo Entregable (${this.escapeHTML(effectiveRole)}):</span>
                            <span class="text-slate-200">${nextPending ? this.escapeHTML(nextPending.shortName || nextPending.name) : '¡Todos los entregables de tu departamento están registrados!'}</span>
                        </div>
                        ${dlBadge ? `<span class="px-2 py-1 font-black uppercase text-xs shrink-0 ${dlBadge.class}">${this.escapeHTML(dlBadge.text)}</span>` : ''}
                    </div>
                </div>

                <!-- 3 Reglas Básicas -->
                <div class="bg-slate-900 border border-slate-800 p-3 space-y-1.5">
                    <p class="text-mars-cyan font-bold uppercase text-xs mb-1">⚡ Reglas Básicas de Operación:</p>
                    <p>1. <strong>Documentos:</strong> Usa el botón <strong>[📄 Modelo de documento (Hacer copia)]</strong> y comparte en <strong>Google Drive</strong> con permisos de lectura abiertos.</p>
                    <p>2. <strong>Privacidad:</strong> No escribas nombres reales, apellidos ni teléfonos. Opera siempre con tu rol de equipo.</p>
                    <p>3. <strong>Inteligencia Artificial:</strong> Cualquier uso de IA debe anotarse en la pestaña <strong>[🤖 Bitácora IA]</strong>.</p>
                </div>

                <!-- Botón de apertura de guía bajo demanda -->
                <div class="pt-1">
                    <button type="button" onclick="ui.closeOnboarding(); ui.showGuide('${role}');" class="min-h-[44px] w-full bg-mars-cyan/20 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs py-2 px-3 tracking-wider transition-all text-center">
                        [ ❓ ABRIR GUÍA OPERATIVA DE MI PUESTO ]
                    </button>
                </div>
            </div>`;
        }

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
        let html = `<div class="space-y-4 font-mono text-xs">`;
        
        if (logs.length === 0) {
            html += `<p class="text-slate-300 italic">No hay registros de versión disponibles.</p>`;
        } else {
            const renderLogCard = (log) => {
                const items = log.highlights || (log.items ? log.items.map(t => ({ type: "MEJORA", text: t })) : []);
                const itemsHtml = items.map(h => {
                    let badgeClass = 'bg-mars-cyan/20 text-mars-cyan border-mars-cyan';
                    if (h.type === 'NUEVO') badgeClass = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (h.type === 'MEJORA') badgeClass = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow';
                    if (h.type === 'FIX') badgeClass = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';
                    if (h.type === 'SISTEMA') badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500';
                    if (h.type === 'ZERO-TEXT') badgeClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500';
                    if (h.type === 'SEGURIDAD') badgeClass = 'bg-purple-500/20 text-purple-400 border-purple-500';
                    
                    return `
                    <li class="flex items-start gap-2.5 pb-2 border-b border-slate-800/80 last:border-0">
                        <span class="text-xs font-black uppercase px-1.5 py-0.5 border shrink-0 mt-0.5 ${badgeClass}">${this.escapeHTML(h.type)}</span>
                        <span class="text-slate-200 text-xs leading-relaxed">${this.escapeHTML(h.text)}</span>
                    </li>`;
                }).join('');

                return `
                <div class="bg-slate-900/90 border border-mars-border p-4 mb-3">
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
            };

            const recentLogs = logs.slice(0, 3);
            const olderLogs = logs.slice(3);

            recentLogs.forEach(log => {
                html += renderLogCard(log);
            });

            if (olderLogs.length > 0) {
                html += `
                <details class="mt-4 border border-slate-800 p-3 bg-black/40 group">
                    <summary class="cursor-pointer text-xs text-mars-yellow uppercase font-bold select-none min-h-[44px] flex items-center justify-between">
                        <span>Ver versiones históricas anteriores (${olderLogs.length})...</span>
                        <span class="text-xs text-slate-300 font-mono group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div class="mt-3 pt-3 border-t border-slate-800 space-y-3">
                        ${olderLogs.map(renderLogCard).join('')}
                    </div>
                </details>`;
            }
        }
        html += `</div>`;
        this.showModal("Registro de Novedades y Versiones", html, "");
    },

    switchGuideRole(role) {
        let targetRole = role || 'CEO';
        if (targetRole === 'OPERACIONES') targetRole = 'OPERACIONES_IA';
        if (targetRole === 'SECRETARIO') targetRole = 'AUXILIAR';
        if (state.user && !state.user.admin && targetRole === 'DOCENTE') {
            targetRole = (state.user && state.user.role) || 'CEO';
            if (targetRole === 'OPERACIONES') targetRole = 'OPERACIONES_IA';
            if (targetRole === 'SECRETARIO') targetRole = 'AUXILIAR';
        }
        const container = document.getElementById('guide-role-content');
        if (container) {
            container.innerHTML = this.getOnboardingContent(targetRole);
        }
        document.querySelectorAll('.guide-role-pill').forEach(btn => {
            const r = btn.getAttribute('data-role');
            const isMatch = (r === targetRole) || (targetRole === 'OPERACIONES_IA' && r === 'OPERACIONES') || (targetRole === 'AUXILIAR' && r === 'SECRETARIO');
            if (isMatch) {
                btn.className = 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-mars-cyan text-black border border-mars-cyan transition-all shadow-[0_0_8px_rgba(0,240,255,0.4)] shrink-0 whitespace-nowrap';
                btn.setAttribute('aria-selected', 'true');
            } else {
                btn.className = 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition-all shrink-0 whitespace-nowrap';
                btn.setAttribute('aria-selected', 'false');
            }
        });
    },

    showGuide(defaultRole = null) {
        const currentVer = typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.1.44';
        let initialRole = defaultRole;
        if (!initialRole) {
            if (state.user) {
                if (state.user.admin) {
                    initialRole = 'DOCENTE';
                } else {
                    const co = state.data.companies?.[state.user.coId];
                    initialRole = this.getEffectiveRole(co) || state.user.role;
                }
            } else {
                initialRole = 'CEO';
            }
        }
        if (initialRole === 'OPERACIONES') initialRole = 'OPERACIONES_IA';
        if (initialRole === 'SECRETARIO') initialRole = 'AUXILIAR';

        let rolesList = [
            { key: 'CEO', label: '👑 CEO' },
            { key: 'TECNICO', label: '🧪 TÉCNICO' },
            { key: 'FINANZAS', label: '💰 FINANZAS' },
            { key: 'MARKETING', label: '📢 MARKETING' },
            { key: 'OPERACIONES_IA', label: '🤖 OPS & IA' },
            { key: 'AUXILIAR', label: '👁️ AUXILIAR' },
            { key: 'DOCENTE', label: '🎓 DOCENTE' }
        ];

        if (state.user && !state.user.admin) {
            rolesList = rolesList.filter(r => r.key !== 'DOCENTE');
            if (initialRole === 'DOCENTE') {
                initialRole = state.user.role || 'CEO';
            }
        }

        const pillsHtml = rolesList.map(r => {
            const isSelected = r.key === initialRole;
            const cls = isSelected
                ? 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-mars-cyan text-black border border-mars-cyan transition-all shadow-[0_0_8px_rgba(0,240,255,0.4)] shrink-0 whitespace-nowrap'
                : 'guide-role-pill min-h-[44px] px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-slate-900 text-slate-300 border border-slate-700 hover:text-white hover:border-slate-500 transition-all shrink-0 whitespace-nowrap';
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
                <p class="text-slate-300 text-xs">Simulación de emprendimiento aeroespacial interdisciplinar (AEE / ESA). Fichas de Primeros Pasos por puesto operativo.</p>
            </div>

            <!-- Selector de Roles -->
            <div>
                <p class="text-mars-cyan font-bold uppercase text-xs mb-2">Selecciona un Rol Operativo para ver su Manual:</p>
                <div role="tablist" aria-label="Manuales de Rol" class="flex flex-wrap gap-2 pb-3 border-b border-slate-800">
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
        const isDocente = Boolean(state.user && state.user.admin);
        const filteredSuggs = allSuggs.filter(s => {
            if (isDocente) return s.coId === 'DOCENTE' || (s.author && s.author.includes('DOCENTE'));
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
                ${s.driveUrl ? `<a href="${this.escapeHTML(s.driveUrl)}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-mars-cyan hover:underline font-mono inline-flex items-center gap-1 mt-1 pl-2">📄 Evidencia Drive ↗</a>` : ''}
            </div>`;
        }).join('') || '<p class="text-slate-300 italic text-xs">No has enviado reportes desde esta entidad todavía.</p>';

        let inputFieldsHtml = '';
        if (isDocente) {
            inputFieldsHtml = `
            <label for="sugg-text" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Descripción del reporte</label>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-base sm:text-xs text-white h-24 focus:border-mars-yellow outline-none mb-3" placeholder="Describe el reporte... (El uso de lenguaje ofensivo o nombres propios bloqueará el envío)"></textarea>
            <label for="sugg-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mb-1">Enlace Opcional de Google Drive / Docs</label>
            <input type="url" id="sugg-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/50 p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-cyan mb-4">
            `;
        } else {
            const topics = typeof STUDENT_SUGGESTION_TOPICS_DEF !== 'undefined' ? STUDENT_SUGGESTION_TOPICS_DEF : [];
            inputFieldsHtml = `
            <div class="mb-3">
                <label for="sugg-topic" class="text-xs text-mars-yellow font-bold uppercase block mb-1.5">Motivo Estandarizado de la Consulta (Política Zero-Text)</label>
                <select id="sugg-topic" class="w-full bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-yellow min-h-[44px]">
                    ${topics.map(t => `<option value="${this.escapeHTML(t.label)}">${this.escapeHTML(t.label)}</option>`).join('')}
                </select>
            </div>
            <div class="mb-3">
                <label for="sugg-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mb-1.5">Memoria / Captura Detallada en Google Drive (URL Obligatoria)</label>
                <input type="url" id="sugg-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/50 p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-cyan" required>
                <p class="text-[10px] text-slate-400 mt-1">Por directiva de privacidad y política Zero-Text, no se admite texto libre. Desarrolla la consulta o adjunta la captura en tu Google Drive corporativo.</p>
            </div>
            `;
        }

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
            ${inputFieldsHtml}
            <div class="bg-black/60 border border-slate-800 p-3 max-h-44 overflow-y-auto">
                <h4 class="text-mars-cyan text-xs uppercase font-bold mb-2 border-b border-slate-800 pb-1">Mis Envíos Recientes (Privado)</h4>
                ${history}
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitSuggestion()" class="bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-white transition-all min-h-[44px]">Transmitir a Buzón Dev</button>`;
        this.showModal("Canal Directo con Desarrollo (Buzón Alex)", html, actions);
    },

    submitSuggestion() {
        const isDocente = Boolean(state.user && state.user.admin);
        const elCat = document.getElementById('sugg-category');
        const elUrl = document.getElementById('sugg-drive-url');
        const category = elCat ? elCat.value : 'MEJORA';
        const driveUrl = elUrl ? this.cleanInput(elUrl.value) : '';

        let text = '';
        if (isDocente) {
            const elText = document.getElementById('sugg-text');
            if (!elText) return;
            text = this.cleanInput(elText.value);
            if (text.length < 5) return this.notify("Describe tu reporte con más detalle (mínimo 5 caracteres).", "warning");

            // WP3: Filtro activo anti-PII en Cliente (Nombres, emails, teléfonos, DNIs)
            const piiCheck = this.validateZeroPII(text);
            if (!piiCheck.clean) {
                this.highlightInvalidField(text, elText);
                this.notify("Envío bloqueado: Se han detectado datos identificativos personales", "error");
                return;
            }
            if (this.hasForbiddenWords(text, 'Buzón de Sugerencias', elText)) return;
        } else {
            const elTopic = document.getElementById('sugg-topic');
            if (!elTopic) return;
            text = this.cleanInput(elTopic.value);
            if (!driveUrl) return this.notify("Debes adjuntar el enlace de Google Drive o Docs con la evidencia.", "warning");
            if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
                return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
            }
        }

        if (driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace de Google Drive no tiene un formato válido.", "error");
        }
        
        const coId = state.user ? (isDocente ? 'DOCENTE' : state.user.coId) : 'ANON';
        const entityName = isDocente ? 'CLAUSTRO DOCENTE' : (state.data.companies[coId]?.name || 'STARTUP');
        const author = state.user ? `${state.user.role} (${entityName})` : 'ANÓNIMO';
        
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.suggestionsToAlex.unshift({ 
            id: 'SUG-' + Date.now(), coId: coId, category: category, status: 'RECIBIDO',
            author: author, text: text, driveUrl: driveUrl, date: new Date().toLocaleString() 
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
                        <button type="button" onclick="ui.confirmAction('Eliminar Consulta', '¿Estás seguro de que deseas eliminar permanentemente esta consulta o sugerencia?', () => { ui.deleteSuggestion('${this.escapeHTML(sugg.id)}'); ui.modalCoordinatorInbox('${filterCategory}'); }, 'Eliminar', true);" aria-label="Eliminar reporte" class="min-h-[44px] px-2.5 bg-black text-mars-magenta border border-mars-magenta/40 hover:bg-mars-magenta hover:text-white font-black text-xs transition-all">✕</button>
                    </div>
                </div>
                <p class="text-slate-200 italic mb-2 bg-black/60 p-2.5 border border-slate-800 break-words font-mono">"${this.escapeHTML(sugg.text)}"</p>
                ${sugg.driveUrl ? `
                <div class="mb-2">
                    <a href="${this.escapeHTML(sugg.driveUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-mars-cyan hover:underline font-mono bg-mars-cyan/10 px-2.5 py-1.5 border border-mars-cyan/40 min-h-[44px]">
                        <span>📄 Abrir Evidencia / Detalle en Google Drive ↗</span>
                    </a>
                </div>` : ''}
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
            <div class="pt-2 flex flex-wrap gap-2 justify-between items-center border-t border-slate-800">
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="ui.modalSuggestion()" class="min-h-[44px] bg-slate-800 border border-slate-600 text-white font-bold px-4 py-2 text-xs uppercase hover:bg-white hover:text-black transition-all">
                        + Redactar Nuevo Mensaje
                    </button>
                    ${state.user?.admin ? `
                    <button type="button" onclick="ui.confirmAction('Purgar Mensajes', '¿Deseas purgar permanentemente todos los mensajes resueltos o con más de 7 días del buzón?', () => { ui.purgeResolvedSuggestions(); ui.modalCoordinatorInbox('${filterCategory}'); }, 'Purgar', true);" class="min-h-[44px] bg-red-950/40 border border-red-500 text-red-300 font-bold px-3 py-2 text-xs uppercase hover:bg-red-700 hover:text-white transition-all">
                        🗑️ Purgar Resueltos / Antiguos
                    </button>` : ''}
                </div>
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
        const rawRole = state.user.role || '';
        const effRole = this.getEffectiveRole ? this.getEffectiveRole(co) : rawRole;
        let roleLabel = this.escapeHTML(rawRole.replace('_', ' '));
        if (rawRole === 'AUXILIAR' && effRole && effRole !== 'AUXILIAR') {
            roleLabel = `AUXILIAR (${this.escapeHTML(effRole.replace('_', ' '))})`;
        }
        const coName = this.escapeHTML(co.name);
        const numBalance = Number(co.balance || 0);
        const balanceStr = numBalance.toFixed(2);
        const isDebt = numBalance < 0;

        return `
        <div class="h-16 max-h-16 flex items-center justify-between px-2 sm:px-4 bg-[#07090E]/90 border-b border-cyan-500/20 backdrop-blur relative z-10 w-full mb-4 terminal-border overflow-hidden">
            <!-- Izquierda: Miniatura del logotipo (40x40px) + Nombre Orbitron + Badge Rol Activo -->
            <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
                <div class="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0 p-0.5 hex-clip bg-mars-bg ${isBrandPending ? 'border border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.4)]' : 'border border-mars-cyan shadow-neon-cyan'}">
                    <div class="w-full h-full hex-clip overflow-hidden">
                        <img src="${activeLogoSrc}" alt="Logo de ${coName}" width="40" height="40" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full ${hasApprovedLogo ? 'object-cover' : 'object-contain p-1 bg-black'}">
                    </div>
                </div>
                <div class="flex items-center gap-1.5 sm:gap-2">
                    <span class="company-header-title font-orbitron font-black text-xs sm:text-base text-mars-cyan tracking-wider uppercase" title="${coName}">${coName}</span>
                    <span class="bg-mars-cyan/10 border border-mars-cyan/40 text-mars-cyan text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 uppercase tracking-wider whitespace-nowrap shrink-0">${roleLabel}</span>
                </div>
            </div>

            <!-- Centro: Saldo corporativo disponible en verde neón (o rojo en deuda) font-mono -->
            <div class="flex items-center justify-center px-1 sm:px-2 shrink-0">
                <span id="hud-balance" class="${isDebt ? 'text-mars-red bg-mars-red/10 border-mars-red/30 shadow-[0_0_10px_rgba(255,0,85,0.2)]' : 'text-mars-green bg-mars-green/10 border-mars-green/30 shadow-[0_0_10px_rgba(0,255,150,0.2)]'} font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider whitespace-nowrap border px-2 sm:px-3 py-1 rounded-sm shrink-0">
                    ${balanceStr} €v
                </span>
            </div>

            <!-- Derecha: Acceso directo a la declaración de IA [ 🤖 IA ] para todos los roles de la empresa -->
            <div class="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <button type="button" onclick="ui.modalReportAI()" class="bg-cyan-950/40 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black px-2.5 sm:px-3 py-1.5 text-xs font-bold uppercase transition-all shadow-[0_0_10px_rgba(0,240,255,0.25)] min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 shrink-0 active:scale-95" title="Declaración y Registro Oficial de Uso de IA">
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

        const effectiveRole = this.getEffectiveRole(co) || state.user.role;

        const elDash = document.getElementById('badge-dashboard');
        if (elDash) {
            let pendingDash = 0;
            if (effectiveRole === 'CEO') {
                const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
                const docs = co.deliverables || {};
                const submittedCeoDefs = defs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO').length;
                const pendingPhaseBalances = Object.values(co.phaseBalances || {}).filter(b => b && b.status === 'PENDIENTE_CEO').length;
                let pendingMktActions = 0;
                (co.marketingCampaigns || []).forEach(c => {
                    (c.executedActions || []).forEach(a => {
                        if (a && a.status === 'PENDIENTE_CEO') pendingMktActions++;
                    });
                });
                const pendingSlogan = (co.brandApproval && co.brandApproval.status === 'PENDIENTE_CEO') ? 1 : 0;
                pendingDash = submittedCeoDefs + pendingPhaseBalances + pendingMktActions + pendingSlogan;
            }
            if (pendingDash > 0) { elDash.innerText = pendingDash; elDash.classList.remove('hidden'); }
            else { elDash.classList.add('hidden'); }
        }

        const elRes = document.getElementById('badge-resolutions');
        if (elRes) {
            let pendingRes = (co.votingMotions || []).filter(m => m.status === 'ABIERTA' && (!m.votes || !m.votes[state.user.role])).length;
            if (effectiveRole === 'CEO' && co.brandApproval && co.brandApproval.status === 'PENDIENTE_CEO') {
                pendingRes += 1;
            }
            if (pendingRes > 0) { elRes.innerText = pendingRes; elRes.classList.remove('hidden'); }
            else { elRes.classList.add('hidden'); }
        }

        const elOrders = document.getElementById('badge-orders');
        if (elOrders) {
            let pendingOrders = 0;
            if (effectiveRole === 'FINANZAS') {
                const iDOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
                const mktOrders = (co.marketingCampaigns || []).filter(m => m.status === 'PENDIENTE_FINANZAS').length;
                const b2bSales = (state.data.b2bMarket || []).filter(o => o && o.sellerCoId === state.user.coId && o.status === 'PENDIENTE_FINANZAS').length;
                pendingOrders = iDOrders + mktOrders + b2bSales;
            } else if (effectiveRole === 'TECNICO') {
                pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'PENDIENTE_DOCENTE').length;
            } else if (effectiveRole === 'CEO') {
                pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS').length;
            }
            if (pendingOrders > 0) { elOrders.innerText = pendingOrders; elOrders.classList.remove('hidden'); }
            else { elOrders.classList.add('hidden'); }
        }

        const elFinance = document.getElementById('badge-finance');
        if (elFinance) {
            let pendingFin = 0;
            if (effectiveRole === 'FINANZAS') {
                const pendingOrdersList = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
                const pendingB2BSales = (state.data.b2bMarket || []).filter(o => o && o.sellerCoId === state.user.coId && o.status === 'PENDIENTE_FINANZAS').length;
                const pendingMktPacks = (co.marketingCampaigns || []).filter(c => c.status === 'PENDIENTE_FINANZAS').length;
                const returnedBalances = Object.values(co.phaseBalances || {}).filter(b => b && b.status === 'RETURNED_BY_CEO').length;
                pendingFin = pendingOrdersList + pendingB2BSales + pendingMktPacks + returnedBalances;
            }
            if (pendingFin > 0) { elFinance.innerText = pendingFin; elFinance.classList.remove('hidden'); }
            else { elFinance.classList.add('hidden'); }
        }

        const elDossier = document.getElementById('badge-dossier');
        if (elDossier) {
            let pendingDossier = 0;
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            if (effectiveRole === 'CEO') {
                pendingDossier = Object.values(co.deliverables || {}).filter(d => d && d.status === 'SUBMITTED_TO_CEO').length;
            } else {
                const myDefs = (effectiveRole === 'OPERACIONES_IA')
                    ? defs.filter(d => d.role === 'OPERACIONES_IA' || d.role === 'OPERACIONES').map(d => d.key)
                    : defs.filter(d => d.role === effectiveRole).map(d => d.key);
                pendingDossier = Object.entries(co.deliverables || {}).filter(([k, d]) => myDefs.includes(k) && d && d.status === 'CEO_REVISION').length;
            }
            if (pendingDossier > 0) { elDossier.innerText = pendingDossier; elDossier.classList.remove('hidden'); }
            else { elDossier.classList.add('hidden'); }
        }

        const elDeliverables = document.getElementById('badge-deliverables');
        if (elDeliverables) {
            let pendingDeliverables = 0;
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const role = state.user.role;
            const myDefs = (effectiveRole === 'CEO' || (role === 'AUXILIAR' && !co?.auxRoleDept))
                ? defs.map(d => d.key)
                : (effectiveRole === 'OPERACIONES_IA'
                    ? defs.filter(d => d.role === 'OPERACIONES_IA' || d.role === 'OPERACIONES').map(d => d.key)
                    : defs.filter(d => d.role === effectiveRole).map(d => d.key));

            if (effectiveRole === 'CEO') {
                pendingDeliverables = Object.values(co.deliverables || {}).filter(d => d && d.status === 'SUBMITTED_TO_CEO').length;
            } else {
                pendingDeliverables = Object.entries(co.deliverables || {}).filter(([k, d]) => myDefs.includes(k) && d && (d.status === 'CEO_REVISION' || d.status === 'DEVUELTO_A_TECNICO')).length;
            }
            if (pendingDeliverables > 0) {
                elDeliverables.innerText = pendingDeliverables;
                elDeliverables.classList.remove('hidden');
            } else {
                elDeliverables.classList.add('hidden');
            }
        }

        const elWorkshop = document.getElementById('badge-workshop');
        if (elWorkshop) {
            let workshopAlerts = 0;
            const hoja = co.deliverables?.hoja_taller_fyq;
            if (effectiveRole === 'TECNICO' && hoja && (hoja.status === 'DEVUELTO_A_TECNICO' || hoja.status === 'CEO_REVISION')) {
                workshopAlerts++;
            } else if (effectiveRole === 'OPERACIONES_IA' && hoja && (hoja.status === 'EN_TALLER_OPERARIO' || hoja.status === 'CEO_REVISION')) {
                workshopAlerts++;
            }
            if (workshopAlerts > 0) {
                elWorkshop.innerText = workshopAlerts;
                elWorkshop.classList.remove('hidden');
            } else {
                elWorkshop.classList.add('hidden');
            }
        }

        const elCart = document.getElementById('badge-cart');
        if (elCart) {
            const pendingLogistics = (co.orders || []).filter(o => (o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE') && o.type !== 'MARKETING').length;
            const pendingHojaTaller = (co.deliverables?.hoja_taller_fyq?.status === 'EN_TALLER_OPERARIO' || co.deliverables?.hoja_taller_fyq?.status === 'CEO_REVISION') ? 1 : 0;
            const totalCartAlerts = pendingLogistics + pendingHojaTaller;
            if (totalCartAlerts > 0) { elCart.innerText = totalCartAlerts; elCart.classList.remove('hidden'); }
            else { elCart.classList.add('hidden'); }
        }

        const elCampaigns = document.getElementById('badge-campaigns');
        if (elCampaigns) {
            let pendingCampaigns = 0;
            if (effectiveRole === 'MARKETING') {
                (co.marketingCampaigns || []).forEach(c => {
                    (c.executedActions || []).forEach(a => {
                        if (a && a.status === 'RECHAZADO_CEO') pendingCampaigns++;
                    });
                });
            }
            if (pendingCampaigns > 0) { elCampaigns.innerText = pendingCampaigns; elCampaigns.classList.remove('hidden'); }
            else { elCampaigns.classList.add('hidden'); }
        }

        const elAILog = document.getElementById('badge-ailog');
        if (elAILog) {
            const pendingAI = (co.aiPrompts || []).filter(p => p.status === 'PENDIENTE_VALIDACION').length;
            if (pendingAI > 0) { elAILog.innerText = pendingAI; elAILog.classList.remove('hidden'); }
            else { elAILog.classList.add('hidden'); }
        }

        const elMarket = document.getElementById('badge-market');
        if (elMarket) {
            const cartItems = (co.cart || []).length;
            if (cartItems > 0) {
                elMarket.innerText = cartItems;
                elMarket.classList.remove('hidden');
            } else {
                elMarket.classList.add('hidden');
            }
        }
    },

    isValidDriveUrl(url) {
        const clean = String(url || '').trim();
        if (!clean) return false;
        return typeof GOOGLE_DRIVE_REGEX !== 'undefined'
            ? GOOGLE_DRIVE_REGEX.test(clean)
            : /^https:\/\/(docs|drive)\.google\.com\//i.test(clean);
    },

    sanitizeDriveUrl(url) {
        const clean = String(url || '').trim();
        if (!this.isValidDriveUrl(clean)) return '';
        return encodeURI(clean).replace(/"/g, '&quot;');
    },

    isCompanyBankrupt(coOrId = null) {
        if (state.user?.admin) return false;
        const targetCo = coOrId || (state.user?.coId ? state.data?.companies?.[state.user.coId] : null);
        return typeof state.isCompanyBankrupt === 'function' ? state.isCompanyBankrupt(targetCo) : (Boolean(targetCo) && Number(targetCo.balance) <= 0);
    },

    notifyBankruptcyLock() {
        const co = state.user?.coId ? state.data?.companies?.[state.user.coId] : null;
        const bal = co ? Number(co.balance).toFixed(2) : '0.00';
        return this.notify(`🚨 CUENTA BLOQUEADA EN NÚMEROS ROJOS (${bal} €v ≤ 0 €v): No puedes comprar, autorizar gastos ni tramitar pagos hasta recuperar liquidez (> 0 €v) con Contratos, Patrocinios o ventas B2B.`, 'error');
    },

    renderBankruptcyAlertBanner(co) {
        if (!co || state.user?.admin || Number(co.balance) > 0) return '';
        const effRole = this.getEffectiveRole ? this.getEffectiveRole(co) : (state.user?.role || '');
        const balNum = Number(co.balance || 0);
        const balStr = balNum.toFixed(2);
        const statusWord = balNum < 0 ? 'SALDO NEGATIVO (DEUDA)' : 'SALDO AGOTADO (0.00 €v)';
        const showTechSellBtn = effRole === 'TECNICO';
        return `
        <div id="bankruptcy-lock-banner" class="terminal-border bg-red-950/75 border-2 border-red-500 p-4 sm:p-5 mb-6 shadow-[0_0_24px_rgba(239,68,68,0.28)]" role="alert">
            <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div class="space-y-1.5 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-red-500 text-black font-mono">🚨 BLOQUEO POR NÚMEROS ROJOS</span>
                        <span class="px-2 py-0.5 text-xs font-mono font-bold uppercase bg-black/70 border border-red-400 text-red-300">${statusWord}: ${balStr} €v</span>
                    </div>
                    <h3 class="font-orbitron text-sm sm:text-base font-black text-white uppercase">Operaciones de Gasto Congeladas Hasta Recuperar Liquidez (&gt; 0 €v)</h3>
                    <p class="text-xs text-slate-200 leading-relaxed font-sans">
                        Con saldo menor o igual a <strong>0 €v</strong> no se pueden realizar compras B2C/B2B, enviar o autorizar pedidos, solicitar material I+D, contratar campañas de Marketing ni abonar tasas administrativas.
                    </p>
                    <p class="text-xs text-amber-300 font-sans">
                        💡 <strong>Cómo salir de números rojos:</strong> Completa y cobra <strong>Contratos Comerciales</strong>, consigue un <strong>Patrocinio</strong> docente o vende componentes excedentes en el <strong>Mercado B2B</strong>.
                    </p>
                </div>
                <div class="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                    <button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] flex-1 sm:flex-initial bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all whitespace-nowrap">🤝 Ir a Contratos</button>
                    ${showTechSellBtn ? `<button type="button" onclick="ui.navigate('tech_workshop')" class="min-h-[44px] flex-1 sm:flex-initial bg-mars-yellow text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all whitespace-nowrap">🔧 Vender Excedentes</button>` : ''}
                </div>
            </div>
        </div>`;
    },

    updateHUD() {
        if(!state.user) return;
        const verEl = document.getElementById('hud-version');
        if (verEl && typeof APP_VERSION !== 'undefined') verEl.innerText = `v${APP_VERSION}`;
        const footVerEl = document.getElementById('footer-version');
        if (footVerEl && typeof APP_VERSION !== 'undefined') footVerEl.innerText = `v${APP_VERSION}`;

        const phaseBadge = document.getElementById('hud-phase-badge');
        if (phaseBadge) {
            const studentCo = (!state.user.admin && state.user.coId && state.data?.companies?.[state.user.coId])
                ? state.data.companies[state.user.coId]
                : null;
            const m = this.getPhaseClockMetrics(studentCo);
            if (studentCo && m.isDanger) {
                phaseBadge.className = 'font-mono font-black text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-red-950/90 border border-red-400 text-amber-300 whitespace-nowrap shadow-[0_0_10px_rgba(255,0,85,0.45)] animate-pulse';
                phaseBadge.innerText = `⚠️ FASE ${m.phaseInfo.key} • ${m.daysRemaining}d`;
                phaseBadge.title = `¡FASE EN PELIGRO! Quedan ${m.daysRemaining} día(s) y faltan ${m.pendingDeliverablesCount} entregable(s) (${m.phaseInfo.deadline})`;
            } else if (studentCo && m.isAllDoneSafe) {
                phaseBadge.className = 'font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-400 text-emerald-300 whitespace-nowrap shadow-[0_0_8px_rgba(0,255,102,0.3)]';
                phaseBadge.innerText = `✅ FASE ${m.phaseInfo.key} AL DÍA`;
                phaseBadge.title = `${m.phaseInfo.name} — Todos los entregables de fase completados (${m.phaseInfo.deadline})`;
            } else if (state.user.admin && m.inCriticalWindow) {
                phaseBadge.className = 'font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-amber-950/70 border border-amber-400 text-amber-300 whitespace-nowrap shadow-[0_0_8px_rgba(251,191,36,0.3)]';
                phaseBadge.innerText = `⏰ FASE ${m.phaseInfo.key} • ${m.daysRemaining}d`;
                phaseBadge.title = `${m.phaseInfo.name} — Cierre inminente: ${m.phaseInfo.deadline}`;
            } else {
                phaseBadge.className = 'font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-mars-cyan/15 border border-mars-cyan text-mars-cyan whitespace-nowrap shadow-[0_0_8px_rgba(0,240,255,0.25)]';
                phaseBadge.innerText = `FASE ${m.phaseInfo.key}`;
                phaseBadge.title = `${m.phaseInfo.name} — Cierre estimado: ${m.phaseInfo.deadline}`;
            }
        }

        if (typeof localStorage !== 'undefined') {
            this.updateZoomButtonUI(localStorage.getItem('marsket_text_zoom') || 'normal');
        }

        const balEl = document.getElementById('hud-balance');
        const infoEl = document.getElementById('hud-info');
        const cloudEl = document.getElementById('hud-cloud-status');
        const miniLogo = document.getElementById('hud-mini-logo');
        const tacticalRow = document.getElementById('hud-tactical-row');
        const sandboxBadgeEl = document.getElementById('hud-sandbox-badge');
        
        if (state.user.admin) {
            if(tacticalRow) tacticalRow.classList.remove('hidden');
            if(sandboxBadgeEl) {
                sandboxBadgeEl.classList.add('hidden');
                sandboxBadgeEl.innerText = '';
            }
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
            if(tacticalRow) tacticalRow.classList.remove('hidden');
            if(co && balEl) {
                const balVal = Number(co.balance) || 0;
                if (balVal <= 0) {
                    balEl.className = 'text-red-300 font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider whitespace-nowrap bg-red-950/80 border border-red-500 px-2 sm:px-3 py-1 rounded-sm shadow-[0_0_12px_rgba(255,0,0,0.4)] shrink-0 animate-pulse';
                    balEl.innerText = `${balVal.toFixed(2)} €v (BLOQUEADO)`;
                } else {
                    balEl.className = 'text-mars-green font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider whitespace-nowrap bg-mars-green/10 border border-mars-green/30 px-2 sm:px-3 py-1 rounded-sm shadow-[0_0_10px_rgba(0,255,150,0.2)] shrink-0';
                    balEl.innerText = `${balVal.toFixed(2)} €v`;
                }
            }
            if(co && infoEl) {
                const effRole = this.getEffectiveRole(co);
                const roleHudLabel = (state.user.role === 'AUXILIAR' && co.auxRoleDept)
                    ? `AUXILIAR (${effRole.replace('_',' ')})`
                    : state.user.role.replace('_',' ');
                const entityInfo = `ENTITY: ${co.name.toUpperCase()} | ROLE: ${roleHudLabel}`;
                infoEl.innerText = entityInfo;
                infoEl.title = entityInfo;
            }
            if (sandboxBadgeEl) {
                if (co && co.isTestCompany && co.unlockAllContracts === true) {
                    sandboxBadgeEl.className = 'font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-amber-400 text-black border border-amber-300 whitespace-nowrap shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.3)]';
                    sandboxBadgeEl.innerText = '🔓 MODO SANDBOX LIBRE';
                } else if (co && (co.isTestCompany || co.classGroup === 'TEST')) {
                    sandboxBadgeEl.className = 'font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded bg-cyan-950/90 border border-mars-cyan text-mars-cyan whitespace-nowrap shrink-0 shadow-[0_0_8px_rgba(0,240,255,0.25)]';
                    sandboxBadgeEl.innerText = '🎓 SIMULACIÓN ALUMNO REAL';
                } else {
                    sandboxBadgeEl.className = 'hidden font-mono font-bold text-[10px] sm:text-[11px] px-2 py-0.5 rounded whitespace-nowrap shrink-0';
                    sandboxBadgeEl.innerText = '';
                }
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
                cloudEl.innerHTML = '<span class="inline sm:hidden">☁️⚡</span><span class="hidden sm:inline">[CLOUD: SYNCING]</span>';
            } else if(state.isCloudOnline) {
                cloudEl.className = 'text-xs font-bold uppercase tracking-normal sm:tracking-wider px-2 sm:px-2.5 py-1 border border-mars-green/60 text-mars-green bg-mars-green/10 whitespace-nowrap';
                cloudEl.innerHTML = '<span class="inline sm:hidden">☁️✓</span><span class="hidden sm:inline">[D1: SYNCED]</span>';
            } else {
                cloudEl.className = 'text-xs font-bold uppercase tracking-normal sm:tracking-wider px-2 sm:px-2.5 py-1 border border-mars-yellow/60 text-mars-yellow bg-slate-900 whitespace-nowrap';
                cloudEl.innerHTML = '<span class="inline sm:hidden">☁️⚠️</span><span class="hidden sm:inline">[D1: OFFLINE]</span>';
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
            t.classList.remove('tab-active', 'text-mars-cyan', 'border-b-2', 'border-mars-cyan', 'bg-mars-cyan/10');
            t.setAttribute('aria-selected', 'false');
            const tabId = t.getAttribute('data-tab-id') || '';
            const oc = t.getAttribute('onclick') || '';
            if (tabId === this.current || oc.includes(`('${this.current}')`)) {
                t.classList.add('tab-active', 'text-mars-cyan', 'border-b-2', 'border-mars-cyan', 'bg-mars-cyan/10');
                t.setAttribute('aria-selected', 'true');
            }
        });

        const activeTabEl = document.querySelector(`.nav-tab[data-tab-id="${this.current}"]`);
        const navContainer = document.getElementById('hud-nav');
        if (activeTabEl && navContainer && typeof window !== 'undefined' && window.innerWidth <= 640) {
            const scrollTarget = activeTabEl.offsetLeft - (navContainer.clientWidth / 2) + (activeTabEl.clientWidth / 2);
            navContainer.scrollTo({ left: Math.max(0, scrollTarget), behavior: 'smooth' });
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
            if (ftr) ftr.classList.add('hidden');
            if (hdr) hdr.classList.add('hidden');
            if (nav) nav.classList.add('hidden');
            if (actionBar) actionBar.style.visibility = 'hidden';
            if (navContainer) navContainer.style.visibility = 'hidden';
            if (appContainer) appContainer.classList.add('hidden');
            const infoEl = document.getElementById('hud-info');
            const balEl = document.getElementById('hud-balance');
            const miniLogo = document.getElementById('hud-mini-logo');
        const tacticalRow = document.getElementById('hud-tactical-row');
            if (infoEl) {
                infoEl.innerText = 'ENTITY: -- | ROLE: --';
                infoEl.title = 'ENTITY: -- | ROLE: --';
            }
            if (balEl) balEl.innerText = '-- €v';
            if (miniLogo) {
                miniLogo.classList.add('hidden');
                miniLogo.innerHTML = '';
            }
            const sandboxBadgeEl = document.getElementById('hud-sandbox-badge');
            if (sandboxBadgeEl) {
                sandboxBadgeEl.classList.add('hidden');
                sandboxBadgeEl.innerText = '';
            }
        }
    },
    
    render() {
        this.beforeRenderCleanup();
        this.initEventDelegation();
        const vp = document.getElementById('viewport');
        if(!vp) return;
        const savedScrollY = typeof window !== 'undefined' ? (window.scrollY || document.documentElement.scrollTop || 0) : 0;
        const prevHeight = vp.offsetHeight;
        if (prevHeight > 0) {
            vp.style.minHeight = prevHeight + 'px';
        }
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
            'CEO': ['dashboard', 'contracts', 'orders', 'resolutions', 'finance', 'dossier', 'role_deliverables', 'news', 'market', 'ailog'],
            'TECNICO': ['tech', 'tech_workshop', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'market', 'cart', 'ailog'],
            'FINANZAS': ['finance', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'market', 'ailog'],
            'MARKETING': ['brand', 'campaigns', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'ailog'],
            'OPERACIONES_IA': ['cart', 'ailog', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'market'],
            'OPERACIONES': ['cart', 'ailog', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'market'],
            'AUXILIAR': ['dashboard', 'contracts', 'dossier', 'orders', 'resolutions', 'role_deliverables', 'news', 'finance', 'tech', 'tech_workshop', 'brand', 'campaigns', 'cart', 'ailog', 'market']
        };

        let currentAllowed = [];
        if (state.user.admin) {
            currentAllowed = ['admin', 'market', 'dossier', 'news'];
            if (!currentAllowed.includes(this.current)) this.current = 'admin';
        } else {
            const auxDept = (role === 'AUXILIAR') ? co?.auxRoleDept : null;
            const effectiveRole = (role === 'AUXILIAR' && auxDept) ? auxDept : role;
            const allowed = (roleAllowedMap[effectiveRole] || ['dashboard', 'contracts', 'orders', 'finance', 'dossier', 'resolutions', 'role_deliverables', 'news']).concat(['company']);
            if (!allowed.includes(this.current)) {
                const landingByRole = {
                    'TECNICO': 'tech',
                    'FINANZAS': 'finance',
                    'OPERACIONES_IA': 'cart',
                    'OPERACIONES': 'cart',
                    'CEO': 'dashboard',
                    'MARKETING': 'brand',
                    'AUXILIAR': 'dashboard'
                };
                this.current = (role === 'AUXILIAR' ? (landingByRole[auxDept] || 'dashboard') : landingByRole[role]) || 'dashboard';
            }
        }
        
        this.updateHUD();
        const hero = this.generateHeroBanner();
        const notifs = state.user.admin ? '' : (this.renderNotifications ? this.renderNotifications() : '');
        const bankruptBanner = (!state.user.admin && co && typeof this.renderBankruptcyAlertBanner === 'function')
            ? this.renderBankruptcyAlertBanner(co)
            : '';
        const topContext = hero + notifs + bankruptBanner;
        
        switch(this.current) {
            case 'dashboard': vp.innerHTML = topContext; this.viewDashboard(vp); break;
            case 'contracts': vp.innerHTML = topContext; this.viewContracts(vp); break;
            case 'role_deliverables': vp.innerHTML = topContext; this.viewRoleDeliverables(vp); break;
            case 'news': vp.innerHTML = topContext; this.viewNewsBoard(vp); break;
            case 'market': vp.innerHTML = topContext; this.viewMarket(vp); break;
            case 'cart': vp.innerHTML = topContext; this.viewCart(vp); break;
            case 'orders': vp.innerHTML = topContext; this.viewOrders(vp); break;
            case 'finance': vp.innerHTML = topContext; this.viewFinance(vp); break;
            case 'admin': this.viewAdmin(vp); break;
            case 'dossier': vp.innerHTML = topContext; this.viewDossier(vp); break;
            case 'brand': vp.innerHTML = topContext; this.viewBrand(vp); break;
            case 'campaigns': vp.innerHTML = topContext; this.viewCampaigns(vp); break;
            case 'tech_workshop': vp.innerHTML = topContext; this.viewTechWorkshop(vp); break;
            case 'ailog': vp.innerHTML = topContext; this.viewAILog(vp); break;
            case 'tech': vp.innerHTML = topContext; this.viewTech(vp); break;
            case 'resolutions': vp.innerHTML = topContext; this.viewResolutions(vp); break;
            case 'company': vp.innerHTML = topContext; this.viewCompany(vp); break;
            default: {
                vp.innerHTML = topContext;
                this.viewDashboard(vp);
                break;
            }
        }

        if (activeId) {
            const restoredEl = document.getElementById(activeId);
            if (restoredEl && typeof restoredEl.focus === 'function') {
                try { restoredEl.focus({ preventScroll: true }); } catch (e) {}
            }
        }
        if (typeof window !== 'undefined') {
            requestAnimationFrame(() => {
                if (prevHeight > 0) {
                    vp.style.minHeight = '';
                }
                if (savedScrollY > 0) {
                    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
                }
            });
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

    renderCronogramaSection(overrideCoId) {
        const coId = overrideCoId || (state.user && state.user.coId);
        const co = (coId && state.data.companies) ? state.data.companies[coId] : null;
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const visibleDefs = (!state.user?.admin) ? defs.filter(d => !this.isDeliverableLocked(d.key, co)) : defs;
        const activeSubj = this.cronogramaFilter || 'ALL';
        let filteredDefs = activeSubj === 'ALL' ? visibleDefs : visibleDefs.filter(d => d.subject === activeSubj);
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

        // Agrupación y ordenación por Fase asignada (I a IV) y fecha límite
        const phaseOrder = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
        filteredDefs.sort((a, b) => {
            const pA = phaseOrder[this.getDeliverablePhase ? this.getDeliverablePhase(a.key) : (a.phase || 'I')] || 99;
            const pB = phaseOrder[this.getDeliverablePhase ? this.getDeliverablePhase(b.key) : (b.phase || 'I')] || 99;
            if (pA !== pB) return pA - pB;
            const dateA = new Date(deadlinesData[a.key] || a.defaultDate).getTime() || 0;
            const dateB = new Date(deadlinesData[b.key] || b.defaultDate).getTime() || 0;
            return dateA - dateB;
        });

        const subjectColors = {
            'FYQ': 'text-mars-cyan border-mars-cyan bg-mars-cyan/10',
            'LYE': 'text-mars-yellow border-mars-yellow bg-mars-yellow/10',
            'ECO': 'text-mars-green border-mars-green bg-mars-green/10',
            'MAT': 'text-amber-400 border-amber-400 bg-amber-400/10',
            'LEN': 'text-mars-magenta border-mars-magenta bg-mars-magenta/10',
            'ING': 'text-blue-400 border-blue-400 bg-blue-400/10'
        };

        const subjectNavButtons = [
            { id: 'ALL', label: `TODOS (${visibleDefs.length})` },
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

        const deadlineCardsHtml = filteredDefs.length === 0
            ? `<div class="col-span-full p-6 bg-slate-900/40 border border-slate-800 text-center rounded"><p class="text-xs font-mono text-slate-400 uppercase">🔒 No hay entregables activos en esta fase. Se habilitarán según el cronograma oficial.</p></div>`
            : filteredDefs.map(d => {
            const dateStr = deadlinesData[d.key] || d.defaultDate;
            const item = co?.deliverables?.[d.key];
            const isDeliveredToTeacher = item && (item.status === 'DELIVERED_TO_TEACHER' || item.status === 'DOCENTE_REVIEW_DELIVERABLE');
            const isPendingCeo = item && item.status === 'SUBMITTED_TO_CEO';
            const isReturned = item && (item.status === 'CEO_REVISION' || item.status === 'DEVUELTO_A_TECNICO');
            const isDelivered = isDeliveredToTeacher || (!!item && !!item.driveUrl);

            let st;
            if (isDeliveredToTeacher) {
                st = { text: "✅ ENTREGADO AL DOCENTE", class: "bg-mars-green/20 text-mars-green border border-mars-green/60 font-black shadow-[0_0_8px_rgba(0,255,102,0.2)]" };
            } else if (isPendingCeo) {
                st = { text: "🟡 EN REVISIÓN DEL CEO", class: "bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/60 font-black" };
            } else if (isReturned) {
                st = { text: "🔴 SUBSANACIÓN REQUERIDA", class: "bg-red-950/60 text-red-400 border border-red-500 font-black animate-pulse" };
            } else {
                st = this.getDeadlineStatus(dateStr, isDelivered);
            }

            const sBadge = subjectColors[d.subject] || 'text-white border-white bg-white/10';
            const displayDate = String(dateStr).replace('T', ' ');
            const currPhase = this.getDeliverablePhase ? this.getDeliverablePhase(d.key) : (d.phase || 'I');

            return `
            <div class="terminal-border bg-slate-950 p-3.5 sm:p-4 border border-slate-800 flex flex-col justify-between hover:border-mars-cyan/60 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-2 flex-wrap gap-1.5">
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${this.escapeHTML(currPhase)}</span>
                            <span class="text-xs font-black uppercase px-2 py-0.5 border ${sBadge}">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                        </div>
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

        const contextualBanner = showAll ? `
        <div class="mb-4 p-3 bg-mars-yellow/10 border-l-4 border-mars-yellow text-slate-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <span class="text-mars-yellow font-bold uppercase tracking-wider">🌐 CATÁLOGO GLOBAL (5 FASES):</span>
                <span class="text-slate-300"> Mostrando el histórico curricular íntegro del curso (${filteredDefs.length} entregables).</span>
            </div>
            <button type="button" onclick="ui.toggleDossierShowAll()" class="min-h-[44px] px-3 py-1.5 bg-mars-cyan text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors shrink-0">
                🎯 ENFOCAR PRÓXIMOS 15 DÍAS
            </button>
        </div>` : `
        <div class="mb-4 p-3 bg-mars-cyan/10 border-l-4 border-mars-cyan text-slate-200 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
                <span class="text-mars-cyan font-bold uppercase tracking-wider">🎯 MODO ENFOQUE ACTIVO (PRÓXIMOS 15 DÍAS / PENDIENTES):</span>
                <span class="text-slate-300"> Mostrando ${filteredDefs.length} entregables con fecha límite próxima o pendientes de completar.</span>
            </div>
            <button type="button" onclick="ui.toggleDossierShowAll()" class="min-h-[44px] px-3 py-1.5 bg-mars-yellow text-black hover:bg-white text-xs font-black uppercase tracking-wider transition-colors shrink-0">
                🌐 VER LAS 5 FASES (${visibleDefs.length})
            </button>
        </div>`;

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-mars-border pb-3">
                <div>
                    <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base uppercase tracking-tighter font-black">Cronograma Maestro Curricular</h3>
                    <p class="text-xs text-slate-300 uppercase mt-1">Hoja de ruta estratégica de entregables curriculares y plazos de entrega.</p>
                </div>
                <div class="flex flex-wrap gap-2 w-full sm:w-auto">
                    <button type="button" onclick="ui.toggleDossierShowAll()" class="min-h-[44px] px-3.5 py-2 text-xs font-black uppercase tracking-wider border transition-all ${showAll ? 'bg-mars-yellow text-black border-mars-yellow' : 'bg-slate-900 text-mars-cyan border-mars-cyan hover:bg-mars-cyan hover:text-black'}">
                        ${showAll ? '🎯 ENFOCAR PRÓXIMOS 15 DÍAS' : `🌐 VER LAS 5 FASES (${visibleDefs.length})`}
                    </button>
                    ${(state.user && this.getEffectiveRole() === 'CEO') ? `<button type="button" onclick="ui.modalCreateAuxRole()" class="min-h-[44px] bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-mars-cyan hover:text-black transition-all shrink-0 w-full sm:w-auto">Gestionar Rol Observador</button>` : ''}
                </div>
            </div>

            <!-- Contexto explicativo de visualización -->
            ${contextualBanner}

            <!-- Filtros por Materia -->
            <div role="tablist" aria-label="Filtrar entregables por asignatura" class="flex flex-wrap gap-2 pb-2 mb-4">
                ${subjectNavButtons}
            </div>

            <button type="button" aria-expanded="${!!this.cronogramaExpanded}" onclick="ui.toggleCronograma()" class="sm:hidden w-full min-h-[44px] mb-3 bg-slate-900 border border-mars-yellow/60 text-mars-yellow font-black uppercase text-xs py-2 px-3">
                ${this.cronogramaExpanded ? '▲ PLEGAR PLAZOS' : `▼ DESPLEGAR ${filteredDefs.length} PLAZOS`}
            </button>
            <div class="${this.cronogramaExpanded ? 'grid' : 'hidden sm:grid'} grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                ${deadlineCardsHtml}
                ${(activeSubj === 'ALL') ? `
                <div class="terminal-border bg-slate-950 p-4 border border-mars-green/50 col-span-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-1">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-green text-mars-green">FASE V // 19/05/2027</span>
                            <span class="text-xs text-mars-green font-mono font-bold uppercase">🏆 CONCURSO FINAL</span>
                        </div>
                        <h4 class="text-white font-bold text-sm uppercase leading-snug">Culminación del Proyecto MARS-KET</h4>
                        <p class="text-xs text-slate-300 mt-0.5">Lanzamiento oficial de prototipos definitivos (1 finalista por clase A–F), podio y 6 galardones oficiales.</p>
                    </div>
                    <div class="flex flex-col sm:items-end gap-2 shrink-0">
                        <div class="text-left sm:text-right">
                            <span class="text-xs text-slate-400 font-mono block">Fecha del Evento:</span>
                            <span class="text-sm font-orbitron font-bold text-mars-green">19/05/2027</span>
                        </div>
                        <button type="button" onclick="ui.openPhaseVNews()" class="min-h-[44px] px-3.5 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white transition-all">
                            🏆 Ir al Tablón Fase V ➔
                        </button>
                    </div>
                </div>` : ''}
            </div>
        </div>`;
    },

    renderDocBadge(title, docObj, short=false, coId=null, docKey=null) {
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
            const isTeacher = !!item.returnByTeacher;
            statusBadgeHtml = `<span class="bg-mars-magenta/20 text-mars-magenta border border-mars-magenta px-2 py-0.5 text-[10px] font-black uppercase shrink-0">[⚠️ ${isTeacher ? 'SUBSANACIÓN DOCENTE' : 'REVISIÓN REQUERIDA CEO'}]</span>`;
        } else {
            statusBadgeHtml = `<span class="bg-mars-green/20 text-mars-green border border-mars-green px-2 py-0.5 text-[10px] font-black uppercase shrink-0">[✓ ENTREGADO A DOCENTE]</span>`;
        }

        let teacherSubsanarBtn = '';
        if (state.user && state.user.admin && coId && docKey && isValidDriveUrl) {
            teacherSubsanarBtn = `
            <button type="button" onclick="ui.modalTeacherReturnDeliverable('${this.escapeHTML(coId)}', '${this.escapeHTML(docKey)}')" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white rounded transition-colors font-bold uppercase min-h-[44px]" title="Requerir subsanación a la startup">
                <span>↩ Subsanar</span>
            </button>`;
        }

        let actionHtml = '';
        if (isValidDriveUrl) {
            const tipoDoc = item.driveUrl.includes('/document/') ? 'Doc'
              : item.driveUrl.includes('/spreadsheets/') ? 'Sheet'
              : item.driveUrl.includes('/presentation/') ? 'Slide'
              : item.driveUrl.includes('/folders/') ? 'Carpeta'
              : 'Archivo Drive';
            const safeHref = encodeURI(item.driveUrl).replace(/"/g, '&quot;');
            actionHtml = `<div class="flex items-center gap-2 flex-wrap w-full">
  ${statusBadgeHtml}
  <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors min-h-[44px]">
    <span>Abrir ${tipoDoc} ↗</span>
  </a>
  ${teacherSubsanarBtn}
</div>`;
        } else {
            actionHtml = `<div class="flex items-center gap-2 flex-wrap w-full">${statusBadgeHtml}<span class="text-xs text-amber-500/80 font-mono italic">[Contenido legacy no accesible por directiva RGPD]</span>${teacherSubsanarBtn}</div>`;
        }

        const dateStr = item.updatedAt || item.date || '';
        const isTeacherOrigin = !!item.returnByTeacher;
        const reasonBanner = (status === 'CEO_REVISION' && (item.returnReason || item.returnReasonId))
            ? `<div class="mt-2 bg-red-950/50 border border-red-500/40 p-2 text-[11px] text-red-300 rounded"><strong class="text-red-400 uppercase">Motivo de Subsanación (${isTeacherOrigin ? 'Claustro Docente' : 'CEO'}):</strong> ${this.escapeHTML(item.returnReason || item.returnReasonId)}</div>`
            : '';

        return `<div class="bg-mars-cyan/10 border border-mars-cyan/60 p-3 mb-2 text-xs rounded">
                    <div class="mb-2">
                        <span class="text-mars-cyan font-bold uppercase block break-words leading-snug">${this.escapeHTML(title)}</span>
                        <span class="text-[10px] text-slate-300 font-mono block mt-0.5">GOOGLE DRIVE | ${this.escapeHTML(String(dateStr).slice(0,10))}</span>
                    </div>
                    ${actionHtml}
                    ${reasonBanner}
                </div>`;
    },
    
    isDeliverableLocked(docKey, co) {
        if (typeof state !== 'undefined' && typeof state.isDeliverableLocked === 'function') {
            return state.isDeliverableLocked(docKey, co);
        }
        if (state.user?.admin) return false;
        const comp = co || (state.data?.companies?.[state.user?.coId]);
        if (comp?.unlockAllContracts === true) return false;
        const docObj = comp?.deliverables?.[docKey];
        if (docObj && docObj.driveUrl) return false;
        const sched = (state.data?.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        if (!openDate) return false;
        const openTime = new Date(openDate).getTime();
        if (isNaN(openTime)) return false;
        return Date.now() < openTime;
    },

    isPhaseUnlocked(phaseId, co) {
        if (typeof state !== 'undefined' && typeof state.isPhaseUnlocked === 'function') {
            return state.isPhaseUnlocked(phaseId, co);
        }
        if (!phaseId) return true;
        if (state.user?.admin) return true;
        const comp = co || (state.data?.companies?.[state.user?.coId]);
        if (comp?.unlockAllContracts === true) return true;

        const pDefs = (typeof PROJECT_PHASES_DEF !== 'undefined') ? PROJECT_PHASES_DEF : {};
        const pDef = pDefs[phaseId];
        if (pDef && pDef.startDate) {
            const startTime = new Date(pDef.startDate + 'T00:00:00').getTime();
            if (!isNaN(startTime) && Date.now() >= startTime) {
                return true;
            }
        }
        if (phaseId === 'I') return true;

        const defs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => (this.getDeliverablePhase ? this.getDeliverablePhase(d.key) : (d.phase || 'I')) === phaseId);
        if (defs.length > 0 && defs.some(d => !this.isDeliverableLocked(d.key, comp))) {
            return true;
        }
        return false;
    },

    renderDriveLinkBox(title, desc, docKey, currentDoc) {
        const co = (typeof state !== 'undefined' && state.user?.coId && state.data?.companies) ? state.data.companies[state.user.coId] : null;
        if (!state.user?.admin && this.isDeliverableLocked(docKey, co)) {
            return '';
        }
        const isCEO = (typeof state !== 'undefined' && state.user && this.getEffectiveRole(co) === 'CEO');
        const item = (typeof currentDoc === 'object' && currentDoc !== null) ? currentDoc : null;
        const status = item?.status;

        const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        const isLocked = this.isDeliverableLocked(docKey, co);

        const lockBadge = isLocked
            ? `<span class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
            : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`;

        const tplHtml = this.renderDocTemplateBtn(docKey, '📄 Ver Plantilla Docente');
        const templateBtn = tplHtml ? `<div class="mb-2">${tplHtml}</div>` : '';

        let ceoControlsHtml = '';
        if (isCEO && item && status === 'SUBMITTED_TO_CEO') {
            ceoControlsHtml = `
            <div class="bg-slate-950 border border-mars-cyan/40 p-3 mt-2 flex flex-col sm:flex-row gap-2 justify-end">
                <button type="button" onclick="ui.approveDeliverableByCEO('${docKey}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ ✓ APROBAR Y ELEVAR A DOCENTE ]</button>
                <button type="button" onclick="ui.modalCeoReturnDeliverable('${docKey}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ⚠️ DEVOLVER PARA SUBSANACIÓN ]</button>
            </div>
            `;
        }

        const userRole = this.getEffectiveRole(co);
        const isAdmin = state.user ? !!state.user.admin : false;
        const normalizedDefRole = def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role;
        const canUpload = (userRole === normalizedDefRole) || (normalizedDefRole === 'OPERACIONES_IA' && userRole === 'OPERACIONES') || isAdmin;

        let uploadSectionHtml = '';
        if (canUpload) {
            uploadSectionHtml = `
            <div class="bg-slate-900 border border-slate-700 p-3 mt-2 space-y-2">
                <label for="input-drive-url-${docKey}" class="text-xs text-mars-yellow font-bold uppercase block">${isLocked ? '🔒 Entrega Bloqueada hasta la Fecha de Apertura' : (isAdmin ? 'Entregar o Actualizar Enlace Google Drive' : 'Subir Enlace para Supervisión del CEO')}</label>
                <div class="space-y-1.5">
                  <input type="url" 
                         id="input-drive-url-${docKey}" 
                         name="driveUrl" 
                         ${isLocked ? 'disabled' : 'required'} 
                         placeholder="${isLocked ? '🔒 Entrega bloqueada hasta ' + new Date(openDate).toLocaleString() : 'https://docs.google.com/... o https://drive.google.com/...'}" 
                         class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-base sm:text-xs text-white rounded font-mono outline-none focus:border-mars-cyan ${isLocked ? 'opacity-50 cursor-not-allowed bg-slate-950' : ''}">
                  <p class="text-[10px] text-slate-400">
                    ${isLocked ? 'El equipo docente ha programado la apertura de este entregable. Podéis consultar la plantilla oficial arriba.' : 'Pega únicamente el enlace de tu archivo o carpeta en Google Drive configurado con permisos de lectura.'}
                  </p>
                </div>
                <div class="flex justify-end pt-1">
                    <button type="button" ${isLocked ? 'disabled' : ''} onclick="ui.submitDeliverable('${docKey}', this)" class="bg-mars-cyan text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white flex-shrink-0 w-full sm:w-auto min-h-[44px] ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}">${isLocked ? '🔒 Entrega Bloqueada' : (isAdmin ? 'Entregar y Elevar a Docente' : 'Enviar a Supervisión CEO')}</button>
                </div>
            </div>`;
        } else {
            uploadSectionHtml = `
            <div class="bg-slate-900/60 border border-slate-800 p-3 mt-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono">
                <span class="text-slate-400">Departamento Responsable: <strong class="text-mars-yellow uppercase">${this.escapeHTML(def.role ? def.role.replace('_',' ') : 'ASIGNADO')}</strong></span>
                ${item && item.driveUrl ? `<a href="${encodeURI(item.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-mars-cyan hover:underline font-bold inline-flex items-center gap-1"><span>Abrir Documento Cloud</span> ↗</a>` : '<span class="text-slate-400 italic">Pendiente de subida por el responsable</span>'}
            </div>`;
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
            ${uploadSectionHtml}
        </div>`;
    },

    modalCeoReturnDeliverable(docKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
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
                <div>
                    <label for="ceo-return-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mb-1">
                        📄 Documento con Correcciones / Observaciones en Google Docs (Opcional)
                    </label>
                    <input type="url" id="ceo-return-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-mars-cyan font-mono outline-none focus:border-mars-cyan">
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Adjunta un enlace con permisos de lectura para que el equipo consulte las indicaciones exactas.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmCeoReturnDeliverable('${docKey}')" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Devolver para Subsanación</button>`;
        this.showModal("Supervisión CEO: Devolver para Subsanación", html, actions);
    },

    confirmCeoReturnDeliverable(docKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const el = document.getElementById('ceo-return-reason');
        if (!el) return;
        const reasonId = el.value;
        const elDrive = document.getElementById('ceo-return-drive-url');
        const returnDriveUrl = elDrive ? elDrive.value.trim() : '';
        if (returnDriveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(returnDriveUrl)) {
            return this.notify("El enlace con correcciones debe ser una URL válida de Google Drive / Docs.", "error");
        }
        this.closeModal();
        state.returnDeliverableByCEO(docKey, reasonId, returnDriveUrl);
    },

    modalTeacherReturnDeliverable(coId, docKey) {
        if (!state.user || !state.user.admin) return;
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey);
        const docName = def ? (def.shortName || def.name) : docKey;
        const reasons = (typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [
            { id: "ENLACE_INVALIDO", label: "Enlace a Google Drive inexistente o con formato incorrecto" },
            { id: "PERMISOS_BLOQUEADOS", label: "Documento sin permisos de acceso/lectura para el equipo docente" },
            { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial corporativa/curricular" },
            { id: "CHECKLIST_INCOMPLETO", label: "Faltan apartados obligatorios según la guía de la materia" },
            { id: "DISCREPANCIA_DATOS", label: "Discrepancia entre datos de la app y el documento adjunto" },
            { id: "REVISION_PENDIENTE", label: "Requiere subsanación técnica interna antes de evaluación" }
        ]);

        const optionsHtml = reasons.map(r => `<option value="${this.escapeHTML(r.id)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <div class="space-y-3 font-mono text-xs">
                <p class="text-slate-300 leading-relaxed">Selecciona el motivo oficial para devolver el entregable <strong>"${this.escapeHTML(docName)}"</strong> a la startup para su subsanación inmediata. Cumple la directiva Zero-Text.</p>
                <div>
                    <label for="teacher-return-reason" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Motivo Tipificado de Subsanación</label>
                    <select id="teacher-return-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white outline-none focus:border-white">
                        ${optionsHtml}
                    </select>
                </div>
                <div>
                    <label for="teacher-return-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mb-1">
                        📄 Documento con Correcciones / Rúbrica en Google Docs (Opcional)
                    </label>
                    <input type="url" id="teacher-return-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-mars-cyan font-mono outline-none focus:border-mars-cyan">
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Adjunta el enlace a las correcciones o rúbrica de subsanación para el alumnado.</p>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
            <button type="button" onclick="ui.confirmTeacherReturnDeliverable('${this.escapeHTML(coId)}', '${this.escapeHTML(docKey)}')" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Devolver para Subsanación</button>
        `;
        this.showModal(`Subsanación Docente: ${docName}`, html, actions);
    },

    confirmTeacherReturnDeliverable(coId, docKey) {
        if (!state.user || !state.user.admin) return;
        const el = document.getElementById('teacher-return-reason');
        if (!el) return;
        const reasonId = el.value;
        const elDrive = document.getElementById('teacher-return-drive-url');
        const returnDriveUrl = elDrive ? elDrive.value.trim() : '';
        if (returnDriveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(returnDriveUrl)) {
            return this.notify("El enlace con correcciones debe ser una URL válida de Google Drive / Docs.", "error");
        }
        this.closeModal();
        state.returnDeliverableByTeacher(coId, docKey, reasonId, returnDriveUrl);
    },

    approveDeliverableByCEO(docKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        state.approveDeliverableByCEO(docKey);
    },

    submitDeliverable(docType, btnEl = null) {
        if (!state.user?.admin && this.isDeliverableLocked(docType)) {
            this.notify("Este entregable se encuentra bloqueado hasta su fecha de apertura.", "error");
            return;
        }
        const inputFromBtn = (btnEl && btnEl.closest) ? (btnEl.closest('.bg-slate-900')?.querySelector('input[name="driveUrl"]') || btnEl.closest('.border-b')?.querySelector('input[name="driveUrl"]')) : null;
        const driveUrl = (inputFromBtn?.value || (document.getElementById(`input-drive-url-${docType}`)?.value || '')).trim();

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
        const isLocked = this.isDeliverableLocked(docKey, co);
        const dlDate = sched.deadline || ((state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? state.data.config.deadlines[def.key] : def.defaultDate);
        const isDeliveredToTeacher = doc && (doc.status === 'DELIVERED_TO_TEACHER' || doc.status === 'DOCENTE_REVIEW_DELIVERABLE');
        const isPendingCeo = doc && doc.status === 'SUBMITTED_TO_CEO';
        const isReturned = doc && (doc.status === 'CEO_REVISION' || doc.status === 'DEVUELTO_A_TECNICO');
        const dlBadge = isDeliveredToTeacher
            ? { text: "✅ ENTREGADO AL DOCENTE", class: "bg-mars-green/20 text-mars-green border border-mars-green/60 font-black shadow-[0_0_8px_rgba(0,255,102,0.2)]" }
            : (isPendingCeo
                ? { text: "🟡 EN REVISIÓN CEO", class: "bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/60 font-black" }
                : (isReturned
                    ? { text: "🔴 SUBSANACIÓN REQUERIDA", class: "bg-red-950/60 text-red-400 border border-red-500 font-black animate-pulse" }
                    : this.getDeadlineStatus(dlDate, !!(doc && doc.driveUrl))));
        const lockBadge = isLocked
            ? `<span class="text-xs font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
            : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`;
        const templateBtn = this.renderDocTemplateBtn(docKey, '📄 Ver Plantilla Docente');
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
            else if (status === 'CEO_REVISION') {
                const isTeacher = !!item.returnByTeacher;
                pipelineLabel = `<span class="text-mars-magenta font-bold uppercase text-xs">[⚠️ ${isTeacher ? 'SUBSANACIÓN DOCENTE' : 'REVISIÓN REQUERIDA POR CEO'}]</span>`;
            }
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
                    <div class="mt-2 flex items-center gap-2 flex-wrap">
                        <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors">
                            <span>Abrir ${tipoDoc} ↗</span>
                        </a>
                        ${(state.user && this.getEffectiveRole(co) === 'CEO' && status === 'SUBMITTED_TO_CEO') ? `
                            <button type="button" onclick="ui.approveDeliverableByCEO('${docKey}'); ui.closeDrawer()" class="min-h-[44px] px-4 py-2 text-xs bg-mars-green text-black font-black uppercase hover:bg-white transition-all">Aprobar CEO</button>
                            <button type="button" onclick="ui.modalCeoReturnDeliverable('${docKey}'); ui.closeDrawer()" class="min-h-[44px] px-4 py-2 text-xs bg-red-700 text-white font-black uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Devolver para Subsanación</button>
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
                    ${(state.user && state.user.admin && ord.realStore) ? `<p class="text-mars-green text-xs font-bold uppercase mt-2 pt-2 border-t border-slate-800">Comercio Real: ${this.escapeHTML(ord.realStore)} | Coste Físico: ${Number(ord.realCost || 0).toFixed(2)} €</p>` : (ord.realStore ? `<p class="text-mars-green text-xs font-bold uppercase mt-2 pt-2 border-t border-slate-800">Comercio: ${this.escapeHTML(ord.realStore)}</p>` : '')}
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
            <div class="space-y-4 text-xs text-slate-200 leading-relaxed font-sans max-h-[70vh] overflow-y-auto pr-1">
                <!-- 1ª Capa: Resumen Informativo Básico (Art. 13 RGPD / Art. 11 LOPDGDD) -->
                <div class="p-3.5 bg-slate-900/90 border border-mars-cyan/40 space-y-2 font-mono">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="px-2 py-0.5 bg-mars-cyan/20 border border-mars-cyan text-mars-cyan text-[10px] font-black uppercase">1ª CAPA: RESUMEN INFORMATIVO</span>
                        <span class="text-[10px] text-slate-400">RGPD (UE) 2016/679 & LOPDGDD 3/2018</span>
                    </div>
                    <p><strong class="text-mars-cyan">RESPONSABLE:</strong> Colegio Miravalles-El Redín (Dirección y Claustro Docente de Secundaria y Bachillerato).</p>
                    <p><strong class="text-mars-cyan">FINALIDAD:</strong> Desarrollo del proyecto pedagógico interdisciplinar MARS-KET OS y evaluación competencial curricular LOMLOE.</p>
                    <p><strong class="text-mars-cyan">LEGITIMACIÓN:</strong> Ejercicio de la función educativa y cumplimiento de una misión de interés público (Art. 6.1.e RGPD / Disposición Adicional 23ª LOMLOE).</p>
                    <p><strong class="text-mars-cyan">DESTINATARIOS:</strong> Sin cesión de datos personales a terceros, sin venta publicitaria y sin transferencias internacionales.</p>
                    <p><strong class="text-mars-cyan">DERECHOS:</strong> Acceso, rectificación, supresión y limitación ante la dirección del centro o ante la Agencia Española de Protección de Datos (AEPD, www.aepd.es).</p>
                </div>

                <!-- 2ª Capa: Protocolos Clave de Seguridad Escolar y Menores (Art. 7 LOPDGDD 14-16 años) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div class="p-3 bg-black/60 border border-slate-800 space-y-1.5">
                        <h4 class="text-xs font-bold text-mars-yellow uppercase flex items-center gap-1.5">
                            <span>🛡️ Política Zero-PII</span>
                        </h4>
                        <p class="text-[11px] text-slate-300">
                            MARS-KET OS no almacena nombres reales de alumnos, ni DNI, ni teléfonos, ni cuentas personales. El acceso es exclusivamente seudónimo mediante roles corporativos (CEO, Finanzas, Técnico, Operaciones, Marketing, Auxiliar) y códigos de startup alfanuméricos.
                        </p>
                    </div>
                    <div class="p-3 bg-black/60 border border-slate-800 space-y-1.5">
                        <h4 class="text-xs font-bold text-mars-magenta uppercase flex items-center gap-1.5">
                            <span>🚫 Directiva Zero-Text Libre</span>
                        </h4>
                        <p class="text-[11px] text-slate-300">
                            Queda terminantemente prohibido cualquier campo de chat abierto o texto libre entre alumnos en la app para prevenir ciberacoso y filtraciones. Todo intercambio se realiza mediante motivos tipificados o enlaces compartidos en Google Drive bajo las cuentas auditadas del centro escolar.
                        </p>
                    </div>
                </div>

                <!-- 3ª Capa: Almacenamiento Técnico, Cero Cookies y Auditoría AEPD -->
                <div class="p-3 bg-slate-900/60 border border-slate-800 space-y-2 text-[11px] text-slate-300">
                    <p><strong class="text-white">🍪 Almacenamiento Técnico y Cero Cookies:</strong> Esta plataforma no utiliza cookies analíticas de terceros ni píxeles de rastreo publicitario. Únicamente emplea almacenamiento técnico local (<code class="text-mars-cyan font-mono">localStorage</code>) estrictamente imprescindible para mantener la sesión didáctica activa (Art. 22.2 LSSI-CE exento).</p>
                    <p><strong class="text-white">🔒 Criptografía y Persistencia:</strong> Generación de claves mediante CSPRNG nativo (<code class="text-mars-cyan font-mono">crypto.getRandomValues</code>) alineado con directrices VALiDA de la AEPD y persistencia híbrida segura en servidor nacional CDMON.</p>
                </div>
            </div>
        `;
        this.showModal("Protocolo de Privacidad y Blindaje RGPD (Art. 13 & LOPDGDD)", html, "");
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
    },

    getDeliverablePhase(docKey) {
        const fromSched = state.data?.config?.deliverableSchedule?.[docKey]?.phase;
        if (fromSched) return fromSched;
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey);
        return def?.phase || 'I';
    }
};
