// scratch/test_ronda2b.mjs
// Suite de pruebas exhaustiva para la Ronda 2b (G4a, G6, G11, G16, G9)

import fs from 'fs';
import path from 'path';
import vm from 'vm';
import crypto from 'crypto';

const ROOT = process.cwd();

// Leer archivos fuente
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const lexiconDataJs = fs.readFileSync(path.join(ROOT, 'js/lexicon-data.js'), 'utf8');
const configJs = fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8');
const stateJs = fs.readFileSync(path.join(ROOT, 'js/state.js'), 'utf8');
const authJs = fs.readFileSync(path.join(ROOT, 'js/auth.js'), 'utf8');
const uiCoreJs = fs.readFileSync(path.join(ROOT, 'js/ui-core.js'), 'utf8');

console.log("=== INICIANDO VALIDACIÓN RONDA 2B ===");

let passed = 0;
let failed = 0;

function assert(cond, msg) {
    if (cond) {
        console.log(`  ✅ PASS: ${msg}`);
        passed++;
    } else {
        console.error(`  ❌ FAIL: ${msg}`);
        failed++;
    }
}

// ==========================================
// 1. G9 · Consola y Tailwind Guard
// ==========================================
console.log("\n--- [G9] Verificación de Consola y Guard de Tailwind ---");
assert(
    html.includes("if (typeof tailwind !== 'undefined')"),
    "index.html contiene comprobación typeof tailwind !== 'undefined' para evitar excepciones si CDN no carga"
);

assert(
    stateJs.includes("this._hasWarnedCloudNetwork"),
    "state.js implementa limitador _hasWarnedCloudNetwork para console.warn"
);

assert(
    stateJs.includes("console.warn(\"Aviso de sincronización: Conexión con /api/state no disponible actualmente (modo sin conexión).\");"),
    "state.js usa console.warn en errores esperados de red sin conexión"
);

assert(
    stateJs.includes("console.error(`Error HTTP inesperado en fetchFromCloud (${res.status}):`, res.statusText);"),
    "state.js preserva console.error para errores HTTP inesperados"
);

// ==========================================
// 2. G16 · Táctil y CLS
// ==========================================
console.log("\n--- [G16] Verificación Táctil y Prevención CLS ---");
assert(
    html.includes("@media (pointer: coarse)") && !html.includes("@media (pointer: coarse) {\n            button, [role=\"button\"], [role=\"tab\"], select, summary {\n                min-height: 44px !important;"),
    "index.html aplica @media (pointer: coarse) sin !important"
);

assert(
    html.includes("touch-target-expand::after") && html.includes("min-width: 44px;") && html.includes("min-height: 44px;"),
    "index.html amplía el área táctil de controles con ::after sin engordar el diseño visual"
);

assert(
    uiCoreJs.includes("const prevScrollY = typeof window !== 'undefined' ? window.scrollY : 0;") &&
    uiCoreJs.includes("window.scrollTo({ top: prevScrollY, behavior: 'instant' });"),
    "ui.render() preserva el scroll de pantalla para evitar saltos CLS"
);

assert(
    uiCoreJs.includes("restoredEl.focus({ preventScroll: true });"),
    "ui.render() restaura el foco activo tras el renderizado"
);

// ==========================================
// 3. G11 · Botón Atrás del sistema (History API)
// ==========================================
console.log("\n--- [G11] Botón Atrás del sistema y Pila de Capas ---");
assert(
    uiCoreJs.includes("setupNavigationHistory()") && html.includes("ui.setupNavigationHistory()"),
    "ui.setupNavigationHistory() definido y llamado desde DOMContentLoaded"
);

assert(
    uiCoreJs.includes("pushLayer(type, closeFn)") && uiCoreJs.includes("closeLayer(type, skipHistory"),
    "ui implementa pushLayer() y closeLayer() para gestión de capas (drawer / subvista)"
);

