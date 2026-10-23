// functions/_middleware.js
// Middleware Perimetral de Seguridad y Encabezados Inmutables para Cloudflare Pages Functions

export async function onRequest(context) {
    const { request } = context;
    const origin = request.headers.get('Origin') || '';
    const allowedOrigins = ['https://www.proyectomarsket.es', 'https://proyectomarsket.es', 'https://marsket.pages.dev'];
    const isPagesDev = origin.endsWith('.pages.dev');
    const matchedOrigin = (allowedOrigins.includes(origin) || isPagesDev) ? origin : null;

    // Manejo OPTIONS con CORS restrictivo (nunca comodín '*')
    if (request.method === 'OPTIONS') {
        const preflightHeaders = {
            'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match',
            'Access-Control-Max-Age': '86400'
        };
        if (matchedOrigin) {
            preflightHeaders['Access-Control-Allow-Origin'] = matchedOrigin;
            preflightHeaders['Vary'] = 'Origin';
        }
        return new Response(null, {
            status: 204,
            headers: preflightHeaders
        });
    }

    const response = await context.next();
    const headers = new Headers(response.headers);

    if (matchedOrigin) {
        headers.set('Access-Control-Allow-Origin', matchedOrigin);
        headers.set('Vary', 'Origin');
    }

    // Encabezados Perimetrales de Seguridad Estricta
    headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https://www.proyectomarsket.es https://marsket.pages.dev; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");
    headers.set('Strict-Transport-Security', "max-age=31536000; includeSubDomains; preload");
    headers.set('X-Content-Type-Options', "nosniff");
    headers.set('X-Frame-Options', "DENY");
    headers.set('Referrer-Policy', "strict-origin-when-cross-origin");
    headers.set('Permissions-Policy', "camera=(), microphone=(), geolocation=()");

    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
    });
}
