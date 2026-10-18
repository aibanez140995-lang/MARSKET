// js/state.js
// --- GESTIÓN DE ESTADO, MIGRACIÓN (19 PLAZOS LWW), CIFRADO Y PERSISTENCIA AISLADA (v1.0.17) ---

const state = {
    data: {}, user: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    sessionKey: 'marsket_session_v1',
    isCloudOnline: false, isSyncing: false, syncTimer: null,
    _vaultKey: 'MARS_AEE_2026_SECRET_KEY',

    encodeSecret(str) {
        if (!str) return '';
        const s = String(str);
        let res = '';
        for (let i = 0; i < s.length; i++) {
            res += String.fromCharCode(s.charCodeAt(i) ^ this._vaultKey.charCodeAt(i % this._vaultKey.length));
        }
        return 'VLT_' + btoa(res);
    },

    decodeSecret(enc) {
        if (!enc) return '';
        const s = String(enc);
        if (!s.startsWith('VLT_')) return s; 
        try {
            const raw = atob(s.slice(4));
            let res = '';
            for (let i = 0; i < raw.length; i++) {
                res += String.fromCharCode(raw.charCodeAt(i) ^ this._vaultKey.charCodeAt(i % this._vaultKey.length));
            }
            return res;
        } catch (e) {
            return '';
        }
    },

    generateCompanyCode(name) {
        const prefix = (name || 'MRS').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
        const num = Math.floor(1000 + Math.random() * 9000);
        return `${prefix}-${num}`;
    },

    getCompanyCode(co) {
        if (!co) return '';
        if (co.authVault && co.authVault.code) return this.decodeSecret(co.authVault.code);
        return co.accessCode || '';
    },

    setCompanyCode(co, newCode) {
        if (!co) return;
        const clean = String(newCode).trim().toUpperCase();
        co.authVault = co.authVault || { code: '', roles: {} };
        co.authVault.code = this.encodeSecret(clean);
        delete co.accessCode; 
    },

    getRolePin(co, role) {
        if (!co) return '';
        if (co.authVault && co.authVault.roles && co.authVault.roles[role]) {
            return this.decodeSecret(co.authVault.roles[role]);
        }
        if (co.roles && co.roles[role] && !String(co.roles[role]).startsWith('VLT_')) {
            return co.roles[role];
        }
        return '';
    },

    setRolePin(co, role, newPin) {
        if (!co) return;
        co.authVault = co.authVault || { code: '', roles: {} };
        co.authVault.roles = co.authVault.roles || {};
        co.roles = co.roles || {};
        if (!newPin) {
            delete co.authVault.roles[role];
            delete co.roles[role];
        } else {
            co.authVault.roles[role] = this.encodeSecret(String(newPin).trim());
            co.roles[role] = 'PROTECTED'; 
        }
    },

    migrate(d) {
        d = d || {};
        d.version = Number(d.version) || 1; 
        d.lastUpdated = d.lastUpdated || Date.now();
        d.config = d.config || JSON.parse(JSON.stringify(INITIAL_DATA.config));
        d.catalog = d.catalog && d.catalog.length > 0 ? d.catalog : JSON.parse(JSON.stringify(INITIAL_DATA.catalog));
        d.companies = d.companies || JSON.parse(JSON.stringify(INITIAL_DATA.companies));
        d.telemetry = d.telemetry || { totalLogins: 0, sessions: [] };
        d.telemetry.sessions = Array.isArray(d.telemetry.sessions) ? d.telemetry.sessions : [];

        d.suggestionsToAlex = Array.isArray(d.suggestionsToAlex) ? d.suggestionsToAlex : [];
        d.pendingCustom = Array.isArray(d.pendingCustom) ? d.pendingCustom : [];
        d.b2bMarket = Array.isArray(d.b2bMarket) ? d.b2bMarket : [];
        d.b2bContracts = Array.isArray(d.b2bContracts) ? d.b2bContracts : [];
        d.securityIncidents = Array.isArray(d.securityIncidents) ? d.securityIncidents : [];
        
        d.config.deadlines = d.config.deadlines || {};
        if (typeof DELIVERABLES_DEF !== 'undefined') {
            DELIVERABLES_DEF.forEach(def => {
                if (!d.config.deadlines[def.key]) {
                    if (def.key === 'technicalReport' && d.config.deadlines.techReport) {
                        d.config.deadlines[def.key] = d.config.deadlines.techReport;
                    } else if (typeof DEFAULT_DEADLINES !== 'undefined' && DEFAULT_DEADLINES[def.key]) {
                        d.config.deadlines[def.key] = DEFAULT_DEADLINES[def.key];
                    } else {
                        d.config.deadlines[def.key] = def.defaultDate;
                    }
                }
            });
        }

        d.config.guidelines = d.config.guidelines || { techReportDocUrl: "", techReportNotes: "" };
        d.config.teachers = d.config.teachers || JSON.parse(JSON.stringify(INITIAL_DATA.config.teachers));
        
        if(d.config.teachers.COORD) {
            delete d.config.teachers.COORD;
            d.config.teachers.COORD_MARIO = { name: "Coordinación - Mario", pin: "0001", canSponsor: true };
            d.config.teachers.COORD_ALEX = { name: "Coordinación - Alex", pin: "0002", canSponsor: true };
        }

        const countries = ['China', 'Alemania', 'España', 'Turquía', 'Marruecos', 'ESA / Francia', 'Polonia', 'Italia', 'Portugal', 'India', 'República Checa', 'Japón'];
        d.catalog.forEach(item => {
            if (!item.origin) item.origin = countries[Math.floor(Math.random() * countries.length)];
        });

        const defDocs = {
            preliminaryReport: null, technicalReport: null,
            brandIdentity_dec: null, brandIdentity_apr: null, businessModelDoc: null, businessModelCanvas: null, decisionDiary_dec: null, decisionDiary_apr: null,
            investorDossier: null,
            goniometerEvidence: null, mathReportDist: null, mathReportTwoPoints: null, mathReportFinal: null,
            budgetInitial: null, incomeStatement: null, budgetPostProto: null, balanceSheet: null,
            oralPresentation: null, writtenEssays: null
        };

        const defaultCodes = { astra: 'AST-1010', orion: 'ORI-2020', stellar: 'STL-3030' };

        for(let k in d.companies) {
            let co = d.companies[k];
            if (!co) continue;
            
            co.name = co.name || k.toUpperCase();
            co.balance = !isNaN(Number(co.balance)) ? Number(co.balance) : 2400;
            co.updatedAt = co.updatedAt || Date.now();
            co.roles = co.roles || { CEO:'1234', TECNICO:'1234', FINANZAS:'1234', MARKETING:'1234', OPERACIONES_IA:'1234' };
            
            if(co.roles.QUIMICA || co.roles.AERODINAMICA || co.roles.IA) {
                const defaultPin = co.roles.CEO || '1234';
                co.roles = {
                    CEO: co.roles.CEO || defaultPin,
                    TECNICO: co.roles.QUIMICA || defaultPin,
                    FINANZAS: co.roles.FINANZAS || defaultPin,
                    MARKETING: co.roles.MARKETING || defaultPin,
                    OPERACIONES_IA: co.roles.IA || defaultPin
                };
            }

            co.authVault = co.authVault || { code: '', roles: {} };
            co.authVault.roles = co.authVault.roles || {};

            let currentPlainCode = this.getCompanyCode(co);
            if (!currentPlainCode) {
                currentPlainCode = defaultCodes[k] || this.generateCompanyCode(co.name);
            }
            this.setCompanyCode(co, currentPlainCode);

            const baseRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            baseRoles.forEach(r => {
                const existingPin = this.getRolePin(co, r);
                if (existingPin && existingPin !== 'PROTECTED') {
                    this.setRolePin(co, r, existingPin);
                } else if (!existingPin && r !== 'AUXILIAR') {
                    this.setRolePin(co, r, '1234');
                }
            });

            co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
            co.loginStats.roles = co.loginStats.roles || {};
            co.classGroup = co.classGroup || 'A';
            co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
            co.auxRoleRequest = co.auxRoleRequest || { status: co.roles['AUXILIAR'] ? 'APROBADO' : 'INACTIVO', dept: co.auxRoleDept || '', pin: this.getRolePin(co, 'AUXILIAR') || '' };
            co.deliverables = co.deliverables || {};
            
            for (let docKey in defDocs) {
                if (co.deliverables[docKey] === undefined) co.deliverables[docKey] = null;
            }

            co.flightTests = Array.isArray(co.flightTests) ? co.flightTests : [];
            co.votingMotions = Array.isArray(co.votingMotions) ? co.votingMotions : [];
            co.aiPrompts = Array.isArray(co.aiPrompts) ? co.aiPrompts : [];
            co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
            co.realCosts = Array.isArray(co.realCosts) ? co.realCosts : [];
            co.cart = Array.isArray(co.cart) ? co.cart : [];
            co.orders = Array.isArray(co.orders) ? co.orders : [];
            co.grades = co.grades || {};
            co.slogan = co.slogan || "";
            co.valueProposition = co.valueProposition || "";
            co.logo = co.logo || null;
            co.bom = Array.isArray(co.bom) ? co.bom : [];
            co.sponsorAwarded = co.sponsorAwarded || null;
            co.marketingCampaigns = Array.isArray(co.marketingCampaigns) ? co.marketingCampaigns : [];
            co.inactivityReports = Array.isArray(co.inactivityReports) ? co.inactivityReports : [];
            co.sponsorData = co.sponsorData || { name: null, logo: null };
            co.auxRoleDept = co.auxRoleDept || null;
            co.notifications = Array.isArray(co.notifications) ? co.notifications : [];
            co.sanctions = Array.isArray(co.sanctions) ? co.sanctions : [];
            co.crisisAlerts = Array.isArray(co.crisisAlerts) ? co.crisisAlerts : [];
        }
        return d;
    },

    mergeData(serverData, localData) {
        if (!serverData) return localData;
        if (!localData) return serverData;

        const merged = JSON.parse(JSON.stringify(serverData)); 
        
        for (let k in localData.companies) {
            const sCo = merged.companies[k];
            const lCo = localData.companies[k];
            
            if (sCo && lCo) {
                const sTime = sCo.updatedAt || 0;
                const lTime = lCo.updatedAt || 0;
                
                if (lTime > sTime) {
                    merged.companies[k] = JSON.parse(JSON.stringify(lCo));
                } else {
                    const mergeArrays = (arrServer, arrLocal) => {
                        if (!Array.isArray(arrServer)) arrServer = [];
                        if (!Array.isArray(arrLocal)) arrLocal = [];
                        const serverIds = new Set(arrServer.map(i => String(i.id)));
                        const missingInServer = arrLocal.filter(i => i && i.id && !serverIds.has(String(i.id)));
                        return [...missingInServer, ...arrServer];
                    };

                    const arraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'cart', 'bom'];
                    arraysToMerge.forEach(arrName => {
                        sCo[arrName] = mergeArrays(sCo[arrName], lCo[arrName]);
                    });
                }
            } else if (lCo && !sCo) {
                merged.companies[k] = lCo;
            }
        }
        
        const mergeArraysGlobal = (arrS, arrL) => {
            if(!Array.isArray(arrS)) arrS = [];
            if(!Array.isArray(arrL)) arrL = [];
            const ids = new Set(arrS.map(i => String(i?.id || i?.sessionId)));
            const missing = arrL.filter(i => i && (i.id || i.sessionId) && !ids.has(String(i.id || i.sessionId)));
            return [...missing, ...arrS];
        };

        if (localData.telemetry && localData.telemetry.sessions) {
            merged.telemetry = merged.telemetry || { sessions: [] };
            merged.telemetry.sessions = mergeArraysGlobal(merged.telemetry.sessions, localData.telemetry.sessions);
            merged.telemetry.totalLogins = Math.max(merged.telemetry.totalLogins || 0, localData.telemetry.totalLogins || 0);
        }
        
        merged.suggestionsToAlex = mergeArraysGlobal(merged.suggestionsToAlex, localData.suggestionsToAlex);
        merged.pendingCustom = mergeArraysGlobal(merged.pendingCustom, localData.pendingCustom);
        merged.b2bMarket = mergeArraysGlobal(merged.b2bMarket, localData.b2bMarket);
        merged.b2bContracts = mergeArraysGlobal(merged.b2bContracts, localData.b2bContracts);
        merged.securityIncidents = mergeArraysGlobal(merged.securityIncidents, localData.securityIncidents);

        return merged;
    },

    async init() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const raw = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_DATA));
            this.data = this.migrate(raw);
            this.saveLocalOnly();
        } catch (err) {
            console.error("Error migrando datos locales:", err);
            this.data = this.migrate(JSON.parse(JSON.stringify(INITIAL_DATA)));
        }

        const savedSession = localStorage.getItem(this.sessionKey);
        if (savedSession) {
            try {
                const sessionUser = JSON.parse(savedSession);
                const isValid = sessionUser && (sessionUser.admin 
                    ? !!(this.data.config?.teachers && this.data.config.teachers[sessionUser.role])
                    : !!(this.data.companies && this.data.companies[sessionUser.coId]));

                if (isValid) {
                    this.user = Object.freeze(sessionUser);
                    document.getElementById('hud-header')?.classList.remove('hidden');
                    document.getElementById('hud-nav')?.classList.remove('hidden');
                    if (typeof auth !== 'undefined' && typeof auth.buildNav === 'function') {
                        auth.buildNav(this.user.admin);
                    }
                } else {
                    this.user = null;
                    localStorage.removeItem(this.sessionKey);
                }
            } catch(e) {
                this.user = null;
                localStorage.removeItem(this.sessionKey);
            }
        }
        
        try {
            if (typeof ui !== 'undefined' && typeof ui.render === 'function') ui.render();
        } catch (renderErr) {
            console.error("Error en renderizado inicial:", renderErr);
        }
        
        setInterval(() => { 
            const el = document.getElementById('hud-clock'); 
            if(el) el.innerText = `TIME: ${new Date().toLocaleTimeString()}`; 
        }, 1000);
        
        await this.fetchFromCloud();
    },

    async fetchFromCloud() {
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let shouldRender = false;

        try {
            const res = await fetch('/api/state');
            if(res.ok) {
                const json = await res.json();
                if(json && json.status !== 'empty') {
                    try { localStorage.setItem('marsket_emergency_snapshot', JSON.stringify(this.data)); } catch(e) {}
                    this.data = this.mergeData(this.migrate(json), this.data);
                    this.data.version = json.version || this.data.version;
                    this.saveLocalOnly();
                    this.isCloudOnline = true;
                    shouldRender = true;
                } else if(json && json.status === 'empty') {
                    this.isCloudOnline = true;
                    await this.pushToCloud(false);
                }
            } else {
                this.isCloudOnline = false;
            }
        } catch(err) { 
            console.error("Error de red en fetchFromCloud:", err);
            this.isCloudOnline = false; 
        } finally { 
            this.isSyncing = false; 
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }

        // Renderizado separado del bloque de red para que nunca tumbe la conexión D1
        if (shouldRender && typeof ui !== 'undefined' && ui.render) {
            try {
                ui.render();
            } catch (uiErr) {
                console.error("Excepción visual aislada en ui.render():", uiErr);
            }
        }
    },

    saveLocalOnly() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (e) {
            console.error("Aviso: almacenamiento local lleno o restringido:", e);
        }
    },

    save() { 
        if (this.user && !this.user.admin && this.data.companies[this.user.coId]) {
            this.data.companies[this.user.coId].updatedAt = Date.now();
        }
        this.data.lastUpdated = Date.now();
        
        this.saveLocalOnly(); 
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        this.pushToCloud(true);
    },

    async pushToCloud(debounced = false) {
        if(debounced) {
            clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.pushToCloud(false), 800);
            return;
        }
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let shouldRenderConflict = false;
        
        try {
            const payload = JSON.parse(JSON.stringify(this.data));
            const res = await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (res.status === 409 || res.status === 412) {
                const fetchRes = await fetch('/api/state');
                if (fetchRes.ok) {
                    const serverData = await fetchRes.json();
                    if (serverData && serverData.status !== 'empty') {
                        this.data = this.mergeData(this.migrate(serverData), this.data);
                        this.data.version = Number(serverData.version || this.data.version) + 1;
                        this.saveLocalOnly();
                        
                        const retryRes = await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.data) });
                        if (retryRes.ok) {
                            const retryJson = await retryRes.json().catch(() => null);
                            if (retryJson && retryJson.version) {
                                this.data.version = retryJson.version;
                                this.saveLocalOnly();
                            }
                        }
                        shouldRenderConflict = true;
                    }
                }
                this.isCloudOnline = true;
            } else if (res.ok) {
                const json = await res.json().catch(() => null);
                if (json && json.version) {
                    this.data.version = json.version; 
                    this.saveLocalOnly();
                }
                this.isCloudOnline = true;
            } else {
                this.isCloudOnline = false;
            }
        } catch(err) { 
            console.error("Error de red en pushToCloud:", err);
            this.isCloudOnline = false; 
        } finally { 
            this.isSyncing = false; 
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }

        if (shouldRenderConflict && typeof ui !== 'undefined' && ui.render) {
            try { ui.render(); } catch(uiErr) { console.error("Excepción visual aislada tras reconciliación:", uiErr); }
        }
    },

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        if (!co) return; 
        co.balance = (Number(co.balance) || 0) + Number(delta);
        co.updatedAt = Date.now();
        co.ledger = co.ledger || [];
        co.ledger.unshift({ id: 'TX-' + Math.random().toString(36).substr(2, 5).toUpperCase(), date: new Date().toLocaleString(), concept, dept, delta: Number(delta), final: co.balance });
        this.save();
    }
};

const telemetry = {
    startSession(entity, role) {
        if (!state.data.telemetry) state.data.telemetry = { totalLogins: 0, sessions: [] };
        if (!Array.isArray(state.data.telemetry.sessions)) state.data.telemetry.sessions = [];
        if (isNaN(state.data.telemetry.totalLogins)) state.data.telemetry.totalLogins = 0;

        state.data.telemetry.totalLogins++;
        state.sessionData = { sessionId: 'SESS-' + Date.now().toString().slice(-6), timestamp: new Date().toISOString(), entity, role, events: [] };
        state.data.telemetry.sessions.unshift(state.sessionData);
        if(state.data.telemetry.sessions.length > 100) state.data.telemetry.sessions.pop();
        state.save();
    },
    log(action, details) {
        if(!state.sessionData) return;
        state.sessionData.events = state.sessionData.events || [];
        state.sessionData.events.push({ time: new Date().toLocaleTimeString(), action, details });
        state.save();
    }
};