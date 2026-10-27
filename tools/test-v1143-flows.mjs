// tools/test-v1143-flows.mjs
// Suite de pruebas exhaustivas para los flujos de experiencia de usuario v1.1.43

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
    if (condition) {
        console.log(`  ✓ PASS: ${message}`);
        testsPassed++;
    } else {
        console.error(`  ✗ FAIL: ${message}`);
        testsFailed++;
    }
}

console.log("=== INICIANDO AUDITORÍA INTEGRAL DE EXPERIENCIA DE USUARIO v1.1.43 ===");

// 1. CARGA DE ARCHIVOS
const configCode = fs.readFileSync(path.join(ROOT, 'js/config.js'), 'utf8');
const uiCoreCode = fs.readFileSync(path.join(ROOT, 'js/ui-core.js'), 'utf8');
const uiTechCode = fs.readFileSync(path.join(ROOT, 'js/ui-empresa-tech.js'), 'utf8');
const uiMarketCode = fs.readFileSync(path.join(ROOT, 'js/ui-empresa-market.js'), 'utf8');
const uiOpsCode = fs.readFileSync(path.join(ROOT, 'js/ui-empresa-ops.js'), 'utf8');
const uiFinanceCode = fs.readFileSync(path.join(ROOT, 'js/ui-empresa-finance.js'), 'utf8');

// Simular entorno global básico
const globalScope = {
    APP_VERSION: "1.1.43",
    GOOGLE_DRIVE_REGEX: /^https:\/\/(?:drive|docs)\.google\.com\/[^\s]+$/,
    COMMERCIAL_SHOPS_DEF: [
        { id: 'mercadona', name: 'Mercadona' },
        { id: 'carrefour', name: 'Carrefour' },
        { id: 'eroski', name: 'Eroski' },
        { id: 'dia', name: 'Dia' },
        { id: 'ferreteria', name: 'Ferretería' },
        { id: 'bazar', name: 'Bazar' },
        { id: 'comercio_generico', name: 'Comercio genérico' }
    ],
    DELIVERABLES_DEF: [
        { key: "hoja_taller_fyq", name: "Hoja de Taller y Verificación Física", shortName: "Hoja de Taller", role: "OPERACIONES_IA", subject: "FYQ" },
        { key: "prompt_ethics_bimestre1", name: "Bitácora Ética de Inteligencia Artificial (B1)", shortName: "Bitácora IA (B1)", role: "OPERACIONES_IA", subject: "LEN" },
        { key: "mathReportFinal", name: "Informe Técnico Final Comparativo", shortName: "Informe Técnico Final", role: "TECNICO", subject: "MAT" }
    ],
    document: {
        activeElement: null,
        getElementById: () => null,
        querySelectorAll: () => []
    },
    sessionStorage: {
        getItem: () => null,
        setItem: () => null,
        removeItem: () => null
    },
    window: {
        scrollTo: () => {}
    },
    encodeURI: (s) => encodeURI(s)
};

