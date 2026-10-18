// js/ui-core.js
// --- MÓDULO UI CORE: ENRUTAMIENTO, HUD, BLINDAJE LÉXICO Y ONBOARDING (v1.0.18) ---

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '', evalClassFilter: 'ALL',
    _lastFocusedElement: null,
    _toastTimer: null,

    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    },

    cleanInput(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    },

    notify(message, type = 'info') {
        const cleanMsg = String(message || '').replace(/[\u200B-\u200D\uFEFF]/g, '');
        let tone = type;
        if (cleanMsg.startsWith('❌') || cleanMsg.startsWith('🚨') || cleanMsg.toLowerCase().includes('error') || cleanMsg.toLowerCase().includes('incorrecto') || cleanMsg.toLowerCase().includes('insuficientes') || cleanMsg.toLowerCase().includes('denegad') || cleanMsg.toLowerCase().includes('rechazad')) {
            tone = 'error';
        } else if (cleanMsg.startsWith('⚠️') || cleanMsg.startsWith('⏳') || cleanMsg.startsWith('⚠')) {
            tone = 'warning';
        } else if (cleanMsg.startsWith('✅') || cleanMsg.startsWith('✓')) {
            tone = 'success';
        }

        let container = document.getElementById('hud-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'hud-toast-container';
            container.className = 'fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[70] flex flex-col gap-2 pointer-events-none';
            container.setAttribute('role', 'status');
            container.setAttribute('aria-live', 'polite');
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        const borderColors = {
            info: 'border-mars-cyan bg-slate-950/95 text-mars-cyan shadow-[0_0_15px_rgba(0,240,255,0.25)]',
            success: 'border-mars-green bg-slate-950/95 text-mars-green shadow-[0_0_15px_rgba(0,255,102,0.25)]',
            warning: 'border-mars-yellow bg-slate-950/95 text-mars-yellow shadow-[0_0_15px_rgba(255,183,3,0.25)]',
            error: 'border-mars-magenta bg-slate-950/95 text-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.3)]'
        };
        toast.className = `pointer-events-auto terminal-border border-l-4 ${borderColors[tone] || borderColors.info} p-3.5 text-xs font-mono flex items-start justify-between gap-3 animate-in fade-in duration-200`;
        toast.innerHTML = `
            <div class="leading-relaxed text-white break-words flex-grow">${this.escapeHTML(cleanMsg)}</div>
            <button type="button" aria-label="Cerrar aviso" class="text-slate-300 hover:text-white font-black px-2 py-1 min-w-[32px] min-h-[32px] flex items-center justify-center shrink-0 border border-slate-700 bg-black/60" onclick="this.parentElement.remove()">✕</button>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            if (toast && toast.parentElement) toast.remove();
        }, 5000);
    },

    confirmAction(title, message, onConfirm, confirmLabel = 'Confirmar Operación', isDanger = false) {
        this._pendingConfirmFn = onConfirm;
        const btnClass = isDanger
            ? 'bg-mars-magenta text-white hover:bg-white hover:text-mars-magenta border border-mars-magenta'
            : 'bg-mars-cyan text-black hover:bg-white border border-mars-cyan';
        const body = `<p class="text-xs sm:text-sm text-slate-200 leading-relaxed">${this.escapeHTML(message)}</p>`;
        const actions = `<button type="button" onclick="ui.executeConfirmAction()" class="${btnClass} px-5 py-2.5 text-xs font-black uppercase tracking-widest transition-all min-h-[44px]">${this.escapeHTML(confirmLabel)}</button>`;
        this.showModal(title, body, actions);
    },

    executeConfirmAction() {
        const fn = this._pendingConfirmFn;
        this._pendingConfirmFn = null;
        this.closeModal();
        if (typeof fn === 'function') fn();
    },

    navigate(view) { this.current = view; this.render(); },
    
    checkLexicon(text, context = 'Actividad General') {
        if (!text) return { pass: true };
        const words = typeof FORBIDDEN_WORDS !== 'undefined' ? FORBIDDEN_WORDS : [];
        
        let normalizedInput = String(text)
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[4@]/g, 'a').replace(/3/g, 'e')
            .replace(/[1!|]/g, 'i').replace(/0/g, 'o').replace(/[5$]/g, 's')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/(.)\1+/g, '$1');

        const isNameList = ['mario', 'alex', 'alejandro', 'coordinador', 'director', 'profe', 'profesor'];
        const profanityList = words.filter(w => !isNameList.includes(w.toLowerCase()));

        for (let name of isNameList) {
            const regex = new RegExp(`\\b${name}\\b`, 'i');
            if (regex.test(normalizedInput)) {
                this.recordSecurityIncident('NAME', text, context, name);
                return { pass: false, type: 'NAME', word: name };
            }
        }

        for (let bad of profanityList) {
            const normBad = bad.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/(.)\1+/g, '$1');
            if (normalizedInput.includes(normBad)) {
                this.recordSecurityIncident('PROFANITY', text, context, bad);
                return { pass: false, type: 'PROFANITY', word: bad };
            }
        }

        return { pass: true };
    },

    recordSecurityIncident(severity, rawText, context, matchedWord) {
        if (!state.user || state.user.admin) return;
        state.data.securityIncidents = state.data.securityIncidents || [];
        state.data.securityIncidents.unshift({
            id: 'SEC-' + Date.now(),
            coId: state.user.coId,
            role: state.user.role,
            severity: severity,
            word: matchedWord,
            context: context,
            text: this.cleanInput(rawText),
            date: new Date().toLocaleString(),
            resolved: false
        });
        telemetry.log("SECURITY", `[${severity}] Interceptado en ${context}: "${matchedWord}"`);
        state.save();
    },

    hasForbiddenWords(text, context = 'Actividad General') {
        const check = this.checkLexicon(text, context);
        if (!check.pass) {
            if (check.type === 'NAME') {
                this.notify(`⚠️ AVISO LÉXICO: Se ha detectado la mención de un nombre propio ("${check.word}"). Utiliza únicamente términos departamentales o institucionales. La incidencia ha sido registrada.`, 'warning');
            } else {
                this.notify("🚨 INFRACCIÓN DISCIPLINARIA: Acción bloqueada por contener lenguaje soez o inapropiado. Se ha generado un expediente disciplinario directo en Coordinación.", 'error');
            }
            return true; 
        }
        return false;
    },

    getDeadlineStatus(dateString) {
        if(!dateString) return { text: "NO DEFINIDO", class: "bg-slate-800 text-slate-300" };
        const now = new Date();
        const dl = new Date(dateString);
        const diffHours = (dl - now) / (1000 * 60 * 60);
        if (diffHours < 0) return { text: "VENCIDO: RIESGO AEE", class: "bg-red-900 text-white animate-pulse shadow-[0_0_10px_red]" };
        if (diffHours < 24) return { text: "CRÍTICO: < 24H", class: "bg-red-600 text-white animate-pulse" };
        if (diffHours < 72) return { text: "ATENCIÓN: PRÓXIMO CIERRE", class: "bg-mars-yellow text-black" };
        return { text: `EN PLAZO (${Math.floor(diffHours/24)}d)`, class: "bg-mars-cyan text-black" };
    },

    setupPwaBlackIcon() {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#05070f');
        if (!this._keyListenerAttached) {
            this._keyListenerAttached = true;
            document.addEventListener('keydown', (e) => {
                const modalOverlay = document.getElementById('modal-overlay');
                const onboardingOverlay = document.getElementById('onboarding-overlay');
                const isModalOpen = modalOverlay && !modalOverlay.classList.contains('hidden');
                const isOnboardingOpen = onboardingOverlay && !onboardingOverlay.classList.contains('hidden');

                if (e.key === 'Escape') {
                    if (isModalOpen) { e.preventDefault(); this.closeModal(); return; }
                    if (isOnboardingOpen) { e.preventDefault(); this.closeOnboarding(); return; }
                }

                if (e.key === 'Tab' && (isModalOpen || isOnboardingOpen)) {
                    const activeOverlay = isModalOpen ? modalOverlay : onboardingOverlay;
                    const focusable = Array.from(activeOverlay.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(el => el.offsetParent !== null);
                    if (focusable.length > 0) {
                        const first = focusable[0];
                        const last = focusable[focusable.length - 1];
                        if (e.shiftKey && document.activeElement === first) {
                            e.preventDefault();
                            last.focus();
                        } else if (!e.shiftKey && document.activeElement === last) {
                            e.preventDefault();
                            first.focus();
                        }
                    }
                }

                // Physical keyboard support for PIN keypad on Login Step 2
                if (!state.user && typeof auth !== 'undefined' && auth.verifiedCoId && !isModalOpen && !isOnboardingOpen) {
                    const activeTag = document.activeElement ? document.activeElement.tagName : '';
                    if (activeTag !== 'INPUT' && activeTag !== 'TEXTAREA') {
                        if (/^[0-9]$/.test(e.key)) {
                            e.preventDefault();
                            auth.press(e.key);
                        } else if (e.key === 'Backspace' || e.key === 'Delete') {
                            e.preventDefault();
                            auth.clear();
                        } else if (e.key === 'Enter' && state.pin.length === 4) {
                            e.preventDefault();
                            auth.verify();
                        }
                    }
                }
            });
        }
    },

    pushNotification(coId, targetRole, message, type = 'info') {
        const co = state.data.companies[coId];
        if (!co) return;
        
        co.notifications = co.notifications || [];
        co.notifications.unshift({
            id: 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 3),
            role: targetRole,
            message: message,
            type: type,
            date: new Date().toLocaleString(),
            read: false
        });
        
        if (co.notifications.length > 50) co.notifications.pop();
        state.save();
    },

    renderWorkflowTracker(steps, currentIndex) {
        if (!steps || !steps.length) return '';
        let html = `<div class="flex items-center justify-between w-full relative mb-6 mt-4 px-2 sm:px-4" role="list" aria-label="Progreso del flujo operativo">`;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0"></div>`;
        const activeWidth = currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-mars-green z-0 transition-all duration-500" style="width: ${activeWidth}%"></div>`;
        
        steps.forEach((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const colorClass = isCompleted ? 'bg-mars-green text-black border-mars-green shadow-[0_0_10px_#00ff66]' : 'bg-slate-900 text-slate-300 border-slate-700';
            const textClass = isCompleted ? 'text-mars-green font-bold' : 'text-slate-300';
            html += `
            <div role="listitem" class="relative z-10 flex flex-col items-center gap-2">
                <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center text-xs font-black transition-all duration-300 ${colorClass}">
                    ${isCompleted ? '✓' : idx + 1}
                </div>
                <span class="text-xs uppercase tracking-wider text-center w-20 sm:w-24 leading-tight ${textClass}">${this.escapeHTML(step)}</span>
            </div>`;
        });
        html += `</div>`;
        return html;
    },

    showWelcomeModal() {
        if (sessionStorage.getItem('hideWelcome')) return;
        this._lastFocusedElement = document.activeElement;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        const elTitle = document.getElementById('onboarding-title');
        if(elTitle) elTitle.innerText = `ORDEN DE OPERACIONES: ${role.replace('_',' ')} 🚀`;
        
        let content = `<div class="space-y-4 font-mono text-xs sm:text-sm leading-relaxed">`;
        
        switch(role) {
            case 'CEO': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Dirección General (CEO) — Liderazgo Estratégico</p>
                    <p class="text-slate-200 text-xs mt-1">Tu misión principal es garantizar el cumplimiento estricto de los plazos, coordinar los departamentos y mantener la cohesión operativa de la startup.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Cronograma Maestro (19 Entregables):</strong> Monitoriza en tiempo real el semáforo temporal de las 6 asignaturas (FYQ, LYE, ECO, MAT, LEN, ING) y anticípate a cierres de plazo.</li>
                        <li><strong class="text-white">Bóveda de Órdenes:</strong> Supervisa el estado de las adquisiciones de I+D y campañas de Marketing aprobadas por Finanzas.</li>
                        <li><strong class="text-white">Gabinete de Crisis AEE:</strong> Redacta y publica el Comunicado Oficial de Mitigación ante sanciones o multas regulatorias.</li>
                        <li><strong class="text-white">Gobernanza y Voto de Calidad:</strong> Convoca mociones asamblearias, dirime empates técnicos con tu voto de calidad y gestiona el Buzón HR.</li>
                        <li><strong class="text-white">Registro Mercantil y RR.HH.:</strong> Solicita formalmente a Coordinación el cambio de <strong>Denominación Social</strong> de la empresa y gestiona el alta del <strong>Rol Observador (Auxiliar)</strong>.</li>
                    </ul>
                </div>`; 
                break;
            case 'TECNICO': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Departamento Técnico (I+D e Ingeniería) 🧪</p>
                    <p class="text-slate-200 text-xs mt-1">Responsable del diseño aeroespacial del cohete, estequiometría química del propulsor y cálculo trigonométrico de apogeo.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Aprovisionamiento (SUPERMARS-KET):</strong> Añade piezas al borrador técnico y tramita órdenes hacia Finanzas con justificación técnica obligatoria (auditada por el filtro léxico).</li>
                        <li><strong class="text-white">Mercado Secundario (B2B):</strong> Pon a la venta componentes sobrantes de tu inventario y adquiere piezas de otras startups previa autorización en la Aduana Docente.</li>
                        <li><strong class="text-white">Banco de Pruebas y BOM:</strong> Registra ensayos de vuelo midiendo el apogeo en <strong>milímetros (mm)</strong> para calcular la eficiencia (E = mm/€v) y configura el escandallo final (BOM).</li>
                        <li><strong class="text-white">Entregables Científicos (Enlaces Cloud):</strong> Sube los enlaces Drive de <strong>Física y Química (25%)</strong> (Informe Preliminar Dic e Informe Final Abr) y los 4 informes de <strong>Matemáticas (5%)</strong> (Goniómetro, Distancia Conocida, Dos Puntos e Informe Final).</li>
                    </ul>
                </div>`; 
                break;
            case 'FINANZAS': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Departamento Financiero (CFO) 💰</p>
                    <p class="text-slate-200 text-xs mt-1">Guardián de la viabilidad económica, auditoría de compras, control del capital virtual (2400 €v iniciales) y contabilidad analítica.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Autorización Presupuestaria:</strong> Audita, aprueba o rechaza en la Bóveda de Órdenes las solicitudes de componentes de I+D y los paquetes publicitarios de Marketing.</li>
                        <li><strong class="text-white">Libro Mayor (Ledger Inmutable):</strong> Supervisa todos los asientos contables: compras, ingresos por patrocinio, retenciones B2B y deducciones por multas AEE.</li>
                        <li><strong class="text-white">Control de Coste Físico:</strong> Contrasta la inversión virtual (€v) con el gasto real en euros físicos (€) reportado por Logística en taller.</li>
                        <li><strong class="text-white">Entregables de Economía (10% - Cloud):</strong> Gestiona y entrega los enlaces Drive/Sheets de los 4 documentos oficiales: <em>Presupuesto Inicial</em>, <em>Cuenta de Resultados</em>, <em>Presupuesto Post-Prototipo</em> y <em>Balance de Situación</em>.</li>
                    </ul>
                </div>`; 
                break;
            case 'MARKETING': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Departamento de Marketing y Comunicación (CMO) 🎨</p>
                    <p class="text-slate-200 text-xs mt-1">Responsable de la identidad corporativa, estrategia comercial, narrativa persuasiva y captación de patrocinio.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Aduana de Identidad Corporativa:</strong> Diseña y somete a validación docente el logotipo y eslogan oficial de la startup.</li>
                        <li><strong class="text-white">Campañas y Paquetes Publicitarios:</strong> Solicita presupuesto a Finanzas para contratar paquetes de medios (Satélite, Tradicional, Híbrido o Supernova) y registra evidencias de cada acción.</li>
                        <li><strong class="text-white">Entregables de LyE, Lengua e Inglés (Cloud):</strong> Sube los enlaces Drive de <strong>LyE (40%)</strong> (Identidad Dic/Abr, Business Model Escrito y Canvas), <strong>Lengua (15%)</strong> (Dossier Argumentativo de Inversores) e <strong>Inglés (5%)</strong> (Presentación Oral y Redacciones).</li>
                    </ul>
                </div>`; 
                break;
            case 'OPERACIONES_IA': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Departamento de Operaciones, Logística e IA (COO) 📦🤖</p>
                    <p class="text-slate-200 text-xs mt-1">Enlace entre el simulador virtual y el taller de fabricación física, aprovisionamiento real y auditoría ética de Inteligencia Artificial.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Logística y Recepción Física:</strong> Valida la entrada en taller de los pedidos aprobados por Finanzas, registrando el comercio real y el coste físico en euros (€).</li>
                        <li><strong class="text-white">Auditoría y Bitácora IA:</strong> Declara y audita todos los prompts utilizados por el equipo, exigiendo la verificación humana crítica antes de cerrarlos.</li>
                        <li><strong class="text-white">Entregables Operativos (Cloud):</strong> Coordina y sube los enlaces Drive del <strong>Diario de Decisiones, Conflictos e IA</strong> correspondientes a las entregas de Diciembre y Abril (LyE).</li>
                    </ul>
                </div>`; 
                break;
            case 'AUXILIAR': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Observador Auxiliar (Apoyo Departamental) 👁️</p>
                    <p class="text-slate-200 text-xs mt-1">Miembro táctico adscrito a un departamento específico para refuerzo operativo y participación en la gobernanza.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Veeduría Departamental:</strong> Acceso directo a la ventana de trabajo del departamento al que te ha vinculado el CEO.</li>
                        <li><strong class="text-white">Gobernanza Activa:</strong> Derecho pleno a proponer mociones y votar en las decisiones colegiadas de la asamblea.</li>
                        <li><strong class="text-white">Auditoría de Dossier y Catálogo:</strong> Seguimiento en tiempo real de los 19 entregables y precios del mercado.</li>
                    </ul>
                </div>`; 
                break;
            case 'DOCENTE': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs sm:text-sm">Alto Mando Docente y Coordinación 🎖️</p>
                    <p class="text-slate-200 text-xs mt-1">Control integral del ecosistema académico, evaluación continua ponderada (100%), aduanas y régimen disciplinario.</p>
                </div>
                <div class="space-y-2 text-xs text-slate-200">
                    <p class="text-mars-yellow font-bold uppercase text-xs border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Evaluación Curricular (100%):</strong> Calificación por rúbricas granulares y generación automática del Acta Ponderada oficial.</li>
                        <li><strong class="text-white">Monitor de Alertas Léxicas:</strong> Recepción discriminada de incidencias: <span class="text-mars-yellow">Avisos Amarillos</span> por uso de nombres propios e <span class="text-red-400">Infracciones Rojas</span> por lenguaje soez con acceso directo a sanción AEE.</li>
                        <li><strong class="text-white">Aduanas y Registro Mercantil:</strong> Aprobación de traspasos B2B, validación de Logos/Eslóganes, alta de Roles Auxiliares y autorización o edición directa de cambios de <strong>Denominación Social</strong>.</li>
                        <li><strong class="text-white">Llavero Maestro y Backups D1:</strong> Gestión de códigos de empresa, PINs cifrados y copias de seguridad en Cloudflare D1.</li>
                    </ul>
                </div>`; 
                break;
        }
        content += `
        <div class="bg-slate-900 border border-slate-700 p-3 text-xs text-slate-300 uppercase mt-2">
            🛡️ <strong class="text-mars-yellow">Norma de Seguridad Activa:</strong> Todos los formularios están protegidos por el Filtro Léxico Universal. Queda prohibido introducir nombres propios o lenguaje ofensivo.
        </div>
        </div>`;

        const elBody = document.getElementById('onboarding-body');
        if(elBody) elBody.innerHTML = content;
        
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) {
            elOverlay.classList.remove('hidden');
            setTimeout(() => {
                const btn = elOverlay.querySelector('button');
                if (btn) btn.focus();
            }, 50);
        }
    },

    closeOnboarding() {
        const elSkip = document.getElementById('skip-onboarding');
        if(elSkip && elSkip.checked) {
            sessionStorage.setItem('hideWelcome', 'true');
        }
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) elOverlay.classList.add('hidden');
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
        }
    },

    modalChangelog() {
        const logs = typeof APP_CHANGELOG !== 'undefined' ? APP_CHANGELOG : [];
        let html = `<div class="space-y-6 font-mono text-xs">`;
        
        if (logs.length === 0) {
            html += `<p class="text-slate-300 italic">No hay registros de versión disponibles.</p>`;
        } else {
            logs.forEach(log => {
                const itemsHtml = (log.highlights || []).map(h => {
                    let badgeClass = 'bg-mars-cyan/20 text-mars-cyan border-mars-cyan';
                    if (h.type === 'NUEVO') badgeClass = 'bg-mars-green/20 text-mars-green border-mars-green';
                    if (h.type === 'MEJORA') badgeClass = 'bg-mars-yellow/20 text-mars-yellow border-mars-yellow';
                    if (h.type === 'FIX') badgeClass = 'bg-mars-magenta/20 text-mars-magenta border-mars-magenta';
                    if (h.type === 'SISTEMA') badgeClass = 'bg-blue-500/20 text-blue-400 border-blue-500';
                    
                    return `
                    <li class="flex items-start gap-2.5 pb-2 border-b border-slate-800/80 last:border-0">
                        <span class="text-xs font-black uppercase px-1.5 py-0.5 border shrink-0 mt-0.5 ${badgeClass}">${this.escapeHTML(h.type)}</span>
                        <span class="text-slate-200 text-xs leading-relaxed">${this.escapeHTML(h.text)}</span>
                    </li>`;
                }).join('');

                html += `
                <div class="bg-slate-900/90 border border-mars-border p-4">
                    <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-3">
                        <div>
                            <span class="text-mars-green font-orbitron font-black text-sm">v${this.escapeHTML(log.version)}</span>
                            <h4 class="text-white font-bold uppercase text-xs mt-0.5">${this.escapeHTML(log.title)}</h4>
                        </div>
                        <span class="text-xs text-slate-300 bg-black px-2 py-1 border border-slate-800">${this.escapeHTML(log.date)}</span>
                    </div>
                    <ul class="space-y-2">
                        ${itemsHtml}
                    </ul>
                </div>`;
            });
        }
        html += `</div>`;
        this.showModal("Registro de Novedades y Versiones", html, "");
    },

    showGuide() {
        const html = `
        <div class="space-y-4 font-mono text-xs leading-relaxed text-slate-200">
            <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                <p class="text-mars-cyan font-black uppercase text-xs">Manual Táctico MARS-KET 2.0</p>
                <p class="mt-1">Plataforma oficial de simulación aeroespacial interdisciplinar (AEE / ESA). Cada rol dispone de atribuciones y pestañas priorizadas según su responsabilidad diaria.</p>
            </div>
            <ul class="list-disc pl-5 space-y-2">
                <li><strong class="text-mars-yellow">Flujo de Compras (I+D → Finanzas → Logística):</strong> El Dpto. Técnico añade piezas al borrador, Finanzas autoriza el presupuesto en la Bóveda de Órdenes y Operaciones ejecuta el ensamblaje físico registrando el coste real en taller.</li>
                <li><strong class="text-mars-cyan">Repositorio Oficial (19 Entregables):</strong> Todos los informes se entregan mediante enlaces externos verificables (Google Drive, OneDrive, Canva) con permisos de lectura abiertos.</li>
                <li><strong class="text-mars-green">Gobernanza y Auditoría IA:</strong> Todo uso de IA generativa debe registrarse en la Bitácora IA con verificación humana explícita.</li>
            </ul>
            <div class="pt-2">
                <button type="button" onclick="ui.closeModal(); sessionStorage.removeItem('hideWelcome'); ui.showWelcomeModal();" class="w-full bg-mars-yellow text-black font-black py-2.5 px-4 text-xs uppercase tracking-widest hover:bg-white transition-all min-h-[44px]">Ver Manual Completo de mi Rol</button>
            </div>
        </div>`;
        this.showModal("Manual Operativo", html, "");
    },

    modalSuggestion() {
        const allSuggs = state.data.suggestionsToAlex || [];
        const myCoId = state.user ? (state.user.admin ? 'DOCENTE' : state.user.coId) : 'ANON';
        const filteredSuggs = allSuggs.filter(s => {
            if (state.user && state.user.admin) return s.coId === 'DOCENTE' || (s.author && s.author.includes('DOCENTE'));
            return s.coId === myCoId || (s.author && state.data.companies[myCoId] && s.author.includes(state.data.companies[myCoId].name));
        });

        const history = filteredSuggs.slice(0, 8).map(s => {
            const cat = s.category || 'MEJORA';
            const status = s.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            const stBadge = status === 'IMPLEMENTADO' ? 'text-mars-green' : (status === 'EN_REVISION' ? 'text-mars-yellow' : 'text-slate-300');

            return `
            <div class="border-b border-slate-800 pb-2 mb-2 last:border-0">
                <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-xs font-black uppercase px-1.5 py-0.5 border ${catBadge}">${this.escapeHTML(cat)}</span>
                        <span class="text-white font-bold uppercase text-xs">${this.escapeHTML(s.author)}</span>
                    </div>
                    <span class="text-xs font-bold uppercase ${stBadge}">[${this.escapeHTML(status)}] • ${this.escapeHTML(s.date)}</span>
                </div>
                <p class="text-slate-200 italic text-xs mt-1 pl-2 border-l-2 border-slate-700 break-words">"${this.escapeHTML(s.text)}"</p>
            </div>`;
        }).join('') || '<p class="text-slate-300 italic text-xs">No has enviado reportes desde esta entidad todavía.</p>';

        const html = `
            <p class="text-xs text-slate-300 mb-3 uppercase leading-relaxed">¿Has detectado un fallo técnico (bug), tienes una idea o una duda normativa? El reporte es privado y pasa por filtro léxico antes de llegar a Coordinación.</p>
            <div class="mb-3">
                <label for="sugg-category" class="text-xs text-mars-yellow font-bold uppercase block mb-1">Categoría del Reporte</label>
                <select id="sugg-category" class="w-full bg-slate-900 border border-mars-yellow/50 p-2.5 text-xs text-white uppercase font-bold outline-none focus:border-mars-yellow min-h-[44px]">
                    <option value="BUG">🐛 Bug / Error Técnico en la App</option>
                    <option value="MEJORA">💡 Sugerencia de Mejora / Idea</option>
                    <option value="REGLAS">⚖️ Consulta sobre Normativa / Rúbricas</option>
                </select>
            </div>
            <label for="sugg-text" class="sr-only">Descripción del reporte</label>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-xs text-white h-24 focus:border-mars-yellow outline-none mb-4" placeholder="Describe el reporte... (El uso de lenguaje ofensivo o nombres propios bloqueará el envío)"></textarea>
            <div class="bg-black/60 border border-slate-800 p-3 max-h-44 overflow-y-auto">
                <h4 class="text-mars-cyan text-xs uppercase font-bold mb-2 border-b border-slate-800 pb-1">Mis Envíos Recientes (Privado)</h4>
                ${history}
            </div>
        `;
        const actions = `<button type="button" onclick="ui.submitSuggestion()" class="bg-mars-yellow text-black px-6 py-2.5 text-xs font-black uppercase tracking-widest hover:bg-white transition-all min-h-[44px]">Transmitir a Buzón Dev</button>`;
        this.showModal("Canal Directo con Desarrollo (Buzón Alex)", html, actions);
    },

    submitSuggestion() {
        const elText = document.getElementById('sugg-text');
        const elCat = document.getElementById('sugg-category');
        if(!elText) return;
        const text = this.cleanInput(elText.value);
        const category = elCat ? elCat.value : 'MEJORA';
        if(text.length < 5) return this.notify("Describe tu reporte con más detalle (mínimo 5 caracteres).", "warning");
        if(this.hasForbiddenWords(text, 'Buzón de Sugerencias')) return;
        
        const isDocente = state.user && state.user.admin;
        const coId = state.user ? (isDocente ? 'DOCENTE' : state.user.coId) : 'ANON';
        const entityName = isDocente ? 'CLAUSTRO DOCENTE' : (state.data.companies[coId]?.name || 'STARTUP');
        const author = state.user ? `${state.user.role} (${entityName})` : 'ANÓNIMO';
        
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.suggestionsToAlex.unshift({ 
            id: 'SUG-' + Date.now(), coId: coId, category: category, status: 'RECIBIDO',
            author: author, text: text, date: new Date().toLocaleString() 
        });
        
        state.save();
        this.closeModal();
        this.notify("✅ Reporte registrado y enviado a Coordinación.", "success");
    },

    generateHeroBanner() {
        if (!state.user || state.user.admin) return '';
        const co = state.data.companies[state.user.coId];
        if (!co) { auth.logout(); return ''; }

        const isBrandPending = co.brandApproval && co.brandApproval.status === 'PENDIENTE';
        let sponsorBadge = '';
        if(co.sponsorAwarded) {
            const color = co.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10':co.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10':'text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10';
            const spName = co.sponsorData?.name ? ` - ${this.escapeHTML(co.sponsorData.name)}` : '';
            const spLogo = co.sponsorData?.logo ? `<img src="${this.escapeHTML(co.sponsorData.logo)}" alt="Logo patrocinador" class="h-4 inline-block ml-2 rounded-sm object-contain">` : '';
            sponsorBadge = `<span class="${color} border px-2 py-1 font-black shadow-[0_0_10px_currentColor] flex items-center gap-1 text-xs">[PATROCINIO ${this.escapeHTML(co.sponsorAwarded)}${spName}] ${spLogo}</span>`;
        }

        // Blindaje del Logo Global v1.0.18: Si no hay logo de startup aprobado, siempre renderizar logo.png con fallback onerror
        const hasApprovedLogo = co.logo && (!co.brandApproval || co.brandApproval.status === 'APROBADO');
        const activeLogoSrc = hasApprovedLogo ? this.escapeHTML(co.logo) : 'logo.png';
        const imgHtml = `
            <img src="${activeLogoSrc}" alt="Logo de ${this.escapeHTML(co.name)}" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full ${hasApprovedLogo ? 'object-cover' : 'object-contain p-2 bg-black'}">
            ${isBrandPending ? `<span class="absolute bottom-0 inset-x-0 bg-mars-magenta/90 text-white text-xs font-black text-center py-0.5 uppercase tracking-tighter" title="Marca en revisión">⏳</span>` : ''}
        `;

        let sloganHtml = '';
        if (isBrandPending) {
            sloganHtml = `<p class="font-orbitron text-mars-magenta font-bold text-xs mt-1.5 tracking-wider uppercase bg-mars-magenta/10 border border-mars-magenta px-2 py-0.5 inline-block animate-pulse">⚠️ MARCA EN REVISIÓN DOCENTE</p>`;
        } else if (co.slogan) {
            sloganHtml = `<p class="font-orbitron text-mars-yellow text-xs mt-1.5 tracking-wider italic break-words">"${this.escapeHTML(co.slogan)}"</p>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 sm:p-5 mb-6 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative overflow-hidden animate-in fade-in duration-500">
            <div class="w-full md:w-auto md:absolute md:top-3 md:right-3 flex justify-end gap-2">
                <button type="button" onclick="ui.modalReportAI()" class="bg-blue-600/20 border border-blue-500 text-blue-300 px-3 py-2 text-xs font-bold uppercase hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)] min-h-[44px] flex items-center justify-center">[🤖 REPORTAR USO IA]</button>
            </div>
            <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 p-0.5 hex-clip bg-mars-bg ${isBrandPending ? 'border-2 border-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'border-2 border-mars-cyan shadow-neon-cyan'}">
                <div class="w-full h-full hex-clip overflow-hidden relative">
                    ${imgHtml}
                </div>
            </div>
            <div class="flex-grow text-center md:text-left flex flex-col justify-center min-w-0 w-full md:pr-44">
                <h2 class="font-orbitron text-lg sm:text-2xl md:text-3xl font-black text-mars-cyan tracking-widest uppercase break-words leading-tight" title="${this.escapeHTML(co.name)}">${this.escapeHTML(co.name)}</h2>
                ${sloganHtml}
                <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-3 text-xs font-bold uppercase tracking-wider">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2.5 py-1 flex items-center">AUTH: ${this.escapeHTML(state.user.role.replace('_',' '))}</span>
                    <span class="bg-mars-green/10 border border-mars-green/60 text-mars-green px-2.5 py-1 flex items-center font-mono">SALDO: ${Number(co.balance).toFixed(2)} €v</span>
                    ${sponsorBadge}
                </div>
            </div>
        </div>`;
    },

    updateBadges() {
        if (!state.user || state.user.admin) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return;

        const elRes = document.getElementById('badge-resolutions');
        if (elRes) {
            const pendingMotions = (co.votingMotions || []).filter(m => m.status === 'ABIERTA' && (!m.votes || !m.votes[state.user.role])).length;
            if (pendingMotions > 0) { elRes.innerText = pendingMotions; elRes.classList.remove('hidden'); }
            else { elRes.classList.add('hidden'); }
        }

        const elOrders = document.getElementById('badge-orders');
        if (elOrders) {
            let pendingOrders = 0;
            if (state.user.role === 'FINANZAS') {
                const iDOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
                const mktOrders = (co.marketingCampaigns || []).filter(m => m.status === 'PENDIENTE_FINANZAS').length;
                pendingOrders = iDOrders + mktOrders;
            }
            if (pendingOrders > 0) { elOrders.innerText = pendingOrders; elOrders.classList.remove('hidden'); }
            else { elOrders.classList.add('hidden'); }
        }

        const elCart = document.getElementById('badge-cart');
        if (elCart) {
            const pendingLogistics = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS' && o.type !== 'MARKETING').length;
            if (pendingLogistics > 0) { elCart.innerText = pendingLogistics; elCart.classList.remove('hidden'); }
            else { elCart.classList.add('hidden'); }
        }

        const elAILog = document.getElementById('badge-ailog');
        if (elAILog) {
            const pendingAI = (co.aiPrompts || []).filter(p => p.status === 'PENDIENTE_VALIDACION').length;
            if (pendingAI > 0) { elAILog.innerText = pendingAI; elAILog.classList.remove('hidden'); }
            else { elAILog.classList.add('hidden'); }
        }
    },

    updateHUD() {
        if(!state.user) return;
        const verEl = document.getElementById('hud-version');
        if (verEl && typeof APP_VERSION !== 'undefined') verEl.innerText = `v${APP_VERSION}`;

        const balEl = document.getElementById('hud-balance');
        const infoEl = document.getElementById('hud-info');
        const cloudEl = document.getElementById('hud-cloud-status');
        const miniLogo = document.getElementById('hud-mini-logo');
        
        if (state.user.admin) {
            if(balEl) balEl.innerText = '∞ €v';
            if(infoEl) infoEl.innerText = `ENTITY: CLAUSTRO | ROLE: ${state.data.config.teachers[state.user.role]?.name.toUpperCase() || 'ROOT'}`;
            if(miniLogo) {
                miniLogo.classList.remove('hidden');
                miniLogo.innerHTML = `<img src="logo.png" alt="Logo institucional MARS-KET" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full object-contain p-0.5">`;
            }
        } else {
            const co = state.data.companies[state.user.coId];
            if(co && balEl) balEl.innerText = `${co.balance.toFixed(2)} €v`;
            if(co && infoEl) infoEl.innerText = `ENTITY: ${co.name.toUpperCase()} | ROLE: ${state.user.role.replace('_',' ')}`;
            
            if(miniLogo && co) {
                miniLogo.classList.remove('hidden');
                const hasApprovedLogo = co.logo && (!co.brandApproval || co.brandApproval.status === 'APROBADO');
                const hudLogoSrc = hasApprovedLogo ? this.escapeHTML(co.logo) : 'logo.png';
                miniLogo.innerHTML = `<img src="${hudLogoSrc}" alt="Logo startup ${this.escapeHTML(co.name)}" onerror="this.onerror=null;this.src='logo.png';" class="w-full h-full ${hasApprovedLogo ? 'object-cover' : 'object-contain p-0.5'}">`;
            }
        }

        if(cloudEl) {
            if(state.isSyncing) {
                cloudEl.className = 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-mars-cyan text-mars-cyan bg-mars-cyan/10 animate-pulse whitespace-nowrap';
                cloudEl.innerText = '[CLOUD: SYNCING]';
            } else if(state.isCloudOnline) {
                cloudEl.className = 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-mars-green/60 text-mars-green bg-mars-green/10 whitespace-nowrap';
                cloudEl.innerText = '[D1: SYNCED]';
            } else {
                cloudEl.className = 'text-xs font-bold uppercase tracking-wider px-2.5 py-1 border border-mars-yellow/60 text-mars-yellow bg-slate-900 whitespace-nowrap';
                cloudEl.innerText = '[LOCAL ONLY]';
            }
        }

        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.remove('tab-active', 'text-mars-cyan');
            t.setAttribute('aria-selected', 'false');
            const oc = t.getAttribute('onclick');
            if(oc && oc.includes(`('${this.current}')`)) {
                t.classList.add('tab-active', 'text-mars-cyan');
                t.setAttribute('aria-selected', 'true');
            }
        });

        this.updateBadges();
    },
    
    render() {
        const vp = document.getElementById('viewport');
        if(!vp) return;
        vp.innerHTML = '';
        if(!state.user) { this.viewLogin(vp); return; }
        
        if (!state.user.admin && !state.data.companies[state.user.coId]) {
            auth.logout();
            return;
        }

        const role = state.user.role;
        const co = !state.user.admin ? state.data.companies[state.user.coId] : null;

        const roleAllowedMap = {
            'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
            'TECNICO': ['tech', 'market', 'cart', 'orders', 'dossier', 'resolutions'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market', 'resolutions'],
            'MARKETING': ['brand', 'dossier', 'market', 'resolutions'],
            'OPERACIONES_IA': ['cart', 'ailog', 'dossier', 'market', 'resolutions']
        };

        let currentAllowed = [];
        if (state.user.admin) {
            currentAllowed = ['admin', 'market', 'dossier'];
            if (!currentAllowed.includes(this.current)) this.current = 'admin';
        } else if (role === 'AUXILIAR') {
            const auxDept = co?.auxRoleDept;
            const auxAllowed = {
                'CEO': ['orders', 'resolutions', 'finance', 'dossier', 'market'],
                'TECNICO': ['tech', 'market', 'cart', 'resolutions', 'dossier'],
                'FINANZAS': ['finance', 'orders', 'resolutions', 'dossier', 'market'],
                'MARKETING': ['brand', 'resolutions', 'dossier', 'market'],
                'OPERACIONES_IA': ['cart', 'ailog', 'resolutions', 'dossier', 'market']
            };
            currentAllowed = auxAllowed[auxDept] || ['resolutions', 'dossier', 'market'];
            if (!currentAllowed.includes(this.current)) this.current = currentAllowed[0];
        } else {
            currentAllowed = roleAllowedMap[role] || ['orders', 'market', 'dossier', 'resolutions'];
            if (!currentAllowed.includes(this.current)) this.current = currentAllowed[0];
        }
        
        this.updateHUD();
        const hero = this.generateHeroBanner();
        const notifs = state.user.admin ? '' : (this.renderNotifications ? this.renderNotifications() : '');
        
        switch(this.current) {
            case 'market': vp.innerHTML = hero + notifs; this.viewMarket(vp); break;
            case 'cart': vp.innerHTML = hero + notifs; this.viewCart(vp); break;
            case 'orders': vp.innerHTML = hero + notifs; this.viewOrders(vp); break;
            case 'finance': vp.innerHTML = hero + notifs; this.viewFinance(vp); break;
            case 'admin': this.viewAdmin(vp); break;
            case 'dossier': vp.innerHTML = hero + notifs; this.viewDossier(vp); break;
            case 'brand': vp.innerHTML = hero + notifs; this.viewBrand(vp); break;
            case 'ailog': vp.innerHTML = hero + notifs; this.viewAILog(vp); break;
            case 'tech': vp.innerHTML = hero + notifs; this.viewTech(vp); break;
            case 'resolutions': vp.innerHTML = hero + notifs; this.viewResolutions(vp); break;
        }
    },

    renderDocBadge(title, docObj, short=false) {
        if(!docObj) return `<div class="bg-black/60 border border-mars-border border-dashed p-3 mb-2 flex justify-between items-center gap-2 text-xs"><span class="text-slate-300 font-bold uppercase break-words">${this.escapeHTML(title)}</span><span class="text-mars-magenta font-black uppercase shrink-0">[PENDIENTE]</span></div>`;
        return `<div class="bg-mars-cyan/10 border border-mars-cyan/60 p-3 mb-2 flex justify-between items-center gap-2 text-xs">
                    <div class="overflow-hidden pr-2"><span class="text-mars-cyan font-bold uppercase block truncate">${this.escapeHTML(title)}</span><span class="text-xs text-slate-300 block truncate">ENLACE DRIVE/CLOUD | ${this.escapeHTML((docObj.date || '').slice(0,10))}</span></div>
                    <a href="${this.escapeHTML(docObj.dataUrl)}" target="_blank" rel="noopener noreferrer" class="bg-mars-cyan text-black px-3 py-2 font-bold uppercase hover:bg-white transition-colors flex-shrink-0 min-h-[44px] flex items-center">Abrir Enlace</a>
                </div>`;
    },
    
    renderDriveLinkBox(title, desc, docKey, currentDoc) {
        return `
        <div class="border-b border-slate-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 class="text-mars-cyan font-bold text-xs sm:text-sm uppercase mb-1">${this.escapeHTML(title)}</h3>
            <p class="text-xs text-slate-300 mb-2 uppercase leading-relaxed">${this.escapeHTML(desc)}</p>
            ${this.renderDocBadge(title, currentDoc)}
            <div class="bg-slate-900 border border-slate-700 p-3 mt-2">
                <label for="upload-url-${docKey}" class="text-xs text-mars-yellow font-bold uppercase block mb-2">Entregar Enlace (Google Drive, OneDrive, Canva...)</label>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="upload-url-${docKey}" placeholder="https://..." class="bg-black border border-slate-600 p-2.5 text-xs text-white flex-grow outline-none focus:border-mars-cyan min-h-[44px]">
                    <button type="button" onclick="ui.handleDeliverableLinkSubmit('${docKey}')" class="bg-mars-cyan text-black font-black uppercase text-xs px-4 py-2.5 hover:bg-white flex-shrink-0 w-full sm:w-auto min-h-[44px]">Entregar Enlace</button>
                </div>
            </div>
        </div>`;
    },

    handleDeliverableLinkSubmit(docType) {
        if (!state.user) return;
        const urlInput = document.getElementById(`upload-url-${docType}`);
        if (!urlInput) return;
        
        const url = this.cleanInput(urlInput.value);
        if(!url) return this.notify("Debe proporcionar un enlace válido (URL). La subida de archivos físicos está deshabilitada.", "warning");
        if(!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
            return this.notify("Error de formato: El enlace debe comenzar con 'http://' o 'https://'", "error");
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.deliverables = co.deliverables || {};

        co.deliverables[docType] = { 
            type: 'link', name: 'Enlace a Nube Externa', date: new Date().toLocaleString(), size: 'URL', dataUrl: url 
        };
        
        telemetry.log("ENTREGABLE", `Enlace subido a Drive: ${docType}`);
        state.save(); 
        this.render(); 
        this.notify("✅ Enlace entregado y registrado en el Dossier Oficial.", "success");
    },

    showModal(title, body, actions) {
        this._lastFocusedElement = document.activeElement;
        const elTitle = document.getElementById('modal-title');
        const elBody = document.getElementById('modal-body');
        const elActions = document.getElementById('modal-actions');
        const elOverlay = document.getElementById('modal-overlay');
        
        if(elTitle) elTitle.innerText = title; 
        if(elBody) elBody.innerHTML = body; 
        if(elActions) elActions.innerHTML = actions + `<button type="button" onclick="ui.closeModal()" class="bg-slate-800 text-white px-5 py-2.5 text-xs font-bold uppercase hover:bg-slate-700 transition-all shadow-md border border-slate-600 min-h-[44px]">Cerrar</button>`; 
        if(elOverlay) {
            elOverlay.classList.remove('hidden');
            setTimeout(() => {
                const firstFocusable = elOverlay.querySelector('input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled])');
                if (firstFocusable) firstFocusable.focus();
            }, 40);
        }
    },

    closeModal() { 
        const elOverlay = document.getElementById('modal-overlay');
        if(elOverlay) elOverlay.classList.add('hidden');
        if (this._lastFocusedElement && typeof this._lastFocusedElement.focus === 'function') {
            this._lastFocusedElement.focus();
        }
    }
};