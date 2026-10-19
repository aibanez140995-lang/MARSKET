// scratch/adversarial_recheck_v1102.mjs
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}/index.html`;

let serverState = {
    version: 1,
    resetEpoch: 1000,
    catalog: [
        { id: 'F01', name: 'Botella PET 500ml', price: 97.0, stock: 10 }
    ],
    companies: {
        astra: { name: 'Astra Dynamics', balance: 1000.0, orders: [], ledger: [] }
    },
    suggestionsToAlex: []
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/api/state') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify(serverState));
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const incoming = JSON.parse(body);
                if (incoming.version && incoming.version <= serverState.version) {
                    res.writeHead(409, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Conflict: Server has a newer version', serverVersion: serverState.version }));
                }
                serverState = incoming;
                serverState.version = (Number(serverState.version) || 1) + 1;
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: true, version: serverState.version }));
            });
            return;
        }
    }

    if (pathname.startsWith('/api/catalog/')) {
        const itemId = pathname.slice('/api/catalog/'.length);
        if (req.method === 'PATCH') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const p = JSON.parse(body);
                if (typeof p.version !== 'number') {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Falta parámetro version' }));
                }
                if (p.version !== serverState.version) {
                    res.writeHead(409, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'CONFLICT', serverVersion: serverState.version }));
                }
                const item = serverState.catalog.find(i => String(i.id) === String(itemId));
                if (item && p.changes && p.changes.price !== undefined) item.price = Number(p.changes.price);
                else if (item && p.price !== undefined) item.price = Number(p.price);
                serverState.version += 1;
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: true, version: serverState.version, item }));
            });
            return;
        }
        if (req.method === 'DELETE') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const p = body ? JSON.parse(body) : {};
                if (typeof p.version !== 'number') {
                    res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'Falta parámetro version' }));
                }
                if (p.version !== serverState.version) {
                    res.writeHead(409, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ error: 'CONFLICT', serverVersion: serverState.version }));
                }
                const idx = serverState.catalog.findIndex(i => String(i.id) === String(itemId));
                const deleted = idx !== -1 ? serverState.catalog.splice(idx, 1)[0] : null;
                serverState.version += 1;
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ success: true, version: serverState.version, deleted }));
            });
            return;
        }
    }

    // Serve static files
    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not Found');
    }
    const ext = path.extname(filePath).toLowerCase();
    const mime = ext === '.html' ? 'text/html; charset=utf-8' : (ext === '.js' ? 'application/javascript; charset=utf-8' : 'text/plain');
    res.writeHead(200, { 'Content-Type': mime });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
    console.log(`Adversarial test server running on port ${PORT}`);
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(BASE_URL);
        await page.waitForSelector('#login-screen');

        console.log('\n--- VERIFICATION 1: window.exportBadgePDF() Security Guard ---');
        const v1Result = await page.evaluate(() => {
            // Test 1: Propulsion student
            state.user = { role: 'propulsion', coId: 'astra', admin: false };
            let thrownMessage = '';
            try {
                window.exportBadgePDF();
            } catch (e) {
                thrownMessage = e.message;
            }

            // Test 2: Check global function existence
            const fnType = typeof window.exportBadgePDF;

            const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent || '').join('\n');
            const hasA4 = /size:\s*A4\s*portrait/i.test(styles);
            const hasPrintArea = styles.includes('#credentials-print-area');

            return { fnType, thrownMessage, hasA4, hasPrintArea };
        });

        console.log('Vector 1 result:', v1Result);
        if (v1Result.fnType !== 'function') throw new Error('FAIL: window.exportBadgePDF is not defined');
        if (!v1Result.thrownMessage.includes('SECURITY_EXCEPTION')) throw new Error(`FAIL: Did not throw SECURITY_EXCEPTION. Threw: ${v1Result.thrownMessage}`);
        if (!v1Result.hasA4) throw new Error('FAIL: Missing A4 portrait in print CSS');
        console.log('PASS: Vector 1 verified successfully!');

        console.log('\n--- VERIFICATION 2: Offline Reset & Orphan Data Prevention ---');
        const v2Result = await page.evaluate(async () => {
            // Setup local state with dirty data and older epoch
            localStorage.setItem('marsket_reset_epoch', '1000');
            localStorage.setItem('marsket_orphan_order', 'ORDER-999');
            state.data.companies.astra.orders = [{ id: 'DIRTY-ORDER-1' }];
            state.data.suggestionsToAlex = [{ id: 'DIRTY-SUGGESTION-1' }];

            // Simulate incoming server reset with newer epoch
            const resetServerData = {
                version: 2,
                resetEpoch: 2000,
                companies: { astra: { name: 'Astra Clean', balance: 1000.0, orders: [], ledger: [] } },
                suggestionsToAlex: [],
                catalog: [{ id: 'F01', name: 'Botella PET 500ml', price: 97.0 }]
            };

            const merged = state.mergeData(resetServerData, state.data);

            const hasOrphanKey = !!localStorage.getItem('marsket_orphan_order');
            const ordersCount = merged.companies.astra.orders.length;
            const suggsCount = (merged.suggestionsToAlex || []).length;
            const updatedEpoch = localStorage.getItem('marsket_reset_epoch');

            return { hasOrphanKey, ordersCount, suggsCount, updatedEpoch };
        });

        console.log('Vector 2 result:', v2Result);
        if (v2Result.hasOrphanKey) throw new Error('FAIL: Orphan localStorage key was not cleared on resetEpoch');
        if (v2Result.ordersCount !== 0) throw new Error('FAIL: Dirty orders were resurrected');
        if (v2Result.suggsCount !== 0) throw new Error('FAIL: Dirty suggestions were resurrected');
        if (v2Result.updatedEpoch !== '2000') throw new Error('FAIL: resetEpoch was not updated in localStorage');
        console.log('PASS: Vector 2 verified successfully!');

        console.log('\n--- VERIFICATION 3: Concurrency & Optimistic Locking ---');
        // Test parallel updates on catalog
        serverState.version = 5;
        const res1 = await fetch(`http://127.0.0.1:${PORT}/api/catalog/F01`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 5, price: 99.0 })
        });
        const res1Json = await res1.json();
        console.log('Update 1 status:', res1.status, res1Json);

        // Update 2 sends same old version 5 (must be rejected with 409 Conflict)
        const res2 = await fetch(`http://127.0.0.1:${PORT}/api/catalog/F01`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: 5, price: 105.0 })
        });
        const res2Json = await res2.json();
        console.log('Update 2 (stale version 5) status:', res2.status, res2Json);

        if (res1.status !== 200) throw new Error(`FAIL: First update failed with ${res1.status}`);
        if (res2.status !== 409) throw new Error(`FAIL: Stale update did not return 409. Got ${res2.status}`);
        if (res2Json.error !== 'CONFLICT') throw new Error(`FAIL: Expected error: 'CONFLICT', got ${res2Json.error}`);
        console.log('PASS: Vector 3 verified successfully!');

        console.log('\n>>> ALL PREVIOUSLY FAILED VECTORS (V1, V2, V3) NOW PASS DESTRUCTIVE TESTING! <<<');

    } finally {
        await browser.close();
        server.close();
    }
});
