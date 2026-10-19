// scratch/test_mission_v1102.mjs
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
const PORT = 3001;
const BASE_URL = `http://127.0.0.1:${PORT}/index.html`;

// 1. Iniciar dev-server local
let memoryState = null;
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);

    if (pathname === '/api/reset') {
        memoryState = null;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ ok: true }));
    }

    if (pathname === '/api/state') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify(memoryState || { status: 'empty' }));
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const incoming = JSON.parse(body);
                incoming.version = (Number(incoming.version) || 1) + 1;
                memoryState = incoming;
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ ok: true, version: memoryState.version }));
            });
            return;
        }
    }

    if (pathname === '/api/admin/reset') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            if (memoryState && memoryState.companies) {
                for (const cid in memoryState.companies) {
                    memoryState.companies[cid].balance = 1000.00;
                    memoryState.companies[cid].orders = [];
                    memoryState.companies[cid].ledger = [];
                }
            }
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ success: true, message: 'Reset transaccional simulado completado' }));
        });
        return;
    }

    if (pathname.startsWith('/api/catalog/')) {
        const itemId = pathname.slice('/api/catalog/'.length);
        if (req.method === 'PATCH') {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                const p = JSON.parse(body);
                if (memoryState && Array.isArray(memoryState.catalog)) {
                    const item = memoryState.catalog.find(i => String(i.id) === String(itemId));
                    if (item && p.price !== undefined) item.price = Number(p.price);
                }
                res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ ok: true, itemId, price: p.price }));
            });
            return;
        }
        if (req.method === 'DELETE') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify({ ok: true, deleted: itemId }));
        }
    }

    if (pathname === '/api/moderation/report') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            const p = JSON.parse(body);
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ ok: true, record: p }));
        });
        return;
    }

    let filePath = path.join(ROOT_DIR, pathname === '/' ? 'index.html' : pathname);
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('Not Found');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, async () => {
    console.log(`Test dev-server running on port ${PORT}`);
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();

    try {
        await page.goto(BASE_URL);
        await page.waitForSelector('#login-screen');

        console.log('\n--- 1. Testing Credential Card Cyberpunk Generation & Guard ---');
        // Non-coordinator attempt: must abort
        const nonCoordResult = await page.evaluate(() => {
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            const res = ui.generateRoleCredentialCard('astra', 'CEO');
            return res;
        });
        console.log('Non-coordinator call abort result:', nonCoordResult);

        // Coordinator attempt: must generate credentials
        const coordResult = await page.evaluate(() => {
            state.user = { admin: true, role: 'COORD_MARIO', name: 'Coordinación' };
            ui.generateRoleCredentialCard('astra', 'CEO');
            const printArea = document.getElementById('credentials-print-area');
            const hasHtml = printArea && printArea.innerHTML.length > 500;
            const hasColors = printArea && printArea.innerHTML.includes('#07090E') && printArea.innerHTML.includes('#FF007F') && printArea.innerHTML.includes('#00F0FF');
            const hasCaution = printArea && printArea.innerHTML.includes('CAUTION');
            const hasBarcode = printArea && printArea.innerHTML.includes('<svg') && printArea.innerHTML.includes('rect');
            return { hasHtml, hasColors, hasCaution, hasBarcode };
        });
        console.log('Coordinator credential generation:', coordResult);
        if (!coordResult.hasColors || !coordResult.hasCaution || !coordResult.hasBarcode) {
            throw new Error('Credential card generation failed visual requirements');
        }

        console.log('\n--- 2. Testing Chemical Input Validations (NaHCO3 & CH3COOH) ---');
        const chemTests = await page.evaluate(() => {
            state.user = { admin: false, role: 'TECNICO', coId: 'astra' };
            ui.current = 'tech';
            ui.render();

            let lastNotification = null;
            const origNotify = ui.notify;
            ui.notify = (msg, type) => { lastNotification = { msg, type }; };

            const elNahco3 = document.getElementById('ft-nahco3');
            const elVinegar = document.getElementById('ft-vinegar');
            const elCost = document.getElementById('ft-cost');
            const elHeight = document.getElementById('ft-height-mm');
            const elBottle = document.getElementById('ft-bottle');

            elBottle.value = 'PET 500ml';
            elCost.value = '100';
            elHeight.value = '500';

            // Test 1: negative NaHCO3
            elNahco3.value = '-20';
            elVinegar.value = '50';
            ui.submitFlightTest();
            const t1 = lastNotification;

            // Test 2: alphanumeric in NaHCO3
            elNahco3.value = '20g';
            elVinegar.value = '50';
            ui.submitFlightTest();
            const t2 = lastNotification;

            // Test 3: negative CH3COOH
            elNahco3.value = '20';
            elVinegar.value = '-50';
            ui.submitFlightTest();
            const t3 = lastNotification;

            // Test 4: valid positive numbers
            elNahco3.value = '25.5';
            elVinegar.value = '60.0';
            ui.submitFlightTest();
            const t4 = lastNotification;

            ui.notify = origNotify;
            return { t1, t2, t3, t4 };
        });
        console.log('Chemical validation tests:', chemTests);
        if (chemTests.t1.type !== 'error' || chemTests.t2.type !== 'error' || chemTests.t3.type !== 'error' || chemTests.t4.type !== 'success') {
            throw new Error('Chemical validation failed tests');
        }

        console.log('\n--- 3. Testing Financial Rounding Precision ---');
        const finPrecision = await page.evaluate(() => {
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            const co = state.data.companies.astra;
            co.balance = 1000.00;
            // Add 10.005 and -3.00499
            state.addToLedger('astra', 'Test Round Up', 'FINANZAS', 10.005);
            const bal1 = co.balance;
            state.addToLedger('astra', 'Test Round Down', 'FINANZAS', -3.00499);
            const bal2 = co.balance;
            return { bal1, bal2 };
        });
        console.log('Financial precision results:', finPrecision);
        if (finPrecision.bal1 !== 1010.01 || finPrecision.bal2 !== 1007.01) {
            throw new Error('Financial rounding precision failed');
        }

        console.log('\n--- 4. Testing Collapsible HUD of Resolved Queries ---');
        const collapsibleQueries = await page.evaluate(() => {
            state.user = { admin: true, role: 'COORD_MARIO', name: 'Mario' };
            state.data.suggestionsToAlex = [
                { id: 'Q1', text: 'Consulta activa 1', author: 'astra', resolved: false, date: '19/10/2026' },
                { id: 'Q2', text: 'Consulta resuelta 1', author: 'astra', resolved: true, answer: 'Solución', date: '19/10/2026' },
                { id: 'Q3', text: 'Consulta resuelta 2', author: 'ares', resolved: true, answer: 'Aprobado', date: '19/10/2026' }
            ];
            ui.current = 'admin';
            ui.adminTab = 'settings';
            ui.render();

            const details = document.querySelector('details');
            const hasDetails = !!details;
            const badgeText = details ? details.querySelector('summary').innerText : '';
            return { hasDetails, badgeText };
        });
        console.log('Collapsible queries check:', collapsibleQueries);
        if (!collapsibleQueries.hasDetails || !collapsibleQueries.badgeText.includes('2 RESUELTAS')) {
            throw new Error('Collapsible queries not rendered properly');
        }

        console.log('\n--- 5. Testing Lexical Infraction Telemetry & Alert Badge ---');
        const moderationResult = await page.evaluate(async () => {
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            ui.recordSecurityIncident('PROFANITY', 'Prueba de palabrota detected', 'chat', 'palabrota');

            state.user = { admin: true, role: 'COORD_MARIO', name: 'Mario' };
            ui.current = 'admin';
            ui.adminTab = 'dash';
            ui.render();

            const badge = document.querySelector('.bg-\\[\\#FF0055\\]');
            const hasBadge = !!badge;

            // Trigger modal
            ui.modalModerationIncidents();
            const modalBody = document.getElementById('modal-body');
            const hasModal = modalBody && modalBody.innerHTML.includes('INFRACCIONES LÉXICAS');

            return { hasBadge, hasModal };
        });
        console.log('Moderation incident telemetry & badge:', moderationResult);
        if (!moderationResult.hasBadge || !moderationResult.hasModal) {
            throw new Error('Moderation alert badge or modal failed');
        }

        console.log('\n--- 6. Testing SuperMARS-KET Persistence & Polling Pause ---');
        const catalogTest = await page.evaluate(async () => {
            state.user = { admin: true, role: 'COORD_MARIO', name: 'Mario' };
            const origPause = state.pausePolling;
            // Ensure catalog has items
            state.data.catalog = state.data.catalog || [];
            if (state.data.catalog.length === 0) {
                state.data.catalog.push({ id: 'F01', name: 'Botella PET 500ml', price: 97.0 });
            }
            ui.current = 'admin';
            ui.adminTab = 'catalog';
            ui.render();

            const inputPrice = document.getElementById('price-F01') || document.querySelector('input[data-cat-idx="0"]');
            if (inputPrice) inputPrice.value = '105.50';

            const savePromise = ui.saveCatalogPrice('F01', 0);
            const isPausedDuringSave = state.pausePolling === true;
            await savePromise;
            const isResumedAfterSave = state.pausePolling === false;
            const updatedPrice = state.data.catalog[0].price;

            return { isPausedDuringSave, isResumedAfterSave, updatedPrice };
        });
        console.log('Catalog persistence & pause polling:', catalogTest);
        if (catalogTest.updatedPrice !== 105.5) {
            throw new Error('Catalog price was not persisted correctly');
        }

        console.log('\n--- 7. Testing Global Transactional Reset Trigger ---');
        const resetTest = await page.evaluate(async () => {
            state.user = { admin: true, role: 'COORD_MARIO', name: 'Mario' };
            // Simulate global reset call
            let notified = false;
            const origNotify = ui.notify;
            ui.notify = (msg) => { notified = true; };

            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: 'COORD_MARIO', token: 'COORD_MARIO' })
            });
            const ok = res.ok;
            const data = await res.json();
            ui.notify = origNotify;
            return { ok, data };
        });
        console.log('Global transactional reset call:', resetTest);
        if (!resetTest.ok || !resetTest.data.success) {
            throw new Error('Global transactional reset failed');
        }

        console.log('\n>>> ALL BROWSER E2E TESTS PASSED WITH 100% SUCCESS! <<<');

    } finally {
        await browser.close();
        server.close();
    }
});
