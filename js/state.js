// js/state.js
// --- GESTIÓN DE ESTADO ZERO-TRUST, MIGRACIÓN Y PERSISTENCIA ATÓMICA (v1.1.44) ---

const DEFAULT_STATE = {
    version: 1,
    resetEpoch: 0,
    officialNews: [],
    deletedOfficialNewsIds: [],
    deletedCompanyIds: [],
    pressReleases: [],
    b2bMarket: [],
    b2bContracts: [],
    securityIncidents: [],
    suggestionsToAlex: [],
    pendingCustom: [],
    telemetry: { totalLogins: 0, sessions: [] },
        catalog: [
        // 1. Cuerpo del Cohete (Estructura Principal)
        { id: 'F01', name: 'Botella de 500 ml', price: 97.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'España' },
        { id: 'F02', name: 'Botella de 1 L', price: 120.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'España' },
        { id: 'F03', name: 'Botella de 1,5 L', price: 165.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'Portugal' },
        { id: 'F04', name: 'Botella de 2 L', price: 200.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'Italia' },

        // 2. Propulsión y Reactivos
        { id: 'P01', name: 'Bicarbonato de Sodio', price: 10.0, unit: 'Gramo', category: 'Propulsión y Reactivos', origin: 'España' },
        { id: 'P02', name: 'Vinagre', price: 5.0, unit: '10 ml', category: 'Propulsión y Reactivos', origin: 'España' },

        // 3. Aerodinámica - 3.1 Aletas Estabilizadoras
        { id: 'A01', name: 'Cartulina (Aletas)', price: 15.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },
        { id: 'A02', name: 'Cartón Básico', price: 30.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Portugal' },
        { id: 'A03', name: 'Aletas de Plástico', price: 45.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Alemania' },
        { id: 'A04', name: 'Aletas de PVC Rígido', price: 85.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Polonia' },
        { id: 'A05', name: 'Suplemento: Plastificado de Aletas', price: 5.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },

        // 3. Aerodinámica - 3.2 Puntas / Ojivas
        { id: 'O01', name: 'Punta de Cartulina', price: 25.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },
        { id: 'O02', name: 'Punta de Cartón (Estándar)', price: 55.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'ESA / Francia' },
        { id: 'O03', name: 'Punta de Plástico (PET)', price: 75.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Alemania' },
        { id: 'O04', name: 'Punta de Plástico 3D', price: 90.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'ESA / Francia' },

        // 4. Sistema de Reacción
        { id: 'R01', name: 'Papel de Cocina', price: 5.0, unit: 'Unidad/Hoja', category: 'Sistema de Reacción', origin: 'España' },
        { id: 'R02', name: 'Hilo de Algodón', price: 2.0, unit: 'Decímetro', category: 'Sistema de Reacción', origin: 'España' },

        // 5. Sellado y Unión (Estanquidad y Montaje)
        { id: 'S01', name: 'Corcho de Vino Estándar', price: 25.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S02', name: 'Tapón de Goma Hermético', price: 40.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'Alemania' },
        { id: 'S03', name: 'Cinta Aislante', price: 10.0, unit: 'Metro', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'Alemania' },
        { id: 'S04', name: 'Celo / Cinta Adhesiva', price: 0.50, unit: 'cm', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S05', name: 'Pegamento de Barra', price: 15.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S06', name: 'Carga de Pegamento Termofusible por Uso', price: 1.0, unit: 'Uso', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'ESA / Francia' },

        // 6. Elementos Extra
        { id: 'E01', name: 'Pintura', price: 2.0, unit: 'Cada Color', category: 'Elementos Extra', origin: 'España' }
    ],
    config: {
        nextOrderId: 1000,
        scheduleBaselineVersion: 1168,
        deadlines: typeof DEFAULT_DEADLINES !== 'undefined' ? DEFAULT_DEADLINES : {},
        deliverableSchedule: {},
        guidelines: { techReportDocUrl: "", techReportNotes: "Guía oficial redactada por FYQ." },
        teachers: {
            FYQ: { name: "Física y Química", canSponsor: false },
            ECO: { name: "Economía", canSponsor: false },
            LYE: { name: "Liderazgo y Emprendimiento", canSponsor: false },
            LEN: { name: "Lengua Castellana", canSponsor: false },
            MAT: { name: "Matemáticas", canSponsor: false },
            ING: { name: "Inglés", canSponsor: false },
            BIO: { name: "Biología y Geología", canSponsor: false },
            COORD_MARIO: { name: "Coordinación - Mario", canSponsor: true },
            COORD_ALEX: { name: "Coordinación - Alex", canSponsor: true }
        }
    },
    companies: {
        astra: {
            name: "Astra Dynamics", balance: 2400, classGroup: 'A', logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "" }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        },
        sandbox_master: {
            name: "MARS-X SANDBOX (PRUEBAS)", balance: 1000, classGroup: 'TEST', isTestCompany: true, unlockAllContracts: true, logo: null, slogan: "BANCO MAESTRO DE PRUEBAS", valueProposition: "Entorno de evaluación y pruebas",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "" }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [],
            ledger: [
                { id: 'LEDGER_INIT_TEST', desc: 'Dotación inicial Sandbox de Pruebas', amount: 1000, date: '02/11/2026', delta: 1000, dept: 'GENERAL', final: 1000 }
            ],
            realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        },
        sandbox_student: {
            name: "MARS-X ALUMNO (ESTÁNDAR)", balance: 2400, classGroup: 'TEST', isTestCompany: true, unlockAllContracts: false, logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "" }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [],
            realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        }
    }
};

const state = {
    data: {}, user: null, currentUser: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    sessionKey: 'marsket_session_v1',
    isCloudOnline: false, isSyncing: false, syncTimer: null, heartbeatTimer: null,
    pausePolling: false, _broadcastChannel: null, lastETag: null, lastCompanyETag: null,
    consecutiveNetworkFailures: 0, isOfflineContained: false, _listenersAttached: false,
    _hasWarnedCloudNetwork: false,
    _clockInterval: null,
    _vaultKey: 'MARS_AEE_2026_SECRET_KEY',
    _adminCredentialsFetched: false,
    _fetchingCredentials: false,

    // WP5: Acceso encapsulado a la estructura reactiva sin congelar state.data
    get(path) {
        if (!path) return this.data;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let curr = this.data;
        for (const k of keys) {
            if (curr == null) return undefined;
            curr = curr[k];
        }
        return curr;
    },

    set(path, value) {
        if (!path) return false;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let curr = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (curr[k] == null || typeof curr[k] !== 'object') {
                curr[k] = {};
            }
            curr = curr[k];
        }
        curr[keys[keys.length - 1]] = value;
        return true;
    },

    calculateBalance(co) {
        if (!co) return 2400.0;
        const INITIAL_CAPITAL = 2400.0;
        if (!Array.isArray(co.ledger) || co.ledger.length === 0) {
            return INITIAL_CAPITAL;
        }
        const seenTx = new Set();
        let totalDelta = 0;
        for (const tx of co.ledger) {
            const id = String(tx?.id || tx?.tx_id || '');
            if (!id || seenTx.has(id)) continue;
            seenTx.add(id);
            const delta = Number(tx.delta);
            if (!isNaN(delta)) {
                totalDelta += delta;
            }
        }
        return Math.round((INITIAL_CAPITAL + totalDelta + Number.EPSILON) * 100) / 100;
    },

    recalculateBalance(co) {
        if (!co) return;
        co.balance = this.calculateBalance(co);
    },

    getCompanySponsorAmount(co) {
        if (!co) return 0;
        if (co.sponsorData && !isNaN(Number(co.sponsorData.amount)) && Number(co.sponsorData.amount) > 0) {
            return Number(co.sponsorData.amount);
        }
        if (co.sponsorAwarded && typeof SPONSOR_TIERS_DEF !== 'undefined' && SPONSOR_TIERS_DEF[co.sponsorAwarded]) {
            return Number(SPONSOR_TIERS_DEF[co.sponsorAwarded].amount) || 0;
        }
        return 0;
    },

    getCompanyGrossOperatingCosts(co) {
        if (!co) return 0;
        const ledger = Array.isArray(co.ledger) ? co.ledger : [];
        const virtualSpend = ledger
            .filter(l => Number(l.delta) < 0)
            .reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);
        return Math.round((virtualSpend + Number.EPSILON) * 100) / 100;
    },

    getCompanyOperatingCosts(co) {
        if (!co) {
            return { gross: 0, sponsorReduction: 0, net: 0, valueOf() { return 0; }, toString() { return '0'; }, toFixed(d) { return (0).toFixed(d); } };
        }
        const gross = this.getCompanyGrossOperatingCosts(co);
        const sponsorReduction = this.getCompanySponsorAmount(co);
        const net = Math.max(0, Math.round((gross - sponsorReduction + Number.EPSILON) * 100) / 100);
        return { 
            gross, 
            sponsorReduction, 
            net,
            valueOf() { return this.net; },
            toString() { return String(this.net); },
            toFixed(d) { return this.net.toFixed(d); }
        };
    },

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

    getSecureRandomInt(min, max) {
        const lo = Math.min(min, max);
        const hi = Math.max(min, max);
        const range = hi - lo + 1;
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            const buf = new Uint32Array(1);
            // Reducción sin sesgo de módulo (unbiased rejection sampling conforme AEPD VALiDA Cripto)
            const maxLimit = Math.floor(0xFFFFFFFF / range) * range;
            do {
                crypto.getRandomValues(buf);
            } while (buf[0] >= maxLimit);
            return lo + (buf[0] % range);
        }
        return Math.floor(lo + Math.random() * range);
    },

    generateCompanyCode(name) {
        const prefix = (name || 'MRS').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
        const num = this.getSecureRandomInt(1000, 9999);
        return `${prefix}-${num}`;
    },

    generateRandomPin(excludePins = []) {
        const excludeSet = new Set((excludePins || []).map(String));
        let pin = '';
        let attempts = 0;
        do {
            pin = this.getSecureRandomInt(1000, 9999).toString();
            attempts++;
        } while (excludeSet.has(pin) && attempts < 200);
        return pin;
    },

    generateCompanyPins(co) {
        const roles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
        const existingAux = this.getRolePin(co, 'AUXILIAR');
        if (existingAux || (co && co.auxRoleDept)) {
            roles.push('AUXILIAR');
        }
        const used = new Set();
        const pins = {};
        roles.forEach(r => {
            let pin = '';
            let attempts = 0;
            do {
                pin = this.getSecureRandomInt(1000, 9999).toString();
                attempts++;
            } while (used.has(pin) && attempts < 200);
            used.add(pin);
            pins[r] = pin;
        });
        return pins;
    },

    getCompanyCode(co) {
        if (!co) return '';
        if (co.authVault && co.authVault.code) return this.decodeSecret(co.authVault.code);
        return co.accessCode || '';
    },

    setCompanyCode(co, newCode, touchTimestamp = true) {
        if (!co) return;
        const clean = String(newCode).trim().toUpperCase();
        co.authVault = co.authVault || { code: '', roles: {} };
        co.authVault.code = this.encodeSecret(clean);
        delete co.accessCode;
        if (touchTimestamp) {
            const now = Date.now();
            co.updatedAt = now;
            co.authUpdatedAt = now;
        }
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

    setRolePin(co, role, newPin, touchTimestamp = true) {
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
        if (touchTimestamp) {
            const now = Date.now();
            co.updatedAt = now;
            co.authUpdatedAt = now;
        }
    },

    getAuthToken(userObj, dataRoot = this.data) {
        if (userObj?.authToken) return userObj.authToken;
        if (typeof sessionStorage !== 'undefined') {
            const token = sessionStorage.getItem('marsket_token');
            if (token) return token;
        }
        return '';
    },

    migrate(d) {
        d = d || {};
        d.version = Number(d.version) || 1; 
        d.lastUpdated = d.lastUpdated || Date.now();
        d.config = d.config || {};
        if (!d.config.deliverableSchedule) {
            d.config.deliverableSchedule = {};
        }
        d.catalog = d.catalog && d.catalog.length > 0 ? d.catalog : JSON.parse(JSON.stringify(DEFAULT_STATE.catalog));
        d.companies = d.companies || JSON.parse(JSON.stringify(DEFAULT_STATE.companies));
        d.telemetry = d.telemetry || { totalLogins: 0, sessions: [] };
        d.telemetry.sessions = Array.isArray(d.telemetry.sessions) ? d.telemetry.sessions : [];

        d.suggestionsToAlex = Array.isArray(d.suggestionsToAlex) ? d.suggestionsToAlex : [];
        const TTL_MS = 72 * 60 * 60 * 1000;
        const now = Date.now();
        if (Array.isArray(d.coordinatorReports)) {
            d.coordinatorReports = d.coordinatorReports.filter(report => {
                const reportTime = report.createdAt ? new Date(report.createdAt).getTime() : (report.timestamp || now);
                return (now - reportTime) < TTL_MS;
            });
        }
        Object.keys(d.companies || {}).forEach(cid => {
            const co = d.companies[cid];
            if (Array.isArray(co.coordinatorReports)) {
                co.coordinatorReports = co.coordinatorReports.filter(report => {
                    const reportTime = report.createdAt ? new Date(report.createdAt).getTime() : (report.timestamp || now);
                    return (now - reportTime) < TTL_MS;
                });
            }
        });
        d.pendingCustom = Array.isArray(d.pendingCustom) ? d.pendingCustom : [];
        d.officialNews = Array.isArray(d.officialNews) ? d.officialNews : [];
        d.deletedOfficialNewsIds = Array.isArray(d.deletedOfficialNewsIds) ? d.deletedOfficialNewsIds : [];
        d.pressReleases = Array.isArray(d.pressReleases) ? d.pressReleases : [];
        d.b2bMarket = Array.isArray(d.b2bMarket) ? d.b2bMarket : [];
        d.b2bContracts = Array.isArray(d.b2bContracts) ? d.b2bContracts : [];
        d.securityIncidents = Array.isArray(d.securityIncidents) ? d.securityIncidents : [];
        
                d.deletedSuggestionIds = Array.isArray(d.deletedSuggestionIds) ? d.deletedSuggestionIds : [];
        d.deletedCompanyIds = Array.isArray(d.deletedCompanyIds) ? d.deletedCompanyIds : [];
        if (d.companies && d.deletedCompanyIds.length > 0) {
            d.deletedCompanyIds.forEach(delId => {
                delete d.companies[delId];
            });
        }
        d.dismissedNotificationIds = Array.isArray(d.dismissedNotificationIds) ? d.dismissedNotificationIds : [];
        d.config.deadlines = d.config.deadlines || {};
        const hasOwn = Object.prototype.hasOwnProperty;
        if (!d.config.scheduleBaselineVersion || d.config.scheduleBaselineVersion < 1168) {
            d.config.scheduleBaselineVersion = 1168;
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            if (typeof DELIVERABLES_DEF !== 'undefined') {
                DELIVERABLES_DEF.forEach(def => {
                    if (!d.config.deadlines[def.key]) {
                        d.config.deadlines[def.key] = def.defaultDate;
                    }
                    const prevSched = d.config.deliverableSchedule[def.key] || {};
                    const hasExplicitGuide = hasOwn.call(prevSched, 'guideDocUrl');
                    const hasExplicitOpen = hasOwn.call(prevSched, 'openDate');
                    d.config.deliverableSchedule[def.key] = {
                        ...prevSched,
                        phase: prevSched.phase || def.phase || "I",
                        openDate: hasExplicitOpen ? prevSched.openDate : def.defaultOpenDate,
                        deadline: prevSched.deadline || d.config.deadlines[def.key] || def.defaultDate,
                        guideDocUrl: hasExplicitGuide ? prevSched.guideDocUrl : (def.defaultGuideDocUrl || ""),
                        // No sellar Date.now() en datos recibidos o heredados para no derrotar cambios recientes en LWW
                        updatedAt: Number(prevSched.updatedAt) || 0
                    };
                });
            }
        } else if (typeof DELIVERABLES_DEF !== 'undefined') {
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            DELIVERABLES_DEF.forEach(def => {
                if (d.config.deliverableSchedule[def.key]) {
                    d.config.deliverableSchedule[def.key].phase = d.config.deliverableSchedule[def.key].phase || def.phase || "I";
                }
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

        if (!d.config.catalogBaselineVersion || d.config.catalogBaselineVersion < 1131) {
            d.config.catalogBaselineVersion = 1131;
            const officialCatalog = DEFAULT_STATE.catalog;
            const existingMap = new Map();
            if (Array.isArray(d.catalog)) {
                d.catalog.forEach(item => {
                    if (item && item.id) existingMap.set(String(item.id), item);
                });
            }
            d.catalog = officialCatalog.map(offItem => {
                const existing = existingMap.get(String(offItem.id));
                if (existing) {
                    return {
                        ...offItem,
                        price: typeof existing.price === 'number' && !isNaN(existing.price) ? existing.price : offItem.price,
                        origin: existing.origin || offItem.origin
                    };
                }
                return { ...offItem };
            });
            // Preservar articulos especiales creados ad-hoc por el profesorado
            existingMap.forEach((item, id) => {
                if (id.startsWith('CUST-') || !officialCatalog.some(o => String(o.id) === id)) {
                    if (!d.catalog.some(c => String(c.id) === id)) {
                        d.catalog.push(item);
                    }
                }
            });
        }

        d.config.guidelines = d.config.guidelines || { techReportDocUrl: "", techReportNotes: "" };
        d.config.teachers = d.config.teachers || JSON.parse(JSON.stringify(DEFAULT_STATE.config.teachers));
        
        if(d.config.teachers.COORD) {
            delete d.config.teachers.COORD;
            d.config.teachers.COORD_MARIO = { name: "Coordinación - Mario", canSponsor: true };
            d.config.teachers.COORD_ALEX = { name: "Coordinación - Alex", canSponsor: true };
        }

        const countries = ['China', 'Alemania', 'España', 'Turquía', 'Marruecos', 'ESA / Francia', 'Polonia', 'Italia', 'Portugal', 'India', 'República Checa', 'Japón'];
        d.catalog.forEach(item => {
            if (!item.origin) item.origin = countries[Math.floor(Math.random() * countries.length)];
        });

        const defDocs = {
            preliminaryReport: null, technicalReport: null, hoja_taller_fyq: null,
            brandIdentity_dec: null, brandIdentity_apr: null, businessModelDoc: null, businessModelCanvas: null, decisionDiary_dec: null, decisionDiary_apr: null,
            investorDossier: null,
            goniometerEvidence: null, mathReportDist: null, mathReportTwoPoints: null, mathReportFinal: null,
            budgetInitial: null, incomeStatement: null, budgetPostProto: null, balanceSheet: null,
            oralPresentation: null, writtenEssays: null
        };

        const defaultCodes = {
            sandbox_master: 'TEST-0000',
            sandbox_student: 'TEST-1111',
            astromars: 'AST-1010',
            redares: 'RED-2020',
            olympus: 'OLY-3030',
            curiosity: 'CUR-4040',
            phoenix: 'PHX-5050',
            valleys: 'VAL-6060',
            titan: 'TTN-7070',
            nova: 'NOV-8080',
            vortex: 'VTX-9090',
            astra: 'AST-1010',
            orion: 'ORI-2020',
            stellar: 'STL-3030'
        };

        if (!d.companies['sandbox_master']) {
            d.companies['sandbox_master'] = {
                name: "MARS-X SANDBOX (PRUEBAS)",
                classGroup: "TEST",
                balance: 1000,
                isTestCompany: true,
                unlockAllContracts: true,
                roles: {
                    CEO: '1234',
                    TECNICO: '1234',
                    FINANZAS: '1234',
                    MARKETING: '1234',
                    OPERACIONES_IA: '1234',
                    AUXILIAR: '1234'
                },
                authVault: {
                    code: 'TEST-0000',
                    roles: {
                        CEO: '1234',
                        TECNICO: '1234',
                        FINANZAS: '1234',
                        MARKETING: '1234',
                        OPERACIONES_IA: '1234',
                        AUXILIAR: '1234'
                    }
                },
                contracts: {},
                ledger: [
                    { id: 'LEDGER_INIT_TEST', desc: 'Dotación inicial Sandbox de Pruebas', amount: 1000, date: '02/11/2026', delta: 1000, dept: 'GENERAL', final: 1000 }
                ]
            };
        } else {
            d.companies['sandbox_master'].unlockAllContracts = true;
            d.companies['sandbox_master'].classGroup = 'TEST';
            d.companies['sandbox_master'].isTestCompany = true;
            d.companies['sandbox_master'].contracts = d.companies['sandbox_master'].contracts || {};
            if (!this.getCompanyCode(d.companies['sandbox_master'])) {
                this.setCompanyCode(d.companies['sandbox_master'], 'TEST-0000', false);
            }
        }

        if (!d.companies['sandbox_student']) {
            d.companies['sandbox_student'] = {
                name: "MARS-X ALUMNO (ESTÁNDAR)",
                classGroup: "TEST",
                balance: 2400,
                isTestCompany: true,
                unlockAllContracts: false,
                slogan: "",
                valueProposition: "",
                roles: {
                    CEO: '1234',
                    TECNICO: '1234',
                    FINANZAS: '1234',
                    MARKETING: '1234',
                    OPERACIONES_IA: '1234',
                    AUXILIAR: '1234'
                },
                authVault: {
                    code: 'TEST-1111',
                    roles: {
                        CEO: '1234',
                        TECNICO: '1234',
                        FINANZAS: '1234',
                        MARKETING: '1234',
                        OPERACIONES_IA: '1234',
                        AUXILIAR: '1234'
                    }
                },
                deliverables: {},
                contracts: {},
                ledger: []
            };
        } else {
            d.companies['sandbox_student'].unlockAllContracts = false;
            d.companies['sandbox_student'].classGroup = 'TEST';
            d.companies['sandbox_student'].isTestCompany = true;
            d.companies['sandbox_student'].contracts = d.companies['sandbox_student'].contracts || {};
            if (!this.getCompanyCode(d.companies['sandbox_student'])) {
                this.setCompanyCode(d.companies['sandbox_student'], 'TEST-1111', false);
            }
        }

        for(let k in d.companies) {
            let co = d.companies[k];
            if (!co) continue;
            
            co.name = co.name || k.toUpperCase();
            co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
            co.balance = this.calculateBalance(co);
            co.updatedAt = co.updatedAt || Date.now();
            co.authUpdatedAt = Number(co.authUpdatedAt) || 0;
            co.roles = co.roles || {};
            co.contracts = (co.contracts && typeof co.contracts === 'object' && !Array.isArray(co.contracts)) ? co.contracts : {};
            
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
            if (!currentPlainCode && defaultCodes[k]) {
                currentPlainCode = defaultCodes[k];
                this.setCompanyCode(co, currentPlainCode, false);
            }

            const baseRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            baseRoles.forEach(r => {
                const existingPin = this.getRolePin(co, r);
                if (existingPin && existingPin !== 'PROTECTED') {
                    this.setRolePin(co, r, existingPin, false);
                }
            });

            co.loginStats = co.loginStats || { totalLogins: 0, roles: {} };
            co.loginStats.roles = co.loginStats.roles || {};
            co.classGroup = co.classGroup || 'A';
            co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "" };
            co.brandApproval.driveUrl = co.brandApproval.driveUrl || "";
            co.brandApproval.expId = co.brandApproval.expId || "";
            co.pendingSlogan = co.pendingSlogan || null;
            co.pendingMission = co.pendingMission || null;
            co.brandStatus = co.brandStatus || 'APPROVED';
            co.auxRoleRequest = co.auxRoleRequest || { status: co.roles['AUXILIAR'] ? 'APROBADO' : 'INACTIVO', dept: co.auxRoleDept || '', pin: this.getRolePin(co, 'AUXILIAR') || '' };
            co.deliverables = co.deliverables || {};
            
            const validHojaStatuses = ['DRAFT_TECNICO', 'EN_TALLER_OPERARIO', 'DEVUELTO_A_TECNICO', 'CEO_REVISION', 'SUBMITTED_TO_CEO', 'DELIVERED_TO_TEACHER'];
            for (let docKey in defDocs) {
                if (co.deliverables[docKey] === undefined) {
                    co.deliverables[docKey] = null;
                } else if (co.deliverables[docKey] !== null) {
                    if (typeof co.deliverables[docKey] === 'string') {
                        co.deliverables[docKey] = {
                            driveUrl: co.deliverables[docKey],
                            status: 'DELIVERED_TO_TEACHER',
                            returnReasonId: null,
                            returnReason: null,
                            updatedAt: new Date().toISOString()
                        };
                    } else if (typeof co.deliverables[docKey] === 'object') {
                        if (docKey === 'hoja_taller_fyq') {
                            if (!validHojaStatuses.includes(co.deliverables[docKey].status)) {
                                co.deliverables[docKey].status = 'DRAFT_TECNICO';
                            }
                        } else if (!co.deliverables[docKey].status) {
                            co.deliverables[docKey].status = 'DELIVERED_TO_TEACHER';
                        }
                        co.deliverables[docKey].updatedAt = co.deliverables[docKey].updatedAt || new Date().toISOString();
                    }
                }
            }

            co.flightTests = (Array.isArray(co.flightTests) ? co.flightTests : []).map(f => ({
                ...f,
                naHCO3: !isNaN(Number(f?.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f?.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f?.weightG)) ? Number(f.weightG) : 0)),
                vinegar: !isNaN(Number(f?.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f?.waterMl)) ? Number(f.waterMl) : 0),
                costEurV: !isNaN(Number(f?.costEurV)) ? Number(f.costEurV) : 0,
                heightMm: !isNaN(Number(f?.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f?.heightM)) ? Number(f.heightM) * 1000 : 0),
                efficiency: !isNaN(Number(f?.efficiency)) ? Number(f.efficiency) : 0
            }));
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
            co.marketingCampaigns.forEach(c => {
                if (c && Array.isArray(c.executedActions)) {
                    c.executedActions.forEach(act => {
                        if (act) {
                            if (!act.status) act.status = 'VALIDADO_CEO';
                            act.feedback = act.feedback || '';
                            act.returnDriveUrl = act.returnDriveUrl || '';
                            act.url = act.url || act.driveUrl || '';
                            act.driveUrl = act.driveUrl || act.url || '';
                        }
                    });
                }
            });
            co.inactivityReports = Array.isArray(co.inactivityReports) ? co.inactivityReports : [];
            co.sponsorData = co.sponsorData || { name: null, tier: null, amount: 0, date: null, logo: null };
            if (co.sponsorAwarded && !co.sponsorData.tier) {
                co.sponsorData.tier = co.sponsorAwarded;
            }
            if (co.sponsorAwarded && (!co.sponsorData.amount || co.sponsorData.amount === 0) && typeof SPONSOR_TIERS_DEF !== 'undefined' && SPONSOR_TIERS_DEF[co.sponsorAwarded]) {
                co.sponsorData.amount = SPONSOR_TIERS_DEF[co.sponsorAwarded].amount;
            }
            co.auxRoleDept = co.auxRoleDept || null;
            co.notifications = Array.isArray(co.notifications) ? co.notifications : [];
            co.sanctions = Array.isArray(co.sanctions) ? co.sanctions : [];
            co.crisisAlerts = Array.isArray(co.crisisAlerts) ? co.crisisAlerts : [];
            co.executiveResolutions = Array.isArray(co.executiveResolutions) ? co.executiveResolutions : [];
        }
        return d;
    },

    mergeData(serverData, localData) {
        if (!serverData) return localData;
        if (!localData) return serverData;

        const reconcileExecutedActions = (actionsLocal, actionsServer) => {
            if (!Array.isArray(actionsLocal)) actionsLocal = [];
            if (!Array.isArray(actionsServer)) actionsServer = [];

            const serverMap = new Map();
            actionsServer.forEach(a => { if (a && a.id) serverMap.set(String(a.id), a); });

            const localMap = new Map();
            actionsLocal.forEach(a => { if (a && a.id) localMap.set(String(a.id), a); });

            const allIds = new Set([...localMap.keys(), ...serverMap.keys()]);
            const result = [];

            allIds.forEach(id => {
                const lAct = localMap.get(id);
                const sAct = serverMap.get(id);

                if (sAct && !lAct) {
                    result.push({ ...sAct });
                } else if (lAct && !sAct) {
                    result.push({ ...lAct });
                } else {
                    // Precedencia estricta: Las decisiones de servidor (VALIDADO_CEO o RECHAZADO_CEO) tienen precedencia sobre estados locales obsoletos (PENDIENTE_CEO)
                    let status = lAct.status || sAct.status || 'PENDIENTE_CEO';
                    let feedback = lAct.feedback || sAct.feedback || '';
                    let returnDriveUrl = lAct.returnDriveUrl || sAct.returnDriveUrl || '';
                    let reviewedAt = lAct.reviewedAt || sAct.reviewedAt || null;

                    if (sAct.status === 'VALIDADO_CEO' || sAct.status === 'RECHAZADO_CEO') {
                        status = sAct.status;
                        feedback = sAct.feedback || '';
                        returnDriveUrl = sAct.returnDriveUrl || '';
                        reviewedAt = sAct.reviewedAt || null;
                    } else if (lAct.status === 'VALIDADO_CEO' || lAct.status === 'RECHAZADO_CEO') {
                        status = lAct.status;
                        feedback = lAct.feedback || '';
                        returnDriveUrl = lAct.returnDriveUrl || '';
                        reviewedAt = lAct.reviewedAt || null;
                    }

                    result.push({
                        ...sAct,
                        ...lAct,
                        status,
                        feedback,
                        returnDriveUrl,
                        reviewedAt,
                        url: lAct.url || sAct.url || lAct.driveUrl || sAct.driveUrl || '',
                        driveUrl: lAct.driveUrl || sAct.driveUrl || lAct.url || sAct.url || ''
                    });
                }
            });

            return result;
        };

        // Al recibir serverData de la red:
        const localEpoch = parseInt(localStorage.getItem('marsket_reset_epoch') || '0', 10);
        const serverEpoch = serverData.resetEpoch || 0;

        if (serverEpoch > localEpoch) {
            console.warn('[SECURITY] Reset Epoch superior detectado. Destruyendo caché huérfana local.');
            
            const savedSession = localStorage.getItem('marsket_session');
            const savedRole = localStorage.getItem('marsket_user_role');
            const savedV1Session = this.sessionKey ? localStorage.getItem(this.sessionKey) : null;
            
            localStorage.clear(); // Purga masiva
            
            if (savedSession) localStorage.setItem('marsket_session', savedSession);
            if (savedRole) localStorage.setItem('marsket_user_role', savedRole);
            if (savedV1Session && this.sessionKey) localStorage.setItem(this.sessionKey, savedV1Session);
            localStorage.setItem('marsket_reset_epoch', serverEpoch.toString());
            
            // Reemplazo destructivo directo, omitiendo cualquier merge aditivo
            this.data = JSON.parse(JSON.stringify(serverData));
            this.saveToLocal();
            if (typeof ui !== 'undefined' && ui.renderAll) ui.renderAll();
            else if (typeof ui !== 'undefined' && ui.render) ui.render();
            
            return this.data; // ABORTAR ejecución posterior de mergeData
        }

        const merged = JSON.parse(JSON.stringify(serverData)); 

        // Resolución LWW para configuración y PINs docentes (evita rebote de PIN en el Claustro)
        if (localData.config) {
            merged.config = merged.config || {};
            const localCfgTime = Number(localData.config.updatedAt) || 0;
            const serverCfgTime = Number(serverData.config?.updatedAt) || 0;
            const maxBaseline = Math.max(
                Number(localData.config.scheduleBaselineVersion) || 0,
                Number(serverData.config?.scheduleBaselineVersion) || 0
            );
            if (maxBaseline > 0) {
                merged.config.scheduleBaselineVersion = maxBaseline;
            }

            if (localCfgTime > serverCfgTime) {
                merged.config.deadlines = JSON.parse(JSON.stringify(localData.config.deadlines || merged.config.deadlines || {}));
                merged.config.guidelines = JSON.parse(JSON.stringify(localData.config.guidelines || merged.config.guidelines || {}));
            }

            // Fusión granular de deliverableSchedule conservando siempre los datos más recientes por entregable
            merged.config.deliverableSchedule = merged.config.deliverableSchedule || {};
            merged.config.deadlines = merged.config.deadlines || {};
            const localSched = localData.config.deliverableSchedule || {};
            for (const dKey in localSched) {
                const lItem = localSched[dKey];
                const sItem = merged.config.deliverableSchedule[dKey];
                if (!sItem) {
                    merged.config.deliverableSchedule[dKey] = JSON.parse(JSON.stringify(lItem));
                    if (lItem?.deadline) merged.config.deadlines[dKey] = lItem.deadline;
                } else {
                    const lItemTime = Number(lItem?.updatedAt) || 0;
                    const sItemTime = Number(sItem?.updatedAt) || 0;
                    const useLocal = (lItemTime > sItemTime) || (lItemTime === 0 && sItemTime === 0 && localCfgTime > serverCfgTime);
                    if (useLocal) {
                        merged.config.deliverableSchedule[dKey] = JSON.parse(JSON.stringify(lItem));
                        if (lItem?.deadline) merged.config.deadlines[dKey] = lItem.deadline;
                    } else if (sItem?.deadline) {
                        merged.config.deadlines[dKey] = sItem.deadline;
                    }
                }
            }
            merged.config.updatedAt = Math.max(localCfgTime, serverCfgTime);
            if (localData.config.teachers) {
                merged.config.teachers = merged.config.teachers || {};
                for (let tk in localData.config.teachers) {
                    const lT = localData.config.teachers[tk];
                    const sT = merged.config.teachers[tk];
                    if (sT && lT) {
                        // NUNCA sobreescribir un PIN existente en el cliente con valores nulos o undefined de la sanitización
                        if (lT.pin && !sT.pin) {
                            sT.pin = lT.pin;
                            sT.pinUpdatedAt = lT.pinUpdatedAt || sT.pinUpdatedAt;
                        } else if ((lT.pinUpdatedAt || 0) > (sT.pinUpdatedAt || 0) && lT.pin) {
                            sT.pin = lT.pin;
                            sT.pinUpdatedAt = lT.pinUpdatedAt;
                        }
                    } else if (lT && !sT) {
                        merged.config.teachers[tk] = JSON.parse(JSON.stringify(lT));
                    }
                }
            }
        }
        
        const allDeletedCompanyIds = new Set([
            ...(Array.isArray(serverData.deletedCompanyIds) ? serverData.deletedCompanyIds.map(String) : []),
            ...(Array.isArray(localData.deletedCompanyIds) ? localData.deletedCompanyIds.map(String) : [])
        ]);
        merged.deletedCompanyIds = Array.from(allDeletedCompanyIds);
        allDeletedCompanyIds.forEach(delId => {
            delete merged.companies[delId];
        });

        for (let k in localData.companies) {
            if (allDeletedCompanyIds.has(k)) continue;
            const sCo = merged.companies[k];
            const lCo = localData.companies[k];
            
            if (sCo && lCo) {
                const sTime = sCo.updatedAt || 0;
                const lTime = lCo.updatedAt || 0;
                const sAuthTime = sCo.authUpdatedAt || 0;
                const lAuthTime = lCo.authUpdatedAt || 0;

                // Protección de memoria local: nunca sobreescribir secretos con nulos de la sanitización
                if (lCo.authVault && lCo.authVault.code) {
                    if (!sCo.authVault || !sCo.authVault.code || lAuthTime >= sAuthTime) {
                        sCo.authVault = JSON.parse(JSON.stringify(lCo.authVault));
                        sCo.roles = JSON.parse(JSON.stringify(lCo.roles || {}));
                        sCo.accessCode = lCo.accessCode || '';
                        sCo.authUpdatedAt = Math.max(lAuthTime, sAuthTime);
                    }
                } else if (lCo.roles && Object.keys(lCo.roles).length > 0) {
                    if (!sCo.roles || Object.keys(sCo.roles).length === 0) {
                        sCo.roles = JSON.parse(JSON.stringify(lCo.roles));
                    }
                }
                if (lCo.accessCode && !sCo.accessCode) {
                    sCo.accessCode = lCo.accessCode;
                }
                
                if (lTime > sTime) {
                    merged.companies[k] = JSON.parse(JSON.stringify(lCo));
                    if (sAuthTime > lAuthTime && sCo.authVault && sCo.authVault.code) {
                        merged.companies[k].authVault = JSON.parse(JSON.stringify(sCo.authVault));
                        merged.companies[k].roles = JSON.parse(JSON.stringify(sCo.roles || {}));
                        merged.companies[k].auxRoleDept = sCo.auxRoleDept || null;
                        if (sCo.auxRoleRequest) {
                            merged.companies[k].auxRoleRequest = JSON.parse(JSON.stringify(sCo.auxRoleRequest));
                        }
                        merged.companies[k].authUpdatedAt = sAuthTime;
                    }
                    // Preservar siempre calificaciones docentes usando Last-Write-Wins (LWW) por asignatura
                    if (sCo.grades) {
                        merged.companies[k].grades = merged.companies[k].grades || {};
                        for (const subj in sCo.grades) {
                            const sG = sCo.grades[subj];
                            const lG = merged.companies[k].grades[subj];
                            if (sG && sG.final !== undefined && sG.final !== null) {
                                const sGTime = Number(sG.updatedAt) || sTime;
                                const lGTime = Number(lG?.updatedAt) || lTime;
                                if (!lG || sGTime >= lGTime) {
                                    merged.companies[k].grades[subj] = JSON.parse(JSON.stringify(sG));
                                }
                            }
                        }
                    }
                    // Preservar asignación docente de patrocinio si el servidor la tiene
                    if (sCo.sponsorAwarded) {
                        const sSpDate = sCo.sponsorData?.date || 0;
                        const lSpDate = lCo.sponsorData?.date || 0;
                        if (!lCo.sponsorAwarded || sSpDate >= lSpDate) {
                            merged.companies[k].sponsorAwarded = sCo.sponsorAwarded;
                            merged.companies[k].sponsorData = JSON.parse(JSON.stringify(sCo.sponsorData || {}));
                        }
                    }
                    // Fusión de estadísticas de login (Math.max para evitar pérdidas de telemetría entre sesiones)
                    const sStats = sCo.loginStats || { totalLogins: 0, roles: {} };
                    const lStats = lCo.loginStats || { totalLogins: 0, roles: {} };
                    const mergedLoginStats = {
                        totalLogins: Math.max(Number(sStats.totalLogins) || 0, Number(lStats.totalLogins) || 0),
                        roles: {}
                    };
                    const allLoginRoles = new Set([...Object.keys(sStats.roles || {}), ...Object.keys(lStats.roles || {})]);
                    allLoginRoles.forEach(r => {
                        const sR = sStats.roles?.[r] || { count: 0, lastLogin: null };
                        const lR = lStats.roles?.[r] || { count: 0, lastLogin: null };
                        mergedLoginStats.roles[r] = {
                            count: Math.max(Number(sR.count) || 0, Number(lR.count) || 0),
                            lastLogin: (sR.lastLogin && lR.lastLogin)
                                ? (new Date(sR.lastLogin) > new Date(lR.lastLogin) ? sR.lastLogin : lR.lastLogin)
                                : (sR.lastLogin || lR.lastLogin || null)
                        };
                    });
                    merged.companies[k].loginStats = mergedLoginStats;

                    // Fusión de entregables: no pisar entregables docentes ni estados más recientes
                    merged.companies[k].deliverables = merged.companies[k].deliverables || {};
                    if (sCo.deliverables) {
                        for (const dKey in sCo.deliverables) {
                            const sDoc = sCo.deliverables[dKey];
                            const lDoc = merged.companies[k].deliverables[dKey];
                            if (!lDoc && sDoc) {
                                merged.companies[k].deliverables[dKey] = JSON.parse(JSON.stringify(sDoc));
                            } else if (sDoc && lDoc) {
                                const sDocTime = new Date(sDoc.updatedAt || 0).getTime();
                                const lDocTime = new Date(lDoc.updatedAt || 0).getTime();
                                if (sDocTime >= lDocTime) {
                                    merged.companies[k].deliverables[dKey] = JSON.parse(JSON.stringify(sDoc));
                                }
                            }
                        }
                    }
                    const mergeArraysLocalDominant = (arrLocal, arrServer, arrName = '') => {
                        if (!Array.isArray(arrLocal)) arrLocal = [];
                        if (!Array.isArray(arrServer)) arrServer = [];
                        const serverMap = new Map();
                        arrServer.forEach(i => { if (i && i.id) serverMap.set(String(i.id), i); });
                        
                        const mergedLocal = arrLocal.map(lItem => {
                            if (!lItem || !lItem.id) return lItem;
                            const sItem = serverMap.get(String(lItem.id));
                            if (!sItem) return lItem;
                            const isRead = Boolean(lItem.read || sItem.read);
                            const mergedReadBy = (lItem.readBy || sItem.readBy)
                                ? { ...(sItem.readBy || {}), ...(lItem.readBy || {}) }
                                : undefined;
                            let status = lItem.status;
                            if (lItem.status === 'PENDIENTE' && sItem.status && sItem.status !== 'PENDIENTE') {
                                status = sItem.status;
                            }
                            let executedActions = lItem.executedActions;
                            if (arrName === 'marketingCampaigns' || lItem.executedActions || sItem.executedActions) {
                                executedActions = reconcileExecutedActions(lItem.executedActions, sItem.executedActions);
                            }
                            return { ...sItem, ...lItem, read: isRead, ...(mergedReadBy ? { readBy: mergedReadBy } : {}), status: status || lItem.status, ...(executedActions ? { executedActions } : {}) };
                        });
                        const localIds = new Set(arrLocal.map(i => String(i?.id)));
                        const missingInLocal = arrServer.filter(i => i && i.id && !localIds.has(String(i.id)));
                        let finalMerged = [...mergedLocal, ...missingInLocal];
                        if (arrName === 'notifications') {
                            const dismissedIds = new Set([
                                ...(Array.isArray(serverData.dismissedNotificationIds) ? serverData.dismissedNotificationIds.map(String) : []),
                                ...(Array.isArray(localData.dismissedNotificationIds) ? localData.dismissedNotificationIds.map(String) : [])
                            ]);
                            finalMerged = finalMerged.filter(n => n && n.id && !dismissedIds.has(String(n.id)));
                        }
                        return finalMerged;
                    };
                    const arraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'executiveResolutions', 'cart', 'bom', 'coordinatorReports'];
                    const sResetAt = Number(sCo.resetAt) || 0;
                    const lResetAt = Number(lCo.resetAt) || 0;
                    const isTestCo = (k === 'sandbox_master' || k === 'sandbox_student' || merged.companies[k].isTestCompany);
                    if (isTestCo && (lResetAt > sTime || sResetAt > lTime)) {
                        merged.companies[k].resetAt = Math.max(sResetAt, lResetAt);
                        if (lResetAt >= sResetAt) {
                            arraysToMerge.forEach(arrName => {
                                merged.companies[k][arrName] = Array.isArray(lCo[arrName]) ? JSON.parse(JSON.stringify(lCo[arrName])) : [];
                            });
                            merged.companies[k].deliverables = JSON.parse(JSON.stringify(lCo.deliverables || {}));
                            merged.companies[k].contracts = JSON.parse(JSON.stringify(lCo.contracts || {}));
                            merged.companies[k].grades = JSON.parse(JSON.stringify(lCo.grades || {}));
                        } else {
                            arraysToMerge.forEach(arrName => {
                                merged.companies[k][arrName] = Array.isArray(sCo[arrName]) ? JSON.parse(JSON.stringify(sCo[arrName])) : [];
                            });
                            merged.companies[k].deliverables = JSON.parse(JSON.stringify(sCo.deliverables || {}));
                            merged.companies[k].contracts = JSON.parse(JSON.stringify(sCo.contracts || {}));
                            merged.companies[k].grades = JSON.parse(JSON.stringify(sCo.grades || {}));
                        }
                    } else {
                        arraysToMerge.forEach(arrName => {
                            merged.companies[k][arrName] = mergeArraysLocalDominant(lCo[arrName], sCo[arrName], arrName);
                        });
                    }
                    merged.companies[k].balance = this.calculateBalance(merged.companies[k]);
                    if (lCo.nameChangeRequest && sCo.nameChangeRequest) {
                        const lReq = lCo.nameChangeRequest;
                        const sReq = sCo.nameChangeRequest;
                        if (lReq.status === 'PENDIENTE' && sReq.status !== 'PENDIENTE') {
                            merged.companies[k].nameChangeRequest = JSON.parse(JSON.stringify(sReq));
                        }
                    }
                    if (merged.companies[k].nameChangeRequest?.status === 'APROBADO' && merged.companies[k].nameChangeRequest.proposedName) {
                        merged.companies[k].name = merged.companies[k].nameChangeRequest.proposedName;
                    }
                } else {
                    if (lAuthTime > sAuthTime) {
                        if (lCo.authVault) sCo.authVault = JSON.parse(JSON.stringify(lCo.authVault));
                        if (lCo.roles) sCo.roles = JSON.parse(JSON.stringify(lCo.roles || {}));
                        sCo.auxRoleDept = lCo.auxRoleDept || null;
                        if (lCo.auxRoleRequest) {
                            sCo.auxRoleRequest = JSON.parse(JSON.stringify(lCo.auxRoleRequest));
                        }
                        sCo.authUpdatedAt = lAuthTime;
                    }
                    // Preservar resolución de solicitudes de cambio de nombre frente a estados pendientes desactualizados
                    if (lCo.nameChangeRequest) {
                        const lSt = lCo.nameChangeRequest.status;
                        const sSt = sCo.nameChangeRequest ? sCo.nameChangeRequest.status : null;
                        if (!sSt || (sSt === 'PENDIENTE' && lSt && lSt !== 'PENDIENTE') || (lCo.nameChangeRequest.updatedAt || 0) > (sCo.nameChangeRequest?.updatedAt || 0)) {
                            sCo.nameChangeRequest = JSON.parse(JSON.stringify(lCo.nameChangeRequest));
                        }
                    }
                    if (sCo.nameChangeRequest?.status === 'APROBADO' && sCo.nameChangeRequest.proposedName) {
                        sCo.name = sCo.nameChangeRequest.proposedName;
                    }
                    if (lCo.brandApproval) {
                        const lSt = lCo.brandApproval.status;
                        const sSt = sCo.brandApproval ? sCo.brandApproval.status : null;
                        if (!sSt || (sSt === 'PENDIENTE' && lSt && lSt !== 'PENDIENTE') || (lCo.brandApproval.updatedAt || 0) > (sCo.brandApproval?.updatedAt || 0)) {
                            sCo.brandApproval = JSON.parse(JSON.stringify(lCo.brandApproval));
                        }
                    }
                    if (lCo.auxRoleRequest) {
                        const lSt = lCo.auxRoleRequest.status;
                        const sSt = sCo.auxRoleRequest ? sCo.auxRoleRequest.status : null;
                        if (!sSt || (sSt === 'PENDIENTE' && lSt && lSt !== 'PENDIENTE') || (lCo.auxRoleRequest.updatedAt || 0) > (sCo.auxRoleRequest?.updatedAt || 0)) {
                            sCo.auxRoleRequest = JSON.parse(JSON.stringify(lCo.auxRoleRequest));
                        }
                    }
                    // Preservar calificaciones locales si son más recientes o el servidor no las tiene (LWW)
                    if (lCo.grades) {
                        sCo.grades = sCo.grades || {};
                        for (const subj in lCo.grades) {
                            const lG = lCo.grades[subj];
                            const sG = sCo.grades[subj];
                            if (lG && lG.final !== undefined && lG.final !== null) {
                                const lGTime = Number(lG.updatedAt) || lTime;
                                const sGTime = Number(sG?.updatedAt) || sTime;
                                if (!sG || lGTime >= sGTime) {
                                    sCo.grades[subj] = JSON.parse(JSON.stringify(lG));
                                }
                            }
                        }
                    }
                    // Preservar patrocinio local si fuera posterior
                    if (lCo.sponsorAwarded && (!sCo.sponsorAwarded || (lCo.sponsorData?.date || 0) > (sCo.sponsorData?.date || 0))) {
                        sCo.sponsorAwarded = lCo.sponsorAwarded;
                        sCo.sponsorData = JSON.parse(JSON.stringify(lCo.sponsorData || {}));
                    }
                    // Preservar entregables locales si no están en servidor o tienen entrega más reciente
                    sCo.deliverables = sCo.deliverables || {};
                    if (lCo.deliverables) {
                        for (const dKey in lCo.deliverables) {
                            const lDoc = lCo.deliverables[dKey];
                            const sDoc = sCo.deliverables[dKey];
                            if (!sDoc && lDoc) {
                                sCo.deliverables[dKey] = JSON.parse(JSON.stringify(lDoc));
                            } else if (lDoc && sDoc) {
                                const lDocTime = new Date(lDoc.updatedAt || 0).getTime();
                                const sDocTime = new Date(sDoc.updatedAt || 0).getTime();
                                if (lDocTime > sDocTime) {
                                    sCo.deliverables[dKey] = JSON.parse(JSON.stringify(lDoc));
                                }
                            }
                        }
                    }
                    const mergeArrays = (arrServer, arrLocal, arrName = '') => {
                        if (!Array.isArray(arrServer)) arrServer = [];
                        if (!Array.isArray(arrLocal)) arrLocal = [];
                        const localMap = new Map();
                        arrLocal.forEach(i => { if (i && i.id) localMap.set(String(i.id), i); });
                        
                        const mergedServer = arrServer.map(sItem => {
                            if (!sItem || !sItem.id) return sItem;
                            const lItem = localMap.get(String(sItem.id));
                            if (!lItem) return sItem;
                            
                            // Preservar estado leído de notificaciones (una vez leída, nunca vuelve a no leída)
                            const isRead = Boolean(sItem.read || lItem.read);
                            const mergedReadBy = (sItem.readBy || lItem.readBy)
                                ? { ...(sItem.readBy || {}), ...(lItem.readBy || {}) }
                                : undefined;
                            let status = sItem.status;
                            if (sItem.status === 'PENDIENTE' && lItem.status && lItem.status !== 'PENDIENTE') {
                                status = lItem.status;
                            }
                            let executedActions = sItem.executedActions;
                            if (arrName === 'marketingCampaigns' || sItem.executedActions || lItem.executedActions) {
                                executedActions = reconcileExecutedActions(lItem.executedActions, sItem.executedActions);
                            }
                            return { ...sItem, ...lItem, read: isRead, ...(mergedReadBy ? { readBy: mergedReadBy } : {}), status: status || sItem.status, ...(executedActions ? { executedActions } : {}) };
                        });
                        
                        const serverIds = new Set(arrServer.map(i => String(i?.id)));
                        const missingInServer = arrLocal.filter(i => i && i.id && !serverIds.has(String(i.id)));
                        let finalMerged = [...missingInServer, ...mergedServer];
                        if (arrName === 'notifications') {
                            const dismissedIds = new Set([
                                ...(Array.isArray(serverData.dismissedNotificationIds) ? serverData.dismissedNotificationIds.map(String) : []),
                                ...(Array.isArray(localData.dismissedNotificationIds) ? localData.dismissedNotificationIds.map(String) : [])
                            ]);
                            finalMerged = finalMerged.filter(n => n && n.id && !dismissedIds.has(String(n.id)));
                        }
                        return finalMerged;
                    };

                    const arraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'executiveResolutions', 'cart', 'bom', 'coordinatorReports'];
                    const sResetAt = Number(sCo.resetAt) || 0;
                    const lResetAt = Number(lCo.resetAt) || 0;
                    const isTestCo = (k === 'sandbox_master' || k === 'sandbox_student' || sCo.isTestCompany);
                    if (isTestCo && (sResetAt > lTime || lResetAt > sTime)) {
                        sCo.resetAt = Math.max(sResetAt, lResetAt);
                        if (sResetAt >= lResetAt) {
                            arraysToMerge.forEach(arrName => {
                                sCo[arrName] = Array.isArray(sCo[arrName]) ? JSON.parse(JSON.stringify(sCo[arrName])) : [];
                            });
                            sCo.deliverables = JSON.parse(JSON.stringify(sCo.deliverables || {}));
                            sCo.contracts = JSON.parse(JSON.stringify(sCo.contracts || {}));
                            sCo.grades = JSON.parse(JSON.stringify(sCo.grades || {}));
                        } else {
                            arraysToMerge.forEach(arrName => {
                                sCo[arrName] = Array.isArray(lCo[arrName]) ? JSON.parse(JSON.stringify(lCo[arrName])) : [];
                            });
                            sCo.deliverables = JSON.parse(JSON.stringify(lCo.deliverables || {}));
                            sCo.contracts = JSON.parse(JSON.stringify(lCo.contracts || {}));
                            sCo.grades = JSON.parse(JSON.stringify(lCo.grades || {}));
                        }
                    } else {
                        arraysToMerge.forEach(arrName => {
                            sCo[arrName] = mergeArrays(sCo[arrName], lCo[arrName], arrName);
                        });
                    }
                    sCo.balance = this.calculateBalance(sCo);
                }

                // Conciliación de contratos comerciales por fase con Last-Write-Wins (LWW)
                const targetCo = merged.companies[k] || sCo;
                if (targetCo) {
                    const sCont = (sCo?.contracts && typeof sCo.contracts === 'object') ? sCo.contracts : {};
                    const lCont = (lCo?.contracts && typeof lCo.contracts === 'object') ? lCo.contracts : {};
                    targetCo.contracts = { ...sCont, ...lCont };
                    ['I', 'II', 'III', 'IV'].forEach(ph => {
                        const sC = sCont[ph];
                        const lC = lCont[ph];
                        if (sC && lC) {
                            const sTime = Number(sC.settledAt || sC.signedAt) || 0;
                            const lTime = Number(lC.settledAt || lC.signedAt) || 0;
                            targetCo.contracts[ph] = (lTime >= sTime) ? JSON.parse(JSON.stringify(lC)) : JSON.parse(JSON.stringify(sC));
                        } else if (lC) {
                            targetCo.contracts[ph] = JSON.parse(JSON.stringify(lC));
                        } else if (sC) {
                            targetCo.contracts[ph] = JSON.parse(JSON.stringify(sC));
                        }
                    });
                }
            } else if (lCo && !sCo && !localData._deletedCompanies?.[k]) {
                merged.companies[k] = lCo;
                merged.companies[k].balance = this.calculateBalance(merged.companies[k]);
            }
        }
        
        const mergeArraysGlobal = (arrS, arrL) => {
            if(!Array.isArray(arrS)) arrS = [];
            if(!Array.isArray(arrL)) arrL = [];
            const localMap = new Map();
            arrL.forEach(i => {
                const id = String(i?.id || i?.sessionId || '');
                if (id) localMap.set(id, i);
            });
            const mergedGlobal = arrS.map(sItem => {
                const id = String(sItem?.id || sItem?.sessionId || '');
                if (!id) return sItem;
                const lItem = localMap.get(id);
                if (!lItem) return sItem;
                const isResolved = Boolean(sItem.resolved || lItem.resolved);
                let status = sItem.status;
                if (sItem.status && sItem.status.includes('PENDIENTE') && lItem.status && !lItem.status.includes('PENDIENTE')) {
                    status = lItem.status;
                } else if (sItem.status === 'EN_VENTA' && (lItem.status === 'EN_ADUANA' || lItem.status === 'VENDIDO')) {
                    status = lItem.status;
                } else if (sItem.status === 'EN_ADUANA' && lItem.status === 'VENDIDO') {
                    status = lItem.status;
                } else if (lItem.updatedAt && sItem.updatedAt && lItem.updatedAt > sItem.updatedAt && lItem.status) {
                    status = lItem.status;
                }
                // Si sItem tiene un updatedAt más reciente que lItem, el servidor manda (LWW)
                if ((sItem.updatedAt || 0) > (lItem.updatedAt || 0)) {
                    return { ...lItem, ...sItem, resolved: isResolved, status: status || sItem.status };
                }
                return { ...sItem, ...lItem, resolved: isResolved, status: status || sItem.status };
            });
            const ids = new Set(arrS.map(i => String(i?.id || i?.sessionId)));
            const missing = arrL.filter(i => i && (i.id || i.sessionId) && !ids.has(String(i.id || i.sessionId)));
            return [...missing, ...mergedGlobal];
        };

        if (localData.telemetry && localData.telemetry.sessions) {
            merged.telemetry = merged.telemetry || { sessions: [] };
            merged.telemetry.sessions = mergeArraysGlobal(merged.telemetry.sessions, localData.telemetry.sessions);
            merged.telemetry.totalLogins = Math.max(merged.telemetry.totalLogins || 0, localData.telemetry.totalLogins || 0);
        }
        
        const allDeletedSuggestionIds = new Set([
            ...(Array.isArray(serverData.deletedSuggestionIds) ? serverData.deletedSuggestionIds.map(String) : []),
            ...(Array.isArray(localData.deletedSuggestionIds) ? localData.deletedSuggestionIds.map(String) : [])
        ]);
        merged.deletedSuggestionIds = Array.from(allDeletedSuggestionIds);

        const allDismissedNotificationIds = new Set([
            ...(Array.isArray(serverData.dismissedNotificationIds) ? serverData.dismissedNotificationIds.map(String) : []),
            ...(Array.isArray(localData.dismissedNotificationIds) ? localData.dismissedNotificationIds.map(String) : [])
        ]);
        merged.dismissedNotificationIds = Array.from(allDismissedNotificationIds);

        const allDeletedOfficialNewsIds = new Set([
            ...(Array.isArray(serverData.deletedOfficialNewsIds) ? serverData.deletedOfficialNewsIds.map(String) : []),
            ...(Array.isArray(localData.deletedOfficialNewsIds) ? localData.deletedOfficialNewsIds.map(String) : [])
        ]);
        merged.deletedOfficialNewsIds = Array.from(allDeletedOfficialNewsIds);

        merged.officialNews = mergeArraysGlobal(merged.officialNews, localData.officialNews)
            .filter(n => n && n.id && !allDeletedOfficialNewsIds.has(String(n.id)));
        merged.pressReleases = mergeArraysGlobal(merged.pressReleases, localData.pressReleases)
            .filter(pr => pr && !allDeletedCompanyIds.has(String(pr.coId)) && !allDeletedCompanyIds.has(String(pr.authorCoId)));
        merged.suggestionsToAlex = mergeArraysGlobal(merged.suggestionsToAlex, localData.suggestionsToAlex)
            .filter(s => s && s.id && !allDeletedSuggestionIds.has(String(s.id)) && !allDeletedCompanyIds.has(String(s.coId)));
        merged.pendingCustom = mergeArraysGlobal(merged.pendingCustom, localData.pendingCustom)
            .filter(p => p && !allDeletedCompanyIds.has(String(p.coId)));
        merged.b2bMarket = mergeArraysGlobal(merged.b2bMarket, localData.b2bMarket)
            .filter(i => i && !allDeletedCompanyIds.has(String(i.sellerCoId)));
        merged.b2bContracts = mergeArraysGlobal(merged.b2bContracts, localData.b2bContracts)
            .filter(c => c && !allDeletedCompanyIds.has(String(c.sellerCoId)) && !allDeletedCompanyIds.has(String(c.buyerCoId)));
        merged.securityIncidents = mergeArraysGlobal(merged.securityIncidents, localData.securityIncidents);

        if (Array.isArray(localData.catalog) && Array.isArray(merged.catalog)) {
            const deletedIds = new Set(this.getDeletedCatalogItems ? this.getDeletedCatalogItems() : []);
            const localMap = new Map();
            localData.catalog.forEach(item => {
                if (item && item.id && !deletedIds.has(String(item.id))) {
                    localMap.set(String(item.id), item);
                }
            });
            merged.catalog = merged.catalog
                .filter(sItem => sItem && sItem.id && !deletedIds.has(String(sItem.id)))
                .map(sItem => {
                    const lItem = localMap.get(String(sItem.id));
                    if (!lItem) return sItem;
                    return { ...sItem, price: lItem.price !== undefined ? lItem.price : sItem.price };
                });
        }

        return merged;
    },

    getEffectiveRole(user = this.user, co = null) {
        if (!user || !user.role) return '';
        const rawRole = String(user.role).toUpperCase();
        if (user.admin) return rawRole;
        const company = co || (user.coId ? this.data?.companies?.[user.coId] : null);
        if (rawRole === 'AUXILIAR' || rawRole === 'SECRETARIO') {
            const linkedDept = company?.auxRoleDept ? String(company.auxRoleDept).toUpperCase() : '';
            if (linkedDept === 'OPERACIONES') return 'OPERACIONES_IA';
            return linkedDept || 'AUXILIAR';
        }
        if (rawRole === 'OPERACIONES') return 'OPERACIONES_IA';
        return rawRole;
    },

    verifySessionIntegrity(serverOrMergedData = this.data) {
        if (!this.user) return true;

        // 1. Comprobar expiración de la sesión (8 horas)
        if (this.user.exp && this.user.exp < Date.now()) {
            this.revokeSession("Sesión finalizada: El tiempo de autorización de misión (8 horas) ha expirado.");
            return false;
        }

        // 2. Comprobar que la entidad siga existiendo en el estado del servidor
        const teacherRoles = ['FYQ', 'ECO', 'BIO', 'MAT', 'LEN', 'ING', 'LYE'];
        const isDocente = Boolean(this.user.admin || (this.user.role && (teacherRoles.includes(this.user.role) || this.user.role.startsWith('COORD_'))));
        const isEntityValid = isDocente
            ? !!(serverOrMergedData?.config?.teachers?.[this.user.role] || this.user.admin)
            : !!(serverOrMergedData?.companies?.[this.user.coId]);

        if (!isEntityValid) {
            this.revokeSession("Sesión finalizada: La entidad o puesto asignado ya no existe.");
            return false;
        }

        // 3. Comprobar si Coordinación modificó las credenciales después del inicio de sesión
        if (isDocente) {
            const serverPinStamp = serverOrMergedData?.config?.teachers?.[this.user.role]?.pinUpdatedAt || 0;
            if (this.user.pinStamp && serverPinStamp > this.user.pinStamp) {
                this.revokeSession("Sesión finalizada: Las credenciales de acceso han sido modificadas por coordinación.");
                return false;
            }
        } else {
            const serverAuthStamp = serverOrMergedData?.companies?.[this.user.coId]?.authUpdatedAt || 0;
            if (this.user.authStamp && serverAuthStamp > this.user.authStamp) {
                this.revokeSession("Sesión finalizada: Las credenciales de acceso han sido modificadas por coordinación.");
                return false;
            }
        }

        return true;
    },

    revokeSession(reason) {
        clearTimeout(this.syncTimer);
        this.user = null;
        this.currentUser = null;
        this.pin = '';
        this.lastETag = null;
        this.lastCompanyETag = null;
        this._adminCredentialsFetched = false;
        if (typeof auth !== 'undefined') auth.verifiedCoId = null;
        try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        try { sessionStorage.removeItem(this.sessionKey); } catch(e) {}
        try { sessionStorage.clear(); } catch(e) {}
        if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
            ui.setHUDVisibility(false);
        }
        if (typeof ui !== 'undefined') {
            ui.current = 'login';
            if (typeof ui.renderLogin === 'function') ui.renderLogin();
            else if (typeof ui.render === 'function') ui.render();
            if (typeof ui.showModal === 'function' && reason) {
                ui.showModal(
                    "ALERTA DE SEGURIDAD // SESIÓN REVOCADA",
                    `<p class="text-xs sm:text-sm text-mars-magenta font-bold leading-relaxed">${ui.escapeHTML(reason)}</p>`,
                    ""
                );
            }
        }
    },

    setOfflineContainment(active) {
        this.isOfflineContained = !!active;
        if (typeof ui !== 'undefined' && typeof ui.setOfflineContainment === 'function') {
            ui.setOfflineContainment(this.isOfflineContained);
        }
    },

    async updatePin(coId, role, newPin) {
        const co = this.data.companies?.[coId];
        if (!co) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const clean = String(newPin || '').trim();
        this.setRolePin(co, role, clean, true);
        if (role === 'AUXILIAR' && co.auxRoleRequest) {
            co.auxRoleRequest.pin = clean;
            if (!clean) co.auxRoleRequest.status = 'INACTIVO';
        }
        this.data.lastUpdated = Date.now();

        if (this.user && !this.user.admin && this.user.coId === coId && this.user.role === role) {
            const refreshed = { ...this.user, authToken: this.getAuthToken(this.user, this.data) };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'company', id: coId, role, newPin: clean })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    this.data.version = resJson.newVersion;
                    this.lastETag = 'W/"v-' + resJson.newVersion + '"';
                    this.saveLocalOnly();
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PIN en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },
    async updateCompanyPins(coId, newPins) {
        const co = this.data.companies?.[coId];
        if (!co || !newPins || typeof newPins !== 'object') return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;

        const cleanMap = {};
        for (const role in newPins) {
            const clean = String(newPins[role] || '').trim();
            if (/^\d{4}$/.test(clean)) {
                cleanMap[role] = clean;
                this.setRolePin(co, role, clean, true);
                if (role === 'AUXILIAR' && co.auxRoleRequest) {
                    co.auxRoleRequest.pin = clean;
                    co.auxRoleRequest.status = 'APROBADO';
                }
            }
        }
        this.data.lastUpdated = Date.now();
        this.saveLocalOnly();

        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'company', id: coId, roles: cleanMap })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    this.data.version = resJson.newVersion;
                    this.lastETag = 'W/"v-' + resJson.newVersion + '"';
                    this.saveLocalOnly();
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PINs por lote en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async updateTeacherPin(teacherKey, newPin) {
        const t = this.data.config?.teachers?.[teacherKey];
        if (!t) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const now = Date.now();
        const clean = String(newPin || '').trim();
        t.pin = clean;
        t.pinUpdatedAt = now;
        this.data.config.updatedAt = now;
        this.data.lastUpdated = now;

        // Blindaje del Coordinador Activo: si edita su propio PIN, refresca su authToken en el mismo ciclo
        if (this.user && this.user.admin && this.user.role === teacherKey) {
            const refreshed = { ...this.user, authToken: this.getAuthToken(this.user, this.data) };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'teacher', id: teacherKey, newPin: clean })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    this.data.version = resJson.newVersion;
                    this.lastETag = 'W/"v-' + resJson.newVersion + '"';
                    this.saveLocalOnly();
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PIN docente en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async updateCompanyCode(coId, newCode) {
        const co = this.data.companies?.[coId];
        if (!co) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const clean = String(newCode || '').trim().toUpperCase();
        this.setCompanyCode(co, clean, true);
        this.data.lastUpdated = Date.now();

        if (this.user && !this.user.admin && this.user.coId === coId) {
            const refreshed = { ...this.user, authToken: this.getAuthToken(this.user, this.data) };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'company', id: coId, newCode: clean, newPin: clean })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    this.data.version = resJson.newVersion;
                    this.lastETag = 'W/"v-' + resJson.newVersion + '"';
                    this.saveLocalOnly();
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar código de empresa en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async fetchAdminCredentials() {
        if (!this.user || !this.user.admin || !this.user.role || !this.user.role.startsWith('COORD')) {
            return false;
        }
        const token = this.getAuthToken(this.user, this.data);
        if (!token) return false;

        try {
            const res = await fetch('/api/admin/credentials', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                }
            });
            if (!res.ok) return false;
            const creds = await res.json().catch(() => null);
            if (!creds || typeof creds !== 'object') return false;

            // Hidratar PINs docentes
            if (creds.teachers && this.data.config) {
                this.data.config.teachers = this.data.config.teachers || {};
                for (const tKey in creds.teachers) {
                    if (this.data.config.teachers[tKey]) {
                        this.data.config.teachers[tKey].pin = creds.teachers[tKey].pin;
                        if (creds.teachers[tKey].pinUpdatedAt) {
                            this.data.config.teachers[tKey].pinUpdatedAt = creds.teachers[tKey].pinUpdatedAt;
                        }
                    } else {
                        this.data.config.teachers[tKey] = creds.teachers[tKey];
                    }
                }
            }

            // Hidratar Códigos de Empresa y PINs departamentales
            if (creds.companies && this.data.companies) {
                for (const cKey in creds.companies) {
                    const sCred = creds.companies[cKey];
                    const lCo = this.data.companies[cKey];
                    if (lCo && sCred) {
                        if (sCred.accessCode) {
                            this.setCompanyCode(lCo, sCred.accessCode, false);
                        }
                        if (sCred.roles && typeof sCred.roles === 'object') {
                            for (const r in sCred.roles) {
                                if (sCred.roles[r]) {
                                    this.setRolePin(lCo, r, sCred.roles[r], false);
                                }
                            }
                        }
                        if (sCred.auxRoleDept) {
                            lCo.auxRoleDept = sCred.auxRoleDept;
                        }
                    }
                }
            }
            this._adminCredentialsFetched = true;
            this.saveLocalOnly();
            // No sobreescribir this.lastETag: reservado exclusivamente para la reconciliación global /api/state
            if (typeof ui !== 'undefined' && ui.adminTab === 'startups' && typeof ui.renderAdminStartups === 'function') {
                const subContainer = document.getElementById('admin-subtab-container');
                if (subContainer) subContainer.innerHTML = ui.renderAdminStartups();
            }
            return true;
        } catch(e) {
            console.warn("[STATE] fetchAdminCredentials falló:", e);
            return false;
        }
    },

    async init() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            const raw = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.data = this.migrate(raw);
            this.saveLocalOnly();
        } catch (err) {
            console.error("Error migrando datos locales:", err);
            this.data = this.migrate(JSON.parse(JSON.stringify(DEFAULT_STATE)));
        }

        // G4a: Eliminar auto-asignación de tokens en state.init().
        // La sesión transitoria reside en sessionStorage con prueba criptográfica SHA-256 (authProof) y exp (8 h).
        // Se limpia cualquier sesión residual en localStorage para impedir suplantación offline persistente.
        try { localStorage.removeItem(this.sessionKey); } catch (e) {}

        const savedSession = sessionStorage.getItem(this.sessionKey);
        if (savedSession) {
            try {
                const sessionUser = JSON.parse(savedSession);
                const now = Date.now();

                // 1. Validar expiración (8 h) y presencia obligatoria de prueba
                if (!sessionUser || !sessionUser.exp || sessionUser.exp < now || !sessionUser.authProof) {
                    throw new Error("Sesión expirada o sin prueba de autorización");
                }

                // 2. Extraer credencial vigente del estado actual si está disponible en memoria local
                let credencialVigente = '';
                if (sessionUser.admin) {
                    credencialVigente = this.data.config?.teachers?.[sessionUser.role]?.pin || '';
                } else if (sessionUser.coId && this.data.companies?.[sessionUser.coId]) {
                    const co = this.data.companies[sessionUser.coId];
                    credencialVigente = this.getRolePin(co, sessionUser.role) || '';
                }

                // 3. Si la credencial está disponible localmente, validar prueba criptográfica
                if (credencialVigente) {
                    const expectedProof = (typeof auth !== 'undefined' && typeof auth.generateAuthProof === 'function')
                        ? await auth.generateAuthProof(sessionUser.role, sessionUser.coId, sessionUser.exp, credencialVigente)
                        : null;

                    if (!expectedProof || sessionUser.authProof !== expectedProof) {
                        throw new Error("Fallo de integridad criptográfica en la prueba de sesión");
                    }
                }

                // Sesión legítima validada
                this.user = Object.freeze(sessionUser);
                this.currentUser = this.user;
                if (this.user.admin && this.user.role && this.user.role.startsWith('COORD')) {
                    await this.fetchAdminCredentials().catch(() => {});
                }
                if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
                    ui.setHUDVisibility(true);
                }
                if (typeof auth !== 'undefined' && typeof auth.buildNav === 'function') {
                    auth.buildNav(this.user.admin);
                }
            } catch(e) {
                // NOTA TÉCNICA G4b: La vulnerabilidad G4b (falsificar leyendo /api/state) sigue abierta transitoriamente hasta la aprobación e implantación del servidor D2 (GS1–GS4).
                this.user = null;
                this.currentUser = null;
                try { sessionStorage.removeItem(this.sessionKey); } catch(err) {}
            }
        }
        
        try {
            if (typeof ui !== 'undefined' && typeof ui.render === 'function') ui.render();
        } catch (renderErr) {
            console.error("Error en renderizado inicial:", renderErr);
        }
        
        if (this._clockInterval) clearInterval(this._clockInterval);
        this._clockInterval = setInterval(() => {
          const el = document.getElementById('hud-clock');
          if (el) el.innerText = 'TIME: ' + new Date().toLocaleTimeString();
        }, 1000);

        if (!this._listenersAttached) {
            this._listenersAttached = true;
            if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => {
                if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                    this.checkFastVersion();
                }
            }, 12000);

            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        this.checkFastVersion();
                    }
                });
            }

            if (typeof window !== 'undefined') {
                window.addEventListener('offline', () => {
                    this.isCloudOnline = false;
                    this.consecutiveNetworkFailures = Math.max(this.consecutiveNetworkFailures, 1);
                    this.setOfflineContainment(true);
                    try { if (this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
                });

                window.addEventListener('online', async () => {
                    const ok = await this.fetchFromCloud();
                    if (ok && this.verifySessionIntegrity(this.data)) {
                        this.setOfflineContainment(false);
                    }
                });
            }

            if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' && !this._broadcastChannel) {
                try {
                    this._broadcastChannel = new BroadcastChannel('marsket_channel');
                    this._broadcastChannel.onmessage = (ev) => {
                        if (ev.data && ev.data.type === 'MARSKET_GLOBAL_RESET') {
                            this.fetchFromCloud();
                        }
                    };
                } catch(e) {}
            }
        }
        
        await this.fetchFromCloud();
        if (this.user && this.user.admin && this.user.role && this.user.role.startsWith('COORD')) {
            await this.fetchAdminCredentials().catch(() => {});
        }
    },

    resumePolling() {
        this.pausePolling = false;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (!this.pausePolling && typeof document !== 'undefined' && document.visibilityState === 'visible') {
                this.checkFastVersion();
            }
        }, 12000);
    },

    async checkFastVersion() {
        if (this.pausePolling) return;
        if (!this.user || !this.user.coId) {
            // Sondeo de estado general para roles de coordinación docente o invitados
            return await this.fetchFromCloud();
        }

        const cid = this.user.coId;
        const endpoint = `/api/company/${encodeURIComponent(cid)}/version`;
        const headers = { 
            'Cache-Control': 'no-cache',
            'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
        };
        if (this.lastCompanyETag) {
            headers['If-None-Match'] = this.lastCompanyETag;
        }

        try {
            const res = await fetch(endpoint, { method: 'GET', headers, cache: 'no-store' });
            
            // HTTP 304 Not Modified: 0 bytes consumidos, sincronización confirmada
            if (res.status === 304) {
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                return true;
            }

            if (res.ok) {
                const info = await res.json();
                const etag = res.headers.get('ETag') || info.etag;
                this.lastCompanyETag = etag;
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);

                const localCo = this.data.companies?.[cid];
                const localUpdated = Number(localCo?.updatedAt || 0);
                const remoteUpdated = Number(info.updatedAt || 0);
                const configUpdated = Number(info.configUpdatedAt || 0);
                const localConfigUpdated = Number(this.data.config?.updatedAt || 0);

                // Si la versión remota o la configuración docente es posterior a la local, sincronizar estado completo
                if (remoteUpdated > localUpdated || configUpdated > localConfigUpdated || !this.lastETag) {
                    await this.fetchFromCloud(true);
                }
                return true;
            } else {
                return await this.fetchFromCloud();
            }
        } catch (e) {
            this.consecutiveNetworkFailures++;
            if (this.consecutiveNetworkFailures >= 2) {
                this.isCloudOnline = false;
                this.setOfflineContainment(true);
            }
            return false;
        }
    },

    async executeAction(actionName, payload = {}) {
        const coId = this.user?.coId || payload?.coId;
        if (!coId) {
            console.warn("[ACTION] executeAction requiere una sesión activa con startup asociada o coId explícito.");
            return { success: false, error: 'NO_ACTIVE_COMPANY' };
        }

        const endpoint = `/api/company/${encodeURIComponent(coId)}/action`;
        const headers = { 
            'Content-Type': 'application/json',
            'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
        };
        if (typeof auth !== 'undefined' && typeof auth.getSessionToken === 'function') {
            const token = auth.getSessionToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            this.isSyncing = true;
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}

            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: actionName, payload })
            });

            if (res.ok) {
                const data = await res.json();
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);

                if (data.balance !== undefined && this.data.companies?.[coId]) {
                    this.data.companies[coId].updatedAt = data.updatedAt || Date.now();
                }
                this.lastCompanyETag = `W/"co-${coId}-${data.version}-${data.updatedAt}"`;
                await this.fetchFromCloud(true);
                return { success: true, data };
            } else {
                const errData = await res.json().catch(() => ({}));
                console.warn("[ACTION] Error devuelto por servidor en mutación atómica:", errData);
                return { success: false, error: errData.error || res.statusText };
            }
        } catch(err) {
            console.error("[ACTION] Excepción de red en executeAction:", err);
            return { success: false, error: err.message };
        } finally {
            this.isSyncing = false;
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }
    },

    discardPendingProposal(coId, proposalType, proposalId = null) {
        if (!coId || !this.data.companies?.[coId]) return;
        const co = this.data.companies[coId];

        if (proposalType === 'BRAND') {
            delete co.pendingSlogan;
            delete co.pendingMission;
            co.brandStatus = 'REJECTED';
            if (co.brandApproval) {
                co.brandApproval.status = 'RECHAZADO';
                delete co.brandApproval.pendingSlogan;
                delete co.brandApproval.pendingLogo;
                co.brandApproval.feedback = 'Propuesta de marca rechazada por Coordinación.';
            }
        } else if (proposalType === 'DELIVERABLE' && proposalId) {
            if (co.deliverables?.[proposalId]) {
                co.deliverables[proposalId].status = 'CEO_REVISION';
            }
        } else if (proposalType === 'MARKETING' && proposalId) {
            const camp = (co.marketingCampaigns || []).find(c => c.id === proposalId);
            if (camp) camp.status = 'DENEGADO';
        } else if (proposalType === 'NAME_CHANGE') {
            delete co.pendingName;
            delete co.nameChangeReason;
            co.nameChangeStatus = 'REJECTED';
        }

        this.save();
    },

    isDeliverableLocked(docKey, co) {
        if (this.user?.admin) return false;
        const comp = co || (this.data?.companies?.[this.user?.coId]);
        if (comp?.unlockAllContracts === true) return false;
        const docObj = comp?.deliverables?.[docKey];
        if (docObj && docObj.driveUrl) return false;
        const sched = (this.data?.config?.deliverableSchedule && this.data.config.deliverableSchedule[docKey]) || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        if (!openDate) return false;
        const openTime = new Date(openDate).getTime();
        if (isNaN(openTime)) return false;
        return Date.now() < openTime;
    },

    isPhaseUnlocked(phaseId, co) {
        if (!phaseId) return true;
        if (this.user?.admin) return true;
        const comp = co || (this.data?.companies?.[this.user?.coId]);
        if (comp?.unlockAllContracts === true) return true;

        const pDefs = (typeof PROJECT_PHASES_DEF !== 'undefined') ? PROJECT_PHASES_DEF : {};
        const pDef = pDefs[phaseId];
        if (pDef && pDef.startDate) {
            const startTime = new Date(pDef.startDate + 'T00:00:00').getTime();
            if (!isNaN(startTime) && Date.now() >= startTime) {
                return true;
            }
        }
        if (phaseId === 'I') return true;

        const defs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => (d.phase || 'I') === phaseId);
        if (defs.length > 0 && defs.some(d => !this.isDeliverableLocked(d.key, comp))) {
            return true;
        }
        return false;
    },

    async submitDeliverable(docType, payload) {
        const driveUrl = String(payload?.driveUrl || '').trim();
        if (!this.user || !this.user.coId) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co) return;

        if (!this.user.admin && this.isDeliverableLocked(docType, co)) {
            console.warn(`[SECURITY] Intento no autorizado de entrega de entregable bloqueado: ${docType}`);
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify("Entrega bloqueada: este entregable aún no ha alcanzado su fecha de apertura.", "error");
            }
            return;
        }

        co.deliverables = co.deliverables || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const effectiveRole = this.getEffectiveRole(this.user, co);
        const isDeptMatch = !def
            || (effectiveRole === def.role)
            || (def.role === 'OPERACIONES_IA' && effectiveRole === 'OPERACIONES')
            || (docType === 'hoja_taller_fyq' && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES' || effectiveRole === 'TECNICO'));
        if (!this.user.admin && ((effectiveRole === 'CEO' && (!def || def.role !== 'CEO')) || !isDeptMatch)) {
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify(`Solo el departamento responsable (${(def?.role || 'ASIGNADO').replace('_', ' ')}) puede elaborar y subir este entregable. El CEO debe esperar a recibirlo para visarlo.`, "warning");
            }
            return;
        }
        const isCEO = Boolean(this.user.admin) || (effectiveRole === 'CEO' && def && def.role === 'CEO');
        const targetStatus = isCEO ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO';

        const sanitizedItem = { 
            driveUrl, 
            status: targetStatus,
            returnReasonId: null,
            returnReason: null,
            updatedAt: new Date().toISOString() 
        };
        co.deliverables[docType] = sanitizedItem;

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("ENTREGABLE", `Enlace Google Drive subido: ${docType} (Estado: ${targetStatus})`);
        }

        if (!isCEO && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const def = defs.find(d => d.key === docType);
            const docName = def ? (def.shortName || def.name) : docType;
            const senderLabel = (effectiveRole !== this.user.role) ? `${this.user.role} (${effectiveRole})` : this.user.role;
            ui.pushNotification(coId, 'CEO', `${senderLabel} ha subido el entregable "${docName}". Requiere tu supervisión y visado.`, 'warning', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            if (isCEO) {
                ui.notify("✅ Enlace registrado y elevado a evaluación docente.", "success");
            } else {
                ui.notify("📤 Enlace registrado y remitido a supervisión del CEO.", "info");
            }
        }

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: docType,
                driveUrl: sanitizedItem.driveUrl,
                status: targetStatus
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando entrega:", e);
        }
    },

    async sendHojaTallerToWorkshop(driveUrl) {
        if (!this.user || !this.user.coId) return;
        if (this.getEffectiveRole() !== 'TECNICO' && !this.user.admin) {
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify("Acceso restringido: solo el departamento Técnico puede remitir la Hoja de Taller.", "error");
            }
            return;
        }
        const co = this.data.companies?.[this.user.coId];
        if (!co) return;

        if (!this.user.admin && this.isDeliverableLocked('hoja_taller_fyq', co)) {
            console.warn("[SECURITY] Intento no autorizado de envío de Hoja de Taller bloqueada.");
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify("La Hoja de Taller se encuentra bloqueada hasta su fecha de apertura.", "error");
            }
            return;
        }

        co.deliverables = co.deliverables || {};
        co.deliverables.hoja_taller_fyq = {
            driveUrl: driveUrl,
            status: 'EN_TALLER_OPERARIO',
            returnReasonId: null,
            returnReason: null,
            updatedAt: new Date().toISOString()
        };

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_FYQ", "Hoja de Taller y BOM remitidos a Taller: " + driveUrl);
        }
        ui.pushNotification(this.user.coId, 'OPERACIONES_IA', 'Técnico ha enviado la Hoja de Taller (BOM) a Taller para validación física.', 'info', {
            view: 'cart'
        });
        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("🚀 Hoja de Taller remitida al Operario de Taller para verificación de ensamble.", "success");
        }

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: driveUrl,
                status: 'EN_TALLER_OPERARIO'
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando Hoja de Taller:", e);
        }
    },

    async validateHojaTallerByOperator() {
        if (!this.user || !this.user.coId) return;
        const co = this.data.companies?.[this.user.coId];
        if (!co || !co.deliverables?.hoja_taller_fyq) return;

        const hoja = co.deliverables.hoja_taller_fyq;
        hoja.status = 'SUBMITTED_TO_CEO';
        delete hoja.returnReasonId;
        delete hoja.returnReason;
        hoja.updatedAt = new Date().toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_VALIDADO", "Operario validó ensamble físico de Hoja de Taller.");
        }
        ui.pushNotification(this.user.coId, 'CEO', 'El Operario ha validado el ensamble físico de la Hoja de Taller. Pendiente de tu visado final.', 'warning', {
            view: 'role_deliverables',
            section: 'deliverables',
            docKey: 'hoja_taller_fyq'
        });
        this.save();

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: hoja.driveUrl,
                status: 'SUBMITTED_TO_CEO'
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando validación de taller:", e);
        }
    },

    async returnHojaTallerByOperator(reasonId, reasonLabel, driveUrl) {
        if (!this.user || !this.user.coId) return;
        const co = this.data.companies?.[this.user.coId];
        if (!co || !co.deliverables?.hoja_taller_fyq) return;

        const hoja = co.deliverables.hoja_taller_fyq;
        hoja.status = 'DEVUELTO_A_TECNICO';
        hoja.returnReasonId = reasonId;
        hoja.returnReason = reasonLabel;
        if (driveUrl) {
            hoja.returnDriveUrl = driveUrl;
        }
        hoja.updatedAt = new Date().toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_DEVUELTO", "Operario devolvió Hoja de Taller por: " + reasonId);
        }
        ui.pushNotification(this.user.coId, 'TECNICO', 'Operaciones ha DEVUELTO la Hoja de Taller por incidencia: "' + reasonLabel + '". Revisa el BOM y actualiza el Google Doc.', 'error', {
            view: 'tech_workshop',
            anchorId: 'tech-hoja-taller-panel'
        });
        this.save();

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: hoja.driveUrl,
                status: 'DEVUELTO_A_TECNICO',
                returnReasonId: reasonId,
                returnReason: reasonLabel,
                returnDriveUrl: driveUrl || hoja.returnDriveUrl || null
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución de taller:", e);
        }
    },

    async approveDeliverableByCEO(docType) {
        if (!this.user || !this.user.coId || this.getEffectiveRole() !== 'CEO') return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;

        co.deliverables[docType].status = 'DELIVERED_TO_TEACHER';
        delete co.deliverables[docType].returnReasonId;
        delete co.deliverables[docType].returnReason;
        delete co.deliverables[docType].returnDriveUrl;
        delete co.deliverables[docType].returnByTeacher;
        co.deliverables[docType].updatedAt = new Date().toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CEO_APROBACION", `Entregable aprobado y elevado a docente: ${docType}`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        if (targetRole && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, targetRole, `El CEO ha VALIDADO vuestro entregable "${docName}". Elevado formalmente a evaluación docente.`, 'success', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("✅ Entregable validado por el CEO y elevado a evaluación docente.", "success");
        }

        try {
            await this.executeAction('CEO_REVIEW_DELIVERABLE', {
                key: docType,
                action: 'APPROVE'
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando aprobación del CEO:", e);
        }
    },

    async returnDeliverableByCEO(docType, reasonId, returnDriveUrl = null) {
        if (!this.user || !this.user.coId || this.getEffectiveRole() !== 'CEO') return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;

        const reasonList = typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [];
        const reasonObj = reasonList.find(r => r.id === reasonId);
        const reasonText = reasonObj ? reasonObj.label : (reasonId || 'Revisión técnica requerida por CEO');

        co.deliverables[docType].status = 'CEO_REVISION';
        co.deliverables[docType].returnReasonId = reasonId;
        co.deliverables[docType].returnReason = reasonText;
        co.deliverables[docType].returnDriveUrl = returnDriveUrl || null;
        delete co.deliverables[docType].returnByTeacher;
        co.deliverables[docType].updatedAt = new Date().toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CEO_DEVOLUCION", `Entregable devuelto a departamento: ${docType} (${reasonId})`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        if (targetRole && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, targetRole, `El CEO ha DEVUELTO vuestro entregable "${docName}" para subsanación. Motivo: ${reasonText}`, 'error', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("↩️ Entregable devuelto al departamento para subsanación.", "warning");
        }

        try {
            await this.executeAction('CEO_REVIEW_DELIVERABLE', {
                key: docType,
                action: 'RETURN',
                reasonId: reasonId,
                reasonText: reasonText,
                returnDriveUrl: returnDriveUrl || null
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución del CEO:", e);
        }
    },

    async returnDeliverableByTeacher(coId, docType, reasonId, returnDriveUrl = null) {
        if (!this.user || !this.user.admin) return;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;

        const reasonList = typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [];
        const reasonObj = reasonList.find(r => r.id === reasonId);
        const reasonText = reasonObj ? reasonObj.label : (reasonId || 'Revisión y subsanación requerida por el profesorado');

        co.deliverables[docType].status = 'CEO_REVISION';
        co.deliverables[docType].returnReasonId = reasonId;
        co.deliverables[docType].returnReason = reasonText;
        co.deliverables[docType].returnDriveUrl = returnDriveUrl || null;
        co.deliverables[docType].returnByTeacher = true;
        co.deliverables[docType].returnReason = reasonText;
        co.deliverables[docType].returnByTeacher = true;
        co.deliverables[docType].updatedAt = new Date().toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("DOCENTE_DEVOLUCION", `Entregable devuelto a startup por docente: ${coId} / ${docType} (${reasonId})`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        const teacherName = this.user.role || 'Docente';

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            if (targetRole) {
                ui.pushNotification(coId, targetRole, `El Profesorado (${teacherName}) ha DEVUELTO vuestro entregable "${docName}" para subsanación urgente. Motivo: ${reasonText}`, 'error', {
                    view: 'role_deliverables',
                    section: 'deliverables',
                    docKey: docType
                });
            }
            ui.pushNotification(coId, 'CEO', `El Profesorado (${teacherName}) ha devuelto el entregable "${docName}" para subsanación. Motivo: ${reasonText}`, 'error', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("↩️ Entregable devuelto a la startup para subsanación.", "warning");
        }

        try {
            await this.executeAction('DOCENTE_REVIEW_DELIVERABLE', {
                coId: coId,
                key: docType,
                action: 'RETURN',
                reasonId: reasonId,
                reasonText: reasonText
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución docente:", e);
        }
    },

    async decideMktAction(campId, actId, approved, feedback = '', returnDriveUrl = '') {
        if (!this.user || !this.user.coId || (this.getEffectiveRole() !== 'CEO' && !this.user.admin && !this.user.isCoordinator)) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !Array.isArray(co.marketingCampaigns)) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || !Array.isArray(camp.executedActions)) return;

        const act = camp.executedActions.find(a => String(a.id) === String(actId));
        if (!act) return;

        act.status = approved ? 'VALIDADO_CEO' : 'RECHAZADO_CEO';
        act.reviewedAt = Date.now();
        act.feedback = approved ? '' : (feedback || 'Revisión requerida por CEO');
        act.returnDriveUrl = approved ? '' : (returnDriveUrl || '');

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log(approved ? "CEO_MKT_ACCION_APROBADA" : "CEO_MKT_ACCION_RECHAZADA", `Acción publicitaria ${act.title}: ${approved ? 'Aprobada y elevada a Liderazgo' : 'Devuelta a Marketing'}`);
        }

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            if (approved) {
                ui.pushNotification(coId, 'MARKETING', `El CEO ha VALIDADO la acción publicitaria "${act.title}". Elevada al docente de Liderazgo y Coordinación.`, 'success', {
                    view: 'campaigns',
                    anchorId: 'mkt-campaigns-section'
                });
            } else {
                ui.pushNotification(coId, 'MARKETING', `El CEO ha DEVUELTO la acción publicitaria "${act.title}". Motivo: ${act.feedback}`, 'error', {
                    view: 'campaigns',
                    anchorId: 'mkt-campaigns-section'
                });
            }
        }

        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify(approved ? "✅ Acción publicitaria validada y elevada a Liderazgo y Coordinación." : "↩️ Acción publicitaria devuelta a Marketing para subsanación.", approved ? "success" : "warning");
        }

        try {
            await this.executeAction('UPDATE_MARKETING', {
                decideAction: { campId, actId, approved, feedback: act.feedback, returnDriveUrl: act.returnDriveUrl }
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando decisión del CEO sobre acción publicitaria:", e);
        }
    },

    async resubmitMktAction(campId, actId, newDriveUrl) {
        if (!this.user || !this.user.coId) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !Array.isArray(co.marketingCampaigns)) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || !Array.isArray(camp.executedActions)) return;

        const act = camp.executedActions.find(a => String(a.id) === String(actId));
        if (!act) return;

        const totalAllowed = camp.totalActions || 3;
        if ((camp.executedActions || []).length > totalAllowed) {
            if (typeof ui !== 'undefined' && ui.notify) ui.notify("Cupo de acciones excedido en este paquete.", "error");
            return;
        }

        act.url = newDriveUrl;
        act.driveUrl = newDriveUrl;
        act.status = 'PENDIENTE_CEO';
        act.date = new Date().toLocaleDateString();
        act.resubmittedAt = Date.now();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("MKT_ACCION_SUBSANADA", `Marketing ha subsanado y reenviado al CEO la acción: ${act.title}`);
        }

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, 'CEO', `Marketing ha subsanado y reenviado la acción "${act.title}" para tu revisión.`, 'info', {
                view: 'orders',
                filter: 'EN_PROCESO',
                dept: 'MARKETING'
            });
        }

        this.save();
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("✅ Acción publicitaria subsanada y reenviada al CEO.", "success");
        }

        try {
            await this.executeAction('UPDATE_MARKETING', {
                campaignId: campId,
                actionItem: act
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando reenvío de acción publicitaria:", e);
        }
    },

    async fetchFromCloud(force = false) {
        if (!force && this.pausePolling) return false;
        if (force) {
            this.lastETag = null;
        }
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let shouldRender = false;
        let networkOk = false;

        try {
            const reqHeaders = { 
                'Cache-Control': 'no-cache',
                'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
            };
            if (this.lastETag && !force) {
                reqHeaders['If-None-Match'] = this.lastETag;
            }
            const res = await fetch('/api/state', { cache: 'no-store', headers: reqHeaders });

            // Mitigación ETag / HTTP 304: abortar inmediatamente la reconciliación y evitar redibujados (0 bytes)
            if (res.status === 304) {
                this._hasWarnedCloudNetwork = false;
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                return true;
            }

            if(res.ok) {
                this._hasWarnedCloudNetwork = false;
                const etag = res.headers.get('ETag');
                if (etag) this.lastETag = etag;
                const json = await res.json();
                networkOk = true;
                this.consecutiveNetworkFailures = 0;
                if(json && json.status !== 'empty') {
                    // Purgado Incondicional por resetEpoch (v1.1.02)
                    const localEpoch = parseInt(localStorage.getItem('marsket_reset_epoch') || '0', 10);
                    const serverEpoch = json.resetEpoch || 0;

                    if (serverEpoch > localEpoch) {
                        console.warn('[SECURITY] Reset Epoch superior detectado. Destruyendo caché huérfana local.');
                        
                        const savedSession = localStorage.getItem('marsket_session');
                        const savedRole = localStorage.getItem('marsket_user_role');
                        const savedV1Session = this.sessionKey ? localStorage.getItem(this.sessionKey) : null;
                        
                        localStorage.clear(); // Purga masiva
                        
                        if (savedSession) localStorage.setItem('marsket_session', savedSession);
                        if (savedRole) localStorage.setItem('marsket_user_role', savedRole);
                        if (savedV1Session && this.sessionKey) localStorage.setItem(this.sessionKey, savedV1Session);
                        localStorage.setItem('marsket_reset_epoch', serverEpoch.toString());
                        
                        // Reemplazo destructivo directo, omitiendo cualquier merge aditivo
                        this.data = JSON.parse(JSON.stringify(json));
                        this.saveToLocal();
                        if (typeof ui !== 'undefined' && ui.renderAll) ui.renderAll();
                        else if (typeof ui !== 'undefined' && ui.render) ui.render();
                        
                        this.isCloudOnline = true;
                        return true; // ABORTAR ejecución posterior de mergeData
                    }

                    const prevDataStr = JSON.stringify(this.data);
                    const merged = this.mergeData(this.migrate(json), this.data);
                    this.data = merged;
                    this.data.version = json.version || this.data.version;
                    this.saveLocalOnly();
                    this.isCloudOnline = true;

                    const sessionValid = this.verifySessionIntegrity(this.data);
                    if (sessionValid && this.isOfflineContained) {
                        this.setOfflineContainment(false);
                    }
                    const hasDataChanged = JSON.stringify(this.data) !== prevDataStr;
                    shouldRender = sessionValid && hasDataChanged;
                } else if(json && json.status === 'empty') {
                    this.isCloudOnline = true;
                    if (this.verifySessionIntegrity(this.data) && this.isOfflineContained) {
                        this.setOfflineContainment(false);
                    }
                    await this.pushToCloud(false);
                }
            } else {
                this.isCloudOnline = false;
                this.consecutiveNetworkFailures = 0;
                console.error(`Error HTTP inesperado en fetchFromCloud (${res.status}):`, res.statusText);
                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    this.setOfflineContainment(true);
                }
            }
        } catch(err) { 
            // G9: Contingencia de red esperada (offline/servidor no alcanzable) -> telemetry + console.debug (rate-limited a 1 vez)
            if (!this._hasWarnedCloudNetwork) {
                this._hasWarnedCloudNetwork = true;
                if (typeof telemetry !== 'undefined' && typeof telemetry.log === 'function') {
                    telemetry.log("NETWORK", "Conexión /api/state no disponible actualmente (modo sin conexión)");
                }
                console.debug("[D1: OFFLINE] Modo sin conexión activado (/api/state no alcanzable).");
            }
            this.isCloudOnline = false;
            this.consecutiveNetworkFailures++;
            if (this.consecutiveNetworkFailures >= 2 || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                this.setOfflineContainment(true);
            }
        } finally { 
            this.isSyncing = false; 
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }

        // Renderizado separado del bloque de red para que nunca tumbe la conexión D1
        if (shouldRender && typeof ui !== 'undefined' && ui.render) {
            try {
                const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
                const isEditingInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
                const modalEl = typeof document !== 'undefined' ? document.getElementById('modal-overlay') : null;
                const isModalOpen = modalEl && !modalEl.classList.contains('hidden');
                if (!isEditingInput && !isModalOpen) {
                    const savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
                    ui.render();
                    if (typeof window !== 'undefined') {
                        requestAnimationFrame(() => {
                            if (Math.abs(window.scrollY - savedScrollY) > 5) {
                                window.scrollTo({ top: savedScrollY, behavior: 'instant' });
                            }
                        });
                    }
                } else if (ui.updateHUD) {
                    ui.updateHUD();
                }
            } catch (uiErr) {
                console.error("Excepción visual aislada en ui.render():", uiErr);
            }
        }
        return networkOk;
    },

    recordDeletedCatalogItem(itemId) {
        if (!itemId) return;
        try {
            const raw = localStorage.getItem('marsket_deleted_catalog_ids');
            const list = raw ? JSON.parse(raw) : [];
            const strId = String(itemId);
            if (!list.includes(strId)) {
                list.push(strId);
                localStorage.setItem('marsket_deleted_catalog_ids', JSON.stringify(list));
            }
        } catch(e) {}
    },

    getDeletedCatalogItems() {
        try {
            const raw = localStorage.getItem('marsket_deleted_catalog_ids');
            return raw ? JSON.parse(raw) : [];
        } catch(e) {
            return [];
        }
    },

    // WP1: Sanitizar payload local para contener ÚNICAMENTE variables de simulación aeroespacial y alias tácticos
    sanitizeForLocalStorage(data) {
        if (!data || typeof data !== 'object') return data;
        let clean;
        try {
            clean = JSON.parse(JSON.stringify(data));
        } catch(e) {
            return data;
        }

        // Erradicar PINs docentes
        if (clean.config && clean.config.teachers) {
            for (const tRole in clean.config.teachers) {
                if (clean.config.teachers[tRole]) {
                    delete clean.config.teachers[tRole].pin;
                }
            }
        }

        // Erradicar bóvedas, accessCode y secretos de startups
        if (clean.companies) {
            for (const cid in clean.companies) {
                const co = clean.companies[cid];
                if (co) {
                    delete co.authVault;
                    delete co.accessCode;
                    if (co.roles) {
                        for (const r in co.roles) {
                            if (typeof co.roles[r] === 'string' && /^\d{4,6}$/.test(co.roles[r])) {
                                co.roles[r] = 'PROTECTED';
                            }
                        }
                    }
                    if (co.deliverables) {
                        for (const dKey in co.deliverables) {
                            const d = co.deliverables[dKey];
                            if (d && typeof d === 'object') {
                                co.deliverables[dKey] = {
                                    driveUrl: String(d.driveUrl || d.dataUrl || d.url || '').trim(),
                                    status: d.status || 'DELIVERED_TO_TEACHER',
                                    returnReasonId: d.returnReasonId || null,
                                    returnReason: d.returnReason || null,
                                    returnDriveUrl: d.returnDriveUrl || null,
                                    returnByTeacher: Boolean(d.returnByTeacher),
                                    updatedAt: d.updatedAt || d.date || new Date().toISOString()
                                };
                            }
                        }
                    }
                }
            }
        }

        delete clean.session;
        delete clean.token;
        delete clean.authToken;
        delete clean.clientIp;
        delete clean.userAgent;

        return clean;
    },

    saveToLocal() {
        this.saveLocalOnly();
    },

    saveLocalOnly() {
        try {
            const clean = this.sanitizeForLocalStorage(this.data);
            localStorage.setItem(this.storageKey, JSON.stringify(clean));
        } catch (e) {
            console.error("Aviso: almacenamiento local lleno o restringido:", e);
        }
    },

    save(targetCid = null) { 
        if (this.user && !this.user.admin && this.data.companies[this.user.coId]) {
            this.data.companies[this.user.coId].updatedAt = Date.now();
        } else if (targetCid && this.data.companies && this.data.companies[targetCid]) {
            this.data.companies[targetCid].updatedAt = Date.now();
        }
        this.data.lastUpdated = Date.now();
        
        this.saveLocalOnly(); 
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        this.pushToCloud(true);
    },

    async pushWithBackoff(payload, attempt = 0) {
        const MAX_RETRIES = 4;
        const token = this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || '';
        const headers = {
            'Content-Type': 'application/json',
            'X-Marsket-Auth': token
        };
        const res = await fetch('/api/state', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (res.status === 409 && attempt < MAX_RETRIES) {
            // Backoff exponencial con jitter: t = min(1500, 75 * 2^attempt) + random(0, 150) ms
            const delay = Math.min(1500, 75 * Math.pow(2, attempt)) + Math.floor(Math.random() * 150);
            await new Promise(r => setTimeout(r, delay));
            
            // Forzar descarga real sin ETag para reconciliar versión y datos más recientes antes de reintentar
            await this.fetchFromCloud(true);
            const newPayload = JSON.parse(JSON.stringify(this.data));
            if (this.user?.coId) {
                newPayload.coId = this.user.coId;
            }
            newPayload.version = (Number(this.data.version) || 0) + 1;
            return this.pushWithBackoff(newPayload, attempt + 1);
        }
        return res;
    },

    async pushToCloud(debounced = false) {
        if (!this.verifySessionIntegrity(this.data)) {
            return false;
        }
        if(debounced) {
            clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.pushToCloud(false), 800);
            return true;
        }
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let pushSuccess = false;
        let shouldRenderConflict = false;
        
        try {
            const payload = JSON.parse(JSON.stringify(this.data));
            if (this.user?.coId) {
                payload.coId = this.user.coId;
            }
            payload.version = (Number(this.data.version) || 0) + 1;
            const res = await this.pushWithBackoff(payload);
            
            if (res.ok) {
                const json = await res.json().catch(() => null);
                if (json && json.version) {
                    this.data.version = json.version; 
                    this.saveLocalOnly();
                }
                const etag = res.headers.get('ETag') || (json && json.etag);
                if (etag) {
                    this.lastETag = etag;
                } else if (json && json.version) {
                    const cfgUpd = this.data?.config?.updatedAt || 0;
                    this.lastETag = 'W/"v-' + json.version + '-' + cfgUpd + '"';
                }
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                pushSuccess = true;
            } else if (res.status === 409) {
                shouldRenderConflict = true;
                if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                    ui.notify("⚠️ Conflicto de concurrencia detectado. Se ha sincronizado el registro más reciente de la nube sin sobrescribir datos ajenos.", "warning");
                }
                await this.fetchFromCloud(true);
                this.isCloudOnline = true;
            } else {
                this.isCloudOnline = false;
                this.consecutiveNetworkFailures = 0;
                if (res.status === 401 || res.status === 403) {
                    console.warn(`[SECURITY] Petición pushToCloud rechazada por permisos (HTTP ${res.status}). Ejecutando purga total de sesión.`);
                    if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                        ui.notify(`⛔ Error de autenticación (HTTP ${res.status}): Sesión no autorizada o expirada.`, "error");
                    }
                    if (typeof auth !== 'undefined' && typeof auth.logout === 'function') {
                        auth.logout();
                    }
                }
            }
        } catch(err) { 
            // G9: Contingencia de red esperada en pushToCloud -> telemetry + console.debug (rate-limited a 1 vez)
            if (!this._hasWarnedCloudNetwork) {
                this._hasWarnedCloudNetwork = true;
                if (typeof telemetry !== 'undefined' && typeof telemetry.log === 'function') {
                    telemetry.log("NETWORK", "Conexión /api/state no disponible para push (guardado local)");
                }
                console.debug("[D1: OFFLINE] Modo sin conexión activado (push no alcanzable).");
            }
            this.isCloudOnline = false;
            this.consecutiveNetworkFailures++;
            if (this.consecutiveNetworkFailures >= 2 || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                this.setOfflineContainment(true);
            }
        } finally { 
            this.isSyncing = false; 
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }

        if (shouldRenderConflict && typeof ui !== 'undefined' && ui.render) {
            try { ui.render(); } catch(uiErr) { console.error("Excepción visual aislada tras reconciliación:", uiErr); }
        }
        return pushSuccess;
    },

    isContractPhaseUnlocked(phase, co) {
        if (!co) return false;
        // La empresa sandbox maestra y el profesorado tienen todas las fases desbloqueadas
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
        if (!win) return false;
        return Date.now() >= new Date(win.selectionStart).getTime();
    },

    isContractSelectionWindowOpen(phase, co) {
        if (!co) return false;
        // La empresa sandbox maestra tiene las 4 ventanas abiertas siempre
        if (co.unlockAllContracts === true) {
            return true;
        }
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
        if (!win) return false;
        const now = Date.now();
        const start = new Date(win.selectionStart).getTime();
        const end = new Date(win.selectionEnd).getTime();
        if (now < start || now > end) return false;
        if (phase === 'I' && !this.isBudgetInitialDelivered(co)) {
            return false;
        }
        return true;
    },

    isPressReleaseUnlocked(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [];
        const p = prPhases.find(item => item.phase === phaseKey);
        if (!p || !p.phaseCutoff) return false;
        return Date.now() >= new Date(p.phaseCutoff).getTime();
    },

    isPhaseBalanceUnlocked(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [];
        const p = phaseDefs.find(item => item.phase === phaseKey);
        if (!p || !p.cutoffDate) return false;
        return Date.now() >= new Date(p.cutoffDate).getTime();
    },

    isPhaseBalanceInWindow(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [];
        const p = phaseDefs.find(item => item.phase === phaseKey);
        if (!p || !p.cutoffDate) return false;
        const cutoffMs = new Date(p.cutoffDate).getTime();
        const now = Date.now();
        const windowEndMs = cutoffMs + (14 * 24 * 60 * 60 * 1000);
        return now >= cutoffMs && now <= windowEndMs;
    },

    isLaunchLicenseUnlocked(co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const pItem = co.deliverables?.['preliminaryReport'];
        return Boolean(pItem && ((pItem.status === 'DELIVERED_TO_TEACHER' && pItem.driveUrl) || (typeof pItem === 'string' && pItem.length > 0)));
    },

    isBudgetInitialDelivered(co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const p = co.deliverables?.['budgetInitial'];
        if (!p) return false;
        if (typeof p === 'string' && p.trim().length > 0) return true;
        if (typeof p === 'object' && p !== null) {
            if (p.driveUrl && String(p.driveUrl).trim().length > 0) return true;
            if (p.status === 'DELIVERED_TO_TEACHER' || p.status === 'ACCEPTED' || p.status === 'REVIEWED') return true;
        }
        return false;
    },

    signCommercialContract(coId, contractId) {
        const co = this.data.companies?.[coId];
        if (!co) {
            return { ok: false, error: 'Empresa no encontrada' };
        }
        // Validar rol CEO o Claustro
        const effectiveRole = this.getEffectiveRole(this.user, co);
        const isCEO = this.user && (effectiveRole === 'CEO' || this.user.admin);
        if (!isCEO) {
            return { ok: false, error: 'Solo la Dirección General (CEO) tiene potestad legal para firmar contratos comerciales.' };
        }
        const contract = (typeof CONTRACTS_CATALOG_DEF !== 'undefined' ? CONTRACTS_CATALOG_DEF : []).find(c => c.id === contractId);
        if (!contract) {
            return { ok: false, error: 'Contrato comercial no registrado en el catálogo oficial.' };
        }
        const phase = contract.phase;

        // Validar entrega de Presupuesto Inicial en Fase I
        if (phase === 'I' && !this.isBudgetInitialDelivered(co)) {
            return { ok: false, error: 'Para suscribir un contrato comercial de la Fase I es imprescindible haber entregado previamente el Presupuesto Inicial de Economía (DOC_4).' };
        }

        // Validar ventana temporal
        if (!this.isContractSelectionWindowOpen(phase, co)) {
            const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
            return { ok: false, error: `La ventana de suscripción para la Fase ${phase} no está activa. Plazo oficial: ${win?.windowLabel || 'Primeros 5 días lectivos'}.` };
        }
        co.contracts = co.contracts || {};
        if (co.contracts[phase] && co.contracts[phase].contractId) {
            return { ok: false, error: `La empresa ya ha suscrito el contrato "${co.contracts[phase].title}" en la Fase ${phase}. Cada startup puede firmar únicamente un (1) contrato por fase.` };
        }

        const now = Date.now();
        co.contracts[phase] = {
            contractId: contract.id,
            phase: contract.phase,
            company: contract.company,
            title: contract.title,
            requirements: contract.requirements,
            reward: contract.reward,
            penalty: contract.penalty,
            verification: contract.verification,
            dept: contract.dept,
            signedAt: now,
            signedDate: new Date().toLocaleString(),
            signedBy: this.user ? (effectiveRole !== this.user.role ? `${this.user.role} (${effectiveRole})` : this.user.role) : 'CEO',
            status: 'EN_CURSO',
            settledAt: null,
            settledBy: null,
            settlementNote: null,
            ledgerTxId: null
        };
        co.updatedAt = now;
        this.save();
        return { ok: true, contract: co.contracts[phase] };
    },

    settleCommercialContract(coId, phase, isCompleted, reasonNote = '') {
        const co = this.data.companies?.[coId];
        if (!co) {
            return { ok: false, error: 'Empresa no encontrada' };
        }
        if (!this.user || !this.user.admin) {
            return { ok: false, error: 'La auditoría y liquidación de contratos es exclusiva del profesorado evaluador.' };
        }
        co.contracts = co.contracts || {};
        const cRecord = co.contracts[phase];
        if (!cRecord || !cRecord.contractId) {
            return { ok: false, error: `La empresa no cuenta con un contrato comercial suscrito en la Fase ${phase}.` };
        }

        const now = Date.now();
        const delta = isCompleted ? Number(cRecord.reward) : -Number(cRecord.penalty);
        const concept = isCompleted
            ? `[CONTRATO_COMERCIAL] Cumplimiento de misión: ${cRecord.company} — ${cRecord.title}`
            : `[CONTRATO_COMERCIAL] Penalización por incumplimiento de misión: ${cRecord.company} — ${cRecord.title}`;

        // Rectificación si ya estaba liquidado previamente:
        // Eliminar asiento previo en el Ledger para evitar dobles cobros o penalizaciones duplicadas
        if (cRecord.settledAt && Array.isArray(co.ledger)) {
            if (cRecord.ledgerTxId) {
                co.ledger = co.ledger.filter(tx => tx.id !== cRecord.ledgerTxId && tx.tx_id !== cRecord.ledgerTxId);
            } else {
                co.ledger = co.ledger.filter(tx => !(tx.dept === 'CONTRATO_COMERCIAL' && tx.concept && tx.concept.includes(cRecord.title)));
            }
        }

        cRecord.status = isCompleted ? 'CUMPLIDO' : 'NO_CUMPLIDO';
        cRecord.settledAt = now;
        cRecord.settledDate = new Date().toLocaleString();
        cRecord.settledBy = this.user.role || 'DOCENTE';
        cRecord.settlementNote = reasonNote || (isCompleted ? 'Validado con éxito por comité docente' : 'Incumplimiento de requisitos técnicos/financieros');

        // Generar asiento contable en Ledger y vincular su ID inmutable
        const newTx = this.addToLedger(coId, concept, 'CONTRATO_COMERCIAL', delta);
        if (newTx && newTx.id) {
            cRecord.ledgerTxId = newTx.id;
        }

        return { ok: true, contract: cRecord, delta };
    },

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        if (!co) return null; 
        const deltaNum = Math.round((Number(delta || 0) + Number.EPSILON) * 100) / 100;
        co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
        const now = Date.now();
        const txId = 'TX-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const tx = {
            id: txId,
            tx_id: txId,
            date: new Date().toLocaleString(),
            concept,
            dept,
            delta: deltaNum,
            timestamp: now,
            final: 0
        };
        co.ledger.unshift(tx);

        this.recalculateBalance(co);
        if (co.ledger[0]) {
            co.ledger[0].final = co.balance;
        }
        co.updatedAt = now;
        this.save();
        return tx;
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
