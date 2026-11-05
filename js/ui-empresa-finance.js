// js/ui-empresa-finance.js
// --- MÓDULO FINANCIERO Y BÓVEDA DE ÓRDENES: CRONOGRAMA MAESTRO (17 ENTREGABLES), AUDITORÍA Y LEDGER (v1.1.34) ---

Object.assign(ui, {
    cronogramaFilter: 'ALL',

    viewApprovals(el) {
        return this.viewOrders(el);
    },

    viewOrdersTracking(el) {
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

        // 2. BÓVEDA DE ÓRDENES Y AUTORIZACIÓN FINANCIERA (I+D, MARKETING Y TALLER)
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
                                    <span>📦 Ejecución y Ensamble en Taller:</span>
                                    <span class="font-mono ${state.user.admin ? 'text-white' : 'text-mars-green'}">${state.user.admin ? `Coste Real Total: ${(order.items || []).reduce((s, it) => s + (Number(it.realEur) || 0), 0).toFixed(2)} €` : 'COMPRA FÍSICA EJECUTADA'}</span>
                                </div>
                                <div class="space-y-1">
                                    ${(order.items || []).map(it => `
                                        <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-1 border-b border-slate-900 pb-1 last:border-0 font-mono">
                                            <span class="text-white">${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                            <div class="flex items-center gap-2">
                                                ${state.user.admin ? `<span>Real: <strong class="text-mars-yellow">${it.realEur !== undefined ? Number(it.realEur).toFixed(2) : '--'} €</strong></span>` : ''}
                                                <span>Comercio: <strong class="text-slate-200">${this.escapeHTML(it.realShop || 'Comercio')}</strong></span>
                                                ${(state.user.admin && it.ticketUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(it.ticketUrl))
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

        // 1b. Propuestas y Ventas en Mercado B2B (I+D ➔ Finanzas ➔ Mercado)
        if (deptFilter === 'ALL' || deptFilter === 'TECNICO') {
            const b2bOffers = (state.data.b2bMarket || []).filter(o => o && o.sellerCoId === state.user.coId);
            b2bOffers.forEach(offer => {
                const ost = offer.status;
                let matchesB2BTab = false;
                if (ordersTab === 'EN_PROCESO') matchesB2BTab = (ost === 'PENDIENTE_FINANZAS' || ost === 'EN_VENTA');
                else if (ordersTab === 'COMPLETADAS') matchesB2BTab = (ost === 'VENDIDO');
                else if (ordersTab === 'DENEGADAS') matchesB2BTab = (ost === 'RECHAZADO_FINANZAS' || ost === 'RETIRADO');

                if (matchesB2BTab) {
                    const isPending = ost === 'PENDIENTE_FINANZAS';
                    const isEnVenta = ost === 'EN_VENTA';
                    const isSold = ost === 'VENDIDO';
                    const isRejected = ost === 'RECHAZADO_FINANZAS';
                    const isRetirado = ost === 'RETIRADO';

                    let trackerIdx = 0;
                    if (isPending) trackerIdx = 1;
                    else if (isEnVenta || isSold) trackerIdx = 2;

                    let b2bBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    let b2bStatusLabel = 'PROPUESTA DE VENTA B2B';
                    if (isEnVenta) {
                        b2bBadge = 'bg-cyan-500/20 text-cyan-300 border-cyan-500';
                        b2bStatusLabel = 'PUBLICADO EN MERCADO B2B';
                    } else if (isSold) {
                        b2bBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                        b2bStatusLabel = 'VENDIDO Y TRANSFERIDO';
                    } else if (isRejected) {
                        b2bBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';
                        b2bStatusLabel = 'DEVUELTO A I+D POR FINANZAS';
                    } else if (isRetirado) {
                        b2bBadge = 'bg-slate-800 text-slate-400 border-slate-700';
                        b2bStatusLabel = 'RETIRADO DEL MERCADO';
                    }

                    let finB2BActions = '';
                    if (isFinanzas && isPending) {
                        finB2BActions = `
                        <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ui.approveB2BSell('${this.escapeHTML(offer.id)}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1">Aprobar y Publicar B2B</button>
                            <button type="button" onclick="ui.modalRejectB2BSell('${this.escapeHTML(offer.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Rechazar / Proponer Precio</button>
                        </div>`;
                    } else if (isFinanzas && isEnVenta) {
                        finB2BActions = `
                        <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-800">
                            <button type="button" onclick="ui.withdrawB2BOffer('${this.escapeHTML(offer.id)}')" class="min-h-[44px] bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white px-4 py-2.5 text-xs font-bold uppercase transition-all flex-1">🗑️ Retirar Oferta del Mercado</button>
                        </div>`;
                    }

                    let reasonBlock = '';
                    if (isRejected && (offer.rejectReason || offer.suggestedPrice)) {
                        reasonBlock = `
                        <div class="bg-red-950/40 border border-red-500/40 p-2.5 text-xs text-red-300 mt-2 mb-2 rounded space-y-1">
                            <div><strong class="uppercase">Motivo Devolución Finanzas:</strong> ${this.escapeHTML(offer.rejectReason || 'Revisión de precio requerida')}</div>
                            ${offer.suggestedPrice ? `<div><strong class="uppercase">Precio Sugerido por Finanzas:</strong> ${Number(offer.suggestedPrice).toFixed(2)} €v</div>` : ''}
                        </div>`;
                    }

                    allUnifiedItems.push({
                        date: offer.date || '',
                        timestamp: offer.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${isPending ? 'border-mars-yellow/60' : 'border-mars-border'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-950 text-mars-yellow border border-mars-yellow/40">MERCADO B2B: DESINVERSIÓN I+D</span>
                            </div>
                            ${ui.renderWorkflowTracker(['1. Propuesta I+D', '2. Finanzas (Audita)', '3. Mercado B2B'], trackerIdx)}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${b2bBadge}">${b2bStatusLabel}</span>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Venta: ${this.escapeHTML(offer.itemName)} (x${Number(offer.qty) || 1})</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-mars-green font-mono font-bold text-sm sm:text-base">${Number(offer.price).toFixed(2)} €v</span>
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(offer.date || '--')}</span>
                                </div>
                            </div>
                            ${(offer.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(offer.driveUrl))
                                ? `<div class="mb-2"><a href="${encodeURI(offer.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Informe Técnico de Excedentes en Docs ↗</span></a></div>`
                                : ''
                            }
                            ${reasonBlock}
                            ${finB2BActions}
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
            ? `<div class="terminal-border bg-slate-950 p-6 my-2 text-center border-dashed border-mars-cyan/40">
                <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-mars-cyan/10 border border-mars-cyan/50 flex items-center justify-center text-xl">
                    📦
                </div>
                <h4 class="font-orbitron text-mars-cyan text-xs sm:text-sm font-bold uppercase tracking-wider mb-1.5">BÓVEDA DE ÓRDENES VACÍA</h4>
                <p class="text-xs text-slate-300 max-w-md mx-auto mb-4 leading-relaxed">No hay órdenes registradas con este filtro. Explora el SUPER-MARSKET o revisa las solicitudes de compras de los departamentos.</p>
                <div class="flex flex-wrap justify-center gap-2">
                    <button type="button" onclick="ui.navigate('market')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm">
                        🛒 Explorar SUPER-MARSKET
                    </button>
                    ${isFinanzas ? `
                    <button type="button" onclick="ui.navigate('finance')" class="min-h-[44px] px-4 py-2 bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all">
                        💰 Consultar Libro Mayor
                    </button>` : ''}
                </div>
            </div>`
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

        wrapper.innerHTML = crisisHtml + kpisHtml + bovedaSection;
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

    approveB2BSell(offerId) {
        if (!state.user || (state.user.role !== 'FINANZAS' && !state.user.admin)) {
            return this.notify("Solo el Departamento de Finanzas puede aprobar ventas B2B.", "warning");
        }
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        state.data.b2bMarket = state.data.b2bMarket || [];
        const offer = state.data.b2bMarket.find(o => o.id === offerId && o.sellerCoId === state.user.coId);
        if (!offer) return this.notify("Oferta B2B no localizada.", "error");

        offer.status = 'EN_VENTA';
        offer.updatedAt = Date.now();

        if (co.orders && offer.sourceOrderKey) {
            const [ordId, itemIdx] = offer.sourceOrderKey.split('-');
            const ord = co.orders.find(o => String(o.id) === String(ordId));
            if (ord && ord.items && ord.items[Number(itemIdx)]) {
                ord.items[Number(itemIdx)].b2bStatus = 'EN_VENTA';
            }
        }

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha aprobado y publicado en B2B: ${offer.itemName} por ${Number(offer.price).toFixed(2)} €v.`, 'success');
        telemetry.log("OFERTA B2B APROBADA", `Finanzas aprobó venta B2B: ${offer.itemName} por ${offer.price}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`✅ Oferta B2B de "${offer.itemName}" aprobada y publicada en el mercado.`, "success");
        this.render();
    },

    modalRejectB2BSell(offerId) {
        if (!state.user || (state.user.role !== 'FINANZAS' && !state.user.admin)) {
            return this.notify("Solo el Departamento de Finanzas puede gestionar ofertas B2B.", "warning");
        }
        const offer = (state.data.b2bMarket || []).find(o => o.id === offerId && o.sellerCoId === state.user.coId);
        if (!offer) return this.notify("Oferta B2B no localizada.", "error");

        const reasons = [
            "Precio propuesto no competitivo o alejado del mercado",
            "Margen de amortización insuficiente para la tesorería",
            "Estrategia de tesorería: conviene conservar la pieza en inventario",
            "Informe técnico o memoria de excedentes incompleta"
        ];

        const html = `
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Devolver la propuesta de venta de <strong>${this.escapeHTML(offer.itemName)}</strong> a I+D (Técnico) para su revisión.</p>
            <div class="space-y-3">
                <div>
                    <label for="b2b-reject-reason" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Motivo Tipificado de Devolución</label>
                    <select id="b2b-reject-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow text-xs text-white p-2.5 font-bold outline-none cursor-pointer">
                        ${reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="b2b-counter-price" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Contraoferta / Precio Sugerido por Finanzas (€v)</label>
                    <input type="number" id="b2b-counter-price" value="${Number(offer.price).toFixed(0)}" min="1" step="1" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold outline-none">
                    <p class="text-[10px] text-slate-400 mt-1">El Dpto. Técnico recibirá esta recomendación de precio para ajustar la propuesta.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRejectB2BSell('${this.escapeHTML(offerId)}')" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-black transition-all">Devolver Propuesta a Técnico</button>`;
        this.showModal("Devolver Propuesta B2B", html, actions);
    },

    confirmRejectB2BSell(offerId) {
        if (!state.user || (state.user.role !== 'FINANZAS' && !state.user.admin)) return;
        const elReason = document.getElementById('b2b-reject-reason');
        const elPrice = document.getElementById('b2b-counter-price');
        if (!elReason || !elPrice) return;

        const reason = this.cleanInput(elReason.value);
        const counterPrice = parseFloat(elPrice.value);
        if (isNaN(counterPrice) || counterPrice <= 0) return this.notify("Introduce un precio sugerido válido.", "warning");

        const co = state.data.companies[state.user.coId];
        if (!co) return;

        state.data.b2bMarket = state.data.b2bMarket || [];
        const offer = state.data.b2bMarket.find(o => o.id === offerId && o.sellerCoId === state.user.coId);
        if (!offer) return this.notify("Oferta B2B no localizada.", "error");

        offer.status = 'RECHAZADO_FINANZAS';
        offer.rejectReason = reason;
        offer.suggestedPrice = counterPrice;
        offer.updatedAt = Date.now();

        if (co.orders && offer.sourceOrderKey) {
            const [ordId, itemIdx] = offer.sourceOrderKey.split('-');
            const ord = co.orders.find(o => String(o.id) === String(ordId));
            if (ord && ord.items && ord.items[Number(itemIdx)]) {
                const it = ord.items[Number(itemIdx)];
                it.b2bStatus = 'RECHAZADO_FINANZAS';
                it.b2bRejectReason = reason;
                it.b2bSuggestedPrice = counterPrice;
            }
        }

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha devuelto la propuesta B2B de "${offer.itemName}". Precio sugerido: ${counterPrice.toFixed(2)} €v.`, 'warning');
        telemetry.log("PROPUESTA B2B RECHAZADA", `Finanzas devolvió venta B2B: ${offer.itemName}. Motivo: ${reason}. Sugerido: ${counterPrice}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.closeModal();
        this.notify(`↩ Propuesta devuelta a Técnico con precio sugerido de ${counterPrice.toFixed(2)} €v.`, "info");
        this.render();
    },

    withdrawB2BOffer(offerId) {
        if (!state.user || (state.user.role !== 'FINANZAS' && !state.user.admin)) {
            return this.notify("Solo el Departamento de Finanzas puede retirar ofertas del mercado B2B.", "warning");
        }
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        state.data.b2bMarket = state.data.b2bMarket || [];
        const offer = state.data.b2bMarket.find(o => o.id === offerId && o.sellerCoId === state.user.coId);
        if (!offer) return this.notify("Oferta no localizada.", "error");

        const b2bContracts = state.data.b2bContracts || [];
        const inCustoms = b2bContracts.find(c => 
            (c.offerId === offerId || (c.sourceOrderKey && offer.sourceOrderKey && c.sourceOrderKey === offer.sourceOrderKey)) && 
            (c.status === 'PENDIENTE_ADUANA' || c.status === 'APROBADO')
        );
        if (inCustoms) {
            return this.notify("No se puede retirar del mercado porque una startup ya ha adquirido este lote y está en trámite aduanero.", "error");
        }

        offer.status = 'RETIRADO';
        offer.updatedAt = Date.now();

        if (co.orders && offer.sourceOrderKey) {
            const [ordId, itemIdx] = offer.sourceOrderKey.split('-');
            const ord = co.orders.find(o => String(o.id) === String(ordId));
            if (ord && ord.items && ord.items[Number(itemIdx)]) {
                delete ord.items[Number(itemIdx)].b2bStatus;
                delete ord.items[Number(itemIdx)].b2bProposedPrice;
                delete ord.items[Number(itemIdx)].b2bSuggestedPrice;
                delete ord.items[Number(itemIdx)].b2bRejectReason;
            }
        }

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha retirado del mercado B2B: ${offer.itemName}. Devuelto al inventario de taller.`, 'info');
        telemetry.log("OFERTA B2B RETIRADA", `Finanzas retiró del mercado B2B: ${offer.itemName}`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.notify(`🗑️ Oferta de "${offer.itemName}" retirada del mercado. Pieza devuelta al taller.`, "success");
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
        const isFinanzas = state.user.role === 'FINANZAS';
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

        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [
            { phase: 'I', title: 'Balance de Cierre — Fase I', cutoffLabel: '15/12/2026', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'II', title: 'Balance de Cierre — Fase II', cutoffLabel: '15/02/2027', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'III', title: 'Balance de Cierre — Fase III', cutoffLabel: '31/03/2027', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'IV', title: 'Balance de Cierre — Fase IV', cutoffLabel: '23/04/2027', docKey: 'DOC_17_BALANCE_FASE' }
        ];
        co.phaseBalances = co.phaseBalances || {};

        const phaseBalancesCardsHtml = phaseDefs.map(p => {
            const b = co.phaseBalances[p.phase];
            return `
            <div class="p-3 bg-black/70 border border-slate-800 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-black uppercase text-amber-400 font-orbitron">${this.escapeHTML(p.title)}</span>
                        <span class="text-[10px] text-slate-400 font-mono">Corte: ${this.escapeHTML(p.cutoffLabel)}</span>
                    </div>
                    ${b ? `
                        <div class="mt-1 space-y-0.5">
                            <span class="inline-block text-[11px] text-emerald-300 font-semibold">✓ Dictamen: ${this.escapeHTML(b.verdict || 'Auditado')}</span>
                            <div class="text-[10px] text-slate-400 font-mono">
                                Saldo congelado: <span class="text-white font-bold">${Number(b.snapshot?.balance || 0).toFixed(2)} €v</span> | Gasto: <span class="text-mars-yellow font-bold">${Number(b.snapshot?.virtualSpend || 0).toFixed(2)} €v</span> (${this.escapeHTML(b.date || '')})
                            </div>
                        </div>
                    ` : `
                        <p class="text-[11px] text-slate-400 italic mt-0.5">Pendiente de cierre y entrega formal por el Dpto. Financiero.</p>
                    `}
                </div>
                <div class="shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                    ${b ? `
                        <a href="${encodeURI(b.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[36px] inline-flex items-center px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 rounded font-mono hover:bg-cyan-900/60 transition-colors">
                            <span>DOC_17 ↗</span>
                        </a>
                        ${(isFinanzas || isCEO) ? `
                            <button type="button" onclick="ui.modalRegisterPhaseBalance('${this.escapeHTML(p.phase)}')" class="min-h-[36px] bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-2 py-1 text-[11px] uppercase font-bold transition-all">
                                ✏️
                            </button>
                        ` : ''}
                    ` : `
                        ${(isFinanzas || isCEO) ? `
                            <button type="button" onclick="ui.modalRegisterPhaseBalance('${this.escapeHTML(p.phase)}')" class="min-h-[36px] bg-amber-400 text-black font-black uppercase text-[11px] px-3 py-1 hover:bg-white transition-all shadow-sm w-full sm:w-auto">
                                [ + Registrar Balance Fase ${this.escapeHTML(p.phase)} ]
                            </button>
                        ` : `
                            <span class="text-[10px] text-slate-500 font-mono uppercase">En espera</span>
                        `}
                    `}
                </div>
            </div>`;
        }).join('');

        const phaseBalancesBlockHtml = `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400">
            <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-amber-400 text-sm uppercase tracking-tighter font-black">📊 Balances de Cierre de Fase (DOC_17)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Control de tesorería y dictamen contable al final de cada fase.</p>
                </div>
                <span class="text-xs bg-amber-950/40 text-amber-300 font-mono px-2 py-0.5 border border-amber-500/40">
                    ${Object.keys(co.phaseBalances || {}).length}/4 Fases
                </span>
            </div>
            <div class="space-y-2.5">
                ${phaseBalancesCardsHtml}
            </div>
        </div>`;

        const debtAlertHtml = co.balance < 0 ? `
        <div class="terminal-border bg-red-950/40 border-2 border-red-500/80 p-4 mb-6 text-red-200 shadow-[0_0_15px_rgba(255,0,0,0.2)] animate-pulse">
            <div class="flex items-center gap-3">
                <span class="text-2xl">🚨</span>
                <div>
                    <h4 class="font-orbitron font-bold text-red-400 text-xs sm:text-sm uppercase tracking-wide">DESCUBIERTO EN TESORERÍA // DEUDA CORPORATIVA VIRTUAL</h4>
                    <p class="text-xs text-red-200 mt-0.5">La startup presenta un saldo contable negativo de <strong class="text-white font-mono">${Number(co.balance).toFixed(2)} €v</strong> debido a penalizaciones de contratos comerciales o compromisos financieros no cubiertos. Computa como pasivo exigible en el Balance de Situación.</p>
                </div>
            </div>
        </div>` : '';

        wrapper.innerHTML = `
        ${debtAlertHtml}
        ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Balance, KPIs y Ledger Inmutable -->
            <div class="lg:col-span-7 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="terminal-border bg-mars-card p-4 border-t-2 ${co.balance < 0 ? 'border-t-rose-500' : 'border-t-mars-green'} text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">${co.balance < 0 ? 'Deuda Virtual' : 'Saldo Virtual'}</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black ${co.balance < 0 ? 'text-rose-400 animate-pulse' : 'text-mars-green'}">${Number(co.balance).toFixed(2)} €v</p>
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

            <!-- Columna Derecha: Balances de Cierre de Fase & Entregables Oficiales -->
            <div class="lg:col-span-5 space-y-6">
                ${phaseBalancesBlockHtml}
                ${isCEO ? `
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Supervisión Contable & Auditoría</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Resp. de Entrega: Departamento Financiero.</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed mb-4">Los 4 entregables oficiales de Economía (Presupuestos, Cuenta de Resultados y Balance) son elaborados por Finanzas. Como CEO, supervisas y visas su calidad en el Dossier General.</p>
                    <button type="button" onclick="ui.navigate('dossier')" class="w-full min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs py-2.5 px-4 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm">
                        <span>📋 ACCEDER A SUPERVISIÓN EN DOSSIER</span> ➔
                    </button>
                </div>
                ` : `
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-green">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2">
                        <div>
                            <h3 class="font-orbitron text-mars-green text-sm uppercase tracking-tighter">Entregables Oficiales: Economía (10%)</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Resp: Departamento Financiero.</p>
                        </div>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed mb-4">Los 4 hitos contables de la startup (Presupuesto Inicial, Cuenta de Resultados, Presupuesto Post-Prototipo y Balance) se gestionan con flujo guiado y control de versiones en <strong>Mis Entregables</strong>.</p>
                    <button type="button" onclick="ui.navigate('role_deliverables')" class="w-full min-h-[44px] bg-mars-green text-black font-black uppercase text-xs py-2.5 px-4 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm">
                        <span>📤 GESTIONAR ENTREGABLES EN "MIS ENTREGABLES"</span> ➔
                    </button>
                </div>
                `}
            </div>
        </div>`;

        el.appendChild(wrapper);
    },

    modalRegisterPhaseBalance(phaseKey) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [
            { phase: 'I', title: 'Balance de Cierre — Fase I', cutoffLabel: '15/12/2026', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'II', title: 'Balance de Cierre — Fase II', cutoffLabel: '15/02/2027', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'III', title: 'Balance de Cierre — Fase III', cutoffLabel: '31/03/2027', docKey: 'DOC_17_BALANCE_FASE' },
            { phase: 'IV', title: 'Balance de Cierre — Fase IV', cutoffLabel: '23/04/2027', docKey: 'DOC_17_BALANCE_FASE' }
        ];
        const phaseDef = phaseDefs.find(p => p.phase === phaseKey) || phaseDefs[0];

        const verdicts = typeof FINANCIAL_AUDIT_VERDICTS_DEF !== 'undefined' ? FINANCIAL_AUDIT_VERDICTS_DEF : [
            { id: 'SUPERAVIT_ESTABLE', label: 'Superávit Financiero y Tesorería Estable' },
            { id: 'EQUILIBRIO_PRESUPUESTARIO', label: 'Equilibrio Presupuestario según Previsiones' },
            { id: 'DEFICIT_CONTROLADO', label: 'Déficit Controlado por Inversión en I+D/Materiales' },
            { id: 'REAJUSTE_GASTOS', label: 'Reajuste Operativo Necesario para Próxima Fase' },
            { id: 'AUDITORIA_CONFORME', label: 'Auditoría Interna Conforme sin Desviaciones Significativas' }
        ];
        const verdictOptions = verdicts.map(v => `<option value="${this.escapeHTML(v.label)}">${this.escapeHTML(v.label)}</option>`).join('');

        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const virtualSpend = (co.ledger || []).filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);

        const currentBalanceObj = co.phaseBalances && co.phaseBalances[phaseDef.phase] ? co.phaseBalances[phaseDef.phase] : null;

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-cyan-950/40 border border-cyan-500/40 text-slate-200 space-y-1">
                    <p class="text-cyan-400 font-bold uppercase">📊 ${this.escapeHTML(phaseDef.title)}</p>
                    <p class="font-sans text-[11px] leading-relaxed">
                        Cierre contable oficial para la <strong>${this.escapeHTML(phaseDef.phaseName || `Fase ${phaseDef.phase}`)}</strong> (Fecha de corte: <strong>${this.escapeHTML(phaseDef.cutoffLabel)}</strong>). Congela la situación financiera de la startup y adjunta el balance oficial en Google Drive.
                    </p>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-black/60 border border-slate-800 text-center">
                    <div>
                        <span class="text-[10px] text-slate-400 uppercase block">Saldo Disponible</span>
                        <span class="text-xs sm:text-sm font-bold text-mars-green font-mono">${Number(co.balance).toFixed(2)} €v</span>
                    </div>
                    <div>
                        <span class="text-[10px] text-slate-400 uppercase block">Coste Neto</span>
                        <span class="text-xs sm:text-sm font-bold text-mars-cyan font-mono">${netOpCosts.toFixed(2)} €v</span>
                    </div>
                    <div class="col-span-2 sm:col-span-1">
                        <span class="text-[10px] text-slate-400 uppercase block">Gasto Acumulado</span>
                        <span class="text-xs sm:text-sm font-bold text-mars-yellow font-mono">-${virtualSpend.toFixed(2)} €v</span>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="phase-balance-verdict" class="text-mars-yellow uppercase font-bold block mb-1">Dictamen Contable y Diagnóstico de Tesorería</label>
                    <select id="phase-balance-verdict" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-mars-yellow">
                        ${verdictOptions}
                    </select>
                </div>

                <div class="space-y-1.5">
                    <span class="text-mars-yellow uppercase font-bold block mb-1">Plantilla Oficial de Balance de Cierre (DOC_17)</span>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_17_BALANCE_FASE', '📄 Ver Plantilla Balance de Fase (DOC_17)')}
                    </div>
                    <label for="phase-balance-drive-url" class="text-mars-cyan uppercase font-bold block mb-1">Enlace al Balance Oficial en Google Drive o Docs</label>
                    <input type="url" id="phase-balance-drive-url" value="${this.escapeAttr(currentBalanceObj?.driveUrl || '')}" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">El documento debe compartirse con permisos de lectura abiertos ("Cualquiera con el enlace puede ver").</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitPhaseBalance('${this.escapeHTML(phaseDef.phase)}')" class="min-h-[44px] w-full sm:w-auto bg-amber-400 text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.3)]">[ 📊 Registrar Balance Oficial Fase ${this.escapeHTML(phaseDef.phase)} ]</button>`;
        this.showModal(`Cierre Contable — ${phaseDef.title}`, html, actions);
    },

    submitPhaseBalance(phaseKey) {
        if (!state.user) return;
        const elVerdict = document.getElementById('phase-balance-verdict');
        const elUrl = document.getElementById('phase-balance-drive-url');
        if (!elVerdict || !elUrl) return;

        const verdict = this.cleanInput(elVerdict.value).trim();
        const driveUrl = this.cleanInput(elUrl.value).trim();

        if (!verdict) return this.notify("Debes seleccionar el dictamen contable.", "warning");
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive del balance oficial.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const virtualSpend = (co.ledger || []).filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);

        co.phaseBalances = co.phaseBalances || {};
        co.phaseBalances[phaseKey] = {
            id: 'BAL-' + coId + '-' + phaseKey,
            phase: phaseKey,
            verdict: verdict,
            driveUrl: driveUrl,
            snapshot: {
                balance: Number(co.balance) || 0,
                grossCosts: Number(grossCosts) || 0,
                sponsorReduction: Number(sponsorAmt) || 0,
                virtualSpend: Number(virtualSpend) || 0
            },
            authorRole: state.user.role,
            authorName: state.user.name || 'Finanzas',
            date: new Date().toLocaleDateString(),
            timestamp: Date.now()
        };
        co.updatedAt = Date.now();

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification(coId, 'CEO', `📊 Finanzas ha registrado el Balance de Cierre de la Fase ${phaseKey} ("${verdict}"). Listo para la Nota de Prensa.`, 'info');
        ui.pushNotification(coId, 'ALL', `📊 Balance Contable de Cierre de la Fase ${phaseKey} formalizado en tesorería.`, 'info');
        ui.pushNotification('ADMIN', 'ALL', `📊 [${co.name}] Balance Contable Fase ${phaseKey} registrado por Finanzas.`, 'info');

        this.closeModal();
        this.notify(`✅ Balance Contable de Cierre de Fase ${phaseKey} registrado con éxito.`, "success");
        this.render();
    }
});