// js/auth.js

const auth = {
    press(n) { if(state.pin.length < 4) { state.pin += n; this.updateDots(); } },
    clear() { state.pin = ''; this.updateDots(); },
    updateDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((d, i) => d.style.background = i < state.pin.length ? '#00f0ff' : 'transparent');
    },
    normalizeStr(str) { return str.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_'); },
    
    updateRoleOptions() {
        const elCo = document.getElementById('login-co');
        const elRole = document.getElementById('login-role');
        if (!elCo || !elRole) return; // REGLA 3: DOM Seguro
        
        const coId = elCo.value;
        elRole.innerHTML = '';
        
        if (coId === 'admin') {
            Object.keys(state.data.config.teachers).forEach(key => {
                const opt = document.createElement('option');
                opt.value = key; opt.innerText = state.data.config.teachers[key].name;
                elRole.appendChild(opt);
            });
        } else {
            const co = state.data.companies[coId];
            if (co && co.roles) {
                Object.keys(co.roles).forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r; 
                    opt.innerText = r.replace('_', ' ');
                    elRole.appendChild(opt);
                });
            } else {
                ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'].forEach(r => {
                    const opt = document.createElement('option');
                    opt.value = r; opt.innerText = r.replace('_', ' ');
                    elRole.appendChild(opt);
                });
            }
        }
    },

    verify() {
        // REGLA 2: Protección Ghost Clicks
        if (!state.pin || state.pin.length < 4) return;

        const elCo = document.getElementById('login-co');
        const elRole = document.getElementById('login-role');
        if (!elCo || !elRole) return; // REGLA 3
        
        const coId = elCo.value;
        const roleRaw = elRole.value;
        const roleNorm = this.normalizeStr(roleRaw);
        
        if(coId === 'admin' && state.pin === '9999') { dev.open(); this.clear(); return; }

        if (coId === 'admin') {
            const teacher = state.data.config.teachers[roleRaw];
            if(teacher && state.pin === teacher.pin) this.login('admin', roleRaw, true, teacher.name);
            else this.fail();
        } else {
            const co = state.data.companies[coId];
            if(co && co.roles[roleNorm] === state.pin) this.login(coId, roleNorm, false, co.name);
            else this.fail();
        }
    },
    
    fail() { 
        alert("AUTH DENIED: PIN INCORRECTO"); 
        this.clear(); 
    },
    
    login(coId, roleKey, admin, entityName) {
        if (!coId || !roleKey) return; // REGLA 2
        
        state.user = { coId, role: roleKey, admin };
        localStorage.setItem(state.sessionKey, JSON.stringify(state.user));
        
        state.pin = '';
        this.updateDots();
        
        if(!admin) {
            const co = state.data.companies[coId];
            if (!co) return; // REGLA 1
            
            co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
            co.loginStats.roles = co.loginStats.roles || {};

            co.loginStats.totalLogins++;
            if(!co.loginStats.roles[roleKey]) co.loginStats.roles[roleKey] = {count:0, lastLogin:null};
            co.loginStats.roles[roleKey].count++;
            co.loginStats.roles[roleKey].lastLogin = new Date().toLocaleString();
        }
        
        telemetry.startSession(entityName, roleKey);
        
        if (typeof ui.playLoginAnimation === 'function') {
            ui.playLoginAnimation(roleKey);
            setTimeout(() => {
                this.completeLoginNavigation(admin, roleKey);
            }, 1200);
        } else {
            this.completeLoginNavigation(admin, roleKey);
        }
    },

    completeLoginNavigation(admin, roleKey) {
        document.getElementById('hud-header')?.classList.remove('hidden');
        document.getElementById('hud-nav')?.classList.remove('hidden');
        this.buildNav(admin);
        
        if (admin) ui.navigate('admin');
        else if (roleKey === 'CEO') ui.navigate('orders');
        else if (roleKey === 'TECNICO') ui.navigate('tech');
        else if (roleKey === 'FINANZAS') ui.navigate('finance');
        else if (roleKey === 'MARKETING') ui.navigate('brand');
        else if (roleKey === 'OPERACIONES_IA') ui.navigate('cart');
        else if (roleKey === 'AUXILIAR') ui.navigate('dossier');
        else ui.navigate('dossier');

        ui.showWelcomeModal();
    },
    
    logout() { 
        const vp = document.getElementById('viewport');
        const header = document.getElementById('hud-header');
        const nav = document.getElementById('hud-nav');
        const overlay = document.getElementById('modal-overlay');
        
        if (header) header.classList.add('hidden');
        if (nav) nav.classList.add('hidden');
        if (overlay) overlay.classList.add('hidden');
        
        if (vp) {
            vp.innerHTML = `
            <div class="min-h-[75vh] flex items-center justify-center w-full">
                <div class="text-mars-magenta font-orbitron text-xl sm:text-2xl animate-pulse glitch-text tracking-widest font-black">SYSTEM_DISCONNECT...</div>
            </div>`;
        }
        
        localStorage.removeItem(state.sessionKey);
        sessionStorage.removeItem('hideWelcome');
        
        setTimeout(() => {
            location.reload(); 
        }, 600);
    },
    
    buildNav(isAdmin) {
        const nav = document.getElementById('nav-container');
        if (!nav) return; // REGLA 3
        
        if (isAdmin) {
            nav.innerHTML = `
                <button onclick="ui.adminTab='dash'; ui.navigate('admin')" class="nav-tab tab-active px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase border-r border-mars-border text-mars-yellow whitespace-nowrap">Terminal Docente</button>
                <button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>
                <button onclick="ui.adminTab='eval'; ui.navigate('admin')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Rúbricas & Entregas</button>
                <button onclick="ui.navigate('dossier')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Dossier Académico</button>
            `;
            return;
        }
        
        const role = state.user.role;
        let html = '';
        
        const badgeHtml = (id) => `<span id="${id}" class="hidden ml-2 bg-mars-magenta text-white px-1.5 py-0.5 rounded-full text-[8px] animate-pulse shadow-[0_0_8px_#ff0055]">0</span>`;
        
        if (role === 'CEO') {
            html += `<button onclick="ui.navigate('orders')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Órdenes CEO ${badgeHtml('badge-orders')}</button>`;
            html += `<button onclick="ui.navigate('finance')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Finanzas</button>`;
        } else if (role === 'TECNICO') {
            html += `<button onclick="ui.navigate('tech')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">I+D y Pruebas</button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
            html += `<button onclick="ui.navigate('orders')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Órdenes I+D ${badgeHtml('badge-orders')}</button>`;
            html += `<button onclick="ui.navigate('cart')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Logística ${badgeHtml('badge-cart')}</button>`;
        } else if (role === 'FINANZAS') {
            html += `<button onclick="ui.navigate('finance')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Finanzas / Ledger</button>`;
            html += `<button onclick="ui.navigate('orders')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Órdenes de Compra ${badgeHtml('badge-orders')}</button>`;
        } else if (role === 'MARKETING') {
            html += `<button onclick="ui.navigate('brand')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Centro de Marca</button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
        } else if (role === 'OPERACIONES_IA') {
            html += `<button onclick="ui.navigate('cart')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Logística ${badgeHtml('badge-cart')}</button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
            html += `<button onclick="ui.navigate('ailog')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Buzón Bitácora IA ${badgeHtml('badge-ailog')}</button>`;
        } else if (role === 'AUXILIAR') {
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
        }
        
        if (role !== 'TECNICO' && role !== 'MARKETING' && role !== 'OPERACIONES_IA' && role !== 'AUXILIAR') {
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
        }
        
        html += `<button onclick="ui.navigate('resolutions')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center whitespace-nowrap">Gobernanza / Actas ${badgeHtml('badge-resolutions')}</button>`;
        html += `<button onclick="ui.navigate('dossier')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Dossier / Notas</button>`;
        nav.innerHTML = html;
    }
};

