// js/ui-core.js

const ui = {
    current: 'login', adminTab: 'dash', coordEvalView: 'ACTA', evalSelectedCo: '',
    
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
        if (!co) return; // REGLA 1
        
        co.notifications = co.notifications || [];
        co.notifications.unshift({
            id: 'NOTIF-' + Date.now(),
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
                <p class="text-slate-300">Tu misión principal es que la startup no se hunda antes del despegue.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Vigila el <strong>Cronograma Maestro</strong>. La AEE no perdona los retrasos.</li>
                    <li>Supervisa la <strong>Bóveda de Órdenes</strong>.</li>
                    <li>Usa tu <strong>voto de calidad</strong> en la pestaña de Gobernanza.</li>
                    <li>Gestiona el <strong>Rol Observador (Auxiliar)</strong> y vincúlalo a un departamento.</li>
                </ul>`; 
                break;
            case 'TECNICO': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, cerebro de la propulsión química! 🧪</p>
                <p class="text-slate-300">De ti depende que el cohete suba y no explote en la rampa de lanzamiento.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Pide los materiales en el <strong>SUPERMARS-KET</strong>.</li>
                    <li>Registra cada ensayo en el <strong>Banco de Pruebas</strong>.</li>
                    <li>Sube tu <strong>Informe Técnico</strong> a tiempo para FYQ.</li>
                    <li>Propón mociones o reporta inactividad en <strong>Gobernanza</strong>.</li>
                </ul>`; 
                break;
            case 'FINANZAS': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, guardián de la caja virtual! 💰</p>
                <p class="text-slate-300">Sin tu luz verde presupuestaria, aquí no se mueve ni un tornillo.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Revisa las peticiones del Técnico y de Marketing y <strong>audita</strong> el gasto.</li>
                    <li>Vigila el <strong>Ledger Inmutable</strong>.</li>
                    <li>Prepara el <strong>Libro de Cuentas</strong> oficial para ECO.</li>
                    <li>Propón mociones o reporta inactividad en <strong>Gobernanza</strong>.</li>
                </ul>`; 
                break;
            case 'MARKETING': 
                content += `<p class="text-mars-cyan font-bold">¡Hola, genio creativo! 🎨</p>
                <p class="text-slate-300">Un cohete sin marca es solo un tubo de plástico con vinagre.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Sube el <strong>Logotipo</strong> y define un <strong>Eslogan</strong>.</li>
                    <li>Redacta la <strong>Propuesta de Valor</strong>.</li>
                    <li>Solicita <strong>Paquetes Publicitarios</strong> a Finanzas para ganar visibilidad.</li>
                    <li>Prepara y sube las presentaciones para los <strong>Pitches de Oratoria</strong>.</li>
                </ul>`; 
                break;
            case 'OPERACIONES_IA': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, maestro de la logística y la ética IA! 📦🤖</p>
                <p class="text-slate-300">Tú conectas el mundo virtual con el mundo físico real.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Valida el ensamblaje de las compras y anota el coste real (€).</li>
                    <li>Vigila la <strong>Bitácora IA</strong> y audita los prompts del equipo.</li>
                    <li>Propón mociones o reporta inactividad en <strong>Gobernanza</strong>.</li>
                </ul>`; 
                break;
            case 'AUXILIAR': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, Observador! 👁️</p>
                <p class="text-slate-300">Tienes acceso de lectura y participación en mociones.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Consulta el <strong>SUPERMARS-KET</strong> y el <strong>Dossier</strong>.</li>
                    <li>Participa activamente votando en <strong>Gobernanza</strong>.</li>
                </ul>`; 
                break;
            case 'DOCENTE': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido al Alto Mando, Inspector/a! 🎖️</p>
                <p class="text-slate-300">El Centro de Mando Docente está listo para la evaluación.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Usa la pestaña <strong>Rúbricas & Entregas</strong> para calificar.</li>
                    <li>Vigila las <strong>Alertas HR</strong> en Telemetría.</li>
                    <li>Asigna <strong>Patrocinios Personalizados</strong> desde AEE & Finanzas.</li>
                    <li>Audita el <strong>Gasto Virtual (Drill-down)</strong> de las startups.</li>
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

    showGuide() {
        const viewTitles = {
            'market': 'SUPERMARS-KET Oficial',
            'tech': 'I+D y Banco de Pruebas',
            'orders': 'Bóveda de Órdenes',
            'finance': 'Finanzas y Ledger',
            'cart': 'Logística de Despliegue',
            'brand': 'Centro de Marca',
            'ailog': 'Bitácora de IA',
            'resolutions': 'Gobernanza y Actas',
            'dossier': 'Dossier y Notas',
            'admin': 'Centro de Mando Docente'
        };

        let title = `Manual Táctico: ${viewTitles[this.current] || 'General'}`;
        let content = `<div class="space-y-4 text-xs leading-relaxed font-mono">`;
        
        switch(this.current) {
            case 'market':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">SUPERMARS-KET Oficial</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Catálogo:</span> Aquí puedes ver todos los componentes disponibles para comprar.</li>
                    <li><span class="text-mars-yellow">Segunda Mano:</span> Filtra por 'B2B' para comprar piezas usadas a otras startups.</li>
                    <li><span class="text-mars-yellow">Peticiones:</span> Solo el Técnico puede añadir componentes al borrador y enviarlos a Finanzas.</li>
                </ul>`;
                break;
            case 'tech':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">I+D y Banco de Pruebas</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Fase I:</span> Define tu presupuesto y altura teórica. Sube el boceto y la foto del prototipo.</li>
                    <li><span class="text-mars-yellow">Fase II:</span> Registra los ensayos de vuelo. Si hay desviación con la Fase I, deberás justificar la Versión 2.0.</li>
                    <li><span class="text-mars-yellow">Inventario:</span> Gestiona tus piezas físicas, solicita garantías o véndelas en el mercado B2B.</li>
                </ul>`;
                break;
            case 'orders':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Bóveda de Órdenes</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Flujo:</span> Revisa el estado de las peticiones de I+D y los paquetes de Marketing.</li>
                    <li><span class="text-mars-yellow">Aprobación:</span> Finanzas debe auditar y aprobar cada gasto antes de que pase a Logística.</li>
                </ul>`;
                break;
            case 'finance':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Finanzas y Ledger</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Ledger:</span> Registro inmutable de todas las transacciones virtuales de la empresa.</li>
                    <li><span class="text-mars-yellow">Auditoría V2.0:</span> Finanzas debe aprobar las justificaciones de desviación del Dpto. Técnico.</li>
                    <li><span class="text-mars-yellow">Aduana B2B:</span> Revisa los contratos de compra/venta de segunda mano pendientes de firma docente.</li>
                </ul>`;
                break;
            case 'cart':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Logística de Despliegue</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Ejecución:</span> Operaciones IA debe validar que las compras aprobadas han llegado físicamente.</li>
                    <li><span class="text-mars-yellow">Coste Real:</span> Introduce el coste real en euros (€) y el proveedor físico.</li>
                    <li><span class="text-mars-yellow">Inventario:</span> Al confirmar, las piezas pasan al inventario del Técnico.</li>
                </ul>`;
                break;
            case 'brand':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Centro de Marca</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Identidad:</span> Sube el logo, eslogan y redacta la propuesta de valor.</li>
                    <li><span class="text-mars-yellow">Paquetes MKT:</span> Solicita presupuesto a Finanzas para campañas publicitarias.</li>
                    <li><span class="text-mars-yellow">Ejecución:</span> Consume las acciones de tus paquetes activos publicando creatividades.</li>
                </ul>`;
                break;
            case 'ailog':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Diario y Bitácora IA</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Diario de Decisiones:</span> Registra hitos estratégicos y resolución de conflictos del equipo.</li>
                    <li><span class="text-mars-yellow">Auditoría IA:</span> Reporta el uso de herramientas de IA. Operaciones IA debe validar cada prompt.</li>
                </ul>`;
                break;
            case 'resolutions':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Gobernanza y Actas</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Mociones:</span> Cualquier miembro (incluido Auxiliar) puede proponer y votar mociones.</li>
                    <li><span class="text-mars-yellow">Voto de Calidad:</span> En caso de empate, el CEO ejerce el voto de calidad para cerrar el acta.</li>
                    <li><span class="text-mars-yellow">Alertas HR:</span> Usa el botón de Reporte de Inactividad para escalar al Claustro Docente cualquier bloqueo grave.</li>
                </ul>`;
                break;
            case 'dossier':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Dossier Académico</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Evaluación:</span> Consulta las notas y el feedback del profesorado en tiempo real.</li>
                    <li><span class="text-mars-yellow">Archivo:</span> Acceso directo a todos los entregables oficiales subidos por la empresa.</li>
                </ul>`;
                break;
            case 'admin':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Centro de Mando Docente</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">AEE & Finanzas:</span> Control económico, patrocinios, sanciones y aduana de contratos B2B.</li>
                    <li><span class="text-mars-yellow">Rúbricas:</span> Evalúa a las startups y consulta el archivo documental central.</li>
                    <li><span class="text-mars-yellow">Startups:</span> Crea empresas y gestiona los PINs de acceso de los alumnos.</li>
                    <li><span class="text-mars-yellow">Alertas HR:</span> Media en los conflictos reportados por los alumnos.</li>
                </ul>`;
                break;
            default:
                content += `<p>Navega por las pestañas para ver la ayuda contextual de cada sección.</p>`;
        }
        
        content += `</div>`;
        this.showModal(title, content, "");
    },

    modalSuggestion() {
        const history = (state.data.suggestionsToAlex || []).slice(0, 5).map(s => 
            `<div class="border-b border-mars-yellow/30 pb-2 mb-2"><span class="text-mars-yellow font-bold uppercase text-[9px]">${s.author} - ${s.date}</span><p class="text-slate-300 italic text-[10px] mt-1">"${s.text}"</p></div>`
        ).join('') || '<p class="text-slate-500 italic text-[10px]">No hay sugerencias recientes.</p>';

        const html = `
            <p class="text-xs text-slate-400 mb-4 uppercase">¿Has encontrado un error (bug) o tienes una sugerencia de mejora para MARS-KET?</p>
            <textarea id="sugg-text" class="w-full bg-slate-900 border border-mars-yellow/50 p-3 text-xs text-white h-24 focus:border-mars-yellow outline-none mb-4" placeholder="Escribe aquí tu reporte o idea..."></textarea>
            <div class="bg-black/50 border border-slate-700 p-3 max-h-40 overflow-y-auto">
                <h4 class="text-mars-cyan text-[10px] uppercase font-bold mb-2">Últimos Envíos</h4>
                ${history}
            </div>
        `;
        const actions = `<button onclick="ui.submitSuggestion()" class="bg-mars-yellow text-black px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all">Enviar a Buzón Dev</button>`;
        this.showModal("Reporte de Telemetría al Desarrollador", html, actions);
    },

    submitSuggestion() {
        const elText = document.getElementById('sugg-text');
        if(!elText) return; // REGLA 3
        const text = elText.value;
        if(text.length < 5) return alert("Por favor, describe con más detalle.");
        let author = state.user ? `${state.user.role} (${state.user.admin ? 'DOCENTE' : state.data.companies[state.user.coId].name})` : 'ANÓNIMO';
        
        state.data.suggestionsToAlex = state.data.suggestionsToAlex || [];
        state.data.suggestionsToAlex.unshift({ id: 'SUG-'+Date.now(), author, text, date: new Date().toLocaleString() });
        state.save();
        this.closeModal();
        alert("Reporte enviado. ¡Gracias por contribuir a MARS-KET 2.0!");
    },

    generateHeroBanner() {
        if (state.user.admin) return '';
        const co = state.data.companies[state.user.coId];
        
        // REGLA 4: Validación de Sesiones Huérfanas
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
        if (!state.user || state.user.admin) return; // REGLA 2
        const co = state.data.companies[state.user.coId];
        if (!co) return; // REGLA 4

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
                const pendingTech = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
                const pendingMkt = (co.marketingPackages || []).filter(p => p.status === 'PENDIENTE_FINANZAS').length;
                pendingOrders = pendingTech + pendingMkt;
            } else if (state.user.role === 'TECNICO') {
                pendingOrders = (co.orders || []).filter(o => o.status === 'PENDIENTE_FINANZAS').length;
            }
            if (pendingOrders > 0) { elOrders.innerText = pendingOrders; elOrders.classList.remove('hidden'); }
            else { elOrders.classList.add('hidden'); }
        }

        const elCart = document.getElementById('badge-cart');
        if (elCart) {
            const pendingLogistics = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS').length;
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
        if(!vp) return; // REGLA 3
        
        vp.innerHTML = '';
        if(!state.user) { this.viewLogin(vp); return; }
        
        // REGLA 4: Validación de Sesiones Huérfanas
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

        // FASE 1: Hotfix de Enrutamiento Docente (Permitir market y dossier)
        if (state.user.admin && !['admin', 'market', 'dossier'].includes(this.current)) {
            this.current = 'admin';
        } else if (!state.user.admin && !allowedRoutes[state.user.role].includes(this.current)) {
            this.current = allowedRoutes[state.user.role][0]; // fallback
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
                    <div class="overflow-hidden pr-2"><span class="text-mars-cyan font-bold uppercase block truncate">${title}</span><span class="text-[8px] text-slate-400 block truncate">${docObj.type === 'link' ? 'ENLACE' : docObj.name} | ${docObj.date.slice(0,10)}</span></div>
                    <a href="${docObj.dataUrl}" target="_blank" download="${docObj.type==='file'?docObj.name:''}" class="bg-mars-cyan text-black px-2 sm:px-3 py-1 font-bold uppercase hover:bg-white transition-colors flex-shrink-0">${docObj.type === 'link' ? 'Abrir' : 'Descargar'}</a>
                </div>`;
    },
    
    renderHybridUploadBox(title, desc, docKey, currentDoc) {
        return `
        <div class="border-b border-slate-800 pb-4 mb-4">
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