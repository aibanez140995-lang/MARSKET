// tools/audit-integrity.mjs
// Auditoría estática de integridad de MARS-KET 2.0 (v1.0.19)
// Genera un inventario completo de funcionalidad, valida referencias y detecta regresiones.

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FILES = [
    'index.html',
    'js/config.js',
    'js/state.js',
    'js/auth.js',
    'js/ui-core.js',
    'js/ui-empresa-core.js',
    'js/ui-empresa-market.js',
    'js/ui-empresa-tech.js',
    'js/ui-empresa-finance.js',
    'js/ui-empresa-ops.js',
    'js/ui-empresa-gov-brand.js',
    'js/ui-docente-core.js',
    'js/ui-docente-eval.js',
    'js/ui-docente-management.js',
    'functions/api/state.js'
];

// Cargar baseline oficial desde scratch si existe, o usar la línea base validada de ULTIMA_VERSION_BUENA
const SCRATCH_BASELINE = 'C:/Users/aiban/.gemini/antigravity/brain/24b00a02-2bbb-4d25-b67b-70b9ccb1cfdb/scratch/baseline_inventory.json';
let BASELINE_FUNCTIONS = null;

if (fs.existsSync(SCRATCH_BASELINE)) {
    try {
        const raw = JSON.parse(fs.readFileSync(SCRATCH_BASELINE, 'utf8'));
        if (raw && raw.definedFunctions) {
            BASELINE_FUNCTIONS = raw.definedFunctions;
        }
    } catch (e) {
        // Fallback a lista estática
    }
}

if (!BASELINE_FUNCTIONS) {
    BASELINE_FUNCTIONS = {
        ui: [
            "addCatalogItem", "addToCart", "approveMktCamp", "approveOrder", "calcRealtimeGrade",
            "checkLexicon", "closeModal", "closeOnboarding", "confirmAssignSponsor", "confirmBuyB2B",
            "confirmCart", "confirmConsumeMktAction", "confirmPublishB2B", "confirmRequestMktPackage",
            "confirmSellB2B", "createStartup", "deleteCatalogItem", "deleteStartup", "deleteSuggestion",
            "dismissNotification", "downloadFile", "downloadStateJSON", "executePhysicalOrder",
            "executeTieBreaker", "exportActaCSV", "exportCredentialsCSV", "finalizeDenyBrand",
            "finalizeRenameStartup", "forceCloudBackup", "generateHeroBanner", "getDeadlineStatus",
            "handleDeliverableLinkSubmit", "handleLogoUpload", "hasForbiddenWords", "modalAEEFine",
            "modalAssignSponsor", "modalBuyB2B", "modalChangelog", "modalCheckout", "modalConsumeMktAction",
            "modalCreateAuxRole", "modalCrisisAction", "modalCustom", "modalMotion", "modalPublishB2B",
            "modalReportAI", "modalReportInactivity", "modalRequestMktPackage", "modalSellB2B",
            "modalSuggestion", "modalVirtualSpend", "navigate", "playLoginAnimation", "promptDenyBrand",
            "promptRenameStartup", "promptRequestNameChange", "promptTieBreaker", "pushNotification",
            "recordSecurityIncident", "regenerateCompanyCode", "rejectMktCamp", "rejectOrder",
            "removeFromCart", "render", "renderAdminBackups", "renderAdminCatalog", "renderAdminDash",
            "renderAdminEval", "renderAdminHR", "renderAdminSettings", "renderAdminStartups",
            "renderAdminTelemetry", "renderB2BMarket", "renderCatalog", "renderDocBadge",
            "renderDossierContent", "renderDriveLinkBox", "renderNotifications", "renderWorkflowTracker",
            "resolveAuxRoleRequest", "resolveB2BContract", "resolveBrandApproval", "resolveHRReport",
            "resolveMotion", "resolveNameChangeRequest", "resolveSecurityIncident", "restoreStateFromJSON",
            "saveBrandIdentityText", "saveDeadlines", "saveGrade", "selectEvalCo", "setBrandDocTab",
            "setCronogramaSubjectFilter", "setTechDocTab", "setupPwaBlackIcon", "showCompanyLogins",
            "showDossierTab", "showGuide", "showModal", "showWelcomeModal", "submitAEEFine",
            "submitAuxRole", "submitCrisisAction", "submitCustom", "submitFlightTest",
            "submitInactivityReport", "submitMotion", "submitNameChangeRequest", "submitReportAI",
            "submitSuggestion", "teacherValidate", "toggleBomItem", "updateBadges",
            "updateCatalogPrice", "updateCompanyCode", "updateHUD", "updatePIN", "updateSuggestionStatus",
            "validateAIPrompt", "viewAILog", "viewAdmin", "viewBrand", "viewCart", "viewDossier",
            "viewFinance", "viewLogin", "viewMarket", "viewOrders", "viewResolutions", "viewTech",
            "voteMotion"
        ],
        state: [
            "addToLedger", "decodeSecret", "encodeSecret", "fetchFromCloud", "generateCompanyCode",
            "getCompanyCode", "getRolePin", "init", "mergeData", "migrate", "pushToCloud",
            "save", "saveLocalOnly", "setCompanyCode", "setRolePin"
        ],
        auth: [
            "activateTeacherLogin", "buildNav", "clear", "completeLogin", "logout", "press",
            "resetCompanyStep", "updateDots", "updateRoleOptions", "validateCompanyCode", "verify"
        ],
        telemetry: ["log", "startSession"],
        dev: ["handleTrigger"]
    };
}

