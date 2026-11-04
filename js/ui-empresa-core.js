// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN EN 2 PASOS (ZERO-KNOWLEDGE), NOTIFICACIONES Y DOSSIER ACADÉMICO (v1.1.44) ---

Object.assign(ui, {
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
                <p class="text-xs text-mars-yellow font-mono tracking-wider">⚠️ MODO LOCAL // SIN CONEXIÓN CON NUBE D1</p>
            </div>
        `;

        const rgpdClauseHtml = `
            <div class="mt-4 text-center">
                <button type="button" id="btn-open-rgpd-modal" onclick="ui.openRgpdModal()" class="min-h-[44px] min-w-[44px] px-3 py-2 text-xs text-slate-300 hover:text-mars-cyan font-mono tracking-wider transition-colors inline-flex items-center justify-center">
                    [ 🛡️ PROTOCOLO RGPD / ART. 13 ]
                </button>
            </div>
        `;

        // PASO 1: Solicitud de Código Privado de Empresa (Pasarela Docente oculta tras doble clic/tap en #marsket-logo)
        if (!verifiedCoId) {
            el.innerHTML = `
            ${scanlineHtml}
            <div id="login-box" class="w-full max-w-md terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto" style="max-width: 28rem;">
                <img id="marsket-logo" src="logo.png" alt="Logo oficial MARS-KET 2.0" width="96" height="96" 
                    onclick="auth.handleLogoTrigger(event)" ondblclick="auth.handleLogoTrigger(event)" 
                    style="touch-action: manipulation; width: clamp(72px, 12vh, 96px); height: clamp(72px, 12vh, 96px); aspect-ratio: 1/1;" 
                    class="mx-auto mb-2.5 sm:mb-4 drop-shadow-[0_0_16px_rgba(0,240,255,0.75)] hover:drop-shadow-[0_0_24px_rgba(0,240,255,0.95)] transition-all duration-300 cursor-pointer select-none object-contain" 
                    onerror="this.onerror=null;this.src='logo.png';">
                <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-sm sm:text-base tracking-wider uppercase font-black mb-1" style="font-size: clamp(0.95rem, 2.2vh, 1.2rem);">SECURE_GATEWAY</h2>
                <p class="text-xs text-slate-300 text-center uppercase tracking-normal sm:tracking-wider mb-3 sm:mb-4">Paso 1/2: Identificación de Entidad</p>
                
                <div class="bg-black/60 border border-mars-border p-3 sm:p-4">
                    <label for="login-company-code" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5 tracking-wider">Código Privado de Empresa</label>
                    <input type="text" id="login-company-code" autocomplete="off" placeholder="EJ: AST-1010" style="touch-action: manipulation; font-size: 16px;" onkeydown="if(event.key==='Enter') auth.validateCompanyCode()" onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full bg-slate-900 border border-mars-cyan/60 p-2.5 sm:p-3 text-center font-orbitron font-black uppercase tracking-widest text-mars-yellow outline-none focus:border-mars-cyan mb-3 min-h-[48px]">
                    <button type="button" onclick="auth.validateCompanyCode()" style="touch-action: manipulation;" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-3 text-xs uppercase tracking-normal sm:tracking-wider hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] whitespace-nowrap">[ VALIDAR CÓDIGO ]</button>
                </div>
                ${rgpdClauseHtml}
                ${offlineHtml}
            </div>`;
            setTimeout(() => document.getElementById('login-company-code')?.focus(), 50);
            return;
        }

        // PASO 2: Selección de Departamento y Teclado PIN (Solo para la entidad ya validada)
        const isTeacher = verifiedCoId === 'admin';
        const entityLabel = isTeacher 
            ? 'CLAUSTRO DOCENTE' 
            : (state.data.companies[verifiedCoId]?.name || 'STARTUP');

        el.innerHTML = `
        ${scanlineHtml}
        <div id="login-box" class="w-full max-w-md terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto" style="max-width: 28rem;">
            <!-- Sub-barra superior de navegación compacta -->
            <div class="flex justify-between items-center border-b border-mars-border/60 pb-2 mb-2.5">
                <span class="text-[11px] font-mono text-mars-cyan uppercase tracking-wider flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-mars-cyan animate-pulse" aria-hidden="true"></span>
                    Paso 2/2 // Terminal PIN
                </span>
                <button type="button" onclick="auth.resetCompanyStep()" class="min-h-[36px] text-xs text-mars-magenta hover:text-white uppercase font-bold tracking-normal border border-mars-magenta/50 px-2.5 py-1 hover:bg-mars-magenta/20 transition-all whitespace-nowrap">
                    [⬅ Cambiar]
                </button>
            </div>

            <!-- Logo centrado de alta visibilidad + Tarjeta de Entidad Verificada -->
            <div class="text-center mb-2.5">
                <img id="marsket-logo-step2" src="logo.png" alt="Logo oficial MARS-KET 2.0" width="60" height="60"
                    onclick="auth.handleLogoTrigger(event)" ondblclick="auth.handleLogoTrigger(event)"
                    style="touch-action: manipulation; width: clamp(48px, 7vh, 60px); height: clamp(48px, 7vh, 60px); aspect-ratio: 1/1;"
                    class="mx-auto mb-1.5 drop-shadow-[0_0_12px_rgba(0,240,255,0.75)] hover:drop-shadow-[0_0_20px_rgba(0,240,255,0.95)] transition-all duration-300 cursor-pointer select-none object-contain"
                    onerror="this.onerror=null;this.src='logo.png';">
                <div class="bg-slate-900/90 border ${isTeacher ? 'border-mars-yellow' : 'border-mars-cyan'} py-1.5 px-3">
                    <p class="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Entidad Verificada</p>
                    <h2 id="login-title" class="font-orbitron ${isTeacher ? 'text-mars-yellow' : 'text-mars-cyan'} text-sm sm:text-base tracking-wider uppercase font-black truncate">${this.escapeHTML(entityLabel)}</h2>
                </div>
            </div>

            <label for="login-role" class="text-xs text-slate-300 uppercase font-bold block mb-1">Selecciona tu Departamento / Rol</label>
            <select id="login-role" onchange="auth.clear()" style="touch-action: manipulation; font-size: 16px;" class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-2.5 text-xs sm:text-sm mb-3 outline-none focus:border-mars-cyan uppercase text-white font-bold"></select>
            
            <div class="flex justify-center gap-3 mb-3" role="status" aria-label="Indicador de dígitos de PIN introducidos">
                ${[1,2,3,4].map(() => `<div class="pin-dot w-3.5 h-3.5 rounded-full border-2 border-mars-cyan transition-all"></div>`).join('')}
            </div>
            <div id="login-keypad" role="group" style="touch-action: manipulation;" aria-label="Teclado numérico de PIN (también admite teclado físico 0-9, Backspace y Enter)" class="grid grid-cols-3 gap-2 max-w-[240px] mx-auto transition-all">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" aria-label="Dígito ${n}" onclick="auth.press('${n}')" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-slate-700 p-2.5 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                <button type="button" aria-label="Borrar PIN" onclick="auth.clear()" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-mars-magenta/50 p-2 text-mars-magenta text-xs font-black hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                <button type="button" aria-label="Dígito 0" onclick="auth.press('0')" style="touch-action: manipulation;" class="min-h-[44px] bg-slate-800 border border-slate-700 p-2.5 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                <button type="button" aria-label="Confirmar PIN" onclick="auth.verify()" style="touch-action: manipulation;" class="min-h-[44px] bg-mars-green/20 border border-mars-green text-mars-green p-2 text-xs font-black hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
            </div>
            <p class="text-xs text-slate-400 text-center uppercase mt-2.5">Soporta teclado numérico físico (0-9, Backspace, Enter)</p>
            ${rgpdClauseHtml}
            ${offlineHtml}
        </div>`;
        setTimeout(() => auth.updateRoleOptions(), 30);
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
        const myNotifs = co.notifications.filter(n => n.role === state.user.role && !n.read);
        if (myNotifs.length === 0) return '';
        
        return `<div class="mb-6 space-y-2 animate-in fade-in slide-in-from-top-4" role="region" aria-label="Notificaciones operativas">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-mono uppercase text-slate-400">Avisos y Notificaciones (${myNotifs.length})</span>
                <button type="button" onclick="ui.dismissAllRoleNotifications()" class="min-h-[36px] bg-slate-900 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-1 text-xs font-bold uppercase transition-all">[ 🧹 Borrar Todos los Avisos ]</button>
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
                        <button type="button" aria-label="Descartar notificación" onclick="ui.dismissNotification('${this.escapeHTML(n.id)}')" class="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center font-black hover:text-white transition-colors text-xs border border-current/40 shrink-0" title="Descartar">✕</button>
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
        const notif = co.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            notif.updatedAt = Date.now();
            if (id && !state.data.dismissedNotificationIds.includes(String(id))) {
                state.data.dismissedNotificationIds.push(String(id));
            }
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
        (co.notifications || []).forEach(n => {
            if (n && n.role === state.user.role && !n.read) {
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
                    <span class="text-slate-300 pr-2">${this.escapeHTML(c.name)} (${Math.round(c.weight*100)}%)</span>
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
            const activeDefs = (!isAdmin) ? defs.filter(d => !ui.isDeliverableLocked(d.key, co)) : defs;
            const deliveredCount = activeDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
            const activeGroup = this.activeMilestoneGroup || 'PHASE_I';
            const isCEO = state.user && state.user.role === 'CEO';

            const pDefs = typeof PROJECT_PHASES_DEF !== 'undefined' ? PROJECT_PHASES_DEF : {};
            const milestonePhases = [
                {
                    id: 'PHASE_I',
                    phaseCode: 'I',
                    title: pDefs.I ? pDefs.I.name : 'FASE I: PREPARACIÓN, IDENTIDAD Y PRESUPUESTO INICIAL',
                    desc: pDefs.I ? pDefs.I.desc : '',
                    badge: 'FASE I // INICIO: 02/11/2026',
                    accent: 'border-mars-cyan text-mars-cyan'
                },
                {
                    id: 'PHASE_II',
                    phaseCode: 'II',
                    title: pDefs.II ? pDefs.II.name : 'FASE II: ANÁLISIS MATEMÁTICO Y LANZAMIENTOS DE PRUEBA',
                    desc: pDefs.II ? pDefs.II.desc : '',
                    badge: 'FASE II // INICIO: 15/12/2026',
                    accent: 'border-mars-yellow text-mars-yellow'
                },
                {
                    id: 'PHASE_III',
                    phaseCode: 'III',
                    title: pDefs.III ? pDefs.III.name : 'FASE III: DOCUMENTACIÓN TÉCNICA, BALANCE Y MODELO DE NEGOCIO',
                    desc: pDefs.III ? pDefs.III.desc : '',
                    badge: 'FASE III // INICIO: 15/02/2027',
                    accent: 'border-blue-400 text-blue-400'
                },
                {
                    id: 'PHASE_IV',
                    phaseCode: 'IV',
                    title: pDefs.IV ? pDefs.IV.name : 'FASE IV: CIERRE FORMAL, DOSSIER DE INVERSIÓN Y CUENTA DE RESULTADOS',
                    desc: pDefs.IV ? pDefs.IV.desc : '',
                    badge: 'FASE IV // INICIO: 31/03/2027',
                    accent: 'border-mars-magenta text-mars-magenta'
                }
            ];

            const visiblePhases = milestonePhases.map(phase => {
                let phaseDefs = defs.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === phase.phaseCode);
                if (!isAdmin) {
                    phaseDefs = phaseDefs.filter(def => !ui.isDeliverableLocked(def.key, co));
                }
                return { ...phase, phaseDefs };
            }).filter(phase => isAdmin || phase.phaseDefs.length > 0);

            const accordionsHtml = visiblePhases.length === 0
                ? `<div class="p-6 bg-slate-900/60 border border-slate-800 text-center rounded"><span class="text-xs font-mono uppercase text-slate-400">🔒 No hay entregables ni fases activas en este momento. Se habilitarán según el cronograma oficial.</span></div>`
                : visiblePhases.map(phase => {
                const phaseDefs = phase.phaseDefs;
                const phaseDelivered = phaseDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
                const isExpanded = activeGroup === phase.id;

                const itemsHtml = phaseDefs.map(def => {
                    const docKey = def.key;
                    const docObj = docs[def.key];
                    const st = docObj ? (docObj.status || 'DELIVERED_TO_TEACHER') : null;
                    const sched = (state.data.config?.deliverableSchedule && state.data.config.deliverableSchedule[docKey]) || {};
                    const openDate = sched.openDate || def.defaultOpenDate;
                    const isLocked = Boolean(openDate && !isNaN(new Date(openDate).getTime()) && (new Date() < new Date(openDate)));
                    const dlDate = sched.deadline || (state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? (sched.deadline || state.data.config.deadlines[def.key]) : def.defaultDate;
                    const dlStatus = this.getDeadlineStatus(dlDate);

                    const lockBadge = isLocked
                        ? `<span class="text-xs font-mono font-bold text-mars-yellow bg-mars-yellow/10 border border-mars-yellow/30 px-2 py-0.5 rounded">🔒 BLOQUEADO HASTA ${new Date(openDate).toLocaleString()}</span>`
                        : `<span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">🟢 ACTIVO / EN PLAZO</span>`;

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
                    if (isCEO && docObj && (st === 'SUBMITTED_TO_CEO' || st === 'CEO_REVISION')) {
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
                            ${docObj ? `<a href="${this.escapeHTML(docObj.driveUrl || docObj.url || docObj.dataUrl || '#')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-3 py-2 hover:bg-white transition-all flex items-center justify-center">🔗 ABRIR</a>` : ''}
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
            <div class="terminal-border bg-mars-card border-l-4 border-mars-green p-4 bg-slate-900/70">
                <div class="flex items-center gap-2 flex-wrap mb-1">
                    <span class="text-xs font-black uppercase px-2 py-0.5 border border-mars-green text-mars-green bg-black">FASE V // 19/05/2027</span>
                    <span class="text-xs text-mars-green font-mono font-bold uppercase">🏆 EVENTO CULMINANTE</span>
                </div>
                <h4 class="font-orbitron font-black text-xs sm:text-sm text-white uppercase tracking-wider">${pDefs.V ? this.escapeHTML(pDefs.V.name) : 'Fase V: Concurso Final'}</h4>
                <p class="text-xs text-slate-300 mt-1">${pDefs.V ? this.escapeHTML(pDefs.V.desc) : 'Culminación del proyecto con la celebración del Concurso Final (19/05/2027).'}</p>
            </div>`;

            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-4 mb-6 border-l-4 border-l-mars-cyan flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-sm uppercase">Bóveda Oficial de Entregables por Hitos (Milestone Collapsible)</h3>
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
        const isCEO = role === 'CEO';
        const isAux = role === 'AUXILIAR';

        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const docs = co.deliverables || {};
        const pendingCeoDeliverables = Object.values(docs).filter(d => d && d.status === 'SUBMITTED_TO_CEO').length;
        const returnedDeliverables = Object.values(docs).filter(d => d && (d.status === 'CEO_REVISION' || d.status === 'DEVUELTO_A_TECNICO')).length;
        const deliveredCount = Object.values(docs).filter(d => d && d.status === 'DELIVERED_TO_TEACHER').length;

        // Órdenes pendientes
        const pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS').length;
        let pendingMktActions = 0;
        (co.marketingCampaigns || []).forEach(c => {
            (c.executedActions || []).forEach(a => {
                if (a.status === 'PENDIENTE_CEO') pendingMktActions++;
            });
        });

        const submittedCeoDefs = defs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO');
        let ceoTrayHtml = '';
        if (isCEO) {
            ceoTrayHtml = `
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-yellow shadow-[0_0_15px_rgba(255,204,0,0.15)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3 mb-4">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-mars-yellow/20 border border-mars-yellow text-mars-yellow ${submittedCeoDefs.length > 0 ? 'animate-pulse' : ''}">SUPERVISIÓN DIRECTIVA</span>
                            <span class="text-xs text-slate-400 font-mono">${submittedCeoDefs.length} PENDIENTES DE VISADO</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-tight">
                            📋 Bandeja de Visado Ejecutivo
                        </h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Revisa, visa y eleva al claustro o devuelve con justificación técnica los entregables del equipo.</p>
                    </div>
                    <button type="button" onclick="ui.navigate('role_deliverables')" class="shrink-0 w-full sm:w-auto justify-center min-h-[44px] bg-slate-900 border border-mars-yellow text-mars-yellow hover:bg-mars-yellow hover:text-black font-black uppercase text-xs px-4 py-2 transition-all whitespace-nowrap text-center">
                        Ver Mis Entregables ➔
                    </button>
                </div>
                ${submittedCeoDefs.length === 0 ? `
                    <div class="p-6 bg-slate-900/60 border border-slate-800 text-center rounded">
                        <p class="text-xs font-mono text-emerald-400 uppercase font-bold">✨ Todos los entregables departamentales están al día o ya visados.</p>
                        <p class="text-[11px] text-slate-400 mt-1">Cuando los departamentos (Técnico, Finanzas, Marketing, Operaciones) envíen sus borradores, aparecerán aquí para tu firma o devolución.</p>
                    </div>
                ` : `
                    <div class="space-y-3">
                        ${submittedCeoDefs.map(d => {
                            const doc = docs[d.key];
                            return `
                            <div class="bg-slate-900/90 border border-amber-500/50 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                <div class="min-w-0 flex-grow">
                                    <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')}</span>
                                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">Resp: ${this.escapeHTML(d.role.replace('_', ' '))}</span>
                                        <span class="text-xs text-slate-400 font-mono">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                                    </div>
                                    <h4 class="text-white font-bold text-sm uppercase leading-snug">${this.escapeHTML(d.name)}</h4>
                                    <div class="mt-2.5 flex flex-wrap items-center gap-2">
                                        ${this.renderDocTemplateBtn(d.key)}
                                        ${doc?.driveUrl ? `
                                            <a href="${encodeURI(doc.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
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
                `}
            </div>`;
        }

        const pendingSpecialItems = (co.specialItemRequests || []).filter(r => r.status === 'PENDIENTE_CEO');
        let ceoSpecialItemsHtml = '';
        if (isCEO && pendingSpecialItems.length > 0) {
            ceoSpecialItemsHtml = `
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.15)]">
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
                                    <a href="${encodeURI(item.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
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

        let ceoGovernanceModulesHtml = '';
        if (isCEO) {
            const license = co.launchLicense;
            const isMasterOrAdmin = Boolean(state.user?.admin || co.unlockAllContracts === true || co.isTestCompany === true || co.id === 'TEST-0000');
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
                        licenseCardHtml = `
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
                                    <span>El Departamento Técnico debe elaborar y subir previamente el <strong>Informe Técnico Preliminar (DOC FYQ)</strong> para habilitar el trámite de la licencia.</span>
                                </div>
                            </div>
                            <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                                <span class="text-[11px] text-slate-400 font-mono">DOC_14 AESA</span>
                                <button type="button" disabled class="min-h-[44px] bg-slate-900 border border-slate-700 text-slate-500 font-bold uppercase text-xs px-4 py-2 cursor-not-allowed">[ 🔒 Requiere Informe Preliminar ]</button>
                            </div>
                        </div>`;
                    }
                } else {
                    licenseCardHtml = `
                    <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-yellow flex flex-col justify-between hover:border-mars-yellow transition-all">
                        <div>
                            <div class="flex justify-between items-center mb-2 flex-wrap gap-1">
                                <span class="text-xs font-black uppercase text-mars-yellow bg-mars-yellow/10 border border-mars-yellow/40 px-2 py-0.5">SEGURIDAD AEROESPACIAL</span>
                                <div class="flex items-center gap-1.5">
                                    ${(co.id === 'TEST-0000' || co.isTestCompany) ? `<span class="px-1.5 py-0.2 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase rounded">🧪 Sandbox Desbloqueado</span>` : `<span class="text-[10px] text-emerald-400 font-mono">✓ Informe Preliminar Entregado</span>`}
                                    <span class="text-xs font-mono text-amber-400">Tasa: 50 €v</span>
                                </div>
                            </div>
                            <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia de Lanzamiento AESA (Fase II)</h3>
                            <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                                Los lanzamientos en el banco de pruebas están bloqueados para Técnico y Operaciones. Tramita y firma la Solicitud AESA (DOC_14) con tasa de 50 €v para validación del Claustro.
                            </p>
                        </div>
                        <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                            <span class="text-[11px] text-slate-400 font-mono">DOC_14 AESA</span>
                            <button type="button" onclick="ui.modalLaunchLicense()" class="min-h-[44px] bg-mars-yellow text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">[ 🚀 Tramitar Licencia AESA (50 €v) ]</button>
                        </div>
                    </div>`;
                }
            } else if (license.status === 'PENDIENTE_DOCENTE') {
                licenseCardHtml = `
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-amber-400 flex flex-col justify-between hover:border-amber-400 transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">EN EVALUACIÓN DOCENTE</span>
                            <span class="text-xs font-mono text-emerald-400 font-bold">50 €v Abonados</span>
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
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-emerald-400 flex flex-col justify-between hover:border-emerald-400 transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5">AUTORIZADA</span>
                            <span class="text-xs font-mono text-emerald-400 font-bold">Vuelos Activos</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">🚀 Licencia AESA Autorizada</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed font-sans">
                            Permiso oficial de vuelo y seguridad concedido por Coordinación Docente. El banco de pruebas se encuentra 100% operativo.
                        </p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <a href="${encodeURI(license.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-xs text-emerald-300 underline font-mono">Ver DOC_14 Concedido ↗</a>
                        <span class="text-xs text-emerald-400 font-mono font-bold">✓ Operativo</span>
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

            const pressReleaseCardHtml = `
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
                                        ${!isPrUnlocked ? `<span class="px-1.5 py-0.2 bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-mono uppercase font-bold">🔒 Bloqueada hasta Cierre</span>` : ''}
                                    </div>
                                    <span class="text-[10px] text-slate-400 font-mono">Plazo Máximo: ${this.escapeHTML(p.deadlineLabel)}</span>
                                    ${phaseBalance ? `
                                        <div class="mt-1">
                                            <span class="inline-flex items-center gap-1 text-[10px] text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
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
                                    ${published ? `
                                        <div class="flex items-center gap-2">
                                            <span class="text-[10px] text-emerald-400 font-bold uppercase bg-emerald-950/40 border border-emerald-500/40 px-1.5 py-0.5">✓ Publicada</span>
                                            <a href="${encodeURI(published.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-[11px] text-cyan-300 underline font-mono">Ver DOC_15 ↗</a>
                                        </div>
                                    ` : (!isPrUnlocked ? `
                                        <button type="button" disabled class="min-h-[36px] bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase text-[11px] px-2.5 py-1 cursor-not-allowed" title="Disponible a partir del ${this.escapeHTML(p.phaseCutoffLabel || '')}">
                                            🔒 Bloqueada hasta ${this.escapeHTML(p.phaseCutoffLabel || '')}
                                        </button>
                                    ` : `
                                        <div class="flex items-center gap-1">
                                            ${isMasterOrAdmin && p.phaseCutoff && Date.now() < new Date(p.phaseCutoff).getTime() ? `<span class="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase rounded">🧪 Sandbox</span>` : ''}
                                            <button type="button" onclick="ui.modalPublishPressRelease('${this.escapeHTML(p.phase)}')" class="min-h-[36px] bg-cyan-950/60 border border-cyan-400 text-cyan-300 hover:bg-cyan-400 hover:text-black font-bold uppercase text-[11px] px-2.5 py-1 transition-all">
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

            ceoGovernanceModulesHtml = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                ${licenseCardHtml}
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

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-6';
        wrapper.innerHTML = `
            ${crisisHtml}

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
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        ${isCEO ? `<button type="button" onclick="ui.modalCreateAuxRole()" class="min-h-[44px] flex-1 sm:flex-initial bg-slate-900 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all whitespace-nowrap">[ 👥 Gestionar Auxiliar ]</button>` : ''}
                        <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] flex-1 sm:flex-initial bg-mars-cyan text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] whitespace-nowrap">[ 📤 Mis Entregables ]</button>
                    </div>
                </div>

                <!-- KPIs RÁPIDOS -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Tesorería Virtual</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-mars-green">${Number(co.balance).toFixed(2)} €v</p>
                        <span class="text-[10px] text-slate-500 font-mono">Saldo disponible</span>
                    </div>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Coste Neto Operativo</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-mars-cyan">${netOpCosts.toFixed(2)} €v</p>
                        <span class="text-[10px] text-slate-500 font-mono">${sponsorAmt > 0 ? `Patrocinio: -${sponsorAmt.toFixed(2)} €v` : 'Sin patrocinios'}</span>
                    </div>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Progreso Hitos</span>
                        <p class="text-base sm:text-xl font-orbitron font-black text-amber-400">${deliveredCount} / ${defs.length}</p>
                        <span class="text-[10px] text-slate-500 font-mono">Entregados al claustro</span>
                    </div>
                    <div class="bg-black/50 p-3 sm:p-4 border border-slate-800">
                        <span class="text-[10px] sm:text-xs text-slate-400 font-bold uppercase block mb-1">Visados CEO Pendientes</span>
                        <p class="text-base sm:text-xl font-orbitron font-black ${pendingCeoDeliverables + pendingMktActions > 0 ? 'text-mars-yellow animate-pulse' : 'text-slate-400'}">${pendingCeoDeliverables + pendingMktActions}</p>
                        <span class="text-[10px] text-slate-500 font-mono">${pendingCeoDeliverables} entregables + ${pendingMktActions} mkt</span>
                    </div>
                </div>
            </div>

            ${ceoTrayHtml}
            ${ceoSpecialItemsHtml}
            ${ceoGovernanceModulesHtml}

            <!-- CUADRO DE MANDOS DE ACCESOS TÁCTICOS -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <!-- Tarjeta 1: Dossier Oficial -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-cyan flex flex-col justify-between hover:border-mars-cyan transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-mars-cyan bg-mars-cyan/10 border border-mars-cyan/40 px-2 py-0.5">ACADÉMICO</span>
                            <span class="text-xs font-mono text-slate-400">${deliveredCount}/${defs.length} Hitos</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">📋 Dossier Académico Oficial</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">Supervisa la Bóveda de Entregables dividida en 4 Fases y las calificaciones ponderadas de los 6 docentes.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[11px] text-slate-400 font-mono">6 Materias evaluadas</span>
                        <button type="button" onclick="ui.navigate('dossier')" class="min-h-[44px] bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs px-4 py-2 transition-all">Acceder ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 2: Seguimiento de Órdenes -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-amber-400 flex flex-col justify-between hover:border-amber-400 transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5">LOGÍSTICA</span>
                            <span class="text-xs font-mono text-amber-400">${pendingOrders} en Proceso</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">📡 Seguimiento de Órdenes</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">Supervisa todas las compras de I+D, campañas de Marketing y fichas de montaje en taller físico.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[11px] text-slate-400 font-mono">${(co.orders || []).length} Órdenes totales</span>
                        <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] bg-slate-900 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-black uppercase text-xs px-4 py-2 transition-all">Supervisar ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 3: Gobernanza y Trámites -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-magenta flex flex-col justify-between hover:border-mars-magenta transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-mars-magenta bg-mars-magenta/10 border border-mars-magenta/40 px-2 py-0.5">LEGAL / AEE</span>
                            <span class="text-xs font-mono text-slate-400">${(co.votingMotions || []).length} Mociones</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">⚖️ Trámites y Gobernanza</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">Asambleas de socios, votaciones democráticas, validación de marca y recursos ante la AEE.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[11px] text-slate-400 font-mono">Regulación AEE</span>
                        <button type="button" onclick="ui.navigate('resolutions')" class="min-h-[44px] bg-slate-900 border border-mars-magenta text-mars-magenta hover:bg-mars-magenta hover:text-white font-black uppercase text-xs px-4 py-2 transition-all">Gestionar ➔</button>
                    </div>
                </div>

                <!-- Tarjeta 4: Mis Entregables -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-green flex flex-col justify-between hover:border-mars-green transition-all">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-xs font-black uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-2 py-0.5">MISIÓN</span>
                            <span class="text-xs font-mono ${returnedDeliverables > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}">${returnedDeliverables > 0 ? `⚠️ ${returnedDeliverables} Requieren Acción` : 'Todo al día'}</span>
                        </div>
                        <h3 class="font-orbitron font-black text-sm sm:text-base text-white uppercase">📤 Mis Entregables & Visados</h3>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">Gestión guiada paso a paso de memorias en Google Docs, visado formal del CEO y remisión al docente.</p>
                    </div>
                    <div class="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center">
                        <span class="text-[11px] text-slate-400 font-mono">Flujo guiado 4 pasos</span>
                        <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">Acceder ➔</button>
                    </div>
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    setRoleDeliverablesPhaseFilter(phase) {
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
        const isCEO = role === 'CEO';
        const isAux = role === 'AUXILIAR';
        const auxDept = isAux ? co?.auxRoleDept : null;
        const effectiveRole = (isAux && auxDept) ? auxDept : role;

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const docs = co.deliverables || {};

        const scope = this.roleDeliverablesScope || 'MY_ROLE';
        const phaseFilter = this.roleDeliverablesPhase || 'ALL';
        const statusFilter = this.roleDeliverablesStatus || 'ALL';

        // 1. Filtrado por rol / ámbito
        let baseDefs = defs;
        if (scope === 'MY_ROLE') {
            if (role === 'CEO') {
                baseDefs = defs; // El CEO supervisa todos los de la startup
            } else if (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES') {
                baseDefs = defs.filter(d => d.role === 'OPERACIONES_IA' || d.role === 'OPERACIONES');
            } else {
                baseDefs = defs.filter(d => d.role === effectiveRole);
            }
        }

        // 2. Contadores del resumen superior (sobre los entregables visibles)
        const totalVisible = baseDefs.length;
        const deliveredCount = baseDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
        const ceoReviewCount = baseDefs.filter(d => docs[d.key] && docs[d.key].status === 'SUBMITTED_TO_CEO').length;
        const actionRequiredCount = baseDefs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO')).length;
        const pendingCount = totalVisible - deliveredCount - ceoReviewCount - actionRequiredCount;

        // 3. Filtrado por Fase
        let filteredDefs = baseDefs;
        if (phaseFilter !== 'ALL') {
            filteredDefs = filteredDefs.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === phaseFilter);
        }

        // 4. Filtrado por Estado
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

        // Agrupación y ordenación dinámica por Fase asignada (I a IV)
        const phaseOrder = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };
        filteredDefs.sort((a, b) => {
            const pA = phaseOrder[ui.getDeliverablePhase ? ui.getDeliverablePhase(a.key) : (a.phase || 'I')] || 99;
            const pB = phaseOrder[ui.getDeliverablePhase ? ui.getDeliverablePhase(b.key) : (b.phase || 'I')] || 99;
            return pA - pB;
        });

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

        // Filtros de barra de herramientas
        const phaseTabsHtml = [
            { id: 'ALL', label: 'Todas las Fases' },
            { id: 'I', label: 'Fase I' },
            { id: 'II', label: 'Fase II' },
            { id: 'III', label: 'Fase III' },
            { id: 'IV', label: 'Fase IV' }
        ].map(p => `
            <button type="button" role="tab" aria-selected="${phaseFilter === p.id}" onclick="ui.setRoleDeliverablesPhaseFilter('${p.id}')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${phaseFilter === p.id ? 'bg-mars-cyan text-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">
                ${p.label}
            </button>
        `).join('');

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
                <button type="button" onclick="ui.setRoleDeliverablesScopeFilter('MY_ROLE')" class="min-h-[40px] px-3 py-1.5 text-xs font-bold uppercase transition-colors ${scope === 'MY_ROLE' ? 'bg-mars-cyan text-black' : 'text-slate-400 hover:text-white'}">
                    🎯 Mis Entregables (${role})
                </button>
                <button type="button" onclick="ui.setRoleDeliverablesScopeFilter('ALL')" class="min-h-[40px] px-3 py-1.5 text-xs font-bold uppercase transition-colors ${scope === 'ALL' ? 'bg-mars-cyan text-black' : 'text-slate-400 hover:text-white'}">
                    🏢 Toda la Startup (${defs.length})
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
                const isLocked = Boolean(openDate && !isNaN(new Date(openDate).getTime()) && (new Date() < new Date(openDate)));
                const dlDate = sched.deadline || (state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? (sched.deadline || state.data.config.deadlines[def.key]) : def.defaultDate;
                const dlStatus = this.getDeadlineStatus(dlDate);

                const isReturned = (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO');
                const isDelivered = (st === 'DELIVERED_TO_TEACHER');
                const isSubmittedCeo = (st === 'SUBMITTED_TO_CEO');
                const isWorkshopWork = (st === 'EN_TALLER_OPERARIO');

                // Determinación del índice activo del Stepper (0 a 3)
                let stepIdx = 0;
                if (isDelivered) stepIdx = 3;
                else if (isSubmittedCeo) stepIdx = 2;
                else if (docObj && docObj.driveUrl && !isReturned) stepIdx = 1;
                else if (isReturned) stepIdx = 1;

                // Stepper Visual de 4 Pasos
                const steps = [
                    { num: '1', title: 'Plantilla Docs', desc: 'Guía oficial' },
                    { num: '2', title: 'Enlace Drive', desc: 'Edición en equipo' },
                    { num: '3', title: 'Visado CEO', desc: 'Aval directivo' },
                    { num: '4', title: 'Evaluación Claustro', desc: '100% Ponderado' }
                ];

                const stepperHtml = `
                <div class="grid grid-cols-4 gap-1.5 sm:gap-2 my-3 py-2 border-y border-slate-800/80 bg-black/40 px-2 rounded">
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
                        return `
                        <div class="flex flex-col items-center text-center p-1 sm:p-1.5 border ${stepColor} rounded min-w-0">
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
                        ${docObj.returnDriveUrl ? `
                            <div class="mb-2">
                                <a href="${encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/60 border border-red-400 text-white font-bold rounded hover:bg-red-800 transition-colors font-mono">
                                    <span>📄 Ver Correcciones Marcadas en Docs ↗</span>
                                </a>
                            </div>
                        ` : ''}
                        <p class="text-[11px] text-slate-300 font-mono">Subsanad las observaciones en vuestro Google Doc y pulsada [ Reenviar al CEO ] para continuar la evaluación.</p>
                    </div>`;
                }

                // Acciones por rol
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
                    actionControlsHtml = `
                    <div class="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
                        <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VALIDAR ENSAMBLE EN TALLER Y ENVIAR AL CEO ]</button>
                        <button type="button" onclick="ui.modalTallerReturnReason()" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ REPORTAR INCIDENCIA A I+D ]</button>
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
                        ${this.renderDocTemplateBtn(def.key)}
                        ${docObj?.driveUrl ? `
                            <a href="${encodeURI(docObj.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[40px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/50 text-cyan-300 border border-cyan-500/40 rounded font-mono hover:bg-cyan-900/60 transition-colors">
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
                            <span class="text-xs text-slate-400 font-mono">18 HITOS CURRICULARES • 6 MATERIAS</span>
                        </div>
                        <h2 class="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-tight">
                            📤 Mis Entregables & Dossier Académico
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Gestión integral: Plantillas Drive ➔ Visado CEO ➔ Calificaciones LOMLOE (100%) ➔ Cronograma.</p>
                    </div>
                    ${activeSection === 'deliverables' ? scopeSwitchHtml : ''}
                </div>

                <!-- SUBPESTAÑAS DE NAVEGACIÓN INTERNA -->
                <div role="tablist" aria-label="Secciones de Entregables y Dossier" class="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
                    <button type="button" role="tab" aria-selected="${activeSection === 'deliverables'}" onclick="ui.setRoleDeliverablesSection('deliverables')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'deliverables' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📤 Gestión de Entregables</span>
                        ${(actionRequiredCount > 0) ? `<span class="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-pulse">${actionRequiredCount}</span>` : ''}
                    </button>
                    <button type="button" role="tab" aria-selected="${activeSection === 'grades'}" onclick="ui.setRoleDeliverablesSection('grades')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'grades' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📊 Calificaciones & Rúbricas (100%)</span>
                    </button>
                    <button type="button" role="tab" aria-selected="${activeSection === 'cronograma'}" onclick="ui.setRoleDeliverablesSection('cronograma')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${activeSection === 'cronograma' ? 'bg-mars-cyan text-black font-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                        <span>📅 Cronograma Oficial</span>
                    </button>
                </div>

                ${activeSection === 'deliverables' ? `
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

    modalSubmitRoleDeliverable(docKey) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const def = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).find(d => d.key === docKey);
        if (!def) return;

        const docObj = co.deliverables?.[docKey];
        const existingUrl = docObj?.driveUrl || '';
        const isReturned = (docObj?.status === 'CEO_REVISION' || docObj?.status === 'DEVUELTO_A_TECNICO');

        const bodyHtml = `
        <div class="space-y-4 font-mono text-xs">
            <div class="bg-slate-900 border border-mars-cyan/40 p-3 text-slate-200">
                <span class="text-mars-cyan font-bold uppercase block mb-1">ENTREGABLE OFICIAL // FASE ${ui.getDeliverablePhase ? ui.getDeliverablePhase(def.key) : (def.phase || 'I')}</span>
                <p class="font-bold text-white uppercase text-sm">${this.escapeHTML(def.name)}</p>
                <p class="text-slate-400 mt-1">${this.escapeHTML(def.desc)}</p>
            </div>

            ${isReturned ? `
                <div class="bg-red-950/60 border border-red-500 p-3 text-red-300">
                    <strong class="uppercase block mb-1">⚠️ Observaciones del CEO / Claustro:</strong>
                    <p class="italic text-white">"${this.escapeHTML(docObj.returnReason || docObj.returnReasonId || 'Requiere subsanación')}"</p>
                    ${docObj.returnDriveUrl ? `<a href="${encodeURI(docObj.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1.5 text-xs text-red-300 underline font-bold"><span>Ver documento con anotaciones en Google Drive ↗</span></a>` : ''}
                </div>
            ` : ''}

            <div class="space-y-1.5">
                <label for="deliverable-drive-input" class="text-xs text-mars-cyan uppercase font-bold block">Enlace de Google Drive / Docs con permisos compartidos</label>
                <input type="url" id="deliverable-drive-input" value="${this.escapeHTML(existingUrl)}" placeholder="https://docs.google.com/document/d/..." class="w-full bg-black border-2 border-mars-cyan p-3 text-base sm:text-xs text-mars-cyan font-mono outline-none focus:shadow-neon-cyan min-h-[44px]">
                <p class="text-[10px] text-slate-400 font-mono">Aseguraos de configurar el enlace en Google Docs como "Cualquiera con el enlace puede ver" o con permisos de lectura.</p>
            </div>
        </div>`;

        const actionsHtml = `
            <button type="button" onclick="ui.submitRoleDeliverable('${this.escapeHTML(docKey)}')" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-5 py-2.5 hover:bg-white transition-all shadow-sm">
                [ 🚀 REMITIR AL CEO PARA SU VISADO ]
            </button>
        `;

        this.showModal(`Entregar: ${def.shortName || def.name}`, bodyHtml, actionsHtml);
    },

    async submitRoleDeliverable(docKey) {
        const inputEl = document.getElementById('deliverable-drive-input');
        if (!inputEl) return;
        const url = this.cleanInput(inputEl.value);

        if (!url) {
            return this.notify("Debes indicar un enlace válido de Google Drive / Docs.", "warning");
        }
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(url)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return;

        // Si es Hoja de Taller (DOC_10)
        if (docKey === 'hoja_taller_fyq') {
            co.deliverables = co.deliverables || {};
            const prev = co.deliverables.hoja_taller_fyq || {};
            co.deliverables.hoja_taller_fyq = {
                ...prev,
                driveUrl: url,
                status: 'EN_TALLER_OPERARIO',
                updatedAt: new Date().toISOString()
            };
            state.save(state.user.coId);
            if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
            ui.pushNotification(state.user.coId, 'OPERACIONES_IA', '⚙️ Hoja de Taller enviada al operario para comprobación de ensamble.', 'info', { view: 'cart' });
            ui.closeModal();
            this.notify("✅ Hoja de Taller remitida a taller para comprobación de ensamble.", "success");
            this.render();
            return;
        }

        // Entregable general: remite al CEO
        co.deliverables = co.deliverables || {};
        const prevDoc = co.deliverables[docKey] || {};
        co.deliverables[docKey] = {
            ...prevDoc,
            driveUrl: url,
            status: state.user.role === 'CEO' ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO',
            updatedAt: new Date().toISOString()
        };

        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        if (state.user.role !== 'CEO') {
            ui.pushNotification(state.user.coId, 'CEO', `📤 Entregable [${docKey}] remitido por ${state.user.role} para visado.`, 'info', { view: 'role_deliverables' });
        }

        ui.closeModal();
        this.notify(state.user.role === 'CEO' ? "✅ Entregable visado y remitido al Claustro Docente." : "✅ Entregable transmitido al CEO para su visado formal.", "success");
        this.render();
    },

    approveSpecialItemByCEO(reqId) {
        if (!state.user || state.user.role !== 'CEO') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.specialItemRequests) return;

        const req = co.specialItemRequests.find(r => r.id === reqId);
        if (!req) return this.notify("Solicitud de material I+D no localizada.", "error");

        req.status = 'PENDIENTE_COORDINACION';
        req.approvedByCEO = true;
        req.approvedAt = Date.now();

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
        ui.pushNotification(coId, 'TECNICO', `✓ Tu solicitud de material I+D ha sido visada por el CEO y elevada a Coordinación Docente.`, 'success');

        this.notify("✅ Solicitud de material I+D visada y elevada a Coordinación Docente con notificación de aviso.", "success");
        this.render();
    },

    modalRejectSpecialItemByCEO(reqId) {
        if (!state.user || state.user.role !== 'CEO') return;
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
        if (!state.user || state.user.role !== 'CEO') return;
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

        co.updatedAt = Date.now();
        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification(coId, 'TECNICO', `↩ Solicitud de material I+D devuelta por el CEO: "${reason}".`, 'warning', { view: 'tech' });
        this.closeModal();
        this.notify("Solicitud de material devuelta al Dpto. Técnico.", "info");
        this.render();
    },

    modalLaunchLicense() {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        if (!this.isLaunchLicenseUnlocked(co)) {
            return this.notify("⛔ Trámite bloqueado: Se requiere haber entregado formalmente el Informe Técnico Preliminar (DOC FYQ) al Claustro Docente antes de tramitar la Licencia AESA.", "error");
        }

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-mars-yellow/10 border border-mars-yellow text-slate-200 space-y-1">
                    <p class="text-mars-yellow font-bold uppercase flex items-center gap-1.5">
                        <span>🚀 Procedimiento de Seguridad AESA (DOC_14)</span>
                    </p>
                    <p class="font-sans text-[11px] leading-relaxed">
                        Conforme a la normativa aeroespacial simulada de la Fase II, los lanzamientos en el banco de pruebas están bloqueados. Para desbloquearlos, el CEO debe cumplimentar y firmar digitalmente la solicitud oficial y remitirla a Coordinación Docente con abono de la tasa administrativa de <strong>50 €v</strong>.
                    </p>
                </div>
                <div class="mb-2">
                    ${this.renderDocTemplateBtn('DOC_14_LICENCIA_AESA', '📄 Ver Plantilla Licencia AESA (DOC_14)')}
                </div>
                <div>
                    <label for="launch-license-drive-url" class="text-mars-cyan uppercase font-bold block mb-1">
                        Enlace a Solicitud Formal AESA en Google Drive / Docs (URL)
                    </label>
                    <input type="url" id="launch-license-drive-url" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Asegúrate de compartir el documento con permisos de lectura abiertos ("Cualquiera con el enlace puede ver").</p>
                </div>
                <div class="p-3 bg-black/60 border border-slate-800 space-y-2">
                    <label class="flex items-start gap-2.5 cursor-pointer text-slate-200 text-xs font-sans">
                        <input type="checkbox" id="launch-license-sign-check" class="mt-0.5 min-h-[20px] min-w-[20px] accent-mars-yellow">
                        <span>D./Dª CEO certifica la veracidad de los cálculos estequiométricos de propelente, medidas de fuselaje y protocolos de seguridad física del banco de pruebas.</span>
                    </label>
                </div>
                <div class="p-2.5 bg-black/60 border border-slate-800 flex justify-between items-center text-xs">
                    <span class="text-slate-300">Tasa Administrativa AESA:</span>
                    <span class="text-mars-yellow font-bold font-orbitron">-50.00 €v</span>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitLaunchLicense()" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">[ ✍️ Firmar y Tramitar Licencia (-50 €v) ]</button>`;
        this.showModal("Tramitación de Licencia de Lanzamiento AESA (DOC_14)", html, actions);
    },

    submitLaunchLicense() {
        if (!state.user || state.user.role !== 'CEO') return;
        const elUrl = document.getElementById('launch-license-drive-url');
        const elCheck = document.getElementById('launch-license-sign-check');
        if (!elUrl || !elCheck) return;

        const driveUrl = this.cleanInput(elUrl.value).trim();
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive de la solicitud formal AESA.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }
        if (!elCheck.checked) {
            return this.notify("Debes marcar la casilla de certificación y firma digital del CEO.", "warning");
        }

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        if (!this.isLaunchLicenseUnlocked(co)) {
            return this.notify("⛔ Trámite bloqueado: Se requiere haber entregado formalmente el Informe Técnico Preliminar (DOC FYQ) al Claustro Docente antes de tramitar la Licencia AESA.", "error");
        }

        if (Number(co.balance || 0) < 50) {
            return this.notify("Saldo insuficiente: se requieren 50 €v de tesorería para la tasa administrativa de la licencia AESA.", "error");
        }

        // Deducción de 50 €v y registro en Libro Mayor
        co.balance -= 50;
        state.addToLedger(coId, 'Tasa Administrativa AESA // Licencia de Lanzamiento (DOC_14)', 'TASAS_ADMINISTRATIVAS', -50);

        co.launchLicense = {
            id: 'AESA-' + Date.now(),
            driveUrl: driveUrl,
            status: 'PENDIENTE_DOCENTE',
            appliedAt: Date.now(),
            appliedDate: new Date().toLocaleDateString(),
            feePaid: 50,
            signedBy: state.user.name || 'CEO'
        };
        co.updatedAt = Date.now();

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification('ADMIN', 'ALL', `🚀 [${co.name}] El CEO ha tramitado y abonado la Licencia de Lanzamiento AESA (50 €v). Pendiente de validación.`, 'info', { view: 'coordination' });
        ui.pushNotification(coId, 'ALL', `🚀 El CEO ha tramitado la Licencia de Lanzamiento AESA. Pendiente de validación por Coordinación Docente.`, 'info');

        this.closeModal();
        this.notify("✅ Licencia AESA tramitada exitosamente. Tasa de 50 €v abonada y remitida al claustro para su validación.", "success");
        this.updateHUD();
        this.render();
    },

    modalPublishPressRelease(phaseKey) {
        if (!state.user || state.user.role !== 'CEO') return;
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
                <div>
                    <label for="press-release-drive-url" class="text-mars-cyan uppercase font-bold block mb-1">
                        Enlace a la Nota de Prensa en Google Drive o Docs (URL)
                    </label>
                    <input type="url" id="press-release-drive-url" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">El documento debe estar en modo <em>"Cualquiera con el enlace puede ver"</em> para que toda la comunidad pueda leerlo.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitPressRelease('${this.escapeHTML(phaseDef.phase)}')" class="min-h-[44px] bg-mars-cyan text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">[ 📰 Publicar en Tablón de Noticias ]</button>`;
        this.showModal(`Publicar Nota de Prensa (${phaseDef.title})`, html, actions);
    },

    submitPressRelease(phaseKey) {
        if (!state.user || state.user.role !== 'CEO') return;
        const elUrl = document.getElementById('press-release-drive-url');
        if (!elUrl) return;

        const driveUrl = this.cleanInput(elUrl.value).trim();
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive de la nota de prensa.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        if (!this.isPressReleaseUnlocked(phaseKey, co)) {
            return this.notify(`🔒 La Nota de Prensa de Fase ${phaseKey} permanece bloqueada hasta el cierre oficial de la fase.`, "warning");
        }

        co.pressReleases = co.pressReleases || {};
        co.pressReleases[phaseKey] = {
            id: 'PR-' + coId + '-' + phaseKey,
            phase: phaseKey,
            title: `Nota de Prensa Oficial Fase ${phaseKey} — ${co.name}`,
            driveUrl: driveUrl,
            publishedAt: Date.now(),
            publishedDate: new Date().toLocaleDateString(),
            author: state.user.name || 'CEO'
        };
        co.updatedAt = Date.now();

        // Registro en listado global para el Tablón de Noticias
        state.data.pressReleases = Array.isArray(state.data.pressReleases) ? state.data.pressReleases : [];
        const existingIdx = state.data.pressReleases.findIndex(p => p.coId === coId && p.phase === phaseKey);
        const item = {
            id: 'PR-' + coId + '-' + phaseKey,
            coId: coId,
            companyName: co.name,
            classGroup: co.classGroup || 'A',
            phase: phaseKey,
            title: `Nota de Prensa Oficial — Cierre Fase ${phaseKey} (${co.name})`,
            driveUrl: driveUrl,
            publishedAt: Date.now(),
            publishedDate: new Date().toLocaleDateString()
        };
        if (existingIdx >= 0) {
            state.data.pressReleases[existingIdx] = item;
        } else {
            state.data.pressReleases.unshift(item);
        }

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification(coId, 'ALL', `📰 El CEO ha publicado la Nota de Prensa Oficial de Fase ${phaseKey} en el Tablón de Noticias.`, 'success', { view: 'news' });
        ui.pushNotification('ADMIN', 'ALL', `📰 [${co.name}] Nota de Prensa Oficial de Fase ${phaseKey} publicada en el Tablón.`, 'info', { view: 'news' });

        this.closeModal();
        this.notify("✅ Nota de Prensa Oficial publicada en el Tablón de Noticias.", "success");
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
                const maxDim = 1200;
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
                const compressedDataUrl = canvas.toDataURL('image/webp', 0.82) || canvas.toDataURL('image/jpeg', 0.82);
                
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

    modalPublishOfficialNews() {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        const companies = state.data?.companies || {};
        const coList = Object.keys(companies).map(cid => ({
            id: cid,
            name: companies[cid].name,
            classGroup: companies[cid].classGroup || 'A'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div class="p-3 bg-amber-950/40 border border-amber-500/50 rounded flex items-start gap-2 text-amber-200">
                    <span class="text-lg">🍌</span>
                    <div>
                        <strong class="font-bold text-amber-300 block uppercase font-orbitron text-xs">Agencia Espacial AEE // Crónicas & Nano Banana 3</strong>
                        <span>Publica una crónica oficial para toda la misión. Puedes acompañarla de una imagen generada con Nano Banana 3 (subiendo el archivo o pegando el enlace).</span>
                    </div>
                </div>

                <div>
                    <label for="offnews-title" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Titular de la Noticia / Crónica *</label>
                    <input type="text" id="offnews-title" placeholder="Ej: Éxito en la primera fase de ensayos de propulsión marciana..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white uppercase outline-none font-sans" required>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-phase" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fase Asociada</label>
                        <select id="offnews-phase" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" selected>Todas / Misión Global</option>
                            <option value="I">Fase I: Fundación & Viabilidad</option>
                            <option value="II">Fase II: I+D y Prototipado Aeroespacial</option>
                            <option value="III">Fase III: Producción y Finanzas B2B</option>
                            <option value="IV">Fase IV: Validación Científica</option>
                        </select>
                    </div>
                    <div>
                        <label for="offnews-class" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Clase Destino</label>
                        <select id="offnews-class" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" selected>Todas las Clases (A-F y TEST)</option>
                            <option value="A">Clase A</option>
                            <option value="B">Clase B</option>
                            <option value="C">Clase C</option>
                            <option value="D">Clase D</option>
                            <option value="E">Clase E</option>
                            <option value="F">Clase F</option>
                            <option value="TEST">Clase TEST</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="offnews-company" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Vincular a una Startup (Opcional)</label>
                    <select id="offnews-company" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                        <option value="">-- Sin startup específica (Comunicado General) --</option>
                        ${coList.map(c => `
                            <option value="${this.escapeAttr(c.id)}">${this.escapeHTML(c.name)} [Clase ${this.escapeHTML(c.classGroup)}]</option>
                        `).join('')}
                    </select>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                        <label for="offnews-body" class="text-xs text-amber-400 uppercase font-bold font-mono">Cuerpo de la Crónica Oficial *</label>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="ui.insertFormatTag('offnews-body', '**', '**')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs rounded transition-colors" title="Negrita (**texto**)">
                                <strong>B</strong>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-body', '*', '*')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white italic text-xs rounded transition-colors" title="Cursiva (*texto*)">
                                <em>I</em>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-body', '\n\n', '')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-[11px] rounded transition-colors" title="Nuevo Párrafo">
                                ¶ Párrafo
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-body', '\n- ', '')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-cyan-300 font-mono text-[11px] rounded transition-colors" title="Lista con viñetas">
                                • Lista
                            </button>
                        </div>
                    </div>
                    <textarea id="offnews-body" rows="6" placeholder="Redacta la crónica oficial de la Agencia Espacial AEE. Puedes separar párrafos y usar **negrita**, *cursiva* o listas con viñetas..." class="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white font-sans outline-none"></textarea>
                    <span class="text-[10px] text-slate-400 font-mono block mt-1">Formato admitido: **negrita**, *cursiva*, saltos de párrafo y viñetas (- elemento).</span>
                </div>

                <div class="p-3 bg-black/60 border border-slate-800 rounded space-y-3">
                    <label class="text-xs text-amber-300 uppercase font-bold block font-mono">🎨 Imagen de Portada // Nano Banana 3 (Opcional)</label>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 1: Subir imagen generada (se optimiza y comprime automáticamente en tu navegador)</span>
                        <input type="file" id="offnews-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-img-data', 'offnews-preview')" class="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-white cursor-pointer">
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Opción 2: O pegar enlace directo de imagen (Google Drive o URL pública)</span>
                        <input type="url" id="offnews-url" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-preview')" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                    <input type="hidden" id="offnews-img-data" value="">
                    <div id="offnews-preview" class="hidden"></div>
                </div>
            </div>
        `;

        const actions = `
            <button type="button" onclick="ui.submitOfficialNews()" class="min-h-[44px] bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] w-full sm:w-auto">
                🚀 Publicar Noticia Oficial
            </button>
        `;

        this.showModal("🍌 Nueva Noticia Oficial // Nano Banana 3", html, actions);
    },

    submitOfficialNews() {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        const elTitle = document.getElementById('offnews-title');
        const elBody = document.getElementById('offnews-body');
        const elPhase = document.getElementById('offnews-phase');
        const elClass = document.getElementById('offnews-class');
        const elCompany = document.getElementById('offnews-company');
        const elImgData = document.getElementById('offnews-img-data');
        const elUrl = document.getElementById('offnews-url');

        const title = elTitle ? elTitle.value.trim() : '';
        const body = elBody ? elBody.value.trim() : '';
        if (!title) return this.notify("Debes indicar un titular para la noticia.", "warning");
        if (!body) return this.notify("Debes redactar el cuerpo de la crónica.", "warning");

        const phase = elPhase ? elPhase.value : 'ALL';
        const classGroup = elClass ? elClass.value : 'ALL';
        const coId = elCompany ? elCompany.value : '';
        const coName = coId && state.data?.companies?.[coId] ? state.data.companies[coId].name : '';

        let imageUrl = '';
        if (elImgData && elImgData.value) {
            imageUrl = elImgData.value;
        } else if (elUrl && elUrl.value.trim()) {
            imageUrl = elUrl.value.trim();
        }

        const now = Date.now();
        const newsItem = {
            id: 'OFFNEWS-' + now + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
            title: title,
            body: body,
            phase: phase,
            classGroup: classGroup,
            coId: coId || null,
            companyName: coName || null,
            imageUrl: imageUrl || null,
            author: state.user?.name || (state.user?.role ? `Coordinación (${state.user.role})` : 'Coordinación AEE'),
            publishedAt: now,
            publishedDate: new Date().toLocaleDateString()
        };

        state.data.officialNews = Array.isArray(state.data.officialNews) ? state.data.officialNews : [];
        state.data.officialNews.unshift(newsItem);

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification('ALL', 'ALL', `🪐 [AEE Prensa] Nueva crónica oficial publicada: "${title}".`, 'info', { view: 'news' });

        this.closeModal();
        this.render();
        this.notify("✅ Crónica Oficial publicada con éxito en el Tablón de Noticias.", "success");
    },

    deleteOfficialNews(newsId) {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Solo Coordinación puede retirar noticias.", "error");

        this.confirmModal(
            "¿Retirar Noticia Oficial?",
            "Esta noticia se eliminará definitivamente del Tablón de Noticias para todos los alumnos.",
            () => {
                state.data.deletedOfficialNewsIds = Array.isArray(state.data.deletedOfficialNewsIds) ? state.data.deletedOfficialNewsIds : [];
                state.data.deletedOfficialNewsIds.push(String(newsId));

                state.data.officialNews = (state.data.officialNews || []).filter(n => String(n.id) !== String(newsId));

                state.save();
                if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
                this.render();
                this.notify("🗑️ Noticia oficial retirada del tablón.", "info");
            }
        );
    },

    modalEditOfficialNews(newsId) {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        const news = (state.data?.officialNews || []).find(n => String(n.id) === String(newsId));
        if (!news) return this.notify("Crónica oficial no localizada.", "error");

        const companies = state.data?.companies || {};
        const coList = Object.keys(companies).map(cid => ({
            id: cid,
            name: companies[cid].name,
            classGroup: companies[cid].classGroup || 'A'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const existingImg = news.imageUrl || '';
        const hasExistingImg = Boolean(existingImg);

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <div class="p-3 bg-amber-950/40 border border-amber-500/50 rounded flex items-start gap-2 text-amber-200">
                    <span class="text-lg">✏️</span>
                    <div>
                        <strong class="font-bold text-amber-300 block uppercase font-orbitron text-xs">Editar Crónica Oficial AEE</strong>
                        <span>Modifica el titular, cuerpo de texto o actualiza la portada de Nano Banana 3. Los cambios se sincronizarán en los paneles de todos los alumnos.</span>
                    </div>
                </div>

                <div>
                    <label for="offnews-edit-title" class="text-xs text-amber-400 uppercase font-bold block mb-1 font-mono">Titular de la Noticia / Crónica *</label>
                    <input type="text" id="offnews-edit-title" value="${this.escapeAttr(news.title || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white uppercase outline-none font-sans" required>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label for="offnews-edit-phase" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Fase Asociada</label>
                        <select id="offnews-edit-phase" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" ${news.phase === 'ALL' ? 'selected' : ''}>Todas / Misión Global</option>
                            <option value="I" ${news.phase === 'I' ? 'selected' : ''}>Fase I: Fundación & Viabilidad</option>
                            <option value="II" ${news.phase === 'II' ? 'selected' : ''}>Fase II: I+D y Prototipado Aeroespacial</option>
                            <option value="III" ${news.phase === 'III' ? 'selected' : ''}>Fase III: Producción y Finanzas B2B</option>
                            <option value="IV" ${news.phase === 'IV' ? 'selected' : ''}>Fase IV: Validación Científica</option>
                        </select>
                    </div>
                    <div>
                        <label for="offnews-edit-class" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Clase Destino</label>
                        <select id="offnews-edit-class" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                            <option value="ALL" ${news.classGroup === 'ALL' ? 'selected' : ''}>Todas las Clases (A-F y TEST)</option>
                            <option value="A" ${news.classGroup === 'A' ? 'selected' : ''}>Clase A</option>
                            <option value="B" ${news.classGroup === 'B' ? 'selected' : ''}>Clase B</option>
                            <option value="C" ${news.classGroup === 'C' ? 'selected' : ''}>Clase C</option>
                            <option value="D" ${news.classGroup === 'D' ? 'selected' : ''}>Clase D</option>
                            <option value="E" ${news.classGroup === 'E' ? 'selected' : ''}>Clase E</option>
                            <option value="F" ${news.classGroup === 'F' ? 'selected' : ''}>Clase F</option>
                            <option value="TEST" ${news.classGroup === 'TEST' ? 'selected' : ''}>Clase TEST</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label for="offnews-edit-company" class="text-xs text-slate-300 uppercase font-bold block mb-1 font-mono">Vincular a una Startup (Opcional)</label>
                    <select id="offnews-edit-company" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none">
                        <option value="">-- Sin startup específica (Comunicado General) --</option>
                        ${coList.map(c => `
                            <option value="${this.escapeAttr(c.id)}" ${news.coId === c.id ? 'selected' : ''}>${this.escapeHTML(c.name)} [Clase ${this.escapeHTML(c.classGroup)}]</option>
                        `).join('')}
                    </select>
                </div>

                <div>
                    <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                        <label for="offnews-edit-body" class="text-xs text-amber-400 uppercase font-bold font-mono">Cuerpo de la Crónica Oficial *</label>
                        <div class="flex items-center gap-1">
                            <button type="button" onclick="ui.insertFormatTag('offnews-edit-body', '**', '**')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs rounded transition-colors" title="Negrita (**texto**)">
                                <strong>B</strong>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-edit-body', '*', '*')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white italic text-xs rounded transition-colors" title="Cursiva (*texto*)">
                                <em>I</em>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-edit-body', '\\n\\n', '')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-[11px] rounded transition-colors" title="Nuevo Párrafo">
                                ¶ Párrafo
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('offnews-edit-body', '\\n- ', '')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-cyan-300 font-mono text-[11px] rounded transition-colors" title="Lista con viñetas">
                                • Lista
                            </button>
                        </div>
                    </div>
                    <textarea id="offnews-edit-body" rows="6" class="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white font-sans outline-none">${this.escapeHTML(news.body || '')}</textarea>
                    <span class="text-[10px] text-slate-400 font-mono block mt-1">Formato admitido: **negrita**, *cursiva*, saltos de párrafo y viñetas (- elemento).</span>
                </div>

                <div class="p-3 bg-black/60 border border-slate-800 rounded space-y-3">
                    <label class="text-xs text-amber-300 uppercase font-bold block font-mono">🎨 Portada // Nano Banana 3</label>
                    ${hasExistingImg ? `
                        <div id="offnews-edit-current-img" class="p-2.5 bg-slate-950 border border-amber-500/40 rounded flex items-center justify-between gap-3 flex-wrap">
                            <div class="flex items-center gap-3">
                                <img src="${this.escapeHTML(existingImg)}" class="w-14 h-14 object-cover rounded border border-slate-700" alt="Portada actual">
                                <div>
                                    <span class="text-[11px] text-amber-300 font-bold block font-mono">Portada cargada actualmente</span>
                                    <span class="text-[10px] text-slate-400">Puedes conservarla o sustituirla a continuación.</span>
                                </div>
                            </div>
                            <button type="button" onclick="document.getElementById('offnews-edit-img-data').value = ''; document.getElementById('offnews-edit-url').value = ''; document.getElementById('offnews-edit-current-img').classList.add('hidden'); ui.notify('Portada marcada para eliminar al guardar.', 'info');" class="min-h-[36px] px-3 py-1 bg-red-950/60 border border-red-500 text-red-300 hover:bg-red-800 hover:text-white text-xs font-bold uppercase transition-colors">
                                🗑️ Quitar Portada
                            </button>
                        </div>
                    ` : ''}

                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">Subir nueva imagen optimizada</span>
                        <input type="file" id="offnews-edit-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-edit-img-data', 'offnews-edit-preview')" class="w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-4 file:rounded-none file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black hover:file:bg-white cursor-pointer">
                    </div>
                    <div>
                        <span class="text-[11px] text-slate-400 block mb-1">O pegar enlace directo de imagen (Drive o URL)</span>
                        <input type="url" id="offnews-edit-url" value="${hasExistingImg && existingImg.startsWith('http') ? this.escapeAttr(existingImg) : ''}" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-edit-preview')" placeholder="https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 focus:border-amber-400 p-2.5 text-xs text-white outline-none font-mono">
                    </div>
                    <input type="hidden" id="offnews-edit-img-data" value="${hasExistingImg ? this.escapeAttr(existingImg) : ''}">
                    <div id="offnews-edit-preview" class="hidden"></div>
                </div>
            </div>
        `;

        const actions = `
            <div class="flex gap-2 flex-wrap justify-end w-full">
                <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
                <button type="button" onclick="ui.submitEditOfficialNews('${this.escapeHTML(newsId)}')" class="min-h-[44px] bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)]">
                    💾 Guardar Cambios
                </button>
            </div>
        `;

        this.showModal(`✏️ Editar Crónica Oficial // ${this.escapeHTML(news.title || '')}`, html, actions);
    },

    submitEditOfficialNews(newsId) {
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        if (!isDocente) return this.notify("Acceso restringido a Coordinación Docente.", "error");

        const news = (state.data?.officialNews || []).find(n => String(n.id) === String(newsId));
        if (!news) return this.notify("Crónica oficial no localizada.", "error");

        const elTitle = document.getElementById('offnews-edit-title');
        const elBody = document.getElementById('offnews-edit-body');
        const elPhase = document.getElementById('offnews-edit-phase');
        const elClass = document.getElementById('offnews-edit-class');
        const elCompany = document.getElementById('offnews-edit-company');
        const elImgData = document.getElementById('offnews-edit-img-data');
        const elUrl = document.getElementById('offnews-edit-url');

        const title = elTitle ? elTitle.value.trim() : '';
        const body = elBody ? elBody.value.trim() : '';
        if (!title) return this.notify("Debes indicar un titular para la noticia.", "warning");
        if (!body) return this.notify("Debes redactar el cuerpo de la crónica.", "warning");

        const phase = elPhase ? elPhase.value : 'ALL';
        const classGroup = elClass ? elClass.value : 'ALL';
        const coId = elCompany ? elCompany.value : '';
        const coName = coId && state.data?.companies?.[coId] ? state.data.companies[coId].name : '';

        let imageUrl = '';
        if (elImgData && elImgData.value) {
            imageUrl = elImgData.value;
        } else if (elUrl && elUrl.value.trim()) {
            imageUrl = elUrl.value.trim();
        }

        news.title = title;
        news.body = body;
        news.phase = phase;
        news.classGroup = classGroup;
        news.coId = coId || null;
        news.companyName = coName || null;
        news.imageUrl = imageUrl || null;
        news.updatedAt = Date.now();

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.render();
        this.notify("✅ Crónica Oficial actualizada con éxito.", "success");
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
                        ${currentImg ? `
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
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '**', '**')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white font-bold text-xs rounded transition-colors" title="Negrita">
                                <strong>B</strong>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '*', '*')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-white italic text-xs rounded transition-colors" title="Cursiva">
                                <em>I</em>
                            </button>
                            <button type="button" onclick="ui.insertFormatTag('pr-nano-note', '\n\n', '')" class="min-h-[28px] px-2 py-0.5 bg-slate-800 border border-slate-700 hover:border-amber-400 text-amber-300 font-mono text-[11px] rounded transition-colors" title="Nuevo Párrafo">
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
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (co && co.pressReleases) {
                Object.keys(co.pressReleases).forEach(pk => {
                    const item = co.pressReleases[pk];
                    if (item.id === prId || `${cid}-${pk}` === prId) {
                        item.nanoBananaImage = imgUrl || null;
                        item.editorialNote = note || null;
                        co.updatedAt = Date.now();
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

    viewNewsBoard(el) {
        if (!el || !state.user) return;
        const isDocente = Boolean(state.user?.admin || (state.user?.role && (state.user.role === 'DOCENTE' || state.user.role.startsWith('COORD'))));
        const classFilter = this.newsClassFilter || 'ALL';
        const phaseFilter = this.newsPhaseFilter || 'ALL';

        // 1. Recopilación de Crónicas Oficiales de Coordinación AEE
        const deletedNewsIds = new Set((state.data?.deletedOfficialNewsIds || []).map(String));
        const officialNews = (state.data?.officialNews || [])
            .filter(n => n && n.id && !deletedNewsIds.has(String(n.id)))
            .map(n => ({
                ...n,
                isOfficial: true,
                publishedAt: n.publishedAt || (n.timestamp || 0),
                publishedDate: n.publishedDate || (n.date || '--')
            }));

        // 2. Recopilación de Notas de Prensa de las Startups (DOC_15)
        const allReleases = [];
        const companies = state.data?.companies || {};
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (co && co.pressReleases) {
                Object.keys(co.pressReleases).forEach(pk => {
                    const pr = co.pressReleases[pk];
                    if (pr && pr.driveUrl) {
                        allReleases.push({
                            id: pr.id || `${cid}-${pk}`,
                            coId: cid,
                            companyName: co.name,
                            classGroup: co.classGroup || 'A',
                            phase: pk,
                            title: pr.title || `Nota de Prensa Fase ${pk} (${co.name})`,
                            driveUrl: pr.driveUrl,
                            nanoBananaImage: pr.nanoBananaImage || null,
                            editorialNote: pr.editorialNote || null,
                            publishedAt: pr.publishedAt || 0,
                            publishedDate: pr.publishedDate || '--',
                            isOfficial: false
                        });
                    }
                });
            }
        });

        if (Array.isArray(state.data?.pressReleases)) {
            state.data.pressReleases.forEach(pr => {
                const exist = allReleases.find(r => r.id === pr.id);
                if (!exist) {
                    allReleases.push({
                        ...pr,
                        isOfficial: false
                    });
                } else {
                    if (pr.nanoBananaImage && !exist.nanoBananaImage) exist.nanoBananaImage = pr.nanoBananaImage;
                    if (pr.editorialNote && !exist.editorialNote) exist.editorialNote = pr.editorialNote;
                }
            });
        }

        const allItems = [...officialNews, ...allReleases];
        allItems.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));

        let filtered = allItems;
        if (classFilter !== 'ALL') {
            filtered = filtered.filter(r => !r.classGroup || r.classGroup === 'ALL' || (r.classGroup || 'A').toUpperCase() === classFilter.toUpperCase());
        }
        if (phaseFilter !== 'ALL') {
            filtered = filtered.filter(r => !r.phase || r.phase === 'ALL' || r.phase === phaseFilter);
        }

        const availableClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'TEST'];

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-6';
        wrapper.innerHTML = `
            <!-- Cabecera del Tablón de Noticias -->
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-mars-border pb-4 mb-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1 flex-wrap">
                            <span class="px-2.5 py-0.5 text-xs font-black uppercase bg-mars-cyan/20 border border-mars-cyan text-mars-cyan">PRENSA & COMUNICACIÓN OFICIAL</span>
                            <span class="text-xs text-slate-400 font-mono">${allItems.length} Comunicados (${officialNews.length} AEE / ${allReleases.length} Startups)</span>
                        </div>
                        <h2 class="text-xl sm:text-2xl font-orbitron font-black text-white uppercase tracking-tight">
                            📰 Tablón Oficial de Noticias de la Misión
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5 font-sans">
                            Seguimiento público del progreso de las startups y crónicas oficiales ilustradas con IA (Nano Banana 3).
                        </p>
                    </div>
                    ${isDocente ? `
                        <button type="button" onclick="ui.modalPublishOfficialNews()" class="min-h-[44px] bg-amber-400 text-black px-4 py-2.5 font-black uppercase text-xs hover:bg-white transition-all shadow-[0_0_15px_rgba(251,191,36,0.4)] flex items-center gap-2 shrink-0">
                            <span>🍌 + Publicar Crónica / Imagen Nano Banana 3</span>
                        </button>
                    ` : ''}
                </div>

                <!-- Barra de Filtros Rápidos (Ergonomía Docente y Alumnos) -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <!-- Filtro por Clase -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs text-slate-400 font-mono font-bold mr-1 uppercase">Clase:</span>
                        <button type="button" onclick="ui.setNewsClassFilter('ALL')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${classFilter === 'ALL' ? 'bg-mars-cyan text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Todas
                        </button>
                        ${availableClasses.map(c => `
                            <button type="button" onclick="ui.setNewsClassFilter('${c}')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${classFilter === c ? 'bg-mars-cyan text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                                Clase ${c}
                            </button>
                        `).join('')}
                    </div>

                    <!-- Filtro por Fase -->
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-xs text-slate-400 font-mono font-bold mr-1 uppercase">Fase:</span>
                        <button type="button" onclick="ui.setNewsPhaseFilter('ALL')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${phaseFilter === 'ALL' ? 'bg-amber-400 text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Todas
                        </button>
                        <button type="button" onclick="ui.setNewsPhaseFilter('I')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${phaseFilter === 'I' ? 'bg-amber-400 text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Fase I
                        </button>
                        <button type="button" onclick="ui.setNewsPhaseFilter('II')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${phaseFilter === 'II' ? 'bg-amber-400 text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Fase II
                        </button>
                        <button type="button" onclick="ui.setNewsPhaseFilter('III')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${phaseFilter === 'III' ? 'bg-amber-400 text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Fase III
                        </button>
                        <button type="button" onclick="ui.setNewsPhaseFilter('IV')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-all ${phaseFilter === 'IV' ? 'bg-amber-400 text-black font-black' : 'bg-slate-900 border border-slate-700 text-slate-300 hover:text-white'}">
                            Fase IV
                        </button>
                    </div>
                </div>
            </div>

            <!-- Listado de Noticias -->
            <div class="space-y-4">
                ${filtered.length === 0 ? `
                    <div class="terminal-border bg-mars-card p-10 text-center border-dashed border-slate-700">
                        <span class="text-3xl block mb-2">📰</span>
                        <h3 class="text-base font-orbitron font-bold text-white uppercase mb-1">Sin Comunicados Publicados en este Filtro</h3>
                        <p class="text-xs text-slate-400 max-w-lg mx-auto font-sans">
                            Las notas de prensa oficiales de startups se habilitan al cierre de cada fase, y las crónicas oficiales son emitidas por la Agencia Espacial AEE.
                        </p>
                    </div>
                ` : `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        ${filtered.map(r => {
                            const hasImage = Boolean(r.imageUrl || r.nanoBananaImage);
                            const imgSource = r.imageUrl || r.nanoBananaImage;
                            const isOfficial = Boolean(r.isOfficial);

                            return `
                            <div class="terminal-border bg-mars-card flex flex-col justify-between hover:border-mars-cyan transition-all overflow-hidden ${isOfficial ? 'border-t-4 border-t-amber-400' : 'border-t-2 border-t-mars-cyan'}">
                                <div>
                                    ${hasImage ? `
                                        <div class="relative w-full h-48 sm:h-56 bg-black overflow-hidden border-b border-slate-800 group">
                                            <img src="${this.escapeAttr(imgSource)}" alt="${this.escapeAttr(r.title)}" class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer" onclick="ui.modalViewNewsImage('${this.escapeAttr(imgSource)}', '${this.escapeAttr(r.title)}')">
                                            <div class="absolute bottom-2 left-2 bg-black/85 backdrop-blur-sm border border-amber-400/60 px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 uppercase flex items-center gap-1 shadow">
                                                <span>🎨</span>
                                                <span>Nano Banana 3</span>
                                            </div>
                                            <button type="button" onclick="ui.modalViewNewsImage('${this.escapeAttr(imgSource)}', '${this.escapeAttr(r.title)}')" class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white p-1.5 rounded text-xs opacity-90 hover:opacity-100 transition-opacity" title="Ampliar imagen">
                                                🔍
                                            </button>
                                        </div>
                                    ` : ''}

                                    <div class="p-5">
                                        <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
                                            <div class="flex items-center gap-1.5 flex-wrap">
                                                ${isOfficial ? `
                                                    <span class="px-2 py-0.5 text-xs font-black uppercase bg-amber-950/60 border border-amber-400 text-amber-300">🪐 AGENCIA ESPACIAL AEE // CRÓNICA</span>
                                                ` : `
                                                    <span class="px-2 py-0.5 text-xs font-black uppercase bg-black border border-mars-cyan text-mars-cyan">FASE ${this.escapeHTML(r.phase)}</span>
                                                `}
                                                ${r.classGroup && r.classGroup !== 'ALL' ? `
                                                    <span class="px-2 py-0.5 text-xs font-mono text-slate-300 bg-slate-900 border border-slate-700">[CLASE ${this.escapeHTML(r.classGroup)}]</span>
                                                ` : (isOfficial ? `<span class="px-2 py-0.5 text-xs font-mono text-amber-300 bg-amber-950/40 border border-amber-500/30">[TODA LA MISIÓN]</span>` : '')}
                                            </div>
                                            <span class="text-[11px] text-slate-400 font-mono">${this.escapeHTML(r.publishedDate || '--')}</span>
                                        </div>

                                        ${r.companyName ? `
                                            <span class="text-xs text-mars-cyan font-bold block mb-1 uppercase tracking-wider">${this.escapeHTML(r.companyName)}</span>
                                        ` : ''}

                                        <h3 class="text-base font-orbitron font-black text-white uppercase mb-2 leading-snug">${this.escapeHTML(r.title)}</h3>

                                        ${r.body ? `
                                            <div class="text-xs text-slate-300 font-sans mb-3">${this.renderFormattedNewsText(r.body)}</div>
                                        ` : ''}

                                        ${r.editorialNote ? `
                                            <div class="mt-2 mb-3 p-2.5 bg-amber-950/30 border-l-2 border-amber-400 text-xs text-amber-200 font-sans">
                                                <strong class="text-amber-400 uppercase font-mono text-[10px] block mb-1">Apunte Editorial Coordinación AEE:</strong>
                                                <div>${this.renderFormattedNewsText(r.editorialNote)}</div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>

                                <div class="p-5 pt-0">
                                    <div class="pt-3 border-t border-slate-800 flex justify-between items-center flex-wrap gap-2">
                                        ${isOfficial ? `
                                            <span class="text-[11px] text-slate-400 font-mono">Por ${this.escapeHTML(r.author || 'Coordinación AEE')}</span>
                                            ${isDocente ? `
                                                <div class="flex items-center gap-2 flex-wrap">
                                                    <button type="button" onclick="ui.modalEditOfficialNews('${this.escapeHTML(r.id)}')" class="min-h-[44px] bg-amber-950/50 border border-amber-500/60 text-amber-300 hover:bg-amber-400 hover:text-black px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap">✏️ Editar Crónica</button>
                                                    <button type="button" onclick="ui.deleteOfficialNews('${this.escapeHTML(r.id)}')" class="min-h-[44px] text-red-400 hover:text-red-300 text-xs font-bold uppercase underline">🗑️ Retirar</button>
                                                </div>
                                            ` : ''}
                                        ` : `
                                            <span class="text-[10px] text-slate-500 font-mono">DOC_15 Oficial</span>
                                            <div class="flex items-center gap-2 flex-wrap">
                                                ${isDocente ? `
                                                    <button type="button" onclick="ui.modalAttachNanoBananaToPR('${this.escapeHTML(r.id)}')" class="min-h-[44px] bg-amber-950/50 border border-amber-500/60 text-amber-300 hover:bg-amber-400 hover:text-black px-3 py-1.5 text-xs font-bold uppercase transition-all whitespace-nowrap">
                                                        🖼️ ${hasImage ? 'Editar Portada IA' : 'Ilustrar (Nano Banana)'}
                                                    </button>
                                                ` : ''}
                                                <a href="${encodeURI(r.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-400 text-cyan-200 hover:bg-cyan-400 hover:text-black px-4 py-2 text-xs font-bold uppercase transition-all shadow-sm">
                                                    <span>📄 Leer Nota de Prensa Oficial</span>
                                                    <span class="text-xs font-mono">↗</span>
                                                </a>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>`;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        el.appendChild(wrapper);
    },

    getCurrentPhaseKey() {
        const now = Date.now();
        if (now <= new Date('2026-12-15T23:59:59').getTime()) return 'I';
        if (now <= new Date('2027-02-15T23:59:59').getTime()) return 'II';
        if (now <= new Date('2027-03-31T23:59:59').getTime()) return 'III';
        return 'IV';
    },

    renderActiveContractTacticalBanner(co) {
        if (!co) return '';
        const curPhase = this.getCurrentPhaseKey();
        const signed = co.contracts?.[curPhase];
        const isCEO = state.user && (state.user.role === 'CEO' || state.user.admin);
        const isMasterOrAdmin = Boolean(state.user && state.user.admin || co.unlockAllContracts === true || co.isTestCompany === true);
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[curPhase] : null;
        const isUnlocked = isMasterOrAdmin || (win && Date.now() >= new Date(win.selectionStart).getTime());

        if (!signed && !isUnlocked) {
            return '';
        }

        if (signed && signed.contractId) {
            const isCompleted = signed.status === 'CUMPLIDO';
            const isFailed = signed.status === 'NO_CUMPLIDO';
            const statusBadge = isCompleted
                ? '<span class="text-xs font-mono font-bold px-2 py-0.5 bg-emerald-950/60 border border-emerald-500 text-emerald-300">✅ CUMPLIDO (+' + signed.reward + ' €v)</span>'
                : (isFailed
                    ? '<span class="text-xs font-mono font-bold px-2 py-0.5 bg-rose-950/60 border border-rose-500 text-rose-300">❌ NO CUMPLIDO (-' + signed.penalty + ' €v)</span>'
                    : '<span class="text-xs font-mono font-bold px-2 py-0.5 bg-cyan-950/60 border border-cyan-400 text-cyan-300 animate-pulse">⏳ EN CURSO</span>');

            return `
            <div class="terminal-border bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/50 p-4 mb-6 shadow-[0_0_15px_rgba(99,102,241,0.15)]">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-[10px] font-orbitron font-bold uppercase tracking-wider px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">🤝 Misión CEO Activa • Fase ${this.escapeHTML(curPhase)}</span>
                            ${statusBadge}
                        </div>
                        <h4 class="font-orbitron font-bold text-white text-xs sm:text-sm uppercase tracking-wide break-words">${this.escapeHTML(signed.company)} — ${this.escapeHTML(signed.title)}</h4>
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed"><strong class="text-indigo-300 uppercase">Requisitos:</strong> ${this.escapeHTML(signed.requirements)}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-2 md:pt-0">
                        <div class="flex items-center gap-1.5 font-mono text-xs">
                            <span class="px-2 py-1 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 font-bold">+${signed.reward} €v</span>
                            <span class="px-2 py-1 bg-rose-950/50 border border-rose-500/40 text-rose-400 font-bold">-${signed.penalty} €v</span>
                        </div>
                        <button type="button" onclick="ui.navigate('contracts')" class="min-h-[44px] px-3 py-1.5 bg-indigo-900/40 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 font-bold text-xs uppercase tracking-wider transition-all">
                            Ver Misión ➔
                        </button>
                    </div>
                </div>
            </div>`;
        } else {
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
                    ${isCEO ? `
                        <button type="button" onclick="ui.navigate('contracts')" class="shrink-0 w-full sm:w-auto justify-center min-h-[44px] px-4 py-2 bg-mars-cyan text-black hover:bg-white font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap text-center">
                            ✍️ Elegir Contrato de Fase ${this.escapeHTML(curPhase)} ➔
                        </button>
                    ` : `
                        <span class="text-xs font-mono text-slate-500 italic">Pendiente de selección por Dirección General (CEO)</span>
                    `}
                </div>
            </div>`;
        }
    },

    isContractPhaseUnlocked(phase, co) {
        if (typeof state !== 'undefined' && typeof state.isContractPhaseUnlocked === 'function') {
            return state.isContractPhaseUnlocked(phase, co);
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || co.isTestCompany === true || (state.user && state.user.admin)) {
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
        if (co.unlockAllContracts === true || co.isTestCompany === true || co.id === 'TEST-0000' || (state.user && state.user.admin)) {
            return true;
        }
        const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [];
        const p = prPhases.find(item => item.phase === phaseKey);
        if (!p || !p.phaseCutoff) return false;
        return Date.now() >= new Date(p.phaseCutoff).getTime();
    },

    isLaunchLicenseUnlocked(co) {
        if (typeof state !== 'undefined' && typeof state.isLaunchLicenseUnlocked === 'function') {
            return state.isLaunchLicenseUnlocked(co);
        }
        if (!co && state.user) co = state.data?.companies?.[state.user.coId];
        if (!co) return false;
        if (co.unlockAllContracts === true || co.isTestCompany === true || co.id === 'TEST-0000' || (state.user && state.user.admin)) {
            return true;
        }
        const pItem = co.deliverables?.['preliminaryReport'];
        return Boolean(pItem && ((pItem.status === 'DELIVERED_TO_TEACHER' && pItem.driveUrl) || (typeof pItem === 'string' && pItem.length > 0)));
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

        const isCEO = state.user.role === 'CEO' || state.user.admin;
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

        // Bloque de Patrocinio Oficial tras Fase I
        const sponsorAwarded = co.sponsorAwarded;
        const sponsorData = co.sponsorData || {};
        const sponsorAmount = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : (sponsorData.amount || 0);

        const tierStyles = {
            'ORO': 'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10',
            'PLATA': 'text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10',
            'BRONCE': 'text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10',
            'COBRE': 'text-[#b87333] border-[#b87333] bg-[#b87333]/10',
            'COLABORADOR': 'text-mars-cyan border-mars-cyan bg-mars-cyan/10'
        };
        const sponsorStyle = sponsorAwarded ? (tierStyles[sponsorAwarded] || 'text-slate-300 border-slate-700 bg-slate-900') : '';

        const sponsorStatusBanner = sponsorAwarded ? `
            <div class="terminal-border p-4 sm:p-5 mb-4 border-t-4 border-t-amber-400 bg-mars-card">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div class="flex items-center gap-3.5">
                        ${sponsorData.logo ? `<img src="${this.escapeHTML(sponsorData.logo)}" alt="Logo Patrocinador" class="w-12 h-12 object-contain bg-black border border-slate-700 p-1 rounded-sm">` : `<span class="text-3xl">🥇</span>`}
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">Patrocinador Oficial Confirmado (Fase I)</span>
                                <span class="text-xs font-black uppercase border px-2 py-0.5 rounded-sm ${sponsorStyle}">[NIVEL ${this.escapeHTML(sponsorAwarded)}]</span>
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
            { id: 'ORO', name: 'Nivel ORO', amount: 500, emoji: '🥇', border: 'border-yellow-400', glow: 'shadow-[0_0_12px_rgba(250,204,21,0.25)]', text: 'text-yellow-300', perk: 'Dotación de patrocinio Nivel Oro' },
            { id: 'PLATA', name: 'Nivel PLATA', amount: 400, emoji: '🥈', border: 'border-slate-300', glow: 'shadow-[0_0_10px_rgba(203,213,225,0.2)]', text: 'text-slate-200', perk: 'Dotación de patrocinio Nivel Plata' },
            { id: 'BRONCE', name: 'Nivel BRONCE', amount: 250, emoji: '🥉', border: 'border-amber-600', glow: '', text: 'text-amber-400', perk: 'Dotación de patrocinio Nivel Bronce' },
            { id: 'COBRE', name: 'Nivel COBRE', amount: 150, emoji: '🔶', border: 'border-amber-700', glow: '', text: 'text-amber-500', perk: 'Dotación de patrocinio Nivel Cobre' },
            { id: 'COLABORADOR', name: 'Nivel COLABORADOR', amount: 100, emoji: '🤝', border: 'border-cyan-500', glow: '', text: 'text-cyan-300', perk: 'Dotación de patrocinio Nivel Colaborador' }
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
                            return `
                            <div class="p-3 rounded border ${t.border} ${isMyTier ? 'bg-amber-950/40 ring-2 ring-amber-400 ' + t.glow : 'bg-slate-900/60'} flex flex-col justify-between transition-all">
                                <div>
                                    <div class="flex items-center justify-between gap-1 mb-1.5">
                                        <span class="text-xl">${t.emoji}</span>
                                        ${isMyTier ? `
                                            <span class="text-[9px] font-black uppercase px-1.5 py-0.5 bg-amber-400 text-black font-mono">CONCEDIDO</span>
                                        ` : `
                                            <span class="text-[9px] font-mono uppercase text-slate-500">${sponsorAwarded ? 'Disponible' : 'En Juego'}</span>
                                        `}
                                    </div>
                                    <h4 class="font-orbitron font-bold text-xs uppercase ${t.text}">${this.escapeHTML(t.name)}</h4>
                                    <p class="text-[10px] text-slate-300 mt-1 leading-snug">${this.escapeHTML(t.perk)}</p>
                                </div>
                                <div class="mt-3 pt-2 border-t border-slate-800/80 text-right">
                                    <span class="text-sm sm:text-base font-orbitron font-black ${isMyTier ? 'text-mars-green' : t.text}">+${t.amount} €v</span>
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
                            El catálogo oficial de licitaciones corporativas y contratos estratégicos de la Fase I estará disponible para el CEO a partir del <strong>11 de Noviembre de 2026</strong>.
                        </p>
                        <p class="text-[11px] text-slate-500 font-mono mt-1">
                            Las licitaciones de fases posteriores (Fases II, III y IV) se publicarán de forma escalonada al inicio oficial de cada fase.
                        </p>
                    </div>
                    <div class="pt-2">
                        <span class="inline-block px-3.5 py-1.5 bg-amber-950/60 border border-amber-400 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                            📅 Apertura Oficial Fase I: 11/11/2026
                        </span>
                    </div>
                </div>
            ` : `
                <!-- Navegación por Fases Desbloqueadas -->
                <div class="flex flex-wrap gap-2 border-b border-mars-border pb-2">
                    ${unlockedPhases.map(ph => {
                        const isTab = ph === currentPhaseTab;
                        const cSigned = co.contracts?.[ph];
                        const badge = cSigned ? `<span class="ml-1.5 text-[10px] px-1.5 py-0.2 bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono">✓ ${this.escapeHTML(cSigned.company)}</span>` : '';
                        return `
                        <button type="button" onclick="ui.setContractsPhaseTab('${ph}')" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase transition-all flex items-center ${isTab ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-200 hover:text-white border border-slate-800'}">
                            <span>Fase ${ph}</span>
                            ${badge}
                        </button>`;
                    }).join('')}
                </div>

                <!-- Estado de la Ventana Temporal de Selección -->
                <div class="terminal-border p-4 bg-slate-950 border ${isOpen ? 'border-emerald-500/50 bg-emerald-950/10' : 'border-amber-500/40 bg-amber-950/10'} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="inline-block w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}"></span>
                            <h4 class="font-orbitron font-bold text-xs sm:text-sm uppercase ${isOpen ? 'text-emerald-300' : 'text-amber-300'}">
                                ${isOpen ? 'Ventana Oficial de Suscripción Abierta' : 'Ventana Oficial de Suscripción Cerrada / Bloqueada'}
                            </h4>
                        </div>
                        <p class="text-xs text-slate-300 mt-0.5">
                            ${win?.windowLabel || 'Primeros 3 días lectivos'}. Cada startup puede suscribir un único contrato por fase. Tras la ventana, el compromiso queda congelado.
                        </p>
                    </div>
                    ${co.unlockAllContracts ? `
                        <span class="px-2.5 py-1 text-[10px] font-mono font-bold uppercase bg-amber-400 text-black border border-amber-300 rounded shrink-0">
                            🧪 Sandbox Pruebas: Ventanas Desbloqueadas
                        </span>
                    ` : ''}
                </div>

                <!-- Contrato Actualmente Suscrito en esta Fase (si existe) -->
                ${signedForTab ? `
                    <div class="terminal-border p-5 bg-indigo-950/30 border-2 border-indigo-500/80 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-indigo-500/40 pb-2">
                            <div>
                                <span class="text-[10px] font-orbitron font-bold uppercase tracking-widest text-indigo-300">Contrato Oficial Vinculante Suscrito</span>
                                <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase">${this.escapeHTML(signedForTab.company)} — ${this.escapeHTML(signedForTab.title)}</h3>
                            </div>
                            <div class="flex items-center gap-2">
                                ${signedForTab.status === 'CUMPLIDO' ? `
                                    <span class="px-3 py-1 bg-emerald-500 text-black font-black text-xs uppercase font-orbitron">✅ Cumplido (+${signedForTab.reward} €v Asignados)</span>
                                ` : (signedForTab.status === 'NO_CUMPLIDO' ? `
                                    <span class="px-3 py-1 bg-rose-600 text-white font-black text-xs uppercase font-orbitron">❌ No Cumplido (-${signedForTab.penalty} €v Penalizados)</span>
                                ` : `
                                    <span class="px-3 py-1 bg-indigo-500/30 border border-indigo-400 text-indigo-200 font-bold text-xs uppercase font-mono animate-pulse">⏳ En Curso • Pendiente de Auditoría Docente</span>
                                `)}
                            </div>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div class="md:col-span-2">
                                <span class="text-slate-400 font-bold uppercase block mb-0.5">Requisitos Operativos Exigidos:</span>
                                <p class="text-white leading-relaxed font-sans">${this.escapeHTML(signedForTab.requirements)}</p>
                                <span class="text-slate-400 font-bold uppercase block mt-2 mb-0.5">Método de Verificación Docente:</span>
                                <p class="text-indigo-300 font-sans">${this.escapeHTML(signedForTab.verification)}</p>
                            </div>
                            <div class="bg-black/60 p-3 border border-indigo-500/30 flex flex-col justify-between">
                                <div>
                                    <span class="text-slate-400 font-bold uppercase block text-[10px]">Impacto en Tesorería:</span>
                                    <div class="flex justify-between items-center mt-1">
                                        <span class="text-emerald-400 font-mono font-bold">+${signedForTab.reward} €v (Éxito)</span>
                                        <span class="text-rose-400 font-mono font-bold">-${signedForTab.penalty} €v (Fallo)</span>
                                    </div>
                                </div>
                                <div class="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                                    <span>Firmado: ${this.escapeHTML(signedForTab.signedDate || '--')}</span><br>
                                    <span>Por: Dirección General (${this.escapeHTML(signedForTab.signedBy || 'CEO')})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ` : ''}

                <!-- Catálogo de Licitaciones de la Fase (6 Contratos) -->
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
                                            <button type="button" disabled class="w-full min-h-[44px] bg-slate-900 border border-slate-800 text-amber-400/70 text-xs font-bold uppercase font-mono cursor-not-allowed">
                                                🔒 Ventana Cerrada
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