// js/auth.js

// --- 4. AUTENTICACIÓN Y NORMALIZACIÓN ---
const auth = {
    press(n) { if(state.pin.length < 4) { state.pin += n; this.updateDots(); } },
    clear() { state.pin = ''; this.updateDots(); },
    updateDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((d, i) => d.style.background = i < state.pin.length ? '#00f0ff' : 'transparent');
    },
    normalizeStr(str) { return str.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '_'); },
    
    updateRoleOptions() {
        const coId = document.getElementById('login-co').value;
        const roleSelect = document.getElementById('login-role');
        roleSelect.innerHTML = '';
        
        if (coId === 'admin') {
            Object.keys(state.data.config.teachers).forEach(key => {
                const opt = document.createElement('option');
                opt.value = key; opt.innerText = state.data.config.teachers[key].name;
                roleSelect.appendChild(opt);
            });
        } else {
            ['CEO', 'Técnico', 'Finanzas', 'Marketing', 'Operaciones IA'].forEach(r => {
                const opt = document.createElement('option');
                opt.value = r; opt.innerText = r;
                roleSelect.appendChild(opt);
            });
        }
    },

    verify() {
        const coId = document.getElementById('login-co').value;
        const roleRaw = document.getElementById('login-role').value;
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
    fail() { alert("AUTH DENIED: PIN INCORRECTO"); this.clear(); },
    login(coId, roleKey, admin, entityName) {
        state.user = { coId, role: roleKey, admin };
        state.pin = '';
        
        if(!admin) {
            const co = state.data.companies[coId];
            co.loginStats.totalLogins++;
            if(!co.loginStats.roles[roleKey]) co.loginStats.roles[roleKey] = {count:0, lastLogin:null};
            co.loginStats.roles[roleKey].count++;
            co.loginStats.roles[roleKey].lastLogin = new Date().toLocaleString();
        }
        
        telemetry.startSession(entityName, roleKey);
        
        document.getElementById('hud-header').classList.remove('hidden');
        document.getElementById('hud-nav').classList.remove('hidden');
        this.buildNav(admin);
        
        if (admin) ui.navigate('admin');
        else if (roleKey === 'CEO') ui.navigate('orders');
        else if (roleKey === 'TECNICO') ui.navigate('tech');
        else if (roleKey === 'FINANZAS') ui.navigate('finance');
        else if (roleKey === 'MARKETING') ui.navigate('brand');
        else if (roleKey === 'OPERACIONES_IA') ui.navigate('cart');
        else ui.navigate('dossier');

        ui.showWelcomeModal();
    },
    logout() { location.reload(); },
    
    buildNav(isAdmin) {
        const nav = document.getElementById('nav-container');
        if (isAdmin) {
            nav.innerHTML = `
                <button onclick="ui.navigate('admin')" class="nav-tab tab-active px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase border-r border-mars-border text-mars-yellow whitespace-nowrap">Terminal Docente</button>
                <button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>
                <button onclick="ui.navigate('dossier')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Dossier y Rúbricas</button>
            `;
            return;
        }
        
        const role = state.user.role;
        let html = '';
        
        if (role === 'CEO') {
            html += `<button onclick="ui.navigate('orders')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Órdenes CEO (Bóveda)</button>`;
            html += `<button onclick="ui.navigate('finance')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Finanzas</button>`;
            html += `<button onclick="ui.navigate('resolutions')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Gobernanza / Actas</button>`;
        } else if (role === 'TECNICO') {
            html += `<button onclick="ui.navigate('tech')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">I+D y Pruebas</button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
            html += `<button onclick="ui.modalCustom()" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase text-mars-magenta hover:bg-mars-magenta/10 whitespace-nowrap">Req. Material I+D</button>`;
        } else if (role === 'FINANZAS') {
            html += `<button onclick="ui.navigate('finance')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Finanzas / Ledger</button>`;
            html += `<button onclick="ui.navigate('orders')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Órdenes de Compra</button>`;
        } else if (role === 'MARKETING') {
            html += `<button onclick="ui.navigate('brand')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Centro de Marca</button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
        } else if (role === 'OPERACIONES_IA') {
            html += `<button onclick="ui.navigate('cart')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan flex items-center gap-2 whitespace-nowrap">Logística <span id="cart-count" class="bg-mars-magenta text-white px-1.5 rounded-full text-[8px]">0</span></button>`;
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
            html += `<button onclick="ui.navigate('ailog')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Buzón Bitácora IA</button>`;
        }
        
        if (role !== 'TECNICO' && role !== 'MARKETING' && role !== 'OPERACIONES_IA') {
            html += `<button onclick="ui.navigate('market')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">SUPERMARS-KET</button>`;
        }
        html += `<button onclick="ui.navigate('dossier')" class="nav-tab px-4 py-3 sm:px-6 sm:py-4 text-[9px] sm:text-[10px] font-bold uppercase hover:text-mars-cyan whitespace-nowrap">Dossier / Notas</button>`;
        nav.innerHTML = html;
    }
};

// --- 5. DEV BACKDOOR ---
const dev = {
    clickCount: 0, clickTimer: null,
    handleTrigger() {
        this.clickCount++;
        clearTimeout(this.clickTimer);
        if(this.clickCount >= 3) { this.open(); this.clickCount = 0; }
        else { this.clickTimer = setTimeout(() => this.clickCount = 0, 400); }
    },
    open() {
        let html = `<h4 class="text-mars-magenta glitch-text font-bold mb-4">DEV_BACKDOOR_ACCESS_GRANTED [v${APP_VERSION}]</h4>`;
        html += `<div class="bg-black border border-mars-magenta p-4 text-[10px] space-y-4 mb-4 font-mono">`;
        html += `<div><p class="text-mars-cyan font-bold mb-2 border-b border-mars-cyan/30">PINs DOCENTES EN CLARO</p>`;
        for(let k in state.data.config.teachers) { html += `<p>${state.data.config.teachers[k].name}: <span class="text-white">${state.data.config.teachers[k].pin}</span></p>`; }
        html += `</div><div><p class="text-mars-yellow font-bold mb-2 border-b border-mars-yellow/30">PINs STARTUPS EN CLARO</p>`;
        for(let c in state.data.companies) {
            html += `<p class="mt-2 text-mars-green font-bold">${state.data.companies[c].name}</p>`;
            for(let r in state.data.companies[c].roles) { html += `<span class="mr-3">${r}: <span class="text-white">${state.data.companies[c].roles[r]}</span></span>`; }
        }
        html += `</div></div>`;
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