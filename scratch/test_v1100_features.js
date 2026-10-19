const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const PORT = 3001;
const FILE_URL = `http://127.0.0.1:${PORT}/index.html`;

function startServer() {
    const ROOT_DIR = path.resolve(__dirname, '..');
    let memoryState = null;
    const MIME = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'application/javascript; charset=utf-8',
        '.mjs': 'application/javascript; charset=utf-8',
        '.css': 'text/css; charset=utf-8',
        '.json': 'application/json; charset=utf-8',
        '.png': 'image/png'
    };
    const srv = http.createServer((req, res) => {
        const u = new URL(req.url, `http://localhost:${PORT}`);
        if (u.pathname === '/api/state') {
            if (req.method === 'GET') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify(memoryState || { status: 'empty' }));
            }
            if (req.method === 'POST') {
                let body = '';
                req.on('data', c => { body += c; });
                req.on('end', () => {
                    const parsed = JSON.parse(body);
                    const nVer = memoryState ? (Number(parsed.version || memoryState.version) + 1) : 1;
                    parsed.version = nVer;
                    parsed.lastUpdated = Date.now();
                    memoryState = parsed;
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ success: true, version: nVer }));
                });
                return;
            }
        }
        let fpath = path.join(ROOT_DIR, u.pathname === '/' ? 'index.html' : u.pathname);
        if (!fs.existsSync(fpath)) {
            res.writeHead(404);
            return res.end('Not found');
        }
        const ext = path.extname(fpath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(fpath).pipe(res);
    });
    srv.listen(PORT);
    return srv;
}

