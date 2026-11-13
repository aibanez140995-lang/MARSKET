// js/ui-docente-contest.js
// --- MÓDULO FASE V: CONCURSO FINAL (19/05/2027), FINALISTAS A-F, MARCADOR EN DIRECTO, PODIO Y 6 GALARDONES ---

Object.assign(ui, {
    contestProjectorTab: 'launches',
    _lastContestDocHtml: '',

    isCoordinatorUser() {
        const u = state.user;
        return Boolean(u && u.admin && (u.role === 'COORDINADOR' || (typeof u.role === 'string' && u.role.startsWith('COORD'))));
    },

    getContestClasses() {
        return typeof CONTEST_CLASSES !== 'undefined' ? CONTEST_CLASSES : ['A', 'B', 'C', 'D', 'E', 'F'];
    },

    getContestAwardsDef() {
        if (typeof CONTEST_AWARDS_DEF !== 'undefined') return CONTEST_AWARDS_DEF;
        return {
            GOLD: {
                id: 'GOLD',
                podiumKey: 'first',
                title: 'Trofeo «MarsKet Gold»',
                subtitle: 'Campeón Absoluto del Concurso Final',
                roleLabel: 'CAMPEÓN ABSOLUTO',
                emoji: '🏆',
                colorHex: '#FFD700'
            },
            ROLE_AWARDS: [
                { id: 'CEO', title: 'Premio a la Excelencia en Dirección General', shortTitle: 'Excelencia en Dirección General', roleLabel: 'CEO', emoji: '🎖️', colorHex: '#00F0FF' },
                { id: 'TECNICO', title: 'Premio a la Innovación Técnica', shortTitle: 'Innovación Técnica', roleLabel: 'Técnico', emoji: '🚀', colorHex: '#38BDF8' },
                { id: 'FINANZAS', title: 'Premio a la Excelencia Financiera y Control de Costes', shortTitle: 'Excelencia Financiera y Control de Costes', roleLabel: 'Finanzas', emoji: '💰', colorHex: '#00FF66' },
                { id: 'MARKETING', title: 'Premio a la Mejor Estrategia de Marketing', shortTitle: 'Mejor Estrategia de Marketing', roleLabel: 'Marketing', emoji: '🎨', colorHex: '#FF0055' },
                { id: 'OPERACIONES', title: 'Premio a la Excelencia Operativa y Ética en IA', shortTitle: 'Excelencia Operativa y Ética en IA', roleLabel: 'Operaciones', emoji: '⚙️', colorHex: '#FFB703' }
            ]
        };
    },

    getContestState() {
        const companies = state.data?.companies || {};
        const deleted = state.data?.deletedCompanyIds || [];
        if (typeof state.normalizeFinalContest === 'function') {
            return state.normalizeFinalContest(state.data?.finalContest, companies, deleted);
        }
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

    persistContestState(fc) {
        const now = Date.now();
        const companies = state.data?.companies || {};
        const deleted = state.data?.deletedCompanyIds || [];
        const normalized = typeof state.normalizeFinalContest === 'function'
            ? state.normalizeFinalContest(fc, companies, deleted)
            : fc;
        normalized.updatedAt = now;
        state.data.finalContest = normalized;
        if (!state.data.config) state.data.config = {};
        state.data.config.updatedAt = now;
        state.save();
        return normalized;
    },

    getCompanyActaSummary(co) {
        if (!co) return { nota: null, evalPct: 0, bestE: null, balance: 0 };
        const weights = typeof GLOBAL_WEIGHTS !== 'undefined'
            ? GLOBAL_WEIGHTS
            : { FYQ: 0.25, LYE: 0.40, LEN: 0.15, ECO: 0.10, MAT: 0.05, ING: 0.05 };
        const g = co.grades || {};
        let weightedTotal = 0;
        let evaluatedWeight = 0;
        Object.keys(weights).forEach(s => {
            if (g[s] && g[s].final !== null && g[s].final !== undefined && isFinite(Number(g[s].final))) {
                weightedTotal += Number(g[s].final) * weights[s];
                evaluatedWeight += weights[s];
            }
        });

        let bestE = null;
        if (Array.isArray(co.flightTests)) {
            co.flightTests.forEach(ft => {
                const eVal = Number(ft?.efficiency);
                if (ft && ft.efficiency !== null && ft.efficiency !== undefined && isFinite(eVal) && eVal > 0) {
                    if (bestE === null || eVal > bestE) bestE = eVal;
                }
            });
        }

        return {
            nota: evaluatedWeight > 0 ? Math.round((weightedTotal + Number.EPSILON) * 100) / 100 : null,
            evalPct: Math.round(evaluatedWeight * 100),
            bestE: bestE !== null ? Math.round((bestE + Number.EPSILON) * 10000) / 10000 : null,
            balance: Number(co.balance) || 0
        };
    },

    getContestActiveFinalistsList(fc) {
        const contest = fc || this.getContestState();
        const companies = state.data?.companies || {};
        const list = [];
        this.getContestClasses().forEach(cls => {
            const cid = contest.finalists?.[cls];
            const co = cid ? companies[cid] : null;
            if (co && (co.classGroup || 'A').toUpperCase() === cls) {
                const launch = contest.launches?.[cid] || null;
                const acta = this.getCompanyActaSummary(co);
                list.push({ cls, cid, co, launch, acta });
            }
        });
        return list;
    },

    getContestRankedLaunches(fc) {
        const finalists = this.getContestActiveFinalistsList(fc);
        return finalists.slice().sort((a, b) => {
            const eA = (a.launch && a.launch.efficiency !== null && a.launch.efficiency !== undefined) ? Number(a.launch.efficiency) : -1;
            const eB = (b.launch && b.launch.efficiency !== null && b.launch.efficiency !== undefined) ? Number(b.launch.efficiency) : -1;
            if (eB !== eA) return eB - eA;
            const hA = (a.launch && a.launch.heightMm !== null && a.launch.heightMm !== undefined) ? Number(a.launch.heightMm) : -1;
            const hB = (b.launch && b.launch.heightMm !== null && b.launch.heightMm !== undefined) ? Number(b.launch.heightMm) : -1;
            if (hB !== hA) return hB - hA;
            const cA = (a.launch && a.launch.costEurV > 0) ? Number(a.launch.costEurV) : Number.MAX_SAFE_INTEGER;
            const cB = (b.launch && b.launch.costEurV > 0) ? Number(b.launch.costEurV) : Number.MAX_SAFE_INTEGER;
            if (cA !== cB) return cA - cB;
            const nA = a.acta.nota !== null ? a.acta.nota : -1;
            const nB = b.acta.nota !== null ? b.acta.nota : -1;
            if (nB !== nA) return nB - nA;
            return a.cls.localeCompare(b.cls);
        });
    },

    getCompanyContestAwards(cid, includeDraft = false) {
        if (!cid) return [];
        const fc = this.getContestState();
        if (!includeDraft && !fc.published) return [];
        const awardsDef = this.getContestAwardsDef();
        const awards = [];
        if (fc.podium?.first === cid) {
            awards.push({
                type: 'GOLD',
                rank: 1,
                roleKey: null,
                title: awardsDef.GOLD.title,
                subtitle: awardsDef.GOLD.subtitle,
                emoji: awardsDef.GOLD.emoji,
                colorHex: awardsDef.GOLD.colorHex
            });
        } else if (fc.podium?.second === cid) {
            awards.push({
                type: 'PODIUM',
                rank: 2,
                roleKey: null,
                title: '2º Puesto Absoluto (Plata)',
                subtitle: 'Podio Concurso Final Fase V',
                emoji: '🥈',
                colorHex: '#E2E8F0'
            });
        } else if (fc.podium?.third === cid) {
            awards.push({
                type: 'PODIUM',
                rank: 3,
                roleKey: null,
                title: '3º Puesto Absoluto (Bronce)',
                subtitle: 'Podio Concurso Final Fase V',
                emoji: '🥉',
                colorHex: '#CD7F32'
            });
        }
        awardsDef.ROLE_AWARDS.forEach(item => {
            if (fc.roleAwards?.[item.id] === cid) {
                awards.push({
                    type: 'ROLE',
                    rank: null,
                    roleKey: item.id,
                    title: item.title,
                    subtitle: `Distinción Especial (${item.roleLabel})`,
                    emoji: item.emoji,
                    colorHex: item.colorHex
                });
            }
        });
        return awards;
    },

    openPhaseVNews() {
        this.newsPhaseFilter = 'V';
        this.newsClassFilter = 'ALL';
        this.navigate('news');
    },

    setContestFinalist(cls, cid) {
        if (!this.checkCoordinatorAccess()) return false;
        const allowedClasses = this.getContestClasses();
        const targetCls = String(cls || '').toUpperCase();
        if (!allowedClasses.includes(targetCls)) {
            this.notify("Clase no válida para el Concurso Final.", "error");
            return false;
        }
        const companies = state.data?.companies || {};
        const cleanCid = String(cid || '').trim() || null;
        if (cleanCid) {
            const co = companies[cleanCid];
            if (!co) {
                this.notify("La empresa seleccionada no existe.", "error");
                return false;
            }
            if ((co.classGroup || 'A').toUpperCase() !== targetCls) {
                this.notify(`La startup "${co.name}" no pertenece a la Clase ${targetCls}.`, "error");
                return false;
            }
        }

        const fc = this.getContestState();
        fc.finalists[targetCls] = cleanCid;
        this.persistContestState(fc);
        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log('FASE5_FINALISTA', `Clase ${targetCls}: ${cleanCid ? (companies[cleanCid]?.name || cleanCid) : 'Sin asignar'}`);
        }
        this.notify(
            cleanCid
                ? `✅ ${companies[cleanCid]?.name || cleanCid} designada como Finalista oficial de Clase ${targetCls}.`
                : `Finalista de Clase ${targetCls} retirada.`,
            cleanCid ? "success" : "info"
        );
        this.render();
        return true;
    },

    previewContestEfficiency(cid) {
        const hEl = document.getElementById(`contest-height-${cid}`);
        const cEl = document.getElementById(`contest-cost-${cid}`);
        const eEl = document.getElementById(`contest-eff-${cid}`);
        if (!hEl || !cEl || !eEl) return;
        const h = parseFloat(hEl.value);
        const c = parseFloat(cEl.value);
        if (isFinite(h) && h >= 0 && isFinite(c) && c > 0) {
            const eff = Math.round(((h / c) + Number.EPSILON) * 10000) / 10000;
            eEl.textContent = eff.toFixed(4);
            eEl.className = 'text-base font-orbitron font-black text-mars-green tabular-nums';
        } else {
            eEl.textContent = '--';
            eEl.className = 'text-base font-orbitron font-black text-slate-400 tabular-nums';
        }
    },

    _readLaunchInputsForCompany(cid, companies) {
        const co = companies[cid];
        const hEl = document.getElementById(`contest-height-${cid}`);
        const cEl = document.getElementById(`contest-cost-${cid}`);
        const vEl = document.getElementById(`contest-video-${cid}`);
        if (!hEl || !cEl) return { empty: true };

        const hRaw = String(hEl.value || '').trim();
        const cRaw = String(cEl.value || '').trim();
        const vRaw = vEl ? String(vEl.value || '').trim() : '';

        if (hRaw === '' && cRaw === '' && vRaw === '') {
            return { empty: true };
        }

        const heightMm = Number(hRaw);
        const costEurV = Number(cRaw);
        if (hRaw === '' || !isFinite(heightMm) || heightMm < 0) {
            return { error: `Altura inválida en ${co?.name || cid}. Introduce un valor numérico en mm >= 0.` };
        }
        if (cRaw === '' || !isFinite(costEurV) || costEurV <= 0) {
            return { error: `Coste inválido en ${co?.name || cid}. El coste del cohete en €v debe ser mayor que 0.` };
        }
        if (vRaw !== '') {
            const driveRe = typeof GOOGLE_DRIVE_REGEX !== 'undefined'
                ? GOOGLE_DRIVE_REGEX
                : /^https:\/\/(docs|drive)\.google\.com\//;
            if (!driveRe.test(vRaw)) {
                return { error: `El enlace de vídeo de ${co?.name || cid} debe ser una URL válida de Google Drive o Google Docs.` };
            }
        }

        const efficiency = Math.round(((heightMm / costEurV) + Number.EPSILON) * 10000) / 10000;
        return {
            empty: false,
            launch: {
                heightMm,
                costEurV,
                efficiency,
                videoUrl: vRaw,
                recordedAt: Date.now()
            }
        };
    },

    saveContestLaunch(cid) {
        if (!this.checkCoordinatorAccess()) return false;
        const fc = this.getContestState();
        const activeIds = new Set(Object.values(fc.finalists || {}).filter(Boolean));
        if (!activeIds.has(cid)) {
            this.notify("Solo las empresas finalistas (A–F) pueden registrar vuelo en Fase V.", "error");
            return false;
        }
        const companies = state.data?.companies || {};
        const parsed = this._readLaunchInputsForCompany(cid, companies);
        if (parsed.empty) {
            this.notify("Introduce Altura (mm) y Coste (€v) antes de guardar el lanzamiento.", "warning");
            return false;
        }
        if (parsed.error) {
            this.notify(parsed.error, "error");
            return false;
        }

        fc.launches[cid] = parsed.launch;
        this.persistContestState(fc);
        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log('FASE5_VUELO', `${companies[cid]?.name || cid}: H=${parsed.launch.heightMm}mm, C=${parsed.launch.costEurV}€v, E=${parsed.launch.efficiency}`);
        }
        this.notify(`🚀 Lanzamiento de ${companies[cid]?.name || cid} guardado (E = ${parsed.launch.efficiency.toFixed(4)} mm/€v).`, "success");
        this.render();
        return true;
    },

    saveAllContestLaunches() {
        if (!this.checkCoordinatorAccess()) return false;
        const fc = this.getContestState();
        const companies = state.data?.companies || {};
        const finalists = this.getContestActiveFinalistsList(fc);
        if (finalists.length === 0) {
            this.notify("Designa al menos una empresa finalista antes de guardar lanzamientos.", "warning");
            return false;
        }

        const updates = {};
        for (const f of finalists) {
            const parsed = this._readLaunchInputsForCompany(f.cid, companies);
            if (parsed.error) {
                this.notify(parsed.error, "error");
                return false;
            }
            if (!parsed.empty) {
                updates[f.cid] = parsed.launch;
            }
        }

        const count = Object.keys(updates).length;
        if (count === 0) {
            this.notify("No hay lanzamientos con datos para guardar.", "info");
            return false;
        }

        Object.assign(fc.launches, updates);
        this.persistContestState(fc);
        this.notify(`🚀 ${count} lanzamiento(s) oficiales guardados y calculados.`, "success");
        this.render();
        return true;
    },

    clearContestLaunch(cid) {
        if (!this.checkCoordinatorAccess()) return;
        const co = state.data?.companies?.[cid];
        this.confirmAction(
            "Borrar Lanzamiento de Fase V",
            `¿Deseas eliminar los datos de vuelo en directo registrados para ${co ? co.name : cid}?`,
            () => {
                const fc = this.getContestState();
                delete fc.launches[cid];
                this.persistContestState(fc);
                this.notify("Registro de lanzamiento eliminado del marcador.", "info");
                this.render();
            },
            "Borrar Vuelo",
            true
        );
    },

    suggestContestPodiumFromE() {
        if (!this.checkCoordinatorAccess()) return false;
        const fc = this.getContestState();
        const rankedWithE = this.getContestRankedLaunches(fc).filter(
            item => item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined
        );
        if (rankedWithE.length === 0) {
            this.notify("Registra primero al menos un lanzamiento oficial con Altura y Coste para sugerir el podio por E.", "warning");
            return false;
        }

        const awardsDef = this.getContestAwardsDef();
        awardsDef.ROLE_AWARDS.forEach(a => {
            const sel = document.getElementById(`contest-award-${a.id}`);
            if (sel) fc.roleAwards[a.id] = sel.value || null;
        });

        fc.podium = {
            first: rankedWithE[0]?.cid || null,
            second: rankedWithE[1]?.cid || null,
            third: rankedWithE[2]?.cid || null
        };
        this.persistContestState(fc);
        this.notify("⚡ Podio ordenado automáticamente según la mayor eficiencia E en directo. Recuerda revisar y publicar cuando corresponda.", "success");
        this.render();
        return true;
    },

    saveContestPodiumAndAwards() {
        if (!this.checkCoordinatorAccess()) return false;
        const fc = this.getContestState();
        const activeIds = new Set(Object.values(fc.finalists || {}).filter(Boolean));
        const awardsDef = this.getContestAwardsDef();

        const firstEl = document.getElementById('contest-podium-first');
        const secondEl = document.getElementById('contest-podium-second');
        const thirdEl = document.getElementById('contest-podium-third');
        const nextPodium = {
            first: firstEl ? (firstEl.value || null) : (fc.podium?.first || null),
            second: secondEl ? (secondEl.value || null) : (fc.podium?.second || null),
            third: thirdEl ? (thirdEl.value || null) : (fc.podium?.third || null)
        };

        const chosenPodium = [nextPodium.first, nextPodium.second, nextPodium.third].filter(Boolean);
        if (new Set(chosenPodium).size !== chosenPodium.length) {
            this.notify("⚠️ Una misma empresa no puede ocupar dos posiciones distintas del podio (1º, 2º o 3º).", "error");
            return false;
        }
        for (const pid of chosenPodium) {
            if (!activeIds.has(pid)) {
                this.notify("⚠️ Solo las 6 empresas finalistas (A–F) pueden entrar en el podio.", "error");
                return false;
            }
        }

        const nextAwards = {};
        for (const item of awardsDef.ROLE_AWARDS) {
            const sel = document.getElementById(`contest-award-${item.id}`);
            const val = sel ? (sel.value || null) : (fc.roleAwards?.[item.id] || null);
            if (val && !activeIds.has(val)) {
                this.notify(`⚠️ El premio "${item.title}" solo puede otorgarse a una de las empresas finalistas.`, "error");
                return false;
            }
            nextAwards[item.id] = val;
        }

        fc.podium = nextPodium;
        fc.roleAwards = nextAwards;
        this.persistContestState(fc);
        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log('FASE5_PREMIOS', `Podio y 6 galardones guardados (Publicado: ${fc.published ? 'Sí' : 'Borrador'})`);
        }
        this.notify("🏆 Podio y los 6 galardones oficiales guardados correctamente.", "success");
        this.render();
        return true;
    },

    setContestPublished(targetState) {
        if (!this.checkCoordinatorAccess()) return false;
        const fc = this.getContestState();
        const nextPub = Boolean(targetState);
        if (nextPub && !fc.podium?.first) {
            this.notify("⚠️ Selecciona y guarda al menos el Campeón Absoluto (Trofeo «MarsKet Gold») antes de publicar los resultados.", "warning");
            return false;
        }
        fc.published = nextPub;
        fc.publishedAt = nextPub ? Date.now() : 0;
        this.persistContestState(fc);
        if (typeof telemetry !== 'undefined' && telemetry.log) {
            telemetry.log('FASE5_PUBLICACION', nextPub ? 'Resultados Fase V PUBLICADOS oficialmente' : 'Fase V devuelta a Modo Borrador Privado');
        }
        this.notify(
            nextPub
                ? "🎉 ¡Resultados oficiales del Concurso Final PUBLICADOS! Ya son visibles para todo el alumnado y el claustro."
                : "🟡 Fase V devuelta a Modo Borrador de Gala. Marcador y premios ocultados nuevamente al alumnado.",
            nextPub ? "success" : "info"
        );
        this.render();
        return true;
    },

    confirmToggleContestPublished(targetState) {
        if (!this.checkCoordinatorAccess()) return;
        const nextPub = Boolean(targetState);
        if (nextPub) {
            const fc = this.getContestState();
            if (!fc.podium?.first) {
                this.notify("⚠️ Selecciona y guarda al menos el Campeón Absoluto (Trofeo «MarsKet Gold») antes de publicar los resultados.", "warning");
                return;
            }
            this.confirmAction(
                "Publicar Veredicto Oficial del Concurso Final",
                "Al publicar, el marcador en directo (Altura, Coste, E), los vídeos, el Podio y los 6 Galardones pasarán a ser visibles para todas las clases en el Tablón de Noticias y en Sala de Mando. ¿Deseas publicar el veredicto ahora?",
                () => this.setContestPublished(true),
                "🟢 Publicar Veredicto Oficial",
                false
            );
        } else {
            this.confirmAction(
                "Volver a Modo Borrador de Gala",
                "El marcador en directo (alturas, E), el podio y los premios dejarán de mostrarse al alumnado, manteniéndose visibles únicamente las empresas finalistas confirmadas. ¿Confirmar?",
                () => this.setContestPublished(false),
                "🟡 Ocultar Resultados al Alumnado",
                false
            );
        }
    },

    openContestProjectorModal(tab = 'launches') {
        if (!this.isCoordinatorUser()) return;
        this.contestProjectorTab = tab || 'launches';
        const fc = this.getContestState();
        const finalists = this.getContestActiveFinalistsList(fc);
        const ranked = this.getContestRankedLaunches(fc);
        const companies = state.data?.companies || {};
        const awardsDef = this.getContestAwardsDef();

        const tabBtn = (key, label) => {
            const active = this.contestProjectorTab === key;
            return `<button type="button" onclick="ui.openContestProjectorModal('${key}')" class="min-h-[44px] px-4 py-2 text-xs sm:text-sm font-orbitron font-black uppercase border transition-all ${active ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'}">${label}</button>`;
        };

        const draftWarning = !fc.published
            ? `<div class="bg-amber-400/15 border border-amber-400 p-3 text-xs text-amber-300 font-bold uppercase flex items-center justify-between gap-2 flex-wrap">
                    <span>🔒 MODO BORRADOR PRIVADO DE GALA: visible únicamente en esta pantalla docente/proyector; oculto para el alumnado.</span>
               </div>`
            : `<div class="bg-mars-green/15 border border-mars-green p-3 text-xs text-mars-green font-bold uppercase">
                    <span>🟢 VEREDICTO OFICIAL PROCLAMADO AL CENTRO (19/05/2027)</span>
               </div>`;

        let bodyContent = '';
        if (this.contestProjectorTab === 'finalists') {
            bodyContent = `
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    ${this.getContestClasses().map(cls => {
                        const cid = fc.finalists?.[cls];
                        const co = cid ? companies[cid] : null;
                        return `
                        <div class="border-2 ${co ? 'border-mars-cyan bg-slate-950' : 'border-slate-800 border-dashed bg-slate-950/50'} p-5 rounded">
                            <span class="text-xs font-mono uppercase tracking-widest ${co ? 'text-mars-cyan' : 'text-slate-400'} font-black block mb-1">REPRESENTANTE CLASE ${cls}</span>
                            <h3 class="text-lg sm:text-xl font-orbitron font-black ${co ? 'text-white' : 'text-slate-500'} uppercase leading-tight">
                                ${co ? this.escapeHTML(co.name) : 'Sin designar'}
                            </h3>
                            ${co && co.slogan ? `<p class="text-xs text-mars-yellow mt-2 italic">«${this.escapeHTML(co.slogan)}»</p>` : ''}
                        </div>`;
                    }).join('')}
                </div>`;
        } else if (this.contestProjectorTab === 'podium') {
            const p1 = fc.podium?.first ? companies[fc.podium.first] : null;
            const p2 = fc.podium?.second ? companies[fc.podium.second] : null;
            const p3 = fc.podium?.third ? companies[fc.podium.third] : null;
            const l1 = p1 ? fc.launches?.[p1.id] : null;
            const l2 = p2 ? fc.launches?.[p2.id] : null;
            const l3 = p3 ? fc.launches?.[p3.id] : null;

            const podiumCard = (rankLabel, co, launch, hex) => `
                <div class="bg-slate-950 p-5 border-2 rounded text-center" style="border-color: ${hex};">
                    <span class="text-xs font-black uppercase tracking-widest block mb-2" style="color: ${hex};">${rankLabel}</span>
                    <div class="text-xl sm:text-2xl font-orbitron font-black text-white uppercase break-words">
                        ${co ? this.escapeHTML(co.name) : 'Pendiente'}
                    </div>
                    ${co ? `<span class="text-xs font-mono text-slate-300 block mt-1">Clase ${this.escapeHTML(co.classGroup || 'A')}</span>` : ''}
                    ${launch && launch.efficiency !== null && launch.efficiency !== undefined
                        ? `<div class="mt-3 pt-2 border-t border-slate-800 font-mono text-sm font-black tabular-nums" style="color: ${hex};">E = ${Number(launch.efficiency).toFixed(4)} mm/€v</div>`
                        : ''}
                </div>`;

            bodyContent = `
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    ${podiumCard('🏆 1º TROFEO «MARSKET GOLD»', p1, l1, '#FFD700')}
                    ${podiumCard('🥈 2º PUESTO ABSOLUTO', p2, l2, '#E2E8F0')}
                    ${podiumCard('🥉 3º PUESTO ABSOLUTO', p3, l3, '#CD7F32')}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">
                    ${awardsDef.ROLE_AWARDS.map(item => {
                        const wCid = fc.roleAwards?.[item.id];
                        const wCo = wCid ? companies[wCid] : null;
                        return `
                        <div class="bg-slate-950 border border-slate-700 p-4 rounded" style="border-left: 4px solid ${item.colorHex};">
                            <span class="text-xs font-mono font-bold uppercase block mb-1" style="color: ${item.colorHex};">${item.emoji} ${this.escapeHTML(item.roleLabel)}</span>
                            <div class="text-xs text-slate-300 font-bold uppercase mb-2">${this.escapeHTML(item.title)}</div>
                            <div class="text-base font-orbitron font-black ${wCo ? 'text-white' : 'text-slate-500'} uppercase">
                                ${wCo ? `${this.escapeHTML(wCo.name)} (Clase ${this.escapeHTML(wCo.classGroup || 'A')})` : 'Pendiente de asignación'}
                            </div>
                        </div>`;
                    }).join('')}
                </div>`;
        } else {
            bodyContent = `
                <div class="overflow-x-auto border border-slate-700 rounded mt-4">
                    <table class="w-full text-left border-collapse text-sm">
                        <thead class="bg-black text-slate-300 font-mono text-xs uppercase border-b border-slate-700">
                            <tr>
                                <th class="p-3">#</th>
                                <th class="p-3">Clase</th>
                                <th class="p-3">Startup Finalista</th>
                                <th class="p-3 text-right">Altura (mm)</th>
                                <th class="p-3 text-right">Coste (€v)</th>
                                <th class="p-3 text-right">Eficiencia E</th>
                                <th class="p-3 text-center">Vídeo E</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 bg-slate-950">
                            ${ranked.length === 0 ? `
                                <tr><td colspan="7" class="p-6 text-center text-slate-400">No hay empresas finalistas seleccionadas todavía.</td></tr>
                            ` : ranked.map((item, idx) => {
                                const hasLaunch = item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined;
                                const vUrl = item.launch?.videoUrl;
                                const safeVideo = (vUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(vUrl))
                                    ? encodeURI(vUrl).replace(/"/g, '&quot;')
                                    : '';
                                return `
                                <tr class="${idx === 0 && hasLaunch ? 'bg-amber-400/10' : ''}">
                                    <td class="p-3 font-orbitron font-black text-base tabular-nums ${idx === 0 && hasLaunch ? 'text-mars-yellow' : 'text-slate-300'}">${hasLaunch ? (idx + 1) + 'º' : '--'}</td>
                                    <td class="p-3 font-mono font-bold text-mars-cyan">Clase ${this.escapeHTML(item.cls)}</td>
                                    <td class="p-3 font-orbitron font-black text-white text-base">${this.escapeHTML(item.co.name)}</td>
                                    <td class="p-3 text-right font-mono tabular-nums text-white">${hasLaunch ? Number(item.launch.heightMm).toLocaleString('es-ES') : '--'}</td>
                                    <td class="p-3 text-right font-mono tabular-nums text-slate-300">${hasLaunch ? Number(item.launch.costEurV).toFixed(2) : '--'}</td>
                                    <td class="p-3 text-right font-orbitron font-black text-lg tabular-nums ${hasLaunch ? 'text-mars-green' : 'text-slate-500'}">${hasLaunch ? Number(item.launch.efficiency).toFixed(4) : '--'}</td>
                                    <td class="p-3 text-center">
                                        ${safeVideo
                                            ? `<a href="${safeVideo}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-bold uppercase hover:bg-blue-500 hover:text-black">🎥 Ver Vídeo ↗</a>`
                                            : '<span class="text-xs text-slate-500">Sin vídeo</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
        }

        const html = `
            <div class="space-y-4">
                ${draftWarning}
                <div class="flex flex-wrap gap-2">
                    ${tabBtn('finalists', `🌟 Finalistas (${finalists.length}/6)`)}
                    ${tabBtn('launches', '🚀 Marcador en Directo (E)')}
                    ${tabBtn('podium', '🏆 Podio y 6 Galardones')}
                </div>
                ${bodyContent}
            </div>`;
        const actions = `<button type="button" onclick="ui.closeModal();" class="min-h-[44px] px-5 py-2 bg-slate-800 text-white font-bold uppercase text-xs hover:bg-slate-700">Cerrar Proyector</button>`;
        this.showModal('🖥️ MODO PROYECTOR DE GALA // FASE V (19/05/2027)', html, actions);
    },

    openPrintContestWindow() {
        if (!this._lastContestDocHtml) return;
        const printWin = window.open('', '_blank');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(this._lastContestDocHtml);
            printWin.document.close();
        }
    },

    exportContestAwardsPDF() {
        if (!this.checkCoordinatorAccess()) return;
        const fc = this.getContestState();
        const companies = state.data?.companies || {};
        const awardsDef = this.getContestAwardsDef();
        const ranked = this.getContestRankedLaunches(fc);
        const dateStr = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const statusLabel = fc.published ? 'PROCLAMACIÓN OFICIAL PUBLICADA' : 'ACTA BORRADOR INTERNA (NO PUBLICADA)';

        const renderCoLabel = (cid) => {
            const co = cid ? companies[cid] : null;
            if (!co) return 'Pendiente de asignación';
            return `${this.escapeHTML(co.name)} (Clase ${this.escapeHTML(co.classGroup || 'A')})`;
        };

        const renderPodiumBlock = (rankTitle, badgeColor, cid) => {
            const co = cid ? companies[cid] : null;
            const launch = cid ? fc.launches?.[cid] : null;
            const hasLaunch = launch && launch.efficiency !== null && launch.efficiency !== undefined;
            return `
            <div style="border: 2px solid ${badgeColor}; padding: 12px; background: #ffffff; page-break-inside: avoid;">
                <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #334155; letter-spacing: 0.06em; margin-bottom: 4px;">
                    ${rankTitle}
                </div>
                <div style="font-size: 14px; font-weight: 900; color: #0f172a; text-transform: uppercase;">
                    ${co ? this.escapeHTML(co.name) : 'Sin asignar'}
                </div>
                <div style="font-size: 11px; color: #475569; margin-top: 3px; font-family: monospace;">
                    ${co ? `Clase ${this.escapeHTML(co.classGroup || 'A')}` : '--'}
                    ${hasLaunch ? ` · E = ${Number(launch.efficiency).toFixed(4)} mm/€v (${Number(launch.heightMm).toLocaleString('es-ES')} mm / ${Number(launch.costEurV).toFixed(2)} €v)` : ''}
                </div>
            </div>`;
        };

        const allSixAwards = [
            {
                id: 'GOLD',
                roleLabel: awardsDef.GOLD.roleLabel,
                title: awardsDef.GOLD.title,
                subtitle: awardsDef.GOLD.subtitle,
                cid: fc.podium?.first || null
            },
            ...awardsDef.ROLE_AWARDS.map(item => ({
                id: item.id,
                roleLabel: item.roleLabel,
                title: item.title,
                subtitle: `Distinción Especial · Departamento ${item.roleLabel}`,
                cid: fc.roleAwards?.[item.id] || null
            }))
        ];

        const awardsCardsHtml = allSixAwards.map((aw, idx) => `
            <div style="border: 1.5px solid #0f172a; padding: 10px 12px; background: #ffffff; page-break-inside: avoid;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px;">
                    <span style="font-family: monospace; font-size: 9.5px; font-weight: 800; text-transform: uppercase; color: #0369a1;">GALARDÓN ${idx + 1}/6 · ${this.escapeHTML(aw.roleLabel)}</span>
                    <span style="font-family: monospace; font-size: 9px; color: #64748b;">FASE V</span>
                </div>
                <div style="font-size: 11.5px; font-weight: 800; color: #0f172a; text-transform: uppercase;">${this.escapeHTML(aw.title)}</div>
                <div style="font-size: 12.5px; font-weight: 900; color: ${aw.cid ? '#0f172a' : '#94a3b8'}; margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
                    ${renderCoLabel(aw.cid)}
                </div>
            </div>`).join('');

        const tableRowsHtml = ranked.length > 0 ? ranked.map((item, idx) => {
            const hasLaunch = item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined;
            return `
            <tr>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: 800; text-align: center;">${hasLaunch ? (idx + 1) + 'º' : '--'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-family: monospace; text-align: center;">Clase ${this.escapeHTML(item.cls)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: 700;">${this.escapeHTML(item.co.name)}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-family: monospace;">${hasLaunch ? Number(item.launch.heightMm).toLocaleString('es-ES') : '--'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-family: monospace;">${hasLaunch ? Number(item.launch.costEurV).toFixed(2) : '--'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right; font-family: monospace; font-weight: 800;">${hasLaunch ? Number(item.launch.efficiency).toFixed(4) : '--'}</td>
                <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-size: 10px;">${item.launch?.videoUrl ? 'Adjunto en Drive' : 'No adjunto'}</td>
            </tr>`;
        }).join('') : `<tr><td colspan="7" style="border: 1px solid #cbd5e1; padding: 12px; text-align: center; color: #64748b;">No hay finalistas registradas.</td></tr>`;

        const previewHtml = `
            <div style="font-family: Arial, Helvetica, sans-serif; color: #0f172a;">
                <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">Podio Absoluto (19/05/2027)</h3>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px;">
                    ${renderPodiumBlock('1º · Trofeo «MarsKet Gold»', '#ca8a04', fc.podium?.first)}
                    ${renderPodiumBlock('2º Puesto Absoluto', '#64748b', fc.podium?.second)}
                    ${renderPodiumBlock('3º Puesto Absoluto', '#9a3412', fc.podium?.third)}
                </div>
                <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">Cuadro de los 6 Galardones Oficiales</h3>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
                    ${awardsCardsHtml}
                </div>
                <h3 style="margin: 0 0 8px 0; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #0f172a; padding-bottom: 4px;">Marcador Oficial de Lanzamientos en Directo (A–F)</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
                    <thead>
                        <tr style="background: #f1f5f9;">
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px;">Pos</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px;">Clase</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left;">Startup Finalista</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right;">Altura (mm)</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right;">Coste (€v)</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: right;">E = Alt/Coste</th>
                            <th style="border: 1px solid #cbd5e1; padding: 6px 8px;">Vídeo E</th>
                        </tr>
                    </thead>
                    <tbody>${tableRowsHtml}</tbody>
                </table>
            </div>`;

        const docHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Acta Podio y Galardones Fase V - MARS-KET OS</title>
    <style>
        @page { size: A4 portrait; margin: 14mm; }
        body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; background: #ffffff; margin: 0; padding: 0; }
        .no-print { background: #0f172a; color: #f8fafc; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; gap: 12px; }
        .btn-print { background: #00f0ff; color: #000000; border: none; padding: 8px 14px; font-weight: 800; cursor: pointer; text-transform: uppercase; font-size: 12px; }
        .btn-close { background: #334155; color: #ffffff; border: none; padding: 8px 12px; font-weight: 700; cursor: pointer; font-size: 12px; }
        .doc-container { max-width: 820px; margin: 0 auto; padding: 18px; }
        .header-box { border: 2px solid #0f172a; padding: 14px 18px; margin-bottom: 16px; background: #ffffff; }
        @media print { .no-print { display: none !important; } .doc-container { max-width: 100%; padding: 0; } }
    </style>
</head>
<body>
    <div class="no-print">
        <div>
            <strong style="color: #00f0ff;">MARS-KET OS // CONCURSO FINAL FASE V (19/05/2027)</strong>
            <span style="font-size: 12px; color: #cbd5e1; margin-left: 10px;">Documento imprimible en blanco A4</span>
        </div>
        <div style="display: flex; gap: 8px;">
            <button class="btn-print" onclick="window.print()">🖨️ Guardar PDF / Imprimir</button>
            <button class="btn-close" onclick="window.close()">✕ Cerrar</button>
        </div>
    </div>
    <div class="doc-container">
        <div class="header-box">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 10px;">
                <div>
                    <span style="font-family: monospace; font-size: 10px; font-weight: 800; color: #0369a1; text-transform: uppercase;">PROGRAMA MARS-KET OS · AGENCIA ESPACIAL ESCOLAR (AEE)</span>
                    <h1 style="margin: 4px 0 0 0; font-size: 17px; font-weight: 900; text-transform: uppercase;">ACTA DE PODIO Y 6 GALARDONES — CONCURSO FINAL (FASE V)</h1>
                </div>
                <div style="text-align: right; font-family: monospace; font-size: 10px;">
                    <div style="font-weight: 800;">${statusLabel}</div>
                    <div>Fecha Concurso: 19/05/2027</div>
                    <div>Emisión: ${dateStr}</div>
                </div>
            </div>
            <p style="margin: 0; font-size: 10.5px; color: #475569;">
                Nota Institucional: El Concurso Final evalúa exclusivamente a las 6 startups finalistas (una por clase A–F). Los trofeos y galardones tienen carácter honorífico y no alteran la calificación curricular del Acta General (100%).
            </p>
        </div>
        ${previewHtml}
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border-top: 1px dashed #94a3b8; padding-top: 16px; margin-top: 24px;">
            <div style="text-align: center;">
                <div style="height: 36px;"></div>
                <span style="border-top: 1px solid #334155; display: block; width: 80%; margin: 0 auto; padding-top: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Claustro Evaluador MARS-KET</span>
            </div>
            <div style="text-align: center;">
                <div style="height: 36px;"></div>
                <span style="border-top: 1px solid #334155; display: block; width: 80%; margin: 0 auto; padding-top: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">Coordinación General del Proyecto</span>
            </div>
        </div>
    </div>
    <script>window.onload = function() { setTimeout(function() { window.focus(); window.print(); }, 350); };</script>
</body>
</html>`;

        this._lastContestDocHtml = docHtml;
        const printWin = window.open('', '_blank');
        if (printWin) {
            printWin.document.open();
            printWin.document.write(docHtml);
            printWin.document.close();
            this.notify("Generando Acta Imprimible de Podio y Galardones...", "success");
        } else {
            const modalBody = `
                <div class="space-y-4">
                    <p class="text-xs text-amber-400">El navegador bloqueó la apertura automática de la ventana de impresión. Pulsa el botón inferior para abrir el documento en formato imprimible A4:</p>
                    <div class="max-h-96 overflow-y-auto bg-white text-black p-4 rounded text-xs">
                        ${previewHtml}
                    </div>
                </div>`;
            const actions = `
                <button type="button" onclick="ui.openPrintContestWindow()" class="min-h-[44px] bg-mars-cyan text-black px-4 py-2 font-black uppercase text-xs hover:bg-white">
                    🖨️ Abrir Visor A4 / Guardar PDF
                </button>`;
            this.showModal("Impresión Podio y Galardones — Fase V", modalBody, actions);
        }
    },

    renderAdminContest() {
        if (!this.isCoordinatorUser()) {
            const summaryHtml = typeof this.renderContestNewsShowcase === 'function'
                ? this.renderContestNewsShowcase()
                : '';
            return `
            <div class="space-y-4">
                <div class="terminal-border bg-mars-card p-6 border-l-4 border-mars-magenta">
                    <h3 class="text-sm font-orbitron font-black text-mars-magenta uppercase">Acceso Restringido a Coordinación</h3>
                    <p class="text-xs text-slate-300 mt-1">Solo los perfiles de Coordinación (COORD_*) pueden configurar finalistas, marcador en directo, podio y galardones del Concurso Final (Fase V). A continuación puedes consultar el resumen público actual.</p>
                </div>
                ${summaryHtml}
            </div>`;
        }

        const fc = this.getContestState();
        const companies = state.data?.companies || {};
        const classes = this.getContestClasses();
        const awardsDef = this.getContestAwardsDef();
        const activeFinalists = this.getContestActiveFinalistsList(fc);
        const rankedLaunches = this.getContestRankedLaunches(fc);
        const selectedFinalistCount = activeFinalists.length;

        const finalistOptionsHtml = (selectedCid, includeEmptyLabel = '-- Seleccionar Finalista --') => {
            const opts = [`<option value="">${includeEmptyLabel}</option>`];
            activeFinalists.forEach(item => {
                const isSel = selectedCid === item.cid ? 'selected' : '';
                const eStr = (item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined)
                    ? ` · E=${Number(item.launch.efficiency).toFixed(4)}`
                    : '';
                opts.push(`<option value="${this.escapeAttr(item.cid)}" ${isSel}>[Clase ${this.escapeHTML(item.cls)}] ${this.escapeHTML(item.co.name)}${eStr}</option>`);
            });
            return opts.join('');
        };

        const step1CardsHtml = classes.map(cls => {
            const classCompanies = Object.values(companies)
                .filter(c => c && (c.classGroup || 'A').toUpperCase() === cls)
                .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            const currentCid = fc.finalists?.[cls] || '';
            const selectedCo = currentCid ? companies[currentCid] : null;
            const summary = selectedCo ? this.getCompanyActaSummary(selectedCo) : null;

            return `
            <div class="bg-slate-950 border ${selectedCo ? 'border-mars-cyan/60' : 'border-slate-800'} p-4 rounded flex flex-col justify-between gap-3">
                <div>
                    <div class="flex items-center justify-between gap-2 mb-2">
                        <span class="text-xs font-mono font-black uppercase px-2 py-0.5 bg-black border border-mars-cyan/40 text-mars-cyan">CLASE ${cls}</span>
                        <span class="text-xs font-mono ${selectedCo ? 'text-mars-green font-bold' : 'text-slate-400'}">${selectedCo ? '✓ Confirmada' : 'Sin elegir'}</span>
                    </div>
                    <label for="contest-finalist-${cls}" class="block text-xs text-slate-300 font-bold mb-1 uppercase">Empresa Finalista</label>
                    <select id="contest-finalist-${cls}" onchange="ui.setContestFinalist('${cls}', this.value)"
                        class="min-h-[44px] w-full bg-black border border-slate-700 text-white px-3 py-2 text-base sm:text-xs font-bold outline-none focus:border-mars-cyan">
                        <option value="">-- Ninguna elegida todavía --</option>
                        ${classCompanies.map(c => {
                            const s = this.getCompanyActaSummary(c);
                            const notaStr = s.nota !== null ? `${s.nota.toFixed(2)}` : '--';
                            const eStr = s.bestE !== null ? `${s.bestE.toFixed(4)}` : '--';
                            return `<option value="${this.escapeAttr(c.id)}" ${currentCid === c.id ? 'selected' : ''}>${this.escapeHTML(c.name)} [Acta: ${notaStr} | Mejor E: ${eStr}]</option>`;
                        }).join('')}
                    </select>
                </div>
                ${selectedCo && summary ? `
                    <div class="pt-2 border-t border-slate-800 flex flex-wrap gap-2 text-xs font-mono">
                        <span class="text-slate-300">Acta: <strong class="text-white tabular-nums">${summary.nota !== null ? summary.nota.toFixed(2) : '--'}</strong></span>
                        <span class="text-slate-300">Mejor E previo: <strong class="text-mars-cyan tabular-nums">${summary.bestE !== null ? summary.bestE.toFixed(4) : '--'}</strong></span>
                        <span class="text-slate-300">Saldo: <strong class="text-mars-green tabular-nums">${summary.balance.toFixed(0)} €v</strong></span>
                    </div>` : `
                    <p class="text-xs text-slate-500 pt-2 border-t border-slate-800">Solo compiten startups reales de Clase ${cls}.</p>
                `}
            </div>`;
        }).join('');

        const step2RowsHtml = activeFinalists.map(item => {
            const l = item.launch || {};
            const hVal = (l.heightMm !== null && l.heightMm !== undefined) ? l.heightMm : '';
            const cVal = (l.costEurV !== null && l.costEurV !== undefined) ? l.costEurV : '';
            const vVal = l.videoUrl || '';
            const hasEff = l.efficiency !== null && l.efficiency !== undefined;
            const safeVid = (vVal && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(vVal))
                ? encodeURI(vVal).replace(/"/g, '&quot;')
                : '';

            return `
            <tr class="hover:bg-slate-900/60">
                <td class="p-3 align-top whitespace-nowrap">
                    <span class="text-xs font-mono font-black text-mars-cyan px-2 py-0.5 bg-black border border-mars-cyan/40">Clase ${this.escapeHTML(item.cls)}</span>
                </td>
                <td class="p-3 align-top">
                    <div class="font-orbitron font-black text-white text-xs sm:text-sm">${this.escapeHTML(item.co.name)}</div>
                    <div class="text-xs text-slate-400 font-mono mt-0.5 tabular-nums">Ref previo: ${item.acta.bestE !== null ? item.acta.bestE.toFixed(4) : '--'}</div>
                </td>
                <td class="p-3 align-top">
                    <input type="number" id="contest-height-${this.escapeAttr(item.cid)}" value="${this.escapeAttr(hVal)}" min="0" step="1" placeholder="Ej: 18500"
                        oninput="ui.previewContestEfficiency('${this.escapeAttr(item.cid)}')"
                        class="min-h-[44px] w-28 sm:w-32 bg-black border border-slate-700 text-white px-2.5 py-2 text-base sm:text-xs font-mono tabular-nums outline-none focus:border-mars-cyan">
                </td>
                <td class="p-3 align-top">
                    <input type="number" id="contest-cost-${this.escapeAttr(item.cid)}" value="${this.escapeAttr(cVal)}" min="0.01" step="0.01" placeholder="Ej: 450"
                        oninput="ui.previewContestEfficiency('${this.escapeAttr(item.cid)}')"
                        class="min-h-[44px] w-28 sm:w-32 bg-black border border-slate-700 text-white px-2.5 py-2 text-base sm:text-xs font-mono tabular-nums outline-none focus:border-mars-cyan">
                </td>
                <td class="p-3 align-top text-right whitespace-nowrap">
                    <div id="contest-eff-${this.escapeAttr(item.cid)}" class="text-base font-orbitron font-black tabular-nums ${hasEff ? 'text-mars-green' : 'text-slate-400'}">
                        ${hasEff ? Number(l.efficiency).toFixed(4) : '--'}
                    </div>
                    <span class="text-[11px] font-mono text-slate-400">mm/€v</span>
                </td>
                <td class="p-3 align-top min-w-[220px]">
                    <div class="flex items-center gap-1.5">
                        <input type="url" id="contest-video-${this.escapeAttr(item.cid)}" value="${this.escapeAttr(vVal)}"
                            placeholder="https://drive.google.com/..."
                            class="min-h-[44px] w-full bg-black border border-slate-700 text-blue-300 px-2.5 py-2 text-base sm:text-xs font-mono outline-none focus:border-mars-cyan">
                        ${safeVid ? `<a href="${safeVid}" target="_blank" rel="noopener noreferrer" title="Abrir vídeo" class="min-h-[44px] min-w-[44px] inline-flex items-center justify-center bg-blue-500/20 border border-blue-400 text-blue-300 text-xs hover:bg-blue-500 hover:text-black shrink-0">↗</a>` : ''}
                    </div>
                </td>
                <td class="p-3 align-top whitespace-nowrap">
                    <div class="flex items-center gap-1.5">
                        <button type="button" onclick="ui.saveContestLaunch('${this.escapeAttr(item.cid)}')"
                            class="min-h-[44px] px-3 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white transition-all">
                            💾 Guardar
                        </button>
                        ${hasEff || vVal ? `
                            <button type="button" onclick="ui.clearContestLaunch('${this.escapeAttr(item.cid)}')"
                                class="min-h-[44px] min-w-[44px] px-2.5 py-2 bg-slate-900 border border-slate-700 text-slate-300 hover:text-mars-magenta hover:border-mars-magenta text-xs font-bold uppercase" title="Borrar registro de vuelo">
                                ✕
                            </button>` : ''}
                    </div>
                </td>
            </tr>`;
        }).join('');

        return `
        <div class="space-y-6">
            <!-- Cabecera y Estado de Publicación -->
            <div class="terminal-border bg-mars-card p-5 border-l-4 ${fc.published ? 'border-mars-green' : 'border-amber-400'}">
                <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <span class="text-xs font-mono font-black uppercase px-2.5 py-1 border ${fc.published ? 'bg-mars-green/20 border-mars-green text-mars-green' : 'bg-amber-400/15 border-amber-400 text-amber-400'}">
                                ${fc.published ? '🟢 RESULTADOS PUBLICADOS' : '🟡 MODO BORRADOR DE GALA'}
                            </span>
                            <span class="text-xs font-mono text-slate-300 bg-black px-2.5 py-1 border border-slate-800">
                                Finalistas: <strong class="text-mars-cyan tabular-nums">${selectedFinalistCount}/6 clases (A–F)</strong>
                            </span>
                            <span class="text-xs font-mono text-slate-300 bg-black px-2.5 py-1 border border-slate-800">
                                Fecha Oficial: <strong class="text-white">19/05/2027</strong>
                            </span>
                        </div>
                        <h2 class="text-lg sm:text-xl font-orbitron font-black text-white uppercase tracking-wider mt-1">
                            🏆 Gestión del Concurso Final (Fase V)
                        </h2>
                        <p class="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                            Selecciona <strong>1 startup finalista por clase (A–F)</strong> elegida en Fase IV, registra los lanzamientos en directo y su vídeo demostrativo de <code class="text-mars-cyan">E = Altura / Coste</code>, y proclama el Podio más los 6 Galardones Oficiales. <strong>No suma nota al Acta General (100%).</strong>
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
                        <button type="button" onclick="ui.openContestProjectorModal('launches')"
                            class="min-h-[44px] px-3.5 py-2 bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase transition-all">
                            🖥️ Modo Proyector / Gala
                        </button>
                        <button type="button" onclick="ui.exportContestAwardsPDF()"
                            class="min-h-[44px] px-3.5 py-2 bg-slate-900 border border-slate-600 text-white hover:border-white font-bold text-xs uppercase transition-all">
                            🖨️ Imprimir Podio / Galardones
                        </button>
                        ${fc.published ? `
                            <button type="button" onclick="ui.confirmToggleContestPublished(false)"
                                class="min-h-[44px] px-4 py-2 bg-amber-400/20 border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-black font-black text-xs uppercase transition-all">
                                🟡 Volver a Borrador
                            </button>` : `
                            <button type="button" onclick="ui.confirmToggleContestPublished(true)"
                                class="min-h-[44px] px-4 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white transition-all shadow-[0_0_12px_rgba(0,255,102,0.3)]">
                                🟢 Publicar Podio y Premios
                            </button>`}
                    </div>
                </div>
                ${!fc.published ? `
                    <div class="mt-3 pt-3 border-t border-slate-800 text-xs text-amber-300 font-mono">
                        🔒 Privacidad de Gala activa: los alumnos solo ven qué startups son Finalistas (A–F). Alturas, costes, E, vídeos y premios permanecen ocultos hasta pulsar "Publicar Podio y Premios".
                    </div>` : ''}
            </div>

            <!-- Paso 1: Finalistas por Clase -->
            <div class="terminal-border bg-mars-card p-5">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-mars-border">
                    <div>
                        <h3 class="text-sm sm:text-base font-orbitron font-black text-white uppercase tracking-wider">1. Finalistas Oficiales por Clase (A–F)</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Compite exactamente 1 startup representante por clase real (TEST queda excluida del certamen oficial).</p>
                    </div>
                    <span class="text-xs font-mono text-mars-cyan font-bold uppercase">${selectedFinalistCount}/6 designadas</span>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${step1CardsHtml}
                </div>
            </div>

            <!-- Paso 2: Marcador en Directo (19/05/2027) -->
            <div class="terminal-border bg-mars-card p-5">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-mars-border">
                    <div>
                        <h3 class="text-sm sm:text-base font-orbitron font-black text-white uppercase tracking-wider">2. Marcador de Lanzamientos en Directo (E = Altura / Coste)</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Introduce Altura (mm), Coste final del cohete (€v) y enlace opcional de Google Drive con el vídeo explicando el cálculo de E.</p>
                    </div>
                    ${activeFinalists.length > 0 ? `
                        <button type="button" onclick="ui.saveAllContestLaunches()"
                            class="min-h-[44px] px-4 py-2 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                            💾 Guardar Todos los Vuelos
                        </button>` : ''}
                </div>

                ${activeFinalists.length === 0 ? `
                    <div class="bg-slate-950 border border-dashed border-slate-700 p-6 text-center text-xs text-slate-400">
                        Selecciona al menos una empresa finalista en el Paso 1 para habilitar el marcador de lanzamientos en directo.
                    </div>` : `
                    <div class="table-responsive-container border border-mars-border rounded">
                        <table class="w-full text-left border-collapse text-xs">
                            <thead class="bg-black text-slate-300 font-mono uppercase border-b border-mars-border sticky top-0 z-10">
                                <tr>
                                    <th class="p-3">Clase</th>
                                    <th class="p-3">Finalista</th>
                                    <th class="p-3">Altura (mm)</th>
                                    <th class="p-3">Coste (€v)</th>
                                    <th class="p-3 text-right">E = Alt / Coste</th>
                                    <th class="p-3">Vídeo Cálculo E (Drive · Opcional)</th>
                                    <th class="p-3">Acción</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-slate-800 bg-slate-950">
                                ${step2RowsHtml}
                            </tbody>
                        </table>
                    </div>

                    <!-- Ranking Interno en Vivo por E -->
                    <div class="mt-4 bg-slate-950 border border-slate-800 p-3.5 rounded">
                        <span class="text-xs font-mono font-bold text-slate-400 uppercase block mb-2">📊 Clasificación Provisional en Vivo (Ordenada por mayor E):</span>
                        <div class="flex flex-wrap gap-2">
                            ${rankedLaunches.map((item, idx) => {
                                const hasEff = item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined;
                                return `
                                <div class="px-3 py-1.5 bg-black border ${idx === 0 && hasEff ? 'border-mars-yellow text-mars-yellow' : 'border-slate-800 text-slate-300'} text-xs font-mono rounded flex items-center gap-2">
                                    <strong class="tabular-nums">${hasEff ? (idx + 1) + 'º' : '--'}</strong>
                                    <span>${this.escapeHTML(item.co.name)} (${this.escapeHTML(item.cls)})</span>
                                    <strong class="tabular-nums ${hasEff ? 'text-mars-green' : 'text-slate-500'}">${hasEff ? Number(item.launch.efficiency).toFixed(4) : 'Sin vuelo'}</strong>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>`}
            </div>

            <!-- Paso 3: Podio Oficial y Los 6 Galardones -->
            <div class="terminal-border bg-mars-card p-5">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-mars-border">
                    <div>
                        <h3 class="text-sm sm:text-base font-orbitron font-black text-white uppercase tracking-wider">3. Podio Absoluto y los 6 Galardones Oficiales</h3>
                        <p class="text-xs text-slate-400 mt-0.5">Solo optan las empresas finalistas (A–F). En el podio (1º, 2º, 3º) no se puede repetir startup; los 5 premios de rol se asignan libremente entre finalistas.</p>
                    </div>
                    ${activeFinalists.length > 0 ? `
                        <button type="button" onclick="ui.suggestContestPodiumFromE()"
                            class="min-h-[44px] px-4 py-2 bg-mars-yellow text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                            ⚡ Sugerir Podio por E en Directo
                        </button>` : ''}
                </div>

                <!-- Podio -->
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div class="bg-slate-950 p-4 rounded border-2" style="border-color: #FFD700;">
                        <label for="contest-podium-first" class="block text-xs font-black uppercase mb-2" style="color: #FFD700;">🏆 1º · Trofeo «MarsKet Gold»</label>
                        <select id="contest-podium-first" ${activeFinalists.length === 0 ? 'disabled' : ''}
                            class="min-h-[44px] w-full bg-black border border-slate-700 text-white px-3 py-2 text-base sm:text-xs font-bold outline-none focus:border-mars-yellow">
                            ${finalistOptionsHtml(fc.podium?.first || '', '-- Campeón Absoluto --')}
                        </select>
                        <span class="text-[11px] text-slate-400 block mt-1.5">Campeón Absoluto del Concurso Final</span>
                    </div>
                    <div class="bg-slate-950 p-4 rounded border-2" style="border-color: #E2E8F0;">
                        <label for="contest-podium-second" class="block text-xs font-black uppercase mb-2" style="color: #E2E8F0;">🥈 2º Puesto Absoluto (Plata)</label>
                        <select id="contest-podium-second" ${activeFinalists.length === 0 ? 'disabled' : ''}
                            class="min-h-[44px] w-full bg-black border border-slate-700 text-white px-3 py-2 text-base sm:text-xs font-bold outline-none focus:border-white">
                            ${finalistOptionsHtml(fc.podium?.second || '', '-- Subcampeón (Opcional) --')}
                        </select>
                        <span class="text-[11px] text-slate-400 block mt-1.5">Segundo mejor clasificado del certamen</span>
                    </div>
                    <div class="bg-slate-950 p-4 rounded border-2" style="border-color: #CD7F32;">
                        <label for="contest-podium-third" class="block text-xs font-black uppercase mb-2" style="color: #CD7F32;">🥉 3º Puesto Absoluto (Bronce)</label>
                        <select id="contest-podium-third" ${activeFinalists.length === 0 ? 'disabled' : ''}
                            class="min-h-[44px] w-full bg-black border border-slate-700 text-white px-3 py-2 text-base sm:text-xs font-bold outline-none focus:border-amber-400">
                            ${finalistOptionsHtml(fc.podium?.third || '', '-- Tercer Puesto (Opcional) --')}
                        </select>
                        <span class="text-[11px] text-slate-400 block mt-1.5">Tercer clasificado en el podio oficial</span>
                    </div>
                </div>

                <!-- 5 Premios de Excelencia por Rol -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    ${awardsDef.ROLE_AWARDS.map(item => `
                        <div class="bg-slate-950 border border-slate-800 p-4 rounded" style="border-left: 4px solid ${item.colorHex};">
                            <label for="contest-award-${item.id}" class="block text-xs font-black uppercase mb-1" style="color: ${item.colorHex};">
                                ${item.emoji} ${this.escapeHTML(item.roleLabel)}
                            </label>
                            <p class="text-xs text-white font-bold mb-2.5 leading-snug">${this.escapeHTML(item.title)}</p>
                            <select id="contest-award-${item.id}" ${activeFinalists.length === 0 ? 'disabled' : ''}
                                class="min-h-[44px] w-full bg-black border border-slate-700 text-white px-3 py-2 text-base sm:text-xs font-bold outline-none focus:border-mars-cyan">
                                ${finalistOptionsHtml(fc.roleAwards?.[item.id] || '', '-- Seleccionar Finalista --')}
                            </select>
                        </div>`).join('')}
                </div>

                <div class="mt-5 pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <span class="text-xs text-slate-400 font-mono">Nota: Guardar aquí actualiza el acta de premios; el alumnado solo lo verá tras pulsar «Publicar Podio y Premios».</span>
                    <button type="button" onclick="ui.saveContestPodiumAndAwards()" ${activeFinalists.length === 0 ? 'disabled' : ''}
                        class="min-h-[44px] px-5 py-2.5 bg-mars-cyan text-black font-black text-xs uppercase hover:bg-white transition-all disabled:opacity-50 shrink-0">
                        💾 Guardar Podio y Premios
                    </button>
                </div>
            </div>
        </div>`;
    },

    renderContestNewsShowcase(currentCo = null) {
        const fc = this.getContestState();
        const classes = this.getContestClasses();
        const companies = state.data?.companies || {};
        const hasAnyFinalist = classes.some(cls => Boolean(fc.finalists?.[cls] && companies[fc.finalists[cls]]));
        const phaseFilter = this.newsPhaseFilter || 'ALL';

        if (!hasAnyFinalist && !fc.published) {
            if (phaseFilter !== 'V') return '';
            return `
            <div class="terminal-border bg-mars-card p-6 border-l-4 border-mars-green mb-6">
                <div class="flex items-center gap-2 mb-2">
                    <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-green text-mars-green">FASE V // 19/05/2027</span>
                    <span class="text-xs font-mono text-mars-green font-bold uppercase">🏆 CONCURSO FINAL</span>
                </div>
                <h3 class="text-base font-orbitron font-black text-white uppercase">Concurso Final — Pendiente de Designación de Finalistas</h3>
                <p class="text-xs text-slate-300 mt-1.5 leading-relaxed">
                    Al término de la Fase IV, Coordinación proclamará aquí a la <strong>1 startup finalista por cada clase (A–F)</strong> que volará su cohete en directo el <strong>19/05/2027</strong>.
                </p>
            </div>`;
        }

        // Si NO está publicado: estricto Sugg 1 = NO -> mostrar SOLO Finalistas A-F + estado pendiente, CERO alturas/costes/E/premios
        if (!fc.published) {
            return `
            <div class="terminal-border bg-mars-card p-5 border-l-4 border-mars-green mb-6">
                <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-green text-mars-green">FASE V // 19/05/2027</span>
                            <span class="text-xs font-mono text-amber-400 font-bold uppercase">🔒 CANDIDATAS CONFIRMADAS</span>
                        </div>
                        <h3 class="text-base sm:text-lg font-orbitron font-black text-white uppercase tracking-wider">Finalistas Oficiales del Concurso Final</h3>
                    </div>
                    <span class="text-xs font-mono bg-amber-400/15 border border-amber-400 text-amber-300 px-3 py-1.5 font-bold uppercase">
                        ⏳ Veredicto y marcador oficial pendientes de proclamación
                    </span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    ${classes.map(cls => {
                        const cid = fc.finalists?.[cls];
                        const co = cid ? companies[cid] : null;
                        const isMine = Boolean(currentCo && co && currentCo.id === co.id);
                        return `
                        <div class="bg-slate-950 p-3.5 rounded border ${isMine ? 'border-mars-yellow bg-amber-400/10' : (co ? 'border-mars-cyan/40' : 'border-slate-800 border-dashed')}">
                            <div class="flex items-center justify-between gap-2 mb-1">
                                <span class="text-xs font-mono font-black uppercase ${co ? 'text-mars-cyan' : 'text-slate-500'}">CLASE ${cls}</span>
                                ${isMine ? '<span class="text-[11px] font-black uppercase text-mars-yellow">★ TU STARTUP</span>' : ''}
                            </div>
                            <div class="text-sm font-orbitron font-black ${co ? 'text-white' : 'text-slate-500'} uppercase">
                                ${co ? this.escapeHTML(co.name) : 'Pendiente de elección'}
                            </div>
                            ${co && co.slogan ? `<p class="text-xs text-slate-400 mt-1 italic truncate">«${this.escapeHTML(co.slogan)}»</p>` : ''}
                        </div>`;
                    }).join('')}
                </div>
            </div>`;
        }

        // Si SÍ está publicado: mostrar Podio + 6 Galardones + Marcador en Directo con E y Vídeos
        const awardsDef = this.getContestAwardsDef();
        const ranked = this.getContestRankedLaunches(fc);
        const renderPodiumSpot = (rankLabel, hex, cid) => {
            const co = cid ? companies[cid] : null;
            const launch = cid ? fc.launches?.[cid] : null;
            const hasEff = launch && launch.efficiency !== null && launch.efficiency !== undefined;
            const isMine = Boolean(currentCo && co && currentCo.id === co.id);
            return `
            <div class="bg-slate-950 p-4 rounded border-2 ${isMine ? 'shadow-[0_0_15px_rgba(255,215,0,0.2)]' : ''}" style="border-color: ${hex};">
                <span class="text-xs font-black uppercase tracking-wider block mb-1" style="color: ${hex};">${rankLabel}</span>
                <div class="text-base sm:text-lg font-orbitron font-black text-white uppercase break-words">
                    ${co ? this.escapeHTML(co.name) : 'Desierto'}
                </div>
                <div class="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800 text-xs font-mono">
                    <span class="text-slate-300">${co ? `Clase ${this.escapeHTML(co.classGroup || 'A')}` : '--'}</span>
                    ${hasEff ? `<strong class="tabular-nums" style="color: ${hex};">E = ${Number(launch.efficiency).toFixed(4)}</strong>` : ''}
                </div>
                ${isMine ? '<span class="inline-block mt-2 text-[11px] font-black text-mars-yellow uppercase">★ VUESTRA STARTUP</span>' : ''}
            </div>`;
        };

        return `
        <div class="terminal-border bg-mars-card p-5 border-l-4 border-mars-green mb-6 space-y-5">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
                <div>
                    <div class="flex items-center gap-2 flex-wrap mb-1">
                        <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-green text-mars-green">FASE V // 19/05/2027</span>
                        <span class="text-xs font-mono text-mars-green font-bold uppercase">🏆 RESULTADOS OFICIALES PUBLICADOS</span>
                    </div>
                    <h3 class="text-base sm:text-xl font-orbitron font-black text-white uppercase tracking-wider">Concurso Final MARS-KET — Podio, Galardones y Vuelos en Directo</h3>
                </div>
                <span class="text-xs font-mono text-slate-300 bg-black border border-slate-800 px-3 py-1.5">
                    Premios honoríficos · Independientes del Acta (100%)
                </span>
            </div>

            <!-- Podio Absoluto -->
            <div>
                <h4 class="text-xs font-mono font-bold text-slate-300 uppercase mb-2.5 tracking-wider">Podio Absoluto del Certamen</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    ${renderPodiumSpot('🏆 1º · Trofeo «MarsKet Gold»', '#FFD700', fc.podium?.first)}
                    ${renderPodiumSpot('🥈 2º Puesto Absoluto (Plata)', '#E2E8F0', fc.podium?.second)}
                    ${renderPodiumSpot('🥉 3º Puesto Absoluto (Bronce)', '#CD7F32', fc.podium?.third)}
                </div>
            </div>

            <!-- 5 Galardones de Excelencia por Rol -->
            <div>
                <h4 class="text-xs font-mono font-bold text-slate-300 uppercase mb-2.5 tracking-wider">Premios de Excelencia por Departamento (Roles Finalistas)</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    ${awardsDef.ROLE_AWARDS.map(item => {
                        const wCid = fc.roleAwards?.[item.id];
                        const wCo = wCid ? companies[wCid] : null;
                        const isMine = Boolean(currentCo && wCo && currentCo.id === wCo.id);
                        return `
                        <div class="bg-slate-950 border ${isMine ? 'border-mars-yellow' : 'border-slate-800'} p-3 rounded flex flex-col justify-between" style="border-top: 3px solid ${item.colorHex};">
                            <div>
                                <span class="text-xs font-mono font-black uppercase block mb-1" style="color: ${item.colorHex};">${item.emoji} ${this.escapeHTML(item.roleLabel)}</span>
                                <p class="text-[11px] text-slate-300 font-bold leading-snug mb-2">${this.escapeHTML(item.title)}</p>
                            </div>
                            <div class="pt-2 border-t border-slate-800">
                                <div class="text-xs font-orbitron font-black ${wCo ? 'text-white' : 'text-slate-500'} uppercase">
                                    ${wCo ? this.escapeHTML(wCo.name) : 'Sin asignar'}
                                </div>
                                ${wCo ? `<span class="text-[11px] font-mono text-slate-400">Clase ${this.escapeHTML(wCo.classGroup || 'A')}</span>` : ''}
                            </div>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <!-- Tabla Oficial de Lanzamientos -->
            <div>
                <h4 class="text-xs font-mono font-bold text-slate-300 uppercase mb-2.5 tracking-wider">Marcador Oficial en Directo (Eficiencia E = Altura / Coste)</h4>
                <div class="table-responsive-container border border-slate-800 rounded">
                    <table class="w-full text-left border-collapse text-xs">
                        <thead class="bg-black text-slate-300 font-mono uppercase border-b border-slate-800">
                            <tr>
                                <th class="p-3">Pos</th>
                                <th class="p-3">Clase</th>
                                <th class="p-3">Startup Finalista</th>
                                <th class="p-3 text-right">Altura (mm)</th>
                                <th class="p-3 text-right">Coste (€v)</th>
                                <th class="p-3 text-right">Eficiencia E</th>
                                <th class="p-3 text-center">Vídeo Cálculo E</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-800 bg-slate-950">
                            ${ranked.map((item, idx) => {
                                const hasLaunch = item.launch && item.launch.efficiency !== null && item.launch.efficiency !== undefined;
                                const vUrl = item.launch?.videoUrl;
                                const safeVideo = (vUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && GOOGLE_DRIVE_REGEX.test(vUrl))
                                    ? encodeURI(vUrl).replace(/"/g, '&quot;')
                                    : '';
                                const isMine = Boolean(currentCo && currentCo.id === item.cid);
                                return `
                                <tr class="${isMine ? 'bg-amber-400/10' : ''}">
                                    <td class="p-3 font-orbitron font-black tabular-nums ${idx === 0 && hasLaunch ? 'text-mars-yellow' : 'text-white'}">${hasLaunch ? (idx + 1) + 'º' : '--'}</td>
                                    <td class="p-3 font-mono font-bold text-mars-cyan">Clase ${this.escapeHTML(item.cls)}</td>
                                    <td class="p-3 font-orbitron font-bold text-white">${this.escapeHTML(item.co.name)} ${isMine ? '<span class="text-mars-yellow text-[11px] font-mono">(TUYA)</span>' : ''}</td>
                                    <td class="p-3 text-right font-mono tabular-nums text-white">${hasLaunch ? Number(item.launch.heightMm).toLocaleString('es-ES') : '--'}</td>
                                    <td class="p-3 text-right font-mono tabular-nums text-slate-300">${hasLaunch ? Number(item.launch.costEurV).toFixed(2) : '--'}</td>
                                    <td class="p-3 text-right font-orbitron font-black tabular-nums ${hasLaunch ? 'text-mars-green' : 'text-slate-500'}">${hasLaunch ? Number(item.launch.efficiency).toFixed(4) : '--'}</td>
                                    <td class="p-3 text-center">
                                        ${safeVideo
                                            ? `<a href="${safeVideo}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center px-3 py-1.5 bg-blue-500/20 border border-blue-400 text-blue-300 text-xs font-bold uppercase hover:bg-blue-500 hover:text-black">🎥 Ver Vídeo Cálculo E ↗</a>`
                                            : '<span class="text-slate-500">--</span>'}
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
    },

    renderContestDashboardBanner(co) {
        if (!co) return '';
        const fc = this.getContestState();
        const classes = this.getContestClasses();
        const companies = state.data?.companies || {};
        const isFinalist = classes.some(cls => fc.finalists?.[cls] === co.id);
        const anyFinalist = classes.some(cls => Boolean(fc.finalists?.[cls] && companies[fc.finalists[cls]]));

        if (!fc.published) {
            if (!isFinalist && !anyFinalist) return '';
            if (isFinalist) {
                return `
                <div class="terminal-border bg-mars-card p-4 border-l-4 border-mars-green bg-slate-900/80 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                        <div class="flex items-center gap-2 flex-wrap mb-1">
                            <span class="text-xs font-black uppercase px-2 py-0.5 bg-black border border-mars-green text-mars-green">FASE V // 19/05/2027</span>
                            <span class="text-xs font-orbitron font-black text-mars-yellow uppercase">🌟 STARTUP FINALISTA DE CLASE ${this.escapeHTML(co.classGroup || 'A')}</span>
                        </div>
                        <p class="text-xs text-slate-200 leading-relaxed">
                            Vuestra startup representa oficialmente a su clase en el <strong>Concurso Final en directo</strong>. Marcador y veredicto oficial pendientes de proclamación.
                        </p>
                    </div>
                    <button type="button" onclick="ui.openPhaseVNews()"
                        class="min-h-[44px] px-4 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                        🏆 Ver Finalistas (Fase V) ➔
                    </button>
                </div>`;
            }
            return `
            <div class="terminal-border bg-mars-card p-3.5 border-l-4 border-mars-cyan/60 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div class="text-xs text-slate-300">
                    <strong class="text-mars-cyan uppercase">🏆 Concurso Final (19/05/2027):</strong> Candidatas finalistas por clase en publicación. Consulta qué startups representarán a cada clase.
                </div>
                <button type="button" onclick="ui.openPhaseVNews()"
                    class="min-h-[44px] px-3.5 py-2 bg-slate-900 border border-mars-cyan text-mars-cyan hover:bg-mars-cyan hover:text-black font-bold text-xs uppercase transition-all shrink-0">
                    🏆 Ver Finalistas ➔
                </button>
            </div>`;
        }

        const awards = this.getCompanyContestAwards(co.id, false);
        if (awards.length > 0) {
            return `
            <div class="terminal-border bg-mars-card p-4 border-2 mb-5 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4" style="border-color: #FFD700;">
                <div>
                    <span class="text-xs font-mono font-black uppercase text-mars-yellow block mb-1">🏆 PALMARÉS OFICIAL · CONCURSO FINAL FASE V (19/05/2027)</span>
                    <h3 class="text-sm sm:text-base font-orbitron font-black text-white uppercase">¡Enhorabuena, ${this.escapeHTML(co.name)}! Galardones obtenidos:</h3>
                    <div class="flex flex-wrap gap-2 mt-2">
                        ${awards.map(a => `
                            <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black border text-xs font-bold uppercase" style="border-color: ${a.colorHex}; color: ${a.colorHex};">
                                <span>${a.emoji}</span>
                                <span>${this.escapeHTML(a.title)}</span>
                            </span>`).join('')}
                    </div>
                </div>
                <button type="button" onclick="ui.openPhaseVNews()"
                    class="min-h-[44px] px-4 py-2 bg-mars-yellow text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                    🏆 Ver Podio Completo ➔
                </button>
            </div>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-3.5 border-l-4 border-mars-green mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div class="text-xs text-slate-200">
                <strong class="text-mars-green uppercase">🏆 Resultados Oficiales Fase V (19/05/2027):</strong> El Podio Absoluto, los 6 Galardones Oficiales y las marcas de E ya están publicados en el Tablón de Noticias.
            </div>
            <button type="button" onclick="ui.openPhaseVNews()"
                class="min-h-[44px] px-4 py-2 bg-mars-green text-black font-black text-xs uppercase hover:bg-white transition-all shrink-0">
                🏆 Ver Podio y Resultados ➔
            </button>
        </div>`;
    }
});
