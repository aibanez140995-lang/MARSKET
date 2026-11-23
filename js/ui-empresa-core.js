// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN EN 2 PASOS (ZERO-KNOWLEDGE), NOTIFICACIONES Y DOSSIER ACADÉMICO (v1.1.44) ---

Object.assign(ui, {
    getSponsorTierBadge(tier) {
        if (!tier) return '';
        const styles = {
            'ORO': 'color: #FFD700 !important; border: 1px solid #FFD700 !important; background-color: rgba(255, 215, 0, 0.18) !important;',
            'PLATA': 'color: #E2E8F0 !important; border: 1px solid #E2E8F0 !important; background-color: rgba(226, 232, 240, 0.18) !important;',
            'BRONCE': 'color: #CD7F32 !important; border: 1px solid #CD7F32 !important; background-color: rgba(205, 127, 50, 0.20) !important;',
            'COBRE': 'color: #E04F33 !important; border: 1px solid #E04F33 !important; background-color: rgba(224, 79, 51, 0.20) !important;',
            'COLABORADOR': 'color: #00F0FF !important; border: 1px solid #00F0FF !important; background-color: rgba(0, 240, 255, 0.18) !important;'
        };
        const s = styles[tier] || 'color: #94a3b8; border: 1px solid #475569; background-color: rgba(15, 23, 42, 0.6);';
        return `<span style="${s}" class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase whitespace-nowrap">[${this.escapeHTML(tier)}]</span>`;
    },

    getNextOrderNumber(co) {
        const orders = co?.orders || [];
        let maxNum = 0;
        orders.forEach(o => {
            const strId = String(o.id || '').trim();
            const match = strId.match(/^(?:ORD-|B2B-)?(\d+)$/i);
            if (match) {
                const n = parseInt(match[1], 10);
                if (!isNaN(n) && n > maxNum) maxNum = n;
            }
        });
        const nextNum = maxNum + 1;
        return String(nextNum).padStart(3, '0');
    },

    viewLogin(el) {
        if (!el) return;
        const verifiedCoId = typeof auth !== 'undefined' ? auth.verifiedCoId : null;
        const isOffline = typeof state !== 'undefined' && state.isCloudOnline === false;
        const scanlineHtml = `
            <div class="login-scanline-layer" aria-hidden="true">
                <div class="login-laser-beam"></div>
            </div>
        `;
        const offlineHtml = `
            <div id="login-offline-notice" role="status" aria-live="polite" class="${isOffline ? 'mt-3 pt-2 border-t border-mars-yellow/30 text-center' : 'hidden'}">
                <p class="text-xs text-mars-yellow font-mono tracking-wider">⚠️ MODO LOCAL // SIN CONEXIÓN CON NUBE CDMON</p>
            </div>
        `;

        const rgpdClauseHtml = `
            <div id="login-rgpd-footer" class="mt-4 text-center">
                <button type="button" id="btn-open-rgpd-modal" onclick="ui.openRgpdModal()" class="min-h-[44px] min-w-[44px] px-3 py-2 text-xs text-slate-300 hover:text-mars-cyan font-mono tracking-wider transition-colors inline-flex items-center justify-center">
                    [ 🛡️ PROTOCOLO RGPD / ART. 13 ]
                </button>
                <p id="login-rgpd-clause-text" class="text-[10px] text-slate-400 text-center mt-2 tracking-wider font-mono leading-relaxed">Tratamiento de datos con fines exclusivamente educativos. Responsable del Tratamiento: Colegio Miravalles-El Redín. No se ceden datos a terceros.</p>
            </div>
        `;

        const loginAccessBarHtml = `
            <div class="flex justify-end items-center gap-1.5 mb-2">
                <button type="button" id="login-btn-calm" onclick="ui.toggleFocusMode()" class="min-h-[44px] px-2.5 py-1.5 bg-black/60 border border-slate-700 hover:border-mars-cyan text-slate-300 hover:text-mars-cyan font-mono font-bold text-[11px] uppercase rounded-sm transition-all">Calma</button>
                <button type="button" id="login-btn-zoom" onclick="ui.toggleTextZoom()" class="min-h-[44px] px-2.5 py-1.5 bg-black/60 border border-slate-700 hover:border-mars-cyan text-slate-300 hover:text-mars-cyan font-mono font-bold text-[11px] uppercase rounded-sm transition-all">🔠 100%</button>
            </div>
        `;

        // PASO 1: Solicitud de Código Privado de Empresa (Pasarela Docente oculta tras doble clic/tap en #marsket-logo)
        if (!verifiedCoId) {
            el.innerHTML = `
            ${scanlineHtml}
            <div id="login-box" class="w-full max-w-md terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto" style="max-width: 28rem;">
                ${loginAccessBarHtml}
                <img id="marsket-logo" src="logo.png" alt="Logo oficial MARS-KET 2.0" width="96" height="96" 
                    onclick="auth.handleLogoTrigger(event)" 
                    style="touch-action: manipulation; width: clamp(72px, 12vh, 96px); height: clamp(72px, 12vh, 96px); aspect-ratio: 1/1;" 
                    class="mx-auto mb-2.5 sm:mb-4 drop-shadow-[0_0_16px_rgba(0,240,255,0.75)] hover:drop-shadow-[0_0_24px_rgba(0,240,255,0.95)] transition-all duration-300 cursor-pointer select-none object-contain" 
                    onerror="this.onerror=null;this.src='logo.png';">
                <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-sm sm:text-base tracking-wider uppercase font-black mb-1" style="font-size: clamp(0.95rem, 2.2vh, 1.2rem);">ACCESO DE STARTUP</h2>
                <p class="text-xs text-slate-300 text-center uppercase tracking-normal sm:tracking-wider mb-3 sm:mb-4">Paso 1 de 2 · Código de tu equipo</p>
                
                <div class="bg-black/60 border border-mars-border p-3 sm:p-4">
                    <label for="login-company-code" class="text-xs text-mars-cyan uppercase font-bold block mb-1 tracking-wider">Código Privado de Empresa</label>
                    <p class="text-[11px] text-slate-400 font-sans mb-2">Está en tu tarjeta de clase (3 letras de empresa, guion y 4 números, ej: AST-1010).</p>
                    <input type="text" id="login-company-code" autocomplete="off" placeholder="EJ: AST-1010" style="touch-action: manipulation; font-size: 16px;" onkeydown="if(event.key==='Enter') auth.validateCompanyCode()" onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full bg-slate-900 border border-mars-cyan/60 p-2.5 sm:p-3 text-center font-orbitron font-black uppercase tracking-widest text-mars-yellow outline-none focus:border-mars-cyan mb-3 min-h-[48px]">
                    <button type="button" onclick="auth.validateCompanyCode()" style="touch-action: manipulation;" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-3 text-xs uppercase tracking-normal sm:tracking-wider hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] whitespace-nowrap">[ VALIDAR CÓDIGO ➔ ]</button>
                </div>
                ${rgpdClauseHtml}
                ${offlineHtml}
            </div>`;
            setTimeout(() => {
                document.getElementById('login-company-code')?.focus();
                this.updateCalmButtonUI(this.isFocusCalmMode() ? 'calm' : 'standard');
                this.updateZoomButtonUI(localStorage.getItem('marsket_text_zoom') || 'normal');
            }, 50);
            return;
        }

        // PASO 2: Selección de Departamento y Teclado PIN (Solo para la entidad ya validada)
        const isTeacher = verifiedCoId === 'admin';
        const isVipStep = verifiedCoId === 'vip_reader';
        const entityLabel = isTeacher 
            ? 'CLAUSTRO DOCENTE' 
            : (isVipStep ? 'LECTOR INVITADO · ORBITAL REPORT' : (state.data.companies[verifiedCoId]?.name || 'STARTUP'));

        el.innerHTML = `
        ${scanlineHtml}
        <div id="login-box" class="w-full max-w-md terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto" style="max-width: 28rem;">
            ${loginAccessBarHtml}
            <!-- Sub-barra superior de navegación compacta -->
            <div class="flex justify-between items-center gap-2 border-b border-mars-border/60 pb-2 mb-2.5">
                <span class="text-[11px] font-mono text-mars-cyan uppercase tracking-wider flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <span class="w-2 h-2 rounded-full bg-mars-cyan animate-pulse" aria-hidden="true"></span>
                    Paso 2 de 2 · Puesto y PIN
                </span>
                <button type="button" onclick="auth.resetCompanyStep()" class="min-h-[44px] text-xs text-mars-magenta hover:text-white uppercase font-bold tracking-normal border border-mars-magenta/50 px-2.5 py-1 hover:bg-mars-magenta/20 transition-all whitespace-nowrap shrink-0">
                    [⬅ Cambiar]
                </button>
            </div>

            <!-- Logo centrado de alta visibilidad + Tarjeta de Entidad Verificada -->
            <div class="text-center mb-2.5">
                <img id="marsket-logo-step2" src="logo.png" alt="Logo oficial MARS-KET 2.0" width="60" height="60"
                    onclick="auth.handleLogoTrigger(event)"
                    style="touch-action: manipulation; width: clamp(48px, 7vh, 60px); height: clamp(48px, 7vh, 60px); aspect-ratio: 1/1;"
                    class="mx-auto mb-1.5 drop-shadow-[0_0_12px_rgba(0,240,255,0.75)] hover:drop-shadow-[0_0_20px_rgba(0,240,255,0.95)] transition-all duration-300 cursor-pointer select-none object-contain"
                    onerror="this.onerror=null;this.src='logo.png';">
                <div class="bg-slate-900/90 border ${isTeacher ? 'border-mars-yellow' : 'border-mars-cyan'} py-1.5 px-3">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Entidad Verificada</p>
                    <h2 id="login-title" class="font-orbitron ${isTeacher ? 'text-mars-yellow' : 'text-mars-cyan'} text-sm sm:text-base tracking-wider uppercase font-black truncate">${this.escapeHTML(entityLabel)}</h2>
                </div>
            </div>

            <label for="login-role" class="text-xs text-slate-300 uppercase font-bold block mb-1">${isTeacher ? '1. Elige tu Perfil Docente' : '1. Elige tu Puesto en el Equipo'}</label>
            <select id="login-role" onchange="auth.onRoleChange()" style="touch-action: manipulation; font-size: 16px;" class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-mars-cyan uppercase text-white font-bold transition-all"></select>
            
            <p class="text-[11px] text-slate-400 font-sans text-center mb-1.5">2. Introduce tu PIN de 4 cifras</p>
            <div class="flex justify-center gap-3 mb-3" role="status" aria-label="Indicador de dígitos de PIN introducidos">
                ${[1,2,3,4].map(() => `<div class="pin-dot w-3.5 h-3.5 rounded-full border-2 border-mars-cyan transition-all"></div>`).join('')}
            </div>
            <div id="login-keypad" role="group" style="touch-action: manipulation;" aria-label="Teclado numérico de PIN (también admite teclado físico 0-9, Retroceso y Enter)" class="grid grid-cols-3 gap-2 max-w-[240px] mx-auto transition-all">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" aria-label="Dígito ${n}" onclick="auth.press('${n}')" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-slate-700 p-2.5 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                <button type="button" aria-label="Borrar todo el PIN" onclick="auth.clear()" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-mars-magenta/50 p-2 text-mars-magenta text-xs font-black hover:bg-mars-magenta hover:text-white transition-all active:scale-95">BORRAR</button>
                <button type="button" aria-label="Dígito 0" onclick="auth.press('0')" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-slate-700 p-2.5 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                <button type="button" aria-label="Entrar" onclick="auth.verify()" style="touch-action: manipulation;" class="min-h-[44px] bg-mars-green/20 border border-mars-green text-mars-green p-2 text-xs font-black hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENTRAR</button>
            </div>
            <p class="text-[11px] text-slate-400 text-center font-sans mt-2.5">También funciona con teclado físico (0-9, Retroceso borra 1 dígito, Enter).</p>
            ${rgpdClauseHtml}
            ${offlineHtml}
        </div>`;
        setTimeout(() => {
            auth.updateRoleOptions();
            this.updateCalmButtonUI(this.isFocusCalmMode() ? 'calm' : 'standard');
            this.updateZoomButtonUI(localStorage.getItem('marsket_text_zoom') || 'normal');
        }, 30);
    },

    playLoginAnimation(role) {
        const container = document.getElementById('login-box');
        const title = document.getElementById('login-title');
        const keypad = document.getElementById('login-keypad');
        
        if (container) {
            container.classList.remove('glow-cyan', 'border-mars-border');
            container.classList.add('shadow-[0_0_20px_#00ff66]', 'border-mars-green');
        }
        if (title) {
            title.innerText = `ACCESS_GRANTED: ${role.replace('_', ' ')}`;
            title.classList.remove('text-mars-cyan', 'text-mars-yellow');
            title.classList.add('text-mars-green', 'glitch-text');
        }
        if (keypad) {
            keypad.classList.add('hidden');
        }
    },

    renderNotifications() {
        if (!state.user) return '';
        const co = state.data.companies[state.user.coId];
        if (!co) return '';
        
        co.notifications = co.notifications || [];
        const rawRole = String(state.user.role || '').toUpperCase();
        const effectiveRole = (typeof this.getEffectiveRole === 'function' ? this.getEffectiveRole(co) : rawRole) || rawRole;
        const myNotifs = co.notifications.filter(n => {
            if (!n) return false;
            const nRole = String(n.role || '').toUpperCase();
            const isForMe = (nRole === effectiveRole) || (nRole === rawRole) || (nRole === 'ALL') || (effectiveRole === 'OPERACIONES_IA' && nRole === 'OPERACIONES');
            if (!isForMe) return false;
            const isSharedDeptWithAux = Boolean(co.auxRoleDept) && (nRole === effectiveRole || (effectiveRole === 'OPERACIONES_IA' && nRole === 'OPERACIONES'));
            if (nRole === 'ALL' || isSharedDeptWithAux) {
                if (n.readBy && n.readBy[rawRole]) return false;
                if (n.readBy && n.readBy[effectiveRole] && !co.auxRoleDept) return false;
                return !n.read || Boolean(co.auxRoleDept && (!n.readBy || !n.readBy[rawRole]));
            }
            return !n.read;
        });
        if (myNotifs.length === 0) return '';
        
        return `<div class="mb-6 space-y-2 animate-in fade-in slide-in-from-top-4" role="region" aria-label="Notificaciones operativas">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-mono uppercase text-slate-400">Avisos y Notificaciones (${myNotifs.length})</span>
                <button type="button" onclick="ui.dismissAllRoleNotifications()" class="min-h-[44px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 text-xs font-bold uppercase transition-all">[ 🧹 Borrar Todos los Avisos ]</button>
            </div>
            ${myNotifs.map(n => {
                let colors = 'border-mars-cyan bg-mars-cyan/10 text-mars-cyan';
                if (n.type === 'error') colors = 'border-mars-magenta bg-mars-magenta/10 text-mars-magenta';
                if (n.type === 'success') colors = 'border-mars-green bg-mars-green/10 text-mars-green';
                if (n.type === 'warning') colors = 'border-mars-yellow bg-mars-yellow/10 text-mars-yellow';
                
                return `
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 border ${colors} shadow-sm">
                    <div class="flex flex-col min-w-0 flex-1">
                        <span class="text-xs font-bold uppercase leading-relaxed break-words">${this.escapeHTML(n.message)}</span>
                        <span class="text-xs text-slate-300 mt-1">${this.escapeHTML(n.date)}</span>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        <button type="button" onclick="ui.openNotificationTarget('${this.escapeHTML(n.id)}')" class="min-h-[44px] bg-black/70 border border-current text-white font-black px-3.5 py-1.5 text-xs uppercase hover:bg-white hover:text-black transition-all flex items-center gap-1.5 shadow-sm">[ 👁️ Ver Notificación ➔ ]</button>
                        <button type="button" aria-label="Descartar notificación" onclick="ui.dismissNotification('${this.escapeHTML(n.id)}')" class="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center font-black hover:text-white transition-colors text-xs border border-current border-opacity-40 shrink-0" title="Descartar">✕</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`;
    },

    dismissNotification(id) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.notifications = co.notifications || [];
        state.data.dismissedNotificationIds = state.data.dismissedNotificationIds || [];
        const rawRole = String(state.user.role || '').toUpperCase();
        const effectiveRole = String((typeof this.getEffectiveRole === 'function' ? this.getEffectiveRole(co) : rawRole) || rawRole).toUpperCase();
        const notif = co.notifications.find(n => n.id === id);
        if (notif) {
            const nRole = String(notif.role || '').toUpperCase();
            const isSharedDeptWithAux = Boolean(co.auxRoleDept) && (nRole === effectiveRole || (effectiveRole === 'OPERACIONES_IA' && nRole === 'OPERACIONES'));
            if (nRole === 'ALL' || isSharedDeptWithAux) {
                notif.readBy = notif.readBy || {};
                notif.readBy[rawRole] = true;
            } else {
                notif.read = true;
                if (id && !state.data.dismissedNotificationIds.includes(String(id))) {
                    state.data.dismissedNotificationIds.push(String(id));
                }
            }
            notif.updatedAt = Date.now();
        }
        co.updatedAt = Date.now();
        state.save();
        this.render();
    },

    dismissAllRoleNotifications() {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.notifications = co.notifications || [];
        state.data.dismissedNotificationIds = state.data.dismissedNotificationIds || [];
        const rawRole = String(state.user.role || '').toUpperCase();
        const effectiveRole = String((typeof this.getEffectiveRole === 'function' ? this.getEffectiveRole(co) : rawRole) || rawRole).toUpperCase();
        (co.notifications || []).forEach(n => {
            if (!n) return;
            const nRole = String(n.role || '').toUpperCase();
            const isForMe = (nRole === effectiveRole) || (nRole === rawRole) || (nRole === 'ALL') || (effectiveRole === 'OPERACIONES_IA' && nRole === 'OPERACIONES');
            if (!isForMe) return;
            const isSharedDeptWithAux = Boolean(co.auxRoleDept) && (nRole === effectiveRole || (effectiveRole === 'OPERACIONES_IA' && nRole === 'OPERACIONES'));
            if (nRole === 'ALL' || isSharedDeptWithAux) {
                if (!(n.readBy && n.readBy[rawRole])) {
                    n.readBy = n.readBy || {};
                    n.readBy[rawRole] = true;
                    n.updatedAt = Date.now();
                }
            } else if (!n.read) {
                n.read = true;
                if (n.id && !state.data.dismissedNotificationIds.includes(String(n.id))) {
                    state.data.dismissedNotificationIds.push(String(n.id));
                }
            }
        });
        co.updatedAt = Date.now();
        state.save();
        this.notify("🧹 Todos los avisos han sido descartados.", "info");
        this.render();
    },

    viewDossier(el) {
        if (!el || !state.user) return;
        
        let coId = state.user.coId;
        if (state.user.admin) {
            coId = this.dossierSelectedCo || Object.keys(state.data.companies)[0];
        }
        
        const co = state.data.companies[coId];
        if (!state.user.admin && !co) return auth.logout();
        if (state.user.admin && !co) {
            el.innerHTML = `<div class="p-6 text-center text-xs text-slate-300">No hay startups registradas.</div>`;
            return;
        }
        
        const tab = this.dossierTab || 'eval';
        const wrapper = document.createElement('div');
        
        let adminSelector = '';
        if (state.user.admin) {
            adminSelector = `
            <div class="mb-6 bg-slate-900 p-3 sm:p-4 border border-mars-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <label for="dossier-co-select" class="text-mars-cyan font-bold text-xs uppercase whitespace-nowrap">Inspeccionando Dossier de:</label>
                    <select id="dossier-co-select" onchange="ui.dossierSelectedCo=this.value; ui.render()" class="min-h-[44px] bg-black border border-mars-cyan text-white text-base sm:text-xs p-2.5 outline-none w-full sm:w-auto font-bold uppercase">
                        ${Object.keys(state.data.companies).map(k => `<option value="${this.escapeHTML(k)}" ${coId===k?'selected':''}>${this.escapeHTML(state.data.companies[k].name)} [Clase ${this.escapeHTML(state.data.companies[k].classGroup || 'A')}]</option>`).join('')}
                    </select>
                </div>
                <span class="text-xs text-mars-yellow uppercase font-bold">Modo Supervisión Docente</span>
            </div>`;
        }
        
        wrapper.innerHTML = `
        ${adminSelector}
        ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
        <div role="tablist" aria-label="Secciones del Dossier Académico" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-2">
            <button type="button" role="tab" aria-selected="${tab==='eval'}" onclick="ui.showDossierTab('eval')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📊 Evaluación Continua (100%)</button>
            <button type="button" role="tab" aria-selected="${tab==='docs'}" onclick="ui.showDossierTab('docs')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📁 Bóveda de Entregables</button>
            <button type="button" role="tab" aria-selected="${tab==='cronograma'}" onclick="ui.showDossierTab('cronograma')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='cronograma'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📅 Cronograma</button>
        </div>
        <div id="dossier-content" class="w-full"></div>
        `;
        el.appendChild(wrapper);
        this.renderDossierContent(tab, coId);
    },

    showDossierTab(tab) {
        if (!state.user?.admin) {
            this.roleDeliverablesSection = tab === 'cronograma' ? 'cronograma' : (tab === 'eval' ? 'grades' : 'deliverables');
            this.current = 'role_deliverables';
            this.render();
            return;
        }
        this.dossierTab = tab;
        this.render();
    },

    renderDossierEvalHtml(targetCoId) {
        const co = state.data.companies[targetCoId];
        if (!co) return '';

        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        const subjects = ['FYQ', 'LYE', 'LEN', 'ECO', 'MAT', 'ING'];
        
        let weightedSum = 0;
        let evaluatedWeightSum = 0;
        
        subjects.forEach(sub => {
            const g = (co.grades && co.grades[sub]) ? co.grades[sub] : null;
            const w = weights[sub] || 0;
            if (g && g.final !== null && g.final !== undefined) {
                weightedSum += Number(g.final) * w;
                evaluatedWeightSum += w;
            }
        });

        const hasAnyGrade = evaluatedWeightSum > 0;
        const globalNoteDisplay = hasAnyGrade ? weightedSum.toFixed(2) : '--';
        const progressPct = Math.round(evaluatedWeightSum * 100);

        let html = `
        <div class="terminal-border bg-mars-card p-5 mb-6 border-l-4 border-l-mars-yellow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h3 class="font-orbitron text-mars-yellow text-sm uppercase tracking-widest font-black">Calificación Global Ponderada del Proyecto</h3>
                <p class="text-xs text-slate-300 uppercase mt-1">Fórmula Oficial: FYQ (25%) + LYE (40%) + LEN (15%) + ECO (10%) + MAT (5%) + ING (5%)</p>
            </div>
            <div class="flex items-center gap-4 bg-black px-4 py-2.5 border border-mars-border self-end sm:self-center">
                <div class="text-right">
                    <span class="block text-xs text-slate-300 uppercase font-bold">Peso Evaluado: ${progressPct}%</span>
                    <span class="text-xs text-mars-cyan font-bold uppercase">Nota Acumulada</span>
                </div>
                <span class="text-2xl sm:text-3xl font-orbitron font-black ${hasAnyGrade ? 'text-mars-green' : 'text-slate-400'}">${globalNoteDisplay}</span>
            </div>
        </div>
        ${evaluatedWeightSum === 0 ? `<div class="bg-slate-900 border border-mars-cyan/30 p-3 text-xs text-slate-300 font-mono mb-6">ℹ️ Las calificaciones del proyecto comenzarán a reflejarse tras la entrega y evaluación de los primeros hitos de Diciembre.</div>` : ''}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
        
        subjects.forEach(sub => {
            const config = RUBRIC_CONFIG[sub];
            if (!config) return;
            const grade = (co.grades && co.grades[sub]) ? co.grades[sub] : { scores: {}, feedback: '', final: null };
            const subWeightPct = Math.round((weights[sub] || 0) * 100);
            const criteriaRows = config.criteria.map(c => `
                <div class="flex justify-between text-xs uppercase w-full border-b border-slate-800/60 pb-1.5 gap-2">
                    <span class="text-slate-300 pr-2">${this.escapeHTML(c.name)} (${Number((c.weight*100).toFixed(1))}%)</span>
                    <span class="font-mono font-bold shrink-0 ${grade.scores && grade.scores[c.id] !== undefined ? 'text-white' : 'text-slate-400'}">${grade.scores && grade.scores[c.id] !== undefined ? this.escapeHTML(grade.scores[c.id]) : '-'}</span>
                </div>`).join('');
            
            html += `
            <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan w-full flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border/50 pb-2 gap-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase">${this.escapeHTML(config.name)}</h3>
                            <span class="text-xs bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40 px-2 py-0.5 font-bold uppercase inline-block mt-1">Representación en Proyecto: ${subWeightPct}%</span>
                        </div>
                        <span class="text-xl font-mono font-black ${grade.final !== null && grade.final !== undefined ? 'text-mars-green' : 'text-slate-400'}">${grade.final !== null && grade.final !== undefined ? Number(grade.final).toFixed(2) : '--'}</span>
                    </div>
                    <div class="hidden sm:block space-y-2 mb-3 w-full">
                        ${criteriaRows}
                    </div>
                </div>
                <div class="flex flex-col gap-2">
                    <button type="button" onclick="ui.inspectRubricDrawer('${this.escapeHTML(targetCoId)}', '${sub}')" class="sm:hidden min-h-[44px] w-full bg-slate-900 border border-mars-cyan/60 text-mars-cyan font-black uppercase text-xs py-2 px-3 hover:bg-mars-cyan hover:text-black transition-all">
                        [ 🔍 INSPECCIONAR DESGLOSE RÚBRICA ]
                    </button>
                    ${grade.feedback ? `<div class="bg-black p-3 border border-slate-700 text-xs text-slate-200 italic w-full mt-1 break-words"><span class="text-mars-yellow font-bold not-italic block mb-1 uppercase text-xs">Feedback Docente:</span>"${this.escapeHTML(grade.feedback)}"</div>` : '<div class="text-xs text-slate-400 italic uppercase mt-1">Sin observaciones registradas todavía.</div>'}
                </div>
            </div>`;
        });
        html += `</div>`;
        return html;
    },

    renderDossierContent(tab, coId) {
        const container = document.getElementById('dossier-content');
        if (!container || !state.user) return; 
        
        // Blindaje FASE 4: Un alumno jamás puede inspeccionar otro coId distinto al de su sesión congelada
        const targetCoId = state.user.admin ? (coId || Object.keys(state.data.companies)[0]) : state.user.coId;
        const co = state.data.companies[targetCoId];
        if (!state.user.admin && !co) return auth.logout();
        if (!co) return;
        
        if (tab === 'cronograma') {
            container.innerHTML = this.renderCronogramaSection ? this.renderCronogramaSection(targetCoId) : '';
            return;
        }

        if(tab === 'eval') {
            container.innerHTML = this.renderDossierEvalHtml(targetCoId);
        } else {
            // MÓDULO B (v1.0.19): Bóveda de Entregables con Acordeones por Fase (Milestone Collapsible) y Detalle Bajo Demanda (Bottom-Sheet Drawer)
            const docs = co.deliverables || {};
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const isAdmin = Boolean(state.user && state.user.admin);
            const activeDefs = (!isAdmin)
                ? defs.filter(d => {
                    const p = ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I');
                    return ui.isPhaseUnlocked(p, co) && !ui.isDeliverableLocked(d.key, co);
                })
                : defs;
            const deliveredCount = activeDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
            const activeGroup = this.activeMilestoneGroup || 'PHASE_I';
            const isCEO = state.user && this.getEffectiveRole(co) === 'CEO';

            const pDefs = typeof PROJECT_PHASES_DEF !== 'undefined' ? PROJECT_PHASES_DEF : {};
            const milestonePhases = [
                {
                    id: 'PHASE_I',
                    phaseCode: 'I',
                    title: pDefs.I ? pDefs.I.name : 'FASE I: PREPARACIÓN, IDENTIDAD Y PRESUPUESTO INICIAL',
                    desc: pDefs.I ? pDefs.I.desc : '',
                    badge: 'FASE I // INICIO: 02/11/2026',
                    openDate: '02/11/2026',
                    accent: 'border-mars-cyan text-mars-cyan'
                },
                {
                    id: 'PHASE_II',
                    phaseCode: 'II',
                    title: pDefs.II ? pDefs.II.name : 'FASE II: ANÁLISIS MATEMÁTICO Y LANZAMIENTOS DE PRUEBA',
                    desc: pDefs.II ? pDefs.II.desc : '',
                    badge: 'FASE II // INICIO: 15/12/2026',
                    openDate: '15/12/2026',
                    accent: 'border-mars-yellow text-mars-yellow'
                },
                {
                    id: 'PHASE_III',
                    phaseCode: 'III',
                    title: pDefs.III ? pDefs.III.name : 'FASE III: DOCUMENTACIÓN TÉCNICA, BALANCE Y MODELO DE NEGOCIO',
                    desc: pDefs.III ? pDefs.III.desc : '',
                    badge: 'FASE III // INICIO: 15/02/2027',
                    openDate: '15/02/2027',
                    accent: 'border-blue-400 text-blue-400'
                },
                {
                    id: 'PHASE_IV',
                    phaseCode: 'IV',
                    title: pDefs.IV ? pDefs.IV.name : 'FASE IV: CIERRE FORMAL, DOSSIER DE INVERSIÓN Y CUENTA DE RESULTADOS',
                    desc: pDefs.IV ? pDefs.IV.desc : '',
                    badge: 'FASE IV // INICIO: 31/03/2027',
                    openDate: '31/03/2027',
                    accent: 'border-mars-magenta text-mars-magenta'
                }
            ];

            const accordionsHtml = milestonePhases.map(phase => {
                const isUnlocked = ui.isPhaseUnlocked(phase.phaseCode, co);
                let phaseDefs = defs.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === phase.phaseCode);
                if (!isAdmin) {
                    phaseDefs = phaseDefs.filter(def => !ui.isDeliverableLocked(def.key, co));
                }

                if (!isUnlocked && !isAdmin) {
                    return `
                    <div class="terminal-border bg-mars-card border-l-4 border-slate-700 p-4 bg-slate-950/70 opacity-60">
                        <div class="flex items-center justify-between gap-3 flex-wrap">
                            <div>
                                <div class="flex items-center gap-2 flex-wrap mb-1">
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border border-slate-700 bg-black text-slate-400">🔒 FASE ${phase.phaseCode} // BLOQUEADA</span>
                                    <span class="text-xs text-slate-400 font-mono font-bold uppercase">APERTURA OFICIAL: ${phase.openDate}</span>
                                </div>
                                <h4 class="font-orbitron font-bold text-xs sm:text-sm text-slate-400 uppercase tracking-wider">${this.escapeHTML(phase.title)}</h4>
                                ${phase.desc ? `<p class="text-[11px] text-slate-500 mt-0.5 line-clamp-1">${this.escapeHTML(phase.desc)}</p>` : ''}
                            </div>
                            <span class="text-slate-500 font-mono font-bold text-xs px-2.5 py-1 border border-slate-800 bg-black">🔒 PRÓXIMAMENTE</span>
                        </div>
                    </div>`;
                }

                const phaseDelivered = phaseDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
                const isExpanded = activeGroup === phase.id;

                const itemsHtml = phaseDefs.map(def => {
                    const docKey = def.key;
                    const docObj = docs[def.key];
                    const st = docObj ? (docObj.status || 'DELIVERED_TO_TEACHER') : null;
                    const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
                    const openDate = sched.openDate || def.defaultOpenDate;
                    const isLocked = this.isDeliverableLocked(def.key, co);
                    const dlDate = sched.deadline || (state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? (sched.deadline || state.data.config.deadlines[def.key]) : def.defaultDate;
                    const dlStatus = this.getDeadlineStatus(dlDate);

                    const lockBadge = this.getDeliverableLockBadgeHtml
                        ? this.getDeliverableLockBadgeHtml(def.key, co, docObj)
                        : (isLocked
                            ? `<span class="text-xs font-mono font-bold text-mars-yellow bg-mars-yellow/10 border border-mars-yellow/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
                            : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`);

                    let pipelineBadge = '<span class="text-xs font-bold uppercase text-slate-300 bg-black border border-slate-700 px-2 py-0.5">⏳ PENDIENTE</span>';
                    let borderColor = isLocked ? 'border-mars-yellow/40' : 'border-slate-800';

                    if (st === 'EN_TALLER_OPERARIO') {
                        pipelineBadge = '<span class="text-xs font-black uppercase text-blue-400 bg-blue-900/30 border border-blue-500 px-2 py-0.5 animate-pulse">⚙️ EN TALLER</span>';
                        borderColor = 'border-blue-500/60';
                    } else if (st === 'SUBMITTED_TO_CEO') {
                        pipelineBadge = '<span class="text-xs font-black uppercase text-mars-yellow bg-mars-yellow/20 border border-mars-yellow px-2 py-0.5 animate-pulse">🟡 EN REVISIÓN CEO</span>';
                        borderColor = 'border-mars-yellow/60';
                    } else if (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') {
                        const isTeacher = !!docObj?.returnByTeacher;
                        pipelineBadge = isTeacher
                            ? '<span class="text-xs font-black uppercase text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2 py-0.5">⚠️ SUBSANACIÓN DOCENTE</span>'
                            : '<span class="text-xs font-black uppercase text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2 py-0.5">🔴 DEVUELTO / SUBSANAR</span>';
                        borderColor = 'border-mars-magenta/60';
                    } else if (st === 'DELIVERED_TO_TEACHER') {
                        pipelineBadge = '<span class="text-xs font-black uppercase text-mars-green bg-mars-green/20 border border-mars-green px-2 py-0.5">🟢 ENTREGADO A DOCENTE</span>';
                        borderColor = 'border-mars-green/60';
                    }

                    const templateBtn = this.renderDocTemplateBtn(def.key);

                    let ceoDirectActions = '';
                    if (isCEO && docObj && st === 'SUBMITTED_TO_CEO') {
                        ceoDirectActions = `
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="ui.approveDeliverableByCEO('${docKey}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-3 py-1.5 hover:bg-white transition-all shadow-sm" title="Aprobar y Elevar a Evaluación Docente">[ ✓ VISAR ]</button>
                            <button type="button" onclick="ui.modalCeoReturnDeliverable('${docKey}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-3 py-1.5 hover:bg-mars-magenta hover:text-white transition-all" title="Devolver para Subsanación">[ ⚠️ DEVOLVER PARA SUBSANACIÓN ]</button>
                        </div>`;
                    }

                    return `
                    <div class="bg-slate-900/90 border ${borderColor} p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="min-w-0 flex-grow">
                            <div class="flex flex-wrap items-center gap-1.5 mb-1">
                                <span class="text-xs font-black px-2 py-0.5 border border-mars-cyan/60 text-mars-cyan bg-mars-cyan/10 uppercase">${this.escapeHTML(def.subject)} (${this.escapeHTML(def.weight)})</span>
                                ${pipelineBadge}
                                ${lockBadge}
                                <span class="text-xs font-bold px-2 py-0.5 uppercase ${dlStatus.class}">${this.escapeHTML(dlStatus.text)}</span>
                            </div>
                            <p class="text-white font-bold uppercase text-xs sm:text-sm break-words">${this.escapeHTML(def.name)}</p>
                            <p class="hidden sm:block text-xs text-slate-300 uppercase mt-0.5">Responsable: <span class="text-mars-yellow font-bold">${this.escapeHTML(def.role.replace('_',' '))}</span> | Plazo: ${this.escapeHTML(dlDate.replace('T', ' '))}</p>
                            ${(st === 'CEO_REVISION' && (docObj.returnReason || docObj.returnReasonId)) ? `<p class="text-[11px] text-red-400 mt-1 font-mono uppercase">⚠️ Motivo Devolución CEO: ${this.escapeHTML(docObj.returnReason || docObj.returnReasonId)}</p>` : ''}
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0 flex-wrap">
                            ${templateBtn}
                            ${ceoDirectActions}
                            <button type="button" onclick="ui.inspectDeliverableDrawer('${this.escapeHTML(targetCoId)}', '${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 sm:flex-initial bg-slate-800 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs px-3 py-2 transition-all">
                                [ 🔍 INSPECCIONAR ]
                            </button>
                            ${docObj ? `<a href="${this.escapeHTML(docObj.driveUrl || docObj.url || docObj.dataUrl || '#')}" data-doc-url="${this.escapeAttr(docObj.driveUrl || docObj.url || docObj.dataUrl || '')}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-3 py-2 hover:bg-white transition-all flex items-center justify-center">🔗 ABRIR</a>` : ''}
                        </div>
                    </div>`;
                }).join('');

                return `
                <div class="terminal-border bg-mars-card border-l-4 ${phase.accent.split(' ')[0]} overflow-hidden">
                    <button type="button" aria-expanded="${isExpanded}" onclick="ui.toggleMilestoneAccordion('${phase.id}')" class="w-full min-h-[52px] p-4 flex justify-between items-center gap-3 text-left bg-slate-900/70 hover:bg-slate-900 transition-all">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <span class="text-xs font-black uppercase px-2 py-0.5 border ${phase.accent} bg-black">${phase.badge}</span>
                                <span class="text-xs text-slate-300 font-mono uppercase">Visados / Entregados: <strong class="text-white">${phaseDelivered}/${phaseDefs.length}</strong></span>
                            </div>
                            <h4 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase tracking-wider break-words">${phase.title}</h4>
                            ${phase.desc ? `<p class="text-[11px] text-slate-400 mt-0.5 line-clamp-1">${this.escapeHTML(phase.desc)}</p>` : ''}
                        </div>
                        <span class="text-mars-cyan font-orbitron font-black text-sm shrink-0 px-2 py-1 border border-slate-700 bg-black">${isExpanded ? '▲ PLEGAR' : '▼ DESPLEGAR'}</span>
                    </button>
                    <div class="${isExpanded ? 'block' : 'hidden'} p-3 sm:p-4 space-y-2.5 border-t border-mars-border bg-black/40">
                        ${itemsHtml}
                    </div>
                </div>`;
            }).join('');

            const phaseVCardHtml = `
            <div class="terminal-border bg-mars-card border-l-4 border-mars-green p-4 bg-slate-900/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border border-mars-green text-mars-green bg-black">FASE V // 19/05/2027</span>
                        <span class="text-xs text-mars-green font-mono font-bold uppercase">🏆 EVENTO CULMINANTE</span>
                    </div>
                    <h4 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase tracking-wider">${pDefs.V ? this.escapeHTML(pDefs.V.name) : 'Fase V: Concurso Final'}</h4>
                    <p class="text-xs text-slate-300 mt-1">${pDefs.V ? this.escapeHTML(pDefs.V.desc) : 'Culminación del proyecto con la celebración del Concurso Final (19/05/2027).'}</p>
                </div>
                <button type="button" onclick="ui.openPhaseVNews()"
                    class="min-h-[44px] px-3.5 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                    🏆 Ver Concurso Final ➔
                </button>
            </div>`;

            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-4 mb-6 border-l-4 border-l-mars-cyan flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-sm uppercase">Bóveda Oficial de Entregables por Fases</h3>
                    <p class="text-xs text-slate-300 uppercase mt-1">Supervisión en 4 estados: Pendiente ➔ En Revisión CEO ➔ Devuelto / Subsanar ➔ Entregado a Docente.</p>
                </div>
                <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-xs font-mono font-black uppercase">Entregados a Docente: ${deliveredCount} / ${activeDefs.length}</span>
            </div>
            <div class="space-y-4 w-full">
                ${accordionsHtml}
                ${phaseVCardHtml}
            </div>`;
        }
    },

    viewDashboard(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const role = state.user.role;
        const effectiveRole = this.getEffectiveRole(co);
        const isCEO = effectiveRole === 'CEO';
        const isAux = role === 'AUXILIAR' && !co?.auxRoleDept;

        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const docs = co.deliverables || {};
        const clockMetrics = this.getPhaseClockMetrics
            ? this.getPhaseClockMetrics(co)
            : { phaseInfo: { key: 'I', name: 'Fase I', deadline: '15/12/2026 23:59' }, nowTs: Date.now(), timeProgressPct: 0, daysRemaining: 30, phaseDefs: [], phaseTotalCount: 0, phaseDeliveredCount: 0, phaseCeoCount: 0, phaseReturnedCount: 0, pendingDeliverablesCount: 0, phasePct: 0, isDanger: false, isAllDoneSafe: false };
        if (clockMetrics.isDanger && typeof this.playPhaseDangerChime === 'function') {
            this.playPhaseDangerChime(clockMetrics.phaseInfo.key);
        }

        const submittedCeoDefs = defs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO');
        const pendingPhaseBalances = Object.values(co.phaseBalances || {}).filter(b => b && b.status === 'PENDIENTE_CEO');
        const pendingCeoDeliverables = Object.values(docs).filter(d => d && d.status === 'SUBMITTED_TO_CEO').length + pendingPhaseBalances.length;
        const returnedDeliverables = Object.values(docs).filter(d => d && (d.status === 'CEO_REVISION' || d.status === 'DEVUELTO_A_TECNICO')).length;
        const deliveredCount = Object.values(docs).filter(d => d && d.status === 'DELIVERED_TO_TEACHER').length;

        // Órdenes pendientes y Marketing / Slogan para CEO
        const pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS').length;
        const pendingMktActionsList = [];
        (co.marketingCampaigns || []).forEach(c => {
            (c.executedActions || []).forEach(a => {
                if (a && a.status === 'PENDIENTE_CEO') {
                    pendingMktActionsList.push({ camp: c, act: a });
                }
            });
        });
        const pendingMktActions = pendingMktActionsList.length;
        const pendingSlogan = (co.brandApproval && co.brandApproval.status === 'PENDIENTE_CEO') ? co.brandApproval : null;

        // Clasificación de urgencia para Micro-Filtro de la Bandeja de Visado del CEO
        const nowTs = clockMetrics.nowTs || Date.now();
        const isLicenseBlocked = !co.launchLicense || !co.launchLicense.status || co.launchLicense.status === 'SIN_SOLICITAR' || co.launchLicense.status === 'DENEGADA';
        const isPhaseClosingSoon = clockMetrics.daysRemaining <= 7;

        const isSloganUrgent = Boolean(pendingSlogan);
        const sloganUrgentReason = clockMetrics.phaseInfo.key !== 'I' ? 'Rezagado Fase I' : 'Identidad Fase I';

        const isMktUrgent = isPhaseClosingSoon;
        const mktUrgentReason = clockMetrics.daysRemaining <= 0 ? 'Fase Agotada' : `Cierre Fase (${clockMetrics.daysRemaining}d)`;

        const classifiedCeoDefs = submittedCeoDefs.map(d => {
            const dlTs = this.getDeliverableDeadlineTs ? this.getDeliverableDeadlineTs(d) : 9999999999999;
            const daysUntilDl = Math.floor((dlTs - nowTs) / 86400000);
            const isPrelimBlocking = (d.key === 'preliminaryReport' && isLicenseBlocked);
            const isDeadlineNear = dlTs < 9000000000000 && daysUntilDl <= 7;
            const isUrgent = isPrelimBlocking || isDeadlineNear;
            let urgentReason = '';
            if (isDeadlineNear) {
                urgentReason = dlTs < nowTs ? 'Plazo Expirado' : `Vence en ${Math.max(0, daysUntilDl)}d`;
            } else if (isPrelimBlocking) {
                urgentReason = 'Desbloquea AESA';
            }
            return { def: d, dlTs, isUrgent, urgentReason };
        });

        const pendingSpecialItemsCount = (co.specialItemRequests || []).filter(r => r && r.status === 'PENDIENTE_CEO').length;
        const totalTrayPendingItems = submittedCeoDefs.length + pendingPhaseBalances.length + pendingMktActionsList.length + (pendingSlogan ? 1 : 0);
        const totalPendingCeoItems = totalTrayPendingItems + pendingSpecialItemsCount;
        const urgentCount = (isSloganUrgent ? 1 : 0) + (isMktUrgent ? pendingMktActionsList.length : 0) + pendingPhaseBalances.length + classifiedCeoDefs.filter(x => x.isUrgent).length;
        const activeTrayFilter = (this.ceoTrayFilter === 'URGENT') ? 'URGENT' : 'ALL';

        const visibleSlogan = (activeTrayFilter === 'ALL' || isSloganUrgent) ? pendingSlogan : null;
        const visibleMktActions = (activeTrayFilter === 'ALL') ? pendingMktActionsList : (isMktUrgent ? pendingMktActionsList : []);
        const visiblePhaseBalances = pendingPhaseBalances;
        const visibleCeoDefs = (activeTrayFilter === 'URGENT') ? classifiedCeoDefs.filter(x => x.isUrgent) : classifiedCeoDefs;
        const visibleTotalCount = (visibleSlogan ? 1 : 0) + visibleMktActions.length + visiblePhaseBalances.length + visibleCeoDefs.length;

        let ceoTrayHtml = '';
        if (isCEO) {
            ceoTrayHtml = `
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-yellow shadow-[0_0_15px_rgba(255,204,0,0.15)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3 mb-4">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-mars-yellow/20 border border-mars-yellow text-mars-yellow ${totalPendingCeoItems > 0 ? 'animate-pulse' : ''}">SUPERVISIÓN DIRECTIVA</span>
                            <span class="text-xs text-slate-400 font-mono">${totalPendingCeoItems} PENDIENTES DE VISADO</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-tight">
                            📋 Bandeja de Visado Ejecutivo
                        </h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Revisa, visa y eleva al claustro o devuelve con justificación técnica los entregables y trámites del equipo.</p>
                    </div>
                    <button type="button" onclick="ui.navigate('role_deliverables')" class="shrink-0 w-full sm:w-auto justify-center min-h-[44px] bg-slate-900 border border-mars-yellow text-mars-yellow hover:bg-mars-yellow hover:text-black font-black uppercase text-xs px-4 py-2 transition-all whitespace-nowrap text-center">
                        Ver Mis Entregables ➔
                    </button>
                </div>
                ${totalTrayPendingItems > 0 ? `
                    <div class="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-slate-800/80">
                        <span class="text-[11px] font-mono uppercase text-slate-400 mr-1">Priorizar:</span>
                        <button type="button" onclick="ui.setCeoTrayFilter('ALL')" class="min-h-[44px] px-3.5 py-2 rounded font-mono font-bold text-xs uppercase transition-all border ${activeTrayFilter === 'ALL' ? 'bg-mars-yellow text-black border-mars-yellow shadow-[0_0_10px_rgba(255,204,0,0.3)]' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500 hover:text-white'}">
                            📋 Todos (${totalTrayPendingItems})
                        </button>
                        <button type="button" onclick="ui.setCeoTrayFilter('URGENT')" class="min-h-[44px] px-3.5 py-2 rounded font-mono font-bold text-xs uppercase transition-all border ${activeTrayFilter === 'URGENT' ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(255,0,85,0.4)]' : (urgentCount > 0 ? 'bg-red-950/60 text-amber-300 border-red-500/60 hover:bg-red-900/70' : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200')}">
                            ⚡ Solo Urgentes / Próximos a Cierre (${urgentCount})
                        </button>
                    </div>
                ` : ''}
                ${totalTrayPendingItems === 0 ? `
                    <div class="p-5 bg-slate-900/60 border border-slate-800 text-center rounded space-y-2.5">
                        ${clockMetrics.phaseDeliveredCount >= clockMetrics.phaseTotalCount && clockMetrics.phaseTotalCount > 0 ? `
                            <p class="text-xs font-mono text-emerald-400 uppercase font-bold">✨ Todos los entregables de Fase ${this.escapeHTML(clockMetrics.phaseInfo.key)} están entregados al Claustro.</p>
                        ` : `
                            <p class="text-xs font-mono text-cyan-300 uppercase font-bold">⏳ Sin visados en espera ahora mismo (${clockMetrics.phaseDeliveredCount}/${clockMetrics.phaseTotalCount} hitos completados en Fase ${this.escapeHTML(clockMetrics.phaseInfo.key)}).</p>
                            <p class="text-[11px] text-slate-300 font-sans">Faltan ${Math.max(0, clockMetrics.phaseTotalCount - clockMetrics.phaseDeliveredCount)} hito(s) en elaboración por tus departamentos. Cuando los suban, aparecerán aquí para tu firma.</p>
                        `}
                        ${(() => {
                            const hasPhaseContract = Object.values(co.contracts || {}).some(c => c && c.phase === clockMetrics.phaseInfo.key);
                            const openMotions = (co.votingMotions || []).filter(m => m && m.status === 'ABIERTA').length;
                            const unreadCris = (co.crisisAlerts || []).some(a => a && !a.read);
                            const aesaUnlocked = this.isLaunchLicenseUnlocked ? this.isLaunchLicenseUnlocked(co) : false;
                            const aesaSt = co.launchLicense?.status || 'SIN_SOLICITAR';
                            const aesaNeedsCeo = aesaUnlocked && (aesaSt === 'SIN_SOLICITAR' || aesaSt === 'DENEGADA');
                            if (unreadCris) {
                                return `<p class="text-xs font-sans text-rose-300 font-bold">👉 Siguiente acción prioritaria: Comunicar la alerta disciplinaria AEE superior.</p>`;
                            } else if (aesaNeedsCeo) {
                                return `<div class="pt-1 flex justify-center"><button type="button" onclick="ui.modalLaunchLicense()" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-mars-yellow/70 text-mars-yellow hover:bg-mars-yellow hover:text-black font-bold text-xs uppercase rounded">🚀 Siguiente acción: ${aesaSt === 'DENEGADA' ? 'Subsanar' : 'Tramitar'} Licencia AESA (DOC_14) ➔</button></div>`;
                            } else if (openMotions > 0) {
                                return `<div class="pt-1 flex justify-center"><button type="button" onclick="ui.navigate('resolutions')" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-mars-yellow/60 text-mars-yellow hover:bg-mars-yellow hover:text-black font-bold text-xs uppercase rounded">⚖️ Siguiente acción: Revisar ${openMotions} moción(es) en Asamblea ➔</button></div>`;
                            } else if (!hasPhaseContract) {
                                return `<div class="pt-1 flex justify-center"><button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-mars-cyan/60 text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase rounded">🤝 Siguiente acción: Elegir Contrato Comercial de Fase ${this.escapeHTML(clockMetrics.phaseInfo.key)} ➔</button></div>`;
                            }
                            return '';
                        })()}
                        ${pendingSpecialItemsCount > 0 ? `
                            <p class="text-xs font-mono text-mars-magenta pt-1 font-bold">🔬 Tienes ${pendingSpecialItemsCount} solicitud(es) de material especial I+D pendiente(s) en el panel inferior.</p>
                        ` : ''}
                    </div>
                ` : (visibleTotalCount === 0 ? `
                    <div class="p-5 bg-slate-900/60 border border-emerald-500/40 text-center rounded space-y-3">
                        <p class="text-xs font-mono text-emerald-300 uppercase font-bold">✅ Sin visados urgentes o con fecha de cierre inminente (≤ 7 días).</p>
                        <p class="text-[11px] text-slate-400">Tienes ${totalTrayPendingItems} trámite(s) ordinario(s) pendiente(s) con plazo holgado.</p>
                        <button type="button" onclick="ui.setCeoTrayFilter('ALL')" class="min-h-[44px] bg-slate-800 border border-mars-yellow/70 text-mars-yellow hover:bg-mars-yellow hover:text-black font-black uppercase text-xs px-4 py-2 transition-all rounded">
                            [ 📋 Ver Todos (${totalTrayPendingItems}) ]
                        </button>
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${visibleSlogan ? `
                            <div id="ceo-slogan-approval-panel-dash" class="bg-slate-900/90 border ${isSloganUrgent ? 'border-red-500/80' : 'border-mars-magenta/60'} p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        ${isSloganUrgent ? `<span class="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">⚡ PRIORITARIO · ${this.escapeHTML(sloganUrgentReason)}</span>` : ''}
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-magenta text-mars-magenta">FASE I</span>
                                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Resp: Marketing</span>
                                        <span class="text-xs text-slate-400 font-mono">Identidad • DOC_11</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">Propuesta de Slogan Corporativo: ${visibleSlogan.pendingSlogan ? `"${this.escapeHTML(visibleSlogan.pendingSlogan)}"` : `<span class="text-mars-cyan">${this.escapeHTML(visibleSlogan.concept || 'Documento DOC_11 en Drive')}</span>`}</h4>
                                    ${visibleSlogan.valueProposition ? `<p class="text-[11px] text-slate-300 font-mono mt-1">Lema: "${this.escapeHTML(visibleSlogan.valueProposition)}"</p>` : ''}
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${visibleSlogan.driveUrl ? `
                                            <a href="${encodeURI(visibleSlogan.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(visibleSlogan.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                                <span>📄 Ver DOC_11 en Docs ↗</span>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                    <button type="button" onclick="ui.endorseBrandProposal('${this.escapeHTML(co.id)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ AVALAR Y ELEVAR A COORDINACIÓN ]</button>
                                    <button type="button" onclick="ui.returnBrandProposalToMkt('${this.escapeHTML(co.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER A MARKETING ]</button>
                                </div>
                            </div>
                        ` : ''}
                        ${visibleMktActions.map(({ camp, act }) => {
                            const actDrive = act.driveUrl || act.url || '';
                            const actTitle = act.title || act.type || 'Acción Publicitaria';
                            return `
                            <div class="bg-slate-900/90 border ${isMktUrgent ? 'border-red-500/80' : 'border-mars-yellow/50'} p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        ${isMktUrgent ? `<span class="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">⚡ PRIORITARIO · ${this.escapeHTML(mktUrgentReason)}</span>` : ''}
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-purple-950 border border-mars-magenta text-mars-magenta">MARKETING</span>
                                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Acción Publicitaria • DOC_12</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">${this.escapeHTML(actTitle)}</h4>
                                    <p class="text-[11px] text-slate-300 font-mono mt-1">Pack: ${this.escapeHTML(camp.packageName || camp.type || '')}</p>
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${actDrive ? `
                                            <a href="${encodeURI(actDrive).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(actDrive)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                                <span>📄 Ver Creatividad DOC_12 en Docs ↗</span>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                    <button type="button" onclick="ui.decideMktAction('${this.escapeHTML(camp.id)}', '${this.escapeHTML(act.id)}', true)" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ APROBAR ACCIÓN ]</button>
                                    <button type="button" onclick="ui.modalRejectMktAction('${this.escapeHTML(camp.id)}', '${this.escapeHTML(act.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER A MKT ]</button>
                                </div>
                            </div>`;
                        }).join('')}
                        ${visiblePhaseBalances.map(b => `
                            <div id="ceo-balance-approval-panel" class="bg-slate-900/90 border border-red-500/80 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">⚡ PRIORITARIO · Ventana Cierre</span>
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-amber-400 text-amber-400">FASE ${this.escapeHTML(b.phase)}</span>
                                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Resp: Finanzas</span>
                                        <span class="text-xs text-slate-400 font-mono">Economía • DOC_17</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">Balance Contable de Cierre — Fase ${this.escapeHTML(b.phase)}</h4>
                                    <div class="mt-1 text-[11px] text-emerald-300 font-mono">
                                        Dictamen: ${this.escapeHTML(b.verdict)} | Saldo: ${Number(b.snapshot?.balance || 0).toFixed(2)} €v
                                    </div>
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${b.driveUrl ? `
                                            <a href="${encodeURI(b.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(b.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                                <span>📄 Ver DOC_17 en Docs ↗</span>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                    <button type="button" onclick="ui.approvePhaseBalanceByCEO('${this.escapeHTML(b.phase)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VISAR Y ELEVAR A ECONOMÍA ]</button>
                                    <button type="button" onclick="ui.modalCeoReturnPhaseBalance('${this.escapeHTML(b.phase)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER A FINANZAS ]</button>
                                </div>
                            </div>
                        `).join('')}
                        ${visibleCeoDefs.map(({ def: d, isUrgent, urgentReason }) => {
                            const doc = docs[d.key];
                            return `
                            <div class="bg-slate-900/90 border ${isUrgent ? 'border-red-500/80' : 'border-amber-500/50'} p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        ${isUrgent ? `<span class="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">⚡ PRIORITARIO · ${this.escapeHTML(urgentReason)}</span>` : ''}
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')}</span>
                                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Resp: ${this.escapeHTML(d.role.replace('_', ' '))}</span>
                                        <span class="text-xs text-slate-400 font-mono">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">${this.escapeHTML(d.name)}</h4>
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${this.renderDocTemplateBtn(d.key)}
                                        ${doc?.driveUrl ? `
                                            <a href="${encodeURI(doc.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(doc.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                                <span>📄 Abrir Documento en Docs ↗</span>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                    <button type="button" onclick="ui.approveDeliverableByCEO('${this.escapeHTML(d.key)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VISAR Y ELEVAR AL CLAUSTRO ]</button>
                                    <button type="button" onclick="ui.modalCeoReturnDeliverable('${this.escapeHTML(d.key)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER A DEPARTAMENTO ]</button>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                `)}
            </div>`;
        }

        const pendingSpecialItems = (co.specialItemRequests || []).filter(r => r.status === 'PENDIENTE_CEO');
        let ceoSpecialItemsHtml = '';
        if (isCEO && pendingSpecialItems.length > 0) {
            ceoSpecialItemsHtml = `
            <div id="ceo-special-items-panel" class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.15)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3 mb-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-mars-magenta/20 border border-mars-magenta text-mars-magenta animate-pulse">I+D // MATERIAL ESPECIAL</span>
                            <span class="text-xs text-slate-400 font-mono">${pendingSpecialItems.length} PENDIENTES DE VISADO CEO</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-tight">
                            🔬 Solicitudes Especiales de Material I+D (Técnico ➔ CEO)
                        </h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">El Dpto. Técnico ha solicitado componentes fuera de catálogo. Revisa la memoria técnica DOC_13 y autoriza su envío a Coordinación.</p>
                    </div>
                </div>
                <div class="space-y-3">
                    ${pendingSpecialItems.map(item => `
                        <div class="bg-slate-900/90 border border-mars-magenta/50 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div class="min-w-0 flex-grow">
                                <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                    <span class="text-xs font-black uppercase px-2 py-0.5 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta">I+D FUERA DE CATÁLOGO</span>
                                    <span class="text-xs text-slate-400 font-mono">${this.escapeHTML(item.date || '--')}</span>
                                </div>
                                <h4 class="text-white font-bold text-sm uppercase leading-snug">${this.escapeHTML(item.name || 'Componente Especial I+D')}</h4>
                                <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                    <a href="${encodeURI(item.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(item.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                        <span>📄 Ver Memoria Técnica DOC_13 ↗</span>
                                    </a>
                                </div>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                                <button type="button" onclick="ui.approveSpecialItemByCEO('${this.escapeHTML(item.id)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ APROBAR Y ELEVAR A COORDINACIÓN ]</button>
                                <button type="button" onclick="ui.modalRejectSpecialItemByCEO('${this.escapeHTML(item.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER A TÉCNICO ]</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        const curPhaseKey = (typeof this.getCurrentPhaseKey === 'function') ? this.getCurrentPhaseKey() : 'I';
        let ceoGovernanceModulesHtml = '';
        if (isCEO) {
            const license = co.launchLicense;
            const isMasterOrAdmin = Boolean(state.user?.admin || co.unlockAllContracts === true);
            const prelimItem = co.deliverables?.['preliminaryReport'];
            const isPrelimDelivered = isMasterOrAdmin || Boolean(prelimItem && ((prelimItem.status === 'DELIVERED_TO_TEACHER' && prelimItem.driveUrl) || (typeof prelimItem === 'string' && prelimItem.length > 0)));
            const isPrelimPendingCeo = !isPrelimDelivered && Boolean(prelimItem && prelimItem.status === 'SUBMITTED_TO_CEO' && prelimItem.driveUrl);

            let licenseCardHtml = '';
            if (!license || license.status === 'SIN_SOLICITAR' || license.status === 'DENEGADA') {
                if (!isPrelimDelivered) {
                    if (isPrelimPendingCeo) {
                        licenseCardHtml = `
                        <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-amber-400 flex flex-col justify-between hover:border-amber-400 transition-all">
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">SEGURIDAD AEROESPACIAL // VISADO REQUERIDO</span>
                                    <span class="text-xs font-mono text-amber-400">Tasa: 50 €v</span>
                                </div>
                                <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia de Lanzamiento AESA (Fase II)</h3>
                                <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                                    Los lanzamientos en el banco de pruebas están bloqueados para Técnico y Operaciones. Requiere validar el Informe Técnico Preliminar antes de tramitar la licencia.
                                </p>
                                <div class="mt-2.5 p-2.5 bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-300 font-sans flex items-start gap-2">
                                    <span class="text-sm">⚠️</span>
                                    <span>Tienes el <strong>Informe Técnico Preliminar</strong> en tu Bandeja de Visado de Sala de Mando. Apruébalo y elévalo al Claustro para habilitar la Licencia AESA.</span>
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                                <span class="text-[11px] text-slate-400 font-mono">DOC_14 AESA</span>
                                <button type="button" disabled class="min-h-[44px] bg-slate-900 border border-slate-700 text-slate-500 font-bold uppercase text-xs px-4 py-2 cursor-not-allowed">[ 🔒 Requiere Visar Informe Preliminar ]</button>
                            </div>
                        </div>`;
                    } else {
                        const rawLicenseCardHtml = `
                        <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-slate-700 flex flex-col justify-between hover:border-slate-600 transition-all">
                            <div>
                                <div class="flex justify-between items-center mb-2">
                                    <span class="text-xs font-black uppercase text-slate-400 bg-slate-900 border border-slate-700 px-2 py-0.5">SEGURIDAD AEROESPACIAL // BLOQUEADA</span>
                                    <span class="text-xs font-mono text-slate-400">Tasa: 50 €v</span>
                                </div>
                                <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia de Lanzamiento AESA (Fase II)</h3>
                                <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                                    Los lanzamientos en el banco de pruebas están bloqueados para Técnico y Operaciones. Tramita y firma la Solicitud AESA (DOC_14) con tasa de 50 €v para validación del Claustro.
                                </p>
                                <div class="mt-2.5 p-2.5 bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-sans flex items-start gap-2">
                                    <span class="text-sm">🔒</span>
                                    <span>El Departamento Técnico debe elaborar y subir previamente el <strong>Informe Técnico Preliminar (FYQ)</strong> para habilitar el trámite de la licencia.</span>
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                                <span class="text-[11px] text-slate-400 font-mono">DOC_14 AESA</span>
                                <button type="button" disabled class="min-h-[44px] bg-slate-900 border border-slate-700 text-slate-500 font-bold uppercase text-xs px-4 py-2 cursor-not-allowed">[ 🔒 Requiere Informe Preliminar ]</button>
                            </div>
                        </div>`;
                        licenseCardHtml = (curPhaseKey === 'I' && !isMasterOrAdmin) ? `
                        <details class="terminal-border bg-mars-card/80 border border-slate-800 rounded">
                            <summary class="min-h-[44px] px-4 py-3 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-white select-none">
                                <span>🔒 Próxima Fase (Fase II): Licencia de Vuelo AESA (Tras Informe Preliminar)</span>
                                <span class="text-mars-cyan shrink-0">▼ Ver</span>
                            </summary>
                            <div class="p-2 pt-0">${rawLicenseCardHtml}</div>
                        </details>` : rawLicenseCardHtml;
                    }
                } else {
                    const initFee = (typeof LAUNCH_LICENSE_FEE !== 'undefined') ? LAUNCH_LICENSE_FEE : 50;
                    const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
                    const isAesaDenied = Boolean(license && license.status === 'DENEGADA');
                    const isResubmission = Boolean(isAesaDenied && Number(license.feePaid || 0) >= initFee);
                    const feeToPay = isResubmission ? resubFee : initFee;
                    const hasReportUrl = Boolean(isAesaDenied && license.rejectReportUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(license.rejectReportUrl));
                    licenseCardHtml = `
                    <div class="terminal-border bg-mars-card p-5 border-t-2 ${isAesaDenied ? 'border-t-red-500' : 'border-t-mars-yellow'} flex flex-col justify-between hover:border-mars-yellow transition-all">
                        <div>
                            <div class="flex justify-between items-center mb-2 flex-wrap gap-1">
                                <span class="text-xs font-black uppercase ${isAesaDenied ? 'text-red-300 bg-red-950/50 border-red-500/60' : 'text-mars-yellow bg-mars-yellow/10 border-mars-yellow/40'} border px-2 py-0.5">${isAesaDenied ? 'AESA // SUBSANACIÓN REQUERIDA' : 'SEGURIDAD AEROESPACIAL'}</span>
                                <div class="flex items-center gap-1.5">
                                    ${co.unlockAllContracts === true ? `<span class="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase rounded">🧪 Sandbox Desbloqueado</span>` : `<span style="color: #00ff66 !important;" class="text-[10px] font-mono">✓ Informe Preliminar Entregado</span>`}
                                    <span class="text-xs font-mono ${isResubmission ? 'text-red-300 font-bold' : 'text-amber-400'}">${isResubmission ? `Subsanación: ${resubFee} €v` : `Tasa: ${initFee} €v`}</span>
                                </div>
                            </div>
                            <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia de Lanzamiento AESA (Fase II)</h3>
                            <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                                Los lanzamientos en el banco de pruebas están bloqueados para Técnico y Operaciones. Tramita y firma la Solicitud AESA (DOC_14) ${isResubmission ? `subsanada (tasa de subsanación: ${resubFee} €v) para nueva validación del Claustro.` : `con tasa de ${initFee} €v para validación del Claustro.`}
                            </p>
                            ${isAesaDenied ? `
                            <div class="mt-2.5 p-2.5 bg-red-950/50 border border-red-500/60 text-xs text-red-200 font-sans rounded space-y-2">
                                <div>
                                    <strong class="uppercase text-red-400 block mb-0.5">❌ Denegada por Coordinación:</strong>
                                    <span>"${this.escapeHTML(license.rejectReason || 'Revisar documentación y permisos en Drive antes de reenviar.')}"</span>
                                </div>
                                ${hasReportUrl ? `
                                    <a href="${encodeURI(license.rejectReportUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/50 text-red-100 border border-red-400/60 rounded font-mono hover:bg-red-800/70 transition-colors">
                                        <span>📄 Ver Informe de No Admisión Docente ↗</span>
                                    </a>
                                ` : ''}
                            </div>` : ''}
                        </div>
                        <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
                            <span class="text-[11px] text-slate-400 font-mono">DOC_14 AESA</span>
                            ${(feeToPay > 0 && this.isCompanyBankrupt && this.isCompanyBankrupt(co))
                                ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] bg-slate-900 border border-rose-500/60 text-rose-300 font-black uppercase text-xs px-4 py-2 cursor-not-allowed">🔒 Bloqueado (Saldo ≤ 0 €v)</button>`
                                : `<button type="button" onclick="ui.modalLaunchLicense()" class="min-h-[44px] ${isAesaDenied ? 'bg-red-600 text-white hover:bg-white hover:text-red-700' : 'bg-mars-yellow text-black hover:bg-white'} font-black uppercase text-xs px-4 py-2 transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">${isResubmission ? `[ 🔄 Subsanar Licencia AESA (${feeToPay} €v) ]` : `[ 🚀 Tramitar Licencia AESA (${feeToPay} €v) ]`}</button>`
                            }
                        </div>
                    </div>`;
                }
            } else if (license.status === 'PENDIENTE_DOCENTE') {
                const paidTotal = Number(license.feePaid || 50);
                licenseCardHtml = `
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-amber-400 flex flex-col justify-between hover:border-amber-400 transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">EN EVALUACIÓN DOCENTE</span>
                            <span style="color: #00ff66 !important;" class="text-xs font-mono font-bold">${paidTotal} €v Abonados</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia AESA Tramitada</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                            Solicitud formal tramitada y firmada por el CEO. En espera del visado de Coordinación Docente para desbloquear los ensayos en el banco de pruebas.
                        </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <a href="${encodeURI(license.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-xs text-cyan-300 underline font-mono">Ver DOC_14 Tramitado ↗</a>
                        <span class="text-xs text-amber-400 font-mono font-bold animate-pulse">⏳ Pendiente Claustro</span>
                    </div>
                </div>`;
            } else {
                licenseCardHtml = `
                <div style="border-top: 2px solid #00ff66 !important;" class="terminal-border bg-mars-card p-5 flex flex-col justify-between transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span style="background-color: rgba(0, 255, 102, 0.15) !important; border: 1px solid #00ff66 !important; color: #00ff66 !important;" class="text-xs font-black uppercase px-2 py-0.5">AUTORIZADA</span>
                            <span style="color: #00ff66 !important;" class="text-xs font-mono font-bold">Vuelos Activos</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia AESA Autorizada</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                            Permiso oficial de vuelo y seguridad concedido por Coordinación Docente. El banco de pruebas se encuentra 100% operativo.
                        </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <a href="${encodeURI(license.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" style="color: #5eead4 !important;" class="text-xs underline font-mono">Ver DOC_14 Concedido ↗</a>
                        <span style="color: #00ff66 !important;" class="text-xs font-mono font-bold">✓ Operativo</span>
                    </div>
                </div>`;
            }

            // Módulo de Contrato en Vigor y Contador para el CEO (Mitad inferior izquierda)
            const signedActiveContract = co.contracts?.[curPhaseKey];
            const allSignedContracts = Object.values(co.contracts || {}).filter(c => c && c.contractId);
            const signedContractsCount = allSignedContracts.length;
            const completedContractsCount = allSignedContracts.filter(c => c.status === 'CUMPLIDO').length;

            let ceoActiveContractCardHtml = '';
            if (signedActiveContract && signedActiveContract.contractId) {
                const isContractCompleted = signedActiveContract.status === 'CUMPLIDO';
                const isContractFailed = signedActiveContract.status === 'NO_CUMPLIDO';

                let cardStyle = 'background-color: rgba(99, 102, 241, 0.08) !important; border: 2px solid #6366f1 !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.2) !important;';
                let headerBorder = 'border-bottom: 1px solid rgba(99, 102, 241, 0.4) !important;';
                let titleColor = 'color: #a5b4fc !important;';
                let statusBadge = '<span style="background-color: rgba(99, 102, 241, 0.25) !important; border: 1px solid #818cf8 !important; color: #c7d2fe !important; font-weight: bold !important;" class="text-[10px] uppercase font-mono px-2 py-0.5 rounded animate-pulse">⏳ EN CURSO</span>';

                if (isContractCompleted) {
                    cardStyle = 'background-color: rgba(0, 255, 102, 0.08) !important; border: 2px solid #00ff66 !important; box-shadow: 0 0 20px rgba(0, 255, 102, 0.3) !important;';
                    headerBorder = 'border-bottom: 1px solid rgba(0, 255, 102, 0.4) !important;';
                    titleColor = 'color: #00ff66 !important; text-shadow: 0 0 8px rgba(0, 255, 102, 0.4);';
                    statusBadge = `<span style="background-color: #00ff66 !important; color: #000000 !important; font-weight: 900 !important; box-shadow: 0 0 10px rgba(0, 255, 102, 0.6) !important;" class="text-[10px] uppercase font-orbitron px-2 py-0.5 rounded">✅ CUMPLIDO (+${signedActiveContract.reward} €v)</span>`;
                } else if (isContractFailed) {
                    cardStyle = 'background-color: rgba(255, 0, 85, 0.08) !important; border: 2px solid #ff0055 !important; box-shadow: 0 0 20px rgba(255, 0, 85, 0.3) !important;';
                    headerBorder = 'border-bottom: 1px solid rgba(255, 0, 85, 0.4) !important;';
                    titleColor = 'color: #ff0055 !important; text-shadow: 0 0 8px rgba(255, 0, 85, 0.4);';
                    statusBadge = `<span style="background-color: #ff0055 !important; color: #ffffff !important; font-weight: 900 !important; box-shadow: 0 0 10px rgba(255, 0, 85, 0.6) !important;" class="text-[10px] uppercase font-orbitron px-2 py-0.5 rounded">❌ NO CUMPLIDO (-${signedActiveContract.penalty} €v)</span>`;
                }

                ceoActiveContractCardHtml = `
                <div style="${cardStyle}" class="p-4 sm:p-5 rounded flex flex-col justify-between">
                    <div>
                        <div style="${headerBorder}" class="flex justify-between items-center mb-2 pb-2 flex-wrap gap-1">
                            <span style="${titleColor}" class="text-[10px] font-orbitron font-bold uppercase tracking-wider">
                                🤝 CONTRATO EN VIGOR (FASE ${this.escapeHTML(curPhaseKey)})
                            </span>
                            <span class="text-[10px] font-mono font-bold text-slate-300">
                                🏆 ${completedContractsCount}/${signedContractsCount} Cumplidos
                            </span>
                        </div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 class="font-orbitron font-bold text-white text-xs sm:text-sm uppercase tracking-wide break-words">
                                ${this.escapeHTML(signedActiveContract.company)} — ${this.escapeHTML(signedActiveContract.title)}
                            </h4>
                            ${statusBadge}
                        </div>
                        <p class="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
                            <strong class="text-slate-400 uppercase">Requisitos:</strong> ${this.escapeHTML(signedActiveContract.requirements)}
                        </p>
                    </div>
                    <div class="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                        ${(() => {
                            const bomCostEv = typeof state.calculateBomCost === 'function' ? state.calculateBomCost(co) : 0;
                            const actaC = this.getCompanyActaSummary ? this.getCompanyActaSummary(co) : { bestE: null };
                            return `<span class="px-2 py-0.5 bg-black/60 border border-slate-700 text-cyan-300 rounded">Coste BOM: ${bomCostEv.toFixed(2)} €v</span>
                                    <span class="px-2 py-0.5 bg-black/60 border border-slate-700 text-mars-yellow rounded">Mejor E: ${actaC.bestE !== null ? actaC.bestE.toFixed(2) : '--'}</span>`;
                        })()}
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center gap-2">
                        <div class="flex items-center gap-2 font-mono text-xs">
                            <span style="color: #00ff66 !important;" class="font-bold">+${signedActiveContract.reward} €v</span>
                            <span class="text-slate-600">|</span>
                            <span style="color: #ff0055 !important;" class="font-bold">-${signedActiveContract.penalty} €v</span>
                        </div>
                        <button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] px-3 py-1 bg-slate-900 hover:bg-white text-slate-300 hover:text-black border border-slate-700 font-bold uppercase text-[11px] rounded transition-all">
                            Ver Contratos ➔
                        </button>
                    </div>
                </div>`;
            } else {
                const isWinOpen = this.isContractPhaseUnlocked ? this.isContractPhaseUnlocked(curPhaseKey, co) : true;
                const isBudgetReady = this.isBudgetInitialDelivered ? this.isBudgetInitialDelivered(co) : true;
                const contractHintText = (curPhaseKey === 'I' && !isBudgetReady && !isMasterOrAdmin)
                    ? 'Requisito previo: Finanzas debe entregar primero el Presupuesto Inicial de Economía para desbloquear la firma (hasta +200 €v).'
                    : (!isWinOpen && curPhaseKey === 'I' && !isMasterOrAdmin
                        ? 'La ventana de selección comercial de Fase I abre el 21/11/2026 (requiere Presupuesto Inicial entregado). Recompensas hasta +200 €v.'
                        : `Elige y formaliza un contrato comercial para la Fase ${this.escapeHTML(curPhaseKey)} y consigue hasta +200 €v para la tesorería.`);
                ceoActiveContractCardHtml = `
                <div class="terminal-border bg-slate-900/60 border border-slate-800 p-4 sm:p-5 rounded flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                            <span class="text-[10px] font-orbitron font-bold uppercase tracking-wider text-slate-400">
                                🤝 CONTRATO DE FASE ${this.escapeHTML(curPhaseKey)}
                            </span>
                            <span class="text-[10px] font-mono text-slate-400">
                                ${signedContractsCount > 0 ? `🏆 ${completedContractsCount}/${signedContractsCount} Cumplidos` : (!isWinOpen && curPhaseKey === 'I' && !isMasterOrAdmin ? '🔒 Apertura 21/11' : 'Sin Contratos')}
                            </span>
                        </div>
                        <h4 class="font-orbitron font-bold text-white text-xs sm:text-sm uppercase">${!isWinOpen && curPhaseKey === 'I' && !isMasterOrAdmin ? 'Licitaciones Fase I (Próxima Apertura)' : 'Sin Licitación Suscrita'}</h4>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                            ${contractHintText}
                        </p>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-end">
                        <button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] px-3.5 py-1.5 bg-mars-cyan text-black hover:bg-white font-black uppercase text-xs rounded transition-all shadow-sm">
                            ${!isWinOpen && curPhaseKey === 'I' && !isMasterOrAdmin ? '👀 Ver Contratos ➔' : '✍️ Elegir Contrato ➔'}
                        </button>
                    </div>
                </div>`;
            }

            const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [
                { phase: 'I', title: 'Cierre Fase I', phaseCutoffLabel: '15/12/2026', deadlineLabel: '22/12/2026 (Corte: 15/12 + 7 días)' },
                { phase: 'II', title: 'Cierre Fase II', phaseCutoffLabel: '15/02/2027', deadlineLabel: '22/02/2027 (Corte: 15/02 + 7 días)' },
                { phase: 'III', title: 'Cierre Fase III', phaseCutoffLabel: '31/03/2027', deadlineLabel: '07/04/2027 (Corte: 31/03 + 7 días)' },
                { phase: 'IV', title: 'Cierre Fase IV', phaseCutoffLabel: '23/04/2027', deadlineLabel: '30/04/2027 (Corte: 23/04 + 7 días)' }
            ];
            const coReleases = co.pressReleases || {};
            const publishedPrCount = prPhases.filter(p => coReleases[p.phase]).length;
            const anyPrUnlocked = prPhases.some(p => this.isPressReleaseUnlocked(p.phase, co));

            const rawPressReleaseCardHtml = `
            <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-cyan flex flex-col justify-between hover:border-mars-cyan transition-all">
                <div>
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-xs font-black uppercase text-mars-cyan bg-mars-cyan/10 border border-mars-cyan/40 px-2 py-0.5">COMUNICACIÓN OFICIAL</span>
                        <span class="text-xs font-mono text-slate-400">${publishedPrCount}/${prPhases.length} Notas Publicadas</span>
                    </div>
                    <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">📰 Notas de Prensa Corporativas (CEO)</h3>
                    <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                        Publica los comunicados oficiales de balance con 7 días de margen tras el corte de cada fase en el Tablón de Noticias mediante la plantilla DOC_15.
                    </p>
                    <div class="mt-3 space-y-2">
                        ${prPhases.map(p => {
                            const published = coReleases[p.phase];
                            const phaseBalance = co.phaseBalances ? co.phaseBalances[p.phase] : null;
                            const isPrUnlocked = this.isPressReleaseUnlocked(p.phase, co);
                            return `
                            <div class="p-2.5 bg-black/60 border border-slate-800 rounded text-xs flex justify-between items-center flex-wrap gap-2">
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center gap-1.5 flex-wrap">
                                        <span class="text-white font-bold block uppercase">${this.escapeHTML(p.title)}</span>
                                        ${!isPrUnlocked ? `<span class="px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-mono uppercase font-bold">🔒 Bloqueada hasta Cierre</span>` : ''}
                                    </div>
                                    <span class="text-[10px] text-slate-400 font-mono">Plazo Máximo: ${this.escapeHTML(p.deadlineLabel)}</span>
                                    ${phaseBalance ? `
                                        <div class="mt-1">
                                            <span style="background-color: rgba(0, 255, 102, 0.15); border: 1px solid #00ff66; color: #00ff66;" class="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                                📊 Balance Finanzas Listo (${Number(phaseBalance.snapshot?.balance || 0).toFixed(2)} €v)
                                            </span>
                                        </div>
                                    ` : `
                                        <div class="mt-0.5">
                                            <span class="text-[10px] text-amber-400/80 font-mono">Balance de Finanzas pendiente</span>
                                        </div>
                                    `}
                                </div>
                                <div class="shrink-0">
                                    ${published ? (published.status === 'RETURNED' ? `
                                        <div class="flex flex-col items-end gap-1.5">
                                            <div class="flex items-center gap-2 flex-wrap justify-end">
                                                <span class="bg-red-950/80 border border-red-500 text-red-300 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">⚠️ Subsanación DOC_15</span>
                                                <a href="${encodeURI(published.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2 py-1 text-[11px] text-cyan-300 underline font-mono">Ver DOC_15 ↗</a>
                                                ${published.returnDriveUrl ? `<a href="${encodeURI(published.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2 py-1 text-[11px] text-amber-300 underline font-mono">Notas Docente ↗</a>` : ''}
                                            </div>
                                            ${published.returnReason ? `<p class="text-[10px] text-red-300 text-right max-w-xs">${this.escapeHTML(published.returnReason)}</p>` : ''}
                                            <button type="button" onclick="ui.modalPublishPressRelease('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-red-950/60 border border-red-400 text-red-200 hover:bg-red-500 hover:text-white font-bold uppercase text-[11px] px-2.5 py-1 transition-all">
                                                🔄 Reenviar Nota Corregida
                                            </button>
                                        </div>
                                    ` : `
                                        <div class="flex items-center gap-2">
                                            <span style="background-color: rgba(0, 255, 102, 0.15); border: 1px solid #00ff66; color: #00ff66;" class="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded">✓ Publicada</span>
                                            <a href="${encodeURI(published.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-cyan-300 underline font-mono">Ver DOC_15 ↗</a>
                                        </div>
                                    `) : (!isPrUnlocked ? `
                                        <button type="button" disabled class="min-h-[44px] bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase text-[11px] px-2.5 py-1 cursor-not-allowed" title="Disponible a partir del ${this.escapeHTML(p.phaseCutoffLabel || '')}">
                                            🔒 Bloqueada hasta ${this.escapeHTML(p.phaseCutoffLabel || '')}
                                        </button>
                                    ` : `
                                        <div class="flex items-center gap-1">
                                            ${isMasterOrAdmin && p.phaseCutoff && Date.now() < new Date(p.phaseCutoff).getTime() ? `<span class="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase rounded">🧪 Sandbox</span>` : ''}
                                            <button type="button" onclick="ui.modalPublishPressRelease('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-cyan-950/60 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black font-bold uppercase text-[11px] px-2.5 py-1 transition-all">
                                                + Redactar y Publicar
                                            </button>
                                        </div>
                                    `)}
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                    <span class="text-[11px] text-slate-400 font-mono">Tablón de Noticias</span>
                    <button type="button" onclick="ui.navigate('news')" class="min-h-[44px] bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs px-4 py-2 transition-all">Ver Tablón ➔</button>
                </div>
            </div>`;
            const pressReleaseCardHtml = (!anyPrUnlocked && publishedPrCount === 0 && !isMasterOrAdmin) ? `
            <details class="terminal-border bg-mars-card/80 border border-slate-800 rounded self-start">
                <summary class="min-h-[44px] px-4 py-3 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-white select-none">
                    <span>🔒 Fin de Fase: Notas de Prensa DOC_15 (Se abren el 15/12)</span>
                    <span class="text-mars-cyan shrink-0">▼ Ver</span>
                </summary>
                <div class="p-2 pt-0">${rawPressReleaseCardHtml}</div>
            </details>` : rawPressReleaseCardHtml;

            ceoGovernanceModulesHtml = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div class="space-y-4 flex flex-col justify-between">
                    ${licenseCardHtml}
                    ${ceoActiveContractCardHtml}
                </div>
                ${pressReleaseCardHtml}
            </div>`;
        }

        // Alerta de Crisis AEE
        const unreadCrisis = (co.crisisAlerts || []).filter(a => !a.read);
        let crisisHtml = '';
        if (unreadCrisis.length > 0) {
            crisisHtml = `
            <div role="alert" class="terminal-border bg-red-950/60 p-4 sm:p-5 mb-6 border-l-4 border-l-red-600 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-0.5 tracking-wider">ALERTA DISCIPLINARIA AEE</span>
                            <span class="text-xs text-slate-300 font-mono">${this.escapeHTML(unreadCrisis[0].date)}</span>
                        </div>
                        <h3 class="font-orbitron text-red-400 text-sm sm:text-base font-bold uppercase mt-1.5">Expediente: ${this.escapeHTML(unreadCrisis[0].article || 'Infracción Normativa')}</h3>
                        <p class="text-xs text-slate-200 italic mt-1 break-words">"${this.escapeHTML(unreadCrisis[0].reason)}"</p>
                        <p class="text-mars-magenta font-mono font-bold text-xs sm:text-sm mt-1">Penalización: ${Number(unreadCrisis[0].amount).toFixed(2)} €v</p>
                    </div>
                    ${isCEO ? `<button type="button" onclick="ui.modalCrisisAction()" class="min-h-[44px] bg-red-700 text-white font-black px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-white hover:text-red-700 transition-all border border-red-500 shadow-[0_0_10px_red] shrink-0 w-full sm:w-auto active:scale-95">[ 📢 Comunicar Sanción al Equipo ]</button>` : `<span class="text-xs text-mars-yellow font-bold uppercase flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-mars-yellow animate-ping"></span> Pendiente de comunicación por Dirección General (CEO)</span>`}
                </div>
            </div>`;
        }

        // Brújula de Misión y Radar Ejecutivo de Fase (4º ESO)
        const phaseInfo = clockMetrics.phaseInfo;
        const timeProgressPct = clockMetrics.timeProgressPct;
        const daysRemaining = clockMetrics.daysRemaining;
        const phaseDefs = clockMetrics.phaseDefs;
        const phaseTotalCount = clockMetrics.phaseTotalCount;
        const phaseDeliveredCount = clockMetrics.phaseDeliveredCount;
        const phaseCeoCount = clockMetrics.phaseCeoCount;
        const phaseReturnedCount = clockMetrics.phaseReturnedCount;
        const phasePct = clockMetrics.phasePct;
        const isPhaseDanger = clockMetrics.isDanger;
        const isPhaseAllDoneSafe = clockMetrics.isAllDoneSafe;
        const isDangerAudioMuted = this.isPhaseDangerAudioMuted ? this.isPhaseDangerAudioMuted() : false;

        let timeBarColor = 'from-cyan-500 via-sky-400 to-blue-500';
        let timeAlertText = `Quedan ${daysRemaining} días (${timeProgressPct}% consumido)`;
        if (isPhaseDanger || daysRemaining <= 5) {
            timeBarColor = 'from-red-500 via-rose-500 to-red-600 animate-pulse';
            timeAlertText = daysRemaining <= 0
                ? `¡PLAZO CERRADO! (${timeProgressPct}% consumido)`
                : `¡ÚLTIMOS ${daysRemaining} DÍA(S)! (${timeProgressPct}% consumido)`;
        } else if (daysRemaining <= 14) {
            timeBarColor = 'from-amber-400 via-yellow-400 to-orange-500';
            timeAlertText = `Cierre próximo: ${daysRemaining} días (${timeProgressPct}% consumido)`;
        }

        // Ordenación por urgencia y prioridad en las mini-fichas del Radar
        const getDefDeadlineTs = (d) => this.getDeliverableDeadlineTs ? this.getDeliverableDeadlineTs(d) : 9999999999999;
        const getDefUrgencyPrio = (dKey) => {
            const doc = docs[dKey];
            const st = doc ? doc.status : null;
            if (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') return 1;
            if (st === 'SUBMITTED_TO_CEO') return 2;
            if (st === 'EN_TALLER_OPERARIO') return 3;
            if (!doc || !doc.driveUrl || st !== 'DELIVERED_TO_TEACHER') return 4;
            return 5;
        };

        const sortedRadarDefs = [...phaseDefs].sort((a, b) => {
            const tsA = getDefDeadlineTs(a);
            const tsB = getDefDeadlineTs(b);
            if (tsA !== tsB) return tsA - tsB;
            return getDefUrgencyPrio(a.key) - getDefUrgencyPrio(b.key);
        });

        const compassCardBorderBg = isPhaseDanger
            ? 'border border-red-500/80 border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/35 via-[#180710] to-slate-950 shadow-[0_0_24px_rgba(255,0,85,0.28)]'
            : (isPhaseAllDoneSafe
                ? 'border border-emerald-500/60 border-l-4 border-l-mars-green bg-gradient-to-r from-emerald-950/25 via-[#071a14] to-slate-950 shadow-[0_0_20px_rgba(0,255,102,0.18)]'
                : 'border-l-4 border-l-mars-cyan bg-gradient-to-r from-slate-950 via-[#071322] to-slate-950 shadow-[0_4px_25px_rgba(0,240,255,0.12)]');

        const phaseAlertBannerHtml = isPhaseDanger ? `
            <div class="mb-4 p-3 rounded bg-red-950/80 border border-red-400/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="flex items-center gap-2.5 min-w-0">
                    <span class="text-xl animate-pulse shrink-0">🚨</span>
                    <div class="min-w-0">
                        <span class="text-xs font-black uppercase tracking-wider text-amber-300 block animate-pulse">
                            ⏰ ¡FASE EN PELIGRO! ${daysRemaining <= 0 ? 'PLAZO DE FASE AGOTADO' : `QUEDAN ${daysRemaining} DÍA(S)`} Y FALTAN ${clockMetrics.pendingDeliverablesCount} ENTREGABLE(S)
                        </span>
                        <span class="text-[11px] font-mono text-red-200 block">
                            Prioriza la revisión en Bandeja de Visado y coordina con los departamentos antes del cierre (${this.escapeHTML(phaseInfo.deadline)}).
                        </span>
                    </div>
                </div>
                <button type="button" onclick="ui.togglePhaseDangerMute()" class="shrink-0 w-full sm:w-auto min-h-[44px] px-3 py-1.5 text-[11px] font-mono font-bold uppercase rounded border ${isDangerAudioMuted ? 'bg-slate-900 border-slate-600 text-slate-300 hover:text-white' : 'bg-amber-950/70 border-amber-400/70 text-amber-300 hover:bg-amber-900'} transition-all whitespace-nowrap">
                    ${isDangerAudioMuted ? '🔕 Sonido Silenciado' : '🔔 Silenciar Alerta'}
                </button>
            </div>` : (isPhaseAllDoneSafe ? `
            <div class="mb-4 p-3 rounded bg-emerald-950/50 border border-emerald-400/70 flex items-center gap-2.5">
                <span class="text-lg shrink-0">✅</span>
                <span class="text-xs font-black uppercase tracking-wider text-emerald-300">
                    FASE AL DÍA — Misión Cumplida a Tiempo (${phaseDeliveredCount}/${phaseTotalCount} entregables enviados al Claustro).
                </span>
            </div>` : '');

        const compassCardHtml = `
        <div class="terminal-border ${compassCardBorderBg} p-4 sm:p-5 mb-5">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3 mb-4">
                <div class="flex items-center gap-2.5 flex-wrap">
                    <span class="text-xs font-black uppercase px-2.5 py-1 bg-mars-cyan text-black rounded font-mono shadow-[0_0_10px_rgba(0,240,255,0.4)]">📍 FASE ACTUAL // ${this.escapeHTML(phaseInfo.key)}</span>
                    <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider">${this.escapeHTML(phaseInfo.name)}</h3>
                </div>
                <div class="flex items-center gap-2 font-mono text-xs">
                    <span class="text-slate-400 uppercase">Cierre Estimado:</span>
                    <span class="text-mars-yellow font-bold bg-black/60 px-2 py-0.5 border border-slate-800 rounded">${this.escapeHTML(phaseInfo.deadline)}</span>
                </div>
            </div>
            ${phaseAlertBannerHtml}
            
            <!-- DOBLE BARRA COMPARATIVA: TIEMPO vs ENTREGABLES -->
            <div class="space-y-3 mb-4 font-mono text-xs">
                <!-- Barra 1: Cronómetro de Fase -->
                <div>
                    <div class="flex justify-between items-center mb-1 text-slate-300 text-[11px] gap-2 flex-wrap">
                        <span class="uppercase flex items-center gap-1.5 font-bold">
                            ${isPhaseDanger ? '<span class="inline-block animate-pulse text-amber-400">⏰</span>' : '<span>⏱️</span>'} Cronómetro de Fase (Tiempo Consumido)
                        </span>
                        <span class="${isPhaseDanger ? 'text-amber-300 font-black animate-pulse' : 'text-mars-cyan font-bold'}">${timeAlertText}</span>
                    </div>
                    <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div class="bg-gradient-to-r ${timeBarColor} h-full rounded-full transition-all duration-500" style="width: ${timeProgressPct}%"></div>
                    </div>
                </div>

                <!-- Barra 2: Entregables Completados -->
                <div>
                    <div class="flex justify-between items-center mb-1 text-slate-300 text-[11px]">
                        <span class="uppercase flex items-center gap-1.5 font-bold">
                            <span>📊</span> Hitos Completados Fase ${this.escapeHTML(phaseInfo.key)}
                        </span>
                        <span class="text-mars-green font-bold">${phaseDeliveredCount} de ${phaseTotalCount} entregados (${phasePct}%)</span>
                    </div>
                    <div class="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div class="bg-gradient-to-r from-mars-cyan via-teal-400 to-mars-green h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,255,102,0.4)]" style="width: ${phasePct}%"></div>
                    </div>
                </div>

                <!-- Semáforos rápidos de estado -->
                <div class="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                    <span class="text-mars-green font-bold">✓ ${phaseDeliveredCount} Entregados al Docente</span>
                    ${phaseCeoCount > 0 ? `<span class="text-mars-yellow font-bold animate-pulse">🟡 ${phaseCeoCount} En Visado CEO</span>` : ''}
                    ${phaseReturnedCount > 0 ? `<span class="text-red-400 font-bold animate-pulse">🔴 ${phaseReturnedCount} Requiere Subsanación</span>` : ''}
                    <span>⏳ ${Math.max(0, phaseTotalCount - phaseDeliveredCount - phaseCeoCount - phaseReturnedCount)} Pendientes</span>
                </div>
            </div>

            <!-- CUADRÍCULA DE MINI-FICHAS DE ENTREGABLES DE FASE (ORDENADOS POR URGENCIA) -->
            <div class="pt-3 border-t border-slate-800/80">
                <div class="flex justify-between items-center mb-2.5">
                    <span class="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
                        Radar de Entregables Fase ${this.escapeHTML(phaseInfo.key)} (Por Urgencia de Entrega)
                    </span>
                    <button type="button" onclick="ui.navigate('role_deliverables')" class="text-[11px] font-mono text-mars-cyan hover:underline flex items-center gap-1">
                        <span>Gestionar en Supervisión Entregas ➔</span>
                    </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    ${sortedRadarDefs.map(def => {
                        const doc = docs[def.key];
                        const st = doc ? doc.status : null;
                        const isDelivered = st === 'DELIVERED_TO_TEACHER';
                        const isSubmittedCeo = st === 'SUBMITTED_TO_CEO';
                        const isReturned = (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO');

                        const sched = (state.data?.config?.deliverableSchedule && state.data.config.deliverableSchedule[def.key]) || {};
                        const dlDateStr = sched.deadline || (state.data?.config?.deadlines && state.data.config.deadlines[def.key]) || def.defaultDate || '';
                        let shortDl = '--';
                        if (dlDateStr) {
                            try {
                                const dObj = new Date(dlDateStr);
                                shortDl = dObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
                            } catch (_) { shortDl = dlDateStr.slice(0, 10); }
                        }

                        const deptRole = def.role === 'FINANZAS' ? 'FINANZAS (ECO)' : def.role === 'TECNICO' ? 'TÉCNICO (FYQ)' : def.role === 'MARKETING' ? 'MARKETING (LYE)' : (def.role === 'OPERACIONES_IA' || def.role === 'OPERACIONES') ? 'OPERACIONES IA (LYE)' : def.role;
                        const shortDeptName = def.role === 'FINANZAS' ? 'FINANZAS' : def.role === 'TECNICO' ? 'TÉCNICO' : def.role === 'MARKETING' ? 'MARKETING' : (def.role === 'OPERACIONES_IA' || def.role === 'OPERACIONES') ? 'OPERACIONES' : def.role;

                        let cardBorder = 'border-slate-800 bg-black/40 hover:border-slate-700';
                        let badgeHtml = `<span class="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-black/60 text-slate-300 border border-slate-700">👉 Turno de: ${this.escapeHTML(shortDeptName)}</span>`;

                        if (isSubmittedCeo) {
                            cardBorder = 'border-amber-400/80 bg-amber-950/30 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(255,204,0,0.2)] animate-pulse';
                            badgeHtml = '<span style="background-color: #f59e0b !important; color: #000000 !important; font-weight: 900 !important;" class="text-[9px] uppercase px-1.5 py-0.5 rounded font-orbitron">🚨 Turno de: CEO (Visar)</span>';
                        } else if (isReturned) {
                            cardBorder = 'border-red-500/80 bg-red-950/30 shadow-[0_0_10px_rgba(255,0,0,0.2)]';
                            badgeHtml = `<span style="background-color: #ef4444 !important; color: #ffffff !important; font-weight: 900 !important;" class="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">↩️ Turno de: ${this.escapeHTML(shortDeptName)}</span>`;
                        } else if (isDelivered) {
                            cardBorder = 'border-slate-700 bg-black/50';
                            badgeHtml = '<span style="background-color: rgba(0, 255, 102, 0.15) !important; border: 1px solid #00ff66 !important; color: #00ff66 !important; font-weight: bold !important;" class="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">🏛️ En Claustro</span>';
                        }

                        return `
                        <button type="button" onclick="ui.inspectDeliverableDrawer('${this.escapeAttr(co.id || state.user.coId)}', '${this.escapeAttr(def.key)}')" class="terminal-border p-3 border rounded ${cardBorder} cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between text-left w-full min-h-[44px]">
                            <div class="w-full">
                                <div class="flex justify-between items-start gap-1 mb-1">
                                    <span class="text-[9px] font-mono font-bold text-mars-cyan uppercase tracking-wider truncate">${this.escapeHTML(deptRole)}</span>
                                    <span class="text-[9px] font-mono text-slate-400 shrink-0">Lím: ${this.escapeHTML(shortDl)}</span>
                                </div>
                                <h4 class="text-xs font-bold text-white uppercase line-clamp-2 leading-snug mb-2" title="${this.escapeHTML(def.name)}">
                                    ${this.escapeHTML(def.shortName || def.name)}
                                </h4>
                            </div>
                            <div class="flex justify-between items-center pt-2 border-t border-slate-800/60 mt-1 w-full gap-1">
                                ${badgeHtml}
                                <span class="text-[10px] text-mars-cyan font-mono hover:text-white shrink-0">Ver ➔</span>
                            </div>
                        </button>`;
                    }).join('')}
                </div>
            </div>
        </div>`;

        const isUnassignedAux = (!isCEO && state.user.role === 'AUXILIAR' && !co.auxRoleDept);
        let auxWelcomeCardHtml = '';
        if (isUnassignedAux) {
            const auxReq = co.auxRoleRequest;
            const reqText = (auxReq && auxReq.status === 'PENDIENTE')
                ? `⏳ El CEO ya ha solicitado vincularte a <strong>${this.escapeHTML(auxReq.dept)}</strong> (pendiente de autorización docente).`
                : 'Aún no tienes un departamento asignado. Pide al CEO que solicite tu vinculación desde su Sala de Mando (boton «Gestionar Auxiliar»).';
            auxWelcomeCardHtml = `
            <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-yellow space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                    <div>
                        <span class="text-[10px] font-mono uppercase px-2 py-0.5 bg-mars-yellow/20 border border-mars-yellow text-mars-yellow font-bold">Rol Comodín // Apoyo Transversal</span>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase mt-1">🤝 Tu Misión Hoy como Socio Auxiliar</h3>
                    </div>
                </div>
                <p class="text-xs text-slate-200 font-sans leading-relaxed">${reqText}</p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    <button type="button" onclick="ui.roleDeliverablesScope='ALL'; ui.navigate('role_deliverables');" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-3 py-2 hover:bg-white transition-all rounded-sm">🔍 1. Auditar Drive del Equipo ➔</button>
                    <button type="button" onclick="ui.navigate('resolutions')" class="min-h-[44px] bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold uppercase text-xs px-3 py-2 transition-all rounded-sm">🗳️ 2. Votar en Trámites ➔</button>
                    <button type="button" onclick="ui.modalReportAI()" class="min-h-[44px] bg-slate-900 border border-slate-700 text-slate-200 hover:border-mars-cyan hover:text-mars-cyan font-bold uppercase text-xs px-3 py-2 transition-all rounded-sm">🤖 3. Registrar Uso de IA</button>
                </div>
            </div>`;
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-6';
        wrapper.innerHTML = `
            ${crisisHtml}
            ${auxWelcomeCardHtml}

            <!-- CABECERA DE SALA DE MANDO -->
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-mars-border pb-4">
                    <div>
                        <div class="flex items-center gap-2.5 mb-1.5">
                            <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-mars-cyan/20 border border-mars-cyan text-mars-cyan">
                                ${isCEO ? 'DIRECCIÓN GENERAL // SALA DE MANDO' : 'DEPARTAMENTO DE APOYO // OBSERVADOR'}
                            </span>
                            <span class="text-xs text-slate-400 font-mono">[CLASE ${this.escapeHTML(co.classGroup || 'A')}]</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-tight">
                            ${this.escapeHTML(co.name)}
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control Ejecutivo, Supervisión de Hitos y Trazabilidad de Misión Aeroespacial.</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                        ${(isCEO && state.user.role !== 'AUXILIAR') ? `<button type="button" onclick="ui.modalCreateAuxRole()" class="min-h-[44px] flex-1 sm:flex-initial bg-slate-900 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all whitespace-nowrap">[ 👥 Gestionar Auxiliar ]</button>` : ''}
                        <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] flex-1 sm:flex-initial bg-mars-cyan text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] whitespace-nowrap">[ 📤 ${isCEO ? 'Supervisión Entregas' : 'Mis Entregables'} ]</button>
                    </div>
                </div>

                <!-- KPIs RÁPIDOS -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
                    <button type="button" onclick="ui.modalCeoLedgerPreview()" class="bg-black/50 hover:bg-black/80 p-3 sm:p-4 border border-slate-800 hover:border-mars-green/70 text-left transition-all min-h-[44px]">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Tesorería Virtual</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-mars-green">${Number(co.balance).toFixed(2)} €v</p>
                        <span class="text-[10px] text-mars-cyan font-mono">🔍 Ver movimientos ↗</span>
                    </button>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Coste Neto Operativo</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-mars-cyan">${netOpCosts.toFixed(2)} €v</p>
                        <span class="text-[10px] text-slate-500 font-mono">${sponsorAmt > 0 ? `Patrocinio: -${sponsorAmt.toFixed(2)} €v ${sponsorTierLabel ? this.getSponsorTierBadge(sponsorTierLabel) : ''}` : 'Sin patrocinios'}</span>
                    </div>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Progreso Hitos (Fase ${this.escapeHTML(phaseInfo.key)})</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-amber-400">${phaseDeliveredCount} / ${phaseTotalCount}</p>
                        <span class="text-[10px] text-slate-500 font-mono">Entregados en Fase ${this.escapeHTML(phaseInfo.key)}</span>
                    </div>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Visados CEO Pendientes</span>
                        <p class="text-base sm:text-xl font-orbitron font-black ${totalPendingCeoItems > 0 ? 'text-mars-yellow animate-pulse' : 'text-slate-400'}">${totalPendingCeoItems}</p>
                        <span class="text-[10px] text-slate-500 font-mono">${pendingCeoDeliverables} entregables + ${pendingMktActions + (pendingSlogan ? 1 : 0)} mkt${pendingSpecialItemsCount > 0 ? ` + ${pendingSpecialItemsCount} I+D` : ''}</span>
                    </div>
                </div>
            </div>

            ${typeof this.renderContestDashboardBanner === 'function' ? this.renderContestDashboardBanner(co) : ''}
            ${ceoTrayHtml}
            ${ceoSpecialItemsHtml}
            ${compassCardHtml}
            ${ceoGovernanceModulesHtml}

            <!-- CUADRO DE MANDOS DE ACCESOS TÁCTICOS (4 COLUMNAS COMPACTAS) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <!-- Tarjeta 1: Dossier Oficial & Calificaciones -->
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan flex flex-col justify-between hover:border-mars-cyan transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="text-[10px] font-black uppercase text-mars-cyan bg-mars-cyan/10 border border-mars-cyan/40 px-1.5 py-0.5">ACADÉMICO</span>
                            <span class="text-[10px] font-mono text-slate-400">${phaseDeliveredCount}/${phaseTotalCount} Hitos (Fase ${this.escapeHTML(phaseInfo.key)})</span>
                        </div>
                        <h3 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase">📋 Dossier Académico</h3>
                        <p class="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">Supervisa el acta y calificaciones ponderadas de los 6 docentes.</p>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center gap-2">
                        ${(() => {
                            const actaS = this.getCompanyActaSummary ? this.getCompanyActaSummary(co) : { nota: null, evalPct: 0 };
                            return `<span class="text-[10px] font-mono ${actaS.nota !== null ? 'text-mars-green font-bold' : 'text-slate-400'}">${actaS.nota !== null ? `Nota: ${actaS.nota.toFixed(2)}/10 (${actaS.evalPct}%)` : '6 Materias'}</span>`;
                        })()}
                        <button type="button" onclick="ui.roleDeliverablesSection = 'grades'; ui.navigate('role_deliverables');" class="min-h-[44px] bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs px-3 py-1.5 transition-all">Acceder ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 2: Seguimiento de Órdenes -->
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-amber-400 flex flex-col justify-between hover:border-amber-400 transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="text-[10px] font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-1.5 py-0.5">LOGÍSTICA</span>
                            <span class="text-[10px] font-mono text-amber-400">${pendingOrders} en Proceso</span>
                        </div>
                        <h3 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase">📡 Órdenes de Compra</h3>
                        <p class="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">Compras de I+D, campañas MKT y fichas de taller físico.</p>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[10px] text-slate-400 font-mono">${(co.orders || []).length} Órdenes</span>
                        <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] bg-slate-900 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-black uppercase text-xs px-3 py-1.5 transition-all">Supervisar ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 3: Gobernanza y Trámites -->
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-magenta flex flex-col justify-between hover:border-mars-magenta transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="text-[10px] font-black uppercase text-mars-magenta bg-mars-magenta/10 border border-mars-magenta/40 px-1.5 py-0.5">LEGAL / AEE</span>
                            <span class="text-[10px] font-mono text-slate-400">${(co.votingMotions || []).length} Mociones</span>
                        </div>
                        <h3 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase">⚖️ Trámites y Socios</h3>
                        <p class="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">Asambleas de socios, mociones, marca y recursos AEE.</p>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[10px] text-slate-400 font-mono">Gobernanza</span>
                        <button type="button" onclick="ui.navigate('resolutions')" class="min-h-[44px] bg-slate-900 border border-mars-magenta text-mars-magenta hover:bg-mars-magenta hover:text-white font-black uppercase text-xs px-3 py-1.5 transition-all">Gestionar ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 4: Mis Entregables -->
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-green flex flex-col justify-between hover:border-mars-green transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-1.5">
                            <span class="text-[10px] font-black uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-1.5 py-0.5">MISIÓN</span>
                            <span class="text-[10px] font-mono ${returnedDeliverables > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}">${returnedDeliverables > 0 ? `⚠️ ${returnedDeliverables} Acción` : 'Al día'}</span>
                        </div>
                        <h3 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase">📋 Supervisión Entregas</h3>
                        <p class="text-[11px] text-slate-300 mt-1 line-clamp-2 leading-relaxed">Gestión guiada en Docs, visado formal y envío al claustro.</p>
                    </div>
                    <div class="mt-3 pt-2.5 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[10px] text-slate-400 font-mono">4 Pasos</span>
                        <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-3 py-1.5 hover:bg-white transition-all">Acceder ➔</button>
                    </div>
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    setRoleDeliverablesPhaseFilter(phase) {
        const co = state.data?.companies?.[state.user?.coId];
        if (phase !== 'ALL' && !ui.isPhaseUnlocked(phase, co)) {
            ui.notify(`La Fase ${phase} aún no ha comenzado.`, 'warning');
            return;
        }
        this.roleDeliverablesPhase = phase || 'ALL';
        this.render();
    },

    setRoleDeliverablesStatusFilter(status) {
        this.roleDeliverablesStatus = status || 'ALL';
        this.render();
    },

    setRoleDeliverablesSection(section) {
        this.roleDeliverablesSection = section || 'deliverables';
        this.render();
    },

    setRoleDeliverablesScopeFilter(scope) {
        this.roleDeliverablesScope = scope || 'MY_ROLE';
        this.render();
    },

    viewRoleDeliverables(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const activeSection = this.roleDeliverablesSection || 'deliverables';

        const role = state.user.role;
        const effectiveRole = this.getEffectiveRole(co);
        const isCEO = effectiveRole === 'CEO';
        const isAux = role === 'AUXILIAR';
        const auxDept = isAux ? co?.auxRoleDept : null;

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const docs = co.deliverables || {};

        const activePhaseInfo = (typeof ui.getCurrentPhaseInfo === 'function') ? ui.getCurrentPhaseInfo() : { id: 'I', key: 'I' };
        const activePhaseId = activePhaseInfo.id || activePhaseInfo.key || 'I';

        // 1. Apertura Automática en Fase Activa y Reseteo si la fase guardada está bloqueada
        if (!this.roleDeliverablesPhase) {
            this.roleDeliverablesPhase = activePhaseId;
        } else if (this.roleDeliverablesPhase !== 'ALL' && !ui.isPhaseUnlocked(this.roleDeliverablesPhase, co)) {
            this.roleDeliverablesPhase = activePhaseId;
        }

        const phaseFilter = this.roleDeliverablesPhase || activePhaseId;
        const statusFilter = this.roleDeliverablesStatus || 'ALL';

        // 2. Blindaje de fases no iniciadas para alumnado
        const isAdmin = Boolean(state.user?.admin);
        const availableDefs = isAdmin
            ? defs
            : defs.filter(d => {
                const p = ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I');
                return ui.isPhaseUnlocked(p, co);
            });

        // 3. Filtrado por Fase de trabajo
        const phaseDefs = (phaseFilter === 'ALL')
            ? availableDefs
            : availableDefs.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === phaseFilter);

        // 4. Filtrado por Rol / Ámbito
        let myRolePhaseDefs = phaseDefs;
        if (isCEO) {
            myRolePhaseDefs = phaseDefs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO');
        } else if (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES') {
            myRolePhaseDefs = phaseDefs.filter(d => d.role === 'OPERACIONES_IA' || d.role === 'OPERACIONES');
        } else {
            myRolePhaseDefs = phaseDefs.filter(d => d.role === effectiveRole);
        }
        const allStartupPhaseDefs = phaseDefs;
        const scope = this.roleDeliverablesScope || (isCEO ? (myRolePhaseDefs.length > 0 ? 'MY_ROLE' : 'ALL') : 'MY_ROLE');
        const baseDefs = (scope === 'MY_ROLE') ? myRolePhaseDefs : allStartupPhaseDefs;

        // 5. Contadores del resumen superior calculados sobre la fase y ámbito activos
        const totalVisible = baseDefs.length;
        const deliveredCount = baseDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
        const ceoReviewCount = baseDefs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO').length;
        const actionRequiredCount = baseDefs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO')).length;
        const pendingCount = Math.max(0, totalVisible - deliveredCount - ceoReviewCount - actionRequiredCount);

        // 6. Filtrado por Estado
        let filteredDefs = baseDefs;
        if (statusFilter === 'ACTION_REQUIRED') {
            filteredDefs = filteredDefs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO'));
        } else if (statusFilter === 'CEO_REVIEW') {
            filteredDefs = filteredDefs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO');
        } else if (statusFilter === 'COMPLETED') {
            filteredDefs = filteredDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER');
        } else if (statusFilter === 'OPEN') {
            filteredDefs = filteredDefs.filter(d => {
                const docObj = docs[d.key];
                const isDelivered = docObj && docObj.status === 'DELIVERED_TO_TEACHER';
                const isLocked = ui.isDeliverableLocked(d.key, co);
                return !isDelivered && !isLocked;
            });
        }

        // Agrupación por Fase asignada y ordenación por Urgencia de Entrega (primero el más próximo)
        const phaseOrder = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
        const getDeliverableDeadlineTs = (d) => {
            const sched = (state.data?.config?.deliverableSchedule && state.data.config.deliverableSchedule[d.key]) || {};
            const dlStr = sched.deadline || (state.data?.config?.deadlines && state.data.config.deadlines[d.key]) || d.defaultDate || '2099-12-31';
            const ts = new Date(dlStr).getTime();
            return isNaN(ts) ? 9999999999999 : ts;
        };
        const getDeliverableUrgencyPrio = (dKey) => {
            const doc = docs[dKey];
            const st = doc ? doc.status : null;
            if (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') return 1;
            if (st === 'SUBMITTED_TO_CEO') return 2;
            if (st === 'EN_TALLER_OPERARIO') return 3;
            if (!doc || !doc.driveUrl || st !== 'DELIVERED_TO_TEACHER') return 4;
            return 5;
        };

        filteredDefs.sort((a, b) => {
            const pA = phaseOrder[ui.getDeliverablePhase ? ui.getDeliverablePhase(a.key) : (a.phase || 'I')] || 99;
            const pB = phaseOrder[ui.getDeliverablePhase ? ui.getDeliverablePhase(b.key) : (b.phase || 'I')] || 99;
            if (pA !== pB) return pA - pB;

            // Mapeo por fecha límite (el más inminente primero)
            const tsA = getDeliverableDeadlineTs(a);
            const tsB = getDeliverableDeadlineTs(b);
            if (tsA !== tsB) return tsA - tsB;

            // Prioridad inteligente: pendientes y devueltos antes que entregados
            return getDeliverableUrgencyPrio(a.key) - getDeliverableUrgencyPrio(b.key);
        });

        // Detección de entregables pendientes de fases anteriores abiertas (Mejora D)
        const phaseOrderIdx = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
        const activeIdx = phaseOrderIdx[activePhaseId] || 1;
        const earlierPhasesPending = [];

        ['I', 'II', 'III'].forEach(pId => {
            if (phaseOrderIdx[pId] < activeIdx && ui.isPhaseUnlocked(pId, co)) {
                const pDefs = defs.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === pId);
                const pendingOrReturned = pDefs.filter(d => {
                    const st = docs[d.key]?.status;
                    return st !== 'DELIVERED_TO_TEACHER';
                });
                if (pendingOrReturned.length > 0) {
                    earlierPhasesPending.push({
                        phaseId: pId,
                        count: pendingOrReturned.length,
                        hasReturned: pendingOrReturned.some(d => docs[d.key]?.status === 'CEO_REVISION' || docs[d.key]?.status === 'DEVUELTO_A_TECNICO')
                    });
                }
            }
        });

        let debtBannerHtml = '';
        if (earlierPhasesPending.length > 0 && !earlierPhasesPending.some(ep => ep.phaseId === phaseFilter)) {
            const firstDebt = earlierPhasesPending[0];
            debtBannerHtml = `
            <div class="bg-red-950/80 border-2 border-red-500 p-3 mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs font-mono shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                <div class="flex items-center gap-2">
                    <span class="text-base animate-pulse">⚠️</span>
                    <span class="text-red-200">
                        <strong>Atención:</strong> Tu Startup tiene <strong>${firstDebt.count} entregable(s) pendiente(s)${firstDebt.hasReturned ? ' o devueltos para subsanar' : ''}</strong> de la <strong>Fase ${firstDebt.phaseId}</strong>.
                    </span>
                </div>
                <button type="button" onclick="ui.setRoleDeliverablesPhaseFilter('${firstDebt.phaseId}')" class="min-h-[44px] px-3.5 py-1.5 bg-red-600 hover:bg-white text-white hover:text-black font-bold uppercase transition-all shrink-0 shadow-sm active:scale-95">
                    [ Ir a Fase ${firstDebt.phaseId} ➔ ]
                </button>
            </div>`;
        }

        // Renderizado del resumen con contadores interactivos
        const summaryHtml = `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('COMPLETED')" class="terminal-border p-4 text-left transition-all ${statusFilter === 'COMPLETED' ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-[0_0_12px_rgba(0,255,102,0.3)]' : 'bg-mars-card border-t-2 border-t-mars-green hover:border-mars-green'}">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">🟢 Entregados a Docente</span>
                <p class="text-xl sm:text-2xl font-orbitron font-black text-mars-green">${deliveredCount}</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Calificación final</span>
            </button>
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('CEO_REVIEW')" class="terminal-border p-4 text-left transition-all ${statusFilter === 'CEO_REVIEW' ? 'bg-amber-950/60 border-2 border-amber-400 shadow-[0_0_12px_rgba(255,204,0,0.3)]' : 'bg-mars-card border-t-2 border-t-mars-yellow hover:border-mars-yellow'}">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">🟡 En Revisión CEO</span>
                <p class="text-xl sm:text-2xl font-orbitron font-black text-mars-yellow">${ceoReviewCount}</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Pendientes de visado</span>
            </button>
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('ACTION_REQUIRED')" class="terminal-border p-4 text-left transition-all ${actionRequiredCount > 0 ? 'bg-red-950/70 border-2 border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] animate-pulse' : (statusFilter === 'ACTION_REQUIRED' ? 'bg-red-950/40 border-2 border-red-400' : 'bg-mars-card border-t-2 border-t-mars-magenta hover:border-mars-magenta')}">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">🔴 Requieren Acción</span>
                <p class="text-xl sm:text-2xl font-orbitron font-black text-mars-magenta">${actionRequiredCount}</p>
                <span class="text-[10px] text-red-300 block mt-1 font-mono font-bold">${actionRequiredCount > 0 ? '⚠️ Subsanar y Reenviar' : 'Cero incidencias'}</span>
            </button>
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('OPEN')" class="terminal-border p-4 text-left transition-all ${statusFilter === 'OPEN' ? 'bg-cyan-950/60 border-2 border-cyan-400' : 'bg-mars-card border-t-2 border-t-mars-cyan hover:border-mars-cyan'}">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">⏳ Pendientes / Abiertos</span>
                <p class="text-xl sm:text-2xl font-orbitron font-black text-mars-cyan">${pendingCount}</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">En plazo de entrega</span>
            </button>
        </div>`;

        // Filtros de barra de herramientas con candado y fecha corta (Mejoras B y C)
        const phaseDefinitions = [
            { id: 'I', label: 'Fase I', openShort: '02 Nov' },
            { id: 'II', label: 'Fase II', openShort: '15 Dic' },
            { id: 'III', label: 'Fase III', openShort: '15 Feb' },
            { id: 'IV', label: 'Fase IV', openShort: '31 Mar' }
        ];

        let phaseTabsHtml = `
            <button type="button" role="tab" aria-selected="${phaseFilter === 'ALL'}" onclick="ui.setRoleDeliverablesPhaseFilter('ALL')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${phaseFilter === 'ALL' ? 'bg-mars-cyan text-black shadow-sm font-black' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">
                Todas las Fases
            </button>
        `;

        phaseDefinitions.forEach(p => {
            const isUnlocked = ui.isPhaseUnlocked(p.id, co);
            const debt = earlierPhasesPending.find(ep => ep.phaseId === p.id);
            const isSelected = (phaseFilter === p.id);

            if (isUnlocked) {
                const alertDot = debt ? `<span class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping mr-1"></span>` : '';
                const activeClass = isSelected
                    ? 'bg-mars-cyan text-black shadow-sm font-black'
                    : (debt ? 'bg-slate-900 text-red-400 border border-red-500/60 hover:text-white font-bold' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800');
                phaseTabsHtml += `
                    <button type="button" role="tab" aria-selected="${isSelected}" onclick="ui.setRoleDeliverablesPhaseFilter('${p.id}')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap flex items-center gap-1 ${activeClass}">
                        ${alertDot}${debt ? '🔴 ' : ''}${p.label}
                    </button>
                `;
            } else {
                phaseTabsHtml += `
                    <button type="button" disabled title="Fase ${p.id} bloqueada hasta ${p.openShort}. Se habilitará según el cronograma oficial." class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase whitespace-nowrap bg-slate-950/80 text-slate-500 border border-slate-800/60 cursor-not-allowed opacity-60 flex items-center gap-1.5">
                        <span>🔒</span> ${p.label} <span class="text-[10px] text-slate-500 font-mono">(Abre ${p.openShort})</span>
                    </button>
                `;
            }
        });

        const statusTabsHtml = [
            { id: 'ALL', label: 'Todos los Estados' },
            { id: 'CEO_REVIEW', label: `🟡 En Revisión CEO (${ceoReviewCount})` },
            { id: 'ACTION_REQUIRED', label: `⚠️ Requieren Acción (${actionRequiredCount})` },
            { id: 'OPEN', label: 'Abiertos / En Plazo' },
            { id: 'COMPLETED', label: 'Completados' }
        ].map(s => `
            <button type="button" role="tab" aria-selected="${statusFilter === s.id}" onclick="ui.setRoleDeliverablesStatusFilter('${s.id}')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${statusFilter === s.id ? 'bg-mars-yellow text-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">
                ${s.label}
            </button>
        `).join('');

        const scopeSwitchHtml = `
            <div class="flex items-center gap-2 bg-black p-1 border border-mars-border">
                <button type="button" onclick="ui.setRoleDeliverablesScopeFilter('MY_ROLE')" class="min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase transition-colors ${scope === 'MY_ROLE' ? 'bg-mars-cyan text-black font-bold' : 'text-slate-400 hover:text-white'}">
                    ${isCEO ? `🟡 Pendientes de Visar (${myRolePhaseDefs.length})` : `🎯 Mis Entregables (${myRolePhaseDefs.length})`}
                </button>
                <button type="button" onclick="ui.setRoleDeliverablesScopeFilter('ALL')" class="min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase transition-colors ${scope === 'ALL' ? 'bg-mars-cyan text-black font-bold' : 'text-slate-400 hover:text-white'}">
                    🏢 Toda la Startup (${allStartupPhaseDefs.length})
                </button>
            </div>
        `;

        // Renderizado de las tarjetas de entregables con Stepper de 4 pasos
        const cardsHtml = filteredDefs.length === 0
            ? `<div class="p-8 terminal-border border-dashed text-center text-slate-400 italic text-xs uppercase">No hay entregables que coincidan con los filtros seleccionados.</div>`
            : filteredDefs.map(def => {
                const docObj = docs[def.key];
                const st = docObj ? (docObj.status || 'DELIVERED_TO_TEACHER') : null;
                const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[def.key]) || {};
                const openDate = sched.openDate || def.defaultOpenDate;
                const isLocked = this.isDeliverableLocked(def.key, co);
                const dlDate = sched.deadline || (state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? (sched.deadline || state.data.config.deadlines[def.key]) : def.defaultDate;

                const isReturned = (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO');
                const isDelivered = (st === 'DELIVERED_TO_TEACHER');
                const isSubmittedCeo = (st === 'SUBMITTED_TO_CEO');
                const isWorkshopWork = (st === 'EN_TALLER_OPERARIO');

                let dlStatus;
                if (isDelivered) {
                    dlStatus = { text: "✓ EN REGLA", class: "bg-mars-green/20 text-mars-green border border-mars-green/50 font-bold", status: 'DELIVERED' };
                } else if (isSubmittedCeo) {
                    dlStatus = { text: "🟡 EN REVISIÓN CEO", class: "bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/50 font-bold", status: 'PENDING_CEO' };
                } else if (isReturned) {
                    dlStatus = { text: "🔴 SUBSANACIÓN REQUERIDA", class: "bg-red-950/60 text-red-400 border border-red-500 font-bold animate-pulse", status: 'RETURNED' };
                } else {
                    dlStatus = this.getDeadlineStatus(dlDate, false);
                }

                // Determinación del índice activo del Stepper (0 a 3)
                let stepIdx = 0;
                if (isDelivered) stepIdx = 3;
                else if (isSubmittedCeo) stepIdx = 2;
                else if (docObj && docObj.driveUrl && !isReturned) stepIdx = 1;
                else if (isReturned) stepIdx = 1;

                const cardTplUrl = this.getDeliverableTemplateUrl ? this.getDeliverableTemplateUrl(def.key) : '';
                const cardTplHref = cardTplUrl ? (this.isDocsEditorUrl(cardTplUrl) ? this.getGoogleViewUrl(cardTplUrl) : cardTplUrl) : '';

                // Stepper Visual de 4 Pasos
                const steps = [
                    { num: '1', title: 'Plantilla Docs', desc: 'Guía oficial' },
                    { num: '2', title: 'Enlace Drive', desc: 'Edición en equipo' },
                    { num: '3', title: 'Visado CEO', desc: 'Aval directivo' },
                    { num: '4', title: 'Evaluación Claustro', desc: '100% Ponderado' }
                ];

                const stepperHtml = `
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 my-3 py-2 border-y border-slate-800/80 bg-black/40 px-2 rounded">
                    ${steps.map((s, idx) => {
                        let stepColor = 'text-slate-500 border-slate-800 bg-slate-900/50';
                        let dot = '○';
                        if (idx < stepIdx || isDelivered) {
                            stepColor = 'text-mars-green border-mars-green/50 bg-mars-green/10';
                            dot = '✓';
                        } else if (idx === stepIdx) {
                            if (isReturned) {
                                stepColor = 'text-red-400 border-red-500 bg-red-950/40 animate-pulse';
                                dot = '⚠️';
                            } else if (isSubmittedCeo) {
                                stepColor = 'text-mars-yellow border-mars-yellow/60 bg-mars-yellow/10 animate-pulse';
                                dot = '⏳';
                            } else {
                                stepColor = 'text-mars-cyan border-mars-cyan/60 bg-mars-cyan/10';
                                dot = '●';
                            }
                        }
                        if (idx === 0 && cardTplHref) {
                            return `
                            <a href="${encodeURI(cardTplHref).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" title="Abrir Plantilla Oficial del Entregable" class="min-h-[44px] flex flex-col items-center justify-center text-center p-1 sm:p-1.5 border ${stepColor} hover:border-mars-cyan hover:bg-mars-cyan/20 rounded min-w-0 transition-all group">
                                <span class="text-[10px] sm:text-xs font-mono font-black">${dot} PASO ${s.num}</span>
                                <span class="text-[9px] sm:text-[11px] font-bold uppercase truncate w-full mt-0.5">${s.title}</span>
                                <span class="text-[9px] font-mono font-bold text-mars-green group-hover:underline mt-0.5">✓ DISPONIBLE ↗</span>
                            </a>`;
                        }
                        return `
                        <div class="min-h-[44px] flex flex-col items-center justify-center text-center p-1 sm:p-1.5 border ${stepColor} rounded min-w-0">
                            <span class="text-[10px] sm:text-xs font-mono font-black">${dot} PASO ${s.num}</span>
                            <span class="text-[9px] sm:text-[11px] font-bold uppercase truncate w-full mt-0.5">${s.title}</span>
                            <span class="hidden sm:block text-[8px] sm:text-[9px] opacity-75 font-mono">${s.desc}</span>
                        </div>`;
                    }).join('')}
                </div>`;

                // Banner de correcciones devueltas
                let returnBannerHtml = '';
                if (isReturned) {
                    const retReason = docObj.returnReason || docObj.returnReasonId || 'El documento requiere correcciones antes de su evaluación.';
                    returnBannerHtml = `
                    <div role="alert" class="bg-red-950/70 border-2 border-red-500 p-3 sm:p-4 mb-3 rounded shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">⚠️ REVISIÓN REQUERIDA // SUBSANACIÓN</span>
                            <span class="text-[11px] text-red-300 font-mono">Devuelto por Dirección / Docente</span>
                        </div>
                        <p class="text-xs text-white font-bold mb-2 break-words">Motivo de Devolución: <span class="text-amber-300 font-normal italic">"${this.escapeHTML(retReason)}"</span></p>
                        ${docObj.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(docObj.returnDriveUrl)) ? `
                            <div class="mb-2">
                                <a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(docObj.returnDriveUrl) : encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/60 border border-red-400 text-white font-bold rounded hover:bg-red-800 transition-colors font-mono">
                                    <span>📄 Ver Correcciones Marcadas en Docs ↗</span>
                                </a>
                            </div>
                        ` : ''}
                        <p class="text-[11px] text-slate-300 font-mono">Subsanad las observaciones en vuestro Google Doc y pulsada [ Reenviar al CEO ] para continuar la evaluación.</p>
                    </div>`;
                }

                // Acciones por rol
                const isOwnDepartment = (effectiveRole === def.role) || (def.role === 'OPERACIONES_IA' && effectiveRole === 'OPERACIONES') || (def.key === 'hoja_taller_fyq' && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES' || effectiveRole === 'TECNICO'));
                const canRoleEdit = isOwnDepartment;

                let actionControlsHtml = '';
                if (isLocked) {
                    actionControlsHtml = `<div class="p-3 bg-black/60 border border-slate-800 text-center"><span class="text-xs font-mono text-slate-400 uppercase">🔒 Este entregable se abrirá el ${new Date(openDate).toLocaleString()} según el cronograma oficial.</span></div>`;
                } else if (isCEO && isSubmittedCeo) {
                    actionControlsHtml = `
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                        <button type="button" onclick="ui.approveDeliverableByCEO('${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VISAR Y ENTREGAR AL DOCENTE ]</button>
                        <button type="button" onclick="ui.modalCeoReturnDeliverable('${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER POR CORRECCIONES ]</button>
                    </div>`;
                } else if (def.key === 'hoja_taller_fyq' && isWorkshopWork && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES')) {
                    const isHojaPrePhaseIII = !state.user?.admin && this.isDeliverableLocked('hoja_taller_fyq', co);
                    actionControlsHtml = `
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                        <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">${isHojaPrePhaseIII ? '[ ✅ VALIDAR MONTAJE EN HISTÓRICO (PRE-FASE III) ]' : '[ ✓ VALIDAR ENSAMBLE DEFINITIVO Y REMITIR A CEO ]'}</button>
                        <button type="button" onclick="ui.modalTallerReturnReason()" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ REPORTAR INCIDENCIA A I+D ]</button>
                    </div>`;
                } else if (isDelivered && !isReturned) {
                    actionControlsHtml = `
                    <div class="p-2.5 bg-mars-green/10 border border-mars-green/40 text-center flex items-center justify-center gap-2">
                        <span class="text-mars-green font-mono font-bold text-xs uppercase">✓ ENTREGADO OFICIALMENTE EN CLOUD AL DOCENTE (EN PROCESO DE EVALUACIÓN)</span>
                    </div>`;
                } else if (!canRoleEdit) {
                    const deptLabel = this.escapeHTML((def.role || '').replace('_', ' '));
                    const waitMsg = isCEO
                        ? (isReturned
                            ? `⏳ Esperando que <strong>${deptLabel}</strong> subsane las observaciones y reenvíe el documento para nuevo visado.`
                            : (isWorkshopWork
                                ? `⚙️ Hoja de Taller en comprobación física por <strong>OPERACIONES IA</strong>. Pasará a tu Bandeja de Visado al finalizar.`
                                : `🔒 Esperando subida previa de <strong>${deptLabel}</strong>. Podrás visarlo o devolverlo cuando el departamento lo envíe.`))
                        : `🔒 Subida reservada al departamento responsable: <strong>${deptLabel}</strong>.`;
                    actionControlsHtml = `
                    <div class="p-2.5 bg-black/40 border border-slate-800 text-center space-y-2">
                        <span class="text-xs font-mono text-slate-300 uppercase block">${waitMsg}</span>
                        ${(!isCEO && isSubmittedCeo) ? `
                            <details class="text-left bg-slate-950/80 border border-slate-800 p-2 rounded">
                                <summary class="cursor-pointer text-[11px] font-mono text-amber-300 font-bold select-none">🤝 ¿El CEO ha faltado hoy? Qué puedes adelantar mientras tanto</summary>
                                <div class="mt-2 pt-2 border-t border-slate-800 text-xs text-slate-300 font-sans space-y-2">
                                    <p>• Revisa la pestaña <strong>🏢 Toda la Startup</strong> para comprobar en modo incógnito que los enlaces Drive del equipo abren sin pedir permiso.</p>
                                    <p>• Registra vuestros usos de IA en <strong>🤖 IA</strong> o prepara en Google Docs el borrador de la siguiente entrega.</p>
                                    <button type="button" onclick="ui.navigate('resolutions')" class="min-h-[44px] px-3 py-1.5 bg-red-950/60 border border-red-500/50 text-red-200 hover:bg-red-800 text-xs font-bold uppercase rounded">⚠️ Si el bloqueo persiste: Reportar en Buzón HR (DOC_2) ➔</button>
                                </div>
                            </details>
                        ` : ''}
                    </div>`;
                } else {
                    actionControlsHtml = `
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                        <button type="button" onclick="ui.modalSubmitRoleDeliverable('${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 ${isReturned ? 'bg-amber-400 text-black hover:bg-white' : 'bg-mars-cyan text-black hover:bg-white'} font-black uppercase text-xs px-4 py-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                            ${isReturned ? '[ ✏️ SUBSANAR ENLACE Y REENVIAR AL CEO ]' : (docObj?.driveUrl ? '[ ✏️ ACTUALIZAR ENLACE DRIVE ]' : '[ 📤 SUBIR ENLACE DRIVE Y ENVIAR AL CEO ]')}
                        </button>
                    </div>`;
                }

                // Insignia de estado
                let statusBadge = '<span class="text-xs font-bold uppercase text-slate-300 bg-black border border-slate-700 px-2.5 py-0.5">⏳ PENDIENTE</span>';
                if (isDelivered) {
                    statusBadge = '<span class="text-xs font-black uppercase text-mars-green bg-mars-green/20 border border-mars-green px-2.5 py-0.5">🟢 ENTREGADO AL DOCENTE</span>';
                } else if (isSubmittedCeo) {
                    statusBadge = '<span class="text-xs font-black uppercase text-mars-yellow bg-mars-yellow/20 border border-mars-yellow px-2.5 py-0.5 animate-pulse">🟡 EN REVISIÓN CEO</span>';
                } else if (isReturned) {
                    statusBadge = '<span class="text-xs font-black uppercase text-red-400 bg-red-950/60 border border-red-500 px-2.5 py-0.5 animate-pulse">🔴 REVISIÓN REQUERIDA</span>';
                } else if (isWorkshopWork) {
                    statusBadge = '<span class="text-xs font-black uppercase text-blue-400 bg-blue-900/30 border border-blue-500 px-2.5 py-0.5">⚙️ EN TALLER FÍSICO</span>';
                }

                return `
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-l-4 ${isReturned ? 'border-l-red-500' : (isDelivered ? 'border-l-mars-green' : 'border-l-mars-cyan')} mb-4 space-y-3">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(def.key) : (def.phase || 'I')}</span>
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-slate-900 border border-slate-700 text-white">${this.escapeHTML(def.subject)} • ${this.escapeHTML(def.weight)}</span>
                            ${statusBadge}
                            <span class="text-xs font-mono px-2 py-0.5 uppercase ${dlStatus.class}">${this.escapeHTML(dlStatus.text)}</span>
                        </div>
                        <span class="text-xs text-slate-400 font-mono">Límite: ${this.escapeHTML(dlDate.replace('T', ' '))}</span>
                    </div>

                    <div>
                        <h3 class="text-white font-orbitron font-bold text-sm sm:text-base uppercase tracking-tight">${this.escapeHTML(def.name)}</h3>
                        <p class="text-xs text-slate-300 mt-0.5">${this.escapeHTML(def.desc)}</p>
                        <span class="text-[11px] text-mars-yellow uppercase font-mono mt-1 block">Dpto. Responsable: <strong>${this.escapeHTML(def.role.replace('_',' '))}</strong></span>
                    </div>

                    ${returnBannerHtml}
                    ${stepperHtml}

                    <!-- Enlaces Docs activos -->
                    <div class="flex flex-wrap items-center gap-2 pt-1">
                        ${this.renderDocTemplateBtn(def.key) || `<span class="min-h-[44px] inline-flex items-center px-3 py-1.5 text-[11px] bg-slate-900/70 text-slate-400 border border-slate-800 rounded font-mono">📄 Plantilla Google Docs aún no adjuntada por Coordinación</span>`}
                        ${docObj?.driveUrl ? `
                            <a href="${encodeURI(docObj.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(docObj.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 rounded font-mono hover:bg-cyan-900/60 transition-colors">
                                <span>📄 Abrir Mi Documento en Google Docs ↗</span>
                            </a>
                        ` : ''}
                    </div>

                    ${actionControlsHtml}
                </div>`;
            }).join('');

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-6';
        wrapper.innerHTML = `
            <!-- CABECERA -->
            <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 text-xs font-black uppercase bg-mars-cyan/20 border border-mars-cyan text-mars-cyan">MISIÓN AEROESPACIAL</span>
                            <span class="text-xs text-slate-400 font-mono">${phaseFilter === 'ALL' ? `${defs.length} HITOS CURRICULARES • 6 MATERIAS` : `${baseDefs.length} HITOS (FASE ${phaseFilter}) • 6 MATERIAS`}</span>
                        </div>
                        <h2 class="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-tight">
                            ${isCEO ? '📋 Supervisión de Entregas & Dossier Académico' : '📤 Mis Entregables & Dossier Académico'}
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Gestión integral: Plantillas Drive ➔ Visado CEO ➔ Calificaciones LOMLOE (100%) ➔ Cronograma.</p>
                    </div>
                    ${activeSection === 'deliverables' ? scopeSwitchHtml : ''}
                </div>

                <!-- SUBPESTAÑAS DE NAVEGACIÓN INTERNA -->
                <div role="tablist" aria-label="Secciones de Entregables y Dossier" class="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                    <button type="button" role="tab" aria-selected="${activeSection === 'deliverables'}" onclick="ui.setRoleDeliverablesSection('deliverables')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'deliverables' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📤 Gestión de Entregables</span>
                        ${(actionRequiredCount > 0) ? `<span class="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">${actionRequiredCount}</span>` : ''}
                    </button>
                    <button type="button" role="tab" aria-selected="${activeSection === 'grades'}" onclick="ui.setRoleDeliverablesSection('grades')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'grades' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📊 Calificaciones & Rúbricas (100%)</span>
                    </button>
                    <button type="button" role="tab" aria-selected="${activeSection === 'cronograma'}" onclick="ui.setRoleDeliverablesSection('cronograma')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'cronograma' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📅 Cronograma Oficial</span>
                    </button>
                </div>

                ${activeSection === 'deliverables' ? `
                    ${debtBannerHtml ? `<div class="mt-4">${debtBannerHtml}</div>` : ''}
                    <!-- CONTADORES RESUMEN -->
                    <div class="mt-4">
                        ${summaryHtml}
                    </div>

                    <!-- BARRA DE FILTROS -->
                    <div class="space-y-2.5 pt-3 border-t border-slate-800">
                        <div class="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por Fase">
                            <span class="text-xs font-mono text-slate-400 uppercase font-bold shrink-0">Fase:</span>
                            ${phaseTabsHtml}
                        </div>
                        <div class="flex items-center gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por Estado">
                            <span class="text-xs font-mono text-slate-400 uppercase font-bold shrink-0">Estado:</span>
                            ${statusTabsHtml}
                        </div>
                    </div>
                ` : ''}
            </div>

            <!-- CUERPO SEGÚN SUBPESTAÑA ACTIVA -->
            ${activeSection === 'deliverables' ? `
                <div class="space-y-4">
                    ${cardsHtml}
                </div>
            ` : (activeSection === 'grades' ? `
                <div class="space-y-4">
                    ${this.renderDossierEvalHtml(state.user.coId)}
                </div>
            ` : `
                <div class="space-y-4">
                    ${this.renderCronogramaSection ? this.renderCronogramaSection(state.user.coId) : ''}
                </div>
            `)}
        `;

        el.appendChild(wrapper);
    },

    modalDeliverRoleDoc(docKey) {
        return this.modalSubmitRoleDeliverable(docKey);
    },

    modalSubmitRoleDeliverable(docKey) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const def = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).find(d => d.key === docKey);
        if (!def) return;

        const effectiveRole = this.getEffectiveRole(co);
        const isDeptMatch = (effectiveRole === def.role)
            || (def.role === 'OPERACIONES_IA' && effectiveRole === 'OPERACIONES')
            || (def.key === 'hoja_taller_fyq' && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES' || effectiveRole === 'TECNICO'));
        if (!state.user.admin && !isDeptMatch) {
            return this.notify(`Solo el departamento responsable (${(def.role || '').replace('_', ' ')}) puede elaborar y subir este entregable. El CEO solo puede visarlo tras recibirlo.`, "warning");
        }
        if (!state.user.admin && this.isDeliverableLocked(docKey, co)) {
            return this.notify("Este entregable se encuentra bloqueado hasta su fecha de apertura oficial.", "warning");
        }

        const docObj = co.deliverables?.[docKey];
        const existingUrl = docObj?.driveUrl || '';
        const isReturned = (docObj?.status === 'CEO_REVISION' || docObj?.status === 'DEVUELTO_A_TECNICO');

        const tplBtnHtml = this.renderDocTemplateBtn(docKey);
        const bodyHtml = `
        <div class="space-y-4 font-mono text-xs">
            <div class="bg-slate-900 border border-mars-cyan/40 p-3 text-slate-200">
                <span class="text-mars-cyan font-bold uppercase block mb-1">ENTREGABLE OFICIAL // FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(def.key) : (def.phase || 'I')}</span>
                <p class="font-bold text-white uppercase text-sm">${this.escapeHTML(def.name)}</p>
                <p class="text-slate-400 mt-1">${this.escapeHTML(def.desc)}</p>
            </div>
            ${tplBtnHtml ? `
            <div class="bg-black/60 border border-slate-800 p-3 rounded space-y-2">
                <span class="text-[10px] text-mars-cyan font-bold uppercase block">Paso 1 — Plantilla Oficial del Entregable:</span>
                ${tplBtnHtml}
            </div>
            ` : ''}

            ${isReturned ? `
                <div class="bg-red-950/60 border border-red-500 p-3 text-red-300">
                    <strong class="uppercase block mb-1">⚠️ Observaciones del CEO / Claustro:</strong>
                    <p class="italic text-white">"${this.escapeHTML(docObj.returnReason || docObj.returnReasonId || 'Requiere subsanación')}"</p>
                    ${docObj.returnDriveUrl ? `<a href="${encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1.5 text-xs text-red-300 underline font-bold"><span>Ver documento con anotaciones en Google Drive ↗</span></a>` : ''}
                </div>
            ` : ''}

            <div class="p-3 bg-amber-950/35 border-2 border-amber-400/70 rounded space-y-2 mb-2">
                <div class="flex items-start gap-2">
                    <span class="text-base shrink-0">🔐</span>
                    <div class="text-xs font-sans text-amber-100 leading-snug">
                        <strong class="text-amber-300 uppercase font-mono block text-[11px]">PASO 1 OBLIGATORIO — Permisos de Lectura en Google Drive:</strong>
                        <span>En tu Google Doc/Drive pulsa <strong>Compartir</strong> ➔ Acceso general ➔ <strong>«Fomento centros de enseñanza (Lector)»</strong>.</span>
                    </div>
                </div>
                <label class="mars-checkbox-label text-xs text-white font-bold cursor-pointer bg-black/50 border border-amber-500/40 px-2.5 py-1.5 rounded w-full">
                    <input type="checkbox" id="deliverable-drive-perm-check" class="mars-touch-input">
                    <span class="mars-checkbox-visual"></span>
                    <span class="text-[11px] font-sans">✓ He compartido el documento con «Fomento centros de enseñanza (Lector)»</span>
                </label>
            </div>
            <div class="space-y-2">
                <label for="deliverable-drive-input" class="text-xs text-mars-cyan uppercase font-bold block">Paso 2: Enlace de TU documento rellenado en Google Drive / Docs</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="deliverable-drive-input" value="${this.escapeHTML(existingUrl)}" placeholder="https://docs.google.com/document/d/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 bg-black border-2 border-mars-cyan p-3 text-base sm:text-xs text-mars-cyan font-mono outline-none focus:shadow-neon-cyan min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('deliverable-drive-input') : ''}
                </div>
                <p class="text-[11px] text-slate-300 font-sans">No pegues el enlace de la plantilla vacía (<code>/copy</code>): usa primero <strong>[📋 Hacer Copia en Drive]</strong> y pega aquí el enlace de vuestra copia.</p>
            </div>
        </div>`;

        const actionsHtml = `
            <button type="button" id="btn-submit-role-deliverable" onclick="ui.submitRoleDeliverable('${this.escapeHTML(docKey)}')" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-5 py-2.5 hover:bg-white transition-all shadow-sm">
                [ 🚀 REMITIR AL CEO PARA SU VISADO ]
            </button>
        `;

        this.showModal(`Entregar: ${def.shortName || def.name}`, bodyHtml, actionsHtml);
    },

    modalCeoLedgerPreview() {
        if (!state.user || state.user.admin) return;
        const co = state.data.companies?.[state.user.coId];
        if (!co) return;
        const ledger = Array.isArray(co.ledger) ? co.ledger : [];
        const committed = state.getCommittedB2CBalance ? state.getCommittedB2CBalance(co) : 0;
        const freeBal = state.getFreeVirtualBalance ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        const rows = ledger.slice(0, 50).map(e => `
            <tr class="border-b border-slate-800/70">
                <td class="py-1.5 pr-2 text-slate-400 text-[11px]">${this.escapeHTML(e.date || '--')}</td>
                <td class="py-1.5 pr-2 text-white font-sans text-xs">${this.escapeHTML(e.concept || '')}</td>
                <td class="py-1.5 text-right font-mono font-bold text-xs ${Number(e.delta || 0) >= 0 ? 'text-mars-green' : 'text-mars-magenta'}">${Number(e.delta || 0) >= 0 ? '+' : ''}${Number(e.delta || 0).toFixed(2)} €v</td>
            </tr>`).join('') || `<tr><td colspan="3" class="py-4 text-center text-slate-400 italic text-xs">Sin movimientos registrados todavía.</td></tr>`;
        const html = `
            <div class="space-y-3">
                <div class="grid grid-cols-3 gap-2 text-center bg-black/60 border border-slate-800 p-2.5 rounded">
                    <div><span class="text-[10px] text-slate-400 uppercase block">Disponible</span><strong class="text-mars-green font-mono text-xs">${Number(co.balance || 0).toFixed(2)} €v</strong></div>
                    <div><span class="text-[10px] text-slate-400 uppercase block">Comprometido</span><strong class="text-mars-yellow font-mono text-xs">${committed.toFixed(2)} €v</strong></div>
                    <div><span class="text-[10px] text-slate-400 uppercase block">Libre Real</span><strong class="text-mars-cyan font-mono text-xs">${freeBal.toFixed(2)} €v</strong></div>
                </div>
                <div class="max-h-72 overflow-y-auto overflow-x-auto">
                    <table class="w-full text-left font-mono">${rows}</table>
                </div>
                ${ledger.length > 50 ? `<p class="text-[11px] text-slate-400 font-sans text-center">Mostrando los últimos 50 de ${ledger.length} movimientos (Finanzas dispone de los filtros completos).</p>` : ''}
            </div>`;
        this.showModal("Historial de Cobros y Pagos (€v)", html, "");
    },

    renderHojaTallerHistoryHtml(hojaObj) {
        const hist = Array.isArray(hojaObj?.history) ? hojaObj.history : [];
        if (hist.length === 0) {
            return `
            <div class="mt-3 pt-3 border-t border-slate-800/80">
                <p class="text-xs text-slate-400 font-sans italic">📜 Histórico de Montaje del Cohete (0 iteraciones todavía). Cada envío de I+D y revisión/incidencia de Operaciones quedará registrado aquí para elaborar la entrega final en Fase III.</p>
            </div>`;
        }
        const rows = [...hist].reverse().map((ev, idx) => {
            const iterNum = ev.iteration || (hist.length - idx);
            let badgeCls = 'text-cyan-300 bg-cyan-950/60 border-cyan-500/40';
            let badgeTxt = ev.action || 'REGISTRO';
            if (ev.action === 'INCIDENCIA_TALLER' || ev.action === 'DEVUELTO_CEO') {
                badgeCls = 'text-amber-300 bg-amber-950/60 border-amber-500/50';
            } else if (ev.action === 'REVISION_TALLER_OK' || ev.action === 'ELEVADO_A_CEO' || ev.action === 'VISADO_CEO') {
                badgeCls = 'text-mars-green bg-mars-green/10 border-mars-green/40';
            }
            const safeEvUrl = ev.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(ev.driveUrl) ? ev.driveUrl : '';
            return `
            <div class="bg-black/50 border border-slate-800 p-2.5 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div class="min-w-0 flex-1 space-y-0.5">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="font-mono font-bold text-white">#${iterNum}</span>
                        <span class="text-[11px] font-mono px-2 py-0.5 border rounded ${badgeCls}">${this.escapeHTML(badgeTxt)}</span>
                        <span class="text-[11px] text-slate-400 font-mono">${this.escapeHTML(ev.actor || '')} · ${this.escapeHTML(ev.date || '')}${ev.bomCount !== undefined ? ` · BOM: ${Number(ev.bomCount)} uds` : ''}</span>
                    </div>
                    <p class="text-slate-200 font-sans leading-snug break-words">${this.escapeHTML(ev.summary || '')}</p>
                </div>
                ${safeEvUrl ? `<a href="${encodeURI(safeEvUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 bg-slate-900 border border-cyan-500/40 text-cyan-300 hover:border-cyan-300 rounded font-mono text-xs shrink-0"><span>Ver Doc ↗</span></a>` : ''}
            </div>`;
        }).join('');
        return `
        <details class="mt-4 pt-3 border-t border-slate-800/80" ${hist.length <= 3 ? 'open' : ''}>
            <summary class="min-h-[44px] cursor-pointer flex items-center justify-between gap-2 text-xs font-mono font-bold text-mars-cyan hover:text-white select-none">
                <span>📜 Histórico de Montaje del Cohete (${hist.length} ${hist.length === 1 ? 'iteración' : 'iteraciones'} I+D ⇄ Taller)</span>
                <span class="text-slate-400 shrink-0">▼ Ver</span>
            </summary>
            <div class="mt-2 space-y-2 max-h-64 overflow-y-auto pr-1">
                ${rows}
            </div>
        </details>`;
    },

    async submitRoleDeliverable(docKey) {
        const inputEl = document.getElementById('deliverable-drive-input');
        const permCheckEl = document.getElementById('deliverable-drive-perm-check');
        if (!inputEl) return;
        const url = this.cleanInput(inputEl.value);

        if (!url) {
            if (this.highlightInvalidField) this.highlightInvalidField(url, inputEl);
            return this.notify("Debes indicar un enlace válido de Google Drive / Docs.", "warning");
        }
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(url)) {
            if (this.highlightInvalidField) this.highlightInvalidField(url, inputEl);
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }
        const tplCheck = this.isTemplateDriveUrl ? this.isTemplateDriveUrl(url) : { isTemplate: false };
        if (tplCheck.isTemplate) {
            if (this.highlightInvalidField) this.highlightInvalidField(url, inputEl);
            return this.notify(`⚠️ ${tplCheck.reason}`, "error");
        }
        if (permCheckEl && !permCheckEl.checked) {
            return this.notify("Marca la casilla confirmando que el enlace tiene permisos de lectura en Google Drive.", "warning");
        }
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const def = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).find(d => d.key === docKey);
        if (!def) return;

        const effectiveRole = this.getEffectiveRole(co);
        const isDeptMatch = (effectiveRole === def.role)
            || (def.role === 'OPERACIONES_IA' && effectiveRole === 'OPERACIONES')
            || (docKey === 'hoja_taller_fyq' && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES' || effectiveRole === 'TECNICO'));
        if (!state.user.admin && !isDeptMatch) {
            return this.notify(`Solo el departamento responsable (${(def.role || '').replace('_', ' ')}) puede subir este entregable. El CEO debe esperar a recibirlo para visarlo.`, "warning");
        }
        if (!state.user.admin && this.isDeliverableLocked(docKey, co)) {
            return this.notify("Este entregable se encuentra bloqueado hasta su fecha de apertura oficial.", "warning");
        }
        const submitBtn = document.getElementById('btn-submit-role-deliverable');
        if (submitBtn && submitBtn.disabled) return;
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = '⏳ Enviando...';
        }

        // Si es Hoja de Taller (DOC_10)
        if (docKey === 'hoja_taller_fyq') {
            if (effectiveRole === 'TECNICO' && typeof state.sendHojaTallerToWorkshop === 'function') {
                ui.closeModal();
                await state.sendHojaTallerToWorkshop(url);
                return;
            }
            co.deliverables = co.deliverables || {};
            const prev = (co.deliverables.hoja_taller_fyq && typeof co.deliverables.hoja_taller_fyq === 'object') ? co.deliverables.hoja_taller_fyq : {};
            const prevHistory = Array.isArray(prev.history) ? [...prev.history] : [];
            const isAdminOverride = Boolean(state.user.admin);
            const nextStatus = isAdminOverride ? 'DELIVERED_TO_TEACHER' : 'EN_TALLER_OPERARIO';
            const newDoc = {
                ...prev,
                driveUrl: url,
                url: url,
                status: nextStatus,
                history: prevHistory,
                updatedAt: new Date().toISOString()
            };
            delete newDoc.returnReasonId;
            delete newDoc.returnReason;
            delete newDoc.returnDriveUrl;
            delete newDoc.returnByTeacher;
            if (typeof state._appendHojaHistoryEntry === 'function') {
                state._appendHojaHistoryEntry(newDoc, co, {
                    actor: this.getActorRoleLabel ? this.getActorRoleLabel(co) : effectiveRole,
                    action: prevHistory.length > 0 ? 'ACTUALIZACION_A_TALLER' : 'ENVIO_A_TALLER',
                    summary: 'Hoja de Taller registrada desde Mis Entregables y remitida a Taller.',
                    driveUrl: url
                });
            }
            co.deliverables.hoja_taller_fyq = newDoc;
            state.save(state.user.coId);
            try {
                if (typeof state.executeAction === 'function') {
                    await state.executeAction('SUBMIT_DELIVERABLE', {
                        key: 'hoja_taller_fyq',
                        driveUrl: url,
                        status: nextStatus,
                        history: newDoc.history
                    });
                }
            } catch(e) {}
            if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
            ui.pushNotification(state.user.coId, 'OPERACIONES_IA', '⚙️ Hoja de Taller enviada al operario para comprobación de ensamble.', 'info', { view: 'cart' });
            ui.closeModal();
            this.notify("✅ Hoja de Taller remitida a taller para comprobación de ensamble.", "success");
            this.render();
            return;
        }

        // Entregable general: remite al CEO (o al Docente únicamente si quien lo envía es Coordinación/Admin)
        co.deliverables = co.deliverables || {};
        const isCEO = Boolean(state.user.admin) || (effectiveRole === 'CEO' && def.role === 'CEO');
        const targetStatus = isCEO ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO';
        const newDoc = {
            driveUrl: url,
            url: url,
            status: targetStatus,
            submittedBy: (effectiveRole !== state.user.role) ? `${state.user.role} (${effectiveRole})` : state.user.role,
            updatedAt: new Date().toISOString()
        };
        // Limpieza de banderas de devolución anteriores
        delete newDoc.returnReasonId;
        delete newDoc.returnReason;
        delete newDoc.returnDriveUrl;
        delete newDoc.returnByTeacher;
        co.deliverables[docKey] = newDoc;

        state.save(state.user.coId);
        try {
            if (typeof state.executeAction === 'function') {
                await state.executeAction('SUBMIT_DELIVERABLE', {
                    key: docKey,
                    driveUrl: url,
                    status: targetStatus
                });
            }
        } catch(e) {}
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        if (!isCEO) {
            const senderLabel = (effectiveRole !== state.user.role) ? `${state.user.role} (${effectiveRole})` : state.user.role;
            ui.pushNotification(state.user.coId, 'CEO', `📤 Entregable [${docKey}] remitido por ${senderLabel} para visado.`, 'info', { view: 'role_deliverables', section: 'deliverables', docKey });
        }

        ui.closeModal();
        this.notify(isCEO ? "✅ Entregable visado y remitido al Claustro Docente." : "✅ Entregable transmitido al CEO para su visado formal.", "success");
        this.render();
    },

    approveSpecialItemByCEO(reqId, skipReadCheck = false) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.specialItemRequests) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        const req = co.specialItemRequests.find(r => r.id === reqId);
        if (!req) return this.notify("Solicitud de material I+D no localizada.", "error");
        if (req.status !== 'PENDIENTE_CEO') return this.notify("Esta solicitud ya ha sido tramitada.", "info");
        if (!skipReadCheck && typeof this.confirmDocOpenedBeforeAction === 'function') {
            return this.confirmDocOpenedBeforeAction(req.driveUrl, () => this.approveSpecialItemByCEO(reqId, true), 'Sí, Aprobar y Elevar');
        }
        if (this.acquireActionLock && !this.acquireActionLock('ceo-special-' + reqId, 1500)) return;

        req.status = 'PENDIENTE_COORDINACION';
        req.approvedByCEO = true;
        req.approvedAt = Date.now();
        req.updatedAt = Date.now();

        state.data.pendingCustom = state.data.pendingCustom || [];
        const existingIdx = state.data.pendingCustom.findIndex(p => p.id === req.id);
        const customObj = {
            id: req.id,
            company: coId,
            name: req.name,
            driveUrl: req.driveUrl,
            date: req.date || new Date().toLocaleDateString(),
            status: 'PENDIENTE_COORDINACION',
            approvedByCEO: true,
            approvedAt: Date.now()
        };
        if (existingIdx >= 0) {
            state.data.pendingCustom[existingIdx] = customObj;
        } else {
            state.data.pendingCustom.push(customObj);
        }

        co.updatedAt = Date.now();
        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        // Notificación al Coordinador docente ("Este último que reciba notificación de aviso")
        ui.pushNotification('ADMIN', 'ALL', `🔬 [${co.name}] Nueva solicitud de material I+D aprobada por el CEO y elevada a Coordinación.`, 'info', { view: 'coordination' });
        // Notificación al Técnico
        ui.pushNotification(coId, 'TECNICO', `✓ Tu solicitud de material I+D ha sido visada por el CEO y elevada a Coordinación Docente.`, 'success', { view: 'tech' });

        this.notify("✅ Solicitud de material I+D visada y elevada a Coordinación Docente con notificación de aviso.", "success");
        this.render();
    },

    modalRejectSpecialItemByCEO(reqId) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const reasons = [
            "Presupuesto de tesorería insuficiente para este componente",
            "La memoria técnica DOC_13 requiere mayor concreción de planos y tolerancias",
            "Componente redundante con materiales ya disponibles en SUPER-MARSKET",
            "Incompatible con las directrices y normas de seguridad aeroespacial AEE",
            "Revisar permisos de lectura compartidos en Google Drive"
        ];
        const reasonOptions = reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('');

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-red-950/40 border border-red-500/50 text-slate-200">
                    <p class="text-red-400 font-bold uppercase mb-1">↩ Devolución a I+D (Zero-Text):</p>
                    <p class="font-sans text-[11px]">Selecciona el motivo tipificado para devolver la solicitud de material fuera de catálogo al Dpto. Técnico.</p>
                </div>
                <div>
                    <label for="reject-special-item-reason" class="text-mars-yellow uppercase font-bold block mb-1">Motivo Tipificado de Devolución</label>
                    <select id="reject-special-item-reason" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-red-400">
                        ${reasonOptions}
                    </select>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.rejectSpecialItemByCEO('${this.escapeHTML(reqId)}')" class="min-h-[44px] bg-red-600 text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-red-600 transition-all">[ ↩ Devolver a Técnico ]</button>`;
        this.showModal("Devolver Solicitud de Material I+D", html, actions);
    },

    rejectSpecialItemByCEO(reqId) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const elReason = document.getElementById('reject-special-item-reason');
        if (!elReason) return;
        const reason = this.cleanInput(elReason.value).trim();

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.specialItemRequests) return;

        const req = co.specialItemRequests.find(r => r.id === reqId);
        if (!req) return;

        req.status = 'DEVUELTO_CEO';
        req.returnReason = reason;
        req.rejectedAt = Date.now();
        req.updatedAt = Date.now();

        co.updatedAt = Date.now();
        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification(coId, 'TECNICO', `↩ Solicitud de material I+D devuelta por el CEO: "${reason}".`, 'warning', { view: 'tech' });
        this.closeModal();
        this.notify("Solicitud de material devuelta al Dpto. Técnico.", "info");
        this.render();
    },

    modalLaunchLicense() {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        if (!this.isLaunchLicenseUnlocked(co)) {
            return this.notify("⛔ Trámite bloqueado: Se requiere haber entregado formalmente el Informe Técnico Preliminar (DOC FYQ) al Claustro Docente antes de tramitar la Licencia AESA.", "error");
        }

        const initFee = (typeof LAUNCH_LICENSE_FEE !== 'undefined') ? LAUNCH_LICENSE_FEE : 50;
        const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
        const isResubmission = Boolean(co.launchLicense && co.launchLicense.status === 'DENEGADA' && Number(co.launchLicense.feePaid || 0) >= initFee);
        const feeToPay = isResubmission ? resubFee : initFee;
        const hasReportUrl = Boolean(isResubmission && co.launchLicense?.rejectReportUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(co.launchLicense.rejectReportUrl));
        const existingReason = (isResubmission && (co.launchLicense.rejectReason || hasReportUrl))
            ? `<div class="p-3 bg-red-950/40 border border-red-500/50 text-red-200 text-xs space-y-2">
                   <div>
                       <strong class="uppercase text-red-400 block mb-0.5">❌ Motivo de Denegación Previa:</strong>
                       <span>"${this.escapeHTML(co.launchLicense.rejectReason || 'Requiere subsanación técnica.')}"</span>
                   </div>
                   ${hasReportUrl ? `
                       <a href="${encodeURI(co.launchLicense.rejectReportUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/50 text-red-100 border border-red-400/60 rounded font-mono hover:bg-red-800/70 transition-colors">
                           <span>📄 Ver Informe de No Admisión Docente ↗</span>
                       </a>
                   ` : ''}
               </div>`
            : '';

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-mars-yellow/10 border border-mars-yellow text-slate-200 space-y-1">
                    <p class="text-mars-yellow font-bold uppercase flex items-center gap-1.5">
                        <span>🚀 Procedimiento de Seguridad AESA (DOC_14)</span>
                    </p>
                    <p class="font-sans text-[11px] leading-relaxed">
                        Conforme a la normativa aeroespacial simulada de la Fase II, los lanzamientos en el banco de pruebas están bloqueados. Para desbloquearlos, el CEO debe cumplimentar y firmar digitalmente la solicitud oficial y remitirla a Coordinación Docente ${isResubmission ? `tras subsanar el requerimiento (tasa administrativa de subsanación: <strong>${resubFee} €v</strong>).` : `con abono de la tasa administrativa de <strong>${initFee} €v</strong>.`}
                    </p>
                </div>
                ${existingReason}
                <div class="mb-2">
                    ${this.renderDocTemplateBtn('DOC_14_LICENCIA_AESA', '📄 Ver Plantilla Licencia AESA (DOC_14)')}
                </div>
                <div>
                    <label for="launch-license-drive-url" class="text-mars-cyan uppercase font-bold block mb-1">
                        Enlace a Solicitud Formal AESA en Google Drive / Docs (URL)
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="launch-license-drive-url" value="${isResubmission && co.launchLicense?.driveUrl ? this.escapeHTML(co.launchLicense.driveUrl) : ''}" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('launch-license-drive-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Asegúrate de compartir tu copia en Acceso general como <em>"Fomento centros de enseñanza (Lector)"</em>.</p>
                </div>
                <div class="p-3 bg-black/60 border border-slate-800 space-y-2">
                    <label class="flex items-start gap-2.5 cursor-pointer text-slate-200 text-xs font-sans">
                        <input type="checkbox" id="launch-license-sign-check" class="mt-0.5 min-h-[20px] min-w-[20px] accent-mars-yellow">
                        <span>D./Dª CEO certifica la veracidad de los cálculos estequiométricos de propelente, medidas de fuselaje y protocolos de seguridad física del banco de pruebas.</span>
                    </label>
                </div>
                <div class="p-2.5 bg-black/60 border border-slate-800 flex justify-between items-center text-xs">
                    <span class="text-slate-300">${isResubmission ? 'Tasa de Subsanación AESA:' : 'Tasa Administrativa AESA:'}</span>
                    <span class="text-mars-yellow font-bold font-orbitron">-${feeToPay.toFixed(2)} €v${isResubmission ? ' (Subsanación)' : ''}</span>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitLaunchLicense()" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">${isResubmission ? `[ 🔄 Firmar y Reenviar Subsanación (-${feeToPay} €v) ]` : `[ ✍️ Firmar y Tramitar Licencia (-${feeToPay} €v) ]`}</button>`;
        this.showModal("Tramitación de Licencia de Lanzamiento AESA (DOC_14)", html, actions);
    },

    submitLaunchLicense() {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const elUrl = document.getElementById('launch-license-drive-url');
        const elCheck = document.getElementById('launch-license-sign-check');
        if (!elUrl || !elCheck) return;

        const urlCheck = this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'la Solicitud AESA (DOC_14)' });
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (!elCheck.checked) {
            return this.notify("Debes marcar la casilla de certificación y firma digital del CEO.", "warning");
        }

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;
        if (co.launchLicense && co.launchLicense.status === 'PENDIENTE_DOCENTE') {
            return this.notify("La Licencia AESA ya se encuentra enviada y pendiente de resolución docente.", "info");
        }
        if (this.acquireActionLock && !this.acquireActionLock('submit-aesa-' + coId, 2000)) return;

        if (!this.isLaunchLicenseUnlocked(co)) {
            return this.notify("⛔ Trámite bloqueado: Se requiere haber entregado formalmente el Informe Técnico Preliminar (DOC FYQ) al Claustro Docente antes de tramitar la Licencia AESA.", "error");
        }

        const initFee = (typeof LAUNCH_LICENSE_FEE !== 'undefined') ? LAUNCH_LICENSE_FEE : 50;
        const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
        const isResubmission = Boolean(co.launchLicense && co.launchLicense.status === 'DENEGADA' && Number(co.launchLicense.feePaid || 0) >= initFee);
        const feeToPay = isResubmission ? resubFee : initFee;

        if (feeToPay > 0 && this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        if (feeToPay > 0 && Number(co.balance || 0) < feeToPay) {
            return this.notify(`Saldo insuficiente: se requieren ${feeToPay} €v de tesorería para la ${isResubmission ? 'tasa de subsanación' : 'tasa administrativa'} de la licencia AESA.`, "error");
        }

        if (feeToPay > 0) {
            state.addToLedger(
                coId,
                isResubmission
                    ? 'Tasa Administrativa de Subsanación // Licencia AESA (DOC_14)'
                    : 'Tasa Administrativa AESA // Licencia de Lanzamiento (DOC_14)',
                'TASAS_ADMINISTRATIVAS',
                -feeToPay
            );
        }

        const prevFeePaid = Number(co.launchLicense?.feePaid || 0);
        const prevResubCount = Number(co.launchLicense?.resubmissionCount || 0);

        co.launchLicense = {
            id: co.launchLicense?.id || ('AESA-' + Date.now()),
            driveUrl: driveUrl,
            status: 'PENDIENTE_DOCENTE',
            appliedAt: Date.now(),
            appliedDate: new Date().toLocaleDateString(),
            feePaid: prevFeePaid + feeToPay,
            resubmissionCount: isResubmission ? (prevResubCount + 1) : 0,
            signedBy: this.getActorRoleLabel ? this.getActorRoleLabel(co) : 'CEO',
            rejectReason: '',
            rejectReportUrl: ''
        };
        co.updatedAt = Date.now();

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification('ADMIN', 'ALL', `🚀 [${co.name}] El CEO ha tramitado ${isResubmission ? `una subsanación (${feeToPay} €v) de ` : `y abonado (${feeToPay} €v) `}la Licencia de Lanzamiento AESA. Pendiente de validación.`, 'info', { view: 'coordination' });
        ui.pushNotification(coId, 'ALL', `🚀 El CEO ha tramitado ${isResubmission ? `la subsanación de la Licencia AESA (-${feeToPay} €v)` : `la Licencia de Lanzamiento AESA (-${feeToPay} €v)`}. Pendiente de validación por Coordinación Docente.`, 'info', { view: 'resolutions', anchorId: 'aesa-license-tramite-panel' });

        this.closeModal();
        this.notify(isResubmission ? `✅ Subsanación de Licencia AESA reenviada al claustro (-${feeToPay} €v).` : `✅ Licencia AESA tramitada exitosamente. Tasa de ${feeToPay} €v abonada y remitida al claustro para su validación.`, "success");
        this.updateHUD();
        this.render();
    },

    modalPublishPressRelease(phaseKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        if (!this.isPressReleaseUnlocked(phaseKey, co)) {
            const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [];
            const phaseDef = prPhases.find(p => p.phase === phaseKey);
            return this.notify(`🔒 La Nota de Prensa de Fase ${phaseKey} permanece bloqueada hasta el cierre oficial de la fase (${phaseDef?.phaseCutoffLabel || ''}).`, "warning");
        }

        const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [
            { phase: 'I', title: 'Nota de Prensa Oficial — Cierre Fase I', deadlineLabel: '22/12/2026 (Corte: 15/12 + 7 días)', requiredContent: 'Presentación del concepto de cohete, capital obtenido por patrocinio y objetivos corporativos.' },
            { phase: 'II', title: 'Nota de Prensa Oficial — Cierre Fase II', deadlineLabel: '22/02/2027 (Corte: 15/02 + 7 días)', requiredContent: 'Resultados preliminares de las pruebas de vuelo, mediciones angulares y estado financiero a mitad del proyecto.' },
            { phase: 'III', title: 'Nota de Prensa Oficial — Cierre Fase III', deadlineLabel: '07/04/2027 (Corte: 31/03 + 7 días)', requiredContent: 'Conclusiones de taller, dificultades de montaje superadas y preparación para el Pitch final.' },
            { phase: 'IV', title: 'Nota de Prensa Oficial — Cierre Fase IV', deadlineLabel: '30/04/2027 (Corte: 23/04 + 7 días)', requiredContent: 'Validación científica final, rendimiento de propelentes y propuesta de valor para el Gran Concurso Aeroespacial.' }
        ];
        const phaseDef = prPhases.find(p => p.phase === phaseKey) || prPhases[0];
        const phaseBalance = co && co.phaseBalances ? co.phaseBalances[phaseDef.phase] : null;

        const balanceIntegrationHtml = phaseBalance ? `
            <div class="p-3 bg-emerald-950/40 border border-emerald-500/40 text-slate-200 space-y-1">
                <div class="flex justify-between items-center flex-wrap gap-1">
                    <span class="text-emerald-400 font-bold uppercase text-[11px]">📊 Balance Financiero de Fase Registrado por Finanzas:</span>
                    <span class="text-[10px] text-slate-400 font-mono">${this.escapeHTML(phaseBalance.date || '')}</span>
                </div>
                <p class="font-sans text-[11px]">Dictamen: <strong class="text-white">${this.escapeHTML(phaseBalance.verdict || 'Auditado')}</strong> | Saldo: <span class="font-mono text-emerald-300 font-bold">${Number(phaseBalance.snapshot?.balance || 0).toFixed(2)} €v</span></p>
                ${phaseBalance.driveUrl ? `<a href="${encodeURI(phaseBalance.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-cyan-300 underline font-mono text-[11px] block mt-0.5">📄 Consultar Balance DOC_17 en Drive para citar en la nota ↗</a>` : ''}
            </div>
        ` : `
            <div class="p-2.5 bg-black/60 border border-amber-500/30 text-amber-300/80 text-[11px] font-sans">
                ⚠️ Finanzas aún no ha registrado el Balance de Cierre de esta fase (DOC_17). Puedes publicar igualmente o coordinarte con Finanzas.
            </div>
        `;

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-cyan-950/40 border border-cyan-500/40 text-slate-200 space-y-1">
                    <p class="text-cyan-400 font-bold uppercase">${this.escapeHTML(phaseDef.title)}</p>
                    <p class="font-sans text-[11px] leading-relaxed">
                        Fecha límite de emisión: <strong>${this.escapeHTML(phaseDef.deadlineLabel)}</strong> (7 días de cortesía tras corte de fase). Sintetiza los avances de todas las áreas antes de su publicación en el Tablón de Noticias.
                    </p>
                </div>
                ${balanceIntegrationHtml}
                <div class="p-3 bg-black/60 border border-slate-800 text-slate-300 space-y-1">
                    <span class="text-mars-yellow font-bold uppercase text-[11px] block">Estructura Obligatoria:</span>
                    <p class="font-sans text-[11px]">${this.escapeHTML(phaseDef.requiredContent)}</p>
                </div>
                <div class="mb-2">
                    ${this.renderDocTemplateBtn('DOC_15_NOTA_PRENSA', '📄 Ver Plantilla Nota de Prensa (DOC_15)')}
                </div>
                <div class="p-3 bg-amber-950/35 border-2 border-amber-400/70 rounded space-y-2 mb-2">
                    <div class="flex items-start gap-2">
                        <span class="text-base shrink-0">🔐</span>
                        <div class="text-xs font-sans text-amber-100 leading-snug">
                            <strong class="text-amber-300 uppercase font-mono block text-[11px]">PASO 1 OBLIGATORIO — Permisos de Lectura en Google Drive:</strong>
                            <span>En tu Google Doc/Drive pulsa <strong>Compartir</strong> ➔ Acceso general ➔ <strong>«Fomento centros de enseñanza (Lector)»</strong>. Imprescindible para que el profesorado y las demás startups puedan leerla en el periódico.</span>
                        </div>
                    </div>
                    <label class="mars-checkbox-label text-xs text-white font-bold cursor-pointer bg-black/50 border border-amber-500/40 px-2.5 py-1.5 rounded w-full">
                        <input type="checkbox" id="press-release-share-ok" class="mars-touch-input">
                        <span class="mars-checkbox-visual"></span>
                        <span class="text-[11px] font-sans">✓ He compartido la Nota de Prensa con «Fomento centros de enseñanza (Lector)»</span>
                    </label>
                </div>
                <div>
                    <label for="press-release-drive-url" class="text-mars-cyan uppercase font-bold block mb-1">
                        Paso 2: Enlace a la Nota de Prensa en Google Drive o Docs (URL)
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="press-release-drive-url" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('press-release-drive-url') : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitPressRelease('${this.escapeHTML(phaseDef.phase)}')" class="min-h-[44px] bg-mars-cyan text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">[ 📰 Publicar en Tablón de Noticias ]</button>`;
        this.showModal(`Publicar Nota de Prensa (${phaseDef.title})`, html, actions);
    },

    submitPressRelease(phaseKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const shareChk = document.getElementById('press-release-share-ok');
        if (shareChk && !shareChk.checked) {
            return this.notify("⚠️ Paso 1 obligatorio: marca la casilla confirmando que compartiste la Nota de Prensa con «Fomento centros de enseñanza (Lector)».", "warning");
        }
        const elUrl = document.getElementById('press-release-drive-url');
        if (!elUrl) return;

        const urlCheck = this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'la Nota de Prensa (DOC_15)' });
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock('submit-pr-' + phaseKey, 1500)) return;

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        if (!this.isPressReleaseUnlocked(phaseKey, co)) {
            return this.notify(`🔒 La Nota de Prensa de Fase ${phaseKey} permanece bloqueada hasta el cierre oficial de la fase.`, "warning");
        }

        const prevPr = co.pressReleases?.[phaseKey];
        const prevPrTs = prevPr ? Math.max(Number(prevPr.updatedAt) || 0, Number(prevPr.publishedAt) || 0, Number(prevPr.returnedAt) || 0) : 0;
        const nowTs = Math.max(Date.now(), prevPrTs + 1);
        co.pressReleases = co.pressReleases || {};
        co.pressReleases[phaseKey] = {
            id: 'PR-' + coId + '-' + phaseKey,
            phase: phaseKey,
            status: 'PENDING_REVIEW',
            returnReason: '',
            returnDriveUrl: '',
            title: `Nota de Prensa Oficial Fase ${phaseKey} — ${co.name}`,
            driveUrl: driveUrl,
            publishedAt: nowTs,
            updatedAt: nowTs,
            publishedDate: new Date().toLocaleDateString(),
            author: this.getActorRoleLabel ? this.getActorRoleLabel(co) : 'CEO'
        };
        co.updatedAt = nowTs;

        // Registro en listado global para el Tablón de Noticias (pendiente de aprobación LEN / COORD)
        state.data.pressReleases = Array.isArray(state.data.pressReleases)
            ? state.data.pressReleases.filter(p => !(p && String(p.coId) === String(coId) && String(p.phase) === String(phaseKey)))
            : [];
        const item = {
            id: 'PR-' + coId + '-' + phaseKey,
            coId: coId,
            companyName: co.name,
            classGroup: co.classGroup || 'A',
            phase: phaseKey,
            status: 'PENDING_REVIEW',
            title: `Nota de Prensa Oficial — Cierre Fase ${phaseKey} (${co.name})`,
            driveUrl: driveUrl,
            publishedAt: nowTs,
            updatedAt: nowTs,
            publishedDate: new Date().toLocaleDateString()
        };
        state.data.pressReleases.unshift(item);

        ui.pushNotification(coId, 'ALL', `📰 El CEO ha remitido la Nota de Prensa de Fase ${phaseKey} (DOC_15) a Lengua y Coordinación para su revisión y publicación.`, 'info', { view: 'dashboard', subTab: 'press' });
        ui.pushNotification('ADMIN', 'ALL', `📰 [${co.name}] Nota de Prensa DOC_15 de Fase ${phaseKey} pendiente de aprobación editorial (LEN / COORD).`, 'info', { view: 'news' });

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.notify("✅ Nota de Prensa enviada a Lengua y Coordinación. Se publicará en Orbital Report tras su aprobación.", "success");
        this.render();
    },

    setNewsClassFilter(cls) {
        this.newsClassFilter = cls || 'ALL';
        this.render();
    },

    setNewsPhaseFilter(ph) {
        this.newsPhaseFilter = ph || 'ALL';
        this.render();
    },

    insertFormatTag(textareaId, tagStart, tagEnd = '') {
        const textarea = document.getElementById(textareaId);
        if (!textarea) return;
        const start = textarea.selectionStart || 0;
        const end = textarea.selectionEnd || 0;
        const text = textarea.value;
        const selected = text.substring(start, end);
        const replacement = selected ? `${tagStart}${selected}${tagEnd}` : `${tagStart}${tagEnd}`;
        textarea.value = text.substring(0, start) + replacement + text.substring(end);
        textarea.focus();
        const cursor = selected ? start + replacement.length : start + tagStart.length;
        textarea.setSelectionRange(cursor, cursor);
    },

    renderFormattedNewsText(raw) {
        if (!raw) return '';
        const safe = this.escapeHTML(String(raw));
        const paragraphs = safe.split(/\n{2,}/);

        return paragraphs.map(p => {
            let line = p.trim();
            if (!line) return '';

            // Negrita: **texto**
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
            // Cursiva: *texto* o _texto_
            line = line.replace(/\*([^\*]+?)\*/g, '<em class="text-amber-200/95 italic font-sans">$1</em>');
            line = line.replace(/_([^_]+?)_/g, '<em class="text-amber-200/95 italic font-sans">$1</em>');

            // Detectar si son viñetas
            const lines = line.split('\n');
            const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('• '));
            if (isBulletList) {
                const listItems = lines.map(l => {
                    const itemContent = l.trim().replace(/^[-•]\s*/, '');
                    return `<li class="leading-relaxed">${itemContent}</li>`;
                }).join('');
                return `<ul class="list-disc pl-5 space-y-1 mb-3 text-slate-200 font-sans">${listItems}</ul>`;
            }

            // Saltos de línea simples dentro del párrafo
            line = line.replace(/\n/g, '<br>');
            return `<p class="mb-3 leading-relaxed text-slate-200 font-sans">${line}</p>`;
        }).filter(Boolean).join('');
    },

    processNanoBananaImageFile(inputEl, targetHiddenId, previewContainerId) {
        if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
        const file = inputEl.files[0];
        if (!file.type.startsWith('image/')) {
            return this.notify("Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP).", "warning");
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxDim = 720;
                let w = img.width;
                let h = img.height;
                if (w > maxDim || h > maxDim) {
                    if (w > h) {
                        h = Math.round((h * maxDim) / w);
                        w = maxDim;
                    } else {
                        w = Math.round((w * maxDim) / h);
                        h = maxDim;
                    }
                }
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const compressedDataUrl = canvas.toDataURL('image/webp', 0.75) || canvas.toDataURL('image/jpeg', 0.75);
                
                const hiddenInput = document.getElementById(targetHiddenId);
                if (hiddenInput) hiddenInput.value = compressedDataUrl;

                const previewEl = document.getElementById(previewContainerId);
                if (previewEl) {
                    previewEl.innerHTML = `
                        <div class="relative group mt-2 border border-amber-400/50 rounded overflow-hidden max-h-48 bg-black flex items-center justify-center">
                            <img src="${compressedDataUrl}" alt="Vista previa Nano Banana 3" class="max-h-48 w-full object-contain">
                            <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/40">✓ Imagen Nano Banana 3 Optimizada</span>
                        </div>
                    `;
                    previewEl.classList.remove('hidden');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    previewNanoBananaUrl(url, previewContainerId) {
        const previewEl = document.getElementById(previewContainerId);
        if (!previewEl) return;
        const cleanUrl = String(url || '').trim();
        if (!cleanUrl) {
            previewEl.innerHTML = '';
            previewEl.classList.add('hidden');
            return;
        }
        previewEl.innerHTML = `
            <div class="relative group mt-2 border border-cyan-400/50 rounded overflow-hidden max-h-48 bg-black flex items-center justify-center">
                <img src="${this.escapeAttr(cleanUrl)}" alt="Vista previa" class="max-h-48 w-full object-contain" onerror="this.onerror=null; this.parentElement.innerHTML='<span class=\\'text-xs text-red-400 p-2 font-mono\\'>No se pudo cargar la imagen desde la URL. Comprueba el enlace.</span>'">
                <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/40">Enlace URL Externo</span>
            </div>
        `;
        previewEl.classList.remove('hidden');
    },

    modalViewNewsImage(imageUrl, caption) {
        if (!imageUrl) return;
        const html = `
            <div class="flex flex-col items-center">
                <div class="relative max-h-[75vh] w-full flex items-center justify-center bg-black/90 p-2 rounded border border-slate-700 overflow-hidden">
                    <img src="${this.escapeAttr(imageUrl)}" alt="${this.escapeAttr(caption || 'Imagen de Noticia')}" class="max-h-[70vh] max-w-full object-contain rounded shadow-2xl">
                </div>
                ${caption ? `<p class="mt-3 text-xs sm:text-sm font-sans text-slate-200 text-center uppercase tracking-wide font-bold">${this.escapeHTML(caption)}</p>` : ''}
                <div class="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300 font-mono">
                    <span>🎨</span>
                    <span>Generado con IA // Nano Banana 3</span>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-900 border border-slate-700 text-white hover:bg-white hover:text-black px-6 py-2 text-xs font-bold uppercase transition-all">Cerrar Visor</button>`;
        this.showModal("Visor de Imagen Oficial // Nano Banana 3", html, actions);
    },

    isNewsCoordinator() {
        if (!state.user || !state.user.admin) return false;
        const r = String(state.user.role || '').toUpperCase();
        return r.startsWith('COORD') || r === 'COORDINADOR';
    },

    canModeratePressReleases() {
        if (!state.user || !state.user.admin) return false;
        const r = String(state.user.role || '').toUpperCase();
        return r.startsWith('COORD') || r === 'COORDINADOR' || r === 'LEN';
    },

    getNewsLang() {
        if (!this.newsLang) {
            try {
                const saved = localStorage.getItem('marsket_news_lang');
                this.newsLang = (saved === 'EN') ? 'EN' : 'ES';
            } catch (e) {
                this.newsLang = 'ES';
            }
        }
        return this.newsLang;
    },

    setNewsLang(lang) {
        this.newsLang = (lang === 'EN') ? 'EN' : 'ES';
        try {
            localStorage.setItem('marsket_news_lang', this.newsLang);
        } catch (e) {}
        this.render();
    },

    getLocalizedNewsField(item, field) {
        if (!item) return '';
        const lang = this.getNewsLang();
        if (lang === 'EN') {
            return String(item[field + 'En'] || item[field] || '');
        }
        return String(item[field] || item[field + 'En'] || '');
    },

    getSpaceflightWireFallback() {
        return [
            {
                id: 'wire-fb-1',
                title: 'SpaceX Starship completes orbital flight test milestone with booster catch',
                news_site: 'SpaceNews',
                published_at: '2026-11-20T14:30:00Z',
                url: 'https://spacenews.com',
                image_url: '',
                summary: 'Rapid reusability of heavy-lift rocket stages continues to reshape launch cost economics for commercial payloads.'
            },
            {
                id: 'wire-fb-2',
                title: 'ESA and European NewSpace startups advance reusable small-rocket propulsion',
                news_site: 'European Spaceflight',
                published_at: '2026-11-18T10:15:00Z',
                url: 'https://europeanspaceflight.com',
                image_url: '',
                summary: 'European launch providers test modular propellant architectures and lightweight aerodynamic fairings.'
            },
            {
                id: 'wire-fb-3',
                title: 'Rocket Lab expands Electron cadence with streamlined composite airframes',
                news_site: 'NASASpaceFlight',
                published_at: '2026-11-15T18:00:00Z',
                url: 'https://www.nasaspaceflight.com',
                image_url: '',
                summary: 'Consistent manufacturing tolerances and cost-per-kilogram metrics remain decisive for dedicated smallsat missions.'
            },
            {
                id: 'wire-fb-4',
                title: 'Ariane 6 prepares next institutional payload integration in Kourou',
                news_site: 'ESA Space',
                published_at: '2026-11-12T09:00:00Z',
                url: 'https://www.esa.int',
                image_url: '',
                summary: 'Engineers finalize fairing acoustics and mass-budget verification ahead of upcoming launch window.'
            },
            {
                id: 'wire-fb-5',
                title: 'PLD Space accelerates Miura rocket development for European commercial access',
                news_site: 'Spaceflight Now',
                published_at: '2026-11-09T12:45:00Z',
                url: 'https://spaceflightnow.com',
                image_url: '',
                summary: 'Spanish launch engineering teams validate recovery systems and structural tank tolerances.'
            },
            {
                id: 'wire-fb-6',
                title: 'Secondary payload market grows as startups optimize rocket fairing volume',
                news_site: 'Ars Technica',
                published_at: '2026-11-05T16:20:00Z',
                url: 'https://arstechnica.com',
                image_url: '',
                summary: 'Rideshare adapters and surplus hardware contracts allow smaller aerospace firms to monetize unused capacity.'
            }
        ];
    },

    async autoTranslateText(text, fromLang = 'es', toLang = 'en') {
        const clean = String(text || '').trim();
        if (!clean || fromLang === toLang) return clean;
        try {
            const resp = await fetch('/api/news/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: clean, from: fromLang, to: toLang })
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && data.translatedText) return data.translatedText;
            }
        } catch (e) {}
        return clean;
    },

    getNewsImageSrc(rawUrl) {
        const u = String(rawUrl || '').trim();
        if (!u) return '/api/news/image';
        if (u.startsWith('data:image/') || u.startsWith('/api/news/image')) return u;
        if (/^https?:\/\//i.test(u)) return '/api/news/image?url=' + encodeURIComponent(u);
        return u;
    },

    renderEditorialParagraphs(rawText, useDropCap = false) {
        if (!rawText) return '';
        const safe = this.escapeHTML(String(rawText));
        const paragraphs = safe.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
        return paragraphs.map((p, idx) => {
            let line = p;
            line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="font-bold text-[#111111]">$1</strong>');
            line = line.replace(/\*([^\*]+?)\*/g, '<em class="italic">$1</em>');
            line = line.replace(/_([^_]+?)_/g, '<em class="italic">$1</em>');
            const lines = line.split('\n');
            const isBulletList = lines.every(l => l.trim().startsWith('- ') || l.trim().startsWith('• '));
            if (isBulletList) {
                const listItems = lines.map(l => `<li class="leading-relaxed">${l.trim().replace(/^[-•]\s*/, '')}</li>`).join('');
                return `<ul class="list-disc pl-6 space-y-1.5 mb-4 text-[#1f2937] font-serif text-base leading-relaxed">${listItems}</ul>`;
            }
            line = line.replace(/\n/g, '<br>');
            const dropCapCls = (useDropCap && idx === 0)
                ? 'first-letter:text-5xl first-letter:font-serif first-letter:font-black first-letter:float-left first-letter:mr-2.5 first-letter:leading-none first-letter:text-[#111111]'
                : '';
            return `<p class="mb-4 text-[#1f2937] font-serif text-base sm:text-[17px] leading-[1.7] ${dropCapCls}">${line}</p>`;
        }).join('');
    },

    async openWireArticleFullReader(idx, sourceList = 'wire') {
        const pool = sourceList === 'importer' ? (this._snapiImporterItems || []) : (this._snapiWireArticles || []);
        const art = pool[idx];
        if (!art) return this.notify("Artículo no encontrado.", "warning");

        const baseImg = art.proxy_image_url || this.getNewsImageSrc(art.image_url);
        this.activeFullArticleReader = {
            id: 'WIRE-' + (art.id || idx),
            isWire: true,
            wireIndex: idx,
            loading: true,
            category: 'ACTUALIDAD AEROESPACIAL',
            categoryEn: 'AEROSPACE DISPATCH',
            title: art.titleEs || art.title || '',
            titleEn: art.title || '',
            subtitle: art.summaryEs || art.summary || '',
            subtitleEn: art.summary || '',
            body: art.summaryEs || art.summary || '',
            bodyEn: art.summary || '',
            imageUrl: baseImg,
            rawImageUrl: art.image_url || '',
            sourceName: art.news_site || 'Aerospace Wire',
            sourceUrl: art.url || '',
            publishedDate: art.published_at ? new Date(art.published_at).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES'),
            author: art.news_site || 'Redacción Internacional',
            marsketImpact: '',
            marsketImpactEn: '',
            debateQuestion: '',
            debateQuestionEn: ''
        };
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (!art.url || !/^https?:\/\//i.test(art.url)) {
            if (this.activeFullArticleReader) {
                this.activeFullArticleReader.loading = false;
                this.render();
            }
            return;
        }

        try {
            const apiUrl = `/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(art.title || '')}&summary=${encodeURIComponent(art.summary || '')}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`;
            const resp = await fetch(apiUrl);
            if (resp.ok) {
                const full = await resp.json();
                if (this.activeFullArticleReader && this.activeFullArticleReader.sourceUrl === art.url) {
                    this.activeFullArticleReader = {
                        ...this.activeFullArticleReader,
                        loading: false,
                        title: full.titleEs || this.activeFullArticleReader.title,
                        titleEn: full.titleEn || this.activeFullArticleReader.titleEn,
                        subtitle: full.subtitleEs || this.activeFullArticleReader.subtitle,
                        subtitleEn: full.subtitleEn || this.activeFullArticleReader.subtitleEn,
                        body: full.bodyEs || this.activeFullArticleReader.body,
                        bodyEn: full.bodyEn || this.activeFullArticleReader.bodyEn,
                        imageUrl: full.imageUrl || this.activeFullArticleReader.imageUrl
                    };
                    this.render();
                    return;
                }
            }
        } catch (e) {}

        if (this.activeFullArticleReader) {
            this.activeFullArticleReader.loading = false;
            this.render();
        }
    },

    openSavedArticleFullReader(newsId) {
        const list = Array.isArray(state.data?.news) ? state.data.news : [];
        const art = list.find(n => String(n.id) === String(newsId));
        if (!art) return this.notify("Artículo no encontrado.", "warning");
        this.activeFullArticleReader = { ...art, isWire: false, loading: false };
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    closeFullArticleReader() {
        this.activeFullArticleReader = null;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async publishFullReaderArticleToBoard() {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        const reader = this.activeFullArticleReader;
        if (!reader) return;
        const now = Date.now();
        const lower = ((reader.titleEn || '') + ' ' + (reader.bodyEn || '')).toLowerCase();
        const isPropulsion = /propulsion|engine|fuel|booster|launch|starship|falcon|rocket/.test(lower);
        const catEs = isPropulsion ? 'PROPULSIÓN & LANZAMIENTO' : 'ACTUALIDAD AEROESPACIAL';
        const catEn = isPropulsion ? 'PROPULSION & LAUNCH' : 'AEROSPACE DISPATCH';
        const impactEs = isPropulsion
            ? 'Cada avance en eficiencia y reutilización recuerda a tu startup la importancia de optimizar la relación E = Altura / Coste en el Banco de Pruebas.'
            : 'Analiza cómo las decisiones industriales del sector espacial inspiran la gestión de costes, contratos y excedentes B2B de tu startup.';
        const impactEn = isPropulsion
            ? 'Every breakthrough in launch efficiency reminds your startup to optimize E = Height / Cost in the R&D Test Bench.'
            : 'Analyze how real aerospace industry moves inspire your startup’s cost discipline, contracts, and B2B surplus strategy.';
        const debateEs = '¿Qué lección técnica o financiera de esta noticia real podemos aplicar esta semana en nuestro equipo de MARS-KET?';
        const debateEn = 'Which technical or financial lesson from this real-world dispatch can our MARS-KET team apply this week?';

        const newsItem = state.normalizeNewsItem({
            id: 'NEWS-SNAPI-' + now + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            category: catEs,
            categoryEn: catEn,
            title: reader.title || reader.titleEn,
            subtitle: reader.subtitle || '',
            body: reader.body || reader.bodyEn || reader.title,
            titleEn: reader.titleEn || reader.title,
            subtitleEn: reader.subtitleEn || '',
            bodyEn: reader.bodyEn || reader.body || reader.titleEn,
            imageUrl: reader.imageUrl || null,
            sourceName: reader.sourceName || 'Spaceflight News API',
            sourceUrl: reader.sourceUrl || '',
            marsketImpact: reader.marsketImpact || impactEs,
            marsketImpactEn: reader.marsketImpactEn || impactEn,
            debateQuestion: reader.debateQuestion || debateEs,
            debateQuestionEn: reader.debateQuestionEn || debateEn,
            phase: 'ALL',
            classGroup: 'ALL',
            author: state.user?.name || 'Coordinación AEE',
            publishedAt: now,
            updatedAt: now,
            publishedDate: new Date().toLocaleDateString('es-ES'),
            featured: true
        });

        let list = Array.isArray(state.data.news) ? state.data.news : [];
        if (list.some(n => n && ((newsItem.sourceUrl && n.sourceUrl === newsItem.sourceUrl) || (n.title === newsItem.title && Math.abs((n.publishedAt || 0) - now) < 8000)))) {
            this.closeModal();
            return this.notify("ℹ️ Esta noticia ya estaba publicada en ORBITAL REPORT.", "info");
        }
        list = list.map(n => {
            if (!n) return n;
            if (n.placement === 'front' || n.featured) {
                return { ...n, placement: 'sub', subOrder: 1, featured: false, placementUpdatedAt: now, updatedAt: now };
            }
            if (n.placement === 'sub') {
                return { ...n, subOrder: (Number(n.subOrder) || 1) + 1, placementUpdatedAt: now };
            }
            return n;
        });
        newsItem.placement = 'front';
        newsItem.subOrder = 0;
        newsItem.placementUpdatedAt = now;
        list.unshift(newsItem);
        state.data.news = state.resolveFeaturedNews(list);
        state.data.officialNews = state.data.news;

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.activeFullArticleReader = null;
        this.render();
        this.notify("✅ Artículo completo traducido y fijado en la Portada de ORBITAL REPORT.", "success");
    },

    async quickPublishSnapiToBoard(idx, sourceList = 'wire') {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        if (this._publishingSnapiLock) return;
        const pool = sourceList === 'importer' ? (this._snapiImporterItems || []) : (this._snapiWireArticles || []);
        const art = pool[idx];
        if (!art) return this.notify("No se encontró la noticia seleccionada.", "warning");
        this._publishingSnapiLock = true;
        try {

        this.notify("🌐 Extrayendo artículo completo y traduciendo en servidor...", "info");

        let titleEn = String(art.title || '').trim();
        let titleEs = String(art.titleEs || '').trim();
        let summaryEn = String(art.summary || '').trim();
        let summaryEs = String(art.summaryEs || '').trim();
        let bodyEn = summaryEn || titleEn;
        let bodyEs = summaryEs || titleEs || titleEn;
        let imgUrl = art.proxy_image_url || this.getNewsImageSrc(art.image_url);

        if (art.url && /^https?:\/\//i.test(art.url)) {
            try {
                const apiUrl = `/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(titleEn)}&summary=${encodeURIComponent(summaryEn)}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`;
                const resp = await fetch(apiUrl);
                if (resp.ok) {
                    const full = await resp.json();
                    titleEn = full.titleEn || titleEn;
                    titleEs = full.titleEs || titleEs || titleEn;
                    summaryEn = full.subtitleEn || summaryEn;
                    summaryEs = full.subtitleEs || summaryEs;
                    bodyEn = full.bodyEn || bodyEn;
                    bodyEs = full.bodyEs || bodyEs;
                    if (full.imageUrl) imgUrl = full.imageUrl;
                }
            } catch (e) {}
        }

        const lower = (titleEn + ' ' + bodyEn).toLowerCase();
        const isPropulsion = /propulsion|engine|fuel|booster|launch|starship|falcon|rocket/.test(lower);
        const catEs = isPropulsion ? 'PROPULSIÓN & LANZAMIENTO' : 'ACTUALIDAD AEROESPACIAL';
        const catEn = isPropulsion ? 'PROPULSION & LAUNCH' : 'AEROSPACE DISPATCH';
        const impactEs = isPropulsion
            ? 'Cada avance en eficiencia y reutilización recuerda a tu startup la importancia de optimizar la relación E = Altura / Coste en el Banco de Pruebas.'
            : 'Analiza cómo las decisiones industriales del sector espacial inspiran la gestión de costes, contratos y excedentes B2B de tu startup.';
        const impactEn = isPropulsion
            ? 'Every breakthrough in launch efficiency reminds your startup to optimize E = Height / Cost in the R&D Test Bench.'
            : 'Analyze how real aerospace industry moves inspire your startup’s cost discipline, contracts, and B2B surplus strategy.';
        const debateEs = '¿Qué lección técnica o financiera de esta noticia real podemos aplicar esta semana en nuestro equipo de MARS-KET?';
        const debateEn = 'Which technical or financial lesson from this real-world dispatch can our MARS-KET team apply this week?';

        const now = Date.now();
        const newsItem = state.normalizeNewsItem({
            id: 'NEWS-SNAPI-' + now + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            category: catEs,
            categoryEn: catEn,
            title: titleEs || titleEn,
            subtitle: summaryEs ? summaryEs.slice(0, 220) : '',
            body: bodyEs,
            titleEn: titleEn,
            subtitleEn: summaryEn ? summaryEn.slice(0, 220) : '',
            bodyEn: bodyEn,
            imageUrl: imgUrl || null,
            sourceName: art.news_site || 'Spaceflight News API',
            sourceUrl: art.url || '',
            marsketImpact: impactEs,
            marsketImpactEn: impactEn,
            debateQuestion: debateEs,
            debateQuestionEn: debateEn,
            phase: 'ALL',
            classGroup: 'ALL',
            author: state.user?.name || 'Coordinación AEE',
            publishedAt: now,
            updatedAt: now,
            publishedDate: new Date().toLocaleDateString('es-ES'),
            featured: true
        });

        let list = Array.isArray(state.data.news) ? state.data.news : [];
        if (list.some(n => n && ((newsItem.sourceUrl && n.sourceUrl === newsItem.sourceUrl) || (n.title === newsItem.title && Math.abs((n.publishedAt || 0) - now) < 8000)))) {
            this.closeModal();
            return this.notify("ℹ️ Esta noticia ya estaba publicada en ORBITAL REPORT.", "info");
        }
        list = list.map(n => {
            if (!n) return n;
            if (n.placement === 'front' || n.featured) {
                return { ...n, placement: 'sub', subOrder: 1, featured: false, placementUpdatedAt: now, updatedAt: now };
            }
            if (n.placement === 'sub') {
                return { ...n, subOrder: (Number(n.subOrder) || 1) + 1, placementUpdatedAt: now };
            }
            return n;
        });
        newsItem.placement = 'front';
        newsItem.subOrder = 0;
        newsItem.placementUpdatedAt = now;
        list.unshift(newsItem);
        state.data.news = state.resolveFeaturedNews(list);
        state.data.officialNews = state.data.news;

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("✅ Artículo completo traducido y trasladado a la portada de ORBITAL REPORT.", "success");
        } finally {
            this._publishingSnapiLock = false;
        }
    },

    async fetchSpaceflightWire(force = false) {
        const cacheKey = 'marsket_snapi_wire_v2';
        const TTL_MS = 15 * 60 * 1000;
        if (!force && Array.isArray(this._snapiWireArticles) && this._snapiWireArticles.length > 0) {
            this.renderSpaceflightWireIntoDom();
            return this._snapiWireArticles;
        }
        if (!force) {
            try {
                const raw = sessionStorage.getItem(cacheKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.items) && (Date.now() - (parsed.ts || 0)) < TTL_MS) {
                        this._snapiWireArticles = parsed.items;
                        this._snapiWireIsFallback = false;
                        this.renderSpaceflightWireIntoDom();
                        return this._snapiWireArticles;
                    }
                }
            } catch (e) {}
        }

        let loaded = false;
        try {
            const resp = await fetch('/api/news/wire?q=rocket', { method: 'GET' });
            if (resp.ok) {
                const data = await resp.json();
                const items = Array.isArray(data?.results) ? data.results : [];
                if (items.length > 0) {
                    this._snapiWireArticles = items;
                    this._snapiWireIsFallback = false;
                    loaded = true;
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), items }));
                    } catch (e) {}
                }
            }
        } catch (e) {}

        if (!loaded) {
            try {
                const resp2 = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=6&search=rocket', { method: 'GET' });
                if (resp2.ok) {
                    const data2 = await resp2.json();
                    const items2 = Array.isArray(data2?.results) ? data2.results : [];
                    if (items2.length > 0) {
                        this._snapiWireArticles = items2;
                        this._snapiWireIsFallback = false;
                        loaded = true;
                    }
                }
            } catch (err) {}
        }

        if (!loaded) {
            this._snapiWireArticles = this.getSpaceflightWireFallback();
            this._snapiWireIsFallback = true;
        }
        this.renderSpaceflightWireIntoDom();
        return this._snapiWireArticles;
    },

    renderSpaceflightWireIntoDom() {
        const el = document.getElementById('orbital-wire-list');
        if (!el) return;
        const items = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];
        const isCoord = this.isNewsCoordinator();
        const lang = this.getNewsLang();
        if (items.length === 0) {
            el.innerHTML = `<p class="text-xs text-stone-600 font-serif p-2">${lang === 'EN' ? 'No live dispatches available.' : 'Sin teletipos disponibles en este momento.'}</p>`;
            return;
        }
        el.innerHTML = `
            ${this._snapiWireIsFallback ? `
                <div class="mb-2 px-2.5 py-1 bg-amber-50 border border-amber-300 text-[10px] font-mono text-amber-900">
                    ${lang === 'EN' ? 'Offline Archive · Curated Aerospace Dispatches' : 'Edición de Respaldo · Cables Aeroespaciales'}
                </div>
            ` : ''}
            <div class="divide-y divide-stone-300">
                ${items.map((art, idx) => {
                    const imgSrc = art.proxy_image_url || this.getNewsImageSrc(art.image_url);
                    const dateStr = art.published_at ? new Date(art.published_at).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' }) : '';
                    const displayTitle = (lang === 'ES' && art.titleEs) ? art.titleEs : (art.title || '');
                    return `
                    <article class="py-3.5 first:pt-1 last:pb-1">
                        <div class="flex gap-3 items-start">
                            <img src="${this.escapeAttr(imgSrc)}" alt="${this.escapeAttr(displayTitle)}" loading="lazy" onclick="ui.openWireArticleFullReader(${idx}, 'wire')" class="w-20 h-14 object-cover border border-stone-300 shrink-0 bg-stone-200 cursor-pointer">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center justify-between gap-2 text-[10px] font-mono text-[#8B0000] uppercase mb-1 font-bold">
                                    <span class="truncate">${this.escapeHTML(art.news_site || 'Aerospace Wire')}</span>
                                    <span class="text-stone-500 shrink-0">${this.escapeHTML(dateStr)}</span>
                                </div>
                                <button type="button" onclick="ui.openWireArticleFullReader(${idx}, 'wire')" class="text-left w-full text-sm font-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug mb-2 break-words transition-colors">
                                    ${this.escapeHTML(displayTitle)}
                                </button>
                                <div class="flex items-center gap-1.5 flex-wrap">
                                    <button type="button" onclick="ui.openWireArticleFullReader(${idx}, 'wire')" class="min-h-[44px] px-2.5 py-1 bg-white border border-stone-400 hover:border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-mono font-bold uppercase transition-colors">
                                        📖 ${lang === 'EN' ? 'Read Full' : 'Leer Completa'}
                                    </button>
                                    ${isCoord ? `
                                        <button type="button" onclick="ui.quickPublishSnapiToBoard(${idx}, 'wire')" class="min-h-[44px] px-2.5 py-1 bg-[#111111] text-white hover:bg-[#8B0000] text-[11px] font-mono font-bold uppercase transition-colors">
                                            📌 Portada
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </article>`;
                }).join('')}
            </div>
        `;
    },

    openEditorFromSnapiIndex(idx) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido a Coordinación.", "error");
        const items = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];
        const art = items[idx] || null;
        this.modalPublishOfficialNews(art);
    },

    async loadSnapiImporterList() {
        const listEl = document.getElementById('snapi-importer-results');
        const qEl = document.getElementById('snapi-importer-query');
        if (!listEl) return;
        const q = qEl ? qEl.value.trim() : 'rocket';
        listEl.innerHTML = `<p class="text-[11px] font-mono text-mars-cyan p-2">🛰️ Conectando con Spaceflight News API v4...</p>`;
        try {
            const url = `https://api.spaceflightnewsapi.net/v4/articles/?limit=6&search=${encodeURIComponent(q || 'rocket')}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP_' + resp.status);
            const data = await resp.json();
            const items = Array.isArray(data?.results) ? data.results : [];
            this._snapiImporterItems = items;
            if (items.length === 0) {
                listEl.innerHTML = `<p class="text-[11px] font-mono text-slate-400 p-2">Sin resultados para "${this.escapeHTML(q)}". Prueba con "rocket", "SpaceX" o "Mars".</p>`;
                return;
            }
            listEl.innerHTML = items.map((a, i) => `
                <div class="p-2 bg-slate-900 border border-slate-700 flex items-center justify-between gap-2 flex-wrap">
                    <div class="min-w-0 flex-1">
                        <span class="text-[10px] font-mono text-mars-cyan uppercase block">${this.escapeHTML(a.news_site || 'SNAPI')}</span>
                        <span class="text-xs text-white font-bold line-clamp-2">${this.escapeHTML(a.title || '')}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="ui.quickPublishSnapiToBoard(${i}, 'importer')" class="min-h-[44px] px-3 py-1.5 bg-amber-400 text-black font-black text-[11px] uppercase hover:bg-white transition-colors">
                            ⚡ Trasladar
                        </button>
                        <button type="button" onclick="ui.applySnapiImporterItem(${i})" class="min-h-[44px] px-2.5 py-1.5 bg-mars-cyan text-black font-black text-[11px] uppercase hover:bg-white transition-colors">
                            📥 Editar
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            this._snapiImporterItems = this.getSpaceflightWireFallback();
            listEl.innerHTML = `
                <p class="text-[11px] font-mono text-amber-300 p-1">⚠️ API externa no accesible en este momento. Mostrando cables locales de respaldo:</p>
                ${this._snapiImporterItems.slice(0, 3).map((a, i) => `
                    <div class="p-2 bg-slate-900 border border-slate-700 flex items-center justify-between gap-2">
                        <span class="text-xs text-white font-bold truncate">${this.escapeHTML(a.title)}</span>
                        <button type="button" onclick="ui.applySnapiImporterItem(${i})" class="min-h-[44px] px-3 py-1 bg-amber-400 text-black font-black text-[11px] uppercase shrink-0">📥 Cargar</button>
                    </div>
                `).join('')}
            `;
        }
    },

    applySnapiImporterItem(idx) {
        const items = Array.isArray(this._snapiImporterItems) ? this._snapiImporterItems : [];
        const art = items[idx];
        if (!art) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
        setVal('offnews-title-en', art.title || '');
        setVal('offnews-subtitle-en', art.summary ? art.summary.slice(0, 220) : '');
        setVal('offnews-body-en', art.summary || '');
        setVal('offnews-source-name', art.news_site || 'Spaceflight News API');
        setVal('offnews-source-url', art.url || '');
        if (art.image_url) {
            setVal('offnews-url', art.image_url);
            setVal('offnews-img-data', '');
            this.previewNanoBananaUrl(art.image_url, 'offnews-preview');
        }
        const titleEs = document.getElementById('offnews-title');
        if (titleEs && !titleEs.value.trim()) titleEs.value = art.title || '';
        const bodyEs = document.getElementById('offnews-body');
        if (bodyEs && !bodyEs.value.trim()) bodyEs.value = art.summary || '';
        this.notify("🛰️ Datos cargados desde SNAPI v4. Adapta el texto al español y añade el impacto MARS-KET.", "success");
    },

    applyNewsPedagogicPreset(presetKey) {
        const presets = {
            B2B: {
                impactEs: 'Revisa el inventario de tu Taller: cualquier componente probado que no uses puede venderse en el Mercado Secundario B2B (DOC_9) para recuperar €v antes del cierre de fase.',
                impactEn: 'Check your Workshop inventory: any tested part you no longer need can be listed on the B2B Secondary Market (DOC_9) to recover €v before phase close.',
                debateEs: '¿Conviene fabricar o comprar componentes nuevos, o podemos cerrar un acuerdo B2B más rentable con otra startup de la clase?',
                debateEn: 'Should we buy new catalog parts, or negotiate a more cost-effective B2B contract with a rival startup?'
            },
            EFFICIENCY: {
                impactEs: 'En el Banco de Pruebas de I+D, recuerda que la eficiencia E = Altura / Coste premia el equilibrio entre rendimiento aerodinámico y disciplina presupuestaria.',
                impactEn: 'In the R&D Test Bench, remember that efficiency E = Height / Cost rewards the balance between aerodynamic performance and budget discipline.',
                debateEs: '¿Qué parámetro de nuestro próximo lanzamiento (masa de reactivos o geometría de aletas) ofrece mayor mejora de E por cada €v invertido?',
                debateEn: 'Which parameter in our next test flight (propellant mass or fin geometry) yields the highest E improvement per €v spent?'
            },
            PRESS: {
                impactEs: 'Las startups que comunican con rigor técnico sus avances en la Nota de Prensa (DOC_15) refuerzan su posicionamiento ante patrocinadores y contratos.',
                impactEn: 'Startups that communicate technical milestones rigorously in their Press Release (DOC_15) strengthen their standing for sponsors and contracts.',
                debateEs: '¿Qué logro técnico o financiero de esta fase debe encabezar nuestra próxima Nota de Prensa DOC_15?',
                debateEn: 'Which technical or financial milestone from this phase should lead our upcoming DOC_15 Press Release?'
            }
        };
        const p = presets[presetKey];
        if (!p) return;
        const setVal = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
        setVal('offnews-impact', p.impactEs);
        setVal('offnews-impact-en', p.impactEn);
        setVal('offnews-debate', p.debateEs);
        setVal('offnews-debate-en', p.debateEn);
    },

    modalPublishOfficialNews(prefillSnapi = null, defaultSection = null) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");

        const initSec = (defaultSection === 'historia' || defaultSection === 'inventos' || defaultSection === 'actualidad')
            ? defaultSection
            : ((this.newsSectionTab === 'historia' || this.newsSectionTab === 'inventos') ? this.newsSectionTab : 'actualidad');
        const defaultCatEs = initSec === 'historia' ? 'UN POCO DE HISTORIA' : (initSec === 'inventos' ? 'DEL ESPACIO A TU CASA' : 'ACTUALIDAD AEROESPACIAL');
        const defaultCatEn = initSec === 'historia' ? 'A BIT OF HISTORY' : (initSec === 'inventos' ? 'FROM SPACE TO YOUR HOME' : 'AEROSPACE DISPATCH');

        const companies = state.data?.companies || {};
        const coList = Object.keys(companies).map(cid => ({
            id: cid,
            name: companies[cid].name,
            classGroup: companies[cid].classGroup || 'A'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const preTitleEn = prefillSnapi?.title || '';
        const preSummaryEn = prefillSnapi?.summary || '';
        const preImg = prefillSnapi?.image_url || '';
        const preSrcName = prefillSnapi?.news_site || '';
        const preSrcUrl = prefillSnapi?.url || '';

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div class="p-3 bg-cyan-950/40 border border-mars-cyan/50 rounded space-y-2">
                    <div class="flex items-center justify-between gap-2 flex-wrap">
                        <strong class="font-bold text-mars-cyan uppercase font-orbitron text-xs">🛰️ Importar Noticia Real (Spaceflight News API v4)</strong>
                        <button type="button" onclick="ui.loadSnapiImporterList()" class="min-h-[44px] bg-mars-cyan text-black px-3 py-1.5 text-xs font-black uppercase hover:bg-white transition-colors">
                            📡 Buscar en SNAPI v4
                        </button>
                    </div>
                    <div class="flex gap-2">
                        <input type="text" id="snapi-importer-query" value="rocket" placeholder="Ej: rocket, Mars, SpaceX, ESA..." class="flex-1 min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none focus:border-mars-cyan">
                    </div>
                    <div id="snapi-importer-results" class="space-y-1.5 max-h-48 overflow-y-auto"></div>
                </div>

                <div>
                    <label for="offnews-section" class="text-xs text-mars-cyan uppercase font-bold block mb-1 font-mono">Sección del Periódico *</label>
                    <select id="offnews-section" onchange="ui.onNewsSectionFormChange(this.value)" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/60 focus:border-amber-400 p-2.5 text-xs text-white font-bold outline-none">
                        <option value="actualidad" ${initSec === 'actualidad' ? 'selected' : ''}>📡 Actualidad (Portada y Noticias Generales)</option>
                        <option value="historia" ${initSec === 'historia' ? 'selected' : ''}>🏛️ Un poco de Historia (Pioneros y Hitos)</option>
                        <option value="inventos" ${initSec === 'inventos' ? 'selected' : ''}>🏠 Del Espacio a tu Casa (Inventos Reales)</option>
                    </select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-category" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Antetítulo / Categoría (ES) *</label>
                        <input type="text" id="offnews-category" value="${this.escapeAttr(defaultCatEs)}" placeholder="Ej: PROPULSIÓN & I+D" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white uppercase outline-none">
                    </div>
                    <div>
                        <label for="offnews-category-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Category Kicker (EN)</label>
                        <input type="text" id="offnews-category-en" value="${this.escapeAttr(defaultCatEn)}" placeholder="e.g. PROPULSION & R&D" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-mars-cyan p-2.5 text-xs text-white uppercase outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-title" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Titular (Español) *</label>
                        <input type="text" id="offnews-title" value="${this.escapeAttr(preTitleEn)}" placeholder="Titular principal en castellano..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none" required>
                    </div>
                    <div>
                        <label for="offnews-title-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Headline (English)</label>
                        <input type="text" id="offnews-title-en" value="${this.escapeAttr(preTitleEn)}" placeholder="English headline..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-mars-cyan p-2.5 text-xs text-white outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-subtitle" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Entradilla (Español)</label>
                        <input type="text" id="offnews-subtitle" placeholder="Resumen breve en cursiva bajo el titular..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="offnews-subtitle-en" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Subheadline (English)</label>
                        <input type="text" id="offnews-subtitle-en" value="${this.escapeAttr(preSummaryEn.slice(0, 220))}" placeholder="Short summary..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-mars-cyan p-2.5 text-xs text-white outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label for="offnews-phase" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fase Asociada</label>
                        <select id="offnews-phase" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" selected>Todas / Global</option>
                            <option value="I">Fase I</option>
                            <option value="II">Fase II</option>
                            <option value="III">Fase III</option>
                            <option value="IV">Fase IV</option>
                            <option value="V">Fase V</option>
                        </select>
                    </div>
                    <div>
                        <label for="offnews-class" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Clase Destino</label>
                        <select id="offnews-class" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" selected>Todas (A-F y TEST)</option>
                            <option value="A">Clase A</option>
                            <option value="B">Clase B</option>
                            <option value="C">Clase C</option>
                            <option value="D">Clase D</option>
                            <option value="E">Clase E</option>
                            <option value="F">Clase F</option>
                            <option value="TEST">Clase TEST</option>
                        </select>
                    </div>
                    <div>
                        <label for="offnews-company" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Startup (Opcional)</label>
                        <select id="offnews-company" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="">-- General --</option>
                            ${coList.map(c => `<option value="${this.escapeAttr(c.id)}">${this.escapeHTML(c.name)} [${this.escapeHTML(c.classGroup)}]</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                            <label for="offnews-body" class="text-xs text-amber-400 uppercase font-bold font-mono">Cuerpo (Español) *</label>
                            <div class="flex items-center gap-1">
                                <button type="button" onclick="ui.insertFormatTag('offnews-body', '**', '**')" class="min-h-[32px] px-2 bg-slate-800 border border-slate-700 text-white font-bold text-xs">B</button>
                                <button type="button" onclick="ui.insertFormatTag('offnews-body', '*', '*')" class="min-h-[32px] px-2 bg-slate-800 border border-slate-700 text-white italic text-xs">I</button>
                                <button type="button" onclick="ui.insertFormatTag('offnews-body', '\\n- ', '')" class="min-h-[32px] px-2 bg-slate-800 border border-slate-700 text-cyan-300 text-[11px]">• Lista</button>
                            </div>
                        </div>
                        <textarea id="offnews-body" rows="5" placeholder="Redacta o adapta la noticia al español..." class="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(preSummaryEn)}</textarea>
                    </div>
                    <div>
                        <label for="offnews-body-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Body (English)</label>
                        <textarea id="offnews-body-en" rows="5" placeholder="English body text (optional or imported)..." class="w-full bg-slate-900 border border-slate-700 focus:border-mars-cyan p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(preSummaryEn)}</textarea>
                    </div>
                </div>

                <div class="p-3 bg-slate-950 border border-mars-cyan/40 rounded space-y-2">
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <span class="text-xs font-orbitron font-bold text-mars-cyan uppercase">🧭 Conexión Pedagógica MARS-KET</span>
                        <div class="flex gap-1.5 flex-wrap">
                            <button type="button" onclick="ui.applyNewsPedagogicPreset('B2B')" class="min-h-[36px] px-2.5 py-1 bg-slate-800 border border-slate-600 text-[10px] text-amber-300 font-bold uppercase hover:bg-slate-700">⚡ Plantilla B2B</button>
                            <button type="button" onclick="ui.applyNewsPedagogicPreset('EFFICIENCY')" class="min-h-[36px] px-2.5 py-1 bg-slate-800 border border-slate-600 text-[10px] text-cyan-300 font-bold uppercase hover:bg-slate-700">⚡ Plantilla I+D / E</button>
                            <button type="button" onclick="ui.applyNewsPedagogicPreset('PRESS')" class="min-h-[36px] px-2.5 py-1 bg-slate-800 border border-slate-600 text-[10px] text-emerald-300 font-bold uppercase hover:bg-slate-700">⚡ Plantilla Prensa</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label for="offnews-impact" class="text-[11px] text-amber-300 font-bold block mb-1">Impacto en tu startup de MARS-KET (ES)</label>
                            <textarea id="offnews-impact" rows="2" placeholder="Cómo afecta esto a los equipos de 4º ESO..." class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none"></textarea>
                        </div>
                        <div>
                            <label for="offnews-impact-en" class="text-[11px] text-cyan-300 font-bold block mb-1">Startup Impact (EN)</label>
                            <textarea id="offnews-impact-en" rows="2" placeholder="Impact on MARS-KET startups..." class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none"></textarea>
                        </div>
                        <div>
                            <label for="offnews-debate" class="text-[11px] text-amber-300 font-bold block mb-1">Pregunta de debate para el Consejo (ES)</label>
                            <textarea id="offnews-debate" rows="2" placeholder="Pregunta estratégica para debatir en equipo..." class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none"></textarea>
                        </div>
                        <div>
                            <label for="offnews-debate-en" class="text-[11px] text-cyan-300 font-bold block mb-1">Boardroom Debate Question (EN)</label>
                            <textarea id="offnews-debate-en" rows="2" placeholder="Strategic question for the team board..." class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none"></textarea>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-source-name" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fuente / Medio</label>
                        <input type="text" id="offnews-source-name" value="${this.escapeAttr(preSrcName || 'Consejo Editorial AEE')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="offnews-source-url" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Enlace Fuente Original (URL)</label>
                        <input type="url" id="offnews-source-url" value="${this.escapeAttr(preSrcUrl)}" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                </div>

                <div class="p-3 bg-black/60 border border-slate-800 rounded space-y-3">
                    <label class="text-xs text-amber-300 uppercase font-bold block font-mono">🎨 Imagen de Portada // URL o Nano Banana 3</label>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 1: Subir imagen generada (se comprime automáticamente)</span>
                        <input type="file" id="offnews-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-img-data', 'offnews-preview')" class="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-white cursor-pointer">
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 2: URL de imagen (SNAPI / Google Drive / Web)</span>
                        <input type="url" id="offnews-url" value="${this.escapeAttr(preImg)}" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-preview')" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                    <input type="hidden" id="offnews-img-data" value="">
                    <div id="offnews-preview" class="${preImg ? '' : 'hidden'}">
                        ${preImg ? `<img src="${this.escapeAttr(preImg)}" alt="Preview" class="max-h-40 w-full object-contain border border-cyan-500/40 bg-black">` : ''}
                    </div>
                </div>

                <label class="mars-checkbox-label text-xs text-amber-300 font-bold uppercase cursor-pointer">
                    <input type="checkbox" id="offnews-featured" class="mars-touch-input" ${initSec === 'actualidad' ? 'checked' : ''}>
                    <span class="mars-checkbox-visual"></span>
                    <span>⭐ Publicar como Noticia de Portada Principal (65% ancho)</span>
                </label>
            </div>
        `;

        const actions = `
            <button type="button" onclick="ui.submitOfficialNews()" class="min-h-[44px] bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] w-full sm:w-auto">
                🚀 Publicar en ORBITAL REPORT
            </button>
        `;

        this.showModal("📰 Nueva Edición // ORBITAL REPORT", html, actions);
    },

    onNewsSectionFormChange(sec) {
        const catEl = document.getElementById('offnews-category');
        const catEnEl = document.getElementById('offnews-category-en');
        const featEl = document.getElementById('offnews-featured');
        const defaultsEs = { actualidad: 'ACTUALIDAD AEROESPACIAL', historia: 'UN POCO DE HISTORIA', inventos: 'DEL ESPACIO A TU CASA' };
        const defaultsEn = { actualidad: 'AEROSPACE DISPATCH', historia: 'A BIT OF HISTORY', inventos: 'FROM SPACE TO YOUR HOME' };
        if (catEl && Object.values(defaultsEs).includes(catEl.value.trim().toUpperCase())) {
            catEl.value = defaultsEs[sec] || defaultsEs.actualidad;
        }
        if (catEnEl && Object.values(defaultsEn).includes(catEnEl.value.trim().toUpperCase())) {
            catEnEl.value = defaultsEn[sec] || defaultsEn.actualidad;
        }
        if (featEl) {
            featEl.checked = (sec === 'actualidad');
        }
    },

    async submitOfficialNews() {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");

        const getVal = (id) => (document.getElementById(id)?.value || '').trim();
        const title = getVal('offnews-title');
        const body = getVal('offnews-body');
        if (!title) return this.notify("Debes indicar un titular en español para la noticia.", "warning");
        if (!body) return this.notify("Debes redactar el cuerpo del artículo.", "warning");

        const subtitle = getVal('offnews-subtitle');
        const marsketImpact = getVal('offnews-impact');
        const debateQuestion = getVal('offnews-debate');

        let titleEn = getVal('offnews-title-en');
        let subtitleEn = getVal('offnews-subtitle-en');
        let bodyEn = getVal('offnews-body-en');
        let marsketImpactEn = getVal('offnews-impact-en');
        let debateQuestionEn = getVal('offnews-debate-en');

        if (!titleEn || !bodyEn) {
            this.notify("🌐 Generando versión automática en inglés...", "info");
            const [trTitle, trSub, trBody, trImp, trDeb] = await Promise.all([
                titleEn ? Promise.resolve(titleEn) : this.autoTranslateText(title, 'es', 'en'),
                subtitleEn ? Promise.resolve(subtitleEn) : (subtitle ? this.autoTranslateText(subtitle, 'es', 'en') : Promise.resolve('')),
                bodyEn ? Promise.resolve(bodyEn) : this.autoTranslateText(body, 'es', 'en'),
                marsketImpactEn ? Promise.resolve(marsketImpactEn) : (marsketImpact ? this.autoTranslateText(marsketImpact, 'es', 'en') : Promise.resolve('')),
                debateQuestionEn ? Promise.resolve(debateQuestionEn) : (debateQuestion ? this.autoTranslateText(debateQuestion, 'es', 'en') : Promise.resolve(''))
            ]);
            titleEn = trTitle;
            subtitleEn = trSub;
            bodyEn = trBody;
            marsketImpactEn = trImp;
            debateQuestionEn = trDeb;
        }

        const elImgData = document.getElementById('offnews-img-data');
        const elUrl = document.getElementById('offnews-url');
        const imageUrl = (elImgData && elImgData.value) ? elImgData.value : (elUrl ? elUrl.value.trim() : '');

        const coId = getVal('offnews-company');
        const coName = coId && state.data?.companies?.[coId] ? state.data.companies[coId].name : '';
        const isFeatured = Boolean(document.getElementById('offnews-featured')?.checked);
        const now = Date.now();

        const newsItem = state.normalizeNewsItem({
            id: 'NEWS-' + now + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            section: getVal('offnews-section') || 'actualidad',
            category: getVal('offnews-category') || 'ACTUALIDAD AEROESPACIAL',
            categoryEn: getVal('offnews-category-en') || 'AEROSPACE DISPATCH',
            title: title,
            subtitle: subtitle,
            body: body,
            titleEn: titleEn,
            subtitleEn: subtitleEn,
            bodyEn: bodyEn,
            imageUrl: imageUrl || null,
            sourceName: getVal('offnews-source-name') || 'Consejo Editorial AEE',
            sourceUrl: getVal('offnews-source-url'),
            marsketImpact: marsketImpact,
            marsketImpactEn: marsketImpactEn,
            debateQuestion: debateQuestion,
            debateQuestionEn: debateQuestionEn,
            phase: getVal('offnews-phase') || 'ALL',
            classGroup: getVal('offnews-class') || 'ALL',
            coId: coId || null,
            companyName: coName || null,
            author: state.user?.name || (state.user?.role ? `Coordinación (${state.user.role})` : 'Coordinación AEE'),
            publishedAt: now,
            updatedAt: now,
            publishedDate: new Date().toLocaleDateString('es-ES'),
            featured: isFeatured
        });

        let list = Array.isArray(state.data.news) ? state.data.news : [];
        if (list.some(n => n && n.title === newsItem.title && Math.abs((n.publishedAt || 0) - now) < 8000)) {
            this.closeModal();
            return this.notify("ℹ️ Este artículo ya acaba de ser publicado.", "info");
        }
        if (isFeatured) {
            list = list.map(n => {
                if (!n) return n;
                if (n.placement === 'front' || n.featured) {
                    return { ...n, placement: 'sub', subOrder: 1, featured: false, placementUpdatedAt: now, updatedAt: now };
                }
                if (n.placement === 'sub') {
                    return { ...n, subOrder: (Number(n.subOrder) || 1) + 1, placementUpdatedAt: now, updatedAt: now };
                }
                return n;
            });
            newsItem.placement = 'front';
            newsItem.subOrder = 0;
            newsItem.placementUpdatedAt = now;
        } else {
            newsItem.placement = 'archive';
            newsItem.subOrder = 0;
            newsItem.placementUpdatedAt = now;
        }
        list.unshift(newsItem);
        state.data.news = state.resolveFeaturedNews(list);
        state.data.officialNews = state.data.news;

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification('ALL', 'ALL', `📰 [ORBITAL REPORT] Nuevo artículo publicado: "${title}".`, 'info', { view: 'news' });

        this.closeModal();
        this.render();
        this.notify("✅ Artículo publicado en ORBITAL REPORT.", "success");
    },

    deleteOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede retirar noticias.", "error");

        this.confirmModal(
            "¿Retirar Artículo de ORBITAL REPORT?",
            "Este artículo se eliminará definitivamente del periódico para todos los alumnos.",
            () => {
                state.data.deletedNewsIds = Array.isArray(state.data.deletedNewsIds) ? state.data.deletedNewsIds : [];
                if (!state.data.deletedNewsIds.includes(String(newsId))) {
                    state.data.deletedNewsIds.push(String(newsId));
                }
                state.data.deletedOfficialNewsIds = state.data.deletedNewsIds;

                const remaining = (state.data.news || []).filter(n => String(n.id) !== String(newsId));
                state.data.news = state.resolveFeaturedNews(remaining);
                state.data.officialNews = state.data.news;

                state.save();
                if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
                this.closeModal();
                this.render();
                this.notify("🗑️ Artículo retirado del periódico.", "info");
            }
        );
    },

    demoteNewsToArchive(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede reorganizar la portada.", "error");
        const now = Date.now();
        const list = (state.data.news || []).map(n => {
            if (!n) return n;
            if (String(n.id) === String(newsId)) {
                return { ...n, placement: 'archive', subOrder: 0, featured: false, placementUpdatedAt: now, updatedAt: now };
            }
            return n;
        });
        state.data.news = state.resolveFeaturedNews(list);
        state.data.officialNews = state.data.news;
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
        this.notify("📥 Noticia bajada a la Hemeroteca (conservada en archivo).", "info");
    },

    setNewsFeatured(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede fijar la portada.", "error");
        const now = Date.now();
        const list = (state.data.news || []).map(n => {
            if (!n) return n;
            const isTarget = String(n.id) === String(newsId);
            if (isTarget) {
                return { ...n, placement: 'front', subOrder: 0, featured: true, placementUpdatedAt: now, updatedAt: now };
            }
            if (n.placement === 'front' || n.featured) {
                return { ...n, placement: 'sub', subOrder: 1, featured: false, placementUpdatedAt: now, updatedAt: now };
            }
            if (n.placement === 'sub') {
                return { ...n, subOrder: (Number(n.subOrder) || 1) + 1, placementUpdatedAt: now };
            }
            return n;
        });
        state.data.news = state.resolveFeaturedNews(list);
        state.data.officialNews = state.data.news;
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("⭐ Portada actualizada (la anterior bajó debajo de portada).", "success");
    },

    modalEditOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");

        const news = (state.data?.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return this.notify("Artículo no localizado.", "error");

        const companies = state.data?.companies || {};
        const coList = Object.keys(companies).map(cid => ({
            id: cid,
            name: companies[cid].name,
            classGroup: companies[cid].classGroup || 'A'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const existingImg = news.imageUrl || '';
        const hasExistingImg = Boolean(existingImg);
        const curEditSec = news.section || 'actualidad';

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div>
                    <label for="offnews-edit-section" class="text-xs text-mars-cyan uppercase font-bold block mb-1 font-mono">Sección del Periódico *</label>
                    <select id="offnews-edit-section" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/60 p-2.5 text-xs text-white font-bold outline-none">
                        <option value="actualidad" ${curEditSec === 'actualidad' ? 'selected' : ''}>📡 Actualidad (Portada y Noticias Generales)</option>
                        <option value="historia" ${curEditSec === 'historia' ? 'selected' : ''}>🏛️ Un poco de Historia (Pioneros y Hitos)</option>
                        <option value="inventos" ${curEditSec === 'inventos' ? 'selected' : ''}>🏠 Del Espacio a tu Casa (Inventos Reales)</option>
                    </select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-category" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Categoría (ES)</label>
                        <input type="text" id="offnews-edit-category" value="${this.escapeAttr(news.category || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white uppercase outline-none">
                    </div>
                    <div>
                        <label for="offnews-edit-category-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Category (EN)</label>
                        <input type="text" id="offnews-edit-category-en" value="${this.escapeAttr(news.categoryEn || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white uppercase outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-title" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Titular (Español) *</label>
                        <input type="text" id="offnews-edit-title" value="${this.escapeAttr(news.title || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none" required>
                    </div>
                    <div>
                        <label for="offnews-edit-title-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Headline (English)</label>
                        <input type="text" id="offnews-edit-title-en" value="${this.escapeAttr(news.titleEn || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-subtitle" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Entradilla (ES)</label>
                        <input type="text" id="offnews-edit-subtitle" value="${this.escapeAttr(news.subtitle || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="offnews-edit-subtitle-en" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Subheadline (EN)</label>
                        <input type="text" id="offnews-edit-subtitle-en" value="${this.escapeAttr(news.subtitleEn || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label for="offnews-edit-phase" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fase</label>
                        <select id="offnews-edit-phase" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" ${news.phase === 'ALL' ? 'selected' : ''}>Todas</option>
                            <option value="I" ${news.phase === 'I' ? 'selected' : ''}>Fase I</option>
                            <option value="II" ${news.phase === 'II' ? 'selected' : ''}>Fase II</option>
                            <option value="III" ${news.phase === 'III' ? 'selected' : ''}>Fase III</option>
                            <option value="IV" ${news.phase === 'IV' ? 'selected' : ''}>Fase IV</option>
                            <option value="V" ${news.phase === 'V' ? 'selected' : ''}>Fase V</option>
                        </select>
                    </div>
                    <div>
                        <label for="offnews-edit-class" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Clase</label>
                        <select id="offnews-edit-class" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" ${news.classGroup === 'ALL' ? 'selected' : ''}>Todas</option>
                            ${['A', 'B', 'C', 'D', 'E', 'F', 'TEST'].map(c => `<option value="${c}" ${news.classGroup === c ? 'selected' : ''}>Clase ${c}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label for="offnews-edit-company" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Startup</label>
                        <select id="offnews-edit-company" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                            <option value="">-- General --</option>
                            ${coList.map(c => `<option value="${this.escapeAttr(c.id)}" ${news.coId === c.id ? 'selected' : ''}>${this.escapeHTML(c.name)} [${this.escapeHTML(c.classGroup)}]</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-body" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Cuerpo (ES) *</label>
                        <textarea id="offnews-edit-body" rows="5" class="w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(news.body || '')}</textarea>
                    </div>
                    <div>
                        <label for="offnews-edit-body-en" class="text-xs text-cyan-300 uppercase font-bold block mb-1 font-mono">Body (EN)</label>
                        <textarea id="offnews-edit-body-en" rows="5" class="w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(news.bodyEn || '')}</textarea>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label for="offnews-edit-impact" class="text-[11px] text-amber-300 font-bold block mb-1">Impacto MARS-KET (ES)</label>
                        <textarea id="offnews-edit-impact" rows="2" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">${this.escapeHTML(news.marsketImpact || '')}</textarea>
                    </div>
                    <div>
                        <label for="offnews-edit-impact-en" class="text-[11px] text-cyan-300 font-bold block mb-1">Startup Impact (EN)</label>
                        <textarea id="offnews-edit-impact-en" rows="2" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">${this.escapeHTML(news.marsketImpactEn || '')}</textarea>
                    </div>
                    <div>
                        <label for="offnews-edit-debate" class="text-[11px] text-amber-300 font-bold block mb-1">Pregunta Debate (ES)</label>
                        <textarea id="offnews-edit-debate" rows="2" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">${this.escapeHTML(news.debateQuestion || '')}</textarea>
                    </div>
                    <div>
                        <label for="offnews-edit-debate-en" class="text-[11px] text-cyan-300 font-bold block mb-1">Debate Question (EN)</label>
                        <textarea id="offnews-edit-debate-en" rows="2" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">${this.escapeHTML(news.debateQuestionEn || '')}</textarea>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-source-name" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fuente</label>
                        <input type="text" id="offnews-edit-source-name" value="${this.escapeAttr(news.sourceName || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="offnews-edit-source-url" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">URL Fuente</label>
                        <input type="url" id="offnews-edit-source-url" value="${this.escapeAttr(news.sourceUrl || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                </div>

                <div class="p-3 bg-black/60 border border-slate-800 rounded space-y-3">
                    <label class="text-xs text-amber-300 uppercase font-bold block font-mono">🎨 Portada // URL o Nano Banana 3</label>
                    ${hasExistingImg ? `
                        <div id="offnews-edit-current-img" class="p-2 bg-slate-950 border border-amber-500/40 rounded flex items-center justify-between gap-2 flex-wrap">
                            <img src="${this.escapeAttr(existingImg)}" class="w-16 h-10 object-cover rounded border border-slate-700" alt="Portada actual">
                            <button type="button" onclick="document.getElementById('offnews-edit-img-data').value = ''; document.getElementById('offnews-edit-url').value = ''; document.getElementById('offnews-edit-current-img').classList.add('hidden');" class="min-h-[44px] px-3 py-1 bg-red-950/60 border border-red-500 text-red-300 text-xs font-bold uppercase">
                                🗑️ Quitar Portada
                            </button>
                        </div>
                    ` : ''}
                    <input type="file" id="offnews-edit-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-edit-img-data', 'offnews-edit-preview')" class="w-full text-xs text-slate-300">
                    <input type="url" id="offnews-edit-url" value="${hasExistingImg && existingImg.startsWith('http') ? this.escapeAttr(existingImg) : ''}" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-edit-preview')" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none font-mono">
                    <input type="hidden" id="offnews-edit-img-data" value="${hasExistingImg ? this.escapeAttr(existingImg) : ''}">
                    <div id="offnews-edit-preview" class="hidden"></div>
                </div>

                <label class="mars-checkbox-label text-xs text-amber-300 font-bold uppercase cursor-pointer">
                    <input type="checkbox" id="offnews-edit-featured" class="mars-touch-input" ${news.featured ? 'checked' : ''}>
                    <span class="mars-checkbox-visual"></span>
                    <span>⭐ Destacar como Portada Principal</span>
                </label>
            </div>
        `;

        const actions = `
            <div class="flex gap-2 flex-wrap justify-end w-full">
                <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase">Cancelar</button>
                <button type="button" onclick="ui.submitEditOfficialNews('${this.escapeHTML(newsId)}')" class="min-h-[44px] bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase">
                    💾 Guardar Cambios
                </button>
            </div>
        `;

        this.showModal(`✏️ Editar Artículo // ${this.escapeHTML(news.title || '')}`, html, actions);
    },

    submitEditOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");

        const list = Array.isArray(state.data?.news) ? state.data.news : [];
        const news = list.find(n => String(n.id) === String(newsId));
        if (!news) return this.notify("Artículo no localizado.", "error");

        const getVal = (id) => (document.getElementById(id)?.value || '').trim();
        const title = getVal('offnews-edit-title');
        const body = getVal('offnews-edit-body');
        if (!title) return this.notify("Debes indicar un titular en español.", "warning");
        if (!body) return this.notify("Debes redactar el cuerpo del artículo.", "warning");

        const elImgData = document.getElementById('offnews-edit-img-data');
        const elUrl = document.getElementById('offnews-edit-url');
        const imageUrl = (elImgData && elImgData.value) ? elImgData.value : (elUrl ? elUrl.value.trim() : '');

        const coId = getVal('offnews-edit-company');
        const coName = coId && state.data?.companies?.[coId] ? state.data.companies[coId].name : '';
        const isFeatured = Boolean(document.getElementById('offnews-edit-featured')?.checked);
        const now = Date.now();

        news.section = getVal('offnews-edit-section') || news.section || 'actualidad';
        news.category = getVal('offnews-edit-category') || news.category || 'ACTUALIDAD AEROESPACIAL';
        news.categoryEn = getVal('offnews-edit-category-en') || news.categoryEn || 'AEROSPACE DISPATCH';
        news.title = title;
        news.subtitle = getVal('offnews-edit-subtitle');
        news.body = body;
        news.titleEn = getVal('offnews-edit-title-en');
        news.subtitleEn = getVal('offnews-edit-subtitle-en');
        news.bodyEn = getVal('offnews-edit-body-en');
        news.marsketImpact = getVal('offnews-edit-impact');
        news.marsketImpactEn = getVal('offnews-edit-impact-en');
        news.debateQuestion = getVal('offnews-edit-debate');
        news.debateQuestionEn = getVal('offnews-edit-debate-en');
        news.sourceName = getVal('offnews-edit-source-name') || 'Consejo Editorial AEE';
        news.sourceUrl = getVal('offnews-edit-source-url');
        news.phase = getVal('offnews-edit-phase') || 'ALL';
        news.classGroup = getVal('offnews-edit-class') || 'ALL';
        news.coId = coId || null;
        news.companyName = coName || null;
        news.imageUrl = imageUrl || null;
        news.featured = isFeatured;
        news.updatedAt = now;

        const nextList = isFeatured
            ? list.map(n => (String(n.id) === String(newsId) ? news : { ...n, featured: false, updatedAt: now }))
            : list;
        state.data.news = state.resolveFeaturedNews(nextList);
        state.data.officialNews = state.data.news;

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.render();
        this.notify("✅ Artículo actualizado en ORBITAL REPORT.", "success");
    },

    modalAttachNanoBananaToPR(prId) {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        let pr = null;
        let foundCo = null;
        const companies = state.data?.companies || {};
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (co && co.pressReleases) {
                Object.keys(co.pressReleases).forEach(pk => {
                    const item = co.pressReleases[pk];
                    if (item.id === prId || `${cid}-${pk}` === prId) {
                        pr = item;
                        foundCo = co;
                    }
                });
            }
        });

        if (!pr && Array.isArray(state.data?.pressReleases)) {
            pr = state.data.pressReleases.find(p => p.id === prId);
        }

        if (!pr) return this.notify("Nota de prensa no localizada.", "error");

        const currentImg = pr.nanoBananaImage || '';
        const currentNote = pr.editorialNote || '';

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div class="p-3 bg-cyan-950/40 border border-cyan-500/50 rounded flex items-start gap-2 text-cyan-200">
                    <span class="text-lg">🎨</span>
                    <div>
                        <strong class="font-bold text-cyan-300 block uppercase font-orbitron text-xs">Ilustrar Nota de Prensa // Nano Banana 3</strong>
                        <span>Adjunta una portada generada con IA y un comentario editorial a la Nota de Prensa Oficial de <strong>${this.escapeHTML(foundCo?.name || pr.companyName || 'Startup')}</strong>.</span>
                    </div>
                </div>

                <div class="p-3 bg-black/60 border border-slate-800 rounded space-y-3">
                    <label class="text-xs text-amber-300 uppercase font-bold block font-mono">Imagen Generada con Nano Banana 3</label>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 1: Subir imagen (optimizada al vuelo en tu navegador)</span>
                        <input type="file" id="pr-nano-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'pr-nano-img-data', 'pr-nano-preview')" class="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-white cursor-pointer">
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 2: O pegar enlace de imagen de Google Drive / Web</span>
                        <input type="url" id="pr-nano-url" value="${this.escapeAttr(currentImg.startsWith('data:') ? '' : currentImg)}" oninput="ui.previewNanoBananaUrl(this.value, 'pr-nano-preview')" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                    <input type="hidden" id="pr-nano-img-data" value="${this.escapeAttr(currentImg)}">
                    <div id="pr-nano-preview" class="${currentImg ? '' : 'hidden'}">
                        ${(currentImg && /^(https?:\/\/|data:image\/)/i.test(currentImg)) ? `
                            <div class="relative group mt-2 border border-amber-400/50 rounded overflow-hidden max-h-48 bg-black flex items-center justify-center">
                                <img src="${this.escapeAttr(currentImg)}" alt="Imagen actual" class="max-h-48 w-full object-contain">
                                <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/40">Imagen Vinculada</span>
                            </div>
                        ` : ''}
                    </div>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                        <label for="pr-nano-note" class="text-xs text-amber-400 uppercase font-bold font-mono">Apunte Editorial de Coordinación AEE (Opcional)</label>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '**', '**')" class="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-0 px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs rounded transition-colors" title="Negrita">
                                <strong>B</strong>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '*', '*')" class="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-0 px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white italic text-xs rounded transition-colors" title="Cursiva">
                                <em>I</em>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '\n\n', '')" class="min-h-[44px] min-w-[44px] sm:min-h-[28px] sm:min-w-0 px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-[11px] rounded transition-colors" title="Nuevo Párrafo">
                                ¶ Párrafo
                            </button>
                        </div>
                    </div>
                    <textarea id="pr-nano-note" rows="4" placeholder="Ej: La Dirección Técnica de la AEE destaca la sólida argumentación en el balance de patrocinio..." class="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(currentNote)}</textarea>
                    <span class="text-[10px] text-slate-400 font-mono block mt-1">Formato admitido: **negrita**, *cursiva* y saltos de párrafo.</span>
                </div>
            </div>
        `;

        const actions = `
            <button type="button" onclick="ui.submitAttachNanoBananaToPR('${this.escapeHTML(prId)}')" class="min-h-[44px] bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] w-full sm:w-auto">
                💾 Guardar Ilustración & Portada
            </button>
        `;

        this.showModal("🖼️ Ilustrar Nota de Prensa con Nano Banana 3", html, actions);
    },

    submitAttachNanoBananaToPR(prId) {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        const elImgData = document.getElementById('pr-nano-img-data');
        const elUrl = document.getElementById('pr-nano-url');
        const elNote = document.getElementById('pr-nano-note');

        let imgUrl = elImgData ? elImgData.value : '';
        if (!imgUrl && elUrl && elUrl.value.trim()) {
            imgUrl = elUrl.value.trim();
        }
        const note = elNote ? elNote.value.trim() : '';

        let updated = false;
        const companies = state.data?.companies || {};
        const nowNb = Date.now();
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (co && co.pressReleases) {
                Object.keys(co.pressReleases).forEach(pk => {
                    const item = co.pressReleases[pk];
                    if (item.id === prId || `${cid}-${pk}` === prId) {
                        item.nanoBananaImage = imgUrl || null;
                        item.editorialNote = note || null;
                        item.updatedAt = Math.max(nowNb, (Number(item.updatedAt) || 0) + 1);
                        co.updatedAt = nowNb;
                        updated = true;
                    }
                });
            }
        });

        if (Array.isArray(state.data?.pressReleases)) {
            const pr = state.data.pressReleases.find(p => p.id === prId);
            if (pr) {
                pr.nanoBananaImage = imgUrl || null;
                pr.editorialNote = note || null;
                pr.updatedAt = Math.max(nowNb, (Number(pr.updatedAt) || 0) + 1);
                updated = true;
            }
        }

        if (!updated) return this.notify("No se pudo actualizar la nota de prensa.", "error");

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("✅ Portada e ilustración de Nano Banana 3 vinculada con éxito.", "success");
    },

    approvePressReleaseForNewspaper(coId, phaseKey) {
        if (!this.canModeratePressReleases()) return this.notify("Solo Lengua (LEN) y Coordinación pueden aprobar Notas de Prensa.", "error");
        const co = state.data?.companies?.[coId];
        const pr = co?.pressReleases?.[phaseKey];
        if (!co || !pr) return this.notify("Nota de prensa no encontrada.", "error");

        const nowTs = Math.max(Date.now(), (Number(pr.updatedAt) || 0) + 1);
        pr.status = 'PUBLISHED';
        pr.approvedBy = state.user?.role || 'DOCENTE';
        pr.approvedAt = nowTs;
        pr.updatedAt = nowTs;
        co.updatedAt = nowTs;

        state.data.pressReleases = Array.isArray(state.data.pressReleases) ? state.data.pressReleases : [];
        const existingGlobal = state.data.pressReleases.find(p => p && String(p.coId) === String(coId) && String(p.phase) === String(phaseKey));
        if (existingGlobal) {
            existingGlobal.status = 'PUBLISHED';
            existingGlobal.updatedAt = nowTs;
            existingGlobal.approvedBy = pr.approvedBy;
        } else {
            state.data.pressReleases.unshift({
                id: pr.id || ('PR-' + coId + '-' + phaseKey),
                coId,
                companyName: co.name,
                classGroup: co.classGroup || 'A',
                phase: phaseKey,
                status: 'PUBLISHED',
                title: pr.title || `Nota de Prensa Oficial — Cierre Fase ${phaseKey} (${co.name})`,
                driveUrl: pr.driveUrl,
                nanoBananaImage: pr.nanoBananaImage || null,
                editorialNote: pr.editorialNote || null,
                publishedAt: pr.publishedAt || nowTs,
                updatedAt: nowTs,
                publishedDate: pr.publishedDate || new Date(nowTs).toLocaleDateString('es-ES')
            });
        }

        const msg = `📰 ¡Enhorabuena! Vuestra Nota de Prensa DOC_15 de Fase ${phaseKey} ha sido aprobada y publicada en ORBITAL REPORT.`;
        this.pushNotification(coId, 'CEO', msg, 'success', { view: 'news' });
        this.pushNotification(coId, 'MARKETING', msg, 'success', { view: 'news' });

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`✅ Nota de Prensa de ${co.name} publicada en ORBITAL REPORT.`, "success");
        this.render();
    },

    modalReadNewsArticle(newsId) {
        const list = Array.isArray(state.data?.news) ? state.data.news : [];
        const art = list.find(n => String(n.id) === String(newsId));
        if (!art) return this.notify("Artículo no encontrado.", "warning");

        const lang = this.getNewsLang();
        const isCoord = this.isNewsCoordinator();
        const cat = this.getLocalizedNewsField(art, 'category') || 'ACTUALIDAD';
        const title = this.getLocalizedNewsField(art, 'title');
        const subtitle = this.getLocalizedNewsField(art, 'subtitle');
        const body = this.getLocalizedNewsField(art, 'body');
        const impact = this.getLocalizedNewsField(art, 'marsketImpact');
        const debate = this.getLocalizedNewsField(art, 'debateQuestion');
        const hasImg = Boolean(art.imageUrl && /^(https?:\/\/|data:image\/)/i.test(art.imageUrl));
        const safeSourceUrl = (art.sourceUrl && /^https?:\/\//i.test(art.sourceUrl)) ? this.escapeAttr(art.sourceUrl) : '';

        const html = `
            <article class="space-y-4 font-sans text-xs sm:text-sm">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="px-2 py-0.5 text-[11px] font-mono font-black uppercase bg-amber-950/60 border border-amber-400 text-amber-300">${this.escapeHTML(cat)}</span>
                        <span class="text-[11px] font-mono text-slate-400">${this.escapeHTML(art.publishedDate || '--')} • ${this.escapeHTML(art.sourceName || 'AEE')}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="ui.setNewsLang('ES'); ui.modalReadNewsArticle('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-bold uppercase border ${lang === 'ES' ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-slate-900 text-slate-300 border-slate-700'}">🇪🇸 ES</button>
                        <button type="button" onclick="ui.setNewsLang('EN'); ui.modalReadNewsArticle('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-bold uppercase border ${lang === 'EN' ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-slate-900 text-slate-300 border-slate-700'}">🇬🇧 EN</button>
                    </div>
                </div>

                ${hasImg ? `
                    <div class="aspect-video w-full bg-black border border-slate-800 overflow-hidden">
                        <img src="${this.escapeAttr(art.imageUrl)}" alt="${this.escapeAttr(title)}" class="w-full h-full object-cover">
                    </div>
                ` : ''}

                <h3 class="text-lg sm:text-xl font-orbitron font-black text-white leading-snug">${this.escapeHTML(title)}</h3>
                ${subtitle ? `<p class="text-sm text-amber-200/90 italic font-sans leading-relaxed border-l-2 border-amber-400 pl-3">${this.escapeHTML(subtitle)}</p>` : ''}

                <div class="text-slate-200 leading-relaxed">${this.renderFormattedNewsText(body)}</div>

                ${(impact || debate) ? `
                    <div class="p-4 bg-slate-950 border-2 border-mars-cyan/50 space-y-2.5">
                        <h4 class="font-orbitron font-black text-xs uppercase text-mars-cyan tracking-wider">
                            🧭 ${lang === 'EN' ? 'MISSION LOG // BOARDROOM DEBATE' : 'BITÁCORA DE MISIÓN // DEBATE PARA EL CONSEJO'}
                        </h4>
                        ${impact ? `<p class="text-xs text-slate-200"><strong class="text-amber-300 uppercase">${lang === 'EN' ? 'Startup Impact:' : 'Impacto en tu startup:'}</strong> ${this.escapeHTML(impact)}</p>` : ''}
                        ${debate ? `<p class="text-xs text-cyan-200 italic"><strong class="not-italic text-mars-cyan uppercase">${lang === 'EN' ? 'Boardroom Question:' : 'Pregunta para el Consejo:'}</strong> ${this.escapeHTML(debate)}</p>` : ''}
                    </div>
                ` : ''}

                <div class="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <span class="text-slate-400">${lang === 'EN' ? 'Author:' : 'Redacción:'} ${this.escapeHTML(art.author || 'AEE')}</span>
                    ${safeSourceUrl ? `<a href="${safeSourceUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-950/60 border border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black font-bold uppercase">${lang === 'EN' ? 'Original Source ↗' : 'Fuente Original ↗'}</a>` : ''}
                </div>
            </article>
        `;

        const actions = `
            <div class="flex flex-wrap gap-2 justify-end w-full">
                ${isCoord && !art.featured ? `<button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-4 py-2 bg-amber-950/60 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-black text-xs font-bold uppercase">⭐ Fijar en Portada</button>` : ''}
                ${isCoord ? `<button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-slate-600 text-white hover:border-mars-cyan text-xs font-bold uppercase">✏️ Editar</button>` : ''}
                <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-5 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">Cerrar</button>
            </div>
        `;
        this.showModal(`ORBITAL REPORT // ${this.escapeHTML(cat)}`, html, actions, 'max-w-3xl');
    },

    newsSectionTab: 'portada',
    whoIsWhoRegionFilter: 'ALL',

    setNewsSectionTab(tab, anchorId = null) {
        if (tab === 'startups') {
            this.newsSectionTab = 'quien';
            anchorId = anchorId || 'who-startups-navarras';
        } else {
            const allowed = ['portada', 'actualidad', 'historia', 'inventos', 'quien', 'hemeroteca'];
            this.newsSectionTab = allowed.includes(tab) ? tab : 'portada';
        }
        this.activeFullArticleReader = null;
        this.render();
        if (anchorId) {
            setTimeout(() => {
                const targetEl = document.getElementById(anchorId);
                if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    openStartupsNavarrasSection() {
        this.setNewsSectionTab('quien', 'who-startups-navarras');
    },

    setWhoIsWhoRegionFilter(reg) {
        this.whoIsWhoRegionFilter = String(reg || 'ALL').toUpperCase();
        this.render();
    },

    getPublicStartupsList() {
        const resolveLogo = (raw) => {
            const s = String(raw || '').trim();
            if (!s || (!/^https?:\/\//i.test(s) && !s.startsWith('data:image/'))) return '';
            return (typeof this.getDirectDriveImageUrl === 'function') ? this.getDirectDriveImageUrl(s) : s;
        };

        if (state.user?.isVip && Array.isArray(state.data?.vipStartups)) {
            return state.data.vipStartups
                .map(s => ({
                    id: String(s.id || ''),
                    name: String(s.name || s.id || 'Startup'),
                    slogan: String(s.slogan || ''),
                    logo: resolveLogo(s.logo),
                    bestE: Number(s.bestE || 0),
                    maxHeight: Number(s.maxHeight || 0),
                    flightCount: Number(s.flightCount || 0),
                    publishedPrCount: Number(s.publishedPrCount || 0)
                }))
                .sort((a, b) => a.name.localeCompare(b.name));
        }

        const companies = state.data?.companies || {};
        return Object.keys(companies)
            .filter(cid => {
                const co = companies[cid];
                if (!co) return false;
                const cls = String(co.classGroup || '').toUpperCase();
                return !co.isTestCompany && cid !== 'sandbox_master' && cid !== 'sandbox_student' && cls !== 'TEST';
            })
            .map(cid => {
                const co = companies[cid];
                const flights = Array.isArray(co.flightTests) ? co.flightTests : [];
                let maxHeight = 0;
                let bestE = 0;
                flights.forEach(ft => {
                    if (!ft) return;
                    const h = Number(ft.height ?? ft.apogee ?? 0) || 0;
                    const c = Number(ft.cost ?? ft.flightCost ?? 0) || 0;
                    const eVal = Number(ft.efficiency ?? ft.e ?? (c > 0 ? h / c : 0)) || 0;
                    if (h > maxHeight) maxHeight = h;
                    if (eVal > bestE) bestE = eVal;
                });
                const prs = co.pressReleases || {};
                const publishedPrCount = Object.keys(prs).filter(ph => prs[ph]?.status === 'PUBLISHED').length;
                const isLogoAllowed = !co.brandStatus || co.brandStatus === 'APROBADO' || co.brandApproval?.status === 'APROBADO';
                return {
                    id: String(cid),
                    name: String(co.name || cid),
                    slogan: String(co.slogan || ''),
                    logo: isLogoAllowed ? resolveLogo(co.logo) : '',
                    bestE: Math.round(bestE * 10000) / 10000,
                    maxHeight: Math.round(maxHeight * 100) / 100,
                    flightCount: flights.length,
                    publishedPrCount
                };
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    },

    renderBrandLogoBadge(company, small = false) {
        const sizeCls = small ? 'w-9 h-9 text-[10px]' : 'w-12 h-12 text-xs';
        const customRaw = String(state.data?.realCompanyLogos?.[company?.id] || '').trim();
        const customLogo = (customRaw && (/^https?:\/\//i.test(customRaw) || customRaw.startsWith('data:image/')))
            ? (typeof this.getDirectDriveImageUrl === 'function' ? this.getDirectDriveImageUrl(customRaw) : customRaw)
            : '';
        const domain = String(company?.domain || '').trim();
        const monogram = String(company?.monogram || (company?.name || 'SP').slice(0, 3)).toUpperCase();
        const accent = company?.accentColor || '#0f172a';
        const faviconUrl = domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128` : '';
        const imgUrl = customLogo || faviconUrl;
        return `
        <div class="${sizeCls} shrink-0 bg-white border border-stone-300 flex items-center justify-center overflow-hidden p-1">
            ${imgUrl ? `
                <img src="${this.escapeAttr(imgUrl)}" alt="${this.escapeAttr(company?.name || '')}" loading="lazy"
                    onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');"
                    class="w-full h-full object-contain">
                <span class="hidden w-full h-full flex items-center justify-center font-mono font-black text-white" style="background:${this.escapeAttr(accent)}">${this.escapeHTML(monogram)}</span>
            ` : `
                <span class="w-full h-full flex items-center justify-center font-mono font-black text-white" style="background:${this.escapeAttr(accent)}">${this.escapeHTML(monogram)}</span>
            `}
        </div>`;
    },

    modalEditRealCompanyLogo(compId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        const presets = (typeof this.getWhoIsWhoRealPresets === 'function') ? this.getWhoIsWhoRealPresets() : [];
        const comp = presets.find(c => String(c.id) === String(compId));
        if (!comp) return this.notify("Empresa no encontrada en el directorio.", "warning");

        const existingLogo = String(state.data?.realCompanyLogos?.[comp.id] || '').trim();
        const hasCustom = Boolean(existingLogo);
        const safePreview = existingLogo ? (typeof this.getDirectDriveImageUrl === 'function' ? this.getDirectDriveImageUrl(existingLogo) : existingLogo) : '';

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div class="flex items-center gap-3 p-3 bg-slate-900 border border-slate-700 rounded">
                    ${this.renderBrandLogoBadge(comp, false)}
                    <div class="min-w-0">
                        <strong class="text-sm text-white block">${this.escapeHTML(comp.name)}</strong>
                        <span class="text-[11px] font-mono text-mars-cyan">${this.escapeHTML(comp.country || '')} · ${this.escapeHTML(comp.domain || '')}</span>
                    </div>
                </div>

                <div>
                    <label for="real-co-logo-file" class="text-xs text-amber-300 uppercase font-bold block mb-1 font-mono">Opción 1: Subir imagen de logo (se comprime a 200 px)</label>
                    <input type="file" id="real-co-logo-file" accept="image/*" onchange="ui.processRealCompanyLogoFile(this)" class="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-white cursor-pointer">
                </div>

                <div>
                    <label for="real-co-logo-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1 font-mono">Opción 2: Pegar URL directa del logotipo (https://...)</label>
                    <input type="url" id="real-co-logo-url" value="${hasCustom && /^https?:\/\//i.test(existingLogo) ? this.escapeAttr(existingLogo) : ''}" oninput="ui.previewNanoBananaUrl(this.value, 'real-co-logo-preview'); const hd = document.getElementById('real-co-logo-data'); if(hd && this.value.trim()) hd.value = this.value.trim();" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-mono outline-none focus:border-mars-cyan">
                </div>

                <input type="hidden" id="real-co-logo-data" value="${this.escapeAttr(existingLogo)}">
                <div id="real-co-logo-preview" class="${safePreview ? '' : 'hidden'} p-3 bg-white border border-slate-600 rounded flex items-center justify-center">
                    ${safePreview ? `<img src="${this.escapeAttr(safePreview)}" alt="Logo actual" class="max-h-24 max-w-full object-contain">` : ''}
                </div>
            </div>
        `;

        const actions = `
            <div class="flex flex-wrap gap-2 justify-end w-full">
                <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
                ${hasCustom ? `<button type="button" onclick="ui.clearRealCompanyLogo('${this.escapeAttr(comp.id)}')" class="min-h-[44px] px-4 py-2 bg-red-950/70 border border-red-500 text-red-200 hover:bg-red-600 hover:text-white text-xs font-bold uppercase">🗑️ Restaurar automático</button>` : ''}
                <button type="button" onclick="ui.saveRealCompanyLogo('${this.escapeAttr(comp.id)}')" class="min-h-[44px] px-5 py-2 bg-amber-400 text-black hover:bg-white text-xs font-black uppercase">💾 Guardar Logo</button>
            </div>
        `;
        this.showModal(`🖼️ Logotipo // ${comp.name}`, html, actions);
    },

    processRealCompanyLogoFile(input) {
        const file = input?.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const maxSide = 200;
                const scale = Math.min(1, maxSide / Math.max(img.width || 1, img.height || 1));
                const w = Math.max(1, Math.round((img.width || maxSide) * scale));
                const h = Math.max(1, Math.round((img.height || maxSide) * scale));
                const canvas = document.createElement('canvas');
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, w, h);
                const dataUrl = canvas.toDataURL('image/png');
                const hiddenEl = document.getElementById('real-co-logo-data');
                const urlEl = document.getElementById('real-co-logo-url');
                const prevEl = document.getElementById('real-co-logo-preview');
                if (hiddenEl) hiddenEl.value = dataUrl;
                if (urlEl) urlEl.value = '';
                if (prevEl) {
                    prevEl.innerHTML = `<img src="${dataUrl}" alt="Vista previa" class="max-h-24 max-w-full object-contain">`;
                    prevEl.classList.remove('hidden');
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    },

    saveRealCompanyLogo(compId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        const dataVal = (document.getElementById('real-co-logo-data')?.value || '').trim();
        const urlVal = (document.getElementById('real-co-logo-url')?.value || '').trim();
        const finalVal = dataVal || urlVal;
        if (!finalVal || (!/^https?:\/\//i.test(finalVal) && !finalVal.startsWith('data:image/'))) {
            return this.notify("Sube una imagen o pega una URL válida (https://...) antes de guardar.", "warning");
        }
        state.data.realCompanyLogos = (state.data.realCompanyLogos && typeof state.data.realCompanyLogos === 'object') ? state.data.realCompanyLogos : {};
        state.data.realCompanyLogos[String(compId)] = finalVal;
        state.data.realCompanyLogosUpdatedAt = Date.now();
        state.save('__GLOBAL__');
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("✅ Logotipo oficial guardado y sincronizado.", "success");
    },

    clearRealCompanyLogo(compId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        if (state.data?.realCompanyLogos) {
            delete state.data.realCompanyLogos[String(compId)];
        }
        state.data.realCompanyLogosUpdatedAt = Date.now();
        state.save('__GLOBAL__');
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("🗑️ Logotipo personalizado retirado (se usará el automático).", "info");
    },

    renderNewsSectionArticlesGrid(articles, sectionKey, isCoord, lang) {
        const metaMap = {
            actualidad: {
                kicker: lang === 'EN' ? 'CURRENT AFFAIRS // AEROSPACE & SCHOOL MISSION' : 'SECCIÓN // ACTUALIDAD',
                title: lang === 'EN' ? 'Aerospace & Mission News' : 'Actualidad Aeroespacial y de Misión',
                desc: lang === 'EN' ? 'Latest dispatches, strategic announcements, and adapted international launch coverage.' : 'Últimas crónicas de Coordinación, anuncios de misión y noticias internacionales adaptadas.'
            },
            historia: {
                kicker: lang === 'EN' ? 'HISTORICAL ARCHIVE // PIONEERS & MILESTONES' : 'SECCIÓN // UN POCO DE HISTORIA',
                title: lang === 'EN' ? 'A Bit of History: Pioneers of Flight & Space' : 'Un poco de Historia: Pioneros e Hitos Aeroespaciales',
                desc: lang === 'EN' ? 'From Emilio Herrera and Juan de la Cierva to Sputnik, Apollo, and Spain in space.' : 'De Emilio Herrera y Juan de la Cierva al Sputnik, el Programa Apolo y la presencia española en el espacio.'
            },
            inventos: {
                kicker: lang === 'EN' ? 'EVERYDAY SPIN-OFFS // REAL WORLD IMPACT' : 'SECCIÓN // DEL ESPACIO A TU CASA',
                title: lang === 'EN' ? 'From Space to Your Home: Everyday Inventions' : 'Del Espacio a tu Casa: Inventos Espaciales en tu Día a Día',
                desc: lang === 'EN' ? 'How engineering breakthroughs built for rockets and orbit became everyday technology.' : 'Tecnologías creadas para cohetes, cascos o satélites que hoy usas en el móvil, en casa o en el deporte.'
            }
        };
        const meta = metaMap[sectionKey] || metaMap.actualidad;

        return `
        <section class="space-y-5" aria-label="${this.escapeAttr(meta.title)}">
            <div class="border-b-2 border-[#111111] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <span class="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B0000]">${this.escapeHTML(meta.kicker)}</span>
                    <h3 class="text-2xl sm:text-3xl font-serif font-black text-[#111111] mt-0.5">${this.escapeHTML(meta.title)}</h3>
                    <p class="text-xs sm:text-sm text-stone-700 font-serif mt-1">${this.escapeHTML(meta.desc)}</p>
                </div>
                ${isCoord ? `
                    <button type="button" onclick="ui.modalPublishOfficialNews(null, '${this.escapeAttr(sectionKey)}')" class="min-h-[44px] px-4 py-2 bg-[#8B0000] text-white hover:bg-[#111111] text-xs font-mono font-bold uppercase shrink-0 transition-colors">
                        ✍️ + Añadir a esta sección
                    </button>
                ` : ''}
            </div>

            ${articles.length === 0 ? `
                <div class="bg-white border border-stone-300 p-8 text-center">
                    <p class="text-sm font-serif text-stone-700">${lang === 'EN' ? 'No articles published in this section yet.' : 'No hay artículos publicados en esta sección con el filtro actual.'}</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${articles.map(art => {
                        const aCat = this.getLocalizedNewsField(art, 'category') || meta.kicker;
                        const aTitle = this.getLocalizedNewsField(art, 'title');
                        const aSub = this.getLocalizedNewsField(art, 'subtitle') || this.getLocalizedNewsField(art, 'body');
                        const aImg = art.imageUrl ? this.getNewsImageSrc(art.imageUrl) : '';
                        return `
                        <article class="bg-white border border-stone-300 flex flex-col justify-between shadow-sm hover:border-[#111111] transition-colors">
                            <div>
                                ${aImg ? `
                                    <div class="aspect-video w-full bg-stone-200 border-b border-stone-300 overflow-hidden">
                                        <img src="${this.escapeAttr(aImg)}" alt="${this.escapeAttr(aTitle)}" class="w-full h-full object-cover cursor-pointer hover:scale-[1.02] transition-transform" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')">
                                    </div>
                                ` : ''}
                                <div class="p-4 space-y-2">
                                    <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                                        <span class="text-[#8B0000] font-black uppercase truncate">${this.escapeHTML(aCat)}</span>
                                        <span class="text-stone-500 shrink-0">${this.escapeHTML(art.publishedDate || '--')}</span>
                                    </div>
                                    <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="text-left w-full text-lg font-serif font-black text-[#111111] hover:text-[#8B0000] leading-snug">
                                        ${this.escapeHTML(aTitle)}
                                    </button>
                                    ${aSub ? `<p class="text-xs text-stone-700 font-serif line-clamp-3 leading-relaxed">${this.escapeHTML(aSub)}</p>` : ''}
                                    <span class="block text-[10px] font-mono text-stone-500 pt-1">${this.escapeHTML(art.sourceName || 'ORBITAL REPORT')}</span>
                                </div>
                            </div>
                            <div class="px-4 pb-4 pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                                    📖 ${lang === 'EN' ? 'Read Full Article' : 'Leer Completo'}
                                </button>
                                ${isCoord ? `
                                    <div class="flex items-center gap-1">
                                        ${sectionKey === 'actualidad' && !art.featured ? `<button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(art.id)}')" class="min-h-[44px] min-w-[44px] px-2 py-1 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold" title="Fijar en Portada">⭐</button>` : ''}
                                        <button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-stone-100 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold" title="Editar artículo">✏️</button>
                                        <button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-xs font-mono font-bold" title="Eliminar artículo">✕</button>
                                    </div>
                                ` : ''}
                            </div>
                        </article>`;
                    }).join('')}
                </div>
            `}
        </section>`;
    },

    renderWhoIsWhoDirectoryView(lang) {
        const isCoord = this.isNewsCoordinator();
        const allReal = (typeof this.getWhoIsWhoRealPresets === 'function') ? this.getWhoIsWhoRealPresets() : [];
        const activeReg = this.whoIsWhoRegionFilter || 'ALL';
        const filtered = allReal.filter(c => activeReg === 'ALL' || String(c.region || 'INTL').toUpperCase() === activeReg);
        const regBtns = [
            { id: 'ALL', label: lang === 'EN' ? `All (${allReal.length})` : `Todas (${allReal.length})` },
            { id: 'ES', label: lang === 'EN' ? '🇪🇸 Spain' : '🇪🇸 España' },
            { id: 'EU', label: lang === 'EN' ? '🇪🇺 Europe' : '🇪🇺 Europa' },
            { id: 'INTL', label: lang === 'EN' ? '🌍 International' : '🌍 Internacional' }
        ];

        return `
        <section class="space-y-7" aria-label="Quién es quién en el sector aeroespacial">
            <div class="border-b-2 border-[#111111] pb-3 flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div>
                    <span class="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'DIRECTORY // WHO IS WHO' : 'DIRECTORIO // QUIÉN ES QUIÉN'}</span>
                    <h3 class="text-2xl sm:text-3xl font-serif font-black text-[#111111] mt-0.5">${lang === 'EN' ? 'Who is Who in Global Aerospace' : 'Quién es quién en el Sector Aeroespacial'}</h3>
                    <p class="text-xs sm:text-sm text-stone-700 font-serif mt-1">${lang === 'EN' ? 'Real agencies and aerospace companies shaping orbital transport, satellites, and propulsion.' : 'Empresas y agencias reales españolas, europeas e internacionales con acceso directo a su web oficial.'}</p>
                </div>
                <div class="flex flex-wrap gap-1.5 items-center">
                    ${regBtns.map(b => `
                        <button type="button" onclick="ui.setWhoIsWhoRegionFilter('${b.id}')" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase border transition-colors ${activeReg === b.id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-stone-400 hover:border-[#111111]'}">
                            ${this.escapeHTML(b.label)}
                        </button>
                    `).join('')}
                    <button type="button" onclick="document.getElementById('who-startups-navarras')?.scrollIntoView({ behavior: 'smooth', block: 'start' })" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase border border-[#8B0000] bg-[#8B0000] text-white hover:bg-[#111111] hover:border-[#111111] transition-colors">
                        🚀 ${lang === 'EN' ? 'Navarra Startups ↓' : 'Startups Navarras ↓'}
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${filtered.map(comp => {
                    const safeWeb = (comp.website && /^https?:\/\//i.test(comp.website)) ? this.escapeAttr(comp.website) : '';
                    return `
                    <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-3 hover:border-[#111111] transition-colors">
                        <div class="space-y-2.5">
                            <div class="flex items-start gap-3">
                                ${this.renderBrandLogoBadge(comp, false)}
                                <div class="min-w-0 flex-1">
                                    <div class="flex items-center justify-between gap-1.5 flex-wrap">
                                        <span class="text-[10px] font-mono font-bold uppercase text-[#8B0000]">${this.escapeHTML(comp.category || 'Aeroespacial')}</span>
                                        <span class="text-[10px] font-mono px-1.5 py-0.5 bg-stone-100 border border-stone-300 text-stone-700">${this.escapeHTML(comp.country || '')}</span>
                                    </div>
                                    <h4 class="text-base font-serif font-black text-[#111111] leading-snug mt-0.5">${this.escapeHTML(comp.name)}</h4>
                                </div>
                            </div>
                            <p class="text-xs text-stone-700 font-serif leading-relaxed">${this.escapeHTML(comp.summary || '')}</p>
                        </div>
                        <div class="pt-2 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                            <span class="text-[10px] font-mono text-stone-500 truncate">${this.escapeHTML(comp.domain || '')}</span>
                            <div class="flex items-center gap-1.5 shrink-0">
                                ${isCoord ? `
                                    <button type="button" onclick="ui.modalEditRealCompanyLogo('${this.escapeAttr(comp.id)}')" class="min-h-[44px] px-2.5 py-1.5 bg-stone-100 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors" title="Subir o cambiar logotipo de esta empresa">
                                        🖼️ Logo
                                    </button>
                                ` : ''}
                                ${safeWeb ? `
                                    <a href="${safeWeb}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase shrink-0 transition-colors">
                                        🌐 ${lang === 'EN' ? 'Website ↗' : 'Web oficial ↗'}
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </article>`;
                }).join('')}
            </div>

            ${this.renderStartupsNavarrasView(lang)}
        </section>`;
    },

    renderStartupsNavarrasView(lang) {
        const allStartups = this.getPublicStartupsList();

        return `
        <div id="who-startups-navarras" class="border-t-4 border-double border-[#111111] pt-6 space-y-5" aria-label="Startups Navarras">
            <div class="border-b-2 border-[#111111] pb-3 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                    <span class="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'REGIONAL ECOSYSTEM // NAVARRA' : 'ECOSISTEMA DE INNOVACIÓN // NAVARRA'}</span>
                    <h3 class="text-2xl sm:text-3xl font-serif font-black text-[#111111] mt-0.5">🚀 ${lang === 'EN' ? 'Navarra Aerospace Startups' : 'Startups Navarras'}</h3>
                    <p class="text-xs sm:text-sm text-stone-700 font-serif mt-1">${lang === 'EN' ? 'Emerging aerospace ventures in the Navarra ecosystem: corporate identity, flight telemetry, and official dispatches.' : 'Empresas aeroespaciales emergentes del ecosistema navarro: identidad corporativa, ensayos técnicos y comunicados oficiales.'}</p>
                </div>
                <span class="text-xs font-mono font-bold px-3 py-1.5 bg-[#EFECE4] border border-stone-400 text-[#111111] shrink-0">${allStartups.length} ${lang === 'EN' ? 'companies' : 'empresas'}</span>
            </div>

            ${allStartups.length === 0 ? `
                <div class="bg-white border border-stone-300 p-8 text-center">
                    <p class="text-sm font-serif text-stone-700">${lang === 'EN' ? 'Navarra startups will appear here once registered.' : 'Todavía no hay startups navarras registradas en el ecosistema.'}</p>
                </div>
            ` : `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${allStartups.map(st => {
                        const mono = (st.name || 'ST').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'ST';
                        return `
                        <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-3 hover:border-[#111111] transition-colors">
                            <div class="space-y-2.5">
                                <div class="flex items-start gap-3">
                                    <div class="w-12 h-12 shrink-0 bg-[#EFECE4] border border-stone-300 flex items-center justify-center overflow-hidden">
                                        ${st.logo ? `
                                            <img src="${this.escapeAttr(st.logo)}" alt="${this.escapeAttr(st.name)}" loading="lazy"
                                                onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');"
                                                class="w-full h-full object-cover">
                                            <span class="hidden w-full h-full flex items-center justify-center font-serif font-black text-sm bg-[#111111] text-white">${this.escapeHTML(mono)}</span>
                                        ` : `
                                            <span class="w-full h-full flex items-center justify-center font-serif font-black text-sm bg-[#111111] text-white">${this.escapeHTML(mono)}</span>
                                        `}
                                    </div>
                                    <div class="min-w-0 flex-1">
                                        <div class="flex items-center justify-between gap-1.5 flex-wrap">
                                            <span class="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 bg-[#111111] text-white">NAVARRA</span>
                                            ${st.publishedPrCount > 0 ? `<span class="text-[10px] font-mono font-bold text-[#8B0000]">📰 ${st.publishedPrCount} Prensa</span>` : ''}
                                        </div>
                                        <h4 class="text-base font-serif font-black text-[#111111] leading-snug mt-1 break-words">${this.escapeHTML(st.name)}</h4>
                                    </div>
                                </div>
                                ${st.slogan ? `<p class="text-xs text-stone-700 font-serif italic border-l-2 border-[#8B0000] pl-2.5 leading-relaxed">«${this.escapeHTML(st.slogan)}»</p>` : `<p class="text-xs text-stone-500 font-serif italic">Identidad corporativa en consolidación.</p>`}
                            </div>
                            <div class="pt-2.5 border-t border-stone-200 flex items-center justify-between gap-2 text-[11px] font-mono">
                                ${st.flightCount > 0 ? `
                                    <span class="text-emerald-800 font-bold">🚀 ${st.flightCount} ensayo(s) · Récord: ${Number(st.maxHeight).toFixed(1)} m</span>
                                    <span class="px-2 py-0.5 bg-[#EFECE4] border border-stone-400 font-black text-[#111111]">E: ${Number(st.bestE).toFixed(2)}</span>
                                ` : `
                                    <span class="text-stone-600">⚙️ Prototipo en fase de diseño e I+D</span>
                                `}
                            </div>
                        </article>`;
                    }).join('')}
                </div>
            `}
        </div>`;
    },

    renderFrontPageSectionShowcases(historyArticles, inventionArticles, lang) {
        const renderMiniBand = (list, tabKey, badgeTitle, ctaLabel) => {
            if (!list || list.length === 0) return '';
            const lead = list[0];
            const rest = list.slice(1, 3);
            const leadTitle = this.getLocalizedNewsField(lead, 'title');
            const leadSub = this.getLocalizedNewsField(lead, 'subtitle');
            const leadImg = lead.imageUrl ? this.getNewsImageSrc(lead.imageUrl) : '';
            return `
            <div class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-3">
                <div class="space-y-3">
                    <div class="flex items-center justify-between gap-2 border-b-2 border-[#111111] pb-1.5">
                        <span class="font-serif font-black text-base text-[#111111] uppercase">${badgeTitle}</span>
                        <button type="button" onclick="ui.setNewsSectionTab('${tabKey}')" class="min-h-[44px] px-2.5 py-1 text-[11px] font-mono font-bold text-[#8B0000] hover:underline uppercase">${ctaLabel} ➔</button>
                    </div>
                    ${leadImg ? `
                        <div class="aspect-video w-full bg-stone-200 border border-stone-300 overflow-hidden">
                            <img src="${this.escapeAttr(leadImg)}" alt="${this.escapeAttr(leadTitle)}" class="w-full h-full object-cover cursor-pointer" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(lead.id)}')">
                        </div>
                    ` : ''}
                    <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(lead.id)}')" class="text-left w-full text-base font-serif font-black text-[#111111] hover:text-[#8B0000] leading-snug">
                        ${this.escapeHTML(leadTitle)}
                    </button>
                    ${leadSub ? `<p class="text-xs text-stone-700 font-serif line-clamp-2">${this.escapeHTML(leadSub)}</p>` : ''}
                    ${rest.length > 0 ? `
                        <div class="border-t border-stone-200 pt-2 space-y-1.5">
                            ${rest.map(r => `
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(r.id)}')" class="block text-left w-full text-xs font-serif font-bold text-stone-800 hover:text-[#8B0000] leading-snug">
                                    ▪ ${this.escapeHTML(this.getLocalizedNewsField(r, 'title'))}
                                </button>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                <button type="button" onclick="ui.setNewsSectionTab('${tabKey}')" class="min-h-[44px] w-full py-2 bg-[#EFECE4] border border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-xs font-mono font-bold uppercase transition-colors">
                    ${ctaLabel} (${list.length}) ➔
                </button>
            </div>`;
        };

        const realPreview = (typeof this.getWhoIsWhoRealPresets === 'function' ? this.getWhoIsWhoRealPresets() : []).slice(0, 4);
        const navarraPreview = this.getPublicStartupsList().slice(0, 4);

        return `
        <section class="border-t-4 border-double border-[#111111] pt-6 space-y-6" aria-label="Secciones del Periódico">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                ${renderMiniBand(historyArticles, 'historia', lang === 'EN' ? '🏛️ A Bit of History' : '🏛️ Un poco de Historia', lang === 'EN' ? 'Explore History' : 'Ver Historia')}
                ${renderMiniBand(inventionArticles, 'inventos', lang === 'EN' ? '🏠 From Space to Your Home' : '🏠 Del Espacio a tu Casa', lang === 'EN' ? 'Explore Spin-Offs' : 'Ver Inventos')}
            </div>

            <div class="bg-white border border-stone-300 p-4 sm:p-5 space-y-4">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-[#111111] pb-2">
                    <h3 class="font-serif font-black text-lg text-[#111111] uppercase">
                        🌍 ${lang === 'EN' ? 'Who is Who: Global Leaders & Navarra Startups' : 'Quién es quién: Líderes Globales y Startups Navarras'}
                    </h3>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="ui.setNewsSectionTab('quien')" class="min-h-[44px] px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">🌍 Quién es quién ➔</button>
                        <button type="button" onclick="ui.openStartupsNavarrasSection()" class="min-h-[44px] px-3 py-1.5 bg-[#8B0000] text-white hover:bg-[#111111] text-xs font-mono font-bold uppercase transition-colors">🚀 Startups Navarras ➔</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div class="space-y-2.5">
                        <span class="text-[11px] font-mono font-black uppercase tracking-wider text-stone-600 block">${lang === 'EN' ? 'REAL AEROSPACE COMPANIES (OFFICIAL WEBSITES)' : 'EMPRESAS Y AGENCIAS REALES'}</span>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${realPreview.map(comp => {
                                const safeWeb = (comp.website && /^https?:\/\//i.test(comp.website)) ? this.escapeAttr(comp.website) : '#';
                                return `
                                <a href="${safeWeb}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] p-2.5 border border-stone-300 bg-[#FAF8F5] hover:border-[#111111] flex items-center gap-2.5 transition-colors">
                                    ${this.renderBrandLogoBadge(comp, true)}
                                    <div class="min-w-0">
                                        <strong class="block text-xs font-serif font-black text-[#111111] truncate">${this.escapeHTML(comp.name)}</strong>
                                        <span class="block text-[10px] font-mono text-[#8B0000] truncate">${this.escapeHTML(comp.country)} · Web ↗</span>
                                    </div>
                                </a>`;
                            }).join('')}
                        </div>
                    </div>
                    <div class="space-y-2.5">
                        <span class="text-[11px] font-mono font-black uppercase tracking-wider text-stone-600 block">${lang === 'EN' ? 'NAVARRA STARTUPS' : 'APARTADO STARTUPS NAVARRAS'}</span>
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            ${navarraPreview.length === 0 ? `<p class="text-xs text-stone-600 font-serif italic">Las startups navarras aparecerán aquí al iniciar el curso.</p>` : navarraPreview.map(st => {
                                const mono = (st.name || 'ST').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'ST';
                                return `
                                <button type="button" onclick="ui.openStartupsNavarrasSection()" class="min-h-[44px] text-left p-2.5 border border-stone-300 bg-[#FAF8F5] hover:border-[#111111] flex items-center gap-2.5 transition-colors">
                                    <div class="w-9 h-9 shrink-0 bg-[#111111] text-white flex items-center justify-center overflow-hidden font-serif font-black text-xs">
                                        ${st.logo ? `<img src="${this.escapeAttr(st.logo)}" alt="${this.escapeAttr(st.name)}" onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');" class="w-full h-full object-cover"><span class="hidden">${this.escapeHTML(mono)}</span>` : this.escapeHTML(mono)}
                                    </div>
                                    <div class="min-w-0">
                                        <strong class="block text-xs font-serif font-black text-[#111111] truncate">${this.escapeHTML(st.name)}</strong>
                                        <span class="block text-[10px] font-mono text-stone-600 truncate">Navarra${st.flightCount > 0 ? ` · E: ${Number(st.bestE).toFixed(2)}` : ''}</span>
                                    </div>
                                </button>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </section>`;
    },

    viewNewsBoard(el) {
        if (!el || !state.user) return;
        const isCoord = this.isNewsCoordinator();
        if (this.printStudioActive && isCoord && typeof this.renderPrintEditionStudio === 'function') {
            return this.renderPrintEditionStudio(el);
        }
        const canModeratePR = this.canModeratePressReleases();
        const lang = this.getNewsLang();
        const classFilter = this.newsClassFilter || 'ALL';
        const phaseFilter = this.newsPhaseFilter || 'ALL';
        const curPhase = typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I';

        // 1. Artículos del Periódico (state.data.news con tombstones unificados)
        const deletedNewsIds = new Set([
            ...(state.data?.deletedNewsIds || []).map(String),
            ...(state.data?.deletedOfficialNewsIds || []).map(String)
        ]);
        const rawNews = Array.isArray(state.data?.news) && state.data.news.length > 0
            ? state.data.news
            : (state.data?.officialNews || []);
        const seenNewsIds = new Set();
        const officialNews = state.resolveFeaturedNews(
            rawNews
                .filter(n => {
                    if (!n || !n.id) return false;
                    const nid = String(n.id);
                    if (deletedNewsIds.has(nid) || seenNewsIds.has(nid)) return false;
                    seenNewsIds.add(nid);
                    return true;
                })
                .map(n => state.normalizeNewsItem(n))
                .filter(Boolean)
        ).map(n => ({ ...n, isOfficial: true }));

        // 2. Notas de Prensa de Startups (DOC_15): separar PENDING_REVIEW (solo LEN/COORD) y PUBLISHED (públicas intercaladas)
        const pendingReleases = [];
        const publishedReleases = [];
        const companies = state.data?.companies || {};
        const seenPrIds = new Set();

        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (!co || !co.pressReleases) return;
            Object.keys(co.pressReleases).forEach(pk => {
                const pr = co.pressReleases[pk];
                if (!pr || !pr.driveUrl || pr.status === 'RETURNED') return;
                const prId = pr.id || `PR-${cid}-${pk}`;
                seenPrIds.add(prId);
                seenPrIds.add(`PR-${cid}-${pk}`);
                const normalizedPr = {
                    id: prId,
                    coId: cid,
                    companyName: co.name,
                    classGroup: co.classGroup || 'A',
                    phase: pk,
                    status: pr.status || 'PUBLISHED',
                    title: pr.title || `Nota de Prensa Fase ${pk} (${co.name})`,
                    driveUrl: pr.driveUrl,
                    nanoBananaImage: pr.nanoBananaImage || null,
                    editorialNote: pr.editorialNote || null,
                    publishedAt: pr.publishedAt || 0,
                    publishedDate: pr.publishedDate || '--',
                    isOfficial: false
                };
                if (normalizedPr.status === 'PENDING_REVIEW') {
                    pendingReleases.push(normalizedPr);
                } else if (normalizedPr.status === 'PUBLISHED') {
                    publishedReleases.push(normalizedPr);
                }
            });
        });

        if (Array.isArray(state.data?.pressReleases)) {
            state.data.pressReleases.forEach(pr => {
                if (!pr || pr.status === 'RETURNED' || seenPrIds.has(pr.id) || seenPrIds.has(`PR-${pr.coId}-${pr.phase}`)) return;
                const item = { ...pr, isOfficial: false };
                if (item.status === 'PENDING_REVIEW') pendingReleases.push(item);
                else if (item.status === 'PUBLISHED') publishedReleases.push(item);
            });
        }

        const matchesFilters = (r) => {
            const okClass = classFilter === 'ALL' || !r.classGroup || r.classGroup === 'ALL' || String(r.classGroup).toUpperCase() === classFilter.toUpperCase();
            const okPhase = phaseFilter === 'ALL' || !r.phase || r.phase === 'ALL' || String(r.phase) === String(phaseFilter);
            return okClass && okPhase;
        };

        const filteredOfficial = officialNews.filter(matchesFilters);
        const filteredReleases = publishedReleases.filter(matchesFilters);
        const filteredPending = pendingReleases.filter(matchesFilters);

        const actualidadArticles = filteredOfficial.filter(n => (n.section || 'actualidad') === 'actualidad');
        const historyArticles = officialNews.filter(n => n.section === 'historia');
        const inventionArticles = officialNews.filter(n => n.section === 'inventos');

        // Portada Principal (1) + Debajo de la portada (2-3) + Hemeroteca (35%)
        const coverArticle = filteredOfficial.find(n => n.placement === 'front' || (n.featured && (n.section || 'actualidad') === 'actualidad')) || actualidadArticles[0] || null;
        const subCoverArticles = actualidadArticles
            .filter(n => (!coverArticle || String(n.id) !== String(coverArticle.id)) && n.placement === 'sub')
            .sort((a, b) => (Number(a.subOrder) || 99) - (Number(b.subOrder) || 99))
            .slice(0, 3);
        const subCoverIds = new Set(subCoverArticles.map(n => String(n.id)));
        const archiveItems = [
            ...actualidadArticles.filter(n => (!coverArticle || String(n.id) !== String(coverArticle.id)) && !subCoverIds.has(String(n.id))),
            ...filteredReleases
        ].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

        const activeSectionTab = ['portada', 'actualidad', 'historia', 'inventos', 'quien', 'hemeroteca'].includes(this.newsSectionTab)
            ? this.newsSectionTab
            : (this.newsSectionTab === 'startups' ? 'quien' : 'portada');

        const currentCo = (!state.user.admin && state.user.coId) ? (companies[state.user.coId] || null) : null;
        const contestShowcaseHtml = (phaseFilter === 'ALL' || phaseFilter === 'V') && typeof this.renderContestNewsShowcase === 'function'
            ? this.renderContestNewsShowcase(currentCo)
            : '';

        const availableClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const editionDateStr = new Date().toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', {
            weekday: 'long', day: '2-digit', month: 'short', year: 'numeric'
        }).toUpperCase();
        const editionNum = String(officialNews.length + publishedReleases.length + 1).padStart(3, '0');

        // VISOR DE ARTÍCULO A PANTALLA AMPLIA (Estilo The Washington Post)
        if (this.activeFullArticleReader) {
            const rd = this.activeFullArticleReader;
            const rCat = this.getLocalizedNewsField(rd, 'category') || 'ACTUALIDAD AEROESPACIAL';
            const rTitle = this.getLocalizedNewsField(rd, 'title');
            const rSub = this.getLocalizedNewsField(rd, 'subtitle');
            const rBody = this.getLocalizedNewsField(rd, 'body');
            const rImpact = this.getLocalizedNewsField(rd, 'marsketImpact');
            const rDebate = this.getLocalizedNewsField(rd, 'debateQuestion');
            const rImgSrc = this.getNewsImageSrc(rd.imageUrl || rd.rawImageUrl);
            const safeSrcUrl = (rd.sourceUrl && /^https?:\/\//i.test(rd.sourceUrl)) ? this.escapeAttr(rd.sourceUrl) : '';

            const readerWrapper = document.createElement('div');
            readerWrapper.className = 'bg-[#FAF8F5] text-[#111111] border border-stone-300 shadow-2xl p-4 sm:p-8';
            readerWrapper.innerHTML = `
                <div class="max-w-3xl mx-auto space-y-5">
                    <div class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#111111] pb-3">
                        <button type="button" onclick="ui.closeFullArticleReader()" class="min-h-[44px] px-4 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                            ⬅ ${lang === 'EN' ? 'Back to Newspaper' : 'Volver al Periódico'}
                        </button>
                        <div class="flex items-center gap-2 flex-wrap">
                            <div class="flex items-center border border-[#111111] bg-white p-0.5" role="group" aria-label="Idioma del artículo">
                                <button type="button" onclick="ui.setNewsLang('ES')" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-black uppercase ${lang === 'ES' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-stone-100'}">🇪🇸 ES</button>
                                <button type="button" onclick="ui.setNewsLang('EN')" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-black uppercase ${lang === 'EN' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-stone-100'}">🇬🇧 EN</button>
                            </div>
                            ${(isCoord && rd.isWire && !rd.loading) ? `
                                <button type="button" onclick="ui.publishFullReaderArticleToBoard()" class="min-h-[44px] px-4 py-2 bg-[#8B0000] text-white hover:bg-[#111111] text-xs font-mono font-bold uppercase transition-colors">
                                    📌 Fijar en Portada
                                </button>
                            ` : ''}
                        </div>
                    </div>

                    <div class="text-center border-b border-stone-300 pb-2">
                        <span class="font-serif font-black text-xl sm:text-2xl tracking-tight text-[#111111] uppercase">ORBITAL REPORT</span>
                        <span class="block text-[10px] font-mono uppercase tracking-[0.2em] text-stone-600">Edición MARS-KET</span>
                    </div>

                    <article class="space-y-5">
                        <div class="space-y-2">
                            <span class="text-xs font-mono font-black uppercase tracking-widest text-[#8B0000]">${this.escapeHTML(rCat)}</span>
                            <h1 class="text-2xl sm:text-4xl font-serif font-black text-[#111111] leading-tight">${this.escapeHTML(rTitle)}</h1>
                            ${rSub ? `<p class="text-base sm:text-lg font-serif italic text-stone-700 leading-relaxed">${this.escapeHTML(rSub)}</p>` : ''}
                            <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600 pt-1">
                                <span>${lang === 'EN' ? 'By' : 'Por'} <strong class="text-[#111111]">${this.escapeHTML(rd.author || rd.sourceName || 'Redacción')}</strong></span>
                                <span>•</span>
                                <span>${this.escapeHTML(rd.publishedDate || '')}</span>
                                <span>•</span>
                                <span>${this.escapeHTML(rd.sourceName || 'ORBITAL REPORT')}</span>
                            </div>
                        </div>

                        <figure class="space-y-1.5">
                            <div class="aspect-video w-full bg-stone-200 border border-stone-300 overflow-hidden">
                                <img src="${this.escapeAttr(rImgSrc)}" alt="${this.escapeAttr(rTitle)}" class="w-full h-full object-cover">
                            </div>
                            <figcaption class="text-[11px] font-mono text-stone-600 italic">
                                ${this.escapeHTML(rd.sourceName || 'Archivo Orbital Report')} // ${lang === 'EN' ? 'MARS-KET Press Edition' : 'Edición de Prensa MARS-KET'}
                            </figcaption>
                        </figure>

                        ${rd.loading ? `
                            <div class="p-6 bg-white border border-stone-300 text-center space-y-2">
                                <p class="text-sm font-serif font-bold text-[#111111]">⏳ ${lang === 'EN' ? 'Extracting full article from source...' : 'Extrayendo y traduciendo el artículo completo en servidor...'}</p>
                                <p class="text-xs font-mono text-stone-500">${this.escapeHTML(rd.sourceName || '')}</p>
                            </div>
                        ` : `
                            <div class="pt-2">
                                ${this.renderEditorialParagraphs(rBody, true)}
                            </div>
                        `}

                        ${(rImpact || rDebate) ? `
                            <div class="p-5 bg-[#EFECE4] border-y-2 border-[#111111] space-y-3 my-4">
                                <h4 class="font-mono font-black text-xs uppercase tracking-widest text-[#8B0000]">
                                    🧭 ${lang === 'EN' ? 'MISSION LOG // BOARDROOM DEBATE' : 'BITÁCORA DE MISIÓN // DEBATE PARA EL CONSEJO'}
                                </h4>
                                ${rImpact ? `<p class="text-sm font-serif text-[#111111] leading-relaxed"><strong>${lang === 'EN' ? 'Impact on your startup:' : 'Impacto en tu startup:'}</strong> ${this.escapeHTML(rImpact)}</p>` : ''}
                                ${rDebate ? `<p class="text-sm font-serif italic text-stone-800 leading-relaxed"><strong class="not-italic">${lang === 'EN' ? 'Boardroom Question:' : 'Pregunta para el Consejo:'}</strong> ${this.escapeHTML(rDebate)}</p>` : ''}
                            </div>
                        ` : ''}

                        <div class="pt-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3">
                            <button type="button" onclick="ui.closeFullArticleReader()" class="min-h-[44px] px-4 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                                ⬅ ${lang === 'EN' ? 'Back to Newspaper' : 'Volver al Periódico'}
                            </button>
                            ${safeSrcUrl ? `
                                <a href="${safeSrcUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-4 py-2 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors">
                                    ${lang === 'EN' ? 'Original Publication ↗' : 'Publicación Original ↗'}
                                </a>
                            ` : ''}
                        </div>
                    </article>
                </div>
            `;
            el.appendChild(readerWrapper);
            return;
        }

        const renderCoverHtml = (art) => {
            if (!art) {
                return `
                <div class="bg-white border border-stone-300 p-10 text-center">
                    <span class="text-3xl block mb-2">📰</span>
                    <h3 class="text-lg font-serif font-bold text-[#111111] uppercase mb-1">${lang === 'EN' ? 'No Articles Match This Filter' : 'Sin Artículos en este Filtro'}</h3>
                    <p class="text-xs text-stone-600 font-sans">${lang === 'EN' ? 'Adjust class or phase filters to view Orbital Report dispatches.' : 'Cambia el filtro de clase o fase para leer la edición completa.'}</p>
                </div>`;
            }
            const cat = this.getLocalizedNewsField(art, 'category') || 'ACTUALIDAD';
            const title = this.getLocalizedNewsField(art, 'title');
            const subtitle = this.getLocalizedNewsField(art, 'subtitle');
            const body = this.getLocalizedNewsField(art, 'body');
            const impact = this.getLocalizedNewsField(art, 'marsketImpact');
            const debate = this.getLocalizedNewsField(art, 'debateQuestion');
            const imgSrc = this.getNewsImageSrc(art.imageUrl);
            const safeSourceUrl = (art.sourceUrl && /^https?:\/\//i.test(art.sourceUrl)) ? this.escapeAttr(art.sourceUrl) : '';
            const debateActionTarget = state.user?.admin ? '' : (this.getEffectiveRole() === 'CEO' || this.getEffectiveRole() === 'AUXILIAR' ? "ui.navigate('resolutions')" : "ui.navigate('role_deliverables')");

            return `
            <article class="space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 pb-2">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B0000]">${this.escapeHTML(cat)}</span>
                        ${art.phase && art.phase !== 'ALL' ? `<span class="px-2 py-0.5 text-[10px] font-mono font-bold bg-stone-200 text-[#111111] uppercase">FASE ${this.escapeHTML(art.phase)}</span>` : ''}
                        ${art.classGroup && art.classGroup !== 'ALL' ? `<span class="px-2 py-0.5 text-[10px] font-mono bg-stone-200 text-[#111111] uppercase">CLASE ${this.escapeHTML(art.classGroup)}</span>` : ''}
                    </div>
                    <span class="text-xs font-mono text-stone-600">${this.escapeHTML(art.publishedDate || '--')} • ${this.escapeHTML(art.sourceName || 'AEE')}</span>
                </div>

                <h3 class="text-2xl sm:text-4xl font-serif font-black text-[#111111] leading-[1.12] tracking-tight">${this.escapeHTML(title)}</h3>

                ${subtitle ? `
                    <p class="text-base sm:text-lg text-stone-700 italic font-serif leading-relaxed">${this.escapeHTML(subtitle)}</p>
                ` : ''}

                <div class="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-600 pb-1">
                    <span>${lang === 'EN' ? 'By' : 'Por'} <strong class="text-[#111111]">${this.escapeHTML(art.author || 'Redacción AEE')}</strong></span>
                    <span>•</span>
                    <span>${lang === 'EN' ? '3 min read' : 'Lectura: 3 min'}</span>
                </div>

                <figure class="space-y-1.5">
                    <div class="relative aspect-video w-full bg-stone-200 border border-stone-300 overflow-hidden group">
                        <img src="${this.escapeAttr(imgSrc)}" alt="${this.escapeAttr(title)}" data-img-src="${this.escapeAttr(imgSrc)}" data-img-title="${this.escapeAttr(title)}" onclick="ui.modalViewNewsImage(this.dataset.imgSrc, this.dataset.imgTitle)" class="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-[1.01]">
                        <button type="button" data-img-src="${this.escapeAttr(imgSrc)}" data-img-title="${this.escapeAttr(title)}" onclick="ui.modalViewNewsImage(this.dataset.imgSrc, this.dataset.imgTitle)" class="min-h-[44px] min-w-[44px] flex items-center justify-center absolute top-2 right-2 bg-white/90 hover:bg-[#111111] hover:text-white text-[#111111] border border-stone-400 text-sm" title="Ampliar imagen">🔍</button>
                    </div>
                    <figcaption class="text-[11px] font-mono text-stone-600 italic">
                        ${this.escapeHTML(art.sourceName || 'Archivo Orbital Report')} // ${lang === 'EN' ? 'Lead Story Photography' : 'Fotografía de Portada'}
                    </figcaption>
                </figure>

                <div class="pt-1">
                    ${this.renderEditorialParagraphs(body, true)}
                </div>

                ${(impact || debate) ? `
                    <div class="p-4 sm:p-5 bg-[#EFECE4] border-y-2 border-[#111111] space-y-3">
                        <div class="flex items-center justify-between gap-2 flex-wrap border-b border-stone-300 pb-2">
                            <h4 class="font-mono font-black text-xs uppercase text-[#8B0000] tracking-wider">
                                🧭 ${lang === 'EN' ? 'MISSION LOG // BOARDROOM DEBATE' : 'BITÁCORA DE MISIÓN // DEBATE PARA EL CONSEJO'}
                            </h4>
                            ${debateActionTarget ? `
                                <button type="button" onclick="${debateActionTarget}" class="min-h-[44px] px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[11px] font-mono font-bold uppercase transition-colors">
                                    ⚖️ ${lang === 'EN' ? 'Take to Board / Deliverables ➔' : 'Llevar a Asamblea / Entregables ➔'}
                                </button>
                            ` : ''}
                        </div>
                        ${impact ? `
                            <p class="text-sm text-[#111111] font-serif leading-relaxed">
                                <strong class="font-sans text-xs uppercase tracking-wide text-[#8B0000]">${lang === 'EN' ? 'Startup Impact:' : 'Impacto en tu startup:'}</strong> ${this.escapeHTML(impact)}
                            </p>
                        ` : ''}
                        ${debate ? `
                            <p class="text-sm text-stone-800 italic font-serif leading-relaxed">
                                <strong class="not-italic font-sans text-xs uppercase tracking-wide text-[#111111]">${lang === 'EN' ? 'Boardroom Question:' : 'Pregunta para el Consejo:'}</strong> ${this.escapeHTML(debate)}
                            </p>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="pt-3 border-t border-stone-300 flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2 flex-wrap">
                        <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3.5 py-1.5 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors">
                            📖 ${lang === 'EN' ? 'Full Screen Reader' : 'Modo Lectura Amplia'}
                        </button>
                        ${safeSourceUrl ? `<a href="${safeSourceUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-stone-400 hover:border-[#111111] text-stone-800 text-xs font-mono font-bold uppercase">${lang === 'EN' ? 'Source ↗' : 'Fuente ↗'}</a>` : ''}
                    </div>
                    ${isCoord ? `
                        <div class="flex items-center gap-2 flex-wrap">
                            <button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white px-3 py-1.5 text-xs font-mono font-bold uppercase">✏️ Editar</button>
                            <button type="button" onclick="ui.demoteNewsToArchive('${this.escapeAttr(art.id)}')" class="min-h-[44px] bg-white border border-stone-400 text-[#111111] hover:bg-stone-200 px-3 py-1.5 text-xs font-mono font-bold uppercase" title="Bajar a Hemeroteca sin borrar">📥 Hemeroteca</button>
                            <button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3 py-1.5 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-xs font-mono font-bold uppercase" title="Eliminar del periódico">✕ Quitar</button>
                        </div>
                    ` : ''}
                </div>
            </article>`;
        };

        const wrapper = document.createElement('div');
        wrapper.className = 'bg-[#FAF8F5] text-[#111111] border border-stone-300 shadow-2xl p-4 sm:p-7 space-y-6';
        wrapper.innerHTML = `
            <!-- MASTHEAD ESTILO THE WASHINGTON POST: ORBITAL REPORT -->
            <header class="space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-stone-600 uppercase border-b border-stone-300 pb-2">
                    <span>${this.escapeHTML(editionDateStr)}</span>
                    <span>EDICIÓN N.º ${editionNum} • MIRAVALLES-EL REDÍN</span>
                    <span class="font-bold text-[#8B0000]">FASE ACTIVA: FASE ${this.escapeHTML(curPhase)}</span>
                </div>

                <div class="text-center py-2">
                    <h2 class="text-4xl sm:text-6xl font-serif font-black text-[#111111] tracking-tight leading-none">
                        ORBITAL REPORT
                    </h2>
                    <p class="text-xs sm:text-sm font-serif italic text-stone-700 mt-1.5">
                        Edición MARS-KET • ${lang === 'EN' ? '“Science Launches in Daylight”' : '«La Ciencia Despega a Plena Luz»'}
                    </p>
                </div>

                <div class="border-y-2 border-[#111111] py-2.5 flex flex-col lg:flex-row items-center justify-between gap-3">
                    <div class="flex items-center gap-2 flex-wrap justify-center">
                        <div class="flex items-center border border-[#111111] bg-white p-0.5" role="group" aria-label="Idioma del periódico">
                            <button type="button" onclick="ui.setNewsLang('ES')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-black uppercase transition-colors ${lang === 'ES' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-stone-100'}">🇪🇸 Español</button>
                            <button type="button" onclick="ui.setNewsLang('EN')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-black uppercase transition-colors ${lang === 'EN' ? 'bg-[#111111] text-white' : 'text-[#111111] hover:bg-stone-100'}">🇬🇧 English</button>
                        </div>
                        ${isCoord ? `
                            <button type="button" onclick="ui.modalPublishOfficialNews()" class="min-h-[44px] bg-[#8B0000] text-white px-4 py-2 font-mono font-bold uppercase text-xs hover:bg-[#111111] transition-colors">
                                ✍️ + Redacción / Importar
                            </button>
                            <button type="button" onclick="ui.openPrintEditionStudio()" class="min-h-[44px] bg-[#111111] text-white px-4 py-2 font-mono font-bold uppercase text-xs hover:bg-[#8B0000] transition-colors">
                                🖨️ Edición Impresa A3
                            </button>
                        ` : ''}
                    </div>

                    <div class="flex flex-wrap items-center gap-2 justify-center">
                        <label for="news-class-select" class="sr-only">Clase</label>
                        <select id="news-class-select" onchange="ui.setNewsClassFilter(this.value)" class="min-h-[44px] bg-white border border-stone-400 px-2.5 py-1.5 text-xs text-[#111111] font-mono font-bold uppercase">
                            <option value="ALL" ${classFilter === 'ALL' ? 'selected' : ''}>Todas las Clases</option>
                            ${availableClasses.map(c => `<option value="${c}" ${classFilter === c ? 'selected' : ''}>Clase ${c}</option>`).join('')}
                        </select>
                        <label for="news-phase-select" class="sr-only">Fase</label>
                        <select id="news-phase-select" onchange="ui.setNewsPhaseFilter(this.value)" class="min-h-[44px] bg-white border border-stone-400 px-2.5 py-1.5 text-xs text-[#111111] font-mono font-bold uppercase">
                            <option value="ALL" ${phaseFilter === 'ALL' ? 'selected' : ''}>Todas las Fases</option>
                            ${['I', 'II', 'III', 'IV', 'V'].map(p => `<option value="${p}" ${phaseFilter === p ? 'selected' : ''}>Fase ${p}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- BARRA DE SECCIONES EDITORIALES ESTILO DIARIO REAL -->
                <nav aria-label="Secciones de Orbital Report" role="tablist" class="border-b-2 border-[#111111] pb-2.5 flex items-center gap-1.5 overflow-x-auto">
                    ${[
                        { id: 'portada', label: lang === 'EN' ? '🗞️ Front Page' : '🗞️ Portada' },
                        { id: 'actualidad', label: lang === 'EN' ? `📡 News (${actualidadArticles.length})` : `📡 Actualidad (${actualidadArticles.length})` },
                        { id: 'historia', label: lang === 'EN' ? `🏛️ History (${historyArticles.length})` : `🏛️ Un poco de Historia (${historyArticles.length})` },
                        { id: 'inventos', label: lang === 'EN' ? `🏠 Space Spin-Offs (${inventionArticles.length})` : `🏠 Del Espacio a tu Casa (${inventionArticles.length})` },
                        { id: 'quien', label: lang === 'EN' ? '🌍 Who is Who' : '🌍 Quién es quién' },
                        { id: 'hemeroteca', label: lang === 'EN' ? `🗂️ Archive (${archiveItems.length})` : `🗂️ Hemeroteca (${archiveItems.length})` }
                    ].map(tab => `
                        <button type="button" role="tab" aria-selected="${activeSectionTab === tab.id}" onclick="ui.setNewsSectionTab('${tab.id}')" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase whitespace-nowrap shrink-0 border transition-colors ${activeSectionTab === tab.id ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-stone-300 hover:border-[#111111]'}">
                            ${this.escapeHTML(tab.label)}
                        </button>
                    `).join('')}
                </nav>
            </header>

            ${(canModeratePR && filteredPending.length > 0) ? `
                <section class="bg-[#EFECE4] border-l-4 border-l-[#8B0000] border border-stone-300 p-4 space-y-3">
                    <div>
                        <h3 class="font-mono text-xs sm:text-sm font-black text-[#8B0000] uppercase tracking-wider">
                            📥 Bandeja Editorial DOC_15 · Pendientes de Publicación (${filteredPending.length})
                        </h3>
                        <p class="text-xs text-stone-700 font-sans">Notas de Prensa remitidas por los CEOs. Lengua (LEN) o Coordinación deciden su publicación en ORBITAL REPORT.</p>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${filteredPending.map(pr => `
                            <div class="bg-white border border-stone-300 p-3 flex flex-col justify-between gap-2">
                                <div>
                                    <span class="text-[10px] font-mono font-bold text-[#8B0000] uppercase">FASE ${this.escapeHTML(pr.phase)} • CLASE ${this.escapeHTML(pr.classGroup)} • ${this.escapeHTML(pr.publishedDate)}</span>
                                    <h4 class="text-sm font-serif font-bold text-[#111111] uppercase">${this.escapeHTML(pr.companyName || pr.coId)}</h4>
                                    <p class="text-xs text-stone-700 truncate">${this.escapeHTML(pr.title)}</p>
                                </div>
                                <div class="flex flex-wrap items-center gap-2 pt-1">
                                    ${(pr.driveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(pr.driveUrl))) ? `<a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(pr.driveUrl) : encodeURI(pr.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-white border border-stone-400 text-[#111111] text-xs font-mono font-bold uppercase">📄 Abrir Doc ↗</a>` : ''}
                                    <button type="button" onclick="ui.approvePressReleaseForNewspaper('${this.escapeAttr(pr.coId)}', '${this.escapeAttr(pr.phase)}')" class="min-h-[44px] px-3 py-1.5 bg-[#111111] text-white font-mono font-bold text-xs uppercase hover:bg-emerald-700">✅ Publicar</button>
                                    <button type="button" onclick="ui.modalTeacherReturnPressRelease('${this.escapeAttr(pr.coId)}', '${this.escapeAttr(pr.phase)}')" class="min-h-[44px] px-3 py-1.5 bg-white border border-[#8B0000] text-[#8B0000] font-mono font-bold text-xs uppercase hover:bg-[#8B0000] hover:text-white">↩ Subsanar</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            ` : ''}

            ${contestShowcaseHtml ? `<div class="bg-[#0b1120] text-white p-4 border border-stone-400">${contestShowcaseHtml}</div>` : ''}

            ${activeSectionTab === 'actualidad' ? `
                <div class="space-y-7">
                    ${this.renderNewsSectionArticlesGrid(actualidadArticles, 'actualidad', isCoord, lang)}
                    <div class="bg-white border border-stone-300 p-4 space-y-3">
                        <div class="flex items-center justify-between gap-2 border-b-2 border-[#111111] pb-1.5">
                            <div>
                                <h3 class="font-serif font-black text-base uppercase text-[#111111] tracking-tight">
                                    📡 ${lang === 'EN' ? 'Aerospace Wire (Live)' : 'Actualidad Aeroespacial Internacional (En Vivo)'}
                                </h3>
                                <span class="text-[10px] font-mono text-stone-600 uppercase">Spaceflight News • ${lang === 'EN' ? 'Original EN' : 'Traducción Directa ES'}</span>
                            </div>
                            <button type="button" onclick="ui.fetchSpaceflightWire(true)" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-white border border-stone-400 hover:border-[#111111] text-xs text-[#111111] font-mono font-bold uppercase" title="Actualizar noticias">🔄</button>
                        </div>
                        <div id="orbital-wire-list" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <p class="text-xs font-mono text-stone-600 p-2">🛰️ ${lang === 'EN' ? 'Loading Aerospace Wire...' : 'Cargando y traduciendo noticias reales...'}</p>
                        </div>
                    </div>
                </div>
            ` : activeSectionTab === 'historia' ? `
                ${this.renderNewsSectionArticlesGrid(historyArticles, 'historia', isCoord, lang)}
            ` : activeSectionTab === 'inventos' ? `
                ${this.renderNewsSectionArticlesGrid(inventionArticles, 'inventos', isCoord, lang)}
            ` : activeSectionTab === 'quien' ? `
                ${this.renderWhoIsWhoDirectoryView(lang)}
            ` : activeSectionTab === 'hemeroteca' ? `
                <section class="space-y-4" aria-label="Hemeroteca Completa">
                    <div class="border-b-2 border-[#111111] pb-3 flex items-center justify-between gap-2">
                        <div>
                            <span class="text-[11px] font-mono font-black uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'SECTION // ARCHIVE & DOC_15' : 'SECCIÓN // HEMEROTECA Y COMUNICADOS'}</span>
                            <h3 class="text-2xl sm:text-3xl font-serif font-black text-[#111111] mt-0.5">${lang === 'EN' ? 'Editorial Archive & Startup Press (DOC_15)' : 'Hemeroteca & Notas de Prensa de Startups'}</h3>
                        </div>
                        <span class="text-xs font-mono font-bold text-stone-600">${archiveItems.length}</span>
                    </div>
                    ${archiveItems.length === 0 ? `
                        <div class="bg-white border border-stone-300 p-8 text-center">
                            <p class="text-sm font-serif text-stone-700">${lang === 'EN' ? 'No archived items match this filter.' : 'No hay artículos archivados ni notas de prensa publicadas para este filtro.'}</p>
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${archiveItems.map(item => {
                                if (item.isOfficial) {
                                    const t = this.getLocalizedNewsField(item, 'title');
                                    const c = this.getLocalizedNewsField(item, 'category') || 'AEE';
                                    const artImg = item.imageUrl ? this.getNewsImageSrc(item.imageUrl) : '';
                                    return `
                                    <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-2.5">
                                        <div class="space-y-1.5">
                                            <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                                                <span class="text-[#8B0000] font-bold uppercase truncate">${this.escapeHTML(c)}</span>
                                                <span class="text-stone-500 shrink-0">${this.escapeHTML(item.publishedDate || '--')}</span>
                                            </div>
                                            ${artImg ? `<img src="${this.escapeAttr(artImg)}" alt="${this.escapeAttr(t)}" class="w-full h-32 object-cover border border-stone-300 cursor-pointer" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')">` : ''}
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')" class="text-left w-full text-base font-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug">
                                                ${this.escapeHTML(t)}
                                            </button>
                                        </div>
                                        <div class="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-200">
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-3 py-1 bg-[#111111] text-white hover:bg-[#8B0000] text-[11px] font-mono font-bold uppercase">📖 ${lang === 'EN' ? 'Read Full' : 'Leer Completa'}</button>
                                            ${isCoord ? `<button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(item.id)}')" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold" title="Promover a Portada">⭐</button>` : ''}
                                            ${isCoord ? `<button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(item.id)}')" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-stone-100 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold" title="Editar">✏️</button>` : ''}
                                            ${isCoord ? `<button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(item.id)}')" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-xs font-mono font-bold" title="Eliminar">✕</button>` : ''}
                                        </div>
                                    </article>`;
                                }
                                const hasPrImg = Boolean(item.nanoBananaImage && /^(https?:\/\/|data:image\/)/i.test(item.nanoBananaImage));
                                return `
                                <article class="bg-white border border-stone-300 p-4 space-y-2">
                                    <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                                        <span class="text-[#1E3A8A] font-bold uppercase">DOC_15 • FASE ${this.escapeHTML(item.phase)} • CLASE ${this.escapeHTML(item.classGroup || 'A')}</span>
                                        <span class="text-stone-500 shrink-0">${this.escapeHTML(item.publishedDate || '--')}</span>
                                    </div>
                                    ${hasPrImg ? `<img src="${this.escapeAttr(item.nanoBananaImage)}" alt="${this.escapeAttr(item.companyName || '')}" class="w-full h-32 object-cover border border-stone-300 cursor-pointer" onclick="ui.modalViewNewsImage('${this.escapeAttr(item.nanoBananaImage)}', '${this.escapeAttr(item.title)}')">` : ''}
                                    <h4 class="text-base font-serif font-bold text-[#111111] uppercase leading-snug">${this.escapeHTML(item.companyName || '')}</h4>
                                    <p class="text-xs text-stone-700 font-sans">${this.escapeHTML(item.title || '')}</p>
                                    ${item.editorialNote ? `<p class="text-xs text-stone-700 border-l-2 border-[#8B0000] pl-2 italic">${this.escapeHTML(item.editorialNote)}</p>` : ''}
                                    ${isCoord ? `<button type="button" onclick="ui.modalAttachNanoBananaToPR('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-3 py-1 bg-stone-200 border border-stone-400 text-[#111111] text-xs font-bold uppercase">🖼️ Imagen</button>` : ''}
                                </article>`;
                            }).join('')}
                        </div>
                    `}
                </section>
            ` : `
            <!-- GRID EDITORIAL 65% / 35% CON FILETE DIVISOR -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                <!-- COLUMNA IZQUIERDA (65% -> 8/12 cols): PORTADA PRINCIPAL + DEBAJO DE LA PORTADA -->
                <section class="lg:col-span-8 lg:border-r lg:border-stone-300 lg:pr-7 space-y-6" aria-label="Portada Principal">
                    ${renderCoverHtml(coverArticle)}
                    ${subCoverArticles.length > 0 ? `
                        <div class="border-t-2 border-[#111111] pt-5 space-y-3" aria-label="Debajo de la portada">
                            <div class="flex items-center justify-between gap-2">
                                <span class="font-mono text-[11px] font-black uppercase tracking-widest text-[#8B0000]">🗞️ ${lang === 'EN' ? 'Also on the Front Page' : 'En Portada · Destacados'}</span>
                                ${isCoord ? `<span class="font-mono text-[10px] text-stone-600 uppercase">${subCoverArticles.length}/3 espacios</span>` : ''}
                            </div>
                            <div class="grid grid-cols-1 ${subCoverArticles.length >= 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4">
                                ${subCoverArticles.map(sub => {
                                    const sCat = this.getLocalizedNewsField(sub, 'category') || 'ACTUALIDAD';
                                    const sTitle = this.getLocalizedNewsField(sub, 'title');
                                    const sSub = this.getLocalizedNewsField(sub, 'subtitle') || this.getLocalizedNewsField(sub, 'body');
                                    const sImg = sub.imageUrl ? this.getNewsImageSrc(sub.imageUrl) : '';
                                    return `
                                    <article class="bg-white border border-stone-300 p-3 flex flex-col justify-between gap-2.5">
                                        <div class="space-y-1.5">
                                            ${sImg ? `<img src="${this.escapeAttr(sImg)}" alt="${this.escapeAttr(sTitle)}" class="w-full h-24 object-cover border border-stone-200 cursor-pointer" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(sub.id)}')">` : ''}
                                            <span class="block text-[10px] font-mono font-bold text-[#8B0000] uppercase truncate">${this.escapeHTML(sCat)}</span>
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(sub.id)}')" class="text-left w-full text-sm font-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug line-clamp-3">
                                                ${this.escapeHTML(sTitle)}
                                            </button>
                                            ${sSub ? `<p class="text-xs text-stone-700 font-sans line-clamp-2">${this.escapeHTML(sSub)}</p>` : ''}
                                        </div>
                                        <div class="flex items-center justify-between gap-1.5 pt-2 border-t border-stone-200 flex-wrap">
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(sub.id)}')" class="min-h-[44px] px-2.5 py-1 bg-white border border-stone-400 hover:border-[#111111] text-[#111111] text-[10px] font-mono font-bold uppercase">📖 ${lang === 'EN' ? 'Read' : 'Leer'}</button>
                                            ${isCoord ? `
                                                <div class="flex items-center gap-1">
                                                    <button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(sub.id)}')" class="min-h-[44px] px-2 py-1 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[11px] font-mono font-bold uppercase" title="Subir a Portada Principal">⭐</button>
                                                    <button type="button" onclick="ui.demoteNewsToArchive('${this.escapeAttr(sub.id)}')" class="min-h-[44px] px-2 py-1 bg-white border border-stone-400 text-[#111111] hover:bg-stone-200 text-[11px] font-mono font-bold uppercase" title="Bajar a Hemeroteca">📥</button>
                                                    <button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(sub.id)}')" class="min-h-[44px] px-2 py-1 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-[11px] font-mono font-bold uppercase" title="Eliminar del periódico">✕</button>
                                                </div>
                                            ` : ''}
                                        </div>
                                    </article>`;
                                }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </section>

                <!-- COLUMNA DERECHA (35% -> 4/12 cols): TELETIPO EN VIVO + HEMEROTECA & DOC_15 -->
                <aside class="lg:col-span-4 space-y-6" aria-label="Actualidad Internacional y Hemeroteca">
                    <!-- BLOQUE 1: ACTUALIDAD AEROESPACIAL EN VIVO -->
                    <div class="space-y-3 border-b-2 border-[#111111] pb-5">
                        <div class="flex items-center justify-between gap-2 border-b-2 border-[#111111] pb-1.5">
                            <div>
                                <h3 class="font-serif font-black text-base uppercase text-[#111111] tracking-tight">
                                    📡 ${lang === 'EN' ? 'Aerospace Wire (Live)' : 'Actualidad Aeroespacial'}
                                </h3>
                                <span class="text-[10px] font-mono text-stone-600 uppercase">Spaceflight News • ${lang === 'EN' ? 'Original EN' : 'Traducción Directa ES'}</span>
                            </div>
                            <button type="button" onclick="ui.fetchSpaceflightWire(true)" class="min-h-[44px] min-w-[44px] px-2.5 py-1 bg-white border border-stone-400 hover:border-[#111111] text-xs text-[#111111] font-mono font-bold uppercase" title="Actualizar noticias">🔄</button>
                        </div>
                        <div id="orbital-wire-list" class="space-y-1">
                            <p class="text-xs font-mono text-stone-600 p-2">🛰️ ${lang === 'EN' ? 'Loading Aerospace Wire...' : 'Cargando y traduciendo noticias reales...'}</p>
                        </div>
                    </div>

                    <!-- BLOQUE 2: HEMEROTECA Y COMUNICADOS STARTUPS DOC_15 -->
                    <div class="space-y-3">
                        <div class="flex items-center justify-between border-b-2 border-[#111111] pb-1.5">
                            <h3 class="font-serif font-black text-base uppercase text-[#111111] tracking-tight">
                                🗂️ ${lang === 'EN' ? 'Archive & Startup Press' : 'Hemeroteca & Startups'}
                            </h3>
                            <button type="button" onclick="ui.setNewsSectionTab('hemeroteca')" class="text-xs font-mono font-bold text-[#8B0000] hover:underline">${archiveItems.length} ➔</button>
                        </div>

                        ${archiveItems.length === 0 ? `
                            <p class="text-xs text-stone-600 font-serif italic py-2">
                                ${lang === 'EN'
                                    ? 'Previous editions and approved startup press releases (DOC_15) will appear here.'
                                    : 'Aquí aparecerán las ediciones anteriores y las Notas de Prensa (DOC_15) aprobadas por Lengua y Coordinación.'}
                            </p>
                        ` : `
                            <div class="divide-y divide-stone-300 max-h-[520px] overflow-y-auto pr-1">
                                ${archiveItems.map(item => {
                                    if (item.isOfficial) {
                                        const t = this.getLocalizedNewsField(item, 'title');
                                        const c = this.getLocalizedNewsField(item, 'category') || 'AEE';
                                        const artImg = item.imageUrl ? this.getNewsImageSrc(item.imageUrl) : '';
                                        return `
                                        <article class="py-3 space-y-1.5">
                                            <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                                                <span class="text-[#8B0000] font-bold uppercase truncate">${this.escapeHTML(c)}</span>
                                                <span class="text-stone-500 shrink-0">${this.escapeHTML(item.publishedDate || '--')}</span>
                                            </div>
                                            ${artImg ? `<img src="${this.escapeAttr(artImg)}" alt="${this.escapeAttr(t)}" class="w-full h-24 object-cover border border-stone-300 cursor-pointer" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')">` : ''}
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')" class="text-left w-full text-sm font-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug break-words">
                                                ${this.escapeHTML(t)}
                                            </button>
                                            <div class="flex items-center gap-2 flex-wrap pt-1">
                                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-3 py-1 bg-white border border-stone-400 hover:border-[#111111] text-[#111111] text-[11px] font-mono font-bold uppercase">
                                                    📖 ${lang === 'EN' ? 'Read Full' : 'Leer Completa'}
                                                </button>
                                                ${isCoord ? `<button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-2.5 py-1 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[11px] font-mono font-bold uppercase" title="Promover a Portada">⭐</button>` : ''}
                                                ${isCoord ? `<button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-2.5 py-1 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-[11px] font-mono font-bold uppercase" title="Eliminar de Hemeroteca">✕</button>` : ''}
                                            </div>
                                        </article>`;
                                    } else {
                                        const hasPrImg = Boolean(item.nanoBananaImage && /^(https?:\/\/|data:image\/)/i.test(item.nanoBananaImage));
                                        return `
                                        <article class="py-3 space-y-2">
                                            <div class="flex items-center justify-between gap-2 text-[10px] font-mono">
                                                <span class="text-[#1E3A8A] font-bold uppercase">DOC_15 • FASE ${this.escapeHTML(item.phase)} • CLASE ${this.escapeHTML(item.classGroup || 'A')}</span>
                                                <span class="text-stone-500 shrink-0">${this.escapeHTML(item.publishedDate || '--')}</span>
                                            </div>
                                            ${hasPrImg ? `<img src="${this.escapeAttr(item.nanoBananaImage)}" alt="${this.escapeAttr(item.companyName || '')}" class="w-full h-24 object-cover border border-stone-300 cursor-pointer" onclick="ui.modalViewNewsImage('${this.escapeAttr(item.nanoBananaImage)}', '${this.escapeAttr(item.title)}')">` : ''}
                                            <h4 class="text-sm font-serif font-bold text-[#111111] uppercase leading-snug">${this.escapeHTML(item.companyName || '')}</h4>
                                            <p class="text-xs text-stone-700 font-sans">${this.escapeHTML(item.title || '')}</p>
                                            ${item.editorialNote ? `<p class="text-xs text-stone-700 border-l-2 border-[#8B0000] pl-2 italic">${this.escapeHTML(item.editorialNote)}</p>` : ''}
                                            ${isCoord ? `
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <button type="button" onclick="ui.modalAttachNanoBananaToPR('${this.escapeAttr(item.id)}')" class="min-h-[44px] px-2.5 py-1 bg-stone-200 border border-stone-400 text-[#111111] text-[11px] font-bold uppercase">🖼️</button>
                                                </div>
                                            ` : ''}
                                        </article>`;
                                    }
                                }).join('')}
                            </div>
                        `}
                    </div>
                </aside>
            </div>
            ${this.renderFrontPageSectionShowcases(historyArticles, inventionArticles, lang)}
            `}
        `;
        el.appendChild(wrapper);
        if (document.getElementById('orbital-wire-list')) {
            this.fetchSpaceflightWire(false);
        }
    },

    getCurrentPhaseKey() {
        if (typeof ui.getCurrentPhaseInfo === 'function') {
            return ui.getCurrentPhaseInfo().key;
        }
        const now = Date.now();
        if (now >= new Date('2027-05-19T00:00:00').getTime()) return 'V';
        if (now >= new Date('2027-03-31T00:00:00').getTime()) return 'IV';
        if (now >= new Date('2027-02-15T00:00:00').getTime()) return 'III';
        if (now >= new Date('2026-12-15T00:00:00').getTime()) return 'II';
        return 'I';
    },

    renderActiveContractTacticalBanner(co) {
        if (!co) return '';
        const curPhase = this.getCurrentPhaseKey();
        const signed = co.contracts?.[curPhase];
        const isCEO = state.user && (this.getEffectiveRole(co) === 'CEO' || state.user.admin);
        const isMasterOrAdmin = Boolean(state.user && state.user.admin || co.unlockAllContracts === true);
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[curPhase] : null;
        const isUnlocked = isMasterOrAdmin || (win && Date.now() >= new Date(win.selectionStart).getTime());

        if (!signed && !isUnlocked) {
            return '';
        }

        if (signed && signed.contractId) {
            const isCompleted = signed.status === 'CUMPLIDO';
            const isFailed = signed.status === 'NO_CUMPLIDO';
            const statusBadge = isCompleted
                ? '<span style="background-color: #00ff66 !important; color: #000000 !important; font-weight: 900 !important; box-shadow: 0 0 10px rgba(0,255,102,0.5) !important;" class="text-xs font-mono px-2.5 py-0.5 rounded">✅ CUMPLIDO (+' + signed.reward + ' €v)</span>'
                : (isFailed
                    ? '<span style="background-color: #ff0055 !important; color: #ffffff !important; font-weight: 900 !important; box-shadow: 0 0 10px rgba(255,0,85,0.5) !important;" class="text-xs font-mono px-2.5 py-0.5 rounded">❌ NO CUMPLIDO (-' + signed.penalty + ' €v)</span>'
                    : '<span style="background-color: rgba(99, 102, 241, 0.25) !important; border: 1px solid #818cf8 !important; color: #c7d2fe !important; font-weight: bold !important;" class="text-xs font-mono px-2.5 py-0.5 rounded animate-pulse">⏳ EN CURSO</span>');

            let bannerStyle = 'background-color: rgba(99, 102, 241, 0.08) !important; border: 2px solid #6366f1 !important; box-shadow: 0 0 15px rgba(99, 102, 241, 0.2) !important;';
            if (isCompleted) {
                bannerStyle = 'background-color: rgba(0, 255, 102, 0.08) !important; border: 2px solid #00ff66 !important; box-shadow: 0 0 20px rgba(0, 255, 102, 0.3) !important;';
            } else if (isFailed) {
                bannerStyle = 'background-color: rgba(255, 0, 85, 0.08) !important; border: 2px solid #ff0055 !important; box-shadow: 0 0 20px rgba(255, 0, 85, 0.3) !important;';
            }

            return `
            <div style="${bannerStyle}" class="p-4 mb-6 rounded">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-[10px] font-orbitron font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">🤝 Misión CEO Activa • Fase ${this.escapeHTML(curPhase)}</span>
                            ${statusBadge}
                        </div>
                        <h4 class="font-orbitron font-bold text-white text-xs sm:text-sm uppercase tracking-wide break-words">${this.escapeHTML(signed.company)} — ${this.escapeHTML(signed.title)}</h4>
                        <p class="text-xs text-slate-200 mt-1 leading-relaxed"><strong class="text-mars-cyan uppercase">Requisitos:</strong> ${this.escapeHTML(signed.requirements)}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                        <div class="flex items-center gap-1.5 font-mono text-xs">
                            <span style="background-color: rgba(0, 255, 102, 0.15) !important; border: 1px solid #00ff66 !important; color: #00ff66 !important;" class="px-2 py-1 font-bold rounded">+${signed.reward} €v</span>
                            <span style="background-color: rgba(255, 0, 85, 0.15) !important; border: 1px solid #ff0055 !important; color: #ff0055 !important;" class="px-2 py-1 font-bold rounded">-${signed.penalty} €v</span>
                        </div>
                        <button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] px-3 py-1.5 bg-indigo-900/40 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold text-xs uppercase tracking-wider transition-all">
                            Ver Misión ➔
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
            if (!isCEO) {
                return `
                <div class="bg-slate-900/50 border border-slate-800 px-3 py-2 mb-3 rounded flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
                    <span>🤝 Contratos Fase ${this.escapeHTML(curPhase)}: pendiente de selección por Dirección General (CEO).</span>
                    <button type="button" onclick="ui.navigate('contracts')" class="text-mars-cyan hover:underline font-bold">Ver opciones ➔</button>
                </div>`;
            }
            return `
            <div class="terminal-border bg-slate-900/60 border-slate-800 p-3 sm:p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="flex items-center gap-2.5 min-w-0 flex-1">
                    <span class="text-lg shrink-0">🤝</span>
                    <div class="min-w-0 flex-1">
                        <span class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Contratos Comerciales • Fase ${this.escapeHTML(curPhase)}</span>
                        <p class="text-xs text-slate-300">Startup sin contrato comercial suscrito en esta fase.</p>
                    </div>
                </div>
                <div class="shrink-0 w-full sm:w-auto">
                    <button type="button" onclick="ui.navigate('contracts')" class="shrink-0 w-full sm:w-auto justify-center min-h-[44px] px-4 py-2 bg-mars-cyan text-black hover:bg-white font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap text-center">
                        ✍️ Elegir Contrato de Fase ${this.escapeHTML(curPhase)} ➔
                    </button>
                </div>
            </div>`;
        }
    },

    renderRoleActivePhaseDeliverableBanner(co) {
        if (!co || !state.user) return '';
        const role = state.user.role;
        if (role === 'DOCENTE') return '';

        const curPhase = (typeof this.getCurrentPhaseKey === 'function') ? this.getCurrentPhaseKey() : 'I';
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];

        const targetRole = this.getEffectiveRole(co) || role;
        const isAuxInParity = (role === 'AUXILIAR' && co?.auxRoleDept && targetRole !== 'AUXILIAR');

        const myActiveDeliverables = defs.filter(d => {
            const p = (typeof this.getDeliverablePhase === 'function') ? this.getDeliverablePhase(d.key) : (d.phase || 'I');
            if (p !== curPhase) return false;
            if (targetRole === 'CEO') return true;
            if (targetRole === 'OPERACIONES' || targetRole === 'OPERACIONES_IA') {
                return d.role === 'OPERACIONES' || d.role === 'OPERACIONES_IA';
            }
            return d.role === targetRole;
        });

        if (myActiveDeliverables.length === 0) return '';

        const docs = co.deliverables || {};
        const priorityScore = (d) => {
            const docItem = docs[d.key];
            const st = (typeof docItem === 'object' && docItem) ? docItem.status : (typeof docItem === 'string' && docItem ? 'DELIVERED_TO_TEACHER' : 'PENDING');
            if (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO' || st === 'RETURNED_BY_CEO' || st === 'RETURNED_BY_TEACHER') return 0;
            if (targetRole === 'CEO' && st === 'SUBMITTED_TO_CEO') return 1;
            if (st === 'PENDING') return 2;
            if (st === 'SUBMITTED_TO_CEO') return 3;
            return 4;
        };
        const sortedActiveDeliverables = [...myActiveDeliverables].sort((a, b) => priorityScore(a) - priorityScore(b));

        const renderBannerCard = (d) => {
            const docItem = docs[d.key];
            const rawStatus = (typeof docItem === 'object' && docItem) ? docItem.status : (typeof docItem === 'string' && docItem ? 'DELIVERED_TO_TEACHER' : 'PENDING');
            
            let statusBadge = `<span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-amber-500/40">👉 Tu turno · PENDIENTE</span>`;
            let borderStyle = 'border: 1px solid rgba(245, 158, 11, 0.4);';
            
            if (rawStatus === 'SUBMITTED_TO_CEO') {
                statusBadge = `<span class="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">${targetRole === 'CEO' ? '🚨 Tu turno · VISAR' : '⏳ Turno de: CEO'}</span>`;
                borderStyle = 'border: 1px solid rgba(0, 240, 255, 0.5);';
            } else if (rawStatus === 'DELIVERED_TO_TEACHER') {
                statusBadge = '<span style="background-color: rgba(0, 255, 102, 0.15); border: 1px solid #00ff66; color: #00ff66;" class="text-[11px] font-mono font-bold px-2 py-0.5 rounded">🏛️ ENTREGADO A DOCENTE</span>';
                borderStyle = 'border: 1px solid rgba(0, 255, 102, 0.4);';
            } else if (rawStatus === 'CEO_REVISION' || rawStatus === 'DEVUELTO_A_TECNICO' || rawStatus === 'RETURNED_BY_CEO' || rawStatus === 'RETURNED_BY_TEACHER') {
                statusBadge = '<span style="background-color: rgba(255, 0, 85, 0.15); border: 1px solid #ff0055; color: #ff0055;" class="text-[11px] font-mono font-bold px-2 py-0.5 rounded animate-pulse">↩️ SUBSANAR</span>';
                borderStyle = 'border: 1px solid rgba(255, 0, 85, 0.5);';
            } else if (rawStatus === 'REVIEWED' || rawStatus === 'ACCEPTED') {
                statusBadge = '<span style="background-color: #00ff66; color: #000; font-weight: 900;" class="text-[11px] font-mono px-2 py-0.5 rounded">✓ CALIFICADO</span>';
                borderStyle = 'border: 1px solid #00ff66;';
            }

            const deadlineLabel = d.defaultDate ? d.defaultDate.replace('T', ' ') : 'Fin de Fase';
            const canDirectSubmit = (targetRole !== 'CEO') && (rawStatus === 'PENDING' || rawStatus === 'CEO_REVISION' || rawStatus === 'DEVUELTO_A_TECNICO' || rawStatus === 'RETURNED_BY_CEO' || rawStatus === 'RETURNED_BY_TEACHER');

            return `
            <div style="${borderStyle}" class="bg-black/60 p-3 rounded flex flex-col lg:flex-row justify-between items-start lg:items-center gap-2.5">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-mars-cyan">[${this.escapeHTML(d.subject || 'LOMLOE')} • ${this.escapeHTML(d.weight || '')}]</span>
                        <span class="text-[10px] font-mono text-slate-400">Límite: ${this.escapeHTML(deadlineLabel)}</span>
                        ${statusBadge}
                    </div>
                    <h5 class="font-orbitron font-bold text-white text-xs uppercase tracking-tight break-words">${this.escapeHTML(d.name || d.title || d.key)}</h5>
                </div>
                <div class="flex flex-wrap items-center gap-2 shrink-0">
                    ${this.renderDocTemplateBtn(d.key)}
                    ${canDirectSubmit ? `
                        <button type="button" onclick="ui.modalSubmitRoleDeliverable('${this.escapeHTML(d.key)}')" class="shrink-0 min-h-[44px] px-3.5 py-1.5 bg-mars-cyan hover:bg-white text-black font-black uppercase text-[11px] rounded transition-all flex items-center gap-1.5 shadow-sm">
                            <span>📤 Subir Enlace Ahora ➔</span>
                        </button>
                    ` : `
                        <button type="button" onclick="ui.current = 'role_deliverables'; ui.roleDeliverablesPhase = '${curPhase}'; ui.roleDeliverablesScope = 'MY_ROLE'; ui.render();" class="shrink-0 min-h-[44px] px-3.5 py-1.5 bg-slate-900 hover:bg-mars-cyan hover:text-black text-mars-cyan border border-mars-cyan/60 font-bold uppercase text-[11px] rounded transition-all flex items-center gap-1.5 shadow-sm">
                            <span>📤 Ver en Mis Entregables ➔</span>
                        </button>
                    `}
                </div>
            </div>`;
        };

        const primaryHtml = renderBannerCard(sortedActiveDeliverables[0]);
        const restDeliverables = sortedActiveDeliverables.slice(1);
        const allRoleDone = myActiveDeliverables.every(d => {
            const docItem = docs[d.key];
            const st = (typeof docItem === 'object' && docItem) ? docItem.status : (typeof docItem === 'string' && docItem ? 'DELIVERED_TO_TEACHER' : 'PENDING');
            return st === 'DELIVERED_TO_TEACHER' || st === 'REVIEWED' || st === 'ACCEPTED';
        });
        let countdownChipHtml = '';
        if (allRoleDone) {
            countdownChipHtml = `<span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 whitespace-nowrap">✓ Fase al día</span>`;
        } else if (typeof this.getPhaseClockMetrics === 'function') {
            const clock = this.getPhaseClockMetrics(co);
            if (clock) {
                if (clock.isDeadlinePassed) {
                    countdownChipHtml = `<span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-rose-950/70 border border-rose-500/70 text-rose-300 whitespace-nowrap">⌛ Plazo vencido</span>`;
                } else if (clock.daysRemaining <= 3) {
                    const urgencyText = clock.daysRemaining <= 1 ? '🚨 ¡Último día!' : `🚨 ¡Últimos ${clock.daysRemaining} días!`;
                    countdownChipHtml = `<span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-red-950/70 border border-red-500 text-red-300 animate-pulse whitespace-nowrap">${urgencyText}</span>`;
                } else {
                    countdownChipHtml = `<span class="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-amber-300 whitespace-nowrap">⏱️ Cierre en ${clock.daysRemaining} días</span>`;
                }
            }
        }
        const itemsHtml = restDeliverables.length > 0 ? `
            ${primaryHtml}
            <details class="mt-2 bg-black/40 border border-slate-800 rounded">
                <summary class="min-h-[44px] px-3 py-2 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-mars-cyan select-none">
                    <span>📋 Ver los otros ${restDeliverables.length} entregable(s) de tu rol en Fase ${this.escapeHTML(curPhase)}</span>
                    <span class="text-mars-cyan shrink-0">▼ Ver</span>
                </summary>
                <div class="p-2 pt-0 space-y-2">
                    ${restDeliverables.map(renderBannerCard).join('')}
                </div>
            </details>
        ` : primaryHtml;

        return `
        <div class="terminal-border bg-slate-950/80 border border-slate-800 p-3.5 sm:p-4 mb-6 rounded shadow-sm">
            <div class="flex flex-wrap justify-between items-center gap-2 mb-2.5 border-b border-slate-800 pb-2">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs">📌</span>
                    <span class="text-[11px] font-orbitron font-bold uppercase tracking-wider text-slate-300">
                        Tu Misión Fase ${this.escapeHTML(curPhase)} (${this.escapeHTML(targetRole.replace('_', ' '))})
                    </span>
                    ${isAuxInParity ? `<span class="text-[10px] font-mono px-2 py-0.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 rounded">🤝 Paridad Auxiliar (tu voto en Trámites es propio)</span>` : ''}
                </div>
                <div class="flex items-center gap-2.5 flex-wrap">
                    ${countdownChipHtml}
                    <button type="button" onclick="ui.current = 'role_deliverables'; ui.roleDeliverablesPhase = '${curPhase}'; ui.roleDeliverablesScope = 'ALL'; ui.render();" class="text-[11px] text-mars-cyan hover:underline font-mono min-h-[44px] inline-flex items-center">
                        🗺️ Mapa del Equipo ↗
                    </button>
                </div>
            </div>
            <div class="space-y-2">
                ${itemsHtml}
            </div>
        </div>`;
    },

    isContractPhaseUnlocked(phase, co) {
        if (typeof state !== 'undefined' && typeof state.isContractPhaseUnlocked === 'function') {
            return state.isContractPhaseUnlocked(phase, co);
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (state.user && state.user.admin)) {
            return true;
        }
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
        if (!win) return false;
        return Date.now() >= new Date(win.selectionStart).getTime();
    },

    isPressReleaseUnlocked(phaseKey, co) {
        if (typeof state !== 'undefined' && typeof state.isPressReleaseUnlocked === 'function') {
            return state.isPressReleaseUnlocked(phaseKey, co);
        }
        if (!co && state.user) co = state.data?.companies?.[state.user.coId];
        if (!co) return false;
        if (co.unlockAllContracts === true || (state.user && state.user.admin)) {
            return true;
        }
        const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [];
        const p = prPhases.find(item => item.phase === phaseKey);
        if (!p || !p.phaseCutoff) return false;
        return Date.now() >= new Date(p.phaseCutoff).getTime();
    },

    isPhaseBalanceUnlocked(phaseKey, co) {
        if (typeof state !== 'undefined' && typeof state.isPhaseBalanceUnlocked === 'function') {
            return state.isPhaseBalanceUnlocked(phaseKey, co);
        }
        return true;
    },

    isPhaseBalanceInWindow(phaseKey, co) {
        if (typeof state !== 'undefined' && typeof state.isPhaseBalanceInWindow === 'function') {
            return state.isPhaseBalanceInWindow(phaseKey, co);
        }
        return true;
    },

    isLaunchLicenseUnlocked(co) {
        if (typeof state !== 'undefined' && typeof state.isLaunchLicenseUnlocked === 'function') {
            return state.isLaunchLicenseUnlocked(co);
        }
        if (!co && state.user) co = state.data?.companies?.[state.user.coId];
        if (!co) return false;
        if (co.unlockAllContracts === true || (state.user && state.user.admin)) {
            return true;
        }
        const pItem = co.deliverables?.['preliminaryReport'];
        return Boolean(pItem && ((pItem.status === 'DELIVERED_TO_TEACHER' && pItem.driveUrl) || (typeof pItem === 'string' && pItem.length > 0)));
    },

    isBudgetInitialDelivered(co) {
        if (typeof state !== 'undefined' && typeof state.isBudgetInitialDelivered === 'function') {
            return state.isBudgetInitialDelivered(co);
        }
        if (!co && state.user) co = state.data?.companies?.[state.user.coId];
        if (!co) return false;
        if (co.unlockAllContracts === true || (state.user && state.user.admin)) {
            return true;
        }
        const p = co.deliverables?.['budgetInitial'];
        if (!p) return false;
        if (typeof p === 'string' && p.trim().length > 0) return true;
        if (typeof p === 'object' && p !== null) {
            const st = String(p.status || '');
            if (st === 'ACCEPTED' || st === 'REVIEWED' || st === 'APPROVED' || st === 'APROBADO') return true;
            if (st === 'DELIVERED_TO_TEACHER' && p.driveUrl && String(p.driveUrl).trim().length > 0) return true;
        }
        return false;
    },

    setContractsPhaseTab(phase) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!this.isContractPhaseUnlocked(phase, co)) {
            return this.notify(`🔒 Las licitaciones de la Fase ${phase} estarán clasificadas hasta el inicio de su fase oficial.`, 'info');
        }
        this.contractsPhaseTab = phase;
        this.render();
    },

    viewContracts(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const isCEO = this.getEffectiveRole(co) === 'CEO' || state.user.admin;
        const allPhases = ['I', 'II', 'III', 'IV'];
        const unlockedPhases = allPhases.filter(ph => this.isContractPhaseUnlocked(ph, co));
        const hasAnyUnlocked = unlockedPhases.length > 0;

        let currentPhaseTab = this.contractsPhaseTab;
        if (!currentPhaseTab || !unlockedPhases.includes(currentPhaseTab)) {
            currentPhaseTab = hasAnyUnlocked ? unlockedPhases[unlockedPhases.length - 1] : 'I';
        }
        this.contractsPhaseTab = currentPhaseTab;

        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[currentPhaseTab] : null;
        const isOpen = hasAnyUnlocked ? state.isContractSelectionWindowOpen(currentPhaseTab, co) : false;
        const signedForTab = co.contracts?.[currentPhaseTab];
        const catalogForPhase = hasAnyUnlocked ? (typeof CONTRACTS_CATALOG_DEF !== 'undefined' ? CONTRACTS_CATALOG_DEF : []).filter(c => c.phase === currentPhaseTab) : [];

        // Estadísticas globales de contratos
        const allSignedContracts = Object.values(co.contracts || {}).filter(c => c && c.contractId);
        const signedContractsCount = allSignedContracts.length;
        const completedContractsCount = allSignedContracts.filter(c => c.status === 'CUMPLIDO').length;
        const failedContractsCount = allSignedContracts.filter(c => c.status === 'NO_CUMPLIDO').length;
        const inProgressContractsCount = allSignedContracts.filter(c => !c.status || (c.status !== 'CUMPLIDO' && c.status !== 'NO_CUMPLIDO')).length;

        let netImpact = 0;
        allSignedContracts.forEach(c => {
            if (c.status === 'CUMPLIDO') netImpact += (Number(c.reward) || 0);
            else if (c.status === 'NO_CUMPLIDO') netImpact -= (Number(c.penalty) || 0);
        });

        const contractsPerformanceBarHtml = `
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div class="terminal-border p-3 bg-black/60 border border-slate-800 rounded">
                <span class="text-[10px] font-mono uppercase text-slate-400 block font-bold">Contratos Suscritos</span>
                <span class="text-base sm:text-lg font-orbitron font-bold text-white mt-0.5 block">${signedContractsCount} / 4</span>
                <span class="text-[10px] text-slate-400 font-mono">1 licitación máx. por fase</span>
            </div>
            <div class="terminal-border p-3 bg-black/60 border border-slate-800 rounded">
                <span class="text-[10px] font-mono uppercase text-slate-400 block font-bold">Contratos Cumplidos</span>
                <span style="color: #00ff66 !important;" class="text-base sm:text-lg font-orbitron font-bold mt-0.5 block">🏆 ${completedContractsCount} / ${signedContractsCount || 1}</span>
                <span class="text-[10px] text-slate-400 font-mono">${signedContractsCount > 0 ? Math.round((completedContractsCount / signedContractsCount) * 100) : 0}% de éxito docente</span>
            </div>
            <div class="terminal-border p-3 bg-black/60 border border-slate-800 rounded">
                <span class="text-[10px] font-mono uppercase text-slate-400 block font-bold">En Auditoría / Curso</span>
                <span class="text-base sm:text-lg font-orbitron font-bold text-indigo-400 mt-0.5 block">⏳ ${inProgressContractsCount}</span>
                <span class="text-[10px] text-slate-400 font-mono">Pendientes de resolución</span>
            </div>
            <div class="terminal-border p-3 bg-black/60 border border-slate-800 rounded">
                <span class="text-[10px] font-mono uppercase text-slate-400 block font-bold">Impacto Neto Caja</span>
                <span style="color: ${netImpact >= 0 ? '#00ff66' : '#ff0055'} !important;" class="text-base sm:text-lg font-orbitron font-bold mt-0.5 block">${netImpact >= 0 ? '+' : ''}${netImpact.toFixed(0)} €v</span>
                <span class="text-[10px] text-slate-400 font-mono">Saldo neto en Ledger</span>
            </div>
        </div>`;

        // Bloque de Patrocinio Oficial tras Fase I
        const sponsorAwarded = co.sponsorAwarded;
        const sponsorData = co.sponsorData || {};
        const sponsorAmount = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : (sponsorData.amount || 0);

        const tierStyles = {
            'ORO': 'style="color: #FFD700 !important; border-color: #FFD700 !important; background-color: rgba(255, 215, 0, 0.15) !important;"',
            'PLATA': 'style="color: #E2E8F0 !important; border-color: #E2E8F0 !important; background-color: rgba(226, 232, 240, 0.15) !important;"',
            'BRONCE': 'style="color: #CD7F32 !important; border-color: #CD7F32 !important; background-color: rgba(205, 127, 50, 0.15) !important;"',
            'COBRE': 'style="color: #E04F33 !important; border-color: #E04F33 !important; background-color: rgba(224, 79, 51, 0.15) !important;"',
            'COLABORADOR': 'style="color: #00F0FF !important; border-color: #00F0FF !important; background-color: rgba(0, 240, 255, 0.15) !important;"'
        };
        const sponsorStyle = sponsorAwarded ? (tierStyles[sponsorAwarded] || 'class="text-slate-300 border-slate-700 bg-slate-900"') : '';

        const sponsorStatusBanner = sponsorAwarded ? `
            <div class="terminal-border p-4 sm:p-5 mb-4 border-t-4 border-t-amber-400 bg-mars-card">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex items-center gap-3.5">
                        ${sponsorData.logo ? `<img src="${this.escapeHTML(sponsorData.logo)}" alt="Logo Patrocinador" class="w-12 h-12 object-contain bg-black border border-slate-700 p-1 rounded-sm">` : `<span class="text-3xl">🥇</span>`}
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Patrocinador Oficial Confirmado (Fase I)</span>
                                <span class="text-xs font-black uppercase border px-2 py-0.5 rounded-sm" ${sponsorStyle}>[NIVEL ${this.escapeHTML(sponsorAwarded)}]</span>
                            </div>
                            <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase mt-0.5">${this.escapeHTML(sponsorData.name || 'Fondo Semilla Aeroespacial')}</h3>
                            <p class="text-xs text-slate-300">Capital concedido tras el micro-pitch en lengua inglesa para dotación de constitución.</p>
                        </div>
                    </div>
                    <div class="text-right sm:text-right w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <span class="text-[10px] text-slate-400 font-mono uppercase block">Abono Registrado en Caja</span>
                        <span class="text-xl sm:text-2xl font-orbitron font-black text-mars-green">+${Number(sponsorAmount).toFixed(0)} €v</span>
                    </div>
                </div>
            </div>
        ` : `
            <div class="terminal-border p-4 mb-4 bg-slate-900/50 border border-slate-800">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div class="flex items-center gap-3">
                        <span class="text-2xl">🤝</span>
                        <div>
                            <span class="text-[10px] font-mono uppercase text-slate-400 font-bold">Patrocinio Oficial Fase I (Pitch en Lengua Inglesa)</span>
                            <p class="text-xs text-slate-300">En proceso de asignación docente tras el micro-pitch en inglés. Concede entre <strong>+100 €v y +500 €v</strong> según la rúbrica oficial.</p>
                        </div>
                    </div>
                    <span class="text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-500/30 px-3 py-1 font-bold animate-pulse">En Evaluación</span>
                </div>
            </div>
        `;

        const sponsorTiersDef = [
            { id: 'ORO', name: 'Nivel ORO', amount: 500, emoji: '🥇', colorHex: '#FFD700', perk: 'Dotación de patrocinio Nivel Oro' },
            { id: 'PLATA', name: 'Nivel PLATA', amount: 400, emoji: '🥈', colorHex: '#E2E8F0', perk: 'Dotación de patrocinio Nivel Plata' },
            { id: 'BRONCE', name: 'Nivel BRONCE', amount: 250, emoji: '🥉', colorHex: '#CD7F32', perk: 'Dotación de patrocinio Nivel Bronce' },
            { id: 'COBRE', name: 'Nivel COBRE', amount: 150, emoji: '🔶', colorHex: '#E04F33', perk: 'Dotación de patrocinio Nivel Cobre' },
            { id: 'COLABORADOR', name: 'Nivel COLABORADOR', amount: 100, emoji: '🤝', colorHex: '#00F0FF', perk: 'Dotación de patrocinio Nivel Colaborador' }
        ];

        const sponsorHtml = `
            <div class="mb-6 space-y-3">
                ${sponsorStatusBanner}
                <div class="terminal-border p-4 bg-black/60 border border-slate-800">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-slate-800/80 pb-2">
                        <div>
                            <span class="text-[10px] font-mono uppercase text-amber-400 font-bold">Inversores y Capital Semilla // Fase I</span>
                            <h3 class="text-xs sm:text-sm font-orbitron font-bold text-white uppercase mt-0.5">Escala Oficial de Premios de Patrocinio</h3>
                        </div>
                        <span class="text-[11px] font-mono text-slate-400">Rúbrica de Micro-Pitch en Lengua Inglesa</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 mb-3">
                        ${sponsorTiersDef.map(t => {
                            const isMyTier = sponsorAwarded === t.id;
                            const bgMap = {
                                'ORO': 'rgba(255, 215, 0, 0.14)',
                                'PLATA': 'rgba(226, 232, 240, 0.14)',
                                'BRONCE': 'rgba(205, 127, 50, 0.16)',
                                'COBRE': 'rgba(224, 79, 51, 0.16)',
                                'COLABORADOR': 'rgba(0, 240, 255, 0.14)'
                            };
                            const cardStyle = isMyTier
                                ? `background: ${bgMap[t.id] || 'rgba(255, 215, 0, 0.2)'} !important; border: 2px solid ${t.colorHex} !important; box-shadow: 0 0 25px ${t.colorHex}77 !important;`
                                : `background: ${bgMap[t.id] || 'rgba(15, 23, 42, 0.7)'} !important; border: 1.5px solid ${t.colorHex} !important; box-shadow: 0 0 10px ${t.colorHex}33 !important;`;
                            return `
                            <div style="${cardStyle}" class="p-3 rounded flex flex-col justify-between transition-all">
                                <div>
                                    <div class="flex items-center justify-between gap-1 mb-1.5">
                                        <span class="text-xl">${t.emoji}</span>
                                        ${isMyTier ? `
                                            <span style="background-color: ${t.colorHex} !important; color: #000000 !important; font-weight: 900 !important;" class="text-[9px] uppercase px-1.5 py-0.5 font-mono rounded">CONCEDIDO</span>
                                        ` : `
                                            <span class="text-[9px] font-mono uppercase text-slate-400">${sponsorAwarded ? 'Disponible' : 'En Juego'}</span>
                                        `}
                                    </div>
                                    <h4 style="color: ${t.colorHex} !important;" class="font-orbitron font-bold text-xs uppercase">${this.escapeHTML(t.name)}</h4>
                                    <p class="text-[10px] text-slate-300 mt-1 leading-snug">${this.escapeHTML(t.perk)}</p>
                                </div>
                                <div class="mt-3 pt-2 border-t border-slate-800/80 text-right">
                                    <span style="color: ${isMyTier ? '#00ff66' : t.colorHex} !important;" class="text-sm sm:text-base font-orbitron font-black">+${t.amount} €v</span>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>

                    <div class="p-2.5 bg-cyan-950/20 border-l-2 border-cyan-400 text-[11px] text-slate-300 space-y-1">
                        <strong class="text-cyan-300 uppercase font-mono block text-[10px]">Beneficios del Patrocinador:</strong>
                        <p>1. <strong>Inyección en tesorería:</strong> Los fondos (€v) se abonan en la cuenta bancaria de la empresa.</p>
                        <p>2. <strong>Reducción de Costes:</strong> El patrocinio reduce la factura de costes operativos de la empresa.</p>
                    </div>
                </div>
            </div>
        `;

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="space-y-6">
            <!-- Cabecera del Módulo -->
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 text-[10px] font-orbitron font-bold uppercase bg-cyan-950/60 border border-cyan-400 text-cyan-300">Módulo Ejecutivo</span>
                            <span class="text-xs text-slate-400 font-mono">[STARTUP: ${this.escapeHTML(co.name)}]</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-tight">
                            🤝 Contratos Comerciales y Misiones del CEO
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">
                            Licitaciones estratégicas y contratos por fase emitidos por corporaciones aeroespaciales y medios internacionales.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 w-full md:w-auto justify-end">
                        <span class="text-xs font-mono text-slate-400 bg-black/60 border border-slate-700 px-3 py-2">
                            ${isCEO ? '👑 Rol con Potestad de Firma: CEO' : '👁️ Modo Consulta Departamento'}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Rendimiento y Estadísticas de Contratos -->
            ${contractsPerformanceBarHtml}

            <!-- Patrocinio Oficial tras Fase I -->
            ${sponsorHtml}

            ${!hasAnyUnlocked ? `
                <!-- Catálogo Clasificado / Anti-spoilers -->
                <div class="terminal-border p-6 sm:p-8 bg-slate-950 border-2 border-amber-500/50 text-center space-y-4">
                    <div class="inline-flex p-3 bg-amber-500/10 border border-amber-500/40 rounded-full text-3xl">
                        🔒
                    </div>
                    <div>
                        <h3 class="text-base sm:text-lg font-orbitron font-black text-amber-300 uppercase">
                            Licitaciones Comerciales Clasificadas
                        </h3>
                        <p class="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto mt-2 leading-relaxed">
                            El catálogo oficial de licitaciones corporativas y contratos estratégicos de la Fase I estará disponible para el CEO a partir del <strong>21 de Noviembre de 2026</strong>.
                        </p>
                        <p class="text-[11px] text-slate-500 font-mono mt-1">
                            Las licitaciones de fases posteriores (Fases II, III y IV) se publicarán de forma escalonada al inicio oficial de cada fase.
                        </p>
                    </div>
                    <div class="pt-2">
                        <span class="inline-block px-3.5 py-1.5 bg-amber-950/60 border border-amber-400 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                            📅 Apertura Oficial Fase I: 21/11/2026
                        </span>
                    </div>
                </div>
            ` : `
                <!-- Navegación por Fases Desbloqueadas -->
                <div class="flex flex-wrap gap-2 border-b border-mars-border pb-2">
                    ${unlockedPhases.map(ph => {
                        const isTab = ph === currentPhaseTab;
                        const cSigned = co.contracts?.[ph];
                        let badge = '';
                        if (cSigned) {
                            const isTabCompleted = cSigned.status === 'CUMPLIDO';
                            const isTabFailed = cSigned.status === 'NO_CUMPLIDO';
                            const badgeStyle = isTabCompleted
                                ? 'background-color: rgba(0, 255, 102, 0.2) !important; border: 1px solid #00ff66 !important; color: #00ff66 !important;'
                                : (isTabFailed
                                    ? 'background-color: rgba(255, 0, 85, 0.2) !important; border: 1px solid #ff0055 !important; color: #ff0055 !important;'
                                    : 'background-color: rgba(99, 102, 241, 0.2) !important; border: 1px solid #818cf8 !important; color: #c7d2fe !important;');
                            const icon = isTabCompleted ? '✓' : (isTabFailed ? '✗' : '⏳');
                            badge = `<span style="${badgeStyle}" class="ml-1.5 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">${icon} ${this.escapeHTML(cSigned.company)}</span>`;
                        }
                        return `
                        <button type="button" onclick="ui.setContractsPhaseTab('${ph}')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center ${isTab ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-200 hover:text-white border border-slate-800'}">
                            <span>Fase ${ph}</span>
                            ${badge}
                        </button>`;
                    }).join('')}
                </div>

                <!-- Estado de la Ventana Temporal de Selección -->
                ${(() => {
                    const nowTs = Date.now();
                    const winStart = win ? new Date(win.selectionStart).getTime() : 0;
                    const winEnd = win ? new Date(win.selectionEnd).getTime() : 0;
                    const isWithinDates = (nowTs >= winStart && nowTs <= winEnd);
                    const isBudgetDelivered = this.isBudgetInitialDelivered(co);

                    if (currentPhaseTab === 'I' && isWithinDates && !isBudgetDelivered && !co.unlockAllContracts) {
                        return `
                        <div class="terminal-border p-4 bg-amber-950/20 border border-amber-500/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                            <div>
                                <div class="flex items-center gap-2">
                                    <span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
                                    <h4 class="font-orbitron font-bold text-xs sm:text-sm uppercase text-amber-300">
                                        Requisito Previo Obligatorio: Presupuesto Inicial Pendiente
                                    </h4>
                                </div>
                                <p class="text-xs text-slate-300 mt-0.5">
                                    Para poder suscribir un contrato comercial en esta Fase I, el departamento de Finanzas debe entregar previamente el <strong>Presupuesto Inicial de Economía</strong>. Plazo oficial improrrogable: hasta el <strong>27/11/2026 a las 23:59</strong>.
                                </p>
                            </div>
                            <button type="button" onclick="ui.current = 'role_deliverables'; ui.render();" class="min-h-[44px] px-4 py-2 bg-amber-400 hover:bg-amber-300 text-black font-bold uppercase text-xs rounded font-orbitron shrink-0 transition-all flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                                <span>📑 Ir a Entregables ➔</span>
                            </button>
                        </div>`;
                    }

                    return `
                    <div class="terminal-border p-4 bg-slate-950 border ${isOpen ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-amber-500/40 bg-amber-950/10'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div>
                            <div class="flex items-center gap-2">
                                <span class="inline-block w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
                                <h4 class="font-orbitron font-bold text-xs sm:text-sm uppercase ${isOpen ? 'text-emerald-300' : 'text-amber-300'}">
                                    ${isOpen ? 'Ventana Oficial de Suscripción Abierta' : 'Ventana Oficial de Suscripción Cerrada / Bloqueada'}
                                </h4>
                            </div>
                            <p class="text-xs text-slate-300 mt-0.5">
                                ${win?.windowLabel || 'Primeros 5 días lectivos'}. Cada startup puede suscribir un único contrato por fase. Tras la ventana, el compromiso queda congelado.
                            </p>
                        </div>
                        ${co.unlockAllContracts ? `
                            <span class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-amber-400 text-black border border-amber-300 rounded shrink-0">
                                🧪 Sandbox Pruebas: Ventanas Desbloqueadas
                            </span>
                        ` : ''}
                    </div>`;
                })()}

                <!-- Chips de Referencia Táctica para comparar licitaciones -->
                ${(() => {
                    const freeContractBal = state.getFreeVirtualBalance ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
                    const bomContractCost = typeof state.calculateBomCost === 'function' ? state.calculateBomCost(co) : 0;
                    const bestContractE = (co.flightTests || []).reduce((mx, f) => Math.max(mx, Number(f.efficiency) || 0), 0);
                    return `
                    <div class="grid grid-cols-3 gap-2 text-center font-mono text-xs">
                        <div class="bg-black/60 border border-mars-green/40 p-2 rounded">
                            <span class="text-[10px] text-slate-400 uppercase block">Saldo Libre Real</span>
                            <strong class="text-mars-green">${freeContractBal.toFixed(2)} €v</strong>
                        </div>
                        <div class="bg-black/60 border border-mars-cyan/40 p-2 rounded">
                            <span class="text-[10px] text-slate-400 uppercase block">Coste BOM Actual</span>
                            <strong class="text-mars-cyan">${bomContractCost.toFixed(2)} €v</strong>
                        </div>
                        <div class="bg-black/60 border border-mars-yellow/40 p-2 rounded">
                            <span class="text-[10px] text-slate-400 uppercase block">Mejor E Actual</span>
                            <strong class="text-mars-yellow">${bestContractE > 0 ? bestContractE.toFixed(2) : '--'}</strong>
                        </div>
                    </div>`;
                })()}

                <!-- Contrato Actualmente Suscrito en esta Fase (si existe) -->
                ${signedForTab ? (() => {
                    const isSuccess = signedForTab.status === 'CUMPLIDO';
                    const isFailed = signedForTab.status === 'NO_CUMPLIDO';

                    let boxStyle = 'background-color: rgba(99, 102, 241, 0.08) !important; border: 2px solid #6366f1 !important; box-shadow: 0 0 20px rgba(99, 102, 241, 0.25) !important;';
                    let headerBorderStyle = 'border-bottom: 1px solid rgba(99, 102, 241, 0.4) !important;';
                    let labelColorStyle = 'color: #818cf8 !important;';
                    let innerBoxStyle = 'background-color: rgba(0, 0, 0, 0.7) !important; border: 1px solid rgba(99, 102, 241, 0.3) !important;';

                    if (isSuccess) {
                        boxStyle = 'background-color: rgba(0, 255, 102, 0.08) !important; border: 2px solid #00ff66 !important; box-shadow: 0 0 25px rgba(0, 255, 102, 0.35) !important;';
                        headerBorderStyle = 'border-bottom: 1px solid rgba(0, 255, 102, 0.4) !important;';
                        labelColorStyle = 'color: #00ff66 !important; text-shadow: 0 0 8px rgba(0, 255, 102, 0.4);';
                        innerBoxStyle = 'background-color: rgba(0, 0, 0, 0.7) !important; border: 1px solid rgba(0, 255, 102, 0.3) !important;';
                    } else if (isFailed) {
                        boxStyle = 'background-color: rgba(255, 0, 85, 0.08) !important; border: 2px solid #ff0055 !important; box-shadow: 0 0 25px rgba(255, 0, 85, 0.35) !important;';
                        headerBorderStyle = 'border-bottom: 1px solid rgba(255, 0, 85, 0.4) !important;';
                        labelColorStyle = 'color: #ff0055 !important; text-shadow: 0 0 8px rgba(255, 0, 85, 0.4);';
                        innerBoxStyle = 'background-color: rgba(0, 0, 0, 0.7) !important; border: 1px solid rgba(255, 0, 85, 0.3) !important;';
                    }

                    return `
                    <div style="${boxStyle}" class="terminal-border p-5 rounded">
                        <div style="${headerBorderStyle}" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2">
                            <div>
                                <span style="${labelColorStyle}" class="text-[10px] font-orbitron font-bold uppercase tracking-widest">
                                    ${isSuccess ? '🏆 CONTRATO OFICIAL COMPLETADO CON ÉXITO' : (isFailed ? '⚠️ CONTRATO OFICIAL RESUELTO CON PENALIZACIÓN' : 'Contrato Oficial Vinculante Suscrito')}
                                </span>
                                <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase mt-0.5">
                                    ${this.escapeHTML(signedForTab.company)} — ${this.escapeHTML(signedForTab.title)}
                                </h3>
                            </div>
                            <div class="flex items-center gap-2">
                                ${isSuccess ? `
                                    <span style="background-color: #00ff66 !important; color: #000000 !important; font-weight: 900 !important; box-shadow: 0 0 15px rgba(0,255,102,0.6) !important;" class="px-3.5 py-1.5 text-xs uppercase font-orbitron rounded">
                                        ✅ Cumplido (+${signedForTab.reward} €v Asignados)
                                    </span>
                                ` : (isFailed ? `
                                    <span style="background-color: #ff0055 !important; color: #ffffff !important; font-weight: 900 !important; box-shadow: 0 0 15px rgba(255,0,85,0.6) !important;" class="px-3.5 py-1.5 text-xs uppercase font-orbitron rounded">
                                        ❌ No Cumplido (-${signedForTab.penalty} €v Penalizados)
                                    </span>
                                ` : `
                                    <span style="background-color: rgba(99, 102, 241, 0.25) !important; border: 1px solid #818cf8 !important; color: #c7d2fe !important; font-weight: bold !important;" class="px-3 py-1 text-xs uppercase font-mono rounded animate-pulse">
                                        ⏳ En Curso • Pendiente de Auditoría Docente
                                    </span>
                                `)}
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div class="md:col-span-2">
                                <span class="text-slate-400 font-bold uppercase block mb-0.5">Requisitos Operativos Exigidos:</span>
                                <p class="text-white leading-relaxed font-sans">${this.escapeHTML(signedForTab.requirements)}</p>
                                <span class="text-slate-400 font-bold uppercase block mt-2 mb-0.5">Método de Verificación Docente:</span>
                                <p style="${isSuccess ? 'color: #5eead4 !important;' : (isFailed ? 'color: #fca5a5 !important;' : 'color: #a5b4fc !important;')}" class="font-sans font-semibold">${this.escapeHTML(signedForTab.verification)}</p>
                            </div>
                            <div style="${innerBoxStyle}" class="p-3 rounded flex flex-col justify-between">
                                <div>
                                    <span class="text-slate-400 font-bold uppercase block text-[10px]">Impacto en Tesorería:</span>
                                    <div class="flex justify-between items-center mt-1 font-mono font-bold">
                                        <span style="color: #00ff66 !important;">+${signedForTab.reward} €v (Éxito)</span>
                                        <span style="color: #ff0055 !important;">-${signedForTab.penalty} €v (Fallo)</span>
                                    </div>
                                </div>
                                <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                                    <span>Firmado: ${this.escapeHTML(signedForTab.signedDate || '--')}</span><br>
                                    <span>Por: Dirección General (${this.escapeHTML(signedForTab.signedBy || 'CEO')})</span>
                                </div>
                            </div>
                        </div>
                    </div>`;
                })() : ''}

                <!-- Catálogo de Licitaciones de la Fase (Oculto automáticamente si ya hay contrato suscrito) -->
                ${!signedForTab ? `
                <div>
                    <div class="flex justify-between items-center mb-3">
                        <h3 class="font-orbitron font-bold text-white text-sm uppercase tracking-wider">
                            📑 Licitaciones Corporativas Disponibles • Fase ${currentPhaseTab} (${catalogForPhase.length} Opciones)
                        </h3>
                        <span class="text-xs text-slate-400 font-mono">Selección vinculante exclusiva: 1 por startup</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${catalogForPhase.map(c => {
                            const isThisSigned = signedForTab && signedForTab.contractId === c.id;
                            const hasOtherSigned = signedForTab && signedForTab.contractId !== c.id;

                            let cardBorder = 'border-slate-800';
                            if (isThisSigned) cardBorder = 'border-2 border-indigo-400 bg-indigo-950/20';
                            else if (hasOtherSigned) cardBorder = 'border-slate-800/60 opacity-60 bg-black/40';

                            return `
                            <div class="terminal-border p-4 bg-mars-card ${cardBorder} flex flex-col justify-between transition-all hover:border-slate-700">
                                <div>
                                    <div class="flex justify-between items-start gap-2 mb-2">
                                        <div class="min-w-0">
                                            <span class="text-[10px] font-mono font-bold text-mars-cyan uppercase tracking-wider block">[${this.escapeHTML(c.id)}] ${this.escapeHTML(c.dept)}</span>
                                            <h4 class="font-orbitron font-bold text-white text-sm uppercase mt-0.5 break-words">${this.escapeHTML(c.company)}</h4>
                                        </div>
                                        ${isThisSigned ? `
                                            <span class="px-2 py-0.5 text-[9px] bg-indigo-500 text-black font-black uppercase font-orbitron shrink-0">Suscrito</span>
                                        ` : ''}
                                    </div>
                                    <h5 class="text-xs font-bold text-slate-200 uppercase mb-2 leading-snug">${this.escapeHTML(c.title)}</h5>
                                    <p class="text-xs text-slate-300 leading-relaxed font-sans mb-3 line-clamp-4" title="${this.escapeHTML(c.requirements)}">
                                        ${this.escapeHTML(c.requirements)}
                                    </p>
                                    <div class="bg-black/50 p-2.5 border border-slate-800/80 mb-3 text-[11px]">
                                        <span class="text-slate-400 font-mono uppercase block text-[10px] font-bold">Verificación:</span>
                                        <p class="text-slate-300 italic mt-0.5 leading-tight">${this.escapeHTML(c.verification)}</p>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center py-2 px-3 bg-black border border-slate-800 mb-3 text-xs font-mono font-bold">
                                        <span class="text-emerald-400">+${c.reward} €v</span>
                                        <span class="text-slate-500">|</span>
                                        <span class="text-rose-400">-${c.penalty} €v</span>
                                    </div>
                                    <div>
                                        ${isThisSigned ? `
                                            <button type="button" disabled class="w-full min-h-[44px] bg-indigo-950/60 border border-indigo-400 text-indigo-300 text-xs font-bold uppercase font-mono cursor-default">
                                                ✓ Contrato en Vigor
                                            </button>
                                        ` : (hasOtherSigned ? `
                                            <button type="button" disabled class="w-full min-h-[44px] bg-slate-900 text-slate-600 border border-slate-800 text-xs font-bold uppercase font-mono cursor-not-allowed">
                                                🔒 No Disponible
                                            </button>
                                        ` : (isCEO ? (isOpen ? `
                                            <button type="button" onclick="ui.modalConfirmSignContract('${this.escapeHTML(c.id)}')" class="w-full min-h-[44px] bg-mars-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,240,255,0.25)]">
                                                ✍️ Suscribir Contrato
                                            </button>
                                        ` : `
                                            <button type="button" disabled class="w-full min-h-[44px] bg-slate-900 border border-slate-800 text-amber-400/80 text-xs font-bold uppercase font-mono cursor-not-allowed">
                                                ${(currentPhaseTab === 'I' && !this.isBudgetInitialDelivered(co) && !co.unlockAllContracts) ? '⏳ Requiere Presupuesto DOC_4' : '🔒 Ventana Cerrada'}
                                            </button>
                                        `) : `
                                            <div class="min-h-[44px] bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono flex items-center justify-center text-center p-1">
                                                🔒 Solo CEO puede firmar
                                            </div>
                                        `))}
                                    </div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                ` : `
                <div class="terminal-border p-4 bg-slate-900/40 border border-slate-800 text-center rounded flex flex-col sm:flex-row items-center justify-center gap-2">
                    <span class="text-xs font-mono text-slate-400 uppercase">
                        🔒 Licitación única formalizada para la Fase ${currentPhaseTab}. El catálogo de ofertas queda cerrado para mantener el compromiso corporativo.
                    </span>
                </div>
                `}
            `}
        </div>`;

        el.appendChild(wrapper);
    },

    modalConfirmSignContract(contractId) {
        const contract = (typeof CONTRACTS_CATALOG_DEF !== 'undefined' ? CONTRACTS_CATALOG_DEF : []).find(c => c.id === contractId);
        if (!contract) return;

        const body = `
        <div class="space-y-4">
            <div class="p-3 bg-cyan-950/30 border border-cyan-500/40 text-xs">
                <span class="text-[10px] font-mono text-cyan-300 uppercase font-bold">[${this.escapeHTML(contract.id)}] Fase ${this.escapeHTML(contract.phase)}</span>
                <h4 class="font-orbitron font-bold text-white text-sm uppercase mt-0.5">${this.escapeHTML(contract.company)} — ${this.escapeHTML(contract.title)}</h4>
            </div>

            <div class="text-xs text-slate-300 space-y-2">
                <p><strong>Cláusula de Compromiso:</strong> Al firmar esta licitación, la startup asume formalmente el cumplimiento de los siguientes requisitos en la Fase ${this.escapeHTML(contract.phase)}:</p>
                <div class="p-3 bg-black border border-slate-800 font-sans text-white text-xs leading-relaxed">
                    "${this.escapeHTML(contract.requirements)}"
                </div>
                <p class="text-slate-400 italic">Verificación por Claustro: ${this.escapeHTML(contract.verification)}</p>
            </div>

            <div class="grid grid-cols-2 gap-3 text-center font-mono text-xs">
                <div class="p-2.5 bg-emerald-950/40 border border-emerald-500/40 text-emerald-300">
                    <span class="block text-[10px] text-slate-400 uppercase font-sans">Recompensa al Cumplir</span>
                    <strong class="text-base text-emerald-400">+${contract.reward} €v</strong>
                </div>
                <div class="p-2.5 bg-rose-950/40 border border-rose-500/40 text-rose-300">
                    <span class="block text-[10px] text-slate-400 uppercase font-sans">Penalización al Incumplir</span>
                    <strong class="text-base text-rose-400">-${contract.penalty} €v</strong>
                </div>
            </div>

            <div class="p-3 bg-amber-950/30 border border-amber-500/50 text-xs text-amber-200">
                ⚠️ <strong>Aviso Legal Inmutable:</strong> La firma de este contrato comercial es <strong>exclusiva e irreversible</strong>. No se admiten modificaciones estatutarias ni cancelaciones posteriores durante la fase.
            </div>

            <div class="flex gap-3 pt-2">
                <button type="button" onclick="ui.closeModal()" class="flex-1 min-h-[44px] bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase transition-colors">Cancelar</button>
                <button type="button" onclick="ui.executeSignContract('${this.escapeHTML(contract.id)}')" class="flex-1 min-h-[44px] bg-mars-cyan text-black hover:bg-white font-black text-xs uppercase tracking-wider transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]">✍️ Confirmar y Firmar</button>
            </div>
        </div>`;

        this.showModal(`FIRMA VINCULANTE DE CONTRATO COMERCIAL`, body, "");
    },

    executeSignContract(contractId) {
        if (!state.user || !state.user.coId) return;
        const res = state.signCommercialContract(state.user.coId, contractId);
        if (res && res.ok) {
            this.closeModal();
            this.notify("✅ Contrato comercial firmado y registrado en la cadena de bloques corporativa.", "success");
            this.render();
        } else {
            this.notify("❌ " + (res?.error || "Error al suscribir contrato"), "error");
        }
    }
});
