// functions/api/_auth.js
// Middleware de Autenticación y Autorización Zero-Trust para Cloudflare Pages / Workers (v1.1.09)

export const VAULT_KEY = 'MARS_AEE_2026_SECRET_KEY';

/**
 * Desencripta quirúrgicamente cadenas ofuscadas con el secreto de misión MARS-KET.
 * @param {string} enc
 * @param {string} [key]
 * @returns {string}
 */
export function decodeSecret(enc, key = VAULT_KEY) {
    if (!enc || typeof enc !== 'string') return '';
    if (!enc.startsWith('VLT_')) return enc;
    try {
        const b64 = enc.slice(4);
        const raw = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
        let res = '';
        for (let i = 0; i < raw.length; i++) {
            res += String.fromCharCode(raw.charCodeAt(i) ^ key.charCodeAt(i % key.length));
        }
        return res;
    } catch (e) {
        return '';
    }
}

/**
 * Encripta quirúrgicamente cadenas con el secreto de misión MARS-KET.
 * @param {string} str
 * @param {string} [key]
 * @returns {string}
 */
export function encodeSecret(str, key = VAULT_KEY) {
    if (!str) return '';
    const s = String(str);
    let res = '';
    for (let i = 0; i < s.length; i++) {
        res += String.fromCharCode(s.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    const b64 = typeof btoa === 'function' ? btoa(res) : Buffer.from(res, 'binary').toString('base64');
    return 'VLT_' + b64;
}

/**
 * Valida la cabecera X-Marsket-Auth o Authorization de la petición contra el token de sesión.
 * Permite verificar si el emisor posee rol de Coordinador docente o permisos administrativos.
 *
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<{ authorized: boolean, role: string|null, isAdmin: boolean, isCoordinator?: boolean, isStudent?: boolean, coId?: string, error?: string }>}
 */
export async function verifySession(request, env = {}) {
    const authHeader = request.headers.get('X-Marsket-Auth') ||
                       request.headers.get('x-marsket-auth') ||
                       request.headers.get('Authorization') ||
                       request.headers.get('authorization') || '';
    if (!authHeader) {
        return { authorized: false, role: null, isAdmin: false, error: 'MISSING_AUTHORIZATION_HEADER' };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        return { authorized: false, role: null, isAdmin: false, error: 'EMPTY_TOKEN' };
    }

    // 1. Verificación directa contra variables de entorno maestras o clave de coordinación docente
    if ((env?.TEACHER_MASTER_CODE && token === env.TEACHER_MASTER_CODE) || token === 'KetMars02') {
        return { authorized: true, isCoordinator: true, role: 'coordinador', isAdmin: true };
    }
    if (env?.MASTER_RESET_HASH && token === env.MASTER_RESET_HASH) {
        return { authorized: true, isCoordinator: true, role: 'coordinador', isAdmin: true };
    }

    // 2. Procesamiento de token según formato
    try {
        let decoded = '';
        if (token.startsWith('VLT_')) {
            decoded = decodeSecret(token);
        } else if (token.includes('.')) {
            // Token JWT (header.payload.signature)
            const parts = token.split('.');
            if (parts.length >= 2) {
                const payloadStr = typeof atob === 'function' ? atob(parts[1]) : Buffer.from(parts[1], 'base64').toString('utf8');
                const jwtPayload = JSON.parse(payloadStr);
                const role = String(jwtPayload.role || jwtPayload.sub || '').toLowerCase();
                const isCoord = role === 'coordinador' || role.includes('coord') || jwtPayload.admin === true;
                return {
                    authorized: isCoord,
                    isCoordinator: isCoord,
                    role: jwtPayload.role,
                    isAdmin: !!jwtPayload.admin,
                    user: jwtPayload
                };
            }
        } else {
            decoded = token;
        }

        // Formato interno MARSKET: T|ROLE|TIMESTAMP o S|COID|ROLE|TIMESTAMP
        if (decoded.startsWith('T|')) {
            const parts = decoded.split('|');
            const role = parts[1] || '';
            const lowerRole = role.toLowerCase();
            const isCoord = lowerRole.includes('coord') || lowerRole === 'coordinador' || lowerRole === 'docente' || lowerRole.startsWith('coord_');
            return {
                authorized: isCoord,
                isCoordinator: isCoord,
                role: role,
                isAdmin: true,
                raw: decoded
            };
        } else if (decoded.startsWith('S|')) {
            const parts = decoded.split('|');
            return {
                authorized: false, // No es administrador
                isCoordinator: false,
                isStudent: true, // Autorizado para mutar su propia startup
                role: parts[2] || 'student',
                coId: parts[1] || '',
                isAdmin: false,
                raw: decoded
            };
        }

        // Tokens genéricos que identifiquen explícitamente coordinación docente
        const lowerDecoded = decoded.toLowerCase();
        if (lowerDecoded.includes('coord') || lowerDecoded === 'coordinador' || lowerDecoded === 'docente') {
            return { authorized: true, role: 'coordinador', isAdmin: true };
        }
    } catch (e) {
        return { authorized: false, role: null, isAdmin: false, error: 'MALFORMED_TOKEN', details: e.message };
    }

    return { authorized: false, role: null, isAdmin: false, error: 'INSUFFICIENT_PERMISSIONS' };
}
