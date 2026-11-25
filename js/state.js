// js/state.js
// --- GESTIÓN DE ESTADO ZERO-TRUST, MIGRACIÓN Y PERSISTENCIA ATÓMICA (v1.1.44) ---

const DEFAULT_STATE = {
    version: 1,
    resetEpoch: 0,
    news: [],
    deletedNewsIds: [],
    printEditions: [],
    printAdLibrary: [],
    deletedPrintEditionIds: [],
    officialNews: [],
    deletedOfficialNewsIds: [],
    deletedCompanyIds: [],
    deletedCatalogIds: [],
    deletedPendingCustomIds: [],
    pressReleases: [],
    b2bMarket: [],
    b2bContracts: [],
    securityIncidents: [],
    suggestionsToAlex: [],
    pendingCustom: [],
    finalContest: {
        finalists: { A: null, B: null, C: null, D: null, E: null, F: null },
        launches: {},
        podium: { first: null, second: null, third: null },
        roleAwards: { CEO: null, TECNICO: null, FINANZAS: null, MARKETING: null, OPERACIONES: null },
        published: false,
        publishedAt: 0,
        updatedAt: 0
    },
    telemetry: { totalLogins: 0, sessions: [] },
        catalog: [
        // 1. Cuerpo del Cohete (Estructura Principal)
        { id: 'F01', name: 'Botella de 500 ml', price: 97.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'España' },
        { id: 'F02', name: 'Botella de 1 L', price: 120.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'España' },
        { id: 'F03', name: 'Botella de 1,5 L', price: 165.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'Portugal' },
        { id: 'F04', name: 'Botella de 2 L', price: 200.0, unit: 'Unidad', category: 'Cuerpo del Cohete (Estructura Principal)', origin: 'Italia' },

        // 2. Propulsión y Reactivos
        { id: 'P01', name: 'Bicarbonato de Sodio', price: 10.0, unit: 'Gramo', category: 'Propulsión y Reactivos', origin: 'España' },
        { id: 'P02', name: 'Vinagre', price: 5.0, unit: '10 ml', category: 'Propulsión y Reactivos', origin: 'España' },

        // 3. Aerodinámica - 3.1 Aletas Estabilizadoras
        { id: 'A01', name: 'Cartulina (Aletas)', price: 15.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },
        { id: 'A02', name: 'Cartón Básico', price: 30.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Portugal' },
        { id: 'A03', name: 'Aletas de Plástico', price: 45.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Alemania' },
        { id: 'A04', name: 'Aletas de PVC Rígido', price: 85.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Polonia' },
        { id: 'A05', name: 'Suplemento: Plastificado de Aletas', price: 5.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },

        // 3. Aerodinámica - 3.2 Puntas / Ojivas
        { id: 'O01', name: 'Punta de Cartulina', price: 25.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'España' },
        { id: 'O02', name: 'Punta de Cartón (Estándar)', price: 55.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'ESA / Francia' },
        { id: 'O03', name: 'Punta de Plástico (PET)', price: 75.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'Alemania' },
        { id: 'O04', name: 'Punta de Plástico 3D', price: 90.0, unit: 'Unidad', category: 'Aerodinámica', origin: 'ESA / Francia' },

        // 4. Sistema de Reacción
        { id: 'R01', name: 'Papel de Cocina', price: 5.0, unit: 'Unidad/Hoja', category: 'Sistema de Reacción', origin: 'España' },
        { id: 'R02', name: 'Hilo de Algodón', price: 2.0, unit: 'Decímetro', category: 'Sistema de Reacción', origin: 'España' },

        // 5. Sellado y Unión (Estanquidad y Montaje)
        { id: 'S01', name: 'Corcho de Vino Estándar', price: 25.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S02', name: 'Tapón de Goma Hermético', price: 40.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'Alemania' },
        { id: 'S03', name: 'Cinta Aislante', price: 10.0, unit: 'Metro', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'Alemania' },
        { id: 'S04', name: 'Celo / Cinta Adhesiva', price: 0.50, unit: 'cm', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S05', name: 'Pegamento de Barra', price: 15.0, unit: 'Unidad', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'España' },
        { id: 'S06', name: 'Carga de Pegamento Termofusible por Uso', price: 1.0, unit: 'Uso', category: 'Sellado y Unión (Estanquidad y Montaje)', origin: 'ESA / Francia' },

        // 6. Elementos Extra
        { id: 'E01', name: 'Pintura', price: 2.0, unit: 'Cada Color', category: 'Elementos Extra', origin: 'España' }
    ],
    config: {
        nextOrderId: 1000,
        scheduleBaselineVersion: 0,
        catalogBaselineVersion: 1131,
        deadlines: typeof DEFAULT_DEADLINES !== 'undefined' ? DEFAULT_DEADLINES : {},
        deliverableSchedule: {},
        guidelines: { techReportDocUrl: "", techReportNotes: "Guía oficial redactada por FYQ." },
        teachers: {
            FYQ: { name: "Física y Química", canSponsor: false },
            ECO: { name: "Economía", canSponsor: false },
            LYE: { name: "Liderazgo y Emprendimiento", canSponsor: false },
            LEN: { name: "Lengua Castellana", canSponsor: false },
            MAT: { name: "Matemáticas", canSponsor: false },
            ING: { name: "Inglés", canSponsor: false },
            COORD_MARIO: { name: "Coordinación - Mario", canSponsor: true },
            COORD_ALEX: { name: "Coordinación - Alex", canSponsor: true }
        }
    },
    companies: {
        astra: {
            name: "Astra Dynamics", balance: 2400, classGroup: 'A', logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "", updatedAt: 0 }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        },
        sandbox_master: {
            name: "MARS-X SANDBOX (PRUEBAS)", balance: 2400, classGroup: 'TEST', isTestCompany: true, unlockAllContracts: true, logo: null, slogan: "BANCO MAESTRO DE PRUEBAS", valueProposition: "Entorno de evaluación y pruebas",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "", updatedAt: 0 }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [],
            ledger: [],
            realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        },
        sandbox_student: {
            name: "MARS-X ALUMNO (ESTÁNDAR)", balance: 2400, classGroup: 'TEST', isTestCompany: true, unlockAllContracts: false, logo: null, slogan: "", valueProposition: "",
            brandApproval: { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "", updatedAt: 0 }, sponsorAwarded: null, sponsorData: { name: null, logo: null },
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [],
            realCosts: [], grades: {}, marketingCampaigns: [], inactivityReports: [], notifications: [], sanctions: [], crisisAlerts: [], bom: [],
            deliverables: {}, contracts: {}
        }
    }
};

const state = {
    data: {}, user: null, currentUser: null, pin: '', sessionData: null,
    storageKey: 'marsket_v10_PWA',
    sessionKey: 'marsket_session_v1',
    isCloudOnline: false, isSyncing: false, syncTimer: null, heartbeatTimer: null,
    pausePolling: false, _broadcastChannel: null, lastETag: null, lastCompanyETag: null, lastCompanyVersion: 0,
    _activePushPromise: null, _pushDirty: false, _warnedStorageQuota: false,
    consecutiveNetworkFailures: 0, isOfflineContained: false, _listenersAttached: false,
    _hasWarnedCloudNetwork: false,
    _clockInterval: null,
    _vaultKey: 'MARS_AEE_2026_SECRET_KEY',
    _adminCredentialsFetched: false,
    _fetchingCredentials: false,

    // WP5: Acceso encapsulado a la estructura reactiva sin congelar state.data
    get(path) {
        if (!path) return this.data;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let curr = this.data;
        for (const k of keys) {
            if (curr == null) return undefined;
            curr = curr[k];
        }
        return curr;
    },

    set(path, value) {
        if (!path) return false;
        const keys = Array.isArray(path) ? path : String(path).split('.');
        let curr = this.data;
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (curr[k] == null || typeof curr[k] !== 'object') {
                curr[k] = {};
            }
            curr = curr[k];
        }
        curr[keys[keys.length - 1]] = value;
        return true;
    },

    calculateBalance(co) {
        if (!co) return 2400.0;
        const INITIAL_CAPITAL = (co.initialBalance !== undefined && co.initialBalance !== null && !isNaN(Number(co.initialBalance)))
            ? Number(co.initialBalance)
            : 2400.0;
        if (!Array.isArray(co.ledger) || co.ledger.length === 0) {
            return INITIAL_CAPITAL;
        }
        const delTxSet = new Set(Array.isArray(co.deletedLedgerTxIds) ? co.deletedLedgerTxIds.map(String) : []);
        const seenTx = new Set();
        let totalDelta = 0;
        for (const tx of co.ledger) {
            const id = String(tx?.id || tx?.tx_id || '');
            if (!id || seenTx.has(id) || delTxSet.has(id)) continue;
            seenTx.add(id);
            const delta = Number(tx.delta);
            if (!isNaN(delta)) {
                totalDelta += delta;
            }
        }
        return Math.round((INITIAL_CAPITAL + totalDelta + Number.EPSILON) * 100) / 100;
    },

    recalculateBalance(co) {
        if (!co) return;
        co.balance = this.calculateBalance(co);
    },

    getDefaultOrbitalReportSeed() {
        const seedImgSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#05070f"/><stop offset="55%" stop-color="#0b1528"/><stop offset="100%" stop-color="#19081c"/></linearGradient><linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00f0ff" stop-opacity="0.38"/><stop offset="100%" stop-color="#00f0ff" stop-opacity="0"/></linearGradient></defs><rect width="1280" height="720" fill="url(#bg)"/><g stroke="#00f0ff" stroke-opacity="0.14" stroke-width="1"><path d="M0 140H1280M0 280H1280M0 420H1280M0 560H1280M213 0V720M426 0V720M640 0V720M853 0V720M1066 0V720"/></g><circle cx="960" cy="360" r="240" fill="url(#glow)"/><g transform="translate(880,115)"><polygon points="80,20 132,165 132,395 28,395 28,165" fill="#0f172a" stroke="#00f0ff" stroke-width="4"/><polygon points="80,20 132,165 28,165" fill="#1e293b" stroke="#00f0ff" stroke-width="3"/><polygon points="28,305 -32,430 28,395" fill="#ff0055" fill-opacity="0.85"/><polygon points="132,305 192,430 132,395" fill="#ff0055" fill-opacity="0.85"/><circle cx="80" cy="240" r="24" fill="#05070f" stroke="#ffb703" stroke-width="4"/><line x1="56" y1="240" x2="104" y2="240" stroke="#ffb703" stroke-width="2"/><line x1="80" y1="216" x2="80" y2="264" stroke="#ffb703" stroke-width="2"/></g><text x="72" y="130" fill="#ffb703" font-family="monospace" font-size="22" font-weight="bold" letter-spacing="4">ÓRBITA. // ARCHIVO AEE</text><text x="72" y="235" fill="#ffffff" font-family="sans-serif" font-size="52" font-weight="900">SECRETOS INDUSTRIALES</text><text x="72" y="305" fill="#00f0ff" font-family="sans-serif" font-size="52" font-weight="900">Y MERCADO B2B</text><text x="72" y="375" fill="#cbd5e1" font-family="monospace" font-size="24">SPACEX vs. EXPOSICION MARS-KET 2.0</text><rect x="72" y="435" width="430" height="58" fill="#05070f" stroke="#00f0ff" stroke-width="2"/><text x="96" y="472" fill="#00f0ff" font-family="monospace" font-size="22" font-weight="bold">E = ALTURA / COSTE • B2B READY</text></svg>`;
        const seedImgUrl = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(seedImgSvg);
        return {
            id: 'NEWS-SEED-MUSK-PATENTS-001',
            seedVersion: 3,
            section: 'industria',
            origin: 'REAL',
            status: 'PUBLISHED',
            editionNumber: 0,
            category: 'PROPIEDAD INDUSTRIAL & B2B',
            categoryEn: 'INDUSTRIAL PROPERTY & B2B',
            title: 'Por qué SpaceX evita registrar patentes: «Publicarlas sería como entregar un libro de recetas»',
            subtitle: 'En la carrera espacial privada, iterar más rápido que la competencia protege mejor que un registro público; qué enseña esta estrategia a los equipos de MARS-KET ante la exhibición final y el mercado B2B.',
            body: 'En la mayoría de las industrias tecnológicas, cada nuevo componente se protege mediante patentes antes incluso de salir del taller. En la nueva economía espacial, sin embargo, esa costumbre suele invertirse. En una entrevista concedida a la revista Wired en 2012, Elon Musk explicó por qué SpaceX opta por no patentar casi ninguno de los diseños de sus cohetes: registrar una patente obliga a publicar planos, tolerancias y procedimientos detallados, lo que frente a programas competidores con respaldo estatal o fuera de la jurisdicción estadounidense equivaldría, según sus palabras, a entregarles «un libro de recetas» gratuito.\n\nEn lugar de confiar la ventaja competitiva a documentos legales difíciles de hacer cumplir entre países, la compañía apostó por el secreto industrial interno y, sobre todo, por una velocidad de rediseño constante. Cuando una empresa modifica sus motores, tanques o aviónica cada pocos meses mediante ensayos reales, quien intente copiar una generación anterior llega tarde al problema que el equipo original ya resolvió en la plataforma siguiente.\n\nEse mismo debate se traslada de forma directa al aula en MARS-KET 2.0. Al final del curso, todas las startups participantes expondrán sus prototipos —en exhibición estática, sin combustible ni tripulación— ante el resto de las clases de 4º ESO. Cualquier equipo rival podrá observar a simple vista la geometría de vuestras aletas estabilizadoras, la forma de la ojiva o el acabado del fuselaje.\n\nPero mirar un prototipo en una mesa no permite reproducir el trabajo invisible que decide el concurso: el equilibrio entre la masa del reactivo, la ausencia total de fugas en las uniones, el registro riguroso en el Libro Mayor y la optimización del índice de eficiencia E = Altura / Coste. Y cuando una pieza probada sobre en vuestro taller tras superar la fase de ensayos, el Mercado Secundario B2B (DOC_9) ofrece la vía idónea para convertir ese excedente técnico en liquidez en euros virtuales antes del cierre contable.',
            titleEn: 'Why SpaceX Avoids Filing Patents: "Publishing Them Would Be Like Handing Out a Recipe Book"',
            subtitleEn: 'In commercial aerospace, fast engineering iteration often outweighs public patent filings—a strategic lesson for MARS-KET startups ahead of our static exhibition and B2B market.',
            bodyEn: 'Across most technology sectors, engineers rush to file patent paperwork before a new component even leaves the lab. In commercial rocketry, however, the logic frequently reverses. Speaking to Wired in 2012, SpaceX chief executive Elon Musk explained why the company holds virtually no patents on its launch vehicles: obtaining a patent requires publishing detailed blueprints and operating specs, which against rival state-backed or overseas programs would amount to providing a free "recipe book."\n\nRather than placing core propulsion and structural details in public legal registries that are difficult to enforce across borders, the company leaned on strict internal trade secrets and rapid hardware iteration. When an engineering team tests, improves, and flies a new revision every few months, anyone attempting to reverse-engineer an older design ends up solving yesterday’s problem.\n\nIn MARS-KET 2.0, every 4th ESO startup encounters a classroom version of that same reality. During our year-end open exhibition—held strictly as a static display without fuel or flight—rival teams from all classes will see your nose cone profile, fin alignment, and airframe craftsmanship up close.\n\nYet spotting a silhouette on a display stand cannot copy the discipline behind your efficiency index E = Height / Cost, your leak-free assembly in the Workshop, or the accuracy of your Ledger. Even better, whenever tested hardware or excess materials remain after R&D flights, listing them on the B2B Secondary Market (DOC_9) allows your team to turn spare parts into vital virtual-euro liquidity before phase close.',
            imageUrl: seedImgUrl,
            sourceName: 'Órbita. / Archivo Wired & SpaceX',
            sourceUrl: 'https://www.spacex.com',
            marsketImpact: 'En la exhibición final sin combustible todos verán vuestros cohetes: la ventaja competitiva real está en vuestro índice E = Altura / Coste, la fiabilidad de ensamblaje y el uso inteligente del Mercado Secundario B2B.',
            marsketImpactEn: 'At the year-end unfueled exhibition every team will see your rocket: your true advantage lies in E = Height / Cost, build reliability, and strategic trading in the B2B Secondary Market.',
            debateQuestion: '¿Tiene más sentido proteger los diseños en secretismo o estandarizar piezas útiles para rentabilizarlas vendiendo excedentes en el Mercado B2B?',
            debateQuestionEn: 'Is it smarter to guard workshop ideas closely, or standardize reliable components so surplus stock sells easily on the B2B Market?',
            publishedAt: 1795420800000,
            updatedAt: 1795420800000,
            publishedDate: '23/11/2026',
            publishedIsoDate: '2026-11-23',
            featured: true,
            phase: 'ALL',
            classGroup: 'ALL',
            coId: null,
            companyName: null,
            author: 'Consejo Editorial AEE'
        };
    },

    _makeEditorialCoverSvg(kicker, line1, line2, accentHex = '#00f0ff', bgHex = '#0b1528') {
        const escSvg = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#05070f"/><stop offset="100%" stop-color="${escSvg(bgHex)}"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><g stroke="${escSvg(accentHex)}" stroke-opacity="0.16" stroke-width="1"><path d="M0 180H1280M0 360H1280M0 540H1280M320 0V720M640 0V720M960 0V720"/></g><circle cx="1020" cy="360" r="190" fill="${escSvg(accentHex)}" fill-opacity="0.12" stroke="${escSvg(accentHex)}" stroke-width="3"/><circle cx="1020" cy="360" r="95" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-dasharray="10 8" stroke-width="2"/><text x="72" y="150" fill="${escSvg(accentHex)}" font-family="monospace" font-size="24" font-weight="bold" letter-spacing="4">${escSvg(kicker)}</text><text x="72" y="290" fill="#ffffff" font-family="sans-serif" font-size="54" font-weight="900">${escSvg(line1)}</text><text x="72" y="365" fill="#e2e8f0" font-family="sans-serif" font-size="40" font-weight="700">${escSvg(line2)}</text><rect x="72" y="460" width="380" height="52" fill="#05070f" stroke="${escSvg(accentHex)}" stroke-width="2"/><text x="92" y="494" fill="${escSvg(accentHex)}" font-family="monospace" font-size="20" font-weight="bold">ÓRBITA. // ARCHIVO AEE</text></svg>`;
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    },

    getEditorialSectionSeeds() {
        const baseTs = 1795420800000;
        const revTs = 1795420800000;
        const make = (id, section, offsetMin, kickerEs, kickerEn, titleEs, subEs, bodyEs, titleEn, subEn, bodyEn, impactEs, impactEn, debateEs, debateEn, svg1, svg2, accent, bg, sourceName, sourceUrl) => ({
            id,
            seedVersion: 3,
            section,
            origin: 'REAL',
            status: 'PUBLISHED',
            editionNumber: 0,
            category: kickerEs,
            categoryEn: kickerEn,
            title: titleEs,
            subtitle: subEs,
            body: bodyEs,
            titleEn,
            subtitleEn: subEn,
            bodyEn,
            imageUrl: this._makeEditorialCoverSvg(kickerEs, svg1, svg2, accent, bg),
            sourceName: sourceName || 'Órbita. / Archivo AEE',
            sourceUrl: sourceUrl || '',
            marsketImpact: impactEs,
            marsketImpactEn: impactEn,
            debateQuestion: debateEs,
            debateQuestionEn: debateEn,
            publishedAt: baseTs - (offsetMin * 60000),
            updatedAt: revTs,
            placementUpdatedAt: baseTs,
            publishedDate: '23/11/2026',
            publishedIsoDate: '2026-11-23',
            placement: 'archive',
            subOrder: 0,
            featured: false,
            phase: 'ALL',
            classGroup: 'ALL',
            coId: null,
            companyName: null,
            author: 'Consejo Editorial AEE'
        });

        return [
            make(
                'SEED-HIST-EMILIO-HERRERA', 'historia', 10,
                'REPORTAJE ESPECIAL · UN POCO DE HISTORIA', 'SPECIAL REPORT · A BIT OF HISTORY',
                'Emilio Herrera y la escafandra estratonáutica de 1935: el traje español que anticipó la conquista espacial',
                'Tres décadas antes de que el ser humano pisara la Luna, el ingeniero granadino resolvió en el laboratorio madrileño de Cuatro Vientos cómo sobrevivir al vacío parcial de la alta atmósfera.',
                'En 1935, mientras la aviación comercial apenas superaba los tres mil metros de altura, el ingeniero militar granadino Emilio Herrera Linares completó en las instalaciones experimentales de Cuatro Vientos, en Madrid, un prototipo que parecía sacado de la ciencia ficción: la escafandra estratonáutica. Su propósito era tan concreto como arriesgado: permitir que un piloto ascendiera en la barquilla abierta de un globo estratosférico hasta unos 26 kilómetros de altitud sin perder el conocimiento ni sufrir la muerte instantánea por descompresión.\n\nA esa altura, la presión atmosférica cae a una fracción mínima respecto al nivel del mar, lo que plantea un problema puramente físico: el punto de ebullición de los líquidos desciende de forma drástica hasta acercarse a la temperatura normal del cuerpo humano. Sin una atmósfera artificial presurizada alrededor del cuerpo, los gases disueltos en la sangre y la humedad pulmonar forman burbujas mortales. Al mismo tiempo, cualquier traje hinchado con aire a presión tendía a quedarse rígido como un neumático, impidiendo al aeronauta doblar un brazo para manejar instrumentos o válvulas de emergencia.\n\nHerrera atacó el problema mecánico con ingenio geométrico. En lugar de coser una tela inflexible, diseñó articulaciones metálicas en acordeón —fuelles flexibles de volumen prácticamente constante— para hombros, codos, caderas y rodillas, cubiertas por una estructura multicapa capaz de mantener la presión interna sin bloquear el movimiento. El conjunto incluía un casco con visor tratado para filtrar la intensa radiación solar y evitar el empañamiento, sistema de suministro de oxígeno, micrófono integrado y un revestimiento térmico reflectante para resistir las gélidas temperaturas de la estratosfera.\n\nLas pruebas preliminares en tierra y en cámara resultaron prometedoras, pero el estallido de la Guerra Civil española en julio de 1936 frustró el ascenso previsto con el globo y truncó la carrera de su creador en España, obligándolo más tarde al exilio en Francia. Sin embargo, el concepto técnico de un traje espacial flexible, presurizado y con protección térmica permaneció en la historia de la aeronáutica y recibió el reconocimiento posterior de historiadores e ingenieros ligados a la carrera espacial como uno de los antecedentes directos más brillantes del traje espacial moderno.',
                'Emilio Herrera and the 1935 Stratospheric Suit: The Spanish Design Ahead of Its Time',
                'Thirty years before human Moon landings, a Spanish military engineer solved pressure, mobility, and solar shielding challenges inside a Madrid test facility.',
                'In 1935, while commercial aircraft rarely climbed much above three kilometers, Spanish military engineer Emilio Herrera Linares completed an extraordinary prototype at the Cuatro Vientos aeronautical station in Madrid: the "escafandra estratonauta." Its purpose was bold yet grounded in strict physics—allowing a pilot to ascend aboard an open stratospheric balloon gondola to roughly 26 kilometers altitude safely.\n\nAt that altitude, ambient air pressure drops to a tiny fraction of sea-level values. Because boiling temperature falls alongside external pressure, human bodily fluids risk dangerous ebullition and decompression sickness near body temperature without a pressurized enclosure. Yet early pressurized garments behaved like stiff balloons, locking elbows and knees so pilots could barely move.\n\nHerrera tackled both physics and biomechanics simultaneously. He incorporated articulated metal accordion bellows across major joints so internal volume stayed nearly constant while the wearer bent arms or legs, paired with layered insulation, oxygen lines, integrated radio communications, and a solar-shielded, anti-fog visor built for harsh stratospheric cold and ultraviolet light.\n\nAlthough ground tests validated key elements of the garment, the outbreak of the Spanish Civil War in July 1936 halted the flight and forced Herrera into exile. Decades later, aerospace historians and NASA-era commentators recognized his 1935 stratospheric suit as a remarkably farsighted technical forerunner of pressurized space suits.',
                'Un buen diseño físico se anticipa a los límites de presión y resistencia mecánica; igual que las juntas y el sellado de vuestro cohete deben contener la sobrepresión de la reacción sin una sola fuga.',
                'Great physical engineering anticipates pressure and structural limits—just as every joint on your student rocket must hold reaction pressure without leaks.',
                'En un prototipo escolar bajo presión interna, ¿dónde conviene invertir más esfuerzo de taller: en reforzar la botella principal o en perfeccionar el sellado entre secciones?',
                'Under internal reaction pressure, where is workshop effort better spent: thickening the main body or perfecting the seals between joints?',
                'EMILIO HERRERA (1935)', 'ESCAFANDRA ESTRATONAUTICA', '#ffb703', '#1d1407',
                'Archivo Histórico AEE · Fundación Enaire', 'https://www.enaire.es'
            ),
            make(
                'SEED-HIST-JUAN-CIERVA', 'historia', 20,
                'UN POCO DE HISTORIA', 'A BIT OF HISTORY',
                'Juan de la Cierva y el autogiro C.4: el vuelo de Getafe de 1923 que domó el rotor',
                'Cuando los primeros aparatos de alas giratorias volcaban nada más despegar, el ingeniero murciano halló en una articulación mecánica el secreto de la estabilidad en vuelo.',
                'En la mañana del 9 de enero de 1923, sobre la pista de tierra del aeródromo madrileño de Getafe, un aparato extraño con aspecto de aeroplano sin alas superiores y un gran rotor de cuatro palas sobre la cabina completó por primera vez un vuelo estable y controlado de varios minutos. Era el autogiro C.4, obra del ingeniero español Juan de la Cierva, certificado poco después por el Laboratorio Aeronáutico de Cuatro Vientos bajo la dirección de Emilio Herrera.\n\nHasta aquel invierno, construir una aeronave que pudiera sostenerse mediante aspas giratorias parecía condenado al fracaso. El obstáculo se escondía en un fenómeno aerodinámico implacable: al avanzar hacia delante, la pala que se movía a favor del viento relativo generaba mucha más sustentación que la pala que retrocedía en el lado opuesto. Esa asimetría provocaba un par lateral violento que volcaba el aparato casi en el instante de separarse del suelo.\n\nLa solución genial de De la Cierva no consistió en añadir motores más potentes ni en complicar el fuselaje, sino en permitir que las palas no fueran completamente rígidas en su raíz. Mediante la llamada articulación de batimiento, cada pala podía ascender ligeramente al recibir mayor sustentación y descender en el tramo contrario, equilibrando de forma natural las fuerzas a lo largo de todo el giro.\n\nAdemás, el rotor del autogiro no iba impulsado por el motor en vuelo, sino por el propio paso del aire a través de las palas mediante autorrotación, de manera que incluso si la hélice delantera fallaba, el aparato descendía suavemente como una semilla alada. Años más tarde, los ingenieros que desarrollaron el helicóptero moderno adoptaron esa misma mecánica de rotor articulado, dejando una huella permanente en toda la aviación vertical.',
                'Juan de la Cierva and the 1923 Autogyro Flight That Mastered Rotary Aerodynamics',
                'After early rotary-wing machines rolled over at liftoff, a Spanish engineer unlocked stable flight using a mechanical hinge.',
                'On January 9, 1923, at Getafe airfield near Madrid, a curious aircraft topped with a four-blade unpowered rotor lifted off into the winter air and flew under full control. Known as the C.4 autogyro, designed by Spanish engineer Juan de la Cierva and officially certified by the Cuatro Vientos laboratory under Emilio Herrera, it solved one of aviation’s toughest aerodynamic puzzles.\n\nEarlier rotary-wing prototypes suffered from severe dissymmetry of lift: as an aircraft moves forward, the blade advancing into the airstream generates far more lift than the retreating blade on the opposite side, flipping the craft almost immediately upon takeoff. De la Cierva fixed the imbalance not with brute power, but with a flapping hinge at the root of each blade.\n\nBy allowing each blade to rise slightly under higher lift and settle on the return stroke, aerodynamic forces balanced automatically across the rotor disc. Because the rotor spun by autorotation through moving air rather than engine torque, the autogyro could also glide gently to the ground if its forward engine failed—establishing core rotor mechanics still used in helicopters worldwide.',
                'Igual que el rotor equilibrado del autogiro compensa fuerzas asimétricas, la alineación exacta y simétrica de vuestras aletas decide si el cohete asciende vertical o desvía su trayectoria.',
                'Just like balanced rotor blades counter asymmetric forces, precise fin symmetry determines whether your rocket climbs straight or veers off course.',
                '¿Compensa dedicar presupuesto y tiempo adicional a aletas simétricas y rígidas si evitan pérdidas de altura por vuelo inclinado?',
                'Is it worth investing extra budget and build time in stiff symmetrical fins to prevent altitude loss from tilted flight?',
                'JUAN DE LA CIERVA', 'AUTOGIRO C.4 · GETAFE 1923', '#00f0ff', '#071b26',
                'Archivo Aeronáutico AEE', ''
            ),
            make(
                'SEED-HIST-SPUTNIK-1957', 'historia', 30,
                'UN POCO DE HISTORIA', 'A BIT OF HISTORY',
                'Sputnik 1 (1957): los 83 kilos de aluminio y el «bip-bip» que abrieron la Era Espacial',
                'El 4 de octubre de 1957 una esfera brillante de poco más de medio metro alcanzó velocidad orbital y transformó para siempre la ciencia, las comunicaciones y la geopolítica mundial.',
                'La noche del 4 de octubre de 1957, desde la estepa kazaja de Baikonur, un cohete R-7 desarrollado por el equipo de Serguéi Koroliov colocó en órbita terrestre baja al primer satélite artificial de la historia: el Sputnik 1. En lugar de llevar instrumentos complejos o cámaras de televisión, aquel pionero consistía en una esfera sellada de aleación de aluminio de apenas 58 centímetros de diámetro, 83,6 kilogramos de masa y cuatro antenas metálicas de entre 2,4 y 2,9 metros inclinadas hacia atrás.\n\nSu misión científica buscaba demostrar por fin la física de la velocidad orbital y recopilar mediciones reales de las capas más altas de la atmósfera. Para no volver a caer de inmediato hacia la Tierra, el lanzador debía impulsar el satélite hasta alrededor de 29.000 kilómetros por hora, estableciendo una órbita elíptica que completaba una vuelta al planeta cada 96 minutos. Durante 21 días, hasta que se agotaron sus baterías químicas, los transmisores de a bordo emitieron pulsos de radio constantes en 20,005 y 40,002 megahercios.\n\nAquel sencillo «bip-bip» fue captado por estaciones científicas, colegios y miles de radioaficionados de todos los continentes mientras la brillante esfera cruzaba el cielo nocturno antes de desintegrarse en la reentrada el 4 de enero de 1958. Analizando el efecto Doppler de la señal y el frenado progresivo causado por los átomos residuales del aire a cientos de kilómetros de altura, los físicos pudieron calcular con mayor exactitud la densidad de la atmósfera superior.\n\nCon el paso de los meses, la sencillez y ligereza del Sputnik 1 aceleraron inversiones globales en microelectrónica, telemetría y propulsión, dando inicio a la Carrera Espacial y a la creación de agencias civiles dedicadas a explorar la órbita terrestre.',
                'Sputnik 1 (1957): The 83-Kilogram Aluminum Sphere That Opened the Space Age',
                'On October 4, 1957, a gleaming 58-centimeter orb reached orbital velocity and transformed global science and aerospace engineering overnight.',
                'On October 4, 1957, an R-7 launch vehicle lifted off from Baikonur to place humanity’s first artificial satellite into low Earth orbit. Rather than packing heavy cameras or delicate laboratories, Sputnik 1 was an aluminum-alloy sphere measuring just 58 centimeters across, weighing 83.6 kilograms, and trailing four whip antennas between 2.4 and 2.9 meters long.\n\nTo stay aloft instead of falling straight back, the sphere had to reach roughly 29,000 kilometers per hour, circling Earth every 96 minutes. For 21 days before its batteries drained, onboard transmitters broadcast steady radio pulses at 20.005 and 40.002 MHz that amateur radio operators and observatories across the globe tracked overhead.\n\nBy measuring Doppler shifts and subtle orbital decay before Sputnik 1 reentered the atmosphere on January 4, 1958, scientists gained direct data on upper-atmospheric density and radio propagation—proving how minimalist, lightweight engineering can unlock historic breakthroughs.',
                'Sputnik 1 triunfó gracias a su ligereza extrema y simplicidad funcional; en MARS-KET, cada gramo superfluo y cada euro virtual mal gastado penalizan vuestro cociente E = Altura / Coste.',
                'Sputnik 1 succeeded through minimal mass and clarity of purpose; every unnecessary gram or €v reduces your E = Height / Cost score.',
                '¿Qué elemento de vuestro prototipo actual añade peso o gasto sin contribuir directamente a una mayor altura o estabilidad?',
                'Which component on your current rocket adds mass or cost without improving altitude or flight stability?',
                'SPUTNIK 1 (1957)', '83,6 KG QUE CAMBIARON EL MUNDO', '#ff0055', '#1b0714',
                'Archivo Histórico AEE · ESA/NASA', 'https://www.esa.int'
            ),
            make(
                'SEED-HIST-VALENTINA-TERESHKOVA', 'historia', 34,
                'UN POCO DE HISTORIA', 'A BIT OF HISTORY',
                'Valentina Tereshkova y las 48 órbitas del Vostok 6 (1963): el salto solitario de «Chaika»',
                'De obrera textil y paracaidista aficionada a convertirse el 16 de junio de 1963 en la primera mujer en viajar al espacio exterior.',
                'El 16 de junio de 1963, la voz de una joven de veintiséis años resonó desde la órbita terrestre bajo el indicativo de radio «Chaika», gaviota en ruso. Se trataba de Valentina Tereshkova, que a bordo de la cápsula Vostok 6 se convirtió en la primera mujer de la historia en viajar al espacio exterior, apenas dos años después del primer vuelo espacial humano de Yuri Gagarin.\n\nSu camino hacia la plataforma de lanzamiento de Baikonur no había pasado por una academia militar de cazas a reacción, sino por una fábrica textil de Yaroslavl y un club local de paracaidismo. Precisamente su dilatada experiencia en saltos en paracaídas resultó decisiva para superar las pruebas de selección del programa soviético: las cápsulas Vostok de primera generación carecían de retrocohetes capaces de frenar el impacto final contra el suelo, de modo que todo cosmonauta debía eyectarse a unos siete kilómetros de altura durante el descenso y aterrizar con su propio paracaídas.\n\nDurante su vuelo en solitario de dos días, veintidós horas y cincuenta minutos, Tereshkova completó 48 vueltas alrededor de la Tierra, superando entonces el tiempo acumulado en órbita de todos los astronautas estadounidenses juntos hasta esa fecha. Además de mantener el contacto por radio con el Vostok 5 de Valeri Bykovski —que volaba en una órbita próxima—, llevó un registro continuo de su estado físico, fotografió el horizonte terrestre para estudiar capas de aerosoles atmosféricos y detectó y comunicó una anomalía en la programación de orientación automática de la nave para el encendido de regreso.\n\nLa misión de «Chaika» demostró con datos biomédicos que los límites en el espacio no dependían del género del piloto sino del entrenamiento, la serenidad ante imprevistos técnicos y el control preciso de cada fase del vuelo.',
                'Valentina Tereshkova and Vostok 6 (1963): "Chaika’s" Solo 48-Orbit Mission',
                'From textile worker and amateur skydiver to becoming the first woman in outer space on June 16, 1963.',
                'On June 16, 1963, radio stations tracked the call sign "Chaika"—Seagull—from Earth orbit as 26-year-old Valentina Tereshkova piloted Vostok 6 into history as the first woman in space, little more than two years after Yuri Gagarin’s pioneering flight.\n\nBefore joining the cosmonaut corps, Tereshkova worked in a Yaroslavl textile plant and trained extensively as an amateur parachutist. That skydiving skill was no minor detail: first-generation Vostok capsules did not touch down softly with their pilot inside, requiring every cosmonaut to eject roughly seven kilometers above ground and descend independently by parachute.\n\nOver two days, 22 hours, and 50 minutes, Tereshkova completed 48 orbits around Earth, logging medical telemetry, photographing atmospheric horizon layers, and catching a vital orientation programming error prior to reentry burn—proving how rigorous training and calm troubleshooting decide real aerospace missions.',
                'A veces una habilidad práctica aparentemente lejana —como revisar procedimientos o dominar la recuperación del prototipo— salva toda una fase de pruebas.',
                'Hands-on practical readiness—from pre-flight checklists to recovery safety—often decides whether an engineering test succeeds.',
                '¿Qué protocolo de verificación previa echáis en falta en vuestro equipo antes de dar por listo un ensayo en el Banco de Pruebas?',
                'What pre-flight check does your team need before clearing a prototype for the R&D Test Bench?',
                'TERESHKOVA (1963)', 'VOSTOK 6 · 48 ORBITAS', '#e879f9', '#1e0b2b',
                'Archivo Histórico AEE · Roscosmos / RMG', ''
            ),
            make(
                'SEED-HIST-KATHERINE-JOHNSON', 'historia', 37,
                'UN POCO DE HISTORIA', 'A BIT OF HISTORY',
                'Katherine Johnson: las ecuaciones a mano que dieron luz verde a las órbitas de la NASA',
                'En el salto histórico de John Glenn en 1962 y en las trayectorias hacia la Luna, el cálculo manual de la matemática de Langley fue la garantía definitiva antes de pulsar el botón de encendido.',
                'Antes de que los procesadores electrónicos llenaran cada escritorio, el cálculo aerodinámico y orbital de los Estados Unidos descansaba sobre salas enteras de matemáticas conocidas como «computadoras humanas». Entre ellas destacó en el Centro de Investigación Langley de la NASA Katherine Johnson, cuya precisión en geometría analítica y mecánica orbital resultó indispensable desde los primeros vuelos suborbitales del programa Mercury hasta las trayectorias lunares del Apolo.\n\nUno de los momentos más célebres de su carrera tuvo lugar en febrero de 1962, en la antesala de la misión Friendship 7, con la que John Glenn aspiraba a convertirse en el primer estadounidense en orbitar la Tierra. La NASA acababa de instalar grandes computadoras electrónicas IBM para trazar los parámetros de órbita y reentrada entre decenas de estaciones de seguimiento repartidas por todo el mundo, pero los ingenieros y el propio astronauta aún desconfiaban de posibles errores de programación en máquinas tan jóvenes.\n\nGlenn pidió expresamente que «la chica» —en referencia a Johnson— revisara con regla, papel y calculadora mecánica las mismas ecuaciones que acababa de arrojar la computadora, resumiendo su confianza en una frase que pasó a la historia de la NASA: si ella decía que los números estaban bien, él estaba listo para despegar. Tras comprobar punto por punto las cifras orbitales de la misión, el lanzamiento del 20 de febrero de 1962 culminó con éxito sus tres órbitas previstas.\n\nAños después, Johnson volvió a demostrar ese dominio matemático sincronizando las complejas trayectorias de encuentro entre el módulo lunar y el módulo de mando del programa Apolo, recordándonos que ningún ordenador sustituye a un equipo que entiende de verdad las ecuaciones físicas que está calculando.',
                'Katherine Johnson: The Hand-Checked Equations That Cleared NASA’s Historic Orbits',
                'Before John Glenn’s 1962 orbital flight and Apollo lunar rendezvous, NASA astronauts trusted Johnson’s manual math as the ultimate check over early electronic computers.',
                'Long before modern laptops sat on every desk, aerospace calculations relied on teams of specialist mathematicians known as "human computers." At NASA’s Langley Research Center, Katherine Johnson stood out for her mastery of orbital mechanics from Project Mercury through Apollo.\n\nIn February 1962, ahead of Friendship 7—the flight set to make John Glenn the first American in Earth orbit—NASA had begun using mainframe electronic computers to link tracking coordinates around the globe. Wary of software glitches in nascent machines, Glenn famously asked for Katherine Johnson to manually verify the computer’s orbital figures: if she confirmed the numbers were good, he declared, he was ready to fly.\n\nFollowing her point-by-point hand check, Glenn launched safely on February 20, 1962, and completed three orbits. Years later, Johnson helped compute rendezvous trajectories for Apollo 11, proving that real mathematical understanding remains irreplaceable even in the digital era.',
                'En MARS-KET tampoco basta con apuntar números en una tabla: comprobar a mano E = Altura / Coste y vuestras triangulaciones de Matemáticas evita errores carísimos.',
                'In MARS-KET, understanding your own math—verifying E = Height / Cost and triangulation data manually—prevents costly errors.',
                'Si una hoja de cálculo arroja una eficiencia o saldo dudoso en vuestro equipo, ¿sabéis recalcularlo paso a paso con lápiz y papel?',
                'If a spreadsheet shows a suspicious efficiency or balance result, can your team recompute it by hand to verify?',
                'KATHERINE JOHNSON', 'ORBITAS A MANO · NASA 1962', '#38bdf8', '#0a192f',
                'Archivo Histórico NASA · Langley', 'https://www.nasa.gov'
            ),
            make(
                'SEED-HIST-APOLO-1969', 'historia', 40,
                'REPORTAJE ESPECIAL · UN POCO DE HISTORIA', 'SPECIAL REPORT · A BIT OF HISTORY',
                'Programa Apolo y Apolo 11 (1969): logística extrema, física orbital y casi tres mil toneladas para llegar a la Luna',
                'Para depositar un módulo de pocas toneladas en el Mar de la Tranquilidad y traer de vuelta a tres astronautas hizo falta coordinar cientos de empresas y el cohete Saturn V.',
                'Cuando el 20 de julio de 1969 el módulo lunar Eagle posó sus cuatro patas metálicas sobre el polvo del Mar de la Tranquilidad con Neil Armstrong y Buzz Aldrin a bordo —mientras Michael Collins permanecía orbitando en el módulo de mando Columbia—, el planeta asistió al desenlace visible de casi una década de ingeniería extrema. Sin embargo, la gran lección científica del Programa Apolo comenzó mucho antes, sobre el papel de la ecuación del cohete.\n\nPara escapar de la gravedad terrestre y completar un viaje de ida y vuelta de más de setecientos mil kilómetros, la mayor parte del gigante Saturn V que había despegado el 16 de julio desde Cabo Cañaveral no era ni cabina ni experimento científico: cerca de las tres mil toneladas de masa total en la rampa correspondían en más de un 85 por ciento a propelente líquido y tanques desechables por etapas. Cada kilogramo extra añadido a la carga útil obligaba a multiplicar exponencialmente el combustible necesario en la base.\n\nPor esa razón, la NASA aplicó un estricto control de fases y pruebas progresivas antes de autorizar el alunizaje. El programa avanzó misión a misión —ensayos no tripulados, vuelos en órbita terrestre en el Apolo 7, primer viaje alrededor de la Luna en el Apolo 8, ensayo completo del módulo lunar en órbita terrestre en el Apolo 9 y descenso de aproximación sin posarse en el Apolo 10— detectando fallos en escalones intermedios sin arriesgar toda la empresa en un único lanzamiento.\n\nLa misma sobriedad gobernó la informática de a bordo: la computadora de guiado del Apolo (AGC) operaba con unos 72 kilobytes de memoria fija cableada a mano y apenas 4 kilobytes de memoria temporal, demostrando que la precisión algorítmica y la cooperación organizada entre cientos de talleres contratistas valen mucho más que la fuerza bruta.',
                'Project Apollo and Apollo 11 (1969): Rocket Equations, Phase Testing, and Lunar Logistics',
                'Landing a lightweight crew cabin on the Moon required nearly 3,000 metric tons on the launchpad and a disciplined phase-by-phase test campaign.',
                'When the lunar module Eagle touched down in the Sea of Tranquility on July 20, 1969, with Neil Armstrong and Buzz Aldrin while Michael Collins orbited above in Columbia, television viewers saw only the final act of nearly a decade of systems engineering.\n\nUnder the strict tyranny of the rocket equation, over 85 percent of the Saturn V’s near-3,000-metric-ton liftoff mass consisted of propellants and expendable stages simply to lift the small crew spacecraft out of Earth’s gravity well. Every extra kilogram of hardware near the top demanded massive extra fuel below.\n\nTo master that complexity safely, NASA enforced phased validation—graduating from Earth-orbit shakedowns and Apollo 8’s lunar orbit to Apollo 10’s dress-rehearsal descent before attempting landing on Apollo 11. Guided by an onboard computer holding roughly 72 KB of fixed rope memory and 4 KB of RAM, Apollo proved that phased testing, supplier coordination, and mass discipline outweigh brute force.',
                'Igual que el programa Apolo validó cada etapa con presupuesto cerrado, vuestra startup debe equilibrar masa de reactivos, coste BOM y pruebas parciales antes de la validación definitiva.',
                'Just like Apollo’s phased milestones and strict mass control, your startup must balance reagents, BOM costs, and staged tests before final validation.',
                'Si duplicáis la cantidad de reactivo sin reforzar el cierre ni aligerar el fuselaje, ¿mejora necesariamente la eficiencia E = Altura / Coste?',
                'If you double your propellant dose without improving sealing or cutting dry mass, will E = Height / Cost automatically rise?',
                'APOLO 11 (1969)', 'SATURN V · INGENIERIA DE FASES', '#38bdf8', '#081426',
                'Archivo NASA / AEE', 'https://www.nasa.gov'
            ),
            make(
                'SEED-HIST-ESPANA-ESPACIO', 'historia', 50,
                'UN POCO DE HISTORIA', 'A BIT OF HISTORY',
                'España en el espacio: medio siglo desde el satélite Intasat (1974) hasta los nuevos lanzadores y astronautas',
                'De las antenas madrileñas que escucharon el Apolo 11 y el primer satélite nacional al salto industrial de lanzadores, constelaciones IoT y la promoción europea de 2022.',
                'Aunque a menudo pasa desapercibida para el gran público, la trayectoria espacial española supera ya el medio siglo de historia científica e industrial. Un hito inaugural llegó el 15 de noviembre de 1974, cuando un cohete Delta despegó desde la base californiana de Vandenberg portando al espacio el Intasat, un microsatélite de 24,5 kilogramos con doce caras solares diseñado y construido por el Instituto Nacional de Técnica Aeroespacial (INTA) para estudiar la ionosfera terrestre.\n\nAños antes, estaciones de seguimiento instaladas en territorio español —como Fresnedillas de la Oliva y Robledo de Chavela, en Madrid, o Maspalomas, en Gran Canaria— ya habían cumplido un papel esencial escuchando y retransmitiendo las señales de las misiones lunares del Programa Apolo. Esa base técnica fue alimentando durante décadas a un tejido de ingenierías dedicadas a software de vuelo, estructuras para lanzadores europeos Ariane y navegación satelital.\n\nEn el plano humano, el ingeniero aeronáutico Pedro Duque abrió camino al volar a bordo del transbordador Discovery en 1998 y regresar a la Estación Espacial Internacional con la misión Cervantes en 2003. Casi veinte años después, en noviembre de 2022, la Agencia Espacial Europea anunció una nueva hornada de astronautas con doble acento español: el ingeniero leonés Pablo Álvarez Fernández como astronauta titular y la biotecnóloga e investigadora oncológica Sara García Alonso en la reserva.\n\nHoy el ecosistema nacional combina grandes contratistas aeroespaciales con nuevas startups privadas dedicadas a microsatélites de comunicaciones IoT y cohetes propios —como el ensayo suborbital del MIURA 1 en Huelva en 2023 y el desarrollo del orbital MIURA 5—, probando que el talento técnico especializado compite al máximo nivel internacional.',
                'Spain in Space: Fifty Years from Intasat (1974) to Modern Launchers and Astronauts',
                'From Apollo tracking antennas near Madrid and Spain’s first indigenous satellite to the 2022 ESA astronaut class and private NewSpace ventures.',
                'Spain’s presence in space engineering stretches back well over half a century. On November 15, 1974, a Delta rocket lifting off from Vandenberg carried Intasat into orbit—a 24.5-kilogram ionospheric research satellite developed by Spain’s National Institute for Aerospace Technology (INTA).\n\nEven earlier, tracking complexes at Fresnedillas de la Oliva, Robledo de Chavela, and Maspalomas played crucial roles keeping radio contact with Apollo lunar flights. Over subsequent decades, Spanish firms grew into key contributors to European launcher structures, flight software, and satellite navigation.\n\nOn the human spaceflight front, Pedro Duque flew in 1998 and 2003, followed in November 2022 by the European Space Agency’s selection of Pablo Álvarez Fernández as a career astronaut and Sara García Alonso in the astronaut reserve—now joined by a thriving NewSpace wave developing constellations and rockets like MIURA.',
                'El sector español demuestra que equipos especializados, rigurosos con los plazos y el presupuesto pueden abrirse hueco mundial, igual que nuestras Startups Navarras en el proyecto.',
                'Spain’s aerospace track record shows focused teams with disciplined budgets can compete globally—just like your classroom startups.',
                '¿Qué empresas españolas incluidas en nuestro «Quién es quién» fabrican hoy sistemas espaciales reales que quizás no conocías?',
                'Which Spanish companies listed in our "Who is Who" directory build real orbital hardware you did not know came from Spain?',
                'ESPANA EN EL ESPACIO', 'DE INTASAT AL NEWSPACE', '#00ff66', '#061d14',
                'Archivo Histórico AEE · INTA / ESA', 'https://www.esa.int'
            ),
            make(
                'SEED-INV-CAMARA-CMOS', 'inventos', 15,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'La cámara de tu teléfono móvil nació para ahorrar batería y peso en las sondas de la NASA',
                'En 1993, el ingeniero Eric Fossum ideó en el JPL un sensor de imagen en un único chip que jubiló a las cámaras pesadas interplanetarias y acabó en miles de millones de bolsillos.',
                'Durante las primeras décadas de exploración planetaria, fotografiar Júpiter, Marte o los anillos de Saturno exigía embarcar cámaras pesadas y frágiles basadas en sensores CCD que consumían una energía preciosa para las placas solares o generadores de la nave. A comienzos de los años noventa, el ingeniero y físico Eric Fossum recibió en el Laboratorio de Propulsión a Chorro (JPL) de la NASA un encargo exigente: miniaturizar de verdad el sistema óptico para futuras sondas pequeñas sin sacrificar nitidez.\n\nEn 1993, el equipo encabezado por Fossum presentó el sensor activo de píxeles CMOS con transferencia de carga intrapíxel, conocido popularmente como la «cámara en un chip». A diferencia del CCD convencional, que trasladaba las cargas eléctricas fila a fila hacia un lector externo voluminoso, el chip CMOS integraba el amplificador y la electrónica de lectura junto a cada píxel sobre la misma oblea de silicio fabricada con procesos estándar de microelectrónica.\n\nEl cambio redujo drásticamente el volumen, la masa y la demanda eléctrica de las cámaras científicas enviadas al espacio profundo, además de resistir mejor los efectos de la radiación cósmica que arruinan las imágenes en misiones largas.\n\nAl poder fabricarse en las mismas líneas industriales que los microprocesadores, la tecnología se abarató con rapidez y conquistó primero las webcams de ordenador y las cámaras deportivas, hasta convertirse hoy en el ojo digital presente en prácticamente todos los teléfonos inteligentes y en minúsculas cámaras médicas para endoscopia.',
                'How NASA’s Quest for Lighter Spacecraft Cameras Put a CMOS Sensor Inside Every Smartphone',
                'In 1993, JPL engineer Eric Fossum pioneered the "camera-on-a-chip" to cut spacecraft mass and power—sparking a consumer imaging revolution.',
                'Photographing distant planets once demanded bulky CCD camera assemblies that strained tight spacecraft mass and power budgets. In the early 1990s, NASA Jet Propulsion Laboratory physicist Eric Fossum took on a clear engineering goal: shrink imaging electronics drastically for smaller planetary probes.\n\nIn 1993, Fossum’s team unveiled the CMOS active-pixel image sensor with intra-pixel charge transfer—a true "camera-on-a-chip." Instead of shifting electrical charge slowly across a sensor to separate external chips, CMOS placed amplification and timing circuitry directly onto standard silicon manufacturing lines.\n\nSlashing size, weight, and battery draw in space soon triggered massive savings on Earth, making CMOS sensors the standard inside nearly every smartphone camera, webcam, action cam, and medical endoscope today.',
                'Reducir tamaño y consumo sin perder prestaciones es exactamente la mentalidad que premia vuestra fórmula de eficiencia E = Altura / Coste en 4º ESO.',
                'Cutting mass and resource consumption without sacrificing performance mirrors your exact E = Height / Cost goal in workshop testing.',
                '¿Qué otra pieza cotidiana mejora espectacularmente cuando un equipo se ve obligado a hacerla diez veces más ligera y económica?',
                'What other everyday device improves dramatically when engineers are forced to cut its mass and power tenfold?',
                'CAMARA DEL MOVIL', 'SENSOR CMOS · JPL 1993', '#00f0ff', '#071b26',
                'NASA Spinoff / Archivo AEE', 'https://spinoff.nasa.gov'
            ),
            make(
                'SEED-INV-VISCOELASTICA', 'inventos', 25,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'Espuma viscoelástica: el material ideado para proteger pilotos de pruebas que acabó en tu colchón',
                'En 1966, un contrato del Centro Ames de la NASA dio lugar a un polímero sensible al calor y la presión capaz de repartir cargas extremas sin rebote brusco.',
                'Cuando una nave espacial o un avión experimental acelera en el despegue o toca tierra con fuerza, el cuerpo de la tripulación soporta picos de fuerza G que un relleno normal convierte en golpes peligrosos o en puntos de presión insoportables. En 1966, el ingeniero aeronáutico Charles Yost colaboró bajo contrato con el Centro de Investigación Ames de la NASA para estudiar cómo mejorar la absorción de impactos y el reparto de cargas en los asientos.\n\nEl resultado fue una espuma de poliuretano de celdas abiertas denominada inicialmente «temper foam». Su secreto residía en su comportamiento viscoelástico: al entrar en contacto con el calor corporal y la presión, el polímero se ablandaba en las zonas más cargadas, amoldándose con exactitud a la anatomía del ocupante para repartir la fuerza sobre toda la superficie posible y recuperando lentamente su forma original al cesar la carga, sin el rebote violento de los muelles o espumas elásticas clásicas.\n\nAunque aquel desarrollo nació pensando en la seguridad aeronáutica y los asientos espaciales, sus primeras aplicaciones comerciales masivas aparecieron en el ámbito médico y hospitalario. Colchones y cojines fabricados con esta espuma ayudaron a pacientes encamados durante largos periodos al evitar la concentración de presión sobre la piel y reducir las dolorosas úlceras.\n\nCon el abaratamiento químico del polímero en décadas posteriores, la espuma viscoelástica o «espuma con memoria» dio el salto definitivo al dormitorio doméstico, al calzado deportivo y al acolchado interior de cascos de protección en múltiples deportes.',
                'Viscoelastic Memory Foam: From 1966 NASA Impact Research to Hospitals and Bedrooms',
                'Engineered by Charles Yost under a NASA Ames contract to cushion high-G aviation seating, slow-spring-back foam reshaped healthcare and sleep.',
                'High-acceleration launches and hard aircraft landings concentrate dangerous G-forces along a pilot’s spine and shoulders. In 1966, aeronautical engineer Charles Yost worked under contract with NASA’s Ames Research Center to improve crash protection and load distribution in flight seating.\n\nHis solution was open-cell viscoelastic polyurethane foam, initially dubbed "temper foam." Reacting smoothly to body heat and pressure, the material softens under high load points to conform to the passenger’s body, spreads impact energy evenly, and recovers slowly without jarring rebound.\n\nIts earliest commercial breakthroughs arrived in hospitals—preventing pressure ulcers for long-term patients—before scaling worldwide into memory-foam mattresses, ergonomic pillows, athletic insoles, and helmet liners.',
                'Entender las propiedades físicas de cada material (elasticidad, amortiguación y densidad) permite sacar el máximo partido a piezas modestas del taller.',
                'Understanding physical properties like damping, elasticity, and density helps teams get superior results from simple workshop materials.',
                'Si vuestro cohete llevara una carga delicada o un altímetro frágil en la ojiva, ¿qué material del catálogo amortiguaría mejor el impacto?',
                'If your rocket carried a fragile payload or altimeter in the nose cone, which catalog material would best cushion landing impact?',
                'ESPUMA VISCOELASTICA', 'TEMPER FOAM · AMES 1966', '#ffb703', '#1c1506',
                'NASA Spinoff / Archivo AEE', 'https://spinoff.nasa.gov'
            ),
            make(
                'SEED-INV-MANTAS-MYLAR', 'inventos', 35,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'Mantas térmicas de emergencia: la lámina espacial de 1964 que refleja el 97 % del calor',
                'En el vacío orbital no hay aire que reparta temperaturas; para evitar que los satélites ardieran al sol o se congelaran en sombra nació el escudo dorado y plateado de las ambulancias.',
                'En la vida cotidiana sobre la Tierra olvidamos que el aire actúa como un gigantesco regulador térmico por convección. Fuera de la atmósfera, en cambio, reina el vacío: la cara de un satélite o módulo lunar expuesta directamente al Sol puede superar los 120 grados positivos mientras el costado opuesto, en sombra total, se hiela por debajo de los 150 grados bajo cero. ¿Cómo aislar instrumentos delicados sin añadir decenas de kilos de fibra gruesa?\n\nEn 1964, la National Research Corporation desarrolló bajo contrato de la NASA una lámina ultradelgada de poliéster (BoPET, comercialmente conocido como Mylar) recubierta por vapor de aluminio al vacío. Pese a medir apenas unas milésimas de milímetro de espesor y pesar prácticamente nada, su superficie metálica brillante actúa como un espejo frente a la radiación infrarroja, reflejando hasta el 97 por ciento del calor radiado.\n\nCombinada en varias capas en satélites, telescopios y trajes espaciales, esa barrera radiante resolvió el control térmico orbital sin lastrar el lanzamiento. Muy pronto los equipos de rescate en montaña y medicina de urgencias descubrieron la utilidad terrenal de aquel material: una manta entera cabe doblada como un paquete de pañuelos dentro de una mochila y, envuelta alrededor de una persona herida, frena la pérdida de calor corporal por radiación y evaporación.\n\nHoy aquellas láminas metalizadas doradas y plateadas son material obligatorio en botiquines de montaña, vehículos de bomberos, ambulancias y líneas de meta de maratones de todo el mundo.',
                'Emergency Space Blankets: The 1964 Aluminized Film That Reflects Up to 97 Percent of Heat',
                'Created for the harsh thermal extremes of orbital vacuum, paper-thin metallized Mylar now protects runners and accident survivors from hypothermia.',
                'On Earth, moving air helps distribute heat naturally. In space, vacuum leaves spacecraft exposed to violent radiation extremes: sunlit surfaces soar above +120 °C while shaded sides plunge below -150 °C—with no room in the rocket budget for bulky insulation.\n\nIn 1964, working under a NASA contract, the National Research Corporation produced an ultralight aluminized polyester film (BoPET/Mylar) barrier. Though paper-thin, its mirror-like metallic coating reflects up to 97 percent of infrared radiant heat.\n\nLayered across satellites and lunar landers—and later packed into pocket-sized emergency blankets—the film rapidly entered mountain rescue kits, ambulances, and marathon finish lines to prevent life-threatening heat loss.',
                'Comprender cómo se propaga la energía (conducción, convección y radiación) explica por qué materiales finísimos y bien elegidos superan a soluciones pesadas.',
                'Understanding conduction, convection, and thermal radiation explains why carefully chosen ultralight materials outperform heavy builds.',
                '¿Por qué una lámina tan fina como una hoja de papel abriga en una emergencia mucho más que una sudadera mojada?',
                'Why does a paper-thin metallized foil retain heat far better in an emergency than damp fabric?',
                'MANTA TERMICA MYLAR', 'AISLAMIENTO RADIATIVO · 1964', '#38bdf8', '#081826',
                'NASA Spinoff / Archivo AEE', 'https://spinoff.nasa.gov'
            ),
            make(
                'SEED-INV-LENTES-UV', 'inventos', 45,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'Lentes antiarañazos y visores con filtro solar: la herencia espacial que protege tu vista',
                'Cuando el plástico sustituyó al vidrio pesado en cascos y pantallas espaciales hubo que endurecer su superficie con capas microscópicas nacidas en un proyecto de purificación de agua.',
                'Durante décadas, las gafas de calidad se fabricaron con lentes de vidrio mineral: resistían bien los roces diarios, pero pesaban mucho y podían astillarse ante un impacto. El policarbonato y otros plásticos ópticos resolvían de raíz el peso y el riesgo de rotura, tanto en la Tierra como en los cascos de astronautas y las viseras de laboratorio, pero arrastraban un defecto molesto: cualquier partícula de polvo los rayaba con facilidad.\n\nLa solución llegó por un camino inesperado en los años setenta dentro del Centro de Investigación Ames de la NASA. Mientras el científico Ted Wydeven investigaba métodos para recubrir filtros de membrana en sistemas de purificación de agua espacial mediante descargas eléctricas sobre vapores orgánicos, comprobó que la película plástica resultante adherida a las superficies mostraba una dureza excepcional frente a la abrasión.\n\nAplicada posteriormente como capa protectora invisible sobre viseras de cascos aeroespaciales, en 1983 la firma Foster Grant adquirió la licencia de aquella tecnología para lanzar al mercado lentes plásticas resistentes a los arañazos. En paralelo, investigaciones ópticas del JPL centradas en proteger la retina humana de la intensa radiación ultravioleta y ciertas bandas de luz azul inspiraron tintes filtrantes para gafas solares y laborales.\n\nGracias a ese doble salto técnico, las gafas graduadas, gafas de sol, pantallas deportivas y gafas protectoras de laboratorio actuales combinan ligereza, alta resistencia a golpes y una durabilidad superficial impensable hace medio siglo.',
                'Scratch-Resistant Lenses and UV Protection: How Space Plastics Replaced Heavy Glass',
                'An unexpected coating born in a 1970s NASA water-filter experiment hardened plastic helmet visors and transformed modern eyewear in 1983.',
                'For generations, optical-grade eyeglasses relied on heavy mineral glass because lightweight plastics scratched easily in daily use. While polycarbonate solved shatter risk and helmet weight for aerospace crews, unprotected visors dulled quickly under fine dust.\n\nIn the 1970s, NASA Ames scientist Ted Wydeven stumbled on the answer while researching plasma-deposited organic vapor coatings for spacecraft water-purification membranes: the ultrathin film adhered stubbornly and resisted abrasion remarkably well. NASA applied the technique to space helmet visors, and in 1983 Foster Grant licensed the process for commercial scratch-resistant eyewear.\n\nPaired with aerospace studies on filtering unfiltered solar ultraviolet light, those advances made today’s lightweight, impact-safe prescription glasses and laboratory safety goggles possible.',
                'Elegir entre materiales rígidos, plásticos ligeros o recubrimientos protectores forma parte del mismo equilibrio técnico que aplicáis al comprar en nuestro catálogo oficial.',
                'Balancing surface durability against weight and price when picking plastics or cardboard from our catalog mirrors real engineering trade-offs.',
                '¿En qué piezas del cohete compensa pagar algo más por plástico o refuerzo frente a cartulina sencilla para evitar daños en el montaje?',
                'Which parts of your rocket justify investing in durable plastic rather than basic cardboard to avoid launchpad damage?',
                'LENTES ANTIARANAZOS', 'VISORES ESPACIALES · 1983', '#00ff66', '#061d14',
                'NASA Spinoff / Archivo AEE', 'https://spinoff.nasa.gov'
            ),
            make(
                'SEED-INV-GPS-TALADRO', 'inventos', 55,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'Herramientas sin cable y navegación GPS: la verdad técnica detrás de dos aliados diarios',
                'Los taladros inalámbricos ya existían desde 1961 antes del Apolo, pero perforar la Luna perfeccionó sus motores; y el mapa del móvil necesita corregir cada día la Relatividad de Einstein.',
                'A menudo se repite el mito de que la NASA inventó el taladro sin cable desde cero para viajar a la Luna. La historia real es todavía más interesante para cualquier estudiante de tecnología: Black & Decker comercializó el primer taladro eléctrico portátil con batería de níquel-cadmio en 1961, antes de que existiera siquiera el hardware del Apolo.\n\nSin embargo, cuando la NASA preparó las misiones Apolo 15, 16 y 17 entre 1971 y 1972 necesitaba extraer núcleos de roca y regolito hasta tres metros bajo la superficie lunar sin cables de corriente, con guantes presurizados y en el vacío extremo. En colaboración con el contratista Martin Marietta, los ingenieros optimizaron el cabezal motorizado del taladro lunar (ALSD) mediante cálculo informático de la eficiencia eléctrica y mecánica. Ese conocimiento avanzado sobre motores compactos de mínimo consumo acabó alumbrando años después aspiradores de mano inalámbricos como el famoso Dustbuster de 1979 y herramientas quirúrgicas sin cable.\n\nUn fenómeno parecido ocurre con el mapa de tu teléfono móvil. Las constelaciones de satélites de posicionamiento global como el GPS estadounidense y el sistema europeo Galileo triangulan nuestra posición midiendo al nanosegundo cuánto tarda en llegar una señal de radio.\n\nA veinte mil kilómetros de altura y a gran velocidad orbital, los relojes atómicos de los satélites sufren variaciones reales predichas por la Teoría de la Relatividad Especial y General de Albert Einstein: sin corregir matemáticamente ese desfase diario de unos 38 microsegundos, la posición calculada en tu pantalla acumularía kilómetros de error en un solo día.',
                'Cordless Tools and Pocket GPS: The Real Engineering Behind Two Everyday Space Allies',
                'Black & Decker sold the first cordless drill in 1961 before Apollo, yet lunar core drilling refined efficient compact motors—and smartphone GPS depends daily on Einstein’s relativity.',
                'A common urban legend claims NASA invented the cordless drill from scratch for the Moon landings. In truth, Black & Decker launched the first nickel-cadmium cordless drill back in 1961. Yet when Apollo 15, 16, and 17 needed to extract rock and regolith cores up to three meters deep in airless vacuum with bulky spacesuit gloves, NASA and Martin Marietta turned to Black & Decker to engineer the Apollo Lunar Surface Drill powerhead.\n\nUsing computer modeling to squeeze maximum torque from tight battery budgets yielded motor-optimization know-how that later fueled commercial breakthroughs like the 1979 Dustbuster handheld vacuum and cordless surgical drills.\n\nSimilarly, smartphone navigation via GPS and Europe’s Galileo relies on timing atomic-clock radio signals from 20,000 kilometers up—correcting daily relativistic clock offsets predicted by Albert Einstein so your map stays accurate to a few meters.',
                'En el proyecto, vuestras mediciones con goniómetro y triangulación desde dos bases (MAT 1–4) aplican exactamente la misma lógica geométrica que las estaciones de rastreo orbital.',
                'Your math triangulation tracking from dual baseline stations applies the exact geometric principle used by satellite navigation networks.',
                '¿Por qué medir el ángulo de vuelo desde dos puntos separados reduce drásticamente el error frente a observar el cohete desde un único punto?',
                'Why does measuring launch altitude from two separated baseline points slash measurement error compared with a single observer?',
                'GPS Y SIN CABLES', 'RELATIVIDAD Y MOTORES APOLO', '#ff0055', '#1b0714',
                'Archivo ESA / NASA Spinoff', 'https://www.esa.int'
            ),
            make(
                'SEED-INV-GORE-TEX', 'inventos', 60,
                'REPORTAJE ESPECIAL · DEL ESPACIO A TU CASA', 'SPECIAL REPORT · FROM SPACE TO YOUR HOME',
                'Gore-Tex y el espacio: el tirón accidental de 1969 y la diferencia real con los trajes del Apolo 11',
                'Un gesto de frustración en el laboratorio convirtió un plástico clásico en la membrana impermeable y transpirable más famosa del planeta, aunque los trajes lunares usaban en realidad otro tejido hermano.',
                'En la montaña bajo la lluvia, en chaquetas técnicas de invierno y en calzado impermeable suele contarse que el tejido Gore-Tex se creó para los trajes lunares del Apolo 11. Conviene separar aquí el mito de la verdadera historia química, porque la realidad demuestra mejor cómo dialogan la ciencia básica y la industria aeroespacial.\n\nEn octubre de 1969 —tres meses después de que Armstrong y Aldrin pisaran la Luna—, Robert «Bob» Gore investigaba en el laboratorio familiar de W. L. Gore & Associates cómo estirar cintas de politetrafluoroetileno (PTFE, conocido comercialmente como Teflón). Cada vez que intentaba alargar lentamente las varillas calientes del polímero, el material se rompía. Frustrado tras varios intentos fallidos, aplicó un tirón súbito y violento sobre una muestra caliente: contra todo pronóstico, la varilla no quebró sino que se estiró alrededor de un ochocientos por ciento formando una red microporosa compuesta en cerca de un setenta por ciento por aire.\n\nEse PTFE expandido (ePTFE), base de la marca Gore-Tex patentada en los años setenta, poseía millones de poros diminutos por centímetro cuadrado: demasiado pequeños para dejar pasar una gota de agua líquida, pero mucho mayores que una molécula individual de vapor de agua, permitiendo transpirar sin calarse.\n\n¿Qué tejido blanco protegía entonces realmente a los astronautas del Apolo 11 frente al fuego y los micrometeoritos en julio de 1969? Tras el trágico incendio del Apolo 1 en 1967, la NASA, Owens-Corning y DuPont habían desarrollado la llamada «tela Beta», formada por filamentos ultrafinos de fibra de vidrio recubiertos de PTFE incombustible. No era Gore-Tex, aunque ambas compartían la familia química del Teflón. Aun así, W. L. Gore ya suministraba cables eléctricos aislados con PTFE para misiones lunares como Surveyor 1 y los sismógrafos del Apolo 11, y a partir de 1981 las fibras tejidas de Gore sí pasaron a formar parte oficial de los trajes espaciales del transbordador de la NASA.',
                'Gore-Tex and Spaceflight: The 1969 Lab Yank vs. What Apollo Astronauts Actually Wore',
                'A sudden tug in a private polymer lab created breathable ePTFE membrane, while Apollo Moon suits actually relied on PTFE-coated fiberglass called Beta cloth.',
                'Outdoor enthusiasts often repeat that Gore-Tex was invented for Apollo Moon suits. Separating myth from polymer chemistry reveals a far more illuminating story. In October 1969—three months after Apollo 11—chemist Bob Gore was trying to stretch heated polytetrafluoroethylene (PTFE, or Teflon) rods at W. L. Gore & Associates. Slow pulls snapped every sample until a sudden, frustrated yank stretched the rod by nearly 800 percent into a microporous web roughly 70 percent air.\n\nBecause those microscopic pores block liquid water droplets while letting smaller vapor molecules escape, expanded PTFE (ePTFE) became the foundation of waterproof, breathable Gore-Tex textiles.\n\nMeanwhile, the fireproof outer fabric protecting Apollo 11 astronauts was actually Beta cloth—ultrafine glass fibers coated with PTFE developed after the 1967 Apollo 1 fire. Still, Gore’s real aerospace ties ran deep: the firm supplied durable PTFE-insulated wiring on Surveyor 1 and Apollo 11 instruments, and woven Gore fibers officially entered NASA Space Shuttle spacesuits in 1981.',
                'Distinguir con rigor las propiedades de un polímero, una fibra o un adhesivo evita elegir materiales equivocados en el laboratorio y mejora el rigor del Informe Técnico de FyQ.',
                'Distinguishing polymer membranes, fiberglass fabrics, and coatings accurately builds real Physics & Chemistry rigor for your Technical Report.',
                '¿Qué mito científico o tecnológico habéis escuchado alguna vez que al investigarlo resultara distinto a lo que se cuenta de memoria?',
                'What popular science or tech myth have you heard that turned out to work quite differently once you checked the facts?',
                'GORE-TEX vs BETA CLOTH', 'QUIMICA DEL PTFE · 1969', '#22d3ee', '#071b26',
                'Archivo Científico AEE · NASA / W. L. Gore', 'https://www.nasa.gov'
            ),
            make(
                'SEED-INV-FILTROS-AGUA', 'inventos', 65,
                'DEL ESPACIO A TU CASA', 'FROM SPACE TO YOUR HOME',
                'Filtros y purificadores de agua: de los iones de plata del Apolo al agua potable tras las catástrofes',
                'Sin espacio para cargas pesadas ni margen para los olores del cloro en una cápsula cerrada, la NASA impulsó sistemas bactericidas con plata y carbón activado que hoy limpian el agua en hogares y emergencias.',
                'Llevar agua embotellada suficiente para semanas en órbita resulta prohibitivo por peso en cualquier nave tripulada, pero reciclar y almacenar agua en una cabina hermética plantea un reto microbiológico inmediato. En los programas Gemini y Apolo, la NASA evitó depender únicamente de altas dosis de cloro líquido, ya que se degrada con el tiempo, altera el sabor y entraña riesgos de manipulación en espacios confinados.\n\nPara mantener el agua potable libre de bacterias durante toda la misión con mínimo consumo eléctrico, la agencia espacial y sus contratistas desarrollaron celdas electrolíticas compactas que liberaban concentraciones diminutas y controladas de iones de plata. La plata actúa como biocida natural capaz de desactivar bacterias y algas sin añadir olor ni toxicidad humana en dosis medidas.\n\nCon la llegada de misiones de mayor duración hacia el transbordador espacial y las estaciones orbitales, la firma Umpqua Research Company colaboró con la NASA para perfeccionar la llamada Microbial Check Valve: cartuchos que combinaban carbón activado para adsorber compuestos orgánicos con resinas intercambiadoras de iones impregnadas en agentes biocidas como plata o yodo, impidiendo además que los microbios colonizaran el interior del propio filtro.\n\nEsa alianza química y de ingeniería saltó pronto de la órbita a la Tierra. Varias empresas comerciales adoptaron la tecnología para fabricar plantas portátiles de potabilización capaces de llevar agua segura a zonas rurales aisladas o regiones afectadas por terremotos e inundaciones, además de sentar la base técnica de millones de jarras y filtros domésticos bajo el fregadero.',
                'Water Purifiers: From Apollo Silver-Ion Cells to Emergency Relief and Kitchen Filters',
                'Because carrying tons of bottled water or heavy chlorine into sealed spacecraft was impractical, NASA backed silver-ion and activated-carbon filters still guarding tap water today.',
                'Storing and recycling drinking water inside sealed spacecraft presents strict chemical and biological constraints. During the Gemini and Apollo programs, NASA looked beyond standard chlorine treatment because chlorine degrades over time, affects taste, and poses handling hazards in tight cabins.\n\nNASA and aerospace contractors developed compact electrolytic devices that released tiny, controlled doses of silver ions—a natural antimicrobial agent that keeps drinking water sterile with minimal weight and power. Later, researching longer-duration shuttle and station flights, Oregon-based Umpqua Research Company partnered with NASA to refine the Microbial Check Valve, uniting activated carbon beds with biocidal ion-exchange resins so bacteria could not colonize inside the cartridge itself.\n\nThose aerospace purification systems rapidly transitioned into portable relief units delivering safe water after natural disasters, while informing the activated-carbon and ion-exchange cartridges found inside household kitchen filters worldwide.',
                'La purificación por intercambio iónico y adsorción en carbón activado conecta directamente los contenidos de disoluciones, concentraciones e iones que trabajáis en Física y Química.',
                'Ion exchange, trace concentrations, and activated-carbon adsorption connect space engineering directly with your Physics & Chemistry curriculum.',
                '¿Por qué en un circuito cerrado —sea una nave espacial o vuestra propia startup— reutilizar y filtrar recursos cuesta menos que traer material nuevo cada vez?',
                'Why does recycling and purifying scarce resources inside a closed loop cost less than constantly importing fresh supplies?',
                'FILTROS DE AGUA', 'IONES DE PLATA Y CARBON · NASA', '#34d399', '#062019',
                'NASA Spinoff / Archivo AEE', 'https://spinoff.nasa.gov'
            ),
            // --- JUGUETES Y EL ESPACIO (6 reportajes verificados) ---
            make(
                'SEED-TOY-LEGO-JUNO', 'juguetes', 70,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Tres minifiguras de LEGO de aluminio rumbo a Júpiter: la tripulación metálica de la sonda Juno',
                'Lanzadas en 2011 a bordo de la nave de la NASA, no eran de plástico ABS sino piezas fresadas en aluminio aeroespacial para resistir la radiación y el frío del gigante gaseoso.',
                'El 5 de agosto de 2011 despegó desde Cabo Cañaveral la sonda Juno de la NASA con destino a Júpiter. Entre sus instrumentos científicos viajaba una carga insólita fruto de la alianza educativa Bricks in Space entre la agencia estadounidense y el Grupo LEGO: tres minifiguras de unos 3,8 centímetros que representaban a Galileo Galilei (con telescopio), al dios romano Júpiter (con un rayo) y a la diosa Juno (con una lupa).\n\nPara sobrevivir cinco años de crucero interplanetario hasta entrar en órbita joviana en julio de 2016, las figuras no podían fabricarse en plástico convencional, que podría liberar gases o degradarse bajo radiación extrema. Se fresaron en aluminio de grado espacial con el mismo cuidado de masa y limpieza que cualquier componente de vuelo.\n\nEn MARS-KET 2.0, elegir el material adecuado en el Taller determina tanto la resistencia estructural como el coste final en el cálculo de eficiencia E = Altura / Coste.',
                'Three Aluminum LEGO Minifigures Bound for Jupiter: Inside NASA Juno’s Metal Crew',
                'Launched in 2011 aboard NASA’s Juno spacecraft, the figures were milled from aerospace-grade aluminum rather than ABS plastic to survive deep-space radiation.',
                'When NASA’s Juno probe lifted off on August 5, 2011, it carried an unusual educational payload under the NASA-LEGO Bricks in Space partnership: three custom 1.5-inch minifigures depicting Galileo Galilei, Jupiter, and Juno. Instead of standard plastic, engineers machined them from aerospace-grade aluminum so they would neither outgas nor degrade during their five-year voyage to Jupiter in July 2016.\n\nIn MARS-KET 2.0, choosing lightweight yet durable materials in the Workshop directly shapes both structural reliability and your efficiency score E = Height / Cost.',
                'La elección de materiales resistentes y ligeros decide si un componente soporta las condiciones reales de vuelo.',
                'Choosing light, durable materials determines whether hardware survives real flight conditions.',
                '¿Por qué una sonda espacial exige materiales distintos a los de un juguete cotidiano aunque compartan la misma forma?',
                'Why does a spacecraft require different materials than an everyday toy even when they share the same shape?',
                'LEGO EN JUPITER', 'ALUMINIO AEROESPACIAL · 2011', '#fbbf24', '#1f1605',
                'NASA / LEGO Bricks in Space', 'https://www.nasa.gov'
            ),
            make(
                'SEED-TOY-LEGO-SATURNV', 'juguetes', 75,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Ingeniería por etapas en 1.969 piezas: el Saturno V y el Artemis SLS en formato maqueta',
                'Cómo los conjuntos a escala 1:110 reproducen exactamente la separación de fases, los tanques de propelente y la lógica modular de un lanzador real.',
                'Publicado en 2017 (y reeditado como 92176), el modelo LEGO Ideas NASA Apollo Saturn V mide aproximadamente un metro de altura a escala 1:110 y consta exactamente de 1.969 piezas en homenaje al año del alunizaje del Apolo 11. Lejos de ser un bloque sólido, se desmonta en las tres etapas propulsoras reales (S-IC, S-II y S-IVB), el módulo lunar y la cápsula de mando.\n\nAños después, el modelo LEGO Icons del cohete Artemis SLS (10341, 3.601 piezas) trasladó la misma filosofía a la torre móvil de lanzamiento y sus propulsores laterales.\n\nTrabajar por etapas y subsistemas ordenados —igual que vuestra lista de materiales BOM en Operaciones y Técnico— permite probar, sustituir o mejorar cada parte sin reconstruir todo el cohete.',
                'Staging Engineering in 1,969 Bricks: Saturn V and Artemis SLS in Scale Models',
                'How 1:110 scale sets mirror real propellant stages, strap-on boosters, and modular aerospace assembly.',
                'Released in 2017 with exactly 1,969 pieces in tribute to the 1969 Apollo 11 landing, the one-meter 1:110 Saturn V model separates cleanly into the S-IC, S-II, and S-IVB stages, lunar lander, and command module. Years later, the 3,601-piece Artemis SLS set extended that modular approach to the mobile launch tower and solid rocket boosters.\n\nOrganizing your rocket into clear subsystems—just like your Workshop BOM—lets teams test and refine individual parts without rebuilding the entire airframe.',
                'Dividir un cohete en subsistemas ordenados facilita la lista de materiales BOM y acelera las pruebas en taller.',
                'Breaking a rocket into clean subsystems simplifies your BOM and speeds up Workshop testing.',
                '¿Qué ventaja tiene diseñar un cohete por módulos separables frente a pegarlo todo en una sola pieza rígida?',
                'What advantage does modular assembly give over gluing an entire rocket into one rigid piece?',
                'SATURNO V 1:110', '1.969 PIEZAS POR ETAPAS', '#f97316', '#1c0f06',
                'NASA / Archivo de Modelismo', 'https://www.nasa.gov'
            ),
            make(
                'SEED-TOY-SNOOPY-ZEROG', 'juguetes', 80,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Snoopy en gravedad cero: del Apolo 10 en 1969 a indicador oficial de microgravedad en Artemis I',
                'Por qué los astronautas y las misiones automáticas sujetan un peluche en cabina para comprobar visualmente el instante en que termina el empuje.',
                'En mayo de 1969, los astronautas del Apolo 10 bautizaron su módulo lunar como Snoopy y la cápsula de mando como Charlie Brown. Desde entonces, la NASA entrega el premio Silver Snoopy a quienes destacan por la seguridad de vuelo.\n\nCincuenta y tres años después, el 16 de noviembre de 2022, un peluche de Snoopy vestido con una réplica del traje naranja OCSS viajó sujeto con una correa en el interior de la cápsula Orion durante la misión Artemis I. Al apagarse los motores y quedar la nave en caída libre orbital, flotar al extremo de la cinta ofrece una confirmación visual inmediata de la entrada en microgravedad.\n\nEn MARS-KET, cada ensayo exige el mismo rigor de seguridad y verificación documental antes de obtener la Licencia de Vuelo AESA (DOC_14).',
                'Snoopy in Zero-G: From Apollo 10 in 1969 to Artemis I’s Microgravity Indicator',
                'Why crews tether a plush mascot inside the cabin to confirm visually the exact moment engine thrust ends.',
                'In May 1969, the Apollo 10 crew named their lunar module Snoopy and command module Charlie Brown, inspiring NASA’s Silver Snoopy flight-safety award. On November 16, 2022, a Snoopy plush wearing a custom orange suit rode tethered inside Orion for Artemis I as an official zero-gravity indicator: once engines cut off and free-fall begins, the floating toy gives cameras an instant visual cue of microgravity.\n\nIn MARS-KET, flight safety and thorough verification remain essential before earning your AESA Flight License (DOC_14).',
                'La cultura de seguridad aeroespacial combina indicadores físicos simples con protocolos documentados antes de volar.',
                'Aerospace safety culture pairs simple physical indicators with documented pre-flight checks.',
                '¿Por qué flota un objeto atado con correa dentro de una nave en órbita si la gravedad terrestre sigue actuando allí arriba?',
                'Why does a tethered toy float inside an orbiting spacecraft even though Earth’s gravity still reaches orbit?',
                'SNOOPY EN ORBITA', 'APOLO 10 -> ARTEMIS I', '#38bdf8', '#081826',
                'NASA Artemis / Archivo AEE', 'https://www.nasa.gov'
            ),
            make(
                'SEED-TOY-ESTES-MABEL', 'juguetes', 85,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Cohetes de modelismo Estes y la máquina «Mabel» (1958): cómo la cohetería escolar se volvió segura',
                'De los experimentos peligrosos de los años cincuenta a los motores comerciales reemplazables fabricados sin chispas eléctricas.',
                'A finales de los años cincuenta, tras el lanzamiento del Sputnik, cientos de jóvenes intentaban fabricar pólvora casera en sus garajes con graves accidentes. Para ofrecer una alternativa segura, Orville Carlisle y G. Harry Stine idearon cohetes ligeros de papel y madera con motores prefabricados intercambiables.\n\nEn 1958, Vern Estes diseñó «Mabel», una prensa neumática operada sin electricidad para evitar chispas capaz de fabricar un motor seguro de cartón cada 5,5 segundos, fundando Estes Industries y estandarizando la cohetería educativa en institutos de todo el mundo.\n\nEn MARS-KET, los reactivos de laboratorio (bicarbonato y vinagre) cumplen esa misma regla: máxima seguridad física para centrarse en la estanqueidad, el coste y la altura.',
                'Estes Model Rockets and the "Mabel" Machine (1958): Making School Rocketry Safe',
                'How replaceable factory-made paper motors replaced risky homemade experiments for classrooms worldwide.',
                'Following Sputnik in the late 1950s, homemade propellant experiments caused frequent injuries among students. Orville Carlisle and G. Harry Stine pioneered lightweight paper-and-wood rockets powered by replaceable factory motors. In 1958, Vern Estes engineered "Mabel"—an electricity-free pneumatic press producing one safe motor every 5.5 seconds—making model rocketry a safe STEM staple.\n\nMARS-KET applies the same rule with safe classroom chemistry (vinegar and baking soda) so teams can focus on seals, cost, and apogee.',
                'La estandarización de consumibles seguros permite repetir ensayos de vuelo y comparar eficiencias de forma justa.',
                'Standardizing safe consumables lets teams repeat flight tests and compare efficiency fairly.',
                '¿Qué cambia en la fiabilidad de un ensayo cuando el motor o el reactivo están estandarizados frente a improvisarlos cada vez?',
                'How does test reliability change when propellants are standardized instead of improvised?',
                'COHETERIA ESTES', 'PRENSA MABEL · 1958', '#ef4444', '#22090c',
                'Archivo Histórico STEM / NAR', 'https://www.nar.org'
            ),
            make(
                'SEED-TOY-KSP-SIM', 'juguetes', 90,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Kerbal Space Program, NASA y ESA: cuando los simuladores de vuelo enseñan mecánica orbital antes de despegar',
                'Expansiones oficiales con la Asteroid Redirect Mission (2014) y Shared Horizons (2020) demostraron por qué fallar en pantalla ahorra presupuesto real.',
                'Más allá de los juegos arcade, los simuladores de física orbital permiten experimentar sin riesgo con el centro de masa, el centro de presión aerodinámica y las ventanas de transferencia.\n\nEl simulador Kerbal Space Program colaboró oficialmente con la NASA en 2014 para recrear la Asteroid Redirect Mission y con la Agencia Espacial Europea (ESA) en 2020 con la expansión Shared Horizons, incluyendo el lanzador Ariane 5 y las sondas Rosetta y BepiColombo, en línea con herramientas divulgativas abiertas como NASA Eyes.\n\nAntes de gastar euros virtuales (€v) o consumibles en el Banco de Pruebas, comprobar proporciones y estabilidad en papel o simulador evita fallos costosos.',
                'Kerbal Space Program, NASA, and ESA: Teaching Orbital Mechanics Before Liftoff',
                'Official expansions with NASA (2014) and ESA (2020) show why failing on screen saves real mission budgets.',
                'Physics-based orbital simulators let students experiment safely with center of mass, aerodynamic drag, and transfer windows. Kerbal Space Program partnered officially with NASA in 2014 (Asteroid Redirect Mission) and ESA in 2020 (Shared Horizons, featuring Ariane 5, Rosetta, and BepiColombo), alongside interactive tools like NASA Eyes.\n\nTesting ratios and stability before spending virtual euros (€v) or reagents in the Workshop keeps your budget intact.',
                'Simular y calcular antes de consumir material protege la tesorería y mejora la nota técnica en FyQ y Matemáticas.',
                'Simulating and calculating before spending materials protects cash flow and strengthens your technical dossier.',
                '¿Qué errores de diseño se detectan más rápido al probar primero un modelo digital antes de cortar cartón o plástico?',
                'Which design errors surface faster in a digital simulation before cutting real materials?',
                'SIMULACION ORBITAL', 'KSP · NASA & ESA', '#22d3ee', '#071b26',
                'ESA / NASA Educational', 'https://www.esa.int'
            ),
            make(
                'SEED-TOY-PLAYMOBIL-MARS', 'juguetes', 95,
                'JUGUETES Y EL ESPACIO', 'TOYS AND SPACE',
                'Playmobil en Marte y la Luna: de la gama Mars Mission (2018) a la divulgación conjunta con la ESA',
                'Cómo las maquetas de estaciones modulares, esclusas y rovers acercan la logística espacial y el diseño de marca al público joven.',
                'En 2018 Playmobil presentó su línea Mars Mission, compuesta por una estación marciana modular (referencia 9487), un cohete con plataforma de lanzamiento (9488) y un vehículo explorador con laboratorio móvil (9489). Posteriormente, la marca estableció una colaboración educativa con la Agencia Espacial Europea (ESA) centrada en la exploración lunar.\n\nMás allá del juego simbólico, estos conjuntos muestran cómo un proyecto aeroespacial necesita coherencia visual completa: traje, vehículo, módulo habitable, panel solar e identidad gráfica reconocible.\n\nEs exactamente el puente entre ingeniería y comunicación corporativa que trabajan vuestros departamentos de Marketing (DOC_7) y Técnico.',
                'Playmobil on Mars and the Moon: From Mars Mission (2018) to ESA Educational Outreach',
                'How modular station sets, airlocks, and rovers introduce habitat logistics and brand identity to young audiences.',
                'In 2018 Playmobil introduced its Mars Mission range—a modular habitat station (9487), launch rocket (9488), and lab rover (9489)—later partnering with the European Space Agency (ESA) on lunar outreach sets. These kits illustrate that aerospace projects rely on an integrated visual system uniting suits, habitats, solar arrays, and mission branding.\n\nThat same link between engineering and visual identity drives Marketing (DOC_7) and Technical teams in MARS-KET.',
                'Una identidad visual coherente convierte un prototipo técnico en una marca reconocible ante inversores y familias.',
                'A cohesive visual identity turns technical hardware into a recognizable brand for investors and families.',
                '¿Qué elementos visuales hacen que un vehículo o estación espacial resulte inmediatamente reconocible como parte de una misma empresa?',
                'What visual cues make a rover or station immediately recognizable as belonging to the same company?',
                'MISION MARTE', 'PLAYMOBIL · ESA STEM', '#34d399', '#062019',
                'ESA / Archivo STEM AEE', 'https://www.esa.int'
            ),
            // --- NASA (3 reportajes verificados) ---
            make(
                'SEED-NASA-ARTEMIS-II', 'nasa', 100,
                'NASA · EXPLORACIÓN HUMANA', 'NASA · HUMAN EXPLORATION',
                'Artemis II y el retorno humano al entorno lunar: qué validan la cápsula Orion y su escudo térmico',
                'La primera misión tripulada del programa Artemis pone a prueba el soporte vital, las comunicaciones y la trayectoria de retorno libre alrededor de la Luna.',
                'A diferencia del vuelo automático Artemis I, Artemis II embarca a cuatro astronautas —Reid Wiseman, Victor Glover, Christina Koch y Jeremy Hansen— en un sobrevuelo lunar de varios días a bordo de la nave Orion.\n\nEl objetivo científico y técnico no es alunizar todavía, sino validar en condiciones reales los sistemas de regeneración de aire, agua, protección frente a radiación y guiado manual antes de comprometer un descenso futuro al polo sur lunar.\n\nCada parámetro validado en fase previa reduce el riesgo de fallos en misiones posteriores, igual que vuestro Informe Técnico Preliminar en MARS-KET.',
                'Artemis II and Human Return to Lunar Orbit: Validating Orion’s Life Support and Heatshield',
                'The first crewed Artemis flight tests life support, radiation shielding, and free-return navigation around the Moon.',
                'Unlike the uncrewed Artemis I test, Artemis II carries four astronauts—Reid Wiseman, Victor Glover, Christina Koch, and Jeremy Hansen—on a multi-day lunar flyby aboard Orion. Rather than landing, engineers verify air and water regeneration, radiation protection, and manual piloting before attempting future south-pole touchdowns.\n\nValidating every system in an earlier test phase lowers risk later—the exact purpose of your Preliminary Technical Report.',
                'Validar soporte vital y trayectoria antes del alunizaje refleja la metodología por fases de vuestro proyecto.',
                'Validating life support and flight paths before landing mirrors MARS-KET’s phased engineering workflow.',
                '¿Por qué las agencias espaciales realizan un sobrevuelo tripulado completo antes de intentar posarse sobre la superficie lunar?',
                'Why do space agencies fly a complete crewed lunar flyby before attempting a surface landing?',
                'ARTEMIS II', 'ORION · NASA', '#3b82f6', '#0a1428',
                'NASA Artemis Program', 'https://www.nasa.gov/artemis'
            ),
            make(
                'SEED-NASA-EUROPA-CLIPPER', 'nasa', 105,
                'NASA · CIENCIA PLANETARIA', 'NASA · PLANETARY SCIENCE',
                'Europa Clipper rumbo a Júpiter: radar penetrador de hielo en busca de océanos subterráneos',
                'Lanzada en octubre de 2024, la mayor sonda planetaria de la NASA utiliza asistencias gravitatorias para estudiar si la luna Europa reúne condiciones de habitabilidad.',
                'Bajo una corteza helada de kilómetros de espesor, la luna joviana Europa oculta probablemente un océano global de agua salada. Para estudiarlo sin aterrizar, la misión Europa Clipper —lanzada en octubre de 2024 con llegada prevista en 2030— realizará decenas de sobrevuelos cercanos.\n\nSus nueve instrumentos incluyen un radar capaz de sondear la estructura del hielo, espectrómetros para analizar penachos de vapor y magnetómetros para medir la conductividad del océano oculto, ahorrando masa propulsiva gracias a asistencias gravitatorias de Marte y la Tierra.\n\nEn clase, aprovechar impulsos físicos gratuitos y elegir sensores precisos permite lograr mayor alcance sin disparar el presupuesto.',
                'Europa Clipper En Route to Jupiter: Ice-Penetrating Radar Hunting Subsurface Oceans',
                'Launched in October 2024, NASA’s largest planetary probe uses gravity assists to assess Europa’s habitability.',
                'Beneath kilometers of ice, Jupiter’s moon Europa likely harbors a global saltwater ocean. Launched in October 2024 for a 2030 arrival, Europa Clipper will perform dozens of close flybys using ice-penetrating radar, spectrometers, and magnetometers—relying on Mars and Earth gravity assists to save propellant mass.\n\nMaximizing trajectory physics while keeping sensors focused mirrors optimizing cost and performance in R&D.',
                'Las asistencias gravitatorias demuestran cómo las leyes de la física multiplican el alcance sin gastar más combustible.',
                'Gravity assists show how physics multiplies mission reach without burning extra propellant.',
                '¿Cómo permite la gravedad de un planeta acelerar una sonda espacial sin consumir apenas reactivo ni combustible?',
                'How can a planet’s gravity accelerate a spacecraft while burning virtually no propellant?',
                'EUROPA CLIPPER', 'RADAR Y HABITABILIDAD', '#06b6d4', '#061a24',
                'NASA JPL / Europa Clipper', 'https://europa.nasa.gov'
            ),
            make(
                'SEED-NASA-JWST-EXOPLANETS', 'nasa', 110,
                'NASA · OBSERVATORIOS', 'NASA · OBSERVATORIES',
                'El telescopio James Webb y la espectroscopía infrarroja: cómo leer la química de un planeta lejano',
                'Cuando un exoplaneta pasa delante de su estrella, la luz filtrada por su atmósfera delata moléculas de agua, dióxido de carbono o metano a decenas de años luz.',
                'A 1,5 millones de kilómetros de la Tierra, en el punto de Lagrange L2, el Telescopio Espacial James Webb (JWST) observa el universo en longitudes de onda infrarrojas protegidas por un parasol de cinco capas tan grande como una pista de tenis.\n\nMediante espectroscopía de transmisión, sus detectores comparan la luz estelar normal con la pequeña fracción que atraviesa la atmósfera de un exoplaneta durante un tránsito. Cada molécula absorbe frecuencias exactas, dejando una huella química inequívoca de vapor de agua, CO₂ o metano.\n\nEs el mismo vínculo entre composición molecular, espectro y reacción química que estudiáis en Física y Química de 4º ESO.',
                'James Webb’s Infrared Spectroscopy: Reading the Chemistry of Distant Exoplanets',
                'When an exoplanet crosses in front of its star, starlight passing through its atmosphere reveals water vapor, CO2, and methane.',
                'Stationed 1.5 million kilometers away at L2 behind a five-layer sunshield, the James Webb Space Telescope uses infrared transmission spectroscopy to compare starlight before and during planetary transits. Each gas absorbs characteristic wavelengths, exposing fingerprints of water vapor, carbon dioxide, or methane.\n\nLight absorption and molecular fingerprints link deep-space astronomy straight to 4th ESO Physics & Chemistry.',
                'La espectroscopía conecta directamente la química de átomos y moléculas con la exploración del universo.',
                'Spectroscopy connects atomic and molecular chemistry directly with space exploration.',
                '¿Por qué el telescopio James Webb necesita trabajar muy frío en el infrarrojo y alejado del calor de la Tierra?',
                'Why must James Webb operate extremely cold in the infrared far from Earth’s heat?',
                'JAMES WEBB · L2', 'ESPECTROSCOPIA INFRARROJA', '#a855f7', '#180924',
                'NASA / ESA / CSA Webb', 'https://webb.nasa.gov'
            ),
            // --- LANZAMIENTOS (3 reportajes verificados) ---
            make(
                'SEED-LAUNCH-ARIANE-6', 'lanzamientos', 115,
                'LANZAMIENTOS · EUROPA', 'LAUNCHES · EUROPE',
                'Ariane 6 desde Kourou: así opera el lanzador modular europeo en versiones A62 y A64',
                'Con dos o cuatro propulsores laterales sólidos y una etapa superior reencendible Vinci, Europa adapta el empuje según la masa y órbita de cada satélite.',
                'Desde el Puerto Espacial Europeo de Kourou (Guayana Francesa), cerca del ecuador para aprovechar la velocidad de rotación terrestre, Ariane 6 devuelve a Europa un acceso autónomo a órbita baja, geoestacionaria y trayectorias interplanetarias.\n\nSu diseño modular permite volar en configuración A62 (con dos aceleradores sólidos laterales para cargas medias) o A64 (con cuatro aceleradores para misiones pesadas), mientras el motor criogénico reencendible Vinci de la etapa superior coloca distintos satélites en órbitas separadas durante un mismo lanzamiento antes de desorbitar.\n\nElegir A62 o A64 responde a la misma pregunta de MARS-KET: no gastar más propulsión de la necesaria para la carga útil objetivo.',
                'Ariane 6 from Kourou: How Europe’s Modular Launcher Scales Between A62 and A64',
                'With two or four solid boosters and a restartable Vinci upper stage, Ariane 6 matches thrust to each payload.',
                'Launching near the equator from Europe’s Spaceport in Kourou, Ariane 6 restores independent European orbital access. Its modular architecture flies as A62 (two solid strap-on boosters) for medium payloads or A64 (four boosters) for heavy lift, while the restartable Vinci upper stage deploys multiple satellites into separate orbits before deorbiting.\n\nChoosing A62 vs A64 mirrors MARS-KET’s core rule: never pay for more thrust than your mission requires.',
                'Adaptar la configuración del cohete al tamaño de la carga evita costes innecesarios y mejora la eficiencia.',
                'Matching rocket configuration to payload mass prevents wasted cost and raises efficiency.',
                '¿Qué ventaja física ofrece lanzar un cohete cerca del ecuador terrestre hacia el este como hace Kourou?',
                'What physical advantage comes from launching eastward near Earth’s equator at Kourou?',
                'ARIANE 6 · KOUROU', 'VERSIONES A62 y A64', '#f59e0b', '#1c1205',
                'ESA / Arianespace', 'https://www.esa.int'
            ),
            make(
                'SEED-LAUNCH-MIURA-5', 'lanzamientos', 120,
                'LANZAMIENTOS · ESPAÑA', 'LAUNCHES · SPAIN',
                'Miura 5 de PLD Space: del banco de ensayos de Teruel a la rampa orbital de la Guayana Francesa',
                'Tras el hito suborbital de Miura 1 en 2023, el programa español califica sus motores TEPREL-C y prepara las primeras plataformas orbitales.',
                'Tras completar en octubre de 2023 el primer vuelo de un cohete privado español con el Miura 1 desde Huelva, la compañía ilicitana PLD Space dio el salto hacia su lanzador orbital de dos etapas: Miura 5, diseñado para situar pequeños satélites comerciales y científicos en órbita baja.\n\nEl camino desde el prototipo hasta la rampa pasa por cientos de encendidos estáticos de motores TEPREL-C en el aeropuerto de Teruel, pruebas de tanques presurizados y el despliegue de infraestructura propia en la Guayana Francesa.\n\nAl igual que en nuestro Banco de Pruebas del aula, ninguna empresa pasa al lanzamiento definitivo sin verificar primero en tierra la estanqueidad y el empuje real.',
                'PLD Space’s Miura 5: From Teruel Static-Fire Benches to French Guiana’s Orbital Pad',
                'Following Miura 1’s 2023 suborbital flight, Spain’s orbital program qualifies TEPREL-C engines on the ground first.',
                'After flying Miura 1 in October 2023 as Spain’s first private rocket, Elche-based PLD Space shifted focus to the two-stage orbital Miura 5 launcher. Reaching the launchpad requires sustained TEPREL-C static-fire campaigns in Teruel, tank pressure qualification, and dedicated pad infrastructure in French Guiana.\n\nJust like MARS-KET’s Test Bench, teams qualify propulsion and seals thoroughly on the ground before orbital flight.',
                'Las campañas en banco de pruebas separan una idea prometedora de un cohete fiable listo para operar.',
                'Test-bench campaigns separate promising concepts from reliable operational launch vehicles.',
                '¿Qué datos críticos comprueba un ingeniero en un encendido estático en tierra antes de soltar el cohete?',
                'What critical parameters do engineers verify during a static fire before releasing a rocket?',
                'MIURA 5 · PLD SPACE', 'TERUEL -> KOUROU', '#ef4444', '#21080b',
                'PLD Space / Archivo AEE', 'https://www.pldspace.com'
            ),
            make(
                'SEED-LAUNCH-COUNTDOWN-REUSE', 'lanzamientos', 125,
                'LANZAMIENTOS · ECONOMÍA', 'LAUNCHES · ECONOMICS',
                'Go, Hold, Scrub y recuperación de etapas: cómo leer una cuenta atrás y por qué reutilizar baja el coste por kilo',
                'Qué significan los avisos técnicos previos al T-0 y cómo el aterrizaje de la primera etapa transforma la ecuación Altura / Coste.',
                'Seguir un lanzamiento real exige entender su vocabulario: «Go» confirma que un subsistema está en parámetros; «Hold» detiene el reloj ante una comprobación o racha de viento; y «Scrub» aplaza el despegue por seguridad hasta la siguiente ventana orbital disponible.\n\nDurante décadas, cada cohete se perdía completo en el océano tras un solo uso. Con la recuperación propulsiva de primeras etapas en plataformas como Falcon 9 o New Glenn y proyectos europeos como MaiaSpace, el fuselaje y los motores más caros regresan para volar de nuevo.\n\nReutilizar la etapa principal equivale exactamente a lo que hacéis en MARS-KET cuando conserváis vuestro cuerpo principal en buenas condiciones entre ensayos para maximizar E = Altura / Coste.',
                'Go, Hold, Scrub, and Booster Recovery: Reading a Countdown and the Economics of Reuse',
                'What launch-control calls mean before T-0, and why recovering first stages reshapes cost per kilogram.',
                'Following a real countdown starts with three calls: "Go" clears a subsystem, "Hold" pauses the clock for checks or upper-level winds, and "Scrub" safely postpones liftoff to the next launch window. Historically, every rocket was discarded after a single flight; booster recovery on vehicles like Falcon 9, New Glenn, and MaiaSpace lets the costliest engines fly repeatedly.\n\nReusing a durable airframe across tests mirrors MARS-KET’s goal of maximizing E = Height / Cost.',
                'Aplazar un ensayo inseguro («Scrub») ahorra reparaciones y reutilizar estructura multiplica vuestra eficiencia E.',
                'Scrubbing an unsafe test avoids repairs, while reusing airframes multiplies your E score.',
                '¿Por qué un aplazamiento («Scrub») por viento en altura suele ser una decisión financiera inteligente además de segura?',
                'Why is scrubbing a launch due to upper-level winds a smart financial decision as well as a safety call?',
                'CUENTA ATRAS T-0', 'GO · HOLD · SCRUB', '#22d3ee', '#071824',
                'Órbita. / Guía de Lanzamientos', 'https://www.esa.int'
            ),
            // --- TECNOLOGÍA (3 reportajes verificados, no cohetes/despegues) ---
            make(
                'SEED-TECH-DSOC-LASER', 'tecnologia', 130,
                'TECNOLOGÍA AEROESPACIAL', 'AEROSPACE TECHNOLOGY',
                'Comunicaciones láser en espacio profundo: la demostración DSOC de la NASA supera la barrera de la radio',
                'Transmitir datos con haces ópticos infrarrojos desde la sonda Psyche multiplica la capacidad frente a las ondas de radio tradicionales.',
                'A medida que las sondas viajan más allá de Marte, enviar imágenes de alta resolución por radio se vuelve un cuello de botella lento. Con el experimento Deep Space Optical Communications (DSOC) instalado en la sonda Psyche, la NASA demostró enlaces láser en el infrarrojo cercano desde cientos de millones de kilómetros de distancia.\n\nAl tener longitudes de onda mucho más cortas que las microondas de radio, un haz láser empaqueta entre 10 y 100 veces más información por segundo, aunque exige una puntería extrema para compensar el movimiento relativo entre la nave y los telescopios receptores en la Tierra mientras la luz tarda minutos en viajar.\n\nLa óptica geométrica y las ondas electromagnéticas se convierten así en el próximo salto de las telecomunicaciones interplanetarias.',
                'Deep Space Laser Communications: NASA’s DSOC Pushes Past Radio Bottlenecks',
                'Infrared optical links aboard Psyche multiply deep-space data rates over conventional radio antennas.',
                'As probes travel beyond Mars, traditional radio downlinks become narrow bottlenecks. With the Deep Space Optical Communications (DSOC) payload aboard Psyche, NASA demonstrated near-infrared laser links across hundreds of millions of kilometers—packing 10 to 100 times more bandwidth than radio, while demanding pinpoint pointing to account for Earth and spacecraft motion during multi-minute light travel times.',
                'Mayor ancho de banda en órbita significa telemetría más rica para tomar decisiones de misión sin demoras.',
                'Higher bandwidth in orbit delivers richer telemetry for faster mission decisions.',
                '¿Qué dificultad física adicional aparece al apuntar un láser fino desde millones de kilómetros frente a emitir ondas de radio anchas?',
                'What extra physical challenge appears when aiming a narrow laser from millions of kilometers away compared to broad radio beams?',
                'ENLACE LASER DSOC', 'ESPACIO PROFUNDO · OPTICA', '#00f0ff', '#061926',
                'NASA JPL / DSOC', 'https://www.jpl.nasa.gov'
            ),
            make(
                'SEED-TECH-SAR-5G-IOT', 'tecnologia', 135,
                'TECNOLOGÍA AEROESPACIAL', 'AEROSPACE TECHNOLOGY',
                'Radar SAR y conectividad 5G-IoT desde órbita baja: ver a través de las nubes y conectar sensores rurales',
                'Constelaciones como ICEYE y la española Sateliot amplían los usos cotidianos de los satélites pequeños sin necesidad de grandes antenas.',
                'Una cámara óptica convencional queda ciega si hay nubes o es de noche, justo cuando suelen ocurrir inundaciones o grandes incendios. Los satélites equipados con Radar de Apertura Sintética (SAR), como la constelación europea ICEYE, emiten pulsos de microondas propios y reconstruyen mapas centimétricos del terreno a cualquier hora y bajo tormentas.\n\nEn paralelo, iniciativas españolas como Sateliot despliegan nanosatélites en órbita baja capaces de actuar como torres de telefonía en el espacio bajo estándar 5G-IoT, permitiendo que sensores agrícolas, ganaderos o marítimos sigan conectados en zonas sin cobertura terrestre.\n\nLa tecnología espacial deja de depender solo de gigantes gubernamentales para ofrecer servicios de datos continuos.',
                'SAR Radar and 5G-IoT from Low Orbit: Seeing Through Clouds and Connecting Rural Sensors',
                'Constellations like ICEYE and Spain’s Sateliot turn small satellites into all-weather emergency and IoT relays.',
                'Optical cameras go blind under clouds or night—precisely when floods and wildfires strike. Synthetic Aperture Radar (SAR) satellites such as ICEYE emit microwave pulses to map terrain day or night through storms. Meanwhile, Spanish startup Sateliot operates LEO nanosatellites acting as orbital 5G-IoT towers so agricultural and maritime sensors stay online far beyond terrestrial cell coverage.',
                'Combinar sensores especializados y telecomunicaciones eficientes genera valor comercial real en el mercado espacial.',
                'Pairing specialized sensors with efficient telecom links creates real commercial value.',
                '¿Por qué un satélite radar SAR puede vigilar una inundación bajo tormenta mientras un satélite fotográfico normal no ve nada?',
                'Why can a SAR radar satellite monitor a flood under storm clouds while a regular camera sees nothing?',
                'RADAR SAR & 5G-IOT', 'SATELITES EN ORBITA BAJA', '#10b981', '#062016',
                'ESA / Sateliot / ICEYE', 'https://www.esa.int'
            ),
            make(
                'SEED-TECH-DEBRIS-GALILEO', 'tecnologia', 140,
                'TECNOLOGÍA AEROESPACIAL', 'AEROSPACE TECHNOLOGY',
                'Basura espacial y relojes atómicos: cómo se protegen las órbitas útiles y se ajusta el GPS europeo Galileo',
                'Desde misiones de inspección y captura activa como ADRAS-J hasta las correcciones relativistas que mantienen la precisión de navegación al metro.',
                'Más de 68.000 fragmentos mayores de diez centímetros y millones de partículas milimétricas orbitan la Tierra a velocidades superiores a 27.000 km/h. Para evitar colisiones en cascada, misiones de servicio en órbita como ADRAS-J (Astroscale) y las directrices Cero Basura de la ESA prueban cómo inspeccionar, capturar y desorbitar etapas antiguas en desuso.\n\nAl mismo tiempo, los satélites de la constelación europea Galileo mantienen relojes atómicos de altísima estabilidad que deben corregir cada día un pequeño desfase temporal predicho por la relatividad de Einstein —por su velocidad orbital y menor gravedad— sin el cual los navegadores del móvil acumularían kilómetros de error.\n\nFísica teórica y mantenimiento responsable de órbita sostienen hoy servicios que usamos cada minuto.',
                'Orbital Debris Removal and Atomic Clocks: Protecting Orbits and Calibrating Europe’s Galileo',
                'Active inspection missions like ADRAS-J and relativistic clock corrections keep orbital infrastructure accurate and safe.',
                'Tens of thousands of tracked fragments larger than 10 cm orbit Earth above 27,000 km/h. Service missions such as Astroscale’s ADRAS-J and ESA’s Zero Debris guidelines test close-proximity inspection and deorbiting of spent stages. Meanwhile, Europe’s Galileo navigation fleet carries atomic clocks adjusted daily for Einstein’s relativistic time dilation so phone maps remain accurate to the meter.',
                'La precisión científica y la responsabilidad ambiental en órbita forman parte de la excelencia operativa.',
                'Scientific precision and orbital sustainability go hand in hand with operational excellence.',
                '¿Qué ocurriría con las telecomunicaciones en pocos años si ninguna empresa retirara o desorbitara los satélites y etapas viejas?',
                'What would happen to global communications if operators never retired or deorbited old stages and satellites?',
                'ORBITA LIMPIA & GALILEO', 'DEBRIS Y RELOJES ATOMICOS', '#6366f1', '#0e0f29',
                'ESA Space Environment / Galileo', 'https://www.esa.int'
            ),
            // --- INDUSTRIA (2 reportajes nuevos + Musk patente = 3) ---
            make(
                'SEED-IND-FIXED-PRICE', 'industria', 145,
                'INDUSTRIA Y NEWSPACE', 'INDUSTRY & NEWSPACE',
                'Contratos de precio fijo e hitos: cómo NASA y ESA transformaron el modo de financiar empresas privadas',
                'Pasar del pago de sobrecostes abiertos al pago por entregables verificados obligó a las startups espaciales a controlar su presupuesto desde el primer día.',
                'Durante la era clásica del espacio, muchos contratos públicos funcionaban bajo el modelo de reembolso de costes más margen: si un proyecto tardaba el doble y costaba el triple, la agencia seguía pagando las facturas. Con la llegada de programas comerciales como COTS y Commercial Crew de la NASA o las iniciativas comerciales de la ESA, el modelo cambió hacia contratos de precio fijo por hitos.\n\nBajo ese esquema, la empresa recibe cada pago únicamente cuando supera una revisión técnica concreta o completa un vuelo de demostración. Si se pasa de presupuesto, el sobrecoste recae sobre su propia tesorería.\n\nEs exactamente la misma regla que rige los Contratos Comerciales de MARS-KET: solo cobráis el hito cuando cumplís la altura, el plazo y el Libro Mayor sin caer en números rojos.',
                'Fixed-Price Milestone Contracts: How NASA and ESA Reshaped Commercial Space Procurement',
                'Shifting from open cost-plus billing to milestone payments forced space startups to master cash flow from day one.',
                'Traditional aerospace contracts often used cost-plus billing, passing overruns back to public agencies. Programs like NASA’s COTS and Commercial Crew—and newer ESA commercial initiatives—shifted toward fixed-price milestone contracts: startups get paid only after passing defined engineering reviews or flight demonstrations, absorbing any cost overruns themselves.\n\nMARS-KET commercial contracts follow that exact logic: milestone payouts unlock only when technical targets and Ledger discipline are met.',
                'Controlar el flujo de caja y cumplir hitos en plazo evita quedarse sin liquidez antes del cierre de fase.',
                'Controlling cash flow and hitting deadlines prevents running out of liquidity before phase close.',
                '¿Por qué un contrato de precio fijo por hitos premia tanto la eficiencia técnica como la disciplina financiera?',
                'Why does a fixed-price milestone contract reward financial discipline as much as engineering talent?',
                'CONTRATOS POR HITOS', 'ECONOMIA DEL NEWSPACE', '#eab308', '#1f1805',
                'Órbita. / Análisis Económico', 'https://www.nasa.gov'
            ),
            make(
                'SEED-IND-SUPPLIER-NETWORK', 'industria', 150,
                'INDUSTRIA Y PROVEEDORES', 'INDUSTRY & SUPPLIERS',
                'La red B2B detrás de cada misión europea: el papel de GMV, Sener, Airbus y Deimos sin lanzar cohetes propios',
                'Por qué la mayor parte de la industria aeroespacial factura diseñando subsistemas, software de guiado, mecanismos y estructuras para terceros.',
                'Cuando pensamos en el sector espacial solemos imaginar solo el cohete en la rampa, pero la mayor parte del empleo y de la facturación aeroespacial vive en la cadena de proveedores especializados B2B. En Europa y España, compañías como GMV (segmento terreno y dinámica orbital), Sener (mecanismos de precisión y guiado), Airbus (estructuras y satélites) o Deimos (análisis de misión) suministran componentes críticos para misiones de la ESA y la NASA.\n\nNinguna empresa fabrica cada tornillo, sensor o algoritmo en solitario. Especializarse en un subsistema excelente y venderlo a otras compañías genera ingresos estables sin asumir todo el riesgo de un lanzador.\n\nEn el Mercado B2B de MARS-KET ocurre lo mismo: una startup que domina un módulo técnico o produce excedentes fiables puede financiar toda su campaña vendiendo a otras empresas.',
                'The B2B Network Behind Every European Mission: GMV, Sener, Airbus, and Deimos',
                'Why most aerospace revenue comes from supplying specialized guidance software, mechanisms, and subsystems to partners.',
                'While launchpads grab headlines, most aerospace revenue flows through specialized B2B suppliers. European and Spanish firms such as GMV (flight dynamics and ground segments), Sener (precision mechanisms), Airbus (structures and spacecraft), and Deimos (mission analysis) supply critical subsystems across ESA and NASA programs without owning rockets.\n\nIn MARS-KET’s B2B Market, specializing in reliable components or surplus stock can fund your whole mission.',
                'Vender componentes fiables en el mercado B2B convierte la capacidad técnica de taller en ingresos directos.',
                'Selling reliable components in the B2B market turns workshop skill directly into revenue.',
                '¿En qué casos puede ser más rentable para una startup vender subsistemas B2B que competir por construir todo desde cero?',
                'When is it more profitable for a startup to supply B2B subsystems rather than building everything from scratch?',
                'CADENA DE VALOR B2B', 'GMV · SENER · AIRBUS', '#ec4899', '#240818',
                'ESA / Industria Aeroespacial', 'https://www.esa.int'
            )
        ];
    },

    applyEditorialSeeds(newsList, deletedSet) {
        const list = Array.isArray(newsList) ? newsList : [];
        const tombSet = (deletedSet && typeof deletedSet.has === 'function') ? deletedSet : new Set();
        const byIdx = new Map();
        list.forEach((n, idx) => {
            if (n && n.id) byIdx.set(String(n.id), idx);
        });

        const mergeSeedIntoList = (seed, onlyInsertIfNoActualidad = false) => {
            if (!seed || !seed.id || tombSet.has(String(seed.id))) return;
            const sId = String(seed.id);
            if (!byIdx.has(sId)) {
                if (onlyInsertIfNoActualidad && list.some(n => n && (n.section === 'industria' || n.section === 'actualidad'))) {
                    return;
                }
                byIdx.set(sId, list.length);
                list.push(seed);
                return;
            }
            const idx = byIdx.get(sId);
            const cur = list[idx];
            if (!cur || cur.userEdited) return;
            const curSeedVer = Number(cur.seedVersion) || 0;
            const targetVer = Number(seed.seedVersion) || 3;
            if (curSeedVer >= targetVer) return;

            const hasCustomPhoto = Boolean(cur.imageUrl && !String(cur.imageUrl).startsWith('data:image/svg+xml'));
            list[idx] = {
                ...seed,
                imageUrl: hasCustomPhoto ? cur.imageUrl : seed.imageUrl,
                placement: cur.placement || seed.placement,
                subOrder: cur.subOrder || seed.subOrder || 0,
                featured: cur.featured !== undefined ? cur.featured : seed.featured,
                placementUpdatedAt: cur.placementUpdatedAt || seed.placementUpdatedAt || seed.updatedAt,
                publishedAt: curSeedVer < 3 ? seed.publishedAt : (cur.publishedAt || seed.publishedAt),
                publishedIsoDate: curSeedVer < 3 ? seed.publishedIsoDate : (cur.publishedIsoDate || seed.publishedIsoDate),
                userEdited: false
            };
        };

        mergeSeedIntoList(this.getDefaultOrbitalReportSeed(), true);
        this.getEditorialSectionSeeds().forEach(seed => mergeSeedIntoList(seed, false));
        return list;
    },

    _toMadridIsoDate(ts, fallbackStr = '') {
        const raw = String(fallbackStr || '').trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
        const dmy = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (dmy) {
            return `${dmy[3]}-${String(dmy[2]).padStart(2, '0')}-${String(dmy[1]).padStart(2, '0')}`;
        }
        const nTs = Number(ts);
        if (Number.isFinite(nTs) && nTs > 0) {
            try {
                const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid' }).format(new Date(nTs));
                if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
            } catch (e) {}
        }
        return '2026-11-23';
    },

    normalizeNewsItem(item) {
        if (!item || typeof item !== 'object' || !item.id) return null;
        const pubTs = this._parseSafeTs(item.publishedAt) || this._parseSafeTs(item.timestamp) || Date.now();
        const updTs = this._parseSafeTs(item.updatedAt) || pubTs;
        const plcUpdTs = this._parseSafeTs(item.placementUpdatedAt) || updTs;
        const rawPlc = String(item.placement || '');
        const placement = (rawPlc === 'front' || rawPlc === 'sub' || rawPlc === 'archive')
            ? rawPlc
            : (item.featured ? 'front' : 'archive');
        const rawSec = String(item.section || '').toLowerCase().trim();
        const validSections = ['nasa', 'lanzamientos', 'tecnologia', 'industria', 'marsket', 'inventos', 'historia', 'juguetes', 'entrevistas'];
        const origin = String(item.origin || '').toUpperCase() === 'SIMULATION' || item.coId
            ? 'SIMULATION'
            : 'REAL';
        let section = validSections.includes(rawSec)
            ? rawSec
            : (origin === 'SIMULATION' ? 'marsket' : 'industria');
        if (origin === 'SIMULATION' && section === 'industria' && (item.doc15Phase || item.coId)) {
            section = 'marsket';
        }
        const status = String(item.status || 'PUBLISHED').toUpperCase() === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
        const edNum = Number(item.editionNumber);
        const editionNumber = (Number.isFinite(edNum) && edNum >= 0) ? Math.floor(edNum) : 0;
        const pubDateLabel = String(item.publishedDate || item.date || new Date(pubTs).toLocaleDateString('es-ES'));
        const publishedIsoDate = this._toMadridIsoDate(pubTs, item.publishedIsoDate || pubDateLabel);
        return {
            id: String(item.id),
            seedVersion: Number(item.seedVersion) || 0,
            userEdited: Boolean(item.userEdited),
            section,
            status,
            editionNumber,
            origin,
            category: String(item.category || 'CRÓNICA AEE'),
            categoryEn: String(item.categoryEn || item.category || 'AEE DISPATCH'),
            title: String(item.title || 'Comunicado Orbital'),
            subtitle: String(item.subtitle || ''),
            body: String(item.body || ''),
            titleEn: String(item.titleEn || ''),
            subtitleEn: String(item.subtitleEn || ''),
            bodyEn: String(item.bodyEn || ''),
            imageUrl: item.imageUrl || null,
            sourceName: String(item.sourceName || item.author || 'Órbita.'),
            sourceUrl: item.sourceUrl || '',
            marsketImpact: String(item.marsketImpact || ''),
            marsketImpactEn: String(item.marsketImpactEn || ''),
            debateQuestion: String(item.debateQuestion || ''),
            debateQuestionEn: String(item.debateQuestionEn || ''),
            publishedAt: pubTs,
            updatedAt: updTs,
            placementUpdatedAt: plcUpdTs,
            placement,
            subOrder: placement === 'sub' ? (parseInt(item.subOrder, 10) || 1) : 0,
            publishedDate: pubDateLabel,
            publishedIsoDate,
            featured: status === 'PUBLISHED' && placement === 'front',
            phase: String(item.phase || 'ALL'),
            classGroup: String(item.classGroup || 'ALL'),
            coId: item.coId || null,
            companyName: item.companyName || null,
            author: String(item.author || 'Coordinación AEE')
        };
    },

    resolveFeaturedNews(newsList) {
        const list = Array.isArray(newsList) ? newsList.filter(Boolean) : [];
        if (list.length === 0) return list;
        const publishedList = list.filter(n => n.status !== 'DRAFT');
        const draftList = list.filter(n => n.status === 'DRAFT').map(n => ({ ...n, featured: false }));
        const sorted = [...publishedList].sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
        const frontPool = sorted.filter(n => n.placement === 'front' || (n.featured && n.section === 'industria'));
        const winner = frontPool.length > 0
            ? [...frontPool].sort((a, b) => Math.max(b.placementUpdatedAt || 0, b.updatedAt || 0, b.publishedAt || 0) - Math.max(a.placementUpdatedAt || 0, a.updatedAt || 0, a.publishedAt || 0))[0]
            : null;
        const winnerId = winner ? String(winner.id) : null;

        const subPool = sorted
            .filter(n => (!winnerId || String(n.id) !== winnerId) && n.placement === 'sub')
            .sort((a, b) => {
                const oa = Number(a.subOrder) || 99;
                const ob = Number(b.subOrder) || 99;
                if (oa !== ob) return oa - ob;
                return Math.max(b.placementUpdatedAt || 0, b.updatedAt || 0) - Math.max(a.placementUpdatedAt || 0, a.updatedAt || 0);
            });
        const subRankMap = new Map();
        subPool.slice(0, 3).forEach((n, idx) => subRankMap.set(String(n.id), idx + 1));

        const resolvedPublished = sorted.map(n => {
            const nid = String(n.id);
            if (winnerId && nid === winnerId) {
                return { ...n, placement: 'front', subOrder: 0, featured: true };
            }
            if (subRankMap.has(nid)) {
                return { ...n, placement: 'sub', subOrder: subRankMap.get(nid), featured: false };
            }
            return { ...n, placement: 'archive', subOrder: 0, featured: false };
        });
        return resolvedPublished.concat(draftList);
    },

    calculateBomCost(co) {
        if (!co) return 0;
        const bomKeysSet = new Set(Array.isArray(co.bom) ? co.bom.map(String) : []);
        if (bomKeysSet.size === 0) return 0;
        const blockedB2B = new Set(['VENDIDO', 'EN_VENTA', 'PENDIENTE_FINANZAS', 'RECHAZADO_FINANZAS']);
        let total = 0;
        (co.orders || []).filter(o => o && (o.status === 'EJECUTADO' || ((o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE') && o.partialExecuted))).forEach(o => {
            (o.items || []).forEach((it, idx) => {
                if (!it) return;
                const isReceived = (o.status === 'EJECUTADO' || it.executed === true);
                if (isReceived && !blockedB2B.has(it.b2bStatus) && bomKeysSet.has(`${o.id}-${idx}`)) {
                    total += (Number(it.price) || 0) * (Number(it.qty) || 1);
                }
            });
        });
        return Math.round((total + Number.EPSILON) * 100) / 100;
    },

    getCompanySponsorAmount(co) {
        if (!co) return 0;
        if (co.sponsorData && !isNaN(Number(co.sponsorData.amount)) && Number(co.sponsorData.amount) > 0) {
            return Number(co.sponsorData.amount);
        }
        if (co.sponsorAwarded && typeof SPONSOR_TIERS_DEF !== 'undefined' && SPONSOR_TIERS_DEF[co.sponsorAwarded]) {
            return Number(SPONSOR_TIERS_DEF[co.sponsorAwarded].amount) || 0;
        }
        return 0;
    },

    getCompanyGrossOperatingCosts(co) {
        if (!co) return 0;
        const ledger = Array.isArray(co.ledger) ? co.ledger : [];
        const virtualSpend = ledger
            .filter(l => Number(l.delta) < 0)
            .reduce((acc, l) => acc + Math.abs(Number(l.delta) || 0), 0);
        return Math.round((virtualSpend + Number.EPSILON) * 100) / 100;
    },

    getCompanyOperatingCosts(co) {
        if (!co) {
            return { gross: 0, sponsorReduction: 0, net: 0, valueOf() { return 0; }, toString() { return '0'; }, toFixed(d) { return (0).toFixed(d); } };
        }
        const gross = this.getCompanyGrossOperatingCosts(co);
        const sponsorReduction = this.getCompanySponsorAmount(co);
        const net = Math.max(0, Math.round((gross - sponsorReduction + Number.EPSILON) * 100) / 100);
        return { 
            gross, 
            sponsorReduction, 
            net,
            valueOf() { return this.net; },
            toString() { return String(this.net); },
            toFixed(d) { return this.net.toFixed(d); }
        };
    },

    encodeSecret(str) {
        if (!str) return '';
        const s = String(str);
        let res = '';
        for (let i = 0; i < s.length; i++) {
            res += String.fromCharCode(s.charCodeAt(i) ^ this._vaultKey.charCodeAt(i % this._vaultKey.length));
        }
        return 'VLT_' + btoa(res);
    },

    decodeSecret(enc) {
        if (!enc) return '';
        const s = String(enc);
        if (!s.startsWith('VLT_')) return s; 
        try {
            const raw = atob(s.slice(4));
            let res = '';
            for (let i = 0; i < raw.length; i++) {
                res += String.fromCharCode(raw.charCodeAt(i) ^ this._vaultKey.charCodeAt(i % this._vaultKey.length));
            }
            return res;
        } catch (e) {
            return '';
        }
    },

    getSecureRandomInt(min, max) {
        const lo = Math.min(min, max);
        const hi = Math.max(min, max);
        const range = hi - lo + 1;
        if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
            const buf = new Uint32Array(1);
            // Reducción sin sesgo de módulo (unbiased rejection sampling conforme AEPD VALiDA Cripto)
            const maxLimit = Math.floor(0xFFFFFFFF / range) * range;
            do {
                crypto.getRandomValues(buf);
            } while (buf[0] >= maxLimit);
            return lo + (buf[0] % range);
        }
        return Math.floor(lo + Math.random() * range);
    },

    generateCompanyCode(name) {
        const prefix = (name || 'MRS').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 3).padEnd(3, 'X');
        const num = this.getSecureRandomInt(1000, 9999);
        return `${prefix}-${num}`;
    },

    generateRandomPin(excludePins = []) {
        const excludeSet = new Set((excludePins || []).map(String));
        let pin = '';
        let attempts = 0;
        do {
            pin = this.getSecureRandomInt(1000, 9999).toString();
            attempts++;
        } while (excludeSet.has(pin) && attempts < 200);
        return pin;
    },

    generateCompanyPins(co) {
        const roles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA'];
        const existingAux = this.getRolePin(co, 'AUXILIAR');
        if (existingAux || (co && co.auxRoleDept)) {
            roles.push('AUXILIAR');
        }
        const used = new Set();
        const pins = {};
        roles.forEach(r => {
            let pin = '';
            let attempts = 0;
            do {
                pin = this.getSecureRandomInt(1000, 9999).toString();
                attempts++;
            } while (used.has(pin) && attempts < 200);
            used.add(pin);
            pins[r] = pin;
        });
        return pins;
    },

    getCompanyCode(co) {
        if (!co) return '';
        if (co.authVault && co.authVault.code) return this.decodeSecret(co.authVault.code);
        return co.accessCode || '';
    },

    setCompanyCode(co, newCode, touchTimestamp = true) {
        if (!co) return;
        const clean = String(newCode).trim().toUpperCase();
        co.authVault = co.authVault || { code: '', roles: {} };
        co.authVault.code = this.encodeSecret(clean);
        delete co.accessCode;
        if (touchTimestamp) {
            const now = Date.now();
            co.updatedAt = now;
            co.authUpdatedAt = now;
        }
    },

    getRolePin(co, role) {
        if (!co) return '';
        if (co.authVault && co.authVault.roles && co.authVault.roles[role]) {
            return this.decodeSecret(co.authVault.roles[role]);
        }
        if (co.roles && co.roles[role]) {
            const rawRolePin = String(co.roles[role]).trim();
            if (!rawRolePin.startsWith('VLT_') && rawRolePin.toUpperCase() !== 'PROTECTED') {
                return rawRolePin;
            }
        }
        return '';
    },

    setRolePin(co, role, newPin, touchTimestamp = true) {
        if (!co) return;
        co.authVault = co.authVault || { code: '', roles: {} };
        co.authVault.roles = co.authVault.roles || {};
        co.roles = co.roles || {};
        if (!newPin) {
            delete co.authVault.roles[role];
            delete co.roles[role];
        } else {
            co.authVault.roles[role] = this.encodeSecret(String(newPin).trim());
            co.roles[role] = 'PROTECTED'; 
        }
        if (touchTimestamp) {
            const now = Date.now();
            co.updatedAt = now;
            co.authUpdatedAt = now;
        }
    },

    getAuthToken(userObj, dataRoot = this.data) {
        if (userObj?.authToken) return userObj.authToken;
        if (typeof sessionStorage !== 'undefined') {
            const token = sessionStorage.getItem('marsket_token');
            if (token) return token;
        }
        return '';
    },

    migrate(d) {
        d = d || {};
        d.version = Number(d.version) || 1; 
        d.lastUpdated = d.lastUpdated || Date.now();
        d.config = d.config || {};
        if (!d.config.deliverableSchedule) {
            d.config.deliverableSchedule = {};
        }
        d.catalog = d.catalog && d.catalog.length > 0 ? d.catalog : JSON.parse(JSON.stringify(DEFAULT_STATE.catalog));
        d.companies = d.companies || JSON.parse(JSON.stringify(DEFAULT_STATE.companies));
        d.telemetry = d.telemetry || { totalLogins: 0, sessions: [] };
        d.telemetry.sessions = Array.isArray(d.telemetry.sessions) ? d.telemetry.sessions : [];

        d.suggestionsToAlex = Array.isArray(d.suggestionsToAlex) ? d.suggestionsToAlex : [];
        const TTL_MS = 72 * 60 * 60 * 1000;
        const now = Date.now();
        if (Array.isArray(d.coordinatorReports)) {
            d.coordinatorReports = d.coordinatorReports.filter(report => {
                const reportTime = report.createdAt ? new Date(report.createdAt).getTime() : (report.timestamp || now);
                return (now - reportTime) < TTL_MS;
            });
        }
        Object.keys(d.companies || {}).forEach(cid => {
            const co = d.companies[cid];
            if (Array.isArray(co.coordinatorReports)) {
                co.coordinatorReports = co.coordinatorReports.filter(report => {
                    const reportTime = report.createdAt ? new Date(report.createdAt).getTime() : (report.timestamp || now);
                    return (now - reportTime) < TTL_MS;
                });
            }
        });
        d.pendingCustom = Array.isArray(d.pendingCustom) ? d.pendingCustom : [];
        d.news = Array.isArray(d.news) ? d.news : [];
        d.deletedNewsIds = Array.isArray(d.deletedNewsIds) ? d.deletedNewsIds : [];
        d.officialNews = Array.isArray(d.officialNews) ? d.officialNews : [];
        d.deletedOfficialNewsIds = Array.isArray(d.deletedOfficialNewsIds) ? d.deletedOfficialNewsIds : [];
        const mergedNewsTombstones = Array.from(new Set([
            ...d.deletedNewsIds.map(String),
            ...d.deletedOfficialNewsIds.map(String)
        ]));
        d.deletedNewsIds = mergedNewsTombstones;
        d.deletedOfficialNewsIds = mergedNewsTombstones;
        const newsTombSet = new Set(mergedNewsTombstones);
        const byNewsId = new Map();
        d.officialNews.forEach(item => {
            if (!item || !item.id || newsTombSet.has(String(item.id))) return;
            const norm = this.normalizeNewsItem(item);
            if (norm) byNewsId.set(String(norm.id), norm);
        });
        d.news.forEach(item => {
            if (!item || !item.id || newsTombSet.has(String(item.id))) return;
            const norm = this.normalizeNewsItem(item);
            if (norm) byNewsId.set(String(norm.id), norm);
        });
        d.news = Array.from(byNewsId.values());
        d.news = this.applyEditorialSeeds(d.news, newsTombSet);
        const isCoordMigrate = Boolean(this.user && this.user.admin && String(this.user.role || '').startsWith('COORD'));
        if (!isCoordMigrate) {
            d.news = d.news.filter(n => n && n.status !== 'DRAFT');
        }
        d.news = this.resolveFeaturedNews(d.news);
        delete d.officialNews;
        d.vipStartups = Array.isArray(d.vipStartups) ? d.vipStartups : [];
        d.realCompanyLogos = (d.realCompanyLogos && typeof d.realCompanyLogos === 'object' && !Array.isArray(d.realCompanyLogos)) ? d.realCompanyLogos : {};
        d.realCompanyLogosUpdatedAt = Number(d.realCompanyLogosUpdatedAt) || 0;
        d.deletedPrintEditionIds = Array.isArray(d.deletedPrintEditionIds) ? d.deletedPrintEditionIds.map(String) : [];
        const delPrintSet = new Set(d.deletedPrintEditionIds);
        d.printEditions = Array.isArray(d.printEditions)
            ? d.printEditions.filter(pe => pe && pe.id && !delPrintSet.has(String(pe.id)))
            : [];
        d.printAdLibrary = Array.isArray(d.printAdLibrary) ? d.printAdLibrary : [];
        d.pressReleases = Array.isArray(d.pressReleases) ? d.pressReleases : [];
        d.b2bMarket = Array.isArray(d.b2bMarket) ? d.b2bMarket : [];
        d.b2bContracts = Array.isArray(d.b2bContracts) ? d.b2bContracts : [];
        d.securityIncidents = Array.isArray(d.securityIncidents) ? d.securityIncidents : [];
        
                d.deletedSuggestionIds = Array.isArray(d.deletedSuggestionIds) ? d.deletedSuggestionIds : [];
        d.deletedCompanyIds = Array.isArray(d.deletedCompanyIds) ? d.deletedCompanyIds.map(String) : [];
        d.deletedCatalogIds = Array.isArray(d.deletedCatalogIds) ? d.deletedCatalogIds.map(String) : [];
        d.deletedPendingCustomIds = Array.isArray(d.deletedPendingCustomIds) ? d.deletedPendingCustomIds.map(String) : [];
        if (d.deletedCatalogIds.length > 0 && Array.isArray(d.catalog)) {
            const delCatSet = new Set(d.deletedCatalogIds);
            d.catalog = d.catalog.filter(it => it && it.id && !delCatSet.has(String(it.id)));
        }
        if (d.deletedPendingCustomIds.length > 0 && Array.isArray(d.pendingCustom)) {
            const delPcSet = new Set(d.deletedPendingCustomIds);
            d.pendingCustom = d.pendingCustom.filter(p => p && !delPcSet.has(String(p.id)));
        }
        if (d.companies && d.deletedCompanyIds.length > 0) {
            d.deletedCompanyIds.forEach(delId => {
                delete d.companies[delId];
            });
        }
        d.dismissedNotificationIds = Array.isArray(d.dismissedNotificationIds) ? d.dismissedNotificationIds : [];
        d.finalContest = this.normalizeFinalContest(d.finalContest, d.companies, d.deletedCompanyIds);
        d.config.deadlines = d.config.deadlines || {};
        const hasOwn = Object.prototype.hasOwnProperty;
        if (!d.config.scheduleBaselineVersion || d.config.scheduleBaselineVersion < 1168) {
            d.config.scheduleBaselineVersion = 1168;
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            if (typeof DELIVERABLES_DEF !== 'undefined') {
                DELIVERABLES_DEF.forEach(def => {
                    if (!d.config.deadlines[def.key]) {
                        d.config.deadlines[def.key] = def.defaultDate;
                    }
                    const prevSched = d.config.deliverableSchedule[def.key] || {};
                    const hasExplicitGuide = hasOwn.call(prevSched, 'guideDocUrl');
                    const hasExplicitOpen = hasOwn.call(prevSched, 'openDate');
                    d.config.deliverableSchedule[def.key] = {
                        ...prevSched,
                        phase: prevSched.phase || def.phase || "I",
                        openDate: hasExplicitOpen ? prevSched.openDate : def.defaultOpenDate,
                        deadline: prevSched.deadline || d.config.deadlines[def.key] || def.defaultDate,
                        guideDocUrl: hasExplicitGuide ? prevSched.guideDocUrl : (def.defaultGuideDocUrl || ""),
                        // No sellar Date.now() en datos recibidos o heredados para no derrotar cambios recientes en LWW
                        updatedAt: Number(prevSched.updatedAt) || 0
                    };
                });
            }
        } else if (typeof DELIVERABLES_DEF !== 'undefined') {
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            DELIVERABLES_DEF.forEach(def => {
                if (d.config.deliverableSchedule[def.key]) {
                    d.config.deliverableSchedule[def.key].phase = d.config.deliverableSchedule[def.key].phase || def.phase || "I";
                }
                if (!d.config.deadlines[def.key]) {
                    if (def.key === 'technicalReport' && d.config.deadlines.techReport) {
                        d.config.deadlines[def.key] = d.config.deadlines.techReport;
                    } else if (typeof DEFAULT_DEADLINES !== 'undefined' && DEFAULT_DEADLINES[def.key]) {
                        d.config.deadlines[def.key] = DEFAULT_DEADLINES[def.key];
                    } else {
                        d.config.deadlines[def.key] = def.defaultDate;
                    }
                }
            });
        }

        if (d.config.scheduleBaselineVersion < 2009) {
            d.config.scheduleBaselineVersion = 2009;
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            if (typeof DELIVERABLES_DEF !== 'undefined') {
                ['preliminaryReport', 'budgetInitial'].forEach(tKey => {
                    const def = DELIVERABLES_DEF.find(x => x.key === tKey);
                    if (!def || !def.defaultGuideDocUrl) return;
                    const prev = d.config.deliverableSchedule[tKey] || {};
                    if (!prev.guideDocUrl || !String(prev.guideDocUrl).trim()) {
                        d.config.deliverableSchedule[tKey] = {
                            ...prev,
                            phase: prev.phase || def.phase || "I",
                            openDate: hasOwn.call(prev, 'openDate') ? prev.openDate : def.defaultOpenDate,
                            deadline: prev.deadline || d.config.deadlines[tKey] || def.defaultDate,
                            guideDocUrl: def.defaultGuideDocUrl,
                            clearedGuide: false,
                            updatedAt: Number(prev.updatedAt) || 0
                        };
                    }
                });
            }
        }

        if (d.config.scheduleBaselineVersion < 2031) {
            d.config.scheduleBaselineVersion = 2031;
            d.config.deliverableSchedule = d.config.deliverableSchedule || {};
            if (typeof DELIVERABLES_DEF !== 'undefined') {
                ['decisionDiary_dec', 'decisionDiary_apr'].forEach(dKey => {
                    const def = DELIVERABLES_DEF.find(x => x.key === dKey);
                    if (!def || !def.defaultGuideDocUrl) return;
                    const prev = d.config.deliverableSchedule[dKey] || {};
                    const prevUrl = String(prev.guideDocUrl || '').trim();
                    const isOldOrEmpty = !prevUrl || prevUrl.includes('1QDzumCcDHLWcQJlkPSaA1Q16Kj0Ff9wsHiPf_clLau8');
                    if (isOldOrEmpty && prev.clearedGuide !== true) {
                        d.config.deliverableSchedule[dKey] = {
                            ...prev,
                            phase: prev.phase || def.phase || "I",
                            openDate: hasOwn.call(prev, 'openDate') ? prev.openDate : def.defaultOpenDate,
                            deadline: prev.deadline || d.config.deadlines[dKey] || def.defaultDate,
                            guideDocUrl: def.defaultGuideDocUrl,
                            clearedGuide: false,
                            updatedAt: Number(prev.updatedAt) || 0
                        };
                    }
                });
            }
        }

        if (!d.config.catalogBaselineVersion || d.config.catalogBaselineVersion < 1131) {
            d.config.catalogBaselineVersion = 1131;
            const officialCatalog = DEFAULT_STATE.catalog;
            const existingMap = new Map();
            if (Array.isArray(d.catalog)) {
                d.catalog.forEach(item => {
                    if (item && item.id) existingMap.set(String(item.id), item);
                });
            }
            d.catalog = officialCatalog.map(offItem => {
                const existing = existingMap.get(String(offItem.id));
                if (existing) {
                    return {
                        ...offItem,
                        price: typeof existing.price === 'number' && !isNaN(existing.price) ? existing.price : offItem.price,
                        origin: existing.origin || offItem.origin
                    };
                }
                return { ...offItem };
            });
            // Preservar articulos especiales creados ad-hoc por el profesorado
            existingMap.forEach((item, id) => {
                if (id.startsWith('CUST-') || !officialCatalog.some(o => String(o.id) === id)) {
                    if (!d.catalog.some(c => String(c.id) === id)) {
                        d.catalog.push(item);
                    }
                }
            });
            const postDelCatSet = new Set((d.deletedCatalogIds || []).map(String));
            if (postDelCatSet.size > 0) {
                d.catalog = d.catalog.filter(it => it && !postDelCatSet.has(String(it.id)));
            }
        }

        d.config.guidelines = d.config.guidelines || { techReportDocUrl: "", techReportNotes: "" };
        d.config.orbita = (d.config.orbita && typeof d.config.orbita === 'object')
            ? { currentEditionNumber: Math.max(0, parseInt(d.config.orbita.currentEditionNumber, 10) || 0) }
            : { currentEditionNumber: 0 };
        d.config.teachers = d.config.teachers || JSON.parse(JSON.stringify(DEFAULT_STATE.config.teachers));
        
        if(d.config.teachers.COORD) {
            delete d.config.teachers.COORD;
            d.config.teachers.COORD_MARIO = { name: "Coordinación - Mario", canSponsor: true };
            d.config.teachers.COORD_ALEX = { name: "Coordinación - Alex", canSponsor: true };
        }
        if (d.config.teachers && 'BIO' in d.config.teachers) {
            delete d.config.teachers.BIO;
        }

        const countries = ['China', 'Alemania', 'España', 'Turquía', 'Marruecos', 'ESA / Francia', 'Polonia', 'Italia', 'Portugal', 'India', 'República Checa', 'Japón'];
        d.catalog.forEach(item => {
            if (!item.origin) item.origin = countries[Math.floor(Math.random() * countries.length)];
        });

        const defDocs = {
            preliminaryReport: null, technicalReport: null, hoja_taller_fyq: null,
            brandIdentity_dec: null, brandIdentity_apr: null, businessModelDoc: null, businessModelCanvas: null, decisionDiary_dec: null, decisionDiary_apr: null,
            investorDossier: null,
            goniometerEvidence: null, mathReportDist: null, mathReportTwoPoints: null, mathReportFinal: null,
            budgetInitial: null, incomeStatement: null, budgetPostProto: null, balanceSheet: null,
            oralPresentation: null, writtenEssays: null
        };

        const defaultCodes = {
            sandbox_master: 'TEST-0000',
            sandbox_student: 'TEST-1111',
            astromars: 'AST-1010',
            redares: 'RED-2020',
            olympus: 'OLY-3030',
            curiosity: 'CUR-4040',
            phoenix: 'PHX-5050',
            valleys: 'VAL-6060',
            titan: 'TTN-7070',
            nova: 'NOV-8080',
            vortex: 'VTX-9090',
            astra: 'AST-1010',
            orion: 'ORI-2020',
            stellar: 'STL-3030'
        };

        if (!d.companies['sandbox_master']) {
            d.companies['sandbox_master'] = {
                name: "MARS-X SANDBOX (PRUEBAS)",
                classGroup: "TEST",
                balance: 2400,
                isTestCompany: true,
                unlockAllContracts: true,
                roles: {
                    CEO: '1234',
                    TECNICO: '1234',
                    FINANZAS: '1234',
                    MARKETING: '1234',
                    OPERACIONES_IA: '1234',
                    AUXILIAR: '1234'
                },
                authVault: {
                    code: 'TEST-0000',
                    roles: {
                        CEO: '1234',
                        TECNICO: '1234',
                        FINANZAS: '1234',
                        MARKETING: '1234',
                        OPERACIONES_IA: '1234',
                        AUXILIAR: '1234'
                    }
                },
                contracts: {},
                ledger: []
            };
        } else {
            if (!d.companies['sandbox_master'].name || d.companies['sandbox_master'].name === 'SANDBOX_MASTER') {
                d.companies['sandbox_master'].name = "MARS-X SANDBOX (PRUEBAS)";
            }
            d.companies['sandbox_master'].unlockAllContracts = true;
            d.companies['sandbox_master'].classGroup = 'TEST';
            d.companies['sandbox_master'].isTestCompany = true;
            d.companies['sandbox_master'].contracts = d.companies['sandbox_master'].contracts || {};
            if (Array.isArray(d.companies['sandbox_master'].ledger)) {
                d.companies['sandbox_master'].ledger = d.companies['sandbox_master'].ledger.filter(tx => tx && tx.id !== 'LEDGER_INIT_TEST');
            }
            if (!this.getCompanyCode(d.companies['sandbox_master'])) {
                this.setCompanyCode(d.companies['sandbox_master'], 'TEST-0000', false);
            }
            ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'].forEach(r => {
                if (!this.getRolePin(d.companies['sandbox_master'], r)) {
                    this.setRolePin(d.companies['sandbox_master'], r, '1234', false);
                }
            });
        }

        if (!d.companies['sandbox_student']) {
            d.companies['sandbox_student'] = {
                name: "MARS-X ALUMNO (ESTÁNDAR)",
                classGroup: "TEST",
                balance: 2400,
                isTestCompany: true,
                unlockAllContracts: false,
                slogan: "",
                valueProposition: "",
                roles: {
                    CEO: '1234',
                    TECNICO: '1234',
                    FINANZAS: '1234',
                    MARKETING: '1234',
                    OPERACIONES_IA: '1234',
                    AUXILIAR: '1234'
                },
                authVault: {
                    code: 'TEST-1111',
                    roles: {
                        CEO: '1234',
                        TECNICO: '1234',
                        FINANZAS: '1234',
                        MARKETING: '1234',
                        OPERACIONES_IA: '1234',
                        AUXILIAR: '1234'
                    }
                },
                deliverables: {},
                contracts: {},
                ledger: []
            };
        } else {
            if (!d.companies['sandbox_student'].name || d.companies['sandbox_student'].name === 'SANDBOX_STUDENT') {
                d.companies['sandbox_student'].name = "MARS-X ALUMNO (ESTÁNDAR)";
            }
            d.companies['sandbox_student'].unlockAllContracts = false;
            d.companies['sandbox_student'].classGroup = 'TEST';
            d.companies['sandbox_student'].isTestCompany = true;
            d.companies['sandbox_student'].contracts = d.companies['sandbox_student'].contracts || {};
            if (!this.getCompanyCode(d.companies['sandbox_student'])) {
                this.setCompanyCode(d.companies['sandbox_student'], 'TEST-1111', false);
            }
            ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'].forEach(r => {
                if (!this.getRolePin(d.companies['sandbox_student'], r)) {
                    this.setRolePin(d.companies['sandbox_student'], r, '1234', false);
                }
            });
        }

        for(let k in d.companies) {
            let co = d.companies[k];
            if (!co) continue;
            
            co.name = co.name || k.toUpperCase();
            co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
            co.balance = this.calculateBalance(co);
            co.updatedAt = Number(co.updatedAt) || 0;
            co.authUpdatedAt = Number(co.authUpdatedAt) || 0;
            co.roles = co.roles || {};
            co.contracts = (co.contracts && typeof co.contracts === 'object' && !Array.isArray(co.contracts)) ? co.contracts : {};
            
            if(co.roles.QUIMICA || co.roles.AERODINAMICA || co.roles.IA) {
                const defaultPin = co.roles.CEO || '1234';
                co.roles = {
                    CEO: co.roles.CEO || defaultPin,
                    TECNICO: co.roles.QUIMICA || defaultPin,
                    FINANZAS: co.roles.FINANZAS || defaultPin,
                    MARKETING: co.roles.MARKETING || defaultPin,
                    OPERACIONES_IA: co.roles.IA || defaultPin
                };
            }

            co.authVault = co.authVault || { code: '', roles: {} };
            co.authVault.roles = co.authVault.roles || {};

            let currentPlainCode = this.getCompanyCode(co);
            if (!currentPlainCode && defaultCodes[k]) {
                currentPlainCode = defaultCodes[k];
                this.setCompanyCode(co, currentPlainCode, false);
            }

            const baseRoles = ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES_IA', 'AUXILIAR'];
            baseRoles.forEach(r => {
                const existingPin = this.getRolePin(co, r);
                if (existingPin && existingPin !== 'PROTECTED') {
                    this.setRolePin(co, r, existingPin, false);
                }
            });

            const asPlainDict = (val) => (val && typeof val === 'object' && !Array.isArray(val)) ? val : {};
            co.roles = asPlainDict(co.roles);
            co.loginStats = (co.loginStats && typeof co.loginStats === 'object' && !Array.isArray(co.loginStats)) ? co.loginStats : { totalLogins: 0, roles: {} };
            co.loginStats.roles = asPlainDict(co.loginStats.roles);
            co.classGroup = co.classGroup || 'A';
            co.brandApproval = co.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "", updatedAt: 0 };
            co.brandApproval.driveUrl = co.brandApproval.driveUrl || "";
            co.brandApproval.expId = co.brandApproval.expId || "";
            co.pendingSlogan = co.pendingSlogan || null;
            co.pendingMission = co.pendingMission || null;
            co.brandStatus = co.brandStatus || 'APPROVED';
            co.auxRoleRequest = co.auxRoleRequest || { status: co.roles['AUXILIAR'] ? 'APROBADO' : 'INACTIVO', dept: co.auxRoleDept || '', pin: this.getRolePin(co, 'AUXILIAR') || '', updatedAt: 0 };
            co.deliverables = asPlainDict(co.deliverables);
            co.contracts = asPlainDict(co.contracts);
            co.phaseBalances = asPlainDict(co.phaseBalances);
            co.pressReleases = asPlainDict(co.pressReleases);
            
            const validHojaStatuses = ['DRAFT_TECNICO', 'EN_TALLER_OPERARIO', 'DEVUELTO_A_TECNICO', 'CEO_REVISION', 'SUBMITTED_TO_CEO', 'DELIVERED_TO_TEACHER'];
            for (let docKey in defDocs) {
                if (co.deliverables[docKey] === undefined) {
                    co.deliverables[docKey] = null;
                } else if (co.deliverables[docKey] !== null) {
                    if (typeof co.deliverables[docKey] === 'string') {
                        co.deliverables[docKey] = {
                            driveUrl: co.deliverables[docKey],
                            status: 'DELIVERED_TO_TEACHER',
                            returnReasonId: null,
                            returnReason: null,
                            updatedAt: new Date().toISOString()
                        };
                    } else if (typeof co.deliverables[docKey] === 'object') {
                        if (docKey === 'hoja_taller_fyq') {
                            if (!validHojaStatuses.includes(co.deliverables[docKey].status)) {
                                co.deliverables[docKey].status = 'DRAFT_TECNICO';
                            }
                            if (!Array.isArray(co.deliverables[docKey].history)) {
                                co.deliverables[docKey].history = [];
                            }
                        } else if (!co.deliverables[docKey].status) {
                            co.deliverables[docKey].status = 'DELIVERED_TO_TEACHER';
                        }
                        co.deliverables[docKey].updatedAt = co.deliverables[docKey].updatedAt || new Date().toISOString();
                    }
                }
            }

            co.flightTests = (Array.isArray(co.flightTests) ? co.flightTests : []).map(f => ({
                ...f,
                naHCO3: !isNaN(Number(f?.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f?.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f?.weightG)) ? Number(f.weightG) : 0)),
                vinegar: !isNaN(Number(f?.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f?.waterMl)) ? Number(f.waterMl) : 0),
                costEurV: !isNaN(Number(f?.costEurV)) ? Number(f.costEurV) : 0,
                heightMm: !isNaN(Number(f?.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f?.heightM)) ? Number(f.heightM) * 1000 : 0),
                efficiency: !isNaN(Number(f?.efficiency)) ? Number(f.efficiency) : 0,
                videoUrl: typeof f?.videoUrl === 'string' ? f.videoUrl.trim() : ''
            }));
            co.votingMotions = Array.isArray(co.votingMotions) ? co.votingMotions : [];
            co.aiPrompts = Array.isArray(co.aiPrompts) ? co.aiPrompts : [];
            co.deletedLedgerTxIds = Array.isArray(co.deletedLedgerTxIds) ? co.deletedLedgerTxIds.map(String) : [];
            co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
            if (co.deletedLedgerTxIds.length > 0) {
                const delTxSet = new Set(co.deletedLedgerTxIds);
                co.ledger = co.ledger.filter(tx => tx && !delTxSet.has(String(tx.id || tx.tx_id || '')));
                co.balance = this.calculateBalance(co);
            }
            co.realCosts = Array.isArray(co.realCosts) ? co.realCosts : [];
            co.cart = Array.isArray(co.cart) ? co.cart : [];
            co.cartUpdatedAt = Number(co.cartUpdatedAt) || 0;
            co.orders = Array.isArray(co.orders) ? co.orders : [];
            co.grades = (co.grades && typeof co.grades === 'object' && !Array.isArray(co.grades)) ? co.grades : {};
            co.slogan = co.slogan || "";
            co.valueProposition = co.valueProposition || "";
            co.logo = co.logo || null;
            co.bom = Array.isArray(co.bom) ? co.bom : [];
            co.bomUpdatedAt = Number(co.bomUpdatedAt) || 0;
            co.brandUpdatedAt = Number(co.brandUpdatedAt) || 0;
            co.sponsorAwarded = co.sponsorAwarded || null;
            co.marketingCampaigns = Array.isArray(co.marketingCampaigns) ? co.marketingCampaigns : [];
            co.marketingCampaigns.forEach(c => {
                if (c && Array.isArray(c.executedActions)) {
                    c.executedActions.forEach(act => {
                        if (act) {
                            if (!act.status) act.status = 'VALIDADO_CEO';
                            act.feedback = act.feedback || '';
                            act.returnDriveUrl = act.returnDriveUrl || '';
                            act.url = act.url || act.driveUrl || '';
                            act.driveUrl = act.driveUrl || act.url || '';
                        }
                    });
                }
            });
            co.inactivityReports = Array.isArray(co.inactivityReports) ? co.inactivityReports : [];
            co.sponsorData = co.sponsorData || { name: null, tier: null, amount: 0, date: null, logo: null };
            if (co.sponsorAwarded && !co.sponsorData.tier) {
                co.sponsorData.tier = co.sponsorAwarded;
            }
            if (co.sponsorAwarded && (!co.sponsorData.amount || co.sponsorData.amount === 0) && typeof SPONSOR_TIERS_DEF !== 'undefined' && SPONSOR_TIERS_DEF[co.sponsorAwarded]) {
                co.sponsorData.amount = SPONSOR_TIERS_DEF[co.sponsorAwarded].amount;
            }
            co.auxRoleDept = co.auxRoleDept || null;
            co.notifications = Array.isArray(co.notifications) ? co.notifications : [];
            co.sanctions = Array.isArray(co.sanctions) ? co.sanctions : [];
            co.crisisAlerts = Array.isArray(co.crisisAlerts) ? co.crisisAlerts : [];
            co.executiveResolutions = Array.isArray(co.executiveResolutions) ? co.executiveResolutions : [];
            co.meetingMinutes = Array.isArray(co.meetingMinutes) ? co.meetingMinutes : [];
            co.specialItemRequests = Array.isArray(co.specialItemRequests) ? co.specialItemRequests : [];
        }
        return d;
    },

    mergeAuxRoleRequest(lReq, sReq, lTime = 0, sTime = 0) {
        if (!lReq && !sReq) return undefined;
        if (!lReq) return JSON.parse(JSON.stringify(sReq));
        if (!sReq) return JSON.parse(JSON.stringify(lReq));

        const isPlaceholderInactive = (r) => Boolean(r && r.status === 'INACTIVO' && !r.dept && !r.date && !(Number(r.updatedAt) > 0));
        if (isPlaceholderInactive(lReq) && !isPlaceholderInactive(sReq)) {
            return JSON.parse(JSON.stringify(sReq));
        }
        if (isPlaceholderInactive(sReq) && !isPlaceholderInactive(lReq)) {
            return JSON.parse(JSON.stringify(lReq));
        }

        const lUpd = Number(lReq.updatedAt) || 0;
        const sUpd = Number(sReq.updatedAt) || 0;
        if (lUpd !== sUpd) {
            return JSON.parse(JSON.stringify(lUpd > sUpd ? lReq : sReq));
        }

        if (sReq.status === 'PENDIENTE' && lReq.status === 'INACTIVO') {
            return JSON.parse(JSON.stringify(sReq));
        }
        if (lReq.status === 'PENDIENTE' && sReq.status === 'INACTIVO') {
            return JSON.parse(JSON.stringify(lReq));
        }

        return JSON.parse(JSON.stringify(lTime > sTime ? lReq : sReq));
    },

    _parseSafeTs(val) {
        if (val === null || val === undefined || val === '') return 0;
        if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
        const asNum = Number(val);
        if (Number.isFinite(asNum)) return asNum;
        const parsed = Date.parse(String(val));
        return Number.isFinite(parsed) ? parsed : 0;
    },

    mergeBrandApproval(lBrand, sBrand, lTime = 0, sTime = 0) {
        if (!lBrand && !sBrand) return undefined;
        if (!lBrand) return JSON.parse(JSON.stringify(sBrand));
        if (!sBrand) return JSON.parse(JSON.stringify(lBrand));

        const isPlaceholderApproved = (b) => Boolean(
            b && b.status === 'APROBADO' &&
            !b.pendingLogo && !b.pendingSlogan && !b.driveUrl && !b.expId && !b.feedback &&
            !(this._parseSafeTs(b.updatedAt) > 0) && !(this._parseSafeTs(b.endorsedAt) > 0) && !(this._parseSafeTs(b.date) > 0)
        );
        if (isPlaceholderApproved(lBrand) && !isPlaceholderApproved(sBrand)) {
            return JSON.parse(JSON.stringify(sBrand));
        }
        if (isPlaceholderApproved(sBrand) && !isPlaceholderApproved(lBrand)) {
            return JSON.parse(JSON.stringify(lBrand));
        }

        const getBrTs = (b) => Math.max(this._parseSafeTs(b?.updatedAt), this._parseSafeTs(b?.endorsedAt), this._parseSafeTs(b?.date));
        const lTs = getBrTs(lBrand);
        const sTs = getBrTs(sBrand);
        if (lTs !== sTs) {
            return JSON.parse(JSON.stringify(lTs > sTs ? lBrand : sBrand));
        }

        return JSON.parse(JSON.stringify(lTime > sTime ? lBrand : sBrand));
    },

    mergeNameChangeRequest(lReq, sReq, lTime = 0, sTime = 0) {
        if (!lReq && !sReq) return undefined;
        if (!lReq) return JSON.parse(JSON.stringify(sReq));
        if (!sReq) return JSON.parse(JSON.stringify(lReq));

        const getNcTs = (r) => Math.max(this._parseSafeTs(r?.updatedAt), this._parseSafeTs(r?.resolvedAt), this._parseSafeTs(r?.timestamp));
        const lTs = getNcTs(lReq);
        const sTs = getNcTs(sReq);
        if (lTs !== sTs) {
            return JSON.parse(JSON.stringify(lTs > sTs ? lReq : sReq));
        }

        if (lReq.status === 'PENDIENTE' && sReq.status && sReq.status !== 'PENDIENTE') {
            return JSON.parse(JSON.stringify(sReq));
        }
        if (sReq.status === 'PENDIENTE' && lReq.status && lReq.status !== 'PENDIENTE') {
            return JSON.parse(JSON.stringify(lReq));
        }

        return JSON.parse(JSON.stringify(lTime > sTime ? lReq : sReq));
    },

    mergePhaseDict(lDict, sDict, localWinsOnTie = false) {
        if (!lDict && !sDict) return undefined;
        const lObj = (lDict && typeof lDict === 'object') ? lDict : {};
        const sObj = (sDict && typeof sDict === 'object') ? sDict : {};
        const keys = new Set([...Object.keys(sObj), ...Object.keys(lObj)]);
        const out = {};

        const getPhTs = (item) => Math.max(
            this._parseSafeTs(item?.updatedAt),
            this._parseSafeTs(item?.ceoValidatedAt),
            this._parseSafeTs(item?.returnedAt),
            this._parseSafeTs(item?.publishedAt),
            this._parseSafeTs(item?.timestamp)
        );

        keys.forEach(ph => {
            const lItem = lObj[ph];
            const sItem = sObj[ph];
            if (lItem && !sItem) {
                out[ph] = JSON.parse(JSON.stringify(lItem));
            } else if (sItem && !lItem) {
                out[ph] = JSON.parse(JSON.stringify(sItem));
            } else if (lItem && sItem) {
                const lTs = getPhTs(lItem);
                const sTs = getPhTs(sItem);
                if (lTs !== sTs) {
                    out[ph] = JSON.parse(JSON.stringify(lTs > sTs ? lItem : sItem));
                } else {
                    out[ph] = JSON.parse(JSON.stringify(localWinsOnTie ? lItem : sItem));
                }
            }
        });
        return out;
    },

    mergeFinalContest(sFc, lFc, companies = {}, deletedCompanyIds = [], isCoordUser = false) {
        if (!sFc && !lFc) return this.createDefaultFinalContest();
        if (!sFc) return this.normalizeFinalContest(lFc, companies, deletedCompanyIds);
        if (!lFc) return this.normalizeFinalContest(sFc, companies, deletedCompanyIds);

        const sTime = this._parseSafeTs(sFc.updatedAt);
        const lTime = this._parseSafeTs(lFc.updatedAt);
        const preferLocal = Boolean(isCoordUser && lTime > sTime);

        const mergedRaw = JSON.parse(JSON.stringify(preferLocal ? lFc : sFc));
        const classes = typeof CONTEST_CLASSES !== 'undefined' ? CONTEST_CLASSES : ['A', 'B', 'C', 'D', 'E', 'F'];
        mergedRaw.finalists = mergedRaw.finalists || {};
        classes.forEach(cls => {
            const sFin = sFc.finalists?.[cls] || null;
            const lFin = lFc.finalists?.[cls] || null;
            if (preferLocal) mergedRaw.finalists[cls] = lFin || (lTime === 0 ? sFin : lFin);
            else mergedRaw.finalists[cls] = sFin || (isCoordUser && !sFin && lFin && sTime === 0 ? lFin : sFin);
        });

        const mergedLaunches = {};
        const sLaunches = (sFc.launches && typeof sFc.launches === 'object') ? sFc.launches : {};
        const lLaunches = (lFc.launches && typeof lFc.launches === 'object') ? lFc.launches : {};
        const allLaunchCids = new Set([...Object.keys(sLaunches), ...Object.keys(lLaunches)]);
        allLaunchCids.forEach(cid => {
            const sL = sLaunches[cid];
            const lL = lLaunches[cid];
            if (sL && !lL) {
                if (!preferLocal || this._parseSafeTs(sL.recordedAt) > lTime) {
                    mergedLaunches[cid] = JSON.parse(JSON.stringify(sL));
                }
            } else if (lL && !sL && isCoordUser) {
                if (preferLocal || this._parseSafeTs(lL.recordedAt) > sTime) {
                    mergedLaunches[cid] = JSON.parse(JSON.stringify(lL));
                }
            } else if (sL && lL) {
                const sRec = this._parseSafeTs(sL.recordedAt);
                const lRec = this._parseSafeTs(lL.recordedAt);
                const pickLocalLaunch = isCoordUser && (lRec > sRec || (lRec === sRec && lTime > sTime));
                mergedLaunches[cid] = JSON.parse(JSON.stringify(pickLocalLaunch ? lL : sL));
            }
        });
        mergedRaw.launches = mergedLaunches;
        mergedRaw.updatedAt = Math.max(sTime, lTime);
        return this.normalizeFinalContest(mergedRaw, companies, deletedCompanyIds);
    },

    mergeData(serverData, localData) {
        if (!serverData) return localData;
        if (!localData) return serverData;

        const reconcileExecutedActions = (actionsLocal, actionsServer) => {
            if (!Array.isArray(actionsLocal)) actionsLocal = [];
            if (!Array.isArray(actionsServer)) actionsServer = [];

            const serverMap = new Map();
            actionsServer.forEach(a => { if (a && a.id) serverMap.set(String(a.id), a); });

            const localMap = new Map();
            actionsLocal.forEach(a => { if (a && a.id) localMap.set(String(a.id), a); });

            const allIds = new Set([...localMap.keys(), ...serverMap.keys()]);
            const result = [];

            allIds.forEach(id => {
                const lAct = localMap.get(id);
                const sAct = serverMap.get(id);

                if (sAct && !lAct) {
                    result.push({ ...sAct });
                } else if (lAct && !sAct) {
                    result.push({ ...lAct });
                } else {
                    const lSub = Number(lAct.resubmittedAt) || 0;
                    const sSub = Number(sAct.resubmittedAt) || 0;
                    const lRev = Number(lAct.reviewedAt) || 0;
                    const sRev = Number(sAct.reviewedAt) || 0;
                    const lEff = Math.max(lSub, lRev, Number(lAct.updatedAt || lAct.createdAt || 0));
                    const sEff = Math.max(sSub, sRev, Number(sAct.updatedAt || sAct.createdAt || 0));

                    const maxSub = Math.max(lSub, sSub);
                    const maxRev = Math.max(lRev, sRev);
                    const isDecided = (st) => st === 'VALIDADO_CEO' || st === 'RECHAZADO_CEO';

                    let winner = sAct;
                    let loser = lAct;
                    let forceResubmitPending = false;

                    if (maxSub > maxRev) {
                        // Subsanación causalmente posterior al último dictamen del CEO
                        winner = (lSub >= sSub) ? lAct : sAct;
                        loser = (winner === lAct) ? sAct : lAct;
                        forceResubmitPending = true;
                    } else if (maxRev > maxSub && maxRev > 0) {
                        // Dictamen del CEO causalmente posterior
                        winner = (lRev > sRev) ? lAct : sAct;
                        loser = (winner === lAct) ? sAct : lAct;
                    } else if (lEff !== sEff) {
                        winner = (lEff > sEff) ? lAct : sAct;
                        loser = (winner === lAct) ? sAct : lAct;
                    } else if (isDecided(sAct.status) && !isDecided(lAct.status)) {
                        winner = sAct;
                        loser = lAct;
                    } else if (isDecided(lAct.status) && !isDecided(sAct.status)) {
                        winner = lAct;
                        loser = sAct;
                    }

                    const status = forceResubmitPending ? 'PENDIENTE_CEO' : (winner.status || loser.status || 'PENDIENTE_CEO');
                    const feedback = forceResubmitPending ? '' : (winner.feedback || '');
                    const returnDriveUrl = forceResubmitPending ? '' : (winner.returnDriveUrl || '');
                    const reviewedAt = (maxRev > 0) ? maxRev : (winner.reviewedAt || loser.reviewedAt || null);
                    const resubmittedAt = (maxSub > 0) ? maxSub : (winner.resubmittedAt || loser.resubmittedAt || undefined);
                    const finalUrl = winner.url || winner.driveUrl || loser.url || loser.driveUrl || '';
                    const finalDriveUrl = winner.driveUrl || winner.url || loser.driveUrl || loser.url || '';

                    const mergedAct = {
                        ...loser,
                        ...winner,
                        status,
                        feedback,
                        returnDriveUrl,
                        reviewedAt,
                        url: finalUrl,
                        driveUrl: finalDriveUrl
                    };
                    if (resubmittedAt !== undefined) mergedAct.resubmittedAt = resubmittedAt;
                    result.push(mergedAct);
                }
            });

            return result;
        };

        const reconcileCompanyArray = (arrServer, arrLocal, arrName = '', localWinsOnTie = false, deletedLedgerTxIds = []) => {
            if (!Array.isArray(arrServer)) arrServer = [];
            if (!Array.isArray(arrLocal)) arrLocal = [];

            const getItemTs = (it) => Math.max(
                this._parseSafeTs(it?.updatedAt),
                this._parseSafeTs(it?.resubmittedAt),
                this._parseSafeTs(it?.executedAt),
                this._parseSafeTs(it?.lastPartialAt),
                this._parseSafeTs(it?.approvedAt),
                this._parseSafeTs(it?.rejectedAt),
                this._parseSafeTs(it?.resolvedAt),
                this._parseSafeTs(it?.reviewedAt),
                this._parseSafeTs(it?.endorsedAt),
                this._parseSafeTs(it?.createdAt),
                this._parseSafeTs(it?.timestamp)
            );

            const combinePair = (sItem, lItem) => {
                const sTs = getItemTs(sItem);
                const lTs = getItemTs(lItem);
                const pickLocal = (lTs !== sTs) ? (lTs > sTs) : localWinsOnTie;
                const newer = pickLocal ? lItem : sItem;
                const older = pickLocal ? sItem : lItem;

                const isRead = Boolean(sItem.read || lItem.read);
                const mergedReadBy = (sItem.readBy || lItem.readBy)
                    ? { ...(sItem.readBy || {}), ...(lItem.readBy || {}) }
                    : undefined;

                let status = newer.status;
                if (lTs === sTs && typeof newer.status === 'string' && newer.status.startsWith('PENDIENTE') && older.status && !String(older.status).startsWith('PENDIENTE')) {
                    status = older.status;
                }

                let executedActions = newer.executedActions;
                if (arrName === 'marketingCampaigns' || sItem.executedActions || lItem.executedActions) {
                    executedActions = reconcileExecutedActions(lItem.executedActions, sItem.executedActions);
                }

                let mergedVotes = undefined;
                if (arrName === 'votingMotions' && (sItem.votes || lItem.votes)) {
                    mergedVotes = { ...(sItem.votes || {}), ...(lItem.votes || {}) };
                    if (sItem.status === 'CERRADA' || lItem.status === 'CERRADA') {
                        status = 'CERRADA';
                    }
                }

                let mergedItems = Array.isArray(newer.items) ? JSON.parse(JSON.stringify(newer.items)) : newer.items;
                if (arrName === 'orders' && Array.isArray(mergedItems) && Array.isArray(older.items)) {
                    mergedItems = mergedItems.map((nIt, idx) => {
                        const oIt = older.items[idx];
                        if (oIt && oIt.executed && nIt && !nIt.executed && String(oIt.id || oIt.name) === String(nIt.id || nIt.name)) {
                            return { ...nIt, ...oIt };
                        }
                        return nIt;
                    });
                    if (sItem.status === 'EJECUTADO' || lItem.status === 'EJECUTADO') {
                        status = 'EJECUTADO';
                    }
                }

                return {
                    ...older,
                    ...newer,
                    read: isRead,
                    ...(mergedReadBy ? { readBy: mergedReadBy } : {}),
                    ...(mergedVotes ? { votes: mergedVotes } : {}),
                    ...(mergedItems !== undefined ? { items: mergedItems } : {}),
                    status: status || newer.status || older.status,
                    ...(executedActions ? { executedActions } : {})
                };
            };

            let combined;
            const dedupById = (arr) => {
                const seen = new Set();
                const res = [];
                arr.forEach(item => {
                    if (!item || !item.id) { res.push(item); return; }
                    const k = String(item.id);
                    if (!seen.has(k)) { seen.add(k); res.push(item); }
                });
                return res;
            };
            arrServer = dedupById(arrServer);
            arrLocal = dedupById(arrLocal);

            if (localWinsOnTie) {
                const serverMap = new Map();
                arrServer.forEach(i => { if (i && i.id) serverMap.set(String(i.id), i); });
                const localIds = new Set(arrLocal.map(i => String(i?.id)));
                const mergedPrimary = arrLocal.map(lItem => {
                    if (!lItem || !lItem.id) return lItem;
                    const sItem = serverMap.get(String(lItem.id));
                    return sItem ? combinePair(sItem, lItem) : lItem;
                });
                const missingFromLocal = arrServer.filter(i => i && i.id && !localIds.has(String(i.id)));
                combined = [...mergedPrimary, ...missingFromLocal];
            } else {
                const localMap = new Map();
                arrLocal.forEach(i => { if (i && i.id) localMap.set(String(i.id), i); });
                const serverIds = new Set(arrServer.map(i => String(i?.id)));
                const mergedPrimary = arrServer.map(sItem => {
                    if (!sItem || !sItem.id) return sItem;
                    const lItem = localMap.get(String(sItem.id));
                    return lItem ? combinePair(sItem, lItem) : sItem;
                });
                const missingFromServer = arrLocal.filter(i => i && i.id && !serverIds.has(String(i.id)));
                combined = [...missingFromServer, ...mergedPrimary];
            }

            if (arrName === 'notifications') {
                const dismissedIds = new Set([
                    ...(Array.isArray(serverData.dismissedNotificationIds) ? serverData.dismissedNotificationIds.map(String) : []),
                    ...(Array.isArray(localData.dismissedNotificationIds) ? localData.dismissedNotificationIds.map(String) : [])
                ]);
                combined = combined.filter(n => n && n.id && !dismissedIds.has(String(n.id)));
            }
            if (arrName === 'ledger' && Array.isArray(deletedLedgerTxIds) && deletedLedgerTxIds.length > 0) {
                const delTxSet = new Set(deletedLedgerTxIds.map(String));
                combined = combined.filter(tx => tx && !delTxSet.has(String(tx.id || tx.tx_id || '')));
            }
            return combined;
        };

        const companyArraysToMerge = ['orders', 'ledger', 'realCosts', 'flightTests', 'votingMotions', 'aiPrompts', 'marketingCampaigns', 'inactivityReports', 'notifications', 'sanctions', 'crisisAlerts', 'executiveResolutions', 'meetingMinutes', 'specialItemRequests', 'coordinatorReports'];
        const applyResetWinner = (target, winner) => {
            companyArraysToMerge.forEach(arrName => {
                target[arrName] = Array.isArray(winner[arrName]) ? JSON.parse(JSON.stringify(winner[arrName])) : [];
            });
            target.cart = Array.isArray(winner.cart) ? JSON.parse(JSON.stringify(winner.cart)) : [];
            target.cartUpdatedAt = this._parseSafeTs(winner.cartUpdatedAt);
            target.bom = Array.isArray(winner.bom) ? JSON.parse(JSON.stringify(winner.bom)) : [];
            target.bomUpdatedAt = this._parseSafeTs(winner.bomUpdatedAt);
            target.deletedLedgerTxIds = Array.isArray(winner.deletedLedgerTxIds) ? winner.deletedLedgerTxIds.map(String) : [];
            target.brandUpdatedAt = this._parseSafeTs(winner.brandUpdatedAt);
            target.deliverables = JSON.parse(JSON.stringify(winner.deliverables || {}));
            target.contracts = JSON.parse(JSON.stringify(winner.contracts || {}));
            target.grades = JSON.parse(JSON.stringify(winner.grades || {}));
            target.phaseBalances = JSON.parse(JSON.stringify(winner.phaseBalances || {}));
            target.pressReleases = JSON.parse(JSON.stringify(winner.pressReleases || {}));
            target.brandApproval = JSON.parse(JSON.stringify(winner.brandApproval || { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "", driveUrl: "", expId: "", updatedAt: 0 }));
            if (winner.brandStatus !== undefined) target.brandStatus = winner.brandStatus;
            else delete target.brandStatus;
            target.name = winner.name || target.name;
            target.slogan = winner.slogan || '';
            target.valueProposition = winner.valueProposition || '';
            target.logo = winner.logo || null;
            target.sponsorAwarded = winner.sponsorAwarded || null;
            target.sponsorData = JSON.parse(JSON.stringify(winner.sponsorData || { name: null, logo: null }));
            target.auxRoleDept = winner.auxRoleDept || null;
            target.auxRoleRequest = JSON.parse(JSON.stringify(winner.auxRoleRequest || { status: 'INACTIVO', dept: '', pin: '', updatedAt: 0 }));
            if (winner.launchLicense) target.launchLicense = JSON.parse(JSON.stringify(winner.launchLicense));
            else delete target.launchLicense;
            if (winner.nameChangeRequest) target.nameChangeRequest = JSON.parse(JSON.stringify(winner.nameChangeRequest));
            else delete target.nameChangeRequest;
            if (winner.nameChangeStatus !== undefined) target.nameChangeStatus = winner.nameChangeStatus;
            else delete target.nameChangeStatus;
            target.loginStats = JSON.parse(JSON.stringify(winner.loginStats || { totalLogins: 0, roles: {} }));
        };

        // Al recibir serverData de la red con Reset Epoch superior: retorno puro migrado sin mutar UI directamente aquí
        const localEpoch = parseInt((typeof localStorage !== 'undefined' ? localStorage.getItem('marsket_reset_epoch') : '0') || '0', 10);
        const serverEpoch = serverData.resetEpoch || 0;

        if (serverEpoch > localEpoch) {
            return this.migrate(JSON.parse(JSON.stringify(serverData)));
        }

        const merged = JSON.parse(JSON.stringify(serverData)); 

        // Resolución LWW para configuración y PINs docentes (evita rebote de PIN en el Claustro)
        if (localData.config) {
            merged.config = merged.config || {};
            const localCfgTime = Number(localData.config.updatedAt) || 0;
            const serverCfgTime = Number(serverData.config?.updatedAt) || 0;
            const maxBaseline = Math.max(
                Number(localData.config.scheduleBaselineVersion) || 0,
                Number(serverData.config?.scheduleBaselineVersion) || 0
            );
            if (maxBaseline > 0) {
                merged.config.scheduleBaselineVersion = maxBaseline;
            }

            if (localCfgTime > serverCfgTime) {
                merged.config.deadlines = JSON.parse(JSON.stringify(localData.config.deadlines || merged.config.deadlines || {}));
                merged.config.guidelines = JSON.parse(JSON.stringify(localData.config.guidelines || merged.config.guidelines || {}));
            }

            // Fusión granular de deliverableSchedule conservando siempre los datos más recientes por entregable
            merged.config.deliverableSchedule = merged.config.deliverableSchedule || {};
            merged.config.deadlines = merged.config.deadlines || {};
            const localSched = localData.config.deliverableSchedule || {};
            for (const dKey in localSched) {
                const lItem = localSched[dKey];
                const sItem = merged.config.deliverableSchedule[dKey];
                if (!sItem) {
                    merged.config.deliverableSchedule[dKey] = JSON.parse(JSON.stringify(lItem));
                    if (lItem?.deadline) merged.config.deadlines[dKey] = lItem.deadline;
                } else {
                    const lItemTime = Number(lItem?.updatedAt) || 0;
                    const sItemTime = Number(sItem?.updatedAt) || 0;
                    const useLocal = (lItemTime > sItemTime) || (lItemTime === 0 && sItemTime === 0 && localCfgTime > serverCfgTime);
                    if (useLocal) {
                        merged.config.deliverableSchedule[dKey] = JSON.parse(JSON.stringify(lItem));
                        if (lItem?.deadline) merged.config.deadlines[dKey] = lItem.deadline;
                    } else if (sItem?.deadline) {
                        merged.config.deadlines[dKey] = sItem.deadline;
                    }
                }
            }
            merged.config.updatedAt = Math.max(localCfgTime, serverCfgTime);
            if (localData.config.teachers) {
                merged.config.teachers = merged.config.teachers || {};
                for (let tk in localData.config.teachers) {
                    const lT = localData.config.teachers[tk];
                    const sT = merged.config.teachers[tk];
                    if (sT && lT) {
                        // NUNCA sobreescribir un PIN existente en el cliente con valores nulos o undefined de la sanitización
                        if (lT.pin && !sT.pin) {
                            sT.pin = lT.pin;
                            sT.pinUpdatedAt = lT.pinUpdatedAt || sT.pinUpdatedAt;
                        } else if ((lT.pinUpdatedAt || 0) > (sT.pinUpdatedAt || 0) && lT.pin) {
                            sT.pin = lT.pin;
                            sT.pinUpdatedAt = lT.pinUpdatedAt;
                        }
                    } else if (lT && !sT) {
                        merged.config.teachers[tk] = JSON.parse(JSON.stringify(lT));
                    }
                }
            }
        }
        
        const allDeletedCompanyIds = new Set([
            ...(Array.isArray(serverData.deletedCompanyIds) ? serverData.deletedCompanyIds.map(String) : []),
            ...(Array.isArray(localData.deletedCompanyIds) ? localData.deletedCompanyIds.map(String) : [])
        ]);
        merged.deletedCompanyIds = Array.from(allDeletedCompanyIds);
        allDeletedCompanyIds.forEach(delId => {
            delete merged.companies[delId];
        });

        const isTestCompanyReset = (coKey, sCoObj, lCoObj, sGlobalTime, lGlobalTime) => {
            const isTest = (coKey === 'sandbox_master' || coKey === 'sandbox_student' || Boolean(sCoObj?.isTestCompany) || Boolean(lCoObj?.isTestCompany));
            if (!isTest) return false;
            const sR = Number(sCoObj?.resetAt) || 0;
            const lR = Number(lCoObj?.resetAt) || 0;
            if (sR === lR) return false;
            const winR = Math.max(sR, lR);
            const loseT = (sR >= lR) ? lGlobalTime : sGlobalTime;
            return winR >= loseT;
        };

        const mergeLoginStats = (sStatsIn, lStatsIn) => {
            const sStats = sStatsIn || { totalLogins: 0, roles: {} };
            const lStats = lStatsIn || { totalLogins: 0, roles: {} };
            const out = {
                totalLogins: Math.max(Number(sStats.totalLogins) || 0, Number(lStats.totalLogins) || 0),
                roles: {}
            };
            const allLoginRoles = new Set([...Object.keys(sStats.roles || {}), ...Object.keys(lStats.roles || {})]);
            allLoginRoles.forEach(r => {
                const sR = sStats.roles?.[r] || { count: 0, lastLogin: null };
                const lR = lStats.roles?.[r] || { count: 0, lastLogin: null };
                const sLoginTs = this._parseSafeTs(sR.lastLogin);
                const lLoginTs = this._parseSafeTs(lR.lastLogin);
                out.roles[r] = {
                    count: Math.max(Number(sR.count) || 0, Number(lR.count) || 0),
                    lastLogin: (sR.lastLogin && lR.lastLogin)
                        ? (sLoginTs >= lLoginTs ? sR.lastLogin : lR.lastLogin)
                        : (sR.lastLogin || lR.lastLogin || null)
                };
            });
            return out;
        };

        const syncWinningBrandIdentity = (targetCo, sCo, lCo, lTime, sTime) => {
            const getBrTs = (b) => Math.max(this._parseSafeTs(b?.updatedAt), this._parseSafeTs(b?.endorsedAt), this._parseSafeTs(b?.date));
            const sBrTs = Math.max(this._parseSafeTs(sCo.brandUpdatedAt), getBrTs(sCo.brandApproval));
            const lBrTs = Math.max(this._parseSafeTs(lCo.brandUpdatedAt), getBrTs(lCo.brandApproval));
            const srcCo = (sBrTs !== lBrTs) ? (sBrTs > lBrTs ? sCo : lCo) : (lTime > sTime ? lCo : sCo);
            targetCo.logo = srcCo.logo !== undefined ? srcCo.logo : null;
            targetCo.slogan = srcCo.slogan || '';
            targetCo.valueProposition = srcCo.valueProposition || '';
            if (srcCo.mission !== undefined) targetCo.mission = srcCo.mission;
            if (srcCo.brandStatus !== undefined) targetCo.brandStatus = srcCo.brandStatus;
            else delete targetCo.brandStatus;
            if (srcCo.pendingSlogan !== undefined) targetCo.pendingSlogan = srcCo.pendingSlogan;
            else delete targetCo.pendingSlogan;
            if (srcCo.pendingMission !== undefined) targetCo.pendingMission = srcCo.pendingMission;
            else delete targetCo.pendingMission;
            targetCo.brandUpdatedAt = Math.max(sBrTs, lBrTs);
        };

        const mergeGradesDict = (targetCo, sCo, lCo) => {
            targetCo.grades = targetCo.grades || {};
            const sGrades = (sCo.grades && typeof sCo.grades === 'object') ? sCo.grades : {};
            const lGrades = (lCo.grades && typeof lCo.grades === 'object') ? lCo.grades : {};
            const allSubj = new Set([...Object.keys(sGrades), ...Object.keys(lGrades)]);
            allSubj.forEach(subj => {
                const sG = sGrades[subj];
                const lG = lGrades[subj];
                if (sG && !lG) targetCo.grades[subj] = JSON.parse(JSON.stringify(sG));
                else if (lG && !sG) targetCo.grades[subj] = JSON.parse(JSON.stringify(lG));
                else if (sG && lG) {
                    const sGTime = this._parseSafeTs(sG.updatedAt);
                    const lGTime = this._parseSafeTs(lG.updatedAt);
                    if (sGTime !== lGTime) {
                        targetCo.grades[subj] = JSON.parse(JSON.stringify(sGTime > lGTime ? sG : lG));
                    } else {
                        const sHasFinal = sG.final !== undefined && sG.final !== null;
                        const lHasFinal = lG.final !== undefined && lG.final !== null;
                        targetCo.grades[subj] = JSON.parse(JSON.stringify((lHasFinal && !sHasFinal) ? lG : sG));
                    }
                }
            });
        };

        const reconcileBomAndCart = (targetCo, sCo, lCo, lTime, sTime) => {
            const sBomTs = this._parseSafeTs(sCo.bomUpdatedAt);
            const lBomTs = this._parseSafeTs(lCo.bomUpdatedAt);
            const pickLocalBom = (lBomTs !== sBomTs) ? (lBomTs > sBomTs) : (lTime > sTime);
            const chosenBom = pickLocalBom ? lCo.bom : sCo.bom;
            targetCo.bom = Array.isArray(chosenBom) ? [...chosenBom] : [];
            targetCo.bomUpdatedAt = Math.max(sBomTs, lBomTs);

            const sCartTs = this._parseSafeTs(sCo.cartUpdatedAt);
            const lCartTs = this._parseSafeTs(lCo.cartUpdatedAt);
            const pickLocalCart = (lCartTs !== sCartTs) ? (lCartTs > sCartTs) : (lTime > sTime);
            const chosenCart = pickLocalCart ? lCo.cart : sCo.cart;
            targetCo.cart = Array.isArray(chosenCart) ? JSON.parse(JSON.stringify(chosenCart)) : [];
            targetCo.cartUpdatedAt = Math.max(sCartTs, lCartTs);
        };

        for (let k in localData.companies) {
            if (allDeletedCompanyIds.has(k)) continue;
            const sCo = merged.companies[k];
            const lCo = localData.companies[k];
            
            if (sCo && lCo) {
                const sTime = sCo.updatedAt || 0;
                const lTime = lCo.updatedAt || 0;
                const sAuthTime = sCo.authUpdatedAt || 0;
                const lAuthTime = lCo.authUpdatedAt || 0;
                const isTestResetPair = isTestCompanyReset(k, sCo, lCo, sTime, lTime);
                const mergedDelLedgerTxIds = Array.from(new Set([
                    ...(Array.isArray(sCo.deletedLedgerTxIds) ? sCo.deletedLedgerTxIds.map(String) : []),
                    ...(Array.isArray(lCo.deletedLedgerTxIds) ? lCo.deletedLedgerTxIds.map(String) : [])
                ]));

                // Protección de memoria local: nunca sobreescribir secretos con nulos de la sanitización
                if (lCo.authVault && lCo.authVault.code) {
                    if (!sCo.authVault || !sCo.authVault.code || lAuthTime >= sAuthTime) {
                        sCo.authVault = JSON.parse(JSON.stringify(lCo.authVault));
                        sCo.roles = JSON.parse(JSON.stringify(lCo.roles || {}));
                        sCo.accessCode = lCo.accessCode || '';
                        sCo.authUpdatedAt = Math.max(lAuthTime, sAuthTime);
                    }
                } else if (lCo.roles && Object.keys(lCo.roles).length > 0) {
                    if (!sCo.roles || Object.keys(sCo.roles).length === 0) {
                        sCo.roles = JSON.parse(JSON.stringify(lCo.roles));
                    }
                }
                if (lCo.accessCode && !sCo.accessCode) {
                    sCo.accessCode = lCo.accessCode;
                }
                
                if (lTime > sTime) {
                    merged.companies[k] = JSON.parse(JSON.stringify(lCo));
                    if (sAuthTime > lAuthTime) {
                        merged.companies[k].auxRoleDept = sCo.auxRoleDept || null;
                        merged.companies[k].authUpdatedAt = sAuthTime;
                        if (sCo.authVault && sCo.authVault.code) {
                            merged.companies[k].authVault = JSON.parse(JSON.stringify(sCo.authVault));
                            merged.companies[k].roles = JSON.parse(JSON.stringify(sCo.roles || {}));
                        }
                    }
                    const chosenAuxReq = this.mergeAuxRoleRequest(lCo.auxRoleRequest, sCo.auxRoleRequest, lTime, sTime);
                    if (chosenAuxReq) {
                        merged.companies[k].auxRoleRequest = chosenAuxReq;
                        if (chosenAuxReq.status === 'APROBADO' && chosenAuxReq.dept && !merged.companies[k].auxRoleDept) {
                            merged.companies[k].auxRoleDept = chosenAuxReq.dept;
                        }
                    }
                    // Preservar siempre calificaciones docentes usando LWW por asignatura sin depender del updatedAt de alumnos
                    mergeGradesDict(merged.companies[k], sCo, lCo);
                    // Preservar asignación docente de patrocinio por LWW (sponsorUpdatedAt)
                    const sSpTs = Number(sCo.sponsorUpdatedAt || sCo.sponsorData?.updatedAt || this._parseSafeTs(sCo.sponsorData?.date) || 0);
                    const lSpTs = Number(lCo.sponsorUpdatedAt || lCo.sponsorData?.updatedAt || this._parseSafeTs(lCo.sponsorData?.date) || 0);
                    if ((sSpTs > 0 && sSpTs >= lSpTs) || (sCo.sponsorAwarded && !lCo.sponsorAwarded && lSpTs === 0)) {
                        merged.companies[k].sponsorAwarded = sCo.sponsorAwarded || null;
                        merged.companies[k].sponsorData = JSON.parse(JSON.stringify(sCo.sponsorData || {}));
                        if (sSpTs > 0) merged.companies[k].sponsorUpdatedAt = sSpTs;
                    }
                    const sNameTsL = Number(sCo.nameUpdatedAt || 0);
                    const lNameTsL = Number(lCo.nameUpdatedAt || 0);
                    if (sNameTsL > lNameTsL && sCo.name) {
                        merged.companies[k].name = sCo.name;
                        if (Array.isArray(sCo.previousNames)) merged.companies[k].previousNames = JSON.parse(JSON.stringify(sCo.previousNames));
                        merged.companies[k].nameUpdatedAt = sNameTsL;
                    }
                    const sResetTs = Number(sCo.resetAt || 0);
                    const lResetTs = Number(lCo.resetAt || 0);
                    if (lResetTs > sResetTs) {
                        merged.companies[k].loginStats = JSON.parse(JSON.stringify(lCo.loginStats || { totalLogins: 0, roles: {} }));
                    } else if (sResetTs > lResetTs) {
                        merged.companies[k].loginStats = JSON.parse(JSON.stringify(sCo.loginStats || { totalLogins: 0, roles: {} }));
                    } else {
                        merged.companies[k].loginStats = mergeLoginStats(sCo.loginStats, lCo.loginStats);
                    }

                    // Fusión de entregables: no pisar entregables docentes ni estados más recientes
                    merged.companies[k].deliverables = merged.companies[k].deliverables || {};
                    if (sCo.deliverables) {
                        for (const dKey in sCo.deliverables) {
                            const sDoc = sCo.deliverables[dKey];
                            const lDoc = merged.companies[k].deliverables[dKey];
                            if (!lDoc && sDoc) {
                                merged.companies[k].deliverables[dKey] = JSON.parse(JSON.stringify(sDoc));
                            } else if (sDoc && lDoc) {
                                const sDocTime = this._parseSafeTs(sDoc.updatedAt);
                                const lDocTime = this._parseSafeTs(lDoc.updatedAt);
                                let mergedHist = undefined;
                                if (dKey === 'hoja_taller_fyq' && (Array.isArray(lDoc.history) || Array.isArray(sDoc.history))) {
                                    const histMap = new Map();
                                    [...(Array.isArray(sDoc.history) ? sDoc.history : []), ...(Array.isArray(lDoc.history) ? lDoc.history : [])].forEach(ev => {
                                        if (ev && ev.id) histMap.set(String(ev.id), ev);
                                    });
                                    mergedHist = Array.from(histMap.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
                                }
                                if (sDocTime >= lDocTime) {
                                    merged.companies[k].deliverables[dKey] = JSON.parse(JSON.stringify(sDoc));
                                }
                                if (mergedHist && typeof merged.companies[k].deliverables[dKey] === 'object' && merged.companies[k].deliverables[dKey]) {
                                    merged.companies[k].deliverables[dKey].history = mergedHist;
                                }
                            }
                        }
                    }
                    const sResetAt = Number(sCo.resetAt) || 0;
                    const lResetAt = Number(lCo.resetAt) || 0;
                    if (isTestResetPair) {
                        merged.companies[k].resetAt = Math.max(sResetAt, lResetAt);
                        applyResetWinner(merged.companies[k], lResetAt >= sResetAt ? lCo : sCo);
                    } else {
                        merged.companies[k].deletedLedgerTxIds = mergedDelLedgerTxIds;
                        companyArraysToMerge.forEach(arrName => {
                            merged.companies[k][arrName] = reconcileCompanyArray(sCo[arrName], lCo[arrName], arrName, true, mergedDelLedgerTxIds);
                        });
                        reconcileBomAndCart(merged.companies[k], sCo, lCo, lTime, sTime);
                        if (sCo.launchLicense && typeof sCo.launchLicense === 'object') {
                            const lLic = merged.companies[k].launchLicense;
                            const sLicTime = Math.max(Number(sCo.launchLicense.approvedAt || 0), Number(sCo.launchLicense.rejectedAt || 0), Number(sCo.launchLicense.appliedAt || 0));
                            const lLicTime = lLic ? Math.max(Number(lLic.approvedAt || 0), Number(lLic.rejectedAt || 0), Number(lLic.appliedAt || 0)) : 0;
                            if (!lLic || sLicTime >= lLicTime) {
                                merged.companies[k].launchLicense = JSON.parse(JSON.stringify(sCo.launchLicense));
                            }
                        }
                        const mergedPB = this.mergePhaseDict(lCo.phaseBalances, sCo.phaseBalances, true);
                        if (mergedPB) merged.companies[k].phaseBalances = mergedPB;
                        const mergedPR = this.mergePhaseDict(lCo.pressReleases, sCo.pressReleases, true);
                        if (mergedPR) merged.companies[k].pressReleases = mergedPR;
                        const chosenBrandL = this.mergeBrandApproval(lCo.brandApproval, sCo.brandApproval, lTime, sTime);
                        if (chosenBrandL) merged.companies[k].brandApproval = chosenBrandL;
                        syncWinningBrandIdentity(merged.companies[k], sCo, lCo, lTime, sTime);
                        const chosenNcL = this.mergeNameChangeRequest(lCo.nameChangeRequest, sCo.nameChangeRequest, lTime, sTime);
                        if (chosenNcL) merged.companies[k].nameChangeRequest = chosenNcL;
                        if (merged.companies[k].nameChangeRequest?.status === 'APROBADO' && merged.companies[k].nameChangeRequest.proposedName) {
                            merged.companies[k].name = merged.companies[k].nameChangeRequest.proposedName;
                        }
                        if (sCo.classGroup && !this.user?.admin && sCo.classGroup !== merged.companies[k].classGroup) {
                            merged.companies[k].classGroup = sCo.classGroup;
                        }
                        if (sCo.unlockAllContracts !== undefined && !this.user?.admin) {
                            merged.companies[k].unlockAllContracts = sCo.unlockAllContracts;
                        }
                    }
                    merged.companies[k].balance = this.calculateBalance(merged.companies[k]);
                } else {
                    if (lAuthTime > sAuthTime) {
                        if (lCo.authVault) sCo.authVault = JSON.parse(JSON.stringify(lCo.authVault));
                        if (lCo.roles) sCo.roles = JSON.parse(JSON.stringify(lCo.roles || {}));
                        sCo.auxRoleDept = lCo.auxRoleDept || null;
                        sCo.authUpdatedAt = lAuthTime;
                    }
                    const sResetAt = Number(sCo.resetAt) || 0;
                    const lResetAt = Number(lCo.resetAt) || 0;

                    if (isTestResetPair) {
                        sCo.resetAt = Math.max(sResetAt, lResetAt);
                        applyResetWinner(sCo, sResetAt >= lResetAt ? sCo : lCo);
                    } else {
                        const chosenNcS = this.mergeNameChangeRequest(lCo.nameChangeRequest, sCo.nameChangeRequest, lTime, sTime);
                        if (chosenNcS) sCo.nameChangeRequest = chosenNcS;
                        if (sCo.nameChangeRequest?.status === 'APROBADO' && sCo.nameChangeRequest.proposedName) {
                            sCo.name = sCo.nameChangeRequest.proposedName;
                        }
                        const chosenBrandS = this.mergeBrandApproval(lCo.brandApproval, sCo.brandApproval, lTime, sTime);
                        if (chosenBrandS) sCo.brandApproval = chosenBrandS;
                        syncWinningBrandIdentity(sCo, sCo, lCo, lTime, sTime);
                        const chosenAuxReqElse = this.mergeAuxRoleRequest(lCo.auxRoleRequest, sCo.auxRoleRequest, lTime, sTime);
                        if (chosenAuxReqElse) {
                            sCo.auxRoleRequest = chosenAuxReqElse;
                            if (chosenAuxReqElse.status === 'APROBADO' && chosenAuxReqElse.dept && !sCo.auxRoleDept) {
                                sCo.auxRoleDept = chosenAuxReqElse.dept;
                            }
                        }
                        mergeGradesDict(sCo, sCo, lCo);
                        const lSpTs2 = Number(lCo.sponsorUpdatedAt || lCo.sponsorData?.updatedAt || this._parseSafeTs(lCo.sponsorData?.date) || 0);
                        const sSpTs2 = Number(sCo.sponsorUpdatedAt || sCo.sponsorData?.updatedAt || this._parseSafeTs(sCo.sponsorData?.date) || 0);
                        if ((lSpTs2 > sSpTs2) || (lCo.sponsorAwarded && !sCo.sponsorAwarded && sSpTs2 === 0)) {
                            sCo.sponsorAwarded = lCo.sponsorAwarded || null;
                            sCo.sponsorData = JSON.parse(JSON.stringify(lCo.sponsorData || {}));
                            if (lSpTs2 > 0) sCo.sponsorUpdatedAt = lSpTs2;
                        }
                        const lNameTs2 = Number(lCo.nameUpdatedAt || 0);
                        const sNameTs2 = Number(sCo.nameUpdatedAt || 0);
                        if (lNameTs2 > sNameTs2 && lCo.name) {
                            sCo.name = lCo.name;
                            if (Array.isArray(lCo.previousNames)) sCo.previousNames = JSON.parse(JSON.stringify(lCo.previousNames));
                            sCo.nameUpdatedAt = lNameTs2;
                        }
                        const lResetTs2 = Number(lCo.resetAt || 0);
                        const sResetTs2 = Number(sCo.resetAt || 0);
                        if (lResetTs2 > sResetTs2) {
                            sCo.loginStats = JSON.parse(JSON.stringify(lCo.loginStats || { totalLogins: 0, roles: {} }));
                        } else if (sResetTs2 > lResetTs2) {
                            sCo.loginStats = JSON.parse(JSON.stringify(sCo.loginStats || { totalLogins: 0, roles: {} }));
                        } else {
                            sCo.loginStats = mergeLoginStats(sCo.loginStats, lCo.loginStats);
                        }
                        sCo.deliverables = sCo.deliverables || {};
                        if (lCo.deliverables) {
                            for (const dKey in lCo.deliverables) {
                                const lDoc = lCo.deliverables[dKey];
                                const sDoc = sCo.deliverables[dKey];
                                if (!sDoc && lDoc) {
                                    sCo.deliverables[dKey] = JSON.parse(JSON.stringify(lDoc));
                                } else if (lDoc && sDoc) {
                                    const lDocTime = this._parseSafeTs(lDoc.updatedAt);
                                    const sDocTime = this._parseSafeTs(sDoc.updatedAt);
                                    let mergedHist = undefined;
                                    if (dKey === 'hoja_taller_fyq' && (Array.isArray(lDoc.history) || Array.isArray(sDoc.history))) {
                                        const histMap = new Map();
                                        [...(Array.isArray(sDoc.history) ? sDoc.history : []), ...(Array.isArray(lDoc.history) ? lDoc.history : [])].forEach(ev => {
                                            if (ev && ev.id) histMap.set(String(ev.id), ev);
                                        });
                                        mergedHist = Array.from(histMap.values()).sort((a, b) => Number(a.timestamp || 0) - Number(b.timestamp || 0));
                                    }
                                    if (lDocTime > sDocTime) {
                                        sCo.deliverables[dKey] = JSON.parse(JSON.stringify(lDoc));
                                    }
                                    if (mergedHist && typeof sCo.deliverables[dKey] === 'object' && sCo.deliverables[dKey]) {
                                        sCo.deliverables[dKey].history = mergedHist;
                                    }
                                }
                            }
                        }
                        sCo.deletedLedgerTxIds = mergedDelLedgerTxIds;
                        companyArraysToMerge.forEach(arrName => {
                            sCo[arrName] = reconcileCompanyArray(sCo[arrName], lCo[arrName], arrName, false, mergedDelLedgerTxIds);
                        });
                        reconcileBomAndCart(sCo, sCo, lCo, lTime, sTime);
                        if (lCo.launchLicense && typeof lCo.launchLicense === 'object') {
                            const sLic = sCo.launchLicense;
                            const lLicTime = Math.max(Number(lCo.launchLicense.approvedAt || 0), Number(lCo.launchLicense.rejectedAt || 0), Number(lCo.launchLicense.appliedAt || 0));
                            const sLicTime = sLic ? Math.max(Number(sLic.approvedAt || 0), Number(sLic.rejectedAt || 0), Number(sLic.appliedAt || 0)) : 0;
                            if (!sLic || lLicTime > sLicTime) {
                                sCo.launchLicense = JSON.parse(JSON.stringify(lCo.launchLicense));
                            }
                        }
                        const mergedPBElse = this.mergePhaseDict(lCo.phaseBalances, sCo.phaseBalances, false);
                        if (mergedPBElse) sCo.phaseBalances = mergedPBElse;
                        const mergedPRElse = this.mergePhaseDict(lCo.pressReleases, sCo.pressReleases, false);
                        if (mergedPRElse) sCo.pressReleases = mergedPRElse;
                    }
                    sCo.balance = this.calculateBalance(sCo);
                }

                // Conciliación de contratos comerciales por fase con Last-Write-Wins (LWW)
                const targetCo = merged.companies[k] || sCo;
                if (targetCo && !isTestResetPair) {
                    const sCont = (sCo?.contracts && typeof sCo.contracts === 'object') ? sCo.contracts : {};
                    const lCont = (lCo?.contracts && typeof lCo.contracts === 'object') ? lCo.contracts : {};
                    targetCo.contracts = { ...sCont, ...lCont };
                    ['I', 'II', 'III', 'IV'].forEach(ph => {
                        const sC = sCont[ph];
                        const lC = lCont[ph];
                        if (sC && lC) {
                            const sCTime = Math.max(this._parseSafeTs(sC.settledAt), this._parseSafeTs(sC.signedAt));
                            const lCTime = Math.max(this._parseSafeTs(lC.settledAt), this._parseSafeTs(lC.signedAt));
                            targetCo.contracts[ph] = (lCTime > sCTime) ? JSON.parse(JSON.stringify(lC)) : JSON.parse(JSON.stringify(sC));
                        } else if (lC) {
                            targetCo.contracts[ph] = JSON.parse(JSON.stringify(lC));
                        } else if (sC) {
                            targetCo.contracts[ph] = JSON.parse(JSON.stringify(sC));
                        }
                    });
                }
            } else if (lCo && !sCo) {
                merged.companies[k] = lCo;
                merged.companies[k].balance = this.calculateBalance(merged.companies[k]);
            }
        }
        
        const mergeArraysGlobal = (arrS, arrL) => {
            if(!Array.isArray(arrS)) arrS = [];
            if(!Array.isArray(arrL)) arrL = [];
            const getGlobalTs = (it) => Math.max(
                this._parseSafeTs(it?.updatedAt),
                this._parseSafeTs(it?.placementUpdatedAt),
                this._parseSafeTs(it?.resolvedAt),
                this._parseSafeTs(it?.approvedAt),
                this._parseSafeTs(it?.rejectedAt),
                this._parseSafeTs(it?.releasedAt),
                this._parseSafeTs(it?.createdAt),
                this._parseSafeTs(it?.timestamp)
            );
            const serverDedupMap = new Map();
            const serverDedup = [];
            arrS.forEach(sItem => {
                const id = String(sItem?.id || sItem?.sessionId || '');
                if (!id) { serverDedup.push(sItem); return; }
                const prev = serverDedupMap.get(id);
                if (!prev || getGlobalTs(sItem) >= getGlobalTs(prev)) {
                    serverDedupMap.set(id, sItem);
                }
            });
            serverDedupMap.forEach(v => serverDedup.push(v));
            arrS = serverDedup;
            const localMap = new Map();
            arrL.forEach(i => {
                const id = String(i?.id || i?.sessionId || '');
                if (id) localMap.set(id, i);
            });
            const mergedGlobal = arrS.map(sItem => {
                const id = String(sItem?.id || sItem?.sessionId || '');
                if (!id) return sItem;
                const lItem = localMap.get(id);
                if (!lItem) return sItem;
                const sTs = getGlobalTs(sItem);
                const lTs = getGlobalTs(lItem);
                const isResolved = Boolean(sItem.resolved || lItem.resolved);

                if (lTs > sTs) {
                    return { ...sItem, ...lItem, resolved: isResolved };
                }
                if (sTs > lTs) {
                    return { ...lItem, ...sItem, resolved: isResolved };
                }
                let status = sItem.status;
                if (sItem.status === 'EN_VENTA' && (lItem.status === 'EN_ADUANA' || lItem.status === 'VENDIDO')) {
                    status = lItem.status;
                } else if (sItem.status === 'EN_ADUANA' && lItem.status === 'VENDIDO') {
                    status = lItem.status;
                }
                return { ...lItem, ...sItem, resolved: isResolved, status: status || sItem.status || lItem.status };
            });
            const ids = new Set(arrS.map(i => String(i?.id || i?.sessionId)));
            const missing = arrL.filter(i => i && (i.id || i.sessionId) && !ids.has(String(i.id || i.sessionId)));
            return [...missing, ...mergedGlobal];
        };

        if (localData.telemetry && localData.telemetry.sessions) {
            merged.telemetry = merged.telemetry || { sessions: [] };
            merged.telemetry.sessions = mergeArraysGlobal(merged.telemetry.sessions, localData.telemetry.sessions).slice(0, 100);
            merged.telemetry.totalLogins = Math.max(merged.telemetry.totalLogins || 0, localData.telemetry.totalLogins || 0);
        } else if (merged.telemetry && Array.isArray(merged.telemetry.sessions) && merged.telemetry.sessions.length > 100) {
            merged.telemetry.sessions = merged.telemetry.sessions.slice(0, 100);
        }
        
        const allDeletedSuggestionIds = new Set([
            ...(Array.isArray(serverData.deletedSuggestionIds) ? serverData.deletedSuggestionIds.map(String) : []),
            ...(Array.isArray(localData.deletedSuggestionIds) ? localData.deletedSuggestionIds.map(String) : [])
        ]);
        merged.deletedSuggestionIds = Array.from(allDeletedSuggestionIds);

        const allDismissedNotificationIds = new Set([
            ...(Array.isArray(serverData.dismissedNotificationIds) ? serverData.dismissedNotificationIds.map(String) : []),
            ...(Array.isArray(localData.dismissedNotificationIds) ? localData.dismissedNotificationIds.map(String) : [])
        ]);
        merged.dismissedNotificationIds = Array.from(allDismissedNotificationIds);

        const allDeletedNewsIds = new Set([
            ...(Array.isArray(serverData.deletedNewsIds) ? serverData.deletedNewsIds.map(String) : []),
            ...(Array.isArray(localData.deletedNewsIds) ? localData.deletedNewsIds.map(String) : []),
            ...(Array.isArray(serverData.deletedOfficialNewsIds) ? serverData.deletedOfficialNewsIds.map(String) : []),
            ...(Array.isArray(localData.deletedOfficialNewsIds) ? localData.deletedOfficialNewsIds.map(String) : [])
        ]);
        merged.deletedNewsIds = Array.from(allDeletedNewsIds);
        merged.deletedOfficialNewsIds = merged.deletedNewsIds;

        const allDeletedPendingCustomIds = new Set([
            ...(Array.isArray(serverData.deletedPendingCustomIds) ? serverData.deletedPendingCustomIds.map(String) : []),
            ...(Array.isArray(localData.deletedPendingCustomIds) ? localData.deletedPendingCustomIds.map(String) : [])
        ]);
        merged.deletedPendingCustomIds = Array.from(allDeletedPendingCustomIds);

        const allDeletedCatalogIds = new Set([
            ...(Array.isArray(serverData.deletedCatalogIds) ? serverData.deletedCatalogIds.map(String) : []),
            ...(Array.isArray(localData.deletedCatalogIds) ? localData.deletedCatalogIds.map(String) : []),
            ...(this.getDeletedCatalogItems ? this.getDeletedCatalogItems().map(String) : [])
        ]);
        merged.deletedCatalogIds = Array.from(allDeletedCatalogIds);

        const testResetCutoff = (coId) => {
            const co = merged.companies?.[coId];
            if (!co || (!co.isTestCompany && coId !== 'sandbox_master' && coId !== 'sandbox_student')) return 0;
            return Number(co.resetAt) || 0;
        };
        const isStaleTestArtifact = (coId, item) => {
            const rAt = testResetCutoff(coId);
            if (!rAt) return false;
            const iTs = Math.max(this._parseSafeTs(item?.updatedAt), this._parseSafeTs(item?.createdAt), this._parseSafeTs(item?.timestamp), this._parseSafeTs(item?.publishedAt));
            return iTs > 0 && iTs < rAt;
        };

        const serverNewsPool = [
            ...(Array.isArray(merged.officialNews) ? merged.officialNews : []),
            ...(Array.isArray(merged.news) ? merged.news : [])
        ];
        const localNewsPool = [
            ...(Array.isArray(localData.officialNews) ? localData.officialNews : []),
            ...(Array.isArray(localData.news) ? localData.news : [])
        ];
        merged.news = mergeArraysGlobal(serverNewsPool, localNewsPool)
            .filter(n => n && n.id && !allDeletedNewsIds.has(String(n.id)))
            .map(n => this.normalizeNewsItem(n))
            .filter(Boolean);
        merged.news = this.applyEditorialSeeds(merged.news, allDeletedNewsIds);
        const isCoordMerge = Boolean(this.user && this.user.admin && String(this.user.role || '').startsWith('COORD'));
        if (!isCoordMerge) {
            merged.news = merged.news.filter(n => n && n.status !== 'DRAFT');
        }
        merged.news = this.resolveFeaturedNews(merged.news);
        delete merged.officialNews;
        const sOrbEd = Number(serverData?.config?.orbita?.currentEditionNumber) || 0;
        const lOrbEd = Number(localData?.config?.orbita?.currentEditionNumber) || 0;
        merged.config = merged.config || {};
        merged.config.orbita = {
            currentEditionNumber: isCoordMerge ? Math.max(sOrbEd, lOrbEd, 0) : Math.max(sOrbEd, 0)
        };
        merged.vipStartups = Array.isArray(serverData.vipStartups)
            ? serverData.vipStartups
            : (Array.isArray(localData.vipStartups) ? localData.vipStartups : []);
        const sLogoTs = Number(serverData.realCompanyLogosUpdatedAt) || 0;
        const lLogoTs = Number(localData.realCompanyLogosUpdatedAt) || 0;
        const sLogos = (serverData.realCompanyLogos && typeof serverData.realCompanyLogos === 'object' && !Array.isArray(serverData.realCompanyLogos)) ? serverData.realCompanyLogos : {};
        const lLogos = (localData.realCompanyLogos && typeof localData.realCompanyLogos === 'object' && !Array.isArray(localData.realCompanyLogos)) ? localData.realCompanyLogos : {};
        const mergedLogos = lLogoTs > sLogoTs ? { ...sLogos, ...lLogos } : { ...lLogos, ...sLogos };
        Object.keys(mergedLogos).forEach(k => {
            if (typeof mergedLogos[k] !== 'string' || mergedLogos[k].trim() === '') {
                const newerHasEmpty = lLogoTs > sLogoTs
                    ? (Object.prototype.hasOwnProperty.call(lLogos, k) && String(lLogos[k] || '').trim() === '')
                    : (Object.prototype.hasOwnProperty.call(sLogos, k) && String(sLogos[k] || '').trim() === '');
                if (newerHasEmpty) {
                    mergedLogos[k] = '';
                } else {
                    const fallback = String(sLogos[k] || lLogos[k] || '').trim();
                    if (fallback) mergedLogos[k] = fallback;
                    else delete mergedLogos[k];
                }
            }
        });
        merged.realCompanyLogos = mergedLogos;
        merged.realCompanyLogosUpdatedAt = Math.max(sLogoTs, lLogoTs);
        const allDeletedPrintEditionIds = new Set([
            ...(Array.isArray(serverData.deletedPrintEditionIds) ? serverData.deletedPrintEditionIds.map(String) : []),
            ...(Array.isArray(localData.deletedPrintEditionIds) ? localData.deletedPrintEditionIds.map(String) : [])
        ]);
        merged.deletedPrintEditionIds = Array.from(allDeletedPrintEditionIds);
        merged.printEditions = mergeArraysGlobal(merged.printEditions, localData.printEditions)
            .filter(pe => pe && pe.id && !allDeletedPrintEditionIds.has(String(pe.id)));
        merged.printAdLibrary = mergeArraysGlobal(merged.printAdLibrary, localData.printAdLibrary)
            .filter(ad => ad && ad.id);
        merged.sharedUpdatedAt = Math.max(Number(serverData.sharedUpdatedAt) || 0, Number(localData.sharedUpdatedAt) || 0);

        merged.pressReleases = mergeArraysGlobal(merged.pressReleases, localData.pressReleases)
            .filter(pr => pr && !allDeletedCompanyIds.has(String(pr.coId)) && !allDeletedCompanyIds.has(String(pr.authorCoId)) && !isStaleTestArtifact(pr.authorCoId || pr.coId, pr));
        merged.suggestionsToAlex = mergeArraysGlobal(merged.suggestionsToAlex, localData.suggestionsToAlex)
            .filter(s => s && s.id && !allDeletedSuggestionIds.has(String(s.id)) && !allDeletedCompanyIds.has(String(s.coId)));
        merged.pendingCustom = mergeArraysGlobal(merged.pendingCustom, localData.pendingCustom)
            .filter(p => p && !allDeletedPendingCustomIds.has(String(p.id)) && !allDeletedCompanyIds.has(String(p.company || p.coId || '')) && !isStaleTestArtifact(p.company || p.coId, p));
        merged.b2bMarket = mergeArraysGlobal(merged.b2bMarket, localData.b2bMarket)
            .filter(i => i && !allDeletedCompanyIds.has(String(i.sellerCoId)) && !isStaleTestArtifact(i.sellerCoId, i));
        merged.b2bContracts = mergeArraysGlobal(merged.b2bContracts, localData.b2bContracts)
            .filter(c => c && !allDeletedCompanyIds.has(String(c.sellerCoId)) && !allDeletedCompanyIds.has(String(c.buyerCoId)) && (!isStaleTestArtifact(c.sellerCoId, c) || c.status === 'EJECUTADO'));
        merged.securityIncidents = mergeArraysGlobal(merged.securityIncidents, localData.securityIncidents);

        const isCoordUser = Boolean(this.user && this.user.admin && this.user.role && String(this.user.role).startsWith('COORD'));
        merged.finalContest = this.mergeFinalContest(serverData?.finalContest, localData?.finalContest, merged.companies, merged.deletedCompanyIds, isCoordUser);

        if (Array.isArray(localData.catalog) || Array.isArray(merged.catalog)) {
            const sCatalog = Array.isArray(merged.catalog) ? merged.catalog : [];
            const lCatalog = Array.isArray(localData.catalog) ? localData.catalog : [];
            const sMap = new Map();
            const lMap = new Map();
            sCatalog.forEach(item => {
                if (item && item.id && !allDeletedCatalogIds.has(String(item.id))) {
                    sMap.set(String(item.id), item);
                }
            });
            lCatalog.forEach(item => {
                if (item && item.id && !allDeletedCatalogIds.has(String(item.id))) {
                    lMap.set(String(item.id), item);
                }
            });
            const allCatIds = new Set([...sMap.keys(), ...lMap.keys()]);
            const mergedCat = [];
            allCatIds.forEach(cid => {
                const sItem = sMap.get(cid);
                const lItem = lMap.get(cid);
                if (sItem && !lItem) {
                    mergedCat.push(sItem);
                } else if (lItem && !sItem) {
                    mergedCat.push(lItem);
                } else if (sItem && lItem) {
                    const sUpd = this._parseSafeTs(sItem.updatedAt);
                    const lUpd = this._parseSafeTs(lItem.updatedAt);
                    mergedCat.push(lUpd > sUpd ? { ...sItem, ...lItem } : { ...lItem, ...sItem });
                }
            });
            merged.catalog = mergedCat;
        }

        return merged;
    },

    getEffectiveRole(user = this.user, co = null) {
        if (!user || !user.role) return '';
        const rawRole = String(user.role).toUpperCase();
        if (user.admin) return rawRole;
        const company = co || (user.coId ? this.data?.companies?.[user.coId] : null);
        if (rawRole === 'AUXILIAR' || rawRole === 'SECRETARIO') {
            const linkedDept = company?.auxRoleDept ? String(company.auxRoleDept).toUpperCase() : '';
            if (linkedDept === 'OPERACIONES') return 'OPERACIONES_IA';
            return linkedDept || 'AUXILIAR';
        }
        if (rawRole === 'OPERACIONES') return 'OPERACIONES_IA';
        return rawRole;
    },

    verifySessionIntegrity(serverOrMergedData = this.data) {
        if (!this.user) return true;

        // 1. Comprobar expiración de la sesión (8 horas)
        if (this.user.exp && this.user.exp < Date.now()) {
            this.revokeSession("Sesión finalizada: El tiempo de autorización de misión (8 horas) ha expirado.");
            return false;
        }
        if (this.user.isVip) {
            return true;
        }

        // 2. Comprobar que la entidad siga existiendo en el estado del servidor
        const teacherRoles = ['FYQ', 'ECO', 'MAT', 'LEN', 'ING', 'LYE'];
        const isDocente = Boolean(this.user.admin || (this.user.role && (teacherRoles.includes(this.user.role) || this.user.role.startsWith('COORD_'))));
        const isEntityValid = isDocente
            ? !!(serverOrMergedData?.config?.teachers?.[this.user.role] || this.user.admin)
            : !!(serverOrMergedData?.companies?.[this.user.coId]);

        if (!isEntityValid) {
            this.revokeSession("Sesión finalizada: La entidad o puesto asignado ya no existe.");
            return false;
        }

        // 3. Comprobar si Coordinación modificó las credenciales después del inicio de sesión
        if (isDocente) {
            const serverPinStamp = Number(serverOrMergedData?.config?.teachers?.[this.user.role]?.pinUpdatedAt || 0);
            if (this.user.pinStamp !== undefined && this.user.pinStamp !== null && serverPinStamp > Number(this.user.pinStamp)) {
                this.revokeSession("Sesión finalizada: Las credenciales de acceso han sido modificadas por coordinación.");
                return false;
            }
        } else {
            const serverAuthStamp = Number(serverOrMergedData?.companies?.[this.user.coId]?.authUpdatedAt || 0);
            if (this.user.authStamp !== undefined && this.user.authStamp !== null && serverAuthStamp > Number(this.user.authStamp)) {
                this.revokeSession("Sesión finalizada: Las credenciales de acceso han sido modificadas por coordinación.");
                return false;
            }
        }

        return true;
    },

    revokeSession(reason) {
        clearTimeout(this.syncTimer);
        this.user = null;
        this.currentUser = null;
        this.pin = '';
        this.lastETag = null;
        this.lastCompanyETag = null;
        this.lastCompanyVersion = 0;
        this._adminCredentialsFetched = false;
        if (typeof auth !== 'undefined') auth.verifiedCoId = null;
        try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        try { sessionStorage.removeItem(this.sessionKey); } catch(e) {}
        try { sessionStorage.clear(); } catch(e) {}
        if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
            ui.setHUDVisibility(false);
        }
        if (typeof ui !== 'undefined') {
            ui.current = 'login';
            if (typeof ui.renderLogin === 'function') ui.renderLogin();
            else if (typeof ui.render === 'function') ui.render();
            if (typeof ui.showModal === 'function' && reason) {
                ui.showModal(
                    "ALERTA DE SEGURIDAD // SESIÓN REVOCADA",
                    `<p class="text-xs sm:text-sm text-mars-magenta font-bold leading-relaxed">${ui.escapeHTML(reason)}</p>`,
                    ""
                );
            }
        }
    },

    setOfflineContainment(active) {
        this.isOfflineContained = !!active;
        if (typeof ui !== 'undefined' && typeof ui.setOfflineContainment === 'function') {
            ui.setOfflineContainment(this.isOfflineContained);
        }
    },

    async updatePin(coId, role, newPin, extra = {}) {
        const co = this.data.companies?.[coId];
        if (!co) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const clean = String(newPin || '').trim();
        const now = Date.now();
        this.setRolePin(co, role, clean, !extra.skipAuthStamp);
        co.updatedAt = now;
        if (role === 'AUXILIAR') {
            if (extra.auxRoleDept !== undefined) co.auxRoleDept = extra.auxRoleDept;
            if (extra.auxRoleRequest && typeof extra.auxRoleRequest === 'object') {
                co.auxRoleRequest = { ...extra.auxRoleRequest, updatedAt: Number(extra.auxRoleRequest.updatedAt) || now };
            } else if (co.auxRoleRequest) {
                co.auxRoleRequest.pin = clean;
                if (!clean && co.auxRoleRequest.status !== 'RECHAZADO') co.auxRoleRequest.status = 'INACTIVO';
                co.auxRoleRequest.updatedAt = now;
            }
        }
        this.data.lastUpdated = now;

        if (this.user && !this.user.admin && this.user.coId === coId && this.user.role === role) {
            const refreshed = {
                ...this.user,
                authStamp: Number(co.authUpdatedAt || now),
                authToken: this.getAuthToken(this.user, this.data)
            };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        const prevVer = Number(this.data.version) || 0;
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const patchBody = { type: 'company', id: coId, role, newPin: clean };
            if (extra.auxRoleDept !== undefined) patchBody.auxRoleDept = extra.auxRoleDept;
            if (extra.auxRoleRequest) patchBody.auxRoleRequest = co.auxRoleRequest;
            if (extra.skipAuthStamp) patchBody.skipAuthStamp = true;
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify(patchBody)
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    if (Number(resJson.newVersion) === prevVer + 1) {
                        this.data.version = resJson.newVersion;
                        this.lastETag = resJson.etag || null;
                        this.saveLocalOnly();
                    } else {
                        this.lastETag = null;
                        await this.fetchFromCloud(true);
                    }
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PIN en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },
    async updateCompanyPins(coId, newPins) {
        const co = this.data.companies?.[coId];
        if (!co || !newPins || typeof newPins !== 'object') return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;

        const cleanMap = {};
        for (const role in newPins) {
            const clean = String(newPins[role] || '').trim();
            if (/^\d{4}$/.test(clean)) {
                cleanMap[role] = clean;
                this.setRolePin(co, role, clean, true);
                if (role === 'AUXILIAR' && co.auxRoleRequest) {
                    co.auxRoleRequest.pin = clean;
                    co.auxRoleRequest.status = 'APROBADO';
                }
            }
        }
        this.data.lastUpdated = Date.now();
        this.saveLocalOnly();

        let ok = false;
        const prevVer = Number(this.data.version) || 0;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'company', id: coId, roles: cleanMap })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    if (Number(resJson.newVersion) === prevVer + 1) {
                        this.data.version = resJson.newVersion;
                        this.lastETag = resJson.etag || null;
                        this.saveLocalOnly();
                    } else {
                        this.lastETag = null;
                        await this.fetchFromCloud(true);
                    }
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PINs por lote en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async updateTeacherPin(teacherKey, newPin) {
        const t = this.data.config?.teachers?.[teacherKey];
        if (!t) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const now = Date.now();
        const clean = String(newPin || '').trim();
        t.pin = clean;
        t.pinUpdatedAt = now;
        this.data.config.updatedAt = now;
        this.data.lastUpdated = now;

        // Blindaje del Coordinador Activo: si edita su propio PIN, refresca pinStamp y authToken en el mismo ciclo
        if (this.user && this.user.admin && this.user.role === teacherKey) {
            const refreshed = { ...this.user, pinStamp: now, authToken: this.getAuthToken(this.user, this.data) };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        const prevVer = Number(this.data.version) || 0;
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'teacher', id: teacherKey, newPin: clean })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    if (Number(resJson.newVersion) === prevVer + 1) {
                        this.data.version = resJson.newVersion;
                        this.lastETag = resJson.etag || null;
                        this.saveLocalOnly();
                    } else {
                        this.lastETag = null;
                        await this.fetchFromCloud(true);
                    }
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar PIN docente en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async updateCompanyCode(coId, newCode) {
        const co = this.data.companies?.[coId];
        if (!co) return false;
        clearTimeout(this.syncTimer);
        this.pausePolling = true;
        const clean = String(newCode || '').trim().toUpperCase();
        this.setCompanyCode(co, clean, true);
        this.data.lastUpdated = Date.now();

        if (this.user && !this.user.admin && this.user.coId === coId) {
            const refreshed = {
                ...this.user,
                authStamp: Number(co.authUpdatedAt || Date.now()),
                authToken: this.getAuthToken(this.user, this.data)
            };
            this.user = Object.freeze(refreshed);
            this.currentUser = this.user;
            try { sessionStorage.setItem(this.sessionKey, JSON.stringify(refreshed)); } catch(e) {}
            try { localStorage.removeItem(this.sessionKey); } catch(e) {}
        }

        this.saveLocalOnly();
        const prevVer = Number(this.data.version) || 0;
        let ok = false;
        try {
            const token = this.getAuthToken(this.user, this.data);
            const res = await fetch('/api/admin/credentials', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'X-Marsket-Auth': token } : {})
                },
                body: JSON.stringify({ type: 'company', id: coId, newCode: clean, newPin: clean })
            });
            if (res.ok) {
                const resJson = await res.json().catch(() => null);
                if (resJson && resJson.newVersion) {
                    if (Number(resJson.newVersion) === prevVer + 1) {
                        this.data.version = resJson.newVersion;
                        this.lastETag = resJson.etag || null;
                        this.saveLocalOnly();
                    } else {
                        this.lastETag = null;
                        await this.fetchFromCloud(true);
                    }
                }
                ok = true;
            }
        } catch(e) {
            console.error("Error al actualizar código de empresa en /api/admin/credentials:", e);
        } finally {
            this.pausePolling = false;
        }
        return ok;
    },

    async fetchAdminCredentials() {
        if (!this.user || !this.user.admin || !this.user.role || !this.user.role.startsWith('COORD')) {
            return false;
        }
        const token = this.getAuthToken(this.user, this.data);
        if (!token) return false;

        try {
            const res = await fetch('/api/admin/credentials', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                }
            });
            if (!res.ok) return false;
            const creds = await res.json().catch(() => null);
            if (!creds || typeof creds !== 'object') return false;

            // Hidratar PINs docentes
            if (creds.teachers && this.data.config) {
                this.data.config.teachers = this.data.config.teachers || {};
                for (const tKey in creds.teachers) {
                    if (tKey === 'BIO' || tKey === 'COORD') continue;
                    if (this.data.config.teachers[tKey]) {
                        this.data.config.teachers[tKey].pin = creds.teachers[tKey].pin;
                        if (creds.teachers[tKey].pinUpdatedAt) {
                            this.data.config.teachers[tKey].pinUpdatedAt = creds.teachers[tKey].pinUpdatedAt;
                        }
                    } else {
                        this.data.config.teachers[tKey] = creds.teachers[tKey];
                    }
                }
            }

            // Hidratar Códigos de Empresa y PINs departamentales
            if (creds.companies && this.data.companies) {
                for (const cKey in creds.companies) {
                    const sCred = creds.companies[cKey];
                    const lCo = this.data.companies[cKey];
                    if (lCo && sCred) {
                        if (sCred.accessCode) {
                            this.setCompanyCode(lCo, sCred.accessCode, false);
                        }
                        if (sCred.roles && typeof sCred.roles === 'object') {
                            for (const r in sCred.roles) {
                                if (sCred.roles[r]) {
                                    this.setRolePin(lCo, r, sCred.roles[r], false);
                                }
                            }
                        }
                        if (sCred.auxRoleDept) {
                            lCo.auxRoleDept = sCred.auxRoleDept;
                        }
                    }
                }
            }
            this._adminCredentialsFetched = true;
            this.saveLocalOnly();
            // No sobreescribir this.lastETag: reservado exclusivamente para la reconciliación global /api/state
            if (typeof ui !== 'undefined' && ui.adminTab === 'startups' && typeof ui.renderAdminStartups === 'function') {
                const subContainer = document.getElementById('admin-subtab-container');
                if (subContainer) subContainer.innerHTML = ui.renderAdminStartups();
            }
            return true;
        } catch(e) {
            console.warn("[STATE] fetchAdminCredentials falló:", e);
            return false;
        }
    },

    async init() {
        let isVipSessionHint = false;
        try {
            const preSession = sessionStorage.getItem(this.sessionKey);
            if (preSession) {
                const parsedPre = JSON.parse(preSession);
                if (parsedPre && parsedPre.isVip) isVipSessionHint = true;
            }
        } catch (e) {}

        try {
            const saved = isVipSessionHint ? null : localStorage.getItem(this.storageKey);
            const raw = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_STATE));
            this.data = this.migrate(raw);
            if (!isVipSessionHint) this.saveLocalOnly();
        } catch (err) {
            console.error("Error migrando datos locales:", err);
            this.data = this.migrate(JSON.parse(JSON.stringify(DEFAULT_STATE)));
        }

        // G4a: Eliminar auto-asignación de tokens en state.init().
        // La sesión transitoria reside en sessionStorage con prueba criptográfica SHA-256 (authProof) y exp (8 h).
        // Se limpia cualquier sesión residual en localStorage para impedir suplantación offline persistente.
        try { localStorage.removeItem(this.sessionKey); } catch (e) {}

        const savedSession = sessionStorage.getItem(this.sessionKey);
        if (savedSession) {
            try {
                const sessionUser = JSON.parse(savedSession);
                const now = Date.now();

                // 1. Validar expiración (8 h) y presencia obligatoria de prueba
                if (!sessionUser || !sessionUser.exp || sessionUser.exp < now || !sessionUser.authProof) {
                    throw new Error("Sesión expirada o sin prueba de autorización");
                }

                // 2. Extraer credencial vigente del estado actual si está disponible en memoria local
                let credencialVigente = '';
                if (sessionUser.admin) {
                    credencialVigente = this.data.config?.teachers?.[sessionUser.role]?.pin || '';
                } else if (sessionUser.coId && this.data.companies?.[sessionUser.coId]) {
                    const co = this.data.companies[sessionUser.coId];
                    credencialVigente = this.getRolePin(co, sessionUser.role) || '';
                }

                // 3. Si la credencial está disponible localmente, validar prueba criptográfica
                if (credencialVigente) {
                    const expectedProof = (typeof auth !== 'undefined' && typeof auth.generateAuthProof === 'function')
                        ? await auth.generateAuthProof(sessionUser.role, sessionUser.coId, sessionUser.exp, credencialVigente)
                        : null;

                    if (!expectedProof || sessionUser.authProof !== expectedProof) {
                        throw new Error("Fallo de integridad criptográfica en la prueba de sesión");
                    }
                }

                // Sesión legítima validada
                this.user = Object.freeze(sessionUser);
                this.currentUser = this.user;
                if (this.user.isVip) {
                    if (typeof ui !== 'undefined') ui.current = 'news';
                } else if (this.user.admin && this.user.role && this.user.role.startsWith('COORD')) {
                    await this.fetchAdminCredentials().catch(() => {});
                }
                if (typeof ui !== 'undefined' && typeof ui.setHUDVisibility === 'function') {
                    ui.setHUDVisibility(true);
                }
                if (typeof auth !== 'undefined' && typeof auth.buildNav === 'function') {
                    auth.buildNav(this.user.admin);
                }
            } catch(e) {
                // Sesión no válida o corrupta al arrancar
                this.user = null;
                this.currentUser = null;
                try { sessionStorage.removeItem(this.sessionKey); } catch(err) {}
            }
        }
        
        try {
            if (typeof ui !== 'undefined' && typeof ui.render === 'function') ui.render();
        } catch (renderErr) {
            console.error("Error en renderizado inicial:", renderErr);
        }
        
        if (this._clockInterval) clearInterval(this._clockInterval);
        this._clockInterval = setInterval(() => {
          const el = document.getElementById('hud-clock');
          if (el) el.innerText = 'TIME: ' + new Date().toLocaleTimeString();
        }, 1000);

        if (!this._listenersAttached) {
            this._listenersAttached = true;
            if (!this._pollIntervalMs) {
                this._pollIntervalMs = 18000 + Math.floor(Math.random() * 6000);
            }
            if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = setInterval(() => {
                if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
                    this.checkFastVersion();
                }
            }, this._pollIntervalMs);

            if (typeof document !== 'undefined') {
                document.addEventListener('visibilitychange', () => {
                    if (document.visibilityState === 'visible') {
                        this.checkFastVersion();
                    }
                });
            }

            if (typeof window !== 'undefined') {
                window.addEventListener('offline', () => {
                    this.isCloudOnline = false;
                    this.consecutiveNetworkFailures = Math.max(this.consecutiveNetworkFailures, 1);
                    this.setOfflineContainment(true);
                    try { if (this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
                });

                window.addEventListener('online', async () => {
                    const ok = await this.fetchFromCloud();
                    if (ok && this.verifySessionIntegrity(this.data)) {
                        this.setOfflineContainment(false);
                    }
                });

                window.addEventListener('pagehide', () => {
                    if (this.syncTimer && this.user && !this.isOfflineContained) {
                        clearTimeout(this.syncTimer);
                        this.syncTimer = null;
                        this.saveLocalOnly();
                        this.pushToCloud(false);
                    }
                });
            }

            if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined' && !this._broadcastChannel) {
                try {
                    this._broadcastChannel = new BroadcastChannel('marsket_channel');
                    this._broadcastChannel.onmessage = (ev) => {
                        if (ev.data && ev.data.type === 'MARSKET_GLOBAL_RESET') {
                            this.fetchFromCloud();
                        }
                    };
                } catch(e) {}
            }
        }
        
        await this.fetchFromCloud();
        if (this.user && this.user.admin && this.user.role && this.user.role.startsWith('COORD')) {
            await this.fetchAdminCredentials().catch(() => {});
        }
    },

    resumePolling() {
        this.pausePolling = false;
        if (!this._pollIntervalMs) {
            this._pollIntervalMs = 18000 + Math.floor(Math.random() * 6000);
        }
        if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(() => {
            if (!this.pausePolling && typeof document !== 'undefined' && document.visibilityState === 'visible') {
                this.checkFastVersion();
            }
        }, this._pollIntervalMs);
    },

    async checkFastVersion() {
        if (this.pausePolling) return;
        if (!this.user || !this.user.coId || this.user.isVip) {
            // Sondeo de estado general para roles de coordinación docente o invitados
            return await this.fetchFromCloud();
        }

        const cid = this.user.coId;
        const endpoint = `/api/company/${encodeURIComponent(cid)}/version`;
        const headers = { 
            'Cache-Control': 'no-cache',
            'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
        };
        if (this.lastCompanyETag) {
            headers['If-None-Match'] = this.lastCompanyETag;
        }

        try {
            const res = await fetch(endpoint, { method: 'GET', headers, cache: 'no-store' });
            
            // HTTP 304 Not Modified: 0 bytes consumidos, sincronización confirmada
            if (res.status === 304) {
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                return true;
            }

            if (res.ok) {
                const info = await res.json();
                const etag = res.headers.get('ETag') || info.etag;
                this.lastCompanyETag = etag;
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);

                const localCo = this.data.companies?.[cid];
                const localUpdated = Number(localCo?.updatedAt || 0);
                const remoteUpdated = Number(info.updatedAt || 0);
                const configUpdated = Number(info.configUpdatedAt || 0);
                const localConfigUpdated = Number(this.data.config?.updatedAt || 0);
                const remoteCompanyVersion = Number(info.version || 0);
                const prevCompanyVersion = Number(this.lastCompanyVersion || 0);
                this.lastCompanyVersion = remoteCompanyVersion;
                const remoteGlobalVersion = Number(info.globalVersion || 0);
                const localGlobalVersion = Number(this.data.version || 0);
                const remoteSharedUpdated = Number(info.sharedUpdatedAt || 0);
                const localSharedUpdated = Number(this.data.sharedUpdatedAt || 0);
                const hasSharedUpdate = remoteSharedUpdated > 0
                    ? (remoteSharedUpdated > localSharedUpdated)
                    : (remoteGlobalVersion > 0 && remoteGlobalVersion > localGlobalVersion);

                // Sincronizar estado completo solo si cambió esta empresa, la configuración docente o los datos compartidos
                if (
                    remoteUpdated > localUpdated ||
                    configUpdated > localConfigUpdated ||
                    hasSharedUpdate ||
                    (prevCompanyVersion > 0 && remoteCompanyVersion > prevCompanyVersion) ||
                    !this.lastETag
                ) {
                    await this.fetchFromCloud(true);
                }
                return true;
            } else {
                return await this.fetchFromCloud();
            }
        } catch (e) {
            this.consecutiveNetworkFailures++;
            if (this.consecutiveNetworkFailures >= 3) {
                this.isCloudOnline = false;
                this.setOfflineContainment(true);
            }
            return false;
        }
    },

    async executeAction(actionName, payload = {}) {
        const coId = this.user?.coId || payload?.coId;
        if (!coId) {
            console.warn("[ACTION] executeAction requiere una sesión activa con startup asociada o coId explícito.");
            return { success: false, error: 'NO_ACTIVE_COMPANY' };
        }

        const hadPendingSave = Boolean(this.syncTimer);
        if (hadPendingSave) {
            clearTimeout(this.syncTimer);
            this.syncTimer = null;
        }
        if (this._activePushPromise) {
            try { await this._activePushPromise; } catch(e) {}
        }

        const endpoint = `/api/company/${encodeURIComponent(coId)}/action`;
        const headers = { 
            'Content-Type': 'application/json',
            'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
        };
        if (typeof auth !== 'undefined' && typeof auth.getSessionToken === 'function') {
            const token = auth.getSessionToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            this.isSyncing = true;
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}

            const res = await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify({ action: actionName, payload })
            });

            if (res.ok) {
                const data = await res.json();
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);

                if (data.version) this.lastCompanyVersion = Number(data.version) || this.lastCompanyVersion;
                this.lastCompanyETag = res.headers.get('ETag') || data.etag || null;
                await this.fetchFromCloud(true);
                if (data.balance !== undefined && this.data.companies?.[coId] && data.updatedAt) {
                    this.data.companies[coId].updatedAt = Math.max(Number(this.data.companies[coId].updatedAt) || 0, Number(data.updatedAt) || 0);
                }
                if (hadPendingSave) {
                    this.pushToCloud(true);
                }
                return { success: true, data };
            } else {
                const errData = await res.json().catch(() => ({}));
                console.warn("[ACTION] Error devuelto por servidor en mutación atómica:", errData);
                return { success: false, error: errData.error || res.statusText };
            }
        } catch(err) {
            console.error("[ACTION] Excepción de red en executeAction:", err);
            return { success: false, error: err.message };
        } finally {
            this.isSyncing = false;
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }
    },

    discardPendingProposal(coId, proposalType, proposalId = null) {
        if (!coId || !this.data.companies?.[coId]) return;
        const co = this.data.companies[coId];
        const now = Date.now();

        if (proposalType === 'BRAND') {
            delete co.pendingSlogan;
            delete co.pendingMission;
            co.brandStatus = 'REJECTED';
            co.brandUpdatedAt = now;
            if (co.brandApproval) {
                co.brandApproval.status = 'RECHAZADO';
                delete co.brandApproval.pendingSlogan;
                delete co.brandApproval.pendingLogo;
                co.brandApproval.feedback = 'Propuesta de marca rechazada por Coordinación.';
                co.brandApproval.updatedAt = now;
            }
        } else if (proposalType === 'DELIVERABLE' && proposalId) {
            if (co.deliverables?.[proposalId]) {
                co.deliverables[proposalId].status = 'CEO_REVISION';
                co.deliverables[proposalId].updatedAt = new Date(now).toISOString();
            }
        } else if (proposalType === 'MARKETING' && proposalId) {
            const camp = (co.marketingCampaigns || []).find(c => c.id === proposalId);
            if (camp) {
                camp.status = 'DENEGADO';
                camp.updatedAt = now;
            }
        } else if (proposalType === 'NAME_CHANGE') {
            delete co.pendingName;
            delete co.nameChangeReason;
            co.nameChangeStatus = 'REJECTED';
            if (co.nameChangeRequest) {
                co.nameChangeRequest.status = 'RECHAZADO';
                co.nameChangeRequest.updatedAt = now;
            }
        }

        this.save(coId);
    },

    isDeliverableLocked(docKey, co) {
        if (this.user?.admin) return false;
        const comp = co || (this.data?.companies?.[this.user?.coId]);
        if (comp?.unlockAllContracts === true) return false;
        const docObj = comp?.deliverables?.[docKey];
        if (docObj && docObj.driveUrl) return false;
        const sched = (this.data?.config?.deliverableSchedule && this.data.config.deliverableSchedule[docKey]) || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docKey) || {};
        const openDate = sched.openDate || def.defaultOpenDate;
        if (!openDate) return false;
        const openTime = new Date(openDate).getTime();
        if (isNaN(openTime)) return false;
        return Date.now() < openTime;
    },

    isPhaseUnlocked(phaseId, co) {
        if (!phaseId) return true;
        if (this.user?.admin) return true;
        const comp = co || (this.data?.companies?.[this.user?.coId]);
        if (comp?.unlockAllContracts === true) return true;

        const sched = this.data?.config?.deliverableSchedule || {};
        const defs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => (sched[d.key]?.phase || d.phase || 'I') === phaseId);
        const hasExplicitOpenDate = defs.some(d => Boolean(sched[d.key]?.openDate));
        if (defs.length > 0 && hasExplicitOpenDate) {
            return defs.some(d => !this.isDeliverableLocked(d.key, comp));
        }

        const pDefs = (typeof PROJECT_PHASES_DEF !== 'undefined') ? PROJECT_PHASES_DEF : {};
        const pDef = pDefs[phaseId];
        if (pDef && pDef.startDate) {
            const startTime = new Date(pDef.startDate + 'T00:00:00').getTime();
            if (!isNaN(startTime) && Date.now() >= startTime) {
                return true;
            }
        }
        if (phaseId === 'I') return true;
        if (defs.length > 0 && defs.some(d => !this.isDeliverableLocked(d.key, comp))) {
            return true;
        }
        return false;
    },

    async submitDeliverable(docType, payload) {
        const driveUrl = String(payload?.driveUrl || '').trim();
        if (!this.user || !this.user.coId) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co) return;

        if (!this.user.admin && this.isDeliverableLocked(docType, co)) {
            console.warn(`[SECURITY] Intento no autorizado de entrega de entregable bloqueado: ${docType}`);
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify("Entrega bloqueada: este entregable aún no ha alcanzado su fecha de apertura.", "error");
            }
            return;
        }

        co.deliverables = co.deliverables || {};
        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const effectiveRole = this.getEffectiveRole(this.user, co);
        const isDeptMatch = !def
            || (effectiveRole === def.role)
            || (def.role === 'OPERACIONES_IA' && effectiveRole === 'OPERACIONES')
            || (docType === 'hoja_taller_fyq' && (effectiveRole === 'OPERACIONES_IA' || effectiveRole === 'OPERACIONES' || effectiveRole === 'TECNICO'));
        if (!this.user.admin && ((effectiveRole === 'CEO' && (!def || def.role !== 'CEO')) || !isDeptMatch)) {
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify(`Solo el departamento responsable (${(def?.role || 'ASIGNADO').replace('_', ' ')}) puede elaborar y subir este entregable. El CEO debe esperar a recibirlo para visarlo.`, "warning");
            }
            return;
        }
        const isCEO = Boolean(this.user.admin) || (effectiveRole === 'CEO' && def && def.role === 'CEO');
        const targetStatus = isCEO ? 'DELIVERED_TO_TEACHER' : 'SUBMITTED_TO_CEO';

        const prevDoc = co.deliverables[docType];
        const prevTeacherReturned = Boolean(prevDoc && typeof prevDoc === 'object' && (prevDoc.returnByTeacher || prevDoc.wasTeacherReturned));
        const prevTeacherRole = (prevDoc && typeof prevDoc === 'object' && prevDoc.returnByTeacherRole) ? String(prevDoc.returnByTeacherRole) : null;

        const prevDelivMs = this._parseSafeTs ? this._parseSafeTs(prevDoc?.updatedAt) : (Date.parse(prevDoc?.updatedAt) || 0);
        const monoIso = new Date(Math.max(Date.now(), prevDelivMs + 1)).toISOString();
        const sanitizedItem = { 
            driveUrl, 
            status: targetStatus,
            returnReasonId: null,
            returnReason: null,
            returnByTeacher: false,
            ...(isCEO && prevTeacherReturned ? { resubmittedAfterTeacherReturn: true, resubmittedAt: monoIso } : {}),
            ...(!isCEO && prevTeacherReturned ? { wasTeacherReturned: true, ...(prevTeacherRole ? { returnByTeacherRole: prevTeacherRole } : {}) } : {}),
            updatedAt: monoIso
        };
        co.deliverables[docType] = sanitizedItem;

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("ENTREGABLE", `Enlace Google Drive subido: ${docType} (Estado: ${targetStatus})`);
        }

        if (!isCEO && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
            const def = defs.find(d => d.key === docType);
            const docName = def ? (def.shortName || def.name) : docType;
            const senderLabel = (effectiveRole !== this.user.role) ? `${this.user.role} (${effectiveRole})` : this.user.role;
            ui.pushNotification(coId, 'CEO', `${senderLabel} ha subido el entregable "${docName}". Requiere tu supervisión y visado.`, 'warning', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            if (isCEO) {
                ui.notify("✅ Enlace registrado y elevado a evaluación docente.", "success");
            } else {
                ui.notify("📤 Enlace registrado y remitido a supervisión del CEO.", "info");
            }
        }

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: docType,
                driveUrl: sanitizedItem.driveUrl,
                status: targetStatus,
                ...(sanitizedItem.wasTeacherReturned ? { wasTeacherReturned: true } : {}),
                ...(sanitizedItem.returnByTeacherRole ? { returnByTeacherRole: sanitizedItem.returnByTeacherRole } : {}),
                ...(sanitizedItem.resubmittedAfterTeacherReturn ? { resubmittedAfterTeacherReturn: true, resubmittedAt: sanitizedItem.resubmittedAt } : {})
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando entrega:", e);
        }
    },

    getCommittedB2CBalance(co) {
        if (!co || !Array.isArray(co.orders)) return 0;
        return co.orders
            .filter(o => o && o.status === 'APROBADO_FINANZAS' && o.type !== 'MARKETING' && o.type !== 'B2B_BUY_REQUEST' && !o.offerId)
            .reduce((acc, o) => {
                const pendingSum = (o.items || []).reduce((s, it) => {
                    if (it && it.executed) return s;
                    return s + (Number(it?.price) || 0) * (Number(it?.qty) || 1);
                }, 0);
                return acc + pendingSum;
            }, 0);
    },

    getFreeVirtualBalance(co) {
        if (!co) return 0;
        return (Number(co.balance) || 0) - this.getCommittedB2CBalance(co);
    },

    _appendHojaHistoryEntry(hojaObj, co, entry) {
        if (!hojaObj) return [];
        hojaObj.history = Array.isArray(hojaObj.history) ? hojaObj.history : [];
        const bomCount = Array.isArray(co?.bom) ? co.bom.length : 0;
        hojaObj.history.push({
            id: entry.id || ('HT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6)),
            iteration: hojaObj.history.length + 1,
            date: new Date().toLocaleString(),
            timestamp: Date.now(),
            bomCount,
            ...entry
        });
        return hojaObj.history;
    },

    async sendHojaTallerToWorkshop(driveUrl) {
        if (!this.user || !this.user.coId) return;
        if (this.getEffectiveRole() !== 'TECNICO' && !this.user.admin) {
            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                ui.notify("Acceso restringido: solo el departamento Técnico puede remitir la Hoja de Taller.", "error");
            }
            return;
        }
        const co = this.data.companies?.[this.user.coId];
        if (!co) return;

        co.deliverables = co.deliverables || {};
        const prevHoja = (co.deliverables.hoja_taller_fyq && typeof co.deliverables.hoja_taller_fyq === 'object') ? co.deliverables.hoja_taller_fyq : {};
        const prevHistory = Array.isArray(prevHoja.history) ? [...prevHoja.history] : [];
        const newDoc = {
            ...prevHoja,
            driveUrl: driveUrl,
            url: driveUrl,
            status: 'EN_TALLER_OPERARIO',
            returnReasonId: null,
            returnReason: null,
            returnDriveUrl: null,
            history: prevHistory,
            updatedAt: new Date().toISOString()
        };
        const isResub = prevHoja.status === 'DEVUELTO_A_TECNICO' || prevHoja.status === 'CEO_REVISION' || prevHistory.length > 0;
        this._appendHojaHistoryEntry(newDoc, co, {
            actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'TECNICO',
            action: isResub ? 'ACTUALIZACION_A_TALLER' : 'ENVIO_A_TALLER',
            summary: isResub
                ? 'I+D actualizó la configuración del cohete / BOM y la reenvió a Taller.'
                : 'I+D envió la configuración inicial del cohete y BOM a Taller para montaje.',
            driveUrl: driveUrl
        });
        co.deliverables.hoja_taller_fyq = newDoc;

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_FYQ", "Hoja de Taller y BOM remitidos a Taller: " + driveUrl);
        }
        ui.pushNotification(this.user.coId, 'OPERACIONES_IA', 'Técnico ha enviado una actualización de la Hoja de Taller (BOM) para configurar y revisar el cohete.', 'info', {
            view: 'cart'
        });
        this.save(this.user.coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("🚀 Hoja de Taller registrada en el Histórico y remitida al Operario de Taller.", "success");
        }

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: driveUrl,
                status: 'EN_TALLER_OPERARIO',
                history: newDoc.history
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando Hoja de Taller:", e);
        }
    },

    async recordHojaWorkshopCheckByOperator() {
        if (!this.user || !this.user.coId) return;
        const co = this.data.companies?.[this.user.coId];
        if (!co || !co.deliverables?.hoja_taller_fyq) return;

        const hoja = co.deliverables.hoja_taller_fyq;
        hoja.status = 'DRAFT_TECNICO';
        hoja.lastWorkshopCheckAt = new Date().toISOString();
        delete hoja.returnReasonId;
        delete hoja.returnReason;
        hoja.updatedAt = new Date().toISOString();
        this._appendHojaHistoryEntry(hoja, co, {
            actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'OPERACIONES_IA',
            action: 'REVISION_TALLER_OK',
            summary: 'Operaciones verificó este montaje físico en Taller (checkpoint guardado en el histórico previo a Fase III).',
            driveUrl: hoja.driveUrl || ''
        });

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_CHECKPOINT", "Operaciones registró verificación de montaje en Histórico.");
        }
        ui.pushNotification(this.user.coId, 'TECNICO', '✅ Operaciones ha verificado la configuración actual en Taller y la ha guardado en el Histórico de Montaje.', 'success', {
            view: 'tech_workshop',
            anchorId: 'tech-hoja-taller-panel'
        });
        this.save(this.user.coId);

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: hoja.driveUrl || '',
                status: 'DRAFT_TECNICO',
                lastWorkshopCheckAt: hoja.lastWorkshopCheckAt,
                history: hoja.history
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando checkpoint de taller:", e);
        }
    },

    async validateHojaTallerByOperator() {
        if (!this.user || !this.user.coId) return;
        const co = this.data.companies?.[this.user.coId];
        if (!co || !co.deliverables?.hoja_taller_fyq) return;

        const isHojaLocked = !this.user.admin && typeof ui !== 'undefined' && typeof ui.isDeliverableLocked === 'function' && ui.isDeliverableLocked('hoja_taller_fyq', co);
        if (isHojaLocked) {
            await this.recordHojaWorkshopCheckByOperator();
            return 'CHECKPOINT_SAVED';
        }

        const hoja = co.deliverables.hoja_taller_fyq;
        hoja.status = 'SUBMITTED_TO_CEO';
        delete hoja.returnReasonId;
        delete hoja.returnReason;
        hoja.updatedAt = new Date().toISOString();
        this._appendHojaHistoryEntry(hoja, co, {
            actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'OPERACIONES_IA',
            action: 'ELEVADO_A_CEO',
            summary: 'Ensamble definitivo de Fase III validado en Taller y elevado al CEO para evaluación en FyQ.',
            driveUrl: hoja.driveUrl || ''
        });

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_VALIDADO", "Operario validó ensamble físico de Hoja de Taller.");
        }
        ui.pushNotification(this.user.coId, 'CEO', 'El Operario ha validado el ensamble físico de la Hoja de Taller. Pendiente de tu visado final.', 'warning', {
            view: 'role_deliverables',
            section: 'deliverables',
            docKey: 'hoja_taller_fyq'
        });
        this.save(this.user.coId);

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: hoja.driveUrl,
                status: 'SUBMITTED_TO_CEO',
                history: hoja.history
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando validación de taller:", e);
        }
        return 'ELEVATED_TO_CEO';
    },

    async returnHojaTallerByOperator(reasonId, reasonLabel, driveUrl) {
        if (!this.user || !this.user.coId) return;
        const co = this.data.companies?.[this.user.coId];
        if (!co || !co.deliverables?.hoja_taller_fyq) return;

        const hoja = co.deliverables.hoja_taller_fyq;
        hoja.status = 'DEVUELTO_A_TECNICO';
        hoja.returnReasonId = reasonId;
        hoja.returnReason = reasonLabel;
        if (driveUrl) {
            hoja.returnDriveUrl = driveUrl;
        }
        hoja.updatedAt = new Date().toISOString();
        this._appendHojaHistoryEntry(hoja, co, {
            actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'OPERACIONES_IA',
            action: 'INCIDENCIA_TALLER',
            reasonId: reasonId,
            summary: `Incidencia en Taller: ${reasonLabel}`,
            driveUrl: driveUrl || hoja.driveUrl || ''
        });

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("TALLER_DEVUELTO", "Operario devolvió Hoja de Taller por: " + reasonId);
        }
        ui.pushNotification(this.user.coId, 'TECNICO', 'Operaciones ha DEVUELTO la Hoja de Taller por incidencia: "' + reasonLabel + '". Revisa el BOM y actualiza el Google Doc.', 'error', {
            view: 'tech_workshop',
            anchorId: 'tech-hoja-taller-panel'
        });
        this.save(this.user.coId);

        try {
            await this.executeAction('SUBMIT_DELIVERABLE', {
                key: 'hoja_taller_fyq',
                driveUrl: hoja.driveUrl,
                status: 'DEVUELTO_A_TECNICO',
                returnReasonId: reasonId,
                returnReason: reasonLabel,
                returnDriveUrl: driveUrl || hoja.returnDriveUrl || null,
                history: hoja.history
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución de taller:", e);
        }
    },

    async approveDeliverableByCEO(docType) {
        if (!this.user || !this.user.coId || this.getEffectiveRole() !== 'CEO') return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;
        if (co.deliverables[docType].status !== 'SUBMITTED_TO_CEO') {
            if (typeof ui !== 'undefined' && ui.notify) ui.notify("Este entregable ya fue procesado o no está pendiente de visado CEO.", "warning");
            return;
        }

        const cameFromTeacher = Boolean(co.deliverables[docType].returnByTeacher || co.deliverables[docType].wasTeacherReturned);
        co.deliverables[docType].status = 'DELIVERED_TO_TEACHER';
        delete co.deliverables[docType].returnReasonId;
        delete co.deliverables[docType].returnReason;
        delete co.deliverables[docType].returnDriveUrl;
        delete co.deliverables[docType].returnByTeacher;
        delete co.deliverables[docType].returnByTeacherRole;
        delete co.deliverables[docType].wasTeacherReturned;
        const prevCeoApprMs = this._parseSafeTs ? this._parseSafeTs(co.deliverables[docType].updatedAt) : (Date.parse(co.deliverables[docType].updatedAt) || 0);
        const monoIso = new Date(Math.max(Date.now(), prevCeoApprMs + 1)).toISOString();
        co.deliverables[docType].updatedAt = monoIso;
        if (cameFromTeacher) {
            co.deliverables[docType].resubmittedAfterTeacherReturn = true;
            co.deliverables[docType].resubmittedAt = monoIso;
        }
        if (docType === 'hoja_taller_fyq') {
            this._appendHojaHistoryEntry(co.deliverables[docType], co, {
                actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'CEO',
                action: 'VISADO_CEO',
                summary: cameFromTeacher ? 'El CEO visó la Hoja de Taller subsanada y la elevó a FyQ.' : 'El CEO visó el histórico y la Hoja de Taller definitiva y la elevó a FyQ.',
                driveUrl: co.deliverables[docType].driveUrl || ''
            });
        }

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CEO_APROBACION", `Entregable aprobado y elevado a docente: ${docType}`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        if (targetRole && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, targetRole, `El CEO ha VALIDADO vuestro entregable "${docName}". Elevado formalmente a evaluación docente.`, 'success', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("✅ Entregable validado por el CEO y elevado a evaluación docente.", "success");
        }

        try {
            await this.executeAction('CEO_REVIEW_DELIVERABLE', {
                key: docType,
                action: 'APPROVE',
                ...(cameFromTeacher ? { resubmittedAfterTeacherReturn: true } : {}),
                ...(docType === 'hoja_taller_fyq' ? { history: co.deliverables[docType].history } : {})
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando aprobación del CEO:", e);
        }
    },

    async resubmitDeliverableByCEO(docType, newDriveUrl = null) {
        if (!this.user || !this.user.coId || this.getEffectiveRole() !== 'CEO') return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        const doc = co?.deliverables?.[docType];
        if (!doc || !doc.returnByTeacher || (doc.status !== 'CEO_REVISION' && doc.status !== 'DEVUELTO_A_TECNICO')) {
            if (typeof ui !== 'undefined' && ui.notify) {
                ui.notify("Este entregable ya fue reenviado o no corresponde a una subsanación docente.", "warning");
            }
            return;
        }
        const finalUrl = String(newDriveUrl || doc.driveUrl || '').trim();
        if (!finalUrl) {
            if (typeof ui !== 'undefined' && ui.notify) {
                ui.notify("Falta un enlace válido de Google Drive para reenviar al docente.", "error");
            }
            return;
        }

        const prevMs = this._parseSafeTs ? this._parseSafeTs(doc.updatedAt) : (Date.parse(doc.updatedAt) || 0);
        const monoIso = new Date(Math.max(Date.now(), prevMs + 1)).toISOString();

        doc.driveUrl = finalUrl;
        doc.status = 'DELIVERED_TO_TEACHER';
        doc.resubmittedAfterTeacherReturn = true;
        doc.resubmittedAt = monoIso;
        doc.updatedAt = monoIso;
        delete doc.returnReasonId;
        delete doc.returnReason;
        delete doc.returnDriveUrl;
        delete doc.returnByTeacher;
        delete doc.returnByTeacherRole;
        delete doc.wasTeacherReturned;

        if (docType === 'hoja_taller_fyq') {
            this._appendHojaHistoryEntry(doc, co, {
                actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'CEO',
                action: 'SUBSANADO_CEO',
                summary: 'El CEO confirmó la subsanación docente y reenvió la Hoja de Taller a FyQ.',
                driveUrl: finalUrl
            });
        }

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CEO_SUBSANACION", `Documento subsanado reenviado a evaluación docente: ${docType}`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        if (targetRole && targetRole !== 'CEO' && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, targetRole, `El CEO ha confirmado la subsanación de "${docName}" y lo ha reenviado al docente para revisión.`, 'info', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("✅ Documento subsanado reenviado al docente para su revisión.", "success");
        }

        try {
            await this.executeAction('CEO_REVIEW_DELIVERABLE', {
                key: docType,
                action: 'RESUBMIT_TO_TEACHER',
                driveUrl: finalUrl,
                ...(docType === 'hoja_taller_fyq' ? { history: doc.history } : {})
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando reenvío subsanado del CEO:", e);
        }
        if (typeof this.pushToCloud === 'function') this.pushToCloud(false);
    },

    async returnDeliverableByCEO(docType, reasonId, returnDriveUrl = null) {
        if (!this.user || !this.user.coId || this.getEffectiveRole() !== 'CEO') return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;
        if (co.deliverables[docType].status !== 'SUBMITTED_TO_CEO') {
            if (typeof ui !== 'undefined' && ui.notify) ui.notify("Este entregable ya fue procesado o no está pendiente de visado CEO.", "warning");
            return;
        }

        const reasonList = typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [];
        const reasonObj = reasonList.find(r => r.id === reasonId);
        const reasonText = reasonObj ? reasonObj.label : (reasonId || 'Revisión técnica requerida por CEO');

        co.deliverables[docType].status = 'CEO_REVISION';
        co.deliverables[docType].returnReasonId = reasonId;
        co.deliverables[docType].returnReason = reasonText;
        co.deliverables[docType].returnDriveUrl = returnDriveUrl || null;
        delete co.deliverables[docType].returnByTeacher;
        const prevCeoApprMs = this._parseSafeTs ? this._parseSafeTs(co.deliverables[docType].updatedAt) : (Date.parse(co.deliverables[docType].updatedAt) || 0);
        co.deliverables[docType].updatedAt = new Date(Math.max(Date.now(), prevCeoApprMs + 1)).toISOString();
        if (docType === 'hoja_taller_fyq') {
            this._appendHojaHistoryEntry(co.deliverables[docType], co, {
                actor: (typeof ui !== 'undefined' && typeof ui.getActorRoleLabel === 'function') ? ui.getActorRoleLabel(co) : 'CEO',
                action: 'DEVUELTO_CEO',
                reasonId: reasonId,
                summary: `Devuelto por el CEO: ${reasonText}`,
                driveUrl: returnDriveUrl || co.deliverables[docType].driveUrl || ''
            });
        }

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("CEO_DEVOLUCION", `Entregable devuelto a departamento: ${docType} (${reasonId})`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        if (targetRole && typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, targetRole, `El CEO ha DEVUELTO vuestro entregable "${docName}" para subsanación. Motivo: ${reasonText}`, 'error', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("↩️ Entregable devuelto al departamento para subsanación.", "warning");
        }

        try {
            await this.executeAction('CEO_REVIEW_DELIVERABLE', {
                key: docType,
                action: 'RETURN',
                reasonId: reasonId,
                reasonText: reasonText,
                returnDriveUrl: returnDriveUrl || null,
                ...(docType === 'hoja_taller_fyq' ? { history: co.deliverables[docType].history } : {})
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución del CEO:", e);
        }
    },

    async returnDeliverableByTeacher(coId, docType, reasonId, returnDriveUrl = null) {
        if (!this.user || !this.user.admin) return;
        const co = this.data.companies?.[coId];
        if (!co || !co.deliverables || !co.deliverables[docType]) return;

        const reasonList = typeof CEO_RETURN_REASONS !== 'undefined' ? CEO_RETURN_REASONS : [];
        const reasonObj = reasonList.find(r => r.id === reasonId);
        const reasonText = reasonObj ? reasonObj.label : (reasonId || 'Revisión y subsanación requerida por el profesorado');

        const teacherRoleLabel = this.user.role || 'DOCENTE';
        co.deliverables[docType].status = 'CEO_REVISION';
        co.deliverables[docType].returnReasonId = reasonId;
        co.deliverables[docType].returnReason = reasonText;
        co.deliverables[docType].returnDriveUrl = returnDriveUrl || null;
        co.deliverables[docType].returnByTeacher = true;
        co.deliverables[docType].returnByTeacherRole = teacherRoleLabel;
        delete co.deliverables[docType].resubmittedAfterTeacherReturn;
        delete co.deliverables[docType].resubmittedAt;
        delete co.deliverables[docType].wasTeacherReturned;
        const prevCeoApprMs = this._parseSafeTs ? this._parseSafeTs(co.deliverables[docType].updatedAt) : (Date.parse(co.deliverables[docType].updatedAt) || 0);
        co.deliverables[docType].updatedAt = new Date(Math.max(Date.now(), prevCeoApprMs + 1)).toISOString();

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("DOCENTE_DEVOLUCION", `Entregable devuelto a startup por docente: ${coId} / ${docType} (${reasonId})`);
        }

        const defs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const def = defs.find(d => d.key === docType);
        const docName = def ? (def.shortName || def.name) : docType;
        const targetRole = def ? (def.role === 'OPERACIONES' ? 'OPERACIONES_IA' : def.role) : null;
        const teacherName = teacherRoleLabel;

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            if (targetRole && targetRole !== 'CEO') {
                ui.pushNotification(coId, targetRole, `El Profesorado (${teacherName}) ha DEVUELTO vuestro entregable "${docName}" para subsanación urgente. Motivo: ${reasonText}`, 'error', {
                    view: 'role_deliverables',
                    section: 'deliverables',
                    docKey: docType
                });
            }
            ui.pushNotification(coId, 'CEO', `El Profesorado (${teacherName}) ha devuelto el entregable "${docName}" para subsanación. Motivo: ${reasonText}`, 'error', {
                view: 'role_deliverables',
                section: 'deliverables',
                docKey: docType
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("↩️ Entregable devuelto a la startup para subsanación.", "warning");
        }

        try {
            await this.executeAction('DOCENTE_REVIEW_DELIVERABLE', {
                coId: coId,
                key: docType,
                action: 'RETURN',
                reasonId: reasonId,
                reasonText: reasonText,
                returnDriveUrl: returnDriveUrl || null,
                returnByTeacherRole: teacherRoleLabel
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando devolución docente:", e);
        }
        if (typeof this.pushToCloud === 'function') this.pushToCloud(false);
    },

    async decideMktAction(campId, actId, approved, feedback = '', returnDriveUrl = '') {
        if (!this.user || !this.user.coId || (this.getEffectiveRole() !== 'CEO' && !this.user.admin && !this.user.isCoordinator)) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !Array.isArray(co.marketingCampaigns)) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || !Array.isArray(camp.executedActions)) return;

        const act = camp.executedActions.find(a => String(a.id) === String(actId));
        if (!act) return;

        const revTs = Math.max(Date.now(), (Number(act.resubmittedAt) || 0) + 1);
        act.status = approved ? 'VALIDADO_CEO' : 'RECHAZADO_CEO';
        act.reviewedAt = revTs;
        act.updatedAt = revTs;
        act.feedback = approved ? '' : (feedback || 'Revisión requerida por CEO');
        act.returnDriveUrl = approved ? '' : (returnDriveUrl || '');
        camp.updatedAt = revTs;
        co.updatedAt = revTs;

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log(approved ? "CEO_MKT_ACCION_APROBADA" : "CEO_MKT_ACCION_RECHAZADA", `Acción publicitaria ${act.title}: ${approved ? 'Aprobada y elevada a Liderazgo' : 'Devuelta a Marketing'}`);
        }

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            if (approved) {
                ui.pushNotification(coId, 'MARKETING', `El CEO ha VALIDADO la acción publicitaria "${act.title}". Elevada al docente de Liderazgo y Coordinación.`, 'success', {
                    view: 'campaigns',
                    anchorId: 'mkt-campaigns-section'
                });
            } else {
                ui.pushNotification(coId, 'MARKETING', `El CEO ha DEVUELTO la acción publicitaria "${act.title}". Motivo: ${act.feedback}`, 'error', {
                    view: 'campaigns',
                    anchorId: 'mkt-campaigns-section'
                });
            }
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify(approved ? "✅ Acción publicitaria validada y elevada a Liderazgo y Coordinación." : "↩️ Acción publicitaria devuelta a Marketing para subsanación.", approved ? "success" : "warning");
        }

        try {
            await this.executeAction('UPDATE_MARKETING', {
                decideAction: { campId, actId, approved, feedback: act.feedback, returnDriveUrl: act.returnDriveUrl }
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando decisión del CEO sobre acción publicitaria:", e);
        }
    },

    async resubmitMktAction(campId, actId, newDriveUrl) {
        if (!this.user || !this.user.coId) return;
        const coId = this.user.coId;
        const co = this.data.companies?.[coId];
        if (!co || !Array.isArray(co.marketingCampaigns)) return;

        const camp = co.marketingCampaigns.find(c => String(c.id) === String(campId));
        if (!camp || !Array.isArray(camp.executedActions)) return;

        const act = camp.executedActions.find(a => String(a.id) === String(actId));
        if (!act) return;

        const totalAllowed = camp.totalActions || 3;
        if ((camp.executedActions || []).length > totalAllowed) {
            if (typeof ui !== 'undefined' && ui.notify) ui.notify("Cupo de acciones excedido en este paquete.", "error");
            return;
        }

        const subTs = Math.max(Date.now(), (Number(act.reviewedAt) || 0) + 1);
        act.url = newDriveUrl;
        act.driveUrl = newDriveUrl;
        act.status = 'PENDIENTE_CEO';
        act.date = new Date().toLocaleDateString();
        act.resubmittedAt = subTs;
        act.updatedAt = subTs;
        act.feedback = '';
        act.returnDriveUrl = '';
        camp.updatedAt = subTs;
        co.updatedAt = subTs;

        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log("MKT_ACCION_SUBSANADA", `Marketing ha subsanado y reenviado al CEO la acción: ${act.title}`);
        }

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            ui.pushNotification(coId, 'CEO', `Marketing ha subsanado y reenviado la acción "${act.title}" para tu revisión.`, 'info', {
                view: 'orders',
                filter: 'EN_PROCESO',
                dept: 'MARKETING'
            });
        }

        this.save(coId);
        if (typeof ui !== 'undefined' && typeof ui.render === 'function') {
            ui.render();
            ui.notify("✅ Acción publicitaria subsanada y reenviada al CEO.", "success");
        }

        try {
            await this.executeAction('UPDATE_MARKETING', {
                campaignId: campId,
                actionItem: act
            });
        } catch(e) {
            console.warn("[ACTION] Error sincronizando reenvío de acción publicitaria:", e);
        }
    },

    async fetchFromCloud(force = false) {
        if (!force && this.pausePolling) return false;
        if (force) {
            this.lastETag = null;
        }
        this.isSyncing = true;
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        let shouldRender = false;
        let networkOk = false;

        try {
            const reqHeaders = { 
                'Cache-Control': 'no-cache',
                'X-Marsket-Auth': this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || ''
            };
            if (this.lastETag && !force) {
                reqHeaders['If-None-Match'] = this.lastETag;
            }
            const res = await fetch('/api/state', { cache: 'no-store', headers: reqHeaders });

            // Mitigación ETag / HTTP 304: abortar inmediatamente la reconciliación y evitar redibujados (0 bytes)
            if (res.status === 304) {
                this._hasWarnedCloudNetwork = false;
                this.isCloudOnline = true;
                this.consecutiveNetworkFailures = 0;
                if (this.isOfflineContained) this.setOfflineContainment(false);
                return true;
            }

            if(res.ok) {
                this._hasWarnedCloudNetwork = false;
                const etag = res.headers.get('ETag');
                if (etag) this.lastETag = etag;
                const json = await res.json();
                networkOk = true;
                this.consecutiveNetworkFailures = 0;
                if(json && json.status !== 'empty') {
                    // Purgado Incondicional por resetEpoch (v1.1.02)
                    const localEpoch = parseInt(localStorage.getItem('marsket_reset_epoch') || '0', 10);
                    const serverEpoch = json.resetEpoch || 0;

                    if (serverEpoch > localEpoch) {
                        console.warn('[SECURITY] Reset Epoch superior detectado. Destruyendo caché huérfana local.');
                        
                        const savedSession = localStorage.getItem('marsket_session');
                        const savedRole = localStorage.getItem('marsket_user_role');
                        const savedV1Session = this.sessionKey ? localStorage.getItem(this.sessionKey) : null;
                        const savedFocusMode = localStorage.getItem('marsket_focus_mode');
                        const savedTextZoom = localStorage.getItem('marsket_text_zoom');
                        
                        localStorage.clear(); // Purga masiva
                        
                        if (savedSession) localStorage.setItem('marsket_session', savedSession);
                        if (savedRole) localStorage.setItem('marsket_user_role', savedRole);
                        if (savedV1Session && this.sessionKey) localStorage.setItem(this.sessionKey, savedV1Session);
                        if (savedFocusMode !== null) localStorage.setItem('marsket_focus_mode', savedFocusMode);
                        if (savedTextZoom !== null) localStorage.setItem('marsket_text_zoom', savedTextZoom);
                        localStorage.setItem('marsket_reset_epoch', serverEpoch.toString());
                        
                        // Reemplazo destructivo directo tras resetEpoch, preservando migración de sandbox y estructuras
                        this.data = this.migrate(JSON.parse(JSON.stringify(json)));
                        this.saveToLocal();
                        if (typeof ui !== 'undefined' && ui.renderAll) ui.renderAll();
                        else if (typeof ui !== 'undefined' && ui.render) ui.render();
                        
                        this.isCloudOnline = true;
                        return true; // ABORTAR ejecución posterior de mergeData
                    }

                    const prevDataStr = JSON.stringify(this.data);
                    const merged = this.mergeData(this.migrate(json), this.data);
                    this.data = merged;
                    this.data.version = json.version || this.data.version;
                    if (json.sharedUpdatedAt) {
                        this.data.sharedUpdatedAt = Math.max(Number(this.data.sharedUpdatedAt) || 0, Number(json.sharedUpdatedAt) || 0);
                    }
                    this.saveLocalOnly();
                    this.isCloudOnline = true;

                    const sessionValid = this.verifySessionIntegrity(this.data);
                    if (sessionValid && this.isOfflineContained) {
                        this.setOfflineContainment(false);
                    }
                    const hasDataChanged = JSON.stringify(this.data) !== prevDataStr;
                    shouldRender = sessionValid && hasDataChanged;
                } else if(json && json.status === 'empty') {
                    this.isCloudOnline = true;
                    if (this.verifySessionIntegrity(this.data) && this.isOfflineContained) {
                        this.setOfflineContainment(false);
                    }
                    await this.pushToCloud(false);
                }
            } else {
                this.isCloudOnline = false;
                this.consecutiveNetworkFailures = 0;
                console.error(`Error HTTP inesperado en fetchFromCloud (${res.status}):`, res.statusText);
                if (typeof navigator !== 'undefined' && navigator.onLine === false) {
                    this.setOfflineContainment(true);
                }
            }
        } catch(err) { 
            // G9: Contingencia de red esperada (offline/servidor no alcanzable) -> telemetry + console.debug (rate-limited a 1 vez)
            if (!this._hasWarnedCloudNetwork) {
                this._hasWarnedCloudNetwork = true;
                if (typeof telemetry !== 'undefined' && typeof telemetry.log === 'function') {
                    telemetry.log("NETWORK", "Conexión /api/state no disponible actualmente (modo sin conexión)");
                }
                console.debug("[CDMON: OFFLINE] Modo sin conexión activado (/api/state no alcanzable).");
            }
            this.isCloudOnline = false;
            this.consecutiveNetworkFailures++;
            if (this.consecutiveNetworkFailures >= 3 || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                this.setOfflineContainment(true);
            }
        } finally { 
            this.isSyncing = false; 
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        }

        // Renderizado separado del bloque de red para que nunca bloquee la sincronización con el servidor
        if (shouldRender && typeof ui !== 'undefined' && ui.render) {
            try {
                const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
                const isEditingInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT');
                const modalEl = typeof document !== 'undefined' ? document.getElementById('modal-overlay') : null;
                const isModalOpen = modalEl && !modalEl.classList.contains('hidden');
                const isReadingOrbita = ui.activeTab === 'news' && Boolean(ui.activeFullArticleReader);
                if (!isEditingInput && !isModalOpen && !isReadingOrbita) {
                    const savedScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
                    ui.render();
                    if (typeof window !== 'undefined') {
                        requestAnimationFrame(() => {
                            if (Math.abs(window.scrollY - savedScrollY) > 5) {
                                window.scrollTo({ top: savedScrollY, behavior: 'instant' });
                            }
                        });
                    }
                } else if (ui.updateHUD) {
                    ui.updateHUD();
                }
            } catch (uiErr) {
                console.error("Excepción visual aislada en ui.render():", uiErr);
            }
        }
        return networkOk;
    },

    recordDeletedCatalogItem(itemId) {
        if (!itemId) return;
        const strId = String(itemId);
        if (this.data) {
            this.data.deletedCatalogIds = Array.isArray(this.data.deletedCatalogIds) ? this.data.deletedCatalogIds : [];
            if (!this.data.deletedCatalogIds.includes(strId)) {
                this.data.deletedCatalogIds.push(strId);
            }
        }
        try {
            const raw = localStorage.getItem('marsket_deleted_catalog_ids');
            const list = raw ? JSON.parse(raw) : [];
            if (!list.includes(strId)) {
                list.push(strId);
                localStorage.setItem('marsket_deleted_catalog_ids', JSON.stringify(list));
            }
        } catch(e) {
            if (!this._warnedStorageQuota) {
                this._warnedStorageQuota = true;
                if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                    ui.notify("⚠️ Almacenamiento local del navegador lleno. Los cambios seguirán sincronizándose con el servidor.", "warning");
                }
            }
        }
    },

    unrecordDeletedCatalogItem(itemId) {
        if (!itemId) return;
        const strId = String(itemId);
        if (this.data && Array.isArray(this.data.deletedCatalogIds)) {
            this.data.deletedCatalogIds = this.data.deletedCatalogIds.filter(x => String(x) !== strId);
        }
        try {
            const raw = localStorage.getItem('marsket_deleted_catalog_ids');
            if (raw) {
                const list = JSON.parse(raw);
                if (Array.isArray(list) && list.includes(strId)) {
                    localStorage.setItem('marsket_deleted_catalog_ids', JSON.stringify(list.filter(x => String(x) !== strId)));
                }
            }
        } catch(e) {}
    },

    getDeletedCatalogItems() {
        const memList = Array.isArray(this.data?.deletedCatalogIds) ? this.data.deletedCatalogIds.map(String) : [];
        try {
            const raw = localStorage.getItem('marsket_deleted_catalog_ids');
            const lsList = raw ? JSON.parse(raw) : [];
            return Array.from(new Set([...memList, ...(Array.isArray(lsList) ? lsList.map(String) : [])]));
        } catch(e) {
            return memList;
        }
    },

    // WP1: Sanitizar payload local para contener ÚNICAMENTE variables de simulación aeroespacial y alias tácticos
    sanitizeForLocalStorage(data) {
        if (!data || typeof data !== 'object') return data;
        let clean;
        try {
            clean = JSON.parse(JSON.stringify(data));
        } catch(e) {
            return data;
        }

        // Erradicar PINs docentes
        if (clean.config && clean.config.teachers) {
            for (const tRole in clean.config.teachers) {
                if (clean.config.teachers[tRole]) {
                    delete clean.config.teachers[tRole].pin;
                }
            }
        }

        // Erradicar bóvedas, accessCode y secretos de startups
        if (clean.companies) {
            for (const cid in clean.companies) {
                const co = clean.companies[cid];
                if (co) {
                    delete co.authVault;
                    delete co.accessCode;
                    if (co.roles) {
                        for (const r in co.roles) {
                            if (typeof co.roles[r] === 'string' && /^\d{4,6}$/.test(co.roles[r])) {
                                co.roles[r] = 'PROTECTED';
                            }
                        }
                    }
                    if (co.deliverables) {
                        for (const dKey in co.deliverables) {
                            const d = co.deliverables[dKey];
                            if (d && typeof d === 'object') {
                                co.deliverables[dKey] = {
                                    driveUrl: String(d.driveUrl || d.dataUrl || d.url || '').trim(),
                                    ...(d.url ? { url: String(d.url).trim() } : {}),
                                    ...(d.submittedBy ? { submittedBy: String(d.submittedBy) } : {}),
                                    ...(d.lastWorkshopCheckAt ? { lastWorkshopCheckAt: d.lastWorkshopCheckAt } : {}),
                                    ...(Array.isArray(d.history) ? { history: d.history } : {}),
                                    status: d.status || 'DELIVERED_TO_TEACHER',
                                    returnReasonId: d.returnReasonId || null,
                                    returnReason: d.returnReason || null,
                                    returnDriveUrl: d.returnDriveUrl || null,
                                    returnByTeacher: Boolean(d.returnByTeacher),
                                    ...(d.returnByTeacherRole ? { returnByTeacherRole: String(d.returnByTeacherRole) } : {}),
                                    ...(d.wasTeacherReturned ? { wasTeacherReturned: true } : {}),
                                    ...(d.resubmittedAfterTeacherReturn ? { resubmittedAfterTeacherReturn: true } : {}),
                                    ...(d.resubmittedAt ? { resubmittedAt: String(d.resubmittedAt) } : {}),
                                    updatedAt: d.updatedAt || d.date || new Date().toISOString()
                                };
                            }
                        }
                    }
                }
            }
        }

        delete clean.session;
        delete clean.token;
        delete clean.authToken;
        delete clean.clientIp;
        delete clean.userAgent;

        return clean;
    },

    saveToLocal() {
        this.saveLocalOnly();
    },

    _stripHeavyImagesForLocal(obj) {
        if (!obj || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) {
            return obj.map(item => this._stripHeavyImagesForLocal(item));
        }
        const out = {};
        for (const k in obj) {
            if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
            const v = obj[k];
            if (typeof v === 'string' && v.startsWith('data:image/') && v.length > 8000) {
                out[k] = '';
            } else if (v && typeof v === 'object') {
                out[k] = this._stripHeavyImagesForLocal(v);
            } else {
                out[k] = v;
            }
        }
        return out;
    },

    saveLocalOnly() {
        if (this.user?.isVip) return;
        try {
            const clean = this.sanitizeForLocalStorage(this.data);
            const rawStr = JSON.stringify(clean);
            if (rawStr.length > 3200000) {
                const lite = this._stripHeavyImagesForLocal(clean);
                localStorage.setItem(this.storageKey, JSON.stringify(lite));
            } else {
                localStorage.setItem(this.storageKey, rawStr);
            }
        } catch (e) {
            try {
                const clean = this.sanitizeForLocalStorage(this.data);
                const lite = this._stripHeavyImagesForLocal(clean);
                localStorage.setItem(this.storageKey, JSON.stringify(lite));
            } catch (e2) {
                console.error("Aviso: almacenamiento local lleno o restringido:", e2);
                if (!this._warnedStorageQuota) {
                    this._warnedStorageQuota = true;
                    if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                        ui.notify("⚠️ Espacio local del navegador lleno: usa conexión estable al servidor para no perder trabajo.", "warning");
                    }
                }
            }
        }
    },

    save(targetCid = null) { 
        if (this.user?.isVip) return;
        if (targetCid !== '__GLOBAL__') {
            if (this.user && !this.user.admin && this.data.companies?.[this.user.coId]) {
                this.data.companies[this.user.coId].updatedAt = Date.now();
            } else if (targetCid && this.data.companies && this.data.companies[targetCid]) {
                this.data.companies[targetCid].updatedAt = Date.now();
            }
        }
        this.data.lastUpdated = Date.now();
        
        this.saveLocalOnly(); 
        try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
        this.pushToCloud(true);
    },

    _buildPushPayload() {
        const nextVersion = (Number(this.data.version) || 0) + 1;
        if (this.user && !this.user.admin && !this.user.isVip && this.user.coId) {
            const cid = this.user.coId;
            const co = this.data.companies?.[cid];
            return JSON.parse(JSON.stringify({
                version: nextVersion,
                coId: cid,
                lastUpdated: this.data.lastUpdated || Date.now(),
                companies: co ? { [cid]: co } : {},
                b2bMarket: Array.isArray(this.data.b2bMarket) ? this.data.b2bMarket : [],
                b2bContracts: Array.isArray(this.data.b2bContracts) ? this.data.b2bContracts : [],
                pendingCustom: Array.isArray(this.data.pendingCustom) ? this.data.pendingCustom : [],
                suggestions: Array.isArray(this.data.suggestions) ? this.data.suggestions : [],
                suggestionsToAlex: Array.isArray(this.data.suggestionsToAlex) ? this.data.suggestionsToAlex : [],
                securityIncidents: Array.isArray(this.data.securityIncidents) ? this.data.securityIncidents : [],
                dismissedNotificationIds: Array.isArray(this.data.dismissedNotificationIds) ? this.data.dismissedNotificationIds : []
            }));
        }
        const fullPayload = JSON.parse(JSON.stringify(this.data));
        delete fullPayload.officialNews;
        if (this.user?.coId) {
            fullPayload.coId = this.user.coId;
        }
        fullPayload.version = nextVersion;
        return fullPayload;
    },

    async pushWithBackoff(payload, attempt = 0) {
        const MAX_RETRIES = 4;
        const token = this.user?.authToken || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('marsket_token') : '') || '';
        const headers = {
            'Content-Type': 'application/json',
            'X-Marsket-Auth': token
        };
        const res = await fetch('/api/state', {
            method: 'POST',
            headers,
            body: JSON.stringify(payload)
        });

        if (res.status === 409 && attempt < MAX_RETRIES) {
            // Backoff exponencial con jitter: t = min(1500, 75 * 2^attempt) + random(0, 150) ms
            const delay = Math.min(1500, 75 * Math.pow(2, attempt)) + Math.floor(Math.random() * 150);
            await new Promise(r => setTimeout(r, delay));
            
            // Forzar descarga real sin ETag para reconciliar versión y datos más recientes antes de reintentar
            await this.fetchFromCloud(true);
            return this.pushWithBackoff(this._buildPushPayload(), attempt + 1);
        }
        return res;
    },

    async pushToCloud(debounced = false) {
        if (this.user?.isVip) return false;
        if (!this.verifySessionIntegrity(this.data)) {
            return false;
        }
        if (debounced) {
            clearTimeout(this.syncTimer);
            this.syncTimer = setTimeout(() => this.pushToCloud(false), 800);
            return true;
        }
        clearTimeout(this.syncTimer);
        this.syncTimer = null;

        if (this._activePushPromise) {
            this._pushDirty = true;
            return await this._activePushPromise;
        }

        const runPushCycle = async () => {
            let finalSuccess = false;
            let shouldRenderConflict = false;

            this.isSyncing = true;
            try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}

            try {
                do {
                    this._pushDirty = false;
                    const payload = this._buildPushPayload();
                    const res = await this.pushWithBackoff(payload);

                    if (res.ok) {
                        const json = await res.json().catch(() => null);
                        if (json && json.version) {
                            this.data.version = json.version;
                            if (json.sharedUpdatedAt) {
                                this.data.sharedUpdatedAt = Math.max(Number(this.data.sharedUpdatedAt) || 0, Number(json.sharedUpdatedAt) || 0);
                            }
                            this.saveLocalOnly();
                        }
                        const etag = res.headers.get('ETag') || (json && json.etag);
                        if (etag) {
                            this.lastETag = etag;
                        } else if (json && json.version) {
                            const cfgUpd = this.data?.config?.updatedAt || 0;
                            const roleSuffix = (this.user?.admin && String(this.user?.role || '').startsWith('COORD')) ? 'coord' : 'pub';
                            this.lastETag = 'W/"v-' + json.version + '-' + cfgUpd + '-' + roleSuffix + '"';
                        }
                        this.isCloudOnline = true;
                        this.consecutiveNetworkFailures = 0;
                        if (this.isOfflineContained) this.setOfflineContainment(false);
                        finalSuccess = true;
                    } else if (res.status === 413) {
                        this._pushDirty = false;
                        finalSuccess = false;
                        if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                            ui.notify("⚠️ El archivo o imagen supera el máximo permitido por el servidor. Reduce su tamaño e inténtalo de nuevo.", "warning");
                        }
                    } else if (res.status === 409) {
                        this._pushDirty = false;
                        shouldRenderConflict = true;
                        if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                            ui.notify("⚠️ Conflicto de concurrencia detectado. Se ha sincronizado el registro más reciente de la nube sin sobrescribir datos ajenos.", "warning");
                        }
                        await this.fetchFromCloud(true);
                        this.isCloudOnline = true;
                        finalSuccess = false;
                    } else {
                        this._pushDirty = false;
                        this.isCloudOnline = false;
                        this.consecutiveNetworkFailures = 0;
                        finalSuccess = false;
                        if (res.status === 401 || res.status === 403) {
                            console.warn(`[SECURITY] Petición pushToCloud rechazada por permisos (HTTP ${res.status}). Ejecutando purga total de sesión.`);
                            if (typeof ui !== 'undefined' && typeof ui.notify === 'function') {
                                ui.notify(`⛔ Error de autenticación (HTTP ${res.status}): Sesión no autorizada o expirada.`, "error");
                            }
                            if (typeof auth !== 'undefined' && typeof auth.logout === 'function') {
                                auth.logout();
                            }
                        }
                    }
                } while (this._pushDirty);
            } catch(err) {
                this._pushDirty = false;
                if (!this._hasWarnedCloudNetwork) {
                    this._hasWarnedCloudNetwork = true;
                    if (typeof telemetry !== 'undefined' && typeof telemetry.log === 'function') {
                        telemetry.log("NETWORK", "Conexión /api/state no disponible para push (guardado local)");
                    }
                    console.debug("[CDMON: OFFLINE] Modo sin conexión activado (push no alcanzable).");
                }
                this.isCloudOnline = false;
                this.consecutiveNetworkFailures++;
                if (this.consecutiveNetworkFailures >= 3 || (typeof navigator !== 'undefined' && navigator.onLine === false)) {
                    this.setOfflineContainment(true);
                }
                finalSuccess = false;
            } finally {
                this.isSyncing = false;
                this._activePushPromise = null;
                try { if(this.user && typeof ui !== 'undefined' && ui.updateHUD) ui.updateHUD(); } catch(e) {}
            }

            if (shouldRenderConflict && typeof ui !== 'undefined' && ui.render) {
                try { ui.render(); } catch(uiErr) { console.error("Excepción visual aislada tras reconciliación:", uiErr); }
            }
            return finalSuccess;
        };

        this._activePushPromise = runPushCycle();
        return await this._activePushPromise;
    },

    isContractPhaseUnlocked(phase, co) {
        if (!co) return false;
        // La empresa sandbox maestra y el profesorado tienen todas las fases desbloqueadas
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
        if (!win) return false;
        return Date.now() >= new Date(win.selectionStart).getTime();
    },

    isContractSelectionWindowOpen(phase, co) {
        if (!co) return false;
        // La empresa sandbox maestra tiene las 4 ventanas abiertas siempre
        if (co.unlockAllContracts === true) {
            return true;
        }
        const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
        if (!win) return false;
        const now = Date.now();
        const start = new Date(win.selectionStart).getTime();
        const end = new Date(win.selectionEnd).getTime();
        if (now < start || now > end) return false;
        if (phase === 'I' && !this.isBudgetInitialDelivered(co)) {
            return false;
        }
        return true;
    },

    isPressReleaseUnlocked(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const prPhases = typeof PRESS_RELEASE_PHASES !== 'undefined' ? PRESS_RELEASE_PHASES : [];
        const p = prPhases.find(item => item.phase === phaseKey);
        if (!p || !p.phaseCutoff) return false;
        return Date.now() >= new Date(p.phaseCutoff).getTime();
    },

    isPhaseBalanceUnlocked(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [];
        const p = phaseDefs.find(item => item.phase === phaseKey);
        if (!p || !p.cutoffDate) return false;
        return Date.now() >= new Date(p.cutoffDate).getTime();
    },

    isPhaseBalanceInWindow(phaseKey, co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const phaseDefs = typeof FINANCIAL_PHASE_BALANCES_DEF !== 'undefined' ? FINANCIAL_PHASE_BALANCES_DEF : [];
        const p = phaseDefs.find(item => item.phase === phaseKey);
        if (!p || !p.cutoffDate) return false;
        const cutoffMs = new Date(p.cutoffDate).getTime();
        const now = Date.now();
        const windowEndMs = cutoffMs + (14 * 24 * 60 * 60 * 1000);
        return now >= cutoffMs && now <= windowEndMs;
    },

    isLaunchLicenseUnlocked(co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const pItem = co.deliverables?.['preliminaryReport'];
        return Boolean(pItem && ((pItem.status === 'DELIVERED_TO_TEACHER' && pItem.driveUrl) || (typeof pItem === 'string' && pItem.length > 0)));
    },

    isBudgetInitialDelivered(co) {
        if (!co && this.user) {
            co = this.data.companies?.[this.user.coId];
        }
        if (!co) return false;
        if (co.unlockAllContracts === true || (this.user && this.user.admin)) {
            return true;
        }
        const p = co.deliverables?.['budgetInitial'];
        if (!p) return false;
        if (typeof p === 'string' && p.trim().length > 0) return true;
        if (typeof p === 'object' && p !== null) {
            const st = String(p.status || '');
            if (st === 'ACCEPTED' || st === 'REVIEWED' || st === 'APPROVED' || st === 'APROBADO') return true;
            if (st === 'DELIVERED_TO_TEACHER' && p.driveUrl && String(p.driveUrl).trim().length > 0) return true;
        }
        return false;
    },

    signCommercialContract(coId, contractId) {
        const co = this.data.companies?.[coId];
        if (!co) {
            return { ok: false, error: 'Empresa no encontrada' };
        }
        // Validar rol CEO o Claustro
        const effectiveRole = this.getEffectiveRole(this.user, co);
        const isCEO = this.user && (effectiveRole === 'CEO' || this.user.admin);
        if (!isCEO) {
            return { ok: false, error: 'Solo la Dirección General (CEO) tiene potestad legal para firmar contratos comerciales.' };
        }
        const contract = (typeof CONTRACTS_CATALOG_DEF !== 'undefined' ? CONTRACTS_CATALOG_DEF : []).find(c => c.id === contractId);
        if (!contract) {
            return { ok: false, error: 'Contrato comercial no registrado en el catálogo oficial.' };
        }
        const phase = contract.phase;

        // Validar entrega de Presupuesto Inicial en Fase I
        if (phase === 'I' && !this.isBudgetInitialDelivered(co)) {
            return { ok: false, error: 'Para suscribir un contrato comercial de la Fase I es imprescindible haber entregado previamente el Presupuesto Inicial de Economía (DOC_4).' };
        }

        // Validar ventana temporal
        if (!this.isContractSelectionWindowOpen(phase, co)) {
            const win = typeof CONTRACTS_PHASE_WINDOWS !== 'undefined' ? CONTRACTS_PHASE_WINDOWS[phase] : null;
            return { ok: false, error: `La ventana de suscripción para la Fase ${phase} no está activa. Plazo oficial: ${win?.windowLabel || 'Primeros 5 días lectivos'}.` };
        }
        co.contracts = co.contracts || {};
        if (co.contracts[phase] && co.contracts[phase].contractId) {
            return { ok: false, error: `La empresa ya ha suscrito el contrato "${co.contracts[phase].title}" en la Fase ${phase}. Cada startup puede firmar únicamente un (1) contrato por fase.` };
        }

        const now = Date.now();
        co.contracts[phase] = {
            contractId: contract.id,
            phase: contract.phase,
            company: contract.company,
            title: contract.title,
            requirements: contract.requirements,
            reward: contract.reward,
            penalty: contract.penalty,
            verification: contract.verification,
            dept: contract.dept,
            signedAt: now,
            signedDate: new Date().toLocaleString(),
            signedBy: this.user ? (effectiveRole !== this.user.role ? `${this.user.role} (${effectiveRole})` : this.user.role) : 'CEO',
            status: 'EN_CURSO',
            settledAt: null,
            settledBy: null,
            settlementNote: null,
            ledgerTxId: null
        };
        co.updatedAt = now;
        this.save(coId);
        if (typeof this.pushToCloud === 'function') this.pushToCloud(false);
        return { ok: true, contract: co.contracts[phase] };
    },

    settleCommercialContract(coId, phase, isCompleted, reasonNote = '') {
        const co = this.data.companies?.[coId];
        if (!co) {
            return { ok: false, error: 'Empresa no encontrada' };
        }
        if (!this.user || !this.user.admin) {
            return { ok: false, error: 'La auditoría y liquidación de contratos es exclusiva del profesorado evaluador.' };
        }
        co.contracts = co.contracts || {};
        const cRecord = co.contracts[phase];
        if (!cRecord || !cRecord.contractId) {
            return { ok: false, error: `La empresa no cuenta con un contrato comercial suscrito en la Fase ${phase}.` };
        }

        const now = Date.now();
        const delta = isCompleted ? Number(cRecord.reward) : -Number(cRecord.penalty);
        const concept = isCompleted
            ? `[CONTRATO_COMERCIAL] Cumplimiento de misión: ${cRecord.company} — ${cRecord.title}`
            : `[CONTRATO_COMERCIAL] Penalización por incumplimiento de misión: ${cRecord.company} — ${cRecord.title}`;

        // Rectificación si ya estaba liquidado previamente:
        // Eliminar asiento previo en el Ledger y registrarlo en deletedLedgerTxIds para evitar resurrecciones multi-dispositivo
        if (cRecord.settledAt && Array.isArray(co.ledger)) {
            co.deletedLedgerTxIds = Array.isArray(co.deletedLedgerTxIds) ? co.deletedLedgerTxIds : [];
            const removedIds = [];
            if (cRecord.ledgerTxId) {
                co.ledger = co.ledger.filter(tx => {
                    const match = tx && (tx.id === cRecord.ledgerTxId || tx.tx_id === cRecord.ledgerTxId);
                    if (match) removedIds.push(String(tx.id || tx.tx_id));
                    return !match;
                });
                removedIds.push(String(cRecord.ledgerTxId));
            } else {
                co.ledger = co.ledger.filter(tx => {
                    const match = tx && tx.dept === 'CONTRATO_COMERCIAL' && tx.concept && tx.concept.includes(cRecord.title);
                    if (match && (tx.id || tx.tx_id)) removedIds.push(String(tx.id || tx.tx_id));
                    return !match;
                });
            }
            removedIds.forEach(rid => {
                if (rid && !co.deletedLedgerTxIds.includes(rid)) co.deletedLedgerTxIds.push(rid);
            });
        }

        cRecord.status = isCompleted ? 'CUMPLIDO' : 'NO_CUMPLIDO';
        cRecord.settledAt = now;
        cRecord.settledDate = new Date().toLocaleString();
        cRecord.settledBy = this.user.role || 'DOCENTE';
        cRecord.settlementNote = reasonNote || (isCompleted ? 'Validado con éxito por comité docente' : 'Incumplimiento de requisitos técnicos/financieros');

        // Generar asiento contable en Ledger y vincular su ID inmutable
        const newTx = this.addToLedger(coId, concept, 'CONTRATO_COMERCIAL', delta);
        if (newTx && newTx.id) {
            cRecord.ledgerTxId = newTx.id;
        }
        co.updatedAt = now;
        this.saveLocalOnly();

        if (typeof ui !== 'undefined' && typeof ui.pushNotification === 'function') {
            const msg = isCompleted
                ? `🤝 Contrato de Fase ${phase} (${cRecord.company}) LIQUIDADO con éxito (+${Number(cRecord.reward).toFixed(2)} €v en el Ledger).`
                : `⚠️ Contrato de Fase ${phase} (${cRecord.company}) marcado como NO CUMPLIDO (penalización de -${Number(cRecord.penalty).toFixed(2)} €v).`;
            const nType = isCompleted ? 'success' : 'error';
            ui.pushNotification(coId, 'CEO', msg, nType, { view: 'contracts' });
            ui.pushNotification(coId, 'FINANZAS', msg, nType, { view: 'finance' });
        }
        if (typeof this.pushToCloud === 'function') this.pushToCloud(false);

        return { ok: true, contract: cRecord, delta };
    },

    isCompanyBankrupt(coOrId) {
        const co = (typeof coOrId === 'string') ? this.data?.companies?.[coOrId] : coOrId;
        if (!co) return false;
        return Number(co.balance) <= 0;
    },

    createDefaultFinalContest() {
        return {
            finalists: { A: null, B: null, C: null, D: null, E: null, F: null },
            launches: {},
            podium: { first: null, second: null, third: null },
            roleAwards: { CEO: null, TECNICO: null, FINANZAS: null, MARKETING: null, OPERACIONES: null },
            published: false,
            publishedAt: 0,
            updatedAt: 0
        };
    },

    normalizeFinalContest(rawContest, companies = {}, deletedCompanyIds = []) {
        const base = this.createDefaultFinalContest();
        const src = (rawContest && typeof rawContest === 'object') ? rawContest : {};
        const deletedSet = new Set(Array.isArray(deletedCompanyIds) ? deletedCompanyIds.map(String) : []);
        const validCo = (cid) => {
            if (!cid || typeof cid !== 'string') return false;
            if (deletedSet.has(cid)) return false;
            return Boolean(companies && companies[cid]);
        };

        const classes = typeof CONTEST_CLASSES !== 'undefined' ? CONTEST_CLASSES : ['A', 'B', 'C', 'D', 'E', 'F'];
        const activeFinalists = new Set();
        classes.forEach(cls => {
            const rawId = src.finalists && typeof src.finalists[cls] === 'string' ? src.finalists[cls].trim() : null;
            if (rawId && validCo(rawId) && (companies[rawId].classGroup || 'A').toUpperCase() === cls) {
                base.finalists[cls] = rawId;
                activeFinalists.add(rawId);
            } else {
                base.finalists[cls] = null;
            }
        });

        const srcLaunches = (src.launches && typeof src.launches === 'object') ? src.launches : {};
        Object.keys(srcLaunches).forEach(cid => {
            if (!validCo(cid)) return;
            const l = srcLaunches[cid];
            if (!l || typeof l !== 'object') return;
            const rawH = l.heightMm !== null && l.heightMm !== undefined && l.heightMm !== '' ? Number(l.heightMm) : null;
            const rawC = l.costEurV !== null && l.costEurV !== undefined && l.costEurV !== '' ? Number(l.costEurV) : null;
            const hOk = rawH !== null && isFinite(rawH) && rawH >= 0 ? rawH : null;
            const cOk = rawC !== null && isFinite(rawC) && rawC > 0 ? rawC : null;
            const eff = (hOk !== null && cOk !== null && cOk > 0)
                ? Math.round(((hOk / cOk) + Number.EPSILON) * 10000) / 10000
                : null;
            base.launches[cid] = {
                heightMm: hOk,
                costEurV: cOk,
                efficiency: eff,
                videoUrl: typeof l.videoUrl === 'string' ? l.videoUrl.trim() : '',
                recordedAt: Number(l.recordedAt) || 0
            };
        });

        const seenPodium = new Set();
        ['first', 'second', 'third'].forEach(slot => {
            const rawId = src.podium && typeof src.podium[slot] === 'string' ? src.podium[slot].trim() : null;
            if (rawId && activeFinalists.has(rawId) && !seenPodium.has(rawId)) {
                base.podium[slot] = rawId;
                seenPodium.add(rawId);
            } else {
                base.podium[slot] = null;
            }
        });

        ['CEO', 'TECNICO', 'FINANZAS', 'MARKETING', 'OPERACIONES'].forEach(rKey => {
            const rawId = src.roleAwards && typeof src.roleAwards[rKey] === 'string' ? src.roleAwards[rKey].trim() : null;
            base.roleAwards[rKey] = (rawId && activeFinalists.has(rawId)) ? rawId : null;
        });

        base.published = Boolean(src.published && base.podium.first);
        base.publishedAt = base.published ? (Number(src.publishedAt) || 0) : 0;
        base.updatedAt = Number(src.updatedAt) || 0;
        return base;
    },

    addToLedger(coId, concept, dept, delta) {
        const co = this.data.companies[coId];
        if (!co) return null; 
        const deltaNum = Math.round((Number(delta || 0) + Number.EPSILON) * 100) / 100;
        co.ledger = Array.isArray(co.ledger) ? co.ledger : [];
        const now = Date.now();
        const txId = 'TX-' + now.toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
        
        const tx = {
            id: txId,
            tx_id: txId,
            date: new Date().toLocaleString(),
            concept,
            dept,
            delta: deltaNum,
            timestamp: now,
            final: 0
        };
        co.ledger.unshift(tx);

        this.recalculateBalance(co);
        if (co.ledger[0]) {
            co.ledger[0].final = co.balance;
        }
        co.updatedAt = now;
        this.save(coId);
        return tx;
    }
};

const telemetry = {
    startSession(entity, role) {
        if (!state.data.telemetry) state.data.telemetry = { totalLogins: 0, sessions: [] };
        if (!Array.isArray(state.data.telemetry.sessions)) state.data.telemetry.sessions = [];
        if (isNaN(state.data.telemetry.totalLogins)) state.data.telemetry.totalLogins = 0;

        state.data.telemetry.totalLogins++;
        state.sessionData = { sessionId: 'SESS-' + Date.now().toString().slice(-6), timestamp: new Date().toISOString(), entity, role, events: [] };
        state.data.telemetry.sessions.unshift(state.sessionData);
        if(state.data.telemetry.sessions.length > 100) state.data.telemetry.sessions.pop();
        state.save('__GLOBAL__');
    },
    log(action, details) {
        if(!state.sessionData) return;
        state.sessionData.events = state.sessionData.events || [];
        state.sessionData.events.push({ time: new Date().toLocaleTimeString(), action, details });
        state.save('__GLOBAL__');
    }
};
