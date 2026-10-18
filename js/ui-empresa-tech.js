// js/ui-empresa-tech.js
// --- MÓDULO I+D: BANCO DE PRUEBAS (en mm), BOM, MATEMÁTICAS E INVENTARIO B2B (v1.0.16) ---

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
        
        let ftHtml = co.flightTests.map(f => {
            // Retrocompatibilidad: Si el vuelo se guardó en metros o con claves heredadas, normaliza sin producir NaN
            const h_mm = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : 0);
            const naVal = !isNaN(Number(f.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f.weightG)) ? Number(f.weightG) : 0));
            const vinVal = !isNaN(Number(f.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f.waterMl)) ? Number(f.waterMl) : 0);
            const costVal = !isNaN(Number(f.costEurV)) ? Number(f.costEurV) : 0;
            const effVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : (costVal > 0 ? h_mm / costVal : 0);
            return `
            <tr class="border-b border-mars-border/40 hover:bg-slate-900/50">
                <td class="py-2.5 text-slate-300 pr-3">${this.escapeHTML(f.date || '--')}</td>
                <td class="py-2.5 font-bold text-white pr-3">${this.escapeHTML(f.bottle || 'Prototipo')}</td>
                <td class="py-2.5 text-mars-cyan pr-3">${naVal}g / ${vinVal}ml</td>
                <td class="py-2.5 font-mono text-mars-magenta pr-3">${costVal.toFixed(2)}</td>
                <td class="py-2.5 font-mono text-mars-green font-bold text-sm sm:text-base pr-3">${h_mm.toFixed(0)}</td>
                <td class="py-2.5 font-orbitron text-mars-yellow font-black">${effVal.toFixed(2)}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="6" class="text-center py-4 text-slate-300 italic text-xs">No hay ensayos registrados.</td></tr>`;

        let executedItems = [];
        co.orders.filter(o => o.status === 'EJECUTADO').forEach(o => {
            (o.items || []).forEach((item, idx) => {
                executedItems.push({ ...item, orderId: o.id, itemIdx: idx, itemKey: `${o.id}-${idx}` });
            });
        });

        let bomTotal = 0;
        let bomHtml = '';

        if (executedItems.length === 0) {
            bomHtml = `<p class="text-slate-300 italic text-xs">No hay componentes adquiridos y ejecutados físicamente en inventario.</p>`;
        } else {
            bomHtml = executedItems.map(item => {
                const isSold = item.b2bStatus === 'VENDIDO';
                const isListed = item.b2bStatus === 'EN_VENTA';
                const isChecked = !isSold && !isListed && co.bom.includes(item.itemKey);
                
                if (isChecked) bomTotal += Number(item.price) || 0;

                let statusAction = '';
                if (isSold) {
                    statusAction = `<span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 font-bold uppercase border border-slate-700">TRASPASADO B2B</span>`;
                } else if (isListed) {
                    statusAction = `<span class="text-xs bg-mars-yellow/20 text-mars-yellow px-2.5 py-1 font-bold uppercase border border-mars-yellow animate-pulse">EN OFERTA B2B</span>`;
                } else {
                    statusAction = `<button type="button" onclick="ui.modalSellB2B('${this.escapeHTML(item.orderId)}', ${Number(item.itemIdx)})" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap" title="Poner en venta en el mercado secundario">[VENDER B2B]</button>`;
                }

                return `
                <div class="flex flex-wrap justify-between items-center bg-slate-900 p-2.5 border ${isSold ? 'border-slate-800 opacity-60' : (isListed ? 'border-mars-yellow/50' : 'border-mars-border')} text-xs mb-2 gap-2">
                    <label class="flex items-center gap-2.5 text-white ${isSold || isListed ? 'cursor-not-allowed line-through text-slate-400' : 'cursor-pointer'} flex-grow min-w-0 min-h-[44px]">
                        <input type="checkbox" class="w-4 h-4 bg-black border-mars-cyan shrink-0" ${isChecked ? 'checked' : ''} ${isSold || isListed ? 'disabled' : ''} onchange="ui.toggleBomItem('${this.escapeHTML(item.itemKey)}', this.checked)">
                        <span class="break-words">${this.escapeHTML(item.name)} (x${Number(item.qty)||1})</span>
                    </label>
                    <div class="flex items-center gap-2 shrink-0">
                        <span class="text-mars-green font-mono font-bold">${Number(item.price).toFixed(2)} €v</span>
                        ${statusAction}
                    </div>
                </div>
                `;
            }).join('');
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        let docSectionContent = '';
        if (activeDocTab === 'FYQ') {
            docSectionContent = `
                <div class="mb-3 flex flex-wrap justify-between items-center gap-2">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 25% Global</span>
                    <span class="text-xs text-slate-300 uppercase font-bold">Resp: Dpto. Técnico</span>
                </div>
                <p class="text-xs text-slate-300 mb-3 uppercase leading-relaxed">Sube únicamente enlaces de Google Drive, OneDrive o Canva con permisos de lectura abiertos.</p>
                ${state.data.config.guidelines.techReportNotes ? `<p class="text-xs text-mars-yellow mb-3 italic">Info: ${this.escapeHTML(state.data.config.guidelines.techReportNotes)}</p>` : ''}
                ${state.data.config.guidelines.techReportDocUrl ? `<a href="${this.escapeHTML(state.data.config.guidelines.techReportDocUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] flex items-center justify-center border border-mars-cyan text-mars-cyan text-xs py-2.5 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black transition-colors">Abrir Guía Oficial FYQ</a>` : ''}
                
                ${this.renderDriveLinkBox('1. Hoja de Registro Preliminar (Fase I)', 'Enlace Drive al presupuesto teórico, materiales del catálogo, altura estimada, boceto y foto del prototipo montado sin combustible.', 'preliminaryReport', docs.preliminaryReport)}
                ${this.renderDriveLinkBox('2. Informe Técnico Exhaustivo (Fase II)', 'Enlace Drive al documento formal con marco químico estequiométrico, análisis físico-aerodinámico, balance definitivo y análisis V2.0.', 'technicalReport', docs.technicalReport)}
            `;
        } else {
            docSectionContent = `
                <div class="mb-3 flex flex-wrap justify-between items-center gap-2">
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 5% Global (25% cada criterio)</span>
                    <span class="text-xs text-slate-300 uppercase font-bold">Resp: Dpto. Técnico</span>
                </div>
                <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Entregables trigonométricos y constructivos para Matemáticas (Solo Enlaces Drive/Cloud).</p>
                
                ${this.renderDriveLinkBox('1. Elaboración de Goniómetro/s (25% MAT)', 'Enlace a carpeta/documento Drive con fotografías, diseño constructivo y calibración del goniómetro casero.', 'goniometerEvidence', docs.goniometerEvidence)}
                ${this.renderDriveLinkBox('2. Informe Empírico: Distancia Conocida (25% MAT)', 'Enlace Drive al cálculo trigonométrico de apogeo con datos objetivos desde una distancia conocida a la base.', 'mathReportDist', docs.mathReportDist)}
                ${this.renderDriveLinkBox('3. Informe Empírico: Dos Mediciones (25% MAT)', 'Enlace Drive al cálculo de altitud mediante sistema de dos mediciones tomadas a una distancia de separación conocida.', 'mathReportTwoPoints', docs.mathReportTwoPoints)}
                ${this.renderDriveLinkBox('4. Informe Técnico Final Comparativo (25% MAT)', 'Enlace Drive al análisis de coherencia comparando resultados anteriores y parámetros adicionales.', 'mathReportFinal', docs.mathReportFinal)}
            `;
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Entregables FYQ y MAT -->
            <div class="lg:col-span-5 space-y-6">
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3 flex-wrap gap-2">
                        <h2 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter">Entregables Científicos (Drive)</h2>
                        <div role="tablist" aria-label="Materias científicas" class="flex gap-1 bg-black p-1 border border-mars-border">
                            <button type="button" role="tab" aria-selected="${activeDocTab === 'FYQ'}" onclick="ui.setTechDocTab('FYQ')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors ${activeDocTab === 'FYQ' ? 'bg-mars-cyan text-black' : 'text-slate-300 hover:text-white'}">Física y Química</button>
                            <button type="button" role="tab" aria-selected="${activeDocTab === 'MAT'}" onclick="ui.setTechDocTab('MAT')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors ${activeDocTab === 'MAT' ? 'bg-mars-yellow text-black' : 'text-slate-300 hover:text-white'}">Matemáticas</button>
                        </div>
                    </div>
                    <div class="max-h-[560px] overflow-y-auto pr-1">
                        ${docSectionContent}
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Banco de Pruebas e Inventario Físico / BOM -->
            <div class="lg:col-span-7 space-y-6">
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow">
                    <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg mb-4 uppercase tracking-tighter">Banco de Pruebas de Vuelo (Fase II)</h2>
                    <div class="bg-black border border-mars-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                            <label for="ft-bottle" class="text-xs text-slate-300 uppercase block mb-1">Fuselaje / Botella</label>
                            <input type="text" id="ft-bottle" placeholder="Ej: 1.5L Lisa" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-yellow w-full">
                        </div>
                        <div>
                            <label for="ft-nahco3" class="text-xs text-slate-300 uppercase block mb-1">NaHCO3 (g)</label>
                            <input type="number" id="ft-nahco3" placeholder="NaHCO3 (g)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan w-full" step="0.1">
                        </div>
                        <div>
                            <label for="ft-vinegar" class="text-xs text-slate-300 uppercase block mb-1">Vinagre (ml)</label>
                            <input type="number" id="ft-vinegar" placeholder="Vinagre (ml)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan w-full" step="1">
                        </div>
                        <div>
                            <label for="ft-cost" class="text-xs text-slate-300 uppercase block mb-1">Coste Ensayo (€v)</label>
                            <input type="number" id="ft-cost" placeholder="Coste (€v)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-magenta w-full" step="0.1">
                        </div>
                        <div>
                            <label for="ft-height-mm" class="text-xs text-slate-300 uppercase block mb-1">Altura H (mm)</label>
                            <input type="number" id="ft-height-mm" placeholder="Altura H (mm)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-green font-bold w-full" step="1">
                        </div>
                        <div class="flex items-end">
                            <button type="button" onclick="ui.submitFlightTest()" class="min-h-[44px] bg-mars-yellow text-black font-black uppercase tracking-wider hover:bg-white transition-all py-2.5 px-3 w-full">Registrar Vuelo</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto w-full max-h-60 overflow-y-auto">
                        <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                            <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                                <tr><th class="py-2 pr-3">Fecha</th><th class="pr-3">Fuselaje</th><th class="pr-3">Mix (Sól/Líq)</th><th class="pr-3">Coste (€v)</th><th class="pr-3">H (mm)</th><th class="text-mars-yellow">E = H/C</th></tr>
                            </thead>
                            <tbody>${ftHtml}</tbody>
                        </table>
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-magenta">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-3">
                        <div>
                            <h2 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tighter">Inventario Físico, BOM & Ventas B2B</h2>
                            <p class="text-xs text-slate-300 uppercase mt-1">Marca las piezas que integran el cohete final o vende el excedente a otras empresas.</p>
                        </div>
                        <button type="button" onclick="ui.setMarketTab('b2b'); ui.navigate('market')" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-4 py-2 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">Ver Mercado B2B</button>
                    </div>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-black p-3 border border-mars-border">
                        <div class="text-center sm:border-r border-slate-800 pb-2 sm:pb-0 border-b sm:border-b-0">
                            <p class="text-xs text-slate-300 uppercase font-bold">Inversión Total I+D Ejecutada</p>
                            <p class="text-mars-cyan font-mono font-bold text-base mt-1">${totalDevCost.toFixed(2)} €v</p>
                        </div>
                        <div class="text-center">
                            <p class="text-xs text-slate-300 uppercase font-bold">Coste Prototipo Final (BOM)</p>
                            <p class="text-mars-green font-mono font-bold text-lg mt-1">${bomTotal.toFixed(2)} €v</p>
                        </div>
                    </div>

                    <div class="max-h-60 overflow-y-auto pr-1">
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
        if (!ord || !ord.items || !ord.items[itemIdx]) return this.notify("Componente no localizado en el inventario.", "error");

        const item = ord.items[itemIdx];
        if (item.b2bStatus) return this.notify("Este componente ya está en proceso de venta o ha sido vendido.", "warning");

        const html = `
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Vas a publicar <strong>${this.escapeHTML(item.name)} (x${Number(item.qty)||1})</strong> en el Mercado Secundario B2B. El coste original de adquisición fue de <span class="text-mars-cyan font-bold">${Number(item.price).toFixed(2)} €v</span>.</p>
            <div class="space-y-3">
                <div>
                    <label for="b2b-sell-price" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Precio de Venta Solicitado (€v)</label>
                    <input type="number" id="b2b-sell-price" value="${Number(item.price).toFixed(0)}" min="1" step="1" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label for="b2b-sell-notes" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Estado / Observaciones Técnicas</label>
                    <input type="text" id="b2b-sell-notes" placeholder="Ej: Sin usar, excedente de diseño Fase I..." class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan">
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmSellB2B('${this.escapeHTML(orderId)}', ${Number(itemIdx)})" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all">Publicar en Mercado B2B</button>`;
        this.showModal("Poner Pieza en Venta (B2B)", html, actions);
    },

    confirmSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const elPrice = document.getElementById('b2b-sell-price');
        const elNotes = document.getElementById('b2b-sell-notes');
        if (!elPrice) return;

        const price = parseFloat(elPrice.value);
        const notes = elNotes ? this.cleanInput(elNotes.value) : '';

        if (isNaN(price) || price <= 0) return this.notify("Introduce un precio en €v válido mayor que cero.", "warning");
        if (this.hasForbiddenWords(notes, 'Mercado B2B (Notas)', elNotes)) {
            return;
        }

        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return;

        const item = ord.items[itemIdx];
        const itemKey = `${orderId}-${itemIdx}`;

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
            obs: notes || 'Excedente de inventario I+D en perfecto estado.',
            notes: notes || 'Excedente de inventario I+D en perfecto estado.',
            status: 'EN_VENTA',
            sourceOrderKey: itemKey,
            date: new Date().toLocaleDateString()
        });

        telemetry.log("OFERTA B2B", `Publicado en B2B: ${item.name} por ${price}€v`);
        state.save();
        this.closeModal();
        this.notify(`✅ Componente "${item.name}" publicado en el Mercado B2B por ${price.toFixed(2)} €v.`, "success");
        this.render();
    },

    submitFlightTest() {
        if (!state.user) return;
        const elBottle = document.getElementById('ft-bottle');
        const elNahco3 = document.getElementById('ft-nahco3');
        const elVinegar = document.getElementById('ft-vinegar');
        const elCost = document.getElementById('ft-cost');
        const elHeightMm = document.getElementById('ft-height-mm');
        
        if (!elBottle || !elNahco3 || !elVinegar || !elCost || !elHeightMm) return; 

        const bottle = this.cleanInput(elBottle.value);
        const naHCO3 = parseFloat(elNahco3.value);
        const vinegar = parseFloat(elVinegar.value);
        const costEurV = parseFloat(elCost.value);
        const heightMm = parseFloat(elHeightMm.value); // <--- v1.0.16: Se registra en milímetros

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightMm)) return this.notify("Rellene todos los datos numéricos del ensayo.", "warning");
        if(this.hasForbiddenWords(bottle, 'Banco de Pruebas (Fuselaje)', elBottle)) return;
        if(costEurV <= 0) return this.notify("El coste no puede ser cero.", "warning");

        // Eficiencia: Milímetros por cada € virtual gastado
        const efficiency = heightMm / costEurV;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.flightTests = co.flightTests || [];
        co.flightTests.unshift({ id: 'FLT-'+Date.now(), date: new Date().toLocaleDateString(), bottle, naHCO3, vinegar, costEurV, heightMm, efficiency });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightMm}mm, E=${efficiency.toFixed(2)}`);
        state.save();
        this.notify("✅ Ensayo de vuelo registrado en el banco de pruebas.", "success");
        this.render();
    },

    modalCustom() {
        if (!state.user) return;
        const html = `
            <label for="custom-name" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Nombre del Componente</label>
            <input type="text" id="custom-name" placeholder="Nombre del componente..." class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-cyan">
            <label for="custom-reason" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Justificación Técnica</label>
            <textarea id="custom-reason" placeholder="Justificación técnica..." class="w-full bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white h-24 mb-2 outline-none focus:border-mars-cyan"></textarea>
        `;
        const actions = `<button type="button" onclick="ui.submitCustom()" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Enviar a Claustro</button>`;
        this.showModal("Solicitar I+D Especial", html, actions);
    },

    submitCustom() {
        if (!state.user) return;
        const elName = document.getElementById('custom-name');
        const elReason = document.getElementById('custom-reason');
        if (!elName || !elReason) return; 
        
        const name = this.cleanInput(elName.value);
        const reason = this.cleanInput(elReason.value);
        if(!name || !reason) return this.notify("Rellene todos los campos.", "warning");
        if(this.hasForbiddenWords(name, 'I+D Especial (Nombre)', elName) || this.hasForbiddenWords(reason, 'I+D Especial (Justificación)', elReason)) {
            return;
        }
        
        state.data.pendingCustom = state.data.pendingCustom || [];
        state.data.pendingCustom.push({ id: Date.now(), company: state.user.coId, name, reason });
        state.save();
        this.closeModal();
        this.notify("Solicitud enviada al claustro para su valoración.", "success");
    }
});