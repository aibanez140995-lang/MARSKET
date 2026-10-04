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
        // Helper para forzar icono negro en PWA si es necesario
        const metaTheme = document.querySelector('meta[name="theme-color"]');
        if (metaTheme) metaTheme.setAttribute('content', '#000000');
    },

    showWelcomeModal() {
        if (sessionStorage.getItem('hideWelcome')) return;
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        document.getElementById('onboarding-title').innerText = `PROTOCOLO INCORPORACIÓN: ${role.replace('_',' ')}`;
        let content = `<div class="space-y-4 font-mono">`;
        switch(role) {
            case 'CEO': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Revise el Cronograma Maestro de entregas para evitar sanciones de la AEE.</li><li>Vigile la Bóveda de Órdenes: ejecute los pagos (coste real + virtual) cuando Finanzas apruebe el presupuesto.</li><li>Supervise las mociones de Gobernanza en caso de conflicto.</li></ul>`; break;
            case 'TECNICO': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Consulte el SUPERMARS-KET y solicite el aprovisionamiento de componentes.</li><li>Registre sus ensayos en el Banco de Pruebas para encontrar el KPI de eficiencia ideal.</li><li>Descargue la guía de FYQ y suba su Informe Técnico.</li></ul>`; break;
            case 'FINANZAS': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Audite que el Coste Físico Real (€) registrado por Operaciones sea verídico.</li><li>Apruebe el Presupuesto (Virtual) en las Órdenes de Compra para que el CEO pueda ejecutarlas.</li><li>Prepare el Libro de Cuentas Oficial para Evaluación.</li></ul>`; break;
            case 'MARKETING': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Suba el Logo en formato transparente y asigne un Eslogan.</li><li>Redacte la Propuesta de Valor para captar Patrocinadores (Oro/Plata/Bronce).</li><li>Comience el desarrollo del Pitch de Fase I y súbalo al sistema.</li></ul>`; break;
            case 'OPERACIONES_IA': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Verifique los componentes en el carrito, indique su Coste Físico Real (€) y Tienda, y transmítalos a Finanzas.</li><li>Revise y apruebe los Prompts de IA generados por el resto del equipo en el Buzón.</li></ul>`; break;
            case 'DOCENTE': content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Acciones Inmediatas:</p><ul class="list-disc pl-5 space-y-2"><li>Verifique el estado de las entregas de las empresas en el Archivo Documental.</li><li>Utilice la pestaña 'Evaluar Rúbrica' para calificar y descargar las evidencias.</li><li>En caso de Coordinación, revise la bandeja de Patrocinios, Ajuste de Plazos y sugerencias a Alex.</li></ul>`; break;
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
        let role = state.user ? state.user.role : '';
        if(state.user && state.user.admin) role = 'DOCENTE';
        
        let title = "Manual de Operaciones: " + role.replace('_',' ');
        let content = `<div class="space-y-4 text-xs leading-relaxed font-mono">`;
        
        switch(role) {
            case 'CEO':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones de la Presidencia</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Bóveda de Autorización:</span> Ejecuta las compras físicas que han sido previamente auditadas y aprobadas por Finanzas.</li>
                    <li><span class="text-mars-yellow">Gobernanza y Actas:</span> Redacta y publica actas para resolver empates en las votaciones del equipo.</li>
                    <li><span class="text-mars-yellow">Pitch & Liderazgo:</span> Supervisa la preparación de la oratoria y asume la responsabilidad final frente a las multas de retraso de la AEE.</li>
                </ul>`;
                break;
            case 'TECNICO':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones de Ingeniería y Química</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Estequiometría y Ensayos:</span> Calcula la reacción exacta. Debe registrar cada prueba de vuelo en el "Banco de Pruebas" para analizar la eficiencia.</li>
                    <li><span class="text-mars-yellow">Catálogo I+D:</span> Debe revisar el SUPERMARS-KET y pulsar "[SOLICITAR APROVISIONAMIENTO]" para que Operaciones inicie la tramitación.</li>
                    <li><span class="text-mars-yellow">Documentación:</span> Es el encargado de subir el <strong class="text-white">Informe Técnico PDF/Enlace</strong> en su panel para la evaluación de FYQ.</li>
                </ul>`;
                break;
            case 'FINANZAS':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones de Auditoría y Balance</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Auditoría Presupuestaria:</span> Recibe las órdenes verificadas por Operaciones. Si hay fondos virtuales (€v) suficientes y el gasto real (€) está justificado, pulsa [DAR LUZ VERDE] para que el CEO ejecute la compra.</li>
                    <li><span class="text-mars-yellow">Costes Reales:</span> Vigilancia estricta del dinero físico (€) gastado para no encarecer el KPI E=H/C.</li>
                    <li><span class="text-mars-yellow">Ledger:</span> Subir el Libro de Cuentas Oficial para la evaluación de Economía.</li>
                </ul>`;
                break;
            case 'MARKETING':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones de Branding e Identidad</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Logotipo y Eslogan:</span> Diseñar el logo corporativo transparente y definir el eslogan oficial.</li>
                    <li><span class="text-mars-yellow">Propuesta de Valor:</span> Redactar el manifiesto corporativo y la ventaja competitiva para atraer patrocinios de inversores.</li>
                    <li><span class="text-mars-yellow">Entregables de Oratoria:</span> Subir los archivos oficiales del Micro-Pitch (Fase I) y del Pitch Final (Fase III).</li>
                </ul>`;
                break;
            case 'OPERACIONES_IA':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones de Logística y Auditoría IA</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Gestión de Carga (Logística):</span> Verifica el ensamblaje de cada ítem de las peticiones técnicas, asigna su Coste Físico Real (€) y Comercio proveedor, y transmite la orden al departamento de Finanzas.</li>
                    <li><span class="text-mars-yellow">Bitácora IA:</span> Recibe los reportes de uso de Inteligencia Artificial del resto del equipo, audita que haya habido verificación humana y los aprueba para integrarlos al dossier final.</li>
                </ul>`;
                break;
            case 'DOCENTE':
                content += `<p class="text-mars-cyan font-bold border-b border-mars-cyan/30 pb-2">Funciones del Claustro y Coordinación</p>
                <ul class="list-disc pl-5 space-y-2">
                    <li><span class="text-mars-yellow">Rúbricas de Evaluación:</span> Seleccione una empresa y registre las notas (0-10) según sus criterios. El cálculo ponderado se realiza en tiempo real. Descargue desde ahí las evidencias de cada materia.</li>
                    <li><span class="text-mars-yellow">Sanciones AEE:</span> Aplique multas con el desplegable normativo a las empresas infractoras.</li>
                    <li><span class="text-mars-yellow">Coordinación (Mario/Alex):</span> Controlan los Patrocinios, pueden editar los Plazos (Deadlines), descargar el Acta General y consultar el Archivo Documental de todas las asignaturas.</li>
                </ul>`;
                break;
            default:
                content += `<p>Acceda con un rol para visualizar las instrucciones operativas.</p>`;
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
            if(balEl) balEl.innerText = `${co.balance.toFixed(2)} €v`;
            if(infoEl) infoEl.innerText = `ENTITY: ${co.name.toUpperCase()} | ROLE: ${state.user.role.replace('_',' ')}`;
            
            const countEl = document.getElementById('cart-count');
            if(countEl) {
                if (state.user.role === 'OPERACIONES_IA' || state.user.role === 'TECNICO') {
                    const pendingOps = (co.orders || []).filter(o => o.status === 'APROBADO_FINANZAS').length;
                    countEl.innerText = pendingOps;
                    countEl.style.display = pendingOps > 0 ? 'inline-block' : 'none';
                } else {
                    countEl.style.display = 'none';
                }
            }

            if(miniLogo) {
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
            if(t.getAttribute('onclick').includes(`('${this.current}')`)) t.classList.add('tab-active', 'text-mars-cyan');
        });
    },
    
    render() {
        const vp = document.getElementById('viewport');
        if(!vp) return;
        vp.innerHTML = '';
        if(!state.user) { this.viewLogin(vp); return; }
        
        // Route protection
        const allowedRoutes = {
            'CEO': ['orders', 'finance', 'resolutions', 'dossier', 'market'],
            'TECNICO': ['market', 'tech', 'cart', 'orders', 'dossier'],
            'FINANZAS': ['finance', 'orders', 'dossier', 'market'],
            'MARKETING': ['brand', 'market', 'dossier'],
            'OPERACIONES_IA': ['market', 'cart', 'ailog', 'dossier']
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