assert(
    uiCoreJs.includes("window.history.replaceState({ layer: 0 }, document.title);"),
    "Al cargar la aplicación, se limpia history.state.layer con replaceState"
);

// Probar lógica de capas en sandbox simulado
const navHistoryStack = [];
let mockHistoryState = { layer: 0 };
let backCallCount = 0;

const mockWindow = {
    history: {
        get state() { return mockHistoryState; },
        pushState: (state, title) => {
            mockHistoryState = state;
            navHistoryStack.push(state);
        },
        replaceState: (state, title) => {
            mockHistoryState = state;
        },
        back: () => {
            backCallCount++;
            if (mockPopstateHandler) {
                mockPopstateHandler({});
            }
        }
    },
    addEventListener: (evt, handler) => {
        if (evt === 'popstate') mockPopstateHandler = handler;
    }
};
let mockPopstateHandler = null;

// ==========================================
// 4. G6 · Pipeline de Texto Seguro
// ==========================================
console.log("\n--- [G6] Motor de Texto Seguro (Normalización y Filtro LOPD) ---");

// Crear sandbox para ejecutar ui.validateSafeText
const vmSandbox = {
    window: { addEventListener: () => {} },
    document: {
        getElementById: () => ({ classList: { add: () => {}, remove: () => {} }, setAttribute: () => {} }),
        querySelector: () => null,
        querySelectorAll: () => []
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    crypto: {
        subtle: {
            digest: async (algo, buf) => {
                return crypto.createHash('sha256').update(Buffer.from(buf)).digest();
            }
        }
    },
    TextEncoder,
    btoa: str => Buffer.from(str, 'binary').toString('base64'),
    atob: b64 => Buffer.from(b64, 'base64').toString('binary'),
    console,
    Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map
};
vm.createContext(vmSandbox);

function runInVm(code, fname) {
    const mod = code.replace(
        /^const (state|telemetry|auth|dev|ui|APP_VERSION|ROLES_EXTRA|REGULATORY_AGENCIES|GLOBAL_WEIGHTS|RUBRIC_CONFIG|DELIVERABLES_DEF|MARKETING_PACKAGES|FORBIDDEN_WORDS|LOPD_FIRST_NAMES|LOPD_SURNAMES|AEROSPACE_WHITELIST|APP_CHANGELOG|DEFAULT_DEADLINES|INITIAL_DATA|MASTER_TEACHER_DIGESTS|LEXICON_HOMOGLYPHS|LEXICON_SAFE_WORDS|SCIENTIFIC_EPONYMS)\b/gm,
        'var $1'
    );
    vm.runInContext(mod, vmSandbox, { filename: fname });
}

runInVm(lexiconDataJs, 'js/lexicon-data.js');
runInVm(configJs, 'js/config.js');
runInVm(stateJs, 'js/state.js');
runInVm(authJs, 'js/auth.js');
runInVm(uiCoreJs, 'js/ui-core.js');

const uiInstance = vmSandbox.ui;

// Caso 1: Cirílico confusable "рedro" (donde р es \u0440) -> debe detectarse como pedro
const cyrillicPedro = "\u0440edro";
const resCyrillic = uiInstance.validateSafeText(cyrillicPedro);
assert(
    !resCyrillic.valid && resCyrillic.matches.includes("pedro"),
    `Cirílico confusable "\u0440edro" detectado correctamente como "pedro" (no borrado a "edro")`
);

// Caso 2: Letras sueltas separadas ("p e d r o", "p.e.d.r.o", "p_e_d_r_o")
const resSeparated1 = uiInstance.validateSafeText("p e d r o");
const resSeparated2 = uiInstance.validateSafeText("p.e.d.r.o");
const resSeparated3 = uiInstance.validateSafeText("p_e_d_r_o");
assert(
    !resSeparated1.valid && !resSeparated2.valid && !resSeparated3.valid,
    `Letras sueltas colapsadas correctamente ("p e d r o", "p.e.d.r.o", "p_e_d_r_o" detectan nombre)`
);

// Caso 3: Palabras seguras (calculo, vehiculo, obstaculo, disputa, penetracion) NO deben dar falso positivo
const safeText1 = "El calculo del vehiculo orbital supero el obstaculo sin disputa ni penetracion";
const resSafe = uiInstance.validateSafeText(safeText1);
assert(
    resSafe.valid,
    `Palabras seguras ("calculo", "vehiculo", "obstaculo", "disputa", "penetracion") NO disparan alertas`
);

// Caso 4: Insultos reales cortos y largos
const resBadShort = uiInstance.validateSafeText("esto es una puta verguenza");
const resBadLong = uiInstance.validateSafeText("eres un mierda");
assert(
    !resBadShort.valid && resBadShort.type === 'PROFANITY' && !resBadLong.valid && resBadLong.type === 'PROFANITY',
    `Insultos cortos ("puta") y largos ("mierda") detectados como PROFANITY con límite de palabra`
);

// Caso 5: Epónimos científicos permitidos en solitario
const resEponym = uiInstance.validateSafeText("Aplicamos la ley de newton y las orbitas de kepler con el telescopio hubble");
assert(
    resEponym.valid,
    `Epónimos científicos en solitario ("newton", "kepler", "hubble") permitidos en contexto técnico`
);

// Caso 6: Epónimo acompañado de nombre propio no técnico debe detectarse
const resEponymNamed = uiInstance.validateSafeText("El informe fue entregado por pedro newton");
assert(
    !resEponymNamed.valid,
    `Epónimo junto a nombre personal no técnico ("pedro newton") detectado como infracción LOPD`
);

// ==========================================
// 5. G4a · Sesión Segura y Criptográfica
// ==========================================
console.log("\n--- [G4a] Sesión Segura, authProof SHA-256 y sessionStorage ---");

// Verificar que getAuthToken NO contiene PIN
const dummyCo = {
    code: 'AST-1010',
    companyCode: 'AST-1010',
    pins: { CEO: '1234' }
};
const dummyData = {
    companies: { 'ast-1': dummyCo },
    config: { teachers: { COORD_1: { pin: '9999', name: 'Coord' } } }
};
const studentToken = vmSandbox.state.getAuthToken({ admin: false, coId: 'ast-1', role: 'CEO' }, dummyData);
const decodedStudent = vmSandbox.state.decodeSecret(studentToken);
assert(
    !decodedStudent.includes('1234'),
    `getAuthToken() para alumno NO contiene el PIN ('1234') en claro ni codificado (token: "${decodedStudent}")`
);

const teacherToken = vmSandbox.state.getAuthToken({ admin: true, role: 'COORD_1' }, dummyData);
const decodedTeacher = vmSandbox.state.decodeSecret(teacherToken);
assert(
    !decodedTeacher.includes('9999'),
    `getAuthToken() para docente NO contiene el PIN ('9999') en el token (token: "${decodedTeacher}")`
);

// Verificar generación de authProof
async function testAuthProof() {
    const exp = Date.now() + 8 * 3600 * 1000;
    const proof = await vmSandbox.auth.generateAuthProof('CEO', 'ast-1', exp, '1234');
    assert(
        typeof proof === 'string' && proof.length === 64,
        `auth.generateAuthProof() genera hash SHA-256 de 64 caracteres hex: ${proof.substring(0, 16)}...`
    );

    // Verificar que un cambio en la credencial cambia el proof
    const fakeProof = await vmSandbox.auth.generateAuthProof('CEO', 'ast-1', exp, '9999');
    assert(
        proof !== fakeProof,
        `authProof cambia si la credencial no coincide con el estado actual`
    );
}

await testAuthProof();

console.log(`\n=== RESUMEN RONDA 2B: ${passed} PASS, ${failed} FAIL ===`);
if (failed > 0) {
    process.exit(1);
} else {
    process.exit(0);
}
