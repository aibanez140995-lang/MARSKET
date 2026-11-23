// js/ui-print-newspaper.js
// --- ESTUDIO DE EDICIÓN IMPRESA MENSUAL A3 (8 PÁGINAS / 4 CARAS DÚPLEX · ESTILO THE WASHINGTON POST) ---

Object.assign(ui, {
    printStudioActive: false,
    printStudioEditionId: null,
    printStudioViewMode: 'reading', // 'reading' (Págs 1..8) | 'imposed' (4 Caras A3 [8|1], [2|7], [6|3], [4|5])
    printStudioZoomMode: 'fit', // 'fit' (escalado proporcional WYSIWYG) | 'actual' (100% 210mm reales)
    printPickerSectionFilter: 'ALL',
    _printResizeBound: false,

    resolvePrintImageUrl(rawUrl, forPrint = false) {
        const u = String(rawUrl || '').trim();
        if (!u) return '';
        if (u.startsWith('data:image/')) return u;
        const resolved = (typeof this.getNewsImageSrc === 'function') ? this.getNewsImageSrc(u) : u;
        if (forPrint && resolved.startsWith('/')) {
            return window.location.origin + resolved;
        }
        return resolved;
    },

    openPrintEditionStudio() {
        if (!this.isNewsCoordinator || !this.isNewsCoordinator()) {
            return this.notify("Acceso restringido exclusivamente a Coordinación.", "error");
        }
        this.printStudioActive = true;
        this.ensureActivePrintEdition();
        this.current = 'news';
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    closePrintEditionStudio() {
        this.printStudioActive = false;
        this.render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    getWhoIsWhoRealPresets() {
        return [
            { id: 'real-pld', name: 'PLD Space', country: 'España', region: 'ES', category: 'Lanzadores', website: 'https://www.pldspace.com', domain: 'pldspace.com', monogram: 'PLD', accentColor: '#0284c7', summary: 'Fabricación y ensayo del lanzador orbital MIURA 5.' },
            { id: 'real-sener', name: 'Sener Aeroespacial', country: 'España', region: 'ES', category: 'Ingeniería & Defensa', website: 'https://www.group.sener', domain: 'group.sener', monogram: 'SEN', accentColor: '#dc2626', summary: 'Mecanismos espaciales, actuadores y aviónica de misión.' },
            { id: 'real-gmv', name: 'GMV', country: 'España', region: 'ES', category: 'Navegación & Control', website: 'https://www.gmv.com', domain: 'gmv.com', monogram: 'GMV', accentColor: '#b91c1c', summary: 'Sistemas de control orbital, Galileo y segmento terreno.' },
            { id: 'real-sateliot', name: 'Sateliot', country: 'España', region: 'ES', category: 'Constelaciones IoT', website: 'https://sateliot.space', domain: 'sateliot.space', monogram: 'SAT', accentColor: '#0f172a', summary: 'Constelación española de nanosatélites 5G IoT en órbita baja.' },
            { id: 'real-airbus-es', name: 'Airbus España', country: 'España', region: 'ES', category: 'Estructuras & Espacio', website: 'https://www.airbus.com', domain: 'airbus.com', monogram: 'AIR', accentColor: '#1d4ed8', summary: 'Estructuras espaciales, lanzadores europeos y satélites.' },
            { id: 'real-deimos', name: 'Deimos (Elecnor)', country: 'España', region: 'ES', category: 'Misiones & Análisis', website: 'https://www.elecnor-deimos.com', domain: 'elecnor-deimos.com', monogram: 'DEI', accentColor: '#0369a1', summary: 'Ingeniería de misión, observación terrestre y reentrada.' },
            { id: 'real-esa', name: 'ESA (Agencia Espacial Europea)', country: 'Europa', region: 'EU', category: 'Agencia Espacial', website: 'https://www.esa.int', domain: 'esa.int', monogram: 'ESA', accentColor: '#003247', summary: 'Agencia intergubernamental europea de ciencia, exploración y transporte.' },
            { id: 'real-arianegroup', name: 'ArianeGroup / Arianespace', country: 'Europa', region: 'EU', category: 'Lanzadores Pesados', website: 'https://www.ariane.group', domain: 'ariane.group', monogram: 'ARI', accentColor: '#0f172a', summary: 'Desarrollo industrial y comercialización de Ariane 6.' },
            { id: 'real-isar', name: 'Isar Aerospace', country: 'Alemania', region: 'EU', category: 'Lanzadores', website: 'https://www.isaraerospace.com', domain: 'isaraerospace.com', monogram: 'ISA', accentColor: '#334155', summary: 'Lanzamiento de satélites pequeños con el cohete Spectrum.' },
            { id: 'real-avio', name: 'Avio', country: 'Italia', region: 'EU', category: 'Propulsión & Lanzadores', website: 'https://www.avio.com', domain: 'avio.com', monogram: 'AVI', accentColor: '#1e3a8a', summary: 'Desarrollo de propulsión sólida y servicios de lanzamiento Vega-C.' },
            { id: 'real-maia', name: 'MaiaSpace', country: 'Francia', region: 'EU', category: 'Lanzadores Reutilizables', website: 'https://www.maia-space.com', domain: 'maia-space.com', monogram: 'MAI', accentColor: '#4338ca', summary: 'Lanzador orbital europeo con primera etapa reutilizable.' },
            { id: 'real-rfa', name: 'Rocket Factory Augsburg', country: 'Alemania', region: 'EU', category: 'Micro-lanzadores', website: 'https://www.rfa.space', domain: 'rfa.space', monogram: 'RFA', accentColor: '#0f766e', summary: 'Desarrollo del lanzador comercial de satélites RFA ONE.' },
            { id: 'real-skyrora', name: 'Skyrora', country: 'R. Unido', region: 'EU', category: 'Lanzadores', website: 'https://www.skyrora.com', domain: 'skyrora.com', monogram: 'SKY', accentColor: '#0369a1', summary: 'Desarrollo del lanzador ligero Skyrora XL.' },
            { id: 'real-nasa', name: 'NASA', country: 'EE. UU.', region: 'INTL', category: 'Agencia Espacial', website: 'https://www.nasa.gov', domain: 'nasa.gov', monogram: 'NAS', accentColor: '#0b3d91', summary: 'Agencia espacial pública estadounidense, programa Artemis e I+D.' },
            { id: 'real-spacex', name: 'SpaceX', country: 'EE. UU.', region: 'INTL', category: 'Lanzadores Reutilizables', website: 'https://www.spacex.com', domain: 'spacex.com', monogram: 'SPX', accentColor: '#0f172a', summary: 'Falcon 9, Falcon Heavy y desarrollo del sistema Starship.' },
            { id: 'real-blue', name: 'Blue Origin', country: 'EE. UU.', region: 'INTL', category: 'Lanzadores & Carga', website: 'https://www.blueorigin.com', domain: 'blueorigin.com', monogram: 'BLU', accentColor: '#0284c7', summary: 'Lanzador orbital New Glenn y vuelos suborbitales New Shepard.' },
            { id: 'real-rocketlab', name: 'Rocket Lab', country: 'EE. UU.', region: 'INTL', category: 'Lanzadores & Satélites', website: 'https://www.rocketlabusa.com', domain: 'rocketlabusa.com', monogram: 'RKL', accentColor: '#111827', summary: 'Lanzador ligero Electron y desarrollo del cohete Neutron.' },
            { id: 'real-firefly', name: 'Firefly Aerospace', country: 'EE. UU.', region: 'INTL', category: 'Lanzadores & Luna', website: 'https://fireflyspace.com', domain: 'fireflyspace.com', monogram: 'FIR', accentColor: '#ca8a04', summary: 'Cohete Alpha, módulo lunar Blue Ghost y vehículos Elytra.' },
            { id: 'real-landspace', name: 'LandSpace', country: 'China', region: 'INTL', category: 'Propulsión Metano', website: 'https://www.landspace.com', domain: 'landspace.com', monogram: 'LDS', accentColor: '#475569', summary: 'Familia de lanzadores orbitales de metano líquido Zhuque.' }
        ];
    },

    getBeyondRocketDefaultDirectory() {
        return [
            { cat: 'SATÉLITES Y DATOS', name: 'ICEYE · Finlandia', desc: 'Satélites radar SAR para observar la Tierra de día y de noche.' },
            { cat: 'SATÉLITES Y DATOS', name: 'Planet Labs · EE. UU.', desc: 'Imágenes terrestres mediante constelaciones de observación óptica.' },
            { cat: 'SATÉLITES Y DATOS', name: 'Open Cosmos · R. Unido', desc: 'Diseño, operación y datos de misiones satelitales.' },
            { cat: 'LOGÍSTICA ORBITAL', name: 'D-Orbit · Italia', desc: 'Transporte y despliegue de satélites con el vehículo ION.' },
            { cat: 'LOGÍSTICA ORBITAL', name: 'Astroscale · Japón', desc: 'Inspección orbital y tecnologías para retirar residuos espaciales.' },
            { cat: 'LOGÍSTICA ORBITAL', name: 'Exolaunch · Alemania', desc: 'Integración y despliegue de satélites en lanzamientos compartidos.' },
            { cat: 'LUNA Y ESTACIONES', name: 'Intuitive Machines · EE. UU.', desc: 'Transporte lunar y módulos de alunizaje Nova-C.' },
            { cat: 'LUNA Y ESTACIONES', name: 'The Exploration Co. · Europa', desc: 'Desarrollo de la cápsula de carga y retorno Nyx.' },
            { cat: 'LUNA Y ESTACIONES', name: 'Axiom Space · EE. UU.', desc: 'Misiones privadas tripuladas y módulos comerciales.' },
            { cat: 'AVIACIÓN AVANZADA', name: 'Virgin Galactic · EE. UU.', desc: 'Vuelos suborbitales con nave espacial lanzada desde avión.' },
            { cat: 'AVIACIÓN AVANZADA', name: 'Joby Aviation · EE. UU.', desc: 'Aeronaves eléctricas de despegue y aterrizaje vertical.' },
            { cat: 'AGENCIAS', name: 'NASA · EE. UU.', desc: 'Agencia espacial pública. Exploración y ciencia, incluido Artemis.' },
            { cat: 'AGENCIAS', name: 'ESA · Europa', desc: 'Agencia intergubernamental europea de ciencia, exploración y transporte.' },
            { cat: 'AGENCIAS', name: 'ISRO · India', desc: 'Agencia espacial pública india y operadora de lanzadores propios.' }
        ];
    },

    getPrintEditionDefaultPages() {
        return [
            {
                pageNumber: 1,
                label: 'Portada',
                sectionTitle: 'PORTADA PRINCIPAL',
                slots: [
                    { id: 'p1-lead', role: 'lead', kicker: 'ACTUALIDAD Y ESTRATEGIA', title: 'Noticia Principal de Portada', subtitle: 'Entradilla editorial en cursiva...', body: 'Selecciona una noticia real o crónica de Coordinación para la apertura de portada.', imageUrl: '', mediaSource: 'Consejo Editorial AEE', fontSizePt: 10 }
                ],
                adSlot: null
            },
            {
                pageNumber: 2,
                label: 'Crónicas AEE',
                sectionTitle: 'CRÓNICAS DE LA MISIÓN & EDITORIAL',
                slots: [
                    { id: 'p2-a1', role: 'article', kicker: 'EDITORIAL AEE', title: 'Avance de la Misión Aeroespacial', subtitle: 'Estado de las startups y próximos hitos.', body: 'Crónica escrita por Coordinación sobre el progreso de las clases A-F.', imageUrl: '', mediaSource: 'Consejo Editorial AEE', fontSizePt: 9.5 },
                    { id: 'p2-a2', role: 'article', kicker: 'GESTIÓN & NORMATIVA', title: 'Claves del Mes en MARS-KET 2.0', subtitle: '', body: 'Recordatorio de plazos, seguridad en banco de pruebas y buenas prácticas.', imageUrl: '', mediaSource: 'Coordinación General', fontSizePt: 9.5 }
                ],
                adSlot: { id: 'ad-p2', label: 'Faldón Publicitario Pág. 2', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 3,
                label: 'Mundo Aeroespacial',
                sectionTitle: 'ACTUALIDAD AEROESPACIAL INTERNACIONAL',
                slots: [
                    { id: 'p3-a1', role: 'article', kicker: 'PRENSA INTERNACIONAL', title: 'Noticia Real de Cohetes #1', subtitle: '', body: 'Selecciona una noticia real del teletipo para mostrarla traducida al castellano con su fuente original.', imageUrl: '', mediaSource: 'SpaceNews', fontSizePt: 9.5 },
                    { id: 'p3-a2', role: 'article', kicker: 'PROPULSIÓN GLOBAL', title: 'Noticia Real de Cohetes #2', subtitle: '', body: 'Segunda noticia aeroespacial traducida al castellano.', imageUrl: '', mediaSource: 'NASASpaceFlight', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p3', label: 'Faldón Publicitario Pág. 3', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 4,
                label: 'Startups I (Central Izq.)',
                sectionTitle: 'ECOSISTEMA DE STARTUPS · NOTAS DE PRENSA',
                slots: [
                    { id: 'p4-a1', role: 'article', kicker: 'COMUNICADO DOC_15', title: 'Nota de Prensa Corporativa #1', subtitle: '', body: 'Espacio reservado para comunicados de startups aprobados por Lengua y Coordinación.', imageUrl: '', mediaSource: 'Prensa Startups', fontSizePt: 9.5 },
                    { id: 'p4-a2', role: 'article', kicker: 'COMUNICADO DOC_15', title: 'Nota de Prensa Corporativa #2', subtitle: '', body: 'Resumen de logros técnicos y financieros de los equipos de 4º ESO.', imageUrl: '', mediaSource: 'Prensa Startups', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p4', label: 'Faldón Publicitario Pág. 4', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 5,
                label: 'Startups II (Central Der.)',
                sectionTitle: 'MERCADO SECUNDARIO B2B & RENDIMIENTO',
                slots: [
                    { id: 'p5-a1', role: 'article', kicker: 'INNOVACIÓN & EFICIENCIA', title: 'Ranking de Eficiencia y Prototipos', subtitle: '', body: 'Análisis comparativo del rendimiento E = Altura / Coste en el Banco de Pruebas.', imageUrl: '', mediaSource: 'Dirección Técnica AEE', fontSizePt: 9.5 },
                    { id: 'p5-a2', role: 'article', kicker: 'MERCADO B2B', title: 'Actividad en Aduana y Traspasos', subtitle: '', body: 'Movimientos de segunda mano (DOC_9) y aprovechamiento de excedentes entre startups.', imageUrl: '', mediaSource: 'Aduana B2B AEE', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p5', label: 'Faldón Publicitario Pág. 5', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 6,
                label: 'Ciencia e I+D',
                sectionTitle: 'CIENCIA, PROPULSIÓN E I+D ESCOLAR',
                slots: [
                    { id: 'p6-a1', role: 'article', kicker: 'CIENCIA AEROESPACIAL', title: 'Reportaje Técnico de Propulsión', subtitle: '', body: 'Noticia real o artículo divulgativo de Física y Química aplicado al diseño del cohete.', imageUrl: '', mediaSource: 'ESA / FyQ', fontSizePt: 9.5 },
                    { id: 'p6-a2', role: 'article', kicker: 'TALLER & BOM', title: 'Control de Calidad y Materiales', subtitle: '', body: 'Notas de taller, optimización de masa y uso responsable de IA.', imageUrl: '', mediaSource: 'Operaciones AEE', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p6', label: 'Faldón Publicitario Pág. 6', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 7,
                label: 'Economía / Quién es quién',
                sectionTitle: 'DIRECTORIO // QUIÉN ES QUIÉN',
                pageMode: 'who_is_who', // 'who_is_who' | 'news'
                whoIsWhoConfig: {
                    realIds: ['real-spacex', 'real-pld', 'real-blue', 'real-rocketlab', 'real-isar', 'real-arianegroup'],
                    startups: [] // [{ coId, prototypeName }]
                },
                slots: [
                    { id: 'p7-a1', role: 'article', kicker: 'ECONOMÍA & FINANZAS', title: 'Licitaciones Comerciales del Mes', subtitle: '', body: 'Estado de los contratos comerciales y disciplina presupuestaria en €v.', imageUrl: '', mediaSource: 'Economía AEE', fontSizePt: 9.5 },
                    { id: 'p7-a2', role: 'article', kicker: 'GOBERNANZA', title: 'Liderazgo y Decisiones del Consejo', subtitle: '', body: 'Buenas prácticas de dirección general y coordinación departamental.', imageUrl: '', mediaSource: 'Liderazgo LyE', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p7', label: 'Faldón Publicitario Pág. 7', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 8,
                label: 'Contraportada / Más allá del cohete',
                sectionTitle: 'CONTRAPORTADA // MÁS ALLÁ DEL COHETE',
                pageMode: 'beyond_rocket', // 'beyond_rocket' | 'news'
                beyondRocketConfig: {
                    subtitle: 'Satélites, logística orbital, exploración, aviación y próximos lanzamientos.',
                    directoryItems: this.getBeyondRocketDefaultDirectory(),
                    ll2Launches: [],
                    ll2SyncedAt: 0
                },
                slots: [
                    { id: 'p8-lead', role: 'lead', kicker: 'CIERRE DE EDICIÓN', title: 'Artículo de Contraportada', subtitle: 'Reflexión final del mes sobre el sector espacial.', body: 'Crónica de cierre o noticia internacional destacada para la contraportada del periódico.', imageUrl: '', mediaSource: 'ORBITAL REPORT', fontSizePt: 9.5 }
                ],
                adSlot: { id: 'ad-p8', label: 'Faldón Destacado de Contraportada (Pág. 8)', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            }
        ];
    },

    ensureActivePrintEdition() {
        state.data.printEditions = Array.isArray(state.data.printEditions) ? state.data.printEditions : [];
        if (state.data.printEditions.length === 0) {
            const monthName = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
            const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
            const now = Date.now();
            const firstEd = {
                id: 'PRINT-ED-' + now,
                issueNumber: 1,
                issueLabel: `Edición n.º 1 — ${capMonth}`,
                dateLabel: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
                phase: typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I',
                updatedAt: now,
                pages: this.getPrintEditionDefaultPages()
            };
            state.data.printEditions.unshift(firstEd);
            this.printStudioEditionId = firstEd.id;
            this.autoLayoutPrintEdition(true);
            return firstEd;
        }
        let ed = state.data.printEditions.find(e => e && String(e.id) === String(this.printStudioEditionId));
        if (!ed) {
            ed = state.data.printEditions[0];
            this.printStudioEditionId = ed.id;
        }
        return ed;
    },

    getActivePrintEdition() {
        return this.ensureActivePrintEdition();
    },

    createNewPrintEditionModal() {
        if (!this.isNewsCoordinator()) return;
        const nextNum = (state.data.printEditions || []).length + 1;
        const monthName = new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
        const capMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div>
                    <label for="new-print-issue-label" class="text-xs text-amber-300 font-bold uppercase block mb-1 font-mono">Título de la Edición Mensual</label>
                    <input type="text" id="new-print-issue-label" value="Edición n.º ${nextNum} — ${this.escapeAttr(capMonth)}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none focus:border-amber-400">
                </div>
                <p class="text-[11px] text-slate-300">Se creará un nuevo ejemplar de 8 páginas (4 caras A3 dúplex) autocompletado con las noticias actuales.</p>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.confirmCreateNewPrintEdition()" class="min-h-[44px] px-5 py-2 bg-amber-400 text-black font-black text-xs uppercase hover:bg-white">Crear Edición</button>
        `;
        this.showModal("📰 Nueva Edición Impresa A3", html, actions);
    },

    confirmCreateNewPrintEdition() {
        if (!this.isNewsCoordinator()) return;
        const label = (document.getElementById('new-print-issue-label')?.value || '').trim() || 'Edición Mensual';
        const now = Date.now();
        const nextNum = (state.data.printEditions || []).length + 1;
        const ed = {
            id: 'PRINT-ED-' + now,
            issueNumber: nextNum,
            issueLabel: label,
            dateLabel: new Date().toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
            phase: typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I',
            updatedAt: now,
            pages: this.getPrintEditionDefaultPages()
        };
        state.data.printEditions = Array.isArray(state.data.printEditions) ? state.data.printEditions : [];
        state.data.printEditions.unshift(ed);
        this.printStudioEditionId = ed.id;
        this.autoLayoutPrintEdition(true);
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify(`✅ Creada "${label}"`, "success");
    },

    autoLayoutPrintEdition(silent = false) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        if (!ed || !Array.isArray(ed.pages)) return;

        const savedNews = Array.isArray(state.data.news) ? state.data.news : [];
        const wireNews = Array.isArray(this._snapiWireArticles) && this._snapiWireArticles.length > 0
            ? this._snapiWireArticles
            : (this.getSpaceflightWireFallback ? this.getSpaceflightWireFallback() : []);

        const publishedPRs = [];
        Object.keys(state.data.companies || {}).forEach(cid => {
            const co = state.data.companies[cid];
            if (!co || !co.pressReleases) return;
            Object.keys(co.pressReleases).forEach(pk => {
                const pr = co.pressReleases[pk];
                if (pr && pr.status === 'PUBLISHED') {
                    publishedPRs.push({ ...pr, companyName: co.name, classGroup: co.classGroup || 'A' });
                }
            });
        });

        const fillSlotFromNews = (slot, art, defaultImgMm = 32) => {
            if (!slot || !art) return;
            const sec = String(art.section || 'actualidad').toLowerCase();
            const fallbackKicker = sec === 'historia'
                ? 'UN POCO DE HISTORIA'
                : (sec === 'inventos' ? 'DEL ESPACIO A TU CASA' : 'ACTUALIDAD AEROESPACIAL');
            slot.kicker = art.category || fallbackKicker;
            slot.title = art.title || slot.title;
            slot.subtitle = art.subtitle || '';
            slot.body = art.body || art.title || '';
            slot.imageUrl = art.imageUrl ? this.resolvePrintImageUrl(art.imageUrl, false) : '';
            if (slot.imageUrl && (slot.imgHeightMm === undefined || slot.imgHeightMm === null || Number(slot.imgHeightMm) <= 0)) {
                slot.imgHeightMm = defaultImgMm;
            }
            slot.mediaSource = art.sourceName || art.author || 'Consejo Editorial AEE';
        };

        const fillSlotFromWire = (slot, art, defaultImgMm = 32) => {
            if (!slot || !art) return;
            slot.kicker = 'PRENSA INTERNACIONAL';
            slot.title = art.titleEs || art.title || slot.title;
            slot.subtitle = art.summaryEs || art.summary || '';
            slot.body = art.summaryEs || art.summary || art.titleEs || art.title || '';
            slot.imageUrl = art.proxy_image_url || (art.image_url ? this.resolvePrintImageUrl(art.image_url, false) : '');
            if (slot.imageUrl && (slot.imgHeightMm === undefined || slot.imgHeightMm === null || Number(slot.imgHeightMm) <= 0)) {
                slot.imgHeightMm = defaultImgMm;
            }
            slot.mediaSource = art.news_site || 'Spaceflight News';
        };

        const actNews = savedNews.filter(n => n && (n.section || 'actualidad') === 'actualidad');
        const histNews = savedNews.filter(n => n && n.section === 'historia');
        const invNews = savedNews.filter(n => n && n.section === 'inventos');

        // Pág. 1: Portada (1 noticia principal; el resumen de páginas se genera abajo)
        if ((actNews[0] || savedNews[0]) && ed.pages[0]?.slots?.[0]) fillSlotFromNews(ed.pages[0].slots[0], actNews[0] || savedNews[0], 60);

        // Pág. 2: Crónicas AEE
        if (actNews[1] || savedNews[2]) fillSlotFromNews(ed.pages[1].slots[0], actNews[1] || savedNews[2], 32);
        if (histNews[0] || savedNews[3]) fillSlotFromNews(ed.pages[1].slots[1], histNews[0] || savedNews[3], 32);

        // Pág. 3: Actualidad Aeroespacial Internacional (SNAPI traducido + fuente)
        if (wireNews[0]) fillSlotFromWire(ed.pages[2].slots[0], wireNews[0], 32);
        if (wireNews[1]) fillSlotFromWire(ed.pages[2].slots[1], wireNews[1], 32);

        // Pág. 4: Notas de Prensa DOC_15
        if (publishedPRs[0]) {
            const p = publishedPRs[0];
            ed.pages[3].slots[0].kicker = `COMUNICADO DOC_15`;
            ed.pages[3].slots[0].title = `${p.companyName}: ${p.title}`;
            ed.pages[3].slots[0].body = p.editorialNote || `Comunicado oficial de cierre de Fase ${p.phase} publicado por ${p.companyName}.`;
            ed.pages[3].slots[0].imageUrl = p.nanoBananaImage || '';
            ed.pages[3].slots[0].mediaSource = `${p.companyName} (DOC_15)`;
        }
        if (publishedPRs[1]) {
            const p = publishedPRs[1];
            ed.pages[3].slots[1].kicker = `COMUNICADO DOC_15`;
            ed.pages[3].slots[1].title = `${p.companyName}: ${p.title}`;
            ed.pages[3].slots[1].body = p.editorialNote || `Comunicado oficial de cierre de Fase ${p.phase} publicado por ${p.companyName}.`;
            ed.pages[3].slots[1].imageUrl = p.nanoBananaImage || '';
            ed.pages[3].slots[1].mediaSource = `${p.companyName} (DOC_15)`;
        }

        // Pág. 6 y 8: Noticias reales o de secciones Historia/Inventos según sección de página
        if (invNews[0]) fillSlotFromNews(ed.pages[5].slots[0], invNews[0], 32);
        else if (wireNews[2]) fillSlotFromWire(ed.pages[5].slots[0], wireNews[2], 32);
        if (wireNews[3]) fillSlotFromWire(ed.pages[6].slots[0], wireNews[3], 32);
        if (wireNews[4]) fillSlotFromWire(ed.pages[7].slots[0], wireNews[4], 32);

        ed.updatedAt = Date.now();
        if (!silent) {
            state.save();
            if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
            this.render();
            this.notify("⚡ Edición de 8 páginas autocompletada con las noticias actuales.", "success");
        }
    },

    getPendingPrintAdRequests() {
        const list = [];
        const companies = state.data?.companies || {};
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (!co) return;
            (co.marketingCampaigns || []).forEach(camp => {
                (camp.executedActions || []).forEach(act => {
                    if (!act) return;
                    const isPrintAd = String(act.title || '').includes('Periódico Impreso') || String(act.title || '').includes('ORBITAL REPORT');
                    if (isPrintAd && (act.status === 'VALIDADO_CEO' || act.status === 'APROBADO_DOCENTE')) {
                        list.push({
                            coId: cid,
                            companyName: co.name,
                            classGroup: co.classGroup || 'A',
                            campId: camp.id,
                            packageName: camp.packageName,
                            actId: act.id,
                            status: act.status,
                            driveUrl: act.url || act.driveUrl || ''
                        });
                    }
                });
            });
        });
        return list;
    },

    modalEditPrintEditionMeta() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div>
                    <label for="edit-print-issue-label" class="text-xs text-amber-300 font-bold uppercase block mb-1 font-mono">Nombre de Edición (Ej: Edición n.º 1 — Noviembre)</label>
                    <input type="text" id="edit-print-issue-label" value="${this.escapeAttr(ed.issueLabel || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                </div>
                <div>
                    <label for="edit-print-date-label" class="text-xs text-slate-300 font-bold uppercase block mb-1 font-mono">Fecha Impresa en Cabecera</label>
                    <input type="text" id="edit-print-date-label" value="${this.escapeAttr(ed.dateLabel || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.savePrintEditionMeta()" class="min-h-[44px] px-5 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Cabecera</button>
        `;
        this.showModal("✏️ Cabecera de Edición Mensual", html, actions);
    },

    savePrintEditionMeta() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        ed.issueLabel = (document.getElementById('edit-print-issue-label')?.value || '').trim() || ed.issueLabel;
        ed.dateLabel = (document.getElementById('edit-print-date-label')?.value || '').trim() || ed.dateLabel;
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
    },

    getPrintSectionPresets() {
        return [
            { label: 'Actualidad', title: 'ACTUALIDAD AEROESPACIAL' },
            { label: 'Un poco de historia', title: 'UN POCO DE HISTORIA' },
            { label: 'Del Espacio a tu Casa', title: 'DEL ESPACIO A TU CASA // INVENTOS REALES' },
            { label: 'Entrevistas', title: 'ENTREVISTAS // VOCES DEL SECTOR' },
            { label: 'Reportaje Especial', title: 'REPORTAJE ESPECIAL' },
            { label: 'Ciencia y Propulsión', title: 'CIENCIA, PROPULSIÓN E I+D' },
            { label: 'Economía y Startups', title: 'ECONOMÍA ESPACIAL Y STARTUPS' },
            { label: 'Taller y Prototipos', title: 'TALLER, BOM Y PROTOTIPOS' },
            { label: 'Opinión y Debate', title: 'OPINIÓN Y DEBATE EN EL AULA' },
            { label: 'Crónicas AEE', title: 'CRÓNICAS DE LA MISIÓN & EDITORIAL' },
            { label: 'Mundo Aeroespacial', title: 'PANORAMA MUNDIAL AEROESPACIAL' },
            { label: 'Curiosidades Espaciales', title: 'CURIOSIDADES DEL ESPACIO' },
            { label: 'Quién es quién', title: 'DIRECTORIO // QUIÉN ES QUIÉN' },
            { label: 'Startups Navarras', title: 'DIRECTORIO // STARTUPS NAVARRAS' },
            { label: 'Más allá del cohete', title: 'CONTRAPORTADA // MÁS ALLÁ DEL COHETE' }
        ];
    },

    modalEditPrintPageSection(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        const presets = this.getPrintSectionPresets();
        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div>
                    <label for="print-sec-preset" class="text-xs text-amber-300 font-bold uppercase block mb-1 font-mono">Secciones Sugeridas (1 clic)</label>
                    <select id="print-sec-preset" onchange="ui.applyPrintSectionPreset(this.value)" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white">
                        <option value="">-- Elegir una sección predefinida --</option>
                        ${presets.map((p, i) => `<option value="${i}">${this.escapeHTML(p.label)} — (${this.escapeHTML(p.title)})</option>`).join('')}
                    </select>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label for="print-sec-label" class="text-[11px] text-mars-cyan font-bold uppercase block mb-1">Nombre Corto (Sumario)</label>
                        <input type="text" id="print-sec-label" value="${this.escapeAttr(page.label || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                    </div>
                    <div>
                        <label for="print-sec-title" class="text-[11px] text-mars-cyan font-bold uppercase block mb-1">Cabecera de la Página</label>
                        <input type="text" id="print-sec-title" value="${this.escapeAttr(page.sectionTitle || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white uppercase">
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.savePrintPageSection(${pageIdx})" class="min-h-[44px] px-5 py-2 bg-amber-400 text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Sección</button>
        `;
        this.showModal(`✏️ Editar Sección // Página ${page.pageNumber}`, html, actions);
    },

    applyPrintSectionPreset(idxStr) {
        if (idxStr === '') return;
        const p = this.getPrintSectionPresets()[parseInt(idxStr, 10)];
        if (!p) return;
        const lblEl = document.getElementById('print-sec-label');
        const titEl = document.getElementById('print-sec-title');
        if (lblEl) lblEl.value = p.label;
        if (titEl) titEl.value = p.title;
    },

    savePrintPageSection(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        const lbl = (document.getElementById('print-sec-label')?.value || '').trim();
        const tit = (document.getElementById('print-sec-title')?.value || '').trim();
        if (lbl) page.label = lbl;
        if (tit) page.sectionTitle = tit;
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify(`✅ Sección de Página ${page.pageNumber} actualizada.`, "success");
    },

    modalEditPrintSlot(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;

        const savedNews = Array.isArray(state.data.news) ? state.data.news : [];
        const wireNews = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];
        const optGroupFor = (secKey, label) => {
            const items = savedNews
                .map((n, i) => ({ n, i }))
                .filter(x => x.n && (x.n.section || 'actualidad') === secKey);
            if (items.length === 0) return '';
            return `<optgroup label="${this.escapeAttr(label)}">${items.map(({ n, i }) => `<option value="NEWS:${i}">${this.escapeHTML((n.title || '').slice(0, 74))}</option>`).join('')}</optgroup>`;
        };
        const curImgPreview = slot.imageUrl ? this.resolvePrintImageUrl(slot.imageUrl, false) : '';

        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div class="p-3 bg-cyan-950/40 border border-mars-cyan/50 rounded space-y-2">
                    <label for="print-slot-source-pick" class="text-xs text-mars-cyan font-bold uppercase block font-mono">📥 Cargar desde Periódico Digital o Teletipo Real (Opcional)</label>
                    <select id="print-slot-source-pick" data-page-num="${page.pageNumber}" data-slot-idx="${slotIdx}" onchange="ui.applySourceToPrintSlotEditor(this.value, this)" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                        <option value="">-- Mantener / Editar texto manualmente --</option>
                        ${optGroupFor('actualidad', '📡 Actualidad (Edición Digital)')}
                        ${optGroupFor('historia', '🏛️ Un poco de Historia')}
                        ${optGroupFor('inventos', '🏠 Del Espacio a tu Casa')}
                        ${wireNews.length > 0 ? `<optgroup label="🌐 Teletipo Aeroespacial Real">${wireNews.map((w, i) => `<option value="WIRE:${i}">[${this.escapeHTML(w.news_site || 'SNAPI')}] ${this.escapeHTML((w.titleEs || w.title || '').slice(0, 70))}</option>`).join('')}</optgroup>` : ''}
                    </select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label for="print-slot-kicker" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Antetítulo / Sección</label>
                        <input type="text" id="print-slot-kicker" list="print-kicker-presets" value="${this.escapeAttr(slot.kicker || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                        <datalist id="print-kicker-presets">
                            <option value="ACTUALIDAD">
                            <option value="UN POCO DE HISTORIA">
                            <option value="DEL ESPACIO A TU CASA">
                            <option value="ENTREVISTAS">
                            <option value="REPORTAJE ESPECIAL">
                            <option value="CIENCIA Y PROPULSIÓN">
                            <option value="ECONOMÍA Y STARTUPS">
                            <option value="OPINIÓN Y DEBATE">
                            <option value="TALLER Y PROTOTIPOS">
                            <option value="CURIOSIDADES ESPACIALES">
                        </datalist>
                    </div>
                    <div>
                        <label for="print-slot-source" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Fuente / Medio Original</label>
                        <input type="text" id="print-slot-source" value="${this.escapeAttr(slot.mediaSource || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                    </div>
                </div>

                <div>
                    <label for="print-slot-title" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Titular</label>
                    <input type="text" id="print-slot-title" value="${this.escapeAttr(slot.title || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-bold">
                </div>
                <div>
                    <label for="print-slot-subtitle" class="text-[11px] text-slate-300 font-bold uppercase block mb-1">Entradilla (Opcional)</label>
                    <input type="text" id="print-slot-subtitle" value="${this.escapeAttr(slot.subtitle || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                </div>
                <div>
                    <div class="flex flex-wrap justify-between items-center gap-2 mb-1">
                        <label for="print-slot-body" class="text-[11px] text-amber-300 font-bold uppercase">Cuerpo de la Noticia (Castellano) <span class="font-mono text-[10px] text-slate-400 normal-case ml-1">· **negrita** · *cursiva* · - lista</span></label>
                        <select id="print-slot-fontsize" class="bg-slate-900 border border-slate-700 px-2 py-1 text-[11px] text-cyan-300 font-mono">
                            ${[7.5, 8, 8.5, 9, 9.5, 10, 10.5].map(pt => `<option value="${pt}" ${Number(slot.fontSizePt || 9.5) === pt ? 'selected' : ''}>Letra ${pt} pt</option>`).join('')}
                        </select>
                    </div>
                    <textarea id="print-slot-body" rows="6" class="w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-sans">${this.escapeHTML(slot.body || '')}</textarea>
                </div>
                <div class="p-2.5 bg-black/60 border border-slate-800 rounded space-y-2">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                            <label for="print-slot-img-file" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Subir Imagen desde Equipo (Opcional)</label>
                            <input type="file" id="print-slot-img-file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'print-slot-img', 'print-slot-img-preview', null, { maxDim: 1600, quality: 0.92, keepOriginalUnderBytes: 420 * 1024 }); const h=document.getElementById('print-slot-img-height'); if(h && h.value==='0') h.value='35';" class="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black cursor-pointer">
                        </div>
                        <div class="grid grid-cols-2 gap-2">
                            <div>
                                <label for="print-slot-img-height" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Alto Imagen</label>
                                <select id="print-slot-img-height" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                                    ${[0, 15, 20, 25, 30, 32, 35, 40, 50, 60, 70, 85].map(mm => {
                                        const curMm = (slot.imgHeightMm !== undefined && slot.imgHeightMm !== null) ? Number(slot.imgHeightMm) : (page.pageNumber === 1 && slotIdx === 0 ? 60 : 32);
                                        return `<option value="${mm}" ${curMm === mm ? 'selected' : ''}>${mm === 0 ? 'Ocultar' : mm + ' mm'}</option>`;
                                    }).join('')}
                                </select>
                            </div>
                            <div>
                                <label for="print-slot-img-fit" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Encuadre</label>
                                <select id="print-slot-img-fit" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                                    <option value="cover" ${(slot.imgFit || 'cover') === 'cover' ? 'selected' : ''}>Recortar (Cover)</option>
                                    <option value="contain" ${slot.imgFit === 'contain' ? 'selected' : ''}>Completa (Contain)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label for="print-slot-img" class="text-[11px] text-slate-300 font-bold uppercase block mb-1">O URL de Imagen / Google Drive</label>
                        <input type="text" id="print-slot-img" value="${this.escapeAttr(slot.imageUrl || '')}" oninput="ui.previewNanoBananaUrl(this.value, 'print-slot-img-preview'); const h=document.getElementById('print-slot-img-height'); if(this.value.trim() && h && h.value==='0') h.value='35';" placeholder="/api/news/image?url=... o https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                    </div>
                    <div id="print-slot-img-preview" class="${curImgPreview ? '' : 'hidden'} bg-black border border-slate-700 p-1.5 flex items-center justify-center rounded">
                        ${curImgPreview ? `<img src="${this.escapeAttr(curImgPreview)}" alt="Vista previa" class="max-h-32 w-full object-contain">` : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.savePrintSlot(${pageIdx}, ${slotIdx})" class="min-h-[44px] px-5 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Aplicar a Página ${page.pageNumber}</button>
        `;
        this.showModal(`✏️ Editar Hueco // Página ${page.pageNumber} (${page.label})`, html, actions);
    },

    async applySourceToPrintSlotEditor(val, selectEl = null) {
        if (!val) return;
        const [kind, idxStr] = val.split(':');
        const idx = parseInt(idxStr, 10);
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
        const ensureVisibleImgHeight = () => {
            const hEl = document.getElementById('print-slot-img-height');
            if (hEl && (hEl.value === '0' || !hEl.value)) {
                const isLeadCover = selectEl?.dataset?.pageNum === '1' && selectEl?.dataset?.slotIdx === '0';
                hEl.value = isLeadCover ? '60' : '32';
            }
        };

        if (kind === 'NEWS') {
            const art = (state.data.news || [])[idx];
            if (!art) return;
            const secFallback = art.section === 'historia' ? 'UN POCO DE HISTORIA' : (art.section === 'inventos' ? 'DEL ESPACIO A TU CASA' : 'ACTUALIDAD');
            setVal('print-slot-kicker', art.category || secFallback);
            setVal('print-slot-source', art.sourceName || art.author || 'AEE');
            setVal('print-slot-title', art.title || '');
            setVal('print-slot-subtitle', art.subtitle || '');
            setVal('print-slot-body', art.body || '');
            const resolvedImg = art.imageUrl ? this.resolvePrintImageUrl(art.imageUrl, false) : '';
            setVal('print-slot-img', resolvedImg);
            if (resolvedImg) {
                ensureVisibleImgHeight();
                if (typeof this.previewNanoBananaUrl === 'function') this.previewNanoBananaUrl(resolvedImg, 'print-slot-img-preview');
            }
        } else if (kind === 'WIRE') {
            const art = (this._snapiWireArticles || [])[idx];
            if (!art) return;
            setVal('print-slot-kicker', 'PRENSA INTERNACIONAL');
            setVal('print-slot-source', art.news_site || 'Spaceflight News');
            setVal('print-slot-title', art.titleEs || art.title || '');
            setVal('print-slot-subtitle', art.summaryEs || art.summary || '');
            setVal('print-slot-body', art.summaryEs || art.summary || '');
            const wImg = art.proxy_image_url || (art.image_url ? this.resolvePrintImageUrl(art.image_url, false) : '');
            setVal('print-slot-img', wImg);
            if (wImg) {
                ensureVisibleImgHeight();
                if (typeof this.previewNanoBananaUrl === 'function') this.previewNanoBananaUrl(wImg, 'print-slot-img-preview');
            }

            if (art.url && /^https?:\/\//i.test(art.url)) {
                this.notify("🌐 Extrayendo artículo completo traducido...", "info");
                try {
                    const resp = await fetch(`/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(art.title || '')}&summary=${encodeURIComponent(art.summary || '')}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`);
                    if (resp.ok) {
                        const full = await resp.json();
                        setVal('print-slot-title', full.titleEs || art.titleEs || art.title);
                        setVal('print-slot-body', full.bodyEs || full.bodyEn || '');
                        if (full.imageUrl) {
                            setVal('print-slot-img', full.imageUrl);
                            ensureVisibleImgHeight();
                            if (typeof this.previewNanoBananaUrl === 'function') this.previewNanoBananaUrl(full.imageUrl, 'print-slot-img-preview');
                        }
                    }
                } catch (e) {}
            }
        }
    },

    savePrintSlot(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const slot = ed?.pages?.[pageIdx]?.slots?.[slotIdx];
        if (!slot) return;
        const getVal = (id) => (document.getElementById(id)?.value || '').trim();
        slot.kicker = getVal('print-slot-kicker') || 'ACTUALIDAD';
        slot.mediaSource = getVal('print-slot-source') || 'ORBITAL REPORT';
        slot.title = getVal('print-slot-title') || slot.title;
        slot.subtitle = getVal('print-slot-subtitle');
        slot.body = getVal('print-slot-body');
        slot.imageUrl = getVal('print-slot-img');
        slot.fontSizePt = parseFloat(getVal('print-slot-fontsize')) || 9.5;
        const imgH = parseInt(getVal('print-slot-img-height'), 10);
        if (!isNaN(imgH)) slot.imgHeightMm = imgH;
        slot.imgFit = getVal('print-slot-img-fit') || 'cover';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
    },

    modalConfigurePrintAd(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        if (!page.adSlot) {
            page.adSlot = { id: `ad-p${page.pageNumber}`, label: `Faldón Publicitario Pág. ${page.pageNumber}`, coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '', adHeightMm: 18, adLayout: 'card' };
        }
        const ad = page.adSlot;

        const companies = state.data?.companies || {};
        const pendingAds = this.getPendingPrintAdRequests();
        const coOptions = Object.keys(companies).map(cid => {
            const co = companies[cid];
            const req = pendingAds.find(r => r.coId === cid);
            const tag = req ? (req.status === 'VALIDADO_CEO' ? ' 🌟 [DOC_12 PENDIENTE APROBAR]' : ' ✓ [DOC_12 APROBADA]') : '';
            return `<option value="${this.escapeAttr(cid)}" ${ad.coId === cid ? 'selected' : ''}>${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup || 'A')}]${tag}</option>`;
        }).join('');

        const savedAds = Array.isArray(state.data?.printAdLibrary) ? state.data.printAdLibrary : [];
        const curReq = ad.coId ? pendingAds.find(r => r.coId === ad.coId) : null;
        const html = `
            <div class="space-y-3 text-xs font-sans">
                ${savedAds.length > 0 ? `
                    <div class="p-2.5 bg-amber-950/30 border border-amber-400/50 rounded space-y-1.5">
                        <label for="print-ad-lib-pick" class="text-[11px] text-amber-300 font-bold uppercase block font-mono">📂 Reutilizar Anuncio Guardado (${savedAds.length} en biblioteca)</label>
                        <select id="print-ad-lib-pick" onchange="ui.applySavedAdFromLibrary(this.value)" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                            <option value="">-- Elegir anuncio guardado de ediciones anteriores --</option>
                            ${savedAds.map(sa => `<option value="${this.escapeAttr(sa.id)}">${this.escapeHTML(sa.companyName || sa.slogan || 'Anuncio')}${sa.classGroup ? ` [${this.escapeHTML(sa.classGroup)}]` : ''} (${Number(sa.adHeightMm || 18)} mm)</option>`).join('')}
                        </select>
                    </div>
                ` : ''}
                <div>
                    <label for="print-ad-company" class="text-xs text-amber-300 font-bold uppercase block mb-1 font-mono">Startup Anunciante (Página ${page.pageNumber})</label>
                    <select id="print-ad-company" onchange="ui.onSelectPrintAdCompany(this.value)" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-xs text-white">
                        <option value="">-- Hueco Publicitario Disponible (Sin Anunciante) --</option>
                        ${coOptions}
                    </select>
                </div>

                <div id="print-ad-doc12-box" class="${curReq ? '' : 'hidden'} p-2.5 bg-emerald-950/40 border border-emerald-500/50 rounded space-y-1.5">
                    <span class="text-emerald-300 font-bold uppercase block text-[11px]">🌟 Solicitud DOC_12 Vinculada (${this.escapeHTML(curReq?.packageName || '')})</span>
                    ${curReq?.driveUrl ? `<a href="${encodeURI(curReq.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-cyan-300 underline font-mono text-[11px] block">📄 Abrir Creatividad DOC_12 en Google Drive ↗</a>` : ''}
                    <input type="hidden" id="print-ad-camp-id" value="${this.escapeAttr(curReq?.campId || ad.campId || '')}">
                    <input type="hidden" id="print-ad-act-id" value="${this.escapeAttr(curReq?.actId || ad.actId || '')}">
                </div>

                <div>
                    <label for="print-ad-slogan" class="text-[11px] text-slate-300 font-bold uppercase block mb-1">Eslogan / Titular del Anuncio</label>
                    <input type="text" id="print-ad-slogan" value="${this.escapeAttr(ad.slogan || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                </div>
                <div>
                    <label for="print-ad-text" class="text-[11px] text-slate-300 font-bold uppercase block mb-1">Texto Publicitario (Opcional)</label>
                    <textarea id="print-ad-text" rows="2" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white">${this.escapeHTML(ad.bodyText || '')}</textarea>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                        <label for="print-ad-height" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Alto Máx. Anuncio</label>
                        <select id="print-ad-height" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                            ${(() => {
                                const presets = [
                                    { mm: 14, label: '14 mm (Compacto)' },
                                    { mm: 18, label: '18 mm (Estándar)' },
                                    { mm: 24, label: '24 mm (Mediano)' },
                                    { mm: 32, label: '32 mm (Grande)' },
                                    { mm: 42, label: '42 mm (Destacado)' },
                                    { mm: 55, label: '55 mm (Faldón XL)' },
                                    { mm: 70, label: '70 mm (Cuarto pág.)' },
                                    { mm: 90, label: '90 mm (Media pág.)' },
                                    { mm: 110, label: '110 mm (Gran formato)' },
                                    { mm: 130, label: '130 mm (Cartel A4)' },
                                    { mm: 150, label: '150 mm (Gigante)' }
                                ];
                                const curH = Number(ad.adHeightMm || 18);
                                if (!presets.some(o => o.mm === curH)) {
                                    presets.push({ mm: curH, label: `${curH} mm (Personalizado)` });
                                    presets.sort((a, b) => a.mm - b.mm);
                                }
                                return presets.map(o => `<option value="${o.mm}" ${curH === o.mm ? 'selected' : ''}>${o.label}</option>`).join('');
                            })()}
                        </select>
                    </div>
                    <div>
                        <label for="print-ad-layout" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Diseño del Anuncio</label>
                        <select id="print-ad-layout" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                            <option value="card" ${(ad.adLayout || 'card') === 'card' ? 'selected' : ''}>Logo cuadrado + Texto</option>
                            <option value="banner" ${ad.adLayout === 'banner' ? 'selected' : ''}>Banner imagen ancho completo</option>
                        </select>
                    </div>
                    <div>
                        <label for="print-ad-fit" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Encuadre Imagen</label>
                        <select id="print-ad-fit" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                            <option value="contain" ${(ad.adFit || 'contain') === 'contain' ? 'selected' : ''}>Completa (Ancho hasta 192 mm)</option>
                            <option value="cover" ${ad.adFit === 'cover' ? 'selected' : ''}>Rellenar caja (Cover)</option>
                        </select>
                    </div>
                </div>

                <div class="p-2.5 bg-black/50 border border-slate-800 rounded space-y-2">
                    <label class="text-[11px] text-amber-300 font-bold uppercase block font-mono">🖼️ Subir Foto / Creatividad del Anuncio (Opcional)</label>
                    <p class="text-[11px] text-cyan-300 font-mono bg-cyan-950/35 border border-cyan-500/30 px-2 py-1 rounded">
                        📐 Papel A3: ancho completo hasta <strong>192 mm</strong> y alto hasta <strong>160 mm</strong> · Subida en alta definición (hasta 1600 px).
                    </p>
                    <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'print-ad-img-data', 'print-ad-img-preview', 'print-ad-img-url', { maxDim: 1600, quality: 0.92, keepOriginalUnderBytes: 420 * 1024 })" class="w-full text-xs text-slate-300 file:mr-2 file:py-1.5 file:px-3 file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-400 file:text-black cursor-pointer">
                    <input type="url" id="print-ad-img-url" value="${(ad.imageUrl && /^https?:\/\//i.test(ad.imageUrl)) ? this.escapeAttr(ad.imageUrl) : ''}" oninput="const h=document.getElementById('print-ad-img-data'); if(h) h.value=''; ui.previewNanoBananaUrl(this.value, 'print-ad-img-preview')" placeholder="O pega URL de imagen / Google Drive..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                    <input type="hidden" id="print-ad-img-data" value="${this.escapeAttr(ad.imageUrl || '')}">
                    <div id="print-ad-img-preview" class="${ad.imageUrl ? '' : 'hidden'}">
                        ${ad.imageUrl ? `<img src="${this.escapeAttr(this.resolvePrintImageUrl(ad.imageUrl, false))}" alt="Vista previa anuncio" class="max-h-36 w-full object-contain border border-amber-400/50 bg-white p-1">` : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            ${ad.companyName ? `<button type="button" onclick="ui.clearPrintAdSlot(${pageIdx})" class="min-h-[44px] px-4 py-2 bg-red-900/70 border border-red-400 text-red-200 hover:bg-red-700 hover:text-white text-xs font-bold uppercase">🗑️ Quitar Anuncio</button>` : ''}
            <button type="button" onclick="ui.savePrintAdSlot(${pageIdx}, false)" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Anuncio</button>
            <button type="button" onclick="ui.savePrintAdSlot(${pageIdx}, true)" class="min-h-[44px] px-4 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white">✅ Guardar y Aprobar Acción DOC_12</button>
        `;
        this.showModal(`📢 Configurar Publicidad // Página ${page.pageNumber}`, html, actions);
    },

    onSelectPrintAdCompany(cid) {
        const co = state.data?.companies?.[cid];
        const sloganEl = document.getElementById('print-ad-slogan');
        const textEl = document.getElementById('print-ad-text');
        const imgEl = document.getElementById('print-ad-img-data');
        const doc12Box = document.getElementById('print-ad-doc12-box');
        if (!co) {
            if (sloganEl) sloganEl.value = '';
            if (textEl) textEl.value = '';
            if (imgEl) imgEl.value = '';
            if (doc12Box) doc12Box.classList.add('hidden');
            return;
        }
        if (sloganEl) sloganEl.value = co.slogan || `${co.name} — Innovación Aeroespacial`;
        if (textEl) textEl.value = `Startup oficial de Clase ${co.classGroup || 'A'} • Programa MARS-KET 2.0.`;
        if (imgEl && !imgEl.value && co.logo) {
            imgEl.value = this.resolvePrintImageUrl(co.logo, false);
        }
        const req = this.getPendingPrintAdRequests().find(r => r.coId === cid);
        if (doc12Box) {
            if (req) {
                doc12Box.classList.remove('hidden');
                const campEl = document.getElementById('print-ad-camp-id');
                const actEl = document.getElementById('print-ad-act-id');
                if (campEl) campEl.value = req.campId;
                if (actEl) actEl.value = req.actId;
            } else {
                doc12Box.classList.add('hidden');
            }
        }
    },

    saveAdToLibrary(ad) {
        if (!ad) return;
        const hasData = Boolean(ad.companyName || ad.slogan || ad.imageUrl || ad.bodyText);
        if (!hasData) return;
        state.data.printAdLibrary = Array.isArray(state.data.printAdLibrary) ? state.data.printAdLibrary : [];
        const libId = ad.coId ? `AD-CO-${ad.coId}` : `AD-CUSTOM-${String(ad.companyName || ad.slogan || 'ITEM').toUpperCase().replace(/[^A-Z0-9]+/g, '-').slice(0, 32)}`;
        const entry = {
            id: libId,
            coId: ad.coId || '',
            companyName: ad.companyName || 'ESPACIO PATROCINADO',
            classGroup: ad.classGroup || '',
            slogan: ad.slogan || '',
            bodyText: ad.bodyText || '',
            imageUrl: ad.imageUrl || '',
            adHeightMm: Number(ad.adHeightMm || 18),
            adLayout: ad.adLayout || 'card',
            adFit: ad.adFit || 'contain',
            updatedAt: Date.now()
        };
        const idx = state.data.printAdLibrary.findIndex(x => x && String(x.id) === libId);
        if (idx >= 0) state.data.printAdLibrary[idx] = entry;
        else state.data.printAdLibrary.unshift(entry);
    },

    applySavedAdFromLibrary(libId) {
        if (!libId) return;
        const item = (state.data?.printAdLibrary || []).find(x => x && String(x.id) === String(libId));
        if (!item) return;
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v ?? ''; };
        setVal('print-ad-company', item.coId || '');
        setVal('print-ad-slogan', item.slogan || '');
        setVal('print-ad-text', item.bodyText || '');
        const hEl = document.getElementById('print-ad-height');
        if (hEl) {
            const hVal = String(item.adHeightMm || 18);
            if (!Array.from(hEl.options).some(o => o.value === hVal)) {
                const opt = document.createElement('option');
                opt.value = hVal;
                opt.textContent = `${hVal} mm (Personalizado)`;
                hEl.appendChild(opt);
            }
            hEl.value = hVal;
        }
        setVal('print-ad-layout', item.adLayout || 'card');
        setVal('print-ad-fit', item.adFit || 'contain');
        setVal('print-ad-img-data', item.imageUrl || '');
        setVal('print-ad-img-url', (item.imageUrl && /^https?:\/\//i.test(item.imageUrl)) ? item.imageUrl : '');
        const prev = document.getElementById('print-ad-img-preview');
        if (prev) {
            if (item.imageUrl) {
                prev.classList.remove('hidden');
                prev.innerHTML = `<img src="${this.escapeAttr(this.resolvePrintImageUrl(item.imageUrl, false))}" alt="Vista previa anuncio" class="max-h-36 w-full object-contain border border-amber-400/50 bg-white p-1">`;
            } else {
                prev.classList.add('hidden');
                prev.innerHTML = '';
            }
        }
        this.notify("📂 Anuncio cargado desde tu biblioteca.", "info");
    },

    async saveActivePrintEditionDraft() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        if (!ed) return;
        (ed.pages || []).forEach(pg => {
            if (pg?.adSlot && (pg.adSlot.companyName || pg.adSlot.imageUrl || pg.adSlot.slogan)) {
                this.saveAdToLibrary(pg.adSlot);
            }
        });
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') await state.pushToCloud(false);
        this.notify("💾 Borrador de edición y anuncios guardados en la nube.", "success");
    },

    finalizePrintEdition() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        if (!ed) return;
        this.confirmModal(
            "🔒 Guardar Edición Definitiva",
            `¿Confirmas que «${ed.issueLabel}» ya está maquetada y revisada? Se guardará en la nube con todos sus anuncios y quedará marcada como Edición Definitiva lista para imprenta.`,
            async () => {
                (ed.pages || []).forEach(pg => {
                    if (pg?.adSlot && (pg.adSlot.companyName || pg.adSlot.imageUrl || pg.adSlot.slogan)) {
                        this.saveAdToLibrary(pg.adSlot);
                    }
                });
                ed.status = 'FINALIZED';
                ed.finalizedAt = Date.now();
                ed.updatedAt = Date.now();
                state.save();
                if (typeof state.pushToCloud === 'function') await state.pushToCloud(false);
                this.closeModal();
                this.render();
                this.notify("🔒 Edición definitiva guardada y lista para imprimir.", "success");
            }
        );
    },

    reopenPrintEditionDraft() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        if (!ed) return;
        ed.status = 'DRAFT';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
        this.notify("🔓 Edición reabierta como borrador para ajustes.", "info");
    },

    clearPrintAdSlot(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const ad = ed?.pages?.[pageIdx]?.adSlot;
        if (!ad) return;
        ad.coId = '';
        ad.companyName = '';
        ad.classGroup = '';
        ad.slogan = '';
        ad.bodyText = '';
        ad.imageUrl = '';
        ad.campId = '';
        ad.actId = '';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("🗑️ Anuncio retirado de la página.", "info");
    },

    savePrintAdSlot(pageIdx, approveDoc12 = false) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const ad = ed?.pages?.[pageIdx]?.adSlot;
        if (!ad) return;

        const cid = document.getElementById('print-ad-company')?.value || '';
        const co = cid ? state.data?.companies?.[cid] : null;
        const slogan = (document.getElementById('print-ad-slogan')?.value || '').trim();
        const bodyText = (document.getElementById('print-ad-text')?.value || '').trim();
        const imgData = document.getElementById('print-ad-img-data')?.value || '';
        const imgUrl = (document.getElementById('print-ad-img-url')?.value || '').trim();
        const finalImg = imgUrl || imgData || '';
        const hasCustomContent = Boolean(slogan || bodyText || finalImg);

        ad.coId = cid;
        ad.companyName = co ? co.name : (hasCustomContent ? (slogan || 'ESPACIO PATROCINADO') : '');
        ad.classGroup = co ? (co.classGroup || 'A') : (hasCustomContent ? 'AEE' : '');
        ad.slogan = slogan;
        ad.bodyText = bodyText;
        ad.imageUrl = finalImg;
        ad.adHeightMm = parseInt(document.getElementById('print-ad-height')?.value || '18', 10) || 18;
        ad.adLayout = document.getElementById('print-ad-layout')?.value || 'card';
        ad.adFit = document.getElementById('print-ad-fit')?.value || 'contain';
        ad.campId = document.getElementById('print-ad-camp-id')?.value || '';
        ad.actId = document.getElementById('print-ad-act-id')?.value || '';
        ed.updatedAt = Date.now();
        this.saveAdToLibrary(ad);

        if (approveDoc12 && cid && ad.campId && ad.actId) {
            this.approveMktActionByCoordinator(cid, ad.campId, ad.actId);
        } else {
            state.save();
            if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
            this.closeModal();
            this.render();
            this.notify("✅ Hueco publicitario actualizado.", "success");
        }
    },

    togglePrintPageMode(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        if (page.pageNumber === 7) {
            page.pageMode = (page.pageMode === 'who_is_who') ? 'news' : 'who_is_who';
            page.sectionTitle = page.pageMode === 'who_is_who' ? 'DIRECTORIO // QUIÉN ES QUIÉN' : 'ECONOMÍA ESPACIAL, CONTRATOS Y LIDERAZGO';
        } else if (page.pageNumber === 8) {
            page.pageMode = (page.pageMode === 'beyond_rocket') ? 'news' : 'beyond_rocket';
            page.sectionTitle = page.pageMode === 'beyond_rocket' ? 'CONTRAPORTADA // MÁS ALLÁ DEL COHETE' : 'CONTRAPORTADA // MIRADA AL FUTURO';
        }
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
    },

    toggleWhoIsWhoClass(cls) {
        const targetCls = String(cls || '').toUpperCase();
        const chks = [];
        document.querySelectorAll('.wiw-startup-row').forEach(row => {
            if (targetCls === 'ALL' || String(row.dataset.cls || '').toUpperCase() === targetCls) {
                const chk = row.querySelector('.wiw-startup-chk');
                if (chk) chks.push(chk);
            }
        });
        if (chks.length === 0) return;
        const allChecked = chks.every(c => c.checked);
        chks.forEach(c => { c.checked = !allChecked; });
        this.updateWhoIsWhoModalCounts();
    },

    clearWhoIsWhoStartups() {
        document.querySelectorAll('.wiw-startup-chk').forEach(chk => { chk.checked = false; });
        this.updateWhoIsWhoModalCounts();
    },

    toggleWhoIsWhoRealGroup(mode) {
        const m = String(mode || 'ALL').toUpperCase();
        const chks = Array.from(document.querySelectorAll('.wiw-real-chk'));
        chks.forEach(chk => {
            const reg = String(chk.dataset.region || 'INTL').toUpperCase();
            if (m === 'NONE') chk.checked = false;
            else if (m === 'ALL') chk.checked = true;
            else if (m === 'ES') chk.checked = (reg === 'ES');
            else if (m === 'EU') chk.checked = (reg === 'ES' || reg === 'EU');
        });
        this.updateWhoIsWhoModalCounts();
    },

    updateWhoIsWhoModalCounts() {
        const stEl = document.getElementById('wiw-startup-count');
        const rEl = document.getElementById('wiw-real-count');
        if (stEl) stEl.innerText = String(document.querySelectorAll('.wiw-startup-chk:checked').length);
        if (rEl) rEl.innerText = String(document.querySelectorAll('.wiw-real-chk:checked').length);
    },

    modalConfigureWhoIsWho(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        const cfg = page.whoIsWhoConfig || { realIds: ['real-spacex', 'real-pld', 'real-blue', 'real-rocketlab'], startups: [] };
        const selectedRealSet = new Set(Array.isArray(cfg.realIds) ? cfg.realIds : []);
        const startupProtoMap = new Map((Array.isArray(cfg.startups) ? cfg.startups : []).map(s => [String(s.coId), s.prototypeName || '']));

        const realList = this.getWhoIsWhoRealPresets();
        const companiesDict = state.data?.companies || {};
        const companies = Object.keys(companiesDict)
            .filter(cid => cid && cid !== 'vip_reader' && companiesDict[cid] && typeof companiesDict[cid] === 'object')
            .map(cid => ({ ...companiesDict[cid], _keyId: cid }))
            .sort((a, b) => String(a.classGroup || 'A').localeCompare(String(b.classGroup || 'A')) || String(a.name || '').localeCompare(String(b.name || '')));

        const presentClasses = ['A', 'B', 'C', 'D', 'E', 'F', 'TEST'].filter(cls =>
            companies.some(c => String(c.classGroup || 'A').toUpperCase() === cls)
        );
        const initStartupSelCount = companies.filter(c => startupProtoMap.has(String(c._keyId))).length;
        const initRealSelCount = realList.filter(r => selectedRealSet.has(r.id)).length;

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <p class="text-[11px] text-slate-300">Selecciona empresas aeroespaciales reales y Startups Navarras para la Página 7 impresa. <strong>Nota:</strong> la clase solo se muestra aquí para ayudarte a marcar rápido por aula; en el periódico impreso nunca aparecen clases (<code class="text-amber-300">NAVARRA</code>).</p>

                <div class="space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="text-xs font-mono font-bold text-amber-300 uppercase">🚀 Apartado Startups Navarras (<span id="wiw-startup-count">${initStartupSelCount}</span> / ${companies.length} seleccionadas)</h4>
                        <select aria-label="Filtrar startups por clase" onchange="document.querySelectorAll('.wiw-startup-row').forEach(r => { r.style.display = (this.value === 'ALL' || r.dataset.cls === this.value) ? '' : 'none'; })" class="min-h-[36px] bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white font-mono">
                            <option value="ALL">Todas las clases</option>
                            <option value="A">Clase A</option><option value="B">Clase B</option><option value="C">Clase C</option>
                            <option value="D">Clase D</option><option value="E">Clase E</option><option value="F">Clase F</option>
                            <option value="TEST">Clase TEST</option>
                        </select>
                    </div>
                    ${companies.length > 0 ? `
                        <div class="flex flex-wrap items-center gap-1.5">
                            ${presentClasses.map(cls => `
                                <button type="button" onclick="ui.toggleWhoIsWhoClass('${cls}')" class="min-h-[36px] px-2.5 py-1 bg-amber-400/15 border border-amber-400/60 text-amber-200 hover:bg-amber-400 hover:text-black text-[11px] font-mono font-bold uppercase transition-colors">
                                    ☑️ Toda ${this.escapeHTML(cls)}
                                </button>
                            `).join('')}
                            <button type="button" onclick="ui.toggleWhoIsWhoClass('ALL')" class="min-h-[36px] px-2.5 py-1 bg-slate-800 border border-slate-600 text-white hover:bg-white hover:text-black text-[11px] font-mono font-bold uppercase">☑️ Todas</button>
                            <button type="button" onclick="ui.clearWhoIsWhoStartups()" class="min-h-[36px] px-2.5 py-1 bg-slate-900 border border-red-500/60 text-red-300 hover:bg-red-600 hover:text-white text-[11px] font-mono font-bold uppercase">☐ Ninguna</button>
                        </div>
                    ` : ''}
                    <div class="max-h-56 overflow-y-auto border border-slate-700 bg-slate-900/70 divide-y divide-slate-800 p-2 space-y-1.5">
                        ${companies.length === 0 ? `<p class="text-slate-400 italic p-2">No hay empresas registradas en el estado actual.</p>` : companies.map(c => {
                            const cid = String(c._keyId);
                            const cls = String(c.classGroup || 'A').toUpperCase();
                            const checked = startupProtoMap.has(cid);
                            const protoVal = startupProtoMap.get(cid) || '';
                            return `
                            <div class="wiw-startup-row pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center gap-2" data-cls="${this.escapeAttr(cls)}" data-cid="${this.escapeAttr(cid)}">
                                <label class="flex items-center gap-2 min-w-[200px] cursor-pointer text-white font-bold select-none">
                                    <input type="checkbox" onchange="ui.updateWhoIsWhoModalCounts()" class="wiw-startup-chk w-5 h-5 accent-amber-400 cursor-pointer shrink-0" value="${this.escapeAttr(cid)}" ${checked ? 'checked' : ''}>
                                    <span>${this.escapeHTML(c.name || cid)} <span class="text-[10px] text-mars-cyan font-mono">(${this.escapeHTML(cls)})</span></span>
                                </label>
                                <input type="text" class="wiw-proto-input flex-1 min-h-[38px] bg-black border border-slate-700 px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400" value="${this.escapeAttr(protoVal)}" placeholder="Prototipo (opcional; vacío = usa eslogan)">
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="text-xs font-mono font-bold text-mars-cyan uppercase">🛰️ Empresas y Agencias Reales (<span id="wiw-real-count">${initRealSelCount}</span> / ${realList.length})</h4>
                        <div class="flex flex-wrap gap-1.5">
                            <button type="button" onclick="ui.toggleWhoIsWhoRealGroup('ES')" class="min-h-[34px] px-2 py-1 bg-slate-800 border border-slate-600 text-white hover:border-mars-cyan text-[10px] font-mono font-bold uppercase">🇪🇸 Españolas</button>
                            <button type="button" onclick="ui.toggleWhoIsWhoRealGroup('EU')" class="min-h-[34px] px-2 py-1 bg-slate-800 border border-slate-600 text-white hover:border-mars-cyan text-[10px] font-mono font-bold uppercase">🇪🇺 Europeas</button>
                            <button type="button" onclick="ui.toggleWhoIsWhoRealGroup('ALL')" class="min-h-[34px] px-2 py-1 bg-slate-800 border border-slate-600 text-white hover:border-mars-cyan text-[10px] font-mono font-bold uppercase">🌍 Todas</button>
                            <button type="button" onclick="ui.toggleWhoIsWhoRealGroup('NONE')" class="min-h-[34px] px-2 py-1 bg-slate-900 border border-red-500/60 text-red-300 hover:bg-red-600 hover:text-white text-[10px] font-mono font-bold uppercase">☐ Ninguna</button>
                        </div>
                    </div>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto border border-slate-700 bg-slate-900/70 p-2">
                        ${realList.map(r => `
                            <label class="flex items-center gap-2 p-1.5 rounded hover:bg-slate-800/70 cursor-pointer">
                                <input type="checkbox" onchange="ui.updateWhoIsWhoModalCounts()" data-region="${this.escapeAttr(r.region || 'INTL')}" class="wiw-real-chk w-4 h-4 accent-mars-cyan shrink-0" value="${this.escapeAttr(r.id)}" ${selectedRealSet.has(r.id) ? 'checked' : ''}>
                                ${typeof this.renderBrandLogoBadge === 'function' ? this.renderBrandLogoBadge(r, true) : ''}
                                <span class="min-w-0"><strong class="text-white block truncate">${this.escapeHTML(r.name)}</strong><span class="text-slate-400 text-[10px] font-mono">${this.escapeHTML(r.country)}</span></span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.saveWhoIsWhoConfig(${pageIdx})" class="min-h-[44px] px-5 py-2 bg-amber-400 text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Quién es quién</button>
        `;
        this.showModal("🌍 Configurar «Quién es quién» (Pág. 7)", html, actions, 'max-w-3xl');
    },

    saveWhoIsWhoConfig(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;

        const realIds = Array.from(document.querySelectorAll('.wiw-real-chk:checked')).map(el => el.value);
        const startups = [];
        document.querySelectorAll('.wiw-startup-row').forEach(row => {
            const chk = row.querySelector('.wiw-startup-chk');
            if (!chk || !chk.checked) return;
            const cid = row.dataset.cid || chk.value;
            const protoInput = row.querySelector('.wiw-proto-input');
            const prototypeName = (protoInput?.value || '').trim();
            startups.push({ coId: cid, prototypeName });
        });

        page.whoIsWhoConfig = { realIds, startups };
        page.pageMode = 'who_is_who';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify(`✅ «Quién es quién» actualizado (${realIds.length} reales + ${startups.length} Startups Navarras).`, "success");
    },

    translateLaunchLibraryItemToEs(item) {
        const statusMap = {
            'Go for Launch': 'Confirmado',
            'To Be Confirmed': 'Por confirmar',
            'To Be Determined': 'Por determinar',
            'Launch Successful': 'Lanzamiento exitoso',
            'Launch Failure': 'Anomalía en vuelo',
            'In Flight': 'En vuelo',
            'Hold': 'En pausa'
        };
        const rawStatus = item?.status?.name || 'To Be Confirmed';
        const statusEs = statusMap[rawStatus] || rawStatus;
        const netDate = item?.net ? new Date(item.net).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Fecha por confirmar';
        const provider = item?.launch_service_provider?.name || 'Operador espacial';
        const missionName = item?.name || 'Misión orbital';
        const orbitName = item?.mission?.orbit?.name || '';
        const orbitEs = orbitName
            ? orbitName
                .replace(/Low Earth Orbit/gi, 'Órbita Baja Terrestre (LEO)')
                .replace(/Sun-Synchronous Orbit/gi, 'Órbita Heliosíncrona (SSO)')
                .replace(/Geostationary Transfer Orbit/gi, 'Órbita de Transferencia Geoestacionaria (GTO)')
                .replace(/Lunar/gi, 'Lunar')
            : 'Órbita asignada';
        const padLoc = item?.pad?.location?.name || '';
        return {
            name: missionName,
            provider,
            dateEs: netDate,
            statusEs,
            descEs: `${provider} · ${orbitEs}${padLoc ? ' · ' + padLoc : ''}.`
        };
    },

    async syncLaunchLibrary2ForPrint(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;

        this.notify("🛰️ Consultando próximos lanzamientos en Launch Library 2...", "info");
        try {
            const res = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6&mode=list');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            const results = Array.isArray(data?.results) ? data.results : [];
            if (results.length === 0) throw new Error('Sin resultados');
            page.beyondRocketConfig = page.beyondRocketConfig || {
                subtitle: 'Satélites, logística orbital, exploración, aviación y próximos lanzamientos.',
                directoryItems: this.getBeyondRocketDefaultDirectory(),
                ll2Launches: [],
                ll2SyncedAt: 0
            };
            page.beyondRocketConfig.ll2Launches = results.slice(0, 4).map(it => this.translateLaunchLibraryItemToEs(it));
            page.beyondRocketConfig.ll2SyncedAt = Date.now();
            page.pageMode = 'beyond_rocket';
            ed.updatedAt = Date.now();
            state.save();
            if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
            this.render();
            this.notify(`✅ Sincronizados y traducidos ${page.beyondRocketConfig.ll2Launches.length} lanzamientos reales (LL2).`, "success");
        } catch (err) {
            this.notify(`⚠️ No se pudo sincronizar Launch Library 2 (${err.message}). Se mantiene el directorio local.`, "warning");
        }
    },

    modalEditBeyondRocketDirectory(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        const cfg = page.beyondRocketConfig || {
            subtitle: 'Satélites, logística orbital, exploración, aviación y próximos lanzamientos.',
            directoryItems: this.getBeyondRocketDefaultDirectory(),
            ll2Launches: []
        };
        const itemsText = (cfg.directoryItems || []).map(it => `${it.cat} | ${it.name} | ${it.desc}`).join('\n');
        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div>
                    <label for="br-subtitle" class="text-xs text-amber-300 font-bold uppercase block mb-1 font-mono">Subtítulo de «Más allá del cohete»</label>
                    <input type="text" id="br-subtitle" value="${this.escapeAttr(cfg.subtitle || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                </div>
                <div>
                    <label for="br-items-raw" class="text-xs text-mars-cyan font-bold uppercase block mb-1 font-mono">Fichas del Directorio (1 por línea: CATEGORÍA | Nombre · País | Descripción)</label>
                    <textarea id="br-items-raw" rows="10" class="w-full bg-slate-900 border border-slate-700 p-2.5 text-[11px] font-mono text-white outline-none">${this.escapeHTML(itemsText)}</textarea>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.saveBeyondRocketDirectory(${pageIdx})" class="min-h-[44px] px-5 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Directorio</button>
        `;
        this.showModal("🛰️ Editar «Más allá del cohete» (Pág. 8)", html, actions);
    },

    saveBeyondRocketDirectory(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        const subtitle = (document.getElementById('br-subtitle')?.value || '').trim();
        const rawLines = (document.getElementById('br-items-raw')?.value || '').split('\n').map(l => l.trim()).filter(Boolean);
        const items = rawLines.map(line => {
            const parts = line.split('|').map(p => p.trim());
            return {
                cat: parts[0] || 'SECTOR ESPACIAL',
                name: parts[1] || 'Entidad',
                desc: parts[2] || ''
            };
        });
        page.beyondRocketConfig = page.beyondRocketConfig || {};
        page.beyondRocketConfig.subtitle = subtitle || 'Satélites, logística orbital, exploración, aviación y próximos lanzamientos.';
        page.beyondRocketConfig.directoryItems = items.length > 0 ? items : this.getBeyondRocketDefaultDirectory();
        page.pageMode = 'beyond_rocket';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify("✅ Directorio de Pág. 8 actualizado.", "success");
    },

    generateQrSvg(text, sizePx = 76) {
        // Codificador QR autónomo Vanilla JS (Versión 2-L / 3-L / 4-L Byte Mode en SVG vectorial)
        const bytes = Array.from(new TextEncoder().encode(String(text || 'https://marsket.es')));
        // Elegir versión mínima capaz en ECC-L: V2 (32 bytes), V3 (53 bytes), V4 (78 bytes)
        let ver = 2, dataCap = 34, ecLen = 10;
        if (bytes.length + 2 > 34) { ver = 3; dataCap = 55; ecLen = 15; }
        if (bytes.length + 2 > 55) { ver = 4; dataCap = 80; ecLen = 20; }
        const size = ver * 4 + 17;

        // GF(256) para Reed-Solomon
        const EXP = new Uint8Array(512), LOG = new Uint8Array(256);
        let x = 1;
        for (let i = 0; i < 255; i++) {
            EXP[i] = x; LOG[x] = i;
            x <<= 1; if (x & 256) x ^= 0x11d;
        }
        for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
        const gfMul = (a, b) => (a === 0 || b === 0) ? 0 : EXP[LOG[a] + LOG[b]];
        const rsGen = (deg) => {
            let poly = [1];
            for (let i = 0; i < deg; i++) {
                const next = new Array(poly.length + 1).fill(0);
                for (let j = 0; j < poly.length; j++) {
                    next[j] ^= poly[j];
                    next[j + 1] ^= gfMul(poly[j], EXP[i]);
                }
                poly = next;
            }
            return poly;
        };
        const rsEncode = (data, deg) => {
            const gen = rsGen(deg);
            const res = [...data, ...new Array(deg).fill(0)];
            for (let i = 0; i < data.length; i++) {
                const factor = res[i];
                if (factor !== 0) {
                    for (let j = 0; j < gen.length; j++) res[i + j] ^= gfMul(gen[j], factor);
                }
            }
            return res.slice(data.length);
        };

        // Empaquetado de bits (Modo Byte 0100 + longitud 8 bits + payload + terminador + padding)
        const bits = [];
        const pushBits = (val, len) => { for (let i = len - 1; i >= 0; i--) bits.push((val >> i) & 1); };
        pushBits(0b0100, 4);
        pushBits(Math.min(bytes.length, dataCap - 2), 8);
        bytes.slice(0, dataCap - 2).forEach(b => pushBits(b, 8));
        for (let i = 0; i < 4 && bits.length < dataCap * 8; i++) bits.push(0);
        while (bits.length % 8 !== 0) bits.push(0);
        const codewords = [];
        for (let i = 0; i < bits.length; i += 8) {
            let b = 0; for (let j = 0; j < 8; j++) b = (b << 1) | bits[i + j];
            codewords.push(b);
        }
        const padBytes = [0xec, 0x11];
        for (let i = 0; codewords.length < dataCap; i++) codewords.push(padBytes[i % 2]);
        const fullCodewords = [...codewords, ...rsEncode(codewords, ecLen)];

        // Matriz QR (null = libre)
        const mat = Array.from({ length: size }, () => new Array(size).fill(null));
        const resv = Array.from({ length: size }, () => new Array(size).fill(false));
        const setMod = (r, c, v) => { if (r >= 0 && r < size && c >= 0 && c < size) { mat[r][c] = v ? 1 : 0; resv[r][c] = true; } };
        const drawFinder = (r0, c0) => {
            for (let dr = -1; dr <= 7; dr++) for (let dc = -1; dc <= 7; dc++) {
                const inBox = dr >= 0 && dr <= 6 && dc >= 0 && dc <= 6;
                const dark = inBox && (dr === 0 || dr === 6 || dc === 0 || dc === 6 || (dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4));
                setMod(r0 + dr, c0 + dc, dark);
            }
        };
        drawFinder(0, 0); drawFinder(0, size - 7); drawFinder(size - 7, 0);
        // Alignment pattern (en V2..V4 hay 1 en [size-7, size-7])
        const ap = size - 7;
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
            setMod(ap + dr, ap + dc, Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0));
        }
        // Timing + dark module
        for (let i = 8; i < size - 8; i++) { setMod(6, i, i % 2 === 0); setMod(i, 6, i % 2 === 0); }
        setMod(size - 8, 8, 1);
        // Reservar formato
        for (let i = 0; i < 9; i++) {
            if (i !== 6) { resv[8][i] = true; resv[i][8] = true; }
            if (i < 8) { resv[8][size - 1 - i] = true; resv[size - 1 - i][8] = true; }
        }

        // Colocar bits en zigzag con máscara 0 ((r + c) % 2 === 0)
        const allBits = [];
        fullCodewords.forEach(cw => { for (let i = 7; i >= 0; i--) allBits.push((cw >> i) & 1); });
        let bIdx = 0, dir = -1;
        for (let col = size - 1; col > 0; col -= 2) {
            if (col === 6) col--;
            for (let step = 0; step < size; step++) {
                const r = dir === -1 ? (size - 1 - step) : step;
                for (let dc = 0; dc < 2; dc++) {
                    const c = col - dc;
                    if (!resv[r][c]) {
                        const bit = bIdx < allBits.length ? allBits[bIdx++] : 0;
                        mat[r][c] = ((r + c) % 2 === 0) ? (bit ^ 1) : bit;
                    }
                }
            }
            dir *= -1;
        }

        // Info de formato para ECC-L (01) + Máscara 0 (000) -> 15 bits = 0x77c4 (111011111000100)
        const fmtBits = [1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0];
        const fCoords1 = [[8,0],[8,1],[8,2],[8,3],[8,4],[8,5],[8,7],[8,8],[7,8],[5,8],[4,8],[3,8],[2,8],[1,8],[0,8]];
        const fCoords2 = [[size-1,8],[size-2,8],[size-3,8],[size-4,8],[size-5,8],[size-6,8],[size-7,8],[8,size-8],[8,size-7],[8,size-6],[8,size-5],[8,size-4],[8,size-3],[8,size-2],[8,size-1]];
        fmtBits.forEach((b, i) => {
            mat[fCoords1[i][0]][fCoords1[i][1]] = b;
            mat[fCoords2[i][0]][fCoords2[i][1]] = b;
        });

        let rects = '';
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (mat[r][c] === 1) rects += `<rect x="${c + 2}" y="${r + 2}" width="1" height="1" fill="#111111"/>`;
            }
        }
        const vb = size + 4;
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vb} ${vb}" width="${sizePx}" height="${sizePx}" shape-rendering="crispEdges" class="bg-white border border-stone-300 shrink-0">${rects}</svg>`;
    },

    async fetchWireForPrintPicker(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        if (typeof this.fetchSpaceflightWire === 'function') {
            await this.fetchSpaceflightWire(true);
        }
        this.modalPickPrintSlotNews(pageIdx, slotIdx);
    },

    filterPrintPickerSection(sec) {
        this.printPickerSectionFilter = sec || 'ALL';
        const activeSec = this.printPickerSectionFilter;
        document.querySelectorAll('.print-pick-tab').forEach(btn => {
            const isSel = btn.dataset.sec === activeSec;
            btn.className = isSel
                ? 'print-pick-tab min-h-[38px] px-2.5 py-1 bg-amber-400 text-black font-black text-[11px] font-mono uppercase border border-amber-400'
                : 'print-pick-tab min-h-[38px] px-2.5 py-1 bg-slate-900 text-slate-300 hover:border-white text-[11px] font-mono font-bold uppercase border border-slate-700';
        });
        let shown = 0;
        document.querySelectorAll('.print-pick-news-row').forEach(row => {
            const match = activeSec === 'ALL' || row.dataset.sec === activeSec;
            row.style.display = match ? '' : 'none';
            if (match) shown += 1;
        });
        const emptyEl = document.getElementById('print-pick-empty-sec');
        if (emptyEl) emptyEl.classList.toggle('hidden', shown > 0);
    },

    modalPickPrintSlotNews(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;

        const savedNews = Array.isArray(state.data?.news) ? state.data.news : [];
        const wireNews = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];
        const activeSec = this.printPickerSectionFilter || 'ALL';
        const secCounts = {
            ALL: savedNews.length,
            actualidad: savedNews.filter(n => n && (n.section || 'actualidad') === 'actualidad').length,
            historia: savedNews.filter(n => n && n.section === 'historia').length,
            inventos: savedNews.filter(n => n && n.section === 'inventos').length
        };
        const tabs = [
            { id: 'ALL', label: `Todas (${secCounts.ALL})` },
            { id: 'actualidad', label: `📡 Actualidad (${secCounts.actualidad})` },
            { id: 'historia', label: `🏛️ Un poco de Historia (${secCounts.historia})` },
            { id: 'inventos', label: `🏠 Del Espacio a tu Casa (${secCounts.inventos})` }
        ];
        const visibleCount = savedNews.filter(n => activeSec === 'ALL' || (n && (n.section || 'actualidad') === activeSec)).length;

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <p class="text-[11px] text-slate-300">Selecciona una noticia del periódico digital (incluyendo <strong>Historia</strong> y <strong>Del Espacio a tu Casa</strong> con su imagen) o del teletipo real para aplicarla en la <strong>Página ${page.pageNumber}</strong> (Hueco #${slotIdx + 1}).</p>

                <div class="space-y-2">
                    <h4 class="text-xs font-mono font-bold text-amber-300 uppercase">🏛️ Artículos del Periódico Digital (${savedNews.length})</h4>
                    <div class="flex flex-wrap gap-1.5">
                        ${tabs.map(t => `
                            <button type="button" data-sec="${t.id}" onclick="ui.filterPrintPickerSection('${t.id}')" class="${activeSec === t.id ? 'print-pick-tab min-h-[38px] px-2.5 py-1 bg-amber-400 text-black font-black text-[11px] font-mono uppercase border border-amber-400' : 'print-pick-tab min-h-[38px] px-2.5 py-1 bg-slate-900 text-slate-300 hover:border-white text-[11px] font-mono font-bold uppercase border border-slate-700'}">
                                ${this.escapeHTML(t.label)}
                            </button>
                        `).join('')}
                    </div>
                    <div class="max-h-60 overflow-y-auto border border-slate-700 bg-slate-900/70 divide-y divide-slate-800 p-2 space-y-1.5">
                        ${savedNews.length === 0 ? `<p class="text-slate-400 italic p-2">No hay noticias guardadas todavía.</p>` : savedNews.map((n, i) => {
                            const sec = (n.section === 'historia' || n.section === 'inventos') ? n.section : 'actualidad';
                            const secBadge = sec === 'historia' ? 'HISTORIA' : (sec === 'inventos' ? 'DEL ESPACIO A TU CASA' : 'ACTUALIDAD');
                            const thumb = n.imageUrl ? this.resolvePrintImageUrl(n.imageUrl, false) : '';
                            const hiddenStyle = (activeSec !== 'ALL' && sec !== activeSec) ? 'display:none;' : '';
                            return `
                            <div class="print-pick-news-row pt-1.5 first:pt-0 flex items-center justify-between gap-2.5" data-sec="${sec}" style="${hiddenStyle}">
                                ${thumb ? `<img src="${this.escapeAttr(thumb)}" alt="" class="w-14 h-10 object-cover border border-slate-600 shrink-0 bg-black">` : `<div class="w-14 h-10 border border-slate-700 bg-slate-800 flex items-center justify-center text-[10px] font-mono text-slate-400 shrink-0">SIN IMG</div>`}
                                <div class="min-w-0 flex-1">
                                    <span class="block text-[10px] font-mono text-mars-cyan uppercase truncate">${secBadge} · ${this.escapeHTML(n.category || 'AEE')} · ${this.escapeHTML(n.publishedDate || '')}</span>
                                    <strong class="block text-xs text-white truncate">${this.escapeHTML(n.title || '')}</strong>
                                </div>
                                <button type="button" onclick="ui.applyPickedNewsToPrintSlot(${pageIdx}, ${slotIdx}, 'NEWS', ${i})" class="min-h-[38px] px-3 py-1 bg-amber-400 text-black font-black text-[11px] uppercase hover:bg-white shrink-0">Aplicar</button>
                            </div>
                        `; }).join('')}
                        <p id="print-pick-empty-sec" class="${visibleCount === 0 && savedNews.length > 0 ? '' : 'hidden'} text-slate-400 italic p-2">No hay artículos en esta sección.</p>
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between gap-2">
                        <h4 class="text-xs font-mono font-bold text-mars-cyan uppercase">📡 Noticias Reales Aeroespaciales (${wireNews.length})</h4>
                        <button type="button" onclick="ui.fetchWireForPrintPicker(${pageIdx}, ${slotIdx})" class="min-h-[34px] px-2.5 py-1 bg-slate-800 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black text-[10px] font-mono font-bold uppercase">🔄 Actualizar Teletipo</button>
                    </div>
                    <div class="max-h-52 overflow-y-auto border border-slate-700 bg-slate-900/70 divide-y divide-slate-800 p-2 space-y-1.5">
                        ${wireNews.length === 0 ? `<p class="text-slate-400 italic p-2">Pulsa «🔄 Actualizar Teletipo» para cargar las noticias reales más recientes.</p>` : wireNews.map((w, i) => `
                            <div class="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                                <div class="min-w-0 flex-1">
                                    <span class="block text-[10px] font-mono text-emerald-300 uppercase">Fuente: ${this.escapeHTML(w.news_site || 'Spaceflight News')}</span>
                                    <strong class="block text-xs text-white truncate">${this.escapeHTML(w.titleEs || w.title || '')}</strong>
                                </div>
                                <button type="button" onclick="ui.applyPickedNewsToPrintSlot(${pageIdx}, ${slotIdx}, 'WIRE', ${i})" class="min-h-[38px] px-3 py-1 bg-mars-cyan text-black font-black text-[11px] uppercase hover:bg-white shrink-0">Aplicar</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cerrar</button>`;
        this.showModal(`📰 Elegir Noticia // Página ${page.pageNumber}`, html, actions, 'max-w-3xl');
    },

    async applyPickedNewsToPrintSlot(pageIdx, slotIdx, kind, idx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;
        const defaultMm = (page.pageNumber === 1 && slotIdx === 0) ? 60 : 32;

        if (kind === 'NEWS') {
            const art = (state.data?.news || [])[idx];
            if (!art) return;
            const secFallback = art.section === 'historia'
                ? 'UN POCO DE HISTORIA'
                : (art.section === 'inventos' ? 'DEL ESPACIO A TU CASA' : 'ACTUALIDAD');
            slot.kicker = art.category || secFallback;
            slot.mediaSource = art.sourceName || art.author || 'ORBITAL REPORT';
            slot.title = art.title || slot.title;
            slot.subtitle = art.subtitle || '';
            slot.body = art.body || art.title || '';
            slot.imageUrl = art.imageUrl ? this.resolvePrintImageUrl(art.imageUrl, false) : '';
            if (slot.imageUrl && (slot.imgHeightMm === undefined || slot.imgHeightMm === null || Number(slot.imgHeightMm) <= 0)) {
                slot.imgHeightMm = defaultMm;
            }
        } else if (kind === 'WIRE') {
            const art = (this._snapiWireArticles || [])[idx];
            if (!art) return;
            slot.kicker = 'PRENSA INTERNACIONAL';
            slot.mediaSource = art.news_site || 'Spaceflight News';
            slot.title = art.titleEs || art.title || slot.title;
            slot.subtitle = art.summaryEs || art.summary || '';
            slot.body = art.summaryEs || art.summary || '';
            slot.imageUrl = art.proxy_image_url || (art.image_url ? this.resolvePrintImageUrl(art.image_url, false) : '');
            if (slot.imageUrl && (slot.imgHeightMm === undefined || slot.imgHeightMm === null || Number(slot.imgHeightMm) <= 0)) {
                slot.imgHeightMm = defaultMm;
            }

            if (art.url && /^https?:\/\//i.test(art.url)) {
                this.notify("🌐 Extrayendo artículo completo en castellano...", "info");
                try {
                    const resp = await fetch(`/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(art.title || '')}&summary=${encodeURIComponent(art.summary || '')}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`);
                    if (resp.ok) {
                        const full = await resp.json();
                        slot.title = full.titleEs || slot.title;
                        slot.body = full.bodyEs || full.bodyEn || slot.body;
                        if (full.imageUrl) {
                            slot.imageUrl = full.imageUrl;
                            if (slot.imgHeightMm === undefined || slot.imgHeightMm === null || Number(slot.imgHeightMm) <= 0) {
                                slot.imgHeightMm = defaultMm;
                            }
                        }
                    }
                } catch (e) {}
            }
        }

        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify(`✅ Noticia aplicada a Página ${page.pageNumber}.`, "success");
    },

    formatPrintEditorialText(rawText) {
        const formatInline = (txt) => {
            let safe = this.escapeHTML(txt);
            safe = safe.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
            safe = safe.replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>');
            return safe;
        };
        const lines = String(rawText || '').replace(/\r\n/g, '\n').split('\n');
        const blocks = [];
        let listItems = [];
        const flushList = () => {
            if (listItems.length > 0) {
                blocks.push(`<ul style="list-style:disc;padding-left:4mm;margin:1mm 0;text-align:left;">${listItems.map(it => `<li style="margin:0.4mm 0;">${it}</li>`).join('')}</ul>`);
                listItems = [];
            }
        };
        lines.forEach(line => {
            const trimmed = line.trim();
            if (/^[-•]\s+/.test(trimmed)) {
                listItems.push(formatInline(trimmed.replace(/^[-•]\s+/, '')));
            } else {
                flushList();
                if (trimmed !== '') {
                    blocks.push(`<p style="margin:0 0 1.2mm 0;text-align:justify;">${formatInline(trimmed)}</p>`);
                }
            }
        });
        flushList();
        return blocks.join('');
    },

    addPrintSlot(pageIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page) return;
        page.slots = Array.isArray(page.slots) ? page.slots : [];
        const newIdx = page.slots.length;
        page.slots.push({
            id: `p${page.pageNumber}-slot-${Date.now()}`,
            role: 'article',
            kicker: 'ACTUALIDAD',
            title: 'Nueva Noticia',
            subtitle: '',
            body: 'Pulsa «📰 Elegir Noticia» o «✏️ Editar» para redactar el texto adaptado al tamaño A3.',
            imageUrl: '',
            mediaSource: 'ORBITAL REPORT',
            fontSizePt: 9
        });
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
        this.modalPickPrintSlotNews(pageIdx, newIdx);
    },

    removePrintSlot(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        if (!page || !Array.isArray(page.slots)) return;
        if (page.pageNumber === 1 && page.slots.length <= 1) {
            return this.notify("La Portada debe conservar al menos 1 noticia principal.", "warning");
        }
        page.slots.splice(slotIdx, 1);
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
        this.notify("✕ Noticia quitada de la página.", "info");
    },

    adjustPrintSlotImageHeight(pageIdx, slotIdx, deltaMm) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;
        const cur = (slot.imgHeightMm !== undefined && slot.imgHeightMm !== null)
            ? Number(slot.imgHeightMm)
            : (page.pageNumber === 1 && slotIdx === 0 ? 60 : 30);
        slot.imgHeightMm = Math.max(0, Math.min(90, cur + deltaMm));
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
    },

    adjustPrintAdHeight(pageIdx, deltaMm) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const ad = ed?.pages?.[pageIdx]?.adSlot;
        if (!ad) return;
        const cur = Number(ad.adHeightMm || 18);
        ad.adHeightMm = Math.max(12, Math.min(160, cur + deltaMm));
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.render();
    },

    fitPrintPreviewStages() {
        const zoomMode = this.printStudioZoomMode || 'fit';
        document.querySelectorAll('[data-print-scale-outer]').forEach(outer => {
            const inner = outer.querySelector('[data-print-scale-inner]');
            if (!inner) return;
            const natW = inner.offsetWidth;
            const natH = inner.offsetHeight;
            if (!natW || !natH) return;
            if (zoomMode === 'actual') {
                outer.style.overflowX = 'auto';
                outer.style.height = natH + 'px';
                inner.style.transform = 'none';
                inner.style.transformOrigin = 'top left';
            } else {
                outer.style.overflowX = 'hidden';
                const availW = outer.clientWidth || natW;
                const scale = Math.min(1, availW / natW);
                inner.style.transformOrigin = 'top left';
                inner.style.transform = `scale(${scale.toFixed(4)})`;
                outer.style.height = Math.ceil(natH * scale) + 'px';
            }
        });
    },

    checkPrintPagesOverflow() {
        this.fitPrintPreviewStages();
        document.querySelectorAll('[data-print-page-box]').forEach(box => {
            const pIdx = box.getAttribute('data-print-page-box');
            const badge = document.getElementById(`print-fit-badge-${pIdx}`);
            const inner = box.querySelector('[data-print-page-inner]');
            if (!badge || !inner) return;
            const overflows = box.scrollHeight > (box.clientHeight + 4);
            if (overflows) {
                badge.className = 'text-[10px] font-mono px-2 py-0.5 bg-red-700 text-white font-bold uppercase shrink-0';
                badge.innerText = '⚠️ Excede A3 (recorta)';
            } else {
                badge.className = 'text-[10px] font-mono px-2 py-0.5 bg-emerald-700 text-white font-bold uppercase shrink-0';
                badge.innerText = '✓ Cabe en A3';
            }
        });
    },

    renderPrintPageToolbarHtml(page, pageIdx, compact = false) {
        const isCover = page.pageNumber === 1;
        const isWhoIsWho = page.pageNumber === 7 && (page.pageMode || 'who_is_who') === 'who_is_who';
        const isBeyondRocket = page.pageNumber === 8 && (page.pageMode || 'beyond_rocket') === 'beyond_rocket';
        const showArticleTools = !isCover && !isWhoIsWho && !isBeyondRocket;

        return `
        <div class="flex flex-wrap items-center justify-between gap-2 bg-slate-950/90 border border-slate-700 px-2.5 py-1.5">
            <div class="flex items-center gap-2 min-w-0">
                <span class="text-[11px] font-mono font-bold text-mars-cyan uppercase truncate">${compact ? `Pág. ${page.pageNumber}` : `📄 Página ${page.pageNumber} — ${this.escapeHTML(page.label)}`}</span>
                <span id="print-fit-badge-${pageIdx}" class="text-[10px] font-mono px-2 py-0.5 bg-slate-700 text-white font-bold uppercase shrink-0">Midiendo...</span>
            </div>
            <div class="flex flex-wrap items-center gap-1">
                ${!isCover ? `<button type="button" onclick="ui.modalEditPrintPageSection(${pageIdx})" class="px-2 py-1 bg-slate-800 border border-slate-600 text-slate-200 hover:border-white text-[10px] font-mono font-bold uppercase" title="Editar título de sección">✏️ Sección</button>` : ''}
                ${page.pageNumber === 7 ? `
                    ${isWhoIsWho ? `<button type="button" onclick="ui.modalConfigureWhoIsWho(${pageIdx})" class="px-2 py-1 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-black uppercase">🌍 Elegir Empresas</button>` : ''}
                    <button type="button" onclick="ui.togglePrintPageMode(${pageIdx})" class="px-2 py-1 bg-slate-800 border border-slate-500 text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">${isWhoIsWho ? '📰 Noticias' : '🌍 Quién es quién'}</button>
                ` : ''}
                ${page.pageNumber === 8 ? `
                    ${isBeyondRocket ? `
                        <button type="button" onclick="ui.syncLaunchLibrary2ForPrint(${pageIdx})" class="px-2 py-1 bg-emerald-700 text-white hover:bg-emerald-600 text-[10px] font-mono font-bold uppercase">🛰️ Sync LL2</button>
                        <button type="button" onclick="ui.modalEditBeyondRocketDirectory(${pageIdx})" class="px-2 py-1 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-black uppercase">✏️ Fichas</button>
                    ` : ''}
                    <button type="button" onclick="ui.togglePrintPageMode(${pageIdx})" class="px-2 py-1 bg-slate-800 border border-slate-500 text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">${isBeyondRocket ? '📰 Noticias' : '🚀 Más allá'}</button>
                ` : ''}
                ${showArticleTools ? `<button type="button" onclick="ui.addPrintSlot(${pageIdx})" class="px-2 py-1 bg-emerald-700 text-white hover:bg-emerald-600 text-[10px] font-mono font-bold uppercase">+ Noticia</button>` : ''}
                ${page.adSlot ? `<button type="button" onclick="ui.modalConfigurePrintAd(${pageIdx})" class="px-2 py-1 bg-[#8B0000] text-white hover:bg-red-700 text-[10px] font-mono font-bold uppercase">📢 Anuncio</button>` : ''}
            </div>
        </div>`;
    },

    renderPrintStudioPageHtml(ed, page, pageIdx, forPrint = false) {
        const isCover = page.pageNumber === 1;
        const isWhoIsWho = page.pageNumber === 7 && (page.pageMode || 'who_is_who') === 'who_is_who';
        const isBeyondRocket = page.pageNumber === 8 && (page.pageMode || 'beyond_rocket') === 'beyond_rocket';
        const hasAd = Boolean(page.adSlot && page.adSlot.companyName);
        const monoFont = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
        const sansFont = "ui-sans-serif, system-ui, -apple-system, sans-serif";
        const serifFont = "Georgia, 'Times New Roman', Times, serif";

        let mainContentHtml = '';

        if (isWhoIsWho) {
            const cfg = page.whoIsWhoConfig || { realIds: ['real-spacex', 'real-pld', 'real-blue', 'real-rocketlab'], startups: [] };
            const realMap = new Map(this.getWhoIsWhoRealPresets().map(r => [r.id, r]));
            const companies = state.data?.companies || {};
            const realLogos = state.data?.realCompanyLogos || {};

            const realEntries = (cfg.realIds || []).map(id => {
                const r = realMap.get(id);
                if (!r) return null;
                const rawCustom = String(realLogos[r.id] || '').trim();
                const customLogo = (rawCustom && (/^https?:\/\//i.test(rawCustom) || rawCustom.startsWith('data:image/')))
                    ? this.resolvePrintImageUrl(this.getDirectDriveImageUrl ? this.getDirectDriveImageUrl(rawCustom) : rawCustom, forPrint)
                    : '';
                const favicon = r.domain ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(r.domain)}&sz=64` : '';
                return {
                    name: r.name,
                    country: r.country,
                    desc: r.summary,
                    domain: r.domain || '',
                    logoSrc: customLogo || favicon,
                    monogram: r.monogram || r.name.slice(0, 3).toUpperCase(),
                    accent: r.accentColor || '#0f172a'
                };
            }).filter(Boolean);

            const startupEntries = (cfg.startups || []).map(s => {
                const co = companies[s.coId];
                if (!co) return null;
                const isLogoAllowed = !co.brandStatus || co.brandStatus === 'APROBADO' || co.brandApproval?.status === 'APROBADO';
                const rawCoLogo = (isLogoAllowed && co.logo && (/^https?:\/\//i.test(co.logo) || co.logo.startsWith('data:image/')))
                    ? this.resolvePrintImageUrl(this.getDirectDriveImageUrl ? this.getDirectDriveImageUrl(co.logo) : co.logo, forPrint)
                    : '';
                const protoTxt = String(s.prototypeName || '').trim();
                const descTxt = protoTxt ? `Prototipo: ${protoTxt}` : (co.slogan ? `«${co.slogan}»` : 'Startup aeroespacial escolar');
                const mono = (co.name || 'ST').replace(/[^A-Za-z0-9]/g, '').slice(0, 2).toUpperCase() || 'ST';
                return {
                    name: co.name,
                    desc: descTxt,
                    logoSrc: rawCoLogo,
                    monogram: mono
                };
            }).filter(Boolean);

            const totalEntries = realEntries.length + startupEntries.length;
            const isUltraCompact = totalEntries > 28;
            const isMediumCompact = !isUltraCompact && totalEntries > 16;

            const gridCols = (isUltraCompact || isMediumCompact) ? '1fr 1fr 1fr' : '1fr 1fr';
            const logoMm = isUltraCompact ? '5.2mm' : (isMediumCompact ? '6mm' : '7.2mm');
            const monoPt = isUltraCompact ? '5.2pt' : (isMediumCompact ? '5.6pt' : '6.2pt');
            const titlePt = isUltraCompact ? '6.6pt' : (isMediumCompact ? '7.2pt' : '7.8pt');
            const countryPt = isUltraCompact ? '5.6pt' : (isMediumCompact ? '6pt' : '6.5pt');
            const descPt = isUltraCompact ? '5.7pt' : (isMediumCompact ? '6.2pt' : '6.8pt');
            const domPt = isUltraCompact ? '5.2pt' : (isMediumCompact ? '5.5pt' : '6pt');
            const gapCss = isUltraCompact ? '1mm 2mm' : (isMediumCompact ? '1.2mm 2.4mm' : '1.5mm 3mm');
            const itemPadCss = isUltraCompact ? '0.8mm' : (isMediumCompact ? '1mm' : '1.2mm');
            const hdrPt = isUltraCompact ? '14.5pt' : (isMediumCompact ? '15.5pt' : '17pt');
            const subPt = isUltraCompact ? '7.4pt' : (isMediumCompact ? '7.8pt' : '8.2pt');
            const hdrPb = isUltraCompact ? '1mm' : '1.5mm';
            const outerGap = isUltraCompact ? '1.8mm' : '2.5mm';

            const renderPrintLogoBox = (logoSrc, monogram, accentBg) => `
                <div style="width:${logoMm};height:${logoMm};min-width:${logoMm};border:1px solid #d6d3d1;background:${logoSrc ? '#ffffff' : this.escapeAttr(accentBg)};display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;">
                    ${logoSrc
                        ? `<img src="${this.escapeAttr(logoSrc)}" alt="" style="width:100%;height:100%;object-fit:contain;display:block;" onerror="this.style.display='none';if(this.nextElementSibling)this.nextElementSibling.style.display='flex';"><span style="display:none;width:100%;height:100%;align-items:center;justify-content:center;font-family:${monoFont};font-size:${monoPt};font-weight:900;color:#ffffff;background:${this.escapeAttr(accentBg)};">${this.escapeHTML(monogram)}</span>`
                        : `<span style="font-family:${monoFont};font-size:${monoPt};font-weight:900;color:#ffffff;">${this.escapeHTML(monogram)}</span>`}
                </div>`;

            const realBlockHtml = realEntries.length > 0 ? `
                    <div>
                        <div style="font-family:${monoFont};font-size:7pt;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:#8B0000;border-bottom:1px solid #111111;padding-bottom:0.6mm;margin-bottom:1.2mm;">
                            🛰️ Empresas y Agencias Reales (${realEntries.length})
                        </div>
                        <div style="display:grid;grid-template-columns:${gridCols};gap:${gapCss};">
                            ${realEntries.map(e => `
                                <div style="display:flex;align-items:flex-start;gap:1.4mm;border-bottom:1px solid #e7e5e4;padding-bottom:${itemPadCss};min-width:0;">
                                    ${renderPrintLogoBox(e.logoSrc, e.monogram, e.accent)}
                                    <div style="min-width:0;flex:1;">
                                        <div style="font-family:${serifFont};font-weight:700;font-size:${titlePt};line-height:1.12;color:#111111;">
                                            ${this.escapeHTML(e.name)} <span style="font-family:${monoFont};font-weight:400;font-size:${countryPt};color:#8B0000;">· ${this.escapeHTML(e.country)}</span>
                                        </div>
                                        <div style="font-family:${sansFont};font-size:${descPt};line-height:1.18;color:#44403c;margin-top:0.2mm;">${this.escapeHTML(e.desc)}</div>
                                        ${e.domain ? `<div style="font-family:${monoFont};font-size:${domPt};line-height:1.08;color:#78716c;margin-top:0.2mm;">${this.escapeHTML(e.domain)}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : '';

            const startupBlockHtml = startupEntries.length > 0 ? `
                    <div style="${realEntries.length > 0 ? 'border-top:2px solid #8B0000;padding-top:1.4mm;' : ''}">
                        <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #111111;padding-bottom:0.6mm;margin-bottom:1.2mm;">
                            <span style="font-family:${monoFont};font-size:7pt;font-weight:900;text-transform:uppercase;letter-spacing:0.06em;color:#111111;">🚀 Apartado Startups Navarras (${startupEntries.length})</span>
                            <span style="font-family:${monoFont};font-size:6pt;font-weight:700;color:#8B0000;text-transform:uppercase;">Ecosistema Navarra</span>
                        </div>
                        <div style="display:grid;grid-template-columns:${gridCols};gap:${gapCss};">
                            ${startupEntries.map(s => `
                                <div style="display:flex;align-items:flex-start;gap:1.4mm;border-bottom:1px solid #e7e5e4;padding-bottom:${itemPadCss};min-width:0;">
                                    ${renderPrintLogoBox(s.logoSrc, s.monogram, '#111111')}
                                    <div style="min-width:0;flex:1;">
                                        <div style="font-family:${serifFont};font-weight:700;font-size:${titlePt};line-height:1.12;color:#111111;">
                                            ${this.escapeHTML(s.name)} <span style="font-family:${monoFont};font-weight:400;font-size:${countryPt};color:#8B0000;">· Navarra</span>
                                        </div>
                                        <div style="font-family:${sansFont};font-size:${descPt};line-height:1.18;color:#44403c;margin-top:0.2mm;">${this.escapeHTML(s.desc)}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : '';

            const emptyWhoHtml = (realEntries.length === 0 && startupEntries.length === 0)
                ? `<p style="margin:0;font-size:8pt;font-style:italic;color:#78716c;">Pulsa «🌍 Elegir Empresas» en la barra superior de esta página para seleccionar empresas reales y Startups Navarras.</p>`
                : '';

            mainContentHtml = `
                <div style="display:flex;flex-direction:column;gap:${outerGap};">
                    <div style="border-bottom:1px solid #d6d3d1;padding-bottom:${hdrPb};">
                        <h3 style="margin:0;font-family:${serifFont};font-weight:900;font-size:${hdrPt};line-height:1.08;color:#111111;">Quién es quién en el Sector Aeroespacial</h3>
                        <p style="margin:0.6mm 0 0 0;font-family:${serifFont};font-style:italic;font-size:${subPt};line-height:1.2;color:#44403c;">${realEntries.length} empresas y agencias reales junto al apartado de Startups Navarras (${startupEntries.length} seleccionadas).</p>
                    </div>
                    ${realBlockHtml}
                    ${startupBlockHtml}
                    ${emptyWhoHtml}
                </div>`;
        } else if (isBeyondRocket) {
            const cfg = page.beyondRocketConfig || {
                subtitle: 'Satélites, logística orbital, exploración, aviación y próximos lanzamientos.',
                directoryItems: this.getBeyondRocketDefaultDirectory(),
                ll2Launches: []
            };
            const maxDir = hasAd ? 10 : 16;
            const maxLl2 = hasAd ? 2 : 4;
            const dirItems = (cfg.directoryItems || this.getBeyondRocketDefaultDirectory()).slice(0, maxDir);
            const ll2Items = (cfg.ll2Launches || []).slice(0, maxLl2);
            const qrSvg = this.generateQrSvg(window.location.origin, 58);

            mainContentHtml = `
                <div style="display:flex;flex-direction:column;gap:2mm;">
                    <div style="border-bottom:1px solid #d6d3d1;padding-bottom:1mm;">
                        <h3 style="margin:0;font-family:${serifFont};font-weight:900;font-size:17pt;line-height:1.12;color:#111111;">Más allá del cohete</h3>
                        <p style="margin:0.5mm 0 0 0;font-family:${serifFont};font-style:italic;font-size:8pt;line-height:1.25;color:#44403c;">${this.escapeHTML(cfg.subtitle || '')}</p>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1mm 3mm;">
                        ${dirItems.map(it => `
                            <div style="border-bottom:1px solid #e7e5e4;padding-bottom:0.8mm;">
                                <span style="display:block;font-family:${monoFont};font-size:6.3pt;line-height:1.15;font-weight:700;text-transform:uppercase;color:#0f5132;letter-spacing:0.04em;">${this.escapeHTML(it.cat)}</span>
                                <strong style="display:block;font-family:${serifFont};font-size:7.6pt;line-height:1.15;color:#111111;">${this.escapeHTML(it.name)}</strong>
                                <span style="display:block;font-family:${sansFont};font-size:6.8pt;line-height:1.2;color:#44403c;">${this.escapeHTML(it.desc)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${ll2Items.length > 0 ? `
                        <div style="background:#EFECE4;border-left:2px solid #8B0000;padding:1.5mm;display:flex;flex-direction:column;gap:1mm;">
                            <span style="display:block;font-family:${monoFont};font-size:6.8pt;line-height:1.15;font-weight:900;text-transform:uppercase;color:#8B0000;">🛰️ Agenda de Lanzamientos Reales (Launch Library 2 · ES)</span>
                            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1mm 2.5mm;">
                                ${ll2Items.map(l => `
                                    <div style="font-size:6.8pt;line-height:1.2;font-family:${sansFont};">
                                        <strong style="color:#111111;">${this.escapeHTML(l.name)}</strong>
                                        <span style="display:block;color:#44403c;">${this.escapeHTML(l.dateEs)} · <em>${this.escapeHTML(l.statusEs)}</em></span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div style="background:#ffffff;border:1px solid #111111;padding:1.5mm;display:flex;align-items:center;gap:2.5mm;">
                        ${qrSvg}
                        <div style="min-width:0;flex:1;">
                            <strong style="display:block;font-family:${serifFont};font-size:8.2pt;line-height:1.15;color:#111111;">ORBITAL REPORT en la web</strong>
                            <span style="display:block;font-family:${sansFont};font-size:7pt;line-height:1.25;color:#44403c;">Escanea el QR para leer las noticias del proyecto desde casa.</span>
                            <span style="display:inline-block;margin-top:0.6mm;padding:0.4mm 1.4mm;background:#111111;color:#ffffff;font-family:${monoFont};font-size:6.8pt;line-height:1.2;font-weight:700;text-transform:uppercase;">Acceso Colegio/Familias: VIP-0000 · PIN 0000</span>
                        </div>
                    </div>
                </div>`;
        } else {
            const visibleSlots = isCover ? (page.slots || []).slice(0, 1) : (page.slots || []);
            const slotsHtml = visibleSlots.map((slot, sIdx) => {
                const imgSrc = slot.imageUrl ? this.resolvePrintImageUrl(slot.imageUrl, forPrint) : '';
                const fontPt = Number(slot.fontSizePt || (isCover ? 10 : 9.5));
                const imgHeightMm = (slot.imgHeightMm !== undefined && slot.imgHeightMm !== null) ? Number(slot.imgHeightMm) : (isCover && sIdx === 0 ? 60 : 32);
                const imgFitVal = (slot.imgFit === 'contain') ? 'contain' : 'cover';
                const imgBgStyle = (slot.imgFit === 'contain') ? 'background:#f5f5f4;' : '';
                const editBtn = !forPrint ? `
                    <div style="position:absolute;top:0;right:0;z-index:20;display:flex;align-items:center;gap:2px;flex-wrap:wrap;background:rgba(250,248,245,0.95);border:1px solid #cbd5e1;padding:2px;box-shadow:0 1px 4px rgba(0,0,0,0.12);">
                        ${imgSrc ? `
                            <button type="button" onclick="ui.adjustPrintSlotImageHeight(${pageIdx}, ${sIdx}, -5)" class="px-1.5 py-0.5 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] font-mono font-bold" title="Reducir altura de foto (-5 mm)">🖼️-</button>
                            <button type="button" onclick="ui.adjustPrintSlotImageHeight(${pageIdx}, ${sIdx}, 5)" class="px-1.5 py-0.5 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] font-mono font-bold" title="Aumentar altura de foto (+5 mm)">🖼️+</button>
                        ` : ''}
                        <button type="button" onclick="ui.modalPickPrintSlotNews(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-bold uppercase">📰 Elegir</button>
                        <button type="button" onclick="ui.modalEditPrintSlot(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">✏️ Editar</button>
                        ${(!isCover || (page.slots || []).length > 1) ? `<button type="button" onclick="ui.removePrintSlot(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-[10px] font-mono font-bold uppercase" title="Quitar noticia de esta página">✕</button>` : ''}
                    </div>` : '';
                const borderStyle = sIdx < visibleSlots.length - 1
                    ? 'border-bottom:1px solid #d6d3d1;padding-bottom:2.4mm;margin-bottom:2.4mm;'
                    : 'margin-bottom:0;';
                const h3Style = (isCover && sIdx === 0)
                    ? `margin:0 0 1mm 0;font-family:${serifFont};font-weight:900;color:#111111;font-size:21pt;line-height:1.08;`
                    : `margin:0 0 1mm 0;font-family:${serifFont};font-weight:900;color:#111111;font-size:13pt;line-height:1.14;`;

                return `
                <article style="position:relative;${borderStyle}">
                    ${editBtn}
                    <div style="margin-bottom:0.8mm;">
                        <span style="font-family:${monoFont};font-size:8.5pt;line-height:1.2;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#8B0000;">${this.escapeHTML(slot.kicker || '')}</span>
                    </div>
                    <h3 style="${h3Style}">${this.escapeHTML(slot.title || '')}</h3>
                    ${slot.subtitle ? `<p style="margin:0 0 1.4mm 0;font-family:${serifFont};font-style:italic;font-size:9.5pt;line-height:1.25;color:#44403c;">${this.escapeHTML(slot.subtitle)}</p>` : ''}
                    ${(imgSrc && imgHeightMm > 0) ? `
                        <figure style="margin:0 0 1.4mm 0;">
                            <img src="${this.escapeAttr(imgSrc)}" alt="" style="width:100%;height:${imgHeightMm}mm;object-fit:${imgFitVal};${imgBgStyle}display:block;border:1px solid #d6d3d1;">
                            <figcaption style="font-family:${monoFont};font-size:7.5pt;line-height:1.2;color:#57534e;font-style:italic;margin-top:0.6mm;">Fuente: ${this.escapeHTML(slot.mediaSource || 'ORBITAL REPORT')}</figcaption>
                        </figure>
                    ` : `<p style="margin:0 0 1mm 0;font-family:${monoFont};font-size:7.5pt;line-height:1.2;color:#57534e;">Fuente: ${this.escapeHTML(slot.mediaSource || 'ORBITAL REPORT')}</p>`}
                    <div style="font-family:${serifFont};font-size:${fontPt}pt;line-height:1.38;color:#1f2937;">${this.formatPrintEditorialText(slot.body || '')}</div>
                </article>`;
            }).join('');

            const coverSummaryHtml = isCover ? `
                <div style="margin-top:2.8mm;padding-top:2.2mm;border-top:2px solid #111111;">
                    <div style="font-family:${monoFont};font-size:7.5pt;line-height:1.2;font-weight:900;text-transform:uppercase;letter-spacing:0.08em;color:#8B0000;margin-bottom:1.4mm;">EN ESTE NÚMERO // SUMARIO DE PÁGINAS</div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1mm 3mm;font-size:7.5pt;line-height:1.25;">
                        ${(ed.pages || []).slice(1).map(p => {
                            let summaryTitle = p.label || '';
                            if (p.pageNumber === 7 && (p.pageMode || 'who_is_who') === 'who_is_who') {
                                summaryTitle = 'Quién es quién: Sector Real y Startups Navarras';
                            } else if (p.pageNumber === 8 && (p.pageMode || 'beyond_rocket') === 'beyond_rocket') {
                                summaryTitle = 'Más allá del cohete y Acceso QR';
                            } else if (p.slots && p.slots[0]?.title) {
                                summaryTitle = p.slots[0].title;
                            }
                            return `<div style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;border-bottom:1px solid #e7e5e4;padding-bottom:0.5mm;"><strong style="font-family:${monoFont};color:#8B0000;">PÁG. ${p.pageNumber}</strong> · <span style="font-family:${serifFont};color:#111111;">${this.escapeHTML(summaryTitle)}</span></div>`;
                        }).join('')}
                    </div>
                </div>` : '';

            mainContentHtml = `<div>${slotsHtml}${coverSummaryHtml}</div>`;
        }

        let adHtml = '';
        if (page.adSlot) {
            const ad = page.adSlot;
            const adHeightMm = Number(ad.adHeightMm || 18);
            const isActiveAd = Boolean(ad.companyName || ad.imageUrl || ad.slogan || ad.bodyText);
            const adImgSrc = ad.imageUrl ? this.resolvePrintImageUrl(ad.imageUrl, forPrint) : '';
            const adFit = ad.adFit === 'cover' ? 'cover' : 'contain';
            const adSizeTag = !forPrint ? ` (${adHeightMm} mm)` : '';
            const adBtn = !forPrint ? `
                <div style="position:absolute;top:2px;right:2px;z-index:20;display:flex;align-items:center;gap:2px;background:rgba(250,248,245,0.95);border:1px solid #cbd5e1;padding:2px;">
                    ${isActiveAd ? `
                        <button type="button" onclick="ui.adjustPrintAdHeight(${pageIdx}, -6)" class="px-1.5 py-0.5 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] font-mono font-bold" title="Reducir tamaño del anuncio (-6 mm)">➖</button>
                        <button type="button" onclick="ui.adjustPrintAdHeight(${pageIdx}, 6)" class="px-1.5 py-0.5 bg-stone-200 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-[10px] font-mono font-bold" title="Aumentar tamaño del anuncio (+6 mm)">➕</button>
                    ` : ''}
                    <button type="button" onclick="ui.modalConfigurePrintAd(${pageIdx})" class="px-2 py-0.5 bg-[#8B0000] text-white hover:bg-[#111111] text-[10px] font-mono font-bold uppercase">📢 Anuncio</button>
                    ${isActiveAd ? `<button type="button" onclick="ui.clearPrintAdSlot(${pageIdx})" class="px-2 py-0.5 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-[10px] font-mono font-bold uppercase" title="Quitar anuncio">✕</button>` : ''}
                </div>` : '';

            if (isActiveAd && ad.adLayout === 'banner' && adImgSrc) {
                const bannerImgStyle = adFit === 'cover'
                    ? `width:100%;height:${adHeightMm}mm;object-fit:cover;background:#ffffff;border:1px solid #d6d3d1;display:block;`
                    : `width:100%;height:auto;max-height:${adHeightMm}mm;object-fit:contain;margin:0 auto;background:#ffffff;border:1px solid #d6d3d1;display:block;`;
                adHtml = `
                <div style="position:relative;margin-top:auto;border:2px solid #111111;background:#EFECE4;padding:1.5mm;display:flex;flex-direction:column;gap:1mm;">
                    ${adBtn}
                    <span style="font-family:${monoFont};font-size:7pt;line-height:1.2;text-transform:uppercase;letter-spacing:0.08em;color:#8B0000;font-weight:700;">PUBLICIDAD · ${this.escapeHTML(ad.companyName || 'ORBITAL REPORT')}${adSizeTag}</span>
                    <img src="${this.escapeAttr(adImgSrc)}" alt="" style="${bannerImgStyle}">
                </div>`;
            } else if (isActiveAd) {
                const cardImgMm = Math.min(adHeightMm, 90);
                adHtml = `
                <div style="position:relative;margin-top:auto;min-height:${adHeightMm}mm;border:2px solid #111111;background:#EFECE4;padding:2mm;display:flex;align-items:center;gap:2.5mm;">
                    ${adBtn}
                    ${adImgSrc ? `<img src="${this.escapeAttr(adImgSrc)}" alt="" style="width:${cardImgMm}mm;height:${cardImgMm}mm;object-fit:${adFit};background:#ffffff;border:1px solid #d6d3d1;flex-shrink:0;display:block;">` : ''}
                    <div style="min-width:0;flex:1;">
                        <span style="display:block;font-family:${monoFont};font-size:7pt;line-height:1.2;text-transform:uppercase;letter-spacing:0.08em;color:#8B0000;font-weight:700;">ESPACIO PUBLICITARIO${ad.classGroup ? ' • CLASE ' + this.escapeHTML(ad.classGroup) : ''}${adSizeTag}</span>
                        <h4 style="margin:0.4mm 0 0 0;font-family:${serifFont};font-weight:900;font-size:10pt;line-height:1.15;color:#111111;text-transform:uppercase;">${this.escapeHTML(ad.companyName || 'ESPACIO PATROCINADO')}</h4>
                        ${ad.slogan ? `<p style="margin:0.4mm 0 0 0;font-family:${serifFont};font-style:italic;font-size:8.5pt;line-height:1.2;color:#111111;">«${this.escapeHTML(ad.slogan)}»</p>` : ''}
                        ${ad.bodyText ? `<p style="margin:0.5mm 0 0 0;font-family:${sansFont};font-size:7.5pt;line-height:1.2;color:#44403c;">${this.escapeHTML(ad.bodyText)}</p>` : ''}
                    </div>
                </div>`;
            } else {
                adHtml = `
                <div style="position:relative;margin-top:auto;min-height:9.5mm;border:1px dashed #a8a29e;background:#f5f5f4;padding:2mm;display:flex;align-items:center;">
                    ${adBtn}
                    <span style="font-family:${monoFont};font-size:8pt;line-height:1.2;color:#57534e;text-transform:uppercase;">[ ${this.escapeHTML(ad.label || 'Espacio Publicitario Startup')} ]</span>
                </div>`;
            }
        }

        const headerHtml = isCover ? `
            <div style="border-bottom:2px solid #111111;padding-bottom:2mm;margin-bottom:2.8mm;text-align:center;">
                <div style="display:flex;justify-content:space-between;font-family:${monoFont};font-size:7.5pt;line-height:1.2;text-transform:uppercase;color:#57534e;border-bottom:1px solid #d6d3d1;padding-bottom:1mm;margin-bottom:1mm;">
                    <span>${this.escapeHTML(ed.issueLabel || 'Edición n.º 1')}</span>
                    <span>MIRAVALLES-EL REDÍN</span>
                    <span>${this.escapeHTML(ed.dateLabel || '')}</span>
                </div>
                <h1 style="margin:0;font-family:${serifFont};font-weight:900;font-size:30pt;line-height:1;letter-spacing:-0.02em;color:#111111;">ORBITAL REPORT</h1>
                <p style="margin:0.8mm 0 0 0;font-family:${serifFont};font-style:italic;font-size:9pt;line-height:1.2;color:#44403c;">Edición Impresa MARS-KET • «La Ciencia Despega a Plena Luz»</p>
            </div>
        ` : `
            <div style="display:flex;justify-content:space-between;align-items:center;gap:2mm;border-bottom:2px solid #111111;padding-bottom:1mm;margin-bottom:2mm;font-family:${monoFont};font-size:8pt;line-height:1.2;text-transform:uppercase;color:#111111;">
                <span style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">ORBITAL REPORT // ${this.escapeHTML(page.sectionTitle || page.label)}</span>
                <span style="flex-shrink:0;">PÁGINA ${page.pageNumber}</span>
            </div>
        `;

        const boxBorder = forPrint ? '' : 'border:1px solid #d6d3d1;';
        return `
        <div data-print-page-box="${pageIdx}" style="width:210mm;min-width:210mm;max-width:210mm;height:297mm;min-height:297mm;max-height:297mm;padding:9mm;box-sizing:border-box;background:#FAF8F5;color:#111111;font-family:${serifFont};display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;position:relative;${boxBorder}">
            <div data-print-page-inner="${pageIdx}">
                ${headerHtml}
                ${mainContentHtml}
            </div>
            ${adHtml}
            <div style="padding-top:1.5mm;margin-top:1.5mm;border-top:1px solid #d6d3d1;display:flex;justify-content:space-between;font-family:${monoFont};font-size:7pt;line-height:1.2;color:#78716c;text-transform:uppercase;">
                <span>${this.escapeHTML(ed.issueLabel || '')}</span>
                <span>Pág. ${page.pageNumber} / 8</span>
            </div>
        </div>`;
    },

    renderPrintEditionStudio(el) {
        if (!el || !this.isNewsCoordinator()) return;
        const ed = this.ensureActivePrintEdition();
        const editions = state.data.printEditions || [];
        const mode = this.printStudioViewMode || 'reading';
        const zoomMode = this.printStudioZoomMode || 'fit';
        const pendingAds = this.getPendingPrintAdRequests().filter(a => a.status === 'VALIDADO_CEO');

        if (!this._printResizeBound) {
            this._printResizeBound = true;
            window.addEventListener('resize', () => {
                if (this.printStudioActive) this.fitPrintPreviewStages();
            });
        }

        const imposedPairs = [
            { face: 1, title: 'Cara A3 n.º 1 (Pliego 1 Exterior)', leftIdx: 7, rightIdx: 0 },
            { face: 2, title: 'Cara A3 n.º 2 (Pliego 1 Interior)', leftIdx: 1, rightIdx: 6 },
            { face: 3, title: 'Cara A3 n.º 3 (Pliego 2 Exterior)', leftIdx: 5, rightIdx: 2 },
            { face: 4, title: 'Cara A3 n.º 4 (Pliego 2 Interior / Centro)', leftIdx: 3, rightIdx: 4 }
        ];

        const bodyContentHtml = mode === 'imposed'
            ? `
                <div class="space-y-6">
                    ${imposedPairs.map(sp => `
                        <div class="space-y-1.5">
                            <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-amber-300 uppercase font-bold">
                                <span>🖨️ ${sp.title}</span>
                                <span>[ Pág. ${sp.leftIdx + 1} (Izq.) | Doblez Central | Pág. ${sp.rightIdx + 1} (Der.) ]</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-1.5">
                                ${this.renderPrintPageToolbarHtml(ed.pages[sp.leftIdx], sp.leftIdx, true)}
                                ${this.renderPrintPageToolbarHtml(ed.pages[sp.rightIdx], sp.rightIdx, true)}
                            </div>
                            <div data-print-scale-outer class="w-full overflow-hidden border-2 border-amber-400/60 shadow-2xl bg-slate-900">
                                <div data-print-scale-inner style="width:420mm;display:grid;grid-template-columns:210mm 210mm;">
                                    <div style="border-right:1px dashed #ef4444;">${this.renderPrintStudioPageHtml(ed, ed.pages[sp.leftIdx], sp.leftIdx, false)}</div>
                                    <div>${this.renderPrintStudioPageHtml(ed, ed.pages[sp.rightIdx], sp.rightIdx, false)}</div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `
            : `
                <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    ${(ed.pages || []).map((pg, idx) => `
                        <div class="space-y-1.5 min-w-0">
                            ${this.renderPrintPageToolbarHtml(pg, idx, false)}
                            <div data-print-scale-outer class="w-full overflow-hidden shadow-xl bg-slate-900">
                                <div data-print-scale-inner style="width:210mm;">
                                    ${this.renderPrintStudioPageHtml(ed, pg, idx, false)}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

        const wrapper = document.createElement('div');
        wrapper.className = 'space-y-5';
        wrapper.innerHTML = `
            <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-amber-400 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap">
                            <h2 class="font-orbitron font-black text-base sm:text-xl text-white uppercase">🖨️ Estudio de Edición Impresa A3 // ORBITAL REPORT</h2>
                            ${ed.status === 'FINALIZED'
                                ? `<span class="px-2 py-0.5 bg-emerald-950 border border-emerald-400 text-emerald-300 font-mono text-[10px] font-black uppercase">🔒 EDICIÓN DEFINITIVA</span>`
                                : `<span class="px-2 py-0.5 bg-amber-950 border border-amber-400 text-amber-300 font-mono text-[10px] font-bold uppercase">📝 BORRADOR</span>`}
                        </div>
                        <p class="text-xs text-slate-300 font-sans">8 páginas (4 caras A3 apaisadas con doblez en medio) · Proporción física real 210×297 mm · Exclusivo Coordinación</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="ui.closePrintEditionStudio()" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-slate-600 text-white text-xs font-bold uppercase hover:bg-slate-700">⬅ Volver al Periódico Digital</button>
                        <button type="button" onclick="ui.saveActivePrintEditionDraft()" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Guardar Cambios</button>
                        ${ed.status === 'FINALIZED'
                            ? `<button type="button" onclick="ui.reopenPrintEditionDraft()" class="min-h-[44px] px-4 py-2 bg-amber-400 text-black font-black text-xs uppercase hover:bg-white">🔓 Reabrir Edición</button>`
                            : `<button type="button" onclick="ui.finalizePrintEdition()" class="min-h-[44px] px-4 py-2 bg-emerald-400 text-black font-black text-xs uppercase hover:bg-white">🔒 Guardar Edición Definitiva</button>`}
                        <button type="button" onclick="ui.printA3NewspaperPDF()" class="min-h-[44px] px-5 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white shadow-[0_0_15px_rgba(0,255,102,0.35)]">🖨️ Imprimir / Guardar PDF A3 (4 Caras)</button>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <select aria-label="Seleccionar edición mensual" onchange="ui.printStudioEditionId=this.value; ui.render();" class="min-h-[44px] bg-slate-900 border border-amber-400/60 px-3 py-2 text-xs text-white font-bold">
                            ${editions.map(e => `<option value="${this.escapeAttr(e.id)}" ${e.id === ed.id ? 'selected' : ''}>${e.status === 'FINALIZED' ? '🔒 ' : '📝 '}${this.escapeHTML(e.issueLabel)}</option>`).join('')}
                        </select>
                        <button type="button" onclick="ui.modalEditPrintEditionMeta()" class="min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold uppercase hover:border-mars-cyan">✏️ Cabecera</button>
                        <button type="button" onclick="ui.createNewPrintEditionModal()" class="min-h-[44px] px-3 py-2 bg-amber-400 text-black text-xs font-black uppercase hover:bg-white">+ Nueva Edición</button>
                        <button type="button" onclick="ui.autoLayoutPrintEdition(false)" class="min-h-[44px] px-3 py-2 bg-mars-cyan text-black text-xs font-black uppercase hover:bg-white">⚡ Auto-Maquetar Noticias</button>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <div class="flex items-center border border-slate-700 bg-black p-0.5" title="Zoom de vista previa WYSIWYG">
                            <button type="button" onclick="ui.printStudioZoomMode='fit'; ui.render();" class="min-h-[44px] px-2.5 py-1.5 text-xs font-mono font-bold uppercase ${zoomMode === 'fit' ? 'bg-white text-black' : 'text-slate-300'}">🔍 Ajustar</button>
                            <button type="button" onclick="ui.printStudioZoomMode='actual'; ui.render();" class="min-h-[44px] px-2.5 py-1.5 text-xs font-mono font-bold uppercase ${zoomMode === 'actual' ? 'bg-white text-black' : 'text-slate-300'}">📏 100% Real</button>
                        </div>
                        <div class="flex items-center border border-slate-700 bg-black p-0.5">
                            <button type="button" onclick="ui.printStudioViewMode='reading'; ui.render();" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase ${mode === 'reading' ? 'bg-mars-cyan text-black' : 'text-slate-300'}">📖 Págs. 1–8</button>
                            <button type="button" onclick="ui.printStudioViewMode='imposed'; ui.render();" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase ${mode === 'imposed' ? 'bg-amber-400 text-black' : 'text-slate-300'}">🖨️ 4 Caras A3</button>
                        </div>
                    </div>
                </div>

                ${pendingAds.length > 0 ? `
                    <div class="p-3 bg-emerald-950/35 border border-emerald-500/50 rounded text-xs text-emerald-200">
                        <strong>🌟 Solicitudes de Publicidad en Periódico (DOC_12) pendientes de aprobar (${pendingAds.length}):</strong>
                        ${pendingAds.map(a => `${this.escapeHTML(a.companyName)} [Clase ${this.escapeHTML(a.classGroup)}]`).join(', ')}. Configúralas en cualquier hueco publicitario abajo.
                    </div>
                ` : ''}
            </div>

            ${bodyContentHtml}
        `;
        el.appendChild(wrapper);
        requestAnimationFrame(() => this.checkPrintPagesOverflow());
    },

    printA3NewspaperPDF() {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const imposedPairs = [
            [7, 0], // Cara 1: Pág 8 | Pág 1
            [1, 6], // Cara 2: Pág 2 | Pág 7
            [5, 2], // Cara 3: Pág 6 | Pág 3
            [3, 4]  // Cara 4: Pág 4 | Pág 5
        ];

        const sheetsHtml = imposedPairs.map(([lIdx, rIdx]) => `
            <section class="a3-sheet">
                <div class="a4-half left-half">${this.renderPrintStudioPageHtml(ed, ed.pages[lIdx], lIdx, true)}</div>
                <div class="a4-half right-half">${this.renderPrintStudioPageHtml(ed, ed.pages[rIdx], rIdx, true)}</div>
            </section>
        `).join('');

        const docHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <base href="${this.escapeAttr(window.location.origin)}/">
    <title>ORBITAL REPORT — ${this.escapeHTML(ed.issueLabel || 'Edición A3')}</title>
    <link rel="stylesheet" href="${this.escapeAttr(window.location.origin)}/css/tailwind.css">
    <style>
        @page { size: 420mm 297mm; margin: 0; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { margin: 0; padding: 0; background: #1e293b; font-family: Georgia, "Times New Roman", serif; color: #111111; font-size: 16px; }
        .no-print { position: sticky; top: 0; z-index: 99; background: #0b1120; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; border-bottom: 2px solid #00f0ff; font-family: ui-monospace, monospace; font-size: 12px; }
        .btn-p { background: #00ff66; color: #000; border: 0; padding: 10px 18px; font-weight: 900; cursor: pointer; text-transform: uppercase; white-space: nowrap; }
        .a3-sheet { width: 420mm; height: 297mm; margin: 12px auto; background: #FAF8F5; display: grid; grid-template-columns: 210mm 210mm; page-break-after: always; break-after: page; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .a3-sheet:last-of-type { page-break-after: auto; break-after: auto; }
        .a4-half { width: 210mm; height: 297mm; overflow: hidden; }
        .left-half { border-right: 0.5pt dashed #cbd5e1; }
        @media print {
            html, body { width: 420mm !important; margin: 0 !important; padding: 0 !important; background: #FAF8F5 !important; }
            .no-print { display: none !important; }
            .a3-sheet { width: 420mm !important; height: 297mm !important; margin: 0 !important; box-shadow: none !important; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <span>🖨️ ORBITAL REPORT (${this.escapeHTML(ed.issueLabel)}) — Al imprimir selecciona: <strong>Papel A3 Horizontal · Márgenes: Ninguno · Escala: 100% (Tamaño real)</strong></span>
        <button class="btn-p" onclick="window.print()">🖨️ Imprimir / Guardar PDF A3</button>
    </div>
    ${sheetsHtml}
</body>
</html>`;

        const win = window.open('', '_blank');
        if (!win) return this.notify("El navegador bloqueó la ventana de impresión. Permite las ventanas emergentes para este sitio.", "warning");
        win.document.open();
        win.document.write(docHtml);
        win.document.close();
        this.notify("🖨️ Maqueta A3 lista en nueva pestaña (recuerda: A3 Horizontal · Márgenes Ninguno · Escala 100%).", "success");
    }
});
