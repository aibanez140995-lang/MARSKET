// scratch/test_login_1019b.mjs
// Test rig for MARS-KET 2.0 (v1.0.19b) - Capa de Acceso, Zero-Shift Transition, Encaje Móvil y Capturas

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
const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}/index.html`;

const SHOTS_DIR = path.join(ROOT_DIR, 'scratch', 'shots_1019b');
if (!fs.existsSync(SHOTS_DIR)) fs.mkdirSync(SHOTS_DIR, { recursive: true });

// Dev server
let memoryState = null;
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png'
};

const server = http.createServer((req, res) => {
    const parsed = new URL(req.url, `http://localhost:${PORT}`);
    if (parsed.pathname === '/api/reset') {
        memoryState = null;
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ ok: true }));
    }
    if (parsed.pathname === '/api/state') {
        if (req.method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            return res.end(JSON.stringify(memoryState || { status: 'empty' }));
        }
        if (req.method === 'POST') {
            let body = '';
            req.on('data', c => { body += c; });
            req.on('end', () => {
                try {
                    const inc = JSON.parse(body);
                    const nVer = memoryState ? (Number(inc.version || memoryState.version) + 1) : 1;
                    inc.version = nVer;
                    inc.lastUpdated = Date.now();
                    memoryState = inc;
                    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                    return res.end(JSON.stringify({ success: true, version: nVer }));
                } catch(e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: e.message }));
                }
            });
            return;
        }
    }
    let rel = parsed.pathname === '/' ? '/index.html' : parsed.pathname;
    const f = path.normalize(path.join(ROOT_DIR, rel));
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        return res.end('404');
    }
    res.writeHead(200, {
        'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store, no-cache',
        'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(f).pipe(res);
});

await new Promise(r => server.listen(PORT, '127.0.0.1', r));
console.log(`[DEV-SERVER] Activo en http://127.0.0.1:${PORT}`);

const report = {
    timestamp: new Date().toISOString(),
    version: '1.0.19b',
    hudHiddenCheck: {},
    cardFitCheck: {},
    touchTargets: {},
    virtualKeyboard: {},
    offlineNotice: {},
    fullCycleCLS: {},
    screenshots: []
};

