// functions/api/moderation/report.js
// Registro silencioso de infracciones léxicas (v1.1.06)
// Captura reportes silenciosos de transgresiones LOPD de forma relacional paginada (Zero-Heap SRE)

export async function onRequest(context) {
    return handleModerationReport(context);
}

export const onRequestPost = onRequest;

async function handleModerationReport(context) {
    const { request, env } = context;

    // Watchdog de Conexiones Muertas
    if (request.signal?.aborted) {
        return new Response(null, { status: 499 });
    }

    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    try {
        if (request.method === 'POST') {
            const payload = await request.json();
            const { team_id, student_alias, offending_text, matched_term, timestamp } = payload;

            const record = {
                id: 'MOD-' + Date.now(),
                team_id: String(team_id || 'UNKNOWN'),
                coId: String(team_id || 'UNKNOWN'),
                student_alias: String(student_alias || 'ESTUDIANTE'),
                role: String(student_alias || 'ESTUDIANTE'),
                offending_text: String(offending_text || ''),
                text: String(offending_text || ''),
                matched_term: String(matched_term || ''),
                word: String(matched_term || ''),
                timestamp: timestamp || new Date().toISOString(),
                date: new Date().toLocaleString(),
                resolved: false
            };

            if (env.MARSKET_DB) {
                // Inserción relacional atómica directa sin tocar ni mutar el mega-JSON de estado
                try {
                    await env.MARSKET_DB.prepare(
                        "CREATE TABLE IF NOT EXISTS moderation_alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, team_id TEXT, student_alias TEXT, offending_text TEXT, matched_term TEXT, timestamp TEXT)"
                    ).run();
                } catch(e) {}

                try {
                    await env.MARSKET_DB.prepare(
                        "INSERT INTO moderation_alerts (team_id, student_alias, offending_text, matched_term, timestamp) VALUES (?, ?, ?, ?, ?)"
                    ).bind(record.team_id, record.student_alias, record.offending_text, record.matched_term, record.timestamp).run();
                } catch(e) {}
            }

            return new Response(JSON.stringify({ ok: true, success: true, record }), { status: 200, headers });
        }

        if (request.method === 'GET') {
            if (env.MARSKET_DB) {
                const url = new URL(request.url);
                const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
                try {
                    const { results } = await env.MARSKET_DB.prepare(
                        "SELECT id, team_id, student_alias, offending_text, matched_term, timestamp FROM moderation_alerts ORDER BY id DESC LIMIT ?"
                    ).bind(limit).all();
                    return new Response(JSON.stringify(results || []), { headers });
                } catch(e) {
                    return new Response(JSON.stringify([]), { headers });
                }
            }
            return new Response(JSON.stringify([]), { headers });
        }

        return new Response('Method Not Allowed', { status: 405, headers });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}