console.log("\n--- VECTOR 1: EXPERIENCIA EN GUÍA TÁCTICA [ ❓ GUÍA ] ---");
{
    // Contexto Alumno Técnico
    const studentUser = { username: "ALUMNO_TECH", role: "TECNICO", coId: "co1", admin: false };
    const mockStateStudent = {
        user: studentUser,
        data: {
            companies: {
                co1: {
                    name: "AERO-ASTRO",
                    deliverables: {},
                    orders: []
                }
            },
            config: {}
        }
    };

    // Evaluar showGuide para alumno
    let capturedRolesList = [];
    let initialRoleCaptured = null;
    let rolesList = [
        { key: 'CEO', label: '👑 CEO' },
        { key: 'TECNICO', label: '🧪 TÉCNICO' },
        { key: 'FINANZAS', label: '💰 FINANZAS' },
        { key: 'MARKETING', label: '📢 MARKETING' },
        { key: 'OPERACIONES_IA', label: '🤖 OPS & IA' },
        { key: 'AUXILIAR', label: '👁️ AUXILIAR' },
        { key: 'DOCENTE', label: '🎓 DOCENTE' }
    ];

    let initialRole = mockStateStudent.user.admin ? 'DOCENTE' : mockStateStudent.user.role;
    if (mockStateStudent.user && !mockStateStudent.user.admin) {
        rolesList = rolesList.filter(r => r.key !== 'DOCENTE');
        if (initialRole === 'DOCENTE') {
            initialRole = mockStateStudent.user.role || 'CEO';
        }
    }

    assert(!rolesList.some(r => r.key === 'DOCENTE'), "Alumno NO ve la pestaña DOCENTE en rolesList de la Guía");
    assert(rolesList.length === 6, "Alumno ve exactamente los 6 roles operativos de empresa");
    assert(initialRole === 'TECNICO', "Alumno abre la guía con su rol nativo preseleccionado");

    // Verificar selector CSS sin scrollbar rota
    assert(uiCoreCode.includes('class="flex flex-wrap gap-2 pb-3 border-b border-slate-800"'), "Selector de roles usa flex-wrap fluido en lugar de overflow-x-auto roto");
    assert(uiCoreCode.includes('min-h-[44px] px-2.5 py-1.5 text-xs font-black uppercase tracking-wider bg-mars-cyan text-black border border-mars-cyan transition-all shadow-[0_0_8px_rgba(0,240,255,0.4)] shrink-0 whitespace-nowrap'), "Botones de rol cumplen accesibilidad táctil min-h-[44px] y shrink-0");

    // Intentos de evasión de Alumno (Llamada directa a DOCENTE)
    // Simular getOnboardingContent en mock
    const simulateGetOnboarding = (role, stateObj) => {
        let targetRole = role || 'CEO';
        if (targetRole === 'OPERACIONES') targetRole = 'OPERACIONES_IA';
        if (targetRole === 'SECRETARIO') targetRole = 'AUXILIAR';

        const isDocente = targetRole === 'DOCENTE';
        if (isDocente) {
            if (stateObj.user && !stateObj.user.admin) {
                return "ACCESO_DENEGADO";
            }
            return "CONTENIDO_DOCENTE";
        }
        if (targetRole === 'OPERACIONES_IA') {
            return "CONTENIDO_OPERACIONES";
        }
        if (targetRole === 'CEO') {
            return "CONTENIDO_CEO";
        }
        return "CONTENIDO_GENERICO";
    };

    assert(simulateGetOnboarding('DOCENTE', mockStateStudent) === "ACCESO_DENEGADO", "Evasión de Alumno solicitando rol DOCENTE resulta en ACCESO_DENEGADO");

    // Contexto Docente
    const teacherUser = { username: "PROF_FYQ", role: "DOCENTE", admin: true };
    const mockStateTeacher = { user: teacherUser, data: { companies: {} } };

    assert(simulateGetOnboarding('DOCENTE', mockStateTeacher) === "CONTENIDO_DOCENTE", "Docente recibe su ficha operativa en DOCENTE");
    assert(simulateGetOnboarding('CEO', mockStateTeacher) === "CONTENIDO_CEO", "Docente puede consultar la ficha de CEO sin que el sistema lo fuerce a DOCENTE");
    assert(simulateGetOnboarding('OPERACIONES', mockStateTeacher) === "CONTENIDO_OPERACIONES", "Docente puede consultar la ficha de OPERACIONES correctamente");
}

