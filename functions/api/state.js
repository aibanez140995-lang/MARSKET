// functions/api/state.js

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
        const bodyText = await context.request.text();
        let incomingData;
        
        try {
            incomingData = JSON.parse(bodyText);
        } catch (parseErr) {
            return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // M-01: Control de concurrencia optimista (Optimistic Locking)
        const currentRow = await context.env.DB.prepare(
            "SELECT data FROM app_state WHERE id = 'master'"
        ).first();

        let nextVersion = 1;

        if (currentRow && currentRow.data) {
            try {
                const serverData = JSON.parse(currentRow.data);
                const serverVersion = Number(serverData.version) || 1;
                const clientVersion = Number(incomingData.version) || 1;

                // Si el servidor tiene una versión superior y no es un guardado forzado post-fusión, devolver 409 Conflict
                if (clientVersion < serverVersion && !incomingData._resolvedConflict) {
                    return new Response(JSON.stringify({ 
                        error: "Version conflict detected", 
                        serverVersion 
                    }), {
                        status: 409,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                nextVersion = Math.max(serverVersion, clientVersion) + 1;
            } catch (e) {
                nextVersion = (Number(incomingData.version) || 1) + 1;
            }
        }

        // Limpiar flag temporal y sellar nueva versión maestra
        delete incomingData._resolvedConflict;
        incomingData.version = nextVersion;

        const finalPayload = JSON.stringify(incomingData);

        await context.env.DB.prepare(
            "INSERT INTO app_state (id, data, updated_at) VALUES ('master', ?1, CURRENT_TIMESTAMP) " +
            "ON CONFLICT(id) DO UPDATE SET data = ?1, updated_at = CURRENT_TIMESTAMP"
        ).bind(finalPayload).run();

        return new Response(JSON.stringify({ 
            success: true, 
            version: nextVersion, 
            timestamp: Date.now() 
        }), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}