// js/ui-docente-management.js
// --- MÓDULO DOCENTE: GESTIÓN, LLAVERO MAESTRO, ADUANAS Y REGISTRO MERCANTIL (v1.1.32) ---

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
                            <p class="text-xs text-mars-yellow uppercase font-bold mb-1">Motivo del Renombramiento:</p>
                            <p class="text-white text-xs mb-2 break-words">"${this.escapeHTML(req.reason || '')}"</p>
                            ${req.driveUrl ? `
                            <div class="mb-3">
                                <a href="${encodeURI(req.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Solicitud Oficial en Google Drive ↗</span></a>
                            </div>` : ''}
                            <label for="coord-new-co-name-${cid}" class="text-xs text-mars-green uppercase font-bold block mb-1">Nueva Denominación Social Oficial:</label>
                            <input type="text" id="coord-new-co-name-${cid}" placeholder="Escribe el nombre oficial aprobado..." value="${this.escapeHTML(req.proposedName !== 'Propuesta en Documento Drive' ? req.proposedName : '')}" class="w-full min-h-[44px] bg-black border border-mars-green/50 p-2 text-xs text-white font-orbitron uppercase outline-none focus:border-mars-green mb-3">
                            <div class="flex gap-2">
                                <button onclick="ui.resolveNameChangeRequest('${this.escapeHTML(cid)}', true)" class="min-h-[44px] flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Aprobar y Registrar Nombre</button>
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
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Auditoría previa y registro oficial del slogan de las startups.</p>
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
                                <span class="text-xs bg-mars-yellow/20 text-mars-yellow px-2 py-0.5 font-bold uppercase animate-pulse shrink-0">Avalado por CEO</span>
                            </div>
                            <div class="flex gap-4 items-center">
                                ${logoPreview}
                                <div class="flex-grow min-w-0">
                                    <p class="text-xs text-slate-300 uppercase font-bold mb-0.5">Enfoque Aeroespacial:</p>
                                    <p class="text-mars-cyan text-xs font-bold mb-1 break-words">${this.escapeHTML(co.brandApproval.concept || 'General')}</p>
                                    <span class="text-[10px] text-slate-400 font-mono">${this.escapeHTML(co.brandApproval.expId || '')}</span>
                                </div>
                            </div>
                            ${co.brandApproval.driveUrl ? `
                            <div class="mb-1">
                                <a href="${encodeURI(co.brandApproval.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Expediente Slogan en Google Drive ↗</span></a>
                            </div>` : ''}
                            <div>
                                <label for="coord-official-slogan-${cid}" class="text-xs text-mars-yellow uppercase font-bold block mb-1">Slogan Oficial Aprobado (Extraído del Google Doc):</label>
                                <input type="text" id="coord-official-slogan-${cid}" placeholder="Escribe el slogan aprobado que se fijará en el HUD..." value="${this.escapeHTML(co.brandApproval.pendingSlogan || co.slogan || '')}" class="w-full min-h-[44px] bg-black border border-mars-yellow/50 p-2.5 text-xs text-mars-yellow font-bold uppercase outline-none focus:border-mars-yellow">
                            </div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="ui.resolveBrandApproval('${this.escapeHTML(cid)}')" class="min-h-[44px] flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-xs hover:bg-white transition-colors">Aprobar y Registrar Slogan</button>
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
                            ${c.driveUrl ? `
                            <div class="mt-2">
                                <a href="${encodeURI(c.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Memoria de Desinversión en Google Drive ↗</span></a>
                            </div>` : ''}
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
                                const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(c) : { gross: c.ledger.filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(Number(l.delta)||0), 0), sponsorReduction: 0, net: c.ledger.filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(Number(l.delta)||0), 0) };
                                
                                const tierStyles = {
                                    'ORO': 'text-[#ffd700] border-[#ffd700]',
                                    'PLATA': 'text-[#c0c0c0] border-[#c0c0c0]',
                                    'BRONCE': 'text-[#cd7f32] border-[#cd7f32]',
                                    'COBRE': 'text-[#b87333] border-[#b87333]',
                                    'COLABORADOR': 'text-mars-cyan border-mars-cyan'
                                };
                                const cl = tierStyles[c.sponsorAwarded] || 'text-slate-300 border-slate-700';

                                let sponsorHtml = '';
                                if(canSponsor) {
                                    sponsorHtml = `<button onclick="ui.modalAssignSponsor('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-slate-900 border ${cl} ${cl.split(' ')[0]} px-3 py-1.5 font-bold text-xs uppercase hover:bg-white hover:text-black transition-all whitespace-nowrap">${c.sponsorAwarded ? `[${this.escapeHTML(c.sponsorAwarded)}] Editar` : 'Asignar Patrocinio'}</button>`;
                                } else {
                                    if(c.sponsorAwarded) {
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
                                    <td class="py-3 font-mono pr-2.5 sm:pr-4">
                                        <button onclick="ui.modalVirtualSpend('${this.escapeHTML(cid)}')" class="min-h-[44px] text-left text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 inline-flex flex-col justify-center" title="Ver desglose detallado">
                                            <span class="font-bold">${opCosts.net.toFixed(2)} €v</span>
                                            ${opCosts.sponsorReduction > 0 ? `<span class="text-[10px] text-mars-yellow">(Bruto: ${opCosts.gross.toFixed(0)} | -${opCosts.sponsorReduction.toFixed(0)} €v)</span>` : ''}
                                        </button>
                                    </td>
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

        let coordSettingsHtml = '';
        if (isCoord) {
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
            <div class="terminal-border bg-mars-card p-6 mt-6 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-2 gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase tracking-widest font-bold">🔐 Credenciales del Claustro Docente</h3>
                        <p class="text-xs text-slate-400 uppercase mt-0.5">Gestión desacoplada y persistencia atómica en servidor D1.</p>
                    </div>
                    ${isCoord ? `<button onclick="ui.exportTeacherBadgesPDF()" class="min-h-[44px] bg-[#00F0FF] text-black px-4 py-1.5 text-xs font-black uppercase hover:bg-white transition-colors shrink-0">[🪪 Credenciales Claustro PDF]</button>` : ''}
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
                        ${isCoord ? `<button onclick="ui.promptRegenerateAllStartupsPins()" id="btn-regen-all-pins" title="Asignar nuevos PINs aleatorios a todas las empresas de la misión" class="min-h-[44px] bg-amber-400 text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors shrink-0 flex items-center gap-1.5 shadow-[0_0_10px_rgba(251,191,36,0.2)]">🎲 PINs Aleatorios (Todas)</button>` : ''}
                        ${isCoord ? `<button onclick="ui.exportTeacherBadgesPDF()" class="min-h-[44px] bg-[#00F0FF] text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors shrink-0">[🪪 Claustro PDF]</button>` : ''}
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
                                                ${isCoord ? `
                                                <div class="flex items-center gap-1">
                                                    <input type="${this.pinsVisible ? 'text' : 'password'}" id="pin-input-${this.escapeHTML(cid)}-${rol}" aria-label="PIN ${rol} de ${this.escapeHTML(co.name)}" maxlength="4" value="${this.escapeHTML(pinVal)}" onchange="ui.updatePIN('${this.escapeHTML(cid)}', '${rol}', this.value)" class="min-h-[44px] w-14 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base sm:text-xs p-1 outline-none focus:border-mars-yellow disabled:opacity-50">
                                                    <button onclick="ui.regenerateRolePin('${this.escapeHTML(cid)}', '${rol}')" id="role-pin-regen-${this.escapeHTML(cid)}-${rol}" aria-label="Nuevo PIN aleatorio para ${rol}" title="Generar nuevo PIN aleatorio para ${rol}" class="min-h-[44px] min-w-[36px] bg-slate-800 text-slate-300 hover:text-black hover:bg-amber-400 border border-slate-700 px-1 py-1 flex items-center justify-center transition-colors text-xs font-bold disabled:opacity-50">🎲</button>
                                                </div>` : `<span class="text-slate-300">****</span>`}
                                                ${isCoord ? `<button onclick="ui.generateRoleCredentialCard('${this.escapeHTML(cid)}', '${rol}')" aria-label="Credencial PDF ${rol}" title="Emitir Credencial PDF ${rol}" class="min-h-[44px] w-full inline-flex items-center justify-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-mars-cyan text-slate-300 hover:text-mars-cyan px-2 py-1 rounded-sm transition-colors whitespace-nowrap">🪪 ${rol}</button>` : ''}
                                            </div>
                                        </td>`;
                                    }).join('')}
                                    <td class="py-3 pr-3">
                                        <div class="flex flex-col items-center gap-1.5">
                                            ${isCoord ? `
                                            <div class="flex items-center gap-1">
                                                <input type="${this.pinsVisible ? 'text' : 'password'}" id="pin-input-${this.escapeHTML(cid)}-AUXILIAR" aria-label="PIN AUXILIAR de ${this.escapeHTML(co.name)}" maxlength="4" placeholder="----" value="${this.escapeHTML(auxPin)}" onchange="ui.updatePIN('${this.escapeHTML(cid)}', 'AUXILIAR', this.value)" class="min-h-[44px] w-14 bg-black border ${auxPin ? 'border-mars-green text-mars-green' : 'border-slate-700 text-slate-400'} text-center font-bold text-base sm:text-xs p-1 outline-none focus:border-mars-yellow disabled:opacity-50">
                                                ${auxPin ? `<button onclick="ui.regenerateRolePin('${this.escapeHTML(cid)}', 'AUXILIAR')" id="role-pin-regen-${this.escapeHTML(cid)}-AUXILIAR" aria-label="Nuevo PIN aleatorio para AUXILIAR" title="Generar nuevo PIN aleatorio para AUXILIAR" class="min-h-[44px] min-w-[36px] bg-slate-800 text-slate-300 hover:text-black hover:bg-amber-400 border border-slate-700 px-1 py-1 flex items-center justify-center transition-colors text-xs font-bold disabled:opacity-50">🎲</button>` : ''}
                                                <span class="text-xs text-slate-300 uppercase">[${this.escapeHTML(auxDept)}]</span>
                                            </div>` : `<span class="text-slate-300">****</span>`}
                                            ${isCoord && auxPin ? `<button onclick="ui.generateRoleCredentialCard('${this.escapeHTML(cid)}', 'AUXILIAR')" aria-label="Credencial PDF AUXILIAR" title="Emitir Credencial PDF AUXILIAR" class="min-h-[44px] w-full inline-flex items-center justify-center text-xs font-mono font-bold bg-slate-900 border border-slate-700 hover:border-mars-green text-slate-300 hover:text-mars-green px-2 py-1 rounded-sm transition-colors whitespace-nowrap">🪪 AUX</button>` : ''}
                                        </div>
                                    </td>
                                    <td class="py-3">
                                        <div class="flex items-center gap-2">
                                            ${isCoord ? `<button onclick="ui.regenerateCompanyPins('${this.escapeHTML(cid)}')" id="co-pins-regen-${this.escapeHTML(cid)}" title="Generar nuevos PINs aleatorios de 4 dígitos para todos los roles de ${this.escapeHTML(co.name)}" class="min-h-[44px] bg-amber-400/20 border border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-black font-bold text-xs px-2.5 py-1 transition-colors whitespace-nowrap flex items-center gap-1">🎲 PINs</button>` : ''}
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

    async saveDeliverableSchedule(docKey) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const elOpen = document.getElementById(`sched-open-${docKey}`);
        const elDead = document.getElementById(`sched-dead-${docKey}`);
        const elGuide = document.getElementById(`sched-guide-${docKey}`);
        if (!elOpen || !elDead || !elGuide) return;

        const openDate = elOpen.value.trim() || null;
        const deadline = elDead.value.trim() || null;
        const guideDocUrl = elGuide.value.trim();

        if (guideDocUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(guideDocUrl)) {
            return this.notify("El enlace a la plantilla docente debe ser una URL válida de Google Drive / Docs.", "error");
        }

        state.pausePolling = true;
        const now = Date.now();
        state.data.config = state.data.config || {};
        state.data.config.deliverableSchedule = state.data.config.deliverableSchedule || {};
        state.data.config.deliverableSchedule[docKey] = {
            openDate,
            deadline,
            guideDocUrl: guideDocUrl || "",
            updatedAt: now
        };

        if (deadline) {
            state.data.config.deadlines = state.data.config.deadlines || {};
            state.data.config.deadlines[docKey] = deadline;
        }

        state.data.config.updatedAt = now;
        state.saveLocalOnly();
        try {
            await state.pushToCloud(false);
            this.notify(`✅ Cronograma y plantilla actualizados para ${docKey}.`, "success");
        } catch(e) {
            console.error("Error al persistir cronograma:", e);
        } finally {
            state.pausePolling = false;
        }
    },

    async saveAllDeliverableSchedules() {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        state.pausePolling = true;
        const now = Date.now();
        state.data.config = state.data.config || {};
        state.data.config.deliverableSchedule = state.data.config.deliverableSchedule || {};
        state.data.config.deadlines = state.data.config.deadlines || {};

        defs.forEach(d => {
            const elOpen = document.getElementById(`sched-open-${d.key}`);
            const elDead = document.getElementById(`sched-dead-${d.key}`);
            const elGuide = document.getElementById(`sched-guide-${d.key}`);
            if (elOpen && elDead && elGuide) {
                const openDate = elOpen.value.trim() || null;
                const deadline = elDead.value.trim() || null;
                const guideDocUrl = elGuide.value.trim();
                state.data.config.deliverableSchedule[d.key] = {
                    openDate,
                    deadline,
                    guideDocUrl: guideDocUrl || "",
                    updatedAt: now
                };
                if (deadline) {
                    state.data.config.deadlines[d.key] = deadline;
                }
            }
        });

        state.data.config.updatedAt = now;
        state.saveLocalOnly();
        try {
            await state.pushToCloud(false);
            this.notify("✅ Todos los cronogramas han sido sincronizados en la nube.", "success");
        } catch(e) {
            console.error("Error al persistir todos los cronogramas:", e);
        } finally {
            state.pausePolling = false;
        }
    },

    updateDeadline(key, val) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        state.data.config.deadlines = state.data.config.deadlines || {};
        state.data.config.deadlines[key] = val;
        state.data.config.deliverableSchedule = state.data.config.deliverableSchedule || {};
        state.data.config.deliverableSchedule[key] = state.data.config.deliverableSchedule[key] || {};
        state.data.config.deliverableSchedule[key].deadline = val;
        state.data.config.updatedAt = Date.now();
        state.save();
        this.notify("Plazo actualizado en el Cronograma Maestro.", "success");
    },

    renderAdminSettings() {
        const isCoord = state.user && state.user.role && state.user.role.startsWith('COORD');
        const dl = state.data.config.deadlines || {};
        const schedule = state.data.config?.deliverableSchedule || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const suggestions = state.data.suggestionsToAlex || [];
        const isResolvedStatus = (s) => s.status === 'IMPLEMENTADO' || s.status === 'RESUELTO' || s.resolved === true;
        const activeSuggs = suggestions.filter(s => !isResolvedStatus(s));
        const resolvedSuggs = suggestions.filter(s => isResolvedStatus(s));

        const renderSuggItem = (sugg) => {
            const cat = sugg.category || 'MEJORA';
            const status = sugg.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            
            return `
            <div class="bg-slate-900 border border-mars-border p-4 text-xs mb-2">
                <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${catBadge}">${this.escapeHTML(cat)}</span>
                        <span class="text-white font-bold uppercase break-words">${this.escapeHTML(sugg.author)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <select aria-label="Estado de sugerencia" onchange="ui.updateSuggestionStatus('${this.escapeHTML(sugg.id)}', this.value)" class="min-h-[44px] bg-black border border-slate-700 text-white p-1.5 text-xs uppercase font-bold outline-none">
                            <option value="RECIBIDO" ${status==='RECIBIDO'?'selected':''}>Recibido</option>
                            <option value="EN_REVISION" ${status==='EN_REVISION'?'selected':''}>En Revisión</option>
                            <option value="IMPLEMENTADO" ${status==='IMPLEMENTADO'?'selected':''}>Implementado</option>
                        </select>
                        <button onclick="ui.deleteSuggestion('${this.escapeHTML(sugg.id)}')" aria-label="Eliminar sugerencia" class="min-h-[44px] min-w-[44px] text-mars-magenta hover:text-white font-bold px-2 border border-mars-magenta/40">X</button>
                    </div>
                </div>
                <p class="text-slate-200 italic mb-2 bg-black/50 p-2 border border-slate-800 break-words">"${this.escapeHTML(sugg.text)}"</p>
                ${sugg.driveUrl ? `
                <div class="mb-2">
                    <a href="${this.escapeHTML(sugg.driveUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-mars-cyan hover:underline font-mono bg-mars-cyan/10 px-2.5 py-1.5 border border-mars-cyan/40 min-h-[36px]">
                        <span>📄 Abrir Evidencia / Detalle en Google Drive ↗</span>
                    </a>
                </div>` : ''}
                <span class="text-xs text-slate-300 block text-right">${this.escapeHTML(sugg.date)}</span>
            </div>`;
        };

        const activeHtml = activeSuggs.map(renderSuggItem).join('') || '<p class="text-slate-300 italic text-xs">No hay consultas activas pendientes en el buzón.</p>';
        const resolvedHtml = resolvedSuggs.map(renderSuggItem).join('') || '<p class="text-slate-400 italic text-xs">No hay consultas resueltas registradas.</p>';

        const scheduleCards = defs.map(d => {
            const sched = schedule[d.key] || {};
            const openVal = sched.openDate || d.defaultOpenDate || '';
            const deadVal = sched.deadline || dl[d.key] || d.defaultDate || '';
            const guideVal = sched.guideDocUrl || d.defaultGuideDocUrl || '';

            return `
            <div class="bg-slate-900 border border-slate-800 p-3.5 flex flex-col justify-between space-y-2.5 rounded">
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40">${this.escapeHTML(d.subject)} • ${this.escapeHTML(d.weight)}</span>
                        <span class="text-[10px] text-slate-400 font-mono uppercase">${this.escapeHTML(d.key)}</span>
                    </div>
                    <h4 class="text-xs text-white font-bold uppercase leading-snug">${this.escapeHTML(d.name)}</h4>
                </div>
                <div class="space-y-1">
                    <label for="sched-open-${this.escapeHTML(d.key)}" class="text-[10px] text-mars-cyan uppercase font-bold block">1. Apertura (Desbloqueo)</label>
                    <input type="datetime-local" id="sched-open-${this.escapeHTML(d.key)}" value="${this.escapeHTML(openVal)}" ${isCoord ? `onchange="ui.saveDeliverableSchedule('${this.escapeHTML(d.key)}')"` : 'disabled'} class="input-open-date min-h-[44px] w-full bg-black border border-slate-700 p-2 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-cyan">
                </div>
                <div class="space-y-1">
                    <label for="sched-dead-${this.escapeHTML(d.key)}" class="text-[10px] text-mars-yellow uppercase font-bold block">2. Cierre (Límite Entrega)</label>
                    <input type="datetime-local" id="sched-dead-${this.escapeHTML(d.key)}" value="${this.escapeHTML(deadVal)}" ${isCoord ? `onchange="ui.saveDeliverableSchedule('${this.escapeHTML(d.key)}')"` : 'disabled'} class="input-deadline min-h-[44px] w-full bg-black border border-slate-700 p-2 text-base sm:text-xs text-mars-yellow font-mono outline-none focus:border-mars-yellow">
                </div>
                <div class="space-y-1">
                    <label for="sched-guide-${this.escapeHTML(d.key)}" class="text-[10px] text-mars-green uppercase font-bold block">3. Plantilla Oficial Drive (Opcional)</label>
                    <input type="url" id="sched-guide-${this.escapeHTML(d.key)}" value="${this.escapeAttr(guideVal)}" placeholder="https://docs.google.com/document/d/..." ${isCoord ? `onchange="ui.saveDeliverableSchedule('${this.escapeHTML(d.key)}')"` : 'disabled'} class="input-guide-url min-h-[44px] w-full bg-black border border-slate-700 p-2 text-base sm:text-xs text-mars-green font-mono outline-none focus:border-mars-green">
                </div>
            </div>`;
        }).join('');

        return `
        <div class="space-y-6">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b border-mars-border pb-3 gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-cyan text-sm uppercase tracking-widest font-bold">⏳ Cronograma Maestro: Entregables Curriculares y Candados</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control centralizado de aperturas automáticas, plazos de entrega y plantillas Google Docs (${defs.length} Hitos).</p>
                    </div>
                    <div class="flex items-center gap-2">
                        ${isCoord ? `<button type="button" onclick="ui.saveAllDeliverableSchedules()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,204,0.3)]">[ 💾 Guardar Todo el Cronograma ]</button>` : ''}
                        <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-3 py-1 text-xs font-black uppercase font-mono">${defs.length} Entregables</span>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[700px] overflow-y-auto pr-2">
                    ${scheduleCards}
                </div>
            </div>

            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Buzón de Consultas & Feedback</h3>
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-mars-cyan font-bold font-mono">${activeSuggs.length} Activas</span>
                        <span class="text-xs text-slate-400 font-mono">/ ${suggestions.length} Total</span>
                    </div>
                </div>
                <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <div class="space-y-2">
                        ${activeHtml}
                    </div>

                    <details class="border border-cyan-500/20 bg-[#0A0E17] rounded-lg mt-4 p-3">
                        <summary class="cursor-pointer font-orbitron text-xs text-mars-cyan uppercase tracking-wider font-bold select-none flex items-center justify-between">
                            <span>CONSULTAS Y SUGERENCIAS RESUELTAS</span>
                            <span class="bg-cyan-950/80 text-mars-cyan border border-cyan-500/30 px-2 py-0.5 rounded text-[11px] font-mono">[${resolvedSuggs.length} RESUELTAS]</span>
                        </summary>
                        <div class="space-y-2 mt-3 pt-2 border-t border-cyan-500/20">
                            ${resolvedHtml}
                        </div>
                    </details>
                </div>
            </div>
        </div>`;
    },

    // TODO: En la versión v1.1.04 se deberá crear un panel exclusivo y un endpoint (/api/admin/credentials) para que solo los Coordinadores puedan ver y editar estos PINs, ya que actualmente están blindados y son inmutables desde el cliente.
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


    async regenerateRolePin(cid, role) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co) return;

        const allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
        const existingPins = allRoles.map(r => state.getRolePin(co, r)).filter(Boolean);
        const newPin = state.generateRandomPin(existingPins);

        const btnEl = document.getElementById(`role-pin-regen-${cid}-${role}`);
        const inputEl = document.getElementById(`pin-input-${cid}-${role}`);
        if (btnEl) btnEl.disabled = true;
        if (inputEl) inputEl.disabled = true;

        try {
            const ok = await state.updatePin(cid, role, newPin);
            if (inputEl) {
                inputEl.value = newPin;
                inputEl.classList.add('border-amber-400', 'shadow-[0_0_10px_rgba(251,191,36,0.6)]');
                setTimeout(() => {
                    inputEl.classList.remove('border-amber-400', 'shadow-[0_0_10px_rgba(251,191,36,0.6)]');
                }, 2000);
            }
            if (ok) {
                this.notify(`✅ Nuevo PIN para ${role} (${co.name}): ${newPin} sincronizado en D1.`, "success", 7000);
            } else {
                this.notify(`⚠️ Nuevo PIN para ${role} (${co.name}): ${newPin} guardado localmente.`, "warning", 7000);
            }
        } finally {
            if (btnEl) btnEl.disabled = false;
            if (inputEl) inputEl.disabled = false;
        }
    },

    async regenerateCompanyPins(cid) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co) return;

        const newPins = state.generateCompanyPins(co);
        const btnEl = document.getElementById(`co-pins-regen-${cid}`);
        if (btnEl) btnEl.disabled = true;

        try {
            const ok = await state.updateCompanyPins(cid, newPins);
            this.render();
            if (ok) {
                this.notify(`✅ Nuevos PINs de flota generados y sincronizados para ${co.name}.`, "success");
            } else {
                this.notify(`⚠️ Nuevos PINs generados localmente para ${co.name}; pendiente de D1.`, "warning");
            }
        } finally {
            if (btnEl) btnEl.disabled = false;
        }
    },

    promptRegenerateAllStartupsPins() {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const totalCos = Object.keys(state.data.companies).length;
        if (totalCos === 0) return this.notify("No hay startups registradas.", "warning");

        const msg = `Se generarán nuevos PINs de 4 dígitos totalmente aleatorios y distintos para todos los roles de las ${totalCos} startups registradas en la misión. Esta acción evitará claves por defecto (1234). ¿Deseas continuar?`;
        this.confirmAction(
            "Regenerar PINs de TODAS las Startups",
            msg,
            async () => {
                let successCount = 0;
                for (const cid of Object.keys(state.data.companies)) {
                    const co = state.data.companies[cid];
                    const newPins = state.generateCompanyPins(co);
                    const ok = await state.updateCompanyPins(cid, newPins);
                    if (ok) successCount++;
                }
                this.render();
                this.notify(`✅ Asignados nuevos PINs aleatorios a ${successCount}/${totalCos} startups.`, "success");
            },
            "Regenerar Todos los PINs"
        );
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

    renderTelemetryMatrixRows(filterClass = 'ALL') {
        let matRows = '';
        const targetClass = filterClass || 'ALL';
        const companies = Object.keys(state.data.companies || {}).filter(cid => {
            if (targetClass === 'ALL') return true;
            return state.data.companies[cid].classGroup === targetClass;
        });

        if (companies.length === 0) {
            return `<tr><td colspan="7" class="py-4 text-center text-slate-400 italic text-xs">No hay startups registradas en el grupo seleccionado.</td></tr>`;
        }

        companies.forEach(cid => {
            const co = state.data.companies[cid];
            const s = co.loginStats || { totalLogins:0, roles:{} }; 
            matRows += `<tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-3 font-orbitron text-white font-bold pr-4 max-w-[220px] truncate" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} <span class="text-[10px] text-slate-400 font-mono">[Clase ${this.escapeHTML(co.classGroup || 'A')}]</span></td>
                <td class="py-3 font-mono text-mars-cyan font-bold pr-4 text-center border-r border-mars-border/50">${s.totalLogins}</td>`;
            ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => {
                const count = s.roles[r]?.count || 0;
                const color = count > 4 ? 'text-mars-green' : (count > 0 ? 'text-mars-yellow' : 'text-mars-magenta animate-pulse');
                matRows += `<td class="py-3 font-mono ${color} text-center font-bold px-2">${count}</td>`;
            });
            matRows += `</tr>`;
        });
        return matRows;
    },

    onTelemetryClassFilterChange(cls) {
        this.telemetryClassFilter = cls;
        const tbody = document.getElementById('telemetry-matrix-tbody');
        if (tbody) {
            tbody.innerHTML = this.renderTelemetryMatrixRows(cls);
        }
    },

    renderAdminTelemetry() {
        if (!state.user || !state.user.role.startsWith('COORD_')) {
            return '<div class="terminal-border bg-mars-card p-8 text-center text-amber-400 font-mono text-xs uppercase font-bold border-l-4 border-l-amber-400">⚠️ Acceso Restringido: La telemetría global está reservada a roles de Coordinación (COORD_*).</div>';
        }

        const currentFilter = this.telemetryClassFilter || 'ALL';
        const rawClasses = Object.values(state.data.companies || {}).map(c => c.classGroup).filter(Boolean);
        const uniqueClasses = [...new Set(['A', 'B', ...rawClasses])].sort();

        const classOptions = `
            <option value="ALL" ${currentFilter === 'ALL' ? 'selected' : ''}>Todas las Clases</option>
            ${uniqueClasses.map(cls => `<option value="${this.escapeHTML(cls)}" ${currentFilter === cls ? 'selected' : ''}>Clase ${this.escapeHTML(cls)}</option>`).join('')}
        `;

        const allSessions = Array.isArray(state.data.telemetry?.sessions) ? state.data.telemetry.sessions : [];
        const visibleSessions = allSessions.slice(0, 100);

        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan text-center flex flex-col justify-center">
                <p class="text-5xl font-orbitron text-mars-cyan">${state.data.telemetry?.totalLogins || 0}</p>
                <p class="text-xs text-slate-300 uppercase mt-2 font-bold tracking-widest">Logins Globales</p>
            </div>
            <div class="md:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest font-bold">Matriz de Conexiones por Departamento</h3>
                    <div class="flex items-center gap-2">
                        <label for="telemetry-class-filter" class="text-xs text-slate-300 font-bold uppercase">Filtrar por Clase:</label>
                        <select id="telemetry-class-filter" onchange="ui.onTelemetryClassFilterChange(this.value)" class="min-h-[44px] bg-black border border-mars-yellow text-mars-yellow text-xs p-2 uppercase font-bold outline-none cursor-pointer">
                            ${classOptions}
                        </select>
                    </div>
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Startup</th><th class="pr-4 text-center border-r border-mars-border/50">Total</th><th class="text-center px-2">CEO</th><th class="text-center px-2">TEC</th><th class="text-center px-2">FIN</th><th class="text-center px-2">MKT</th><th class="text-center px-2">OP_IA</th></tr></thead>
                        <tbody id="telemetry-matrix-tbody">${this.renderTelemetryMatrixRows(currentFilter)}</tbody>
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
                    ${r.driveUrl ? `
                    <div class="mb-3">
                        <a href="${encodeURI(r.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50"><span>📄 Abrir Expediente HR en Google Drive ↗</span></a>
                    </div>` : ''}
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
            co.updatedAt = Date.now();
            state.save(cid);
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
                    <option value="Cuerpo del Cohete (Estructura Principal)">Cuerpo del Cohete (Estructura Principal)</option>
                    <option value="Propulsión y Reactivos">Propulsión y Reactivos</option>
                    <option value="Aerodinámica">Aerodinámica</option>
                    <option value="Sistema de Reacción">Sistema de Reacción</option>
                    <option value="Sellado y Unión (Estanquidad y Montaje)">Sellado y Unión (Estanquidad y Montaje)</option>
                    <option value="Elementos Extra">Elementos Extra</option>
                    <option value="Fuselaje">Fuselaje</option>
                    <option value="Propulsión">Propulsión</option>
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
                <div class="bg-slate-900 border border-mars-border p-3 flex justify-between items-center text-xs flex-wrap gap-3">
                    <div class="flex-grow min-w-[220px]">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="text-mars-yellow font-black uppercase text-xs">${this.escapeHTML(state.data.companies[p.company]?.name || 'Desconocida')}</span>
                            <span class="text-[10px] text-slate-400 font-mono">${this.escapeHTML(p.date || '')}</span>
                        </div>
                        <p class="text-white font-bold text-xs uppercase mb-1.5">${this.escapeHTML(p.name || 'Componente Especial I+D')}</p>
                        ${p.driveUrl ? `
                            <a href="${this.escapeHTML(p.driveUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 text-xs text-mars-cyan hover:underline font-mono bg-mars-cyan/10 px-2.5 py-1.5 border border-mars-cyan/40 min-h-[36px]">
                                <span>📄 Abrir Memoria Técnica en Google Drive ↗</span>
                            </a>
                        ` : '<span class="text-slate-400 italic text-[11px]">Sin enlace de Drive adjunto</span>'}
                    </div>
                    <div class="flex gap-2 items-center flex-wrap sm:flex-nowrap flex-shrink-0">
                        <input type="text" id="val-name-${this.escapeHTML(p.id)}" aria-label="Nombre oficial en catálogo" class="min-h-[44px] w-40 sm:w-48 bg-black border border-slate-700 p-2 text-white text-xs" placeholder="Nombre en Catálogo" value="${this.escapeAttr(p.name || 'Pieza Especial')}">
                        <input type="number" id="val-price-${this.escapeHTML(p.id)}" aria-label="Precio €v" class="min-h-[44px] w-20 bg-black border border-mars-border p-2 text-mars-green text-center font-bold text-xs" placeholder="€v" min="1" step="0.5">
                        <button onclick="ui.teacherValidate('${this.escapeHTML(p.id)}', true)" class="min-h-[44px] bg-mars-green text-black px-4 py-2 font-black text-xs hover:bg-white transition-colors" title="Aprobar e integrar en catálogo">OK</button>
                        <button onclick="ui.teacherValidate('${this.escapeHTML(p.id)}', false)" class="min-h-[44px] text-mars-magenta font-bold px-3 py-2 text-xs border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors" title="Denegar solicitud">X</button>
                    </div>
                </div>`).join('') || '<p class="text-slate-300 text-xs italic">Nada pendiente.</p>'}
            </div>
        </div>`;
    },

    async saveCatalogPrice(itemId, idx) {
        let p = NaN;
        const el = document.getElementById(`price-${itemId}`) || (idx !== undefined ? document.querySelector(`input[data-cat-idx="${idx}"]`) : null);
        if (el) {
            p = parseFloat(el.value);
        }
        if (isNaN(p) || p < 0) return this.notify("Precio inválido. Debe ser un número mayor o igual a 0.", "error");

        const normalizedPrice = Math.round((p + Number.EPSILON) * 100) / 100;

        // 1. Bloquear el ciclo de polling durante la operación para evitar rehidrataciones desactualizadas
        state.pausePolling = true;
        if (state.heartbeatTimer) {
            clearInterval(state.heartbeatTimer);
            state.heartbeatTimer = null;
        }

        try {
            // 2. Esperar confirmación res.ok de D1 antes de manipular el estado en memoria
            let d1Ok = false;
            try {
                const token = state.getAuthToken(state.user, state.data);
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                };
                let res = await fetch(`/api/catalog/${encodeURIComponent(itemId)}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify({
                        id: itemId,
                        version: Number(state.data.version) || 1,
                        changes: { price: normalizedPrice },
                        price: normalizedPrice
                    })
                });
                if (res.status === 409) {
                    const conflictJson = await res.json().catch(() => ({}));
                    const freshVersion = conflictJson.serverVersion || Number(state.data.version) || 1;
                    state.data.version = freshVersion;

                    res = await fetch(`/api/catalog/${encodeURIComponent(itemId)}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({
                            id: itemId,
                            version: freshVersion,
                            changes: { price: normalizedPrice },
                            price: normalizedPrice,
                            force: true
                        })
                    });
                }
                if (res.ok) {
                    const resJson = await res.json().catch(() => ({}));
                    if (resJson.version) state.data.version = resJson.version;
                    d1Ok = true;
                }
            } catch(e) {}

            if (state.data.catalog && state.data.catalog[idx]) {
                state.data.catalog[idx].price = normalizedPrice;
            }
            state.saveLocalOnly();

            if (!d1Ok) {
                const pushed = await state.pushToCloud(false);
                if (!pushed) {
                    this.notify("Precio actualizado localmente (pendiente de persistir en D1).", "warning");
                    this.render();
                    return;
                }
            }

            this.notify(`Precio de "${itemId}" sincronizado y persistido en D1 (${normalizedPrice} €v).`, "success");
            this.render();
        } finally {
            // 3. Reanudar ciclo de polling
            state.resumePolling();
        }
    },

    updateCatalogPrice(idx, val) {
        const p = parseFloat(val);
        if (isNaN(p) || p < 0) return;
        const normalized = Math.round((p + Number.EPSILON) * 100) / 100;
        if (state.data.catalog && state.data.catalog[idx]) {
            state.data.catalog[idx].price = normalized;
            state.save();
        }
    },

    async deleteCatalogItem(target) {
        if (!Array.isArray(state.data.catalog)) return;
        let idx = -1;
        let itemId = null;
        if (typeof target === 'number') {
            idx = target;
            itemId = state.data.catalog[idx]?.id;
        } else if (typeof target === 'string') {
            itemId = target;
            idx = state.data.catalog.findIndex(i => String(i.id) === target);
            if (idx === -1 && !isNaN(parseInt(target, 10)) && String(parseInt(target, 10)) === target) {
                const numericIdx = parseInt(target, 10);
                if (numericIdx >= 0 && numericIdx < state.data.catalog.length) {
                    idx = numericIdx;
                    itemId = state.data.catalog[idx]?.id;
                }
            }
        }
        if (idx < 0 || idx >= state.data.catalog.length || !itemId) {
            return this.notify("No se pudo localizar el artículo a eliminar.", "error");
        }

        // 1. Bloquear el ciclo de polling durante la operación de borrado
        state.pausePolling = true;
        if (state.heartbeatTimer) {
            clearInterval(state.heartbeatTimer);
            state.heartbeatTimer = null;
        }

        try {
            // 2. Esperar confirmación res.ok de D1 antes de manipular el estado en memoria
            let d1Ok = false;
            try {
                const token = state.getAuthToken(state.user, state.data);
                const headers = {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                };
                let res = await fetch(`/api/catalog/${encodeURIComponent(itemId)}`, {
                    method: 'DELETE',
                    headers,
                    body: JSON.stringify({
                        id: itemId,
                        version: Number(state.data.version) || 1
                    })
                });

                if (res.status === 409) {
                    const conflictJson = await res.json().catch(() => ({}));
                    const freshVersion = conflictJson.serverVersion || Number(state.data.version) || 1;
                    state.data.version = freshVersion;

                    res = await fetch(`/api/catalog/${encodeURIComponent(itemId)}`, {
                        method: 'DELETE',
                        headers,
                        body: JSON.stringify({
                            id: itemId,
                            version: freshVersion,
                            force: true
                        })
                    });
                }

                if (res.ok) {
                    const resJson = await res.json().catch(() => ({}));
                    if (resJson.version) state.data.version = resJson.version;
                    d1Ok = true;
                }
            } catch(e) {}

            // Registrar en lista negra persistente local para evitar cualquier resurrección
            if (typeof state.recordDeletedCatalogItem === 'function') {
                state.recordDeletedCatalogItem(itemId);
            }

            // Purgar de la memoria local
            state.data.catalog = state.data.catalog.filter(i => String(i?.id) !== String(itemId));
            state.saveLocalOnly();

            if (!d1Ok) {
                const pushed = await state.pushToCloud(false);
                if (!pushed) {
                    this.notify(`Artículo "${itemId}" purgado en local (pendiente de D1).`, "warning");
                    this.render();
                    return;
                }
            }

            this.notify(`Artículo "${itemId}" purgado y confirmado en D1.`, "info");
            this.render();
        } finally {
            // 3. Reanudar ciclo de polling
            state.resumePolling();
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
            const elName = document.getElementById(`val-name-${pid}`);
            if (!elPrice) return;
            const price = parseFloat(elPrice.value);
            if(isNaN(price) || price <= 0) return this.notify("Introduce un precio €v válido mayor que cero.", "warning");
            
            const rawOfficialName = elName && elName.value.trim() ? elName.value.trim() : (req.name || 'Componente Especial I+D');
            const cleanOfficialName = this.cleanInput(rawOfficialName);
            
            state.data.catalog.unshift({ 
                id: 'CUST-' + pid, 
                name: `[ESP] ${cleanOfficialName}`, 
                price: price, 
                unit: 'Especial', 
                category: 'Externo',
                origin: 'I+D Local',
                exclusiveFor: coId,
                driveUrl: req.driveUrl || ''
            });
            
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial "${cleanOfficialName}" ha sido APROBADA e integrada al catálogo por ${price} €v.`, 'success');
        } else {
            ui.pushNotification(coId, 'TECNICO', `Tu solicitud de I+D Especial ha sido DENEGADA por el Claustro.`, 'error');
        }
        
        if (state.data.companies && state.data.companies[coId]) {
            state.data.companies[coId].updatedAt = Date.now();
        }
        state.data.pendingCustom.splice(reqIdx, 1); 
        state.save(coId); 
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

        state.save(cid);
        this.closeModal();
        this.render();
    },

    resolveBrandApproval(cid) {
        const co = state.data.companies[cid];
        if(!co || !co.brandApproval) return;

        const inputEl = document.getElementById('coord-official-slogan-' + cid);
        const officialSlogan = (inputEl && inputEl.value.trim()) ? this.cleanInput(inputEl.value) : (co.brandApproval.pendingSlogan || co.slogan || '');

        if (!officialSlogan && !co.brandApproval.pendingLogo) {
            return this.notify("Debes escribir o confirmar el slogan oficial aprobado.", "warning");
        }

        if (officialSlogan) co.slogan = officialSlogan;
        if (co.brandApproval.pendingLogo) co.logo = co.brandApproval.pendingLogo;

        co.brandApproval.status = 'APROBADO';
        co.brandApproval.pendingLogo = null;
        co.brandApproval.pendingSlogan = "";
        co.brandApproval.feedback = "";
        co.brandApproval.updatedAt = Date.now();
        co.updatedAt = Date.now();

        ui.pushNotification(cid, 'MARKETING', `¡Enhorabuena! El logotipo y el eslogan oficial ("${co.slogan}") han sido APROBADOS por Coordinación y ya son públicos en el HUD.`, 'success');
        ui.pushNotification(cid, 'CEO', `Identidad corporativa aprobada y visible para toda la flota. Slogan: "${co.slogan}".`, 'success');

        state.save(cid);
        this.notify(`Identidad corporativa de ${co.name} aprobada y registrada.`, "success");
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
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: (co.ledger || []).filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(Number(l.delta) || 0), 0), sponsorReduction: 0, net: (co.ledger || []).filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(Number(l.delta) || 0), 0) };
        const expenses = (co.ledger || []).filter(l => l.delta < 0);

        const rowsHtml = expenses.slice(0, 100).map(e => `
            <tr class="border-b border-slate-800">
                <td class="py-2 pr-2 text-slate-300 text-xs">${this.escapeHTML(e.date)}</td>
                <td class="py-2 pr-2 text-white font-bold text-xs break-words">${this.escapeHTML(e.concept)}</td>
                <td class="py-2 pr-2 text-mars-cyan text-xs uppercase">${this.escapeHTML(e.dept)}</td>
                <td class="py-2 text-right font-mono text-mars-magenta font-bold text-xs">${Number(e.delta).toFixed(2)} €v</td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="py-4 text-center text-slate-300 text-xs italic">Esta startup no registra salidas de capital virtual.</td></tr>`;

        const html = `
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900 border border-mars-cyan p-3 mb-4">
                <div>
                    <span class="text-[10px] text-slate-400 uppercase font-bold block">Costes Operativos Brutos</span>
                    <span class="text-base font-orbitron text-mars-yellow font-black">-${opCosts.gross.toFixed(2)} €v</span>
                </div>
                <div>
                    <span class="text-[10px] text-mars-cyan uppercase font-bold block">Reducción por Patrocinio</span>
                    <span class="text-base font-orbitron text-mars-green font-black">+${opCosts.sponsorReduction.toFixed(2)} €v</span>
                </div>
                <div>
                    <span class="text-[10px] text-slate-300 uppercase font-bold block">Costes Operativos Netos</span>
                    <span class="text-lg font-orbitron text-mars-magenta font-black">-${opCosts.net.toFixed(2)} €v</span>
                </div>
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
        const currentAmount = co.sponsorData?.amount || (currentTier === 'ORO' ? 500 : (currentTier === 'PLATA' ? 400 : (currentTier === 'BRONCE' ? 250 : (currentTier === 'COBRE' ? 150 : 100))));

        const html = `
            <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Inyecta capital virtual de patrocinio (Fase I) y personaliza la marca patrocinadora.</p>
            <div class="space-y-3">
                <div>
                    <label for="sp-tier" class="text-xs text-mars-yellow uppercase font-bold block mb-1">Nivel de Patrocinio</label>
                    <select id="sp-tier" onchange="const amounts = { ORO: 500, PLATA: 400, BRONCE: 250, COBRE: 150, COLABORADOR: 100 }; document.getElementById('sp-amount').value = amounts[this.value] || 100;" class="min-h-[44px] w-full bg-slate-900 border border-mars-yellow p-2.5 text-xs text-white font-bold uppercase outline-none">
                        <option value="ORO" ${currentTier==='ORO'?'selected':''}>🥇 Nivel ORO (+500 €v)</option>
                        <option value="PLATA" ${currentTier==='PLATA'?'selected':''}>🥈 Nivel PLATA (+400 €v)</option>
                        <option value="BRONCE" ${currentTier==='BRONCE'?'selected':''}>🥉 Nivel BRONCE (+250 €v)</option>
                        <option value="COBRE" ${currentTier==='COBRE'?'selected':''}>🔶 Nivel COBRE (+150 €v)</option>
                        <option value="COLABORADOR" ${currentTier==='COLABORADOR'?'selected':''}>🤝 Nivel COLABORADOR (+100 €v)</option>
                    </select>
                </div>
                <div>
                    <label for="sp-amount" class="text-xs text-mars-green uppercase font-bold block mb-1">Inyección Económica al Ledger (€v)</label>
                    <input type="number" id="sp-amount" value="${currentAmount}" step="25" class="min-h-[44px] w-full bg-slate-900 border border-mars-border p-2.5 text-sm text-mars-green font-mono font-bold outline-none">
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
            const now = Date.now();
            co.sponsorAwarded = tier;
            co.sponsorData = { 
                name: spName, 
                tier: tier, 
                amount: amount, 
                date: now, 
                logo: logoDataUrl !== undefined ? logoDataUrl : (co.sponsorData?.logo || null) 
            };

            // Eliminar asientos previos de patrocinio en co.ledger para no duplicar saldo
            co.ledger = Array.isArray(co.ledger) ? co.ledger.filter(tx => !(tx && typeof tx.concept === 'string' && tx.concept.startsWith('[PATROCINIO'))) : [];

            if (amount !== 0) {
                const txId = 'TX-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
                co.ledger.unshift({
                    id: txId,
                    tx_id: txId,
                    date: new Date().toLocaleString(),
                    concept: `[PATROCINIO ${tier}] Inyección de capital por ${spName}`,
                    dept: 'DIRECCIÓN_AEE',
                    delta: amount,
                    timestamp: now,
                    final: 0
                });
            }

            state.recalculateBalance(co);
            if (co.ledger[0]) co.ledger[0].final = co.balance;
            co.updatedAt = now;

            ui.pushNotification(cid, 'CEO', `¡Habéis obtenido el Patrocinio ${tier} de ${spName} (+${amount} €v)!`, 'success');
            state.save(cid);
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
        co.updatedAt = Date.now();
        state.save(cid);
        this.closeModal();
        this.render();
    },

    resolveNameChangeRequest(cid, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co || !co.nameChangeRequest || co.nameChangeRequest.status !== 'PENDIENTE') return;

        if (isApproved) {
            const inputEl = document.getElementById('coord-new-co-name-' + cid);
            const officialName = inputEl ? this.cleanInput(inputEl.value) : (co.nameChangeRequest.proposedName || '');
            if (!officialName || officialName === 'Propuesta en Documento Drive') {
                return this.notify("Debes escribir la nueva denominación social oficial para la empresa.", "warning");
            }
            if (ui.hasForbiddenWords && ui.hasForbiddenWords(officialName, 'Registro Mercantil (Nombre Oficial)', inputEl)) return;

            const oldName = co.name;
            co.name = officialName;
            co.nameChangeRequest.proposedName = officialName;
            ui.pushNotification(cid, 'CEO', `¡El Registro Mercantil ha aprobado vuestra nueva denominación social: "${co.name}"!`, 'success');
            this.notify(`La empresa ${oldName} ahora se llama ${co.name}.`, "success");
        } else {
            ui.pushNotification(cid, 'CEO', `El Registro Mercantil ha RECHAZADO la solicitud de cambio de denominación social.`, 'error');
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

    checkCoordinatorAccess() {
        const cu = (typeof currentUser !== 'undefined' ? currentUser : null) || state.currentUser || state.user;
        if (!cu) return false;
        const r = String(cu.role || '').toLowerCase();
        // Guarda de seguridad v1.1.02: Abortar inmediatamente si currentUser.role !== 'coordinador'
        if (cu.role !== 'coordinador' && r !== 'coordinador' && !r.includes('coord') && !cu.admin) {
            if (typeof ui !== 'undefined' && ui.notify) {
                ui.notify("ACCESO DENEGADO // Requiere privilegios de Coordinador.", "error");
            }
            return false;
        }
        return true;
    },

    renderCredentialCardHTML(co, role, code, pin) {
        const meta = this.getRoleMetadata(role);
        const deptName = (role === 'AUXILIAR' && co.auxRoleDept) ? `DPTO: ${co.auxRoleDept}` : meta.dept;
        const matricula = `${code}-${role}`;
        const slogan = co.slogan || "ADVANCED AEROSPACE MISSION 2026";

        // Generación dinámica de código de barras cyberpunk en SVG a partir de la matrícula
        const generateDynamicBarcode = (idStr) => {
            const seed = String(idStr || 'AEE-0000');
            let bars = '';
            let x = 4;
            for (let i = 0; i < seed.length; i++) {
                const c = seed.charCodeAt(i);
                const w1 = ((c * 3) % 4) + 1.2;
                const gap1 = ((c * 2) % 3) + 1.2;
                const w2 = ((c * 5) % 3) + 1.0;
                const gap2 = 1.8;
                bars += `<rect x="${x.toFixed(1)}" y="0" width="${w1.toFixed(1)}" height="32" fill="#FF007F" />`;
                x += w1 + gap1;
                bars += `<rect x="${x.toFixed(1)}" y="0" width="${w2.toFixed(1)}" height="32" fill="#FF007F" />`;
                x += w2 + gap2;
            }
            return `<svg viewBox="0 0 ${Math.max(Math.ceil(x + 4), 160)} 32" class="w-full h-8" preserveAspectRatio="none">${bars}</svg>`;
        };

        const barcodeSvg = generateDynamicBarcode(matricula);

        return `
        <div class="credential-card-pair flex flex-col md:flex-row gap-4 justify-center items-center font-mono text-white select-none" style="page-break-inside: avoid; break-inside: avoid;">
            
            <!-- ANVERSO // FRONT CARD -->
            <div class="credential-card relative w-[300px] h-[520px] bg-[#07090E] border-2 border-[#1A2333] p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)]" style="page-break-inside: avoid; break-inside: avoid;">
                <!-- Trazados de circuito decorativo SVG en esquinas -->
                <svg class="absolute top-0 right-0 w-36 h-36 pointer-events-none opacity-40" viewBox="0 0 100 100">
                    <path d="M 10 0 L 30 20 L 70 20 L 90 40 L 90 90" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <path d="M 40 0 L 50 10 L 80 10 L 100 30" fill="none" stroke="#00F0FF" stroke-width="1"/>
                    <circle cx="90" cy="90" r="2.5" fill="#00F0FF"/>
                    <circle cx="100" cy="30" r="2" fill="#FF007F"/>
                </svg>
                <svg class="absolute bottom-0 left-0 w-36 h-36 pointer-events-none opacity-40" viewBox="0 0 100 100">
                    <path d="M 0 60 L 20 80 L 60 80 L 80 100" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <circle cx="80" cy="100" r="2.5" fill="#FF007F"/>
                </svg>

                <!-- Cabecera Superior: Matrícula & Clase -->
                <div class="relative z-10 flex justify-between items-center border-b border-[#1A2333] pb-2">
                    <div class="flex items-center gap-1.5">
                        <span class="inline-block w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
                        <span class="font-orbitron font-black text-[10px] text-[#00F0FF] tracking-widest uppercase">AEE // ID-CARD</span>
                    </div>
                    <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">SEC: ${this.escapeHTML(code)}</span>
                </div>

                <!-- Recuadro de Identificación con Avatar Reticular y Bordes Achaflanados -->
                <div class="relative z-10 my-auto flex flex-col items-center">
                    <span class="text-[9px] text-[#00F0FF] tracking-widest uppercase font-mono font-bold mb-1">TACTICAL AVATAR // RETICULAR</span>
                    
                    <!-- Contenedor con borde achaflanado neón magenta (#FF007F) y cian criogénico (#00F0FF) -->
                    <div class="relative w-40 h-44 p-1" style="background: linear-gradient(135deg, #FF007F 0%, #1A2333 45%, #00F0FF 100%); clip-path: polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%);">
                        <div class="w-full h-full bg-[#07090E] p-2 flex items-center justify-center relative overflow-hidden" style="clip-path: polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%);">
                            <!-- Retícula tech SVG con silueta y ojos brillantes -->
                            <svg viewBox="0 0 160 180" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="reticular-grid-${this.escapeHTML(code)}-${this.escapeHTML(role)}" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1A2333" stroke-width="0.8"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#reticular-grid-${this.escapeHTML(code)}-${this.escapeHTML(role)})" />
                                
                                <!-- Silueta humana / tripulante en fondo espacial -->
                                <g fill="#0A0E17" stroke="#FF007F" stroke-width="1.2">
                                    <path d="M 25 175 Q 30 120 55 115 L 65 110 L 95 110 L 105 115 Q 130 120 135 175 Z" />
                                    <path d="M 55 75 Q 52 38 80 35 Q 108 38 105 75 Q 105 105 80 107 Q 55 105 55 75 Z" />
                                    <!-- Visor / ojos brillantes criogénicos -->
                                    <path d="M 66 65 Q 80 63 94 65 Q 92 73 80 74 Q 68 73 66 65 Z" fill="#00F0FF" stroke="#00F0FF" />
                                </g>
                                <circle cx="15" cy="15" r="2" fill="#00F0FF"/>
                                <circle cx="145" cy="15" r="2" fill="#FF007F"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Bloque de Código de Barras Dinámico con Matrícula -->
                <div class="relative z-10 bg-black/80 border border-[#00F0FF]/60 p-2 my-2">
                    <div class="flex justify-between items-center text-[9px] text-[#00F0FF] font-mono font-bold mb-1">
                        <span>MATRÍCULA: ${this.escapeHTML(matricula)}</span>
                        <span class="text-[#FF007F]">PIN: ${this.escapeHTML(pin)}</span>
                    </div>
                    <div class="w-full bg-[#07090E] p-1 border border-[#1A2333]">
                        ${barcodeSvg}
                    </div>
                </div>

                <!-- Bloque de Nombre y Posición -->
                <div class="relative z-10 border-t border-[#1A2333] pt-2">
                    <h3 class="font-orbitron font-black text-sm text-white uppercase tracking-wider truncate" title="${this.escapeHTML(co.name)}">
                        ${this.escapeHTML(co.name)}
                    </h3>
                    <div class="flex justify-between items-baseline mt-0.5">
                        <span class="text-xs font-bold font-orbitron uppercase text-[#FF007F] tracking-wide">${this.escapeHTML(meta.name)}</span>
                        <span class="text-[9px] bg-mars-yellow text-black px-1.5 py-0.2 font-black uppercase">CLASE ${this.escapeHTML(co.classGroup || 'A')}</span>
                    </div>
                    <p class="text-[9px] text-slate-400 font-mono uppercase truncate mt-0.5">${this.escapeHTML(deptName)}</p>
                </div>
            </div>

            <!-- REVERSO // BACK CARD -->
            <div class="credential-card relative w-[300px] h-[520px] bg-[#07090E] border-2 border-[#1A2333] p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(255,0,127,0.15)]" style="page-break-inside: avoid; break-inside: avoid;">
                <!-- Trazados de circuito superiores -->
                <svg class="absolute top-0 left-0 w-full h-32 pointer-events-none opacity-40" viewBox="0 0 200 80">
                    <path d="M 0 20 L 50 20 L 80 50 L 150 50 L 170 30 L 200 30" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <path d="M 30 0 L 40 10 L 70 10 L 90 30 L 140 30" fill="none" stroke="#00F0FF" stroke-width="1"/>
                    <circle cx="80" cy="50" r="2.5" fill="#00F0FF"/>
                    <circle cx="170" cy="30" r="2" fill="#FF007F"/>
                </svg>

                <!-- Encabezado Reverso: Misión y Protocolo -->
                <div class="relative z-10 flex justify-between items-center border-b border-[#1A2333] pb-2">
                    <span class="font-orbitron font-black text-[10px] text-slate-400 uppercase tracking-widest">MARS-KET OS // v1.1.02</span>
                    <span class="text-[9px] font-mono text-[#00F0FF] uppercase">ESA / AEE CERTIFIED</span>
                </div>

                <!-- Centro del Reverso: Logo Hexagonal Neón y Eslogan -->
                <div class="relative z-10 my-auto text-center flex flex-col items-center justify-center space-y-3">
                    <!-- Icono Hexagonal Neón Magenta -->
                    <div class="relative w-16 h-16 flex items-center justify-center" style="background: #FF007F; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); filter: drop-shadow(0 0 10px #FF007F);">
                        <div class="w-14 h-14 bg-[#07090E] flex items-center justify-center" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                            <span class="font-orbitron font-black text-xl text-[#FF007F]">M</span>
                        </div>
                    </div>

                    <div>
                        <h2 class="font-orbitron font-black text-lg text-[#FF007F] tracking-widest uppercase break-words">${this.escapeHTML(co.name)}</h2>
                        <p class="font-mono text-xs text-slate-300 tracking-wider uppercase mt-1 italic">"${this.escapeHTML(slogan)}"</p>
                    </div>

                    <div class="bg-black/60 border border-[#1A2333] p-2 text-left w-full space-y-1 text-[10px] text-slate-400 font-mono">
                        <div class="flex justify-between"><span>ESCUDERÍA:</span><span class="text-white font-bold">${this.escapeHTML(co.name)}</span></div>
                        <div class="flex justify-between"><span>CÓDIGO ACCESO:</span><span class="text-mars-yellow font-bold">${this.escapeHTML(code)}</span></div>
                        <div class="flex justify-between"><span>ROL ASIGNADO:</span><span class="text-[#00F0FF] font-bold">${this.escapeHTML(role)}</span></div>
                    </div>
                </div>

                <!-- Bloque Inferior CAUTION con Pictograma de Peligro y Protocolo -->
                <div class="relative z-10 border-2 border-[#FF007F] bg-[#FF007F]/10 p-2.5 text-left">
                    <div class="flex items-center gap-2 mb-1">
                        <!-- Pictograma de peligro (triángulo con !) -->
                        <svg class="w-5 h-5 text-[#FF007F] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L1 21h22L12 2zm0 3.5l8.5 14.5H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                        </svg>
                        <span class="font-orbitron font-black text-[10px] text-[#FF007F] uppercase tracking-widest">CAUTION: RESTRICTED ACCESS</span>
                    </div>
                    <p class="text-[8px] text-slate-300 font-mono leading-tight tracking-tight uppercase">
                        RESTRICTED ACCESS PROTOCOL // NIVEL AEE-4 // SECURE ID. PROHIBIDA LA DIVULGACIÓN DEL PIN O CESIÓN DE ESTA TARJETA.
                    </p>
                </div>
            </div>

        </div>`;
    },

    generateRoleCredentialCard(cid, role) {
        if (!this.checkCoordinatorAccess()) return;
        const co = state.data.companies[cid];
        if (!co) return this.notify("Startup no encontrada.", "error");
        const code = state.getCompanyCode(co);
        const pin = state.getRolePin(co, role) || (role === 'AUXILIAR' ? '5555' : '1234');
        const cardHtml = this.renderCredentialCardHTML(co, role, code, pin);
        
        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Credencial individual Cyberpunk lista para plastificar (A4).</span>
                    <span class="text-mars-cyan font-bold">${this.escapeHTML(co.name)} [${role}]</span>
                </div>
                <div class="max-w-2xl mx-auto w-full flex justify-center">
                    ${cardHtml}
                </div>
            </div>
        `;
        this.showCredentialsModal(`CREDENCIAL OFICIAL // ${role} - ${co.name}`, previewHtml, cardHtml);
    },

    generateCompanyCredentialCards(cid) {
        if (!this.checkCoordinatorAccess()) return;
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
            <div class="credentials-grid grid grid-cols-1 gap-6">
                ${cardsList.join('')}
            </div>
        `;

        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Flota completa de credenciales Cyberpunk (${roles.length} tripulantes) de <strong>${this.escapeHTML(co.name)}</strong>.</span>
                    <span class="text-mars-yellow font-bold uppercase">Clase ${this.escapeHTML(co.classGroup || 'A')}</span>
                </div>
                ${cardsGrid}
            </div>
        `;

        this.showCredentialsModal(`CREDENCIALES DE FLOTA // ${co.name}`, previewHtml, cardsGrid);
    },

    generateAllCompaniesCredentialCards() {
        if (!this.checkCoordinatorAccess()) return;
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
            <div class="credentials-grid grid grid-cols-1 gap-6">
                ${allCardsHtml}
            </div>
        `;

        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Baraja completa de aula: <strong>${totalCards} credenciales</strong> generadas para ${cos.length} startups.</span>
                    <span class="text-mars-green font-bold uppercase">Listo para Impresión A4</span>
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
        if (!this.checkCoordinatorAccess()) return;
        if (typeof window !== 'undefined' && typeof window.print === 'function') {
            window.print();
        } else {
            this.notify("La función de impresión no está disponible en este entorno.", "warning");
        }
    },

    renderTeacherCredentialCardHTML(tk, teacher) {
        const pin = teacher.pin || '0000';
        const name = teacher.name || tk;
        const matricula = `DOC-${tk}`;

        const generateDynamicBarcode = (idStr) => {
            const seed = String(idStr || 'AEE-0000');
            let bars = '';
            let x = 4;
            for (let i = 0; i < seed.length; i++) {
                const c = seed.charCodeAt(i);
                const w1 = ((c * 3) % 4) + 1.2;
                const gap1 = ((c * 2) % 3) + 1.2;
                const w2 = ((c * 5) % 3) + 1.0;
                const gap2 = 1.8;
                bars += `<rect x="${x.toFixed(1)}" y="0" width="${w1.toFixed(1)}" height="32" fill="#FFB300" />`;
                x += w1 + gap1;
                bars += `<rect x="${x.toFixed(1)}" y="0" width="${w2.toFixed(1)}" height="32" fill="#FFB300" />`;
                x += w2 + gap2;
            }
            return `<svg viewBox="0 0 ${Math.max(Math.ceil(x + 4), 160)} 32" class="w-full h-8" preserveAspectRatio="none">${bars}</svg>`;
        };

        const barcodeSvg = generateDynamicBarcode(matricula);

        return `
        <div class="credential-card-pair flex flex-col md:flex-row gap-4 justify-center items-center font-mono text-white select-none my-3" style="page-break-inside: avoid; break-inside: avoid;">
            
            <!-- ANVERSO // FRONT CARD -->
            <div class="credential-card relative w-[300px] h-[520px] bg-[#07090E] border-2 border-[#1A2333] p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(0,240,255,0.15)]" style="page-break-inside: avoid; break-inside: avoid;">
                <!-- Trazados de circuito decorativo SVG en esquinas -->
                <svg class="absolute top-0 right-0 w-36 h-36 pointer-events-none opacity-40" viewBox="0 0 100 100">
                    <path d="M 10 0 L 30 20 L 70 20 L 90 40 L 90 90" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <path d="M 40 0 L 50 10 L 80 10 L 100 30" fill="none" stroke="#00F0FF" stroke-width="1"/>
                    <circle cx="90" cy="90" r="2.5" fill="#00F0FF"/>
                    <circle cx="100" cy="30" r="2" fill="#FF007F"/>
                </svg>
                <svg class="absolute bottom-0 left-0 w-36 h-36 pointer-events-none opacity-40" viewBox="0 0 100 100">
                    <path d="M 0 60 L 20 80 L 60 80 L 80 100" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <circle cx="80" cy="100" r="2.5" fill="#FF007F"/>
                </svg>

                <!-- Cabecera Superior: Matrícula & Claustro -->
                <div class="relative z-10 flex justify-between items-center border-b border-[#1A2333] pb-2">
                    <div class="flex items-center gap-1.5">
                        <span class="inline-block w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse"></span>
                        <span class="font-orbitron font-black text-[10px] text-[#00F0FF] tracking-widest uppercase">AEE // FACULTY ID</span>
                    </div>
                    <span class="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">${this.escapeHTML(tk)}</span>
                </div>

                <!-- Recuadro de Identificación con Avatar Reticular y Bordes Achaflanados -->
                <div class="relative z-10 my-auto flex flex-col items-center">
                    <span class="text-[9px] text-[#00F0FF] tracking-widest uppercase font-mono font-bold mb-1">FACULTY CREDENTIAL // AEE</span>
                    
                    <!-- Contenedor con borde achaflanado neón magenta (#FF007F) y cian criogénico (#00F0FF) -->
                    <div class="relative w-40 h-44 p-1" style="background: linear-gradient(135deg, #FF007F 0%, #1A2333 45%, #00F0FF 100%); clip-path: polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%);">
                        <div class="w-full h-full bg-[#07090E] p-2 flex items-center justify-center relative overflow-hidden" style="clip-path: polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%);">
                            <svg viewBox="0 0 160 180" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <pattern id="reticular-grid-teach-${this.escapeHTML(tk)}" width="10" height="10" patternUnits="userSpaceOnUse">
                                        <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1A2333" stroke-width="0.8"/>
                                    </pattern>
                                </defs>
                                <rect width="100%" height="100%" fill="url(#reticular-grid-teach-${this.escapeHTML(tk)})" />
                                <g fill="#0A0E17" stroke="#00F0FF" stroke-width="1.2">
                                    <path d="M 25 175 Q 30 120 55 115 L 65 110 L 95 110 L 105 115 Q 130 120 135 175 Z" />
                                    <path d="M 55 75 Q 52 38 80 35 Q 108 38 105 75 Q 105 105 80 107 Q 55 105 55 75 Z" />
                                    <path d="M 66 65 Q 80 63 94 65 Q 92 73 80 74 Q 68 73 66 65 Z" fill="#FFB300" stroke="#FFB300" />
                                </g>
                                <circle cx="15" cy="15" r="2" fill="#FF007F"/>
                                <circle cx="145" cy="15" r="2" fill="#00F0FF"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Bloque de Código de Barras Dinámico con Identificador y PIN destacado en ámbar -->
                <div class="relative z-10 bg-black/80 border border-[#00F0FF]/60 p-2 my-2">
                    <div class="flex justify-between items-center text-[9px] text-[#00F0FF] font-mono font-bold mb-1">
                        <span>MATRÍCULA: ${this.escapeHTML(matricula)}</span>
                        <span class="text-[#FFB300] font-black text-xs font-mono">PIN: ${this.escapeHTML(pin)}</span>
                    </div>
                    <div class="w-full bg-[#07090E] p-1 border border-[#1A2333]">
                        ${barcodeSvg}
                    </div>
                </div>

                <!-- Bloque de Nombre y Posición -->
                <div class="relative z-10 border-t border-[#1A2333] pt-2">
                    <h3 class="font-orbitron font-black text-sm text-white uppercase tracking-wider truncate" title="${this.escapeHTML(name)}">
                        ${this.escapeHTML(name)}
                    </h3>
                    <div class="flex justify-between items-baseline mt-0.5">
                        <span class="text-xs font-bold font-orbitron uppercase text-[#FF007F] tracking-wide">CLAUSTRO EVALUADOR</span>
                        <span class="text-[9px] bg-mars-yellow text-black px-1.5 py-0.2 font-black uppercase">DOCENTE</span>
                    </div>
                    <p class="text-[9px] text-slate-400 font-mono uppercase truncate mt-0.5">ESTADO: ACTIVO // AEE-AUTORIZADO</p>
                </div>
            </div>

            <!-- REVERSO // BACK CARD -->
            <div class="credential-card relative w-[300px] h-[520px] bg-[#07090E] border-2 border-[#1A2333] p-4 flex flex-col justify-between overflow-hidden shadow-[0_0_25px_rgba(255,0,127,0.15)]" style="page-break-inside: avoid; break-inside: avoid;">
                <svg class="absolute top-0 left-0 w-full h-32 pointer-events-none opacity-40" viewBox="0 0 200 80">
                    <path d="M 0 20 L 50 20 L 80 50 L 150 50 L 170 30 L 200 30" fill="none" stroke="#1A2333" stroke-width="1.5"/>
                    <path d="M 30 0 L 40 10 L 70 10 L 90 30 L 140 30" fill="none" stroke="#00F0FF" stroke-width="1"/>
                    <circle cx="80" cy="50" r="2.5" fill="#00F0FF"/>
                    <circle cx="170" cy="30" r="2" fill="#FF007F"/>
                </svg>

                <div class="relative z-10 flex justify-between items-center border-b border-[#1A2333] pb-2">
                    <span class="font-orbitron font-black text-[10px] text-slate-400 uppercase tracking-widest">MARS-KET OS // v1.1.05</span>
                    <span class="text-[9px] font-mono text-[#00F0FF] uppercase">AEE FACULTY PROTOCOL</span>
                </div>

                <div class="relative z-10 my-auto text-center flex flex-col items-center justify-center space-y-3">
                    <div class="relative w-16 h-16 flex items-center justify-center" style="background: #FF007F; clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%); filter: drop-shadow(0 0 10px #FF007F);">
                        <div class="w-14 h-14 bg-[#07090E] flex items-center justify-center" style="clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);">
                            <span class="font-orbitron font-black text-xl text-[#00F0FF]">D</span>
                        </div>
                    </div>

                    <div>
                        <h2 class="font-orbitron font-black text-lg text-[#00F0FF] tracking-widest uppercase break-words">${this.escapeHTML(name)}</h2>
                        <p class="font-mono text-xs text-slate-300 tracking-wider uppercase mt-1 italic">"AGENCIA ESPACIAL ESPAÑOLA - MISIÓN MARS-KET"</p>
                    </div>

                    <div class="bg-black/60 border border-[#1A2333] p-2 text-left w-full space-y-1 text-[10px] text-slate-400 font-mono">
                        <div class="flex justify-between"><span>IDENTIFICADOR:</span><span class="text-white font-bold">${this.escapeHTML(tk)}</span></div>
                        <div class="flex justify-between"><span>PERMISO:</span><span class="text-mars-yellow font-bold">EVALUACIÓN & CONTROL</span></div>
                        <div class="flex justify-between"><span>PIN AUTORIZADO:</span><span class="text-[#FFB300] font-bold font-mono text-xs">${this.escapeHTML(pin)}</span></div>
                    </div>
                </div>

                <div class="relative z-10 border-2 border-[#FF007F] bg-[#FF007F]/10 p-2.5 text-left">
                    <div class="flex items-center gap-2 mb-1">
                        <svg class="w-5 h-5 text-[#FF007F] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2L1 21h22L12 2zm0 3.5l8.5 14.5H3.5L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z"/>
                        </svg>
                        <span class="font-orbitron font-black text-[10px] text-[#FF007F] uppercase tracking-widest">CAUTION: CLASSIFIED TEACHER ACCESS</span>
                    </div>
                    <p class="text-[8px] text-slate-300 font-mono leading-tight tracking-tight uppercase">
                        RESTRICTED ACCESS PROTOCOL // NIVEL AEE-DOCENTE // CREDENCIAL CLASIFICADA. PROHIBIDA LA DIVULGACIÓN DEL PIN O CESIÓN DE ESTA TARJETA.
                    </p>
                </div>
            </div>

        </div>`;
    },

    async exportTeacherBadgesPDF() {
        if (!state.user || (!state.user.role.startsWith('COORD') && state.user.role !== 'coordinador')) {
            console.error('[SECURITY_VIOLATION] Intento de acceso no autorizado a exportTeacherBadgesPDF.');
            if (typeof this.notify === 'function') this.notify("❌ Acceso restringido exclusivamente a Coordinación docente.", "error");
            throw new Error("SECURITY_EXCEPTION: Permisos de Coordinador requeridos");
        }

        let teachers = state.data.config?.teachers || {};
        try {
            const token = state.getAuthToken(state.user, state.data);
            const res = await fetch('/api/admin/credentials', {
                headers: {
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                }
            });
            if (res.ok) {
                const creds = await res.json().catch(() => null);
                if (creds && creds.teachers) {
                    teachers = creds.teachers;
                    if (state.data.config) state.data.config.teachers = teachers;
                }
            }
        } catch(e) {
            console.warn("Aviso: usando credenciales locales para PDF:", e);
        }

        const teacherKeys = Object.keys(teachers);
        if (teacherKeys.length === 0) {
            return this.notify("No hay profesores registrados en el sistema.", "warning");
        }

        const cardsList = teacherKeys.map(tk => {
            return this.renderTeacherCredentialCardHTML(tk, teachers[tk]);
        });

        const cardsGrid = `
            <div class="credentials-grid grid grid-cols-1 gap-6">
                ${cardsList.join('')}
            </div>
        `;

        const previewHtml = `
            <div class="space-y-4">
                <div class="bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-300 flex justify-between items-center flex-wrap gap-2">
                    <span>🪪 Acreditaciones oficiales del Claustro Docente (${teacherKeys.length} tarjetas).</span>
                    <span class="text-mars-cyan font-bold uppercase">Nivel AEE Docente</span>
                </div>
                ${cardsGrid}
            </div>
        `;

        this.showCredentialsModal(`CREDENCIALES OFICIALES // CLAUSTRO DOCENTE (${teacherKeys.length})`, previewHtml, cardsGrid);
    }
});

window.exportBadgePDF = function() {
  if (!state.user || (!state.user.role.startsWith('COORD') && state.user.role !== 'coordinador' && state.user.role !== 'DOCENTE')) {
    console.error('[SECURITY_VIOLATION] Intento de acceso no autorizado a credenciales.');
    if (typeof ui !== 'undefined' && ui.notify) ui.notify('Acceso denegado. Se requiere nivel de Coordinador.', 'error');
    throw new Error("SECURITY_EXCEPTION: Permisos de Coordinador requeridos");
  }
  return ui.printCredentialCards();
};

window.exportTeacherBadgesPDF = function() {
  if (!state.user || (!state.user.role.startsWith('COORD') && state.user.role !== 'coordinador')) {
    console.error('[SECURITY_VIOLATION] Intento de acceso no autorizado a exportTeacherBadgesPDF.');
    if (typeof ui !== 'undefined' && ui.notify) ui.notify('Acceso denegado. Se requiere nivel de Coordinador.', 'error');
    throw new Error("SECURITY_EXCEPTION: Permisos de Coordinador requeridos");
  }
  return ui.exportTeacherBadgesPDF();
};