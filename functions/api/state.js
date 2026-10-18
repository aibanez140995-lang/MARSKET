// functions/api/state.js

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    
    // Configurar CORS
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') return new Response(null, { headers });

    // Verificamos que el binding D1 (MARSKET_DB) esté mapeado
    if (!env.MARSKET_DB) {
        return new Response(JSON.stringify({ error: 'Binding de Cloudflare D1 (MARSKET_DB) no encontrado en el entorno.' }), { status: 500, headers });
    }

    try {
        if (request.method === 'GET') {
            const action = url.searchParams.get('action');
            
            // FASE 5: Descarga de un backup específico si se solicita
            if (action === 'get_backup') {
                const type = url.searchParams.get('type') || 'backup_daily';
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = ?").bind(type).all();
                if (results && results.length > 0) return new Response(results[0].data, { headers });
                return new Response(JSON.stringify({ status: 'empty' }), { headers });
            }

            // Lectura normal del estado en vivo
            const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
            if (results && results.length > 0) return new Response(results[0].data, { headers });
            
            return new Response(JSON.stringify({ status: 'empty' }), { headers });
        }

        if (request.method === 'POST') {
            const payload = await request.json();
            
            // FASE 5: Acción manual de backup interceptada desde el Panel Docente
            if (payload.action === 'force_backup') {
                const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
                if (results && results.length > 0) {
                    const currentData = results[0].data;
                    const dateTag = new Date().toISOString().split('T')[0];
                    
                    // Backup Diario: Sobreescribe siempre la fila 'backup_daily'
                    await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind('backup_daily', currentData).run();
                    
                    // Backup Semanal: Crea una fila inmutable con la fecha actual
                    if (payload.type === 'weekly') {
                        await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind(`backup_weekly_${dateTag}`, currentData).run();
                    }
                    return new Response(JSON.stringify({ success: true, message: 'Backup D1 completado de forma nativa' }), { headers });
                }
                return new Response(JSON.stringify({ error: 'No hay datos en estado corriente para respaldar' }), { status: 400, headers });
            }

            // Flujo normal: Control optimista de concurrencia basado en payload.version
            const { results: versionCheck } = await env.MARSKET_DB.prepare("SELECT json_extract(data, '$.version') as v FROM state WHERE id = 'current'").all();
            const serverVersion = (versionCheck && versionCheck.length > 0) ? Number(versionCheck[0].v) : 0;
            const incomingVersion = Number(payload.version) || 0;

            if (serverVersion > 0 && incomingVersion <= serverVersion && incomingVersion !== 0) {
                return new Response(JSON.stringify({ error: 'Conflict: Server has a newer version', serverVersion }), { status: 409, headers });
            }

            // Forzar actualización de versión si todo va bien
            payload.version = serverVersion + 1;
            const dataString = JSON.stringify(payload);
            
            // FASE 5: Resiliencia - Auto-Backup del estado inmediatamente anterior antes de sobreescribir
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) SELECT 'backup_previous', data FROM state WHERE id = 'current'").run();
            
            // Escritura atómica en D1
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(dataString).run();
            
            return new Response(JSON.stringify({ success: true, version: payload.version }), { headers });
        }
        
        return new Response('Method Not Allowed', { status: 405, headers });
        
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
    }
}