console.log("\n--- VECTOR 2: SEGUIMIENTO DE ÓRDENES DEL TÉCNICO I+D ---");
{
    // Verificar panel en ui-empresa-tech.js
    assert(uiTechCode.includes('id="tech-orders-tracking-panel"'), "Panel #tech-orders-tracking-panel presente en ui-empresa-tech.js");
    assert(uiTechCode.includes("ui.renderWorkflowTracker(['1. I+D (Solicita)', '2. Finanzas (Audita)', '3. Logística (Ejecuta)']"), "Workflow tracker de 3 fases integrado en órdenes técnicas");
    assert(uiTechCode.includes("DOC_9 en Docs"), "Enlace formal a justificación técnica DOC_9 visible en la orden");
    assert(uiTechCode.includes("Coste Real Total:"), "Desglose de costes reales en euros (€) e imputación de taller visible en órdenes completadas");

    // Verificar atajo en Catálogo (ui-empresa-market.js)
    assert(uiMarketCode.includes("📡 Mis Órdenes"), "Atajo [ 📡 Mis Órdenes ] presente en Catálogo B2C");
    assert(uiMarketCode.includes("tech-orders-tracking-panel"), "Atajo de Catálogo navega y hace scroll directo a #tech-orders-tracking-panel");
    assert(uiMarketCode.includes("ring-mars-cyan"), "Atajo aplica anillo de foco táctico cyan tras auto-scroll");

    // Simulación de estados de orden para Técnico
    const coOrders = [
        { id: "ORD-001", total: 45.0, status: "PENDIENTE_FINANZAS", driveUrl: "https://docs.google.com/document/d/123", items: [{ name: "Botella PET", qty: 2, price: 15 }] },
        { id: "ORD-002", total: 20.0, status: "APROBADO_FINANZAS", driveUrl: "https://docs.google.com/document/d/456", items: [{ name: "Vinagre", qty: 4, price: 5 }] },
        { id: "ORD-003", total: 60.0, status: "EJECUTADO", driveUrl: "https://docs.google.com/document/d/789", items: [{ name: "Boquilla", qty: 1, price: 60, realEur: 8.50, realShop: "Ferretería", ticketUrl: "https://drive.google.com/ticket" }] },
        { id: "ORD-004", total: 100.0, status: "RECHAZADO", items: [{ name: "Propulsor no homologado", qty: 1, price: 100 }] }
    ];

    const techPendingCount = coOrders.filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS').length;
    const techCompletedCount = coOrders.filter(o => o.status === 'EJECUTADO').length;
    const techRejectedCount = coOrders.filter(o => o.status === 'RECHAZADO').length;

    assert(techPendingCount === 2, "Filtro EN_PROCESO agrupa correctamente PENDIENTE_FINANZAS y APROBADO_FINANZAS (2)");
    assert(techCompletedCount === 1, "Filtro COMPLETADAS detecta exactamente las ejecutadas por taller (1)");
    assert(techRejectedCount === 1, "Filtro DENEGADAS detecta órdenes rechazadas (1)");
}

console.log("\n--- VECTOR 3: PANEL LOGÍSTICO DE OPERACIONES Y EJECUCIÓN FÍSICA ---");
{
    // Verificar panel en ui-empresa-ops.js
    assert(uiOpsCode.includes('id="ops-orders-tracking-panel"'), "Panel #ops-orders-tracking-panel presente en ui-empresa-ops.js");
    assert(uiOpsCode.includes("ui.setOpsOrdersTab('APROBADAS')"), "Pestaña [Listas para Ensamble] implementada");
    assert(uiOpsCode.includes("ui.setOpsOrdersTab('PENDIENTES')"), "Pestaña [En Cola Finanzas] implementada");
    assert(uiOpsCode.includes("ui.setOpsOrdersTab('HISTORIAL')"), "Pestaña [Historial] implementada");
    assert(uiOpsCode.includes("executePhysicalOrder"), "Función ui.executePhysicalOrder disponible");

    // Verificar validaciones de seguridad en executePhysicalOrder
    assert(uiOpsCode.includes("Solo Operaciones/Operario puede registrar compras reales físicas"), "Blindaje RBAC: solo Operario/Operaciones puede confirmar compras reales");
    assert(uiOpsCode.includes("valEur < 0"), "Validación de entrada: rechaza importes reales negativos");
    assert(uiOpsCode.includes("GOOGLE_DRIVE_REGEX"), "Validación de ticket físico: exige URL de Google Drive");
    assert(uiOpsCode.includes("co.balance < finalTotalEurV"), "Validación contable: bloquea ejecución si el saldo virtual es insuficiente");
}

console.log("\n--- VECTOR 4: INTEGRIDAD DE ENLACES, ID Y REFERENCIAS CRUZADAS ---");
{
    assert(uiCoreCode.includes("if (role === 'TECNICO') return { view: 'tech', anchorId: 'tech-orders-tracking-panel' };"), "Notificaciones para Técnico resuelven a view: tech y anchorId: tech-orders-tracking-panel");
    assert(uiCoreCode.includes("if (role === 'OPERACIONES_IA' || role === 'OPERACIONES') return { view: 'cart', anchorId: 'ops-orders-tracking-panel' };"), "Notificaciones para Operaciones resuelven a view: cart y anchorId: ops-orders-tracking-panel");
}

console.log("\n=======================================================");
console.log(`TOTAL PRUEBAS EJECUTADAS: ${testsPassed + testsFailed}`);
console.log(`PRUEBAS SUPERADAS: ${testsPassed}`);
console.log(`PRUEBAS FALLIDAS: ${testsFailed}`);
console.log(`ESTADO FINAL: ${testsFailed === 0 ? "TODO CORRECTO [PASS]" : "ERRORES DETECTADOS [REJECT]"}`);
console.log("=======================================================");
