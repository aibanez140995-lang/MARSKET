// functions/api/admin/credentials.js
// Endpoint Exclusivo de Credenciales Zero-Trust para Coordinación en Cloudflare D1 (v1.1.05)

import { verifySession } from '../_auth.js';

const VAULT_KEY = 'MARS_AEE_2026_SECRET_KEY';

function decodeSecret(str) {
    if (!str || typeof str !== 'string') return '';
    if (!str.startsWith('VLT_')) return str;
    const b64 = str.slice(4);
    let raw = '';
    try {
        raw = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
    } catch(e) { return str; }
    let out = '';
    for (let i = 0; i < raw.length; i++) {
        out += String.fromCharCode(raw.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length));
    }
    return out;
}

function encodeSecret(str) {
    if (!str) return '';
    const s = String(str);
    let out = '';
    for (let i = 0; i < s.length; i++) {
        out += String.fromCharCode(s.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length));
    }
    const b64 = typeof btoa === 'function' ? btoa(out) : Buffer.from(out, 'binary').toString('base64');
    return 'VLT_' + b64;
}

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
    const authResult = await verifySession(request, env);
    const roleLower = String(authResult.role || '').toLowerCase();
    const isCoordinator = authResult.authorized && (
        authResult.isCoordinator ||
        authResult.isAdmin ||
        roleLower.includes('coord') ||
        roleLower === 'coordinador'
    );

    if (!isCoordinator) {
        return new Response(JSON.stringify({
            error: 'UNAUTHORIZED_COORDINATOR_ACCESS',
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

            // Desencriptar códigos y roles de las empresas
            const companies = {};
            const allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            for (const cid in currentState.companies || {}) {
                const co = currentState.companies[cid];
                let plainCode = co.accessCode || '';
                if (co.authVault?.code) {
                    plainCode = decodeSecret(co.authVault.code);
                }

                const plainRoles = {};
                for (const r of allRoles) {
                    let rPin = '';
                    if (co.authVault?.roles?.[r]) {
                        rPin = decodeSecret(co.authVault.roles[r]);
                    } else if (co.roles?.[r] && !String(co.roles[r]).startsWith('VLT_')) {
                        rPin = String(co.roles[r]);
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

                if (role) {
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
                        co.authVault.roles[role] = encodeSecret(cleanPin);
                        co.roles = co.roles || {};
                        co.roles[role] = 'PROTECTED';
                        if (role === 'AUXILIAR' && co.auxRoleRequest) {
                            co.auxRoleRequest.pin = cleanPin;
                            co.auxRoleRequest.status = 'APROBADO';
                        }
                    }
                } else {
                    const cleanCode = String(newPin || newCode || '').trim().toUpperCase();
                    if (cleanCode.length < 3) {
                        return new Response(JSON.stringify({ error: 'El código de empresa debe tener al menos 3 caracteres' }), { status: 400, headers });
                    }
                    co.authVault.code = encodeSecret(cleanCode);
                    delete co.accessCode;
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
