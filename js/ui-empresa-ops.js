// js/ui-empresa-ops.js
// --- MÓDULO OPERACIONES E IA: LOGÍSTICA FÍSICA, BITÁCORA IA Y DIARIO DE DECISIONES (v1.1.44) ---

Object.assign(ui, {
    modalLogAI() {
        return this.modalReportAI();
    },

    applyShopToOrder(orderId, shopName) {
        if (!orderId || !shopName) return;
        const selects = document.querySelectorAll(`[id^="real-shop-${CSS.escape(String(orderId))}-"]`);
        selects.forEach(sel => {
            sel.value = shopName;
        });
    },

    viewCart(el) {
        if (!el || !state.user) return; 
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); 
        
        co.orders = co.orders || []; 
        const isOperario = (this.getEffectiveRole(co) === 'OPERACIONES_IA' || Boolean(state.user.admin));
        
        const allOrders = co.orders || [];
        const approvedOrders = allOrders.filter(o => o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE');

        const wrapper = document.createElement('div');

        let ordersTabContentHtml = '';

        if (approvedOrders.length > 0) {
            ordersTabContentHtml = approvedOrders.map(order => {
                const isB2B = order.type === 'B2B_BUY_REQUEST' || !!order.offerId;
                const tracker = isB2B
                    ? ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Aduana Docente', 'Taller (Ejecuta)'], 3)
                    : ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], 1);
                const statusBadge = isB2B
                    ? `<span class="text-xs font-bold uppercase text-mars-cyan bg-cyan-950/60 border border-cyan-500/50 px-2.5 py-1 tracking-wider">[AUTORIZADO POR ADUANA DOCENTE]</span>`
                    : `<span class="text-xs font-bold uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-2.5 py-1 tracking-wider">[APROBADO POR FINANZAS]</span>`;
                const itemsArr = Array.isArray(order.items) ? order.items : [];
                const doneCount = itemsArr.filter(it => it && it.executed).length;
                const pendingItemsCount = itemsArr.length - doneCount;
                const remainingEurV = itemsArr.reduce((s, it) => (it && !it.executed) ? s + (Number(it.price) || 0) * (Number(it.qty) || 1) : s, 0);

                return `
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 ${isB2B ? 'border-l-mars-cyan' : 'border-l-mars-green'} mb-6 w-full">
                    ${tracker}
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2 mt-4">
                        <div class="flex flex-wrap items-center gap-2">
                            ${statusBadge}
                            ${doneCount > 0 ? `<span class="text-[11px] font-mono font-bold uppercase text-amber-300 bg-amber-950/50 border border-amber-500/60 px-2 py-0.5 rounded">🟡 Recepción Parcial (${doneCount}/${itemsArr.length})</span>` : ''}
                            <h3 class="text-white font-orbitron w-full mt-1 uppercase text-sm sm:text-base font-bold">${isB2B ? 'ORDEN B2B #' : 'ORDEN #'}${this.escapeHTML(order.id)}</h3>
                        </div>
                        <div class="text-left sm:text-right">
                            <p class="text-mars-green font-black font-mono text-xl">${remainingEurV.toFixed(2)} €v ${doneCount > 0 ? '<span class="text-xs text-amber-300 font-normal">pendiente</span>' : ''}</p>
                            ${doneCount > 0 ? `<p class="text-[11px] text-slate-400 font-mono">Total aprobado: ${Number(order.total).toFixed(2)} €v</p>` : ''}
                            <p class="text-xs text-slate-300 uppercase">${this.escapeHTML(order.date)}</p>
                        </div>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                        <p class="text-xs text-mars-yellow uppercase font-bold">${isB2B ? 'Registra la recepción física de la pieza B2B de segunda mano en taller:' : 'Registra el coste real físico (€) y el comercio oficial de adquisición (desmarca si algún componente aún no se ha comprado):'}</p>
                        ${(!isB2B && isOperario && pendingItemsCount >= 2) ? `
                            <div class="flex items-center gap-2 w-full sm:w-auto">
                                <label for="master-shop-${this.escapeHTML(order.id)}" class="text-[11px] font-mono text-mars-cyan uppercase whitespace-nowrap">Comercio común:</label>
                                <select id="master-shop-${this.escapeHTML(order.id)}" onchange="ui.applyShopToOrder('${this.escapeAttr(order.id)}', this.value)" class="min-h-[44px] flex-1 sm:w-44 bg-black border border-mars-cyan/60 p-2 text-base sm:text-xs text-white outline-none focus:border-mars-cyan">
                                    <option value="">Aplicar a toda la orden...</option>
                                    ${(typeof COMMERCIAL_SHOPS_DEF !== 'undefined' ? COMMERCIAL_SHOPS_DEF : [
                                        { id: 'mercadona', name: 'Mercadona' },
                                        { id: 'carrefour', name: 'Carrefour' },
                                        { id: 'eroski', name: 'Eroski' },
                                        { id: 'dia', name: 'Dia' },
                                        { id: 'ferreteria', name: 'Ferretería' },
                                        { id: 'bazar', name: 'Bazar' },
                                        { id: 'comercio_generico', name: 'Comercio genérico' }
                                    ]).map(shop => `<option value="${this.escapeHTML(shop.name)}">${this.escapeHTML(shop.name)}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}
                    </div>
                    <div class="space-y-3 mb-6">
                        ${itemsArr.map((item, idx) => {
                            if (item && item.executed) {
                                return `
                                <div class="border border-emerald-500/40 bg-emerald-950/20 p-3 mb-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3 opacity-80">
                                    <div class="flex-grow min-w-0">
                                        <span class="text-xs text-emerald-300 font-bold break-words">✓ ${this.escapeHTML(item.name)} (x${Number(item.qty)||1}) — ${((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)} €v</span>
                                        <p class="text-[11px] text-emerald-400/90 font-mono mt-0.5">Ya comprado y enviado al Taller de I+D · Comercio: ${this.escapeHTML(item.realShop || 'Comercio')}</p>
                                    </div>
                                    <span class="text-[10px] font-mono uppercase px-2 py-1 bg-emerald-950 border border-emerald-500/50 text-emerald-300 rounded shrink-0">✓ Recepcionada</span>
                                </div>`;
                            }
                            return `
                            <div class="border border-slate-800 bg-slate-900/90 p-3 mb-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                                <div class="flex-grow min-w-0">
                                    <label class="mars-checkbox-label flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer min-h-[44px]">
                                        <input type="checkbox" id="assembled-${this.escapeHTML(order.id)}-${idx}" class="mars-touch-input" checked ${isOperario ? '' : 'disabled'}>
                                        <span class="mars-checkbox-visual"></span>
                                        <span class="break-words">${this.escapeHTML(item.name)} (x${Number(item.qty)||1}) - <span class="text-mars-cyan font-mono">${((Number(item.price) || 0) * (Number(item.qty) || 1)).toFixed(2)} €v</span>${(Number(item.qty) || 1) > 1 ? ` <span class="text-[11px] text-slate-400 font-mono">(${Number(item.price).toFixed(2)} c/u)</span>` : ''}</span>
                                    </label>
                                    <p class="text-[11px] text-slate-300 font-sans mt-0.5 ml-7">${isB2B ? 'Pieza adquirida en mercado secundario B2B (coste en € = 0.00)' : 'Registra el precio real pagado en comercio (> 0.00 €), aunque el material se haya traído de casa.'}</p>
                                </div>
                                <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                    <input type="number" inputmode="decimal" id="real-eur-${this.escapeHTML(order.id)}-${idx}" aria-label="Coste real en euros de ${this.escapeHTML(item.name)}" placeholder="${isB2B ? 'Coste Real (€) 0.00' : 'Precio real (€ > 0)'}" value="${isB2B ? '0.00' : ''}" step="0.01" min="${isB2B ? '0' : '0.01'}" ${isB2B ? 'readonly tabindex="-1"' : ''} ${isOperario ? '' : 'disabled'} class="min-h-[44px] ${isB2B ? 'bg-slate-950 border-slate-700 text-slate-400 cursor-not-allowed' : 'bg-black border-mars-cyan/60 text-white focus:border-mars-yellow'} border p-2.5 text-base sm:text-xs w-full sm:w-48 outline-none font-mono">
                                    <select id="real-shop-${this.escapeHTML(order.id)}-${idx}" aria-label="Comercio de adquisición de ${this.escapeHTML(item.name)}" ${isOperario ? '' : 'disabled'} class="min-h-[44px] bg-black border border-slate-700 p-2.5 text-base sm:text-xs text-white w-full sm:w-44 outline-none focus:border-mars-cyan">
                                        ${isB2B ? `<option value="Mercado B2B">Mercado B2B</option>` : ''}
                                        ${(typeof COMMERCIAL_SHOPS_DEF !== 'undefined' ? COMMERCIAL_SHOPS_DEF : [
                                            { id: 'mercadona', name: 'Mercadona' },
                                            { id: 'carrefour', name: 'Carrefour' },
                                            { id: 'eroski', name: 'Eroski' },
                                            { id: 'dia', name: 'Dia' },
                                            { id: 'ferreteria', name: 'Ferretería' },
                                            { id: 'bazar', name: 'Bazar' },
                                            { id: 'comercio_generico', name: 'Comercio genérico' }
                                        ]).map(shop => `<option value="${this.escapeHTML(shop.name)}">${this.escapeHTML(shop.name)}</option>`).join('')}
                                    </select>
                                </div>
                            </div>
                        `; }).join('')}
                    </div>
                    ${isOperario
                        ? ((!isB2B && this.isCompanyBankrupt && this.isCompanyBankrupt(co))
                            ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="w-full min-h-[48px] bg-slate-900 border border-rose-500/60 text-rose-300 font-black py-3 px-4 text-xs uppercase tracking-wider cursor-not-allowed">🔒 Compra Física B2C Bloqueada (Saldo ≤ 0 €v)</button>`
                            : `<button type="button" onclick="ui.executePhysicalOrder('${this.escapeHTML(order.id)}')" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-4 text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">[ CONFIRMAR ${isB2B ? 'RECEPCIÓN FÍSICA B2B Y ENSAMBLE' : 'COMPRA FÍSICA Y ENSAMBLAJE'} ]</button>`)
                        : `<div class="p-3 bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 uppercase font-mono">🔒 Vista de Sólo Lectura: Registro de compra física reservado exclusivamente al Operario de Taller.</div>`
                    }
                </div>`;
            }).join('');
        } else {
            const pendFinCount = allOrders.filter(o => o.type !== 'MARKETING' && o.status === 'PENDIENTE_FINANZAS').length;
            const pendDocCount = allOrders.filter(o => o.type !== 'MARKETING' && o.status === 'PENDIENTE_DOCENTE').length;
            let turnoDiag = '🟢 Aún no hay compras enviadas por el Dpto. Técnico (I+D) en SUPER-MARSKET.';
            if (pendFinCount > 0) turnoDiag = `👉 Turno de Finanzas: hay ${pendFinCount} orden(es) esperando autorización presupuestaria antes de llegar a Taller.`;
            else if (pendDocCount > 0) turnoDiag = `⏳ Turno de Aduana Docente: hay ${pendDocCount} compra(s) B2B esperando validación de Coordinación.`;
            ordersTabContentHtml = `
            <div class="terminal-border border-dashed p-6 sm:p-8 text-center text-xs bg-black/40 space-y-3">
                <p class="text-slate-200 font-mono font-bold uppercase">Sin órdenes aprobadas esperando recepción en Taller</p>
                <p class="text-slate-300 font-sans max-w-lg mx-auto">${turnoDiag}</p>
                <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold uppercase text-xs transition-colors">
                    <span>📡 Consultar Estado en "Seguimiento de Órdenes" ↗</span>
                </button>
            </div>`;
        }

        const executedOrders = allOrders.filter(o => o.status === 'EJECUTADO');
        const executedSummaryHtml = executedOrders.length > 0 ? `
        <details class="mt-4 pt-3 border-t border-slate-800">
            <summary class="min-h-[44px] cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-200 hover:text-mars-cyan select-none">
                <span>✅ Ver historial de recepciones completadas en taller (${executedOrders.length})</span>
                <span class="text-mars-cyan shrink-0">▼ Ver</span>
            </summary>
            <div class="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                ${executedOrders.map(o => {
                    const pieces = (o.items || []).map(it => `${this.escapeHTML(it.name)} ×${Number(it.qty) || 1}`).join(', ');
                    return `
                    <div class="bg-black/50 border border-slate-800 p-2.5 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div class="min-w-0">
                            <span class="text-mars-green font-mono font-bold">#${this.escapeHTML(o.id)}</span>
                            <span class="text-slate-400 font-mono text-[11px] ml-1.5">${this.escapeHTML(o.date || '--')}</span>
                            <p class="text-slate-200 font-sans mt-0.5 break-words">${pieces || 'Sin desglose'}</p>
                        </div>
                        <span class="text-mars-cyan font-mono font-bold shrink-0">${Number(o.total || 0).toFixed(2)} €v</span>
                    </div>`;
                }).join('')}
            </div>
        </details>` : '';

        const ordersPanelHtml = `
        <div id="ops-orders-tracking-panel" class="mt-6 terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-green">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-3">
                <div class="min-w-0 flex-1">
                    <h2 class="font-orbitron text-mars-green text-sm sm:text-base uppercase tracking-tighter flex items-center gap-2">
                        <span>📦 Compras Físicas y Ensamble en Taller</span>
                        <span class="text-[10px] font-mono text-mars-green bg-mars-green/10 px-2 py-0.5 border border-mars-green/30 font-bold">${approvedOrders.length} LISTAS</span>
                    </h2>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Control de componentes autorizados por Finanzas para adquisición real y montaje.</p>
                </div>
                <button type="button" onclick="ui.navigate('orders')" class="shrink-0 w-full sm:w-auto justify-center min-h-[44px] px-3.5 py-2 bg-black border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold uppercase text-xs transition-colors flex items-center gap-2 whitespace-nowrap text-center">
                    <span>📡 Seguimiento Completo de Órdenes ↗</span>
                </button>
            </div>
            <div>
                ${ordersTabContentHtml}
            </div>
            ${executedSummaryHtml}
        </div>`;

        const currentHoja = co.deliverables?.hoja_taller_fyq;
        const hojaStatus = currentHoja?.status || 'DRAFT_TECNICO';
        const hojaUrl = currentHoja?.driveUrl || '';
        const isHojaLocked = !state.user?.admin && (typeof this.isDeliverableLocked === 'function') && this.isDeliverableLocked('hoja_taller_fyq', co);
        const historyTimelineHtml = this.renderHojaTallerHistoryHtml ? this.renderHojaTallerHistoryHtml(currentHoja) : '';

        let hojaWorkshopHtml = '';
        if (!currentHoja || hojaStatus === 'DRAFT_TECNICO') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-slate-600 mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-slate-300 bg-slate-800 px-2.5 py-1 tracking-wider">[CANAL I+D ⇄ TALLER // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold ${currentHoja?.lastWorkshopCheckAt ? 'text-mars-green bg-mars-green/10 border border-mars-green/40' : 'text-slate-300 bg-slate-900 border border-slate-700'} px-2.5 py-1 rounded">${currentHoja?.lastWorkshopCheckAt ? '✓ ÚLTIMA ITERACIÓN OK' : '⏳ EN DISEÑO POR TÉCNICO'}</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 0)}
                <p class="text-xs text-slate-300 font-sans">El departamento Técnico (I+D) está configurando el BOM y la especificación en Google Docs. En cuanto envíe una iteración a Taller, podrás verificar el montaje o registrar incidencias en el histórico.</p>
                ${historyTimelineHtml}
            </div>`;
        } else if (hojaStatus === 'DEVUELTO_A_TECNICO') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-amber-500 mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 tracking-wider">[CANAL I+D ⇄ TALLER // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500 px-2.5 py-1 rounded">⚠️ DEVUELTO A TÉCNICO</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 0)}
                <div class="bg-amber-950/40 border border-amber-500/50 p-2.5 my-2 text-xs text-amber-300 font-mono">
                    <strong>Incidencia reportada a I+D:</strong> ${this.escapeHTML(currentHoja.returnReason || currentHoja.returnReasonId || 'Incidencia de taller')}
                </div>
                ${currentHoja.returnDriveUrl ? `
                <div class="my-2">
                    <a href="${encodeURI(currentHoja.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs bg-amber-950/60 text-amber-300 border border-amber-400 rounded hover:bg-amber-900/60 transition-colors font-bold uppercase">
                        <span>📄 Abrir Registro de Incidencias en Google Docs ↗</span>
                    </a>
                </div>` : ''}
                <p class="text-xs text-slate-300 font-sans">Esperando que Técnico subsane el diseño en Google Docs y envíe la siguiente iteración a Taller.</p>
                ${historyTimelineHtml}
            </div>`;
        } else if (hojaStatus === 'EN_TALLER_OPERARIO') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-cyan-400 mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 px-2.5 py-1 tracking-wider">[FASE 2: EN TALLER FÍSICO // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500 px-2.5 py-1 rounded">⚙️ EN TALLER (OPERARIO)</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 1)}
                <p class="text-xs text-slate-300 font-sans mb-3">Revisa el montaje físico del cohete respecto al BOM documentado por Técnico. Cada validación o incidencia queda guardada en el histórico para elaborar la entrega final en Fase III.</p>
                <div class="mb-4">
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/60 transition-colors">
                        <span>📄 Inspeccionar Hoja de Taller y BOM en Docs ↗</span>
                    </a>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
                    <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">${isHojaLocked ? '[ ✅ VALIDAR MONTAJE EN HISTÓRICO (PRE-FASE III) ]' : '[ ✓ VALIDAR ENSAMBLE DEFINITIVO Y REMITIR A CEO ]'}</button>
                    <button type="button" onclick="ui.modalTallerReturnReason()" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2.5 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER POR INCIDENCIA ]</button>
                </div>
                ${isHojaLocked ? `<p class="text-[11px] text-cyan-300 font-sans mt-2">🔒 La elevación oficial al CEO y al profesor de FyQ se habilitará en <strong>Fase III (15/02/2027)</strong>.</p>` : ''}
                ${historyTimelineHtml}
            </div>`;
        } else if (hojaStatus === 'SUBMITTED_TO_CEO') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-purple-500 mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-purple-400 bg-purple-950/40 border border-purple-500/40 px-2.5 py-1 tracking-wider">[FASE 4: VISADO CEO // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500 px-2.5 py-1 rounded">⏳ REMITIDO AL CEO</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 2)}
                <p class="text-xs text-slate-300 font-sans mb-2">Has validado el ensamble físico en taller. El entregable está pendiente de visado formal por el CEO hacia el profesor de FyQ.</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-950/40 text-purple-300 border border-purple-500/30 rounded font-mono"><span>Ver Documento Drive ↗</span></a>
                ${historyTimelineHtml}
            </div>`;
        } else if (hojaStatus === 'CEO_REVISION') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-magenta mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2.5 py-1 tracking-wider">[REVISIÓN REQUERIDA POR CEO]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2.5 py-1 rounded">⚠️ DEVUELTO POR CEO</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 2)}
                <div class="bg-red-950/40 border border-red-500/50 p-2.5 my-2 text-xs text-red-300 font-mono">
                    <strong>Motivo de Devolución CEO:</strong> ${this.escapeHTML(currentHoja?.returnReason || currentHoja?.returnReasonId || 'Requiere subsanación')}
                </div>
                <p class="text-xs text-slate-300 font-sans mb-3">El CEO ha devuelto la Hoja de Taller. Revisa las piezas en taller y vuelve a validar cuando esté subsanado.</p>
                <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
                    <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">${isHojaLocked ? '[ ✅ VALIDAR REVISIÓN EN HISTÓRICO ]' : '[ ✓ REVALIDAR Y REMITIR A CEO ]'}</button>
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/60 transition-colors"><span>Ver Documento Drive ↗</span></a>
                </div>
                ${historyTimelineHtml}
            </div>`;
        } else if (hojaStatus === 'DELIVERED_TO_TEACHER') {
            hojaWorkshopHtml = `
            <div id="ops-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green mb-6 w-full">
                <div class="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-2.5 py-1 tracking-wider">[EVALUACIÓN OFICIAL FYQ // 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM e Histórico de Montaje</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2.5 py-1 rounded">✓ VISADO Y ENTREGADO A FYQ</span>
                </div>
                ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval · Fase III)', 'Docente FyQ'], 3)}
                <p class="text-xs text-slate-300 font-sans mb-2">El CEO ha visado y remitido la Hoja de Taller al profesor de Física y Química para su evaluación oficial.</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono"><span>Abrir Documento Oficial Drive ↗</span></a>
                ${historyTimelineHtml}
            </div>`;
        }
        const curOpsPhase = (typeof this.getCurrentPhaseKey === 'function') ? this.getCurrentPhaseKey() : 'I';
        const hasPendingLogistics = (co.orders || []).some(o => (o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE') && o.type !== 'MARKETING');
        const hasActiveHojaIteration = Boolean(currentHoja && (hojaStatus !== 'DRAFT_TECNICO' || (Array.isArray(currentHoja.history) && currentHoja.history.length > 0)));
        const isPhaseIOpsQuiet = (curOpsPhase === 'I' && !hasActiveHojaIteration && !hasPendingLogistics);

        const hojaHtml = isPhaseIOpsQuiet ? `
        <details class="terminal-border bg-mars-card/80 border border-slate-800 rounded mb-6">
            <summary class="min-h-[44px] px-4 py-3 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-white select-none">
                <span>🛠️ Canal I+D ⇄ Taller: Hoja de Taller e Histórico (Entrega final en Fase III)</span>
                <span class="text-mars-cyan shrink-0">▼ Ver</span>
            </summary>
            <div class="p-2 pt-0">
                <div class="mb-3 px-1 pt-2">${this.renderDocTemplateBtn('DOC_10_HOJA_TALLER')}</div>
                ${hojaWorkshopHtml}
            </div>
        </details>` : `
            <div class="mb-3">${this.renderDocTemplateBtn('DOC_10_HOJA_TALLER')}</div>
            ${hojaWorkshopHtml}
        `;

        wrapper.innerHTML = `
            ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
            ${this.renderRoleActivePhaseDeliverableBanner ? this.renderRoleActivePhaseDeliverableBanner(co) : ''}
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">Logística de Despliegue Físico</h2>
            </div>
            ${hojaHtml}
            ${ordersPanelHtml}
        `;
        el.appendChild(wrapper);
    },

    setOpsOrdersTab(tab) {
        this.opsOrdersTab = tab || 'APROBADAS';
        this.render();
    },

    executePhysicalOrder(oid, skipPartialConfirm = false) {
        if (!state.user) return;
        const isOperario = (this.getEffectiveRole() === 'OPERACIONES_IA' || Boolean(state.user.admin));
        if (!isOperario) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede registrar compras reales físicas.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
        co.realCosts = co.realCosts || [];
        
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return this.notify("Orden no encontrada.", "error");
        if (order.status !== 'APROBADO_FINANZAS' && order.status !== 'APROBADO_DOCENTE') {
            return this.notify("Esta orden ya ha sido ejecutada o aún no está autorizada.", "info");
        }

        const isB2B = order.type === 'B2B_BUY_REQUEST' || !!order.offerId;
        if (typeof state.recalculateBalance === 'function') state.recalculateBalance(co);
        if (!isB2B && this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        const checkedEntries = [];
        let chargeNowEurV = 0;
        let realCostsToLog = [];
        let uncheckedPendingCount = 0;

        for (let i = 0; i < order.items.length; i++) {
            const origItem = order.items[i];
            if (origItem && origItem.executed) continue;

            const cb = document.getElementById(`assembled-${order.id}-${i}`);
            const eurInput = document.getElementById(`real-eur-${order.id}-${i}`);
            const shopInput = document.getElementById(`real-shop-${order.id}-${i}`);

            if (cb && cb.checked) {
                const rawEur = eurInput ? String(eurInput.value || '').trim().replace(',', '.') : '';
                const valEur = isB2B ? (rawEur === '' ? 0 : parseFloat(rawEur)) : parseFloat(rawEur);
                const valShop = shopInput ? this.cleanInput(shopInput.value) : '';

                if (rawEur === '' && !isB2B) {
                    if (this.highlightInvalidField && eurInput) this.highlightInvalidField('', eurInput);
                    return this.notify(`Indica el precio real pagado en tienda (> 0.00 €) para: ${origItem.name}`, "warning");
                }
                if (isNaN(valEur) || (!isB2B && valEur <= 0) || valEur < 0) {
                    if (this.highlightInvalidField && eurInput) this.highlightInvalidField('', eurInput);
                    return this.notify(isB2B ? `Coste inválido en B2B para: ${origItem.name}` : `El coste real en tienda de "${origItem.name}" debe ser mayor que 0.00 € (aunque sea material de casa).`, "warning");
                }
                if (!valShop) {
                    return this.notify(`Indica el comercio de adquisición para: ${origItem.name}`, "warning");
                }
                checkedEntries.push({ idx: i, valEur, valShop });
                const itemQty = Number(origItem.qty) || 1;
                chargeNowEurV += (Number(origItem.price) || 0) * itemQty;
                realCostsToLog.push({ id: 'RC-' + Date.now() + '-' + i, date: new Date().toLocaleDateString(), item: origItem.name, eur: valEur, shop: valShop, ticketUrl: null, qty: itemQty });
            } else {
                uncheckedPendingCount++;
            }
        }

        if (checkedEntries.length === 0) return this.notify("Debes marcar al menos un componente pendiente como comprado/ensamblado.", "warning");
        if (!isB2B && co.balance < chargeNowEurV) return this.notify("Fondos virtuales insuficientes en la cuenta de la empresa.", "error");

        if (uncheckedPendingCount > 0 && !skipPartialConfirm && typeof this.confirmAction === 'function') {
            return this.confirmAction(
                '📦 Recepción Parcial en Taller',
                `Has desmarcado ${uncheckedPendingCount} partida(s) que aún no habéis comprado. Al confirmar, se cobrarán y pasarán al Taller de I+D solo las ${checkedEntries.length} marcada(s) ahora (${chargeNowEurV.toFixed(2)} €v), y las ${uncheckedPendingCount} restante(s) quedarán pendientes en esta misma orden ya aprobada por Finanzas hasta que las compréis. ¿Continuar?`,
                () => this.executePhysicalOrder(oid, true),
                'Sí, Registrar Marcadas'
            );
        }

        if (this.acquireActionLock && !this.acquireActionLock('exec-order-' + order.id, 1500)) return;

        checkedEntries.forEach(entry => {
            order.items[entry.idx] = {
                ...order.items[entry.idx],
                executed: true,
                realEur: entry.valEur,
                realShop: entry.valShop,
                ticketUrl: null,
                executedAt: Date.now()
            };
        });

        const remainingPendingAfter = (order.items || []).filter(it => !it || !it.executed).length;
        const nowTs = Date.now();
        if (remainingPendingAfter === 0) {
            order.status = 'EJECUTADO';
            order.executedAt = nowTs;
        } else {
            order.partialExecuted = true;
            order.lastPartialAt = nowTs;
        }
        order.updatedAt = nowTs;

        if (!isB2B) {
            const ledgerDesc = remainingPendingAfter === 0
                ? (order.partialExecuted ? `Liquidación Final Logística Orden #${order.id}` : `Ejecución Logística Orden #${order.id}`)
                : `Recepción Parcial Logística Orden #${order.id} (${checkedEntries.length} part.)`;
            state.addToLedger(state.user.coId, ledgerDesc, 'OPERACIONES_IA', -chargeNowEurV);
        }
        co.realCosts.push(...realCostsToLog);
        co.updatedAt = nowTs;

        telemetry.log("EJECUCIÓN LOGÍSTICA", `Orden ${isB2B ? 'B2B ' : ''}#${order.id} (${remainingPendingAfter === 0 ? 'completada' : `parcial, quedan ${remainingPendingAfter}`}) por ${chargeNowEurV.toFixed(2)}€v`);

        if (remainingPendingAfter === 0) {
            ui.pushNotification(state.user.coId, 'TECNICO', `📦 Orden #${order.id} (${isB2B ? 'Pieza B2B' : 'Material'}) completada y disponible en Taller & BOM.`, 'success', { view: 'orders', filter: 'COMPLETADAS', dept: 'TECNICO' });
            if (!isB2B) {
                ui.pushNotification(state.user.coId, 'FINANZAS', `📦 Orden #${order.id} completada en Taller: ${chargeNowEurV.toFixed(2)} €v descontados en el Libro Mayor.`, 'info', { view: 'finance' });
            }
            this.notify(`✅ Orden #${order.id} completada. Todos los componentes han pasado a Taller & BOM.`, "success");
        } else {
            ui.pushNotification(state.user.coId, 'TECNICO', `📦 Recepción parcial en Orden #${order.id}: ${checkedEntries.length} partida(s) ya disponibles en Taller & BOM (${remainingPendingAfter} quedan pendientes de compra).`, 'info', { view: 'tech_workshop' });
            if (!isB2B) {
                ui.pushNotification(state.user.coId, 'FINANZAS', `📦 Recepción parcial en Orden #${order.id}: descontados ${chargeNowEurV.toFixed(2)} €v de las piezas compradas (${remainingPendingAfter} quedan pendientes en Taller sin nueva autorización).`, 'info', { view: 'finance' });
            }
            this.notify(`✅ Registradas ${checkedEntries.length} partida(s). Quedan ${remainingPendingAfter} pendiente(s) en esta misma orden hasta que las compréis.`, "success");
        }

        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
    },

    viewAILog(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.aiPrompts = co.aiPrompts || [];
        
        const isOps = ['OPERACIONES_IA', 'OPERACIONES'].includes(this.getEffectiveRole(co));
        const wrapper = document.createElement('div');
        wrapper.id = 'ailog-section';
        
        const pendingPrompts = co.aiPrompts.filter(p => p.status === 'PENDIENTE_VALIDACION');
        const rejectedPrompts = co.aiPrompts.filter(p => p.status === 'RECHAZADO');
        const approvedPrompts = co.aiPrompts.filter(p => p.status === 'APROBADO');

        let pendingHtml = '';
        if (isOps && pendingPrompts.length > 0) {
            pendingHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8">
                <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base mb-4 uppercase tracking-tighter">Prompts Pendientes de Auditoría (${pendingPrompts.length})</h3>
                <div class="space-y-4">
                    ${pendingPrompts.map(p => {
                        const authorLabel = (p.submittedBy && p.submittedBy !== p.role) ? `${p.submittedBy} (${p.role})` : p.role;
                        return `
                        <div class="bg-slate-900 border border-mars-yellow/50 p-4 text-xs">
                            <div class="flex flex-wrap justify-between gap-2 mb-2"><span class="text-mars-cyan font-bold uppercase">Autor: ${this.escapeHTML(authorLabel)} | Herramienta: ${this.escapeHTML(p.tool)}</span><span class="text-slate-300">${this.escapeHTML(p.date)}</span></div>
                            <div class="mb-3">
                                ${(p.bitacoraUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.bitacoraUrl)) || (p.prompt && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.prompt))
                                    ? `<a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(p.bitacoraUrl || p.prompt) : '#'}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Registro de Prompt / IA ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Registro legacy archivado por protocolo RGPD]</span>`
                                }
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" onclick="ui.validateAIPrompt('${this.escapeHTML(p.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-bold uppercase hover:bg-white transition-colors">Aprobar y Registrar</button>
                                <button type="button" onclick="ui.validateAIPrompt('${this.escapeHTML(p.id)}', false)" class="min-h-[44px] bg-mars-magenta text-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
                            </div>
                        </div>
                    `; }).join('')}
                </div>
            </div>`;
        } else if (!isOps && pendingPrompts.length > 0) {
            pendingHtml = `
            <div class="bg-amber-950/30 border border-amber-500/50 p-3.5 rounded mb-6 text-xs">
                <p class="text-amber-300 font-bold uppercase font-mono mb-1.5">⏳ Reportes de IA en cola de auditoría por Operaciones (${pendingPrompts.length})</p>
                <div class="space-y-1 text-slate-200 font-mono text-[11px]">
                    ${pendingPrompts.map(p => `<div>• ${this.escapeHTML(p.tool || 'IA')} — <span class="text-mars-cyan">${this.escapeHTML(p.role || '')}</span> (${this.escapeHTML(p.date || '')})</div>`).join('')}
                </div>
            </div>`;
        }

        const rejectedAiHtml = rejectedPrompts.length > 0 ? `
            <div class="bg-red-950/40 border border-mars-magenta/70 p-4 rounded mb-6 text-xs space-y-2.5">
                <div class="flex flex-wrap justify-between items-center gap-2">
                    <span class="text-mars-magenta font-bold uppercase font-mono">❌ Reportes de IA Devueltos para Subsanar (${rejectedPrompts.length})</span>
                    <button type="button" onclick="ui.modalReportAI()" class="min-h-[44px] bg-amber-400 text-black px-3 py-1.5 text-xs font-black uppercase hover:bg-white transition-colors">[ 🔄 Declarar Nuevo Reporte Corregido ]</button>
                </div>
                <div class="space-y-2">
                    ${rejectedPrompts.map(p => `
                        <div class="bg-black/60 border border-red-500/40 p-2.5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div class="min-w-0">
                                <span class="text-white font-bold uppercase font-mono">${this.escapeHTML(p.tool || 'IA')} (${this.escapeHTML(p.role || '')})</span>
                                <p class="text-red-200 font-sans mt-0.5 break-words">Motivo: "${this.escapeHTML(p.rejectReason || 'Requiere subsanación ética o de permisos.')}"</p>
                            </div>
                            <span class="text-[11px] text-slate-400 font-mono shrink-0">${this.escapeHTML(p.date || '')}</span>
                        </div>
                    `).join('')}
                </div>
            </div>` : '';

        const curPhaseKey = (typeof this.getCurrentPhaseKey === 'function') ? this.getCurrentPhaseKey() : 'I';
        const bitacoraDocKey = curPhaseKey === 'IV' ? 'decisionDiary_apr' : 'decisionDiary_dec';
        const bitacoraDoc = (co.deliverables || {})[bitacoraDocKey];
        const bitacoraStatus = (typeof bitacoraDoc === 'object' && bitacoraDoc) ? bitacoraDoc.status : (typeof bitacoraDoc === 'string' && bitacoraDoc ? 'DELIVERED_TO_TEACHER' : 'PENDING');
        
        let bitacoraBadge = '<span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-amber-500/40">⏳ PENDIENTE</span>';
        if (bitacoraStatus === 'SUBMITTED_TO_CEO') {
            bitacoraBadge = '<span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">🟡 EN REVISIÓN CEO</span>';
        } else if (bitacoraStatus === 'DELIVERED_TO_TEACHER') {
            bitacoraBadge = '<span style="background-color: rgba(0, 255, 102, 0.15); border: 1px solid #00ff66; color: #00ff66;" class="text-xs font-mono font-bold px-2 py-0.5 rounded">🟢 ENTREGADO A DOCENTE</span>';
        } else if (bitacoraStatus === 'CEO_REVISION' || bitacoraStatus === 'RETURNED_BY_CEO' || bitacoraStatus === 'RETURNED_BY_TEACHER') {
            bitacoraBadge = '<span style="background-color: rgba(255, 0, 85, 0.15); border: 1px solid #ff0055; color: #ff0055;" class="text-xs font-mono font-bold px-2 py-0.5 rounded animate-pulse">🔴 SUBSANAR</span>';
        } else if (bitacoraStatus === 'REVIEWED' || bitacoraStatus === 'ACCEPTED') {
            bitacoraBadge = '<span style="background-color: #00ff66; color: #000; font-weight: 900;" class="text-xs font-mono px-2 py-0.5 rounded">✓ CALIFICADO</span>';
        }

        const bitacoraReturnHtml = (bitacoraStatus === 'CEO_REVISION' || bitacoraStatus === 'RETURNED_BY_CEO' || bitacoraStatus === 'RETURNED_BY_TEACHER') && bitacoraDoc ? `
            <div class="mb-3 bg-rose-950/30 border border-rose-500/40 p-3 text-xs">
                <p class="font-bold text-rose-300 uppercase mb-1">⚠️ Bitácora devuelta para subsanar:</p>
                <p class="text-slate-200">${this.escapeHTML(bitacoraDoc.returnReason || 'Revisar las observaciones antes de reenviar.')}</p>
                ${(bitacoraDoc.returnDriveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(bitacoraDoc.returnDriveUrl))) ? `
                    <a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(bitacoraDoc.returnDriveUrl) : encodeURI(bitacoraDoc.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="mt-2 inline-flex items-center gap-1.5 min-h-[44px] px-3 py-1.5 bg-slate-900 border border-rose-400/40 text-rose-200 hover:border-rose-300 rounded font-mono text-xs">
                        <span>📄 Ver Informe de Devolución ↗</span>
                    </a>
                ` : ''}
            </div>` : '';

        const bitacoraCardHtml = `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-l-4 border-l-mars-cyan mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3 mb-3">
                <div>
                    <div class="flex items-center gap-2 mb-1 flex-wrap">
                        <span class="text-xs bg-mars-cyan/20 text-mars-cyan border border-mars-cyan/40 px-2 py-0.5 font-bold uppercase font-mono">Entregable Curricular Oficial</span>
                        <span class="text-xs text-mars-yellow font-bold uppercase font-mono">Liderazgo (LYE • 10%)</span>
                        ${bitacoraBadge}
                    </div>
                    <h3 class="text-white font-orbitron text-sm sm:text-base font-bold uppercase">Cuaderno de Bitácora y Auditoría Ética de IA (DOC_4)</h3>
                    <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                        Documento oficial donde se recopila el proceso de toma de decisiones, resolución de crisis departamentales y la justificación ética de los prompts y herramientas IA utilizadas.
                    </p>
                </div>
            </div>
            ${bitacoraReturnHtml}
            <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div class="flex flex-wrap items-center gap-2">
                    ${this.renderDocTemplateBtn(bitacoraDocKey, '📄 Ver Modelo Bitácora')}
                    ${(bitacoraDoc?.driveUrl && (!this.sanitizeDriveUrl || this.sanitizeDriveUrl(bitacoraDoc.driveUrl))) ? `
                        <a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(bitacoraDoc.driveUrl) : encodeURI(bitacoraDoc.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 border border-slate-700 text-cyan-400 hover:border-cyan-400 font-mono text-xs rounded transition-colors">
                            <span>📄 Abrir Mi Bitácora Entregada ↗</span>
                        </a>
                    ` : ''}
                </div>
                <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    ${isOps ? (
                        this.isDeliverableLocked(bitacoraDocKey, co)
                        ? `<button type="button" disabled class="min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 bg-slate-900 border border-slate-700 text-slate-500 font-bold uppercase text-xs cursor-not-allowed text-center">[ 🔒 Bloqueada por Cronograma ]</button>`
                        : `<button type="button" onclick="ui.modalSubmitRoleDeliverable('${bitacoraDocKey}')" class="min-h-[44px] flex-1 sm:flex-initial px-4 py-2.5 bg-mars-cyan text-black hover:bg-white font-black uppercase text-xs transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)] text-center">[ 📤 Entregar / Subir Bitácora ]</button>`
                    ) : `<span class="min-h-[44px] inline-flex items-center px-3 py-2 bg-black/60 border border-slate-800 text-slate-400 text-[11px] font-mono uppercase">🔒 Subida exclusiva de Operaciones e IA</span>`}
                    <button type="button" onclick="ui.current = 'role_deliverables'; ui.roleDeliverablesPhase = '${curPhaseKey}'; ui.roleDeliverablesScope = 'MY_ROLE'; ui.render();" class="min-h-[44px] flex-1 sm:flex-initial px-3.5 py-2.5 bg-black border border-slate-700 text-slate-300 hover:text-white hover:border-mars-cyan font-bold uppercase text-xs transition-all text-center">
                        Mis Entregables ➔
                    </button>
                </div>
            </div>
        </div>`;

        wrapper.innerHTML = `
            ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
            <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">Bitácora y Auditoría de Inteligencia Artificial</h2>
                <button type="button" onclick="ui.modalReportAI()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]">[🤖 Nuevo Reporte IA]</button>
            </div>
            ${bitacoraCardHtml}
            ${rejectedAiHtml}
            ${pendingHtml}
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-sm sm:text-base mb-3 uppercase tracking-tighter">Historial Oficial de Uso de IA (Aprobados)</h3>
                <div class="flex flex-wrap gap-2 mb-4 pb-3 border-b border-slate-800">
                    ${[
                        { k: 'CEO', label: 'CEO' },
                        { k: 'TECNICO', label: 'I+D' },
                        { k: 'FINANZAS', label: 'FIN' },
                        { k: 'MARKETING', label: 'MKT' },
                        { k: 'OPERACIONES_IA', label: 'OPS' }
                    ].map(d => {
                        const cnt = approvedPrompts.filter(p => p.role === d.k || (d.k === 'OPERACIONES_IA' && p.role === 'OPERACIONES')).length;
                        return `<span class="text-[11px] font-mono px-2.5 py-1 rounded border ${cnt > 0 ? 'bg-mars-green/10 border-mars-green/50 text-mars-green font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}">${cnt > 0 ? '✓' : '○'} ${d.label} (${cnt})</span>`;
                    }).join('')}
                </div>
                <div class="space-y-4">
                    ${approvedPrompts.map(p => {
                        const authorLabel = (p.submittedBy && p.submittedBy !== p.role) ? `${p.submittedBy} (${p.role})` : p.role;
                        return `
                        <div class="bg-black/60 border border-mars-cyan/40 p-4 text-xs">
                            <div class="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                                <span class="text-mars-cyan font-bold uppercase">${this.escapeHTML(authorLabel)} • ${this.escapeHTML(p.tool)}</span>
                                <span class="text-slate-300">${this.escapeHTML(p.date)}</span>
                            </div>
                            <div class="mt-2">
                                ${(p.bitacoraUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.bitacoraUrl)) || (p.prompt && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.prompt))
                                    ? `<a href="${this.sanitizeDriveUrl ? this.sanitizeDriveUrl(p.bitacoraUrl || p.prompt) : '#'}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Registro de Prompt / IA ↗</span></a>`
                                    : `<span class="text-xs text-mars-yellow/80 font-mono italic">[Registro legacy archivado por protocolo RGPD]</span>`
                                }
                            </div>
                        </div>
                    `; }).join('') || '<p class="text-slate-300 italic text-xs">No hay registros de IA aprobados todavía.</p>'}
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    async opsValidateHojaTaller() {
        if (!state.user || (this.getEffectiveRole() !== 'OPERACIONES_IA' && !state.user.admin)) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede visar el ensamble en taller.", "error");
        }
        if (this.acquireActionLock && !this.acquireActionLock('ops-validate-hoja-' + state.user.coId, 1500)) return;
        const result = await state.validateHojaTallerByOperator();
        if (result === 'CHECKPOINT_SAVED') {
            this.notify("✅ Montaje verificado en Taller y guardado en el Histórico de Montaje (elevación al CEO en Fase III).", "success");
        } else {
            this.notify("✅ Ensamble físico definitivo validado. Remitido al CEO para visado docente.", "success");
        }
        this.render();
    },

    modalTallerReturnReason() {
        if (!state.user || (this.getEffectiveRole() !== 'OPERACIONES_IA' && !state.user.admin)) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede reportar incidencias de taller.", "error");
        }
        const reasons = typeof WORKSHOP_INCIDENCE_REASONS !== 'undefined' ? WORKSHOP_INCIDENCE_REASONS : [];
        const optionsHtml = reasons.map(r => `<option value="${this.escapeHTML(r.id)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Selecciona la incidencia técnica detectada durante la verificación física en el banco de trabajo. Prohibido el texto libre.</p>
            <div class="bg-cyan-950/40 border border-cyan-500/40 p-3 mb-3 text-xs text-slate-300 leading-relaxed font-sans">
                <p class="font-bold text-cyan-400 uppercase mb-1">📋 Protocolo de Devolución de Taller:</p>
                <p>Para asegurar la trazabilidad sin texto libre (política Zero-Text), documenta las anomalías físicas, fotografías del ensamble o tolerancias erróneas en un documento de Google Docs o Google Drive con permisos de lectura compartidos ("Cualquiera con el enlace puede ver").</p>
            </div>
            <div class="space-y-3">
                <div>
                    <label for="taller-return-reason" class="text-xs text-amber-400 font-bold uppercase block mb-1.5">Causa de Incidencia Tipificada</label>
                    <select id="taller-return-reason" class="w-full min-h-[44px] bg-slate-900 border border-amber-500/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400">
                        ${optionsHtml}
                    </select>
                </div>
                <div>
                    <label for="taller-return-drive-url" class="text-xs text-mars-cyan font-bold uppercase block mb-1.5">Enlace a Documento de Incidencias / Evidencias (Google Docs / Drive) *</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="taller-return-drive-url" placeholder="https://docs.google.com/document/d/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" required class="flex-1 min-h-[44px] bg-slate-900 border border-cyan-500/60 p-2.5 text-base sm:text-xs text-white outline-none focus:border-cyan-400 font-mono">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('taller-return-drive-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">El departamento Técnico revisará este enlace para subsanar los defectos físicos indicados.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmTallerReturnReason()" class="min-h-[44px] bg-amber-400 text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all w-full sm:w-auto">Confirmar Devolución a I+D</button>`;
        this.showModal("Devolver Hoja de Taller por Incidencia", html, actions);
    },

    confirmTallerReturnReason() {
        if (!state.user || (this.getEffectiveRole() !== 'OPERACIONES_IA' && !state.user.admin)) return;
        const el = document.getElementById('taller-return-reason');
        const elUrl = document.getElementById('taller-return-drive-url');
        if (!el) return;
        const reasonId = el.value;
        const reasons = typeof WORKSHOP_INCIDENCE_REASONS !== 'undefined' ? WORKSHOP_INCIDENCE_REASONS : [];
        const reasonObj = reasons.find(r => r.id === reasonId);
        const label = reasonObj ? reasonObj.label : reasonId;

        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl ? elUrl.value : '', elUrl, { required: true, label: 'las evidencias de incidencia en taller' })
            : { valid: Boolean(elUrl && this.cleanInput(elUrl.value)), url: elUrl ? this.cleanInput(elUrl.value) : '' };
        if (!urlCheck.valid) return;
        if (this.acquireActionLock && !this.acquireActionLock('ops-return-hoja-' + state.user.coId, 1500)) return;

        state.returnHojaTallerByOperator(reasonId, label, urlCheck.url);
        this.closeModal();
        this.notify("⚠️ Incidencia registrada en Histórico y Hoja de Taller devuelta al departamento Técnico.", "warning");
        this.render();
    },

    modalReportAI() {
        if (!state.user || state.user.admin || !state.data.companies?.[state.user.coId]) return;
        const aiProviders = typeof AUTHORIZED_AI_PROVIDERS !== 'undefined' ? AUTHORIZED_AI_PROVIDERS : [
            "Google Gemini", "OpenAI ChatGPT", "Anthropic Claude", "Microsoft Copilot", "Perplexity AI", "DeepSeek", "Otro autorizado por Coordinación"
        ];
        const optionsHtml = aiProviders.map(p => `<option value="${this.escapeHTML(p)}">${this.escapeHTML(p)}</option>`).join('');
        const effRole = this.getEffectiveRole();
        const isOps = effRole === 'OPERACIONES_IA';
        const roleDisplay = (state.user.role !== effRole) ? `${state.user.role} (${effRole})` : effRole;

        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Todo uso de IA generativa debe registrarse en una ficha de <strong>Prompt / Uso de IA</strong> (Google Docs con permisos de lectura compartidos) antes de consolidarse en la Bitácora oficial.</p>
            <div class="bg-cyan-950/30 border border-cyan-500/30 p-2.5 mb-3 text-xs text-slate-300 font-mono">
                ${isOps 
                    ? `<span class="text-mars-cyan font-bold">ℹ️ MODO OPERACIONES:</span> Tu registro se consolidará directamente en la Bitácora oficial del equipo.` 
                    : `<span class="text-mars-yellow font-bold">ℹ️ FLUJO INTERDEPARTAMENTAL:</span> Tu declaración (${this.escapeHTML(roleDisplay)}) se enviará a Operaciones e IA para su validación ética y consolidación.`
                }
            </div>
            <div class="space-y-3">
                <div>
                    <label for="ai-tool" class="text-xs text-mars-cyan font-bold uppercase block mb-1">Proveedor / Herramienta IA Autorizada</label>
                    <select id="ai-tool" class="w-full min-h-[44px] bg-slate-900 border border-cyan-500/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-cyan-400 font-mono">
                        ${optionsHtml}
                    </select>
                </div>
                <div class="space-y-1.5 mb-3">
                    <label for="input-bitacora-url" class="text-[11px] font-mono text-slate-300 uppercase tracking-wide block">
                        Enlace a Plantilla de Prompt / Uso de IA (Google Docs)
                    </label>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_4_BITACORA_IA')}
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" 
                               id="input-bitacora-url" 
                               name="bitacoraUrl" 
                               required 
                               onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })"
                               placeholder="https://docs.google.com/document/d/..." 
                               class="flex-1 bg-slate-900 border border-slate-700 p-2 text-base sm:text-xs text-white rounded font-mono outline-none focus:border-cyan-400 min-h-[44px]">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('input-bitacora-url') : ''}
                    </div>
                    <p class="text-[11px] text-slate-300 font-sans">
                        Usa primero <strong>[📋 Hacer Copia en Drive]</strong> y pega el enlace de vuestra copia (no <code>/copy</code>).
                    </p>
                    <label class="mars-checkbox-label flex items-start gap-2.5 cursor-pointer p-2 bg-black/50 border border-slate-800 rounded min-h-[44px]">
                        <input type="checkbox" id="input-bitacora-perm-check" class="mars-touch-input">
                        <span class="mars-checkbox-visual mt-0.5"></span>
                        <span class="text-xs text-slate-200 font-sans">Confirmo que el Google Doc tiene acceso <strong>«Cualquier persona con el enlace (Lector)»</strong>.</span>
                    </label>
                </div>
            </div>
        `;
        const actionLabel = isOps ? 'Registrar en Bitácora' : 'Enviar a Operaciones IA';
        const actions = `<button type="button" onclick="ui.submitReportAI()" class="min-h-[44px] w-full sm:w-auto bg-mars-cyan text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-colors">${actionLabel}</button>`;
        this.showModal("Declaración de Uso de IA", html, actions);
    },

    submitReportAI() {
        if (!state.user || state.user.admin) return;
        const elTool = document.getElementById('ai-tool');
        const elUrl = document.getElementById('input-bitacora-url');
        const elPerm = document.getElementById('input-bitacora-perm-check');
        if (!elTool || !elUrl) return;
        
        const tool = this.cleanInput(elTool.value);
        if (!tool) return this.notify("Selecciona la herramienta de IA.", "warning");
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'la Bitácora IA (DOC_4)' })
            : { valid: Boolean(this.cleanInput(elUrl.value)), url: this.cleanInput(elUrl.value) };
        if (!urlCheck.valid) return;
        const bitacoraUrl = urlCheck.url;
        if (elPerm && !elPerm.checked) {
            return this.notify("Marca la casilla confirmando permisos de lectura en Google Drive.", "warning");
        }
        if (this.hasForbiddenWords(tool, 'Herramienta IA', elTool)) {
            return;
        }
        if (this.acquireActionLock && !this.acquireActionLock('submit-ai-' + state.user.coId, 1500)) return;
        
        const co = state.data.companies?.[state.user.coId];
        if (!co) return auth.logout();
        co.aiPrompts = co.aiPrompts || [];
        
        const effRole = this.getEffectiveRole(co);
        const autoApprove = effRole === 'OPERACIONES_IA';
        const roleLabel = (state.user.role !== effRole) ? `${state.user.role} (${effRole})` : effRole;
        const newPrompt = {
            id: 'AI-' + Date.now(),
            role: effRole,
            submittedBy: state.user.role,
            tool,
            bitacoraUrl,
            date: new Date().toLocaleString(),
            status: autoApprove ? 'APROBADO' : 'PENDIENTE_VALIDACION'
        };
        co.aiPrompts.unshift(newPrompt);
        
        if (!autoApprove) {
            ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nuevo uso de IA reportado por ${roleLabel} pendiente de tu validación.`, 'info', { view: 'ailog', anchorId: 'ailog-section' });
        }
        
        telemetry.log("REPORTE IA", `Declarado uso de ${tool}`);
        state.save();
        this.closeModal();
        this.notify(autoApprove ? "✅ Uso de IA registrado y aprobado en la Bitácora." : "✅ Reporte enviado al Director de Operaciones e IA para su validación.", "success");
        this.render();
    },

    validateAIPrompt(pid, ok) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.aiPrompts) return;
        if (this.getEffectiveRole(co) !== 'OPERACIONES_IA' && !state.user.admin) {
            return this.notify("Solo el Departamento de Operaciones e IA puede validar o devolver reportes de IA.", "warning");
        }
        const p = co.aiPrompts.find(x => x.id === pid);
        if (!p) return;

        if (ok) {
            if (p.status === 'APROBADO') return;
            p.status = 'APROBADO';
            delete p.rejectReason;
            p.updatedAt = Date.now();
            ui.pushNotification(state.user.coId, p.role, `Tu reporte de uso de IA (${p.tool}) ha sido validado por Operaciones.`, 'success', { view: 'ailog', anchorId: 'ailog-section' });
            this.notify("Reporte de IA validado y archivado.", "success");
            state.save();
            this.render();
        } else {
            this.modalRejectAIPrompt(pid);
        }
    },

    modalRejectAIPrompt(pid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.aiPrompts) return;
        if (this.getEffectiveRole(co) !== 'OPERACIONES_IA' && !state.user.admin) return;
        const p = co.aiPrompts.find(x => x.id === pid);
        if (!p) return;
        const reasons = [
            "Falta incluir el prompt exacto o la verificación humana en el Google Doc",
            "El enlace de Google Drive no tiene permisos públicos de lectura",
            "Se ha adjuntado una plantilla sin rellenar (/copy)",
            "Uso de herramienta o respuesta sin contraste científico/técnico"
        ];
        const html = `
            <div class="space-y-3 font-sans text-xs">
                <p class="text-slate-300 leading-relaxed">Indica el motivo tipificado por el cual se devuelve el reporte de <strong>${this.escapeHTML(p.tool || 'IA')}</strong> (${this.escapeHTML(p.role || '')}):</p>
                <label for="reject-ai-reason" class="text-mars-magenta uppercase font-bold block">Motivo Tipificado</label>
                <select id="reject-ai-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white outline-none">
                    ${reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('')}
                </select>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRejectAIPrompt('${this.escapeHTML(pid)}')" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors w-full sm:w-auto">Confirmar Rechazo de Reporte</button>`;
        this.showModal("Rechazar Reporte de Uso de IA", html, actions);
    },

    confirmRejectAIPrompt(pid) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.aiPrompts) return;
        if (this.getEffectiveRole(co) !== 'OPERACIONES_IA' && !state.user.admin) return;
        const p = co.aiPrompts.find(x => x.id === pid);
        if (!p) return;
        const sel = document.getElementById('reject-ai-reason');
        const reason = sel ? this.cleanInput(sel.value) : 'Falta verificación humana rigurosa';
        p.status = 'RECHAZADO';
        p.rejectReason = reason;
        p.rejectedAt = Date.now();
        p.updatedAt = Date.now();
        ui.pushNotification(state.user.coId, p.role, `Tu reporte de uso de IA (${p.tool}) fue rechazado: "${reason}". Registra uno corregido en Bitácora IA.`, 'error', { view: 'ailog', anchorId: 'ailog-section' });
        state.save();
        this.closeModal();
        this.notify("Reporte de IA rechazado con motivo tipificado.", "info");
        this.render();
    }
});
