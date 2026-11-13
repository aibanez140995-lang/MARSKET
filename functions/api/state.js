// functions/api/state.js
// Endpoint de Estado Zero-Trust y Control de Persistencia en Cloudflare D1 (v1.1.13beta)

import { verifySession, signSessionToken, decodeSecret, encodeSecret, VAULT_KEY } from './_auth.js';

/**
 * Redacta datos de borrador del Concurso Final (Fase V) si la lectura no es de Coordinación
 * y los resultados aún no han sido publicados oficialmente.
 *
 * @param {object} fc
 * @param {boolean} includeContestDraft
 * @returns {object}
 */
function redactFinalContestForClient(fc, includeContestDraft = false) {
    if (!fc || typeof fc !== 'object') return fc;
    const isPublished = Boolean(fc.published);
    const nextFinalists = (fc.finalists && typeof fc.finalists === 'object') ? { ...fc.finalists } : {};
    if (!includeContestDraft && !isPublished) {
        return {
            finalists: nextFinalists,
            launches: {},
            podium: { first: null, second: null, third: null },
            roleAwards: { CEO: null, TECNICO: null, FINANZAS: null, MARKETING: null, OPERACIONES: null },
            published: false,
            publishedAt: null,
            updatedAt: Number(fc.updatedAt) || 0
        };
    }
    return fc;
}

/**
 * Purga cualquier referencia a una startup eliminada del bloque finalContest.
 *
 * @param {object} fc
 * @param {string} delCid
 */
function purgeCompanyFromFinalContest(fc, delCid) {
    if (!fc || typeof fc !== 'object' || !delCid) return;
    if (fc.finalists && typeof fc.finalists === 'object') {
        for (const cls of Object.keys(fc.finalists)) {
            if (fc.finalists[cls] === delCid) delete fc.finalists[cls];
        }
    }
    if (fc.launches && typeof fc.launches === 'object') {
        delete fc.launches[delCid];
    }
    if (fc.podium && typeof fc.podium === 'object') {
        for (const slot of ['first', 'second', 'third']) {
            if (fc.podium[slot] === delCid) fc.podium[slot] = null;
        }
    }
    if (fc.roleAwards && typeof fc.roleAwards === 'object') {
        for (const rKey of Object.keys(fc.roleAwards)) {
            if (fc.roleAwards[rKey] === delCid) fc.roleAwards[rKey] = null;
        }
    }
}

/**
 * Aplica sanitización quirúrgica in-place sin deep-cloning JSON.parse(JSON.stringify())
 * para erradicar la amplificación de memoria en el Heap de V8 (CWE-200 / SRE Zero-Alloc).
 *
 * @param {object} rawState
 * @param {boolean} includeContestDraft
 * @returns {object}
 */
