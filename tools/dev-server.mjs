// tools/dev-server.mjs
// Servidor de desarrollo local para MARS-KET 2.0 (v1.0.19)
// Sirve estáticos por HTTP y simula el backend Cloudflare Pages + D1 (/api/state)

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const PORT = parseInt(process.env.PORT, 10) || 3000;

// Estado en memoria simulando Cloudflare D1
let memoryState = null;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
    '.woff': 'font/woff',
    '.ttf': 'font/ttf'
};

function sendJSON(res, statusCode, data) {
    const jsonStr = JSON.stringify(data);
    res.writeHead(statusCode, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(jsonStr);
}

const MAX_PAYLOAD_BYTES = 2 * 1024 * 1024; // Límite estricto 2 MB anti-OOM (SRE Runtime Security)

function parseJsonWithLimit(req, res, maxBytes = MAX_PAYLOAD_BYTES) {
    return new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        let destroyed = false;

        req.on('data', chunk => {
            if (destroyed) return;
            size += chunk.length;
            if (size > maxBytes) {
                destroyed = true;
                res.writeHead(413, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Connection': 'close',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: 'Payload Too Large: El tamaño excede el límite estricto de 2 MB.' }));
                req.destroy();
                const err = new Error('PAYLOAD_LIMIT_EXCEEDED');
                err.statusCode = 413;
                return reject(err);
            }
            chunks.push(chunk);
        });

        req.on('end', () => {
            if (destroyed) return;
            try {
                const raw = Buffer.concat(chunks, size).toString('utf8');
                const parsed = raw.trim() ? JSON.parse(raw) : {};
                resolve(parsed);
            } catch (err) {
                res.writeHead(400, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({ error: 'Malformed JSON payload' }));
                reject(err);
            }
        });

        req.on('error', err => {
            if (!destroyed) reject(err);
        });
    });
}

