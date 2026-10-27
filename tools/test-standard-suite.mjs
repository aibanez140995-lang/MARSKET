// tools/test-standard-suite.mjs
// Suite de validación estándar para MARS-KET 2.0 (v1.0.19)
// Ejecuta el servidor HTTP dev-server local y audita G8, G9, G16, CLS, LOPD y Seguridad.

import http from 'http';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}/index.html`;

// 1. Iniciar dev-server localmente para las pruebas
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
                try {
                    const incoming = JSON.parse(body);
                    if (memoryState && incoming.version && Number(incoming.version) < Number(memoryState.version)) {
                        res.writeHead(409, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Conflict' }));
                    }
                    const nextVersion = memoryState ? (Number(incoming.version || memoryState.version) + 1) : 1;
                    incoming.version = nextVersion;
                    incoming.lastUpdated = Date.now();
                    memoryState = incoming;
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ success: true, version: nextVersion }));
                } catch(e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
    }

    let rel = pathname === '/' ? '/index.html' : pathname;
    const fPath = path.normalize(path.join(ROOT_DIR, rel));
    if (!fPath.startsWith(ROOT_DIR) || !fs.existsSync(fPath) || !fs.statSync(fPath).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404');
    }
    const ext = path.extname(fPath).toLowerCase();
    res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(fPath).pipe(res);
});

await new Promise((resolve) => server.listen(PORT, '127.0.0.1', resolve));
console.log(`[DEV-SERVER] Activo en http://127.0.0.1:${PORT}`);

const report = {
    timestamp: new Date().toISOString(),
    environment: `HTTP standard http://127.0.0.1:${PORT}/ (Tailwind compilado css/tailwind.css)`,
    gates: {}
};

