const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');

const PORT = 3002;
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

async function debugCLS() {
    const srv = await startServer();
    const browser = await chromium.launch({
        channel: 'chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-web-security']
    });
    const clsPage = await browser.newPage({ viewport: { width: 390, height: 844 } });
    
    await clsPage.addInitScript(() => {
        window.__clsEntries = [];
        window.__clsScore = 0;
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        window.__clsScore += entry.value;
                        window.__clsEntries.push({
                            value: entry.value,
                            hadRecentInput: entry.hadRecentInput,
                            sources: (entry.sources || []).map(s => ({
                                nodeName: s.node ? s.node.nodeName : null,
                                id: s.node ? s.node.id : null,
                                className: s.node ? s.node.className : null,
                                prevRect: s.previousRect ? { top: s.previousRect.top, height: s.previousRect.height } : null,
                                currRect: s.currentRect ? { top: s.currentRect.top, height: s.currentRect.height } : null
                            }))
                        });
                    }
                }
            });
            observer.observe({ type: 'layout-shift', buffered: true });
        } catch(e) {}
    });

    await clsPage.goto(FILE_URL, { waitUntil: 'domcontentloaded' });
    await clsPage.waitForTimeout(400);

    console.log("--- Phase 1: Step 1 -> Step 2 ---");
    await clsPage.evaluate(() => {
        auth.verifiedCoId = 'astra';
        ui.render();
    });
    await clsPage.waitForTimeout(300);
    let score1 = await clsPage.evaluate(() => window.__clsScore);
    console.log("Score after Step 2:", score1);

    console.log("--- Phase 2: Step 2 -> App (orders) ---");
    await clsPage.evaluate(() => {
        state.user = { admin: false, role: 'CEO', coId: 'astra' };
        auth.buildNav(false);
        ui.navigate('orders');
    });
    await clsPage.waitForTimeout(400);
    let score2 = await clsPage.evaluate(() => window.__clsScore);
    console.log("Score after App:", score2);

    console.log("--- Phase 3: App -> Logout ---");
    await clsPage.evaluate(() => {
        auth.logout();
    });
    await clsPage.waitForTimeout(400);
    let score3 = await clsPage.evaluate(() => window.__clsScore);
    console.log("Score after Logout:", score3);

    const entries = await clsPage.evaluate(() => window.__clsEntries);
    console.log("\n--- Detailed CLS Entries ---");
    console.log(JSON.stringify(entries, null, 2));

    await browser.close();
    srv.close();
}

debugCLS().catch(console.error);
