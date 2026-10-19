// scratch/test_mission_v1103.mjs
// Suite de Verificación Exhaustiva para Misión v1.1.03 (Seguridad Zero-Trust)

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { verifySession } from '../functions/api/_auth.js';
import { sanitizeStateForClient } from '../functions/api/state.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

console.log('=== TEST 1: SANITIZACIÓN DEL PAYLOAD DE ESTADO (GET /api/state) ===');
{
    const rawDbState = {
        version: 10,
        resetEpoch: 1700000000,
        config: {
            nextOrderId: 1005,
            teachers: {
                FYQ: { name: "Física y Química", pin: "0101", canSponsor: false },
                COORD_MARIO: { name: "Coordinación - Mario", pin: "0001", canSponsor: true }
            }
        },
        catalog: [{ id: "F01", price: 97 }],
        companies: {
            astra: {
                name: "Astra Dynamics",
                balance: 2400,
                accessCode: "AST-1010",
                roles: { CEO: "1111", TECNICO: "1111" },
                authVault: {
                    code: "VLT_bXJz",
                    roles: { CEO: "VLT_MTExMQ==", TECNICO: "VLT_MTExMQ==" }
                },
                orders: [{ id: "ORD-1" }]
            }
        }
    };

    const sanitized = sanitizeStateForClient(rawDbState);

    // 1. Verificar que se eliminó el pin en config.teachers
    assert.strictEqual(sanitized.config.teachers.FYQ.pin, undefined, 'ERROR: pin de FYQ expuesto');
    assert.strictEqual(sanitized.config.teachers.COORD_MARIO.pin, undefined, 'ERROR: pin de COORD_MARIO expuesto');

    // 2. Verificar que se eliminó authVault, roles y accessCode en companies
    assert.strictEqual(sanitized.companies.astra.pin, undefined, 'ERROR: pin en empresa');
    assert.strictEqual(sanitized.companies.astra.roles, undefined, 'ERROR: roles en empresa expuesto');
    assert.strictEqual(sanitized.companies.astra.authVault, undefined, 'ERROR: authVault en empresa expuesto');
    assert.strictEqual(sanitized.companies.astra.accessCode, undefined, 'ERROR: accessCode en empresa expuesto');

    // 3. Verificar que los datos operativos permanecen intactos
    assert.strictEqual(sanitized.version, 10);
    assert.strictEqual(sanitized.companies.astra.name, "Astra Dynamics");
    assert.strictEqual(sanitized.companies.astra.balance, 2400);
    assert.strictEqual(sanitized.companies.astra.orders.length, 1);
    assert.strictEqual(sanitized.catalog.length, 1);

    // 4. Verificar que rawDbState original no fue corrompido si se requiere en el backend
    assert.ok(rawDbState.companies.astra.roles, 'El estado crudo original debe preservarse para uso interno de backend');

    console.log('PASS: Sanitización de GET /api/state verificada con éxito (CWE-200 resuelto).');
}

