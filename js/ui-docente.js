// js/ui-docente.js
// --- MÓDULO DE VISTAS Y ACCIONES PARA CLAUSTRO DOCENTE ---

Object.assign(ui, {
    evalClassFilter: 'ALL',
    _tempSponsorLogo: null, // Variable temporal segura para Base64

    // --- 1. VISTA PRINCIPAL DE ADMINISTRACIÓN ---
    viewAdmin(el) {
        if (!state.user || !state.user.admin) return; // REGLA 4: Validación de sesión
        
        const isAlex = state.user.role === 'COORD_ALEX';
        const isCoord = state.user.role.startsWith('COORD');
        
        let adminHtml = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 class="font-orbitron text-mars-yellow text-xl uppercase tracking-widest font-black">Centro_de_Mando_Docente</h2>
            <div class="flex flex-wrap gap-2 border border-mars-border bg-mars-card p-1">
                <button onclick="ui.adminTab='dash'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='dash'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">AEE & Finanzas</button>
                <button onclick="ui.adminTab='eval'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='eval'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Rúbricas & Entregas</button>
                <button onclick="ui.adminTab='startups'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='startups'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Startups</button>
                <button onclick="ui.adminTab='telemetry'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='telemetry'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Telemetría</button>
                ${isCoord ? `<button onclick="ui.adminTab='catalog'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='catalog'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Catálogo</button>` : ''}
                <button onclick="ui.adminTab='settings'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='settings'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Ajustes</button>
                ${isAlex ? `<button onclick="ui.adminTab='alexbox'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='alexbox'?'bg-mars-cyan text-black':'text-mars-cyan'} hover:text-white transition-colors border-l border-mars-cyan/30">Buzón Alex</button>` : ''}
            </div>
        </div>`;

        if(this.adminTab === 'dash') {
            let globalReal = 0;
            for (let c in state.data.companies) {
                const co = state.data.companies[c];
                co.realCosts = co.realCosts || []; // REGLA 1
                globalReal += co.realCosts.reduce((s, i) => s + i.eur, 0);
            }
            
            const canSponsor = state.data.config.teachers[state.user.role]?.canSponsor === true;

            adminHtml += `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div class="lg:col-span-1 terminal-border bg-mars-card p-6 text-center border-t-4 border-t-mars-magenta flex flex-col justify-center">
                    <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest">Inversión FÍSICA CLASE</h3>
                    <p class="text-5xl font-orbitron text-white mb-2 tracking-tighter">${globalReal.toFixed(2)} €</p>
                    <p class="text-[9px] text-slate-500 uppercase font-bold">Impacto económico real total</p>
                </div>
                <div class="lg:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Control Financiero, Patrocinios & Sanciones AEE</h3>
                    <table class="w-full text-left text-[10px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-3 pr-4">Empresa</th>
                                <th class="pr-4">Bal(€v)</th>
                                <th class="pr-4">Gasto Virtual</th>
                                <th class="pr-4">Gasto Físico</th>
                                <th class="pr-4">Patrocinio Fase I</th>
                                <th>Sanciones AEE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const c = state.data.companies[cid];
                                c.realCosts = c.realCosts || []; // REGLA 1
                                c.ledger = c.ledger || []; // REGLA 1
                                
                                const r = c.realCosts.reduce((s,i)=>s+i.eur,0);
                                const virtualSpend = c.ledger.filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(l.delta), 0);
                                
                                let sponsorHtml = '';
                                if(canSponsor) {
                                    sponsorHtml = `<button onclick="ui.modalAssignSponsor('${cid}')" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1 font-bold text-[9px] uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">Asignar Patrocinio</button>`;
                                } else {
                                    if(c.sponsorAwarded) {
                                        const cl = c.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700]':c.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0]':'text-[#cd7f32] border-[#cd7f32]';
                                        let spName = c.sponsorData?.name ? ` - ${c.sponsorData.name}` : '';
                                        let spLogo = c.sponsorData?.logo ? `<img src="${c.sponsorData.logo}" class="h-4 inline-block ml-2 rounded-sm object-contain bg-black/50 p-0.5">` : '';
                                        sponsorHtml = `<span class="${cl} font-bold text-[8px] uppercase border px-2 py-1 bg-black/50 flex items-center w-max gap-1">[PATROCINIO: ${c.sponsorAwarded}${spName}] ${spLogo}</span>`;
                                    } else {
                                        sponsorHtml = `<span class="text-slate-600 font-bold text-[8px] uppercase border border-slate-700 px-2 py-1 bg-slate-900 block w-max">[SIN PATROCINIO]</span>`;
                                    }
                                }

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-4 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${c.name}</button></td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-green font-bold">${c.balance.toFixed(0)} €v</span></td>
                                    <td class="py-4 font-mono pr-4"><button onclick="ui.modalVirtualSpend('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4" title="Ver desglose">${virtualSpend.toFixed(2)} €v</button></td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-magenta">${r.toFixed(2)} €</span></td>
                                    <td class="py-4 pr-4">${sponsorHtml}</td>
                                    <td class="py-4">
                                        <button onclick="ui.modalAEEFine('${cid}')" class="bg-red-900/30 border border-red-500 text-red-500 px-3 py-1 font-bold text-[8px] uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_5px_red] whitespace-nowrap">Expediente AEE</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase">Solicitudes de Material Externo / I+D</h3>
                <div class="space-y-3">
                    ${(state.data.pendingCustom || []).map(p => `
                    <div class="bg-slate-900 border border-mars-border p-3 flex justify-between items-center text-[10px] flex-wrap gap-2">
                        <div class="flex-grow min-w-[200px]"><p class="text-mars-yellow font-bold uppercase">${state.data.companies[p.company]?.name || 'Desconocida'}</p><p class="text-white font-bold text-xs uppercase">${p.name}</p><p class="text-slate-400 italic">"${p.reason}"</p></div>
                        <div class="flex gap-2 items-center flex-shrink-0">
                            <input type="number" id="val-price-${p.id}" class="w-16 bg-black border border-mars-border p-2 text-mars-green text-center font-bold" placeholder="€v">
                            <button onclick="ui.teacherValidate('${p.id}', true)" class="bg-mars-green text-black px-4 py-2 font-black hover:bg-white transition-colors">OK</button>
                            <button onclick="ui.teacherValidate('${p.id}', false)" class="text-mars-magenta font-bold px-3 py-2 border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors">X</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Nada pendiente.</p>'}
                </div>
            </div>`;
        } 
        else if(this.adminTab === 'eval') {
            const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
            
            adminHtml += `<div class="mb-6 flex flex-wrap gap-4 items-center bg-slate-900 p-2 border border-mars-border">`;
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
                <div class="terminal-border bg-mars-card p-6 overflow-x-auto">
                    <table class="w-full text-left text-[10px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Startups</th><th class="pr-3">FYQ</th><th class="pr-3">ECO</th><th class="pr-3">LYE</th><th class="pr-3">LEN</th><th class="pr-3">MAT</th><th class="pr-3">ING</th><th class="text-mars-yellow">Media Global</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const g = co.grades || {}; // REGLA 1
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
                </div>`;
            } else if(isCoord && this.coordEvalView === 'ARCHIVE') {
                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 overflow-x-auto">
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Empresa</th><th class="pr-4">Informe Téc (FYQ)</th><th class="pr-4">P. Fase I (ING/LYE)</th><th class="pr-4">P. Fase III (LEN)</th><th class="pr-4">Libro Finanzas (ECO)</th><th class="pr-4">Propuesta Valor</th><th>IA Prompts</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {}; // REGLA 1
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
                    if (!co) return; // REGLA 1
                    
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
        }
        else if(this.adminTab === 'startups') {
            adminHtml += `
            <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div class="xl:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Crear Startup</h3>
                    <input type="text" id="new-co-name" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Nombre Corporativo">
                    <input type="number" id="new-co-cap" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan" placeholder="Capital (€v)" value="1500">
                    <select id="new-co-class" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                        ${['A','B','C','D','E','F'].map(c => `<option value="${c}">Clase ${c}</option>`).join('')}
                    </select>
                    <button onclick="ui.createStartup()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Registrar</button>
                </div>
                <div class="xl:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto border-t-4 border-t-mars-yellow">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Gestión de PINs de Acceso</h3>
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2">Empresa</th><th>Clase</th><th>CEO</th><th>TEC</th><th>FIN</th><th>MKT</th><th>OP_IA</th><th>Acción</th></tr></thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const co = state.data.companies[cid];
                                const r = co.roles || {}; // REGLA 1
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${co.name}</button></td>
                                    <td class="py-3 text-mars-yellow font-bold">${co.classGroup}</td>
                                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(rol => `
                                    <td class="py-3">
                                        ${isCoord ? `<input type="text" maxlength="4" value="${r[rol]||'1234'}" onchange="ui.updatePIN('${cid}', '${rol}', this.value)" class="w-10 bg-black border border-mars-border text-center text-mars-cyan font-bold p-1 outline-none focus:border-mars-yellow">` : `<span class="text-slate-500">****</span>`}
                                    </td>`).join('')}
                                    <td class="py-3">${isCoord ? `<button onclick="if(confirm('¿Borrar startup irreversiblemente?')) ui.deleteStartup('${cid}')" class="text-mars-magenta font-bold hover:underline">Eliminar</button>` : `<span class="text-slate-600">Bloqueado</span>`}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                    ${isCoord ? `<p class="text-[8px] text-slate-500 mt-4 uppercase">* Modifique los 4 dígitos y pulse Enter o cambie de campo para guardar automáticamente.</p>` : `<p class="text-[8px] text-mars-magenta mt-4 uppercase">Solo Coordinación puede modificar PINs o eliminar startups.</p>`}
                </div>
            </div>`;
        }
        else if(this.adminTab === 'telemetry') {
            let matRows = '';
            Object.keys(state.data.companies).forEach(cid => {
                const co = state.data.companies[cid];
                const s = co.loginStats || { totalLogins:0, roles:{} }; // REGLA 1
                matRows += `<tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                    <td class="py-3 font-orbitron text-white font-bold pr-4">${co.name}</td>
                    <td class="py-3 font-mono text-mars-cyan font-bold pr-4 text-center border-r border-mars-border/50">${s.totalLogins}</td>`;
                ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => {
                    const count = s.roles[r]?.count || 0;
                    const color = count > 4 ? 'text-mars-green' : (count > 0 ? 'text-mars-yellow' : 'text-mars-magenta animate-pulse');
                    matRows += `<td class="py-3 font-mono ${color} text-center font-bold px-2">${count}</td>`;
                });
                matRows += `</tr>`;
            });

            let allReports = [];
            Object.keys(state.data.companies).forEach(cid => {
                const co = state.data.companies[cid];
                (co.inactivityReports || []).forEach(r => allReports.push({...r, cid, coName: co.name}));
            });
            allReports.sort((a,b) => b.id.localeCompare(a.id));

            let reportsHtml = '';
            if (allReports.length === 0) {
                reportsHtml = '<p class="text-slate-600 text-xs italic">No hay reportes de inactividad activos.</p>';
            } else {
                reportsHtml = allReports.map(r => `
                    <div class="bg-slate-900/50 border ${r.status === 'PENDIENTE' ? 'border-mars-magenta' : 'border-mars-green/50'} p-3 text-[10px] mb-3 transition-colors">
                        <div class="flex justify-between items-center border-b border-slate-700 pb-2 mb-2">
                            <span class="font-bold text-white uppercase">${r.coName}</span>
                            <span class="text-[8px] text-slate-500">${r.date}</span>
                        </div>
                        <div class="flex justify-between mb-2">
                            <span class="text-mars-magenta font-bold uppercase">Reportado: ${r.reportedDept}</span>
                            <span class="text-slate-400 uppercase">Por: ${r.reportingRole.replace('_', ' ')}</span>
                        </div>
                        <p class="text-slate-300 italic bg-black p-2 border border-slate-800 mb-2">"${r.reason}"</p>
                        <div class="flex justify-between items-center mt-2">
                            <span class="text-[9px] font-bold uppercase ${r.status === 'PENDIENTE' ? 'text-mars-magenta animate-pulse' : 'text-mars-green'}">[${r.status}]</span>
                            ${r.status === 'PENDIENTE' ? `<button onclick="ui.resolveInactivityReport('${r.cid}', '${r.id}')" class="bg-mars-magenta/20 text-mars-magenta border border-mars-magenta px-3 py-1 hover:bg-mars-magenta hover:text-white transition-colors">Marcar Resuelto</button>` : ''}
                        </div>
                    </div>
                `).join('');
            }

            adminHtml += `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan text-center flex flex-col justify-center">
                    <p class="text-5xl font-orbitron text-mars-cyan">${state.data.telemetry.totalLogins}</p>
                    <p class="text-[9px] text-slate-500 uppercase mt-2 font-bold tracking-widest">Logins Globales</p>
                </div>
                <div class="md:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Matriz de Conexiones por Departamento</h3>
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Startup</th><th class="pr-4 text-center border-r border-mars-border/50">Total</th><th class="text-center px-2">CEO</th><th class="text-center px-2">TEC</th><th class="text-center px-2">FIN</th><th class="text-center px-2">MKT</th><th class="text-center px-2">OP_IA</th></tr></thead>
                        <tbody>${matRows}</tbody>
                    </table>
                </div>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="terminal-border bg-mars-card p-6 overflow-y-auto max-h-[400px]">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Registro Táctico de Sesiones (Últimas 100)</h3>
                    <div class="space-y-4">
                        ${state.data.telemetry.sessions.map(sess => `
                        <div class="border border-mars-border/50 bg-slate-900/30 p-3 text-[10px]">
                            <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                                <span class="text-mars-cyan font-bold uppercase">${sess.entity} | ${sess.role.replace('_',' ')}</span>
                                <span class="text-[8px] text-slate-500 bg-black px-2 py-0.5">${sess.timestamp.replace('T',' ').slice(0,19)}</span>
                            </div>
                            <ul class="text-slate-300 space-y-1">
                                ${sess.events.map(ev => `<li class="flex gap-2"><span class="text-mars-yellow shrink-0">[${ev.time}]</span><span class="font-bold text-white shrink-0">${ev.action}:</span><span class="text-slate-400 break-words">${ev.details}</span></li>`).join('') || '<li class="text-slate-600 italic">Sesión sin eventos clave.</li>'}
                            </ul>
                        </div>`).join('') || '<p class="text-slate-600 text-xs italic">No hay datos de telemetría.</p>'}
                    </div>
                </div>
                <div class="terminal-border bg-mars-card p-6 overflow-y-auto max-h-[400px] border-t-4 border-t-mars-magenta">
                    <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest">Alertas HR: Reportes de Inactividad</h3>
                    <div class="space-y-2">
                        ${reportsHtml}
                    </div>
                </div>
            </div>`;
        }
        else if(this.adminTab === 'catalog' && isCoord) {
            adminHtml += `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Añadir Nuevo Artículo</h3>
                    <input type="text" id="new-cat-id" placeholder="ID (Ej: F06)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <input type="text" id="new-cat-name" placeholder="Nombre completo" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <input type="number" id="new-cat-price" placeholder="Precio (€v)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <input type="text" id="new-cat-unit" placeholder="Unidad (Ej: Unidad, Gramo)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <select id="new-cat-category" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                        <option value="Fuselaje">Fuselaje</option>
                        <option value="Propulsión">Propulsión</option>
                        <option value="Aerodinámica">Aerodinámica</option>
                        <option value="Sellado">Sellado</option>
                        <option value="Externo">Externo</option>
                    </select>
                    <input type="text" id="new-cat-origin" placeholder="Origen (Ej: España)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                    <button onclick="ui.addCatalogItem()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Añadir al Catálogo</button>
                </div>
                <div class="lg:col-span-2 terminal-border bg-mars-card p-6 overflow-x-auto border-t-4 border-t-mars-yellow">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Gestión de Precios</h3>
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-2">ID</th><th>Nombre</th><th>Categoría</th><th>Precio (€v)</th><th>Acción</th></tr>
                        </thead>
                        <tbody>
                            ${state.data.catalog.map(item => `
                            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                <td class="py-2 text-slate-400 font-mono">${item.id}</td>
                                <td class="py-2 font-bold text-white">${item.name}</td>
                                <td class="py-2 text-slate-500">${item.category}</td>
                                <td class="py-2">
                                    <input type="number" id="price-${item.id}" value="${item.price}" class="w-20 bg-black border border-mars-border text-center text-mars-green font-bold p-1 outline-none focus:border-mars-yellow">
                                </td>
                                <td class="py-2">
                                    <button onclick="ui.saveCatalogPrice('${item.id}')" class="bg-mars-yellow/20 text-mars-yellow px-3 py-1 font-bold hover:bg-mars-yellow hover:text-black transition-colors">Guardar</button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        }
        else if(this.adminTab === 'settings') {
            const currentTeacher = state.data.config.teachers[state.user.role];
            const dl = state.data.config.deadlines;
            const gl = state.data.config.guidelines;
            const role = state.user.role;
            const isCoord = role.startsWith('COORD');

            let configHtml = '';

            if (isCoord) {
                configHtml = `
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                        <div class="space-y-3">
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase I (Inglés)</label><input type="datetime-local" id="dl-pres1" value="${dl.presPhase1}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Doc. Propuesta de Valor</label><input type="datetime-local" id="dl-vp" value="${dl.valuePropDoc}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Informe Técnico FYQ</label><input type="datetime-local" id="dl-tech" value="${dl.techReport}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                        </div>
                        <div class="space-y-3">
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Libro Cuentas FIN</label><input type="datetime-local" id="dl-fin" value="${dl.financeBook}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase III (Castellano)</label><input type="datetime-local" id="dl-pres3" value="${dl.presPhase3}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div class="border-t border-mars-border/50 pt-3 mt-3">
                                <label class="text-mars-magenta font-bold block mb-1">Enlace a Guía Oficial Informe FYQ (URL)</label>
                                <input type="text" id="gl-url" value="${gl.techReportDocUrl}" placeholder="https://..." class="w-full bg-slate-900 border border-mars-border p-2 text-white mb-2">
                                <input type="text" id="gl-notes" value="${gl.techReportNotes}" placeholder="Notas breves..." class="w-full bg-slate-900 border border-mars-border p-2 text-white">
                            </div>
                        </div>
                    </div>
                `;
            } else {
                switch(role) {
                    case 'FYQ':
                        configHtml = `
                            <div class="space-y-3 text-[10px]">
                                <div><label class="text-mars-cyan font-bold block mb-1">Cierre Informe Técnico FYQ</label><input type="datetime-local" id="dl-tech" value="${dl.techReport}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                                <div class="border-t border-mars-border/50 pt-3 mt-3">
                                    <label class="text-mars-magenta font-bold block mb-1">Enlace a Guía Oficial Informe FYQ (URL)</label>
                                    <input type="text" id="gl-url" value="${gl.techReportDocUrl}" placeholder="https://..." class="w-full bg-slate-900 border border-mars-border p-2 text-white mb-2">
                                    <input type="text" id="gl-notes" value="${gl.techReportNotes}" placeholder="Notas breves..." class="w-full bg-slate-900 border border-mars-border p-2 text-white">
                                </div>
                            </div>`;
                        break;
                    case 'LYE':
                        configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Doc. Propuesta de Valor</label><input type="datetime-local" id="dl-vp" value="${dl.valuePropDoc}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                        break;
                    case 'ECO':
                        configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Libro Cuentas FIN</label><input type="datetime-local" id="dl-fin" value="${dl.financeBook}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                        break;
                    case 'ING':
                        configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase I (Inglés)</label><input type="datetime-local" id="dl-pres1" value="${dl.presPhase1}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                        break;
                    case 'LEN':
                        configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase III (Castellano)</label><input type="datetime-local" id="dl-pres3" value="${dl.presPhase3}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                        break;
                    default:
                        configHtml = `<p class="text-slate-500 italic text-xs col-span-full">No hay plazos ni guías configurables para esta asignatura en el sistema central.</p>`;
                }
            }

            adminHtml += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow md:col-span-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase">Configuración de Plazos (Deadlines) y Guías</h3>
                    ${configHtml}
                    ${configHtml.includes('input') ? `<button onclick="ui.saveSettings()" class="w-full bg-mars-yellow text-black font-black py-3 mt-4 text-[10px] uppercase hover:bg-white transition-all">Guardar Configuración</button>` : ''}
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan md:col-span-2">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-2 uppercase">Infraestructura Cloudflare D1 (SQLite)</h3>
                    <p class="text-[10px] text-slate-400 mb-4">Estado de red: <span class="${state.isCloudOnline ? 'text-mars-green' : 'text-mars-yellow'} font-bold">${state.isCloudOnline ? 'CONECTADO A LA NUBE (SQLITE ONLINE)' : 'MODO LOCAL (DESCONECTADO)'}</span></p>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="state.fetchFromCloud().then(() => alert('Sincronización desde la nube completada.'))" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-2 text-[10px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all">Forzar Descarga D1</button>
                        <button onclick="state.pushToCloud(false).then(() => alert('Subida a Cloudflare D1 completada.'))" class="bg-mars-green/20 border border-mars-green text-mars-green px-4 py-2 text-[10px] font-bold uppercase hover:bg-mars-green hover:text-black transition-all">Forzar Subida D1</button>
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green">
                    <h3 class="font-orbitron text-mars-green text-xs mb-4 uppercase">Exportación de Datos (Backup)</h3>
                    <p class="text-[10px] text-slate-400 mb-4">Descargue los registros o restaure el sistema completo.</p>
                    <div class="flex flex-col gap-3">
                        <button onclick="ui.exportCSV()" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all text-left truncate">1. Exportar Libro de Caja (CSV)</button>
                        <button onclick="ui.exportActaCSV()" class="bg-mars-green/20 border border-mars-green text-mars-green px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-green hover:text-black transition-all text-left truncate">2. Exportar Acta de Notas (CSV)</button>
                        <button onclick="ui.exportJSON()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all text-left truncate">3. Descargar Backup (JSON)</button>
                        
                        <div class="border-t border-slate-800 mt-2 pt-4">
                            <input type="file" id="import-file" class="hidden" onchange="ui.importJSON(event)">
                            <button onclick="document.getElementById('import-file').click()" class="bg-slate-800 text-white w-full px-4 py-3 text-[10px] font-bold uppercase hover:bg-slate-700 border border-slate-600 text-left truncate">⚠️ Restaurar Sistema (JSON)</button>
                        </div>
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                    <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase">Seguridad Docente</h3>
                    <div class="bg-slate-900 p-4 border border-mars-border mb-4">
                        <p class="text-[10px] text-slate-400 mb-2 uppercase">Cambiar PIN para: <strong class="text-white">${currentTeacher ? currentTeacher.name : 'ROOT'}</strong></p>
                        <input type="text" id="new-teacher-pin" maxlength="4" class="w-full bg-black border border-mars-border p-3 text-center text-mars-cyan font-bold tracking-widest outline-none mb-3 text-lg" placeholder="4 DIG.">
                        <button onclick="ui.changeTeacherPIN()" class="block w-full bg-mars-magenta text-white py-3 text-[10px] font-bold uppercase hover:shadow-[0_0_15px_#ff0055] transition-all">Actualizar PIN</button>
                    </div>
                </div>
            </div>`;
        }
        else if(this.adminTab === 'alexbox') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <div class="flex justify-between items-center mb-6 border-b border-mars-border/50 pb-4">
                    <h3 class="font-orbitron text-mars-cyan text-lg uppercase tracking-widest">Buzón de Desarrollo (Alex Inbox)</h3>
                    <span class="bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-3 py-1 font-bold text-[10px]">${(state.data.suggestionsToAlex||[]).length} Mensajes</span>
                </div>
                <div class="space-y-4">
                    ${(state.data.suggestionsToAlex||[]).map(s => `
                    <div class="bg-black/50 border border-mars-cyan/30 p-4 text-[10px]">
                        <div class="flex justify-between mb-2">
                            <span class="text-mars-yellow font-bold uppercase">${s.author}</span>
                            <span class="text-slate-500">${s.date}</span>
                        </div>
                        <p class="text-slate-300 italic bg-slate-900 p-3 border border-slate-800 leading-relaxed whitespace-pre-wrap">"${s.text}"</p>
                        <div class="mt-3 text-right">
                            <button onclick="ui.deleteSuggestion('${s.id}')" class="text-mars-magenta font-bold hover:underline px-2">Eliminar Reporte</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-500 italic text-sm text-center py-8">La bandeja de sugerencias y bugs está vacía.</p>'}
                </div>
            </div>`;
        }
        if (el) el.innerHTML = adminHtml; // REGLA 3
    },

    modalAssignSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 4
        
        this._tempSponsorLogo = null; 
        
        const html = `
            <div class="space-y-4">
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nivel de Patrocinio</label>
                    <select id="sponsor-tier" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-yellow">
                        <option value="ORO|500">ORO (+500 €v)</option>
                        <option value="PLATA|400">PLATA (+400 €v)</option>
                        <option value="BRONCE|250">BRONCE (+250 €v)</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nombre de la Marca / Entidad</label>
                    <input type="text" id="sponsor-name" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white outline-none focus:border-mars-yellow" placeholder="Ej: SpaceX, NASA, Empresa Local...">
                </div>
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Logotipo del Patrocinador (Opcional)</label>
                    <input type="file" id="sponsor-logo-file" accept="image/png, image/jpeg" class="w-full text-[9px] text-slate-400 mb-2" onchange="ui.handleSponsorLogoUpload(event)">
                    <div id="sponsor-logo-preview" class="h-12 w-auto bg-black border border-slate-700 flex items-center justify-center text-[8px] text-slate-500 italic">Sin logo</div>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitSponsor('${cid}')" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Asignar Patrocinio</button>`;
        this.showModal(`Asignar Patrocinador a ${co.name}`, html, actions);
    },

    handleSponsorLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo PNG/JPG.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logo.");
        const reader = new FileReader();
        reader.onload = (ev) => {
            this._tempSponsorLogo = ev.target.result;
            const preview = document.getElementById('sponsor-logo-preview');
            if (preview) preview.innerHTML = `<img src="${ev.target.result}" class="h-full object-contain">`;
        };
        reader.readAsDataURL(file);
    },

    submitSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 1 y 4
        
        const elTier = document.getElementById('sponsor-tier');
        const elName = document.getElementById('sponsor-name');
        if (!elTier || !elName) return; // REGLA 3
        
        const [tier, amountStr] = elTier.value.split('|');
        const amount = parseFloat(amountStr);
        const name = elName.value.trim() || 'Anónimo';
        
        co.sponsorAwarded = tier;
        co.sponsorData = {
            name: name,
            logo: this._tempSponsorLogo
        };
        
        const concept = `Patrocinio ${tier} - ${name}`;
        state.addToLedger(cid, concept, 'DOCENTE', amount);
        
        this._tempSponsorLogo = null;
        this.closeModal();
        this.render();
    },

    modalVirtualSpend(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 1 y 4
        
        co.ledger = co.ledger || [];
        const expenses = co.ledger.filter(l => l.delta < 0);
        const total = expenses.reduce((s, l) => s + Math.abs(l.delta), 0);
        
        let html = `
        <div class="mb-4 bg-slate-900 p-4 border border-mars-cyan flex justify-between items-center">
            <span class="text-mars-cyan font-bold uppercase text-xs">Total Gasto Virtual Acumulado</span>
            <span class="text-mars-cyan font-mono text-xl font-black">${total.toFixed(2)} €v</span>
        </div>
        <div class="max-h-64 overflow-y-auto pr-2">
            <table class="w-full text-left text-[10px] whitespace-nowrap">
                <thead class="text-slate-500 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                    <tr><th class="py-2 pr-2">Fecha / ID</th><th class="pr-2">Concepto</th><th class="text-right">Importe (€v)</th></tr>
                </thead>
                <tbody>
                    ${expenses.map(l => `
                    <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                        <td class="py-2 pr-2 text-slate-400">${l.date.split(' ')[0]} <br><span class="text-[8px]">${l.id}</span></td>
                        <td class="py-2 pr-2 text-white whitespace-normal min-w-[200px]">${l.concept}</td>
                        <td class="py-2 text-right text-mars-magenta font-mono font-bold">${Math.abs(l.delta).toFixed(2)}</td>
                    </tr>
                    `).join('') || `<tr><td colspan="3" class="text-center py-4 text-slate-600 italic">No hay gastos registrados.</td></tr>`}
                </tbody>
            </table>
        </div>
        `;
        this.showModal(`Auditoría de Gasto Virtual: ${co.name}`, html, "");
    },

    saveCatalogPrice(id) {
        const elPrice = document.getElementById(`price-${id}`);
        if (!elPrice) return; // REGLA 3
        const newPrice = parseFloat(elPrice.value);
        if(isNaN(newPrice) || newPrice < 0) return alert("Precio inválido.");
        const item = state.data.catalog.find(i => i.id === id);
        if(item) {
            item.price = newPrice;
            state.save();
            alert(`Precio actualizado para ${item.name}`);
        }
    },

    addCatalogItem() {
        const elId = document.getElementById('new-cat-id');
        const elName = document.getElementById('new-cat-name');
        const elPrice = document.getElementById('new-cat-price');
        const elUnit = document.getElementById('new-cat-unit');
        const elCat = document.getElementById('new-cat-category');
        const elOrigin = document.getElementById('new-cat-origin');

        if (!elId || !elName || !elPrice || !elUnit || !elCat || !elOrigin) return; // REGLA 3

        const id = elId.value.trim();
        const name = elName.value.trim();
        const price = parseFloat(elPrice.value);
        const unit = elUnit.value.trim();
        const category = elCat.value;
        const origin = elOrigin.value.trim();

        if(!id || !name || isNaN(price) || !unit || !origin) return alert("Rellene todos los campos correctamente.");
        if(state.data.catalog.find(i => i.id === id)) return alert("El ID ya existe en el catálogo.");

        state.data.catalog.push({ id, name, price, unit, category, origin });
        state.save();
        alert("Artículo añadido al catálogo global.");
        this.render();
    },

    resolveInactivityReport(cid, rid) {
        const co = state.data.companies[cid];
        if (!co || !co.inactivityReports) return; // REGLA 1
        const rep = co.inactivityReports.find(r => r.id === rid);
        if (rep) {
            rep.status = 'RESUELTO';
            state.save();
            this.render();
        }
    },

    modalAEEFine(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 4
        
        const html = `
            <div class="space-y-4">
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Infracción Tipificada (AEE)</label>
                    <select id="aee-article" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="AEE Art. 12: Incumplimiento de cronograma y plazos oficiales">Art. 12: Incumplimiento Plazos</option>
                        <option value="AEE Art. 18: Inconsistencia o defecto en justificación técnica/química">Art. 18: Defecto Técnico</option>
                        <option value="AEE Art. 24: Anomalía en balance o trazabilidad contable">Art. 24: Anomalía Contable</option>
                        <option value="AEE Art. 31: Falta de rigor en protocolo de seguridad de vuelo">Art. 31: Brecha Seguridad Vuelo</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Dictamen del Inspector</label>
                    <textarea id="aee-reason" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white h-20 outline-none focus:border-mars-magenta" placeholder="Describa el motivo específico de la sanción..."></textarea>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Cuantía de la Multa</label>
                    <select id="aee-amount" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="-10">-10 €v (Leve)</option>
                        <option value="-100">-100 €v (Moderada)</option>
                        <option value="-200">-200 €v (Grave)</option>
                    </select>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitAEEFine('${cid}')" class="bg-red-800 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_10px_red]">Tramitar Expediente AEE</button>`;
        this.showModal(`EXPEDIENTE DISCIPLINARIO: ${co.name}`, html, actions);
    },

    submitAEEFine(cid) {
        const elArticle = document.getElementById('aee-article');
        const elReason = document.getElementById('aee-reason');
        const elAmount = document.getElementById('aee-amount');
        if (!elArticle || !elReason || !elAmount) return; // REGLA 3
        
        const article = elArticle.value;
        const reason = elReason.value;
        const amount = parseFloat(elAmount.value);
        if(!reason) return alert("El dictamen del inspector es obligatorio.");
        
        const concept = `[EXPEDIENTE AEE] ${article} - ${reason}`;
        state.addToLedger(cid, concept, 'DOCENTE_AEE', amount);
        this.closeModal();
        this.render();
    },

    // --- FASE 4: EMISIÓN DE NOTIFICACIONES I+D ---
    teacherValidate(pid, ok) {
        const reqIdx = state.data.pendingCustom.findIndex(p => p.id == pid);
        if (reqIdx === -1) return;
        
        const req = state.data.pendingCustom[reqIdx];
        const coId = req.company;
        
        if(ok) {
            const elPrice = document.getElementById(`val-price-${pid}`);
            if (!elPrice) return; // REGLA 3
            const price = parseFloat(elPrice.value);
            if(!price) return alert("Falta precio €v.");
            
            state.data.catalog.unshift({ 
                id: 'CUST-' + pid, 
                name: `[ESP] ${req.name}`, 
                price: price, 
                unit: 'Especial', 
                category: 'Externo',
                origin: 'I+D Local',
                exclusiveFor: coId
            });
            
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial "${req.name}" ha sido APROBADA e integrada al catálogo por ${price} €v.`, 'success');
        } else {
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial "${req.name}" ha sido DENEGADA por el Claustro.`, 'error');
        }
        
        state.data.pendingCustom.splice(reqIdx, 1); 
        state.save(); 
        this.render();
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
    },

    createStartup() {
        const elName = document.getElementById('new-co-name');
        const elCap = document.getElementById('new-co-cap');
        const elClass = document.getElementById('new-co-class');
        if (!elName || !elCap || !elClass) return; // REGLA 3
        
        const name = elName.value;
        const cap = parseFloat(elCap.value);
        const classGroup = elClass.value || 'A';
        
        if(!name || isNaN(cap)) return alert("Datos inválidos.");
        const cid = 'co_' + Date.now();
        state.data.companies[cid] = { 
            name, balance: cap, logo: null, sponsorAwarded: null, sponsorData: {name: null, logo: null}, valueProposition: "", slogan: "", classGroup,
            roles: { CEO:'1234', TECNICO:'1234', FINANZAS:'1234', MARKETING:'1234', OPERACIONES_IA:'1234' }, 
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [],
            loginStats: { totalLogins: 0, roles: { CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0} } },
            deliverables: { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null }
        };
        state.save(); this.render();
    },

    deleteStartup(cid) { 
        delete state.data.companies[cid]; 
        state.save(); 
        this.render(); 
    },

    updatePIN(coId, role, val) { 
        if(!state.user.role.startsWith('COORD')) return alert("Solo Coordinación puede modificar PINs.");
        if(val.length !== 4) return alert("4 dígitos."); 
        if (state.data.companies[coId] && state.data.companies[coId].roles) {
            state.data.companies[coId].roles[role] = val; 
            state.save(); 
        }
    },

    changeTeacherPIN() {
        const elPin = document.getElementById('new-teacher-pin');
        if (!elPin) return; // REGLA 3
        const np = elPin.value;
        if(np.length !== 4) return alert("4 dígitos.");
        if (state.data.config.teachers[state.user.role]) {
            state.data.config.teachers[state.user.role].pin = np; 
            state.save();
            alert("PIN Actualizado."); 
            elPin.value = '';
        }
    },

    showCompanyLogins(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const s = co.loginStats || { totalLogins: 0, roles: {} };
        
        let html = `
        <div class="space-y-4">
            <div class="bg-slate-900 p-4 border border-mars-cyan text-center">
                <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Conexiones</p>
                <p class="text-3xl font-orbitron text-mars-cyan">${s.totalLogins}</p>
            </div>
            <table class="w-full text-left text-xs whitespace-nowrap">
                <thead class="text-slate-500 uppercase border-b border-mars-border">
                    <tr><th class="py-2">Rol</th><th class="text-right">Logins</th></tr>
                </thead>
                <tbody>
                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(r => `
                    <tr class="border-b border-mars-border/30">
                        <td class="py-2 font-bold text-white">${r}</td>
                        <td class="py-2 text-right font-mono text-mars-yellow">${s.roles[r]?.count || 0}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
        
        this.showModal(`Auditoría de Conexiones: ${co.name}`, html, "");
    },

    saveSettings() {
        const dl = state.data.config.deadlines;
        const gl = state.data.config.guidelines;
        
        const elPres1 = document.getElementById('dl-pres1');
        if(elPres1) dl.presPhase1 = elPres1.value;
        
        const elVp = document.getElementById('dl-vp');
        if(elVp) dl.valuePropDoc = elVp.value;
        
        const elTech = document.getElementById('dl-tech');
        if(elTech) dl.techReport = elTech.value;
        
        const elFin = document.getElementById('dl-fin');
        if(elFin) dl.financeBook = elFin.value;
        
        const elPres3 = document.getElementById('dl-pres3');
        if(elPres3) dl.presPhase3 = elPres3.value;
        
        const elGlUrl = document.getElementById('gl-url');
        if(elGlUrl) gl.techReportDocUrl = elGlUrl.value;
        
        const elGlNotes = document.getElementById('gl-notes');
        if(elGlNotes) gl.techReportNotes = elGlNotes.value;
        
        state.save();
        alert("Configuración guardada con éxito.");
        this.render();
    },
    
    deleteSuggestion(id) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(s => s.id !== id);
        state.save();
        this.render();
    },

    exportCSV() {
        let csv = "Empresa,Fecha,Concepto,Departamento,Variacion_Virtual,Saldo_Final_Virtual\n";
        for (const coId in state.data.companies) {
            const co = state.data.companies[coId];
            if (co && co.ledger) {
                co.ledger.forEach(l => { 
                    csv += `"${co.name}","${l.date}","${l.concept}","${l.dept}",${l.delta},${l.final}\n`; 
                });
            }
        }
        this.downloadFile(csv, 'csv', 'marsket_ledger_export.csv');
    },

    exportJSON() { 
        this.downloadFile(JSON.stringify(state.data, null, 2), 'json', `marsket_backup_${new Date().getTime()}.json`); 
    },

    downloadFile(content, ext, filename) {
        const blob = new Blob([content], { type: ext === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = filename; 
        a.click();
    },

    importJSON(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { 
            try { 
                state.data = state.migrate(JSON.parse(ev.target.result)); 
                state.save(); 
                location.reload(); 
            } catch(err) { 
                alert("JSON inválido."); 
            } 
        };
        reader.readAsText(file);
    }
});