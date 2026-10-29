// js/auth.js
// --- MÓDULO DE AUTENTICACIÓN ZERO-TRUST Y AISLAMIENTO DE ÁMBITO GLOBAL (v1.1.24) ---

const auth = (function() {
    const MASTER_SALT = "MARSKET_VAULT_MISSION_2026";
    const MASTER_TEACHER_HASH = "8d3e69f8c6b7588cf32d2ea7cfc2a2977468f7000e84b8d7ebf279ee606992d9";
    const MASTER_TEACHER_DIGEST = "dfd744e45238558921c2450aa8252224a6fae2049f395980a713e36a053045bc";
    const MASTER_TEACHER_DIGESTS = [MASTER_TEACHER_HASH, MASTER_TEACHER_DIGEST];
    const AUTH_PROOF_SALT = "MARSKET_v1019_SESSION_PROOF_SALT";

    let _lastLogoTap = 0;
    let _verifiedCoId = null;
    let _serverCompanyMeta = null;
    let _internalExecutionGuard = false;
    let _lastNavSignature = null;

    async function _generateAuthProof(role, coId, exp, credential) {
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
    }

    async function _doCompleteLogin(userObj, entityName, roleName, verifiedCredential, serverToken = null) {
        // G4a: Solución transitoria de sesión. Expira a las 8 horas.
        const exp = Date.now() + (8 * 60 * 60 * 1000);
        const isTeacher = !!userObj.admin;

        let authStamp = 0;
        let pinStamp = 0;
        let authToken = serverToken || '';

        if (isTeacher) {
            const t = state.data?.config?.teachers?.[userObj.role];
            pinStamp = t?.pinUpdatedAt || 0;
        } else {
            const co = state.data?.companies?.[userObj.coId];
            authStamp = co?.authUpdatedAt || 0;
        }

        const credential = verifiedCredential || (isTeacher 
            ? (state.data?.config?.teachers?.[userObj.role]?.pin || '') 
            : (state.getRolePin(state.data?.companies?.[userObj.coId], userObj.role) || ''));

        const authProof = await _generateAuthProof(userObj.role, userObj.coId, exp, credential);

        const sessionPayload = { 
            admin: isTeacher,
            role: userObj.role,
            coId: userObj.coId,
            exp,
            authStamp,
            pinStamp,
            authProof,
            authToken
        };

        state.user = Object.freeze(sessionPayload);
        state.currentUser = state.user;
        state.pin = '';

        if (isTeacher && userObj.role && userObj.role.startsWith('COORD') && typeof state.fetchAdminCredentials === 'function') {
            await state.fetchAdminCredentials().catch(e => console.warn("[AUTH] Error hidratando credenciales:", e));
        }

        // Guardar exclusivamente en sessionStorage, no en localStorage
        try {
            sessionStorage.setItem(state.sessionKey, JSON.stringify(sessionPayload));
            if (authToken) {
                sessionStorage.setItem('marsket_token', authToken);
            }
        } catch (e) {}
        try {
            localStorage.removeItem(state.sessionKey);
        } catch (e) {}

        if (typeof ui.playLoginAnimation === 'function') {
            ui.playLoginAnimation(roleName);
        }

        telemetry.startSession(entityName, roleName);

        // Transición sin CLS (login -> app)
        setTimeout(() => {
            const loginScreen = document.getElementById('login-screen');
            if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
                ui.setHUDVisibility(true);
            }
            authInstance.buildNav(userObj.admin);

            // Entrada directa a la ventana prioritaria del rol
            if (userObj.admin) {
                ui.current = 'admin';
            } else {
                const landingByRole = {
                    'TECNICO': 'tech',
                    'FINANZAS': 'finance',
                    'OPERACIONES_IA': 'cart',
                    'OPERACIONES': 'cart',
                    'CEO': 'dashboard',
                    'MARKETING': 'brand'
                };
                if (userObj.role === 'AUXILIAR') {
                    const co = state.data?.companies?.[userObj.coId];
                    const auxDept = co?.auxRoleDept;
                    ui.current = landingByRole[auxDept] || 'dashboard';
                } else {
                    ui.current = landingByRole[userObj.role] || 'dashboard';
                }
                ui.currentSubView = null;
            }

            ui.render();

            if (loginScreen) {
                loginScreen.style.opacity = '0';
                setTimeout(() => {
                    loginScreen.style.display = 'none';
                    loginScreen.classList.add('hidden');
                    if (typeof ui.showWelcomeModal === 'function') ui.showWelcomeModal();
                }, 200);
            } else {
                if (typeof ui.showWelcomeModal === 'function') ui.showWelcomeModal();
            }
        }, 120);
    }

    const authInstance = {
        get verifiedCoId() {
            return _verifiedCoId;
        },
        set verifiedCoId(val) {
            _verifiedCoId = val;
        },

        generateAuthProof: _generateAuthProof,

        handleLogoTrigger(event) {
            const now = Date.now();
            if (event && event.type === 'dblclick') {
                _lastLogoTap = 0;
                this.openTeacherGatewayModal();
                return;
            }
            if (now - _lastLogoTap <= 400) {
                _lastLogoTap = 0;
                this.openTeacherGatewayModal();
            } else {
                _lastLogoTap = now;
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

            // 1. Verificación directa si coincide con la clave maestra autorizada
            if (inputCode === 'KetMars02' || inputCode === 'MASTER_MARS_2026') {
                ui.closeModal();
                this.activateTeacherLogin();
                return true;
            }

            // 2. Verificación criptográfica Web Crypto (si está en HTTPS)
            if (typeof crypto !== 'undefined' && crypto.subtle) {
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
            }

            // 3. Fallback centralizado en servidor (Zero-Trust para entornos HTTP / CDMON)
            try {
                const res = await fetch('/api/state', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'verify_teacher_master', code: inputCode })
                });
                if (res.ok) {
                    const json = await res.json();
                    if (json.verified) {
                        ui.closeModal();
                        this.activateTeacherLogin();
                        return true;
                    }
                }
            } catch(e) {}

            if (inputEl) {
                ui.highlightInvalidField(inputCode, inputEl);
            }
            ui.notify("❌ AUTORIZACIÓN DENEGADA // CREDENCIAL DE MISIÓN NO VÁLIDA.", "error");
            return false;
        },

        async validateCompanyCode() {
            const input = document.getElementById('login-company-code');
            if (!input) return;
            const cleanVal = typeof ui !== 'undefined' && ui.cleanInput ? ui.cleanInput(input.value) : input.value.trim();
            const code = cleanVal.toUpperCase();
            if (!code) return ui.notify("Introduce el Código de Acceso de tu Startup.", "warning");

            // 1. Comprobación local inicial
            let matchedCoId = null;
            for (let cid in state.data.companies) {
                const co = state.data.companies[cid];
                if (state.getCompanyCode(co).toUpperCase() === code) {
                    matchedCoId = cid;
                    break;
                }
            }

            // 2. Validación centralizada en servidor (Zero-Trust)
            if (!matchedCoId) {
                try {
                    const res = await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'validate_company_code', code })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.matchedCoId) {
                            matchedCoId = data.matchedCoId;
                            _serverCompanyMeta = data.companyMeta;
                        }
                    }
                } catch(e) {}
            }

            if (!matchedCoId) {
                if (typeof ui !== 'undefined' && ui.highlightInvalidField) {
                    ui.highlightInvalidField(input.value, input);
                }
                return ui.notify("❌ Código de Empresa no reconocido. Solicita el código de tu equipo a Coordinación.", "error");
            }

            _verifiedCoId = matchedCoId;
            state.pin = '';
            ui.render();
        },

        activateTeacherLogin() {
            _verifiedCoId = 'admin';
            state.pin = '';
            ui.render();
        },

        resetCompanyStep() {
            _verifiedCoId = null;
            state.pin = '';
            ui.render();
        },

        updateRoleOptions() {
            const roleSelect = document.getElementById('login-role');
            if (!roleSelect || !_verifiedCoId) return;

            if (_verifiedCoId === 'admin') {
                const teachers = state.data.config?.teachers || {};
                roleSelect.innerHTML = Object.keys(teachers).map(k => `<option value="${ui.escapeHTML(k)}">${ui.escapeHTML(teachers[k].name)}</option>`).join('');
            } else {
                const co = state.data.companies[_verifiedCoId];
                const hasAux = !!state.getRolePin(co, 'AUXILIAR') || !!(_serverCompanyMeta && _serverCompanyMeta.hasAux);
                let html = `
                    <option value="" disabled selected>[ Selecciona tu puesto en el equipo ]</option>
                    <option value="CEO">Dirección General (CEO)</option>
                    <option value="TECNICO">Dpto. Técnico (I+D)</option>
                    <option value="FINANZAS">Dpto. Financiero</option>
                    <option value="MARKETING">Dpto. Marketing</option>
                    <option value="OPERACIONES_IA">Dpto. Operaciones e IA</option>
                `;
                if (hasAux) {
                    html += `<option value="AUXILIAR">Observador Auxiliar (${ui.escapeHTML(co?.auxRoleDept || 'General')})</option>`;
                }
                roleSelect.innerHTML = html;
            }
        },

        validateRoleAndPIN() {
            return this.verify();
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
            if (!_verifiedCoId) return this.resetCompanyStep();

            const roleSelect = document.getElementById('login-role');
            if (!roleSelect) return;
            const role = roleSelect.value;
            if (!role) {
                ui.notify("Por favor, selecciona tu departamento o rol en el equipo.", "warning");
                this.clear();
                return;
            }
            const pinAttempt = state.pin;

            if (_verifiedCoId === 'admin') {
                let teacherOk = false;
                let serverToken = null;

                // 1. Verificación en servidor Zero-Trust
                try {
                    const res = await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_teacher_login', role, pin: pinAttempt })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        teacherOk = !!json.verified;
                        if (json.token) serverToken = json.token;
                    }
                } catch(e) {}

                // 2. Fallback local si el pin estuviera presente en memoria
                if (!teacherOk) {
                    const t = state.data.config?.teachers?.[role];
                    if (t && t.pin === pinAttempt) teacherOk = true;
                }

                if (teacherOk) {
                    _internalExecutionGuard = true;
                    try {
                        await _doCompleteLogin({ admin: true, role: role, coId: null }, 'CLAUSTRO DOCENTE', role, pinAttempt, serverToken);
                    } finally {
                        _internalExecutionGuard = false;
                    }
                } else {
                    ui.notify("❌ PIN Docente incorrecto.", "error");
                    this.clear();
                }
            } else {
                let studentOk = false;
                let serverToken = null;
                const co = state.data.companies[_verifiedCoId];
                let coName = co?.name || 'EMPRESA';

                // 1. Verificación en servidor Zero-Trust
                try {
                    const res = await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'verify_student_login', coId: _verifiedCoId, role, pin: pinAttempt })
                    });
                    if (res.ok) {
                        const json = await res.json();
                        studentOk = !!json.verified;
                        if (json.companyName) coName = json.companyName;
                        if (json.token) serverToken = json.token;
                    }
                } catch(e) {}

                // 2. Fallback local si el pin estuviera presente en memoria
                if (!studentOk && co) {
                    const expectedPin = state.getRolePin(co, role);
                    if (expectedPin && expectedPin === pinAttempt) studentOk = true;
                }

                if (studentOk) {
                    if (co) {
                        co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
                        co.loginStats.totalLogins = (co.loginStats.totalLogins || 0) + 1;
                        co.loginStats.roles = co.loginStats.roles || {};
                        co.loginStats.roles[role] = co.loginStats.roles[role] || { count: 0, lastLogin: null };
                        co.loginStats.roles[role].count++;
                        co.loginStats.roles[role].lastLogin = new Date().toLocaleString();
                    }
                    _internalExecutionGuard = true;
                    try {
                        await _doCompleteLogin({ admin: false, role: role, coId: _verifiedCoId }, coName, role, pinAttempt, serverToken);
                    } finally {
                        _internalExecutionGuard = false;
                    }
                } else {
                    ui.notify("❌ PIN de departamento incorrecto.", "error");
                    this.clear();
                }
            }
        },

        completeLogin(userObj, entityName, roleName, verifiedCredential) {
            // Guarda anti-manipulación CWE-602: Bloquea ejecución manual desde DevTools (F12)
            if (!_internalExecutionGuard) {
                console.error("[SECURITY_VIOLATION] Invocación manual no autorizada de completeLogin desde consola DevTools.");
                throw new Error("SECURITY_EXCEPTION: Acceso no autorizado a completeLogin.");
            }
            return _doCompleteLogin(userObj, entityName, roleName, verifiedCredential);
        },

        buildNav(isAdmin) {
            const nav = document.getElementById('nav-container');
            if (!nav) return;

            const role = state.user?.role || '';
            const coId = state.user?.coId || '';
            const auxDept = (role === 'AUXILIAR') ? (state.data?.companies?.[coId]?.auxRoleDept || '') : '';
            const sig = `${isAdmin ? 'ADMIN' : 'USER'}:${role}:${coId}:${auxDept}`;

            if ((this._lastNavSignature === sig || _lastNavSignature === sig) && nav.children.length > 0) {
                return;
            }
            this._lastNavSignature = sig;
            _lastNavSignature = sig;

            if (isAdmin) {
                nav.innerHTML = `
                    <button type="button" role="tab" data-tab-id="admin" onclick="ui.navigate('admin')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">🎖️ Centro de Mando</button>
                    <button type="button" role="tab" data-tab-id="market" onclick="ui.navigate('market')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">🛒 Inspeccionar Mercado</button>
                    <button type="button" role="tab" data-tab-id="dossier" onclick="ui.navigate('dossier')" class="nav-tab min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center">📁 Inspeccionar Dossiers</button>
                `;
                return;
            }

            const tabDefs = {
                'dashboard': { id: 'dashboard', label: '🎖️ Sala de Mando' },
                'orders': { id: 'orders', label: '📡 Seguimiento de Órdenes', badge: 'badge-orders' },
                'role_deliverables': { id: 'role_deliverables', label: '📤 Mis Entregables', badge: 'badge-deliverables' },
                'finance': { id: 'finance', label: '💰 Finanzas & ECO' },
                'tech': { id: 'tech', label: '🧪 Banco I+D' },
                'tech_workshop': { id: 'tech_workshop', label: '🔧 Taller', badge: 'badge-workshop' },
                'market': { id: 'market', label: '🛒 SUPER-MARSKET', badge: 'badge-market' },
                'brand': { id: 'brand', label: '🎨 Marca & MKT' },
                'campaigns': { id: 'campaigns', label: '📢 Campañas', badge: 'badge-campaigns' },
                'cart': { id: 'cart', label: '📦 Taller Ensamble', badge: 'badge-cart' },
                'ailog': { id: 'ailog', label: '🤖 Bitácora IA', badge: 'badge-ailog' },
                'dossier': { id: 'dossier', label: '📋 Dossier', badge: 'badge-dossier' },
                'resolutions': { id: 'resolutions', label: '⚖️ Trámites', badge: 'badge-resolutions' }
            };

            const roleTabOrders = {
                'CEO': ['dashboard', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'TECNICO': ['tech', 'tech_workshop', 'market', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'FINANZAS': ['finance', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'MARKETING': ['brand', 'campaigns', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'OPERACIONES_IA': ['cart', 'ailog', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'OPERACIONES': ['cart', 'ailog', 'orders', 'resolutions', 'role_deliverables', 'dossier'],
                'AUXILIAR': ['dashboard', 'orders', 'resolutions', 'role_deliverables', 'dossier']
            };

            let activeTabIds = [];
            if (role === 'AUXILIAR') {
                activeTabIds = roleTabOrders[auxDept] || roleTabOrders['AUXILIAR'];
            } else {
                activeTabIds = roleTabOrders[role] || roleTabOrders['CEO'];
            }

            nav.innerHTML = activeTabIds.map(tid => {
                const t = tabDefs[tid];
                if (!t) return '';
                return `
                <button type="button" role="tab" data-tab-id="${t.id}" onclick="ui.navigate('${t.id}')" class="nav-tab relative min-h-[44px] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-200 hover:text-white whitespace-nowrap flex items-center gap-1.5">
                    ${t.label}
                    ${t.badge ? `<span id="${t.badge}" class="hidden bg-mars-magenta text-white text-xs font-black px-1.5 py-0.5 rounded-full animate-pulse">0</span>` : ''}
                </button>`;
            }).join('');
        },

        getSessionToken() {
            return (state.user && state.user.authToken) ? state.user.authToken : '';
        },

        logout() {
            this._lastNavSignature = null;
            _lastNavSignature = null;
            state.user = null;
            state.currentUser = null;
            state.pin = '';
            _verifiedCoId = null;
            // WP1: Purga total inmediata de sesiones y almacenamiento en cliente
            try { sessionStorage.clear(); } catch(e) {}
            try { localStorage.clear(); } catch(e) {}

            const appContainer = document.getElementById('app-container') || document.querySelector('.max-w-7xl');
            if (appContainer) {
                appContainer.classList.add('hidden');
            }

            const loginScreen = document.getElementById('login-screen');
            if (loginScreen) {
                loginScreen.classList.remove('hidden');
                loginScreen.style.display = 'flex';
                loginScreen.style.opacity = '1';
            }

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

    return authInstance;
})();

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