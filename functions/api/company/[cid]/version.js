// functions/api/company/[cid]/version.js
// Endpoint de Sondeo Reactivo Ultra-Ligero para Startups en Cloudflare D1 (v1.1.11)
// Permite sondeo cada 3 segundos con 0 bytes de transferencia mediante HTTP 304 Not Modified.

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Marsket-Auth, If-None-Match'
};

export async function onRequestOptions() {
    return new Response(null, { headers: CORS_HEADERS });
}

export const onRequestHead = onRequestGet;

export async function onRequestGet(context) {
    const { request, env, params } = context;
    const cid = String(params?.cid || '').trim();

    if (!cid) {
        return new Response(JSON.stringify({ error: 'MISSING_COMPANY_ID' }), { status: 400, headers: CORS_HEADERS });
    }

    if (!env?.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'DATABASE_UNAVAILABLE' }), { status: 500, headers: CORS_HEADERS });
    }

    try {
        let version = 1;
        let updatedAt = 0;

        // 1. Intentar consulta ultrarrápida a la tabla particionada indexada
        const row = await env.MARSKET_DB.prepare(
            "SELECT version, updated_at FROM company_state WHERE company_id = ?"
        ).bind(cid).first().catch(() => null);

        if (row && row.version !== null && row.version !== undefined) {
            version = Number(row.version) || 1;
            updatedAt = Number(row.updated_at) || 0;
        } else {
            // Fallback sobre la tabla state monolítica existente
            const stateRow = await env.MARSKET_DB.prepare(`
                SELECT 
                    json_extract(data, '$.version') as v,
                    json_extract(data, '$.companies.' || ? || '.updatedAt') as u
                FROM state WHERE id = 'current'
            `).bind(cid).first().catch(() => null);

            if (stateRow) {
                version = Number(stateRow.v) || 1;
                updatedAt = Number(stateRow.u) || 0;
            }
        }

        let configUpdatedAt = 0;
        const configRow = await env.MARSKET_DB.prepare(
            "SELECT json_extract(data, '$.config.updatedAt') as cu FROM state WHERE id = 'current'"
        ).first().catch(() => null);
        if (configRow && configRow.cu) {
            configUpdatedAt = Number(configRow.cu) || 0;
        }

        const serverETag = `W/"co-${cid}-${version}-${updatedAt}-${configUpdatedAt}"`;
        const clientETag = request.headers.get('If-None-Match');

        // Respuesta HTTP 304 Not Modified (0 bytes transferidos)
        if (clientETag && clientETag === serverETag) {
            return new Response(null, {
                status: 304,
                headers: {
                    ...CORS_HEADERS,
                    'ETag': serverETag,
                    'Cache-Control': 'public, no-cache'
                }
            });
        }

        if (request.method === 'HEAD') {
            return new Response(null, {
                status: 200,
                headers: {
                    ...CORS_HEADERS,
                    'ETag': serverETag,
                    'Cache-Control': 'public, no-cache'
                }
            });
        }

        return new Response(JSON.stringify({
            companyId: cid,
            version,
            updatedAt,
            configUpdatedAt,
            etag: serverETag
        }), {
            status: 200,
            headers: {
                ...CORS_HEADERS,
                'ETag': serverETag,
                'Cache-Control': 'public, no-cache'
            }
        });

    } catch(err) {
        return new Response(JSON.stringify({ error: 'QUERY_FAILED', message: err.message }), { status: 500, headers: CORS_HEADERS });
    }
}