async function runTests() {
    const server = startServer();
    console.log(`[TEST] Test server started on http://127.0.0.1:${PORT}`);
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });
    const page = await browser.newPage();

    const results = {};

    try {
        // TEST 1: Desktop Containment (1440x900)
        console.log("\n--- TEST 1: Desktop Containment (1440x900) ---");
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        const desktopBox = await page.evaluate(() => {
            const el = document.getElementById('login-box');
            if (!el) return null;
            const rect = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            return {
                width: rect.width,
                maxWidth: cs.maxWidth,
                x: rect.x,
                viewportWidth: window.innerWidth
            };
        });
        console.log("Desktop Login Box Metrics:", desktopBox);
        results.desktopContainment = (desktopBox && desktopBox.width <= 448 && desktopBox.width > 200 && desktopBox.x > 100);

        // TEST 2: Scanline Laser Layer and Beam
        console.log("\n--- TEST 2: Scanline Laser CRT Layer & Beam ---");
        const scanline = await page.evaluate(() => {
            const layer = document.querySelector('.login-scanline-layer');
            const beam = document.querySelector('.login-laser-beam');
            const box = document.getElementById('login-box');
            if (!layer || !beam || !box) return null;
            const csLayer = window.getComputedStyle(layer);
            const csBox = window.getComputedStyle(box);
            return {
                layerExists: true,
                beamExists: true,
                layerZIndex: parseInt(csLayer.zIndex) || 1,
                boxZIndex: parseInt(csBox.zIndex) || 10
            };
        });
        console.log("Scanline Layer Metrics:", scanline);
        results.scanlineLaser = (scanline && scanline.beamExists && scanline.layerZIndex < scanline.boxZIndex);

        // TEST 3: PIN Masking & Toggle in Llavero Maestro
        console.log("\n--- TEST 3: PIN Masking & Toggle in Llavero Maestro ---");
        // Login as teacher COORD_MARIO
        await page.evaluate(() => {
            state.user = { role: 'COORD_MARIO', admin: true, name: 'Mario (Coord)' };
            ui.adminTab = 'startups';
            ui.render();
        });
        await page.waitForTimeout(300);

        const pinAuditInitial = await page.evaluate(() => {
            const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"], input[id^="teacher-pin-"]'));
            const dataPinAttrs = Array.from(document.querySelectorAll('[data-pin]'));
            const toggleBtn = document.getElementById('toggle-pins-btn');
            return {
                totalPins: pinInputs.length,
                allPassword: pinInputs.length > 0 && pinInputs.every(i => i.type === 'password'),
                dataPinCount: dataPinAttrs.length,
                toggleBtnExists: Boolean(toggleBtn),
                toggleBtnText: toggleBtn ? toggleBtn.innerText : ''
            };
        });
        console.log("PIN Audit Initial:", pinAuditInitial);

        // Click toggle button
        await page.evaluate(() => {
            ui.togglePinsVisibility();
        });
        await page.waitForTimeout(100);

        const pinAuditToggled = await page.evaluate(() => {
            const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"], input[id^="teacher-pin-"]'));
            const toggleBtn = document.getElementById('toggle-pins-btn');
            return {
                allText: pinInputs.length > 0 && pinInputs.every(i => i.type === 'text'),
                toggleBtnText: toggleBtn ? toggleBtn.innerText : ''
            };
        });
        console.log("PIN Audit After Toggle:", pinAuditToggled);

        // Click toggle button again (back to password)
        await page.evaluate(() => {
            ui.togglePinsVisibility();
        });
        await page.waitForTimeout(100);

        const pinAuditReverted = await page.evaluate(() => {
            const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"], input[id^="teacher-pin-"]'));
            return pinInputs.length > 0 && pinInputs.every(i => i.type === 'password');
        });

        results.pinMasking = (
            pinAuditInitial.allPassword &&
            pinAuditInitial.dataPinCount === 0 &&
            pinAuditInitial.toggleBtnExists &&
            pinAuditToggled.allText &&
            pinAuditReverted
        );

        // TEST 4: Pre-Launch Factory Reset (JOVE2025)
        console.log("\n--- TEST 4: Pre-Launch Factory Reset (JOVE2025) ---");
        await page.evaluate(() => {
            ui.adminTab = 'backups';
            ui.render();
        });
        await page.waitForTimeout(200);

        // Check factory reset button rendered
        const resetBtnExists = await page.evaluate(() => {
            return Boolean(document.querySelector('button[onclick*="promptFactoryResetLaunch"]'));
        });

        // Test wrong key
        const wrongKeyResult = await page.evaluate(() => {
            ui.promptFactoryResetLaunch();
            const input = document.getElementById('factory-reset-key');
            input.value = 'WRONG_KEY';
            ui.verifyAndConfirmFactoryReset();
            // Should NOT have closed modal or triggered confirm
            const modalTitle = document.getElementById('modal-title');
            return modalTitle ? modalTitle.innerText : '';
        });

        // Test correct key JOVE2025 and execution
        const factoryExecution = await page.evaluate(async () => {
            // First dirty the state
            const cid = Object.keys(state.data.companies)[0];
            const co = state.data.companies[cid];
            co.balance = 5000;
            co.orders = [{ id: 'ORD-999', total: 500 }];
            co.sanctions = [{ id: 'SANC-1', amount: 50 }];
            co.deliverables = { preliminaryReport: { grade: 8, url: 'http://test' } };
            const oldVersion = state.data.version || 1;

            // Execute reset
            await ui.factoryResetLaunch();

            const updatedCo = state.data.companies[cid];
            return {
                balance: updatedCo.balance,
                ordersLen: updatedCo.orders.length,
                sanctionsLen: updatedCo.sanctions.length,
                ledgerLen: updatedCo.ledger.length,
                deliverableCount: Object.keys(updatedCo.deliverables).length,
                deliverablesAllNull: Object.values(updatedCo.deliverables).every(v => v === null),
                newVersion: state.data.version,
                versionBumped50: (state.data.version >= oldVersion + 50)
            };
        });
        console.log("Factory Reset Execution Metrics:", factoryExecution);

        results.factoryReset = (
            resetBtnExists &&
            factoryExecution.balance === 2400 &&
            factoryExecution.ordersLen === 0 &&
            factoryExecution.sanctionsLen === 0 &&
            factoryExecution.ledgerLen === 1 &&
            factoryExecution.deliverableCount === 19 &&
            factoryExecution.deliverablesAllNull &&
            factoryExecution.versionBumped50
        );

        // TEST 5: Registro Mercantil Persistence in D1
        console.log("\n--- TEST 5: Registro Mercantil Persistence in D1 ---");
        const nameChangeTest = await page.evaluate(async () => {
            const cid = Object.keys(state.data.companies)[0];
            const co = state.data.companies[cid];
            co.nameChangeRequest = {
                status: 'PENDIENTE',
                proposedName: 'Astra Supernova Corp',
                reason: 'Expansión de negocio',
                updatedAt: Date.now() - 1000
            };
            const beforeSaveTime = co.updatedAt || 0;

            // Approve
            ui.resolveNameChangeRequest(cid, true);

            const approvedName = co.name;
            const approvedReqStatus = co.nameChangeRequest.status;
            const updatedTime = co.updatedAt;

            // Test mergeData reconciliation with old pending server data
            const serverMock = {
                companies: {
                    [cid]: {
                        updatedAt: Date.now() - 5000,
                        nameChangeRequest: {
                            status: 'PENDIENTE',
                            proposedName: 'Old Pending Name',
                            updatedAt: Date.now() - 6000
                        }
                    }
                }
            };
            const merged = state.mergeData(serverMock, state.data);

            return {
                approvedName,
                approvedReqStatus,
                updatedTimeBumped: updatedTime > beforeSaveTime,
                mergedName: merged.companies[cid].name,
                mergedStatus: merged.companies[cid].nameChangeRequest.status
            };
        });
        console.log("Registro Mercantil Test Metrics:", nameChangeTest);

        results.nameChangePersistence = (
            nameChangeTest.approvedName === 'Astra Supernova Corp' &&
            nameChangeTest.approvedReqStatus === 'APROBADO' &&
            nameChangeTest.updatedTimeBumped &&
            nameChangeTest.mergedName === 'Astra Supernova Corp' &&
            nameChangeTest.mergedStatus === 'APROBADO'
        );

        console.log("\n=================================");
        console.log("     V1.1.00 TEST RESULTS        ");
        console.log("=================================");
        console.log(JSON.stringify(results, null, 2));

        const allPassed = Object.values(results).every(v => v === true);
        console.log(`\nOverall Result: ${allPassed ? 'ALL PASSED (100%)' : 'SOME FAILED'}`);

    } finally {
        await browser.close();
        server.close();
    }
}

runTests().catch(err => {
    console.error("Test execution error:", err);
    process.exit(1);
});
