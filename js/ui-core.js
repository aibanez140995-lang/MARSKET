// js/ui-core.js

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '', evalClassFilter: 'ALL',
    
    navigate(view) { this.current = view; this.render(); },
    
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
            type: type, // 'info', 'success', 'error', 'warning'
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

    showWelcomeModal() {
        if (sessionStorage.getItem('hideWelcome')) return;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        const elTitle = document.getElementById('onboarding-title');
        if(elTitle) elTitle.innerText = `¡HOLA, ${role.replace('_',' ')}! 🚀`;
        
        let content = `<div class="space-y-4 font-mono text-sm leading-relaxed">`;
        
        switch(role) {
            case 'CEO': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido a la silla de la presidencia!</p>
                <p class="text-slate-300">Tu misión principal es que la startup cumpla plazos y opere coordinada.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Vigila el <strong>Cronograma Maestro</strong> y las alertas de sanciones legales.</li>
                    <li>Supervisa la <strong>Bóveda de Órdenes</strong> (I+D y Paquetes de Marketing).</li>
                    <li>Ejerce el <strong>voto de calidad</strong> en empates de Gobernanza.</li>
                    <li>Configura el PIN y departamento vinculado del <strong>Rol Observador (Auxiliar)</strong>.</li>
                </ul>`; 
                break;
            case 'TECNICO': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, cerebro de la propulsión e ingeniería! 🧪</p>
                <p class="text-slate-300">De ti depende el diseño físico, la química y la precisión matemática.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Solicita componentes en el <strong>SUPERMARS-KET</strong> o comercia en el <strong>Mercado B2B</strong>.</li>
                    <li>Registra vuelos en el <strong>Banco de Pruebas</strong> y configura el prototipo (BOM).</li>
                    <li>Sube la <strong>Hoja Preliminar</strong>, el <strong>Informe Técnico FYQ</strong> y los <strong>3 Informes de Matemáticas</strong>.</li>
                </ul>`; 
                break;
            case 'FINANZAS': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, guardián de los 2400 €v iniciales! 💰</p>
                <p class="text-slate-300">Sin tu luz verde presupuestaria no se aprueba ni un tornillo ni un anuncio.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Audita y aprueba (total o parcialmente) las órdenes de <strong>I+D y Paquetes de Marketing</strong>.</li>
                    <li>Supervisa el <strong>Ledger Inmutable</strong> y las multas de la Ventanilla Legal.</li>
                    <li>Entrega los <strong>4 documentos oficiales de Economía</strong> (Presupuestos, Cuenta Resultados y Balance).</li>
                </ul>`; 
                break;
            case 'MARKETING': 
                content += `<p class="text-mars-cyan font-bold">¡Hola, estratega de marca y negocio! 🎨</p>
                <p class="text-slate-300">Construye la identidad corporativa, el modelo de negocio y capta inversores.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Contrata <strong>Paquetes Publicitarios</strong> (Satélite, Tradicional, Híbrido, Supernova) y ejecuta sus acciones.</li>
                    <li>Gestiona las entregas duales (Diciembre y Abril) de <strong>Identidad de Marca y Diario de Decisiones (LyE)</strong>.</li>
                    <li>Sube el <strong>Business Model</strong>, el <strong>Canvas</strong>, el <strong>Dossier de Inversores (Lengua)</strong> y <strong>Redacciones (Inglés)</strong>.</li>
                </ul>`; 
                break;
            case 'OPERACIONES_IA': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, responsable de logística y ética IA! 📦🤖</p>
                <p class="text-slate-300">Conectas las compras virtuales con el taller real y auditas el uso de IA.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Valida el ensamblaje físico de las órdenes aprobadas y registra el coste real (€).</li>
                    <li>Audita la <strong>Bitácora IA</strong> verificando que cada prompt tenga validación humana.</li>
                    <li>Coordina junto a Marketing la entrega del <strong>Diario de Decisiones e IA</strong> (Diciembre y Abril).</li>
                </ul>`; 
                break;
            case 'AUXILIAR': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, Observador vinculado! 👁️</p>
                <p class="text-slate-300">Apoyas a tu departamento asignado y participas en las decisiones democráticas.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Consulta en tiempo real el <strong>SUPERMARS-KET</strong> y los 17 entregables del <strong>Dossier</strong>.</li>
                    <li>Vota y propón mociones activamente en la pestaña de <strong>Gobernanza</strong>.</li>
                </ul>`; 
                break;
            case 'DOCENTE': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido al Alto Mando, Inspector/a! 🎖️</p>
                <p class="text-slate-300">El Centro de Mando Docente opera bajo la ponderación oficial del 100%.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400 text-xs">
                    <li>Califica mediante las nuevas rúbricas en <strong>Rúbricas & Entregas</strong> y audita los 17 entregables.</li>
                    <li>Supervisa la <strong>Aduana B2B</strong> (Coordinación) para autorizar traspasos de piezas entre startups.</li>
                    <li>Aplica sanciones mediante tu <strong>Agencia Reguladora Oficial</strong> y revisa el Buzón de Novedades.</li>
                </ul>`; 
                break;
        }
        content += `</div>`;
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

    showGuide() {
        const viewTitles = {
            'market': 'SUPERMARS-KET y Mercado B2B',
            'tech': 'I+D, Matemáticas e Inventario',
            'orders': 'Bóveda de Órdenes y Crisis',
            'finance': 'Finanzas, Ledger y Economía',
            'cart': 'Logística de Despliegue Físico',
            'brand': 'Centro de Marca, LyE y Marketing',
            'ailog': 'Bitácora y Auditoría de IA',
            'resolutions': 'Gobernanza, Votaciones y Alertas HR',
            'dossier': 'Dossier Académico (17 Entregables)',
            'admin': 'Centro de Mando Docente'
        };

        const title = `Manual Táctico: ${viewTitles[this.current] || 'Operaciones Generales'}`;
        let content = `<div class="space-y-4 text-xs leading-relaxed font-mono">`;
        
        switch(this.current) {
            case 'market':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Aprovisionamiento y Mercado Secundario B2B</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Catálogo Oficial:</span> El Rol Técnico añade componentes al borrador de I+D y los transmite a Finanzas con justificación obligatoria.</li>
                    <li><span class="text-mars-yellow font-bold">Material Externo:</span> Si un material no existe en lista, el Técnico usa <em>"Solicitar I+D"</em> para que el Claustro le asigne precio en €v.</li>
                    <li><span class="text-mars-yellow font-bold">Mercado B2B:</span> Permite comprar piezas sobrantes puestas a la venta por otras startups. Toda compra B2B queda retenida hasta que la Coordinación Docente la valida en la Aduana.</li>
                </ul>`;
                break;
            case 'tech':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Ingeniería Aeroespacial, FYQ y Matemáticas</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Entregables FYQ (25%):</span> Sube aquí la <em>Hoja de Registro Preliminar</em> (Fase I) y el <em>Informe Técnico Exhaustivo</em> (Fase II).</li>
                    <li><span class="text-mars-yellow font-bold">Entregables MAT (5%):</span> Casilleros específicos para la evidencia del Goniómetro y los 3 informes trigonométricos (Distancia conocida, Dos mediciones e Informe Final).</li>
                    <li><span class="text-mars-yellow font-bold">Banco de Pruebas y BOM:</span> Registra cada ensayo para calcular el KPI de eficiencia (E = Altura / Coste) y marca qué piezas compradas integran el prototipo final o ponlas en venta B2B.</li>
                </ul>`;
                break;
            case 'orders':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Bóveda de Autorización y Gestión de Crisis</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Cadena de Mando:</span> Muestra el progreso en tiempo real (Solicitado ➔ Auditado por Finanzas ➔ Ejecutado en Logística).</li>
                    <li><span class="text-mars-yellow font-bold">Auditoría Parcial:</span> Finanzas puede desmarcar piezas individuales de un pedido si superan el presupuesto antes de aprobarlo.</li>
                    <li><span class="text-mars-yellow font-bold">Protocolo de Crisis (CEO):</span> Ante una multa institucional, el CEO debe pulsar <em>"Emitir Comunicado de Crisis"</em> para alertar a todos los departamentos.</li>
                </ul>`;
                break;
            case 'finance':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Contabilidad Analítica y Economía (10%)</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">4 Entregables Oficiales ECO:</span> Casilleros independientes para subir <em>Presupuesto Inicial</em>, <em>Cuenta de Resultados</em>, <em>Presupuesto Post-Prototipo</em> y <em>Balance de Situación</em> (20% cada uno + 20% Test en aula).</li>
                    <li><span class="text-mars-yellow font-bold">Ledger Inmutable:</span> Registro contable automático de cada compra de I+D, paquete de marketing, transacción B2B, patrocinio o multa.</li>
                </ul>`;
                break;
            case 'cart':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Logística Física y Recepción de Suministros</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Validación Real:</span> Las órdenes aprobadas por Finanzas llegan aquí. Operaciones IA debe marcar la casilla de ensamblaje, indicar el coste físico real en euros (€) y la tienda proveedora.</li>
                    <li><span class="text-mars-yellow font-bold">Ejecución Contable:</span> Al pulsar <em>"Confirmar Compra Física"</em>, se descuenta el saldo virtual (€v) del Ledger y las piezas pasan al inventario técnico.</li>
                </ul>`;
                break;
            case 'brand':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Marketing, LyE (40%), Lengua (15%) e Inglés (5%)</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Paquetes Publicitarios:</span> Marketing contrata uno de los 4 paquetes (Satélite 200€v, Tradicional 300€v, Híbrido 450€v, Supernova 750€v). Tras la aprobación de Finanzas, desbloquea acciones promocionales.</li>
                    <li><span class="text-mars-yellow font-bold">Entregas Duales LyE:</span> Sube las versiones de <strong>Diciembre y Abril</strong> tanto de Identidad de Marca como del Diario de Decisiones/IA, además del Business Model y el Canvas.</li>
                    <li><span class="text-mars-yellow font-bold">Comunicación:</span> Casilleros para el <em>Dossier de Inversores</em> (Lengua) y las presentaciones/redacciones en Inglés.</li>
                </ul>`;
                break;
            case 'ailog':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Trazabilidad y Ética en Inteligencia Artificial</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Registro de Prompts:</span> Todo miembro que utilice IA generativa debe pulsar <em>"[🤖 REPORTAR USO IA]"</em> detallando herramienta, prompt exacto y método de verificación humana.</li>
                    <li><span class="text-mars-yellow font-bold">Auditoría Interna:</span> El Director de Operaciones e IA audita los reportes pendientes y los aprueba para integrarlos en la Bitácora Oficial del Dossier.</li>
                </ul>`;
                break;
            case 'resolutions':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Gobernanza Democrática y Alertas HR</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Mociones:</span> Cualquier miembro (incluido Auxiliar) puede proponer y votar mociones vinculantes.</li>
                    <li><span class="text-mars-yellow font-bold">Voto de Calidad:</span> En caso de empate, el CEO desbloquea y cierra el acta oficial.</li>
                    <li><span class="text-mars-yellow font-bold">Alertas HR Multicapa:</span> Si un departamento bloquea el avance por inactividad, repórtalo aquí; la alerta llega simultáneamente al CEO y a la Coordinación Docente.</li>
                </ul>`;
                break;
            case 'dossier':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Dossier Académico y Ponderación Oficial</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Evaluación Continua:</span> Consulta en tiempo real las calificaciones desglosadas y el feedback docente de las 6 asignaturas (FYQ 25%, LYE 40%, LEN 15%, ECO 10%, MAT 5%, ING 5%).</li>
                    <li><span class="text-mars-yellow font-bold">Archivo Documental:</span> Verifica que los 17 entregables obligatorios figuren en estado entregado con enlace o archivo operativo.</li>
                </ul>`;
                break;
            case 'admin':
                content += `
                <p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Terminal del Claustro y Coordinación</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300 text-[11px]">
                    <li><span class="text-mars-yellow font-bold">Acta Ponderada (100%):</span> Calcula automáticamente la nota global del proyecto aplicando el peso curricular exacto de cada materia.</li>
                    <li><span class="text-mars-yellow font-bold">Aduana B2B y Sanciones:</span> Coordinación aprueba o rechaza las ventas de piezas entre startups; cada docente emite multas firmadas por su Agencia Reguladora.</li>
                </ul>`;
                break;
        }
        content += `</div>`;
        this.showModal(title, content, "");
    },

    modalSuggestion() {
        const allSuggs = state.data.suggestionsToAlex || [];
        
        // Privacidad por Startup: Los alumnos solo ven los envíos de su propia empresa
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
            <p class="text-[10px] text-slate-400 mb-3 uppercase leading-relaxed">¿Has detectado un fallo técnico (bug), tienes una idea de mejora o una duda normativa? Tu reporte es privado para tu startup y llega directo a Coordinación.</p>
            <div class="mb-3">
                <label class="text-[9px] text-mars-yellow font-bold uppercase block mb-1">Categoría del Reporte</label>
                <select id="sugg-category" class="w-full bg-slate-900 border border-mars-yellow/50 p-2 text-xs text-white uppercase font-bold outline-none focus:border-mars-yellow">
                    <option value="BUG">🐛 Bug / Error Técnico en la App</option>
                    <option value="MEJORA">💡 Sugerencia de Mejora / Idea</option>
                    <option value="REGLAS">⚖️ Consulta sobre Normativa / Rúbricas</option>
                </select>
            </div>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-xs text-white h-24 focus:border-mars-yellow outline-none mb-4" placeholder="Describe con detalle qué ha ocurrido o en qué pestaña estabas..."></textarea>
            <div class="bg-black/60 border border-slate-800 p-3 max-h-44 overflow-y-auto">
                <h4 class="text-mars-cyan text-[9px] uppercase font-bold mb-2 border-b border-slate-800 pb-1">Mis Envíos Recientes (Privado de tu Entidad)</h4>
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
        
        if(text.length < 5) return alert("Por favor, describe tu reporte con más detalle (mínimo 5 caracteres).");
        
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
        
        let sponsorBadge = '';
        if(co.sponsorAwarded) {
            const color = co.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10':co.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10':'text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10';
            const spName = co.sponsorData?.name ? ` - ${co.sponsorData.name}` : '';
            const spLogo = co.sponsorData?.logo ? `<img src="${co.sponsorData.logo}" class="h-4 inline-block ml-2 rounded-sm object-contain">` : '';
            sponsorBadge = `<span class="${color} border px-2 py-1 font-black shadow-[0_0_10px_currentColor] flex items-center gap-1">[PATROCINIO ${co.sponsorAwarded}${spName}] ${spLogo}</span>`;
        }

        const imgHtml = co.logo ? `<img src="${co.logo}" class="w-full h-full object-cover">` : `<div class="flex flex-col items-center justify-center h-full bg-slate-900"><span class="text-2xl">🚀</span><span class="text-[5px] mt-1 text-slate-500 uppercase text-center leading-tight tracking-tighter">SIN LOGO</span></div>`;

        return `
        <div class="terminal-border bg-mars-card p-4 mb-6 flex flex-col md:flex-row items-center md:items-start gap-4 sm:gap-6 relative overflow-hidden animate-in fade-in duration-500">
            <div class="absolute top-2 right-2 flex gap-2">
                <button onclick="ui.modalReportAI()" class="bg-blue-600/20 border border-blue-500 text-blue-400 px-2 sm:px-3 py-1.5 text-[8px] sm:text-[9px] font-bold uppercase hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]">[🤖 REPORTAR USO IA]</button>
            </div>
            <div class="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 border-2 border-mars-cyan p-0.5 hex-clip bg-mars-bg shadow-neon-cyan mt-6 md:mt-0">
                <div class="w-full h-full hex-clip overflow-hidden">
                    ${imgHtml}
                </div>
            </div>
            <div class="flex-grow text-center md:text-left flex flex-col justify-center mt-2 md:mt-0">
                <h2 class="font-orbitron text-xl sm:text-2xl md:text-3xl font-black text-mars-cyan tracking-widest uppercase truncate pr-10 sm:pr-24 leading-none">${co.name}</h2>
                ${co.slogan ? `<p class="font-orbitron text-mars-yellow text-[10px] mt-1 tracking-wider italic">"${co.slogan}"</p>` : ''}
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
                miniLogo.innerHTML = co.logo ? `<img src="${co.logo}" class="w-full h-full object-cover">` : `<span class="text-[10px]">🚀</span>`;
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
        
        const allowedRoutes = {
            'CEO': ['orders', 'finance', 'resolutions', 'dossier', 'market'],
            'TECNICO': ['market', 'tech', 'cart', 'orders', 'dossier', 'resolutions'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market', 'resolutions'],
            'MARKETING': ['brand', 'market', 'dossier', 'resolutions'],
            'OPERACIONES_IA': ['market', 'cart', 'ailog', 'dossier', 'resolutions'],
            'AUXILIAR': ['market', 'resolutions', 'dossier']
        };

        if (state.user.admin && !['admin', 'market', 'dossier'].includes(this.current)) {
            this.current = 'admin';
        } else if (!state.user.admin && !allowedRoutes[state.user.role].includes(this.current)) {
            this.current = allowedRoutes[state.user.role][0];
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
                    <div class="overflow-hidden pr-2"><span class="text-mars-cyan font-bold uppercase block truncate">${title}</span><span class="text-[8px] text-slate-400 block truncate">${docObj.type === 'link' ? 'ENLACE' : docObj.name} | ${(docObj.date || '').slice(0,10)}</span></div>
                    <a href="${docObj.dataUrl}" target="_blank" download="${docObj.type==='file'?docObj.name:''}" class="bg-mars-cyan text-black px-2 sm:px-3 py-1 font-bold uppercase hover:bg-white transition-colors flex-shrink-0">${docObj.type === 'link' ? 'Abrir' : 'Descargar'}</a>
                </div>`;
    },
    
    renderHybridUploadBox(title, desc, docKey, currentDoc) {
        return `
        <div class="border-b border-slate-800 pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
            <h3 class="text-mars-cyan font-bold text-xs uppercase mb-1">${title}</h3>
            <p class="text-[9px] text-slate-400 mb-2 uppercase leading-tight">${desc}</p>
            ${this.renderDocBadge(title, currentDoc)}
            <div class="bg-slate-900 border border-slate-700 p-2 mt-2">
                <p class="text-[8px] text-mars-yellow font-bold uppercase mb-2">Nueva Entrega (Archivo < 2MB O Enlace Nube)</p>
                <div class="flex flex-col sm:flex-row gap-2">
                    <input type="file" id="upload-file-${docKey}" class="text-[9px] text-slate-400 w-full sm:w-auto">
                    <span class="text-slate-500 text-[10px] flex items-center hidden sm:inline">-O-</span>
                    <input type="text" id="upload-url-${docKey}" placeholder="Pegue Enlace GDrive/Canva" class="bg-black border border-slate-700 p-1.5 text-[9px] text-white flex-grow outline-none focus:border-mars-cyan">
                    <button onclick="ui.handleDeliverableHybridSubmit('${docKey}')" class="bg-mars-cyan text-black font-bold uppercase text-[9px] px-3 py-1.5 hover:bg-white flex-shrink-0 w-full sm:w-auto">Entregar</button>
                </div>
            </div>
        </div>`;
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