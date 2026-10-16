// js/ui-empresa-market.js
// --- MÓDULO MERCADO: CATÁLOGO OFICIAL Y MERCADO SECUNDARIO B2B ---

Object.assign(ui, {
    setMarketFilter(cat) {
        this.marketFilter = cat;
        this.render();
    },

    setMarketTab(tab) {
        this.marketTab = tab;
        this.render();
    },

    viewMarket(el) {
        if (!el || !state.user) return; 
        
        // Permitir a los docentes ver el catálogo y el mercado B2B sin ser expulsados
        const co = state.user.admin ? null : state.data.companies[state.user.coId];
        if (!state.user.admin && !co) return auth.logout();
        
        const activeTab = this.marketTab || 'official';
        const wrapper = document.createElement('div');
        
        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bContracts = state.data.b2bContracts || [];
        
        const activeB2BCount = state.data.b2bMarket.length;
        const pendingCustomsCount = state.data.b2bContracts.filter(c => c.status === 'PENDIENTE_ADUANA').length;

        // Cabecera de navegación entre Catálogo Oficial y Mercado B2B
        const tabsHtml = `
        <div class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3 items-center justify-between">
            <div class="flex gap-2">
                <button onclick="ui.setMarketTab('official')" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${activeTab === 'official' ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]' : 'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                    🛒 Catálogo Oficial SUPERMARS-KET
                </button>
                <button onclick="ui.setMarketTab('b2b')" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2 ${activeTab === 'b2b' ? 'bg-mars-yellow text-black border-mars-yellow shadow-[0_0_10px_rgba(255,230,0,0.3)]' : 'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                    🤝 Mercado B2B Segunda Mano
                    ${activeB2BCount > 0 ? `<span class="px-1.5 py-0.5 text-[8px] font-black rounded-full ${activeTab === 'b2b' ? 'bg-black text-mars-yellow' : 'bg-mars-yellow text-black'}">${activeB2BCount}</span>` : ''}
                </button>
            </div>
            ${!state.user.admin && state.user.role === 'TECNICO' ? `
            <div class="flex gap-2">
                <button onclick="ui.navigate('tech')" class="bg-mars-green/10 border border-mars-green text-mars-green px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-green hover:text-black transition-all whitespace-nowrap">📦 Vender Pieza de mi Inventario</button>
                <button onclick="ui.modalCustom()" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all whitespace-nowrap">✨ Solicitar Material I+D Externo</button>
            </div>` : ''}
        </div>`;

        if (activeTab === 'b2b') {
            wrapper.innerHTML = tabsHtml + this.renderB2BMarketView(co, pendingCustomsCount);
            el.appendChild(wrapper);
            return;
        }

        // --- VISTA CATÁLOGO OFICIAL ---
        let topSection = '';
        let techBanner = '';
        
        if (!state.user.admin && state.user.role === 'TECNICO') {
            co.cart = co.cart || [];
            
            if (co.cart.length > 0) {
                const totalEurV = co.cart.reduce((s, i) => s + i.price, 0).toFixed(2);
                
                const draftItemsHtml = co.cart.map((item, idx) => `
                    <div class="flex justify-between items-center bg-slate-900 p-2 border border-mars-border text-[10px] mb-1">
                        <span class="text-white">${item.name} (x${item.qty})</span>
                        <div class="flex items-center gap-3">
                            <span class="text-mars-green font-mono">${item.price.toFixed(2)} €v</span>
                            <button onclick="ui.removeFromCart(${idx})" class="text-mars-magenta hover:text-white font-bold px-2">X</button>
                        </div>
                    </div>
                `).join('');

                techBanner = `
                <div class="bg-mars-yellow/10 border border-mars-yellow p-4 mb-6">
                    ${ui.renderWorkflowTracker(['I+D (Solicita)', 'Finanzas (Audita)', 'Logística (Ejecuta)'], 0)}
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 mt-6">
                        <div>
                            <p class="text-mars-yellow font-bold uppercase text-xs sm:text-sm tracking-widest">Borrador de I+D: ${co.cart.length} componente(s)</p>
                            <p class="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Total acumulado: <span class="text-mars-green font-bold">${totalEurV} €v</span></p>
                        </div>
                        <button onclick="ui.modalSubmitOrderToFinance()" class="bg-mars-yellow text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all whitespace-nowrap w-full sm:w-auto">[ REVISAR Y ENVIAR A FINANZAS ]</button>
                    </div>
                    <div class="max-h-32 overflow-y-auto pr-2">
                        ${draftItemsHtml}
                    </div>
                </div>`;
            }

            topSection = `${techBanner}`;
        }

        const currentFilter = this.marketFilter || 'ALL';

        const visibleCatalog = state.data.catalog.filter(item => {
            let isAllowed = false;
            if (!item.exclusiveFor) isAllowed = true;
            else if (state.user.admin) isAllowed = true;
            else if (state.user.coId === item.exclusiveFor) isAllowed = true;

            if (!isAllowed) return false;
            if (currentFilter === 'ALL') return true;
            return item.category.toUpperCase() === currentFilter.toUpperCase();
        });

        const filterButtons = ['ALL', 'Fuselaje', 'Propulsión', 'Aerodinámica', 'Sellado', 'Externo'].map(cat => `
            <button onclick="ui.setMarketFilter('${cat}')" class="px-3 py-1.5 text-[9px] font-bold uppercase border ${currentFilter === cat ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-transparent text-slate-400 border-mars-border hover:border-mars-cyan hover:text-mars-cyan'} transition-colors whitespace-nowrap">
                ${cat === 'ALL' ? 'TODOS' : cat}
            </button>
        `).join('');

        wrapper.innerHTML = `
        ${tabsHtml}
        ${topSection}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">SUPERMARS-KET Oficial</h2>
            <span class="text-[9px] text-slate-400 uppercase">Suministros certificados por la Agencia Espacial</span>
        </div>
        <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-mars-border">
            ${filterButtons}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${visibleCatalog.map(item => {
                let buySection = '';
                if (state.user.admin) {
                    buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">Vista de supervisión (Docente).</p>`;
                } else if(state.user.role !== 'AUXILIAR') {
                    if (state.user.role === 'TECNICO') {
                        if (item.id === 'P01') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.techAddToCart('${item.id}', 10)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+10g</button><button onclick="ui.techAddToCart('${item.id}', 25)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+25g</button><button onclick="ui.techAddToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50g</button></div>`;
                        } else if (item.id === 'P02') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.techAddToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50ml</button><button onclick="ui.techAddToCart('${item.id}', 100)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+100ml</button></div>`;
                        } else {
                            buySection = `<div class="flex items-center gap-2 mt-2"><input type="number" id="qty-${item.id}" value="1" min="1" class="w-12 bg-black border border-mars-border text-center text-[10px] text-white p-1"><button onclick="ui.techAddToCart('${item.id}', parseInt(document.getElementById('qty-${item.id}')?.value)||1)" class="flex-grow bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2 py-1 text-[9px] font-black uppercase hover:bg-mars-cyan hover:text-mars-bg transition-all">Añadir a Petición</button></div>`;
                        }
                    } else {
                        buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">El Dpto. Técnico realiza las peticiones.</p>`;
                    }
                }

                return `
                <div class="terminal-border bg-mars-card p-4 group hover:border-mars-cyan transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between text-[8px] text-slate-500 mb-2 uppercase font-bold tracking-widest">
                            <span>${item.category}</span>
                            <span class="text-mars-yellow">${item.unit}</span>
                        </div>
                        <h3 class="font-orbitron text-white text-[11px] mb-1 leading-tight uppercase">${item.name}</h3>
                        <p class="text-[8px] text-slate-400 uppercase mb-2">[🌍 ${item.origin || 'Desconocido'}]</p>
                    </div>
                    <div>
                        <span class="text-mars-green font-black text-base font-mono tracking-tighter">${item.price.toFixed(2)} €v</span>${buySection}
                    </div>
                </div>`;
            }).join('') || '<p class="text-slate-500 italic text-sm col-span-full">No hay materiales en esta categoría.</p>'}
        </div>`;
        el.appendChild(wrapper);
    },

    renderB2BMarketView(co, pendingCustomsCount) {
        const listings = state.data.b2bMarket || [];
        const contracts = state.data.b2bContracts || [];
        const myCoId = state.user.admin ? 'ADMIN' : state.user.coId;

        const relevantContracts = state.user.admin 
            ? contracts 
            : contracts.filter(c => c.sellerCoId === myCoId || c.buyerCoId === myCoId);

        const listingsHtml = listings.map(lst => {
            const isMine = lst.sellerCoId === myCoId;
            const sellerName = state.data.companies[lst.sellerCoId]?.name || lst.sellerName || 'Startup';
            
            let actionBtn = '';
            if (state.user.admin) {
                actionBtn = `<span class="text-[8px] text-slate-500 uppercase block mt-2 pt-2 border-t border-slate-800">En venta por ${sellerName}</span>`;
            } else if (isMine) {
                if (state.user.role === 'TECNICO' || state.user.role === 'CEO') {
                    actionBtn = `<button onclick="ui.cancelB2BListing('${lst.id}')" class="w-full mt-3 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta py-2 text-[9px] font-bold uppercase hover:bg-mars-magenta hover:text-white transition-all">Retirar Oferta</button>`;
                } else {
                    actionBtn = `<span class="text-[8px] text-mars-yellow uppercase block mt-2 pt-2 border-t border-slate-800">Oferta propia de tu Startup</span>`;
                }
            } else {
                if (state.user.role === 'TECNICO' || state.user.role === 'FINANZAS' || state.user.role === 'CEO') {
                    actionBtn = `<button onclick="ui.buyB2BItem('${lst.id}')" class="w-full mt-3 bg-mars-yellow text-black py-2 text-[9px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_10px_rgba(255,230,0,0.3)]">Solicitar Compra B2B</button>`;
                } else {
                    actionBtn = `<span class="text-[8px] text-slate-500 uppercase block mt-2 pt-2 border-t border-slate-800">Solo Técnico/Finanzas/CEO pueden comprar</span>`;
                }
            }

            return `
            <div class="terminal-border bg-mars-card p-4 border-t-2 ${isMine ? 'border-t-mars-cyan' : 'border-t-mars-yellow'} flex flex-col justify-between">
                <div>
                    <div class="flex justify-between items-center text-[8px] uppercase font-bold mb-2">
                        <span class="bg-mars-yellow/10 text-mars-yellow border border-mars-yellow/40 px-1.5 py-0.5">VENDEDOR: ${sellerName}</span>
                        <span class="text-slate-500">${lst.date}</span>
                    </div>
                    <h3 class="font-orbitron text-white text-xs font-bold uppercase mb-1">${lst.itemName} (x${lst.qty || 1})</h3>
                    <p class="text-[9px] text-slate-400 italic mb-3 bg-black/50 p-2 border border-slate-800">"${lst.notes || 'Pieza en perfecto estado operativo.'}"</p>
                </div>
                <div>
                    <div class="flex justify-between items-baseline">
                        <span class="text-[8px] text-slate-500 uppercase font-bold">Precio Pactado:</span>
                        <span class="text-mars-green font-mono font-black text-lg">${Number(lst.price).toFixed(2)} €v</span>
                    </div>
                    ${actionBtn}
                </div>
            </div>`;
        }).join('') || `<div class="col-span-full terminal-border border-dashed p-8 text-center text-slate-500 text-xs italic">Actualmente no hay piezas de segunda mano publicadas en el mercado B2B. El Dpto. Técnico puede poner componentes a la venta desde su pestaña de Inventario Físico.</div>`;

        const contractsHtml = relevantContracts.map(c => {
            const sellerName = state.data.companies[c.sellerCoId]?.name || c.sellerName;
            const buyerName = state.data.companies[c.buyerCoId]?.name || c.buyerName;
            const stColor = c.status === 'APROBADO' ? 'text-mars-green border-mars-green bg-mars-green/10' : (c.status === 'RECHAZADO' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10 animate-pulse');
            
            return `
            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-3 pr-4 font-mono text-slate-400">${c.id}</td>
                <td class="py-3 pr-4 font-bold text-white">${c.itemName} (x${c.qty || 1})</td>
                <td class="py-3 pr-4 text-mars-cyan">${sellerName}</td>
                <td class="py-3 pr-4 text-mars-yellow">${buyerName}</td>
                <td class="py-3 pr-4 font-mono text-mars-green font-bold">${Number(c.price).toFixed(2)} €v</td>
                <td class="py-3"><span class="px-2 py-0.5 text-[8px] font-black uppercase border ${stColor}">${c.status}</span></td>
            </tr>`;
        }).join('') || `<tr><td colspan="6" class="py-6 text-center text-slate-600 italic">No hay contratos B2B registrados para esta entidad.</td></tr>`;

        return `
        <div class="mb-6 bg-slate-900/90 border border-mars-yellow/40 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Mercado Secundario B2B & Aduana Aeroespacial</h2>
                <p class="text-[10px] text-slate-300 mt-1 leading-relaxed">Compraventa de excedentes entre startups. Al comprar una pieza, el importe (€v) queda retenido en depósito hasta que la Coordinación Docente autoriza el traspaso en la Aduana B2B.</p>
            </div>
            ${state.user.admin ? `<button onclick="ui.adminTab='dash'; ui.navigate('admin')" class="bg-mars-yellow text-black px-4 py-2 text-[9px] font-black uppercase whitespace-nowrap hover:bg-white transition-all">Ir a Aduana Docente (${pendingCustomsCount})</button>` : ''}
        </div>

        <h3 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest mb-3">Ofertas Activas en el Mercado</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            ${listingsHtml}
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
            <h3 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest mb-4 border-b border-mars-border pb-2">Registro de Contratos y Estado en Aduana B2B</h3>
            <div class="overflow-x-auto w-full">
                <table class="w-full text-left text-[10px] whitespace-nowrap min-w-max">
                    <thead class="text-slate-500 uppercase border-b border-mars-border">
                        <tr>
                            <th class="py-2 pr-4">Contrato ID</th>
                            <th class="py-2 pr-4">Componente</th>
                            <th class="py-2 pr-4">Vendedor</th>
                            <th class="py-2 pr-4">Comprador</th>
                            <th class="py-2 pr-4">Importe</th>
                            <th class="py-2">Estado Aduana</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${contractsHtml}
                    </tbody>
                </table>
            </div>
        </div>`;
    },

    buyB2BItem(listingId) {
        if (!state.user || state.user.admin) return;
        const buyerCoId = state.user.coId;
        const buyerCo = state.data.companies[buyerCoId];
        if (!buyerCo) return auth.logout();

        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bContracts = state.data.b2bContracts || [];

        const idx = state.data.b2bMarket.findIndex(l => l.id === listingId);
        if (idx === -1) return alert("Esta oferta ya no está disponible.");

        const listing = state.data.b2bMarket[idx];
        if (listing.sellerCoId === buyerCoId) return alert("No puedes comprar una pieza de tu propia empresa.");

        const price = parseFloat(listing.price);
        if (buyerCo.balance < price) {
            return alert(`Fondos virtuales insuficientes. Necesitas ${price.toFixed(2)} €v disponibles en caja.`);
        }

        if (!confirm(`¿Confirmas la compra de "${listing.itemName}" a ${listing.sellerName} por ${price.toFixed(2)} €v?\n\nEl importe quedará retenido en depósito hasta que la Aduana Docente apruebe el contrato.`)) return;

        // Retención preventiva de fondos en el comprador (Escrow)
        state.addToLedger(buyerCoId, `[DEPÓSITO ADUANA B2B] Compra pendiente: ${listing.itemName}`, 'FINANZAS', -price);

        const contract = {
            id: 'B2B-' + Date.now().toString().slice(-6),
            listingId: listing.id,
            sellerCoId: listing.sellerCoId,
            sellerName: state.data.companies[listing.sellerCoId]?.name || listing.sellerName,
            buyerCoId: buyerCoId,
            buyerName: buyerCo.name,
            itemName: listing.itemName,
            category: listing.category || 'B2B',
            qty: listing.qty || 1,
            price: price,
            sourceOrderKey: listing.sourceOrderKey || null,
            date: new Date().toLocaleString(),
            status: 'PENDIENTE_ADUANA'
        };

        state.data.b2bContracts.unshift(contract);
        state.data.b2bMarket.splice(idx, 1);

        ui.pushNotification(listing.sellerCoId, 'TECNICO', `La empresa ${buyerCo.name} ha solicitado comprar tu pieza "${listing.itemName}" por ${price.toFixed(2)} €v. Pendiente de Aduana Docente.`, 'info');
        ui.pushNotification(listing.sellerCoId, 'FINANZAS', `Contrato B2B #${contract.id} iniciado con ${buyerCo.name} (+${price.toFixed(2)} €v pendientes de Aduana).`, 'info');
        
        telemetry.log("CONTRATO B2B", `${buyerCo.name} solicita compra de ${listing.itemName} a ${contract.sellerName} por ${price}€v`);
        state.save();
        alert(`✅ Contrato #${contract.id} registrado y enviado a la Aduana Docente.`);
        this.render();
    },

    cancelB2BListing(listingId) {
        if (!state.user || state.user.admin) return;
        state.data.b2bMarket = state.data.b2bMarket || [];
        const idx = state.data.b2bMarket.findIndex(l => l.id === listingId);
        if (idx === -1) return;

        const lst = state.data.b2bMarket[idx];
        if (lst.sellerCoId !== state.user.coId) return alert("Solo la empresa propietaria puede retirar esta oferta.");

        // Restaurar disponibilidad de la pieza en el inventario de la empresa
        const co = state.data.companies[state.user.coId];
        if (co && lst.sourceOrderKey && co.orders) {
            const [ordId, itemIdx] = lst.sourceOrderKey.split('-');
            const ord = co.orders.find(o => String(o.id) === String(ordId));
            if (ord && ord.items && ord.items[Number(itemIdx)]) {
                delete ord.items[Number(itemIdx)].b2bStatus;
            }
        }

        state.data.b2bMarket.splice(idx, 1);
        telemetry.log("B2B RETIRADO", `Oferta retirada: ${lst.itemName}`);
        state.save();
        this.render();
    },

    techAddToCart(id, qty = 1) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.cart = co.cart || [];
        
        const item = state.data.catalog.find(i => i.id === id);
        if (!item) return;
        
        let name = item.name;
        if(id === 'P01' || id === 'P02') name = `${item.name} (${qty}${item.unit})`;
        
        co.cart.push({...item, qty, price: item.price * qty, name, realEur: '', realShop: ''});
        telemetry.log("REQ TÉCNICA", `Añadido a borrador: ${name}`);
        state.save();
        this.render();
    },

    removeFromCart(idx) { 
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.cart = co.cart || [];
        
        if(co.cart.length > idx) {
            co.cart.splice(idx, 1); 
            state.save(); 
            this.render(); 
        }
    },

    modalSubmitOrderToFinance() {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.cart = co.cart || [];
        
        if(co.cart.length === 0) return alert("El carrito de I+D está vacío.");
        
        const total = co.cart.reduce((s, i) => s + i.price, 0).toFixed(2);
        const itemsHtml = co.cart.map(i => `<div class="flex justify-between text-[10px] border-b border-mars-border/50 py-1"><span class="text-white">${i.name} (x${i.qty})</span><span class="text-mars-green">${i.price.toFixed(2)} €v</span></div>`).join('');
        
        const html = `
            <div class="mb-4 bg-slate-900 p-3 border border-mars-border max-h-32 overflow-y-auto w-full">
                ${itemsHtml}
                <div class="flex justify-between text-xs font-bold mt-2 pt-2 border-t border-mars-border"><span class="text-mars-cyan">TOTAL VIRTUAL:</span><span class="text-mars-green">${total} €v</span></div>
            </div>
            <p class="text-[10px] text-mars-cyan mb-2 uppercase font-bold">Justificación Técnica (Obligatoria):</p>
            <textarea id="tech-order-just" placeholder="Explica para qué se necesitan estos componentes y su impacto en el diseño..." class="w-full bg-black border border-mars-cyan p-3 text-xs text-white h-24 outline-none focus:border-white"></textarea>
        `;
        const actions = `<button onclick="ui.confirmTechOrderToFinance()" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-bold uppercase hover:bg-white transition-colors">Transmitir a Finanzas</button>`;
        this.showModal("Transmisión de Orden a Finanzas", html, actions);
    },

    confirmTechOrderToFinance() {
        if (!state.user) return;
        const elJust = document.getElementById('tech-order-just');
        if (!elJust) return; 
        const justText = elJust.value.trim();
        if(justText.length < 5) return alert("Justificación técnica obligatoria.");
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.orders = co.orders || [];
        co.cart = co.cart || [];
        
        const total = co.cart.reduce((s, i) => s + i.price, 0);
        const newOrder = { 
            id: state.data.config.nextOrderId++, 
            items: [...co.cart], 
            total: total, 
            justification: justText, 
            status: 'PENDIENTE_FINANZAS', 
            date: new Date().toLocaleString() 
        };
        
        co.orders.unshift(newOrder);
        telemetry.log("REQUISICIÓN", `Enviada a Finanzas: ${total.toFixed(2)}€v`);
        
        ui.pushNotification(state.user.coId, 'FINANZAS', `Nueva orden de I+D #${newOrder.id} pendiente de aprobación presupuestaria.`, 'warning');
        
        co.cart = []; 
        state.save(); 
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        
        this.closeModal();
        alert(`✅ Orden #${newOrder.id} transmitida con éxito a Finanzas.`);
        this.render();
    }
});