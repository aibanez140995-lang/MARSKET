// js/ui-orbita.js
// --- PERIÓDICO ESCOLAR «ÓRBITA.» (EDICIÓN DIGITAL, HEMEROTECA, TOP 10, BORRADORES Y TELETIPO) ---

Object.assign(ui, {
    getOrbitaIcon(key) {
        if (typeof ORBITA_ICONS !== 'undefined' && ORBITA_ICONS[key]) {
            return ORBITA_ICONS[key];
        }
        return '';
    },

    getOrbitaSections() {
        return (typeof ORBITA_SECTIONS !== 'undefined' && Array.isArray(ORBITA_SECTIONS)) ? ORBITA_SECTIONS : [];
    },

    getOrbitaSectionMeta(sectionId) {
        const list = this.getOrbitaSections();
        return list.find(s => s.id === sectionId) || list[0] || {
            id: 'portada',
            shortLabelEs: 'Portada',
            shortLabelEn: 'Front Page',
            titleEs: 'Portada',
            titleEn: 'Front Page',
            subtitleEs: '',
            subtitleEn: '',
            kind: 'front',
            wireQuery: null,
            iconKey: 'portada'
        };
    },

    getOrbitaEditionNumber() {
        const raw = Number(state?.data?.config?.orbita?.currentEditionNumber);
        return (Number.isFinite(raw) && raw >= 0) ? Math.floor(raw) : 0;
    },

    formatOrbitaParagraphs(text, pClass = 'mb-3') {
        const clean = String(text || '').trim();
        if (!clean) return '';
        return clean
            .split(/\n{2,}/)
            .map(p => `<p class="${pClass}">${this.escapeHTML(p.trim()).replace(/\n/g, '<br>')}</p>`)
            .join('');
    },

    modalViewNewsImage(imageUrl, caption, sourceLabel = '') {
        if (!imageUrl) return;
        const srcText = String(sourceLabel || '').trim() || 'Archivo gráfico · Órbita.';
        const html = `
            <div class="flex flex-col items-center">
                <div class="relative max-h-[75vh] w-full flex items-center justify-center bg-black/90 p-2 rounded border border-slate-700 overflow-hidden">
                    <img src="${this.escapeAttr(imageUrl)}" alt="${this.escapeAttr(caption || 'Imagen de Órbita')}" class="max-h-[70vh] max-w-full object-contain rounded shadow-2xl">
                </div>
                ${caption ? `<p class="mt-3 text-xs sm:text-sm font-orbita-serif text-slate-100 text-center font-bold">${this.escapeHTML(caption)}</p>` : ''}
                <div class="mt-2 flex items-center gap-1.5 text-[11px] text-slate-300 font-mono">
                    <span>Fuente: ${this.escapeHTML(srcText)}</span>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-900 border border-slate-700 text-white hover:bg-white hover:text-black px-6 py-2 text-xs font-bold uppercase transition-all">Cerrar Visor</button>`;
        this.showModal("Visor de Fotografía // Órbita.", html, actions);
    },

    isNewsCoordinator() {
        if (!state.user || !state.user.admin) return false;
        const r = String(state.user.role || '').toUpperCase();
        return r.startsWith('COORD') || r === 'COORDINADOR';
    },

    canModeratePressReleases() {
        if (!state.user || !state.user.admin) return false;
        const r = String(state.user.role || '').toUpperCase();
        return r === 'LEN' || r.startsWith('COORD') || r === 'COORDINADOR';
    },

    getNewsLang() {
        return (this.newsLang === 'EN') ? 'EN' : 'ES';
    },

    setNewsLang(lang) {
        this.newsLang = (lang === 'EN') ? 'EN' : 'ES';
        this.render();
    },

    getLocalizedNewsField(art, fieldBase) {
        if (!art) return '';
        const lang = this.getNewsLang();
        if (lang === 'EN') {
            const enVal = art[`${fieldBase}En`];
            if (enVal && String(enVal).trim() !== '') return String(enVal);
        }
        return String(art[fieldBase] || '');
    },

    getNewsImageSrc(rawUrl) {
        const raw = String(rawUrl || '').trim();
        if (!raw) return '';
        if (raw.startsWith('data:image/')) return raw;
        const driveMatch = raw.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i)
            || raw.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/i);
        if (driveMatch && driveMatch[1]) {
            return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1600`;
        }
        if (/^https?:\/\//i.test(raw)) {
            return `/api/news/image?url=${encodeURIComponent(raw)}`;
        }
        return raw;
    },

    scrollToOrbitaColophon() {
        const wasReaderOpen = Boolean(this.activeFullArticleReader);
        if (wasReaderOpen) {
            this.activeFullArticleReader = null;
            this.viewNewsBoard();
        }
        setTimeout(() => {
            const target = document.getElementById('orbita-colophon');
            if (target && typeof target.scrollIntoView === 'function') {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, wasReaderOpen ? 60 : 10);
    },

    getSpaceflightWireFallback(sec = 'lanzamientos') {
        const common = [
            {
                id: 'fallback-artemis-ii',
                section: 'nasa',
                title: 'NASA Completes Core Integration Checks for Artemis Lunar Architecture',
                titleEs: 'La NASA completa nuevas comprobaciones de integración para el programa lunar Artemis',
                summary: 'NASA engineers advanced life-support and cryogenic propellant verification ahead of upcoming lunar flight milestones.',
                summaryEs: 'Ingenieros de la NASA completaron verificaciones del sistema de soporte vital y propelentes criogénicos de cara a las próximas misiones lunares.',
                news_site: 'Spaceflight Archive',
                published_at: '2026-11-20T09:00:00Z',
                url: 'https://www.nasa.gov/artemis',
                image_url: ''
            },
            {
                id: 'fallback-ariane-6',
                section: 'lanzamientos',
                title: 'European Ariane 6 Campaign Prepares Multi-Payload Deployment from Kourou',
                titleEs: 'La campaña europea del Ariane 6 prepara un nuevo despliegue orbital desde Kourou',
                summary: 'Arianespace and ESA teams completed upper-stage Vinci checks for upcoming orbital missions from French Guiana.',
                summaryEs: 'Equipos de Arianespace y la ESA concluyeron las pruebas de la etapa superior Vinci para los próximos lanzamientos desde la Guayana Francesa.',
                news_site: 'ESA Launch Wire',
                published_at: '2026-11-19T14:30:00Z',
                url: 'https://www.esa.int',
                image_url: ''
            },
            {
                id: 'fallback-optical-tech',
                section: 'tecnologia',
                title: 'Optical Laser Relays Boost Deep-Space and LEO Telemetry Bandwidth',
                titleEs: 'Los enlaces láser ópticos multiplican el ancho de banda de telemetría espacial',
                summary: 'Next-generation optical terminals allow spacecraft to transmit high-rate telemetry using narrow infrared beams.',
                summaryEs: 'Los terminales ópticos de nueva generación permiten transmitir telemetría de alta capacidad mediante haces infrarrojos de precisión.',
                news_site: 'Aerospace Tech Wire',
                published_at: '2026-11-18T11:15:00Z',
                url: 'https://www.jpl.nasa.gov',
                image_url: ''
            },
            {
                id: 'fallback-newspace-ind',
                section: 'industria',
                title: 'European Aerospace Supply Chain Expands Milestone Contracts for Small Satellites',
                titleEs: 'La cadena industrial aeroespacial europea amplía los contratos por hitos para pequeños satélites',
                summary: 'Specialized avionics, propulsion, and structure suppliers report steady B2B growth across European missions.',
                summaryEs: 'Proveedores especializados de aviónica, propulsión y estructuras registran crecimiento B2B sostenido en misiones europeas.',
                news_site: 'Space Economy Wire',
                published_at: '2026-11-17T16:00:00Z',
                url: 'https://www.esa.int',
                image_url: ''
            }
        ];
        const filtered = common.filter(it => it.section === sec);
        return filtered.length > 0 ? filtered : common;
    },

    async autoTranslateText(text, from = 'es', to = 'en') {
        const clean = String(text || '').trim();
        if (!clean || from === to) return clean;
        try {
            const resp = await fetch('/api/news/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: clean, from, to })
            });
            if (resp.ok) {
                const data = await resp.json();
                if (data && typeof data.translatedText === 'string' && data.translatedText.trim() !== '') {
                    return data.translatedText.trim();
                }
            }
        } catch (e) {}
        return clean;
    },

    async fetchSpaceflightWire(section = 'lanzamientos', force = false) {
        const sec = ['nasa', 'lanzamientos', 'tecnologia', 'industria'].includes(section) ? section : 'lanzamientos';
        const cacheKey = `orbita_snapi_wire_v3_${sec}`;
        const TTL_MS = 15 * 60 * 1000;
        this._snapiWireBySection = this._snapiWireBySection || {};
        this._snapiWireReqSeq = (this._snapiWireReqSeq || 0) + 1;
        const reqId = this._snapiWireReqSeq;

        if (!force && this._snapiWireBySection[sec]?.items?.length > 0) {
            this.renderSpaceflightWireIntoDom(sec);
            return this._snapiWireBySection[sec].items;
        }
        if (!force) {
            try {
                const raw = sessionStorage.getItem(cacheKey);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0 && (Date.now() - (parsed.ts || 0)) < TTL_MS) {
                        this._snapiWireBySection[sec] = {
                            items: parsed.items,
                            cachedAt: parsed.cachedAt || Math.floor((parsed.ts || Date.now()) / 1000),
                            source: 'cache',
                            isFallback: false
                        };
                        this.renderSpaceflightWireIntoDom(sec);
                        return parsed.items;
                    }
                }
            } catch (e) {}
        }

        const listEl = document.getElementById('orbital-wire-list');
        if (listEl) {
            const lang = this.getNewsLang();
            listEl.innerHTML = `<p class="text-xs font-mono text-stone-600 p-3 col-span-full">${lang === 'EN' ? 'Refreshing aerospace wire...' : 'Actualizando cables internacionales...'}</p>`;
        }

        let loaded = false;
        let payloadMeta = { cachedAt: Math.floor(Date.now() / 1000), source: 'live' };
        try {
            const headers = {};
            if (force && state?.token) {
                headers['X-Marsket-Auth'] = state.token;
            }
            const resp = await fetch(`/api/news/wire?section=${encodeURIComponent(sec)}&force=${force ? '1' : '0'}`, {
                method: 'GET',
                headers
            });
            if (resp.status === 429) {
                const errData = await resp.json().catch(() => ({}));
                this.notify(`Espera ${errData.retryAfterSec || 60} s antes de volver a forzar la recarga.`, 'info');
                if (this._snapiWireBySection[sec]?.items?.length > 0) {
                    this.renderSpaceflightWireIntoDom(sec);
                    return this._snapiWireBySection[sec].items;
                }
            } else if (resp.ok) {
                const data = await resp.json();
                const items = Array.isArray(data?.results) ? data.results : [];
                if (items.length > 0) {
                    payloadMeta = {
                        cachedAt: Number(data.cachedAt) || Math.floor(Date.now() / 1000),
                        source: String(data.source || 'live')
                    };
                    this._snapiWireBySection[sec] = {
                        items,
                        cachedAt: payloadMeta.cachedAt,
                        source: payloadMeta.source,
                        isFallback: false
                    };
                    loaded = true;
                    try {
                        sessionStorage.setItem(cacheKey, JSON.stringify({ ts: Date.now(), cachedAt: payloadMeta.cachedAt, items }));
                    } catch (e) {}
                    if (force) {
                        this.notify('Teletipo actualizado desde redacción.', 'success');
                    }
                }
            }
        } catch (e) {}

        if (!loaded) {
            this._snapiWireBySection[sec] = {
                items: this.getSpaceflightWireFallback(sec),
                cachedAt: Math.floor(Date.now() / 1000),
                source: 'offline_fallback',
                isFallback: true
            };
        }

        if (reqId === this._snapiWireReqSeq && this.newsSectionTab === sec) {
            this.renderSpaceflightWireIntoDom(sec);
        }
        return this._snapiWireBySection[sec].items;
    },

    renderSpaceflightWireIntoDom(sec) {
        const el = document.getElementById('orbital-wire-list');
        if (!el) return;
        const activeSec = sec || this.newsSectionTab || 'lanzamientos';
        const entry = (this._snapiWireBySection && this._snapiWireBySection[activeSec]) || { items: [], isFallback: false, cachedAt: 0 };
        const items = Array.isArray(entry.items) ? entry.items : [];
        const isCoord = this.isNewsCoordinator();
        const lang = this.getNewsLang();

        const tsEl = document.getElementById('orbital-wire-updated-at');
        if (tsEl && entry.cachedAt) {
            const hhmm = new Date(entry.cachedAt * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            tsEl.textContent = `${lang === 'EN' ? 'Updated' : 'Actualizado'} ${hhmm}`;
        }

        if (items.length === 0) {
            el.innerHTML = `<p class="text-xs text-stone-600 font-orbita-serif p-2 col-span-full">${lang === 'EN' ? 'No live dispatches available.' : 'Sin teletipos disponibles en este momento.'}</p>`;
            return;
        }

        el.innerHTML = `
            ${entry.isFallback ? `
                <div class="col-span-full mb-1 px-2.5 py-1 bg-amber-50 border border-amber-300 text-[10px] font-mono text-amber-900">
                    ${lang === 'EN' ? 'Offline Archive · Curated Aerospace Dispatches' : 'Edición de Respaldo · Cables Aeroespaciales'}
                </div>
            ` : ''}
            ${items.map((art, idx) => {
                const imgSrc = art.proxy_image_url || this.getNewsImageSrc(art.image_url);
                const dateStr = art.published_at ? new Date(art.published_at).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short' }) : '';
                const displayTitle = (lang === 'ES' && art.titleEs) ? art.titleEs : (art.title || '');
                return `
                <article class="py-3 border-b border-stone-300 bg-white">
                    <div class="flex gap-3 items-start">
                        ${imgSrc ? `<img src="${this.escapeAttr(imgSrc)}" alt="${this.escapeAttr(displayTitle)}" loading="lazy" onclick="ui.openWireArticleFullReader(${idx}, '${this.escapeAttr(activeSec)}')" class="w-20 h-14 object-cover border border-stone-300 shrink-0 bg-stone-200 cursor-pointer">` : ''}
                        <div class="min-w-0 flex-1">
                            <div class="flex items-center justify-between gap-2 text-[10px] font-mono text-[#8B0000] uppercase mb-1 font-bold">
                                <span class="truncate">${this.escapeHTML(art.news_site || 'Aerospace Wire')}</span>
                                <span class="text-stone-500 shrink-0">${this.escapeHTML(dateStr)}</span>
                            </div>
                            <button type="button" onclick="ui.openWireArticleFullReader(${idx}, '${this.escapeAttr(activeSec)}')" class="text-left w-full text-sm font-orbita-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug mb-2 break-words transition-colors">
                                ${this.escapeHTML(displayTitle)}
                            </button>
                            <div class="flex items-center gap-1.5 flex-wrap">
                                <button type="button" onclick="ui.openWireArticleFullReader(${idx}, '${this.escapeAttr(activeSec)}')" class="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1 bg-white border border-stone-400 hover:border-[#111111] hover:bg-[#111111] hover:text-white text-[#111111] text-[11px] font-mono font-bold uppercase transition-colors">
                                    ${this.getOrbitaIcon('book')}
                                    <span>${lang === 'EN' ? 'Read Full' : 'Leer Completa'}</span>
                                </button>
                                ${isCoord ? `
                                    <button type="button" onclick="ui.quickPublishSnapiToBoard(${idx}, '${this.escapeAttr(activeSec)}')" class="min-h-[44px] inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#111111] text-white hover:bg-[#8B0000] text-[11px] font-mono font-bold uppercase transition-colors">
                                        ${this.getOrbitaIcon('star')}
                                        <span>Incorporar a Órbita</span>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </article>`;
            }).join('')}
        `;
    },

    openEditorFromSnapiIndex(idx, sec) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido a Coordinación.", "error");
        const activeSec = sec || this.newsSectionTab || 'lanzamientos';
        const items = this._snapiWireBySection?.[activeSec]?.items || [];
        const art = items[idx] || null;
        this.modalPublishOfficialNews(art, activeSec);
    },

    async loadSnapiImporterList() {
        const listEl = document.getElementById('snapi-importer-results');
        const qEl = document.getElementById('snapi-importer-query');
        if (!listEl) return;
        const q = qEl ? qEl.value.trim() : 'rocket';
        listEl.innerHTML = `<p class="text-[11px] font-mono text-mars-cyan p-2">Conectando con Spaceflight News API v4 vía servidor...</p>`;
        try {
            const url = `/api/news/wire?q=${encodeURIComponent(q || 'rocket')}`;
            const resp = await fetch(url);
            if (!resp.ok) throw new Error('HTTP_' + resp.status);
            const data = await resp.json();
            const items = Array.isArray(data?.results) ? data.results : [];
            this._snapiImporterItems = items;
            if (items.length === 0) {
                listEl.innerHTML = `<p class="text-[11px] font-mono text-slate-400 p-2">Sin resultados para "${this.escapeHTML(q)}". Prueba con "rocket", "SpaceX" o "NASA".</p>`;
                return;
            }
            listEl.innerHTML = items.map((a, i) => `
                <div class="p-2 bg-slate-900 border border-slate-700 flex items-center justify-between gap-2 flex-wrap">
                    <div class="min-w-0 flex-1">
                        <span class="text-[10px] font-mono text-mars-cyan uppercase block">${this.escapeHTML(a.news_site || 'SNAPI')}</span>
                        <span class="text-xs text-white font-bold line-clamp-2">${this.escapeHTML(a.titleEs || a.title || '')}</span>
                    </div>
                    <div class="flex items-center gap-1.5 shrink-0">
                        <button type="button" onclick="ui.quickPublishSnapiToBoard(${i}, 'importer')" class="min-h-[44px] px-3 py-1.5 bg-amber-400 text-black font-black text-[11px] uppercase hover:bg-white transition-colors">
                            Incorporar
                        </button>
                        <button type="button" onclick="ui.applySnapiImporterItem(${i})" class="min-h-[44px] px-3 py-1.5 bg-slate-800 border border-slate-600 text-slate-200 font-bold text-[11px] uppercase hover:bg-slate-700 transition-colors">
                            Al editor
                        </button>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            listEl.innerHTML = `<p class="text-[11px] font-mono text-amber-400 p-2">Error conectando con el servidor de noticias.</p>`;
        }
    },

    applySnapiImporterItem(idx) {
        const items = Array.isArray(this._snapiImporterItems) ? this._snapiImporterItems : [];
        const art = items[idx];
        if (!art) return;
        const tEl = document.getElementById('offnews-title');
        const subEl = document.getElementById('offnews-subtitle');
        const bodyEl = document.getElementById('offnews-body');
        const tEnEl = document.getElementById('offnews-title-en');
        const subEnEl = document.getElementById('offnews-subtitle-en');
        const bodyEnEl = document.getElementById('offnews-body-en');
        const srcEl = document.getElementById('offnews-source-name');
        const urlEl = document.getElementById('offnews-source-url');
        const imgUrlEl = document.getElementById('offnews-img-url');
        if (tEl) tEl.value = art.titleEs || art.title || '';
        if (tEnEl) tEnEl.value = art.title || '';
        if (subEl) subEl.value = art.summaryEs || art.summary || '';
        if (subEnEl) subEnEl.value = art.summary || '';
        if (bodyEl) bodyEl.value = art.summaryEs || art.summary || '';
        if (bodyEnEl) bodyEnEl.value = art.summary || '';
        if (srcEl) srcEl.value = art.news_site || 'Spaceflight News';
        if (urlEl) urlEl.value = art.url || '';
        if (imgUrlEl) imgUrlEl.value = art.image_url || '';
        this.previewNanoBananaUrl(art.image_url || '', 'offnews-img-preview');
        this.notify("Datos cargados en el editor. Revisa y guarda como borrador o publicado.", "success");
    },

    async quickPublishSnapiToBoard(idx, sourceType = 'lanzamientos') {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede incorporar noticias a Órbita.", "error");
        if (this._publishingSnapiLock) return;
        this._publishingSnapiLock = true;
        try {
            const list = sourceType === 'importer'
                ? (Array.isArray(this._snapiImporterItems) ? this._snapiImporterItems : [])
                : (this._snapiWireBySection?.[sourceType]?.items || []);
            const art = list[idx];
            if (!art || !art.url) {
                return this.notify("Artículo sin enlace de origen válido.", "error");
            }
            const targetSection = ['nasa', 'lanzamientos', 'tecnologia', 'industria'].includes(sourceType)
                ? sourceType
                : (['nasa', 'lanzamientos', 'tecnologia', 'industria'].includes(this.newsSectionTab) ? this.newsSectionTab : 'lanzamientos');

            const existingList = Array.isArray(state.data.news) ? state.data.news : [];
            const alreadySaved = existingList.find(n => n && n.sourceUrl && n.sourceUrl === art.url);
            if (alreadySaved) {
                return this.notify("Esta noticia ya está incorporada en Órbita.", "info");
            }

            this.notify("Descargando y traduciendo artículo completo en el servidor...", "info");
            const qs = new URLSearchParams({
                url: art.url,
                title: art.title || '',
                summary: art.summary || '',
                site: art.news_site || 'Aerospace Press',
                img: art.image_url || ''
            });
            const resp = await fetch('/api/news/article?' + qs.toString());
            if (!resp.ok) throw new Error('HTTP_' + resp.status);
            const data = await resp.json();

            const titleEn = String(data.titleEn || art.title || '').trim();
            const titleEs = String(data.titleEs || art.titleEs || titleEn).trim();
            const subtitleEn = String(data.subtitleEn || art.summary || '').trim();
            const subtitleEs = String(data.subtitleEs || art.summaryEs || subtitleEn).trim();
            const bodyEn = String(data.bodyEn || subtitleEn).trim();
            const bodyEs = String(data.bodyEs || subtitleEs).trim();

            const curEd = this.getOrbitaEditionNumber();
            const nowTs = Date.now();
            const newId = 'NEWS-' + nowTs;
            const secMeta = this.getOrbitaSectionMeta(targetSection);

            state.data.news = state.data.news || [];
            const item = state.normalizeNewsItem({
                id: newId,
                userEdited: true,
                section: targetSection,
                origin: 'REAL',
                status: 'PUBLISHED',
                editionNumber: curEd,
                category: String(secMeta.titleEs || 'ACTUALIDAD').toUpperCase(),
                categoryEn: String(secMeta.titleEn || 'NEWS').toUpperCase(),
                title: titleEs,
                subtitle: subtitleEs,
                body: bodyEs,
                titleEn,
                subtitleEn,
                bodyEn,
                imageUrl: data.imageUrl || art.image_url || null,
                sourceName: data.sourceName || art.news_site || 'Aerospace Press',
                sourceUrl: art.url,
                publishedAt: nowTs,
                updatedAt: nowTs,
                placementUpdatedAt: nowTs,
                publishedDate: new Date(nowTs).toLocaleDateString('es-ES'),
                placement: 'archive',
                featured: false,
                phase: 'ALL',
                classGroup: 'ALL',
                author: state.user?.name || 'Coordinación AEE'
            });
            if (item) {
                state.data.news.unshift(item);
                state.data.news = state.resolveFeaturedNews(state.data.news);
            }
            this.newsSectionTab = targetSection;
            this.render();
            state.save();
            this.notify(`Artículo incorporado a «${secMeta.titleEs}» (Edición N.º ${curEd}).`, "success");
        } catch (err) {
            this.notify("No se pudo extraer el artículo completo. Prueba con otro o usa el editor manual.", "error");
        } finally {
            this._publishingSnapiLock = false;
        }
    },

    modalPublishOfficialNews(prefillSnapi = null, defaultSection = null) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido a Coordinación.", "error");
        const curEd = this.getOrbitaEditionNumber();
        const articleSections = this.getOrbitaSections().filter(s => s.kind === 'articles');
        const initSec = articleSections.some(s => s.id === defaultSection)
            ? defaultSection
            : (articleSections.some(s => s.id === this.newsSectionTab) ? this.newsSectionTab : 'industria');

        const pTitleEs = prefillSnapi ? (prefillSnapi.titleEs || prefillSnapi.title || '') : '';
        const pTitleEn = prefillSnapi ? (prefillSnapi.title || '') : '';
        const pSubEs = prefillSnapi ? (prefillSnapi.summaryEs || prefillSnapi.summary || '') : '';
        const pSubEn = prefillSnapi ? (prefillSnapi.summary || '') : '';
        const pSrcName = prefillSnapi ? (prefillSnapi.news_site || 'Spaceflight News') : 'Consejo Editorial AEE';
        const pSrcUrl = prefillSnapi ? (prefillSnapi.url || '') : '';
        const pImgUrl = prefillSnapi ? (prefillSnapi.image_url || '') : '';

        const html = `
            <div class="space-y-4">
                <div class="bg-slate-900/90 border border-slate-700 p-3 rounded">
                    <div class="flex items-center justify-between gap-2 mb-2 flex-wrap">
                        <span class="text-[11px] font-mono text-mars-cyan font-bold uppercase">Importador de Noticias Reales (Spaceflight News API v4)</span>
                        <button type="button" onclick="ui.loadSnapiImporterList()" class="min-h-[44px] px-3 py-1 bg-cyan-950 border border-cyan-500/50 text-cyan-300 text-[11px] font-bold uppercase hover:bg-cyan-900">Buscar en API</button>
                    </div>
                    <input type="text" id="snapi-importer-query" value="rocket" placeholder="Ej: SpaceX, Artemis, NASA, ESA..." class="mars-touch-input w-full bg-black border border-slate-700 p-2 text-xs text-white font-mono">
                    <div id="snapi-importer-results" class="mt-2 space-y-1.5 max-h-40 overflow-y-auto"></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-amber-300 uppercase block mb-1 font-bold">Sección de Órbita *</label>
                        <select id="offnews-section" class="mars-touch-input w-full bg-slate-950 border border-amber-500/40 p-2.5 text-sm text-white">
                            ${articleSections.map(s => `<option value="${this.escapeAttr(s.id)}" ${initSec === s.id ? 'selected' : ''}>${this.escapeHTML(s.titleEs)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Estado y Edición de Salida *</label>
                        <select id="offnews-publish-mode" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white">
                            <option value="DRAFT" selected>Guardar como BORRADOR (Edición N.º ${curEd + 1} · Oculto)</option>
                            <option value="PUBLISHED">Publicar ahora en Edición N.º ${curEd} (Visible)</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Origen del Contenido *</label>
                        <select id="offnews-origin" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white">
                            <option value="REAL" selected>ACTUALIDAD REAL (Periodismo / Ciencia)</option>
                            <option value="SIMULATION">SIMULACIÓN MARS-KET (Aula / DOC_15)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Ubicación en Portada (si se publica)</label>
                        <select id="offnews-placement" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white">
                            <option value="archive" selected>Artículo de su sección</option>
                            <option value="front">Noticia Principal de Portada</option>
                            <option value="sub">Sub-portada destacada (Nivel 2)</option>
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Antetítulo (ES)</label>
                        <input type="text" id="offnews-category" value="${this.escapeAttr(this.getOrbitaSectionMeta(initSec).titleEs.toUpperCase())}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-amber-300 uppercase font-mono">
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Kicker (EN)</label>
                        <input type="text" id="offnews-category-en" value="${this.escapeAttr(this.getOrbitaSectionMeta(initSec).titleEn.toUpperCase())}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-cyan-300 uppercase font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Titular (Español) *</label>
                        <input type="text" id="offnews-title" value="${this.escapeAttr(pTitleEs)}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white">
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Headline (English)</label>
                        <input type="text" id="offnews-title-en" value="${this.escapeAttr(pTitleEn)}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Entradilla (Español)</label>
                        <textarea id="offnews-subtitle" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200">${this.escapeHTML(pSubEs)}</textarea>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Subheadline (English)</label>
                        <textarea id="offnews-subtitle-en" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200">${this.escapeHTML(pSubEn)}</textarea>
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Cuerpo del Artículo (Español) *</label>
                        <textarea id="offnews-body" rows="5" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white leading-relaxed">${this.escapeHTML(pSubEs)}</textarea>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Article Body (English — auto si vacío)</label>
                        <textarea id="offnews-body-en" rows="5" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2.5 text-sm text-white leading-relaxed">${this.escapeHTML(pSubEn)}</textarea>
                    </div>
                </div>

                <div class="bg-slate-900 border border-slate-700 p-3 space-y-2 rounded">
                    <label class="text-[11px] font-mono text-amber-300 uppercase block font-bold">Imagen / Portada</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-img-data', 'offnews-img-preview', 'offnews-img-url')" class="mars-touch-input w-full text-xs text-slate-300 bg-slate-950 border border-slate-700 p-2">
                        <input type="url" id="offnews-img-url" value="${this.escapeAttr(pImgUrl)}" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-img-preview')" placeholder="O pega enlace https://..." class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                    </div>
                    <input type="hidden" id="offnews-img-data" value="">
                    <div id="offnews-img-preview" class="hidden"></div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Fuente / Autor</label>
                        <input type="text" id="offnews-source-name" value="${this.escapeAttr(pSrcName)}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white">
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Enlace externo de referencia</label>
                        <input type="url" id="offnews-source-url" value="${this.escapeAttr(pSrcUrl)}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                    </div>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-amber-300 uppercase block mb-1">Conexión MARS-KET (ES)</label>
                        <textarea id="offnews-impact" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200"></textarea>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Pregunta Debate (ES)</label>
                        <textarea id="offnews-debate" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200"></textarea>
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.submitOfficialNews()" class="min-h-[44px] px-6 py-2 bg-amber-500 text-black hover:bg-white text-xs font-black uppercase transition-colors">Guardar Artículo en Órbita</button>
        `;
        this.showModal("Redacción «Órbita.» // Nuevo Artículo", html, actions);
        if (pImgUrl) {
            setTimeout(() => this.previewNanoBananaUrl(pImgUrl, 'offnews-img-preview'), 30);
        }
    },

    openOrbitaDraftFromDoc15(coId, phase) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede redactar noticias en Órbita.", "error");
        const co = state.data.companies?.[coId];
        const pr = co?.pressReleases?.[phase] || null;
        this.modalPublishOfficialNews(null, 'industria');
        setTimeout(() => {
            const originEl = document.getElementById('offnews-origin');
            const catEl = document.getElementById('offnews-category');
            const titleEl = document.getElementById('offnews-title');
            const subEl = document.getElementById('offnews-subtitle');
            const srcEl = document.getElementById('offnews-source-name');
            const srcUrlEl = document.getElementById('offnews-source-url');
            if (originEl) originEl.value = 'SIMULATION';
            if (catEl) catEl.value = `ECOSISTEMA MARS-KET · FASE ${phase}`;
            if (titleEl && co) titleEl.value = `Comunicado corporativo de ${co.name} (Fase ${phase})`;
            if (subEl && co) subEl.value = `Resumen editorial redactado por Coordinación a partir del documento DOC_15 entregado por ${co.name}.`;
            if (srcEl && co) srcEl.value = `Órbita. / Dossier ${co.name}`;
            if (srcUrlEl && pr?.docUrl) srcUrlEl.value = pr.docUrl;
        }, 40);
    },

    async submitOfficialNews() {
        if (!this.isNewsCoordinator()) return;
        const getVal = (id) => (document.getElementById(id)?.value || '').trim();
        const title = getVal('offnews-title');
        const body = getVal('offnews-body');
        if (!title || !body) return this.notify("El titular y el cuerpo del artículo en español son obligatorios.", "error");

        const section = getVal('offnews-section') || 'industria';
        const publishMode = getVal('offnews-publish-mode') === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
        const origin = getVal('offnews-origin') === 'SIMULATION' ? 'SIMULATION' : 'REAL';
        const placementChoice = getVal('offnews-placement') || 'archive';
        const subtitle = getVal('offnews-subtitle');
        const imgUrl = getVal('offnews-img-url');
        const imgData = getVal('offnews-img-data');
        const finalImg = imgData || imgUrl || null;

        let titleEn = getVal('offnews-title-en');
        let subtitleEn = getVal('offnews-subtitle-en');
        let bodyEn = getVal('offnews-body-en');
        if (!titleEn || !bodyEn) {
            this.notify("Generando traducción automática al inglés...", "info");
            if (!titleEn) titleEn = await this.autoTranslateText(title, 'es', 'en');
            if (!subtitleEn && subtitle) subtitleEn = await this.autoTranslateText(subtitle, 'es', 'en');
            if (!bodyEn) bodyEn = await this.autoTranslateText(body, 'es', 'en');
        }

        const curEd = this.getOrbitaEditionNumber();
        const nowTs = Date.now();
        const item = state.normalizeNewsItem({
            id: 'NEWS-' + nowTs,
            userEdited: true,
            section,
            origin,
            status: publishMode,
            editionNumber: publishMode === 'DRAFT' ? (curEd + 1) : curEd,
            category: getVal('offnews-category') || 'ÓRBITA.',
            categoryEn: getVal('offnews-category-en') || 'ORBITA',
            title,
            subtitle,
            body,
            titleEn,
            subtitleEn,
            bodyEn,
            imageUrl: finalImg,
            sourceName: getVal('offnews-source-name') || 'Consejo Editorial AEE',
            sourceUrl: getVal('offnews-source-url'),
            marsketImpact: getVal('offnews-impact'),
            debateQuestion: getVal('offnews-debate'),
            publishedAt: nowTs,
            updatedAt: nowTs,
            placementUpdatedAt: nowTs,
            publishedDate: new Date(nowTs).toLocaleDateString('es-ES'),
            placement: publishMode === 'PUBLISHED' ? placementChoice : 'archive',
            featured: publishMode === 'PUBLISHED' && placementChoice === 'front',
            phase: 'ALL',
            classGroup: 'ALL',
            author: state.user?.name || 'Coordinación AEE'
        });

        state.data.news = state.data.news || [];
        if (item) {
            state.data.news.unshift(item);
            state.data.news = state.resolveFeaturedNews(state.data.news);
        }
        this.newsSectionTab = section;
        this.closeModal();
        this.render();
        state.save();
        if (publishMode === 'DRAFT') {
            this.notify(`Borrador guardado para la Edición N.º ${curEd + 1} (oculto al alumnado y VIP-0000).`, "success");
        } else {
            ui.pushNotification('ALL', 'ALL', `Nueva publicación en «Órbita.»: "${title}".`, 'info', { view: 'news' });
            this.notify(`Artículo publicado en la Edición N.º ${curEd} de Órbita.`, "success");
        }
    },

    publishOrbitaDraftEdition() {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido a Coordinación.", "error");
        const list = Array.isArray(state.data.news) ? state.data.news : [];
        const drafts = list.filter(n => n && n.status === 'DRAFT');
        if (drafts.length === 0) {
            return this.notify("No hay artículos en borrador pendientes de publicar.", "info");
        }
        const curEd = this.getOrbitaEditionNumber();
        const nextEd = curEd + 1;
        this.confirmAction(
            `Publicar Edición N.º ${nextEd} de Órbita.`,
            `Se publicarán ${drafts.length} artículo(s) en borrador y pasarán a ser visibles para alumnado, profesorado y acceso invitado VIP-0000. El número de edición vigente avanzará de N.º ${curEd} a N.º ${nextEd}.`,
            () => {
                const nowTs = Date.now();
                const isoDate = state._toMadridIsoDate(nowTs);
                const dateLabel = new Date(nowTs).toLocaleDateString('es-ES');
                state.data.news = list.map(n => {
                    if (!n || n.status !== 'DRAFT') return n;
                    return {
                        ...n,
                        status: 'PUBLISHED',
                        editionNumber: nextEd,
                        publishedAt: nowTs,
                        updatedAt: nowTs,
                        publishedDate: dateLabel,
                        publishedIsoDate: isoDate
                    };
                });
                state.data.config = state.data.config || {};
                state.data.config.orbita = { currentEditionNumber: nextEd };
                state.data.news = state.resolveFeaturedNews(state.data.news);
                this.orbitaDraftPreview = false;
                ui.pushNotification('ALL', 'ALL', `Ya disponible la Edición N.º ${nextEd} de «Órbita.».`, 'info', { view: 'news' });
                state.save();
                this.render();
                this.notify(`Edición N.º ${nextEd} publicada con ${drafts.length} artículo(s).`, "success");
            }
        );
    },

    deleteOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede retirar artículos.", "error");
        this.confirmAction(
            "¿Retirar artículo de Órbita?",
            "Se eliminará el artículo de todas las sesiones y se añadirá a la lista de borrados para evitar que vuelva a aparecer.",
            () => {
                state.data.deletedNewsIds = Array.from(new Set([...(state.data.deletedNewsIds || []), String(newsId)]));
                state.data.deletedOfficialNewsIds = state.data.deletedNewsIds;
                state.data.news = (state.data.news || []).filter(n => String(n.id) !== String(newsId));
                state.data.news = state.resolveFeaturedNews(state.data.news);
                if (this.activeFullArticleReader && String(this.activeFullArticleReader.id) === String(newsId)) {
                    this.activeFullArticleReader = null;
                }
                state.save();
                this.render();
                this.notify("Artículo retirado de Órbita.", "info");
            }
        );
    },

    modalEditOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Acceso restringido a Coordinación.", "error");
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return this.notify("Artículo no encontrado.", "error");
        const articleSections = this.getOrbitaSections().filter(s => s.kind === 'articles');
        const curSec = articleSections.some(s => s.id === news.section) ? news.section : 'industria';
        const curStatus = news.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
        const curOrigin = news.origin === 'SIMULATION' ? 'SIMULATION' : 'REAL';
        const curPreviewSrc = news.imageUrl ? this.getNewsImageSrc(news.imageUrl) : '';

        const html = `
            <div class="space-y-3">
                <div class="px-3 py-2 bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300">
                    ${curStatus === 'PUBLISHED' ? `Editando artículo publicado en Edición N.º ${news.editionNumber || 0} (corrige in-situ sin cambiar el número).` : `Editando borrador (oculto al alumnado hasta publicar).`}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-amber-300 uppercase block mb-1 font-bold">Sección</label>
                        <select id="offnews-edit-section" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">
                            ${articleSections.map(s => `<option value="${this.escapeAttr(s.id)}" ${curSec === s.id ? 'selected' : ''}>${this.escapeHTML(s.titleEs)}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Estado</label>
                        <select id="offnews-edit-status" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">
                            <option value="PUBLISHED" ${curStatus === 'PUBLISHED' ? 'selected' : ''}>PUBLICADO (Ed. N.º ${news.editionNumber || 0})</option>
                            <option value="DRAFT" ${curStatus === 'DRAFT' ? 'selected' : ''}>BORRADOR (Oculto)</option>
                        </select>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Origen</label>
                        <select id="offnews-edit-origin" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">
                            <option value="REAL" ${curOrigin === 'REAL' ? 'selected' : ''}>ACTUALIDAD REAL</option>
                            <option value="SIMULATION" ${curOrigin === 'SIMULATION' ? 'selected' : ''}>SIMULACIÓN MARS-KET</option>
                        </select>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Titular (ES) *</label>
                        <input type="text" id="offnews-edit-title" value="${this.escapeAttr(news.title || '')}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Headline (EN)</label>
                        <input type="text" id="offnews-edit-title-en" value="${this.escapeAttr(news.titleEn || '')}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Entradilla (ES)</label>
                        <textarea id="offnews-edit-subtitle" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200">${this.escapeHTML(news.subtitle || '')}</textarea>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Subheadline (EN)</label>
                        <textarea id="offnews-edit-subtitle-en" rows="2" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-slate-200">${this.escapeHTML(news.subtitleEn || '')}</textarea>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Cuerpo (ES) *</label>
                        <textarea id="offnews-edit-body" rows="5" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">${this.escapeHTML(news.body || '')}</textarea>
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-cyan-300 uppercase block mb-1">Body (EN)</label>
                        <textarea id="offnews-edit-body-en" rows="5" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-sm text-white">${this.escapeHTML(news.bodyEn || '')}</textarea>
                    </div>
                </div>
                <div class="bg-slate-900 border border-slate-700 p-3 space-y-2 rounded">
                    <label class="text-[11px] font-mono text-amber-300 uppercase block font-bold">Imagen</label>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'offnews-edit-img-data', 'offnews-edit-img-preview', 'offnews-edit-img-url')" class="mars-touch-input w-full text-xs text-slate-300 bg-slate-950 border border-slate-700 p-2">
                        <input type="url" id="offnews-edit-img-url" value="${this.escapeAttr(news.imageUrl && !String(news.imageUrl).startsWith('data:') ? news.imageUrl : '')}" oninput="ui.previewNanoBananaUrl(this.value, 'offnews-edit-img-preview')" placeholder="O pega enlace https://..." class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                    </div>
                    <input type="hidden" id="offnews-edit-img-data" value="${this.escapeAttr(news.imageUrl && String(news.imageUrl).startsWith('data:') ? news.imageUrl : '')}">
                    <div id="offnews-edit-img-preview" class="${curPreviewSrc ? '' : 'hidden'}">
                        ${curPreviewSrc ? `<img src="${this.escapeAttr(curPreviewSrc)}" class="max-h-36 object-contain mt-1 border border-slate-700">` : ''}
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Fuente</label>
                        <input type="text" id="offnews-edit-source" value="${this.escapeAttr(news.sourceName || '')}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white">
                    </div>
                    <div>
                        <label class="text-[11px] font-mono text-slate-300 uppercase block mb-1">Enlace Fuente</label>
                        <input type="url" id="offnews-edit-source-url" value="${this.escapeAttr(news.sourceUrl || '')}" class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                    </div>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitEditOfficialNews('${this.escapeAttr(newsId)}')" class="min-h-[44px] px-6 py-2 bg-amber-500 text-black hover:bg-white text-xs font-black uppercase">Guardar Cambios</button>`;
        this.showModal("Corregir Artículo // Órbita.", html, actions);
    },

    submitEditOfficialNews(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        const getVal = (id) => (document.getElementById(id)?.value || '').trim();
        const title = getVal('offnews-edit-title');
        const body = getVal('offnews-edit-body');
        if (!title || !body) return this.notify("Titular y cuerpo obligatorios.", "error");

        news.userEdited = true;
        news.section = getVal('offnews-edit-section') || news.section || 'industria';
        news.status = getVal('offnews-edit-status') === 'DRAFT' ? 'DRAFT' : 'PUBLISHED';
        news.origin = getVal('offnews-edit-origin') === 'SIMULATION' ? 'SIMULATION' : 'REAL';
        news.title = title;
        news.titleEn = getVal('offnews-edit-title-en') || news.titleEn || '';
        news.subtitle = getVal('offnews-edit-subtitle');
        news.subtitleEn = getVal('offnews-edit-subtitle-en') || news.subtitleEn || '';
        news.body = body;
        news.bodyEn = getVal('offnews-edit-body-en') || news.bodyEn || '';
        news.sourceName = getVal('offnews-edit-source') || news.sourceName || 'Órbita.';
        news.sourceUrl = getVal('offnews-edit-source-url');
        const imgUrl = getVal('offnews-edit-img-url');
        const imgData = getVal('offnews-edit-img-data');
        if (imgUrl) news.imageUrl = imgUrl;
        else if (imgData) news.imageUrl = imgData;
        news.updatedAt = Date.now();

        state.data.news = state.resolveFeaturedNews(state.data.news);
        this.closeModal();
        this.render();
        state.save();
        this.notify("Artículo actualizado en Órbita.", "success");
    },

    modalEditNewsImage(newsId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede cambiar la imagen.", "error");
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        const html = `
            <div class="space-y-3">
                <p class="text-xs text-slate-300 font-mono">Sube una imagen o pega una URL (incluyendo Google Drive) para <strong>${this.escapeHTML(news.title)}</strong>.</p>
                <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'imgonly-data', 'imgonly-preview', 'imgonly-url')" class="mars-touch-input w-full text-xs text-slate-300 bg-slate-950 border border-slate-700 p-2">
                <input type="url" id="imgonly-url" value="${this.escapeAttr(news.imageUrl && !String(news.imageUrl).startsWith('data:') ? news.imageUrl : '')}" oninput="ui.previewNanoBananaUrl(this.value, 'imgonly-preview')" placeholder="https://..." class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                <input type="hidden" id="imgonly-data" value="${this.escapeAttr(news.imageUrl && String(news.imageUrl).startsWith('data:') ? news.imageUrl : '')}">
                <div id="imgonly-preview" class="hidden"></div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.clearNewsImageOnly('${this.escapeAttr(newsId)}')" class="min-h-[44px] px-4 py-2 bg-red-950 border border-red-600 text-red-200 text-xs font-bold uppercase">Quitar Foto</button>
            <button type="button" onclick="ui.saveNewsImageOnly('${this.escapeAttr(newsId)}')" class="min-h-[44px] px-6 py-2 bg-amber-500 text-black text-xs font-black uppercase">Guardar Foto</button>
        `;
        this.showModal("Cambiar Imagen // Órbita.", html, actions);
    },

    saveNewsImageOnly(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        const urlVal = (document.getElementById('imgonly-url')?.value || '').trim();
        const dataVal = (document.getElementById('imgonly-data')?.value || '').trim();
        news.imageUrl = urlVal || dataVal || null;
        news.userEdited = true;
        news.updatedAt = Date.now();
        this.closeModal();
        this.render();
        state.save();
        this.notify("Imagen actualizada en Órbita.", "success");
    },

    clearNewsImageOnly(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        news.imageUrl = null;
        news.userEdited = true;
        news.updatedAt = Date.now();
        this.closeModal();
        this.render();
        state.save();
        this.notify("Imagen eliminada.", "info");
    },

    setNewsFeatured(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news || news.status === 'DRAFT') return this.notify("Publica primero el artículo antes de fijarlo en portada.", "info");
        news.placement = 'front';
        news.featured = true;
        news.placementUpdatedAt = Date.now();
        news.updatedAt = Date.now();
        state.data.news = state.resolveFeaturedNews(state.data.news);
        this.render();
        state.save();
        this.notify("Noticia fijada en Portada.", "success");
    },

    promoteNewsToSubCover(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news || news.status === 'DRAFT') return this.notify("Publica primero el artículo antes de destacarlo.", "info");
        news.placement = 'sub';
        news.featured = false;
        news.placementUpdatedAt = Date.now();
        news.updatedAt = Date.now();
        state.data.news = state.resolveFeaturedNews(state.data.news);
        this.render();
        state.save();
        this.notify("Noticia movida a Sub-portada.", "success");
    },

    demoteNewsToArchive(newsId) {
        if (!this.isNewsCoordinator()) return;
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        news.placement = 'archive';
        news.featured = false;
        news.placementUpdatedAt = Date.now();
        news.updatedAt = Date.now();
        state.data.news = state.resolveFeaturedNews(state.data.news);
        this.render();
        state.save();
        this.notify("Noticia devuelta a su sección.", "info");
    },

    recordOrbitaArticleView(articleId) {
        const id = String(articleId || '').trim();
        if (!id || !/^[A-Za-z0-9_-]{3,80}$/.test(id)) return;
        if (!state?.token) return;
        const seenKey = 'orbita_viewed_ids_v1';
        try {
            const raw = sessionStorage.getItem(seenKey);
            const list = raw ? JSON.parse(raw) : [];
            const seenSet = new Set(Array.isArray(list) ? list : []);
            if (seenSet.has(id)) return;
            seenSet.add(id);
            sessionStorage.setItem(seenKey, JSON.stringify(Array.from(seenSet)));
        } catch (e) {}
        fetch('/api/news/view', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Marsket-Auth': state.token
            },
            body: JSON.stringify({ articleId: id })
        }).catch(() => {});
    },

    async loadOrbitaTopReads() {
        const box = document.getElementById('orbita-top-reads-list');
        if (!box) return;
        try {
            const resp = await fetch('/api/news/top?limit=20', { method: 'GET' });
            if (resp.ok) {
                const data = await resp.json();
                this._orbitaTopViewCounts = Array.isArray(data?.items) ? data.items : [];
                this.renderOrbitaTopReadsIntoDom();
            }
        } catch (e) {}
    },

    renderOrbitaTopReadsIntoDom() {
        const box = document.getElementById('orbita-top-reads-list');
        if (!box) return;
        const lang = this.getNewsLang();
        const published = (Array.isArray(state.data.news) ? state.data.news : [])
            .filter(n => n && n.status !== 'DRAFT');
        const byId = new Map(published.map(n => [String(n.id), n]));

        const counts = Array.isArray(this._orbitaTopViewCounts) ? this._orbitaTopViewCounts : [];
        const ranked = [];
        const seen = new Set();
        counts.forEach(entry => {
            const art = byId.get(String(entry.articleId));
            if (art && Number(entry.views) > 0 && !seen.has(String(art.id))) {
                seen.add(String(art.id));
                ranked.push({ art, views: Number(entry.views) });
            }
        });

        let finalItems = [];
        let isRandomFallback = false;
        if (ranked.length >= 3) {
            finalItems = ranked.slice(0, 10).map(r => r.art);
        } else {
            isRandomFallback = true;
            // Selección aleatoria estable durante la sesión para evitar saltos cada 20 s
            const randKey = 'orbita_top_rand_order_v1';
            let savedIds = [];
            try {
                const raw = sessionStorage.getItem(randKey);
                if (raw) savedIds = JSON.parse(raw);
            } catch (e) {}
            const validSaved = Array.isArray(savedIds) ? savedIds.map(id => byId.get(String(id))).filter(Boolean) : [];
            if (validSaved.length >= Math.min(10, published.length)) {
                finalItems = validSaved.slice(0, 10);
            } else {
                const pool = [...published];
                for (let i = pool.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [pool[i], pool[j]] = [pool[j], pool[i]];
                }
                finalItems = pool.slice(0, 10);
                try {
                    sessionStorage.setItem(randKey, JSON.stringify(finalItems.map(a => a.id)));
                } catch (e) {}
            }
        }

        const noteEl = document.getElementById('orbita-top-reads-note');
        if (noteEl) {
            noteEl.textContent = isRandomFallback
                ? (lang === 'EN' ? 'Editorial selection · This edition' : 'Selección de lectura · Esta edición')
                : (lang === 'EN' ? 'Most opened in Órbita' : 'Artículos más leídos en Órbita');
        }

        const expanded = Boolean(this._orbitaTop10Expanded);
        const visibleMobileCount = expanded ? 10 : 5;

        box.innerHTML = finalItems.map((art, idx) => {
            const title = this.getLocalizedNewsField(art, 'title');
            const secMeta = this.getOrbitaSectionMeta(art.section);
            const secLabel = lang === 'EN' ? secMeta.shortLabelEn : secMeta.shortLabelEs;
            const hiddenMobileCls = idx >= visibleMobileCount ? 'hidden md:flex' : 'flex';
            return `
                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="${hiddenMobileCls} items-start gap-3 py-2.5 border-b border-stone-200 last:border-b-0 text-left w-full group min-h-[44px]">
                    <span class="font-orbita-serif font-black text-lg leading-none text-[#8B0000] w-5 shrink-0 pt-0.5">${idx + 1}</span>
                    <div class="min-w-0 flex-1">
                        <span class="block text-[10px] font-mono uppercase tracking-wider text-stone-500">${this.escapeHTML(secLabel)}</span>
                        <span class="block text-sm font-orbita-serif font-bold text-[#111111] group-hover:text-[#8B0000] leading-snug">${this.escapeHTML(title)}</span>
                    </div>
                </button>
            `;
        }).join('') + (finalItems.length > 5 ? `
            <div class="pt-2 md:hidden">
                <button type="button" onclick="ui.toggleOrbitaTop10Mobile()" class="w-full min-h-[44px] border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors">
                    ${expanded ? (lang === 'EN' ? 'Show Top 5' : 'Ver Top 5') : (lang === 'EN' ? 'Show up to 10' : 'Ver hasta 10')}
                </button>
            </div>
        ` : '');
    },

    toggleOrbitaTop10Mobile() {
        this._orbitaTop10Expanded = !this._orbitaTop10Expanded;
        this.renderOrbitaTopReadsIntoDom();
    },

    openSavedArticleFullReader(newsId) {
        const news = (state.data.news || []).find(n => String(n.id) === String(newsId));
        if (!news) return;
        if (news.status !== 'DRAFT') {
            this.recordOrbitaArticleView(news.id);
        }
        this.activeFullArticleReader = {
            kind: 'official',
            id: String(news.id)
        };
        this.viewNewsBoard();
        const vp = document.getElementById('viewport');
        if (vp) vp.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    async openWireArticleFullReader(idx, sourceType = 'lanzamientos') {
        const list = sourceType === 'importer'
            ? (Array.isArray(this._snapiImporterItems) ? this._snapiImporterItems : [])
            : (this._snapiWireBySection?.[sourceType]?.items || []);
        const art = list[idx];
        if (!art) return;

        this.activeFullArticleReader = {
            kind: 'wire',
            sourceType,
            idx,
            loading: true,
            titleEn: art.title || '',
            titleEs: art.titleEs || art.title || '',
            subtitleEn: art.summary || '',
            subtitleEs: art.summaryEs || art.summary || '',
            bodyEn: art.summary || '',
            bodyEs: art.summaryEs || art.summary || '',
            imageUrl: art.proxy_image_url || this.getNewsImageSrc(art.image_url),
            sourceName: art.news_site || 'Aerospace Press',
            sourceUrl: art.url || '',
            publishedAt: art.published_at || ''
        };
        this.viewNewsBoard();
        window.scrollTo({ top: 0, behavior: 'smooth' });

        if (!art.url) {
            if (this.activeFullArticleReader?.kind === 'wire') {
                this.activeFullArticleReader.loading = false;
                this.viewNewsBoard();
            }
            return;
        }
        try {
            const qs = new URLSearchParams({
                url: art.url,
                title: art.title || '',
                summary: art.summary || '',
                site: art.news_site || 'Aerospace Press',
                img: art.image_url || ''
            });
            const resp = await fetch('/api/news/article?' + qs.toString());
            if (resp.ok) {
                const data = await resp.json();
                if (this.activeFullArticleReader?.kind === 'wire' && this.activeFullArticleReader.sourceUrl === art.url) {
                    this.activeFullArticleReader = {
                        ...this.activeFullArticleReader,
                        loading: false,
                        titleEn: data.titleEn || art.title || '',
                        titleEs: data.titleEs || art.titleEs || art.title || '',
                        subtitleEn: data.subtitleEn || art.summary || '',
                        subtitleEs: data.subtitleEs || art.summaryEs || art.summary || '',
                        bodyEn: data.bodyEn || art.summary || '',
                        bodyEs: data.bodyEs || art.summaryEs || art.summary || '',
                        imageUrl: data.imageUrl ? this.getNewsImageSrc(data.imageUrl) : this.activeFullArticleReader.imageUrl,
                        sourceName: data.sourceName || art.news_site || 'Aerospace Press'
                    };
                    this.viewNewsBoard();
                }
                return;
            }
        } catch (e) {}
        if (this.activeFullArticleReader?.kind === 'wire') {
            this.activeFullArticleReader.loading = false;
            this.viewNewsBoard();
        }
    },

    closeFullArticleReader() {
        this.activeFullArticleReader = null;
        this.viewNewsBoard();
    },

    renderFullArticleReaderHtml(lang) {
        const reader = this.activeFullArticleReader;
        if (!reader) return '';
        const isCoord = this.isNewsCoordinator();
        let title = '';
        let subtitle = '';
        let body = '';
        let category = '';
        let imageUrl = '';
        let sourceName = '';
        let sourceUrl = '';
        let dateStr = '';
        let marsketImpact = '';
        let debateQuestion = '';
        let origin = 'REAL';
        let isDraft = false;
        let officialId = '';

        if (reader.kind === 'official') {
            const art = (state.data.news || []).find(n => String(n.id) === String(reader.id));
            if (!art) {
                this.activeFullArticleReader = null;
                return '';
            }
            if (art.status === 'DRAFT' && !isCoord) {
                this.activeFullArticleReader = null;
                return '';
            }
            officialId = String(art.id);
            isDraft = art.status === 'DRAFT';
            origin = art.origin === 'SIMULATION' ? 'SIMULATION' : 'REAL';
            category = this.getLocalizedNewsField(art, 'category') || 'ÓRBITA.';
            title = this.getLocalizedNewsField(art, 'title');
            subtitle = this.getLocalizedNewsField(art, 'subtitle');
            body = this.getLocalizedNewsField(art, 'body') || subtitle;
            imageUrl = art.imageUrl ? this.getNewsImageSrc(art.imageUrl) : '';
            sourceName = art.sourceName || art.author || 'Órbita.';
            sourceUrl = art.sourceUrl || '';
            dateStr = art.publishedDate || '--';
            marsketImpact = this.getLocalizedNewsField(art, 'marsketImpact');
            debateQuestion = this.getLocalizedNewsField(art, 'debateQuestion');
        } else {
            category = lang === 'EN' ? 'INTERNATIONAL AEROSPACE PRESS' : 'PRENSA AEROESPACIAL INTERNACIONAL';
            title = lang === 'EN' ? reader.titleEn : (reader.titleEs || reader.titleEn);
            subtitle = lang === 'EN' ? reader.subtitleEn : (reader.subtitleEs || reader.subtitleEn);
            body = lang === 'EN' ? reader.bodyEn : (reader.bodyEs || reader.bodyEn);
            imageUrl = reader.imageUrl || '';
            sourceName = reader.sourceName || 'Aerospace Press';
            sourceUrl = reader.sourceUrl || '';
            dateStr = reader.publishedAt ? new Date(reader.publishedAt).toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '--';
        }

        const originBadge = origin === 'SIMULATION'
            ? `<span class="px-2 py-0.5 border border-[#8B0000] text-[#8B0000] text-[10px] font-mono font-bold uppercase">${lang === 'EN' ? 'MARS-KET SIMULATION' : 'SIMULACIÓN MARS-KET'}</span>`
            : `<span class="px-2 py-0.5 border border-[#111111] text-[#111111] text-[10px] font-mono font-bold uppercase">${lang === 'EN' ? 'REAL JOURNALISM' : 'ACTUALIDAD REAL'}</span>`;

        return `
            <article class="bg-white border border-stone-300 p-5 sm:p-10 max-w-4xl mx-auto shadow-sm">
                <div class="flex flex-wrap items-center justify-between gap-3 border-b border-stone-300 pb-4 mb-6">
                    <button type="button" onclick="ui.closeFullArticleReader()" class="min-h-[44px] px-4 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                        &larr; ${lang === 'EN' ? 'Back to Órbita' : 'Volver a Órbita'}
                    </button>
                    <div class="flex items-center gap-2 flex-wrap">
                        ${isDraft ? `<span class="px-2 py-0.5 bg-amber-100 border border-amber-600 text-amber-900 text-[10px] font-mono font-bold uppercase">BORRADOR OCULTO</span>` : ''}
                        ${originBadge}
                        <button type="button" onclick="ui.setNewsLang('ES')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-bold border ${lang === 'ES' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-stone-400'}">ES</button>
                        <button type="button" onclick="ui.setNewsLang('EN')" class="min-h-[44px] px-3 py-1 text-xs font-mono font-bold border ${lang === 'EN' ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-stone-400'}">EN</button>
                    </div>
                </div>

                ${reader.loading ? `
                    <div class="mb-5 px-4 py-2.5 bg-amber-50 border border-amber-300 text-xs font-mono text-amber-900">
                        ${lang === 'EN' ? 'Fetching full article text...' : 'Descargando y traduciendo el reportaje completo...'}
                    </div>
                ` : ''}

                <div class="flex flex-wrap items-center justify-between gap-2 text-xs font-mono uppercase tracking-widest mb-3">
                    <span class="text-[#8B0000] font-bold">${this.escapeHTML(category)}</span>
                    <span class="text-stone-500">${this.escapeHTML(sourceName)} &bull; ${this.escapeHTML(dateStr)}</span>
                </div>

                <h2 class="text-3xl sm:text-5xl font-orbita-serif font-black text-[#111111] leading-[1.08] tracking-tight mb-4">
                    ${this.escapeHTML(title)}
                </h2>

                ${subtitle ? `
                    <p class="text-lg sm:text-xl font-orbita-serif text-stone-700 leading-relaxed mb-6 border-l-2 border-[#8B0000] pl-4">
                        ${this.escapeHTML(subtitle)}
                    </p>
                ` : ''}

                ${imageUrl ? `
                    <figure class="mb-7 border border-stone-300 bg-stone-100">
                        <img src="${this.escapeAttr(imageUrl)}" alt="${this.escapeAttr(title)}" class="w-full max-h-[460px] object-cover cursor-pointer" onclick="ui.modalViewNewsImage('${this.escapeAttr(imageUrl)}', '${this.escapeAttr(title)}', '${this.escapeAttr(sourceName)}')">
                        <figcaption class="px-3 py-1.5 text-[11px] font-mono text-stone-600 border-t border-stone-200">
                            ${lang === 'EN' ? 'Source:' : 'Fuente:'} ${this.escapeHTML(sourceName)}
                        </figcaption>
                    </figure>
                ` : ''}

                <div class="font-orbita-serif text-base sm:text-lg text-[#1a1a1a] leading-relaxed">
                    ${this.formatOrbitaParagraphs(body, 'mb-4')}
                </div>

                ${(marsketImpact || debateQuestion) ? `
                    <div class="mt-8 bg-[#f3efe6] border border-stone-400 p-5 space-y-3">
                        <span class="block text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B0000]">
                            ${lang === 'EN' ? 'MARS-KET Mission Context & Council Debate' : 'Conexión MARS-KET & Debate en Aula'}
                        </span>
                        ${marsketImpact ? `<p class="text-sm font-orbita-serif text-[#111111]"><strong>${lang === 'EN' ? 'Mission impact:' : 'Impacto en misión:'}</strong> ${this.escapeHTML(marsketImpact)}</p>` : ''}
                        ${debateQuestion ? `<p class="text-sm font-orbita-serif italic text-stone-800 border-t border-stone-300 pt-2"><strong>${lang === 'EN' ? 'Debate:' : 'Pregunta:'}</strong> ${this.escapeHTML(debateQuestion)}</p>` : ''}
                    </div>
                ` : ''}

                <div class="mt-8 pt-4 border-t border-stone-300 flex flex-wrap items-center justify-between gap-3">
                    <div class="flex items-center gap-2 flex-wrap">
                        ${sourceUrl ? `
                            <a href="${this.escapeAttr(sourceUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-4 py-2 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors">
                                ${lang === 'EN' ? 'Original Source' : 'Fuente Original'} &nearr;
                            </a>
                        ` : ''}
                        ${(isCoord && officialId) ? `
                            <button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(officialId)}')" class="min-h-[44px] px-4 py-2 border border-stone-500 text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase">
                                Corregir Artículo
                            </button>
                            <button type="button" onclick="ui.deleteOfficialNews('${this.escapeAttr(officialId)}')" class="min-h-[44px] px-4 py-2 border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white text-xs font-mono font-bold uppercase">
                                Retirar
                            </button>
                        ` : ''}
                    </div>
                    <button type="button" onclick="ui.closeFullArticleReader()" class="min-h-[44px] px-5 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase">
                        ${lang === 'EN' ? 'Close Reader' : 'Cerrar Lectura'}
                    </button>
                </div>
            </article>
        `;
    },

    setNewsSectionTab(tabKey) {
        const validIds = this.getOrbitaSections().map(s => s.id);
        this.newsSectionTab = validIds.includes(tabKey) ? tabKey : 'portada';
        this.activeFullArticleReader = null;
        this.viewNewsBoard();
        setTimeout(() => {
            const activeTab = document.querySelector(`[data-orbita-tab="${this.newsSectionTab}"]`);
            if (activeTab && typeof activeTab.scrollIntoView === 'function') {
                activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }, 20);
    },

    renderBrandLogoBadge(company, small = false) {
        const sizeCls = small ? 'w-9 h-9 text-[10px]' : 'w-12 h-12 text-xs';
        const customRaw = String(state.data?.realCompanyLogos?.[company?.id] || '').trim();
        const customLogo = (customRaw && (/^https?:\/\//i.test(customRaw) || customRaw.startsWith('data:image/')))
            ? (typeof this.getDirectDriveImageUrl === 'function' ? this.getDirectDriveImageUrl(customRaw) : customRaw)
            : '';
        const monogram = String(company?.monogram || (company?.name || 'SP').slice(0, 3)).toUpperCase();
        const accent = company?.accentColor || '#0f172a';
        return `
        <div class="${sizeCls} shrink-0 bg-white border border-stone-300 flex items-center justify-center overflow-hidden p-1">
            ${customLogo ? `
                <img src="${this.escapeAttr(customLogo)}" alt="${this.escapeAttr(company?.name || '')}" loading="lazy"
                    onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.classList.remove('hidden');"
                    class="w-full h-full object-contain">
                <span class="hidden w-full h-full flex items-center justify-center font-mono font-black text-white" style="background:${this.escapeAttr(accent)}">${this.escapeHTML(monogram)}</span>
            ` : `
                <span class="w-full h-full flex items-center justify-center font-mono font-black text-white" style="background:${this.escapeAttr(accent)}">${this.escapeHTML(monogram)}</span>
            `}
        </div>`;
    },

    getWhoIsWhoRealPresets() {
        return [
            { id: 'nasa', name: 'NASA', domain: 'nasa.gov', countryEs: 'EE. UU.', countryEn: 'USA', roleEs: 'Agencia espacial civil de referencia (programa lunar Artemis, telescopio Webb y exploración robótica de Marte).', roleEn: 'Leading civil space agency behind the Artemis lunar program, James Webb telescope, and Mars rovers.' },
            { id: 'esa', name: 'ESA', domain: 'esa.int', countryEs: 'Europa (22 Estados)', countryEn: 'Europe (22 States)', roleEs: 'Agencia Espacial Europea: impulsa Ariane 6, Galileo, observación terrestre Copernicus y vocaciones STEM.', roleEn: 'European Space Agency driving Ariane 6, Galileo navigation, Copernicus Earth observation, and STEM outreach.' },
            { id: 'aee', name: 'Agencia Espacial Española (AEE)', domain: 'aee.gob.es', countryEs: 'España', countryEn: 'Spain', roleEs: 'Coordina la política espacial nacional, los retornos industriales en ESA y la seguridad aeroespacial.', roleEn: 'Coordinates Spain’s national space policy, ESA industrial returns, and aerospace safety.' },
            { id: 'spacex', name: 'SpaceX', domain: 'spacex.com', countryEs: 'EE. UU.', countryEn: 'USA', roleEs: 'Pionera en cohetes orbitales reutilizables (Falcon 9 / Starship) y red satelital Starlink.', roleEn: 'Pioneer of reusable orbital rockets (Falcon 9 / Starship) and the Starlink satellite constellation.' },
            { id: 'pld', name: 'PLD Space', domain: 'pldspace.com', countryEs: 'España (Elche)', countryEn: 'Spain (Elche)', roleEs: 'Empresa española creadora del cohete suborbital Miura 1 y del lanzador orbital Miura 5.', roleEn: 'Spanish aerospace firm behind the Miura 1 suborbital rocket and Miura 5 orbital launcher.' },
            { id: 'airbus', name: 'Airbus Defence and Space', domain: 'airbus.com', countryEs: 'Europa', countryEn: 'Europe', roleEs: 'Construye el módulo de servicio europeo de Orion (Artemis), satélites científicos y estructuras de vuelo.', roleEn: 'Builds the European Service Module for Artemis Orion, scientific satellites, and flight structures.' },
            { id: 'gmv', name: 'GMV', domain: 'gmv.com', countryEs: 'España', countryEn: 'Spain', roleEs: 'Referente europeo en dinámica de vuelo, segmento terreno y sistemas críticos de navegación Galileo.', roleEn: 'European leader in flight dynamics, ground control segments, and Galileo navigation systems.' },
            { id: 'sateliot', name: 'Sateliot', domain: 'sateliot.space', countryEs: 'España', countryEn: 'Spain', roleEs: 'Primera constelación española de nanosatélites 5G-IoT para conectividad global de sensores.', roleEn: 'First Spanish 5G-IoT nanosatellite constellation for global low-power sensor connectivity.' },
            { id: 'blueorigin', name: 'Blue Origin', domain: 'blueorigin.com', countryEs: 'EE. UU.', countryEn: 'USA', roleEs: 'Desarrolla los cohetes reutilizables New Shepard y New Glenn y motores criogénicos BE-4.', roleEn: 'Develops reusable New Shepard and New Glenn rockets alongside BE-4 cryogenic engines.' },
            { id: 'arianespace', name: 'Arianespace / ArianeGroup', domain: 'arianespace.com', countryEs: 'Francia / Europa', countryEn: 'France / Europe', roleEs: 'Opera el Puerto Espacial Europeo de Kourou y los lanzadores Ariane 6 y Vega-C.', roleEn: 'Operates Europe’s Spaceport in Kourou and the Ariane 6 and Vega-C launch vehicles.' }
        ];
    },

    modalEditRealCompanyLogo(presetId) {
        if (!this.isNewsCoordinator()) return this.notify("Solo Coordinación puede editar logos reales.", "error");
        const preset = this.getWhoIsWhoRealPresets().find(p => p.id === presetId);
        if (!preset) return;
        const current = String(state.data?.realCompanyLogos?.[presetId] || '');
        const html = `
            <div class="space-y-3">
                <p class="text-xs text-slate-300 font-mono">Logo oficial para <strong>${this.escapeHTML(preset.name)}</strong>.</p>
                <input type="file" accept="image/*" onchange="ui.processNanoBananaImageFile(this, 'reallogo-data', 'reallogo-preview', 'reallogo-url')" class="mars-touch-input w-full text-xs text-slate-300 bg-slate-950 border border-slate-700 p-2">
                <input type="url" id="reallogo-url" value="${this.escapeAttr(current && !current.startsWith('data:') ? current : '')}" oninput="ui.previewNanoBananaUrl(this.value, 'reallogo-preview')" placeholder="https://..." class="mars-touch-input w-full bg-slate-950 border border-slate-700 p-2 text-xs text-white font-mono">
                <input type="hidden" id="reallogo-data" value="${this.escapeAttr(current && current.startsWith('data:') ? current : '')}">
                <div id="reallogo-preview" class="hidden"></div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.clearRealCompanyLogo('${this.escapeAttr(presetId)}')" class="min-h-[44px] px-4 py-2 bg-red-950 border border-red-600 text-red-200 text-xs font-bold uppercase">Quitar</button>
            <button type="button" onclick="ui.saveRealCompanyLogo('${this.escapeAttr(presetId)}')" class="min-h-[44px] px-6 py-2 bg-amber-500 text-black text-xs font-black uppercase">Guardar</button>
        `;
        this.showModal(`Logo // ${preset.name}`, html, actions);
    },

    saveRealCompanyLogo(presetId) {
        if (!this.isNewsCoordinator()) return;
        const urlVal = (document.getElementById('reallogo-url')?.value || '').trim();
        const dataVal = (document.getElementById('reallogo-data')?.value || '').trim();
        state.data.realCompanyLogos = state.data.realCompanyLogos || {};
        if (urlVal || dataVal) {
            state.data.realCompanyLogos[presetId] = urlVal || dataVal;
        } else {
            delete state.data.realCompanyLogos[presetId];
        }
        state.data.realCompanyLogosUpdatedAt = Date.now();
        this.closeModal();
        this.render();
        state.save();
        this.notify("Logo de empresa real actualizado.", "success");
    },

    clearRealCompanyLogo(presetId) {
        if (!this.isNewsCoordinator()) return;
        if (state.data.realCompanyLogos) delete state.data.realCompanyLogos[presetId];
        state.data.realCompanyLogosUpdatedAt = Date.now();
        this.closeModal();
        this.render();
        state.save();
        this.notify("Logo eliminado.", "info");
    },

    renderWhoIsWhoDirectoryView(lang) {
        const isCoord = this.isNewsCoordinator();
        const presets = this.getWhoIsWhoRealPresets();
        const customLogos = (state.data && state.data.realCompanyLogos) || {};
        const isVipMode = state.user && state.user.role === 'VIP_READER';
        let startups = [];
        if (isVipMode && Array.isArray(state.data.vipStartups)) {
            startups = state.data.vipStartups.map(vs => ({
                id: vs.id,
                name: vs.name,
                slogan: vs.slogan || '',
                logo: vs.logo || '',
                bestE: Number(vs.bestE) || 0,
                maxHeight: Number(vs.maxHeight) || 0,
                flightCount: Number(vs.flightCount) || 0
            }));
        } else {
            startups = Object.entries(state.data.companies || {})
                .filter(([cid, co]) => co && !co.isTestCompany && cid !== 'sandbox_master' && cid !== 'sandbox_student' && String(co.classGroup || '').toUpperCase() !== 'TEST')
                .map(([cid, co]) => {
                    const flights = Array.isArray(co.flightTests) ? co.flightTests : [];
                    let maxH = 0;
                    let bestE = 0;
                    flights.forEach(ft => {
                        const h = Number(ft.height ?? ft.apogee) || 0;
                        const c = Number(ft.cost ?? ft.flightCost) || 0;
                        const eVal = ft.efficiency !== undefined ? Number(ft.efficiency) : (c > 0 ? h / c : 0);
                        if (h > maxH) maxH = h;
                        if (eVal > bestE) bestE = eVal;
                    });
                    return {
                        id: cid,
                        name: co.name || cid.toUpperCase(),
                        slogan: co.slogan || '',
                        logo: co.logo || '',
                        bestE,
                        maxHeight: maxH,
                        flightCount: flights.length
                    };
                });
        }
        startups.sort((a, b) => (b.bestE - a.bestE) || a.name.localeCompare(b.name));
        const meta = this.getOrbitaSectionMeta('quien');

        return `
            <section class="space-y-8" aria-label="Quién es quién">
                <div class="border-b-2 border-[#111111] pb-3">
                    <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'SECTION // DIRECTORY' : 'SECCIÓN // DIRECTORIO'}</span>
                    <h3 class="text-2xl sm:text-3xl font-orbita-serif font-black text-[#111111] mt-0.5">${this.escapeHTML(lang === 'EN' ? meta.titleEn : meta.titleEs)}</h3>
                    <p class="text-xs sm:text-sm font-orbita-serif text-stone-700 mt-1">${this.escapeHTML(lang === 'EN' ? meta.subtitleEn : meta.subtitleEs)}</p>
                </div>

                <div>
                    <div class="flex items-center justify-between gap-2 border-b border-stone-400 pb-1.5 mb-4">
                        <h4 class="font-orbita-serif font-black text-lg text-[#111111]">${lang === 'EN' ? 'Real Aerospace Agencies & Companies' : 'Agencias y Empresas Aeroespaciales Reales'}</h4>
                        <span class="text-[11px] font-mono text-stone-600">${presets.length}</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        ${presets.map(p => {
                            const customUrl = customLogos[p.id] ? this.getNewsImageSrc(customLogos[p.id]) : '';
                            const initials = p.name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 3).toUpperCase();
                            return `
                            <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-3">
                                <div class="flex items-start gap-3">
                                    ${customUrl
                                        ? `<img src="${this.escapeAttr(customUrl)}" alt="${this.escapeAttr(p.name)}" class="w-12 h-12 object-contain border border-stone-200 bg-white p-1 shrink-0">`
                                        : `<div class="w-12 h-12 border border-[#111111] bg-[#FAF8F5] flex items-center justify-center font-orbita-serif font-black text-sm text-[#111111] shrink-0">${this.escapeHTML(initials)}</div>`}
                                    <div class="min-w-0 flex-1">
                                        <span class="text-[10px] font-mono font-bold uppercase text-[#8B0000]">${this.escapeHTML(lang === 'EN' ? p.countryEn : p.countryEs)}</span>
                                        <h5 class="text-base font-orbita-serif font-bold text-[#111111] leading-snug">${this.escapeHTML(p.name)}</h5>
                                    </div>
                                </div>
                                <p class="text-xs font-orbita-serif text-stone-700 leading-relaxed">${this.escapeHTML(lang === 'EN' ? p.roleEn : p.roleEs)}</p>
                                <div class="flex items-center justify-between gap-2 pt-2 border-t border-stone-200">
                                    <a href="https://${this.escapeAttr(p.domain)}" target="_blank" rel="noopener noreferrer" class="text-[11px] font-mono text-stone-600 hover:text-[#8B0000] underline">${this.escapeHTML(p.domain)}</a>
                                    ${isCoord ? `<button type="button" onclick="ui.modalEditRealCompanyLogo('${this.escapeAttr(p.id)}')" class="min-h-[44px] px-2.5 py-1 border border-stone-400 text-[11px] font-mono font-bold text-[#111111] hover:bg-[#111111] hover:text-white uppercase">Logo</button>` : ''}
                                </div>
                            </article>`;
                        }).join('')}
                    </div>
                </div>

                <div>
                    <div class="flex items-center justify-between gap-2 border-b border-stone-400 pb-1.5 mb-4">
                        <h4 class="font-orbita-serif font-black text-lg text-[#111111]">${lang === 'EN' ? 'Navarra Classroom Startups (MARS-KET)' : 'Startups Navarras (MARS-KET)'}</h4>
                        <span class="text-[11px] font-mono text-stone-600">${startups.length}</span>
                    </div>
                    ${startups.length === 0 ? `
                        <div class="bg-white border border-stone-300 p-6 text-center text-sm font-orbita-serif text-stone-600">
                            ${lang === 'EN' ? 'No startups registered yet.' : 'Todavía no hay startups registradas.'}
                        </div>
                    ` : `
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${startups.map(st => {
                                const logoSrc = st.logo ? this.getNewsImageSrc(st.logo) : '';
                                const initials = st.name.split(/\s+/).map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
                                return `
                                <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-2.5">
                                    <div class="flex items-start gap-3">
                                        ${logoSrc
                                            ? `<img src="${this.escapeAttr(logoSrc)}" alt="${this.escapeAttr(st.name)}" class="w-11 h-11 object-contain border border-stone-200 bg-white p-0.5 shrink-0">`
                                            : `<div class="w-11 h-11 border border-stone-400 bg-[#FAF8F5] flex items-center justify-center font-orbita-serif font-black text-xs text-[#111111] shrink-0">${this.escapeHTML(initials)}</div>`}
                                        <div class="min-w-0 flex-1">
                                            <span class="text-[10px] font-mono font-bold uppercase text-[#8B0000]">&middot; Navarra</span>
                                            <h5 class="text-base font-orbita-serif font-bold text-[#111111] leading-snug break-words">${this.escapeHTML(st.name)}</h5>
                                            ${st.slogan ? `<p class="text-xs font-orbita-serif italic text-stone-600 line-clamp-2 mt-0.5">${this.escapeHTML(st.slogan)}</p>` : ''}
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between text-[11px] font-mono text-stone-600 border-t border-stone-200 pt-2">
                                        <span>${lang === 'EN' ? 'Flights' : 'Vuelos'}: <strong>${st.flightCount}</strong></span>
                                        <span>${lang === 'EN' ? 'Max E' : 'Mejor E'}: <strong>${st.bestE > 0 ? st.bestE.toFixed(2) : '--'}</strong></span>
                                    </div>
                                </article>`;
                            }).join('')}
                        </div>
                    `}
                </div>
            </section>
        `;
    },

    renderNewsSectionArticlesGrid(articles, sectionKey, isCoord, lang) {
        const meta = this.getOrbitaSectionMeta(sectionKey);
        const headingTitle = lang === 'EN' ? meta.titleEn : meta.titleEs;
        const headingSub = lang === 'EN' ? meta.subtitleEn : meta.subtitleEs;

        if (!articles || articles.length === 0) {
            return `
                <section class="space-y-4">
                    <div class="border-b-2 border-[#111111] pb-3 flex items-end justify-between gap-2">
                        <div>
                            <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'SECTION' : 'SECCIÓN'}</span>
                            <h3 class="text-2xl sm:text-3xl font-orbita-serif font-black text-[#111111] mt-0.5">${this.escapeHTML(headingTitle)}</h3>
                            ${headingSub ? `<p class="text-xs sm:text-sm font-orbita-serif text-stone-700 mt-1">${this.escapeHTML(headingSub)}</p>` : ''}
                        </div>
                    </div>
                    <div class="bg-white border border-stone-300 p-8 text-center space-y-2">
                        <p class="text-base font-orbita-serif font-bold text-[#111111]">
                            ${sectionKey === 'entrevistas'
                                ? (lang === 'EN' ? 'Upcoming section: Mission Interviews' : 'Próximamente: Entrevistas de la misión')
                                : (lang === 'EN' ? 'No articles published in this section yet.' : 'Todavía no hay artículos publicados en esta sección.')}
                        </p>
                        <p class="text-xs font-orbita-serif text-stone-600 max-w-lg mx-auto">
                            ${sectionKey === 'entrevistas'
                                ? (lang === 'EN' ? 'This space starts empty and will be populated progressively with interviews conducted during the school year.' : 'Esta sección arranca vacía por diseño y se irá completando a lo largo del curso con conversaciones a protagonistas de la misión.')
                                : (lang === 'EN' ? 'Check back in the next digital edition.' : 'Vuelve en las próximas ediciones digitales.')}
                        </p>
                    </div>
                </section>
            `;
        }

        return `
            <section class="space-y-4">
                <div class="border-b-2 border-[#111111] pb-3 flex items-end justify-between gap-2">
                    <div>
                        <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'SECTION' : 'SECCIÓN'}</span>
                        <h3 class="text-2xl sm:text-3xl font-orbita-serif font-black text-[#111111] mt-0.5">${this.escapeHTML(headingTitle)}</h3>
                        ${headingSub ? `<p class="text-xs sm:text-sm font-orbita-serif text-stone-700 mt-1">${this.escapeHTML(headingSub)}</p>` : ''}
                    </div>
                    <span class="text-xs font-mono font-bold text-stone-600 shrink-0">${articles.length}</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    ${articles.map(art => {
                        const title = this.getLocalizedNewsField(art, 'title');
                        const sub = this.getLocalizedNewsField(art, 'subtitle');
                        const cat = this.getLocalizedNewsField(art, 'category') || headingTitle;
                        const imgSrc = art.imageUrl ? this.getNewsImageSrc(art.imageUrl) : '';
                        const isDraft = art.status === 'DRAFT';
                        const originBadge = art.origin === 'SIMULATION'
                            ? `<span class="px-1.5 py-0.5 border border-[#8B0000] text-[#8B0000] text-[9px] font-mono font-bold uppercase">${lang === 'EN' ? 'SIMULATION' : 'SIMULACIÓN MARS-KET'}</span>`
                            : `<span class="px-1.5 py-0.5 border border-stone-400 text-stone-700 text-[9px] font-mono font-bold uppercase">${lang === 'EN' ? 'REAL' : 'ACTUALIDAD REAL'}</span>`;
                        return `
                        <article class="bg-white border ${isDraft ? 'border-amber-500 ring-1 ring-amber-400' : 'border-stone-300'} p-4 flex flex-col justify-between gap-3">
                            <div>
                                ${imgSrc ? `<img src="${this.escapeAttr(imgSrc)}" alt="${this.escapeAttr(title)}" loading="lazy" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="w-full h-40 object-cover border border-stone-300 mb-3 cursor-pointer">` : ''}
                                <div class="flex items-center justify-between gap-2 text-[10px] font-mono mb-1.5 flex-wrap">
                                    <span class="text-[#8B0000] font-bold uppercase truncate">${this.escapeHTML(cat)}</span>
                                    <span class="text-stone-500 shrink-0">${this.escapeHTML(art.publishedDate || '--')}</span>
                                </div>
                                <div class="flex items-center gap-1.5 mb-2 flex-wrap">
                                    ${originBadge}
                                    ${isDraft ? `<span class="px-1.5 py-0.5 bg-amber-100 border border-amber-600 text-amber-900 text-[9px] font-mono font-bold uppercase">BORRADOR · ED. N.º ${art.editionNumber || 0}</span>` : ''}
                                </div>
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="text-left w-full text-lg font-orbita-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug mb-2">
                                    ${this.escapeHTML(title)}
                                </button>
                                ${sub ? `<p class="text-xs font-orbita-serif text-stone-700 leading-relaxed line-clamp-3">${this.escapeHTML(sub)}</p>` : ''}
                            </div>
                            <div class="pt-3 border-t border-stone-200 flex items-center justify-between gap-2 flex-wrap">
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                                    ${this.getOrbitaIcon('book')}
                                    <span>${lang === 'EN' ? 'Read Report' : 'Leer Completo'}</span>
                                </button>
                                ${isCoord ? `
                                    <div class="flex items-center gap-1">
                                        ${!isDraft && !art.featured ? `<button type="button" onclick="ui.setNewsFeatured('${this.escapeAttr(art.id)}')" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 bg-stone-100 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white" title="Fijar en Portada">${this.getOrbitaIcon('star')}</button>` : ''}
                                        <button type="button" onclick="ui.modalEditOfficialNews('${this.escapeAttr(art.id)}')" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 bg-stone-100 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white" title="Editar">${this.getOrbitaIcon('edit')}</button>
                                    </div>
                                ` : ''}
                            </div>
                        </article>`;
                    }).join('')}
                </div>
            </section>
        `;
    },

    renderHemerotecaCalendarView(allPublished, lang) {
        const byIso = new Map();
        const monthsSet = new Set();
        const editionsSet = new Set([0]);
        allPublished.forEach(art => {
            const iso = String(art.publishedIsoDate || state._toMadridIsoDate(art.publishedAt, art.publishedDate));
            if (!byIso.has(iso)) byIso.set(iso, []);
            byIso.get(iso).push(art);
            monthsSet.add(iso.slice(0, 7));
            editionsSet.add(Number(art.editionNumber) || 0);
        });
        const sortedMonths = Array.from(monthsSet).sort();
        const defaultMonth = sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1] : '2026-11';
        if (!this.orbitaArchiveMonth || !/^\d{4}-\d{2}$/.test(this.orbitaArchiveMonth)) {
            this.orbitaArchiveMonth = defaultMonth;
        }
        const [yrStr, moStr] = this.orbitaArchiveMonth.split('-');
        const yr = parseInt(yrStr, 10);
        const mo = parseInt(moStr, 10);
        const firstDayJs = new Date(Date.UTC(yr, mo - 1, 1));
        const startOffset = (firstDayJs.getUTCDay() + 6) % 7; // Lunes = 0
        const daysInMonth = new Date(Date.UTC(yr, mo, 0)).getUTCDate();
        const monthLabel = firstDayJs.toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', { month: 'long', year: 'numeric', timeZone: 'UTC' });

        const selectedEd = this.orbitaArchiveEdition ?? 'ALL';
        const selectedDay = this.orbitaArchiveDay || '';
        const filteredList = allPublished.filter(art => {
            const iso = String(art.publishedIsoDate || state._toMadridIsoDate(art.publishedAt, art.publishedDate));
            if (selectedDay && iso !== selectedDay) return false;
            if (!selectedDay && !iso.startsWith(this.orbitaArchiveMonth)) return false;
            if (selectedEd !== 'ALL' && Number(art.editionNumber || 0) !== Number(selectedEd)) return false;
            return true;
        });

        const dayHeaders = lang === 'EN' ? ['M', 'T', 'W', 'T', 'F', 'S', 'S'] : ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
        const cells = [];
        for (let i = 0; i < startOffset; i++) cells.push(`<div></div>`);
        for (let d = 1; d <= daysInMonth; d++) {
            const iso = `${yrStr}-${moStr}-${String(d).padStart(2, '0')}`;
            const count = (byIso.get(iso) || []).length;
            const isSelected = selectedDay === iso;
            if (count === 0) {
                cells.push(`<button type="button" disabled class="orbita-cal-day min-h-[44px] w-full flex flex-col items-center justify-center text-xs font-mono text-stone-400 bg-stone-50 border border-stone-200 cursor-default">${d}</button>`);
            } else {
                cells.push(`
                    <button type="button" onclick="ui.setOrbitaArchiveDay('${iso}')" class="orbita-cal-day min-h-[44px] w-full flex flex-col items-center justify-center text-xs font-mono font-bold border transition-colors ${isSelected ? 'bg-[#8B0000] text-white border-[#8B0000]' : 'bg-white text-[#111111] border-[#111111] hover:bg-[#111111] hover:text-white'}">
                        <span>${d}</span>
                        <span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-[#8B0000]'} mt-0.5"></span>
                    </button>
                `);
            }
        }

        const editionsSorted = Array.from(editionsSet).sort((a, b) => b - a);
        const meta = this.getOrbitaSectionMeta('hemeroteca');

        return `
            <section class="space-y-6" aria-label="Hemeroteca">
                <div class="border-b-2 border-[#111111] pb-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <span class="text-[11px] font-mono font-bold uppercase tracking-widest text-[#8B0000]">${lang === 'EN' ? 'SECTION // ARCHIVE' : 'SECCIÓN // HEMEROTECA'}</span>
                        <h3 class="text-2xl sm:text-3xl font-orbita-serif font-black text-[#111111] mt-0.5">${this.escapeHTML(lang === 'EN' ? meta.titleEn : meta.titleEs)}</h3>
                        <p class="text-xs sm:text-sm font-orbita-serif text-stone-700 mt-1">${this.escapeHTML(lang === 'EN' ? meta.subtitleEn : meta.subtitleEs)}</p>
                    </div>
                    <div class="flex items-center gap-2 flex-wrap">
                        <select onchange="ui.setOrbitaArchiveEdition(this.value)" aria-label="Filtrar por edición" class="min-h-[44px] bg-white border border-stone-400 px-3 py-1.5 text-xs font-mono font-bold text-[#111111]">
                            <option value="ALL" ${selectedEd === 'ALL' ? 'selected' : ''}>${lang === 'EN' ? 'All Editions' : 'Todas las ediciones'}</option>
                            ${editionsSorted.map(edNum => `<option value="${edNum}" ${String(selectedEd) === String(edNum) ? 'selected' : ''}>Edición N.º ${edNum}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div class="lg:col-span-5 bg-white border border-stone-300 p-4 space-y-3">
                        <div class="flex items-center justify-between gap-2">
                            <button type="button" onclick="ui.shiftOrbitaArchiveMonth(-1)" class="min-h-[44px] min-w-[44px] px-3 border border-stone-400 text-xs font-mono font-bold text-[#111111] hover:bg-[#111111] hover:text-white">&larr;</button>
                            <span class="font-orbita-serif font-black text-base uppercase text-[#111111]">${this.escapeHTML(monthLabel)}</span>
                            <button type="button" onclick="ui.shiftOrbitaArchiveMonth(1)" class="min-h-[44px] min-w-[44px] px-3 border border-stone-400 text-xs font-mono font-bold text-[#111111] hover:bg-[#111111] hover:text-white">&rarr;</button>
                        </div>
                        <div class="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-stone-500">
                            ${dayHeaders.map(d => `<div class="py-1">${d}</div>`).join('')}
                        </div>
                        <div class="grid grid-cols-7 gap-1">
                            ${cells.join('')}
                        </div>
                        <div class="flex items-center justify-between gap-2 pt-2 border-t border-stone-200 text-[11px] font-mono">
                            <button type="button" onclick="ui.setOrbitaArchiveDay('')" class="min-h-[44px] px-2.5 border border-stone-400 text-[#111111] hover:bg-[#111111] hover:text-white uppercase font-bold">
                                ${lang === 'EN' ? 'Whole month' : 'Todo el mes'}
                            </button>
                            <button type="button" onclick="ui.jumpOrbitaArchiveMonth('${defaultMonth}')" class="min-h-[44px] px-2.5 border border-[#8B0000] text-[#8B0000] hover:bg-[#8B0000] hover:text-white uppercase font-bold">
                                ${lang === 'EN' ? 'Latest active' : 'Último activo'}
                            </button>
                        </div>
                    </div>

                    <div class="lg:col-span-7 space-y-3">
                        <div class="flex items-center justify-between border-b border-stone-300 pb-2 text-xs font-mono text-stone-600">
                            <span>${selectedDay ? `${lang === 'EN' ? 'Published on' : 'Publicadas el'} <strong>${this.escapeHTML(selectedDay)}</strong>` : `${lang === 'EN' ? 'Month' : 'Mes'} <strong>${this.escapeHTML(monthLabel)}</strong>`}</span>
                            <span>${filteredList.length} ${lang === 'EN' ? 'articles' : 'artículos'}</span>
                        </div>
                        ${filteredList.length === 0 ? `
                            <div class="bg-white border border-stone-300 p-6 text-center text-sm font-orbita-serif text-stone-600">
                                ${lang === 'EN' ? 'No published articles match this date.' : 'No hay artículos publicados en la fecha seleccionada.'}
                            </div>
                        ` : filteredList.map(art => {
                            const title = this.getLocalizedNewsField(art, 'title');
                            const secMeta = this.getOrbitaSectionMeta(art.section);
                            return `
                            <article class="bg-white border border-stone-300 p-4 flex items-center justify-between gap-3">
                                <div class="min-w-0 flex-1">
                                    <div class="text-[10px] font-mono text-[#8B0000] font-bold uppercase mb-1">
                                        ${this.escapeHTML(lang === 'EN' ? secMeta.shortLabelEn : secMeta.shortLabelEs)} &bull; Ed. N.º ${art.editionNumber || 0} &bull; ${this.escapeHTML(art.publishedDate || '')}
                                    </div>
                                    <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="text-left text-base font-orbita-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug">
                                        ${this.escapeHTML(title)}
                                    </button>
                                </div>
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(art.id)}')" class="min-h-[44px] px-3 py-1.5 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase shrink-0">
                                    ${lang === 'EN' ? 'Read' : 'Leer'}
                                </button>
                            </article>`;
                        }).join('')}
                    </div>
                </div>
            </section>
        `;
    },

    setOrbitaArchiveDay(iso) {
        this.orbitaArchiveDay = (this.orbitaArchiveDay === iso) ? '' : iso;
        this.viewNewsBoard();
    },

    setOrbitaArchiveEdition(val) {
        this.orbitaArchiveEdition = val === 'ALL' ? 'ALL' : parseInt(val, 10);
        this.viewNewsBoard();
    },

    jumpOrbitaArchiveMonth(ym) {
        this.orbitaArchiveMonth = ym;
        this.orbitaArchiveDay = '';
        this.viewNewsBoard();
    },

    shiftOrbitaArchiveMonth(delta) {
        const cur = this.orbitaArchiveMonth || '2026-11';
        const [y, m] = cur.split('-').map(Number);
        const dt = new Date(Date.UTC(y, m - 1 + delta, 1));
        this.orbitaArchiveMonth = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`;
        this.orbitaArchiveDay = '';
        this.viewNewsBoard();
    },

    viewNewsBoard() {
        const el = document.getElementById('viewport');
        if (!el) return;
        el.innerHTML = '';

        const isCoord = this.isNewsCoordinator();
        const lang = this.getNewsLang();
        const curEdition = this.getOrbitaEditionNumber();

        const rawAll = Array.isArray(state.data.news) ? state.data.news : [];
        const visibleNews = rawAll
            .filter(n => n && (isCoord || n.status !== 'DRAFT'))
            .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
        const publishedOnly = visibleNews.filter(n => n.status !== 'DRAFT');
        const draftsList = isCoord ? visibleNews.filter(n => n.status === 'DRAFT') : [];

        const validTabs = this.getOrbitaSections().map(s => s.id);
        const activeTab = validTabs.includes(this.newsSectionTab) ? this.newsSectionTab : 'portada';
        this.newsSectionTab = activeTab;

        if (this.activeFullArticleReader) {
            const readerHtml = this.renderFullArticleReaderHtml(lang);
            if (readerHtml) {
                const wrap = document.createElement('div');
                wrap.className = 'fade-in bg-[#FAF8F5] text-[#111111] border border-stone-300 shadow-xl p-4 sm:p-8 max-w-6xl mx-auto my-2 space-y-6';
                wrap.innerHTML = readerHtml;
                el.appendChild(wrap);
                return;
            }
        }

        const todayLabel = new Date().toLocaleDateString(lang === 'EN' ? 'en-GB' : 'es-ES', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });

        const frontPool = publishedOnly;
        const coverArticle = frontPool.find(n => n.placement === 'front' || n.featured) || frontPool[0] || null;
        const subCovers = frontPool.filter(n => n !== coverArticle && n.placement === 'sub').slice(0, 3);
        const usedFrontIds = new Set([coverArticle?.id, ...subCovers.map(s => s.id)].filter(Boolean).map(String));

        const articlesBySec = {};
        ['nasa', 'lanzamientos', 'tecnologia', 'industria', 'inventos', 'historia', 'juguetes', 'entrevistas'].forEach(sec => {
            articlesBySec[sec] = visibleNews.filter(n => n.section === sec);
        });

        const contestShowcaseHtml = typeof ui.renderContestNewsShowcase === 'function'
            ? ui.renderContestNewsShowcase({ noEmoji: true })
            : '';

        const sections = this.getOrbitaSections();
        const activeMeta = this.getOrbitaSectionMeta(activeTab);

        const wrapper = document.createElement('div');
        wrapper.className = 'fade-in bg-[#FAF8F5] text-[#111111] border border-stone-300 shadow-2xl p-4 sm:p-8 max-w-6xl mx-auto my-2 space-y-6';
        wrapper.innerHTML = `
            ${isCoord && draftsList.length > 0 ? `
                <div class="bg-amber-100 border-2 border-amber-700 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                    <div class="text-xs font-mono text-amber-950">
                        <strong>BORRADOR EN PREPARACIÓN (Edición N.º ${curEdition + 1}):</strong> ${draftsList.length} artículo(s) ocultos para alumnado y VIP-0000.
                    </div>
                    <button type="button" onclick="ui.publishOrbitaDraftEdition()" class="min-h-[44px] px-4 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                        Publicar Edición N.º ${curEdition + 1}
                    </button>
                </div>
            ` : ''}

            <header class="border-b-4 border-double border-[#111111] pb-4 space-y-3">
                <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-stone-700 border-b border-stone-300 pb-2">
                    <span class="uppercase tracking-wider font-bold">
                        ${curEdition === 0
                            ? (lang === 'EN' ? 'Edition No. 0 · Inaugural Pilot' : 'Edición N.º 0 · Piloto Inaugural')
                            : (lang === 'EN' ? `Edition No. ${curEdition}` : `Edición N.º ${curEdition}`)}
                        &bull; ${this.escapeHTML(todayLabel)}
                    </span>
                    <div class="flex items-center gap-3">
                        <button type="button" onclick="ui.scrollToOrbitaColophon()" class="min-h-[44px] px-2 text-xs font-mono font-bold underline text-[#111111] hover:text-[#8B0000]">
                            ${lang === 'EN' ? 'About this edition' : 'Sobre esta edición'}
                        </button>
                        <div class="inline-flex border border-[#111111]" role="group" aria-label="Idioma">
                            <button type="button" onclick="ui.setNewsLang('ES')" class="min-h-[44px] px-3 text-xs font-mono font-bold ${lang === 'ES' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}">ES</button>
                            <button type="button" onclick="ui.setNewsLang('EN')" class="min-h-[44px] px-3 text-xs font-mono font-bold border-l border-[#111111] ${lang === 'EN' ? 'bg-[#111111] text-white' : 'bg-white text-[#111111]'}">EN</button>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
                    <div>
                        <h1 class="text-5xl sm:text-6xl font-orbita-serif font-black tracking-tight text-[#111111] leading-none">Órbita<span class="text-[#8B0000]">.</span></h1>
                        <p class="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-stone-600 mt-1.5">
                            ${lang === 'EN' ? 'THE AEROSPACE DAILY · Launches, science & industry' : 'EL DIARIO AEROESPACIAL · Lanzamientos, ciencia e industria'}
                        </p>
                    </div>
                    ${isCoord ? `
                        <div class="flex items-center gap-2 flex-wrap">
                            <button type="button" onclick="ui.modalPublishOfficialNews()" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase transition-colors">
                                ${this.getOrbitaIcon('edit')}
                                <span>Nuevo Artículo</span>
                            </button>
                            <button type="button" onclick="ui.openPrintEditionStudio()" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white text-xs font-mono font-bold uppercase transition-colors">
                                ${this.getOrbitaIcon('portada')}
                                <span>Estudio A3</span>
                            </button>
                        </div>
                    ` : ''}
                </div>

                <p class="text-[11px] font-mono text-stone-600">
                    ${lang === 'EN'
                        ? 'Real aerospace journalism and simulated MARS-KET 4º ESO project dispatches.'
                        : 'Periodismo aeroespacial real y crónicas simuladas del proyecto escolar MARS-KET (4º ESO).'}
                </p>

                <nav class="relative border-t border-stone-300 pt-2 overflow-x-auto" aria-label="Secciones de Órbita">
                    <div class="flex items-center gap-1.5 min-w-max pb-1">
                        ${sections.map(sec => {
                            const isActive = activeTab === sec.id;
                            const label = lang === 'EN' ? sec.shortLabelEn : sec.shortLabelEs;
                            return `
                            <button type="button" data-orbita-tab="${this.escapeAttr(sec.id)}" onclick="ui.setNewsSectionTab('${this.escapeAttr(sec.id)}')" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold uppercase whitespace-nowrap border transition-colors ${isActive ? 'bg-[#111111] text-white border-[#111111]' : 'bg-white text-[#111111] border-stone-300 hover:border-[#111111]'}">
                                ${this.getOrbitaIcon(sec.iconKey)}
                                <span>${this.escapeHTML(label)}</span>
                            </button>`;
                        }).join('')}
                    </div>
                </nav>
            </header>

            ${contestShowcaseHtml ? `<div class="bg-[#0b1120] text-white p-4 border border-stone-400">${contestShowcaseHtml}</div>` : ''}

            ${activeTab === 'portada' ? `
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
                    <div class="lg:col-span-8 space-y-6">
                        ${coverArticle ? (() => {
                            const cTitle = this.getLocalizedNewsField(coverArticle, 'title');
                            const cSub = this.getLocalizedNewsField(coverArticle, 'subtitle');
                            const cCat = this.getLocalizedNewsField(coverArticle, 'category') || 'PORTADA';
                            const cImg = coverArticle.imageUrl ? this.getNewsImageSrc(coverArticle.imageUrl) : '';
                            const originBadge = coverArticle.origin === 'SIMULATION'
                                ? `<span class="px-1.5 py-0.5 border border-[#8B0000] text-[#8B0000] text-[10px] font-mono font-bold uppercase">${lang === 'EN' ? 'SIMULATION' : 'SIMULACIÓN MARS-KET'}</span>`
                                : `<span class="px-1.5 py-0.5 border border-[#111111] text-[#111111] text-[10px] font-mono font-bold uppercase">${lang === 'EN' ? 'REAL JOURNALISM' : 'ACTUALIDAD REAL'}</span>`;
                            return `
                            <article class="bg-white border border-stone-300 p-5 sm:p-7 space-y-4">
                                <div class="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono uppercase">
                                    <span class="text-[#8B0000] font-bold tracking-wider">${this.escapeHTML(cCat)}</span>
                                    ${originBadge}
                                </div>
                                <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(coverArticle.id)}')" class="text-left block w-full text-2xl sm:text-4xl font-orbita-serif font-black text-[#111111] hover:text-[#8B0000] leading-[1.08] tracking-tight">
                                    ${this.escapeHTML(cTitle)}
                                </button>
                                ${cSub ? `<p class="text-base font-orbita-serif text-stone-700 leading-relaxed">${this.escapeHTML(cSub)}</p>` : ''}
                                ${cImg ? `<img src="${this.escapeAttr(cImg)}" alt="${this.escapeAttr(cTitle)}" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(coverArticle.id)}')" class="w-full max-h-80 object-cover border border-stone-300 cursor-pointer">` : ''}
                                <div class="flex items-center justify-between gap-2 pt-2 border-t border-stone-200">
                                    <span class="text-[11px] font-mono text-stone-500">${this.escapeHTML(coverArticle.sourceName || 'Órbita.')} &bull; ${this.escapeHTML(coverArticle.publishedDate || '')}</span>
                                    <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(coverArticle.id)}')" class="min-h-[44px] inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white hover:bg-[#8B0000] text-xs font-mono font-bold uppercase">
                                        ${this.getOrbitaIcon('book')}
                                        <span>${lang === 'EN' ? 'Read Lead Story' : 'Leer Portada'}</span>
                                    </button>
                                </div>
                            </article>`;
                        })() : ''}

                        ${subCovers.length > 0 ? `
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                ${subCovers.map(sc => {
                                    const sTitle = this.getLocalizedNewsField(sc, 'title');
                                    const sSec = this.getOrbitaSectionMeta(sc.section);
                                    return `
                                    <article class="bg-white border border-stone-300 p-4 flex flex-col justify-between gap-2">
                                        <div>
                                            <span class="text-[10px] font-mono font-bold uppercase text-[#8B0000]">${this.escapeHTML(lang === 'EN' ? sSec.shortLabelEn : sSec.shortLabelEs)}</span>
                                            <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(sc.id)}')" class="text-left block w-full text-base font-orbita-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug mt-1">
                                                ${this.escapeHTML(sTitle)}
                                            </button>
                                        </div>
                                        <span class="text-[10px] font-mono text-stone-500">${this.escapeHTML(sc.publishedDate || '')}</span>
                                    </article>`;
                                }).join('')}
                            </div>
                        ` : ''}

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            ${['nasa', 'lanzamientos', 'tecnologia', 'juguetes'].map(secKey => {
                                const pool = (articlesBySec[secKey] || []).filter(a => !usedFrontIds.has(String(a.id)) && a.status !== 'DRAFT');
                                if (pool.length === 0) return '';
                                const pick = pool[0];
                                const sm = this.getOrbitaSectionMeta(secKey);
                                return `
                                <div class="bg-white border border-stone-300 p-4 space-y-2">
                                    <div class="flex items-center justify-between border-b border-stone-200 pb-1.5">
                                        <span class="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold uppercase text-[#8B0000]">
                                            ${this.getOrbitaIcon(sm.iconKey)}
                                            <span>${this.escapeHTML(lang === 'EN' ? sm.shortLabelEn : sm.shortLabelEs)}</span>
                                        </span>
                                        <button type="button" onclick="ui.setNewsSectionTab('${secKey}')" class="min-h-[44px] px-2 text-[11px] font-mono underline text-stone-600 hover:text-[#111111]">
                                            ${lang === 'EN' ? 'See all' : 'Ver sección'}
                                        </button>
                                    </div>
                                    <button type="button" onclick="ui.openSavedArticleFullReader('${this.escapeAttr(pick.id)}')" class="text-left block w-full text-base font-orbita-serif font-bold text-[#111111] hover:text-[#8B0000] leading-snug">
                                        ${this.escapeHTML(this.getLocalizedNewsField(pick, 'title'))}
                                    </button>
                                    <p class="text-xs font-orbita-serif text-stone-600 line-clamp-2">${this.escapeHTML(this.getLocalizedNewsField(pick, 'subtitle'))}</p>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>

                    <aside class="lg:col-span-4 space-y-6" aria-label="Las 10 más leídas">
                        <div class="bg-white border-2 border-[#111111] p-4 space-y-2">
                            <div class="border-b-2 border-[#111111] pb-2">
                                <h2 class="font-orbita-serif font-black text-lg text-[#111111] uppercase tracking-tight">
                                    ${lang === 'EN' ? 'Top 10 Most Read' : 'Las 10 más leídas'}
                                </h2>
                                <span id="orbita-top-reads-note" class="text-[10px] font-mono uppercase text-stone-500">
                                    ${lang === 'EN' ? 'Órbita editorial ranking' : 'Lecturas destacadas · Esta edición'}
                                </span>
                            </div>
                            <div id="orbita-top-reads-list" class="divide-y divide-stone-200">
                                <p class="text-xs font-mono text-stone-500 py-2">Cargando ranking...</p>
                            </div>
                        </div>
                    </aside>
                </div>
            ` : activeTab === 'quien' ? `
                ${this.renderWhoIsWhoDirectoryView(lang)}
            ` : activeTab === 'hemeroteca' ? `
                ${this.renderHemerotecaCalendarView(publishedOnly, lang)}
            ` : `
                <div class="space-y-7">
                    ${this.renderNewsSectionArticlesGrid(articlesBySec[activeTab] || [], activeTab, isCoord, lang)}
                    ${activeMeta.wireQuery ? `
                        <div class="bg-white border border-stone-300 p-4 space-y-3">
                            <div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#111111] pb-2">
                                <div>
                                    <h3 class="font-orbita-serif font-black text-base uppercase text-[#111111]">
                                        ${lang === 'EN' ? `International Wire · ${activeMeta.titleEn}` : `Teletipo Internacional · ${activeMeta.titleEs}`}
                                    </h3>
                                    <span id="orbital-wire-updated-at" class="text-[10px] font-mono text-stone-600 uppercase">Spaceflight News API v4</span>
                                </div>
                                ${isCoord ? `
                                    <button type="button" onclick="ui.fetchSpaceflightWire('${activeTab}', true)" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#111111] hover:bg-[#111111] hover:text-white text-xs text-[#111111] font-mono font-bold uppercase transition-colors" title="Actualizar cables internacionales">
                                        ${this.getOrbitaIcon('refresh')}
                                        <span>Actualizar Actualidad</span>
                                    </button>
                                ` : `
                                    <button type="button" onclick="ui.fetchSpaceflightWire('${activeTab}', false)" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-400 hover:border-[#111111] text-xs text-[#111111] font-mono font-bold uppercase transition-colors">
                                        ${this.getOrbitaIcon('refresh')}
                                        <span>${lang === 'EN' ? 'Sync Wire' : 'Sincronizar'}</span>
                                    </button>
                                `}
                            </div>
                            <div id="orbital-wire-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p class="text-xs font-mono text-stone-600 p-2 col-span-full">${lang === 'EN' ? 'Loading wire...' : 'Cargando cables internacionales...'}</p>
                            </div>
                        </div>
                    ` : ''}
                </div>
            `}

            <footer id="orbita-colophon" class="scroll-mt-24 border-t-4 border-double border-[#111111] pt-6 mt-8 bg-white border border-stone-300 p-5 sm:p-7 space-y-4">
                <div class="flex flex-wrap items-center justify-between gap-2 border-b border-stone-300 pb-2">
                    <h2 class="font-orbita-serif font-black text-xl text-[#111111]">
                        ${lang === 'EN' ? 'About this edition' : 'Sobre esta edición'}
                    </h2>
                    <span class="text-xs font-mono font-bold uppercase text-[#8B0000]">
                        Órbita. &bull; ${lang === 'EN' ? `Edition No. ${curEdition}` : `Edición N.º ${curEdition}`}
                    </span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs sm:text-sm font-orbita-serif text-stone-700 leading-relaxed">
                    <div>
                        <h3 class="font-mono font-bold uppercase text-[11px] text-[#111111] mb-1">
                            ${lang === 'EN' ? 'What you are reading' : 'Qué estás leyendo'}
                        </h3>
                        <p>
                            ${lang === 'EN'
                                ? 'Órbita is the digital and printed A3 newspaper of the 4º ESO MARS-KET aerospace project. It combines verified aerospace reporting with simulated news from student startups.'
                                : 'Órbita es el periódico digital e impreso en A3 del proyecto educativo MARS-KET (4º ESO). Combina divulgación aeroespacial verificada con la cobertura informativa de las empresas simuladas del aula.'}
                        </p>
                    </div>
                    <div>
                        <h3 class="font-mono font-bold uppercase text-[11px] text-[#111111] mb-1">
                            ${lang === 'EN' ? 'Real vs. Simulated' : 'Realidad frente a simulación'}
                        </h3>
                        <p>
                            ${lang === 'EN'
                                ? 'Every article displays its origin tag: REAL JOURNALISM covers NASA, launches, technology, and history; MARS-KET SIMULATION covers classroom startups and virtual-euro (€v) contracts.'
                                : 'Cada noticia indica su procedencia: ACTUALIDAD REAL agrupa noticias reales de ciencia, lanzamientos e historia; SIMULACIÓN MARS-KET cubre crónicas del instituto en euros virtuales (€v).'}
                        </p>
                    </div>
                    <div>
                        <h3 class="font-mono font-bold uppercase text-[11px] text-[#111111] mb-1">
                            ${lang === 'EN' ? 'Editorial Coordination & Privacy' : 'Coordinación y privacidad'}
                        </h3>
                        <p>
                            ${lang === 'EN'
                                ? 'Edited by project teachers. Student deliverables are reviewed before publication, with zero open comments or personal data tracking.'
                                : 'Coordinado por el profesorado del proyecto sin comentarios abiertos ni seguimiento de datos personales del alumnado.'}
                        </p>
                    </div>
                </div>
            </footer>
        `;

        el.appendChild(wrapper);
        if (activeTab === 'portada') {
            this.renderOrbitaTopReadsIntoDom();
            this.loadOrbitaTopReads();
        }
        if (activeMeta.wireQuery && document.getElementById('orbital-wire-list')) {
            this.fetchSpaceflightWire(activeTab, false);
        }
    }
});