console.log('\n=== TEST 2: MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN ZERO-TRUST (_auth.js) ===');
{
    const mockEnv = {
        TEACHER_MASTER_CODE: 'SECRET_MASTER_CODE_2026',
        MASTER_RESET_HASH: 'f7c3bc1d808e04732adf679965ccc34ca7ae3441'
    };

    // Caso A: Sin cabecera Authorization
    const reqNoAuth = new Request('http://localhost/api/state', { method: 'POST' });
    const resNoAuth = await verifySession(reqNoAuth, mockEnv);
    assert.strictEqual(resNoAuth.authorized, false);
    assert.strictEqual(resNoAuth.error, 'MISSING_AUTHORIZATION_HEADER');

    // Caso B: Token de alumno (S|astra|TECNICO|...)
    const studentToken = 'VLT_' + Buffer.from('S|astra|TECNICO|AST-1010||123456').toString('base64');
    const reqStudent = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}` }
    });
    const resStudent = await verifySession(reqStudent, mockEnv);
    assert.strictEqual(resStudent.authorized, false, 'ERROR: Alumno no debe estar autorizado para mutaciones administrativas');
    assert.strictEqual(resStudent.error, 'STUDENT_ROLE_UNAUTHORIZED');

    // Caso C: Token docente de materia (no coordinador: T|FYQ|...)
    const teacherToken = 'VLT_' + Buffer.from('T|FYQ|123456').toString('base64');
    const reqTeacher = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${teacherToken}` }
    });
    const resTeacher = await verifySession(reqTeacher, mockEnv);
    assert.strictEqual(resTeacher.authorized, false, 'Docente que no es coordinador no debe tener autorización administrativa');

    // Caso D: Token de Coordinador (T|COORD_MARIO|...)
    const coordToken = 'VLT_' + Buffer.from('T|COORD_MARIO|123456').toString('base64');
    const reqCoord = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${coordToken}` }
    });
    const resCoord = await verifySession(reqCoord, mockEnv);
    assert.strictEqual(resCoord.authorized, true);
    assert.strictEqual(resCoord.isAdmin, true);

    // Caso E: Token maestro (TEACHER_MASTER_CODE)
    const reqMaster = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: { 'Authorization': `Bearer SECRET_MASTER_CODE_2026` }
    });
    const resMaster = await verifySession(reqMaster, mockEnv);
    assert.strictEqual(resMaster.authorized, true);

    console.log('PASS: Middleware _auth.js verificado (Zero-Trust por rol y token implementado).');
}

console.log('\n=== TEST 3: ELIMINACIÓN DE SECRETOS HARDCODEADOS (CWE-798) ===');
{
    const filesToAudit = [
        'js/config.js',
        'js/state.js',
        'js/auth.js',
        'js/ui-core.js',
        'js/ui-docente-core.js',
        'js/ui-docente-management.js'
    ];

    for (const relPath of filesToAudit) {
        const fullPath = path.join(ROOT_DIR, relPath);
        const code = fs.readFileSync(fullPath, 'utf8');

        // Verificar que no existe "JOVE2025"
        assert.ok(!code.includes('JOVE2025'), `ERROR: String secreto JOVE2025 encontrado en ${relPath}`);

        // Verificar que no existe INITIAL_DATA
        assert.ok(!code.includes('INITIAL_DATA'), `ERROR: Semilla INITIAL_DATA encontrada en ${relPath}`);
    }

    console.log('PASS: Código fuente 100% limpio de JOVE2025 e INITIAL_DATA.');
}

console.log('\n=== TEST 4: AISLAMIENTO DEL ÁMBITO GLOBAL (CWE-602) ===');
{
    // Cargar js/auth.js en un entorno aislado sin objeto window
    const authCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'auth.js'), 'utf8');

    // Evaluar en una función aislada
    const evalScope = new Function(`
        let state = { data: {}, pin: '', user: null };
        let ui = { notify: () => {} };
        let telemetry = { startSession: () => {} };
        ${authCode}
        return auth;
    `);

    const authInstance = evalScope();

    // 1. Comprobar que auth.completeLogin bloquea llamadas directas no autorizadas
    let thrownMessage = '';
    try {
        authInstance.completeLogin({ admin: true, role: 'COORD_MARIO' });
    } catch (e) {
        thrownMessage = e.message;
    }

    assert.ok(
        thrownMessage.includes('SECURITY_EXCEPTION'),
        `ERROR: completeLogin no lanzó SECURITY_EXCEPTION al llamarse desde fuera. Threw: ${thrownMessage}`
    );

    console.log('PASS: auth.completeLogin bloqueado ante intentos de invocación manual.');
}

console.log('\n=== TEST 5: ARTEFACTOS DE CIERRE VAGOS (OPSEC) Y VERSIÓN v1.1.03 ===');
{
    const configCode = fs.readFileSync(path.join(ROOT_DIR, 'js', 'config.js'), 'utf8');
    assert.ok(configCode.includes('APP_VERSION = "1.1.03"'), 'ERROR: APP_VERSION no es 1.1.03');

    // Verificar que el changelog no menciona términos sensibles
    const sensitiveTerms = [/\bpin\b/i, /\bpassword\b/i, /\bcontraseñ/i, /\bvulnerab/i, /\bfiltraci/i, /\btoken/i, /\bcwe\b/i, /\bidor\b/i];
    const v1103Match = configCode.match(/version:\s*"1\.1\.03"[\s\S]*?highlights:\s*\[([\s\S]*?)\]/);
    assert.ok(v1103Match, 'ERROR: No se encontró la entrada de changelog v1.1.03');

    const changelogText = v1103Match[1].toLowerCase();
    for (const termRegex of sensitiveTerms) {
        assert.ok(
            !termRegex.test(changelogText),
            `ERROR OPSEC: El changelog contiene el término sensible ${termRegex}`
        );
    }

    // Verificar index.html y sw.js
    const indexCode = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf8');
    assert.ok(indexCode.includes('v1.1.03'), 'ERROR: index.html no tiene v1.1.03');

    const swCode = fs.readFileSync(path.join(ROOT_DIR, 'sw.js'), 'utf8');
    assert.ok(swCode.includes('v1.1.03'), 'ERROR: sw.js no tiene v1.1.03');

    console.log('PASS: OpSec validado (Changelog profesional y genérico sin fugas de información).');
}

console.log('\n>>> TODAS LAS COMPROBACIONES DE LA MISIÓN v1.1.03 PASARON EXITOSAMENTE (100% OK) <<<');
