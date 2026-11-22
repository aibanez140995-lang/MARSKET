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
                label: 'Economía y Contratos',
                sectionTitle: 'ECONOMÍA ESPACIAL, CONTRATOS Y LIDERAZGO',
                slots: [
                    { id: 'p7-a1', role: 'article', kicker: 'ECONOMÍA & FINANZAS', title: 'Licitaciones Comerciales del Mes', subtitle: '', body: 'Estado de los contratos comerciales y disciplina presupuestaria en €v.', imageUrl: '', mediaSource: 'Economía AEE', fontSizePt: 9.5 },
                    { id: 'p7-a2', role: 'article', kicker: 'GOBERNANZA', title: 'Liderazgo y Decisiones del Consejo', subtitle: '', body: 'Buenas prácticas de dirección general y coordinación departamental.', imageUrl: '', mediaSource: 'Liderazgo LyE', fontSizePt: 9 }
                ],
                adSlot: { id: 'ad-p7', label: 'Faldón Publicitario Pág. 7', coId: '', companyName: '', classGroup: '', slogan: '', bodyText: '', imageUrl: '', actId: '', campId: '' }
            },
            {
                pageNumber: 8,
                label: 'Contraportada',
                sectionTitle: 'CONTRAPORTADA // MIRADA AL FUTURO',
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
                    <div class="flex justify-between items-center mb-1">
                        <label for="print-slot-body" class="text-[11px] text-amber-300 font-bold uppercase">Cuerpo de la Noticia (Castellano)</label>
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
                    <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'print-ad-img-data', 'print-ad-img-preview')" class="w-full text-xs text-slate-300">
                    <input type="url" id="print-ad-img-url" value="${(ad.imageUrl && ad.imageUrl.startsWith('http')) ? this.escapeAttr(ad.imageUrl) : ''}" oninput="ui.previewNanoBananaUrl(this.value, 'print-ad-img-preview')" placeholder="O pega URL de imagen..." class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2 text-xs text-white font-mono">
                    <input type="hidden" id="print-ad-img-data" value="${this.escapeAttr(ad.imageUrl || '')}">
                    <div id="print-ad-img-preview" class="hidden"></div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] px-4 py-2 bg-slate-800 text-white text-xs font-bold uppercase">Cancelar</button>
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

    renderPrintStudioPageHtml(ed, page, pageIdx, forPrint = false) {
        const isCover = page.pageNumber === 1;
        const slotsHtml = (page.slots || []).map((slot, sIdx) => {
            const imgSrc = slot.imageUrl ? (this.getNewsImageSrc ? this.getNewsImageSrc(slot.imageUrl) : slot.imageUrl) : '';
            const fontPt = Number(slot.fontSizePt || 9.5);
            const editBtn = !forPrint ? `<button type="button" onclick="ui.modalEditPrintSlot(${pageIdx}, ${sIdx})" class="px-2 py-0.5 bg-[#111111] text-white hover:bg-[#8B0000] text-[10px] font-mono font-bold uppercase">✏️ Editar</button>` : '';
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
                <p style="font-size: ${fontPt}pt; line-height: 1.38;" class="font-serif text-[#1f2937] whitespace-pre-line text-justify">${this.escapeHTML(slot.body || '')}</p>
            </article>`;
        }).join('');

        let adHtml = '';
        if (page.adSlot) {
            const ad = page.adSlot;
            const adBtn = !forPrint ? `<button type="button" onclick="ui.modalConfigurePrintAd(${pageIdx})" class="px-2 py-0.5 bg-[#8B0000] text-white hover:bg-[#111111] text-[10px] font-mono font-bold uppercase">📢 Configurar Anuncio</button>` : '';
            if (ad.companyName) {
                adHtml = `
                <div class="mt-auto border-2 border-[#111111] bg-[#EFECE4] p-2.5 flex items-center gap-3">
                    ${ad.imageUrl ? `<img src="${this.escapeAttr(ad.imageUrl)}" alt="" class="w-[22mm] h-[22mm] object-contain bg-white border border-stone-300 shrink-0">` : ''}
                    <div class="min-w-0 flex-1">
                        <div class="flex items-center justify-between gap-2">
                            <span class="text-[7.5pt] font-mono uppercase tracking-widest text-[#8B0000] font-bold">ESPACIO PUBLICITARIO • CLASE ${this.escapeHTML(ad.classGroup || 'A')}</span>
                            ${adBtn}
                        </div>
                        <h4 class="font-serif font-black text-[11pt] text-[#111111] uppercase">${this.escapeHTML(ad.companyName)}</h4>
                        ${ad.slogan ? `<p class="font-serif italic text-[9pt] text-[#111111]">«${this.escapeHTML(ad.slogan)}»</p>` : ''}
                        ${ad.bodyText ? `<p class="font-sans text-[8pt] text-stone-700 mt-0.5">${this.escapeHTML(ad.bodyText)}</p>` : ''}
                    </div>
                </div>`;
            } else {
                adHtml = `
                <div class="mt-auto border border-dashed border-stone-400 bg-stone-100 p-2.5 flex items-center justify-between gap-2">
                    <span class="text-[8.5pt] font-mono text-stone-600 uppercase">[ ${this.escapeHTML(ad.label || 'Espacio Publicitario Startup')} ]</span>
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
            <div class="flex justify-between items-center border-b-2 border-[#111111] pb-1 mb-2.5 text-[8pt] font-mono uppercase text-[#111111]">
                <span class="font-bold">ORBITAL REPORT // ${this.escapeHTML(page.sectionTitle || page.label)}</span>
                <span>PÁGINA ${page.pageNumber}</span>
            </div>
        `;

        return `
        <div class="bg-[#FAF8F5] text-[#111111] p-[10mm] flex flex-col justify-between h-full box-border overflow-hidden border border-stone-300">
            <div>
                ${headerHtml}
                <div class="space-y-2">${slotsHtml}</div>
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
