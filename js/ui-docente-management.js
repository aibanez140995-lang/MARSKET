// js/ui-docente-management.js
// --- MÓDULO DOCENTE: GESTIÓN, LLAVERO, ADUANAS Y REGISTRO MERCANTIL (v1.0.17) ---

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

        // FASE 5: Recopilación de Peticiones de Cambio de Nombre
        const pendingNameChanges = Object.keys(state.data.companies).filter(cid => {
            const co = state.data.companies[cid];
            return co.nameChangeRequest && co.nameChangeRequest.status === 'PENDIENTE';
        });

        const incidents = (state.data.securityIncidents || []).filter(i => !i.resolved);

        // FASE 4: Renderizado de Alertas Léxicas
        let incidentsHtml = '';
        if (incidents.length > 0 && isCoord) {
            incidentsHtml = `
            <div class="terminal-border bg-black p-4 sm:p-6 mb-6 shadow-lg relative overflow-hidden border-t-4 border-t-red-600">
                <div class="flex justify-between items-center mb-4 border-b border-slate-800 pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-white text-xs sm:text-sm uppercase tracking-widest">🚨 Monitor de Alertas Léxicas</h3>
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Filtro de seguridad: Intercepciones de Nombres Propios o Lenguaje Soez.</p>
                    </div>
                    <span class="bg-red-600 text-white px-3 py-1 text-[10px] font-black uppercase">${incidents.length} Registros Activos</span>
                </div>
                <div class="space-y-3 max-h-80 overflow-y-auto pr-2">
                    ${incidents.map(inc => {
                        const coName = state.data.companies[inc.coId]?.name || 'Desconocida';
                        const isName = inc.severity === 'NAME';
                        const colors = isName ? 'border-mars-yellow bg-mars-yellow/5' : 'border-red-800 bg-red-900/20';
                        const titleColor = isName ? 'text-mars-yellow' : 'text-red-500';
                        const label = isName ? '⚠️ AVISO LÉXICO (USO NOMBRE PROPIO)' : '🚨 INFRACCIÓN GRAVE (LENGUAJE SOEZ)';

                        return `
                        <div class="border ${colors} p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-[10px]">
                            <div>
                                <span class="${titleColor} font-bold uppercase text-[9px]">${label}</span><br>
                                <span class="text-white font-bold uppercase mt-1 inline-block">${coName} (${inc.role.replace('_',' ')})</span>
                                <span class="text-slate-500 ml-2 font-mono">${inc.date}</span>
                                <p class="text-white mt-1">Contexto Operativo: <span class="text-mars-cyan">${inc.context}</span></p>
                                <p class="text-slate-400 italic mt-1">Texto bloqueado: "${inc.text}"</p>
                            </div>
                            <div class="flex gap-2 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                                ${!isName ? `<button onclick="ui.modalAEEFine('${inc.coId}')" class="bg-red-800 text-white px-3 py-2 font-black uppercase text-[9px] hover:bg-red-600 transition-colors border border-red-500 shadow-[0_0_8px_red] w-full sm:w-auto">Sancionar (AEE)</button>` : ''}
                                <button onclick="ui.resolveSecurityIncident('${inc.id}')" class="bg-slate-800 text-slate-300 px-3 py-2 font-black uppercase text-[9px] hover:bg-white hover:text-black transition-colors w-full sm:w-auto">Archivar</button>
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        // FASE 5: Bloque de Registro Mercantil (Cambio de Nombre)
        let nameCustomsHtml = '';
        if (isCoord && pendingNameChanges.length > 0) {
            nameCustomsHtml = `
            <div class="terminal-border bg-mars-card p-6 mb-6 border-t-4 border-t-mars-yellow shadow-[0_0_15px_rgba(255,183,3,0.1)]">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-mars-yellow text-xs sm:text-sm uppercase tracking-widest">🏛️ Registro Mercantil (Denominación)</h3>
                        <p class="text-[9px] text-slate-400 uppercase mt-0.5">Solicitudes de renombramiento corporativo por parte de los CEOs.</p>
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
                            <h4 class="font-orbitron text-slate-300 font-bold text-xs uppercase mb-3 line-through decoration-mars-magenta">${co.name}</h4>
                            <p class="text-[9px] text-mars-green uppercase font-bold mb-1">Nuevo Nombre Propuesto:</p>
                            <h4 class="font-orbitron text-mars-yellow font-black text-sm uppercase mb-3">${req.proposedName}</h4>
                            <p class="text-slate-400 italic text-[10px] mb-4">"${req.reason}"</p>
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
                                <button onclick="ui.promptDenyBrand('${cid}')" class="flex-1 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-3 py-2 font-black uppercase text-[9px] hover:bg-mars-magenta hover:text-white transition-colors">Rechazar</button>
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
                                        <button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${c.name} [${c.classGroup\vert{}\vert{}'A'}]</button>${isCoord ? `<button onclick="ui.promptRenameStartup('${cid}')" title="Forzar Renombramiento" class="bg-slate-800 text-slate-300 px-1.5 py-0.5 text-[8px] hover:bg-mars-yellow hover:text-black transition-colors rounded-sm ml-1">✏️</button>` : ''}
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
        ${b2bCustomsHtml}
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500">
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

    // FASE 5: Función Docente para aprobar/rechazar el nombre propuesto por el CEO
    resolveNameChangeRequest(cid, isApproved) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const co = state.data.companies[cid];
        if (!co || !co.nameChangeRequest || co.nameChangeRequest.status !== 'PENDIENTE') return;

        if (isApproved) {
            const oldName = co.name;
            co.name = co.nameChangeRequest.proposedName;
            
            telemetry.log("GOBERNANZA", `Docente aprobó cambio de nombre de ${oldName} a ${co.name}`);
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

    // A continuación van el resto de funciones docentes ya existentes...
    // (resolveBrandApproval, resolveSecurityIncident, resolveB2BContract, etc.)
    // que se mantienen intactas. 
    resolveSecurityIncident(id) {
        if (!state.user || !state.user.role.startsWith('COORD')) return;
        const inc = (state.data.securityIncidents || []).find(i => i.id === id);
        if (inc) { inc.resolved = true; state.save(); this.render(); }
    },
    
    // ... [resto de funciones docentes idénticas: promptRenameStartup, promptDenyBrand, etc.] ...

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
        
        const co = state.data.companies[cid];
        if (!co) return;
        const oldName = co.name;
        co.name = newName;
        
        telemetry.log("GOBERNANZA", `Empresa renombrada de ${oldName} a ${newName}`);
        ui.pushNotification(cid, 'CEO', `Coordinación ha forzado el cambio de denominación social a "${newName}".`, 'warning');
        state.save();
        this.closeModal();
        this.render();
    }
});