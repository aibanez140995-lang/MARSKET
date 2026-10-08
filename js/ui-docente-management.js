// js/ui-docente-management.js
// --- MÓDULO DOCENTE: GESTIÓN, ECONOMÍA, HR Y CATÁLOGO ---

Object.assign(ui, {
    renderAdminDash() {
        let globalReal = 0;
        for (let c in state.data.companies) {
            const co = state.data.companies[c];
            co.realCosts = co.realCosts || []; // REGLA 1
            globalReal += co.realCosts.reduce((s, i) => s + i.eur, 0);
        }
        
        const canSponsor = state.data.config.teachers[state.user.role]?.canSponsor === true;

        const pendingB2B = (state.data.b2bContracts || []).filter(c => c.status === 'PENDIENTE_CLAUSTRO');
        let pendingB2BHtml = '';
        if (pendingB2B.length > 0) {
            pendingB2BHtml = `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8 animate-pulse shadow-[0_0_15px_rgba(0,240,255,0.1)]">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-widest border-b border-mars-border pb-2">Aduana B2B: Contratos Pendientes de Firma</h3>
                <div class="space-y-4">
                    ${pendingB2B.map(c => `
                    <div class="bg-slate-900 border border-mars-cyan/50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <p class="text-white font-bold uppercase text-xs">${c.itemName}</p>
                            <p class="text-[10px] text-slate-400 mt-1">De: <span class="text-mars-yellow">${c.sellerName}</span> ➔ Para: <span class="text-mars-yellow">${c.buyerName}</span></p>
                            <p class="text-[10px] text-mars-green font-mono mt-1">Importe: ${c.price.toFixed(2)} €v</p>
                        </div>
                        <div class="flex gap-2 w-full sm:w-auto">
                            <button onclick="ui.approveB2BContract('${c.id}')" class="flex-1 sm:flex-none bg-mars-green text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors">Aprobar Traspaso</button>
                            <button onclick="ui.denyB2BContract('${c.id}')" class="flex-1 sm:flex-none bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 text-[10px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-colors">Denegar</button>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>`;
        }

        // FIX: Añadido el Historial de Contratos B2B para que el profesor vea todo
        let b2bHistoryHtml = '';
        const allB2B = state.data.b2bContracts || [];
        if (allB2B.length > 0) {
            b2bHistoryHtml = `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden mt-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Historial de Contratos B2B (Aduana)</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-2 pr-4">ID / Fecha</th><th class="pr-4">Vendedor</th><th class="pr-4">Comprador</th><th class="pr-4">Artículo</th><th class="pr-4">Precio</th><th>Estado</th></tr>
                        </thead>
                        <tbody>
                            ${allB2B.map(c => `
                            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                <td class="py-2 pr-4 text-slate-400">${c.id}<br><span class="text-[8px]">${c.date}</span></td>
                                <td class="py-2 pr-4 text-mars-yellow font-bold">${c.sellerName}</td>
                                <td class="py-2 pr-4 text-mars-cyan font-bold">${c.buyerName}</td>
                                <td class="py-2 pr-4 text-white">${c.itemName}</td>
                                <td class="py-2 pr-4 font-mono text-mars-green">${c.price.toFixed(2)} €v</td>
                                <td class="py-2 font-bold ${c.status === 'APROBADO' ? 'text-mars-green' : c.status === 'DENEGADO' ? 'text-mars-magenta' : 'text-mars-yellow'}">${c.status}</td>
                            </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        }

        return `
        ${pendingB2BHtml}
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <div class="lg:col-span-1 terminal-border bg-mars-card p-6 text-center border-t-4 border-t-mars-magenta flex flex-col justify-center">
                <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest">Inversión FÍSICA CLASE</h3>
                <p class="text-5xl font-orbitron text-white mb-2 tracking-tighter">${globalReal.toFixed(2)} €</p>
                <p class="text-[9px] text-slate-500 uppercase font-bold">Impacto económico real total</p>
            </div>
            <div class="lg:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden">
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
                                
                                const r = c.realCosts.reduce((s,i)=>s+i.eur,0);
                                const virtualSpend = c.ledger.filter(l => l.delta < 0).reduce((s, l) => s + Math.abs(l.delta), 0);
                                
                                let sponsorHtml = '';
                                if(canSponsor) {
                                    sponsorHtml = `<button onclick="ui.modalAssignSponsor('${cid}')" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-3 py-1 font-bold text-[9px] uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">Asignar Patrocinio</button>`;
                                } else {
                                    if(c.sponsorAwarded) {
                                        const cl = c.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700]':c.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0]':'text-[#cd7f32] border-[#cd7f32]';
                                        let spName = c.sponsorData?.name ? ` - ${c.sponsorData.name}` : '';
                                        let spLogo = c.sponsorData?.logo ? `<img src="${c.sponsorData.logo}" class="h-4 inline-block ml-2 rounded-sm object-contain bg-black/50 p-0.5">` : '';
                                        sponsorHtml = `<span class="${cl} font-bold text-[8px] uppercase border px-2 py-1 bg-black/50 flex items-center w-max gap-1">[PATROCINIO: ${c.sponsorAwarded}${spName}] ${spLogo}</span>`;
                                    } else {
                                        sponsorHtml = `<span class="text-slate-600 font-bold text-[8px] uppercase border border-slate-700 px-2 py-1 bg-slate-900 block w-max">[SIN PATROCINIO]</span>`;
                                    }
                                }

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-4 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${c.name}</button></td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-green font-bold">${c.balance.toFixed(0)} €v</span></td>
                                    <td class="py-4 font-mono pr-4"><button onclick="ui.modalVirtualSpend('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4" title="Ver desglose">${virtualSpend.toFixed(2)} €v</button></td>
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
        ${b2bHistoryHtml}
        <div class="terminal-border bg-mars-card p-6 mt-6">
            <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase">Solicitudes de Material Externo / I+D</h3>
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

    // FIX: Restauradas las funciones de Patrocinio y Auditoría Virtual
    modalAssignSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 4
        
        this._tempSponsorLogo = null; 
        
        const html = `
            <div class="space-y-4">
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nivel de Patrocinio</label>
                    <select id="sponsor-tier" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-yellow">
                        <option value="ORO|500">ORO (+500 €v)</option>
                        <option value="PLATA|400">PLATA (+400 €v)</option>
                        <option value="BRONCE|250">BRONCE (+250 €v)</option>
                        <option value="COBRE|150">COBRE (+150 €v)</option>
                        <option value="COLABORADOR|100">COLABORADOR (+100 €v)</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Nombre de la Marca / Entidad</label>
                    <input type="text" id="sponsor-name" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white outline-none focus:border-mars-yellow" placeholder="Ej: SpaceX, NASA, Empresa Local...">
                </div>
                <div>
                    <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Logotipo del Patrocinador (Opcional)</label>
                    <input type="file" id="sponsor-logo-file" accept="image/png, image/jpeg" class="w-full text-[9px] text-slate-400 mb-2" onchange="ui.handleSponsorLogoUpload(event)">
                    <div id="sponsor-logo-preview" class="h-12 w-auto bg-black border border-slate-700 flex items-center justify-center text-[8px] text-slate-500 italic">Sin logo</div>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitSponsor('${cid}')" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Asignar Patrocinio</button>`;
        this.showModal(`Asignar Patrocinador a ${co.name}`, html, actions);
    },

    handleSponsorLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo PNG/JPG.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logo.");
        const reader = new FileReader();
        reader.onload = (ev) => {
            this._tempSponsorLogo = ev.target.result;
            const preview = document.getElementById('sponsor-logo-preview');
            if (preview) preview.innerHTML = `<img src="${ev.target.result}" class="h-full object-contain">`;
        };
        reader.readAsDataURL(file);
    },

    submitSponsor(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 1 y 4
        
        const elTier = document.getElementById('sponsor-tier');
        const elName = document.getElementById('sponsor-name');
        if (!elTier || !elName) return; // REGLA 3
        
        const [tier, amountStr] = elTier.value.split('|');
        const amount = parseFloat(amountStr);
        const name = elName.value.trim() || 'Anónimo';
        
        co.sponsorAwarded = tier;
        co.sponsorData = {
            name: name,
            logo: this._tempSponsorLogo
        };
        
        const concept = `Patrocinio ${tier} - ${name}`;
        state.addToLedger(cid, concept, 'DOCENTE', amount);
        
        this._tempSponsorLogo = null;
        this.closeModal();
        this.render();
    },

    modalVirtualSpend(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 1 y 4
        
        co.ledger = co.ledger || [];
        const expenses = co.ledger.filter(l => l.delta < 0);
        const total = expenses.reduce((s, l) => s + Math.abs(l.delta), 0);
        
        let html = `
        <div class="mb-4 bg-slate-900 p-4 border border-mars-cyan flex justify-between items-center">
            <span class="text-mars-cyan font-bold uppercase text-xs">Total Gasto Virtual Acumulado</span>
            <span class="text-mars-cyan font-mono text-xl font-black">${total.toFixed(2)} €v</span>
        </div>
        <div class="max-h-64 overflow-y-auto pr-2">
            <table class="w-full text-left text-[10px] whitespace-nowrap">
                <thead class="text-slate-500 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                    <tr><th class="py-2 pr-2">Fecha / ID</th><th class="pr-2">Concepto</th><th class="text-right">Importe (€v)</th></tr>
                </thead>
                <tbody>
                    ${expenses.map(l => `
                    <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                        <td class="py-2 pr-2 text-slate-400">${l.date.split(' ')[0]} <br><span class="text-[8px]">${l.id}</span></td>
                        <td class="py-2 pr-2 text-white whitespace-normal min-w-[200px]">${l.concept}</td>
                        <td class="py-2 text-right text-mars-magenta font-mono font-bold">${Math.abs(l.delta).toFixed(2)}</td>
                    </tr>
                    `).join('') || `<tr><td colspan="3" class="text-center py-4 text-slate-600 italic">No hay gastos registrados.</td></tr>`}
                </tbody>
            </table>
        </div>
        `;
        this.showModal(`Auditoría de Gasto Virtual: ${co.name}`, html, "");
    },

    approveB2BContract(id) {
        if (!state.user || !state.user.admin) return;
        const contract = state.data.b2bContracts.find(c => c.id === id);
        if (!contract) return;
        
        const buyer = state.data.companies[contract.buyerCoId];
        const seller = state.data.companies[contract.sellerCoId];
        
        if (!buyer || !seller) return;
        if (buyer.balance < contract.price) return alert("El comprador no tiene fondos suficientes para ejecutar el traspaso.");
        
        // 1. Mover dinero y registrar en Ledgers
        buyer.balance -= contract.price;
        buyer.ledger.unshift({ id: 'TX-'+Date.now(), date: new Date().toLocaleString(), concept: `Compra B2B: ${contract.itemName} a ${contract.sellerName}`, dept: 'FINANZAS', delta: -contract.price, final: buyer.balance });
        
        seller.balance += contract.price;
        seller.ledger.unshift({ id: 'TX-'+(Date.now()+1), date: new Date().toLocaleString(), concept: `Venta B2B: ${contract.itemName} a ${contract.buyerName}`, dept: 'FINANZAS', delta: contract.price, final: seller.balance });
        
        // 2. Mover inventario físico
        const itemIdx = seller.inventory.findIndex(i => i.id === contract.invId);
        if (itemIdx !== -1) {
            const item = seller.inventory.splice(itemIdx, 1)[0];
            item.status = 'AVAILABLE';
            item.salePrice = null;
            buyer.inventory.unshift(item);
        }
        
        // 3. Actualizar contrato y notificar
        contract.status = 'APROBADO';
        
        ui.pushNotification(contract.buyerCoId, 'FINANZAS', `Contrato B2B Aprobado. Has adquirido ${contract.itemName}.`, 'success');
        ui.pushNotification(contract.sellerCoId, 'FINANZAS', `Contrato B2B Aprobado. Has vendido ${contract.itemName} por ${contract.price}€v.`, 'success');
        
        state.save();
        this.render();
    },

    denyB2BContract(id) {
        if (!state.user || !state.user.admin) return;
        const contract = state.data.b2bContracts.find(c => c.id === id);
        if (!contract) return;
        
        const seller = state.data.companies[contract.sellerCoId];
        if (seller) {
            const item = seller.inventory.find(i => i.id === contract.invId);
            if (item) {
                item.status = 'AVAILABLE';
                item.salePrice = null;
            }
        }
        
        contract.status = 'DENEGADO';
        
        ui.pushNotification(contract.buyerCoId, 'FINANZAS', `Contrato B2B Denegado por la Aduana Docente.`, 'error');
        ui.pushNotification(contract.sellerCoId, 'FINANZAS', `Contrato B2B Denegado. El objeto vuelve a tu inventario.`, 'error');
        
        state.save();
        this.render();
    },

    renderAdminStartups() {
        const isCoord = state.user.role.startsWith('COORD');
        return `
        <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div class="xl:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Crear Startup</h3>
                <input type="text" id="new-co-name" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Nombre Corporativo">
                <input type="number" id="new-co-cap" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan" placeholder="Capital (€v)" value="2400">
                <select id="new-co-class" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan">
                    ${['A','B','C','D','E','F'].map(c => `<option value="${c}">Clase ${c}</option>`).join('')}
                </select>
                <button onclick="ui.createStartup()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Registrar</button>
            </div>
            <div class="xl:col-span-3 terminal-border bg-mars-card p-6 w-full overflow-hidden border-t-4 border-t-mars-yellow">
                <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Gestión de PINs de Acceso</h3>
                <div class="overflow-x-auto w-full">
                    <table class="w-full text-left text-[9px] whitespace-nowrap min-w-max">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Empresa</th><th class="pr-4">Clase</th><th class="pr-2">CEO</th><th class="pr-2">TEC</th><th class="pr-2">FIN</th><th class="pr-2">MKT</th><th class="pr-2">OP_IA</th><th>Acción</th></tr></thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const co = state.data.companies[cid];
                                const r = co.roles || {}; 
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${co.name}</button></td>
                                    <td class="py-3 text-mars-yellow font-bold pr-4">${co.classGroup}</td>
                                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(rol => `
                                    <td class="py-3 pr-2">
                                        ${isCoord ? `<input type="text" maxlength="4" value="${r[rol]||'1234'}" onchange="ui.updatePIN('${cid}', '${rol}', this.value)" class="w-10 bg-black border border-mars-border text-center text-mars-cyan font-bold p-1 outline-none focus:border-mars-yellow">` : `<span class="text-slate-500">****</span>`}
                                    </td>`).join('')}
                                    <td class="py-3">${isCoord ? `<button onclick="if(confirm('¿Borrar startup irreversiblemente?')) ui.deleteStartup('${cid}')" class="text-mars-magenta font-bold hover:underline">Eliminar</button>` : `<span class="text-slate-600">Bloqueado</span>`}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
                ${isCoord ? `<p class="text-[8px] text-slate-500 mt-4 uppercase">* Modifique los 4 dígitos y pulse Enter o cambie de campo para guardar automáticamente.</p>` : `<p class="text-[8px] text-mars-magenta mt-4 uppercase">Solo Coordinación puede modificar PINs o eliminar startups.</p>`}
            </div>
        </div>`;
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
                        <span class="text-mars-cyan font-bold uppercase">${sess.entity} | ${sess.role.replace('_',' ')}</span>
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

    renderAdminCatalog() {
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
        </div>`;
    },

    // --- LÓGICA DE GESTIÓN ---

    createStartup() {
        const elName = document.getElementById('new-co-name');
        const elCap = document.getElementById('new-co-cap');
        const elClass = document.getElementById('new-co-class');
        if (!elName || !elCap || !elClass) return; // REGLA 3
        
        const name = elName.value;
        const cap = parseFloat(elCap.value);
        const classGroup = elClass.value || 'A';
        
        if(!name || isNaN(cap)) return alert("Datos inválidos.");
        const cid = 'co_' + Date.now();
        state.data.companies[cid] = { 
            name, balance: cap, logo: null, sponsorAwarded: null, sponsorData: {name: null, logo: null}, valueProposition: "", slogan: "", classGroup,
            roles: { CEO:'1234', TECNICO:'1234', FINANZAS:'1234', MARKETING:'1234', OPERACIONES_IA:'1234' }, 
            aiPrompts: [], decisionLog: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], marketingPackages: [], inactivityReports: [], notifications: [],
            sanctions: [], crisisAlerts: [], inventory: [],
            loginStats: { totalLogins: 0, roles: { CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0} } },
            fase1Registro: { presupuestoTeorico: '', alturaEstimada: '', justificacionV2: '' },
            deliverables: { technicalReport: null, informePreliminar: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null, boceto: null, fotoPrototipo: null, videoPromo: null, mathGoniometro: null, mathMedicion1: null, mathMedicion2: null, mathComparativa: null, businessModel: null, canvas: null, dossierInversores: null }
        };
        state.save(); this.render();
    },

    deleteStartup(cid) { 
        delete state.data.companies[cid]; 
        state.save(); 
        this.render(); 
    },

    updatePIN(coId, role, val) { 
        if(!state.user.role.startsWith('COORD')) return alert("Solo Coordinación puede modificar PINs.");
        if(val.length !== 4) return alert("4 dígitos."); 
        if (state.data.companies[coId] && state.data.companies[coId].roles) {
            state.data.companies[coId].roles[role] = val; 
            state.save(); 
        }
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
                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(r => `
                    <tr class="border-b border-mars-border/30">
                        <td class="py-2 font-bold text-white">${r}</td>
                        <td class="py-2 text-right font-mono text-mars-yellow">${s.roles[r]?.count || 0}</td>
                    </tr>`).join('')}
                </tbody>
            </table>
        </div>`;
        
        this.showModal(`Auditoría de Conexiones: ${co.name}`, html, "");
    },

    resolveInactivityReport(cid, rid) {
        const co = state.data.companies[cid];
        if (!co || !co.inactivityReports) return; // REGLA 1
        const rep = co.inactivityReports.find(r => r.id === rid);
        if (rep) {
            rep.status = 'RESUELTO';
            state.save();
            this.render();
        }
    },

    saveCatalogPrice(id) {
        const elPrice = document.getElementById(`price-${id}`);
        if (!elPrice) return; // REGLA 3
        const newPrice = parseFloat(elPrice.value);
        if(isNaN(newPrice) || newPrice < 0) return alert("Precio inválido.");
        const item = state.data.catalog.find(i => i.id === id);
        if(item) {
            item.price = newPrice;
            state.save();
            alert(`Precio actualizado para ${item.name}`);
        }
    },

    addCatalogItem() {
        const elId = document.getElementById('new-cat-id');
        const elName = document.getElementById('new-cat-name');
        const elPrice = document.getElementById('new-cat-price');
        const elUnit = document.getElementById('new-cat-unit');
        const elCat = document.getElementById('new-cat-category');
        const elOrigin = document.getElementById('new-cat-origin');

        if (!elId || !elName || !elPrice || !elUnit || !elCat || !elOrigin) return; // REGLA 3

        const id = elId.value.trim();
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
            if (!elPrice) return; // REGLA 3
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

    modalAEEFine(cid) {
        const co = state.data.companies[cid];
        if (!co) return; // REGLA 4
        
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
        if (!elArticle || !elReason || !elAmount) return; // REGLA 3
        
        const article = elArticle.value;
        const reason = elReason.value;
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
        
        co.crisisAlerts.unshift({
            ...sanctionObj,
            read: false
        });
        
        const concept = `[MULTA] ${agency} - ${article}`;
        state.addToLedger(cid, concept, 'DOCENTE_AEE', amount);
        
        ui.pushNotification(cid, 'CEO', `NUEVA SANCIÓN RECIBIDA (${amount} €v). Revisa la Ventanilla Legal urgentemente.`, 'error');
        
        this.closeModal();
        this.render();
    }
});