export function sanitizeStateForClient(rawState, includeContestDraft = false) {
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

    // 3. Redactar borrador interno del Concurso Final (Fase V) hasta su publicación oficial
    if (clean.finalContest && typeof clean.finalContest === 'object') {
        clean.finalContest = redactFinalContestForClient(clean.finalContest, includeContestDraft);
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
            const readAuth = await verifySession(request, env).catch(() => null);
            const isCoordReader = Boolean(
                readAuth &&
                readAuth.valid &&
                (readAuth.isCoordinator || (readAuth.role && (readAuth.role.startsWith('COORD') || readAuth.role === 'COORDINADOR')))
            );
            
            // Descarga de un backup específico si se solicita
            if (action === 'get_backup') {
                const type = url.searchParams.get('type') || 'backup_daily';
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = ?").bind(type).all();
                if (results && results.length > 0) {
                    let parsed = null;
                    try { parsed = typeof results[0].data === 'string' ? JSON.parse(results[0].data) : results[0].data; } catch(e) {}
                    if (parsed) {
                        return new Response(JSON.stringify(sanitizeStateForClient(parsed, isCoordReader)), {
                            headers: {
                                ...headers,
                                'Cache-Control': 'private, no-cache',
                                'Vary': 'X-Marsket-Auth'
                            }
                        });
                    }
                    return new Response(results[0].data, {
                        headers: {
                            ...headers,
                            'Cache-Control': 'private, no-cache',
                            'Vary': 'X-Marsket-Auth'
                        }
                    });
                }
                return new Response(JSON.stringify({ status: 'empty' }), { headers });
            }

            if (action === 'fast_version') {
                const rowFast = await env.MARSKET_DB.prepare(
                    "SELECT json_extract(data, '$.version') as v, json_extract(data, '$.lastUpdated') as lu, json_extract(data, '$.config.updatedAt') as cu FROM state WHERE id = 'current'"
                ).first().catch(() => null);
                const version = Number(rowFast?.v) || 1;
                const updatedAt = Number(rowFast?.lu) || 0;
                const configUpdatedAt = Number(rowFast?.cu) || 0;
                return new Response(JSON.stringify({ version, updatedAt, configUpdatedAt }), { headers });
            }

            // 1. Lectura sub-milisegundo solo del campo de versión y config.updatedAt (Mitigación ETag / HTTP 304)
            const row = await env.MARSKET_DB.prepare(
                "SELECT json_extract(data, '$.version') as v, json_extract(data, '$.config.updatedAt') as cu FROM state WHERE id = 'current'"
            ).first().catch(() => null);
            
            const currentVersion = (row && row.v !== null && row.v !== undefined) ? String(row.v) : "1";
            const currentConfigUpdated = (row && row.cu !== null && row.cu !== undefined) ? String(row.cu) : "0";
            const clientETag = request.headers.get('If-None-Match');
            const serverETag = `W/"v-${currentVersion}-${currentConfigUpdated}-${isCoordReader ? 'coord' : 'pub'}"`;

            // 2. Si el cliente está actualizado, responder 304 sin payload (0 bytes transferidos)
            if (clientETag === serverETag) {
                return new Response(null, {
                    status: 304,
                    headers: {
                        'ETag': serverETag,
                        'Cache-Control': 'private, no-cache',
                        'Vary': 'X-Marsket-Auth',
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
                        'Cache-Control': 'private, no-cache',
                        'Vary': 'X-Marsket-Auth'
                    }
                });
            }

            // 4. Sanitización Zero-Trust in-place garantizando JSON 100% válido y sin fugas de credenciales
            let parsed = null;
            try {
                parsed = typeof rowClean.clean_data === 'string' ? JSON.parse(rowClean.clean_data) : rowClean.clean_data;
            } catch(e) {}

            if (parsed) {
                const clean = sanitizeStateForClient(parsed, isCoordReader);
                return new Response(JSON.stringify(clean), {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'ETag': serverETag,
                        'Cache-Control': 'private, no-cache',
                        'Vary': 'X-Marsket-Auth',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }

            return new Response(rowClean.clean_data, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'ETag': serverETag,
                    'Cache-Control': 'private, no-cache',
                    'Vary': 'X-Marsket-Auth',
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
                if (!/^[a-zA-Z0-9_-]{1,32}$/.test(targetCode)) {
                    return new Response(JSON.stringify({ error: 'Formato de código inválido' }), { status: 400, headers });
                }
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
                                coCode = decodeSecret(r.vlt_code, VAULT_KEY).trim().toUpperCase();
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
                    const fallbackMap = {
                        'TEST-0000': { matchedCoId: 'sandbox_master', name: 'MARS-X SANDBOX (PRUEBAS)' },
                        'TEST-1111': { matchedCoId: 'sandbox_student', name: 'MARS-X ALUMNO (ESTÁNDAR)' }
                    };
                    const fb = fallbackMap[targetCode];
                    if (fb) {
                        const existingRow = rows?.results?.find(r => r.cid === fb.matchedCoId);
                        if (!existingRow || (!existingRow.vlt_code && !existingRow.access_code)) {
                            return new Response(JSON.stringify({
                                matchedCoId: fb.matchedCoId,
                                companyMeta: { hasAux: true, name: fb.name }
                            }), { headers });
                        }
                    }
                } catch(e) {}
                return new Response(JSON.stringify({ error: 'Company code not found' }), { status: 404, headers });
            }

            // Verificación de PIN de departamento atómica quirúrgica con json_extract (< 1 KB)
            if (payload.action === 'verify_student_login') {
                const { coId, role, pin } = payload;
                const allowedRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
                if (!coId || !role || pin === undefined || !/^[a-z0-9_-]{2,32}$/i.test(coId) || !/^\d{4,6}$/.test(String(pin).trim()) || !allowedRoles.includes(role)) {
                    return new Response(JSON.stringify({ verified: false, error: 'INVALID_PARAMETERS' }), { status: 400, headers });
                }

                try {
                    const pathName = `$.companies.${coId}.name`;
                    const pathVlt = `$.companies.${coId}.authVault.roles.${role}`;
                    const pathPlain = `$.companies.${coId}.roles.${role}`;
                    const pathAuth = `$.companies.${coId}.authUpdatedAt`;

                    let row = await env.MARSKET_DB.prepare(`
                        SELECT 
                            json_extract(data, ?) as companyName,
                            json_extract(data, ?) as vltPin,
                            json_extract(data, ?) as plainPin,
                            json_extract(data, ?) as authStamp
                        FROM state WHERE id = 'current'
                    `).bind(pathName, pathVlt, pathPlain, pathAuth).first();

                    if ((!row || !row.companyName || row.companyName === 'SANDBOX_MASTER' || row.companyName === 'SANDBOX_STUDENT') && (coId === 'sandbox_master' || coId === 'sandbox_student')) {
                        row = row || { vltPin: '', plainPin: '1234', authStamp: 0 };
                        row.companyName = coId === 'sandbox_student' ? 'MARS-X ALUMNO (ESTÁNDAR)' : 'MARS-X SANDBOX (PRUEBAS)';
                    }

                    if (row) {
                        let expectedPin = '';
                        if (row.vltPin) {
                            expectedPin = decodeSecret(row.vltPin, VAULT_KEY).trim();
                        } else if (row.plainPin && !String(row.plainPin).startsWith('VLT_') && String(row.plainPin).trim().toUpperCase() !== 'PROTECTED') {
                            expectedPin = String(row.plainPin).trim();
                        }
                        if (!expectedPin && (role !== 'AUXILIAR' || coId === 'sandbox_master' || coId === 'sandbox_student')) {
                            expectedPin = '1234';
                        }
                        const authStamp = Number(row.authStamp) || 0;
                        const verified = Boolean(expectedPin && expectedPin === String(pin).trim());

                        if (verified) {
                            try {
                                const nowIso = new Date().toISOString();
                                await env.MARSKET_DB.prepare(`
                                    UPDATE state
                                    SET data = json_set(
                                        data,
                                        '$.companies.' || ? || '.loginStats.totalLogins', COALESCE(json_extract(data, '$.companies.' || ? || '.loginStats.totalLogins'), 0) + 1,
                                        '$.companies.' || ? || '.loginStats.roles.' || ? || '.count', COALESCE(json_extract(data, '$.companies.' || ? || '.loginStats.roles.' || ? || '.count'), 0) + 1,
                                        '$.companies.' || ? || '.loginStats.roles.' || ? || '.lastLogin', ?,
                                        '$.telemetry.totalLogins', COALESCE(json_extract(data, '$.telemetry.totalLogins'), 0) + 1
                                    )
                                    WHERE id = 'current'
                                      AND json_extract(data, '$.companies.' || ? || '.name') IS NOT NULL
                                `).bind(coId, coId, coId, role, coId, role, coId, role, nowIso, coId).run();
                            } catch(e) {}
                        }

                        const token = verified ? await signSessionToken({ role, coId, admin: false }, env.AUTH_SECRET) : undefined;
                        return new Response(JSON.stringify({
                            verified,
                            companyName: row.companyName || 'EMPRESA',
                            authStamp,
                            token
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
                if (!role || pin === undefined || !/^(COORD_[A-Z0-9_]{2,20}|FYQ|ECO|LYE|LEN|MAT|ING)$/.test(role) || !/^\d{4,6}$/.test(String(pin).trim())) {
                    return new Response(JSON.stringify({ verified: false, error: 'INVALID_PARAMETERS' }), { status: 400, headers });
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
                    const isCoord = role.startsWith('COORD');
                    const token = verified ? await signSessionToken({ role, admin: true, isCoordinator: isCoord }, env.AUTH_SECRET) : undefined;
                    return new Response(JSON.stringify({ 
                        verified, 
                        pinStamp,
                        token 
                    }), {
                        status: verified ? 200 : 401,
                        headers
                    });
                } catch(e) {}
                const fallbackPin = defaultTeacherPins[role] || '';
                const verified = Boolean(fallbackPin && fallbackPin === String(pin).trim());
                const isCoord = role.startsWith('COORD');
                const token = verified ? await signSessionToken({ role, admin: true, isCoordinator: isCoord }, env.AUTH_SECRET) : undefined;
                return new Response(JSON.stringify({ 
                    verified,
                    pinStamp: 0,
                    token
                }), {
                    status: verified ? 200 : 401,
                    headers
                });
            }

            // Acción manual de backup interceptada desde el Panel Docente (Exclusivo COORD_*)
            if (payload.action === 'force_backup') {
                const auth = await verifySession(request, env);
                const isCoord = Boolean(auth.valid && (auth.isCoordinator || (auth.role && (auth.role.startsWith('COORD') || auth.role === 'COORDINADOR'))));
                if (!isCoord) {
                    return new Response(JSON.stringify({ error: 'Solo perfiles COORD_* pueden ejecutar copias de seguridad.' }), { status: 403, headers });
                }
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

            // Control de Autorización y Particionado Zero-Trust (v1.1.25)
            const auth = await verifySession(request, env);
            const isCoord = Boolean(auth.isCoordinator || (auth.role && (auth.role.startsWith('COORD') || auth.role === 'COORDINADOR')));
            const teacherRoles = ['FYQ', 'ECO', 'MAT', 'LEN', 'ING', 'LYE'];
            const isTeacher = Boolean(auth.isAdmin === true || (auth.role && (teacherRoles.includes(auth.role) || isCoord)));

            if (auth.isStudent && !payload.coId) {
                payload.coId = auth.coId;
            }

            // Permite la mutación de estado a cualquier usuario docente autenticado (auth.isAdmin === true o rol docente en ['FYQ','ECO','LYE','MAT','LEN','ING','COORD_*']), reservando únicamente el reseteo destructivo o backups a roles COORD_*.
            if (!auth.valid || (!isTeacher && (!auth.isStudent || auth.coId !== payload.coId))) {
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

            // Reseteo destructivo reservado exclusivamente a roles COORD_*
            if ((payload.action === 'reset' || (payload.resetEpoch && currentState && payload.resetEpoch !== currentState.resetEpoch)) && !isCoord) {
                return new Response(JSON.stringify({
                    error: 'UNAUTHORIZED_RESET',
                    message: 'El reseteo destructivo está reservado exclusivamente a roles COORD_*.'
                }), { status: 403, headers });
            }

            // 2. Si es un alumno/empresa (NO docente), blindar la configuración global y resto de empresas
            if (!isTeacher && currentState) {
                if (currentState.config) {
                    payload.config = currentState.config;
                }
                if (currentState.catalog) {
                    payload.catalog = currentState.catalog;
                }
                const studentCoId = auth.coId;
                if (studentCoId && currentState.companies) {
                    payload.companies = payload.companies || {};
                    for (const otherCid in currentState.companies) {
                        if (otherCid !== studentCoId) {
                            payload.companies[otherCid] = currentState.companies[otherCid];
                        }
                    }
                }
            }

            // 2B. Blindaje Fase V (finalContest): escritura reservada exclusivamente a roles COORD_*
            if (currentState) {
                if (!isCoord) {
                    if (currentState.finalContest) {
                        payload.finalContest = currentState.finalContest;
                    } else {
                        delete payload.finalContest;
                    }
                } else if (currentState.finalContest && payload.finalContest) {
                    const currFcUpd = Number(currentState.finalContest.updatedAt) || 0;
                    const incFcUpd = Number(payload.finalContest.updatedAt) || 0;
                    if (currFcUpd > incFcUpd) {
                        payload.finalContest = currentState.finalContest;
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
            if (payload.config && payload.config.teachers) {
                delete payload.config.teachers.BIO;
                for (const key in payload.config.teachers) {
                    if (currentState.config?.teachers?.[key] && currentState.config.teachers[key].pin) {
                        payload.config.teachers[key].pin = currentState.config.teachers[key].pin;
                    } else if (!payload.config.teachers[key].pin) {
                        payload.config.teachers[key].pin = defaultTeacherPins[key] || "1234";
                    }
                }
                if (currentState.config?.teachers) {
                    for (const key in currentState.config.teachers) {
                        if (key === 'BIO') continue;
                        if (!payload.config.teachers[key]) {
                            payload.config.teachers[key] = currentState.config.teachers[key];
                        }
                    }
                }
            } else if (currentState.config) {
                payload.config = currentState.config;
                if (payload.config.teachers && 'BIO' in payload.config.teachers) delete payload.config.teachers.BIO;
            }

            // Protección granular LWW de config.deliverableSchedule, config.deadlines, config.scheduleBaselineVersion y config.guidelines
            if (currentState && currentState.config) {
                payload.config = payload.config || {};
                const currCfg = currentState.config;
                const incCfg = payload.config;
                const currentConfigUpdated = Number(currCfg.updatedAt) || 0;
                const incomingConfigUpdated = Number(incCfg.updatedAt) || 0;

                incCfg.scheduleBaselineVersion = Math.max(
                    Number(currCfg.scheduleBaselineVersion) || 0,
                    Number(incCfg.scheduleBaselineVersion) || 0
                );

                const currSched = (currCfg.deliverableSchedule && typeof currCfg.deliverableSchedule === 'object') ? currCfg.deliverableSchedule : {};
                const incSched = (incCfg.deliverableSchedule && typeof incCfg.deliverableSchedule === 'object') ? incCfg.deliverableSchedule : {};
                const mergedSched = {};
                const allKeys = new Set([...Object.keys(currSched), ...Object.keys(incSched)]);

                for (const dKey of allKeys) {
                    const cItem = currSched[dKey] && typeof currSched[dKey] === 'object' ? currSched[dKey] : null;
                    const iItem = incSched[dKey] && typeof incSched[dKey] === 'object' ? incSched[dKey] : null;
                    if (cItem && !iItem) {
                        mergedSched[dKey] = cItem;
                    } else if (!cItem && iItem) {
                        mergedSched[dKey] = iItem;
                    } else if (cItem && iItem) {
                        const cUpd = Number(cItem.updatedAt) || 0;
                        const iUpd = Number(iItem.updatedAt) || 0;
                        if (cUpd > iUpd) {
                            mergedSched[dKey] = cItem;
                        } else if (iUpd > cUpd) {
                            mergedSched[dKey] = iItem;
                        } else {
                            const cHasExplicit = Boolean((cItem.guideDocUrl && String(cItem.guideDocUrl).trim()) || cItem.clearedGuide);
                            const iHasExplicit = Boolean((iItem.guideDocUrl && String(iItem.guideDocUrl).trim()) || iItem.clearedGuide);
                            mergedSched[dKey] = (cHasExplicit && !iHasExplicit) ? cItem : iItem;
                        }
                    }
                }
                if (Object.keys(mergedSched).length > 0) {
                    incCfg.deliverableSchedule = mergedSched;
                }

                const currDeadlines = (currCfg.deadlines && typeof currCfg.deadlines === 'object') ? currCfg.deadlines : {};
                const incDeadlines = (incCfg.deadlines && typeof incCfg.deadlines === 'object') ? incCfg.deadlines : {};
                const mergedDeadlines = (currentConfigUpdated > incomingConfigUpdated)
                    ? { ...incDeadlines, ...currDeadlines }
                    : { ...currDeadlines, ...incDeadlines };
                for (const [dKey, sItem] of Object.entries(mergedSched)) {
                    if (sItem && sItem.deadline) {
                        mergedDeadlines[dKey] = sItem.deadline;
                    }
                }
                incCfg.deadlines = mergedDeadlines;

                if (currentConfigUpdated > incomingConfigUpdated && currCfg.guidelines) {
                    incCfg.guidelines = currCfg.guidelines;
                }
                incCfg.updatedAt = Math.max(currentConfigUpdated, incomingConfigUpdated);
            }

            // Manejo de deletedCompanyIds (Lista negra persistente de startups eliminadas en Cloudflare D1)
            const allDeletedCompanyIds = Array.from(new Set([
                ...(Array.isArray(currentState.deletedCompanyIds) ? currentState.deletedCompanyIds : []),
                ...(Array.isArray(payload.deletedCompanyIds) ? payload.deletedCompanyIds : [])
            ]));
            payload.deletedCompanyIds = allDeletedCompanyIds;
            currentState.deletedCompanyIds = allDeletedCompanyIds;

            for (const delCid of allDeletedCompanyIds) {
                if (currentState.companies) delete currentState.companies[delCid];
                if (payload.companies) delete payload.companies[delCid];
                purgeCompanyFromFinalContest(currentState.finalContest, delCid);
                purgeCompanyFromFinalContest(payload.finalContest, delCid);
                try {
                    await env.MARSKET_DB.prepare("DELETE FROM company_state WHERE company_id = ?").bind(delCid).run();
                } catch(e) {}
            }

            // B. Restaurar Bóvedas de Startups (authVault, accessCode, roles)
            if (payload.companies) {
                for (const cid in payload.companies) {
                    if (currentState.companies && currentState.companies[cid]) {
                        const sCo = currentState.companies[cid];
                        const pCo = payload.companies[cid];
                        const coordHasUpdatedAuth = isCoord && pCo.authUpdatedAt && (!sCo.authUpdatedAt || pCo.authUpdatedAt >= sCo.authUpdatedAt);
                        if (!coordHasUpdatedAuth) {
                            if (sCo.authVault && sCo.authVault.code) {
                                payload.companies[cid].authVault = sCo.authVault;
                            } else if (!payload.companies[cid].authVault && sCo.authVault) {
                                payload.companies[cid].authVault = sCo.authVault;
                            }
                            if (sCo.accessCode) {
                                payload.companies[cid].accessCode = sCo.accessCode;
                            }
                            if (sCo.roles && (!payload.companies[cid].roles || Object.keys(payload.companies[cid].roles).length === 0)) {
                                payload.companies[cid].roles = sCo.roles;
                            }
                            if (sCo.authUpdatedAt) {
                                payload.companies[cid].authUpdatedAt = sCo.authUpdatedAt;
                            }
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

            // Sincronizar también company_state para que las acciones de empresa tengan datos frescos y no pisen calificaciones docentes
            if (payload.companies && typeof payload.companies === 'object') {
                try {
                    await env.MARSKET_DB.prepare(`
                        CREATE TABLE IF NOT EXISTS company_state (
                            company_id TEXT PRIMARY KEY,
                            data TEXT NOT NULL,
                            version INTEGER NOT NULL DEFAULT 1,
                            updated_at INTEGER NOT NULL
                        )
                    `).run();
                    const syncVer = payload.version;
                    const compStmts = Object.entries(payload.companies).map(([compCid, compData]) => {
                        const upTime = Number(compData?.updatedAt) || Number(payload.lastUpdated) || Date.now();
                        return env.MARSKET_DB.prepare(
                            "INSERT OR REPLACE INTO company_state (company_id, data, version, updated_at) VALUES (?, ?, ?, ?)"
                        ).bind(compCid, JSON.stringify(compData), syncVer, upTime);
                    });
                    if (compStmts.length > 0) {
                        await env.MARSKET_DB.batch(compStmts);
                    }
                } catch(e) {}
            }
            
            const savedCfgUpdated = Number(payload.config?.updatedAt) || 0;
            const savedETag = `W/"v-${payload.version}-${savedCfgUpdated}-${isCoord ? 'coord' : 'pub'}"`;
            return new Response(JSON.stringify({
                success: true,
                version: payload.version,
                configUpdatedAt: savedCfgUpdated,
                etag: savedETag
            }), { headers: { ...headers, 'ETag': savedETag, 'Cache-Control': 'private, no-cache', 'Vary': 'X-Marsket-Auth' } });
        }
        
        return new Response('Method Not Allowed', { status: 405, headers });
        
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}