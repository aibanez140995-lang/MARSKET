const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const PORT = 3003;
const FILE_URL = `http://127.0.0.1:${PORT}/index.html`;

function startServer() {
    const ROOT_DIR = path.resolve(__dirname, '..');
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
        let rel = u.pathname === '/' ? '/index.html' : u.pathname;
        const f = path.normalize(path.join(ROOT_DIR, rel));
        if (!fs.existsSync(f) || !fs.statSync(f).isFile()) {
            res.writeHead(404);
            return res.end('404');
        }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
        fs.createReadStream(f).pipe(res);
    });
    return new Promise(resolve => srv.listen(PORT, '127.0.0.1', () => resolve(srv)));
}

async function testFix() {
    const srv = await startServer();
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });
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

    // Apply the fix in-page for testing: hide app container when logged out
    await clsPage.evaluate(() => {
        const vp = document.getElementById('viewport');
        const appContainer = vp ? vp.closest('.max-w-7xl') : null;
        if (appContainer) {
            appContainer.id = 'app-container';
            appContainer.classList.add('hidden');
        }

        // Patch setHUDVisibility
        const origSetHUD = ui.setHUDVisibility.bind(ui);
        ui.setHUDVisibility = function(isLoggedIn) {
            origSetHUD(isLoggedIn);
            const ac = document.getElementById('app-container');
            if (ac) {
                if (isLoggedIn) ac.classList.remove('hidden');
                else ac.classList.add('hidden');
            }
        };

        // Patch auth.logout
        const origLogout = auth.logout.bind(auth);
        auth.logout = function() {
            const ac = document.getElementById('app-container');
            if (ac) ac.classList.add('hidden');
            origLogout();
        };
    });

    await clsPage.waitForTimeout(200);

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
    console.log("FULL CYCLE CLS WITH FIX:", fullCycleCls);

    await browser.close();
    srv.close();
}

testFix().catch(console.error);
