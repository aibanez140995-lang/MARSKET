// js/ui-docente-management.js
// --- MÓDULO DOCENTE: GESTIÓN, LLAVERO MAESTRO, ADUANAS Y REGISTRO MERCANTIL (v1.1.00) ---

Object.assign(ui, {
    pinsVisible: false,
    renderAdminDash() {
        let globalReal = 0;
        for (let c in state.data.companies) {
            const co = state.data.companies[c];
            co.realCosts = co.realCosts || [];
            globalReal += co.realCosts.reduce((s, i) => s + (Number(i.eur) || 0), 0);
        }
        
        const isCoord = state.user.role.startsWith('COORD');
        const canSponsor = state.data.config.teachers[state.user.role]?.canSponsor === true;

        state.data.b2bContracts = state.data.b2bContracts || [];
        const pendingB2B = state.data.b2bContracts.filter(c => c.status === 'PENDIENTE_ADUANA');
        
        const pendingBrands = Object.keys(state.data.companies).filter(cid => {
            const co = state.data.companies[cid];
            return co.brandApproval && co.brandApproval.status === 'PENDIENTE';
        });

        const pendingNameChanges = Object.keys(state.data.companies).filter(cid => {
            const co = state.data.companies[cid];
            return co && co.nameChangeRequest && co.nameChangeRequest.status === 'PENDIENTE';
        });

        const incidents = (state.data.securityIncidents || []).filter(i => !i.resolved);

        let incidentsHtml = '';
        if (incidents.length > 0 && isCoord) {
            incidentsHtml = `
            <div class="terminal-border bg-red-900/20 p-6 mb-6 border-t-4 border-t-red-600 animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.2)]">
                <div class="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-red-500 text-xs sm:text-sm uppercase tracking-widest">🚨 Alertas Disciplinarias (Filtro Léxico)</h3>
                        <p class="text-xs text-red-200 uppercase mt-0.5">El sistema ha bloqueado intentos de uso de lenguaje prohibido (nombres o insultos).</p>
                    </div>
                    <span class="bg-red-600 text-white px-3 py-1 text-xs font-black uppercase">${incidents.length} Infracciones</span>
                </div>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
                    ${incidents.map(inc => {
                        const coName = state.data.companies[inc.coId]?.name || 'Desconocida';
                        const isName = inc.severity === 'NAME';
                        const colors = isName ? 'border-mars-yellow bg-mars-yellow/5' : 'border-red-800 bg-black';
                        const titleColor = isName ? 'text-mars-yellow' : 'text-red-500';
                        const label = isName ? '⚠️ AVISO LÉXICO (USO NOMBRE PROPIO)' : '🚨 INFRACCIÓN GRAVE (LENGUAJE SOEZ)';

                        return `
                        <div class="${colors} border p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                            <div class="min-w-0">
                                <span class="${titleColor} font-bold uppercase text-xs">${label}</span><br>
                                <span class="text-white font-bold uppercase mt-1 inline-block break-words">${this.escapeHTML(coName)} (${this.escapeHTML(inc.role)})</span>
                                <span class="text-slate-300 ml-2">${this.escapeHTML(inc.date)}</span>
                                <p class="text-white mt-1">Contexto: <span class="text-mars-yellow">${this.escapeHTML(inc.context)}</span></p>
                                <p class="text-slate-200 italic mt-1 break-words">Texto bloqueado: "${this.escapeHTML(inc.text)}"</p>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                ${!isName ? `<button onclick="ui.modalAEEFine('${this.escapeHTML(inc.coId)}')" class="min-h-[44px] bg-red-800 text-white px-3 py-2 font-black uppercase text-xs hover:bg-red-600 transition-colors border border-red-500 shadow-[0_0_8px_red]">Abrir Sanción AEE</button>` : ''}
                                <button onclick="ui.resolveSecurityIncident('${this.escapeHTML(inc.id)}')" class="min-h-[44px] bg-slate-800 text-slate-200 px-3 py-2 font-black uppercase text-xs hover:bg-white hover:text-black transition-colors">Archivar</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        let nameCustomsHtml = '';
        if (isCoord && pendingNameChanges.length > 0) {
            nameCustomsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-6 border-t-4 border-t-mars-yellow shadow-[0_0_15px_rgba(255,183,3,0.1)]">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🏛️ Registro Mercantil (Denominación Social)</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Solicitudes de renombramiento corporativo enviadas por los CEOs.</p>
                    </div>
                    <span class="bg-mars-yellow text-black px-3 py-1 text-xs font-black uppercase">${pendingNameChanges.length} Petición(es)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${pendingNameChanges.map(cid => {
                        const co = state.data.companies[cid];
                        const req = co.nameChangeRequest;
                        return `
                        <div class="bg-slate-900 border border-mars-yellow/40 p-4">
                            <p class="text-xs text-slate-300 uppercase font-bold mb-1">Empresa Actual:</p>
                            <h4 class="font-orbitron text-slate-200 font-bold text-xs uppercase mb-2 line-through decoration-mars-magenta break-words">${this.escapeHTML(co.name)}</h4>
                            <p class="text-xs text-mars-green uppercase font-bold mb-1">Nuevo Nombre Propuesto:</p>
                            <h4 class="font-orbitron text-mars-yellow font-black text-sm uppercase mb-2 break-words">${this.escapeHTML(req.proposedName)}</h4>
                            <p class="text-slate-200 italic text-xs mb-3 break-words">"${this.escapeHTML(req.reason)}"</p>
                            <div class="flex gap-2">
                                <button onclick="ui.resolveNameChangeRequest('${this.escapeHTML(cid)}', true)" class="min-h-[44px] flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Autorizar</button>
                                <button onclick="ui.resolveNameChangeRequest('${this.escapeHTML(cid)}', false)" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-xs hover:bg-mars-magenta hover:text-white transition-colors">Denegar</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        let brandCustomsHtml = '';
        let b2bCustomsHtml = '';

        if (isCoord) {
            brandCustomsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-6 border-t-4 border-t-mars-magenta">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-magenta text-xs sm:text-sm uppercase tracking-widest">🛡️ Aduana de Identidad Corporativa (Logos y Eslóganes)</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Auditoría previa de la imagen de marca de las startups.</p>
                    </div>
                    <span class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1 text-xs font-black uppercase">${pendingBrands.length} Pendiente(s)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${pendingBrands.map(cid => {
                        const co = state.data.companies[cid];
                        const logoPreview = co.brandApproval.pendingLogo ? `<img src="${this.escapeHTML(co.brandApproval.pendingLogo)}" alt="Logo pendiente" width="64" height="64" onerror="this.onerror=null;this.src='logo.png';" class="w-16 h-16 object-contain border border-mars-border bg-black p-1">` : `<div class="w-16 h-16 border border-mars-border bg-slate-900 flex items-center justify-center text-xs text-slate-300 uppercase text-center">Sin Logo</div>`;
                        return `
                        <div class="bg-slate-900 border border-mars-magenta/50 p-4 flex flex-col gap-3">
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2 gap-2">
                                <h4 class="font-orbitron text-white font-bold text-xs uppercase break-words">${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup)}]</h4>
                                <span class="text-xs bg-mars-yellow/20 text-mars-yellow px-2 py-0.5 font-bold uppercase animate-pulse shrink-0">En Revisión</span>
                            </div>
                            <div class="flex gap-4 items-center">
                                ${logoPreview}
                                <div class="flex-grow min-w-0">
                                    <p class="text-xs text-slate-300 uppercase font-bold mb-1">Eslogan Propuesto:</p>
                                    <p class="text-mars-yellow italic text-xs bg-black p-2 border border-slate-800 break-words">"${this.escapeHTML(co.brandApproval.pendingSlogan || 'No especificado')}"</p>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="ui.resolveBrandApproval('${this.escapeHTML(cid)}')" class="min-h-[44px] flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Aprobar Marca</button>
                                <button onclick="ui.promptDenyBrand('${this.escapeHTML(cid)}')" class="min-h-[44px] flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-xs hover:bg-mars-magenta hover:text-white transition-colors">Rechazar (Feedback)</button>
                            </div>
                        </div>`;
                    }).join('') || '<p class="text-slate-300 text-xs italic col-span-full">No hay marcas pendientes de revisión.</p>'}
                </div>
            </div>`;

            b2bCustomsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-8 border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🛃 Aduana Aeroespacial B2B (Control de Traspasos)</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Autoriza o deniega las compraventas de segunda mano.</p>
                    </div>
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1 text-xs font-black uppercase">${pendingB2B.length} Pendiente(s)</span>
                </div>
                <div class="space-y-3">
                    ${pendingB2B.map(c => `
                    <div class="bg-slate-900 border border-mars-yellow/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                        <div class="flex-grow min-w-0">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-mono text-slate-300 font-bold">${this.escapeHTML(c.id)}</span>
                                <span class="text-slate-500">|</span>
                                <span class="text-slate-300">${this.escapeHTML(c.date)}</span>
                            </div>
                            <p class="text-white font-bold text-xs uppercase mb-1 break-words">${this.escapeHTML(c.itemName)} (x${c.qty || 1})</p>
                            <p class="text-slate-200 uppercase text-xs break-words">
                                Vendedor: <strong class="text-mars-cyan">${this.escapeHTML(c.sellerName)}</strong> ➔ Comprador: <strong class="text-mars-yellow">${this.escapeHTML(c.buyerName)}</strong>
                            </p>
                        </div>
                        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                            <span class="text-mars-green font-mono font-black text-base">${Number(c.price).toFixed(2)} €v</span>
                            <div class="flex gap-2">
                                <button onclick="ui.resolveB2BContract('${this.escapeHTML(c.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Aprobar</button>
                                <button onclick="ui.resolveB2BContract('${this.escapeHTML(c.id)}', false)" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-xs hover:bg-mars-magenta hover:text-white transition-colors">Rechazar</button>
                            </div>
                        </div>
                    </div>`).join('') || '<p class="text-slate-300 text-xs italic">No hay contratos B2B retenidos en la Aduana en este momento.</p>'}
                </div>
            </div>`;
        }

        return `
        ${incidentsHtml}
        ${nameCustomsHtml}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            <div class="lg:col-span-1 terminal-border bg-mars-card p-6 text-center border-t-4 border-t-mars-magenta flex flex-col justify-center">
                <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest">Inversión FÍSICA CLASE</h3>
                <p class="text-5xl font-orbitron text-white mb-2 tracking-tighter">${globalReal.toFixed(2)} €</p>
                <p class="text-xs text-slate-300 uppercase font-bold">Impacto económico real total</p>
            </div>
            <div class="lg:col-span-3 terminal-border bg-mars-card p-4 sm:p-6 w-full overflow-hidden border-t-4 border-t-mars-cyan">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Control Financiero, Patrocinios & Sanciones AEE</h3>
                    <span class="text-xs text-slate-300 uppercase sm:hidden">Desliza ➔</span>
                </div>
                <div class="overflow-x-auto w-full pb-1">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-3 pr-2.5 sm:pr-4">Empresa</th>
                                <th class="pr-2.5 sm:pr-4">Bal(€v)</th>
                                <th class="pr-2.5 sm:pr-4">Gasto(€v)</th>
                                <th class="pr-2.5 sm:pr-4">Físico(€)</th>
                                <th class="pr-2.5 sm:pr-4">Patrocinio Fase I</th>
                                <th>Sanciones AEE</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const c = state.data.companies[cid];
                                c.realCosts = c.realCosts || []; 
                                c.ledger = c.ledger || []; 
                                
                                const r = c.realCosts.reduce((s,i)=>s+(Number(i.eur)||0),0);
                                const virtualSpend = c.ledger.filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(Number(l.delta)||0), 0);
                                
                                let sponsorHtml = '';
                                if(canSponsor) {
                                    sponsorHtml = `<button onclick="ui.modalAssignSponsor('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1.5 font-bold text-xs uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">${c.sponsorAwarded ? `[${this.escapeHTML(c.sponsorAwarded)}] Editar` : 'Asignar Patrocinio'}</button>`;
                                } else {
                                    if(c.sponsorAwarded) {
                                        const cl = c.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700]':c.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0]':'text-[#cd7f32] border-[#cd7f32]';
                                        let spName = c.sponsorData?.name ? ` - ${this.escapeHTML(c.sponsorData.name)}` : '';
                                        let spLogo = c.sponsorData?.logo ? `<img src="${this.escapeHTML(c.sponsorData.logo)}" alt="Logo patrocinador" width="16" height="16" class="h-4 inline-block ml-2 rounded-sm object-contain bg-black/50 p-0.5">` : '';
                                        sponsorHtml = `<span class="${cl} font-bold text-xs uppercase border px-2 py-1 bg-black/50 flex items-center w-max gap-1">[PATROCINIO: ${this.escapeHTML(c.sponsorAwarded)}${spName}]${spLogo}</span>`;
                                    } else {
                                        sponsorHtml = `<span class="text-slate-300 font-bold text-xs uppercase border border-slate-700 px-2 py-1 bg-slate-900 block w-max">[SIN PATROCINIO]</span>`;
                                    }
                                }

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold pr-2.5 sm:pr-4 flex items-center gap-1.5 sm:gap-2">
                                        <button onclick="ui.showCompanyLogins('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 max-w-[130px] sm:max-w-[240px] truncate inline-flex items-center" title="${this.escapeHTML(c.name)}">${this.escapeHTML(c.name)} [${this.escapeHTML(c.classGroup||'A')}]</button>
                                        ${isCoord ? `<button onclick="ui.promptRenameStartup('${this.escapeHTML(cid)}')" aria-label="Renombrar Denominación Social" title="Renombrar Denominación Social" class="min-h-[44px] min-w-[44px] bg-slate-800 text-slate-200 px-2 py-1 text-xs hover:bg-mars-yellow hover:text-black transition-colors rounded-sm flex items-center justify-center shrink-0">✏️</button>` : ''}
                                    </td>
                                    <td class="py-3 font-mono pr-2.5 sm:pr-4"><span class="text-mars-green font-bold">${c.balance.toFixed(0)} €v</span></td>
                                    <td class="py-3 font-mono pr-2.5 sm:pr-4"><button onclick="ui.modalVirtualSpend('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 inline-flex items-center" title="Ver desglose detallado">${virtualSpend.toFixed(2)} €v</button></td>
                                    <td class="py-3 font-mono pr-2.5 sm:pr-4"><span class="text-mars-magenta">${r.toFixed(2)} €</span></td>
                                    <td class="py-3 pr-2.5 sm:pr-4">${sponsorHtml}</td>
                                    <td class="py-3">
                                        <button onclick="ui.modalAEEFine('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-red-900/30 border border-red-500 text-red-400 px-3 py-1.5 font-bold text-xs uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_5px_red] whitespace-nowrap">Expediente Sancionador</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        ${brandCustomsHtml}
        ${b2bCustomsHtml}`;
    },

    renderAdminStartups() {
        const isCoord = state.user.role.startsWith('COORD');
        
        const pendingAuxCoIds = Object.keys(state.data.companies).filter(cid => {
            const co = state.data.companies[cid];
            return co.auxRoleRequest && co.auxRoleRequest.status === 'PENDIENTE';
        });

        let auxRequestsHtml = '';
        if (isCoord && pendingAuxCoIds.length > 0) {
            auxRequestsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-6 border-t-4 border-t-mars-green">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-green text-xs sm:text-sm uppercase tracking-widest">👁️ Solicitudes de Alta de Rol Auxiliar (Observador)</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Autoriza las solicitudes de los CEOs y asigna o confirma el PIN de 4 dígitos para el miembro auxiliar.</p>
                    </div>
                    <span class="bg-mars-green/10 border border-mars-green text-mars-green px-3 py-1 text-xs font-black uppercase">${pendingAuxCoIds.length} Pendiente(s)</span>
                </div>
                <div class="space-y-3">
                    ${pendingAuxCoIds.map(cid => {
                        const co = state.data.companies[cid];
                        const req = co.auxRoleRequest;
                        return `
                        <div class="bg-slate-900 border border-mars-green/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs">
                            <div>
                                <span class="font-orbitron text-white font-bold text-xs uppercase break-words">${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup)}]</span>
                                <span class="text-slate-300 ml-2">${this.escapeHTML(req.date || '')}</span>
                                <p class="text-slate-200 uppercase mt-1">Departamento Vinculado Solicitado: <strong class="text-mars-cyan">${this.escapeHTML(req.dept)}</strong></p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end flex-wrap">
                                <label for="approve-aux-pin-${this.escapeHTML(cid)}" class="text-xs text-slate-300 uppercase font-bold">PIN:</label>
                                <input type="text" id="approve-aux-pin-${this.escapeHTML(cid)}" maxlength="4" value="${this.escapeHTML(req.pin || '5555')}" class="min-h-[44px] w-20 bg-black border border-mars-cyan text-center text-mars-green font-mono font-bold text-base sm:text-xs p-1.5 outline-none">
                                <button onclick="ui.resolveAuxRoleRequest('${this.escapeHTML(cid)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Aprobar y Activar</button>
                                <button onclick="ui.resolveAuxRoleRequest('${this.escapeHTML(cid)}', false)" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-xs hover:bg-mars-magenta hover:text-white transition-colors">Denegar</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const dl = state.data.config.deadlines || {};

        let coordSettingsHtml = '';
        if (isCoord) {
            const deadlinesInputs = defs.map(d => {
                const val = dl[d.key] || d.defaultDate;
                return `
                <div class="bg-slate-900 border border-slate-800 p-3 flex flex-col justify-between">
                    <div>
                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                        <label for="dl-master-${this.escapeHTML(d.key)}" class="text-xs text-white font-bold uppercase block mt-1.5 mb-2 leading-snug">${this.escapeHTML(d.name)}</label>
                    </div>
                    <input type="datetime-local" id="dl-master-${this.escapeHTML(d.key)}" value="${this.escapeHTML(val)}" onchange="ui.updateDeadline('${this.escapeHTML(d.key)}', this.value)" class="min-h-[44px] w-full bg-black border border-slate-700 p-2 text-base sm:text-xs text-mars-yellow font-mono outline-none focus:border-mars-yellow">
                </div>`;
            }).join('');

            const teacherPins = Object.keys(state.data.config.teachers || {}).map(tk => {
                const t = state.data.config.teachers[tk];
                return `
                <div class="bg-slate-900 border border-slate-800 p-3 flex justify-between items-center gap-2">
                    <div>
                        <span class="text-xs text-mars-cyan font-bold uppercase block">${this.escapeHTML(tk)}</span>
                        <label for="teacher-pin-${this.escapeHTML(tk)}" class="text-xs text-white font-bold uppercase">${this.escapeHTML(t.name)}</label>
                    </div>
                    <input type="${this.pinsVisible ? 'text' : 'password'}" id="teacher-pin-${this.escapeHTML(tk)}" value="${this.escapeHTML(t.pin)}" maxlength="4" onchange="ui.updateTeacherPin('${this.escapeHTML(tk)}', this.value)" class="min-h-[44px] w-20 bg-black border border-mars-cyan text-center text-mars-cyan font-mono font-bold text-base sm:text-xs p-1.5">
                </div>`;
            }).join('');

            coordSettingsHtml = `
            <div class="terminal-border bg-mars-card p-6 mt-6 border-t-4 border-t-mars-yellow">
                <div class="mb-4 border-b border-mars-border pb-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🗓️ Gestión de Fechas Límite: Cronograma Maestro (19 Entregables)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Cualquier ajuste actualiza inmediatamente el semáforo temporal en todas las startups.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
                    ${deadlinesInputs}
                </div>

                <div class="mb-4 border-b border-mars-border pb-2">
                    <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase tracking-widest">🔐 Credenciales del Claustro Docente</h3>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    ${teacherPins}
                </div>
            </div>`;
        }

        return `
        ${auxRequestsHtml}
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div class="xl:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Crear Startup</h3>
                <label for="new-co-name" class="text-xs text-slate-300 uppercase font-bold block mb-1">Nombre Corporativo</label>
                <input type="text" id="new-co-name" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-3 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Nombre Corporativo">
                <label for="new-co-cap" class="text-xs text-slate-300 uppercase font-bold block mb-1">Capital Inicial (€v)</label>
                <input type="number" id="new-co-cap" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-3 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Capital (€v)" value="2400">
                <label for="new-co-class" class="text-xs text-slate-300 uppercase font-bold block mb-1">Grupo de Clase</label>
                <select id="new-co-class" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-3 text-base sm:text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                    ${['A','B','C','D','E','F'].map(c => `<option value="${c}">Clase ${c}</option>`).join('')}
                </select>
                <button onclick="ui.createStartup()" class="min-h-[44px] w-full bg-mars-cyan text-black font-black py-3 text-xs uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Registrar (2400 €v)</button>
            </div>
            <div class="xl:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-yellow">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">🔑 Llavero Maestro: Códigos de Empresa y PINs</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Credenciales desencriptadas para soporte directo al alumnado en el aula.</p>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        ${isCoord ? `<button id="toggle-pins-btn" onclick="ui.togglePinsVisibility()" class="min-h-[44px] bg-slate-800 border border-mars-cyan text-mars-cyan px-4 py-2 text-xs font-black uppercase hover:bg-mars-cyan hover:text-black transition-colors shrink-0">${this.pinsVisible ? '[ 🔒 Ocultar PINs ]' : '[ 👁️ Revelar PINs ]'}</button>` : ''}
                        ${isCoord ? `<button onclick="ui.generateAllCompaniesCredentialCards()" class="min-h-[44px] bg-mars-cyan/20 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black px-4 py-2 text-xs font-black uppercase transition-colors shrink-0">[🪪 TODAS LAS CREDENCIALES PDF]</button>` : ''}
                        ${isCoord ? `<button onclick="ui.exportCredentialsCSV()" class="min-h-[44px] bg-mars-yellow text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors shrink-0">[📥 Exportar Llavero CSV]</button>` : ''}
                    </div>
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-2 pr-3">Empresa</th>
                                <th class="pr-2">Clase</th>
                                <th class="pr-3 text-mars-yellow">Código Empresa</th>
                                <th class="pr-2">CEO</th>
                                <th class="pr-2">TEC</th>
                                <th class="pr-2">FIN</th>
                                <th class="pr-2">MKT</th>
                                <th class="pr-2">OP_IA</th>
                                <th class="pr-3 text-mars-green">AUX (DPTO)</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const co = state.data.companies[cid];
                                const coCode = state.getCompanyCode(co);
                                const auxPin = state.getRolePin(co, 'AUXILIAR');
                                const auxDept = co.auxRoleDept || '--';
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold pr-3"><button onclick="ui.showCompanyLogins('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 max-w-[200px] truncate inline-flex items-center" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)}</button></td>
                                    <td class="py-3 text-mars-yellow font-bold pr-2">${this.escapeHTML(co.classGroup)}</td>
                                    <td class="py-3 pr-3">
                                        ${isCoord ? `
                                        <div class="flex items-center gap-1">
                                            <input type="text" id="co-code-input-${this.escapeHTML(cid)}" aria-label="Código de empresa ${this.escapeHTML(co.name)}" maxlength="10" value="${this.escapeHTML(coCode)}" onchange="ui.updateCompanyCode('${this.escapeHTML(cid)}', this.value)" class="min-h-[44px] w-24 bg-black border border-mars-yellow text-center text-mars-yellow font-mono font-black text-base sm:text-xs p-1 outline-none uppercase disabled:opacity-50">
                                            <button id="co-code-regen-${this.escapeHTML(cid)}" onclick="ui.regenerateCompanyCode('${this.escapeHTML(cid)}')" aria-label="Regenerar código aleatorio" title="Regenerar código aleatorio" class="min-h-[44px] min-w-[44px] bg-slate-800 text-slate-200 px-2 py-1 hover:bg-mars-yellow hover:text-black transition-colors flex items-center justify-center disabled:opacity-50">🔄</button>
                                        </div>` : `<span class="text-slate-300 font-mono">***-****</span>`}
                                    </td>
                                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(rol => {
                                        const pinVal = state.getRolePin(co, rol) || '1234';
                                        return `
                                        <td class="py-3 pr-2">
                                            <div class="flex flex-col items-center gap-1.5">
                                                ${isCoord ? `<input type="${this.pinsVisible ? 'text' : 'password'}" id="pin-input-${this.escapeHTML(cid)}-${rol}" aria-label="PIN ${rol} de ${this.escapeHTML(co.name)}" maxlength="4" value="${this.escapeHTML(pinVal)}" onchange="ui.updatePIN('${this.escapeHTML(cid)}', '${rol}', this.value)" class="min-h-[44px] w-14 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base sm:text-xs p-1 outline-none focus:border-mars-yellow disabled:opacity-50">` : `<span class="text-slate-300">****</span>`}
                                                ${isCoord ? `<button onclick="ui.generateRoleCredentialCard('${this.escapeHTML(cid)}', '${rol}')" aria-label="Credencial PDF ${rol}" title="Emitir Credencial PDF ${rol}" class="min-h-[44px] w-full inline-flex items-center justify-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-mars-cyan text-slate-300 hover:text-mars-cyan px-2 py-1 rounded-sm transition-colors whitespace-nowrap">🪪 ${rol}</button>` : ''}
                                            </div>
                                        </td>`;
                                    }).join('')}
                                    <td class="py-3 pr-3">
                                        <div class="flex flex-col items-center gap-1.5">
                                            ${isCoord ? `
                                            <div class="flex items-center gap-1">
                                                <input type="${this.pinsVisible ? 'text' : 'password'}" id="pin-input-${this.escapeHTML(cid)}-AUXILIAR" aria-label="PIN AUXILIAR de ${this.escapeHTML(co.name)}" maxlength="4" placeholder="----" value="${this.escapeHTML(auxPin)}" onchange="ui.updatePIN('${this.escapeHTML(cid)}', 'AUXILIAR', this.value)" class="min-h-[44px] w-14 bg-black border ${auxPin ? 'border-mars-green text-mars-green' : 'border-slate-700 text-slate-400'} text-center font-bold text-base sm:text-xs p-1 outline-none focus:border-mars-yellow disabled:opacity-50">
                                                <span class="text-xs text-slate-300 uppercase">[${this.escapeHTML(auxDept)}]</span>
                                            </div>` : `<span class="text-slate-300">****</span>`}
                                            ${isCoord && auxPin ? `<button onclick="ui.generateRoleCredentialCard('${this.escapeHTML(cid)}', 'AUXILIAR')" aria-label="Credencial PDF AUXILIAR" title="Emitir Credencial PDF AUXILIAR" class="min-h-[44px] w-full inline-flex items-center justify-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-mars-green text-slate-300 hover:text-mars-green px-2 py-1 rounded-sm transition-colors whitespace-nowrap">🪪 AUX</button>` : ''}
                                        </div>
                                    </td>
                                    <td class="py-3">
                                        <div class="flex items-center gap-2">
                                            ${isCoord ? `<button onclick="ui.generateCompanyCredentialCards('${this.escapeHTML(cid)}')" title="Emitir todas las credenciales de flota de ${this.escapeHTML(co.name)}" class="min-h-[44px] bg-mars-cyan/20 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs px-2.5 py-1 transition-colors whitespace-nowrap">🪪 Flota PDF</button>` : ''}
                                            ${isCoord ? `<button onclick="ui.confirmAction('Eliminar Startup', '¿Borrar startup irreversiblemente?', () => ui.deleteStartup('${this.escapeHTML(cid)}'), 'Eliminar')" class="min-h-[44px] text-mars-magenta font-bold hover:underline px-2">Eliminar</button>` : `<span class="text-slate-400">Bloqueado</span>`}
                                        </div>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ${isCoord ? `<p class="text-xs text-slate-300 mt-4 uppercase">* El alumno debe introducir primero el <strong>Código de Empresa</strong> y después el <strong>PIN de 4 dígitos</strong> de su rol. Todas las claves se almacenan cifradas en el navegador.</p>` : `<p class="text-xs text-mars-magenta mt-4 uppercase">Solo Coordinación puede visualizar/modificar el Llavero Maestro o eliminar startups.</p>`}
            </div>
        </div>
        ${coordSettingsHtml}`;
    },

    togglePinsVisibility() {
        this.pinsVisible = !this.pinsVisible;
        const btn = document.getElementById('toggle-pins-btn');
        if (btn) {
            btn.innerHTML = this.pinsVisible ? '[ 🔒 Ocultar PINs ]' : '[ 👁️ Revelar PINs ]';
        }
        const pinInputs = document.querySelectorAll('input[id^="pin-input-"], input[id^="teacher-pin-"]');
        pinInputs.forEach(input => {
            input.type = this.pinsVisible ? 'text' : 'password';
        });
        this.notify(this.pinsVisible ? "PINs visibles temporalmente." : "PINs protegidos (modo contraseña).", "info");
    },

    updateDeadline(key, val) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        state.data.config.deadlines = state.data.config.deadlines || {};
        state.data.config.deadlines[key] = val;
        state.data.config.updatedAt = Date.now();
        state.save();
        this.notify("Plazo actualizado en el Cronograma Maestro.", "success");
    },

    async updateTeacherPin(tk, val) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const clean = this.cleanInput(val);
        if (!/^\d{4}$/.test(clean)) return this.notify("El PIN docente debe tener exactamente 4 dígitos numéricos.", "error");
        if (state.data.config.teachers && state.data.config.teachers[tk]) {
            const inputEl = document.getElementById(`teacher-pin-${tk}`);
            if (inputEl) inputEl.disabled = true;
            try {
                const ok = await state.updateTeacherPin(tk, clean);
                if (ok) {
                    this.notify(`✅ PIN actualizado y sincronizado en D1 para ${tk}.`, "success");
                } else {
                    this.notify(`⚠️ PIN de ${tk} guardado localmente; pendiente de sincronización D1.`, "warning");
                }
            } finally {
                if (inputEl) inputEl.disabled = false;
            }
        }
    },

    async updateCompanyCode(cid, newCode) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const clean = this.cleanInput(newCode).toUpperCase();
        if (clean.length < 4) return this.notify("Código demasiado corto.", "warning");
        const co = state.data.companies[cid];
        if (!co) return;
        const inputEl = document.getElementById(`co-code-input-${cid}`);
        if (inputEl) inputEl.disabled = true;
        try {
            const ok = await state.updateCompanyCode(cid, clean);
            this.render();
            if (ok) {
                this.notify(`✅ Código de empresa actualizado a ${clean} y sincronizado en D1.`, "success");
            } else {
                this.notify(`⚠️ Código ${clean} guardado localmente; pendiente de sincronización D1.`, "warning");
            }
        } finally {
            if (inputEl) inputEl.disabled = false;
        }
    },

    async regenerateCompanyCode(cid) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co) return;
        const newCode = state.generateCompanyCode(co.name);
        const btnEl = document.getElementById(`co-code-regen-${cid}`);
        if (btnEl) btnEl.disabled = true;
        try {
            const ok = await state.updateCompanyCode(cid, newCode);
            this.render();
            if (ok) {
                this.notify(`✅ Nuevo código ${newCode} generado y sincronizado en D1.`, "success");
            } else {
                this.notify(`⚠️ Código ${newCode} generado localmente; pendiente de D1.`, "warning");
            }
        } finally {
            if (btnEl) btnEl.disabled = false;
        }
    },

    exportCredentialsCSV() {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        let csv = "Empresa,Clase,Codigo_Empresa,PIN_CEO,PIN_TECNICO,PIN_FINANZAS,PIN_MARKETING,PIN_OPERACIONES_IA,PIN_AUXILIAR,DPTO_AUXILIAR\n";
        Object.values(state.data.companies).forEach(co => {
            const code = state.getCompanyCode(co);
            const pCeo = state.getRolePin(co, 'CEO') || '';
            const pTec = state.getRolePin(co, 'TECNICO') || '';
            const pFin = state.getRolePin(co, 'FINANZAS') || '';
            const pMkt = state.getRolePin(co, 'MARKETING') || '';
            const pOps = state.getRolePin(co, 'OPERACIONES_IA') || '';
            const pAux = state.getRolePin(co, 'AUXILIAR') || 'INACTIVO';
            const dAux = co.auxRoleDept || 'N/A';
            csv += `"${(co.name || '').replace(/"/g, '""')}","${co.classGroup || 'A'}","${code}","${pCeo}","${pTec}","${pFin}","${pMkt}","${pOps}","${pAux}","${dAux}"\n`;
        });
        this.downloadFile(csv, 'csv', 'marsket_llavero_credenciales_empresas.csv');
    },

    async resolveAuxRoleRequest(cid, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return this.notify("Solo Coordinación puede autorizar el Rol Auxiliar.", "error");
        const co = state.data.companies[cid];
        if (!co || !co.auxRoleRequest) return;

        if (isApproved) {
            const pinInput = document.getElementById(`approve-aux-pin-${cid}`);
            const finalPin = pinInput ? this.cleanInput(pinInput.value) : co.auxRoleRequest.pin;
            if (!/^\d{4}$/.test(finalPin)) return this.notify("El PIN debe tener exactamente 4 dígitos numéricos.", "error");

            if (pinInput) pinInput.disabled = true;
            co.auxRoleDept = co.auxRoleRequest.dept;
            co.auxRoleRequest.status = 'APROBADO';
            co.auxRoleRequest.pin = finalPin;

            ui.pushNotification(cid, 'CEO', `Coordinación ha APROBADO el Rol Auxiliar vinculado a ${co.auxRoleDept}. PIN de acceso activado: ${finalPin}`, 'success');
            await state.updatePin(cid, 'AUXILIAR', finalPin);
            this.notify(`✅ Rol Auxiliar activado en ${co.name} con PIN ${finalPin}.`, "success");
        } else {
            co.auxRoleRequest.status = 'RECHAZADO';
            ui.pushNotification(cid, 'CEO', `Tu solicitud de alta para el Rol Auxiliar ha sido DENEGADA por Coordinación.`, 'error');
            await state.updatePin(cid, 'AUXILIAR', '');
            this.notify(`Solicitud de Rol Auxiliar denegada para ${co.name}.`, "warning");
        }
        this.render();
    },

    renderAdminTelemetry() {
        let matRows = '';
        Object.keys(state.data.companies).forEach(cid => {
            const co = state.data.companies[cid];
            const s = co.loginStats || { totalLogins:0, roles:{} }; 
            matRows += `<tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-3 font-orbitron text-white font-bold pr-4 max-w-[220px] truncate" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)}</td>
                <td class="py-3 font-mono text-mars-cyan font-bold pr-4 text-center border-r border-mars-border/50">${s.totalLogins}</td>`;
            ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => {
                const count = s.roles[r]?.count || 0;
                const color = count > 4 ? 'text-mars-green' : (count > 0 ? 'text-mars-yellow' : 'text-mars-magenta animate-pulse');
                matRows += `<td class="py-3 font-mono ${color} text-center font-bold px-2">${count}</td>`;
            });
            matRows += `</tr>`;
        });

        const allSessions = Array.isArray(state.data.telemetry?.sessions) ? state.data.telemetry.sessions : [];
        const visibleSessions = allSessions.slice(0, 100);

        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan text-center flex flex-col justify-center">
                <p class="text-5xl font-orbitron text-mars-cyan">${state.data.telemetry.totalLogins}</p>
                <p class="text-xs text-slate-300 uppercase mt-2 font-bold tracking-widest">Logins Globales</p>
            </div>
            <div class="md:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Matriz de Conexiones por Departamento</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Startup</th><th class="pr-4 text-center border-r border-mars-border/50">Total</th><th class="text-center px-2">CEO</th><th class="text-center px-2">TEC</th><th class="text-center px-2">FIN</th><th class="text-center px-2">MKT</th><th class="text-center px-2">OP_IA</th></tr></thead>
                        <tbody>${matRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="terminal-border bg-mars-card p-6 overflow-y-auto max-h-[400px]">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h3 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Registro Táctico de Sesiones (Últimas 100)</h3>
                ${allSessions.length > 100 ? `<span class="text-xs text-slate-300 font-mono">Mostrando 100 de ${allSessions.length} sesiones</span>` : ''}
            </div>
            <div class="space-y-4">
                ${visibleSessions.map(sess => `
                <div class="border border-mars-border/50 bg-slate-900/30 p-3 text-xs">
                    <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2 flex-wrap gap-2">
                        <span class="text-mars-cyan font-bold uppercase break-words">${this.escapeHTML(sess.entity)} | ${this.escapeHTML((sess.role || '').replace('_',' '))}</span>
                        <span class="text-xs text-slate-300 bg-black px-2 py-0.5">${this.escapeHTML((sess.timestamp || '').replace('T',' ').slice(0,19))}</span>
                    </div>
                    <ul class="text-slate-200 space-y-1">
                        ${(sess.events || []).map(ev => `<li class="flex gap-2 flex-wrap"><span class="text-mars-yellow shrink-0">[${this.escapeHTML(ev.time)}]</span><span class="font-bold text-white shrink-0">${this.escapeHTML(ev.action)}:</span><span class="text-slate-300 break-words">${this.escapeHTML(ev.details)}</span></li>`).join('') || '<li class="text-slate-300 italic">Sesión sin eventos clave.</li>'}
                    </ul>
                </div>`).join('') || '<p class="text-slate-300 text-xs italic">No hay datos de telemetría.</p>'}
            </div>
        </div>`;
    },

    renderAdminHR() {
        let allReports = [];
        Object.keys(state.data.companies).forEach(cid => {
            const co = state.data.companies[cid];
            (co.inactivityReports || []).forEach(r => allReports.push({...r, cid, coName: co.name}));
        });
        allReports.sort((a,b) => b.id.localeCompare(a.id));

        let pendingHR = allReports.filter(r => r.status === 'PENDIENTE').length;

        let reportsHtml = '';
        if (allReports.length === 0) {
            reportsHtml = '<p class="text-slate-300 text-xs italic">No hay reportes de inactividad activos en toda la flota.</p>';
        } else {
            reportsHtml = allReports.map(r => `
                <div class="bg-slate-900/50 border ${r.status === 'PENDIENTE' ? 'border-mars-magenta' : 'border-mars-green/50'} p-4 text-xs mb-4 transition-colors w-full">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-2 mb-3 gap-2">
                        <span class="font-bold text-white uppercase text-sm break-words">${this.escapeHTML(r.coName)}</span>
                        <span class="text-xs text-slate-300 bg-black px-2 py-1">${this.escapeHTML(r.date)}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between mb-3 gap-2 bg-black/50 p-2 border border-mars-border/30">
                        <span class="text-mars-magenta font-bold uppercase">🚨 Reportado: ${this.escapeHTML(r.reportedDept)}</span>
                        <span class="text-slate-300 uppercase">Emisor: ${this.escapeHTML((r.reportingRole || '').replace('_', ' '))}</span>
                    </div>
                    <p class="text-slate-200 italic bg-black p-3 border border-slate-800 mb-3 leading-relaxed break-words">"${this.escapeHTML(r.reason)}"</p>
                    <div class="flex justify-between items-center mt-2 border-t border-slate-800 pt-3 flex-wrap gap-2">
                        <span class="text-xs font-bold uppercase ${r.status === 'PENDIENTE' ? 'text-mars-magenta animate-pulse' : 'text-mars-green'}">[ESTADO: ${this.escapeHTML(r.status)}]</span>
                        ${r.status === 'PENDIENTE' ? `<button onclick="ui.resolveInactivityReport('${this.escapeHTML(r.cid)}', '${this.escapeHTML(r.id)}')" class="min-h-[44px] bg-mars-magenta/20 text-mars-magenta border border-mars-magenta px-4 py-2 font-bold uppercase hover:bg-mars-magenta hover:text-white transition-colors">Marcar Resuelto por Claustro</button>` : ''}
                    </div>
                </div>
            `).join('');
        }

        return `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
            <div class="flex justify-between items-center mb-6 border-b border-mars-border/50 pb-4 flex-wrap gap-2">
                <h3 class="font-orbitron text-mars-magenta text-lg uppercase tracking-widest">Gestión de Alertas HR (Recursos Humanos)</h3>
                <span class="bg-mars-magenta/10 text-mars-magenta border border-mars-magenta px-3 py-1 font-bold text-xs">${pendingHR} Pendientes</span>
            </div>
            <p class="text-xs text-slate-300 mb-6 uppercase leading-relaxed">Panel centralizado para la mediación de conflictos interdepartamentales y bloqueos operativos reportados por los alumnos.</p>
            <div class="space-y-2">
                ${reportsHtml}
            </div>
        </div>`;
    },

    resolveInactivityReport(cid, repId) {
        return this.resolveHRReport(cid, repId);
    },

    resolveHRReport(cid, repId) {
        const co = state.data.companies[cid];
        if (!co || !Array.isArray(co.inactivityReports)) return;
        const rep = co.inactivityReports.find(r => r.id === repId);
        if (rep) {
            rep.status = 'RESUELTO';
            state.save();
            this.notify("Reporte HR marcado como resuelto por el Claustro.", "success");
            this.render();
        }
    },

    renderAdminCatalog() {
        const cat = Array.isArray(state.data.catalog) ? state.data.catalog : [];

        return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Añadir Nuevo Artículo</h3>
                <label for="new-cat-id" class="text-xs text-slate-300 uppercase font-bold block mb-1">ID Artículo</label>
                <input type="text" id="new-cat-id" placeholder="ID (Ej: F06)" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <label for="new-cat-name" class="text-xs text-slate-300 uppercase font-bold block mb-1">Nombre Completo</label>
                <input type="text" id="new-cat-name" placeholder="Nombre completo" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <label for="new-cat-price" class="text-xs text-slate-300 uppercase font-bold block mb-1">Precio (€v)</label>
                <input type="number" id="new-cat-price" placeholder="Precio (€v)" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <label for="new-cat-unit" class="text-xs text-slate-300 uppercase font-bold block mb-1">Unidad de Medida</label>
                <input type="text" id="new-cat-unit" placeholder="Unidad (Ej: Unidad, Gramo)" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <label for="new-cat-category" class="text-xs text-slate-300 uppercase font-bold block mb-1">Categoría</label>
                <select id="new-cat-category" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <option value="Fuselaje">Fuselaje</option>
                    <option value="Propulsión">Propulsión</option>
                    <option value="Aerodinámica">Aerodinámica</option>
                    <option value="Sellado">Sellado</option>
                    <option value="Externo">Externo</option>
                </select>
                <label for="new-cat-origin" class="text-xs text-slate-300 uppercase font-bold block mb-1">Origen</label>
                <input type="text" id="new-cat-origin" placeholder="Origen (Ej: España)" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                <button onclick="ui.addCatalogItem()" class="min-h-[44px] w-full bg-mars-cyan text-black font-black py-3 text-xs uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Añadir al Catálogo</button>
            </div>
            <div class="lg:col-span-2 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Gestión de Precios y Catálogo Global</h3>
                    <span class="text-xs text-slate-300 font-mono">${cat.length} Artículos Registrados</span>
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-2 pr-4">ID</th>
                                <th class="pr-4">Nombre</th>
                                <th class="pr-4">Categoría</th>
                                <th class="pr-4">Unidad / Origen</th>
                                <th class="pr-4">Precio (€v)</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cat.map((item, idx) => `
                            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                <td class="py-2 text-slate-300 font-mono pr-4">${this.escapeHTML(item.id)}</td>
                                <td class="py-2 font-bold text-white pr-4 uppercase break-words">${this.escapeHTML(item.name)}</td>
                                <td class="py-2 text-mars-cyan uppercase pr-4">${this.escapeHTML(item.category)}</td>
                                <td class="py-2 text-slate-300 pr-4">${this.escapeHTML(item.unit || 'Ud')} (${this.escapeHTML(item.origin || '--')})</td>
                                <td class="py-2 pr-4">
                                    <input type="number" id="price-${this.escapeHTML(item.id)}" data-cat-idx="${idx}" aria-label="Precio de ${this.escapeHTML(item.name)}" value="${item.price}" step="0.5" min="0" onchange="ui.updateCatalogPrice(${idx}, this.value)" class="min-h-[44px] w-24 bg-black border border-mars-border text-center text-mars-green font-mono font-bold p-1 outline-none focus:border-mars-yellow">
                                </td>
                                <td class="py-2">
                                    <div class="flex items-center gap-2">
                                        <button onclick="ui.saveCatalogPrice('${this.escapeHTML(item.id)}', ${idx})" aria-label="Guardar precio de ${this.escapeHTML(item.name)}" class="min-h-[44px] bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/50 px-3 py-1.5 font-bold hover:bg-mars-yellow hover:text-black transition-colors">Guardar</button>
                                        <button onclick="ui.deleteCatalogItem('${this.escapeHTML(item.id)}')" aria-label="Eliminar ${this.escapeHTML(item.name)}" class="min-h-[44px] min-w-[44px] text-mars-magenta font-bold px-2.5 py-1.5 border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors" title="Eliminar artículo del catálogo">✕</button>
                                    </div>
                                </td>
                            </tr>
                            `).join('') || `<tr><td colspan="6" class="py-4 text-center text-slate-400 italic">No hay artículos en el catálogo.</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500 mt-6">
            <h3 class="font-orbitron text-blue-400 text-xs mb-4 uppercase tracking-widest">Solicitudes de Material Externo / I+D</h3>
            <div class="space-y-3">
                ${(state.data.pendingCustom || []).map(p => `
                <div class="bg-slate-900 border border-mars-border p-3 flex justify-between items-center text-xs flex-wrap gap-2">
                    <div class="flex-grow min-w-[200px]"><p class="text-mars-yellow font-bold uppercase">${this.escapeHTML(state.data.companies[p.company]?.name || 'Desconocida')}</p><p class="text-white font-bold text-xs uppercase break-words">${this.escapeHTML(p.name)}</p><p class="text-slate-300 italic break-words">"${this.escapeHTML(p.reason)}"</p></div>
                    <div class="flex gap-2 items-center flex-shrink-0">
                        <input type="number" id="val-price-${this.escapeHTML(p.id)}" aria-label="Precio €v" class="min-h-[44px] w-20 bg-black border border-mars-border p-2 text-mars-green text-center font-bold" placeholder="€v">
                        <button onclick="ui.teacherValidate('${this.escapeHTML(p.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 font-black hover:bg-white transition-colors">OK</button>
                        <button onclick="ui.teacherValidate('${this.escapeHTML(p.id)}', false)" class="min-h-[44px] text-mars-magenta font-bold px-3 py-2 border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors">X</button>
                    </div>
                </div>`).join('') || '<p class="text-slate-300 text-xs italic">Nada pendiente.</p>'}
            </div>
        </div>`;
    },

    saveCatalogPrice(itemId, idx) {
        let p = NaN;
        const el = document.getElementById(`price-${itemId}`) || (idx !== undefined ? document.querySelector(`input[data-cat-idx="${idx}"]`) : null);
        if (el) {
            p = parseFloat(el.value);
        }
        if (isNaN(p) || p < 0) return this.notify("Precio inválido. Debe ser un número mayor o igual a 0.", "error");

        if (!Array.isArray(state.data.catalog)) state.data.catalog = [];
        let item = null;
        if (idx !== undefined && state.data.catalog[idx] && String(state.data.catalog[idx].id) === String(itemId)) {
            item = state.data.catalog[idx];
        } else {
            item = state.data.catalog.find(i => String(i.id) === String(itemId));
        }

        if (item) {
            item.price = p;
            state.save();
            this.notify(`Precio de "${item.name}" actualizado a ${p} €v.`, "success");
            this.render();
        } else {
            this.notify("Artículo no encontrado en el catálogo.", "error");
        }
    },

    updateCatalogPrice(idx, val) {
        const p = parseFloat(val);
        if (isNaN(p) || p < 0) return;
        if (state.data.catalog && state.data.catalog[idx]) {
            state.data.catalog[idx].price = p;
            state.save();
        }
    },

    deleteCatalogItem(target) {
        if (!Array.isArray(state.data.catalog)) return;
        let idx = -1;
        if (typeof target === 'number') {
            idx = target;
        } else if (typeof target === 'string') {
            idx = state.data.catalog.findIndex(i => String(i.id) === target);
            if (idx === -1 && !isNaN(parseInt(target, 10)) && String(parseInt(target, 10)) === target) {
                const numericIdx = parseInt(target, 10);
                if (numericIdx >= 0 && numericIdx < state.data.catalog.length) {
                    idx = numericIdx;
                }
            }
        }
        if (idx >= 0 && idx < state.data.catalog.length) {
            const removed = state.data.catalog.splice(idx, 1)[0];
            state.save();
            this.notify(`Artículo "${removed?.name || idx}" purgado del catálogo.`, "info");
            this.render();
        } else {
            this.notify("No se pudo localizar el artículo a eliminar.", "error");
        }
    },

    addCatalogItem() {
        const elId = document.getElementById('new-cat-id');
        const elName = document.getElementById('new-cat-name');
        const elPrice = document.getElementById('new-cat-price');
        const elUnit = document.getElementById('new-cat-unit');
        const elCat = document.getElementById('new-cat-category');
        const elOrigin = document.getElementById('new-cat-origin');

        if (!elId || !elName || !elPrice || !elUnit || !elCat || !elOrigin) return;

        const id = this.cleanInput(elId.value).toUpperCase() || ('X' + Math.floor(10+Math.random()*89));
        const name = this.cleanInput(elName.value);
        const price = parseFloat(elPrice.value);
        const unit = this.cleanInput(elUnit.value);
        const category = elCat.value;
        const origin = this.cleanInput(elOrigin.value);

        if(!id || !name || isNaN(price) || !unit || !origin) return this.notify("Rellene todos los campos correctamente.", "warning");
        if(state.data.catalog.find(i => i.id === id)) return this.notify("El ID ya existe en el catálogo.", "error");

        state.data.catalog.push({ id, name, price, unit, category, origin });
        state.save();
        this.notify("Artículo añadido al catálogo global.", "success");
        this.render();
    },

    teacherValidate(pid, ok) {
        const reqIdx = state.data.pendingCustom.findIndex(p => p.id == pid);
        if (reqIdx === -1) return;
        
        const req = state.data.pendingCustom[reqIdx];
        const coId = req.company;
        
        if(ok) {
            const elPrice = document.getElementById(`val-price-${pid}`);
            if (!elPrice) return;
            const price = parseFloat(elPrice.value);
            if(!price) return this.notify("Falta precio €v.", "warning");
            
            state.data.catalog.unshift({ 
                id: 'CUST-' + pid, 
                name: `[ESP] ${req.name}`, 
                price: price, 
                unit: 'Especial', 
                category: 'Externo',
                origin: 'I+D Local',
                exclusiveFor: coId
            });
            
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial "${req.name}" ha sido APROBADA e integrada al catálogo por ${price} €v.`, 'success');
        } else {
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial "${req.name}" ha sido DENEGADA por el Claustro.`, 'error');
        }
        
        state.data.pendingCustom.splice(reqIdx, 1); 
        state.save(); 
        this.render();
    },

    createStartup() {
        const elName = document.getElementById('new-co-name');
        const elCap = document.getElementById('new-co-cap');
        const elClass = document.getElementById('new-co-class');
        if (!elName || !elCap || !elClass) return;
        
        const name = this.cleanInput(elName.value);
        const cap = parseFloat(elCap.value);
        const classGroup = elClass.value || 'A';
        
        if(!name || isNaN(cap)) return this.notify("Datos inválidos.", "warning");
        if(ui.hasForbiddenWords(name, 'Creación Startup', elName)) return;

        const cid = 'co_' + Date.now();
        const generatedCode = state.generateCompanyCode(name);

        const newCo = { 
            name, balance: cap, logo: null, sponsorAwarded: null, sponsorData: {name: null, logo: null}, valueProposition: "", slogan: "", classGroup,
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" },
            auxRoleRequest: { status: 'INACTIVO', dept: '', pin: '' },
            roles: {}, authVault: { code: '', roles: {} },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            loginStats: { totalLogins: 0, roles: { CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0} } },
            deliverables: {}
        };

        state.setCompanyCode(newCo, generatedCode);
        ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => state.setRolePin(newCo, r, '1234'));

        state.data.companies[cid] = newCo;
        state.save(); 
        this.notify(`Startup "${name}" creada. Código Privado: ${generatedCode}`, "success");
        this.render();
    },

    deleteStartup(cid) { 
        delete state.data.companies[cid]; 
        state.save(); 
        this.render(); 
    },

    async updatePIN(coId, role, val) { 
        if(!state.user || !state.user.role.startsWith('COORD')) return this.notify("Solo Coordinación puede modificar PINs.", "error");
        const clean = this.cleanInput(val);
        const inputEl = document.getElementById(`pin-input-${coId}-${role}`);
        if (role === 'AUXILIAR' && clean === '') {
            const co = state.data.companies[coId];
            if (co) {
                if (inputEl) inputEl.disabled = true;
                try {
                    const ok = await state.updatePin(coId, 'AUXILIAR', '');
                    this.render();
                    if (ok) this.notify(`✅ Rol Auxiliar desactivado en ${co.name} y sincronizado en D1.`, "success");
                    else this.notify(`⚠️ Rol Auxiliar desactivado localmente en ${co.name}.`, "warning");
                } finally {
                    if (inputEl) inputEl.disabled = false;
                }
            }
            return;
        }
        if(!/^\d{4}$/.test(clean)) return this.notify("El PIN debe tener exactamente 4 dígitos numéricos.", "error"); 
        const co = state.data.companies[coId];
        if (co) {
            if (inputEl) inputEl.disabled = true;
            try {
                const ok = await state.updatePin(coId, role, clean);
                if (ok) {
                    this.notify(`✅ PIN de ${role} (${co.name}) actualizado a ${clean} y sincronizado en D1.`, "success");
                } else {
                    this.notify(`⚠️ PIN de ${role} (${co.name}) guardado localmente; pendiente de D1.`, "warning");
                }
            } finally {
                if (inputEl) inputEl.disabled = false;
            }
        }
    },

    showCompanyLogins(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const s = co.loginStats || { totalLogins: 0, roles: {} };
        
        let html = `
        <div class="space-y-4">
            <div class="bg-slate-900 p-4 border border-mars-cyan text-center">
                <p class="text-xs text-slate-300 uppercase font-bold mb-1">Total Conexiones</p>
                <p class="text-3xl font-orbitron text-mars-cyan">${s.totalLogins}</p>
            </div>
            <div class="overflow-x-auto max-w-full">
                <table class="w-full text-left text-xs whitespace-nowrap">
                    <thead class="text-slate-300 uppercase border-b border-mars-border">
                        <tr><th class="py-2">Rol</th><th class="text-right">Logins</th></tr>
                    </thead>
                    <tbody>
                        ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA','AUXILIAR'].map(r => `
                        <tr class="border-b border-mars-border/30">
                            <td class="py-2 font-bold text-white">${this.escapeHTML(r)}</td>
                            <td class="py-2 text-right font-mono text-mars-yellow">${s.roles[r]?.count || 0}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>
            </div>
        </div>`;
        this.showModal(`Auditoría Conexiones: ${this.escapeHTML(co.name)}`, html, "");
    },

    resolveSecurityIncident(id) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const inc = (state.data.securityIncidents || []).find(i => i.id === id);
        if (inc) {
            inc.resolved = true;
            state.save();
            this.render();
        }
    },

    promptDenyBrand(cid) {
        const html = `<label for="deny-brand-reason" class="text-xs text-slate-300 uppercase font-bold block mb-2">Motivo del rechazo</label><input type="text" id="deny-brand-reason" class="min-h-[44px] w-full bg-black border border-mars-magenta p-3 text-base sm:text-xs text-white outline-none focus:border-mars-magenta" placeholder="Motivo del rechazo (Filtro léxico, plagio, no apto...)...">`;
        const btn = `<button onclick="ui.finalizeDenyBrand('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-magenta text-white px-6 py-2 text-xs font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Confirmar Rechazo</button>`;
        this.showModal("Rechazar Identidad Corporativa", html, btn);
    },

    finalizeDenyBrand(cid) {
        const el = document.getElementById('deny-brand-reason');
        if(!el) return;
        const reason = this.cleanInput(el.value);
        if(!reason) return this.notify("Debes especificar un motivo para el rechazo.", "warning");

        const co = state.data.companies[cid];
        if(!co || !co.brandApproval) return;

        co.brandApproval.status = 'RECHAZADO';
        co.brandApproval.feedback = reason;
        co.brandApproval.updatedAt = Date.now();
        co.updatedAt = Date.now();

        ui.pushNotification(cid, 'MARKETING', `Tu propuesta de marca (Logo/Eslogan) ha sido RECHAZADA por Coordinación. Motivo: ${reason}`, 'error');
        ui.pushNotification(cid, 'CEO', `Propuesta de identidad corporativa rechazada. Revisa el panel de Marketing.`, 'error');

        state.save();
        this.closeModal();
        this.render();
    },

    resolveBrandApproval(cid) {
        const co = state.data.companies[cid];
        if(!co || !co.brandApproval) return;

        if(co.brandApproval.pendingLogo) co.logo = co.brandApproval.pendingLogo;
        if(co.brandApproval.pendingSlogan !== undefined) co.slogan = co.brandApproval.pendingSlogan;

        co.brandApproval.status = 'APROBADO';
        co.brandApproval.pendingLogo = null;
        co.brandApproval.pendingSlogan = "";
        co.brandApproval.feedback = "";
        co.brandApproval.updatedAt = Date.now();
        co.updatedAt = Date.now();

        ui.pushNotification(cid, 'MARKETING', `¡Enhorabuena! Tu logotipo y eslogan han sido APROBADOS por Coordinación y ya son públicos en el HUD.`, 'success');
        ui.pushNotification(cid, 'CEO', `Identidad corporativa aprobada y visible para toda la flota.`, 'success');

        state.save();
        this.notify(`Identidad corporativa de ${co.name} aprobada y publicada.`, "success");
        this.render();
    },

    resolveB2BContract(contractId, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return this.notify("Solo Coordinación puede operar la Aduana B2B.", "error");
        state.data.b2bContracts = state.data.b2bContracts || [];
        
        const c = state.data.b2bContracts.find(x => x.id === contractId);
        if (!c || c.status !== 'PENDIENTE_ADUANA') return this.notify("Contrato no válido o ya procesado.", "warning");

        const sellerCo = state.data.companies[c.sellerCoId];
        const buyerCo = state.data.companies[c.buyerCoId];
        const price = parseFloat(c.price) || 0;

        if (isApproved) {
            c.status = 'APROBADO';

            if (sellerCo) {
                state.addToLedger(c.sellerCoId, `[VENTA B2B APROBADA] Traspaso de ${c.itemName} a ${c.buyerName}`, 'ADUANA_B2B', price);
                
                if (c.sourceOrderKey && sellerCo.orders) {
                    const [ordId, itemIdx] = c.sourceOrderKey.split('-');
                    const ord = sellerCo.orders.find(o => String(o.id) === String(ordId));
                    if (ord && ord.items && ord.items[Number(itemIdx)]) {
                        ord.items[Number(itemIdx)].b2bStatus = 'VENDIDO';
                    }
                }
                ui.pushNotification(c.sellerCoId, 'TECNICO', `Aduana B2B aprobó la venta de "${c.itemName}". Ingreso: +${price.toFixed(2)} €v.`, 'success');
            }

            if (buyerCo) {
                buyerCo.orders = buyerCo.orders || [];
                buyerCo.orders.unshift({
                    id: 'B2B-' + Date.now().toString().slice(-4),
                    items: [{
                        id: 'B2B-ITEM',
                        name: `[B2B] ${c.itemName}`,
                        qty: c.qty || 1,
                        price: price,
                        category: c.category || 'B2B',
                        realEur: 0,
                        realShop: `B2B (${c.sellerName})`
                    }],
                    total: price,
                    justification: `Adquisición en Mercado Secundario B2B a ${c.sellerName}.`,
                    status: 'EJECUTADO',
                    date: new Date().toLocaleString()
                });
                ui.pushNotification(c.buyerCoId, 'TECNICO', `¡Aduana B2B autorizó tu compra! "${c.itemName}" está en tu Inventario.`, 'success');
            }

            state.save();
            this.notify(`Traspaso B2B #${c.id} aprobado.`, "success");
        } else {
            c.status = 'RECHAZADO';

            if (buyerCo) {
                state.addToLedger(c.buyerCoId, `[REEMBOLSO ADUANA B2B] Contrato rechazado: ${c.itemName}`, 'ADUANA_B2B', price);
                ui.pushNotification(c.buyerCoId, 'FINANZAS', `Aduana B2B rechazó el contrato #${c.id}. Reembolso: +${price.toFixed(2)} €v.`, 'warning');
            }

            if (sellerCo && c.sourceOrderKey && sellerCo.orders) {
                const [ordId, itemIdx] = c.sourceOrderKey.split('-');
                const ord = sellerCo.orders.find(o => String(o.id) === String(ordId));
                if (ord && ord.items && ord.items[Number(itemIdx)]) {
                    delete ord.items[Number(itemIdx)].b2bStatus;
                }
                ui.pushNotification(c.sellerCoId, 'TECNICO', `Aduana B2B denegó la venta de "${c.itemName}". Vuelve a tu inventario.`, 'warning');
            }

            state.save();
            this.notify(`Contrato B2B #${c.id} rechazado. Fondos reembolsados.`, "warning");
        }
        this.render();
    },

    modalVirtualSpend(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const expenses = (co.ledger || []).filter(l => l.delta < 0);
        const total = expenses.reduce((s, l) => s + Math.abs(Number(l.delta) || 0), 0);

        const rowsHtml = expenses.slice(0, 100).map(e => `
            <tr class="border-b border-slate-800">
                <td class="py-2 pr-2 text-slate-300 text-xs">${this.escapeHTML(e.date)}</td>
                <td class="py-2 pr-2 text-white font-bold text-xs break-words">${this.escapeHTML(e.concept)}</td>
                <td class="py-2 pr-2 text-mars-cyan text-xs uppercase">${this.escapeHTML(e.dept)}</td>
                <td class="py-2 text-right font-mono text-mars-magenta font-bold text-xs">${Number(e.delta).toFixed(2)} €v</td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="py-4 text-center text-slate-300 text-xs italic">Esta startup no registra salidas de capital virtual.</td></tr>`;

        const html = `
            <div class="bg-slate-900 border border-mars-cyan p-3 mb-4 flex justify-between items-center">
                <span class="text-xs text-slate-200 uppercase font-bold">Total Gasto Virtual Acumulado:</span>
                <span class="text-lg font-orbitron text-mars-magenta font-black">-${total.toFixed(2)} €v</span>
            </div>
            <div class="max-h-72 overflow-y-auto pr-1 overflow-x-auto max-w-full">
                <table class="w-full text-left">
                    <thead class="text-xs text-slate-300 uppercase border-b border-mars-border">
                        <tr><th class="py-1">Fecha</th><th>Concepto</th><th>Dpto</th><th class="text-right">Importe</th></tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        `;
        this.showModal(`Auditoría de Gasto Virtual: ${this.escapeHTML(co.name)}`, html, "");
    },

    modalAssignSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return;

        const currentTier = co.sponsorAwarded || 'ORO';
        const currentName = co.sponsorData?.name || '';

        const html = `
            <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Inyecta capital virtual de patrocinio (Fase I) y personaliza la marca patrocinadora.</p>
            <div class="space-y-3">
                <div>
                    <label for="sp-tier" class="text-xs text-mars-yellow uppercase font-bold block mb-1">Nivel de Patrocinio</label>
                    <select id="sp-tier" onchange="const v=this.value; document.getElementById('sp-amount').value = (v==='ORO'?500:(v==='PLATA'?400:250));" class="min-h-[44px] w-full bg-slate-900 border border-mars-yellow p-2.5 text-xs text-white font-bold uppercase outline-none">
                        <option value="ORO" ${currentTier==='ORO'?'selected':''}>🥇 Nivel ORO (+500 €v sugerido)</option>
                        <option value="PLATA" ${currentTier==='PLATA'?'selected':''}>🥈 Nivel PLATA (+400 €v sugerido)</option>
                        <option value="BRONCE" ${currentTier==='BRONCE'?'selected':''}>🥉 Nivel BRONCE (+250 €v sugerido)</option>
                    </select>
                </div>
                <div>
                    <label for="sp-amount" class="text-xs text-mars-green uppercase font-bold block mb-1">Inyección Económica al Ledger (€v)</label>
                    <input type="number" id="sp-amount" value="500" step="50" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label for="sp-name" class="text-xs text-mars-cyan uppercase font-bold block mb-1">Nombre de la Corporación Patrocinadora</label>
                    <input type="text" id="sp-name" value="${this.escapeHTML(currentName)}" placeholder="Ej: SpaceX, PLD Space..." class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none">
                </div>
                <div>
                    <label for="sp-logo" class="text-xs text-mars-cyan uppercase font-bold block mb-1">Logotipo del Patrocinador (Opcional, PNG/JPG &lt; 1MB)</label>
                    <input type="file" id="sp-logo" accept="image/png, image/jpeg" class="min-h-[44px] text-xs text-slate-300 w-full">
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.confirmAssignSponsor('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2 text-xs font-black uppercase hover:bg-white transition-all">Conceder Patrocinio</button>`;
        this.showModal(`Asignar Patrocinio: ${this.escapeHTML(co.name)}`, html, actions);
    },

    confirmAssignSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return;

        const elTier = document.getElementById('sp-tier');
        const elAmount = document.getElementById('sp-amount');
        const elName = document.getElementById('sp-name');
        const elLogo = document.getElementById('sp-logo');
        if (!elTier || !elAmount || !elName) return;

        const tier = elTier.value;
        const amount = parseFloat(elAmount.value) || 0;
        const spName = this.cleanInput(elName.value) || 'Inversor Institucional';
        const file = elLogo && elLogo.files ? elLogo.files[0] : null;

        const finalizeSponsor = (logoDataUrl) => {
            co.sponsorAwarded = tier;
            co.sponsorData = { name: spName, logo: logoDataUrl !== undefined ? logoDataUrl : (co.sponsorData?.logo || null) };

            if (amount !== 0) state.addToLedger(cid, `[PATROCINIO ${tier}] Inyección de capital por ${spName}`, 'DIRECCIÓN_AEE', amount);

            ui.pushNotification(cid, 'CEO', `¡Habéis obtenido el Patrocinio ${tier} de ${spName} (+${amount} €v)!`, 'success');
            state.save();
            this.closeModal();
            this.render();
        };

        if (file) {
            if (file.size > 1024 * 1024) return this.notify("El logo no debe superar 1MB.", "error");
            const reader = new FileReader();
            reader.onload = (ev) => finalizeSponsor(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            finalizeSponsor(undefined);
        }
    },

    promptRenameStartup(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const html = `
            <p class="text-xs text-slate-300 mb-4 leading-relaxed uppercase">Modifica la denominación social oficial de esta startup forzosamente. El historial contable y rúbricas se mantendrán intactos.</p>
            <label for="rename-startup-input" class="text-xs text-mars-yellow uppercase font-bold block mb-1">Nueva Denominación Social</label>
            <input type="text" id="rename-startup-input" value="${this.escapeHTML(co.name)}" class="min-h-[44px] w-full bg-black border border-mars-yellow p-3 text-base sm:text-xs text-mars-yellow font-orbitron font-bold uppercase outline-none focus:border-white">
        `;
        const actions = `<button onclick="ui.finalizeRenameStartup('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-white transition-all">Forzar Cambio</button>`;
        this.showModal(`Renombrar: ${this.escapeHTML(co.name)}`, html, actions);
    },

    finalizeRenameStartup(cid) {
        const el = document.getElementById('rename-startup-input');
        if (!el) return;
        const newName = this.cleanInput(el.value);
        if (newName.length < 3) return this.notify("El nombre debe tener al menos 3 caracteres.", "warning");
        
        if (ui.hasForbiddenWords && ui.hasForbiddenWords(newName, 'Edición Nombre Empresa', el)) return;

        const co = state.data.companies[cid];
        if (!co) return;
        co.name = newName;
        
        ui.pushNotification(cid, 'CEO', `Coordinación ha forzado el cambio de denominación social a "${newName}".`, 'warning');
        state.save();
        this.closeModal();
        this.render();
    },

    resolveNameChangeRequest(cid, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co || !co.nameChangeRequest || co.nameChangeRequest.status !== 'PENDIENTE') return;

        if (isApproved) {
            const oldName = co.name;
            co.name = co.nameChangeRequest.proposedName;
            ui.pushNotification(cid, 'CEO', `¡El Registro Mercantil ha aprobado vuestra nueva denominación social: "${co.name}"!`, 'success');
            this.notify(`La empresa ${oldName} ahora se llama ${co.name}.`, "success");
        } else {
            ui.pushNotification(cid, 'CEO', `El Registro Mercantil ha RECHAZADO la solicitud de cambio a "${co.nameChangeRequest.proposedName}".`, 'error');
            this.notify(`Solicitud de renombramiento denegada.`, "warning");
        }
        
        co.nameChangeRequest.status = isApproved ? 'APROBADO' : 'RECHAZADO';
        co.nameChangeRequest.resolvedAt = Date.now();
        co.nameChangeRequest.updatedAt = Date.now();
        co.updatedAt = Date.now();
        state.save(cid);
        this.render();
    },

    modalAEEFine(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const agency = REGULATORY_AGENCIES[state.user.role] || "Agencia Reguladora Central";
        const html = `
            <div class="space-y-4">
                <div class="bg-mars-magenta/10 border border-mars-magenta p-3 text-center mb-4">
                    <p class="text-xs text-mars-magenta uppercase font-bold tracking-widest">Organismo Sancionador Competente</p>
                    <p class="text-white font-bold text-xs uppercase mt-1">${this.escapeHTML(agency)}</p>
                </div>
                <div>
                    <label for="aee-article" class="text-xs text-mars-magenta uppercase font-bold block mb-1">Infracción Tipificada</label>
                    <select id="aee-article" class="min-h-[44px] w-full bg-slate-900 border border-mars-magenta/50 p-2.5 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="Art. 09: Uso de lenguaje prohibido o vulneración del filtro léxico">Art. 09: Infracción Filtro Léxico</option>
                        <option value="Art. 12: Incumplimiento de cronograma y plazos oficiales">Art. 12: Incumplimiento Plazos</option>
                        <option value="Art. 18: Inconsistencia o defecto en justificación técnica/química">Art. 18: Defecto Técnico</option>
                        <option value="Art. 24: Anomalía en balance o trazabilidad contable">Art. 24: Anomalía Contable</option>
                        <option value="Art. 31: Falta de rigor en protocolo de seguridad de vuelo">Art. 31: Brecha Seguridad Vuelo</option>
                    </select>
                </div>
                <div>
                    <label for="aee-reason" class="text-xs text-mars-magenta uppercase font-bold block mb-1">Dictamen del Inspector</label>
                    <textarea id="aee-reason" class="w-full bg-slate-900 border border-mars-magenta/50 p-2.5 text-base sm:text-xs text-white h-20 outline-none focus:border-mars-magenta" placeholder="Describa el motivo específico de la sanción..."></textarea>
                </div>
                <div>
                    <label for="aee-amount" class="text-xs text-mars-magenta uppercase font-bold block mb-1">Cuantía de la Multa</label>
                    <select id="aee-amount" class="min-h-[44px] w-full bg-slate-900 border border-mars-magenta/50 p-2.5 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="-10">-10 €v (Leve)</option>
                        <option value="-100">-100 €v (Moderada)</option>
                        <option value="-200">-200 €v (Grave)</option>
                    </select>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitAEEFine('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-red-800 text-white px-6 py-2 text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_10px_red]">Tramitar Expediente</button>`;
        this.showModal(`EXPEDIENTE DISCIPLINARIO: ${this.escapeHTML(co.name)}`, html, actions);
    },

    submitAEEFine(cid) {
        const elArticle = document.getElementById('aee-article');
        const elReason = document.getElementById('aee-reason');
        const elAmount = document.getElementById('aee-amount');
        if (!elArticle || !elReason || !elAmount) return;
        
        const article = elArticle.value;
        const reason = this.cleanInput(elReason.value);
        const amount = parseFloat(elAmount.value);
        if(!reason) return this.notify("El dictamen del inspector es obligatorio.", "warning");
        
        const co = state.data.companies[cid];
        if (!co) return;
        
        const agency = REGULATORY_AGENCIES[state.user.role] || "Agencia Reguladora Central";
        
        co.sanctions = co.sanctions || [];
        co.crisisAlerts = co.crisisAlerts || [];
        
        const sanctionObj = {
            id: 'SANC-' + Date.now(),
            date: new Date().toLocaleString(),
            agency: agency,
            article: article,
            reason: reason,
            amount: amount
        };
        
        co.sanctions.unshift(sanctionObj);
        co.crisisAlerts.unshift({ ...sanctionObj, read: false });
        
        const concept = `[MULTA] ${agency} - ${article}`;
        state.addToLedger(cid, concept, 'DOCENTE_AEE', amount);
        
        ui.pushNotification(cid, 'CEO', `NUEVA SANCIÓN RECIBIDA (${amount} €v). Revisa la Ventanilla Legal urgentemente.`, 'error');
        
        this.closeModal();
        this.render();
    },

    getRoleMetadata(role) {
        const map = {
            'CEO': {
                name: 'DIRECCIÓN GENERAL // CEO',
                dept: 'DIRECCIÓN EJECUTIVA & RELACIONES INSTITUCIONALES',
                badge: 'MANDO SUPREMO',
                color: 'text-mars-yellow',
                border: 'border-mars-yellow',
                bgBadge: 'bg-mars-yellow/20',
                hex: '#ffb703'
            },
            'TECNICO': {
                name: 'DIRECCIÓN TÉCNICA // INGENIERÍA',
                dept: 'DESARROLLO AEROESPACIAL & PROPULSIÓN',
                badge: 'I+D / B.O.M.',
                color: 'text-mars-cyan',
                border: 'border-mars-cyan',
                bgBadge: 'bg-mars-cyan/20',
                hex: '#00f0ff'
            },
            'FINANZAS': {
                name: 'DIRECCIÓN FINANCIERA // CFO',
                dept: 'TESORERÍA, BALANCE & PATROCINIOS',
                badge: 'AUDITORÍA & FISCALIDAD',
                color: 'text-mars-green',
                border: 'border-mars-green',
                bgBadge: 'bg-mars-green/20',
                hex: '#00ff66'
            },
            'MARKETING': {
                name: 'DIRECCIÓN MARKETING // CMO',
                dept: 'IDENTIDAD CORPORATIVA & COMUNICACIÓN',
                badge: 'COMUNICACIÓN & BRANDING',
                color: 'text-mars-magenta',
                border: 'border-mars-magenta',
                bgBadge: 'bg-mars-magenta/20',
                hex: '#ff0055'
            },
            'OPERACIONES_IA': {
                name: 'OPERACIONES & IA // COO',
                dept: 'CADENA DE SUMINISTRO & TELEMETRÍA I.A.',
                badge: 'LOGÍSTICA & ALGORITMOS',
                color: 'text-blue-400',
                border: 'border-blue-400',
                bgBadge: 'bg-blue-400/20',
                hex: '#60a5fa'
            },
            'AUXILIAR': {
                name: 'OBSERVADOR // AUXILIAR',
                dept: 'SOPORTE OPERATIVO MULTIDISCIPLINAR',
                badge: 'CONTROL DE CALIDAD',
                color: 'text-purple-400',
                border: 'border-purple-400',
                bgBadge: 'bg-purple-400/20',
                hex: '#c084fc'
            }
        };
        return map[role] || {
            name: role,
            dept: 'OPERACIONES GENERALES',
            badge: 'TRIPULACIÓN',
            color: 'text-mars-cyan',
            border: 'border-mars-cyan',
            bgBadge: 'bg-mars-cyan/20',
            hex: '#00f0ff'
        };
    },

    renderCredentialCardHTML(co, role, code, pin) {
        const meta = this.getRoleMetadata(role);
        const deptName = (role === 'AUXILIAR' && co.auxRoleDept) ? `DPTO. VINCULADO: ${co.auxRoleDept}` : meta.dept;
        const emissionDate = new Date().toISOString().split('T')[0];

        return `
        <div class="credential-card relative terminal-border bg-slate-950 p-4 sm:p-5 border-2 ${meta.border} text-white font-mono shadow-[0_0_20px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col justify-between" style="min-height: 250px; break-inside: avoid; page-break-inside: avoid;">
            <!-- Marca de agua diegética -->
            <div class="absolute -right-6 -bottom-6 w-32 h-32 rounded-full border border-slate-800 pointer-events-none opacity-20 flex items-center justify-center font-orbitron font-black text-4xl text-slate-700 select-none">
                AEE
            </div>

            <!-- Cabecera de la Credencial -->
            <div class="border-b border-slate-800 pb-2.5 mb-3">
                <div class="flex justify-between items-start gap-2">
                    <div class="flex items-center gap-2">
                        <img src="logo.png" alt="MARS-KET" width="32" height="32" onerror="this.onerror=null;this.src='logo.png';" class="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_6px_#00f0ff]">
                        <div>
                            <div class="flex items-center gap-1.5">
                                <span class="font-orbitron font-black text-xs text-white tracking-widest">MARS-KET <span class="text-mars-cyan">2.0</span></span>
                                <span class="text-[9px] px-1 py-0.5 bg-mars-cyan/20 text-mars-cyan border border-mars-cyan/40 uppercase font-bold tracking-wider">AEE / ESA</span>
                            </div>
                            <span class="text-[9px] text-slate-400 uppercase tracking-widest block">AGENCIA ESPACIAL // TARJETA DE ACCESO OPERATIVO</span>
                        </div>
                    </div>
                    <div class="text-right shrink-0">
                        <span class="text-[9px] font-black uppercase px-1.5 py-0.5 border border-red-500/60 bg-red-950/40 text-red-400 tracking-wider">NIVEL 4 • CLASIFICADO</span>
                    </div>
                </div>

                <!-- Empresa y Clase -->
                <div class="flex justify-between items-baseline mt-2 pt-1 border-t border-slate-900 gap-2">
                    <h4 class="font-orbitron font-black text-sm sm:text-base text-white uppercase tracking-wider truncate" title="${this.escapeHTML(co.name)}">
                        ${this.escapeHTML(co.name)}
                    </h4>
                    <span class="bg-mars-yellow text-black font-black text-xs px-2 py-0.5 uppercase shrink-0">
                        CLASE ${this.escapeHTML(co.classGroup || 'A')}
                    </span>
                </div>
            </div>

            <!-- Cuerpo: Rol e Insignia Departamental -->
            <div class="my-2 space-y-1.5">
                <div class="flex items-center justify-between gap-2">
                    <span class="font-orbitron font-black text-xs sm:text-sm uppercase ${meta.color} tracking-wider">
                        ${this.escapeHTML(meta.name)}
                    </span>
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 border ${meta.border} ${meta.bgBadge} ${meta.color} shrink-0">
                        ${this.escapeHTML(meta.badge)}
                    </span>
                </div>
                <p class="text-[10px] text-slate-400 uppercase tracking-wide truncate">
                    ${this.escapeHTML(deptName)}
                </p>
            </div>

            <!-- Caja de Credenciales de Alta Visibilidad -->
            <div class="grid grid-cols-2 gap-2 my-2.5">
                <div class="bg-black/90 border border-mars-yellow/60 p-2 text-center">
                    <span class="text-[9px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">CÓDIGO DE EMPRESA</span>
                    <span class="font-mono font-black text-mars-yellow text-base sm:text-lg tracking-widest select-all block">${this.escapeHTML(code)}</span>
                </div>
                <div class="bg-black/90 border border-mars-cyan/60 p-2 text-center">
                    <span class="text-[9px] text-slate-400 uppercase font-bold tracking-widest block mb-0.5">PIN DE ACCESO (4 DÍGITOS)</span>
                    <span class="font-mono font-black text-mars-cyan text-base sm:text-lg tracking-[0.25em] select-all block">${this.escapeHTML(pin)}</span>
                </div>
            </div>

            <!-- Pie Diegético: Código de barras simulado CSS, aviso militar y fecha -->
            <div class="border-t border-slate-800 pt-2 mt-1 space-y-1.5">
                <div class="flex justify-between items-center gap-2">
                    <!-- Código de barras simulado en CSS -->
                    <div class="flex items-center gap-0.5 h-5 bg-white p-0.5 shrink-0" aria-hidden="true" title="AEE-BARCODE-${this.escapeHTML(code)}-${this.escapeHTML(role)}">
                        <span class="w-0.5 h-full bg-black"></span>
                        <span class="w-1 h-full bg-black"></span>
                        <span class="w-0.5 h-full bg-black"></span>
                        <span class="w-1.5 h-full bg-black"></span>
                        <span class="w-0.5 h-full bg-black"></span>
                        <span class="w-2 h-full bg-black"></span>
                        <span class="w-0.5 h-full bg-black"></span>
                        <span class="w-1 h-full bg-black"></span>
                        <span class="w-1.5 h-full bg-black"></span>
                        <span class="w-0.5 h-full bg-black"></span>
                        <span class="w-2 h-full bg-black"></span>
                        <span class="w-1 h-full bg-black"></span>
                    </div>
                    <span class="text-[9px] text-slate-400 font-mono tracking-tighter truncate">SEC-ID: ${this.escapeHTML(code)}-${this.escapeHTML(role)}-${this.escapeHTML(pin)}</span>
                    <span class="text-[9px] text-slate-500 font-mono shrink-0">${emissionDate}</span>
                </div>
                <p class="text-[8px] text-slate-400 uppercase leading-none tracking-tight">
                    USO EXCLUSIVO DE LA TRIPULACIÓN ASIGNADA • PROHIBIDA SU CESIÓN O DIVULGACIÓN
                </p>
            </div>
        </div>
        `;
    },

    generateRoleCredentialCard(cid, role) {
        const co = state.data.companies[cid];
        if (!co) return this.notify("Startup no encontrada.", "error");
        const code = state.getCompanyCode(co);
        const pin = state.getRolePin(co, role) || (role === 'AUXILIAR' ? '5555' : '1234');
        const cardHtml = this.renderCredentialCardHTML(co, role, code, pin);
        
        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Credencial individual lista para impresión o captura digital.</span>
                    <span class="text-mars-cyan font-bold">${this.escapeHTML(co.name)} [${role}]</span>
                </div>
                <div class="max-w-md mx-auto w-full">
                    ${cardHtml}
                </div>
            </div>
        `;
        this.showCredentialsModal(`CREDENCIAL OFICIAL // ${role} - ${co.name}`, previewHtml, cardHtml);
    },

    generateCompanyCredentialCards(cid) {
        const co = state.data.companies[cid];
        if (!co) return this.notify("Startup no encontrada.", "error");
        const code = state.getCompanyCode(co);
        
        const roles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
        const auxPin = state.getRolePin(co, 'AUXILIAR');
        if (auxPin || co.auxRoleDept) {
            roles.push('AUXILIAR');
        }

        const cardsList = roles.map(r => {
            const pin = state.getRolePin(co, r) || '1234';
            return this.renderCredentialCardHTML(co, r, code, pin);
        });

        const cardsGrid = `
            <div class="credentials-grid grid grid-cols-1 md:grid-cols-2 gap-4">
                ${cardsList.join('')}
            </div>
        `;

        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Flota completa de credenciales (${roles.length} tripulantes) de <strong>${this.escapeHTML(co.name)}</strong>.</span>
                    <span class="text-mars-yellow font-bold uppercase">Clase ${this.escapeHTML(co.classGroup || 'A')}</span>
                </div>
                ${cardsGrid}
            </div>
        `;

        this.showCredentialsModal(`CREDENCIALES DE FLOTA // ${co.name}`, previewHtml, cardsGrid);
    },

    generateAllCompaniesCredentialCards() {
        const cos = Object.keys(state.data.companies || {});
        if (cos.length === 0) return this.notify("No hay startups registradas en el sistema.", "warning");
        
        let allCardsHtml = '';
        let totalCards = 0;

        cos.forEach(cid => {
            const co = state.data.companies[cid];
            const code = state.getCompanyCode(co);
            const roles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
            const auxPin = state.getRolePin(co, 'AUXILIAR');
            if (auxPin || co.auxRoleDept) roles.push('AUXILIAR');

            roles.forEach(r => {
                const pin = state.getRolePin(co, r) || '1234';
                allCardsHtml += this.renderCredentialCardHTML(co, r, code, pin);
                totalCards++;
            });
        });

        const cardsGrid = `
            <div class="credentials-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                ${allCardsHtml}
            </div>
        `;

        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Baraja completa de aula: <strong>${totalCards} credenciales</strong> generadas para ${cos.length} startups.</span>
                    <span class="text-mars-green font-bold uppercase">Listo para Impresión</span>
                </div>
                ${cardsGrid}
            </div>
        `;

        this.showCredentialsModal(`BARAJA COMPLETA DE CREDENCIALES (${totalCards} TARJETAS)`, previewHtml, cardsGrid);
    },

    showCredentialsModal(title, previewBody, printCardsHtml) {
        // Almacenar contenido en el área de impresión
        const printArea = document.getElementById('credentials-print-area');
        if (printArea) {
            printArea.innerHTML = printCardsHtml || previewBody;
        }

        // Expandir el contenedor modal a max-w-5xl
        const modalBox = document.querySelector('#modal-overlay > div');
        if (modalBox) {
            modalBox.classList.remove('max-w-lg');
            modalBox.classList.add('max-w-5xl');
        }

        const actionButtons = `
            <button type="button" onclick="ui.printCredentialCards()" class="min-h-[44px] bg-mars-cyan text-black px-4 sm:px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_10px_#00f0ff] flex items-center gap-2">
                <span>🖨️</span> <span>IMPRIMIR / DESCARGAR PDF</span>
            </button>
        `;

        this.showModal(title, previewBody, actionButtons);
    },

    printCredentialCards() {
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
            window.print();
        } else {
            this.notify("La función de impresión no está disponible en este entorno.", "warning");
        }
    }
});