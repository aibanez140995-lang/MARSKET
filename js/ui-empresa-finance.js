// js/ui-empresa-finance.js
// --- MÓDULO FINANZAS: BÓVEDA DE ÓRDENES, LEDGER Y AUDITORÍA ---

Object.assign(ui, {
    renderDeadlinesBlock() {
        const dl = state.data.config.deadlines || {}; // REGLA 1
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

    issueCrisisCommunication(alertId) {
        if (!state.user) return; // REGLA 2
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.crisisAlerts = co.crisisAlerts || []; // REGLA 1
        const alert = co.crisisAlerts.find(a => a.id === alertId);
        
        if (alert) {
            alert.read = true;
            const msg = `🚨 COMUNICADO DE CRISIS (CEO): Hemos sido sancionados por ${alert.agency} con ${alert.amount}€v. Motivo: ${alert.article}`;
            
            ['TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'].forEach(role => {
                ui.pushNotification(state.user.coId, role, msg, 'error');
            });
            
            telemetry.log("GESTIÓN CRISIS", `CEO emitió comunicado por sanción de ${alert.amount}€v`);
            state.save();
            this.render();
        }
    },

    viewOrders(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        const role = state.user.role;
        const docs = co.deliverables || {};
        co.orders = co.orders || []; // REGLA 1
        co.marketingPackages = co.marketingPackages || []; // REGLA 1
        
        const wrapper = document.createElement('div');
        
        let ceoDashboard = '';
        if(role === 'CEO') {
            co.crisisAlerts = co.crisisAlerts || [];
            const unreadCrisis = co.crisisAlerts.filter(a => !a.read);
            let crisisHtml = '';
            
            if (unreadCrisis.length > 0) {
                crisisHtml = unreadCrisis.map(alert => `
                    <div class="bg-red-900/80 border-2 border-red-500 p-4 mb-6 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.5)]">
                        <h3 class="text-white font-black text-lg uppercase mb-2">🚨 SANCIÓN CRÍTICA RECIBIDA</h3>
                        <p class="text-red-200 text-[10px] mb-1"><strong>Organismo:</strong> ${alert.agency}</p>
                        <p class="text-red-200 text-[10px] mb-1"><strong>Infracción:</strong> ${alert.article}</p>
                        <p class="text-red-200 text-[10px] mb-3"><strong>Multa:</strong> ${alert.amount} €v</p>
                        <button onclick="ui.issueCrisisCommunication('${alert.id}')" class="bg-red-600 text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-white hover:text-red-600 transition-colors w-full sm:w-auto">Emitir Comunicado de Crisis a toda la empresa</button>
                    </div>
                `).join('');
            }

            let sanctionsHtml = '';
            const sanctions = co.sanctions || [];
            if (sanctions.length > 0) {
                sanctionsHtml = `
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-red-600 mb-8">
                    <h2 class="font-orbitron text-red-500 text-sm mb-4 uppercase tracking-tighter border-b border-red-900 pb-2">Ventanilla Legal: Historial de Sanciones</h2>
                    <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                        ${sanctions.map(s => `
                            <div class="bg-red-900/20 border border-red-900 p-3">
                                <div class="flex justify-between items-center border-b border-red-900/50 pb-2 mb-2">
                                    <span class="text-red-400 font-bold text-[10px] uppercase">${s.agency}</span>
                                    <span class="text-[8px] text-slate-500">${s.date}</span>
                                </div>
                                <p class="text-white text-[10px] font-bold mb-1">${s.article}</p>
                                <p class="text-slate-400 text-[9px] italic mb-2">"${s.reason}"</p>
                                <div class="text-right"><span class="text-mars-magenta font-mono font-bold">${s.amount} €v</span></div>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
            }

            ceoDashboard = `
            ${crisisHtml}
            <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                <h2 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Cronograma Maestro de Entregas</h2>
                <button onclick="ui.modalCreateAuxRole()" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-[9px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-colors whitespace-nowrap">Gestionar Rol Observador</button>
            </div>
            ${this.renderDeadlinesBlock()}
            
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8">
                <h2 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Bóveda Documental Corporativa</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${this.renderDocBadge('Informe Técnico (FYQ)', docs.technicalReport)}
                    ${this.renderDocBadge('Libro de Cuentas (ECO)', docs.financeBook)}
                    ${this.renderDocBadge('Micro-Pitch Fase I (ING/LYE)', docs.presPhase1)}
                    ${this.renderDocBadge('Pitch Final Fase III (LEN)', docs.presPhase3)}
                    ${this.renderDocBadge('Propuesta de Valor (LYE)', docs.valuePropDoc)}
                </div>
            </div>
            ${sanctionsHtml}
            `;
        }

        let financeAlertHtml = '';
        if (role.includes('FINAN')) {
            const pendingTech = co.orders.filter(o => o.status === 'PENDIENTE_FINANZAS').length;
            const pendingMkt = co.marketingPackages.filter(p => p.status === 'PENDIENTE_FINANZAS').length;
            const pendingCount = pendingTech + pendingMkt;
            if (pendingCount > 0) {
                financeAlertHtml = `
                <div class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow p-4 mb-6 animate-pulse shadow-[0_0_15px_rgba(255,230,0,0.3)]">
                    <p class="font-bold uppercase text-xs sm:text-sm text-center tracking-widest">⚠️ ATENCIÓN FINANZAS: Hay ${pendingCount} orden(es) esperando tu aprobación presupuestaria.</p>
                </div>`;
            }
        }

        const sortedOrders = [...co.orders].sort((a, b) => {
            if (a.status === 'PENDIENTE_FINANZAS' && b.status !== 'PENDIENTE_FINANZAS') return -1;
            if (a.status !== 'PENDIENTE_FINANZAS' && b.status === 'PENDIENTE_FINANZAS') return 1;
            return 0;
        });

        let mktSection = '';
        if (role === 'CEO' || role.includes('FINAN')) {
            const sortedMkt = [...co.marketingPackages].sort((a, b) => {
                if (a.status === 'PENDIENTE_FINANZAS' && b.status !== 'PENDIENTE_FINANZAS') return -1;
                if (a.status !== 'PENDIENTE_FINANZAS' && b.status === 'PENDIENTE_FINANZAS') return 1;
                return 0;
            });

            if (sortedMkt.length > 0) {
                mktSection = `
                <div class="flex justify-between items-center mb-6 mt-10 border-t border-mars-border pt-6">
                    <h2 class="font-orbitron text-mars-magenta text-lg sm:text-xl uppercase tracking-tighter">Contratos de Marketing</h2>
                </div>
                <div class="space-y-6">
                    ${sortedMkt.map(pkg => {
                        const trackerIndex = pkg.status === 'PENDIENTE_FINANZAS' ? 0 : pkg.status === 'APROBADO' ? 2 : 0;
                        return `
                        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 ${pkg.status === 'APROBADO' ? 'border-l-mars-green' : pkg.status === 'DENEGADA' ? 'border-l-mars-magenta' : 'border-l-mars-yellow'} animate-in slide-in-from-bottom-4 duration-300">
                            ${pkg.status !== 'DENEGADA' ? ui.renderWorkflowTracker(['MKT (Solicita)', 'FIN (Audita)', 'Activo'], trackerIndex) : ''}
                            
                            <div class="flex justify-between items-start mb-4 flex-wrap gap-2 mt-4">
                                <div><span class="text-[9px] font-bold uppercase ${pkg.status === 'APROBADO' ? 'text-mars-green bg-mars-green/10' : pkg.status === 'DENEGADA' ? 'text-mars-magenta bg-mars-magenta/10' : 'text-mars-yellow bg-mars-yellow/10'} px-2 py-1 tracking-widest">[STATUS: ${pkg.status}]</span><h3 class="text-white font-orbitron mt-3 uppercase text-xs sm:text-sm">PKG_TX: ${pkg.id}</h3></div>
                                <div class="text-left sm:text-right w-full sm:w-auto"><p class="text-mars-magenta font-black font-mono text-xl tracking-tighter">${pkg.cost.toFixed(2)} €v</p><p class="text-[9px] text-slate-500 uppercase font-bold mt-1">${pkg.date}</p></div>
                            </div>
                            
                            <div class="grid grid-cols-1 gap-4 mb-4">
                                <div class="bg-black/50 p-4 border border-mars-border/50 text-[10px] w-full">
                                    <span class="block text-mars-magenta font-bold uppercase mb-2 border-b border-mars-magenta/30 pb-1">Paquete Solicitado:</span>
                                    <p class="text-white font-bold mb-1 text-sm">${pkg.name}</p>
                                    <p class="text-slate-400 italic">Incluye un total de ${pkg.totalActions} acciones publicitarias.</p>
                                </div>
                            </div>
                            
                            ${pkg.denyReason ? `<div class="bg-red-900/30 border border-red-500/50 p-3 text-[10px] text-red-200 mt-2 mb-4 w-full"><span class="font-bold">MOTIVO RECHAZO:</span> ${pkg.denyReason}</div>` : ''}
                            
                            ${pkg.status === 'PENDIENTE_FINANZAS' && role.includes('FINAN') ? `
                            <div class="flex flex-col sm:flex-row gap-3 border-t border-mars-border pt-4">
                                <button onclick="ui.approveMarketingPackage('${pkg.id}')" class="flex-grow bg-mars-green text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,255,102,0.4)]">Aprobar Presupuesto</button>
                                <button onclick="ui.promptDenyMarketingPackage('${pkg.id}')" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-6 py-3 text-[10px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-colors whitespace-nowrap">Denegar</button>
                            </div>` : ''}
                        </div>`;
                    }).join('')}
                </div>`;
            }
        }

        wrapper.innerHTML = `
        ${ceoDashboard}
        ${financeAlertHtml}
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-mars-yellow text-lg sm:text-xl uppercase tracking-tighter">Bóveda de Autorización y Finanzas</h2>
        </div>
        
        <div class="space-y-6">
            ${sortedOrders.map(order => {
                const trackerIndex = order.status === 'PENDIENTE_FINANZAS' ? 0 : order.status === 'APROBADO_FINANZAS' ? 1 : order.status === 'EJECUTADO' ? 2 : 0;
                
                return `
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 ${order.status === 'EJECUTADO' ? 'border-l-mars-cyan' : order.status === 'APROBADO_FINANZAS' ? 'border-l-mars-green' : order.status === 'DENEGADO' ? 'border-l-mars-magenta' : 'border-l-mars-yellow'} animate-in slide-in-from-bottom-4 duration-300">
                    ${order.status !== 'DENEGADO' ? ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], trackerIndex) : ''}
                    
                    <div class="flex justify-between items-start mb-4 flex-wrap gap-2 mt-4">
                        <div><span class="text-[9px] font-bold uppercase ${order.status === 'EJECUTADO' ? 'text-mars-cyan bg-mars-cyan/10' : order.status === 'APROBADO_FINANZAS' ? 'text-mars-green bg-mars-green/10' : order.status === 'DENEGADO' ? 'text-mars-magenta bg-mars-magenta/10' : 'text-mars-yellow bg-mars-yellow/10'} px-2 py-1 tracking-widest">[STATUS: ${order.status}]</span><h3 class="text-white font-orbitron mt-3 uppercase text-xs sm:text-sm">ORDER_TX: ${order.id}</h3></div>
                        <div class="text-left sm:text-right w-full sm:w-auto"><p class="text-mars-green font-black font-mono text-xl tracking-tighter">${order.total.toFixed(2)} €v</p><p class="text-[9px] text-slate-500 uppercase font-bold mt-1">${order.date}</p></div>
                    </div>
                    
                    <div class="grid grid-cols-1 gap-4 mb-4">
                        <div class="bg-black/50 p-4 border border-mars-border/50 text-[10px] w-full"><span class="block text-mars-cyan font-bold uppercase mb-2 border-b border-mars-cyan/30 pb-1">Justificación Técnica:</span><p class="text-slate-300 italic leading-relaxed">"${order.justification}"</p></div>
                    </div>
                    
                    ${order.denyReason ? `<div class="bg-red-900/30 border border-red-500/50 p-3 text-[10px] text-red-200 mt-2 mb-4 w-full"><span class="font-bold">MOTIVO RECHAZO:</span> ${order.denyReason}</div>` : ''}
                    
                    ${order.status === 'PENDIENTE_FINANZAS' && role.includes('FINAN') ? `
                    <div class="flex flex-col sm:flex-row gap-3 border-t border-mars-border pt-4">
                        <button onclick="ui.promptPartialApproveOrder('${order.id}')" class="flex-grow bg-mars-green text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,255,102,0.4)]">Revisar y Aprobar Presupuesto</button>
                        <button onclick="ui.promptDenyOrder('${order.id}')" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-6 py-3 text-[10px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-colors whitespace-nowrap">Denegar Totalmente</button>
                    </div>` : ''}

                    ${order.status === 'APROBADO_FINANZAS' && (role === 'TECNICO' || role === 'OPERACIONES_IA') ? `
                    <div class="flex flex-col sm:flex-row gap-3 border-t border-mars-border pt-4">
                        <button onclick="ui.navigate('cart')" class="flex-grow bg-mars-cyan text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,240,255,0.4)]">Ir a Logística para Ejecutar Compra</button>
                    </div>` : ''}
                </div>`;
            }).join('') || '<p class="text-slate-600 italic text-sm">No hay peticiones de I+D en el histórico.</p>'}
        </div>
        ${mktSection}
        `;
        el.appendChild(wrapper);
    },

    approveMarketingPackage(id) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const pkg = co.marketingPackages.find(p => p.id === id);
        if(!pkg) return;
        
        if(co.balance < pkg.cost) return alert("Fondos insuficientes para aprobar este paquete.");
        
        pkg.status = 'APROBADO';
        
        const conceptStr = `Contrato Agencia: ${pkg.name}`;
        state.addToLedger(state.user.coId, conceptStr, 'MARKETING', -pkg.cost);
        
        telemetry.log("APROBADO FINANZAS", `Paquete MKT ${id} validado. Coste: ${pkg.cost}€v`);
        ui.pushNotification(state.user.coId, 'MARKETING', `Tu solicitud para el "${pkg.name}" ha sido APROBADA. Ya puedes publicar acciones.`, 'success');
        
        state.save();
        this.render();
    },

    promptDenyMarketingPackage(id) {
        if (!state.user) return;
        const html = `<input type="text" id="deny-mkt-reason" class="w-full bg-black border border-mars-magenta p-3 text-xs text-white" placeholder="Motivo del rechazo...">`;
        const btn = `<button onclick="ui.finalizeDenyMarketingPackage('${id}')" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta">Confirmar Denegación</button>`;
        this.showModal("Denegar Paquete", html, btn);
    },

    finalizeDenyMarketingPackage(id) {
        if (!state.user) return;
        const reasonInput = document.getElementById('deny-mkt-reason');
        const reason = reasonInput ? reasonInput.value : '';
        if(!reason) return alert("Especifique motivo.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const pkg = co.marketingPackages.find(p => p.id === id);
        if(!pkg) return;
        
        pkg.status = 'DENEGADA';
        pkg.denyReason = `[FINANZAS] ${reason}`;
        
        telemetry.log("DENEGADO", `Paquete MKT ${id} - Motivo: ${reason}`);
        ui.pushNotification(state.user.coId, 'MARKETING', `Tu solicitud para el "${pkg.name}" ha sido DENEGADA.`, 'error');
        
        state.save();
        this.closeModal();
        this.render();
    },

    promptPartialApproveOrder(oid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.orders = co.orders || [];
        
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return alert("Orden no encontrada.");

        let itemsHtml = order.items.map((item, idx) => `
            <div class="flex justify-between items-center bg-black p-2 border border-mars-border mb-2">
                <label class="flex items-center gap-2 text-[10px] text-white cursor-pointer flex-grow">
                    <input type="checkbox" id="approve-item-${idx}" class="form-checkbox bg-slate-900 border-mars-cyan" checked>
                    ${item.name} (x${item.qty})
                </label>
                <span class="text-mars-green font-mono text-[10px] shrink-0">${item.price.toFixed(2)} €v</span>
            </div>
        `).join('');

        const html = `
            <p class="text-[10px] text-slate-400 mb-4">Desmarca los componentes que no autorices para esta compra. El presupuesto se recalculará automáticamente.</p>
            <div class="max-h-60 overflow-y-auto pr-2 mb-4">
                ${itemsHtml}
            </div>
        `;
        const actions = `<button onclick="ui.finalizePartialApproveOrder('${oid}')" class="bg-mars-green text-black px-6 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors shadow-[0_0_10px_rgba(0,255,102,0.4)]">Confirmar Aprobación</button>`;
        this.showModal(`Aprobar Orden #${oid}`, html, actions);
    },

    finalizePartialApproveOrder(oid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.orders = co.orders || [];
        
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return;

        let approvedItems = [];
        let newTotal = 0;

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`approve-item-${i}`);
            if(cb && cb.checked) {
                approvedItems.push(order.items[i]);
                newTotal += order.items[i].price;
            }
        }

        if(approvedItems.length === 0) {
            alert("No has aprobado ningún ítem. La orden será denegada.");
            this.closeModal();
            return this.finalizeDenyOrder(oid, "Rechazados todos los ítems en auditoría parcial.");
        }

        if(co.balance < newTotal) return alert("Fondos insuficientes para el nuevo total.");

        order.items = approvedItems.map(i => ({...i, realEur: '', realShop: ''}));
        order.total = newTotal;
        order.status = 'APROBADO_FINANZAS';

        telemetry.log("APROBADO FINANZAS", `Orden #${oid} validada parcialmente. Nuevo total: ${newTotal.toFixed(2)}€v`);
        
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Orden #${oid} aprobada por Finanzas. Pendiente de ejecución logística.`, 'info');
        ui.pushNotification(state.user.coId, 'TECNICO', `Orden #${oid} aprobada por Finanzas.`, 'success');
        
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal();
        alert(`Luz verde concedida a la orden #${oid}. Enviada a Logística.`);
        this.render();
    },

    promptDenyOrder(oid) {
        if (!state.user) return;
        const html = `<input type="text" id="deny-reason" class="w-full bg-black border border-mars-magenta p-3 text-xs text-white" placeholder="Motivo del rechazo...">`;
        const btn = `<button onclick="ui.finalizeDenyOrder('${oid}')" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta">Confirmar Denegación</button>`;
        this.showModal("Denegar Orden", html, btn);
    },
    
    finalizeDenyOrder(oid, forceReason = null) {
        if (!state.user) return;
        let reason = forceReason;
        if (!reason) {
            const reasonInput = document.getElementById('deny-reason');
            if(reasonInput) reason = reasonInput.value;
        }
        
        if(!reason) return alert("Especifique motivo.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.orders = co.orders || [];
        
        const o = co.orders.find(ord => String(ord.id) === String(oid));
        if(!o) return alert("Orden no encontrada.");
        
        o.status = 'DENEGADO'; 
        o.denyReason = `[${state.user.role}] ${reason}`;
        
        telemetry.log("DENEGADO", `Orden #${oid} - Motivo: ${reason}`);
        
        ui.pushNotification(state.user.coId, 'TECNICO', `Orden #${oid} denegada por Finanzas.`, 'error');
        
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        if(!forceReason) this.closeModal(); 
        this.render();
    },

    viewFinance(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.realCosts = co.realCosts || [];
        co.orders = co.orders || [];
        co.ledger = co.ledger || [];
        co.marketingPackages = co.marketingPackages || []; // REGLA 1
        
        const totalReal = co.realCosts.reduce((s, i) => s + i.eur, 0);
        const wrapper = document.createElement('div');
        
        let pendingOrdersHtml = '';
        const pendingOrders = co.orders.filter(o => o.status === 'PENDIENTE_FINANZAS');
        const pendingMkt = co.marketingPackages.filter(p => p.status === 'PENDIENTE_FINANZAS');
        
        if ((pendingOrders.length > 0 || pendingMkt.length > 0) && state.user.role.includes('FINAN')) {
            pendingOrdersHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8 animate-in fade-in">
                <h3 class="font-orbitron text-mars-yellow text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Órdenes Pendientes de Aprobación</h3>
                <div class="space-y-3">
                    ${pendingOrders.map(po => `
                        <div class="bg-slate-900 border border-mars-yellow/50 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p class="text-white font-bold uppercase text-xs">Orden I+D #${po.id}</p>
                                <p class="text-[10px] text-slate-400 mt-1">Total: <span class="text-mars-green font-mono">${po.total.toFixed(2)} €v</span></p>
                            </div>
                            <button onclick="ui.navigate('orders')" class="bg-mars-yellow text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors whitespace-nowrap">Revisar y Aprobar</button>
                        </div>
                    `).join('')}
                    ${pendingMkt.map(pm => `
                        <div class="bg-slate-900 border border-mars-magenta/50 p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <p class="text-white font-bold uppercase text-xs">Paquete MKT: ${pm.name}</p>
                                <p class="text-[10px] text-slate-400 mt-1">Acciones: ${pm.totalActions} | Total: <span class="text-mars-magenta font-mono">${pm.cost.toFixed(2)} €v</span></p>
                            </div>
                            <button onclick="ui.navigate('orders')" class="bg-mars-magenta text-white px-4 py-2 text-[10px] font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors whitespace-nowrap">Revisar y Aprobar</button>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        const isFinanzas = state.user.role === 'FINANZAS';
        
        let financeCards = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green w-full"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Caja Virtual</p><p class="text-xl sm:text-2xl font-orbitron text-mars-green tracking-tighter">${co.balance.toFixed(2)} €v</p></div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-cyan w-full"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Transacciones Ledger</p><p class="text-xl sm:text-2xl font-orbitron text-mars-cyan tracking-tighter">${co.ledger.length}</p></div>
        </div>`;

        let executedOrdersHtml = '';
        if (isFinanzas) {
            const executedOrders = co.orders.filter(o => o.status === 'EJECUTADO');
            if (executedOrders.length > 0) {
                executedOrdersHtml = `
                <div class="terminal-border bg-mars-card p-4 sm:p-6 w-full overflow-hidden mt-6">
                    <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Historial de Órdenes Ejecutadas</h3>
                    <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                        ${executedOrders.map(eo => `
                        <div class="bg-black/50 border border-mars-border/50 p-3">
                            <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                                <span class="text-white font-bold text-[10px] uppercase">Orden #${eo.id}</span>
                                <span class="text-[8px] text-slate-500">${eo.date}</span>
                            </div>
                            <div class="flex justify-between text-[9px] mb-2">
                                <span class="text-mars-green">Virtual: ${eo.total.toFixed(2)} €v</span>
                            </div>
                            <div class="text-[8px] text-slate-400 space-y-1">
                                ${eo.items.map(i => `
                                <div class="flex justify-between border-b border-slate-800/50 py-1">
                                    <span class="truncate pr-2">- ${i.name} (x${i.qty})</span>
                                    <div class="flex gap-3 text-right shrink-0">
                                        <span class="text-mars-cyan">${i.price.toFixed(2)} €v</span>
                                    </div>
                                </div>`).join('')}
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>`;
            }
        }

        let sanctionsHtml = '';
        const sanctions = co.sanctions || [];
        if (sanctions.length > 0) {
            sanctionsHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 w-full overflow-hidden mt-6 border-t-4 border-t-red-600">
                <h3 class="font-orbitron text-red-500 text-sm mb-4 uppercase tracking-tighter border-b border-red-900 pb-2">Ventanilla Legal: Historial de Sanciones</h3>
                <div class="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    ${sanctions.map(s => `
                        <div class="bg-red-900/20 border border-red-900 p-3">
                            <div class="flex justify-between items-center border-b border-red-900/50 pb-2 mb-2">
                                <span class="text-red-400 font-bold text-[10px] uppercase">${s.agency}</span>
                                <span class="text-[8px] text-slate-500">${s.date}</span>
                            </div>
                            <p class="text-white text-[10px] font-bold mb-1">${s.article}</p>
                            <p class="text-slate-400 text-[9px] italic mb-2">"${s.reason}"</p>
                            <div class="text-right">
                                <span class="text-mars-magenta font-mono font-bold">${s.amount} €v</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        let financeDetails = `
        <div class="grid grid-cols-1 gap-6 sm:gap-8">
            <div class="flex flex-col gap-6 w-full overflow-hidden">
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
                ${executedOrdersHtml}
                ${sanctionsHtml}
            </div>
        </div>`;

        wrapper.innerHTML = `
        ${financeCards}
        
        ${isFinanzas ? `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8">
            ${this.renderHybridUploadBox('Libro de Cuentas y Balances (Excel/PDF/URL)', 'Entregable oficial para el área de Economía con el ROI y Ledger detallado.', 'financeBook', docs.financeBook)}
        </div>` : ''}

        ${pendingOrdersHtml}
        ${financeDetails}
        `;
        el.appendChild(wrapper);
    }
});