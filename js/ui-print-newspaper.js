// js/ui-print-newspaper.js
// --- ESTUDIO DE EDICIÓN IMPRESA MENSUAL A3 (8 PÁGINAS / 4 CARAS DÚPLEX · ESTILO THE WASHINGTON POST) ---

Object.assign(ui, {
    printStudioActive: false,
    printStudioEditionId: null,
    printStudioViewMode: 'reading', // 'reading' (Págs 1..8) | 'imposed' (4 Caras A3 [8|1], [2|7], [6|3], [4|5])

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
            { id: 'real-spacex', name: 'SpaceX', country: 'EE. UU.', summary: 'Falcon 9, Falcon Heavy y desarrollo de Starship.' },
            { id: 'real-pld', name: 'PLD Space', country: 'España', summary: 'Fabricación y ensayo del lanzador orbital MIURA 5.' },
            { id: 'real-blue', name: 'Blue Origin', country: 'EE. UU.', summary: 'Lanzador orbital New Glenn y vuelos suborbitales New Shepard.' },
            { id: 'real-rocketlab', name: 'Rocket Lab', country: 'EE. UU.', summary: 'Lanzador ligero Electron y desarrollo del cohete Neutron.' },
            { id: 'real-isar', name: 'Isar Aerospace', country: 'Alemania', summary: 'Lanzamiento de satélites pequeños con Spectrum.' },
            { id: 'real-firefly', name: 'Firefly Aerospace', country: 'EE. UU.', summary: 'Cohete Alpha, módulo lunar Blue Ghost y vehículos Elytra.' },
            { id: 'real-maia', name: 'MaiaSpace', country: 'Francia', summary: 'Lanzador orbital con primera etapa reutilizable.' },
            { id: 'real-rfa', name: 'Rocket Factory Augsburg', country: 'Alemania', summary: 'Desarrollo del lanzador de satélites RFA ONE.' },
            { id: 'real-arianegroup', name: 'ArianeGroup / Arianespace', country: 'Europa', summary: 'Desarrollo industrial y comercialización de Ariane 6.' },
            { id: 'real-avio', name: 'Avio', country: 'Italia', summary: 'Desarrollo y servicios de lanzamiento de Vega-C.' },
            { id: 'real-skyrora', name: 'Skyrora', country: 'R. Unido', summary: 'Desarrollo del lanzador ligero Skyrora XL.' },
            { id: 'real-landspace', name: 'LandSpace', country: 'China', summary: 'Familia de lanzadores Zhuque.' }
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
                    { id: 'p1-lead', role: 'lead', kicker: 'ACTUALIDAD Y ESTRATEGIA', title: 'Noticia Principal de Portada', subtitle: 'Entradilla editorial en cursiva...', body: 'Selecciona una noticia real o crónica de Coordinación para la apertura de portada.', imageUrl: '', mediaSource: 'Consejo Editorial AEE', fontSizePt: 9.5 },
                    { id: 'p1-sec', role: 'secondary', kicker: 'EN BREVE // MISIÓN', title: 'Noticia Secundaria de Portada', subtitle: '', body: 'Segundo titular destacado de la primera plana.', imageUrl: '', mediaSource: 'ORBITAL REPORT', fontSizePt: 9 }
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

        const fillSlotFromNews = (slot, art) => {
            if (!slot || !art) return;
            slot.kicker = art.category || 'ACTUALIDAD AEROESPACIAL';
            slot.title = art.title || slot.title;
            slot.subtitle = art.subtitle || '';
            slot.body = art.body || art.title || '';
            slot.imageUrl = art.imageUrl ? (this.getNewsImageSrc ? this.getNewsImageSrc(art.imageUrl) : art.imageUrl) : '';
            slot.mediaSource = art.sourceName || art.author || 'Consejo Editorial AEE';
        };

        const fillSlotFromWire = (slot, art) => {
            if (!slot || !art) return;
            slot.kicker = 'PRENSA INTERNACIONAL';
            slot.title = art.titleEs || art.title || slot.title;
            slot.subtitle = art.summaryEs || art.summary || '';
            slot.body = art.summaryEs || art.summary || art.titleEs || art.title || '';
            slot.imageUrl = art.proxy_image_url || (art.image_url && this.getNewsImageSrc ? this.getNewsImageSrc(art.image_url) : '');
            slot.mediaSource = art.news_site || 'Spaceflight News';
        };

        // Pág. 1: Portada (Noticia principal + secundaria)
        if (savedNews[0]) fillSlotFromNews(ed.pages[0].slots[0], savedNews[0]);
        if (savedNews[1]) fillSlotFromNews(ed.pages[0].slots[1], savedNews[1]);
        else if (wireNews[0]) fillSlotFromWire(ed.pages[0].slots[1], wireNews[0]);

        // Pág. 2: Crónicas AEE
        if (savedNews[2]) fillSlotFromNews(ed.pages[1].slots[0], savedNews[2]);
        if (savedNews[3]) fillSlotFromNews(ed.pages[1].slots[1], savedNews[3]);

        // Pág. 3: Actualidad Aeroespacial Internacional (SNAPI traducido + fuente)
        if (wireNews[0]) fillSlotFromWire(ed.pages[2].slots[0], wireNews[0]);
        if (wireNews[1]) fillSlotFromWire(ed.pages[2].slots[1], wireNews[1]);

        // Pág. 4: Notas de Prensa DOC_15
        if (publishedPRs[0]) {
            const p = publishedPRs[0];
            ed.pages[3].slots[0].kicker = `COMUNICADO DOC_15 • CLASE ${p.classGroup}`;
            ed.pages[3].slots[0].title = `${p.companyName}: ${p.title}`;
            ed.pages[3].slots[0].body = p.editorialNote || `Comunicado oficial de cierre de Fase ${p.phase} publicado por ${p.companyName}.`;
            ed.pages[3].slots[0].imageUrl = p.nanoBananaImage || '';
            ed.pages[3].slots[0].mediaSource = `${p.companyName} (DOC_15)`;
        }
        if (publishedPRs[1]) {
            const p = publishedPRs[1];
            ed.pages[3].slots[1].kicker = `COMUNICADO DOC_15 • CLASE ${p.classGroup}`;
            ed.pages[3].slots[1].title = `${p.companyName}: ${p.title}`;
            ed.pages[3].slots[1].body = p.editorialNote || `Comunicado oficial de cierre de Fase ${p.phase} publicado por ${p.companyName}.`;
            ed.pages[3].slots[1].imageUrl = p.nanoBananaImage || '';
            ed.pages[3].slots[1].mediaSource = `${p.companyName} (DOC_15)`;
        }

        // Pág. 6 y 8: Noticias reales adicionales
        if (wireNews[2]) fillSlotFromWire(ed.pages[5].slots[0], wireNews[2]);
        if (wireNews[3]) fillSlotFromWire(ed.pages[6].slots[0], wireNews[3]);
        if (wireNews[4]) fillSlotFromWire(ed.pages[7].slots[0], wireNews[4]);

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

    modalEditPrintSlot(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;

        const savedNews = Array.isArray(state.data.news) ? state.data.news : [];
        const wireNews = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];

        const html = `
            <div class="space-y-3 text-xs font-sans">
                <div class="p-3 bg-cyan-950/40 border border-mars-cyan/50 rounded space-y-2">
                    <label for="print-slot-source-pick" class="text-xs text-mars-cyan font-bold uppercase block font-mono">📥 Cargar desde Noticias de la App o Teletipo Real (Opcional)</label>
                    <select id="print-slot-source-pick" onchange="ui.applySourceToPrintSlotEditor(this.value)" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
                        <option value="">-- Mantener / Editar texto manualmente --</option>
                        ${savedNews.map((n, i) => `<option value="NEWS:${i}">[Tablón] ${this.escapeHTML((n.title || '').slice(0, 75))}</option>`).join('')}
                        ${wireNews.map((w, i) => `<option value="WIRE:${i}">[Real · ${this.escapeHTML(w.news_site || 'SNAPI')}] ${this.escapeHTML((w.titleEs || w.title || '').slice(0, 70))}</option>`).join('')}
                    </select>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                        <label for="print-slot-kicker" class="text-[11px] text-amber-300 font-bold uppercase block mb-1">Antetítulo / Sección</label>
                        <input type="text" id="print-slot-kicker" value="${this.escapeAttr(slot.kicker || '')}" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white">
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
                            ${[8.5, 9, 9.5, 10, 10.5].map(pt => `<option value="${pt}" ${Number(slot.fontSizePt || 9.5) === pt ? 'selected' : ''}>Letra ${pt} pt</option>`).join('')}
                        </select>
                    </div>
                    <textarea id="print-slot-body" rows="6" class="w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white font-sans">${this.escapeHTML(slot.body || '')}</textarea>
                </div>
                <div>
                    <label for="print-slot-img" class="text-[11px] text-slate-300 font-bold uppercase block mb-1">URL de Imagen (Opcional)</label>
                    <input type="text" id="print-slot-img" value="${this.escapeAttr(slot.imageUrl || '')}" placeholder="/api/news/image?url=... o https://..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
            <button type="button" onclick="ui.savePrintSlot(${pageIdx}, ${slotIdx})" class="min-h-[44px] px-5 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white">💾 Aplicar a Página ${page.pageNumber}</button>
        `;
        this.showModal(`✏️ Editar Hueco // Página ${page.pageNumber} (${page.label})`, html, actions);
    },

    async applySourceToPrintSlotEditor(val) {
        if (!val) return;
        const [kind, idxStr] = val.split(':');
        const idx = parseInt(idxStr, 10);
        const setVal = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };

        if (kind === 'NEWS') {
            const art = (state.data.news || [])[idx];
            if (!art) return;
            setVal('print-slot-kicker', art.category || 'ACTUALIDAD');
            setVal('print-slot-source', art.sourceName || art.author || 'AEE');
            setVal('print-slot-title', art.title || '');
            setVal('print-slot-subtitle', art.subtitle || '');
            setVal('print-slot-body', art.body || '');
            setVal('print-slot-img', art.imageUrl ? (this.getNewsImageSrc ? this.getNewsImageSrc(art.imageUrl) : art.imageUrl) : '');
        } else if (kind === 'WIRE') {
            const art = (this._snapiWireArticles || [])[idx];
            if (!art) return;
            setVal('print-slot-kicker', 'PRENSA INTERNACIONAL');
            setVal('print-slot-source', art.news_site || 'Spaceflight News');
            setVal('print-slot-title', art.titleEs || art.title || '');
            setVal('print-slot-subtitle', art.summaryEs || art.summary || '');
            setVal('print-slot-body', art.summaryEs || art.summary || '');
            setVal('print-slot-img', art.proxy_image_url || (art.image_url && this.getNewsImageSrc ? this.getNewsImageSrc(art.image_url) : ''));

            if (art.url && /^https?:\/\//i.test(art.url)) {
                this.notify("🌐 Extrayendo artículo completo traducido...", "info");
                try {
                    const resp = await fetch(`/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(art.title || '')}&summary=${encodeURIComponent(art.summary || '')}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`);
                    if (resp.ok) {
                        const full = await resp.json();
                        setVal('print-slot-title', full.titleEs || art.titleEs || art.title);
                        setVal('print-slot-body', full.bodyEs || full.bodyEn || '');
                        if (full.imageUrl) setVal('print-slot-img', full.imageUrl);
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
        const ad = page?.adSlot;
        if (!ad) return;

        const companies = state.data?.companies || {};
        const pendingAds = this.getPendingPrintAdRequests();
        const coOptions = Object.keys(companies).map(cid => {
            const co = companies[cid];
            const req = pendingAds.find(r => r.coId === cid);
            const tag = req ? (req.status === 'VALIDADO_CEO' ? ' 🌟 [DOC_12 PENDIENTE APROBAR]' : ' ✓ [DOC_12 APROBADA]') : '';
            return `<option value="${this.escapeAttr(cid)}" ${ad.coId === cid ? 'selected' : ''}>${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup || 'A')}]${tag}</option>`;
        }).join('');

        const curReq = ad.coId ? pendingAds.find(r => r.coId === ad.coId) : null;
        const html = `
            <div class="space-y-3 text-xs font-sans">
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
                <div class="p-2.5 bg-black/50 border border-slate-800 rounded space-y-2">
                    <label class="text-[11px] text-amber-300 font-bold uppercase block font-mono">🖼️ Subir Foto / Creatividad del Anuncio (Opcional)</label>
                    <p class="text-[11px] text-cyan-300 font-mono bg-cyan-950/35 border border-cyan-500/30 px-2 py-1 rounded">
                        📐 Tamaño en papel A3: <strong>18 × 18 mm</strong> (formato cuadrado 1:1 · recomendado <strong>400 × 400 px</strong> o <strong>600 × 600 px</strong>, mínimo 220 × 220 px).
                    </p>
                    <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'print-ad-img-data', 'print-ad-img-preview')" class="w-full text-xs text-slate-300">
                    <input type="url" id="print-ad-img-url" value="${(ad.imageUrl && ad.imageUrl.startsWith('http')) ? this.escapeAttr(ad.imageUrl) : ''}" oninput="ui.previewNanoBananaUrl(this.value, 'print-ad-img-preview')" placeholder="O pega URL de imagen..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                    <input type="hidden" id="print-ad-img-data" value="${this.escapeAttr(ad.imageUrl || '')}">
                    <div id="print-ad-img-preview" class="hidden"></div>
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
            imgEl.value = this.getDirectDriveImageUrl ? this.getDirectDriveImageUrl(co.logo) : co.logo;
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
        ad.coId = cid;
        ad.companyName = co ? co.name : '';
        ad.classGroup = co ? (co.classGroup || 'A') : '';
        ad.slogan = (document.getElementById('print-ad-slogan')?.value || '').trim();
        ad.bodyText = (document.getElementById('print-ad-text')?.value || '').trim();
        const imgData = document.getElementById('print-ad-img-data')?.value || '';
        const imgUrl = (document.getElementById('print-ad-img-url')?.value || '').trim();
        ad.imageUrl = imgData || imgUrl || '';
        ad.campId = document.getElementById('print-ad-camp-id')?.value || '';
        ad.actId = document.getElementById('print-ad-act-id')?.value || '';
        ed.updatedAt = Date.now();

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

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <p class="text-[11px] text-slate-300">Selecciona empresas aeroespaciales reales y startups del colegio (clases A–F) para mostrarlas juntas en la Página 7. Zero-PII: solo se imprime <strong>Nombre · España</strong> y el nombre del prototipo.</p>

                <div class="space-y-2">
                    <div class="flex flex-wrap items-center justify-between gap-2">
                        <h4 class="text-xs font-mono font-bold text-amber-300 uppercase">🎓 Startups del Colegio (${companies.length} disponibles)</h4>
                        <select aria-label="Filtrar startups por clase" onchange="document.querySelectorAll('.wiw-startup-row').forEach(r => { r.style.display = (this.value === 'ALL' || r.dataset.cls === this.value) ? '' : 'none'; })" class="min-h-[36px] bg-slate-900 border border-slate-700 px-2 py-1 text-xs text-white font-mono">
                            <option value="ALL">Todas las clases</option>
                            <option value="A">Clase A</option><option value="B">Clase B</option><option value="C">Clase C</option>
                            <option value="D">Clase D</option><option value="E">Clase E</option><option value="F">Clase F</option>
                            <option value="TEST">Clase TEST</option>
                        </select>
                    </div>
                    <div class="max-h-56 overflow-y-auto border border-slate-700 bg-slate-900/70 divide-y divide-slate-800 p-2 space-y-1.5">
                        ${companies.length === 0 ? `<p class="text-slate-400 italic p-2">No hay empresas registradas en el estado actual.</p>` : companies.map(c => {
                            const cid = String(c._keyId);
                            const cls = String(c.classGroup || 'A').toUpperCase();
                            const checked = startupProtoMap.has(cid);
                            const protoVal = startupProtoMap.get(cid) || '';
                            return `
                            <div class="wiw-startup-row pt-1.5 first:pt-0 flex flex-col sm:flex-row sm:items-center gap-2" data-cls="${this.escapeAttr(cls)}" data-cid="${this.escapeAttr(cid)}">
                                <label class="flex items-center gap-2 min-w-[200px] cursor-pointer text-white font-bold select-none">
                                    <input type="checkbox" class="wiw-startup-chk w-5 h-5 accent-amber-400 cursor-pointer shrink-0" value="${this.escapeAttr(cid)}" ${checked ? 'checked' : ''}>
                                    <span>${this.escapeHTML(c.name || cid)} <span class="text-[10px] text-mars-cyan font-mono">(${this.escapeHTML(cls)})</span></span>
                                </label>
                                <input type="text" class="wiw-proto-input flex-1 min-h-[38px] bg-black border border-slate-700 px-2.5 py-1 text-xs text-white outline-none focus:border-amber-400" value="${this.escapeAttr(protoVal)}" placeholder="Nombre del prototipo (ej: Falcon-MARS I)">
                            </div>`;
                        }).join('')}
                    </div>
                </div>

                <div class="space-y-2">
                    <h4 class="text-xs font-mono font-bold text-mars-cyan uppercase">🛰️ Empresas Aeroespaciales Reales</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-44 overflow-y-auto border border-slate-700 bg-slate-900/70 p-2">
                        ${realList.map(r => `
                            <label class="flex items-start gap-2 p-1.5 rounded hover:bg-slate-800/70 cursor-pointer">
                                <input type="checkbox" class="wiw-real-chk mt-0.5 w-4 h-4 accent-mars-cyan" value="${this.escapeAttr(r.id)}" ${selectedRealSet.has(r.id) ? 'checked' : ''}>
                                <span><strong class="text-white">${this.escapeHTML(r.name)}</strong> · <span class="text-slate-400">${this.escapeHTML(r.country)}</span></span>
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
        this.showModal("🌍 Configurar «Quién es quién» (Pág. 7)", html, actions);
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
            const prototypeName = (protoInput?.value || '').trim() || 'Prototipo Fase I';
            startups.push({ coId: cid, prototypeName });
        });

        page.whoIsWhoConfig = { realIds, startups };
        page.pageMode = 'who_is_who';
        ed.updatedAt = Date.now();
        state.save();
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);
        this.closeModal();
        this.render();
        this.notify(`✅ «Quién es quién» actualizado (${startups.length} startups + ${realIds.length} reales).`, "success");
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

    modalPickPrintSlotNews(pageIdx, slotIdx) {
        if (!this.isNewsCoordinator()) return;
        const ed = this.getActivePrintEdition();
        const page = ed?.pages?.[pageIdx];
        const slot = page?.slots?.[slotIdx];
        if (!slot) return;

        const savedNews = Array.isArray(state.data?.news) ? state.data.news : [];
        const wireNews = Array.isArray(this._snapiWireArticles) ? this._snapiWireArticles : [];

        const html = `
            <div class="space-y-4 text-xs font-sans">
                <p class="text-[11px] text-slate-300">Selecciona una noticia para aplicarla directamente en la <strong>Página ${page.pageNumber}</strong> (Hueco #${slotIdx + 1}).</p>

                <div class="space-y-2">
                    <h4 class="text-xs font-mono font-bold text-amber-300 uppercase">🏛️ Noticias Creadas por Coordinación (${savedNews.length})</h4>
                    <div class="max-h-52 overflow-y-auto border border-slate-700 bg-slate-900/70 divide-y divide-slate-800 p-2 space-y-1.5">
                        ${savedNews.length === 0 ? `<p class="text-slate-400 italic p-2">No hay noticias guardadas todavía.</p>` : savedNews.map((n, i) => `
                            <div class="pt-1.5 first:pt-0 flex items-center justify-between gap-2">
                                <div class="min-w-0 flex-1">
                                    <span class="block text-[10px] font-mono text-mars-cyan uppercase">${this.escapeHTML(n.category || 'AEE')} · ${this.escapeHTML(n.publishedDate || '')}</span>
                                    <strong class="block text-xs text-white truncate">${this.escapeHTML(n.title || '')}</strong>
                                </div>
                                <button type="button" onclick="ui.applyPickedNewsToPrintSlot(${pageIdx}, ${slotIdx}, 'NEWS', ${i})" class="min-h-[38px] px-3 py-1 bg-amber-400 text-black font-black text-[11px] uppercase hover:bg-white shrink-0">Aplicar</button>
                            </div>
                        `).join('')}
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

        if (kind === 'NEWS') {
            const art = (state.data?.news || [])[idx];
            if (!art) return;
            slot.kicker = art.category || 'ACTUALIDAD';
            slot.mediaSource = art.sourceName || art.author || 'ORBITAL REPORT';
            slot.title = art.title || slot.title;
            slot.subtitle = art.subtitle || '';
            slot.body = art.body || art.title || '';
            slot.imageUrl = art.imageUrl ? (this.getNewsImageSrc ? this.getNewsImageSrc(art.imageUrl) : art.imageUrl) : '';
        } else if (kind === 'WIRE') {
            const art = (this._snapiWireArticles || [])[idx];
            if (!art) return;
            slot.kicker = 'PRENSA INTERNACIONAL';
            slot.mediaSource = art.news_site || 'Spaceflight News';
            slot.title = art.titleEs || art.title || slot.title;
            slot.subtitle = art.summaryEs || art.summary || '';
            slot.body = art.summaryEs || art.summary || '';
            slot.imageUrl = art.proxy_image_url || (art.image_url && this.getNewsImageSrc ? this.getNewsImageSrc(art.image_url) : '');

            if (art.url && /^https?:\/\//i.test(art.url)) {
                this.notify("🌐 Extrayendo artículo completo en castellano...", "info");
                try {
                    const resp = await fetch(`/api/news/article?url=${encodeURIComponent(art.url)}&title=${encodeURIComponent(art.title || '')}&summary=${encodeURIComponent(art.summary || '')}&site=${encodeURIComponent(art.news_site || '')}&img=${encodeURIComponent(art.image_url || '')}`);
                    if (resp.ok) {
                        const full = await resp.json();
                        slot.title = full.titleEs || slot.title;
                        slot.body = full.bodyEs || full.bodyEn || slot.body;
                        if (full.imageUrl) slot.imageUrl = full.imageUrl;
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
        let html = '';
        let inList = false;
        lines.forEach(line => {
            const trimmed = line.trim();
            if (/^[-•]\s+/.test(trimmed)) {
                if (!inList) {
                    html += '<ul class="list-disc pl-4 my-1 space-y-0.5 text-left">';
                    inList = true;
                }
                html += `<li>${formatInline(trimmed.replace(/^[-•]\s+/, ''))}</li>`;
            } else {
                if (inList) {
                    html += '</ul>';
                    inList = false;
                }
                if (trimmed !== '') {
                    html += `<p class="mb-1 last:mb-0 text-justify">${formatInline(trimmed)}</p>`;
                }
            }
        });
        if (inList) html += '</ul>';
        return html;
    },

    renderPrintStudioPageHtml(ed, page, pageIdx, forPrint = false) {
        const isCover = page.pageNumber === 1;
        const isWhoIsWho = page.pageNumber === 7 && (page.pageMode || 'who_is_who') === 'who_is_who';
        const isBeyondRocket = page.pageNumber === 8 && (page.pageMode || 'beyond_rocket') === 'beyond_rocket';
        const hasAd = Boolean(page.adSlot && page.adSlot.companyName);

        let mainContentHtml = '';
        let pageControlsHtml = '';

        if (page.pageNumber === 7 && !forPrint) {
            pageControlsHtml = `
                <div class="flex items-center gap-1.5">
                    ${isWhoIsWho ? `<button type="button" onclick="ui.modalConfigureWhoIsWho(${pageIdx})" class="px-2 py-0.5 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-bold uppercase">🌍 Elegir Empresas</button>` : ''}
                    <button type="button" onclick="ui.togglePrintPageMode(${pageIdx})" class="px-2 py-0.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">${isWhoIsWho ? '📰 Cambiar a Noticias' : '🌍 Cambiar a Quién es quién'}</button>
                </div>`;
        } else if (page.pageNumber === 8 && !forPrint) {
            pageControlsHtml = `
                <div class="flex items-center gap-1.5 flex-wrap">
                    ${isBeyondRocket ? `
                        <button type="button" onclick="ui.syncLaunchLibrary2ForPrint(${pageIdx})" class="px-2 py-0.5 bg-emerald-700 text-white hover:bg-[#111111] text-[10px] font-mono font-bold uppercase">🛰️ Sync LL2 (ES)</button>
                        <button type="button" onclick="ui.modalEditBeyondRocketDirectory(${pageIdx})" class="px-2 py-0.5 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-bold uppercase">✏️ Editar Fichas</button>
                    ` : ''}
                    <button type="button" onclick="ui.togglePrintPageMode(${pageIdx})" class="px-2 py-0.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">${isBeyondRocket ? '📰 Cambiar a Noticias' : '🚀 Cambiar a Más allá del cohete'}</button>
                </div>`;
        }

        if (isWhoIsWho) {
            const cfg = page.whoIsWhoConfig || { realIds: ['real-spacex', 'real-pld', 'real-blue', 'real-rocketlab'], startups: [] };
            const realMap = new Map(this.getWhoIsWhoRealPresets().map(r => [r.id, r]));
            const companies = state.data?.companies || {};
            const startupEntries = (cfg.startups || []).map(s => {
                const co = companies[s.coId];
                if (!co) return null;
                return {
                    name: co.name,
                    country: 'España',
                    desc: `Prototipo: ${s.prototypeName || 'En desarrollo'}`,
                    isSchool: true
                };
            }).filter(Boolean);
            const realEntries = (cfg.realIds || []).map(id => {
                const r = realMap.get(id);
                return r ? { name: r.name, country: r.country, desc: r.summary, isSchool: false } : null;
            }).filter(Boolean);
            const allEntries = [...startupEntries, ...realEntries].slice(0, hasAd ? 16 : 22);

            mainContentHtml = `
                <div class="space-y-2">
                    <div class="border-b border-stone-300 pb-1.5">
                        <h3 class="font-serif font-black text-[18pt] leading-tight text-[#111111]">Quién es quién</h3>
                        <p class="font-serif italic text-[8.5pt] text-stone-700">${startupEntries.length} startups escolares y ${realEntries.length} empresas aeroespaciales de referencia.</p>
                    </div>
                    <div class="grid grid-cols-2 gap-x-3 gap-y-1.5">
                        ${allEntries.length === 0 ? `<p class="col-span-2 text-xs text-stone-500 italic">Pulsa «🌍 Elegir Empresas» para seleccionar startups y empresas reales.</p>` : allEntries.map(e => `
                            <div class="border-b border-stone-200 pb-1">
                                <div class="text-[8pt] font-serif font-bold text-[#111111] leading-tight">
                                    ${this.escapeHTML(e.name)} <span class="font-mono text-[7pt] font-normal text-[#8B0000]">· ${this.escapeHTML(e.country)}</span>
                                </div>
                                <div class="text-[7.2pt] font-sans text-stone-700 leading-snug">${this.escapeHTML(e.desc)}</div>
                            </div>
                        `).join('')}
                    </div>
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
                <div class="space-y-2">
                    <div class="border-b border-stone-300 pb-1">
                        <h3 class="font-serif font-black text-[17pt] leading-tight text-[#111111]">Más allá del cohete</h3>
                        <p class="font-serif italic text-[8pt] text-stone-700">${this.escapeHTML(cfg.subtitle || '')}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-x-3 gap-y-1">
                        ${dirItems.map(it => `
                            <div class="border-b border-stone-200 pb-0.5">
                                <span class="block text-[6.3pt] font-mono font-bold uppercase text-[#0f5132] tracking-wide">${this.escapeHTML(it.cat)}</span>
                                <strong class="block text-[7.6pt] font-serif text-[#111111] leading-tight">${this.escapeHTML(it.name)}</strong>
                                <span class="block text-[6.8pt] font-sans text-stone-700 leading-tight">${this.escapeHTML(it.desc)}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${ll2Items.length > 0 ? `
                        <div class="bg-[#EFECE4] border-l-2 border-l-[#8B0000] p-1.5 space-y-1">
                            <span class="block text-[6.8pt] font-mono font-black uppercase text-[#8B0000]">🛰️ Agenda de Lanzamientos Reales (Launch Library 2 · ES)</span>
                            <div class="grid grid-cols-2 gap-x-2.5 gap-y-1">
                                ${ll2Items.map(l => `
                                    <div class="text-[6.8pt] leading-tight">
                                        <strong class="text-[#111111]">${this.escapeHTML(l.name)}</strong>
                                        <span class="block text-stone-700">${this.escapeHTML(l.dateEs)} · <em>${this.escapeHTML(l.statusEs)}</em></span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                    <div class="bg-white border border-[#111111] p-1.5 flex items-center gap-2.5">
                        ${qrSvg}
                        <div class="min-w-0 flex-1">
                            <strong class="block text-[8.2pt] font-serif text-[#111111] leading-tight">ORBITAL REPORT en la web</strong>
                            <span class="block text-[7pt] font-sans text-stone-700 leading-snug">Escanea el QR para leer las noticias del proyecto desde casa.</span>
                            <span class="inline-block mt-0.5 px-1.5 py-0.5 bg-[#111111] text-white font-mono text-[6.8pt] font-bold uppercase">Acceso Colegio/Familias: VIP-0000 · PIN 0000</span>
                        </div>
                    </div>
                </div>`;
        } else {
            const slotsHtml = (page.slots || []).map((slot, sIdx) => {
                const imgSrc = slot.imageUrl ? (this.getNewsImageSrc ? this.getNewsImageSrc(slot.imageUrl) : slot.imageUrl) : '';
                const fontPt = Number(slot.fontSizePt || 9.5);
                const editBtn = !forPrint ? `
                    <div class="flex items-center gap-1">
                        <button type="button" onclick="ui.modalPickPrintSlotNews(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-amber-400 text-black hover:bg-white text-[10px] font-mono font-bold uppercase">📰 Elegir Noticia</button>
                        <button type="button" onclick="ui.modalEditPrintSlot(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">✏️ Editar</button>
                    </div>` : '';
                const charCount = (slot.body || '').length;
                const fitBadge = !forPrint ? `<span class="text-[9px] font-mono ${charCount > 1400 ? 'text-red-700 font-bold' : 'text-emerald-800'}">${charCount > 1400 ? '⚠️ Texto largo' : '✓ Encaja'}</span>` : '';
                return `
                <article class="border-b border-stone-300 pb-2.5 mb-2.5 last:border-b-0 last:mb-0">
                    <div class="flex items-center justify-between gap-2 mb-1">
                        <span class="text-[9pt] font-mono font-bold uppercase tracking-wider text-[#8B0000]">${this.escapeHTML(slot.kicker || '')}</span>
                        <div class="flex items-center gap-1.5">${fitBadge}${editBtn}</div>
                    </div>
                    <h3 class="font-serif font-black text-[#111111] ${isCover && sIdx === 0 ? 'text-[19pt] leading-[1.08]' : 'text-[13pt] leading-[1.14]'} mb-1">${this.escapeHTML(slot.title || '')}</h3>
                    ${slot.subtitle ? `<p class="font-serif italic text-[9.5pt] text-stone-700 leading-snug mb-1.5">${this.escapeHTML(slot.subtitle)}</p>` : ''}
                    ${imgSrc ? `
                        <figure class="mb-1.5">
                            <img src="${this.escapeAttr(imgSrc)}" alt="" class="w-full ${isCover && sIdx === 0 ? 'h-[48mm]' : 'h-[32mm]'} object-cover border border-stone-300">
                            <figcaption class="text-[7.5pt] font-mono text-stone-600 italic mt-0.5">Fuente: ${this.escapeHTML(slot.mediaSource || 'ORBITAL REPORT')}</figcaption>
                        </figure>
                    ` : `<p class="text-[7.5pt] font-mono text-stone-600 mb-1">Fuente: ${this.escapeHTML(slot.mediaSource || 'ORBITAL REPORT')}</p>`}
                    <div style="font-size: ${fontPt}pt; line-height: 1.38;" class="font-serif text-[#1f2937]">${this.formatPrintEditorialText(slot.body || '')}</div>
                </article>`;
            }).join('');
            mainContentHtml = `<div class="space-y-2">${slotsHtml}</div>`;
        }

        let adHtml = '';
        if (page.adSlot) {
            const ad = page.adSlot;
            const adBtn = !forPrint ? `
                <div class="flex items-center gap-1">
                    <button type="button" onclick="ui.modalConfigurePrintAd(${pageIdx})" class="px-2 py-0.5 bg-[#8B0000] text-white hover:bg-[#111111] text-[10px] font-mono font-bold uppercase">📢 Configurar Anuncio</button>
                    ${ad.companyName ? `<button type="button" onclick="ui.clearPrintAdSlot(${pageIdx})" class="px-2 py-0.5 bg-white border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-[10px] font-mono font-bold uppercase" title="Quitar anuncio">✕</button>` : ''}
                </div>` : '';
            if (ad.companyName) {
                adHtml = `
                <div class="mt-auto border-2 border-[#111111] bg-[#EFECE4] p-2 flex items-center gap-2.5">
                    ${ad.imageUrl ? `<img src="${this.escapeAttr(ad.imageUrl)}" alt="" class="w-[18mm] h-[18mm] object-contain bg-white border border-stone-300 shrink-0">` : ''}
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-[7pt] font-mono uppercase tracking-widest text-[#8B0000] font-bold">ESPACIO PUBLICITARIO • CLASE ${this.escapeHTML(ad.classGroup || 'A')}</span>
                            ${adBtn}
                        </div>
                        <h4 class="font-serif font-black text-[10pt] text-[#111111] uppercase leading-tight">${this.escapeHTML(ad.companyName)}</h4>
                        ${ad.slogan ? `<p class="font-serif italic text-[8.5pt] text-[#111111] leading-tight">«${this.escapeHTML(ad.slogan)}»</p>` : ''}
                        ${ad.bodyText ? `<p class="font-sans text-[7.5pt] text-stone-700 mt-0.5 leading-tight">${this.escapeHTML(ad.bodyText)}</p>` : ''}
                    </div>
                </div>`;
            } else {
                adHtml = `
                <div class="mt-auto border border-dashed border-stone-400 bg-stone-100 p-2 flex items-center justify-between gap-2">
                    <span class="text-[8pt] font-mono text-stone-600 uppercase">[ ${this.escapeHTML(ad.label || 'Espacio Publicitario Startup')} ]</span>
                    ${adBtn}
                </div>`;
            }
        }

        const headerHtml = isCover ? `
            <div class="border-b-2 border-[#111111] pb-2 mb-3 text-center">
                <div class="flex justify-between text-[7.5pt] font-mono uppercase text-stone-600 border-b border-stone-300 pb-1 mb-1">
                    <span>${this.escapeHTML(ed.issueLabel || 'Edición n.º 1')}</span>
                    <span>MIRAVALLES-EL REDÍN</span>
                    <span>${this.escapeHTML(ed.dateLabel || '')}</span>
                </div>
                <h1 class="font-serif font-black text-[30pt] leading-none tracking-tight text-[#111111]">ORBITAL REPORT</h1>
                <p class="font-serif italic text-[9pt] text-stone-700 mt-0.5">Edición Impresa MARS-KET • «La Ciencia Despega a Plena Luz»</p>
            </div>
        ` : `
            <div class="flex justify-between items-center gap-2 border-b-2 border-[#111111] pb-1 mb-2 text-[8pt] font-mono uppercase text-[#111111]">
                <span class="font-bold truncate">ORBITAL REPORT // ${this.escapeHTML(page.sectionTitle || page.label)}</span>
                <div class="flex items-center gap-2 shrink-0">${pageControlsHtml}<span>PÁGINA ${page.pageNumber}</span></div>
            </div>
        `;

        return `
        <div class="bg-[#FAF8F5] text-[#111111] p-[9mm] flex flex-col justify-between h-full box-border overflow-hidden border border-stone-300">
            <div>
                ${headerHtml}
                ${mainContentHtml}
            </div>
            ${adHtml}
            <div class="pt-1.5 mt-1.5 border-t border-stone-300 flex justify-between text-[7pt] font-mono text-stone-500 uppercase">
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
        const pendingAds = this.getPendingPrintAdRequests().filter(a => a.status === 'VALIDADO_CEO');

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
                        <div class="space-y-2">
                            <div class="flex items-center justify-between text-xs font-mono text-amber-300 uppercase font-bold">
                                <span>🖨️ ${sp.title}</span>
                                <span>[ Pág. ${sp.leftIdx + 1} (Izq.) | Doblez Central | Pág. ${sp.rightIdx + 1} (Der.) ]</span>
                            </div>
                            <div class="grid grid-cols-1 lg:grid-cols-2 gap-0 border-2 border-amber-400/60 shadow-2xl overflow-hidden">
                                <div class="min-h-[540px] border-r border-dashed border-red-500">${this.renderPrintStudioPageHtml(ed, ed.pages[sp.leftIdx], sp.leftIdx, false)}</div>
                                <div class="min-h-[540px]">${this.renderPrintStudioPageHtml(ed, ed.pages[sp.rightIdx], sp.rightIdx, false)}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `
            : `
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    ${(ed.pages || []).map((pg, idx) => `
                        <div class="space-y-1.5">
                            <div class="flex items-center justify-between text-xs font-mono text-mars-cyan uppercase font-bold">
                                <span>📄 Página ${pg.pageNumber} — ${this.escapeHTML(pg.label)}</span>
                            </div>
                            <div class="min-h-[560px] shadow-xl">
                                ${this.renderPrintStudioPageHtml(ed, pg, idx, false)}
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
                        <h2 class="font-orbitron font-black text-base sm:text-xl text-white uppercase">🖨️ Estudio de Edición Impresa A3 // ORBITAL REPORT</h2>
                        <p class="text-xs text-slate-300 font-sans">8 páginas (4 caras A3 apaisadas con doblez en medio) · Estilo The Washington Post · Exclusivo Coordinación</p>
                    </div>
                    <div class="flex flex-wrap gap-2">
                        <button type="button" onclick="ui.closePrintEditionStudio()" class="min-h-[44px] px-4 py-2 bg-slate-800 border border-slate-600 text-white text-xs font-bold uppercase hover:bg-slate-700">⬅ Volver al Periódico Digital</button>
                        <button type="button" onclick="ui.printA3NewspaperPDF()" class="min-h-[44px] px-5 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white shadow-[0_0_15px_rgba(0,255,102,0.35)]">🖨️ Imprimir / Guardar PDF A3 (4 Caras)</button>
                    </div>
                </div>

                <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="flex flex-wrap items-center gap-2">
                        <select aria-label="Seleccionar edición mensual" onchange="ui.printStudioEditionId=this.value; ui.render();" class="min-h-[44px] bg-slate-900 border border-amber-400/60 px-3 py-2 text-xs text-white font-bold">
                            ${editions.map(e => `<option value="${this.escapeAttr(e.id)}" ${e.id === ed.id ? 'selected' : ''}>${this.escapeHTML(e.issueLabel)}</option>`).join('')}
                        </select>
                        <button type="button" onclick="ui.modalEditPrintEditionMeta()" class="min-h-[44px] px-3 py-2 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold uppercase hover:border-mars-cyan">✏️ Cabecera</button>
                        <button type="button" onclick="ui.createNewPrintEditionModal()" class="min-h-[44px] px-3 py-2 bg-amber-400 text-black text-xs font-black uppercase hover:bg-white">+ Nueva Edición</button>
                        <button type="button" onclick="ui.autoLayoutPrintEdition(false)" class="min-h-[44px] px-3 py-2 bg-mars-cyan text-black text-xs font-black uppercase hover:bg-white">⚡ Auto-Maquetar Noticias</button>
                    </div>
                    <div class="flex items-center border border-slate-700 bg-black p-0.5">
                        <button type="button" onclick="ui.printStudioViewMode='reading'; ui.render();" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase ${mode === 'reading' ? 'bg-mars-cyan text-black' : 'text-slate-300'}">📖 Págs. 1–8</button>
                        <button type="button" onclick="ui.printStudioViewMode='imposed'; ui.render();" class="min-h-[44px] px-3 py-1.5 text-xs font-mono font-bold uppercase ${mode === 'imposed' ? 'bg-amber-400 text-black' : 'text-slate-300'}">🖨️ 4 Caras A3</button>
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
    <title>ORBITAL REPORT — ${this.escapeHTML(ed.issueLabel || 'Edición A3')}</title>
    <style>
        @page { size: A3 landscape; margin: 0; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { margin: 0; padding: 0; background: #1e293b; font-family: Georgia, "Times New Roman", serif; color: #111111; }
        .no-print { position: sticky; top: 0; z-index: 99; background: #0b1120; color: #fff; padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #00f0ff; font-family: monospace; font-size: 12px; }
        .btn-p { background: #00ff66; color: #000; border: 0; padding: 10px 18px; font-weight: 900; cursor: pointer; text-transform: uppercase; }
        .a3-sheet { width: 420mm; height: 297mm; margin: 12px auto; background: #FAF8F5; display: grid; grid-template-columns: 210mm 210mm; page-break-after: always; break-after: page; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .a4-half { width: 210mm; height: 297mm; overflow: hidden; }
        .left-half { border-right: 0.5pt dashed #cbd5e1; }
        @media print {
            body { background: #FAF8F5; }
            .no-print { display: none !important; }
            .a3-sheet { margin: 0; box-shadow: none; }
        }
    </style>
    <link rel="stylesheet" href="${window.location.origin}/css/tailwind.css">
</head>
<body>
    <div class="no-print">
        <span>🖨️ ORBITAL REPORT (${this.escapeHTML(ed.issueLabel)}) — 4 Caras A3 Apaisadas (Impresión a doble cara y doblez en el centro = 8 Páginas)</span>
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
        this.notify("🖨️ Maqueta A3 lista en nueva pestaña para imprimir o guardar como PDF.", "success");
    }
});
