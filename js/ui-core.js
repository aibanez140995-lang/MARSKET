// js/ui-core.js
// --- MÓDULO UI CORE: ENRUTAMIENTO, HUD, BLINDAJE LÉXICO, ONBOARDING INTEGRAL Y GUÍA (v1.0.17) ---

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '', evalClassFilter: 'ALL',
    
    navigate(view) { this.current = view; this.render(); },
    
    // FASE 4: Motor de Inspección Léxica Bifurcada (Nombres vs. Insultos)
    checkLexicon(text, context = 'Actividad General') {
        if (!text) return { pass: true };
        const words = typeof FORBIDDEN_WORDS !== 'undefined' ? FORBIDDEN_WORDS : [];
        
        // Normalización radical anti-evasión (Leetspeak y caracteres repetidos)
        let normalizedInput = text.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/[4@]/g, 'a').replace(/3/g, 'e')
            .replace(/[1!|]/g, 'i').replace(/0/g, 'o').replace(/[5$]/g, 's')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/(.)\1+/g, '$1');

        const isNameList = ['mario', 'alex', 'alejandro', 'coordinador', 'director', 'profe', 'profesor'];
        const profanityList = words.filter(w => !isNameList.includes(w.toLowerCase()));

        // 1. Detección de Nombres Propios (Búsqueda por límite de palabra exacta)
        for (let name of isNameList) {
            const regex = new RegExp(`\\b${name}\\b`, 'i');
            if (regex.test(normalizedInput)) {
                this.recordSecurityIncident('NAME', text, context, name);
                return { pass: false, type: 'NAME', word: name };
            }
        }

        // 2. Detección de Lenguaje Soez / Insultos (Búsqueda de subcadena tolerante)
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
            severity: severity, // 'NAME' o 'PROFANITY'
            word: matchedWord,
            context: context,
            text: rawText,
            date: new Date().toLocaleString(),
            resolved: false
        });
        telemetry.log("SECURITY", `[${severity}] Interceptado en ${context}: "${matchedWord}"`);
        state.save();
    },

    // Guardián Universal: Devuelve TRUE si hay palabras prohibidas y lanza el alert automáticamente
    hasForbiddenWords(text, context = 'Actividad General') {
        const check = this.checkLexicon(text, context);
        if (!check.pass) {
            if (check.type === 'NAME') {
                alert(`⚠️ AVISO LÉXICO: Se ha detectado la mención de un nombre propio ("${check.word}"). Utiliza únicamente términos departamentales o institucionales. La incidencia ha sido registrada.`);
            } else {
                alert("🚨 INFRACCIÓN DISCIPLINARIA: Acción bloqueada por contener lenguaje soez o inapropiado. Se ha generado un expediente disciplinario directo en Coordinación.");
            }
            return true; 
        }
        return false;
    },

    getDeadlineStatus(dateString) {
        if(!dateString) return { text: "NO DEFINIDO", class: "bg-slate-800 text-slate-400" };
        const now = new Date();
        const dl = new Date(dateString);
        const diffHours = (dl - now) / (1000 * 60 * 60);
        if (diffHours < 0) return { text: "VENCIDO: RIESGO AEE", class: "bg-red-900 text-white animate-pulse shadow-[0_0_10px_red]" };
        if (diffHours < 24) return { text: "CRÍTICO: < 24H", class: "bg-red-600 text-white animate-pulse" };
        if (diffHours < 72) return { text: "ATENCIÓN: PRÓXIMO CIERRE", class: "bg-yellow-500 text-black" };
        return { text: `EN PLAZO (${Math.floor(diffHours/24)}d)`, class: "bg-mars-cyan text-black" };
    },

    setupPwaBlackIcon() {
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#000000');
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
        
        let html = `<div class="flex items-center justify-between w-full relative mb-6 mt-4 px-2 sm:px-4">`;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-800 z-0"></div>`;
        
        const activeWidth = currentIndex > 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;
        html += `<div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-mars-green z-0 transition-all duration-500" style="width: ${activeWidth}%"></div>`;
        
        steps.forEach((step, idx) => {
            const isCompleted = idx <= currentIndex;
            const colorClass = isCompleted ? 'bg-mars-green text-black border-mars-green shadow-[0_0_10px_#00ff66]' : 'bg-slate-900 text-slate-500 border-slate-700';
            const textClass = isCompleted ? 'text-mars-green font-bold' : 'text-slate-500';
            
            html += `
            <div class="relative z-10 flex flex-col items-center gap-2">
                <div class="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center text-[9px] sm:text-[10px] font-black transition-all duration-300 ${colorClass}">
                    ${isCompleted ? '✓' : idx + 1}
                </div>
                <span class="text-[8px] sm:text-[9px] uppercase tracking-widest text-center w-16 sm:w-20 leading-tight ${textClass}">${step}</span>
            </div>`;
        });
        
        html += `</div>`;
        return html;
    },

    // FASE 6: Manual Operativo Integral de Puesto (Modal de Bienvenida Completo)
    showWelcomeModal() {
        if (sessionStorage.getItem('hideWelcome')) return;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        const elTitle = document.getElementById('onboarding-title');
        if(elTitle) elTitle.innerText = `ORDEN DE OPERACIONES: ${role.replace('_',' ')} 🚀`;
        
        let content = `<div class="space-y-4 font-mono text-xs leading-relaxed">`;
        
        switch(role) {
            case 'CEO': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs">Dirección General (CEO) — Liderazgo Estratégico</p>
                    <p class="text-slate-300 text-[10px] mt-1">Tu misión principal es garantizar el cumplimiento estricto de los plazos, coordinar los departamentos y mantener la cohesión operativa de la startup.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
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
                    <p class="text-mars-cyan font-black uppercase text-xs">Departamento Técnico (I+D e Ingeniería) 🧪</p>
                    <p class="text-slate-300 text-[10px] mt-1">Responsable del diseño aeroespacial del cohete, estequiometría química del propulsor y cálculo trigonométrico de apogeo.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Aprovisionamiento (SUPERMARS-KET):</strong> Añade piezas al borrador técnico y tramita órdenes hacia Finanzas con justificación técnica obligatoria (auditada por el filtro léxico).</li>
                        <li><strong class="text-white">Mercado Secundario (B2B):</strong> Pon a la venta componentes sobrantes de tu inventario y adquiere piezas de otras startups previa autorización en la Aduana Docente.</li>
                        <li><strong class="text-white">Banco de Pruebas y BOM:</strong> Registra ensayos de vuelo midiendo el apogeo en <strong>milímetros (mm)</strong> para calcular la eficiencia ($E = \\text{mm}/€\\text{v}$) y configura el escandallo final (BOM).</li>
                        <li><strong class="text-white">Entregables Científicos (Enlaces Cloud):</strong> Sube los enlaces Drive de <strong>Física y Química (25%)</strong> (Informe Preliminar Dic e Informe Final Abr) y los 4 informes de <strong>Matemáticas (5%)</strong> (Goniómetro, Distancia Conocida, Dos Puntos e Informe Final).</li>
                    </ul>
                </div>`; 
                break;

            case 'FINANZAS': 
                content += `
                <div class="bg-mars-cyan/10 border border-mars-cyan p-3">
                    <p class="text-mars-cyan font-black uppercase text-xs">Departamento Financiero (CFO) 💰</p>
                    <p class="text-slate-300 text-[10px] mt-1">Guardián de la viabilidad económica, auditoría de compras, control del capital virtual (2400 €v iniciales) y contabilidad analítica.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
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
                    <p class="text-mars-cyan font-black uppercase text-xs">Departamento de Marketing y Comunicación (CMO) 🎨</p>
                    <p class="text-slate-300 text-[10px] mt-1">Responsable de la identidad corporativa, estrategia comercial, narrativa persuasiva y captación de patrocinio.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
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
                    <p class="text-mars-cyan font-black uppercase text-xs">Departamento de Operaciones, Logística e IA (COO) 📦🤖</p>
                    <p class="text-slate-300 text-[10px] mt-1">Enlace entre el simulador virtual y el taller de fabricación física, aprovisionamiento real y auditoría ética de Inteligencia Artificial.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
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
                    <p class="text-mars-cyan font-black uppercase text-xs">Observador Auxiliar (Apoyo Departamental) 👁️</p>
                    <p class="text-slate-300 text-[10px] mt-1">Miembro táctico adscrito a un departamento específico para refuerzo operativo y participación en la gobernanza.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
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
                    <p class="text-mars-cyan font-black uppercase text-xs">Alto Mando Docente y Coordinación 🎖️</p>
                    <p class="text-slate-300 text-[10px] mt-1">Control integral del ecosistema académico, evaluación continua ponderada (100%), aduanas y régimen disciplinario.</p>
                </div>
                <div class="space-y-2 text-[11px] text-slate-300">
                    <p class="text-mars-yellow font-bold uppercase text-[10px] border-b border-slate-800 pb-1">Atribuciones y Operaciones Clave:</p>
                    <ul class="list-disc pl-5 space-y-1.5">
                        <li><strong class="text-white">Evaluación Curricular (100%):</strong> Calificación por rúbricas granulares y generación automática del Acta Ponderada oficial.</li>
                        <li><strong class="text-white">Monitor de Alertas Léxicas:</strong> Recepción discriminada de incidencias: <span class="text-mars-yellow">Avisos Amarillos</span> por uso de nombres propios e <span class="text-red-500">Infracciones Rojas</span> por lenguaje soez con acceso directo a sanción AEE.</li>
                        <li><strong class="text-white">Aduanas y Registro Mercantil:</strong> Aprobación de traspasos B2B, validación de Logos/Eslóganes, alta de Roles Auxiliares y autorización o edición directa de cambios de <strong>Denominación Social</strong>.</li>
                        <li><strong class="text-white">Llavero Maestro y Backups D1:</strong> Gestión de códigos de empresa, PINs cifrados y copias de seguridad en Cloudflare D1.</li>
                    </ul>
                </div>`; 
                break;
        }
        content += `
        <div class="bg-slate-900 border border-slate-700 p-2.5 text-[9px] text-slate-400 uppercase mt-2">
            🛡️ <strong class="text-mars-yellow">Norma de Seguridad Activa:</strong> Todos los formularios están protegidos por el Filtro Léxico Universal. Queda prohibido introducir nombres propios o lenguaje ofensivo.
        </div>
        </div>`;

        const elBody = document.getElementById('onboarding-body');
        if(elBody) elBody.innerHTML = content;
        
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) elOverlay.classList.remove('hidden');
    },

    closeOnboarding() {
        const elSkip = document.getElementById('skip-onboarding');
        if(elSkip && elSkip.checked) {
            sessionStorage.setItem('hideWelcome', 'true');
        }
        const elOverlay = document.getElementById('onboarding-overlay');
        if(elOverlay) elOverlay.classList.add('hidden');
    },

    modalChangelog() {
        const logs = typeof APP_CHANGELOG !== 'undefined' ? APP_CHANGELOG : [];
        let html = `<div class="space-y-6 font-mono text-xs">`;
        
        if (logs.length === 0) {
            html += `<p class="text-slate-500 italic">No hay registros de versión disponibles.</p>`;
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
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 border shrink-0 mt-0.5 ${badgeClass}">${h.type}</span>
                        <span class="text-slate-300 text-[10px] leading-relaxed">${h.text}</span>
                    </li>`;
                }).join('');

                html += `
                <div class="bg-slate-900/90 border border-mars-border p-4">
                    <div class="flex justify-between items-center border-b border-mars-border pb-2 mb-3">
                        <div>
                            <span class="text-mars-green font-orbitron font-black text-sm">v${log.version}</span>
                            <h4 class="text-white font-bold uppercase text-[10px] mt-0.5">${log.title}</h4>
                        </div>
                        <span class="text-[9px] text-slate-400 bg-black px-2 py-1 border border-slate-800">${log.date}</span>
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

    // FASE 6: Guía Táctica Contextual actualizada a v1.0.17
    showGuide() {
        const viewTitles = {
            'market': 'SUPERMARS-KET y Mercado B2B',
            'tech': 'I+D, Matemáticas e Inventario',
            'orders': 'Cronograma (19) y Bóveda de Órdenes',
            'finance': 'Finanzas, Ledger y Economía',
            'cart': 'Logística de Despliegue Físico',
            'brand': 'Centro de Marca, LyE y Marketing',
            'ailog': 'Bitácora y Auditoría de IA',
            'resolutions': 'Gobernanza, Registro Mercantil y HR',
            'dossier': 'Dossier Académico (19 Entregables)',
            'admin': 'Centro de Mando Docente'
        };

        const title = `Manual Táctico: ${viewTitles[this.current] || 'Operaciones Generales'}`;
        let content = `<div class="space-y-4 text-xs leading-relaxed font-mono">`;
        
        switch(this.current) {
            case 'market':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Aprovisionamiento Oficial y Mercado Secundario B2B</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Catálogo Oficial (B2C):</span> El Rol Técnico añade piezas al borrador de I+D y las transmite a Finanzas con justificación técnica obligatoria.</li>
                    <li><span class="text-mars-yellow font-bold">Blindaje Léxico Activo:</span> Toda justificación de compra u observación B2B es auditada. Usar nombres propios genera un aviso amarillo; usar insultos bloquea la acción y genera expediente rojo en Coordinación.</li>
                    <li><span class="text-mars-yellow font-bold">Mercado B2B:</span> Permite vender y comprar piezas sobrantes entre startups. El capital se retiene hasta que Coordinación autoriza el traspaso en la Aduana.</li>
                </ul>`;
                break;
            case 'tech':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Ingeniería Aeroespacial, FYQ y Matemáticas</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Banco de Pruebas (mm):</span> Registra los ensayos introduciendo la altura alcanzada en <strong>milímetros (mm)</strong> para obtener el índice de eficiencia ($E = \\text{mm}/€\\text{v}$).</li>
                    <li><span class="text-mars-yellow font-bold">Entregables FYQ (25%):</span> Entrega enlaces Drive para el <em>Informe Preliminar (Dic)</em> y el <em>Informe Técnico Final (Abr)</em>.</li>
                    <li><span class="text-mars-yellow font-bold">Entregables MAT (5%):</span> Entrega enlaces para el <em>Goniómetro</em>, <em>Distancia Conocida</em>, <em>Dos Mediciones</em> e <em>Informe Comparativo Final</em>.</li>
                </ul>`;
                break;
            case 'orders':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Cronograma Maestro (19 Plazos), Bóveda y Crisis</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Cronograma Maestro:</span> Filtra y supervisa el estado y cuenta atrás semafórica de los 19 entregables oficiales de las 6 materias.</li>
                    <li><span class="text-mars-yellow font-bold">Cadena de Mando:</span> Visualiza el flujo de órdenes de I+D y Paquetes de Marketing (Solicitado ➔ Auditado por Finanzas ➔ Ejecutado en Logística).</li>
                    <li><span class="text-mars-yellow font-bold">Gabinete de Crisis:</span> Si la startup recibe una sanción AEE, el CEO debe emitir desde aquí el Comunicado Oficial de Mitigación.</li>
                </ul>`;
                break;
            case 'finance':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Contabilidad Analítica y Economía (10%)</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Entregables ECO:</span> Aporta enlaces web (Drive/Sheets) para el <em>Presupuesto Inicial</em>, <em>Cuenta de Resultados</em>, <em>Presupuesto Post-Prototipo</em> y <em>Balance de Situación</em>.</li>
                    <li><span class="text-mars-yellow font-bold">Ledger Inmutable:</span> Libro mayor donde quedan registrados todos los movimientos de €v (I+D, marketing, patrocinios, B2B y multas).</li>
                </ul>`;
                break;
            case 'cart':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Logística Física y Recepción de Suministros</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Validación en Taller:</span> Operaciones IA confirma la recepción física de las órdenes aprobadas por Finanzas e introduce el comercio y coste real en euros (€).</li>
                </ul>`;
                break;
            case 'brand':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Marketing, LyE (40%), Lengua (15%) e Inglés (5%)</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Aduana de Marca:</span> Cualquier cambio de logotipo o eslogan queda en estado "Pendiente" hasta su aprobación por Coordinación.</li>
                    <li><span class="text-mars-yellow font-bold">Paquetes Publicitarios:</span> Solicita a Finanzas la contratación de packs de medios justificando el retorno de inversión (ROI).</li>
                    <li><span class="text-mars-yellow font-bold">Entregables Cloud:</span> Sube los enlaces Drive de Identidad (Dic/Abr), Business Model, Canvas, Dossier de Inversores (Lengua) y Presentación/Ensayos (Inglés).</li>
                </ul>`;
                break;
            case 'ailog':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Trazabilidad y Ética en Inteligencia Artificial</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Bitácora de Prompts:</span> Todo miembro puede declarar el uso de IA desde el botón superior del banner. Operaciones IA audita y valida la revisión humana crítica.</li>
                </ul>`;
                break;
            case 'resolutions':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Gobernanza, Registro Mercantil y Buzón HR</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Cambio de Denominación Social:</span> El CEO dispone del botón oficial para solicitar a Coordinación el cambio de nombre de la startup sin perder el historial.</li>
                    <li><span class="text-mars-yellow font-bold">Mociones y Voto de Calidad:</span> Las decisiones se votan democráticamente; en caso de empate, el CEO desempata.</li>
                    <li><span class="text-mars-yellow font-bold">Buzón HR:</span> Canal formal para reportar inactividad departamental ante el Claustro.</li>
                </ul>`;
                break;
            case 'dossier':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Dossier Académico y Ponderación Oficial (100%)</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Calificaciones en Vivo:</span> Consulta el desglose por rúbricas y la nota ponderada global de la startup.</li>
                    <li><span class="text-mars-yellow font-bold">Repositorio Central (19 Entregables):</span> Verifica que todos los enlaces a la nube de las 6 materias estén correctamente registrados.</li>
                </ul>`;
                break;
            case 'admin':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Terminal del Claustro y Coordinación</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Monitor Léxico y Sanciones:</span> Revisa avisos amarillos (nombres propios) e infracciones rojas (insultos) y aplica multas AEE.</li>
                    <li><span class="text-mars-yellow font-bold">Registro Mercantil y Aduanas:</span> Autoriza cambios de nombre solicitados por el CEO (o edítalos con el icono ✏️), aprueba marcas y traspasos B2B.</li>
                </ul>`;
                break;
        }
        content += `</div>`;
        this.showModal(title, content, "");
    },

    modalSuggestion() {
        const allSuggs = state.data.suggestionsToAlex || [];
        
        const myCoId = state.user ? (state.user.admin ? 'DOCENTE' : state.user.coId) : 'ANON';
        const filteredSuggs = allSuggs.filter(s => {
            if (state.user && state.user.admin) return s.coId === 'DOCENTE' || s.author.includes('DOCENTE');
            return s.coId === myCoId || (s.author && state.data.companies[myCoId] && s.author.includes(state.data.companies[myCoId].name));
        });

        const history = filteredSuggs.slice(0, 8).map(s => {
            const cat = s.category || 'MEJORA';
            const status = s.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            const stBadge = status === 'IMPLEMENTADO' ? 'text-mars-green' : (status === 'EN_REVISION' ? 'text-mars-yellow' : 'text-slate-400');

            return `
            <div class="border-b border-slate-800 pb-2 mb-2 last:border-0">
                <div class="flex justify-between items-center mb-1 flex-wrap gap-1">
                    <div class="flex items-center gap-1.5">
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 border ${catBadge}">${cat}</span>
                        <span class="text-white font-bold uppercase text-[9px]">${s.author}</span>
                    </div>
                    <span class="text-[8px] font-bold uppercase ${stBadge}">[${status}] • ${s.date}</span>
                </div>
                <p class="text-slate-300 italic text-[10px] mt-1 pl-1 border-l-2 border-slate-700">"${s.text}"</p>
            </div>`;
        }).join('') || '<p class="text-slate-500 italic text-[10px]">No has enviado reportes desde esta entidad todavía.</p>';

        const html = `
            <p class="text-[10px] text-slate-400 mb-3 uppercase leading-relaxed">¿Has detectado un fallo técnico (bug), tienes una idea o una duda normativa? El reporte es privado y pasa por filtro léxico antes de llegar a Coordinación.</p>
            <div class="mb-3">
                <label class="text-[9px] text-mars-yellow font-bold uppercase block mb-1">Categoría del Reporte</label>
                <select id="sugg-category" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white uppercase font-bold outline-none focus:border-mars-yellow">
                    <option value="BUG">🐛 Bug / Error Técnico en la App</option>
                    <option value="MEJORA">💡 Sugerencia de Mejora / Idea</option>
                    <option value="REGLAS">⚖️ Consulta sobre Normativa / Rúbricas</option>
                </select>
            </div>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-xs text-white h-24 focus:border-mars-yellow outline-none mb-4" placeholder="Describe el reporte... (El uso de lenguaje ofensivo o nombres propios bloqueará el envío)"></textarea>
            <div class="bg-black/60 border border-slate-800 p-3 max-h-44 overflow-y-auto">
                <h4 class="text-mars-cyan text-[9px] uppercase font-bold mb-2 border-b border-slate-800 pb-1">Mis Envíos Recientes (Privado)</h4>
                ${history}
            </div>
        `;
        const actions = `<button onclick="ui.submitSuggestion()" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Transmitir a Buzón Dev</button>`;
        this.showModal("Canal Directo con Desarrollo (Buzón Alex)", html, actions);
    },

    submitSuggestion() {
        const elText = document.getElementById('sugg-text');
        const elCat = document.getElementById('sugg-category');
        if(!elText) return;
        
        const text = elText.value.trim();
        const category = elCat ? elCat.value : 'MEJORA';
        
        if(text.length < 5) return alert("Describe tu reporte con más detalle (mínimo 5 caracteres).");
        
        // FASE 4: Guardián Léxico Universal
        if(this.hasForbiddenWords(text, 'Buzón de Sugerencias')) return;
        
        const isDocente = state.user && state.user.admin;
        const coId = state.user ? (isDocente ? 'DOCENTE' : state.user.coId) : 'ANON';
        const entityName = isDocente ? 'CLAUSTRO DOCENTE' : (state.data.companies[coId]?.name || 'STARTUP');
        const author = state.user ? `${state.user.role} (${entityName})` : 'ANÓNIMO';
        
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.suggestionsToAlex.unshift({ 
            id: 'SUG-' + Date.now(), 
            coId: coId,
            category: category,
            status: 'RECIBIDO',
            author: author, 
            text: text, 
            date: new Date().toLocaleString() 
        });
        
        state.save();
        this.closeModal();
        alert("✅ Reporte registrado y enviado a Coordinación.");
    },

    generateHeroBanner() {
        if (!state.user || state.user.admin) return '';
        const co = state.data.companies[state.user.coId];
        
        if (!co) {
            auth.logout();
            return '';
        }

        const isBrandPending = co.brandApproval && co.brandApproval.status === 'PENDIENTE';
        
        let sponsorBadge = '';
        if(co.sponsorAwarded) {
            const color = co.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10':co.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10':'text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10';
            const spName = co.sponsorData?.name ? ` - ${co.sponsorData.name}` : '';
            const spLogo = co.sponsorData?.logo ? `<img src="${co.sponsorData.logo}" class="h-4 inline-block ml-2 rounded-sm object-contain">` : '';
            sponsorBadge = `<span class="${color} border px-2 py-1 font-black shadow-[0_0_10px_currentColor] flex items-center gap-1">[PATROCINIO ${co.sponsorAwarded}${spName}] ${spLogo}</span>`;
        }

        let imgHtml = '';
        if (isBrandPending) {
            imgHtml = `<div class="flex flex-col items-center justify-center h-full bg-slate-900 border-2 border-mars-magenta animate-pulse"><span class="text-2xl">⏳</span></div>`;
        } else if (co.logo) {
            imgHtml = `<img src="${co.logo}" class="w-full h-full object-cover">`;
        } else {
            imgHtml = `<div class="flex flex-col items-center justify-center h-full bg-slate-900"><span class="text-2xl">🚀</span><span class="text-[5px] mt-1 text-slate-500 uppercase text-center leading-tight tracking-tighter">SIN LOGO</span></div>`;
        }

        let sloganHtml = '';
        if (isBrandPending) {
            sloganHtml = `<p class="font-orbitron text-mars-magenta font-bold text-[10px] mt-1 tracking-wider uppercase bg-mars-magenta/10 border border-mars-magenta px-2 py-0.5 inline-block animate-pulse">⚠️ MARCA EN REVISIÓN DOCENTE</p>`;
        } else if (co.slogan) {
            sloganHtml = `<p class="font-orbitron text-mars-yellow text-[10px] mt-1 tracking-wider italic">"${co.slogan}"</p>`;
        }

        return `
        <div class="terminal-border bg-mars-card p-4 mb-6 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative overflow-hidden animate-in fade-in duration-500">
            <div class="absolute top-2 right-2 flex gap-2">
                <button onclick="ui.modalReportAI()" class="bg-blue-600/20 border border-blue-500 text-blue-400 px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-bold uppercase hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]">[🤖 REPORTAR USO IA]</button>
            </div>
            <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 p-0.5 hex-clip bg-mars-bg mt-6 md:mt-0 ${isBrandPending ? 'border-2 border-mars-magenta shadow-[0_0_15px_rgba(255,0,85,0.4)]' : 'border-2 border-mars-cyan shadow-neon-cyan'}">
                <div class="w-full h-full hex-clip overflow-hidden">
                    ${imgHtml}
                </div>
            </div>
            <div class="flex-grow text-center md:text-left flex flex-col justify-center mt-2 md:mt-0">
                <h2 class="font-orbitron text-xl sm:text-2xl md:text-3xl font-black text-mars-cyan tracking-widest uppercase truncate pr-10 sm:pr-24 leading-none">${co.name}</h2>
                ${sloganHtml}
                <div class="flex flex-wrap justify-center md:justify-start gap-2 mt-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest">
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2 py-1 flex items-center">AUTH: ${state.user.role.replace('_',' ')}</span>
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
            if(miniLogo) miniLogo.classList.add('hidden');
        } else {
            const co = state.data.companies[state.user.coId];
            if(co && balEl) balEl.innerText = `${co.balance.toFixed(2)} €v`;
            if(co && infoEl) infoEl.innerText = `ENTITY: ${co.name.toUpperCase()} | ROLE: ${state.user.role.replace('_',' ')}`;
            
            if(miniLogo && co) {
                miniLogo.classList.remove('hidden');
                let hudImgHtml = `<span class="text-[10px]">🚀</span>`;
                if(co.brandApproval && co.brandApproval.status === 'PENDIENTE') {
                    hudImgHtml = `<span class="text-[10px] text-mars-magenta animate-pulse">⏳</span>`;
                } else if(co.logo) {
                    hudImgHtml = `<img src="${co.logo}" class="w-full h-full object-cover">`;
                }
                miniLogo.innerHTML = hudImgHtml;
            }
        }

        if(cloudEl) {
            if(state.isSyncing) {
                cloudEl.className = 'text-[7px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-mars-cyan text-mars-cyan bg-mars-cyan/10 animate-pulse whitespace-nowrap';
                cloudEl.innerText = '[CLOUD: SYNCING]';
            } else if(state.isCloudOnline) {
                cloudEl.className = 'text-[7px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-mars-green/40 text-mars-green bg-mars-green/10 whitespace-nowrap';
                cloudEl.innerText = '[D1: SYNCED]';
            } else {
                cloudEl.className = 'text-[7px] sm:text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-mars-border text-mars-yellow bg-slate-900 whitespace-nowrap';
                cloudEl.innerText = '[LOCAL ONLY]';
            }
        }

        document.querySelectorAll('.nav-tab').forEach(t => {
            t.classList.remove('tab-active', 'text-mars-cyan');
            const oc = t.getAttribute('onclick');
            if(oc && oc.includes(`('${this.current}')`)) t.classList.add('tab-active', 'text-mars-cyan');
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
        if(!docObj) return `<div class="bg-black/50 border border-mars-border border-dashed p-3 mb-2 flex justify-between items-center text-[9px] sm:text-[10px]"><span class="text-slate-500 font-bold uppercase">${title}</span><span class="text-mars-magenta font-black uppercase">[PENDIENTE]</span></div>`;
        return `<div class="bg-mars-cyan/5 border border-mars-cyan/50 p-3 mb-2 flex justify-between items-center text-[9px] sm:text-[10px]">
                    <div class="overflow-hidden pr-2"><span class="text-mars-cyan font-bold uppercase block truncate">${title}</span><span class="text-[8px] text-slate-400 block truncate">ENLACE DRIVE/CLOUD | ${(docObj.date || '').slice(0,10)}</span></div>
                    <a href="${docObj.dataUrl}" target="_blank" class="bg-mars-cyan text-black px-3 py-1.5 font-bold uppercase hover:bg-white transition-colors flex-shrink-0">Abrir Enlace</a>
                </div>`;
    },
    
    renderDriveLinkBox(title, desc, docKey, currentDoc) {
        return `
        <div class="border-b border-slate-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 class="text-mars-cyan font-bold text-xs uppercase mb-1">${title}</h3>
            <p class="text-[9px] text-slate-400 mb-2 uppercase leading-tight">${desc}</p>
            ${this.renderDocBadge(title, currentDoc)}
            <div class="bg-slate-900 border border-slate-700 p-2 mt-2">
                <p class="text-[8px] text-mars-yellow font-bold uppercase mb-2">Entregar Enlace (Google Drive, OneDrive, Canva...)</p>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="url" id="upload-url-${docKey}" placeholder="https://..." class="bg-black border border-slate-700 p-1.5 text-[9px] text-white flex-grow outline-none focus:border-mars-cyan">
                    <button onclick="ui.handleDeliverableLinkSubmit('${docKey}')" class="bg-mars-cyan text-black font-bold uppercase text-[9px] px-3 py-1.5 hover:bg-white flex-shrink-0 w-full sm:w-auto">Entregar Enlace</button>
                </div>
            </div>
        </div>`;
    },

    handleDeliverableLinkSubmit(docType) {
        if (!state.user) return;
        const urlInput = document.getElementById(`upload-url-${docType}`);
        if (!urlInput) return;
        
        const url = urlInput.value.trim();
        
        if(!url) return alert("Debe proporcionar un enlace válido (URL). La subida de archivos físicos está deshabilitada.");
        if(!url.toLowerCase().startsWith('http://') && !url.toLowerCase().startsWith('https://')) {
            return alert("Error de formato: El enlace debe comenzar con 'http://' o 'https://'");
        }
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        co.deliverables = co.deliverables || {};

        co.deliverables[docType] = { 
            type: 'link', 
            name: 'Enlace a Nube Externa', 
            date: new Date().toLocaleString(), 
            size: 'URL', 
            dataUrl: url 
        };
        
        telemetry.log("ENTREGABLE", `Enlace subido a Drive: ${docType}`);
        state.save(); 
        this.render(); 
        alert("✅ Enlace entregado y registrado en el Dossier Oficial.");
    },

    showModal(title, body, actions) {
        const elTitle = document.getElementById('modal-title');
        const elBody = document.getElementById('modal-body');
        const elActions = document.getElementById('modal-actions');
        const elOverlay = document.getElementById('modal-overlay');
        
        if(elTitle) elTitle.innerText = title; 
        if(elBody) elBody.innerHTML = body; 
        if(elActions) elActions.innerHTML = actions + `<button onclick="ui.closeModal()" class="bg-slate-800 text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-slate-700 transition-all shadow-md border border-slate-600">Cerrar</button>`; 
        if(elOverlay) elOverlay.classList.remove('hidden');
    },

    closeModal() { 
        const elOverlay = document.getElementById('modal-overlay');
        if(elOverlay) elOverlay.classList.add('hidden'); 
    }
};