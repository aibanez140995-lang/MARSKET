// js/ui-empresa-tech.js
// --- MÓDULO I+D: FASE I (TEORÍA), FASE II (PRÁCTICA) Y MATEMÁTICAS ---

Object.assign(ui, {
    techTab: 'fase1',

    showTechTab(tab) {
        this.techTab = tab;
        this.render();
    },

    viewTech(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        const docs = co.deliverables || {};
        co.fase1Registro = co.fase1Registro || { presupuestoTeorico: '', alturaEstimada: '', justificacionV2: '' };
        co.bom = co.bom || [];
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        
        const wrapper = document.createElement('div');
        
        // Navegación de Sub-Pestañas
        let tabsHtml = `
        <div class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showTechTab('fase1')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='fase1'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Fase I: Diseño Teórico</button>
            <button onclick="ui.showTechTab('fase2')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='fase2'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Fase II: Pruebas y V2.0</button>
            <button onclick="ui.showTechTab('math')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='math'?'bg-mars-yellow text-black':'text-slate-400 hover:text-white'} transition-colors">Matemáticas (Trigonometría)</button>
        </div>`;

        let contentHtml = '';

        if (this.techTab === 'fase1') {
            contentHtml = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Hoja de Registro Preliminar</h2>
                    <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Define la hipótesis científica de tu cohete antes de realizar ninguna compra o lanzamiento real.</p>
                    
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Presupuesto Teórico Estimado (€v)</label>
                            <input type="number" id="fase1-presupuesto" value="${co.fase1Registro.presupuestoTeorico}" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white outline-none focus:border-mars-cyan" placeholder="Ej: 350.50">
                        </div>
                        <div>
                            <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Altura Estimada (Metros)</label>
                            <input type="number" id="fase1-altura" value="${co.fase1Registro.alturaEstimada}" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white outline-none focus:border-mars-cyan" placeholder="Ej: 15.5">
                        </div>
                        <button onclick="ui.saveFase1Registro()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow mt-2">Guardar Hipótesis</button>
                    </div>
                    
                    <div class="border-t border-mars-border/50 pt-6 mt-2">
                        ${this.renderHybridUploadBox('Informe Preliminar (FYQ)', 'Documento inicial con la hipótesis, presupuesto y diseño teórico.', 'informePreliminar', docs.informePreliminar)}
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                    <h2 class="font-orbitron text-mars-magenta text-lg mb-4 uppercase tracking-tighter">Evidencias Visuales (Pre-Vuelo)</h2>
                    <div class="space-y-6">
                        ${this.renderHybridUploadBox('Boceto / Diseño Conceptual', 'Sube el plano o esquema de tu cohete.', 'boceto', docs.boceto)}
                        ${this.renderHybridUploadBox('Foto Prototipo Físico (Sin Combustible)', 'Sube una foto real del cohete montado antes de la prueba.', 'fotoPrototipo', docs.fotoPrototipo)}
                    </div>
                </div>
            </div>`;
        } 
        else if (this.techTab === 'fase2') {
            let ftHtml = co.flightTests.map(f => `
                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                    <td class="py-2 text-slate-400">${f.date}</td>
                    <td class="py-2 font-bold text-white">${f.bottle}</td>
                    <td class="py-2 text-mars-cyan">${f.naHCO3}g / ${f.vinegar}ml</td>
                    <td class="py-2 font-mono text-mars-magenta">${f.costEurV.toFixed(2)}</td>
                    <td class="py-2 font-mono text-mars-green font-bold text-base">${f.heightM.toFixed(1)}</td>
                    <td class="py-2 font-orbitron text-mars-yellow font-black">${f.efficiency.toFixed(3)}</td>
                </tr>
            `).join('') || `<tr><td colspan="6" class="text-center py-4 text-slate-600 italic text-xs">No hay ensayos registrados.</td></tr>`;

            let executedItems = [];
            co.orders.filter(o => o.status === 'EJECUTADO').forEach(o => {
                o.items.forEach(item => { executedItems.push({ ...item, orderId: o.id }); });
            });

            let bomTotal = 0;
            let bomHtml = '';
            if (executedItems.length === 0) {
                bomHtml = `<p class="text-slate-500 italic text-xs">No hay componentes adquiridos y ejecutados para configurar el BOM.</p>`;
            } else {
                bomHtml = executedItems.map((item, idx) => {
                    const isChecked = co.bom.includes(`${item.orderId}-${idx}`);
                    if (isChecked) bomTotal += item.price;
                    return `
                    <div class="flex justify-between items-center bg-slate-900 p-2 border border-mars-border text-[10px] mb-1">
                        <label class="flex items-center gap-2 text-white cursor-pointer flex-grow">
                            <input type="checkbox" class="form-checkbox bg-black border-mars-cyan" ${isChecked ? 'checked' : ''} onchange="ui.toggleBomItem('${item.orderId}-${idx}', this.checked)">
                            ${item.name} (x${item.qty})
                        </label>
                        <span class="text-mars-green font-mono">${item.price.toFixed(2)} €v</span>
                    </div>`;
                }).join('');
            }

            const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + o.total, 0);
            
            // Lógica de Comparativa (Teoría vs Práctica)
            const presTeorico = parseFloat(co.fase1Registro.presupuestoTeorico) || 0;
            const altTeorica = parseFloat(co.fase1Registro.alturaEstimada) || 0;
            const bestFlight = co.flightTests.length > 0 ? [...co.flightTests].sort((a, b) => b.heightM - a.heightM)[0] : null;
            const altReal = bestFlight ? bestFlight.heightM : 0;
            
            const isCostDeviation = totalDevCost > presTeorico && presTeorico > 0;
            const isHeightDeviation = altReal < altTeorica && altTeorica > 0 && altReal > 0;
            const needsV2 = isCostDeviation || isHeightDeviation;

            contentHtml = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-6">
                    <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                        <h2 class="font-orbitron text-mars-magenta text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Configurador de Prototipo (BOM)</h2>
                        <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Selecciona los componentes del histórico de compras que forman parte del cohete definitivo.</p>
                        <div class="flex justify-between items-center mb-4 bg-black p-3 border border-mars-border">
                            <div class="text-center">
                                <p class="text-[8px] text-slate-500 uppercase font-bold">Coste Desarrollo</p>
                                <p class="text-mars-cyan font-mono font-bold">${totalDevCost.toFixed(2)} €v</p>
                            </div>
                            <div class="text-center">
                                <p class="text-[8px] text-slate-500 uppercase font-bold">Coste Prototipo (BOM)</p>
                                <p class="text-mars-green font-mono font-bold text-lg">${bomTotal.toFixed(2)} €v</p>
                            </div>
                        </div>
                        <div class="max-h-48 overflow-y-auto pr-2">
                            ${bomHtml}
                        </div>
                    </div>

                    <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                        <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Informe Técnico Final</h2>
                        ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                        ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                        ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
                    </div>
                </div>
                
                <div class="lg:col-span-2 space-y-6">
                    <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                        <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Banco de Pruebas de Vuelo</h2>
                        <div class="bg-black border border-mars-border p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-[10px]">
                            <input type="text" id="ft-bottle" placeholder="Botella usada (Ej: 1.5L Lisa)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-yellow w-full">
                            <input type="number" id="ft-nahco3" placeholder="NaHCO3 (g)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan w-full" step="0.1">
                            <input type="number" id="ft-vinegar" placeholder="Vinagre (ml)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan w-full" step="1">
                            <input type="number" id="ft-cost" placeholder="Coste Ensayo (€v)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-magenta w-full" step="0.1">
                            <input type="number" id="ft-height" placeholder="Altura H (metros)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-green font-bold w-full" step="0.1">
                            <button onclick="ui.submitFlightTest()" class="bg-mars-yellow text-black font-black uppercase tracking-widest hover:shadow-[0_0_10px_#ffe600] transition-all py-2 w-full">Registrar Vuelo</button>
                        </div>
                        <div class="overflow-x-auto w-full">
                            <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                                <thead class="text-slate-500 uppercase border-b border-mars-border">
                                    <tr><th class="py-2">Fecha</th><th>Fuselaje</th><th>Mix (Sól/Líq)</th><th>Coste (€v)</th><th>H (m)</th><th class="text-mars-yellow">E = H/C</th></tr>
                                </thead>
                                <tbody>${ftHtml}</tbody>
                            </table>
                        </div>
                    </div>

                    <div class="terminal-border bg-mars-card p-6 border-t-4 ${needsV2 ? 'border-t-mars-magenta' : 'border-t-mars-green'}">
                        <h2 class="font-orbitron ${needsV2 ? 'text-mars-magenta' : 'text-mars-green'} text-lg mb-4 uppercase tracking-tighter">Auditoría: Teoría vs Práctica</h2>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="bg-black p-3 border ${isCostDeviation ? 'border-mars-magenta' : 'border-mars-border'}">
                                <p class="text-[9px] text-slate-500 uppercase font-bold mb-1">Presupuesto: Teórico vs Real</p>
                                <p class="text-sm font-mono ${isCostDeviation ? 'text-mars-magenta' : 'text-white'}">${presTeorico.toFixed(2)} €v <span class="text-slate-500">vs</span> ${totalDevCost.toFixed(2)} €v</p>
                            </div>
                            <div class="bg-black p-3 border ${isHeightDeviation ? 'border-mars-magenta' : 'border-mars-border'}">
                                <p class="text-[9px] text-slate-500 uppercase font-bold mb-1">Altura: Estimada vs Real</p>
                                <p class="text-sm font-mono ${isHeightDeviation ? 'text-mars-magenta' : 'text-white'}">${altTeorica.toFixed(1)} m <span class="text-slate-500">vs</span> ${altReal.toFixed(1)} m</p>
                            </div>
                        </div>
                        
                        <div class="bg-slate-900 p-4 border ${needsV2 ? 'border-mars-magenta' : 'border-mars-border'}">
                            <p class="text-[10px] ${needsV2 ? 'text-mars-magenta font-bold' : 'text-mars-cyan'} uppercase mb-2">
                                ${needsV2 ? '⚠️ DESVIACIÓN DETECTADA: Justificación de Nuevo Diseño (V2.0) Obligatoria.' : 'Análisis de Resultados y Mejoras (Opcional)'}
                            </p>
                            <textarea id="fase2-justificacion" class="w-full bg-black border ${needsV2 ? 'border-mars-magenta' : 'border-mars-border'} p-3 text-xs text-white h-24 outline-none focus:border-mars-cyan mb-3" placeholder="Explica por qué los datos reales no coinciden con la hipótesis y qué cambios de diseño o presupuesto se van a aplicar...">${co.fase1Registro.justificacionV2 || ''}</textarea>
                            <button onclick="ui.saveJustificacionV2()" class="${needsV2 ? 'bg-mars-magenta text-white' : 'bg-mars-cyan text-black'} font-black py-2 px-6 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity">Guardar Análisis V2.0</button>
                        </div>
                    </div>
                </div>
            </div>`;
        }
        else if (this.techTab === 'math') {
            contentHtml = `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Laboratorio de Matemáticas (Trigonometría)</h2>
                <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Sube aquí las evidencias de la fabricación del goniómetro y los informes de cálculo de altura mediante trigonometría.</p>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    ${this.renderHybridUploadBox('1. Fabricación del Goniómetro', 'Evidencia de la construcción del instrumento de medición.', 'mathGoniometro', docs.mathGoniometro)}
                    ${this.renderHybridUploadBox('2. Informe Medición Simple', 'Datos empíricos con distancia conocida desde la base.', 'mathMedicion1', docs.mathMedicion1)}
                    ${this.renderHybridUploadBox('3. Informe Doble Medición', 'Datos empíricos con dos mediciones a distancia de separación conocida.', 'mathMedicion2', docs.mathMedicion2)}
                    ${this.renderHybridUploadBox('4. Informe Comparativo Final', 'Comparación de resultados y análisis de coherencia.', 'mathComparativa', docs.mathComparativa)}
                </div>
            </div>`;
        }

        wrapper.innerHTML = tabsHtml + contentHtml;
        el.appendChild(wrapper);
    },

    saveFase1Registro() {
        if (!state.user) return;
        const elPres = document.getElementById('fase1-presupuesto');
        const elAlt = document.getElementById('fase1-altura');
        if (!elPres || !elAlt) return; // REGLA 3
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.fase1Registro.presupuestoTeorico = elPres.value;
        co.fase1Registro.alturaEstimada = elAlt.value;
        
        state.save();
        alert("Hipótesis de la Fase I guardada correctamente.");
        this.render();
    },

    saveJustificacionV2() {
        if (!state.user) return;
        const elJust = document.getElementById('fase2-justificacion');
        if (!elJust) return; // REGLA 3
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.fase1Registro.justificacionV2 = elJust.value;
        
        state.save();
        alert("Análisis y justificación V2.0 guardados.");
        this.render();
    },

    toggleBomItem(itemKey, isChecked) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.bom = co.bom || [];
        
        if (isChecked) {
            if (!co.bom.includes(itemKey)) co.bom.push(itemKey);
        } else {
            co.bom = co.bom.filter(k => k !== itemKey);
        }
        state.save();
        this.render();
    },

    submitFlightTest() {
        if (!state.user) return;
        const elBottle = document.getElementById('ft-bottle');
        const elNahco3 = document.getElementById('ft-nahco3');
        const elVinegar = document.getElementById('ft-vinegar');
        const elCost = document.getElementById('ft-cost');
        const elHeight = document.getElementById('ft-height');
        
        if (!elBottle || !elNahco3 || !elVinegar || !elCost || !elHeight) return; 

        const bottle = elBottle.value;
        const naHCO3 = parseFloat(elNahco3.value);
        const vinegar = parseFloat(elVinegar.value);
        const costEurV = parseFloat(elCost.value);
        const heightM = parseFloat(elHeight.value);

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightM)) return alert("Rellene todos los datos numéricos del ensayo.");
        if(costEurV <= 0) return alert("El coste no puede ser cero.");

        const efficiency = heightM / costEurV;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.flightTests = co.flightTests || [];
        co.flightTests.unshift({ id: 'FLT-'+Date.now(), date: new Date().toLocaleDateString(), bottle, naHCO3, vinegar, costEurV, heightM, efficiency });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightM}m, E=${efficiency.toFixed(3)}`);
        state.save();
        this.render();
    },

    modalCustom() {
        if (!state.user) return;
        const html = `
            <input type="text" id="custom-name" placeholder="Nombre del componente..." class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
            <textarea id="custom-reason" placeholder="Justificación técnica..." class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-cyan"></textarea>
        `;
        const actions = `<button onclick="ui.submitCustom()" class="bg-mars-magenta text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Enviar a Claustro</button>`;
        this.showModal("Solicitar I+D Especial", html, actions);
    },

    submitCustom() {
        if (!state.user) return;
        const elName = document.getElementById('custom-name');
        const elReason = document.getElementById('custom-reason');
        if (!elName || !elReason) return; 
        
        const name = elName.value;
        const reason = elReason.value;
        if(!name || !reason) return alert("Rellene todos los campos.");
        
        state.data.pendingCustom = state.data.pendingCustom || [];
        state.data.pendingCustom.push({ id: Date.now(), company: state.user.coId, name, reason });
        state.save();
        this.closeModal();
        alert("Solicitud enviada al claustro para su valoración.");
    }
});