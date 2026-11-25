// js/ui-docente-eval.js
// --- MÓDULO DOCENTE: RÚBRICAS PONDERADAS (100%), ACTAS Y ARCHIVO DOCUMENTAL OFICIAL (v1.1.32) ---

Object.assign(ui, {
    archiveFilterPending: false,

    toggleArchiveFilterPending() {
        this.archiveFilterPending = !this.archiveFilterPending;
        this.render();
    },

    _snapshotSelectedDocKey: '',
    _snapshotSelectedClass: '',

    _getSnapshotDeliverableOptions(subjectFilter = null) {
        const all = [
            { key: 'preliminaryReport', label: 'FYQ 1: Informe Preliminar', subject: 'FYQ' },
            { key: 'technicalReport', label: 'FYQ 2: Informe Técnico Final', subject: 'FYQ' },
            { key: 'hoja_taller_fyq', label: 'FYQ 3: Hoja de Taller', subject: 'FYQ' },
            { key: 'brandIdentity_dec', label: 'LYE 1A: Marca e Identidad (Dic)', subject: 'LYE' },
            { key: 'brandIdentity_apr', label: 'LYE 1B: Evolución Marca (Abr)', subject: 'LYE' },
            { key: 'businessModelDoc', label: 'LYE 2: Business Model', subject: 'LYE' },
            { key: 'businessModelCanvas', label: 'LYE 3: Business Model Canvas', subject: 'LYE' },
            { key: 'decisionDiary_dec', label: 'LYE 4A: Diario Decisiones (Dic)', subject: 'LYE' },
            { key: 'decisionDiary_apr', label: 'LYE 4B: Diario Decisiones (Abr)', subject: 'LYE' },
            { key: 'investorDossier', label: 'LEN: Dossier de Inversores', subject: 'LEN' },
            { key: 'pressReleasesSummary', label: 'LEN: Notas de Prensa DOC_15 (I–IV)', subject: 'LEN', isPress: true },
            { key: 'budgetInitial', label: 'ECO 1: 1. Presupuesto Inicial', subject: 'ECO' },
            { key: 'budgetPostProto', label: 'ECO 2: 2. Presupuesto post-prototipo', subject: 'ECO' },
            { key: 'balanceSheet', label: 'ECO 3: 3. Ingresos-gastos reales', subject: 'ECO' },
            { key: 'incomeStatement', label: 'ECO 4: 4. Estudio de Variaciones Previsión vs Realidad', subject: 'ECO' },
            { key: 'goniometerEvidence', label: 'MAT 1: Goniómetro (Foto + Inf.)', subject: 'MAT' },
            { key: 'mathReportDist', label: 'MAT 2: Altura 1 Punto (Distancia)', subject: 'MAT' },
            { key: 'mathReportTwoPoints', label: 'MAT 3: Altura 2 Puntos (Alineados)', subject: 'MAT' },
            { key: 'mathReportFinal', label: 'MAT 4: Estudio Matemático Final', subject: 'MAT' }
        ];
        return subjectFilter ? all.filter(o => o.subject === subjectFilter) : all;
    },

    renderClassSnapshotBar(subjectFilter = null) {
        const options = this._getSnapshotDeliverableOptions(subjectFilter);
        if (!options || options.length === 0) return '';
        const selectedDoc = (this._snapshotSelectedDocKey && options.some(o => o.key === this._snapshotSelectedDocKey))
            ? this._snapshotSelectedDocKey
            : options[0].key;
        const activeCls = this._snapshotSelectedClass || this.evalClassFilter || this.currentClassFilter || 'A';
        return `
        <div class="mb-4 p-3 bg-slate-950/90 border border-mars-cyan/40 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
            <div class="flex items-center gap-2">
                <span class="text-xs font-orbitron font-bold text-mars-cyan uppercase">📸 Foto de Clase por Entregable</span>
                <span class="hidden sm:inline text-[11px] text-slate-400">Genera un PDF de control o descarga los Docs de una clase completa</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <select id="snapshot-doc-select" aria-label="Entregable para foto de clase" onchange="ui._snapshotSelectedDocKey = this.value" class="min-h-[44px] w-full sm:w-auto max-w-full bg-black border border-slate-700 text-white text-xs p-2 font-bold outline-none focus:border-mars-cyan">
                    ${options.map(o => `<option value="${this.escapeAttr(o.key)}" ${o.key === selectedDoc ? 'selected' : ''}>${this.escapeHTML(o.label)}</option>`).join('')}
                </select>
                <select id="snapshot-class-select" aria-label="Clase para foto de entregable" onchange="ui._snapshotSelectedClass = this.value" class="min-h-[44px] w-full sm:w-auto bg-black border border-mars-yellow/70 text-mars-yellow text-xs p-2 font-bold uppercase outline-none focus:border-mars-cyan">
                    ${['A', 'B', 'C', 'D', 'E', 'F', 'TEST'].map(c => `<option value="${c}" ${activeCls === c ? 'selected' : ''}>Clase ${c}</option>`).join('')}
                    <option value="ALL" ${activeCls === 'ALL' ? 'selected' : ''}>Todas las Clases (A–F)</option>
                </select>
                <button type="button" onclick="ui.exportClassDeliverableSnapshotPDF()" class="min-h-[44px] w-full sm:w-auto bg-mars-cyan text-black px-3.5 py-2 text-xs font-black uppercase hover:bg-white transition-colors">
                    📄 PDF Foto de Clase
                </button>
                <button type="button" onclick="ui.downloadClassDeliverableDocsPDF()" class="min-h-[44px] w-full sm:w-auto bg-emerald-950/70 text-emerald-300 border border-emerald-500/60 px-3.5 py-2 text-xs font-black uppercase hover:bg-emerald-500 hover:text-black transition-colors">
                    📥 Descargar PDFs Docs
                </button>
            </div>
        </div>`;
    },

    _collectClassDeliverableRows(docKeyOverride = null, classOverride = null) {
        const allOpts = this._getSnapshotDeliverableOptions(null);
        const selDocEl = typeof document !== 'undefined' ? document.getElementById('snapshot-doc-select') : null;
        const selClsEl = typeof document !== 'undefined' ? document.getElementById('snapshot-class-select') : null;
        const docKey = docKeyOverride || (selDocEl ? selDocEl.value : '') || this._snapshotSelectedDocKey || allOpts[0].key;
        const cls = classOverride || (selClsEl ? selClsEl.value : '') || this._snapshotSelectedClass || this.evalClassFilter || this.currentClassFilter || 'A';
        const opt = allOpts.find(o => o.key === docKey) || { key: docKey, label: docKey, subject: 'FYQ', isPress: docKey === 'pressReleasesSummary' };
        const defObj = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).find(d => d.key === docKey) || null;
        const deadlineTs = (defObj && typeof this.getDeliverableDeadlineTs === 'function') ? this.getDeliverableDeadlineTs(defObj) : 9999999999999;

        const companies = state.data?.companies || {};
        const cids = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            if (!co) return false;
            if (cls === 'ALL') {
                return !co.isTestCompany && String(co.classGroup || '').toUpperCase() !== 'TEST';
            }
            return String(co.classGroup || '').toUpperCase() === String(cls).toUpperCase();
        }).sort((a, b) => {
            const ca = companies[a];
            const cb = companies[b];
            const cmp = String(ca.classGroup || '').localeCompare(String(cb.classGroup || ''));
            return cmp !== 0 ? cmp : String(ca.name || a).localeCompare(String(cb.name || b));
        });

        const statusLabels = {
            DELIVERED_TO_TEACHER: 'Entregado',
            SUBMITTED_TO_CEO: 'En CEO',
            CEO_REVISION: 'Subsanar',
            DEVUELTO_A_TECNICO: 'Subsanar',
            EN_TALLER_OPERARIO: 'En Taller',
            DRAFT_TECNICO: 'Borrador'
        };

        const rows = cids.map(cid => {
            const co = companies[cid];
            const subjGrade = co.grades?.[opt.subject];
            const gradeVal = (subjGrade && subjGrade.final !== null && subjGrade.final !== undefined) ? Number(subjGrade.final).toFixed(2) : '--';

            if (opt.isPress) {
                const prs = co.pressReleases || {};
                const prItems = ['I', 'II', 'III', 'IV'].map(ph => {
                    const entry = prs[ph];
                    if (!entry || !entry.driveUrl || entry.status === 'RETURNED') return null;
                    const rawUrl = String(entry.driveUrl).trim();
                    const safeUrl = this.sanitizeDriveUrl ? this.sanitizeDriveUrl(rawUrl) : rawUrl;
                    const pdfUrl = this.getGooglePdfExportUrl ? this.getGooglePdfExportUrl(rawUrl) : '';
                    const ts = Number(entry.publishedAt || entry.updatedAt || 0);
                    return { phase: ph, status: entry.status || 'PUBLISHED', safeUrl, pdfUrl, ts, dateLabel: entry.publishedDate || (ts ? new Date(ts).toLocaleString('es-ES') : '--') };
                }).filter(Boolean);
                const latestTs = prItems.reduce((mx, p) => Math.max(mx, p.ts || 0), 0);
                return {
                    cid,
                    name: co.name || cid,
                    classGroup: co.classGroup || '--',
                    delivered: prItems.length > 0,
                    statusText: prItems.length > 0 ? `${prItems.length}/4 Fases (${prItems.map(p => p.phase).join(', ')})` : 'Pendiente (0/4)',
                    dateText: latestTs ? new Date(latestTs).toLocaleString('es-ES') : '--',
                    deadlineText: prItems.length > 0 ? 'Registrado' : 'Pendiente',
                    gradeText: gradeVal,
                    safeUrl: prItems[0]?.safeUrl || '',
                    pdfUrl: prItems[0]?.pdfUrl || '',
                    extraLinks: prItems
                };
            }

            const rawDoc = co.deliverables?.[docKey];
            const isObj = rawDoc && typeof rawDoc === 'object';
            const rawUrl = isObj ? String(rawDoc.driveUrl || rawDoc.url || rawDoc.dataUrl || '').trim() : String(rawDoc || '').trim();
            const safeUrl = rawUrl ? (this.sanitizeDriveUrl ? this.sanitizeDriveUrl(rawUrl) : rawUrl) : '';
            const pdfUrl = rawUrl && this.getGooglePdfExportUrl ? this.getGooglePdfExportUrl(rawUrl) : '';
            const st = !rawDoc ? 'PENDING' : (isObj ? (rawDoc.status || 'DELIVERED_TO_TEACHER') : 'DELIVERED_TO_TEACHER');
            const statusText = statusLabels[st] || (rawDoc ? 'Entregado' : 'Pendiente');
            const rawTs = isObj ? (rawDoc.updatedAt || rawDoc.date || 0) : 0;
            const parsedTs = typeof rawTs === 'number' ? rawTs : (rawTs ? Date.parse(rawTs) : 0);
            const docTs = isNaN(parsedTs) ? 0 : parsedTs;
            const dateText = docTs ? new Date(docTs).toLocaleString('es-ES') : (isObj && rawDoc.date ? String(rawDoc.date) : '--');
            const hasActiveDelivery = Boolean(rawDoc && st !== 'DRAFT_TECNICO');

            let deadlineText = 'Pendiente';
            if (!hasActiveDelivery || !safeUrl) {
                deadlineText = (deadlineTs < 9999999999999 && Date.now() > deadlineTs) ? 'Vencido sin entregar' : 'Pendiente';
            } else if (deadlineTs >= 9999999999999) {
                deadlineText = 'Sin límite';
            } else if (docTs > 0) {
                deadlineText = docTs <= deadlineTs ? 'En plazo' : 'Fuera de plazo';
            } else {
                deadlineText = 'Entregado';
            }

            return {
                cid,
                name: co.name || cid,
                classGroup: co.classGroup || '--',
                delivered: st === 'DELIVERED_TO_TEACHER' && Boolean(safeUrl),
                statusText,
                dateText,
                deadlineText,
                gradeText: gradeVal,
                safeUrl,
                pdfUrl,
                extraLinks: []
            };
        });

        return { opt, cls, defObj, deadlineTs, rows };
    },

    exportClassDeliverableSnapshotPDF(docKeyOverride = null, classOverride = null) {
        if (!state.user?.admin) return;
        const { opt, cls, deadlineTs, rows } = this._collectClassDeliverableRows(docKeyOverride, classOverride);
        if (rows.length === 0) {
            return this.notify(`No hay startups registradas en Clase ${cls} para generar la foto PDF.`, "warning");
        }

        const total = rows.length;
        const deliveredCount = rows.filter(r => r.delivered).length;
        const onTimeCount = rows.filter(r => r.deadlineText === 'En plazo').length;
        const pendingCount = total - deliveredCount;
        const deadlineLabel = deadlineTs < 9999999999999 ? new Date(deadlineTs).toLocaleString('es-ES') : 'Sin fecha límite';
        const nowStr = new Date().toLocaleString('es-ES');
        const classLabel = cls === 'ALL' ? 'Todas las Clases (4º A–F)' : `Clase 4º ${cls}`;

        const rowsHtml = rows.map((r, i) => {
            const stColor = r.delivered ? '#059669' : (r.statusText === 'Pendiente' || r.statusText === 'Pendiente (0/4)' ? '#dc2626' : '#d97706');
            const dlColor = r.deadlineText === 'En plazo' ? '#059669' : ((r.deadlineText === 'Fuera de plazo' || r.deadlineText === 'Vencido sin entregar') ? '#dc2626' : '#475569');
            let linksHtml = '<span style="color:#94a3b8; font-style:italic;">Sin enlace</span>';
            if (opt.isPress && r.extraLinks.length > 0) {
                linksHtml = r.extraLinks.map(p => {
                    const href = this.escapeAttr(p.safeUrl || '#');
                    const pdfH = p.pdfUrl ? ` <a href="${this.escapeAttr(p.pdfUrl)}" target="_blank" rel="noopener noreferrer" style="color:#059669; font-weight:bold; text-decoration:none;">[PDF]</a>` : '';
                    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#0284c7; font-weight:bold;">F.${this.escapeHTML(p.phase)} ↗</a>${pdfH}`;
                }).join(' · ');
            } else if (r.safeUrl) {
                linksHtml = `<a href="${this.escapeAttr(r.safeUrl)}" target="_blank" rel="noopener noreferrer" style="color:#0284c7; font-weight:bold;">Abrir Drive ↗</a>`;
                if (r.pdfUrl) {
                    linksHtml += ` &nbsp;<a href="${this.escapeAttr(r.pdfUrl)}" target="_blank" rel="noopener noreferrer" style="color:#059669; font-weight:bold;">[PDF ⬇]</a>`;
                }
            }
            return `
            <tr style="border-bottom: 1px solid #e2e8f0; background: ${i % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                <td style="padding: 7px 8px; font-weight: 700; color: #0f172a;">${this.escapeHTML(r.name)}</td>
                <td style="padding: 7px 6px; text-align: center; font-family: monospace;">${this.escapeHTML(r.classGroup)}</td>
                <td style="padding: 7px 8px; font-weight: 700; color: ${stColor};">${this.escapeHTML(r.statusText)}</td>
                <td style="padding: 7px 8px; font-family: monospace; font-size: 10px; color: #334155;">${this.escapeHTML(r.dateText)}</td>
                <td style="padding: 7px 8px; font-weight: 700; color: ${dlColor};">${this.escapeHTML(r.deadlineText)}</td>
                <td style="padding: 7px 6px; text-align: center; font-family: monospace; font-weight: bold;">${this.escapeHTML(r.gradeText)}</td>
                <td style="padding: 7px 8px; font-size: 10px;">${linksHtml}</td>
            </tr>`;
        }).join('');

        const docHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Foto de Entregables - ${this.escapeHTML(opt.label)} (${this.escapeHTML(classLabel)})</title>
    <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 0; line-height: 1.35; }
        .no-print { position: sticky; top: 0; z-index: 999; background: #0b0f19; color: #ffffff; padding: 12px 20px; border-bottom: 2px solid #00f0ff; display: flex; justify-content: space-between; align-items: center; gap: 10px; font-family: monospace; }
        .btn-print { background: #00f0ff; color: #000000; font-weight: 800; padding: 10px 18px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; text-transform: uppercase; }
        .btn-close { background: #334155; color: #ffffff; font-weight: 600; padding: 10px 14px; border: none; border-radius: 4px; cursor: pointer; font-size: 12px; }
        .doc-container { max-width: 900px; margin: 0 auto; padding: 20px; background: #ffffff; }
        @media print { .no-print { display: none !important; } .doc-container { max-width: 100% !important; padding: 0 !important; } }
    </style>
</head>
<body>
    <div class="no-print">
        <div>
            <strong style="color: #00f0ff; font-size: 13px;">📸 FOTO DE ENTREGA POR CLASE // MARS-KET OS</strong>
            <span style="color: #94a3b8; font-size: 12px; margin-left: 10px;">${this.escapeHTML(classLabel)} · ${this.escapeHTML(opt.label)}</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">🖨️ Guardar como PDF / Imprimir</button>
            <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
        </div>
    </div>
    <div class="doc-container">
        <div style="border: 2px solid #0f172a; padding: 14px 18px; margin-bottom: 16px; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 10px; flex-wrap: wrap; gap: 10px;">
                <div>
                    <span style="font-family: monospace; font-size: 10px; font-weight: bold; color: #0284c7; text-transform: uppercase; display: block;">
                        ACTA DE AUDITORÍA DOCENTE · FOTO DE ENTREGABLES
                    </span>
                    <h1 style="margin: 4px 0 0 0; font-size: 19px; font-weight: 900; text-transform: uppercase;">${this.escapeHTML(opt.label)}</h1>
                </div>
                <div style="text-align: right; font-family: monospace; font-size: 11px; color: #334155;">
                    <div style="font-size: 14px; font-weight: 900; color: #0f172a;">${this.escapeHTML(classLabel)}</div>
                    <div>Plazo oficial: ${this.escapeHTML(deadlineLabel)}</div>
                    <div>Foto tomada el: ${this.escapeHTML(nowStr)}</div>
                </div>
            </div>
            <div style="display: flex; gap: 18px; flex-wrap: wrap; font-size: 11px;">
                <span><strong>Empresas evaluadas:</strong> ${total}</span>
                <span style="color: #059669;"><strong>Entregados al docente:</strong> ${deliveredCount}/${total}</span>
                <span style="color: #0284c7;"><strong>En plazo:</strong> ${onTimeCount}</span>
                <span style="color: ${pendingCount > 0 ? '#dc2626' : '#059669'};"><strong>Faltan / en revisión:</strong> ${pendingCount}</span>
            </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
                <tr style="background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 10px;">
                    <th style="padding: 8px; text-align: left;">Startup</th>
                    <th style="padding: 8px 6px; text-align: center;">Clase</th>
                    <th style="padding: 8px; text-align: left;">Estado</th>
                    <th style="padding: 8px; text-align: left;">Último Envío</th>
                    <th style="padding: 8px; text-align: left;">Plazo</th>
                    <th style="padding: 8px 6px; text-align: center;">Nota ${this.escapeHTML(opt.subject)}</th>
                    <th style="padding: 8px; text-align: left;">Evidencia Drive / PDF</th>
                </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
        </table>
        <p style="margin-top: 14px; font-size: 10px; color: #64748b; font-family: monospace;">
            Los enlaces [PDF ⬇] exportan una copia PDF congelada directamente desde Google Docs/Drive con la sesión del profesorado del centro.
        </p>
    </div>
</body>
</html>`;
        const win = window.open('', '_blank');
        if (!win) {
            return this.notify("⚠️ Tu navegador bloqueó la ventana emergente. Permite popups para abrir el informe PDF.", "warning");
        }
        win.document.open();
        win.document.write(docHtml);
        win.document.close();
        win.focus();
    },

    downloadClassDeliverableDocsPDF(docKeyOverride = null, classOverride = null) {
        if (!state.user?.admin) return;
        const { opt, cls, rows } = this._collectClassDeliverableRows(docKeyOverride, classOverride);
        const downloadItems = [];
        rows.forEach(r => {
            if (opt.isPress && r.extraLinks.length > 0) {
                r.extraLinks.forEach(p => {
                    if (p.pdfUrl) {
                        downloadItems.push({ name: `${r.name} (Fase ${p.phase})`, classGroup: r.classGroup, pdfUrl: p.pdfUrl, driveUrl: p.safeUrl });
                    }
                });
            } else if (r.pdfUrl) {
                downloadItems.push({ name: r.name, classGroup: r.classGroup, pdfUrl: r.pdfUrl, driveUrl: r.safeUrl });
            }
        });

        if (downloadItems.length === 0) {
            return this.notify("⚠️ No hay Google Docs/Sheets/Slides entregados con enlace exportable a PDF en esta selección.", "warning");
        }

        let blockedByPopup = false;
        let autoLaunched = 0;
        if (downloadItems.length <= 8) {
            downloadItems.forEach(item => {
                const w = window.open(item.pdfUrl, '_blank', 'noopener,noreferrer');
                if (w) autoLaunched++;
                else blockedByPopup = true;
            });
        }

        const listHtml = downloadItems.map(it => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-slate-900 border border-slate-800 rounded">
                <div class="min-w-0">
                    <span class="text-xs font-bold text-white uppercase">${this.escapeHTML(it.name)}</span>
                    <span class="ml-2 text-[10px] font-mono text-mars-yellow">Clase ${this.escapeHTML(it.classGroup)}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <a href="${this.escapeAttr(it.pdfUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500 hover:text-black rounded text-xs font-mono font-bold">⬇️ Descargar PDF</a>
                    <a href="${this.escapeAttr(it.driveUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-slate-950 text-mars-cyan border border-mars-cyan/40 hover:bg-mars-cyan hover:text-black rounded text-xs font-mono font-bold">Drive ↗</a>
                </div>
            </div>
        `).join('');

        const noteHtml = downloadItems.length > 8
            ? `<p class="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/40 p-2.5 rounded">Hay ${downloadItems.length} documentos en esta selección. Para no bloquear el navegador, descárgalos desde la lista inferior o filtra por una única clase (A–F).</p>`
            : (blockedByPopup
                ? `<p class="text-xs text-amber-300 bg-amber-950/40 border border-amber-500/40 p-2.5 rounded">Tu navegador ha bloqueado parte de las descargas simultáneas (${autoLaunched}/${downloadItems.length} abiertas). Pulsa aquí debajo las que falten:</p>`
                : `<p class="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 p-2.5 rounded">✅ Se han lanzado ${autoLaunched} descargas PDF desde Google Docs. Si alguna no se guardó, puedes relanzarla aquí:</p>`);

        const modalBody = `
        <div class="space-y-3 font-sans">
            <div class="text-xs text-slate-300">
                <strong class="text-mars-cyan uppercase">${this.escapeHTML(opt.label)}</strong> · Clase: <strong class="text-white">${this.escapeHTML(cls)}</strong>
            </div>
            ${noteHtml}
            <div class="space-y-2 max-h-72 overflow-y-auto pr-1">${listHtml}</div>
        </div>`;
        this.showModal(`📥 PDFs de Clase ${cls} · ${opt.label}`, modalBody, '');
    },

    getPendingEvalDocsForSubject(co, subject) {
        if (!co || !subject) return { pendingCount: 0, readyTotal: 0, resubmittedCount: 0, awaitingSubsanacionCount: 0 };
        const docToCrit = {
            FYQ: { preliminaryReport: 'c1', hoja_taller_fyq: 'c_ws', technicalReport: 'c2' },
            ECO: { budgetInitial: 'c2', incomeStatement: 'c3', budgetPostProto: 'c4', balanceSheet: 'c5' },
            LYE: { brandIdentity_dec: 'c1', brandIdentity_apr: 'c2', businessModelDoc: 'c3', businessModelCanvas: 'c4', decisionDiary_dec: 'c5', decisionDiary_apr: 'c6' },
            LEN: { investorDossier: 'c2' },
            MAT: { goniometerEvidence: 'c1', mathReportDist: 'c2', mathReportTwoPoints: 'c3', mathReportFinal: 'c4' },
            ING: {}
        }[subject] || {};

        const docs = co.deliverables || {};
        const gradeObj = co.grades?.[subject];
        const scores = gradeObj?.scores || {};
        const gradeTs = Number(gradeObj?.updatedAt || 0);

        let pendingCount = 0;
        let readyTotal = 0;
        let resubmittedCount = 0;
        let awaitingSubsanacionCount = 0;

        Object.entries(docToCrit).forEach(([docKey, critId]) => {
            const docItem = docs[docKey];
            if (!docItem) return;
            const isLegacyStr = typeof docItem === 'string' && docItem.trim().length > 0;
            const st = isLegacyStr ? 'DELIVERED_TO_TEACHER' : docItem.status;
            if ((st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') && typeof docItem === 'object' && docItem.returnByTeacher) {
                awaitingSubsanacionCount++;
                return;
            }
            if (st !== 'DELIVERED_TO_TEACHER') return;
            readyTotal++;
            const isResubmitted = Boolean(!isLegacyStr && typeof docItem === 'object' && docItem.resubmittedAfterTeacherReturn);
            if (isResubmitted) resubmittedCount++;
            const hasScore = scores[critId] !== undefined && scores[critId] !== null && scores[critId] !== '';
            const docTs = (typeof docItem === 'object' && docItem.updatedAt) ? Date.parse(docItem.updatedAt) : 0;
            if (isResubmitted || !hasScore || (docTs && gradeTs && docTs > gradeTs)) {
                pendingCount++;
            }
        });

        if (subject === 'LEN' && co.pressReleases) {
            const phaseCritMap = { I: 'c3', II: 'c4', III: 'c5', IV: 'c6' };
            ['I', 'II', 'III', 'IV'].forEach(ph => {
                const pr = co.pressReleases[ph];
                if (!pr) return;
                if (pr.status === 'RETURNED') {
                    awaitingSubsanacionCount++;
                    return;
                }
                if (!pr.driveUrl) return;
                readyTotal++;
                const isResub = Boolean(pr.resubmittedAfterTeacherReturn);
                if (isResub) resubmittedCount++;
                const cId = phaseCritMap[ph];
                const hasPrScore = scores[cId] !== undefined && scores[cId] !== null && scores[cId] !== '';
                const prTs = Math.max(Number(pr.updatedAt || 0), Number(pr.publishedAt || 0));
                if (isResub || !hasPrScore || (prTs && gradeTs && prTs > gradeTs)) {
                    pendingCount++;
                }
            });
        }
        return { pendingCount, readyTotal, resubmittedCount, awaitingSubsanacionCount };
    },

    renderAdminEval() {
        this.evalClassFilter = this.evalClassFilter || this.currentClassFilter || 'ALL';
        const isCoord = Boolean(state.user?.isCoordinator || String(state.user?.role || '').toUpperCase().startsWith('COORD') || String(state.user?.role || '').toLowerCase() === 'coordinador');
        const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        
        let adminHtml = `<div class="mb-6 flex flex-wrap gap-3 items-center bg-slate-900 p-3 border border-mars-border">`;
        if(isCoord) {
            adminHtml += `
            <select aria-label="Vista de evaluación de coordinación" onchange="ui.coordEvalView=this.value; ui.evalSelectedCo=''; ui.evalOnlyResubmitted=false; ui.render()" class="min-h-[44px] w-full sm:w-auto max-w-full bg-black border border-mars-cyan text-mars-cyan text-xs p-2.5 uppercase font-bold outline-none cursor-pointer">
                <option value="ACTA" ${this.coordEvalView==='ACTA'?'selected':''}>📊 Acta General Calificaciones (100% Ponderada)</option>
                <option value="ARCHIVE" ${this.coordEvalView==='ARCHIVE'?'selected':''}>📁 Archivo Documental Central (Entregables Drive)</option>
                ${['FYQ','LYE','LEN','ECO','MAT','ING'].map(s => `<option value="${s}" ${this.coordEvalView===s?'selected':''}>Evaluar: ${this.escapeHTML(RUBRIC_CONFIG[s]?.name || s)} (${Math.round((weights[s]||0)*100)}%)</option>`).join('')}
            </select>
            ${this.coordEvalView === 'ACTA' ? `<button onclick="ui.exportActaCSV()" class="min-h-[44px] w-full sm:w-auto bg-mars-green text-black px-4 py-2 text-xs font-black uppercase hover:bg-white transition-colors">Exportar Acta Ponderada CSV</button>` : ''}
            `;
        } else {
            const wPct = Math.round((weights[activeSubject] || 0) * 100);
            adminHtml += `<h3 class="font-orbitron text-mars-cyan text-sm uppercase px-4 py-2">Módulo Calificador: <span class="text-white">${this.escapeHTML(RUBRIC_CONFIG[activeSubject]?.name || activeSubject)}</span> <span class="text-mars-yellow text-xs ml-2">[PESO PROYECTO: ${wPct}%]</span></h3>`;
        }
        
        if (isCoord && (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE')) {
            adminHtml += `
            <select aria-label="Filtrar por clase" onchange="ui.setClassFilter(this.value); ui.evalSelectedCo='';" class="min-h-[44px] w-full sm:w-auto bg-black border border-mars-yellow text-mars-yellow text-xs p-2.5 uppercase font-bold outline-none cursor-pointer sm:ml-auto">
                <option value="ALL" ${this.evalClassFilter==='ALL'?'selected':''}>Todas las Clases</option>
                ${['A','B','C','D','E','F','TEST'].map(c => `<option value="${c}" ${this.evalClassFilter===c?'selected':''}>Clase ${c}</option>`).join('')}
            </select>`;
        }
        adminHtml += `</div>`;

        if(isCoord && this.coordEvalView === 'ACTA') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-mars-border pb-3 gap-2">
                    <div>
                        <h4 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Matriz Oficial de Calificaciones Ponderadas</h4>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Fórmula: 25% FYQ + 40% LYE + 15% LEN + 10% ECO + 5% MAT + 5% ING · Pulsa cualquier fila para abrir su evaluación</p>
                    </div>
                </div>
                <div class="overflow-x-auto max-h-[560px] overflow-y-auto w-full">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-slate-900 z-20">
                            <tr>
                                <th class="py-3 px-2 sticky left-0 bg-slate-900 z-10 border-r border-mars-border">Startups</th>
                                <th class="pr-3">FYQ <span class="text-mars-cyan">(25%)</span></th>
                                <th class="pr-3">LYE <span class="text-mars-cyan">(40%)</span></th>
                                <th class="pr-3">LEN <span class="text-mars-cyan">(15%)</span></th>
                                <th class="pr-3">ECO <span class="text-mars-cyan">(10%)</span></th>
                                <th class="pr-3">MAT <span class="text-mars-cyan">(5%)</span></th>
                                <th class="pr-3">ING <span class="text-mars-cyan">(5%)</span></th>
                                <th class="pr-3 text-slate-300">% Eval.</th>
                                <th class="text-mars-yellow">Nota Global ( sobre 10 )</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const g = co.grades || {}; 
                                const subOrder = ['FYQ','LYE','LEN','ECO','MAT','ING'];
                                
                                let weightedTotal = 0;
                                let evaluatedWeight = 0;

                                const cellsHtml = subOrder.map(s => {
                                    const hasGrade = g[s] && g[s].final !== null && g[s].final !== undefined;
                                    const val = hasGrade ? Number(g[s].final) : null;
                                    if (val !== null) {
                                        weightedTotal += val * (weights[s] || 0);
                                        evaluatedWeight += (weights[s] || 0);
                                    }
                                    return `<td class="py-3 font-mono pr-3 ${val!==null?'text-mars-cyan font-bold':'text-slate-400'}">${val!==null ? val.toFixed(2) : '--'}</td>`;
                                }).join('');

                                const pctEval = Math.round(evaluatedWeight * 100);
                                const finalDisplay = evaluatedWeight > 0 ? weightedTotal.toFixed(2) : '-';
                                
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-mars-cyan/5">
                                    <td class="py-2.5 px-2 font-orbitron text-white font-bold sticky left-0 bg-slate-950 z-10 border-r border-mars-border/60"><button type="button" onclick="ui.coordEvalView='FYQ'; ui.goToCompanyEval('${this.escapeHTML(cid)}')" class="min-h-[44px] text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 max-w-[260px] truncate inline-flex items-center align-middle" title="Evaluar ${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</button></td>${cellsHtml}
                                    <td class="py-3 font-mono pr-3 text-xs">
                                        <div class="flex items-center gap-2">
                                            <div class="w-12 bg-black h-1.5 rounded-sm overflow-hidden border border-slate-700 shrink-0">
                                                <div class="${pctEval === 100 ? 'bg-mars-green' : 'bg-mars-cyan'} h-full transition-all" style="width: ${pctEval}%"></div>
                                            </div>
                                            <span class="${pctEval === 100 ? 'text-mars-green font-bold' : 'text-slate-300'}">${pctEval}%</span>
                                        </div>
                                    </td>
                                    <td class="py-3 font-mono text-mars-yellow font-black text-sm">${finalDisplay}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } else if(isCoord && this.coordEvalView === 'ARCHIVE') {
            const docCols = [
                { key: 'preliminaryReport', label: 'FYQ 1: Prelim' },
                { key: 'technicalReport', label: 'FYQ 2: Inf. Técnico' },
                { key: 'hoja_taller_fyq', label: 'FYQ 3: Hoja Taller' },
                { key: 'brandIdentity_dec', label: 'LYE 1A: Marca Dic' },
                { key: 'brandIdentity_apr', label: 'LYE 1B: Marca Abr' },
                { key: 'businessModelDoc', label: 'LYE 2: Bus. Model' },
                { key: 'businessModelCanvas', label: 'LYE 3: Canvas' },
                { key: 'decisionDiary_dec', label: 'LYE 4A: Diario Dic' },
                { key: 'decisionDiary_apr', label: 'LYE 4B: Diario Abr' },
                { key: 'investorDossier', label: 'LEN: Dossier Inv.' },
                { key: 'pressReleasesSummary', label: 'LEN: Notas Prensa', isPress: true },
                { key: 'budgetInitial', label: 'ECO 1: Pres. Ini' },
                { key: 'budgetPostProto', label: 'ECO 2: Post-Proto' },
                { key: 'balanceSheet', label: 'ECO 3: Ing-Gas Reales' },
                { key: 'incomeStatement', label: 'ECO 4: Variaciones' },
                { key: 'goniometerEvidence', label: 'MAT 1: Gonióm.' },
                { key: 'mathReportDist', label: 'MAT 2: Dist. Base' },
                { key: 'mathReportTwoPoints', label: 'MAT 3: 2 Puntos' },
                { key: 'mathReportFinal', label: 'MAT 4: Inf. Final' }
            ];

            const filteredCos = Object.keys(state.data.companies)
                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter);
            const totalPossible = filteredCos.length * docCols.length;
            let totalDelivered = 0;
            filteredCos.forEach(cid => {
                const co = state.data.companies[cid];
                const d = co?.deliverables || {};
                const prs = co?.pressReleases || {};
                const hasAnyPr = ['I','II','III','IV'].some(ph => Boolean(prs[ph]?.driveUrl && prs[ph]?.status !== 'RETURNED'));
                const isDocDone = doc => Boolean(doc && (typeof doc === 'string' || (doc.status || 'DELIVERED_TO_TEACHER') === 'DELIVERED_TO_TEACHER'));
                totalDelivered += docCols.filter(col => col.isPress ? hasAnyPr : isDocDone(d[col.key])).length;
            });
            const pctGlobal = totalPossible > 0 ? Math.round((totalDelivered / totalPossible) * 100) : 0;

            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 w-full overflow-hidden">
                <div class="mb-4 border-b border-mars-border pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Auditoría del Archivo Documental Central (${docCols.length} Entregables Oficiales Drive)</h4>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control de subida de enlaces en Google Drive (Desliza horizontalmente ➔)</p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-xs bg-black border border-mars-cyan/60 px-3 py-1.5 text-mars-cyan font-mono font-bold">
                            Recibidos: <strong class="text-white">${totalDelivered}/${totalPossible}</strong> (${pctGlobal}%)
                        </span>
                        <button type="button" onclick="ui.toggleArchiveFilterPending()" class="min-h-[44px] px-3 py-1.5 text-xs font-bold uppercase transition-all rounded-sm ${this.archiveFilterPending ? 'bg-mars-yellow text-black shadow-sm font-black' : 'bg-slate-900 text-slate-300 border border-slate-700 hover:text-white'}">
                            ${this.archiveFilterPending ? '⚡ Mostrando: Solo Incompletos' : '🔍 Filtrar: Solo Incompletos'}
                        </button>
                    </div>
                </div>
                ${this.renderClassSnapshotBar(null)}
                <div class="overflow-x-auto w-full pb-2">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-slate-900 z-20">
                            <tr>
                                <th class="py-3 px-2 sticky left-0 bg-slate-900 z-10 border-r border-mars-border">Empresa</th>
                                <th class="py-3 px-2 text-center">Progreso</th>
                                ${docCols.map(col => `<th class="py-3 px-2 text-center"><div class="flex flex-col items-center gap-1"><span>${col.label}</span><button type="button" onclick="ui.exportClassDeliverableSnapshotPDF('${this.escapeAttr(col.key)}')" title="Sacar Foto PDF de ${this.escapeAttr(col.label)}" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 py-0.5 text-[10px] bg-slate-950 border border-mars-cyan/40 text-mars-cyan hover:bg-mars-cyan hover:text-black rounded font-mono font-bold">📸 Foto</button></div></th>`).join('')}
                                <th class="py-3 px-2 text-center">IA Prompts</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredCos
                                .filter(cid => {
                                    if (!this.archiveFilterPending) return true;
                                    const co = state.data.companies[cid];
                                    const d = co?.deliverables || {};
                                    const prs = co?.pressReleases || {};
                                    const hasAnyPr = ['I','II','III','IV'].some(ph => Boolean(prs[ph]?.driveUrl && prs[ph]?.status !== 'RETURNED'));
                                    const isDocDone = doc => Boolean(doc && (typeof doc === 'string' || (doc.status || 'DELIVERED_TO_TEACHER') === 'DELIVERED_TO_TEACHER'));
                                    const deliveredTotal = docCols.filter(col => col.isPress ? hasAnyPr : isDocDone(d[col.key])).length;
                                    return deliveredTotal < docCols.length;
                                })
                                .map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {}; 
                                const prs = co.pressReleases || {};
                                const hasAnyPr = ['I','II','III','IV'].some(ph => Boolean(prs[ph]?.driveUrl && prs[ph]?.status !== 'RETURNED'));
                                const aiCount = (co.aiPrompts||[]).filter(p=>p.status==='APROBADO').length;
                                const isDocDone = doc => Boolean(doc && (typeof doc === 'string' || (doc.status || 'DELIVERED_TO_TEACHER') === 'DELIVERED_TO_TEACHER'));
                                const deliveredTotal = docCols.filter(col => col.isPress ? hasAnyPr : isDocDone(d[col.key])).length;
                                
                                const dLink = (doc, colKey, colObj) => {
                                    if (colObj?.isPress) {
                                        const prPublished = ['I','II','III','IV'].filter(ph => prs[ph]?.driveUrl && prs[ph]?.status !== 'RETURNED');
                                        if (prPublished.length > 0) {
                                            const prLinks = prPublished.map(ph => {
                                                const prUrlRaw = prs[ph].driveUrl;
                                                const prSafe = (typeof this.sanitizeDriveUrl === 'function') ? this.sanitizeDriveUrl(prUrlRaw) : encodeURI(String(prUrlRaw)).replace(/"/g, '&quot;');
                                                return `<a href="${prSafe}" target="_blank" rel="noopener noreferrer" class="px-1.5 py-0.5 bg-mars-cyan/15 text-mars-cyan border border-mars-cyan/60 hover:bg-mars-cyan hover:text-black text-[10px] font-mono font-bold">F.${ph} ↗</a>`;
                                            }).join('');
                                            return `<div class="flex flex-col items-center gap-1"><span class="text-[10px] font-mono text-mars-cyan font-bold">📰 ${prPublished.length}/4</span><div class="flex flex-wrap justify-center gap-1">${prLinks}</div></div>`;
                                        }
                                        return `<div class="flex flex-col items-center gap-1"><span class="min-h-[44px] flex items-center justify-center text-slate-500 border border-slate-800 px-2 py-1 text-center font-mono">0/4</span></div>`;
                                    }
                                    const tplRaw = this.getDeliverableTemplateUrl ? this.getDeliverableTemplateUrl(colKey) : (state.data.config?.deliverableSchedule?.[colKey]?.guideDocUrl || '');
                                    const tplView = (tplRaw && this.isDocsEditorUrl && this.isDocsEditorUrl(tplRaw)) ? this.getGoogleViewUrl(tplRaw) : tplRaw;
                                    const templateBadge = tplView ? `<a href="${encodeURI(tplView).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-[9px] text-mars-cyan block hover:underline" title="Ver Plantilla Docente">📄 Plantilla ↗</a>` : '';
                                    if (doc) {
                                        const docUrlRaw = doc.driveUrl || doc.url || doc.dataUrl || '#';
                                        const docUrl = (docUrlRaw !== '#' && typeof this.sanitizeDriveUrl === 'function') ? this.sanitizeDriveUrl(docUrlRaw) : encodeURI(String(docUrlRaw)).replace(/"/g, '&quot;');
                                        const st = (typeof doc === 'string') ? 'DELIVERED_TO_TEACHER' : (doc.status || 'DELIVERED_TO_TEACHER');
                                        let badgeCls = 'bg-mars-green/15 text-mars-green border border-mars-green hover:bg-mars-green hover:text-black';
                                        let badgeTxt = (doc.type === 'link' || doc.driveUrl || doc.url) ? '🔗 LINK' : '📁 FILE';
                                        if (st === 'SUBMITTED_TO_CEO') {
                                            badgeCls = 'bg-amber-950/60 text-amber-300 border border-amber-500/60 hover:bg-amber-400 hover:text-black';
                                            badgeTxt = '⏳ En CEO';
                                        } else if (st === 'CEO_REVISION' || st === 'DEVUELTO_A_TECNICO') {
                                            badgeCls = 'bg-red-950/60 text-red-300 border border-red-500/60 hover:bg-red-500 hover:text-white';
                                            badgeTxt = '↩ Subsanar';
                                        } else if (st === 'EN_TALLER_OPERARIO') {
                                            badgeCls = 'bg-blue-950/60 text-blue-300 border border-blue-500/60 hover:bg-blue-400 hover:text-black';
                                            badgeTxt = '⚙️ Taller';
                                        } else if (st === 'DRAFT_TECNICO') {
                                            badgeCls = 'bg-slate-900 text-slate-300 border border-slate-600 hover:border-mars-cyan';
                                            badgeTxt = '📝 Borrador';
                                        }
                                        const pdfCompact = this.renderTeacherPdfBtnHtml ? this.renderTeacherPdfBtnHtml(docUrlRaw, true) : '';
                                        return `<div class="flex flex-col items-center gap-1"><div class="flex items-center gap-1"><a href="${docUrl || '#'}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] flex items-center justify-center ${badgeCls} px-2 py-1 font-bold transition-colors text-center text-[11px]">${badgeTxt}</a>${pdfCompact}</div>${templateBadge}</div>`;
                                    }
                                    return `<div class="flex flex-col items-center gap-1"><span class="min-h-[44px] flex items-center justify-center text-slate-400 border border-slate-800 px-2 py-1 text-center">--</span>${templateBadge}</div>`;
                                };
                                
                                const aLink = aiCount > 0 
                                    ? `<span class="text-mars-cyan font-bold bg-mars-cyan/10 border border-mars-cyan px-2 py-1 block text-center">✓ ${aiCount}</span>` 
                                    : `<span class="text-slate-400 border border-slate-800 px-2 py-1 block text-center">0</span>`;

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-2.5 px-2 font-orbitron text-white font-bold sticky left-0 bg-slate-950 font-orbitron font-bold text-white z-10 border-r border-mars-border/60 max-w-[220px] truncate" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)} [${this.escapeHTML(co.classGroup)}]</td>
                                    <td class="py-2.5 px-2 font-mono font-bold text-center text-mars-yellow">${deliveredTotal}/${docCols.length}</td>${docCols.map(col => `<td class="py-2.5 px-1.5">${dLink(d[col.key], col.key, col)}</td>`).join('')}
                                    <td class="py-2.5 px-1.5">${aLink}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;

        } else if(activeSubject) {
            const config = RUBRIC_CONFIG[activeSubject];
            const subWeightPct = Math.round((weights[activeSubject] || 0) * 100);
            const curPhase = (typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I');

            // 1. Asistente Docente Inteligente ("¿Qué me toca hacer hoy?")
            adminHtml += this.renderTeacherAssistantBanner(activeSubject, curPhase);

            // 2. Guía Visual Desplegable de las 5 Fases
            adminHtml += this.renderTeacherPhaseGuide(activeSubject, curPhase);

            // 3. Selector Visual de Startups en Cascada (1º Clase ➔ 2º Tarjetas)
            adminHtml += `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 mb-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
                    <div>
                        <h4 class="font-orbitron text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                            🎯 Selección de Startups a Evaluar
                        </h4>
                        <p class="text-[11px] text-slate-300 mt-0.5">
                            Filtra por clase y pulsa sobre cualquier empresa para abrir su ficha de calificación y evidencias Drive.
                        </p>
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <label for="eval-co-select" class="sr-only">Buscador Rápido de Startup</label>
                        <select id="eval-co-select" onchange="ui.selectEvalCo(this.value)" class="min-h-[44px] w-full sm:w-auto bg-slate-900 border border-mars-border text-white text-xs p-2 uppercase font-bold outline-none focus:border-mars-cyan">
                            <option value="">-- Buscar por Nombre --</option>
                            ${Object.keys(state.data.companies)
                                .filter(cid => this.evalClassFilter === 'ALL' || state.data.companies[cid].classGroup === this.evalClassFilter)
                                .map(cid => `<option value="${this.escapeHTML(cid)}" ${this.evalSelectedCo===cid?'selected':''}>${this.escapeHTML(state.data.companies[cid].name)} [Clase ${this.escapeHTML(state.data.companies[cid].classGroup)}]</option>`).join('')}
                        </select>
                    </div>
                </div>

                ${this.renderClassStartupCards(activeSubject, this.evalClassFilter)}
            </div>
            ${this.renderClassSnapshotBar(activeSubject)}`;

            if (this.evalSelectedCo && !state.data.companies?.[this.evalSelectedCo]) {
                this.evalSelectedCo = '';
            }
            if(!this.evalSelectedCo) {
                adminHtml += `
                <div class="terminal-border bg-black/40 border border-slate-800 border-dashed p-8 text-center rounded">
                    <p class="text-sm font-orbitron text-mars-cyan uppercase tracking-wider mb-2">
                        👆 Pulsa sobre cualquier startup de la cuadrícula superior para evaluar
                    </p>
                    <p class="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                        Podrás calificar los criterios correspondientes a la fase actual y consultar las evidencias oficiales de Google Drive en tiempo real.
                    </p>
                </div>`;
            } else {
                const co = state.data.companies[this.evalSelectedCo];
                const pastGrade = (co.grades && co.grades[activeSubject]) ? co.grades[activeSubject] : { scores: {}, feedback: '' };
                const docs = co.deliverables || {};
                
                let evidenceHtml = `<h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Evidencias Adjuntas (${this.escapeHTML(activeSubject)})</h4>`;
                
                if (activeSubject === 'FYQ') {
                    evidenceHtml += this.renderDocBadge('1. Hoja Registro Preliminar (Dic)', docs.preliminaryReport, false, this.evalSelectedCo, 'preliminaryReport');
                    evidenceHtml += this.renderDocBadge('2. Hoja Oficial de Taller, BOM y Calidad', docs.hoja_taller_fyq, false, this.evalSelectedCo, 'hoja_taller_fyq');
                    evidenceHtml += this.renderDocBadge('3. Informe Técnico Final (Abr)', docs.technicalReport, false, this.evalSelectedCo, 'technicalReport');
                    if(co.flightTests && co.flightTests.length > 0) {
                        evidenceHtml += `<div class="mt-4 bg-black p-3 border border-slate-800"><span class="text-mars-yellow text-xs font-bold uppercase block mb-2">Ensayos en Banco de Pruebas:</span><div class="text-xs space-y-2 max-h-56 overflow-y-auto">`;
                        co.flightTests.forEach(f => {
                            const h_mm = f.heightMm !== undefined ? f.heightMm : (f.heightM * 1000);
                            const vUrl = typeof f.videoUrl === 'string' ? f.videoUrl.trim() : '';
                            const hasValidVideo = vUrl && (typeof GOOGLE_DRIVE_REGEX !== 'undefined' ? GOOGLE_DRIVE_REGEX.test(vUrl) : /^https:\/\/(docs|drive)\.google\.com\//i.test(vUrl));
                            const videoBadgeHtml = hasValidVideo
                                ? `<a href="${encodeURI(vUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/70 border border-mars-cyan/60 text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase rounded transition-colors shrink-0">🎥 Ver Vídeo E ↗</a>`
                                : `<span class="text-[11px] font-mono text-slate-500 uppercase">Sin vídeo de cálculo</span>`;
                            evidenceHtml += `<div class="text-slate-200 border-b border-slate-900 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 break-words"><div>${this.escapeHTML(f.bottle)} | H: <strong class="text-mars-green">${Number(h_mm).toFixed(0)} mm</strong> | C: ${f.costEurV}€v | E: <strong class="text-mars-yellow">${Number(f.efficiency).toFixed(2)}</strong></div>${videoBadgeHtml}</div>`;
                        });
                        evidenceHtml += `</div></div>`;
                    }
                } else if (activeSubject === 'ECO') {
                    evidenceHtml += `<p class="text-xs text-mars-yellow uppercase font-bold mb-2">Nota: El criterio 1 corresponde al Test Evaluativo (20%).</p>`;
                    evidenceHtml += this.renderDocBadge('1. Presupuesto Inicial (20% - Fase I)', docs.budgetInitial, false, this.evalSelectedCo, 'budgetInitial');
                    evidenceHtml += this.renderDocBadge('2. Presupuesto post-prototipo (20% - Fase II)', docs.budgetPostProto, false, this.evalSelectedCo, 'budgetPostProto');
                    evidenceHtml += this.renderDocBadge('3. Ingresos-gastos reales (20% - Fase III)', docs.balanceSheet, false, this.evalSelectedCo, 'balanceSheet');
                    evidenceHtml += this.renderDocBadge('4. Estudio de Variaciones Previsión vs Realidad (20% - Fase IV)', docs.incomeStatement, false, this.evalSelectedCo, 'incomeStatement');
                } else if (activeSubject === 'LYE') {
                    evidenceHtml += this.renderDocBadge('1A. Identidad y Misión (Diciembre)', docs.brandIdentity_dec, false, this.evalSelectedCo, 'brandIdentity_dec');
                    evidenceHtml += this.renderDocBadge('1B. Identidad y Misión (Abril)', docs.brandIdentity_apr, false, this.evalSelectedCo, 'brandIdentity_apr');
                    evidenceHtml += this.renderDocBadge('2. Business Model Escrito', docs.businessModelDoc, false, this.evalSelectedCo, 'businessModelDoc');
                    evidenceHtml += this.renderDocBadge('3. Business Model Canvas', docs.businessModelCanvas, false, this.evalSelectedCo, 'businessModelCanvas');
                    evidenceHtml += this.renderDocBadge('4A. Diario Decisiones e IA (Diciembre)', docs.decisionDiary_dec, false, this.evalSelectedCo, 'decisionDiary_dec');
                    evidenceHtml += this.renderDocBadge('4B. Diario Decisiones e IA (Abril)', docs.decisionDiary_apr, false, this.evalSelectedCo, 'decisionDiary_apr');
                    evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-xs font-bold uppercase">Manifiesto / Propuesta de Valor:</span><p class="text-xs text-slate-200 italic mt-1 bg-black p-3 border border-slate-800 leading-relaxed max-h-28 overflow-y-auto break-words">"${this.escapeHTML(co.valueProposition || 'No redactada todavía.')}"</p></div>`;
                } else if (activeSubject === 'LEN') {
                    evidenceHtml += this.renderDocBadge('1. Dossier para Inversores (Argumentativo) (40% LEN)', docs.investorDossier, false, this.evalSelectedCo, 'investorDossier');
                    evidenceHtml += this.renderPressReleasesBadge(co, this.evalSelectedCo);
                } else if (activeSubject === 'MAT') {
                    evidenceHtml += this.renderDocBadge('1. Elaboración de Goniómetro/s (25%)', docs.goniometerEvidence, false, this.evalSelectedCo, 'goniometerEvidence');
                    evidenceHtml += this.renderDocBadge('2. Informe Distancia Conocida (25%)', docs.mathReportDist, false, this.evalSelectedCo, 'mathReportDist');
                    evidenceHtml += this.renderDocBadge('3. Informe Dos Mediciones (25%)', docs.mathReportTwoPoints, false, this.evalSelectedCo, 'mathReportTwoPoints');
                    evidenceHtml += this.renderDocBadge('4. Informe Técnico Final (25%)', docs.mathReportFinal, false, this.evalSelectedCo, 'mathReportFinal');
                } else if (activeSubject === 'ING') {
                    evidenceHtml += `
                    <div class="bg-black/80 border border-mars-yellow/40 p-4 text-xs text-slate-300 space-y-2 mb-3">
                        <p class="text-white font-bold uppercase text-xs">📢 Evaluación Directa en Aula (Inglés):</p>
                        <p>100% evaluación docente directa en clase (Expresión Oral 70% / Redacciones Escritas 30%). No requiere evidencias de Google Drive en este panel.</p>
                    </div>`;
                }

                adminHtml += `
                <div id="eval-company-panel" class="terminal-border bg-mars-card p-6 animate-in fade-in duration-300">
                    <div class="flex justify-between items-center border-b border-mars-border pb-3 mb-6 flex-wrap gap-2">
                        <div>
                            <span class="text-[10px] font-mono text-mars-cyan uppercase tracking-wider font-bold">Ficha de Calificación Activa</span>
                            <h3 class="font-orbitron text-white text-base font-bold uppercase flex items-center gap-2">
                                <span>🚀 ${this.escapeHTML(co.name)}</span>
                                <span class="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">Clase ${this.escapeHTML(co.classGroup || 'A')}</span>
                            </h3>
                        </div>
                        <button type="button" onclick="ui.evalSelectedCo=''; ui.render();" class="min-h-[44px] inline-flex items-center text-xs text-slate-400 hover:text-white font-mono uppercase px-3 py-1.5 border border-slate-700 hover:border-slate-500 rounded">
                            ✕ Cambiar Empresa
                        </button>
                    </div>

                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div class="lg:col-span-2 space-y-4">
                            <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-4 flex-wrap gap-2">
                                <h4 class="font-orbitron text-mars-cyan text-xs uppercase tracking-widest">Criterios Oficiales (${this.escapeHTML(activeSubject)})</h4>
                                <span class="text-xs bg-mars-yellow/10 text-mars-yellow border border-mars-yellow px-2 py-0.5 font-bold uppercase">Representación Global: ${subWeightPct}%</span>
                            </div>
                            ${config.criteria.map(c => {
                                const criterionPhase = this.getCriterionPhase(activeSubject, c.id);
                                const isCurrentPhase = (criterionPhase === curPhase || criterionPhase === 'I-IV');
                                const phaseBadgeClass = isCurrentPhase ? 'bg-mars-cyan/20 text-mars-cyan border-mars-cyan/40' : 'bg-slate-800 text-slate-400 border-slate-700';
                                return `
                                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-900/50 p-4 border border-mars-border hover:border-mars-cyan transition-colors">
                                    <div class="flex-grow pr-4">
                                        <div class="flex items-center gap-2 flex-wrap mb-1">
                                            <span class="text-[10px] font-mono px-2 py-0.5 rounded border ${phaseBadgeClass} font-bold uppercase">FASE ${criterionPhase}</span>
                                            <label for="grade-${c.id}" class="text-xs text-white font-bold uppercase leading-tight cursor-pointer">${this.escapeHTML(c.name)}</label>
                                        </div>
                                        <span class="text-xs bg-mars-cyan text-black px-2 py-0.5 mt-1 inline-block font-bold">PESO EN ASIGNATURA: ${Number((c.weight*100).toFixed(1))}%</span>
                                    </div>
                                    <input type="number" id="grade-${c.id}" min="0" max="10" step="0.1" value="${pastGrade.scores && pastGrade.scores[c.id] !== undefined ? pastGrade.scores[c.id] : ''}" oninput="ui.calcRealtimeGrade('${activeSubject}')" class="min-h-[44px] w-full sm:w-24 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base p-2 outline-none focus:border-mars-cyan shrink-0" placeholder="0-10">
                                </div>`;
                            }).join('')}
                            
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                <textarea id="eval-feedback" aria-label="Observaciones cualitativas y feedback" class="w-full bg-slate-900 border border-mars-border p-3 text-base sm:text-xs text-white h-full min-h-[100px] outline-none focus:border-mars-cyan leading-relaxed" placeholder="Observaciones cualitativas y feedback para la startup...">${this.escapeHTML(pastGrade.feedback||'')}</textarea>
                                <div class="flex flex-col">
                                    <div class="terminal-border border-dashed p-4 text-center mb-3 flex-grow bg-black flex flex-col justify-center">
                                        <p class="text-xs text-slate-300 uppercase font-bold mb-1 tracking-widest">Nota Materia (${this.escapeHTML(activeSubject)})</p>
                                        <p id="realtime-grade" class="text-5xl font-orbitron text-mars-green tracking-tighter">${pastGrade.final !== undefined && pastGrade.final !== null ? Number(pastGrade.final).toFixed(2) : '0.00'}</p>
                                        <p id="realtime-grade-pct" class="text-[11px] text-slate-400 font-mono mt-1">${pastGrade.final !== undefined && pastGrade.final !== null ? '(Nota Registrada)' : '(0% Evaluado)'}</p>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <button type="button" onclick="ui.saveGrade('${activeSubject}', false)" class="min-h-[44px] bg-mars-cyan text-black font-black py-3.5 text-xs uppercase tracking-widest hover:shadow-neon-cyan hover:bg-white transition-all">[ 💾 REGISTRAR CALIFICACIÓN ]</button>
                                        <button type="button" onclick="ui.saveGrade('${activeSubject}', true)" class="min-h-[44px] bg-mars-green/20 border border-mars-green text-mars-green font-black py-2.5 text-xs uppercase tracking-wider hover:bg-mars-green hover:text-black transition-all">[ 💾 Guardar y Siguiente Pendiente ➔ ]</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="lg:col-span-1 bg-black/40 border border-slate-800 p-4 h-fit sticky top-20">
                            ${evidenceHtml}
                        </div>
                    </div>
                </div>`;
            }
        }
        return adminHtml;
    },

    getCriterionPhase(subject, criterionId) {
        const map = {
            FYQ: { c1: 'I', c_ws: 'III', c2: 'IV', c3: 'II', c4: 'V' },
            ECO: { c1: 'I-IV', c2: 'I', c3: 'IV', c4: 'II', c5: 'III' },
            LYE: { c1: 'I', c2: 'III', c3: 'III', c4: 'IV', c5: 'I', c6: 'IV', c7: 'V' },
            LEN: { c1: 'V', c2: 'IV', c3: 'I-IV' },
            MAT: { c1: 'II', c2: 'II', c3: 'II', c4: 'II' },
            ING: { c1: 'I-IV', c2: 'V' }
        };
        return map[subject]?.[criterionId] || 'I-IV';
    },

    toggleTeacherPhaseGuide() {
        this.teacherPhaseGuideExpanded = !this.teacherPhaseGuideExpanded;
        this.render();
    },

    renderPressReleasesBadge(co, cid = null) {
        if (!co) return '';
        const targetCid = cid || this.evalSelectedCo || '';
        const prs = co.pressReleases || {};
        const phases = ['I', 'II', 'III', 'IV'];
        const publishedCount = phases.filter(ph => prs[ph]?.driveUrl && prs[ph]?.status !== 'RETURNED').length;

        const rowsHtml = phases.map(ph => {
            const item = prs[ph];
            const hasDoc = item && item.driveUrl;
            if (hasDoc) {
                const isReturned = item.status === 'RETURNED';
                const isPendingReview = item.status === 'PENDING_REVIEW';
                const safeUrl = encodeURI(item.driveUrl).replace(/"/g, '&quot;');
                const badgeHtml = isReturned
                    ? `<span class="text-[10px] bg-red-950/80 text-red-300 border border-red-500/60 px-2 py-0.5 rounded font-mono font-bold">[⚠️ SUBSANACIÓN DOCENTE]</span>`
                    : (isPendingReview
                        ? `<span class="text-[10px] bg-amber-950/70 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-mono font-bold">[⏳ PENDIENTE PUBLICACIÓN]</span>`
                        : `<span class="text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-mono font-bold">[✓ REVISADA / EN ÓRBITA.]</span>`);
                const isCoordPr = typeof this.isNewsCoordinator === 'function' ? this.isNewsCoordinator() : false;
                const approvePrBtnHtml = (isCoordPr && isPendingReview && targetCid)
                    ? `<button type="button" onclick="ui.openOrbitaDraftFromDoc15('${this.escapeHTML(targetCid)}', '${ph}')" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-mars-green text-black hover:bg-white rounded transition-colors font-black uppercase min-h-[44px]" title="Redactar noticia en Órbita. a partir de este DOC_15">📰 Redactar en Órbita.</button>`
                    : '';
                const returnBtnHtml = (state.user?.admin && targetCid)
                    ? `<button type="button" onclick="ui.modalTeacherReturnPressRelease('${this.escapeHTML(targetCid)}', '${ph}')" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-red-950/60 border border-red-500/50 text-red-300 hover:bg-red-900/60 hover:text-white rounded transition-colors font-bold uppercase min-h-[44px]" title="Requerir subsanación de nota de prensa">↩ Subsanar</button>`
                    : '';
                return `
                <div class="bg-black/70 border ${isReturned ? 'border-red-500/50' : (isPendingReview ? 'border-amber-500/50' : 'border-slate-800')} p-2.5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                        <div class="flex items-center gap-1.5 flex-wrap">
                            <span class="text-[10px] font-mono bg-mars-cyan/20 text-mars-cyan border border-mars-cyan/40 px-1.5 py-0.5 rounded font-bold">FASE ${ph}</span>
                            <span class="text-white font-bold">${this.escapeHTML(item.title || 'Nota de Prensa')}</span>
                        </div>
                        <p class="text-[10px] text-slate-400 mt-0.5">Enviada: ${this.escapeHTML(item.publishedDate || item.publishedAt || '')}</p>
                        ${isReturned && item.returnReason ? `<p class="text-[10px] text-red-300 mt-0.5">⚠️ ${this.escapeHTML(item.returnReason)}</p>` : ''}
                    </div>
                    <div class="flex items-center gap-2 shrink-0 flex-wrap">
                        ${badgeHtml}
                        ${approvePrBtnHtml}
                        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-blue-950/40 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-900/50 transition-colors min-h-[44px]">
                            <span>Abrir Doc ↗</span>
                        </a>
                        ${this.renderTeacherPdfBtnHtml ? this.renderTeacherPdfBtnHtml(item.driveUrl) : ''}
                        ${returnBtnHtml}
                    </div>
                </div>`;
            } else {
                return `
                <div class="bg-black/40 border border-slate-800/80 border-dashed p-2 rounded flex justify-between items-center text-xs text-slate-400">
                    <span class="flex items-center gap-1.5">
                        <span class="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">FASE ${ph}</span>
                        <span>Nota de Prensa (DOC_15)</span>
                    </span>
                    <span class="text-[10px] text-amber-400/80 font-mono">[PENDIENTE CIERRE FASE ${ph}]</span>
                </div>`;
            }
        }).join('');

        return `
        <div class="mt-4 bg-slate-950 border border-slate-800 p-3 rounded">
            <div class="flex justify-between items-center mb-2 pb-1 border-b border-slate-800">
                <span class="text-mars-yellow text-xs font-bold uppercase tracking-wider">2. Notas de Prensa Corporativas (${publishedCount}/4)</span>
                <span class="text-[10px] font-mono text-slate-400">10% LEN • DOC_15</span>
            </div>
            <p class="text-[11px] text-slate-300 mb-3 leading-relaxed">
                Notas oficiales emitidas por el CEO al cierre de cada fase para prensa y claustro docente.
            </p>
            <div class="space-y-2">
                ${rowsHtml}
            </div>
        </div>`;
    },

    renderTeacherAssistantBanner(activeSubject, curPhase) {
        if (!activeSubject) return '';
        const companies = state.data.companies || {};
        const classFilter = this.evalClassFilter || 'ALL';
        const targetCids = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            return co && (classFilter === 'ALL' || co.classGroup === classFilter);
        });

        const subjectDocKeys = {
            FYQ: ['preliminaryReport', 'hoja_taller_fyq', 'technicalReport'],
            ECO: ['budgetInitial', 'incomeStatement', 'budgetPostProto', 'balanceSheet'],
            LYE: ['brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'businessModelCanvas', 'decisionDiary_dec', 'decisionDiary_apr'],
            LEN: ['investorDossier'],
            MAT: ['goniometerEvidence', 'mathReportDist', 'mathReportTwoPoints', 'mathReportFinal'],
            ING: []
        }[activeSubject] || [];

        let gradedCount = 0;
        let pendingEvalCids = [];
        let unsubmittedCount = 0;

        targetCids.forEach(cid => {
            const co = companies[cid];
            const g = co?.grades?.[activeSubject];
            const isGraded = g && g.final !== null && g.final !== undefined;
            const { pendingCount, readyTotal } = this.getPendingEvalDocsForSubject(co, activeSubject);

            if (pendingCount > 0) {
                pendingEvalCids.push(cid);
            } else if (isGraded || readyTotal > 0) {
                gradedCount++;
            } else {
                unsubmittedCount++;
            }
        });

        const helpTexts = {
            FYQ: {
                I: "En la Fase I te corresponde calificar el <strong>Informe Técnico Preliminar, Boceto y Foto</strong> (10% de tu materia) una vez subido por los técnicos.",
                II: "En la Fase II supervisa los <strong>Ensayos en Banco de Pruebas</strong> y lanzamientos (30% de tu materia).",
                III: "En la Fase III evalúa la <strong>Hoja Oficial de Taller, BOM y Control de Calidad</strong> (10% de tu materia).",
                IV: "En la Fase IV evalúa el <strong>Informe Técnico Final Exhaustivo</strong> (30% de tu materia).",
                V: "En la Fase V evalúa la <strong>Media de Tests de Rol y Defensa Q&A</strong> (20% de tu materia)."
            },
            ECO: {
                I: "En la Fase I te corresponde calificar el <strong>Presupuesto Inicial</strong> (20%) y el <strong>Test Evaluativo</strong> (20%).",
                II: "En la Fase II evalúa el <strong>Presupuesto Post-Prototipo</strong> (20% de tu materia) tras los ensayos de apogeo y taller.",
                III: "En la Fase III evalúa el <strong>Balance de Situación</strong> (20% de tu materia) cerrado con activo, pasivo y patrimonio neto.",
                IV: "En la Fase IV evalúa la <strong>Cuenta de Resultados</strong> (20% de tu materia) con pérdidas, ganancias y control de márgenes.",
                V: "En la Fase V se audita el balance definitivo y la solvencia contable para la liquidación final."
            },
            LYE: {
                I: "En la Fase I te corresponde calificar la <strong>Identidad y Misión Dic</strong> (10%) y el <strong>Diario de Decisiones e IA Dic</strong> (10%).",
                II: "En la Fase II las startups consolidan su equipo y primer prototipo.",
                III: "En la Fase III evalúa la <strong>Identidad y Misión Abr</strong> (10%) y el <strong>Business Model Escrito</strong> (25% de tu materia).",
                IV: "En la Fase IV evalúa el <strong>Business Model Canvas</strong> (15%) y el <strong>Diario de Decisiones e IA Abr</strong> (10%).",
                V: "En la Fase V evalúa las <strong>Defensas Orales</strong> (20%)."
            },
            LEN: {
                I: "En la Fase I revisa y califica las <strong>Notas de Prensa Corporativas (DOC_15)</strong> emitidas por los CEOs (10% conjunto Fases I a IV).",
                II: "En la Fase II revisa la <strong>Nota de Prensa de Cierre de Fase II (DOC_15)</strong>.",
                III: "En la Fase III revisa la <strong>Nota de Prensa de Cierre de Fase III (DOC_15)</strong>.",
                IV: "En la Fase IV evalúa el <strong>Dossier para Inversores (Texto Argumentativo)</strong> (40%) y la última nota de prensa.",
                V: "En la Fase V evalúa la <strong>Producción Oral y Pitch ante Inversores</strong> (50%)."
            },
            MAT: {
                I: "En la Fase I no hay entregables obligatorios de Matemáticas en la app. Tu primer bloque comienza en la <strong>Fase II</strong>.",
                II: "En la Fase II evalúa la <strong>Construcción del Goniómetro</strong> (25%), el <strong>Informe de Distancia Conocida</strong> (25%), el <strong>Informe de Dos Mediciones</strong> (25%) y el <strong>Informe Técnico Final Comparativo</strong> (25%).",
                III: "En la Fase III los equipos aplican la trigonometría a los prototipos avanzados y optimizan el apogeo.",
                IV: "En la Fase IV se consolidan las métricas finales de vuelo para el Dossier de Inversores.",
                V: "En la Fase V se comprueban las mediciones reales en el concurso."
            },
            ING: {
                I: "La materia de Inglés se evalúa 100% de forma directa en el aula (Expresión Oral 70% / Redacciones 30%). Puedes registrar notas directamente en las casillas correspondientes.",
                II: "Evaluación continua directa en aula de expresión oral y redacciones técnicas en inglés.",
                III: "Evaluación continua directa en aula de pitch comercial en inglés.",
                IV: "Evaluación continua directa en aula de defensa de propuesta de inversión.",
                V: "Evaluación del Pitch Final en inglés en el Concurso Oficial."
            }
        };

        const currentHelp = helpTexts[activeSubject]?.[curPhase] || helpTexts[activeSubject]?.I || "Consulta la guía curricular de tu asignatura en el botón superior.";
        const firstPendingCid = pendingEvalCids[0];
        const firstPendingCo = firstPendingCid ? companies[firstPendingCid] : null;

        return `
        <div class="terminal-border bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-5 mb-6 border-l-4 border-l-mars-cyan shadow-lg">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-slate-800 pb-3 mb-3">
                <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-orbitron font-black text-mars-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <span class="inline-block w-2 h-2 rounded-full bg-mars-cyan animate-ping"></span>
                        🧭 ASISTENTE DOCENTE
                    </span>
                    <span class="text-[10px] font-mono bg-mars-yellow/20 text-mars-yellow border border-mars-yellow/40 px-2 py-0.5 rounded font-bold uppercase">
                        FASE ACTUAL: ${curPhase} (${PROJECT_PHASES_DEF?.[curPhase]?.name?.split(':')[1]?.trim() || 'En curso'})
                    </span>
                    <span class="text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                        Clase: <strong class="text-white">${classFilter === 'ALL' ? 'Todas' : classFilter}</strong>
                    </span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button type="button" onclick="ui.toggleTeacherPhaseGuide()" class="min-h-[44px] px-3 py-1 text-xs font-bold uppercase transition-all rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5">
                        <span>📅 ${this.teacherPhaseGuideExpanded ? 'Ocultar Guía de Fases ▲' : 'Guía de Fases y Criterios ▼'}</span>
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
                <div class="lg:col-span-2 text-xs text-slate-300 leading-relaxed">
                    <p class="text-white font-semibold mb-1 flex items-center gap-1.5">
                        <span class="text-mars-cyan">▶</span> ¿Qué me toca hacer en esta fase?
                    </p>
                    <p class="text-slate-300">${currentHelp}</p>
                </div>

                <div class="lg:col-span-1 bg-black/60 border border-slate-800 p-3 rounded flex flex-col justify-between gap-2">
                    <div class="flex justify-between items-center text-[11px] font-mono">
                        <span class="text-emerald-400 font-bold">🟢 ${gradedCount} evaluadas</span>
                        <span class="${pendingEvalCids.length > 0 ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-400'}">🟡 ${pendingEvalCids.length} listas</span>
                        <span class="text-slate-400">⚪ ${unsubmittedCount} sin entregar</span>
                    </div>
                    ${firstPendingCo ? `
                        <button type="button" onclick="ui.selectEvalCo('${firstPendingCid}')" class="w-full min-h-[44px] bg-mars-cyan hover:bg-white text-black font-black text-xs uppercase tracking-wider px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                            <span>👉 Calificar: ${this.escapeHTML(firstPendingCo.name)} ➔</span>
                        </button>
                    ` : `
                        <div class="text-[11px] text-emerald-400 font-mono text-center py-1">
                            ✅ Todo al día para esta clase
                        </div>
                    `}
                </div>
            </div>
        </div>
        `;
    },

    renderTeacherPhaseGuide(activeSubject, curPhase) {
        if (!this.teacherPhaseGuideExpanded || !activeSubject) return '';
        const phases = ['I', 'II', 'III', 'IV', 'V'];
        const phaseNames = {
            I: 'Fase I: Fundación y Viabilidad',
            II: 'Fase II: I+D y Prototipado',
            III: 'Fase III: Producción B2B',
            IV: 'Fase IV: Validación y Cierre',
            V: 'Fase V: Concurso Final'
        };
        const phaseDates = {
            I: 'Nov - 15 Dic 2026',
            II: '15 Dic - 15 Feb 2027',
            III: '15 Feb - 31 Mar 2027',
            IV: '31 Mar - 23 Abr 2027',
            V: '19 May 2027'
        };

        const config = RUBRIC_CONFIG[activeSubject];
        const criteria = config?.criteria || [];

        const cardsHtml = phases.map(ph => {
            const isCurrent = (ph === curPhase);
            const phCriteria = criteria.filter(c => {
                const cPhase = this.getCriterionPhase(activeSubject, c.id);
                return cPhase === ph || (cPhase === 'I-IV' && ph !== 'V');
            });

            return `
            <div class="terminal-border p-3 rounded flex flex-col justify-between ${
                isCurrent 
                    ? 'bg-slate-900 border-2 border-mars-cyan shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                    : 'bg-black/60 border border-slate-800'
            }">
                <div>
                    <div class="flex justify-between items-start gap-1 mb-1">
                        <span class="text-xs font-orbitron font-bold ${isCurrent ? 'text-mars-cyan' : 'text-white'}">${phaseNames[ph]}</span>
                        ${isCurrent ? '<span class="text-[9px] bg-mars-cyan text-black px-1.5 py-0.5 font-black font-mono uppercase rounded">ACTUAL</span>' : ''}
                    </div>
                    <span class="text-[10px] font-mono text-slate-400 block mb-2">${phaseDates[ph]}</span>
                    
                    <div class="space-y-1.5 border-t border-slate-800/80 pt-2">
                        ${phCriteria.length > 0 ? phCriteria.map(c => `
                            <div class="text-[11px] text-slate-300 leading-snug">
                                <span class="text-mars-yellow font-bold">${Number((c.weight * 100).toFixed(1))}%</span>: ${this.escapeHTML(c.name)}
                            </div>
                        `).join('') : '<p class="text-[10px] text-slate-400 italic">Sin entregables de esta materia en esta fase.</p>'}
                    </div>
                </div>
            </div>`;
        }).join('');

        return `
        <div class="terminal-border bg-black/80 border border-slate-800 p-4 mb-6 rounded">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <h4 class="font-orbitron text-xs uppercase tracking-wider text-mars-yellow flex items-center gap-2">
                    <span>📅 CRONOGRAMA OFICIAL Y RÚBRICA POR FASES (${this.escapeHTML(config?.name || activeSubject)})</span>
                </h4>
                <button type="button" onclick="ui.toggleTeacherPhaseGuide()" class="min-h-[44px] inline-flex items-center px-3 text-xs text-slate-400 hover:text-white font-mono">
                    [ Cerrar ✕ ]
                </button>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                ${cardsHtml}
            </div>
        </div>`;
    },

    toggleEvalOnlyResubmitted() {
        this.evalOnlyResubmitted = !this.evalOnlyResubmitted;
        this.evalSelectedCo = '';
        this.render();
    },

    renderClassStartupCards(activeSubject, classFilter) {
        const companies = state.data.companies || {};
        const classes = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const currentCls = classFilter || 'ALL';

        const filteredCids = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            return co && (currentCls === 'ALL' || co.classGroup === currentCls);
        });

        // Conteo de startups con entregas pendientes de evaluar por clase (multi-fase)
        const pendingCounts = {};
        classes.forEach(c => { pendingCounts[c] = 0; });
        Object.keys(companies).forEach(cid => {
            const co = companies[cid];
            if (!co) return;
            const coCls = (co.classGroup || 'A').toUpperCase();
            const { pendingCount } = this.getPendingEvalDocsForSubject(co, activeSubject);

            if (pendingCount > 0) {
                pendingCounts['ALL'] = (pendingCounts['ALL'] || 0) + 1;
                if (classes.includes(coCls)) {
                    pendingCounts[coCls] = (pendingCounts[coCls] || 0) + 1;
                }
            }
        });

        const totalResubmittedCos = filteredCids.filter(cid => this.getPendingEvalDocsForSubject(companies[cid], activeSubject).resubmittedCount > 0).length;
        const onlyResubmitted = Boolean(this.evalOnlyResubmitted);
        const displayCids = onlyResubmitted
            ? filteredCids.filter(cid => this.getPendingEvalDocsForSubject(companies[cid], activeSubject).resubmittedCount > 0)
            : filteredCids;

        const classTabsHtml = `
        <div class="flex flex-wrap gap-1.5 mb-3 items-center">
            <span class="text-[10px] font-mono text-slate-400 uppercase mr-1">Filtrar Clase:</span>
            ${classes.map(cls => {
                const isCur = (currentCls === cls);
                const count = pendingCounts[cls] || 0;
                const badge = count > 0 
                    ? `<span class="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${isCur ? 'bg-black text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'} animate-pulse">🟡 ${count}</span>` 
                    : '';
                return `
                <button type="button" onclick="ui.setClassFilter('${cls}'); ui.evalSelectedCo='';" class="min-h-[44px] inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all rounded ${
                    isCur 
                        ? 'bg-mars-yellow text-black shadow-sm font-black' 
                        : 'bg-black text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
                }">
                    <span>${cls === 'ALL' ? 'Todas' : `Clase ${cls}`}</span>
                    ${badge}
                </button>`;
            }).join('')}
            <button type="button" onclick="ui.toggleEvalOnlyResubmitted()" class="min-h-[44px] inline-flex items-center px-2.5 py-1 text-xs font-mono font-bold uppercase transition-all rounded border ${
                onlyResubmitted
                    ? 'bg-mars-cyan text-black border-mars-cyan font-black shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                    : (totalResubmittedCos > 0 ? 'bg-cyan-950/70 text-mars-cyan border-mars-cyan/60 hover:bg-mars-cyan hover:text-black animate-pulse' : 'bg-black text-slate-400 border-slate-800 hover:text-white hover:border-slate-700')
            }">
                <span>🔄 Solo Subsanados (${totalResubmittedCos})</span>
            </button>
        </div>`;

        if (displayCids.length === 0) {
            return `
            <div class="mb-4">
                ${classTabsHtml}
                <div class="bg-black/50 border border-slate-800 p-4 text-center text-xs text-slate-400 italic">
                    ${onlyResubmitted
                        ? 'No hay startups con documentos subsanados pendientes de revisar en esta clase y materia.'
                        : `No se encontraron startups registradas para la clase seleccionada (${currentCls}).`}
                </div>
            </div>`;
        }

        const cardsHtml = displayCids.map(cid => {
            const co = companies[cid];
            const isSelected = (this.evalSelectedCo === cid);
            const g = co?.grades?.[activeSubject];
            const hasGrade = g && g.final !== null && g.final !== undefined;
            const { pendingCount, resubmittedCount, awaitingSubsanacionCount } = this.getPendingEvalDocsForSubject(co, activeSubject);

            let statusPill = '';
            if (hasGrade && pendingCount > 0) {
                statusPill = `<span class="text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold animate-pulse">🟢 ${Number(g.final).toFixed(2)} · 🟡 +${pendingCount} nuevos</span>`;
            } else if (hasGrade) {
                statusPill = `<span class="text-[10px] font-mono bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-bold">🟢 Nota: ${Number(g.final).toFixed(2)}</span>`;
            } else if (pendingCount > 0) {
                statusPill = `<span class="text-[10px] font-mono bg-amber-950/70 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold animate-pulse">🟡 ${pendingCount} doc(s) listos</span>`;
            } else if (awaitingSubsanacionCount > 0) {
                statusPill = `<span class="text-[10px] font-mono bg-red-950/60 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold">↩️ Esperando subsanación</span>`;
            } else {
                statusPill = `<span class="text-[10px] font-mono bg-slate-900 text-slate-400 border border-slate-800 px-2 py-0.5 rounded">⚪ Sin entregas</span>`;
            }
            const resubmittedPill = resubmittedCount > 0
                ? `<span class="text-[10px] font-mono bg-cyan-950/90 text-mars-cyan border border-mars-cyan px-2 py-0.5 rounded font-black animate-pulse">🔄 ${resubmittedCount} Subsanado${resubmittedCount > 1 ? 's' : ''} (Revisar)</span>`
                : '';

            const phaseClock = this.getPhaseClockMetrics ? this.getPhaseClockMetrics(co) : { isTeacherBottleneck: false };
            const bottleneckBadge = phaseClock.isTeacherBottleneck
                ? `<span class="text-[10px] font-mono bg-orange-950/90 text-orange-300 border border-orange-500/70 px-1.5 py-0.5 rounded font-bold animate-pulse whitespace-nowrap" title="Cuello de botella Fase ${this.escapeHTML(phaseClock.phaseInfo.key)}: ${phaseClock.phaseDeliveredCount}/${phaseClock.phaseTotalCount} entregas a ${phaseClock.daysRemaining}d del cierre">⏰ Riesgo Plazo</span>`
                : '';

            return `
            <button type="button" onclick="ui.selectEvalCo('${this.escapeHTML(cid)}')" class="text-left p-3 rounded transition-all min-h-[56px] flex flex-col justify-between gap-1.5 ${
                isSelected 
                    ? 'bg-slate-900 border-2 border-mars-cyan ring-2 ring-mars-cyan/30 shadow-[0_0_12px_rgba(0,240,255,0.25)]' 
                    : (resubmittedCount > 0 ? 'bg-cyan-950/20 border border-mars-cyan/60 hover:border-mars-cyan hover:bg-slate-900/80' : 'bg-black/60 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/60')
            }">
                <div class="flex justify-between items-start gap-1 w-full">
                    <span class="font-orbitron font-bold text-xs ${isSelected ? 'text-mars-cyan' : 'text-white'} truncate" title="${this.escapeHTML(co.name)}">
                        ${this.escapeHTML(co.name)}
                    </span>
                    <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded shrink-0">
                        ${this.escapeHTML((co.classGroup || 'A').toUpperCase())}
                    </span>
                </div>
                <div class="w-full flex flex-wrap justify-between items-center gap-1">
                    <div class="flex items-center gap-1 flex-wrap">
                        ${resubmittedPill}
                        ${statusPill}
                        ${bottleneckBadge}
                    </div>
                    ${isSelected ? '<span class="text-[10px] font-mono text-mars-cyan font-black">EVALUANDO ➔</span>' : ''}
                </div>
            </button>`;
        }).join('');

        return `
        <div class="mb-4">
            ${classTabsHtml}
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-[380px] overflow-y-auto p-1">
                ${cardsHtml}
            </div>
        </div>`;
    },

    selectEvalCo(cid) {
        this.evalSelectedCo = cid;
        this.render();
        setTimeout(() => {
            const panel = document.getElementById('eval-company-panel');
            if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
    },

    calcRealtimeGrade(subject) {
        const config = RUBRIC_CONFIG[subject];
        if (!config) return;
        let total = 0;
        let evalWeight = 0;
        let hasInvalid = false;
        config.criteria.forEach(c => {
            const el = document.getElementById(`grade-${c.id}`);
            if (el && el.value !== '') {
                const val = parseFloat(el.value);
                if (isNaN(val) || val < 0 || val > 10) {
                    hasInvalid = true;
                    el.classList.add('border-red-500', 'ring-2', 'ring-red-500/60');
                } else {
                    el.classList.remove('border-red-500', 'ring-2', 'ring-red-500/60');
                    total += val * c.weight;
                    evalWeight += c.weight;
                }
            } else if (el) {
                el.classList.remove('border-red-500', 'ring-2', 'ring-red-500/60');
            }
        });
        const display = document.getElementById('realtime-grade');
        if (display) display.innerText = hasInvalid ? 'ERR' : total.toFixed(2);
        const pctDisplay = document.getElementById('realtime-grade-pct');
        if (pctDisplay) {
            pctDisplay.innerText = hasInvalid
                ? '⚠️ Solo notas entre 0 y 10'
                : `(${Math.round(evalWeight * 100)}% de la rúbrica evaluado)`;
        }
    },

    saveGrade(subject, goNext = false) {
        if (!this.evalSelectedCo) return this.notify("Seleccione una startup primero.", "warning");
        const config = RUBRIC_CONFIG[subject];
        const co = state.data.companies[this.evalSelectedCo];
        if (!co) return;
        
        let scores = {};
        let total = 0;
        let allFilled = true;
        let evaluatedWeight = 0;
        
        for (const c of config.criteria) {
            const el = document.getElementById(`grade-${c.id}`);
            if (el && el.value !== '') {
                const val = parseFloat(el.value);
                if (isNaN(val) || val < 0 || val > 10) {
                    this.highlightInvalidField?.(`La nota en "${c.name}" debe estar entre 0 y 10.`, el);
                    return this.notify(`Nota fuera de rango [0–10] en "${c.name}".`, "error");
                }
                scores[c.id] = val;
                total += val * c.weight;
                evaluatedWeight += c.weight;
            } else {
                allFilled = false;
            }
        }

        const scoredCount = Object.keys(scores).length;
        const finalGradeVal = scoredCount > 0 ? total : null;

        // Capturar dictamen antes de cualquier apertura modal o redibujado de interfaz
        const elFeedback = document.getElementById('eval-feedback');
        const feedback = elFeedback ? this.cleanInput(elFeedback.value) : '';
        const targetCid = this.evalSelectedCo;
        
        const commitGrade = () => {
            const liveCo = state.data?.companies?.[targetCid];
            if (!liveCo) return;

            let maxDocTs = 0;
            const subjDefs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => d.subject === subject);
            subjDefs.forEach(d => {
                const docItem = liveCo.deliverables?.[d.key];
                if (docItem && typeof docItem === 'object') {
                    if (docItem.status === 'DELIVERED_TO_TEACHER' && docItem.resubmittedAfterTeacherReturn) {
                        delete docItem.resubmittedAfterTeacherReturn;
                        const prevTs = Date.parse(docItem.updatedAt) || Number(docItem.updatedAt) || 0;
                        const clearedTs = Math.max(Date.now(), prevTs + 1);
                        docItem.updatedAt = new Date(clearedTs).toISOString();
                        if (clearedTs > maxDocTs) maxDocTs = clearedTs;
                    } else if (docItem.updatedAt) {
                        const ts = Date.parse(docItem.updatedAt) || Number(docItem.updatedAt) || 0;
                        if (ts > maxDocTs) maxDocTs = ts;
                    }
                }
            });
            if (subject === 'LEN' && liveCo.pressReleases) {
                Object.values(liveCo.pressReleases).forEach(pr => {
                    if (pr && pr.resubmittedAfterTeacherReturn) {
                        pr.resubmittedAfterTeacherReturn = false;
                    }
                    const ts = pr ? Math.max(Number(pr.updatedAt) || 0, Number(pr.publishedAt) || 0) : 0;
                    if (ts > maxDocTs) maxDocTs = ts;
                });
            }
            liveCo.grades = liveCo.grades || {};
            const prevGradeTs = Number(liveCo.grades[subject]?.updatedAt) || 0;
            const monoGradeTs = Math.max(Date.now(), maxDocTs + 1, prevGradeTs + 1);
            liveCo.grades[subject] = { 
                scores, 
                feedback, 
                final: finalGradeVal,
                updatedAt: monoGradeTs,
                gradedBy: state.user?.role || 'DOCENTE'
            };
            liveCo.updatedAt = monoGradeTs;
            
            telemetry.log("EVALUACIÓN", `Nota ${subject} registrada a ${liveCo.name}: ${finalGradeVal !== null ? finalGradeVal.toFixed(2) : 'Sin nota (solo feedback)'}`);

            const subjectRoleMap = { FYQ: 'TECNICO', LYE: 'MARKETING', ECO: 'FINANZAS', MAT: 'TECNICO', LEN: 'MARKETING', ING: 'MARKETING' };
            const targetRole = subjectRoleMap[subject] || 'CEO';
            const notifMsg = finalGradeVal !== null
                ? `Calificación de ${subject} registrada por el docente: ${finalGradeVal.toFixed(2)} / 10`
                : `Observación docente de ${subject} registrada (pendiente de calificación numérica).`;
            const targetMeta = { view: 'dossier', subTab: 'eval' };
            ui.pushNotification(targetCid, 'CEO', notifMsg, 'success', targetMeta);
            if (targetRole !== 'CEO') {
                ui.pushNotification(targetCid, targetRole, notifMsg, 'success', targetMeta);
            }

            state.save(targetCid);
            if (typeof state.pushToCloud === 'function') {
                state.pushToCloud(false);
            }

            this.notify(
                finalGradeVal !== null
                    ? `Calificación de ${subject} registrada para ${liveCo.name}: ${finalGradeVal.toFixed(2)}`
                    : `Observación de ${subject} guardada (sin computar 0.00 en Acta).`,
                "success"
            );
            if (goNext) {
                const classFilter = this.evalClassFilter || this.currentClassFilter || 'ALL';
                const nextPendingCid = Object.keys(state.data.companies || {}).find(cid => {
                    if (cid === targetCid) return false;
                    const candidate = state.data.companies[cid];
                    if (!candidate) return false;
                    if (classFilter !== 'ALL' && (candidate.classGroup || 'A') !== classFilter) return false;
                    return this.getPendingEvalDocsForSubject(candidate, subject).pendingCount > 0;
                });
                if (nextPendingCid) {
                    this.selectEvalCo(nextPendingCid);
                    this.notify(`Siguiente pendiente: ${state.data.companies[nextPendingCid]?.name || nextPendingCid}`, "info");
                    return;
                }
                this.notify("¡Sin más entregas pendientes en este filtro de clase!", "success");
            }
            this.render();
        };

        if (!allFilled) {
            const evalPct = Math.round(evaluatedWeight * 100);
            this.confirmAction(
                "Registro de Calificación Parcial",
                `Hay criterios de otras fases sin calificar todavía (se ha evaluado un ${evalPct}% de la materia). Se registrará la nota de los criterios completados (${total.toFixed(2)} / 10). ¿Deseas guardar esta calificación?`,
                commitGrade,
                "Registrar Calificación"
            );
            return;
        }
        
        commitGrade();
    },

    exportActaCSV() {
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined' ? GLOBAL_WEIGHTS : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        const subOrder = ['FYQ','LYE','LEN','ECO','MAT','ING'];
        const classFilter = this.evalClassFilter || this.currentClassFilter || 'ALL';
        let csv = "Empresa,Clase,FYQ_25%,LYE_40%,LEN_15%,ECO_10%,MAT_5%,ING_5%,Peso_Evaluado_%,Nota_Global_Ponderada\n";
        
        Object.values(state.data.companies).forEach(co => {
            if (!co) return;
            if (classFilter !== 'ALL' && (co.classGroup || 'A') !== classFilter) return;
            const g = co.grades || {};
            let weightedTotal = 0;
            let evaluatedWeight = 0;

            const vals = subOrder.map(s => {
                const hasGrade = g[s] && g[s].final !== null && g[s].final !== undefined;
                if (hasGrade) {
                    const num = Number(g[s].final);
                    weightedTotal += num * (weights[s] || 0);
                    evaluatedWeight += (weights[s] || 0);
                    return num.toFixed(2);
                }
                return '';
            });

            const pctEval = Math.round(evaluatedWeight * 100);
            const finalNote = evaluatedWeight > 0 ? weightedTotal.toFixed(2) : '';
            const safeName = typeof this.escapeCSVCell === 'function' ? this.escapeCSVCell(co.name || '') : `"${(co.name || '').replace(/"/g, '""')}"`;
            const safeClass = typeof this.escapeCSVCell === 'function' ? this.escapeCSVCell(co.classGroup || 'A') : `"${co.classGroup || 'A'}"`;
            csv += `${safeName},${safeClass},${vals.join(',')},${pctEval}%,${finalNote}\n`;
        });
        const suffix = classFilter === 'ALL' ? 'oficial' : `clase_${classFilter}`;
        this.downloadFile(csv, 'csv', `marsket_acta_ponderada_${suffix}.csv`);
    },

    modalTeacherReturnPressRelease(coId, phaseKey) {
        if (!state.user || !state.user.admin) return;
        const co = state.data.companies[coId];
        if (!co || !co.pressReleases?.[phaseKey]) return;

        const reasonsList = (typeof CEO_RETURN_REASONS !== 'undefined' && CEO_RETURN_REASONS.length > 0)
            ? CEO_RETURN_REASONS
            : [
                { id: 'PERMISOS_DRIVE_BLOQUEADOS', label: 'El enlace de Drive pide permiso o no es público de lectura' },
                { id: 'PLANTILLA_INCORRECTA', label: 'No usa la plantilla oficial o está incompleta' },
                { id: 'DATOS_INSUFICIENTES', label: 'Falta redactar el cuerpo, evidencias o rigor lingüístico' }
            ];
        const optionsHtml = reasonsList.map(r => `<option value="${this.escapeHTML(r.label)}">${this.escapeHTML(r.label)}</option>`).join('');

        const bodyHtml = `
            <div class="space-y-4 font-mono text-xs">
                <div class="bg-red-950/40 border border-red-500/40 p-3 text-red-200 rounded">
                    <strong>Nota de Prensa DOC_15 · Fase ${this.escapeHTML(phaseKey)}</strong><br>
                    Startup: <span class="text-white font-bold">${this.escapeHTML(co.name || coId)}</span>
                </div>
                <div>
                    <label for="teacher-return-pr-reason" class="text-xs text-mars-yellow uppercase font-bold block mb-1">1. Motivo Tipificado de Subsanación</label>
                    <select id="teacher-return-pr-reason" class="w-full min-h-[44px] bg-black border border-slate-700 p-2 text-xs text-white outline-none focus:border-red-400">
                        ${optionsHtml}
                    </select>
                </div>
                <div>
                    <label for="teacher-return-pr-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1">2. Documento con Correcciones Docentes (Opcional)</label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="teacher-return-pr-drive-url" placeholder="https://docs.google.com/... (opcional)" class="flex-1 min-h-[44px] bg-black border border-slate-700 p-2 text-xs text-white outline-none focus:border-mars-cyan">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('teacher-return-pr-drive-url') : ''}
                    </div>
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
            <button type="button" onclick="ui.confirmTeacherReturnPressRelease('${this.escapeHTML(coId)}', '${this.escapeHTML(phaseKey)}')" class="min-h-[44px] bg-red-600 text-white font-black px-5 py-2 text-xs uppercase hover:bg-red-500 transition-all">Devolver Nota de Prensa</button>
        `;
        this.showModal("Devolver Nota de Prensa (DOC_15)", bodyHtml, actions);
    },

    confirmTeacherReturnPressRelease(coId, phaseKey) {
        if (!state.user || !state.user.admin) return;
        const co = state.data.companies[coId];
        const pr = co?.pressReleases?.[phaseKey];
        if (!pr) return;

        const reasonEl = document.getElementById('teacher-return-pr-reason');
        const reason = reasonEl ? reasonEl.value : 'Subsanación requerida por el docente.';
        const driveInputEl = document.getElementById('teacher-return-pr-drive-url');
        const rawUrl = driveInputEl ? driveInputEl.value.trim() : '';

        let validatedUrl = '';
        if (rawUrl) {
            const urlCheck = this.validateStudentDriveUrl
                ? this.validateStudentDriveUrl(rawUrl, driveInputEl, { required: false, label: 'las correcciones docentes' })
                : { valid: true, url: rawUrl };
            if (!urlCheck || !urlCheck.valid) return;
            validatedUrl = urlCheck.url || '';
        }

        const prevPrTs = Math.max(Number(pr.updatedAt) || 0, Number(pr.publishedAt) || 0, Number(pr.returnedAt) || 0);
        const nowTs = Math.max(Date.now(), prevPrTs + 1);
        const teacherName = state.user?.role || 'DOCENTE';
        pr.status = 'RETURNED';
        pr.returnReason = reason;
        pr.returnDriveUrl = validatedUrl || null;
        pr.returnedByTeacher = teacherName;
        pr.returnedAt = nowTs;
        pr.updatedAt = nowTs;

        if (Array.isArray(state.data.pressReleases)) {
            const globalPr = state.data.pressReleases.find(p => p.coId === coId && p.phase === phaseKey);
            if (globalPr) {
                globalPr.status = 'RETURNED';
                globalPr.returnReason = reason;
                globalPr.returnDriveUrl = validatedUrl || null;
                globalPr.updatedAt = nowTs;
            }
        }
        co.updatedAt = nowTs;

        const notifMsg = `El docente (${teacherName}) requiere subsanar la Nota de Prensa de Fase ${phaseKey} (DOC_15). Motivo: ${reason}`;
        this.pushNotification(coId, 'CEO', notifMsg, 'warning', { view: 'dashboard', subTab: 'press' });
        this.pushNotification(coId, 'MARKETING', notifMsg, 'warning', { view: 'dashboard', subTab: 'press' });

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        this.closeModal();
        this.notify(`Nota de Prensa Fase ${phaseKey} devuelta a ${co.name || coId} para subsanación.`, "info");
        this.render();
    },

    renderAdminContracts() {
        const classFilter = this.adminContractsClassFilter || this.currentClassFilter || 'ALL';
        const rawPhase = typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I';
        const defaultPhase = ['I', 'II', 'III', 'IV'].includes(rawPhase) ? rawPhase : 'IV';
        const phaseFilter = this.adminContractsPhaseFilter || defaultPhase;
        const onlySigned = Boolean(this.adminContractsOnlySigned);
        const companies = state.data.companies || {};

        const allClasses = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const allPhases = ['ALL', 'I', 'II', 'III', 'IV'];

        // Filtrar empresas
        const filteredCoIds = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            if (!co) return false;
            if (classFilter !== 'ALL' && (co.classGroup || 'A') !== classFilter) return false;
            return true;
        });

        // Contabilidad de métricas y armado de filas según filtro activo
        let totalSigned = 0;
        let totalCompleted = 0;
        let totalFailed = 0;
        let totalPending = 0;
        let unsignedCount = 0;
        const phasesToList = phaseFilter === 'ALL' ? ['I', 'II', 'III', 'IV'] : [phaseFilter];
        const contractRows = [];

        filteredCoIds.forEach(cid => {
            const co = companies[cid];
            const contracts = co.contracts || {};
            phasesToList.forEach(ph => {
                const c = contracts[ph];
                const isSigned = Boolean(c && c.contractId);
                if (isSigned) {
                    totalSigned++;
                    if (c.status === 'CUMPLIDO') totalCompleted++;
                    else if (c.status === 'NO_CUMPLIDO') totalFailed++;
                    else totalPending++;
                } else {
                    unsignedCount++;
                }
                if (!onlySigned || isSigned) {
                    contractRows.push({ cid, co, ph, c, isSigned });
                }
            });
        });

        return `
        <div class="space-y-6">
            <!-- Barra Superior de Filtros Rápidos (Clase, Fase y Solo con contrato) -->
            <div class="terminal-border bg-mars-card p-4 border-t-4 border-t-amber-400 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h3 class="font-orbitron font-bold text-white text-sm uppercase tracking-wider">
                        🤝 Auditoría Docente de Contratos Comerciales
                    </h3>
                    <p class="text-xs text-slate-300 mt-0.5">
                        Supervisión de compromisos corporativos suscritos por los CEOs. Pulsa el nombre de una startup para inspeccionar sus evidencias sin salir de esta vista.
                    </p>
                </div>
                <div class="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                    <!-- Selector de Clase -->
                    <div class="flex items-center gap-1.5 bg-black border border-slate-700 p-1">
                        <span class="text-[10px] text-slate-400 font-mono uppercase px-1">Clase:</span>
                        <select onchange="ui.setClassFilter(this.value);" class="bg-black text-amber-400 font-bold text-xs p-1 outline-none uppercase min-h-[44px]">
                            ${allClasses.map(cls => `<option value="${cls}" ${classFilter === cls ? 'selected' : ''}>${cls === 'ALL' ? 'Todas (A-F, TEST)' : `Clase ${cls}`}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Selector de Fase -->
                    <div class="flex items-center gap-1.5 bg-black border border-slate-700 p-1">
                        <span class="text-[10px] text-slate-400 font-mono uppercase px-1">Fase:</span>
                        <select onchange="ui.adminContractsPhaseFilter=this.value; ui.render();" class="bg-black text-mars-cyan font-bold text-xs p-1 outline-none uppercase min-h-[44px]">
                            ${allPhases.map(ph => `<option value="${ph}" ${phaseFilter === ph ? 'selected' : ''}>${ph === 'ALL' ? 'Todas las Fases' : `Fase ${ph}`}</option>`).join('')}
                        </select>
                    </div>

                    <!-- Conmutador Solo con contrato activo -->
                    <button type="button" onclick="ui.adminContractsOnlySigned = !ui.adminContractsOnlySigned; ui.render();" class="min-h-[44px] px-3 py-1.5 border text-xs font-bold uppercase transition-colors rounded flex items-center gap-1.5 ${onlySigned ? 'bg-amber-400 text-black border-amber-300 shadow-sm' : 'bg-black text-slate-300 border-slate-700 hover:border-amber-400 hover:text-amber-300'}" title="Mostrar u ocultar startups sin contrato firmado en la fase seleccionada">
                        <span>⚡ Solo con contrato activo</span>
                        ${unsignedCount > 0 ? `<span class="text-[10px] font-mono ${onlySigned ? 'text-black/80' : 'text-slate-400'}">(${onlySigned ? `${unsignedCount} ocultas` : `${unsignedCount} sin contrato`})</span>` : ''}
                    </button>
                </div>
            </div>

            <!-- Fila de KPIs de Misiones -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-mars-cyan text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Suscritos</span>
                    <strong class="text-xl font-orbitron text-white">${totalSigned}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-amber-400 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">En Curso</span>
                    <strong class="text-xl font-orbitron text-amber-400">${totalPending}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-emerald-500 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Cumplidos</span>
                    <strong class="text-xl font-orbitron text-emerald-400">${totalCompleted}</strong>
                </div>
                <div class="terminal-border bg-mars-card p-3 border-t-2 border-t-rose-500 text-center">
                    <span class="text-[10px] text-slate-400 uppercase font-mono block">Penalizados</span>
                    <strong class="text-xl font-orbitron text-rose-400">${totalFailed}</strong>
                </div>
            </div>

            <!-- Tabla de Contratos con Cabecera Fija -->
            <div class="terminal-border bg-mars-card border-t-2 border-t-slate-700 overflow-hidden">
                <div class="overflow-x-auto max-h-[600px] overflow-y-auto">
                    <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                        <thead class="bg-slate-950 text-slate-300 uppercase font-mono sticky top-0 z-10 border-b border-mars-border">
                            <tr>
                                <th class="p-3">Startup</th>
                                <th class="p-3">Clase</th>
                                <th class="p-3">Fase</th>
                                <th class="p-3">Licitación Corporativa</th>
                                <th class="p-3">Requisitos Clave</th>
                                <th class="p-3">Recomp./Penaliz.</th>
                                <th class="p-3">Estado</th>
                                <th class="p-3 text-right">Dictamen Docente (1 Clic)</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800">
                            ${contractRows.length > 0 ? contractRows.map(({ cid, co, ph, c, isSigned }) => `
                                    <tr class="hover:bg-slate-900/60 transition-colors">
                                        <td class="p-3 font-orbitron text-white font-bold align-top">
                                            <button type="button" onclick="ui.modalInspectContractEvidences('${this.escapeAttr(cid)}', '${this.escapeAttr(ph)}')" class="min-h-[44px] text-mars-cyan hover:text-white underline decoration-mars-cyan/50 decoration-dashed underline-offset-4 inline-flex items-center gap-1.5 text-left" title="Inspeccionar evidencias de contrato in-situ (Fase ${this.escapeHTML(ph)})">
                                                <span>${this.escapeHTML(co.name)}</span>
                                                <span class="text-[10px] font-mono text-slate-400 no-underline">🔍</span>
                                            </button>
                                        </td>
                                        <td class="p-3 font-mono align-top">
                                            <span class="px-2 py-0.5 bg-black border border-slate-700 text-slate-300">
                                                ${this.escapeHTML(co.classGroup || 'A')}
                                            </span>
                                        </td>
                                        <td class="p-3 font-mono font-bold text-amber-400 align-top">
                                            Fase ${ph}
                                        </td>
                                        <td class="p-3 max-w-[220px] whitespace-normal align-top" title="${isSigned ? `${this.escapeAttr(c.company)} — ${this.escapeAttr(c.title)}` : 'Sin contrato'}">
                                            ${isSigned ? `
                                                <div class="flex flex-col">
                                                    <span class="font-bold text-white uppercase text-xs">${this.escapeHTML(c.company)}</span>
                                                    <span class="text-[10px] text-slate-400 whitespace-normal break-words">${this.escapeHTML(c.title)}</span>
                                                </div>
                                            ` : `<span class="text-slate-500 italic">-- Ninguno --</span>`}
                                        </td>
                                        <td class="p-3 min-w-[240px] max-w-[340px] whitespace-normal align-top" title="${isSigned ? this.escapeAttr(c.requirements) : ''}">
                                            ${isSigned ? `
                                                <span class="text-slate-300 font-sans text-xs whitespace-normal break-words leading-snug block">${this.escapeHTML(c.requirements)}</span>
                                                <span class="text-[10px] text-indigo-300 italic whitespace-normal break-words leading-snug block mt-1">${this.escapeHTML(c.verification || '')}</span>
                                            ` : `<span class="text-slate-600">--</span>`}
                                        </td>
                                        <td class="p-3 font-mono align-top">
                                            ${isSigned ? `
                                                <div class="flex items-center gap-1.5 font-bold">
                                                    <span class="text-emerald-400">+${c.reward} €v</span>
                                                    <span class="text-slate-600">/</span>
                                                    <span class="text-rose-400">-${c.penalty} €v</span>
                                                </div>
                                            ` : `<span class="text-slate-600">--</span>`}
                                        </td>
                                        <td class="p-3 align-top">
                                            ${isSigned ? (
                                                c.status === 'CUMPLIDO'
                                                    ? `<span class="px-2 py-1 bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold rounded-sm">✅ CUMPLIDO</span>`
                                                    : (c.status === 'NO_CUMPLIDO'
                                                        ? `<span class="px-2 py-1 bg-rose-950/80 border border-rose-500 text-rose-300 font-mono text-xs font-bold rounded-sm">❌ NO CUMPLIDO</span>`
                                                        : `<span class="px-2 py-1 bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-mono text-xs animate-pulse rounded-sm">⏳ EN CURSO</span>`)
                                            ) : `<span class="text-slate-600 text-xs font-mono">SIN CONTRATO</span>`}
                                        </td>
                                        <td class="p-3 text-right align-top">
                                            ${isSigned ? (
                                                c.status === 'EN_CURSO' ? `
                                                    <div class="flex items-center justify-end gap-2">
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeAttr(cid)}', '${this.escapeAttr(ph)}', true)" class="min-h-[44px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black uppercase text-xs transition-all shadow-sm">
                                                            ✅ Cumplido (+${c.reward} €v)
                                                        </button>
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeAttr(cid)}', '${this.escapeAttr(ph)}', false)" class="min-h-[44px] px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-xs transition-all shadow-sm">
                                                            ❌ No Cumplido (-${c.penalty} €v)
                                                        </button>
                                                    </div>
                                                ` : `
                                                    <div class="flex items-center justify-end gap-2 text-xs">
                                                        <span class="text-[10px] text-slate-400 font-mono">Liquidado (${this.escapeHTML(c.settledDate || '')})</span>
                                                        <button type="button" onclick="ui.modalSettleContract('${this.escapeAttr(cid)}', '${this.escapeAttr(ph)}', ${c.status !== 'CUMPLIDO'})" class="min-h-[44px] px-2.5 py-1 bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs uppercase" title="Modificar dictamen">
                                                            ✏️ Rectificar
                                                        </button>
                                                    </div>
                                                `
                                            ) : `<span class="text-slate-600 text-xs">--</span>`}
                                        </td>
                                    </tr>`).join('') : `<tr><td colspan="8" class="p-6 text-center text-slate-400 italic">${onlySigned ? `Ninguna startup tiene contrato activo en este filtro (${unsignedCount} fila(s) sin contrato ocultas).` : 'No hay empresas registradas en este filtro.'}</td></tr>`}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    },

    modalInspectContractEvidences(cid, ph) {
        if (!state.user || !state.user.admin) {
            return this.notify("Acceso restringido al Claustro Docente.", "error");
        }
        const co = state.data.companies?.[cid];
        if (!co) return;

        const targetPhase = ph || (typeof this.getCurrentPhaseKey === 'function' ? this.getCurrentPhaseKey() : 'I');
        const signedContract = targetPhase !== 'ALL' ? co.contracts?.[targetPhase] : null;
        const isSigned = Boolean(signedContract && signedContract.contractId);

        const balance = Number(co.balance) || 0;
        const committed = typeof state.getCommittedB2CBalance === 'function' ? Number(state.getCommittedB2CBalance(co) || 0) : 0;
        const freeBalance = balance - committed;

        const bomCostEv = typeof state.calculateBomCost === 'function' ? state.calculateBomCost(co) : 0;

        const flights = (Array.isArray(co.flightTests) ? co.flightTests : []).map(f => {
            const hVal = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : (Number(f.height) || 0));
            const cVal = !isNaN(Number(f.costEurV)) ? Number(f.costEurV) : (Number(f.cost) || 0);
            const eVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : (cVal > 0 ? hVal / cVal : 0);
            return { raw: f, hVal, cVal, eVal };
        });
        flights.sort((a, b) => b.eVal - a.eVal);
        const bestE = flights.length > 0 ? Math.max(...flights.map(x => x.eVal)) : null;

        const flightRowsHtml = flights.map(({ raw: f, hVal, cVal, eVal }) => {
            const safeVideoHref = (this.sanitizeDriveUrl && f.videoUrl)
                ? this.sanitizeDriveUrl(f.videoUrl)
                : ((f.videoUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(f.videoUrl)) ? encodeURI(f.videoUrl).replace(/"/g, '&quot;') : '');
            const hasVideo = Boolean(safeVideoHref);
            return `
            <tr class="border-b border-slate-800/80">
                <td class="py-1.5 pr-2 text-slate-300 font-mono text-[11px]">${this.escapeHTML(f.date || '--')}</td>
                <td class="py-1.5 pr-2 font-mono text-white font-bold">${Math.round(hVal)} mm</td>
                <td class="py-1.5 pr-2 font-mono text-mars-cyan">${cVal.toFixed(2)} €v</td>
                <td class="py-1.5 pr-2 font-mono font-black ${bestE !== null && eVal === bestE && bestE > 0 ? 'text-mars-yellow' : 'text-emerald-300'}">${eVal.toFixed(2)}</td>
                <td class="py-1.5 text-right">${hasVideo ? `<a href="${safeVideoHref}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline font-mono text-[11px]">Vídeo Drive ↗</a>` : '<span class="text-slate-500 italic text-[11px]">Sin vídeo</span>'}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="5" class="py-3 text-center text-slate-400 italic text-xs">Sin lanzamientos registrados en el Banco de Pruebas.</td></tr>`;

        const allDefs = typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : [];
        const phaseDefs = targetPhase === 'ALL'
            ? allDefs
            : allDefs.filter(d => (typeof this.getDeliverablePhase === 'function' ? this.getDeliverablePhase(d.key) : d.phase) === targetPhase);

        const delivsHtml = phaseDefs.map(def => {
            const rawDoc = co.deliverables?.[def.key];
            const item = (rawDoc && typeof rawDoc === 'object') ? rawDoc : { driveUrl: String(rawDoc || '') };
            const status = rawDoc ? (item.status || 'DELIVERED_TO_TEACHER') : 'PENDING';
            const hasUrl = Boolean(item.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(item.driveUrl));
            const safeUrl = hasUrl ? encodeURI(item.driveUrl).replace(/"/g, '&quot;') : '';
            const subjGrade = co.grades?.[def.subject];
            const gradeScore = (subjGrade && subjGrade.final !== null && subjGrade.final !== undefined) ? Number(subjGrade.final) : null;

            let stBadge = `<span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono text-[10px]">Pendiente</span>`;
            if (status === 'SUBMITTED_TO_CEO') stBadge = `<span class="px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-500/40 text-amber-300 font-mono text-[10px]">En CEO</span>`;
            else if (status === 'CEO_REVISION') stBadge = `<span class="px-1.5 py-0.5 rounded bg-rose-950/70 border border-rose-500/40 text-rose-300 font-mono text-[10px]">Subsanación</span>`;
            else if (rawDoc) stBadge = `<span class="px-1.5 py-0.5 rounded bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 font-mono text-[10px]">Entregado</span>`;

            return `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2 border-b border-slate-800/80 last:border-0">
                <div class="min-w-0">
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-[10px] font-mono px-1.5 py-0.5 bg-slate-900 border border-slate-700 text-mars-cyan rounded">${this.escapeHTML(def.subject)}</span>
                        <strong class="text-white text-xs">${this.escapeHTML(def.shortName || def.name)}</strong>
                        ${stBadge}
                        ${gradeScore !== null ? `<span class="text-[10px] font-mono font-bold text-mars-yellow px-1.5 py-0.5 bg-amber-950/40 border border-amber-500/40 rounded">${this.escapeHTML(def.subject)}: ${gradeScore.toFixed(2)}</span>` : ''}
                    </div>
                </div>
                <div class="shrink-0 flex items-center gap-1.5 flex-wrap">
                    ${hasUrl
                        ? `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950/50 border border-blue-500/40 text-blue-300 hover:bg-blue-900/60 rounded text-[11px] font-mono font-bold">Abrir Drive ↗</a>${this.renderTeacherPdfBtnHtml ? this.renderTeacherPdfBtnHtml(rawDoc) : ''}`
                        : `<span class="text-[11px] text-slate-500 italic">Sin enlace</span>`}
                </div>
            </div>`;
        }).join('') || `<p class="text-xs text-slate-400 italic py-2">No hay entregables configurados para esta fase.</p>`;

        const prEntry = targetPhase !== 'ALL' ? co.pressReleases?.[targetPhase] : null;
        const prHasUrl = Boolean(prEntry?.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(prEntry.driveUrl));
        const safePrUrl = prHasUrl ? encodeURI(prEntry.driveUrl).replace(/"/g, '&quot;') : '';
        const aesaStatus = co.launchLicense?.status || 'SIN_SOLICITAR';

        const html = `
            <div class="space-y-4 font-sans text-xs">
                <div class="bg-slate-900/90 border border-amber-500/50 p-3 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <span class="text-[10px] font-mono uppercase text-amber-300 font-bold">Startup · Clase ${this.escapeHTML(co.classGroup || 'A')} · Fase ${this.escapeHTML(targetPhase)}</span>
                        <h4 class="font-orbitron text-sm font-black text-white uppercase">${this.escapeHTML(co.name || cid)}</h4>
                    </div>
                    <span class="text-[10px] font-mono px-2 py-1 bg-black border border-slate-700 rounded text-slate-300">
                        Licencia AESA: <strong class="${aesaStatus.startsWith('APROBADA') ? 'text-emerald-400' : 'text-amber-300'}">${this.escapeHTML(aesaStatus)}</strong>
                    </span>
                </div>

                ${isSigned ? `
                <div class="bg-indigo-950/30 border border-indigo-500/40 p-3 rounded space-y-1">
                    <div class="flex justify-between items-center gap-2 flex-wrap">
                        <span class="text-xs font-orbitron font-bold text-indigo-300 uppercase">${this.escapeHTML(signedContract.company)} — ${this.escapeHTML(signedContract.title)}</span>
                        <span class="font-mono text-[11px] font-bold"><span class="text-emerald-400">+${signedContract.reward} €v</span> / <span class="text-rose-400">-${signedContract.penalty} €v</span></span>
                    </div>
                    <p class="text-slate-200 leading-snug"><strong class="text-slate-400 uppercase text-[10px]">Requisitos:</strong> ${this.escapeHTML(signedContract.requirements)}</p>
                    ${signedContract.verification ? `<p class="text-indigo-200 italic text-[11px]"><strong class="not-italic text-slate-400 uppercase text-[10px]">Verificación:</strong> ${this.escapeHTML(signedContract.verification)}</p>` : ''}
                </div>` : ''}

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-center">
                    <div class="bg-black/70 border border-slate-800 p-2.5 rounded">
                        <span class="text-[10px] text-slate-400 uppercase block">Saldo Actual / Libre</span>
                        <strong class="text-sm ${balance <= 0 ? 'text-rose-400' : 'text-mars-green'}">${balance.toFixed(2)} €v</strong>
                        ${committed > 0 ? `<span class="block text-[10px] text-slate-400">Libre real: ${freeBalance.toFixed(2)} €v</span>` : ''}
                    </div>
                    <div class="bg-black/70 border border-slate-800 p-2.5 rounded">
                        <span class="text-[10px] text-slate-400 uppercase block">Coste BOM Actual (${bomList.length} uds)</span>
                        <strong class="text-sm text-mars-cyan">${bomCostEv.toFixed(2)} €v</strong>
                    </div>
                    <div class="bg-black/70 border border-slate-800 p-2.5 rounded">
                        <span class="text-[10px] text-slate-400 uppercase block">Mejor Eficiencia E (${flights.length} vuelos)</span>
                        <strong class="text-sm text-mars-yellow">${bestE !== null ? bestE.toFixed(2) : '--'}</strong>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div class="terminal-border bg-black/60 border border-slate-800 p-3 rounded">
                        <h5 class="font-orbitron text-[11px] text-mars-cyan uppercase font-bold mb-2">📄 Entregables Curriculares (Fase ${this.escapeHTML(targetPhase)})</h5>
                        <div class="max-h-56 overflow-y-auto pr-1">
                            ${delivsHtml}
                            ${prEntry ? `
                            <div class="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-700/70">
                                <div>
                                    <span class="text-[10px] font-mono px-1.5 py-0.5 bg-purple-950/60 border border-purple-500/40 text-purple-300 rounded">DOC_15</span>
                                    <strong class="text-white text-xs ml-1">Nota de Prensa Fase ${this.escapeHTML(targetPhase)}</strong>
                                    <span class="text-[10px] text-slate-400 ml-1">(${this.escapeHTML(prEntry.status || '')})</span>
                                </div>
                                ${prHasUrl ? `<div class="flex items-center gap-1.5 shrink-0"><a href="${safePrUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center text-blue-300 hover:underline font-mono text-[11px] shrink-0">Abrir Drive ↗</a>${this.renderTeacherPdfBtnHtml ? this.renderTeacherPdfBtnHtml(prEntry.driveUrl, true) : ''}</div>` : ''}
                            </div>` : ''}
                        </div>
                    </div>

                    <div class="terminal-border bg-black/60 border border-slate-800 p-3 rounded">
                        <h5 class="font-orbitron text-[11px] text-mars-yellow uppercase font-bold mb-2">🚀 Ensayos en Banco de Pruebas (${flights.length})</h5>
                        <div class="overflow-x-auto max-h-56 overflow-y-auto">
                            <table class="w-full text-left text-xs whitespace-nowrap">
                                <thead class="text-[10px] text-slate-400 uppercase font-mono border-b border-slate-800 sticky top-0 bg-slate-950">
                                    <tr>
                                        <th class="py-1 pr-2">Fecha</th>
                                        <th class="py-1 pr-2">Altura</th>
                                        <th class="py-1 pr-2">Coste</th>
                                        <th class="py-1 pr-2">E</th>
                                        <th class="py-1 text-right">Vídeo</th>
                                    </tr>
                                </thead>
                                <tbody>${flightRowsHtml}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const actions = `
            <button type="button" onclick="ui.closeModal(); ui.goToCompanyEval('${this.escapeAttr(cid)}')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-black uppercase text-xs hover:bg-white transition-colors rounded">
                📝 Ir a Rúbricas ↗
            </button>
        `;
        this.showModal(`🔍 Evidencias In-Situ: ${this.escapeHTML(co.name || cid)}`, html, actions, 'max-w-4xl');
    },

    modalSettleContract(coId, phase, isCompleted) {
        const co = state.data.companies?.[coId];
        if (!co) return;
        const c = co.contracts?.[phase];
        if (!c) return;

        const options = isCompleted ? [
            "Validación de evidencias curriculares satisfactoria",
            "Objetivo técnico y telemetría superados con éxito",
            "Top 3 Notas de Prensa alcanzado en edición oficial",
            "Auditoría contable y de costes sin descuadres",
            "Cumplimiento estricto de tolerancias de taller y calidad"
        ] : [
            "No alcanza la cota mínima o requisitos exigidos",
            "Descuadre presupuestario o desviación de costes > 5%",
            "Falta de metraje fotogramétrico o telemetría continua",
            "Incumplimiento de marcas temporales y plazos oficiales",
            "Devolución no subsanada en entregables curriculares"
        ];

        const delta = isCompleted ? `+${c.reward} €v` : `-${c.penalty} €v`;

        const body = `
        <div class="space-y-4 text-xs">
            <div class="p-3 bg-slate-900 border ${isCompleted ? 'border-emerald-500/50' : 'border-rose-500/50'}">
                <span class="text-[10px] font-mono uppercase text-slate-400">Startup Objetivo:</span>
                <h4 class="font-orbitron font-bold text-white text-sm uppercase">${this.escapeHTML(co.name)} [Clase ${this.escapeHTML(co.classGroup || 'A')}]</h4>
                <p class="text-xs text-amber-300 font-bold mt-1">Fase ${this.escapeHTML(phase)}: ${this.escapeHTML(c.company)} — ${this.escapeHTML(c.title)}</p>
            </div>

            <div class="bg-black/70 p-3 border border-slate-800 space-y-1">
                <span class="text-[10px] font-mono text-slate-400 uppercase font-bold">Requisitos Auditados:</span>
                <p class="text-slate-200 font-sans">${this.escapeHTML(c.requirements)}</p>
                <span class="text-[10px] font-mono text-slate-400 uppercase font-bold block pt-1">Criterio Oficial de Verificación:</span>
                <p class="text-indigo-300 italic">${this.escapeHTML(c.verification)}</p>
            </div>

            <div class="p-3 text-center ${isCompleted ? 'bg-emerald-950/40 border border-emerald-500/50 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/50 text-rose-300'} font-mono text-sm font-bold">
                Impacto en Libro Mayor (Ledger): <span class="text-base ${isCompleted ? 'text-emerald-400' : 'text-rose-400'}">${delta}</span>
            </div>

            <div>
                <label for="settle-contract-reason" class="text-slate-300 font-bold uppercase block mb-1">
                    Motivo Tipificado del Dictamen Docente:
                </label>
                <select id="settle-contract-reason" class="w-full min-h-[44px] bg-black border border-slate-700 text-white text-xs p-2.5 outline-none font-sans">
                    ${options.map(opt => `<option value="${this.escapeHTML(opt)}">${this.escapeHTML(opt)}</option>`).join('')}
                </select>
            </div>

            <div class="flex gap-3 pt-2">
                <button type="button" onclick="ui.closeModal()" class="flex-1 min-h-[44px] bg-slate-800 text-slate-300 hover:text-white font-bold text-xs uppercase transition-colors">
                    Cancelar
                </button>
                <button type="button" onclick="ui.confirmSettleContract('${this.escapeHTML(coId)}', '${this.escapeHTML(phase)}', ${isCompleted})" class="flex-1 min-h-[44px] ${isCompleted ? 'bg-emerald-500 text-black hover:bg-white' : 'bg-rose-600 text-white hover:bg-white hover:text-rose-600'} font-black text-xs uppercase font-orbitron transition-all shadow-md">
                    ${isCompleted ? 'Aprobar y Abonar (+€v)' : 'Registrar Penalización (-€v)'}
                </button>
            </div>
        </div>`;

        this.showModal(`AUDITORÍA DOCENTE • CONTRATOS COMERCIALES FASE ${phase}`, body, "");
    },

    confirmSettleContract(coId, phase, isCompleted) {
        const selectEl = document.getElementById('settle-contract-reason');
        const reason = selectEl ? selectEl.value : '';

        const res = state.settleCommercialContract(coId, phase, isCompleted, reason);
        if (res && res.ok) {
            this.closeModal();
            this.notify("✅ Dictamen docente ejecutado y liquidado en el Libro Mayor con éxito.", "success");
            this.render();
        } else {
            this.notify("❌ " + (res?.error || "Error al liquidar contrato"), "error");
        }
    }
});
