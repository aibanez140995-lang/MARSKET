const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const PORT = 3002;
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

async function runAudit() {
    console.log("===============================================================");
    console.log("  MARS-KET 2.0 (v1.1.00) · ÁRBITRO ADVERSARIAL DE QA Y SEGURIDAD ");
    console.log("===============================================================\n");

    const server = startServer();
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });

    const report = {
        timestamp: new Date().toISOString(),
        gates: {}
    };

    // -------------------------------------------------------------
    // P1 · Contención de Escritorio y Tablet (Desktop Box Containment)
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P1: Contención de Escritorio y Tablet ---");
    const p1Viewports = [
        { name: '1440x900', w: 1440, h: 900 },
        { name: '1920x1080', w: 1920, h: 1080 },
        { name: '768x1024', w: 768, h: 1024 }
    ];
    const p1Results = [];
    let p1ScrollHeightOk = false;

    for (const vp of p1Viewports) {
        const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
        await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);

        const metrics = await page.evaluate(() => {
            const el = document.getElementById('login-box');
            const screen = document.getElementById('login-screen');
            if (!el || !screen) return null;
            const r = el.getBoundingClientRect();
            const vpW = window.innerWidth;
            const vpH = window.innerHeight;
            const leftDist = r.left;
            const rightDist = vpW - r.right;
            const isCentered = Math.abs(leftDist - rightDist) <= 8;
            return {
                width: Math.round(r.width),
                isWidthLeq480: r.width <= 480,
                left: Math.round(leftDist),
                right: Math.round(rightDist),
                isCentered,
                scrollHeight: screen.scrollHeight,
                innerHeight: vpH,
                noVerticalScroll: screen.scrollHeight <= vpH + 2
            };
        });

        p1Results.push({ viewport: vp.name, ...metrics });
        if (vp.name === '1440x900') {
            p1ScrollHeightOk = metrics.noVerticalScroll;
        }
        await page.close();
    }

    const p1Pass = p1Results.every(r => r.isWidthLeq480 && r.isCentered) && p1ScrollHeightOk;
    report.gates.P1 = {
        status: p1Pass ? 'PASS' : 'FAIL',
        details: p1Results,
        p1ScrollHeightOk,
        evidence: `Mediciones de width: ${p1Results.map(r => `${r.viewport}: ${r.width}px (centrado: ${r.isCentered})`).join(', ')}. ScrollHeight 1440x900: ${p1Results[0]?.scrollHeight}px vs innerHeight: ${p1Results[0]?.innerHeight}px.`
    };
    console.log(`P1 Status: ${report.gates.P1.status}\n`);

    // -------------------------------------------------------------
    // P2 · Scanline Láser Fullscreen (Detrás del Login)
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P2: Scanline Láser Fullscreen ---");
    const p2Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p2Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await p2Page.waitForTimeout(300);

    const p2Metrics = await p2Page.evaluate(() => {
        const layer = document.querySelector('.login-scanline-layer');
        const beam = document.querySelector('.login-laser-beam');
        const box = document.getElementById('login-box');
        if (!layer || !beam || !box) return null;
        const rLayer = layer.getBoundingClientRect();
        const csLayer = window.getComputedStyle(layer);
        const csBeam = window.getComputedStyle(beam);
        const csBox = window.getComputedStyle(box);

        const zLayer = parseInt(csLayer.zIndex) || 0;
        const zBox = parseInt(csBox.zIndex) || 0;

        return {
            layerWidth: Math.round(rLayer.width),
            layerHeight: Math.round(rLayer.height),
            vpWidth: window.innerWidth,
            vpHeight: window.innerHeight,
            coversViewport: Math.round(rLayer.width) === window.innerWidth && Math.round(rLayer.height) === window.innerHeight,
            pointerEventsNone: csLayer.pointerEvents === 'none',
            layerZIndex: zLayer,
            boxZIndex: zBox,
            zIndexCorrect: zLayer < zBox,
            animationName: csBeam.animationName,
            usesTransform: csBeam.transform !== 'none' || csBeam.willChange.includes('transform'),
            willChange: csBeam.willChange
        };
    });

    const p2Pass = p2Metrics && p2Metrics.coversViewport && p2Metrics.pointerEventsNone && p2Metrics.zIndexCorrect && p2Metrics.animationName !== 'none';
    report.gates.P2 = {
        status: p2Pass ? 'PASS' : 'FAIL',
        metrics: p2Metrics,
        evidence: `Capa scanline: ${p2Metrics?.layerWidth}x${p2Metrics?.layerHeight} (vp: ${p2Metrics?.vpWidth}x${p2Metrics?.vpHeight}), pointer-events: ${p2Metrics?.pointerEventsNone}, z-index layer: ${p2Metrics?.layerZIndex} < box: ${p2Metrics?.boxZIndex}, anim: ${p2Metrics?.animationName}.`
    };
    await p2Page.close();
    console.log(`P2 Status: ${report.gates.P2.status}\n`);

    // -------------------------------------------------------------
    // P3 · Hardening de PINs en Llavero Maestro
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P3: Hardening de PINs en Llavero Maestro ---");
    const p3Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p3Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await p3Page.waitForTimeout(300);

    // Login as COORD_ALEX
    await p3Page.evaluate(() => {
        state.user = { admin: true, role: 'COORD_ALEX', coId: null };
        auth.buildNav(true);
        ui.adminTab = 'startups';
        ui.render();
    });
    await p3Page.waitForTimeout(300);

    const p3InitialAudit = await p3Page.evaluate(() => {
        const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"]'));
        const allPassword = pinInputs.length > 0 && pinInputs.every(i => i.type === 'password');
        const toggleBtn = document.getElementById('toggle-pins-btn');
        return {
            totalPinInputs: pinInputs.length,
            allPassword,
            toggleBtnExists: Boolean(toggleBtn),
            btnTextInitial: toggleBtn ? toggleBtn.innerText : ''
        };
    });

    // Click toggle button
    await p3Page.click('#toggle-pins-btn');
    await p3Page.waitForTimeout(200);

    const p3AfterToggle = await p3Page.evaluate(() => {
        const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"]'));
        const allText = pinInputs.length > 0 && pinInputs.every(i => i.type === 'text');
        const toggleBtn = document.getElementById('toggle-pins-btn');
        return {
            allText,
            btnTextAfterFirstToggle: toggleBtn ? toggleBtn.innerText : ''
        };
    });

    // Click toggle button again
    await p3Page.click('#toggle-pins-btn');
    await p3Page.waitForTimeout(200);

    const p3AfterSecondToggle = await p3Page.evaluate(() => {
        const pinInputs = Array.from(document.querySelectorAll('input[id^="pin-input-"]'));
        const allPasswordAgain = pinInputs.length > 0 && pinInputs.every(i => i.type === 'password');
        const toggleBtn = document.getElementById('toggle-pins-btn');
        return {
            allPasswordAgain,
            btnTextAfterSecondToggle: toggleBtn ? toggleBtn.innerText : ''
        };
    });

    // Inspect state.data.companies for plaintext PINs
    const p3VaultAudit = await p3Page.evaluate(() => {
        const companies = state.data.companies || {};
        const plainPinFindings = [];
        const vaultEncryptedFindings = [];

        for (const cid in companies) {
            const co = companies[cid];
            for (const r in co.roles || {}) {
                const val = co.roles[r];
                if (val !== 'PROTECTED') {
                    plainPinFindings.push({ cid, role: r, value: val });
                }
            }
            const vaultRoles = co.authVault?.roles || {};
            for (const r in vaultRoles) {
                const enc = vaultRoles[r];
                if (!String(enc).startsWith('VLT_')) {
                    vaultEncryptedFindings.push({ cid, role: r, value: enc });
                }
            }
        }
        return {
            plainPinFindings,
            vaultEncryptedFindings,
            allProtected: plainPinFindings.length === 0,
            allVaultPrefixed: vaultEncryptedFindings.length === 0
        };
    });

    const p3Pass = p3InitialAudit.allPassword && p3AfterToggle.allText && p3AfterSecondToggle.allPasswordAgain && p3VaultAudit.allProtected && p3VaultAudit.allVaultPrefixed;
    report.gates.P3 = {
        status: p3Pass ? 'PASS' : 'FAIL',
        initialPassword: p3InitialAudit.allPassword,
        firstToggleToText: p3AfterToggle.allText,
        secondToggleToPassword: p3AfterSecondToggle.allPasswordAgain,
        stateAllProtected: p3VaultAudit.allProtected,
        stateAllVaultPrefixed: p3VaultAudit.allVaultPrefixed,
        plainPinFindings: p3VaultAudit.plainPinFindings,
        evidence: `Total inputs PIN: ${p3InitialAudit.totalPinInputs}. Estado inicial: password (${p3InitialAudit.allPassword}). Toggle 1: text (${p3AfterToggle.allText}). Toggle 2: password (${p3AfterSecondToggle.allPasswordAgain}). co.roles con PIN en texto plano: ${p3VaultAudit.plainPinFindings.length}.`
    };
    await p3Page.close();
    console.log(`P3 Status: ${report.gates.P3.status}\n`);

    // -------------------------------------------------------------
    // P4 · Persistencia Estricta del Registro Mercantil (Anti-Rollback D1)
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P4: Persistencia Estricta del Registro Mercantil ---");
    const p4Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p4Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await p4Page.waitForTimeout(300);

    // 1. As CEO of Astra, submit name change to "NOVA AEROSPACE"
    await p4Page.evaluate(() => {
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        auth.buildNav(false);
        ui.promptRequestNameChange();
        const inpName = document.getElementById('req-new-name');
        const inpReason = document.getElementById('req-name-reason');
        if (inpName) inpName.value = 'NOVA AEROSPACE';
        if (inpReason) inpReason.value = 'Evolución de estrategia y marca orbital';
        ui.submitNameChangeRequest();
    });
    await p4Page.waitForTimeout(200);

    // 2. As COORD_ALEX, approve request
    const p4ApprovalResult = await p4Page.evaluate(async () => {
        state.user = { admin: true, role: 'COORD_ALEX', coId: null };
        const timeBefore = Date.now();
        ui.resolveNameChangeRequest('astra', true);
        const co = state.data.companies.astra;
        return {
            nameAfterApproval: co.name,
            requestStatus: co.nameChangeRequest?.status,
            updatedAt: co.updatedAt,
            updatedRecently: co.updatedAt >= timeBefore
        };
    });

    // 3. Force fetchFromCloud and reload
    await p4Page.evaluate(async () => {
        await state.fetchFromCloud();
    });
    await p4Page.reload({ waitUntil: 'domcontentloaded' });
    await p4Page.waitForTimeout(500);

    const p4PostReloadCheck = await p4Page.evaluate(() => {
        const co = state.data.companies.astra;
        return {
            persistedName: co.name,
            requestStatus: co.nameChangeRequest?.status,
            nameChangeApproved: co.name === 'NOVA AEROSPACE' && co.nameChangeRequest?.status === 'APROBADO'
        };
    });

    const p4Pass = p4ApprovalResult.nameAfterApproval === 'NOVA AEROSPACE' && p4PostReloadCheck.nameChangeApproved;
    report.gates.P4 = {
        status: p4Pass ? 'PASS' : 'FAIL',
        nameAfterApproval: p4ApprovalResult.nameAfterApproval,
        requestStatusAfterApproval: p4ApprovalResult.requestStatus,
        persistedNameAfterReload: p4PostReloadCheck.persistedName,
        persistedStatusAfterReload: p4PostReloadCheck.requestStatus,
        evidence: `Nombre tras aprobación: "${p4ApprovalResult.nameAfterApproval}" (${p4ApprovalResult.requestStatus}). Tras recarga y fetchFromCloud: "${p4PostReloadCheck.persistedName}" (${p4PostReloadCheck.requestStatus}).`
    };
    await p4Page.close();
    console.log(`P4 Status: ${report.gates.P4.status}\n`);

    // -------------------------------------------------------------
    // P5 · Reset de Fábrica con Código Maestro (JOVE2025) y Limpieza de Marca
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P5: Reset de Fábrica con Código Maestro ---");
    const p5Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p5Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await p5Page.waitForTimeout(300);

    // Setup dirty state before reset
    const p5SetupCheck = await p5Page.evaluate(() => {
        state.user = { admin: true, role: 'COORD_ALEX', coId: null };
        const co = state.data.companies.astra;
        co.logo = 'test_logo_dirty.png';
        co.slogan = 'Slogan Sucio de Prueba';
        co.valueProposition = 'Propuesta de valor sucia';
        co.balance = 9999.00;
        co.orders = [{ id: 'ORD-DIRTY-1', total: 500 }];
        co.brandApproval = { status: 'PENDIENTE', pendingLogo: 'pending.png', pendingSlogan: 'Pending Slogan' };
        co.deliverables.preliminaryReport = { url: 'http://dirty', grade: 10 };

        state.data.b2bMarket = [{ id: 'B2B-DIRTY' }];
        state.data.b2bContracts = [{ id: 'CTR-DIRTY' }];
        state.data.securityIncidents = [{ id: 'SEC-DIRTY' }];
        state.data.suggestionsToAlex = [{ id: 'SUG-DIRTY' }];
        state.data.telemetry = { totalLogins: 42, sessions: [{ id: 'SES-1' }] };

        return {
            preLogo: co.logo,
            preSlogan: co.slogan,
            preValProp: co.valueProposition,
            preBalance: co.balance,
            preOrdersLen: co.orders.length,
            preVersion: state.data.version || 1
        };
    });

    // Attempt reset with WRONG code "1234"
    const p5WrongCodeResult = await p5Page.evaluate(() => {
        ui.promptFactoryResetLaunch();
        const input = document.getElementById('factory-reset-key');
        if (input) input.value = '1234';
        ui.verifyAndConfirmFactoryReset();
        // Check that company data was NOT reset
        const co = state.data.companies.astra;
        return {
            logoStillDirty: co.logo === 'test_logo_dirty.png',
            balanceStillDirty: co.balance === 9999.00,
            ordersStillDirty: co.orders.length === 1
        };
    });

    // Execute reset with CORRECT code "JOVE2025"
    const p5CorrectResetResult = await p5Page.evaluate(async (preVersion) => {
        ui.promptFactoryResetLaunch();
        const input = document.getElementById('factory-reset-key');
        if (input) input.value = 'JOVE2025';
        ui.verifyAndConfirmFactoryReset();
        // trigger direct execution of factoryResetLaunch
        await ui.factoryResetLaunch();

        const co = state.data.companies.astra;
        const arrays13 = [
            'orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions',
            'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications',
            'sanctions', 'crisisAlerts', 'cart', 'bom'
        ];
        const arraysLengths = {};
        arrays13.forEach(a => {
            arraysLengths[a] = Array.isArray(co[a]) ? co[a].length : -1;
        });
        const all13Empty = arrays13.every(a => arraysLengths[a] === 0);

        const deliverablesKeys = Object.keys(co.deliverables || {});
        const deliverablesCount = deliverablesKeys.length;
        const allDeliverablesNull = deliverablesCount === 19 && deliverablesKeys.every(k => co.deliverables[k] === null);

        const globalEmpties = {
            b2bMarketLen: (state.data.b2bMarket || []).length,
            b2bContractsLen: (state.data.b2bContracts || []).length,
            securityIncidentsLen: (state.data.securityIncidents || []).length,
            suggestionsToAlexLen: (state.data.suggestionsToAlex || []).length,
            telemetrySessionsLen: (state.data.telemetry?.sessions || []).length,
            telemetryTotalLogins: state.data.telemetry?.totalLogins
        };

        const hasVaultCredentials = Boolean(co.authVault?.code && Object.keys(co.authVault?.roles || {}).length > 0);
        const nameAndClassPreserved = Boolean(co.name && co.classGroup);

        return {
            balance: co.balance,
            logo: co.logo,
            slogan: co.slogan,
            valueProposition: co.valueProposition,
            brandApprovalPendingLogo: co.brandApproval ? co.brandApproval.pendingLogo : null,
            brandApprovalExists: Boolean(co.brandApproval),
            arraysLengths,
            all13Empty,
            deliverablesCount,
            allDeliverablesNull,
            globalEmpties,
            hasVaultCredentials,
            nameAndClassPreserved,
            newVersion: state.data.version,
            versionBumped50: (state.data.version >= (preVersion + 50))
        };
    }, p5SetupCheck.preVersion);

    const p5Conditions = {
        cond1_companiesKept: p5CorrectResetResult.hasVaultCredentials && p5CorrectResetResult.nameAndClassPreserved,
        cond2_balance2400: p5CorrectResetResult.balance === 2400,
        cond2_logoNull: p5CorrectResetResult.logo === null,
        cond2_sloganEmpty: p5CorrectResetResult.slogan === '',
        cond2_valuePropEmpty: p5CorrectResetResult.valueProposition === '',
        cond2_pendingLogoNull: p5CorrectResetResult.brandApprovalPendingLogo === null,
        cond2_all13Empty: p5CorrectResetResult.all13Empty,
        cond2_19DeliverablesNull: p5CorrectResetResult.allDeliverablesNull,
        cond3_b2bMarketEmpty: p5CorrectResetResult.globalEmpties.b2bMarketLen === 0,
        cond3_b2bContractsEmpty: p5CorrectResetResult.globalEmpties.b2bContractsLen === 0,
        cond3_securityIncidentsEmpty: p5CorrectResetResult.globalEmpties.securityIncidentsLen === 0,
        cond3_suggestionsToAlexEmpty: p5CorrectResetResult.globalEmpties.suggestionsToAlexLen === 0,
        cond3_telemetrySessionsEmpty: p5CorrectResetResult.globalEmpties.telemetrySessionsLen === 0,
        cond3_totalLoginsZero: p5CorrectResetResult.globalEmpties.telemetryTotalLogins === 0,
        cond4_versionBumped50: p5CorrectResetResult.versionBumped50
    };

    const p5Pass = Object.values(p5Conditions).every(Boolean) && p5WrongCodeResult.logoStillDirty;
    report.gates.P5 = {
        status: p5Pass ? 'PASS' : 'FAIL',
        wrongCodeAborts: p5WrongCodeResult.logoStillDirty,
        conditions: p5Conditions,
        results: p5CorrectResetResult,
        evidence: `Reset con "1234" abortó sin borrar: ${p5WrongCodeResult.logoStillDirty}. Con "JOVE2025": balance=2400 (${p5Conditions.cond2_balance2400}), logo=null (${p5Conditions.cond2_logoNull}, valor=${p5CorrectResetResult.logo}), slogan="" (${p5Conditions.cond2_sloganEmpty}, valor="${p5CorrectResetResult.slogan}"), valProp="" (${p5Conditions.cond2_valuePropEmpty}), 13 arrays len=0 (${p5Conditions.cond2_all13Empty}, ledger=${p5CorrectResetResult.arraysLengths.ledger}), 19 deliverables=null (${p5Conditions.cond2_19DeliverablesNull}), b2bMarket len=0 (${p5Conditions.cond3_b2bMarketEmpty}, len=${p5CorrectResetResult.globalEmpties.b2bMarketLen}), version bump +50 (${p5Conditions.cond4_versionBumped50}, newVersion=${p5CorrectResetResult.newVersion}).`
    };
    await p5Page.close();
    console.log(`P5 Status: ${report.gates.P5.status}\n`);

    // -------------------------------------------------------------
    // P6 · Versión 1.1.00, Changelog Único y Cache-Busting
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P6: Versión 1.1.00, Changelog Único y Cache-Busting ---");
    const cfgCode = fs.readFileSync('js/config.js', 'utf8');
    const indexHtml = fs.readFileSync('index.html', 'utf8');

    // 1. APP_VERSION === '1.1.00'
    const vMatch = cfgCode.match(/const APP_VERSION\s*=\s*["']([^"']+)["']/);
    const appVersion = vMatch ? vMatch[1] : null;

    // 2. APP_CHANGELOG.length === 1 and APP_CHANGELOG[0].version === '1.1.00'
    let changelogCheck = { length: 0, firstVersion: null, has10x: false };
    const p6Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    await p6Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    changelogCheck = await p6Page.evaluate(() => {
        const cl = typeof APP_CHANGELOG !== 'undefined' ? APP_CHANGELOG : [];
        const has10 = cl.some(c => c.version && c.version.startsWith('1.0.'));
        return {
            length: cl.length,
            firstVersion: cl[0]?.version,
            has10x: has10
        };
    });
    await p6Page.close();

    // 3. Script tags in index.html ending in ?v=1.1.00
    const scriptSrcMatches = Array.from(indexHtml.matchAll(/<script src="([^"]+)"/g)).map(m => m[1]);
    const scriptsEndingCorrectly = scriptSrcMatches.length > 0 && scriptSrcMatches.every(src => src.endsWith('?v=1.1.00'));

    const p6Pass = appVersion === '1.1.00' && changelogCheck.length === 1 && changelogCheck.firstVersion === '1.1.00' && !changelogCheck.has10x && scriptsEndingCorrectly;
    report.gates.P6 = {
        status: p6Pass ? 'PASS' : 'FAIL',
        appVersion,
        changelogCheck,
        scriptTagsCount: scriptSrcMatches.length,
        scriptsEndingCorrectly,
        evidence: `APP_VERSION: "${appVersion}". APP_CHANGELOG length: ${changelogCheck.length}, versión: "${changelogCheck.firstVersion}", rastros 1.0.X: ${changelogCheck.has10x}. Total scripts: ${scriptSrcMatches.length}, todos con ?v=1.1.00: ${scriptsEndingCorrectly}.`
    };
    console.log(`P6 Status: ${report.gates.P6.status}\n`);

    // -------------------------------------------------------------
    // P7 · Puertas Heredadas de Pantalla de Acceso Limpia (v1.0.19b)
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P7: Pantalla de Acceso Limpia y CLS ---");
    const p7Viewports = [
        { name: '375x667', w: 375, h: 667 },
        { name: '390x844', w: 390, h: 844 },
        { name: '393x852', w: 393, h: 852 },
        { name: '320x568', w: 320, h: 568 }
    ];
    const p7ViewportResults = [];

    for (const vp of p7Viewports) {
        const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } });
        await page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(300);

        const res = await page.evaluate(() => {
            const header = document.getElementById('hud-header');
            const nav = document.getElementById('hud-nav');
            const screen = document.getElementById('login-screen');
            const footer = document.querySelector('footer');
            const csHeader = header ? window.getComputedStyle(header) : null;
            const csNav = nav ? window.getComputedStyle(nav) : null;
            const csFooter = footer ? window.getComputedStyle(footer) : null;

            const headerHidden = !header || csHeader.display === 'none';
            const navHidden = !nav || csNav.display === 'none';
            const footerHidden = !footer || csFooter.display === 'none';

            const scrollHStep1 = screen ? screen.scrollHeight : 0;
            const innerH = window.innerHeight;
            const noScrollStep1 = scrollHStep1 <= innerH + 2;

            // Step 2 check: validate code to move to step 2
            auth.verifiedCoId = 'astra';
            ui.render();

            const scrollHStep2 = screen ? screen.scrollHeight : 0;
            const noScrollStep2 = scrollHStep2 <= innerH + 2;

            // Reset back
            auth.verifiedCoId = null;
            ui.render();

            return {
                headerHidden,
                navHidden,
                footerHidden,
                scrollHStep1,
                scrollHStep2,
                innerH,
                noScrollStep1,
                noScrollStep2
            };
        });

        // Specific test for 320px
        let l3Checks = null;
        if (vp.w === 320) {
            l3Checks = await page.evaluate(() => {
                const btn = document.querySelector('button[onclick*="validateCompanyCode"]');
                const input = document.getElementById('login-company-code');
                if (!btn || !input) return null;
                const rBtn = btn.getBoundingClientRect();
                const csInput = window.getComputedStyle(input);
                const btnSingleLine = btn.scrollHeight <= btn.clientHeight + 2;
                return {
                    btnHeight: Math.round(rBtn.height),
                    btnHeightGe44: rBtn.height >= 44,
                    btnSingleLine,
                    inputFontSize: parseFloat(csInput.fontSize),
                    inputFontSizeGe16: parseFloat(csInput.fontSize) >= 16
                };
            });
        }

        p7ViewportResults.push({ viewport: vp.name, ...res, l3Checks });
        await page.close();
    }

    // CLS Full Cycle Test
    const clsPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await clsPage.addInitScript(() => {
        window.__clsScore = 0;
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        window.__clsScore += entry.value;
                    }
                }
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        } catch(e) {}
    });

    await clsPage.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await clsPage.waitForTimeout(400);

    // Step 1 -> Step 2
    await clsPage.evaluate(() => {
        auth.verifiedCoId = 'astra';
        ui.render();
    });
    await clsPage.waitForTimeout(300);

    // Step 2 -> App
    await clsPage.evaluate(() => {
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        auth.buildNav(false);
        ui.navigate('orders');
    });
    await clsPage.waitForTimeout(400);

    // App -> Logout -> Login
    await clsPage.evaluate(() => {
        auth.logout();
    });
    await clsPage.waitForTimeout(400);

    const fullCycleCls = await clsPage.evaluate(() => window.__clsScore || 0);
    await clsPage.close();

    const p7L1L2Pass = p7ViewportResults.every(r => r.headerHidden && r.navHidden && (r.viewport === '320x568' || (r.noScrollStep1 && r.noScrollStep2)));
    const p7L3 = p7ViewportResults.find(r => r.viewport === '320x568')?.l3Checks;
    const p7L3Pass = p7L3 && p7L3.btnHeightGe44 && p7L3.btnSingleLine && p7L3.inputFontSizeGe16;
    const p7ClsPass = fullCycleCls <= 0.02;

    const p7Pass = p7L1L2Pass && p7L3Pass && p7ClsPass;
    report.gates.P7 = {
        status: p7Pass ? 'PASS' : 'FAIL',
        l1l2Pass: p7L1L2Pass,
        l3Pass: p7L3Pass,
        l3Metrics: p7L3,
        fullCycleCls,
        clsPass: p7ClsPass,
        evidence: `L1/L2 cabecera/nav/footer ocultos y scroll: ${p7L1L2Pass}. L3 en 320px: btnHeight=${p7L3?.btnHeight}px (>=44), singleLine=${p7L3?.btnSingleLine}, fontSize=${p7L3?.inputFontSize}px (>=16). CLS ciclo completo: ${fullCycleCls} (umbral <= 0.02, pass: ${p7ClsPass}).`
    };
    console.log(`P7 Status: ${report.gates.P7.status}\n`);

    // -------------------------------------------------------------
    // P8 · Integridad de Código y Cero Regresiones
    // -------------------------------------------------------------
    console.log("--- EVALUANDO P8: Integridad de Código y Cero Regresiones ---");
    const p8Page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const p8Errors = [];
    p8Page.on('console', msg => {
        if (msg.type() === 'error') {
            const txt = msg.text();
            if (!txt.includes('ERR_NAME_NOT_RESOLVED') && !txt.includes('favicon')) {
                p8Errors.push({ text: txt, location: msg.location() });
            }
        }
    });
    p8Page.on('pageerror', err => {
        p8Errors.push({ text: err.message, stack: err.stack });
    });

    await p8Page.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await p8Page.waitForTimeout(300);

    // 1. Traverse 8 teacher tabs
    await p8Page.evaluate(() => {
        state.user = { admin: true, role: 'COORD_ALEX', coId: null };
        auth.buildNav(true);
        ui.navigate('admin');
    });
    const adminTabs = ['dash', 'eval', 'startups', 'telemetry', 'hr', 'catalog', 'settings', 'backups'];
    for (const tab of adminTabs) {
        await p8Page.evaluate((t) => {
            ui.adminTab = t;
            ui.render();
        }, tab);
        await p8Page.waitForTimeout(100);
    }

    // 2. Traverse all 7 student profiles & views
    const studentRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
    for (const r of studentRoles) {
        await p8Page.evaluate((role) => {
            state.user = { admin: false, role, coId: 'astra' };
            auth.buildNav(false);
            ui.render();
        }, r);
        await p8Page.waitForTimeout(100);
    }

    // 3. Fallback logo.png when co.logo === null
    const logoFallbackCheck = await p8Page.evaluate(() => {
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        state.data.companies.astra.logo = null;
        auth.buildNav(false);
        ui.navigate('orders');
        const heroImg = document.querySelector('.hex-clip img');
        return {
            heroImgSrc: heroImg ? heroImg.getAttribute('src') : null,
            fallbackWorks: heroImg ? heroImg.getAttribute('src') === 'logo.png' : false
        };
    });

    const p8Pass = p8Errors.length === 0 && logoFallbackCheck.fallbackWorks;
    report.gates.P8 = {
        status: p8Pass ? 'PASS' : 'FAIL',
        consoleErrorsCount: p8Errors.length,
        consoleErrors: p8Errors,
        logoFallbackCheck,
        evidence: `Errores console.error en navegación por las 8 pestañas docentes y 7 roles de empresa: ${p8Errors.length}. Fallback de logo cuando co.logo===null: src="${logoFallbackCheck.heroImgSrc}" (pass: ${logoFallbackCheck.fallbackWorks}).`
    };
    await p8Page.close();
    console.log(`P8 Status: ${report.gates.P8.status}\n`);

    // -------------------------------------------------------------
    // Resumen Final
    // -------------------------------------------------------------
    await browser.close();
    server.close();

    console.log("===============================================================");
    console.log("              MATRIZ DE AUDITORÍA EJECUTADA                   ");
    console.log("===============================================================");
    for (const g in report.gates) {
        console.log(`[${g}] ${report.gates[g].status} -> ${report.gates[g].evidence}`);
    }

    fs.writeFileSync('scratch/arbitro_v1100_results.json', JSON.stringify(report, null, 2));
}

runAudit().catch(err => {
    console.error("FATAL ERROR IN ARBITRO AUDIT:", err);
    process.exit(1);
});
