// js/ui-empresa-gov-brand.js
// --- MÓDULO GOBERNANZA Y MARCA: MOCIONES, HR, REGISTRO MERCANTIL Y PAQUETES MARKETING (v1.1.28) ---

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
        const currentPin = state.getRolePin(co, 'AUXILIAR') || co.roles['AUXILIAR'] || 'No activo';
        const currentDept = co.auxRoleDept || 'No asignado';

        let statusBanner = '';
        if (req.status === 'PENDIENTE') {
            statusBanner = `
            <div class="bg-mars-yellow/15 border border-mars-yellow p-3 mb-4 text-xs">
                <span class="text-mars-yellow font-black uppercase block mb-1">⏳ Solicitud Pendiente en Coordinación</span>
                <p class="text-slate-200">Has solicitado vincular el Rol Auxiliar a <strong>${this.escapeHTML(req.dept)}</strong> con el PIN propuesto <strong>${this.escapeHTML(req.pin)}</strong>. Coordinación debe autorizarlo para que sea operativo.</p>
            </div>`;
        } else if (req.status === 'RECHAZADO') {
            statusBanner = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-xs">
                <span class="text-mars-magenta font-black uppercase block mb-1">❌ Solicitud Denegada por Coordinación</span>
                <p class="text-slate-200">La última solicitud de Rol Auxiliar fue rechazada. Puedes enviar una nueva propuesta corregida.</p>
            </div>`;
        } else if (co.roles['AUXILIAR']) {
            statusBanner = `
            <div class="bg-mars-green/15 border border-mars-green p-3 mb-4 text-xs">
                <span class="text-mars-green font-black uppercase block mb-1">✓ Rol Auxiliar Activo y Autorizado</span>
                <p class="text-slate-200">PIN Operativo: <strong class="text-white font-mono">${this.escapeHTML(currentPin)}</strong> | Vinculado a: <strong class="text-mars-cyan">${this.escapeHTML(currentDept)}</strong></p>
            </div>`;
        }
        
        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">El Rol Observador (Auxiliar) requiere autorización previa de Coordinación Docente. Propón el departamento al que prestará apoyo y el PIN de 4 dígitos deseado.</p>
            ${statusBanner}
            <div class="bg-slate-900 p-4 border border-mars-cyan mb-2">
                <label for="aux-pin-input" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">PIN Propuesto (4 dígitos)</label>
                <input type="text" id="aux-pin-input" maxlength="4" value="${this.escapeHTML(req.pin || '')}" placeholder="Ej: 5555" class="w-full min-h-[44px] bg-black border border-mars-border p-3 text-center text-white font-bold tracking-widest outline-none focus:border-mars-cyan mb-3">
                <label for="aux-dept-select" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Departamento Vinculado</label>
                <select id="aux-dept-select" class="w-full min-h-[44px] bg-black border border-mars-border p-3 text-base sm:text-xs text-white uppercase outline-none focus:border-mars-cyan">
                    <option value="">-- Selecciona Departamento Vinculado --</option>
                    <option value="CEO" ${req.dept==='CEO'?'selected':''}>Dirección General (CEO)</option>
                    <option value="TECNICO" ${req.dept==='TECNICO'?'selected':''}>Dpto. Técnico (I+D)</option>
                    <option value="FINANZAS" ${req.dept==='FINANZAS'?'selected':''}>Dpto. Financiero</option>
                    <option value="MARKETING" ${req.dept==='MARKETING'?'selected':''}>Dpto. Marketing</option>
                    <option value="OPERACIONES_IA" ${req.dept==='OPERACIONES_IA'?'selected':''}>Dpto. Operaciones e IA</option>
                </select>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitAuxRole()" class="min-h-[44px] bg-mars-cyan text-black px-6 py-2.5 text-xs font-black uppercase hover:bg-white transition-colors">Solicitar Alta a Coordinación</button>`;
        this.showModal("Solicitud de Rol Observador (Auxiliar)", html, actions);
    },

    submitAuxRole() {
        if (!state.user) return;
        const elPin = document.getElementById('aux-pin-input');
        const elDept = document.getElementById('aux-dept-select');
        if (!elPin || !elDept) return;
        
        const pin = this.cleanInput(elPin.value);
        const dept = elDept.value;
        
        if (!/^\d{4}$/.test(pin)) return this.notify("El PIN propuesto debe tener exactamente 4 dígitos numéricos.", "warning");
        if (!dept) return this.notify("Debes seleccionar un departamento vinculado.", "warning");
        
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
        this.notify(`⏳ Solicitud enviada a Coordinación Docente. Una vez aprobada, el PIN quedará habilitado.`, "info");
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
        <div class="flex flex-wrap gap-2">
            <button type="button" onclick="ui.modalReportInactivity()" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 text-xs uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all">Reportar Inactividad</button>
            <button type="button" onclick="ui.modalMotion()" class="min-h-[44px] bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-2 text-xs uppercase font-bold hover:bg-mars-yellow hover:text-black transition-all">Proponer Moción</button>
        </div>`;

        let nameChangeHtml = '';
        if (isCEO) {
            const req = co.nameChangeRequest;
            if (req && req.status === 'PENDIENTE') {
                nameChangeHtml = `
                <div class="bg-mars-yellow/10 border border-mars-yellow p-4 flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div class="min-w-0">
                        <span class="text-xs text-mars-yellow font-bold uppercase tracking-wider block mb-1">Registro Mercantil // Solicitud en Revisión</span>
                        <p class="text-xs sm:text-sm text-white break-words">Motivo: <span class="font-bold text-mars-yellow">${this.escapeHTML(req.reason || req.proposedName || '')}</span></p>
                        ${req.driveUrl ? `<a href="${encodeURI(req.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 mt-2 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Solicitud Oficial en Google Drive ↗</span></a>` : ''}
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs bg-mars-yellow text-black font-black px-2.5 py-1 uppercase animate-pulse">En Revisión</span>
                        <button type="button" onclick="ui.cancelNameChangeRequest()" class="min-h-[44px] bg-slate-800 border border-mars-magenta/60 text-mars-magenta hover:bg-mars-magenta hover:text-white px-3 py-1.5 text-xs font-bold uppercase transition-all">Cancelar Solicitud</button>
                    </div>
                </div>`;
            } else if (req && req.status === 'RECHAZADO') {
                nameChangeHtml = `
                <div class="bg-mars-magenta/10 border border-mars-magenta p-4 flex flex-wrap justify-between items-center gap-3 mb-6">
                    <div class="min-w-0 flex-1">
                        <span class="text-xs text-mars-magenta font-bold uppercase tracking-wider block mb-1">🏛️ Registro Mercantil // Solicitud Denegada</span>
                        <p class="text-xs sm:text-sm text-white break-words">La solicitud de cambio de denominación social ha sido denegada por Coordinación.</p>
                    </div>
                    <div class="flex gap-2 shrink-0">
                        <button type="button" onclick="ui.promptRequestNameChange()" class="min-h-[44px] bg-mars-yellow text-black font-black px-3 py-2 text-xs uppercase hover:bg-white transition-all">Nueva Solicitud</button>
                        <button type="button" onclick="ui.dismissNameChangeRejection()" class="min-h-[44px] bg-slate-800 border border-slate-700 text-slate-300 hover:text-white px-3 py-2 text-xs uppercase font-bold transition-all">Entendido</button>
                    </div>
                </div>`;
            } else {
                nameChangeHtml = `
                <button type="button" onclick="ui.promptRequestNameChange()" class="w-full min-h-[48px] bg-slate-900 border border-slate-700 hover:border-mars-yellow text-slate-200 hover:text-white p-3.5 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-between mb-6 group">
                    <span>🏛️ Solicitar Cambio de Denominación Social</span>
                    <span class="text-mars-yellow transition-transform group-hover:translate-x-1">➔</span>
                </button>`;
            }
        }

        let ceoSloganApprovalHtml = '';
        if (isCEO && co.brandApproval && co.brandApproval.status === 'PENDIENTE_CEO') {
            ceoSloganApprovalHtml = `
            <div class="bg-amber-500/10 border-2 border-amber-500 p-4 mb-6 rounded">
                <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
                    <span class="text-xs bg-amber-500 text-black font-black px-2.5 py-1 uppercase">Paso 2: Aval de Dirección General Requerido</span>
                    <span class="text-xs text-slate-300 font-mono">${this.escapeHTML(co.brandApproval.expId || '')}</span>
                </div>
                <h4 class="text-white font-orbitron font-bold text-sm uppercase mb-1">Propuesta de Slogan Corporativo recibida de Marketing</h4>
                <p class="text-xs text-slate-300 mb-2">Enfoque: <strong class="text-mars-cyan">${this.escapeHTML(co.brandApproval.concept || 'General')}</strong></p>
                <div class="mb-3">
                    ${co.brandApproval.driveUrl ? `<a href="${encodeURI(co.brandApproval.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono font-bold"><span>📄 Abrir Expediente Slogan en Google Drive ↗</span></a>` : ''}
                </div>
                <div class="flex flex-wrap gap-2">
                    <button type="button" onclick="ui.endorseBrandProposal('${state.user.coId}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all">[ ✅ 2. Avalar y Elevar a Coordinación Docente ]</button>
                    <button type="button" onclick="ui.returnBrandProposalToMkt('${state.user.coId}')" class="min-h-[44px] bg-slate-800 border border-mars-magenta text-mars-magenta hover:bg-mars-magenta hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all">[ ↩️ Devolver a Marketing ]</button>
                </div>
            </div>`;
        }

        let crisisResolutionsHtml = '';
        if (co.executiveResolutions && co.executiveResolutions.length > 0) {
            crisisResolutionsHtml = `
            <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-yellow mb-6">
                <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base uppercase tracking-tighter mb-3">Resoluciones Ejecutivas y Sanciones de Crisis</h3>
                <div class="space-y-3">
                    ${co.executiveResolutions.map(r => `
                        <div class="bg-black/80 border border-slate-800 p-3 flex flex-wrap justify-between items-center gap-2">
                            <div>
                                <span class="text-xs font-bold text-white uppercase block">${this.escapeHTML(r.crisisTitle || 'Resolución de Crisis')}</span>
                                <span class="text-xs text-slate-300 block">Acción: ${this.escapeHTML(r.action || r.decision || '')} | ${this.escapeHTML(r.date || '')}</span>
                            </div>
                            ${r.driveUrl ? `<a href="${encodeURI(r.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Comunicado Oficial en Google Drive ↗</span></a>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>`;
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 space-y-6">
                ${nameChangeHtml}
                ${ceoSloganApprovalHtml}
                ${crisisResolutionsHtml}
                <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-mars-border pb-3">
                        <h2 class="font-orbitron text-mars-cyan text-base sm:text-lg uppercase tracking-tighter">Asamblea y Votaciones</h2>
                        ${headerActions}
                    </div>
                    <div class="space-y-4">
                        ${co.votingMotions.map(m => {
                            const votes = Object.values(m.votes || {});
                            const y = votes.filter(v => v === 'A_FAVOR' || v === 'A FAVOR').length;
                            const n = votes.filter(v => v === 'EN_CONTRA' || v === 'EN CONTRA').length;
                            const abst = votes.filter(v => v === 'NO_ESTOY_SEGURO').length;
                            const total = y + n + abst;
                            const myVote = m.votes ? m.votes[state.user.role] : null;
                            const totalRoles = Object.keys(co.roles || {}).length;
                            
                            let actions = '';
                            if(m.status === 'ABIERTA') {
                                if(!myVote) {
                                    actions = `<div class="flex flex-wrap gap-2 mt-3">
                                        <button type="button" onclick="ui.voteMotion('${this.escapeHTML(m.id)}', 'A_FAVOR')" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2 text-xs font-bold uppercase hover:bg-white transition-colors">A Favor</button>
                                        <button type="button" onclick="ui.voteMotion('${this.escapeHTML(m.id)}', 'EN_CONTRA')" class="min-h-[44px] bg-red-700 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-red-700 transition-colors">En Contra</button>
                                        <button type="button" onclick="ui.voteMotion('${this.escapeHTML(m.id)}', 'NO_ESTOY_SEGURO')" class="min-h-[44px] bg-mars-yellow text-black px-4 py-2 text-xs font-bold uppercase hover:bg-white transition-colors">No estoy seguro</button>
                                    </div>`;
                                } else {
                                    actions = `<p class="text-xs text-mars-cyan mt-3 uppercase font-bold">Tu voto: ${this.escapeHTML(String(myVote).replace(/_/g, ' '))}</p>`;
                                }

                                if(state.user.role === 'CEO' && total >= totalRoles) {
                                    actions += `<button type="button" onclick="ui.resolveMotion('${this.escapeHTML(m.id)}')" class="mt-3 min-h-[44px] bg-mars-yellow text-black px-4 py-2.5 text-xs font-bold uppercase w-full hover:bg-white transition-colors">Cerrar Votación</button>`;
                                } else if (state.user.role === 'CEO') {
                                    actions += `<button type="button" onclick="ui.resolveMotion('${this.escapeHTML(m.id)}')" class="mt-3 min-h-[44px] bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-2.5 text-xs font-bold uppercase w-full hover:bg-mars-yellow hover:text-black transition-colors">Forzar Cierre de Votación</button>`;
                                }
                            } else {
                                actions = `<p class="text-xs font-bold mt-3 uppercase ${m.result === 'APROBADA' ? 'text-mars-green' : 'text-mars-magenta'}">RESULTADO: ${this.escapeHTML(m.result)}</p>`;
                            }

                            return `
                            <div class="terminal-border bg-slate-900 p-4 border-l-4 ${m.status === 'ABIERTA' ? 'border-l-mars-yellow' : (m.result === 'APROBADA' ? 'border-l-mars-green' : 'border-l-mars-magenta')} w-full">
                                ${ui.renderWorkflowTracker(['Propuesta', 'Votación', 'Cierre (Acta)'], m.status === 'ABIERTA' ? (total > 0 ? 1 : 0) : 2)}
                                <div class="flex flex-wrap justify-between gap-2 mb-2 mt-3"><h3 class="text-white font-bold uppercase text-xs sm:text-sm break-words">${this.escapeHTML(m.title)}</h3><span class="text-xs text-slate-300">${this.escapeHTML(m.date)}</span></div>
                                <div class="mb-3">
                                    ${(m.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(m.driveUrl))
                                        ? `<a href="${encodeURI(m.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Propuesta en Docs ↗</span></a>`
                                        : `<span class="text-xs text-amber-500/80 font-mono italic">[Propuesta legacy archivada por protocolo RGPD]</span>`
                                    }
                                </div>
                                <div class="w-full bg-black h-2.5 flex rounded-sm overflow-hidden mb-1.5">
                                    <div class="bg-mars-cyan h-full transition-all" style="width: ${totalRoles>0?(y/totalRoles)*100:0}%"></div>
                                    <div class="bg-mars-yellow h-full transition-all" style="width: ${totalRoles>0?(abst/totalRoles)*100:0}%"></div>
                                    <div class="bg-red-600 h-full transition-all" style="width: ${totalRoles>0?(n/totalRoles)*100:0}%"></div>
                                </div>
                                <div class="flex justify-between text-xs font-bold text-slate-300 uppercase">
                                    <span class="text-mars-cyan">${y} A Favor</span>
                                    <span class="text-mars-yellow">${abst} No seguro</span>
                                    <span>Quórum: ${total}/${totalRoles}</span>
                                    <span class="text-red-500">${n} En Contra</span>
                                </div>
                                ${actions}
                            </div>`;
                        }).join('') || '<p class="text-slate-300 text-xs italic">No hay mociones asamblearias registradas.</p>'}
                    </div>
                </div>
            </div>
            <div class="lg:col-span-4 space-y-6">
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-magenta">
                    <h3 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tighter mb-3 border-b border-mars-border pb-2">Buzón de Conflictos (HR)</h3>
                    <p class="text-xs text-slate-300 uppercase mb-4 leading-relaxed">Reporta a un departamento inactivo que esté bloqueando el avance del proyecto.</p>
                    <button type="button" onclick="ui.modalReportInactivity()" class="w-full min-h-[48px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-3 text-xs font-black uppercase tracking-wider hover:bg-mars-magenta hover:text-white transition-all shadow-[0_0_10px_rgba(255,0,85,0.2)]">Abrir Expediente HR</button>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    promptRequestNameChange() {
        if (!state.user || state.user.role !== 'CEO') return;
        const reasons = typeof NAME_CHANGE_REASONS_DEF !== 'undefined' ? NAME_CHANGE_REASONS_DEF : [
            { id: "PIVOTAJE_MERCADO", label: "Pivotaje Estratégico de Mercado / Reorientación de Misión" },
            { id: "REORGANIZACION_INTERNA", label: "Reorganización de Junta Directiva y Estructura Interna" },
            { id: "RESOLUCION_ASAMBLEA", label: "Resolución de la Asamblea General de Socios" },
            { id: "DIFERENCIACION_MARCA", label: "Diferenciación Competitiva frente a otras Empresas del Sector" },
            { id: "REQUERIMIENTO_DOCENTE", label: "Adecuación por Requerimiento de Coordinación Docente" }
        ];
        const reasonsOptions = reasons.map(r => `<option value="${this.escapeHTML(r.label)}">${this.escapeHTML(r.label)}</option>`).join('');
        const templateBtn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_1_DENOMINACION', '📄 Modelo Oficial Solicitud Denominación Social (Hacer copia)') : '';

        const html = `
            <p class="text-xs text-slate-300 mb-4 leading-relaxed uppercase">La modificación de la denominación social debe ser evaluada por Coordinación Docente. Cumplimenta la solicitud formal en Google Docs y adjunta el enlace oficial.</p>
            <div class="mb-4">
                ${templateBtn}
            </div>
            <label for="req-name-reason" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Motivo Tipificado del Renombramiento</label>
            <select id="req-name-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-mars-yellow mb-3">
                ${reasonsOptions}
            </select>
            <label for="req-name-drive-url" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Enlace a Solicitud Formal Oficial (Google Drive / Docs)</label>
            <input type="url" id="req-name-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/50 p-3 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow mb-2" required>
            <p class="text-[10px] text-slate-400">Coordinación revisará el documento formal y fijará la nueva denominación oficial en el sistema.</p>
        `;
        const actions = `<button type="button" onclick="ui.submitNameChangeRequest()" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all">Transmitir a Coordinación</button>`;
        this.showModal("Solicitud Oficial de Renombramiento", html, actions);
    },

    submitNameChangeRequest() {
        const elReason = document.getElementById('req-name-reason');
        const elUrl = document.getElementById('req-name-drive-url');
        if (!elReason || !elUrl) return;

        const reason = this.cleanInput(elReason.value);
        const driveUrl = this.cleanInput(elUrl.value);

        if (!reason) return this.notify("Debes seleccionar el motivo del cambio.", "warning");
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive de la solicitud formal.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const co = state.data.companies[state.user.coId];
        co.nameChangeRequest = {
            status: 'PENDIENTE',
            reason: reason,
            driveUrl: driveUrl,
            proposedName: 'Propuesta en Documento Drive',
            date: new Date().toLocaleString(),
            updatedAt: Date.now()
        };
        co.updatedAt = Date.now();

        state.save();
        this.closeModal();
        this.render();
        this.notify("✅ Solicitud enviada exitosamente al Registro Mercantil (Coordinación).", "success");
    },

    cancelNameChangeRequest() {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.nameChangeRequest || co.nameChangeRequest.status !== 'PENDIENTE') return;

        ui.confirmHUD(
            "Cancelar Solicitud de Nombre",
            "¿Deseas retirar la solicitud de cambio de denominación social enviada al Registro Mercantil?",
            () => {
                co.nameChangeRequest.status = 'CANCELADO';
                co.nameChangeRequest.resolvedAt = Date.now();
                co.nameChangeRequest.updatedAt = Date.now();
                co.updatedAt = Date.now();
                state.save();
                this.render();
                this.notify("Solicitud de cambio de nombre cancelada.", "info");
            },
            "Retirar Solicitud",
            true
        );
    },

    dismissNameChangeRejection() {
        if (!state.user || state.user.role !== 'CEO') return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.nameChangeRequest) return;
        co.nameChangeRequest.status = 'ARCHIVADO';
        co.nameChangeRequest.updatedAt = Date.now();
        co.updatedAt = Date.now();
        state.save();
        this.render();
    },

    modalReportInactivity() {
        if (!state.user) return;
        const reasons = typeof INACTIVITY_REASONS_DEF !== 'undefined' ? INACTIVITY_REASONS_DEF : [
            { id: "SIN_AVANCE_HITOS", label: "Falta reiterada de avance en hitos departamentales obligatorios" },
            { id: "BLOQUEO_INTERDEPARTAMENTAL", label: "Bloqueo operativo a otros departamentos por falta de entregas" },
            { id: "AUSENCIA_ASAMBLEAS", label: "Inasistencia o falta de participación en Asambleas y toma de decisiones" },
            { id: "INCUMPLIMIENTO_TAREAS", label: "Incumplimiento de tareas asignadas en el plan de trabajo" },
            { id: "ROTURA_COMUNICACION", label: "Falta absoluta de comunicación y coordinación en el equipo" }
        ];
        const reasonsOpts = reasons.map(r => `<option value="${this.escapeHTML(r.label)}">${this.escapeHTML(r.label)}</option>`).join('');
        const templateBtn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_2_INACTIVIDAD_HR', '📄 Modelo Oficial Expediente HR (Hacer copia)') : '';

        const html = `
            <p class="text-xs text-slate-300 mb-3 leading-relaxed">Usa este canal oficial para notificar al Claustro Docente si un departamento está bloqueando el progreso de la startup por inactividad.</p>
            <div class="mb-4">
                ${templateBtn}
            </div>
            <label for="inactivity-dept" class="text-xs text-mars-magenta uppercase font-bold block mb-1.5">Departamento a Reportar</label>
            <select id="inactivity-dept" class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-cyan">
                <option value="">-- Selecciona el Departamento a Reportar --</option>
                <option value="CEO">Dirección General (CEO)</option>
                <option value="TECNICO">Dpto. Técnico (I+D)</option>
                <option value="FINANZAS">Dpto. Financiero</option>
                <option value="MARKETING">Dpto. Marketing</option>
                <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
            </select>
            <label for="inactivity-reason" class="text-xs text-mars-magenta uppercase font-bold block mb-1.5">Causa Tipificada de Inactividad</label>
            <select id="inactivity-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-cyan">
                ${reasonsOpts}
            </select>
            <label for="inactivity-drive-url" class="text-xs text-mars-magenta uppercase font-bold block mb-1.5">Enlace a Expediente HR Oficial (Google Drive / Docs)</label>
            <input type="url" id="inactivity-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan font-mono" required>
            <p class="text-[10px] text-slate-400 mb-2">Adjunta la copia del expediente completado con las evidencias de inactividad.</p>
        `;
        const actions = `<button type="button" onclick="ui.submitInactivityReport()" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Enviar Reporte al Claustro</button>`;
        this.showModal("Reporte de Inactividad (HR)", html, actions);
    },

    submitInactivityReport() {
        if (!state.user) return;
        const elDept = document.getElementById('inactivity-dept');
        const elReason = document.getElementById('inactivity-reason');
        const elUrl = document.getElementById('inactivity-drive-url');
        if (!elDept || !elReason || !elUrl) return;
        
        const dept = elDept.value;
        const reason = this.cleanInput(elReason.value);
        const driveUrl = this.cleanInput(elUrl.value);
        
        if(!dept || !reason) return this.notify("Debes seleccionar un departamento y el motivo tipificado.", "warning");
        if(dept === state.user.role) return this.notify("No puedes reportarte a ti mismo.", "warning");
        if(!driveUrl) return this.notify("Debes adjuntar el enlace Drive al expediente oficial de HR.", "warning");
        if(typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.inactivityReports = co.inactivityReports || [];
        
        co.inactivityReports.unshift({
            id: 'REP-' + Date.now(),
            reportedDept: dept,
            reportingRole: state.user.role,
            reason: reason,
            driveUrl: driveUrl,
            date: new Date().toLocaleString(),
            status: 'PENDIENTE'
        });
        
        if (state.user.role !== 'CEO') {
            ui.pushNotification(state.user.coId, 'CEO', `⚠️ ALERTA HR: ${state.user.role} ha reportado inactividad en el departamento ${dept}.`, 'error');
        }
        
        state.save();
        this.closeModal();
        this.notify("Reporte enviado exitosamente al Claustro Docente y a Dirección General.", "success");
        this.render();
    },

    modalProposeGovernanceMotion() {
        return this.modalMotion();
    },

    modalMotion() {
        if (!state.user) return;
        const motionTypes = typeof GOVERNANCE_MOTION_TYPES !== 'undefined' ? GOVERNANCE_MOTION_TYPES : [
            { id: "CESE_RELEVO", label: "[CESE/RELEVO] Cese o redistribución de rol por inactividad" },
            { id: "REORGANIZACION_PINS", label: "[REORGANIZACIÓN] Reestructuración de cargos y PINs" },
            { id: "PACTO_SOCIOS", label: "[CONVIVENCIA] Vulneración del Pacto de Socios" },
            { id: "MEDIACION_DOCENTE", label: "[MEDIACIÓN] Solicitud formal de mediación docente" },
            { id: "AUDITORIA_FINANZAS", label: "[AUDITORÍA] Petición de intervención a Tesorería" },
            { id: "REPARTO_TRABAJO", label: "[REPARTO] Reasignación urgente de cargas de trabajo" },
            { id: "JUNTA_GENERAL", label: "[EXTRAORDINARIA] Convocatoria de Junta General de Socios" }
        ];
        const optionsHtml = motionTypes.map(m => `<option value="${this.escapeHTML(m.id)}">${this.escapeHTML(m.label)}</option>`).join('');
        const templateBtn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_6_MOCION_ASAMBLEA', '📄 Modelo Oficial Acta de Moción (Hacer copia)') : '';

        const html = `
            <div class="mb-4">
                ${templateBtn}
            </div>
            <label for="motion-type" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Tipo de Moción Tipificada</label>
            <select id="motion-type" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-yellow">
                ${optionsHtml}
            </select>
            <label for="motion-drive-url" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Enlace al Documento de la Propuesta (Google Docs)</label>
            <input type="url" id="motion-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-yellow font-mono" required>
            <p class="text-[10px] text-slate-400 mb-2">La memoria y argumentario de la moción se desarrolla en el Google Doc oficial con permisos de lectura.</p>
        `;
        const actions = `<button type="button" onclick="ui.submitMotion()" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-bold uppercase hover:bg-white transition-colors">Registrar Moción</button>`;
        this.showModal("Proponer Moción de Gobernanza", html, actions);
    },

    submitMotion() {
        if (!state.user) return;
        const elType = document.getElementById('motion-type');
        const elUrl = document.getElementById('motion-drive-url');
        if (!elType || !elUrl) return;
        
        const motionTypeId = elType.value;
        const motionList = typeof GOVERNANCE_MOTION_TYPES !== 'undefined' ? GOVERNANCE_MOTION_TYPES : [];
        const motionObj = motionList.find(m => m.id === motionTypeId);
        const title = motionObj ? motionObj.label : motionTypeId;
        const driveUrl = this.cleanInput(elUrl.value);
        if(!title || !driveUrl) return this.notify("Rellene todos los campos.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        co.votingMotions.unshift({ 
            id: 'MOT-'+Date.now(), 
            title, 
            motionTypeId,
            driveUrl, 
            authorRole: state.user.role, 
            date: new Date().toLocaleString(), 
            status: 'ABIERTA', 
            votes: {} 
        });
        ui.pushNotification(state.user.coId, 'CEO', `Nueva moción propuesta por ${state.user.role}.`, 'info');
        state.save(); 
        this.closeModal(); 
        this.notify("Moción registrada en la Asamblea.", "success");
        this.render();
    },

    voteMotion(id, vote) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        const allowedVotes = ['A_FAVOR', 'EN_CONTRA', 'NO_ESTOY_SEGURO'];
        if (!allowedVotes.includes(vote)) return;

        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            m.votes = m.votes || {};
            m.votes[state.user.role] = vote;
            state.save();
            this.render();
            try {
                state.executeAction('VOTE_MOTION', { id, vote });
            } catch(e) {}
        }
    },

    resolveMotion(id) {
        if (!state.user || state.user.role !== 'CEO') return this.notify("Solo el CEO puede cerrar votaciones.", "warning");
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.votingMotions = co.votingMotions || [];
        
        const m = co.votingMotions.find(x => x.id === id);
        if(m) {
            const votes = Object.values(m.votes || {});
            const y = votes.filter(v => v === 'A_FAVOR' || v === 'A FAVOR').length;
            const n = votes.filter(v => v === 'EN_CONTRA' || v === 'EN CONTRA').length;
            if(y > n) { m.result = 'APROBADA'; m.status = 'CERRADA'; }
            else if(n > y) { m.result = 'RECHAZADA'; m.status = 'CERRADA'; }
            else {
                return this.promptTieBreaker(id);
            }
            
            ui.pushNotification(state.user.coId, m.authorRole, `Tu moción ha sido ${m.result}.`, m.result === 'APROBADA' ? 'success' : 'error');
            co.updatedAt = Date.now();
            state.save(state.user.coId); 
            this.render();
        }
    },

    promptTieBreaker(id) {
        if (!state.user || state.user.role !== 'CEO') return;
        const html = `
            <p class="text-xs text-slate-200 mb-4">La votación ha resultado en empate. Como CEO, debes ejercer tu voto de calidad para desempatar.</p>
            <div class="flex gap-4">
                <button type="button" onclick="ui.executeTieBreaker('${this.escapeHTML(id)}', 'APROBADA')" class="flex-1 min-h-[44px] bg-mars-green text-black font-bold py-2.5 text-xs uppercase hover:bg-white transition-colors">Aprobar</button>
                <button type="button" onclick="ui.executeTieBreaker('${this.escapeHTML(id)}', 'RECHAZADA')" class="flex-1 min-h-[44px] bg-mars-magenta text-white font-bold py-2.5 text-xs uppercase hover:bg-white hover:text-mars-magenta transition-colors">Rechazar</button>
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
            co.updatedAt = Date.now();
            state.save(state.user.coId);
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
        const isPendingBrand = (co.brandStatus === 'PENDING_APPROVAL' || co.brandApproval?.status === 'PENDIENTE');
        if (isPendingBrand) {
            brandApprovalAlert = `
            <div class="bg-amber-500/15 border border-amber-500/60 p-3 mb-4 text-xs">
                <span class="bg-amber-500/20 text-amber-400 border border-amber-500/50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider block mb-2">[Eslogan/Misión en revisión por Coordinación]</span>
                <p class="text-slate-200 leading-relaxed">Tu propuesta de Eslogan y Misión ha sido enviada a Coordinación Docente y se encuentra en proceso de validación previa antes de su publicación en el HUD.</p>
                ${(co.pendingSlogan || co.brandApproval?.pendingSlogan) ? `<p class="text-white mt-1.5 break-words"><strong>Eslogan propuesto:</strong> "${this.escapeHTML(co.pendingSlogan || co.brandApproval?.pendingSlogan)}"</p>` : ''}
                ${(co.pendingMission || co.valueProposition) ? `<p class="text-white mt-1.5 break-words"><strong>Misión propuesta:</strong> "${this.escapeHTML(co.pendingMission || co.valueProposition)}"</p>` : ''}
            </div>`;
        } else if (co.brandApproval.status === 'RECHAZADO') {
            brandApprovalAlert = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-xs">
                <span class="text-mars-magenta font-black uppercase block mb-1">❌ Propuesta de Marca Rechazada por Coordinación</span>
                <p class="text-slate-200 leading-relaxed break-words">Motivo: "${this.escapeHTML(co.brandApproval.feedback || 'Incumplimiento de criterios corporativos.')}"</p>
            </div>`;
        } else {
            brandApprovalAlert = `
            <div class="bg-mars-green/10 border border-mars-green/50 p-2.5 mb-4 text-xs flex flex-wrap justify-between items-center gap-2">
                <span class="text-mars-green font-bold uppercase">✓ Marca Oficial Verificada por Coordinación</span>
                <span class="text-slate-300">Cambios nuevos requerirán re-aprobación</span>
            </div>`;
        }

        let bestFlightHtml = '<p class="text-slate-300 italic text-xs">Aún no hay ensayos de vuelo registrados por el Dpto. Técnico.</p>';
        if (co.flightTests.length > 0) {
            const bestFlight = [...co.flightTests].sort((a, b) => b.efficiency - a.efficiency)[0];
            const h_mm = bestFlight.heightMm !== undefined ? bestFlight.heightMm : (bestFlight.heightM * 1000);
            
            bestFlightHtml = `
                <div class="bg-black p-3 border border-mars-border">
                    <p class="text-xs text-mars-yellow uppercase font-bold mb-1">Mejor Ensayo Registrado</p>
                    <div class="flex justify-between items-center gap-2">
                        <div>
                            <p class="text-white font-bold text-xs sm:text-sm break-words">${this.escapeHTML(bestFlight.bottle)}</p>
                            <p class="text-xs text-slate-300">Coste: ${Number(bestFlight.costEurV).toFixed(2)} €v | Altura: ${Number(h_mm).toFixed(0)} mm</p>
                        </div>
                        <div class="text-right shrink-0">
                            <p class="text-xs text-slate-300 uppercase">Eficiencia (E)</p>
                            <p class="text-mars-green font-mono font-bold text-lg">${Number(bestFlight.efficiency).toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];

        const packagesGridHtml = mktPackages.map(pkg => `
            <div class="bg-black/80 border border-mars-border p-3.5 flex flex-col justify-between hover:border-mars-yellow transition-all">
                <div>
                    <div class="flex justify-between items-center text-xs font-bold uppercase mb-1.5 gap-2">
                        <span class="text-mars-cyan">${this.escapeHTML(pkg.type)}</span>
                        <span class="bg-mars-yellow/20 text-mars-yellow px-2 py-0.5">${Number(pkg.actions)} ACCIONES</span>
                    </div>
                    <h4 class="font-orbitron text-white text-xs sm:text-sm font-bold uppercase mb-1">${this.escapeHTML(pkg.name)}</h4>
                    <p class="text-xs text-slate-300 leading-relaxed mb-3">${this.escapeHTML(pkg.desc)}</p>
                </div>
                <div class="flex justify-between items-center border-t border-slate-800 pt-2.5 gap-2">
                    <span class="text-mars-green font-mono font-black text-sm">${Number(pkg.price)} €v</span>
                    <button type="button" onclick="ui.modalRequestMktPackage('${this.escapeHTML(pkg.id)}')" class="min-h-[44px] bg-mars-yellow text-black px-3.5 py-2 text-xs font-black uppercase hover:bg-white transition-colors">Contratar</button>
                </div>
            </div>
        `).join('');

        let campaignsHtml = co.marketingCampaigns.map(c => {
            const isLegacy = !c.packageId;
            if (isLegacy) {
                return `
                <div class="bg-black/50 border border-mars-border/50 p-3 mb-2">
                    <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2 gap-2">
                        <span class="text-mars-cyan font-bold uppercase text-xs break-words">${this.escapeHTML(c.title)}</span>
                        <span class="text-xs text-slate-300">${this.escapeHTML(c.date)}</span>
                    </div>
                    <div class="mb-2">
                        ${(c.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(c.driveUrl))
                            ? `<a href="${encodeURI(c.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Dossier ROI en Docs ↗</span></a>`
                            : `<span class="text-xs text-amber-500/80 font-mono italic">[Dossier legacy archivado por protocolo RGPD]</span>`
                        }
                    </div>
                    ${c.url ? `<a href="${this.escapeHTML(c.url)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center text-xs text-mars-yellow hover:underline">🔗 Ver Creatividad</a>` : ''}
                </div>`;
            }

            const status = c.status || 'PENDIENTE_FINANZAS';
            const usedActions = (c.executedActions || []).length;
            const totalActions = c.totalActions || 3;
            const remaining = Math.max(0, totalActions - usedActions);

            const stBadge = status === 'ACTIVO' 
                ? 'bg-mars-green/20 text-mars-green border-mars-green' 
                : (status === 'DENEGADO' ? 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta' : 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow animate-pulse');

            const isCEO = Boolean(state.user && (state.user.role === 'CEO' || state.user.admin || state.user.isCoordinator));
            const isMarketing = Boolean(state.user && (state.user.role === 'MARKETING' || state.user.admin || state.user.isCoordinator));

            const executedListHtml = (c.executedActions || []).map((act, idx) => {
                const actId = act.id || ('ACT-' + idx);
                const actStatus = act.status || 'VALIDADO_CEO';
                const actFeedback = act.feedback || '';
                const actUrl = act.url || act.driveUrl || '';
                const safeUrl = actUrl ? encodeURI(actUrl).replace(/"/g, '&quot;') : '';

                let statusBadge = '';
                if (actStatus === 'PENDIENTE_CEO') {
                    statusBadge = `<span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">[⏳ PENDIENTE DE APROBACIÓN CEO]</span>`;
                } else if (actStatus === 'VALIDADO_CEO') {
                    statusBadge = `<span class="bg-mars-green/20 text-mars-green border border-mars-green/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">[✓ VALIDADA Y ELEVADA A LIDERAZGO Y COORDINACIÓN]</span>`;
                } else if (actStatus === 'RECHAZADO_CEO') {
                    statusBadge = `<span class="bg-mars-magenta/20 text-mars-magenta border border-mars-magenta/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">[❌ DEVUELTA POR CEO]</span>`;
                }

                let actionControls = '';
                if (actStatus === 'PENDIENTE_CEO' && isCEO) {
                    actionControls = `
                        <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
                            <button type="button" onclick="ui.decideMktAction('${this.escapeHTML(c.id)}', '${this.escapeHTML(actId)}', true)" class="min-h-[44px] bg-mars-green text-black px-3 py-1.5 text-xs font-black uppercase hover:bg-white transition-all shadow-sm">[✓ APROBAR ACCIÓN]</button>
                            <button type="button" onclick="ui.modalRejectMktAction('${this.escapeHTML(c.id)}', '${this.escapeHTML(actId)}')" class="min-h-[44px] bg-mars-magenta text-white px-3 py-1.5 text-xs font-black uppercase hover:bg-white hover:text-black transition-all shadow-sm">[↩ DEVOLVER]</button>
                        </div>
                    `;
                } else if (actStatus === 'RECHAZADO_CEO' && isMarketing) {
                    actionControls = `
                        <div class="shrink-0">
                            <button type="button" onclick="ui.modalResubmitMktAction('${this.escapeHTML(c.id)}', '${this.escapeHTML(actId)}')" class="min-h-[44px] bg-mars-yellow text-black px-3 py-1.5 text-xs font-black uppercase hover:bg-white transition-all shadow-sm">[✏️ Subsanar Enlace y Reenviar al CEO]</button>
                        </div>
                    `;
                }

                return `
                <div class="bg-slate-900/90 border border-slate-800 p-3 text-xs flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                    <div class="overflow-hidden min-w-0 space-y-1">
                        <div class="flex items-center gap-2 flex-wrap">
                            <span class="text-mars-cyan font-bold uppercase truncate">#${idx + 1}: ${this.escapeHTML(act.title)}</span>
                            ${statusBadge}
                        </div>
                        <span class="text-slate-300 italic block truncate">"${this.escapeHTML(act.desc)}"</span>
                        ${act.date ? `<span class="text-[10px] text-slate-400 block font-mono">Fecha: ${this.escapeHTML(act.date)}</span>` : ''}
                        ${actFeedback ? `<div class="text-[11px] text-mars-magenta font-mono">Motivo devolución CEO: "${this.escapeHTML(actFeedback)}"</div>` : ''}
                    </div>
                    <div class="flex items-center gap-2 flex-wrap shrink-0">
                        ${safeUrl ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 text-xs font-bold uppercase hover:bg-cyan-900/50">Abrir en Drive ↗</a>` : ''}
                        ${actionControls}
                    </div>
                </div>`;
            }).join('');

            return `
            <div class="bg-black/70 border ${status === 'ACTIVO' ? 'border-mars-green/50' : 'border-mars-border'} p-4 mb-3">
                <div class="flex justify-between items-start border-b border-slate-800 pb-2 mb-2 flex-wrap gap-2">
                    <div>
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${stBadge}">${this.escapeHTML(status)}</span>
                        <h4 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5 break-words">${this.escapeHTML(c.packageName)} — ${this.escapeHTML(c.title)}</h4>
                    </div>
                    <div class="text-right">
                        <span class="text-mars-green font-mono font-bold text-xs sm:text-sm">${Number(c.price).toFixed(2)} €v</span>
                        <span class="block text-xs text-slate-300">${this.escapeHTML(c.date)}</span>
                    </div>
                </div>
                <div class="mb-3">
                    ${(c.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(c.driveUrl))
                        ? `<a href="${encodeURI(c.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono"><span>Abrir Dossier ROI en Docs ↗</span></a>`
                        : `<span class="text-xs text-amber-500/80 font-mono italic">[Dossier legacy archivado por protocolo RGPD]</span>`
                    }
                </div>
                
                ${status === 'ACTIVO' ? `
                <div class="bg-slate-950 border border-slate-800 p-3 mt-2">
                    <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <span class="text-xs font-bold uppercase text-mars-yellow">Acciones Consumidas: ${usedActions} / ${totalActions}</span>${remaining > 0 ? `<button type="button" onclick="ui.modalConsumeMktAction('${this.escapeHTML(c.id)}')" class="min-h-[44px] bg-mars-cyan text-black px-3.5 py-2 text-xs font-black uppercase hover:bg-white transition-colors">+ Publicar Acción (${remaining} disp.)</button>` : `<span class="text-xs text-mars-green font-bold uppercase">✓ Cupo Completado</span>`}
                    </div>
                    <div class="space-y-2 mt-2">
                        ${executedListHtml || '<p class="text-xs text-slate-400 italic">Aún no has registrado acciones dentro de este paquete.</p>'}
                    </div>
                </div>` : ''}
            </div>`;
        }).join('') || '<p class="text-slate-300 italic text-xs">No hay paquetes ni campañas contratadas todavía.</p>';

        let docTabContent = '';
        if (activeDocTab === 'LYE') {
            docTabContent = `
                <div class="mb-3 flex justify-between items-center">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 40% Global (Rúbrica Desglosada)</span>
                </div>
                <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Entregables oficiales de Liderazgo y Emprendimiento (Solo Enlaces verificados de Google Drive).</p>
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
                    <span class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 15% Global (50% Oral / 50% Escrito)</span>
                </div>
                <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Entregable oficial para Lengua Castellana (Solo Enlace verificado de Google Drive).</p>
                <div class="space-y-4">
                    ${this.renderDriveLinkBox('1. Dossier para Inversores (Texto Argumentativo)', 'Documento persuasivo y formal para captación de inversión. Resp: Marketing / CEO.', 'investorDossier', docs.investorDossier)}
                </div>
            `;
        } else {
            docTabContent = `
                <div class="mb-3">
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 5% Global (Evaluación Directa en Aula)</span>
                </div>
                <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Evaluación del departamento de Inglés (100% evaluación docente directa en clase).</p>
                <div class="bg-black/80 border border-mars-yellow/40 p-4 text-xs text-slate-300 space-y-2">
                    <p class="text-white font-bold uppercase text-xs">📢 Criterio Curricular Oficial de Lengua Extranjera (Inglés):</p>
                    <p>Las competencias de expresión oral (Pitch / Presentación de Prototipo) y expresión escrita en lengua inglesa son evaluadas directamente por el profesorado de Lengua Extranjera durante las sesiones lectivas presenciales y defensas orales en el aula.</p>
                    <p class="text-mars-yellow font-mono text-[11px] font-bold">✓ No se requiere la subida de enlaces de Google Drive en este panel.</p>
                </div>
            `;
        }

        const coCode = co.code || state.user.coId;
        const expId = (co.brandApproval && co.brandApproval.expId) || ('PROP-SLOGAN-' + coCode + '-001');
        const estadoActual = (co.brandApproval && co.brandApproval.status) || 'APROBADO';
        const brandConcepts = typeof BRAND_CONCEPTS_DEF !== 'undefined' ? BRAND_CONCEPTS_DEF : [
            { id: "EXPLORACION", label: "Exploración y Conquista de Nuevas Fronteras Espaciales" },
            { id: "SOSTENIBILIDAD", label: "Sostenibilidad y Eficiencia en Recursos Planetarios" },
            { id: "INNOVACION", label: "Innovación Radical en Propulsión e Ingeniería Aeroespacial" },
            { id: "ACCESIBILIDAD", label: "Democratización y Accesibilidad del Transporte Orbital" },
            { id: "SEGURIDAD", label: "Máxima Seguridad y Fiabilidad en Misiones Críticas" }
        ];
        const conceptOptionsHtml = brandConcepts.map(c => `
            <option value="${this.escapeHTML(c.label)}" ${(co.brandApproval?.concept === c.label) ? 'selected' : ''}>${this.escapeHTML(c.label)}</option>
        `).join('');

        const doc11Btn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_11_SLOGAN', '📄 Modelo Oficial Solicitud de Slogan (Hacer copia)') : '';

        let step2CeoControls = '';
        if (estadoActual === 'PENDIENTE_CEO') {
            if (state.user.role === 'CEO') {
                step2CeoControls = `
                <div class="bg-amber-500/15 border-2 border-amber-500 p-4 mb-4 rounded">
                    <span class="text-xs bg-amber-500 text-black font-black px-2 py-0.5 uppercase block mb-2 w-fit">Paso 2: Aval de Dirección General Requerido</span>
                    <p class="text-xs text-white mb-2">Marketing ha formulado esta propuesta conceptual. Como CEO, debes examinar el documento Drive y decidir si avalarla ante Coordinación Docente:</p>
                    <div class="mb-3">
                        ${co.brandApproval.driveUrl ? `<a href="${encodeURI(co.brandApproval.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono font-bold"><span>📄 Abrir Propuesta de Slogan en Google Drive ↗</span></a>` : ''}
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="ui.endorseBrandProposal('${state.user.coId}')" class="min-h-[44px] bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all">[ ✅ 2. Avalar y Elevar a Coordinación Docente ]</button>
                        <button type="button" onclick="ui.returnBrandProposalToMkt('${state.user.coId}')" class="min-h-[44px] bg-slate-800 border border-mars-magenta text-mars-magenta hover:bg-mars-magenta hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all">[ ↩️ Devolver a Marketing ]</button>
                    </div>
                </div>`;
            } else {
                step2CeoControls = `
                <div class="bg-amber-500/10 border border-amber-500 p-3 mb-4 text-xs">
                    <span class="text-amber-400 font-bold uppercase block mb-1">⏳ Paso 2: En Revisión por Dirección General (CEO)</span>
                    <p class="text-slate-300">La propuesta ha sido enviada al CEO. Una vez que Dirección General la avale, se elevará a Coordinación Docente para su resolución final.</p>
                </div>`;
            }
        } else if (estadoActual === 'PENDIENTE') {
            step2CeoControls = `
            <div class="bg-mars-cyan/15 border border-mars-cyan p-3 mb-4 text-xs">
                <span class="text-mars-cyan font-bold uppercase block mb-1">⏳ Paso 3: En Aduana de Identidad Corporativa (Coordinación Docente)</span>
                <p class="text-slate-300">El expediente ha sido avalado por Dirección General y está en manos de Coordinación Docente para su aprobación e inscripción oficial en el HUD.</p>
            </div>`;
        } else if (estadoActual === 'DEVUELTO_CEO') {
            step2CeoControls = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-xs">
                <span class="text-mars-magenta font-black uppercase block mb-1">↩️ Propuesta Devuelta por el CEO</span>
                <p class="text-slate-300">Feedback: "${this.escapeHTML(co.brandApproval.feedback || 'Revisar propuesta en Google Docs.')}". Marketing puede realizar correcciones y volver a presentarla.</p>
            </div>`;
        } else if (estadoActual === 'RECHAZADO') {
            step2CeoControls = `
            <div class="bg-mars-magenta/15 border border-mars-magenta p-3 mb-4 text-xs">
                <span class="text-mars-magenta font-black uppercase block mb-1">❌ Propuesta Rechazada por Coordinación</span>
                <p class="text-slate-300">Motivo: "${this.escapeHTML(co.brandApproval.feedback || 'Incumplimiento de criterios oficiales.')}". Marketing debe generar una nueva propuesta.</p>
            </div>`;
        }

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-6 space-y-6 w-full overflow-hidden">
                <!-- Bloque Oficial Registro Mercantil // Aprobación Slogan Corporativo -->
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-magenta w-full">
                    <div class="border-b border-mars-border pb-3 mb-4">
                        <div class="flex flex-wrap justify-between items-center gap-2 mb-1">
                            <span class="text-[10px] font-mono text-mars-cyan tracking-widest uppercase">REGISTRO MERCANTIL // SOLICITUD DE APROBACIÓN DE SLOGAN CORPORATIVO</span>
                            <span class="text-[10px] font-bold px-2 py-0.5 uppercase ${estadoActual==='APROBADO'?'bg-mars-green/20 text-mars-green border border-mars-green':'bg-amber-500/20 text-amber-400 border border-amber-500'}">${this.escapeHTML(estadoActual)}</span>
                        </div>
                        <h2 class="font-orbitron text-white text-xs sm:text-sm font-bold uppercase break-words">EXPEDIENTE: ${this.escapeHTML(expId)} | EMPRESA: ${this.escapeHTML(co.name)}</h2>
                    </div>

                    <!-- Instrucciones del Flujo de Trámite Oficial -->
                    <div class="bg-black/60 border border-slate-800 p-3 mb-4 text-xs text-slate-300 space-y-2">
                        <span class="text-mars-yellow font-bold uppercase block tracking-wider text-[11px]">📋 Instrucciones del Flujo de Trámite:</span>
                        <ol class="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
                            <li><strong class="text-white">Marketing ➔ CEO:</strong> Marketing formula la propuesta conceptual del slogan en el modelo oficial de Google Docs y la presenta a la Dirección General.</li>
                            <li><strong class="text-white">CEO ➔ Coordinación:</strong> El CEO revisa, avala la propuesta y la eleva a Coordinación Docente para su resolución final.</li>
                            <li><strong class="text-white">Coordinación Docente:</strong> Emite la resolución oficial (Aprobado/Denegado) y registra el slogan oficial en el expediente de la empresa.</li>
                        </ol>
                    </div>

                    ${co.slogan ? `
                    <div class="bg-mars-green/10 border border-mars-green/50 p-3 mb-4 text-xs">
                        <span class="text-mars-green font-bold uppercase block mb-1">✓ Slogan Corporativo Oficial Activo:</span>
                        <p class="text-white font-orbitron font-bold italic text-sm break-words">"${this.escapeHTML(co.slogan)}"</p>
                    </div>` : ''}

                    ${step2CeoControls}

                    <!-- Paso 1: Formulación de Propuesta (Marketing) -->
                    <div class="bg-slate-950 p-4 border border-slate-800 space-y-3">
                        <span class="text-xs text-mars-cyan font-bold uppercase block">Paso 1: Formulación de Propuesta (Dpto. Marketing)</span>
                        <div class="mb-2">
                            ${doc11Btn}
                        </div>
                        <div>
                            <label for="brand-concept-select" class="text-xs text-slate-300 uppercase font-bold block mb-1.5">Enfoque Conceptual Aeroespacial</label>
                            <select id="brand-concept-select" class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-magenta uppercase">
                                ${conceptOptionsHtml}
                            </select>
                        </div>
                        <div>
                            <label for="company-logo-drive" class="text-xs text-slate-300 uppercase font-bold block mb-1.5">Enlace al Escudo / Logo Corporativo (Google Drive)</label>
                            <input type="url" id="company-logo-drive" value="${this.escapeHTML((co.brandApproval && co.brandApproval.pendingLogo) ? co.brandApproval.pendingLogo : (co.logo || ''))}" placeholder="https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-magenta">
                        </div>
                        <div>
                            <label for="brand-slogan-drive-url" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Enlace a la Propuesta de Slogan en Google Drive (Obligatorio)</label>
                            <input type="url" id="brand-slogan-drive-url" value="${this.escapeHTML(co.brandApproval?.driveUrl || '')}" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/60 p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow" required>
                            <p class="text-[10px] text-slate-400 mt-1">El argumentario, lema propuesto y justificación residen en el Google Doc oficial con permisos de lectura.</p>
                        </div>
                        <button type="button" onclick="ui.submitBrandProposalToCEO()" class="w-full min-h-[44px] bg-mars-cyan text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">[ 📤 1. Presentar Propuesta al CEO ]</button>
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow w-full">
                    <div class="flex flex-wrap justify-between items-center gap-2 mb-2">
                        <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Contratación de Paquetes Publicitarios</h2>
                        <span class="text-xs bg-mars-yellow/10 text-mars-yellow border border-mars-yellow px-2.5 py-0.5 font-bold uppercase">Requiere Aprobación Finanzas</span>
                    </div>
                    <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Selecciona un paquete para solicitar presupuesto a Finanzas. Una vez aprobado, podrás registrar tus acciones promocionales con enlaces verificados de Google Drive.</p>
                    
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                        ${packagesGridHtml}
                    </div>

                    <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase tracking-wider mb-3 border-b border-mars-border pb-1.5">Mis Paquetes y Acciones Ejecutadas</h3>
                    <div class="max-h-80 overflow-y-auto pr-1">
                        ${campaignsHtml}
                    </div>
                </div>

                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-green w-full">
                    <h2 class="font-orbitron text-mars-green text-sm sm:text-base mb-3 uppercase tracking-tighter">Inteligencia de Mercado y KPIs Técnicos</h2>
                    <div class="space-y-3">
                        <div class="bg-black p-3 border border-mars-border flex justify-between items-center gap-2">
                            <span class="text-xs text-mars-cyan uppercase font-bold">Inversión Total I+D Ejecutada</span>
                            <span class="text-mars-cyan font-mono font-bold text-base">${totalDevCost.toFixed(2)} €v</span>
                        </div>
                        <div class="bg-black p-3 border border-slate-800 space-y-1.5">
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-slate-300 uppercase">Coste Operativo Bruto:</span>
                                <span class="text-white font-mono font-bold">${grossCosts.toFixed(2)} €v</span>
                            </div>
                            ${(sponsorAmt > 0 && sponsorTierLabel) ? `
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-amber-400 uppercase font-bold">Reducción Patrocinio (${this.escapeHTML(sponsorTierLabel)}):</span>
                                <span class="text-amber-400 font-mono font-bold">-${sponsorAmt.toFixed(2)} €v</span>
                            </div>` : ''}
                            <div class="flex justify-between items-center text-xs border-t border-slate-800 pt-1.5">
                                <span class="text-mars-green font-bold uppercase">Coste Operativo Neto:</span>
                                <span class="text-mars-green font-mono font-bold text-sm">${netOpCosts.toFixed(2)} €v</span>
                            </div>
                        </div>
                        ${bestFlightHtml}
                    </div>
                </div>
            </div>

            <!-- Columna Derecha: Entregables Oficiales LyE, Lengua e Inglés -->
            <div class="lg:col-span-6 space-y-6 w-full overflow-hidden">
                <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan h-fit w-full overflow-hidden">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2">
                        <h2 class="font-orbitron text-mars-cyan text-base uppercase tracking-tighter">Entregables Oficiales (Drive)</h2>
                        <div role="tablist" aria-label="Materias de comunicación y emprendimiento" class="flex flex-wrap gap-1 bg-black p-1 border border-mars-border">
                            <button type="button" role="tab" aria-selected="${activeDocTab === 'LYE'}" onclick="ui.setBrandDocTab('LYE')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors ${activeDocTab === 'LYE' ? 'bg-mars-cyan text-black' : 'text-slate-300 hover:text-white'}">LyE (40%)</button>
                            <button type="button" role="tab" aria-selected="${activeDocTab === 'LEN'}" onclick="ui.setBrandDocTab('LEN')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors ${activeDocTab === 'LEN' ? 'bg-mars-magenta text-white' : 'text-slate-300 hover:text-white'}">Lengua (15%)</button>
                            <button type="button" role="tab" aria-selected="${activeDocTab === 'ING'}" onclick="ui.setBrandDocTab('ING')" class="min-h-[44px] px-3 py-2 text-xs font-bold uppercase transition-colors ${activeDocTab === 'ING' ? 'bg-mars-yellow text-black' : 'text-slate-300 hover:text-white'}">Inglés (5%)</button>
                        </div>
                    </div>
                    <div class="max-h-[750px] overflow-y-auto pr-1">
                        ${docTabContent}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    modalNewMktCamp(pkgId = null) {
        return this.modalRequestMktPackage(pkgId);
    },

    modalRequestMktPackage(pkgId = null) {
        if (!state.user) return;
        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];
        const selectedId = pkgId || mktPackages[0]?.id;
        const selectedPkg = mktPackages.find(p => p.id === selectedId) || mktPackages[0];

        const optionsHtml = mktPackages.map(p => `
            <option value="${this.escapeHTML(p.id)}" data-price="${p.price}" ${p.id === selectedId ? 'selected' : ''}>
                ${this.escapeHTML(p.name)} (${this.escapeHTML(p.type)}) - ${p.price} €v [${p.actions} acciones]
            </option>
        `).join('');

        const doc5Btn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_5_BRIEF_MKT', '📄 Modelo Oficial Brief Creativo MKT (Hacer copia)') : '';

        const html = `
            <div class="space-y-3">
                <div class="mb-2">
                    ${doc5Btn}
                </div>
                <div>
                    <label for="campaign-tier" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Paquete / Tier Publicitario Predefinido</label>
                    <select id="campaign-tier" onchange="const p = (typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : []).find(x => x.id === this.value); const sEl = document.getElementById('campaign-price-display'); if(sEl && p) sEl.textContent = p.price + ' €v';" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-yellow">
                        ${optionsHtml}
                    </select>
                </div>
                <div class="bg-slate-900/80 border border-slate-800 p-3 flex justify-between items-center rounded">
                    <div>
                        <span class="text-xs text-slate-300 uppercase font-bold block">Coste Tarifario Oficial Inmutable</span>
                        <p class="text-[10px] text-slate-400 mt-0.5">Precio congelado estipulado para la contratación del paquete.</p>
                    </div>
                    <span id="campaign-price-display" class="text-cyan-400 font-mono font-bold text-base sm:text-lg">${selectedPkg ? selectedPkg.price : 0} €v</span>
                </div>
                <div>
                    <label for="campaign-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Brief Creativo y Justificación ROI (Google Drive / Docs)</label>
                    <input type="url" id="campaign-drive-url" placeholder="https://docs.google.com/document/d/..." class="w-full min-h-[44px] bg-black border border-mars-cyan/50 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1">El brief creativo y la estimación de retorno residen en el Google Doc corporativo con permisos de lectura.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmRequestMktPackage()" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all w-full sm:w-auto">Enviar Solicitud a Finanzas</button>`;
        this.showModal("Contratar Paquete Publicitario", html, actions);
    },

    confirmRequestMktPackage(pkgId = null) {
        if (!state.user) return;
        const mktPackages = typeof MARKETING_PACKAGES !== 'undefined' ? MARKETING_PACKAGES : [];
        const elTier = document.getElementById('campaign-tier');
        const elUrl = document.getElementById('campaign-drive-url');

        const finalPkgId = (elTier ? elTier.value : pkgId) || mktPackages[0]?.id;
        const pkg = mktPackages.find(p => p.id === finalPkgId);
        if (!pkg) return this.notify("Paquete publicitario no encontrado.", "error");

        const driveUrl = elUrl ? this.cleanInput(elUrl.value) : '';
        const budget = pkg.price;

        if (!driveUrl) return this.notify("Debes indicar el enlace Drive del brief publicitario.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.marketingCampaigns = co.marketingCampaigns || [];

        const newCamp = {
            id: 'MKT-' + Date.now(),
            packageId: pkg.id,
            packageName: pkg.name,
            packageTier: pkg.type,
            price: budget,
            totalActions: pkg.actions,
            executedActions: [],
            title: `Campaña ${pkg.name} (${pkg.type})`,
            driveUrl: driveUrl,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString()
        };

        co.marketingCampaigns.unshift(newCamp);
        ui.pushNotification(state.user.coId, 'FINANZAS', `Marketing solicita aprobar el paquete "${pkg.name}" por ${budget} €v.`, 'warning');
        state.save();
        this.closeModal();
        this.notify(`✅ Solicitud del ${pkg.name} enviada a Finanzas para su aprobación.`, "success");
        this.render();

        try {
            state.executeAction('UPDATE_MARKETING', { campaign: newCamp, driveUrl: driveUrl });
        } catch(e) {}
    },

    modalAddMktAction(campId) {
        return this.modalConsumeMktAction(campId);
    },

    modalConsumeMktAction(campId) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || camp.status !== 'ACTIVO') return this.notify("El paquete no está activo.", "warning");

        const used = (camp.executedActions || []).length;
        const total = camp.totalActions || 3;
        if (used >= total) return this.notify("Ya has agotado todas las acciones de este paquete.", "warning");

        let standardizedActions = [
            "Campaña en Redes Sociales (Reel / Post Oficial)",
            "Cartelera / Póster Físico para Pasillos del Centro",
            "Folleto Informativo / Flyer Impreso de Stand",
            "Banner Digital Promocional en Web / Portal",
            "Nota de Prensa Oficial / Entrevista Boletín Escolar",
            "Pitch / Vídeo Promocional del Prototipo Aeroespacial",
            "Merchandising y Ambientación de Stand de Venta",
            "Cuña Publicitaria de Audio / Emisión por Megafonía"
        ];
        if (camp.packageId === 'MK-SAT') {
            standardizedActions = [
                "Publicación Digital en Redes Sociales (Post / Reel)",
                "Banner Promocional Digital para Web / Plataforma",
                "Campaña de Mailing y Difusión Digital",
                "Teaser / Vídeo Corto de Lanzamiento"
            ];
        } else if (camp.packageId === 'MK-TRA') {
            standardizedActions = [
                "Diseño e Impresión de Póster de Pasillos",
                "Reparto de Flyers y Folletos Físicos",
                "Nota de Prensa en Tablón Escolar",
                "Cartelería Física para Stand de Venta"
            ];
        } else if (camp.packageId === 'MK-HYB') {
            standardizedActions = [
                "[Online] Campaña en Redes Sociales",
                "[Online] Banner Promocional Digital",
                "[Físico] Póster Gran Formato para Pasillos",
                "[Físico] Flyers y Trípticos Informativos"
            ];
        } else if (camp.packageId === 'MK-SUP') {
            standardizedActions = [
                "Campaña Multiplataforma Integral",
                "Vídeo / Teaser Oficial de Apogeo",
                "Rueda de Prensa y Nota Institucional",
                "Merchandising Oficial y Stand Premium",
                "Emisión de Cuña de Audio por Megafonía",
                "Presentación en Directo y Pitch Escolar"
            ];
        }

        const actionsOpts = standardizedActions.map(act => `<option value="${this.escapeHTML(act)}">${this.escapeHTML(act)}</option>`).join('');
        const doc12Btn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_12_ACCION_MKT', '📄 Modelo Oficial de Acción Publicitaria (Hacer copia)') : '';

        const html = `
            <p class="text-xs text-slate-200 mb-3">Registrando acción <strong>#${used + 1} de ${total}</strong> del paquete <span class="text-mars-yellow font-bold">${this.escapeHTML(camp.packageName)}</span>.</p>
            <div class="mb-3">
                ${doc12Btn}
            </div>
            <div class="bg-amber-950/30 border border-amber-500/40 p-2.5 text-xs text-amber-200 mb-3 space-y-1">
                <p>ℹ️ <strong>Flujo Oficial de Gobernanza:</strong></p>
                <p>La acción publicitaria será enviada a <strong>Dirección General (CEO)</strong> para su revisión y validación previa. Una vez validada, se elevará automáticamente al docente de Liderazgo y a Coordinación.</p>
            </div>
            <div class="space-y-3">
                <div>
                    <label for="mkt-action-type" class="text-xs text-mars-cyan uppercase font-bold block mb-1">Acción Estandarizada del Paquete</label>
                    <select id="mkt-action-type" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan">
                        ${actionsOpts}
                    </select>
                </div>
                <div>
                    <label for="mkt-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1">Enlace a Evidencia Oficial (Google Drive / Docs)</label>
                    <input type="url" id="mkt-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1">Adjunta exclusivamente la URL verificada de Google Drive de la Ficha Técnica (DOC_12) con permisos abiertos de lectura.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmConsumeMktAction('${this.escapeHTML(camp.id)}')" class="min-h-[44px] bg-mars-cyan text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all">Entregar Acción al CEO</button>`;
        this.showModal("Ejecutar Acción Publicitaria", html, actions);
    },

    confirmConsumeMktAction(campId) {
        if (!state.user) return;
        const elType = document.getElementById('mkt-action-type');
        const elUrl = document.getElementById('mkt-drive-url');
        if (!elType || !elUrl) return;

        const actionType = this.cleanInput(elType.value);
        const url = this.cleanInput(elUrl.value);

        if (!actionType || !url) return this.notify("Debes seleccionar la acción estandarizada e indicar la URL de Google Drive.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(url)) {
            return this.notify("El enlace de la creatividad debe ser una URL válida de Google Drive.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co || !co.marketingCampaigns) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp) return;

        const currentUsed = (camp.executedActions || []).length;
        const totalAllowed = camp.totalActions || 3;
        if (currentUsed >= totalAllowed) return this.notify("Ya has agotado el cupo de acciones de este paquete.", "warning");

        const newAction = {
            id: 'ACT-' + Date.now(),
            title: actionType,
            desc: 'Acción oficial de marketing: ' + actionType,
            url: url,
            driveUrl: url,
            date: new Date().toLocaleDateString(),
            status: 'PENDIENTE_CEO',
            feedback: '',
            createdAt: Date.now()
        };

        camp.executedActions = camp.executedActions || [];
        camp.executedActions.push(newAction);

        ui.pushNotification(state.user.coId, 'CEO', `Marketing ha presentado la acción "${actionType}" para su revisión y validación.`, 'info');

        state.save();
        this.closeModal();
        this.notify("✅ Acción publicitaria entregada al CEO para su validación.", "success");
        this.render();

        try {
            state.executeAction('UPDATE_MARKETING', {
                campaignId: campId,
                actionItem: newAction
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando entrega de acción publicitaria:", e);
        }
    },

    decideMktAction(campId, actId, approved) {
        if (approved) {
            state.decideMktAction(campId, actId, true);
        } else {
            this.modalRejectMktAction(campId, actId);
        }
    },

    modalRejectMktAction(campId, actId) {
        if (!state.user) return;
        const reasons = (typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [
            { id: "ENLACE_INVALIDO", label: "Enlace a Google Drive inexistente o con formato incorrecto" },
            { id: "PERMISOS_BLOQUEADOS", label: "Documento sin permisos de acceso/lectura para el equipo docente" },
            { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial corporativa/curricular" },
            { id: "CHECKLIST_INCOMPLETO", label: "Faltan apartados obligatorios según la guía de la materia" },
            { id: "DISCREPANCIA_DATOS", label: "Discrepancia entre datos de la app y el documento adjunto" },
            { id: "REVISION_PENDIENTE", label: "Requiere subsanación técnica interna antes de elevar a evaluación" }
        ]);

        const opts = reasons.map(r => `<option value="${this.escapeHTML(r.label)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <div class="space-y-3 font-mono text-xs">
                <div class="bg-mars-magenta/10 border-l-4 border-mars-magenta p-3">
                    <p class="text-white font-bold mb-1">Devolución de Acción Publicitaria al Dpto. Marketing</p>
                    <p class="text-slate-300">Selecciona o especifica el motivo por el cual la acción publicitaria no puede ser validada todavía.</p>
                </div>
                <div>
                    <label for="reject-mkt-reason-select" class="text-xs text-mars-magenta uppercase font-bold block mb-1">Motivo tipificado</label>
                    <select id="reject-mkt-reason-select" class="w-full min-h-[44px] bg-slate-900 border border-mars-magenta p-2.5 text-base sm:text-xs text-white outline-none focus:border-white" onchange="document.getElementById('reject-mkt-custom').value = this.value;">
                        ${opts}
                    </select>
                </div>
                <div>
                    <label for="reject-mkt-custom" class="text-xs text-slate-300 uppercase font-bold block mb-1">Observaciones o instrucción de subsanación</label>
                    <input type="text" id="reject-mkt-custom" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-magenta" value="${this.escapeHTML(reasons[0].label)}">
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.confirmRejectMktAction('${this.escapeHTML(campId)}', '${this.escapeHTML(actId)}')" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2 text-xs font-black uppercase hover:bg-white hover:text-black transition-all">Confirmar Devolución</button>
        `;
        this.showModal("Devolver Acción al Dpto. Marketing", html, actions);
    },

    confirmRejectMktAction(campId, actId) {
        const el = document.getElementById('reject-mkt-custom');
        const reason = el ? this.cleanInput(el.value) : 'Revisión requerida por CEO';
        this.closeModal();
        state.decideMktAction(campId, actId, false, reason);
    },

    modalResubmitMktAction(campId, actId) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !Array.isArray(co.marketingCampaigns)) return;
        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || !Array.isArray(camp.executedActions)) return;
        const act = camp.executedActions.find(a => String(a.id) === String(actId));
        if (!act) return;

        const doc12Btn = ui.renderDocTemplateBtn ? ui.renderDocTemplateBtn('DOC_12_ACCION_MKT', '📄 Modelo Oficial de Acción Publicitaria (Hacer copia)') : '';
        const currentUrl = act.url || act.driveUrl || '';

        const html = `
            <div class="space-y-3 font-mono text-xs">
                <div class="bg-amber-950/30 border-l-4 border-amber-500 p-3">
                    <p class="text-white font-bold mb-1">Subsanación de Acción: ${this.escapeHTML(act.title)}</p>
                    <p class="text-slate-300">Motivo de devolución del CEO: <span class="text-mars-magenta font-bold">"${this.escapeHTML(act.feedback || 'Sin motivo especificado')}"</span></p>
                </div>
                <div class="mb-2">
                    ${doc12Btn}
                </div>
                <div>
                    <label for="resubmit-mkt-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1">Nuevo enlace corregido de Google Drive</label>
                    <input type="url" id="resubmit-mkt-drive-url" value="${this.escapeHTML(currentUrl)}" placeholder="https://docs.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-white font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1">Verifica que el documento tenga permisos de lectura abiertos.</p>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.confirmResubmitMktAction('${this.escapeHTML(campId)}', '${this.escapeHTML(actId)}')" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2 text-xs font-black uppercase hover:bg-white transition-all">Reenviar al CEO</button>
        `;
        this.showModal("Subsanar y Reenviar Acción", html, actions);
    },

    confirmResubmitMktAction(campId, actId) {
        const el = document.getElementById('resubmit-mkt-drive-url');
        if (!el) return;
        const newUrl = this.cleanInput(el.value);
        if (!newUrl) return this.notify("Debes indicar la URL de Google Drive subsanada.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(newUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive.", "error");
        }
        this.closeModal();
        state.resubmitMktAction(campId, actId, newUrl);
    },

    saveBrandIdentityText() {
        return this.submitBrandProposalToCEO();
    },

    saveCompanyLogoDrive() {
        if (!state.user) return;
        const el = document.getElementById('company-logo-drive');
        if (!el) return;
        const driveUrl = this.cleanInput(el.value);
        if (!driveUrl) return this.notify("Introduce la URL de Google Drive para el logotipo.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive.", "error");
        }
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
        co.brandApproval.pendingLogo = driveUrl;
        if (!co.brandApproval.pendingSlogan) co.brandApproval.pendingSlogan = co.slogan || "";
        co.brandApproval.status = 'PENDIENTE';
        co.brandApproval.feedback = '';

        state.save();
        this.render();
        this.notify("⏳ Enlace de logotipo registrado y enviado a Coordinación Docente.", "info");
    },

    handleLogoUpload(e) {
        if (!state.user) return;
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return this.notify("Solo formatos de imagen PNG o JPG para el escudo corporativo.", "warning");
        if (file.size > 1024 * 1024) return this.notify("Máximo 1MB para el logotipo.", "warning");
        
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
            this.notify("⏳ Logotipo enviado a Coordinación Docente. Aparecerá en vuestro HUD en cuanto sea aprobado.", "info");
        };
        reader.readAsDataURL(file);
    },

    submitBrandProposalToCEO() {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const elConcept = document.getElementById('brand-concept-select');
        const elDrive = document.getElementById('brand-slogan-drive-url');
        const elLogo = document.getElementById('company-logo-drive');

        const concept = elConcept ? this.cleanInput(elConcept.value) : '';
        const driveUrl = elDrive ? this.cleanInput(elDrive.value) : '';
        const logoUrl = elLogo ? this.cleanInput(elLogo.value) : '';

        if (!concept) return this.notify("Debes seleccionar un enfoque aeroespacial.", "warning");
        if (!driveUrl) return this.notify("Debes indicar la URL de Google Drive con la propuesta oficial del Slogan.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace al documento del eslogan debe ser una URL válida de Google Drive / Docs.", "error");
        }
        if (logoUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(logoUrl)) {
            return this.notify("El enlace al logotipo debe ser una URL válida de Google Drive.", "error");
        }

        const coCode = co.code || state.user.coId;
        const expId = 'PROP-SLOGAN-' + coCode + '-001';

        co.brandApproval = {
            expId: expId,
            status: 'PENDIENTE_CEO',
            concept: concept,
            pendingLogo: logoUrl || co.brandApproval?.pendingLogo || co.logo || null,
            pendingSlogan: '',
            driveUrl: driveUrl,
            date: Date.now(),
            feedback: ''
        };

        ui.pushNotification(state.user.coId, 'CEO', `Marketing ha presentado la propuesta de Slogan Corporativo (${expId}) para aval y elevación a Coordinación.`, 'info');

        state.save();
        this.render();
        this.notify("✅ Propuesta presentada al CEO exitosamente. En espera de su aval.", "success");
    },

    endorseBrandProposal(cid) {
        if (!state.user || state.user.role !== 'CEO') return this.notify("Solo Dirección General (CEO) puede avalar esta propuesta.", "warning");
        const co = state.data.companies[cid || state.user.coId];
        if (!co || !co.brandApproval) return;

        co.brandApproval.status = 'PENDIENTE';
        co.brandApproval.endorsedAt = Date.now();
        
        ui.pushNotification(state.user.coId, 'MARKETING', `El CEO ha avalado la propuesta de Slogan (${co.brandApproval.expId || ''}) y la ha elevado a Coordinación Docente.`, 'success');

        state.save();
        this.render();
        this.notify("✅ Propuesta de Slogan avalada y elevada a Coordinación Docente.", "success");
    },

    returnBrandProposalToMkt(cid) {
        if (!state.user || state.user.role !== 'CEO') return this.notify("Solo Dirección General (CEO) puede devolver esta propuesta.", "warning");
        const co = state.data.companies[cid || state.user.coId];
        if (!co || !co.brandApproval) return;

        const feedback = prompt("Indica a Marketing las correcciones o motivos de la devolución:") || "Revisar propuesta en Google Docs.";
        co.brandApproval.status = 'DEVUELTO_CEO';
        co.brandApproval.feedback = feedback;

        ui.pushNotification(state.user.coId, 'MARKETING', `El CEO ha devuelto la propuesta de Slogan: "${feedback}".`, 'warning');

        state.save();
        this.render();
        this.notify("Propuesta devuelta al Departamento de Marketing.", "info");
    }
});