// functions/api/company/[cid]/action.js
// Endpoint de Mutaciones Atómicas Particionadas para Startups en Cloudflare D1 (v1.1.23)
// Erradica los megadocumentos monolíticos y las colisiones OCC HTTP 409 entre empresas.

import { verifySession } from '../../_auth.js';

const GOOGLE_DRIVE_REGEX = /^https:\/\/(docs|drive)\.google\.com\/(document|spreadsheets|presentation|file|drive\/folders)\/(d\/)?[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_.-]+)*(\?[^"'\s<>]*)?(#[^"'\s<>]*)?$/;

const MARKETING_PACKAGES_SERVER = {
  'MK-SAT': { price: 200, name: 'Pack Satélite', actions: 3 },
  'MK-TRA': { price: 300, name: 'Prensa Tradicional', actions: 3 },
  'MK-HYB': { price: 450, name: 'Despegue Híbrido', actions: 4 },
  'MK-SUP': { price: 750, name: 'Cobertura Supernova', actions: 6 }
};

const CEO_RETURN_REASONS = [
  { id: "ENLACE_INVALIDO", label: "Enlace a Google Drive inexistente o con formato incorrecto" },
  { id: "PERMISOS_BLOQUEADOS", label: "Documento sin permisos de acceso/lectura para el equipo docente" },
  { id: "PLANTILLA_INCORRECTA", label: "No se ha utilizado la plantilla oficial corporativa/curricular" },
  { id: "CHECKLIST_INCOMPLETO", label: "Faltan apartados obligatorios según la guía de la materia" },
  { id: "DISCREPANCIA_DATOS", label: "Discrepancia entre datos de la app y el documento adjunto" },
  { id: "REVISION_PENDIENTE", label: "Requiere subsanación técnica interna antes de elevar a evaluación" }
];
const VALID_RETURN_REASON_IDS = CEO_RETURN_REASONS.map(r => r.id);

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
    const p = (payload.payload && typeof payload.payload === 'object') ? Object.assign({}, payload.payload, payload) : payload;

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
        const TTL_MS = 72 * 60 * 60 * 1000;
        if (Array.isArray(co.coordinatorReports)) {
            co.coordinatorReports = co.coordinatorReports.filter(report => {
                const reportTime = report.createdAt ? new Date(report.createdAt).getTime() : now;
                return (now - reportTime) < TTL_MS;
            });
        }

        // 3. Ejecución de la acción atómica
        switch(action) {
            case 'EXECUTE_PURCHASE': {
                if (p.driveUrl && !GOOGLE_DRIVE_REGEX.test(p.driveUrl)) {
                    return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                }
                const items = Array.isArray(p.items) ? p.items : co.cart;
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
                    driveUrl: p.driveUrl || '',
                    date: new Date().toISOString(),
                    status: 'ENTREGADO'
                });

                // Vaciar carrito
                co.cart = [];
                break;
            }

            case 'RECORD_REAL_SPEND':
            case 'EXECUTE_PHYSICAL_ORDER': {
                if (auth.role !== 'OPERACIONES_IA' && auth.role !== 'OPERACIONES' && !auth.admin && !auth.isCoordinator) {
                    return new Response(JSON.stringify({ 
                        error: 'FORBIDDEN_ROLE', 
                        message: 'Acceso restringido: Solo Operaciones/Operario o Administrador puede registrar compras físicas reales.' 
                    }), { status: 403, headers: CORS_HEADERS });
                }
                if (Array.isArray(p.realCosts)) {
                    for (const rc of p.realCosts) {
                        if (rc.ticketUrl && !GOOGLE_DRIVE_REGEX.test(rc.ticketUrl)) {
                            return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                        }
                    }
                    co.realCosts = Array.isArray(co.realCosts) ? co.realCosts : [];
                    co.realCosts.push(...p.realCosts);
                }
                if (p.orderId) {
                    const ord = (co.orders || []).find(o => String(o.id) === String(p.orderId));
                    if (ord) {
                        ord.status = 'EJECUTADO';
                    }
                }
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
                if (p.driveUrl && !GOOGLE_DRIVE_REGEX.test(p.driveUrl)) {
                    return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                }
                if (p.campaign) {
                    if (!p.campaign.driveUrl || !GOOGLE_DRIVE_REGEX.test(p.campaign.driveUrl)) {
                        return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL', message: 'URL de Google Drive obligatoria para campaña de marketing.' }), { status: 400, headers: CORS_HEADERS });
                    }
                    const sPkg = MARKETING_PACKAGES_SERVER[p.campaign.packageId];
                    if (sPkg) {
                        p.campaign.price = sPkg.price;
                        p.campaign.totalActions = sPkg.actions;
                    }
                    co.marketingCampaigns.unshift(p.campaign);
                }
                if (p.actionItem) {
                    const actUrl = p.actionItem.url || p.actionItem.driveUrl;
                    if (!actUrl || !GOOGLE_DRIVE_REGEX.test(actUrl)) {
                        return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL', message: 'URL de Google Drive obligatoria para la acción de marketing.' }), { status: 400, headers: CORS_HEADERS });
                    }
                    if (p.campaignId) {
                        const camp = co.marketingCampaigns.find(c => String(c.id) === String(p.campaignId));
                        if (camp) {
                            camp.executedActions = Array.isArray(camp.executedActions) ? camp.executedActions : [];
                            camp.executedActions.push(p.actionItem);
                        }
                    }
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
                const isCEO = auth.role === 'CEO' || auth.isCoordinator;
                let status = isCEO ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO';
                let returnReasonId = null;
                let returnReason = null;

                if (rawKey === 'hoja_taller_fyq') {
                    const reqStatus = String(payload.status || p.status || '').trim();
                    const validWorkshopStatuses = ['DRAFT_TECNICO', 'EN_TALLER_OPERARIO', 'DEVUELTO_A_TECNICO', 'SUBMITTED_TO_CEO', 'DELIVERED_TO_TEACHER'];
                    if (validWorkshopStatuses.includes(reqStatus)) {
                        status = reqStatus;
                    } else if (isCEO) {
                        status = 'DELIVERED_TO_TEACHER';
                    } else {
                        status = 'EN_TALLER_OPERARIO';
                    }
                    returnReasonId = payload.returnReasonId || p.returnReasonId || null;
                    returnReason = payload.returnReason || p.returnReason || null;
                }

                co.deliverables[rawKey] = { 
                    driveUrl, 
                    status,
                    returnReasonId,
                    returnReason,
                    updatedAt: new Date().toISOString() 
                };
                break;
            }

            case 'CEO_REVIEW_DELIVERABLE': {
                if (auth.role !== 'CEO' && !auth.isCoordinator) {
                    return new Response(JSON.stringify({ error: 'UNAUTHORIZED_ROLE', message: 'Solo el CEO o Coordinación puede supervisar entregables.' }), { status: 403, headers: CORS_HEADERS });
                }
                const rawKey = String(payload.key || payload.docKey || payload.docType || '').trim();
                if (!/^[a-zA-Z0-9_-]{1,40}$/.test(rawKey)) {
                    return new Response(JSON.stringify({ error: 'INVALID_DELIVERABLE_KEY' }), { status: 400, headers: CORS_HEADERS });
                }
                co.deliverables = co.deliverables || {};
                const currentDoc = co.deliverables[rawKey];
                if (!currentDoc) {
                    return new Response(JSON.stringify({ error: 'DELIVERABLE_NOT_FOUND' }), { status: 404, headers: CORS_HEADERS });
                }

                const subAction = String(p.action || '').toUpperCase();
                if (subAction === 'APPROVE') {
                    if (typeof currentDoc === 'string') {
                        co.deliverables[rawKey] = { driveUrl: currentDoc, status: 'DELIVERED_TO_TEACHER', updatedAt: new Date().toISOString() };
                    } else {
                        currentDoc.status = 'DELIVERED_TO_TEACHER';
                        delete currentDoc.returnReasonId;
                        delete currentDoc.returnReason;
                        currentDoc.updatedAt = new Date().toISOString();
                    }
                } else if (subAction === 'RETURN') {
                    const reasonId = String(p.reasonId || '').trim();
                    if (!VALID_RETURN_REASON_IDS.includes(reasonId)) {
                        return new Response(JSON.stringify({ error: 'INVALID_RETURN_REASON_ID', allowed: VALID_RETURN_REASON_IDS }), { status: 400, headers: CORS_HEADERS });
                    }
                    const reasonObj = CEO_RETURN_REASONS.find(r => r.id === reasonId);
                    const reasonText = reasonObj ? reasonObj.label : reasonId;
                    if (typeof currentDoc === 'string') {
                        co.deliverables[rawKey] = { driveUrl: currentDoc, status: 'CEO_REVISION', returnReasonId: reasonId, returnReason: reasonText, updatedAt: new Date().toISOString() };
                    } else {
                        currentDoc.status = 'CEO_REVISION';
                        currentDoc.returnReasonId = reasonId;
                        currentDoc.returnReason = reasonText;
                        currentDoc.updatedAt = new Date().toISOString();
                    }
                } else {
                    return new Response(JSON.stringify({ error: 'INVALID_REVIEW_ACTION' }), { status: 400, headers: CORS_HEADERS });
                }
                break;
            }

            case 'COORDINATOR_DECIDE_BRAND': {
                if (!auth.isCoordinator && !auth.admin) {
                    return new Response(JSON.stringify({ error: 'UNAUTHORIZED_ROLE', message: 'Solo Coordinación puede validar marcas.' }), { status: 403, headers: CORS_HEADERS });
                }
                const approved = Boolean(p.approved);
                if (approved) {
                    co.slogan = co.pendingSlogan || co.brandApproval?.pendingSlogan || co.slogan || '';
                    co.mission = co.pendingMission || co.valueProposition || co.mission || '';
                    co.valueProposition = co.mission;
                    delete co.pendingSlogan;
                    delete co.pendingMission;
                    delete co.brandStatus;
                    if (co.brandApproval) {
                        co.brandApproval.status = 'APROBADO';
                        delete co.brandApproval.pendingSlogan;
                    }
                } else {
                    delete co.pendingSlogan;
                    delete co.pendingMission;
                    co.brandStatus = 'REJECTED';
                    if (co.brandApproval) {
                        co.brandApproval.status = 'RECHAZADO';
                        delete co.brandApproval.pendingSlogan;
                        co.brandApproval.feedback = 'Propuesta de marca rechazada por Coordinación.';
                    }
                }
                break;
            }

            case 'VOTE_MOTION': {
                const motionId = String(p.id || p.motionId || '').trim();
                const voteValue = String(p.vote || '').trim();
                const validVotes = ['A_FAVOR', 'EN_CONTRA', 'NO_ESTOY_SEGURO'];
                if (!validVotes.includes(voteValue)) {
                    return new Response(JSON.stringify({ error: 'INVALID_VOTE_VALUE', allowed: validVotes }), { status: 400, headers: CORS_HEADERS });
                }
                co.votingMotions = Array.isArray(co.votingMotions) ? co.votingMotions : [];
                const m = co.votingMotions.find(x => x.id === motionId);
                if (m) {
                    m.votes = m.votes || {};
                    m.votes[auth.role || 'ESTUDIANTE'] = voteValue;
                }
                break;
            }

            case 'SAVE_PROMPTS': {
                co.aiPrompts = Array.isArray(co.aiPrompts) ? co.aiPrompts : [];
                if (p.prompt) {
                    const bitUrl = p.prompt.bitacoraUrl || p.prompt.driveUrl || '';
                    if (bitUrl && !GOOGLE_DRIVE_REGEX.test(bitUrl)) {
                        return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                    }
                    co.aiPrompts.unshift(p.prompt);
                }
                break;
            }

            case 'SUBMIT_MOTION': {
                co.votingMotions = Array.isArray(co.votingMotions) ? co.votingMotions : [];
                if (p.motion) {
                    if (p.motion.driveUrl && !GOOGLE_DRIVE_REGEX.test(p.motion.driveUrl)) {
                        return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                    }
                    co.votingMotions.unshift(p.motion);
                }
                break;
            }

            case 'SUBMIT_COORDINATOR_REPORT': {
                const driveUrl = String(p.driveUrl || p.url || '').trim();
                if (driveUrl && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
                    return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL', message: 'Solo se admiten enlaces válidos a recursos de Google Drive.' }), { status: 400, headers: CORS_HEADERS });
                }
                const newReport = {
                    id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : ('REP-' + now + '-' + Math.random().toString(36).substr(2, 6)),
                    fromRole: String(p.fromRole || auth.role || 'UNKNOWN'),
                    driveUrl: driveUrl,
                    createdAt: new Date().toISOString()
                };
                co.coordinatorReports = Array.isArray(co.coordinatorReports) ? co.coordinatorReports : [];
                co.coordinatorReports.unshift(newReport);
                break;
            }

            case 'GENERIC_PATCH': {
                const allowed = ['slogan', 'valueProposition', 'cart', 'votingMotions', 'flightTests', 'bom', 'brandApproval', 'pendingSlogan', 'pendingMission', 'brandStatus'];
                for (const k of allowed) {
                    if (p[k] !== undefined) {
                        if (k === 'votingMotions' && Array.isArray(p[k])) {
                            for (const m of p[k]) {
                                if (m && m.driveUrl && !GOOGLE_DRIVE_REGEX.test(m.driveUrl)) {
                                    return new Response(JSON.stringify({ error: 'INVALID_DRIVE_URL' }), { status: 400, headers: CORS_HEADERS });
                                }
                            }
                        }
                        co[k] = p[k];
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
