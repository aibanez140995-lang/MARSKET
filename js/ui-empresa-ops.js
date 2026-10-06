// js/ui-empresa-ops.js
// --- MÓDULO OPERACIONES E IA: LOGÍSTICA FÍSICA Y BITÁCORA IA ---

Object.assign(ui, {
    updateOrderItem(oid, idx, field, value) {
        if (!state.user) return; // REGLA 2
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.orders = co.orders || [];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order || !order.items[idx]) return;
        
        if(field === 'realEur') order.items[idx][field] = value ? parseFloat(value) : '';
        else order.items[idx][field] = value;
    },

    updateOrderRealTotal(oid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
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
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return;
        
        let allValid = true;
        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`cart-val-${oid}-${i}`);
            const eur = document.getElementById(`cart-eur-${oid}-${i}`);
            const shop = document.getElementById(`cart-shop-${oid}-${i}`);
            
            if(!cb || !cb.checked) allValid = false;
            // QA FIX: Añadida validación isNaN para evitar falsos positivos en el botón
            if(!eur || eur.value === '' || isNaN(parseFloat(eur.value)) || parseFloat(eur.value) < 0) allValid = false;
            if(!shop || shop.value.trim() === '') allValid = false;
        }
        
        const btn = document.getElementById(`submit-order-btn-${oid}`);
        if(btn) { // REGLA 3
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

    toggleValidateAll(oid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return;

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`cart-val-${oid}-${i}`);
            const eur = document.getElementById(`cart-eur-${oid}-${i}`);
            const shop = document.getElementById(`cart-shop-${oid}-${i}`);
            
            if(cb) cb.checked = true;
            
            if(eur && (eur.value === '' || isNaN(parseFloat(eur.value)))) {
                eur.value = '0.00';
                this.updateOrderItem(oid, i, 'realEur', '0.00');
            }
            
            if(shop && shop.value.trim() === '') {
                shop.value = 'SUPERMARS-KET';
                this.updateOrderItem(oid, i, 'realShop', 'SUPERMARS-KET');
            }
        }
        this.updateOrderRealTotal(oid);
        this.checkOrderReady(oid);
    },

    viewCart(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.orders = co.orders || [];
        const approvedOrders = co.orders.filter(o => o.status === 'APROBADO_FINANZAS');
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
                    ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], 1)}
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border/50 pb-2 gap-3 mt-4">
                        <h3 class="font-orbitron text-mars-cyan text-sm uppercase">ORDEN #${order.id}</h3>
                        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                            <span class="text-mars-green font-mono font-bold">${order.total.toFixed(2)} €v</span>
                            <button onclick="ui.toggleValidateAll('${order.id}')" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-[9px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap">[ VALIDAR TODOS ]</button>
                        </div>
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

        approvedOrders.forEach(o => {
            this.updateOrderRealTotal(o.id);
            this.checkOrderReady(o.id);
        });
    },

    executeOrderPurchase(oid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
        co.realCosts = co.realCosts || [];
        co.ledger = co.ledger || []; // REGLA 1
        
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return alert("Orden no encontrada.");

        let allChecked = true;
        let realEurTotal = 0;
        let itemNames = [];

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`cart-val-${oid}-${i}`);
            const elEur = document.getElementById(`cart-eur-${oid}-${i}`);
            const elShop = document.getElementById(`cart-shop-${oid}-${i}`);
            
            if (!cb || !elEur || !elShop) { allChecked = false; break; } // REGLA 3
            
            const rEur = parseFloat(elEur.value);
            const rShop = elShop.value;
            
            if(!cb.checked || isNaN(rEur) || rEur < 0 || !rShop.trim()) { 
                allChecked = false; 
                break; 
            }
            realEurTotal += rEur;
            order.items[i].realEur = rEur;
            order.items[i].realShop = rShop;
            itemNames.push(order.items[i].name);
        }
        
        if(!allChecked) return alert("Debe validar el ensamblaje y rellenar los costes reales de todos los componentes.");
        if(co.balance < order.total) return alert("Fondos virtuales insuficientes para ejecutar la compra.");
        
        // QA FIX: Bloque de Mutación Atómica. 
        // Actualizamos todo en memoria ANTES de llamar a state.save() para evitar estados parciales corruptos.
        
        // 1. Deducción de Balance y Ledger
        const conceptStr = `Adquisición Orden #${oid}: ${itemNames.join(', ')}`;
        co.balance -= order.total;
        co.ledger.unshift({ 
            id: 'TX-' + Math.random().toString(36).substr(2, 5).toUpperCase(), 
            date: new Date().toLocaleString(), 
            concept: conceptStr, 
            dept: 'OPERACIONES', 
            delta: -order.total, 
            final: co.balance 
        });
        
        // 2. Registro de Costes Reales
        order.items.forEach(i => { co.realCosts.unshift({ shop: i.realShop, item: i.name, eur: i.realEur }); });
        
        // 3. Cambio de Estado de la Orden
        order.status = 'EJECUTADO';
        order.realEurTotal = realEurTotal;
        
        // 4. Telemetría y Notificaciones
        telemetry.log("EJECUCIÓN COMPRA", `Orden #${oid} | Importe: ${order.total.toFixed(2)}€v | Real: ${realEurTotal.toFixed(2)}€`);
        ui.pushNotification(state.user.coId, 'TECNICO', `Orden #${oid} ejecutada físicamente y asentada en Ledger.`, 'success');
        ui.pushNotification(state.user.coId, 'FINANZAS', `Orden #${oid} ejecutada. Gasto real: ${realEurTotal.toFixed(2)}€.`, 'info');
        
        // 5. Guardado Único y Seguro (QA FIX: Eliminado el doble pushToCloud)
        state.save(); 
        
        alert("Compra física confirmada y asentada en el Ledger.");
        this.render();
    },

    viewAILog(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.aiPrompts = co.aiPrompts || []; // REGLA 1
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
                        ${ui.renderWorkflowTracker(['Emisor (Reporta)', 'Op. IA (Audita)'], 0)}
                        <div class="flex justify-between mb-2 border-b border-mars-border/30 pb-2 mt-3">
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
                        ${ui.renderWorkflowTracker(['Emisor (Reporta)', 'Op. IA (Audita)'], 1)}
                        <div class="flex justify-between mb-2 border-b border-slate-800 pb-2 mt-3">
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
        if (!state.user) return;
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
        if (!state.user) return;
        const elTool = document.getElementById('ai-tool');
        const elTask = document.getElementById('ai-task');
        const elPrompt = document.getElementById('ai-prompt');
        const elVerif = document.getElementById('ai-verification');
        
        if (!elTool || !elTask || !elPrompt || !elVerif) return; // REGLA 3
        
        const tool = elTool.value;
        const task = elTask.value;
        const prompt = elPrompt.value;
        const verification = elVerif.value;
        
        if(!tool || !task || !prompt || !verification) return alert("Todos los campos son obligatorios.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.aiPrompts = co.aiPrompts || [];
        
        co.aiPrompts.unshift({
            id: 'AI-'+Date.now(), tool, task, prompt, verification,
            authorRole: state.user.role, date: new Date().toLocaleString(), status: 'PENDIENTE_VALIDACION'
        });
        
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nuevo prompt IA pendiente de auditoría.`, 'warning');
        
        state.save();
        this.closeModal();
        this.render();
        alert("Reporte enviado a Operaciones IA.");
    },

    processAIPrompt(id, status) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.aiPrompts = co.aiPrompts || [];
        
        const p = co.aiPrompts.find(x => x.id === id);
        if(p) {
            p.status = status;
            ui.pushNotification(state.user.coId, p.authorRole, `Tu prompt IA ha sido ${status}.`, status === 'APROBADO' ? 'success' : 'error');
            state.save();
            this.render();
        }
    }
});