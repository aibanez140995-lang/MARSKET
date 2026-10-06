// js/ui-docente-eval.js
// --- MÓDULO DOCENTE: RÚBRICAS, ACTAS Y ARCHIVO DOCUMENTAL ---

Object.assign(ui, {
    renderAdminEval() {
        const isCoord = state.user.role.startsWith('COORD');
        const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
        
        let adminHtml = `<div class="mb-6 flex flex-wrap gap-4 items-center bg-slate-900 p-2 border border-mars-border">`;
        if(isCoord) {
            adminHtml += `
            <select onchange="ui.coordEvalView=this.value; ui.evalSelectedCo=''; ui.render()" class="bg-black border border-mars-cyan text-mars-cyan text-xs p-2 uppercase font-bold outline-none cursor-pointer">
                <option value="ACTA" ${this.coordEvalView==='ACTA'?'selected':''}>📊 Acta General Calificaciones</option>
                <option value="ARCHIVE" ${this.coordEvalView==='ARCHIVE'?'selected':''}>📁 Archivo Documental Central</option>
                ${['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => `<option value="${s}" ${this.coordEvalView===s?'selected':''}>Evaluar: ${RUBRIC_CONFIG[s].name}</option>`).join('')}
            </select>
            ${this.coordEvalView === 'ACTA' ? `<button onclick="ui.exportActaCSV()" class="bg-mars-green text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors">Exportar Acta CSV</button>` : ''}
            `;
        } else {
            adminHtml += `<h3 class="font-orbitron text-mars-cyan text-sm uppercase px-4 py-2">Módulo Calificador: <span class="text-white">${RUBRIC_CONFIG[activeSubject].name}</span></h3>`;
        }
        
        adminHtml += `
            <select onchange="ui.evalClassFilter=this.value; ui.evalSelectedCo=''; ui.render()" class="bg-black border border-mars-yellow text-mars-yellow text-xs p-2 uppercase font-bold outline-none cursor-pointer ml-auto">
                <option value="ALL" ${this.evalClassFilter==='ALL'?'selected':''}>Todas las Clases</option>
                ${['A','B','C','D','E','F'].map(c => `<option value="${c}" ${this.evalClassFilter===c?'selected':''}>Clase ${c}</option>`).join('')}
            </select>
        </div>`;

        if(isCoord && this.coordEvalView === 'ACTA') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Startups</th><th class="pr-3">FYQ</th><th class="pr-3">ECO</th><th class="pr-3">LYE</th><th class="pr-3">LEN</th><th class="pr-3">MAT</th><th class="pr-3">ING</th><th class="text-mars-yellow">Media Global</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const g = co.grades || {}; 
                                const vals = ['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => g[s] ? g[s].final : null);
                                const validVals = vals.filter(v => v !== null);
                                const avg = validVals.length > 0 ? (validVals.reduce((a,b)=>a+b,0)/validVals.length).toFixed(2) : '-';
                                
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-mars-cyan/5">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${co.name} [${co.classGroup}]</button></td>
                                    ${vals.map(v => `<td class="py-3 font-mono pr-3 ${v!==null?'text-mars-cyan font-bold':'text-slate-600'}">${v!==null ? v.toFixed(2) : '--'}</td>`).join('')}
                                    <td class="py-3 font-mono text-mars-yellow font-black text-sm">${avg}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } else if(isCoord && this.coordEvalView === 'ARCHIVE') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[9px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Empresa</th><th class="pr-4">Informe Téc (FYQ)</th><th class="pr-4">P. Fase I (ING/LYE)</th><th class="pr-4">P. Fase III (LEN)</th><th class="pr-4">Libro Finanzas (ECO)</th><th class="pr-4">Propuesta Valor</th><th>IA Prompts</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {}; 
                                const aiCount = (co.aiPrompts||[]).filter(p=>p.status==='APROBADO').length;
                                
                                const dLink = (doc) => doc ? `<a href="${doc.dataUrl}" target="_blank" download="${doc.type==='file'?doc.name:''}" class="bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-2 py-1 font-bold hover:bg-mars-cyan hover:text-black transition-colors block text-center">${doc.type==='link'?'🔗 ENLACE':'📁 ARCHIVO'}</a>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">PENDIENTE</span>`;
                                const vLink = co.valueProposition ? `<span class="text-mars-green font-bold bg-mars-green/10 border border-mars-green px-2 py-1 block text-center">✓ REDACTADA</span>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">VACÍA</span>`;
                                const aLink = aiCount > 0 ? `<span class="text-blue-400 font-bold bg-blue-500/10 border border-blue-500 px-2 py-1 block text-center">✓ ${aiCount} REGISTROS</span>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">0 REGISTROS</span>`;

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4">${co.name} [${co.classGroup}]</td>
                                    <td class="py-3 pr-4">${dLink(d.technicalReport)}</td>
                                    <td class="py-3 pr-4">${dLink(d.presPhase1)}</td>
                                    <td class="py-3 pr-4">${dLink(d.presPhase3)}</td>
                                    <td class="py-3 pr-4">${dLink(d.financeBook)}</td>
                                    <td class="py-3 pr-4">${vLink}</td>
                                    <td class="py-3">${aLink}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        } else if(activeSubject) {
            const config = RUBRIC_CONFIG[activeSubject];
            
            let selectCoHtml = `<select id="eval-co-select" onchange="ui.selectEvalCo(this.value)" class="w-full md:w-1/2 bg-slate-900 border border-mars-border text-white text-xs p-3 uppercase font-bold outline-none focus:border-mars-cyan mb-6">
                <option value="">-- Seleccione Startup a Evaluar --</option>
                ${Object.keys(state.data.companies)
                    .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                    .map(cid => `<option value="${cid}" ${this.evalSelectedCo===cid?'selected':''}>${state.data.companies[cid].name} [${state.data.companies[cid].classGroup}]</option>`).join('')}
            </select>`;

            if(!this.evalSelectedCo) {
                adminHtml += `<div class="terminal-border bg-mars-card p-6">${selectCoHtml}<p class="text-xs text-slate-500 italic">Esperando selección de objetivo...</p></div>`;
            } else {
                const co = state.data.companies[this.evalSelectedCo];
                if (!co) return ''; 
                
                const pastGrade = co.grades[activeSubject] || { scores: {}, feedback: '' };
                const docs = co.deliverables || {};
                
                let evidenceHtml = `<h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Evidencias Adjuntas</h4>`;
                if (activeSubject === 'FYQ') {
                    evidenceHtml += this.renderDocBadge('Informe Técnico (FYQ)', docs.technicalReport);
                    if(co.flightTests && co.flightTests.length>0) {
                        evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-[9px] font-bold uppercase">Ensayos Vuelo:</span><div class="text-[9px] mt-1 space-y-1">`;
                        co.flightTests.forEach(f => evidenceHtml += `<p class="text-slate-300">H: ${f.heightM}m | E: ${f.efficiency.toFixed(2)}</p>`);
                        evidenceHtml += `</div></div>`;
                    }
                } else if (activeSubject === 'ECO') {
                    evidenceHtml += this.renderDocBadge('Libro Cuentas Financiero', docs.financeBook);
                } else if (activeSubject === 'LYE' || activeSubject === 'MARKETING' || activeSubject === 'LEN' || activeSubject === 'ING') {
                    evidenceHtml += this.renderDocBadge('Micro-Pitch Fase I', docs.presPhase1);
                    evidenceHtml += this.renderDocBadge('Pitch Final Fase III', docs.presPhase3);
                    if(activeSubject === 'LYE') evidenceHtml += this.renderDocBadge('Dossier Propuesta Valor', docs.valuePropDoc);
                    evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-[9px] font-bold uppercase">Texto Propuesta de Valor:</span><p class="text-[9px] text-slate-300 italic mt-1 bg-black p-3 border border-slate-800 leading-relaxed max-h-32 overflow-y-auto">"${co.valueProposition || 'La empresa aún no ha definido su propuesta de valor corporativa.'}"</p></div>`;
                } else {
                    evidenceHtml += `<p class="text-[9px] text-slate-500 italic">No hay entregables documentales específicos enlazados a la vista rápida de esta rúbrica.</p>`;
                }

                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 animate-in fade-in duration-300">
                    ${selectCoHtml}
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div class="lg:col-span-2 space-y-4">
                            <h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Criterios Oficiales (${activeSubject})</h4>
                            ${config.criteria.map(c => `
                            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-900/50 p-4 border border-mars-border hover:border-mars-cyan transition-colors">
                                <div class="flex-grow pr-4">
                                    <p class="text-[10px] text-white font-bold uppercase leading-tight">${c.name}</p>
                                    <span class="text-[8px] bg-mars-cyan text-black px-1.5 py-0.5 mt-2 inline-block font-bold">PESO: ${c.weight*100}%</span>
                                </div>
                                <input type="number" id="grade-${c.id}" min="0" max="10" step="0.1" value="${pastGrade.scores[c.id]||''}" oninput="ui.calcRealtimeGrade('${activeSubject}')" class="w-full sm:w-20 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base p-2 outline-none focus:border-mars-cyan shrink-0" placeholder="0-10">
                            </div>`).join('')}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <textarea id="eval-feedback" class="w-full bg-slate-900 border border-mars-border p-3 text-[10px] text-white h-full min-h-[100px] outline-none focus:border-mars-cyan leading-relaxed" placeholder="Observaciones cualitativas y feedback...">${pastGrade.feedback||''}</textarea>
                                <div class="flex flex-col">
                                    <div class="terminal-border border-dashed p-4 text-center mb-3 flex-grow bg-black flex flex-col justify-center">
                                        <p class="text-[8px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Nota Ponderada</p>
                                        <p id="realtime-grade" class="text-5xl font-orbitron text-mars-green tracking-tighter">${pastGrade.final ? pastGrade.final.toFixed(2) : '0.00'}</p>
                                    </div>
                                    <button onclick="ui.saveGrade('${activeSubject}')" class="bg-mars-cyan text-black font-black py-4 text-[10px] uppercase tracking-widest hover:glow-cyan transition-all">[ REGISTRAR CALIFICACIÓN ]</button>
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
        if (!this.evalSelectedCo) return alert("Seleccione una startup primero.");
        const config = RUBRIC_CONFIG[subject];
        const co = state.data.companies[this.evalSelectedCo];
        if (!co) return; // REGLA 1
        
        co.grades = co.grades || {}; // REGLA 1
        
        let scores = {};
        let total = 0;
        let allFilled = true;
        
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el) {
                const val = parseFloat(el.value);
                if (isNaN(val)) allFilled = false;
                scores[c.id] = val || 0;
                total += (val || 0) * c.weight;
            }
        });
        
        if (!allFilled) {
            if (!confirm("Hay criterios sin calificar (se contarán como 0). ¿Desea continuar?")) return;
        }
        
        const elFeedback = document.getElementById('eval-feedback');
        const feedback = elFeedback ? elFeedback.value : '';
        co.grades[subject] = { scores, feedback, final: total };
        
        telemetry.log("EVALUACIÓN", `Nota ${subject} registrada a ${co.name}: ${total.toFixed(2)}`);
        state.save();
        alert(`Calificación de ${subject} registrada correctamente: ${total.toFixed(2)}`);
        this.render();
    },

    exportActaCSV() {
        let csv = "Empresa,FYQ,ECO,LYE,LEN,MAT,ING,Media_Global\n";
        Object.values(state.data.companies).forEach(co => {
            const g = co.grades || {};
            const vals = ['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => g[s] ? g[s].final.toFixed(2) : '');
            const numVals = vals.filter(v => v !== '').map(Number);
            const avg = numVals.length > 0 ? (numVals.reduce((a,b)=>a+b,0)/numVals.length).toFixed(2) : '';
            csv += `"${co.name}",${vals.join(',')},${avg}\n`;
        });
        this.downloadFile(csv, 'csv', 'marsket_acta_notas.csv');
    }
});