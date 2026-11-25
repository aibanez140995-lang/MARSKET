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
            : (isVipStep ? 'LECTOR INVITADO · Órbita.' : (state.data.companies[verifiedCoId]?.name || 'STARTUP'));

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
                    } else if (isCEO && docObj && (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') && docObj.returnByTeacher) {
                        ceoDirectActions = `
                        <div class="flex items-center gap-1.5 shrink-0">
                            <button type="button" onclick="ui.modalCeoResubmitDeliverable('${docKey}')" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-xs px-3 py-1.5 hover:bg-white transition-all shadow-sm" title="Confirmar corrección y reenviar al docente">[ 🔄 REENVIAR SUBSANADO ]</button>
                        </div>`;
                    }

                    const safeReturnDocHref = ((st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') && docObj?.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(docObj.returnDriveUrl)))
                        ? (this.sanitizeDriveUrl ? this.sanitizeDriveUrl(docObj.returnDriveUrl) : encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;'))
                        : '';

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
                            ${((st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') && (docObj.returnReason || docObj.returnReasonId)) ? `<p class="text-[11px] text-red-400 mt-1 font-mono uppercase">⚠️ ${docObj.returnByTeacher ? `Motivo Subsanación Docente (${this.escapeHTML(docObj.returnByTeacherRole || 'Claustro')})` : 'Motivo Devolución CEO'}: ${this.escapeHTML(docObj.returnReason || docObj.returnReasonId)}</p>` : ''}
                            ${safeReturnDocHref ? `<a href="${safeReturnDocHref}" target="_blank" rel="noopener noreferrer" class="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-300 hover:underline font-mono">📄 Ver Correcciones Docente ↗</a>` : ''}
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
        const teacherReturnedDefs = defs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO') && docs[d.key].returnByTeacher);
        const pendingPhaseBalances = Object.values(co.phaseBalances || {}).filter(b => b && b.status === 'PENDIENTE_CEO');
        const pendingCeoDeliverables = Object.values(docs).filter(d => d && (d.status === 'SUBMITTED_TO_CEO' || ((d.status === 'CEO_REVISION' || d.status === 'DEVUELTO_A_TECNICO') && d.returnByTeacher))).length + pendingPhaseBalances.length;
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
        const totalTrayPendingItems = submittedCeoDefs.length + teacherReturnedDefs.length + pendingPhaseBalances.length + pendingMktActionsList.length + (pendingSlogan ? 1 : 0);
        const totalPendingCeoItems = totalTrayPendingItems + pendingSpecialItemsCount;
        const urgentCount = teacherReturnedDefs.length + (isSloganUrgent ? 1 : 0) + (isMktUrgent ? pendingMktActionsList.length : 0) + pendingPhaseBalances.length + classifiedCeoDefs.filter(x => x.isUrgent).length;
        const activeTrayFilter = (this.ceoTrayFilter === 'URGENT') ? 'URGENT' : 'ALL';

        const visibleSlogan = (activeTrayFilter === 'ALL' || isSloganUrgent) ? pendingSlogan : null;
        const visibleMktActions = (activeTrayFilter === 'ALL') ? pendingMktActionsList : (isMktUrgent ? pendingMktActionsList : []);
        const visiblePhaseBalances = pendingPhaseBalances;
        const visibleTeacherReturnedDefs = teacherReturnedDefs;
        const visibleCeoDefs = (activeTrayFilter === 'URGENT') ? classifiedCeoDefs.filter(x => x.isUrgent) : classifiedCeoDefs;
        const visibleTotalCount = visibleTeacherReturnedDefs.length + (visibleSlogan ? 1 : 0) + visibleMktActions.length + visiblePhaseBalances.length + visibleCeoDefs.length;

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
                        ${visibleTeacherReturnedDefs.map(d => {
                            const doc = docs[d.key];
                            const tRole = doc?.returnByTeacherRole || 'Claustro';
                            const reasonTxt = doc?.returnReason || doc?.returnReasonId || 'Requiere subsanación docente';
                            const safeRetDocHref = (doc?.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(doc.returnDriveUrl)))
                                ? (this.sanitizeDriveUrl ? this.sanitizeDriveUrl(doc.returnDriveUrl) : encodeURI(doc.returnDriveUrl).replace(/"/g, '&quot;'))
                                : '';
                            return `
                            <div class="bg-red-950/35 border-2 border-red-500 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-[0_0_12px_rgba(239,68,68,0.2)]">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-red-600 text-white animate-pulse">🚨 SUBSANACIÓN DOCENTE · ${this.escapeHTML(tRole)}</span>
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')}</span>
                                        <span class="text-xs font-bold uppercase text-amber-300 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Resp: ${this.escapeHTML(d.role.replace('_', ' '))}</span>
                                        <span class="text-xs text-slate-300 font-mono">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">${this.escapeHTML(d.name)}</h4>
                                    <p class="text-xs text-red-200 mt-1 font-mono">Motivo: <span class="text-amber-300 italic">"${this.escapeHTML(reasonTxt)}"</span></p>
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${this.renderDocTemplateBtn(d.key)}
                                        ${doc?.driveUrl ? `
                                            <a href="${encodeURI(doc.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(doc.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                                <span>📄 Abrir Documento Actual ↗</span>
                                            </a>
                                        ` : ''}
                                        ${safeRetDocHref ? `
                                            <a href="${safeRetDocHref}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/60 text-white border border-red-400 rounded font-mono hover:bg-red-800 transition-colors">
                                                <span>📄 Ver Correcciones Docente ↗</span>
                                            </a>
                                        ` : ''}
                                    </div>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-red-900/50">
                                    <button type="button" onclick="ui.modalCeoResubmitDeliverable('${this.escapeHTML(d.key)}')" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">[ 🔄 REENVIAR SUBSANADO AL DOCENTE ]</button>
                                </div>
                            </div>`;
                        }).join('')}
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
                        Publica los comunicados oficiales de balance con 7 días de margen tras el corte de cada fase en el Órbita. mediante la plantilla DOC_15.
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
                    <span class="text-[11px] text-slate-400 font-mono">Órbita.</span>
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
                            badgeHtml = doc?.returnByTeacher
                                ? '<span style="background-color: #ef4444 !important; color: #ffffff !important; font-weight: 900 !important;" class="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">🚨 Subsanar (Docente)</span>'
                                : `<span style="background-color: #ef4444 !important; color: #ffffff !important; font-weight: 900 !important;" class="text-[9px] uppercase px-1.5 py-0.5 rounded font-mono">↩️ Turno de: ${this.escapeHTML(shortDeptName)}</span>`;
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
            myRolePhaseDefs = phaseDefs.filter(d => docs[d.key] && (docs[d.key].status === 'SUBMITTED_TO_CEO' || ((docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO') && Boolean(docs[d.key].returnByTeacher))));
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
                    ${isCEO ? `🟡 Pendientes CEO (${myRolePhaseDefs.length})` : `🎯 Mis Entregables (${myRolePhaseDefs.length})`}
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
                const isTeacherReturn = !!docObj?.returnByTeacher;
                let returnBannerHtml = '';
                if (isReturned) {
                    const retReason = docObj.returnReason || docObj.returnReasonId || 'El documento requiere correcciones antes de su evaluación.';
                    const originLabel = isTeacherReturn
                        ? `Devuelto por Claustro Docente (${docObj.returnByTeacherRole || 'Profesorado'})`
                        : 'Devuelto por Dirección (CEO)';
                    const instructionMsg = isTeacherReturn
                        ? 'Subsanad las observaciones en Google Docs y el CEO podrá pulsar [ 🔄 Reenviar Subsanado al Docente ] (o el departamento subir un enlace nuevo para visado CEO).'
                        : 'Subsanad las observaciones en vuestro Google Doc y pulsad [ Reenviar al CEO ] para continuar la evaluación.';
                    returnBannerHtml = `
                    <div role="alert" class="bg-red-950/70 border-2 border-red-500 p-3 sm:p-4 mb-3 rounded shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 tracking-wider">⚠️ REVISIÓN REQUERIDA // SUBSANACIÓN</span>
                            <span class="text-[11px] text-red-300 font-mono">${this.escapeHTML(originLabel)}</span>
                        </div>
                        <p class="text-xs text-white font-bold mb-2 break-words">Motivo de Devolución: <span class="text-amber-300 font-normal italic">"${this.escapeHTML(retReason)}"</span></p>
                        ${docObj.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(docObj.returnDriveUrl)) ? `
                            <div class="mb-2">
                                <a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(docObj.returnDriveUrl) : encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/60 border border-red-400 text-white font-bold rounded hover:bg-red-800 transition-colors font-mono">
                                    <span>📄 Ver Correcciones Marcadas en Docs ↗</span>
                                </a>
                            </div>
                        ` : ''}
                        <p class="text-[11px] text-slate-300 font-mono">${instructionMsg}</p>
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
                } else if (isCEO && isReturned && isTeacherReturn) {
                    const deptLabel = this.escapeHTML((def.role || '').replace('_', ' '));
                    actionControlsHtml = `
                    <div class="space-y-2 pt-2 border-t border-red-900/50">
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button type="button" onclick="ui.modalCeoResubmitDeliverable('${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 bg-amber-400 text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_12px_rgba(255,204,0,0.35)]">[ 🔄 REENVIAR DOCUMENTO SUBSANADO AL DOCENTE ]</button>
                        </div>
                        ${!canRoleEdit ? `<p class="text-[10px] font-mono text-slate-400">También puede subir un enlace nuevo el departamento responsable (<strong>${deptLabel}</strong>) para que vuelva a tu bandeja de visado.</p>` : ''}
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
                    const submitVerb = (isCEO && def.role === 'CEO') ? 'AL DOCENTE' : 'AL CEO';
                    actionControlsHtml = `
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                        <button type="button" onclick="ui.modalSubmitRoleDeliverable('${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 ${isReturned ? 'bg-amber-400 text-black hover:bg-white' : 'bg-mars-cyan text-black hover:bg-white'} font-black uppercase text-xs px-4 py-2 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)]">
                            ${isReturned ? `[ ✏️ SUBSANAR ENLACE Y REENVIAR ${submitVerb} ]` : (docObj?.driveUrl ? '[ ✏️ ACTUALIZAR ENLACE DRIVE ]' : `[ 📤 SUBIR ENLACE DRIVE Y ENVIAR ${submitVerb} ]`)}
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

    modalCeoResubmitDeliverable(docKey) {
        if (!state.user || !state.user.coId) return;
        const co = state.data.companies?.[state.user.coId];
        if (!co || this.getEffectiveRole(co) !== 'CEO') {
            return this.notify("Solo el CEO puede reenviar entregables subsanados al docente.", "warning");
        }
        const def = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).find(d => d.key === docKey);
        if (!def) return;
        const docObj = co.deliverables?.[docKey];
        if (!docObj || !docObj.returnByTeacher || (docObj.status !== 'CEO_REVISION' && docObj.status !== 'DEVUELTO_A_TECNICO')) {
            return this.notify("Este entregable ya fue reenviado o no tiene pendiente una subsanación docente.", "warning");
        }

        const existingUrl = docObj.driveUrl || '';
        const teacherRole = docObj.returnByTeacherRole || 'Claustro';
        const retReason = docObj.returnReason || docObj.returnReasonId || 'Requiere subsanación docente.';
        const safeRetDocHref = (docObj.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(docObj.returnDriveUrl)))
            ? (this.sanitizeDriveUrl ? this.sanitizeDriveUrl(docObj.returnDriveUrl) : encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;'))
            : '';

        const bodyHtml = `
        <div class="space-y-4 font-mono text-xs">
            <div class="bg-slate-900 border border-mars-cyan/40 p-3 text-slate-200">
                <span class="text-mars-cyan font-bold uppercase block mb-1">SUBSANACIÓN DOCENTE // FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(def.key) : (def.phase || 'I')} · ${this.escapeHTML(def.subject)}</span>
                <p class="font-bold text-white uppercase text-sm">${this.escapeHTML(def.name)}</p>
                <p class="text-slate-400 mt-0.5">Dpto. Responsable: <span class="text-mars-yellow font-bold">${this.escapeHTML(def.role.replace('_', ' '))}</span></p>
            </div>

            <div class="bg-red-950/60 border border-red-500 p-3 text-red-200 space-y-1.5">
                <strong class="uppercase text-red-300 block">⚠️ Revisión solicitada por Docente (${this.escapeHTML(teacherRole)}):</strong>
                <p class="italic text-white">"${this.escapeHTML(retReason)}"</p>
                ${safeRetDocHref ? `<a href="${safeRetDocHref}" target="_blank" rel="noopener noreferrer" class="mt-1 min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-900/70 border border-red-400 text-white font-bold rounded hover:bg-red-800 transition-colors"><span>📄 Ver Correcciones del Docente en Docs ↗</span></a>` : ''}
            </div>

            <div class="p-3 bg-amber-950/35 border-2 border-amber-400/70 rounded space-y-2 mb-2">
                <div class="flex items-start gap-2">
                    <span class="text-base shrink-0">🔐</span>
                    <div class="text-xs font-sans text-amber-100 leading-snug">
                        <strong class="text-amber-300 uppercase font-mono block text-[11px]">PASO 1 OBLIGATORIO — Permisos de Lectura en Google Drive:</strong>
                        <span>En tu Google Doc/Drive pulsa <strong>Compartir</strong> ➔ Acceso general ➔ <strong>«Fomento centros de enseñanza (Lector)»</strong>.</span>
                    </div>
                </div>
                <label class="mars-checkbox-label text-xs text-white font-bold cursor-pointer bg-black/50 border border-amber-500/40 px-2.5 py-1.5 rounded w-full">
                    <input type="checkbox" id="ceo-resubmit-perm-check" class="mars-touch-input">
                    <span class="mars-checkbox-visual"></span>
                    <span class="text-[11px] font-sans">✓ He comprobado que el documento está compartido con «Fomento centros de enseñanza (Lector)»</span>
                </label>
            </div>

            <div class="space-y-2">
                <label for="ceo-resubmit-drive-input" class="text-xs text-mars-cyan uppercase font-bold block">Paso 2: Enlace del Documento Subsanado en Google Drive / Docs</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="ceo-resubmit-drive-input" value="${this.escapeAttr(existingUrl)}" placeholder="https://docs.google.com/document/d/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 bg-black border-2 border-mars-cyan p-3 text-base sm:text-xs text-mars-cyan font-mono outline-none focus:shadow-neon-cyan min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('ceo-resubmit-drive-input') : ''}
                </div>
                <p class="text-[11px] text-slate-300 font-sans">Si ya corregisteis el mismo Google Doc o arreglasteis sus permisos de lectura, deja este enlace tal cual; si creasteis un documento nuevo, pégalo aquí.</p>
            </div>
        </div>`;

        const actionsHtml = `
            <button type="button" id="btn-ceo-resubmit-doc" onclick="ui.confirmCeoResubmitDeliverable('${this.escapeAttr(docKey)}')" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-xs px-5 py-2.5 hover:bg-white transition-all shadow-sm">
                [ 🔄 Reenviar Documento Subsanado al Docente ]
            </button>
        `;

        this.showModal(`Reenviar Subsanado: ${def.shortName || def.name}`, bodyHtml, actionsHtml);
    },

    async confirmCeoResubmitDeliverable(docKey) {
        const inputEl = document.getElementById('ceo-resubmit-drive-input');
        const permCheckEl = document.getElementById('ceo-resubmit-perm-check');
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
            return this.notify("Marca la casilla confirmando que el documento tiene permisos de lectura en Google Drive.", "warning");
        }
        const btn = document.getElementById('btn-ceo-resubmit-doc');
        if (btn && btn.disabled) return;
        if (btn) {
            btn.disabled = true;
            btn.innerText = '⏳ Reenviando...';
        }
        this.closeModal();
        await state.resubmitDeliverableByCEO(docKey, url);
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
                        Fecha límite de emisión: <strong>${this.escapeHTML(phaseDef.deadlineLabel)}</strong> (7 días de cortesía tras corte de fase). Sintetiza los avances de todas las áreas antes de su publicación en el Órbita..
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
        const actions = `<button type="button" onclick="ui.submitPressRelease('${this.escapeHTML(phaseDef.phase)}')" class="min-h-[44px] bg-mars-cyan text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">[ 📰 Publicar en Órbita. ]</button>`;
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
        const wasReturned = Boolean(prevPr && prevPr.status === 'RETURNED');
        co.pressReleases = co.pressReleases || {};
        co.pressReleases[phaseKey] = {
            id: 'PR-' + coId + '-' + phaseKey,
            phase: phaseKey,
            status: 'PENDING_REVIEW',
            returnReason: '',
            returnDriveUrl: '',
            resubmittedAfterTeacherReturn: wasReturned,
            resubmittedAt: wasReturned ? nowTs : 0,
            title: `Nota de Prensa Oficial Fase ${phaseKey} — ${co.name}`,
            driveUrl: driveUrl,
            publishedAt: nowTs,
            updatedAt: nowTs,
            publishedDate: new Date().toLocaleDateString(),
            author: this.getActorRoleLabel ? this.getActorRoleLabel(co) : 'CEO'
        };
        co.updatedAt = nowTs;

        // Registro en listado global para el Órbita. (pendiente de aprobación LEN / COORD)
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
        this.notify("✅ Nota de Prensa enviada a Lengua y Coordinación. Coordinación podrá redactar la noticia en Órbita tras revisar vuestro documento.", "success");
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

    processNanoBananaImageFile(inputEl, targetHiddenId, previewContainerId, clearUrlId = null, opts = null) {
        if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
        const file = inputEl.files[0];
        if (!file.type.startsWith('image/')) {
            return this.notify("Por favor, selecciona un archivo de imagen válido (PNG, JPG, WEBP).", "warning");
        }
        const maxDim = Number(opts?.maxDim) || 1000;
        const quality = Number(opts?.quality) || 0.85;
        const keepOrigBytes = Number(opts?.keepOriginalUnderBytes) || (220 * 1024);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                let w = img.width || maxDim;
                let h = img.height || maxDim;
                let outDataUrl = '';

                if (file.size <= keepOrigBytes && w <= maxDim && h <= maxDim && typeof e.target?.result === 'string') {
                    outDataUrl = e.target.result;
                } else {
                    if (w > maxDim || h > maxDim) {
                        if (w > h) {
                            h = Math.max(1, Math.round((h * maxDim) / w));
                            w = maxDim;
                        } else {
                            w = Math.max(1, Math.round((w * maxDim) / h));
                            h = maxDim;
                        }
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, w, h);
                    }
                    outDataUrl = canvas.toDataURL('image/webp', quality) || canvas.toDataURL('image/jpeg', quality);
                }

                const hiddenInput = document.getElementById(targetHiddenId);
                if (hiddenInput) hiddenInput.value = outDataUrl;
                if (clearUrlId) {
                    const urlInput = document.getElementById(clearUrlId);
                    if (urlInput) urlInput.value = '';
                }

                const previewEl = document.getElementById(previewContainerId);
                if (previewEl) {
                    previewEl.innerHTML = `
                        <div class="relative group mt-2 border border-amber-400/50 rounded overflow-hidden max-h-48 bg-black flex items-center justify-center">
                            <img src="${outDataUrl}" alt="Vista previa Nano Banana 3" class="max-h-48 w-full object-contain">
                            <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] text-amber-300 font-mono px-1.5 py-0.5 rounded border border-amber-500/40">✓ ${w}×${h} px · Alta calidad</span>
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
        const driveMatch = cleanUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i)
            || cleanUrl.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
        const directSrc = (driveMatch && driveMatch[1])
            ? `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`
            : cleanUrl;
        const proxySrc = (!driveMatch && /^https?:\/\//i.test(cleanUrl)) ? ('/api/news/image?url=' + encodeURIComponent(cleanUrl)) : '';
        previewEl.innerHTML = `
            <div class="relative group mt-2 border border-cyan-400/50 rounded overflow-hidden max-h-48 bg-black flex items-center justify-center">
                <img src="${this.escapeAttr(directSrc)}" alt="Vista previa" data-proxy="${this.escapeAttr(proxySrc)}" class="max-h-48 w-full object-contain" onerror="if(this.dataset.proxy && !this.dataset.triedProxy){this.dataset.triedProxy='1';this.src=this.dataset.proxy;return;}this.onerror=null;this.parentElement.innerHTML='<span class=\\'text-xs text-red-400 p-2 font-mono\\'>No se pudo cargar la imagen desde la URL. Comprueba el enlace o descarga la foto y súbela como archivo.</span>'">
                <span class="absolute bottom-1 right-1 bg-black/80 text-[10px] text-cyan-300 font-mono px-1.5 py-0.5 rounded border border-cyan-500/40">${driveMatch ? 'Google Drive' : 'Enlace URL'}</span>
            </div>
        `;
        previewEl.classList.remove('hidden');
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
