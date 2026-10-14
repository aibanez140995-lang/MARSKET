// js/ui-empresa-tech.js
// --- MÓDULO I+D: FASE I, FASE II, MATEMÁTICAS E INVENTARIO B2B ---

Object.assign(ui, {
    techTab: 'fase1',

    showTechTab(tab) {
        this.techTab = tab;
        this.render();
    },

    // Helper M-07: Calcula el gasto total de Desarrollo e Investigación (Órdenes + Compras B2B)
    getTotalDevSpend(co, coId) {
        const ordersSpend = (co.orders || [])
            .filter(o => o.status === 'EJECUTADO')
            .reduce((sum, o) => sum + o.total, 0);
        const b2bSpend = (state.data.b2bContracts || [])
            .filter(c => c.buyerCoId === coId && c.status === 'APROBADO')
            .reduce((sum, c) => sum + c.price, 0);
        return ordersSpend + b2bSpend;
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
        co.inventory = co.inventory || [];
        
        const wrapper = document.createElement('div');
        
        // Navegación de Sub-Pestañas
        let tabsHtml = `
        <div class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showTechTab('fase1')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='fase1'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Fase I: Diseño Teórico</button>
            <button onclick="ui.showTechTab('fase2')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='fase2'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Fase II: Pruebas y V2.0</button>
            <button onclick="ui.showTechTab('math')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='math'?'bg-mars-yellow text-black':'text-slate-400 hover:text-white'} transition-colors">Matemáticas</button>
            <button onclick="ui.showTechTab('inventory')" class="px-4 py-2 text-[10px] font-bold uppercase ${this.techTab==='inventory'?'bg-mars-green text-black':'text-slate-400 hover:text-white'} transition-colors shadow-[0_0_10px_rgba(0,255,102,0.2)]">Inventario y B2B</button>
        </div>`;

        let contentHtml = '';

        if (this.techTab === 'fase1') {
            contentHtml = `
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Hoja de Registro Preliminar</h2>
                    <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Define el presupuesto de desarrollo e investigación (I+D) y la hipótesis de altura de tu cohete antes de realizar compras o lanzamientos.</p>
                    
                    <div class="space-y-4 mb-6">
                        <div>
                            <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Presupuesto de Desarrollo Teórico Estimado (€v)</label>
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

            // M-07: Configurador BOM alimentado desde el Inventario Físico disponible (incluye B2B y mantiene valor de licencia en garantías)
            const availableInventory = co.inventory.filter(i => i.status === 'AVAILABLE');
            let bomTotal = 0;
            let bomHtml = '';

            if (availableInventory.length === 0) {
                bomHtml = `<p class="text-slate-500 italic text-xs">No hay componentes activos en el inventario físico. Ejecuta compras en Logística o adquiere piezas en B2B.</p>`;
            } else {
                bomHtml = availableInventory.map(item => {
                    const isChecked = co.bom.includes(item.id);
                    const unitCost = typeof item.originalPrice === 'number' ? item.originalPrice : 0;
                    if (isChecked) bomTotal += unitCost;
                    return `
                    <div class="flex justify-between items-center bg-slate-900 p-2 border border-mars-border text-[10px] mb-1">
                        <label class="flex items-center gap-2 text-white cursor-pointer flex-grow pr-2">
                            <input type="checkbox" class="form-checkbox bg-black border-mars-cyan" ${isChecked ? 'checked' : ''} onchange="ui.toggleBomItem('${item.id}', this.checked)">
                            <span>${item.name}</span>
                        </label>
                        <span class="text-mars-green font-mono shrink-0">${unitCost.toFixed(2)} €v</span>
                    </div>`;
                }).join('');
            }

            const totalDevCost = this.getTotalDevSpend(co, state.user.coId);
            
            const presTeorico = parseFloat(co.fase1Registro.presupuestoTeorico) || 0;
            const altTeorica = parseFloat(co.fase1Registro.alturaEstimada) || 0;
            const bestFlight = co.flightTests.length > 0 ? [...co.flightTests].sort((a, b) => b.heightM - a.heightM)[0] : null;
            const altReal = bestFlight ? bestFlight.heightM : 0;
            
            const isCostDeviation = totalDevCost > presTeorico && presTeorico > 0;
            const isHeightDeviation = altReal < altTeorica && altTeorica > 0 && altReal > 0;
            const needsV2 = isCostDeviation || isHeightDeviation;
            const justStatus = co.fase1Registro.justificacionV2Status || 'PENDIENTE';

            contentHtml = `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1 space-y-6">
                    <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                        <h2 class="font-orbitron text-mars-magenta text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Configurador de Prototipo (BOM Ventas)</h2>
                        <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Selecciona las piezas de tu inventario que integran el cohete final para calcular el coste unitario de fabricación (base comercial de venta).</p>
                        <div class="flex justify-between items-center mb-4 bg-black p-3 border border-mars-border">
                            <div class="text-center">
                                <p class="text-[8px] text-slate-500 uppercase font-bold">Gasto Desarrollo (I+D)</p>
                                <p class="text-mars-cyan font-mono font-bold">${totalDevCost.toFixed(2)} €v</p>
                            </div>
                            <div class="text-center">
                                <p class="text-[8px] text-slate-500 uppercase font-bold">Coste Prototipo (Ventas)</p>
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
                        <h2 class="font-orbitron ${needsV2 ? 'text-mars-magenta' : 'text-mars-green'} text-lg mb-4 uppercase tracking-tighter">Auditoría: Hipótesis vs Desarrollo Real</h2>
                        <div class="grid grid-cols-2 gap-4 mb-4">
                            <div class="bg-black p-3 border ${isCostDeviation ? 'border-mars-magenta' : 'border-mars-border'}">
                                <p class="text-[9px] text-slate-500 uppercase font-bold mb-1">Presupuesto I+D: Teórico vs Ejecutado</p>
                                <p class="text-sm font-mono ${isCostDeviation ? 'text-mars-magenta' : 'text-white'}">${presTeorico.toFixed(2)} €v <span class="text-slate-500">vs</span> ${totalDevCost.toFixed(2)} €v</p>
                            </div>
                            <div class="bg-black p-3 border ${isHeightDeviation ? 'border-mars-magenta' : 'border-mars-border'}">
                                <p class="text-[9px] text-slate-500 uppercase font-bold mb-1">Altura: Estimada vs Mejor Vuelo</p>
                                <p class="text-sm font-mono ${isHeightDeviation ? 'text-mars-magenta' : 'text-white'}">${altTeorica.toFixed(1)} m <span class="text-slate-500">vs</span> ${altReal.toFixed(1)} m</p>
                            </div>
                        </div>
                        
                        <div class="bg-slate-900 p-4 border ${needsV2 ? 'border-mars-magenta' : 'border-mars-border'}">
                            <div class="flex justify-between items-center mb-2">
                                <p class="text-[10px] ${needsV2 ? 'text-mars-magenta font-bold' : 'text-mars-cyan'} uppercase">
                                    ${needsV2 ? '⚠️ DESVIACIÓN DETECTADA: Justificación de Nuevo Diseño (V2.0) Obligatoria.' : 'Análisis de Resultados y Mejoras (Opcional)'}
                                </p>
                                ${co.fase1Registro.justificacionV2 ? `<span class="text-[9px] font-bold uppercase px-2 py-0.5 border ${justStatus==='APROBADA'?'border-mars-green text-mars-green':justStatus==='DENEGADA'?'border-mars-magenta text-mars-magenta':'border-mars-yellow text-mars-yellow'}">${justStatus}</span>` : ''}
                            </div>
                            ${justStatus === 'DENEGADA' && co.fase1Registro.justificacionV2DenyReason ? `<div class="bg-red-900/30 border border-red-500/50 p-2 text-[9px] text-red-200 mb-3"><span class="font-bold">RECHAZADO POR FINANZAS:</span> ${co.fase1Registro.justificacionV2DenyReason}</div>` : ''}
                            <textarea id="fase2-justificacion" class="w-full bg-black border ${needsV2 ? 'border-mars-magenta' : 'border-mars-border'} p-3 text-xs text-white h-24 outline-none focus:border-mars-cyan mb-3" placeholder="Explica por qué los datos reales no coinciden con la hipótesis y qué cambios de diseño o presupuesto se van a aplicar...">${co.fase1Registro.justificacionV2 || ''}</textarea>
                            <button onclick="ui.saveJustificacionV2()" class="${needsV2 ? 'bg-mars-magenta text-white' : 'bg-mars-cyan text-black'} font-black py-2 px-6 text-[10px] uppercase tracking-widest hover:opacity-80 transition-opacity">Guardar y Enviar Análisis V2.0</button>
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
        else if (this.techTab === 'inventory') {
            // Filtrar elementos siniestrados/reemplazados para mostrar primero los operativos
            const visibleInventory = co.inventory.filter(i => i.status !== 'REPLACED');

            let invHtml = visibleInventory.map(item => {
                let actions = '';
                let borderClass = 'border-mars-border';

                if (item.status === 'AVAILABLE') {
                    // M-04: Las licencias permiten reposición ilimitada si se rompe; además impedimos vender en B2B reemplazos gratuitos para evitar granjas de dinero
                    const canSellB2B = !item.isWarrantyReplacement;
                    actions = `
                    <div class="flex gap-2 mt-3">
                        ${canSellB2B 
                            ? `<button onclick="ui.modalSellItem('${item.id}')" class="flex-1 bg-mars-cyan/20 border border-mars-cyan text-mars-cyan py-1.5 text-[9px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-colors">Vender B2B</button>`
                            : `<span class="flex-1 text-center text-[8px] text-slate-500 border border-slate-800 py-1.5 uppercase" title="Pieza reemplazada bajo licencia: no transferible a terceros">Licencia Intransferible</span>`
                        }
                        <button onclick="ui.requestWarranty('${item.id}')" class="flex-1 bg-mars-yellow/20 border border-mars-yellow text-mars-yellow py-1.5 text-[9px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors">Reemplazo (Rotura)</button>
                    </div>`;
                } else if (item.status === 'ON_SALE') {
                    borderClass = 'border-mars-magenta';
                    actions = `
                    <div class="mt-3 bg-mars-magenta/10 border border-mars-magenta p-2 text-center">
                        <p class="text-[9px] text-mars-magenta font-bold uppercase mb-2">En venta por ${item.salePrice} €v</p>
                        <button onclick="ui.cancelSellItem('${item.id}')" class="w-full bg-mars-magenta text-white py-1 text-[9px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Cancelar Venta</button>
                    </div>`;
                } else if (item.status === 'PENDING_TRANSFER') {
                    // M-05: Estado visual claro mientras espera la firma del docente en Aduana B2B
                    borderClass = 'border-mars-cyan';
                    actions = `
                    <div class="mt-3 bg-mars-cyan/10 border border-mars-cyan p-2 text-center animate-pulse">
                        <p class="text-[9px] text-mars-cyan font-bold uppercase">En Aduana Docente (Reservado)</p>
                        <p class="text-[8px] text-slate-400 uppercase mt-0.5">Pendiente de firma de traspaso</p>
                    </div>`;
                } else if (item.status === 'SOLD') {
                    actions = `<div class="mt-3 text-center border border-slate-700 py-1.5"><span class="text-[9px] text-slate-500 font-bold uppercase">Vendido / Traspasado</span></div>`;
                }

                const unitCost = typeof item.originalPrice === 'number' ? item.originalPrice : 0;

                return `
                <div class="bg-black border ${borderClass} p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2">
                            <span class="text-[8px] text-slate-500 uppercase font-bold tracking-widest">${item.category}</span>
                            <span class="text-[8px] text-slate-600">${item.id}</span>
                        </div>
                        <h3 class="font-orbitron text-white text-[11px] mb-1 leading-tight uppercase">${item.name}</h3>
                        <div class="flex justify-between text-[8px] text-slate-400 uppercase mt-1">
                            <span>Adq: ${item.purchaseDate}</span>
                            <span class="text-mars-green font-mono">Valor: ${unitCost.toFixed(2)} €v</span>
                        </div>
                    </div>
                    ${actions}
                </div>`;
            }).join('') || '<p class="text-slate-500 italic text-xs col-span-full">El inventario físico está vacío. Ejecuta compras en Logística.</p>';

            const activeCount = co.inventory.filter(i => i.status === 'AVAILABLE').length;

            contentHtml = `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="font-orbitron text-mars-green text-lg uppercase tracking-tighter">Inventario Corporativo Físico</h2>
                    <span class="bg-mars-green/10 text-mars-green border border-mars-green px-3 py-1 font-bold text-[10px]">${activeCount} Disponibles</span>
                </div>
                <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Gestiona los componentes físicos de tu empresa. La compra de un componente otorga licencia de reemplazo gratuito en caso de rotura (vía Logística) o permite su venta de segunda mano en el Mercado B2B si no ha sufrido siniestro.</p>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    ${invHtml}
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

    // M-06: Desbloqueo de reenvío a Finanzas tras corrección de Justificación V2.0
    saveJustificacionV2() {
        if (!state.user) return;
        const elJust = document.getElementById('fase2-justificacion');
        if (!elJust) return; // REGLA 3
        
        const text = elJust.value.trim();
        if (!text) return alert("Debes redactar el análisis o justificación antes de guardar.");

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.fase1Registro.justificacionV2 = text;
        co.fase1Registro.justificacionV2Status = 'PENDIENTE';
        co.fase1Registro.justificacionV2DenyReason = null;
        
        telemetry.log("I+D V2.0", "Justificación de desviación V2.0 enviada a auditoría de Finanzas.");
        ui.pushNotification(state.user.coId, 'FINANZAS', 'El Dpto. Técnico ha enviado/actualizado la justificación de desviación V2.0 para su auditoría.', 'warning');
        
        state.save();
        alert("Análisis y justificación V2.0 enviados a Finanzas para su validación.");
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
    },

    modalSellItem(invId) {
        if (!state.user) return;
        const html = `
            <p class="text-[10px] text-slate-400 mb-4">Fija el precio de venta para este componente. Aparecerá en el SUPERMARS-KET de las demás startups.</p>
            <input type="number" id="b2b-price" placeholder="Precio de venta (€v)..." class="w-full bg-black border border-mars-cyan p-3 text-xs text-white outline-none focus:border-mars-cyan mb-2" min="1">
        `;
        const actions = `<button onclick="ui.confirmSellItem('${invId}')" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Publicar en Mercado B2B</button>`;
        this.showModal("Vender Componente", html, actions);
    },

    confirmSellItem(invId) {
        if (!state.user) return;
        const elPrice = document.getElementById('b2b-price');
        if (!elPrice) return; // REGLA 3
        
        const price = parseFloat(elPrice.value);
        if (isNaN(price) || price <= 0) return alert("Introduce un precio válido mayor que 0.");

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const item = co.inventory.find(i => i.id === invId);
        if (!item || item.status !== 'AVAILABLE' || item.isWarrantyReplacement) return alert("El objeto no está disponible para la venta en B2B.");

        item.status = 'ON_SALE';
        item.salePrice = price;

        // Si estaba marcado en el BOM del prototipo, lo desmarcamos al ponerlo en venta
        if (co.bom) co.bom = co.bom.filter(k => k !== invId);

        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bMarket.unshift({
            marketId: 'MKTB2B-' + Date.now(),
            invId: item.id,
            sellerCoId: state.user.coId,
            sellerName: co.name,
            itemName: item.name,
            category: item.category,
            originalPrice: item.originalPrice,
            price: price,
            date: new Date().toLocaleDateString()
        });

        telemetry.log("MERCADO B2B", `Puesto a la venta: ${item.name} por ${price}€v`);
        state.save();
        this.closeModal();
        this.render();
    },

    cancelSellItem(invId) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const item = co.inventory.find(i => i.id === invId);
        if (!item || item.status !== 'ON_SALE') return;

        item.status = 'AVAILABLE';
        item.salePrice = null;

        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bMarket = state.data.b2bMarket.filter(m => m.invId !== invId);

        telemetry.log("MERCADO B2B", `Venta cancelada: ${item.name}`);
        state.save();
        this.render();
    },

    // M-04: Garantía ilimitada por licencia de uso (retira la pieza rota para impedir su venta B2B y mantiene originalPrice)
    requestWarranty(invId) {
        if (!state.user) return;
        if (!confirm("¿Solicitar reemplazo gratuito por rotura bajo tu licencia de uso? La pieza dañada se retirará del inventario activo y se enviará una orden de reposición a coste 0€v a Logística.")) return;

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const item = co.inventory.find(i => i.id === invId);
        if (!item || item.status !== 'AVAILABLE') return alert("Esta pieza no está disponible en el inventario activo.");

        // Retirar pieza rota del inventario activo y del BOM para que no se duplique ni se venda en B2B
        item.status = 'REPLACED';
        if (co.bom) co.bom = co.bom.filter(k => k !== invId);

        const cleanName = item.name.replace(/^\[GARANTÍA\]\s*/i, '');

        co.orders = co.orders || [];
        const newOrder = { 
            id: state.data.config.nextOrderId++, 
            items: [{
                name: `[GARANTÍA] ${cleanName}`, 
                qty: 1, 
                price: 0, 
                originalPrice: item.originalPrice || 0, // Mantiene el valor de licencia para el BOM
                isWarrantyReplacement: true,
                category: item.category, 
                realEur: 0, 
                realShop: 'GARANTÍA'
            }], 
            total: 0, 
            justification: `Reemplazo por rotura bajo licencia de uso (Pieza siniestrada ID: ${item.id})`, 
            status: 'APROBADO_FINANZAS', // Salta finanzas porque el reemplazo virtual es gratuito (0 €v)
            date: new Date().toLocaleString() 
        };
        
        co.orders.unshift(newOrder);
        
        telemetry.log("GARANTÍA", `Reemplazo solicitado bajo licencia para: ${cleanName}`);
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nueva solicitud de reemplazo por garantía pendiente de validación física en Logística.`, 'warning');
        
        state.save();
        this.render();
        alert("Pieza dañada dada de baja. Orden de reemplazo a 0€v enviada a Logística.");
    }
});