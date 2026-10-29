// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES DE PLAZOS Y BACKUPS D1 (v1.1.28) ---

Object.assign(ui, {
    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        
        const wrapper = document.createElement('div');
        const isCoord = state.user.role && String(state.user.role).startsWith('COORD_');
        this.adminMode = this.adminMode || 'aula'; // 'aula' | 'coord'
        const currentTab = this.adminTab || (this.adminMode === 'coord' ? 'startups' : 'eval');
        const activeSuggsCount = (state.data.suggestionsToAlex || []).filter(s => s.status !== 'IMPLEMENTADO' && s.status !== 'RESUELTO' && !s.resolved).length;
        
        let deliveredCount = 0;
        for (const cid in (state.data.companies || {})) {
            const coDelivs = state.data.companies[cid]?.deliverables || {};
            for (const dKey in coDelivs) {
                const item = coDelivs[dKey];
                if (item && (item.status === 'DELIVERED_TO_TEACHER' || (typeof item === 'string' && item.length > 0))) {
                    deliveredCount++;
                }
            }
        }

        let modeSwitchHtml = '';
        if (isCoord) {
            modeSwitchHtml = `
            <div class="flex flex-wrap gap-2 mb-4 border-b border-cyan-500/30 pb-3" role="tablist">
                <button type="button" role="tab" aria-selected="${this.adminMode === 'aula'}"
                    onclick="ui.adminMode = 'aula'; ui.adminTab = 'eval'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        this.adminMode === 'aula'
                            ? 'bg-mars-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                    }">
                    🏫 MODO AULA // CALIFICACIÓN DIARIA
                </button>
                <button type="button" role="tab" aria-selected="${this.adminMode === 'coord'}"
                    onclick="ui.adminMode = 'coord'; ui.adminTab = 'startups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        this.adminMode === 'coord'
                            ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                    }">
                    ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)
                </button>
            </div>
            `;
        }

        let tabsHtml = '';
        if (!isCoord || this.adminMode === 'aula') {
            // MODO AULA / CALIFICACIÓN DIARIA (Visible para todo profesor: exactamente 2 botones prioritarios)
            const isEval = (currentTab === 'eval');
            const isDash = (currentTab === 'dash');
            tabsHtml = `
            <div role="tablist" aria-label="Navegación Docente Aula" class="flex flex-wrap gap-3 mb-6 border-b border-mars-border pb-3">
                <button type="button" role="tab" aria-selected="${isEval}"
                    onclick="ui.adminTab = 'eval'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isEval
                            ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>📝 Rúbricas y Entregas</span>
                    ${deliveredCount > 0 ? `<span class="bg-mars-green text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black">${deliveredCount}</span>` : ''}
                </button>
                <button type="button" role="tab" aria-selected="${isDash}"
                    onclick="ui.adminTab = 'dash'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isDash
                            ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🛃 Validaciones y Aduana</span>
                </button>
            </div>
            `;
        } else {
            // MODO COORDINACIÓN Y TIC
            tabsHtml = `
            <div role="tablist" aria-label="Administración del Centro TIC" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3">
                <button type="button" role="tab" aria-selected="${currentTab === 'startups'}"
                    onclick="ui.adminTab = 'startups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'startups'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🚀 Startups & Llavero Maestro (PINs)
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'settings'}"
                    onclick="ui.adminTab = 'settings'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        currentTab === 'settings'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>⏳ Cronograma Maestro (Plazos)</span>
                    ${activeSuggsCount > 0 ? `<span id="tab-badge-settings" class="bg-mars-yellow text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">${activeSuggsCount}</span>` : `<span id="tab-badge-settings" class="hidden"></span>`}
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'backups'}"
                    onclick="ui.adminTab = 'backups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'backups'
                            ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    💾 Copias de Seguridad (D1)
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'hr'}"
                    onclick="ui.adminTab = 'hr'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'hr'
                            ? 'bg-mars-magenta text-white border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🚨 Monitor de Infracciones Léxicas
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'telemetry'}"
                    onclick="ui.adminTab = 'telemetry'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'telemetry'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    📈 Telemetría de Red y Accesos
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'catalog'}"
                    onclick="ui.adminTab = 'catalog'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'catalog'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🛒 Gestión Catálogo
                </button>
            </div>
            `;
        }

        wrapper.innerHTML = modeSwitchHtml + tabsHtml + '<div id="admin-subtab-container" role="tabpanel"></div>';
        const subContainer = wrapper.querySelector('#admin-subtab-container');

        try {
            switch(currentTab) {
                case 'dash': {
                    const isFyqOrCoord = state.user.role === 'FYQ' || (state.user.role && state.user.role.startsWith('COORD')) || state.user.admin;
                    const isLyeOrCoord = state.user.role === 'LYE' || (state.user.role && state.user.role.startsWith('COORD')) || state.user.admin;
                    const fyqPanel = isFyqOrCoord ? this.renderFyqReceptionPanel() : '';
                    const mktActionPanel = isLyeOrCoord ? this.renderMktActionReceptionPanel() : '';
                    const brandPanel = isCoord ? this.renderAdminBrandReview() : '';
                    subContainer.innerHTML = brandPanel + fyqPanel + mktActionPanel + this.renderAdminDash();
                    break;
                }
                case 'eval': subContainer.innerHTML = this.renderAdminEval(); break;
                case 'startups': subContainer.innerHTML = this.renderAdminStartups(); break;
                case 'telemetry': subContainer.innerHTML = this.renderAdminTelemetry(); break;
                case 'hr': subContainer.innerHTML = this.renderAdminHR(); break;
                case 'catalog': subContainer.innerHTML = this.renderAdminCatalog(); break;
                case 'settings': subContainer.innerHTML = this.renderAdminSettings(); break;
                case 'backups': subContainer.innerHTML = this.renderAdminBackups(); break;
            }
        } catch (err) {
            console.error("Error renderizando pestaña docente:", err);
            subContainer.innerHTML = `<div class="bg-red-900/50 border border-red-500 p-4 text-white text-xs">Error de renderizado en pestaña ${this.escapeHTML(currentTab)}: ${this.escapeHTML(err.message)}</div>`;
        }

        el.appendChild(wrapper);
    },

    renderAdminBrandReview() {
        const companies = state.data.companies || {};
        const pendingCos = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            return co && ((co.brandApproval && co.brandApproval.status === 'PENDIENTE') || co.brandStatus === 'PENDING_APPROVAL');
        });

        if (pendingCos.length === 0) return '';

        const cardsHtml = pendingCos.map(cid => {
            const co = companies[cid];
            const coName = co.name || cid.toUpperCase();
            const logoPreview = co.brandApproval?.pendingLogo ? `<img src="${this.escapeHTML(co.brandApproval.pendingLogo)}" alt="Logo" width="48" height="48" onerror="this.onerror=null;this.src='logo.png';" class="w-12 h-12 object-contain border border-slate-700 bg-black p-1 shrink-0">` : '';

            return `
            <div class="bg-slate-900 border border-amber-500/60 p-4 rounded mb-3 text-xs">
                <div class="flex justify-between items-center mb-2 flex-wrap gap-2 border-b border-slate-800 pb-2">
                    <span class="text-mars-cyan font-bold uppercase text-sm">${this.escapeHTML(coName)}</span>
                    <span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 text-[10px] font-black uppercase">[PROPUESTA SLOGAN AVALADA POR CEO]</span>
                </div>
                <div class="flex gap-3 items-center mb-3">
                    ${logoPreview}
                    <div class="space-y-1 text-slate-200 min-w-0">
                        <p><strong class="text-mars-yellow uppercase">Enfoque:</strong> ${this.escapeHTML(co.brandApproval?.concept || 'Aeroespacial General')}</p>
                        <p class="text-[10px] text-slate-400 font-mono">${this.escapeHTML(co.brandApproval?.expId || '')}</p>
                    </div>
                </div>
                ${co.brandApproval?.driveUrl ? `
                <div class="mb-3">
                    <a href="${encodeURI(co.brandApproval.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Expediente Slogan en Google Drive ↗</span></a>
                </div>` : ''}
                <div class="mb-3">
                    <label for="coord-review-official-slogan-${cid}" class="text-xs text-mars-yellow uppercase font-bold block mb-1">Slogan Oficial Aprobado (Extraído del Google Doc):</label>
                    <input type="text" id="coord-review-official-slogan-${cid}" placeholder="Escribe el slogan aprobado que se fijará en el HUD..." value="${this.escapeHTML(co.brandApproval?.pendingSlogan || co.slogan || '')}" class="w-full min-h-[44px] bg-black border border-mars-yellow/50 p-2.5 text-xs text-mars-yellow font-bold uppercase outline-none focus:border-mars-yellow">
                </div>
                <div class="flex gap-2 justify-end">
                    <button type="button" onclick="ui.decideBrand('${this.escapeHTML(cid)}', true)" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ ✅ APROBAR Y REGISTRAR SLOGAN ]</button>
                    <button type="button" onclick="ui.modalCoordDenyBrand('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-red-700 text-white font-black uppercase text-xs px-4 py-2 hover:bg-white hover:text-red-700 transition-all border border-red-500">[ ❌ RECHAZAR ]</button>
                </div>
            </div>
            `;
        }).join('');

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400 mb-6">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <div>
                    <h3 class="font-orbitron text-amber-400 text-xs sm:text-sm uppercase tracking-wider font-bold">Revisión de Slogan Corporativo (Registro Mercantil)</h3>
                    <p class="text-[11px] text-slate-300">Validación de expedientes avalados por CEO y registro oficial del slogan.</p>
                </div>
                <span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 text-xs font-black uppercase font-mono">${pendingCos.length} PENDIENTES</span>
            </div>
            ${cardsHtml}
        </div>
        `;
    },

    modalCoordDenyBrand(cid) {
        if (!state.user || !state.user.admin) return;
        const reasons = [
            { id: "ENFOQUE_NO_AERO", label: "El slogan no guarda relación con el sector aeroespacial ni la misión" },
            { id: "PERMISOS_DRIVE_BLOQUEADOS", label: "El expediente Drive (DOC_11) no tiene permisos de lectura abiertos" },
            { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial DOC_11 de Google Docs" },
            { id: "CALIDAD_INSUFICIENTE", label: "La justificación de la propuesta es incompleta o requiere corrección léxica" },
            { id: "LOGO_NO_CONFORME", label: "El logotipo adjunto no cumple las directrices técnicas del proyecto" }
        ];
        const optionsHtml = reasons.map(r => `<option value="${this.escapeHTML(r.label)}">${this.escapeHTML(r.label)}</option>`).join('');

        const html = `
            <div class="space-y-3 font-mono text-xs">
                <p class="text-slate-300 leading-relaxed">Selecciona el motivo oficial para rechazar la propuesta de identidad corporativa. Cumple la directiva Zero-Text.</p>
                <div>
                    <label for="coord-deny-brand-reason" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Motivo Tipificado de Rechazo</label>
                    <select id="coord-deny-brand-reason" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-xs text-white outline-none focus:border-white">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
            <button type="button" onclick="ui.confirmCoordDenyBrand('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">Confirmar Rechazo</button>
        `;
        this.showModal("Rechazar Identidad Corporativa", html, actions);
    },

    confirmCoordDenyBrand(cid) {
        if (!state.user || !state.user.admin) return;
        const el = document.getElementById('coord-deny-brand-reason');
        const reason = el ? el.value : "Incumplimiento de criterios oficiales.";
        this.closeModal();
        this.decideBrand(cid, false, reason);
    },

    async decideBrand(cid, approved, customReason = null) {
        if (!state.user || !state.user.admin) return;
        const co = state.data.companies?.[cid];
        if (!co) return;

        if (approved) {
            const inputEl = document.getElementById('coord-review-official-slogan-' + cid);
            const officialSlogan = (inputEl && inputEl.value.trim()) ? this.cleanInput(inputEl.value) : (co.brandApproval?.pendingSlogan || co.slogan || '');
            if (!officialSlogan && !co.brandApproval?.pendingLogo) {
                return this.notify("Debes escribir o confirmar el slogan oficial aprobado.", "warning");
            }

            if (officialSlogan) co.slogan = officialSlogan;
            if (co.brandApproval?.pendingLogo) co.logo = co.brandApproval.pendingLogo;

            delete co.pendingSlogan;
            delete co.pendingMission;
            co.brandStatus = 'APPROVED';
            if (co.brandApproval) {
                co.brandApproval.status = 'APROBADO';
                delete co.brandApproval.pendingSlogan;
                delete co.brandApproval.pendingLogo;
            }
            this.notify(`✅ Slogan de ${co.name || cid} aprobado y registrado con éxito.`, "success");
            ui.pushNotification(cid, 'MARKETING', `La Coordinación ha APROBADO el slogan oficial: "${co.slogan}".`, 'success');
            ui.pushNotification(cid, 'CEO', `Slogan oficial registrado en el expediente: "${co.slogan}".`, 'success');
        } else {
            const reason = customReason || "Incumplimiento de criterios oficiales.";
            if (co.brandApproval) {
                co.brandApproval.status = 'RECHAZADO';
                co.brandApproval.feedback = reason;
            }
            co.brandStatus = 'REJECTED';
            this.notify(`❌ Propuesta de slogan de ${co.name || cid} rechazada.`, "info");
            ui.pushNotification(cid, 'MARKETING', `La Coordinación ha rechazado la propuesta de slogan. Motivo: ${reason}`, 'error');
            if (typeof telemetry !== 'undefined' && telemetry.log) {
                telemetry.log("PROPUESTA_DESCARTADA", `Propuesta de slogan de ${cid} descartada por Coordinación.`);
            }
        }

        state.save();
        this.render();

        try {
            const token = state.getAuthToken(state.user, state.data);
            await fetch(`/api/company/${cid}/action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                },
                body: JSON.stringify({
                    action: 'COORDINATOR_DECIDE_BRAND',
                    payload: { approved: Boolean(approved) }
                })
            });
        } catch(e) {
            console.warn("[ACTION] Error notificando decisión de marca al servidor:", e);
        }
    },

    renderFyqReceptionPanel() {
        const companies = state.data.companies || {};
        const defs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => d.subject === 'FYQ');

        let rows = '';
        for (const cid in companies) {
            const co = companies[cid];
            const coName = co.name || cid.toUpperCase();
            const coDeliverables = co.deliverables || {};

            defs.forEach(def => {
                const item = coDeliverables[def.key];
                const isDelivered = (def.key === 'hoja_taller_fyq')
                    ? (item && item.status === 'DELIVERED_TO_TEACHER')
                    : (item && (item.status === 'DELIVERED_TO_TEACHER' || (typeof item === 'string' && item.length > 0)));
                if (isDelivered) {
                    const driveUrl = typeof item === 'object' ? item.driveUrl : item;
                    const updatedAt = (typeof item === 'object' && item.updatedAt) ? String(item.updatedAt).slice(0, 10) : '--';
                    const safeHref = encodeURI(driveUrl).replace(/"/g, '&quot;');
                    rows += `
                        <tr class="border-b border-slate-800 text-xs">
                            <td class="p-2.5 font-bold text-mars-cyan uppercase">${this.escapeHTML(coName)}</td>
                            <td class="p-2.5 text-white font-medium">${this.escapeHTML(def.shortName || def.name)}</td>
                            <td class="p-2.5 font-mono text-slate-300">${this.escapeHTML(updatedAt)}</td>
                            <td class="p-2.5">
                                <span class="bg-mars-green/20 text-mars-green border border-mars-green/40 px-2 py-0.5 text-[10px] font-black uppercase">[✓ RECIBIDO DOCENTE]</span>
                            </td>
                            <td class="p-2.5">
                                <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50">Abrir Drive ↗</a>
                            </td>
                        </tr>
                    `;
                }
            });
        }

        if (!rows) {
            rows = `<tr><td colspan="5" class="p-4 text-center text-slate-400 italic">No hay recepciones de Física y Química elevadas al equipo docente todavía.</td></tr>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-cyan-400 mb-6">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <div>
                    <h3 class="font-orbitron text-cyan-400 text-xs sm:text-sm uppercase tracking-wider font-bold">Recepción de Entregables FyQ (Hoja de Taller BOM & Informes)</h3>
                    <p class="text-[11px] text-slate-300">Entregables supervisados y elevados por el CEO al equipo docente de Física y Química.</p>
                </div>
            </div>
            <div class="overflow-x-auto max-h-64 border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">Startup</th>
                            <th class="p-2.5 border-b border-slate-700">Hito FYQ</th>
                            <th class="p-2.5 border-b border-slate-700">Fecha</th>
                            <th class="p-2.5 border-b border-slate-700">Estado Pipeline</th>
                            <th class="p-2.5 border-b border-slate-700">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    renderMktActionReceptionPanel() {
        const companies = state.data.companies || {};
        let rows = '';

        for (const cid in companies) {
            const co = companies[cid];
            const coName = co.name || cid.toUpperCase();
            const campaigns = Array.isArray(co.marketingCampaigns) ? co.marketingCampaigns : [];

            campaigns.forEach(c => {
                const actions = Array.isArray(c.executedActions) ? c.executedActions : [];
                actions.forEach(act => {
                    if (act && act.status === 'VALIDADO_CEO') {
                        const actUrl = act.url || act.driveUrl || '';
                        const safeHref = actUrl ? encodeURI(actUrl).replace(/"/g, '&quot;') : '';
                        const dateFormatted = act.reviewedAt ? new Date(act.reviewedAt).toLocaleDateString() : (act.date || '--');

                        rows += `
                            <tr class="border-b border-slate-800 text-xs hover:bg-slate-900/60 transition-colors">
                                <td class="p-2.5 font-bold text-mars-cyan uppercase">${this.escapeHTML(coName)}</td>
                                <td class="p-2.5 text-white font-medium">${this.escapeHTML(c.packageName || c.title || 'Campaña MKT')}</td>
                                <td class="p-2.5 text-slate-200">
                                    <span class="font-bold block">${this.escapeHTML(act.title)}</span>
                                    ${act.desc ? `<span class="text-[11px] text-slate-400 italic block">"${this.escapeHTML(act.desc)}"</span>` : ''}
                                </td>
                                <td class="p-2.5 font-mono text-slate-300">${this.escapeHTML(dateFormatted)}</td>
                                <td class="p-2.5">
                                    <span class="bg-mars-green/20 text-mars-green border border-mars-green/40 px-2 py-0.5 text-[10px] font-black uppercase">[✓ RECIBIDO DOCENTE]</span>
                                </td>
                                <td class="p-2.5">
                                    ${safeHref ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50">Abrir Drive ↗</a>` : '<span class="text-slate-500 text-[10px] italic">Sin enlace</span>'}
                                </td>
                            </tr>
                        `;
                    }
                });
            });
        }

        if (!rows) {
            rows = `<tr><td colspan="6" class="p-4 text-center text-slate-400 italic">No hay acciones publicitarias validadas por CEO elevadas al docente de Liderazgo o Coordinación todavía.</td></tr>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400 mb-6">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-amber-400 text-xs sm:text-sm uppercase tracking-wider font-bold">Recepción de Acciones Publicitarias (Liderazgo & Coordinación)</h3>
                    <p class="text-[11px] text-slate-300">Acciones validadas por Dirección General (CEO) para supervisión curricular y feedback docente.</p>
                </div>
            </div>
            <div class="overflow-x-auto max-h-64 border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">Startup</th>
                            <th class="p-2.5 border-b border-slate-700">Paquete</th>
                            <th class="p-2.5 border-b border-slate-700">Acción Publicitaria</th>
                            <th class="p-2.5 border-b border-slate-700">Aprobación CEO</th>
                            <th class="p-2.5 border-b border-slate-700">Estado Pipeline</th>
                            <th class="p-2.5 border-b border-slate-700">Enlace Drive</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    renderAdminBackups() {
        return `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500 mb-6">
            <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3 flex-wrap gap-2">
                <div>
                    <h2 class="font-orbitron text-blue-400 text-sm sm:text-base uppercase tracking-tighter">Centro de Seguridad D1 y Copias de Respaldo</h2>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Control de estado global. Protegido mediante bindings nativos de Cloudflare.</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-slate-700 text-slate-200 text-xs font-black px-2 py-0.5 uppercase">Descarga Local</span></div>
                        <h4 class="text-white font-bold text-xs uppercase mb-2 text-center border-b border-slate-700 pb-2">1. Backup Manual Local</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Descarga el estado de todas las empresas en un archivo JSON seguro en tu ordenador.</p>
                    </div>
                    <button onclick="ui.downloadStateJSON()" class="min-h-[44px] w-full bg-slate-800 text-slate-200 border border-slate-600 font-black py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Descargar JSON</button>
                </div>

                <div class="bg-slate-900 border border-blue-500/50 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-blue-500 text-white text-xs font-black px-2 py-0.5 uppercase">Sobreescribible</span></div>
                        <h4 class="text-blue-400 font-bold text-xs uppercase mb-2 text-center border-b border-blue-500/50 pb-2">2. Snapshot Diario (Cloud)</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Fuerza un volcado del estado actual en el slot diario de la base de datos D1. Reemplaza el de ayer.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('daily')" class="min-h-[44px] w-full bg-blue-600/20 text-blue-400 border border-blue-500 font-black py-3 text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Generar Backup Diario</button>
                </div>

                <div class="bg-slate-900 border border-mars-yellow/50 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-mars-yellow text-black text-xs font-black px-2 py-0.5 uppercase">Inmutable</span></div>
                        <h4 class="text-mars-yellow font-bold text-xs uppercase mb-2 text-center border-b border-mars-yellow/50 pb-2">3. Archivo Semanal (Cloud)</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Genera un snapshot inmutable fechado. Ideal para cerrar trimestres o hitos de evaluación.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('weekly')" class="min-h-[44px] w-full bg-mars-yellow/20 text-mars-yellow border border-mars-yellow font-black py-3 text-xs uppercase tracking-widest hover:bg-mars-yellow hover:text-black transition-all">Crear Archivo Semanal</button>
                </div>
            </div>
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
            <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest border-b border-mars-magenta/50 pb-2">Punto de Restauración (Rollback de Emergencia)</h3>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Si un fallo o ataque altera gravemente la economía o el inventario, sube un archivo JSON previamente descargado (Backup 1) para sobreescribir la base de datos completa y restaurar la normalidad.</p>
            <div class="flex items-center gap-4 flex-wrap">
                <label for="restore-json-file" class="sr-only">Seleccionar archivo JSON de restauración</label>
                <input type="file" id="restore-json-file" accept=".json" class="min-h-[44px] text-xs text-slate-300 bg-black border border-slate-700 p-2 w-full md:w-auto flex-grow">
                <button onclick="ui.restoreStateFromJSON()" class="min-h-[44px] bg-mars-magenta text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-white hover:text-mars-magenta transition-all border border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.4)] whitespace-nowrap w-full md:w-auto">⚠ Ejecutar Restauración</button>
            </div>
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-red-600 mt-6 shadow-[0_0_20px_rgba(255,0,0,0.2)]">
            <div class="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-red-500 text-xs sm:text-sm uppercase tracking-widest font-black">🚨 RESET GENERAL PRE-LANZAMIENTO (FÁBRICA)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Inicialización limpia de simulación para el arranque oficial v1.1.00 en aula.</p>
                </div>
                <span class="bg-red-950/80 border border-red-500 text-red-400 px-3 py-1 text-xs font-black uppercase">ACCIÓN DESTRUCTIVA PROTEGIDA</span>
            </div>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">
                Restaura todas las startups al estado base de inicio: <strong>2400.00 €v de tesorería</strong>, libro mayor limpio, 19 entregables reseteados a pendiente, 0 multas, 0 transferencias, 0 mociones y telemetría purgada. <strong>Conserva intactas las empresas, sus nombres, códigos de acceso, PINs de roles, catálogo y docentes.</strong>
            </p>
            <div class="bg-red-950/40 border border-red-600/40 p-4 mb-4 text-xs font-mono text-red-300 space-y-1">
                <p>⚠️ Requiere clave de autorización docente maestra.</p>
                <p>🔒 Incrementa la versión de sincronización Cloudflare D1 (+50) para forzar replicación inmediata.</p>
            </div>
            <button type="button" onclick="ui.promptFactoryResetLaunch()" class="min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-red-400">
                [ 🚨 INICIALIZAR RESET DE FÁBRICA PRE-LANZAMIENTO ]
            </button>
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-cyan-500 mt-6 shadow-[0_0_20px_rgba(0,240,255,0.2)]">
            <div class="flex justify-between items-center mb-4 border-b border-cyan-900/50 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase tracking-widest font-black">⚡ RESET GLOBAL TRANSACCIONAL (RPC /api/admin/reset)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Misión v1.1.02: Transacción estricta en Cloudflare D1 y sincronización multicliente por broadcast.</p>
                </div>
                <span class="bg-cyan-950/80 border border-mars-cyan text-mars-cyan px-3 py-1 text-xs font-black uppercase">TRANSACCIÓN D1 ATÓMICA</span>
            </div>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">
                Ejecuta la purga transaccional D1 de pedidos, buzones, sugerencias e incidentes, restableciendo balances a <strong>1000.00 €v</strong> y catálogo a valores por defecto. Vacía el almacenamiento local selectivo (preservando la sesión del coordinador) y fuerza recarga de estado mediante broadcast en todos los navegadores conectados.
            </p>
            <button type="button" onclick="ui.globalTransactionalReset()" class="min-h-[44px] bg-mars-cyan hover:bg-white text-black font-black px-6 py-2.5 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)] border border-mars-cyan">
                [ ⚡ EJECUTAR RESET GLOBAL TRANSACCIONAL ]
            </button>
        </div>
        `;
    },

    saveDeadlines() {
        const fields = ['technicalReport', 'brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'investorDossier', 'balanceSheet'];
        state.data.config.deadlines = state.data.config.deadlines || {};
        state.data.config.deliverableSchedule = state.data.config.deliverableSchedule || {};
        
        const now = Date.now();
        fields.forEach(f => {
            const el = document.getElementById(`dl-${f}`);
            if (el) {
                state.data.config.deadlines[f] = el.value;
                state.data.config.deliverableSchedule[f] = {
                    ...(state.data.config.deliverableSchedule[f] || {}),
                    deadline: el.value,
                    updatedAt: now
                };
            }
        });
        state.data.config.updatedAt = now;

        state.save();
        this.notify("Plazos institucionales actualizados.", "success");
        this.render();
    },

    updateSuggestionStatus(suggId, newStatus) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        const s = state.data.suggestionsToAlex.find(x => x.id === suggId);
        if (s) {
            s.status = newStatus;
            state.save();
            this.render();
        }
    },

    deleteSuggestion(suggId) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.deletedSuggestionIds = state.data.deletedSuggestionIds || [];
        if (suggId && !state.data.deletedSuggestionIds.includes(String(suggId))) {
            state.data.deletedSuggestionIds.push(String(suggId));
        }
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(x => String(x.id) !== String(suggId));
        state.save();
        this.render();
    },

    purgeResolvedSuggestions() {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.deletedSuggestionIds = state.data.deletedSuggestionIds || [];
        const isResolvedStatus = (s) => s.status === 'IMPLEMENTADO' || s.status === 'RESUELTO' || s.resolved === true;
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const isOlderThan7Days = (s) => {
            const time = s.timestamp || (s.date ? new Date(s.date).getTime() : 0);
            return time > 0 && (now - time) > SEVEN_DAYS_MS;
        };

        const toPurge = state.data.suggestionsToAlex.filter(s => isResolvedStatus(s) || isOlderThan7Days(s));
        if (toPurge.length === 0) {
            return this.notify("No hay mensajes resueltos o con más de 7 días para purgar.", "info");
        }

        toPurge.forEach(s => {
            if (s && s.id && !state.data.deletedSuggestionIds.includes(String(s.id))) {
                state.data.deletedSuggestionIds.push(String(s.id));
            }
        });

        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(s => !isResolvedStatus(s) && !isOlderThan7Days(s));
        state.save();
        this.notify(`🗑️ Se han purgado permanentemente ${toPurge.length} mensajes del buzón.`, "success");
        this.render();
    },

    downloadFile(content, type, filename) {
        const blob = new Blob([content], { type: type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadStateJSON() {
        const jsonStr = JSON.stringify(state.data, null, 2);
        this.downloadFile(jsonStr, 'json', `marsket_backup_${new Date().toISOString().split('T')[0]}.json`);
    },

    async forceCloudBackup(type) {
        this.confirmAction(
            `Backup Cloud (${type === 'weekly' ? 'Semanal Inmutable' : 'Diario Sobreescribible'})`,
            `¿Deseas generar un backup ${type === 'weekly' ? 'Semanal Inmutable' : 'Diario Sobreescribible'} en Cloudflare D1?`,
            async () => {
                try {
                    const res = await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'force_backup', type: type })
                    });
                    if(res.ok) this.notify(`Backup ${type} generado con éxito en Cloudflare D1.`, "success");
                    else this.notify("Error al generar el backup en el servidor.", "error");
                } catch(e) {
                    this.notify("Error de conexión al generar el backup.", "error");
                }
            },
            "Generar Backup"
        );
    },

    restoreStateFromJSON() {
        const fileInput = document.getElementById('restore-json-file');
        if (!fileInput || !fileInput.files.length) return this.notify("Selecciona un archivo JSON válido primero.", "warning");

        this.confirmAction(
            "Restauración de Emergencia",
            "⚠ CUIDADO: Vas a SOBREESCRIBIR toda la base de datos de MARS-KET con los datos de este archivo. Esta acción no se puede deshacer. ¿Proceder?",
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const parsedData = JSON.parse(e.target.result);
                        if (!parsedData.companies || !parsedData.config) throw new Error("El archivo JSON no tiene la estructura válida de MARS-KET.");
                        
                        state.data = state.migrate(parsedData);
                        state.data.version = (Number(state.data.version) || 1) + 50; 
                        state.saveLocalOnly();
                        
                        await fetch('/api/state', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(state.data)
                        });
                        
                        this.notify("Restauración completada. La base de datos D1 y el almacenamiento local han vuelto al estado del backup.", "success");
                        location.reload(true);
                    } catch(err) {
                        this.notify("Error al leer o restaurar el archivo JSON: " + err.message, "error");
                    }
                };
                reader.readAsText(fileInput.files[0]);
            },
            "Ejecutar Rollback"
        );
    },

    promptFactoryResetLaunch() {
        if (!state.user || !state.user.role.startsWith('COORD')) {
            this.notify("Acceso restringido: Solo Coordinación Docente puede ejecutar el reset de fábrica.", "error");
            return;
        }
        const html = `
            <div class="space-y-4">
                <div class="bg-red-950/60 border border-red-500 p-4 text-center">
                    <p class="text-red-400 font-orbitron font-black text-sm uppercase tracking-wider mb-1">ATENCIÓN: REINICIO A CONDICIONES DE FÁBRICA</p>
                    <p class="text-xs text-slate-300 uppercase">Esta acción reiniciará balances a 2400 €v y borrará transacciones, pedidos y entregables de todas las empresas. Se mantendrán los nombres, códigos y PINs.</p>
                </div>
                <div>
                    <label for="factory-reset-key" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Introduce la Clave Maestra de Autorización:</label>
                    <input type="password" id="factory-reset-key" autocomplete="off" placeholder="••••••••" class="min-h-[44px] w-full bg-slate-900 border border-red-500 p-3 text-center font-orbitron font-black text-sm text-white tracking-widest outline-none focus:border-mars-yellow" onkeydown="if(event.key==='Enter') ui.verifyAndConfirmFactoryReset()">
                </div>
            </div>
        `;
        const actions = `
            <button onclick="ui.verifyAndConfirmFactoryReset()" class="min-h-[44px] bg-red-600 text-white font-black px-5 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-red-500">[ PROCEDER AL RESET ]</button>
            <button onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-300 font-bold px-4 py-2 text-xs uppercase hover:bg-slate-700 transition-all">Cancelar</button>
        `;
        this.showModal("CONFIRMACIÓN DE RESET PRE-LANZAMIENTO", html, actions);
        setTimeout(() => document.getElementById('factory-reset-key')?.focus(), 50);
    },

    verifyAndConfirmFactoryReset() {
        const input = document.getElementById('factory-reset-key');
        const key = input ? input.value.trim() : '';
        if (!key) {
            this.notify("Clave de autorización requerida.", "error");
            return;
        }
        this.closeModal();
        this.confirmAction(
            "ÚLTIMA CONFIRMACIÓN CRÍTICA",
            "¿Estás absolutamente seguro de ejecutar el RESET GENERAL DE FÁBRICA? Esta acción reescribirá la base de datos D1.",
            () => this.factoryResetLaunch(key),
            "EJECUTAR RESET DE FÁBRICA"
        );
    },

    async factoryResetLaunch(providedKey = '') {
        if (!state.user || !state.user.role || !state.user.role.startsWith('COORD')) {
            this.notify("Acceso restringido.", "error");
            return;
        }
        this.notify("Enviando orden de reset de fábrica a Cloudflare D1...", "info");
        try {
            const token = state.getAuthToken(state.user, state.data);
            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                },
                body: JSON.stringify({
                    token: token,
                    code: providedKey,
                    role: state.user.role
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                this.notify(`Clave de autorización maestra INCORRECTA o denegada: ${errJson.error || res.statusText}`, "error");
                return;
            }

            try {
                localStorage.removeItem(state.storageKey);
                localStorage.removeItem('marsket_emergency_snapshot');
            } catch(e) {}

            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const bc = new BroadcastChannel('marsket_channel');
                    bc.postMessage({ type: 'MARSKET_GLOBAL_RESET', timestamp: Date.now() });
                } catch(e) {}
            }

            await state.fetchFromCloud();
            this.notify("🚀 RESET GENERAL PRE-LANZAMIENTO EJECUTADO CON ÉXITO.", "success");
            this.render();
        } catch (err) {
            console.error("Error durante el factory reset:", err);
            this.notify("Error al ejecutar el reset: " + err.message, "error");
        }
    },

    modalConfirmSimulationReset() {
        if (!state.user || !state.user.admin) return;
        const html = `
            <div class="space-y-3 font-mono text-xs">
                <div class="bg-red-950/40 border border-red-500/60 p-3 text-red-200">
                    <p class="font-bold uppercase text-red-400 mb-1">⚠️ PROTOCOLO DE RESET GLOBAL TRANSACCIONAL (v1.1.02)</p>
                    <p>Esta acción ejecutará una transacción estricta D1 (órdenes, buzón, sugerencias, balances a 1000.00 €v y catálogo por defecto) y forzará la recarga en todos los clientes.</p>
                </div>
                <div>
                    <label for="reset-master-code-input" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Introduce el Código Maestro de Coordinador:</label>
                    <input type="password" id="reset-master-code-input" placeholder="Código de Coordinador..." class="w-full min-h-[44px] bg-slate-900 border border-red-500/60 p-2.5 text-base sm:text-xs text-white outline-none focus:border-red-400 font-mono">
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
            <button type="button" onclick="ui.confirmSimulationReset()" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">[ ⚠️ EJECUTAR RESET TOTAL ]</button>
        `;
        this.showModal("Confirmación de Reset Global", html, actions);
    },

    async confirmSimulationReset() {
        const el = document.getElementById('reset-master-code-input');
        const code = el ? el.value.trim() : '';
        if (!code) return this.notify("Debes introducir el código maestro para autorizar el reset.", "warning");
        this.closeModal();
        await this.globalTransactionalReset(code);
    },

    async globalTransactionalReset(authorizedCode = null) {
        if (!state.user || !state.user.admin) return;
        const cu = (typeof currentUser !== 'undefined' ? currentUser : null) || state.currentUser || state.user;
        const r = String(cu?.role || '').toLowerCase();
        if (cu?.role !== 'coordinador' && r !== 'coordinador' && !r.includes('coord') && !cu?.admin) {
            return this.notify("Operación reservada exclusivamente para el rol de Coordinador.", "error");
        }

        if (!authorizedCode) {
            return this.modalConfirmSimulationReset();
        }

        const inputCode = authorizedCode;

        this.notify("Ejecutando transacción D1 estricta de reset global...", "info");

        try {
            const token = state.getAuthToken(state.user, state.data);
            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                },
                body: JSON.stringify({
                    token: token,
                    code: inputCode.trim(),
                    role: state.user.role
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                return this.notify(`Error en el reset D1: ${errJson.error || res.statusText}`, "error");
            }

            // En el cliente: Vaciar localStorage selectivo (preservando sesión del coordinador)
            try {
                localStorage.removeItem(state.storageKey);
                localStorage.removeItem('marsket_emergency_snapshot');
            } catch(e) {}

            // Forzar recarga de estado en todos los clientes mediante broadcast
            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const bc = new BroadcastChannel('marsket_channel');
                    bc.postMessage({ type: 'MARSKET_GLOBAL_RESET', timestamp: Date.now() });
                } catch(e) {}
            }

            await state.fetchFromCloud();
            this.notify("✅ Protocolo de Reset Global Transaccional ejecutado exitosamente. Clientes sincronizados.", "success");
            this.render();
        } catch(netErr) {
            this.notify(`Excepción durante el reset: ${netErr.message}`, "error");
        }
    },

    modalModerationIncidents() {
        const incidents = state.data.securityIncidents || [];
        const rows = incidents.map((inc) => `
            <tr class="border-b border-slate-800 text-xs hover:bg-slate-900/60 transition-colors">
                <td class="p-2.5 font-mono text-slate-400 whitespace-nowrap">${this.escapeHTML(inc.date || inc.timestamp || '--')}</td>
                <td class="p-2.5 font-bold text-mars-yellow uppercase">${this.escapeHTML(inc.team_id || inc.coId || 'AEE')}</td>
                <td class="p-2.5 text-mars-cyan font-mono uppercase">${this.escapeHTML(inc.student_alias || inc.role || 'ESTUDIANTE')}</td>
                <td class="p-2.5">
                    <span class="bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 px-2 py-0.5 font-mono font-black text-[11px] uppercase">${this.escapeHTML(inc.matched_term || inc.word || 'INFRACCIÓN')}</span>
                </td>
                <td class="p-2.5 text-slate-300 break-words font-mono text-[11px] max-w-xs">
                    "${this.escapeHTML(inc.offending_text || inc.text || '--')}"
                </td>
            </tr>
        `).join('') || `<tr><td colspan="5" class="p-6 text-center text-slate-400 italic">No se han registrado infracciones léxicas en la telemetría pedagógica.</td></tr>`;

        const body = `
        <div class="space-y-4 font-mono text-xs">
            <div class="bg-slate-950 border border-[#FF0055]/60 p-3 text-slate-200 flex justify-between items-center flex-wrap gap-2">
                <div>
                    <p class="text-[#FF0055] font-orbitron font-black uppercase text-xs">TELEMETRÍA PEDAGÓGICA // REGISTRO DE INFRACCIONES LÉXICAS</p>
                    <p class="text-xs text-slate-300">Auditoría en tiempo real de transgresiones LOPD y filtros de lenguaje de aula.</p>
                </div>
                <span class="bg-[#FF0055] text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider font-mono">${incidents.length} INCIDENTES</span>
            </div>
            <div class="overflow-x-auto max-h-[60vh] border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">FECHA / HORA</th>
                            <th class="p-2.5 border-b border-slate-700">STARTUP / EQUIPO</th>
                            <th class="p-2.5 border-b border-slate-700">ROL / ALIAS</th>
                            <th class="p-2.5 border-b border-slate-700">TÉRMINO DETECTADO</th>
                            <th class="p-2.5 border-b border-slate-700">TEXTO INTERCEPTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>`;

        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-black transition-all">Cerrar</button>
        `;
        this.showModal("REGISTRO DE INFRACCIONES LÉXICAS", body, actions);
    }
});