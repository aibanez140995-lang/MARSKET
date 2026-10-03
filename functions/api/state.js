export async function onRequestGet(context) {
    try {
        const row = await context.env.DB.prepare(
            "SELECT data FROM app_state WHERE id = 'master'"
        ).first();

        if (!row || !row.data) {
            return new Response(JSON.stringify({ status: "empty" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response(row.data, {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.text();
        
        await context.env.DB.prepare(
            "INSERT INTO app_state (id, data, updated_at) VALUES ('master', ?1, CURRENT_TIMESTAMP) " +
            "ON CONFLICT(id) DO UPDATE SET data = ?1, updated_at = CURRENT_TIMESTAMP"
        ).bind(body).run();

        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}