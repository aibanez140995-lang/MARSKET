// js/ui-empresa-ops.js
// --- MÓDULO OPERACIONES E IA: LOGÍSTICA FÍSICA, BITÁCORA IA Y DIARIO DE DECISIONES (v1.0.15) ---

Object.assign(ui, {
    viewCart(el) {
        if (!el || !state.user) return; 
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); 
        
        co.orders = co.orders || []; 
        
        const approvedOrders = co.orders.filter(o => o.status === 'APROBADO_FINANZAS');
        const wrapper = document.createElement('div');
        
        let ordersHtml = approvedOrders.map(order => `
            <div class="terminal-border bg-mars-card p-6 border-l-4 border-l-mars-green mb-6 w-full">
                ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], 1)}
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2 mt-4">
                    <div>
                        <span class="text-[9px] font-bold uppercase text-mars-green bg-mars-green/10 px-2 py-1 tracking-widest">[APROBADO POR FINANZAS]</span>
                        <h3 class="text-white font-orbitron mt-2 uppercase text-sm">ORDEN #${order.id}</h3>
                    </div>
                    <div class="text-left sm:text-right">
                        <p class="text-mars-green font-black font-mono text-xl">${Number(order.total).toFixed(2)} €v</p>
                        <p class="text-[8px] text-slate-500 uppercase">${order.date}</p>
                    </div>
                </div>
                <p class="text-[10px] text-mars-yellow uppercase font-bold mb-3">Registra el coste real físico (€) y marca las piezas que se han ensamblado:</p>
                <div class="space-y-3 mb-6">
                    ${(order.items || []).map((item, idx) => `
                        <div class="bg-slate-900 p-3 border border-mars-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <label class="flex items-center gap-2 text-xs text-white font-bold cursor-pointer flex-grow">
                                <input type="checkbox" id="assembled-${order.id}-${idx}" class="form-checkbox bg-black border-mars-cyan" checked>
                                ${item.name} (x${item.qty}) - <span class="text-mars-cyan font-mono">${Number(item.price).toFixed(2)} €v</span>
                            </label>
                            <div class="flex gap-2 w-full md:w-auto">
                                <input type="number" id="real-eur-${order.id}-${idx}" placeholder="Coste Real (€)" step="0.01" class="bg-black border border-mars-magenta p-2 text-xs text-white w-1/2 md:w-28 outline-none focus:border-mars-cyan">
                                <input type="text" id="real-shop-${order.id}-${idx}" placeholder="Tienda (Ej: Bazar)" class="bg-black border border-slate-700 p-2 text-xs text-white w-1/2 md:w-36 outline-none focus:border-mars-cyan">
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button onclick="ui.executePhysicalOrder('${order.id}')" class="w-full bg-mars-cyan text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,240,255,0.3)]">[ CONFIRMAR COMPRA FÍSICA Y ENSAMBLAJE ]</button>
            </div>
        `).join('') || `<div class="terminal-border border-dashed p-12 text-center text-slate-600 italic">No hay órdenes aprobadas pendientes de ejecución logística.</div>`;

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
        if(!order) return alert("Orden no encontrada.");

        let finalItems = [];
        let finalTotalEurV = 0;
        let realCostsToLog = [];

        for(let i=0; i<order.items.length; i++) {
            const cb = document.getElementById(`assembled-${order.id}-${i}`);
            const eurInput = document.getElementById(`real-eur-${order.id}-${i}`);
            const shopInput = document.getElementById(`real-shop-${order.id}-${i}`);
            
            if(cb && cb.checked) {
                const valEur = parseFloat(eurInput ? eurInput.value : 0);
                const valShop = shopInput ? shopInput.value.trim() : '';
                if(isNaN(valEur) || valEur < 0 || !valShop) {
                    return alert(`Falta indicar el coste real (€) o la tienda para: ${order.items[i].name}`);
                }
                if(this.hasForbiddenWords(valShop)) {
                    return alert("⚠️ Filtro Léxico: Nombre de tienda o comercio no permitido.");
                }
                order.items[i].realEur = valEur;
                order.items[i].realShop = valShop;
                finalItems.push(order.items[i]);
                finalTotalEurV += Number(order.items[i].price) || 0;
                realCostsToLog.push({ id: 'RC-'+Date.now()+'-'+i, date: new Date().toLocaleDateString(), item: order.items[i].name, eur: valEur, shop: valShop });
            }
        }

        if(finalItems.length === 0) return alert("Debes marcar al menos un componente como comprado/ensamblado.");
        if(co.balance < finalTotalEurV) return alert("Fondos virtuales insuficientes en la cuenta de la empresa.");

        order.items = finalItems;
        order.total = finalTotalEurV;
        order.status = 'EJECUTADO';

        state.addToLedger(state.user.coId, `Ejecución Logística Orden #${order.id}`, 'OPERACIONES_IA', -finalTotalEurV);
        co.realCosts.push(...realCostsToLog);

        telemetry.log("EJECUCIÓN LOGÍSTICA", `Orden #${order.id} completada por ${finalTotalEurV.toFixed(2)}€v`);
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        alert(`✅ Orden #${order.id} ejecutada. El saldo virtual ha sido descontado y los costes reales registrados.`);
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
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow mb-8">
                <h3 class="font-orbitron text-mars-yellow text-sm mb-4 uppercase tracking-tighter">Prompts Pendientes de Auditoría (${pendingPrompts.length})</h3>
                <div class="space-y-4">
                    ${pendingPrompts.map(p => `
                        <div class="bg-slate-900 border border-mars-yellow/50 p-4 text-[10px]">
                            <div class="flex justify-between mb-2"><span class="text-mars-cyan font-bold uppercase">Autor: ${p.role} \vert{} Herramienta:${p.tool}</span><span class="text-slate-500">${p.date}</span></div>
                            <p class="text-white font-bold mb-1">Prompt:</p>
                            <p class="text-slate-300 italic bg-black p-2 border border-slate-800 mb-2">"${p.prompt}"</p>
                            <p class="text-white font-bold mb-1">Verificación Humana:</p>
                            <p class="text-slate-300 bg-black p-2 border border-slate-800 mb-3">${p.verification}</p>
                            <div class="flex gap-2">
                                <button onclick="ui.validateAIPrompt('${p.id}', true)" class="bg-mars-green text-black px-4 py-2 font-bold uppercase hover:bg-white transition-colors">Aprobar y Registrar</button>
                                <button onclick="ui.validateAIPrompt('${p.id}', false)" class="bg-mars-magenta text-white px-4 py-2 font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        // Bloque de Entregables Oficiales de Bitácora de Decisiones e IA (LyE 4A y 4B)
        const diaryDocsHtml = `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8">
            <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Entregables Oficiales: Diario de Decisiones, Conflictos e IA (LyE)</h3>
                <span class="text-[8px] bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-2 py-0.5 font-bold uppercase">Resp: Operaciones IA / Marketing</span>
            </div>
            <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Sube los enlaces de Google Drive o Canva correspondientes a las dos entregas oficiales de la bitácora del proyecto.</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                ${this.renderDriveLinkBox('4A. Diario Decisiones, Conflictos e IA — DICIEMBRE', 'Enlace Drive a la 1ª Entrega (Diciembre) de gobernanza y auditoría IA.', 'decisionDiary_dec', docs.decisionDiary_dec)}
                ${this.renderDriveLinkBox('4B. Diario Decisiones, Conflictos e IA — ABRIL', 'Enlace Drive a la 2ª Entrega (Abril) de cierre de bitácora e IA.', 'decisionDiary_apr', docs.decisionDiary_apr)}
            </div>
        </div>`;

        wrapper.innerHTML = `
            <div class="flex justify-between items-center mb-6">
                <h2 class="font-orbitron text-blue-400 text-lg sm:text-xl uppercase tracking-tighter">Bitácora y Auditoría de Inteligencia Artificial</h2>
                <button onclick="ui.modalReportAI()" class="bg-blue-600 text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-blue-500 transition-all">[🤖 Nuevo Reporte IA]</button>
            </div>
            ${diaryDocsHtml}
            ${pendingHtml}
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500">
                <h3 class="font-orbitron text-blue-400 text-sm mb-4 uppercase tracking-tighter">Historial Oficial de Uso de IA (Aprobados)</h3>
                <div class="space-y-4">
                    ${approvedPrompts.map(p => `
                        <div class="bg-black/60 border border-slate-800 p-4 text-[10px]">
                            <div class="flex justify-between border-b border-slate-800 pb-2 mb-2">
                                <span class="text-blue-400 font-bold uppercase">${p.role} •${p.tool}</span>
                                <span class="text-slate-500">${p.date}</span>
                            </div>
                            <p class="text-slate-400 mb-1"><strong class="text-white">Prompt:</strong> "${p.prompt}"</p>
                            <p class="text-mars-green"><strong class="text-white">Validación Humana:</strong> ${p.verification}</p>
                        </div>
                    `).join('') || '<p class="text-slate-600 italic text-xs">No hay registros de IA aprobados todavía.</p>'}
                </div>
            </div>
        `;
        el.appendChild(wrapper);
    },

    modalReportAI() {
        if (!state.user) return;
        const html = `
            <p class="text-[10px] text-slate-400 mb-3">Todo uso de IA generativa debe ser declarado y verificado por un humano antes de incluirse en el proyecto.</p>
            <input type="text" id="ai-tool" placeholder="Herramienta IA (Ej: ChatGPT, Claude, Gemini)..." class="w-full bg-slate-900 border border-blue-500/50 p-2 text-xs text-white mb-2 outline-none focus:border-blue-400">
            <textarea id="ai-prompt" placeholder="Copia o resume el Prompt utilizado..." class="w-full bg-slate-900 border border-blue-500/50 p-2 text-xs text-white h-20 mb-2 outline-none focus:border-blue-400"></textarea>
            <textarea id="ai-verify" placeholder="¿Cómo has verificado que la respuesta de la IA es correcta y qué cambios humanos has aplicado?..." class="w-full bg-slate-900 border border-blue-500/50 p-2 text-xs text-white h-20 mb-2 outline-none focus:border-blue-400"></textarea>
        `;
        const actions = `<button onclick="ui.submitReportAI()" class="bg-blue-600 text-white px-5 py-2 text-[10px] font-bold uppercase hover:bg-blue-500 transition-colors">Enviar a Operaciones IA</button>`;
        this.showModal("Declaración de Uso de IA", html, actions);
    },

    submitReportAI() {
        if (!state.user) return;
        const elTool = document.getElementById('ai-tool');
        const elPrompt = document.getElementById('ai-prompt');
        const elVerify = document.getElementById('ai-verify');
        if (!elTool || !elPrompt || !elVerify) return;
        
        const tool = elTool.value.trim();
        const prompt = elPrompt.value.trim();
        const verification = elVerify.value.trim();
        
        if(!tool || !prompt || !verification) return alert("Completa todos los campos de trazabilidad IA.");
        if(this.hasForbiddenWords(tool) || this.hasForbiddenWords(prompt) || this.hasForbiddenWords(verification)) {
            return alert("⚠️ Filtro Léxico: Se ha detectado vocabulario inapropiado en el reporte de IA.");
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.aiPrompts = co.aiPrompts || [];
        
        const autoApprove = state.user.role === 'OPERACIONES_IA';
        co.aiPrompts.unshift({
            id: 'AI-' + Date.now(),
            role: state.user.role,
            tool,
            prompt,
            verification,
            date: new Date().toLocaleString(),
            status: autoApprove ? 'APROBADO' : 'PENDIENTE_VALIDACION'
        });
        
        if (!autoApprove) {
            ui.pushNotification(state.user.coId, 'OPERACIONES_IA', `Nuevo uso de IA reportado por ${state.user.role} pendiente de tu validación.`, 'info');
        }
        
        telemetry.log("REPORTE IA", `Declarado uso de ${tool}`);
        state.save();
        this.closeModal();
        alert(autoApprove ? "✅ Uso de IA registrado y aprobado en la Bitácora." : "✅ Reporte enviado al Director de Operaciones e IA para su validación.");
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
            } else {
                co.aiPrompts = co.aiPrompts.filter(x => x.id !== pid);
                ui.pushNotification(state.user.coId, p.role, `Tu reporte de uso de IA (${p.tool}) fue rechazado por falta de verificación humana rigurosa.`, 'error');
            }
            state.save();
            this.render();
        }
    }
});