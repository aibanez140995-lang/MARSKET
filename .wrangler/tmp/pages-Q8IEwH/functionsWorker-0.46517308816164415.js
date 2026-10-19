var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// api/admin/reset.js
async function onRequest(context) {
  return handleReset(context);
}
__name(onRequest, "onRequest");
var onRequestPost = onRequest;
async function handleReset(context) {
  const { request, env } = context;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (request.method === "OPTIONS") {
    return new Response(null, { headers });
  }
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { status: 405, headers });
  }
  let authHeader = request.headers.get("Authorization") || "";
  let token = authHeader.replace(/^Bearer\s+/i, "").trim();
  let payload = {};
  try {
    payload = await request.json();
  } catch (e) {
  }
  if (!token && payload.token) token = payload.token;
  let isAuthorized = false;
  if (env.TEACHER_MASTER_CODE) {
    if (token === env.TEACHER_MASTER_CODE || payload.code === env.TEACHER_MASTER_CODE) {
      isAuthorized = true;
    }
  } else {
    if (token && token.length > 3) isAuthorized = true;
    else if (payload.role && String(payload.role).toLowerCase().includes("coord")) isAuthorized = true;
    else if (payload.code) isAuthorized = true;
  }
  if (!isAuthorized) {
    return new Response(JSON.stringify({ error: "Autorizaci\xF3n denegada: Se requiere token de coordinador." }), { status: 403, headers });
  }
  if (!env.MARSKET_DB) {
    return new Response(JSON.stringify({ error: "Binding de Cloudflare D1 (MARSKET_DB) no encontrado en el entorno." }), { status: 500, headers });
  }
  try {
    try {
      await env.MARSKET_DB.batch([
        env.MARSKET_DB.prepare("DELETE FROM orders;"),
        env.MARSKET_DB.prepare("DELETE FROM queries;"),
        env.MARSKET_DB.prepare("DELETE FROM coordinator_inbox;"),
        env.MARSKET_DB.prepare("DELETE FROM suggestions;"),
        env.MARSKET_DB.prepare("DELETE FROM moderation_alerts;"),
        env.MARSKET_DB.prepare("UPDATE teams SET balance = 1000.00, inventory = '{}';"),
        env.MARSKET_DB.prepare("UPDATE supermarsket_catalog SET price = default_price, stock = default_stock;")
      ]);
    } catch (tableErr) {
    }
    const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
    let currentState = {};
    if (results && results.length > 0) {
      try {
        currentState = JSON.parse(results[0].data);
      } catch (e) {
      }
    }
    if (currentState.companies) {
      for (const cid in currentState.companies) {
        const co = currentState.companies[cid];
        co.balance = 1e3;
        co.orders = [];
        co.ledger = [];
        co.cart = [];
        co.bom = [];
        co.realCosts = [];
        co.flightTests = [];
        co.marketingCampaigns = [];
        co.inactivityReports = [];
        co.sanctions = [];
        co.crisisAlerts = [];
        co.notifications = [];
        co.logo = null;
        co.slogan = "";
        co.valueProposition = "";
        co.brandApproval = { status: "APROBADO", pendingLogo: null, pendingSlogan: "", feedback: "" };
      }
    }
    currentState.suggestionsToAlex = [];
    currentState.pendingCustom = [];
    currentState.b2bMarket = [];
    currentState.b2bContracts = [];
    currentState.securityIncidents = [];
    currentState.moderationAlerts = [];
    if (Array.isArray(currentState.catalog)) {
      currentState.catalog.forEach((item) => {
        if (item.default_price !== void 0) item.price = item.default_price;
        if (item.default_stock !== void 0) item.stock = item.default_stock;
      });
    }
    currentState.version = (Number(currentState.version) || 1) + 1;
    currentState.resetEpoch = Date.now();
    currentState.lastUpdated = Date.now();
    await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(JSON.stringify(currentState)).run();
    return new Response(JSON.stringify({
      success: true,
      version: currentState.version,
      resetEpoch: currentState.resetEpoch,
      message: "Protocolo de Reset Global Transaccional completado en Cloudflare D1."
    }), { status: 200, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
__name(handleReset, "handleReset");

// api/catalog/[id].js
async function onRequestPatch(context) {
  const { request, env, params } = context;
  const targetId = params && params.id || null;
  const body = await request.json();
  const id = targetId || body.id;
  const clientVersion = body.version;
  if (typeof clientVersion !== "number") {
    return new Response(JSON.stringify({ error: "Falta par\xE1metro version" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
  if (!row) return new Response(JSON.stringify({ error: "State not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
  const currentState = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  if (currentState.version !== clientVersion) {
    return new Response(JSON.stringify({
      error: "CONFLICT",
      serverVersion: currentState.version
    }), {
      status: 409,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const itemIndex = currentState.catalog.findIndex((i) => String(i.id) === String(id));
  if (itemIndex === -1) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const changes = body.changes || {};
  if (body.price !== void 0 && changes.price === void 0) changes.price = body.price;
  if (body.stock !== void 0 && changes.stock === void 0) changes.stock = body.stock;
  if (body.name !== void 0 && changes.name === void 0) changes.name = body.name;
  currentState.catalog[itemIndex] = { ...currentState.catalog[itemIndex], ...changes };
  currentState.version += 1;
  currentState.lastUpdated = Date.now();
  await env.MARSKET_DB.prepare(
    "UPDATE state SET data = json(?), updated_at = CURRENT_TIMESTAMP WHERE id = 'current'"
  ).bind(JSON.stringify(currentState)).run();
  return new Response(JSON.stringify({ success: true, version: currentState.version, item: currentState.catalog[itemIndex] }), {
    status: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
__name(onRequestPatch, "onRequestPatch");
async function onRequestDelete(context) {
  const { request, env, params } = context;
  const targetId = params && params.id || null;
  let body = {};
  try {
    body = await request.json();
  } catch (e) {
  }
  const url = new URL(request.url);
  const id = targetId || body.id || url.searchParams.get("id");
  const clientVersion = typeof body.version === "number" ? body.version : url.searchParams.get("version") ? Number(url.searchParams.get("version")) : null;
  if (typeof clientVersion !== "number" || isNaN(clientVersion)) {
    return new Response(JSON.stringify({ error: "Falta par\xE1metro version" }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const row = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").first();
  if (!row) return new Response(JSON.stringify({ error: "State not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
  const currentState = typeof row.data === "string" ? JSON.parse(row.data) : row.data;
  if (currentState.version !== clientVersion) {
    return new Response(JSON.stringify({
      error: "CONFLICT",
      serverVersion: currentState.version
    }), {
      status: 409,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
  const itemIndex = currentState.catalog.findIndex((i) => String(i.id) === String(id));
  if (itemIndex === -1) {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
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
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
  });
}
__name(onRequestDelete, "onRequestDelete");
async function onRequest2(context) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      }
    });
  }
  if (context.request.method === "PATCH") return onRequestPatch(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return new Response("Method Not Allowed", { status: 405 });
}
__name(onRequest2, "onRequest");

// api/catalog/update.js
var onRequestPost2 = onRequestPatch;
async function onRequest3(context) {
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return onRequestPatch(context);
}
__name(onRequest3, "onRequest");

// api/moderation/report.js
async function onRequest4(context) {
  return handleModerationReport(context);
}
__name(onRequest4, "onRequest");
var onRequestPost3 = onRequest4;
async function handleModerationReport(context) {
  const { request, env } = context;
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") return new Response(null, { headers });
  try {
    if (request.method === "POST") {
      const payload = await request.json();
      const { team_id, student_alias, offending_text, matched_term, timestamp } = payload;
      const record = {
        id: "MOD-" + Date.now(),
        team_id: String(team_id || "UNKNOWN"),
        coId: String(team_id || "UNKNOWN"),
        student_alias: String(student_alias || "ESTUDIANTE"),
        role: String(student_alias || "ESTUDIANTE"),
        offending_text: String(offending_text || ""),
        text: String(offending_text || ""),
        matched_term: String(matched_term || ""),
        word: String(matched_term || ""),
        timestamp: timestamp || (/* @__PURE__ */ new Date()).toISOString(),
        date: (/* @__PURE__ */ new Date()).toLocaleString(),
        resolved: false
      };
      if (env.MARSKET_DB) {
        try {
          await env.MARSKET_DB.prepare(
            "INSERT INTO moderation_alerts (team_id, student_alias, offending_text, timestamp) VALUES (?, ?, ?, ?)"
          ).bind(record.team_id, record.student_alias, record.offending_text, record.timestamp).run();
        } catch (e) {
        }
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
        } catch (e) {
        }
      }
      return new Response(JSON.stringify({ ok: true, success: true, record }), { status: 200, headers });
    }
    if (request.method === "GET") {
      if (env.MARSKET_DB) {
        try {
          const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
          if (results && results.length > 0) {
            const cur = JSON.parse(results[0].data);
            return new Response(JSON.stringify(cur.securityIncidents || []), { headers });
          }
        } catch (e) {
        }
      }
      return new Response(JSON.stringify([]), { headers });
    }
    return new Response("Method Not Allowed", { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
__name(handleModerationReport, "handleModerationReport");

// api/state.js
async function onRequest5(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };
  if (request.method === "OPTIONS") return new Response(null, { headers });
  if (!env.MARSKET_DB) {
    return new Response(JSON.stringify({ error: "Binding de Cloudflare D1 (MARSKET_DB) no encontrado en el entorno." }), { status: 500, headers });
  }
  try {
    if (request.method === "GET") {
      const action = url.searchParams.get("action");
      if (action === "get_backup") {
        const type = url.searchParams.get("type") || "backup_daily";
        const { results: results2 } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = ?").bind(type).all();
        if (results2 && results2.length > 0) return new Response(results2[0].data, { headers });
        return new Response(JSON.stringify({ status: "empty" }), { headers });
      }
      const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
      if (results && results.length > 0) return new Response(results[0].data, { headers });
      return new Response(JSON.stringify({ status: "empty" }), { headers });
    }
    if (request.method === "POST") {
      const payload = await request.json();
      if (payload.action === "verify_teacher_master") {
        if (!env.TEACHER_MASTER_CODE) {
          return new Response(JSON.stringify({ verified: true, mode: "client_sha256" }), { headers });
        }
        const isAuthorized = String(payload.code || "") === String(env.TEACHER_MASTER_CODE);
        return new Response(JSON.stringify({ verified: isAuthorized }), { status: isAuthorized ? 200 : 403, headers });
      }
      if (payload.action === "force_backup") {
        if (env.TEACHER_MASTER_CODE && payload.teacherMasterCode && payload.teacherMasterCode !== env.TEACHER_MASTER_CODE) {
          return new Response(JSON.stringify({ error: "Autorizaci\xF3n maestra docente inv\xE1lida" }), { status: 403, headers });
        }
        const { results } = await env.MARSKET_DB.prepare("SELECT data FROM state WHERE id = 'current'").all();
        if (results && results.length > 0) {
          const currentData = results[0].data;
          const dateTag = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind("backup_daily", currentData).run();
          if (payload.type === "weekly") {
            await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES (?, ?)").bind(`backup_weekly_${dateTag}`, currentData).run();
          }
          return new Response(JSON.stringify({ success: true, message: "Backup D1 completado de forma nativa" }), { headers });
        }
        return new Response(JSON.stringify({ error: "No hay datos en estado corriente para respaldar" }), { status: 400, headers });
      }
      const { results: versionCheck } = await env.MARSKET_DB.prepare("SELECT json_extract(data, '$.version') as v FROM state WHERE id = 'current'").all();
      const serverVersion = versionCheck && versionCheck.length > 0 ? Number(versionCheck[0].v) : 0;
      const incomingVersion = Number(payload.version) || 0;
      if (serverVersion > 0 && incomingVersion <= serverVersion && incomingVersion !== 0) {
        return new Response(JSON.stringify({ error: "Conflict: Server has a newer version", serverVersion, changes: 0 }), { status: 409, headers });
      }
      payload.version = serverVersion + 1;
      const dataString = JSON.stringify(payload);
      await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) SELECT 'backup_previous', data FROM state WHERE id = 'current'").run();
      await env.MARSKET_DB.prepare("INSERT OR REPLACE INTO state (id, data) VALUES ('current', ?)").bind(dataString).run();
      return new Response(JSON.stringify({ success: true, version: payload.version }), { headers });
    }
    return new Response("Method Not Allowed", { status: 405, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers });
  }
}
__name(onRequest5, "onRequest");

// ../.wrangler/tmp/pages-Q8IEwH/functionsRoutes-0.8172350642286857.mjs
var routes = [
  {
    routePath: "/api/admin/reset",
    mountPath: "/api/admin",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/catalog/update",
    mountPath: "/api/catalog",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/catalog/update",
    mountPath: "/api/catalog",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/catalog/update",
    mountPath: "/api/catalog",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/api/moderation/report",
    mountPath: "/api/moderation",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost3]
  },
  {
    routePath: "/api/admin/reset",
    mountPath: "/api/admin",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/api/catalog/update",
    mountPath: "/api/catalog",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/api/moderation/report",
    mountPath: "/api/moderation",
    method: "",
    middlewares: [],
    modules: [onRequest4]
  },
  {
    routePath: "/api/catalog/:id",
    mountPath: "/api/catalog",
    method: "DELETE",
    middlewares: [],
    modules: [onRequestDelete]
  },
  {
    routePath: "/api/catalog/:id",
    mountPath: "/api/catalog",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/catalog/:id",
    mountPath: "/api/catalog",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/api/state",
    mountPath: "/api",
    method: "",
    middlewares: [],
    modules: [onRequest5]
  }
];

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../../../AppData/Local/npm-cache/_npx/32026684e21afda6/node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
export {
  pages_template_worker_default as default
};