function sanitizeStateForClient(rawState) {
    if (!rawState || typeof rawState !== 'object') return rawState;
    // Sanitización quirúrgica in-place sin deep-cloning JSON.parse(JSON.stringify())
    const clean = Array.isArray(rawState) ? [...rawState] : { ...rawState };
    if (clean.config && clean.config.teachers) {
        clean.config = { ...clean.config, teachers: { ...clean.config.teachers } };
        for (const teacherKey in clean.config.teachers) {
            if (clean.config.teachers[teacherKey]) {
                const t = { ...clean.config.teachers[teacherKey] };
                delete t.pin;
                clean.config.teachers[teacherKey] = t;
            }
        }
    }
    if (clean.companies) {
        clean.companies = { ...clean.companies };
        for (const cid in clean.companies) {
            if (clean.companies[cid]) {
                const co = { ...clean.companies[cid] };
                delete co.authVault;
                delete co.roles;
                delete co.accessCode;
                clean.companies[cid] = co;
            }
        }
    }
    return clean;
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // Endpoint de control: reiniciar estado en memoria
    if (pathname === '/api/reset' || pathname === '/api/state/reset') {
        memoryState = null;
        return sendJSON(res, 200, { ok: true, message: 'Estado D1 en memoria reiniciado a empty' });
    }

    // Endpoint RPC v1.1.02: /api/admin/reset
    if (pathname === '/api/admin/reset') {
        if (req.method !== 'POST') return sendJSON(res, 405, { error: 'MethodNotAllowed' });
        parseJsonWithLimit(req, res).then(() => {
            if (memoryState) {
                if (memoryState.companies) {
                    for (const cid in memoryState.companies) {
                        const co = memoryState.companies[cid];
                        co.balance = 1000.00;
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
                        co.brandApproval = { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };
                    }
                }
                memoryState.suggestionsToAlex = [];
                memoryState.pendingCustom = [];
                memoryState.b2bMarket = [];
                memoryState.b2bContracts = [];
                memoryState.securityIncidents = [];
                memoryState.moderationAlerts = [];
                if (Array.isArray(memoryState.catalog)) {
                    memoryState.catalog.forEach(item => {
                        if (item.default_price !== undefined) item.price = item.default_price;
                        if (item.default_stock !== undefined) item.stock = item.default_stock;
                    });
                }
                memoryState.version = (Number(memoryState.version) || 1) + 1;
                memoryState.resetEpoch = Date.now();
                memoryState.lastUpdated = Date.now();
            }
            return sendJSON(res, 200, { success: true, resetEpoch: memoryState ? memoryState.resetEpoch : Date.now(), message: 'Reset transaccional completado en memoria' });
        }).catch(() => {});
        return;
    }

    // Endpoint v1.1.02: /api/catalog/update con control optimista
    if (pathname === '/api/catalog/update') {
        if (req.method !== 'POST' && req.method !== 'PATCH' && req.method !== 'PUT') {
            return sendJSON(res, 405, { error: 'MethodNotAllowed' });
        }
        parseJsonWithLimit(req, res).then(payload => {
            const clientVersion = payload.version !== undefined ? Number(payload.version) : null;
            const serverVersion = memoryState ? (Number(memoryState.version) || 1) : 1;

            if (clientVersion !== null && clientVersion < serverVersion) {
                return sendJSON(res, 409, { error: 'Conflict: Outdated version', changes: 0, serverVersion });
            }

            if (memoryState && Array.isArray(memoryState.catalog)) {
                const item = memoryState.catalog.find(i => String(i.id) === String(payload.id));
                if (item) {
                    if (payload.price !== undefined) item.price = Number(payload.price);
                    if (payload.stock !== undefined) item.stock = Number(payload.stock);
                    if (payload.name !== undefined) item.name = String(payload.name);
                }
                memoryState.version = serverVersion + 1;
                memoryState.lastUpdated = Date.now();
                return sendJSON(res, 200, { ok: true, item, version: memoryState.version });
            }
            return sendJSON(res, 200, { ok: true });
        }).catch(() => {});
        return;
    }

    // Endpoint v1.1.02: /api/catalog/:id
    if (pathname.startsWith('/api/catalog/')) {
        const itemId = decodeURIComponent(pathname.slice('/api/catalog/'.length));
        if (req.method === 'PATCH') {
            parseJsonWithLimit(req, res).then(payload => {
                const clientVersion = payload.version;
                const force = payload.force === true;
                const serverVersion = memoryState ? (Number(memoryState.version) || 1) : 1;

                if (typeof clientVersion !== 'number') {
                    return sendJSON(res, 400, { error: 'Falta parámetro version' });
                }
                if (!force && clientVersion !== serverVersion) {
                    return sendJSON(res, 409, { error: 'CONFLICT', serverVersion, changes: 0 });
                }

                if (memoryState && Array.isArray(memoryState.catalog)) {
                    const item = memoryState.catalog.find(i => String(i.id) === String(itemId));
                    if (!item) return sendJSON(res, 404, { error: 'Not found' });
                    const changes = payload.changes || {};
                    if (payload.price !== undefined && changes.price === undefined) changes.price = payload.price;
                    if (payload.stock !== undefined && changes.stock === undefined) changes.stock = payload.stock;
                    if (payload.name !== undefined && changes.name === undefined) changes.name = payload.name;
                    Object.assign(item, changes);
                    memoryState.version = serverVersion + 1;
                    memoryState.lastUpdated = Date.now();
                    return sendJSON(res, 200, { success: true, item, version: memoryState.version });
                }
                return sendJSON(res, 200, { success: true, version: serverVersion });
            }).catch(() => {});
            return;
        }
        if (req.method === 'DELETE') {
            parseJsonWithLimit(req, res).then(payload => {
                let clientVersion = payload.version;
                let force = payload.force === true;
                const serverVersion = memoryState ? (Number(memoryState.version) || 1) : 1;
                if (typeof clientVersion !== 'number') {
                    return sendJSON(res, 400, { error: 'Falta parámetro version' });
                }

                if (memoryState && Array.isArray(memoryState.catalog)) {
                    const idx = memoryState.catalog.findIndex(i => String(i.id) === String(itemId));
                    if (idx === -1) {
                        return sendJSON(res, 200, { success: true, alreadyDeleted: true, version: serverVersion });
                    }
                    if (!force && clientVersion !== serverVersion) {
                        return sendJSON(res, 409, { error: 'CONFLICT', serverVersion, changes: 0 });
                    }
                    const removed = memoryState.catalog.splice(idx, 1)[0];
                    memoryState.version = serverVersion + 1;
                    memoryState.lastUpdated = Date.now();
                    return sendJSON(res, 200, { success: true, deleted: removed, version: memoryState.version });
                }
                return sendJSON(res, 200, { success: true, version: serverVersion });
            }).catch(() => {});
            return;
        }
        return sendJSON(res, 405, { error: 'MethodNotAllowed' });
    }

    // Endpoint v1.1.02: /api/moderation/report
    if (pathname === '/api/moderation/report') {
        if (req.method === 'POST') {
            parseJsonWithLimit(req, res).then(payload => {
                const record = {
                    id: 'MOD-' + Date.now(),
                    team_id: payload.team_id || 'UNKNOWN',
                    student_alias: payload.student_alias || 'ESTUDIANTE',
                    offending_text: payload.offending_text || '',
                    matched_term: payload.matched_term || '',
                    timestamp: payload.timestamp || new Date().toISOString()
                };
                if (memoryState) {
                    memoryState.securityIncidents = memoryState.securityIncidents || [];
                    memoryState.securityIncidents.unshift(record);
                }
                return sendJSON(res, 200, { ok: true, record });
            }).catch(() => {});
            return;
        }
        if (req.method === 'GET') {
            return sendJSON(res, 200, memoryState?.securityIncidents || []);
        }
        return sendJSON(res, 405, { error: 'MethodNotAllowed' });
    }

    // Endpoint v1.1.05: /api/admin/credentials
    if (pathname === '/api/admin/credentials') {
        const VAULT_KEY = 'MARS_AEE_2026_SECRET_KEY';
        const decodeSecret = (str) => {
            if (!str || typeof str !== 'string' || !str.startsWith('VLT_')) return str || '';
            const b64 = str.slice(4);
            try {
                const raw = Buffer.from(b64, 'base64').toString('binary');
                let out = '';
                for (let i = 0; i < raw.length; i++) {
                    out += String.fromCharCode(raw.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length));
                }
                return out;
            } catch(e) { return str; }
        };
        const encodeSecret = (str) => {
            if (!str) return '';
            const s = String(str);
            let out = '';
            for (let i = 0; i < s.length; i++) {
                out += String.fromCharCode(s.charCodeAt(i) ^ VAULT_KEY.charCodeAt(i % VAULT_KEY.length));
            }
            return 'VLT_' + Buffer.from(out, 'binary').toString('base64');
        };

        if (req.method === 'GET') {
            if (!memoryState) return sendJSON(res, 404, { error: 'NoState' });
            const teachers = memoryState.config?.teachers || {};
            const companies = {};
            const allRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            for (const cid in memoryState.companies || {}) {
                const co = memoryState.companies[cid];
                let plainCode = co.accessCode || '';
                if (co.authVault?.code) plainCode = decodeSecret(co.authVault.code);
                const plainRoles = {};
                for (const r of allRoles) {
                    let rPin = '';
                    if (co.authVault?.roles?.[r]) rPin = decodeSecret(co.authVault.roles[r]);
                    else if (co.roles?.[r] && !String(co.roles[r]).startsWith('VLT_')) rPin = String(co.roles[r]);
                    if (rPin) plainRoles[r] = rPin;
                }
                companies[cid] = {
                    id: cid,
                    name: co.name,
                    classGroup: co.classGroup || 'A',
                    accessCode: plainCode,
                    roles: plainRoles,
                    auxRoleDept: co.auxRoleDept || ''
                };
            }
            return sendJSON(res, 200, { teachers, companies, version: memoryState.version || 1 });
        }

        if (req.method === 'PATCH') {
            parseJsonWithLimit(req, res).then(body => {
                const { type, id, role, newPin, newCode } = body;
                if (!type || !id || (type !== 'teacher' && type !== 'company')) {
                    return sendJSON(res, 400, { error: 'InvalidParams' });
                }
                if (!memoryState) return sendJSON(res, 404, { error: 'NoState' });

                const now = Date.now();
                if (type === 'teacher') {
                    memoryState.config = memoryState.config || {};
                    memoryState.config.teachers = memoryState.config.teachers || {};
                    if (!memoryState.config.teachers[id]) return sendJSON(res, 404, { error: 'TeacherNotFound' });
                    memoryState.config.teachers[id].pin = String(newPin || '').trim();
                    memoryState.config.teachers[id].pinUpdatedAt = now;
                } else {
                    memoryState.companies = memoryState.companies || {};
                    const co = memoryState.companies[id];
                    if (!co) return sendJSON(res, 404, { error: 'CompanyNotFound' });
                    co.authVault = co.authVault || { code: '', roles: {} };
                    co.authVault.roles = co.authVault.roles || {};
                    if (role) {
                        const cleanPin = String(newPin || '').trim();
                        if (role === 'AUXILIAR' && cleanPin === '') {
                            delete co.authVault.roles['AUXILIAR'];
                            if (co.roles) delete co.roles['AUXILIAR'];
                        } else {
                            co.authVault.roles[role] = encodeSecret(cleanPin);
                            co.roles = co.roles || {};
                            co.roles[role] = 'PROTECTED';
                        }
                    } else {
                        const cleanCode = String(newPin || newCode || '').trim().toUpperCase();
                        co.authVault.code = encodeSecret(cleanCode);
                        delete co.accessCode;
                    }
                    co.updatedAt = now;
                    co.authUpdatedAt = now;
                }

                memoryState.version = (Number(memoryState.version) || 0) + 1;
                memoryState.lastUpdated = now;
                return sendJSON(res, 200, { success: true, newVersion: memoryState.version });
            }).catch(() => {});
            return;
        }
        return sendJSON(res, 405, { error: 'MethodNotAllowed' });
    }

    // Endpoint D1: /api/state
    if (pathname === '/api/state') {
        if (req.method === 'GET') {
            if (!memoryState) {
                return sendJSON(res, 200, { status: 'empty' });
            }
            const currentVersion = memoryState.version ? String(memoryState.version) : "1";
            const serverETag = `W/"v-${currentVersion}"`;
            const clientETag = req.headers['if-none-match'];

            if (clientETag === serverETag) {
                res.writeHead(304, {
                    'ETag': serverETag,
                    'Cache-Control': 'public, no-cache',
                    'Access-Control-Allow-Origin': '*'
                });
                return res.end();
            }

            res.setHeader('ETag', serverETag);
            res.setHeader('Cache-Control', 'public, no-cache');
            return sendJSON(res, 200, sanitizeStateForClient(memoryState));
        }

        if (req.method === 'POST') {
            parseJsonWithLimit(req, res).then(incoming => {
                // Validación de código de empresa (Zero-Trust)
                if (incoming.action === 'validate_company_code') {
                    if (memoryState && memoryState.companies) {
                        const code = String(incoming.code || '').trim().toUpperCase();
                        for (const cid in memoryState.companies) {
                            const co = memoryState.companies[cid];
                            let coCode = co.accessCode || '';
                            if (co.authVault && co.authVault.code) {
                                try {
                                    const b64 = co.authVault.code.startsWith('VLT_') ? co.authVault.code.slice(4) : co.authVault.code;
                                    coCode = Buffer.from(b64, 'base64').toString('utf8');
                                } catch(e) {}
                            }
                            if (coCode.trim().toUpperCase() === code) {
                                const hasAux = !!(co.authVault?.roles?.AUXILIAR || co.roles?.AUXILIAR);
                                return sendJSON(res, 200, { matchedCoId: cid, companyMeta: { hasAux, name: co.name } });
                            }
                        }
                    }
                    return sendJSON(res, 404, { error: 'Company code not found' });
                }

                // Verificación de PIN de departamento en servidor (Zero-Trust)
                if (incoming.action === 'verify_student_login') {
                    if (memoryState && memoryState.companies && memoryState.companies[incoming.coId]) {
                        const co = memoryState.companies[incoming.coId];
                        let expectedPin = '';
                        if (co.authVault && co.authVault.roles && co.authVault.roles[incoming.role]) {
                            try {
                                const b64 = co.authVault.roles[incoming.role].startsWith('VLT_') ? co.authVault.roles[incoming.role].slice(4) : co.authVault.roles[incoming.role];
                                expectedPin = Buffer.from(b64, 'base64').toString('utf8').trim();
                            } catch(e) {}
                        } else if (co.roles && co.roles[incoming.role]) {
                            expectedPin = String(co.roles[incoming.role]).trim();
                        }
                        const verified = Boolean(expectedPin && expectedPin === String(incoming.pin).trim());
                        return sendJSON(res, verified ? 200 : 401, { verified, companyName: co.name });
                    }
                    return sendJSON(res, 401, { verified: false });
                }

                // Verificación de PIN docente en servidor (Zero-Trust)
                if (incoming.action === 'verify_teacher_login') {
                    const defaultTeacherPins = {
                        'COORD_MARIO': '0001',
                        'COORD_ALEX': '0002',
                        'FYQ': '0101',
                        'ECO': '0202',
                        'LYE': '0303',
                        'LEN': '0404',
                        'MAT': '0505',
                        'ING': '0606'
                    };
                    const t = memoryState?.config?.teachers?.[incoming.role];
                    const expectedPin = (t && t.pin) ? String(t.pin).trim() : (defaultTeacherPins[incoming.role] || '');
                    const verified = Boolean(expectedPin && expectedPin === String(incoming.pin).trim());
                    return sendJSON(res, verified ? 200 : 401, { verified });
                }

                // Control de versión optimista estricto sin bypass de versión 0 (v1.1.05)
                if (memoryState) {
                    const incomingVersion = incoming.version;
                    const serverVersion = Number(memoryState.version) || 0;
                    if (typeof incomingVersion !== 'number' || isNaN(incomingVersion) || incomingVersion <= serverVersion) {
                        return sendJSON(res, 409, {
                            error: 'CONFLICT',
                            message: 'Versión obsoleta o ausente. Conflicto de concurrencia detectado.',
                            serverVersion: serverVersion,
                            changes: 0
                        });
                    }
                }

                // FUSIÓN DE SECRETOS EN SERVIDOR (Server-Side Merging)
                if (memoryState) {
                    if (incoming.config && incoming.config.teachers && memoryState.config?.teachers) {
                        for (const key in incoming.config.teachers) {
                            if (memoryState.config.teachers[key]?.pin) {
                                incoming.config.teachers[key].pin = memoryState.config.teachers[key].pin;
                            }
                        }
                    } else if (memoryState.config) {
                        incoming.config = incoming.config || {};
                        incoming.config.teachers = memoryState.config.teachers;
                    }
                    if (incoming.companies && memoryState.companies) {
                        for (const cid in incoming.companies) {
                            const sCo = memoryState.companies[cid];
                            if (sCo) {
                                if (sCo.authVault) incoming.companies[cid].authVault = sCo.authVault;
                                if (sCo.accessCode) incoming.companies[cid].accessCode = sCo.accessCode;
                                if (sCo.roles) incoming.companies[cid].roles = sCo.roles;
                            }
                        }
                    }
                }

                // Asignación de versión atómica
                const nextVersion = memoryState ? (Number(incoming.version || memoryState.version) + 1) : 1;
                incoming.version = nextVersion;
                incoming.lastUpdated = Date.now();
                memoryState = incoming;

                return sendJSON(res, 200, {
                    success: true,
                    version: nextVersion,
                    lastUpdated: incoming.lastUpdated
                });
            }).catch(() => {});
            return;
        }

        return sendJSON(res, 405, { error: 'MethodNotAllowed' });
    }

    // Servir archivos estáticos
    let relativePath = pathname === '/' ? '/index.html' : pathname;
    const filePath = path.normalize(path.join(ROOT_DIR, relativePath));

    // Seguridad: evitar path traversal
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        return res.end('Acceso denegado');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
            return res.end(`404 Not Found: ${pathname}`);
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            'Access-Control-Allow-Origin': '*'
        });

        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`[MARS-KET DEV-SERVER] Servidor activo en http://127.0.0.1:${PORT}`);
    console.log(`  - Estáticos: ${ROOT_DIR}`);
    console.log(`  - API State: http://127.0.0.1:${PORT}/api/state`);
    console.log(`  - Reset:     http://127.0.0.1:${PORT}/api/reset`);
});

// Manejo de apagado limpio
process.on('SIGINT', () => {
    server.close(() => process.exit(0));
});
process.on('SIGTERM', () => {
    server.close(() => process.exit(0));
});