const dev = {
    clickCount: 0, clickTimer: null,
    handleTrigger() {
        this.clickCount++;
        clearTimeout(this.clickTimer);
        if(this.clickCount >= 3) { this.open(); this.clickCount = 0; }
        else { this.clickTimer = setTimeout(() => this.clickCount = 0, 400); }
    },
    open() {
        // FIX: Eliminada la vulnerabilidad que mostraba los PINs en texto claro
        let html = `<h4 class="text-mars-magenta glitch-text font-bold mb-4">DEV_BACKDOOR_ACCESS_GRANTED [v${typeof APP_VERSION !== 'undefined' ? APP_VERSION : '1.0'}]</h4>`;
        html += `<div class="bg-black border border-mars-magenta p-4 text-[10px] space-y-4 mb-4 font-mono">`;
        html += `<p class="text-mars-cyan">Terminal de diagnóstico activada. Los códigos PIN han sido ocultados por seguridad.</p>`;
        html += `</div>`;
        const actions = `<button onclick="dev.resetTeacherPins()" class="bg-mars-yellow text-black px-4 py-2 text-[9px] font-bold uppercase hover:bg-white">Reset Docentes</button><button onclick="dev.rootLogin()" class="bg-mars-magenta text-white px-4 py-2 text-[9px] font-bold uppercase hover:bg-white hover:text-mars-magenta">Login Root Bypass</button>`;
        ui.showModal("Terminal de Rescate", html, actions);
    },
    resetTeacherPins() {
        Object.keys(state.data.config.teachers).forEach((k, idx) => { 
            if(k === 'COORD_MARIO') state.data.config.teachers[k].pin = '0001';
            else if(k === 'COORD_ALEX') state.data.config.teachers[k].pin = '0002';
            else state.data.config.teachers[k].pin = '0' + (idx+1) + '0' + (idx+1); 
        });
        state.save();
        alert("PINs docentes restablecidos a valores de fábrica.");
        ui.closeModal();
    },
    rootLogin() { ui.closeModal(); auth.login('admin', 'COORD_MARIO', true, "ROOT_OVERRIDE"); }
};