// js/ui-empresa-ops.js
// --- MÓDULO OPERACIONES E IA: LOGÍSTICA FÍSICA, BITÁCORA IA Y DIARIO DE DECISIONES (v1.0.16) ---

Object.assign(ui, {
    viewCart(el) {
        if (!el || !state.user) return; 
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); 
        
        co.orders = co.orders || []; 
        
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
                <p class="text-xs text-mars-yellow uppercase font-bold mb-3">Registra el coste real físico (€) y marca las piezas que se han ensamblado:</p>
                <div class="space-y-3 mb-6">
                    ${(order.items || []).map((item, idx) => `
                        <div class="bg-slate-900 p-3 border border-mars-border flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                            <label class="mars-checkbox-label flex items-center gap-2.5 text-xs text-white font-bold cursor-pointer flex-grow min-h-[44px]">
                                <input type="checkbox" id="assembled-${this.escapeHTML(order.id)}-${idx}" class="mars-touch-input" checked>
                                <span class="mars-checkbox-visual"></span>
                                <span class="break-words">${this.escapeHTML(item.name)} (x${Number(item.qty)||1}) - <span class="text-mars-cyan font-mono">${Number(item.price).toFixed(2)} €v</span></span>
                            </label>
                            <div class="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                                <input type="number" id="real-eur-${this.escapeHTML(order.id)}-${idx}" aria-label="Coste real en euros de ${this.escapeHTML(item.name)}" placeholder="Coste Real (€)" step="0.01" class="min-h-[44px] bg-black border border-mars-magenta p-2.5 text-base sm:text-xs text-white w-full sm:w-32 outline-none focus:border-mars-cyan">
                                <input type="text" id="real-shop-${this.escapeHTML(order.id)}-${idx}" aria-label="Tienda de compra de ${this.escapeHTML(item.name)}" placeholder="Tienda (Ej: Bazar)" class="min-h-[44px] bg-black border border-slate-700 p-2.5 text-base sm:text-xs text-white w-full sm:w-40 outline-none focus:border-mars-cyan">
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button type="button" onclick="ui.executePhysicalOrder('${this.escapeHTML(order.id)}')" class="w-full min-h-[48px] bg-mars-cyan text-black font-black py-3 px-4 text-xs uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">[ CONFIRMAR COMPRA FÍSICA Y ENSAMBLAJE ]</button>
            </div>
        `).join('') || `<div class="terminal-border border-dashed p-10 text-center text-slate-300 italic text-xs">No hay órdenes aprobadas pendientes de ejecución logística.</div>`;

        wrapper.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">Logística de Despliegue Físico</h2>
            </div>
            ${ordersHtml}
        `;
        el.appendChild(wrapper);
    },

    executePhysicalOrder(oid) {
        if (!state.user) return;
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
            
            if(cb && cb.checked) {
                const valEur = parseFloat(eurInput ? eurInput.value : 0);
                const valShop = shopInput ? this.cleanInput(shopInput.value) : '';
                if(isNaN(valEur) || valEur < 0 || !valShop) {
                    return this.notify(`Falta indicar el coste real (€) o la tienda para: ${order.items[i].name}`, "warning");
                }
                // FASE 2: Auditar el texto de la tienda con el filtro léxico
                if(this.hasForbiddenWords(valShop, 'Registro Comercio I+D', shopInput)) {
                    return;
                }
                order.items[i].realEur = valEur;
                order.items[i].realShop = valShop;
                finalItems.push(order.items[i]);
                finalTotalEurV += Number(order.items[i].price) || 0;
                realCostsToLog.push({ id: 'RC-'+Date.now()+'-'+i, date: new Date().toLocaleDateString(), item: order.items[i].name, eur: valEur, shop: valShop });
            }
        }

        if(finalItems.length === 0) return this.notify("Debes marcar al menos un componente como comprado/ensamblado.", "warning");
        if(co.balance < finalTotalEurV) return this.notify("Fondos virtuales insuficientes en la cuenta de la empresa.", "error");

        order.items = finalItems;
        order.total = finalTotalEurV;
        order.status = 'EJECUTADO';

        state.addToLedger(state.user.coId, `Ejecución Logística Orden #${order.id}`, 'OPERACIONES_IA', -finalTotalEurV);
        co.realCosts.push(...realCostsToLog);

        telemetry.log("EJECUCIÓN LOGÍSTICA", `Orden #${order.id} completada por ${finalTotalEurV.toFixed(2)}€v`);
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
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
                <h2 class="font-orbitron text-blue-400 text-lg sm:text-xl uppercase tracking-tighter">Bitácora y Auditoría de Inteligencia Artificial</h2>
                <button type="button" onclick="ui.modalReportAI()" class="min-h-[44px] bg-blue-600 text-white px-4 py-2.5 text-xs font-bold uppercase hover:bg-blue-500 transition-all">[🤖 Nuevo Reporte IA]</button>
            </div>
            ${diaryDocsHtml}
            ${pendingHtml}
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-blue-500">
                <h3 class="font-orbitron text-blue-400 text-sm sm:text-base mb-4 uppercase tracking-tighter">Historial Oficial de Uso de IA (Aprobados)</h3>
                <div class="space-y-4">
                    ${approvedPrompts.map(p => `
                        <div class="bg-black/60 border border-slate-800 p-4 text-xs">
                            <div class="flex flex-wrap justify-between gap-2 border-b border-slate-800 pb-2 mb-2">
                                <span class="text-blue-400 font-bold uppercase">${this.escapeHTML(p.role)} • ${this.escapeHTML(p.tool)}</span>
                                <span class="text-slate-300">${this.escapeHTML(p.date)}</span>
                            </div>
                            <div class="mt-2">
                                ${(p.bitacoraUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.bitacoraUrl)) || (p.prompt && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(p.prompt))
                                    ? `<a href="${encodeURI(p.bitacoraUrl || p.prompt).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Bitácora en Docs ↗</span></a>`
                                    : `<span class="text-xs text-amber-500/80 font-mono italic">[Bitácora legacy archivada por protocolo RGPD]</span>`
                                }
                            </div>
                        </div>
                    `).join('') || '<p class="text-slate-300 italic text-xs">No hay registros de IA aprobados todavía.</p>'}
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    modalReportAI() {
        if (!state.user) return;
        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Todo uso de IA generativa debe registrarse en el Cuaderno de Bitácora oficial (Google Docs) con permisos de lectura antes de integrarse en el proyecto.</p>
            <div class="space-y-3">
                <div>
                    <label for="ai-tool" class="text-xs text-blue-400 font-bold uppercase block mb-1">Herramienta IA</label>
                    <input type="text" id="ai-tool" placeholder="Herramienta IA (Ej: ChatGPT, Claude, Gemini)..." class="w-full min-h-[44px] bg-slate-900 border border-blue-500/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-blue-400">
                </div>
                <div class="space-y-1.5 mb-3">
                    <label for="input-bitacora-url" class="text-[11px] font-mono text-slate-300 uppercase tracking-wide block">
                        Enlace a Cuaderno de Bitácora Oficial (Google Docs)
                    </label>
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