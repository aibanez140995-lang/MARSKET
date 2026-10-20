// scratch/test_mission_v1105.mjs
// Suite de Auto-Verificación Automatizada para Misión v1.1.05

import assert from 'node:assert';
import fs from 'node:fs';

console.log('=== INICIANDO VERIFICACIÓN AUTOMATIZADA MISIÓN v1.1.05 ===\n');

// 1. Verificar Versiones y Cache Busting
console.log('--- TEST 1: Control de Versión y Cache Busting ---');
const configContent = fs.readFileSync('js/config.js', 'utf8');
assert(configContent.includes('const APP_VERSION = "1.1.05";'), 'APP_VERSION debe ser 1.1.05 en config.js');

const swContent = fs.readFileSync('sw.js', 'utf8');
assert(swContent.includes('marsket-static-v1.1.05'), 'sw.js debe definir la caché marsket-static-v1.1.05');

const indexContent = fs.readFileSync('index.html', 'utf8');
assert(indexContent.includes('js/config.js?v=1.1.05'), 'index.html debe importar config.js con ?v=1.1.05');
assert(indexContent.includes('js/state.js?v=1.1.05'), 'index.html debe importar state.js con ?v=1.1.05');

const opsecPhrase = "v1.1.05: Optimización de telemetría de red bajo estándar HTTP 304, mitigación de I/O en almacenamiento y habilitación de terminal de acreditación para el claustro docente.";
assert(configContent.includes(opsecPhrase), 'config.js debe contener la frase OpSec exacta');
console.log('PASS: Versión v1.1.05 y Cache Busting verificados.');

// 2. Verificar Supresión de backup_previous en functions/api/state.js
console.log('\n--- TEST 2: Supresión de backup_previous (Write Amplification) ---');
const stateApiContent = fs.readFileSync('functions/api/state.js', 'utf8');
assert(!stateApiContent.includes("SELECT 'backup_previous'"), 'functions/api/state.js NO debe contener backup_previous');
console.log('PASS: backup_previous eliminado con éxito.');

// 3. Verificar Bloqueo Optimista Estricto sin Bypass versión 0
console.log('\n--- TEST 3: Bloqueo Optimista Estricto en Servidor ---');
assert(stateApiContent.includes("incomingVersion <= serverVersion"), 'Debe rechazar incomingVersion <= serverVersion');
assert(!stateApiContent.includes("incomingVersion !== 0"), 'NO debe haber bypass para versión 0');
console.log('PASS: Bloqueo optimista estricto verificado.');

// 4. Verificar ETag y HTTP 304 en functions/api/state.js
console.log('\n--- TEST 4: Mitigación ETag / HTTP 304 en Servidor ---');
assert(stateApiContent.includes("SELECT json_extract(data, '$.version') as v"), 'Debe consultar solo el campo versión para ETag');
assert(stateApiContent.includes("clientETag === serverETag"), 'Debe comparar If-None-Match con ETag del servidor');
assert(stateApiContent.includes("status: 304"), 'Debe retornar 304 cuando coincide el ETag');
console.log('PASS: Manejador ETag / 304 verificado en functions/api/state.js.');

// 5. Verificar functions/api/admin/credentials.js
console.log('\n--- TEST 5: Endpoint Exclusivo functions/api/admin/credentials.js ---');
const credsApiContent = fs.readFileSync('functions/api/admin/credentials.js', 'utf8');
assert(credsApiContent.includes('export const onRequestGet'), 'Debe exportar onRequestGet');
assert(credsApiContent.includes('export const onRequestPatch'), 'Debe exportar onRequestPatch');
assert(credsApiContent.includes('verifySession'), 'Debe usar verifySession');
assert(credsApiContent.includes('UNAUTHORIZED_COORDINATOR_ACCESS'), 'Debe rechazar accesos sin permisos');
assert(credsApiContent.includes("UPDATE state SET data = json(?)"), 'Debe persistir en D1 de forma atómica');
console.log('PASS: Endpoint /api/admin/credentials verificado.');

// 6. Verificar Protección de Memoria Local en mergeData (js/state.js)
console.log('\n--- TEST 6: Protección de Memoria Local de PINs en mergeData ---');
const stateJsContent = fs.readFileSync('js/state.js', 'utf8');
assert(stateJsContent.includes('lT.pin && !sT.pin'), 'mergeData debe proteger PINs docentes de nulos de la sanitización');
assert(stateJsContent.includes('lCo.authVault && (!sCo.authVault || !sCo.authVault.code)'), 'mergeData debe proteger authVault de empresas');
console.log('PASS: Protección de memoria local ante respuestas sanitizadas verificada.');

// 7. Verificar Exponential Backoff con Jitter en pushWithBackoff (js/state.js)
console.log('\n--- TEST 7: Exponential Backoff con Jitter en Cliente ---');
assert(stateJsContent.includes('pushWithBackoff'), 'state.js debe implementar pushWithBackoff');
assert(stateJsContent.includes('Math.min(1500, 75 * Math.pow(2, attempt))'), 'Debe implementar la fórmula de backoff exponencial');
assert(stateJsContent.includes('Math.random() * 150'), 'Debe incluir dispersión estocástica (jitter)');
console.log('PASS: pushWithBackoff con jitter verificado.');

