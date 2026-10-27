// tools/test-v1144-features.mjs
// Suite de validación exhaustiva para las especificaciones de la actualización v1.1.44

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
    'js/ui-empresa-core.js',
    'js/ui-empresa-market.js',
    'js/ui-empresa-tech.js',
    'js/ui-empresa-finance.js',
    'js/ui-empresa-ops.js',
    'js/ui-empresa-gov-brand.js',
    'js/ui-docente-core.js',
    'js/ui-docente-eval.js',
    'js/ui-docente-management.js'
];

function setupSandbox() {
    const sandbox = {
        window: { addEventListener: () => {} },
        document: {
            documentElement: { scrollTop: 0 },
            body: { appendChild: () => {} },
            getElementById: (id) => {
                if (sandbox.__domElements && sandbox.__domElements[id]) {
                    return sandbox.__domElements[id];
                }
                return { value: '', innerHTML: '', style: {}, classList: { add: () => {}, remove: () => {} }, appendChild: () => {} };
            },
            querySelector: () => null,
            querySelectorAll: () => [],
            createElement: (tag) => ({
                innerHTML: '',
                appendChild: () => {},
                setAttribute: () => {},
                classList: { add: () => {}, remove: () => {} },
                style: {}
            })
        },
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
        sessionStorage: { getItem: () => null, setItem: () => {} },
        fetch: async () => ({ ok: true, json: async () => ({}) }),
        setInterval: () => {},
        setTimeout: () => {},
        clearTimeout: () => {},
        requestAnimationFrame: (cb) => { if (typeof cb === 'function') cb(); },
        alert: () => {},
        confirm: () => true,
        prompt: () => '',
        console,
        Date, Math, JSON, Object, Array, String, Number, Boolean, RegExp, Set, Map, Error, URL, Blob,
        btoa: str => Buffer.from(str, 'binary').toString('base64'),
        atob: b64 => Buffer.from(b64, 'base64').toString('binary')
    };
    vm.createContext(sandbox);

    for (const f of FILES) {
        const fullPath = path.join(ROOT, f);
        const content = fs.readFileSync(fullPath, 'utf8');
        const modContent = content.replace(
            /^const (state|telemetry|auth|dev|ui|APP_VERSION|ROLES_EXTRA|REGULATORY_AGENCIES|GLOBAL_WEIGHTS|RUBRIC_CONFIG|DELIVERABLES_DEF|MARKETING_PACKAGES|FORBIDDEN_WORDS|APP_CHANGELOG|DEFAULT_DEADLINES|INITIAL_DATA|MASTER_TEACHER_DIGESTS|OFFICIAL_DOC_TEMPLATES|WORKSHOP_INCIDENCE_REASONS|GOOGLE_DRIVE_REGEX)\b/gm,
            'var $1'
        );
        vm.runInContext(modContent, sandbox, { filename: f });
    }

    return sandbox;
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ ${message}`);
        passed++;
    } else {
        console.error(`  ✗ FALLO: ${message}`);
        failed++;
    }
}

console.log("=== INICIANDO VALIDACIÓN DE REQUERIMIENTOS v1.1.44 ===\n");

const ctx = setupSandbox();
const { ui, state, auth, APP_VERSION, APP_CHANGELOG, OFFICIAL_DOC_TEMPLATES } = ctx;

// 1. Verificación de Versión
console.log("--- 1. Verificación de Versión ---");
assert(APP_VERSION === "1.1.44", `APP_VERSION es 1.1.44 (actual: ${APP_VERSION})`);
assert(APP_CHANGELOG[0].version === "1.1.44", `APP_CHANGELOG contiene entrada para 1.1.44`);

const indexHtml = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
assert(indexHtml.includes('id="hud-version" class="text-xs text-slate-300 font-mono tracking-widest block mt-0.5">v1.1.44</span>'), "index.html tiene hud-version v1.1.44");
assert(indexHtml.includes('id="footer-version" class="text-slate-400 font-mono text-[11px] sm:text-xs tracking-widest font-normal">v1.1.44</span>'), "index.html tiene footer-version v1.1.44");
assert(!indexHtml.includes('?v=1.1.43'), "index.html no tiene ninguna referencia residual a ?v=1.1.43");

const swJs = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
assert(swJs.includes("CACHE_NAME = 'marsket-cache-v1.1.44'"), "sw.js tiene CACHE_NAME v1.1.44");
assert(!swJs.includes('?v=1.1.43'), "sw.js no tiene ninguna referencia residual a ?v=1.1.43");

const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.json'), 'utf8'));
assert(manifest.start_url.includes('?v=1.1.44'), "manifest.json start_url tiene ?v=1.1.44");

// 2. Eliminación de DOC_8_CONTROL_AERO
console.log("\n--- 2. Eliminación de DOC_8_CONTROL_AERO ---");
assert(typeof OFFICIAL_DOC_TEMPLATES.DOC_8_CONTROL_AERO === 'undefined', "DOC_8_CONTROL_AERO no existe en OFFICIAL_DOC_TEMPLATES");
const opsCode = fs.readFileSync(path.join(ROOT, 'js/ui-empresa-ops.js'), 'utf8');
assert(!opsCode.includes('DOC_8_CONTROL_AERO'), "js/ui-empresa-ops.js no hace referencia a DOC_8_CONTROL_AERO");

// 3. Configuración de Pestañas y Navegación
console.log("\n--- 3. Configuración de Pestañas y Navegación ---");
const mockNav = { innerHTML: '', children: [], style: {} };
ctx.__domElements = { 'nav-container': mockNav };

state.data = { companies: { 'CO-TEST': { id: 'CO-TEST', name: 'TEST CO' } }, config: { deadlines: {}, guidelines: {} } };
state.user = { role: 'TECNICO', coId: 'CO-TEST', admin: false };
auth.buildNav(false);
const techNavHtml = mockNav.innerHTML;
assert(techNavHtml.includes('data-tab-id="tech_workshop"'), "Nav para TECNICO incluye pestaña 'tech_workshop'");
assert(techNavHtml.includes('data-tab-id="tech"'), "Nav para TECNICO incluye pestaña 'tech'");
assert(techNavHtml.includes('data-tab-id="market"'), "Nav para TECNICO incluye pestaña 'market'");

state.user = { role: 'MARKETING', coId: 'CO-TEST', admin: false };
auth._lastNavSignature = null;
auth.buildNav(false);
const mktNavHtml = mockNav.innerHTML;
assert(mktNavHtml.includes('data-tab-id="campaigns"'), "Nav para MARKETING incluye pestaña 'campaigns'");
assert(!mktNavHtml.includes('data-tab-id="market"'), "Nav para MARKETING NO incluye pestaña 'market'");
assert(mktNavHtml.includes('data-tab-id="brand"'), "Nav para MARKETING incluye pestaña 'brand'");

assert(typeof ui.viewCampaigns === 'function', "ui.viewCampaigns está definida");
assert(typeof ui.viewTechWorkshop === 'function', "ui.viewTechWorkshop está definida");

// 4. Bloqueo y Ocultación Global de Entregables
console.log("\n--- 4. Bloqueo y Ocultación Global de Entregables ---");
assert(typeof ui.isDeliverableLocked === 'function', "ui.isDeliverableLocked está definida");

// Configurar datos de prueba para bloqueo
const testCo = {
    id: 'CO-TEST',
    name: 'TEST STARTUP',
    deliverables: {
        preliminaryReport: { driveUrl: '' },
        technicalReport: { driveUrl: 'https://docs.google.com/document/d/12345/edit' }
    },
    orders: [],
    bom: [],
    balance: 5000,
    flightTests: []
};
state.data = {
    companies: { 'CO-TEST': testCo },
    config: {
        guidelines: {},
        deliverableSchedule: {
            preliminaryReport: { openDate: '2099-01-01T00:00' },
            technicalReport: { openDate: '2099-01-01T00:00' }
        }
    }
};
state.user = { coId: 'CO-TEST', role: 'TECNICO', admin: false };

// preliminaryReport no tiene driveUrl y fecha futura -> bloqueado
assert(ui.isDeliverableLocked('preliminaryReport', testCo) === true, "preliminaryReport sin driveUrl con fecha futura está bloqueado");
// technicalReport TIENE driveUrl aunque la fecha sea futura -> desbloqueado
assert(ui.isDeliverableLocked('technicalReport', testCo) === false, "technicalReport con driveUrl aunque fecha futura NO está bloqueado");

// Para admin nunca está bloqueado
state.user.admin = true;
assert(ui.isDeliverableLocked('preliminaryReport', testCo) === false, "Para admin nada está bloqueado");
state.user.admin = false;

// renderDriveLinkBox devuelve cadena vacía si está bloqueado para no-admin
const lockedBoxHtml = ui.renderDriveLinkBox('Test Box', 'Desc', 'preliminaryReport', testCo.deliverables.preliminaryReport);
assert(lockedBoxHtml === '', "renderDriveLinkBox retorna '' si el entregable está bloqueado");
const unlockedBoxHtml = ui.renderDriveLinkBox('Test Box', 'Desc', 'technicalReport', testCo.deliverables.technicalReport);
assert(unlockedBoxHtml.includes('technicalReport'), "renderDriveLinkBox retorna HTML si el entregable tiene driveUrl");

// 5. Destinos de Notificaciones Contextuales
console.log("\n--- 5. Destinos de Notificaciones Contextuales ---");
const targetCampaign = ui.resolveNotificationTarget({ role: 'MARKETING', message: 'Ha lanzado una campaña publicitaria' });
assert(targetCampaign.view === 'campaigns' && targetCampaign.anchorId === 'mkt-campaigns-section', "Notificación de marketing apunta a campaigns / mkt-campaigns-section");

const targetWorkshop = ui.resolveNotificationTarget({ role: 'TECNICO', message: 'Nueva orden de taller y ensamble' });
assert(targetWorkshop.view === 'tech_workshop' && targetWorkshop.anchorId === 'tech-hoja-taller-panel', "Notificación de taller para técnico apunta a tech_workshop / tech-hoja-taller-panel");

// 6. Flujo de Devolución de Hoja de Taller con Registro de Incidencias
console.log("\n--- 6. Devolución de Hoja de Taller con Incidencias Drive ---");
testCo.deliverables.hoja_taller_fyq = {
    status: 'EN_TALLER_OPERARIO',
    driveUrl: 'https://docs.google.com/document/d/hoja-taller-123/edit'
};
state.user = { coId: 'CO-TEST', role: 'OPERACIONES_IA', admin: false };

const testIncidentDocUrl = 'https://docs.google.com/document/d/incidencia-tolerancia-999/edit';
state.returnHojaTallerByOperator('INC_TOLERANCIA', 'Tolerancias dimensionales incompatibles', testIncidentDocUrl);

const updatedHoja = testCo.deliverables.hoja_taller_fyq;
assert(updatedHoja.status === 'DEVUELTO_A_TECNICO', "Hoja de taller pasa a DEVUELTO_A_TECNICO");
assert(updatedHoja.returnReasonId === 'INC_TOLERANCIA', "returnReasonId guardado");
assert(updatedHoja.returnDriveUrl === testIncidentDocUrl, "returnDriveUrl guardado correctamente");

// Verificar renderizado del botón de incidencias en viewCart y viewTechWorkshop
const mockCartEl = { innerHTML: '', appendChild: (c) => { mockCartEl.innerHTML = c.innerHTML; } };
ui.viewCart(mockCartEl);
assert(mockCartEl.innerHTML.includes('Abrir Registro de Incidencias en Google Docs'), "viewCart muestra botón para abrir Registro de Incidencias en Google Docs");
assert(mockCartEl.innerHTML.includes(encodeURI(testIncidentDocUrl)), "viewCart enlaza correctamente a returnDriveUrl");

const mockWorkshopEl = { innerHTML: '', appendChild: (c) => { mockWorkshopEl.innerHTML = c.innerHTML; } };
state.user = { coId: 'CO-TEST', role: 'TECNICO', admin: false };
ui.viewTechWorkshop(mockWorkshopEl);
assert(mockWorkshopEl.innerHTML.includes('Abrir Registro de Incidencias en Google Docs'), "viewTechWorkshop muestra botón para abrir Registro de Incidencias");
assert(mockWorkshopEl.innerHTML.includes('tech-hoja-taller-panel'), "viewTechWorkshop contiene id tech-hoja-taller-panel");

// Verificar que viewTech NO contiene ni BOM ni Hoja de Taller
const mockTechEl = { innerHTML: '', appendChild: (c) => { mockTechEl.innerHTML = c.innerHTML; } };
ui.viewTech(mockTechEl);
assert(!mockTechEl.innerHTML.includes('tech-hoja-taller-panel'), "viewTech ya no contiene tech-hoja-taller-panel");
assert(!mockTechEl.innerHTML.includes('toggleBomItem'), "viewTech ya no contiene checkboxes de BOM");
assert(mockTechEl.innerHTML.includes('tech-orders-tracking-panel'), "viewTech conserva el panel de órdenes I+D");

// 7. Anti-Evasión de Entregables y RBAC Temporal
console.log("\n--- 7. Anti-Evasión de Entregables y RBAC Temporal ---");
state.user = { coId: 'CO-TEST', role: 'TECNICO', admin: false };
testCo.deliverables.preliminaryReport = { driveUrl: '' }; // sin entregar y con openDate 2099

// Intento de evasión directa mediante state.submitDeliverable
state.submitDeliverable('preliminaryReport', { driveUrl: 'https://docs.google.com/document/d/evasion-test/edit' });
assert(!testCo.deliverables.preliminaryReport.driveUrl, "state.submitDeliverable bloquea intento de evasión en entregable bloqueado");

// Intento de evasión de envío de Hoja de Taller bloqueada
state.data.config.deliverableSchedule.hoja_taller_fyq = { openDate: '2099-01-01T00:00' };
delete testCo.deliverables.hoja_taller_fyq;
state.sendHojaTallerToWorkshop('https://docs.google.com/document/d/hoja-evasion/edit');
assert(!testCo.deliverables.hoja_taller_fyq, "state.sendHojaTallerToWorkshop bloquea envío si hoja_taller_fyq está bloqueada");

// Intento de envío de Hoja de Taller por rol no autorizado (ej. MARKETING)
delete state.data.config.deliverableSchedule.hoja_taller_fyq;
state.user = { coId: 'CO-TEST', role: 'MARKETING', admin: false };
state.sendHojaTallerToWorkshop('https://docs.google.com/document/d/hoja-unauth/edit');
assert(!testCo.deliverables.hoja_taller_fyq, "state.sendHojaTallerToWorkshop bloquea envío por roles distintos a TECNICO");

// 8. Aislamiento RBAC de Vistas: Marketing sin acceso a SUPERMARS-KET
console.log("\n--- 8. Aislamiento RBAC de Vistas: Marketing sin acceso a SUPERMARS-KET ---");
state.user = { coId: 'CO-TEST', role: 'MARKETING', admin: false };
ui.current = 'market';
const mockVp = { innerHTML: '', appendChild: () => {}, offsetHeight: 100, style: {}, addEventListener: () => {} };
ctx.__domElements = { ...ctx.__domElements, 'viewport': mockVp };
ui.render();
assert(ui.current === 'brand', "Intento de navegación de MARKETING a 'market' redirige a 'brand'");

// 9. Flujo Integral Marketing y Campañas
console.log("\n--- 9. Flujo Integral Marketing y Campañas ---");
testCo.balance = 5000;
testCo.marketingCampaigns = [];
state.user = { coId: 'CO-TEST', role: 'MARKETING', admin: false };

// 9.1 Solicitud de paquete publicitario
const pkgDef = ctx.MARKETING_PACKAGES[0]; // Ej. Tier 1
ctx.__domElements['campaign-tier'] = { value: pkgDef.id };
ctx.__domElements['campaign-drive-url'] = { value: 'https://docs.google.com/document/d/brief-mkt-123/edit' };
ui.confirmRequestMktPackage(pkgDef.id);
assert(testCo.marketingCampaigns.length === 1, "Campaña creada en marketingCampaigns");
const camp = testCo.marketingCampaigns[0];
assert(camp.status === 'PENDIENTE_FINANZAS', "Estado de campaña es PENDIENTE_FINANZAS");

// 9.2 Autorización de Finanzas
state.user = { coId: 'CO-TEST', role: 'FINANZAS', admin: false };
ui.approveMktCamp(camp.id);
assert(camp.status === 'ACTIVO', "Finanzas aprueba campaña pasando a ACTIVO");
const expectedBalance = state.calculateBalance(testCo);
assert(testCo.balance === expectedBalance, `Saldo virtual deducido correctamente (${testCo.balance}€v, deducción: -${pkgDef.price}€v)`);

// 9.3 Publicación de acción publicitaria con DOC_12
state.user = { coId: 'CO-TEST', role: 'MARKETING', admin: false };
ctx.__domElements['mkt-action-type'] = { value: 'Post en Redes Sociales Marcianas' };
ctx.__domElements['mkt-drive-url'] = { value: 'https://docs.google.com/document/d/doc-12-action-mkt/edit' };
ui.confirmConsumeMktAction(camp.id);
assert(camp.executedActions && camp.executedActions.length === 1, "Acción publicitaria registrada en executedActions");
const action = camp.executedActions[0];
assert(action.status === 'PENDIENTE_CEO', "Acción creada con estado PENDIENTE_CEO");

// 9.4 Aval de CEO
state.user = { coId: 'CO-TEST', role: 'CEO', admin: false };
ui.decideMktAction(camp.id, action.id, true);
assert(action.status === 'VALIDADO_CEO', "CEO avala la acción pasando a VALIDADO_CEO");

// 10. Flujo Integral Técnico y Taller
console.log("\n--- 10. Flujo Integral Técnico y Taller ---");
state.user = { coId: 'CO-TEST', role: 'TECNICO', admin: false };
testCo.bom = [];
ui.toggleBomItem('ORD-1-0', true);
assert(testCo.bom.includes('ORD-1-0'), "Pieza añadida al BOM de ensamble");

// Envío Hoja de Taller DOC_10 a taller
ctx.__domElements['tech-hoja-taller-drive-url'] = { value: 'https://docs.google.com/document/d/doc-10-taller-fyq/edit' };
ui.techSendHojaTaller();
assert(testCo.deliverables.hoja_taller_fyq.status === 'EN_TALLER_OPERARIO', "Hoja de taller remitida a taller (EN_TALLER_OPERARIO)");

// Operaciones devuelve por incidencia
state.user = { coId: 'CO-TEST', role: 'OPERACIONES_IA', admin: false };
const incidentDriveDoc = 'https://docs.google.com/document/d/doc-incidencia-banco/edit';
ctx.__domElements['taller-return-reason'] = { value: 'INC_CALIDAD' };
ctx.__domElements['taller-return-drive-url'] = { value: incidentDriveDoc };
ui.confirmTallerReturnReason();
assert(testCo.deliverables.hoja_taller_fyq.status === 'DEVUELTO_A_TECNICO', "Hoja pasa a DEVUELTO_A_TECNICO");
assert(testCo.deliverables.hoja_taller_fyq.returnDriveUrl === incidentDriveDoc, "returnDriveUrl persiste enlace DOC de incidencias");

// Técnico ve botón de acceso a la incidencia en Taller
state.user = { coId: 'CO-TEST', role: 'TECNICO', admin: false };
const workshopAuditEl = { innerHTML: '', appendChild: (c) => { workshopAuditEl.innerHTML = c.innerHTML; } };
ui.viewTechWorkshop(workshopAuditEl);
assert(workshopAuditEl.innerHTML.includes(encodeURI(incidentDriveDoc)), "Técnico visualiza enlace al DOC de incidencias de taller");

console.log(`\n=================================================`);
console.log(`RESULTADO DE VALIDACIÓN: ${passed} ÉXITOS, ${failed} FALLOS`);
console.log(`=================================================`);

if (failed > 0) {
    process.exitCode = 1;
}
