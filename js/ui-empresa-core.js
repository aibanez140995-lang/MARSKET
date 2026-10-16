// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN, NOTIFICACIONES Y DOSSIER ACADÉMICO (17 ENTREGABLES) ---

Object.assign(ui, {
    viewLogin(el) {
        if (!el) return; // REGLA 3: Manipulación segura del DOM
        let coOptions = Object.keys(state.data.companies).map(k => `<option value="${k}">${state.data.companies[k].name}</option>`).join('');
        el.innerHTML = `
        <div class="min-h-[75vh] flex items-center justify-center w-full px-4">
            <div id="login-box" class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300 transition-all">
                <img src="/logo.png" alt="MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
                <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-6 tracking-widest uppercase font-black">Secure_Access</h2>
                <select id="login-co" onchange="auth.updateRoleOptions()" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-4 outline-none focus:border-mars-cyan text-white">
                    ${coOptions}
                    <option value="admin" class="text-mars-yellow font-bold">CLAUSTRO DOCENTE</option>
                </select>
                <select id="login-role" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-6 outline-none focus:border-mars-cyan uppercase text-white font-bold">
                    <option>CEO</option><option>Técnico</option><option>Finanzas</option><option>Marketing</option><option>Operaciones IA</option><option>Auxiliar</option>
                </select>
                <div class="flex justify-center gap-4 mb-8">
                    ${[1,2,3,4].map(() => `<div class="pin-dot w-3 h-3 rounded-full border border-mars-cyan transition-all"></div>`).join('')}
                </div>
                <div id="login-keypad" class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto transition-all">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="auth.press('${n}')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                    <button onclick="auth.clear()" class="bg-slate-800 p-4 text-mars-magenta text-xs font-bold hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                    <button onclick="auth.press('0')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                    <button onclick="auth.verify()" class="bg-mars-green/20 border border-mars-green text-mars-green p-4 text-xs font-bold hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
                </div>
            </div>
        </div>`;
        setTimeout(() => auth.updateRoleOptions(), 50);
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
            title.classList.remove('text-mars-cyan');
            title.classList.add('text-mars-green', 'glitch-text');
        }
        if (keypad) {
            keypad.classList.add('hidden');
        }
    },

    renderNotifications() {
        if (!state.user) return ''; // REGLA 2: Ghost clicks y sesión
        const co = state.data.companies[state.user.coId];
        if (!co) return ''; // REGLA 4: Sesión huérfana
        
        co.notifications = co.notifications || []; // REGLA 1: Blindaje
        
        const myNotifs = co.notifications.filter(n => n.role === state.user.role && !n.read);
        if (myNotifs.length === 0) return '';
        
        return `<div class="mb-6 space-y-2 animate-in fade-in slide-in-from-top-4">
            ${myNotifs.map(n => {
                let colors = 'border-mars-cyan bg-mars-cyan/10 text-mars-cyan';
                if (n.type === 'error') colors = 'border-mars-magenta bg-mars-magenta/10 text-mars-magenta';
                if (n.type === 'success') colors = 'border-mars-green bg-mars-green/10 text-mars-green';
                if (n.type === 'warning') colors = 'border-mars-yellow bg-mars-yellow/10 text-mars-yellow';
                
                return `
                <div class="flex justify-between items-center p-3 border ${colors} shadow-sm">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold uppercase leading-tight">${n.message}</span>
                        <span class="text-[8px] opacity-70 mt-1">${n.date}</span>
                    </div>
                    <button onclick="ui.dismissNotification('${n.id}')" class="px-3 py-1 font-black hover:text-white transition-colors text-xs">X</button>
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
            el.innerHTML = `<div class="p-6 text-center text-slate-500">No hay startups registradas.</div>`;
            return;
        }
        
        const tab = this.dossierTab || 'eval';
        const wrapper = document.createElement('div');
        
        let adminSelector = '';
        if (state.user.admin) {
            adminSelector = `
            <div class="mb-6 bg-slate-900 p-3 border border-mars-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div class="flex items-center gap-3 w-full sm:w-auto">
                    <span class="text-mars-cyan font-bold text-[10px] uppercase whitespace-nowrap">Inspeccionando Dossier de:</span>
                    <select onchange="ui.dossierSelectedCo=this.value; ui.render()" class="bg-black border border-mars-cyan text-white text-xs p-2 outline-none w-full sm:w-auto font-bold uppercase">
                        ${Object.keys(state.data.companies).map(k => `<option value="${k}" ${coId===k?'selected':''}>${state.data.companies[k].name} [Clase${state.data.companies[k].classGroup || 'A'}]</option>`).join('')}
                    </select>
                </div>
                <span class="text-[9px] text-mars-yellow uppercase font-bold">Modo Supervisión Docente</span>
            </div>`;
        }
        
        wrapper.innerHTML = `
        ${adminSelector}
        <div class="flex gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showDossierTab('eval')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">📊 Evaluación Continua (100%)</button>
            <button onclick="ui.showDossierTab('docs')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">📁 Archivo Documental Oficial</button>
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
        
        const targetCoId = coId || state.user.coId;
        const co = state.data.companies[targetCoId];
        if (!state.user.admin && !co) return auth.logout();
        if (!co) return;
        
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };

        if(tab === 'eval') {
            const subjects = ['FYQ', 'LYE', 'LEN', 'ECO', 'MAT', 'ING'];
            
            // Cálculo de Nota Global Ponderada
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
                    <p class="text-[9px] text-slate-400 uppercase mt-1">Fórmula Oficial: FYQ (25%) + LYE (40%) + LEN (15%) + ECO (10%) + MAT (5%) + ING (5%)</p>
                </div>
                <div class="flex items-center gap-4 bg-black px-4 py-2 border border-mars-border self-end sm:self-center">
                    <div class="text-right">
                        <span class="block text-[8px] text-slate-500 uppercase font-bold">Peso Evaluado: ${progressPct}%</span>
                        <span class="text-[9px] text-mars-cyan font-bold uppercase">Nota Acumulada</span>
                    </div>
                    <span class="text-2xl sm:text-3xl font-orbitron font-black ${hasAnyGrade ? 'text-mars-green' : 'text-slate-600'}">${globalNoteDisplay}</span>
                </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
            
            subjects.forEach(sub => {
                const config = RUBRIC_CONFIG[sub];
                if (!config) return;
                const grade = (co.grades && co.grades[sub]) ? co.grades[sub] : { scores: {}, feedback: '', final: null };
                const subWeightPct = Math.round((weights[sub] || 0) * 100);
                
                html += `
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan w-full flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-center mb-3 border-b border-mars-border/50 pb-2">
                            <div>
                                <h3 class="font-orbitron text-mars-cyan text-xs uppercase">${config.name}</h3>
                                <span class="text-[8px] bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40 px-1.5 py-0.5 font-bold uppercase inline-block mt-1">Representación en Proyecto: ${subWeightPct}%</span>
                            </div>
                            <span class="text-xl font-mono font-black ${grade.final !== null && grade.final !== undefined ? 'text-mars-green' : 'text-slate-600'}">${grade.final !== null && grade.final !== undefined ? Number(grade.final).toFixed(2) : '--'}</span>
                        </div>
                        <div class="space-y-2 mb-3 w-full">
                            ${config.criteria.map(c => `
                            <div class="flex justify-between text-[9px] uppercase w-full border-b border-slate-800/60 pb-1">
                                <span class="text-slate-400 pr-2">${c.name} (${Math.round(c.weight*100)}%)</span>
                                <span class="font-mono font-bold shrink-0 ${grade.scores && grade.scores[c.id] !== undefined ? 'text-white' : 'text-slate-600'}">${grade.scores && grade.scores[c.id] !== undefined ? grade.scores[c.id] : '-'}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                    ${grade.feedback ? `<div class="bg-black p-2.5 border border-slate-800 text-[9px] text-slate-300 italic w-full mt-2"><span class="text-mars-yellow font-bold not-italic block mb-0.5 uppercase text-[8px]">Feedback Docente:</span>"${grade.feedback}"</div>` : '<div class="text-[8px] text-slate-600 italic uppercase mt-2">Sin observaciones registradas todavía.</div>'}
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            const docs = co.deliverables || {};
            const allKeys = [
                'preliminaryReport', 'technicalReport',
                'brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'businessModelCanvas', 'decisionDiary_dec', 'decisionDiary_apr',
                'investorDossier',
                'budgetInitial', 'incomeStatement', 'budgetPostProto', 'balanceSheet',
                'goniometerEvidence', 'mathReportDist', 'mathReportTwoPoints', 'mathReportFinal',
                'oralPresentation', 'writtenEssays'
            ];
            const deliveredCount = allKeys.filter(k => !!docs[k]).length;

            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-4 mb-6 border-l-4 border-l-mars-cyan flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-sm uppercase">Estado del Repositorio Oficial de Entregables</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-0.5">Auditoría centralizada de evidencias documentales por departamento curricular.</p>
                </div>
                <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-xs font-mono font-black uppercase">Entregados: ${deliveredCount} / ${allKeys.length}</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <!-- Física y Química -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <h4 class="font-orbitron text-mars-cyan text-xs uppercase">🧪 Física y Química (25%)</h4>
                        <span class="text-[8px] text-slate-400 uppercase">Resp: Dpto. Técnico</span>
                    </div>
                    ${this.renderDocBadge('1. Hoja de Registro Preliminar (Fase I)', docs.preliminaryReport)}
                    ${this.renderDocBadge('2. Informe Técnico Exhaustivo (Fase II)', docs.technicalReport)}
                </div>

                <!-- Economía -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-green">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <h4 class="font-orbitron text-mars-green text-xs uppercase">💰 Economía (10%)</h4>
                        <span class="text-[8px] text-slate-400 uppercase">Resp: Dpto. Finanzas</span>
                    </div>
                    ${this.renderDocBadge('1. Presupuesto Inicial', docs.budgetInitial)}
                    ${this.renderDocBadge('2. Cuenta de Resultados', docs.incomeStatement)}
                    ${this.renderDocBadge('3. Presupuesto Post-Prototipo', docs.budgetPostProto)}
                    ${this.renderDocBadge('4. Balance de Situación Simplificado', docs.balanceSheet)}
                </div>

                <!-- Liderazgo y Emprendimiento -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-yellow lg:col-span-2">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <h4 class="font-orbitron text-mars-yellow text-xs uppercase">🚀 Liderazgo y Emprendimiento (40%)</h4>
                        <span class="text-[8px] text-slate-400 uppercase">Resp: Marketing / CEO / Operaciones IA</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        ${this.renderDocBadge('1A. Identidad de Marca y Misión — DICIEMBRE', docs.brandIdentity_dec)}
                        ${this.renderDocBadge('1B. Identidad de Marca y Misión — ABRIL', docs.brandIdentity_apr)}
                        ${this.renderDocBadge('2. Business Model (Documento Escrito)', docs.businessModelDoc)}
                        ${this.renderDocBadge('3. Business Model Canvas', docs.businessModelCanvas)}
                        ${this.renderDocBadge('4A. Diario Decisiones, Conflictos e IA — DICIEMBRE', docs.decisionDiary_dec)}
                        ${this.renderDocBadge('4B. Diario Decisiones, Conflictos e IA — ABRIL', docs.decisionDiary_apr)}
                    </div>
                </div>

                <!-- Matemáticas -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-yellow">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <h4 class="font-orbitron text-mars-yellow text-xs uppercase">📐 Matemáticas (5%)</h4>
                        <span class="text-[8px] text-slate-400 uppercase">Resp: Dpto. Técnico</span>
                    </div>
                    ${this.renderDocBadge('1. Elaboración de Goniómetro/s', docs.goniometerEvidence)}
                    ${this.renderDocBadge('2. Informe: Distancia Conocida a Base', docs.mathReportDist)}
                    ${this.renderDocBadge('3. Informe: Dos Mediciones Separadas', docs.mathReportTwoPoints)}
                    ${this.renderDocBadge('4. Informe Técnico Final Comparativo', docs.mathReportFinal)}
                </div>

                <!-- Lengua Castellana e Inglés -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-magenta">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <h4 class="font-orbitron text-mars-magenta text-xs uppercase">🗣️ Lengua Castellana (15%) & Inglés (5%)</h4>
                        <span class="text-[8px] text-slate-400 uppercase">Resp: Marketing / Equipo</span>
                    </div>
                    ${this.renderDocBadge('LEN: Dossier para Inversores (Texto Argumentativo)', docs.investorDossier)}
                    ${this.renderDocBadge('ING: Expresión Oral (Presentación Prototipo)', docs.oralPresentation)}
                    ${this.renderDocBadge('ING: Redacciones Escritas', docs.writtenEssays)}
                </div>
            </div>`;
        }
    }
});