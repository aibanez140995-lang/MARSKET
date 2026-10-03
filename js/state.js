// js/state.js

// --- MOTOR DE ESTADO (CLOUD HYBRID D1) Y MIGRACIÓN ---
const state = {
    data: {}, user: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    isCloudOnline: false, isSyncing: false, syncTimer: null,

    migrate(d) {
        d.suggestionsToAlex = d.suggestionsToAlex || [];
        d.pendingCustom = d.pendingCustom || [];
        if(!d.config.deadlines) {
            d.config.deadlines = { techReport: "2026-11-15T23:59", presPhase1: "2026-10-30T23:59", presPhase3: "2026-12-05T23:59", financeBook: "2026-12-01T23:59", valuePropDoc: "2026-11-10T23:59" };
        }
        if(!d.config.guidelines) d.config.guidelines = { techReportDocUrl: "", techReportNotes: "" };
        
        // Coord fix for older states
        if(d.config.teachers.COORD) {
            delete d.config.teachers.COORD;
            d.config.teachers.COORD_MARIO = { name: "Coordinación - Mario", pin: "0001", canSponsor: true };
            d.config.teachers.COORD_ALEX = { name: "Coordinación - Alex", pin: "0002", canSponsor: true };
        }

        for(let k in d.companies) {
            let co = d.companies[k];
            co.deliverables = co.deliverables || { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null };
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
            
            // Role remapping to explicit 5 roles
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

    async init() {
        const saved = localStorage.getItem(this.storageKey);
        const raw = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(INITIAL_DATA));
        this.data = this.migrate(raw);
        
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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
                    this.data = this.migrate(json);
                    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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

    save() { 
        localStorage.setItem(this.storageKey, JSON.stringify(this.data)); 
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
            const res = await fetch('/api/state', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(this.data) });
            this.isCloudOnline = res.ok;
        } catch(err) { this.isCloudOnline = false; } 
        finally { this.isSyncing = false; if(this.user) ui.updateHUD(); }
    },

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        co.balance += delta;
        co.ledger.unshift({ id: 'TX-' + Math.random().toString(36).substr(2, 5).toUpperCase(), date: new Date().toLocaleString(), concept, dept, delta, final: co.balance });
        this.save();
    }
};

// --- MOTOR DE TELEMETRÍA ---
const telemetry = {
    startSession(entity, role) {
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