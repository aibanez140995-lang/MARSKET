// js/ui-empresa-tech.js
// --- MÓDULO I+D: BANCO DE PRUEBAS (en mm), MATEMÁTICAS, ENTREGABLES CIENTÍFICOS Y TALLER BOM (v1.1.44) ---

Object.assign(ui, {
    previewFlightEfficiency() {
        const elCost = document.getElementById('ft-cost');
        const elHeight = document.getElementById('ft-height-mm');
        const elOut = document.getElementById('ft-live-preview');
        if (!elOut) return;
        const c = parseFloat(String(elCost ? elCost.value : '').replace(',', '.'));
        const h = parseFloat(String(elHeight ? elHeight.value : '').replace(',', '.'));
        if (!isNaN(c) && c > 0 && !isNaN(h) && h >= 0) {
            const eVal = h / c;
            const eCls = eVal > 0 ? 'text-mars-yellow' : 'text-amber-400';
            const unitHint = (h > 0 && h < 100)
                ? `<span class="block text-[10px] text-amber-300 mt-1">⚠️ ¿Seguro que son ${h} mm (&lt; 10 cm)? Recuerda: 1 metro = 1000 mm (ej. 6,5 m = 6500 mm).</span>`
                : '';
            elOut.innerHTML = `⚡ Pre-cálculo en vivo: <strong class="${eCls} font-orbitron">E = ${eVal.toFixed(2)} mm/€v</strong> <span class="text-slate-400">(${h.toFixed(0)} mm / ${c.toFixed(2)} €v)</span>${unitHint}`;
        } else {
            elOut.innerHTML = `⚡ Pre-cálculo en vivo: <span class="text-slate-400">Introduce Coste (&gt; 0) y Altura (mm) para estimar E = H / C</span>`;
        }
    },

    techSendHojaTaller() {
        if (!state.user) return;
        const co = state.data.companies?.[state.user.coId];
        if (this.getEffectiveRole(co) !== 'TECNICO' && !state.user.admin) {
            return this.notify("Solo el Departamento Técnico (I+D) puede enviar iteraciones de la Hoja de Taller.", "warning");
        }
        const el = document.getElementById('tech-hoja-taller-drive-url');
        if (!el) return;
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(el.value, el, { required: true, label: 'la Hoja de Taller y BOM (DOC_10)' })
            : { valid: Boolean(this.cleanInput(el.value)), url: this.cleanInput(el.value) };
        if (!urlCheck.valid) return;
        if (this.acquireActionLock && !this.acquireActionLock('tech-send-hoja-' + state.user.coId, 1500)) return;
        state.sendHojaTallerToWorkshop(urlCheck.url);
    },

    viewTech(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        
        const wrapper = document.createElement('div');
        
        let bestE = 0;
        let maxHeightMm = 0;
        let bestRatioLabel = '--';
        const flightCardsMobileHtml = co.flightTests.map(f => {
            const h_mm = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : 0);
            const naVal = !isNaN(Number(f.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f.weightG)) ? Number(f.weightG) : 0));
            const vinVal = !isNaN(Number(f.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f.waterMl)) ? Number(f.waterMl) : 0);
            const costVal = !isNaN(Number(f.costEurV)) ? Number(f.costEurV) : 0;
            const effVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : (costVal > 0 ? h_mm / costVal : 0);
            if (effVal > bestE) {
                bestE = effVal;
                bestRatioLabel = (vinVal > 0 && naVal > 0) ? `${((naVal / vinVal) * 10).toFixed(2)} g/10ml` : `${naVal}g/${vinVal}ml`;
            }
            if (h_mm > maxHeightMm) maxHeightMm = h_mm;
            const safeVideoUrl = this.sanitizeDriveUrl ? this.sanitizeDriveUrl(f.videoUrl) : '';
            const fid = String(f.id || '');
            const mobileVideoBtn = safeVideoUrl
                ? `<div class="flex items-center gap-1.5 w-full">
                    <a href="${safeVideoUrl}" target="_blank" rel="noopener noreferrer" class="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-cyan-950/70 border border-mars-cyan/60 text-mars-cyan font-bold text-xs uppercase rounded">🎥 Ver Vídeo E ↗</a>
                    ${fid ? `<button type="button" onclick="ui.modalAttachFlightVideo('${this.escapeHTML(fid)}')" aria-label="Cambiar vídeo del ensayo" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-300 px-2 rounded">✏️</button>` : ''}
                   </div>`
                : (fid ? `<button type="button" onclick="ui.modalAttachFlightVideo('${this.escapeHTML(fid)}')" class="w-full min-h-[44px] inline-flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 font-bold text-xs uppercase rounded">📹 + Vídeo E</button>` : '');
            return `
            <div class="bg-slate-900/90 border border-mars-border/70 p-3 rounded space-y-2 text-xs">
                <div class="flex justify-between items-start gap-2">
                    <div class="min-w-0">
                        <span class="text-white font-bold uppercase block break-words">${this.escapeHTML(f.bottle || 'Prototipo')}</span>
                        <span class="text-[11px] text-slate-400 font-mono">${this.escapeHTML(f.date || '--')} · Mix ${naVal}g / ${vinVal}ml</span>
                    </div>
                    <span class="font-orbitron font-black text-mars-yellow text-sm shrink-0">E ${effVal.toFixed(2)}</span>
                </div>
                <div class="flex justify-between items-center text-[11px] font-mono border-t border-slate-800 pt-1.5">
                    <span class="text-mars-green font-bold">Altura: ${h_mm.toFixed(0)} mm</span>
                    <span class="text-mars-magenta">Coste: ${costVal.toFixed(2)} €v</span>
                </div>
                ${mobileVideoBtn ? `<div class="pt-1">${mobileVideoBtn}</div>` : ''}
            </div>`;
        }).join('') || `<div class="terminal-border bg-slate-950 p-4 text-center border-dashed border-mars-yellow/40"><p class="text-xs text-mars-yellow font-bold uppercase mb-1">🚀 Banco de Pruebas sin Ensayos</p><p class="text-[11px] text-slate-400">Introduce los reactivos y la altura arriba para registrar el primer vuelo de tu prototipo.</p></div>`;

        const flightMiniKpisHtml = `
        <div class="grid grid-cols-3 gap-2 mb-4">
            <div class="bg-black/70 border border-mars-yellow/40 p-2.5 rounded text-center">
                <span class="text-[10px] font-mono text-slate-400 uppercase block">🏆 Mejor E</span>
                <span class="font-orbitron font-black text-sm sm:text-base text-mars-yellow">${co.flightTests.length > 0 ? bestE.toFixed(2) : '--'}</span>
            </div>
            <div class="bg-black/70 border border-mars-green/40 p-2.5 rounded text-center">
                <span class="text-[10px] font-mono text-slate-400 uppercase block">🚀 Altura Récord</span>
                <span class="font-orbitron font-black text-sm sm:text-base text-mars-green">${co.flightTests.length > 0 ? `${maxHeightMm.toFixed(0)} mm` : '--'}</span>
            </div>
            <div class="bg-black/70 border border-mars-cyan/40 p-2.5 rounded text-center">
                <span class="text-[10px] font-mono text-slate-400 uppercase block">🧪 Ratio Óptimo</span>
                <span class="font-mono font-bold text-xs sm:text-sm text-mars-cyan">${this.escapeHTML(bestRatioLabel)}</span>
            </div>
        </div>`;

        let ftHtml = co.flightTests.map(f => {
            // Retrocompatibilidad: Si el vuelo se guardó en metros o con claves heredadas, normaliza sin producir NaN
            const h_mm = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : 0);
            const naVal = !isNaN(Number(f.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f.weightG)) ? Number(f.weightG) : 0));
            const vinVal = !isNaN(Number(f.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f.waterMl)) ? Number(f.waterMl) : 0);
            const costVal = !isNaN(Number(f.costEurV)) ? Number(f.costEurV) : 0;
            const effVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : (costVal > 0 ? h_mm / costVal : 0);
            const safeVideoUrl = this.sanitizeDriveUrl ? this.sanitizeDriveUrl(f.videoUrl) : '';
            const fid = String(f.id || '');
            const videoCellHtml = safeVideoUrl
                ? `<div class="flex items-center gap-1.5">
                        <a href="${safeVideoUrl}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1.5 bg-cyan-950/70 border border-mars-cyan/60 text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase rounded transition-colors">🎥 Ver Vídeo E ↗</a>
                        ${fid ? `<button type="button" onclick="ui.modalAttachFlightVideo('${this.escapeHTML(fid)}')" aria-label="Cambiar vídeo del ensayo" title="Cambiar enlace de vídeo en Drive" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-slate-900 border border-slate-700 text-slate-300 hover:border-mars-yellow hover:text-mars-yellow px-2 rounded transition-colors">✏️</button>` : ''}
                   </div>`
                : (fid ? `<button type="button" onclick="ui.modalAttachFlightVideo('${this.escapeHTML(fid)}')" class="min-h-[44px] inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 hover:border-mars-cyan hover:text-mars-cyan font-bold text-xs uppercase rounded transition-colors">📹 + Vídeo E</button>` : `<span class="text-slate-500 text-[11px]">Opcional</span>`);
            return `
            <tr class="border-b border-mars-border/40 hover:bg-slate-900/50">
                <td class="py-2.5 text-slate-300 pr-3">${this.escapeHTML(f.date || '--')}</td>
                <td class="py-2.5 font-bold text-white pr-3">${this.escapeHTML(f.bottle || 'Prototipo')}</td>
                <td class="py-2.5 text-mars-cyan pr-3">${naVal}g / ${vinVal}ml</td>
                <td class="py-2.5 font-mono text-mars-magenta pr-3">${costVal.toFixed(2)}</td>
                <td class="py-2.5 font-mono text-mars-green font-bold text-sm sm:text-base pr-3">${h_mm.toFixed(0)}</td>
                <td class="py-2.5 font-orbitron font-mono tabular-nums text-mars-yellow font-black pr-3">${effVal.toFixed(2)}</td>
                <td class="py-2.5">${videoCellHtml}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="7" class="p-4"><div class="terminal-border bg-slate-950 p-4 text-center border-dashed border-mars-yellow/40"><p class="text-xs text-mars-yellow font-bold uppercase mb-1">🚀 Banco de Pruebas sin Ensayos</p><p class="text-[11px] text-slate-400">Introduce los reactivos y la altura arriba para registrar el primer vuelo de tu prototipo.</p></div></td></tr>`;

        // --- Contadores de Órdenes I+D (Técnico) ---
        const techOrders = co.orders || [];
        const techPendingCount = techOrders.filter(o => o.type !== 'MARKETING' && (o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS' || o.status === 'PENDIENTE_DOCENTE' || o.status === 'APROBADO_DOCENTE')).length;
        const techCompletedCount = techOrders.filter(o => o.type !== 'MARKETING' && o.status === 'EJECUTADO').length;
        const techRejectedCount = techOrders.filter(o => o.type !== 'MARKETING' && (o.status === 'RECHAZADO' || o.status === 'DENEGADO_DOCENTE' || o.status === 'CANCELADO_OTRA_EMPRESA')).length;
        let currentBomCost = 0;
        const bomKeysSet = new Set(Array.isArray(co.bom) ? co.bom : []);
        techOrders.filter(o => o && (o.status === 'EJECUTADO' || ((o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE') && o.partialExecuted))).forEach(o => {
            (o.items || []).forEach((it, idx) => {
                if ((o.status === 'EJECUTADO' || (it && it.executed)) && bomKeysSet.has(`${o.id}-${idx}`)) {
                    currentBomCost += (Number(it.price) || 0) * (Number(it.qty) || 1);
                }
            });
        });

        const myHistoryCustom = Array.isArray(co.specialItemRequests) ? co.specialItemRequests : [];
        const legacyCustom = (state.data.pendingCustom || []).filter(p => p && p.company === state.user.coId && !myHistoryCustom.some(m => m.id === p.id));
        const allMyCustom = [...myHistoryCustom, ...legacyCustom.map(p => ({ ...p, status: 'PENDIENTE_COORDINACION' }))];

        const specialItemsListHtml = allMyCustom.length === 0
            ? `<div class="p-5 bg-slate-900/50 border border-slate-800 text-center rounded"><span class="text-xs font-mono uppercase text-slate-400 italic">No hay solicitudes de material especial registradas. Si tu diseño requiere componentes fuera de catálogo, pulsa [+ Solicitar Material I+D].</span></div>`
            : `<div class="space-y-3">
                ${allMyCustom.map(item => {
                    let stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-amber-950/40 border border-amber-500 text-amber-400 animate-pulse">🟡 PENDIENTE VISADO CEO</span>';
                    if (item.status === 'PENDIENTE_COORDINACION' || item.status === 'PENDIENTE') {
                        stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-cyan-950/40 border border-cyan-500 text-cyan-400 animate-pulse">🟠 EN EVALUACIÓN COORDINACIÓN</span>';
                    } else if (item.status === 'DEVUELTO_CEO' || item.status === 'RECHAZADO_CEO') {
                        stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-rose-950/40 border border-rose-500 text-rose-400">↩ DEVUELTO POR CEO</span>';
                    } else if (item.status === 'APROBADA') {
                        stBadge = `<span class="px-2 py-0.5 text-xs font-black uppercase bg-emerald-950/40 border border-emerald-500 text-emerald-400">🟢 APROBADA (${item.price !== undefined ? item.price + ' €v' : 'En Catálogo'})</span>`;
                    } else if (item.status === 'DENEGADA') {
                        stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-red-950/40 border border-red-500 text-red-400">🔴 DENEGADA</span>';
                    }

                    return `
                    <div class="bg-slate-900 border border-slate-800 p-3.5 rounded flex flex-col gap-3">
                        <div class="min-w-0">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                ${stBadge}
                                <span class="text-xs text-slate-400 font-mono">${this.escapeHTML(item.date || '--')}</span>
                            </div>
                            <h4 class="text-white font-bold text-xs sm:text-sm uppercase leading-snug">${this.escapeHTML(item.name || 'Componente Especial I+D')}</h4>
                            ${item.returnReason ? `<p class="text-xs text-rose-300 font-mono mt-1"><strong>Observación CEO:</strong> ${this.escapeHTML(item.returnReason)}</p>` : ''}
                            <div class="mt-2 flex flex-wrap items-center gap-2">
                                ${item.driveUrl ? `
                                    <a href="${encodeURI(item.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50 transition-colors">
                                        <span>📄 Abrir Mi Solicitud en Docs ↗</span>
                                    </a>
                                ` : ''}
                                ${(item.responseDriveUrl && (item.status === 'DENEGADA' || item.status === 'DEVUELTO_CEO' || item.status === 'RECHAZADO_CEO')) ? `
                                    <a href="${encodeURI(item.responseDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/50 text-red-200 border border-red-400 rounded font-mono hover:bg-red-900/60 transition-colors font-bold">
                                        <span>📄 Ver Dictamen / Respuesta de Coordinación ↗</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                        ${(item.status === 'DEVUELTO_CEO' || item.status === 'RECHAZADO_CEO') && (this.getEffectiveRole(co) === 'TECNICO' || state.user?.admin) ? `
                            <div class="w-full pt-2 border-t border-slate-800">
                                <button type="button" onclick="ui.modalResubmitSpecialItem('${this.escapeHTML(item.id)}')" class="min-h-[44px] w-full bg-mars-yellow text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ ✏️ Subsanar y Reenviar ]</button>
                            </div>
                        ` : ''}
                    </div>`;
                }).join('')}
            </div>`;

        wrapper.innerHTML = `
        <div class="space-y-6">
            ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
            ${this.renderRoleActivePhaseDeliverableBanner ? this.renderRoleActivePhaseDeliverableBanner(co) : ''}
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Columna Izquierda: Banco de Pruebas de Vuelo -->
                <div class="lg:col-span-7 space-y-6">
                    <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-3">
                            <div class="min-w-0 flex-1">
                                <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Banco de Pruebas de Vuelo (Fase II)</h2>
                                <p class="text-[11px] text-mars-cyan font-mono">ℹ️ La Eficiencia (E = Altura / Coste) es calculada de forma matemática automática por la terminal al registrar el ensayo.</p>
                            </div>
                            <div class="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                <button type="button" onclick="ui.navigate('tech_workshop')" class="flex-1 sm:flex-initial min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3.5 py-1.5 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap text-center">
                                    🔧 Ir a Taller y BOM ➔
                                </button>
                            </div>
                        </div>

                        ${(() => {
                            const license = co.launchLicense;
                            const isLicenseApproved = Boolean(state.user?.admin || (license && license.status === 'APROBADA'));
                            const prelimDoc = co.deliverables?.preliminaryReport;
                            const isPrelimDelivered = Boolean(prelimDoc && ((prelimDoc.status === 'DELIVERED_TO_TEACHER' && prelimDoc.driveUrl) || (typeof prelimDoc === 'string' && prelimDoc.length > 0)));
                            const isPrelimAtCeo = Boolean(prelimDoc && prelimDoc.status === 'SUBMITTED_TO_CEO');
                            let aesaStepIdx = 0;
                            if (license && license.status === 'PENDIENTE_DOCENTE') aesaStepIdx = 3;
                            else if (license && license.status === 'DENEGADA') aesaStepIdx = 2;
                            else if (isPrelimDelivered) aesaStepIdx = 2;
                            else if (isPrelimAtCeo) aesaStepIdx = 1;
                            const aesaTracker = (!isLicenseApproved && this.renderWorkflowTracker)
                                ? this.renderWorkflowTracker(['Preliminar I+D', 'Visado CEO', 'AESA (50 €v)', 'Coordinación'], aesaStepIdx)
                                : '';
                            if (isLicenseApproved) {
                                return `
                                    <div class="p-3 mb-4 bg-emerald-950/40 border border-emerald-500 rounded text-xs flex items-center justify-between gap-2">
                                        <div class="flex items-center gap-2">
                                            <span class="text-emerald-400 font-bold uppercase">✅ LICENCIA DE LANZAMIENTO AESA CONCEDIDA</span>
                                            <span class="text-[10px] text-slate-400 font-mono">Protocolo de seguridad verificado</span>
                                        </div>
                                        ${license?.driveUrl ? `<a href="${encodeURI(license.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-emerald-300 underline font-mono text-[11px]">Ver DOC_14 ↗</a>` : ''}
                                    </div>`;
                            }
                            if (license && license.status === 'PENDIENTE_DOCENTE') {
                                return `
                                    <div class="p-3.5 mb-4 bg-amber-950/60 border border-amber-500 rounded text-xs space-y-2">
                                        ${aesaTracker}
                                        <div class="flex items-center gap-2 text-amber-400 font-bold uppercase">
                                            <span>⏳ LICENCIA AESA TRAMITADA // PENDIENTE DE VALIDACIÓN DOCENTE</span>
                                        </div>
                                        <p class="text-slate-200">
                                            El CEO ha tramitado la Licencia AESA (${Number(license.feePaid || 50)} €v abonados). El banco de pruebas se desbloqueará tan pronto como el Claustro valide el expediente.
                                        </p>
                                    </div>`;
                            }
                            if (license && license.status === 'DENEGADA') {
                                const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
                                const hasReportUrl = Boolean(license.rejectReportUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(license.rejectReportUrl));
                                return `
                                    <div class="p-3.5 mb-4 bg-red-950/70 border border-red-500 rounded text-xs space-y-2">
                                        ${aesaTracker}
                                        <div class="flex items-center gap-2 text-red-400 font-bold uppercase">
                                            <span>❌ LICENCIA AESA DENEGADA POR COORDINACIÓN</span>
                                        </div>
                                        <p class="text-slate-200">
                                            Motivo: <em>"${this.escapeHTML(license.rejectReason || 'Incumplimiento de protocolos técnicos o de seguridad.')}"</em>
                                        </p>
                                        <p class="text-slate-300 text-[11px]">
                                            El departamento Técnico debe corregir los aspectos señalados y el <strong>CEO</strong> deberá reenviar la subsanación en la Sala de Mando (tasa de subsanación: ${resubFee} €v).
                                        </p>
                                        ${hasReportUrl ? `
                                            <div>
                                                <a href="${encodeURI(license.rejectReportUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-900/50 text-red-100 border border-red-400/60 rounded font-mono hover:bg-red-800/70 transition-colors">
                                                    <span>📄 Ver Informe de No Admisión Docente ↗</span>
                                                </a>
                                            </div>
                                        ` : ''}
                                    </div>`;
                            }
                            return `
                                <div class="p-3.5 mb-4 bg-red-950/60 border border-red-500 rounded text-xs space-y-2">
                                    ${aesaTracker}
                                    <div class="flex items-center gap-2 text-red-400 font-bold uppercase">
                                        <span>🔒 BANCO DE PRUEBAS BLOQUEADO // LICENCIA AESA REQUERIDA (FASE II)</span>
                                    </div>
                                    <p class="text-slate-200">
                                        ${isPrelimDelivered
                                            ? '¡Informe Técnico Preliminar ya entregado! Ahora el <strong>CEO</strong> debe tramitar la <strong>Licencia Oficial AESA (DOC_14, 50 €v)</strong> en su Sala de Mando.'
                                            : (isPrelimAtCeo
                                                ? 'Tu <strong>Informe Técnico Preliminar</strong> está pendiente de visado en la Sala de Mando del <strong>CEO</strong> para desbloquear la Licencia AESA.'
                                                : 'Para desbloquear los lanzamientos, primero sube el <strong>Informe Técnico Preliminar (FYQ)</strong> desde <em>Mis Entregables</em> y luego el CEO tramitará la Licencia AESA (50 €v).')}
                                    </p>
                                </div>`;
                        })()}

                        ${(() => {
                            const canFlyNow = Boolean(state.user?.admin || (co.launchLicense && co.launchLicense.status === 'APROBADA'));
                            const formFieldsHtml = `
                        <div class="bg-black border border-mars-border p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                            <div class="sm:col-span-2 md:col-span-3 text-[11px] font-sans text-cyan-200 bg-cyan-950/30 border border-cyan-500/30 px-2.5 py-1.5 rounded">
                                ℹ️ <strong>Nota:</strong> El <em>Coste Ensayo (€v)</em> introducido abajo <strong>solo calcula E = H / C</strong>; no descuenta dinero real ni virtual del saldo.
                            </div>
                            <div>
                                <label for="ft-bottle" class="text-xs text-slate-300 uppercase block mb-1">Fuselaje / Botella</label>
                                <select id="ft-bottle" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-yellow w-full">
                                    ${(typeof BOTTLE_TYPES_DEF !== 'undefined' ? BOTTLE_TYPES_DEF : [
                                        "PET 1.5L Lisa Cilíndrica",
                                        "PET 1.5L Acanalada Reforzada",
                                        "PET 2.0L Alta Capacidad",
                                        "PET 1.0L Estándar",
                                        "PET 0.5L Ligera Suborbital",
                                        "Fuselaje Bietapa / Empalmado"
                                    ]).map(b => `<option value="${this.escapeHTML(b)}">${this.escapeHTML(b)}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label for="ft-nahco3" class="text-xs text-slate-300 uppercase block mb-1">NaHCO3 (g)</label>
                                <input type="number" id="ft-nahco3" placeholder="NaHCO3 (g)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan w-full" step="0.1">
                            </div>
                            <div>
                                <label for="ft-vinegar" class="text-xs text-slate-300 uppercase block mb-1">Vinagre (ml)</label>
                                <input type="number" id="ft-vinegar" placeholder="Vinagre (ml)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan w-full" step="1">
                            </div>
                            <div>
                                <div class="flex justify-between items-center gap-1 mb-1">
                                    <label for="ft-cost" class="text-xs text-slate-300 uppercase">Coste Ensayo (€v)</label>
                                    ${currentBomCost > 0 ? `<button type="button" onclick="const el=document.getElementById('ft-cost'); if(el){el.value='${currentBomCost.toFixed(2)}'; ui.previewFlightEfficiency();}" class="text-[10px] font-mono px-1.5 py-0.5 bg-cyan-950/60 border border-mars-cyan/50 text-mars-cyan hover:bg-mars-cyan hover:text-black rounded font-bold transition-colors">[⚡ BOM: ${currentBomCost.toFixed(2)}]</button>` : ''}
                                </div>
                                <input type="number" id="ft-cost" oninput="ui.previewFlightEfficiency()" placeholder="Coste (€v)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-magenta w-full" step="0.1">
                            </div>
                            <div>
                                <label for="ft-height-mm" class="text-xs text-slate-300 uppercase block mb-1">Altura H (mm)</label>
                                <input type="number" id="ft-height-mm" oninput="ui.previewFlightEfficiency()" placeholder="Altura H (mm)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-green font-bold w-full" step="1">
                            </div>
                            <div class="sm:col-span-2 md:col-span-2">
                                <label for="ft-video-url" class="text-xs text-slate-300 uppercase block mb-1">Vídeo Cálculo E (Opcional // Drive)</label>
                                <div class="flex flex-col sm:flex-row gap-2">
                                    <input type="url" id="ft-video-url" placeholder="Opcional: https://drive.google.com/... (explicación de E = H/C)" class="min-h-[44px] flex-1 bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-cyan w-full">
                                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('ft-video-url') : ''}
                                </div>
                            </div>
                            <div class="flex items-end">
                                ${canFlyNow ? `
                                    <button type="button" onclick="ui.submitFlightTest()" class="min-h-[44px] bg-mars-yellow text-black font-black uppercase tracking-wider hover:bg-white transition-all py-2.5 px-3 w-full">Registrar Vuelo</button>
                                ` : `
                                    <button type="button" onclick="ui.notify('⛔ Banco bloqueado: Requiere Licencia de Lanzamiento AESA (DOC_14) tramitada por el CEO y aprobada por Coordinación.', 'error')" class="min-h-[44px] bg-slate-800 text-slate-500 border border-slate-700 font-black uppercase tracking-wider cursor-not-allowed py-2.5 px-3 w-full">🔒 Vuelos Bloqueados</button>
                                `}
                            </div>
                            <div id="ft-live-preview" class="sm:col-span-2 md:col-span-3 text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800 px-3 py-2 rounded">
                                ⚡ Pre-cálculo en vivo: <span class="text-slate-400">Introduce Coste (&gt; 0) y Altura (mm) para estimar E = H / C</span>
                            </div>
                        </div>`;
                            return canFlyNow
                                ? `<div class="mb-6">${formFieldsHtml}</div>`
                                : `<details class="mb-6 bg-slate-950 border border-slate-800 rounded">
                                    <summary class="min-h-[44px] px-4 py-2.5 cursor-pointer flex items-center justify-between gap-2 text-xs font-mono text-slate-300 hover:text-white select-none">
                                        <span>🔒 Ver campos del formulario de ensayo (Se desbloquea con Licencia AESA)</span>
                                        <span class="text-mars-cyan shrink-0">▼ Ver</span>
                                    </summary>
                                    <div class="p-2 pt-0">${formFieldsHtml}</div>
                                   </details>`;
                        })()}
                        ${flightMiniKpisHtml}
                        <div class="sm:hidden space-y-2.5">
                            ${flightCardsMobileHtml}
                        </div>
                        <div class="hidden sm:block overflow-x-auto w-full max-h-60 overflow-y-auto">
                            <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                                <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                                    <tr><th class="py-2 pr-3">Fecha</th><th class="pr-3">Fuselaje</th><th class="pr-3">Mix (Sól/Líq)</th><th class="pr-3">Coste (€v)</th><th class="pr-3">H (mm)</th><th class="pr-3 text-mars-yellow">E = H/C</th><th>Vídeo Cálculo E</th></tr>
                                </thead>
                                <tbody>${ftHtml}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Acceso a Órdenes y Solicitudes Especiales de Material I+D -->
                <div class="lg:col-span-5 space-y-6">
                    <!-- Acceso a Seguimiento de Órdenes -->
                    <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400">
                        <div class="flex justify-between items-center mb-2 border-b border-mars-border pb-2">
                            <h3 class="font-orbitron text-amber-400 text-xs sm:text-sm uppercase tracking-tight">Órdenes de Compra I+D</h3>
                            <span class="text-xs font-mono text-slate-400">${(co.orders || []).filter(o => o.type !== 'MARKETING').length} Órdenes</span>
                        </div>
                        <div class="flex flex-wrap gap-1.5 mb-2.5 text-[11px] font-mono">
                            <span class="px-2 py-0.5 bg-amber-950/40 border border-amber-500/40 text-amber-300 rounded">⏳ ${techPendingCount} en trámite</span>
                            <span class="px-2 py-0.5 bg-emerald-950/40 border border-emerald-500/40 text-mars-green rounded">✓ ${techCompletedCount} en taller</span>
                            ${techRejectedCount > 0 ? `<span class="px-2 py-0.5 bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded">❌ ${techRejectedCount} denegadas</span>` : ''}
                        </div>
                        <p class="text-xs text-slate-300 mb-3">Consulta el estado de tramitación financiera y logística de todas las solicitudes de materiales.</p>
                        <button type="button" onclick="ui.navigate('orders')" class="w-full min-h-[44px] bg-slate-900 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-black uppercase text-xs py-2 px-3 transition-all flex items-center justify-center gap-2">
                            <span>📡 VER SEGUIMIENTO DE ÓRDENES</span> ➔
                        </button>
                    </div>

                    <!-- Panel de Solicitudes de Material I+D a Coordinación -->
                    <div id="tech-special-items-panel" class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-magenta shadow-sm">
                        <div class="flex flex-col gap-3 border-b border-mars-border pb-3 mb-4">
                            <div class="min-w-0">
                                <div class="flex items-center gap-2 mb-1 flex-wrap">
                                    <span class="px-2 py-0.5 text-xs font-black uppercase bg-mars-magenta/20 border border-mars-magenta text-mars-magenta">I+D ESPECIAL // FUERA DE CATÁLOGO</span>
                                    <span class="text-xs text-slate-400 font-mono">TÉCNICO ➔ COORDINACIÓN</span>
                                </div>
                                <h3 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tight font-black">
                                    📡 Solicitudes Especiales I+D
                                </h3>
                                <p class="text-xs text-slate-300 uppercase mt-0.5 leading-relaxed">
                                    Solicita al claustro piezas o reactivos especiales no listados en catálogo con memoria oficial en Drive.
                                </p>
                            </div>
                            ${(this.isCompanyBankrupt && this.isCompanyBankrupt(co)) ? `
                                <button type="button" onclick="ui.notifyBankruptcyLock()" class="w-full justify-center min-h-[44px] bg-slate-800 border border-red-500/40 text-slate-400 font-black px-4 py-2 text-xs uppercase cursor-not-allowed whitespace-nowrap text-center">
                                    🔒 I+D Bloqueado (Saldo ≤ 0 €v)
                                </button>
                            ` : `
                                <button type="button" onclick="ui.modalSpecialItem()" class="w-full justify-center min-h-[44px] bg-mars-magenta text-white font-black px-4 py-2 text-xs uppercase hover:bg-white hover:text-mars-magenta transition-all whitespace-nowrap shadow-[0_0_10px_rgba(255,0,85,0.3)] text-center">
                                    + Solicitar Material I+D
                                </button>
                            `}
                        </div>
                        ${specialItemsListHtml}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    viewTechWorkshop(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.bom = co.bom || [];
        co.orders = co.orders || [];
        
        const canEditWorkshop = this.getEffectiveRole(co) === 'TECNICO' || Boolean(state.user?.admin);
        const wrapper = document.createElement('div');

        let executedItems = [];
        co.orders.filter(o => o && (o.status === 'EJECUTADO' || ((o.status === 'APROBADO_FINANZAS' || o.status === 'APROBADO_DOCENTE') && o.partialExecuted))).forEach(o => {
            (o.items || []).forEach((item, idx) => {
                if (o.status === 'EJECUTADO' || (item && item.executed === true)) {
                    executedItems.push({ ...item, orderId: o.id, itemIdx: idx, itemKey: `${o.id}-${idx}` });
                }
            });
        });

        let stockCount = 0;
        let bomCount = 0;
        let b2bCount = 0;
        executedItems.forEach(item => {
            const isSold = item.b2bStatus === 'VENDIDO';
            const isListed = item.b2bStatus === 'EN_VENTA';
            const isPendingFin = item.b2bStatus === 'PENDIENTE_FINANZAS';
            const isRejectedFin = item.b2bStatus === 'RECHAZADO_FINANZAS';
            const isChecked = !isSold && !isListed && !isPendingFin && !isRejectedFin && co.bom.includes(item.itemKey);
            if (!isSold && !isListed && !isPendingFin && !isChecked) stockCount++;
            if (isChecked) bomCount++;
            if (isListed || isPendingFin) b2bCount++;
        });

        const inTransitOrders = (co.orders || []).filter(o => o.type !== 'MARKETING' && (o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS' || o.status === 'PENDIENTE_DOCENTE' || o.status === 'APROBADO_DOCENTE'));
        let bomTotal = 0;
        let bomHtml = '';

        const transitBannerHtml = inTransitOrders.length > 0 ? `
        <div class="bg-cyan-950/30 border border-cyan-500/40 p-3 rounded mb-3 space-y-1.5 text-xs">
            <div class="flex justify-between items-center gap-2 flex-wrap">
                <span class="font-bold text-mars-cyan uppercase">🚚 Órdenes en tránsito hacia Taller (${inTransitOrders.length})</span>
                <button type="button" onclick="ui.navigate('orders')" class="min-h-[44px] px-3 py-1 bg-slate-900 border border-cyan-500/50 text-cyan-300 hover:bg-cyan-900/50 font-mono text-xs uppercase rounded">Ver detalle ↗</button>
            </div>
            <div class="space-y-1 font-mono text-[11px]">
                ${inTransitOrders.map(o => {
                    const itemsArr = Array.isArray(o.items) ? o.items : [];
                    const doneCnt = itemsArr.filter(it => it && it.executed).length;
                    const stTxt = o.status === 'PENDIENTE_FINANZAS'
                        ? '⏳ Turno de Finanzas'
                        : (o.status === 'PENDIENTE_DOCENTE'
                            ? '⏳ Aduana Docente'
                            : (doneCnt > 0 ? `📦 Parcial en Taller (${doneCnt}/${itemsArr.length} compradas)` : '📦 En Taller de Operaciones'));
                    return `<div class="flex justify-between items-center gap-2 text-slate-200"><span class="truncate">Orden #${this.escapeHTML(o.id)} (${itemsArr.length} part.)</span><span class="text-amber-300 shrink-0">${stTxt}</span></div>`;
                }).join('')}
            </div>
        </div>` : '';

        if (executedItems.length === 0) {
            const hasCart = Array.isArray(co.cart) && co.cart.length > 0;
            bomHtml = transitBannerHtml + `
            <div class="bg-black/50 border border-dashed border-slate-700 p-4 rounded text-xs space-y-2.5 font-sans">
                <p class="font-bold text-white uppercase font-mono">👉 ¿Quién tiene la pelota ahora?</p>
                <p class="text-slate-300">
                    ${inTransitOrders.length > 0
                        ? 'Ya habéis pedido material: espera a que Finanzas autorice (o Operaciones recepcione la compra física en Taller) para marcar aquí las piezas del BOM.'
                        : (hasCart
                            ? `Tienes <strong>${co.cart.length} partida(s) en el Carrito</strong> sin enviar a Finanzas. Ábrelo desde SUPER-MARSKET y remítelo con DOC_9.`
                            : 'Aún no hay piezas compradas. El primer paso de I+D es entrar en <strong>SUPER-MARSKET</strong>, elegir materiales y enviar el pedido a Finanzas.')}
                </p>
                <button type="button" onclick="ui.navigate('market')" class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-black uppercase text-xs hover:bg-white transition-all rounded-sm">🛒 Ir a SUPER-MARSKET ➔</button>
            </div>`;
        } else {
            bomHtml = transitBannerHtml + executedItems.map(item => {
                const isSold = item.b2bStatus === 'VENDIDO';
                const isListed = item.b2bStatus === 'EN_VENTA';
                const isPendingFin = item.b2bStatus === 'PENDIENTE_FINANZAS';
                const isRejectedFin = item.b2bStatus === 'RECHAZADO_FINANZAS';
                const isLocked = isSold || isListed || isPendingFin;

                const isChecked = !isLocked && !isRejectedFin && co.bom.includes(item.itemKey);
                const itemQty = Number(item.qty) || 1;
                const unitPrice = Number(item.price) || 0;
                const totalItemPrice = unitPrice * itemQty;
                
                if (isChecked) bomTotal += totalItemPrice;

                let statusAction = '';
                if (isSold) {
                    statusAction = `<span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 font-bold uppercase border border-slate-700">TRASPASADO B2B</span>`;
                } else if (isListed) {
                    statusAction = `<span class="text-xs bg-mars-yellow/20 text-mars-yellow px-2.5 py-1 font-bold uppercase border border-mars-yellow animate-pulse">EN OFERTA B2B</span>`;
                } else if (isPendingFin) {
                    statusAction = `<span class="text-xs bg-cyan-950 text-mars-cyan px-2.5 py-1 font-bold uppercase border border-mars-cyan/40 animate-pulse">⏳ EN REVISIÓN FINANZAS</span>`;
                } else if (isRejectedFin) {
                    statusAction = `
                    <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-[10px] bg-red-950/60 text-red-300 border border-red-500/40 px-2 py-0.5 font-bold uppercase">REVISAR PRECIO</span>
                        ${canEditWorkshop ? `<button type="button" onclick="ui.modalSellB2B('${this.escapeHTML(item.orderId)}', ${Number(item.itemIdx)})" class="min-h-[44px] bg-amber-500/20 border border-amber-500 text-amber-300 px-2.5 py-1 text-xs font-bold uppercase hover:bg-amber-500 hover:text-black transition-colors" title="Ajustar precio y reproponer a Finanzas">[REEDITAR B2B]</button>` : ''}
                    </div>`;
                } else {
                    statusAction = canEditWorkshop
                        ? `<button type="button" onclick="ui.modalSellB2B('${this.escapeHTML(item.orderId)}', ${Number(item.itemIdx)})" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap" title="Proponer venta B2B a Finanzas">[VENDER B2B]</button>`
                        : `<span class="text-[10px] font-mono text-slate-500 uppercase">En stock I+D</span>`;
                }

                return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-2.5 border ${isSold ? 'border-slate-800 opacity-60' : (isListed ? 'border-mars-yellow/50' : (isPendingFin ? 'border-cyan-500/50' : 'border-mars-border'))} text-xs mb-2 gap-2.5">
                    <label class="mars-checkbox-label flex items-center gap-2.5 text-white ${(isLocked || !canEditWorkshop) ? 'cursor-not-allowed text-slate-300' : 'cursor-pointer'} ${isLocked ? 'line-through text-slate-400' : ''} min-w-0 flex-1 min-h-[44px]">
                        <input type="checkbox" class="mars-touch-input" ${isChecked ? 'checked' : ''} ${(isLocked || !canEditWorkshop) ? 'disabled' : ''} onchange="ui.toggleBomItem('${this.escapeHTML(item.itemKey)}', this.checked)">
                        <span class="mars-checkbox-visual"></span>
                        <span class="break-words min-w-0 flex-1">${this.escapeHTML(item.name)} (x${itemQty})</span>
                    </label>
                    <div class="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
                        <span class="text-mars-green font-mono font-bold">${totalItemPrice.toFixed(2)} €v${itemQty > 1 ? ` <span class="text-[10px] text-slate-400 font-normal">(${unitPrice.toFixed(2)} c/u)</span>` : ''}</span>
                        ${statusAction}
                    </div>
                </div>
                `;
            }).join('');
        }

        const totalDevCost = executedItems.reduce((sum, it) => sum + ((Number(it.price) || 0) * (Number(it.qty) || 1)), 0);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const isHojaLocked = !state.user?.admin && this.isDeliverableLocked('hoja_taller_fyq', co);
        const hojaFyq = co.deliverables?.hoja_taller_fyq;
        const hojaStatus = hojaFyq?.status || 'DRAFT_TECNICO';
        const hojaUrl = hojaFyq?.driveUrl || '';

        let trackerIdx = 0;
        if (hojaStatus === 'EN_TALLER_OPERARIO') trackerIdx = 1;
        else if (hojaStatus === 'SUBMITTED_TO_CEO') trackerIdx = 2;
        else if (hojaStatus === 'DELIVERED_TO_TEACHER') trackerIdx = 3;
        else trackerIdx = 0; // DRAFT_TECNICO, DEVUELTO_A_TECNICO, CEO_REVISION

        const faseIIILockNotice = isHojaLocked
            ? `<div class="bg-cyan-950/30 border border-cyan-500/40 p-2.5 rounded text-xs text-slate-200 font-sans mb-2">
                <strong class="text-mars-cyan">🛠️ Canal Vivo I+D ⇄ Taller:</strong> Aunque la entrega oficial con nota en FyQ se habilita en <strong>Fase III (15/02/2027)</strong>, enviad ya aquí cada versión del diseño/BOM para que Operaciones registre validaciones o incidencias en el <strong>Histórico de Montaje</strong>.
               </div>`
            : '';

        let hojaInnerHtml = '';
        if (!hojaFyq || hojaStatus === 'DRAFT_TECNICO') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-cyan-500/50 p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-cyan-400">[CANAL I+D ⇄ TALLER: CONFIGURACIÓN Y BOM]</span>
                    <span class="text-xs font-mono font-bold ${hojaFyq?.lastWorkshopCheckAt ? 'text-mars-green bg-mars-green/10 border border-mars-green/40' : 'text-slate-300 bg-slate-800'} px-2 py-0.5 rounded">${hojaFyq?.lastWorkshopCheckAt ? '✓ ÚLTIMA ITERACIÓN OK EN TALLER' : 'BORRADOR / NUEVA ITERACIÓN'}</span>
                </div>
                ${faseIIILockNotice}
                <p class="text-xs text-slate-300 font-sans">Genera el escandallo (BOM) en el panel de inventario, actualiza la Hoja de Taller en Google Docs y envíala al Taller para registrar la iteración de montaje.</p>
                <div class="mb-2">
                    ${this.renderDocTemplateBtn('DOC_10_HOJA_TALLER')}
                </div>
                <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Enlace Drive Hoja de Taller (BOM &amp; Histórico)</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" placeholder="https://docs.google.com/document/d/..." class="flex-1 bg-black border border-slate-700 p-2 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-cyan min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('tech-hoja-taller-drive-url') : ''}
                </div>
                <div class="flex justify-end pt-1">
                    ${canEditWorkshop
                        ? `<button type="button" onclick="ui.techSendHojaTaller()" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ 🚀 ENVIAR ITERACIÓN A TALLER ]</button>`
                        : `<span class="text-[11px] font-mono text-slate-400 uppercase">🔒 Envío reservado al Dpto. Técnico</span>`}
                </div>
            </div>`;
        } else if (hojaStatus === 'EN_TALLER_OPERARIO') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-blue-500/50 p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-blue-400">[FASE 2: EN TALLER FÍSICO]</span>
                    <span class="text-xs font-mono font-bold text-blue-300 bg-blue-900/40 border border-blue-500 px-2 py-0.5 rounded">EN TALLER (OPERARIO)</span>
                </div>
                ${faseIIILockNotice}
                <p class="text-xs text-slate-300 font-sans">La Hoja de Taller ha sido remitida a Operaciones. El Operario está ensamblando y verificando la tolerancia física para añadir el dictamen al Histórico.</p>
                <div class="pt-1 flex gap-2 items-center flex-wrap">
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/60 transition-colors"><span>Ver Documento Drive ↗</span></a>
                </div>
            </div>`;
        } else if (hojaStatus === 'DEVUELTO_A_TECNICO') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-amber-500 p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-amber-400">[SUBSANACIÓN TÉCNICA]</span>
                    <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500 px-2 py-0.5 rounded">⚠️ DEVUELTO POR INCIDENCIA EN TALLER</span>
                </div>
                ${faseIIILockNotice}
                <div class="bg-amber-950/40 border border-amber-500/50 p-2.5 my-1 text-xs text-amber-300 font-mono">
                    <strong>Motivo de Incidencia Tipificado:</strong> ${this.escapeHTML(hojaFyq.returnReason || hojaFyq.returnReasonId || 'Incidencia de taller')}
                </div>
                ${hojaFyq.returnDriveUrl ? `
                <div class="my-2">
                    <a href="${encodeURI(hojaFyq.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs bg-amber-950/60 text-amber-300 border border-amber-400 rounded hover:bg-amber-900/60 transition-colors font-bold uppercase">
                        <span>📄 Abrir Registro de Incidencias en Google Docs ↗</span>
                    </a>
                </div>` : ''}
                <p class="text-xs text-slate-300 font-sans">Corrige las tolerancias o sustituye las piezas en el Google Doc y vuelve a remitir a taller.</p>
                <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Actualizar Enlace Drive Hoja de Taller</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" class="flex-1 bg-black border border-amber-500/60 p-2 text-base sm:text-xs text-white font-mono outline-none focus:border-amber-400 min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('tech-hoja-taller-drive-url') : ''}
                </div>
                <div class="flex justify-end pt-1">
                    ${canEditWorkshop
                        ? `<button type="button" onclick="ui.techSendHojaTaller()" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ 🔄 REENVIAR A TALLER ]</button>`
                        : `<span class="text-[11px] font-mono text-slate-400 uppercase">🔒 Subsanación reservada al Dpto. Técnico</span>`}
                </div>
            </div>`;
        } else if (hojaStatus === 'SUBMITTED_TO_CEO') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-purple-500/50 p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-purple-400">[FASE 4: SUPERVISIÓN CEO]</span>
                    <span class="text-xs font-mono font-bold text-purple-300 bg-purple-900/40 border border-purple-500 px-2 py-0.5 rounded">VALIDADO EN TALLER // EN REVISIÓN CEO</span>
                </div>
                <p class="text-xs text-slate-300 font-sans">Operaciones ha validado el montaje físico definitivo. La Hoja de Taller está pendiente del visado final del CEO hacia el profesor de FyQ.</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono"><span>Ver Documento Drive ↗</span></a>
            </div>`;
        } else if (hojaStatus === 'CEO_REVISION') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-mars-magenta p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-mars-magenta">[REVISIÓN REQUERIDA POR CEO]</span>
                    <span class="text-xs font-mono font-bold text-mars-magenta bg-mars-magenta/20 border border-mars-magenta px-2 py-0.5 rounded">⚠️ DEVUELTO POR CEO</span>
                </div>
                <div class="bg-red-950/40 border border-red-500/50 p-2.5 my-1 text-xs text-red-300 font-mono">
                    <strong>Motivo de Devolución CEO:</strong> ${this.escapeHTML(hojaFyq.returnReason || hojaFyq.returnReasonId || 'Requiere subsanación técnica')}
                </div>
                <p class="text-xs text-slate-300 font-sans">Corrige las observaciones en el documento de Drive y vuelve a enviar a Taller/CEO.</p>
                <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Actualizar Enlace Drive Hoja de Taller</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" class="flex-1 bg-black border border-mars-magenta/60 p-2 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-magenta min-h-[44px]">
                    ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('tech-hoja-taller-drive-url') : ''}
                </div>
                <div class="flex justify-end pt-1">
                    <button type="button" onclick="ui.techSendHojaTaller()" class="min-h-[44px] bg-mars-magenta text-white font-black uppercase text-xs px-4 py-2 hover:bg-white hover:text-mars-magenta transition-all">[ 🔄 REENVIAR A REVISIÓN ]</button>
                </div>
            </div>`;
        } else if (hojaStatus === 'DELIVERED_TO_TEACHER') {
            hojaInnerHtml = `
            <div class="bg-slate-900 border border-mars-green/50 p-4 space-y-3 rounded">
                <div class="flex justify-between items-center flex-wrap gap-2">
                    <span class="text-xs font-bold uppercase text-mars-green">[COMPLETADO: ENTREGADO A DOCENTE]</span>
                    <span class="text-xs font-mono font-bold text-mars-green bg-mars-green/10 border border-mars-green/30 px-2 py-0.5 rounded">✓ VISADO Y ENTREGADO A FYQ</span>
                </div>
                <p class="text-xs text-slate-300 font-sans">El CEO ha visado y remitido la Hoja de Taller al profesor de Física y Química para su evaluación oficial (10%).</p>
                <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono"><span>Abrir Documento Oficial Drive ↗</span></a>
            </div>`;
        }

        const historyTimelineHtml = this.renderHojaTallerHistoryHtml ? this.renderHojaTallerHistoryHtml(hojaFyq) : '';
        const hojaPanelHtml = `
        <div id="tech-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-cyan-400">
            <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-cyan-400 text-sm sm:text-base uppercase tracking-tighter">Hoja de Taller: BOM e Histórico de Montaje (FYQ)</h3>
                    <p class="text-xs text-slate-300 mt-0.5 font-sans">Canal vivo I+D ⇄ Taller para configurar el cohete. Con el histórico elaboraréis la entrega de Fase III (Peso: 10% FyQ).</p>
                </div>
                <span class="text-xs font-mono font-bold px-2.5 py-1 uppercase border ${isHojaLocked ? 'text-cyan-300 bg-cyan-950/50 border-cyan-500/40' : 'text-mars-green bg-mars-green/10 border-mars-green/40'}">${isHojaLocked ? '🛠️ Canal I+D ⇄ Taller Activo' : '📤 Entrega Fase III Abierta'}</span>
            </div>
            ${this.renderWorkflowTracker(['1. I+D (BOM)', '2. Taller (Montaje)', '3. CEO (Aval · Fase III)', '4. Docente FyQ'], trackerIdx)}
            ${hojaInnerHtml}
            ${historyTimelineHtml}
        </div>`;

        wrapper.innerHTML = `
        <div class="space-y-6">
            ${this.renderActiveContractTacticalBanner ? this.renderActiveContractTacticalBanner(co) : ''}
            ${!canEditWorkshop ? `<div class="bg-slate-950 border border-slate-700 p-3 text-xs font-mono text-slate-300 rounded">🔒 Vista de solo lectura: La edición del BOM, ventas B2B y envíos de Hoja de Taller corresponden al Dpto. Técnico (I+D).</div>` : ''}
            <!-- Cabecera Taller -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 class="font-orbitron text-mars-yellow text-lg sm:text-xl uppercase tracking-tighter flex items-center gap-2">
                        <span>🔧 Taller de Ensamble y Desglose BOM</span>
                        <span class="text-[10px] font-mono text-mars-yellow bg-mars-yellow/10 px-2 py-0.5 border border-mars-yellow/40 uppercase">Dpto. Técnico</span>
                    </h2>
                    <p class="text-xs text-slate-300 uppercase mt-1">Configuración del escandallo de materiales (BOM), desinversión de excedentes en el mercado secundario B2B y workflow de Hoja de Taller.</p>
                </div>
                <div class="flex items-center gap-2 text-xs font-mono font-bold flex-wrap">
                    <span class="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-300">📦 Stock: ${stockCount}</span>
                    <span class="px-2.5 py-1 bg-mars-green/10 border border-mars-green text-mars-green">🚀 En BOM: ${bomCount}</span>
                    <span class="px-2.5 py-1 bg-mars-yellow/10 border border-mars-yellow text-mars-yellow">🤝 En Venta B2B: ${b2bCount}</span>
                </div>
            </div>

            <!-- Grid de 2 columnas -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Columna Izquierda: Escandallo BOM e Inventario (lg:col-span-7) -->
                <div class="lg:col-span-7 space-y-6">
                    <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-magenta">
                        <div class="flex flex-col gap-3 mb-4 border-b border-mars-border pb-3">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 w-full">
                                <div>
                                    <h3 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tighter">Inventario Físico & Ventas B2B</h3>
                                    <p class="text-xs text-slate-300 uppercase mt-0.5">Marca las piezas que integran el cohete final o vende el excedente a otras empresas.</p>
                                </div>
                            </div>
                            <div class="flex flex-wrap items-center gap-2 w-full pt-1">
                                <button type="button" onclick="ui.roleDeliverablesSection = 'grades'; ui.navigate('role_deliverables');" class="min-h-[44px] bg-mars-cyan/10 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black px-3 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap">[ 📄 Ver Dossier Inversores ↗ ]</button>
                                <button type="button" onclick="ui.setMarketTab('b2b'); ui.navigate('market')" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-4 py-2 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all whitespace-nowrap">[ 🤝 Ver Mercado B2B ]</button>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 bg-black p-3 border border-mars-border">
                            <div class="text-center sm:border-r border-slate-800 pb-2 sm:pb-0 border-b sm:border-b-0">
                                <p class="text-xs text-slate-300 uppercase font-bold">Inversión Total I+D Ejecutada</p>
                                <p class="text-mars-cyan font-mono font-bold text-base mt-1">${totalDevCost.toFixed(2)} €v</p>
                            </div>
                            <div class="text-center">
                                <p class="text-xs text-slate-300 uppercase font-bold">Coste Prototipo Final (BOM)</p>
                                <p class="text-mars-green font-mono font-bold text-lg mt-1">${bomTotal.toFixed(2)} €v</p>
                            </div>
                        </div>

                        <div class="bg-black p-3 border border-slate-800 mb-4 space-y-1.5">
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-slate-300 uppercase">Coste Operativo Bruto:</span>
                                <span class="text-white font-mono font-bold">${grossCosts.toFixed(2)} €v</span>
                            </div>
                            ${(sponsorAmt > 0 && sponsorTierLabel) ? `
                            <div class="flex justify-between items-center text-xs">
                                <span class="text-amber-400 uppercase font-bold">Reducción Patrocinio ${this.getSponsorTierBadge ? this.getSponsorTierBadge(sponsorTierLabel) : `(${this.escapeHTML(sponsorTierLabel)})`}:</span>
                                <span class="text-amber-400 font-mono font-bold">-${sponsorAmt.toFixed(2)} €v</span>
                            </div>` : ''}
                            <div class="flex justify-between items-center text-xs border-t border-slate-800 pt-1.5">
                                <span class="text-mars-green font-bold uppercase">Coste Operativo Neto:</span>
                                <span class="text-mars-green font-mono font-bold text-sm">${netOpCosts.toFixed(2)} €v</span>
                            </div>
                        </div>

                        <div class="max-h-[460px] overflow-y-auto pr-1">
                            ${bomHtml}
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Hoja de Taller (lg:col-span-5) -->
                <div class="lg:col-span-5 space-y-6">
                    ${hojaPanelHtml}
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    setTechOrdersFilter(tab) {
        this.techOrdersFilter = tab || 'EN_PROCESO';
        this.render();
    },

    toggleBomItem(itemKey, isChecked) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        if (this.getEffectiveRole(co) !== 'TECNICO' && !state.user.admin) {
            return this.notify("Solo el Departamento Técnico (I+D) puede modificar el desglose BOM.", "warning");
        }
        co.bom = co.bom || [];
        
        if (isChecked) {
            if (!co.bom.includes(itemKey)) co.bom.push(itemKey);
        } else {
            co.bom = co.bom.filter(k => k !== itemKey);
        }
        state.save();
        this.render();
    },

    modalSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return this.notify("Componente no localizado en el inventario.", "error");

        const item = ord.items[itemIdx];
        if (item.b2bStatus === 'EN_VENTA' || item.b2bStatus === 'VENDIDO') {
            return this.notify("Este componente ya está en venta en el mercado o ha sido transferido.", "warning");
        }
        if (item.b2bStatus === 'PENDIENTE_FINANZAS') {
            return this.notify("Esta propuesta ya está en revisión por el Dpto. de Finanzas.", "info");
        }
        const qty = Number(item.qty) || 1;
        const totalOrigCost = (Number(item.price) || 0) * qty;
        const defaultPrice = (item.b2bSuggestedPrice && Number(item.b2bSuggestedPrice) > 0)
            ? Number(item.b2bSuggestedPrice)
            : totalOrigCost;

        let rejectionNotice = '';
        if (item.b2bStatus === 'RECHAZADO_FINANZAS') {
            rejectionNotice = `
            <div class="mb-4 bg-amber-950/60 border border-amber-500/50 p-3 rounded text-xs space-y-1">
                <span class="text-amber-400 font-bold uppercase block">⚠️ Propuesta Devuelta por Finanzas:</span>
                <p class="text-slate-200">Motivo: <em>${this.escapeHTML(item.b2bRejectReason || 'Ajuste de precio solicitado')}</em></p>
                <p class="text-mars-yellow font-mono font-bold">Precio contraofertado por Finanzas: ${Number(item.b2bSuggestedPrice || defaultPrice).toFixed(2)} €v</p>
            </div>`;
        }

        const html = `
            ${rejectionNotice}
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Vas a proponer internamente a Finanzas la venta de <strong>${this.escapeHTML(item.name)} (x${qty})</strong> en el Mercado Secundario B2B. El coste original de adquisición del lote fue de <span class="text-mars-cyan font-bold">${totalOrigCost.toFixed(2)} €v</span>${qty > 1 ? ` (${Number(item.price).toFixed(2)} €v c/u)` : ''}.</p>
            <div class="space-y-3">
                <div>
                    <label for="b2b-sell-price" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Precio de Venta Sugerido para el Lote (€v)</label>
                    <input type="number" id="b2b-sell-price" value="${defaultPrice.toFixed(0)}" min="1" step="1" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label for="b2b-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Informe Técnico de Excedentes (Google Drive / Docs)</label>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_7_B2B_DESINVERSION')}
                    </div>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="b2b-drive-url" value="${this.escapeHTML(item.b2bDriveUrl || '')}" placeholder="https://docs.google.com/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono" required>
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('b2b-drive-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1">Adjunta la memoria técnica en Google Drive justificando el excedente para autorización en Aduana Docente. No pegues la plantilla <code>/copy</code> sin copiar.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmSellB2B('${this.escapeHTML(orderId)}', ${Number(itemIdx)})" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all">Proponer Venta a Finanzas</button>`;
        this.showModal(item.b2bStatus === 'RECHAZADO_FINANZAS' ? "Reajustar Propuesta B2B" : "Proponer Venta B2B a Finanzas", html, actions);
    },

    confirmSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const elPrice = document.getElementById('b2b-sell-price');
        const elDriveUrl = document.getElementById('b2b-drive-url');
        if (!elPrice) return;

        const price = parseFloat(String(elPrice.value).replace(',', '.'));
        if (isNaN(price) || price <= 0) return this.notify("Introduce un precio en €v válido mayor que cero.", "warning");
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elDriveUrl ? elDriveUrl.value : '', elDriveUrl, { required: true, label: 'el informe técnico de excedentes DOC_7' })
            : { valid: Boolean(elDriveUrl && this.cleanInput(elDriveUrl.value) && (typeof GOOGLE_DRIVE_REGEX === 'undefined' || GOOGLE_DRIVE_REGEX.test(this.cleanInput(elDriveUrl.value)))), url: elDriveUrl ? this.cleanInput(elDriveUrl.value) : '' };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock(`tech-sell-b2b-${orderId}-${itemIdx}`, 1500)) return;

        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return;

        const item = ord.items[itemIdx];
        const itemKey = `${orderId}-${itemIdx}`;

        co.bom = (co.bom || []).filter(k => k !== itemKey);
        item.b2bStatus = 'PENDIENTE_FINANZAS';
        item.b2bProposedPrice = price;
        item.b2bDriveUrl = driveUrl;
        delete item.b2bRejectReason;

        state.data.b2bMarket = state.data.b2bMarket || [];
        let offer = state.data.b2bMarket.find(o => o.sourceOrderKey === itemKey && o.sellerCoId === state.user.coId);
        if (!offer) {
            offer = {
                id: 'LST-' + Date.now(),
                sellerCoId: state.user.coId,
                sellerName: co.name,
                itemName: item.name,
                category: item.category || 'Componente',
                qty: item.qty || 1,
                price: price,
                driveUrl: driveUrl,
                obs: 'Propuesta de excedente I+D: ' + driveUrl,
                notes: 'Propuesta de excedente I+D: ' + driveUrl,
                status: 'PENDIENTE_FINANZAS',
                sourceOrderKey: itemKey,
                date: new Date().toLocaleDateString(),
                timestamp: Date.now(),
                updatedAt: Date.now()
            };
            state.data.b2bMarket.unshift(offer);
        } else {
            offer.price = price;
            offer.driveUrl = driveUrl;
            offer.obs = 'Propuesta de excedente I+D: ' + driveUrl;
            offer.notes = 'Propuesta de excedente I+D: ' + driveUrl;
            offer.status = 'PENDIENTE_FINANZAS';
            delete offer.rejectReason;
            offer.updatedAt = Date.now();
        }

        ui.pushNotification(state.user.coId, 'FINANZAS', `I+D propone venta B2B de "${item.name}" por ${price.toFixed(2)} €v. Revisa la propuesta en Órdenes.`, 'info', { view: 'finance' });
        telemetry.log("PROPUESTA B2B", `I+D propone venta B2B: ${item.name} por ${price}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.closeModal();
        this.notify(`✅ Propuesta de venta de "${item.name}" enviada a Finanzas por ${price.toFixed(2)} €v.`, "success");
        this.render();
    },

    submitFlightTest() {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();

        if (!state.user?.admin && (!co.launchLicense || co.launchLicense.status !== 'APROBADA')) {
            return this.notify("⛔ Lanzamiento bloqueado: Se requiere Licencia de Lanzamiento AESA (DOC_14) tramitada por el CEO y validada por Coordinación Docente.", "error");
        }

        const elBottle = document.getElementById('ft-bottle');
        const elNahco3 = document.getElementById('ft-nahco3');
        const elVinegar = document.getElementById('ft-vinegar');
        const elCost = document.getElementById('ft-cost');
        const elHeightMm = document.getElementById('ft-height-mm');
        const elVideoUrl = document.getElementById('ft-video-url');
        
        if (!elBottle || !elNahco3 || !elVinegar || !elCost || !elHeightMm) return; 

        const bottle = this.cleanInput(elBottle.value);
        const rawNahco3 = String(elNahco3.value || '').trim().replace(',', '.');
        const rawVinegar = String(elVinegar.value || '').trim().replace(',', '.');
        const rawCost = String(elCost.value || '').trim().replace(',', '.');
        const rawHeight = String(elHeightMm.value || '').trim().replace(',', '.');
        const rawVideoUrl = elVideoUrl ? this.cleanInput(elVideoUrl.value).trim() : '';

        // Controlar que las entradas de masa (NaHCO3) y volumen (CH3COOH) rechacen números negativos o cadenas con caracteres alfanuméricos no numéricos
        const strictNumPattern = /^[0-9]+(\.[0-9]+)?$/;
        if (!strictNumPattern.test(rawNahco3)) {
            if (this.highlightInvalidField) this.highlightInvalidField('', elNahco3);
            return this.notify("La masa de NaHCO3 debe ser un valor numérico estrictamente positivo (puedes usar punto o coma decimal).", "error");
        }
        if (!strictNumPattern.test(rawVinegar)) {
            if (this.highlightInvalidField) this.highlightInvalidField('', elVinegar);
            return this.notify("El volumen de vinagre (CH3COOH) debe ser un valor numérico estrictamente positivo (punto o coma decimal).", "error");
        }

        const naHCO3 = parseFloat(rawNahco3);
        const vinegar = parseFloat(rawVinegar);
        const costEurV = parseFloat(rawCost);
        const heightMm = parseFloat(rawHeight); // <--- v1.0.16: Se registra en milímetros

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightMm)) return this.notify("Rellene todos los datos numéricos del ensayo.", "warning");
        if(naHCO3 <= 0 || vinegar <= 0) return this.notify("La masa y el volumen de reactivos deben ser mayores a cero.", "warning");
        if(this.hasForbiddenWords(bottle, 'Banco de Pruebas (Fuselaje)', elBottle)) return;
        if(costEurV <= 0) {
            if (this.highlightInvalidField) this.highlightInvalidField('', elCost);
            return this.notify("El coste del ensayo debe ser mayor a cero (€v).", "warning");
        }
        if(heightMm <= 0) {
            if (this.highlightInvalidField) this.highlightInvalidField('', elHeightMm);
            return this.notify("La altura alcanzada debe ser estrictamente mayor que 0 mm.", "warning");
        }

        if (rawVideoUrl) {
            const videoCheck = this.validateStudentDriveUrl
                ? this.validateStudentDriveUrl(rawVideoUrl, elVideoUrl, { required: false, label: 'el vídeo de cálculo E' })
                : { valid: (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(rawVideoUrl)) };
            if (!videoCheck.valid) return;
        }
        if (this.acquireActionLock && !this.acquireActionLock('flight-test-' + (state.user.coId || 'co'), 1200)) return;

        // Eficiencia: Milímetros por cada € virtual gastado
        const efficiency = heightMm / costEurV;
        
        co.flightTests = co.flightTests || [];
        co.flightTests.unshift({
            id: 'FLT-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
            date: new Date().toLocaleDateString(),
            bottle,
            naHCO3,
            vinegar,
            costEurV,
            heightMm,
            efficiency,
            videoUrl: rawVideoUrl || ''
        });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightMm}mm, E=${efficiency.toFixed(2)}${rawVideoUrl ? ' (+Vídeo E)' : ''}`);
        state.save();
        this.notify("✅ Ensayo de vuelo registrado en el banco de pruebas.", "success");
        this.render();
    },

    modalAttachFlightVideo(flightId) {
        if (!state.user) return;
        const co = state.data.companies?.[state.user.coId];
        if (!co || !Array.isArray(co.flightTests)) return;
        const f = co.flightTests.find(x => String(x.id) === String(flightId));
        if (!f) return this.notify("Ensayo de vuelo no localizado.", "error");

        const h_mm = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : 0);
        const effVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : 0;
        const curVideo = typeof f.videoUrl === 'string' ? f.videoUrl : '';

        const html = `
            <div class="space-y-4 font-mono">
                <div class="bg-slate-900 border border-slate-700 p-3 text-xs space-y-1">
                    <p class="text-white font-bold uppercase">${this.escapeHTML(f.bottle || 'Prototipo')} (${this.escapeHTML(f.date || '--')})</p>
                    <p class="text-slate-300">Altura: <strong class="text-mars-green">${h_mm.toFixed(0)} mm</strong> | Coste: <strong class="text-mars-magenta">${Number(f.costEurV || 0).toFixed(2)} €v</strong> | Eficiencia E = <strong class="text-mars-yellow">${effVal.toFixed(2)}</strong></p>
                </div>
                <div>
                    <label for="attach-flight-video-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">
                        🎥 Enlace al Vídeo en Google Drive demostrando E = Altura / Coste (Opcional)
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="attach-flight-video-url" value="${this.escapeHTML(curVideo)}" placeholder="https://drive.google.com/file/d/..." class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('attach-flight-video-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Asegúrate de configurar el acceso compartido como <em>"Cualquiera con el enlace puede ver"</em>. Déjalo vacío si deseas quitar el vídeo.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.saveFlightVideo('${this.escapeHTML(String(f.id))}')" class="min-h-[44px] bg-mars-cyan text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-colors tracking-wider">💾 Guardar Enlace de Vídeo</button>`;
        this.showModal("Vídeo Demostrativo del Cálculo de E", html, actions);
    },

    saveFlightVideo(flightId) {
        if (!state.user) return;
        const co = state.data.companies?.[state.user.coId];
        if (!co || !Array.isArray(co.flightTests)) return;
        const f = co.flightTests.find(x => String(x.id) === String(flightId));
        if (!f) return this.notify("Ensayo de vuelo no localizado.", "error");

        const elUrl = document.getElementById('attach-flight-video-url');
        if (!elUrl) return;
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: false, label: 'el vídeo de cálculo E' })
            : { valid: true, url: this.cleanInput(elUrl.value).trim() };
        if (!urlCheck.valid) return;
        const videoUrl = urlCheck.url;

        f.videoUrl = videoUrl;
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.closeModal();
        this.notify(videoUrl ? "✅ Enlace al vídeo de cálculo de E adjuntado al ensayo." : "🗑️ Enlace de vídeo retirado del ensayo.", "success");
        this.render();
    },

    modalSpecialItem() {
        if (!state.user) return;
        const html = `
            <div class="space-y-4 font-mono">
                <div class="bg-mars-cyan/10 border border-mars-cyan/40 p-3">
                    <p class="text-xs text-mars-cyan font-black uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <span>🔒 Directiva RGPD / Cero Texto Libre</span>
                    </p>
                    <p class="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Para salvaguardar la privacidad y evitar filtraciones, no se admite descripción libre en la app. Describe el nombre técnico de la pieza, sus especificaciones, planos y justificación directamente en tu documento oficial de Google Drive o Google Docs.
                    </p>
                </div>
                <div>
                    <label for="special-item-drive-url" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">
                        📄 Memoria Técnica / Ficha de Pieza en Google Drive o Docs (URL)
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="special-item-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" required class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('special-item-drive-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">
                        Configura los permisos del documento en Google Drive como <em>"Cualquiera con el enlace puede ver"</em> para que el CEO y el claustro docente examinen los planos y especificaciones.
                    </p>
                </div>
                <div class="pt-1">
                    ${this.renderDocTemplateBtn('DOC_13_SOLICITUD_ID', '📄 Ver Plantilla Solicitud I+D (DOC_13)')}
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitSpecialItem()" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors tracking-wider">Enviar a CEO para Aprobación</button>`;
        this.showModal("Solicitar Ítem Especial / Fuera de Mercado", html, actions);
    },

    submitSpecialItem() {
        if (!state.user) return;
        const elUrl = document.getElementById('special-item-drive-url');
        if (!elUrl) return; 
        
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'la solicitud I+D (DOC_13)' })
            : { valid: Boolean(this.cleanInput(elUrl.value)), url: this.cleanInput(elUrl.value) };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock('submit-special-' + state.user.coId, 1500)) return;
        
        const coId = state.user.coId;
        const co = state.data.companies?.[coId];
        if (!co) return auth.logout();
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        const coName = co.name || 'STARTUP';
        const defaultName = `Componente Especial I+D (${coName})`;
        
        co.specialItemRequests = co.specialItemRequests || [];
        const reqId = 'SP-' + Date.now();
        co.specialItemRequests.unshift({ 
            id: reqId, 
            companyId: coId, 
            companyName: coName, 
            name: defaultName, 
            driveUrl: driveUrl, 
            date: new Date().toLocaleDateString(), 
            status: 'PENDIENTE_CEO',
            createdAt: Date.now()
        });
        
        ui.pushNotification(coId, 'CEO', `🔬 Solicitud de Material I+D fuera de catálogo remitida por el Dpto. Técnico para visado.`, 'info', { view: 'dashboard', anchorId: 'ceo-special-items-panel' });
        
        co.updatedAt = Date.now();
        state.save(coId);
        this.closeModal();
        this.notify("✅ Solicitud de material I+D enviada al CEO para su aprobación previa.", "success");
        this.render();
    },

    modalResubmitSpecialItem(reqId) {
        if (!state.user) return;
        const co = state.data.companies?.[state.user.coId];
        if (!co || !Array.isArray(co.specialItemRequests)) return;
        const req = co.specialItemRequests.find(r => r.id === reqId);
        if (!req) return;

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="bg-rose-950/40 border border-rose-500/50 p-3 text-rose-200 space-y-1">
                    <strong class="uppercase text-rose-400 block">↩ Observación del CEO:</strong>
                    <p>${this.escapeHTML(req.returnReason || 'Revisión de memoria técnica DOC_13 solicitada por el CEO.')}</p>
                </div>
                <div>
                    <label for="resubmit-special-item-url" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">
                        📄 Nuevo o Actualizado Enlace a DOC_13 en Google Drive / Docs (URL)
                    </label>
                    <div class="flex flex-col sm:flex-row gap-2">
                        <input type="url" id="resubmit-special-item-url" value="${req.driveUrl ? this.escapeHTML(req.driveUrl) : ''}" placeholder="https://docs.google.com/... o https://drive.google.com/..." onfocus="this.scrollIntoView({ behavior: 'smooth', block: 'center' })" required class="flex-1 min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow">
                        ${this.renderDriveTestBtnHtml ? this.renderDriveTestBtnHtml('resubmit-special-item-url') : ''}
                    </div>
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Asegúrate de haber corregido el documento y mantenido permisos públicos de lectura.</p>
                </div>
                <div class="pt-1">
                    ${this.renderDocTemplateBtn('DOC_13_SOLICITUD_ID', '📄 Ver Plantilla Solicitud I+D (DOC_13)')}
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.resubmitSpecialItem('${this.escapeHTML(reqId)}')" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-colors tracking-wider">[ 🔄 Reenviar al CEO para Visado ]</button>`;
        this.showModal("Subsanar Solicitud de Material I+D", html, actions);
    },

    resubmitSpecialItem(reqId) {
        if (!state.user) return;
        const elUrl = document.getElementById('resubmit-special-item-url');
        if (!elUrl) return;
        const urlCheck = this.validateStudentDriveUrl
            ? this.validateStudentDriveUrl(elUrl.value, elUrl, { required: true, label: 'la subsanación DOC_13' })
            : { valid: Boolean(this.cleanInput(elUrl.value)), url: this.cleanInput(elUrl.value) };
        if (!urlCheck.valid) return;
        const driveUrl = urlCheck.url;
        if (this.acquireActionLock && !this.acquireActionLock('resubmit-special-' + reqId, 1500)) return;

        const coId = state.user.coId;
        const co = state.data.companies?.[coId];
        if (!co || !Array.isArray(co.specialItemRequests)) return;
        if (this.isCompanyBankrupt && this.isCompanyBankrupt(co)) {
            return this.notifyBankruptcyLock();
        }
        const req = co.specialItemRequests.find(r => r.id === reqId);
        if (!req) return;

        req.driveUrl = driveUrl;
        req.status = 'PENDIENTE_CEO';
        delete req.returnReason;
        req.resubmittedAt = Date.now();

        ui.pushNotification(coId, 'CEO', `🔬 El Dpto. Técnico ha subsanado y reenviado la solicitud de Material I+D "${req.name || 'Componente'}" para visado.`, 'info', { view: 'dashboard', anchorId: 'ceo-special-items-panel' });

        co.updatedAt = Date.now();
        state.save(coId);
        this.closeModal();
        this.notify("✅ Solicitud subsanada y reenviada al CEO.", "success");
        this.render();
    },

    modalCustom() {
        return this.modalSpecialItem();
    },

    submitCustom() {
        return this.submitSpecialItem();
    },

    setTechDocTab(tab) {
        this.techDocTab = tab;
        this.render();
    }
});
