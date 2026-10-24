// functions/api/company/[cid]/action.js
// Endpoint de Mutaciones Atómicas Particionadas para Startups en Cloudflare D1 (v1.1.11)
// Erradica los megadocumentos monolíticos y las colisiones OCC HTTP 409 entre empresas.

import { verifySession } from '../../_auth.js';

const GOOGLE_DRIVE_REGEX = /^https:\/\/(docs|drive)\.google\.com\/(document|spreadsheets|presentation|file|drive\/folders)\/(d\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)*(\?[^"'\s<>]*)?(#[^"'\s<>]*)?$/;

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match'
};

function calculateBalance(ledger) {
    const INITIAL_CAPITAL = 2400.0;
    if (!Array.isArray(ledger) || ledger.length === 0) return INITIAL_CAPITAL;
    const seenTx = new Set();
    let totalDelta = 0;
    for (const tx of ledger) {
        const id = String(tx?.id || tx?.tx_id || '');
        if (!id || seenTx.has(id)) continue;
        seenTx.add(id);
        const delta = Number(tx.delta);
        if (!isNaN(delta)) totalDelta += delta;
    }
    return Math.round((INITIAL_CAPITAL + totalDelta + Number.EPSILON) * 100) / 100;
}

export async function onRequestOptions() {
    return new Response(null, { headers: CORS_HEADERS });
}

export async function onRequestPost(context) {
    const { request, env, params } = context;
    const cid = String(params?.cid || '').trim();

    if (!cid || !/^[a-z0-9_-]{2,32}$/i.test(cid)) {
        return new Response(JSON.stringify({ error: 'INVALID_COMPANY_ID' }), { status: 400, headers: CORS_HEADERS });
    }

    if (!env?.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE' }), { status: 500, headers: CORS_HEADERS });
    }

    // 1. Control de Autorización Zero-Trust
    const auth = await verifySession(request, env);
    if (!auth.valid || (!auth.isCoordinator && (!auth.isStudent || auth.coId !== cid))) {
        return new Response(JSON.stringify({
            error: 'UNAUTHORIZED_MUTATION',
            message: 'Acceso restringido: no autorizado para mutar esta startup.'
        }), { status: 403, headers: CORS_HEADERS });
    }

    let payload;
    try {
        payload = await request.json();
    } catch(e) {
        return new Response(JSON.stringify({ error: 'INVALID_JSON' }), { status: 400, headers: CORS_HEADERS });
    }

    const action = String(payload.action || '').toUpperCase();
    if (!action) {
        return new Response(JSON.stringify({ error: 'MISSING_ACTION' }), { status: 400, headers: CORS_HEADERS });
    }

    try {
        // Asegurar que la tabla particionada company_state existe
        await env.MARSKET_DB.prepare(`
            CREATE TABLE IF NOT EXISTS company_state (
                company_id TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                version INTEGER NOT NULL DEFAULT 1,
                updated_at INTEGER NOT NULL
            )
        `).run();

        // 2. Leer estado actual de la empresa
        let row = await env.MARSKET_DB.prepare(
            "SELECT data, version, updated_at FROM company_state WHERE company_id = ?"
        ).bind(cid).first();

        let co = null;
        let version = 1;

        if (row && row.data) {
            try { co = typeof row.data === 'string' ? JSON.parse(row.data) : row.data; } catch(e) {}
            version = Number(row.version) || 1;
        }

        // Fallback: Si no está en company_state, extraer del monolito state existente
        if (!co) {
            const stateRow = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
            if (stateRow && stateRow.data) {
                const s = typeof stateRow.data === 'string' ? JSON.parse(stateRow.data) : stateRow.data;
                if (s?.companies?.[cid]) {
                    co = s.companies[cid];
                    version = Number(s.version) || 1;
                }
            }
        }

        if (!co) {
            return new Response(JSON.stringify({ error: 'COMPANY_NOT_FOUND', companyId: cid }), { status: 404, headers: CORS_HEADERS });
        }

        co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
        co.cart = Array.isArray(co.cart) ? co.cart : [];
        co.orders = Array.isArray(co.orders) ? co.orders : [];

        const now = Date.now();

        // 3. Ejecución de la acción atómica
        switch(action) {
            case 'EXECUTE_PURCHASE': {
                const items = Array.isArray(payload.items) ? payload.items : co.cart;
                if (!items || items.length === 0) {
                    return new Response(JSON.stringify({ error: 'EMPTY_CART_OR_ITEMS' }), { status: 400, headers: CORS_HEADERS });
                }

                let totalPurchase = 0;
                items.forEach(item => {
                    const price = Number(item.price) || 0;
                    const qty = Number(item.qty) || 1;
                    totalPurchase += Math.round(price * qty * 100) / 100;
                });
                totalPurchase = Math.round((totalPurchase + Number.EPSILON) * 100) / 100;

                const currentBal = calculateBalance(co.ledger);
                if (currentBal < totalPurchase) {
                    return new Response(JSON.stringify({ 
                        error: 'INSUFFICIENT_FUNDS', 
                        currentBalance: currentBal, 
                        required: totalPurchase 
                    }), { status: 400, headers: CORS_HEADERS });
                }

                const orderId = payload.orderId || ('ORD-' + now.toString().slice(-4));
                const txId = 'TX-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
                const concept = payload.concept || `Compra Catálogo (${items.length} ítems) - Pedido #${orderId}`;

                // Registrar transacción en el libro mayor inmutable
                co.ledger.unshift({
                    id: txId,
                    tx_id: txId,
                    date: new Date().toLocaleString(),
                    concept,
                    dept: payload.dept || 'TECNICO',
                    delta: -totalPurchase,
                    timestamp: now,
                    orderId
                });

                // Registrar pedido
                co.orders.unshift({
                    id: orderId,
                    items: JSON.parse(JSON.stringify(items)),
                    total: totalPurchase,
                    date: new Date().toISOString(),
                    status: 'ENTREGADO'
                });

                // Vaciar carrito
                co.cart = [];
                break;
            }

            case 'ADD_LEDGER_TX': {
                const deltaNum = Math.round((Number(payload.delta || 0) + Number.EPSILON) * 100) / 100;
                const txId = payload.txId || ('TX-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase());
                co.ledger.unshift({
                    id: txId,
                    tx_id: txId,
                    date: new Date().toLocaleString(),
                    concept: payload.concept || 'Ajuste financiero',
                    dept: payload.dept || 'FINANZAS',
                    delta: deltaNum,
                    timestamp: now
                });
                break;
            }

            case 'UPDATE_MARKETING': {
                co.marketingCampaigns = Array.isArray(co.marketingCampaigns) ? co.marketingCampaigns : [];
                if (payload.campaign) {
                    co.marketingCampaigns.unshift(payload.campaign);
                }
                break;
            }

            case 'SUBMIT_DELIVERABLE': {
                const rawKey = String(payload.key || payload.docKey || payload.docType || '').trim();
                if (!/^[a-zA-Z0-9_-]{1,40}$/.test(rawKey)) {
                    return new Response(JSON.stringify({ error: 'INVALID_DELIVERABLE_KEY' }), { status: 400, headers: CORS_HEADERS });
                }
                const driveUrl = String(payload.driveUrl || payload.url || '').trim();
                if (!GOOGLE_DRIVE_REGEX.test(driveUrl)) {
                    return new Response(JSON.stringify({ 
                        error: 'INVALID_DRIVE_URL', 
                        message: 'Solo se admiten enlaces válidos a recursos de Google Drive.' 
                    }), { 
                        status: 400, 
                        headers: { 'Content-Type': 'application/json' } 
                    });
                }
                co.deliverables = co.deliverables || {};
                co.deliverables[rawKey] = { driveUrl, updatedAt: new Date().toISOString() };
                break;
            }

            case 'SAVE_PROMPTS': {
                co.aiPrompts = Array.isArray(co.aiPrompts) ? co.aiPrompts : [];
                if (payload.prompt) {
                    co.aiPrompts.unshift(payload.prompt);
                }
                break;
            }

            case 'GENERIC_PATCH': {
                const allowed = ['slogan', 'valueProposition', 'cart', 'votingMotions', 'flightTests', 'bom'];
                for (const k of allowed) {
                    if (payload[k] !== undefined) {
                        co[k] = payload[k];
                    }
                }
                break;
            }

            default:
                return new Response(JSON.stringify({ error: 'UNKNOWN_ACTION', action }), { status: 400, headers: CORS_HEADERS });
        }

        // 4. Proyección determinista del saldo (Event-Sourcing)
        co.balance = calculateBalance(co.ledger);
        co.updatedAt = now;
        const newVersion = version + 1;

        // 5. Persistencia atómica en la partición company_state
        await env.MARSKET_DB.prepare(`
            INSERT OR REPLACE INTO company_state (company_id, data, version, updated_at)
            VALUES (?, ?, ?, ?)
        `).bind(cid, JSON.stringify(co), newVersion, now).run();

        // 6. Sincronización transparente con el documento legacy para compatibilidad global
        try {
            await env.MARSKET_DB.prepare(`
                UPDATE state
                SET data = json_set(
                    data,
                    '$.companies.' || ?, json(?),
                    '$.version', ?
                )
                WHERE id = 'current'
            `).bind(cid, JSON.stringify(co), newVersion).run();
        } catch(syncErr) {
            console.warn("[ACTION_SYNC] Fallback en sincronización legacy de state:", syncErr);
        }

        return new Response(JSON.stringify({
            success: true,
            companyId: cid,
            version: newVersion,
            balance: co.balance,
            action,
            updatedAt: now
        }), { status: 200, headers: CORS_HEADERS });

    } catch(err) {
        return new Response(JSON.stringify({ error: 'TRANSACTION_FAILED', message: err.message }), { status: 500, headers: CORS_HEADERS });
    }
}
