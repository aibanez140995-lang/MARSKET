// functions/api/state.js
// Endpoint de Estado Zero-Trust y Control de Persistencia en Cloudflare D1 (v1.1.03)

import { verifySession } from './_auth.js';

/**
 * Aplica una capa de filtrado destructivo en memoria sobre el estado de D1
 * para eliminar credenciales y secretos antes de transmitir al cliente (CWE-200).
 *
 * @param {object} rawState
 * @returns {object}
 */
export function sanitizeStateForClient(rawState) {
    if (!rawState || typeof rawState !== 'object') return rawState;
    const clean = JSON.parse(JSON.stringify(rawState));

    // 1. Elimina pin de todas las entradas en config.teachers
    if (clean.config && clean.config.teachers) {
        for (const teacherKey in clean.config.teachers) {
            if (clean.config.teachers[teacherKey]) {
                delete clean.config.teachers[teacherKey].pin;
            }
        }
    }

    // 2. Elimina authVault, roles y accessCode de todas las entradas en companies
    if (clean.companies) {
        for (const cid in clean.companies) {
            const co = clean.companies[cid];
            if (co) {
                delete co.authVault;
                delete co.roles;
                delete co.accessCode;
            }
        }
    }

    return clean;
}

export const onRequestGet = onRequest;
export const onRequestPost = onRequest;

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Configurar CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    // Verificamos que el binding D1 (MARSKET_DB) esté mapeado
    if (!env.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'Binding de Cloudflare D1 (MARSKET_DB) no encontrado en el entorno.' }), { status: 500, headers });
    }

    try {
        if (request.method === 'GET') {
            const action = url.searchParams.get('action');
            
            // Descarga de un backup específico si se solicita
            if (action === 'get_backup') {
                const type = url.searchParams.get('type') || 'backup_daily';
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = ?").bind(type).all();
                if (results && results.length > 0) {
                    let parsed = null;
                    try { parsed = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data; } catch(e) {}
                    if (parsed) {
                        return new Response(JSON.stringify(sanitizeStateForClient(parsed)), { headers });
                    }
                    return new Response(results[0].data, { headers });
                }
                return new Response(JSON.stringify({ status: 'empty' }), { headers });
            }

            // Lectura normal del estado en vivo con sanitización Zero-Trust
            const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
            if (results && results.length > 0) {
                let parsed = null;
                try {
                    parsed = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data;
                } catch(e) {}
                
                if (parsed) {
                    const sanitized = sanitizeStateForClient(parsed);
                    return new Response(JSON.stringify(sanitized), { headers });
                }
                return new Response(results[0].data, { headers });
            }
            
            return new Response(JSON.stringify({ status: 'empty' }), { headers });
        }

        if (request.method === 'POST') {
            const payload = await request.json();

            // Verificación de código maestro docente en servidor contra env.TEACHER_MASTER_CODE
            if (payload.action === 'verify_teacher_master') {
                if (!env.TEACHER_MASTER_CODE) {
                    return new Response(JSON.stringify({ verified: true, mode: 'client_sha256' }), { headers });
                }
                const isAuthorized = String(payload.code || '') === String(env.TEACHER_MASTER_CODE);
                return new Response(JSON.stringify({ verified: isAuthorized }), { status: isAuthorized ? 200 : 403, headers });
            }

            // Validación de código de empresa en servidor (Zero-Trust)
            if (payload.action === 'validate_company_code') {
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                if (results && results.length > 0) {
                    const currentData = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data;
                    const code = String(payload.code || '').trim().toUpperCase();
                    let matchedCoId = null;
                    let hasAux = false;
                    for (const cid in currentData.companies || {}) {
                        const co = currentData.companies[cid];
                        let coCode = '';
                        if (co.authVault && co.authVault.code) {
                            try {
                                const b64 = co.authVault.code.startsWith('VLT_') ? co.authVault.code.slice(4) : co.authVault.code;
                                coCode = (typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8')).trim().toUpperCase();
                            } catch(e) {}
                        } else if (co.accessCode) {
                            coCode = String(co.accessCode).trim().toUpperCase();
                        }
                        if (coCode === code) {
                            matchedCoId = cid;
                            hasAux = !!(co.authVault?.roles?.AUXILIAR || co.roles?.AUXILIAR);
                            break;
                        }
                    }
                    if (matchedCoId) {
                        return new Response(JSON.stringify({
                            matchedCoId,
                            companyMeta: { hasAux, name: currentData.companies[matchedCoId].name }
                        }), { headers });
                    }
                }
                return new Response(JSON.stringify({ error: 'Company code not found' }), { status: 404, headers });
            }

            // Verificación de PIN de departamento en servidor (Zero-Trust)
            if (payload.action === 'verify_student_login') {
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                if (results && results.length > 0) {
                    const currentData = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data;
                    const co = currentData.companies?.[payload.coId];
                    if (co) {
                        let expectedPin = '';
                        if (co.authVault && co.authVault.roles && co.authVault.roles[payload.role]) {
                            try {
                                const b64 = co.authVault.roles[payload.role].startsWith('VLT_') ? co.authVault.roles[payload.role].slice(4) : co.authVault.roles[payload.role];
                                expectedPin = (typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8')).trim();
                            } catch(e) {}
                        } else if (co.roles && co.roles[payload.role] && !String(co.roles[payload.role]).startsWith('VLT_')) {
                            expectedPin = String(co.roles[payload.role]).trim();
                        }
                        const verified = Boolean(expectedPin && expectedPin === String(payload.pin).trim());
                        return new Response(JSON.stringify({ verified, companyName: co.name }), {
                            status: verified ? 200 : 401,
                            headers
                        });
                    }
                }
                return new Response(JSON.stringify({ verified: false }), { status: 401, headers });
            }

            // Verificación de PIN docente en servidor (Zero-Trust)
            if (payload.action === 'verify_teacher_login') {
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                if (results && results.length > 0) {
                    const currentData = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data;
                    const t = currentData.config?.teachers?.[payload.role];
                    const verified = Boolean(t && String(t.pin).trim() === String(payload.pin).trim());
                    return new Response(JSON.stringify({ verified }), {
                        status: verified ? 200 : 401,
                        headers
                    });
                }
                return new Response(JSON.stringify({ verified: false }), { status: 401, headers });
            }

            // Acción manual de backup interceptada desde el Panel Docente
            if (payload.action === 'force_backup') {
                if (env.TEACHER_MASTER_CODE && payload.teacherMasterCode && payload.teacherMasterCode !== env.TEACHER_MASTER_CODE) {
                    return new Response(JSON.stringify({ error: 'Autorización maestra docente inválida' }), { status: 403, headers });
                }
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                if (results && results.length > 0) {
                    const currentData = results[0].data;
                    const dateTag = new Date().toISOString().split('T')[0];
                    
                    // Backup Diario: Sobreescribe siempre la fila 'backup_daily'
                    await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind('backup_daily', currentData).run();
                    
                    // Backup Semanal: Crea una fila inmutable con la fecha actual
                    if (payload.type === 'weekly') {
                        await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind(`backup_weekly_${dateTag}`, currentData).run();
                    }
                    return new Response(JSON.stringify({ success: true, message: 'Backup D1 completado de forma nativa' }), { headers });
                }
                return new Response(JSON.stringify({ error: 'No hay datos en estado corriente para respaldar' }), { status: 400, headers });
            }

            // BLINDAJE ZERO-TRUST (CWE-285): Rechazo de guardado monolítico sin rol de Coordinador
            const authResult = await verifySession(request, env);
            if (!authResult.authorized) {
                return new Response(JSON.stringify({
                    error: 'UNAUTHORIZED_MUTATION',
                    message: 'Guardado monolítico restringido exclusivamente a Coordinación docente autenticada.'
                }), { status: 403, headers });
            }

            // 1. Recuperar el estado REAL actual de D1
            const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
            let currentState = null;
            if (row && row.data) {
                try {
                    currentState = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
                } catch(e) {}
            }

            // 2. Si D1 está vacío o corrupto, aplicar Seeding de Emergencia
            if (!currentState || !currentState.config || !currentState.config.teachers) {
                currentState = currentState || { config: {}, companies: {} };
                currentState.config = currentState.config || {};
                const defaultTeachers = {
                    'COORD_MARIO': { name: "Coordinación - Mario", pin: "0001", admin: true },
                    'COORD_ALEX': { name: "Coordinación - Álex", pin: "0002", admin: true },
                    'FYQ': { name: "Dpto. Física y Química", pin: "0101", admin: true },
                    'ECO': { name: "Dpto. Economía", pin: "0202", admin: true },
                    'LYE': { name: "Dpto. Liderazgo y Emprendimiento", pin: "0303", admin: true },
                    'LEN': { name: "Dpto. Lengua Castellana", pin: "0404", admin: true },
                    'MAT': { name: "Dpto. Matemáticas", pin: "0505", admin: true },
                    'ING': { name: "Dpto. Inglés", pin: "0606", admin: true }
                };
                currentState.config.teachers = defaultTeachers;
            }

            // 3. FUSIÓN DE SECRETOS (Server-Side Merging)
            // El cliente envía 'payload'. Reinyectamos las credenciales reales de D1.
            
            // A. Restaurar PINs docentes
            if (payload.config && payload.config.teachers) {
                for (const key in payload.config.teachers) {
                    if (currentState.config?.teachers?.[key] && currentState.config.teachers[key].pin) {
                        payload.config.teachers[key].pin = currentState.config.teachers[key].pin;
                    } else if (!payload.config.teachers[key].pin) {
                        payload.config.teachers[key].pin = "1234";
                    }
                }
                if (currentState.config?.teachers) {
                    for (const key in currentState.config.teachers) {
                        if (!payload.config.teachers[key]) {
                            payload.config.teachers[key] = currentState.config.teachers[key];
                        }
                    }
                }
            } else if (currentState.config) {
                payload.config = currentState.config;
            }

            // B. Restaurar Bóvedas de Startups (authVault, accessCode, roles)
            if (payload.companies) {
                for (const cid in payload.companies) {
                    if (currentState.companies && currentState.companies[cid]) {
                        const sCo = currentState.companies[cid];
                        if (sCo.authVault) {
                            payload.companies[cid].authVault = sCo.authVault;
                        }
                        if (sCo.accessCode) {
                            payload.companies[cid].accessCode = sCo.accessCode;
                        }
                        if (sCo.roles) {
                            payload.companies[cid].roles = sCo.roles;
                        }
                    }
                }
            } else if (currentState.companies) {
                payload.companies = currentState.companies;
            }

            // Control optimista de concurrencia basado en payload.version
            const serverVersion = (currentState && currentState.version) ? Number(currentState.version) : 0;
            const incomingVersion = Number(payload.version) || 0;

            if (serverVersion > 0 && incomingVersion < serverVersion && incomingVersion !== 0) {
                return new Response(JSON.stringify({ error: 'Conflict: Server has a newer version', serverVersion, changes: 0 }), { status: 409, headers });
            }

            // Forzar actualización de versión
            payload.version = serverVersion + 1;
            const dataString = JSON.stringify(payload);
            
            // Resiliencia - Auto-Backup del estado inmediatamente anterior antes de sobreescribir
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) SELECT 'backup_previous', data FROM state WHERE id = 'current'").run();
            
            // Escritura atómica en D1
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(dataString).run();
            
            return new Response(JSON.stringify({ success: true, version: payload.version }), { headers });
        }
        
        return new Response('Method Not Allowed', { status: 405, headers });
        
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}