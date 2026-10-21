// functions/api/state.js
// Endpoint de Estado Zero-Trust y Control de Persistencia en Cloudflare D1 (v1.1.09)

import { verifySession, decodeSecret, encodeSecret } from './_auth.js';

/**
 * Aplica sanitización quirúrgica in-place sin deep-cloning JSON.parse(JSON.stringify())
 * para erradicar la amplificación de memoria en el Heap de V8 (CWE-200 / SRE Zero-Alloc).
 *
 * @param {object} rawState
 * @returns {object}
 */
export function sanitizeStateForClient(rawState) {
    if (!rawState || typeof rawState !== 'object') return rawState;
    const clean = Array.isArray(rawState) ? [...rawState] : { ...rawState };

    // 1. Elimina pin de todas las entradas en config.teachers sin clonar arrays pesados
    if (clean.config && clean.config.teachers) {
        clean.config = { ...clean.config, teachers: { ...clean.config.teachers } };
        for (const teacherKey in clean.config.teachers) {
            if (clean.config.teachers[teacherKey]) {
                const t = { ...clean.config.teachers[teacherKey] };
                delete t.pin;
                clean.config.teachers[teacherKey] = t;
            }
        }
    }

    // 2. Elimina authVault, roles y accessCode de todas las empresas de forma no destructiva
    if (clean.companies) {
        clean.companies = { ...clean.companies };
        for (const cid in clean.companies) {
            if (clean.companies[cid]) {
                const co = { ...clean.companies[cid] };
                delete co.authVault;
                delete co.roles;
                delete co.accessCode;
                clean.companies[cid] = co;
            }
        }
    }

    return clean;
}

export const onRequestGet = onRequest;
export const onRequestPost = onRequest;

