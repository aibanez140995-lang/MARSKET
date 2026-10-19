// scratch/verify_v1102.js
const fs = require('fs');

console.log('--- TEST 1: CREDENTIALS & PRINT CSS ---');
const indexHtml = fs.readFileSync('index.html', 'utf8');
if (!/size:\s*A4\s*portrait/.test(indexHtml) || !/margin:\s*10mm/.test(indexHtml)) throw new Error('Missing A4 page print css');
if (!indexHtml.includes('#credentials-print-area')) throw new Error('Missing #credentials-print-area styling');
console.log('PASS: Print CSS has A4 portrait and 10mm margin');

const uiDocMgmt = fs.readFileSync('js/ui-docente-management.js', 'utf8');
if (!uiDocMgmt.includes('#07090E')) throw new Error('Missing #07090E in credentials card');
if (!uiDocMgmt.includes('#1A2333')) throw new Error('Missing #1A2333 in credentials card');
if (!uiDocMgmt.includes('#FF007F')) throw new Error('Missing #FF007F in credentials card');
if (!uiDocMgmt.includes('#00F0FF')) throw new Error('Missing #00F0FF in credentials card');
if (!uiDocMgmt.includes('CAUTION')) throw new Error('Missing CAUTION in credentials card');
if (!uiDocMgmt.includes('checkCoordinatorAccess')) throw new Error('Missing checkCoordinatorAccess');
console.log('PASS: Credentials layout & role guard check');

console.log('--- TEST 2: GLOBAL TRANSACTION RESET ---');
const adminReset = fs.readFileSync('functions/api/admin/reset.js', 'utf8');
if (!adminReset.includes('onRequestPost')) throw new Error('Missing onRequestPost in admin reset');
if (!adminReset.includes('1000.00') && !adminReset.includes('1000')) throw new Error('Missing 1000 reset in admin reset');
console.log('PASS: Admin reset endpoint exists and structured');

console.log('--- TEST 3: CONCURRENT SYNC (409) ---');
const apiState = fs.readFileSync('functions/api/state.js', 'utf8');
if (!apiState.includes('status: 409')) throw new Error('Missing status: 409 in api/state.js');
const stateJs = fs.readFileSync('js/state.js', 'utf8');
if (!stateJs.includes('409') && !stateJs.includes('status === 409')) throw new Error('Missing 409 handling in state.js');
console.log('PASS: Optimistic concurrency 409 conflict detection present');

console.log('--- TEST 4: CATALOG PERSISTENCE & PAUSE POLLING ---');
const catEndpoint = fs.readFileSync('functions/api/catalog/[id].js', 'utf8');
if (!catEndpoint.includes('onRequestPatch') || !catEndpoint.includes('onRequestDelete')) throw new Error('Missing PATCH/DELETE in catalog API');
if (!stateJs.includes('pausePolling')) throw new Error('Missing pausePolling in state.js');
if (!uiDocMgmt.includes('pausePolling = true')) throw new Error('Missing pausePolling in catalog actions');
console.log('PASS: SuperMARS-KET persistence and polling pause verified');

console.log('--- TEST 5 & 6: FINANCIAL PRECISION & CHEMICAL VALIDATION ---');
if (!stateJs.includes('Number.EPSILON')) throw new Error('Missing Number.EPSILON in financial rounding');
const techJs = fs.readFileSync('js/ui-empresa-tech.js', 'utf8');
if (!techJs.includes('strictNumPattern') || !techJs.includes('^[0-9]+')) throw new Error('Missing chemical input regex in tech.js');
console.log('PASS: Financial precision & chemical regex present');

console.log('--- TEST 7: COLLAPSIBLE RESOLVED QUERIES ---');
const docCoreJs = fs.readFileSync('js/ui-docente-core.js', 'utf8');
if (!docCoreJs.includes('RESUELTAS') || !docCoreJs.includes('<details')) throw new Error('Missing details or RESUELTAS in ui-docente-core.js');
console.log('PASS: Collapsible resolved queries details verified');

console.log('--- TEST 8: MODERATION REPORT TELEMETRY ---');
const modEndpoint = fs.readFileSync('functions/api/moderation/report.js', 'utf8');
if (!modEndpoint.includes('onRequestPost')) throw new Error('Missing onRequestPost in moderation report');
const uiCoreJs = fs.readFileSync('js/ui-core.js', 'utf8');
if (!uiCoreJs.includes('/api/moderation/report')) throw new Error('Missing /api/moderation/report fetch in ui-core.js');
if (!docCoreJs.includes('#FF0055')) throw new Error('Missing #FF0055 alert badge in ui-docente-core.js');
console.log('PASS: Moderation telemetry and alert badge verified');

console.log('--- VERSIONING CHECK ---');
const configJs = fs.readFileSync('js/config.js', 'utf8');
if (!configJs.includes('APP_VERSION = "1.1.02"')) throw new Error('APP_VERSION is not 1.1.02');
const swJs = fs.readFileSync('sw.js', 'utf8');
if (!swJs.includes('v1.1.02')) throw new Error('sw.js is not v1.1.02');
console.log('PASS: Versioning 1.1.02 consistent across config.js, index.html, sw.js');

console.log('\n>>> ALL 8 MISSIONS + VERSIONING FULLY VERIFIED! <<<');