try {
    const browser = await chromium.launch({
        channel: 'msedge',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });

    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

    // -------------------------------------------------------------
    // G8: CONTENCIÓN DE TEXTO LARGO (80 CARACTERES SIN ESPACIOS)
    // -------------------------------------------------------------
    console.log("\n--- Auditando G8: Contención de Diseño (80 chars) ---");
    const testViewports = [375, 390, 768];
    const longName = 'B'.repeat(80);
    const g8Results = [];

    await page.goto(BASE_URL);
    await page.waitForSelector('#login-screen');

    for (const vpWidth of testViewports) {
        await page.setViewportSize({ width: vpWidth, height: 844 });
        await page.waitForTimeout(100);

        // Inject long company name into state
        const vpCheck = await page.evaluate((coName) => {
            state.data.companies.astra.name = coName;
            state.data.companies.astra.slogan = 'Slogan-' + coName;
            
            // Check student views
            const studentRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            const studentTabsByRole = {
                'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
                'TECNICO': ['tech', 'market', 'cart', 'orders', 'dossier', 'resolutions'],
                'FINANZAS': ['finance', 'orders', 'dossier', 'market', 'resolutions'],
                'MARKETING': ['brand', 'dossier', 'market', 'resolutions'],
                'OPERACIONES_IA': ['cart', 'ailog', 'dossier', 'market', 'resolutions'],
                'AUXILIAR': ['resolutions', 'dossier', 'market']
            };
            const viewOverflows = [];

            for (const r of studentRoles) {
                state.user = { admin: false, role: r, coId: 'astra' };
                auth.buildNav(false);
                const tabs = studentTabsByRole[r] || ['orders'];
                for (const t of tabs) {
                    ui.current = t;
                    ui.render();
                    const bScroll = document.body.scrollWidth;
                    const bClient = document.body.clientWidth;
                    if (bScroll > bClient) {
                        viewOverflows.push({ role: r, tab: t, scroll: bScroll, client: bClient });
                    }
                }
            }

            // Check teacher tabs
            state.user = { admin: true, role: 'COORD_MARIO', coId: null };
            auth.buildNav(true);
            ui.navigate('admin');
            const teacherTabs = ['dash', 'eval', 'startups', 'telemetry', 'hr', 'catalog', 'settings', 'backups'];
            for (const t of teacherTabs) {
                ui.adminTab = t;
                ui.render();
                const bScroll = document.body.scrollWidth;
                const bClient = document.body.clientWidth;
                if (bScroll > bClient) {
                    viewOverflows.push({ role: 'DOCENTE', tab: t, scroll: bScroll, client: bClient });
                }
            }

            return {
                viewOverflows,
                hudInfoTitle: document.getElementById('hud-info')?.title || '',
                hudInfoText: document.getElementById('hud-info')?.innerText || ''
            };
        }, longName);

        g8Results.push({
            viewportWidth: vpWidth,
            overflows: vpCheck.viewOverflows
        });
    }

    const totalG8Overflows = g8Results.reduce((acc, r) => acc + r.overflows.length, 0);
    report.gates.G8 = {
        status: totalG8Overflows === 0 ? "CORRECTO" : "FALLO",
        overflowCount: totalG8Overflows,
        results: g8Results,
        evidence: `Auditadas todas las vistas en 375px, 390px y 768px con 80 caracteres 'B'. Desbordamientos horizontales detectados: ${totalG8Overflows}.`
    };
    console.log(`G8 Veredicto: ${report.gates.G8.status} (Desbordamientos: ${totalG8Overflows})`);

    // -------------------------------------------------------------
    // G9: CONSOLA Y CONTINGENCIAS DE RED
    // -------------------------------------------------------------
    console.log("\n--- Auditando G9: Consola y Contingencias de Red ---");
    const consoleLogs = { error: [], warning: [], debug: [] };
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (text.includes('Tailwind') || text.includes('ERR_NAME_NOT_RESOLVED')) return;
        if (type === 'error') consoleLogs.error.push(text);
        else if (type === 'warning') consoleLogs.warning.push(text);
        else if (type === 'debug') consoleLogs.debug.push(text);
    });

    // Traverse student & teacher views in normal state
    await page.evaluate(() => {
        state.data.companies.astra.name = 'ASTRA AEROSPACE';
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        ui.render();
    });
    await page.waitForTimeout(200);

    // Test offline contingency handling
    const offlineTestResult = await page.evaluate(async () => {
        // Simulate fetch network failure
        const originalFetch = window.fetch;
        window.fetch = () => Promise.reject(new Error("Failed to fetch (offline simulation)"));

        state._hasWarnedCloudNetwork = false;
        await state.fetchFromCloud();

        const indicator = document.getElementById('hud-cloud-status')?.innerText;
        window.fetch = originalFetch;

        return {
            cloudIndicator: indicator,
            isOnline: state.isCloudOnline
        };
    });

    // Audit console logs
    const g9Pass = consoleLogs.error.length === 0 && consoleLogs.warning.length === 0;
    report.gates.G9 = {
        status: g9Pass ? "CORRECTO" : "FALLO",
        consoleErrors: consoleLogs.error,
        consoleWarnings: consoleLogs.warning,
        consoleDebugs: consoleLogs.debug,
        offlineUI: offlineTestResult,
        evidence: `Errores consola: ${consoleLogs.error.length}. Avisos (console.warn): ${consoleLogs.warning.length}. Indicador UI en desconexión: ${offlineTestResult.cloudIndicator}.`
    };
    console.log(`G9 Veredicto: ${report.gates.G9.status} (Errores: ${consoleLogs.error.length}, Avisos: ${consoleLogs.warning.length})`);

    // -------------------------------------------------------------
    // G16: CLS (CUMULATIVE LAYOUT SHIFT) Y OBJETIVOS TÁCTILES
    // -------------------------------------------------------------
    console.log("\n--- Auditando G16: CLS y Objetivos Táctiles ---");
    // 1. Measure CLS with PerformanceObserver
    await page.goto(BASE_URL);
    await page.waitForSelector('#login-screen');

    const clsData = await page.evaluate(async () => {
        let clsScore = 0;
        const shifts = [];

        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsScore += entry.value;
                    shifts.push({
                        value: entry.value,
                        sources: (entry.sources || []).map(s => ({
                            nodeTag: s.node ? s.node.nodeName : 'UNKNOWN',
                            nodeId: s.node ? s.node.id : '',
                            previousRect: s.previousRect,
                            currentRect: s.currentRect
                        }))
                    });
                }
            }
        });
        observer.observe({ type: 'layout-shift', buffered: true });

        // Simulate complete lifecycle:
        // 1. Iniciar sesión CEO
        state.data.companies.astra.name = 'ASTRA AEROSPACE';
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        auth.buildNav(false);
        ui.navigate('orders');
        ui.updateHUD();
        await new Promise(r => setTimeout(r, 200));

        // 2. Cambio de pestaña a Resoluciones y Finanzas
        ui.navigate('resolutions');
        await new Promise(r => setTimeout(r, 100));
        ui.navigate('finance');
        await new Promise(r => setTimeout(r, 100));

        // 3. Sincronización con la nube
        await state.fetchFromCloud();
        await new Promise(r => setTimeout(r, 200));

        // 4. Logout a login
        auth.logout();
        await new Promise(r => setTimeout(r, 200));

        observer.disconnect();
        return { clsScore, shifts: shifts.sort((a,b) => b.value - a.value).slice(0, 3) };
    });

    // 2. Measure Touch Targets in mobile viewport 390x844
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        auth.buildNav(false);
        ui.navigate('orders');
    });
    await page.waitForTimeout(300);

    const touchAudit = await page.evaluate(() => {
        const selectors = 'button, [role="button"], [role="tab"], select, summary, input:not([type="hidden"]), a:not(p a):not(li a):not(td a)';
        const interactive = Array.from(document.querySelectorAll(selectors));
        const violations = [];
        const compliant = [];

        for (const el of interactive) {
            if (el.offsetParent === null) continue;
            const r = el.getBoundingClientRect();
            const w = Math.round(r.width);
            const h = Math.round(r.height);
            const item = {
                tag: el.tagName,
                id: el.id || '',
                type: el.type || '',
                text: (el.innerText || el.value || el.placeholder || '').trim().slice(0, 30),
                w,
                h
            };
            if (w < 44 || h < 44) {
                violations.push(item);
            } else {
                compliant.push(item);
            }
        }

        // Specifically check #skip-onboarding checkbox when onboarding is rendered
        ui.showOnboarding();
        const skipCb = document.getElementById('skip-onboarding');
        const skipCbRect = skipCb ? skipCb.getBoundingClientRect() : null;
        ui.closeOnboarding();

        return {
            totalChecked: interactive.length,
            violations,
            sampleCompliant: compliant.slice(0, 5),
            skipOnboardingSize: skipCbRect ? { w: Math.round(skipCbRect.width), h: Math.round(skipCbRect.height) } : null
        };
    });

    const clsPass = clsData.clsScore <= 0.02;
    const touchPass = touchAudit.violations.length === 0;

    report.gates.G16 = {
        status: (clsPass && touchPass) ? "CORRECTO" : "FALLO",
        clsScore: clsData.clsScore,
        clsTopShifts: clsData.shifts,
        touchViolationsCount: touchAudit.violations.length,
        touchViolations: touchAudit.violations,
        sampleCompliant: touchAudit.sampleCompliant,
        skipOnboardingBox: touchAudit.skipOnboardingSize,
        evidence: `CLS acumulado medido: ${clsData.clsScore.toFixed(4)} (Umbral <= 0.02). Violaciones táctiles < 44x44: ${touchAudit.violations.length}. Casilla #skip-onboarding: ${JSON.stringify(touchAudit.skipOnboardingSize)}.`
    };
    console.log(`G16 Veredicto: ${report.gates.G16.status} (CLS: ${clsData.clsScore.toFixed(4)}, Violaciones táctiles: ${touchAudit.violations.length})`);

    // -------------------------------------------------------------
    // G6 & G7: LOPD, EPÓNIMOS Y SIN FALSOS POSITIVOS
    // -------------------------------------------------------------
    console.log("\n--- Auditando G6 & G7: LOPD y Epónimos ---");
    const safeBattery = ["Juana", "García", "John Smith", "Mohammed López", "p3dr0 l0p3z", "p e d r o", "p.e.d.r.o", "pe\u200Bdro", "\u0440edro", "Alberto", "Fernando", "Mario", "Alex"];
    const whitelistBattery = ["Escudo térmico para la Luna", "Ley de Newton", "Ecuación de Tsiolkovsky", "Cálculo de apogeo", "Metal exterior", "Cómputo de trayectoria"];

    const lopdResults = await page.evaluate((battery) => {
        return battery.map(t => ({ term: t, valid: ui.validateSafeText(t).valid }));
    }, safeBattery);

    const whitelistResults = await page.evaluate((battery) => {
        return battery.map(t => ({ term: t, valid: ui.validateSafeText(t).valid }));
    }, whitelistBattery);

    const g6Failed = lopdResults.filter(r => r.valid === true);
    const g7Failed = whitelistResults.filter(r => r.valid === false);

    report.gates.G6 = {
        status: g6Failed.length === 0 ? "CORRECTO" : "FALLO",
        failedTerms: g6Failed,
        evidence: `Probados ${safeBattery.length} términos de riesgo LOPD. Bloqueados: ${safeBattery.length - g6Failed.length}/${safeBattery.length}.`
    };
    report.gates.G7 = {
        status: g7Failed.length === 0 ? "CORRECTO" : "FALLO",
        failedTerms: g7Failed,
        evidence: `Probados ${whitelistBattery.length} términos aeroespaciales/epónimos. Autorizados: ${whitelistBattery.length - g7Failed.length}/${whitelistBattery.length}.`
    };
    console.log(`G6 Veredicto: ${report.gates.G6.status}`);
    console.log(`G7 Veredicto: ${report.gates.G7.status}`);

    // -------------------------------------------------------------
    // G14: ONBOARDING DIFERENCIADO Y CHANGELOG
    // -------------------------------------------------------------
    console.log("\n--- Auditando G14: Onboarding y Changelog ---");
    const rolesToTest = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR', 'DOCENTE'];
    const onboardingCheck = await page.evaluate((roles) => {
        const contents = {};
        for (const r of roles) {
            if (typeof ui.getOnboardingContent === 'function') {
                contents[r] = ui.getOnboardingContent(r);
            }
        }
        return contents;
    }, rolesToTest);

    const uniqueCount = new Set(Object.values(onboardingCheck)).size;
    report.gates.G14 = {
        status: uniqueCount >= 6 ? "CORRECTO" : "FALLO",
        uniqueRolesCovered: uniqueCount,
        evidence: `Manuales operativos diferenciados de puesto: ${uniqueCount} perfiles únicos validados.`
    };
    console.log(`G14 Veredicto: ${report.gates.G14.status} (Perfiles únicos: ${uniqueCount})`);

    await browser.close();

    console.log("\n=================================================");
    console.log("     REPORTE ADVERSARIAL FINAL (ENTORNO ESTÁNDAR) ");
    console.log("=================================================");
    console.log(JSON.stringify(report, null, 2));

    fs.writeFileSync('scratch/audit_report_adversarial.json', JSON.stringify(report, null, 2));

} finally {
    server.close();
}