try {
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });

    const context = await browser.newContext();
    const page = await context.newPage();

    // -------------------------------------------------------------
    // 1. COMPROBACIÓN DE QUE SIN SESIÓN NO HAY TEXTO DE HUD VISIBLE
    // -------------------------------------------------------------
    console.log("\n--- Comprobando HUD Oculto sin Sesión ---");
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(300);

    const hudVisibility = await page.evaluate(() => {
        const hdr = document.getElementById('hud-header');
        const nav = document.getElementById('hud-nav');
        const ftr = document.getElementById('hud-footer');
        const vp = document.getElementById('viewport');
        const loginScreen = document.getElementById('login-screen');

        const isVisible = (el) => {
            if (!el) return false;
            const r = el.getBoundingClientRect();
            if (r.width === 0 && r.height === 0) return false;
            const cs = window.getComputedStyle(el);
            return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
        };

        const forbiddenStrings = ['ENTITY:', 'ROLE:', 'SALDO:', 'TIME:', '[D1: SYNCED]', '[D1: OFFLINE]', 'v1.0.19b'];
        const textFound = [];
        // Buscar si algún texto prohibido está visible fuera de login-screen
        for (const s of forbiddenStrings) {
            const el = Array.from(document.querySelectorAll('*')).find(node => {
                if (node.closest('#login-screen') || node.closest('#modal-overlay')) return false;
                if (!isVisible(node)) return false;
                return node.innerText && node.innerText.includes(s);
            });
            if (el) textFound.push({ term: s, tag: el.tagName, id: el.id, text: el.innerText.trim() });
        }

        return {
            headerDisplay: hdr ? window.getComputedStyle(hdr).display : null,
            navDisplay: nav ? window.getComputedStyle(nav).display : null,
            footerDisplay: ftr ? window.getComputedStyle(ftr).display : null,
            viewportDisplay: vp ? window.getComputedStyle(vp).display : null,
            viewportEmpty: vp ? vp.innerHTML.trim() === '' : false,
            loginScreenVisible: isVisible(loginScreen),
            forbiddenTextFound: textFound,
            hasMarsketLogoInLogin: !!document.querySelector('#login-screen #marsket-logo')
        };
    });

    report.hudHiddenCheck = {
        status: (hudVisibility.headerDisplay === 'none' && hudVisibility.navDisplay === 'none' && hudVisibility.footerDisplay === 'none' && hudVisibility.forbiddenTextFound.length === 0 && hudVisibility.loginScreenVisible && hudVisibility.hasMarsketLogoInLogin) ? "CORRECTO" : "FALLO",
        details: hudVisibility
    };
    console.log("HUD Oculto Veredicto:", report.hudHiddenCheck.status);

    // -------------------------------------------------------------
    // 2. ENCAJE SIN SCROLL VERTICAL (375x667, 390x844, 393x852)
    // -------------------------------------------------------------
    console.log("\n--- Comprobando Encaje de Tarjeta en Móviles ---");
    const testViewports = [
        { name: '375x667', w: 375, h: 667 },
        { name: '390x844', w: 390, h: 844 },
        { name: '393x852', w: 393, h: 852 }
    ];

    const fitResults = [];
    for (const vp of testViewports) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        await page.goto(BASE_URL, { waitUntil: 'load' });
        await page.waitForTimeout(200);

        // Paso 1
        const p1Fit = await page.evaluate(() => {
            const screen = document.getElementById('login-screen');
            const box = document.getElementById('login-box');
            const title = document.getElementById('login-title');
            const btn = screen ? screen.querySelector('button') : null;
            const rBox = box ? box.getBoundingClientRect() : null;
            const rBtn = btn ? btn.getBoundingClientRect() : null;

            return {
                screenScrollHeight: screen ? screen.scrollHeight : 0,
                screenClientHeight: screen ? screen.clientHeight : 0,
                hasVerticalScroll: screen ? screen.scrollHeight > screen.clientHeight : false,
                boxWidth: rBox ? Math.round(rBox.width) : 0,
                boxHeight: rBox ? Math.round(rBox.height) : 0,
                btnHeight: rBtn ? Math.round(rBtn.height) : 0,
                btnText: btn ? btn.innerText.trim() : '',
                btnLineHeight: btn ? window.getComputedStyle(btn).lineHeight : '',
                titleWidth: title ? Math.round(title.getBoundingClientRect().width) : 0
            };
        });

        // Pasar a Paso 2 introduciendo AST-1010
        await page.fill('#login-company-code', 'AST-1010');
        await page.click('#login-box button');
        await page.waitForTimeout(250);

        // Paso 2
        const p2Fit = await page.evaluate(() => {
            const screen = document.getElementById('login-screen');
            const box = document.getElementById('login-box');
            const keypad = document.getElementById('login-keypad');
            const rBox = box ? box.getBoundingClientRect() : null;
            const rKeypad = keypad ? keypad.getBoundingClientRect() : null;

            return {
                screenScrollHeight: screen ? screen.scrollHeight : 0,
                screenClientHeight: screen ? screen.clientHeight : 0,
                hasVerticalScroll: screen ? screen.scrollHeight > screen.clientHeight : false,
                boxHeight: rBox ? Math.round(rBox.height) : 0,
                keypadVisible: !!rKeypad && rKeypad.height > 0
            };
        });

        fitResults.push({
            viewport: vp.name,
            step1: p1Fit,
            step2: p2Fit,
            passStep1: !p1Fit.hasVerticalScroll,
            passStep2: !p2Fit.hasVerticalScroll
        });
    }

    const allFitPass = fitResults.every(r => r.passStep1 && r.passStep2);
    report.cardFitCheck = {
        status: allFitPass ? "CORRECTO" : "FALLO",
        results: fitResults
    };
    console.log("Encaje Móvil Veredicto:", report.cardFitCheck.status);

    // -------------------------------------------------------------
    // 3. TEXTO A 320px Y BOTÓN EN UNA LÍNEA
    // -------------------------------------------------------------
    console.log("\n--- Comprobando Ancho 320px y Línea Única de Botón ---");
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(200);

    const fit320 = await page.evaluate(() => {
        const screen = document.getElementById('login-screen');
        const box = document.getElementById('login-box');
        const title = document.getElementById('login-title');
        const btn = screen ? screen.querySelector('button') : null;
        const input = document.getElementById('login-company-code');
        const rBtn = btn ? btn.getBoundingClientRect() : null;

        return {
            horizontalOverflow: screen ? screen.scrollWidth > screen.clientWidth : false,
            titleOverflow: title ? title.scrollWidth > title.clientWidth : false,
            btnHeight: rBtn ? Math.round(rBtn.height) : 0,
            btnWidth: rBtn ? Math.round(rBtn.width) : 0,
            btnText: btn ? btn.innerText.trim() : '',
            inputFontSize: input ? window.getComputedStyle(input).fontSize : '',
            inputTouchTarget: input ? input.getBoundingClientRect().height : 0
        };
    });

    console.log("Comprobación 320px:", fit320);

    // -------------------------------------------------------------
    // 4. TOUCH TARGETS Y ESTILO DE FOCO
    // -------------------------------------------------------------
    console.log("\n--- Comprobando Objetivos Táctiles y Foco ---");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(200);

    // Medir controles en Paso 1
    const p1Touch = await page.evaluate(() => {
        const controls = Array.from(document.querySelectorAll('#login-screen button, #login-screen input'));
        const bad = [];
        for (const el of controls) {
            const r = el.getBoundingClientRect();
            if (r.width < 44 || r.height < 44) {
                bad.push({ tag: el.tagName, id: el.id, w: r.width, h: r.height });
            }
        }
        return { bad, total: controls.length };
    });

    // Medir controles en Paso 2
    await page.fill('#login-company-code', 'AST-1010');
    await page.click('#login-box button');
    await page.waitForTimeout(250);

    const p2Touch = await page.evaluate(() => {
        const controls = Array.from(document.querySelectorAll('#login-screen button, #login-screen select, #login-screen input'));
        const bad = [];
        for (const el of controls) {
            const r = el.getBoundingClientRect();
            if (r.width < 44 || r.height < 44) {
                bad.push({ tag: el.tagName, id: el.id, text: el.innerText ? el.innerText.trim() : '', w: r.width, h: r.height });
            }
        }
        return { bad, total: controls.length };
    });

    report.touchTargets = {
        status: (p1Touch.bad.length === 0 && p2Touch.bad.length === 0) ? "CORRECTO" : "FALLO",
        step1: p1Touch,
        step2: p2Touch
    };
    console.log("Touch Targets Veredicto:", report.touchTargets.status);

    // -------------------------------------------------------------
    // 5. TECLADO VIRTUAL EMULADO
    // -------------------------------------------------------------
    console.log("\n--- Comprobando Teclado Virtual Emulado ---");
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.setViewportSize({ width: 393, height: 500 }); // Altura reducida emulando teclado
    await page.focus('#login-company-code');
    await page.waitForTimeout(200);

    const kbdCheck = await page.evaluate(() => {
        const input = document.getElementById('login-company-code');
        const btn = document.querySelector('#login-box button');
        const rInput = input ? input.getBoundingClientRect() : null;
        const rBtn = btn ? btn.getBoundingClientRect() : null;
        const vh = window.innerHeight;

        const isInputVisible = rInput && rInput.top >= 0 && rInput.bottom <= vh;
        const isBtnVisible = rBtn && rBtn.top >= 0 && rBtn.bottom <= vh;

        return {
            windowInnerHeight: vh,
            inputRect: rInput ? { top: Math.round(rInput.top), bottom: Math.round(rInput.bottom) } : null,
            btnRect: rBtn ? { top: Math.round(rBtn.top), bottom: Math.round(rBtn.bottom) } : null,
            inputVisible: isInputVisible,
            btnVisible: isBtnVisible
        };
    });

    report.virtualKeyboard = {
        status: (kbdCheck.inputVisible && kbdCheck.btnVisible) ? "CORRECTO" : "CORRECTO_CON_SCROLL",
        details: kbdCheck
    };
    console.log("Teclado Virtual Veredicto:", report.virtualKeyboard.status);

    // -------------------------------------------------------------
    // 6. AVISO DE CONEXIÓN OFFLINE EN TARJETA
    // -------------------------------------------------------------
    console.log("\n--- Comprobando Aviso de Conexión Offline ---");
    await page.setViewportSize({ width: 390, height: 844 });
    // Interceptar /api/state para simular caída de red al entrar
    await page.route('**/api/state', route => route.abort());
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.waitForTimeout(400);

    const offlineCheck = await page.evaluate(() => {
        const notice = document.getElementById('login-offline-notice');
        if (!notice) return { found: false };
        const cs = window.getComputedStyle(notice);
        const p = notice.querySelector('p');
        return {
            found: true,
            visible: cs.display !== 'none',
            text: notice.innerText.trim(),
            ariaLive: notice.getAttribute('aria-live'),
            fontSize: p ? window.getComputedStyle(p).fontSize : null
        };
    });

    await page.unroute('**/api/state');

    report.offlineNotice = {
        status: (offlineCheck.found && offlineCheck.visible && offlineCheck.ariaLive === 'polite' && offlineCheck.text.includes('MODO LOCAL')) ? "CORRECTO" : "FALLO",
        details: offlineCheck
    };
    console.log("Aviso Offline Veredicto:", report.offlineNotice.status);

    // -------------------------------------------------------------
    // 7. MEDICIÓN DE CLS EN CICLO COMPLETO
    // -------------------------------------------------------------
    console.log("\n--- Midiendo CLS en Ciclo Completo ---");
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.setViewportSize({ width: 393, height: 852 });

    await page.evaluate(() => {
        window.__layoutShifts = [];
        window.__clsScore = 0;
        const observer = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    window.__clsScore += entry.value;
                    window.__layoutShifts.push({
                        value: entry.value,
                        sources: (entry.sources || []).map(s => ({
                            nodeTag: s.node ? s.node.tagName : '',
                            nodeId: s.node ? s.node.id : '',
                            previousRect: s.previousRect,
                            currentRect: s.currentRect
                        }))
                    });
                }
            }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
    });

    // 1. Carga inicial en Paso 1
    await page.waitForTimeout(200);

    // 2. Paso 1 -> Paso 2 (Validar AST-1010)
    await page.fill('#login-company-code', 'AST-1010');
    await page.click('#login-box button');
    await page.waitForTimeout(250);

    // 3. Paso 2 -> Login (Introducir PIN 1234 de CEO)
    await page.selectOption('#login-role', 'CEO');
    await page.click('#login-keypad button:has-text("1")');
    await page.click('#login-keypad button:has-text("2")');
    await page.click('#login-keypad button:has-text("3")');
    await page.click('#login-keypad button:has-text("4")');
    await page.waitForTimeout(400); // Esperar animación de entrada (120ms + 200ms fade)

    // 4. Navegación por 2 pestañas dentro de la app
    const tabMarket = await page.$('button.nav-tab:has-text("SUPERMARS-KET")');
    if (tabMarket) await tabMarket.click();
    await page.waitForTimeout(200);

    const tabOrders = await page.$('button.nav-tab:has-text("Bóveda Órdenes")');
    if (tabOrders) await tabOrders.click();
    await page.waitForTimeout(200);

    // 5. Cierre de sesión (Logout -> Login)
    await page.evaluate(() => auth.logout());
    await page.waitForTimeout(300);

    const clsData = await page.evaluate(() => {
        return {
            score: window.__clsScore || 0,
            shiftsCount: window.__layoutShifts.length,
            shifts: window.__layoutShifts
        };
    });

    const clsShiftsSorted = (clsData.shifts || []).sort((a, b) => b.value - a.value);
    report.fullCycleCLS = {
        status: clsData.score <= 0.02 ? "CORRECTO" : "FALLO",
        clsScore: clsData.score,
        topShifts: clsShiftsSorted.slice(0, 3)
    };
    console.log(`CLS Ciclo Completo Veredicto: ${report.fullCycleCLS.status} (Score medido: ${clsData.score})`);

    // -------------------------------------------------------------
    // 8. CAPTURAS DE PANTALLA EN TODOS LOS VIEWPORTS EXIGIDOS
    // -------------------------------------------------------------
    console.log("\n--- Tomando Capturas de Pantalla Exigidas ---");
    const requiredViewports = [
        { name: '320x568', w: 320, h: 568 },
        { name: '375x667', w: 375, h: 667 },
        { name: '393x852', w: 393, h: 852 },
        { name: '768x1024', w: 768, h: 1024 },
        { name: '1440x900', w: 1440, h: 900 }
    ];

    for (const vp of requiredViewports) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        
        // Paso 1
        await page.goto(BASE_URL, { waitUntil: 'load' });
        await page.waitForTimeout(200);
        const shot1Path = path.join(SHOTS_DIR, `login_step1_${vp.name}.png`);
        await page.screenshot({ path: shot1Path });
        report.screenshots.push(`login_step1_${vp.name}.png`);

        // Paso 2
        await page.fill('#login-company-code', 'AST-1010');
        await page.click('#login-box button');
        await page.waitForTimeout(250);
        const shot2Path = path.join(SHOTS_DIR, `login_step2_${vp.name}.png`);
        await page.screenshot({ path: shot2Path });
        report.screenshots.push(`login_step2_${vp.name}.png`);
    }

    // Captura con Teclado Virtual Emulado (393x500)
    await page.setViewportSize({ width: 393, height: 500 });
    await page.goto(BASE_URL, { waitUntil: 'load' });
    await page.focus('#login-company-code');
    await page.waitForTimeout(200);
    const shotKbdPath = path.join(SHOTS_DIR, `login_step1_virtual_keyboard_393x500.png`);
    await page.screenshot({ path: shotKbdPath });
    report.screenshots.push(`login_step1_virtual_keyboard_393x500.png`);

    console.log(`Generadas ${report.screenshots.length} capturas en ${SHOTS_DIR}`);

    await browser.close();

    fs.writeFileSync('scratch/audit_report_1019b.json', JSON.stringify(report, null, 2));
    console.log("\nReporte guardado en scratch/audit_report_1019b.json");

} finally {
    server.close();
}
