// functions/api/admin/credentials.js
// Endpoint Exclusivo de Credenciales Zero-Trust para Coordinación en Cloudflare D1 (v1.1.45)

import { verifySession, decodeSecret, encodeSecret, VAULT_KEY } from '../_auth.js';

export const onRequestGet = handleCredentials;
export const onRequestPatch = handleCredentials;
export const onRequest = handleCredentials;

export async function handleCredentials(context) {
    const { request, env } = context;

    // Watchdog de Conexiones Muertas
    if (request.signal?.aborted) {
        return new Response(null, { status: 499 });
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (!env?.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'Binding de Cloudflare D1 (MARSKET_DB) no disponible.' }), { status: 500, headers });
    }

    // 1. Verificación de permisos de Coordinador
    const auth = await verifySession(request, env);
    if (!auth.valid || !auth.isCoordinator) {
        return new Response(JSON.stringify({
            error: 'UNAUTHORIZED',
            message: 'Acceso restringido exclusivamente a Coordinación docente.'
        }), { status: 403, headers });
    }

    try {
        // --- MÉTODO GET: Extraer y devolver credenciales en texto plano para Coordinación ---
        if (request.method === 'GET') {
            const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
            if (!row || !row.data) {
                return new Response(JSON.stringify({ error: 'Estado corriente no encontrado' }), { status: 404, headers });
            }

            const currentState = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            const teachers = currentState.config?.teachers || {};

            // Desencriptar códigos y roles de las empresas con auto-reparación determinista
            const companies = {};
            const allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            const defaultCodes = { astra: 'AST-1010', orion: 'ORI-2020', stellar: 'STL-3030' };
            let shouldPersistHealing = false;

            for (const cid in currentState.companies || {}) {
                const co = currentState.companies[cid];
                co.authVault = co.authVault || { code: '', roles: {} };
                co.authVault.roles = co.authVault.roles || {};

                let plainCode = co.accessCode || '';
                if (co.authVault.code) {
                    plainCode = decodeSecret(co.authVault.code, VAULT_KEY);
                }

                if (!plainCode) {
                    const prefix = (co.name || cid).replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
                    const hashNum = 1000 + (Math.abs(cid.split('').reduce((a,c)=>((a<<5)-a)+c.charCodeAt(0)|0, 0)) % 8999);
                    plainCode = defaultCodes[cid] || `${prefix}-${hashNum}`;
                    co.authVault.code = encodeSecret(plainCode, VAULT_KEY);
                    delete co.accessCode;
                    co.authUpdatedAt = Date.now();
                    shouldPersistHealing = true;
                }

                const plainRoles = {};
                for (const r of allRoles) {
                    let rPin = '';
                    if (co.authVault.roles[r]) {
                        rPin = decodeSecret(co.authVault.roles[r], VAULT_KEY);
                    } else if (co.roles?.[r] && !String(co.roles[r]).startsWith('VLT_')) {
                        rPin = String(co.roles[r]);
                    }
                    if (!rPin && r !== 'AUXILIAR') {
                        rPin = '1234';
                        co.authVault.roles[r] = encodeSecret(rPin, VAULT_KEY);
                        co.roles = co.roles || {};
                        co.roles[r] = 'PROTECTED';
                        co.authUpdatedAt = Date.now();
                        shouldPersistHealing = true;
                    }
                    if (rPin) plainRoles[r] = rPin;
                }

                companies[cid] = {
                    id: cid,
                    name: co.name,
                    classGroup: co.classGroup || 'A',
                    accessCode: plainCode,
                    roles: plainRoles,
                    auxRoleDept: co.auxRoleDept || ''
                };
            }

            if (shouldPersistHealing) {
                const now = Date.now();
                currentState.version = (Number(currentState.version) || 0) + 1;
                currentState.lastUpdated = now;
                await env.MARSKET_DB.prepare(
                    "UPDATE state SET data = json(?), updated_at = CURRENT_TIMESTAMP WHERE id = 'current'"
                ).bind(JSON.stringify(currentState)).run().catch(() => null);
            }

            return new Response(JSON.stringify({
                teachers,
                companies,
                version: currentState.version || 1
            }), { status: 200, headers });
        }

        // --- MÉTODO PATCH: Modificación atómica y quirúrgica de credenciales ---
        if (request.method === 'PATCH') {
            const body = await request.json();
            const { type, id, role, newPin, newCode } = body || {};

            if (!type || !id || (type !== 'teacher' && type !== 'company')) {
                return new Response(JSON.stringify({ error: 'Parámetros inválidos. Se requiere type ("teacher"|"company") e id.' }), { status: 400, headers });
            }

            const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
            if (!row || !row.data) {
                return new Response(JSON.stringify({ error: 'Estado no encontrado en D1' }), { status: 404, headers });
            }

            const currentState = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;
            const now = Date.now();

            if (type === 'teacher') {
                currentState.config = currentState.config || {};
                currentState.config.teachers = currentState.config.teachers || {};
                if (!currentState.config.teachers[id]) {
                    return new Response(JSON.stringify({ error: `Docente ${id} no encontrado` }), { status: 404, headers });
                }

                const cleanPin = String(newPin || '').trim();
                if (!/^\d{4}$/.test(cleanPin)) {
                    return new Response(JSON.stringify({ error: 'El PIN docente debe tener exactamente 4 dígitos numéricos' }), { status: 400, headers });
                }

                currentState.config.teachers[id].pin = cleanPin;
                currentState.config.teachers[id].pinUpdatedAt = now;
                currentState.config.updatedAt = now;
            } else if (type === 'company') {
                currentState.companies = currentState.companies || {};
                const co = currentState.companies[id];
                if (!co) {
                    return new Response(JSON.stringify({ error: `Empresa ${id} no encontrada` }), { status: 404, headers });
                }

                co.authVault = co.authVault || { code: '', roles: {} };
                co.authVault.roles = co.authVault.roles || {};

                // Actualización de Código de Empresa si se especifica
                if (newCode || (!role && !body.roles && newPin)) {
                    const cleanCode = String(newCode || newPin || '').trim().toUpperCase();
                    if (cleanCode.length < 3) {
                        return new Response(JSON.stringify({ error: 'El código de empresa debe tener al menos 3 caracteres' }), { status: 400, headers });
                    }
                    co.authVault.code = encodeSecret(cleanCode, VAULT_KEY);
                    delete co.accessCode;
                }

                if (body.roles && typeof body.roles === 'object') {
                    for (const r in body.roles) {
                        const cleanPin = String(body.roles[r] || '').trim();
                        if (/^\d{4}$/.test(cleanPin)) {
                            co.authVault.roles[r] = encodeSecret(cleanPin, VAULT_KEY);
                            co.roles = co.roles || {};
                            co.roles[r] = 'PROTECTED';
                            if (r === 'AUXILIAR' && co.auxRoleRequest) {
                                co.auxRoleRequest.pin = cleanPin;
                                co.auxRoleRequest.status = 'APROBADO';
                            }
                        }
                    }
                } else if (role) {
                    const cleanPin = String(newPin || '').trim();
                    if (role === 'AUXILIAR' && cleanPin === '') {
                        delete co.authVault.roles['AUXILIAR'];
                        if (co.roles) delete co.roles['AUXILIAR'];
                        if (co.auxRoleRequest) {
                            co.auxRoleRequest.pin = '';
                            co.auxRoleRequest.status = 'INACTIVO';
                        }
                    } else {
                        if (!/^\d{4}$/.test(cleanPin)) {
                            return new Response(JSON.stringify({ error: 'El PIN departamental debe tener exactamente 4 dígitos numéricos' }), { status: 400, headers });
                        }
                        co.authVault.roles[role] = encodeSecret(cleanPin, VAULT_KEY);
                        co.roles = co.roles || {};
                        co.roles[role] = 'PROTECTED';
                        if (role === 'AUXILIAR' && co.auxRoleRequest) {
                            co.auxRoleRequest.pin = cleanPin;
                            co.auxRoleRequest.status = 'APROBADO';
                        }
                    }
                }

                co.updatedAt = now;
                co.authUpdatedAt = now;
            }

            // Incremento estricto de versión en servidor
            const currentVersion = Number(currentState.version) || 0;
            currentState.version = currentVersion + 1;
            currentState.lastUpdated = now;

            // Escritura atómica directa en Cloudflare D1
            await env.MARSKET_DB.prepare(
                "UPDATE state SET data = json(?), updated_at = CURRENT_TIMESTAMP WHERE id = 'current'"
            ).bind(JSON.stringify(currentState)).run();

            // Sincronización inmediata con la partición company_state si existe
            if (type === 'company') {
                const co = currentState.companies[id];
                if (co) {
                    await env.MARSKET_DB.prepare(`
                        UPDATE company_state 
                        SET data = json_set(
                            data,
                            '$.authVault', json(?),
                            '$.authUpdatedAt', ?,
                            '$.updatedAt', ?
                        )
                        WHERE company_id = ?
                    `).bind(JSON.stringify(co.authVault), now, now, id).run().catch(() => null);
                }
            }

            return new Response(JSON.stringify({
                success: true,
                newVersion: currentState.version
            }), { status: 200, headers });
        }

        return new Response(JSON.stringify({ error: 'Método no permitido' }), { status: 405, headers });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}
