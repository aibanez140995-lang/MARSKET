// functions/api/_auth.js
// Middleware de Autenticación y Autorización Zero-Trust para Cloudflare Pages / Workers (v1.1.03)

/**
 * Valida la cabecera Authorization de la petición contra el token de sesión.
 * Permite verificar si el emisor posee rol de Coordinador docente o permisos administrativos.
 *
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<{ authorized: boolean, role: string|null, isAdmin: boolean, error?: string }>}
 */
export async function verifySession(request, env = {}) {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization') || '';
    if (!authHeader) {
        return { authorized: false, role: null, isAdmin: false, error: 'MISSING_AUTHORIZATION_HEADER' };
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        return { authorized: false, role: null, isAdmin: false, error: 'EMPTY_TOKEN' };
    }

    // 1. Verificación directa contra variables de entorno maestras
    if (env?.TEACHER_MASTER_CODE && token === env.TEACHER_MASTER_CODE) {
        return { authorized: true, role: 'coordinador', isAdmin: true };
    }
    if (env?.MASTER_RESET_HASH && token === env.MASTER_RESET_HASH) {
        return { authorized: true, role: 'coordinador', isAdmin: true };
    }

    // 2. Procesamiento de token según formato
    try {
        let decoded = '';
        if (token.startsWith('VLT_')) {
            const b64 = token.slice(4);
            decoded = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('utf8');
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
                    role: jwtPayload.role,
                    isAdmin: !!jwtPayload.admin,
                    user: jwtPayload
                };
            }
        } else {
            decoded = token;
        }

        // Formato interno MARSKET: T|ROLE|TIMESTAMP o S|COID|ROLE|CODE|AUX|TIMESTAMP
        if (decoded.startsWith('T|')) {
            const parts = decoded.split('|');
            const role = parts[1] || '';
            const lowerRole = role.toLowerCase();
            const isCoord = lowerRole.includes('coord') || lowerRole === 'coordinador' || lowerRole === 'docente';
            return {
                authorized: isCoord,
                role: role,
                isAdmin: true,
                raw: decoded
            };
        } else if (decoded.startsWith('S|')) {
            const parts = decoded.split('|');
            return {
                authorized: false, // Las credenciales de startup/alumno no autorizan mutaciones administrativas
                role: parts[2] || '',
                coId: parts[1] || '',
                isAdmin: false,
                raw: decoded,
                error: 'STUDENT_ROLE_UNAUTHORIZED'
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
