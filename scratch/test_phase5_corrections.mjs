// scratch/test_phase5_corrections.mjs
import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

console.log('=== TEST 1: resetEpoch UNCONDITIONAL PURGE ===');
// Emulate browser environment
globalThis.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
globalThis.sessionStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
};
globalThis.ui = {
    renderAllCalled: false,
    renderCalled: false,
    renderAll() { this.renderAllCalled = true; },
    render() { this.renderCalled = true; },
    showToast(msg, type) { this.lastToast = { msg, type }; }
};

// Load state.js
const stateCode = fs.readFileSync('js/state.js', 'utf8');
const configCode = fs.readFileSync('js/config.js', 'utf8');
eval(configCode + '; globalThis.INITIAL_DATA = INITIAL_DATA; globalThis.DELIVERABLES_DEF = DELIVERABLES_DEF;');
eval(stateCode + '; globalThis.state = state;');

// Set local epoch to 100
localStorage.setItem('marsket_reset_epoch', '100');
localStorage.setItem('marsket_session', 'session_data_abc');
localStorage.setItem('marsket_user_role', 'coordinador');
localStorage.setItem('marsket_orphan_key', 'orphan_data_to_purge');

state.data = { companies: { astra: { name: 'Astra Dirty', orders: [{ id: 999 }] } } };
const serverData = {
    version: 10,
    resetEpoch: 200, // Higher than 100
    companies: { astra: { name: 'Astra Clean', balance: 1000, orders: [] } }
};

// Call mergeData
const merged = state.mergeData(serverData, state.data);

// Verifications
if (localStorage.getItem('marsket_orphan_key')) {
    throw new Error('FAIL: orphan_data_to_purge was not cleared from localStorage');
}
if (localStorage.getItem('marsket_session') !== 'session_data_abc') {
    throw new Error('FAIL: session was not preserved in localStorage');
}
if (localStorage.getItem('marsket_user_role') !== 'coordinador') {
    throw new Error('FAIL: user_role was not preserved in localStorage');
}
if (localStorage.getItem('marsket_reset_epoch') !== '200') {
    throw new Error('FAIL: reset_epoch was not updated to 200');
}
if (merged.companies.astra.orders.length !== 0) {
    throw new Error('FAIL: orders were additively merged instead of destructively replaced');
}
if (!ui.renderAllCalled) {
    throw new Error('FAIL: ui.renderAll was not called');
}
console.log('PASS: resetEpoch unconditional purge verified cleanly!');

console.log('\n=== TEST 2: window.exportBadgePDF SECURITY EXCEPTION ===');
globalThis.window = globalThis;
const uiDocMgmtCode = fs.readFileSync('js/ui-docente-management.js', 'utf8');
eval(uiDocMgmtCode);

// Test non-authorized role
state.user = { role: 'propulsion' };
let threwNonAuth = false;
try {
    window.exportBadgePDF();
} catch (err) {
    if (err.message && err.message.includes('SECURITY_EXCEPTION')) {
        threwNonAuth = true;
    }
}
if (!threwNonAuth) {
    throw new Error('FAIL: window.exportBadgePDF did not throw SECURITY_EXCEPTION for propulsion role');
}
console.log('PASS: Non-coordinator role threw SECURITY_EXCEPTION as required!');

// Test authorized coordinator role
state.user = { role: 'coordinador' };
let threwAuth = false;
ui.printCredentialCards = () => { return 'PRINT_TRIGGERED'; };
try {
    const res = window.exportBadgePDF();
    if (res !== 'PRINT_TRIGGERED') throw new Error('FAIL: printCredentialCards not called');
} catch (err) {
    threwAuth = true;
}
if (threwAuth) {
    throw new Error('FAIL: window.exportBadgePDF threw exception for coordinador role');
}
console.log('PASS: Coordinator role authorized successfully!');

console.log('\n=== TEST 3: CATALOG OPTIMISTIC LOCKING (PATCH & DELETE) ===');
import('../functions/api/catalog/[id].js').then(async (mod) => {
    const { onRequestPatch, onRequestDelete } = mod;

    const mockDb = {
        stateRecord: {
            version: 5,
            catalog: [
                { id: 'F01', name: 'Botella PET', price: 97.0, stock: 10 }
            ]
        },
        prepare(sql) {
            return {
                first: async () => ({ data: JSON.stringify(mockDb.stateRecord) }),
                bind(...args) {
                    return {
                        run: async () => {
                            mockDb.stateRecord = JSON.parse(args[0]);
                            return { meta: { changes: 1 } };
                        }
                    };
                }
            };
        }
    };

    // 1. Missing version in PATCH
    let res = await onRequestPatch({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'PATCH',
            body: JSON.stringify({ price: 100 })
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 400) throw new Error(`Expected 400 for missing version, got ${res.status}`);

    // 2. Conflict in PATCH (client sends version 4, server is at 5)
    res = await onRequestPatch({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'PATCH',
            body: JSON.stringify({ version: 4, changes: { price: 100 } })
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 409) throw new Error(`Expected 409 CONFLICT for outdated version, got ${res.status}`);
    const json409 = await res.json();
    if (json409.error !== 'CONFLICT' || json409.serverVersion !== 5) {
        throw new Error('Expected CONFLICT with serverVersion: 5');
    }

    // 3. Success in PATCH (client sends version 5)
    res = await onRequestPatch({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'PATCH',
            body: JSON.stringify({ version: 5, changes: { price: 105.0 } })
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 200) throw new Error(`Expected 200 for matching version, got ${res.status}`);
    if (mockDb.stateRecord.version !== 6 || mockDb.stateRecord.catalog[0].price !== 105.0) {
        throw new Error('State was not updated to version 6 with price 105');
    }
    console.log('PASS: PATCH optimistic concurrency (400, 409, 200) verified!');

    // 4. Missing version in DELETE
    res = await onRequestDelete({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'DELETE',
            body: JSON.stringify({})
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 400) throw new Error(`Expected 400 for missing version in DELETE, got ${res.status}`);

    // 5. Conflict in DELETE (client sends version 5, server is at 6)
    res = await onRequestDelete({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'DELETE',
            body: JSON.stringify({ version: 5 })
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 409) throw new Error(`Expected 409 for outdated version in DELETE, got ${res.status}`);

    // 6. Success in DELETE (client sends version 6)
    res = await onRequestDelete({
        request: new Request('http://localhost/api/catalog/F01', {
            method: 'DELETE',
            body: JSON.stringify({ version: 6 })
        }),
        env: { MARSKET_DB: mockDb },
        params: { id: 'F01' }
    });
    if (res.status !== 200) throw new Error(`Expected 200 for valid DELETE, got ${res.status}`);
    if (mockDb.stateRecord.version !== 7 || mockDb.stateRecord.catalog.length !== 0) {
        throw new Error('State was not updated to version 7 after delete');
    }
    console.log('PASS: DELETE optimistic concurrency (400, 409, 200) verified!');

    console.log('\n=== TEST 4: API ALIAS re-export update.js ===');
    const updateMod = await import('../functions/api/catalog/update.js');
    if (!updateMod.onRequestPatch || !updateMod.onRequestDelete) {
        throw new Error('FAIL: functions/api/catalog/update.js does not export onRequestPatch and onRequestDelete');
    }
    console.log('PASS: update.js re-exports verified!');

    console.log('\n>>> ALL PHASE 5 REFACTORINGS 100% VERIFIED! <<<');
});
