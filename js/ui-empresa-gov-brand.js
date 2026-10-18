// js/ui-empresa-gov-brand.js
// --- MÓDULO GOBERNANZA Y MARCA: MOCIONES, HR, REGISTRO MERCANTIL Y PAQUETES MARKETING (v1.0.17) ---

Object.assign(ui, {
    setBrandDocTab(tab) {
        this.brandDocTab = tab;
        this.render();
    },

    modalCreateAuxRole() {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.roles = co.roles || {};
        co.auxRoleRequest = co.auxRoleRequest || { status: co.roles['AUXILIAR'] ? 'APROBADO' : 'INACTIVO', dept: co.auxRoleDept || '', pin: co.roles['AUXILIAR'] || '' };
        
        const req = co.auxRoleRequest;
        const currentPin = co.roles['AUXILIAR'] || 'No activo';
        const currentDept = co.auxRoleDept || 'No asignado';

        let statusBanner = '';
        if (req.status === 'PENDIENTE') {
            statusBanner = `
            <div class="bg-mars-yellow/15 border border-mars-yellow p-3 mb-4 text-[10px]">
                <span class="text-mars-yellow font-black uppercase block mb-1">⏳ Solicitud Pendiente en Coordinación</span>
                <p class="text-slate-300">Has solicitado vincular el Rol Auxiliar a <strong>${req.dept}</strong> con el PIN propuesto <strong>${req.pin}</strong>. Coordinación debe autorizarlo para que sea operativo.</p>
            </div>`;
        } else if (req.status === 'RECHAZADO') {
            statusBanner = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-[10px]">
                <span class="text-mars-magenta font-black uppercase block mb-1">❌ Solicitud Denegada por Coordinación</span>
                <p class="text-slate-300">La última solicitud de Rol Auxiliar fue rechazada. Puedes enviar una nueva propuesta corregida.</p>
            </div>`;
        } else if (co.roles['AUXILIAR']) {
            statusBanner = `
            <div class="bg-mars-green/15 border border-mars-green p-3 mb-4 text-[10px]">
                <span class="text-mars-green font-black uppercase block mb-1">✓ Rol Auxiliar Activo y Autorizado</span>
                <p class="text-slate-300">PIN Operativo: <strong class="text-white font-mono">${currentPin}</strong> | Vinculado a: <strong class="text-mars-cyan">${currentDept}</strong></p>
            </div>`;
        }
        
        const html = `
            <p class="text-[10px] text-slate-400 mb-3 leading-relaxed">El Rol Observador (Auxiliar) requiere autorización previa de Coordinación Docente. Propón el departamento al que prestará apoyo y el PIN de 4 dígitos deseado.</p>
            ${statusBanner}
            <div class="bg-slate-900 p-4 border border-mars-cyan mb-2">
                <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">PIN Propuesto (4 dígitos)</label>
                <input type="text" id="aux-pin-input" maxlength="4" value="${req.pin || ''}" placeholder="Ej: 5555" class="w-full bg-black border border-mars-border p-3 text-center text-white font-bold tracking-widest outline-none focus:border-mars-cyan mb-3">
                <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Departamento Vinculado</label>
                <select id="aux-dept-select" class="w-full bg-black border border-mars-border p-3 text-xs text-white uppercase outline-none focus:border-mars-cyan">
                    <option value="">-- Selecciona Departamento Vinculado --</option>
                    <option value="CEO" ${req.dept==='CEO'?'selected':''}>Dirección General (CEO)</option>
                    <option value="TECNICO" ${req.dept==='TECNICO'?'selected':''}>Dpto. Técnico (I+D)</option>
                    <option value="FINANZAS" ${req.dept==='FINANZAS'?'selected':''}>Dpto. Financiero</option>
                    <option value="MARKETING" ${req.dept==='MARKETING'?'selected':''}>Dpto. Marketing</option>
                    <option value="OPERACIONES_IA" ${req.dept==='OPERACIONES_IA'?'selected':''}>Dpto. Operaciones e IA</option>
                </select>
            </div>
        `;
        const actions = `<button onclick="ui.submitAuxRole()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors">Solicitar Alta a Coordinación</button>`;
        this.showModal("Solicitud de Rol Observador (Auxiliar)", html, actions);
    },

    submitAuxRole() {
        if (!state.user) return;
        const elPin = document.getElementById('aux-pin-input');
        const elDept = document.getElementById('aux-dept-select');
        if (!elPin || !elDept) return;
        
        const pin = elPin.value.trim();
        const dept = elDept.value;
        
        if (!/^\d{4}$/.test(pin)) return alert("El PIN propuesto debe tener exactamente 4 dígitos numéricos.");
        if (!dept) return alert("Debes seleccionar un departamento vinculado.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.auxRoleRequest = {
            status: 'PENDIENTE',
            dept: dept,
            pin: pin,
            date: new Date().toLocaleString()
        };
        
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal();
        alert(`⏳ Solicitud enviada a Coordinación Docente. Una vez aprobada, el PIN quedará habilitado.`);
        this.render();
    },

    viewResolutions(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.votingMotions = co.votingMotions || [];
        const isCEO = state.user.role === 'CEO';
        
        const wrapper = document.createElement('div');
        
        let headerActions = `
        <div class="flex gap-2">
            <button onclick="ui.modalReportInactivity()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all">Reportar Inactividad</button>
            <button onclick="ui.modalMotion()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-yellow hover:text-black transition-all">Proponer Moción</button>
        </div>`;

        let nameChangeHtml = '';
        if (isCEO) {
            const req = co.nameChangeRequest;
            if (req && req.status === 'PENDIENTE') {
                nameChangeHtml = `
                <div class="bg-mars-yellow/10 border border-mars-yellow p-4 flex justify-between items-center mb-6">
                    <div>
                        <span class="text-[9px] text-mars-yellow font-bold uppercase tracking-widest block mb-1">Registro Mercantil</span>
                        <p class="text-xs text-white">Solicitud enviada: <span class="font-orbitron font-bold">${req.proposedName}</span></p>
                    </div>
                    <span class="text-[8px] bg-mars-yellow text-black font-black px-2 py-1 uppercase animate-pulse">En Revisión</span>
                </div>`;
            } else {
                nameChangeHtml = `
                <button onclick="ui.promptRequestNameChange()" class="w-full bg-slate-900 border border-slate-700 hover:border-mars-yellow text-slate-300 hover:text-white p-3 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-between mb-6 group">
                    <span>🏛️ Solicitar Cambio de Denominación Social</span>
                    <span class="opacity-0 group-hover:opacity-100 text-mars-yellow transition-opacity">➔</span>
                </button>`;
            }
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 space-y-6">
                ${nameChangeHtml}
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-mars-border pb-3">
                        <h2 class="font-orbitron text-mars-cyan text-base uppercase tracking-tighter">Asamblea y Votaciones</h2>
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
                            <div class="terminal-border bg-slate-900 p-4 border-l-4 ${m.status === 'ABIERTA' ? 'border-l-mars-yellow' : (m.result === 'APROBADA' ? 'border-l-mars-green' : 'border-l-mars-magenta')} w-full">
                                ${ui.renderWorkflowTracker(['Propuesta', 'Votación', 'Cierre (Acta)'], m.status === 'ABIERTA' ? (total > 0 ? 1 : 0) : 2)}
                                <div class="flex justify-between mb-2 mt-3"><h3 class="text-white font-bold uppercase text-xs">${m.title}</h3><span class="text-[8px] text-slate-500">${m.date}</span></div>
                                <p class="text-[10px] text-slate-300 italic mb-3">"${m.desc}"</p>
                                <div class="w-full bg-black h-2 flex rounded-sm overflow-hidden mb-1">
                                    <div class="bg-mars-green h-full transition-all" style="width: ${totalRoles>0?(y/totalRoles)*100:0}%"></div>
                                    <div class="bg-mars-magenta h-full transition-all" style="width: ${totalRoles>0?(n/totalRoles)*100:0}%"></div>
                                </div>
                                <div class="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                                    <span class="text-mars-green">${y} A Favor</span>
                                    <span>Quórum: ${total}/${Object.keys(co.roles).length}</span>
                                    <span class="text-mars-magenta">${n} En Contra</span>
                                </div>
                                ${actions}
                            </div>`;
                        }).join('') || '<p class="text-slate-500 text-xs italic">No hay mociones asamblearias registradas.</p>'}
                    </div>
                </div>
            </div>
            <div class="lg:col-span-4 space-y-6">
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-magenta">
                    <h3 class="font-orbitron text-mars-magenta text-sm uppercase tracking-tighter mb-4 border-b border-mars-border pb-2">Buzón de Conflictos (HR)</h3>
                    <p class="text-[9px] text-slate-400 uppercase mb-4 leading-relaxed">Reporta a un departamento inactivo que esté bloqueando el avance del proyecto.</p>
                    <button onclick="ui.modalReportInactivity()" class="w-full bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-mars-magenta hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.2)]">Abrir Expediente HR</button>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    promptRequestNameChange() {
        if (!state.user || state.user.role !== 'CEO') return;
        const html = `
            <p class="text-[10px] text-slate-400 mb-4 leading-relaxed uppercase">La modificación de la razón social debe ser evaluada por Coordinación. El historial contable y el código de la empresa permanecerán intactos.</p>
            <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nueva Denominación Propuesta</label>
            <input type="text" id="req-new-name" placeholder="Ej: Astra Aerospace, Horizon Tech..." class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-xs text-white font-orbitron uppercase outline-none focus:border-mars-yellow mb-3">
            <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Justificación del Cambio</label>
            <textarea id="req-name-reason" placeholder="Motivo del pivotaje o reorientación de marca..." class="w-full bg-slate-900 border border-slate-700 p-3 text-xs text-white h-20 outline-none focus:border-mars-yellow"></textarea>
        `;
        const actions = `<button onclick="ui.submitNameChangeRequest()" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Transmitir a Coordinación</button>`;
        this.showModal("Solicitud Oficial de Renombramiento", html, actions);
    },

    submitNameChangeRequest() {
        const elName = document.getElementById('req-new-name');
        const elReason = document.getElementById('req-name-reason');
        if (!elName || !elReason) return;

        const newName = elName.value.trim();
        const reason = elReason.value.trim();

        if (newName.length < 3) return alert("La denominación propuesta es demasiado corta.");
        if (reason.length < 5) return alert("Debes justificar el motivo del cambio.");

        if (ui.hasForbiddenWords && ui.hasForbiddenWords(newName + " " + reason, 'Registro Mercantil (Nombre)')) return;

        const co = state.data.companies[state.user.coId];
        co.nameChangeRequest = {
            status: 'PENDIENTE',
            proposedName: newName,
            reason: reason,
            date: new Date().toLocaleString()
        };

        state.save();
        this.closeModal();
        this.render();
        alert("✅ Solicitud enviada exitosamente al Registro Mercantil (Coordinación).");
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
        if (!elDept || !elReason) return;
        
        const dept = elDept.value;
        const reason = elReason.value.trim();
        
        if(!dept || !reason) return alert("Debes seleccionar un departamento y justificar el reporte.");
        if(dept === state.user.role) return alert("No puedes reportarte a ti mismo.");
        if(ui.hasForbiddenWords && ui.hasForbiddenWords(reason, 'Reporte Inactividad HR')) return;
        
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
        if (!elTitle || !elDesc) return;
        
        const title = elTitle.value.trim();
        const desc = elDesc.value.trim();
        if(!title || !desc) return alert("Rellene todos los campos.");
        if(ui.hasForbiddenWords && (ui.hasForbiddenWords(title, 'Título Moción Gobernanza') || ui.hasForbiddenWords(desc, 'Descripción Moción Gobernanza'))) {
            return;
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        co.votingMotions.unshift({ id: 'MOT-'+Date.now(), title, desc, authorRole: state.user.role, date: new Date().toLocaleString(), status: 'ABIERTA', votes: {} });
        ui.pushNotification(state.user.coId, 'CEO', `Nueva moción propuesta por ${state.user.role}.`, 'info');
        state.save(); 
        this.closeModal(); 
        this.render();
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
            state.save(); 
            this.render();
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
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        co.marketingCampaigns = co.marketingCampaigns || [];
        co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
        
        const activeDocTab = this.brandDocTab || 'LYE';
        const wrapper = document.createElement('div');
        
        let brandApprovalAlert = '';
        if (co.brandApproval.status === 'PENDIENTE') {
            brandApprovalAlert = `
            <div class="bg-mars-yellow/15 border border-mars-yellow p-3 mb-4 text-[10px]">
                <span class="text-mars-yellow font-black uppercase block mb-1">⏳ Identidad de Marca en Revisión por Coordinación</span>
                <p class="text-slate-300 leading-tight">Tu propuesta de Eslogan o Logotipo ha sido enviada y está pendiente de validación docente antes de hacerse pública en el HUD.</p>
                ${co.brandApproval.pendingSlogan ? `<p class="text-white mt-1.5"><strong>Eslogan propuesto:</strong> "${co.brandApproval.pendingSlogan}"</p>` : ''}
            </div>`;
        } else if (co.brandApproval.status === 'RECHAZADO') {
            brandApprovalAlert = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-[10px]">
                <span class="text-mars-magenta font-black uppercase block mb-1">❌ Propuesta de Marca Rechazada por Coordinación</span>
                <p class="text-slate-300 leading-tight">Motivo: "${co.brandApproval.feedback || 'Incumplimiento de criterios corporativos.'}"</p>
            </div>`;
        } else {
            brandApprovalAlert = `
            <div class="bg-mars-green/10 border border-mars-green/40 p-2 mb-4 text-[9px] flex justify-between items-center">
                <span class="text-mars-green font-bold uppercase">✓ Marca Oficial Verificada por Coordinación</span>
                <span class="text-slate-400">Cambios nuevos requerirán re-aprobación</span>
            </div>`;
        }

        let bestFlightHtml = '<p class="text-slate-500 italic text-xs">Aún no hay ensayos de vuelo registrados por el Dpto. Técnico.</p>';
        if (co.flightTests.length > 0) {
            const bestFlight = [...co.flightTests].sort((a, b) => b.efficiency - a.efficiency)[0];
            const h_mm = bestFlight.heightMm !== undefined ? bestFlight.heightMm : (bestFlight.heightM * 1000);
            
            bestFlightHtml = `
                <div class="bg-black p-3 border border-mars-border">
                    <p class="text-[9px] text-mars-yellow uppercase font-bold mb-1">Mejor Ensayo Registrado</p>
                    <div class="flex justify-between items-center">
                        <div>
                            <p class="text-white font-bold text-xs">${bestFlight.bottle}</p>
                            <p class="text-[9px] text-slate-400">Coste: ${Number(bestFlight.costEurV).toFixed(2)} €v | Altura: ${Number(h_mm).toFixed(0)} mm</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[8px] text-slate-500 uppercase">Eficiencia (E)</p>
                            <p class="text-mars-green font-mono font-bold text-lg">${Number(bestFlight.efficiency).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];

        const packagesGridHtml = mktPackages.map(pkg => `
            <div class="bg-black/80 border border-mars-border p-3 flex flex-col justify-between hover:border-mars-yellow transition-all">
                <div>
                    <div class="flex justify-between items-center text-[8px] font-bold uppercase mb-1">
                        <span class="text-mars-cyan">${pkg.type}</span>
                        <span class="bg-mars-yellow/20 text-mars-yellow px-1.5 py-0.5">${pkg.actions} ACCIONES</span>
                    </div>
                    <h4 class="font-orbitron text-white text-xs font-bold uppercase mb-1">${pkg.name}</h4>
                    <p class="text-[9px] text-slate-400 leading-tight mb-3">${pkg.desc}</p>
                </div>
                <div class="flex justify-between items-center border-t border-slate-800 pt-2">
                    <span class="text-mars-green font-mono font-black text-sm">${pkg.price} €v</span>
                    <button onclick="ui.modalRequestMktPackage('${pkg.id}')" class="bg-mars-yellow text-black px-3 py-1 text-[9px] font-black uppercase hover:bg-white transition-colors">Contratar</button>
                </div>
            </div>
        `).join('');

        let campaignsHtml = co.marketingCampaigns.map(c => {
            const isLegacy = !c.packageId;
            if (isLegacy) {
                return `
                <div class="bg-black/50 border border-mars-border/50 p-3 mb-2">
                    <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                        <span class="text-mars-cyan font-bold uppercase text-[10px]">${c.title}</span>
                        <span class="text-[8px] text-slate-500">${c.date}</span>
                    </div>
                    <p class="text-[9px] text-slate-300 italic mb-2">"${c.desc}"</p>
                    ${c.url ? `<a href="${c.url}" target="_blank" class="text-[9px] text-mars-yellow hover:underline">🔗 Ver Creatividad</a>` : ''}
                </div>`;
            }

            const status = c.status || 'PENDIENTE_FINANZAS';
            const usedActions = (c.executedActions || []).length;
            const totalActions = c.totalActions || 3;
            const remaining = Math.max(0, totalActions - usedActions);

            const stBadge = status === 'ACTIVO' 
                ? 'bg-mars-green/20 text-mars-green border-mars-green' 
                : (status === 'DENEGADO' ? 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta' : 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse');

            const executedListHtml = (c.executedActions || []).map((act, idx) => `
                <div class="bg-slate-900/90 border border-slate-800 p-2 text-[9px] flex justify-between items-center gap-2">
                    <div class="overflow-hidden">
                        <span class="text-mars-cyan font-bold uppercase block truncate">#${idx + 1}: ${act.title}</span>
                        <span class="text-slate-400 italic block truncate">"${act.desc}"</span>
                    </div>
                    ${act.url ? `<a href="${act.url}" target="_blank" class="bg-mars-cyan/20 text-mars-cyan border border-mars-cyan px-2 py-1 text-[8px] font-bold uppercase shrink-0 hover:bg-mars-cyan hover:text-black">Ver Link</a>` : ''}
                </div>
            `).join('');

            return `
            <div class="bg-black/70 border ${status === 'ACTIVO' ? 'border-mars-green/50' : 'border-mars-border'} p-4 mb-3">
                <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                    <div>
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 border ${stBadge}">${status}</span>
                        <h4 class="text-white font-orbitron font-bold uppercase text-xs mt-1">${c.packageName} — ${c.title}</h4>
                    </div>
                    <div class="text-right">
                        <span class="text-mars-green font-mono font-bold text-xs">${Number(c.price).toFixed(2)} €v</span>
                        <span class="block text-[8px] text-slate-500">${c.date}</span>
                    </div>
                </div>
                <p class="text-[9px] text-slate-400 italic mb-3">Justificación ROI: "${c.desc}"</p>
                
                ${status === 'ACTIVO' ? `
                <div class="bg-slate-950 border border-slate-800 p-3 mt-2">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-[9px] font-bold uppercase text-mars-yellow">Acciones Consumidas: ${usedActions} / ${totalActions}</span>${remaining > 0 ? `<button onclick="ui.modalConsumeMktAction('${c.id}')" class="bg-mars-cyan text-black px-3 py-1 text-[8px] font-black uppercase hover:bg-white transition-colors">+ Publicar Acción (${remaining} disp.)</button>` : `<span class="text-[8px] text-mars-green font-bold uppercase">✓ Cupo Completado</span>`}
                    </div>
                    <div class="space-y-1.5 mt-2">
                        ${executedListHtml || '<p class="text-[9px] text-slate-600 italic">Aún no has registrado acciones dentro de este paquete.</p>'}
                    </div>
                </div>` : ''}
            </div>`;
        }).join('') || '<p class="text-slate-500 italic text-xs">No hay paquetes ni campañas contratadas todavía.</p>';

        let docTabContent = '';
        if (activeDocTab === 'LYE') {
            docTabContent = `
                <div class="mb-3 flex justify-between items-center">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan text-[8px] font-black px-2 py-0.5 uppercase">Peso en Proyecto: 40% Global (Rúbrica Desglosada)</span>
                </div>
                <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Entregables oficiales de Liderazgo y Emprendimiento (Solo Enlaces Drive/Canva).</p>
                <div class="space-y-4">
                    ${this.renderDriveLinkBox('1A. Identidad de Marca, Misión y Visión — DICIEMBRE (10%)', 'Nombre, Logo, Tagline, sector elegido y justificación (1ª Entrega). Resp: Marketing.', 'brandIdentity_dec', docs.brandIdentity_dec)}
                    ${this.renderDriveLinkBox('1B. Identidad de Marca, Misión y Visión — ABRIL (10%)', 'Revisión evolutiva de marca, misión y visión tras pruebas (2ª Entrega). Resp: Marketing.', 'brandIdentity_apr', docs.brandIdentity_apr)}
                    ${this.renderDriveLinkBox('2. Business Model — Documento Escrito (25%)', 'Documento formal con portada, índice, integrantes del equipo, roles y funciones. Resp: Marketing/CEO.', 'businessModelDoc', docs.businessModelDoc)}
                    ${this.renderDriveLinkBox('3. Business Model Canvas (15%)', 'Lienzo estratégico del modelo de negocio de la startup aeroespacial. Resp: Marketing.', 'businessModelCanvas', docs.businessModelCanvas)}
                    ${this.renderDriveLinkBox('4A. Diario-Bitácora de Decisiones, Conflictos e IA — DICIEMBRE (10%)', 'Registro de gobernanza, mitigación de riesgos y uso ético de IA (1ª Entrega). Resp: Operaciones IA.', 'decisionDiary_dec', docs.decisionDiary_dec)}
                    ${this.renderDriveLinkBox('4B. Diario-Bitácora de Decisiones, Conflictos e IA — ABRIL (10%)', 'Cierre de bitácora de decisiones operativas, conflictos e IA (2ª Entrega). Resp: Operaciones IA.', 'decisionDiary_apr', docs.decisionDiary_apr)}
                </div>
            `;
        } else if (activeDocTab === 'LEN') {
            docTabContent = `
                <div class="mb-3">
                    <span class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta text-[8px] font-black px-2 py-0.5 uppercase">Peso en Proyecto: 15% Global (50% Oral / 50% Escrito)</span>
                </div>
                <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Entregable oficial para Lengua Castellana (Solo Enlace Drive/Canva).</p>
                <div class="space-y-4">
                    ${this.renderDriveLinkBox('1. Dossier para Inversores (Texto Argumentativo)', 'Documento persuasivo y formal para captación de inversión. Resp: Marketing / CEO.', 'investorDossier', docs.investorDossier)}
                </div>
            `;
        } else {
            docTabContent = `
                <div class="mb-3">
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow text-[8px] font-black px-2 py-0.5 uppercase">Peso en Proyecto: 5% Global (70% Oral / 30% Redacciones)</span>
                </div>
                <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Entregables oficiales para el departamento de Inglés (Solo Enlaces Drive/Canva).</p>
                <div class="space-y-4">
                    ${this.renderDriveLinkBox('1. Expresión Oral: Presentación Prototipo (70% ING)', 'Enlace a soporte visual / slides de la presentación oral en inglés.', 'oralPresentation', docs.oralPresentation)}
                    ${this.renderDriveLinkBox('2. Redacciones Escritas en Inglés (30% ING)', 'Enlace a documentos escritos y ensayos técnicos/comerciales en lengua inglesa.', 'writtenEssays', docs.writtenEssays)}
                </div>
            `;
        }

        const displaySloganInput = co.brandApproval.status === 'PENDIENTE' && co.brandApproval.pendingSlogan 
            ? co.brandApproval.pendingSlogan 
            : (co.slogan || '');

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-6 space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta w-full">
                    <h2 class="font-orbitron text-mars-magenta text-base sm:text-lg mb-2 uppercase tracking-tighter">Identidad Corporativa & Manifiesto</h2>
                    ${brandApprovalAlert}
                    <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Eslogan Corporativo (Requiere Aprobación Docente)</label>
                    <input type="text" id="brand-slogan" value="${displaySloganInput}" placeholder="Eslogan corto corporativo (Tagline)..." class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-mars-yellow font-bold uppercase mb-3 focus:border-mars-magenta outline-none">
                    <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Misión, Visión y Propuesta de Valor</label>
                    <textarea id="val-prop-text" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white h-24 outline-none focus:border-mars-cyan mb-3 leading-relaxed" placeholder="Redacte la misión, visión y propuesta de valor corporativa...">${co.valueProposition || ''}</textarea>
                    <div class="flex flex-col sm:flex-row gap-2 w-full">
                        <button onclick="document.getElementById('brand-logo-upload').click()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-mars-magenta hover:text-white transition-all flex-1">[ Proponer Escudo / Logo ]</button>
                        <button onclick="ui.saveBrandIdentityText()" class="bg-mars-cyan text-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all flex-1">Enviar para Aprobación</button>
                    </div>
                    <input type="file" id="brand-logo-upload" class="hidden" accept="image/png, image/jpeg" onchange="ui.handleLogoUpload(event)">
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow w-full">
                    <div class="flex justify-between items-center mb-2">
                        <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Contratación de Paquetes Publicitarios</h2>
                        <span class="text-[8px] bg-mars-yellow/10 text-mars-yellow border border-mars-yellow px-2 py-0.5 font-bold uppercase">Requiere Aprobación Finanzas</span>
                    </div>
                    <p class="text-[9px] text-slate-400 mb-4 uppercase leading-relaxed">Selecciona un paquete para solicitar presupuesto a Finanzas. Una vez aprobado, podrás registrar tus acciones promocionales con enlaces Drive/Canva.</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        ${packagesGridHtml}
                    </div>

                    <h3 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest mb-3 border-b border-mars-border pb-1">Mis Paquetes y Acciones Ejecutadas</h3>
                    <div class="max-h-80 overflow-y-auto pr-2">
                        ${campaignsHtml}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green w-full">
                    <h2 class="font-orbitron text-mars-green text-sm sm:text-base mb-3 uppercase tracking-tighter">Inteligencia de Mercado y KPIs Técnicos</h2>
                    <div class="space-y-3">
                        <div class="bg-black p-3 border border-mars-border flex justify-between items-center">
                            <span class="text-[9px] text-mars-cyan uppercase font-bold">Inversión Total I+D Ejecutada</span>
                            <span class="text-mars-cyan font-mono font-bold text-base">${totalDevCost.toFixed(2)} €v</span>
                        </div>
                        ${bestFlightHtml}
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Entregables Oficiales LyE, Lengua e Inglés -->
            <div class="lg:col-span-6 space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan h-fit w-full overflow-hidden">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2">
                        <h2 class="font-orbitron text-mars-cyan text-base uppercase tracking-tighter">Entregables Oficiales (Drive)</h2>
                        <div class="flex gap-1 bg-black p-1 border border-mars-border">
                            <button onclick="ui.setBrandDocTab('LYE')" class="px-2.5 py-1 text-[9px] font-bold uppercase transition-colors ${activeDocTab === 'LYE' ? 'bg-mars-cyan text-black' : 'text-slate-400 hover:text-white'}">LyE (40%)</button>
                            <button onclick="ui.setBrandDocTab('LEN')" class="px-2.5 py-1 text-[9px] font-bold uppercase transition-colors ${activeDocTab === 'LEN' ? 'bg-mars-magenta text-white' : 'text-slate-400 hover:text-white'}">Lengua (15%)</button>
                            <button onclick="ui.setBrandDocTab('ING')" class="px-2.5 py-1 text-[9px] font-bold uppercase transition-colors ${activeDocTab === 'ING' ? 'bg-mars-yellow text-black' : 'text-slate-400 hover:text-white'}">Inglés (5%)</button>
                        </div>
                    </div>
                    <div class="max-h-[750px] overflow-y-auto pr-2">
                        ${docTabContent}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    modalRequestMktPackage(pkgId) {
        if (!state.user) return;
        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];
        const pkg = mktPackages.find(p => p.id === pkgId);
        if (!pkg) return alert("Paquete no encontrado.");

        const html = `
            <div class="bg-slate-900 border border-mars-yellow p-3 mb-4">
                <div class="flex justify-between items-center">
                    <span class="font-orbitron text-mars-yellow font-bold text-xs uppercase">${pkg.name} (${pkg.type})</span>
                    <span class="text-mars-green font-mono font-black text-sm">${pkg.price} €v</span>
                </div>
                <p class="text-[9px] text-slate-400 mt-1">Incluye cupo para <strong>${pkg.actions} acciones publicitarias</strong>.</p>
            </div>
            <div class="space-y-3">
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Nombre de la Campaña General</label>
                    <input type="text" id="mkt-req-title" placeholder="Ej: Campaña Lanzamiento Fase I..." class="w-full bg-black border border-mars-border p-2.5 text-xs text-white outline-none focus:border-mars-cyan">
                </div>
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Justificación de Retorno de Inversión (Para Finanzas)</label>
                    <textarea id="mkt-req-desc" placeholder="Explica a Finanzas por qué merece la pena invertir ${pkg.price} €v en este paquete..." class="w-full bg-black border border-mars-border p-2.5 text-xs text-white h-24 outline-none focus:border-mars-cyan"></textarea>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.confirmRequestMktPackage('${pkg.id}')" class="bg-mars-yellow text-black px-5 py-2 text-[10px] font-black uppercase hover:bg-white transition-all">Enviar Solicitud a Finanzas</button>`;
        this.showModal("Contratar Paquete Publicitario", html, actions);
    },

    confirmRequestMktPackage(pkgId) {
        if (!state.user) return;
        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];
        const pkg = mktPackages.find(p => p.id === pkgId);
        if (!pkg) return;

        const elTitle = document.getElementById('mkt-req-title');
        const elDesc = document.getElementById('mkt-req-desc');
        if (!elTitle || !elDesc) return;

        const title = elTitle.value.trim();
        const desc = elDesc.value.trim();
        if (!title || !desc) return alert("Debes indicar un título de campaña y la justificación presupuestaria para Finanzas.");
        if (ui.hasForbiddenWords && (ui.hasForbiddenWords(title, 'Título Paquete Marketing') || ui.hasForbiddenWords(desc, 'Justificación Paquete Marketing'))) {
            return;
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.marketingCampaigns = co.marketingCampaigns || [];

        const newCamp = {
            id: 'MKT-' + Date.now(),
            packageId: pkg.id,
            packageName: pkg.name,
            price: pkg.price,
            totalActions: pkg.actions,
            executedActions: [],
            title: title,
            desc: desc,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString()
        };

        co.marketingCampaigns.unshift(newCamp);
        ui.pushNotification(state.user.coId, 'FINANZAS', `Marketing solicita aprobar el paquete "${pkg.name}" por ${pkg.price} €v.`, 'warning');
        state.save();
        this.closeModal();
        alert(`✅ Solicitud del ${pkg.name} enviada a Finanzas para su aprobación.`);
        this.render();
    },

    modalConsumeMktAction(campId) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'ACTIVO') return alert("El paquete no está activo.");

        const used = (camp.executedActions || []).length;
        const total = camp.totalActions || 3;
        if (used >= total) return alert("Ya has agotado todas las acciones de este paquete.");

        const html = `
            <p class="text-[10px] text-slate-300 mb-3">Registrando acción <strong>#${used + 1} de ${total}</strong> del paquete <span class="text-mars-yellow font-bold">${camp.packageName}</span>.</p>
            <div class="space-y-3">
                <input type="text" id="mkt-act-title" placeholder="Título de la acción (Ej: Reel Instagram / Póster Pasillo)..." class="w-full bg-slate-900 border border-mars-border p-2.5 text-xs text-white outline-none focus:border-mars-cyan">
                <textarea id="mkt-act-desc" placeholder="Descripción del impacto y contenido de la creatividad..." class="w-full bg-slate-900 border border-mars-border p-2.5 text-xs text-white h-20 outline-none focus:border-mars-cyan"></textarea>
                <input type="url" id="mkt-act-url" placeholder="Enlace obligatorio a la evidencia en Canva o Drive (https://...)" class="w-full bg-slate-900 border border-mars-border p-2.5 text-xs text-white outline-none focus:border-mars-cyan">
            </div>
        `;
        const actions = `<button onclick="ui.confirmConsumeMktAction('${camp.id}')" class="bg-mars-cyan text-black px-5 py-2 text-[10px] font-black uppercase hover:bg-white transition-all">Publicar Acción</button>`;
        this.showModal("Ejecutar Acción Publicitaria", html, actions);
    },

    confirmConsumeMktAction(campId) {
        if (!state.user) return;
        const elTitle = document.getElementById('mkt-act-title');
        const elDesc = document.getElementById('mkt-act-desc');
        const elUrl = document.getElementById('mkt-act-url');
        if (!elTitle || !elDesc || !elUrl) return;

        const title = elTitle.value.trim();
        const desc = elDesc.value.trim();
        const url = elUrl.value.trim();

        if (!title || !desc || !url) return alert("El título, la descripción y el enlace (URL) de la acción son obligatorios.");
        if (!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
            return alert("El enlace de la creatividad debe comenzar por http:// o https://");
        }
        if (ui.hasForbiddenWords && (ui.hasForbiddenWords(title, 'Acción Publicitaria Marketing') || ui.hasForbiddenWords(desc, 'Descripción Acción Marketing'))) {
            return;
        }

        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp) return;

        camp.executedActions = camp.executedActions || [];
        camp.executedActions.push({
            id: 'ACT-' + Date.now(),
            title: title,
            desc: desc,
            url: url,
            date: new Date().toLocaleDateString()
        });

        state.save();
        this.closeModal();
        this.render();
    },

    saveBrandIdentityText() {
        if (!state.user) return;
        const elSlogan = document.getElementById('brand-slogan');
        const elText = document.getElementById('val-prop-text');
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const newSlogan = elSlogan ? elSlogan.value.trim() : '';
        const newValProp = elText ? elText.value.trim() : '';

        if (ui.hasForbiddenWords && (ui.hasForbiddenWords(newSlogan, 'Eslogan Corporativo') || ui.hasForbiddenWords(newValProp, 'Misión y Visión Corporativa'))) {
            return;
        }

        co.valueProposition = newValProp;
        co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };

        if (newSlogan !== co.slogan) {
            co.brandApproval.pendingSlogan = newSlogan;
            co.brandApproval.status = 'PENDIENTE';
            co.brandApproval.feedback = '';
            alert("⏳ Tu nuevo Eslogan se ha enviado a Coordinación para su validación previa. La Misión/Visión ha quedado guardada.");
        } else {
            alert("✅ Misión y Propuesta de Valor actualizadas.");
        }
        
        state.save();
        this.render();
    },

    handleLogoUpload(e) {
        if (!state.user) return;
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo formatos de imagen PNG o JPG para el escudo corporativo.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logotipo.");
        
        const reader = new FileReader();
        reader.onload = (ev) => {
            const co = state.data.companies[state.user.coId];
            if (!co) return auth.logout();
            
            co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
            co.brandApproval.pendingLogo = ev.target.result;
            if (!co.brandApproval.pendingSlogan) co.brandApproval.pendingSlogan = co.slogan || "";
            co.brandApproval.status = 'PENDIENTE';
            co.brandApproval.feedback = '';

            state.save();
            this.render();
            alert("⏳ Logotipo enviado a Coordinación Docente. Aparecerá en vuestro HUD en cuanto sea aprobado.");
        };
        reader.readAsDataURL(file);
    }
});