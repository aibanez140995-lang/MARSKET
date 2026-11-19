// js/ui-empresa-market.js
// --- MÓDULO CATÁLOGO B2B Y B2C CON BLINDAJE LÉXICO EN COMPRAS (v1.1.28) ---

Object.assign(ui, {
    marketTab: 'B2C',
    catalogCategoryFilter: 'ALL',
    catalogSearchQuery: '',

    isConsumableCatalogItem(item) {
        if (!item) return false;
        const cat = String(item.category || '').toLowerCase();
        const unit = String(item.unit || '').toLowerCase();
        return cat.includes('reactivo') || cat.includes('propuls') || ['gramo', '10 ml', 'ml', 'cm', 'decímetro', 'decimetro', 'uso'].some(u => unit.includes(u));
    },

    setCatalogCategory(cat) {
        this.catalogCategoryFilter = cat;
        this.render();
    },

    modalCustomOrder() {
        if (typeof this.modalCheckout === 'function') {
            this.modalCheckout();
        }
    },

    setMarketTab(tab) {
        this.marketTab = String(tab || 'B2C').toUpperCase();
        this.render();
    },

    viewMarket(el) {
        if (!el || !state.user) return;
        const wrapper = document.createElement('div');
        const co = (!state.user?.admin && state.user?.coId) ? state.data?.companies?.[state.user.coId] : null;
        const isBankrupt = Boolean(this.isCompanyBankrupt && this.isCompanyBankrupt(co));
        const canBuy = this.getEffectiveRole() === 'TECNICO' && !state.user?.admin;
        
        let tabsHtml = `
        ${(co && this.renderRoleActivePhaseDeliverableBanner) ? this.renderRoleActivePhaseDeliverableBanner(co) : ''}
        ${canBuy ? `<div class="mb-3 px-3 py-2 bg-cyan-950/30 border border-cyan-500/30 rounded text-xs text-slate-200 font-sans">💡 <strong>Sin sustos:</strong> añadir piezas al carrito <strong>no gasta €v todavía</strong>; Finanzas debe revisar y aprobar el pedido antes de descontar saldo.</div>` : ''}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 border-b border-mars-border pb-3">
            <div role="tablist" aria-label="Mercados de suministro" class="flex flex-wrap gap-2">
                <button type="button" role="tab" aria-selected="${this.marketTab==='B2C'}" onclick="ui.setMarketTab('B2C')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2C'?'bg-mars-cyan text-black font-black shadow-[0_0_10px_rgba(0,240,255,0.4)]':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">🚀 Catálogo Oficial (B2C)</button>
                <button type="button" role="tab" aria-selected="${this.marketTab==='B2B'}" onclick="ui.setMarketTab('B2B')" class="min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase transition-colors whitespace-nowrap ${this.marketTab==='B2B'?'bg-mars-yellow text-black font-black shadow-[0_0_10px_rgba(255,204,0,0.4)]':'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'}">🤝 Mercado Secundario (B2B)</button>
            </div>
            ${canBuy ? (isBankrupt ? `
                <button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] bg-slate-800 border border-red-500/40 text-slate-400 px-4 py-2 font-black uppercase text-xs tracking-wider cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    <span>🔒 I+D Bloqueado (Saldo ≤ 0 €v)</span>
                </button>
            ` : `
                <button type="button" onclick="ui.modalSpecialItem()" class="min-h-[44px] bg-mars-magenta text-white hover:bg-white hover:text-mars-magenta px-4 py-2 font-black uppercase text-xs tracking-wider transition-all whitespace-nowrap shadow-[0_0_12px_rgba(255,0,85,0.4)] flex items-center justify-center gap-1.5 w-full sm:w-auto">
                    <span>📡 + Solicitar Material I+D</span>
                </button>
            `) : ''}
        </div>`;
        wrapper.innerHTML = tabsHtml;

        const content = document.createElement('div');
        if(this.marketTab === 'B2C') content.innerHTML = this.renderCatalog();
        else content.innerHTML = this.renderB2BMarket();
        
        wrapper.appendChild(content);
        el.appendChild(wrapper);
        if (this.marketTab === 'B2C' && this.catalogSearchQuery) {
            this.filterCatalog(this.catalogSearchQuery);
        }
    },

    renderCatalog() {
        const co = (!state.user?.admin && state.user?.coId) ? state.data?.companies?.[state.user.coId] : null;
        const isBankrupt = Boolean(this.isCompanyBankrupt && this.isCompanyBankrupt(co));
        const canBuy = this.getEffectiveRole() === 'TECNICO' && !state.user?.admin;
        const isDocente = state.user.admin;
        const catalog = state.data.catalog || [];
        const visibleItems = catalog.filter(item => {
            if (!item.exclusiveFor) return true;
            const currentCoId = state.user?.coId;
            const isTeacher = Boolean(state.user?.admin);
            return item.exclusiveFor === currentCoId || isTeacher;
        });

        let categories = [...new Set(visibleItems.map(i => i.category))];
        const activeCat = this.catalogCategoryFilter || 'ALL';
        const filteredCategories = activeCat === 'ALL' ? categories : categories.filter(c => c === activeCat);

        const pillsHtml = `
        <div class="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide text-xs" role="tablist" aria-label="Filtrar por categoría">
            <button type="button" onclick="ui.setCatalogCategory('ALL')" class="min-h-[44px] px-3.5 py-2 font-bold uppercase transition-all rounded-sm whitespace-nowrap shrink-0 ${activeCat === 'ALL' ? 'bg-mars-cyan text-black font-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                ✨ Todas (${visibleItems.length})
            </button>
            ${categories.map(cat => {
                const count = visibleItems.filter(i => i.category === cat).length;
                const isSelected = activeCat === cat;
                return `
                <button type="button" onclick="ui.setCatalogCategory('${this.escapeAttr(cat)}')" class="min-h-[44px] px-3.5 py-2 font-bold uppercase transition-all rounded-sm whitespace-nowrap shrink-0 ${isSelected ? 'bg-mars-cyan text-black font-black shadow-[0_0_10px_rgba(0,240,255,0.4)]' : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'}">
                    ${this.escapeHTML(cat)} (${count})
                </button>
                `;
            }).join('')}
        </div>`;

        let groupsHtml = filteredCategories.length === 0
            ? `<div class="terminal-border bg-slate-950 p-6 my-4 text-center border-dashed border-mars-cyan/40">
                <p class="text-xs text-slate-300 uppercase">No hay artículos disponibles en esta categoría.</p>
                <p class="text-[11px] text-slate-400 mt-1">¿No encuentras lo que buscas? Puedes solicitar materiales especiales de I+D fuera de catálogo.</p>
                <div class="flex justify-center gap-2 mt-3 flex-wrap">
                    <button type="button" onclick="ui.setCatalogCategory('ALL')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-bold text-xs uppercase">Ver Todas las Categorías</button>
                    ${canBuy ? (isBankrupt
                        ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-red-500/40 text-slate-400 font-bold text-xs uppercase cursor-not-allowed">🔒 I+D Bloqueado (Saldo ≤ 0 €v)</button>`
                        : `<button type="button" onclick="ui.modalSpecialItem()" class="min-h-[44px] px-4 py-2 bg-mars-magenta text-white font-bold text-xs uppercase hover:bg-white hover:text-mars-magenta transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">+ Solicitar Material I+D</button>`) : ''}
                </div>
               </div>`
            : filteredCategories.map(cat => {
            const items = visibleItems.filter(i => i.category === cat);
            const itemsHtml = items.map(item => {
                const isConsumable = this.isConsumableCatalogItem ? this.isConsumableCatalogItem(item) : false;
                let actionBtn = canBuy 
                    ? (isBankrupt
                        ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="w-full min-h-[44px] bg-slate-800 text-slate-400 border border-red-500/40 cursor-not-allowed font-black py-2 px-3 text-xs uppercase tracking-wider">🔒 Bloqueado Saldo ≤ 0</button>`
                        : (isConsumable
                            ? `<div class="flex gap-1.5 w-full">
                                <button type="button" onclick="ui.addToCart('${this.escapeHTML(item.id)}', 1)" class="flex-1 min-h-[44px] bg-slate-800 text-mars-cyan border border-mars-cyan hover:bg-mars-cyan hover:text-black font-black py-2 px-2 text-xs uppercase tracking-wider transition-all">🛒 +1</button>
                                <button type="button" onclick="ui.addToCart('${this.escapeHTML(item.id)}', 5)" aria-label="Añadir 5 de ${this.escapeAttr(item.name)}" class="min-h-[44px] min-w-[44px] bg-slate-900 text-mars-green border border-mars-green/60 hover:bg-mars-green hover:text-black font-black py-2 px-2.5 text-xs font-mono transition-all">+5</button>
                                <button type="button" onclick="ui.addToCart('${this.escapeHTML(item.id)}', 10)" aria-label="Añadir 10 de ${this.escapeAttr(item.name)}" class="min-h-[44px] min-w-[44px] bg-slate-900 text-mars-yellow border border-mars-yellow/60 hover:bg-mars-yellow hover:text-black font-black py-2 px-2.5 text-xs font-mono transition-all">+10</button>
                               </div>`
                            : `<button type="button" onclick="ui.addToCart('${this.escapeHTML(item.id)}')" class="w-full min-h-[44px] bg-slate-800 text-mars-cyan border border-mars-cyan hover:bg-mars-cyan hover:text-black font-black py-2 px-3 text-xs uppercase tracking-wider transition-all">🛒 Añadir al Carrito</button>`)) 
                    : (isDocente ? `<span class="block text-center text-slate-300 text-xs uppercase font-bold py-2 border border-slate-800 bg-black/40">Modo Supervisión</span>` : `<span class="block text-center text-slate-300 text-xs uppercase font-bold border border-slate-700 p-2.5 bg-black/40">Solo Dpto. Técnico</span>`);

                return `
                <div class="catalog-item bg-slate-900 border border-slate-700 p-4 hover:border-mars-cyan/60 transition-colors h-full flex flex-col justify-between" data-search="${this.escapeHTML((item.name + ' ' + item.id + ' ' + (item.category || '')).toLowerCase())}">
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
            <div class="catalog-group mb-6">
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
            ${canBuy ? `
            <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black px-3.5 py-2.5 font-bold uppercase text-xs tracking-wider transition-all whitespace-nowrap shadow-sm">
                    Mis Órdenes (${((state.data.companies[state.user.coId]?.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS')).length})
                </button>
                <button type="button" id="btn-cart-toggle" onclick="ui.modalCheckout()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2.5 font-black uppercase text-xs tracking-wider shadow-[0_0_15px_#00f0ff] hover:bg-white transition-all w-full sm:w-auto text-center shrink-0">
                    🛒 Carrito (${(state.data.companies[state.user.coId]?.cart || []).length})
                </button>
            </div>` : ''}
        </div>`;

        const searchBarHtml = `
        <div class="mb-3">
            <input type="text" id="catalog-search-input" value="${this.escapeAttr(this.catalogSearchQuery || '')}" oninput="ui.catalogSearchQuery = this.value; ui.filterCatalog(this.value)" placeholder="🔍 Buscar material o reactivo (ej: Manómetro, Bicarbonato, Válvula...)" class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/50 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-mars-cyan font-mono">
        </div>`;

        const catalogFooterHtml = canBuy ? `
        <div class="terminal-border bg-slate-950 p-4 sm:p-5 mt-6 border-t-2 border-t-mars-magenta flex flex-col sm:flex-row justify-between items-center gap-3">
            <div>
                <h4 class="font-orbitron text-xs sm:text-sm text-mars-magenta uppercase font-bold">¿Necesitas reactivos o piezas fuera de catálogo?</h4>
                <p class="text-xs text-slate-300 uppercase mt-0.5">El Dpto. Técnico puede solicitar materiales especiales de I+D a Coordinación mediante memoria técnica en Google Docs.</p>
            </div>
            ${isBankrupt
                ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="shrink-0 min-h-[44px] px-4 py-2 bg-slate-900 border border-rose-500/60 text-rose-300 font-black text-xs uppercase cursor-not-allowed">🔒 Bloqueado (Saldo ≤ 0 €v)</button>`
                : `<button type="button" onclick="ui.modalSpecialItem()" class="shrink-0 min-h-[44px] px-4 py-2 bg-mars-magenta text-white font-black text-xs uppercase hover:bg-white hover:text-mars-magenta transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]">+ Solicitar Material I+D</button>`
            }
        </div>` : '';

        return header + searchBarHtml + pillsHtml + groupsHtml + catalogFooterHtml;
    },

    filterCatalog(query) {
        const cleanNorm = (str) => String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const q = cleanNorm(query);
        const items = document.querySelectorAll('.catalog-item');
        const groups = document.querySelectorAll('.catalog-group');

        if (!q) {
            items.forEach(el => el.classList.remove('hidden'));
            groups.forEach(el => el.classList.remove('hidden'));
            return;
        }

        items.forEach(el => {
            const rawSearch = el.getAttribute('data-search') || el.innerText;
            const searchData = cleanNorm(rawSearch);
            if (searchData.includes(q)) {
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });

        groups.forEach(grp => {
            const hasVisible = grp.querySelector('.catalog-item:not(.hidden)');
            if (hasVisible) {
                grp.classList.remove('hidden');
            } else {
                grp.classList.add('hidden');
            }
        });
    },

    renderB2BMarket() {
        const myCo = !state.user.admin ? state.data.companies[state.user.coId] : null;
        const isBankrupt = Boolean(this.isCompanyBankrupt && this.isCompanyBankrupt(myCo));
        const effRole = this.getEffectiveRole(myCo);
        const canSell = effRole === 'TECNICO' && !state.user.admin;
        const canBuy = canSell;
        const b2b = (state.data.b2bMarket || []).filter(i => i && (!i.status || i.status === 'EN_VENTA'));

        let offersHtml = '';
        if (b2b.length === 0) {
            offersHtml = `<div class="terminal-border border-dashed p-8 text-center text-slate-300 italic text-xs">El mercado de segunda mano está vacío.</div>`;
        } else {
            offersHtml = `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">` + b2b.map(item => {
                const isMine = !state.user.admin && item.sellerCoId === state.user.coId;
                const isFinanzas = effRole === 'FINANZAS' || state.user.admin;
                const pendingBuyOrder = myCo ? (myCo.orders || []).find(o => o.offerId === item.id && (o.status === 'PENDIENTE_FINANZAS' || o.status === 'PENDIENTE_DOCENTE')) : null;
                let btn = '';
                if (isMine) {
                    if (isFinanzas) {
                        btn = `
                        <div class="flex flex-col gap-1.5 w-full mt-2">
                            <span class="block w-full text-center bg-slate-800 text-slate-200 font-bold py-1.5 text-xs uppercase border border-slate-700">Tu Oferta Activa</span>
                            <button type="button" onclick="ui.withdrawB2BOffer('${this.escapeHTML(item.id)}')" class="w-full min-h-[44px] bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white text-xs font-bold uppercase transition-all" title="Retirar del mercado y devolver al taller">
                                🗑️ Retirar Oferta
                            </button>
                        </div>`;
                    } else {
                        btn = `<span class="block w-full text-center bg-slate-800 text-slate-200 font-bold py-2.5 text-xs uppercase border border-slate-700 min-h-[44px] flex items-center justify-center">Tu Oferta Activa</span>`;
                    }
                } else if (pendingBuyOrder) {
                    if (pendingBuyOrder.status === 'PENDIENTE_DOCENTE') {
                        btn = `<span class="w-full min-h-[44px] flex items-center justify-center bg-purple-950/60 border border-purple-500/60 text-purple-300 font-bold text-xs uppercase px-2 text-center rounded">⏳ Retenido en Aduana Docente</span>`;
                    } else if (effRole === 'FINANZAS') {
                        btn = isBankrupt
                            ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="w-full min-h-[44px] bg-slate-800 text-slate-400 border border-red-500/40 font-black py-2.5 px-3 text-xs uppercase cursor-not-allowed">🔒 Autorización Bloqueada (Saldo ≤ 0)</button>`
                            : `<button type="button" onclick="ui.approveB2BBuyByFinanzas('${this.escapeHTML(pendingBuyOrder.id)}')" class="w-full min-h-[44px] bg-mars-yellow text-black font-black py-2.5 px-3 text-xs uppercase shadow-[0_0_12px_rgba(255,204,0,0.4)] hover:bg-white transition-all">[ 🤝 Autorizar Compra B2B (${Number(item.price).toFixed(2)} €v) ]</button>`;
                    } else {
                        btn = `<span class="w-full min-h-[44px] flex items-center justify-center bg-amber-950/60 border border-amber-500/60 text-amber-300 font-bold text-xs uppercase px-2 text-center rounded">⏳ Solicitado a Finanzas</span>`;
                    }
                } else if (canBuy) {
                    btn = isBankrupt
                        ? `<button type="button" onclick="ui.notifyBankruptcyLock()" class="w-full min-h-[44px] bg-slate-800 text-slate-400 border border-red-500/40 font-black py-2.5 px-3 text-xs uppercase tracking-wider cursor-not-allowed">🔒 Compra B2B Bloqueada (Saldo ≤ 0)</button>`
                        : `<button type="button" onclick="ui.modalBuyB2B('${this.escapeHTML(item.id)}')" class="w-full min-h-[44px] bg-mars-yellow/20 text-mars-yellow border border-mars-yellow hover:bg-mars-yellow hover:text-black font-black py-2.5 px-3 text-xs uppercase tracking-wider transition-all">Adquirir B2B</button>`;
                } else if (effRole === 'FINANZAS') {
                    btn = `<span class="block text-center text-slate-400 text-xs uppercase font-bold border border-slate-800 p-2.5 bg-black/40 min-h-[44px] flex items-center justify-center">I+D debe solicitar la compra</span>`;
                } else {
                    btn = `<span class="block text-center text-slate-300 text-xs uppercase font-bold border border-slate-700 p-2.5 bg-black/40 min-h-[44px] flex items-center justify-center">Solo Dpto. Técnico</span>`;
                }

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
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Mercado Secundario (B2B)</h2>
                    <p class="text-xs text-slate-300 uppercase mt-1">Compra y venta entre startups. Toda transacción requiere validación en la Aduana Docente.</p>
                </div>
            </div>
            ${offersHtml}
        </div>`;
    },

    addToCart(itemId, qty = 1, fromModal = false) {
        if (!state.user || this.getEffectiveRole() !== 'TECNICO') return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        const itemDef = state.data.catalog.find(i => i.id === itemId);
        if(!itemDef) return;
        const addQty = Math.max(1, Math.min(100, parseInt(qty, 10) || 1));

        co.cart = co.cart || [];
        const exist = co.cart.find(i => i.id === itemId);
        if (exist) { exist.qty = (Number(exist.qty) || 0) + addQty; } 
        else { co.cart.push({ ...itemDef, qty: addQty }); }
        co.cartUpdatedAt = Date.now();

        state.save(state.user.coId);
        const toggleBtn = document.getElementById('btn-cart-toggle');
        if (toggleBtn) toggleBtn.textContent = `🛒 Carrito (${co.cart.length})`;
        if (typeof this.updateBadges === 'function') this.updateBadges();

        if (fromModal) {
            const row = document.querySelector(`[data-cart-item="${itemId}"]`);
            if (row && exist) {
                const qtyEl = row.querySelector('.cart-item-qty');
                if (qtyEl) qtyEl.textContent = String(exist.qty);
                const subtotalEl = row.querySelector('.cart-item-subtotal');
                if (subtotalEl) subtotalEl.textContent = `${(Number(exist.price) * Number(exist.qty)).toFixed(2)} €v`;
                const newTotal = co.cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 0), 0);
                const totalBadge = document.getElementById('cart-total-badge');
                if (totalBadge) totalBadge.textContent = `${newTotal.toFixed(2)} €v`;
                const btnTrans = document.getElementById('btn-transmit-cart');
                if (btnTrans) btnTrans.setAttribute('onclick', `ui.confirmCart(${newTotal})`);
                const freeBalWarn = document.getElementById('cart-free-balance-warning');
                if (freeBalWarn && state.getFreeVirtualBalance) {
                    const freeBal = state.getFreeVirtualBalance(co);
                    freeBalWarn.classList.toggle('hidden', newTotal <= freeBal);
                }
                return;
            }
            if (typeof this.modalCheckout === 'function') {
                this.modalCheckout();
                return;
            }
        }
        this.notify(`Añadido al carrito (+${addQty}): ${itemDef.name}`, 'info');
    },

    removeFromCart(itemId) {
        const co = state.data.companies[state.user.coId];
        if (!co || (this.getEffectiveRole(co) !== 'TECNICO' && !state.user?.admin)) return;
        const idx = co.cart.findIndex(i => i.id === itemId);
        if(idx > -1) {
            const unitPrice = Number(co.cart[idx].price) || 0;
            co.cart[idx].qty--;
            const remainingQty = co.cart[idx].qty;
            if(co.cart[idx].qty <= 0) co.cart.splice(idx, 1);
            co.cartUpdatedAt = Date.now();
            state.save(state.user.coId);
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
                marketBtn.textContent = `🛒 Carrito (${co.cart.length})`;
            }
            if (typeof this.updateBadges === 'function') this.updateBadges();
            const btnTrans = document.getElementById('btn-transmit-cart');
            if (btnTrans) {
                btnTrans.setAttribute('onclick', `ui.confirmCart(${newTotal})`);
            }
            const freeBalWarn = document.getElementById('cart-free-balance-warning');
            if (freeBalWarn && state.getFreeVirtualBalance) {
                const freeBal = state.getFreeVirtualBalance(co);
                freeBalWarn.classList.toggle('hidden', newTotal <= freeBal);
            }
        }
    },

    validateB2BPrice(inputEl) {
        const btn = document.getElementById('btn-confirm-b2b');
        if (!btn || !inputEl) return;
        const raw = inputEl.value.trim().replace(',', '.');
        const num = parseFloat(raw);
        const isValid = raw !== '' && Number.isFinite(num) && num > 0 && num <= 1000000 && /^\d+(\.\d{1,2})?$/.test(raw);
        btn.disabled = !isValid;
        btn.classList.toggle('opacity-50', !isValid);
        btn.classList.toggle('cursor-not-allowed', !isValid);
    },

    modalPublishB2B(orderId, itemIndex) {
        return this.modalSellB2B(orderId, itemIndex);
    },

    confirmPublishB2B(orderId, itemIndex) {
        return this.confirmSellB2B(orderId, itemIndex);
    },

    modalBuyB2B(offerId) {
        if (!state.user || this.getEffectiveRole() !== 'TECNICO') return;
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || (offer.status && offer.status !== 'EN_VENTA')) return;

        const co = state.data.companies[state.user.coId];
        if (co.balance < offer.price) return this.notify("Fondos insuficientes para esta operación.", "error");

        const html = `
            <div class="bg-black border border-mars-yellow p-4 text-xs mb-3 space-y-2">
                <div class="flex justify-between border-b border-slate-800 pb-1.5 gap-2">
                    <span class="text-slate-300 uppercase">Vendedor:</span>
                    <span class="text-mars-yellow font-bold uppercase break-words text-right">${this.escapeHTML(offer.sellerName)}</span>
                </div>
                <div class="flex justify-between border-b border-slate-800 pb-1.5 gap-2">
                    <span class="text-slate-300 uppercase">Artículo:</span>
                    <span class="text-white font-bold uppercase break-words text-right">${this.escapeHTML(offer.itemName)} (x${Number(offer.qty)||1})</span>
                </div>
                <div class="flex justify-between items-end pt-2 gap-2">
                    <span class="text-slate-300 uppercase text-xs">Importe a solicitar:</span>
                    <span class="text-mars-yellow font-mono font-bold text-lg">${Number(offer.price).toFixed(2)} €v</span>
                </div>
            </div>
            ${offer.driveUrl ? `
            <div class="mb-3">
                <a href="${encodeURI(offer.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50">
                    <span>📄 Ver Ficha Técnica / Excedentes del Vendedor en Docs ↗</span>
                </a>
            </div>` : ''}
            <div class="space-y-1.5 mb-3 bg-slate-900/90 border border-mars-cyan/40 p-3 rounded">
                <label for="b2b-buy-drive-url" class="text-xs text-mars-cyan font-bold uppercase block">
                    Informe Técnico de Especificación (Google Drive / Docs) *
                </label>
                <div class="mb-2">
                    ${this.renderDocTemplateBtn ? this.renderDocTemplateBtn('DOC_9_ORDEN_ADQUISICION', '📄 Plantilla Orden Adquisición (Vista previa)') : ''}
                </div>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="b2b-buy-drive-url" required placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 bg-slate-900 border border-mars-border p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('b2b-buy-drive-url') : ''}
                </div>
                <p class="text-[10px] text-slate-400">De conformidad con la política Zero-Text, la justificación de la compra debe alojarse en el Google Doc corporativo con permisos de lectura para Finanzas y la Aduana Docente.</p>
            </div>
            <div class="bg-amber-950/40 border border-amber-500/50 p-3 rounded text-xs text-amber-200 mb-2 space-y-1">
                <p class="font-bold uppercase tracking-wide">⚠️ Circuito Regulatorio B2B:</p>
                <p>1. <strong>Técnico Solicita:</strong> Adjunta tu informe DOC_9.<br>2. <strong>Finanzas Autoriza:</strong> Bloquea la pieza en Aduana y retiene saldo.<br>3. <strong>Docente en Aduana:</strong> Valida la compraventa.<br>4. <strong>Logística/Taller:</strong> Recibe el material físico.</p>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmBuyB2B('${this.escapeHTML(offerId)}')" class="min-h-[44px] bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-white transition-all w-full sm:w-auto">[ 🤝 Solicitar Compra B2B a Finanzas ]</button>`;
        this.showModal("Solicitar Compra B2B a Finanzas", html, actions);
    },

    confirmBuyB2B(offerId) {
        if (!state.user || this.getEffectiveRole() !== 'TECNICO') return;
        const offer = state.data.b2bMarket.find(o => o.id === offerId);
        if(!offer || (offer.status && offer.status !== 'EN_VENTA')) {
            this.closeModal();
            this.render();
            return this.notify("Esta oferta ya no está disponible en el mercado secundario.", "warning");
        }

        if (offer.sellerCoId === state.user.coId) {
            this.closeModal();
            return this.notify("No puedes adquirir un artículo puesto en venta por tu propia empresa.", "warning");
        }

        const elDrive = document.getElementById('b2b-buy-drive-url');
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elDrive ? elDrive.value : '', elDrive, { required: true, label: 'la Orden de Adquisición (DOC_9)' })
            : { valid: Boolean(elDrive && this.cleanInput(elDrive.value).trim()), url: elDrive ? this.cleanInput(elDrive.value).trim() : '' };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock('buy-b2b-' + offerId, 1500)) return;

        const co = state.data.companies[state.user.coId];
        if (!co) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }

        // Comprobar si ya hay una solicitud pendiente de Finanzas para esta misma oferta
        co.orders = co.orders || [];
        const existingReq = co.orders.find(o => o.offerId === offerId && (o.status === 'PENDIENTE_FINANZAS' || o.status === 'PENDIENTE_DOCENTE'));
        if (existingReq) {
            this.closeModal();
            return this.notify("Ya has solicitado la compra de esta pieza a tu Departamento Financiero. Está pendiente de trámite.", "warning");
        }

        const now = Date.now();
        const orderNum = ui.getNextOrderNumber ? ui.getNextOrderNumber(co) : String(now).slice(-3);
        const newOrder = {
            id: orderNum,
            type: 'B2B_BUY_REQUEST',
            offerId: offer.id,
            sellerCoId: offer.sellerCoId,
            sellerName: offer.sellerName,
            sellerDriveUrl: offer.driveUrl || '',
            driveUrl: driveUrl,
            items: [{
                name: `[B2B] ${offer.itemName}`,
                qty: Number(offer.qty) || 1,
                price: Math.round((((Number(offer.price) || 0) / (Number(offer.qty) || 1)) + Number.EPSILON) * 100) / 100,
                category: offer.category || 'Componente'
            }],
            total: Number(offer.price) || 0,
            status: 'PENDIENTE_FINANZAS',
            date: new Date().toLocaleDateString(),
            timestamp: now
        };

        co.orders.unshift(newOrder);
        co.updatedAt = now;

        ui.pushNotification(state.user.coId, 'FINANZAS', `🤝 Técnico ha solicitado adquirir la pieza B2B "${offer.itemName}" (${Number(offer.price).toFixed(2)} €v, Orden #${orderNum}). Autoriza antes de que otra empresa la compre.`, 'warning', { view: 'finance' });

        state.save(state.user.coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.render();
        this.notify(`✅ Orden #${orderNum} enviada a Finanzas con DOC_9. La pieza sigue en el mercado hasta que Finanzas la autorice.`, "success");
    }
});
