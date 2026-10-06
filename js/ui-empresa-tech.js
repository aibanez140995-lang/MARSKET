// js/ui-empresa-tech.js
// --- MÓDULO I+D: BANCO DE PRUEBAS, BOM E INFORME TÉCNICO ---

Object.assign(ui, {
    viewTech(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.bom = co.bom || [];
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        
        const wrapper = document.createElement('div');
        
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
            o.items.forEach(item => {
                executedItems.push({ ...item, orderId: o.id });
            });
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
                </div>
                `;
            }).join('');
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + o.total, 0);

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Documentación Técnica</h2>
                    ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                    ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                    ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
                </div>

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
            </div>
            <div class="lg:col-span-2 terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
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