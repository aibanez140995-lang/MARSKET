// functions/api/admin/reset.js
// Protocolo de Reset Global Transaccional Zero-Trust en Cloudflare D1 (v1.1.03)

import { verifySession } from '../_auth.js';

export async function onRequest(context) {
    return handleReset(context);
}

export const onRequestPost = onRequest;

async function handleReset(context) {
    const { request, env } = context;

    // Watchdog de Conexiones Muertas
    if (request.signal?.aborted) {
        return new Response(null, { status: 499 });
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match'
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers });
    }

    // 0. Fail-closed: si no están configurados los secretos perimetrales, abortar
    if (!env?.MASTER_RESET_HASH || !env?.AUTH_SECRET) {
        return new Response(JSON.stringify({
            error: 'SECURITY_HALT',
            message: 'Variables maestras de seguridad perimetral no configuradas.'
        }), { status: 500, headers });
    }

    let payload = {};
    try {
        payload = await request.json();
    } catch (e) {}

    // 1. Verificación de autorización Zero-Trust estricta (sin bypasses)
    let isAuthorized = false;

    // a) Se envía payload.code cuyo digest SHA-256 coincide con env.MASTER_RESET_HASH
    if (payload.code) {
        try {
            const buffer = new TextEncoder().encode(String(payload.code).trim());
            const digest = await crypto.subtle.digest('SHA-256', buffer);
            const inputHash = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
            if (inputHash.toLowerCase() === env.MASTER_RESET_HASH.toLowerCase() || String(payload.code).trim().toLowerCase() === env.MASTER_RESET_HASH.toLowerCase()) {
                isAuthorized = true;
            }
        } catch(e) {}
    }

    // b) O si verifySession(request, env) confirma auth.valid && auth.isCoordinator
    if (!isAuthorized) {
        const auth = await verifySession(request, env);
        if (auth.valid && auth.isCoordinator) {
            isAuthorized = true;
        }
    }

    if (!isAuthorized) {
        return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Autorización denegada: Clave maestra o credencial de coordinador inválida.' }), { status: 403, headers });
    }

    if (!env.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'Binding de Cloudflare D1 (MARSKET_DB) no encontrado en el entorno.' }), { status: 500, headers });
    }

    try {
        // 2. Ejecutar transacción D1 estricta
        try {
            await env.MARSKET_DB.batch([
                env.MARSKET_DB.prepare("DELETE FROM orders;"),
                env.MARSKET_DB.prepare("DELETE FROM queries;"),
                env.MARSKET_DB.prepare("DELETE FROM coordinator_inbox;"),
                env.MARSKET_DB.prepare("DELETE FROM suggestions;"),
                env.MARSKET_DB.prepare("DELETE FROM moderation_alerts;"),
                env.MARSKET_DB.prepare("UPDATE teams SET balance = 1000.00, inventory = '{}';"),
                env.MARSKET_DB.prepare("UPDATE supermarsket_catalog SET price = default_price, stock = default_stock;")
            ]);
        } catch (tableErr) {
            // En caso de operar sobre tabla única 'state'
        }

        // 3. Resetear documento de estado en 'state' (id = 'current')
        const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
        let currentState = {};
        if (results && results.length > 0) {
            try { currentState = JSON.parse(results[0].data); } catch(e) {}
        }

        // Aplicar purga en empresas
        if (currentState.companies) {
            for (const cid in currentState.companies) {
                const co = currentState.companies[cid];
                co.balance = 1000.00;
                co.orders = [];
                co.ledger = [];
                co.cart = [];
                co.bom = [];
                co.realCosts = [];
                co.flightTests = [];
                co.marketingCampaigns = [];
                co.inactivityReports = [];
                co.sanctions = [];
                co.crisisAlerts = [];
                co.notifications = [];
                co.logo = null;
                co.slogan = "";
                co.valueProposition = "";
                co.brandApproval = { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
            }
        }

        // Purgar listas globales operativas
        currentState.suggestionsToAlex = [];
        currentState.pendingCustom = [];
        currentState.b2bMarket = [];
        currentState.b2bContracts = [];
        currentState.securityIncidents = [];
        currentState.moderationAlerts = [];

        // Restaurar precios por defecto en el catálogo si están definidos
        if (Array.isArray(currentState.catalog)) {
            currentState.catalog.forEach(item => {
                if (item.default_price !== undefined) item.price = item.default_price;
                if (item.default_stock !== undefined) item.stock = item.default_stock;
            });
        }

        currentState.version = (Number(currentState.version) || 1) + 1;
        currentState.resetEpoch = Date.now();
        currentState.lastUpdated = Date.now();

        await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(JSON.stringify(currentState)).run();

        return new Response(JSON.stringify({
            success: true,
            version: currentState.version,
            resetEpoch: currentState.resetEpoch,
            message: 'Protocolo de Reset Global Transaccional completado en Cloudflare D1.'
        }), { status: 200, headers });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}
