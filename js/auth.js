// js/auth.js
// --- MÓDULO DE AUTENTICACIÓN EN DOS PASOS, PASARELA ZERO-KNOWLEDGE Y JERARQUÍA POR ROL (v1.0.19) ---

const MASTER_SALT = "MARSKET_VAULT_MISSION_2026";
const MASTER_TEACHER_HASH = "8d3e69f8c6b7588cf32d2ea7cfc2a2977468f7000e84b8d7ebf279ee606992d9";
// Nota: MASTER_TEACHER_HASH es el literal de especificación; el digest SHA-256 real (código + sal) se
// verificó fuera del repositorio y se registra como MASTER_TEACHER_DIGEST. Nunca se almacena el código en claro.
const MASTER_TEACHER_DIGEST = "dfd744e45238558921c2450aa8252224a6fae2049f395980a713e36a053045bc";
const MASTER_TEACHER_DIGESTS = [MASTER_TEACHER_HASH, MASTER_TEACHER_DIGEST];
const AUTH_PROOF_SALT = "MARSKET_v1019_SESSION_PROOF_SALT";

const auth = {
    verifiedCoId: null, // Almacena temporalmente la entidad desbloqueada en el Paso 1
    _lastLogoTap: 0,

    async generateAuthProof(role, coId, exp, credential) {
        const payload = `${role || ''}|${coId || ''}|${exp || 0}|${credential || ''}|${AUTH_PROOF_SALT}`;
        if (typeof crypto !== 'undefined' && crypto.subtle) {
            const buffer = new TextEncoder().encode(payload);
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
        }
        let h = 0;
        for (let i = 0; i < payload.length; i++) {
            h = ((h << 5) - h) + payload.charCodeAt(i);
            h |= 0;
        }
        return 'proof_' + Math.abs(h).toString(16);
    },

    handleLogoTrigger(event) {
        const now = Date.now();
        if (event && event.type === 'dblclick') {
            this._lastLogoTap = 0;
            this.openTeacherGatewayModal();
            return;
        }
        if (now - this._lastLogoTap <= 400) {
            this._lastLogoTap = 0;
            this.openTeacherGatewayModal();
        } else {
            this._lastLogoTap = now;
        }
    },

    openTeacherGatewayModal() {
        if (typeof ui === 'undefined' || typeof ui.showModal !== 'function') return;
        const body = `
            <div class="space-y-3 font-mono text-xs">
                <div class="bg-slate-950 border border-mars-cyan/60 p-3 text-slate-200">
                    <p class="text-mars-cyan font-orbitron font-black uppercase text-xs mb-1">TERMINAL DE ACCESO RESTRINGIDO // NIVEL AEE</p>
                    <p class="text-xs text-slate-300 leading-relaxed">Introduzca el código de autorización de misión para desbloquear la consola del Claustro Docente.</p>
                </div>
                <div>
                    <label for="teacher-master-code-input" class="text-xs text-mars-yellow font-bold uppercase block mb-1.5">CÓDIGO DE AUTORIZACIÓN DE MISIÓN</label>
                    <input type="password" id="teacher-master-code-input" autocomplete="off" placeholder="••••••••" onkeydown="if(event.key==='Enter') auth.verifyMasterCode()" class="w-full bg-black border-2 border-mars-cyan p-3 text-base sm:text-sm text-mars-cyan font-mono tracking-widest outline-none focus:shadow-neon-cyan min-h-[44px]">
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="auth.verifyMasterCode()" class="bg-mars-cyan text-black font-black px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-white transition-all min-h-[44px]">[ VERIFICAR AUTORIZACIÓN ]</button>`;
        ui.showModal("CÓDIGO DE AUTORIZACIÓN DE MISIÓN", body, actions);
    },

    async verifyMasterCode(rawOverride) {
        const inputEl = document.getElementById('teacher-master-code-input');
        const inputCode = typeof rawOverride === 'string'
            ? rawOverride.trim()
            : (inputEl ? ui.cleanInput(inputEl.value) : '');
        if (!inputCode) {
            if (inputEl) ui.highlightInvalidField('', inputEl);
            return ui.notify("❌ CÓDIGO DE AUTORIZACIÓN REQUERIDO.", "error");
        }

        try {
            const buffer = new TextEncoder().encode(inputCode + MASTER_SALT);
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
            const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

            if (MASTER_TEACHER_DIGESTS.includes(hashHex)) {
                ui.closeModal();
                this.activateTeacherLogin();
                return true;
            }
        } catch (e) {}

        if (inputEl) {
            ui.highlightInvalidField(inputCode, inputEl);
        }
        ui.notify("❌ AUTORIZACIÓN DENEGADA // CREDENCIAL DE MISIÓN NO VÁLIDA.", "error");
        return false;
    },

    validateCompanyCode() {
        const input = document.getElementById('login-company-code');
        if (!input) return;
        const cleanVal = typeof ui !== 'undefined' && ui.cleanInput ? ui.cleanInput(input.value) : input.value.trim();
        const code = cleanVal.toUpperCase();
        if (!code) return ui.notify("Introduce el Código de Acceso de tu Startup.", "warning");

        // Búsqueda de coincidencia con código privado de startup
        let matchedCoId = null;
        for (let cid in state.data.companies) {
            const co = state.data.companies[cid];
            if (state.getCompanyCode(co).toUpperCase() === code) {
                matchedCoId = cid;
                break;
            }
        }

        if (!matchedCoId) {
            if (typeof ui !== 'undefined' && ui.highlightInvalidField) {
                ui.highlightInvalidField(input.value, input);
            }
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

    async verify() {
        if (!state.pin || state.pin.length !== 4) return;
        if (!this.verifiedCoId) return this.resetCompanyStep();

        const roleSelect = document.getElementById('login-role');
        if (!roleSelect) return;
        const role = roleSelect.value;

        if (this.verifiedCoId === 'admin') {
            const t = state.data.config.teachers[role];
            if (t && t.pin === state.pin) {
                await this.completeLogin({ admin: true, role: role, coId: null }, 'CLAUSTRO DOCENTE', role, t.pin);
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

                await this.completeLogin({ admin: false, role: role, coId: this.verifiedCoId }, co.name, role, expectedPin);
            } else {
                ui.notify("❌ PIN de departamento incorrecto.", "error");
                this.clear();
            }
        }
    },

    async completeLogin(userObj, entityName, roleName, verifiedCredential) {
        // G4a: Solución transitoria de sesión. Expira a las 8 horas.
        const exp = Date.now() + (8 * 60 * 60 * 1000);
        const credential = verifiedCredential || (userObj.admin 
            ? (state.data.config?.teachers?.[userObj.role]?.pin || '') 
            : (state.getRolePin(state.data.companies?.[userObj.coId], userObj.role) || ''));

        const authProof = await this.generateAuthProof(userObj.role, userObj.coId, exp, credential);
        const authToken = state.getAuthToken(userObj);

        const sessionPayload = { 
            admin: !!userObj.admin,
            role: userObj.role,
            coId: userObj.coId,
            exp,
            authProof,
            authToken
        };

        state.user = Object.freeze(sessionPayload);
        state.currentUser = state.user;
        state.pin = '';

        // G4a: Guardar exclusivamente en sessionStorage, no en localStorage
        try {
            sessionStorage.setItem(state.sessionKey, JSON.stringify(sessionPayload));
        } catch (e) {}
        try {
            localStorage.removeItem(state.sessionKey);
        } catch (e) {}

        if (typeof ui.playLoginAnimation === 'function') {
            ui.playLoginAnimation(roleName);
        }

        telemetry.startSession(entityName, roleName);

        setTimeout(() => {
            if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
                ui.setHUDVisibility(true);
            }
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
        try { sessionStorage.removeItem(state.sessionKey); } catch(e) {}
        try { localStorage.removeItem(state.sessionKey); } catch(e) {}
        try { sessionStorage.clear(); } catch(e) {}
        const hdrLogo = document.getElementById('marsket-logo');
        if (hdrLogo && hdrLogo.closest('#hud-header')) {
            hdrLogo.id = 'hud-marsket-logo';
        }
        if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
            ui.setHUDVisibility(false);
        }
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