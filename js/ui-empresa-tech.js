// js/ui-empresa-tech.js
// --- MÓDULO I+D: BANCO DE PRUEBAS, BOM, MATEMÁTICAS E INVENTARIO B2B ---

Object.assign(ui, {
    setTechDocTab(tab) {
        this.techDocTab = tab;
        this.render();
    },

    viewTech(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.bom = co.bom || [];
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        
        const activeDocTab = this.techDocTab || 'FYQ';
        const wrapper = document.createElement('div');
        
        let ftHtml = co.flightTests.map(f => `
            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-2 text-slate-400 pr-2">${f.date}</td>
                <td class="py-2 font-bold text-white pr-2">${f.bottle}</td>
                <td class="py-2 text-mars-cyan pr-2">${f.naHCO3}g / ${f.vinegar}ml</td>
                <td class="py-2 font-mono text-mars-magenta pr-2">${Number(f.costEurV).toFixed(2)}</td>
                <td class="py-2 font-mono text-mars-green font-bold text-base pr-2">${Number(f.heightM).toFixed(1)}</td>
                <td class="py-2 font-orbitron text-mars-yellow font-black">${Number(f.efficiency).toFixed(3)}</td>
            </tr>
        `).join('') || `<tr><td colspan="6" class="text-center py-4 text-slate-600 italic text-xs">No hay ensayos registrados.</td></tr>`;

        // Recopilación de inventario físico (órdenes ejecutadas)
        let executedItems = [];
        co.orders.filter(o => o.status === 'EJECUTADO').forEach(o => {
            (o.items || []).forEach((item, idx) => {
                executedItems.push({ ...item, orderId: o.id, itemIdx: idx, itemKey: `${o.id}-${idx}` });
            });
        });

        let bomTotal = 0;
        let bomHtml = '';

        if (executedItems.length === 0) {
            bomHtml = `<p class="text-slate-500 italic text-xs">No hay componentes adquiridos y ejecutados físicamente en inventario.</p>`;
        } else {
            bomHtml = executedItems.map(item => {
                const isSold = item.b2bStatus === 'VENDIDO';
                const isListed = item.b2bStatus === 'EN_VENTA';
                const isChecked = !isSold && !isListed && co.bom.includes(item.itemKey);
                
                if (isChecked) bomTotal += Number(item.price) || 0;

                let statusAction = '';
                if (isSold) {
                    statusAction = `<span class="text-[8px] bg-slate-800 text-slate-500 px-2 py-0.5 font-bold uppercase border border-slate-700">TRASPASADO B2B</span>`;
                } else if (isListed) {
                    statusAction = `<span class="text-[8px] bg-mars-yellow/20 text-mars-yellow px-2 py-0.5 font-bold uppercase border border-mars-yellow animate-pulse">EN OFERTA B2B</span>`;
                } else {
                    statusAction = `<button onclick="ui.modalSellB2B('${item.orderId}', ${item.itemIdx})" class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-2 py-0.5 text-[8px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap" title="Poner en venta en el mercado secundario">[VENDER B2B]</button>`;
                }

                return `
                <div class="flex justify-between items-center bg-slate-900 p-2 border ${isSold ? 'border-slate-800 opacity-50' : (isListed ? 'border-mars-yellow/50' : 'border-mars-border')} text-[10px] mb-1.5 gap-2">
                    <label class="flex items-center gap-2 text-white ${isSold || isListed ? 'cursor-not-allowed line-through text-slate-500' : 'cursor-pointer'} flex-grow overflow-hidden">
                        <input type="checkbox" class="form-checkbox bg-black border-mars-cyan shrink-0" ${isChecked ? 'checked' : ''} ${isSold || isListed ? 'disabled' : ''} onchange="ui.toggleBomItem('${item.itemKey}', this.checked)">
                        <span class="truncate">${item.name} (x${item.qty})</span>
                    </label>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-mars-green font-mono">${Number(item.price).toFixed(2)} €v</span>
                        ${statusAction}
                    </div>
                </div>
                `;
            }).join('');
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        // Contenido dinámico de Documentación (FYQ vs MAT)
        let docSectionContent = '';
        if (activeDocTab === 'FYQ') {
            docSectionContent = `
                <div class="mb-3">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan text-[8px] font-black px-2 py-0.5 uppercase">Peso en Proyecto: 25% Global</span>
                </div>
                ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black transition-colors">Descargar Guía Oficial FYQ</a>` : ''}
                
                ${this.renderHybridUploadBox('1. Hoja de Registro Preliminar (Fase I)', 'Presupuesto teórico, materiales del catálogo, altura estimada, boceto y foto del prototipo montado sin combustible.', 'preliminaryReport', docs.preliminaryReport)}
                ${this.renderHybridUploadBox('2. Informe Técnico Exhaustivo (Fase II - 50% FYQ)', 'Marco químico estequiométrico, análisis físico-aerodinámico, balance definitivo y análisis de fallos V2.0.', 'technicalReport', docs.technicalReport)}
            `;
        } else {
            docSectionContent = `
                <div class="mb-3">
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow text-[8px] font-black px-2 py-0.5 uppercase">Peso en Proyecto: 5% Global (25% cada criterio)</span>
                </div>
                <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Entregables trigonométricos y constructivos para el departamento de Matemáticas.</p>
                
                ${this.renderHybridUploadBox('1. Elaboración de Goniómetro/s (25% MAT)', 'Fotografías, diseño constructivo y calibración del goniómetro o clinómetro casero.', 'goniometerEvidence', docs.goniometerEvidence)}
                ${this.renderHybridUploadBox('2. Informe Empírico: Distancia Conocida (25% MAT)', 'Cálculo trigonométrico de apogeo con datos objetivos desde una distancia conocida a la base.', 'mathReportDist', docs.mathReportDist)}
                ${this.renderHybridUploadBox('3. Informe Empírico: Dos Mediciones (25% MAT)', 'Cálculo de altitud mediante sistema de dos mediciones tomadas a una distancia de separación conocida.', 'mathReportTwoPoints', docs.mathReportTwoPoints)}
                ${this.renderHybridUploadBox('4. Informe Técnico Final Comparativo (25% MAT)', 'Análisis de coherencia comparando resultados anteriores y parámetros adicionales.', 'mathReportFinal', docs.mathReportFinal)}
            `;
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Entregables FYQ y MAT -->
            <div class="lg:col-span-5 space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3 flex-wrap gap-2">
                        <h2 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter">Entregables Científicos</h2>
                        <div class="flex gap-1 bg-black p-1 border border-mars-border">
                            <button onclick="ui.setTechDocTab('FYQ')" class="px-3 py-1 text-[9px] font-bold uppercase transition-colors ${activeDocTab === 'FYQ' ? 'bg-mars-cyan text-black' : 'text-slate-400 hover:text-white'}">Física y Química</button>
                            <button onclick="ui.setTechDocTab('MAT')" class="px-3 py-1 text-[9px] font-bold uppercase transition-colors ${activeDocTab === 'MAT' ? 'bg-mars-yellow text-black' : 'text-slate-400 hover:text-white'}">Matemáticas</button>
                        </div>
                    </div>
                    <div class="max-h-[560px] overflow-y-auto pr-2">
                        ${docSectionContent}
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Banco de Pruebas e Inventario Físico / BOM -->
            <div class="lg:col-span-7 space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                    <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg mb-4 uppercase tracking-tighter">Banco de Pruebas de Vuelo (Fase II)</h2>
                    <div class="bg-black border border-mars-border p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-3 text-[10px]">
                        <input type="text" id="ft-bottle" placeholder="Botella usada (Ej: 1.5L Lisa)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-yellow w-full">
                        <input type="number" id="ft-nahco3" placeholder="NaHCO3 (g)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan w-full" step="0.1">
                        <input type="number" id="ft-vinegar" placeholder="Vinagre (ml)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan w-full" step="1">
                        <input type="number" id="ft-cost" placeholder="Coste Ensayo (€v)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-magenta w-full" step="0.1">
                        <input type="number" id="ft-height" placeholder="Altura H (metros)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-green font-bold w-full" step="0.1">
                        <button onclick="ui.submitFlightTest()" class="bg-mars-yellow text-black font-black uppercase tracking-widest hover:shadow-[0_0_10px_#ffe600] transition-all py-2 w-full">Registrar Vuelo</button>
                    </div>
                    <div class="overflow-x-auto w-full max-h-60 overflow-y-auto">
                        <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                            <thead class="text-slate-500 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                                <tr><th class="py-2 pr-2">Fecha</th><th class="pr-2">Fuselaje</th><th class="pr-2">Mix (Sól/Líq)</th><th class="pr-2">Coste (€v)</th><th class="pr-2">H (m)</th><th class="text-mars-yellow">E = H/C</th></tr>
                            </thead>
                            <tbody>${ftHtml}</tbody>
                        </table>
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-2 gap-2">
                        <div>
                            <h2 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tighter">Inventario Físico, BOM & Ventas B2B</h2>
                            <p class="text-[9px] text-slate-400 uppercase mt-0.5">Marca las piezas que integran el cohete final o vende el excedente a otras empresas.</p>
                        </div>
                        <button onclick="ui.setMarketTab('b2b'); ui.navigate('market')" class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1 text-[9px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">Ver Mercado B2B</button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4 mb-4 bg-black p-3 border border-mars-border">
                        <div class="text-center border-r border-slate-800">
                            <p class="text-[8px] text-slate-500 uppercase font-bold">Inversión Total I+D Ejecutada</p>
                            <p class="text-mars-cyan font-mono font-bold text-base">${totalDevCost.toFixed(2)} €v</p>
                        </div>
                        <div class="text-center">
                            <p class="text-[8px] text-slate-500 uppercase font-bold">Coste Prototipo Final (BOM)</p>
                            <p class="text-mars-green font-mono font-bold text-lg">${bomTotal.toFixed(2)} €v</p>
                        </div>
                    </div>

                    <div class="max-h-60 overflow-y-auto pr-2">
                        ${bomHtml}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
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

    modalSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return alert("Componente no localizado en el inventario.");

        const item = ord.items[itemIdx];
        if (item.b2bStatus) return alert("Este componente ya está en proceso de venta o ha sido vendido.");

        const html = `
            <p class="text-[10px] text-slate-300 mb-4 leading-relaxed">Vas a publicar <strong>${item.name} (x${item.qty})</strong> en el Mercado Secundario B2B. El coste original de adquisición fue de <span class="text-mars-cyan font-bold">${Number(item.price).toFixed(2)} €v</span>.</p>
            <div class="space-y-3">
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Precio de Venta Solicitado (€v)</label>
                    <input type="number" id="b2b-sell-price" value="${Number(item.price).toFixed(0)}" min="1" step="1" class="w-full bg-slate-900 border border-mars-yellow p-2.5 text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Estado / Observaciones Técnicas</label>
                    <input type="text" id="b2b-sell-notes" placeholder="Ej: Sin usar, excedente de diseño Fase I..." class="w-full bg-slate-900 border border-mars-border p-2.5 text-xs text-white outline-none focus:border-mars-cyan">
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.confirmSellB2B('${orderId}', ${itemIdx})" class="bg-mars-yellow text-black px-5 py-2 text-[10px] font-black uppercase hover:bg-white transition-all">Publicar en Mercado B2B</button>`;
        this.showModal("Poner Pieza en Venta (B2B)", html, actions);
    },

    confirmSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const elPrice = document.getElementById('b2b-sell-price');
        const elNotes = document.getElementById('b2b-sell-notes');
        if (!elPrice) return;

        const price = parseFloat(elPrice.value);
        const notes = elNotes ? elNotes.value.trim() : '';

        if (isNaN(price) || price <= 0) return alert("Introduce un precio en €v válido mayor que cero.");

        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return;

        const item = ord.items[itemIdx];
        const itemKey = `${orderId}-${itemIdx}`;

        // Desmarcar del BOM si estaba incluido en el prototipo
        co.bom = (co.bom || []).filter(k => k !== itemKey);
        item.b2bStatus = 'EN_VENTA';

        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bMarket.unshift({
            id: 'LST-' + Date.now(),
            sellerCoId: state.user.coId,
            sellerName: co.name,
            itemName: item.name,
            category: item.category || 'Componente',
            qty: item.qty || 1,
            price: price,
            notes: notes || 'Excedente de inventario I+D en perfecto estado.',
            sourceOrderKey: itemKey,
            date: new Date().toLocaleDateString()
        });

        telemetry.log("OFERTA B2B", `Publicado en B2B: ${item.name} por ${price}€v`);
        state.save();
        this.closeModal();
        alert(`✅ Componente "${item.name}" publicado en el Mercado B2B por ${price.toFixed(2)} €v.`);
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

        const bottle = elBottle.value.trim();
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
        
        const name = elName.value.trim();
        const reason = elReason.value.trim();
        if(!name || !reason) return alert("Rellene todos los campos.");
        
        state.data.pendingCustom = state.data.pendingCustom || [];
        state.data.pendingCustom.push({ id: Date.now(), company: state.user.coId, name, reason });
        state.save();
        this.closeModal();
        alert("Solicitud enviada al claustro para su valoración.");
    }
});