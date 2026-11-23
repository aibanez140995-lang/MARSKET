// js/ui-empresa-finance.js
// --- MÓDULO FINANCIERO Y BÓVEDA DE ÓRDENES: CRONOGRAMA MAESTRO (17 ENTREGABLES), AUDITORÍA Y LEDGER (v1.1.34) ---

Object.assign(ui, {
    cronogramaFilter: 'ALL',
    ledgerFilter: 'ALL',

    setLedgerFilter(f) {
        this.ledgerFilter = String(f || 'ALL');
        this.render();
    },

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

    _resolvePurchaseExportContext(orderId = null) {
        const companies = state.data?.companies || {};
        let co = state.user?.coId ? companies[state.user.coId] : null;
        let order = null;
        if (orderId) {
            if (co && Array.isArray(co.orders)) {
                order = co.orders.find(o => String(o.id) === String(orderId)) || null;
            }
            if (!order) {
                for (const cid of Object.keys(companies)) {
                    const candidate = companies[cid];
                    const found = (candidate?.orders || []).find(o => String(o.id) === String(orderId));
                    if (found) {
                        co = candidate;
                        order = found;
                        break;
                    }
                }
            }
        }
        if (!co) return null;

        const rawItems = order ? (order.items || []) : (co.cart || []);
        const items = rawItems.map(it => {
            const qty = Math.max(1, Number(it?.qty) || 1);
            const price = Number(it?.price) || 0;
            return {
                id: String(it?.id || '--'),
                name: String(it?.name || 'Material'),
                unit: String(it?.unit || 'Unidad'),
                qty,
                price,
                subtotal: Math.round(price * qty * 100) / 100,
                executed: Boolean(it?.executed)
            };
        });
        const totalEurV = Math.round(items.reduce((s, it) => s + it.subtotal, 0) * 100) / 100;
        const balance = Number(co.balance || 0);
        const freeBalance = state.getFreeVirtualBalance ? state.getFreeVirtualBalance(co) : balance;
        const isB2B = Boolean(order && (order.type === 'B2B_BUY_REQUEST' || order.offerId));
        return {
            co,
            order,
            isB2B,
            title: order ? `${isB2B ? 'Orden B2B' : 'Orden de Compra'} #${order.id}` : 'Lista de la Compra (Borrador I+D)',
            statusLabel: order ? String(order.status || 'EN_PROCESO') : 'BORRADOR EN CARRITO',
            dateStr: order?.date || new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }),
            items,
            totalEurV,
            balance,
            freeBalance
        };
    },

    renderShoppingExportBar(orderId = null, compact = false) {
        const arg = orderId ? `'${this.escapeAttr(orderId)}'` : '';
        return `
        <div class="flex flex-wrap items-center gap-2 ${compact ? 'my-1' : 'my-2'}">
            <button type="button" onclick="ui.exportShoppingListPDF(${arg})" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 text-mars-cyan border border-mars-cyan/60 hover:bg-mars-cyan hover:text-black rounded font-mono font-bold uppercase transition-colors">
                <span>📄 PDF Presupuesto</span>
            </button>
            <button type="button" onclick="ui.copyShoppingListForSheets(${arg})" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-950/50 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black rounded font-mono font-bold uppercase transition-colors">
                <span>📊 Copiar para Google Sheets</span>
            </button>
            <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" title="Abrir una hoja nueva en Google Sheets para pegar con Ctrl+V" class="min-h-[44px] inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-900 text-slate-200 border border-slate-600 hover:border-emerald-400 hover:text-emerald-300 rounded font-mono font-bold uppercase transition-colors">
                <span>sheets.new ↗</span>
            </a>
            <button type="button" onclick="ui.exportShoppingListCSV(${arg})" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-900 text-amber-300 border border-amber-500/50 hover:bg-amber-400 hover:text-black rounded font-mono font-bold uppercase transition-colors">
                <span>⬇️ CSV</span>
            </button>
        </div>`;
    },

    exportShoppingListPDF(orderId = null) {
        const ctx = this._resolvePurchaseExportContext(orderId);
        if (!ctx || ctx.items.length === 0) {
            return this.notify("No hay materiales en esta lista para exportar a PDF.", "warning");
        }
        const rowsHtml = ctx.items.map((it, idx) => `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${idx % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 8px; font-family: monospace; font-weight: bold; color: #0284c7;">${this.escapeHTML(it.id)}</td>
                <td style="padding: 7px 8px; font-weight: 600; color: #0f172a;">${this.escapeHTML(it.name)}${it.executed ? ' <span style="color:#059669; font-size:10px;">(Recibido)</span>' : ''}</td>
                <td style="padding: 7px 8px; text-align: center; color: #475569;">${this.escapeHTML(it.unit)}</td>
                <td style="padding: 7px 8px; text-align: center; font-family: monospace; font-weight: bold;">${it.qty}</td>
                <td style="padding: 7px 8px; text-align: right; font-family: monospace; color: #334155;">${it.price.toFixed(2)} €v</td>
                <td style="padding: 7px 8px; text-align: right; font-family: monospace; font-weight: bold; color: #059669;">${it.subtotal.toFixed(2)} €v</td>
            </tr>
        `).join('');

        const docHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHTML(ctx.title)} - ${this.escapeHTML(ctx.co.name)}</title>
    <style>
        @page { size: A4 portrait; margin: 14mm 12mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; line-height: 1.4; }
        .no-print { position: sticky; top: 0; z-index: 999; background: #0b0f19; color: #ffffff; padding: 12px 20px; border-bottom: 2px solid #00f0ff; display: flex; justify-content: space-between; align-items: center; gap: 10px; font-family: monospace; }
        .btn-print { background: #00f0ff; color: #000000; font-weight: 800; padding: 10px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; text-transform: uppercase; }
        .btn-close { background: #334155; color: #ffffff; font-weight: 600; padding: 10px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .doc-container { max-width: 800px; margin: 0 auto; padding: 24px 20px; background: #ffffff; }
        @media print { .no-print { display: none !important; } .doc-container { max-width: 100% !important; padding: 0 !important; } }
    </style>
</head>
<body>
    <div class="no-print">
        <div>
            <strong style="color: #00f0ff; font-size: 13px;">🚀 MARS-KET OS // SOLICITUD DE MATERIALES PARA FINANZAS</strong>
            <span style="color: #94a3b8; font-size: 12px; margin-left: 10px;">${this.escapeHTML(ctx.co.name)} (${ctx.items.length} partidas)</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">🖨️ Guardar como PDF / Imprimir</button>
            <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
        </div>
    </div>
    <div class="doc-container">
        <div style="border: 2px solid #0f172a; padding: 16px 20px; margin-bottom: 18px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase; letter-spacing: 0.08em; display: block;">
                        HOJA DE PREVISIÓN DE COMPRA · USO INTERNO I+D ➔ FINANZAS
                    </span>
                    <h1 style="margin: 4px 0 0 0; font-size: 20px; font-weight: 900; text-transform: uppercase;">${this.escapeHTML(ctx.title)}</h1>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 15px; font-weight: 900; color: #0f172a;">${this.escapeHTML(ctx.co.name || 'Startup')}</div>
                    <div style="font-family: monospace; font-size: 11px; color: #475569;">Clase 4º ${this.escapeHTML(ctx.co.classGroup || '--')} · Estado: ${this.escapeHTML(ctx.statusLabel)}</div>
                    <div style="font-family: monospace; font-size: 11px; color: #475569;">Fecha: ${this.escapeHTML(ctx.dateStr)}</div>
                </div>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; font-size: 11px;">
                <div><strong>Saldo actual en cuenta:</strong> <span style="font-family: monospace;">${ctx.balance.toFixed(2)} €v</span></div>
                <div><strong>Saldo libre real tras compromisos:</strong> <span style="font-family: monospace; color: ${ctx.freeBalance <= 0 ? '#dc2626' : '#059669'}; font-weight: bold;">${ctx.freeBalance.toFixed(2)} €v</span></div>
                <div><strong>Total lista:</strong> <span style="font-family: monospace; color: #0284c7; font-weight: 900;">${ctx.totalEurV.toFixed(2)} €v</span></div>
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 16px;">
            <thead>
                <tr style="background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 10px;">
                    <th style="padding: 8px; text-align: left; width: 70px;">Código</th>
                    <th style="padding: 8px; text-align: left;">Material / Concepto</th>
                    <th style="padding: 8px; text-align: center; width: 95px;">Unidad</th>
                    <th style="padding: 8px; text-align: center; width: 65px;">Cant.</th>
                    <th style="padding: 8px; text-align: right; width: 95px;">Precio Unit.</th>
                    <th style="padding: 8px; text-align: right; width: 100px;">Subtotal</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
            <tfoot>
                <tr style="background: #f1f5f9; border-top: 2px solid #0f172a;">
                    <td colspan="5" style="padding: 9px 8px; text-align: right; font-weight: 900; text-transform: uppercase;">Total Presupuesto Estimado (€v)</td>
                    <td style="padding: 9px 8px; text-align: right; font-family: monospace; font-size: 14px; font-weight: 900; color: #059669;">${ctx.totalEurV.toFixed(2)} €v</td>
                </tr>
            </tfoot>
        </table>
        <div style="border: 1px solid #cbd5e1; background: #f8fafc; padding: 12px 14px; font-size: 11px; color: #334155;">
            <strong>Uso recomendado en Finanzas y Taller:</strong> Utiliza este desglose como base oficial para redactar el Presupuesto (ECO) y la Orden de Adquisición (DOC_9). Los precios mostrados son virtuales (€v) del catálogo regulado SUPER-MARSKET.
        </div>
    </div>
</body>
</html>`;
        const win = window.open('', '_blank');
        if (!win) {
            return this.notify("⚠️ Tu navegador bloqueó la ventana emergente. Permite las ventanas emergentes para abrir el PDF.", "warning");
        }
        win.document.open();
        win.document.write(docHtml);
        win.document.close();
        win.focus();
    },

    async copyShoppingListForSheets(orderId = null) {
        const ctx = this._resolvePurchaseExportContext(orderId);
        if (!ctx || ctx.items.length === 0) {
            return this.notify("No hay materiales en esta lista para copiar.", "warning");
        }
        const fmtNum = (n) => Number(n || 0).toFixed(2).replace('.', ',');
        const lines = ['Código\tMaterial / Concepto\tUnidad\tCantidad\tPrecio Unit. (€v)\tSubtotal (€v)'];
        ctx.items.forEach((it, idx) => {
            const rowNum = idx + 2;
            const safeName = String(it.name).replace(/[\t\r\n]+/g, ' ');
            const safeUnit = String(it.unit).replace(/[\t\r\n]+/g, ' ');
            lines.push(`${it.id}\t${safeName}\t${safeUnit}\t${it.qty}\t${fmtNum(it.price)}\t=D${rowNum}*E${rowNum}`);
        });
        const lastRow = ctx.items.length + 1;
        lines.push(`TOTAL\t${ctx.co.name || ''}\t\t\t\t=SUMA(F2:F${lastRow})`);
        const tsv = lines.join('\n');

        let copied = false;
        if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
            try {
                await navigator.clipboard.writeText(tsv);
                copied = true;
            } catch (e) {}
        }
        if (!copied) {
            try {
                const ta = document.createElement('textarea');
                ta.value = tsv;
                ta.setAttribute('readonly', '');
                ta.style.position = 'fixed';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.select();
                copied = document.execCommand('copy');
                document.body.removeChild(ta);
            } catch (e) {}
        }
        if (copied) {
            return this.notify("✅ Tabla copiada con fórmulas. Abre sheets.new (o tu plantilla ECO/DOC_9) y pulsa Ctrl+V.", "success");
        }
        return this.notify("No se pudo copiar automáticamente; usa el botón ⬇️ CSV como alternativa.", "warning");
    },

    exportShoppingListCSV(orderId = null) {
        const ctx = this._resolvePurchaseExportContext(orderId);
        if (!ctx || ctx.items.length === 0) {
            return this.notify("No hay materiales en esta lista para descargar CSV.", "warning");
        }
        const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
        const rows = [['Startup', 'Lista', 'Código', 'Material', 'Unidad', 'Cantidad', 'Precio Unit. (€v)', 'Subtotal (€v)'].map(esc).join(';')];
        ctx.items.forEach(it => {
            rows.push([
                ctx.co.name || '',
                ctx.title,
                it.id,
                it.name,
                it.unit,
                it.qty,
                it.price.toFixed(2).replace('.', ','),
                it.subtotal.toFixed(2).replace('.', ',')
            ].map(esc).join(';'));
        });
        rows.push([ctx.co.name || '', ctx.title, 'TOTAL', '', '', '', '', ctx.totalEurV.toFixed(2).replace('.', ',')].map(esc).join(';'));
        const csvContent = '\uFEFF' + rows.join('\r\n');
        const safeCo = String(ctx.co.id || 'startup').replace(/[^a-zA-Z0-9_-]/g, '_');
        const safeRef = orderId ? String(orderId).replace(/[^a-zA-Z0-9_-]/g, '_') : 'carrito';
        const filename = `lista_compra_${safeCo}_${safeRef}.csv`;
        if (typeof this.downloadFile === 'function') {
            this.downloadFile(csvContent, 'csv', filename);
        } else {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        this.notify("⬇️ Archivo CSV de lista de la compra descargado.", "success");
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

        const effectiveRole = this.getEffectiveRole(co);
        const isCEO = effectiveRole === 'CEO';
        const isFinanzas = effectiveRole === 'FINANZAS';
        const isMarketing = effectiveRole === 'MARKETING' || state.user.admin || state.user.isCoordinator;

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
                <span class="text-[10px] text-amber-400/80 block mt-1 font-mono">${(sponsorAmt > 0 && sponsorTierLabel) ? `${this.getSponsorTierBadge ? this.getSponsorTierBadge(sponsorTierLabel) : `[${this.escapeHTML(sponsorTierLabel)}]`} Descuento aplicado` : 'Sin patrocinios activos'}</span>
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
                const isB2B = order.type === 'B2B_BUY_REQUEST' || !!order.offerId;
                let matchesTab = false;
                if (ordersTab === 'EN_PROCESO') {
                    matchesTab = (st === 'PENDIENTE_FINANZAS' || st === 'APROBADO_FINANZAS' || st === 'PENDIENTE_DOCENTE' || st === 'APROBADO_DOCENTE');
                } else if (ordersTab === 'COMPLETADAS') {
                    matchesTab = (st === 'EJECUTADO');
                } else if (ordersTab === 'DENEGADAS') {
                    matchesTab = (st === 'RECHAZADO' || st === 'DENEGADO_DOCENTE' || st === 'CANCELADO_OTRA_EMPRESA');
                }

                if (matchesTab) {
                    const isPending = st === 'PENDIENTE_FINANZAS';
                    const isApproved = st === 'APROBADO_FINANZAS' || st === 'APROBADO_DOCENTE';
                    const isExecuted = st === 'EJECUTADO';
                    const isRejected = st === 'RECHAZADO' || st === 'DENEGADO_DOCENTE' || st === 'CANCELADO_OTRA_EMPRESA';

                    let trackerHtml = '';
                    let stBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    let stLabel = st;

                    if (isB2B) {
                        let b2bTrackerIdx = 0;
                        if (st === 'PENDIENTE_DOCENTE') b2bTrackerIdx = 2;
                        else if (st === 'APROBADO_DOCENTE') b2bTrackerIdx = 3;
                        else if (st === 'EJECUTADO') b2bTrackerIdx = 3;
                        else if (st === 'PENDIENTE_FINANZAS') b2bTrackerIdx = 1;

                        trackerHtml = ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Aduana Docente', 'Taller (Ejecuta)'], b2bTrackerIdx);

                        if (st === 'PENDIENTE_FINANZAS') {
                            stBadge = 'bg-amber-950/40 text-amber-300 border-amber-500 animate-pulse';
                            stLabel = 'PENDIENTE FINANZAS';
                        } else if (st === 'PENDIENTE_DOCENTE') {
                            stBadge = 'bg-purple-950/40 text-purple-300 border-purple-400 animate-pulse';
                            stLabel = '⏳ PENDIENTE DE DOCENTE (ADUANA)';
                        } else if (st === 'APROBADO_DOCENTE') {
                            stBadge = 'bg-blue-950/40 text-blue-300 border-blue-400';
                            stLabel = '✓ APROBADO EN ADUANA (EN TALLER)';
                        } else if (st === 'EJECUTADO') {
                            stBadge = 'bg-emerald-950/40 text-emerald-400 border-emerald-500';
                            stLabel = '✓ EJECUTADO EN TALLER';
                        } else if (st === 'DENEGADO_DOCENTE') {
                            stBadge = 'bg-rose-950/40 text-rose-400 border-rose-500';
                            stLabel = '❌ DENEGADO EN ADUANA (REEMBOLSADO)';
                        } else if (st === 'CANCELADO_OTRA_EMPRESA') {
                            stBadge = 'bg-slate-900 text-slate-400 border-slate-700';
                            stLabel = 'ADJUDICADO A OTRA STARTUP';
                        }
                    } else {
                        let b2cTrackerIdx = 0;
                        if (st === 'APROBADO_FINANZAS') b2cTrackerIdx = 1;
                        else if (st === 'EJECUTADO') b2cTrackerIdx = 2;

                        trackerHtml = ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], b2cTrackerIdx);

                        if (st === 'PENDIENTE_FINANZAS') stBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                        else if (st === 'APROBADO_FINANZAS') stBadge = 'bg-blue-500/20 text-blue-300 border-blue-500';
                        else if (st === 'EJECUTADO') stBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                        else if (st === 'RECHAZADO') stBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';
                    }

                    let finActions = '';
                    if (isFinanzas && isPending) {
                        const isFinBankrupt = Boolean(this.isCompanyBankrupt && this.isCompanyBankrupt(co));
                        if (order.type === 'B2B_BUY_REQUEST') {
                            finActions = `
                            <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-800">
                                ${isFinBankrupt
                                    ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] bg-slate-800 border border-rose-500/60 text-rose-300 px-4 py-2.5 text-xs font-black uppercase flex-1 cursor-not-allowed">🔒 Bloqueado: Números Rojos (≤ 0 €v)</button>`
                                    : `<button type="button" onclick="ui.approveB2BBuyByFinanzas('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-yellow text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1 shadow-[0_0_10px_rgba(255,204,0,0.3)]">[ 🤝 Aprobar Compra B2B y Bloquear en Aduana ]</button>`}
                                <button type="button" onclick="ui.modalRejectOrderWithDoc('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Denegar Compra B2B</button>
                            </div>`;
                        } else {
                            finActions = `
                            <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t border-slate-800">
                                ${isFinBankrupt
                                    ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] bg-slate-800 border border-rose-500/60 text-rose-300 px-4 py-2.5 text-xs font-black uppercase flex-1 cursor-not-allowed">🔒 Bloqueado: Números Rojos (≤ 0 €v)</button>`
                                    : `<button type="button" onclick="ui.modalReviewOrderFinanzas('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1 shadow-[0_0_10px_rgba(0,255,102,0.3)]">Revisar y Autorizar Partidas</button>`}
                                <button type="button" onclick="ui.modalRejectOrderWithDoc('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all flex-1">Denegar Orden</button>
                            </div>`;
                        }
                    }

                    allUnifiedItems.push({
                        date: order.date || '',
                        timestamp: order.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${isPending ? 'border-mars-yellow/60' : 'border-mars-border'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2 flex-wrap">
                                ${isB2B
                                    ? `<span class="text-[10px] font-black uppercase px-2 py-0.5 bg-amber-950 text-mars-yellow border border-amber-500/50">[🤝 MERCADO B2B] COMPRA DE 2ª MANO</span>`
                                    : `<span class="text-[10px] font-black uppercase px-2 py-0.5 bg-cyan-950 text-mars-cyan border border-mars-cyan/40">[🚀 CATÁLOGO B2C] DEPTO: I+D</span>`
                                }
                                ${order.partialApproval ? `<span class="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-500/50 px-2 py-0.5 rounded">⚠️ Aprobación Parcial</span>` : ''}
                            </div>
                            ${trackerHtml}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${stBadge}">${this.escapeHTML(stLabel)}</span>
                                    ${(isApproved && order.partialExecuted) ? `<span class="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-amber-950/60 border border-amber-500/60 text-amber-300 rounded">🟡 Recepción Parcial en Curso</span>` : ''}
                                </div>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">${isB2B ? 'Orden B2B #' : 'Orden #'}${this.escapeHTML(order.id)}</h4>
                                </div>
                                <div class="text-right">
                                    <span class="text-mars-green font-mono font-bold text-sm sm:text-base">${Number(order.total).toFixed(2)} €v</span>
                                    ${(isApproved && order.partialExecuted) ? (() => {
                                        const remVal = (order.items || []).reduce((s, it) => (!it || !it.executed) ? s + (Number(it?.price) || 0) * (Number(it?.qty) || 1) : s, 0);
                                        return `<span class="block text-[11px] text-amber-300 font-mono font-bold">Pendiente taller: ${remVal.toFixed(2)} €v</span>`;
                                    })() : ''}
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(order.date)}</span>
                                </div>
                            </div>
                            <div class="mb-2 flex flex-wrap gap-2">
                                ${(order.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(order.driveUrl))
                                    ? `<a href="${encodeURI(order.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>📄 Orden Adquisición DOC_9 en Docs ↗</span></a>`
                                    : ''
                                }
                                ${(order.sellerDriveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(order.sellerDriveUrl))
                                    ? `<a href="${encodeURI(order.sellerDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-950/40 text-amber-300 border border-amber-500/30 rounded hover:bg-amber-900/50 transition-colors font-mono"><span>📄 Memoria Vendedor en Docs ↗</span></a>`
                                    : ''
                                }
                                ${(order.responseDriveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(order.responseDriveUrl))
                                    ? `<a href="${encodeURI(order.responseDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-amber-950/40 text-amber-300 border border-amber-500/40 rounded hover:bg-amber-900/50 transition-colors font-mono font-bold"><span>📄 Justificación Financiera en Docs ↗</span></a>`
                                    : ''
                                }
                            </div>
                            ${(order.items && order.items.length > 0 && typeof this.renderShoppingExportBar === 'function') ? `
                            <div class="mb-2">
                                ${this.renderShoppingExportBar(order.id, true)}
                            </div>` : ''}
                            ${st === 'PENDIENTE_DOCENTE' ? `<p class="text-xs text-purple-300 font-mono mt-1 mb-2 p-2 bg-purple-950/30 border border-purple-500/30 rounded">🛃 Compra autorizada por Finanzas. Retenida en Aduana Docente a la espera de validación oficial.</p>` : ''}
                            ${st === 'DENEGADO_DOCENTE' ? `<p class="text-xs text-rose-300 font-mono mt-1 mb-2 p-2 bg-rose-950/30 border border-rose-500/30 rounded">❌ Traspaso denegado por Aduana Docente. El 100% del importe ha sido reembolsado en vuestra tesorería.</p>` : ''}
                            ${(st === 'RECHAZADO' && order.rejectReason) ? `<p class="text-xs text-rose-300 font-sans mt-1 mb-2 p-2 bg-rose-950/30 border border-rose-500/40 rounded"><strong>Motivo Finanzas:</strong> "${this.escapeHTML(order.rejectReason)}"</p>` : ''}
                            <div class="space-y-1.5 mb-2 bg-black/60 p-2.5 border border-slate-800">
                                ${(order.items || []).map(it => `
                                    <div class="flex justify-between text-xs ${it.executed ? 'text-emerald-300' : 'text-slate-300'} gap-2">
                                        <span class="break-words">${it.executed ? '✓ ' : (isApproved && order.partialExecuted ? '⏳ ' : '')}${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                        <span class="font-mono text-white shrink-0">${Number(it.price).toFixed(2)} €v</span>
                                    </div>
                                `).join('')}
                                ${(order.rejectedItems && order.rejectedItems.length > 0) ? `
                                    <div class="pt-1.5 border-t border-slate-800">
                                        <span class="text-[10px] text-rose-400 font-bold uppercase block mb-1">Partidas denegadas por Finanzas:</span>
                                        ${order.rejectedItems.map(rit => `
                                            <div class="flex justify-between text-[11px] text-rose-400/80 line-through">
                                                <span>${this.escapeHTML(rit.name)} (x${Number(rit.qty) || 1})</span>
                                                <span class="font-mono">${Number(rit.price).toFixed(2)} €v</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                ` : ''}
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
                            ${isApproved ? `<p class="text-xs text-blue-400 font-mono mt-2 pt-2 border-t border-slate-800">${order.partialExecuted ? '🟡 Recepción Parcial: las partidas marcadas con ✓ ya están compradas y en Taller de I+D; las restantes (⏳) esperan compra física sin requerir nueva aprobación.' : '📦 Orden en Logística de Taller: El Operario ejecuta la compra física real y el ensamble.'}</p>` : ''}
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
                            ${ui.renderWorkflowTracker(['Propuesta I+D', 'Finanzas (Audita)', 'Mercado B2B'], trackerIdx)}
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
                                ? `<div class="mb-2"><a href="${encodeURI(offer.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Informe Técnico de Excedentes en Docs ↗</span></a></div>`
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
                else if (ordersTab === 'DENEGADAS') matchesCampTab = (cst === 'RECHAZADO' || cst === 'DENEGADO');

                if (matchesCampTab) {
                    const campPrice = !isNaN(Number(camp.price)) ? Number(camp.price) : (!isNaN(Number(camp.cost)) ? Number(camp.cost) : 0);
                    const campPkg = camp.packageName || camp.type || 'Campaña Publicitaria';
                    const campTitle = camp.title || camp.type || 'Acción Comercial';

                    let campBadge = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse';
                    if (cst === 'ACTIVO' || cst === 'COMPLETADO') campBadge = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (cst === 'RECHAZADO' || cst === 'DENEGADO') campBadge = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';

                    allUnifiedItems.push({
                        date: camp.date || '',
                        timestamp: camp.timestamp || 0,
                        html: `
                        <div class="bg-slate-900 border ${cst === 'PENDIENTE_FINANZAS' ? 'border-mars-yellow' : 'border-slate-800'} p-4 text-xs mb-3">
                            <div class="flex items-center gap-2 mb-2">
                                <span class="text-[10px] font-black uppercase px-2 py-0.5 bg-yellow-950 text-mars-yellow border border-mars-yellow/40">DEPTO: MARKETING (PAQUETE)</span>
                            </div>
                            ${ui.renderWorkflowTracker(['Solicitud MKT', 'Finanzas (Audita)', 'Activo / Pack'], cst === 'PENDIENTE_FINANZAS' ? 1 : 2)}
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
                            ${(cst === 'DENEGADO' || cst === 'RECHAZADO') && camp.rejectReason ? `<p class="text-rose-300 font-sans text-xs bg-rose-950/30 border border-rose-500/40 p-2 rounded my-1.5"><strong>Motivo Finanzas:</strong> ${this.escapeHTML(camp.rejectReason)}</p>` : ''}
                            <div class="hidden sm:block mb-2">
                                ${(camp.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(camp.driveUrl))
                                    ? `<a href="${encodeURI(camp.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Dossier ROI en Docs ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Justificación ROI legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                            <button type="button" onclick="ui.inspectMktCampDrawer('${this.escapeHTML(camp.id)}')" class="sm:hidden w-full min-h-[44px] mb-2 bg-slate-950 border border-mars-yellow/60 text-mars-yellow font-black uppercase text-xs py-2 px-3">[ 🔍 VER JUSTIFICACIÓN ROI ]</button>
                            ${(isFinanzas && cst === 'PENDIENTE_FINANZAS') ? `
                            <div class="flex flex-col sm:flex-row gap-2 mt-3 pt-2 border-t border-slate-800">
                                ${(this.isCompanyBankrupt && this.isCompanyBankrupt(co))
                                    ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] bg-slate-800 border border-rose-500/60 text-rose-300 px-4 py-2.5 text-xs font-black uppercase flex-1 cursor-not-allowed">🔒 Bloqueado: Números Rojos (≤ 0 €v)</button>`
                                    : `<button type="button" onclick="ui.approveMktCamp('${this.escapeHTML(camp.id)}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all flex-1">Aprobar Paquete MKT</button>`}
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
                                ${ui.renderWorkflowTracker(['Creatividad MKT', 'CEO (Valida)', 'Docente Liderazgo'], ast === 'PENDIENTE_CEO' ? 1 : (ast === 'VALIDADO_CEO' ? 2 : 0))}
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
                                    ? `<div class="mb-3"><a href="${encodeURI(act.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(act.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>📄 Ver Creatividad / Memoria en Docs ↗</span></a></div>`
                                    : ''
                                }
                                ${(ast === 'RECHAZADO_CEO') ? `
                                     <div class="bg-red-950/40 border border-red-500/40 p-2.5 text-xs text-red-300 mb-2 rounded space-y-1.5">
                                         <div><strong class="uppercase">Motivo Devolución CEO:</strong> ${this.escapeHTML(act.feedback || 'Revisión requerida por CEO')}</div>
                                         ${act.returnDriveUrl ? `<div><a href="${encodeURI(act.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white rounded transition-colors font-mono font-bold"><span>📄 Ver Correcciones del CEO en Drive ↗</span></a></div>` : ''}
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
                            ${ui.renderWorkflowTracker(['I+D (BOM)', 'Taller (Montaje)', 'CEO (Aval)', 'Docente FyQ'], (hst === 'DELIVERED_TO_TEACHER' ? 3 : (hst === 'SUBMITTED_TO_CEO' || hst === 'CEO_REVISION' ? 2 : 1)))}
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                                <div>
                                    <span class="text-xs font-black uppercase px-2 py-0.5 border ${hojaBadge}">${this.escapeHTML(hst)}</span>
                                    <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Hoja de Taller y Ensamble (BOM)</h4>
                                </div>
                                <div class="text-right">
                                    <span class="block text-xs text-slate-300 font-mono">${this.escapeHTML(String(hoja.updatedAt || '').slice(0, 10))}</span>
                                </div>
                            </div>
                            ${hoja.driveUrl ? `<div class="mb-2"><a href="${encodeURI(hoja.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(hoja.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono min-h-[44px]"><span>📄 Ver Hoja de Taller en Docs ↗</span></a></div>` : ''}
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
                <p class="text-xs text-slate-300 max-w-md mx-auto mb-4 leading-relaxed">No hay órdenes registradas con este filtro.</p>
                <div class="flex flex-wrap justify-center gap-2">
                    ${effectiveRole === 'TECNICO' ? `
                        <button type="button" onclick="ui.navigate('market')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm">
                            🛒 Explorar SUPER-MARSKET
                        </button>` : ''}
                    ${isFinanzas ? `
                    <button type="button" onclick="ui.navigate('finance')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-bold text-xs uppercase tracking-wider hover:bg-white transition-all shadow-sm">
                        💰 Ir a Finanzas & Movimientos
                    </button>` : ''}
                    <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] px-4 py-2 bg-slate-900 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-wider transition-all">
                        📤 Ver Mis Entregables
                    </button>
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
            const isConsumable = this.isConsumableCatalogItem ? this.isConsumableCatalogItem(item) : false;
            html += `
            <div data-cart-item="${this.escapeHTML(item.id)}" class="flex flex-wrap justify-between items-center gap-2 text-xs bg-black p-2.5 border border-slate-800 transition-all duration-300">
                <div class="flex-grow min-w-0">
                    <span class="text-mars-cyan font-bold uppercase block break-words">${this.escapeHTML(item.name)}</span>
                    <span class="text-slate-300 block">${Number(item.price).toFixed(2)} €v / ${this.escapeHTML(item.unit)}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <button type="button" aria-label="Disminuir cantidad de ${this.escapeHTML(item.name)}" onclick="ui.removeFromCart('${this.escapeHTML(item.id)}')" class="min-h-[44px] min-w-[44px] border border-mars-magenta/50 text-mars-magenta font-black px-2 hover:bg-mars-magenta/20 flex items-center justify-center">-</button>
                    <span class="cart-item-qty text-white font-mono w-6 text-center font-bold">${Number(item.qty)}</span>
                    <button type="button" aria-label="Aumentar 1 de ${this.escapeHTML(item.name)}" onclick="ui.addToCart('${this.escapeHTML(item.id)}', 1, true)" class="min-h-[44px] min-w-[44px] border border-mars-green/50 text-mars-green font-black px-2 hover:bg-mars-green/20 flex items-center justify-center">+</button>
                    ${isConsumable ? `<button type="button" aria-label="Aumentar 5 de ${this.escapeHTML(item.name)}" onclick="ui.addToCart('${this.escapeHTML(item.id)}', 5, true)" class="min-h-[44px] min-w-[44px] border border-mars-cyan/50 text-mars-cyan font-black px-2 hover:bg-mars-cyan/20 flex items-center justify-center font-mono">+5</button>` : ''}
                    <span class="cart-item-subtotal text-mars-green font-mono font-bold w-20 text-right">${sum.toFixed(2)} €v</span>
                </div>
            </div>`;
        });
        const freeBalCart = state.getFreeVirtualBalance ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        html += `</div>
        <div class="bg-slate-900 p-3 mb-4 border border-mars-cyan space-y-1.5">
            <div class="flex justify-between items-center">
                <span class="text-xs text-slate-300 uppercase font-bold">Presupuesto Estimado</span>
                <span id="cart-total-badge" class="text-lg font-orbitron font-black text-mars-cyan">${total.toFixed(2)} €v</span>
            </div>
            <div class="flex justify-between items-center text-[11px] font-mono border-t border-slate-800 pt-1">
                <span class="text-slate-400">Saldo Libre Real disponible:</span>
                <span class="${freeBalCart <= 0 ? 'text-rose-400 font-bold' : 'text-mars-green font-bold'}">${freeBalCart.toFixed(2)} €v</span>
            </div>
            <p id="cart-free-balance-warning" class="${total > freeBalCart ? '' : 'hidden '}text-[11px] text-amber-300 font-sans pt-1">⚠️ El pedido supera tu Saldo Libre Real. Finanzas deberá recortar partidas o esperar nuevos ingresos.</p>
        </div>
        <div class="bg-slate-950/80 border border-slate-800 p-2.5 mb-4 rounded">
            <span class="text-[11px] text-slate-300 font-sans block mb-1">💡 Exportar lista de la compra para elaborar el presupuesto (Finanzas / DOC_9):</span>
            ${this.renderShoppingExportBar(null, true)}
        </div>
        <div class="space-y-1.5 mb-2">
            <label for="order-drive-url" class="text-xs text-mars-cyan font-bold uppercase block">Informe Técnico de Especificación (Google Drive / Docs)</label>
            <div class="mb-2">
                ${this.renderDocTemplateBtn('DOC_9_ORDEN_ADQUISICION')}
            </div>
            <div class="flex flex-col sm:flex-row gap-2">
                <input type="url" id="order-drive-url" value="${this.escapeHTML(this._lastOrderDriveUrl || '')}" oninput="ui._lastOrderDriveUrl = this.value" onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" placeholder="https://docs.google.com/document/d/..." class="flex-1 bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono min-h-[44px]">
                ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('order-drive-url') : ''}
            </div>
            <p class="text-[10px] text-slate-400">La justificación técnica de la compra se aloja en el Google Doc corporativo con permisos de lectura.</p>
        </div>
        `;
        
        const actions = `<button type="button" id="btn-transmit-cart" onclick="ui.confirmCart(${total})" class="min-h-[44px] bg-mars-cyan text-black px-5 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all w-full sm:w-auto">Transmitir a Finanzas</button>`;
        this.showModal("Carrito de la compra (I+D)", html, actions);
    },

    confirmCart(total) {
        const elUrl = document.getElementById('order-drive-url');
        if (!elUrl) return;
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'el informe técnico (DOC_9)' })
            : { valid: Boolean(this.cleanInput(elUrl.value)), url: this.cleanInput(elUrl.value) };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;

        const co = state.data.companies[state.user.coId];
        if (!co) return;
        if (this.getEffectiveRole(co) !== 'TECNICO' && !state.user?.admin) {
            return this.notify("Solo el Departamento Técnico (I+D) puede enviar pedidos al carrito.", "warning");
        }
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        if (!Array.isArray(co.cart) || co.cart.length === 0) {
            return this.notify("Tu carrito está vacío. Añade al menos una partida antes de enviar.", "warning");
        }
        if (this.acquireActionLock && !this.acquireActionLock('confirm-cart-' + state.user.coId, 1500)) return;
        const btnCart = document.getElementById('btn-transmit-cart');
        if (btnCart) btnCart.disabled = true;

        co.orders = co.orders || [];
        const computedTotal = co.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
        const orderNum = ui.getNextOrderNumber ? ui.getNextOrderNumber(co) : String(Date.now()).slice(-3);
        const nowTs = Date.now();
        const newOrder = {
            id: orderNum,
            type: 'B2C_ORDER',
            items: JSON.parse(JSON.stringify(co.cart)),
            total: computedTotal,
            driveUrl: driveUrl,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString(),
            timestamp: nowTs,
            updatedAt: nowTs
        };

        co.orders.unshift(newOrder);
        co.cart = [];
        co.cartUpdatedAt = Date.now();
        this._lastOrderDriveUrl = '';
        
        ui.pushNotification(state.user.coId, 'FINANZAS', `Nueva orden #${newOrder.id} (${computedTotal.toFixed(2)} €v) recibida de I+D. Requiere validación urgente.`, 'warning', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });
        telemetry.log("ORDEN ENVIADA", `I+D generó orden #${newOrder.id}`);
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.notify(`✅ Orden #${newOrder.id} transmitida al Departamento Financiero.`, "success");
        this.render();
    },

    approveOrder(oid, skipLowBalanceConfirm = false) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return this.notify("Solo Finanzas puede aprobar órdenes.", "warning");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        const freeBal = (typeof state.getFreeVirtualBalance === 'function') ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        if (co.balance < order.total) {
            return this.notify("Fondos virtuales insuficientes en el saldo corporativo para autorizar esta orden.", "error");
        }
        const freeAfter = freeBal - Number(order.total || 0);
        if (freeAfter <= 0 && !skipLowBalanceConfirm && typeof this.confirmAction === 'function') {
            const msg = freeBal < order.total
                ? `Tienes ${freeBal.toFixed(2)} €v libres (descontando órdenes ya aprobadas pendientes de taller). Autorizar ${Number(order.total).toFixed(2)} €v dejará el saldo libre en ${freeAfter.toFixed(2)} €v y activará bloqueo de Números Rojos. ¿Continuar?`
                : `Esta autorización dejará el saldo libre en 0.00 €v y activará el bloqueo de Números Rojos hasta conseguir nuevos ingresos. ¿Continuar?`;
            return this.confirmAction('⚠️ Alerta de Saldo Libre Crítico', msg, () => this.approveOrder(oid, true), 'Autorizar Igualmente');
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-approve-order-' + order.id, 1500)) return;

        order.status = 'APROBADO_FINANZAS';
        order.approvedAt = Date.now();
        order.updatedAt = Date.now();
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha APROBADO la orden #${order.id} (${order.total.toFixed(2)} €v). Ya está en Logística.`, 'success', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });
        ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nueva orden #${order.id} aprobada lista para ensamblaje físico.`, 'info', { view: 'cart', anchorId: 'ops-orders-tracking-panel' });
        
        telemetry.log("ORDEN APROBADA", `Finanzas aprobó orden #${order.id} por ${order.total}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`✅ Orden #${order.id} aprobada. Pasa a Logística de Despliegue Físico.`, "success");
        this.render();
    },

    rejectOrder(oid) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return this.notify("Solo Finanzas puede rechazar órdenes.", "warning");
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const order = co.orders.find(o => String(o.id) === String(oid));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        order.status = 'RECHAZADO';
        order.rejectedAt = Date.now();
        order.updatedAt = Date.now();
        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha RECHAZADO la orden #${order.id}. Revisa justificación o presupuesto.`, 'error', { view: 'orders', filter: 'DENEGADAS', dept: 'TECNICO' });
        
        telemetry.log("ORDEN RECHAZADA", `Finanzas rechazó orden #${order.id}`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`❌ Orden #${order.id} rechazada.`, "info");
        this.render();
    },

    approveMktCamp(campId, skipLowBalanceConfirm = false) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'PENDIENTE_FINANZAS') return;

        const price = Number(camp.price) || 0;
        const freeBal = (typeof state.getFreeVirtualBalance === 'function') ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        if (co.balance < price) return this.notify("Fondos virtuales insuficientes para contratar este paquete.", "error");
        const freeAfter = freeBal - price;
        if (freeAfter <= 0 && !skipLowBalanceConfirm && typeof this.confirmAction === 'function') {
            const msg = `Contando pedidos aprobados pendientes de taller (${freeBal.toFixed(2)} €v libres), autorizar este pack (-${price.toFixed(2)} €v) dejará el saldo libre en ${freeAfter.toFixed(2)} €v (bloqueo Números Rojos). ¿Continuar?`;
            return this.confirmAction('⚠️ Alerta de Saldo Libre Crítico', msg, () => this.approveMktCamp(campId, true), 'Autorizar Pack');
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-approve-mkt-' + campId, 1500)) return;

        camp.status = 'ACTIVO';
        camp.approvedAt = Date.now();
        camp.updatedAt = Date.now();
        state.addToLedger(state.user.coId, `[PUBLICIDAD] Contratación de ${camp.packageName}`, 'MARKETING', -price);
        
        ui.pushNotification(state.user.coId, 'MARKETING', `Finanzas autorizó el paquete "${camp.packageName}". Ya puedes publicar tus ${camp.totalActions} acciones.`, 'success', { view: 'campaigns', anchorId: 'mkt-campaigns-section' });
        telemetry.log("MKT APROBADO", `Aprobado ${camp.packageName} (-${price}€v)`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`✅ Paquete publicitario activado y fondos descontados del Ledger.`, "success");
        this.render();
    },

    approveMktPackage(campId) {
        return this.approveMktCamp(campId);
    },

    rejectMktPackage(campId) {
        return this.rejectMktCamp(campId);
    },

    rejectMktCamp(campId, directReason = null) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'PENDIENTE_FINANZAS') return;

        if (!directReason) {
            return this.modalRejectMktCamp(campId);
        }

        camp.status = 'DENEGADO';
        camp.rejectReason = directReason;
        camp.rejectedAt = Date.now();
        camp.updatedAt = Date.now();
        ui.pushNotification(state.user.coId, 'MARKETING', `Finanzas denegó el paquete "${camp.packageName}". Motivo: ${directReason}`, 'error', { view: 'campaigns', anchorId: 'mkt-campaigns-section' });
        telemetry.log("MKT RECHAZADO", `Denegado ${camp.packageName} (${directReason})`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`❌ Solicitud de paquete de marketing denegada.`, "info");
        this.render();
    },

    modalRejectMktCamp(campId) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        const camp = (co?.marketingCampaigns || []).find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'PENDIENTE_FINANZAS') return;
        const reasons = [
            "Saldo insuficiente o reservado para materiales críticos de I+D",
            "El paquete supera el límite recomendable para esta fase",
            "El Brief Creativo y Justificación ROI (DOC_5) requiere revisión",
            "Conviene esperar a ingresar contrato comercial o patrocinio"
        ];
        const html = `
            <div class="space-y-3 font-sans text-xs">
                <p class="text-slate-300 leading-relaxed">Vas a denegar el paquete <strong>${this.escapeHTML(camp.packageName || 'Marketing')}</strong> (${Number(camp.price || 0).toFixed(2)} €v). Selecciona el motivo tipificado (Zero-Text):</p>
                <label for="reject-mkt-camp-reason" class="text-mars-magenta uppercase font-bold block">Motivo Tipificado</label>
                <select id="reject-mkt-camp-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white outline-none">
                    ${reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('')}
                </select>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRejectMktCamp('${this.escapeHTML(campId)}')" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors w-full sm:w-auto">Confirmar Denegación de Pack</button>`;
        this.showModal("Denegar Paquete Publicitario", html, actions);
    },

    confirmRejectMktCamp(campId) {
        const el = document.getElementById('reject-mkt-camp-reason');
        const reason = el ? this.cleanInput(el.value) : 'Prioridad presupuestaria de la empresa';
        this.closeModal();
        this.rejectMktCamp(campId, reason);
    },

    approveB2BSell(offerId) {
        if (!state.user || (this.getEffectiveRole() !== 'FINANZAS' && !state.user.admin)) {
            return this.notify("Solo el Departamento de Finanzas puede aprobar ventas B2B.", "warning");
        }
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        state.data.b2bMarket = state.data.b2bMarket || [];
        const offer = state.data.b2bMarket.find(o => o.id === offerId && o.sellerCoId === state.user.coId);
        if (!offer) return this.notify("Oferta B2B no localizada.", "error");
        if (offer.status !== 'PENDIENTE_FINANZAS') {
            return this.notify("Esta propuesta B2B ya ha sido tramitada.", "warning");
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-approve-b2bsell-' + offerId, 1500)) return;

        offer.status = 'EN_VENTA';
        offer.updatedAt = Date.now();

        if (co.orders && offer.sourceOrderKey) {
            const [ordId, itemIdx] = offer.sourceOrderKey.split('-');
            const ord = co.orders.find(o => String(o.id) === String(ordId));
            if (ord && ord.items && ord.items[Number(itemIdx)]) {
                ord.items[Number(itemIdx)].b2bStatus = 'EN_VENTA';
            }
        }

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha aprobado y publicado en B2B: ${offer.itemName} por ${Number(offer.price).toFixed(2)} €v.`, 'success', { view: 'market' });
        telemetry.log("OFERTA B2B APROBADA", `Finanzas aprobó venta B2B: ${offer.itemName} por ${offer.price}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`✅ Oferta B2B de "${offer.itemName}" aprobada y publicada en el mercado.`, "success");
        this.render();
    },

    modalRejectB2BSell(offerId) {
        if (!state.user || (this.getEffectiveRole() !== 'FINANZAS' && !state.user.admin)) {
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
                    <input type="number" id="b2b-counter-price" value="${Number(offer.price).toFixed(2)}" min="0.10" step="0.01" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold outline-none">
                    <p class="text-[10px] text-slate-400 mt-1">El Dpto. Técnico recibirá esta recomendación de precio para ajustar la propuesta.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRejectB2BSell('${this.escapeHTML(offerId)}')" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-black transition-all">Devolver Propuesta a Técnico</button>`;
        this.showModal("Devolver Propuesta B2B", html, actions);
    },

    confirmRejectB2BSell(offerId) {
        if (!state.user || (this.getEffectiveRole() !== 'FINANZAS' && !state.user.admin)) return;
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

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha devuelto la propuesta B2B de "${offer.itemName}". Precio sugerido: ${counterPrice.toFixed(2)} €v.`, 'warning', { view: 'tech_workshop' });
        telemetry.log("PROPUESTA B2B RECHAZADA", `Finanzas devolvió venta B2B: ${offer.itemName}. Motivo: ${reason}. Sugerido: ${counterPrice}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.notify(`↩ Propuesta devuelta a Técnico con precio sugerido de ${counterPrice.toFixed(2)} €v.`, "info");
        this.render();
    },

    withdrawB2BOffer(offerId) {
        if (!state.user || (this.getEffectiveRole() !== 'FINANZAS' && !state.user.admin)) {
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

        ui.pushNotification(state.user.coId, 'TECNICO', `Finanzas ha retirado del mercado B2B: ${offer.itemName}. Devuelto al inventario de taller.`, 'info', { view: 'tech_workshop' });
        telemetry.log("OFERTA B2B RETIRADA", `Finanzas retiró del mercado B2B: ${offer.itemName}`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`🗑️ Oferta de "${offer.itemName}" retirada del mercado. Pieza devuelta al taller.`, "success");
        this.render();
    },

    modalCrisisAction(crisisId) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;
        const crisis = (co.crisisAlerts || []).find(a => String(a.id) === String(crisisId)) || (co.crisisAlerts || [])[0] || {};
        const expId = crisis.id || ('EXP-' + Date.now().toString().slice(-4));
        const articulo = crisis.article || 'Infracción Normativa Regulatoria';
        const motivo = crisis.reason || 'Sanción disciplinaria AEE';
        const cuantia = Number(crisis.amount || 0).toFixed(2);
        const immutableText = `COMUNICADO OFICIAL DE SANCIÓN AEE: Expediente ${expId} incoado por ${articulo}. Motivo: "${motivo}". Penalización aplicada al saldo: -${cuantia} €v.`;

        const templateBtn = this.renderDocTemplateBtn ? this.renderDocTemplateBtn('DOC_3_COMUNICADO_SANCION', '📄 Modelo de Comunicado de Crisis (Vista previa)') : '';

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
                    <div class="flex flex-col sm:flex-row gap-2 mb-2">
                        <input type="url" id="crisis-drive-url" placeholder="https://docs.google.com/document/d/..." class="flex-1 min-h-[44px] bg-slate-900 border border-red-500/60 p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-red-400" required>
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('crisis-drive-url') : ''}
                    </div>
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
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const inputDrive = document.getElementById('crisis-drive-url');
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(inputDrive ? inputDrive.value : '', inputDrive, { required: true, label: 'el Comunicado de Crisis (DOC_3)' })
            : { valid: Boolean(inputDrive && this.cleanInput(inputDrive.value)), url: inputDrive ? this.cleanInput(inputDrive.value) : '' };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock('notify-crisis-' + (expId || '0'), 1500)) return;

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

        const effectiveRole = this.getEffectiveRole(co);
        const isCEO = effectiveRole === 'CEO';
        const isFinanzas = effectiveRole === 'FINANZAS';
        co.ledger = co.ledger || [];
        co.realCosts = co.realCosts || [];
        const docs = co.deliverables || {};

        const virtualSpend = co.ledger.filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const maxVisibleLedger = 100;
        const activeLedgerFilter = this.ledgerFilter || 'ALL';
        const deptFilterMap = {
            TECNICO: ['TECNICO', 'ADUANA_B2B', 'I+D'],
            MARKETING: ['MARKETING'],
            OPERACIONES_IA: ['OPERACIONES_IA', 'OPERACIONES'],
            CEO: ['CEO', 'TASAS_ADMINISTRATIVAS', 'REGISTRO_MERCANTIL', 'CONTRATO_COMERCIAL'],
            DOCENTE: ['DOCENTE', 'AEE', 'PATROCINIO']
        };
        const filteredLedger = co.ledger.filter(entry => {
            if (activeLedgerFilter === 'ALL') return true;
            if (activeLedgerFilter === 'INGRESOS') return Number(entry.delta || 0) > 0;
            if (activeLedgerFilter === 'GASTOS') return Number(entry.delta || 0) < 0;
            const deptUp = String(entry.dept || '').toUpperCase();
            const keys = deptFilterMap[activeLedgerFilter] || [activeLedgerFilter];
            return keys.some(k => deptUp.includes(k));
        });
        const visibleLedger = filteredLedger.slice(0, maxVisibleLedger);

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
            const isPhaseUnlocked = (typeof this.isPhaseBalanceUnlocked === 'function') ? this.isPhaseBalanceUnlocked(p.phase, co) : true;
            const isInWindow = (typeof this.isPhaseBalanceInWindow === 'function') ? this.isPhaseBalanceInWindow(p.phase, co) : true;
            const isMasterOrAdmin = Boolean((state.user && state.user.admin) || co.unlockAllContracts === true);
            const canRegister = isFinanzas && (isPhaseUnlocked || isMasterOrAdmin);

            const bStatus = b ? (b.status || 'DELIVERED_TO_TEACHER') : null;
            let statusBadge = '';
            if (b) {
                if (bStatus === 'PENDIENTE_CEO') {
                    statusBadge = '<span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-400 animate-pulse">🟡 EN REVISIÓN CEO</span>';
                } else if (bStatus === 'RETURNED_BY_CEO') {
                    statusBadge = '<span style="background-color: rgba(255, 0, 85, 0.15); border: 1px solid #ff0055; color: #ff0055;" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded animate-pulse">🔴 DEVUELTO POR CEO</span>';
                } else {
                    statusBadge = '<span style="background-color: rgba(0, 255, 102, 0.15); border: 1px solid #00ff66; color: #00ff66;" class="text-[10px] font-mono font-bold px-2 py-0.5 rounded">🟢 ENTREGADO A ECONOMÍA</span>';
                }
            }

            return `
            <div class="p-3.5 bg-black/70 border border-slate-800 rounded flex flex-col gap-2.5">
                <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-black uppercase text-amber-400 font-orbitron">${this.escapeHTML(p.title)}</span>
                        <span class="text-[10px] text-slate-400 font-mono">Corte: ${this.escapeHTML(p.cutoffLabel)} • Plazo: ${this.escapeHTML(p.windowEndLabel || '14 días tras corte')}</span>
                        ${statusBadge}
                    </div>
                    ${b ? `
                        <div class="mt-1.5 space-y-0.5">
                            <span class="inline-block text-[11px] text-emerald-300 font-semibold">✓ Dictamen: ${this.escapeHTML(b.verdict || 'Auditado')}</span>
                            <div class="text-[10px] text-slate-400 font-mono">
                                Saldo congelado: <span class="text-white font-bold">${Number(b.snapshot?.balance || 0).toFixed(2)} €v</span> | Gasto: <span class="text-mars-yellow font-bold">${Number(b.snapshot?.virtualSpend || 0).toFixed(2)} €v</span> (${this.escapeHTML(b.date || '')})
                            </div>
                            ${b.returnReason ? `<p class="text-[10px] text-rose-300 font-sans italic mt-1">⚠️ Observaciones CEO: "${this.escapeHTML(b.returnReason)}"</p>` : ''}
                        </div>
                    ` : `
                        <p class="text-[11px] text-slate-400 italic mt-1">Pendiente de cierre y entrega formal por el Dpto. Financiero tras el corte de fase.</p>
                    `}
                </div>
                <div class="w-full flex items-center justify-end flex-wrap gap-2 pt-2 border-t border-slate-800/70">
                    ${b ? `
                        <a href="${encodeURI(b.driveUrl).replace(/"/g, '&quot;')}" data-doc-url="${this.escapeAttr(b.driveUrl)}" onclick="ui.markDocOpened(this.dataset.docUrl)" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 rounded font-mono hover:bg-cyan-900/60 transition-colors">
                            <span>DOC_17 ↗</span>
                        </a>
                        ${(bStatus === 'RETURNED_BY_CEO' && b.returnDriveUrl) ? `
                            <a href="${encodeURI(b.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2.5 py-1 text-xs bg-red-950/60 text-red-200 border border-red-400 rounded font-mono hover:bg-red-900/60 transition-colors font-bold">
                                <span>📄 Ver Informe Devolución CEO ↗</span>
                            </a>
                        ` : ''}
                        ${(isCEO && bStatus === 'PENDIENTE_CEO') ? `
                            <button type="button" onclick="ui.approvePhaseBalanceByCEO('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-[11px] px-3 py-1 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">
                                [ ✓ Visar ]
                            </button>
                            <button type="button" onclick="ui.modalCeoReturnPhaseBalance('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-[11px] px-3 py-1 hover:bg-mars-magenta hover:text-white transition-all">
                                [ ↩ Devolver ]
                            </button>
                        ` : ''}
                        ${(isFinanzas && (bStatus === 'PENDIENTE_CEO' || bStatus === 'RETURNED_BY_CEO')) ? `
                            <button type="button" onclick="ui.modalRegisterPhaseBalance('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-slate-800 border border-slate-700 text-slate-200 hover:text-white px-2 py-1 text-[11px] uppercase font-bold transition-all">
                                ✏️ Modificar
                            </button>
                        ` : ''}
                    ` : `
                        ${canRegister ? `
                            <div class="flex items-center gap-1.5 w-full">
                                ${isMasterOrAdmin && !isPhaseUnlocked ? `<span class="px-1.5 py-0.5 bg-amber-400 text-black text-[9px] font-mono font-bold uppercase rounded shrink-0">🧪 Sandbox</span>` : ''}
                                <button type="button" onclick="ui.modalRegisterPhaseBalance('${this.escapeHTML(p.phase)}')" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-[11px] px-3 py-1 hover:bg-white transition-all shadow-sm w-full">
                                    [ + Registrar Balance Fase ${this.escapeHTML(p.phase)} ]
                                </button>
                            </div>
                        ` : (!isPhaseUnlocked ? `
                            <button type="button" disabled class="min-h-[44px] w-full bg-slate-900 border border-slate-800 text-slate-500 font-bold uppercase text-[11px] px-2.5 py-1 cursor-not-allowed text-center" title="Se abrirá al cerrar la fase (${p.cutoffLabel})">
                                🔒 Bloqueado hasta cierre (${this.escapeHTML(p.cutoffLabel)})
                            </button>
                        ` : `
                            <span class="text-[10px] text-slate-500 font-mono uppercase">En espera</span>
                        `)}
                    `}
                </div>
            </div>`;
        }).join('');

        const anyBalancePhaseUnlocked = phaseDefs.some(p => (typeof this.isPhaseBalanceUnlocked === 'function') ? this.isPhaseBalanceUnlocked(p.phase, co) : true);
        const isMasterOrAdminFin = Boolean((state.user && state.user.admin) || co.unlockAllContracts === true);
        const rawPhaseBalancesBlockHtml = `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400">
            <div class="flex justify-between items-center mb-3 border-b border-mars-border pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-amber-400 text-sm uppercase tracking-tighter font-black">📊 Balances de Cierre de Fase (DOC_17)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Control de tesorería y dictamen contable al final de cada fase.</p>
                    <p class="text-[11px] text-cyan-300 font-sans mt-1">ℹ️ Cierre contable interno de caja (alimenta Prensa DOC_15); las entregas evaluables de Economía (20% ECO) van aparte en <button type="button" onclick="ui.navigate('role_deliverables')" class="underline font-bold text-white hover:text-mars-cyan">Mis Entregables ➔</button>.</p>
                </div>
                <span class="text-xs bg-amber-950/40 text-amber-300 font-mono px-2 py-0.5 border border-amber-500/40">
                    ${Object.keys(co.phaseBalances || {}).length}/4 Fases
                </span>
            </div>
            <div class="space-y-2.5">
                ${phaseBalancesCardsHtml}
            </div>
        </div>`;
        const phaseBalancesBlockHtml = (!isMasterOrAdminFin && !anyBalancePhaseUnlocked && Object.keys(co.phaseBalances || {}).length === 0) ? `
        <details class="terminal-border bg-mars-card/80 border border-slate-800 rounded">
            <summary class="min-h-[44px] px-4 py-3 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-white select-none">
                <span>🔒 Próximas Fases: Balances de Cierre DOC_17 (Se abren el 15/12)</span>
                <span class="text-mars-cyan shrink-0">▼ Ver</span>
            </summary>
            <div class="p-2 pt-0">${rawPhaseBalancesBlockHtml}</div>
        </details>` : rawPhaseBalancesBlockHtml;

        const pendingOrdersList = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS');
        const pendingB2BSales = (state.data.b2bMarket || []).filter(o => o && o.sellerCoId === state.user.coId && o.status === 'PENDIENTE_FINANZAS');
        const pendingMktPacks = (co.marketingCampaigns || []).filter(c => c.status === 'PENDIENTE_FINANZAS');
        const totalPendingFinCount = pendingOrdersList.length + pendingB2BSales.length + pendingMktPacks.length;

        const isFinBankrupt = Boolean(this.isCompanyBankrupt && this.isCompanyBankrupt(co));
        const finStatusBannerHtml = isFinanzas ? (totalPendingFinCount > 0 ? `
            <div class="mb-4 p-3.5 bg-amber-950/50 border border-amber-500/60 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <span class="font-bold text-mars-yellow uppercase">👉 Tienes ${totalPendingFinCount} solicitud(es) pendiente(s) de tu firma en la Bandeja inferior.</span>
                <span class="text-[11px] text-slate-300 font-sans">Revisa las partidas o aprueba con 1 clic para desbloquear al equipo.</span>
            </div>` : `
            <div class="mb-4 p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                    <span class="font-bold text-emerald-300 uppercase block">🟢 Todo al día en Finanzas (0 solicitudes pendientes)</span>
                    <span class="text-[11px] text-slate-300 font-sans">Cuando Técnico o Marketing envíen compras o packs de campaña, aparecerán aquí para tu visto bueno.</span>
                </div>
                <button type="button" onclick="ui.navigate('role_deliverables')" class="min-h-[44px] shrink-0 px-3.5 py-2 bg-slate-900 border border-emerald-500/50 text-emerald-300 hover:bg-emerald-500 hover:text-black font-bold text-xs uppercase rounded">📤 Mis Entregables ➔</button>
            </div>`) : (totalPendingFinCount > 0 ? `
            <div class="mb-4 p-3.5 bg-slate-900/90 border border-amber-500/50 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                <div>
                    <span class="font-bold text-mars-yellow uppercase block">⏳ Turno de Finanzas: ${totalPendingFinCount} solicitud(es) pendiente(s) de autorización</span>
                    <span class="text-[11px] text-slate-300 font-sans">Solo el Dpto. Financiero puede autorizarlas. Si el titular ha faltado hoy, el CEO puede vincular al Socio Auxiliar o consultar en Bóveda de Órdenes.</span>
                </div>
                <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] shrink-0 px-3.5 py-2 bg-slate-950 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase rounded">📡 Ver en Bóveda ➔</button>
            </div>` : '');

        let pendingAuthorizationsHtml = '';
        if (isFinanzas && totalPendingFinCount > 0) {
            pendingAuthorizationsHtml = `
            <div class="terminal-border p-4 sm:p-5 mb-6 border-t-4 border-t-mars-yellow bg-slate-900 shadow-md">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 border-b border-slate-800 pb-2">
                    <div class="flex items-center gap-2">
                        <span class="w-2.5 h-2.5 rounded-full bg-mars-yellow animate-ping"></span>
                        <h3 class="font-orbitron text-mars-yellow font-bold text-xs sm:text-sm uppercase tracking-tight">
                            ⚡ Bandeja de Autorización Presupuestaria (${totalPendingFinCount} pendientes)
                        </h3>
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 uppercase">Requieren Acción Financiera</span>
                </div>
                <div class="space-y-3">
                    ${pendingOrdersList.map(order => {
                        const isB2BBuy = order.type === 'B2B_BUY_REQUEST';
                        const itemsSummary = (order.items || []).map(i => `${this.escapeHTML(i.name)} ×${Number(i.qty) || 1}`).join(' · ');
                        return `
                        <div class="bg-black/70 border border-amber-500/50 p-3.5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded ${isB2BBuy ? 'bg-amber-950 text-mars-yellow border border-amber-500' : 'bg-cyan-950 text-mars-cyan border border-cyan-500'}">
                                        ${isB2BBuy ? '🤝 MERCADO B2B • COMPRA DE 2ª MANO' : '🧪 I+D • PEDIDO DE MATERIALES'}
                                    </span>
                                    <span class="text-xs text-slate-400 font-mono">Orden #${this.escapeHTML(order.id)}</span>
                                </div>
                                <h4 class="text-white font-bold text-xs sm:text-sm uppercase">
                                    ${isB2BBuy ? `${this.escapeHTML(order.items[0]?.name || 'Pieza B2B')} (Vendedor: ${this.escapeHTML(order.sellerName || 'Otra Empresa')})` : `${(order.items || []).length} Partidas solicitadas por I+D`}
                                </h4>
                                ${(!isB2BBuy && itemsSummary) ? `<p class="text-[11px] text-slate-300 font-sans mt-0.5 break-words">${itemsSummary}</p>` : ''}
                                <div class="flex items-center gap-2 mt-1">
                                    <span class="text-mars-green font-mono font-bold text-sm">${Number(order.total).toFixed(2)} €v</span>
                                    ${order.driveUrl ? `<a href="${encodeURI(order.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-2 py-1 text-mars-cyan underline font-mono text-xs">[Docs ↗]</a>` : ''}
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
                                ${isB2BBuy ? `
                                    ${isFinBankrupt
                                        ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] flex-1 md:flex-initial bg-slate-900 border border-rose-500/60 text-rose-300 px-4 py-2 text-xs font-black uppercase cursor-not-allowed">🔒 Bloqueado (≤ 0 €v)</button>`
                                        : `<button type="button" onclick="ui.approveB2BBuyByFinanzas('${this.escapeHTML(order.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-yellow text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_10px_rgba(255,204,0,0.4)]">[ 🤝 Aprobar Compra B2B y Bloquear en Aduana ]</button>`
                                    }
                                    <button type="button" onclick="ui.modalRejectOrderWithDoc('${this.escapeHTML(order.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all">
                                        Denegar Compra B2B
                                    </button>
                                ` : `
                                    ${isFinBankrupt
                                        ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] flex-1 md:flex-initial bg-slate-900 border border-rose-500/60 text-rose-300 px-4 py-2 text-xs font-black uppercase cursor-not-allowed">🔒 Bloqueado (≤ 0 €v)</button>`
                                        : `<button type="button" onclick="ui.approveOrder('${this.escapeHTML(order.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-green text-black px-3.5 py-2 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ Aprobar Todo ]</button>
                                           <button type="button" onclick="ui.modalReviewOrderFinanzas('${this.escapeHTML(order.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-slate-800 border border-mars-cyan text-mars-cyan px-3 py-2 text-xs font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all">⚙️ Revisar Partidas</button>`
                                    }
                                    <button type="button" onclick="ui.modalRejectOrderWithDoc('${this.escapeHTML(order.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all">
                                        Denegar Orden
                                    </button>
                                `}
                            </div>
                        </div>`;
                    }).join('')}

                    ${pendingB2BSales.map(offer => `
                        <div class="bg-black/70 border border-amber-500/50 p-3.5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-yellow-950 text-mars-yellow border border-yellow-500">
                                        🤝 PROPUESTA DE VENTA B2B (I+D)
                                    </span>
                                </div>
                                <h4 class="text-white font-bold text-xs sm:text-sm uppercase">${this.escapeHTML(offer.itemName)} (x${Number(offer.qty) || 1})</h4>
                                <span class="text-mars-green font-mono font-bold text-sm mt-1 block">Precio propuesto: ${Number(offer.price).toFixed(2)} €v</span>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                <button type="button" onclick="ui.approveB2BSell('${this.escapeHTML(offer.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all">
                                    Aprobar y Publicar B2B
                                </button>
                                <button type="button" onclick="ui.modalRejectB2BSell('${this.escapeHTML(offer.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all">
                                    Rechazar / Contraoferta
                                </button>
                            </div>
                        </div>
                    `).join('')}

                    ${pendingMktPacks.map(camp => `
                        <div class="bg-black/70 border border-amber-500/50 p-3.5 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div class="min-w-0 flex-1">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-yellow-950 text-mars-yellow border border-yellow-500">
                                        📢 SOLICITUD PACK MARKETING
                                    </span>
                                </div>
                                <h4 class="text-white font-bold text-xs sm:text-sm uppercase">${this.escapeHTML(camp.packageName || camp.type || 'Campaña')}</h4>
                                <span class="text-mars-green font-mono font-bold text-sm mt-1 block">${Number(camp.price || camp.cost || 0).toFixed(2)} €v</span>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full md:w-auto">
                                ${isFinBankrupt
                                    ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] flex-1 md:flex-initial bg-slate-900 border border-rose-500/60 text-rose-300 px-4 py-2 text-xs font-black uppercase cursor-not-allowed">🔒 Bloqueado (≤ 0 €v)</button>`
                                    : `<button type="button" onclick="ui.approveMktPackage('${this.escapeHTML(camp.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all">Autorizar Pack</button>`
                                }
                                <button type="button" onclick="ui.rejectMktPackage('${this.escapeHTML(camp.id)}')" class="min-h-[44px] flex-1 md:flex-initial bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 text-xs font-black uppercase hover:bg-mars-magenta hover:text-white transition-all">
                                    Denegar Pack
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

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

        const committedB2C = state.getCommittedB2CBalance ? state.getCommittedB2CBalance(co) : 0;
        const freeBalFin = state.getFreeVirtualBalance ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        const ledgerFilterChipsHtml = [
            { id: 'ALL', label: 'Todos' },
            { id: 'INGRESOS', label: 'Ingresos +' },
            { id: 'GASTOS', label: 'Gastos -' },
            { id: 'TECNICO', label: 'I+D / B2B' },
            { id: 'MARKETING', label: 'MKT' },
            { id: 'OPERACIONES_IA', label: 'Taller' },
            { id: 'CEO', label: 'CEO / Contratos' },
            { id: 'DOCENTE', label: 'AEE / Claustro' }
        ].map(f => `<button type="button" onclick="ui.setLedgerFilter('${f.id}')" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase rounded border transition-all ${activeLedgerFilter === f.id ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'}">${f.label}</button>`).join('');

        wrapper.innerHTML = `
        ${debtAlertHtml}
        ${finStatusBannerHtml}
        ${pendingAuthorizationsHtml}
        ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
        ${this.renderRoleActivePhaseDeliverableBanner ? this.renderRoleActivePhaseDeliverableBanner(co) : ''}
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <!-- Columna Izquierda: Balance, KPIs y Ledger Inmutable -->
            <div class="lg:col-span-7 space-y-6">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="terminal-border bg-mars-card p-4 border-t-2 ${co.balance < 0 ? 'border-t-rose-500' : 'border-t-mars-green'} text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">${co.balance < 0 ? 'Deuda Virtual' : 'Saldo Disponible'}</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black ${co.balance < 0 ? 'text-rose-400 animate-pulse' : 'text-mars-green'}">${Number(co.balance).toFixed(2)} €v</p>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-yellow text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Comprometido en Taller</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-yellow">${committedB2C.toFixed(2)} €v</p>
                        <span class="text-[10px] text-slate-300 font-mono block mt-0.5">Libre real: <strong class="${freeBalFin <= 0 ? 'text-rose-400' : 'text-mars-cyan'}">${freeBalFin.toFixed(2)} €v</strong></span>
                    </div>
                    <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan text-center">
                        <span class="text-xs text-slate-300 uppercase font-bold tracking-wider block mb-1">Coste Operativo Neto</span>
                        <p class="text-lg sm:text-xl font-orbitron font-black text-mars-cyan">${netOpCosts.toFixed(2)} €v</p>
                        ${sponsorAmt > 0 ? `<span class="text-[10px] text-amber-400 font-mono block mt-0.5">(Bruto: ${grossCosts.toFixed(2)} | Patr: -${sponsorAmt.toFixed(2)}${sponsorTierLabel ? ` ${this.getSponsorTierBadge ? this.getSponsorTierBadge(sponsorTierLabel) : `[${this.escapeHTML(sponsorTierLabel)}]`}` : ''})</span>` : `<span class="text-[10px] text-slate-400 font-mono block mt-0.5">Acumulado: -${virtualSpend.toFixed(2)} €v</span>`}
                    </div>
                </div>

                <!-- Ledger Inmutable -->
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex flex-wrap justify-between items-center mb-3 border-b border-mars-border pb-2 gap-2">
                        <div>
                            <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Historial de Cobros y Pagos</h3>
                            <p class="text-xs text-slate-300 uppercase mt-0.5">Movimientos de €v ordenados cronológicamente (del más reciente al más antiguo).</p>
                        </div>
                        <span class="text-xs bg-slate-800 text-slate-200 font-mono px-2.5 py-1 border border-slate-700">${filteredLedger.length}/${co.ledger.length} Movimientos</span>
                    </div>
                    <div class="flex flex-wrap gap-1.5 mb-3">
                        ${ledgerFilterChipsHtml}
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
                                `).join('') || `<tr><td colspan="4" class="text-center py-4 text-slate-300 italic text-xs">No hay movimientos registrados con este filtro.</td></tr>`}
                            </tbody>
                        </table>
                    </div>
                    ${filteredLedger.length > maxVisibleLedger ? `<p class="text-xs text-slate-300 uppercase font-mono mt-2 pt-2 border-t border-slate-800 text-center">Mostrando los ${visibleLedger.length} movimientos más recientes de ${filteredLedger.length}.</p>` : ''}
                </div>
            </div>

            <!-- Columna Derecha: Balances de Cierre de Fase (DOC_17) -->
            <div class="lg:col-span-5 space-y-6">
                ${phaseBalancesBlockHtml}
            </div>
        </div>`;

        el.appendChild(wrapper);
    },

    modalRegisterPhaseBalance(phaseKey) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const effectiveRole = this.getEffectiveRole(co);
        if (!state.user.admin && effectiveRole !== 'FINANZAS') {
            return this.notify("Solo el Departamento Financiero puede registrar el Balance de Cierre (DOC_17). Dirección General (CEO) solo puede visarlo tras recibirlo.", "warning");
        }
        const isPhaseUnlocked = (typeof this.isPhaseBalanceUnlocked === 'function') ? this.isPhaseBalanceUnlocked(phaseKey, co) : true;
        if (!state.user.admin && !isPhaseUnlocked && co.unlockAllContracts !== true) {
            return this.notify("Este Balance de Cierre está bloqueado hasta el corte oficial de su fase.", "warning");
        }

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
                    <div class="flex flex-col sm:flex-row gap-2 mb-2">
                        <input type="url" id="phase-balance-drive-url" value="${this.escapeAttr(currentBalanceObj?.driveUrl || '')}" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('phase-balance-drive-url') : ''}
                    </div>
                    <label class="mars-checkbox-label flex items-start gap-2.5 cursor-pointer p-2 bg-black/50 border border-slate-800 rounded min-h-[44px]">
                        <input type="checkbox" id="phase-balance-perm-check" class="mars-touch-input">
                        <span class="mars-checkbox-visual mt-0.5"></span>
                        <span class="text-xs text-slate-200 font-sans">Confirmo que el Balance (DOC_17) tiene acceso <strong>«Fomento centros de enseñanza (Lector)»</strong>.</span>
                    </label>
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
        const elPerm = document.getElementById('phase-balance-perm-check');
        if (!elVerdict || !elUrl) return;

        const verdict = this.cleanInput(elVerdict.value).trim();
        if (!verdict) return this.notify("Debes seleccionar el dictamen contable.", "warning");
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'el Balance de Cierre (DOC_17)' })
            : { valid: Boolean(this.cleanInput(elUrl.value)), url: this.cleanInput(elUrl.value) };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (elPerm && !elPerm.checked) {
            return this.notify("Marca la casilla confirmando los permisos de lectura en Google Drive.", "warning");
        }
        if (this.acquireActionLock && !this.acquireActionLock('submit-balance-' + phaseKey, 1500)) return;

        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co) return;

        const effectiveRole = this.getEffectiveRole(co);
        if (!state.user.admin && effectiveRole !== 'FINANZAS') {
            return this.notify("Solo el Departamento Financiero puede registrar balances contables. El CEO solo puede visarlos tras recibirlos.", "warning");
        }
        const isPhaseUnlocked = (typeof this.isPhaseBalanceUnlocked === 'function') ? this.isPhaseBalanceUnlocked(phaseKey, co) : true;
        if (!state.user.admin && !isPhaseUnlocked && co.unlockAllContracts !== true) {
            return this.notify("Este Balance de Cierre aún se encuentra bloqueado hasta la fecha de corte.", "warning");
        }
        const isAdminCoord = Boolean(state.user.admin);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const virtualSpend = (co.ledger || []).filter(l => l.delta < 0).reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);

        const nowTs = Date.now();
        co.phaseBalances = co.phaseBalances || {};
        co.phaseBalances[phaseKey] = {
            id: 'BAL-' + coId + '-' + phaseKey,
            phase: phaseKey,
            status: isAdminCoord ? 'DELIVERED_TO_TEACHER' : 'PENDIENTE_CEO',
            verdict: verdict,
            driveUrl: driveUrl,
            snapshot: {
                balance: Number(co.balance) || 0,
                grossCosts: Number(grossCosts) || 0,
                sponsorReduction: Number(sponsorAmt) || 0,
                virtualSpend: Number(virtualSpend) || 0
            },
            authorRole: (effectiveRole !== state.user.role) ? `${state.user.role} (${effectiveRole})` : state.user.role,
            authorName: state.user.name || 'Finanzas',
            date: new Date().toLocaleDateString(),
            timestamp: nowTs,
            updatedAt: nowTs
        };
        delete co.phaseBalances[phaseKey].returnReason;
        delete co.phaseBalances[phaseKey].returnDriveUrl;
        co.updatedAt = nowTs;

        if (isAdminCoord) {
            ui.pushNotification(coId, 'ALL', `📊 Balance de Cierre de Fase ${phaseKey} formalizado y elevado al Claustro para Economía.`, 'success');
            this.notify(`✅ Balance Contable de Cierre de Fase ${phaseKey} visado y entregado.`, "success");
        } else {
            ui.pushNotification(coId, 'CEO', `📊 Finanzas ha formalizado el Balance de Cierre de Fase ${phaseKey} (DOC_17). Pendiente de tu visado para Economía.`, 'warning', { view: 'dashboard', anchorId: 'ceo-balance-approval-panel' });
            this.notify(`✅ Balance registrado y enviado a Dirección General (CEO) para visado.`, "success");
        }

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.render();
    },

    approvePhaseBalanceByCEO(phaseKey, skipReadCheck = false) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.phaseBalances || !co.phaseBalances[phaseKey]) return;
        const docUrl = String(co.phaseBalances[phaseKey].driveUrl || '').trim();
        if (!skipReadCheck && typeof this.confirmDocOpenedBeforeAction === 'function') {
            return this.confirmDocOpenedBeforeAction(docUrl, () => this.approvePhaseBalanceByCEO(phaseKey, true), 'Sí, Visar Balance');
        }

        const nowTs = Date.now();
        co.phaseBalances[phaseKey].status = 'DELIVERED_TO_TEACHER';
        co.phaseBalances[phaseKey].ceoValidatedAt = nowTs;
        co.phaseBalances[phaseKey].updatedAt = nowTs;
        co.updatedAt = nowTs;

        ui.pushNotification(coId, 'FINANZAS', `✅ El CEO ha VISADO el Balance de Cierre de Fase ${phaseKey}. Ya está elevado al docente de Economía.`, 'success', { view: 'finance' });
        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.notify(`✅ Balance de Cierre de Fase ${phaseKey} visado y elevado a Economía.`, "success");
        this.render();
    },

    modalCeoReturnPhaseBalance(phaseKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const reasons = [
            "Descuadre contable o divergencia en el saldo registrado",
            "Falta comprobación de partidas de I+D o compras de taller",
            "Plantilla DOC_17 incompleta o sin permisos de lectura abiertos",
            "Se requiere reajuste del dictamen de tesorería"
        ];
        const opts = reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('');

        const html = `
            <div class="space-y-3 font-mono text-xs">
                <p class="text-slate-300 font-sans leading-relaxed">Selecciona el motivo tipificado de devolución del Balance de Cierre de Fase ${this.escapeHTML(phaseKey)}. Por política Zero-Text, no se permite texto libre.</p>
                <div>
                    <label for="return-balance-reason" class="text-amber-400 font-bold uppercase block mb-1">Motivo Tipificado de Devolución</label>
                    <select id="return-balance-reason" class="w-full min-h-[44px] bg-slate-900 border border-amber-500/50 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-amber-400">
                        ${opts}
                    </select>
                </div>
                <div>
                    <label for="return-balance-drive-url" class="text-mars-cyan font-bold uppercase block mb-1">Enlace a Google Docs con Anotaciones de Corrección (Opcional)</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="return-balance-drive-url" placeholder="https://docs.google.com/document/d/..." class="flex-1 min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('return-balance-drive-url') : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmCeoReturnPhaseBalance('${this.escapeHTML(phaseKey)}')" class="min-h-[44px] bg-mars-magenta text-white font-black uppercase text-xs px-5 py-2 hover:bg-white hover:text-mars-magenta transition-all w-full sm:w-auto">Confirmar Devolución a Finanzas</button>`;
        this.showModal(`Devolver Balance Fase ${phaseKey}`, html, actions);
    },

    confirmCeoReturnPhaseBalance(phaseKey) {
        if (!state.user || this.getEffectiveRole() !== 'CEO') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.phaseBalances || !co.phaseBalances[phaseKey]) return;

        const elReason = document.getElementById('return-balance-reason');
        const elUrl = document.getElementById('return-balance-drive-url');
        const reason = elReason ? this.cleanInput(elReason.value) : 'Requiere subsanación contable';
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl ? elUrl.value : '', elUrl, { required: false, label: 'observaciones del Balance' })
            : { valid: true, url: elUrl ? this.cleanInput(elUrl.value).trim() : '' };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;

        const nowTs = Date.now();
        co.phaseBalances[phaseKey].status = 'RETURNED_BY_CEO';
        co.phaseBalances[phaseKey].returnReason = reason;
        if (driveUrl) co.phaseBalances[phaseKey].returnDriveUrl = driveUrl;
        co.phaseBalances[phaseKey].returnedAt = nowTs;
        co.phaseBalances[phaseKey].updatedAt = nowTs;
        co.updatedAt = nowTs;

        ui.pushNotification(coId, 'FINANZAS', `⚠️ El CEO ha devuelto el Balance de Fase ${phaseKey}: "${reason}". Subsanar y reenviar.`, 'warning', { view: 'finance' });
        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.notify(`⚠️ Balance devuelto al Departamento Financiero para corrección.`, "warning");
        this.render();
    },

    modalReviewOrderFinanzas(orderId) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;
        const order = co.orders.find(o => String(o.id) === String(orderId));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        const items = order.items || [];
        const itemsHtml = items.map((it, idx) => `
            <div class="border border-slate-800 bg-slate-900/90 p-3 rounded flex items-center justify-between gap-3">
                <label class="mars-checkbox-label flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer min-h-[44px] flex-1">
                    <input type="checkbox" id="order-item-cb-${idx}" checked data-price="${Number(it.price) || 0}" data-qty="${Number(it.qty) || 1}" onchange="ui.recalcOrderReviewTotal()" class="mars-touch-input">
                    <span class="mars-checkbox-visual"></span>
                    <span>${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                </label>
                <span class="text-mars-cyan font-mono font-bold text-xs shrink-0">${((Number(it.price) || 0) * (Number(it.qty) || 1)).toFixed(2)} €v</span>
            </div>
        `).join('');

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <p class="text-slate-300 font-sans leading-relaxed">
                    Revisa las partidas solicitadas por I+D. Puedes desmarcar partidas no prioritarias para realizar una <strong>aprobación parcial</strong>.
                </p>
                <div class="space-y-2 max-h-60 overflow-y-auto">
                    ${itemsHtml}
                </div>
                <div class="bg-black/60 p-3 border border-slate-800 space-y-1 rounded">
                    <div class="flex justify-between items-center">
                        <span class="text-xs text-slate-300 uppercase font-bold">Total Partidas Seleccionadas:</span>
                        <span id="order-review-total-badge" class="text-base font-bold text-mars-green font-mono">${Number(order.total).toFixed(2)} €v</span>
                    </div>
                    <div class="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                        <span>Saldo Libre Real (tras pedidos ya aprobados):</span>
                        <span class="text-mars-cyan font-bold">${((typeof state.getFreeVirtualBalance === 'function') ? state.getFreeVirtualBalance(co) : Number(co.balance || 0)).toFixed(2)} €v</span>
                    </div>
                </div>
                <div id="order-partial-justification-block" class="hidden space-y-2 p-3 bg-amber-950/40 border border-amber-500/50 rounded">
                    <span class="text-amber-400 font-bold uppercase block">⚠️ Aprobación Parcial / Partidas Descartadas</span>
                    <p class="text-[11px] text-slate-300 font-sans leading-relaxed">
                        Has desmarcado una o más partidas. Para cumplir con la política Zero-Text, adjunta el enlace a un Google Doc explicando qué partidas se autorizan, cuáles se descartan y por qué:
                    </p>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="order-partial-drive-url" placeholder="https://docs.google.com/document/d/..." class="flex-1 min-h-[44px] bg-slate-900 border border-amber-400 p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('order-partial-drive-url') : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <div class="flex flex-col sm:flex-row gap-2 w-full justify-end">
                <button type="button" onclick="ui.confirmReviewOrderFinanzas('${this.escapeHTML(orderId)}')" class="min-h-[44px] bg-mars-green text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ Confirmar Aprobación de Partidas ]</button>
            </div>
        `;
        this.showModal(`Auditoría de Orden #${order.id}`, html, actions);
    },

    recalcOrderReviewTotal() {
        const cbs = document.querySelectorAll('[id^="order-item-cb-"]');
        let total = 0;
        let uncheckedCount = 0;
        cbs.forEach(cb => {
            if (cb.checked) {
                const p = parseFloat(cb.getAttribute('data-price') || 0);
                const q = parseFloat(cb.getAttribute('data-qty') || 1);
                total += p * q;
            } else {
                uncheckedCount++;
            }
        });
        const badge = document.getElementById('order-review-total-badge');
        if (badge) badge.textContent = `${total.toFixed(2)} €v`;

        const justBlock = document.getElementById('order-partial-justification-block');
        if (justBlock) {
            if (uncheckedCount > 0) {
                justBlock.classList.remove('hidden');
            } else {
                justBlock.classList.add('hidden');
            }
        }
    },

    confirmReviewOrderFinanzas(orderId, precomputed = null) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.orders) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        const order = co.orders.find(o => String(o.id) === String(orderId));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        let approvedItems = precomputed ? precomputed.approvedItems : [];
        let rejectedItems = precomputed ? precomputed.rejectedItems : [];
        let newTotal = precomputed ? precomputed.newTotal : 0;
        let partialDriveUrl = precomputed ? precomputed.partialDriveUrl : null;

        if (!precomputed) {
            (order.items || []).forEach((it, idx) => {
                const cb = document.getElementById(`order-item-cb-${idx}`);
                if (cb && cb.checked) {
                    approvedItems.push(it);
                    newTotal += (Number(it.price) || 0) * (Number(it.qty) || 1);
                } else {
                    rejectedItems.push(it);
                }
            });

            if (approvedItems.length === 0) {
                return this.notify("No has seleccionado ninguna partida para aprobar. Si deseas rechazar la orden completa, pulsa Denegar Orden.", "warning");
            }

            if (co.balance < newTotal) {
                return this.notify(`Fondos virtuales insuficientes (${co.balance.toFixed(2)} €v disponibles para un total de ${newTotal.toFixed(2)} €v).`, "error");
            }

            if (rejectedItems.length > 0) {
                const elDrive = document.getElementById('order-partial-drive-url');
                const urlCheck = this.validateStudentDriveUrl
                    ? this.validateStudentDriveUrl(elDrive ? elDrive.value : '', elDrive, { required: true, label: 'la justificación parcial en Docs' })
                    : { valid: Boolean(elDrive && this.cleanInput(elDrive.value).trim()), url: elDrive ? this.cleanInput(elDrive.value).trim() : '' };
                if (!urlCheck.valid) return;
                partialDriveUrl = urlCheck.url;
            }

            const freeBal = (typeof state.getFreeVirtualBalance === 'function') ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
            const freeAfter = freeBal - newTotal;
            if (freeAfter <= 0 && typeof this.confirmAction === 'function') {
                const msg = `Contando pedidos aprobados pendientes de taller (${freeBal.toFixed(2)} €v libres), autorizar esta orden (-${newTotal.toFixed(2)} €v) dejará el saldo libre en ${freeAfter.toFixed(2)} €v (riesgo de Números Rojos). ¿Continuar?`;
                return this.confirmAction('⚠️ Alerta de Saldo Libre Crítico', msg, () => {
                    this.confirmReviewOrderFinanzas(orderId, { approvedItems, rejectedItems, newTotal, partialDriveUrl });
                }, 'Autorizar Orden');
            }
        }
        if (co.balance < newTotal) {
            return this.notify(`Fondos virtuales insuficientes (${co.balance.toFixed(2)} €v disponibles para un total de ${newTotal.toFixed(2)} €v).`, "error");
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-review-' + orderId, 1500)) return;

        order.items = approvedItems;
        order.total = newTotal;
        order.status = 'APROBADO_FINANZAS';
        if (rejectedItems.length > 0) {
            order.rejectedItems = rejectedItems;
            order.partialApproval = true;
            order.responseDriveUrl = partialDriveUrl;
        }
        const nowTs = Date.now();
        order.approvedAt = nowTs;
        order.updatedAt = nowTs;
        co.updatedAt = nowTs;

        if (rejectedItems.length > 0) {
            ui.pushNotification(coId, 'TECNICO', `⚠️ Finanzas ha APROBADO PARCIALMENTE la orden #${order.id} (${newTotal.toFixed(2)} €v). Partidas denegadas justificadas en Docs.`, 'warning', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });
        } else {
            ui.pushNotification(coId, 'TECNICO', `✅ Finanzas ha APROBADO la orden #${order.id} (${newTotal.toFixed(2)} €v). Ya está en Logística.`, 'success', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });
        }
        ui.pushNotification(coId, 'OPERACIONES_IA', `📦 Orden #${order.id} autorizada por Finanzas (${newTotal.toFixed(2)} €v) lista para compra física y ensamble.`, 'info', { view: 'cart', anchorId: 'ops-orders-tracking-panel' });

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.notify(`✅ Orden #${order.id} autorizada (${newTotal.toFixed(2)} €v). Pasa a Operaciones.`, "success");
        this.render();
    },

    modalRejectOrderWithDoc(orderId) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;
        const order = co.orders.find(o => String(o.id) === String(orderId));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        const reasons = [
            "Supera el presupuesto disponible o prioridad de tesorería",
            "Falta justificación técnica suficiente en el documento DOC_9",
            "Materiales sustituibles por piezas ya existentes o B2B",
            "Conviene ajustar cantidades antes de autorizar el gasto"
        ];
        const html = `
            <div class="space-y-3 font-mono text-xs">
                <p class="text-slate-300 font-sans leading-relaxed">
                    Vas a denegar la Orden #${this.escapeHTML(order.id)} (${Number(order.total).toFixed(2)} €v). Para cumplir con la política Zero-Text, selecciona el motivo tipificado (y si lo deseas, adjunta el enlace al Google Doc):
                </p>
                <div>
                    <label for="reject-order-reason" class="text-mars-yellow font-bold uppercase block mb-1">Motivo Tipificado *</label>
                    <select id="reject-order-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white outline-none">
                        ${reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="reject-order-drive-url" class="text-mars-cyan font-bold uppercase block mb-1">Enlace a Google Docs con Justificación (Opcional)</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="reject-order-drive-url" placeholder="Opcional: https://docs.google.com/document/d/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan/60 p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('reject-order-drive-url') : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRejectOrderWithDoc('${this.escapeHTML(order.id)}')" class="min-h-[44px] bg-mars-magenta text-white font-black uppercase text-xs px-5 py-2.5 hover:bg-white hover:text-mars-magenta transition-all w-full sm:w-auto">Confirmar Denegación</button>`;
        this.showModal(`Denegar Orden #${order.id}`, html, actions);
    },

    confirmRejectOrderWithDoc(orderId) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;
        const order = co.orders.find(o => String(o.id) === String(orderId));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        const elReason = document.getElementById('reject-order-reason');
        const reason = elReason ? this.cleanInput(elReason.value) : 'Justificación presupuestaria';
        const elDrive = document.getElementById('reject-order-drive-url');
        const rawDrive = elDrive ? this.cleanInput(elDrive.value).trim() : '';
        let safeDriveUrl = '';
        if (rawDrive) {
            const urlCheck = this.validateStudentDriveUrl
                ? this.validateStudentDriveUrl(rawDrive, elDrive, { required: false, label: 'la justificación de denegación en Docs' })
                : { valid: true, url: rawDrive };
            if (!urlCheck.valid) return;
            safeDriveUrl = urlCheck.url;
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-reject-' + orderId, 1500)) return;

        const nowTs = Date.now();
        order.status = 'RECHAZADO';
        order.rejectReason = reason;
        if (safeDriveUrl) order.responseDriveUrl = safeDriveUrl;
        order.rejectedAt = nowTs;
        order.updatedAt = nowTs;
        co.updatedAt = nowTs;

        ui.pushNotification(state.user.coId, 'TECNICO', `❌ Finanzas ha DENEGADO la orden #${order.id} ("${reason}").${safeDriveUrl ? ' Consulta el informe en Google Docs.' : ''}`, 'error', { view: 'orders', filter: 'DENEGADAS', dept: 'TECNICO' });
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.notify(`❌ Orden #${order.id} denegada.`, "info");
        this.render();
    },

    approveB2BBuyByFinanzas(orderId, skipLowBalanceConfirm = false) {
        if (!state.user || this.getEffectiveRole() !== 'FINANZAS') return;
        const coId = state.user.coId;
        const co = state.data.companies[coId];
        if (!co || !co.orders) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        const order = co.orders.find(o => String(o.id) === String(orderId));
        if (!order || order.status !== 'PENDIENTE_FINANZAS') return;

        const offerId = order.offerId;
        const offer = (state.data.b2bMarket || []).find(o => o.id === offerId);

        // Comprobación de que la pieza sigue en venta en el mercado
        if (!offer || offer.status !== 'EN_VENTA') {
            order.status = 'CANCELADO_OTRA_EMPRESA';
            co.updatedAt = Date.now();
            state.save(coId);
            this.render();
            return this.notify("⚠️ Demasiado tarde: Otra empresa ha autorizado la compra antes y la pieza ya no está disponible.", "error");
        }

        const price = Number(offer.price) || 0;
        if (co.balance < price) {
            return this.notify(`Fondos virtuales insuficientes (${co.balance.toFixed(2)} €v disponibles, precio: ${price.toFixed(2)} €v).`, "error");
        }
        const freeBal = (typeof state.getFreeVirtualBalance === 'function') ? state.getFreeVirtualBalance(co) : Number(co.balance || 0);
        const freeAfter = freeBal - price;
        if (freeAfter <= 0 && !skipLowBalanceConfirm && typeof this.confirmAction === 'function') {
            const msg = `Autorizar esta compra B2B (-${price.toFixed(2)} €v) dejará el saldo libre en ${freeAfter.toFixed(2)} €v y activará el bloqueo de Números Rojos. ¿Continuar?`;
            return this.confirmAction('⚠️ Alerta de Saldo Libre Crítico', msg, () => this.approveB2BBuyByFinanzas(orderId, true), 'Sí, Aprobar y Bloquear');
        }
        if (this.acquireActionLock && !this.acquireActionLock('fin-b2bbuy-' + orderId, 1500)) return;

        const now = Date.now();
        offer.status = 'EN_ADUANA';
        offer.buyerCoId = coId;
        offer.buyerName = co.name;
        offer.updatedAt = now;

        const contractId = 'B2BC-' + now.toString().slice(-4) + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        state.data.b2bContracts = state.data.b2bContracts || [];
        state.data.b2bContracts.unshift({
            id: contractId,
            offerId: offer.id,
            sellerCoId: offer.sellerCoId,
            sellerName: offer.sellerName,
            buyerCoId: coId,
            buyerName: co.name,
            itemName: offer.itemName,
            qty: offer.qty || 1,
            category: offer.category || 'Componente',
            price: offer.price,
            sourceOrderKey: offer.sourceOrderKey || '',
            driveUrl: offer.driveUrl || '',
            buyerDriveUrl: order.driveUrl || '',
            buyerOrderId: order.id,
            status: 'PENDIENTE_ADUANA',
            date: new Date().toLocaleString(),
            timestamp: now,
            updatedAt: now
        });

        state.addToLedger(coId, `[RETENCIÓN B2B] Compra autorizada por Finanzas: ${offer.itemName}`, 'ADUANA_B2B', -price);

        order.status = 'PENDIENTE_DOCENTE';
        order.b2bContractId = contractId;
        order.approvedByFinanzasAt = now;
        co.updatedAt = now;

        // Cancelar solicitudes competidoras en otras empresas para la misma oferta
        Object.keys(state.data.companies || {}).forEach(otherCoId => {
            if (otherCoId !== coId) {
                const otherCo = state.data.companies[otherCoId];
                (otherCo?.orders || []).forEach(otherOrd => {
                    if (otherOrd.offerId === offerId && otherOrd.status === 'PENDIENTE_FINANZAS') {
                        otherOrd.status = 'CANCELADO_OTRA_EMPRESA';
                        ui.pushNotification(otherCoId, 'TECNICO', `⚠️ La pieza B2B "${offer.itemName}" ha sido adquirida por otra empresa. Tu solicitud se ha cancelado.`, 'warning', { view: 'orders', filter: 'DENEGADAS', dept: 'TECNICO' });
                        ui.pushNotification(otherCoId, 'FINANZAS', `⚠️ La pieza B2B "${offer.itemName}" ha sido adquirida por otra empresa. Solicitud cancelada.`, 'info', { view: 'orders', filter: 'DENEGADAS', dept: 'TECNICO' });
                    }
                });
            }
        });

        ui.pushNotification(coId, 'TECNICO', `🎉 ¡Conseguido! Finanzas autorizó la compra B2B de "${offer.itemName}". Bloqueado en Aduana Docente.`, 'success', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });
        ui.pushNotification(offer.sellerCoId, 'TECNICO', `🤝 ${co.name} ha formalizado la compra B2B de tu pieza "${offer.itemName}". Esperando validación en Aduana.`, 'info', { view: 'orders', filter: 'EN_PROCESO', dept: 'TECNICO' });

        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.notify(`✅ Compra B2B autorizada (-${price.toFixed(2)} €v). Pieza bloqueada y elevada a la Aduana Docente.`, "success");
        this.render();
    }
});
