// js/ui-empresa-market.js
// --- MÓDULO MERCADO: CATÁLOGO, CARRITO TÉCNICO Y MERCADO B2B ---

Object.assign(ui, {
    setMarketFilter(cat) {
        this.marketFilter = cat;
        this.render();
    },

    viewMarket(el) {
        if (!el || !state.user) return; 
        
        // FIX: Permitir a los docentes ver el catálogo sin ser expulsados
        const co = state.user.admin ? null : state.data.companies[state.user.coId];
        if (!state.user.admin && !co) return auth.logout();
        
        const wrapper = document.createElement('div');
        let topSection = '';
        let techBanner = '';
        
        if(!state.user.admin && state.user.role === 'TECNICO') {
            const docs = co.deliverables || {};
            co.cart = co.cart || []; // REGLA 1
            
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

            topSection = `
            ${techBanner}
            `;
        }

        const currentFilter = this.marketFilter || 'ALL';

        // FASE 3 v1.0.13: Añadido filtro B2B
        const filterButtons = ['ALL', 'Fuselaje', 'Propulsión', 'Aerodinámica', 'Sellado', 'Externo', 'B2B'].map(cat => `
            <button onclick="ui.setMarketFilter('${cat}')" class="px-3 py-1.5 text-[9px] font-bold uppercase border ${currentFilter === cat ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-transparent text-slate-400 border-mars-border hover:border-mars-cyan hover:text-mars-cyan'} transition-colors whitespace-nowrap">
                ${cat === 'ALL' ? 'TODOS' : cat === 'B2B' ? 'SEGUNDA MANO' : cat}
            </button>
        `).join('');

        let itemsHtml = '';

        if (currentFilter === 'B2B') {
            // Renderizado del Mercado de Segunda Mano
            const b2bItems = (state.data.b2bMarket || []).filter(m => state.user.admin || m.sellerCoId !== state.user.coId);
            
            itemsHtml = b2bItems.map(item => {
                let buySection = '';
                if (state.user.admin) {
                    buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">Vista de solo lectura (Docente).</p>`;
                } else if (state.user.role !== 'AUXILIAR') {
                    buySection = `<button onclick="ui.promptBuyB2B('${item.marketId}')" class="w-full mt-2 bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-2 py-1 text-[9px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-all">Comprar (Firma Docente)</button>`;
                } else {
                    buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">Solo lectura.</p>`;
                }

                return `
                <div class="terminal-border bg-mars-card p-4 group hover:border-mars-magenta transition-all flex flex-col justify-between border-t-2 border-t-mars-magenta">
                    <div>
                        <div class="flex justify-between text-[8px] text-slate-500 mb-2 uppercase font-bold tracking-widest">
                            <span class="text-mars-magenta">SEGUNDA MANO</span>
                            <span class="text-mars-yellow">Unidad</span>
                        </div>
                        <h3 class="font-orbitron text-white text-[11px] mb-1 leading-tight uppercase">${item.itemName}</h3>
                        <p class="text-[8px] text-slate-400 uppercase mb-2">Vendedor: ${item.sellerName}</p>
                    </div>
                    <div>
                        <span class="text-mars-magenta font-black text-base font-mono tracking-tighter">${item.price.toFixed(2)} €v</span>
                        ${buySection}
                    </div>
                </div>`;
            }).join('') || '<p class="text-slate-500 italic text-sm col-span-full">No hay artículos de segunda mano disponibles en este momento.</p>';
        } else {
            // Renderizado del Catálogo Oficial
            const visibleCatalog = state.data.catalog.filter(item => {
                let isAllowed = false;
                if (!item.exclusiveFor) isAllowed = true;
                else if (state.user.admin) isAllowed = true;
                else if (state.user.coId === item.exclusiveFor) isAllowed = true;

                if (!isAllowed) return false;
                if (currentFilter === 'ALL') return true;
                return item.category.toUpperCase() === currentFilter.toUpperCase();
            });

            itemsHtml = visibleCatalog.map(item => {
                let buySection = '';
                if (state.user.admin) {
                    buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">Vista de solo lectura (Docente).</p>`;
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
                        <span class="text-mars-green font-black text-base font-mono tracking-tighter">${item.price.toFixed(2)} €v</span>
                        ${buySection}
                    </div>
                </div>`;
            }).join('') || '<p class="text-slate-500 italic text-sm col-span-full">No hay materiales en esta categoría.</p>';
        }

        wrapper.innerHTML = `
        ${topSection}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">SUPERMARS-KET Oficial</h2>
            ${!state.user.admin && state.user.role === 'TECNICO' ? `<button onclick="ui.modalCustom()" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] sm:text-[10px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all whitespace-nowrap">Solicitar I+D</button>` : ``}
        </div>
        <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-mars-border">
            ${filterButtons}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${itemsHtml}
        </div>`;
        el.appendChild(wrapper);
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
    },

    // FASE 3 v1.0.13: Lógica de Compra B2B
    promptBuyB2B(marketId) {
        if (!state.user) return;
        const item = (state.data.b2bMarket || []).find(m => m.marketId === marketId);
        if (!item) return;

        const html = `
            <p class="text-[10px] text-slate-400 mb-4">Estás a punto de iniciar un contrato de traspaso para adquirir <strong>${item.itemName}</strong> de la empresa <strong>${item.sellerName}</strong> por <strong class="text-mars-magenta">${item.price.toFixed(2)} €v</strong>.</p>
            <p class="text-[10px] text-mars-yellow mb-4">⚠️ IMPORTANTE: Esta acción reservará el objeto y enviará un contrato a la Aduana Docente. La compra no será efectiva hasta que el profesor firme el traspaso.</p>
        `;
        const actions = `<button onclick="ui.confirmBuyB2B('${marketId}')" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta transition-colors">Firmar Intención de Compra</button>`;
        this.showModal("Contrato de Traspaso B2B", html, actions);
    },

    confirmBuyB2B(marketId) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        state.data.b2bMarket = state.data.b2bMarket || [];
        const itemIdx = state.data.b2bMarket.findIndex(m => m.marketId === marketId);
        if (itemIdx === -1) return alert("El artículo ya no está disponible.");

        const item = state.data.b2bMarket[itemIdx];

        if (co.balance < item.price) return alert("Fondos virtuales insuficientes para esta compra.");

        // Bloquear el objeto en el inventario del vendedor
        const sellerCo = state.data.companies[item.sellerCoId];
        if (sellerCo && sellerCo.inventory) {
            const invItem = sellerCo.inventory.find(i => i.id === item.invId);
            if (invItem) invItem.status = 'PENDING_TRANSFER';
        }

        // Crear el contrato
        state.data.b2bContracts = state.data.b2bContracts || [];
        state.data.b2bContracts.unshift({
            id: 'CTR-' + Date.now(),
            marketId: item.marketId,
            invId: item.invId,
            sellerCoId: item.sellerCoId,
            sellerName: item.sellerName,
            buyerCoId: state.user.coId,
            buyerName: co.name,
            itemName: item.itemName,
            category: item.category,
            price: item.price,
            status: 'PENDIENTE_CLAUSTRO',
            date: new Date().toLocaleString()
        });

        // Retirar del mercado público
        state.data.b2bMarket.splice(itemIdx, 1);

        telemetry.log("MERCADO B2B", `Intención de compra firmada: ${item.itemName} a ${item.sellerName}`);
        ui.pushNotification(item.sellerCoId, 'CEO', `La empresa ${co.name} ha firmado la compra de tu ${item.itemName}. Pendiente de Aduana Docente.`, 'info');
        ui.pushNotification(state.user.coId, 'FINANZAS', `Contrato de compra por ${item.itemName} enviado a la Aduana Docente.`, 'info');

        state.save();
        this.closeModal();
        alert("Contrato enviado a la Aduana Docente. Esperando firma del profesor.");
        this.render();
    }
});