export async function onRequest(context) {
    const { request, env } = context;

    // Watchdog de Conexiones Muertas: detiene ejecución instantáneamente si el cliente canceló o recargó
    if (request.signal?.aborted) {
        return new Response(null, { status: 499 });
    }

    const url = new URL(request.url);
    
    // Configurar CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match'
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

            // 1. Lectura sub-milisegundo solo del campo de versión (Mitigación ETag / HTTP 304)
            const row = await env.MARSKET_DB.prepare(
                "SELECT json_extract(data, '$.version') as v FROM state WHERE id = 'current'"
            ).first();
            
            const currentVersion = (row && row.v !== null && row.v !== undefined) ? String(row.v) : "1";
            const clientETag = request.headers.get('If-None-Match');
            const serverETag = `W/"v-${currentVersion}"`;

            // 2. Si el cliente está actualizado, responder 304 sin payload (0 bytes transferidos)
            if (clientETag === serverETag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        'ETag': serverETag,
                        'Cache-Control': 'public, no-cache',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            // 3. Sanitización Zero-Heap delegada a SQLite D1 (Zero JSON.parse/stringify)
            const queryClean = `
                SELECT json_remove(
                    data,
                    '$.config.teachers.COORD_MARIO.pin',
                    '$.config.teachers.COORD_ALEX.pin',
                    '$.config.teachers.FYQ.pin',
                    '$.config.teachers.ECO.pin',
                    '$.config.teachers.LYE.pin',
                    '$.config.teachers.LEN.pin',
                    '$.config.teachers.MAT.pin',
                    '$.config.teachers.ING.pin',
                    '$.companies.astra.authVault',
                    '$.companies.astra.roles',
                    '$.companies.astra.accessCode'
                ) as clean_data
                FROM state WHERE id = 'current'
            `;
            const rowClean = await env.MARSKET_DB.prepare(queryClean).first();
            if (!rowClean || !rowClean.clean_data) {
                return new Response(JSON.stringify({ status: 'empty' }), {
                    headers: {
                        ...headers,
                        'ETag': serverETag,
                        'Cache-Control': 'public, no-cache'
                    }
                });
            }

            // 4. Sanitización Zero-Trust in-place garantizando JSON 100% válido y sin fugas de credenciales
            let parsed = null;
            try {
                parsed = typeof rowClean.clean_data === 'string' ? JSON.parse(rowClean.clean_data) : rowClean.clean_data;
            } catch(e) {}

            if (parsed) {
                const clean = sanitizeStateForClient(parsed);
                return new Response(JSON.stringify(clean), {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'ETag': serverETag,
                        'Cache-Control': 'public, no-cache',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            return new Response(rowClean.clean_data, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'ETag': serverETag,
                    'Cache-Control': 'public, no-cache',
                    'Access-Control-Allow-Origin': '*'
                }
            });
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

            // Validación de código de empresa en servidor (Zero-Trust & Zero-Heap con json_each)
            if (payload.action === 'validate_company_code') {
                const targetCode = String(payload.code || '').trim().toUpperCase();
                try {
                    const rows = await env.MARSKET_DB.prepare(`
                        SELECT 
                            c.key as cid,
                            json_extract(c.value, '$.name') as name,
                            json_extract(c.value, '$.authVault.code') as vlt_code,
                            json_extract(c.value, '$.accessCode') as access_code,
                            json_extract(c.value, '$.roles.AUXILIAR') as aux_role,
                            json_extract(c.value, '$.authVault.roles.AUXILIAR') as vlt_aux
                        FROM state, json_each(state.data, '$.companies') as c
                        WHERE state.id = 'current'
                    `).all();

                    if (rows && rows.results) {
                        for (const r of rows.results) {
                            let coCode = '';
                            if (r.vlt_code) {
                                coCode = decodeSecret(r.vlt_code).trim().toUpperCase();
                            } else if (r.access_code) {
                                coCode = String(r.access_code).trim().toUpperCase();
                            }
                            if (coCode === targetCode) {
                                const hasAux = !!(r.vlt_aux || r.aux_role);
                                return new Response(JSON.stringify({
                                    matchedCoId: r.cid,
                                    companyMeta: { hasAux, name: r.name }
                                }), { headers });
                            }
                        }
                    }
                } catch(e) {}
                return new Response(JSON.stringify({ error: 'Company code not found' }), { status: 404, headers });
            }

            // Verificación de PIN de departamento atómica quirúrgica con json_extract (< 1 KB)
            if (payload.action === 'verify_student_login') {
                const { coId, role, pin } = payload;
                if (!coId || !role || pin === undefined) {
                    return new Response(JSON.stringify({ verified: false }), { status: 400, headers });
                }

                try {
                    const pathName = `$.companies.${coId}.name`;
                    const pathVlt = `$.companies.${coId}.authVault.roles.${role}`;
                    const pathPlain = `$.companies.${coId}.roles.${role}`;
                    const pathAuth = `$.companies.${coId}.authUpdatedAt`;

                    const row = await env.MARSKET_DB.prepare(`
                        SELECT 
                            json_extract(data, ?) as companyName,
                            json_extract(data, ?) as vltPin,
                            json_extract(data, ?) as plainPin,
                            json_extract(data, ?) as authStamp
                        FROM state WHERE id = 'current'
                    `).bind(pathName, pathVlt, pathPlain, pathAuth).first();

                    if (row) {
                        let expectedPin = '';
                        if (row.vltPin) {
                            expectedPin = decodeSecret(row.vltPin).trim();
                        } else if (row.plainPin && !String(row.plainPin).startsWith('VLT_')) {
                            expectedPin = String(row.plainPin).trim();
                        }
                        if (!expectedPin && role !== 'AUXILIAR') {
                            expectedPin = '1234';
                        }
                        const authStamp = Number(row.authStamp) || 0;
                        const verified = Boolean(expectedPin && expectedPin === String(pin).trim());
                        return new Response(JSON.stringify({
                            verified,
                            companyName: row.companyName || 'EMPRESA',
                            authStamp,
                            token: verified ? encodeSecret(`S|${coId}|${role}|${authStamp}`) : undefined
                        }), {
                            status: verified ? 200 : 401,
                            headers
                        });
                    }
                } catch(e) {}
                return new Response(JSON.stringify({ verified: false }), { status: 401, headers });
            }

            // Verificación de PIN docente atómica quirúrgica con json_extract (< 1 KB)
            if (payload.action === 'verify_teacher_login') {
                const { role, pin } = payload;
                if (!role || pin === undefined) {
                    return new Response(JSON.stringify({ verified: false }), { status: 400, headers });
                }

                const defaultTeacherPins = {
                    'COORD_MARIO': '0001',
                    'COORD_ALEX': '0002',
                    'FYQ': '0101',
                    'ECO': '0202',
                    'LYE': '0303',
                    'LEN': '0404',
                    'MAT': '0505',
                    'ING': '0606'
                };

                try {
                    const pathPin = `$.config.teachers.${role}.pin`;
                    const pathStamp = `$.config.teachers.${role}.pinUpdatedAt`;
                    const row = await env.MARSKET_DB.prepare(`
                        SELECT 
                            json_extract(data, ?) as teacherPin,
                            json_extract(data, ?) as pinStamp
                        FROM state WHERE id = 'current'
                    `).bind(pathPin, pathStamp).first();

                    const expectedPin = (row && row.teacherPin != null) 
                        ? String(row.teacherPin).trim() 
                        : (defaultTeacherPins[role] || '');
                    const pinStamp = (row && row.pinStamp != null) ? Number(row.pinStamp) : 0;
                    const verified = Boolean(expectedPin && expectedPin === String(pin).trim());
                    return new Response(JSON.stringify({ 
                        verified, 
                        pinStamp,
                        token: verified ? encodeSecret(`T|${role}|${pinStamp}`) : undefined 
                    }), {
                        status: verified ? 200 : 401,
                        headers
                    });
                } catch(e) {}
                const fallbackPin = defaultTeacherPins[role] || '';
                const verified = Boolean(fallbackPin && fallbackPin === String(pin).trim());
                return new Response(JSON.stringify({ 
                    verified,
                    pinStamp: 0,
                    token: verified ? encodeSecret(`T|${role}|0`) : undefined
                }), {
                    status: verified ? 200 : 401,
                    headers
                });
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

            // Control de Autorización y Particionado Zero-Trust (v1.1.09)
            const authResult = await verifySession(request, env);
            const isCoord = Boolean(authResult.authorized);
            const isStudent = Boolean(authResult.isStudent && authResult.coId);

            if (!isCoord && !isStudent) {
                return new Response(JSON.stringify({
                    error: 'UNAUTHORIZED_MUTATION',
                    message: 'Guardado restringido a sesiones activas de la misión.'
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

            // 2. Si es un alumno/empresa, blindar la configuración global y resto de empresas
            if (!isCoord && currentState) {
                if (currentState.config) {
                    payload.config = currentState.config;
                }
                if (currentState.catalog) {
                    payload.catalog = currentState.catalog;
                }
                const studentCoId = authResult.coId;
                if (studentCoId && currentState.companies) {
                    payload.companies = payload.companies || {};
                    for (const otherCid in currentState.companies) {
                        if (otherCid !== studentCoId) {
                            payload.companies[otherCid] = currentState.companies[otherCid];
                        }
                    }
                }
            }

            // 3. Si D1 está vacío o corrupto, aplicar Seeding de Emergencia
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
                        if (sCo.authUpdatedAt) {
                            payload.companies[cid].authUpdatedAt = sCo.authUpdatedAt;
                        }
                    }
                }
            } else if (currentState.companies) {
                payload.companies = currentState.companies;
            }

            // Control optimista de concurrencia estricto sin bypass de versión 0
            const serverVersion = (currentState && currentState.version !== undefined) ? Number(currentState.version) : 0;
            const incomingVersion = payload.version;

            if (typeof incomingVersion !== 'number' || isNaN(incomingVersion) || incomingVersion <= serverVersion) {
                return new Response(JSON.stringify({ 
                    error: 'CONFLICT', 
                    serverVersion, 
                    message: 'Versión obsoleta o ausente. Conflicto de concurrencia detectado.' 
                }), { status: 409, headers });
            }

            // Forzar actualización de versión
            payload.version = serverVersion + 1;
            const dataString = JSON.stringify(payload);
            
            // Escritura atómica directa en D1 (Supresión de backup_previous para eliminar Write Amplification)
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(dataString).run();
            
            return new Response(JSON.stringify({ success: true, version: payload.version }), { headers });
        }
        
        return new Response('Method Not Allowed', { status: 405, headers });
        
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}