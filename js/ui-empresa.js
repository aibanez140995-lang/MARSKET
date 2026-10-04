// js/ui-empresa.js
// --- MÓDULO DE VISTAS Y ACCIONES PARA ALUMNOS / STARTUPS ---

Object.assign(ui, {
    // --- 1. LOGIN Y CATÁLOGO ---
    viewLogin(el) {
        let coOptions = Object.keys(state.data.companies).map(k => `<option value="${k}">${state.data.companies[k].name}</option>`).join('');
        el.innerHTML = `
        <div class="min-h-[75vh] flex items-center justify-center w-full px-4">
            <div class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300">
                <img src="/logo.png" alt="MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
                <h2 class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-6 tracking-widest uppercase font-black">Secure_Access</h2>
                <select id="login-co" onchange="auth.updateRoleOptions()" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-4 outline-none focus:border-mars-cyan text-white">
                    ${coOptions}
                    <option value="admin" class="text-mars-yellow font-bold">CLAUSTRO DOCENTE</option>
                </select>
                <select id="login-role" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-6 outline-none focus:border-mars-cyan uppercase text-white font-bold">
                    <option>CEO</option><option>Técnico</option><option>Finanzas</option><option>Marketing</option><option>Operaciones IA</option>
                </select>
                <div class="flex justify-center gap-4 mb-8">
                    ${[1,2,3,4].map(() => `<div class="pin-dot w-3 h-3 rounded-full border border-mars-cyan transition-all"></div>`).join('')}
                </div>
                <div class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="auth.press('${n}')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                    <button onclick="auth.clear()" class="bg-slate-800 p-4 text-mars-magenta text-xs font-bold hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                    <button onclick="auth.press('0')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                    <button onclick="auth.verify()" class="bg-mars-green/20 border border-mars-green text-mars-green p-4 text-xs font-bold hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
                </div>
            </div>
        </div>`;
    },

    viewMarket(el) {
        const wrapper = document.createElement('div');
        let topSection = '';
        let techBanner = '';
        
        if(state.user && state.user.role === 'TECNICO') {
            const co = state.data.companies[state.user.coId];
            const docs = co.deliverables || {};
            
            if (co.cart && co.cart.length > 0) {
                const totalEurV = co.cart.reduce((s, i) => s + i.price, 0).toFixed(2);
                techBanner = `
                <div class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 animate-pulse shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                    <div>
                        <p class="font-bold uppercase text-xs sm:text-sm tracking-widest text-center sm:text-left">Lista de I+D Activa: ${co.cart.length} componente(s)</p>
                        <p class="text-[10px] uppercase tracking-widest text-center sm:text-left mt-1">Total acumulado: ${totalEurV} €v</p>
                    </div>
                    <button onclick="ui.modalSubmitOrderToFinance()" class="bg-mars-yellow text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap w-full sm:w-auto">[ REVISAR Y ENVIAR A FINANZAS ]</button>
                </div>`;
            }

            topSection = `
            ${techBanner}
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-6">
                <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Documentación Científico-Técnica</h2>
                <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Suba el Informe Técnico Oficial (Estequiometría, Leyes de Newton y Aerodinámica) en formato PDF o Enlace.</p>
                ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
            </div>`;
        }

        wrapper.innerHTML = `
        ${topSection}
        <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">SUPERMARS-KET Oficial</h2>
            ${!state.user.admin && state.user.role === 'TECNICO' ? `<button onclick="ui.modalCustom()" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] sm:text-[10px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all whitespace-nowrap">Solicitar I+D</button>` : ``}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${state.data.catalog.map(item => {
                let buySection = '';
                if(!state.user.admin) {
                    if (state.user.role === 'TECNICO') {
                        if (item.id === 'P01') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.techAddToCart('${item.id}', 10)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+10g</button><button onclick="ui.techAddToCart('${item.id}', 25)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+25g</button><button onclick="ui.techAddToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50g</button></div>`;
                        } else if (item.id === 'P02') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.techAddToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50ml</button><button onclick="ui.techAddToCart('${item.id}', 100)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+100ml</button></div>`;
                        } else {
                            buySection = `<div class="flex items-center gap-2 mt-2"><input type="number" id="qty-${item.id}" value="1" min="1" class="w-12 bg-black border border-mars-border text-center text-[10px] text-white p-1"><button onclick="ui.techAddToCart('${item.id}', parseInt(document.getElementById('qty-${item.id}').value)||1)" class="flex-grow bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2 py-1 text-[9px] font-black uppercase hover:bg-mars-cyan hover:text-mars-bg transition-all">Añadir a Petición</button></div>`;
                        }
                    } else {
                        buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">El Dpto. Técnico realiza las peticiones.</p>`;
                    }
                }

                return `
                <div class="terminal-border bg-mars-card p-4 group hover:border-mars-cyan transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between text-[8px] text-slate-500 mb-2 uppercase font-bold tracking-widest"><span>${item.category}</span><span class="text-mars-yellow">${item.unit}</span></div>
                        <h3 class="font-orbitron text-white text-[11px] mb-2 leading-tight uppercase">${item.name}</h3>
                    </div>
                    <div>
                        <span class="text-mars-green font-black text-base font-mono tracking-tighter">${item.price.toFixed(2)} €v</span>
                        ${buySection}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
        el.appendChild(wrapper);
    },

    techAddToCart(id, qty = 1) {
        const item = state.data.catalog.find(i => i.id === id);
        let name = item.name;
        if(id === 'P01' || id === 'P02') name = `${item.name} (${qty}${item.unit})`;
        
        state.data.companies[state.user.coId].cart.push({...item, qty, price: item.price * qty, name, realEur: '', realShop: ''});
        telemetry.log("REQ TÉCNICA", `Añadido a borrador: ${name}`);
        state.save();
        alert(`Añadido ${name} al borrador de petición. Vaya a 'I+D y Pruebas' o 'Órdenes' para transmitir a Finanzas.`);
        this.render();
    },

    removeFromCart(idx) { 
        const co = state.data.companies[state.user.coId];
        if(co && co.cart) {
            co.cart.splice(idx, 1); 
            state.save(); 
            this.render(); 
        }
    },

    modalSubmitOrderToFinance() {
        const co = state.data.companies[state.user.coId];
        if(!co.cart || co.cart.length === 0) return alert("El carrito de I+D está vacío.");
        
        const total = co.cart.reduce((s, i) => s + i.price, 0).toFixed(2);
        const itemsHtml = co.cart.map(i => `<div class="flex justify-between text-[10px] border-b border-mars-border/50 py-1"><span class="text-white">${i.name} (x${i.qty})</span><span class="text-mars-green">${i.price.toFixed(2)} €v</span></div>`).join('');
        
        const html = `
            <div class="mb-4 bg-slate-900 p-3 border border-mars-border max-h-32 overflow-y-auto w-full">
                ${itemsHtml}
                <div class="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-mars-border"><span class="text-mars-cyan">TOTAL VIRTUAL:</span><span class="text-mars-green">${total} €v</span></div>
            </div>
            <p class="text-[10px] text-mars-cyan mb-2 uppercase font-bold">Justificación Técnica (Obligatoria):</p>
            <textarea id="tech-order-just" placeholder="Explica para qué se necesitan estos componentes y su impacto en el diseño..." class="w-full bg-black border border-mars-cyan p-3 text-xs text-white h-24 outline-none focus:border-white"></textarea>
        `;
        const actions = `<button onclick="ui.confirmTechOrderToFinance()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Transmitir a Finanzas</button>`;
        this.showModal("Transmisión de Orden a Finanzas", html, actions);
    },

    confirmTechOrderToFinance() {
        const justText = document.getElementById('tech-order-just').value.trim();
        if(justText.length < 5) return alert("Justificación técnica obligatoria.");
        
        const co = state.data.companies[state.user.coId];
        if (!co.orders) co.orders = [];
        
        const total = co.cart.reduce((s, i) => s + i.price, 0);
        const newOrder = { 
            id: state.data.config.nextOrderId++, 
            items: [...co.cart], 
            total: total, 
            justification: justText, 
            status: 'PENDIENTE_FINANZAS', 
            date: new Date().toLocaleString() 
        };
        
        co.orders.unshift(newOrder);
        telemetry.log("REQUISICIÓN", `Enviada a Finanzas: ${total.toFixed(2)}€v`);
        
        co.cart = []; 
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal();
        alert(`✅ Orden #${newOrder.id} transmitida con éxito a Finanzas.`);
        this.render();
    },

    // --- 2. DPTO. TÉCNICO ---
    viewTech(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
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

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Documentación Técnica</h2>
                    ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                    ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                    ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
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

    submitFlightTest() {
        const bottle = document.getElementById('ft-bottle').value;
        const naHCO3 = parseFloat(document.getElementById('ft-nahco3').value);
        const vinegar = parseFloat(document.getElementById('ft-vinegar').value);
        const costEurV = parseFloat(document.getElementById('ft-cost').value);
        const heightM = parseFloat(document.getElementById('ft-height').value);

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightM)) return alert("Rellene todos los datos numéricos del ensayo.");
        if(costEurV <= 0) return alert("El coste no puede ser cero.");

        const efficiency = heightM / costEurV;
        const co = state.data.companies[state.user.coId];
        if(!co.flightTests) co.flightTests = [];
        co.flightTests.unshift({ id: 'FLT-'+Date.now(), date: new Date().toLocaleDateString(), bottle, naHCO3, vinegar, costEurV, heightM, efficiency });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightM}m, E=${efficiency.toFixed(3)}`);
        state.save();
        this.render();
    },

    modalCustom() {
        const html = `
            <input type="text" id="custom-name" placeholder="Nombre del componente..." class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
            <textarea id="custom-reason" placeholder="Justificación técnica..." class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-cyan"></textarea>
        `;
        const actions = `<button onclick="ui.submitCustom()" class="bg-mars-magenta text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Enviar a Claustro</button>`;
        this.showModal("Solicitar I+D Especial", html, actions);
    },

    submitCustom() {
        const name = document.getElementById('custom-name').value;
        const reason = document.getElementById('custom-reason').value;
        if(!name || !reason) return alert("Rellene todos los campos.");
        if(!state.data.pendingCustom) state.data.pendingCustom = [];
        state.data.pendingCustom.push({ id: Date.now(), company: state.user.coId, name, reason });
        state.save();
        this.closeModal();
        alert("Solicitud enviada al claustro para su valoración.");
    },

    // --- 3. FINANZAS Y ÓRDENES ---
    renderDeadlinesBlock() {
        const dl = state.data.config.deadlines;
        return `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            ${this.renderSingleDeadline('Pitch Fase I (Inglés)', dl.presPhase1)}
            ${this.renderSingleDeadline('Propuesta Valor (LYE)', dl.valuePropDoc)}
            ${this.renderSingleDeadline('Informe Técnico (FYQ)', dl.techReport)}
            ${this.renderSingleDeadline('Libro Cuentas (ECO)', dl.financeBook)}
            ${this.renderSingleDeadline('Pitch Fase III (LEN)', dl.presPhase3)}
        </div>`;
    },

    renderSingleDeadline(name, dateStr) {
        const status = this.getDeadlineStatus(dateStr);
        return `
        <div class="bg-slate-900 border border-mars-border p-3 flex flex-col justify-between w-full">
            <span class="text-[9px] text-slate-400 uppercase font-bold mb-1">${name}</span>
            <span class="text-xs font-mono text-white mb-2">${dateStr ? dateStr.replace('T', ' ') : 'No definido'}</span>
            <span class="text-[8px] font-black uppercase px-2 py-1 text-center ${status.class}">${status.text}</span>
        </div>`;
    },

    viewOrders(el) {
        const co = state.data.companies[state.user.coId];
        const role = state.user.role;
        const wrapper = document.createElement('div');
        
        let ceoDashboard = '';
        if(role === 'CEO') {
            ceoDashboard = `
            <h2 class="font-orbitron text-mars-cyan text-sm mb-3 uppercase tracking-tighter border-b border-mars-border pb-2">Cronograma Maestro de Entregas</h2>
            ${this.renderDeadlinesBlock()}
            `;
        }

        let techCartHtml = '';
        if (role === 'TECNICO' && co.cart && co.cart.length > 0) {
            techCartHtml = `
            <div class="terminal-border bg-mars-card p-4 mb-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-3 uppercase">Borrador de Petición (I+D)</h3>
                <div class="space-y-2 mb-4">
                    ${co.cart.map((item, idx) => `
                        <div class="flex justify-between items-center bg-slate-900 p-2 border border-mars-border text-[10px]">
                            <span class="text-white">${item.name} (x${item.qty})</span>
                            <div class="flex items-center gap-3">
                                <span class="text-mars-green font-mono">${item.price.toFixed(2)} €v</span>
                                <button onclick="ui.removeFromCart(${idx})" class="text-mars-magenta hover:text-white font-bold px-2">X</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-mars-border/50 pt-3">
                    <span class="text-[10px] text-slate-400 uppercase font-bold">Total Virtual: <span class="text-mars-green font-mono text-sm">${co.cart.reduce((s,i)=>s+i.price,0).toFixed(2)} €v</span></span>
                    <button onclick="ui.modalSubmitOrderToFinance()" class="w-full sm:w-auto bg-mars-cyan text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Transmitir a Finanzas</button>
                </div>
            </div>`;
        }

        let financeAlertHtml = '';
        if (role.includes('FINAN')) {
            const pendingCount = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
            if (pendingCount > 0) {
                financeAlertHtml = `
                <div class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow p-4 mb-6 animate-pulse shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                    <p class="font-bold uppercase text-xs sm:text-sm text-center tracking-widest">⚠️ ATENCIÓN FINANZAS: Hay ${pendingCount} orden(es) esperando tu aprobación presupuestaria.</p>
                </div>`;
            }
        }

        const sortedOrders = [...(co.orders || [])].sort((a, b) => {
            if (a.status === 'PENDIENTE_FINANZAS' && b.status !== 'PENDIENTE_FINANZAS') return -1;
            if (a.status !== 'PENDIENTE_FINANZAS' && b.status === 'PENDIENTE_FINANZAS') return 1;
            return 0;
        });

        wrapper.innerHTML = `
        ${ceoDashboard}
        ${techCartHtml}
        ${financeAlertHtml}
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-mars-yellow text-lg sm:text-xl uppercase tracking-tighter">Bóveda de Autorización y Finanzas</h2>
        </div>
        
        <div class="space-y-6">
            ${sortedOrders.map(order => `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 ${order.status === 'EJECUTADO' ? 'border-l-mars-cyan' : order.status === 'APROBADO_FINANZAS' ? 'border-l-mars-green' : order.status === 'DENEGADO' ? 'border-l-mars-magenta' : 'border-l-mars-yellow'} animate-in slide-in-from-bottom-4 duration-300">
                <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div><span class="text-[9px] font-bold uppercase ${order.status === 'EJECUTADO' ? 'text-mars-cyan bg-mars-cyan/10' : order.status === 'APROBADO_FINANZAS' ? 'text-mars-green bg-mars-green/10' : order.status === 'DENEGADO' ? 'text-mars-magenta bg-mars-magenta/10' : 'text-mars-yellow bg-mars-yellow/10'} px-2 py-1 tracking-widest">[STATUS: ${order.status}]</span><h3 class="text-white font-orbitron mt-3 uppercase text-xs sm:text-sm">ORDER_TX: ${order.id}</h3></div>
                    <div class="text-left sm:text-right w-full sm:w-auto"><p class="text-mars-green font-black font-mono text-xl tracking-tighter">${order.total.toFixed(2)} €v</p><p class="text-[9px] text-slate-500 uppercase font-bold mt-1">${order.date}</p></div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="bg-black/50 p-4 border border-mars-border/50 text-[10px] w-full"><span class="block text-mars-cyan font-bold uppercase mb-2 border-b border-mars-cyan/30 pb-1">Justificación Técnica:</span><p class="text-slate-300 italic leading-relaxed">"${order.justification}"</p></div>
                    <div class="bg-black/50 p-4 border border-mars-border/50 text-[9px] overflow-x-auto w-full">
                        <span class="block text-mars-magenta font-bold uppercase mb-2 border-b border-mars-magenta/30 pb-1">Desglose Físico Verificado:</span>
                        <table class="w-full text-left whitespace-nowrap min-w-max">
                            <tbody>
                                ${order.items.map(i => `<tr><td class="py-1 text-slate-400 pr-4">${i.name}</td><td class="py-1 text-slate-500 uppercase pr-4">${i.realShop||'N/A'}</td><td class="py-1 text-mars-magenta font-bold text-right">${i.realEur!==undefined && i.realEur!=='' ? parseFloat(i.realEur).toFixed(2)+' €' : '---'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="flex justify-between pt-2 mt-2 border-t border-slate-800 font-bold text-[10px]"><span class="text-white">TOTAL FÍSICO</span><span class="text-mars-magenta bg-mars-magenta/10 px-2 py-0.5">${order.realEurTotal!==undefined ? order.realEurTotal.toFixed(2)+' €' : '---'}</span></div>
                    </div>
                </div>
                
                ${order.denyReason ? `<div class="bg-red-900/30 border border-red-500/50 p-3 text-[10px] text-red-200 mt-2 mb-4 w-full"><span class="font-bold">MOTIVO RECHAZO:</span> ${order.denyReason}</div>` : ''}
                
                ${order.status === 'PENDIENTE_FINANZAS' && role.includes('FINAN') ? `
                <div class="flex flex-col sm:flex-row gap-3 border-t border-mars-border pt-4">
                    <button onclick="ui.financeApproveOrder('${order.id}')" class="flex-grow bg-mars-green text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,255,102,0.4)]">Dar Luz Verde Presupuestaria</button>
                    <button onclick="ui.promptDenyOrder('${order.id}')" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-6 py-3 text-[10px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-colors whitespace-nowrap">Denegar</button>
                </div>` : ''}
            </div>`).join('') || '<p class="text-slate-600 italic text-sm">No hay peticiones en el histórico.</p>'}
        </div>`;
        el.appendChild(wrapper);
    },

    financeApproveOrder(oid) {
        const co = state.data.companies[state.user.coId];
        const o = (co.orders || []).find(ord => String(ord.id) === String(oid));
        if(!o) return alert("Orden no encontrada.");
        
        if(co.balance < o.total) return alert("Fondos insuficientes.");
        
        o.status = 'APROBADO_FINANZAS';
        // Inicializar campos reales para Operaciones
        o.items = (o.items || []).map(i => ({...i, realEur: '', realShop: ''}));
        
        telemetry.log("APROBADO FINANZAS", `Orden #${oid} validada.`);
        
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        alert(`Luz verde concedida a la orden #${oid}. Enviada a Logística.`);
        this.render();
    },

    promptDenyOrder(oid) {
        const html = `<input type="text" id="deny-reason" class="w-full bg-black border border-mars-magenta p-3 text-xs text-white" placeholder="Motivo del rechazo...">`;
        const btn = `<button onclick="ui.finalizeDenyOrder('${oid}')" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta">Confirmar Denegación</button>`;
        this.showModal("Denegar Orden", html, btn);
    },
    
    finalizeDenyOrder(oid) {
        const reason = document.getElementById('deny-reason').value;
        if(!reason) return alert("Especifique motivo.");
        const o = state.data.companies[state.user.coId].orders.find(ord => String(ord.id) === String(oid));
        if(!o) return alert("Orden no encontrada.");
        
        o.status = 'DENEGADO'; 
        o.denyReason = `[${state.user.role}] ${reason}`;
        
        telemetry.log("DENEGADO", `Orden #${oid} - Motivo: ${reason}`);
        
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal(); 
        this.render();
    },

    viewFinance(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
        const totalReal = co.realCosts.reduce((s, i) => s + i.eur, 0);
        const wrapper = document.createElement('div');
        
        let pendingOrdersHtml = '';
        const pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS');
        if (pendingOrders.length > 0 && state.user.role.includes('FINAN')) {
            pendingOrdersHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8 animate-in fade-in">
                <h3 class="font-orbitron text-mars-yellow text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Órdenes Pendientes de Aprobación</h3>
                <div class="space-y-3">
                    ${pendingOrders.map(po => `
                        <div class="bg-slate-900 border border-mars-yellow/50 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p class="text-white font-bold uppercase text-xs">Orden #${po.id}</p>
                                <p class="text-[10px] text-slate-400 mt-1">Total: <span class="text-mars-green font-mono">${po.total.toFixed(2)} €v</span></p>
                            </div>
                            <button onclick="ui.navigate('orders')" class="bg-mars-yellow text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors whitespace-nowrap">Revisar y Aprobar</button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green w-full"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Caja Virtual</p><p class="text-xl sm:text-2xl font-orbitron text-mars-green tracking-tighter">${co.balance.toFixed(2)} €v</p></div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-magenta w-full"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Gasto Físico Auditado</p><p class="text-xl sm:text-2xl font-orbitron text-white tracking-tighter">${totalReal.toFixed(2)} €</p></div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-cyan w-full"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Transacciones Ledger</p><p class="text-xl sm:text-2xl font-orbitron text-mars-cyan tracking-tighter">${co.ledger.length}</p></div>
        </div>
        
        ${state.user.role === 'FINANZAS' ? `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8">
            ${this.renderHybridUploadBox('Libro de Cuentas y Balances (Excel/PDF/URL)', 'Entregable oficial para el área de Economía con el ROI y Ledger detallado.', 'financeBook', docs.financeBook)}
        </div>` : ''}

        ${pendingOrdersHtml}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div class="terminal-border bg-mars-card p-4 sm:p-6 w-full overflow-hidden">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Ledger Histórico inmutable</h3>
                <div class="overflow-x-auto w-full">
                    <div class="overflow-y-auto max-h-[400px] text-[10px] pr-2 min-w-[300px]">
                        ${co.ledger.map(l => `
                        <div class="border-b border-mars-border/30 py-3 flex justify-between gap-4">
                            <div class="flex-1"><p class="text-white font-bold leading-tight">${l.concept}</p><p class="text-[8px] text-slate-500 uppercase mt-1">${l.id} | ${l.date}</p></div>
                            <div class="text-right shrink-0"><p class="font-mono font-bold text-sm ${l.delta > 0 ? 'text-mars-green' : 'text-mars-magenta'}">${l.delta > 0 ? '+' : ''}${l.delta.toFixed(2)}</p><p class="text-slate-500 text-[8px]">Bal: ${l.final.toFixed(2)}</p></div>
                        </div>`).join('') || '<p class="text-slate-600 italic">Registro inmutable vacío.</p>'}
                    </div>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 w-full overflow-hidden">
                <h3 class="font-orbitron text-mars-magenta text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Desglose Físico Componentes (€)</h3>
                <div class="overflow-x-auto w-full">
                    <div class="overflow-y-auto max-h-[400px] text-[10px] pr-2 min-w-[300px]">
                        ${co.realCosts.map(r => `
                        <div class="border-b border-mars-border/30 py-3 flex justify-between gap-4">
                            <div class="flex-1 overflow-hidden"><p class="text-white uppercase font-black tracking-widest truncate">${r.shop}</p><p class="text-slate-400 mt-1 uppercase text-[9px] truncate">${r.item}</p></div>
                            <div class="text-right text-mars-magenta font-black text-sm font-mono tracking-tighter shrink-0">${r.eur.toFixed(2)} €</div>
                        </div>`).join('') || '<p class="text-slate-600 italic">No hay costes reales auditados.</p>'}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    // --- 4. OPERACIONES E IA ---
    updateOrderItem(oid, idx, field, value) {
        const co = state.data.companies[state.user.coId];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order || !order.items[idx]) return;
        if(field === 'realEur') order.items[idx][field] = value ? parseFloat(value) : '';
        else order.items[idx][field] = value;
    },

    updateOrderRealTotal(oid) {
        const co = state.data.companies[state.user.coId];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return;
        let totalR = 0;
        for(let i=0; i<order.items.length; i++) {
            const el = document.getElementById(`cart-eur-${oid}-${i}`);
            if(el && el.value) totalR += parseFloat(el.value) || 0;
        }
        const display = document.getElementById(`dynamic-real-total-${oid}`);
        if(display) display.innerText = totalR.toFixed(2) + ' €';
    },

    checkOrderReady(oid) {
        const co = state.data.companies[state.user.coId];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return;
        let allValid = true;
        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`cart-val-${oid}-${i}`);
            const eur = document.getElementById(`cart-eur-${oid}-${i}`);
            const shop = document.getElementById(`cart-shop-${oid}-${i}`);
            
            if(!cb || !cb.checked) allValid = false;
            if(!eur || eur.value === '' || parseFloat(eur.value) < 0) allValid = false;
            if(!shop || shop.value.trim() === '') allValid = false;
        }
        const btn = document.getElementById(`submit-order-btn-${oid}`);
        if(btn) {
            if(allValid) {
                btn.disabled = false;
                btn.className = "w-full sm:w-auto bg-mars-cyan text-mars-bg font-black px-6 py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all cursor-pointer";
                btn.innerText = "Confirmar Compra Física y Ejecutar";
            } else {
                btn.disabled = true;
                btn.className = "w-full sm:w-auto bg-slate-800 text-slate-500 font-black px-6 py-3 text-[10px] uppercase tracking-widest transition-all cursor-not-allowed";
                btn.innerText = "Validar Ensamblaje y Costes";
            }
        }
    },

    viewCart(el) {
        const co = state.data.companies[state.user.coId];
        const approvedOrders = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS');
        const wrapper = document.createElement('div');

        let html = `<h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl mb-6 uppercase tracking-tighter">Logística de Despliegue (Validación Física)</h2>`;

        if(approvedOrders.length === 0) {
            html += `<div class="terminal-border border-dashed p-8 text-center text-slate-500 text-xs italic w-full">No hay órdenes aprobadas pendientes de ejecución física.</div>`;
        } else {
            html += `<div class="space-y-8">`;
            approvedOrders.forEach(order => {
                const cartItemsHtml = order.items.map((item, idx) => `
                    <div class="bg-mars-card border border-mars-border p-3 flex flex-col gap-2 hover:border-mars-magenta/50 transition-all shadow-sm w-full">
                        <div class="flex justify-between items-start gap-2 flex-wrap">
                            <div class="flex-1 min-w-[150px]"><p class="text-white text-xs font-bold font-orbitron leading-tight">${item.name}</p><p class="text-[8px] text-slate-500 uppercase mt-1">Q: ${item.qty} | ${item.category}</p></div>
                            <div class="flex items-center gap-3">
                                <span class="text-mars-green font-mono font-bold whitespace-nowrap">${item.price.toFixed(2)} €v</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-mars-border/50">
                            <label class="flex items-center gap-2 text-[9px] text-mars-cyan cursor-pointer p-1 w-full"><input type="checkbox" id="cart-val-${order.id}-${idx}" class="form-checkbox bg-black border-mars-cyan" onchange="ui.checkOrderReady('${order.id}')"> Validado ensamblaje</label>
                            <input type="number" id="cart-eur-${order.id}-${idx}" value="${item.realEur !== '' ? item.realEur : ''}" placeholder="Coste Real (€)" class="bg-slate-900 border border-slate-700 text-[10px] p-2 text-white outline-none focus:border-mars-magenta w-full" oninput="ui.updateOrderItem('${order.id}', ${idx}, 'realEur', this.value); ui.updateOrderRealTotal('${order.id}'); ui.checkOrderReady('${order.id}')" min="0" step="0.01">
                            <input type="text" id="cart-shop-${order.id}-${idx}" value="${item.realShop || ''}" placeholder="Proveedor/Tienda" class="bg-slate-900 border border-slate-700 text-[10px] p-2 text-white uppercase outline-none focus:border-mars-magenta w-full" oninput="ui.updateOrderItem('${order.id}', ${idx}, 'realShop', this.value); ui.checkOrderReady('${order.id}')">
                        </div>
                    </div>
                `).join('');

                html += `
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-4 border-b border-mars-border/50 pb-2">
                        <h3 class="font-orbitron text-mars-cyan text-sm uppercase">ORDEN #${order.id}</h3>
                        <span class="text-mars-green font-mono font-bold">${order.total.toFixed(2)} €v</span>
                    </div>
                    <div class="space-y-4 mb-6">
                        ${cartItemsHtml}
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-mars-border/50 pt-4">
                        <div class="text-left w-full sm:w-auto">
                            <p class="text-[9px] text-mars-magenta uppercase mb-1 font-bold">Suma FÍSICA Total</p>
                            <p id="dynamic-real-total-${order.id}" class="text-lg sm:text-xl font-mono text-mars-magenta font-black">0.00 €</p>
                        </div>
                        <button id="submit-order-btn-${order.id}" onclick="ui.executeOrderPurchase('${order.id}')" class="w-full sm:w-auto bg-slate-800 text-slate-500 font-black px-6 py-3 text-[10px] uppercase tracking-widest transition-all cursor-not-allowed" disabled>Validar Ensamblaje y Costes</button>
                    </div>
                </div>`;
            });
            html += `</div>`;
        }
        wrapper.innerHTML = html;
        el.appendChild(wrapper);

        // Initialize totals
        approvedOrders.forEach(o => {
            this.updateOrderRealTotal(o.id);
            this.checkOrderReady(o.id);
        });
    },

    executeOrderPurchase(oid) {
        const co = state.data.companies[state.user.coId];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return alert("Orden no encontrada.");

        let allChecked = true;
        let realEurTotal = 0;

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`cart-val-${oid}-${i}`);
            const rEur = parseFloat(document.getElementById(`cart-eur-${oid}-${i}`).value);
            const rShop = document.getElementById(`cart-shop-${oid}-${i}`).value;
            
            if(!cb || !cb.checked || isNaN(rEur) || rEur < 0 || !rShop.trim()) { 
                allChecked = false; 
                break; 
            }
            realEurTotal += rEur;
            order.items[i].realEur = rEur;
            order.items[i].realShop = rShop;
        }
        
        if(!allChecked) return alert("Debe validar el ensamblaje y rellenar los costes reales de todos los componentes.");

        if(co.balance < order.total) return alert("Fondos virtuales insuficientes para ejecutar la compra.");
        
        state.addToLedger(state.user.coId, `Adquisición Materiales Orden #${oid}`, 'OPERACIONES', -order.total);
        
        order.items.forEach(i => { co.realCosts.unshift({ shop: i.realShop, item: i.name, eur: i.realEur }); });
        
        order.status = 'EJECUTADO';
        order.realEurTotal = realEurTotal;
        
        telemetry.log("EJECUCIÓN COMPRA", `Orden #${oid} | Importe: ${order.total.toFixed(2)}€v | Real: ${realEurTotal.toFixed(2)}€`);
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        alert("Compra física confirmada y asentada en el Ledger.");
        this.render();
    },

    viewAILog(el) {
        const co = state.data.companies[state.user.coId];
        if(!co.aiPrompts) co.aiPrompts = [];
        const pending = co.aiPrompts.filter(p => p.status === 'PENDIENTE_VALIDACION');
        const approved = co.aiPrompts.filter(p => p.status === 'APROBADO');
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-blue-400 text-xl uppercase tracking-tighter">Buzón y Bitácora de Inteligencia Artificial</h2>
            <button onclick="ui.modalReportAI()" class="bg-blue-600/20 border border-blue-500 text-blue-400 px-4 py-2 text-[10px] uppercase font-bold hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]">Registrar Prompt Directo</button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow w-full overflow-hidden">
                <h3 class="font-orbitron text-mars-yellow text-sm mb-4 uppercase tracking-widest border-b border-mars-border/50 pb-2">Prompts Pendientes de Auditoría</h3>
                <div class="space-y-4 overflow-y-auto max-h-[500px] pr-2 w-full">
                    ${pending.map(p => `
                    <div class="bg-slate-900/50 border border-mars-border p-4 text-[10px] w-full">
                        <div class="flex justify-between mb-2 border-b border-mars-border/30 pb-2">
                            <span class="text-mars-yellow font-bold uppercase tracking-widest">${p.tool}</span>
                            <span class="text-slate-500">${p.date}</span>
                        </div>
                        <p class="text-white font-bold mb-1 uppercase">Tarea: ${p.task}</p>
                        <p class="text-slate-400 mb-2 italic">Emisor: Rol ${p.authorRole.replace('_',' ')}</p>
                        <div class="bg-black border border-mars-border/50 p-3 mb-2 w-full"><span class="text-blue-400 font-bold block mb-1">Prompt:</span><p class="text-slate-300">"${p.prompt}"</p></div>
                        <div class="bg-black border border-mars-border/50 p-3 mb-3 w-full"><span class="text-mars-green font-bold block mb-1">Verificación Humana:</span><p class="text-slate-300">${p.verification}</p></div>
                        <div class="flex flex-col sm:flex-row gap-2 w-full">
                            <button onclick="ui.processAIPrompt('${p.id}', 'APROBADO')" class="flex-1 bg-mars-green text-black font-black py-2 uppercase hover:shadow-[0_0_10px_#00ff66] transition-all">Aprobar e Integrar</button>
                            <button onclick="ui.processAIPrompt('${p.id}', 'DESCARTADO')" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 font-bold uppercase hover:bg-mars-magenta hover:text-white transition-all">Descartar</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Bandeja limpia. No hay reportes pendientes.</p>'}
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500 w-full overflow-hidden">
                <h3 class="font-orbitron text-blue-400 text-sm mb-4 uppercase tracking-widest border-b border-mars-border/50 pb-2">Bitácora Oficial Aprobada</h3>
                <div class="space-y-4 overflow-y-auto max-h-[500px] pr-2 w-full">
                    ${approved.map(p => `
                    <div class="bg-slate-900/50 border border-blue-900/30 p-4 text-[10px] border-l-2 border-l-blue-500 w-full">
                        <div class="flex justify-between mb-2 border-b border-slate-800 pb-2">
                            <span class="text-blue-400 font-bold uppercase tracking-widest">${p.tool}</span>
                            <span class="text-slate-500">${p.date}</span>
                        </div>
                        <p class="text-white font-bold mb-1 uppercase">Tarea: ${p.task}</p>
                        <div class="text-slate-400 mt-2 bg-black p-2 border border-slate-800 w-full"><span class="text-mars-cyan font-bold block mb-1">Prompt Validado:</span>"${p.prompt}"</div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Aún no se han integrado prompts aprobados a la bitácora.</p>'}
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    modalReportAI() {
        const html = `
            <input type="text" id="ai-tool" placeholder="Herramienta (ej. ChatGPT, Claude)..." class="w-full bg-slate-900 border border-blue-500 p-2 text-xs text-white mb-2 outline-none focus:border-blue-400">
            <input type="text" id="ai-task" placeholder="Tarea realizada..." class="w-full bg-slate-900 border border-blue-500 p-2 text-xs text-white mb-2 outline-none focus:border-blue-400">
            <textarea id="ai-prompt" placeholder="Prompt exacto utilizado..." class="w-full bg-slate-900 border border-blue-500 p-2 text-xs text-white h-20 mb-2 outline-none focus:border-blue-400"></textarea>
            <textarea id="ai-verification" placeholder="¿Cómo has verificado que la información es correcta?" class="w-full bg-slate-900 border border-blue-500 p-2 text-xs text-white h-16 mb-2 outline-none focus:border-blue-400"></textarea>
        `;
        const actions = `<button onclick="ui.submitAIPrompt()" class="bg-blue-600 text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-blue-500 transition-colors">Enviar a Auditoría IA</button>`;
        this.showModal("Reportar Uso de IA", html, actions);
    },

    submitAIPrompt() {
        const tool = document.getElementById('ai-tool').value;
        const task = document.getElementById('ai-task').value;
        const prompt = document.getElementById('ai-prompt').value;
        const verification = document.getElementById('ai-verification').value;
        if(!tool || !task || !prompt || !verification) return alert("Todos los campos son obligatorios.");
        
        const co = state.data.companies[state.user.coId];
        if(!co.aiPrompts) co.aiPrompts = [];
        co.aiPrompts.unshift({
            id: 'AI-'+Date.now(), tool, task, prompt, verification,
            authorRole: state.user.role, date: new Date().toLocaleString(), status: 'PENDIENTE_VALIDACION'
        });
        state.save();
        this.closeModal();
        this.render();
        alert("Reporte enviado a Operaciones IA.");
    },

    processAIPrompt(id, status) {
        const co = state.data.companies[state.user.coId];
        const p = co.aiPrompts.find(x => x.id === id);
        if(p) {
            p.status = status;
            state.save();
            this.render();
        }
    },

    // --- 5. GOBERNANZA ---
    viewResolutions(el) {
        const co = state.data.companies[state.user.coId];
        if(!co.votingMotions) co.votingMotions = [];
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-mars-yellow text-xl uppercase tracking-tighter">Gobernanza y Resoluciones</h2>
            <button onclick="ui.modalMotion()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-2 text-[10px] uppercase font-bold hover:bg-mars-yellow hover:text-black transition-all">Proponer Moción</button>
        </div>
        <div class="space-y-4">
            ${co.votingMotions.map(m => {
                const votes = Object.values(m.votes || {});
                const y = votes.filter(v => v === 'A FAVOR').length;
                const n = votes.filter(v => v === 'EN CONTRA').length;
                const total = y + n;
                const myVote = m.votes ? m.votes[state.user.role] : null;
                
                let actions = '';
                if(m.status === 'ABIERTA') {
                    if(!myVote) {
                        actions = `<div class="flex gap-2 mt-3"><button onclick="ui.voteMotion('${m.id}', 'A FAVOR')" class="bg-mars-green text-black px-3 py-1 text-[9px] font-bold uppercase hover:bg-white transition-colors">A Favor</button><button onclick="ui.voteMotion('${m.id}', 'EN CONTRA')" class="bg-mars-magenta text-white px-3 py-1 text-[9px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">En Contra</button></div>`;
                    } else {
                        actions = `<p class="text-[9px] text-mars-cyan mt-3 uppercase font-bold">Tu voto: ${myVote}</p>`;
                    }
                    if(state.user.role === 'CEO' && total === 5) {
                        actions += `<button onclick="ui.resolveMotion('${m.id}')" class="mt-3 bg-mars-yellow text-black px-4 py-2 text-[10px] font-bold uppercase w-full hover:bg-white transition-colors">Cerrar Votación</button>`;
                    }
                } else {
                    actions = `<p class="text-[10px] font-bold mt-3 uppercase ${m.result === 'APROBADA' ? 'text-mars-green' : 'text-mars-magenta'}">RESULTADO: ${m.result}</p>`;
                }

                return `
                <div class="terminal-border bg-mars-card p-4 border-l-4 ${m.status === 'ABIERTA' ? 'border-l-mars-yellow' : (m.result === 'APROBADA' ? 'border-l-mars-green' : 'border-l-mars-magenta')} w-full">
                    <div class="flex justify-between mb-2"><h3 class="text-white font-bold uppercase text-xs">${m.title}</h3><span class="text-[8px] text-slate-500">${m.date}</span></div>
                    <p class="text-[10px] text-slate-400 mb-2">${m.desc}</p>
                    <div class="flex gap-4 text-[9px] text-slate-500 uppercase font-bold"><span>A Favor: <span class="text-mars-green">${y}</span></span><span>En Contra: <span class="text-mars-magenta">${n}</span></span></div>
                    ${actions}
                </div>`;
            }).join('') || '<p class="text-slate-500 text-xs italic">No hay mociones registradas.</p>'}
        </div>`;
        el.appendChild(wrapper);
    },

    modalMotion() {
        const html = `
            <input type="text" id="motion-title" placeholder="Título de la moción..." class="w-full bg-slate-900 border border-mars-yellow p-2 text-xs text-white mb-2 outline-none focus:border-mars-yellow">
            <textarea id="motion-desc" placeholder="Descripción y justificación..." class="w-full bg-slate-900 border border-mars-yellow p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-yellow"></textarea>
        `;
        const actions = `<button onclick="ui.submitMotion()" class="bg-mars-yellow text-black px-4 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Registrar Moción</button>`;
        this.showModal("Proponer Moción de Gobernanza", html, actions);
    },

    submitMotion() {
        const title = document.getElementById('motion-title').value;
        const desc = document.getElementById('motion-desc').value;
        if(!title || !desc) return alert("Rellene todos los campos.");
        const co = state.data.companies[state.user.coId];
        if(!co.votingMotions) co.votingMotions = [];
        co.votingMotions.unshift({ id: 'MOT-'+Date.now(), title, desc, authorRole: state.user.role, date: new Date().toLocaleString(), status: 'ABIERTA', votes: {} });
        state.save(); this.closeModal(); this.render();
    },

    voteMotion(id, vote) {
        const co = state.data.companies[state.user.coId];
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            if(!m.votes) m.votes = {};
            m.votes[state.user.role] = vote;
            state.save(); this.render();
        }
    },

    resolveMotion(id) {
        const co = state.data.companies[state.user.coId];
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            const votes = Object.values(m.votes || {});
            const y = votes.filter(v => v === 'A FAVOR').length;
            const n = votes.filter(v => v === 'EN CONTRA').length;
            if(y > n) { m.result = 'APROBADA'; m.status = 'CERRADA'; state.save(); this.render(); }
            else if(n > y) { m.result = 'RECHAZADA'; m.status = 'CERRADA'; state.save(); this.render(); }
            else {
                this.promptTieBreaker(id);
            }
        }
    },

    promptTieBreaker(id) {
        const html = `
            <p class="text-xs text-slate-300 mb-4">La votación ha resultado en empate. Como CEO, debes ejercer tu voto de calidad para desempatar.</p>
            <div class="flex gap-4">
                <button onclick="ui.executeTieBreaker('${id}', 'APROBADA')" class="flex-1 bg-mars-green text-black font-bold py-2 text-[10px] uppercase hover:bg-white transition-colors">Aprobar</button>
                <button onclick="ui.executeTieBreaker('${id}', 'RECHAZADA')" class="flex-1 bg-mars-magenta text-white font-bold py-2 text-[10px] uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
            </div>
        `;
        this.showModal("Voto de Calidad (CEO)", html, "");
    },

    executeTieBreaker(id, result) {
        const co = state.data.companies[state.user.coId];
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            m.result = result;
            m.status = 'CERRADA';
            state.save();
            this.closeModal();
            this.render();
        }
    },

    // --- 6. MARCA ---
    viewBrand(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta w-full">
                    <h2 class="font-orbitron text-mars-magenta text-lg mb-4 uppercase tracking-tighter">Identidad Corporativa</h2>
                    <input type="text" id="brand-slogan" value="${co.slogan||''}" placeholder="Eslogan corto corporativo..." class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-mars-yellow font-bold uppercase mb-4 focus:border-mars-magenta outline-none">
                    <p class="text-[9px] text-slate-400 mb-4 uppercase">Suba el logotipo diseñado para la corporación en formato PNG o JPG con fondo transparente para su visualización en el panel HUD.</p>
                    <div class="flex gap-2 w-full">
                        <button onclick="document.getElementById('brand-logo-upload').click()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-mars-magenta hover:text-white transition-all w-full">[ Cargar Imagen / Logo ]</button>
                        <button onclick="ui.saveSlogan()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all">Guardar</button>
                    </div>
                    <input type="file" id="brand-logo-upload" class="hidden" accept="image/png, image/jpeg" onchange="ui.handleLogoUpload(event)">
                </div>
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan w-full">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Manifiesto & Propuesta de Valor</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Redacte la misión, ventaja competitiva y pitch de atracción para inversores. Texto público en el Dossier Académico.</p>
                    <textarea id="val-prop-text" class="w-full bg-slate-900 border border-mars-border p-4 text-xs text-white h-32 outline-none focus:border-mars-cyan mb-4 leading-relaxed" placeholder="Redacte la misión corporativa aquí...">${co.valueProposition}</textarea>
                    <button onclick="ui.saveValueProposition()" class="bg-mars-cyan text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all w-full">Guardar Propuesta de Valor</button>
                    <div class="mt-4 border-t border-slate-800 pt-4 w-full">
                        ${this.renderHybridUploadBox('Dossier Propuesta de Valor (PDF/URL)', 'Entregable oficial para Evaluación LYE.', 'valuePropDoc', docs.valuePropDoc)}
                    </div>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow h-fit w-full overflow-hidden">
                <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Entregas Oficiales de Oratoria & Pitch</h2>
                <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Cargue los documentos de presentación requeridos para las defensas de oratoria ante el claustro. Soporta archivos o enlaces directos de Canva/Drive.</p>
                
                <div class="space-y-6 w-full">
                    ${this.renderHybridUploadBox('Presentación Fase I (Inglés - Micro-Pitch)', 'Evaluado por Liderazgo e Inglés.', 'presPhase1', docs.presPhase1)}
                    ${this.renderHybridUploadBox('Presentación Fase III (Castellano - Final)', 'Evaluado por Lengua Castellana.', 'presPhase3', docs.presPhase3)}
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    saveSlogan() {
        const s = document.getElementById('brand-slogan').value;
        state.data.companies[state.user.coId].slogan = s;
        state.save();
        alert("Eslogan guardado.");
        this.render();
    },

    saveValueProposition() {
        const text = document.getElementById('val-prop-text').value;
        state.data.companies[state.user.coId].valueProposition = text;
        state.save();
        alert("Propuesta de valor guardada.");
        this.render();
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo PNG/JPG.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logo.");
        const reader = new FileReader();
        reader.onload = (ev) => {
            state.data.companies[state.user.coId].logo = ev.target.result;
            telemetry.log("BRANDING", "LOGO ACTUALIZADO");
            state.save();
            this.render();
            alert("Logotipo corporativo guardado.");
        };
        reader.readAsDataURL(file);
    },

    handleDeliverableHybridSubmit(docType) {
        const fileInput = document.getElementById(`upload-file-${docType}`);
        const urlInput = document.getElementById(`upload-url-${docType}`);
        const file = fileInput.files[0];
        const url = urlInput.value;
        
        if(!file && !url) return alert("Debe adjuntar un archivo o proporcionar un enlace (URL).");
        
        const co = state.data.companies[state.user.coId];
        if(!co.deliverables) co.deliverables = { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null };

        if(file) {
            if (file.size > 2 * 1024 * 1024) return alert("El archivo supera el límite de 2MB. Envíe un enlace en su lugar.");
            const reader = new FileReader();
            reader.onload = (ev) => {
                co.deliverables[docType] = { type: 'file', name: file.name, date: new Date().toLocaleString(), size: (file.size / 1024).toFixed(1) + ' KB', dataUrl: ev.target.result };
                telemetry.log("ENTREGABLE", `Archivo subido: ${docType} (${file.name})`);
                state.save(); this.render(); alert("Documento entregado.");
            };
            reader.readAsDataURL(file);
        } else if(url) {
            if(!url.startsWith('http')) return alert("La URL debe comenzar con http:// o https://");
            co.deliverables[docType] = { type: 'link', name: 'Enlace a Nube Externa', date: new Date().toLocaleString(), size: 'URL', dataUrl: url };
            telemetry.log("ENTREGABLE", `Enlace subido: ${docType}`);
            state.save(); this.render(); alert("Enlace entregado.");
        }
    },

    // --- 7. DOSSIER DE ALUMNOS ---
    viewDossier(el) {
        const tab = this.dossierTab || 'eval';
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="flex gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showDossierTab('eval')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Evaluación Continua</button>
            <button onclick="ui.showDossierTab('docs')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Archivo Documental</button>
        </div>
        <div id="dossier-content" class="w-full"></div>
        `;
        el.appendChild(wrapper);
        this.renderDossierContent(tab);
    },

    showDossierTab(tab) {
        this.dossierTab = tab;
        this.render();
    },

    renderDossierContent(tab) {
        const container = document.getElementById('dossier-content');
        const co = state.data.companies[state.user.coId];
        
        if(tab === 'eval') {
            const subjects = ['FYQ', 'ECO', 'LYE', 'LEN', 'MAT', 'ING'];
            let html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
            
            subjects.forEach(sub => {
                const config = RUBRIC_CONFIG[sub];
                const grade = co.grades[sub] || { scores: {}, feedback: '', final: null };
                
                html += `
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan w-full">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border/50 pb-2">
                        <h3 class="font-orbitron text-mars-cyan text-xs uppercase">${config.name}</h3>
                        <span class="text-lg font-mono font-black ${grade.final !== null ? 'text-mars-green' : 'text-slate-600'}">${grade.final !== null ? grade.final.toFixed(2) : '--'}</span>
                    </div>
                    <div class="space-y-2 mb-3 w-full">
                        ${config.criteria.map(c => `
                        <div class="flex justify-between text-[9px] uppercase w-full">
                            <span class="text-slate-400">${c.name} (${c.weight*100}%)</span>
                            <span class="font-bold ${grade.scores[c.id] ? 'text-white' : 'text-slate-600'}">${grade.scores[c.id] || '-'}</span>
                        </div>`).join('')}
                    </div>
                    ${grade.feedback ? `<div class="bg-black p-2 border border-slate-800 text-[9px] text-slate-300 italic w-full">"${grade.feedback}"</div>` : ''}
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            const docs = co.deliverables || {};
            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-6 w-full">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase">Archivo Documental</h3>
                <div class="space-y-4 w-full">
                    ${this.renderDocBadge('Informe Técnico (FYQ)', docs.technicalReport)}
                    ${this.renderDocBadge('Libro de Cuentas (ECO)', docs.financeBook)}
                    ${this.renderDocBadge('Micro-Pitch Fase I (ING/LYE)', docs.presPhase1)}
                    ${this.renderDocBadge('Pitch Final Fase III (LEN)', docs.presPhase3)}
                    ${this.renderDocBadge('Propuesta de Valor (LYE)', docs.valuePropDoc)}
                </div>
            </div>`;
        }
    }
});