// js/state.js
// --- GESTIÓN DE ESTADO ZERO-TRUST, MIGRACIÓN Y PERSISTENCIA ATÓMICA (v1.1.03) ---

const DEFAULT_STATE = {
    version: 1,
    resetEpoch: 0,
    b2bMarket: [],
    b2bContracts: [],
    securityIncidents: [],
    suggestionsToAlex: [],
    pendingCustom: [],
    telemetry: { totalLogins: 0, sessions: [] },
    catalog: [
        { id: 'F01', name: 'Botella PET 500ml', price: 97.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'F02', name: 'Botella PET 1L', price: 120.0, unit: 'Unidad', category: 'Fuselaje', origin: 'China' },
        { id: 'P01', name: 'Bicarbonato de Sodio', price: 10.0, unit: 'Gramo', category: 'Propulsión', origin: 'Turquía' },
        { id: 'P02', name: 'Vinagre', price: 5.0, unit: '10ml', category: 'Propulsión', origin: 'España' },
        { id: 'A01', name: 'Cartón Básico', price: 30.0, unit: 'Set', category: 'Aerodinámica', origin: 'Marruecos' },
        { id: 'S01', name: 'Papel de Cocina', price: 5.0, unit: 'Unidad', category: 'Sellado', origin: 'Portugal' },
        { id: 'S05', name: 'Cinta Aislante', price: 10.0, unit: 'Rollo', category: 'Sellado', origin: 'Alemania' }
    ],
    config: {
        nextOrderId: 1000,
        deadlines: typeof DEFAULT_DEADLINES !== 'undefined' ? DEFAULT_DEADLINES : {},
        guidelines: { techReportDocUrl: "", techReportNotes: "Guía oficial redactada por FYQ." },
        teachers: {
            FYQ: { name: "Física y Química", canSponsor: false },
            ECO: { name: "Economía", canSponsor: false },
            LYE: { name: "Liderazgo y Emprendimiento", canSponsor: false },
            LEN: { name: "Lengua Castellana", canSponsor: false },
            MAT: { name: "Matemáticas", canSponsor: false },
            ING: { name: "Inglés", canSponsor: false },
            COORD_MARIO: { name: "Coordinación - Mario", canSponsor: true },
            COORD_ALEX: { name: "Coordinación - Alex", canSponsor: true }
        }
    },
    companies: {
        astra: {
            name: "Astra Dynamics", balance: 2400, classGroup: 'A', logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}
        }
    }
};

