// functions/api/moderation/report.js
// Registro silencioso de infracciones léxicas (v1.1.02)
// Captura reportes silenciosos de transgresiones LOPD y lenguaje inapropiado para seguimiento pedagógico

export async function onRequest(context) {
    return handleModerationReport(context);
}

export const onRequestPost = onRequest;

async function handleModerationReport(context) {
    const { request, env } = context;
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
                // 1. Inserción opcional en tabla relacional si está provista en D1
                try {
                    await env.MARSKET_DB.prepare(
                        "INSERT INTO moderation_alerts (team_id, student_alias, offending_text, timestamp) VALUES (?, ?, ?, ?)"
                    ).bind(record.team_id, record.student_alias, record.offending_text, record.timestamp).run();
                } catch(e) {}

                // 2. Persistencia en documento de estado 'current' para visibilidad reactiva inmediata
                try {
                    const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                    if (results && results.length > 0) {
                        const cur = JSON.parse(results[0].data);
                        cur.securityIncidents = Array.isArray(cur.securityIncidents) ? cur.securityIncidents : [];
                        cur.securityIncidents.unshift(record);
                        if (cur.securityIncidents.length > 200) cur.securityIncidents.pop();
                        cur.lastUpdated = Date.now();
                        await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(JSON.stringify(cur)).run();
                    }
                } catch(e) {}
            }

            return new Response(JSON.stringify({ ok: true, success: true, record }), { status: 200, headers });
        }

        if (request.method === 'GET') {
            if (env.MARSKET_DB) {
                try {
                    const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                    if (results && results.length > 0) {
                        const cur = JSON.parse(results[0].data);
                        return new Response(JSON.stringify(cur.securityIncidents || []), { headers });
                    }
                } catch(e) {}
            }
            return new Response(JSON.stringify([]), { headers });
        }

        return new Response('Method Not Allowed', { status: 405, headers });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}
