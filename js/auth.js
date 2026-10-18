// js/auth.js
// --- MÓDULO DE AUTENTICACIÓN EN DOS PASOS, RUTAS Y JERARQUÍA POR ROL (v1.0.17) ---

const auth = {
    verifiedCoId: null, // Almacena temporalmente la entidad desbloqueada en el Paso 1

    validateCompanyCode() {
        const input = document.getElementById('login-company-code');
        if (!input) return;
        const cleanVal = typeof ui !== 'undefined' && ui.cleanInput ? ui.cleanInput(input.value) : input.value.trim();
        const code = cleanVal.toUpperCase();
        if (!code) return ui.notify("Introduce el Código de Acceso de tu Startup.", "warning");

        // 1. Acceso del Claustro Docente
        if (code === 'CLAUSTRO' || code === 'DOCENTE' || code === 'ADMIN') {
            this.verifiedCoId = 'admin';
            ui.render();
            return;
        }

        // 2. Búsqueda de coincidencia con código privado de startup
        let matchedCoId = null;
        for (let cid in state.data.companies) {
            const co = state.data.companies[cid];
            if (state.getCompanyCode(co).toUpperCase() === code) {
                matchedCoId = cid;
                break;
            }
        }

        if (!matchedCoId) {
            input.value = '';
            return ui.notify("❌ Código de Empresa no reconocido. Solicita el código de tu equipo a Coordinación.", "error");
        }

        this.verifiedCoId = matchedCoId;
        state.pin = '';
        ui.render();
    },

    activateTeacherLogin() {
        this.verifiedCoId = 'admin';
        state.pin = '';
        ui.render();
    },

    resetCompanyStep() {
        this.verifiedCoId = null;
        state.pin = '';
        ui.render();
    },

    updateRoleOptions() {
        const roleSelect = document.getElementById('login-role');
        if (!roleSelect || !this.verifiedCoId) return;

        if (this.verifiedCoId === 'admin') {
            const teachers = state.data.config.teachers || {};
            roleSelect.innerHTML = Object.keys(teachers).map(k => `<option value="${ui.escapeHTML(k)}">${ui.escapeHTML(teachers[k].name)}</option>`).join('');
        } else {
            const co = state.data.companies[this.verifiedCoId];
            if (!co) return;
            const hasAux = !!state.getRolePin(co, 'AUXILIAR');
            let html = `
                <option value="CEO">Dirección General (CEO)</option>
                <option value="TECNICO">Dpto. Técnico (I+D)</option>
                <option value="FINANZAS">Dpto. Financiero</option>
                <option value="MARKETING">Dpto. Marketing</option>
                <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
            `;
            if (hasAux) {
                html += `<option value="AUXILIAR">Observador Auxiliar (${ui.escapeHTML(co.auxRoleDept || 'General')})</option>`;
            }
            roleSelect.innerHTML = html;
        }
    },

    press(n) {
        if (state.pin.length < 4) {
            state.pin += n;
            this.updateDots();
            if (state.pin.length === 4) {
                setTimeout(() => this.verify(), 120);
            }
        }
    },

    clear() {
        state.pin = '';
        this.updateDots();
    },

    updateDots() {
        const dots = document.querySelectorAll('.pin-dot');
        dots.forEach((d, i) => {
            if (i < state.pin.length) d.classList.add('bg-mars-cyan', 'shadow-[0_0_8px_#00f0ff]');
            else d.classList.remove('bg-mars-cyan', 'shadow-[0_0_8px_#00f0ff]');
        });
    },

    verify() {
        if (!state.pin || state.pin.length !== 4) return;
        if (!this.verifiedCoId) return this.resetCompanyStep();

        const roleSelect = document.getElementById('login-role');
        if (!roleSelect) return;
        const role = roleSelect.value;

        if (this.verifiedCoId === 'admin') {
            const t = state.data.config.teachers[role];
            if (t && t.pin === state.pin) {
                this.completeLogin({ admin: true, role: role, coId: null }, 'CLAUSTRO DOCENTE', role);
            } else {
                ui.notify("❌ PIN Docente incorrecto.", "error");
                this.clear();
            }
        } else {
            const co = state.data.companies[this.verifiedCoId];
            if (!co) return this.resetCompanyStep();

            const expectedPin = state.getRolePin(co, role);
            if (expectedPin && expectedPin === state.pin) {
                co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
                co.loginStats.totalLogins = (co.loginStats.totalLogins || 0) + 1;
                co.loginStats.roles = co.loginStats.roles || {};
                co.loginStats.roles[role] = co.loginStats.roles[role] || { count: 0, lastLogin: null };
                co.loginStats.roles[role].count++;
                co.loginStats.roles[role].lastLogin = new Date().toLocaleString();

                this.completeLogin({ admin: false, role: role, coId: this.verifiedCoId }, co.name, role);
            } else {
                ui.notify("❌ PIN de departamento incorrecto.", "error");
                this.clear();
            }
        }
    },

    completeLogin(userObj, entityName, roleName) {
        const sessionPayload = { ...userObj, authToken: state.getAuthToken(userObj) };
        state.user = Object.freeze(sessionPayload);
        state.currentUser = state.user;
        state.pin = '';
        localStorage.setItem(state.sessionKey, JSON.stringify(sessionPayload));

        if (typeof ui.playLoginAnimation === 'function') {
            ui.playLoginAnimation(roleName);
        }

        telemetry.startSession(entityName, roleName);

        setTimeout(() => {
            document.getElementById('hud-header')?.classList.remove('hidden');
            document.getElementById('hud-nav')?.classList.remove('hidden');
            this.buildNav(userObj.admin);

            // FASE 2: Entrada directa a la ventana prioritaria del rol
            if (userObj.admin) {
                ui.current = 'admin';
            } else {
                const co = state.data.companies[userObj.coId];
                const primaryRouteByRole = {
                    'CEO': 'orders',
                    'TECNICO': 'tech',
                    'FINANZAS': 'finance',
                    'MARKETING': 'brand',
                    'OPERACIONES_IA': 'cart'
                };
                if (userObj.role === 'AUXILIAR') {
                    const auxDept = co?.auxRoleDept;
                    const auxMap = {
                        'CEO': 'orders',
                        'TECNICO': 'tech',
                        'FINANZAS': 'finance',
                        'MARKETING': 'brand',
                        'OPERACIONES_IA': 'cart'
                    };
                    ui.current = auxMap[auxDept] || 'resolutions';
                } else {
                    ui.current = primaryRouteByRole[userObj.role] || 'orders';
                }
            }

            ui.render();
            if (typeof ui.showWelcomeModal === 'function') ui.showWelcomeModal();
        }, 450);
    },

    // FASE 2: Jerarquía Táctica de Pestañas según Rol Operativo
    buildNav(isAdmin) {
        const nav = document.getElementById('nav-container');
        if (!nav) return;

        if (isAdmin) {
            nav.innerHTML = `
                <button type="button" role="tab" onclick="ui.navigate('admin')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">🎖️ Centro de Mando</button>
                <button type="button" role="tab" onclick="ui.navigate('market')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">🛒 Inspeccionar Mercado</button>
                <button type="button" role="tab" onclick="ui.navigate('dossier')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">📁 Inspeccionar Dossiers</button>
            `;
            return;
        }

        const role = state.user ? state.user.role : '';
        const co = (state.user && !state.user.admin) ? state.data.companies[state.user.coId] : null;

        const tabDefs = {
            'orders': { id: 'orders', label: '🔐 Bóveda Órdenes', badge: 'badge-orders' },
            'resolutions': { id: 'resolutions', label: '⚖️ Gobernanza', badge: 'badge-resolutions' },
            'finance': { id: 'finance', label: '💰 Finanzas & ECO' },
            'dossier': { id: 'dossier', label: '📁 Dossier (19)' },
            'market': { id: 'market', label: '🛒 SUPERMARS-KET' },
            'tech': { id: 'tech', label: '🧪 I+D & Vuelos' },
            'cart': { id: 'cart', label: '📦 Logística Física', badge: 'badge-cart' },
            'brand': { id: 'brand', label: '🎨 Marca & LyE' },
            'ailog': { id: 'ailog', label: '🤖 Bitácora IA', badge: 'badge-ailog' }
        };

        const roleOrders = {
            'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
            'TECNICO': ['tech', 'market', 'cart', 'orders', 'dossier', 'resolutions'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market', 'resolutions'],
            'MARKETING': ['brand', 'dossier', 'market', 'resolutions'],
            'OPERACIONES_IA': ['cart', 'ailog', 'dossier', 'market', 'resolutions']
        };

        let activeTabIds = [];

        if (role === 'AUXILIAR') {
            const auxDept = co?.auxRoleDept;
            const auxMap = {
                'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
                'TECNICO': ['tech', 'market', 'cart', 'resolutions', 'dossier'],
                'FINANZAS': ['finance', 'orders', 'resolutions', 'dossier', 'market'],
                'MARKETING': ['brand', 'resolutions', 'dossier', 'market'],
                'OPERACIONES_IA': ['cart', 'ailog', 'resolutions', 'dossier', 'market']
            };
            activeTabIds = auxMap[auxDept] || ['resolutions', 'dossier', 'market'];
        } else {
            activeTabIds = roleOrders[role] || ['orders', 'market', 'dossier', 'resolutions'];
        }

        nav.innerHTML = activeTabIds.map(tid => {
            const t = tabDefs[tid];
            if (!t) return '';
            return `
            <button type="button" role="tab" onclick="ui.navigate('${t.id}')" class="nav-tab relative min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center gap-1.5">
                ${t.label}
                ${t.badge ? `<span id="${t.badge}" class="hidden bg-mars-magenta text-white text-xs font-black px-1.5 py-0.5 rounded-full animate-pulse">0</span>` : ''}
            </button>`;
        }).join('');
    },

    logout() {
        state.user = null;
        state.currentUser = null;
        state.pin = '';
        this.verifiedCoId = null;
        localStorage.removeItem(state.sessionKey);
        try { sessionStorage.clear(); } catch(e) {}
        document.getElementById('hud-header')?.classList.add('hidden');
        document.getElementById('hud-nav')?.classList.add('hidden');
        ui.current = 'login';
        ui.render();
    }
};

// Backdoor de Consola de Desarrollo
const dev = {
    clicks: 0, timer: null,
    handleTrigger() {
        this.clicks++;
        clearTimeout(this.timer);
        if (this.clicks >= 3) {
            this.clicks = 0;
            if (state.user && state.user.admin && state.user.role.startsWith('COORD')) {
                ui.adminTab = 'settings';
                ui.render();
            }
        } else {
            this.timer = setTimeout(() => { this.clicks = 0; }, 600);
        }
    }
};