const state = {
    data: {}, user: null, currentUser: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    sessionKey: 'marsket_session_v1',
    isCloudOnline: false, isSyncing: false, syncTimer: null, heartbeatTimer: null,
    pausePolling: false, _broadcastChannel: null,
    consecutiveNetworkFailures: 0, isOfflineContained: false, _listenersAttached: false,
    _hasWarnedCloudNetwork: false,
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
        if (!userObj || !dataRoot) return '';
        if (userObj.admin) {
            const t = dataRoot.config?.teachers?.[userObj.role];
            if (!t) return '';
            const raw = `T|${userObj.role}|${t.pinUpdatedAt || 0}`;
            return this.encodeSecret(raw);
        }
        const co = dataRoot.companies?.[userObj.coId];
        if (!co) return '';
        const code = this.getCompanyCode(co);
        const pin = this.getRolePin(co, userObj.role);
        if (!pin) return '';
        const auxDept = userObj.role === 'AUXILIAR' ? (co.auxRoleDept || '') : '';
        const raw = `S|${userObj.coId}|${userObj.role}|${code}|${auxDept}|${co.authUpdatedAt || 0}`;
        return this.encodeSecret(raw);
    },

    migrate(d) {
        d = d || {};
        d.version = Number(d.version) || 1; 
        d.lastUpdated = d.lastUpdated || Date.now();
        d.config = d.config || JSON.parse(JSON.stringify(DEFAULT_STATE.config));
        d.catalog = d.catalog && d.catalog.length > 0 ? d.catalog : JSON.parse(JSON.stringify(DEFAULT_STATE.catalog));
        d.companies = d.companies || JSON.parse(JSON.stringify(DEFAULT_STATE.companies));
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
            co.authUpdatedAt = Number(co.authUpdatedAt) || 0;
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
            this.setCompanyCode(co, currentPlainCode, false);

            const baseRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            baseRoles.forEach(r => {
                const existingPin = this.getRolePin(co, r);
                if (existingPin && existingPin !== 'PROTECTED') {
                    this.setRolePin(co, r, existingPin, false);
                } else if (!existingPin && r !== 'AUXILIAR') {
                    this.setRolePin(co, r, '1234', false);
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
            if ((localData.config.updatedAt || 0) > (serverData.config?.updatedAt || 0)) {
                merged.config.deadlines = JSON.parse(JSON.stringify(localData.config.deadlines || merged.config.deadlines || {}));
                merged.config.guidelines = JSON.parse(JSON.stringify(localData.config.guidelines || merged.config.guidelines || {}));
                merged.config.updatedAt = localData.config.updatedAt;
            }
            if (localData.config.teachers) {
                merged.config.teachers = merged.config.teachers || {};
                for (let tk in localData.config.teachers) {
                    const lT = localData.config.teachers[tk];
                    const sT = merged.config.teachers[tk];
                    if (sT && lT) {
                        if ((lT.pinUpdatedAt || 0) > (sT.pinUpdatedAt || 0)) {
                            merged.config.teachers[tk] = JSON.parse(JSON.stringify(lT));
                        }
                    } else if (lT && !sT) {
                        merged.config.teachers[tk] = JSON.parse(JSON.stringify(lT));
                    }
                }
            }
        }
        
        for (let k in localData.companies) {
            const sCo = merged.companies[k];
            const lCo = localData.companies[k];
            
            if (sCo && lCo) {
                const sTime = sCo.updatedAt || 0;
                const lTime = lCo.updatedAt || 0;
                const sAuthTime = sCo.authUpdatedAt || 0;
                const lAuthTime = lCo.authUpdatedAt || 0;
                
                if (lTime > sTime) {
                    merged.companies[k] = JSON.parse(JSON.stringify(lCo));
                    if (sAuthTime > lAuthTime) {
                        merged.companies[k].authVault = JSON.parse(JSON.stringify(sCo.authVault));
                        merged.companies[k].roles = JSON.parse(JSON.stringify(sCo.roles));
                        merged.companies[k].auxRoleDept = sCo.auxRoleDept;
                        merged.companies[k].auxRoleRequest = JSON.parse(JSON.stringify(sCo.auxRoleRequest));
                        merged.companies[k].authUpdatedAt = sAuthTime;
                    }
                    const mergeArraysLocalDominant = (arrLocal, arrServer) => {
                        if (!Array.isArray(arrLocal)) arrLocal = [];
                        if (!Array.isArray(arrServer)) arrServer = [];
                        const serverMap = new Map();
                        arrServer.forEach(i => { if (i && i.id) serverMap.set(String(i.id), i); });
                        
                        const mergedLocal = arrLocal.map(lItem => {
                            if (!lItem || !lItem.id) return lItem;
                            const sItem = serverMap.get(String(lItem.id));
                            if (!sItem) return lItem;
                            const isRead = Boolean(lItem.read || sItem.read);
                            let status = lItem.status;
                            if (lItem.status === 'PENDIENTE' && sItem.status && sItem.status !== 'PENDIENTE') {
                                status = sItem.status;
                            }
                            return { ...sItem, ...lItem, read: isRead, status: status || lItem.status };
                        });
                        const localIds = new Set(arrLocal.map(i => String(i?.id)));
                        const missingInLocal = arrServer.filter(i => i && i.id && !localIds.has(String(i.id)));
                        return [...mergedLocal, ...missingInLocal];
                    };
                    const arraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'cart', 'bom'];
                    arraysToMerge.forEach(arrName => {
                        merged.companies[k][arrName] = mergeArraysLocalDominant(lCo[arrName], sCo[arrName]);
                    });
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
                        sCo.authVault = JSON.parse(JSON.stringify(lCo.authVault));
                        sCo.roles = JSON.parse(JSON.stringify(lCo.roles));
                        sCo.auxRoleDept = lCo.auxRoleDept;
                        sCo.auxRoleRequest = JSON.parse(JSON.stringify(lCo.auxRoleRequest));
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
                    const mergeArrays = (arrServer, arrLocal) => {
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
                            let status = sItem.status;
                            if (sItem.status === 'PENDIENTE' && lItem.status && lItem.status !== 'PENDIENTE') {
                                status = lItem.status;
                            }
                            return { ...sItem, ...lItem, read: isRead, status: status || sItem.status };
                        });
                        
                        const serverIds = new Set(arrServer.map(i => String(i?.id)));
                        const missingInServer = arrLocal.filter(i => i && i.id && !serverIds.has(String(i.id)));
                        return [...missingInServer, ...mergedServer];
                    };

                    const arraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'cart', 'bom'];
                    arraysToMerge.forEach(arrName => {
                        sCo[arrName] = mergeArrays(sCo[arrName], lCo[arrName]);
                    });
                }
            } else if (lCo && !sCo && !localData._deletedCompanies?.[k]) {
                merged.companies[k] = lCo;
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
        
        merged.suggestionsToAlex = mergeArraysGlobal(merged.suggestionsToAlex, localData.suggestionsToAlex);
        merged.pendingCustom = mergeArraysGlobal(merged.pendingCustom, localData.pendingCustom);
        merged.b2bMarket = mergeArraysGlobal(merged.b2bMarket, localData.b2bMarket);
        merged.b2bContracts = mergeArraysGlobal(merged.b2bContracts, localData.b2bContracts);
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

    verifySessionIntegrity(serverOrMergedData = this.data) {
        if (!this.user) return true;

        // Comprobar expiración de la sesión (8 horas)
        if (this.user.exp && this.user.exp < Date.now()) {
            this.revokeSession("Sesión finalizada: El tiempo de autorización de misión (8 horas) ha expirado.");
            return false;
        }

        const expectedToken = this.getAuthToken(this.user, serverOrMergedData);
        const currentToken = this.user.authToken || '';
        const isEntityValid = this.user.admin
            ? !!(serverOrMergedData?.config?.teachers?.[this.user.role])
            : !!(serverOrMergedData?.companies?.[this.user.coId]);

        // En arquitectura Zero-Trust, el estado remoto no transporta credenciales en texto plano.
        // Si expectedToken puede ser calculado en memoria local, se valida coincidencia exacta.
        if (!isEntityValid || (expectedToken && currentToken && currentToken !== expectedToken)) {
            this.revokeSession("Sesión finalizada: Las credenciales de acceso han sido modificadas por coordinación.");
            return false;
        }
        return true;
    },

    revokeSession(reason) {
        clearTimeout(this.syncTimer);
        this.user = null;
        this.currentUser = null;
        this.pin = '';
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
        const ok = await this.pushToCloud(false);
        return ok;
    },

    async updateTeacherPin(teacherKey, newPin) {
        const t = this.data.config?.teachers?.[teacherKey];
        if (!t) return false;
        clearTimeout(this.syncTimer);
        const now = Date.now();
        t.pin = String(newPin || '').trim();
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
        const ok = await this.pushToCloud(false);
        return ok;
    },

    async updateCompanyCode(coId, newCode) {
        const co = this.data.companies?.[coId];
        if (!co) return false;
        clearTimeout(this.syncTimer);
        this.setCompanyCode(co, newCode, true);
        this.data.lastUpdated = Date.now();

        if (this.user && !this.user.admin && this.user.coId === coId) {
            const refreshed = { ...this.user, authToken: this.getAuthToken(this.user, this.data) };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        const ok = await this.pushToCloud(false);
        return ok;
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
        
        setInterval(() => { 
            const el = document.getElementById('hud-clock'); 
            if(el) el.innerText = `TIME: ${new Date().toLocaleTimeString()}`; 
        }, 1000);

        if (!this._listenersAttached) {
            this._listenersAttached = true;
            if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => {
                if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                    this.fetchFromCloud();
                }
            }, 12000);

            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        this.fetchFromCloud();
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
    },

    resumePolling() {
        this.pausePolling = false;
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (!this.pausePolling && typeof document !== 'undefined' && document.visibilityState === 'visible') {
                this.fetchFromCloud();
            }
        }, 12000);
    },

    async fetchFromCloud() {
        if (this.pausePolling) return false;
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let shouldRender = false;
        let networkOk = false;

        try {
            const res = await fetch('/api/state', { cache: 'no-store' });
            if(res.ok) {
                this._hasWarnedCloudNetwork = false;
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

                    try { localStorage.setItem('marsket_emergency_snapshot', JSON.stringify(this.data)); } catch(e) {}
                    const merged = this.mergeData(this.migrate(json), this.data);
                    this.data = merged;
                    this.data.version = json.version || this.data.version;
                    this.saveLocalOnly();
                    this.isCloudOnline = true;

                    const sessionValid = this.verifySessionIntegrity(this.data);
                    if (sessionValid && this.isOfflineContained) {
                        this.setOfflineContainment(false);
                    }
                    shouldRender = sessionValid;
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
                if (!isEditingInput) {
                    ui.render();
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

    saveToLocal() {
        this.saveLocalOnly();
    },

    saveLocalOnly() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
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
        let shouldRenderConflict = false;
        let pushSuccess = false;
        
        try {
            const payload = JSON.parse(JSON.stringify(this.data));
            const token = this.getAuthToken(this.user, this.data);
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            const res = await fetch('/api/state', { method: 'POST', headers, body: JSON.stringify(payload) });
            
            if (res.status === 409 || res.status === 412) {
                if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                    ui.notify("⚠️ Conflicto de concurrencia detectado. Se ha sincronizado el registro más reciente de la nube sin sobrescribir datos ajenos.", "warning");
                }
                const fetchRes = await fetch('/api/state', { cache: 'no-store' });
                if (fetchRes.ok) {
                    const serverData = await fetchRes.json();
                    if (serverData && serverData.status !== 'empty') {
                        const migratedServer = this.migrate(serverData);
                        if (!this.verifySessionIntegrity(migratedServer)) {
                            this.data = migratedServer;
                            this.saveLocalOnly();
                            return false;
                        }
                        this.data = this.mergeData(migratedServer, this.data);
                        this.data.version = Number(serverData.version || this.data.version) + 1;
                        this.saveLocalOnly();
                        
                        const retryToken = this.getAuthToken(this.user, this.data);
                        const retryHeaders = {
                            'Content-Type': 'application/json',
                            ...(retryToken ? { 'Authorization': `Bearer ${retryToken}` } : {})
                        };
                        const retryRes = await fetch('/api/state', { method: 'POST', headers: retryHeaders, body: JSON.stringify(this.data) });
                        if (retryRes.ok) {
                            const retryJson = await retryRes.json().catch(() => null);
                            if (retryJson && retryJson.version) {
                                this.data.version = retryJson.version;
                                this.saveLocalOnly();
                            }
                            pushSuccess = true;
                        }
                        shouldRenderConflict = true;
                    }
                }
                this.isCloudOnline = pushSuccess;
                if (pushSuccess) {
                    this.consecutiveNetworkFailures = 0;
                    if (this.isOfflineContained) this.setOfflineContainment(false);
                }
            } else if (res.ok) {
                const json = await res.json().catch(() => null);
                if (json && json.version) {
                    this.data.version = json.version; 
                    this.saveLocalOnly();
                }
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                pushSuccess = true;
            } else {
                this.isCloudOnline = false;
                this.consecutiveNetworkFailures = 0;
                if (res.status === 403) {
                    console.warn("[SECURITY] Petición pushToCloud rechazada por permisos (HTTP 403).");
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

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        if (!co) return; 
        const currentBal = Math.round((Number(co.balance || 0) + Number.EPSILON) * 100) / 100;
        const deltaNum = Math.round((Number(delta || 0) + Number.EPSILON) * 100) / 100;
        co.balance = Math.round(((currentBal + deltaNum) + Number.EPSILON) * 100) / 100;
        co.updatedAt = Date.now();
        co.ledger = co.ledger || [];
        co.ledger.unshift({ id: 'TX-' + Math.random().toString(36).substr(2, 5).toUpperCase(), date: new Date().toLocaleString(), concept, dept, delta: deltaNum, final: co.balance });
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