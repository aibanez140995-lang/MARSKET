// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN EN 2 PASOS (ANTI-ESPIONAJE), NOTIFICACIONES Y DOSSIER ACADÉMICO (v1.0.16) ---

Object.assign(ui, {
    viewLogin(el) {
        if (!el) return;
        const verifiedCoId = typeof auth !== 'undefined' ? auth.verifiedCoId : null;

        // PASO 1: Solicitud de Código Privado de Empresa (Ninguna empresa se expone en el DOM)
        if (!verifiedCoId) {
            el.innerHTML = `
            <div class="min-h-[75vh] flex items-center justify-center w-full px-3 sm:px-4 py-4">
                <div id="login-box" class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300 transition-all">
                    <img src="logo.png" alt="Logo oficial MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
                    <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-2 tracking-widest uppercase font-black">Secure_Gateway</h2>
                    <p class="text-xs text-slate-300 text-center uppercase tracking-wider mb-6">Paso 1/2: Identificación de Entidad Aeroespacial</p>
                    
                    <div class="bg-black/60 border border-mars-border p-4 mb-6">
                        <label for="login-company-code" class="text-xs text-mars-cyan uppercase font-bold block mb-2 tracking-wider">Código Privado de Empresa</label>
                        <input type="text" id="login-company-code" autocomplete="off" placeholder="EJ: AST-1010" onkeydown="if(event.key==='Enter') auth.validateCompanyCode()" class="w-full bg-slate-900 border border-mars-cyan/60 p-3 text-center text-base sm:text-lg font-orbitron font-black uppercase tracking-widest text-mars-yellow outline-none focus:border-mars-cyan mb-4 min-h-[48px]">
                        <button type="button" onclick="auth.validateCompanyCode()" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-4 text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]">[ VALIDAR CÓDIGO DE EMPRESA ]</button>
                    </div>

                    <div class="border-t border-mars-border pt-4 text-center">
                        <button type="button" onclick="auth.activateTeacherLogin()" class="min-h-[44px] px-3 py-2 text-xs text-mars-yellow hover:text-white uppercase font-bold tracking-wider underline decoration-dashed underline-offset-4 transition-colors">🎖️ Acceso Exclusivo Claustro Docente</button>
                    </div>
                </div>
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
        <div class="min-h-[75vh] flex items-center justify-center w-full px-3 sm:px-4 py-4">
            <div id="login-box" class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300 transition-all">
                <div class="flex justify-between items-center border-b border-mars-border pb-3 mb-4 gap-2">
                    <div class="flex items-center gap-2">
                        <img src="logo.png" alt="MARS-KET 2.0" class="w-7 h-7 object-contain drop-shadow-[0_0_6px_rgba(0,240,255,0.7)]">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider">Paso 2/2: Credencial</span>
                    </div>
                    <button type="button" onclick="auth.resetCompanyStep()" class="min-h-[44px] text-xs text-mars-magenta hover:text-white uppercase font-black tracking-wider border border-mars-magenta/60 px-3 py-1.5">[⬅ Cambiar Entidad]</button>
                </div>

                <div class="bg-slate-900/90 border ${isTeacher ? 'border-mars-yellow' : 'border-mars-cyan'} p-3 mb-4 text-center">
                    <p class="text-xs text-slate-300 uppercase tracking-wider">Entidad Verificada</p>
                    <h2 id="login-title" class="font-orbitron ${isTeacher ? 'text-mars-yellow' : 'text-mars-cyan'} text-base sm:text-lg tracking-widest uppercase font-black break-words mt-1">${this.escapeHTML(entityLabel)}</h2>
                </div>

                <label for="login-role" class="text-xs text-slate-300 uppercase font-bold block mb-1.5">Selecciona tu Departamento / Rol</label>
                <select id="login-role" onchange="auth.clear()" class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-3 text-sm mb-5 outline-none focus:border-mars-cyan uppercase text-white font-bold"></select>
                
                <div class="flex justify-center gap-4 mb-5" role="status" aria-label="Indicador de dígitos de PIN introducidos">
                    ${[1,2,3,4].map(() => `<div class="pin-dot w-3.5 h-3.5 rounded-full border-2 border-mars-cyan transition-all"></div>`).join('')}
                </div>
                <div id="login-keypad" role="group" aria-label="Teclado numérico de PIN (también admite teclado físico 0-9, Backspace y Enter)" class="grid grid-cols-3 gap-2.5 max-w-[240px] mx-auto transition-all">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button type="button" aria-label="Dígito ${n}" onclick="auth.press('${n}')" class="min-h-[48px] bg-slate-800 border border-slate-700 p-3 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                    <button type="button" aria-label="Borrar PIN" onclick="auth.clear()" class="min-h-[48px] bg-slate-800 border border-mars-magenta/50 p-3 text-mars-magenta text-xs font-black hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                    <button type="button" aria-label="Dígito 0" onclick="auth.press('0')" class="min-h-[48px] bg-slate-800 border border-slate-700 p-3 text-base font-bold text-white hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                    <button type="button" aria-label="Confirmar PIN" onclick="auth.verify()" class="min-h-[48px] bg-mars-green/20 border border-mars-green text-mars-green p-3 text-xs font-black hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
                </div>
                <p class="text-xs text-slate-300 text-center uppercase mt-4">Soporta teclado numérico físico (0-9, Backspace, Enter)</p>
            </div>
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
                    <button type="button" aria-label="Descartar notificación" onclick="ui.dismissNotification('${this.escapeHTML(n.id)}')" class="min-h-[44px] min-w-[44px] px-3 py-2 font-black hover:text-white transition-colors text-xs border border-current/40 shrink-0">✕</button>
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
                    <select id="dossier-co-select" onchange="ui.dossierSelectedCo=this.value; ui.render()" class="min-h-[44px] bg-black border border-mars-cyan text-white text-xs p-2.5 outline-none w-full sm:w-auto font-bold uppercase">
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
            <button type="button" role="tab" aria-selected="${tab==='docs'}" onclick="ui.showDossierTab('docs')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'} transition-colors">📁 Archivo Documental Oficial (19)</button>
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
                        <div class="space-y-2 mb-3 w-full">
                            ${config.criteria.map(c => `
                            <div class="flex justify-between text-xs uppercase w-full border-b border-slate-800/60 pb-1.5 gap-2">
                                <span class="text-slate-300 pr-2">${this.escapeHTML(c.name)} (${Math.round(c.weight*100)}%)</span>
                                <span class="font-mono font-bold shrink-0 ${grade.scores && grade.scores[c.id] !== undefined ? 'text-white' : 'text-slate-400'}">${grade.scores && grade.scores[c.id] !== undefined ? this.escapeHTML(grade.scores[c.id]) : '-'}</span>
                            </div>`).join('')}
                        </div>
                    </div>
                    ${grade.feedback ? `<div class="bg-black p-3 border border-slate-700 text-xs text-slate-200 italic w-full mt-2 break-words"><span class="text-mars-yellow font-bold not-italic block mb-1 uppercase text-xs">Feedback Docente:</span>"${this.escapeHTML(grade.feedback)}"</div>` : '<div class="text-xs text-slate-400 italic uppercase mt-2">Sin observaciones registradas todavía.</div>'}
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
                    <h3 class="font-orbitron text-mars-cyan text-sm uppercase">Estado del Repositorio Oficial de Entregables (Drive)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-1">Auditoría centralizada de enlaces externos por departamento curricular.</p>
                </div>
                <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-xs font-mono font-black uppercase">Entregados: ${deliveredCount} / ${allKeys.length}</span>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                <!-- Física y Química -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <h4 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase">🧪 Física y Química (25%)</h4>
                        <span class="text-xs text-slate-300 uppercase">Resp: Dpto. Técnico</span>
                    </div>
                    ${this.renderDocBadge('1. Informe Preliminar / Prototipo — DICIEMBRE (20%)', docs.preliminaryReport)}
                    ${this.renderDocBadge('2. Informe Técnico Final Exhaustivo — ABRIL (30%)', docs.technicalReport)}
                </div>

                <!-- Economía -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-green">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <h4 class="font-orbitron text-mars-green text-xs sm:text-sm uppercase">💰 Economía (10%)</h4>
                        <span class="text-xs text-slate-300 uppercase">Resp: Dpto. Finanzas</span>
                    </div>
                    ${this.renderDocBadge('1. Presupuesto Inicial', docs.budgetInitial)}
                    ${this.renderDocBadge('2. Cuenta de Resultados', docs.incomeStatement)}
                    ${this.renderDocBadge('3. Presupuesto Post-Prototipo', docs.budgetPostProto)}
                    ${this.renderDocBadge('4. Balance de Situación Simplificado', docs.balanceSheet)}
                </div>

                <!-- Liderazgo y Emprendimiento -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-yellow lg:col-span-2">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <h4 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase">🚀 Liderazgo y Emprendimiento (40%)</h4>
                        <span class="text-xs text-slate-300 uppercase">Resp: Marketing / CEO / Operaciones IA</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                        ${this.renderDocBadge('1A. Identidad de Marca y Misión — DICIEMBRE (10%)', docs.brandIdentity_dec)}
                        ${this.renderDocBadge('1B. Identidad de Marca y Misión — ABRIL (10%)', docs.brandIdentity_apr)}
                        ${this.renderDocBadge('2. Business Model — Documento Escrito (25%)', docs.businessModelDoc)}
                        ${this.renderDocBadge('3. Business Model Canvas (15%)', docs.businessModelCanvas)}
                        ${this.renderDocBadge('4A. Diario Decisiones, Conflictos e IA — DICIEMBRE (10%)', docs.decisionDiary_dec)}
                        ${this.renderDocBadge('4B. Diario Decisiones, Conflictos e IA — ABRIL (10%)', docs.decisionDiary_apr)}
                    </div>
                </div>

                <!-- Matemáticas -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-yellow">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <h4 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase">📐 Matemáticas (5%)</h4>
                        <span class="text-xs text-slate-300 uppercase">Resp: Dpto. Técnico</span>
                    </div>
                    ${this.renderDocBadge('1. Elaboración de Goniómetro/s', docs.goniometerEvidence)}
                    ${this.renderDocBadge('2. Informe: Distancia Conocida a Base', docs.mathReportDist)}
                    ${this.renderDocBadge('3. Informe: Dos Mediciones Separadas', docs.mathReportTwoPoints)}
                    ${this.renderDocBadge('4. Informe Técnico Final Comparativo', docs.mathReportFinal)}
                </div>

                <!-- Lengua Castellana e Inglés -->
                <div class="terminal-border bg-mars-card p-5 border-t-2 border-t-mars-magenta">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <h4 class="font-orbitron text-mars-magenta text-xs sm:text-sm uppercase">🗣️ Lengua Castellana (15%) & Inglés (5%)</h4>
                        <span class="text-xs text-slate-300 uppercase">Resp: Marketing / Equipo</span>
                    </div>
                    ${this.renderDocBadge('LEN: Dossier para Inversores (Texto Argumentativo)', docs.investorDossier)}
                    ${this.renderDocBadge('ING: Expresión Oral (Presentación Prototipo)', docs.oralPresentation)}
                    ${this.renderDocBadge('ING: Redacciones Escritas', docs.writtenEssays)}
                </div>
            </div>`;
        }
    }
});