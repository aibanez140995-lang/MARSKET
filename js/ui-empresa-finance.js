// js/ui-empresa-finance.js
// --- MÓDULO FINANCIERO Y BÓVEDA DE ÓRDENES: CRONOGRAMA MAESTRO (17 ENTREGABLES), AUDITORÍA Y LEDGER (v1.1.34) ---

Object.assign(ui, {
    cronogramaFilter: 'ALL',

    viewApprovals(el) {
        return this.viewOrders(el);
    },

    setCronogramaSubjectFilter(subj) {
        this.cronogramaFilter = subj;
        this.render();
    },

    toggleCronograma() {
        this.cronogramaExpanded = !this.cronogramaExpanded;
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
        const isMarketing = state.user.role === 'MARKETING' || state.user.admin || state.user.isCoordinator;

        const wrapper = document.createElement('div');

        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const kpisHtml = `
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-green text-center">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Saldo Disponible</span>
                <p class="text-lg sm:text-xl font-orbitron font-black text-mars-green">${Number(co.balance).toFixed(2)} €v</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Fondos líquidos de tesorería</span>
            </div>
            <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-slate-500 text-center">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Coste Operativo Bruto</span>
                <p class="text-lg sm:text-xl font-orbitron font-black text-white">${grossCosts.toFixed(2)} €v</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Total compras y suministros</span>
            </div>
            <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-amber-400 text-center">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Reducción Patrocinio</span>
                <p class="text-lg sm:text-xl font-orbitron font-black text-amber-400">${sponsorAmt > 0 ? `-${sponsorAmt.toFixed(2)} €v` : '0.00 €v'}</p>
                <span class="text-[10px] text-amber-400/80 block mt-1 font-mono">${(sponsorAmt > 0 && sponsorTierLabel) ? `[${this.escapeHTML(sponsorTierLabel)}] Descuento aplicado` : 'Sin patrocinios activos'}</span>
            </div>
            <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan text-center">
                <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Coste Operativo Neto</span>
                <p class="text-lg sm:text-xl font-orbitron font-black text-mars-cyan">${netOpCosts.toFixed(2)} €v</p>
                <span class="text-[10px] text-slate-400 block mt-1 font-mono">Neto = Bruto - Patrocinios</span>
            </div>
        </div>`;

        // 1. BANNER DE GESTIÓN DE CRISIS (Si hay sanciones regulatorias AEE)
        let crisisHtml = '';
        const unreadCrisis = co.crisisAlerts.filter(a => !a.read);
        if (unreadCrisis.length > 0) {
            crisisHtml = `
            <div role="alert" class="terminal-border bg-red-950/50 p-4 sm:p-5 mb-6 border-l-4 border-l-red-600 shadow-[0_0_20px_rgba(255,0,0,0.3)]">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="bg-red-600 text-white text-xs font-black uppercase px-2.5 py-0.5 tracking-wider">ALERTA DISCIPLINARIA AEE</span>
                            <span class="text-xs text-slate-300">${this.escapeHTML(unreadCrisis[0].date)}</span>
                        </div>
                        <h3 class="font-orbitron text-red-400 text-sm sm:text-base font-bold uppercase mt-1.5">Expediente Sancionador: ${this.escapeHTML(unreadCrisis[0].article || 'Infracción Normativa')}</h3>
                        <p class="text-xs text-slate-200 italic mt-1 break-words">"${this.escapeHTML(unreadCrisis[0].reason)}"</p>
                        <p class="text-mars-magenta font-mono font-bold text-xs sm:text-sm mt-1">Penalización Económica: ${Number(unreadCrisis[0].amount).toFixed(2)} €v</p>
                    </div>
                    ${isCEO ? `<button type="button" onclick="ui.modalCrisisAction()" class="min-h-[44px] bg-red-700 text-white font-black px-4 py-2.5 text-xs uppercase tracking-wider hover:bg-white hover:text-red-700 transition-all border border-red-500 shadow-[0_0_10px_red] shrink-0 w-full sm:w-auto active:scale-95">[ 📢 Comunicar Sanción al Equipo ]</button>` : `<span class="text-xs text-mars-yellow font-bold uppercase flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-mars-yellow animate-ping"></span> Pendiente de comunicación por Dirección General (CEO)</span>`}
                </div>
            </div>`;
        }

        // 2. CRONOGRAMA MAESTRO DE ENTREGAS
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const visibleDefs = (!state.user?.admin) ? defs.filter(d => !ui.isDeliverableLocked(d.key, co)) : defs;
        const activeSubj = this.cronogramaFilter || 'ALL';
        const filteredDefs = activeSubj === 'ALL' ? visibleDefs : visibleDefs.filter(d => d.subject === activeSubj);

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
            { id: 'ALL', label: `TODOS (${visibleDefs.length})` },
            { id: 'FYQ', label: `FYQ (${visibleDefs.filter(d => d.subject === 'FYQ').length})` },
            { id: 'LYE', label: `LYE (${visibleDefs.filter(d => d.subject === 'LYE').length})` },
            { id: 'ECO', label: `ECO (${visibleDefs.filter(d => d.subject === 'ECO').length})` },
            { id: 'MAT', label: `MAT (${visibleDefs.filter(d => d.subject === 'MAT').length})` },
            { id: 'LEN', label: `LEN (${visibleDefs.filter(d => d.subject === 'LEN').length})` },
            { id: 'ING', label: `ING (${visibleDefs.filter(d => d.subject === 'ING').length})` }
        ].map(btn => `
            <button type="button" role="tab" aria-selected="${activeSubj === btn.id}" onclick="ui.setCronogramaSubjectFilter('${btn.id}')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors whitespace-nowrap ${activeSubj === btn.id ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">
                ${btn.label}
            </button>
        `).join('');

        const deadlineCardsHtml = filteredDefs.length === 0
            ? `<div class="col-span-full p-6 bg-slate-900/40 border border-slate-800 text-center rounded"><p class="text-xs font-mono text-slate-400 uppercase">🔒 No hay entregables activos en esta fase. Se habilitarán según el cronograma oficial.</p></div>`
            : filteredDefs.map(d => {
            const dateStr = deadlinesData[d.key] || d.defaultDate;
            const st = ui.getDeadlineStatus(dateStr);
            const docObj = co.deliverables[d.key];
            const isDelivered = !!docObj;
            const docStatus = docObj ? (docObj.status || 'DELIVERED_TO_TEACHER') : null;
            const sBadge = subjectColors[d.subject] || 'text-white border-white bg-white/10';

            let cronoBadge = '<span class="text-xs font-bold uppercase text-slate-300 bg-black border border-slate-700 px-2 py-0.5">⏳ PENDIENTE</span>';
            if (docStatus === 'EN_TALLER_OPERARIO') {
                cronoBadge = '<span class="text-xs font-black uppercase text-blue-400 bg-blue-900/30 border border-blue-500 px-2 py-0.5">⚙️ EN TALLER</span>';
            } else if (docStatus === 'SUBMITTED_TO_CEO') {
                cronoBadge = '<span class="text-xs font-black uppercase text-mars-yellow bg-mars-yellow/20 border border-mars-yellow px-2 py-0.5">🟡 EN REVISIÓN CEO</span>';
            } else if (docStatus === 'CEO_REVISION' || docStatus === 'DEVUELTO_A_TECNICO') {
                cronoBadge = '<span class="text-xs font-black uppercase text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2 py-0.5">🔴 REVISIÓN REQ.</span>';
            } else if (docStatus === 'DELIVERED_TO_TEACHER') {
                cronoBadge = '<span class="text-xs font-black uppercase text-mars-green bg-mars-green/20 border border-mars-green px-2 py-0.5">🟢 ENTREGADO</span>';
            }

            const displayDate = dateStr.replace('T', ' ');

            return `
            <div class="terminal-border bg-slate-950 p-3.5 sm:p-4 border border-slate-800 flex flex-col justify-between hover:border-mars-cyan/60 transition-all">
                <div>
                    <div class="flex justify-between items-center mb-2 flex-wrap gap-1.5">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${sBadge}">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                        ${cronoBadge}
                    </div>
                    <h4 class="text-white font-bold text-xs sm:text-sm uppercase leading-snug mb-1.5 break-words">${this.escapeHTML(d.name)}</h4>
                    <span class="text-xs text-slate-300 block mb-2.5 uppercase font-mono">Resp: ${this.escapeHTML(d.role.replace('_',' '))}</span>
                </div>
                <div>
                    <div class="flex justify-between items-center text-xs font-mono text-white mb-2 pt-2 border-t border-slate-800 gap-2">
                        <span class="text-slate-300 text-xs uppercase">Límite:</span>
                        <span class="font-bold tracking-tight">${this.escapeHTML(displayDate)}</span>
                    </div>
                    <div class="w-full text-center py-1.5 text-xs font-black uppercase tracking-wider ${st.class}">
                        ${this.escapeHTML(st.text)}
                    </div>
                </div>
            </div>`;
        }).join('');

        const cronogramaSection = `
        <details ${this.cronogramaExpanded ? 'open' : ''} ontoggle="ui.cronogramaExpanded = this.open" class="terminal-border bg-mars-card p-4 sm:p-5 mb-6 border-l-4 border-l-mars-cyan group">
            <summary class="cursor-pointer font-orbitron text-xs sm:text-sm text-mars-cyan uppercase tracking-wider font-bold select-none flex items-center justify-between min-h-[44px]">
                <span>📅 CRONOGRAMA MAESTRO DE ENTREGAS (${visibleDefs.length} HITOS)</span>
                <span class="text-xs text-slate-300 font-mono group-open:rotate-180 transition-transform">▼ Desplegar</span>
            </summary>
            <div class="mt-4 pt-3 border-t border-slate-800">
                ${isCEO ? `<div class="mb-4 flex justify-end"><button type="button" onclick="ui.modalCreateAuxRole()" class="min-h-[44px] bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-black uppercase tracking-wider hover:bg-mars-cyan hover:text-black transition-all shrink-0 w-full sm:w-auto">Gestionar Rol Observador</button></div>` : ''}
                <div role="tablist" aria-label="Filtrar entregables por asignatura" class="flex flex-wrap gap-2 pb-2 mb-4">
                    ${subjectNavButtons}
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    ${deadlineCardsHtml}
                </div>
            </div>
        </details>`;

        // 3. BÓVEDA DE ÓRDENES Y AUTORIZACIÓN FINANCIERA (I+D, MARKETING Y TALLER)
        const ordersTab = this.ordersFilterTab || 'EN_PROCESO';
        const deptFilter = this.ordersDeptFilter || 'ALL';
        const visibleLimit = this.ordersVisibleCount || 5;

        let allUnifiedItems = [];

        // 1. Órdenes de I+D (TECNICO)
        if (deptFilter === 'ALL' || deptFilter === 'TECNICO') {
            (co.orders || []).forEach(order => {
                const st = order.status;
                let matchesTab = false;
                if (ordersTab === 'EN_PROCESO') matchesTab = (st === 'PENDIENTE_FINANZAS' || st === 'APROBADO_FINANZAS');
                else if (ordersTab === 'COMPLETADAS') matchesTab = (st === 'EJECUTADO');
                else if (ordersTab === 'DENEGADAS') matchesTab = (st === 'RECHAZADO');

                if (matchesTab) {
                    const isPending = st === 'PENDIENTE_FINANZAS';
                    const isApproved = st === 'APROBADO_FINANZAS';
                    const isExecuted = st === 'EJECUTADO';
                    const isRejected = st === 'RECHAZADO';

                    let trackerIdx = 0;
                    if (isApproved) trackerIdx = 1;
                    if (isExecuted) trackerIdx = 2;

                    let stBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    if (isApproved) stBadge = 'bg-blue-500/20 text-blue-300 border-blue-500';
                    if (isExecuted) stBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (isRejected) stBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                    let finActions = '';
                    if (isFinanzas && isPending) {
                        finActions = `
                        <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ui.approveOrder('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1">Aprobar Presupuesto</button>
                            <button type="button" onclick="ui.rejectOrder('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Rechazar</button>
                        </div>`;
                    }

                    allUnifiedItems.push({
                        date: order.date || '',
                        timestamp: order.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${isPending ? 'border-mars-yellow/60' : 'border-mars-border'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-950 text-mars-cyan border border-mars-cyan/40">DEPTO: I+D (TÉCNICO)</span>
                            </div>
                            ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], trackerIdx)}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${stBadge}">${this.escapeHTML(st)}</span>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Orden #${this.escapeHTML(order.id)}</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-mars-green font-mono font-bold text-sm sm:text-base">${Number(order.total).toFixed(2)} €v</span>
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(order.date)}</span>
                                </div>
                            </div>
                            <div class="hidden sm:block mb-2">
                                ${(order.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(order.driveUrl))
                                    ? `<a href="${encodeURI(order.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Informe Técnico en Docs ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Memoria técnica legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                            <div class="hidden sm:block space-y-1.5 mb-2 bg-black/60 p-2.5 border border-slate-800">
                                ${(order.items || []).map(it => `
                                    <div class="flex justify-between text-xs text-slate-300 gap-2">
                                        <span class="break-words">${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                        <span class="font-mono text-white shrink-0">${Number(it.price).toFixed(2)} €v</span>
                                    </div>
                                `).join('')}
                            </div>
                            ${(st === 'EJECUTADO') ? `
                            <div class="mt-2.5 pt-2 border-t border-slate-800 bg-black/40 p-2.5 rounded text-xs space-y-1.5">
                                <div class="flex justify-between items-center text-[11px] font-bold text-mars-green uppercase">
                                    <span>📦 Imputación de Compra Real y Ensamble (Taller):</span>
                                    <span class="font-mono text-white">Coste Real Total: ${(order.items || []).reduce((s, it) => s + (Number(it.realEur) || 0), 0).toFixed(2)} €</span>
                                </div>
                                <div class="space-y-1">
                                    ${(order.items || []).map(it => `
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-1 border-b border-slate-900 pb-1 last:border-0 font-mono">
                                            <span class="text-white">${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                            <div class="flex items-center gap-2">
                                                <span>Real: <strong class="text-mars-yellow">${it.realEur !== undefined ? Number(it.realEur).toFixed(2) : '--'} €</strong></span>
                                                <span>Comercio: <strong class="text-slate-200">${this.escapeHTML(it.realShop || 'Comercio')}</strong></span>
                                                ${(it.ticketUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(it.ticketUrl))
                                                    ? `<a href="${encodeURI(it.ticketUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-mars-cyan hover:underline font-bold">[Ticket Drive ↗]</a>`
                                                    : ''
                                                }
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>` : ''}
                            <button type="button" onclick="ui.inspectOrderDrawer('${this.escapeHTML(co.id || state.user.coId)}', '${this.escapeHTML(order.id)}', false)" class="sm:hidden w-full min-h-[44px] bg-slate-950 border border-mars-cyan/60 text-mars-cyan font-black uppercase text-xs py-2 px-3 hover:bg-mars-cyan hover:text-black transition-all">[ 🔍 INSPECCIONAR ORDEN (${(order.items || []).length} partidas) ]</button>
                            ${isApproved ? '<p class="text-xs text-blue-400 font-mono mt-2 pt-2 border-t border-slate-800">📦 Orden en Logística de Taller: El Operario ejecuta la compra física real y el ensamble.</p>' : ''}
                            ${finActions}
                        </div>`
                    });
                }
            });
        }

        // 2. Paquetes de Campañas de Marketing (MARKETING)
        if (deptFilter === 'ALL' || deptFilter === 'MARKETING') {
            (co.marketingCampaigns || []).forEach(camp => {
                const cst = camp.status || 'PENDIENTE_FINANZAS';
                let matchesCampTab = false;
                if (ordersTab === 'EN_PROCESO') matchesCampTab = (cst === 'PENDIENTE_FINANZAS');
                else if (ordersTab === 'COMPLETADAS') matchesCampTab = (cst === 'ACTIVO' || cst === 'COMPLETADO');
                else if (ordersTab === 'DENEGADAS') matchesCampTab = (cst === 'RECHAZADO');

                if (matchesCampTab) {
                    const campPrice = !isNaN(Number(camp.price)) ? Number(camp.price) : (!isNaN(Number(camp.cost)) ? Number(camp.cost) : 0);
                    const campPkg = camp.packageName || camp.type || 'Campaña Publicitaria';
                    const campTitle = camp.title || camp.type || 'Acción Comercial';

                    let campBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    if (cst === 'ACTIVO' || cst === 'COMPLETADO') campBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (cst === 'RECHAZADO') campBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                    allUnifiedItems.push({
                        date: camp.date || '',
                        timestamp: camp.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${cst === 'PENDIENTE_FINANZAS' ? 'border-mars-yellow' : 'border-slate-800'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-950 text-mars-yellow border border-mars-yellow/40">DEPTO: MARKETING (PAQUETE)</span>
                            </div>
                            ${ui.renderWorkflowTracker(['1. Solicitud MKT', '2. Finanzas (Audita)', '3. Activo / Pack'], cst === 'PENDIENTE_FINANZAS' ? 0 : 2)}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${campBadge}">${this.escapeHTML(cst)}</span>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Pack Marketing: ${this.escapeHTML(campPkg)}</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-mars-green font-mono font-bold text-sm sm:text-base">${campPrice.toFixed(2)} €v</span>
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(camp.date || '--')}</span>
                                </div>
                            </div>
                            <p class="text-slate-200 italic mb-1 break-words"><strong class="text-mars-cyan">Campaña:</strong> "${this.escapeHTML(campTitle)}"</p>
                            <div class="hidden sm:block mb-2">
                                ${(camp.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(camp.driveUrl))
                                    ? `<a href="${encodeURI(camp.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Dossier ROI en Docs ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Justificación ROI legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                            <button type="button" onclick="ui.inspectMktCampDrawer('${this.escapeHTML(camp.id)}')" class="sm:hidden w-full min-h-[44px] mb-2 bg-slate-950 border border-mars-yellow/60 text-mars-yellow font-black uppercase text-xs py-2 px-3">[ 🔍 VER JUSTIFICACIÓN ROI ]</button>
                            ${(isFinanzas && cst === 'PENDIENTE_FINANZAS') ? `
                            <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
                                <button type="button" onclick="ui.approveMktCamp('${this.escapeHTML(camp.id)}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1">Aprobar Paquete MKT</button>
                                <button type="button" onclick="ui.rejectMktCamp('${this.escapeHTML(camp.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Rechazar</button>
                            </div>` : ''}
                        </div>`
                    });
                }

                // 2b. Acciones Individuales de Marketing (camp.executedActions)
                (camp.executedActions || []).forEach(act => {
                    const ast = act.status || 'PENDIENTE_CEO';
                    let matchesActTab = false;
                    if (ordersTab === 'EN_PROCESO') matchesActTab = (ast === 'PENDIENTE_CEO');
                    else if (ordersTab === 'COMPLETADAS') matchesActTab = (ast === 'VALIDADO_CEO');
                    else if (ordersTab === 'DENEGADAS') matchesActTab = (ast === 'RECHAZADO_CEO');

                    if (matchesActTab) {
                        let actBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                        if (ast === 'VALIDADO_CEO') actBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                        if (ast === 'RECHAZADO_CEO') actBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                        allUnifiedItems.push({
                            date: act.date || camp.date || '',
                            timestamp: act.timestamp || 0,
                            html: `
                            <div class="bg-slate-900 border ${ast === 'PENDIENTE_CEO' ? 'border-mars-yellow/80' : 'border-slate-800'} p-4 text-xs mb-3">
                                <div class="flex items-center gap-2 mb-2">
                                    <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-purple-950 text-mars-magenta border border-mars-magenta/40">DEPTO: MARKETING (ACCIÓN ESPECÍFICA)</span>
                                </div>
                                ${ui.renderWorkflowTracker(['1. Creatividad MKT', '2. CEO (Valida)', '3. Docente Liderazgo'], ast === 'PENDIENTE_CEO' ? 0 : 2)}
                                <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                    <div>
                                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${actBadge}">${this.escapeHTML(ast)}</span>
                                        <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Acción: ${this.escapeHTML(act.title || act.type || 'Campaña')}</h4>
                                        <span class="text-[11px] text-slate-400 font-mono">Pack Vinculado: ${this.escapeHTML(camp.packageName || camp.type || '')}</span>
                                    </div>
                                    <div class="text-right">
                                        <span class="text-xs text-slate-300 font-mono block">${this.escapeHTML(act.date || camp.date || '--')}</span>
                                    </div>
                                </div>
                                ${act.desc ? `<p class="text-slate-300 mb-2 leading-relaxed break-words">${this.escapeHTML(act.desc)}</p>` : ''}
                                ${(act.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(act.driveUrl))
                                    ? `<div class="mb-3"><a href="${encodeURI(act.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>📄 Ver Creatividad / Memoria en Docs ↗</span></a></div>`
                                    : ''
                                }
                                ${(ast === 'RECHAZADO_CEO') ? `
                                     <div class="bg-red-950/40 border border-red-500/40 p-2.5 text-xs text-red-300 mb-2 rounded space-y-1.5">
                                         <div><strong class="uppercase">Motivo Devolución CEO:</strong> ${this.escapeHTML(act.feedback || 'Revisión requerida por CEO')}</div>
                                         ${act.returnDriveUrl ? `<div><a href="${encodeURI(act.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white rounded transition-colors font-mono font-bold"><span>📄 Ver Correcciones del CEO en Drive ↗</span></a></div>` : ''}
                                     </div>` : ''}
                                 ${(isMarketing && ast === 'RECHAZADO_CEO') ? `
                                 <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
                                     <button type="button" onclick="ui.modalResubmitMktAction('${this.escapeHTML(camp.id)}', '${this.escapeHTML(act.id)}')" class="min-h-[44px] bg-mars-yellow text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all flex-1 shadow-sm">[ ✏️ Subsanar Enlace y Reenviar al CEO ]</button>
                                 </div>` : ''}
                                ${(isCEO && ast === 'PENDIENTE_CEO') ? `
                                <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
                                    <button type="button" onclick="ui.decideMktAction('${this.escapeHTML(camp.id)}', '${this.escapeHTML(act.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all flex-1 shadow-sm">[ ✓ APROBAR ACCIÓN ]</button>
                                    <button type="button" onclick="ui.modalRejectMktAction('${this.escapeHTML(camp.id)}', '${this.escapeHTML(act.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">[ ↩ DEVOLVER A MKT ]</button>
                                </div>` : ''}
                            </div>`
                        });
                    }
                });
            });
        }

        // 3. Hoja de Taller y Ensamble (OPERACIONES)
        if (deptFilter === 'ALL' || deptFilter === 'OPERACIONES') {
            const hoja = co.deliverables?.hoja_taller_fyq;
            if (hoja) {
                const hst = hoja.status || 'DRAFT_TECNICO';
                let matchesHojaTab = false;
                if (ordersTab === 'EN_PROCESO') matchesHojaTab = (hst === 'EN_TALLER_OPERARIO' || hst === 'SUBMITTED_TO_CEO');
                else if (ordersTab === 'COMPLETADAS') matchesHojaTab = (hst === 'DELIVERED_TO_TEACHER');
                else if (ordersTab === 'DENEGADAS') matchesHojaTab = (hst === 'CEO_REVISION' || hst === 'DEVUELTO_A_TECNICO');

                if (matchesHojaTab) {
                    let hojaBadge = 'bg-blue-500/20 text-blue-300 border-blue-500';
                    if (hst === 'SUBMITTED_TO_CEO') hojaBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    if (hst === 'DELIVERED_TO_TEACHER') hojaBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (hst === 'CEO_REVISION' || hst === 'DEVUELTO_A_TECNICO') hojaBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                    allUnifiedItems.push({
                        date: hoja.updatedAt || '',
                        timestamp: hoja.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${hst === 'SUBMITTED_TO_CEO' ? 'border-mars-yellow' : 'border-slate-800'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-blue-950 text-blue-300 border border-blue-500/40">DEPTO: TALLER / OPERACIONES</span>
                            </div>
                            ${ui.renderWorkflowTracker(['1. I+D (BOM)', '2. Taller (Montaje)', '3. CEO (Aval)', '4. Docente FyQ'], (hst === 'DELIVERED_TO_TEACHER' ? 3 : (hst === 'SUBMITTED_TO_CEO' || hst === 'CEO_REVISION' ? 2 : 1)))}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${hojaBadge}">${this.escapeHTML(hst)}</span>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Hoja de Taller y Ensamble (BOM)</h4>
                                </div>
                                <div class="text-right">
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(String(hoja.updatedAt || '').slice(0, 10))}</span>
                                </div>
                            </div>
                            ${hoja.driveUrl ? `<div class="mb-2"><a href="${encodeURI(hoja.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>📄 Ver Hoja de Taller en Docs ↗</span></a></div>` : ''}
                            ${(isCEO && hst === 'SUBMITTED_TO_CEO') ? `
                            <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
                                <button type="button" onclick="ui.approveDeliverableByCEO('hoja_taller_fyq')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1">[ ✓ VISAR HOJA TALLER ]</button>
                                <button type="button" onclick="ui.modalCeoReturnDeliverable('hoja_taller_fyq')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">[ ↩ DEVOLVER A TALLER ]</button>
                            </div>` : ''}
                        </div>`
                    });
                }
            }
        }

        const deptFilterButtons = [
            { id: 'ALL', label: 'TODOS' },
            { id: 'TECNICO', label: 'I+D (TÉCNICO)' },
            { id: 'MARKETING', label: 'MARKETING' },
            { id: 'OPERACIONES', label: 'TALLER' }
        ].map(b => `<button type="button" role="tab" aria-selected="${deptFilter === b.id}" onclick="ui.setOrdersDeptFilter('${b.id}')" class="min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${deptFilter === b.id ? 'bg-mars-yellow text-black' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">${b.label}</button>`).join('');

        const hiddenOrdersCount = Math.max(0, allUnifiedItems.length - visibleLimit);
        let ordersListHtml = allUnifiedItems.length === 0
            ? `<div class="terminal-border border-dashed p-6 text-center text-slate-300 italic text-xs uppercase">Sin órdenes ni acciones en esta vista para el filtro seleccionado.</div>`
            : allUnifiedItems.slice(0, visibleLimit).map(it => it.html).join('');
        if (hiddenOrdersCount > 0) {
            ordersListHtml += `<button type="button" onclick="ui.loadMoreOrders()" class="w-full min-h-[44px] bg-slate-950 border border-mars-cyan text-mars-cyan font-black uppercase text-xs py-2.5 px-4 tracking-widest hover:bg-mars-cyan hover:text-black transition-all">[ VER MÁS TELÉMETRO (+${hiddenOrdersCount}) ]</button>`;
        }

        const ordersTabsHtml = [
            { id: 'EN_PROCESO', label: 'En Proceso' },
            { id: 'COMPLETADAS', label: 'Completadas' },
            { id: 'DENEGADAS', label: 'Denegadas' }
        ].map(t => `<button type="button" role="tab" aria-selected="${ordersTab === t.id}" onclick="ui.setOrdersFilterTab('${t.id}')" class="min-h-[44px] flex-1 px-3 py-2 text-xs font-bold uppercase transition-colors ${ordersTab === t.id ? 'bg-mars-cyan text-black' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'}">${t.label}</button>`).join('');

        const bovedaSection = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter font-black">Bóveda de Órdenes y Adquisiciones</h3>
                    <p class="text-xs text-slate-300 uppercase mt-1">Supervisión integral de I+D, Campañas de Marketing y Taller de Ensamble.</p>
                </div>
            </div>
            <!-- Filtro de Estado -->
            <div role="tablist" aria-label="Filtrar órdenes por estado" class="flex gap-2 mb-3">
                ${ordersTabsHtml}
            </div>
            <!-- Filtro por Departamento -->
            <div role="tablist" aria-label="Filtrar por departamento" class="flex flex-wrap gap-2 mb-4 pb-2 border-b border-slate-800">
                ${deptFilterButtons}
            </div>
            <div class="space-y-3">
                ${ordersListHtml}
            </div>
        </div>`;

        wrapper.innerHTML = crisisHtml + kpisHtml + cronogramaSection + bovedaSection;
        el.appendChild(wrapper);
    },

    modalCheckout() {
        const existingUrl = document.getElementById('order-drive-url') ? document.getElementById('order-drive-url').value : (this._lastOrderDriveUrl || '');
        this._lastOrderDriveUrl = existingUrl;

        const co = state.data.companies[state.user.coId];
        if (!co || !co.cart || co.cart.length === 0) {
            return this.showModal("Carrito de la compra", "<p class='text-slate-300 text-xs sm:text-sm'>El carrito de la compra está vacío.</p>", "");
        }

        let total = 0;
        let html = `<div id="cart-modal-items" class="max-h-60 overflow-y-auto mb-4 border-b border-mars-border pb-2 space-y-2 pr-1">`;
        co.cart.forEach(item => {
            const sum = item.price * item.qty;
            total += sum;
            html += `
            <div data-cart-item="${this.escapeHTML(item.id)}" class="flex flex-wrap justify-between items-center gap-2 text-xs bg-black p-2.5 border border-slate-800 transition-all duration-300">
                <div class="flex-grow min-w-0">
                    <span class="text-mars-cyan font-bold uppercase block break-words">${this.escapeHTML(item.name)}</span>
                    <span class="text-slate-300 block">${Number(item.price).toFixed(2)} €v / ${this.escapeHTML(item.unit)}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button type="button" aria-label="Disminuir cantidad de ${this.escapeHTML(item.name)}" onclick="ui.removeFromCart('${this.escapeHTML(item.id)}')" class="min-h-[44px] min-w-[44px] border border-mars-magenta/50 text-mars-magenta font-black px-2 hover:bg-mars-magenta/20 flex items-center justify-center">-</button>
                    <span class="cart-item-qty text-white font-mono w-6 text-center font-bold">${Number(item.qty)}</span>
                    <button type="button" aria-label="Aumentar cantidad de ${this.escapeHTML(item.name)}" onclick="ui.addToCart('${this.escapeHTML(item.id)}'); ui.modalCheckout()" class="min-h-[44px] min-w-[44px] border border-mars-green/50 text-mars-green font-black px-2 hover:bg-mars-green/20 flex items-center justify-center">+</button>
                    <span class="cart-item-subtotal text-mars-green font-mono font-bold w-20 text-right">${sum.toFixed(2)} €v</span>
                </div>
            </div>`;
        });
        html += `</div>
        <div class="flex justify-between items-center bg-slate-900 p-3 mb-4 border border-mars-cyan">
            <span class="text-xs text-slate-300 uppercase font-bold">Presupuesto Estimado</span>
            <span id="cart-total-badge" class="text-lg font-orbitron font-black text-mars-cyan">${total.toFixed(2)} €v</span>
        </div>
        <div class="space-y-1.5 mb-2">
            <label for="order-drive-url" class="text-xs text-mars-cyan font-bold uppercase block">Informe Técnico de Especificación (Google Drive / Docs)</label>
            <div class="mb-2">
                ${this.renderDocTemplateBtn('DOC_9_ORDEN_ADQUISICION')}
            </div>
            <input type="url" id="order-drive-url" value="${this.escapeHTML(this._lastOrderDriveUrl || '')}" oninput="ui._lastOrderDriveUrl = this.value" placeholder="https://docs.google.com/document/d/..." class="w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono min-h-[44px]">
            <p class="text-[10px] text-slate-400">La justificación técnica de la compra se aloja en el Google Doc corporativo con permisos de lectura.</p>
        </div>
        `;
        
        const actions = `<button type="button" id="btn-transmit-cart" onclick="ui.confirmCart(${total})" class="min-h-[44px] bg-mars-cyan text-black px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all w-full sm:w-auto">Transmitir a Finanzas</button>`;
        this.showModal("Carrito de la compra (I+D)", html, actions);
    },

    confirmCart(total) {
        const elUrl = document.getElementById('order-drive-url');
        if (!elUrl) return;
        const driveUrl = this.cleanInput(elUrl.value);
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive del informe técnico.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return;

        co.orders = co.orders || [];
        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-4),
            items: JSON.parse(JSON.stringify(co.cart)),
            total: total,
            driveUrl: driveUrl,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString()
        };

        co.orders.unshift(newOrder);
        co.cart = [];
        this._lastOrderDriveUrl = '';
        
        ui.pushNotification(state.user.coId, 'FINANZAS', `Nueva orden #${newOrder.id} (${total.toFixed(2)} €v) recibida de I+D. Requiere validación urgente.`, 'warning');
        telemetry.log("ORDEN ENVIADA", `I+D generó orden #${newOrder.id}`);
        state.save();
        this.closeModal();
        this.notify(`✅ Orden #${newOrder.id} transmitida al Departamento Financiero.`, "success");
        this.render();
    },

    approveOrder(oid) {
        if (!state.user || state.user.role !== 'FINANZAS') return this.notify("Solo Finanzas puede aprobar órdenes.", "warning");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        if (co.balance < order.total) {
            return this.notify("Fondos virtuales insuficientes en el saldo corporativo para autorizar esta orden.", "error");
        }

        order.status = 'APROBADO_FINANZAS';
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha APROBADO la orden #${order.id} (${order.total.toFixed(2)} €v). Ya está en Logística.`, 'success');
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nueva orden #${order.id} aprobada lista para ensamblaje físico.`, 'info');
        
        telemetry.log("ORDEN APROBADA", `Finanzas aprobó orden #${order.id} por ${order.total}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`✅ Orden #${order.id} aprobada. Pasa a Logística de Despliegue Físico.`, "success");
        this.render();
    },

    rejectOrder(oid) {
        if (!state.user || state.user.role !== 'FINANZAS') return this.notify("Solo Finanzas puede rechazar órdenes.", "warning");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        order.status = 'RECHAZADO';
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha RECHAZADO la orden #${order.id}. Revisa justificación o presupuesto.`, 'error');
        
        telemetry.log("ORDEN RECHAZADA", `Finanzas rechazó orden #${order.id}`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`❌ Orden #${order.id} rechazada.`, "info");
        this.render();
    },

    approveMktCamp(campId) {
        if (!state.user || state.user.role !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'PENDIENTE_FINANZAS') return;

        const price = Number(camp.price) || 0;
        if (co.balance < price) return this.notify("Fondos virtuales insuficientes para contratar este paquete.", "error");

        camp.status = 'ACTIVO';
        state.addToLedger(state.user.coId, `[PUBLICIDAD] Contratación de ${camp.packageName}`, 'MARKETING', -price);
        
        ui.pushNotification(state.user.coId, 'MARKETING', `Finanzas autorizó el paquete "${camp.packageName}". Ya puedes publicar tus ${camp.totalActions} acciones.`, 'success');
        telemetry.log("MKT APROBADO", `Aprobado ${camp.packageName} (-${price}€v)`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`✅ Paquete publicitario activado y fondos descontados del Ledger.`, "success");
        this.render();
    },

    approveMktPackage(campId) {
        return this.approveMktCamp(campId);
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
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`❌ Solicitud de paquete de marketing rechazada.`, "info");
        this.render();
    },

    modalCrisisAction(crisisId) {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;
        const crisis = (co.crisisAlerts || []).find(a => String(a.id) === String(crisisId)) || (co.crisisAlerts || [])[0] || {};
        const expId = crisis.id || ('EXP-' + Date.now().toString().slice(-4));
        const articulo = crisis.article || 'Infracción Normativa Regulatoria';
        const motivo = crisis.reason || 'Sanción disciplinaria AEE';
        const cuantia = Number(crisis.amount || 0).toFixed(2);
        const immutableText = `COMUNICADO OFICIAL DE SANCIÓN AEE: Expediente ${expId} incoado por ${articulo}. Motivo: "${motivo}". Penalización aplicada al saldo: -${cuantia} €v.`;

        const templateBtn = this.renderDocTemplateBtn ? this.renderDocTemplateBtn('DOC_3_COMUNICADO_SANCION', '📄 Modelo de Comunicado de Crisis (Hacer copia)') : '';

        const html = `
            <div class="space-y-4">
                <p class="text-xs text-slate-300 leading-relaxed">
                    Resolución ejecutiva e inapelable de la Agencia Reguladora AEE. Como Dirección General (CEO), tu responsabilidad es acusar recibo e informar de oficio a todos los departamentos de la empresa para asumir el impacto financiero y ajustar la planificación operativa.
                </p>
                <div class="bg-black/80 border border-red-600/70 p-4 space-y-2">
                    <span class="text-xs font-mono font-black text-red-500 uppercase tracking-widest block">[REGISTRO DISCIPLINARIO EJECUTIVO]</span>
                    <p class="text-xs sm:text-sm font-mono text-white leading-relaxed select-all">${this.escapeHTML(immutableText)}</p>
                </div>
                <div class="bg-slate-950 border border-red-500/50 p-3.5 space-y-2">
                    <span class="text-xs font-mono font-bold text-mars-cyan uppercase tracking-wider block">1. Descarga / Copia de Plantilla Oficial:</span>
                    <div>
                        ${templateBtn}
                    </div>
                    <label for="crisis-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mt-3 mb-1">Enlace del Comunicado Oficial en Google Drive (Docs / Drive)</label>
                    <input type="url" id="crisis-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-red-500/60 p-2.5 text-xs text-white font-mono outline-none focus:border-red-400 mb-2" required>
                    <p class="text-[10px] text-slate-400 font-mono">Por directiva de gobernanza y política Zero-Text, debes redactar el comunicado en el modelo oficial de Google Docs y pegar aquí el enlace con permisos de lectura.</p>
                </div>
                <div class="bg-mars-card/60 border border-slate-700 p-3 text-xs text-slate-300 space-y-1">
                    <p class="font-bold text-mars-yellow uppercase">Efectos inmediatos en la empresa:</p>
                    <ul class="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                        <li>Detracción automática del saldo de tesorería: <strong class="text-red-400">-${cuantia} €v</strong>.</li>
                        <li>Notificación directa enviada a Técnico, Finanzas, Marketing y Operaciones con acceso directo al comunicado.</li>
                        <li>Registro inmutable archivado en el Libro de Resoluciones de Gobernanza.</li>
                    </ul>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.notifyDepartmentsCrisis('${this.escapeHTML(expId)}')" class="min-h-[44px] bg-red-700 text-white font-black px-6 py-2.5 text-xs uppercase tracking-wider hover:bg-white hover:text-red-700 transition-all border border-red-500 shadow-[0_0_10px_red] w-full sm:w-auto active:scale-95">📢 Informar y Difundir a Todos los Departamentos</button>`;
        this.showModal("Gabinete de Crisis AEE (Dirección General)", html, actions);
    },

    notifyDepartmentsCrisis(expId) {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const inputDrive = document.getElementById('crisis-drive-url');
        const driveUrl = inputDrive ? this.cleanInput(inputDrive.value) : '';
        if (!driveUrl || typeof GOOGLE_DRIVE_REGEX === 'undefined' || !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            if (this.highlightInvalidField && inputDrive) {
                this.highlightInvalidField('', inputDrive);
            }
            return this.notify("Debes adjuntar un enlace válido de Google Drive al Comunicado de Crisis.", "error");
        }

        const crisis = (co.crisisAlerts || []).find(a => String(a.id) === String(expId)) || (co.crisisAlerts || [])[0] || {};
        const expClean = expId || crisis.id || ('EXP-' + Date.now().toString().slice(-4));
        const articulo = crisis.article || 'Infracción Normativa Regulatoria';
        const motivo = crisis.reason || 'Sanción disciplinaria AEE';
        const cuantia = Number(crisis.amount || 0).toFixed(2);
        const immutableText = `COMUNICADO OFICIAL DE SANCIÓN AEE: Expediente ${expClean} incoado por ${articulo}. Motivo: "${motivo}". Penalización aplicada al saldo: -${cuantia} €v.`;

        (co.crisisAlerts || []).forEach(a => {
            if (!expClean || String(a.id) === String(expClean) || !a.id) {
                a.read = true;
                a.notified = true;
                a.notifiedBy = 'CEO';
                a.notifiedAt = Date.now();
                a.driveUrl = driveUrl;
            }
        });

        co.executiveResolutions = co.executiveResolutions || [];
        co.executiveResolutions.unshift({
            id: 'CRISIS-' + Date.now(),
            expId: expClean,
            title: 'COMUNICADO OFICIAL DE SANCIÓN AEE',
            crisisTitle: `COMUNICADO OFICIAL DE CRISIS // ${expClean}`,
            decision: immutableText,
            desc: immutableText,
            driveUrl: driveUrl,
            date: new Date().toLocaleString()
        });

        const targetMeta = { view: 'resolutions', anchorId: 'crisis-resolutions-panel' };
        ui.pushNotification(state.user.coId, 'TECNICO', immutableText, 'warning', targetMeta);
        ui.pushNotification(state.user.coId, 'FINANZAS', immutableText, 'warning', targetMeta);
        ui.pushNotification(state.user.coId, 'MARKETING', immutableText, 'warning', targetMeta);
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', immutableText, 'warning', targetMeta);

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CRISIS", `Expediente ${expClean} comunicado a departamentos por CEO`);
        }
        state.save();
        if (state.executeAction) {
            state.executeAction('GENERIC_PATCH', {
                executiveResolutions: co.executiveResolutions
            }).catch(e => console.warn("[ACTION] Error sincronizando executiveResolutions:", e));
        }
        this.closeModal();
        this.notify("✅ Sanción comunicada de oficio a todos los departamentos.", "success");
        this.render();
    },

    submitCrisisAction() {
        return this.notifyDepartmentsCrisis();
    },

    viewFinance(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const isCEO = state.user.role === 'CEO';
        co.ledger = co.ledger || [];
        co.realCosts = co.realCosts || [];
        const docs = co.deliverables || {};

        const totalRealCost = co.realCosts.reduce((acc, c) => acc + (Number(c.eur) || 0), 0);
        const virtualSpend = co.ledger.filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const maxVisibleLedger = 100;
        const visibleLedger = co.ledger.slice(0, maxVisibleLedger);

        const wrapper = document.createElement('div');

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Balance, KPIs y Ledger Inmutable -->
            <div class="lg:col-span-7 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-green text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Saldo Virtual</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-green">${Number(co.balance).toFixed(2)} €v</p>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Coste Neto</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-cyan">${netOpCosts.toFixed(2)} €v</p>
                        ${sponsorAmt > 0 ? `<span class="text-[10px] text-amber-400 font-mono block mt-0.5">(Bruto: ${grossCosts.toFixed(2)} | Patr: -${sponsorAmt.toFixed(2)}${sponsorTierLabel ? ` [${this.escapeHTML(sponsorTierLabel)}]` : ''})</span>` : ''}
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-yellow text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Gasto Acumulado</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-yellow">-${virtualSpend.toFixed(2)} €v</p>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-magenta text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Coste Real Físico</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-magenta">${totalRealCost.toFixed(2)} €</p>
                    </div>
                </div>

                <!-- Ledger Inmutable -->
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex flex-wrap justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Libro Mayor (Ledger Inmutable)</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Asientos contables ordenados cronológicamente.</p>
                        </div>
                        <span class="text-xs bg-slate-800 text-slate-200 font-mono px-2.5 py-1 border border-slate-700">${co.ledger.length} Asientos</span>
                    </div>
                    <div class="max-h-80 overflow-x-auto overflow-y-auto pr-1">
                        <table class="w-full text-left text-xs font-mono whitespace-nowrap min-w-max">
                            <thead class="text-slate-300 uppercase border-b border-slate-700 sticky top-0 bg-mars-card">
                                <tr>
                                    <th class="py-2 pr-3">Fecha</th>
                                    <th class="pr-3">Concepto</th>
                                    <th class="pr-3">Dpto</th>
                                    <th class="text-right">Delta</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${visibleLedger.map(entry => `
                                    <tr class="border-b border-slate-800/70 hover:bg-slate-900/50">
                                        <td class="py-2 pr-3 text-slate-300 text-xs">${this.escapeHTML(entry.date)}</td>
                                        <td class="py-2 pr-3 text-white font-bold max-w-[240px] truncate" title="${this.escapeHTML(entry.concept)}">${this.escapeHTML(entry.concept)}</td>
                                        <td class="py-2 pr-3 text-mars-cyan uppercase text-xs">${this.escapeHTML(entry.dept)}</td>
                                        <td class="py-2 text-right font-bold ${entry.delta >= 0 ? 'text-mars-green' : 'text-mars-magenta'}">
                                            ${entry.delta >= 0 ? '+' : ''}${Number(entry.delta).toFixed(2)} €v
                                        </td>
                                    </tr>
                                `).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-300 italic text-xs">No hay transacciones registradas.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    ${co.ledger.length > maxVisibleLedger ? `<p class="text-xs text-slate-300 uppercase font-mono mt-2 pt-2 border-t border-slate-800 text-center">Mostrando los ${visibleLedger.length} asientos más recientes de ${co.ledger.length} contabilizados.</p>` : ''}
                </div>
            </div>

            <!-- Columna Derecha: Entregables Oficiales o Auditoría Físico-Virtual -->
            ${isCEO ? `
            <div class="lg:col-span-5 space-y-6">
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Supervisión Contable & Auditoría</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Resp. de Entrega: Departamento Financiero.</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed mb-4">Los 4 entregables oficiales de Economía (Presupuestos, Cuenta de Resultados y Balance) son elaborados por Finanzas. Como CEO, supervisas y visas su calidad en el Dossier General.</p>
                    <button type="button" onclick="ui.navigate('dossier')" class="w-full min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs py-2.5 px-4 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm">
                        <span>📋 ACCEDER A SUPERVISIÓN EN DOSSIER (19)</span> ➔
                    </button>
                </div>

                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-magenta">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 flex-wrap gap-2">
                        <div>
                            <h3 class="font-orbitron text-mars-magenta text-sm uppercase tracking-tighter">Auditoría de Costes Reales (€)</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Tickets y facturas físicas vinculadas a Drive.</p>
                        </div>
                        <span class="text-xs font-mono font-bold text-mars-magenta bg-mars-magenta/10 border border-mars-magenta/40 px-2 py-0.5">${totalRealCost.toFixed(2)} € TOTAL</span>
                    </div>
                    <div class="max-h-72 overflow-x-auto overflow-y-auto pr-1">
                        <table class="w-full text-left text-xs font-mono whitespace-nowrap min-w-max">
                            <thead class="text-slate-300 uppercase border-b border-slate-700 sticky top-0 bg-mars-card">
                                <tr>
                                    <th class="py-2 pr-2">Fecha</th>
                                    <th class="pr-2">Componente</th>
                                    <th class="pr-2">Comercio</th>
                                    <th class="text-right pr-2">Coste (€)</th>
                                    <th class="text-right">Ticket</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${co.realCosts.map(rc => `
                                    <tr class="border-b border-slate-800/70 hover:bg-slate-900/50">
                                        <td class="py-1.5 pr-2 text-slate-300">${this.escapeHTML(rc.date || '--')}</td>
                                        <td class="py-1.5 pr-2 text-white font-bold max-w-[140px] truncate" title="${this.escapeHTML(rc.item || '')}">${this.escapeHTML(rc.item || '')} (x${rc.qty || 1})</td>
                                        <td class="py-1.5 pr-2 text-slate-300">${this.escapeHTML(rc.shop || '--')}</td>
                                        <td class="py-1.5 pr-2 text-right font-bold text-mars-magenta">${Number(rc.eur || 0).toFixed(2)} €</td>
                                        <td class="py-1.5 text-right">
                                            ${rc.ticketUrl ? `<a href="${encodeURI(rc.ticketUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-mars-cyan hover:underline font-bold inline-flex items-center gap-1"><span>Ver Ticket</span> ↗</a>` : '<span class="text-slate-400 italic">Sin ticket</span>'}
                                        </td>
                                    </tr>
                                `).join('') || `<tr><td colspan="5" class="text-center py-4 text-slate-400 italic text-xs">No hay costes reales físicos registrados por Operaciones.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            ` : `
            <div class="lg:col-span-5 space-y-6">
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-green">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-green text-sm uppercase tracking-tighter">Entregables Oficiales: Economía (10%)</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Resp: Departamento Financiero (Solo Enlaces Cloud).</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        ${(!state.user?.admin && ['budgetInitial', 'incomeStatement', 'budgetPostProto', 'balanceSheet'].every(k => ui.isDeliverableLocked(k, co))) ? `
                            <div class="p-6 bg-slate-900/40 border border-slate-800 text-center rounded">
                                <p class="text-xs font-mono text-slate-400 uppercase">🔒 No hay entregables activos en esta fase. Se habilitarán según el cronograma oficial.</p>
                            </div>
                        ` : `
                        ${this.renderDriveLinkBox('1. Presupuesto Inicial (20% ECO)', 'Presupuesto estimativo previo al inicio de pruebas. Hoja Sheets/Drive.', 'budgetInitial', docs.budgetInitial)}
                        ${this.renderDriveLinkBox('2. Cuenta de Resultados Provisional (20% ECO)', 'Registro de ingresos virtuales, gastos y balance de rentabilidad.', 'incomeStatement', docs.incomeStatement)}
                        ${this.renderDriveLinkBox('3. Presupuesto Post-Prototipo (20% ECO)', 'Ajuste presupuestario final tras los ensayos de lanzamiento.', 'budgetPostProto', docs.budgetPostProto)}
                        ${this.renderDriveLinkBox('4. Balance de Situación Simplificado (20% ECO)', 'Estructura patrimonial de la startup aeroespacial al cierre del proyecto.', 'balanceSheet', docs.balanceSheet)}
                        `}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-magenta">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 flex-wrap gap-2">
                        <div>
                            <h3 class="font-orbitron text-mars-magenta text-sm uppercase tracking-tighter">Auditoría de Costes Reales (€)</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Tickets y facturas físicas de compras en taller.</p>
                        </div>
                        <span class="text-xs font-mono font-bold text-mars-magenta bg-mars-magenta/10 border border-mars-magenta/40 px-2 py-0.5">${totalRealCost.toFixed(2)} € TOTAL</span>
                    </div>
                    <div class="max-h-72 overflow-x-auto overflow-y-auto pr-1">
                        <table class="w-full text-left text-xs font-mono whitespace-nowrap min-w-max">
                            <thead class="text-slate-300 uppercase border-b border-slate-700 sticky top-0 bg-mars-card">
                                <tr>
                                    <th class="py-2 pr-2">Fecha</th>
                                    <th class="pr-2">Componente</th>
                                    <th class="pr-2">Comercio</th>
                                    <th class="text-right pr-2">Coste (€)</th>
                                    <th class="text-right">Ticket</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${co.realCosts.map(rc => `
                                    <tr class="border-b border-slate-800/70 hover:bg-slate-900/50">
                                        <td class="py-1.5 pr-2 text-slate-300">${this.escapeHTML(rc.date || '--')}</td>
                                        <td class="py-1.5 pr-2 text-white font-bold max-w-[140px] truncate" title="${this.escapeHTML(rc.item || '')}">${this.escapeHTML(rc.item || '')} (x${rc.qty || 1})</td>
                                        <td class="py-1.5 pr-2 text-slate-300">${this.escapeHTML(rc.shop || '--')}</td>
                                        <td class="py-1.5 pr-2 text-right font-bold text-mars-magenta">${Number(rc.eur || 0).toFixed(2)} €</td>
                                        <td class="py-1.5 text-right">
                                            ${rc.ticketUrl ? `<a href="${encodeURI(rc.ticketUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-mars-cyan hover:underline font-bold inline-flex items-center gap-1"><span>Ver Ticket</span> ↗</a>` : '<span class="text-slate-400 italic">Sin ticket</span>'}
                                        </td>
                                    </tr>
                                `).join('') || `<tr><td colspan="5" class="text-center py-4 text-slate-400 italic text-xs">No hay costes reales físicos registrados por Operaciones.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            `}
        </div>`;

        el.appendChild(wrapper);
    }
});