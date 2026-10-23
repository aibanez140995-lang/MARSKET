// tools/deploy-cdmon.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const FTP_HOST = '185.42.104.199';
const FTP_USER = 'marsketf1';
const FTP_PASS = 'Marsket2026!';
const BASE_REMOTE = '/web';

const filesToUpload = [
    // Root files
    '.htaccess',
    'index.html',
    'manifest.json',
    'sw.js',
    'logo.png',
    'logo.jpg',
    'loaderio-e04fe1e017d5e583689533102b7d015a.txt',
    'loaderio-e04fe1e017d5e583689533102b7d015a.html',

    // API
    'api/db.php',
    'api/index.php',

    // Data
    'data/.htaccess',

    // CSS
    'css/tailwind.css',
    'css/input.css',
    'css/fonts/orbitron.woff2',

    // JS
    'js/lexicon-data.js',
    'js/auth.js',
    'js/config.js',
    'js/state.js',
    'js/ui-core.js',
    'js/ui-docente-core.js',
    'js/ui-docente-eval.js',
    'js/ui-docente-management.js',
    'js/ui-empresa-core.js',
    'js/ui-empresa-finance.js',
    'js/ui-empresa-gov-brand.js',
    'js/ui-empresa-market.js',
    'js/ui-empresa-ops.js',
    'js/ui-empresa-tech.js'
];

console.log(`[DEPLOY] Iniciando despliegue hacia CDMON (${FTP_HOST})...`);
let successCount = 0;
let failCount = 0;

for (const relPath of filesToUpload) {
    if (!fs.existsSync(relPath)) {
        console.warn(`[WARN] Archivo no existe localmente: ${relPath}`);
        continue;
    }
    const remoteTarget = `${BASE_REMOTE}/${relPath.replace(/\\/g, '/')}`;
    const cmd = `curl.exe -s --ftp-create-dirs -T "${relPath}" -u "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}${remoteTarget}"`;
    try {
        execSync(cmd, { stdio: 'pipe' });
        console.log(`[OK] Subido: ${relPath} -> ${remoteTarget}`);
        successCount++;
    } catch (err) {
        console.error(`[FAIL] Error subiendo ${relPath}: ${err.message}`);
        failCount++;
    }
}

console.log(`\n[DEPLOY] Finalizado: ${successCount} archivos subidos con éxito, ${failCount} fallos.`);
