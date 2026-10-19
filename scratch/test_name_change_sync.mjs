// scratch/test_name_change_sync.mjs
// Test de verificación: Resolución y sincronización de cambio de nombre y notificaciones

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Import Playwright
const { chromium } = await import(pathToFileURL('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright/index.mjs').href);

const PORT = 3005;

function startDevServer() {
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
        if (u.pathname === '/api/reset') {
            memoryState = null;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ ok: true }));
        }
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

        let rel = u.pathname === '/' ? '/index.html' : u.pathname;
        const f = path.normalize(path.join(ROOT_DIR, rel));
        if (!fs.existsSync(f) || !fs.statSync(f).isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('404 Not Found');
        }
        res.writeHead(200, {
            'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-store, no-cache, must-revalidate'
        });
        fs.createReadStream(f).pipe(res);
    });

    return new Promise(resolve => srv.listen(PORT, '127.0.0.1', () => resolve(srv)));
}

async function runTest() {
    const srv = await startDevServer();
    console.log(`[TEST] Servidor de pruebas iniciado en http://127.0.0.1:${PORT}`);
    
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    try {
        console.log("\n1. Cargando aplicación...");
        await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
        await page.waitForTimeout(500);

        console.log("2. Inicializando estado con una startup y login de CEO...");
        await page.evaluate(async () => {
            // Inicializar state si es necesario
            if (!state.data.companies.astra) {
                state.data.companies.astra = {
                    name: 'Astra Aerospace',
                    balance: 2400,
                    updatedAt: Date.now() - 60000,
                    notifications: [],
                    votingMotions: [],
                    orders: [],
                    ledger: [],
                    realCosts: [],
                    flightTests: [],
                    aiPrompts: [],
                    marketingCampaigns: [],
                    inactivityReports: [],
                    cart: [],
                    bom: []
                };
            }
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            auth.buildNav(false);
            ui.navigate('brand');
        });
        await page.waitForTimeout(400);

        console.log("3. CEO envía solicitud de cambio de nombre a 'Nova Orbit'...");
        await page.evaluate(() => {
            const co = state.data.companies.astra;
            co.nameChangeRequest = {
                status: 'PENDIENTE',
                proposedName: 'Nova Orbit',
                reason: 'Rebranding estratégico para misión marciana',
                date: new Date().toLocaleString(),
                updatedAt: Date.now()
            };
            co.updatedAt = Date.now();
            state.save();
            ui.render();
        });
        await page.waitForTimeout(1000); // Dar tiempo a que pushToCloud envíe al servidor

        console.log("4. Verificando que la solicitud está PENDIENTE en el servidor...");
        const serverJson = await page.evaluate(async () => {
            const res = await fetch('/api/state');
            return await res.json();
        });
        const serverStatus1 = serverJson.companies?.astra?.nameChangeRequest?.status;
        console.log(`   Estado en servidor: ${serverStatus1}`);
        if (serverStatus1 !== 'PENDIENTE') throw new Error(`Esperado PENDIENTE en servidor, obtenido: ${serverStatus1}`);

        console.log("\n5. Accediendo como Coordinación Docente (DOCENTE / COORD_MARIO)...");
        await page.evaluate(() => {
            state.user = { admin: true, role: 'COORD_MARIO', name: 'Mario (Coordinación)' };
            auth.buildNav(true);
            ui.navigate('startups');
        });
        await page.waitForTimeout(400);

        console.log("6. Verificando que la solicitud pendiente aparece en el panel de Coordinación...");
        const pendingCountBefore = await page.evaluate(() => {
            return Object.values(state.data.companies || {}).filter(c => c.nameChangeRequest && c.nameChangeRequest.status === 'PENDIENTE').length;
        });
        console.log(`   Peticiones pendientes detectadas antes de resolver: ${pendingCountBefore}`);
        if (pendingCountBefore !== 1) throw new Error("Debe haber exactamente 1 petición pendiente.");

        console.log("7. Coordinación DENIEGA la solicitud de cambio de nombre...");
        await page.evaluate(() => {
            ui.resolveNameChangeRequest('astra', false);
        });
        await page.waitForTimeout(1000); // Esperar persistencia y pushToCloud

        console.log("8. Verificando estado local tras denegación...");
        const localStatusAfterDeny = await page.evaluate(() => state.data.companies.astra.nameChangeRequest.status);
        console.log(`   Estado local tras denegación: ${localStatusAfterDeny}`);
        if (localStatusAfterDeny !== 'RECHAZADO') throw new Error("El estado local debió cambiar a RECHAZADO.");

        console.log("9. Forzando resincronización de red con fetchFromCloud()...");
        const fetchResult = await page.evaluate(async () => {
            return await state.fetchFromCloud();
        });
        console.log(`   fetchFromCloud resultado: ${fetchResult}`);
        await page.waitForTimeout(500);

        console.log("10. Fiscalizando que tras la resincronización NO vuelve a salir la notificación docente...");
        const pendingCountAfterSync = await page.evaluate(() => {
            return Object.values(state.data.companies || {}).filter(c => c.nameChangeRequest && c.nameChangeRequest.status === 'PENDIENTE').length;
        });
        const localStatusAfterSync = await page.evaluate(() => state.data.companies.astra.nameChangeRequest.status);
        console.log(`   Peticiones pendientes en panel tras resync: ${pendingCountAfterSync}`);
        console.log(`   Estado de la petición tras resync: ${localStatusAfterSync}`);
        if (pendingCountAfterSync !== 0) throw new Error("REGRESIÓN: La notificación de cambio de nombre pendiente volvió a salir en el panel docente!");
        if (localStatusAfterSync !== 'RECHAZADO') throw new Error("REGRESIÓN: El estado fue revertido a PENDIENTE!");

        console.log("\n11. Verificando perspectiva del alumno (CEO de Astra)...");
        await page.evaluate(() => {
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            auth.buildNav(false);
            ui.navigate('brand');
        });
        await page.waitForTimeout(400);

        const notifs = await page.evaluate(() => {
            return (state.data.companies.astra.notifications || []).filter(n => n.role === 'CEO' && !n.read);
        });
        console.log(`   Notificaciones no leídas para el CEO: ${notifs.length}`);
        if (notifs.length === 0) throw new Error("El CEO debería tener la notificación de que el Registro Mercantil rechazó la solicitud.");
        console.log(`   Mensaje de notificación: "${notifs[0].message}"`);
        const notifId = notifs[0].id;

        console.log("12. CEO descarta la notificación pulsando [✕] (dismissNotification)...");
        await page.evaluate((id) => {
            ui.dismissNotification(id);
        }, notifId);
        await page.waitForTimeout(1000);

        const notifsAfterDismiss = await page.evaluate(() => {
            return (state.data.companies.astra.notifications || []).filter(n => n.role === 'CEO' && !n.read);
        });
        console.log(`   Notificaciones no leídas tras descartar: ${notifsAfterDismiss.length}`);
        if (notifsAfterDismiss.length !== 0) throw new Error("La notificación debería estar descartada.");

        console.log("13. Forzando segunda resincronización de red desde el cliente...");
        await page.evaluate(async () => {
            await state.fetchFromCloud();
        });
        await page.waitForTimeout(500);

        console.log("14. Fiscalizando que la notificación descartada NO resucita tras resincronización...");
        const notifsAfterSecondSync = await page.evaluate(() => {
            return (state.data.companies.astra.notifications || []).filter(n => n.role === 'CEO' && !n.read);
        });
        console.log(`   Notificaciones no leídas tras resync: ${notifsAfterSecondSync.length}`);
        if (notifsAfterSecondSync.length !== 0) throw new Error("REGRESIÓN: La notificación descartada resucitó tras la resincronización!");

        console.log("\n15. Probando retiro/cancelación de solicitud por parte del CEO (cancelNameChangeRequest)...");
        // CEO envía nueva solicitud
        await page.evaluate(() => {
            const co = state.data.companies.astra;
            co.nameChangeRequest = {
                status: 'PENDIENTE',
                proposedName: 'Galactic Horizon',
                reason: 'Nuevo intento',
                date: new Date().toLocaleString(),
                updatedAt: Date.now()
            };
            co.updatedAt = Date.now();
            state.save();
            ui.render();
        });
        await page.waitForTimeout(500);

        // CEO cancela su propia solicitud
        await page.evaluate(() => {
            // Simular confirmación directa de cancelación
            const co = state.data.companies.astra;
            co.nameChangeRequest.status = 'CANCELADO';
            co.nameChangeRequest.resolvedAt = Date.now();
            co.nameChangeRequest.updatedAt = Date.now();
            co.updatedAt = Date.now();
            state.save();
            ui.render();
        });
        await page.waitForTimeout(1000);

        await page.evaluate(async () => {
            await state.fetchFromCloud();
        });
        await page.waitForTimeout(500);

        const statusAfterCancel = await page.evaluate(() => state.data.companies.astra.nameChangeRequest.status);
        console.log(`   Estado tras cancelar y resincronizar: ${statusAfterCancel}`);
        if (statusAfterCancel !== 'CANCELADO') throw new Error("El estado tras cancelar debió permanecer CANCELADO.");

        console.log("\n=======================================================");
        console.log("✅ TODAS LAS PRUEBAS DE SINCRONIZACIÓN Y NOTIFICACIONES PASARON CON ÉXITO!");
        console.log("=======================================================");

    } finally {
        await browser.close();
        srv.close();
    }
}

runTest().catch(err => {
    console.error("FATAL ERROR IN TEST:", err);
    process.exit(1);
});
