// js/ui-empresa-ops.js
// --- MÓDULO OPERACIONES E IA: LOGÍSTICA FÍSICA, BITÁCORA IA Y DIARIO DE DECISIONES (v1.1.28) ---

Object.assign(ui, {
    modalLogAI() {
        return this.modalReportAI();
    },

    viewCart(el) {
        if (!el || !state.user) return; 
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); 
        
        co.orders = co.orders || []; 
        const isOperario = (state.user.role === 'OPERACIONES_IA' || state.user.role === 'OPERACIONES' || state.user.admin);
        
        const approvedOrders = co.orders.filter(o => o.status === 'APROBADO_FINANZAS');
        const wrapper = document.createElement('div');
        
        let ordersHtml = approvedOrders.map(order => `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green mb-6 w-full">
                ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], 1)}
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2 mt-4">
                    <div>
                        <span class="text-xs font-bold uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-2.5 py-1 tracking-wider">[APROBADO POR FINANZAS]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">ORDEN #${this.escapeHTML(order.id)}</h3>
                    </div>
                    <div class="text-left sm:text-right">
                        <p class="text-mars-green font-black font-mono text-xl">${Number(order.total).toFixed(2)} €v</p>
                        <p class="text-xs text-slate-300 uppercase">${this.escapeHTML(order.date)}</p>
                    </div>
                </div>
                <p class="text-xs text-mars-yellow uppercase font-bold mb-3">Registra el coste real físico (€), el comercio oficial y el ticket en Google Drive:</p>
                <div class="space-y-3 mb-6">
                    ${(order.items || []).map((item, idx) => `
                        <div class="border border-slate-800 bg-slate-900/90 p-3 mb-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <div class="flex-grow min-w-0">
                                <label class="mars-checkbox-label flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer min-h-[44px]">
                                    <input type="checkbox" id="assembled-${this.escapeHTML(order.id)}-${idx}" class="mars-touch-input" checked ${isOperario ? '' : 'disabled'}>
                                    <span class="mars-checkbox-visual"></span>
                                    <span class="break-words">${this.escapeHTML(item.name)} (x${Number(item.qty)||1}) - <span class="text-mars-cyan font-mono">${Number(item.price).toFixed(2)} €v</span></span>
                                </label>
                                <p class="text-[10px] text-slate-400 font-mono mt-0.5 ml-7">Material donado o reciclado: registrar 0.00 €</p>
                            </div>
                            <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <input type="number" id="real-eur-${this.escapeHTML(order.id)}-${idx}" aria-label="Coste real en euros de ${this.escapeHTML(item.name)}" placeholder="Coste Real (€) - 0.00 si es reciclado" step="0.01" min="0" ${isOperario ? '' : 'disabled'} class="min-h-[44px] bg-black border border-mars-magenta p-2.5 text-base sm:text-xs text-white w-full sm:w-48 outline-none focus:border-mars-cyan font-mono">
                                <select id="real-shop-${this.escapeHTML(order.id)}-${idx}" aria-label="Comercio de adquisición de ${this.escapeHTML(item.name)}" ${isOperario ? '' : 'disabled'} class="min-h-[44px] bg-black border border-slate-700 p-2.5 text-base sm:text-xs text-white w-full sm:w-44 outline-none focus:border-mars-cyan">
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
                                <input type="url" id="real-ticket-${this.escapeHTML(order.id)}-${idx}" aria-label="Ticket Drive de ${this.escapeHTML(item.name)}" placeholder="URL Ticket Drive" ${isOperario ? '' : 'disabled'} class="min-h-[44px] bg-black border border-mars-cyan/60 p-2 text-base sm:text-xs text-white w-full sm:w-44 outline-none focus:border-mars-cyan font-mono">
                            </div>
                        </div>
                    `).join('')}
                </div>
                ${isOperario
                    ? `<button type="button" onclick="ui.executePhysicalOrder('${this.escapeHTML(order.id)}')" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-4 text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">[ CONFIRMAR COMPRA FÍSICA Y ENSAMBLAJE ]</button>`
                    : `<div class="p-3 bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 uppercase font-mono">🔒 Vista de Sólo Lectura: Registro de compra física reservado exclusivamente al Operario de Taller.</div>`
                }
            </div>
        `).join('') || `<div class="terminal-border border-dashed p-10 text-center text-slate-300 italic text-xs">No hay órdenes aprobadas pendientes de ejecución logística.</div>`;

        const currentHoja = co.deliverables?.hoja_taller_fyq;
        const hojaStatus = currentHoja?.status || 'DRAFT_TECNICO';
        const hojaUrl = currentHoja?.driveUrl || '';

        let hojaWorkshopHtml = '';
        if (!currentHoja || hojaStatus === 'DRAFT_TECNICO') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-slate-600 mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-slate-400 bg-slate-800 px-2.5 py-1 tracking-wider">[ENTREGABLE OFICIAL FYQ // 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-slate-400 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded">⏳ EN DISEÑO POR TÉCNICO</span>
                </div>
                <p class="text-xs text-slate-300">El departamento Técnico (I+D) está configurando el BOM y la especificación inicial. En cuanto lo envíe a taller, podrás verificar el montaje físico.</p>
            </div>`;
        } else if (hojaStatus === 'DEVUELTO_A_TECNICO') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-amber-500 mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-amber-400 bg-amber-950/40 border border-amber-500/40 px-2.5 py-1 tracking-wider">[ENTREGABLE OFICIAL FYQ // 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500 px-2.5 py-1 rounded">⚠️ DEVUELTO A TÉCNICO</span>
                </div>
                <div class="bg-amber-950/40 border border-amber-500/50 p-2.5 my-2 text-xs text-amber-300 font-mono">
                    <strong>Incidencia reportada a I+D:</strong> ${this.escapeHTML(currentHoja.returnReason || currentHoja.returnReasonId || 'Incidencia de taller')}
                </div>
                <p class="text-xs text-slate-300">Esperando que el departamento Técnico subsane el BOM en Google Docs y lo reenvíe a Taller.</p>
            </div>`;
        } else if (hojaStatus === 'EN_TALLER_OPERARIO') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-cyan-400 mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 px-2.5 py-1 tracking-wider">[FASE 2: EN TALLER FÍSICO // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500 px-2.5 py-1 rounded">⚙️ EN TALLER (OPERARIO)</span>
                </div>
                <p class="text-xs text-slate-300 mb-3">Revisa el montaje físico del cohete con respecto al BOM documentado por el departamento Técnico.</p>
                <div class="mb-4">
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/60 transition-colors">
                        <span>📄 Inspeccionar Hoja de Taller y BOM en Docs ↗</span>
                    </a>
                </div>
                <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
                    <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VALIDAR ENSAMBLE Y REMITIR A CEO ]</button>
                    <button type="button" onclick="ui.modalTallerReturnReason()" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2.5 hover:bg-mars-magenta hover:text-white transition-all">[ ↩ DEVOLVER POR INCIDENCIA ]</button>
                </div>
            </div>`;
        } else if (hojaStatus === 'SUBMITTED_TO_CEO') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-purple-500 mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-purple-400 bg-purple-950/40 border border-purple-500/40 px-2.5 py-1 tracking-wider">[FASE 4: VISADO CEO // FYQ 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500 px-2.5 py-1 rounded">⏳ REMITIDO AL CEO</span>
                </div>
                <p class="text-xs text-slate-300 mb-2">Has validado el ensamble físico en taller. El entregable está pendiente de visado formal por el CEO hacia el profesor de FyQ.</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-purple-950/40 text-purple-300 border border-purple-500/30 rounded font-mono"><span>Ver Documento Drive ↗</span></a>
            </div>`;
        } else if (hojaStatus === 'CEO_REVISION') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-magenta mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2.5 py-1 tracking-wider">[REVISIÓN REQUERIDA POR CEO]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2.5 py-1 rounded">⚠️ DEVUELTO POR CEO</span>
                </div>
                <div class="bg-red-950/40 border border-red-500/50 p-2.5 my-2 text-xs text-red-300 font-mono">
                    <strong>Motivo de Devolución CEO:</strong> ${this.escapeHTML(currentHoja?.returnReason || currentHoja?.returnReasonId || 'Requiere subsanación')}
                </div>
                <p class="text-xs text-slate-300 mb-3">El CEO ha devuelto la Hoja de Taller. Revisa las piezas en taller y vuelve a validar y remitir al CEO cuando esté subsanado.</p>
                <div class="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-800">
                    <button type="button" onclick="ui.opsValidateHojaTaller()" class="min-h-[44px] flex-1 bg-mars-green text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ REVALIDAR Y REMITIR A CEO ]</button>
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/60 transition-colors"><span>Ver Documento Drive ↗</span></a>
                </div>
            </div>`;
        } else if (hojaStatus === 'DELIVERED_TO_TEACHER') {
            hojaWorkshopHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green mb-6 w-full">
                <div class="flex justify-between items-start mb-2">
                    <div>
                        <span class="text-xs font-bold uppercase text-mars-green bg-mars-green/10 border border-mars-green/40 px-2.5 py-1 tracking-wider">[EVALUACIÓN OFICIAL FYQ // 10%]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm sm:text-base font-bold">Hoja de Taller: BOM y Control de Ensamble</h3>
                    </div>
                    <span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2.5 py-1 rounded">✓ VISADO Y ENTREGADO A FYQ</span>
                </div>
                <p class="text-xs text-slate-300 mb-2">El CEO ha visado y remitido la Hoja de Taller al profesor de Física y Química para su evaluación oficial.</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono"><span>Abrir Documento Oficial Drive ↗</span></a>
            </div>`;
        }
        const hojaHtml = hojaWorkshopHtml;

        wrapper.innerHTML = `
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
                <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">Logística de Despliegue Físico</h2>
                <div class="flex gap-2 flex-wrap">
                    ${this.renderDocTemplateBtn('DOC_10_HOJA_TALLER')}
                    ${this.renderDocTemplateBtn('DOC_8_CONTROL_AERO')}
                </div>
            </div>
            ${hojaHtml}
            ${ordersHtml}
        `;
        el.appendChild(wrapper);
    },

    executePhysicalOrder(oid) {
        if (!state.user) return;
        const isOperario = (state.user.role === 'OPERACIONES_IA' || state.user.role === 'OPERACIONES' || state.user.admin);
        if (!isOperario) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede registrar compras reales físicas.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.orders = co.orders || [];
        co.realCosts = co.realCosts || [];
        
        const order = co.orders.find(o => String(o.id) === String(oid));
        if(!order) return this.notify("Orden no encontrada.", "error");

        let finalItems = [];
        let finalTotalEurV = 0;
        let realCostsToLog = [];

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`assembled-${order.id}-${i}`);
            const eurInput = document.getElementById(`real-eur-${order.id}-${i}`);
            const shopInput = document.getElementById(`real-shop-${order.id}-${i}`);
            const ticketInput = document.getElementById(`real-ticket-${order.id}-${i}`);
            
            if(cb && cb.checked) {
                const valEur = parseFloat(eurInput ? eurInput.value : 0);
                const valShop = shopInput ? this.cleanInput(shopInput.value) : '';
                const ticketUrl = ticketInput ? this.cleanInput(ticketInput.value) : '';
                
                if(isNaN(valEur) || valEur < 0 || !valShop) {
                    return this.notify(`Falta indicar el coste real (€) o el comercio para: ${order.items[i].name}`, "warning");
                }
                if(ticketUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(ticketUrl)) {
                    return this.notify(`El comprobante de ${order.items[i].name} debe ser una URL válida de Google Drive.`, "error");
                }
                order.items[i].realEur = valEur;
                order.items[i].realShop = valShop;
                order.items[i].ticketUrl = ticketUrl;
                finalItems.push(order.items[i]);
                const itemQty = Number(order.items[i].qty) || 1;
                finalTotalEurV += (Number(order.items[i].price) || 0) * itemQty;
                realCostsToLog.push({ id: 'RC-'+Date.now()+'-'+i, date: new Date().toLocaleDateString(), item: order.items[i].name, eur: valEur, shop: valShop, ticketUrl: ticketUrl, qty: itemQty });
            }
        }

        if(finalItems.length === 0) return this.notify("Debes marcar al menos un componente como comprado/ensamblado.", "warning");
        if(co.balance < finalTotalEurV) return this.notify("Fondos virtuales insuficientes en la cuenta de la empresa.", "error");

        order.items = finalItems;
        order.total = finalTotalEurV;
        order.status = 'EJECUTADO';

        state.addToLedger(state.user.coId, `Ejecución Logística Orden #${order.id}`, 'OPERACIONES_IA', -finalTotalEurV);
        co.realCosts.push(...realCostsToLog);
        co.updatedAt = Date.now();

        telemetry.log("EJECUCIÓN LOGÍSTICA", `Orden #${order.id} completada por ${finalTotalEurV.toFixed(2)}€v`);
        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        ui.pushNotification(state.user.coId, 'TECNICO', `📦 Orden #${order.id} física completada y ensamblada por Operaciones.`, 'success', { view: 'orders', filter: 'COMPLETADAS', dept: 'TECNICO' });
        ui.pushNotification(state.user.coId, 'FINANZAS', `📦 Coste real de Orden #${order.id} (${finalTotalEurV.toFixed(2)} €v / ${finalItems.reduce((acc, it) => acc + (it.realEur || 0), 0).toFixed(2)} €) registrado en Libro Mayor.`, 'info', { view: 'finance' });

        this.notify(`✅ Orden #${order.id} ejecutada. El saldo virtual ha sido descontado y los costes reales registrados.`, "success");
        this.render();
    },

    viewAILog(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.aiPrompts = co.aiPrompts || [];
        
        const isOps = state.user.role === 'OPERACIONES_IA';
        const wrapper = document.createElement('div');
        wrapper.id = 'ailog-section';
        
        const pendingPrompts = co.aiPrompts.filter(p => p.status === 'PENDIENTE_VALIDACION');
        const approvedPrompts = co.aiPrompts.filter(p => p.status === 'APROBADO');

        let pendingHtml = '';
        if (isOps && pendingPrompts.length > 0) {
            pendingHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow mb-8">
                <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base mb-4 uppercase tracking-tighter">Prompts Pendientes de Auditoría (${pendingPrompts.length})</h3>
                <div class="space-y-4">
                    ${pendingPrompts.map(p => `
                        <div class="bg-slate-900 border border-mars-yellow/50 p-4 text-xs">
                            <div class="flex flex-wrap justify-between gap-2 mb-2"><span class="text-mars-cyan font-bold uppercase">Autor: ${this.escapeHTML(p.role)} | Herramienta: ${this.escapeHTML(p.tool)}</span><span class="text-slate-300">${this.escapeHTML(p.date)}</span></div>
                            <div class="mb-3">
                                ${(p.bitacoraUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.bitacoraUrl)) || (p.prompt && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.prompt))
                                    ? `<a href="${encodeURI(p.bitacoraUrl || p.prompt).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Bitácora en Docs ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Bitácora legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                            <div class="flex flex-wrap gap-2">
                                <button type="button" onclick="ui.validateAIPrompt('${this.escapeHTML(p.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-bold uppercase hover:bg-white transition-colors">Aprobar y Registrar</button>
                                <button type="button" onclick="ui.validateAIPrompt('${this.escapeHTML(p.id)}', false)" class="min-h-[44px] bg-mars-magenta text-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        const diaryDocsHtml = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan mb-8">
            <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h3 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter">Entregables Oficiales: Diario de Decisiones, Conflictos e IA (LyE)</h3>
                <span class="text-xs bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-2.5 py-1 font-bold uppercase">Resp: Operaciones IA / Marketing</span>
            </div>
            <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Sube los enlaces verificados de Google Drive correspondientes a las dos entregas oficiales de la bitácora del proyecto con permisos de lectura compartidos ("Cualquiera con el enlace puede ver").</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${this.renderDriveLinkBox('4A. Diario Decisiones, Conflictos e IA — DICIEMBRE', 'Enlace Drive a la 1ª Entrega (Diciembre) de gobernanza y auditoría IA.', 'decisionDiary_dec', docs.decisionDiary_dec)}
                ${this.renderDriveLinkBox('4B. Diario Decisiones, Conflictos e IA — ABRIL', 'Enlace Drive a la 2ª Entrega (Abril) de cierre de bitácora e IA.', 'decisionDiary_apr', docs.decisionDiary_apr)}
            </div>
        </div>`;

        wrapper.innerHTML = `
            <div class="flex flex-wrap justify-between items-center gap-3 mb-6">
                <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">Bitácora y Auditoría de Inteligencia Artificial</h2>
                <button type="button" onclick="ui.modalReportAI()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2.5 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_12px_rgba(0,240,255,0.3)]">[🤖 Nuevo Reporte IA]</button>
            </div>
            ${diaryDocsHtml}
            ${pendingHtml}
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-sm sm:text-base mb-4 uppercase tracking-tighter">Historial Oficial de Uso de IA (Aprobados)</h3>
                <div class="space-y-4">
                    ${approvedPrompts.map(p => `
                        <div class="bg-black/60 border border-mars-cyan/40 p-4 text-xs">
                            <div class="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                                <span class="text-mars-cyan font-bold uppercase">${this.escapeHTML(p.role)} • ${this.escapeHTML(p.tool)}</span>
                                <span class="text-slate-300">${this.escapeHTML(p.date)}</span>
                            </div>
                            <div class="mt-2">
                                ${(p.bitacoraUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.bitacoraUrl)) || (p.prompt && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.prompt))
                                    ? `<a href="${encodeURI(p.bitacoraUrl || p.prompt).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Bitácora en Docs ↗</span></a>`
                                    : `<span class="text-xs text-mars-yellow/80 font-mono italic">[Bitácora legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                        </div>
                    `).join('') || '<p class="text-slate-300 italic text-xs">No hay registros de IA aprobados todavía.</p>'}
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    opsValidateHojaTaller() {
        if (!state.user || (state.user.role !== 'OPERACIONES_IA' && state.user.role !== 'OPERACIONES' && !state.user.admin)) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede visar el ensamble en taller.", "error");
        }
        state.validateHojaTallerByOperator();
        this.notify("✅ Ensamble físico validado. Remitido al CEO para visado docente.", "success");
        this.render();
    },

    modalTallerReturnReason() {
        if (!state.user || (state.user.role !== 'OPERACIONES_IA' && state.user.role !== 'OPERACIONES' && !state.user.admin)) {
            return this.notify("Acceso restringido: Solo Operaciones/Operario puede reportar incidencias de taller.", "error");
        }
        const reasons = typeof WORKSHOP_INCIDENCE_REASONS !== 'undefined' ? WORKSHOP_INCIDENCE_REASONS : [];
        const optionsHtml = reasons.map(r => `<option value="${this.escapeHTML(r.id)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Selecciona la incidencia técnica detectada durante la verificación física en el banco de trabajo. Prohibido el texto libre.</p>
            <div class="space-y-3">
                <div>
                    <label for="taller-return-reason" class="text-xs text-amber-400 font-bold uppercase block mb-1.5">Causa de Incidencia Tipificada</label>
                    <select id="taller-return-reason" class="w-full min-h-[44px] bg-slate-900 border border-amber-500/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-amber-400">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmTallerReturnReason()" class="min-h-[44px] bg-amber-400 text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all w-full sm:w-auto">Confirmar Devolución a I+D</button>`;
        this.showModal("Devolver Hoja de Taller por Incidencia", html, actions);
    },

    confirmTallerReturnReason() {
        if (!state.user || (state.user.role !== 'OPERACIONES_IA' && state.user.role !== 'OPERACIONES' && !state.user.admin)) return;
        const el = document.getElementById('taller-return-reason');
        if (!el) return;
        const reasonId = el.value;
        const reasons = typeof WORKSHOP_INCIDENCE_REASONS !== 'undefined' ? WORKSHOP_INCIDENCE_REASONS : [];
        const reasonObj = reasons.find(r => r.id === reasonId);
        const label = reasonObj ? reasonObj.label : reasonId;

        state.returnHojaTallerByOperator(reasonId, label);
        this.closeModal();
        this.notify("⚠️ Hoja de Taller devuelta al departamento Técnico para subsanación.", "warning");
        this.render();
    },

    modalReportAI() {
        if (!state.user) return;
        const aiProviders = typeof AUTHORIZED_AI_PROVIDERS !== 'undefined' ? AUTHORIZED_AI_PROVIDERS : [
            "Google Gemini", "OpenAI ChatGPT", "Anthropic Claude", "Microsoft Copilot", "Perplexity AI", "DeepSeek", "Otro autorizado por Coordinación"
        ];
        const optionsHtml = aiProviders.map(p => `<option value="${this.escapeHTML(p)}">${this.escapeHTML(p)}</option>`).join('');

        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Todo uso de IA generativa debe registrarse en el Cuaderno de Bitácora oficial (Google Docs) con permisos de lectura antes de integrarse en el proyecto.</p>
            <div class="space-y-3">
                <div>
                    <label for="ai-tool" class="text-xs text-blue-400 font-bold uppercase block mb-1">Proveedor / Herramienta IA Autorizada</label>
                    <select id="ai-tool" class="w-full min-h-[44px] bg-slate-900 border border-blue-500/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-blue-400">
                        ${optionsHtml}
                    </select>
                </div>
                <div class="space-y-1.5 mb-3">
                    <label for="input-bitacora-url" class="text-[11px] font-mono text-slate-300 uppercase tracking-wide block">
                        Enlace a Cuaderno de Bitácora Oficial (Google Docs)
                    </label>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_4_BITACORA_IA')}
                    </div>
                    <input type="url" 
                           id="input-bitacora-url" 
                           name="bitacoraUrl" 
                           required 
                           placeholder="https://docs.google.com/document/d/..." 
                           class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white rounded font-mono outline-none focus:border-cyan-400 min-h-[44px]">
                    <p class="text-[10px] text-slate-400">
                        El registro se realiza en el Google Doc corporativo con permisos de lectura.
                    </p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitReportAI()" class="min-h-[44px] bg-blue-600 text-white px-5 py-2.5 text-xs font-bold uppercase hover:bg-blue-500 transition-colors">Enviar a Operaciones IA</button>`;
        this.showModal("Declaración de Uso de IA", html, actions);
    },

    submitReportAI() {
        if (!state.user) return;
        const elTool = document.getElementById('ai-tool');
        const elUrl = document.getElementById('input-bitacora-url');
        if (!elTool || !elUrl) return;
        
        const tool = this.cleanInput(elTool.value);
        const bitacoraUrl = this.cleanInput(elUrl.value);
        
        if (!tool || !bitacoraUrl) return this.notify("Completa todos los campos obligatorios.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(bitacoraUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }
        if (this.hasForbiddenWords(tool, 'Herramienta IA', elTool)) {
            return;
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.aiPrompts = co.aiPrompts || [];
        
        const autoApprove = state.user.role === 'OPERACIONES_IA';
        const newPrompt = {
            id: 'AI-' + Date.now(),
            role: state.user.role,
            tool,
            bitacoraUrl,
            date: new Date().toLocaleString(),
            status: autoApprove ? 'APROBADO' : 'PENDIENTE_VALIDACION'
        };
        co.aiPrompts.unshift(newPrompt);
        
        if (!autoApprove) {
            ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nuevo uso de IA reportado por ${state.user.role} pendiente de tu validación.`, 'info');
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
        
        const p = co.aiPrompts.find(x => x.id === pid);
        if(p) {
            if(ok) {
                p.status = 'APROBADO';
                ui.pushNotification(state.user.coId, p.role, `Tu reporte de uso de IA (${p.tool}) ha sido validado por Operaciones.`, 'success');
                this.notify("Reporte de IA validado y archivado.", "success");
            } else {
                co.aiPrompts = co.aiPrompts.filter(x => x.id !== pid);
                ui.pushNotification(state.user.coId, p.role, `Tu reporte de uso de IA (${p.tool}) fue rechazado por falta de verificación humana rigurosa.`, 'error');
                this.notify("Reporte de IA rechazado.", "info");
            }
            state.save();
            this.render();
        }
    }
});