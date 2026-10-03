// functions/api/state.js
export async function onRequestGet(context) {
    try {
        const data = await context.env.MARSKET_KV.get("marsket_master_data");
        if (!data) {
            return new Response(JSON.stringify({ status: "empty" }), {
                headers: { "Content-Type": "application/json" }
            });
        }
        return new Response(data, {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.text();
        // Guarda los datos en Cloudflare KV con la clave principal
        await context.env.MARSKET_KV.put("marsket_master_data", body);
        return new Response(JSON.stringify({ success: true, timestamp: Date.now() }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}