// 8. Verificar Desacople de Credenciales en state.js (fetch a /api/admin/credentials)
console.log('\n--- TEST 8: Desacople de PINs hacia /api/admin/credentials ---');
assert(stateJsContent.includes("fetch('/api/admin/credentials'"), 'state.js debe invocar /api/admin/credentials');
assert(stateJsContent.includes('this.pausePolling = true;'), 'state.js debe pausar el polling durante la mutación');
assert(stateJsContent.includes('this.pausePolling = false;'), 'state.js debe reanudar el polling tras la mutación');
console.log('PASS: Desacople de PINs hacia endpoint dedicado verificado.');

// 9. Verificar Exportación de Tarjetas PDF del Claustro Docente
console.log('\n--- TEST 9: Acreditaciones PDF del Claustro Docente ---');
const mgmtJsContent = fs.readFileSync('js/ui-docente-management.js', 'utf8');
assert(mgmtJsContent.includes('exportTeacherBadgesPDF'), 'ui-docente-management.js debe implementar exportTeacherBadgesPDF');
assert(mgmtJsContent.includes('window.exportTeacherBadgesPDF'), 'Debe exponer window.exportTeacherBadgesPDF');
assert(mgmtJsContent.includes('renderTeacherCredentialCardHTML'), 'Debe renderizar la tarjeta docente Cyberpunk');
assert(mgmtJsContent.includes('CAUTION: CLASSIFIED TEACHER ACCESS'), 'Debe contener el aviso de seguridad clasificada');
console.log('PASS: Ficha de acceso PDF del Claustro Docente verificada.');

// 10. Prueba Funcional Dinámica de functions/api/admin/credentials.js
console.log('\n--- TEST 10: Prueba Funcional Dinámica de credentials.js ---');
const { handleCredentials } = await import('../functions/api/admin/credentials.js');

let mockD1State = {
    version: 4,
    config: {
        teachers: {
            'COORD_MARIO': { name: 'Mario', pin: '0001' },
            'FYQ': { name: 'Física y Química', pin: '0101' }
        }
    },
    companies: {
        'astra': {
            name: 'Astra Dynamics',
            authVault: {
                code: 'VLT_QkNERUY=',
                roles: { 'CEO': 'VLT_MTIzNA==' }
            }
        }
    }
};

const mockEnv = {
    MARSKET_DB: {
        prepare: (sql) => ({
            bind: (...args) => ({
                run: async () => {
                    if (sql.includes('UPDATE state SET data = json(?)')) {
                        mockD1State = JSON.parse(args[0]);
                    }
                    return { success: true };
                },
                first: async () => null,
                all: async () => ({ results: [] })
            }),
            first: async () => ({ data: JSON.stringify(mockD1State) }),
            all: async () => ({ results: [{ data: JSON.stringify(mockD1State) }] }),
            run: async () => ({ success: true })
        })
    },
    TEACHER_MASTER_CODE: 'MASTER_MARS_2026'
};

// A. Test GET /api/admin/credentials con token de Coordinador
const reqGetCoord = new Request('https://marsket.pages.dev/api/admin/credentials', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer MASTER_MARS_2026' }
});
const resGet = await handleCredentials({ request: reqGetCoord, env: mockEnv });
assert.strictEqual(resGet.status, 200, 'GET debe retornar 200 para Coordinador');
const credsJson = await resGet.json();
assert(credsJson.teachers?.COORD_MARIO?.pin === '0001', 'GET debe retornar PIN docente en claro para Coordinador');
assert(credsJson.companies?.astra, 'GET debe retornar empresas desencriptadas');
console.log('PASS: GET /api/admin/credentials retorna secretos descifrados a Coordinación.');

// B. Test GET rechazado sin autorización
const reqGetAnon = new Request('https://marsket.pages.dev/api/admin/credentials', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer ALUMNO_TOKEN' }
});
const resGetAnon = await handleCredentials({ request: reqGetAnon, env: mockEnv });
assert.strictEqual(resGetAnon.status, 403, 'GET anónimo/alumno debe retornar 403');
console.log('PASS: GET /api/admin/credentials bloquea accesos no autorizados (403).');

// C. Test PATCH /api/admin/credentials actualizando PIN de docente
const reqPatchTeacher = new Request('https://marsket.pages.dev/api/admin/credentials', {
    method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer MASTER_MARS_2026'
    },
    body: JSON.stringify({ type: 'teacher', id: 'FYQ', newPin: '8888' })
});
const resPatch = await handleCredentials({ request: reqPatchTeacher, env: mockEnv });
assert.strictEqual(resPatch.status, 200, 'PATCH debe retornar 200');
const patchJson = await resPatch.json();
assert.strictEqual(patchJson.success, true);
assert.strictEqual(patchJson.newVersion, 5, 'La versión debe incrementarse de 4 a 5');
assert.strictEqual(mockD1State.config.teachers.FYQ.pin, '8888', 'El PIN de FYQ en D1 debe ser 8888');
console.log('PASS: PATCH /api/admin/credentials actualizó el PIN e incrementó la versión atómicamente.');

console.log('\n>>> TODAS LAS 10 VERIFICACIONES DE LA MISIÓN v1.1.05 HAN PASADO CON ÉXITO (100% OK) <<<');
