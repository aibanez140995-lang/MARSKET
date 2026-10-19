const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((req, res) => {
    let rel = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const f = path.normalize(path.join(ROOT_DIR, rel));
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { res.writeHead(404); return res.end('404'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});

(async () => {
    await new Promise(r => srv.listen(3000, '127.0.0.1', r));
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto('http://127.0.0.1:3000/index.html');
    await page.evaluate(() => {
        ui.notify('Error de prueba', 'error');
    });
    await new Promise(r => setTimeout(r, 200));
    const info = await page.evaluate(() => {
        const btn = document.querySelector('button[aria-label="Cerrar aviso"]');
        if (!btn) return 'Not found';
        const r = btn.getBoundingClientRect();
        const cs = window.getComputedStyle(btn);
        return {
            w: r.width,
            h: r.height,
            minWidth: cs.minWidth,
            minHeight: cs.minHeight,
            width: cs.width,
            height: cs.height,
            display: cs.display,
            classes: btn.className,
            matchedRules: Array.from(document.styleSheets).flatMap(s => {
                try {
                    return Array.from(s.cssRules).filter(r => r.selectorText && btn.matches(r.selectorText)).map(r => r.cssText);
                } catch(e) { return []; }
            })
        };
    });
    console.log(JSON.stringify(info, null, 2));
    await browser.close();
    srv.close();
})();
