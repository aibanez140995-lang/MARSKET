// js/ui-empresa-gov-brand.js
// --- MÓDULO GOBERNANZA Y MARCA: MOCIONES, HR, IDENTIDAD Y MARKETING ---

Object.assign(ui, {
    modalCreateAuxRole() {
        if (!state.user) return; // REGLA 2
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.roles = co.roles || {}; // REGLA 1
        const currentPin = co.roles['AUXILIAR'] || 'No definido';
        const currentDept = co.auxRoleDept || 'No asignado';
        
        const html = `
            <p class="text-[10px] text-slate-400 mb-4">El rol Auxiliar tiene acceso de lectura y participación en mociones. Debes vincularlo a un departamento específico.</p>
            <div class="bg-slate-900 p-4 border border-mars-cyan mb-4">
                <p class="text-[10px] text-mars-cyan uppercase font-bold mb-2">PIN Actual: <span class="text-white">${currentPin}</span> | Dpto: <span class="text-white">${currentDept}</span></p>
                <input type="text" id="aux-pin-input" maxlength="4" placeholder="Nuevo PIN de 4 dígitos..." class="w-full bg-black border border-mars-border p-3 text-center text-white font-bold tracking-widest outline-none focus:border-mars-cyan mb-3">
                <select id="aux-dept-select" class="w-full bg-black border border-mars-border p-3 text-xs text-white uppercase outline-none focus:border-mars-cyan">
                    <option value="">-- Selecciona Departamento Vinculado --</option>
                    <option value="CEO">Dirección General (CEO)</option>
                    <option value="TECNICO">Dpto. Técnico (I+D)</option>
                    <option value="FINANZAS">Dpto. Financiero</option>
                    <option value="MARKETING">Dpto. Marketing</option>
                    <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
                </select>
            </div>
        `;
        const actions = `<button onclick="ui.submitAuxRole()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Guardar Rol Auxiliar</button>`;
        this.showModal("Gestionar Rol Observador (Auxiliar)", html, actions);
    },

    submitAuxRole() {
        if (!state.user) return;
        const elPin = document.getElementById('aux-pin-input');
        const elDept = document.getElementById('aux-dept-select');
        if (!elPin || !elDept) return; // REGLA 3
        
        const pin = elPin.value;
        const dept = elDept.value;
        
        if(pin.length !== 4) return alert("El PIN debe tener exactamente 4 dígitos.");
        if(!dept) return alert("Debes seleccionar un departamento vinculado.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.roles = co.roles || {};
        co.roles['AUXILIAR'] = pin;
        co.auxRoleDept = dept;
        
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal();
        alert(`Rol Auxiliar configurado y vinculado a ${dept}.`);
    },

    viewResolutions(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        co.votingMotions = co.votingMotions || []; // REGLA 1
        
        const wrapper = document.createElement('div');
        
        let headerActions = `
        <div class="flex gap-2">
            <button onclick="ui.modalReportInactivity()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all">Reportar Inactividad</button>
            <button onclick="ui.modalMotion()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-yellow hover:text-black transition-all">Proponer Moción</button>
        </div>`;

        wrapper.innerHTML = `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 class="font-orbitron text-mars-yellow text-xl uppercase tracking-tighter">Gobernanza y Resoluciones</h2>
            ${headerActions}
        </div>
        <div class="space-y-4">
            ${co.votingMotions.map(m => {
                const votes = Object.values(m.votes || {});
                const y = votes.filter(v => v === 'A FAVOR').length;
                const n = votes.filter(v => v === 'EN CONTRA').length;
                const total = y + n;
                const myVote = m.votes ? m.votes[state.user.role] : null;
                
                let actions = '';
                if(m.status === 'ABIERTA') {
                    if(!myVote) {
                        actions = `<div class="flex gap-2 mt-3"><button onclick="ui.voteMotion('${m.id}', 'A FAVOR')" class="bg-mars-green text-black px-3 py-1 text-[9px] font-bold uppercase hover:bg-white transition-colors">A Favor</button><button onclick="ui.voteMotion('${m.id}', 'EN CONTRA')" class="bg-mars-magenta text-white px-3 py-1 text-[9px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">En Contra</button></div>`;
                    } else {
                        actions = `<p class="text-[9px] text-mars-cyan mt-3 uppercase font-bold">Tu voto: ${myVote}</p>`;
                    }

                    const totalRoles = Object.keys(co.roles || {}).length;

                    if(state.user.role === 'CEO' && total >= totalRoles) {
                        actions += `<button onclick="ui.resolveMotion('${m.id}')" class="mt-3 bg-mars-yellow text-black px-4 py-2 text-[10px] font-bold uppercase w-full hover:bg-white transition-colors">Cerrar Votación</button>`;
                    } else if (state.user.role === 'CEO') {
                        actions += `<button onclick="ui.resolveMotion('${m.id}')" class="mt-3 bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-2 text-[10px] font-bold uppercase w-full hover:bg-mars-yellow hover:text-black transition-colors">Forzar Cierre de Votación</button>`;
                    }
                } else {
                    actions = `<p class="text-[10px] font-bold mt-3 uppercase ${m.result === 'APROBADA' ? 'text-mars-green' : 'text-mars-magenta'}">RESULTADO: ${m.result}</p>`;
                }

                return `
                <div class="terminal-border bg-mars-card p-4 border-l-4 ${m.status === 'ABIERTA' ? 'border-l-mars-yellow' : (m.result === 'APROBADA' ? 'border-l-mars-green' : 'border-l-mars-magenta')} w-full">
                    ${ui.renderWorkflowTracker(['Propuesta', 'Votación', 'Cierre (Acta)'], m.status === 'ABIERTA' ? (total > 0 ? 1 : 0) : 2)}
                    <div class="flex justify-between mb-2 mt-3"><h3 class="text-white font-bold uppercase text-xs">${m.title}</h3><span class="text-[8px] text-slate-500">${m.date}</span></div>
                    <p class="text-[10px] text-slate-400 mb-2">${m.desc}</p>
                    <div class="flex gap-4 text-[9px] text-slate-500 uppercase font-bold"><span>A Favor: <span class="text-mars-green">${y}</span></span><span>En Contra: <span class="text-mars-magenta">${n}</span></span></div>
                    ${actions}
                </div>`;
            }).join('') || '<p class="text-slate-500 text-xs italic">No hay mociones registradas.</p>'}
        </div>`;
        el.appendChild(wrapper);
    },

    modalReportInactivity() {
        if (!state.user) return;
        const html = `
            <p class="text-[10px] text-slate-400 mb-4">Usa este canal oficial para notificar al Claustro Docente si un departamento está bloqueando el progreso de la startup por inactividad.</p>
            <select id="inactivity-dept" class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white mb-3 outline-none focus:border-mars-cyan">
                <option value="">-- Selecciona el Departamento a Reportar --</option>
                <option value="CEO">Dirección General (CEO)</option>
                <option value="TECNICO">Dpto. Técnico (I+D)</option>
                <option value="FINANZAS">Dpto. Financiero</option>
                <option value="MARKETING">Dpto. Marketing</option>
                <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
            </select>
            <textarea id="inactivity-reason" placeholder="Describe detalladamente qué tareas no se están cumpliendo y cómo afecta al equipo..." class="w-full bg-slate-900 border border-mars-magenta p-2 text-xs text-white h-24 mb-2 outline-none focus:border-mars-cyan"></textarea>
        `;
        const actions = `<button onclick="ui.submitInactivityReport()" class="bg-mars-magenta text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Enviar Reporte al Claustro</button>`;
        this.showModal("Reporte de Inactividad (HR)", html, actions);
    },

    submitInactivityReport() {
        if (!state.user) return;
        const elDept = document.getElementById('inactivity-dept');
        const elReason = document.getElementById('inactivity-reason');
        if (!elDept || !elReason) return; // REGLA 3
        
        const dept = elDept.value;
        const reason = elReason.value.trim();
        
        if(!dept || !reason) return alert("Debes seleccionar un departamento y justificar el reporte.");
        if(dept === state.user.role) return alert("No puedes reportarte a ti mismo.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.inactivityReports = co.inactivityReports || [];
        
        co.inactivityReports.unshift({
            id: 'REP-' + Date.now(),
            reportedDept: dept,
            reportingRole: state.user.role,
            reason: reason,
            date: new Date().toLocaleString(),
            status: 'PENDIENTE'
        });
        
        telemetry.log("REPORTE HR", `Reportado departamento: ${dept}`);
        
        // FASE 3 (Req 4): Alerta Multicapa. Notificamos también al CEO de la startup.
        if (state.user.role !== 'CEO') {
            ui.pushNotification(state.user.coId, 'CEO', `⚠️ ALERTA HR: ${state.user.role} ha reportado inactividad en el departamento ${dept}.`, 'error');
        }
        
        state.save();
        this.closeModal();
        alert("Reporte enviado exitosamente al Claustro Docente y a Dirección General.");
    },

    modalMotion() {
        if (!state.user) return;
        const html = `
            <input type="text" id="motion-title" placeholder="Título de la moción..." class="w-full bg-slate-900 border border-mars-yellow p-2 text-xs text-white mb-2 outline-none focus:border-mars-yellow">
            <textarea id="motion-desc" placeholder="Descripción y justificación..." class="w-full bg-slate-900 border border-mars-yellow p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-yellow"></textarea>
        `;
        const actions = `<button onclick="ui.submitMotion()" class="bg-mars-yellow text-black px-4 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Registrar Moción</button>`;
        this.showModal("Proponer Moción de Gobernanza", html, actions);
    },

    submitMotion() {
        if (!state.user) return;
        const elTitle = document.getElementById('motion-title');
        const elDesc = document.getElementById('motion-desc');
        if (!elTitle || !elDesc) return; // REGLA 3
        
        const title = elTitle.value;
        const desc = elDesc.value;
        if(!title || !desc) return alert("Rellene todos los campos.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        co.votingMotions.unshift({ id: 'MOT-'+Date.now(), title, desc, authorRole: state.user.role, date: new Date().toLocaleString(), status: 'ABIERTA', votes: {} });
        
        ui.pushNotification(state.user.coId, 'CEO', `Nueva moción propuesta por ${state.user.role}.`, 'info');
        
        state.save(); this.closeModal(); this.render();
    },

    voteMotion(id, vote) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            m.votes = m.votes || {};
            m.votes[state.user.role] = vote;
            state.save(); this.render();
        }
    },

    resolveMotion(id) {
        if (!state.user || state.user.role !== 'CEO') return alert("Solo el CEO puede cerrar votaciones.");
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            const votes = Object.values(m.votes || {});
            const y = votes.filter(v => v === 'A FAVOR').length;
            const n = votes.filter(v => v === 'EN CONTRA').length;
            if(y > n) { m.result = 'APROBADA'; m.status = 'CERRADA'; }
            else if(n > y) { m.result = 'RECHAZADA'; m.status = 'CERRADA'; }
            else {
                return this.promptTieBreaker(id);
            }
            
            ui.pushNotification(state.user.coId, m.authorRole, `Tu moción ha sido ${m.result}.`, m.result === 'APROBADA' ? 'success' : 'error');
            
            state.save(); this.render();
        }
    },

    promptTieBreaker(id) {
        if (!state.user || state.user.role !== 'CEO') return;
        const html = `
            <p class="text-xs text-slate-300 mb-4">La votación ha resultado en empate. Como CEO, debes ejercer tu voto de calidad para desempatar.</p>
            <div class="flex gap-4">
                <button onclick="ui.executeTieBreaker('${id}', 'APROBADA')" class="flex-1 bg-mars-green text-black font-bold py-2 text-[10px] uppercase hover:bg-white transition-colors">Aprobar</button>
                <button onclick="ui.executeTieBreaker('${id}', 'RECHAZADA')" class="flex-1 bg-mars-magenta text-white font-bold py-2 text-[10px] uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
            </div>
        `;
        this.showModal("Voto de Calidad (CEO)", html, "");
    },

    executeTieBreaker(id, result) {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            m.result = result;
            m.status = 'CERRADA';
            
            ui.pushNotification(state.user.coId, m.authorRole, `Tu moción ha sido ${m.result} (Voto de Calidad).`, m.result === 'APROBADA' ? 'success' : 'error');
            
            state.save();
            this.closeModal();
            this.render();
        }
    },

    viewBrand(el) {
        if (!el || !state.user) return; // REGLA 2 y 3
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout(); // REGLA 4
        
        const docs = co.deliverables || {};
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        co.marketingCampaigns = co.marketingCampaigns || []; // REGLA 1
        
        const wrapper = document.createElement('div');
        
        let bestFlightHtml = '<p class="text-slate-500 italic text-xs">Aún no hay ensayos de vuelo registrados por el Dpto. Técnico.</p>';
        if (co.flightTests.length > 0) {
            const bestFlight = [...co.flightTests].sort((a, b) => b.efficiency - a.efficiency)[0];
            bestFlightHtml = `
                <div class="bg-black p-3 border border-mars-border">
                    <p class="text-[9px] text-mars-yellow uppercase font-bold mb-1">Mejor Ensayo Registrado</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-white font-bold text-xs">${bestFlight.bottle}</p>
                            <p class="text-[9px] text-slate-400">Coste: ${bestFlight.costEurV.toFixed(2)} €v | Altura: ${bestFlight.heightM.toFixed(1)}m</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[8px] text-slate-500 uppercase">Eficiencia (E)</p>
                            <p class="text-mars-green font-mono font-bold text-lg">${bestFlight.efficiency.toFixed(3)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + o.total, 0);

        let campaignsHtml = co.marketingCampaigns.map(c => `
            <div class="bg-black/50 border border-mars-border/50 p-3 mb-2">
                <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                    <span class="text-mars-cyan font-bold uppercase text-[10px]">${c.title}</span>
                    <span class="text-[8px] text-slate-500">${c.date}</span>
                </div>
                <p class="text-[9px] text-slate-300 italic mb-2">"${c.desc}"</p>
                ${c.url ? `<a href="${c.url}" target="_blank" class="text-[9px] text-mars-yellow hover:underline">🔗 Ver Creatividad</a>` : ''}
            </div>
        `).join('') || '<p class="text-slate-500 italic text-xs">No hay campañas registradas.</p>';

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta w-full">
                    <h2 class="font-orbitron text-mars-magenta text-lg mb-4 uppercase tracking-tighter">Identidad Corporativa</h2>
                    <input type="text" id="brand-slogan" value="${co.slogan||''}" placeholder="Eslogan corto corporativo..." class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-mars-yellow font-bold uppercase mb-4 focus:border-mars-magenta outline-none">
                    <p class="text-[9px] text-slate-400 mb-4 uppercase">Suba el logotipo diseñado para la corporación en formato PNG o JPG con fondo transparente para su visualización en el panel HUD.</p>
                    <div class="flex gap-2 w-full">
                        <button onclick="document.getElementById('brand-logo-upload').click()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-mars-magenta hover:text-white transition-all w-full">[ Cargar Imagen / Logo ]</button>
                        <button onclick="ui.saveSlogan()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all">Guardar</button>
                    </div>
                    <input type="file" id="brand-logo-upload" class="hidden" accept="image/png, image/jpeg" onchange="ui.handleLogoUpload(event)">
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green w-full">
                    <h2 class="font-orbitron text-mars-green text-lg mb-4 uppercase tracking-tighter">Inteligencia de Mercado y KPIs</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Datos técnicos reales para fundamentar los pitches ante inversores.</p>
                    <div class="space-y-4">
                        <div class="bg-black p-3 border border-mars-border flex justify-between items-center">
                            <span class="text-[9px] text-mars-cyan uppercase font-bold">Inversión Total I+D</span>
                            <span class="text-mars-cyan font-mono font-bold text-base">${totalDevCost.toFixed(2)} €v</span>
                        </div>
                        ${bestFlightHtml}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan w-full">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Manifiesto & Propuesta de Valor</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Redacte la misión, ventaja competitiva y pitch de atracción para inversores. Texto público en el Dossier Académico.</p>
                    <textarea id="val-prop-text" class="w-full bg-slate-900 border border-mars-border p-4 text-xs text-white h-32 outline-none focus:border-mars-cyan mb-4 leading-relaxed" placeholder="Redacte la misión corporativa aquí...">${co.valueProposition || ''}</textarea>
                    <button onclick="ui.saveValueProposition()" class="bg-mars-cyan text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all w-full">Guardar Propuesta de Valor</button>
                    <div class="mt-4 border-t border-slate-800 pt-4 w-full">
                        ${this.renderHybridUploadBox('Dossier Propuesta de Valor (PDF/URL)', 'Entregable oficial para Evaluación LYE.', 'valuePropDoc', docs.valuePropDoc)}
                    </div>
                </div>
            </div>
            <div class="space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow h-fit w-full overflow-hidden">
                    <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Entregas Oficiales de Oratoria & Pitch</h2>
                    <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Cargue los documentos de presentación requeridos para las defensas de oratoria ante el claustro. Soporta archivos o enlaces directos de Canva/Drive.</p>
                    
                    <div class="space-y-6 w-full">
                        ${this.renderHybridUploadBox('Presentación Fase I (Inglés - Micro-Pitch)', 'Evaluado por Liderazgo e Inglés.', 'presPhase1', docs.presPhase1)}
                        ${this.renderHybridUploadBox('Presentación Fase III (Castellano - Final)', 'Evaluado por Lengua Castellana.', 'presPhase3', docs.presPhase3)}
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan w-full">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Campañas de Marketing</h2>
                    <div class="space-y-4">
                        <div class="bg-slate-900 p-4 border border-mars-border">
                            <input type="text" id="mkt-camp-title" placeholder="Título de la campaña..." class="w-full bg-black border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                            <textarea id="mkt-camp-desc" placeholder="Descripción de las acciones realizadas..." class="w-full bg-black border border-mars-border p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-cyan"></textarea>
                            <input type="text" id="mkt-camp-url" placeholder="URL a creatividades (Drive/Canva)..." class="w-full bg-black border border-mars-border p-2 text-xs text-white mb-3 outline-none focus:border-mars-cyan">
                            <button onclick="ui.submitMarketingCampaign()" class="bg-mars-cyan text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors w-full">Registrar Campaña</button>
                        </div>
                        <div class="max-h-64 overflow-y-auto pr-2 space-y-2">
                            ${campaignsHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    submitMarketingCampaign() {
        if (!state.user) return;
        const elTitle = document.getElementById('mkt-camp-title');
        const elDesc = document.getElementById('mkt-camp-desc');
        const elUrl = document.getElementById('mkt-camp-url');
        if (!elTitle || !elDesc || !elUrl) return; // REGLA 3
        
        const title = elTitle.value;
        const desc = elDesc.value;
        const url = elUrl.value;
        
        if(!title || !desc) return alert("El título y la descripción son obligatorios.");
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.marketingCampaigns = co.marketingCampaigns || [];
        
        co.marketingCampaigns.unshift({ id: 'MKT-'+Date.now(), title, desc, url, date: new Date().toLocaleString() });
        telemetry.log("MARKETING", `Campaña registrada: ${title}`);
        state.save();
        this.render();
    },

    saveSlogan() {
        if (!state.user) return;
        const elSlogan = document.getElementById('brand-slogan');
        if (!elSlogan) return; // REGLA 3
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.slogan = elSlogan.value;
        state.save();
        alert("Eslogan guardado.");
        this.render();
    },

    saveValueProposition() {
        if (!state.user) return;
        const elText = document.getElementById('val-prop-text');
        if (!elText) return; // REGLA 3
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.valueProposition = elText.value;
        state.save();
        alert("Propuesta de valor guardada.");
        this.render();
    },

    handleLogoUpload(e) {
        if (!state.user) return;
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo PNG/JPG.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logo.");
        const reader = new FileReader();
        reader.onload = (ev) => {
            const co = state.data.companies[state.user.coId];
            if (!co) return auth.logout();
            co.logo = ev.target.result;
            telemetry.log("BRANDING", "LOGO ACTUALIZADO");
            state.save();
            this.render();
            alert("Logotipo corporativo guardado.");
        };
        reader.readAsDataURL(file);
    },

    handleDeliverableHybridSubmit(docType) {
        if (!state.user) return;
        const fileInput = document.getElementById(`upload-file-${docType}`);
        const urlInput = document.getElementById(`upload-url-${docType}`);
        if (!fileInput || !urlInput) return; // REGLA 3
        
        const file = fileInput.files[0];
        const url = urlInput.value;
        
        if(!file && !url) return alert("Debe adjuntar un archivo o proporcionar un enlace (URL).");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.deliverables = co.deliverables || { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null };

        if(file) {
            if (file.size > 2 * 1024 * 1024) return alert("El archivo supera el límite de 2MB. Envíe un enlace en su lugar.");
            const reader = new FileReader();
            reader.onload = (ev) => {
                co.deliverables[docType] = { type: 'file', name: file.name, date: new Date().toLocaleString(), size: (file.size / 1024).toFixed(1) + ' KB', dataUrl: ev.target.result };
                telemetry.log("ENTREGABLE", `Archivo subido: ${docType} (${file.name})`);
                state.save(); this.render(); alert("Documento entregado.");
            };
            reader.readAsDataURL(file);
        } else if(url) {
            if(!url.startsWith('http')) return alert("La URL debe comenzar con http:// o https://");
            co.deliverables[docType] = { type: 'link', name: 'Enlace a Nube Externa', date: new Date().toLocaleString(), size: 'URL', dataUrl: url };
            telemetry.log("ENTREGABLE", `Enlace subido: ${docType}`);
            state.save(); this.render(); alert("Enlace entregado.");
        }
    }
});