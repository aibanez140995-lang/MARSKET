// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES DE PLAZOS Y BACKUPS D1 (v1.1.28) ---

Object.assign(ui, {
    currentClassFilter: 'ALL',

    getTeacherDashboardStats() {
        const companies = state.data.companies || {};
        const classes = ['ALL', 'A', 'B', 'C', 'D', 'E', 'F', 'TEST'];
        const stats = {};

        classes.forEach(cls => {
            stats[cls] = {
                companyCount: 0,
                pendingAesa: 0,
                pendingBrands: 0,
                pendingNameChanges: 0,
                pendingB2B: 0,
                pendingAux: 0,
                pendingIncidents: 0,
                pendingHR: 0,
                pendingCustom: 0,
                totalPending: 0,
                deliveredDeliverables: 0,
                criticalBalanceCount: 0,
                bottleneckCount: 0
            };
        });

        for (const cid in companies) {
            const co = companies[cid];
            if (!co) continue;
            const cls = co.classGroup || 'A';
            const targetClasses = ['ALL'];
            if (classes.includes(cls)) targetClasses.push(cls);
            const phaseMetrics = this.getPhaseClockMetrics ? this.getPhaseClockMetrics(co) : { isTeacherBottleneck: false };

            targetClasses.forEach(cKey => {
                const s = stats[cKey];
                s.companyCount++;
                if (Number(co.balance) < 300) {
                    s.criticalBalanceCount++;
                }
                if (phaseMetrics.isTeacherBottleneck) {
                    s.bottleneckCount++;
                }
                if (co.launchLicense && co.launchLicense.status === 'PENDIENTE_DOCENTE') {
                    s.pendingAesa++;
                    s.totalPending++;
                }
                if ((co.brandApproval && co.brandApproval.status === 'PENDIENTE') || co.brandStatus === 'PENDING_APPROVAL') {
                    s.pendingBrands++;
                    s.totalPending++;
                }
                if (co.nameChangeRequest && co.nameChangeRequest.status === 'PENDIENTE') {
                    s.pendingNameChanges++;
                    s.totalPending++;
                }
                if (co.auxRoleRequest && co.auxRoleRequest.status === 'PENDIENTE') {
                    s.pendingAux++;
                    s.totalPending++;
                }
                const hrPend = (co.inactivityReports || []).filter(r => r && r.status === 'PENDIENTE').length;
                if (hrPend > 0) {
                    s.pendingHR += hrPend;
                    s.totalPending += hrPend;
                }

                const delivs = co.deliverables || {};
                for (const dKey in delivs) {
                    const item = delivs[dKey];
                    if (item && (item.status === 'DELIVERED_TO_TEACHER' || (typeof item === 'string' && item.length > 0))) {
                        s.deliveredDeliverables++;
                    }
                }
            });
        }

        const b2bList = state.data.b2bContracts || [];
        b2bList.forEach(contract => {
            if (contract && contract.status === 'PENDIENTE_ADUANA') {
                stats['ALL'].pendingB2B++;
                stats['ALL'].totalPending++;

                const buyer = companies[contract.buyerCoId || contract.buyerId];
                const seller = companies[contract.sellerCoId || contract.sellerId];
                const buyerCls = buyer ? (buyer.classGroup || 'A') : null;
                const sellerCls = seller ? (seller.classGroup || 'A') : null;

                const touched = new Set();
                if (buyerCls && stats[buyerCls]) touched.add(buyerCls);
                if (sellerCls && stats[sellerCls]) touched.add(sellerCls);

                touched.forEach(cls => {
                    stats[cls].pendingB2B++;
                    stats[cls].totalPending++;
                });
            }
        });

        const incidents = (state.data.securityIncidents || []).filter(i => !i.resolved);
        incidents.forEach(inc => {
            stats['ALL'].pendingIncidents++;
            stats['ALL'].totalPending++;
            const co = companies[inc.coId];
            const cls = co ? (co.classGroup || 'A') : null;
            if (cls && stats[cls]) {
                stats[cls].pendingIncidents++;
                stats[cls].totalPending++;
            }
        });

        const customList = state.data.pendingCustom || [];
        customList.forEach(req => {
            if (!req) return;
            stats['ALL'].pendingCustom++;
            stats['ALL'].totalPending++;
            const co = companies[req.company || req.coId];
            const cls = co ? (co.classGroup || 'A') : null;
            if (cls && stats[cls]) {
                stats[cls].pendingCustom++;
                stats[cls].totalPending++;
            }
        });

        return stats;
    },

    renderClassRadarBar(stats) {
        const currentCls = this.currentClassFilter || 'ALL';
        const teacherRole = String(state.user?.role || '');
        const isCoord = teacherRole.startsWith('COORD');
        const isFyq = teacherRole === 'FYQ';
        const getScopedPending = (s) => {
            if (!s) return 0;
            if (isCoord) return Number(s.totalPending || 0);
            if (isFyq) return Number(s.pendingAesa || 0) + Number(s.pendingCustom || 0);
            return 0;
        };
        const classes = [
            { key: 'ALL', label: 'TODAS', icon: '🌐' },
            { key: 'A', label: 'CLASE A', badgeLetter: 'A' },
            { key: 'B', label: 'CLASE B', badgeLetter: 'B' },
            { key: 'C', label: 'CLASE C', badgeLetter: 'C' },
            { key: 'D', label: 'CLASE D', badgeLetter: 'D' },
            { key: 'E', label: 'CLASE E', badgeLetter: 'E' },
            { key: 'F', label: 'CLASE F', badgeLetter: 'F' },
            { key: 'TEST', label: 'TEST', icon: '🧪' }
        ];

        const global = stats['ALL'] || { companyCount: 0, totalPending: 0, deliveredDeliverables: 0, criticalBalanceCount: 0 };
        const globalPending = getScopedPending(global);

        const pillsHtml = classes.map(c => {
            const s = stats[c.key] || { companyCount: 0, totalPending: 0, deliveredDeliverables: 0, criticalBalanceCount: 0 };
            const scopedPend = getScopedPending(s);
            const isSelected = (currentCls === c.key);
            
            const borderBg = isSelected
                ? (c.key === 'TEST' ? 'bg-amber-950/70 border-amber-400 text-white shadow-[0_0_12px_rgba(251,191,36,0.35)]' : 'bg-cyan-950/70 border-mars-cyan text-white shadow-[0_0_12px_rgba(0,240,255,0.35)]')
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 text-slate-300 hover:text-white';

            const badgeHtml = c.badgeLetter
                ? `<span class="inline-flex items-center justify-center w-5 h-5 rounded-sm text-[10px] font-mono font-black border shrink-0 ${isSelected ? 'bg-mars-cyan text-black border-mars-cyan' : 'bg-cyan-950/70 text-mars-cyan border-cyan-500/50'}">${c.badgeLetter}</span>`
                : `<span class="text-xs shrink-0">${c.icon}</span>`;

            return `
            <button type="button" onclick="ui.setClassFilter('${c.key}')" class="min-h-[48px] p-2 border rounded transition-all text-left flex flex-col justify-between ${borderBg}">
                <div class="flex items-center justify-between gap-1 w-full">
                    <span class="font-orbitron font-bold text-xs uppercase tracking-tight flex items-center gap-1.5">
                        ${badgeHtml}
                        <span>${c.label}</span>
                    </span>
                    <span class="font-mono text-[10px] text-slate-400 font-bold">${s.companyCount} emp</span>
                </div>
                <div class="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    ${scopedPend > 0 ? `<span class="bg-amber-500 text-black px-1.5 py-0.5 rounded text-[10px] font-black font-mono animate-pulse" title="${scopedPend} trámite(s) pendiente(s) de tu competencia">⚠️ ${scopedPend}</span>` : ''}
                    <span class="text-[10px] text-cyan-300 font-mono" title="${s.deliveredDeliverables} entregas realizadas">📄 ${s.deliveredDeliverables}</span>
                    ${isCoord && s.criticalBalanceCount > 0 ? `<span class="bg-red-950/80 text-red-400 border border-red-500/50 px-1 py-0.5 rounded text-[10px] font-mono font-bold" title="${s.criticalBalanceCount} empresa(s) con saldo crítico <300€v">💸 ${s.criticalBalanceCount}</span>` : ''}
                    ${s.bottleneckCount > 0 ? `<span class="bg-orange-950/90 text-orange-300 border border-orange-500/70 px-1 py-0.5 rounded text-[10px] font-mono font-bold animate-pulse" title="${s.bottleneckCount} empresa(s) en riesgo de plazo (<50% fase a ≤3d)">⏰ ${s.bottleneckCount}</span>` : ''}
                </div>
            </button>`;
        }).join('');

        return `
        <div class="mb-5 bg-slate-950 border border-slate-800/90 rounded p-3.5 shadow-md">
            <div class="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-3 border-b border-slate-800/80 pb-2.5">
                <div class="flex items-center gap-2">
                    <span class="text-base">📡</span>
                    <div>
                        <h3 class="font-orbitron font-black text-xs sm:text-sm text-mars-cyan uppercase tracking-wider">Radar de Misión por Clases</h3>
                        <p class="text-[10px] text-slate-400 font-mono">Filtra instantáneamente todas las vistas, aduanas, rúbricas y startups</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 text-xs font-mono shrink-0">
                    <span class="text-slate-400">Filtro Activo: <strong class="text-mars-yellow uppercase font-bold">${currentCls === 'ALL' ? 'Todas las Clases' : 'Clase ' + currentCls}</strong></span>
                    ${(isCoord || isFyq) ? (globalPending > 0 ? `<span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2 py-0.5 rounded text-[10px] font-bold uppercase animate-pulse">Aduana: ${globalPending} pendiente(s)</span>` : '<span class="text-emerald-400 text-[10px] font-mono">✅ Aduana al día</span>') : ''}
                </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                ${pillsHtml}
            </div>
        </div>`;
    },

    setClassFilter(cls) {
        this.currentClassFilter = cls;
        this.evalClassFilter = cls;
        this.adminContractsClassFilter = cls;
        this.selectedKeychainClass = cls;
        this.telemetryClassFilter = cls;
        this.revealedPinCompanyIds = {};
        this.render();
    },

    goToCompanyEval(cid) {
        const co = state.data.companies && state.data.companies[cid];
        const coClass = (co && co.classGroup) || 'ALL';
        this.adminMode = 'aula';
        this.adminTab = 'eval';
        this.currentClassFilter = coClass;
        this.evalClassFilter = coClass;
        this.evalSelectedCo = cid;
        this.render();
    },

    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        
        const wrapper = document.createElement('div');
        const isCoord = state.user.role && String(state.user.role).startsWith('COORD_');
        const isFyqTeacher = state.user.role === 'FYQ';
        const isLyeTeacher = state.user.role === 'LYE';
        const canSeeAduanaTab = isCoord || isFyqTeacher || isLyeTeacher;
        this.adminMode = isCoord ? (this.adminMode || 'aula') : 'aula';
        let currentTab = this.adminTab || (this.adminMode === 'coord' ? 'startups' : (isCoord ? 'dash' : 'eval'));
        if (!isCoord && currentTab === 'contest') currentTab = 'eval';
        if (!canSeeAduanaTab && currentTab === 'dash') currentTab = 'eval';
        const activeSuggsCount = (state.data.suggestionsToAlex || []).filter(s => s.status !== 'IMPLEMENTADO' && s.status !== 'RESUELTO' && !s.resolved).length;
        
        this.currentClassFilter = this.currentClassFilter || 'ALL';
        const stats = this.getTeacherDashboardStats();
        const radarBarHtml = this.renderClassRadarBar(stats);

        const activeStats = stats[this.currentClassFilter] || stats.ALL;
        let deliveredCount = activeStats?.deliveredDeliverables ?? stats.ALL.deliveredDeliverables;
        let customsPendingCount = isCoord
            ? (activeStats?.totalPending ?? 0)
            : (isFyqTeacher ? (Number(activeStats?.pendingAesa || 0) + Number(activeStats?.pendingCustom || 0)) : 0);
        const pendingAuxAll = stats.ALL?.pendingAux || 0;
        const pendingHrAll = stats.ALL?.pendingHR || 0;

        let modeSwitchHtml = '';
        if (isCoord) {
            modeSwitchHtml = `
            <div class="flex flex-wrap gap-2 mb-4 border-b border-cyan-500/30 pb-3" role="tablist">
                <button type="button" role="tab" aria-selected="${this.adminMode === 'aula'}"
                    onclick="ui.adminMode = 'aula'; ui.adminTab = 'eval'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        this.adminMode === 'aula'
                            ? 'bg-mars-cyan text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                    }">
                    🏫 MODO AULA // CALIFICACIÓN DIARIA
                </button>
                <button type="button" role="tab" aria-selected="${this.adminMode === 'coord'}"
                    onclick="ui.adminMode = 'coord'; ui.adminTab = 'startups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 ${
                        this.adminMode === 'coord'
                            ? 'bg-amber-400 text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                            : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-700'
                    }">
                    ⚙️ ADMINISTRACIÓN DEL CENTRO (TIC)
                </button>
            </div>
            `;
        }

        let tabsHtml = '';
        if (!isCoord || this.adminMode === 'aula') {
            // MODO AULA / CALIFICACIÓN DIARIA (Visible para todo profesor)
            const isEval = (currentTab === 'eval');
            const isDash = (currentTab === 'dash');
            const isContest = (currentTab === 'contest');
            tabsHtml = `
            <div role="tablist" aria-label="Navegación Docente Aula" class="flex flex-wrap gap-3 mb-6 border-b border-mars-border pb-3">
                <button type="button" role="tab" aria-selected="${isEval}"
                    onclick="ui.adminTab = 'eval'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isEval
                            ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>📝 Rúbricas y Entregas</span>
                    ${deliveredCount > 0 ? `<span class="bg-mars-green text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black">${deliveredCount}</span>` : ''}
                </button>
                ${canSeeAduanaTab ? `
                <button type="button" role="tab" aria-selected="${isDash}"
                    onclick="ui.adminTab = 'dash'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isDash
                            ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🛃 ${isCoord ? 'Validaciones y Aduana' : (isFyqTeacher ? 'AESA, I+D y Recepción FyQ' : 'Supervisión Acciones MKT')}</span>
                    ${customsPendingCount > 0 ? `<span class="bg-amber-400 text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">${customsPendingCount}</span>` : ''}
                </button>` : ''}
                <button type="button" role="tab" aria-selected="${currentTab === 'contracts'}"
                    onclick="ui.adminTab = 'contracts'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        currentTab === 'contracts'
                            ? 'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🤝 Contratos & Misiones</span>
                </button>
                ${isCoord ? `
                <button type="button" role="tab" aria-selected="${isContest}"
                    onclick="ui.adminTab = 'contest'; ui.render();"
                    class="min-h-[44px] px-5 py-2.5 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2 ${
                        isContest
                            ? 'bg-mars-green text-black border-mars-green shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🏆 Fase V: Concurso Final</span>
                </button>` : ''}
            </div>
            `;
        } else {
            // MODO COORDINACIÓN Y TIC
            tabsHtml = `
            <div role="tablist" aria-label="Administración del Centro TIC" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3">
                <button type="button" role="tab" aria-selected="${currentTab === 'startups'}"
                    onclick="ui.adminTab = 'startups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        currentTab === 'startups'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🚀 Startups & Llavero Maestro (PINs)</span>
                    ${pendingAuxAll > 0 ? `<span class="bg-mars-green text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">${pendingAuxAll}</span>` : ''}
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'settings'}"
                    onclick="ui.adminTab = 'settings'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        currentTab === 'settings'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>⏳ Cronograma Maestro (Plazos)</span>
                    ${activeSuggsCount > 0 ? `<span id="tab-badge-settings" class="bg-mars-yellow text-black px-1.5 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">${activeSuggsCount}</span>` : `<span id="tab-badge-settings" class="hidden"></span>`}
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'backups'}"
                    onclick="ui.adminTab = 'backups'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'backups'
                            ? 'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    💾 Copias de Seguridad (D1)
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'hr'}"
                    onclick="ui.adminTab = 'hr'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                        currentTab === 'hr'
                            ? 'bg-mars-magenta text-white border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    <span>🕊️ Buzón HR Confidencial (DOC_2)</span>
                    ${pendingHrAll > 0 ? `<span class="bg-white text-mars-magenta px-1.5 py-0.5 rounded text-[10px] font-mono font-black animate-pulse">${pendingHrAll}</span>` : ''}
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'telemetry'}"
                    onclick="ui.adminTab = 'telemetry'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'telemetry'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    📈 Telemetría de Red y Accesos
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'catalog'}"
                    onclick="ui.adminTab = 'catalog'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'catalog'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🛒 Gestión Catálogo
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'contracts'}"
                    onclick="ui.adminTab = 'contracts'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'contracts'
                            ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🤝 Auditoría de Contratos
                </button>
                <button type="button" role="tab" aria-selected="${currentTab === 'contest'}"
                    onclick="ui.adminTab = 'contest'; ui.render();"
                    class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                        currentTab === 'contest'
                            ? 'bg-mars-green text-black border-mars-green shadow-[0_0_10px_rgba(0,255,102,0.3)]'
                            : 'bg-mars-card text-slate-300 border-mars-border hover:text-white'
                    }">
                    🏆 Concurso Final (Fase V)
                </button>
            </div>
            `;
        }

        wrapper.innerHTML = modeSwitchHtml + radarBarHtml + tabsHtml + '<div id="admin-subtab-container" role="tabpanel"></div>';
        const subContainer = wrapper.querySelector('#admin-subtab-container');

        try {
            switch(currentTab) {
                case 'dash': {
                    const isFyqOrCoord = state.user.role === 'FYQ' || isCoord || Boolean(state.user.isCoordinator) || (state.user.role && String(state.user.role).startsWith('COORD'));
                    const isLyeOrCoord = state.user.role === 'LYE' || isCoord || Boolean(state.user.isCoordinator) || (state.user.role && String(state.user.role).startsWith('COORD'));
                    const launchLicensePanel = isFyqOrCoord ? this.renderAdminLaunchLicensePanel() : '';
                    const fyqPanel = isFyqOrCoord ? this.renderFyqReceptionPanel() : '';
                    const mktActionPanel = isLyeOrCoord ? this.renderMktActionReceptionPanel() : '';
                    subContainer.innerHTML = launchLicensePanel + fyqPanel + mktActionPanel + this.renderAdminDash();
                    break;
                }
                case 'contracts': subContainer.innerHTML = this.renderAdminContracts(); break;
                case 'contest': subContainer.innerHTML = typeof this.renderAdminContest === 'function' ? this.renderAdminContest() : '<div class="terminal-border bg-mars-card p-6 text-xs text-mars-magenta">Módulo de Fase V no cargado. Recarga la página con Ctrl+F5.</div>'; break;
                case 'eval': subContainer.innerHTML = this.renderAdminEval(); break;
                case 'startups': subContainer.innerHTML = this.renderAdminStartups(); break;
                case 'telemetry': subContainer.innerHTML = this.renderAdminTelemetry(); break;
                case 'hr': subContainer.innerHTML = this.renderAdminHR(); break;
                case 'catalog': subContainer.innerHTML = this.renderAdminCatalog(); break;
                case 'settings': subContainer.innerHTML = this.renderAdminSettings(); break;
                case 'backups': subContainer.innerHTML = this.renderAdminBackups(); break;
            }
        } catch (err) {
            console.error("Error renderizando pestaña docente:", err);
            subContainer.innerHTML = `<div class="bg-red-900/50 border border-red-500 p-4 text-white text-xs">Error de renderizado en pestaña ${this.escapeHTML(currentTab)}: ${this.escapeHTML(err.message)}</div>`;
        }

        el.appendChild(wrapper);
    },

    renderFyqReceptionPanel() {
        const activeFilter = this.currentClassFilter || 'ALL';
        const companies = state.data.companies || {};
        const defs = (typeof DELIVERABLES_DEF !== 'undefined' ? DELIVERABLES_DEF : []).filter(d => d.subject === 'FYQ');

        let rows = '';
        for (const cid in companies) {
            const co = companies[cid];
            if (!co) continue;
            if (activeFilter !== 'ALL' && (co.classGroup || 'A') !== activeFilter) continue;
            const coName = co.name || cid.toUpperCase();
            const coDeliverables = co.deliverables || {};

            defs.forEach(def => {
                const item = coDeliverables[def.key];
                const isDelivered = (def.key === 'hoja_taller_fyq')
                    ? (item && item.status === 'DELIVERED_TO_TEACHER')
                    : (item && (item.status === 'DELIVERED_TO_TEACHER' || (typeof item === 'string' && item.length > 0)));
                if (isDelivered) {
                    const driveUrl = typeof item === 'object' ? item.driveUrl : item;
                    const updatedAt = (typeof item === 'object' && item.updatedAt) ? String(item.updatedAt).slice(0, 10) : '--';
                    const safeHref = encodeURI(driveUrl).replace(/"/g, '&quot;');
                    rows += `
                        <tr class="border-b border-slate-800 text-xs">
                            <td class="p-2.5 font-bold text-mars-cyan uppercase">${this.escapeHTML(coName)}</td>
                            <td class="p-2.5 text-white font-medium">${this.escapeHTML(def.shortName || def.name)}</td>
                            <td class="p-2.5 font-mono text-slate-300">${this.escapeHTML(updatedAt)}</td>
                            <td class="p-2.5">
                                <span class="bg-mars-green/20 text-mars-green border border-mars-green/40 px-2 py-0.5 text-[10px] font-black uppercase">[✓ RECIBIDO DOCENTE]</span>
                            </td>
                            <td class="p-2.5">
                                <a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50">Abrir Drive ↗</a>
                            </td>
                        </tr>
                    `;
                }
            });
        }

        if (!rows) {
            return '';
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-cyan-400 mb-6">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2">
                <div>
                    <h3 class="font-orbitron text-cyan-400 text-xs sm:text-sm uppercase tracking-wider font-bold">Recepción de Entregables FyQ (Hoja de Taller BOM & Informes)</h3>
                    <p class="text-[11px] text-slate-300">Entregables supervisados y elevados por el CEO al equipo docente de Física y Química.</p>
                </div>
            </div>
            <div class="overflow-x-auto max-h-64 border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">Startup</th>
                            <th class="p-2.5 border-b border-slate-700">Hito FYQ</th>
                            <th class="p-2.5 border-b border-slate-700">Fecha</th>
                            <th class="p-2.5 border-b border-slate-700">Estado Pipeline</th>
                            <th class="p-2.5 border-b border-slate-700">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    renderMktActionReceptionPanel() {
        const activeFilter = this.currentClassFilter || 'ALL';
        const companies = state.data.companies || {};
        let rows = '';

        for (const cid in companies) {
            const co = companies[cid];
            if (!co) continue;
            if (activeFilter !== 'ALL' && (co.classGroup || 'A') !== activeFilter) continue;
            const coName = co.name || cid.toUpperCase();
            const campaigns = Array.isArray(co.marketingCampaigns) ? co.marketingCampaigns : [];

            campaigns.forEach(c => {
                const actions = Array.isArray(c.executedActions) ? c.executedActions : [];
                actions.forEach(act => {
                    if (act && act.status === 'VALIDADO_CEO') {
                        const actUrl = act.url || act.driveUrl || '';
                        const safeHref = actUrl ? encodeURI(actUrl).replace(/"/g, '&quot;') : '';
                        const dateFormatted = act.reviewedAt ? new Date(act.reviewedAt).toLocaleDateString() : (act.date || '--');

                        rows += `
                            <tr class="border-b border-slate-800 text-xs hover:bg-slate-900/60 transition-colors">
                                <td class="p-2.5 font-bold text-mars-cyan uppercase">${this.escapeHTML(coName)}</td>
                                <td class="p-2.5 text-white font-medium">${this.escapeHTML(c.packageName || c.title || 'Campaña MKT')}</td>
                                <td class="p-2.5 text-slate-200">
                                    <span class="font-bold block">${this.escapeHTML(act.title)}</span>
                                    ${act.desc ? `<span class="text-[11px] text-slate-400 italic block">"${this.escapeHTML(act.desc)}"</span>` : ''}
                                </td>
                                <td class="p-2.5 font-mono text-slate-300">${this.escapeHTML(dateFormatted)}</td>
                                <td class="p-2.5">
                                    <span class="bg-mars-green/20 text-mars-green border border-mars-green/40 px-2 py-0.5 text-[10px] font-black uppercase">[✓ RECIBIDO DOCENTE]</span>
                                </td>
                                <td class="p-2.5">
                                    ${safeHref ? `<a href="${safeHref}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-cyan-950/40 text-cyan-400 border border-cyan-500/30 rounded hover:bg-cyan-900/50">Abrir Drive ↗</a>` : '<span class="text-slate-500 text-[10px] italic">Sin enlace</span>'}
                                </td>
                            </tr>
                        `;
                    }
                });
            });
        }

        if (!rows) {
            return '';
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 border-t-4 border-t-amber-400 mb-6">
            <div class="flex justify-between items-center mb-3 border-b border-slate-800 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-amber-400 text-xs sm:text-sm uppercase tracking-wider font-bold">Recepción de Acciones Publicitarias (Liderazgo & Coordinación)</h3>
                    <p class="text-[11px] text-slate-300">Acciones validadas por Dirección General (CEO) para supervisión curricular y feedback docente.</p>
                </div>
            </div>
            <div class="overflow-x-auto max-h-64 border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">Startup</th>
                            <th class="p-2.5 border-b border-slate-700">Paquete</th>
                            <th class="p-2.5 border-b border-slate-700">Acción Publicitaria</th>
                            <th class="p-2.5 border-b border-slate-700">Aprobación CEO</th>
                            <th class="p-2.5 border-b border-slate-700">Estado Pipeline</th>
                            <th class="p-2.5 border-b border-slate-700">Enlace Drive</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>
        `;
    },

    renderAdminBackups() {
        return `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500 mb-6">
            <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-3 flex-wrap gap-2">
                <div>
                    <h2 class="font-orbitron text-blue-400 text-sm sm:text-base uppercase tracking-tighter">Centro de Seguridad D1 y Copias de Respaldo</h2>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Control de estado global. Protegido mediante bindings nativos de Cloudflare.</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-slate-700 text-slate-200 text-xs font-black px-2 py-0.5 uppercase">Descarga Local</span></div>
                        <h4 class="text-white font-bold text-xs uppercase mb-2 text-center border-b border-slate-700 pb-2">1. Backup Manual Local</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Descarga el estado de todas las empresas en un archivo JSON seguro en tu ordenador.</p>
                    </div>
                    <button onclick="ui.downloadStateJSON()" class="min-h-[44px] w-full bg-slate-800 text-slate-200 border border-slate-600 font-black py-3 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">Descargar JSON</button>
                </div>

                <div class="bg-slate-900 border border-blue-500/50 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-blue-500 text-white text-xs font-black px-2 py-0.5 uppercase">Sobreescribible</span></div>
                        <h4 class="text-blue-400 font-bold text-xs uppercase mb-2 text-center border-b border-blue-500/50 pb-2">2. Snapshot Diario (Cloud)</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Fuerza un volcado del estado actual en el slot diario de la base de datos D1. Reemplaza el de ayer.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('daily')" class="min-h-[44px] w-full bg-blue-600/20 text-blue-400 border border-blue-500 font-black py-3 text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Generar Backup Diario</button>
                </div>

                <div class="bg-slate-900 border border-mars-yellow/50 p-4 flex flex-col justify-between">
                    <div>
                        <div class="flex justify-end mb-2"><span class="bg-mars-yellow text-black text-xs font-black px-2 py-0.5 uppercase">Inmutable</span></div>
                        <h4 class="text-mars-yellow font-bold text-xs uppercase mb-2 text-center border-b border-mars-yellow/50 pb-2">3. Archivo Semanal (Cloud)</h4>
                        <p class="text-xs text-slate-300 text-center mb-4 leading-relaxed">Genera un snapshot inmutable fechado. Ideal para cerrar trimestres o hitos de evaluación.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('weekly')" class="min-h-[44px] w-full bg-mars-yellow/20 text-mars-yellow border border-mars-yellow font-black py-3 text-xs uppercase tracking-widest hover:bg-mars-yellow hover:text-black transition-all">Crear Archivo Semanal</button>
                </div>
            </div>
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
            <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest border-b border-mars-magenta/50 pb-2">Punto de Restauración (Rollback de Emergencia)</h3>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">Si un fallo o ataque altera gravemente la economía o el inventario, sube un archivo JSON previamente descargado (Backup 1) para sobreescribir la base de datos completa y restaurar la normalidad.</p>
            <div class="flex items-center gap-4 flex-wrap">
                <label for="restore-json-file" class="sr-only">Seleccionar archivo JSON de restauración</label>
                <input type="file" id="restore-json-file" accept=".json" class="min-h-[44px] text-xs text-slate-300 bg-black border border-slate-700 p-2 w-full md:w-auto flex-grow">
                <button onclick="ui.restoreStateFromJSON()" class="min-h-[44px] bg-mars-magenta text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-white hover:text-mars-magenta transition-all border border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.4)] whitespace-nowrap w-full md:w-auto">⚠ Ejecutar Restauración</button>
            </div>
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-red-600 mt-6 shadow-[0_0_20px_rgba(255,0,0,0.2)]">
            <div class="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-red-500 text-xs sm:text-sm uppercase tracking-widest font-black">🚨 RESET GENERAL DE FÁBRICA (2400 €v · 18 Entregables)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Inicialización limpia de toda la simulación para un nuevo arranque oficial del curso.</p>
                </div>
                <span class="bg-red-950/80 border border-red-500 text-red-400 px-3 py-1 text-xs font-black uppercase">ACCIÓN DESTRUCTIVA PROTEGIDA</span>
            </div>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">
                Restaura todas las startups al estado base de inicio: <strong>2400.00 €v de tesorería</strong>, libro mayor limpio, 18 entregables reseteados a pendiente, 0 multas, 0 transferencias, 0 mociones, catálogo por defecto y telemetría purgada. Fuerza recarga sincronizada en los navegadores conectados. <strong>Conserva intactas las empresas, sus nombres, códigos de acceso, PINs de roles y docentes.</strong>
            </p>
            <div class="bg-red-950/40 border border-red-600/40 p-4 mb-4 text-xs font-mono text-red-300 space-y-1">
                <p>⚠️ Requiere clave de autorización docente maestra y confirmación doble.</p>
                <p>🔒 Incrementa la versión de sincronización en servidor (+50) para forzar replicación inmediata.</p>
            </div>
            <button type="button" onclick="ui.promptFactoryResetLaunch()" class="min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-red-400">
                [ 🚨 INICIALIZAR RESET GENERAL DE FÁBRICA ]
            </button>
        </div>`;
    },

    saveDeadlines() {
        const fields = ['technicalReport', 'brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'investorDossier', 'balanceSheet'];
        state.data.config.deadlines = state.data.config.deadlines || {};
        state.data.config.deliverableSchedule = state.data.config.deliverableSchedule || {};
        
        const now = Date.now();
        fields.forEach(f => {
            const el = document.getElementById(`dl-${f}`);
            if (el) {
                state.data.config.deadlines[f] = el.value;
                state.data.config.deliverableSchedule[f] = {
                    ...(state.data.config.deliverableSchedule[f] || {}),
                    deadline: el.value,
                    updatedAt: now
                };
            }
        });
        state.data.config.updatedAt = now;

        state.save();
        this.notify("Plazos institucionales actualizados.", "success");
        this.render();
    },

    updateSuggestionStatus(suggId, newStatus) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        const s = state.data.suggestionsToAlex.find(x => x.id === suggId);
        if (s) {
            s.status = newStatus;
            state.save();
            this.render();
        }
    },

    deleteSuggestion(suggId) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.deletedSuggestionIds = state.data.deletedSuggestionIds || [];
        if (suggId && !state.data.deletedSuggestionIds.includes(String(suggId))) {
            state.data.deletedSuggestionIds.push(String(suggId));
        }
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(x => String(x.id) !== String(suggId));
        state.save();
        this.render();
    },

    purgeResolvedSuggestions() {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.deletedSuggestionIds = state.data.deletedSuggestionIds || [];
        const isResolvedStatus = (s) => s.status === 'IMPLEMENTADO' || s.status === 'RESUELTO' || s.resolved === true;
        const now = Date.now();
        const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
        const isOlderThan7Days = (s) => {
            const time = s.timestamp || (s.date ? new Date(s.date).getTime() : 0);
            return time > 0 && (now - time) > SEVEN_DAYS_MS;
        };

        const toPurge = state.data.suggestionsToAlex.filter(s => isResolvedStatus(s) || isOlderThan7Days(s));
        if (toPurge.length === 0) {
            return this.notify("No hay mensajes resueltos o con más de 7 días para purgar.", "info");
        }

        toPurge.forEach(s => {
            if (s && s.id && !state.data.deletedSuggestionIds.includes(String(s.id))) {
                state.data.deletedSuggestionIds.push(String(s.id));
            }
        });

        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(s => !isResolvedStatus(s) && !isOlderThan7Days(s));
        state.save();
        this.notify(`🗑️ Se han purgado permanentemente ${toPurge.length} mensajes del buzón.`, "success");
        this.render();
    },

    downloadFile(content, type, filename) {
        const blob = new Blob([content], { type: type === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    downloadStateJSON() {
        const jsonStr = JSON.stringify(state.data, null, 2);
        this.downloadFile(jsonStr, 'json', `marsket_backup_${new Date().toISOString().split('T')[0]}.json`);
    },

    async forceCloudBackup(type) {
        this.confirmAction(
            `Backup Cloud (${type === 'weekly' ? 'Semanal Inmutable' : 'Diario Sobreescribible'})`,
            `¿Deseas generar un backup ${type === 'weekly' ? 'Semanal Inmutable' : 'Diario Sobreescribible'} en Cloudflare D1?`,
            async () => {
                try {
                    const res = await fetch('/api/state', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'force_backup', type: type })
                    });
                    if(res.ok) this.notify(`Backup ${type} generado con éxito en Cloudflare D1.`, "success");
                    else this.notify("Error al generar el backup en el servidor.", "error");
                } catch(e) {
                    this.notify("Error de conexión al generar el backup.", "error");
                }
            },
            "Generar Backup"
        );
    },

    restoreStateFromJSON() {
        const fileInput = document.getElementById('restore-json-file');
        if (!fileInput || !fileInput.files.length) return this.notify("Selecciona un archivo JSON válido primero.", "warning");

        this.confirmAction(
            "Restauración de Emergencia",
            "⚠ CUIDADO: Vas a SOBREESCRIBIR toda la base de datos de MARS-KET con los datos de este archivo. Esta acción no se puede deshacer. ¿Proceder?",
            () => {
                const reader = new FileReader();
                reader.onload = async (e) => {
                    try {
                        const parsedData = JSON.parse(e.target.result);
                        if (!parsedData.companies || !parsedData.config) throw new Error("El archivo JSON no tiene la estructura válida de MARS-KET.");
                        
                        state.data = state.migrate(parsedData);
                        state.data.version = (Number(state.data.version) || 1) + 50; 
                        state.saveLocalOnly();
                        
                        await fetch('/api/state', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(state.data)
                        });
                        
                        this.notify("Restauración completada. La base de datos D1 y el almacenamiento local han vuelto al estado del backup.", "success");
                        location.reload(true);
                    } catch(err) {
                        this.notify("Error al leer o restaurar el archivo JSON: " + err.message, "error");
                    }
                };
                reader.readAsText(fileInput.files[0]);
            },
            "Ejecutar Rollback"
        );
    },

    promptFactoryResetLaunch() {
        if (!state.user || !state.user.role.startsWith('COORD')) {
            this.notify("Acceso restringido: Solo Coordinación Docente puede ejecutar el reset de fábrica.", "error");
            return;
        }
        const html = `
            <div class="space-y-4">
                <div class="bg-red-950/60 border border-red-500 p-4 text-center">
                    <p class="text-red-400 font-orbitron font-black text-sm uppercase tracking-wider mb-1">ATENCIÓN: REINICIO A CONDICIONES DE FÁBRICA</p>
                    <p class="text-xs text-slate-300 uppercase">Esta acción reiniciará balances a 2400 €v y borrará transacciones, pedidos y entregables de todas las empresas. Se mantendrán los nombres, códigos y PINs.</p>
                </div>
                <div>
                    <label for="factory-reset-key" class="text-xs text-mars-yellow uppercase font-bold block mb-1.5">Introduce la Clave Maestra de Autorización:</label>
                    <input type="password" id="factory-reset-key" autocomplete="off" placeholder="••••••••" class="min-h-[44px] w-full bg-slate-900 border border-red-500 p-3 text-center font-orbitron font-black text-sm text-white tracking-widest outline-none focus:border-mars-yellow" onkeydown="if(event.key==='Enter') ui.verifyAndConfirmFactoryReset()">
                </div>
            </div>
        `;
        const actions = `
            <button onclick="ui.verifyAndConfirmFactoryReset()" class="min-h-[44px] bg-red-600 text-white font-black px-5 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all border border-red-500">[ PROCEDER AL RESET ]</button>
            <button onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-300 font-bold px-4 py-2 text-xs uppercase hover:bg-slate-700 transition-all">Cancelar</button>
        `;
        this.showModal("CONFIRMACIÓN DE RESET PRE-LANZAMIENTO", html, actions);
        setTimeout(() => document.getElementById('factory-reset-key')?.focus(), 50);
    },

    verifyAndConfirmFactoryReset() {
        const input = document.getElementById('factory-reset-key');
        const key = input ? input.value.trim() : '';
        if (!key) {
            this.notify("Clave de autorización requerida.", "error");
            return;
        }
        this.closeModal();
        this.confirmAction(
            "ÚLTIMA CONFIRMACIÓN CRÍTICA",
            "¿Estás absolutamente seguro de ejecutar el RESET GENERAL DE FÁBRICA? Esta acción reescribirá la base de datos D1.",
            () => this.factoryResetLaunch(key),
            "EJECUTAR RESET DE FÁBRICA"
        );
    },

    async factoryResetLaunch(providedKey = '') {
        if (!state.user || !state.user.role || !state.user.role.startsWith('COORD')) {
            this.notify("Acceso restringido.", "error");
            return;
        }
        this.notify("Enviando orden de reset de fábrica a Cloudflare D1...", "info");
        try {
            const token = state.getAuthToken(state.user, state.data);
            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                },
                body: JSON.stringify({
                    token: token,
                    code: providedKey,
                    role: state.user.role
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                this.notify(`Clave de autorización maestra INCORRECTA o denegada: ${errJson.error || res.statusText}`, "error");
                return;
            }

            try {
                localStorage.removeItem(state.storageKey);
                localStorage.removeItem('marsket_emergency_snapshot');
            } catch(e) {}

            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const bc = new BroadcastChannel('marsket_channel');
                    bc.postMessage({ type: 'MARSKET_GLOBAL_RESET', timestamp: Date.now() });
                } catch(e) {}
            }

            await state.fetchFromCloud();
            this.notify("🚀 RESET GENERAL PRE-LANZAMIENTO EJECUTADO CON ÉXITO.", "success");
            this.render();
        } catch (err) {
            console.error("Error durante el factory reset:", err);
            this.notify("Error al ejecutar el reset: " + err.message, "error");
        }
    },

    modalConfirmSimulationReset() {
        if (!state.user || !state.user.admin) return;
        const html = `
            <div class="space-y-3 font-mono text-xs">
                <div class="bg-red-950/40 border border-red-500/60 p-3 text-red-200">
                    <p class="font-bold uppercase text-red-400 mb-1">⚠️ PROTOCOLO DE RESET GLOBAL DE FÁBRICA</p>
                    <p>Esta acción ejecutará una transacción estricta en servidor (órdenes, buzón, sugerencias, 18 entregables pendientes, balances a 2400.00 €v y catálogo por defecto) y forzará la recarga en todos los clientes.</p>
                </div>
                <div>
                    <label for="reset-master-code-input" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Introduce el Código Maestro de Coordinador:</label>
                    <input type="password" id="reset-master-code-input" placeholder="Código de Coordinador..." class="w-full min-h-[44px] bg-slate-900 border border-red-500/60 p-2.5 text-base sm:text-xs text-white outline-none focus:border-red-400 font-mono">
                </div>
            </div>
        `;
        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-slate-200 px-4 py-2 text-xs font-bold uppercase hover:bg-slate-700 transition-all">Cancelar</button>
            <button type="button" onclick="ui.confirmSimulationReset()" class="min-h-[44px] bg-red-700 text-white font-black px-5 py-2.5 text-xs uppercase hover:bg-white hover:text-red-700 transition-all border border-red-500">[ ⚠️ EJECUTAR RESET TOTAL ]</button>
        `;
        this.showModal("Confirmación de Reset Global", html, actions);
    },

    async confirmSimulationReset() {
        const el = document.getElementById('reset-master-code-input');
        const code = el ? el.value.trim() : '';
        if (!code) return this.notify("Debes introducir el código maestro para autorizar el reset.", "warning");
        this.closeModal();
        await this.globalTransactionalReset(code);
    },

    async globalTransactionalReset(authorizedCode = null) {
        if (!state.user || !state.user.admin) return;
        const cu = (typeof currentUser !== 'undefined' ? currentUser : null) || state.currentUser || state.user;
        const r = String(cu?.role || '').toLowerCase();
        if (cu?.role !== 'coordinador' && r !== 'coordinador' && !r.includes('coord') && !cu?.admin) {
            return this.notify("Operación reservada exclusivamente para el rol de Coordinador.", "error");
        }

        if (!authorizedCode) {
            return this.modalConfirmSimulationReset();
        }

        const inputCode = authorizedCode;

        this.notify("Ejecutando transacción D1 estricta de reset global...", "info");

        try {
            const token = state.getAuthToken(state.user, state.data);
            const res = await fetch('/api/admin/reset', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Marsket-Auth': token
                },
                body: JSON.stringify({
                    token: token,
                    code: inputCode.trim(),
                    role: state.user.role
                })
            });

            if (!res.ok) {
                const errJson = await res.json().catch(() => ({}));
                return this.notify(`Error en el reset D1: ${errJson.error || res.statusText}`, "error");
            }

            // En el cliente: Vaciar localStorage selectivo (preservando sesión del coordinador)
            try {
                localStorage.removeItem(state.storageKey);
                localStorage.removeItem('marsket_emergency_snapshot');
            } catch(e) {}

            // Forzar recarga de estado en todos los clientes mediante broadcast
            if (typeof BroadcastChannel !== 'undefined') {
                try {
                    const bc = new BroadcastChannel('marsket_channel');
                    bc.postMessage({ type: 'MARSKET_GLOBAL_RESET', timestamp: Date.now() });
                } catch(e) {}
            }

            await state.fetchFromCloud();
            this.notify("✅ Protocolo de Reset Global Transaccional ejecutado exitosamente. Clientes sincronizados.", "success");
            this.render();
        } catch(netErr) {
            this.notify(`Excepción durante el reset: ${netErr.message}`, "error");
        }
    },

    modalModerationIncidents() {
        const incidents = state.data.securityIncidents || [];
        const rows = incidents.map((inc) => `
            <tr class="border-b border-slate-800 text-xs hover:bg-slate-900/60 transition-colors">
                <td class="p-2.5 font-mono text-slate-400 whitespace-nowrap">${this.escapeHTML(inc.date || inc.timestamp || '--')}</td>
                <td class="p-2.5 font-bold text-mars-yellow uppercase">${this.escapeHTML(inc.team_id || inc.coId || 'AEE')}</td>
                <td class="p-2.5 text-mars-cyan font-mono uppercase">${this.escapeHTML(inc.student_alias || inc.role || 'ESTUDIANTE')}</td>
                <td class="p-2.5">
                    <span class="bg-[#FF0055]/20 text-[#FF0055] border border-[#FF0055]/50 px-2 py-0.5 font-mono font-black text-[11px] uppercase">${this.escapeHTML(inc.matched_term || inc.word || 'INFRACCIÓN')}</span>
                </td>
                <td class="p-2.5 text-slate-300 break-words font-mono text-[11px] max-w-xs">
                    "${this.escapeHTML(inc.offending_text || inc.text || '--')}"
                </td>
            </tr>
        `).join('') || `<tr><td colspan="5" class="p-6 text-center text-slate-400 italic">No se han registrado infracciones léxicas en la telemetría pedagógica.</td></tr>`;

        const body = `
        <div class="space-y-4 font-mono text-xs">
            <div class="bg-slate-950 border border-[#FF0055]/60 p-3 text-slate-200 flex justify-between items-center flex-wrap gap-2">
                <div>
                    <p class="text-[#FF0055] font-orbitron font-black uppercase text-xs">TELEMETRÍA PEDAGÓGICA // REGISTRO DE INFRACCIONES LÉXICAS</p>
                    <p class="text-xs text-slate-300">Auditoría en tiempo real de transgresiones LOPD y filtros de lenguaje de aula.</p>
                </div>
                <span class="bg-[#FF0055] text-white px-2.5 py-1 text-xs font-black uppercase tracking-wider font-mono">${incidents.length} INCIDENTES</span>
            </div>
            <div class="overflow-x-auto max-h-[60vh] border border-slate-800">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-slate-900 text-slate-400 text-[10px] uppercase font-bold tracking-wider sticky top-0">
                        <tr>
                            <th class="p-2.5 border-b border-slate-700">FECHA / HORA</th>
                            <th class="p-2.5 border-b border-slate-700">STARTUP / EQUIPO</th>
                            <th class="p-2.5 border-b border-slate-700">ROL / ALIAS</th>
                            <th class="p-2.5 border-b border-slate-700">TÉRMINO DETECTADO</th>
                            <th class="p-2.5 border-b border-slate-700">TEXTO INTERCEPTADO</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows}
                    </tbody>
                </table>
            </div>
        </div>`;

        const actions = `
            <button type="button" onclick="ui.closeModal()" class="min-h-[44px] bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase hover:bg-white hover:text-black transition-all">Cerrar</button>
        `;
        this.showModal("REGISTRO DE INFRACCIONES LÉXICAS", body, actions);
    },

    renderAdminLaunchLicensePanel() {
        const activeFilter = this.currentClassFilter || 'ALL';
        const companies = state.data.companies || {};
        const pendingCos = Object.keys(companies).filter(cid => {
            const co = companies[cid];
            if (!co || !co.launchLicense || co.launchLicense.status !== 'PENDIENTE_DOCENTE') return false;
            if (activeFilter !== 'ALL' && (co.classGroup || 'A') !== activeFilter) return false;
            return true;
        });

        if (pendingCos.length === 0) return '';

        return `
        <div class="terminal-border bg-mars-card p-5 border-t-4 border-t-mars-yellow mb-6 shadow-[0_0_15px_rgba(255,204,0,0.15)]">
            <div class="flex justify-between items-center mb-3 flex-wrap gap-2 border-b border-mars-border pb-2">
                <div>
                    <h3 class="font-orbitron text-mars-yellow text-sm sm:text-base uppercase tracking-tight font-black flex items-center gap-2">
                        <span>🚀 Licencias de Lanzamiento AESA Pendientes de Validación (Fase II)</span>
                    </h3>
                    <p class="text-xs text-slate-300 mt-0.5">Startups con solicitud formal DOC_14 tramitada y tasa de 50 €v abonada. Valida para autorizar vuelos en el banco de pruebas.</p>
                </div>
                <span class="bg-mars-yellow text-black px-2.5 py-1 text-xs font-black uppercase font-mono animate-pulse">${pendingCos.length} PENDIENTES</span>
            </div>
            <div class="space-y-3">
                ${pendingCos.map(cid => {
                    const co = companies[cid];
                    const lic = co.launchLicense;
                    const paidTotal = Number(lic.feePaid || 50);
                    const resubCount = Number(lic.resubmissionCount || 0);
                    return `
                    <div class="bg-slate-900 border border-amber-500/50 p-4 rounded flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div class="min-w-0 flex-grow">
                            <div class="flex items-center gap-2 mb-1 flex-wrap">
                                <span class="text-sm font-black text-white uppercase">${this.escapeHTML(co.name)}</span>
                                <span class="text-xs text-slate-400 font-mono">[CLASE ${this.escapeHTML(co.classGroup || 'A')}]</span>
                                <span class="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/40 border border-emerald-500/40 px-2 py-0.5">${paidTotal} €v Abonados${resubCount > 0 ? ` • Subsanación #${resubCount}` : ''}</span>
                            </div>
                            <p class="text-xs text-slate-300 font-mono">Firmado por: <strong>${this.escapeHTML(lic.signedBy || 'CEO')}</strong> • Fecha: ${this.escapeHTML(lic.appliedDate || '--')}</p>
                            <div class="mt-2.5">
                                ${lic.driveUrl ? `
                                    <a href="${encodeURI(lic.driveUrl).replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" class="min-h-[44px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-500/50 rounded font-mono hover:bg-cyan-900/70 transition-colors">
                                        <span>📄 Abrir Solicitud Oficial DOC_14 en Google Docs ↗</span>
                                    </a>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                            <button type="button" onclick="ui.approveLaunchLicense('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-green text-black font-black uppercase text-xs px-4 py-2 hover:bg-white transition-all shadow-[0_0_10px_rgba(0,255,102,0.3)]">[ ✓ VALIDAR LICENCIA Y DESBLOQUEAR VUELOS ]</button>
                            <button type="button" onclick="ui.modalRejectLaunchLicense('${this.escapeHTML(cid)}')" class="min-h-[44px] bg-mars-magenta/20 border border-mars-magenta text-mars-magenta font-black uppercase text-xs px-4 py-2 hover:bg-mars-magenta hover:text-white transition-all">[ ❌ DENEGAR ]</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
    },

    approveLaunchLicense(coId, skipReadCheck = false) {
        if (!state.user || !state.user.admin) return;
        const co = state.data.companies?.[coId];
        if (!co || !co.launchLicense) return;
        if (!skipReadCheck && typeof ui.confirmDocOpenedBeforeAction === 'function') {
            return ui.confirmDocOpenedBeforeAction(co.launchLicense.driveUrl, () => this.approveLaunchLicense(coId, true), 'Sí, Validar Licencia AESA');
        }

        const teacherObj = state.data?.config?.teachers?.[state.user.role];
        co.launchLicense.status = 'APROBADA';
        co.launchLicense.approvedAt = Date.now();
        co.launchLicense.validatedBy = teacherObj?.name || state.user.role || 'Coordinación';
        co.updatedAt = Date.now();

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        ui.pushNotification(coId, 'ALL', '🚀 ¡Licencia de Lanzamiento AESA aprobada por Coordinación Docente! El banco de pruebas de vuelo ha quedado desbloqueado.', 'success', { view: 'resolutions', anchorId: 'aesa-license-tramite-panel' });
        this.notify(`✅ Licencia AESA aprobada para "${co.name}". Banco de pruebas desbloqueado.`, "success");
        this.render();
    },

    modalRejectLaunchLicense(coId) {
        if (!state.user || !state.user.admin) return;
        const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
        const reasons = [
            "Protocolos de seguridad física en zona de lanzamiento incompletos",
            "Cálculos estequiométricos de propelente o proporciones de masa no coherentes",
            "El enlace de Google Drive no cuenta con permisos de lectura abiertos",
            "Fuselaje o materiales no conformes a las directrices de la misión AEE",
            "Requiere subsanación técnica y nueva justificación por el CEO"
        ];
        const reasonOptions = reasons.map(r => `<option value="${this.escapeHTML(r)}">${this.escapeHTML(r)}</option>`).join('');

        const html = `
            <div class="space-y-4 font-mono text-xs">
                <div class="p-3 bg-red-950/40 border border-red-500/50 text-slate-200">
                    <p class="text-red-400 font-bold uppercase mb-1">❌ Denegar Licencia de Lanzamiento AESA (Zero-Text):</p>
                    <p class="font-sans text-[11px]">Selecciona el motivo tipificado para denegar la solicitud. La empresa mantendrá el banco de pruebas bloqueado hasta su subsanación (tasa de reenvío: <strong>${resubFee} €v</strong>).</p>
                </div>
                <div>
                    <label for="reject-launch-license-reason" class="text-mars-yellow uppercase font-bold block mb-1">Motivo Tipificado de Denegación</label>
                    <select id="reject-launch-license-reason" class="w-full min-h-[44px] bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white uppercase outline-none focus:border-red-400">
                        ${reasonOptions}
                    </select>
                </div>
                <div>
                    <label for="reject-launch-license-report-url" class="text-mars-cyan uppercase font-bold block mb-1">Informe de No Admisión en Google Drive / Docs (Opcional)</label>
                    <input type="url" id="reject-launch-license-report-url" placeholder="https://docs.google.com/document/d/... o https://drive.google.com/..." class="w-full min-h-[44px] bg-slate-900 border border-mars-cyan/60 p-2.5 text-base sm:text-xs text-white outline-none focus:border-mars-cyan font-mono">
                    <p class="text-[10px] text-slate-400 mt-1 font-sans">Opcional: adjunta un documento de Google Docs/Drive detallando las deficiencias detectadas (recuerda habilitar permisos de lectura).</p>
                </div>
            </div>
        `;
        const actions = `<button type="button" onclick="ui.rejectLaunchLicense('${this.escapeHTML(coId)}')" class="min-h-[44px] bg-red-600 text-white px-5 py-2.5 text-xs font-black uppercase hover:bg-white hover:text-red-600 transition-all">[ ❌ Confirmar Denegación ]</button>`;
        this.showModal("Denegar Licencia de Lanzamiento AESA", html, actions);
    },

    rejectLaunchLicense(coId) {
        if (!state.user || !state.user.admin) return;
        const elReason = document.getElementById('reject-launch-license-reason');
        const elReportUrl = document.getElementById('reject-launch-license-report-url');
        if (!elReason) return;
        const reason = this.cleanInput(elReason.value).trim();
        const reportUrl = elReportUrl ? this.cleanInput(elReportUrl.value).trim() : '';

        if (reportUrl && typeof GOOGLE_DRIVE_REGEX !== 'undefined' && !GOOGLE_DRIVE_REGEX.test(reportUrl)) {
            return this.notify("El enlace del informe debe ser una URL válida de Google Drive / Docs (o dejarse vacío).", "error");
        }

        const co = state.data.companies?.[coId];
        if (!co || !co.launchLicense) return;

        co.launchLicense.status = 'DENEGADA';
        co.launchLicense.rejectReason = reason;
        co.launchLicense.rejectReportUrl = reportUrl;
        co.launchLicense.rejectedAt = Date.now();
        co.launchLicense.rejectedBy = state.user.name || 'Coordinación';
        co.updatedAt = Date.now();

        state.save(coId);
        if (typeof state.pushToCloud === 'function') state.pushToCloud(false);

        const resubFee = (typeof LAUNCH_LICENSE_RESUBMISSION_FEE !== 'undefined') ? LAUNCH_LICENSE_RESUBMISSION_FEE : 10;
        const reportNote = reportUrl ? ' Incluye informe adjunto en Drive.' : '';
        ui.pushNotification(coId, 'ALL', `❌ Licencia de Lanzamiento AESA denegada por Coordinación. Motivo: "${reason}".${reportNote} El CEO debe subsanar y reenviar la solicitud (tasa de subsanación: ${resubFee} €v).`, 'error', { view: 'resolutions', anchorId: 'aesa-license-tramite-panel' });
        this.closeModal();
        this.notify(`Licencia AESA denegada para "${co.name}".`, "info");
        this.render();
    }
});
