const { chromium } = require('C:/Users/aiban/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT_DIR = path.resolve(__dirname, '..');
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png'
};

const srv = http.createServer((req, res) => {
    let rel = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const f = path.normalize(path.join(ROOT_DIR, rel));
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) {
        res.writeHead(404);
        return res.end('404');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
});

srv.listen(PORT, '127.0.0.1', async () => {
    try {
        const browser = await chromium.launch({ channel: 'chrome', headless: true });
        const page = await browser.newPage();
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`http://127.0.0.1:${PORT}/index.html`);
        await page.evaluate(() => {
            state.user = { admin: false, role: 'CEO', coId: 'astra' };
            auth.buildNav(false);
            ui.navigate('orders');
        });
        await new Promise(r => setTimeout(r, 400));
        const bad = await page.evaluate(() => {
            const interactive = Array.from(document.querySelectorAll('button, a:not(p a):not(li a):not(td a), input:not([type="hidden"]), select, textarea, [role="button"], [role="tab"]'));
            return interactive.map(el => {
                if (el.offsetParent === null) return null;
                const r = el.getBoundingClientRect();
                return {
                    tag: el.tagName,
                    text: el.innerText ? el.innerText.trim() : '',
                    html: el.outerHTML,
                    parent: el.parentElement ? el.parentElement.outerHTML : '',
                    w: r.width,
                    h: r.height,
                    computedW: window.getComputedStyle(el).width,
                    computedH: window.getComputedStyle(el).height,
                    boxSizing: window.getComputedStyle(el).boxSizing,
                    minWidth: window.getComputedStyle(el).minWidth,
                    minHeight: window.getComputedStyle(el).minHeight
                };
            }).filter(x => x && (x.w < 44 || x.h < 44));
        });
        console.log("BAD ELEMENTS:", JSON.stringify(bad, null, 2));
        await browser.close();
    } finally {
        srv.close();
    }
});
