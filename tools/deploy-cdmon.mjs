// tools/deploy-cdmon.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Credenciales por variables de entorno (en GitHub: Settings > Secrets > Actions).
const FTP_HOST = process.env.FTP_HOST;
const FTP_USER = process.env.FTP_USER;
const FTP_PASS = process.env.FTP_PASS;
const BASE_REMOTE = '/web';
const CURL_BIN = process.platform === 'win32' ? 'curl.exe' : 'curl';

if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
    console.error('[DEPLOY] Faltan variables de entorno FTP_HOST, FTP_USER o FTP_PASS.');
    process.exit(1);
}

const filesToUpload = [
    // Assets & Static
    'logo.png',
    'logo.jpg',
    'loaderio-e04fe1e017d5e583689533102b7d015a.txt',
    'loaderio-e04fe1e017d5e583689533102b7d015a.html',

    // API & Data
    'api/db.php',
    'api/index.php',
    'data/.htaccess',

    // CSS
    'css/tailwind.css',
    'css/input.css',
    'css/fonts/orbitron.woff2',

    // JS (subidos ANTES que index.html y sw.js para evitar condiciones de carrera en caché)
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
    'js/ui-empresa-tech.js',

    // Entrypoints y Service Worker SIEMPRE AL FINAL
    'manifest.json',
    'sw.js',
    'index.html',
    '.htaccess'
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
    const cmd = `${CURL_BIN} -sS --fail --connect-timeout 20 --ftp-create-dirs -T "${relPath}" -u "${FTP_USER}:${FTP_PASS}" "ftp://${FTP_HOST}${remoteTarget}"`;
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
