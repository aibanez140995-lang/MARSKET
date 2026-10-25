// functions/api/_auth.js
// Middleware de Autenticación Criptográfica Zero-Trust con HMAC-SHA256 (v1.1.13beta)
// Criptografía 100% nativa con Web Crypto API (crypto.subtle) sin dependencias externas.

export const DEFAULT_AUTH_SECRET = 'MARSKET_PERIMETER_HMAC_SECRET_KEY_MISSION_2026_STABLE';
export const VAULT_KEY = 'MARS_AEE_2026_SECRET_KEY';

/**
 * Convierte un ArrayBuffer o string UTF-8 a Base64URL sin relleno '='
 * @param {ArrayBuffer|Uint8Array|string} bufferOrStr
 * @returns {string}
 */
export function b64UrlEncode(bufferOrStr) {
    let bytes;
    if (typeof bufferOrStr === 'string') {
        bytes = new TextEncoder().encode(bufferOrStr);
    } else if (bufferOrStr instanceof ArrayBuffer) {
        bytes = new Uint8Array(bufferOrStr);
    } else if (ArrayBuffer.isView(bufferOrStr)) {
        bytes = new Uint8Array(bufferOrStr.buffer, bufferOrStr.byteOffset, bufferOrStr.byteLength);
    } else {
        bytes = new Uint8Array(0);
    }

    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const b64 = (typeof btoa === 'function') 
        ? btoa(binary) 
        : Buffer.from(bytes).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Revierte caracteres Base64URL a Base64 estándar con padding y retorna Uint8Array
 * @param {string} str
 * @returns {Uint8Array}
 */
export function b64UrlDecode(str) {
    if (!str || typeof str !== 'string') return new Uint8Array(0);
    let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4 !== 0) {
        b64 += '=';
    }
    if (typeof atob === 'function') {
        const binary = atob(b64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    } else {
        return new Uint8Array(Buffer.from(b64, 'base64'));
    }
}

/**
 * Emite y firma un token de sesión HMAC-SHA256 con validez de 8 horas.
 * @param {object} payload
 * @param {string} [secret]
 * @returns {Promise<string>}
 */
export async function signSessionToken(payload, secret) {
    const effectiveSecret = (secret && typeof secret === 'string' && secret.length >= 32)
        ? secret
        : DEFAULT_AUTH_SECRET;

    const fullPayload = {
        ...payload,
        iat: Date.now(),
        exp: Date.now() + (8 * 3600 * 1000)
    };

    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(effectiveSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );

    const payloadB64 = b64UrlEncode(JSON.stringify(fullPayload));
    const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
    const sigB64 = b64UrlEncode(sigBuffer);

    return `${payloadB64}.${sigB64}`;
}

/**
 * Valida la cabecera Authorization / X-Marsket-Auth mediante verificación de firma HMAC-SHA256 en tiempo constante.
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<{ valid: boolean, authorized: boolean, status?: number, error?: string, isAdmin?: boolean, isCoordinator?: boolean, isStudent?: boolean, coId?: string|null, role?: string|null, user?: object }>}
 */
export async function verifySession(request, env) {
    // 1. Determinación del secreto perimetral (con fallback seguro a DEFAULT_AUTH_SECRET)
    const effectiveSecret = (env?.AUTH_SECRET && typeof env.AUTH_SECRET === 'string' && env.AUTH_SECRET.length >= 32)
        ? env.AUTH_SECRET
        : DEFAULT_AUTH_SECRET;

    // 2. Extraer token de cabecera Authorization o X-Marsket-Auth
    let authHeader = request.headers.get('Authorization') ||
                     request.headers.get('authorization') ||
                     request.headers.get('X-Marsket-Auth') ||
                     request.headers.get('x-marsket-auth') || '';

    let token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
        return { valid: false, authorized: false, status: 401, error: 'MISSING_TOKEN' };
    }

    // 3. Dividir por punto en [payloadB64, sigB64]
    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return { valid: false, authorized: false, status: 401, error: 'MALFORMED_TOKEN' };
    }
    const [payloadB64, sigB64] = parts;

    // 4. Importar secreto y verificar la firma HMAC-SHA256 en tiempo constante
    let key;
    try {
        key = await crypto.subtle.importKey(
            "raw",
            new TextEncoder().encode(effectiveSecret),
            { name: "HMAC", hash: "SHA-256" },
            false,
            ["verify"]
        );
    } catch (e) {
        return { valid: false, authorized: false, status: 500, error: 'SECURITY_HALT' };
    }

    const sigBytes = b64UrlDecode(sigB64);
    let isValid = false;
    try {
        isValid = await crypto.subtle.verify(
            "HMAC",
            key,
            sigBytes,
            new TextEncoder().encode(payloadB64)
        );
    } catch (e) {
        return { valid: false, authorized: false, status: 403, error: 'INVALID_SIGNATURE' };
    }

    if (!isValid) {
        return { valid: false, authorized: false, status: 403, error: 'INVALID_SIGNATURE' };
    }

    // 5. Deserializar payload JSON y comprobar expiración
    let payload;
    try {
        const payloadBytes = b64UrlDecode(payloadB64);
        payload = JSON.parse(new TextDecoder().decode(payloadBytes));
    } catch (e) {
        return { valid: false, authorized: false, status: 401, error: 'MALFORMED_TOKEN' };
    }

    if (!payload.exp || Date.now() >= payload.exp) {
        return { valid: false, authorized: false, status: 403, error: 'TOKEN_EXPIRED' };
    }

    // 6. Contrato compatible con MARS-KET (v1.1.25)
    const isCoord = Boolean(payload.admin && (payload.role?.startsWith('COORD') || payload.role === 'COORDINADOR'));
    const teacherRoles = ['FYQ', 'ECO', 'BIO', 'MAT', 'LEN', 'ING', 'LYE'];
    const isTeacherRole = Boolean(payload.role && (teacherRoles.includes(payload.role) || payload.role.startsWith('COORD')));
    const isAdmin = Boolean(payload.admin || isTeacherRole);
    return {
        valid: true,
        authorized: isAdmin || isCoord,
        isAdmin: isAdmin,
        isCoordinator: isCoord,
        isTeacher: isAdmin,
        isStudent: Boolean(!payload.admin && !isTeacherRole && payload.coId),
        coId: payload.coId || null,
        role: payload.role || null,
        user: payload
    };
}

