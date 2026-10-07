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
        co.marketingPackages = co.marketingPackages || []; // REGLA 1
        co.marketingCampaigns = co.marketingCampaigns || []; // REGLA 1
        
        const wrapper = document.createElement('div');

        // Renderizado de Paquetes Contratados
        let packagesHtml = co.marketingPackages.map(p => {
            const trackerIdx = p.status === 'PENDIENTE_FINANZAS' ? 0 : p.status === 'APROBADO' ? 1 : 2;
            const isAgotado = p.usedActions >= p.totalActions;
            
            return `
            <div class="bg-black/50 border ${p.status === 'APROBADO' && !isAgotado ? 'border-mars-green/50' : p.status === 'DENEGADA' ? 'border-mars-magenta/50' : 'border-mars-yellow/50'} p-3 mb-2">
                ${p.status !== 'DENEGADA' ? ui.renderWorkflowTracker(['MKT (Solicita)', 'FIN (Audita)', 'Activo'], trackerIdx) : ''}
                <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2 mt-2">
                    <span class="text-mars-cyan font-bold uppercase text-[10px]">${p.name}</span>
                    <span class="text-mars-magenta font-mono font-bold text-[10px]">${p.cost} €v</span>
                </div>
                <div class="flex justify-between items-center text-[9px]">
                    <span class="text-slate-400">Acciones: <span class="text-white font-bold">${p.usedActions} / ${p.totalActions}</span></span>
                    ${p.status === 'PENDIENTE_FINANZAS' ? `<span class="text-mars-yellow font-bold uppercase animate-pulse">Esperando Finanzas...</span>` : ''}
                    ${p.status === 'APROBADO' && !isAgotado ? `<span class="text-mars-green font-bold uppercase">ACTIVO</span>` : ''}
                    ${p.status === 'APROBADO' && isAgotado ? `<span class="text-slate-500 font-bold uppercase">AGOTADO</span>` : ''}
                    ${p.status === 'DENEGADA' ? `<span class="text-mars-magenta font-bold uppercase">DENEGADO</span>` : ''}
                </div>
                ${p.status === 'DENEGADA' ? `<p class="text-[9px] text-mars-magenta mt-2 italic">Motivo: ${p.denyReason}</p>` : ''}
            </div>
            `;
        }).join('') || '<p class="text-slate-500 italic text-xs">No hay paquetes solicitados.</p>';

        // Renderizado de Acciones Ejecutadas
        let actionsHtml = co.marketingCampaigns.map(c => `
            <div class="bg-slate-900 border border-mars-border/50 p-3 mb-2">
                <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                    <span class="text-white font-bold uppercase text-[10px]">${c.title}</span>
                    <span class="text-[8px] text-slate-500">${c.date}</span>
                </div>
                <p class="text-[8px] text-mars-cyan font-bold mb-1 uppercase">Vía: ${c.pkgName || 'Campaña Legacy'}</p>
                <p class="text-[9px] text-slate-300 italic mb-2">"${c.desc}"</p>
                ${c.url ? `<a href="${c.url}" target="_blank" class="text-[9px] text-mars-yellow hover:underline">🔗 Ver Creatividad</a>` : ''}
            </div>
        `).join('') || '<p class="text-slate-500 italic text-xs">No hay acciones publicadas.</p>';

        // Selector de paquetes activos para el formulario de nueva acción
        const activePackages = co.marketingPackages.filter(p => p.status === 'APROBADO' && p.usedActions < p.totalActions);
        let activePackagesOptions = activePackages.map(p => `<option value="${p.id}">${p.name} (${p.totalActions - p.usedActions} restantes)</option>`).join('');

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- COLUMNA IZQUIERDA: Identidad, Manifiesto y Modelos de Negocio -->
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

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan w-full">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Manifiesto & Propuesta de Valor</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Redacte la misión, ventaja competitiva y pitch de atracción para inversores. Texto público en el Dossier Académico.</p>
                    <textarea id="val-prop-text" class="w-full bg-slate-900 border border-mars-border p-4 text-xs text-white h-32 outline-none focus:border-mars-cyan mb-4 leading-relaxed" placeholder="Redacte la misión corporativa aquí...">${co.valueProposition || ''}</textarea>
                    <button onclick="ui.saveValueProposition()" class="bg-mars-cyan text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all w-full">Guardar Propuesta de Valor</button>
                    <div class="mt-4 border-t border-slate-800 pt-4 w-full">
                        ${this.renderHybridUploadBox('Dossier Propuesta de Valor (PDF/URL)', 'Entregable oficial para Evaluación LYE.', 'valuePropDoc', docs.valuePropDoc)}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green w-full">
                    <h2 class="font-orbitron text-mars-green text-lg mb-4 uppercase tracking-tighter">Modelos de Negocio (LyE)</h2>
                    <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Documentación estratégica y operativa de la empresa.</p>
                    <div class="space-y-6 w-full">
                        ${this.renderHybridUploadBox('Business Model (Documento Escrito)', 'Documento formal con roles, funciones y estructura.', 'businessModel', docs.businessModel)}
                        ${this.renderHybridUploadBox('Business Model Canvas', 'Lienzo estratégico del modelo de negocio.', 'canvas', docs.canvas)}
                    </div>
                </div>
            </div>

            <!-- COLUMNA DERECHA: Dossier, Audiovisual y Agencia de Medios -->
            <div class="space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow h-fit w-full overflow-hidden">
                    <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Dossier y Oratoria (Lengua)</h2>
                    <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Documentos de presentación y textos argumentativos para inversores.</p>
                    <div class="space-y-6 w-full">
                        ${this.renderHybridUploadBox('Dossier para Inversores', 'Texto argumentativo formal (Evaluación Lengua).', 'dossierInversores', docs.dossierInversores)}
                        ${this.renderHybridUploadBox('Presentación Fase I (Inglés - Micro-Pitch)', 'Evaluado por Liderazgo e Inglés.', 'presPhase1', docs.presPhase1)}
                        ${this.renderHybridUploadBox('Presentación Fase III (Castellano - Final)', 'Evaluado por Lengua Castellana.', 'presPhase3', docs.presPhase3)}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta w-full">
                    <h2 class="font-orbitron text-mars-magenta text-lg mb-4 uppercase tracking-tighter">Audiovisual (Marketing)</h2>
                    <div class="space-y-6 w-full">
                        ${this.renderHybridUploadBox('Vídeo Promocional V2.0', 'Resumen visual del proceso de I+D y capacidades del cohete.', 'videoPromo', docs.videoPromo)}
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan w-full">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Agencia de Medios (Paquetes)</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Solicita presupuesto a Finanzas para contratar paquetes de difusión.</p>
                    <div class="bg-slate-900 p-4 border border-mars-border mb-4">
                        <select id="mkt-pkg-select" class="w-full bg-black border border-mars-cyan p-2 text-xs text-white mb-3 outline-none focus:border-mars-cyan">
                            <option value="">-- Selecciona un Paquete Publicitario --</option>
                            <option value="Pack Satélite|200|3">Pack 'Satélite' (200 €v) - 3 acciones online</option>
                            <option value="Pack Prensa Tradicional|300|3">Pack 'Prensa Tradicional' (300 €v) - 3 acciones escritas</option>
                            <option value="Pack Despegue Híbrido|400|4">Pack 'Despegue Híbrido' (400 €v) - 2 online / 2 escrito</option>
                            <option value="Pack Cobertura Supernova|550|6">Pack 'Cobertura Supernova' (550 €v) - 6 acciones multicanal</option>
                        </select>
                        <button onclick="ui.submitMarketingPackage()" class="bg-mars-cyan text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors w-full">Solicitar Paquete a Finanzas</button>
                    </div>
                    <div class="max-h-48 overflow-y-auto pr-2 space-y-2">
                        ${packagesHtml}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green w-full">
                    <h2 class="font-orbitron text-mars-green text-lg mb-4 uppercase tracking-tighter">Ejecución de Campañas</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Consume las acciones disponibles de tus paquetes activos.</p>
                    
                    ${activePackages.length > 0 ? `
                    <div class="bg-slate-900 p-4 border border-mars-green mb-4">
                        <select id="mkt-act-pkg" class="w-full bg-black border border-mars-green p-2 text-xs text-white mb-2 outline-none focus:border-mars-green">
                            <option value="">-- Selecciona el Paquete a consumir --</option>
                            ${activePackagesOptions}
                        </select>
                        <input type="text" id="mkt-act-title" placeholder="Título de la acción..." class="w-full bg-black border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-green">
                        <textarea id="mkt-act-desc" placeholder="Descripción de la creatividad..." class="w-full bg-black border border-mars-border p-2 text-xs text-white h-20 mb-2 outline-none focus:border-mars-green"></textarea>
                        <input type="text" id="mkt-act-url" placeholder="URL a creatividad (Drive/Canva)..." class="w-full bg-black border border-mars-border p-2 text-xs text-white mb-3 outline-none focus:border-mars-green">
                        <button onclick="ui.submitMarketingAction()" class="bg-mars-green text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors w-full">Publicar Acción</button>
                    </div>
                    ` : `<div class="bg-black border border-dashed border-slate-700 p-4 text-center mb-4"><p class="text-[10px] text-slate-500 uppercase">No tienes paquetes activos con saldo de acciones.</p></div>`}
                    
                    <div class="max-h-64 overflow-y-auto pr-2 space-y-2">
                        ${actionsHtml}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    submitMarketingPackage() {
        if (!state.user) return;
        const elPkg = document.getElementById('mkt-pkg-select');
        if (!elPkg) return; // REGLA 3
        
        const pkgVal = elPkg.value;
        if(!pkgVal) return alert("Debes seleccionar un paquete.");
        
        const [packName, packCost, packActions] = pkgVal.split('|');
        const cost = parseFloat(packCost);
        const totalActions = parseInt(packActions);

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.marketingPackages = co.marketingPackages || [];
        
        co.marketingPackages.unshift({ 
            id: 'PKG-'+Date.now(), 
            name: packName,
            cost: cost,
            totalActions: totalActions,
            usedActions: 0,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString() 
        });
        
        telemetry.log("MARKETING", `Paquete solicitado: ${packName}`);
        ui.pushNotification(state.user.coId, 'FINANZAS', `Nuevo paquete de marketing pendiente de aprobación presupuestaria.`, 'warning');
        
        state.save();
        this.render();
    },

    submitMarketingAction() {
        if (!state.user) return;
        const elPkgId = document.getElementById('mkt-act-pkg');
        const elTitle = document.getElementById('mkt-act-title');
        const elDesc = document.getElementById('mkt-act-desc');
        const elUrl = document.getElementById('mkt-act-url');
        
        if (!elPkgId || !elTitle || !elDesc || !elUrl) return; // REGLA 3
        
        const pkgId = elPkgId.value;
        const title = elTitle.value;
        const desc = elDesc.value;
        const url = elUrl.value;
        
        if(!pkgId || !title || !desc) return alert("Debes seleccionar un paquete, título y descripción.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.marketingPackages = co.marketingPackages || [];
        co.marketingCampaigns = co.marketingCampaigns || [];
        
        const pkg = co.marketingPackages.find(p => p.id === pkgId);
        if (!pkg || pkg.usedActions >= pkg.totalActions) return alert("Paquete inválido o agotado.");
        
        pkg.usedActions++;
        
        co.marketingCampaigns.unshift({
            id: 'ACT-'+Date.now(),
            pkgId: pkg.id,
            pkgName: pkg.name,
            title: title,
            desc: desc,
            url: url,
            date: new Date().toLocaleString()
        });
        
        telemetry.log("MARKETING", `Acción publicada: ${title} (Vía ${pkg.name})`);
        
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
        co.deliverables = co.deliverables || { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null, boceto: null, fotoPrototipo: null, videoPromo: null, mathGoniometro: null, mathMedicion1: null, mathMedicion2: null, mathComparativa: null, businessModel: null, canvas: null, dossierInversores: null };

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