function runAudit() {
    const report = {
        timestamp: new Date().toISOString(),
        version: '1.0.19b',
        files: {},
        definedFunctions: { ui: [], state: [], auth: [], telemetry: [], dev: [] },
        calledFunctions: { ui: [], state: [], auth: [], telemetry: [], dev: [] },
        brokenReferences: [],
        handlers: { total: 0, broken: [], list: [] },
        tabMap: {
            roles: {
                CEO: { primary: 'dashboard', render: 'ui.viewDashboard', tabs: ['dashboard', 'orders', 'resolutions', 'role_deliverables', 'dossier'] },
                TECNICO: { primary: 'market', render: 'ui.viewTech', tabs: ['market', 'tech_workshop', 'orders', 'tech', 'resolutions', 'role_deliverables', 'dossier'] },
                FINANZAS: { primary: 'finance', render: 'ui.viewFinance', tabs: ['finance', 'orders', 'resolutions', 'role_deliverables', 'dossier'] },
                MARKETING: { primary: 'brand', render: 'ui.viewBrand', tabs: ['brand', 'campaigns', 'orders', 'resolutions', 'role_deliverables', 'dossier'] },
                OPERACIONES_IA: { primary: 'cart', render: 'ui.viewCart', tabs: ['cart', 'ailog', 'orders', 'resolutions', 'role_deliverables', 'dossier'] },
                AUXILIAR: { primary: 'dashboard', render: 'ui.viewDashboard', tabs: ['dashboard', 'orders', 'resolutions', 'role_deliverables', 'dossier'] },
                DOCENTE: { primary: 'admin', render: 'ui.viewAdmin', tabs: ['admin', 'market', 'dossier'] }
            },
            adminTabs: {
                dash: 'ui.renderAdminDash()',
                eval: 'ui.renderAdminEval()',
                startups: 'ui.renderAdminStartups()',
                telemetry: 'ui.renderAdminTelemetry()',
                hr: 'ui.renderAdminHR()',
                catalog: 'ui.renderAdminCatalog()',
                settings: 'ui.renderAdminSettings()',
                backups: 'ui.renderAdminBackups()'
            }
        },
        idAudit: {
            duplicateStaticIds: [],
            missingReferencedIds: [],
            totalStaticIds: 0,
            totalReferencedIds: 0
        },
        regressionsVsBaseline: [],
        summary: {
            brokenReferencesCount: 0,
            missingHandlersCount: 0,
            regressionsCount: 0,
            duplicateIdsCount: 0,
            missingReferencedIdsCount: 0,
            status: 'PENDING'
        }
    };

    let allCode = '';
    const fileContents = {};

    for (const file of FILES) {
        const fullPath = path.join(ROOT, file);
        if (!fs.existsSync(fullPath)) {
            report.regressionsVsBaseline.push(`ARCHIVO FALTANTE: ${file}`);
            continue;
        }
        const content = fs.readFileSync(fullPath, 'utf8');
        fileContents[file] = content;
        const lineCount = content.split(/\r?\n/).length;
        const byteCount = Buffer.byteLength(content, 'utf8');
        report.files[file] = { lines: lineCount, bytes: byteCount };
        allCode += `\n// --- FILE: ${file} ---\n` + content;
    }

    // 1. EVALUAR DEFINICIONES EN ENTORNO VM AISLADO
    const sandbox = {
        window: { addEventListener: () => {} },
        document: {
            getElementById: () => null,
            querySelector: () => null,
            querySelectorAll: () => []
        },
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        fetch: async () => ({ ok: true, json: async () => ({}) }),
        setInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {},
        alert: () => {},
        confirm: () => true,
        prompt: () => '',
        console,
        Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map, Error, URL, Blob,
        FileReader: class {},
        btoa: str => Buffer.from(str, 'binary').toString('base64'),
        atob: b64 => Buffer.from(b64, 'base64').toString('binary')
    };
    vm.createContext(sandbox);

    // Ejecutar archivos JS en orden
    const jsFiles = FILES.filter(f => f.startsWith('js/'));
    for (const f of jsFiles) {
        const content = fileContents[f];
        // Reemplazar const al nivel superior con var para adjuntarse al sandbox
        const modContent = content.replace(
            /^const (state|telemetry|auth|dev|ui|APP_VERSION|ROLES_EXTRA|REGULATORY_AGENCIES|GLOBAL_WEIGHTS|RUBRIC_CONFIG|DELIVERABLES_DEF|MARKETING_PACKAGES|FORBIDDEN_WORDS|APP_CHANGELOG|DEFAULT_DEADLINES|INITIAL_DATA|MASTER_TEACHER_DIGESTS)\b/gm,
            'var $1'
        );
        try {
            vm.runInContext(modContent, sandbox, { filename: f });
        } catch (err) {
            report.regressionsVsBaseline.push(`ERROR EVALUANDO ${f}: ${err.message}`);
        }
    }

    for (const objName of ['ui', 'state', 'auth', 'telemetry', 'dev']) {
        if (sandbox[objName]) {
            report.definedFunctions[objName] = Object.keys(sandbox[objName])
                .filter(k => typeof sandbox[objName][k] === 'function')
                .sort();
        }
    }

    // 2. EXTRAER LLAMADAS A FUNCIONES (ui.X, state.X, auth.X, telemetry.X, dev.X, this.X)
    const callRegex = /\b(ui|state|auth|telemetry|dev)\.([a-zA-Z0-9_]+)\s*\(/g;
    let cm;
    const calledSet = { ui: new Set(), state: new Set(), auth: new Set(), telemetry: new Set(), dev: new Set() };
    while ((cm = callRegex.exec(allCode)) !== null) {
        calledSet[cm[1]].add(cm[2]);
    }

    // Métodos nativos de JS para no confundir con métodos custom
    const standardJSBuiltins = new Set([
        'split', 'replace', 'trim', 'toLowerCase', 'toUpperCase', 'indexOf', 'includes',
        'substring', 'slice', 'padStart', 'padEnd', 'startsWith', 'endsWith', 'match',
        'filter', 'map', 'forEach', 'reduce', 'find', 'some', 'every', 'sort', 'concat',
        'push', 'pop', 'shift', 'unshift', 'join', 'reverse', 'has', 'add', 'delete',
        'get', 'set', 'clear', 'keys', 'values', 'entries', 'then', 'catch', 'finally',
        'addEventListener', 'removeEventListener', 'parentElement', 'closest', 'querySelector',
        'querySelectorAll', 'getElementById', 'getAttribute', 'setAttribute', 'removeAttribute',
        'classList', 'style', 'focus', 'blur', 'click', 'submit', 'reset', 'scrollIntoView', 'toString', 'valueOf',
        'normalize', 'charCodeAt', 'fromCharCode'
    ]);

    for (const f of FILES) {
        if (f.startsWith('js/ui-') || f === 'js/ui-core.js') {
            const content = fileContents[f];
            const thisRegex = /\bthis\.([a-zA-Z0-9_]+)\s*\(/g;
            let tm;
            while ((tm = thisRegex.exec(content)) !== null) {
                if (!standardJSBuiltins.has(tm[1])) {
                    calledSet.ui.add(tm[1]);
                }
            }
        } else if (f === 'js/state.js') {
            const content = fileContents[f];
            const thisRegex = /\bthis\.([a-zA-Z0-9_]+)\s*\(/g;
            let tm;
            while ((tm = thisRegex.exec(content)) !== null) {
                if (!standardJSBuiltins.has(tm[1])) {
                    calledSet.state.add(tm[1]);
                }
            }
        }
    }

    for (const k of Object.keys(calledSet)) {
        report.calledFunctions[k] = [...calledSet[k]].sort();
    }

    // Verificar referencias rotas
    for (const objName of ['ui', 'state', 'auth', 'telemetry', 'dev']) {
        const defSet = new Set(report.definedFunctions[objName] || []);
        for (const fn of report.calledFunctions[objName]) {
            if (!defSet.has(fn)) {
                report.brokenReferences.push(`${objName}.${fn}()`);
            }
        }
    }

    // 3. INVENTARIO DE EVENT HANDLERS INLINE Y VALIDACIÓN DE DESTINO
    const handlerRegex = /\b(onclick|onchange|oninput|onkeydown|onsubmit)="([^"]+)"/g;
    for (const f of FILES) {
        const content = fileContents[f];
        let hm;
        while ((hm = handlerRegex.exec(content)) !== null) {
            report.handlers.total++;
            const attr = hm[1];
            const target = hm[2];
            report.handlers.list.push({ file: f, attr, target });

            // Extraer llamadas en el handler: ej. ui.foo(...), auth.bar(...)
            const targetCallRegex = /\b(ui|state|auth|telemetry|dev)\.([a-zA-Z0-9_]+)\s*\(/g;
            let tcm;
            while ((tcm = targetCallRegex.exec(target)) !== null) {
                const targetObj = tcm[1];
                const targetFn = tcm[2];
                const defSet = new Set(report.definedFunctions[targetObj]);
                if (!defSet.has(targetFn)) {
                    report.handlers.broken.push({
                        file: f,
                        attr,
                        call: `${targetObj}.${targetFn}()`,
                        target
                    });
                }
            }
        }
    }

    // 4. AUDITORÍA DE IDs (DUPLICADOS Y REFERENCIADOS QUE NO EXISTEN)
    const definedIdsMap = new Map();
    const referencedIds = new Set();

    // Extraer IDs de index.html
    const indexHtml = fileContents['index.html'] || '';
    const idHtmlRegex = /\bid=["']([^"']+)["']/g;
    let im;
    const staticIndexIds = new Set();
    while ((im = idHtmlRegex.exec(indexHtml)) !== null) {
        const id = im[1];
        if (staticIndexIds.has(id)) {
            report.idAudit.duplicateStaticIds.push(id);
        }
        staticIndexIds.add(id);
        if (!definedIdsMap.has(id)) definedIdsMap.set(id, []);
        definedIdsMap.get(id).push('index.html');
    }
    report.idAudit.totalStaticIds = staticIndexIds.size;

    // Extraer IDs en plantillas JS (tanto literales como badges dinámicos)
    for (const f of FILES) {
        if (f.endsWith('.js')) {
            const content = fileContents[f];
            let jm;
            while ((jm = idHtmlRegex.exec(content)) !== null) {
                const id = jm[1];
                if (!id.includes('${')) {
                    if (!definedIdsMap.has(id)) definedIdsMap.set(id, []);
                    definedIdsMap.get(id).push(f);
                }
            }
            // Registrar badges de pestañas tácticas definidos en js/auth.js
            const badgeRegex = /badge:\s*['"]([a-zA-Z0-9_\-]+)['"]/g;
            let bm;
            while ((bm = badgeRegex.exec(content)) !== null) {
                const badgeId = bm[1];
                if (!definedIdsMap.has(badgeId)) definedIdsMap.set(badgeId, []);
                definedIdsMap.get(badgeId).push(f);
            }
        }
    }

    // Extraer IDs referenciados mediante getElementById y querySelector
    const getElRegex = /getElementById\(\s*['"]([a-zA-Z0-9_\-]+)['"]\s*\)/g;
    const queryElRegex = /querySelector(?:All)?\(\s*['"]#([a-zA-Z0-9_\-]+)['"]\s*\)/g;

    for (const f of FILES) {
        const content = fileContents[f];
        let gm;
        while ((gm = getElRegex.exec(content)) !== null) {
            referencedIds.add(gm[1]);
        }
        while ((gm = queryElRegex.exec(content)) !== null) {
            referencedIds.add(gm[1]);
        }
    }
    report.idAudit.totalReferencedIds = referencedIds.size;

    // Verificar si algún ID referenciado no existe en index.html ni en plantillas
    for (const refId of referencedIds) {
        if (!definedIdsMap.has(refId)) {
            const isDynamicPrefix = ['dl-', 'price-', 'val-price-', 'bom-', 'rubric-', 'sugg-', 'grade-'].some(p => refId.startsWith(p));
            if (!isDynamicPrefix) {
                report.idAudit.missingReferencedIds.push(refId);
            }
        }
    }

    // 5. REGRESIONES RESPECTO AL BASELINE DE FUNCIONES
    for (const [objName, fnList] of Object.entries(BASELINE_FUNCTIONS)) {
        const curSet = new Set(report.definedFunctions[objName] || []);
        for (const expectedFn of fnList) {
            if (!curSet.has(expectedFn)) {
                report.regressionsVsBaseline.push(`FUNCIÓN PERDIDA RESPECTO A BASELINE: ${objName}.${expectedFn}()`);
            }
        }
    }

    // 6. RESUMEN Y CRITERIO DE ACEPTACIÓN
    report.summary.brokenReferencesCount = report.brokenReferences.length;
    report.summary.missingHandlersCount = report.handlers.broken.length;
    report.summary.regressionsCount = report.regressionsVsBaseline.length;
    report.summary.duplicateIdsCount = report.idAudit.duplicateStaticIds.length;
    report.summary.missingReferencedIdsCount = report.idAudit.missingReferencedIds.length;

    const isSuccess = (
        report.summary.brokenReferencesCount === 0 &&
        report.summary.missingHandlersCount === 0 &&
        report.summary.regressionsCount === 0 &&
        report.summary.duplicateIdsCount === 0 &&
        report.summary.missingReferencedIdsCount === 0
    );

    report.summary.status = isSuccess ? 'PASS' : 'FAIL';

    return report;
}

const audit = runAudit();
console.log(JSON.stringify(audit, null, 2));

if (audit.summary.status !== 'PASS') {
    process.exitCode = 1;
}
