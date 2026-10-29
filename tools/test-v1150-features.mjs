// tools/test-v1150-features.mjs
// Suite de Validación de Arquitectura y Flujos v1.1.50
import fs from 'fs';
import assert from 'assert';

console.log("=== INICIANDO VALIDACIÓN DE REQUERIMIENTOS v1.1.50 ===");

let passed = 0;
let failed = 0;

function test(desc, fn) {
    try {
        fn();
        console.log(`  ✓ PASS: ${desc}`);
        passed++;
    } catch (err) {
        console.error(`  ✗ FAIL: ${desc} -> ${err.message}`);
        failed++;
    }
}

// 1. Verificación de Versión
test("APP_VERSION es 1.1.50 en js/config.js", () => {
    const config = fs.readFileSync('js/config.js', 'utf8');
    assert(config.includes('const APP_VERSION = "1.1.50";'));
    assert(config.includes('version: "1.1.50"'));
});

test("index.html tiene referencias y cache-busting v1.1.50", () => {
    const html = fs.readFileSync('index.html', 'utf8');
    assert(html.includes('v1.1.50'));
    assert(html.includes('id="hud-version" class="text-xs text-slate-300 font-mono tracking-widest block mt-0.5">v1.1.50</span>'));
    assert(html.includes('id="footer-version" class="text-slate-400 font-mono text-[11px] sm:text-xs tracking-widest font-normal">v1.1.50</span>'));
    assert(!html.includes('v=1.1.49'));
});

test("sw.js está sincronizado en v1.1.50", () => {
    const sw = fs.readFileSync('sw.js', 'utf8');
    assert(sw.includes("const CACHE_NAME = 'marsket-cache-v1.1.50';"));
    assert(!sw.includes('v=1.1.49'));
});

test(".htaccess y api/index.php tienen cabeceras v1.1.50", () => {
    const ht = fs.readFileSync('.htaccess', 'utf8');
    const api = fs.readFileSync('api/index.php', 'utf8');
    assert(ht.includes('v1.1.50'));
    assert(api.includes('v1.1.50'));
});

// 2. Aterrizaje por Rol Coherente (Sugerencia 1)
test("landingByRole aterriza en el 1er botón de cada rol", () => {
    const auth = fs.readFileSync('js/auth.js', 'utf8');
    assert(auth.includes("'TECNICO': 'tech'"));
    assert(auth.includes("'FINANZAS': 'finance'"));
    assert(auth.includes("'OPERACIONES_IA': 'cart'"));
    assert(auth.includes("'CEO': 'dashboard'"));
    assert(auth.includes("'MARKETING': 'brand'"));
});

// 3. Botón SUPER-MARSKET y Botonera Técnico (Bloque 2 + Sugerencia 2A)
test("tabDefs contiene SUPER-MARSKET con badge-market", () => {
    const auth = fs.readFileSync('js/auth.js', 'utf8');
    assert(auth.includes("'market': { id: 'market', label: '🛒 SUPER-MARSKET', badge: 'badge-market' }"));
});

test("roleTabOrders para TECNICO incluye 'market' y termina en 'dossier'", () => {
    const auth = fs.readFileSync('js/auth.js', 'utf8');
    assert(auth.includes("'TECNICO': ['tech', 'tech_workshop', 'market', 'orders', 'resolutions', 'role_deliverables', 'dossier']"));
});

test("updateRoleBadges actualiza badge-market con items en carrito", () => {
    const uiCore = fs.readFileSync('js/ui-core.js', 'utf8');
    assert(uiCore.includes("const elMarket = document.getElementById('badge-market');"));
    assert(uiCore.includes("const cartItems = (co.cart || []).length;"));
});

// 4. Limpieza de Seguimiento de Órdenes (Bloque 1)
test("viewOrders no renderiza cronogramaSection", () => {
    const uiFin = fs.readFileSync('js/ui-empresa-finance.js', 'utf8');
    assert(!uiFin.includes('const cronogramaSection'));
    assert(!uiFin.includes('CRONOGRAMA MAESTRO DE ENTREGAS'));
    assert(uiFin.includes('wrapper.innerHTML = crisisHtml + kpisHtml + bovedaSection;'));
});

test("ui.render() case 'dossier' no inyecta cronoDiv duplicado", () => {
    const uiCore = fs.readFileSync('js/ui-core.js', 'utf8');
    assert(uiCore.includes("case 'dossier': vp.innerHTML = hero + notifs; this.viewDossier(vp); break;"));
    assert(!uiCore.includes("cronoDiv.innerHTML = this.renderCronogramaSection()"));
});

// 5. Pestaña 'Cronograma' en Dossier (Bloque 1 + Sugerencia 3)
test("viewDossier incluye 3 botones de pestañas: eval, docs y cronograma", () => {
    const uiEmpCore = fs.readFileSync('js/ui-empresa-core.js', 'utf8');
    assert(uiEmpCore.includes("ui.showDossierTab('eval')"));
    assert(uiEmpCore.includes("ui.showDossierTab('docs')"));
    assert(uiEmpCore.includes("ui.showDossierTab('cronograma')"));
    assert(uiEmpCore.includes("📅 Cronograma"));
});

test("renderDossierContent conmuta a renderCronogramaSection al elegir 'cronograma'", () => {
    const uiEmpCore = fs.readFileSync('js/ui-empresa-core.js', 'utf8');
    assert(uiEmpCore.includes("if (tab === 'cronograma')"));
    assert(uiEmpCore.includes("this.renderCronogramaSection(targetCoId)"));
});

test("renderCronogramaSection incluye insignias de Fase y ordenación por fase", () => {
    const uiCore = fs.readFileSync('js/ui-core.js', 'utf8');
    assert(uiCore.includes("FASE ${this.escapeHTML(currPhase)}"));
    assert(uiCore.includes("const phaseOrder = { 'I': 1, 'II': 2, 'III': 3, 'IV': 4 };"));
});

console.log("\n=======================================================");
console.log(`TOTAL PRUEBAS EJECUTADAS: ${passed + failed}`);
console.log(`PRUEBAS SUPERADAS: ${passed}`);
console.log(`PRUEBAS FALLIDAS: ${failed}`);
console.log(`ESTADO FINAL: ${failed === 0 ? 'TODO CORRECTO [PASS]' : 'ERRORES DETECTADOS [REJECT]'}`);
console.log("=======================================================");

if (failed > 0) process.exit(1);
