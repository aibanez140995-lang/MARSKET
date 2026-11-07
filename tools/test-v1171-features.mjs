import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const FILES = [
    'js/config.js',
    'js/state.js',
    'js/auth.js',
    'js/ui-core.js',
    'js/ui-empresa-core.js'
];

function setupSandbox() {
    const sandbox = {
        window: { addEventListener: () => {} },
        document: {
            documentElement: { scrollTop: 0, getAttribute: () => null, setAttribute: () => {}, removeAttribute: () => {} },
            body: { appendChild: () => {} },
            getElementById: () => ({ value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} }),
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: () => ({ innerHTML: '', appendChild: () => {}, setAttribute: () => {}, classList: { add: () => {}, remove: () => {} }, style: {} })
        },
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        fetch: async () => ({ ok: true, json: async () => ({}) }),
        setInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {},
        console,
        Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map, Error, URL, Blob
    };
    vm.createContext(sandbox);

    for (const f of FILES) {
        const fullPath = path.join(ROOT, f);
        const content = fs.readFileSync(fullPath, 'utf8');
        const modContent = content.replace(
            /^const (state|telemetry|auth|dev|ui|APP_VERSION|ROLES_EXTRA|REGULATORY_AGENCIES|GLOBAL_WEIGHTS|RUBRIC_CONFIG|DELIVERABLES_DEF|MARKETING_PACKAGES|FORBIDDEN_WORDS|APP_CHANGELOG|DEFAULT_DEADLINES|INITIAL_DATA|MASTER_TEACHER_DIGESTS|OFFICIAL_DOC_TEMPLATES|WORKSHOP_INCIDENCE_REASONS|GOOGLE_DRIVE_REGEX|PROJECT_PHASES_DEF)\b/gm,
            'var $1'
        );
        vm.runInContext(modContent, sandbox, { filename: f });
    }

    return sandbox;
}

const sandbox = setupSandbox();
const ui = sandbox.ui;
const state = sandbox.state;
const DELIVERABLES_DEF = sandbox.DELIVERABLES_DEF;

console.log("--- TEST SUITE v1.1.71: Phase Unlocking & Deliverable Scoping ---");

// 1. getCurrentPhaseInfo
const pInfo = ui.getCurrentPhaseInfo();
if (pInfo.id !== 'I' || pInfo.key !== 'I') throw new Error(`Esperado Fase I, obtenido id=${pInfo.id}, key=${pInfo.key}`);
console.log("✓ getCurrentPhaseInfo() devuelve id='I' y key='I' correctamente");

// 2. isPhaseUnlocked
const studentCo = { id: 'CO-01', name: 'AeroMars', isTestCompany: false, deliverables: {} };
state.user = { coId: 'CO-01', role: 'CEO', admin: false };
state.data = { companies: { 'CO-01': studentCo }, config: {} };

if (ui.isPhaseUnlocked('I', studentCo) !== true) throw new Error("Fase I debe estar desbloqueada");
if (ui.isPhaseUnlocked('II', studentCo) !== false) throw new Error("Fase II debe estar bloqueada para alumno en noviembre");
if (ui.isPhaseUnlocked('III', studentCo) !== false) throw new Error("Fase III debe estar bloqueada para alumno en noviembre");
if (ui.isPhaseUnlocked('IV', studentCo) !== false) throw new Error("Fase IV debe estar bloqueada para alumno en noviembre");
console.log("✓ isPhaseUnlocked bloquea fases futuras (II, III, IV) para alumnado");

// 3. Admin y Empresa TEST
state.user.admin = true;
if (ui.isPhaseUnlocked('II', studentCo) !== true) throw new Error("Para admin todas las fases deben estar desbloqueadas");
state.user.admin = false;

const testCo = { id: 'CO-TEST', name: 'TestCo', isTestCompany: true, deliverables: {} };
if (ui.isPhaseUnlocked('II', testCo) !== true) throw new Error("Para empresa TEST todas las fases deben estar desbloqueadas");
console.log("✓ Admin y Empresa TEST acceden a todas las fases");

// 4. Apertura manual por el Coordinador
state.data.config.deliverableSchedule = {
    goniometerEvidence: { openDate: '2026-11-01T00:00' }
};
if (ui.isPhaseUnlocked('II', studentCo) !== true) throw new Error("Apertura manual por Coordinador debería desbloquear Fase II");
delete state.data.config.deliverableSchedule;
if (ui.isPhaseUnlocked('II', studentCo) !== false) throw new Error("Al eliminar apertura manual, Fase II debe quedar bloqueada");
console.log("✓ Apertura manual por Coordinador funciona dinámicamente");

// 5. Entregables Fase I en DELIVERABLES_DEF
const phase1Defs = DELIVERABLES_DEF.filter(d => (ui.getDeliverablePhase ? ui.getDeliverablePhase(d.key) : (d.phase || 'I')) === 'I');
if (phase1Defs.length !== 4) throw new Error(`Fase I debe contener exactamente 4 entregables (obtenidos: ${phase1Defs.length})`);
console.log("✓ Fase I contiene exactamente 4 entregables:", phase1Defs.map(d => d.key));

console.log("\nTODOS LOS TESTS DE v1.1.71 HAN PASADO EXITOSAMENTE (PASS)");
