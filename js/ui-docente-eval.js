// js/ui-docente-eval.js
// --- MÓDULO DOCENTE: RÚBRICAS PONDERADAS (100%), ACTAS Y ARCHIVO DOCUMENTAL OFICIAL (v1.1.32) ---

Object.assign(ui, {
    archiveFilterPending: false,

    toggleArchiveFilterPending() {
        this.archiveFilterPending = !this.archiveFilterPending;
        this.render();
    },

    renderAdminEval() {
        this.evalClassFilter = this.evalClassFilter || this.currentClassFilter || 'ALL';
        const isCoord = state.user.role.startsWith('COORD');
        const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        
        let adminHtml = `<div class="mb-6 flex flex-wrap gap-3 items-center bg-slate-900 p-3 border border-mars-border">`;
        if(isCoord) {
            adminHtml += `
            <select aria-label="Vista de evaluación de coordinación" onchange="ui.coordEvalView=this.value; ui.evalSelectedCo=''; ui.render()" class="min-h-[44px] w-full sm:w-auto max-w-full bg-black border border-mars-cyan text-mars-cyan text-xs p-2.5 uppercase font-bold outline-none cursor-pointer">
                <option value="ACTA" ${this.coordEvalView==='ACTA'?'selected':''}>📊 Acta General Calificaciones (100% Ponderada)</option>
                <option value="ARCHIVE" ${this.coordEvalView==='ARCHIVE'?'selected':''}>📁 Archivo Documental Central (Entregables Drive)</option>
                ${['FYQ','LYE','LEN','ECO','MAT','ING'].map(s => `<option value="${s}" ${this.coordEvalView===s?'selected':''}>Evaluar: ${this.escapeHTML(RUBRIC_CONFIG[s].name)} (${Math.round((weights[s]||0)*100)}%)</option>`).join('')}
            </select>
            ${this.coordEvalView === 'ACTA' ? `<button onclick="ui.exportActaCSV()" class="min-h-[44px] w-full sm:w-auto bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors">Exportar Acta Ponderada CSV</button>` : ''}
            `;
        } else {
            const wPct = Math.round((weights[activeSubject] || 0) * 100);
            adminHtml += `<h3 class="font-orbitron text-mars-cyan text-sm uppercase px-4 py-2">Módulo Calificador: <span class="text-white">${this.escapeHTML(RUBRIC_CONFIG[activeSubject].name)}</span> <span class="text-mars-yellow text-xs ml-2">[PESO PROYECTO: ${wPct}%]</span></h3>`;
        }
        
        adminHtml += `
            <select aria-label="Filtrar por clase" onchange="ui.setClassFilter(this.value); ui.evalSelectedCo='';" class="min-h-[44px] w-full sm:w-auto bg-black border border-mars-yellow text-mars-yellow text-xs p-2.5 uppercase font-bold outline-none cursor-pointer sm:ml-auto">
                <option value="ALL" ${this.evalClassFilter==='ALL'?'selected':''}>Todas las Clases</option>
                ${['A','B','C','D','E','F','TEST'].map(c => `<option value="${c}" ${this.evalClassFilter===c?'selected':''}>Clase ${c}</option>`).join('')}
            </select>
        </div>`;

        if(isCoord && this.coordEvalView === 'ACTA') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-mars-border pb-3 gap-2">
                    <div>
                        <h4 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Matriz Oficial de Calificaciones Ponderadas</h4>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Fórmula: 25% FYQ + 40% LYE + 15% LEN + 10% ECO + 5% MAT + 5% ING</p>
                    </div>
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-3 pr-4">Startups</th>
                                <th class="pr-3">FYQ <span class="text-mars-cyan">(25%)</span></th>
                                <th class="pr-3">LYE <span class="text-mars-cyan">(40%)</span></th>
                                <th class="pr-3">LEN <span class="text-mars-cyan">(15%)</span></th>
                                <th class="pr-3">ECO <span class="text-mars-cyan">(10%)</span></th>
                                <th class="pr-3">MAT <span class="text-mars-cyan">(5%)</span></th>
                                <th class="pr-3">ING <span class="text-mars-cyan">(5%)</span></th>
                                <th class="pr-3 text-slate-300">% Eval.</th>
                                <th class="text-mars-yellow">Nota Global ( sobre 10 )</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const g = co.grades || {}; 
                                const subOrder = ['FYQ','LYE','LEN','ECO','MAT','ING'];
                                
                                let weightedTotal = 0;
                                let evaluatedWeight = 0;

                                const cellsHtml = subOrder.map(s => {
                                    const hasGrade = g[s] && g[s].final !== null && g[s].final !== undefined;
                                    const val = hasGrade ? Number(g[s].final) : null;
                                    if (val !== null) {
                                        weightedTotal += val * (weights[s] || 0);
                                        evaluatedWeight += (weights[s] || 0);
                                    }
                                    return `<td class="py-3 font-mono pr-3 ${val!==null?'text-mars-cyan font-bold':'text-slate-400'}">${val!==null ? val.toFixed(2) : '--'}</td>`;
                                }).join('');

                                const pctEval = Math.round(evaluatedWeight * 100);
                                const finalDisplay = evaluatedWeight > 0 ? weightedTotal.toFixed(2) : '-';
                                
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-mars-cyan/5">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 max-w-[260px] truncate inline-flex items-center align-middle" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</button></td>${cellsHtml}
                                    <td class="py-3 font-mono pr-3 text-xs">
                                        <div class="flex items-center gap-2">
                                            <div class="w-12 bg-black h-1.5 rounded-sm overflow-hidden border border-slate-700 shrink-0">
                                                <div class="${pctEval === 100 ? 'bg-mars-green' : 'bg-mars-cyan'} h-full transition-all" style="width: ${pctEval}%"></div>
                                            </div>
                                            <span class="${pctEval === 100 ? 'text-mars-green font-bold' : 'text-slate-300'}">${pctEval}%</span>
                                        </div>
                                    </td>
                                    <td class="py-3 font-mono text-mars-yellow font-black text-sm">${finalDisplay}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } else if(isCoord && this.coordEvalView === 'ARCHIVE') {
            const docCols = [
                { key: 'preliminaryReport', label: 'FYQ 1: Prelim' },
                { key: 'technicalReport', label: 'FYQ 2: Inf. Técnico' },
                { key: 'hoja_taller_fyq', label: 'FYQ 3: Hoja Taller' },
                { key: 'brandIdentity_dec', label: 'LYE 1A: Marca Dic' },
                { key: 'brandIdentity_apr', label: 'LYE 1B: Marca Abr' },
                { key: 'businessModelDoc', label: 'LYE 2: Bus. Model' },
                { key: 'businessModelCanvas', label: 'LYE 3: Canvas' },
                { key: 'decisionDiary_dec', label: 'LYE 4A: Diario Dic' },
                { key: 'decisionDiary_apr', label: 'LYE 4B: Diario Abr' },
                { key: 'investorDossier', label: 'LEN: Dossier Inv.' },
                { key: 'pressReleasesSummary', label: 'LEN: Notas Prensa', isPress: true },
                { key: 'budgetInitial', label: 'ECO 1: Pres. Ini' },
                { key: 'budgetPostProto', label: 'ECO 2: Pres. Post' },
                { key: 'balanceSheet', label: 'ECO 3: Balance' },
                { key: 'incomeStatement', label: 'ECO 4: Cta. Res.' },
                { key: 'goniometerEvidence', label: 'MAT 1: Gonióm.' },
                { key: 'mathReportDist', label: 'MAT 2: Dist. Base' },
                { key: 'mathReportTwoPoints', label: 'MAT 3: 2 Puntos' },
                { key: 'mathReportFinal', label: 'MAT 4: Inf. Final' }
            ];

            const filteredCos = Object.keys(state.data.companies)
                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter);
            const totalPossible = filteredCos.length * docCols.length;
            let totalDelivered = 0;
            filteredCos.forEach(cid => {
                const co = state.data.companies[cid];
                const d = co?.deliverables || {};
                const prs = co?.pressReleases || {};
                const hasAnyPr = ['I','II','III','IV'].some(ph => !!prs[ph]?.driveUrl);
                totalDelivered += docCols.filter(col => col.isPress ? hasAnyPr : !!d[col.key]).length;
            });
            const pctGlobal = totalPossible > 0 ? Math.round((totalDelivered / totalPossible) * 100) : 0;

            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="mb-4 border-b border-mars-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Auditoría del Archivo Documental Central (${docCols.length} Entregables Oficiales Drive)</h4>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control de subida de enlaces en Google Drive (Desliza horizontalmente ➔)</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs bg-black border border-mars-cyan/60 px-3 py-1.5 text-mars-cyan font-mono font-bold">
                            Recibidos: <strong class="text-white">${totalDelivered}/${totalPossible}</strong> (${pctGlobal}%)
                        </span>
                        <button type="button" onclick="ui.toggleArchiveFilterPending()" class="min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-sm ${this.archiveFilterPending ? 'bg-mars-yellow text-black shadow-sm font-black' : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'}">
                            ${this.archiveFilterPending ? '⚡ Mostrando: Solo Incompletos' : '🔍 Filtrar: Solo Incompletos'}
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto w-full pb-2">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-slate-900 z-20">
                            <tr>
                                <th class="py-3 px-2 sticky left-0 bg-slate-900 z-10 border-r border-mars-border">Empresa</th>
                                <th class="py-3 px-2 text-center">Progreso</th>
                                ${docCols.map(col => `<th class="py-3 px-2 text-center">${col.label}</th>`).join('')}
                                <th class="py-3 px-2 text-center">IA Prompts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredCos
                                .filter(cid => {
                                    if (!this.archiveFilterPending) return true;
                                    const co = state.data.companies[cid];
                                    const d = co?.deliverables || {};
                                    const prs = co?.pressReleases || {};
                                    const hasAnyPr = ['I','II','III','IV'].some(ph => !!prs[ph]?.driveUrl);
                                    const deliveredTotal = docCols.filter(col => col.isPress ? hasAnyPr : !!d[col.key]).length;
                                    return deliveredTotal < docCols.length;
                                })
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {}; 
                                const prs = co.pressReleases || {};
                                const hasAnyPr = ['I','II','III','IV'].some(ph => !!prs[ph]?.driveUrl);
                                const aiCount = (co.aiPrompts||[]).filter(p=>p.status==='APROBADO').length;
                                const deliveredTotal = docCols.filter(col => col.isPress ? hasAnyPr : !!d[col.key]).length;
                                
                                const dLink = (doc, colKey, colObj) => {
                                    if (colObj?.isPress) {
                                        const prPublished = ['I','II','III','IV'].filter(ph => prs[ph]?.driveUrl);
                                        if (prPublished.length > 0) {
                                            return `<div class="flex flex-col items-center gap-1"><span class="min-h-[44px] flex items-center justify-center bg-mars-cyan/15 text-mars-cyan border border-mars-cyan px-2 py-1 font-bold text-center font-mono">📰 ${prPublished.length}/4</span></div>`;
                                        }
                                        return `<div class="flex flex-col items-center gap-1"><span class="min-h-[44px] flex items-center justify-center text-slate-500 border border-slate-800 px-2 py-1 text-center font-mono">0/4</span></div>`;
                                    }
                                    const sched = state.data.config?.deliverableSchedule?.[colKey];
                                    const templateBadge = sched?.guideDocUrl ? `<a href="${encodeURI(sched.guideDocUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-[9px] text-mars-cyan block hover:underline" title="Ver Plantilla Docente">📄 Plantilla ↗</a>` : '';
                                    if (doc) {
                                        const docUrl = doc.driveUrl || doc.url || doc.dataUrl || '#';
                                        return `<div class="flex flex-col items-center gap-1"><a href="${this.escapeHTML(docUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] flex items-center justify-center bg-mars-green/15 text-mars-green border border-mars-green px-2 py-1 font-bold hover:bg-mars-green hover:text-black transition-colors text-center">${(doc.type==='link' || doc.driveUrl || doc.url)?'🔗 LINK':'📁 FILE'}</a>${templateBadge}</div>`;
                                    }
                                    return `<div class="flex flex-col items-center gap-1"><span class="min-h-[44px] flex items-center justify-center text-slate-400 border border-slate-800 px-2 py-1 text-center">--</span>${templateBadge}</div>`;
                                };
                                
                                const aLink = aiCount > 0 
                                    ? `<span class="text-mars-cyan font-bold bg-mars-cyan/10 border border-mars-cyan px-2 py-1 block text-center">✓ ${aiCount}</span>` 
                                    : `<span class="text-slate-400 border border-slate-800 px-2 py-1 block text-center">0</span>`;

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-2.5 px-2 font-orbitron text-white font-bold sticky left-0 bg-slate-950 font-orbitron font-bold text-white z-10 border-r border-mars-border/60 max-w-[220px] truncate" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</td>
                                    <td class="py-2.5 px-2 font-mono font-bold text-center text-mars-yellow">${deliveredTotal}/${docCols.length}</td>${docCols.map(col => `<td class="py-2.5 px-1.5">${dLink(d[col.key], col.key, col)}</td>`).join('')}
                                    <td class="py-2.5 px-1.5">${aLink}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        } else if(activeSubject) {
            const config = RUBRIC_CONFIG[activeSubject];
            const subWeightPct = Math.round((weights[activeSubject] || 0) * 100);
            const curPhase = (typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I');

            // 1. Asistente Docente Inteligente ("¿Qué me toca hacer hoy?")
            adminHtml += this.renderTeacherAssistantBanner(activeSubject, curPhase);

            // 2. Guía Visual Desplegable de las 5 Fases
            adminHtml += this.renderTeacherPhaseGuide(activeSubject, curPhase);

            // 3. Selector Visual de Startups en Cascada (1º Clase ➔ 2º Tarjetas)
            adminHtml += `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div>
                        <h4 class="font-orbitron text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            🎯 Selección de Startups a Evaluar
                        </h4>
                        <p class="text-[11px] text-slate-300 mt-0.5">
                            Filtra por clase y pulsa sobre cualquier empresa para abrir su ficha de calificación y evidencias Drive.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <label for="eval-co-select" class="sr-only">Buscador Rápido de Startup</label>
                        <select id="eval-co-select" onchange="ui.selectEvalCo(this.value)" class="min-h-[44px] w-full sm:w-auto bg-slate-900 border border-mars-border text-white text-xs p-2 uppercase font-bold outline-none focus:border-mars-cyan">
                            <option value="">-- Buscar por Nombre --</option>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => `<option value="${this.escapeHTML(cid)}" ${this.evalSelectedCo===cid?'selected':''}>${this.escapeHTML(state.data.companies[cid].name)} [Clase ${this.escapeHTML(state.data.companies[cid].classGroup)}]</option>`).join('')}
                        </select>
                    </div>
                </div>

                ${this.renderClassStartupCards(activeSubject, this.evalClassFilter)}
            </div>`;

            if(!this.evalSelectedCo) {
                adminHtml += `
                <div class="terminal-border bg-black/40 border border-slate-800 border-dashed p-8 text-center rounded">
                    <p class="text-sm font-orbitron text-mars-cyan uppercase tracking-wider mb-2">
                        👆 Pulsa sobre cualquier startup de la cuadrícula superior para evaluar
                    </p>
                    <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Podrás calificar los criterios correspondientes a la fase actual y consultar las evidencias oficiales de Google Drive en tiempo real.
                    </p>
                </div>`;
            } else {
                const co = state.data.companies[this.evalSelectedCo];
                if (!co) return ''; 
                
                const pastGrade = (co.grades && co.grades[activeSubject]) ? co.grades[activeSubject] : { scores: {}, feedback: '' };
                const docs = co.deliverables || {};
                
                let evidenceHtml = `<h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Evidencias Adjuntas (${this.escapeHTML(activeSubject)})</h4>`;
                
                if (activeSubject === 'FYQ') {
                    evidenceHtml += this.renderDocBadge('1. Hoja Registro Preliminar (Dic)', docs.preliminaryReport, false, this.evalSelectedCo, 'preliminaryReport');
                    evidenceHtml += this.renderDocBadge('2. Hoja Oficial de Taller, BOM y Calidad', docs.hoja_taller_fyq, false, this.evalSelectedCo, 'hoja_taller_fyq');
                    evidenceHtml += this.renderDocBadge('3. Informe Técnico Final (Abr)', docs.technicalReport, false, this.evalSelectedCo, 'technicalReport');
                    if(co.flightTests && co.flightTests.length > 0) {
                        evidenceHtml += `<div class="mt-4 bg-black p-3 border border-slate-800"><span class="text-mars-yellow text-xs font-bold uppercase block mb-2">Ensayos en Banco de Pruebas:</span><div class="text-xs space-y-2 max-h-56 overflow-y-auto">`;
                        co.flightTests.forEach(f => {
                            const h_mm = f.heightMm !== undefined ? f.heightMm : (f.heightM * 1000);
                            const vUrl = typeof f.videoUrl === 'string' ? f.videoUrl.trim() : '';
                            const hasValidVideo = vUrl && (typeof GOOGLE_DRIVE_REGEX !== 'undefined' ? GOOGLE_DRIVE_REGEX.test(vUrl) : /^https:\/\/(docs|drive)\.google\.com\//i.test(vUrl));
                            const videoBadgeHtml = hasValidVideo
                                ? `<a href="${encodeURI(vUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/70 border border-mars-cyan/60 text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase rounded transition-colors shrink-0">🎥 Ver Vídeo E ↗</a>`
                                : `<span class="text-[11px] font-mono text-slate-500 uppercase">Sin vídeo de cálculo</span>`;
                            evidenceHtml += `<div class="text-slate-200 border-b border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 break-words"><div>${this.escapeHTML(f.bottle)} | H: <strong class="text-mars-green">${Number(h_mm).toFixed(0)} mm</strong> | C: ${f.costEurV}€v | E: <strong class="text-mars-yellow">${Number(f.efficiency).toFixed(2)}</strong></div>${videoBadgeHtml}</div>`;
                        });
                        evidenceHtml += `</div></div>`;
                    }
                } else if (activeSubject === 'ECO') {
                    evidenceHtml += `<p class="text-xs text-mars-yellow uppercase font-bold mb-2">Nota: El criterio 1 corresponde al Test Evaluativo (20%).</p>`;
                    evidenceHtml += this.renderDocBadge('1. Presupuesto Inicial (20% - Fase I)', docs.budgetInitial, false, this.evalSelectedCo, 'budgetInitial');
                    evidenceHtml += this.renderDocBadge('2. Presupuesto Post-Prototipo (20% - Fase II)', docs.budgetPostProto, false, this.evalSelectedCo, 'budgetPostProto');
                    evidenceHtml += this.renderDocBadge('3. Balance de Situación (20% - Fase III)', docs.balanceSheet, false, this.evalSelectedCo, 'balanceSheet');
                    evidenceHtml += this.renderDocBadge('4. Cuenta de Resultados (20% - Fase IV)', docs.incomeStatement, false, this.evalSelectedCo, 'incomeStatement');
                } else if (activeSubject === 'LYE') {
                    evidenceHtml += this.renderDocBadge('1A. Identidad y Misión (Diciembre)', docs.brandIdentity_dec, false, this.evalSelectedCo, 'brandIdentity_dec');
                    evidenceHtml += this.renderDocBadge('1B. Identidad y Misión (Abril)', docs.brandIdentity_apr, false, this.evalSelectedCo, 'brandIdentity_apr');
                    evidenceHtml += this.renderDocBadge('2. Business Model Escrito', docs.businessModelDoc, false, this.evalSelectedCo, 'businessModelDoc');
                    evidenceHtml += this.renderDocBadge('3. Business Model Canvas', docs.businessModelCanvas, false, this.evalSelectedCo, 'businessModelCanvas');
                    evidenceHtml += this.renderDocBadge('4A. Diario Decisiones e IA (Diciembre)', docs.decisionDiary_dec, false, this.evalSelectedCo, 'decisionDiary_dec');
                    evidenceHtml += this.renderDocBadge('4B. Diario Decisiones e IA (Abril)', docs.decisionDiary_apr, false, this.evalSelectedCo, 'decisionDiary_apr');
                    evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-xs font-bold uppercase">Manifiesto / Propuesta de Valor:</span><p class="text-xs text-slate-200 italic mt-1 bg-black p-3 border border-slate-800 leading-relaxed max-h-28 overflow-y-auto break-words">"${this.escapeHTML(co.valueProposition || 'No redactada todavía.')}"</p></div>`;
                } else if (activeSubject === 'LEN') {
                    evidenceHtml += this.renderDocBadge('1. Dossier para Inversores (Argumentativo) (40% LEN)', docs.investorDossier, false, this.evalSelectedCo, 'investorDossier');
                    evidenceHtml += this.renderPressReleasesBadge(co);
                } else if (activeSubject === 'MAT') {
                    evidenceHtml += this.renderDocBadge('1. Elaboración de Goniómetro/s (25%)', docs.goniometerEvidence, false, this.evalSelectedCo, 'goniometerEvidence');
                    evidenceHtml += this.renderDocBadge('2. Informe Distancia Conocida (25%)', docs.mathReportDist, false, this.evalSelectedCo, 'mathReportDist');
                    evidenceHtml += this.renderDocBadge('3. Informe Dos Mediciones (25%)', docs.mathReportTwoPoints, false, this.evalSelectedCo, 'mathReportTwoPoints');
                    evidenceHtml += this.renderDocBadge('4. Informe Técnico Final (25%)', docs.mathReportFinal, false, this.evalSelectedCo, 'mathReportFinal');
                } else if (activeSubject === 'ING') {
                    evidenceHtml += `
                    <div class="bg-black/80 border border-mars-yellow/40 p-4 text-xs text-slate-300 space-y-2 mb-3">
                        <p class="text-white font-bold uppercase text-xs">📢 Evaluación Directa en Aula (Inglés):</p>
                        <p>100% evaluación docente directa en clase (Expresión Oral 70% / Redacciones Escritas 30%). No requiere evidencias de Google Drive en este panel.</p>
                    </div>`;
                }

                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 animate-in fade-in duration-300">
                    <div class="flex justify-between items-center border-b border-mars-border pb-3 mb-6 flex-wrap gap-2">
                        <div>
                            <span class="text-[10px] font-mono text-mars-cyan uppercase tracking-wider font-bold">Ficha de Calificación Activa</span>
                            <h3 class="font-orbitron text-white text-base font-bold uppercase flex items-center gap-2">
                                <span>🚀 ${this.escapeHTML(co.name)}</span>
                                <span class="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Clase ${this.escapeHTML(co.classGroup || 'A')}</span>
                            </h3>
                        </div>
                        <button type="button" onclick="ui.evalSelectedCo=''; ui.render();" class="text-xs text-slate-400 hover:text-white font-mono uppercase px-2.5 py-1 border border-slate-700 hover:border-slate-500 rounded">
                            ✕ Cambiar Empresa
                        </button>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div class="lg:col-span-2 space-y-4">
                            <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-4 flex-wrap gap-2">
                                <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Criterios Oficiales (${this.escapeHTML(activeSubject)})</h4>
                                <span class="text-xs bg-mars-yellow/10 text-mars-yellow border border-mars-yellow px-2 py-0.5 font-bold uppercase">Representación Global: ${subWeightPct}%</span>
                            </div>
                            ${config.criteria.map(c => {
                                const criterionPhase = this.getCriterionPhase(activeSubject, c.id);
                                const isCurrentPhase = (criterionPhase === curPhase || criterionPhase === 'I-IV');
                                const phaseBadgeClass = isCurrentPhase ? 'bg-mars-cyan/20 text-mars-cyan border-mars-cyan/40' : 'bg-slate-800 text-slate-400 border-slate-700';
                                return `
                                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-900/50 p-4 border border-mars-border hover:border-mars-cyan transition-colors">
                                    <div class="flex-grow pr-4">
                                        <div class="flex items-center gap-2 flex-wrap mb-1">
                                            <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${phaseBadgeClass} font-bold uppercase">FASE ${criterionPhase}</span>
                                            <label for="grade-${c.id}" class="text-xs text-white font-bold uppercase leading-tight cursor-pointer">${this.escapeHTML(c.name)}</label>
                                        </div>
                                        <span class="text-xs bg-mars-cyan text-black px-2 py-0.5 mt-1 inline-block font-bold">PESO EN ASIGNATURA: ${Math.round(c.weight*100)}%</span>
                                    </div>
                                    <input type="number" id="grade-${c.id}" min="0" max="10" step="0.1" value="${pastGrade.scores && pastGrade.scores[c.id] !== undefined ? pastGrade.scores[c.id] : ''}" oninput="ui.calcRealtimeGrade('${activeSubject}')" class="min-h-[44px] w-full sm:w-24 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base p-2 outline-none focus:border-mars-cyan shrink-0" placeholder="0-10">
                                </div>`;
                            }).join('')}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <textarea id="eval-feedback" aria-label="Observaciones cualitativas y feedback" class="w-full bg-slate-900 border border-mars-border p-3 text-base sm:text-xs text-white h-full min-h-[100px] outline-none focus:border-mars-cyan leading-relaxed" placeholder="Observaciones cualitativas y feedback para la startup...">${this.escapeHTML(pastGrade.feedback||'')}</textarea>
                                <div class="flex flex-col">
                                    <div class="terminal-border border-dashed p-4 text-center mb-3 flex-grow bg-black flex flex-col justify-center">
                                        <p class="text-xs text-slate-300 uppercase font-bold mb-1 tracking-widest">Nota Materia (${this.escapeHTML(activeSubject)})</p>
                                        <p id="realtime-grade" class="text-5xl font-orbitron text-mars-green tracking-tighter">${pastGrade.final !== undefined && pastGrade.final !== null ? Number(pastGrade.final).toFixed(2) : '0.00'}</p>
                                        <p id="realtime-grade-pct" class="text-[11px] text-slate-400 font-mono mt-1">${pastGrade.final !== undefined && pastGrade.final !== null ? '(Nota Registrada)' : '(0% Evaluado)'}</p>
                                    </div>
                                    <button onclick="ui.saveGrade('${activeSubject}')" class="min-h-[44px] bg-mars-cyan text-black font-black py-4 text-xs uppercase tracking-widest hover:shadow-neon-cyan hover:bg-white transition-all">[ REGISTRAR CALIFICACIÓN ]</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-1 bg-black/40 border border-slate-800 p-4 h-fit sticky top-20">
                            ${evidenceHtml}
                        </div>
                    </div>
                </div>`;
            }
        }
        return adminHtml;
    },

    getCriterionPhase(subject, criterionId) {
        const map = {
            FYQ: { c1: 'I', c_ws: 'III', c2: 'IV', c3: 'II', c4: 'V' },
            ECO: { c1: 'I-IV', c2: 'I', c3: 'IV', c4: 'II', c5: 'III' },
            LYE: { c1: 'I', c2: 'III', c3: 'III', c4: 'I', c5: 'I', c6: 'IV', c7: 'V' },
            LEN: { c1: 'V', c2: 'IV', c3: 'I-IV' },
            MAT: { c1: 'II', c2: 'II', c3: 'II', c4: 'II' },
            ING: { c1: 'I-IV', c2: 'V' }
        };
        return map[subject]?.[criterionId] || 'I-IV';
    },

    toggleTeacherPhaseGuide() {
        this.teacherPhaseGuideExpanded = !this.teacherPhaseGuideExpanded;
        this.render();
    },

    renderPressReleasesBadge(co) {
        if (!co) return '';
        const prs = co.pressReleases || {};
        const phases = ['I', 'II', 'III', 'IV'];
        const publishedCount = phases.filter(ph => prs[ph]?.driveUrl).length;

        const rowsHtml = phases.map(ph => {
            const item = prs[ph];
            const hasDoc = item && item.driveUrl;
            if (hasDoc) {
                const safeUrl = encodeURI(item.driveUrl).replace(/"/g, '&quot;');
                return `
                <div class="bg-black/70 border border-slate-800 p-2.5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-[10px] font-mono bg-mars-cyan/20 text-mars-cyan border border-mars-cyan/40 px-1.5 py-0.5 rounded font-bold">FASE ${ph}</span>
                            <span class="text-white font-bold">${this.escapeHTML(item.title || 'Nota de Prensa')}</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5">Publicada: ${this.escapeHTML(item.publishedDate || item.publishedAt || '')}</p>
                    </div>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">[✓ PUBLICADA]</span>
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors min-h-[44px]">
                            <span>Abrir Doc ↗</span>
                        </a>
                    </div>
                </div>`;
            } else {
                return `
                <div class="bg-black/40 border border-slate-800/80 border-dashed p-2 rounded flex justify-between items-center text-xs text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <span class="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">FASE ${ph}</span>
                        <span>Nota de Prensa (DOC_15)</span>
                    </span>
                    <span class="text-[10px] text-amber-400/80 font-mono">[PENDIENTE CIERRE FASE ${ph}]</span>
                </div>`;
            }
        }).join('');

        return `
        <div class="mt-4 bg-slate-950 border border-slate-800 p-3 rounded">
            <div class="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
                <span class="text-mars-yellow text-xs font-bold uppercase tracking-wider">2. Notas de Prensa Corporativas (${publishedCount}/4)</span>
                <span class="text-[10px] font-mono text-slate-400">10% LEN • DOC_15</span>
            </div>
            <p class="text-[11px] text-slate-300 mb-3 leading-relaxed">
                Notas oficiales emitidas por el CEO al cierre de cada fase para prensa y claustro docente.
            </p>
            <div class="space-y-2">
                ${rowsHtml}
            </div>
        </div>`;
    },

    renderTeacherAssistantBanner(activeSubject, curPhase) {
        if (!activeSubject) return '';
        const companies = state.data.companies || {};
        const classFilter = this.evalClassFilter || 'ALL';
        const targetCids = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            return co && (classFilter === 'ALL' || co.classGroup === classFilter);
        });

        const subjectDocKeys = {
            FYQ: ['preliminaryReport', 'hoja_taller_fyq', 'technicalReport'],
            ECO: ['budgetInitial', 'incomeStatement', 'budgetPostProto', 'balanceSheet'],
            LYE: ['brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'businessModelCanvas', 'decisionDiary_dec', 'decisionDiary_apr'],
            LEN: ['investorDossier'],
            MAT: ['goniometerEvidence', 'mathReportDist', 'mathReportTwoPoints', 'mathReportFinal'],
            ING: []
        }[activeSubject] || [];

        let gradedCount = 0;
        let pendingEvalCids = [];
        let unsubmittedCount = 0;

        targetCids.forEach(cid => {
            const co = companies[cid];
            const g = co?.grades?.[activeSubject];
            const isGraded = g && g.final !== null && g.final !== undefined;
            if (isGraded) {
                gradedCount++;
                return;
            }

            const docs = co?.deliverables || {};
            let hasSubmission = subjectDocKeys.some(k => !!docs[k]);
            if (activeSubject === 'LEN' && co?.pressReleases) {
                hasSubmission = hasSubmission || Object.values(co.pressReleases).some(pr => !!pr?.driveUrl);
            }

            if (hasSubmission) {
                pendingEvalCids.push(cid);
            } else {
                unsubmittedCount++;
            }
        });

        const helpTexts = {
            FYQ: {
                I: "En la Fase I te corresponde calificar el <strong>Informe Técnico Preliminar, Boceto y Foto</strong> (10% de tu materia) una vez subido por los técnicos.",
                II: "En la Fase II supervisa los <strong>Ensayos en Banco de Pruebas</strong> y lanzamientos (30% de tu materia).",
                III: "En la Fase III evalúa la <strong>Hoja Oficial de Taller, BOM y Control de Calidad</strong> (10% de tu materia).",
                IV: "En la Fase IV evalúa el <strong>Informe Técnico Final Exhaustivo</strong> (30% de tu materia).",
                V: "En la Fase V evalúa la <strong>Media de Tests de Rol y Defensa Q&A</strong> (20% de tu materia)."
            },
            ECO: {
                I: "En la Fase I te corresponde calificar el <strong>Presupuesto Inicial</strong> (20%) y el <strong>Test Evaluativo</strong> (20%).",
                II: "En la Fase II evalúa el <strong>Presupuesto Post-Prototipo</strong> (20% de tu materia) tras los ensayos de apogeo y taller.",
                III: "En la Fase III evalúa el <strong>Balance de Situación</strong> (20% de tu materia) cerrado con activo, pasivo y patrimonio neto.",
                IV: "En la Fase IV evalúa la <strong>Cuenta de Resultados</strong> (20% de tu materia) con pérdidas, ganancias y control de márgenes.",
                V: "En la Fase V se audita el balance definitivo y la solvencia contable para la liquidación final."
            },
            LYE: {
                I: "En la Fase I te corresponde calificar la <strong>Identidad y Misión Dic</strong> (10%) y el <strong>Diario de Decisiones e IA Dic</strong> (10%).",
                II: "En la Fase II las startups consolidan su equipo y primer prototipo.",
                III: "En la Fase III evalúa el <strong>Business Model Escrito</strong> (25% de tu materia).",
                IV: "En la Fase IV evalúa la <strong>Identidad Abr</strong> (10%), el <strong>Business Model Canvas</strong> (15%) y el <strong>Diario Abr</strong> (10%).",
                V: "En la Fase V evalúa las <strong>Defensas Orales</strong> (20%)."
            },
            LEN: {
                I: "En la Fase I revisa y califica las <strong>Notas de Prensa Corporativas (DOC_15)</strong> emitidas por los CEOs (10% conjunto Fases I a IV).",
                II: "En la Fase II revisa la <strong>Nota de Prensa de Cierre de Fase II (DOC_15)</strong>.",
                III: "En la Fase III revisa la <strong>Nota de Prensa de Cierre de Fase III (DOC_15)</strong>.",
                IV: "En la Fase IV evalúa el <strong>Dossier para Inversores (Texto Argumentativo)</strong> (40%) y la última nota de prensa.",
                V: "En la Fase V evalúa la <strong>Producción Oral y Pitch ante Inversores</strong> (50%)."
            },
            MAT: {
                I: "En la Fase I no hay entregables obligatorios de Matemáticas en la app. Tu primer bloque comienza en la <strong>Fase II</strong>.",
                II: "En la Fase II evalúa la <strong>Construcción del Goniómetro</strong> (25%), el <strong>Informe de Distancia Conocida</strong> (25%) y el <strong>Informe de Dos Mediciones</strong> (25%).",
                III: "En la Fase III los equipos preparan los datos trigonométricos de apogeo definitivo.",
                IV: "En la Fase IV evalúa el <strong>Informe Técnico Final Comparativo</strong> (25%).",
                V: "En la Fase V se comprueban las mediciones reales en el concurso."
            },
            ING: {
                I: "La materia de Inglés se evalúa 100% de forma directa en el aula (Expresión Oral 70% / Redacciones 30%). Puedes registrar notas directamente en las casillas correspondientes.",
                II: "Evaluación continua directa en aula de expresión oral y redacciones técnicas en inglés.",
                III: "Evaluación continua directa en aula de pitch comercial en inglés.",
                IV: "Evaluación continua directa en aula de defensa de propuesta de inversión.",
                V: "Evaluación del Pitch Final en inglés en el Concurso Oficial."
            }
        };

        const currentHelp = helpTexts[activeSubject]?.[curPhase] || helpTexts[activeSubject]?.I || "Consulta la guía curricular de tu asignatura en el botón superior.";
        const firstPendingCid = pendingEvalCids[0];
        const firstPendingCo = firstPendingCid ? companies[firstPendingCid] : null;

        return `
        <div class="terminal-border bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-5 mb-6 border-l-4 border-l-mars-cyan shadow-lg">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-orbitron font-black text-mars-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <span class="inline-block w-2 h-2 rounded-full bg-mars-cyan animate-ping"></span>
                        🧭 ASISTENTE DOCENTE
                    </span>
                    <span class="text-[10px] font-mono bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/40 px-2 py-0.5 rounded font-bold uppercase">
                        FASE ACTUAL: ${curPhase} (${PROJECT_PHASES_DEF?.[curPhase]?.name?.split(':')[1]?.trim() || 'En curso'})
                    </span>
                    <span class="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                        Clase: <strong class="text-white">${classFilter === 'ALL' ? 'Todas' : classFilter}</strong>
                    </span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button type="button" onclick="ui.toggleTeacherPhaseGuide()" class="min-h-[44px] px-3 py-1 text-xs font-bold uppercase transition-all rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                        <span>📅 ${this.teacherPhaseGuideExpanded ? 'Ocultar Guía de Fases ▲' : 'Guía de Fases y Criterios ▼'}</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div class="lg:col-span-2 text-xs text-slate-300 leading-relaxed">
                    <p class="text-white font-semibold mb-1 flex items-center gap-1.5">
                        <span class="text-mars-cyan">▶</span> ¿Qué me toca hacer en esta fase?
                    </p>
                    <p class="text-slate-300">${currentHelp}</p>
                </div>

                <div class="lg:col-span-1 bg-black/60 border border-slate-800 p-3 rounded flex flex-col justify-between gap-2">
                    <div class="flex justify-between items-center text-[11px] font-mono">
                        <span class="text-emerald-400 font-bold">🟢 ${gradedCount} evaluadas</span>
                        <span class="${pendingEvalCids.length > 0 ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-400'}">🟡 ${pendingEvalCids.length} listas</span>
                        <span class="text-slate-400">⚪ ${unsubmittedCount} sin entregar</span>
                    </div>
                    ${firstPendingCo ? `
                        <button type="button" onclick="ui.selectEvalCo('${firstPendingCid}')" class="w-full min-h-[44px] bg-mars-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                            <span>👉 Calificar: ${this.escapeHTML(firstPendingCo.name)} ➔</span>
                        </button>
                    ` : `
                        <div class="text-[11px] text-emerald-400 font-mono text-center py-1">
                            ✅ Todo al día para esta clase
                        </div>
                    `}
                </div>
            </div>
        </div>
        `;
    },

    renderTeacherPhaseGuide(activeSubject, curPhase) {
        if (!this.teacherPhaseGuideExpanded || !activeSubject) return '';
        const phases = ['I', 'II', 'III', 'IV', 'V'];
        const phaseNames = {
            I: 'Fase I: Fundación y Viabilidad',
            II: 'Fase II: I+D y Prototipado',
            III: 'Fase III: Producción B2B',
            IV: 'Fase IV: Validación y Cierre',
            V: 'Fase V: Concurso Final'
        };
        const phaseDates = {
            I: 'Nov - 15 Dic 2026',
            II: '15 Dic - 15 Feb 2027',
            III: '15 Feb - 31 Mar 2027',
            IV: '31 Mar - 23 Abr 2027',
            V: '19 May 2027'
        };

        const config = RUBRIC_CONFIG[activeSubject];
        const criteria = config?.criteria || [];

        const cardsHtml = phases.map(ph => {
            const isCurrent = (ph === curPhase);
            const phCriteria = criteria.filter(c => {
                const cPhase = this.getCriterionPhase(activeSubject, c.id);
                return cPhase === ph || (cPhase === 'I-IV' && ph !== 'V');
            });

            return `
            <div class="terminal-border p-3 rounded flex flex-col justify-between ${
                isCurrent 
                    ? 'bg-slate-900 border-2 border-mars-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                    : 'bg-black/60 border border-slate-800'
            }">
                <div>
                    <div class="flex justify-between items-start gap-1 mb-1">
                        <span class="text-xs font-orbitron font-bold ${isCurrent ? 'text-mars-cyan' : 'text-white'}">${phaseNames[ph]}</span>
                        ${isCurrent ? '<span class="text-[9px] bg-mars-cyan text-black px-1.5 py-0.5 font-black font-mono uppercase rounded">ACTUAL</span>' : ''}
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 block mb-2">${phaseDates[ph]}</span>
                    
                    <div class="space-y-1.5 border-t border-slate-800/80 pt-2">
                        ${phCriteria.length > 0 ? phCriteria.map(c => `
                            <div class="text-[11px] text-slate-300 leading-snug">
                                <span class="text-mars-yellow font-bold">${Math.round(c.weight * 100)}%</span>: ${this.escapeHTML(c.name)}
                            </div>
                        `).join('') : '<p class="text-[10px] text-slate-400 italic">Sin entregables de esta materia en esta fase.</p>'}
                    </div>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="terminal-border bg-black/80 border border-slate-800 p-4 mb-6 rounded">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <h4 class="font-orbitron text-xs uppercase tracking-wider text-mars-yellow flex items-center gap-2">
                    <span>📅 CRONOGRAMA OFICIAL Y RÚBRICA POR FASES (${this.escapeHTML(config?.name || activeSubject)})</span>
                </h4>
                <button type="button" onclick="ui.toggleTeacherPhaseGuide()" class="text-xs text-slate-400 hover:text-white font-mono">
                    [ Cerrar ✕ ]
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                ${cardsHtml}
            </div>
        </div>`;
    },

    renderClassStartupCards(activeSubject, classFilter) {
        const companies = state.data.companies || {};
        const classes = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const currentCls = classFilter || 'ALL';

        const filteredCids = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            return co && (currentCls === 'ALL' || co.classGroup === currentCls);
        });

        const subjectDocKeys = {
            FYQ: ['preliminaryReport', 'hoja_taller_fyq', 'technicalReport'],
            ECO: ['budgetInitial', 'incomeStatement', 'budgetPostProto', 'balanceSheet'],
            LYE: ['brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'businessModelCanvas', 'decisionDiary_dec', 'decisionDiary_apr'],
            LEN: ['investorDossier'],
            MAT: ['goniometerEvidence', 'mathReportDist', 'mathReportTwoPoints', 'mathReportFinal'],
            ING: []
        }[activeSubject] || [];

        // Conteo de startups con entregas pendientes de evaluar por clase
        const pendingCounts = {};
        classes.forEach(c => { pendingCounts[c] = 0; });
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (!co) return;
            const coCls = (co.classGroup || 'A').toUpperCase();
            const g = co?.grades?.[activeSubject];
            const hasGrade = g && g.final !== null && g.final !== undefined;
            if (hasGrade) return;

            const docs = co?.deliverables || {};
            let deliveredCount = subjectDocKeys.filter(k => !!docs[k]).length;
            if (activeSubject === 'LEN' && co?.pressReleases) {
                const prCount = Object.values(co.pressReleases).filter(p => !!p?.driveUrl).length;
                if (prCount > 0) deliveredCount += prCount;
            }

            if (deliveredCount > 0) {
                pendingCounts['ALL'] = (pendingCounts['ALL'] || 0) + 1;
                if (classes.includes(coCls)) {
                    pendingCounts[coCls] = (pendingCounts[coCls] || 0) + 1;
                }
            }
        });

        const classTabsHtml = `
        <div class="flex flex-wrap gap-1.5 mb-3 items-center">
            <span class="text-[10px] font-mono text-slate-400 uppercase mr-1">Filtrar Clase:</span>
            ${classes.map(cls => {
                const isCur = (currentCls === cls);
                const count = pendingCounts[cls] || 0;
                const badge = count > 0 
                    ? `<span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${isCur ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'} animate-pulse">🟡 ${count}</span>` 
                    : '';
                return `
                <button type="button" onclick="ui.setClassFilter('${cls}'); ui.evalSelectedCo='';" class="min-h-[44px] inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all rounded ${
                    isCur 
                        ? 'bg-mars-yellow text-black shadow-sm font-black' 
                        : 'bg-black text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                }">
                    <span>${cls === 'ALL' ? 'Todas' : `Clase ${cls}`}</span>
                    ${badge}
                </button>`;
            }).join('')}
        </div>`;

        if (filteredCids.length === 0) {
            return `
            <div class="mb-4">
                ${classTabsHtml}
                <div class="bg-black/50 border border-slate-800 p-4 text-center text-xs text-slate-400 italic">
                    No se encontraron startups registradas para la clase seleccionada (${currentCls}).
                </div>
            </div>`;
        }

        const cardsHtml = filteredCids.map(cid => {
            const co = companies[cid];
            const isSelected = (this.evalSelectedCo === cid);
            const g = co?.grades?.[activeSubject];
            const hasGrade = g && g.final !== null && g.final !== undefined;
            const docs = co?.deliverables || {};

            let deliveredCount = subjectDocKeys.filter(k => !!docs[k]).length;
            if (activeSubject === 'LEN' && co?.pressReleases) {
                const prCount = Object.values(co.pressReleases).filter(p => !!p?.driveUrl).length;
                if (prCount > 0) deliveredCount += prCount;
            }

            let statusPill = '';
            if (hasGrade) {
                statusPill = `<span class="text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-bold">🟢 Nota: ${Number(g.final).toFixed(2)}</span>`;
            } else if (deliveredCount > 0) {
                statusPill = `<span class="text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold animate-pulse">🟡 ${deliveredCount} doc(s) listos</span>`;
            } else {
                statusPill = `<span class="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">⚪ Sin entregas</span>`;
            }

            const phaseClock = this.getPhaseClockMetrics ? this.getPhaseClockMetrics(co) : { isTeacherBottleneck: false };
            const bottleneckBadge = phaseClock.isTeacherBottleneck
                ? `<span class="text-[10px] font-mono bg-orange-950/90 text-orange-300 border border-orange-500/70 px-1.5 py-0.5 rounded font-bold animate-pulse whitespace-nowrap" title="Cuello de botella Fase ${this.escapeHTML(phaseClock.phaseInfo.key)}: ${phaseClock.phaseDeliveredCount}/${phaseClock.phaseTotalCount} entregas a ${phaseClock.daysRemaining}d del cierre">⏰ Riesgo Plazo</span>`
                : '';

            return `
            <button type="button" onclick="ui.selectEvalCo('${this.escapeHTML(cid)}')" class="text-left p-3 rounded transition-all min-h-[56px] flex flex-col justify-between gap-1.5 ${
                isSelected 
                    ? 'bg-slate-900 border-2 border-mars-cyan ring-2 ring-mars-cyan/30 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                    : 'bg-black/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
            }">
                <div class="flex justify-between items-start gap-1 w-full">
                    <span class="font-orbitron font-bold text-xs ${isSelected ? 'text-mars-cyan' : 'text-white'} truncate" title="${this.escapeHTML(co.name)}">
                        ${this.escapeHTML(co.name)}
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded shrink-0">
                        ${this.escapeHTML((co.classGroup || 'A').toUpperCase())}
                    </span>
                </div>
                <div class="w-full flex flex-wrap justify-between items-center gap-1">
                    <div class="flex items-center gap-1 flex-wrap">
                        ${statusPill}
                        ${bottleneckBadge}
                    </div>
                    ${isSelected ? '<span class="text-[10px] font-mono text-mars-cyan font-black">EVALUANDO ➔</span>' : ''}
                </div>
            </button>`;
        }).join('');

        return `
        <div class="mb-4">
            ${classTabsHtml}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                ${cardsHtml}
            </div>
        </div>`;
    },

    selectEvalCo(cid) {
        this.evalSelectedCo = cid;
        this.render();
    },

    calcRealtimeGrade(subject) {
        const config = RUBRIC_CONFIG[subject];
        if (!config) return;
        let total = 0;
        let evalWeight = 0;
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el && el.value !== '') {
                const val = parseFloat(el.value);
                if (!isNaN(val)) {
                    total += val * c.weight;
                    evalWeight += c.weight;
                }
            }
        });
        const display = document.getElementById('realtime-grade');
        if (display) display.innerText = total.toFixed(2);
        const pctDisplay = document.getElementById('realtime-grade-pct');
        if (pctDisplay) {
            pctDisplay.innerText = `(${Math.round(evalWeight * 100)}% de la rúbrica evaluado)`;
        }
    },

    saveGrade(subject) {
        if (!this.evalSelectedCo) return this.notify("Seleccione una startup primero.", "warning");
        const config = RUBRIC_CONFIG[subject];
        const co = state.data.companies[this.evalSelectedCo];
        if (!co) return;
        
        let scores = {};
        let total = 0;
        let allFilled = true;
        let evaluatedWeight = 0;
        
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el && el.value !== '') {
                const val = parseFloat(el.value);
                if (isNaN(val)) {
                    allFilled = false;
                } else {
                    scores[c.id] = val;
                    total += val * c.weight;
                    evaluatedWeight += c.weight;
                }
            } else {
                allFilled = false;
            }
        });

        // Capturar dictamen antes de cualquier apertura modal o redibujado de interfaz
        const elFeedback = document.getElementById('eval-feedback');
        const feedback = elFeedback ? this.cleanInput(elFeedback.value) : '';
        const targetCid = this.evalSelectedCo;
        
        const commitGrade = () => {
            const liveCo = state.data?.companies?.[targetCid];
            if (!liveCo) return;

            liveCo.grades = liveCo.grades || {};
            liveCo.grades[subject] = { 
                scores, 
                feedback, 
                final: total,
                updatedAt: Date.now(),
                gradedBy: state.user?.role || 'DOCENTE'
            };
            liveCo.updatedAt = Date.now();
            
            telemetry.log("EVALUACIÓN", `Nota ${subject} registrada a ${liveCo.name}: ${total.toFixed(2)}`);

            const subjectRoleMap = { FYQ: 'TECNICO', LYE: 'MARKETING', ECO: 'FINANZAS', MAT: 'TECNICO', LEN: 'MARKETING', ING: 'MARKETING' };
            const targetRole = subjectRoleMap[subject] || 'CEO';
            const notifMsg = `Calificación de ${subject} registrada por el docente: ${total.toFixed(2)} / 10`;
            const targetMeta = { view: 'dossier', subTab: 'eval' };
            ui.pushNotification(targetCid, 'CEO', notifMsg, 'success', targetMeta);
            if (targetRole !== 'CEO') {
                ui.pushNotification(targetCid, targetRole, notifMsg, 'success', targetMeta);
            }

            state.save(targetCid);
            if (typeof state.pushToCloud === 'function') {
                state.pushToCloud(false);
            }

            this.notify(`Calificación de ${subject} registrada para ${liveCo.name}: ${total.toFixed(2)}`, "success");
            this.render();
        };

        if (!allFilled) {
            const evalPct = Math.round(evaluatedWeight * 100);
            this.confirmAction(
                "Registro de Calificación Parcial",
                `Hay criterios de otras fases sin calificar todavía (se ha evaluado un ${evalPct}% de la materia). Se registrará la nota de los criterios completados (${total.toFixed(2)} / 10). ¿Deseas guardar esta calificación?`,
                commitGrade,
                "Registrar Calificación"
            );
            return;
        }
        
        commitGrade();
    },

    exportActaCSV() {
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        const subOrder = ['FYQ','LYE','LEN','ECO','MAT','ING'];
        let csv = "Empresa,Clase,FYQ_25%,LYE_40%,LEN_15%,ECO_10%,MAT_5%,ING_5%,Peso_Evaluado_%,Nota_Global_Ponderada\n";
        
        Object.values(state.data.companies).forEach(co => {
            const g = co.grades || {};
            let weightedTotal = 0;
            let evaluatedWeight = 0;

            const vals = subOrder.map(s => {
                const hasGrade = g[s] && g[s].final !== null && g[s].final !== undefined;
                if (hasGrade) {
                    const num = Number(g[s].final);
                    weightedTotal += num * (weights[s] || 0);
                    evaluatedWeight += (weights[s] || 0);
                    return num.toFixed(2);
                }
                return '';
            });

            const pctEval = Math.round(evaluatedWeight * 100);
            const finalNote = evaluatedWeight > 0 ? weightedTotal.toFixed(2) : '';
            csv += `"${(co.name || '').replace(/"/g, '""')}","${co.classGroup || 'A'}",${vals.join(',')},${pctEval}%,${finalNote}\n`;
        });
        this.downloadFile(csv, 'csv', 'marsket_acta_ponderada_oficial.csv');
    },

    renderAdminContracts() {
        const classFilter = this.adminContractsClassFilter || this.currentClassFilter || 'ALL';
        const phaseFilter = this.adminContractsPhaseFilter || 'I';
        const companies = state.data.companies || {};

        const allClasses = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const allPhases = ['ALL', 'I', 'II', 'III', 'IV'];

        // Filtrar empresas
        const filteredCoIds = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            if (!co) return false;
            if (classFilter !== 'ALL' && (co.classGroup || 'A') !== classFilter) return false;
            return true;
        });

        // Contabilidad de métricas
        let totalSigned = 0;
        let totalCompleted = 0;
        let totalFailed = 0;
        let totalPending = 0;

        filteredCoIds.forEach(cid => {
            const co = companies[cid];
            const contracts = co.contracts || {};
            const phasesToCheck = phaseFilter === 'ALL' ? ['I', 'II', 'III', 'IV'] : [phaseFilter];
            phasesToCheck.forEach(ph => {
                const c = contracts[ph];
                if (c && c.contractId) {
                    totalSigned++;
                    if (c.status === 'CUMPLIDO') totalCompleted++;
                    else if (c.status === 'NO_CUMPLIDO') totalFailed++;
                    else totalPending++;
                }
            });
        });

        return `
        <div class="space-y-6">
            <!-- Barra Superior de Filtros Rápidos (Clase y Fase) -->
            <div class="terminal-border bg-mars-card p-4 border-t-4 border-t-amber-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h3 class="font-orbitron font-bold text-white text-sm uppercase tracking-wider">
                        🤝 Auditoría Docente de Contratos Comerciales
                    </h3>
                    <p class="text-xs text-slate-300 mt-0.5">
                        Supervisión de compromisos corporativos suscritos por los CEOs y liquidación automática en Ledger.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    <!-- Selector de Clase -->
                    <div class="flex items-center gap-1.5 bg-black border border-slate-700 p-1">
                        <span class="text-[10px] text-slate-400 font-mono uppercase px-1">Clase:</span>
                        <select onchange="ui.setClassFilter(this.value);" class="bg-black text-amber-400 font-bold text-xs p-1 outline-none uppercase min-h-[44px]">
                            ${allClasses.map(cls => `<option value="${cls}" ${classFilter === cls ? 'selected' : ''}>${cls === 'ALL' ? 'Todas (A-F, TEST)' : `Clase ${cls}`}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Selector de Fase -->
                    <div class="flex items-center gap-1.5 bg-black border border-slate-700 p-1">
                        <span class="text-[10px] text-slate-400 font-mono uppercase px-1">Fase:</span>
                        <select onchange="ui.adminContractsPhaseFilter=this.value; ui.render();" class="bg-black text-mars-cyan font-bold text-xs p-1 outline-none uppercase min-h-[44px]">
                            ${allPhases.map(ph => `<option value="${ph}" ${phaseFilter === ph ? 'selected' : ''}>${ph === 'ALL' ? 'Todas las Fases' : `Fase ${ph}`}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <!-- Fila de KPIs de Misiones -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-mars-cyan text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Suscritos</span>
                    <strong class="text-xl font-orbitron text-white">${totalSigned}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-amber-400 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">En Curso</span>
                    <strong class="text-xl font-orbitron text-amber-400">${totalPending}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-emerald-500 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Cumplidos</span>
                    <strong class="text-xl font-orbitron text-emerald-400">${totalCompleted}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-rose-500 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Penalizados</span>
                    <strong class="text-xl font-orbitron text-rose-400">${totalFailed}</strong>
                </div>
            </div>

            <!-- Tabla de Contratos con Cabecera Fija -->
            <div class="terminal-border bg-mars-card border-t-2 border-t-slate-700 overflow-hidden">
                <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="bg-slate-950 text-slate-300 uppercase font-mono sticky top-0 z-10 border-b border-mars-border">
                            <tr>
                                <th class="p-3">Startup</th>
                                <th class="p-3">Clase</th>
                                <th class="p-3">Fase</th>
                                <th class="p-3">Licitación Corporativa</th>
                                <th class="p-3">Requisitos Clave</th>
                                <th class="p-3">Recomp./Penaliz.</th>
                                <th class="p-3">Estado</th>
                                <th class="p-3 text-right">Dictamen Docente (1 Clic)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800">
                            ${filteredCoIds.map(cid => {
                                const co = companies[cid];
                                const contracts = co.contracts || {};
                                const phasesToList = phaseFilter === 'ALL' ? ['I', 'II', 'III', 'IV'] : [phaseFilter];

                                return phasesToList.map(ph => {
                                    const c = contracts[ph];
                                    const isSigned = c && c.contractId;

                                    return `
                                    <tr class="hover:bg-slate-900/60 transition-colors">
                                        <td class="p-3 font-orbitron text-white font-bold">
                                            <button type="button" onclick="ui.showCompanyLogins('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:underline inline-flex items-center">
                                                ${this.escapeHTML(co.name)}
                                            </button>
                                        </td>
                                        <td class="p-3 font-mono">
                                            <span class="px-2 py-0.5 bg-black border border-slate-700 text-slate-300">
                                                ${this.escapeHTML(co.classGroup || 'A')}
                                            </span>
                                        </td>
                                        <td class="p-3 font-mono font-bold text-amber-400">
                                            Fase ${ph}
                                        </td>
                                        <td class="p-3 max-w-[200px] truncate" title="${isSigned ? `${c.company} — ${c.title}` : 'Sin contrato'}">
                                            ${isSigned ? `
                                                <div class="flex flex-col">
                                                    <span class="font-bold text-white uppercase text-xs">${this.escapeHTML(c.company)}</span>
                                                    <span class="text-[10px] text-slate-400 truncate">${this.escapeHTML(c.title)}</span>
                                                </div>
                                            ` : `<span class="text-slate-500 italic">-- Ninguno --</span>`}
                                        </td>
                                        <td class="p-3 max-w-[280px] truncate" title="${isSigned ? c.requirements : ''}">
                                            ${isSigned ? `
                                                <span class="text-slate-300 font-sans text-xs truncate block">${this.escapeHTML(c.requirements)}</span>
                                                <span class="text-[10px] text-indigo-300 italic block mt-0.5 truncate">${this.escapeHTML(c.verification || '')}</span>
                                            ` : `<span class="text-slate-600">--</span>`}
                                        </td>
                                        <td class="p-3 font-mono">
                                            ${isSigned ? `
                                                <div class="flex items-center gap-1.5 font-bold">
                                                    <span class="text-emerald-400">+${c.reward} €v</span>
                                                    <span class="text-slate-600">/</span>
                                                    <span class="text-rose-400">-${c.penalty} €v</span>
                                                </div>
                                            ` : `<span class="text-slate-600">--</span>`}
                                        </td>
                                        <td class="p-3">
                                            ${isSigned ? (
                                                c.status === 'CUMPLIDO'
                                                    ? `<span class="px-2 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold rounded-sm">✅ CUMPLIDO</span>`
                                                    : (c.status === 'NO_CUMPLIDO'
                                                        ? `<span class="px-2 py-1 bg-rose-950/80 border border-rose-500 text-rose-300 font-mono text-xs font-bold rounded-sm">❌ NO CUMPLIDO</span>`
                                                        : `<span class="px-2 py-1 bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-mono text-xs animate-pulse rounded-sm">⏳ EN CURSO</span>`)
                                            ) : `<span class="text-slate-600 text-xs font-mono">SIN CONTRATO</span>`}
                                        </td>
                                        <td class="p-3 text-right">
                                            ${isSigned ? (
                                                c.status === 'EN_CURSO' ? `
                                                    <div class="flex items-center justify-end gap-2">
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeHTML(cid)}', '${ph}', true)" class="min-h-[44px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs transition-all shadow-sm">
                                                            ✅ Cumplido (+${c.reward} €v)
                                                        </button>
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeHTML(cid)}', '${ph}', false)" class="min-h-[44px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs transition-all shadow-sm">
                                                            ❌ No Cumplido (-${c.penalty} €v)
                                                        </button>
                                                    </div>
                                                ` : `
                                                    <div class="flex items-center justify-end gap-2 text-xs">
                                                        <span class="text-[10px] text-slate-400 font-mono">Liquidado (${this.escapeHTML(c.settledDate || '')})</span>
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeHTML(cid)}', '${ph}', ${c.status !== 'CUMPLIDO'})" class="min-h-[44px] px-2.5 py-1 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs uppercase" title="Modificar dictamen">
                                                            ✏️ Rectificar
                                                        </button>
                                                    </div>
                                                `
                                            ) : `<span class="text-slate-600 text-xs">--</span>`}
                                        </td>
                                    </tr>`;
                                }).join('');
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    },

    modalSettleContract(coId, phase, isCompleted) {
        const co = state.data.companies?.[coId];
        if (!co) return;
        const c = co.contracts?.[phase];
        if (!c) return;

        const options = isCompleted ? [
            "Validación de evidencias curriculares satisfactoria",
            "Objetivo técnico y telemetría superados con éxito",
            "Top 3 Notas de Prensa alcanzado en edición oficial",
            "Auditoría contable y de costes sin descuadres",
            "Cumplimiento estricto de tolerancias de taller y calidad"
        ] : [
            "No alcanza la cota mínima o requisitos exigidos",
            "Descuadre presupuestario o desviación de costes > 5%",
            "Falta de metraje fotogramétrico o telemetría continua",
            "Incumplimiento de marcas temporales y plazos oficiales",
            "Devolución no subsanada en entregables curriculares"
        ];

        const delta = isCompleted ? `+${c.reward} €v` : `-${c.penalty} €v`;

        const body = `
        <div class="space-y-4 text-xs">
            <div class="p-3 bg-slate-900 border ${isCompleted ? 'border-emerald-500/50' : 'border-rose-500/50'}">
                <span class="text-[10px] font-mono uppercase text-slate-400">Startup Objetivo:</span>
                <h4 class="font-orbitron font-bold text-white text-sm uppercase">${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup || 'A')}]</h4>
                <p class="text-xs text-amber-300 font-bold mt-1">Fase ${this.escapeHTML(phase)}: ${this.escapeHTML(c.company)} — ${this.escapeHTML(c.title)}</p>
            </div>

            <div class="bg-black/70 p-3 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase font-bold">Requisitos Auditados:</span>
                <p class="text-slate-200 font-sans">${this.escapeHTML(c.requirements)}</p>
                <span class="text-[10px] font-mono text-slate-400 uppercase font-bold block pt-1">Criterio Oficial de Verificación:</span>
                <p class="text-indigo-300 italic">${this.escapeHTML(c.verification)}</p>
            </div>

            <div class="p-3 text-center ${isCompleted ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/50 text-rose-300'} font-mono text-sm font-bold">
                Impacto en Libro Mayor (Ledger): <span class="text-base ${isCompleted ? 'text-emerald-400' : 'text-rose-400'}">${delta}</span>
            </div>

            <div>
                <label for="settle-contract-reason" class="text-slate-300 font-bold uppercase block mb-1">
                    Motivo Tipificado del Dictamen Docente:
                </label>
                <select id="settle-contract-reason" class="w-full min-h-[44px] bg-black border border-slate-700 text-white text-xs p-2.5 outline-none font-sans">
                    ${options.map(opt => `<option value="${this.escapeHTML(opt)}">${this.escapeHTML(opt)}</option>`).join('')}
                </select>
            </div>

            <div class="flex gap-3 pt-2">
                <button type="button" onclick="ui.closeModal()" class="flex-1 min-h-[44px] bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase transition-colors">
                    Cancelar
                </button>
                <button type="button" onclick="ui.confirmSettleContract('${this.escapeHTML(coId)}', '${this.escapeHTML(phase)}', ${isCompleted})" class="flex-1 min-h-[44px] ${isCompleted ? 'bg-emerald-500 text-black hover:bg-white' : 'bg-rose-600 text-white hover:bg-white hover:text-rose-600'} font-black text-xs uppercase font-orbitron transition-all shadow-md">
                    ${isCompleted ? 'Aprobar y Abonar (+€v)' : 'Registrar Penalización (-€v)'}
                </button>
            </div>
        </div>`;

        this.showModal(`AUDITORÍA DOCENTE • CONTRATOS COMERCIALES FASE ${phase}`, body, "");
    },

    confirmSettleContract(coId, phase, isCompleted) {
        const selectEl = document.getElementById('settle-contract-reason');
        const reason = selectEl ? selectEl.value : '';

        const res = state.settleCommercialContract(coId, phase, isCompleted, reason);
        if (res && res.ok) {
            this.closeModal();
            this.notify("✅ Dictamen docente ejecutado y liquidado en el Libro Mayor con éxito.", "success");
            this.render();
        } else {
            this.notify("❌ " + (res?.error || "Error al liquidar contrato"), "error");
        }
    }
});
