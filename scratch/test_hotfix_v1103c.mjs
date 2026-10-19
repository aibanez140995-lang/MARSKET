import assert from 'node:assert';
import fs from 'node:fs';
import { onRequestGet, onRequestPost, sanitizeStateForClient } from '../functions/api/state.js';

console.log("=== TEST 1: Sanitización estricta en GET /api/state ===");
{
    const rawState = {
        version: 1,
        config: {
            teachers: {
                COORD_MARIO: { name: "Mario", pin: "0001" },
                FYQ: { name: "FyQ", pin: "0101" }
            }
        },
        companies: {
            astra: {
                name: "Astra",
                accessCode: "AST-1010",
                roles: { CEO: "1234" },
                authVault: { code: "VLT_xyz", roles: { CEO: "VLT_123" } }
            }
        }
    };

    const sanitized = sanitizeStateForClient(rawState);
    assert.strictEqual(sanitized.config.teachers.COORD_MARIO.pin, undefined, "PIN docente debe ser eliminado");
    assert.strictEqual(sanitized.config.teachers.FYQ.pin, undefined, "PIN docente debe ser eliminado");
    assert.strictEqual(sanitized.companies.astra.accessCode, undefined, "accessCode debe ser eliminado");
    assert.strictEqual(sanitized.companies.astra.roles, undefined, "roles debe ser eliminado");
    assert.strictEqual(sanitized.companies.astra.authVault, undefined, "authVault debe ser eliminado");
    console.log("PASS: GET continúa sanitizando destructivamente todas las credenciales para el cliente.");
}

console.log("\n=== TEST 2: Fusión de Secretos en Servidor (POST /api/state) ===");
{
    // Simular D1 con credenciales reales existentes
    let storedStateInD1 = {
        version: 5,
        config: {
            teachers: {
                COORD_MARIO: { name: "Coordinación - Mario", pin: "0001", admin: true },
                COORD_ALEX: { name: "Coordinación - Álex", pin: "0002", admin: true },
                FYQ: { name: "Dpto. Física y Química", pin: "0101", admin: true }
            }
        },
        companies: {
            astra: {
                name: "Astra Dynamics",
                balance: 2400,
                accessCode: "AST-1010",
                roles: { CEO: "1234", TECNICO: "5678" },
                authVault: { code: "VLT_AST1010", roles: { CEO: "VLT_CEO_1234" } }
            }
        }
    };

    const mockEnv = {
        MARSKET_DB: {
            prepare: (query) => ({
                run: async () => ({ success: true }),
                bind: (...args) => ({
                    run: async () => {
                        if (query.includes("INSERT OR REPLACE INTO state (id, data) VALUES ('current'")) {
                            storedStateInD1 = JSON.parse(args[0]);
                        }
                        return { success: true };
                    }
                }),
                first: async () => ({ data: JSON.stringify(storedStateInD1) }),
                all: async () => ({ results: [{ data: JSON.stringify(storedStateInD1) }] })
            })
        }
    };

    // El cliente envía el estado sanitizado (SIN PINs y SIN authVault/accessCode)
    const clientPayload = {
        version: 5,
        config: {
            teachers: {
                COORD_MARIO: { name: "Coordinación - Mario", admin: true }, // Sin pin
                COORD_ALEX: { name: "Coordinación - Álex", admin: true },  // Sin pin
                FYQ: { name: "Dpto. Física y Química", admin: true }      // Sin pin
            }
        },
        companies: {
            astra: {
                name: "Astra Dynamics Editada",
                balance: 2350
                // Sin accessCode, sin roles, sin authVault
            }
        }
    };

    // Generar token maestro o token de coordinador para pasar verifySession
    const _vaultKey = 'MARS_AEE_2026_SECRET_KEY';
    function encodeSecret(str) {
        let res = '';
        for (let i = 0; i < str.length; i++) {
            res += String.fromCharCode(str.charCodeAt(i) ^ _vaultKey.charCodeAt(i % _vaultKey.length));
        }
        return 'VLT_' + Buffer.from(res, 'binary').toString('base64');
    }
    const token = encodeSecret('T|COORD_MARIO|9999999999');

    const request = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(clientPayload)
    });

    const res = await onRequestPost({ request, env: mockEnv });
    assert.strictEqual(res.status, 200, `POST debe responder 200. Código devuelto: ${res.status}`);

    // Verificar que D1 conservó íntegros los PINs y bóvedas
    assert.strictEqual(storedStateInD1.config.teachers.COORD_MARIO.pin, "0001", "PIN de COORD_MARIO debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.config.teachers.COORD_ALEX.pin, "0002", "PIN de COORD_ALEX debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.config.teachers.FYQ.pin, "0101", "PIN de FYQ debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.companies.astra.accessCode, "AST-1010", "accessCode de Astra debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.companies.astra.authVault.code, "VLT_AST1010", "authVault de Astra debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.companies.astra.roles.CEO, "1234", "roles de Astra debe haberse preservado en D1");
    assert.strictEqual(storedStateInD1.companies.astra.name, "Astra Dynamics Editada", "Los datos operativos del cliente sí deben actualizarse");
    assert.strictEqual(storedStateInD1.version, 6, "Versión debe haberse incrementado a 6");
    console.log("PASS: Fusión de secretos en servidor verificada. Se protegieron los PINs y Bóvedas de la sobreescritura.");
}

console.log("\n=== TEST 3: Seeding de Emergencia si D1 está vacío ===");
{
    let storedStateInD1 = null;
    const mockEnv = {
        MARSKET_DB: {
            prepare: (query) => ({
                run: async () => ({ success: true }),
                bind: (...args) => ({
                    run: async () => {
                        if (query.includes("INSERT OR REPLACE INTO state (id, data) VALUES ('current'")) {
                            storedStateInD1 = JSON.parse(args[0]);
                        }
                        return { success: true };
                    }
                }),
                first: async () => null,
                all: async () => ({ results: [] })
            })
        }
    };

    const clientPayload = {
        version: 0,
        config: { teachers: {} },
        companies: {}
    };

    const _vaultKey = 'MARS_AEE_2026_SECRET_KEY';
    function encodeSecret(str) {
        let res = '';
        for (let i = 0; i < str.length; i++) {
            res += String.fromCharCode(str.charCodeAt(i) ^ _vaultKey.charCodeAt(i % _vaultKey.length));
        }
        return 'VLT_' + Buffer.from(res, 'binary').toString('base64');
    }
    const token = encodeSecret('T|COORD_MARIO|9999999999');

    const request = new Request('http://localhost/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(clientPayload)
    });

    const res = await onRequestPost({ request, env: mockEnv });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(storedStateInD1.config.teachers.COORD_MARIO.pin, "0001");
    assert.strictEqual(storedStateInD1.config.teachers.COORD_ALEX.pin, "0002");
    console.log("PASS: Seeding de emergencia activado correctamente si D1 carece de profesores.");
}

console.log("\n=== TEST 4: Comentario TODO en ui-docente-management.js ===");
{
    const fileContent = fs.readFileSync('js/ui-docente-management.js', 'utf8');
    assert.ok(fileContent.includes('v1.1.04'), "Debe mencionar la versión v1.1.04");
    assert.ok(fileContent.includes('/api/admin/credentials'), "Debe mencionar el endpoint /api/admin/credentials");
    console.log("PASS: Comentario TODO verificado en js/ui-docente-management.js.");
}

console.log("\n>>> TODAS LAS VERIFICACIONES DEL HOTFIX v1.1.03c PASARON CON ÉXITO (100% OK) <<<");
