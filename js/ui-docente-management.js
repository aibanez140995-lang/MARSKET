// js/ui-docente-management.js
// --- MÓDULO DOCENTE: GESTIÓN, LLAVERO MAESTRO, ADUANAS Y REGISTRO MERCANTIL (v1.0.17) ---

Object.assign(ui, {
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
                        <p class="text-[9px] text-red-300 uppercase mt-0.5">El sistema ha bloqueado intentos de uso de lenguaje prohibido (nombres o insultos).</p>
                    </div>
                    <span class="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase">${incidents.length} Infracciones</span>
                </div>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
                    ${incidents.map(inc => {
                        const coName = state.data.companies[inc.coId]?.name || 'Desconocida';
                        const isName = inc.severity === 'NAME';
                        const colors = isName ? 'border-mars-yellow bg-mars-yellow/5' : 'border-red-800 bg-black';
                        const titleColor = isName ? 'text-mars-yellow' : 'text-red-500';
                        const label = isName ? '⚠️ AVISO LÉXICO (USO NOMBRE PROPIO)' : '🚨 INFRACCIÓN GRAVE (LENGUAJE SOEZ)';

                        return `
                        <div class="${colors} p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px]">
                            <div>
                                <span class="${titleColor} font-bold uppercase text-[9px]">${label}</span><br>
                                <span class="text-white font-bold uppercase mt-1 inline-block">${coName} (${inc.role})</span>
                                <span class="text-slate-500 ml-2">${inc.date}</span>
                                <p class="text-white mt-1">Contexto: <span class="text-mars-yellow">${inc.context}</span></p>
                                <p class="text-slate-400 italic mt-1">Texto bloqueado: "${inc.text}"</p>
                            </div>
                            <div class="flex gap-2 shrink-0">
                                ${!isName ? `<button onclick="ui.modalAEEFine('${inc.coId}')" class="bg-red-800 text-white px-3 py-2 font-black uppercase text-[9px] hover:bg-red-600 transition-colors border border-red-500 shadow-[0_0_8px_red]">Abrir Sanción AEE</button>` : ''}
                                <button onclick="ui.resolveSecurityIncident('${inc.id}')" class="bg-slate-800 text-slate-300 px-3 py-2 font-black uppercase text-[9px] hover:bg-white hover:text-black transition-colors">Archivar</button>
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
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Solicitudes de renombramiento corporativo enviadas por los CEOs.</p>
                    </div>
                    <span class="bg-mars-yellow text-black px-3 py-1 text-[10px] font-black uppercase">${pendingNameChanges.length} Petición(es)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${pendingNameChanges.map(cid => {
                        const co = state.data.companies[cid];
                        const req = co.nameChangeRequest;
                        return `
                        <div class="bg-slate-900 border border-mars-yellow/40 p-4">
                            <p class="text-[9px] text-slate-400 uppercase font-bold mb-1">Empresa Actual:</p>
                            <h4 class="font-orbitron text-slate-300 font-bold text-xs uppercase mb-2 line-through decoration-mars-magenta">${co.name}</h4>
                            <p class="text-[9px] text-mars-green uppercase font-bold mb-1">Nuevo Nombre Propuesto:</p>
                            <h4 class="font-orbitron text-mars-yellow font-black text-sm uppercase mb-2">${req.proposedName}</h4>
                            <p class="text-slate-400 italic text-[10px] mb-3">"${req.reason}"</p>
                            <div class="flex gap-2">
                                <button onclick="ui.resolveNameChangeRequest('${cid}', true)" class="flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-[9px] hover:bg-white transition-colors">Autorizar</button>
                                <button onclick="ui.resolveNameChangeRequest('${cid}', false)" class="flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-[9px] hover:bg-mars-magenta hover:text-white transition-colors">Denegar</button>
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
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Auditoría previa de la imagen de marca de las startups.</p>
                    </div>
                    <span class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1 text-[10px] font-black uppercase">${pendingBrands.length} Pendiente(s)</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${pendingBrands.map(cid => {
                        const co = state.data.companies[cid];
                        const logoPreview = co.brandApproval.pendingLogo ? `<img src="${co.brandApproval.pendingLogo}" class="w-16 h-16 object-contain border border-mars-border bg-black p-1">` : `<div class="w-16 h-16 border border-mars-border bg-slate-900 flex items-center justify-center text-[8px] text-slate-500 uppercase text-center">Sin Logo</div>`;
                        return `
                        <div class="bg-slate-900 border border-mars-magenta/50 p-4 flex flex-col gap-3">
                            <div class="flex justify-between items-start border-b border-slate-800 pb-2">
                                <h4 class="font-orbitron text-white font-bold text-xs uppercase">${co.name} [Clase${co.classGroup}]</h4>
                                <span class="text-[8px] bg-mars-yellow/20 text-mars-yellow px-2 py-0.5 font-bold uppercase animate-pulse">En Revisión</span>
                            </div>
                            <div class="flex gap-4 items-center">
                                ${logoPreview}
                                <div class="flex-grow">
                                    <p class="text-[9px] text-slate-500 uppercase font-bold mb-1">Eslogan Propuesto:</p>
                                    <p class="text-mars-yellow italic text-[10px] bg-black p-2 border border-slate-800">"${co.brandApproval.pendingSlogan || 'No especificado'}"</p>
                                </div>
                            </div>
                            <div class="flex gap-2 mt-2">
                                <button onclick="ui.resolveBrandApproval('${cid}')" class="flex-1 bg-mars-green text-black px-3 py-2 font-black uppercase text-[9px] hover:bg-white transition-colors">Aprobar Marca</button>
                                <button onclick="ui.promptDenyBrand('${cid}')" class="flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-[9px] hover:bg-mars-magenta hover:text-white transition-colors">Rechazar (Feedback)</button>
                            </div>
                        </div>`;
                    }).join('') || '<p class="text-slate-600 text-xs italic col-span-full">No hay marcas pendientes de revisión.</p>'}
                </div>
            </div>`;

            b2bCustomsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-8 border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🛃 Aduana Aeroespacial B2B (Control de Traspasos)</h3>
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Autoriza o deniega las compraventas de segunda mano.</p>
                    </div>
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1 text-[10px] font-black uppercase">${pendingB2B.length} Pendiente(s)</span>
                </div>
                <div class="space-y-3">
                    ${pendingB2B.map(c => `
                    <div class="bg-slate-900 border border-mars-yellow/60 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px]">
                        <div class="flex-grow">
                            <div class="flex items-center gap-2 mb-1">
                                <span class="font-mono text-slate-400 font-bold">${c.id}</span>
                                <span class="text-slate-600">|</span>
                                <span class="text-slate-400">${c.date}</span>
                            </div>
                            <p class="text-white font-bold text-xs uppercase mb-1">${c.itemName} (x${c.qty || 1})</p>
                            <p class="text-slate-300 uppercase text-[9px]">
                                Vendedor: <strong class="text-mars-cyan">${c.sellerName}</strong> ➔ Comprador: <strong class="text-mars-yellow">${c.buyerName}</strong>
                            </p>
                        </div>
                        <div class="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                            <span class="text-mars-green font-mono font-black text-base">${Number(c.price).toFixed(2)} €v</span>
                            <div class="flex gap-2">
                                <button onclick="ui.resolveB2BContract('${c.id}', true)" class="bg-mars-green text-black px-4 py-2 font-black uppercase text-[9px] hover:bg-white transition-colors">Aprobar</button>
                                <button onclick="ui.resolveB2BContract('${c.id}', false)" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-[9px] hover:bg-mars-magenta hover:text-white transition-colors">Rechazar</button>
                            </div>
                        </div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">No hay contratos B2B retenidos en la Aduana en este momento.</p>'}
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
                <p class="text-[9px] text-slate-500 uppercase font-bold">Impacto económico real total</p>
            </div>
            <div class="lg:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Control Financiero, Patrocinios & Sanciones AEE</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr>
                                <th class="py-3 pr-4">Empresa</th>
                                <th class="pr-4">Bal(€v)</th>
                                <th class="pr-4">Gasto Virtual</th>
                                <th class="pr-4">Gasto Físico</th>
                                <th class="pr-4">Patrocinio Fase I</th>
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
                                    sponsorHtml = `<button onclick="ui.modalAssignSponsor('${cid}')" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1 font-bold text-[9px] uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">${c.sponsorAwarded ? `[${c.sponsorAwarded}] Editar` : 'Asignar Patrocinio'}</button>`;
                                } else {
                                    if(c.sponsorAwarded) {
                                        const cl = c.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700]':c.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0]':'text-[#cd7f32] border-[#cd7f32]';
                                        let spName = c.sponsorData?.name ? ` - ${c.sponsorData.name}` : '';
                                        let spLogo = c.sponsorData?.logo ? `<img src="${c.sponsorData.logo}" class="h-4 inline-block ml-2 rounded-sm object-contain bg-black/50 p-0.5">` : '';
                                        sponsorHtml = `<span class="${cl} font-bold text-[8px] uppercase border px-2 py-1 bg-black/50 flex items-center w-max gap-1">[PATROCINIO: ${c.sponsorAwarded}${spName}]${spLogo}</span>`;
                                    } else {
                                        sponsorHtml = `<span class="text-slate-600 font-bold text-[8px] uppercase border border-slate-700 px-2 py-1 bg-slate-900 block w-max">[SIN PATROCINIO]</span>`;
                                    }
                                }

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-4 font-orbitron text-white font-bold pr-4 flex items-center gap-2">
                                        <button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${c.name} [${c.classGroup||'A'}]</button>
                                        ${isCoord ? `<button onclick="ui.promptRenameStartup('${cid}')" title="Renombrar Denominación Social" class="bg-slate-800 text-slate-300 px-1.5 py-0.5 text-[8px] hover:bg-mars-yellow hover:text-black transition-colors rounded-sm">✏️</button>` : ''}
                                    </td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-green font-bold">${c.balance.toFixed(0)} €v</span></td>
                                    <td class="py-4 font-mono pr-4"><button onclick="ui.modalVirtualSpend('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4" title="Ver desglose detallado">${virtualSpend.toFixed(2)} €v</button></td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-magenta">${r.toFixed(2)} €</span></td>
                                    <td class="py-4 pr-4">${sponsorHtml}</td>
                                    <td class="py-4">
                                        <button onclick="ui.modalAEEFine('${cid}')" class="bg-red-900/30 border border-red-500 text-red-500 px-3 py-1 font-bold text-[8px] uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_5px_red] whitespace-nowrap">Expediente Sancionador</button>
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
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Autoriza las solicitudes de los CEOs y asigna o confirma el PIN de 4 dígitos para el miembro auxiliar.</p>
                    </div>
                    <span class="bg-mars-green/10 border border-mars-green text-mars-green px-3 py-1 text-[10px] font-black uppercase">${pendingAuxCoIds.length} Pendiente(s)</span>
                </div>
                <div class="space-y-3">
                    ${pendingAuxCoIds.map(cid => {
                        const co = state.data.companies[cid];
                        const req = co.auxRoleRequest;
                        return `
                        <div class="bg-slate-900 border border-mars-green/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px]">
                            <div>
                                <span class="font-orbitron text-white font-bold text-xs uppercase">${co.name} [Clase${co.classGroup}]</span>
                                <span class="text-slate-500 ml-2">${req.date || ''}</span>
                                <p class="text-slate-300 uppercase mt-1">Departamento Vinculado Solicitado: <strong class="text-mars-cyan">${req.dept}</strong></p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                                <label class="text-[9px] text-slate-400 uppercase font-bold">PIN:</label>
                                <input type="text" id="approve-aux-pin-${cid}" maxlength="4" value="${req.pin || '5555'}" class="w-16 bg-black border border-mars-cyan text-center text-mars-green font-mono font-bold p-1.5 outline-none">
                                <button onclick="ui.resolveAuxRoleRequest('${cid}', true)" class="bg-mars-green text-black px-4 py-2 font-black uppercase text-[9px] hover:bg-white transition-colors">Aprobar y Activar</button>
                                <button onclick="ui.resolveAuxRoleRequest('${cid}', false)" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-[9px] hover:bg-mars-magenta hover:text-white transition-colors">Denegar</button>
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
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40">${d.subject} • ${d.weight}</span>
                        <label class="text-[10px] text-white font-bold uppercase block mt-1.5 mb-2 leading-snug">${d.name}</label>
                    </div>
                    <input type="datetime-local" value="${val}" onchange="ui.updateDeadline('${d.key}', this.value)" class="w-full bg-black border border-slate-700 p-1.5 text-[10px] text-mars-yellow font-mono outline-none focus:border-mars-yellow">
                </div>`;
            }).join('');

            const teacherPins = Object.keys(state.data.config.teachers || {}).map(tk => {
                const t = state.data.config.teachers[tk];
                return `
                <div class="bg-slate-900 border border-slate-800 p-3 flex justify-between items-center">
                    <div>
                        <span class="text-[9px] text-mars-cyan font-bold uppercase block">${tk}</span>
                        <span class="text-[10px] text-white font-bold uppercase">${t.name}</span>
                    </div>
                    <input type="text" value="${t.pin}" maxlength="4" onchange="ui.updateTeacherPin('${tk}', this.value)" class="w-16 bg-black border border-mars-cyan text-center text-mars-cyan font-mono font-bold text-xs p-1.5">
                </div>`;
            }).join('');

            coordSettingsHtml = `
            <div class="terminal-border bg-mars-card p-6 mt-6 border-t-4 border-t-mars-yellow">
                <div class="mb-4 border-b border-mars-border pb-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🗓️ Gestión de Fechas Límite: Cronograma Maestro (19 Entregables)</h3>
                    <p class="text-[9px] text-slate-400 uppercase mt-0.5">Cualquier ajuste actualiza inmediatamente el semáforo temporal en todas las startups.</p>
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
                <input type="text" id="new-co-name" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Nombre Corporativo">
                <input type="number" id="new-co-cap" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan" placeholder="Capital (€v)" value="2400">
                <select id="new-co-class" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                    ${['A','B','C','D','E','F'].map(c => `<option value="${c}">Clase ${c}</option>`).join('')}
                </select>
                <button onclick="ui.createStartup()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Registrar (2400 €v)</button>
            </div>
            <div class="xl:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-yellow">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">🔑 Llavero Maestro: Códigos de Empresa y PINs</h3>
                        <p class="text-[8px] text-slate-400 uppercase mt-0.5">Credenciales desencriptadas para soporte directo al alumnado en el aula.</p>
                    </div>
                    ${isCoord ? `<button onclick="ui.exportCredentialsCSV()" class="bg-mars-yellow text-black px-3 py-1.5 text-[9px] font-black uppercase hover:bg-white transition-colors shrink-0">[📥 Exportar Llavero CSV]</button>` : ''}
                </div>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[9px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
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
                                    <td class="py-3 font-orbitron text-white font-bold pr-3"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${co.name}</button></td>
                                    <td class="py-3 text-mars-yellow font-bold pr-2">${co.classGroup}</td>
                                    <td class="py-3 pr-3">
                                        ${isCoord ? `
                                        <div class="flex items-center gap-1">
                                            <input type="text" maxlength="10" value="${coCode}" onchange="ui.updateCompanyCode('${cid}', this.value)" class="w-20 bg-black border border-mars-yellow text-center text-mars-yellow font-mono font-black p-1 outline-none uppercase">
                                            <button onclick="ui.regenerateCompanyCode('${cid}')" title="Regenerar código aleatorio" class="bg-slate-800 text-slate-300 px-1.5 py-1 hover:bg-mars-yellow hover:text-black transition-colors">🔄</button>
                                        </div>` : `<span class="text-slate-500 font-mono">***-****</span>`}
                                    </td>
                                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(rol => {
                                        const pinVal = state.getRolePin(co, rol) || '1234';
                                        return `
                                        <td class="py-3 pr-2">
                                            ${isCoord ? `<input type="text" maxlength="4" value="${pinVal}" onchange="ui.updatePIN('${cid}', '${rol}', this.value)" class="w-10 bg-black border border-mars-border text-center text-mars-cyan font-bold p-1 outline-none focus:border-mars-yellow">` : `<span class="text-slate-500">****</span>`}
                                        </td>`;
                                    }).join('')}
                                    <td class="py-3 pr-3">
                                        ${isCoord ? `
                                        <div class="flex items-center gap-1">
                                            <input type="text" maxlength="4" placeholder="----" value="${auxPin}" onchange="ui.updatePIN('${cid}', 'AUXILIAR', this.value)" class="w-10 bg-black border ${auxPin ? 'border-mars-green text-mars-green' : 'border-slate-800 text-slate-600'} text-center font-bold p-1 outline-none focus:border-mars-yellow">
                                            <span class="text-[8px] text-slate-400 uppercase">[${auxDept}]</span>
                                        </div>` : `<span class="text-slate-500">****</span>`}
                                    </td>
                                    <td class="py-3">${isCoord ? `<button onclick="if(confirm('¿Borrar startup irreversiblemente?')) ui.deleteStartup('${cid}')" class="text-mars-magenta font-bold hover:underline">Eliminar</button>` : `<span class="text-slate-600">Bloqueado</span>`}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ${isCoord ? `<p class="text-[8px] text-slate-500 mt-4 uppercase">* El alumno debe introducir primero el <strong>Código de Empresa</strong> y después el <strong>PIN de 4 dígitos</strong> de su rol. Todas las claves se almacenan cifradas en el navegador.</p>` : `<p class="text-[8px] text-mars-magenta mt-4 uppercase">Solo Coordinación puede visualizar/modificar el Llavero Maestro o eliminar startups.</p>`}
            </div>
        </div>
        ${coordSettingsHtml}`;
    },

    updateCompanyCode(cid, newCode) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const clean = (newCode || '').trim().toUpperCase();
        if (clean.length < 4) return alert("Código demasiado corto.");
        const co = state.data.companies[cid];
        if (!co) return;
        state.setCompanyCode(co, clean);
        state.save();
        this.render();
    },

    regenerateCompanyCode(cid) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co) return;
        const newCode = state.generateCompanyCode(co.name);
        state.setCompanyCode(co, newCode);
        state.save();
        this.render();
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
            csv += `"${co.name}","${co.classGroup || 'A'}","${code}","${pCeo}","${pTec}","${pFin}","${pMkt}","${pOps}","${pAux}","${dAux}"\n`;
        });
        this.downloadFile(csv, 'csv', 'marsket_llavero_credenciales_empresas.csv');
    },

    resolveAuxRoleRequest(cid, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return alert("Solo Coordinación puede autorizar el Rol Auxiliar.");
        const co = state.data.companies[cid];
        if (!co || !co.auxRoleRequest) return;

        if (isApproved) {
            const pinInput = document.getElementById(`approve-aux-pin-${cid}`);
            const finalPin = pinInput ? pinInput.value.trim() : co.auxRoleRequest.pin;
            if (!/^\d{4}$/.test(finalPin)) return alert("El PIN debe tener exactamente 4 dígitos numéricos.");

            state.setRolePin(co, 'AUXILIAR', finalPin);
            co.auxRoleDept = co.auxRoleRequest.dept;
            co.auxRoleRequest.status = 'APROBADO';
            co.auxRoleRequest.pin = finalPin;

            ui.pushNotification(cid, 'CEO', `Coordinación ha APROBADO el Rol Auxiliar vinculado a ${co.auxRoleDept}. PIN de acceso activado: ${finalPin}`, 'success');
            state.save();
            alert(`✅ Rol Auxiliar activado en ${co.name} con PIN ${finalPin}.`);
        } else {
            co.auxRoleRequest.status = 'RECHAZADO';
            ui.pushNotification(cid, 'CEO', `Tu solicitud de alta para el Rol Auxiliar ha sido DENEGADA por Coordinación.`, 'error');
            state.save();
            alert(`❌ Solicitud de Rol Auxiliar denegada para ${co.name}.`);
        }
        this.render();
    },

    renderAdminTelemetry() {
        let matRows = '';
        Object.keys(state.data.companies).forEach(cid => {
            const co = state.data.companies[cid];
            const s = co.loginStats || { totalLogins:0, roles:{} }; 
            matRows += `<tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-3 font-orbitron text-white font-bold pr-4">${co.name}</td>
                <td class="py-3 font-mono text-mars-cyan font-bold pr-4 text-center border-r border-mars-border/50">${s.totalLogins}</td>`;
            ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => {
                const count = s.roles[r]?.count || 0;
                const color = count > 4 ? 'text-mars-green' : (count > 0 ? 'text-mars-yellow' : 'text-mars-magenta animate-pulse');
                matRows += `<td class="py-3 font-mono ${color} text-center font-bold px-2">${count}</td>`;
            });
            matRows += `</tr>`;
        });

        return `
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan text-center flex flex-col justify-center">
                <p class="text-5xl font-orbitron text-mars-cyan">${state.data.telemetry.totalLogins}</p>
                <p class="text-[9px] text-slate-500 uppercase mt-2 font-bold tracking-widest">Logins Globales</p>
            </div>
            <div class="md:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Matriz de Conexiones por Departamento</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[9px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Startup</th><th class="pr-4 text-center border-r border-mars-border/50">Total</th><th class="text-center px-2">CEO</th><th class="text-center px-2">TEC</th><th class="text-center px-2">FIN</th><th class="text-center px-2">MKT</th><th class="text-center px-2">OP_IA</th></tr></thead>
                        <tbody>${matRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="terminal-border bg-mars-card p-6 overflow-y-auto max-h-[400px]">
            <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Registro Táctico de Sesiones (Últimas 100)</h3>
            <div class="space-y-4">
                ${state.data.telemetry.sessions.map(sess => `
                <div class="border border-mars-border/50 bg-slate-900/30 p-3 text-[10px]">
                    <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                        <span class="text-mars-cyan font-bold uppercase">${sess.entity} \vert{}${sess.role.replace('_',' ')}</span>
                        <span class="text-[8px] text-slate-500 bg-black px-2 py-0.5">${sess.timestamp.replace('T',' ').slice(0,19)}</span>
                    </div>
                    <ul class="text-slate-300 space-y-1">
                        ${sess.events.map(ev => `<li class="flex gap-2"><span class="text-mars-yellow shrink-0">[${ev.time}]</span><span class="font-bold text-white shrink-0">${ev.action}:</span><span class="text-slate-400 break-words">${ev.details}</span></li>`).join('') || '<li class="text-slate-600 italic">Sesión sin eventos clave.</li>'}
                    </ul>
                </div>`).join('') || '<p class="text-slate-600 text-xs italic">No hay datos de telemetría.</p>'}
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
            reportsHtml = '<p class="text-slate-600 text-xs italic">No hay reportes de inactividad activos en toda la flota.</p>';
        } else {
            reportsHtml = allReports.map(r => `
                <div class="bg-slate-900/50 border ${r.status === 'PENDIENTE' ? 'border-mars-magenta' : 'border-mars-green/50'} p-4 text-[10px] mb-4 transition-colors w-full">
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-2 mb-3 gap-2">
                        <span class="font-bold text-white uppercase text-sm">${r.coName}</span>
                        <span class="text-[9px] text-slate-500 bg-black px-2 py-1">${r.date}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between mb-3 gap-2 bg-black/50 p-2 border border-mars-border/30">
                        <span class="text-mars-magenta font-bold uppercase">🚨 Reportado: ${r.reportedDept}</span>
                        <span class="text-slate-400 uppercase">Emisor: ${r.reportingRole.replace('_', ' ')}</span>
                    </div>
                    <p class="text-slate-300 italic bg-black p-3 border border-slate-800 mb-3 leading-relaxed">"${r.reason}"</p>
                    <div class="flex justify-between items-center mt-2 border-t border-slate-800 pt-3">
                        <span class="text-[10px] font-bold uppercase ${r.status === 'PENDIENTE' ? 'text-mars-magenta animate-pulse' : 'text-mars-green'}">[ESTADO: ${r.status}]</span>
                        ${r.status === 'PENDIENTE' ? `<button onclick="ui.resolveInactivityReport('${r.cid}', '${r.id}')" class="bg-mars-magenta/20 text-mars-magenta border border-mars-magenta px-4 py-2 font-bold uppercase hover:bg-mars-magenta hover:text-white transition-colors">Marcar Resuelto por Claustro</button>` : ''}
                    </div>
                </div>
            `).join('');
        }

        return `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
            <div class="flex justify-between items-center mb-6 border-b border-mars-border/50 pb-4">
                <h3 class="font-orbitron text-mars-magenta text-lg uppercase tracking-widest">Gestión de Alertas HR (Recursos Humanos)</h3>
                <span class="bg-mars-magenta/10 text-mars-magenta border border-mars-magenta px-3 py-1 font-bold text-[10px]">${pendingHR} Pendientes</span>
            </div>
            <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Panel centralizado para la mediación de conflictos interdepartamentales y bloqueos operativos reportados por los alumnos.</p>
            <div class="space-y-2">
                ${reportsHtml}
            </div>
        </div>`;
    },

    resolveHRReport(cid, repId) {
        const co = state.data.companies[cid];
        if (!co || !Array.isArray(co.inactivityReports)) return;
        const rep = co.inactivityReports.find(r => r.id === repId);
        if (rep) {
            rep.status = 'RESUELTO';
            state.save();
            this.render();
        }
    },

    renderAdminCatalog() {
        const cat = Array.isArray(state.data.catalog) ? state.data.catalog : [];
        const rows = cat.map((item, idx) => `
            <tr class="border-b border-slate-800 text-[10px]">
                <td class="py-2 pr-2 font-mono text-slate-400">${item.id}</td>
                <td class="py-2 pr-2 text-white font-bold uppercase">${item.name}</td>
                <td class="py-2 pr-2 text-mars-cyan uppercase">${item.category}</td>
                <td class="py-2 pr-2 text-slate-400">${item.unit} (${item.origin || '--'})</td>
                <td class="py-2 pr-2">
                    <input type="number" value="${item.price}" step="0.5" onchange="ui.updateCatalogPrice(${idx}, this.value)" class="w-20 bg-black border border-mars-green text-mars-green font-mono font-bold text-center p-1">
                </td>
                <td class="py-2 text-right">
                    <button onclick="ui.deleteCatalogItem(${idx})" class="text-mars-magenta font-bold px-2 py-1 border border-mars-magenta hover:bg-mars-magenta hover:text-white">X</button>
                </td>
            </tr>
        `).join('');

        return `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Añadir Nuevo Artículo</h3>
                <input type="text" id="new-cat-id" placeholder="ID (Ej: F06)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <input type="text" id="new-cat-name" placeholder="Nombre completo" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <input type="number" id="new-cat-price" placeholder="Precio (€v)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <input type="text" id="new-cat-unit" placeholder="Unidad (Ej: Unidad, Gramo)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                <select id="new-cat-category" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-2 outline-none focus:border-mars-cyan">
                    <option value="Fuselaje">Fuselaje</option>
                    <option value="Propulsión">Propulsión</option>
                    <option value="Aerodinámica">Aerodinámica</option>
                    <option value="Sellado">Sellado</option>
                    <option value="Externo">Externo</option>
                </select>
                <input type="text" id="new-cat-origin" placeholder="Origen (Ej: España)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                <button onclick="ui.addCatalogItem()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Añadir al Catálogo</button>
            </div>
            <div class="lg:col-span-2 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-yellow">
                <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Gestión de Precios</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[9px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-2 pr-4">ID</th><th class="pr-4">Nombre</th><th class="pr-4">Categoría</th><th class="pr-4">Precio (€v)</th><th>Acción</th></tr>
                        </thead>
                        <tbody>
                            ${state.data.catalog.map(item => `
                            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                <td class="py-2 text-slate-400 font-mono pr-4">${item.id}</td>
                                <td class="py-2 font-bold text-white pr-4">${item.name}</td>
                                <td class="py-2 text-slate-500 pr-4">${item.category}</td>
                                <td class="py-2 pr-4">
                                    <input type="number" id="price-${item.id}" value="${item.price}" class="w-20 bg-black border border-mars-border text-center text-mars-green font-bold p-1 outline-none focus:border-mars-yellow">
                                </td>
                                <td class="py-2">
                                    <button onclick="ui.saveCatalogPrice('${item.id}')" class="bg-mars-yellow/20 text-mars-yellow px-3 py-1 font-bold hover:bg-mars-yellow hover:text-black transition-colors">Guardar</button>
                                </td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500 mt-6">
            <h3 class="font-orbitron text-blue-400 text-xs mb-4 uppercase tracking-widest">Solicitudes de Material Externo / I+D</h3>
            <div class="space-y-3">
                ${(state.data.pendingCustom || []).map(p => `
                <div class="bg-slate-900 border border-mars-border p-3 flex justify-between items-center text-[10px] flex-wrap gap-2">
                    <div class="flex-grow min-w-[200px]"><p class="text-mars-yellow font-bold uppercase">${state.data.companies[p.company]?.name || 'Desconocida'}</p><p class="text-white font-bold text-xs uppercase">${p.name}</p><p class="text-slate-400 italic">"${p.reason}"</p></div>
                    <div class="flex gap-2 items-center flex-shrink-0">
                        <input type="number" id="val-price-${p.id}" class="w-16 bg-black border border-mars-border p-2 text-mars-green text-center font-bold" placeholder="€v">
                        <button onclick="ui.teacherValidate('${p.id}', true)" class="bg-mars-green text-black px-4 py-2 font-black hover:bg-white transition-colors">OK</button>
                        <button onclick="ui.teacherValidate('${p.id}', false)" class="text-mars-magenta font-bold px-3 py-2 border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors">X</button>
                    </div>
                </div>`).join('') || '<p class="text-slate-600 text-xs italic">Nada pendiente.</p>'}
            </div>
        </div>`;
    },

    updateCatalogPrice(idx, val) {
        const p = parseFloat(val);
        if (isNaN(p) || p < 0) return;
        if (state.data.catalog && state.data.catalog[idx]) {
            state.data.catalog[idx].price = p;
            state.save();
        }
    },

    deleteCatalogItem(idx) {
        if (!state.data.catalog) return;
        state.data.catalog.splice(idx, 1);
        state.save();
        this.render();
    },

    addCatalogItem() {
        const elId = document.getElementById('new-cat-id');
        const elName = document.getElementById('new-cat-name');
        const elPrice = document.getElementById('new-cat-price');
        const elUnit = document.getElementById('new-cat-unit');
        const elCat = document.getElementById('new-cat-category');
        const elOrigin = document.getElementById('new-cat-origin');

        if (!elId || !elName || !elPrice || !elUnit || !elCat || !elOrigin) return;

        const id = elId.value.trim().toUpperCase() || ('X' + Math.floor(10+Math.random()*89));
        const name = elName.value.trim();
        const price = parseFloat(elPrice.value);
        const unit = elUnit.value.trim();
        const category = elCat.value;
        const origin = elOrigin.value.trim();

        if(!id || !name || isNaN(price) || !unit || !origin) return alert("Rellene todos los campos correctamente.");
        if(state.data.catalog.find(i => i.id === id)) return alert("El ID ya existe en el catálogo.");

        state.data.catalog.push({ id, name, price, unit, category, origin });
        state.save();
        alert("Artículo añadido al catálogo global.");
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
            if(!price) return alert("Falta precio €v.");
            
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
        
        const name = elName.value.trim();
        const cap = parseFloat(elCap.value);
        const classGroup = elClass.value || 'A';
        
        if(!name || isNaN(cap)) return alert("Datos inválidos.");
        if(ui.hasForbiddenWords(name, 'Creación Startup')) return alert("Nombre corporativo no permitido por el filtro léxico.");

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
        alert(`✅ Startup "${name}" creada.\n🔑 Código Privado de Empresa: ${generatedCode}`);
        this.render();
    },

    deleteStartup(cid) { 
        delete state.data.companies[cid]; 
        state.save(); 
        this.render(); 
    },

    updatePIN(coId, role, val) { 
        if(!state.user.role.startsWith('COORD')) return alert("Solo Coordinación puede modificar PINs.");
        const clean = (val || '').trim();
        if (role === 'AUXILIAR' && clean === '') {
            const co = state.data.companies[coId];
            if (co) { state.setRolePin(co, 'AUXILIAR', ''); state.save(); this.render(); }
            return;
        }
        if(!/^\d{4}$/.test(clean)) return alert("El PIN debe tener exactamente 4 dígitos numéricos."); 
        const co = state.data.companies[coId];
        if (co) { state.setRolePin(co, role, clean); state.save(); }
    },

    showCompanyLogins(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const s = co.loginStats || { totalLogins: 0, roles: {} };
        
        let html = `
        <div class="space-y-4">
            <div class="bg-slate-900 p-4 border border-mars-cyan text-center">
                <p class="text-[10px] text-slate-400 uppercase font-bold mb-1">Total Conexiones</p>
                <p class="text-3xl font-orbitron text-mars-cyan">${s.totalLogins}</p>
            </div>
            <table class="w-full text-left text-xs whitespace-nowrap">
                <thead class="text-slate-500 uppercase border-b border-mars-border">
                    <tr><th class="py-2">Rol</th><th class="text-right">Logins</th></tr>
                </thead>
                <tbody>
                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA','AUXILIAR'].map(r => `
                    <tr class="border-b border-mars-border/30">
                        <td class="py-2 font-bold text-white">${r}</td>
                        <td class="py-2 text-right font-mono text-mars-yellow">${s.roles[r]?.count || 0}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
        this.showModal(`Auditoría Conexiones: ${co.name}`, html, "");
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
        const html = `<input type="text" id="deny-brand-reason" class="w-full bg-black border border-mars-magenta p-3 text-xs text-white outline-none focus:border-mars-magenta" placeholder="Motivo del rechazo (Filtro léxico, plagio, no apto...)...">`;
        const btn = `<button onclick="ui.finalizeDenyBrand('${cid}')" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Confirmar Rechazo</button>`;
        this.showModal("Rechazar Identidad Corporativa", html, btn);
    },

    finalizeDenyBrand(cid) {
        const el = document.getElementById('deny-brand-reason');
        if(!el) return;
        const reason = el.value.trim();
        if(!reason) return alert("Debes especificar un motivo para el rechazo.");

        const co = state.data.companies[cid];
        if(!co || !co.brandApproval) return;

        co.brandApproval.status = 'RECHAZADO';
        co.brandApproval.feedback = reason;

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

        ui.pushNotification(cid, 'MARKETING', `¡Enhorabuena! Tu logotipo y eslogan han sido APROBADOS por Coordinación y ya son públicos en el HUD.`, 'success');
        ui.pushNotification(cid, 'CEO', `Identidad corporativa aprobada y visible para toda la flota.`, 'success');

        state.save();
        alert(`✅ Identidad corporativa de ${co.name} aprobada y publicada.`);
        this.render();
    },

    resolveB2BContract(contractId, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return alert("Solo Coordinación puede operar la Aduana B2B.");
        state.data.b2bContracts = state.data.b2bContracts || [];
        
        const c = state.data.b2bContracts.find(x => x.id === contractId);
        if (!c || c.status !== 'PENDIENTE_ADUANA') return alert("Contrato no válido o ya procesado.");

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
            alert(`✅ Traspaso B2B #${c.id} aprobado.`);
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
            alert(`❌ Contrato B2B #${c.id} rechazado. Fondos reembolsados.`);
        }
        this.render();
    },

    modalVirtualSpend(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const expenses = (co.ledger || []).filter(l => l.delta < 0);
        const total = expenses.reduce((s, l) => s + Math.abs(Number(l.delta) || 0), 0);

        const rowsHtml = expenses.map(e => `
            <tr class="border-b border-slate-800">
                <td class="py-2 pr-2 text-slate-400 text-[9px]">${e.date}</td>
                <td class="py-2 pr-2 text-white font-bold text-[10px]">${e.concept}</td>
                <td class="py-2 pr-2 text-mars-cyan text-[9px] uppercase">${e.dept}</td>
                <td class="py-2 text-right font-mono text-mars-magenta font-bold text-[10px]">${Number(e.delta).toFixed(2)} €v</td>
            </tr>
        `).join('') || `<tr><td colspan="4" class="py-4 text-center text-slate-500 italic">Esta startup no registra salidas de capital virtual.</td></tr>`;

        const html = `
            <div class="bg-slate-900 border border-mars-cyan p-3 mb-4 flex justify-between items-center">
                <span class="text-[10px] text-slate-300 uppercase font-bold">Total Gasto Virtual Acumulado:</span>
                <span class="text-lg font-orbitron text-mars-magenta font-black">-${total.toFixed(2)} €v</span>
            </div>
            <div class="max-h-72 overflow-y-auto pr-1">
                <table class="w-full text-left">
                    <thead class="text-[9px] text-slate-500 uppercase border-b border-mars-border">
                        <tr><th class="py-1">Fecha</th><th>Concepto</th><th>Dpto</th><th class="text-right">Importe</th></tr>
                    </thead>
                    <tbody>${rowsHtml}</tbody>
                </table>
            </div>
        `;
        this.showModal(`Auditoría de Gasto Virtual: ${co.name}`, html, "");
    },

    modalAssignSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return;

        const currentTier = co.sponsorAwarded || 'ORO';
        const currentName = co.sponsorData?.name || '';

        const html = `
            <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Inyecta capital virtual de patrocinio (Fase I) y personaliza la marca patrocinadora.</p>
            <div class="space-y-3">
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nivel de Patrocinio</label>
                    <select id="sp-tier" onchange="const v=this.value; document.getElementById('sp-amount').value = (v==='ORO'?500:(v==='PLATA'?400:250));" class="w-full bg-slate-900 border border-mars-yellow p-2 text-xs text-white font-bold uppercase outline-none">
                        <option value="ORO" ${currentTier==='ORO'?'selected':''}>🥇 Nivel ORO (+500 €v sugerido)</option>
                        <option value="PLATA" ${currentTier==='PLATA'?'selected':''}>🥈 Nivel PLATA (+400 €v sugerido)</option>
                        <option value="BRONCE" ${currentTier==='BRONCE'?'selected':''}>🥉 Nivel BRONCE (+250 €v sugerido)</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-green uppercase font-bold block mb-1">Inyección Económica al Ledger (€v)</label>
                    <input type="number" id="sp-amount" value="500" step="50" class="w-full bg-slate-900 border border-mars-border p-2 text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Nombre de la Corporación Patrocinadora</label>
                    <input type="text" id="sp-name" value="${currentName}" placeholder="Ej: SpaceX, PLD Space..." class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white outline-none">
                </div>
                <div>
                    <label class="text-[9px] text-mars-cyan uppercase font-bold block mb-1">Logotipo del Patrocinador (Opcional, PNG/JPG < 1MB)</label>
                    <input type="file" id="sp-logo" accept="image/png, image/jpeg" class="text-[10px] text-slate-400 w-full">
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.confirmAssignSponsor('${cid}')" class="bg-mars-yellow text-black px-5 py-2 text-[10px] font-black uppercase hover:bg-white transition-all">Conceder Patrocinio</button>`;
        this.showModal(`Asignar Patrocinio: ${co.name}`, html, actions);
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
        const spName = elName.value.trim() || 'Inversor Institucional';
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
            if (file.size > 1024 * 1024) return alert("El logo no debe superar 1MB.");
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
            <p class="text-[10px] text-slate-400 mb-4 leading-relaxed uppercase">Modifica la denominación social oficial de esta startup forzosamente. El historial contable y rúbricas se mantendrán intactos.</p>
            <input type="text" id="rename-startup-input" value="${co.name}" class="w-full bg-black border border-mars-yellow p-3 text-xs text-mars-yellow font-orbitron font-bold uppercase outline-none focus:border-white">
        `;
        const actions = `<button onclick="ui.finalizeRenameStartup('${cid}')" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Forzar Cambio</button>`;
        this.showModal(`Renombrar: ${co.name}`, html, actions);
    },

    finalizeRenameStartup(cid) {
        const el = document.getElementById('rename-startup-input');
        if (!el) return;
        const newName = el.value.trim();
        if (newName.length < 3) return alert("El nombre debe tener al menos 3 caracteres.");
        
        if (ui.hasForbiddenWords && ui.hasForbiddenWords(newName, 'Edición Nombre Empresa')) return;

        const co = state.data.companies[cid];
        if (!co) return;
        const oldName = co.name;
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
            alert(`✅ La empresa ${oldName} ahora se llama ${co.name}.`);
        } else {
            ui.pushNotification(cid, 'CEO', `El Registro Mercantil ha RECHAZADO la solicitud de cambio a "${co.nameChangeRequest.proposedName}".`, 'error');
            alert(`❌ Solicitud de renombramiento denegada.`);
        }
        
        co.nameChangeRequest.status = isApproved ? 'APROBADO' : 'RECHAZADO';
        state.save();
        this.render();
    },

    modalAEEFine(cid) {
        const co = state.data.companies[cid];
        if (!co) return;
        const agency = REGULATORY_AGENCIES[state.user.role] || "Agencia Reguladora Central";
        const html = `
            <div class="space-y-4">
                <div class="bg-mars-magenta/10 border border-mars-magenta p-3 text-center mb-4">
                    <p class="text-[9px] text-mars-magenta uppercase font-bold tracking-widest">Organismo Sancionador Competente</p>
                    <p class="text-white font-bold text-xs uppercase mt-1">${agency}</p>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Infracción Tipificada</label>
                    <select id="aee-article" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="Art. 09: Uso de lenguaje prohibido o vulneración del filtro léxico">Art. 09: Infracción Filtro Léxico</option>
                        <option value="Art. 12: Incumplimiento de cronograma y plazos oficiales">Art. 12: Incumplimiento Plazos</option>
                        <option value="Art. 18: Inconsistencia o defecto en justificación técnica/química">Art. 18: Defecto Técnico</option>
                        <option value="Art. 24: Anomalía en balance o trazabilidad contable">Art. 24: Anomalía Contable</option>
                        <option value="Art. 31: Falta de rigor en protocolo de seguridad de vuelo">Art. 31: Brecha Seguridad Vuelo</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Dictamen del Inspector</label>
                    <textarea id="aee-reason" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white h-20 outline-none focus:border-mars-magenta" placeholder="Describa el motivo específico de la sanción..."></textarea>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Cuantía de la Multa</label>
                    <select id="aee-amount" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="-10">-10 €v (Leve)</option>
                        <option value="-100">-100 €v (Moderada)</option>
                        <option value="-200">-200 €v (Grave)</option>
                    </select>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitAEEFine('${cid}')" class="bg-red-800 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_10px_red]">Tramitar Expediente</button>`;
        this.showModal(`EXPEDIENTE DISCIPLINARIO: ${co.name}`, html, actions);
    },

    submitAEEFine(cid) {
        const elArticle = document.getElementById('aee-article');
        const elReason = document.getElementById('aee-reason');
        const elAmount = document.getElementById('aee-amount');
        if (!elArticle || !elReason || !elAmount) return;
        
        const article = elArticle.value;
        const reason = elReason.value.trim();
        const amount = parseFloat(elAmount.value);
        if(!reason) return alert("El dictamen del inspector es obligatorio.");
        
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
    }
});