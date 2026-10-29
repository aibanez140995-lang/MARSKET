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
        const notif = co.notifications.find(n => n.id === id);
        if (notif) {
            notif.read = true;
            notif.updatedAt = Date.now();
        }
        co.updatedAt = Date.now();
        state.save();
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
        <div role="tablist" aria-label="Secciones del Dossier Académico" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-2">
            <button type="button" role="tab" aria-selected="${tab==='eval'}" onclick="ui.showDossierTab('eval')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📊 Evaluación Continua (100%)</button>
            <button type="button" role="tab" aria-selected="${tab==='docs'}" onclick="ui.showDossierTab('docs')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📁 Bóveda de Entregables (19)</button>
        </div>
        <div id="dossier-content" class="w-full"></div>
        `;
        el.appendChild(wrapper);
        this.renderDossierContent(tab, coId);
    },

    showDossierTab(tab) {
        this.dossierTab = tab;
        this.render();
    },

    renderDossierContent(tab, coId) {
        const container = document.getElementById('dossier-content');
        if (!container || !state.user) return; 
        
        // Blindaje FASE 4: Un alumno jamás puede inspeccionar otro coId distinto al de su sesión congelada
        const targetCoId = state.user.admin ? (coId || Object.keys(state.data.companies)[0]) : state.user.coId;
        const co = state.data.companies[targetCoId];
        if (!state.user.admin && !co) return auth.logout();
        if (!co) return;
        
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };

        if(tab === 'eval') {
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
            container.innerHTML = html;
        } else {
            // MÓDULO B (v1.0.19): Bóveda de Entregables con Acordeones por Fase (Milestone Collapsible) y Detalle Bajo Demanda (Bottom-Sheet Drawer)
            const docs = co.deliverables || {};
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const isAdmin = Boolean(state.user && state.user.admin);
            const activeDefs = (!isAdmin) ? defs.filter(d => !ui.isDeliverableLocked(d.key, co)) : defs;
            const deliveredCount = activeDefs.filter(d => docs[d.key] && docs[d.key].status === 'DELIVERED_TO_TEACHER').length;
            const activeGroup = this.activeMilestoneGroup || 'PHASE_I';
            const isCEO = state.user && state.user.role === 'CEO';

            const milestonePhases = [
                {
                    id: 'PHASE_I',
                    phaseCode: 'I',
                    title: 'FASE I: LANZAMIENTO, I+D PRELIMINAR Y ESTRATEGIA (NOV - DIC)',
                    badge: 'FASE I // INICIAL',
                    accent: 'border-mars-cyan text-mars-cyan'
                },
                {
                    id: 'PHASE_II',
                    phaseCode: 'II',
                    title: 'FASE II: PROTOTIPADO Y VALIDACIÓN EMPÍRICA (ENE - FEB)',
                    badge: 'FASE II // EMPÍRICA',
                    accent: 'border-mars-yellow text-mars-yellow'
                },
                {
                    id: 'PHASE_III',
                    phaseCode: 'III',
                    title: 'FASE III: TRACCIÓN, CAMPAÑAS Y ESCALADO COMERCIAL (FEB - MAR)',
                    badge: 'FASE III // TRACCIÓN',
                    accent: 'border-blue-400 text-blue-400'
                },
                {
                    id: 'PHASE_IV',
                    phaseCode: 'IV',
                    title: 'FASE IV: CIERRE DE MISIÓN, ENSAMBLE FINAL Y DEFENSA (ABRIL)',
                    badge: 'FASE IV // CIERRE',
                    accent: 'border-mars-magenta text-mars-magenta'
                }
            ];

            const visiblePhases = milestonePhases.map(phase => {
                let phaseDefs = defs.filter(d => (d.phase || 'I') === phase.phaseCode);
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

                    const templateBtn = sched.guideDocUrl
                        ? `<a href="${encodeURI(sched.guideDocUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-mars-cyan border border-mars-cyan/30 rounded hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"><span>📄 VER PLANTILLA DOCENTE ↗</span></a>`
                        : '';

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
                        </div>
                        <span class="text-mars-cyan font-orbitron font-black text-sm shrink-0 px-2 py-1 border border-slate-700 bg-black">${isExpanded ? '▲ PLEGAR' : '▼ DESPLEGAR'}</span>
                    </button>
                    <div class="${isExpanded ? 'block' : 'hidden'} p-3 sm:p-4 space-y-2.5 border-t border-mars-border bg-black/40">
                        ${itemsHtml}
                    </div>
                </div>`;
            }).join('');

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
                        <p class="text-xs text-slate-300 mt-1 leading-relaxed">Supervisa la Bóveda de 19 Hitos dividida en 4 Fases y las calificaciones ponderadas de los 6 docentes.</p>
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

    setRoleDeliverablesScopeFilter(scope) {
        this.roleDeliverablesScope = scope || 'MY_ROLE';
        this.render();
    },

    viewRoleDeliverables(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

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
            filteredDefs = filteredDefs.filter(d => (d.phase || 'I') === phaseFilter);
        }

        // 4. Filtrado por Estado
        if (statusFilter === 'ACTION_REQUIRED') {
            filteredDefs = filteredDefs.filter(d => docs[d.key] && (docs[d.key].status === 'CEO_REVISION' || docs[d.key].status === 'DEVUELTO_A_TECNICO'));
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

        // Renderizado del resumen con contadores interactivos
        const summaryHtml = `
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('COMPLETED')" class="terminal-border p-4 text-left transition-all ${statusFilter === 'COMPLETED' ? 'bg-emerald-950/60 border-2 border-emerald-400 shadow-[0_0_12px_rgba(0,255,102,0.3)]' : 'bg-mars-card border-t-2 border-t-mars-green hover:border-mars-green'}">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">🟢 Entregados a Docente</span>
                <p class="text-xl sm:text-2xl font-orbitron font-black text-mars-green">${deliveredCount}</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Calificación final</span>
            </button>
            <button type="button" onclick="ui.setRoleDeliverablesStatusFilter('ALL')" class="terminal-border p-4 text-left transition-all ${statusFilter === 'ALL' && ceoReviewCount > 0 ? 'bg-amber-950/60 border-2 border-amber-400' : 'bg-mars-card border-t-2 border-t-mars-yellow hover:border-mars-yellow'}">
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
            { id: 'I', label: 'Fase I (Nov-Dic)' },
            { id: 'II', label: 'Fase II (Ene-Feb)' },
            { id: 'III', label: 'Fase III (Feb-Mar)' },
            { id: 'IV', label: 'Fase IV (Abril)' }
        ].map(p => `
            <button type="button" role="tab" aria-selected="${phaseFilter === p.id}" onclick="ui.setRoleDeliverablesPhaseFilter('${p.id}')" class="min-h-[44px] px-3.5 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${phaseFilter === p.id ? 'bg-mars-cyan text-black shadow-sm' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">
                ${p.label}
            </button>
        `).join('');

        const statusTabsHtml = [
            { id: 'ALL', label: 'Todos los Estados' },
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
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan text-mars-cyan">FASE ${def.phase || 'I'}</span>
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
                            <span class="text-xs text-slate-400 font-mono">18 HITOS CURRICULARES</span>
                        </div>
                        <h2 class="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-tight">
                            📤 Mis Entregables & Control de Calidad
                        </h2>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Gestión visual guiada paso a paso: Plantilla ➔ Drive ➔ Visado CEO ➔ Claustro.</p>
                    </div>
                    ${scopeSwitchHtml}
                </div>

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
            </div>

            <!-- LISTADO DE ENTREGABLES -->
            <div class="space-y-4">
                ${cardsHtml}
            </div>
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
                <span class="text-mars-cyan font-bold uppercase block mb-1">ENTREGABLE OFICIAL // FASE ${def.phase || 'I'}</span>
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
    }
});