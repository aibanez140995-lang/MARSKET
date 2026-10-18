// js/ui-empresa-finance.js
// --- MÓDULO FINANCIERO Y BÓVEDA DE ÓRDENES: CRONOGRAMA MAESTRO (19 PLAZOS), AUDITORÍA Y LEDGER (v1.0.17) ---

Object.assign(ui, {
    cronogramaFilter: 'ALL',

    setCronogramaSubjectFilter(subj) {
        this.cronogramaFilter = subj;
        this.render();
    },

    viewOrders(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        co.orders = co.orders || [];
        co.marketingCampaigns = co.marketingCampaigns || [];
        co.crisisAlerts = co.crisisAlerts || [];
        co.sanctions = co.sanctions || [];
        co.deliverables = co.deliverables || {};

        const isCEO = state.user.role === 'CEO';
        const isFinanzas = state.user.role === 'FINANZAS';

        const wrapper = document.createElement('div');

        // 1. BANNER DE GESTIÓN DE CRISIS (Si hay sanciones regulatorias AEE)
        let crisisHtml = '';
        const unreadCrisis = co.crisisAlerts.filter(a => !a.read);
        if (unreadCrisis.length > 0) {
            crisisHtml = `
            <div class="terminal-border bg-red-950/40 p-4 sm:p-5 mb-6 border-l-4 border-l-red-600 animate-pulse shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex items-center gap-2">
                            <span class="bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-wider">ALERTA DISCIPLINARIA AEE</span>
                            <span class="text-[9px] text-slate-400">${unreadCrisis[0].date}</span>
                        </div>
                        <h3 class="font-orbitron text-red-500 text-sm sm:text-base font-bold uppercase mt-1">Expediente Sancionador: ${unreadCrisis[0].article || 'Infracción Normativa'}</h3>
                        <p class="text-[10px] text-slate-300 italic mt-0.5">"${unreadCrisis[0].reason}"</p>
                        <p class="text-mars-magenta font-mono font-bold text-xs mt-1">Penalización Económica: ${Number(unreadCrisis[0].amount).toFixed(2)} €v</p>
                    </div>
                    ${isCEO ? `<button onclick="ui.modalCrisisAction()" class="bg-red-700 text-white font-black px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-red-700 transition-all border border-red-500 shadow-[0_0_10px_red] shrink-0 w-full sm:w-auto">[ Emitir Comunicado de Crisis ]</button>` : `<span class="text-[9px] text-mars-yellow font-bold uppercase">Esperando acción de Dirección General (CEO)...</span>`}
                </div>
            </div>`;
        }

        // 2. CRONOGRAMA MAESTRO DE ENTREGAS (19 ENTREGABLES OFICIALES)
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const activeSubj = this.cronogramaFilter || 'ALL';
        const filteredDefs = activeSubj === 'ALL' ? defs : defs.filter(d => d.subject === activeSubj);

        const deadlinesData = (state.data.config && state.data.config.deadlines) ? state.data.config.deadlines : {};

        const subjectColors = {
            'FYQ': 'text-mars-cyan border-mars-cyan bg-mars-cyan/10',
            'LYE': 'text-mars-yellow border-mars-yellow bg-mars-yellow/10',
            'ECO': 'text-mars-green border-mars-green bg-mars-green/10',
            'MAT': 'text-amber-400 border-amber-400 bg-amber-400/10',
            'LEN': 'text-mars-magenta border-mars-magenta bg-mars-magenta/10',
            'ING': 'text-blue-400 border-blue-400 bg-blue-400/10'
        };

        const subjectNavButtons = [
            { id: 'ALL', label: `TODOS (${defs.length})` },
            { id: 'FYQ', label: 'FYQ (2)' },
            { id: 'LYE', label: 'LYE (6)' },
            { id: 'ECO', label: 'ECO (4)' },
            { id: 'MAT', label: 'MAT (4)' },
            { id: 'LEN', label: 'LEN (1)' },
            { id: 'ING', label: 'ING (2)' }
        ].map(btn => `
            <button onclick="ui.setCronogramaSubjectFilter('${btn.id}')" class="px-2.5 py-1 text-[8px] sm:text-[9px] font-bold uppercase transition-colors whitespace-nowrap ${activeSubj === btn.id ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'}">
                ${btn.label}
            </button>
        `).join('');

        const deadlineCardsHtml = filteredDefs.map(d => {
            const dateStr = deadlinesData[d.key] || d.defaultDate;
            const st = ui.getDeadlineStatus(dateStr);
            const isDelivered = !!co.deliverables[d.key];
            const sBadge = subjectColors[d.subject] || 'text-white border-white bg-white/10';

            const displayDate = dateStr.replace('T', ' ');

            return `
            <div class="terminal-border bg-slate-950 p-3 sm:p-4 border border-slate-800 flex flex-col justify-between hover:border-mars-cyan/60 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 border ${sBadge}">${d.subject} • ${d.weight}</span>
                        ${isDelivered 
                            ? `<span class="text-[8px] font-black uppercase text-mars-green bg-mars-green/10 border border-mars-green/50 px-1.5 py-0.5">✓ ENTREGADO</span>`
                            : `<span class="text-[8px] font-bold uppercase text-slate-500 bg-black px-1.5 py-0.5">PENDIENTE</span>`}
                    </div>
                    <h4 class="text-white font-bold text-[10px] sm:text-[11px] uppercase leading-snug mb-1">${d.name}</h4>
                    <span class="text-[8px] text-slate-400 block mb-2 uppercase font-mono">Resp: ${d.role.replace('_',' ')}</span>
                </div>
                <div>
                    <div class="flex justify-between items-center text-[9px] font-mono text-white mb-2 pt-2 border-t border-slate-900">
                        <span class="text-slate-400 text-[8px] uppercase">Límite:</span>
                        <span class="font-bold tracking-tight">${displayDate}</span>
                    </div>
                    <div class="w-full text-center py-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider ${st.class}">
                        ${st.text}
                    </div>
                </div>
            </div>`;
        }).join('');

        const cronogramaSection = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-mars-border pb-3">
                <div>
                    <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base uppercase tracking-tighter font-black">Cronograma Maestro de Entregas</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-0.5">Seguimiento oficial de los 19 entregables curriculares con semáforo temporal.</p>
                </div>
                ${isCEO ? `<button onclick="ui.modalCreateAuxRole()" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-3 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-mars-cyan hover:text-black transition-all shrink-0 w-full sm:w-auto">Gestionar Rol Observador</button>` : ''}
            </div>

            <!-- Filtros por Materia -->
            <div class="flex gap-1.5 overflow-x-auto scrollbar-hide pb-2 mb-4">
                ${subjectNavButtons}
            </div>

            <!-- Cuadrícula Responsiva de 19 Plazos -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${deadlineCardsHtml}
            </div>
        </div>`;

        // 3. BÓVEDA DE ÓRDENES Y AUTORIZACIÓN FINANCIERA (I+D Y MARKETING)
        let ordersListHtml = '';
        const allOrders = [...co.orders];

        if (allOrders.length === 0 && co.marketingCampaigns.length === 0) {
            ordersListHtml = `<div class="terminal-border border-dashed p-8 text-center text-slate-600 italic text-xs">No hay órdenes de I+D ni campañas de Marketing tramitadas.</div>`;
        } else {
            // Órdenes de Componentes I+D
            const idOrdersHtml = allOrders.map(order => {
                const st = order.status;
                const isPending = st === 'PENDIENTE_FINANZAS';
                const isApproved = st === 'APROBADO_FINANZAS';
                const isExecuted = st === 'EJECUTADO';
                const isRejected = st === 'RECHAZADO';

                let trackerIdx = 0;
                if (isApproved) trackerIdx = 1;
                if (isExecuted) trackerIdx = 2;

                let stBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                if (isApproved) stBadge = 'bg-blue-500/20 text-blue-400 border-blue-500';
                if (isExecuted) stBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                if (isRejected) stBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                let finActions = '';
                if (isFinanzas && isPending) {
                    finActions = `
                    <div class="flex gap-2 mt-4 pt-3 border-t border-slate-800">
                        <button onclick="ui.approveOrder('${order.id}')" class="bg-mars-green text-black px-4 py-2 text-[9px] font-black uppercase hover:bg-white transition-all flex-1">Aprobar Presupuesto</button>
                        <button onclick="ui.rejectOrder('${order.id}')" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 text-[9px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Rechazar</button>
                    </div>`;
                }

                return `
                <div class="bg-slate-900 border ${isPending ? 'border-mars-yellow/60' : 'border-mars-border'} p-4 text-[10px] mb-3">
                    ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], trackerIdx)}
                    <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                        <div>
                            <span class="text-[8px] font-black uppercase px-2 py-0.5 border ${stBadge}">${st}</span>
                            <h4 class="text-white font-orbitron font-bold uppercase text-xs mt-1">Orden #${order.id}</h4>
                        </div>
                        <div class="text-right">
                            <span class="text-mars-green font-mono font-bold text-sm">${Number(order.total).toFixed(2)} €v</span>
                            <span class="block text-[8px] text-slate-500 font-mono">${order.date}</span>
                        </div>
                    </div>
                    <p class="text-slate-300 italic mb-2">Justificación Técnica: "${order.justification || 'Sin justificación'}"</p>
                    <div class="space-y-1 mb-2 bg-black/60 p-2 border border-slate-800">
                        ${(order.items || []).map(it => `
                            <div class="flex justify-between text-[9px] text-slate-400">
                                <span>${it.name} (x${it.qty || 1})</span>
                                <span class="font-mono text-white">${Number(it.price).toFixed(2)} €v</span>
                            </div>
                        `).join('')}
                    </div>
                    ${finActions}
                </div>`;
            }).join('');

            // Solicitudes de Paquetes de Marketing pendientes de Finanzas
            const mktPendingHtml = co.marketingCampaigns.filter(c => c.status === 'PENDIENTE_FINANZAS').map(camp => `
                <div class="bg-slate-900 border border-mars-yellow p-4 text-[10px] mb-3">
                    <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2">
                        <div>
                            <span class="text-[8px] font-black uppercase px-2 py-0.5 border bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse">PENDIENTE FINANZAS</span>
                            <h4 class="text-white font-orbitron font-bold uppercase text-xs mt-1">Pack Marketing: ${camp.packageName}</h4>
                        </div>
                        <div class="text-right">
                            <span class="text-mars-green font-mono font-bold text-sm">${Number(camp.price).toFixed(2)} €v</span>
                            <span class="block text-[8px] text-slate-500 font-mono">${camp.date}</span>
                        </div>
                    </div>
                    <p class="text-slate-300 italic mb-1"><strong class="text-mars-cyan">Campaña:</strong> "${camp.title}"</p>
                    <p class="text-slate-400 italic mb-2"><strong class="text-mars-yellow">Justificación ROI:</strong> "${camp.desc}"</p>
                    ${isFinanzas ? `
                    <div class="flex gap-2 mt-3 pt-2 border-t border-slate-800">
                        <button onclick="ui.approveMktCamp('${camp.id}')" class="bg-mars-green text-black px-4 py-2 text-[9px] font-black uppercase hover:bg-white transition-all flex-1">Aprobar Paquete MKT</button>
                        <button onclick="ui.rejectMktCamp('${camp.id}')" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 text-[9px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Rechazar</button>
                    </div>` : `<p class="text-[8px] text-slate-500 uppercase italic">Esperando validación presupuestaria de Finanzas.</p>`}
                </div>
            `).join('');

            ordersListHtml = mktPendingHtml + idOrdersHtml;
        }

        const bovedaSection = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
            <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter font-black">Bóveda de Órdenes y Adquisiciones</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-0.5">Control de flujo presupuestario: Solicitud de I+D y Paquetes de Marketing.</p>
                </div>
            </div>
            <div class="space-y-3">
                ${ordersListHtml}
            </div>
        </div>`;

        wrapper.innerHTML = `
            ${crisisHtml}
            ${cronogramaSection}
            ${bovedaSection}
        `;
        el.appendChild(wrapper);
    },

    approveOrder(oid) {
        if (!state.user || state.user.role !== 'FINANZAS') return alert("Solo Finanzas puede aprobar órdenes.");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        if (co.balance < order.total) {
            return alert("Fondos virtuales insuficientes en el saldo corporativo para autorizar esta orden.");
        }

        order.status = 'APROBADO_FINANZAS';
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha APROBADO la orden #${order.id} (${order.total.toFixed(2)} €v). Ya está en Logística.`, 'success');
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nueva orden #${order.id} aprobada lista para ensamblaje físico.`, 'info');
        
        telemetry.log("ORDEN APROBADA", `Finanzas aprobó orden #${order.id} por ${order.total}€v`);
        state.save();
        alert(`✅ Orden #${order.id} aprobada. Pasa a Logística de Despliegue Físico.`);
        this.render();
    },

    rejectOrder(oid) {
        if (!state.user || state.user.role !== 'FINANZAS') return alert("Solo Finanzas puede rechazar órdenes.");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        order.status = 'RECHAZADO';
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha RECHAZADO la orden #${order.id}. Revisa justificación o presupuesto.`, 'error');
        
        telemetry.log("ORDEN RECHAZADA", `Finanzas rechazó orden #${order.id}`);
        state.save();
        alert(`❌ Orden #${order.id} rechazada.`);
        this.render();
    },

    approveMktCamp(campId) {
        if (!state.user || state.user.role !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'PENDIENTE_FINANZAS') return;

        const price = Number(camp.price) || 0;
        if (co.balance < price) return alert("Fondos virtuales insuficientes para contratar este paquete.");

        camp.status = 'ACTIVO';
        state.addToLedger(state.user.coId, `[PUBLICIDAD] Contratación de ${camp.packageName}`, 'MARKETING', -price);
        
        ui.pushNotification(state.user.coId, 'MARKETING', `Finanzas autorizó el paquete "${camp.packageName}". Ya puedes publicar tus ${camp.totalActions} acciones.`, 'success');
        telemetry.log("MKT APROBADO", `Aprobado ${camp.packageName} (-${price}€v)`);
        state.save();
        alert(`✅ Paquete publicitario activado y fondos descontados del Ledger.`);
        this.render();
    },

    rejectMktCamp(campId) {
        if (!state.user || state.user.role !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp) return;

        camp.status = 'DENEGADO';
        ui.pushNotification(state.user.coId, 'MARKETING', `Finanzas denegó la contratación del paquete "${camp.packageName}".`, 'error');
        telemetry.log("MKT RECHAZADO", `Denegado ${camp.packageName}`);
        state.save();
        alert(`❌ Solicitud de paquete de marketing rechazada.`);
        this.render();
    },

    modalCrisisAction() {
        if (!state.user || state.user.role !== 'CEO') return;
        const html = `
            <p class="text-[10px] text-slate-400 mb-3 leading-relaxed">Como CEO, redacta un Comunicado Oficial de Mitigación de Crisis dirigido a la Agencia Reguladora y a toda la startup.</p>
            <textarea id="crisis-response-text" placeholder="Explica las medidas correctivas que adoptará la startup para corregir la infracción y evitar nuevas sanciones..." class="w-full bg-slate-900 border border-red-500 p-3 text-xs text-white h-28 outline-none focus:border-red-400 mb-3"></textarea>
        `;
        const actions = `<button onclick="ui.submitCrisisAction()" class="bg-red-700 text-white font-black px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-white hover:text-red-700 transition-all border border-red-500">Publicar Comunicado</button>`;
        this.showModal("Gabinete de Crisis AEE (Dirección General)", html, actions);
    },

    submitCrisisAction() {
        if (!state.user || state.user.role !== 'CEO') return;
        const elText = document.getElementById('crisis-response-text');
        if (!elText) return;
        const text = elText.value.trim();
        if (text.length < 10) return alert("El comunicado de mitigación debe ser formal y detallado (mínimo 10 caracteres).");

        if (this.hasForbiddenWords(text, 'Comunicado Crisis CEO')) {
            return alert("⚠️ Filtro Léxico: Lenguaje no permitido en comunicado oficial.");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        (co.crisisAlerts || []).forEach(a => a.read = true);
        co.executiveResolutions = co.executiveResolutions || [];
        co.executiveResolutions.unshift({
            id: 'CRISIS-' + Date.now(),
            title: 'COMUNICADO OFICIAL DE MITIGACIÓN DE CRISIS',
            desc: text,
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, 'TECNICO', `El CEO ha emitido el Comunicado de Crisis AEE.`, 'warning');
        ui.pushNotification(state.user.coId, 'FINANZAS', `El CEO ha emitido el Comunicado de Crisis AEE.`, 'warning');
        ui.pushNotification(state.user.coId, 'MARKETING', `El CEO ha emitido el Comunicado de Crisis AEE.`, 'warning');

        telemetry.log("CRISIS", "Comunicado de mitigación emitido por CEO");
        state.save();
        this.closeModal();
        alert("✅ Comunicado Oficial de Crisis publicado y archivado.");
        this.render();
    },

    viewFinance(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        co.ledger = co.ledger || [];
        co.realCosts = co.realCosts || [];
        const docs = co.deliverables || {};

        const totalRealCost = co.realCosts.reduce((acc, c) => acc + (Number(c.eur) || 0), 0);
        const virtualSpend = co.ledger.filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);

        const wrapper = document.createElement('div');

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Balance, KPIs y Ledger Inmutable -->
            <div class="lg:col-span-7 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-green text-center">
                        <span class="text-[8px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Saldo Virtual Disponible</span>
                        <p class="text-2xl font-orbitron font-black text-mars-green">${Number(co.balance).toFixed(2)} €v</p>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-yellow text-center">
                        <span class="text-[8px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Gasto Virtual Acumulado</span>
                        <p class="text-2xl font-orbitron font-black text-mars-yellow">-${virtualSpend.toFixed(2)} €v</p>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-magenta text-center">
                        <span class="text-[8px] text-slate-400 uppercase font-bold tracking-widest block mb-1">Coste Real Físico (Taller)</span>
                        <p class="text-2xl font-orbitron font-black text-mars-magenta">${totalRealCost.toFixed(2)} €</p>
                    </div>
                </div>

                <!-- Ledger Inmutable -->
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Libro Mayor (Ledger Inmutable)</h3>
                            <p class="text-[8px] text-slate-400 uppercase mt-0.5">Asientos contables ordenados cronológicamente.</p>
                        </div>
                        <span class="text-[8px] bg-slate-800 text-slate-300 font-mono px-2 py-1">${co.ledger.length} Asientos</span>
                    </div>
                    <div class="max-h-80 overflow-y-auto pr-1">
                        <table class="w-full text-left text-[9px] font-mono whitespace-nowrap">
                            <thead class="text-slate-500 uppercase border-b border-slate-800">
                                <tr>
                                    <th class="py-1.5 pr-2">Fecha</th>
                                    <th class="pr-2">Concepto</th>
                                    <th class="pr-2">Dpto</th>
                                    <th class="text-right">Delta</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${co.ledger.map(entry => `
                                    <tr class="border-b border-slate-900/60 hover:bg-slate-900/40">
                                        <td class="py-2 pr-2 text-slate-400 text-[8px]">${entry.date}</td>
                                        <td class="py-2 pr-2 text-white font-bold truncate max-w-[180px]">${entry.concept}</td>
                                        <td class="py-2 pr-2 text-mars-cyan uppercase text-[8px]">${entry.dept}</td>
                                        <td class="py-2 text-right font-bold ${entry.delta >= 0 ? 'text-mars-green' : 'text-mars-magenta'}">
                                            ${entry.delta >= 0 ? '+' : ''}${Number(entry.delta).toFixed(2)} €v
                                        </td>
                                    </tr>
                                `).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-600 italic">No hay transacciones registradas.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Entregables Oficiales de Economía (Drive) -->
            <div class="lg:col-span-5 space-y-6">
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-green">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-green text-sm uppercase tracking-tighter">Entregables Oficiales: Economía (10%)</h3>
                            <p class="text-[8px] text-slate-400 uppercase mt-0.5">Resp: Departamento Financiero (Solo Enlaces Cloud).</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        ${this.renderDriveLinkBox('1. Presupuesto Inicial (20% ECO)', 'Presupuesto estimativo previo al inicio de pruebas. Hoja Sheets/Drive.', 'budgetInitial', docs.budgetInitial)}
                        ${this.renderDriveLinkBox('2. Cuenta de Resultados Provisional (20% ECO)', 'Registro de ingresos virtuales, gastos y balance de rentabilidad.', 'incomeStatement', docs.incomeStatement)}
                        ${this.renderDriveLinkBox('3. Presupuesto Post-Prototipo (20% ECO)', 'Ajuste presupuestario final tras los ensayos de lanzamiento.', 'budgetPostProto', docs.budgetPostProto)}
                        ${this.renderDriveLinkBox('4. Balance de Situación Simplificado (20% ECO)', 'Estructura patrimonial de la startup aeroespacial al cierre del proyecto.', 'balanceSheet', docs.balanceSheet)}
                    </div>
                </div>
            </div>
        </div>`;

        el.appendChild(wrapper);
    }
});