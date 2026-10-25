// js/ui-empresa-market.js
// --- MÓDULO CATÁLOGO B2B Y B2C CON BLINDAJE LÉXICO EN COMPRAS (v1.1.25) ---

Object.assign(ui, {
    marketTab: 'B2C',

    setMarketTab(tab) {
        this.marketTab = String(tab || 'B2C').toUpperCase();
        this.render();
    },

    viewMarket(el) {
        if (!el || !state.user) return;
        const wrapper = document.createElement('div');
        
        let tabsHtml = `
        <div role="tablist" aria-label="Mercados de suministro" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-2">
            <button type="button" role="tab" aria-selected="${this.marketTab==='B2C'}" onclick="ui.setMarketTab('B2C')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2C'?'bg-mars-cyan text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">🚀 Catálogo Oficial (B2C)</button>
            <button type="button" role="tab" aria-selected="${this.marketTab==='B2B'}" onclick="ui.setMarketTab('B2B')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2B'?'bg-mars-yellow text-black':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">🤝 Mercado Secundario (B2B)</button>
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
        const catalog = state.data.catalog || [];
        const visibleItems = catalog.filter(item => {
            if (!item.exclusiveFor) return true;
            const currentCoId = state.user?.coId;
            const isTeacher = Boolean(state.user?.admin);
            return item.exclusiveFor === currentCoId || isTeacher;
        });

        let categories = [...new Set(visibleItems.map(i => i.category))];
        let groupsHtml = categories.map(cat => {
            const items = visibleItems.filter(i => i.category === cat);
            const itemsHtml = items.map(item => {
                let actionBtn = canBuy 
                    ? `<button type="button" onclick="ui.addToCart('${this.escapeHTML(item.id)}')" class="w-full min-h-[44px] bg-slate-800 text-mars-cyan border border-mars-cyan hover:bg-mars-cyan hover:text-black font-black py-2 px-3 text-xs uppercase tracking-wider transition-all">🛒 Añadir al Carrito</button>` 
                    : (isDocente ? `<span class="block text-center text-slate-300 text-xs uppercase font-bold py-2 border border-slate-800 bg-black/40">Modo Supervisión</span>` : `<span class="block text-center text-slate-300 text-xs uppercase font-bold border border-slate-700 p-2.5 bg-black/40">Solo Dpto. Técnico</span>`);

                return `
                <div class="bg-slate-900 border border-slate-700 p-4 hover:border-mars-cyan/60 transition-colors flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between items-start mb-2 border-b border-slate-800 pb-2 gap-2">
                            <span class="font-mono text-slate-300 text-xs">${this.escapeHTML(item.id)}</span>
                            <span class="text-mars-green font-mono font-bold text-sm">${Number(item.price).toFixed(2)} €v</span>
                        </div>
                        <h4 class="text-white font-bold text-xs sm:text-sm uppercase mb-2 leading-snug break-words">${this.escapeHTML(item.name)}</h4>
                        <div class="flex flex-wrap justify-between gap-1 text-xs text-slate-300 uppercase mb-3">
                            <span>Medida: <span class="text-white font-bold">${this.escapeHTML(item.unit)}</span></span>
                            <span>Org: <span class="text-white font-bold">${this.escapeHTML(item.origin || '--')}</span></span>
                        </div>
                    </div>
                    ${actionBtn}
                </div>`;
            }).join('');
            
            return `
            <div class="mb-6">
                <h3 class="font-orbitron text-mars-cyan text-xs sm:text-sm uppercase border-b border-mars-cyan/40 pb-1.5 mb-3 font-bold">${this.escapeHTML(cat)}</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">${itemsHtml}</div>
            </div>`;
        }).join('');

        let header = `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6 border-t-4 border-t-mars-cyan flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="font-orbitron text-mars-cyan text-base sm:text-lg uppercase tracking-tighter">Catálogo Aeroespacial (B2C)</h2>
                <p class="text-xs text-slate-300 uppercase mt-1">Suministro oficial regulado en €v.</p>
            </div>
            ${canBuy ? `<button type="button" id="btn-cart-toggle" onclick="ui.modalCheckout()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2.5 font-black uppercase text-xs tracking-wider shadow-[0_0_15px_#00f0ff] hover:bg-white transition-all w-full sm:w-auto text-center shrink-0">🛒 Carrito de la compra (${(state.data.companies[state.user.coId]?.cart || []).length})</button>` : ''}
        </div>`;

        return header + groupsHtml;
    },

    renderB2BMarket() {
        const canSell = state.user.role === 'TECNICO' && !state.user.admin;
        const canBuy = canSell;
        const b2b = (state.data.b2bMarket || []).filter(i => !i.status || i.status === 'EN_VENTA');

        let offersHtml = '';
        if (b2b.length === 0) {
            offersHtml = `<div class="terminal-border border-dashed p-8 text-center text-slate-300 italic text-xs">El mercado de segunda mano está vacío.</div>`;
        } else {
            offersHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">` + b2b.map(item => {
                const isMine = !state.user.admin && item.sellerCoId === state.user.coId;
                let btn = '';
                if(isMine) btn = `<span class="block w-full text-center bg-slate-800 text-slate-200 font-bold py-2.5 text-xs uppercase border border-slate-700 min-h-[44px] flex items-center justify-center">Tu Oferta Activa</span>`;
                else if(canBuy) btn = `<button type="button" onclick="ui.modalBuyB2B('${this.escapeHTML(item.id)}')" class="w-full min-h-[44px] bg-mars-yellow/20 text-mars-yellow border border-mars-yellow hover:bg-mars-yellow hover:text-black font-black py-2.5 px-3 text-xs uppercase tracking-wider transition-all">Adquirir B2B</button>`;
                else btn = `<span class="block text-center text-slate-300 text-xs uppercase font-bold border border-slate-700 p-2.5 bg-black/40">Solo Dpto. Técnico</span>`;

                const itemObs = item.obs || item.notes || 'Sin observaciones';

                return `
                <div class="bg-slate-900 border border-mars-yellow/50 p-4 flex flex-col justify-between hover:border-mars-yellow transition-all">
                    <div>
                        <div class="flex justify-between items-start mb-2 border-b border-slate-800 pb-2 gap-2">
                            <span class="text-mars-yellow font-bold text-xs uppercase bg-mars-yellow/10 px-2 py-0.5 break-words">${this.escapeHTML(item.sellerName)}</span>
                            <span class="text-mars-green font-mono font-bold text-base shrink-0">${Number(item.price).toFixed(2)} €v</span>
                        </div>
                        <h4 class="text-white font-bold text-xs sm:text-sm uppercase mb-1.5 break-words">${this.escapeHTML(item.itemName)} (x${Number(item.qty)||1})</h4>
                        <p class="text-slate-300 text-xs italic mb-3 min-h-[2.5rem] break-words">"${this.escapeHTML(itemObs)}"</p>
                    </div>
                    ${btn}
                </div>`;
            }).join('') + `</div>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6 border-t-4 border-t-mars-yellow">
            <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Mercado Secundario (B2B)</h2>
            <p class="text-xs text-slate-300 uppercase mt-1 mb-6">Compra y venta entre startups. Toda transacción requiere validación en la Aduana Docente.</p>
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
        ui.pushNotification(state.user.coId, 'FINANZAS', `I+D ha añadido "${itemDef.name}" al carrito de la compra.`, 'info');
        this.notify(`Añadido al carrito de la compra: ${itemDef.name}`, 'info');
        this.render();
    },

    removeFromCart(itemId) {
        const co = state.data.companies[state.user.coId];
        if (!co) return;
        const idx = co.cart.findIndex(i => i.id === itemId);
        if(idx > -1) {
            const unitPrice = Number(co.cart[idx].price) || 0;
            co.cart[idx].qty--;
            const remainingQty = co.cart[idx].qty;
            if(co.cart[idx].qty <= 0) co.cart.splice(idx, 1);
            state.save();
            // Localizar la fila en el DOM sin cerrar ni reabrir el modal
            const row = document.querySelector(`[data-cart-item="${itemId}"]`);
            if (row) {
                if (remainingQty <= 0) {
                    row.style.transition = 'all 0.25s ease-out';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        row.remove();
                        const container = document.getElementById('cart-modal-items');
                        if (container && (!co.cart || co.cart.length === 0)) {
                            container.innerHTML = "<p class='text-slate-300 text-xs sm:text-sm py-4 text-center'>El carrito de la compra está vacío.</p>";
                            const btnTrans = document.getElementById('btn-transmit-cart');
                            if (btnTrans) btnTrans.style.display = 'none';
                        }
                    }, 250);
                } else {
                    const qtyEl = row.querySelector('.cart-item-qty');
                    if (qtyEl) qtyEl.textContent = String(remainingQty);
                    const subtotalEl = row.querySelector('.cart-item-subtotal');
                    if (subtotalEl) subtotalEl.textContent = `${(remainingQty * unitPrice).toFixed(2)} €v`;
                }
            }

            // Actualizar el total general #cart-total-badge de forma atómica
            const newTotal = co.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
            const totalBadge = document.getElementById('cart-total-badge');
            if (totalBadge) {
                totalBadge.textContent = `${newTotal.toFixed(2)} €v`;
            }

            const marketBtn = document.getElementById('btn-cart-toggle');
            if (marketBtn) {
                marketBtn.textContent = `🛒 Carrito de la compra (${co.cart.length})`;
            }
            const btnTrans = document.getElementById('btn-transmit-cart');
            if (btnTrans) {
                btnTrans.setAttribute('onclick', `ui.confirmCart(${newTotal})`);
            }
        }
    },

    validateB2BPrice(inputEl) {
        const btn = document.getElementById('btn-confirm-b2b');
        if (!btn || !inputEl) return;
        const raw = inputEl.value.trim();
        const num = parseFloat(raw);
        const isValid = raw !== '' && Number.isFinite(num) && num > 0 && num <= 1000000 && /^\d+(\.\d{1,2})?$/.test(raw);
        btn.disabled = !isValid;
        btn.classList.toggle('opacity-50', !isValid);
        btn.classList.toggle('cursor-not-allowed', !isValid);
    },

    modalPublishB2B(orderId, itemIndex) {
        if (!state.user || state.user.role !== 'TECNICO') return;
        const co = state.data.companies[state.user.coId];
        const ord = (co.orders||[]).find(o => String(o.id) === String(orderId));
        if(!ord || !ord.items[itemIndex]) return;
        const item = ord.items[itemIndex];

        const html = `
            <div class="bg-black border border-mars-yellow p-3 mb-4 flex justify-between items-center text-xs gap-2">
                <span class="text-white font-bold uppercase break-words">${this.escapeHTML(item.name)} (x${Number(item.qty)||1})</span>
                <span class="text-slate-300 line-through shrink-0">${Number(item.price).toFixed(2)} €v (Base)</span>
            </div>
            <label for="market-category" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Segmento de Mercado</label>
            <select id="market-category" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-xs text-white mb-3 outline-none focus:border-mars-yellow">
                <option value="B2B" selected>B2B (Mercado Secundario entre Startups)</option>
                <option value="B2C">B2C (Catálogo Oficial)</option>
            </select>
            <label for="input-unit-price" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Precio de Venta Propuesto (€v)</label>
            <input type="number" id="input-unit-price" min="0.01" max="1000000" step="0.01" required value="${(item.price * 0.8).toFixed(2)}" oninput="ui.validateB2BPrice(this)" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow/50 p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold mb-3 outline-none focus:border-mars-yellow">
            <label for="b2b-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Enlace Drive a Ficha Técnica / Estado (Opcional)</label>
            <input type="url" id="b2b-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." class="w-full bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-yellow mb-2">
        `;
        const actions = `<button type="button" id="btn-confirm-b2b" onclick="ui.confirmPublishB2B('${this.escapeHTML(orderId)}', ${Number(itemIndex)})" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all w-full sm:w-auto">Publicar Oferta B2B</button>`;
        this.showModal("Venta en Mercado Secundario", html, actions);
    },

    confirmPublishB2B(orderId, itemIndex) {
        const elCat = document.getElementById('market-category');
        const selectedMarket = (elCat && elCat.value) ? elCat.value.trim() : '';
        const allowedMarkets = ['B2B', 'B2C'];
        if (!allowedMarkets.includes(selectedMarket)) {
            return this.notify("Segmento de mercado no autorizado.", "warning");
        }
        const elPrice = document.getElementById('input-unit-price');
        const rawPrice = elPrice ? elPrice.value.trim() : '';
        const price = parseFloat(rawPrice);
        if (!rawPrice || isNaN(price) || !Number.isFinite(price) || price <= 0 || price > 1000000 || !/^\d+(\.\d{1,2})?$/.test(rawPrice)) {
            return this.notify("Precio unitario inválido. Debe ser un número estrictamente positivo (máx. 2 decimales, hasta 1.000.000 €v).", "warning");
        }
        const elDrive = document.getElementById('b2b-drive-url');
        const driveUrl = elDrive ? elDrive.value.trim() : '';
        if (driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace opcional debe pertenecer a un recurso válido de Google Drive.", "warning");
        }

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
            driveUrl: driveUrl || null,
            status: 'EN_VENTA',
            date: new Date().toLocaleString()
        });

        ui.pushNotification(state.user.coId, 'FINANZAS', `I+D ha puesto en venta B2B: ${item.name} por ${price.toFixed(2)} €v.`, 'info');
        state.save();
        this.closeModal();
        this.render();
        this.notify(`✅ Artículo publicado en el Mercado Secundario (B2B) por ${price.toFixed(2)} €v.`, "success");
    },

    modalBuyB2B(offerId) {
        if (!state.user || state.user.role !== 'TECNICO') return;
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || (offer.status && offer.status !== 'EN_VENTA')) return;

        const co = state.data.companies[state.user.coId];
        if (co.balance < offer.price) return this.notify("Fondos insuficientes para esta operación.", "error");

        const html = `
            <div class="bg-black border border-mars-yellow p-4 text-xs mb-4 space-y-2">
                <div class="flex justify-between border-b border-slate-800 pb-1.5 gap-2">
                    <span class="text-slate-300 uppercase">Vendedor:</span>
                    <span class="text-mars-yellow font-bold uppercase break-words text-right">${this.escapeHTML(offer.sellerName)}</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-1.5 gap-2">
                    <span class="text-slate-300 uppercase">Artículo:</span>
                    <span class="text-white font-bold uppercase break-words text-right">${this.escapeHTML(offer.itemName)} (x${Number(offer.qty)||1})</span>
                </div>
                <div class="flex justify-between items-end pt-2 gap-2">
                    <span class="text-slate-300 uppercase text-xs">Importe a deducir:</span>
                    <span class="text-mars-magenta font-mono font-bold text-lg">-${Number(offer.price).toFixed(2)} €v</span>
                </div>
            </div>
            <p class="text-xs text-slate-300 uppercase italic leading-relaxed">⚠️ La operación se descontará de Finanzas y pasará a revisión de la Aduana Docente antes de la entrega física de la pieza.</p>
        `;
        const actions = `<button type="button" onclick="ui.confirmBuyB2B('${this.escapeHTML(offerId)}')" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all w-full sm:w-auto">Firmar Compra B2B</button>`;
        this.showModal("Autorizar Compra B2B", html, actions);
    },

    confirmBuyB2B(offerId) {
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || (offer.status && offer.status !== 'EN_VENTA')) return;

        const co = state.data.companies[state.user.coId];
        if (co.balance < offer.price) return this.notify("Fondos insuficientes.", "error");

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
        this.notify("✅ Contrato B2B firmado. Fondos retenidos. A la espera de autorización aduanera docente.", "success");
    }
});