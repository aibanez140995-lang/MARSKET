// js/ui-docente-eval.js
// --- MÓDULO DOCENTE: RÚBRICAS PONDERADAS (100%), ACTAS Y ARCHIVO DOCUMENTAL (19 ENTREGABLES) (v1.0.18) ---

Object.assign(ui, {
    renderAdminEval() {
        const isCoord = state.user.role.startsWith('COORD');
        const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        
        let adminHtml = `<div class="mb-6 flex flex-wrap gap-4 items-center bg-slate-900 p-3 border border-mars-border">`;
        if(isCoord) {
            adminHtml += `
            <select aria-label="Vista de evaluación de coordinación" onchange="ui.coordEvalView=this.value; ui.evalSelectedCo=''; ui.render()" class="min-h-[44px] bg-black border border-mars-cyan text-mars-cyan text-xs p-2.5 uppercase font-bold outline-none cursor-pointer">
                <option value="ACTA" ${this.coordEvalView==='ACTA'?'selected':''}>📊 Acta General Calificaciones (100% Ponderada)</option>
                <option value="ARCHIVE" ${this.coordEvalView==='ARCHIVE'?'selected':''}>📁 Archivo Documental Central (19 Enlaces)</option>
                ${['FYQ','LYE','LEN','ECO','MAT','ING'].map(s => `<option value="${s}" ${this.coordEvalView===s?'selected':''}>Evaluar: ${this.escapeHTML(RUBRIC_CONFIG[s].name)} (${Math.round((weights[s]||0)*100)}%)</option>`).join('')}
            </select>
            ${this.coordEvalView === 'ACTA' ? `<button onclick="ui.exportActaCSV()" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors">Exportar Acta Ponderada CSV</button>` : ''}
            `;
        } else {
            const wPct = Math.round((weights[activeSubject] || 0) * 100);
            adminHtml += `<h3 class="font-orbitron text-mars-cyan text-sm uppercase px-4 py-2">Módulo Calificador: <span class="text-white">${this.escapeHTML(RUBRIC_CONFIG[activeSubject].name)}</span> <span class="text-mars-yellow text-xs ml-2">[PESO PROYECTO: ${wPct}%]</span></h3>`;
        }
        
        adminHtml += `
            <select aria-label="Filtrar por clase" onchange="ui.evalClassFilter=this.value; ui.evalSelectedCo=''; ui.render()" class="min-h-[44px] bg-black border border-mars-yellow text-mars-yellow text-xs p-2.5 uppercase font-bold outline-none cursor-pointer ml-auto">
                <option value="ALL" ${this.evalClassFilter==='ALL'?'selected':''}>Todas las Clases</option>
                ${['A','B','C','D','E','F'].map(c => `<option value="${c}" ${this.evalClassFilter===c?'selected':''}>Clase ${c}</option>`).join('')}
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
                                    <td class="py-3 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${this.escapeHTML(cid)}')" class="min-h-[36px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 max-w-[260px] truncate inline-block align-middle" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</button></td>${cellsHtml}
                                    <td class="py-3 font-mono pr-3 text-xs ${pctEval === 100 ? 'text-mars-green font-bold' : 'text-slate-300'}">${pctEval}%</td>
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
                { key: 'technicalReport', label: 'FYQ 2: Informe' },
                { key: 'brandIdentity_dec', label: 'LYE 1A: Marca Dic' },
                { key: 'brandIdentity_apr', label: 'LYE 1B: Marca Abr' },
                { key: 'businessModelDoc', label: 'LYE 2: Bus. Model' },
                { key: 'businessModelCanvas', label: 'LYE 3: Canvas' },
                { key: 'decisionDiary_dec', label: 'LYE 4A: Diario Dic' },
                { key: 'decisionDiary_apr', label: 'LYE 4B: Diario Abr' },
                { key: 'investorDossier', label: 'LEN: Dossier Inv.' },
                { key: 'budgetInitial', label: 'ECO 1: Pres. Ini' },
                { key: 'incomeStatement', label: 'ECO 2: Cta. Res.' },
                { key: 'budgetPostProto', label: 'ECO 3: Pres. Post' },
                { key: 'balanceSheet', label: 'ECO 4: Balance' },
                { key: 'goniometerEvidence', label: 'MAT 1: Gonióm.' },
                { key: 'mathReportDist', label: 'MAT 2: Dist. Base' },
                { key: 'mathReportTwoPoints', label: 'MAT 3: 2 Puntos' },
                { key: 'mathReportFinal', label: 'MAT 4: Inf. Final' },
                { key: 'oralPresentation', label: 'ING 1: Oral Pres.' },
                { key: 'writtenEssays', label: 'ING 2: Redacc.' }
            ];

            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="mb-4 border-b border-mars-border pb-2 flex justify-between items-center">
                    <div>
                        <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Auditoría del Archivo Documental Central (19 Entregables)</h4>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control de subida de enlaces en Drive/Canva (Desliza horizontalmente ➔)</p>
                    </div>
                </div>
                <div class="overflow-x-auto w-full pb-2">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border bg-slate-900/80">
                            <tr>
                                <th class="py-3 px-2 sticky left-0 bg-slate-900 z-10 border-r border-mars-border">Empresa</th>
                                <th class="py-3 px-2 text-center">Progreso</th>
                                ${docCols.map(col => `<th class="py-3 px-2 text-center">${col.label}</th>`).join('')}
                                <th class="py-3 px-2 text-center">IA Prompts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {}; 
                                const aiCount = (co.aiPrompts||[]).filter(p=>p.status==='APROBADO').length;
                                const deliveredTotal = docCols.filter(col => !!d[col.key]).length;
                                
                                const dLink = (doc) => doc 
                                    ? `<a href="${this.escapeHTML(doc.dataUrl)}" target="_blank" rel="noopener noreferrer" class="bg-mars-green/15 text-mars-green border border-mars-green px-2 py-1 font-bold hover:bg-mars-green hover:text-black transition-colors block text-center">${doc.type==='link'?'🔗 LINK':'📁 FILE'}</a>` 
                                    : `<span class="text-slate-400 border border-slate-800 px-2 py-1 block text-center">--</span>`;
                                
                                const aLink = aiCount > 0 
                                    ? `<span class="text-blue-400 font-bold bg-blue-500/10 border border-blue-500 px-2 py-1 block text-center">✓ ${aiCount}</span>` 
                                    : `<span class="text-slate-400 border border-slate-800 px-2 py-1 block text-center">0</span>`;

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-2.5 px-2 font-orbitron text-white font-bold sticky left-0 bg-mars-card z-10 border-r border-mars-border max-w-[220px] truncate" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</td>
                                    <td class="py-2.5 px-2 font-mono font-bold text-center text-mars-yellow">${deliveredTotal}/${docCols.length}</td>${docCols.map(col => `<td class="py-2.5 px-1.5">${dLink(d[col.key])}</td>`).join('')}
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
            
            let selectCoHtml = `<label for="eval-co-select" class="sr-only">Seleccionar Startup a Evaluar</label>
            <select id="eval-co-select" onchange="ui.selectEvalCo(this.value)" class="min-h-[44px] w-full md:w-1/2 bg-slate-900 border border-mars-border text-white text-xs p-3 uppercase font-bold outline-none focus:border-mars-cyan mb-6">
                <option value="">-- Seleccione Startup a Evaluar --</option>
                ${Object.keys(state.data.companies)
                    .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                    .map(cid => `<option value="${this.escapeHTML(cid)}" ${this.evalSelectedCo===cid?'selected':''}>${this.escapeHTML(state.data.companies[cid].name)} [Clase ${this.escapeHTML(state.data.companies[cid].classGroup)}]</option>`).join('')}
            </select>`;

            if(!this.evalSelectedCo) {
                adminHtml += `<div class="terminal-border bg-mars-card p-6">${selectCoHtml}<p class="text-xs text-slate-300 italic">Esperando selección de startup objetivo...</p></div>`;
            } else {
                const co = state.data.companies[this.evalSelectedCo];
                if (!co) return ''; 
                
                const pastGrade = (co.grades && co.grades[activeSubject]) ? co.grades[activeSubject] : { scores: {}, feedback: '' };
                const docs = co.deliverables || {};
                
                let evidenceHtml = `<h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Evidencias Adjuntas (${this.escapeHTML(activeSubject)})</h4>`;
                
                if (activeSubject === 'FYQ') {
                    evidenceHtml += this.renderDocBadge('1. Hoja Registro Preliminar (Dic)', docs.preliminaryReport);
                    evidenceHtml += this.renderDocBadge('2. Informe Técnico Final (Abr)', docs.technicalReport);
                    if(co.flightTests && co.flightTests.length > 0) {
                        evidenceHtml += `<div class="mt-4 bg-black p-3 border border-slate-800"><span class="text-mars-yellow text-xs font-bold uppercase block mb-2">Ensayos en Banco de Pruebas:</span><div class="text-xs space-y-1 max-h-40 overflow-y-auto">`;
                        co.flightTests.forEach(f => {
                            const h_mm = f.heightMm !== undefined ? f.heightMm : (f.heightM * 1000);
                            evidenceHtml += `<p class="text-slate-200 border-b border-slate-900 pb-1 break-words">${this.escapeHTML(f.bottle)} | H: <strong class="text-mars-green">${Number(h_mm).toFixed(0)} mm</strong> | C: ${f.costEurV}€v | E: <strong class="text-mars-yellow">${Number(f.efficiency).toFixed(2)}</strong></p>`;
                        });
                        evidenceHtml += `</div></div>`;
                    }
                } else if (activeSubject === 'ECO') {
                    evidenceHtml += `<p class="text-xs text-mars-yellow uppercase font-bold mb-2">Nota: El criterio 1 corresponde al Test Evaluativo (20%).</p>`;
                    evidenceHtml += this.renderDocBadge('1. Presupuesto Inicial (20%)', docs.budgetInitial);
                    evidenceHtml += this.renderDocBadge('2. Cuenta de Resultados (20%)', docs.incomeStatement);
                    evidenceHtml += this.renderDocBadge('3. Presupuesto Post-Prototipo (20%)', docs.budgetPostProto);
                    evidenceHtml += this.renderDocBadge('4. Balance de Situación (20%)', docs.balanceSheet);
                } else if (activeSubject === 'LYE') {
                    evidenceHtml += this.renderDocBadge('1A. Identidad y Misión (Diciembre)', docs.brandIdentity_dec);
                    evidenceHtml += this.renderDocBadge('1B. Identidad y Misión (Abril)', docs.brandIdentity_apr);
                    evidenceHtml += this.renderDocBadge('2. Business Model Escrito', docs.businessModelDoc);
                    evidenceHtml += this.renderDocBadge('3. Business Model Canvas', docs.businessModelCanvas);
                    evidenceHtml += this.renderDocBadge('4A. Diario Decisiones e IA (Diciembre)', docs.decisionDiary_dec);
                    evidenceHtml += this.renderDocBadge('4B. Diario Decisiones e IA (Abril)', docs.decisionDiary_apr);
                    evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-xs font-bold uppercase">Manifiesto / Propuesta de Valor:</span><p class="text-xs text-slate-200 italic mt-1 bg-black p-3 border border-slate-800 leading-relaxed max-h-28 overflow-y-auto break-words">"${this.escapeHTML(co.valueProposition || 'No redactada todavía.')}"</p></div>`;
                } else if (activeSubject === 'LEN') {
                    evidenceHtml += this.renderDocBadge('1. Dossier para Inversores (Argumentativo)', docs.investorDossier);
                } else if (activeSubject === 'MAT') {
                    evidenceHtml += this.renderDocBadge('1. Elaboración de Goniómetro/s (25%)', docs.goniometerEvidence);
                    evidenceHtml += this.renderDocBadge('2. Informe Distancia Conocida (25%)', docs.mathReportDist);
                    evidenceHtml += this.renderDocBadge('3. Informe Dos Mediciones (25%)', docs.mathReportTwoPoints);
                    evidenceHtml += this.renderDocBadge('4. Informe Técnico Final (25%)', docs.mathReportFinal);
                } else if (activeSubject === 'ING') {
                    evidenceHtml += this.renderDocBadge('1. Expresión Oral: Presentación (70%)', docs.oralPresentation);
                    evidenceHtml += this.renderDocBadge('2. Redacciones Escritas (30%)', docs.writtenEssays);
                }

                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 animate-in fade-in duration-300">
                    ${selectCoHtml}
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div class="lg:col-span-2 space-y-4">
                            <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-4 flex-wrap gap-2">
                                <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Criterios Oficiales (${this.escapeHTML(activeSubject)})</h4>
                                <span class="text-xs bg-mars-yellow/10 text-mars-yellow border border-mars-yellow px-2 py-0.5 font-bold uppercase">Representación Global: ${subWeightPct}%</span>
                            </div>
                            ${config.criteria.map(c => `
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-900/50 p-4 border border-mars-border hover:border-mars-cyan transition-colors">
                                <div class="flex-grow pr-4">
                                    <label for="grade-${c.id}" class="text-xs text-white font-bold uppercase leading-tight block cursor-pointer">${this.escapeHTML(c.name)}</label>
                                    <span class="text-xs bg-mars-cyan text-black px-2 py-0.5 mt-2 inline-block font-bold">PESO EN ASIGNATURA: ${Math.round(c.weight*100)}%</span>
                                </div>
                                <input type="number" id="grade-${c.id}" min="0" max="10" step="0.1" value="${pastGrade.scores && pastGrade.scores[c.id] !== undefined ? pastGrade.scores[c.id] : ''}" oninput="ui.calcRealtimeGrade('${activeSubject}')" class="min-h-[44px] w-full sm:w-24 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base p-2 outline-none focus:border-mars-cyan shrink-0" placeholder="0-10">
                            </div>`).join('')}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <textarea id="eval-feedback" aria-label="Observaciones cualitativas y feedback" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white h-full min-h-[100px] outline-none focus:border-mars-cyan leading-relaxed" placeholder="Observaciones cualitativas y feedback para la startup...">${this.escapeHTML(pastGrade.feedback||'')}</textarea>
                                <div class="flex flex-col">
                                    <div class="terminal-border border-dashed p-4 text-center mb-3 flex-grow bg-black flex flex-col justify-center">
                                        <p class="text-xs text-slate-300 uppercase font-bold mb-1 tracking-widest">Nota Materia (${this.escapeHTML(activeSubject)})</p>
                                        <p id="realtime-grade" class="text-5xl font-orbitron text-mars-green tracking-tighter">${pastGrade.final !== undefined && pastGrade.final !== null ? Number(pastGrade.final).toFixed(2) : '0.00'}</p>
                                    </div>
                                    <button onclick="ui.saveGrade('${activeSubject}')" class="min-h-[44px] bg-mars-cyan text-black font-black py-4 text-xs uppercase tracking-widest hover:glow-cyan transition-all">[ REGISTRAR CALIFICACIÓN ]</button>
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

    selectEvalCo(cid) {
        this.evalSelectedCo = cid;
        this.render();
    },

    calcRealtimeGrade(subject) {
        const config = RUBRIC_CONFIG[subject];
        if (!config) return;
        let total = 0;
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el) {
                const val = parseFloat(el.value) || 0;
                total += val * c.weight;
            }
        });
        const display = document.getElementById('realtime-grade');
        if (display) display.innerText = total.toFixed(2);
    },

    saveGrade(subject) {
        if (!this.evalSelectedCo) return this.notify("Seleccione una startup primero.", "warning");
        const config = RUBRIC_CONFIG[subject];
        const co = state.data.companies[this.evalSelectedCo];
        if (!co) return;
        
        co.grades = co.grades || {};
        
        let scores = {};
        let total = 0;
        let allFilled = true;
        
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el) {
                const val = parseFloat(el.value);
                if (isNaN(val)) allFilled = false;
                scores[c.id] = isNaN(val) ? 0 : val;
                total += (isNaN(val) ? 0 : val) * c.weight;
            }
        });
        
        const commitGrade = () => {
            const elFeedback = document.getElementById('eval-feedback');
            const feedback = elFeedback ? this.cleanInput(elFeedback.value) : '';
            co.grades[subject] = { scores, feedback, final: total };
            
            telemetry.log("EVALUACIÓN", `Nota ${subject} registrada a ${co.name}: ${total.toFixed(2)}`);
            state.save();
            this.notify(`Calificación de ${subject} registrada para ${co.name}: ${total.toFixed(2)}`, "success");
            this.render();
        };

        if (!allFilled) {
            this.confirmAction(
                "Criterios sin calificar",
                "Hay criterios sin calificar (se contarán como 0). ¿Desea continuar?",
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
    }
});