// functions/api/catalog/[id].js
// Control de Concurrencia Optimista Estricto en Catálogo Cloudflare D1 (v1.1.02)

export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const targetId = (params && params.id) || null;
  
  const body = await request.json();
  const id = targetId || body.id;
  const clientVersion = body.version;

  if (typeof clientVersion !== 'number') {
    return new Response(JSON.stringify({ error: 'Falta parámetro version' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
  if (!row) return new Response(JSON.stringify({ error: 'State not found' }), { 
    status: 404, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
  const currentState = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

  // CONTROL DE CONCURRENCIA ESTRICTO
  if (currentState.version !== clientVersion) {
    return new Response(JSON.stringify({ 
      error: 'CONFLICT', 
      serverVersion: currentState.version 
    }), { 
      status: 409, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    }); // Rechaza la sobreescritura ciega
  }

  const itemIndex = currentState.catalog.findIndex(i => String(i.id) === String(id));
  if (itemIndex === -1) {
    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const changes = body.changes || {};
  if (body.price !== undefined && changes.price === undefined) changes.price = body.price;
  if (body.stock !== undefined && changes.stock === undefined) changes.stock = body.stock;
  if (body.name !== undefined && changes.name === undefined) changes.name = body.name;

  currentState.catalog[itemIndex] = { ...currentState.catalog[itemIndex], ...changes };
  currentState.version += 1;
  currentState.lastUpdated = Date.now();

  await env.MARSKET_DB.prepare(
    "UPDATE state SET data = json(?), updated_at = CURRENT_TIMESTAMP WHERE id = 'current'"
  ).bind(JSON.stringify(currentState)).run();

  return new Response(JSON.stringify({ success: true, version: currentState.version, item: currentState.catalog[itemIndex] }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const targetId = (params && params.id) || null;
  
  let body = {};
  try {
    body = await request.json();
  } catch(e) {}

  const url = new URL(request.url);
  const id = targetId || body.id || url.searchParams.get('id');
  const clientVersion = typeof body.version === 'number' ? body.version : (url.searchParams.get('version') ? Number(url.searchParams.get('version')) : null);

  if (typeof clientVersion !== 'number' || isNaN(clientVersion)) {
    return new Response(JSON.stringify({ error: 'Falta parámetro version' }), { 
      status: 400, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
  if (!row) return new Response(JSON.stringify({ error: 'State not found' }), { 
    status: 404, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
  const currentState = typeof row.data === 'string' ? JSON.parse(row.data) : row.data;

  // CONTROL DE CONCURRENCIA ESTRICTO
  if (currentState.version !== clientVersion) {
    return new Response(JSON.stringify({ 
      error: 'CONFLICT', 
      serverVersion: currentState.version 
    }), { 
      status: 409, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    }); // Rechaza la sobreescritura ciega
  }

  const itemIndex = currentState.catalog.findIndex(i => String(i.id) === String(id));
  if (itemIndex === -1) {
    return new Response(JSON.stringify({ error: 'Not found' }), { 
      status: 404, 
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    });
  }

  const deleted = currentState.catalog.splice(itemIndex, 1)[0];
  currentState.version += 1;
  currentState.lastUpdated = Date.now();

  await env.MARSKET_DB.prepare(
    "UPDATE state SET data = json(?), updated_at = CURRENT_TIMESTAMP WHERE id = 'current'"
  ).bind(JSON.stringify(currentState)).run();

  return new Response(JSON.stringify({ success: true, deleted, version: currentState.version }), { 
    status: 200, 
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  if (context.request.method === 'PATCH') return onRequestPatch(context);
  if (context.request.method === 'DELETE') return onRequestDelete(context);
  return new Response('Method Not Allowed', { status: 405 });
}
