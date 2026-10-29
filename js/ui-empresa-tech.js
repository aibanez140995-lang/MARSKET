// js/ui-empresa-tech.js
// --- MÓDULO I+D: BANCO DE PRUEBAS (en mm), MATEMÁTICAS, ENTREGABLES CIENTÍFICOS Y TALLER BOM (v1.1.44) ---

Object.assign(ui, {
    setTechDocTab(tab) {
        this.techDocTab = tab;
        this.render();
    },

    techSendHojaTaller() {
        if (!state.user) return;
        if (!state.user.admin && this.isDeliverableLocked('hoja_taller_fyq')) {
            return this.notify("La Hoja de Taller se encuentra bloqueada hasta su fecha de apertura.", "error");
        }
        const el = document.getElementById('tech-hoja-taller-drive-url');
        if (!el) return;
        const url = this.cleanInput(el.value);
        if (!url) return this.notify("Debes introducir el enlace de Google Drive con la Hoja de Taller y BOM.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(url)) {
            return this.notify("Solo se admiten enlaces válidos a recursos de Google Drive.", "error");
        }
        state.sendHojaTallerToWorkshop(url);
    },

    viewTech(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const docs = co.deliverables || {};
        co.flightTests = co.flightTests || [];
        co.orders = co.orders || [];
        
        const activeDocTab = this.techDocTab || 'FYQ';
        const wrapper = document.createElement('div');
        
        let ftHtml = co.flightTests.map(f => {
            // Retrocompatibilidad: Si el vuelo se guardó en metros o con claves heredadas, normaliza sin producir NaN
            const h_mm = !isNaN(Number(f.heightMm)) ? Number(f.heightMm) : (!isNaN(Number(f.heightM)) ? Number(f.heightM) * 1000 : 0);
            const naVal = !isNaN(Number(f.naHCO3)) ? Number(f.naHCO3) : (!isNaN(Number(f.nahco3)) ? Number(f.nahco3) : (!isNaN(Number(f.weightG)) ? Number(f.weightG) : 0));
            const vinVal = !isNaN(Number(f.vinegar)) ? Number(f.vinegar) : (!isNaN(Number(f.waterMl)) ? Number(f.waterMl) : 0);
            const costVal = !isNaN(Number(f.costEurV)) ? Number(f.costEurV) : 0;
            const effVal = !isNaN(Number(f.efficiency)) ? Number(f.efficiency) : (costVal > 0 ? h_mm / costVal : 0);
            return `
            <tr class="border-b border-mars-border/40 hover:bg-slate-900/50">
                <td class="py-2.5 text-slate-300 pr-3">${this.escapeHTML(f.date || '--')}</td>
                <td class="py-2.5 font-bold text-white pr-3">${this.escapeHTML(f.bottle || 'Prototipo')}</td>
                <td class="py-2.5 text-mars-cyan pr-3">${naVal}g / ${vinVal}ml</td>
                <td class="py-2.5 font-mono text-mars-magenta pr-3">${costVal.toFixed(2)}</td>
                <td class="py-2.5 font-mono text-mars-green font-bold text-sm sm:text-base pr-3">${h_mm.toFixed(0)}</td>
                <td class="py-2.5 font-orbitron font-mono tabular-nums text-mars-yellow font-black">${effVal.toFixed(2)}</td>
            </tr>`;
        }).join('') || `<tr><td colspan="6" class="text-center py-4 text-slate-300 italic text-xs">No hay ensayos registrados.</td></tr>`;

        const isFyqAllLocked = !state.user?.admin && ['preliminaryReport', 'technicalReport'].every(k => this.isDeliverableLocked(k, co));
        const isMatAllLocked = !state.user?.admin && ['goniometerEvidence', 'mathReportDist', 'mathReportTwoPoints', 'mathReportFinal'].every(k => this.isDeliverableLocked(k, co));

        let docSectionContent = '';
        if (activeDocTab === 'FYQ') {
            docSectionContent = `
                <div class="mb-3 flex flex-wrap justify-between items-center gap-2">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 25% Global</span>
                    <span class="text-xs text-slate-300 uppercase font-bold">Resp: Dpto. Técnico</span>
                </div>
                <p class="text-xs text-slate-300 mb-3 uppercase leading-relaxed">Sube únicamente enlaces verificados de Google Drive con permisos de lectura compartidos ("Cualquiera con el enlace puede ver").</p>
                ${state.data.config.guidelines.techReportNotes ? `<p class="text-xs text-mars-yellow mb-3 italic">Info: ${this.escapeHTML(state.data.config.guidelines.techReportNotes)}</p>` : ''}
                ${state.data.config.guidelines.techReportDocUrl ? `<a href="${this.escapeHTML(state.data.config.guidelines.techReportDocUrl)}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] flex items-center justify-center border border-mars-cyan text-mars-cyan text-xs py-2.5 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black transition-colors">Abrir Guía Oficial FYQ</a>` : ''}
                
                ${isFyqAllLocked ? `
                    <div class="terminal-border border-dashed p-6 text-center text-slate-400 italic text-xs uppercase">
                        🔒 No hay entregables activos en esta fase. Se habilitarán según el cronograma oficial.
                    </div>
                ` : `
                    ${this.renderDriveLinkBox('1. Hoja de Registro Preliminar (Fase I)', 'Enlace Drive al presupuesto teórico, materiales del catálogo, altura estimada, boceto y foto del prototipo montado sin combustible.', 'preliminaryReport', docs.preliminaryReport)}
                    ${this.renderDriveLinkBox('2. Informe Técnico Exhaustivo (Fase II)', 'Enlace Drive al documento formal con marco químico estequiométrico, análisis físico-aerodinámico, balance definitivo y análisis V2.0.', 'technicalReport', docs.technicalReport)}
                `}
            `;
        } else {
            docSectionContent = `
                <div class="mb-3 flex flex-wrap justify-between items-center gap-2">
                    <span class="bg-mars-yellow/10 border border-mars-yellow text-mars-yellow text-xs font-black px-2.5 py-1 uppercase">Peso en Proyecto: 5% Global (25% cada criterio)</span>
                    <span class="text-xs text-slate-300 uppercase font-bold">Resp: Dpto. Técnico</span>
                </div>
                <p class="text-xs text-slate-300 mb-4 uppercase leading-relaxed">Entregables trigonométricos y constructivos para Matemáticas (Solo Enlaces Drive/Cloud).</p>
                
                ${isMatAllLocked ? `
                    <div class="terminal-border border-dashed p-6 text-center text-slate-400 italic text-xs uppercase">
                        🔒 No hay entregables activos en esta fase. Se habilitarán según el cronograma oficial.
                    </div>
                ` : `
                    ${this.renderDriveLinkBox('1. Elaboración de Goniómetro/s (25% MAT)', 'Enlace a carpeta/documento Drive con fotografías, diseño constructivo y calibración del goniómetro casero.', 'goniometerEvidence', docs.goniometerEvidence)}
                    ${this.renderDriveLinkBox('2. Informe Empírico: Distancia Conocida (25% MAT)', 'Enlace Drive al cálculo trigonométrico de apogeo con datos objetivos desde una distancia conocida a la base.', 'mathReportDist', docs.mathReportDist)}
                    ${this.renderDriveLinkBox('3. Informe Empírico: Dos Mediciones (25% MAT)', 'Enlace Drive al cálculo de altitud mediante sistema de dos mediciones tomadas a una distancia de separación conocida.', 'mathReportTwoPoints', docs.mathReportTwoPoints)}
                    ${this.renderDriveLinkBox('4. Informe Técnico Final Comparativo (25% MAT)', 'Enlace Drive al análisis de coherencia comparando resultados anteriores y parámetros adicionales.', 'mathReportFinal', docs.mathReportFinal)}
                `}
            `;
        }

        // --- Panel de Seguimiento de Órdenes I+D (Técnico) ---
        const techFilter = this.techOrdersFilter || 'EN_PROCESO';
        const techOrders = co.orders || [];
        const techPendingCount = techOrders.filter(o => o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS').length;
        const techCompletedCount = techOrders.filter(o => o.status === 'EJECUTADO').length;
        const techRejectedCount = techOrders.filter(o => o.status === 'RECHAZADO').length;

        const filteredTechOrders = techOrders.filter(o => {
            if (techFilter === 'EN_PROCESO') return (o.status === 'PENDIENTE_FINANZAS' || o.status === 'APROBADO_FINANZAS');
            if (techFilter === 'COMPLETADAS') return o.status === 'EJECUTADO';
            if (techFilter === 'DENEGADAS') return o.status === 'RECHAZADO';
            return true;
        });

        const techOrdersHtml = filteredTechOrders.length === 0
            ? `<div class="terminal-border border-dashed p-6 text-center text-slate-400 italic text-xs uppercase">No hay órdenes en esta vista.</div>`
            : filteredTechOrders.map(order => {
                const st = order.status || 'PENDIENTE_FINANZAS';
                let stBadge = 'bg-amber-950/40 text-amber-400 border border-amber-500';
                let trackerIdx = 0;
                if (st === 'APROBADO_FINANZAS') {
                    stBadge = 'bg-blue-950/40 text-blue-400 border border-blue-500';
                    trackerIdx = 1;
                } else if (st === 'EJECUTADO') {
                    stBadge = 'bg-emerald-950/40 text-emerald-400 border border-emerald-500';
                    trackerIdx = 2;
                } else if (st === 'RECHAZADO') {
                    stBadge = 'bg-rose-950/40 text-rose-400 border border-rose-500';
                    trackerIdx = 0;
                }

                return `
                <div class="terminal-border bg-slate-900/90 border border-mars-border/80 p-4 mb-4">
                    ${ui.renderWorkflowTracker(['1. I+D (Solicita)', '2. Finanzas (Audita)', '3. Logística (Ejecuta)'], trackerIdx)}
                    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-2 mb-3 gap-2">
                        <div>
                            <span class="text-xs font-black uppercase px-2 py-0.5 rounded ${stBadge}">${this.escapeHTML(st)}</span>
                            <h3 class="text-white font-orbitron font-bold uppercase text-xs sm:text-sm mt-1.5">Orden #${this.escapeHTML(order.id)}</h3>
                        </div>
                        <div class="text-left sm:text-right">
                            <span class="text-mars-green font-mono font-bold text-sm sm:text-base">${Number(order.total).toFixed(2)} €v</span>
                            <span class="block text-xs text-slate-400 font-mono">${this.escapeHTML(order.date || '--')}</span>
                        </div>
                    </div>

                    ${(order.driveUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(order.driveUrl))
                        ? `<div class="mb-3">
                            <a href="${encodeURI(order.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50 transition-colors font-mono">
                                <span>📄 Ver Justificación Técnica DOC_9 en Docs ↗</span>
                            </a>
                        </div>`
                        : ''
                    }

                    <div class="space-y-1.5 bg-black/60 p-2.5 border border-slate-800 rounded">
                        <p class="text-[10px] text-slate-400 font-bold uppercase mb-1">Partidas Solicitadas:</p>
                        ${(order.items || []).map(it => `
                            <div class="flex justify-between text-xs text-slate-300 gap-2">
                                <span class="break-words">${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                <span class="font-mono text-white shrink-0">${Number(it.price).toFixed(2)} €v</span>
                            </div>
                        `).join('')}
                    </div>

                    ${(st === 'EJECUTADO') ? `
                    <div class="mt-3 pt-2.5 border-t border-slate-800 bg-black/50 p-2.5 rounded text-xs space-y-1.5">
                        <div class="flex justify-between items-center text-[11px] font-bold text-mars-green uppercase">
                            <span>📦 Ejecución y Ensamble en Taller:</span>
                            <span class="font-mono ${state.user.admin ? 'text-white' : 'text-mars-green'}">${state.user.admin ? `Coste Real Total: ${(order.items || []).reduce((s, it) => s + (Number(it.realEur) || 0), 0).toFixed(2)} €` : 'COMPRA FÍSICA EJECUTADA'}</span>
                        </div>
                        <div class="space-y-1">
                            ${(order.items || []).map(it => `
                                <div class="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-300 gap-1 border-b border-slate-900 pb-1 last:border-0 font-mono">
                                    <span class="text-white">${this.escapeHTML(it.name)} (x${Number(it.qty) || 1})</span>
                                    <div class="flex items-center gap-2">
                                        ${state.user.admin ? `<span>Real: <strong class="text-mars-yellow">${it.realEur !== undefined ? Number(it.realEur).toFixed(2) : '--'} €</strong></span>` : ''}
                                        <span>Comercio: <strong class="text-slate-200">${this.escapeHTML(it.realShop || 'Comercio')}</strong></span>
                                        ${(state.user.admin && it.ticketUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(it.ticketUrl))
                                            ? `<a href="${encodeURI(it.ticketUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="text-mars-cyan hover:underline font-bold">[Ticket Drive ↗]</a>`
                                            : ''
                                        }
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>` : ''}
                </div>`;
            }).join('');

        const trackingSectionHtml = '';

        const myPendingCustom = (state.data.pendingCustom || []).filter(p => p && p.company === state.user.coId);
        const myHistoryCustom = Array.isArray(co.specialItemRequests) ? co.specialItemRequests : [];
        const allMyCustom = [...myPendingCustom.map(p => ({ ...p, status: 'PENDIENTE' })), ...myHistoryCustom];

        const specialItemsListHtml = allMyCustom.length === 0
            ? `<div class="p-5 bg-slate-900/50 border border-slate-800 text-center rounded"><span class="text-xs font-mono uppercase text-slate-400 italic">No hay solicitudes de material especial registradas. Si tu diseño requiere componentes fuera de catálogo, pulsa [+ Solicitar Material I+D a Coordinación].</span></div>`
            : `<div class="space-y-3">
                ${allMyCustom.map(item => {
                    let stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-amber-950/40 border border-amber-500 text-amber-400 animate-pulse">🟡 PENDIENTE CLAUSTRO</span>';
                    if (item.status === 'APROBADA') {
                        stBadge = `<span class="px-2 py-0.5 text-xs font-black uppercase bg-emerald-950/40 border border-emerald-500 text-emerald-400">🟢 APROBADA (${item.price !== undefined ? item.price + ' €v' : 'En Catálogo'})</span>`;
                    } else if (item.status === 'DENEGADA') {
                        stBadge = '<span class="px-2 py-0.5 text-xs font-black uppercase bg-red-950/40 border border-red-500 text-red-400">🔴 DENEGADA</span>';
                    }

                    return `
                    <div class="bg-slate-900 border border-slate-800 p-3.5 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="min-w-0 flex-grow">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                ${stBadge}
                                <span class="text-xs text-slate-400 font-mono">${this.escapeHTML(item.date || '--')}</span>
                            </div>
                            <h4 class="text-white font-bold text-xs sm:text-sm uppercase leading-snug">${this.escapeHTML(item.name || 'Componente Especial I+D')}</h4>
                            <div class="mt-2 flex flex-wrap items-center gap-2">
                                ${item.driveUrl ? `
                                    <a href="${encodeURI(item.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/50 transition-colors">
                                        <span>📄 Abrir Mi Solicitud en Docs ↗</span>
                                    </a>
                                ` : ''}
                                ${(item.status === 'DENEGADA' && item.responseDriveUrl) ? `
                                    <a href="${encodeURI(item.responseDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[36px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-950/50 text-red-200 border border-red-400 rounded font-mono hover:bg-red-900/60 transition-colors font-bold">
                                        <span>📄 Ver Dictamen / Respuesta de Coordinación ↗</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                    </div>`;
                }).join('')}
            </div>`;

        wrapper.innerHTML = `
        <div class="space-y-6">
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <!-- Columna Izquierda: Banco de Pruebas de Vuelo -->
                <div class="lg:col-span-7 space-y-6">
                    <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-yellow">
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                            <div>
                                <h2 class="font-orbitron text-mars-yellow text-base sm:text-lg uppercase tracking-tighter">Banco de Pruebas de Vuelo (Fase II)</h2>
                                <p class="text-[11px] text-mars-cyan font-mono">ℹ️ La Eficiencia (E = Altura / Coste) es calculada de forma matemática automática por la terminal al registrar el ensayo.</p>
                            </div>
                            <button type="button" onclick="ui.navigate('tech_workshop')" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap">
                                🔧 Ir a Taller y BOM ➔
                            </button>
                        </div>
                        <div class="bg-black border border-mars-border p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
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
                                <label for="ft-cost" class="text-xs text-slate-300 uppercase block mb-1">Coste Ensayo (€v)</label>
                                <input type="number" id="ft-cost" placeholder="Coste (€v)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-magenta w-full" step="0.1">
                            </div>
                            <div>
                                <label for="ft-height-mm" class="text-xs text-slate-300 uppercase block mb-1">Altura H (mm)</label>
                                <input type="number" id="ft-height-mm" placeholder="Altura H (mm)" class="min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-green font-bold w-full" step="1">
                            </div>
                            <div class="flex items-end">
                                <button type="button" onclick="ui.submitFlightTest()" class="min-h-[44px] bg-mars-yellow text-black font-black uppercase tracking-wider hover:bg-white transition-all py-2.5 px-3 w-full">Registrar Vuelo</button>
                            </div>
                        </div>
                        <div class="overflow-x-auto w-full max-h-60 overflow-y-auto">
                            <table class="w-full text-left text-xs whitespace-nowrap min-w-max">
                                <thead class="text-slate-300 uppercase border-b border-mars-border sticky top-0 bg-mars-card">
                                    <tr><th class="py-2 pr-3">Fecha</th><th class="pr-3">Fuselaje</th><th class="pr-3">Mix (Sól/Líq)</th><th class="pr-3">Coste (€v)</th><th class="pr-3">H (mm)</th><th class="text-mars-yellow">E = H/C</th></tr>
                                </thead>
                                <tbody>${ftHtml}</tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Columna Derecha: Acceso a Entregables Científicos y Órdenes -->
                <div class="lg:col-span-5 space-y-6">
                    <div class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-mars-cyan">
                        <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3 flex-wrap gap-2">
                            <h2 class="font-orbitron text-mars-cyan text-sm sm:text-base uppercase tracking-tighter">Entregables Científicos (FYQ & MAT)</h2>
                            <span class="text-xs bg-mars-cyan/10 text-mars-cyan border border-mars-cyan/40 px-2 py-0.5 font-bold uppercase">Resp: Dpto. Técnico</span>
                        </div>
                        <p class="text-xs text-slate-300 leading-relaxed mb-4">
                            Los 6 hitos científicos (Informes de Propulsión de Física y Química, Calibración del Goniómetro e Informes Trigonométricos de Matemáticas) se gestionan de forma guiada en <strong>Mis Entregables</strong>.
                        </p>
                        <div class="space-y-3 mb-4">
                            <div class="p-3 bg-black/60 border border-slate-800 rounded text-xs flex justify-between items-center">
                                <div>
                                    <span class="text-white font-bold block uppercase">Física y Química (25%)</span>
                                    <span class="text-[11px] text-slate-400">Informe Preliminar & Final Exhaustivo</span>
                                </div>
                                <span class="text-xs font-mono text-mars-cyan font-bold">2 Hitos</span>
                            </div>
                            <div class="p-3 bg-black/60 border border-slate-800 rounded text-xs flex justify-between items-center">
                                <div>
                                    <span class="text-white font-bold block uppercase">Matemáticas (5%)</span>
                                    <span class="text-[11px] text-slate-400">Goniómetro, Distancia Fija, 2 Puntos y Comparativo</span>
                                </div>
                                <span class="text-xs font-mono text-mars-yellow font-bold">4 Hitos</span>
                            </div>
                        </div>
                        <button type="button" onclick="ui.navigate('role_deliverables')" class="w-full min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs py-2.5 px-4 hover:bg-white transition-all flex items-center justify-center gap-2 shadow-sm">
                            <span>📤 GESTIONAR ENTREGABLES EN "MIS ENTREGABLES"</span> ➔
                        </button>
                    </div>

                    <!-- Acceso a Seguimiento de Órdenes -->
                    <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400">
                        <div class="flex justify-between items-center mb-2 border-b border-mars-border pb-2">
                            <h3 class="font-orbitron text-amber-400 text-xs sm:text-sm uppercase tracking-tight">Órdenes de Compra I+D</h3>
                            <span class="text-xs font-mono text-slate-400">${(co.orders || []).length} Órdenes</span>
                        </div>
                        <p class="text-xs text-slate-300 mb-3">Consulta el estado de tramitación financiera y logística de todas las solicitudes de materiales.</p>
                        <button type="button" onclick="ui.navigate('orders')" class="w-full min-h-[44px] bg-slate-900 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-black uppercase text-xs py-2 px-3 transition-all flex items-center justify-center gap-2">
                            <span>📡 VER SEGUIMIENTO DE ÓRDENES</span> ➔
                        </button>
                    </div>
                </div>
            </div>

            <!-- Panel de Solicitudes de Material I+D a Coordinación -->
            <div class="terminal-border bg-mars-card p-5 sm:p-6 border-t-4 border-t-mars-magenta shadow-sm">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-mars-border pb-3 mb-4">
                    <div>
                        <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 text-xs font-black uppercase bg-mars-magenta/20 border border-mars-magenta text-mars-magenta">I+D ESPECIAL // FUERA DE CATÁLOGO</span>
                            <span class="text-xs text-slate-400 font-mono">TÉCNICO ➔ COORDINACIÓN</span>
                        </div>
                        <h3 class="font-orbitron text-mars-magenta text-sm sm:text-base uppercase tracking-tight font-black">
                            📡 Solicitudes de Material I+D a Coordinación
                        </h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">
                            Solicita al claustro la autorización de piezas o reactivos especiales no listados en el catálogo mediante memoria técnica oficial en Google Drive.
                        </p>
                    </div>
                    <button type="button" onclick="ui.modalSpecialItem()" class="min-h-[44px] bg-mars-magenta text-white font-black px-4 py-2 text-xs uppercase hover:bg-white hover:text-mars-magenta transition-all whitespace-nowrap shadow-[0_0_10px_rgba(255,0,85,0.3)]">
                        + Solicitar Material I+D
                    </button>
                </div>
                ${specialItemsListHtml}
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
        
        const wrapper = document.createElement('div');

        let executedItems = [];
        co.orders.filter(o => o.status === 'EJECUTADO').forEach(o => {
            (o.items || []).forEach((item, idx) => {
                executedItems.push({ ...item, orderId: o.id, itemIdx: idx, itemKey: `${o.id}-${idx}` });
            });
        });

        let stockCount = 0;
        let bomCount = 0;
        let b2bCount = 0;
        executedItems.forEach(item => {
            const isSold = item.b2bStatus === 'VENDIDO';
            const isListed = item.b2bStatus === 'EN_VENTA';
            const isChecked = !isSold && !isListed && co.bom.includes(item.itemKey);
            if (!isSold && !isListed && !isChecked) stockCount++;
            if (isChecked) bomCount++;
            if (isListed) b2bCount++;
        });

        let bomTotal = 0;
        let bomHtml = '';

        if (executedItems.length === 0) {
            bomHtml = `<p class="text-slate-300 italic text-xs">No hay componentes adquiridos y ejecutados físicamente en inventario.</p>`;
        } else {
            bomHtml = executedItems.map(item => {
                const isSold = item.b2bStatus === 'VENDIDO';
                const isListed = item.b2bStatus === 'EN_VENTA';
                const isChecked = !isSold && !isListed && co.bom.includes(item.itemKey);
                const itemQty = Number(item.qty) || 1;
                const unitPrice = Number(item.price) || 0;
                const totalItemPrice = unitPrice * itemQty;
                
                if (isChecked) bomTotal += totalItemPrice;

                let statusAction = '';
                if (isSold) {
                    statusAction = `<span class="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 font-bold uppercase border border-slate-700">TRASPASADO B2B</span>`;
                } else if (isListed) {
                    statusAction = `<span class="text-xs bg-mars-yellow/20 text-mars-yellow px-2.5 py-1 font-bold uppercase border border-mars-yellow animate-pulse">EN OFERTA B2B</span>`;
                } else {
                    statusAction = `<button type="button" onclick="ui.modalSellB2B('${this.escapeHTML(item.orderId)}', ${Number(item.itemIdx)})" class="min-h-[44px] bg-mars-yellow/10 border border-mars-yellow text-mars-yellow px-3 py-1.5 text-xs font-bold uppercase hover:bg-mars-yellow hover:text-black transition-colors whitespace-nowrap" title="Poner en venta en el mercado secundario">[VENDER B2B]</button>`;
                }

                return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 p-2.5 border ${isSold ? 'border-slate-800 opacity-60' : (isListed ? 'border-mars-yellow/50' : 'border-mars-border')} text-xs mb-2 gap-2.5">
                    <label class="mars-checkbox-label flex items-center gap-2.5 text-white ${isSold || isListed ? 'cursor-not-allowed line-through text-slate-400' : 'cursor-pointer'} min-w-0 flex-1 min-h-[44px]">
                        <input type="checkbox" class="mars-touch-input" ${isChecked ? 'checked' : ''} ${isSold || isListed ? 'disabled' : ''} onchange="ui.toggleBomItem('${this.escapeHTML(item.itemKey)}', this.checked)">
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

        const totalDevCost = co.orders.filter(o => o.status === 'EJECUTADO').reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const grossCosts = state.getCompanyGrossOperatingCosts ? state.getCompanyGrossOperatingCosts(co) : 0;
        const sponsorAmt = state.getCompanySponsorAmount ? state.getCompanySponsorAmount(co) : 0;
        const opCosts = state.getCompanyOperatingCosts ? state.getCompanyOperatingCosts(co) : { gross: grossCosts, sponsorReduction: sponsorAmt, net: grossCosts };
        const netOpCosts = (opCosts && typeof opCosts.net === 'number') ? opCosts.net : ((typeof opCosts === 'number') ? opCosts : grossCosts);
        const sponsorTierLabel = co.sponsorAwarded ? (co.sponsorData?.tier || co.sponsorAwarded || 'SPONSOR') : null;

        const isHojaLocked = !state.user?.admin && this.isDeliverableLocked('hoja_taller_fyq', co);
        let hojaPanelHtml = '';

        if (isHojaLocked) {
            hojaPanelHtml = `
            <div id="tech-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-cyan-400">
                <h2 class="font-orbitron text-cyan-400 text-sm sm:text-base uppercase tracking-tighter mb-2">Hoja de Taller Oficial, BOM y Control de Calidad (FYQ)</h2>
                <div class="terminal-border border-dashed p-6 text-center text-slate-400 italic text-xs uppercase">
                    🔒 Hoja de Taller no habilitada en esta fase según el cronograma oficial.
                </div>
            </div>`;
        } else {
            const hojaFyq = co.deliverables?.hoja_taller_fyq;
            const hojaStatus = hojaFyq?.status || 'DRAFT_TECNICO';
            const hojaUrl = hojaFyq?.driveUrl || '';

            let trackerIdx = 0;
            if (hojaStatus === 'EN_TALLER_OPERARIO') trackerIdx = 1;
            else if (hojaStatus === 'SUBMITTED_TO_CEO') trackerIdx = 2;
            else if (hojaStatus === 'DELIVERED_TO_TEACHER') trackerIdx = 3;
            else trackerIdx = 0; // DRAFT_TECNICO, DEVUELTO_A_TECNICO, CEO_REVISION

            let hojaInnerHtml = '';
            if (!hojaFyq || hojaStatus === 'DRAFT_TECNICO') {
                hojaInnerHtml = `
                <div class="bg-slate-900 border border-cyan-500/50 p-4 space-y-3 rounded">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <span class="text-xs font-bold uppercase text-cyan-400">[FASE 1: ESPECIFICACIÓN Y BOM]</span>
                        <span class="text-xs font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">BORRADOR TÉCNICO</span>
                    </div>
                    <p class="text-xs text-slate-300">Genera el escandallo (BOM) en el panel de inventario, redacta la Hoja de Taller en Google Docs y envíala al Taller para montaje físico.</p>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_10_HOJA_TALLER')}
                    </div>
                    <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Enlace Drive Hoja de Taller (BOM & Control Físico)</label>
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" placeholder="https://docs.google.com/document/d/..." class="w-full bg-black border border-slate-700 p-2 text-xs text-white font-mono outline-none focus:border-mars-cyan min-h-[44px]">
                    <div class="flex justify-end pt-1">
                        <button type="button" onclick="ui.techSendHojaTaller()" class="min-h-[44px] bg-mars-cyan text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ 🚀 ENVIAR A TALLER ]</button>
                    </div>
                </div>`;
            } else if (hojaStatus === 'EN_TALLER_OPERARIO') {
                hojaInnerHtml = `
                <div class="bg-slate-900 border border-blue-500/50 p-4 space-y-3 rounded">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <span class="text-xs font-bold uppercase text-blue-400">[FASE 2: EN TALLER FÍSICO]</span>
                        <span class="text-xs font-mono font-bold text-blue-300 bg-blue-900/40 border border-blue-500 px-2 py-0.5 rounded">EN TALLER (OPERARIO)</span>
                    </div>
                    <p class="text-xs text-slate-300">La Hoja de Taller ha sido remitida a Operaciones. El Operario está ensamblando y verificando la tolerancia física.</p>
                    <div class="pt-1 flex gap-2 items-center flex-wrap">
                        <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono hover:bg-cyan-900/60 transition-colors"><span>Ver Documento Drive ↗</span></a>
                    </div>
                </div>`;
            } else if (hojaStatus === 'DEVUELTO_A_TECNICO') {
                hojaInnerHtml = `
                <div class="bg-slate-900 border border-amber-500 p-4 space-y-3 rounded">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <span class="text-xs font-bold uppercase text-amber-400">[FASE 3: SUBSANACIÓN TÉCNICA]</span>
                        <span class="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 border border-amber-500 px-2 py-0.5 rounded">⚠️ DEVUELTO POR INCIDENCIA EN TALLER</span>
                    </div>
                    <div class="bg-amber-950/40 border border-amber-500/50 p-2.5 my-1 text-xs text-amber-300 font-mono">
                        <strong>Motivo de Incidencia Tipificado:</strong> ${this.escapeHTML(hojaFyq.returnReason || hojaFyq.returnReasonId || 'Incidencia de taller')}
                    </div>
                    ${hojaFyq.returnDriveUrl ? `
                    <div class="my-2">
                        <a href="${encodeURI(hojaFyq.returnDriveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-2 px-3 py-2 text-xs bg-amber-950/60 text-amber-300 border border-amber-400 rounded hover:bg-amber-900/60 transition-colors font-bold uppercase">
                            <span>📄 Abrir Registro de Incidencias en Google Docs ↗</span>
                        </a>
                    </div>` : ''}
                    <p class="text-xs text-slate-300">Corrige las tolerancias o sustituye las piezas en el Google Doc y vuelve a remitir a taller.</p>
                    <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Actualizar Enlace Drive Hoja de Taller</label>
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" class="w-full bg-black border border-amber-500/60 p-2 text-xs text-white font-mono outline-none focus:border-amber-400 min-h-[44px]">
                    <div class="flex justify-end pt-1">
                        <button type="button" onclick="ui.techSendHojaTaller()" class="min-h-[44px] bg-amber-400 text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all">[ 🔄 REENVIAR A TALLER ]</button>
                    </div>
                </div>`;
            } else if (hojaStatus === 'SUBMITTED_TO_CEO') {
                hojaInnerHtml = `
                <div class="bg-slate-900 border border-purple-500/50 p-4 space-y-3 rounded">
                    <div class="flex justify-between items-center flex-wrap gap-2">
                        <span class="text-xs font-bold uppercase text-purple-400">[FASE 4: SUPERVISIÓN CEO]</span>
                        <span class="text-xs font-mono font-bold text-purple-300 bg-purple-900/40 border border-purple-500 px-2 py-0.5 rounded">VALIDADO EN TALLER // EN REVISIÓN CEO</span>
                    </div>
                    <p class="text-xs text-slate-300">Operaciones ha validado el montaje físico. La Hoja de Taller está pendiente del visado final del CEO hacia el profesor de FyQ.</p>
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
                    <p class="text-xs text-slate-300">Corrige las observaciones en el documento de Drive y vuelve a enviar a Taller/CEO.</p>
                    <label for="tech-hoja-taller-drive-url" class="text-xs text-mars-yellow font-bold uppercase block">Actualizar Enlace Drive Hoja de Taller</label>
                    <input type="url" id="tech-hoja-taller-drive-url" value="${this.escapeAttr(hojaUrl)}" class="w-full bg-black border border-mars-magenta/60 p-2 text-xs text-white font-mono outline-none focus:border-mars-magenta min-h-[44px]">
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
                    <p class="text-xs text-slate-300">El CEO ha visado y remitido la Hoja de Taller al profesor de Física y Química para su evaluación oficial (10%).</p>
                    <a href="${encodeURI(hojaUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded font-mono"><span>Abrir Documento Oficial Drive ↗</span></a>
                </div>`;
            }

            hojaPanelHtml = `
            <div id="tech-hoja-taller-panel" class="terminal-border bg-mars-card p-4 sm:p-6 border-t-4 border-t-cyan-400">
                <div class="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <div>
                        <h3 class="font-orbitron text-cyan-400 text-sm sm:text-base uppercase tracking-tighter">Hoja de Taller: BOM y Control de Ensamble (FYQ)</h3>
                        <p class="text-xs text-slate-300 uppercase mt-0.5">Control de calidad y seguimiento operativo en 4 fases: I+D ➔ Taller ➔ CEO ➔ Docente.</p>
                    </div>
                    <span class="text-xs font-mono font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/50 px-2.5 py-1 uppercase">Peso: 10% FYQ</span>
                </div>
                ${this.renderWorkflowTracker(['1. I+D (BOM)', '2. Taller (Montaje)', '3. CEO (Aval)', '4. Docente FyQ'], trackerIdx)}
                ${hojaInnerHtml}
            </div>`;
        }

        wrapper.innerHTML = `
        <div class="space-y-6">
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
                                <button type="button" onclick="ui.navigate('dossier')" class="min-h-[44px] bg-mars-cyan/10 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black px-3 py-2 text-xs font-bold uppercase transition-all whitespace-nowrap">[ 📄 Ver Dossier Inversores ↗ ]</button>
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
                                <span class="text-amber-400 uppercase font-bold">Reducción Patrocinio (${this.escapeHTML(sponsorTierLabel)}):</span>
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
        if (item.b2bStatus) return this.notify("Este componente ya está en proceso de venta o ha sido vendido.", "warning");
        const qty = Number(item.qty) || 1;
        const totalOrigCost = (Number(item.price) || 0) * qty;

        const html = `
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Vas a publicar <strong>${this.escapeHTML(item.name)} (x${qty})</strong> en el Mercado Secundario B2B. El coste original de adquisición del lote fue de <span class="text-mars-cyan font-bold">${totalOrigCost.toFixed(2)} €v</span>${qty > 1 ? ` (${Number(item.price).toFixed(2)} €v c/u)` : ''}.</p>
            <div class="space-y-3">
                <div>
                    <label for="b2b-sell-price" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Precio de Venta Solicitado Lote Completo (€v)</label>
                    <input type="number" id="b2b-sell-price" value="${totalOrigCost.toFixed(0)}" min="1" step="1" class="w-full min-h-[44px] bg-slate-900 border border-mars-yellow p-2.5 text-base sm:text-sm text-mars-green font-mono font-bold outline-none">
                </div>
                <div>
                    <label for="b2b-drive-url" class="text-xs text-mars-cyan uppercase font-bold block mb-1.5">Informe Técnico de Excedentes (Google Drive / Docs)</label>
                    <div class="mb-2">
                        ${this.renderDocTemplateBtn('DOC_7_B2B_DESINVERSION')}
                    </div>
                    <input type="url" id="b2b-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono" required>
                    <p class="text-[10px] text-slate-400 mt-1">Adjunta la memoria técnica en Google Drive justificando el excedente para autorización en Aduana Docente.</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.confirmSellB2B('${this.escapeHTML(orderId)}', ${Number(itemIdx)})" class="min-h-[44px] bg-mars-yellow text-black px-5 py-2.5 text-xs font-black uppercase hover:bg-white transition-all">Publicar en Mercado B2B</button>`;
        this.showModal("Poner Pieza en Venta (B2B)", html, actions);
    },

    confirmSellB2B(orderId, itemIdx) {
        if (!state.user || state.user.admin) return;
        const elPrice = document.getElementById('b2b-sell-price');
        const elDriveUrl = document.getElementById('b2b-drive-url');
        if (!elPrice) return;

        const price = parseFloat(elPrice.value);
        const driveUrl = elDriveUrl ? this.cleanInput(elDriveUrl.value) : '';

        if (isNaN(price) || price <= 0) return this.notify("Introduce un precio en €v válido mayor que cero.", "warning");
        if (!driveUrl) return this.notify("Debes indicar el enlace Drive del informe técnico de excedentes.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive / Docs.", "error");
        }

        const co = state.data.companies[state.user.coId];
        if (!co || !co.orders) return;

        const ord = co.orders.find(o => String(o.id) === String(orderId));
        if (!ord || !ord.items || !ord.items[itemIdx]) return;

        const item = ord.items[itemIdx];
        const itemKey = `${orderId}-${itemIdx}`;

        co.bom = (co.bom || []).filter(k => k !== itemKey);
        item.b2bStatus = 'EN_VENTA';

        state.data.b2bMarket = state.data.b2bMarket || [];
        state.data.b2bMarket.unshift({
            id: 'LST-' + Date.now(),
            sellerCoId: state.user.coId,
            sellerName: co.name,
            itemName: item.name,
            category: item.category || 'Componente',
            qty: item.qty || 1,
            price: price,
            driveUrl: driveUrl,
            obs: 'Informe técnico de excedentes: ' + driveUrl,
            notes: 'Informe técnico de excedentes: ' + driveUrl,
            status: 'EN_VENTA',
            sourceOrderKey: itemKey,
            date: new Date().toLocaleDateString()
        });

        telemetry.log("OFERTA B2B", `Publicado en B2B: ${item.name} por ${price}€v`);
        co.updatedAt = Date.now();
        state.save(state.user.coId);
        this.closeModal();
        this.notify(`✅ Componente "${item.name}" publicado en el Mercado B2B por ${price.toFixed(2)} €v.`, "success");
        this.render();
    },

    submitFlightTest() {
        if (!state.user) return;
        const elBottle = document.getElementById('ft-bottle');
        const elNahco3 = document.getElementById('ft-nahco3');
        const elVinegar = document.getElementById('ft-vinegar');
        const elCost = document.getElementById('ft-cost');
        const elHeightMm = document.getElementById('ft-height-mm');
        
        if (!elBottle || !elNahco3 || !elVinegar || !elCost || !elHeightMm) return; 

        const bottle = this.cleanInput(elBottle.value);
        const rawNahco3 = String(elNahco3.value || '').trim();
        const rawVinegar = String(elVinegar.value || '').trim();

        // Controlar que las entradas de masa (NaHCO3) y volumen (CH3COOH) rechacen números negativos o cadenas con caracteres alfanuméricos no numéricos
        const strictNumPattern = /^[0-9]+(\.[0-9]+)?$/;
        if (!strictNumPattern.test(rawNahco3)) {
            return this.notify("La masa de NaHCO3 debe ser un valor numérico estrictamente positivo sin caracteres alfanuméricos.", "error");
        }
        if (!strictNumPattern.test(rawVinegar)) {
            return this.notify("El volumen de vinagre (CH3COOH) debe ser un valor numérico estrictamente positivo sin caracteres alfanuméricos.", "error");
        }

        const naHCO3 = parseFloat(rawNahco3);
        const vinegar = parseFloat(rawVinegar);
        const costEurV = parseFloat(elCost.value);
        const heightMm = parseFloat(elHeightMm.value); // <--- v1.0.16: Se registra en milímetros

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightMm)) return this.notify("Rellene todos los datos numéricos del ensayo.", "warning");
        if(naHCO3 <= 0 || vinegar <= 0) return this.notify("La masa y el volumen de reactivos deben ser mayores a cero.", "warning");
        if(this.hasForbiddenWords(bottle, 'Banco de Pruebas (Fuselaje)', elBottle)) return;
        if(costEurV <= 0) return this.notify("El coste no puede ser cero.", "warning");
        if(heightMm < 0) return this.notify("La altura no puede ser un número negativo.", "warning");

        // Eficiencia: Milímetros por cada € virtual gastado
        const efficiency = heightMm / costEurV;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.flightTests = co.flightTests || [];
        co.flightTests.unshift({ id: 'FLT-'+Date.now(), date: new Date().toLocaleDateString(), bottle, naHCO3, vinegar, costEurV, heightMm, efficiency });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightMm}mm, E=${efficiency.toFixed(2)}`);
        state.save();
        this.notify("✅ Ensayo de vuelo registrado en el banco de pruebas.", "success");
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
                    <input type="url" id="special-item-drive-url" placeholder="https://docs.google.com/... o https://drive.google.com/..." required class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan p-2.5 text-base sm:text-xs text-white font-mono outline-none focus:border-mars-yellow">
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">
                        Configura los permisos del documento en Google Drive como <em>"Cualquiera con el enlace puede ver"</em> para que el claustro docente examine los planos y especificaciones.
                    </p>
                </div>
                <div class="pt-1">
                    <a href="https://docs.google.com/document/d/1HigoiUvPfZQhMu67MR7cGyiW8XecIQlAW_29kp3LfDc/copy" target="_blank" rel="noopener noreferrer" class="min-h-[44px] w-full inline-flex items-center justify-center gap-2 bg-blue-950/60 border border-blue-400 text-cyan-200 hover:bg-blue-900/80 hover:text-white px-4 py-2 text-xs font-bold uppercase transition-all shadow-sm">
                        <span>📋 Clonar Modelo Oficial de Solicitud I+D (DOC_13) en Drive ↗</span>
                    </a>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitSpecialItem()" class="min-h-[44px] bg-mars-magenta text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors tracking-wider">Enviar a Claustro</button>`;
        this.showModal("Solicitar Ítem Especial / Fuera de Mercado", html, actions);
    },

    submitSpecialItem() {
        if (!state.user) return;
        const elUrl = document.getElementById('special-item-drive-url');
        if (!elUrl) return; 
        
        const driveUrl = this.cleanInput(elUrl.value);
        if (!driveUrl) return this.notify("Debes incluir el enlace a la memoria técnica en Google Drive o Google Docs.", "warning");
        if (typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(driveUrl)) {
            return this.notify("El enlace debe ser una URL válida de Google Drive o Google Docs.", "error");
        }
        
        const coId = state.user.coId;
        const coName = state.data.companies?.[coId]?.name || 'STARTUP';
        const defaultName = `Componente Especial I+D (${coName})`;
        
        state.data.pendingCustom = state.data.pendingCustom || [];
        state.data.pendingCustom.push({ 
            id: Date.now(), 
            company: coId, 
            name: defaultName, 
            driveUrl: driveUrl, 
            date: new Date().toLocaleDateString() 
        });
        state.save();
        this.closeModal();
        this.notify("✅ Solicitud de ítem especial enviada al claustro mediante enlace Drive.", "success");
    },

    modalCustom() {
        return this.modalSpecialItem();
    },

    submitCustom() {
        return this.submitSpecialItem();
    }
});