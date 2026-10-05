// js/ui-core.js
// --- 6. MOTOR DE INTERFAZ (UI) - CORE & ROUTER ---
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

    showWelcomeModal() {
        if (sessionStorage.getItem('hideWelcome')) return;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        document.getElementById('onboarding-title').innerText = `¡HOLA, ${role.replace('_',' ')}! 🚀`;
        let content = `<div class="space-y-4 font-mono text-sm leading-relaxed">`;
        
        switch(role) {
            case 'CEO': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido a la silla de la presidencia!</p>
                <p class="text-slate-300">Tu misión principal es que la startup no se hunda antes del despegue.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Vigila el <strong>Cronograma Maestro</strong>. La Agencia Espacial Escolar (AEE) no perdona los retrasos y las multas duelen.</li>
                    <li>Supervisa la <strong>Bóveda de Órdenes</strong>. Asegúrate de que Finanzas y Operaciones fluyan sin cuellos de botella.</li>
                    <li>Si hay peleas en el equipo, usa tu <strong>voto de calidad</strong> en la pestaña de Gobernanza.</li>
                    <li>Gestiona el <strong>Rol Observador (Auxiliar)</strong> para dar acceso de solo lectura a miembros adicionales del equipo.</li>
                    <li>Emite <strong>Reportes de Inactividad</strong> (Alertas HR) desde Gobernanza si un departamento paraliza la misión.</li>
                </ul>`; 
                break;
            case 'TECNICO': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, cerebro de la propulsión química! 🧪</p>
                <p class="text-slate-300">De ti depende que el cohete suba y no explote en la rampa de lanzamiento.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Pide los materiales en el <strong>SUPERMARS-KET</strong> y justifica muy bien por qué los necesitas.</li>
                    <li>Registra cada ensayo en el <strong>Banco de Pruebas</strong>. Recuerda: buscamos la máxima eficiencia (E = Altura / Coste).</li>
                    <li>Selecciona los componentes definitivos en el <strong>Configurador de Prototipo (BOM)</strong> basándote en el histórico de compras.</li>
                    <li>Sube tu <strong>Informe Técnico</strong> a tiempo para que Física y Química te evalúe.</li>
                    <li>Emite <strong>Reportes de Inactividad</strong> desde Gobernanza si otro departamento bloquea tu I+D.</li>
                </ul>`; 
                break;
            case 'FINANZAS': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, guardián de la caja virtual! 💰</p>
                <p class="text-slate-300">Sin tu luz verde presupuestaria, aquí no se mueve ni un tornillo.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Revisa las peticiones del Técnico. Si no hay fondos o la justificación es mala, <strong>deniega sin piedad</strong>.</li>
                    <li>Realiza <strong>Auditorías Parciales</strong> desmarcando ítems específicos de una orden si no consideras justificado todo el gasto.</li>
                    <li>Vigila el <strong>Ledger Inmutable</strong>. Cada céntimo virtual gastado afecta a la rentabilidad.</li>
                    <li>Prepara el <strong>Libro de Cuentas</strong> oficial para la evaluación de Economía.</li>
                    <li>Emite <strong>Reportes de Inactividad</strong> desde Gobernanza si detectas bloqueos operativos.</li>
                </ul>`; 
                break;
            case 'MARKETING': 
                content += `<p class="text-mars-cyan font-bold">¡Hola, genio creativo! 🎨</p>
                <p class="text-slate-300">Un cohete sin marca es solo un tubo de plástico con vinagre.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Sube el <strong>Logotipo</strong> transparente y define un <strong>Eslogan</strong> pegadizo.</li>
                    <li>Redacta la <strong>Propuesta de Valor</strong>. Necesitamos convencer a los inversores para conseguir patrocinios Oro.</li>
                    <li>Consulta el panel de <strong>Inteligencia de Mercado</strong> para usar datos reales de I+D y eficiencia en tus pitches.</li>
                    <li>Registra las <strong>Campañas de Marketing</strong>, detallando la estrategia promocional y enlazando las creatividades (Drive/Canva) en el histórico.</li>
                    <li>Prepara y sube las presentaciones para los <strong>Pitches de Oratoria</strong> (Inglés y Lengua).</li>
                    <li>Emite <strong>Reportes de Inactividad</strong> desde Gobernanza si necesitas escalar un bloqueo al Claustro.</li>
                </ul>`; 
                break;
            case 'OPERACIONES_IA': 
                content += `<p class="text-mars-cyan font-bold">¡Saludos, maestro de la logística y la ética IA! 📦🤖</p>
                <p class="text-slate-300">Tú conectas el mundo virtual con el mundo físico real.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>En la pestaña <strong>Logística</strong>, valida el ensamblaje de las compras aprobadas por Finanzas y anota lo que han costado en euros reales (€).</li>
                    <li>Vigila la <strong>Bitácora IA</strong>. Audita que nadie del equipo use ChatGPT o Claude sin verificar humanamente la información.</li>
                    <li>Emite <strong>Reportes de Inactividad</strong> desde Gobernanza si el flujo logístico se detiene.</li>
                </ul>`; 
                break;
            case 'AUXILIAR': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido, Observador! 👁️</p>
                <p class="text-slate-300">Tienes acceso de solo lectura a los sistemas de la corporación.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Consulta el <strong>SUPERMARS-KET</strong> para ver el catálogo de componentes.</li>
                    <li>Revisa el <strong>Dossier y Notas</strong> para seguir el progreso académico y documental.</li>
                    <li>Observa las mociones en <strong>Gobernanza</strong> (sin derecho a voto).</li>
                </ul>`; 
                break;
            case 'DOCENTE': 
                content += `<p class="text-mars-cyan font-bold">¡Bienvenido al Alto Mando, Inspector/a! 🎖️</p>
                <p class="text-slate-300">El Centro de Mando Docente está listo para la evaluación.</p>
                <ul class="list-disc pl-5 space-y-2 mt-2 text-slate-400">
                    <li>Usa la pestaña <strong>Rúbricas & Entregas</strong> para calificar en tiempo real.</li>
                    <li>Filtra las actas y el archivo documental por <strong>Clases (A-F)</strong> para una evaluación más ágil.</li>
                    <li>Revisa el <strong>Archivo Documental</strong> centralizado de todas las startups.</li>
                    <li>Vigila las <strong>Alertas HR</strong> en Telemetría para mediar en reportes de inactividad de los alumnos.</li>
                    <li>En <strong>Ajustes</strong>, gestiona la fecha de entrega exclusiva de tu asignatura. La Coordinación mantiene el control global (patrocinios, plazos maestros, catálogo y sanciones AEE).</li>
                </ul>`; 
                break;
        }
        content += `</div>`;
        document.getElementById('onboarding-body').innerHTML = content;
        document.getElementById('onboarding-overlay').classList.remove('hidden');
    },

    closeOnboarding() {
        if(document.getElementById('skip-onboarding').checked) {
            sessionStorage.setItem('hideWelcome', 'true');
        }
        document.getElementById('onboarding-overlay').classList.add('hidden');
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
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Catálogo de Aprovisionamiento</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Origen de Materiales:</span> Fíjate en el país de origen de cada componente. Esto es vital para el análisis de rutas comerciales internacionales en Economía.</li>
                    <li><span class="text-mars-yellow">Peticiones:</span> Solo el Dpto. Técnico puede añadir materiales al borrador. Al pulsar "Transmitir a Finanzas", se exigirá una justificación técnica.</li>
                    <li><span class="text-mars-yellow">Reactivos:</span> El Bicarbonato se pide en gramos y el Vinagre en dosis de 10ml. Calcula bien la estequiometría.</li>
                </ul>`;
                break;
            case 'tech':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Investigación y Desarrollo</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Banco de Pruebas:</span> Registra cada lanzamiento. El sistema calculará automáticamente la Eficiencia (E = Altura / Coste). Busca maximizar este KPI.</li>
                    <li><span class="text-mars-yellow">Configurador BOM:</span> Selecciona qué componentes del histórico de compras forman el cohete final para calcular su coste exacto.</li>
                    <li><span class="text-mars-yellow">Entregable FYQ:</span> Sube el Informe Técnico (PDF o URL) con los cálculos estequiométricos, leyes de Newton y diseño aerodinámico.</li>
                </ul>`;
                break;
            case 'orders':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Control Presupuestario</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Circuito de Aprobación:</span> Las órdenes llegan como "PENDIENTE FINANZAS". El Dpto. Financiero debe auditar la justificación técnica y dar luz verde o denegar.</li>
                    <li><span class="text-mars-yellow">Cronograma:</span> Vigila los semáforos de plazos. Si un entregable entra en rojo (Vencido), la AEE aplicará multas severas al balance virtual.</li>
                </ul>`;
                break;
            case 'finance':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Auditoría y Contabilidad</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Aprobación Parcial:</span> Puedes aprobar solo ciertos ítems de una orden desmarcándolos antes de confirmar.</li>
                    <li><span class="text-mars-yellow">Ledger Inmutable:</span> Todas las transacciones virtuales (compras, multas, patrocinios) quedan registradas aquí de forma permanente.</li>
                    <li><span class="text-mars-yellow">Historial Ejecutado:</span> Revisa el desglose detallado de las órdenes que ya han sido compradas físicamente.</li>
                    <li><span class="text-mars-yellow">Gasto Físico:</span> Controla el dinero real (€) que Operaciones anota al hacer las compras físicas.</li>
                    <li><span class="text-mars-yellow">Entregable ECO:</span> Sube el Libro de Cuentas Financiero con el ROI y los balances para su evaluación.</li>
                </ul>`;
                break;
            case 'cart':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Logística y Ejecución Física</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Órdenes Aprobadas:</span> Aquí aparecen las órdenes que Finanzas ha autorizado.</li>
                    <li><span class="text-mars-yellow">Validación:</span> Debes marcar el ensamblaje de cada pieza, anotar el coste real físico (€) y la tienda/proveedor.</li>
                    <li><span class="text-mars-yellow">Ejecución:</span> Al pulsar "Confirmar Compra", se descontará el dinero virtual del Ledger y se guardarán los costes reales.</li>
                </ul>`;
                break;
            case 'brand':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Identidad Corporativa y Oratoria</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Branding:</span> Sube un logo transparente (PNG/JPG < 1MB) y define el eslogan para personalizar tu HUD.</li>
                    <li><span class="text-mars-yellow">Inteligencia de Mercado:</span> Utiliza los KPIs y el registro del mejor ensayo de vuelo para respaldar tu propuesta de valor ante inversores.</li>
                    <li><span class="text-mars-yellow">Campañas de Marketing:</span> Registra las acciones promocionales y adjunta enlaces a las creatividades para dejar constancia en el histórico de la corporación.</li>
                    <li><span class="text-mars-yellow">Propuesta de Valor:</span> Redacta el manifiesto de la empresa. Es clave para atraer inversores y patrocinios.</li>
                    <li><span class="text-mars-yellow">Pitches:</span> Sube los enlaces o PDFs de las presentaciones para las defensas de Inglés (Fase I) y Lengua (Fase III).</li>
                </ul>`;
                break;
            case 'ailog':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Auditoría de Inteligencia Artificial</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Transparencia:</span> Cualquier miembro del equipo que use IA (ChatGPT, Claude, etc.) debe registrar el prompt exacto aquí.</li>
                    <li><span class="text-mars-yellow">Verificación:</span> Es obligatorio explicar cómo se ha verificado humanamente que la IA no ha alucinado.</li>
                    <li><span class="text-mars-yellow">Aprobación:</span> Operaciones IA debe revisar y aprobar los prompts para integrarlos a la bitácora oficial del dossier.</li>
                </ul>`;
                break;
            case 'resolutions':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Gobernanza y Actas</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Mociones:</span> Cualquier miembro puede proponer una moción para tomar decisiones de equipo.</li>
                    <li><span class="text-mars-yellow">Votaciones:</span> Todos deben votar a favor o en contra.</li>
                    <li><span class="text-mars-yellow">Voto de Calidad:</span> En caso de empate, el CEO tiene la responsabilidad de ejercer el voto de calidad para cerrar el acta.</li>
                    <li><span class="text-mars-yellow">Alertas HR:</span> Usa el botón de Reporte de Inactividad para escalar al Claustro Docente cualquier bloqueo grave por inacción de un departamento.</li>
                </ul>`;
                break;
            case 'dossier':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Expediente Académico</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">Evaluación Continua:</span> Consulta en tiempo real las calificaciones y el feedback cualitativo del claustro en las 6 materias oficiales.</li>
                    <li><span class="text-mars-yellow">Archivo Documental:</span> Acceso rápido a todos los entregables (PDFs y enlaces) que la startup ha subido al sistema.</li>
                </ul>`;
                break;
            case 'admin':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Centro de Mando Docente</p>
                <ul class="list-disc pl-5 space-y-2 text-slate-300">
                    <li><span class="text-mars-yellow">AEE & Finanzas:</span> Visión global del gasto real de la clase, patrocinios y emisión de expedientes sancionadores.</li>
                    <li><span class="text-mars-yellow">Rúbricas:</span> Evalúa a las startups en tiempo real. La nota ponderada se calcula automáticamente.</li>
                    <li><span class="text-mars-yellow">Filtrado por Aulas:</span> Usa el selector de Clases (A-F) para segmentar la vista en las actas y el archivo documental.</li>
                    <li><span class="text-mars-yellow">Alertas HR:</span> En Telemetría, revisa y resuelve los reportes de inactividad emitidos por los alumnos.</li>
                    <li><span class="text-mars-yellow">Catálogo:</span> (Solo Coordinación) Modifica precios para simular inflación o añade nuevos componentes al mercado global.</li>
                    <li><span class="text-mars-yellow">Ajustes (Control Granular):</span> Configura el plazo de entrega específico de tu materia. Si tienes rango de Coordinación, visualizarás el panel maestro con todos los plazos y parámetros globales.</li>
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
            <p class="text-xs text-slate-400 mb-4 uppercase">¿Has encontrado un error (bug) o tienes una sugerencia de mejora para MARS-KET? Alex revisará tu mensaje en el buzón central.</p>
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
        const text = document.getElementById('sugg-text').value;
        if(text.length < 5) return alert("Por favor, describe con más detalle.");
        let author = state.user ? `${state.user.role} (${state.user.admin ? 'DOCENTE' : state.data.companies[state.user.coId].name})` : 'ANÓNIMO';
        if(!state.data.suggestionsToAlex) state.data.suggestionsToAlex = [];
        state.data.suggestionsToAlex.unshift({ id: 'SUG-'+Date.now(), author, text, date: new Date().toLocaleString() });
        state.save();
        this.closeModal();
        alert("Reporte enviado. ¡Gracias por contribuir a MARS-KET 2.0!");
    },

    generateHeroBanner() {
        if (state.user.admin) return '';
        const co = state.data.companies[state.user.coId];
        
        // BLINDAJE: Si la empresa fue eliminada pero la sesión sigue activa, forzamos logout
        if (!co) {
            auth.logout();
            return '';
        }
        
        let sponsorBadge = '';
        if(co.sponsorAwarded) {
            const color = co.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700] bg-[#ffd700]/10':co.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0] bg-[#c0c0c0]/10':'text-[#cd7f32] border-[#cd7f32] bg-[#cd7f32]/10';
            sponsorBadge = `<span class="${color} border px-2 py-1 font-black shadow-[0_0_10px_currentColor]">[PATROCINIO ${co.sponsorAwarded}]</span>`;
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
                    <span class="bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2 py-1">AUTH: ${state.user.role.replace('_',' ')}</span>
                    ${sponsorBadge}
                </div>
            </div>
        </div>`;
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
            
            const countEl = document.getElementById('cart-count');
            if(countEl && co) {
                if (state.user.role === 'OPERACIONES_IA' || state.user.role === 'TECNICO') {
                    const pendingOps = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS').length;
                    countEl.innerText = pendingOps;
                    countEl.style.display = pendingOps > 0 ? 'inline-block' : 'none';
                } else {
                    countEl.style.display = 'none';
                }
            }

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
    },
    
    render() {
        const vp = document.getElementById('viewport');
        if(!vp) return;
        vp.innerHTML = '';
        if(!state.user) { this.viewLogin(vp); return; }
        
        // BLINDAJE: Validar que la entidad existe (si es alumno y la empresa se borró)
        if (!state.user.admin && !state.data.companies[state.user.coId]) {
            auth.logout();
            return;
        }
        
        // Route protection
        const allowedRoutes = {
            'CEO': ['orders', 'finance', 'resolutions', 'dossier', 'market'],
            'TECNICO': ['market', 'tech', 'cart', 'orders', 'dossier'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market'],
            'MARKETING': ['brand', 'market', 'dossier'],
            'OPERACIONES_IA': ['market', 'cart', 'ailog', 'dossier'],
            'AUXILIAR': ['market', 'resolutions', 'dossier']
        };

        if (state.user.admin && !['admin', 'market', 'dossier'].includes(this.current)) {
            this.current = 'admin';
        } else if (!state.user.admin && !allowedRoutes[state.user.role].includes(this.current)) {
            this.current = allowedRoutes[state.user.role][0]; // fallback
        }
        
        this.updateHUD();
        const hero = this.generateHeroBanner();
        
        switch(this.current) {
            case 'market': vp.innerHTML = hero; this.viewMarket(vp); break;
            case 'cart': vp.innerHTML = hero; this.viewCart(vp); break;
            case 'orders': vp.innerHTML = hero; this.viewOrders(vp); break;
            case 'finance': vp.innerHTML = hero; this.viewFinance(vp); break;
            case 'admin': this.viewAdmin(vp); break;
            case 'dossier': vp.innerHTML = hero; this.viewDossier(vp); break;
            case 'brand': vp.innerHTML = hero; this.viewBrand(vp); break;
            case 'ailog': vp.innerHTML = hero; this.viewAILog(vp); break;
            case 'tech': vp.innerHTML = hero; this.viewTech(vp); break;
            case 'resolutions': vp.innerHTML = hero; this.viewResolutions(vp); break;
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
        document.getElementById('modal-title').innerText = title; 
        document.getElementById('modal-body').innerHTML = body; 
        document.getElementById('modal-actions').innerHTML = actions + `<button onclick="ui.closeModal()" class="bg-slate-800 text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-slate-700 transition-all shadow-md border border-slate-600">Cerrar</button>`; 
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal() { 
        document.getElementById('modal-overlay').classList.add('hidden'); 
    }
};