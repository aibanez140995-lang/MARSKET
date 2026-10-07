// js/state.js

const state = {
    data: {}, user: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    sessionKey: 'marsket_session_v1',
    isCloudOnline: false, isSyncing: false, syncTimer: null,

    migrate(d) {
        // REGLA 1: BLINDAJE DE ESTADO (Fallbacks)
        d.version = d.version || 1; 
        d.config = d.config || JSON.parse(JSON.stringify(INITIAL_DATA.config));
        d.catalog = d.catalog && d.catalog.length > 0 ? d.catalog : JSON.parse(JSON.stringify(INITIAL_DATA.catalog));
        d.companies = d.companies || JSON.parse(JSON.stringify(INITIAL_DATA.companies));
        d.telemetry = d.telemetry || { totalLogins: 0, sessions: [] };
        d.telemetry.sessions = d.telemetry.sessions || [];

        d.suggestionsToAlex = d.suggestionsToAlex || [];
        d.pendingCustom = d.pendingCustom || [];
        
        // FASE 1 v1.0.13: Arrays globales para el Mercado B2B
        d.b2bMarket = d.b2bMarket || [];
        d.b2bContracts = d.b2bContracts || [];
        
        d.config.deadlines = d.config.deadlines || { techReport: "2026-11-15T23:59", presPhase1: "2026-10-30T23:59", presPhase3: "2026-12-05T23:59", financeBook: "2026-12-01T23:59", valuePropDoc: "2026-11-10T23:59" };
        d.config.guidelines = d.config.guidelines || { techReportDocUrl: "", techReportNotes: "" };
        
        if(d.config.teachers.COORD) {
            delete d.config.teachers.COORD;
            d.config.teachers.COORD_MARIO = { name: "Coordinación - Mario", pin: "0001", canSponsor: true };
            d.config.teachers.COORD_ALEX = { name: "Coordinación - Alex", pin: "0002", canSponsor: true };
        }

        const countries = ['China', 'Alemania', 'España', 'Turquía', 'Marruecos', 'ESA / Francia', 'Polonia', 'Italia', 'Portugal', 'India', 'República Checa', 'Japón', 'EEUU', 'Reino Unido', 'Corea del Sur', 'Brasil'];
        d.catalog.forEach(item => {
            if (!item.origin) item.origin = countries[Math.floor(Math.random() * countries.length)];
        });

        for(let k in d.companies) {
            let co = d.companies[k];
            
            co.roles = co.roles || { CEO:'1234', TECNICO:'1234', FINANZAS:'1234', MARKETING:'1234', OPERACIONES_IA:'1234' };
            co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
            co.loginStats.roles = co.loginStats.roles || {};

            co.classGroup = co.classGroup || 'A';
            
            co.deliverables = co.deliverables || {};
            const defaultDocs = { technicalReport: null, informePreliminar: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null, boceto: null, fotoPrototipo: null, videoPromo: null, mathGoniometro: null, mathMedicion1: null, mathMedicion2: null, mathComparativa: null, businessModel: null, canvas: null, dossierInversores: null };
            co.deliverables = { ...defaultDocs, ...co.deliverables };
            
            co.fase1Registro = co.fase1Registro || { presupuestoTeorico: '', alturaEstimada: '', justificacionV2: '' };
            co.decisionLog = co.decisionLog || [];
            
            co.flightTests = co.flightTests || [];
            co.votingMotions = co.votingMotions || [];
            co.aiPrompts = co.aiPrompts || [];
            co.ledger = co.ledger || [];
            co.realCosts = co.realCosts || [];
            co.cart = co.cart || [];
            co.orders = co.orders || [];
            co.grades = co.grades || {};
            co.slogan = co.slogan || "";
            co.valueProposition = co.valueProposition || "";
            co.logo = co.logo || null;
            co.sponsorAwarded = co.sponsorAwarded || null;
            co.marketingCampaigns = co.marketingCampaigns || [];
            co.marketingPackages = co.marketingPackages || [];
            co.inactivityReports = co.inactivityReports || [];
            co.sponsorData = co.sponsorData || { name: null, logo: null };
            co.auxRoleDept = co.auxRoleDept || null;
            co.notifications = co.notifications || [];
            co.sanctions = co.sanctions || [];
            co.crisisAlerts = co.crisisAlerts || [];
            
            // FASE 1 v1.0.13: Inventario Físico
            co.inventory = co.inventory || [];
            
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
            
            if(co.loginStats && co.loginStats.roles && (co.loginStats.roles.QUIMICA || !co.loginStats.roles.TECNICO)) {
                co.loginStats.roles = {
                    CEO: co.loginStats.roles.CEO || {count:0, lastLogin:null},
                    TECNICO: co.loginStats.roles.QUIMICA || {count:0, lastLogin:null},
                    FINANZAS: co.loginStats.roles.FINANZAS || {count:0, lastLogin:null},
                    MARKETING: co.loginStats.roles.MARKETING || {count:0, lastLogin:null},
                    OPERACIONES_IA: co.loginStats.roles.IA || {count:0, lastLogin:null}
                };
            }
        }
        return d;
    },

    mergeData(serverData, localData) {
        if (!serverData || !localData) return serverData || localData;
        const merged = JSON.parse(JSON.stringify(serverData)); 
        
        const mergeArrays = (arrServer, arrLocal) => {
            const serverIds = new Set(arrServer.map(i => String(i.id)));
            const missingInServer = arrLocal.filter(i => i.id && !serverIds.has(String(i.id)));
            return [...missingInServer, ...arrServer];
        };

        if (localData.telemetry && localData.telemetry.sessions) {
            merged.telemetry = merged.telemetry || { sessions: [] };
            merged.telemetry.sessions = mergeArrays(merged.telemetry.sessions, localData.telemetry.sessions);
            merged.telemetry.totalLogins = Math.max(merged.telemetry.totalLogins || 0, localData.telemetry.totalLogins || 0);
        }
        
        if (localData.suggestionsToAlex) {
            merged.suggestionsToAlex = mergeArrays(merged.suggestionsToAlex || [], localData.suggestionsToAlex);
        }
        
        // FASE 1 v1.0.13: Fusión de arrays globales B2B
        if (localData.b2bMarket) {
            merged.b2bMarket = mergeArrays(merged.b2bMarket || [], localData.b2bMarket);
        }
        if (localData.b2bContracts) {
            merged.b2bContracts = mergeArrays(merged.b2bContracts || [], localData.b2bContracts);
        }

        for (let k in localData.companies) {
            if (merged.companies[k] && localData.companies[k]) {
                const sCo = merged.companies[k];
                const lCo = localData.companies[k];
                
                const arraysToMerge = [
                    'orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 
                    'aiPrompts', 'decisionLog', 'marketingCampaigns', 'marketingPackages', 
                    'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'cart',
                    'inventory' // FASE 1 v1.0.13: Fusión de inventario
                ];
                
                arraysToMerge.forEach(arrName => {
                    sCo[arrName] = mergeArrays(sCo[arrName] || [], lCo[arrName] || []);
                });
            }
        }
        return merged;
    },

    async init() {
        const saved = localStorage.getItem(this.storageKey);
        const raw = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_DATA));
        this.data = this.migrate(raw);
        this.saveLocalOnly();

        const savedSession = localStorage.getItem(this.sessionKey);
        if (savedSession) {
            try {
                const sessionUser = JSON.parse(savedSession);
                const isValid = sessionUser.admin 
                    ? !!this.data.config.teachers[sessionUser.role]
                    : !!this.data.companies[sessionUser.coId];

                if (isValid) {
                    this.user = sessionUser;
                    document.getElementById('hud-header')?.classList.remove('hidden');
                    document.getElementById('hud-nav')?.classList.remove('hidden');
                    auth.buildNav(this.user.admin);
                } else {
                    localStorage.removeItem(this.sessionKey);
                }
            } catch(e) {
                localStorage.removeItem(this.sessionKey);
            }
        }
        
        ui.render();
        setInterval(() => { const el = document.getElementById('hud-clock'); if(el) el.innerText = `TIME: ${new Date().toLocaleTimeString()}`; }, 1000);
        
        await this.fetchFromCloud();
    },

    async fetchFromCloud() {
        this.isSyncing = true;
        if(this.user) ui.updateHUD();
        try {
            const res = await fetch('/api/state');
            if(res.ok) {
                const json = await res.json();
                if(json && json.status !== 'empty') {
                    this.data = this.mergeData(this.migrate(json), this.data);
                    this.data.version = json.version || this.data.version;
                    this.saveLocalOnly();
                    this.isCloudOnline = true;
                    ui.render();
                } else if(json && json.status === 'empty') {
                    this.isCloudOnline = true;
                    await this.pushToCloud(false);
                }
            } else this.isCloudOnline = false;
        } catch(err) { this.isCloudOnline = false; } 
        finally { this.isSyncing = false; if(this.user) ui.updateHUD(); }
    },

    saveLocalOnly() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    },

    save() { 
        this.saveLocalOnly(); 
        if(this.user) ui.updateHUD(); 
        this.pushToCloud(true);
    },

    async pushToCloud(debounced = false) {
        if(debounced) {
            clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.pushToCloud(false), 800);
            return;
        }
        this.isSyncing = true;
        if(this.user) ui.updateHUD();
        
        try {
            const payload = JSON.parse(JSON.stringify(this.data));
            const res = await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            
            if (res.status === 409 || res.status === 412) {
                console.warn("DATA SAFETY: Colisión detectada en Cloudflare D1. Fusionando estado de concurrencia optimista...");
                const fetchRes = await fetch('/api/state');
                
                if (fetchRes.ok) {
                    const serverData = await fetchRes.json();
                    if (serverData && serverData.status !== 'empty') {
                        this.data = this.mergeData(serverData, this.data);
                        this.data.version = serverData.version || (this.data.version + 1);
                        this.saveLocalOnly();
                        
                        await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.data) });
                        
                        if (typeof ui.showModal === 'function' && document.getElementById('modal-overlay')) {
                            ui.showModal(
                                "🛡️ Data Safety Intercept", 
                                "<p class='text-mars-green text-[10px] leading-relaxed'>El sistema ha detectado una subida simultánea de otro miembro de tu equipo. Para evitar pérdida de datos, <strong>se ha pausado el guardado, se ha fusionado tu actividad con la suya, y se ha subido con éxito el paquete unificado.</strong></p>", 
                                ""
                            );
                        }
                        ui.render();
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
            this.isCloudOnline = false; 
        } finally { 
            this.isSyncing = false; 
            if(this.user) ui.updateHUD(); 
        }
    },

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        if (!co) return; // REGLA 1
        co.balance += delta;
        co.ledger.unshift({ id: 'TX-' + Math.random().toString(36).substr(2, 5).toUpperCase(), date: new Date().toLocaleString(), concept, dept, delta, final: co.balance });
        this.save();
    }
};

const telemetry = {
    startSession(entity, role) {
        if (!state.data.telemetry) state.data.telemetry = { totalLogins: 0, sessions: [] };
        if (!state.data.telemetry.sessions) state.data.telemetry.sessions = [];
        if (isNaN(state.data.telemetry.totalLogins)) state.data.telemetry.totalLogins = 0;

        state.data.telemetry.totalLogins++;
        state.sessionData = { sessionId: 'SESS-' + Date.now().toString().slice(-6), timestamp: new Date().toISOString(), entity, role, events: [] };
        state.data.telemetry.sessions.unshift(state.sessionData);
        if(state.data.telemetry.sessions.length > 100) state.data.telemetry.sessions.pop();
        state.save();
    },
    log(action, details) {
        if(!state.sessionData) return;
        state.sessionData.events.push({ time: new Date().toLocaleTimeString(), action, details });
        state.save();
    }
};