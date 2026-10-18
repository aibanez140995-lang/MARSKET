// js/ui-empresa-gov-brand.js
// --- MÓDULO DE IDENTIDAD DE MARCA, MARKETING Y GOBERNANZA (Fase 5 - v1.0.17) ---

Object.assign(ui, {
    viewBrand(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const isMkt = state.user.role === 'MARKETING';
        const isCEO = state.user.role === 'CEO';
        co.marketingCampaigns = co.marketingCampaigns || [];

        const wrapper = document.createElement('div');

        // PANEL DE IDENTIDAD CORPORATIVA (LOGO Y ESLOGAN)
        const brandStatus = co.brandApproval ? co.brandApproval.status : 'APROBADO';
        let brandBox = '';

        if (brandStatus === 'PENDIENTE') {
            brandBox = `<div class="bg-mars-yellow/10 border border-mars-yellow p-4 text-center text-mars-yellow font-bold text-xs uppercase animate-pulse">⏳ Identidad corporativa en revisión por la Aduana Docente. Funciones de edición bloqueadas hasta resolución.</div>`;
        } else if (brandStatus === 'RECHAZADO') {
            brandBox = `
            <div class="bg-mars-magenta/10 border border-mars-magenta p-4 mb-4">
                <p class="text-mars-magenta font-bold text-xs uppercase mb-1">❌ Propuesta de Marca Rechazada</p>
                <p class="text-slate-300 text-[10px] italic mb-3">Motivo: "${co.brandApproval.feedback}"</p>
                ${isMkt ? `<button onclick="ui.resetBrandForm()" class="bg-mars-magenta text-white px-4 py-2 text-[9px] font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors">Formular Nueva Propuesta</button>` : ''}
            </div>`;
        } else {
            brandBox = `
            <div class="space-y-4">
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Eslogan Corporativo</label>
                    <input type="text" id="brand-slogan" value="${co.slogan || ''}" placeholder="Ej: Innovando el acceso al espacio..." class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white outline-none focus:border-mars-cyan" ${!isMkt ? 'disabled' : ''}>
                </div>
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Enlace del Logotipo (URL PNG/JPG) o Archivo Externo</label>
                    <input type="url" id="brand-logo" value="${co.logo || ''}" placeholder="https://..." class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white outline-none focus:border-mars-cyan" ${!isMkt ? 'disabled' : ''}>
                </div>
                ${isMkt ? `<button onclick="ui.submitBrandProposal()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all w-full sm:w-auto">Someter a Aduana Docente</button>` : ''}
            </div>`;
        }

        // PANEL DE PAQUETES PUBLICITARIOS (MKT)
        let packagesHtml = MARKETING_PACKAGES.map(p => `
            <div class="bg-slate-900 border border-slate-800 p-4 hover:border-mars-cyan/50 transition-colors flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                        <h4 class="text-white font-bold text-[10px] uppercase">${p.name}</h4>
                        <span class="text-mars-green font-mono font-bold">${p.price} €v</span>
                    </div>
                    <span class="text-[8px] bg-slate-800 text-slate-300 px-1.5 py-0.5 uppercase block w-max mb-2">${p.type} • ${p.actions} Acciones</span>
                    <p class="text-slate-400 text-[9px] leading-relaxed mb-4">${p.desc}</p>
                </div>
                ${isMkt ? `<button onclick="ui.modalRequestMktPackage('${p.id}')" class="w-full bg-mars-cyan/20 text-mars-cyan border border-mars-cyan hover:bg-mars-cyan hover:text-black font-black py-2 text-[9px] uppercase transition-colors">Solicitar a Finanzas</button>` : `<span class="block text-center text-slate-500 text-[9px] uppercase font-bold border border-slate-700 p-2">Solo Marketing</span>`}
            </div>
        `).join('');

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-4 space-y-6">
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-cyan">
                    <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter mb-4 border-b border-mars-border pb-2">Aduana de Identidad de Marca</h3>
                    ${brandBox}
                </div>
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-blue-500">
                    <h3 class="font-orbitron text-blue-400 text-sm uppercase tracking-tighter mb-4 border-b border-mars-border pb-2">Entregables: Comunicación (Cloud)</h3>
                    ${ui.renderDriveLinkBox('Marca (Dic)', 'Identidad y Misión Dic (10% LYE)', 'brandIdentity_dec', co.deliverables.brandIdentity_dec)}
                    ${ui.renderDriveLinkBox('Marca (Abr)', 'Identidad y Misión Abr (10% LYE)', 'brandIdentity_apr', co.deliverables.brandIdentity_apr)}
                    ${ui.renderDriveLinkBox('Dossier Inversores', 'Dossier Argumentativo (50% LEN)', 'investorDossier', co.deliverables.investorDossier)}
                </div>
            </div>
            <div class="lg:col-span-8">
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-yellow mb-6">
                    <h3 class="font-orbitron text-mars-yellow text-sm uppercase tracking-tighter mb-2">Central de Medios y Publicidad</h3>
                    <p class="text-[9px] text-slate-400 uppercase mb-4">Contrata acciones promocionales. Toda solicitud será auditada financieramente antes de activarse.</p>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        ${packagesHtml}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    submitBrandProposal() {
        const elSlogan = document.getElementById('brand-slogan');
        const elLogo = document.getElementById('brand-logo');
        if (!elSlogan || !elLogo) return;

        const slogan = elSlogan.value.trim();
        const logoUrl = elLogo.value.trim();

        if (slogan.length < 5) return alert("El eslogan corporativo es demasiado corto.");
        
        // FASE 4: Guardián Léxico en Eslogan
        if (ui.hasForbiddenWords(slogan, 'Identidad Corporativa (Eslogan)')) return;

        const co = state.data.companies[state.user.coId];
        co.brandApproval = { status: 'PENDIENTE', pendingLogo: logoUrl || null, pendingSlogan: slogan, feedback: "" };

        ui.pushNotification(state.user.coId, 'CEO', 'Marketing ha enviado la nueva identidad de marca a la Aduana Docente.', 'info');
        telemetry.log("MARCA", "Propuesta de identidad enviada a revisión");
        state.save();
        alert("✅ Propuesta de marca enviada. A la espera de autorización por Coordinación.");
        this.render();
    },

    resetBrandForm() {
        const co = state.data.companies[state.user.coId];
        co.brandApproval.status = 'APROBADO';
        state.save();
        this.render();
    },

    modalRequestMktPackage(packId) {
        const pkg = MARKETING_PACKAGES.find(p => p.id === packId);
        if (!pkg) return;

        const html = `
            <div class="bg-black border border-mars-cyan p-3 mb-4 flex justify-between items-center">
                <div>
                    <h4 class="text-mars-cyan font-bold text-[10px] uppercase">${pkg.name}</h4>
                    <span class="text-slate-400 text-[8px] uppercase">${pkg.type} • ${pkg.actions} Acciones</span>
                </div>
                <span class="text-mars-green font-mono font-bold text-base">${pkg.price} €v</span>
            </div>
            <input type="text" id="mkt-req-title" placeholder="Nombre de la Campaña (Ej: Lanzamiento Fase 1)..." class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white outline-none focus:border-mars-cyan mb-3">
            <textarea id="mkt-req-desc" placeholder="Justifica el ROI (Retorno de Inversión) para que Finanzas apruebe el gasto..." class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white h-20 outline-none focus:border-mars-cyan mb-2"></textarea>
        `;
        const actions = `<button onclick="ui.confirmRequestMktPackage('${pkg.id}')" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all w-full sm:w-auto">Solicitar Fondos</button>`;
        this.showModal("Autorización de Campaña", html, actions);
    },

    confirmRequestMktPackage(packId) {
        const elTitle = document.getElementById('mkt-req-title');
        const elDesc = document.getElementById('mkt-req-desc');
        if (!elTitle || !elDesc) return;

        const title = elTitle.value.trim();
        const desc = elDesc.value.trim();
        if (title.length < 3 || desc.length < 5) return alert("Rellena todos los campos correctamente.");

        // FASE 4: Guardián Léxico Universal en Marketing
        if (ui.hasForbiddenWords(title + " " + desc, 'Solicitud Paquete MKT')) return;

        const pkg = MARKETING_PACKAGES.find(p => p.id === packId);
        const co = state.data.companies[state.user.coId];

        co.marketingCampaigns = co.marketingCampaigns || [];
        co.marketingCampaigns.unshift({
            id: 'MKT-' + Date.now().toString().slice(-4),
            packageId: pkg.id,
            packageName: pkg.name,
            price: pkg.price,
            totalActions: pkg.actions,
            title: title,
            desc: desc,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, 'FINANZAS', `Marketing solicita el paquete "${pkg.name}" (${pkg.price} €v). Requiere validación.`, 'warning');
        state.save();
        this.closeModal();
        alert("✅ Solicitud enviada a la Bóveda de Finanzas para su autorización.");
        this.render();
    },

    viewResolutions(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        const isCEO = state.user.role === 'CEO';
        co.votingMotions = co.votingMotions || [];
        co.inactivityReports = co.inactivityReports || [];

        // FASE 5: Bloque de Solicitud de Cambio de Nombre (Solo CEO)
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

        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div class="lg:col-span-8 space-y-6">
                ${nameChangeHtml}
                <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-cyan">
                    <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2">
                        <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-tighter">Asamblea y Votaciones (Mociones)</h3>
                        <button onclick="ui.modalCreateMotion()" class="bg-mars-cyan text-black px-3 py-1.5 text-[9px] font-black uppercase hover:bg-white transition-all">+ Proponer Moción</button>
                    </div>
                    <div class="space-y-3">
                        ${co.votingMotions.map(m => this.renderMotionCard(m, co)).join('') || '<p class="text-slate-500 italic text-xs">No hay mociones asamblearias activas.</p>'}
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

    // FASE 5: Lógica de Solicitud del CEO
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

        // FASE 4: Guardián Léxico Universal en Cambio de Nombre
        if (ui.hasForbiddenWords(newName + " " + reason, 'Registro Mercantil (Nombre)')) return;

        const co = state.data.companies[state.user.coId];
        co.nameChangeRequest = {
            status: 'PENDIENTE',
            proposedName: newName,
            reason: reason,
            date: new Date().toLocaleString()
        };

        telemetry.log("GOBERNANZA", "Solicitud de cambio de nombre enviada");
        state.save();
        this.closeModal();
        this.render();
        alert("✅ Solicitud enviada exitosamente al Registro Mercantil (Coordinación).");
    },

    renderMotionCard(m, co) {
        const myRole = state.user.role;
        const totalRoles = Object.keys(co.roles).length;
        const votesYes = Object.values(m.votes||{}).filter(v => v === 'YES').length;
        const votesNo = Object.values(m.votes||{}).filter(v => v === 'NO').length;
        const totalVoted = Object.keys(m.votes||{}).length;
        const hasVoted = !!(m.votes && m.votes[myRole]);

        let actionsHtml = '';
        if (m.status === 'ABIERTA') {
            if (!hasVoted) {
                actionsHtml = `
                <div class="flex gap-2 mt-3 pt-3 border-t border-slate-800">
                    <button onclick="ui.castVote('${m.id}', 'YES')" class="flex-1 bg-mars-green text-black font-black px-2 py-1.5 text-[9px] uppercase hover:bg-white transition-all">A Favor</button>
                    <button onclick="ui.castVote('${m.id}', 'NO')" class="flex-1 bg-mars-magenta text-white font-black px-2 py-1.5 text-[9px] uppercase hover:bg-white hover:text-mars-magenta transition-all">En Contra</button>
                </div>`;
            } else {
                actionsHtml = `<p class="text-[9px] text-slate-500 uppercase mt-3 pt-3 border-t border-slate-800 text-center font-bold tracking-widest">Ya has votado. Esperando quórum.</p>`;
            }

            if (state.user.role === 'CEO' && totalVoted === totalRoles && votesYes === votesNo) {
                actionsHtml += `<div class="mt-2 bg-mars-yellow/10 border border-mars-yellow p-2 text-center"><p class="text-[9px] text-mars-yellow font-bold uppercase mb-2">Empate detectado. CEO tiene voto de calidad.</p>
                <div class="flex gap-2"><button onclick="ui.resolveTie('${m.id}', 'YES')" class="flex-1 bg-mars-yellow text-black text-[9px] font-black py-1">Desempatar A FAVOR</button><button onclick="ui.resolveTie('${m.id}', 'NO')" class="flex-1 border border-mars-yellow text-mars-yellow text-[9px] font-black py-1">Desempatar EN CONTRA</button></div></div>`;
            }
        }

        const badgeMap = { 'ABIERTA': 'bg-mars-cyan text-black', 'APROBADA': 'bg-mars-green text-black', 'RECHAZADA': 'bg-mars-magenta text-white' };
        
        return `
        <div class="bg-slate-900 border ${m.status === 'ABIERTA' && !hasVoted ? 'border-mars-cyan/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]' : 'border-slate-800'} p-4 mb-3">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-[8px] font-black uppercase px-2 py-0.5 ${badgeMap[m.status]}">${m.status}</span>
                    <h4 class="text-white font-bold text-xs uppercase mt-1">${m.title}</h4>
                </div>
                <span class="text-[8px] text-slate-500 font-mono">${m.date}</span>
            </div>
            <p class="text-[10px] text-slate-300 italic leading-relaxed mb-3">"${m.desc}"</p>
            <div class="w-full bg-black h-2 flex rounded-sm overflow-hidden mb-1">
                <div class="bg-mars-green h-full transition-all" style="width: ${(votesYes/totalRoles)*100}%"></div>
                <div class="bg-mars-magenta h-full transition-all" style="width: ${(votesNo/totalRoles)*100}%"></div>
            </div>
            <div class="flex justify-between text-[8px] font-bold text-slate-500 uppercase">
                <span class="text-mars-green">${votesYes} A Favor</span>
                <span>Quórum: ${totalVoted}/${totalRoles}</span>
                <span class="text-mars-magenta">${votesNo} En Contra</span>
            </div>
            ${actionsHtml}
        </div>`;
    },

    modalCreateMotion() {
        const html = `
            <input type="text" id="mot-title" placeholder="Título de la propuesta..." class="w-full bg-slate-900 border border-mars-cyan/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-cyan mb-3">
            <textarea id="mot-desc" placeholder="Argumentación detallada para el resto del equipo..." class="w-full bg-slate-900 border border-slate-700 p-3 text-xs text-white h-20 outline-none focus:border-mars-cyan"></textarea>
        `;
        const actions = `<button onclick="ui.submitMotion()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Llevar a Asamblea</button>`;
        this.showModal("Nueva Moción", html, actions);
    },

    submitMotion() {
        const elTitle = document.getElementById('mot-title');
        const elDesc = document.getElementById('mot-desc');
        if (!elTitle || !elDesc) return;
        const title = elTitle.value.trim();
        const desc = elDesc.value.trim();
        
        if (title.length < 5 || desc.length < 10) return alert("Propuesta demasiado corta.");
        if (ui.hasForbiddenWords(title + " " + desc, 'Moción de Gobernanza')) return;

        const co = state.data.companies[state.user.coId];
        co.votingMotions.unshift({
            id: 'MOT-' + Date.now(),
            title: title,
            desc: desc,
            authorRole: state.user.role,
            status: 'ABIERTA',
            votes: {},
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, 'ALL', `Nueva moción asamblearia propuesta por ${state.user.role}. Requiere votación.`, 'info');
        state.save();
        this.closeModal();
        this.render();
    },

    castVote(motId, voteVal) {
        const co = state.data.companies[state.user.coId];
        const m = co.votingMotions.find(x => x.id === motId);
        if (!m || m.status !== 'ABIERTA') return;

        m.votes = m.votes || {};
        m.votes[state.user.role] = voteVal;

        const totalRoles = Object.keys(co.roles).length;
        const totalVoted = Object.keys(m.votes).length;

        if (totalVoted === totalRoles) {
            const votesYes = Object.values(m.votes).filter(v => v === 'YES').length;
            const votesNo = Object.values(m.votes).filter(v => v === 'NO').length;
            if (votesYes > votesNo) m.status = 'APROBADA';
            else if (votesNo > votesYes) m.status = 'RECHAZADA';
            // Empate: Se queda 'ABIERTA' para voto de calidad del CEO
        }

        state.save();
        this.render();
    },

    resolveTie(motId, tieBreakerVote) {
        const co = state.data.companies[state.user.coId];
        const m = co.votingMotions.find(x => x.id === motId);
        if (!m || m.status !== 'ABIERTA') return;

        m.status = tieBreakerVote === 'YES' ? 'APROBADA' : 'RECHAZADA';
        telemetry.log("GOBERNANZA", `CEO resuelve empate en moción: ${m.status}`);
        state.save();
        this.render();
    },

    modalReportInactivity() {
        const html = `
            <p class="text-[10px] text-slate-400 mb-3 leading-relaxed">Selecciona el departamento que no está cumpliendo sus funciones. El reporte será verificado por el Claustro y puede derivar en despido (Sustitución de rol).</p>
            <select id="hr-dept" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none mb-3">
                <option value="TECNICO">Dpto. Técnico (I+D)</option>
                <option value="FINANZAS">Dpto. Financiero</option>
                <option value="MARKETING">Dpto. Marketing</option>
                <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
                <option value="CEO">Dirección General (CEO)</option>
            </select>
            <textarea id="hr-reason" placeholder="Describe los bloqueos concretos que está generando esta inactividad en el proyecto..." class="w-full bg-slate-900 border border-slate-700 p-3 text-xs text-white h-20 outline-none focus:border-mars-magenta"></textarea>
        `;
        const actions = `<button onclick="ui.submitInactivityReport()" class="bg-red-800 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-[0_0_10px_red]">Elevar a Coordinación</button>`;
        this.showModal("Apertura de Expediente por Inactividad", html, actions);
    },

    submitInactivityReport() {
        const elDept = document.getElementById('hr-dept');
        const elReason = document.getElementById('hr-reason');
        if (!elDept || !elReason) return;

        const target = elDept.value;
        const reason = elReason.value.trim();
        
        if (reason.length < 10) return alert("Justificación insuficiente.");
        if (ui.hasForbiddenWords(reason, 'Reporte Inactividad HR')) return;

        const co = state.data.companies[state.user.coId];
        co.inactivityReports.unshift({
            id: 'HR-' + Date.now(),
            authorRole: state.user.role,
            targetRole: target,
            reason: reason,
            status: 'EN_INVESTIGACION',
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, target, `Has sido reportado por inactividad. Coord. intervendrá si el bloqueo persiste.`, 'error');
        state.save();
        this.closeModal();
        this.render();
        alert("✅ Expediente de Inactividad enviado a Recursos Humanos (Coordinación).");
    }
});