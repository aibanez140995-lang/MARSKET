// js/ui-empresa-market.js
// --- MÓDULO CATÁLOGO B2B Y B2C CON BLINDAJE LÉXICO EN COMPRAS (v1.0.17) ---

Object.assign(ui, {
    marketTab: 'B2C',

    viewMarket(el) {
        if (!el || !state.user) return;
        const wrapper = document.createElement('div');
        
        let tabsHtml = `
        <div class="flex gap-1 mb-6 border-b border-mars-border pb-2 overflow-x-auto scrollbar-hide">
            <button onclick="ui.marketTab='B2C'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2C'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'}">🚀 Catálogo Oficial (B2C)</button>
            <button onclick="ui.marketTab='B2B'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2B'?'bg-mars-yellow text-black':'text-slate-400 hover:text-white'}">🤝 Mercado Secundario (B2B)</button>
        </div>`;
        wrapper.innerHTML = tabsHtml;

        const content = document.createElement('div');
        if(this.marketTab === 'B2C') content.innerHTML = this.renderCatalog();
        else content.innerHTML = this.renderB2BMarket();
        
        wrapper.appendChild(content);
        el.appendChild(wrapper);
    },

    renderCatalog() {
        const canBuy = state.user.role === 'TECNICO';
        const isDocente = state.user.admin;
        const catalogData = state.data.catalog || [];

        let categories = [...new Set(catalogData.map(i => i.category))];
        let groupsHtml = categories.map(cat => {
            const items = catalogData.filter(i => i.category === cat);
            const itemsHtml = items.map(item => {
                let actionBtn = canBuy 
                    ? `<button onclick="ui.addToCart('${item.id}')" class="w-full bg-slate-800 text-mars-cyan border border-mars-cyan hover:bg-mars-cyan hover:text-black font-black py-2 text-[9px] uppercase tracking-widest transition-all">Añadir</button>` 
                    : (isDocente ? `<span class="block text-center text-slate-500 text-[9px] uppercase font-bold">Modo Lectura</span>` : `<span class="block text-center text-slate-500 text-[9px] uppercase font-bold border border-slate-700 p-2">Solo Dpto. Técnico</span>`);

                return `
                <div class="bg-slate-900 border border-slate-800 p-3 hover:border-mars-cyan/50 transition-colors flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
                            <span class="font-mono text-slate-500 text-[9px]">${item.id}</span>
                            <span class="text-mars-green font-mono font-bold text-sm">${Number(item.price).toFixed(2)} €v</span>
                        </div>
                        <h4 class="text-white font-bold text-xs uppercase mb-1 leading-tight">${item.name}</h4>
                        <div class="flex justify-between text-[9px] text-slate-400 uppercase mb-3">
                            <span>Medida: <span class="text-white">${item.unit}</span></span>
                            <span>Org: <span class="text-white">${item.origin || '--'}</span></span>
                        </div>
                    </div>
                    ${actionBtn}
                </div>`;
            }).join('');
            
            return `
            <div class="mb-6">
                <h3 class="font-orbitron text-mars-cyan text-xs uppercase border-b border-mars-cyan/30 pb-1 mb-3">${cat}</h3>
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">${itemsHtml}</div>
            </div>`;
        }).join('');

        let header = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6 border-t-4 border-t-mars-cyan flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="font-orbitron text-mars-cyan text-base sm:text-lg uppercase tracking-tighter">Catálogo Aeroespacial (B2C)</h2>
                <p class="text-[9px] text-slate-400 uppercase mt-0.5">Suministro oficial. Precios regulados en €v.</p>
            </div>
            ${canBuy ? `<button onclick="ui.modalCheckout()" class="bg-mars-cyan text-black px-4 py-2 font-black uppercase text-[10px] tracking-widest shadow-[0_0_15px_#00f0ff] hover:bg-white transition-all w-full sm:w-auto text-center shrink-0">Borrador Técnico (${(state.data.companies[state.user.coId].cart || []).length})</button>` : ''}
        </div>`;

        return header + groupsHtml;
    },

    renderB2BMarket() {
        const canSell = state.user.role === 'TECNICO' && !state.user.admin;
        const canBuy = canSell;
        const b2b = (state.data.b2bMarket || []).filter(i => i.status === 'EN_VENTA');

        let offersHtml = '';
        if (b2b.length === 0) {
            offersHtml = `<div class="terminal-border border-dashed p-8 text-center text-slate-600 italic text-xs">El mercado de segunda mano está vacío.</div>`;
        } else {
            offersHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">` + b2b.map(item => {
                const isMine = !state.user.admin && item.sellerCoId === state.user.coId;
                let btn = '';
                if(isMine) btn = `<span class="block w-full text-center bg-slate-800 text-slate-400 font-bold py-2 text-[9px] uppercase border border-slate-700">Tu Oferta</span>`;
                else if(canBuy) btn = `<button onclick="ui.modalBuyB2B('${item.id}')" class="w-full bg-mars-yellow/20 text-mars-yellow border border-mars-yellow hover:bg-mars-yellow hover:text-black font-black py-2 text-[9px] uppercase tracking-widest transition-all">Adquirir B2B</button>`;
                else btn = `<span class="block text-center text-slate-500 text-[9px] uppercase font-bold border border-slate-700 p-2">Solo Técnico</span>`;

                return `
                <div class="bg-slate-900 border border-mars-yellow/50 p-4 flex flex-col justify-between hover:border-mars-yellow transition-all">
                    <div>
                        <div class="flex justify-between items-start mb-2 border-b border-slate-800 pb-2">
                            <span class="text-mars-yellow font-bold text-[9px] uppercase bg-mars-yellow/10 px-1.5 py-0.5">${item.sellerName}</span>
                            <span class="text-mars-green font-mono font-bold text-base">${Number(item.price).toFixed(2)} €v</span>
                        </div>
                        <h4 class="text-white font-bold text-xs uppercase mb-1">${item.itemName} (x${item.qty||1})</h4>
                        <p class="text-slate-400 text-[9px] italic mb-3 h-10 overflow-y-auto">"${item.obs || 'Sin observaciones'}"</p>
                    </div>
                    ${btn}
                </div>`;
            }).join('') + `</div>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6 border-t-4 border-t-mars-yellow">
            <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Mercado Secundario (B2B)</h2>
            <p class="text-[9px] text-slate-400 uppercase mt-0.5 mb-6">Compra y venta entre startups. Toda transacción requiere validación en la Aduana Docente.</p>
            ${offersHtml}
        </div>`;
    },

    addToCart(itemId) {
        if (!state.user || state.user.role !== 'TECNICO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const itemDef = state.data.catalog.find(i => i.id === itemId);
        if(!itemDef) return;

        co.cart = co.cart || [];
        const exist = co.cart.find(i => i.id === itemId);
        if (exist) { exist.qty++; } 
        else { co.cart.push({ ...itemDef, qty: 1 }); }

        state.save();
        ui.pushNotification(state.user.coId, 'FINANZAS', `I+D ha añadido "${itemDef.name}" al borrador del carrito.`, 'info');
        this.render();
    },

    removeFromCart(itemId) {
        const co = state.data.companies[state.user.coId];
        if (!co) return;
        const idx = co.cart.findIndex(i => i.id === itemId);
        if(idx > -1) {
            co.cart[idx].qty--;
            if(co.cart[idx].qty <= 0) co.cart.splice(idx, 1);
            state.save();
            this.modalCheckout(); 
        }
    },

    modalCheckout() {
        const co = state.data.companies[state.user.coId];
        if (!co || !co.cart || co.cart.length === 0) {
            return this.showModal("Borrador Técnico", "<p class='text-slate-500 text-sm'>El borrador está vacío.</p>", "");
        }

        let total = 0;
        let html = `<div class="max-h-60 overflow-y-auto mb-4 border-b border-mars-border pb-2 space-y-2 pr-2">`;
        co.cart.forEach(item => {
            const sum = item.price * item.qty;
            total += sum;
            html += `
            <div class="flex justify-between items-center text-[10px] bg-black p-2 border border-slate-800">
                <div class="flex-grow">
                    <span class="text-mars-cyan font-bold uppercase">${item.name}</span>
                    <span class="text-slate-400 block">${item.price} €v / ${item.unit}</span>
                </div>
                <div class="flex items-center gap-3">
                    <button onclick="ui.removeFromCart('${item.id}')" class="text-mars-magenta font-black px-2 hover:bg-mars-magenta/20">-</button>
                    <span class="text-white font-mono w-4 text-center">${item.qty}</span>
                    <button onclick="ui.addToCart('${item.id}'); ui.modalCheckout()" class="text-mars-green font-black px-2 hover:bg-mars-green/20">+</button>
                    <span class="text-mars-green font-mono font-bold w-16 text-right">${sum.toFixed(2)} €v</span>
                </div>
            </div>`;
        });
        html += `</div>
        <div class="flex justify-between items-center bg-slate-900 p-3 mb-4 border border-mars-cyan">
            <span class="text-[10px] text-slate-400 uppercase font-bold">Presupuesto Estimado</span>
            <span class="text-lg font-orbitron font-black text-mars-cyan">${total.toFixed(2)} €v</span>
        </div>
        <textarea id="checkout-justification" placeholder="Redacta la justificación técnica para el Departamento Financiero... (Obligatorio para que aprueben el gasto)" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white h-20 outline-none focus:border-mars-cyan mb-2"></textarea>
        `;
        
        const actions = `<button onclick="ui.confirmCart(${total})" class="bg-mars-cyan text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-mars-cyan transition-all w-full sm:w-auto">Transmitir a Finanzas</button>`;
        this.showModal("Revisión de Orden I+D", html, actions);
    },

    confirmCart(total) {
        const elJust = document.getElementById('checkout-justification');
        if(!elJust) return;
        const just = elJust.value.trim();
        if(just.length < 5) return alert("La justificación técnica es demasiado corta.");

        // FASE 4: Guardián Léxico Universal en Carrito
        if(ui.hasForbiddenWords(just, 'Justificación Carrito I+D')) return;

        const co = state.data.companies[state.user.coId];
        if (!co) return;

        co.orders = co.orders || [];
        const newOrder = {
            id: 'ORD-' + Date.now().toString().slice(-4),
            items: JSON.parse(JSON.stringify(co.cart)),
            total: total,
            justification: just,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleString()
        };

        co.orders.unshift(newOrder);
        co.cart = [];
        
        ui.pushNotification(state.user.coId, 'FINANZAS', `Nueva orden #${newOrder.id} (${total.toFixed(2)} €v) recibida de I+D. Requiere validación urgente.`, 'warning');
        ui.pushNotification(state.user.coId, 'CEO', `I+D ha tramitado la orden #${newOrder.id} a la espera de Finanzas.`, 'info');
        
        telemetry.log("CARRITO", `Orden enviada a Finanzas: ${total}€v`);
        state.save();
        this.closeModal();
        this.render();
        alert("✅ Orden de I+D tramitada. A la espera de autorización financiera.");
    },

    modalPublishB2B(orderId, itemIndex) {
        if (!state.user || state.user.role !== 'TECNICO') return;
        const co = state.data.companies[state.user.coId];
        const ord = (co.orders||[]).find(o => String(o.id) === String(orderId));
        if(!ord || !ord.items[itemIndex]) return;
        const item = ord.items[itemIndex];

        const html = `
            <div class="bg-black border border-mars-yellow p-3 mb-4 flex justify-between items-center text-xs">
                <span class="text-white font-bold uppercase">${item.name} (x${item.qty||1})</span>
                <span class="text-slate-500 line-through">${item.price.toFixed(2)} €v (Base)</span>
            </div>
            <label class="text-[9px] text-mars-yellow uppercase font-bold block mb-1">Precio de Venta Propuesto (€v)</label>
            <input type="number" id="b2b-price" value="${(item.price * 0.8).toFixed(2)}" step="0.5" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-sm text-mars-green font-mono font-bold mb-3 outline-none focus:border-mars-yellow">
            <textarea id="b2b-obs" placeholder="Observaciones técnicas de la pieza (estado, uso previo...)" class="w-full bg-slate-900 border border-mars-border p-2 text-xs text-white h-20 outline-none focus:border-mars-yellow"></textarea>
        `;
        const actions = `<button onclick="ui.confirmPublishB2B('${orderId}', ${itemIndex})" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all w-full sm:w-auto">Publicar Oferta B2B</button>`;
        this.showModal("Venta en Mercado Secundario", html, actions);
    },

    confirmPublishB2B(orderId, itemIndex) {
        const elObs = document.getElementById('b2b-obs');
        const price = parseFloat(document.getElementById('b2b-price').value);
        if(isNaN(price) || price <= 0) return alert("Precio inválido.");
        const obs = elObs ? elObs.value.trim() : '';

        // FASE 4: Guardián Léxico Universal en Venta B2B
        if (obs && ui.hasForbiddenWords(obs, 'Mercado B2B (Venta)')) return;

        const co = state.data.companies[state.user.coId];
        const ord = co.orders.find(o => String(o.id) === String(orderId));
        const item = ord.items[itemIndex];

        item.b2bStatus = 'EN_VENTA';
        
        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bMarket.unshift({
            id: 'OFF-' + Date.now().toString().slice(-4),
            sellerCoId: state.user.coId,
            sellerName: co.name,
            sourceOrderKey: `${orderId}-${itemIndex}`,
            itemName: item.name,
            qty: item.qty || 1,
            category: item.category,
            price: price,
            obs: obs,
            status: 'EN_VENTA',
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, 'FINANZAS', `I+D ha puesto en venta B2B: ${item.name} por ${price} €v.`, 'info');
        state.save();
        this.closeModal();
        this.render();
        alert(`✅ Artículo publicado en el Mercado Secundario (B2B) por ${price.toFixed(2)} €v.`);
    },

    modalBuyB2B(offerId) {
        if (!state.user || state.user.role !== 'TECNICO') return;
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || offer.status !== 'EN_VENTA') return;

        const co = state.data.companies[state.user.coId];
        if (co.balance < offer.price) return alert("Fondos insuficientes para esta operación.");

        const html = `
            <div class="bg-black border border-mars-yellow p-4 text-[10px] mb-4 space-y-2">
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-400 uppercase">Vendedor:</span>
                    <span class="text-mars-yellow font-bold uppercase">${offer.sellerName}</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-1">
                    <span class="text-slate-400 uppercase">Artículo:</span>
                    <span class="text-white font-bold uppercase">${offer.itemName} (x${offer.qty||1})</span>
                </div>
                <div class="flex justify-between items-end pt-2">
                    <span class="text-slate-400 uppercase text-[9px]">Importe a deducir:</span>
                    <span class="text-mars-magenta font-mono font-bold text-lg">-${Number(offer.price).toFixed(2)} €v</span>
                </div>
            </div>
            <p class="text-[9px] text-slate-400 uppercase italic">⚠️ La operación se descontará de Finanzas y pasará a revisión de la Aduana Docente antes de la entrega física de la pieza.</p>
        `;
        const actions = `<button onclick="ui.confirmBuyB2B('${offerId}')" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all w-full sm:w-auto">Firmar Compra B2B</button>`;
        this.showModal("Autorizar Compra B2B", html, actions);
    },

    confirmBuyB2B(offerId) {
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || offer.status !== 'EN_VENTA') return;

        const co = state.data.companies[state.user.coId];
        if (co.balance < offer.price) return alert("Fondos insuficientes.");

        offer.status = 'VENDIDO'; // Oculta del mercado abierto

        state.data.b2bContracts = state.data.b2bContracts || [];
        state.data.b2bContracts.unshift({
            id: 'B2BC-' + Date.now().toString().slice(-4),
            sellerCoId: offer.sellerCoId,
            sellerName: offer.sellerName,
            buyerCoId: state.user.coId,
            buyerName: co.name,
            itemName: offer.itemName,
            qty: offer.qty || 1,
            category: offer.category,
            price: offer.price,
            sourceOrderKey: offer.sourceOrderKey,
            status: 'PENDIENTE_ADUANA',
            date: new Date().toLocaleString()
        });

        state.addToLedger(state.user.coId, `[RETENCIÓN B2B] Compra pendiente de aduana: ${offer.itemName}`, 'ADUANA_B2B', -offer.price);

        ui.pushNotification(state.user.coId, 'FINANZAS', `Cargo en Ledger: -${offer.price.toFixed(2)} €v por compra B2B (${offer.itemName}). En Aduana.`, 'warning');
        
        telemetry.log("COMPRA B2B", `Contrato generado por ${offer.itemName}`);
        state.save();
        this.closeModal();
        this.render();
        alert("✅ Contrato B2B firmado. Fondos retenidos. A la espera de autorización aduanera docente.");
    }
});