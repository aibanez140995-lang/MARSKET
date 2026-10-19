// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN EN 2 PASOS (ZERO-KNOWLEDGE), NOTIFICACIONES Y DOSSIER ACADÉMICO (v1.0.19) ---

Object.assign(ui, {
    viewLogin(el) {
        if (!el) return;
        const verifiedCoId = typeof auth !== 'undefined' ? auth.verifiedCoId : null;
        const isOffline = typeof state !== 'undefined' && state.isCloudOnline === false;
        const offlineHtml = `
            <div id="login-offline-notice" role="status" aria-live="polite" class="${isOffline ? 'mt-3 pt-2 border-t border-mars-yellow/30 text-center' : 'hidden'}">
                <p class="text-xs text-mars-yellow font-mono tracking-wider">⚠️ MODO LOCAL // SIN CONEXIÓN CON NUBE D1</p>
            </div>
        `;

        // PASO 1: Solicitud de Código Privado de Empresa (Pasarela Docente oculta tras doble clic/tap en #marsket-logo)
        if (!verifiedCoId) {
            el.innerHTML = `
            <div id="login-box" class="max-w-sm sm:max-w-md w-full terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto">
                <img id="marsket-logo" src="logo.png" alt="Logo oficial MARS-KET 2.0" width="72" height="72" onclick="auth.handleLogoTrigger(event)" ondblclick="auth.handleLogoTrigger(event)" style="touch-action: manipulation; width: clamp(48px, 9vh, 72px); height: clamp(48px, 9vh, 72px);" class="mx-auto mb-2 sm:mb-3 drop-shadow-[0_0_12px_rgba(0,240,255,0.8)] cursor-pointer select-none object-contain" onerror="this.onerror=null;this.src='logo.png';">
                <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-sm sm:text-base tracking-wider uppercase font-black mb-1" style="font-size: clamp(0.95rem, 2.2vh, 1.2rem);">SECURE_GATEWAY</h2>
                <p class="text-xs text-slate-300 text-center uppercase tracking-normal sm:tracking-wider mb-3 sm:mb-4">Paso 1/2: Identificación de Entidad</p>
                
                <div class="bg-black/60 border border-mars-border p-3 sm:p-4">
                    <label for="login-company-code" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5 tracking-wider">Código Privado de Empresa</label>
                    <input type="text" id="login-company-code" autocomplete="off" placeholder="EJ: AST-1010" style="touch-action: manipulation; font-size: 16px;" onkeydown="if(event.key==='Enter') auth.validateCompanyCode()" onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="w-full bg-slate-900 border border-mars-cyan/60 p-2.5 sm:p-3 text-center font-orbitron font-black uppercase tracking-widest text-mars-yellow outline-none focus:border-mars-cyan mb-3 min-h-[48px]">
                    <button type="button" onclick="auth.validateCompanyCode()" style="touch-action: manipulation;" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-3 text-xs uppercase tracking-normal sm:tracking-wider hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)] whitespace-nowrap">[ VALIDAR CÓDIGO ]</button>
                </div>
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
        <div id="login-box" class="max-w-sm sm:max-w-md w-full terminal-border bg-mars-card p-4 sm:p-6 glow-cyan animate-in fade-in zoom-in duration-300 transition-all mx-auto my-auto">
            <div class="flex justify-between items-center border-b border-mars-border pb-2.5 mb-3 gap-2">
                <div class="flex items-center gap-2 min-w-0">
                    <img src="logo.png" alt="MARS-KET 2.0" width="28" height="28" class="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,240,255,0.7)] shrink-0">
                    <span class="text-xs text-slate-300 uppercase font-bold tracking-normal sm:tracking-wider truncate">Paso 2/2: Credencial</span>
                </div>
                <button type="button" onclick="auth.resetCompanyStep()" class="min-h-[44px] text-xs text-mars-magenta hover:text-white uppercase font-black tracking-normal sm:tracking-wider border border-mars-magenta/60 px-2.5 py-1.5 shrink-0 whitespace-nowrap">[⬅ Cambiar]</button>
            </div>

            <div class="bg-slate-900/90 border ${isTeacher ? 'border-mars-yellow' : 'border-mars-cyan'} p-2.5 sm:p-3 mb-3 text-center">
                <p class="text-xs text-slate-400 uppercase tracking-wider">Entidad Verificada</p>
                <h2 id="login-title" class="font-orbitron ${isTeacher ? 'text-mars-yellow' : 'text-mars-cyan'} text-sm sm:text-base tracking-wider uppercase font-black truncate mt-0.5">${this.escapeHTML(entityLabel)}</h2>
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
                <div class="flex justify-between items-center gap-3 p-3 border ${colors} shadow-sm">
                    <div class="flex flex-col min-w-0">
                        <span class="text-xs font-bold uppercase leading-relaxed break-words">${this.escapeHTML(n.message)}</span>
                        <span class="text-xs text-slate-300 mt-1">${this.escapeHTML(n.date)}</span>
                    </div>
                    <button type="button" aria-label="Descartar notificación" onclick="ui.dismissNotification('${this.escapeHTML(n.id)}')" class="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center font-black hover:text-white transition-colors text-xs border border-current/40 shrink-0">✕</button>
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
        if (notif) notif.read = true;
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
            const deliveredCount = defs.filter(d => !!docs[d.key]).length;
            const activeGroup = this.activeMilestoneGroup || 'ACTIVE';

            const milestonePhases = [
                {
                    id: 'ACTIVE',
                    title: 'FASE 1 (EN CURSO): LANZAMIENTO, I+D PRELIMINAR Y ESTRATEGIA (NOV - DIC 2026)',
                    badge: 'FASE ACTIVA',
                    accent: 'border-mars-cyan text-mars-cyan',
                    keys: ['budgetInitial', 'goniometerEvidence', 'businessModelDoc', 'businessModelCanvas', 'mathReportDist', 'investorDossier', 'brandIdentity_dec', 'preliminaryReport', 'decisionDiary_dec', 'incomeStatement']
                },
                {
                    id: 'PHASE_2',
                    title: 'FASE 2: AJUSTE POST-PROTOTIPO Y TRIANGULACIÓN (FEBRERO 2027)',
                    badge: 'HITO INTERMEDIO',
                    accent: 'border-mars-yellow text-mars-yellow',
                    keys: ['budgetPostProto', 'mathReportTwoPoints']
                },
                {
                    id: 'PHASE_3',
                    title: 'FASE 3: CONSOLIDACIÓN TÉCNICA, BALANCE Y DEFENSA FINAL (ABRIL 2027)',
                    badge: 'CIERRE DE MISIÓN',
                    accent: 'border-mars-magenta text-mars-magenta',
                    keys: ['brandIdentity_apr', 'balanceSheet', 'mathReportFinal', 'technicalReport', 'decisionDiary_apr', 'oralPresentation', 'writtenEssays']
                }
            ];

            const accordionsHtml = milestonePhases.map(phase => {
                const phaseDefs = phase.keys.map(k => defs.find(d => d.key === k)).filter(Boolean);
                const phaseDelivered = phaseDefs.filter(d => !!docs[d.key]).length;
                const isExpanded = activeGroup === phase.id;

                const itemsHtml = phaseDefs.map(def => {
                    const docObj = docs[def.key];
                    const dlDate = (state.data.config?.deadlines && state.data.config.deadlines[def.key]) ? state.data.config.deadlines[def.key] : def.defaultDate;
                    const dlStatus = this.getDeadlineStatus(dlDate);
                    return `
                    <div class="bg-slate-900/90 border ${docObj ? 'border-mars-green/60' : 'border-slate-800'} p-3.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="min-w-0 flex-grow">
                            <div class="flex flex-wrap items-center gap-1.5 mb-1">
                                <span class="text-xs font-black px-2 py-0.5 border border-mars-cyan/60 text-mars-cyan bg-mars-cyan/10 uppercase">${this.escapeHTML(def.subject)} (${this.escapeHTML(def.weight)})</span>
                                <span class="text-xs font-black px-2 py-0.5 uppercase ${docObj ? 'bg-mars-green/20 text-mars-green border border-mars-green' : 'bg-mars-magenta/20 text-mars-magenta border border-mars-magenta'}">${docObj ? '✓ ENTREGADO' : '⏳ PENDIENTE'}</span>
                                <span class="text-xs font-bold px-2 py-0.5 uppercase ${dlStatus.class}">${this.escapeHTML(dlStatus.text)}</span>
                            </div>
                            <p class="text-white font-bold uppercase text-xs sm:text-sm break-words">${this.escapeHTML(def.name)}</p>
                            <p class="hidden sm:block text-xs text-slate-300 uppercase mt-0.5">Responsable: <span class="text-mars-yellow font-bold">${this.escapeHTML(def.role.replace('_',' '))}</span> | Plazo: ${this.escapeHTML(dlDate.replace('T', ' '))}</p>
                        </div>
                        <div class="flex items-center gap-2 w-full sm:w-auto shrink-0">
                            <button type="button" onclick="ui.inspectDeliverableDrawer('${this.escapeHTML(targetCoId)}', '${this.escapeHTML(def.key)}')" class="min-h-[44px] flex-1 sm:flex-initial bg-slate-800 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-black uppercase text-xs px-3 py-2 transition-all">
                                [ 🔍 INSPECCIONAR ]
                            </button>
                            ${docObj ? `<a href="${this.escapeHTML(docObj.dataUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-3 py-2 hover:bg-white transition-all flex items-center justify-center">🔗 ABRIR</a>` : ''}
                        </div>
                    </div>`;
                }).join('');

                return `
                <div class="terminal-border bg-mars-card border-l-4 ${phase.accent.split(' ')[0]} overflow-hidden">
                    <button type="button" aria-expanded="${isExpanded}" onclick="ui.toggleMilestoneAccordion('${phase.id}')" class="w-full min-h-[52px] p-4 flex justify-between items-center gap-3 text-left bg-slate-900/70 hover:bg-slate-900 transition-all">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 flex-wrap mb-1">
                                <span class="text-xs font-black uppercase px-2 py-0.5 border ${phase.accent} bg-black">${phase.badge}</span>
                                <span class="text-xs text-slate-300 font-mono uppercase">Completados: <strong class="text-white">${phaseDelivered}/${phaseDefs.length}</strong></span>
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
                    <p class="text-xs text-slate-300 uppercase mt-1">Solo la fase activa se despliega por defecto. Pulsa [ 🔍 INSPECCIONAR ] para abrir la rúbrica y detalles en el Drawer táctil.</p>
                </div>
                <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-xs font-mono font-black uppercase">Entregados: ${deliveredCount} / ${defs.length}</span>
            </div>
            <div class="space-y-4 w-full">
                ${accordionsHtml}
            </div>`;
        }
    }
});