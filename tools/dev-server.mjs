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

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    // Endpoint de control: reiniciar estado en memoria
    if (pathname === '/api/reset' || pathname === '/api/state/reset') {
        memoryState = null;
        return sendJSON(res, 200, { ok: true, message: 'Estado D1 en memoria reiniciado a empty' });
    }

    // Endpoint D1: /api/state
    if (pathname === '/api/state') {
        if (req.method === 'GET') {
            if (!memoryState) {
                return sendJSON(res, 200, { status: 'empty' });
            }
            return sendJSON(res, 200, memoryState);
        }

        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    const incoming = JSON.parse(body);

                    // Control de versión optimista (409 Conflict)
                    if (memoryState && incoming.version && Number(incoming.version) < Number(memoryState.version)) {
                        return sendJSON(res, 409, {
                            error: 'VersionConflict',
                            message: `Conflicto de versión: entrante ${incoming.version} vs servidor ${memoryState.version}`,
                            serverVersion: memoryState.version
                        });
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
                } catch (err) {
                    return sendJSON(res, 400, { error: 'InvalidJSON', details: err.message });
                }
            });
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