/**
 * Desencripta cadenas ofuscadas legacy en D1 usando la clave proporcionada por el entorno.
 * @param {string} enc
 * @param {string} [key]
 * @returns {string}
 */
export function decodeSecret(enc, key = VAULT_KEY) {
    if (!enc || typeof enc !== 'string') return '';
    if (!enc.startsWith('VLT_')) return enc;
    const effectiveKey = key || VAULT_KEY;
    try {
        const b64 = enc.slice(4);
        const raw = typeof atob === 'function' ? atob(b64) : Buffer.from(b64, 'base64').toString('binary');
        let res = '';
        for (let i = 0; i < raw.length; i++) {
            res += String.fromCharCode(raw.charCodeAt(i) ^ effectiveKey.charCodeAt(i % effectiveKey.length));
        }
        return res;
    } catch (e) {
        return '';
    }
}

/**
 * Encripta cadenas para almacenamiento ofuscado en D1 usando la clave proporcionada por el entorno.
 * @param {string} str
 * @param {string} [key]
 * @returns {string}
 */
export function encodeSecret(str, key = VAULT_KEY) {
    if (!str) return '';
    const effectiveKey = key || VAULT_KEY;
    const s = String(str);
    let res = '';
    for (let i = 0; i < s.length; i++) {
        res += String.fromCharCode(s.charCodeAt(i) ^ effectiveKey.charCodeAt(i % effectiveKey.length));
    }
    const b64 = typeof btoa === 'function' ? btoa(res) : Buffer.from(res, 'binary').toString('base64');
    return 'VLT_' + b64;
}
