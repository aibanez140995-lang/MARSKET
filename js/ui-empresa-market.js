// js/ui-empresa-market.js
// --- MÓDULO MERCADO: CATÁLOGO Y CARRITO TÉCNICO ---

Object.assign(ui, {
    setMarketFilter(cat) {
        this.marketFilter = cat;
        this.render();
    },

    viewMarket(el) {
        if (!el || !state.user || state.user.admin) return; 
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const wrapper = document.createElement('div');
        let topSection = '';
        let techBanner = '';
        
        if(state.user.role === 'TECNICO') {
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

            // FASE 2 v1.0.10: Limpieza UI/UX - Eliminado el bloque de subida del Informe Técnico de esta vista.
            topSection = `
            ${techBanner}
            `;
        }

        const currentFilter = this.marketFilter || 'ALL';

        const visibleCatalog = state.data.catalog.filter(item => {
            let isAllowed = false;
            if (!item.exclusiveFor) isAllowed = true;
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
        ${topSection}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">SUPERMARS-KET Oficial</h2>
            ${state.user.role === 'TECNICO' ? `<button onclick="ui.modalCustom()" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] sm:text-[10px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all whitespace-nowrap">Solicitar I+D</button>` : ``}
        </div>
        <div class="flex flex-wrap gap-2 mb-6 pb-4 border-b border-mars-border">
            ${filterButtons}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${visibleCatalog.map(item => {
                let buySection = '';
                if(state.user.role !== 'AUXILIAR') {
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
            }).join('') || '<p class="text-slate-500 italic text-sm col-span-full">No hay materiales en esta categoría.</p>'}
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
    }
});