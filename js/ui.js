
// js/ui.js
// --- 6. MOTOR DE INTERFAZ (UI) ---
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

    modalAEEFine(cid) {
        const co = state.data.companies[cid];
        const html = `
            <div class="space-y-4">
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Infracción Tipificada (AEE)</label>
                    <select id="aee-article" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="AEE Art. 12: Incumplimiento de cronograma y plazos oficiales">Art. 12: Incumplimiento Plazos</option>
                        <option value="AEE Art. 18: Inconsistencia o defecto en justificación técnica/química">Art. 18: Defecto Técnico</option>
                        <option value="AEE Art. 24: Anomalía en balance o trazabilidad contable">Art. 24: Anomalía Contable</option>
                        <option value="AEE Art. 31: Falta de rigor en protocolo de seguridad de vuelo">Art. 31: Brecha Seguridad Vuelo</option>
                    </select>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Dictamen del Inspector</label>
                    <textarea id="aee-reason" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white h-20 outline-none focus:border-mars-magenta" placeholder="Describa el motivo específico de la sanción..."></textarea>
                </div>
                <div>
                    <label class="text-[9px] text-mars-magenta uppercase font-bold block mb-1">Cuantía de la Multa</label>
                    <select id="aee-amount" class="w-full bg-slate-900 border border-mars-magenta/50 p-2 text-xs text-white uppercase outline-none focus:border-mars-magenta">
                        <option value="-10">-10 €v (Leve)</option>
                        <option value="-100">-100 €v (Moderada)</option>
                        <option value="-200">-200 €v (Grave)</option>
                    </select>
                </div>
            </div>
        `;
        const actions = `<button onclick="ui.submitAEEFine('${cid}')" class="bg-red-800 text-white px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all border border-red-500 shadow-[0_0_10px_red]">Tramitar Expediente AEE</button>`;
        this.showModal(`EXPEDIENTE DISCIPLINARIO: ${co.name}`, html, actions);
    },

    submitAEEFine(cid) {
        const article = document.getElementById('aee-article').value;
        const reason = document.getElementById('aee-reason').value;
        const amount = parseFloat(document.getElementById('aee-amount').value);
        if(!reason) return alert("El dictamen del inspector es obligatorio.");
        
        const concept = `[EXPEDIENTE AEE] ${article} - ${reason}`;
        state.addToLedger(cid, concept, 'DOCENTE_AEE', amount);
        this.closeModal();
        this.render();
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) return alert("Solo PNG/JPG.");
        if (file.size > 1024 * 1024) return alert("Máximo 1MB para el logo.");
        const reader = new FileReader();
        reader.onload = (ev) => {
            state.data.companies[state.user.coId].logo = ev.target.result;
            telemetry.log("BRANDING", "LOGO ACTUALIZADO");
            state.save();
            this.render();
            alert("Logotipo corporativo guardado.");
        };
        reader.readAsDataURL(file);
    },

    handleDeliverableHybridSubmit(docType) {
        const fileInput = document.getElementById(`upload-file-${docType}`);
        const urlInput = document.getElementById(`upload-url-${docType}`);
        const file = fileInput.files[0];
        const url = urlInput.value;
        
        if(!file && !url) return alert("Debe adjuntar un archivo o proporcionar un enlace (URL).");
        
        const co = state.data.companies[state.user.coId];
        if(!co.deliverables) co.deliverables = { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null };

        if(file) {
            if (file.size > 2 * 1024 * 1024) return alert("El archivo supera el límite de 2MB. Envíe un enlace en su lugar.");
            const reader = new FileReader();
            reader.onload = (ev) => {
                co.deliverables[docType] = { type: 'file', name: file.name, date: new Date().toLocaleString(), size: (file.size / 1024).toFixed(1) + ' KB', dataUrl: ev.target.result };
                telemetry.log("ENTREGABLE", `Archivo subido: ${docType} (${file.name})`);
                state.save(); this.render(); alert("Documento entregado.");
            };
            reader.readAsDataURL(file);
        } else if(url) {
            if(!url.startsWith('http')) return alert("La URL debe comenzar con http:// o https://");
            co.deliverables[docType] = { type: 'link', name: 'Enlace a Nube Externa', date: new Date().toLocaleString(), size: 'URL', dataUrl: url };
            telemetry.log("ENTREGABLE", `Enlace subido: ${docType}`);
            state.save(); this.render(); alert("Enlace entregado.");
        }
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
            if(countEl) countEl.innerText = co.cart.length;

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
            'TECNICO': ['market', 'tech', 'dossier'],
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

    // --- VISTAS GLOBALES ---
    viewLogin(el) {
        let coOptions = Object.keys(state.data.companies).map(k => `<option value="${k}">${state.data.companies[k].name}</option>`).join('');
        el.innerHTML = `
        <div class="max-w-md mx-auto mt-12 terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300 mx-4">
            <img src="/logo.png" alt="MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
            <h2 class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-6 tracking-widest uppercase font-black">Secure_Access</h2>
            <select id="login-co" onchange="auth.updateRoleOptions()" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-4 outline-none focus:border-mars-cyan text-white">
                ${coOptions}
                <option value="admin" class="text-mars-yellow font-bold">CLAUSTRO DOCENTE</option>
            </select>
            <select id="login-role" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-6 outline-none focus:border-mars-cyan uppercase text-white font-bold">
                <option>CEO</option><option>Técnico</option><option>Finanzas</option><option>Marketing</option><option>Operaciones IA</option>
            </select>
            <div class="flex justify-center gap-4 mb-8">
                ${[1,2,3,4].map(() => `<div class="pin-dot w-3 h-3 rounded-full border border-mars-cyan transition-all"></div>`).join('')}
            </div>
            <div class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto">
                ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="auth.press('${n}')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                <button onclick="auth.clear()" class="bg-slate-800 p-4 text-mars-magenta text-xs font-bold hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                <button onclick="auth.press('0')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                <button onclick="auth.verify()" class="bg-mars-green/20 border border-mars-green text-mars-green p-4 text-xs font-bold hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
            </div>
        </div>`;
    },

    viewMarket(el) {
        const wrapper = document.createElement('div');
        let topSection = '';
        
        if(state.user && state.user.role === 'TECNICO') {
            const co = state.data.companies[state.user.coId];
            const docs = co.deliverables || {};
            topSection = `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-6">
                <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Documentación Científico-Técnica</h2>
                <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Suba el Informe Técnico Oficial (Estequiometría, Leyes de Newton y Aerodinámica) en formato PDF o Enlace.</p>
                ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
            </div>`;
        }

        wrapper.innerHTML = `
        ${topSection}
        <div class="flex flex-wrap justify-between items-center gap-4 mb-6">
            <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl uppercase tracking-tighter">SUPERMARS-KET Oficial</h2>
            ${!state.user.admin && state.user.role === 'TECNICO' ? `<button onclick="ui.modalCustom()" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-3 py-1.5 text-[9px] sm:text-[10px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-all whitespace-nowrap">Solicitar I+D</button>` : ``}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            ${state.data.catalog.map(item => {
                let buySection = '';
                if(!state.user.admin) {
                    if (state.user.role === 'TECNICO') {
                        if (item.id === 'P01') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.requestToCart('${item.id}', 10)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+10g</button><button onclick="ui.requestToCart('${item.id}', 25)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+25g</button><button onclick="ui.requestToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50g</button></div>`;
                        } else if (item.id === 'P02') {
                            buySection = `<div class="flex gap-1 mt-2"><button onclick="ui.requestToCart('${item.id}', 50)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+50ml</button><button onclick="ui.requestToCart('${item.id}', 100)" class="flex-1 bg-mars-cyan/10 border border-mars-cyan text-mars-cyan py-1 text-[9px] font-bold hover:bg-mars-cyan hover:text-black">+100ml</button></div>`;
                        } else {
                            buySection = `<div class="flex items-center gap-2 mt-2"><input type="number" id="qty-${item.id}" value="1" min="1" class="w-12 bg-black border border-mars-border text-center text-[10px] text-white p-1"><button onclick="ui.requestToCart('${item.id}', parseInt(document.getElementById('qty-${item.id}').value)||1)" class="flex-grow bg-mars-cyan/10 border border-mars-cyan text-mars-cyan px-2 py-1 text-[9px] font-black uppercase hover:bg-mars-cyan hover:text-mars-bg transition-all">Pedir a Operaciones</button></div>`;
                        }
                    } else {
                        buySection = `<p class="text-[8px] text-slate-500 uppercase mt-2 border-t border-slate-800 pt-2">El Dpto. Técnico realiza las peticiones.</p>`;
                    }
                }

                return `
                <div class="terminal-border bg-mars-card p-4 group hover:border-mars-cyan transition-all flex flex-col justify-between">
                    <div>
                        <div class="flex justify-between text-[8px] text-slate-500 mb-2 uppercase font-bold tracking-widest"><span>${item.category}</span><span class="text-mars-yellow">${item.unit}</span></div>
                        <h3 class="font-orbitron text-white text-[11px] mb-2 leading-tight uppercase">${item.name}</h3>
                    </div>
                    <div>
                        <span class="text-mars-green font-black text-base font-mono tracking-tighter">${item.price.toFixed(2)} €v</span>
                        ${buySection}
                    </div>
                </div>`;
            }).join('')}
        </div>`;
        el.appendChild(wrapper);
    },

    viewTech(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
        const wrapper = document.createElement('div');
        
        let ftHtml = co.flightTests.map(f => `
            <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                <td class="py-2 text-slate-400">${f.date}</td>
                <td class="py-2 font-bold text-white">${f.bottle}</td>
                <td class="py-2 text-mars-cyan">${f.naHCO3}g / ${f.vinegar}ml</td>
                <td class="py-2 font-mono text-mars-magenta">${f.costEurV.toFixed(2)}</td>
                <td class="py-2 font-mono text-mars-green font-bold text-base">${f.heightM.toFixed(1)}</td>
                <td class="py-2 font-orbitron text-mars-yellow font-black">${f.efficiency.toFixed(3)}</td>
            </tr>
        `).join('') || `<tr><td colspan="6" class="text-center py-4 text-slate-600 italic text-xs">No hay ensayos registrados.</td></tr>`;

        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-1 space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-2 uppercase tracking-tighter">Documentación Técnica</h2>
                    ${state.data.config.guidelines.techReportNotes ? `<p class="text-[10px] text-mars-yellow mb-3 italic">Info: ${state.data.config.guidelines.techReportNotes}</p>` : ''}
                    ${state.data.config.guidelines.techReportDocUrl ? `<a href="${state.data.config.guidelines.techReportDocUrl}" target="_blank" class="block text-center border border-mars-cyan text-mars-cyan text-[10px] py-2 mb-4 font-bold uppercase hover:bg-mars-cyan hover:text-black">Descargar Guía Oficial FYQ</a>` : ''}
                    ${this.renderHybridUploadBox('Informe Técnico Oficial (PDF/Enlace)', 'Documento con cálculos estequiométricos y diseño aerodinámico.', 'technicalReport', docs.technicalReport)}
                </div>
            </div>
            <div class="lg:col-span-2 terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Banco de Pruebas de Vuelo</h2>
                <div class="bg-black border border-mars-border p-4 mb-6 grid grid-cols-2 md:grid-cols-3 gap-4 text-[10px]">
                    <input type="text" id="ft-bottle" placeholder="Botella usada (Ej: 1.5L Lisa)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-yellow">
                    <input type="number" id="ft-nahco3" placeholder="NaHCO3 (g)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan" step="0.1">
                    <input type="number" id="ft-vinegar" placeholder="Vinagre (ml)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-cyan" step="1">
                    <input type="number" id="ft-cost" placeholder="Coste Ensayo (€v)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-magenta" step="0.1">
                    <input type="number" id="ft-height" placeholder="Altura H (metros)" class="bg-slate-900 border border-slate-700 p-2 text-white outline-none focus:border-mars-green font-bold" step="0.1">
                    <button onclick="ui.submitFlightTest()" class="bg-mars-yellow text-black font-black uppercase tracking-widest hover:shadow-[0_0_10px_#ffe600] transition-all py-2">Registrar Vuelo</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-[10px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-2">Fecha</th><th>Fuselaje</th><th>Mix (Sól/Líq)</th><th>Coste (€v)</th><th>H (m)</th><th class="text-mars-yellow">E = H/C</th></tr>
                        </thead>
                        <tbody>${ftHtml}</tbody>
                    </table>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    submitFlightTest() {
        const bottle = document.getElementById('ft-bottle').value;
        const naHCO3 = parseFloat(document.getElementById('ft-nahco3').value);
        const vinegar = parseFloat(document.getElementById('ft-vinegar').value);
        const costEurV = parseFloat(document.getElementById('ft-cost').value);
        const heightM = parseFloat(document.getElementById('ft-height').value);

        if(!bottle || isNaN(naHCO3) || isNaN(vinegar) || isNaN(costEurV) || isNaN(heightM)) return alert("Rellene todos los datos numéricos del ensayo.");
        if(costEurV <= 0) return alert("El coste no puede ser cero.");

        const efficiency = heightM / costEurV;
        const co = state.data.companies[state.user.coId];
        if(!co.flightTests) co.flightTests = [];
        co.flightTests.unshift({ id: 'FLT-'+Date.now(), date: new Date().toLocaleDateString(), bottle, naHCO3, vinegar, costEurV, heightM, efficiency });
        
        telemetry.log("PRUEBA VUELO", `Registrado H=${heightM}m, E=${efficiency.toFixed(3)}`);
        state.save();
        this.render();
    },

    requestToCart(id, qty = 1) {
        const item = state.data.catalog.find(i => i.id === id);
        let name = item.name;
        if(id === 'P01' || id === 'P02') name = `${item.name} (${qty}${item.unit})`;
        
        state.data.companies[state.user.coId].cart.push({...item, qty, price: item.price * qty, name, realEur: '', realShop: ''});
        telemetry.log("REQ TÉCNICA", `Petición: ${name}`);
        state.save();
        alert(`Petición de ${name} enviada a Finanzas/Operaciones.`);
    },

    updateCartItem(idx, field, value) {
        const co = state.data.companies[state.user.coId];
        if(!co || !co.cart[idx]) return;
        if(field === 'realEur') co.cart[idx][field] = value ? parseFloat(value) : '';
        else co.cart[idx][field] = value;
    },

    viewCart(el) {
        const co = state.data.companies[state.user.coId];
        const totalVirtual = co.cart.reduce((s, i) => s + i.price, 0);
        const wrapper = document.createElement('div');
        
        const cartItemsHtml = co.cart.map((item, idx) => `
            <div class="bg-mars-card border border-mars-border p-3 flex flex-col gap-2 hover:border-mars-magenta/50 transition-all shadow-sm">
                <div class="flex justify-between items-start gap-2 flex-wrap">
                    <div class="flex-1 min-w-[150px]"><p class="text-white text-xs font-bold font-orbitron leading-tight">${item.name}</p><p class="text-[8px] text-slate-500 uppercase mt-1">Q: ${item.qty} | ${item.category}</p></div>
                    <div class="flex items-center gap-3">
                        <span class="text-mars-green font-mono font-bold whitespace-nowrap">${item.price.toFixed(2)} €v</span>
                        <button onclick="ui.removeFromCart(${idx})" class="bg-red-900/30 text-mars-magenta px-2 py-1 text-[9px] uppercase font-bold hover:bg-mars-magenta hover:text-white transition-colors">X</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 pt-2 border-t border-mars-border/50">
                    <label class="flex items-center gap-2 text-[9px] text-mars-cyan cursor-pointer p-1"><input type="checkbox" id="cart-val-${idx}" class="form-checkbox bg-black border-mars-cyan" onchange="ui.checkCartReady()"> Validado ensamblaje</label>
                    <input type="number" id="cart-eur-${idx}" value="${item.realEur !== '' ? item.realEur : ''}" placeholder="Coste Real (€)" class="bg-slate-900 border border-slate-700 text-[10px] p-2 text-white outline-none focus:border-mars-magenta" oninput="ui.updateCartItem(${idx}, 'realEur', this.value); ui.updateCartRealTotal()" min="0" step="0.01">
                    <input type="text" id="cart-shop-${idx}" value="${item.realShop || ''}" placeholder="Proveedor/Tienda" class="bg-slate-900 border border-slate-700 text-[10px] p-2 text-white uppercase outline-none focus:border-mars-magenta" oninput="ui.updateCartItem(${idx}, 'realShop', this.value)">
                </div>
            </div>
        `).join('');

        wrapper.innerHTML = `
        <h2 class="font-orbitron text-mars-cyan text-lg sm:text-xl mb-6 uppercase tracking-tighter">Logística de Despliegue (Validación Física)</h2>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 space-y-4">
                ${cartItemsHtml || '<div class="terminal-border border-dashed p-8 text-center text-slate-500 text-xs italic">El manifiesto está vacío. Espere peticiones técnicas de I+D.</div>'}
            </div>
            <div class="terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan sticky top-20">
                <div class="flex justify-between items-end border-b border-mars-border/50 pb-4 mb-4">
                    <div>
                        <p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Total Virtual (Finanzas)</p>
                        <p class="text-2xl sm:text-3xl font-orbitron text-mars-green tracking-tighter">${totalVirtual.toFixed(2)} €v</p>
                    </div>
                    <div class="text-right">
                        <p class="text-[9px] text-mars-magenta uppercase mb-1 font-bold">Suma FÍSICA</p>
                        <p id="dynamic-real-total" class="text-lg sm:text-xl font-mono text-mars-magenta font-black">0.00 €</p>
                    </div>
                </div>
                <button id="submit-order-btn" onclick="ui.submitOrder()" class="w-full bg-slate-800 text-slate-500 font-black py-4 text-[10px] uppercase tracking-widest transition-all cursor-not-allowed" disabled>Validar Todos los Ítems</button>
            </div>
        </div>`;
        el.appendChild(wrapper);
        this.updateCartRealTotal(); // Initialize
    },

    removeFromCart(idx) { 
        const co = state.data.companies[state.user.coId];
        if(co && co.cart) {
            co.cart.splice(idx, 1); 
            state.save(); 
            this.render(); 
        }
    },

    updateCartRealTotal() {
        const co = state.data.companies[state.user.coId];
        if(!co || !co.cart.length) return;
        let totalR = 0;
        for(let i=0; i<co.cart.length; i++) {
            const el = document.getElementById(`cart-eur-${i}`);
            if(el && el.value) totalR += parseFloat(el.value) || 0;
        }
        const display = document.getElementById('dynamic-real-total');
        if(display) display.innerText = totalR.toFixed(2) + ' €';
        this.checkCartReady();
    },

    checkCartReady() {
        const co = state.data.companies[state.user.coId];
        if(!co || !co.cart.length) return;
        let allChecked = true;
        for(let i=0; i<co.cart.length; i++) {
            const cb = document.getElementById(`cart-val-${i}`);
            if(!cb || !cb.checked) allChecked = false;
        }
        const btn = document.getElementById('submit-order-btn');
        if(btn) {
            if(allChecked) {
                btn.disabled = false;
                btn.className = "w-full bg-mars-cyan text-mars-bg font-black py-4 text-[10px] uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all cursor-pointer";
                btn.innerText = "Confirmar Compra Física y Ejecutar";
            } else {
                btn.disabled = true;
                btn.className = "w-full bg-slate-800 text-slate-500 font-black py-4 text-[10px] uppercase tracking-widest transition-all cursor-not-allowed";
                btn.innerText = "Validar Todos los Ítems";
            }
        }
    },

    submitOrder() {
        const co = state.data.companies[state.user.coId];
        
        let allChecked = true;
        let realEurTotal = 0;
        let processedItems = [];

        for(let i=0; i<co.cart.length; i++) {
            const cb = document.getElementById(`cart-val-${i}`);
            if(!cb || !cb.checked) { allChecked = false; break; }
            
            const rEur = parseFloat(document.getElementById(`cart-eur-${i}`).value);
            const rShop = document.getElementById(`cart-shop-${i}`).value;
            
            if(isNaN(rEur) || rEur < 0 || !rShop) return alert(`Rellene el coste real y comercio del ítem ${i+1}`);
            
            realEurTotal += rEur;
            processedItems.push({...co.cart[i], realEur: rEur, realShop: rShop});
        }
        
        if(!allChecked) return alert("Debe validar el ensamblaje de todos los componentes.");

        const totalVirtual = co.cart.reduce((s, i) => s + i.price, 0);
        
        // OPERACIONES EXECUTES (Direct discount from ledger)
        if(co.balance < totalVirtual) return alert("Fondos virtuales insuficientes para ejecutar la compra.");
        
        state.addToLedger(state.user.coId, `Adquisición Física Directa`, 'OPERACIONES', -totalVirtual);
        processedItems.forEach(i => { co.realCosts.unshift({ shop: i.realShop, item: i.name, eur: i.realEur }); });
        
        co.orders.unshift({ 
            id: state.data.config.nextOrderId++, 
            items: processedItems, total: totalVirtual, justification: 'Validación directa por Operaciones.', 
            realEurTotal: realEurTotal, status: 'EJECUTADO', date: new Date().toLocaleString() 
        });
        
        telemetry.log("EJECUCIÓN COMPRA", `Importe: ${totalVirtual.toFixed(2)}€v | Real: ${realEurTotal.toFixed(2)}€`);
        co.cart = []; state.save(); 
        alert("Compra física confirmada y asentada en el Ledger.");
        this.render();
    },

    viewOrders(el) {
        const co = state.data.companies[state.user.coId];
        const role = state.user.role;
        const wrapper = document.createElement('div');
        
        let ceoDashboard = '';
        if(role === 'CEO') {
            ceoDashboard = `
            <h2 class="font-orbitron text-mars-cyan text-sm mb-3 uppercase tracking-tighter border-b border-mars-border pb-2">Cronograma Maestro de Entregas</h2>
            ${this.renderDeadlinesBlock()}
            `;
        }

        wrapper.innerHTML = `
        ${ceoDashboard}
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-mars-yellow text-lg sm:text-xl uppercase tracking-tighter">Bóveda de Autorización y Finanzas</h2>
            ${role === 'TECNICO' ? `<button onclick="ui.submitTechRequisition()" class="bg-mars-cyan text-black px-4 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors" ${co.cart.length===0?'disabled opacity-50':''}>Transmitir Solicitud a Finanzas</button>` : ''}
        </div>
        
        <div class="space-y-6">
            ${co.orders.map(order => `
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 ${order.status === 'EJECUTADO' ? 'border-l-mars-cyan' : order.status === 'APROBADO_FINANZAS' ? 'border-l-mars-green' : order.status === 'DENEGADO' ? 'border-l-mars-magenta' : 'border-l-mars-yellow'} animate-in slide-in-from-bottom-4 duration-300">
                <div class="flex justify-between items-start mb-4 flex-wrap gap-2">
                    <div><span class="text-[9px] font-bold uppercase ${order.status === 'EJECUTADO' ? 'text-mars-cyan bg-mars-cyan/10' : order.status === 'APROBADO_FINANZAS' ? 'text-mars-green bg-mars-green/10' : order.status === 'DENEGADO' ? 'text-mars-magenta bg-mars-magenta/10' : 'text-mars-yellow bg-mars-yellow/10'} px-2 py-1 tracking-widest">[STATUS: ${order.status}]</span><h3 class="text-white font-orbitron mt-3 uppercase text-xs sm:text-sm">ORDER_TX: ${order.id}</h3></div>
                    <div class="text-left sm:text-right w-full sm:w-auto"><p class="text-mars-green font-black font-mono text-xl tracking-tighter">${order.total.toFixed(2)} €v</p><p class="text-[9px] text-slate-500 uppercase font-bold mt-1">${order.date}</p></div>
                </div>
                
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div class="bg-black/50 p-4 border border-mars-border/50 text-[10px]"><span class="block text-mars-cyan font-bold uppercase mb-2 border-b border-mars-cyan/30 pb-1">Justificación Técnica:</span><p class="text-slate-300 italic leading-relaxed">"${order.justification}"</p></div>
                    <div class="bg-black/50 p-4 border border-mars-border/50 text-[9px] overflow-x-auto">
                        <span class="block text-mars-magenta font-bold uppercase mb-2 border-b border-mars-magenta/30 pb-1">Desglose Físico Verificado:</span>
                        <table class="w-full text-left whitespace-nowrap">
                            <tbody>
                                ${order.items.map(i => `<tr><td class="py-1 text-slate-400 pr-4">${i.name}</td><td class="py-1 text-slate-500 uppercase pr-4">${i.realShop||'N/A'}</td><td class="py-1 text-mars-magenta font-bold text-right">${i.realEur!==undefined ? i.realEur.toFixed(2)+' €' : '---'}</td></tr>`).join('')}
                            </tbody>
                        </table>
                        <div class="flex justify-between pt-2 mt-2 border-t border-slate-800 font-bold text-[10px]"><span class="text-white">TOTAL FÍSICO</span><span class="text-mars-magenta bg-mars-magenta/10 px-2 py-0.5">${order.realEurTotal!==undefined ? order.realEurTotal.toFixed(2)+' €' : '---'}</span></div>
                    </div>
                </div>
                
                ${order.denyReason ? `<div class="bg-red-900/30 border border-red-500/50 p-3 text-[10px] text-red-200 mt-2 mb-4"><span class="font-bold">MOTIVO RECHAZO:</span> ${order.denyReason}</div>` : ''}
                
                ${order.status === 'PENDIENTE_FINANZAS' && role === 'FINANZAS' ? `
                <div class="flex flex-col sm:flex-row gap-3 border-t border-mars-border pt-4">
                    <button onclick="ui.processOrder(${order.id}, 'APROBADO_FINANZAS')" class="flex-grow bg-mars-green text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-colors">Dar Luz Verde Presupuestaria</button>
                    <button onclick="ui.promptDenyOrder(${order.id})" class="bg-mars-magenta/10 border border-mars-magenta text-mars-magenta px-6 py-3 text-[10px] font-black uppercase hover:bg-mars-magenta hover:text-white transition-colors whitespace-nowrap">Denegar</button>
                </div>` : ''}
            </div>`).join('') || '<p class="text-slate-600 italic text-sm">No hay peticiones en el histórico.</p>'}
        </div>`;
        el.appendChild(wrapper);
    },

    submitTechRequisition() {
        const co = state.data.companies[state.user.coId];
        if(co.cart.length === 0) return alert("Debe añadir material al carro de I+D antes de transmitir.");
        
        const just = prompt("Introduzca la justificación técnica de esta petición de compra:");
        if(!just || just.length < 5) return alert("Justificación insuficiente.");
        
        const total = co.cart.reduce((s, i) => s + i.price, 0);
        co.orders.unshift({ 
            id: state.data.config.nextOrderId++, 
            items: [...co.cart], total: total, justification: just, 
            status: 'PENDIENTE_FINANZAS', date: new Date().toLocaleString() 
        });
        
        telemetry.log("REQUISICIÓN", `Enviada a Finanzas: ${total.toFixed(2)}€v`);
        co.cart = []; state.save(); 
        this.render();
        alert("Solicitud transmitida a Finanzas para su luz verde presupuestaria.");
    },

    promptDenyOrder(oid) {
        const html = `<input type="text" id="deny-reason" class="w-full bg-black border border-mars-magenta p-3 text-xs text-white" placeholder="Motivo del rechazo...">`;
        const btn = `<button onclick="ui.finalizeDenyOrder(${oid})" class="bg-mars-magenta text-white px-6 py-2 text-[10px] font-bold uppercase hover:bg-white hover:text-mars-magenta">Confirmar Denegación</button>`;
        this.showModal("Denegar Orden", html, btn);
    },
    
    finalizeDenyOrder(oid) {
        const reason = document.getElementById('deny-reason').value;
        if(!reason) return alert("Especifique motivo.");
        const o = state.data.companies[state.user.coId].orders.find(ord => ord.id === oid);
        o.status = 'DENEGADO'; o.denyReason = `[${state.user.role}] ${reason}`;
        telemetry.log("DENEGADO", `Orden #${oid} - Motivo: ${reason}`);
        state.save(); this.closeModal(); this.render();
    },
    
    processOrder(oid, status) {
        const co = state.data.companies[state.user.coId];
        const o = co.orders.find(ord => ord.id === oid);
        
        if(status === 'APROBADO_FINANZAS') {
            if(co.balance < o.total) return alert("Alerta: Fondos virtuales insuficientes para aprobar este presupuesto.");
            o.status = 'APROBADO_FINANZAS';
            telemetry.log("APROBADO FINANZAS", `Orden #${oid} validada.`);
            
            // Pasar los items al carrito de logística (OPERACIONES_IA) para que termine la compra
            co.cart = [...o.items].map(i => ({...i, realEur: '', realShop: ''}));
            alert("Presupuesto aprobado. Los ítems han sido enviados a Logística (Operaciones) para la compra física.");
        }
        state.save(); this.render();
    },

    viewFinance(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
        const totalReal = co.realCosts.reduce((s, i) => s + i.eur, 0);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-green"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Caja Virtual</p><p class="text-xl sm:text-2xl font-orbitron text-mars-green tracking-tighter">${co.balance.toFixed(2)} €v</p></div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-magenta"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Gasto Físico Auditado</p><p class="text-xl sm:text-2xl font-orbitron text-white tracking-tighter">${totalReal.toFixed(2)} €</p></div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6 border-l-4 border-l-mars-cyan"><p class="text-[9px] text-slate-500 uppercase mb-1 font-bold">Transacciones Ledger</p><p class="text-xl sm:text-2xl font-orbitron text-mars-cyan tracking-tighter">${co.ledger.length}</p></div>
        </div>
        
        ${state.user.role === 'FINANZAS' ? `
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan mb-8">
            ${this.renderHybridUploadBox('Libro de Cuentas y Balances (Excel/PDF/URL)', 'Entregable oficial para el área de Economía con el ROI y Ledger detallado.', 'financeBook', docs.financeBook)}
        </div>` : ''}

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div class="terminal-border bg-mars-card p-4 sm:p-6">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Ledger Histórico inmutable</h3>
                <div class="overflow-x-auto">
                    <div class="overflow-y-auto max-h-[400px] text-[10px] pr-2 min-w-[300px]">
                        ${co.ledger.map(l => `
                        <div class="border-b border-mars-border/30 py-3 flex justify-between gap-4">
                            <div class="flex-1"><p class="text-white font-bold leading-tight">${l.concept}</p><p class="text-[8px] text-slate-500 uppercase mt-1">${l.id} | ${l.date}</p></div>
                            <div class="text-right shrink-0"><p class="font-mono font-bold text-sm ${l.delta > 0 ? 'text-mars-green' : 'text-mars-magenta'}">${l.delta > 0 ? '+' : ''}${l.delta.toFixed(2)}</p><p class="text-slate-500 text-[8px]">Bal: ${l.final.toFixed(2)}</p></div>
                        </div>`).join('') || '<p class="text-slate-600 italic">Registro inmutable vacío.</p>'}
                    </div>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-4 sm:p-6">
                <h3 class="font-orbitron text-mars-magenta text-sm mb-4 uppercase tracking-tighter border-b border-mars-border pb-2">Desglose Físico Componentes (€)</h3>
                <div class="overflow-x-auto">
                    <div class="overflow-y-auto max-h-[400px] text-[10px] pr-2 min-w-[300px]">
                        ${co.realCosts.map(r => `
                        <div class="border-b border-mars-border/30 py-3 flex justify-between gap-4">
                            <div class="flex-1 overflow-hidden"><p class="text-white uppercase font-black tracking-widest truncate">${r.shop}</p><p class="text-slate-400 mt-1 uppercase text-[9px] truncate">${r.item}</p></div>
                            <div class="text-right text-mars-magenta font-black text-sm font-mono tracking-tighter shrink-0">${r.eur.toFixed(2)} €</div>
                        </div>`).join('') || '<p class="text-slate-600 italic">No hay costes reales auditados.</p>'}
                    </div>
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },
    
    viewBrand(el) {
        const co = state.data.companies[state.user.coId];
        const docs = co.deliverables || {};
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="space-y-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                    <h2 class="font-orbitron text-mars-magenta text-lg mb-4 uppercase tracking-tighter">Identidad Corporativa</h2>
                    <input type="text" id="brand-slogan" value="${co.slogan||''}" placeholder="Eslogan corto corporativo..." class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-mars-yellow font-bold uppercase mb-4 focus:border-mars-magenta outline-none">
                    <p class="text-[9px] text-slate-400 mb-4 uppercase">Suba el logotipo diseñado para la corporación en formato PNG o JPG con fondo transparente para su visualización en el panel HUD.</p>
                    <div class="flex gap-2">
                        <button onclick="document.getElementById('brand-logo-upload').click()" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-mars-magenta hover:text-white transition-all w-full">[ Cargar Imagen / Logo ]</button>
                        <button onclick="ui.saveSlogan()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all">Guardar</button>
                    </div>
                    <input type="file" id="brand-logo-upload" class="hidden" accept="image/png, image/jpeg" onchange="ui.handleLogoUpload(event)">
                </div>
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                    <h2 class="font-orbitron text-mars-cyan text-lg mb-4 uppercase tracking-tighter">Manifiesto & Propuesta de Valor</h2>
                    <p class="text-[10px] text-slate-400 mb-4 uppercase leading-relaxed">Redacte la misión, ventaja competitiva y pitch de atracción para inversores. Texto público en el Dossier Académico.</p>
                    <textarea id="val-prop-text" class="w-full bg-slate-900 border border-mars-border p-4 text-xs text-white h-32 outline-none focus:border-mars-cyan mb-4 leading-relaxed" placeholder="Redacte la misión corporativa aquí...">${co.valueProposition}</textarea>
                    <button onclick="ui.saveValueProposition()" class="bg-mars-cyan text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_#00f0ff] transition-all w-full">Guardar Propuesta de Valor</button>
                    <div class="mt-4 border-t border-slate-800 pt-4">
                        ${this.renderHybridUploadBox('Dossier Propuesta de Valor (PDF/URL)', 'Entregable oficial para Evaluación LYE.', 'valuePropDoc', docs.valuePropDoc)}
                    </div>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow h-fit">
                <h2 class="font-orbitron text-mars-yellow text-lg mb-4 uppercase tracking-tighter">Entregas Oficiales de Oratoria & Pitch</h2>
                <p class="text-[10px] text-slate-400 mb-6 uppercase leading-relaxed">Cargue los documentos de presentación requeridos para las defensas de oratoria ante el claustro. Soporta archivos o enlaces directos de Canva/Drive.</p>
                
                <div class="space-y-6">
                    ${this.renderHybridUploadBox('Presentación Fase I (Inglés - Micro-Pitch)', 'Evaluado por Liderazgo e Inglés.', 'presPhase1', docs.presPhase1)}
                    ${this.renderHybridUploadBox('Presentación Fase III (Castellano - Final)', 'Evaluado por Lengua Castellana.', 'presPhase3', docs.presPhase3)}
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },
    
    saveSlogan() {
        const s = document.getElementById('brand-slogan').value;
        state.data.companies[state.user.coId].slogan = s;
        state.save();
        alert("Eslogan guardado.");
        this.render();
    },

    viewAILog(el) {
        const co = state.data.companies[state.user.coId];
        if(!co.aiPrompts) co.aiPrompts = [];
        const pending = co.aiPrompts.filter(p => p.status === 'PENDIENTE_VALIDACION');
        const approved = co.aiPrompts.filter(p => p.status === 'APROBADO');
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="flex justify-between items-center mb-6">
            <h2 class="font-orbitron text-blue-400 text-xl uppercase tracking-tighter">Buzón y Bitácora de Inteligencia Artificial</h2>
            <button onclick="ui.modalReportAI()" class="bg-blue-600/20 border border-blue-500 text-blue-400 px-4 py-2 text-[10px] uppercase font-bold hover:bg-blue-500 hover:text-white transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]">Registrar Prompt Directo</button>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <h3 class="font-orbitron text-mars-yellow text-sm mb-4 uppercase tracking-widest border-b border-mars-border/50 pb-2">Prompts Pendientes de Auditoría</h3>
                <div class="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                    ${pending.map(p => `
                    <div class="bg-slate-900/50 border border-mars-border p-4 text-[10px]">
                        <div class="flex justify-between mb-2 border-b border-mars-border/30 pb-2">
                            <span class="text-mars-yellow font-bold uppercase tracking-widest">${p.tool}</span>
                            <span class="text-slate-500">${p.date}</span>
                        </div>
                        <p class="text-white font-bold mb-1 uppercase">Tarea: ${p.task}</p>
                        <p class="text-slate-400 mb-2 italic">Emisor: Rol ${p.authorRole.replace('_',' ')}</p>
                        <div class="bg-black border border-mars-border/50 p-3 mb-2"><span class="text-blue-400 font-bold block mb-1">Prompt:</span><p class="text-slate-300">"${p.prompt}"</p></div>
                        <div class="bg-black border border-mars-border/50 p-3 mb-3"><span class="text-mars-green font-bold block mb-1">Verificación Humana:</span><p class="text-slate-300">${p.verification}</p></div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button onclick="ui.processAIPrompt('${p.id}', 'APROBADO')" class="flex-1 bg-mars-green text-black font-black py-2 uppercase hover:shadow-[0_0_10px_#00ff66] transition-all">Aprobar e Integrar</button>
                            <button onclick="ui.processAIPrompt('${p.id}', 'DESCARTADO')" class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta px-4 py-2 font-bold uppercase hover:bg-mars-magenta hover:text-white transition-all">Descartar</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Bandeja limpia. No hay reportes pendientes.</p>'}
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-blue-500">
                <h3 class="font-orbitron text-blue-400 text-sm mb-4 uppercase tracking-widest border-b border-mars-border/50 pb-2">Bitácora Oficial Aprobada</h3>
                <div class="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                    ${approved.map(p => `
                    <div class="bg-slate-900/50 border border-blue-900/30 p-4 text-[10px] border-l-2 border-l-blue-500">
                        <div class="flex justify-between mb-2 border-b border-slate-800 pb-2">
                            <span class="text-blue-400 font-bold uppercase tracking-widest">${p.tool}</span>
                            <span class="text-slate-500">${p.date}</span>
                        </div>
                        <p class="text-white font-bold mb-1 uppercase">Tarea: ${p.task}</p>
                        <div class="text-slate-400 mt-2 bg-black p-2 border border-slate-800"><span class="text-mars-cyan font-bold block mb-1">Prompt Validado:</span>"${p.prompt}"</div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Aún no se han integrado prompts aprobados a la bitácora.</p>'}
                </div>
            </div>
        </div>`;
        el.appendChild(wrapper);
    },

    viewAdmin(el) {
        const isAlex = state.user.role === 'COORD_ALEX';
        
        let adminHtml = `
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 class="font-orbitron text-mars-yellow text-xl uppercase tracking-widest font-black">Centro_de_Mando_Docente</h2>
            <div class="flex flex-wrap gap-2 border border-mars-border bg-mars-card p-1">
                <button onclick="ui.adminTab='dash'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='dash'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">AEE & Finanzas</button>
                <button onclick="ui.adminTab='eval'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='eval'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Rúbricas & Entregas</button>
                <button onclick="ui.adminTab='startups'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='startups'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Startups</button>
                <button onclick="ui.adminTab='telemetry'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='telemetry'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Telemetría</button>
                <button onclick="ui.adminTab='settings'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='settings'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Ajustes</button>
                ${isAlex ? `<button onclick="ui.adminTab='alexbox'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='alexbox'?'bg-mars-cyan text-black':'text-mars-cyan'} hover:text-white transition-colors border-l border-mars-cyan/30">Buzón Alex</button>` : ''}
            </div>
        </div>`;

        if(this.adminTab === 'dash') {
            let globalReal = 0;
            for (let c in state.data.companies) globalReal += state.data.companies[c].realCosts.reduce((s, i) => s + i.eur, 0);
            
            const canSponsor = state.data.config.teachers[state.user.role]?.canSponsor === true;

            adminHtml += `
            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div class="lg:col-span-1 terminal-border bg-mars-card p-6 text-center border-t-4 border-t-mars-magenta flex flex-col justify-center">
                    <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest">Inversión FÍSICA CLASE</h3>
                    <p class="text-5xl font-orbitron text-white mb-2 tracking-tighter">${globalReal.toFixed(2)} €</p>
                    <p class="text-[9px] text-slate-500 uppercase font-bold">Impacto económico real total</p>
                </div>
                <div class="lg:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Control Financiero, Patrocinios & Sanciones AEE</h3>
                    <table class="w-full text-left text-[10px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-3 pr-4">Empresa</th><th class="pr-4">Bal(€v) / Real(€)</th><th class="pr-4">Patrocinio Fase I (+€v)</th><th>Sanciones AEE (-€v)</th></tr></thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const c = state.data.companies[cid];
                                const r = c.realCosts.reduce((s,i)=>s+i.eur,0);
                                
                                let sponsorHtml = '';
                                if(canSponsor) {
                                    sponsorHtml = `
                                    <div class="flex gap-1">
                                        <button onclick="ui.teacherCapital('${cid}', 500, 'Patrocinio ORO', 'ORO')" class="bg-[#ffd700] text-black px-2 py-1 font-black text-[8px] hover:scale-105 transition-transform">ORO</button>
                                        <button onclick="ui.teacherCapital('${cid}', 400, 'Patrocinio PLATA', 'PLATA')" class="bg-[#c0c0c0] text-black px-2 py-1 font-black text-[8px] hover:scale-105 transition-transform">PLA</button>
                                        <button onclick="ui.teacherCapital('${cid}', 250, 'Patrocinio BRONCE', 'BRONCE')" class="bg-[#cd7f32] text-black px-2 py-1 font-black text-[8px] hover:scale-105 transition-transform">BRO</button>
                                    </div>`;
                                } else {
                                    if(c.sponsorAwarded) {
                                        const cl = c.sponsorAwarded==='ORO'?'text-[#ffd700] border-[#ffd700]':c.sponsorAwarded==='PLATA'?'text-[#c0c0c0] border-[#c0c0c0]':'text-[#cd7f32] border-[#cd7f32]';
                                        sponsorHtml = `<span class="${cl} font-bold text-[8px] uppercase border px-2 py-1 bg-black/50">[PATROCINIO: ${c.sponsorAwarded}]</span>`;
                                    } else {
                                        sponsorHtml = `<span class="text-slate-600 font-bold text-[8px] uppercase border border-slate-700 px-2 py-1 bg-slate-900">[SIN PATROCINIO]</span>`;
                                    }
                                }

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-4 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${c.name}</button></td>
                                    <td class="py-4 font-mono pr-4"><span class="text-mars-green font-bold">${c.balance.toFixed(0)}</span> <span class="text-slate-600">/</span> <span class="text-mars-magenta">${r.toFixed(2)}</span></td>
                                    <td class="py-4 pr-4">${sponsorHtml}</td>
                                    <td class="py-4">
                                        <button onclick="ui.modalAEEFine('${cid}')" class="bg-red-900/30 border border-red-500 text-red-500 px-3 py-1 font-bold text-[8px] uppercase hover:bg-red-500 hover:text-white transition-all shadow-[0_0_5px_red]">Expediente AEE</button>
                                    </td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase">Solicitudes de Material Externo / I+D</h3>
                <div class="space-y-3">
                    ${(state.data.pendingCustom || []).map(p => `
                    <div class="bg-slate-900 border border-mars-border p-3 flex justify-between items-center text-[10px] flex-wrap gap-2">
                        <div class="flex-grow min-w-[200px]"><p class="text-mars-yellow font-bold uppercase">${state.data.companies[p.company].name}</p><p class="text-white font-bold text-xs uppercase">${p.name}</p><p class="text-slate-400 italic">"${p.reason}"</p></div>
                        <div class="flex gap-2 items-center flex-shrink-0">
                            <input type="number" id="val-price-${p.id}" class="w-16 bg-black border border-mars-border p-2 text-mars-green text-center font-bold" placeholder="€v">
                            <button onclick="ui.teacherValidate('${p.id}', true)" class="bg-mars-green text-black px-4 py-2 font-black hover:bg-white transition-colors">OK</button>
                            <button onclick="ui.teacherValidate('${p.id}', false)" class="text-mars-magenta font-bold px-3 py-2 border border-mars-magenta hover:bg-mars-magenta hover:text-white transition-colors">X</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">Nada pendiente.</p>'}
                </div>
            </div>`;
        } 
        else if(this.adminTab === 'eval') {
            const isCoord = state.user.role.startsWith('COORD');
            const activeSubject = isCoord ? (this.coordEvalView === 'ACTA' || this.coordEvalView === 'ARCHIVE' ? null : this.coordEvalView) : state.user.role;
            
            adminHtml += `<div class="mb-6 flex flex-wrap gap-4 items-center bg-slate-900 p-2 border border-mars-border">`;
            if(isCoord) {
                adminHtml += `
                <select onchange="ui.coordEvalView=this.value; ui.evalSelectedCo=''; ui.render()" class="bg-black border border-mars-cyan text-mars-cyan text-xs p-2 uppercase font-bold outline-none cursor-pointer">
                    <option value="ACTA" ${this.coordEvalView==='ACTA'?'selected':''}>📊 Acta General Calificaciones</option>
                    <option value="ARCHIVE" ${this.coordEvalView==='ARCHIVE'?'selected':''}>📁 Archivo Documental Central</option>
                    ${['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => `<option value="${s}" ${this.coordEvalView===s?'selected':''}>Evaluar: ${RUBRIC_CONFIG[s].name}</option>`).join('')}
                </select>
                ${this.coordEvalView === 'ACTA' ? `<button onclick="ui.exportActaCSV()" class="bg-mars-green text-black px-4 py-2 text-[10px] font-black uppercase hover:bg-white transition-colors">Exportar Acta CSV</button>` : ''}
                `;
            } else {
                adminHtml += `<h3 class="font-orbitron text-mars-cyan text-sm uppercase px-4 py-2">Módulo Calificador: <span class="text-white">${RUBRIC_CONFIG[activeSubject].name}</span></h3>`;
            }
            adminHtml += `</div>`;

            if(isCoord && this.coordEvalView === 'ACTA') {
                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 overflow-x-auto">
                    <table class="w-full text-left text-[10px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Startups</th><th class="pr-3">FYQ</th><th class="pr-3">ECO</th><th class="pr-3">LYE</th><th class="pr-3">LEN</th><th class="pr-3">MAT</th><th class="pr-3">ING</th><th class="text-mars-yellow">Media Global</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const co = state.data.companies[cid];
                                const g = co.grades || {};
                                const vals = ['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => g[s] ? g[s].final : null);
                                const validVals = vals.filter(v => v !== null);
                                const avg = validVals.length > 0 ? (validVals.reduce((a,b)=>a+b,0)/validVals.length).toFixed(2) : '-';
                                
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-mars-cyan/5">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${co.name}</button></td>
                                    ${vals.map(v => `<td class="py-3 font-mono pr-3 ${v!==null?'text-mars-cyan font-bold':'text-slate-600'}">${v!==null ? v.toFixed(2) : '--'}</td>`).join('')}
                                    <td class="py-3 font-mono text-mars-yellow font-black text-sm">${avg}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;
            } else if(isCoord && this.coordEvalView === 'ARCHIVE') {
                adminHtml += `
                <div class="terminal-border bg-mars-card p-6 overflow-x-auto">
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border">
                            <tr><th class="py-3 pr-4">Empresa</th><th class="pr-4">Informe Téc (FYQ)</th><th class="pr-4">P. Fase I (ING/LYE)</th><th class="pr-4">P. Fase III (LEN)</th><th class="pr-4">Libro Finanzas (ECO)</th><th class="pr-4">Propuesta Valor</th><th>IA Prompts</th></tr>
                        </thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const co = state.data.companies[cid];
                                const d = co.deliverables || {};
                                const aiCount = (co.aiPrompts||[]).filter(p=>p.status==='APROBADO').length;
                                
                                const dLink = (doc) => doc ? `<a href="${doc.dataUrl}" target="_blank" download="${doc.type==='file'?doc.name:''}" class="bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-2 py-1 font-bold hover:bg-mars-cyan hover:text-black transition-colors block text-center">${doc.type==='link'?'🔗 ENLACE':'📁 ARCHIVO'}</a>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">PENDIENTE</span>`;
                                const vLink = co.valueProposition ? `<span class="text-mars-green font-bold bg-mars-green/10 border border-mars-green px-2 py-1 block text-center">✓ REDACTADA</span>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">VACÍA</span>`;
                                const aLink = aiCount > 0 ? `<span class="text-blue-400 font-bold bg-blue-500/10 border border-blue-500 px-2 py-1 block text-center">✓ ${aiCount} REGISTROS</span>` : `<span class="text-slate-600 border border-slate-700 px-2 py-1 block text-center">0 REGISTROS</span>`;

                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold pr-4">${co.name}</td>
                                    <td class="py-3 pr-4">${dLink(d.technicalReport)}</td>
                                    <td class="py-3 pr-4">${dLink(d.presPhase1)}</td>
                                    <td class="py-3 pr-4">${dLink(d.presPhase3)}</td>
                                    <td class="py-3 pr-4">${dLink(d.financeBook)}</td>
                                    <td class="py-3 pr-4">${vLink}</td>
                                    <td class="py-3">${aLink}</td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                </div>`;

            } else if(activeSubject) {
                const config = RUBRIC_CONFIG[activeSubject];
                
                let selectCoHtml = `<select id="eval-co-select" onchange="ui.selectEvalCo(this.value)" class="w-full md:w-1/2 bg-slate-900 border border-mars-border text-white text-xs p-3 uppercase font-bold outline-none focus:border-mars-cyan mb-6">
                    <option value="">-- Seleccione Startup a Evaluar --</option>
                    ${Object.keys(state.data.companies).map(cid => `<option value="${cid}" ${this.evalSelectedCo===cid?'selected':''}>${state.data.companies[cid].name}</option>`).join('')}
                </select>`;

                if(!this.evalSelectedCo) {
                    adminHtml += `<div class="terminal-border bg-mars-card p-6">${selectCoHtml}<p class="text-xs text-slate-500 italic">Esperando selección de objetivo...</p></div>`;
                } else {
                    const co = state.data.companies[this.evalSelectedCo];
                    const pastGrade = co.grades[activeSubject] || { scores: {}, feedback: '' };
                    const docs = co.deliverables || {};
                    
                    let evidenceHtml = `<h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Evidencias Adjuntas</h4>`;
                    if (activeSubject === 'FYQ') {
                        evidenceHtml += this.renderDocBadge('Informe Técnico (FYQ)', docs.technicalReport);
                        if(co.flightTests.length>0) {
                            evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-[9px] font-bold uppercase">Ensayos Vuelo:</span><div class="text-[9px] mt-1 space-y-1">`;
                            co.flightTests.forEach(f => evidenceHtml += `<p class="text-slate-300">H: ${f.heightM}m | E: ${f.efficiency.toFixed(2)}</p>`);
                            evidenceHtml += `</div></div>`;
                        }
                    } else if (activeSubject === 'ECO') {
                        evidenceHtml += this.renderDocBadge('Libro Cuentas Financiero', docs.financeBook);
                    } else if (activeSubject === 'LYE' || activeSubject === 'MARKETING' || activeSubject === 'LEN' || activeSubject === 'ING') {
                        evidenceHtml += this.renderDocBadge('Micro-Pitch Fase I', docs.presPhase1);
                        evidenceHtml += this.renderDocBadge('Pitch Final Fase III', docs.presPhase3);
                        if(activeSubject === 'LYE') evidenceHtml += this.renderDocBadge('Dossier Propuesta Valor', docs.valuePropDoc);
                        evidenceHtml += `<div class="mt-4"><span class="text-mars-yellow text-[9px] font-bold uppercase">Texto Propuesta de Valor:</span><p class="text-[9px] text-slate-300 italic mt-1 bg-black p-3 border border-slate-800 leading-relaxed max-h-32 overflow-y-auto">"${co.valueProposition || 'La empresa aún no ha definido su propuesta de valor corporativa.'}"</p></div>`;
                    } else {
                        evidenceHtml += `<p class="text-[9px] text-slate-500 italic">No hay entregables documentales específicos enlazados a la vista rápida de esta rúbrica.</p>`;
                    }

                    adminHtml += `
                    <div class="terminal-border bg-mars-card p-6 animate-in fade-in duration-300">
                        ${selectCoHtml}
                        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                            <div class="lg:col-span-2 space-y-4">
                                <h4 class="font-orbitron text-mars-cyan text-xs uppercase mb-4 tracking-widest border-b border-mars-border pb-2">Criterios Oficiales (${activeSubject})</h4>
                                ${config.criteria.map(c => `
                                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-900/50 p-4 border border-mars-border hover:border-mars-cyan transition-colors">
                                    <div class="flex-grow pr-4">
                                        <p class="text-[10px] text-white font-bold uppercase leading-tight">${c.name}</p>
                                        <span class="text-[8px] bg-mars-cyan text-black px-1.5 py-0.5 mt-2 inline-block font-bold">PESO: ${c.weight*100}%</span>
                                    </div>
                                    <input type="number" id="grade-${c.id}" min="0" max="10" step="0.1" value="${pastGrade.scores[c.id]||''}" oninput="ui.calcRealtimeGrade('${activeSubject}')" class="w-full sm:w-20 bg-black border border-mars-border text-center text-mars-cyan font-bold text-base p-2 outline-none focus:border-mars-cyan shrink-0" placeholder="0-10">
                                </div>`).join('')}
                                
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <textarea id="eval-feedback" class="w-full bg-slate-900 border border-mars-border p-3 text-[10px] text-white h-full min-h-[100px] outline-none focus:border-mars-cyan leading-relaxed" placeholder="Observaciones cualitativas y feedback...">${pastGrade.feedback||''}</textarea>
                                    <div class="flex flex-col">
                                        <div class="terminal-border border-dashed p-4 text-center mb-3 flex-grow bg-black flex flex-col justify-center">
                                            <p class="text-[8px] text-slate-500 uppercase font-bold mb-1 tracking-widest">Nota Ponderada</p>
                                            <p id="realtime-grade" class="text-5xl font-orbitron text-mars-green tracking-tighter">${pastGrade.final ? pastGrade.final.toFixed(2) : '0.00'}</p>
                                        </div>
                                        <button onclick="ui.saveGrade('${activeSubject}')" class="bg-mars-cyan text-black font-black py-4 text-[10px] uppercase tracking-widest hover:glow-cyan transition-all">[ REGISTRAR CALIFICACIÓN ]</button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="lg:col-span-1 bg-black/40 border border-slate-800 p-4 h-fit sticky top-20">
                                ${evidenceHtml}
                            </div>
                        </div>
                    </div>`;
                }
            }
        }
        else if(this.adminTab === 'startups') {
            adminHtml += `
            <div class="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div class="xl:col-span-1 terminal-border bg-mars-card p-6 h-fit border-t-4 border-t-mars-cyan">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Crear Startup</h3>
                    <input type="text" id="new-co-name" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-3 outline-none focus:border-mars-cyan" placeholder="Nombre Corporativo">
                    <input type="number" id="new-co-cap" class="w-full bg-slate-900 border border-mars-border p-3 text-xs text-white mb-4 outline-none focus:border-mars-cyan" placeholder="Capital (€v)" value="1500">
                    <button onclick="ui.createStartup()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:shadow-[0_0_10px_#00f0ff] transition-shadow">Registrar</button>
                </div>
                <div class="xl:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto border-t-4 border-t-mars-yellow">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Gestión de PINs de Acceso</h3>
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2">Empresa</th><th>CEO</th><th>TEC</th><th>FIN</th><th>MKT</th><th>OP_IA</th><th>Acción</th></tr></thead>
                        <tbody>
                            ${Object.keys(state.data.companies).map(cid => {
                                const r = state.data.companies[cid].roles;
                                return `
                                <tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                                    <td class="py-3 font-orbitron text-white font-bold"><button onclick="ui.showCompanyLogins('${cid}')" class="text-mars-cyan hover:text-white transition-colors underline decoration-mars-cyan/50 decoration-dashed underline-offset-4">${state.data.companies[cid].name}</button></td>
                                    ${['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].map(rol => `
                                    <td class="py-3"><input type="text" maxlength="4" value="${r[rol]}" onchange="ui.updatePIN('${cid}', '${rol}', this.value)" class="w-10 bg-black border border-mars-border text-center text-mars-cyan font-bold p-1 outline-none focus:border-mars-yellow"></td>`).join('')}
                                    <td class="py-3"><button onclick="if(confirm('¿Borrar startup irreversiblemente?')) ui.deleteStartup('${cid}')" class="text-mars-magenta font-bold hover:underline">Eliminar</button></td>
                                </tr>`;
                            }).join('')}
                        </tbody>
                    </table>
                    <p class="text-[8px] text-slate-500 mt-4 uppercase">* Modifique los 4 dígitos y pulse Enter o cambie de campo para guardar automáticamente.</p>
                </div>
            </div>`;
        }
        else if(this.adminTab === 'telemetry') {
            let matRows = '';
            Object.keys(state.data.companies).forEach(cid => {
                const co = state.data.companies[cid];
                const s = co.loginStats || { totalLogins:0, roles:{} };
                matRows += `<tr class="border-b border-mars-border/30 hover:bg-slate-900/50">
                    <td class="py-3 font-orbitron text-white font-bold pr-4">${co.name}</td>
                    <td class="py-3 font-mono text-mars-cyan font-bold pr-4 text-center border-r border-mars-border/50">${s.totalLogins}</td>`;
                ['CEO','TECNICO','FINANZAS','MARKETING','OPERACIONES_IA'].forEach(r => {
                    const count = s.roles[r]?.count || 0;
                    const color = count > 4 ? 'text-mars-green' : (count > 0 ? 'text-mars-yellow' : 'text-mars-magenta animate-pulse');
                    matRows += `<td class="py-3 font-mono ${color} text-center font-bold px-2">${count}</td>`;
                });
                matRows += `</tr>`;
            });

            adminHtml += `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan text-center flex flex-col justify-center">
                    <p class="text-5xl font-orbitron text-mars-cyan">${state.data.telemetry.totalLogins}</p>
                    <p class="text-[9px] text-slate-500 uppercase mt-2 font-bold tracking-widest">Logins Globales</p>
                </div>
                <div class="md:col-span-3 terminal-border bg-mars-card p-6 overflow-x-auto">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase tracking-widest">Matriz de Conexiones por Departamento</h3>
                    <table class="w-full text-left text-[9px] whitespace-nowrap">
                        <thead class="text-slate-500 uppercase border-b border-mars-border"><tr><th class="py-2 pr-4">Startup</th><th class="pr-4 text-center border-r border-mars-border/50">Total</th><th class="text-center px-2">CEO</th><th class="text-center px-2">TEC</th><th class="text-center px-2">FIN</th><th class="text-center px-2">MKT</th><th class="text-center px-2">OP_IA</th></tr></thead>
                        <tbody>${matRows}</tbody>
                    </table>
                </div>
            </div>
            <div class="terminal-border bg-mars-card p-6 overflow-y-auto max-h-[400px]">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Registro Táctico de Sesiones (Últimas 100)</h3>
                <div class="space-y-4">
                    ${state.data.telemetry.sessions.map(sess => `
                    <div class="border border-mars-border/50 bg-slate-900/30 p-3 text-[10px]">
                        <div class="flex justify-between items-center border-b border-mars-border/30 pb-2 mb-2">
                            <span class="text-mars-cyan font-bold uppercase">${sess.entity} | ${sess.role.replace('_',' ')}</span>
                            <span class="text-[8px] text-slate-500 bg-black px-2 py-0.5">${sess.timestamp.replace('T',' ').slice(0,19)}</span>
                        </div>
                        <ul class="text-slate-300 space-y-1">
                            ${sess.events.map(ev => `<li class="flex gap-2"><span class="text-mars-yellow shrink-0">[${ev.time}]</span><span class="font-bold text-white shrink-0">${ev.action}:</span><span class="text-slate-400 break-words">${ev.details}</span></li>`).join('') || '<li class="text-slate-600 italic">Sesión sin eventos clave.</li>'}
                        </ul>
                    </div>`).join('') || '<p class="text-slate-600 text-xs italic">No hay datos de telemetría.</p>'}
                </div>
            </div>`;
        }
        else if(this.adminTab === 'settings') {
            const currentTeacher = state.data.config.teachers[state.user.role];
            const dl = state.data.config.deadlines;
            const gl = state.data.config.guidelines;

            adminHtml += `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow md:col-span-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase">Configuración de Plazos (Deadlines) y Guías</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-[10px]">
                        <div class="space-y-3">
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase I (Inglés)</label><input type="datetime-local" id="dl-pres1" value="${dl.presPhase1}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Doc. Propuesta de Valor</label><input type="datetime-local" id="dl-vp" value="${dl.valuePropDoc}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Informe Técnico FYQ</label><input type="datetime-local" id="dl-tech" value="${dl.techReport}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                        </div>
                        <div class="space-y-3">
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Libro Cuentas FIN</label><input type="datetime-local" id="dl-fin" value="${dl.financeBook}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase III (Castellano)</label><input type="datetime-local" id="dl-pres3" value="${dl.presPhase3}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div class="border-t border-mars-border/50 pt-3 mt-3">
                                <label class="text-mars-magenta font-bold block mb-1">Enlace a Guía Oficial Informe FYQ (URL)</label>
                                <input type="text" id="gl-url" value="${gl.techReportDocUrl}" placeholder="https://..." class="w-full bg-slate-900 border border-mars-border p-2 text-white mb-2">
                                <input type="text" id="gl-notes" value="${gl.techReportNotes}" placeholder="Notas breves..." class="w-full bg-slate-900 border border-mars-border p-2 text-white">
                            </div>
                        </div>
                    </div>
                    <button onclick="ui.saveSettings()" class="w-full bg-mars-yellow text-black font-black py-3 mt-4 text-[10px] uppercase hover:bg-white transition-all">Guardar Configuración Global</button>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan md:col-span-2">
                    <h3 class="font-orbitron text-mars-cyan text-xs mb-2 uppercase">Infraestructura Cloudflare D1 (SQLite)</h3>
                    <p class="text-[10px] text-slate-400 mb-4">Estado de red: <span class="${state.isCloudOnline ? 'text-mars-green' : 'text-mars-yellow'} font-bold">${state.isCloudOnline ? 'CONECTADO A LA NUBE (SQLITE ONLINE)' : 'MODO LOCAL (DESCONECTADO)'}</span></p>
                    <div class="flex flex-wrap gap-3">
                        <button onclick="state.fetchFromCloud().then(() => alert('Sincronización desde la nube completada.'))" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-2 text-[10px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all">Forzar Descarga D1</button>
                        <button onclick="state.pushToCloud(false).then(() => alert('Subida a Cloudflare D1 completada.'))" class="bg-mars-green/20 border border-mars-green text-mars-green px-4 py-2 text-[10px] font-bold uppercase hover:bg-mars-green hover:text-black transition-all">Forzar Subida D1</button>
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-green">
                    <h3 class="font-orbitron text-mars-green text-xs mb-4 uppercase">Exportación de Datos (Backup)</h3>
                    <p class="text-[10px] text-slate-400 mb-4">Descargue los registros o restaure el sistema completo.</p>
                    <div class="flex flex-col gap-3">
                        <button onclick="ui.exportCSV()" class="bg-mars-cyan/20 border border-mars-cyan text-mars-cyan px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-cyan hover:text-black transition-all text-left truncate">1. Exportar Libro de Caja (CSV)</button>
                        <button onclick="ui.exportActaCSV()" class="bg-mars-green/20 border border-mars-green text-mars-green px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-green hover:text-black transition-all text-left truncate">2. Exportar Acta de Notas (CSV)</button>
                        <button onclick="ui.exportJSON()" class="bg-mars-yellow/20 border border-mars-yellow text-mars-yellow px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-yellow hover:text-black transition-all text-left truncate">3. Descargar Backup (JSON)</button>
                        
                        <div class="border-t border-slate-800 mt-2 pt-4">
                            <input type="file" id="import-file" class="hidden" onchange="ui.importJSON(event)">
                            <button onclick="document.getElementById('import-file').click()" class="bg-slate-800 text-white w-full px-4 py-3 text-[10px] font-bold uppercase hover:bg-slate-700 border border-slate-600 text-left truncate">⚠️ Restaurar Sistema (JSON)</button>
                        </div>
                    </div>
                </div>
                
                <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
                    <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase">Seguridad Docente</h3>
                    <div class="bg-slate-900 p-4 border border-mars-border mb-4">
                        <p class="text-[10px] text-slate-400 mb-2 uppercase">Cambiar PIN para: <strong class="text-white">${currentTeacher ? currentTeacher.name : 'ROOT'}</strong></p>
                        <input type="text" id="new-teacher-pin" maxlength="4" class="w-full bg-black border border-mars-border p-3 text-center text-mars-cyan font-bold tracking-widest outline-none mb-3 text-lg" placeholder="4 DIG.">
                        <button onclick="ui.changeTeacherPIN()" class="block w-full bg-mars-magenta text-white py-3 text-[10px] font-bold uppercase hover:shadow-[0_0_15px_#ff0055] transition-all">Actualizar PIN</button>
                    </div>
                </div>
            </div>`;
        }
        else if(this.adminTab === 'alexbox') {
            adminHtml += `
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <div class="flex justify-between items-center mb-6 border-b border-mars-border/50 pb-4">
                    <h3 class="font-orbitron text-mars-cyan text-lg uppercase tracking-widest">Buzón de Desarrollo (Alex Inbox)</h3>
                    <span class="bg-mars-cyan/10 text-mars-cyan border border-mars-cyan px-3 py-1 font-bold text-[10px]">${(state.data.suggestionsToAlex||[]).length} Mensajes</span>
                </div>
                <div class="space-y-4">
                    ${(state.data.suggestionsToAlex||[]).map(s => `
                    <div class="bg-black/50 border border-mars-cyan/30 p-4 text-[10px]">
                        <div class="flex justify-between mb-2">
                            <span class="text-mars-yellow font-bold uppercase">${s.author}</span>
                            <span class="text-slate-500">${s.date}</span>
                        </div>
                        <p class="text-slate-300 italic bg-slate-900 p-3 border border-slate-800 leading-relaxed whitespace-pre-wrap">"${s.text}"</p>
                        <div class="mt-3 text-right">
                            <button onclick="ui.deleteSuggestion('${s.id}')" class="text-mars-magenta font-bold hover:underline px-2">Eliminar Reporte</button>
                        </div>
                    </div>`).join('') || '<p class="text-slate-500 italic text-sm text-center py-8">La bandeja de sugerencias y bugs está vacía.</p>'}
                </div>
            </div>`;
        }
        el.innerHTML = adminHtml;
    },

    saveSettings() {
        const dl = state.data.config.deadlines;
        const gl = state.data.config.guidelines;
        
        dl.presPhase1 = document.getElementById('dl-pres1').value;
        dl.valuePropDoc = document.getElementById('dl-vp').value;
        dl.techReport = document.getElementById('dl-tech').value;
        dl.financeBook = document.getElementById('dl-fin').value;
        dl.presPhase3 = document.getElementById('dl-pres3').value;
        
        gl.techReportDocUrl = document.getElementById('gl-url').value;
        gl.techReportNotes = document.getElementById('gl-notes').value;
        
        state.save();
        alert("Configuración de plazos y guías guardada con éxito.");
        this.render();
    },
    
    deleteSuggestion(id) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(s => s.id !== id);
        state.save();
        this.render();
    },

    // DOCENTE ACTIONS (STARTUPS & PINS)
    createStartup() {
        const name = document.getElementById('new-co-name').value;
        const cap = parseFloat(document.getElementById('new-co-cap').value);
        if(!name || isNaN(cap)) return alert("Datos inválidos.");
        const cid = 'co_' + Date.now();
        state.data.companies[cid] = { 
            name, balance: cap, logo: null, sponsorAwarded: null, valueProposition: "", slogan: "",
            roles: { CEO:'1234', TECNICO:'1234', FINANZAS:'1234', MARKETING:'1234', OPERACIONES_IA:'1234' }, 
            aiPrompts: [], executiveResolutions: [], flightTests: [], votingMotions: [], cart: [], orders: [], ledger: [], realCosts: [], grades: {}, 
            loginStats: { totalLogins: 0, roles: { CEO:{count:0}, TECNICO:{count:0}, FINANZAS:{count:0}, MARKETING:{count:0}, OPERACIONES_IA:{count:0} } },
            deliverables: { technicalReport: null, presPhase1: null, presPhase3: null, financeBook: null, valuePropDoc: null }
        };
        state.save(); this.render();
    },
    deleteStartup(cid) { delete state.data.companies[cid]; state.save(); this.render(); },
    updatePIN(coId, role, val) { if(val.length !== 4) return alert("4 dígitos."); state.data.companies[coId].roles[role] = val; state.save(); },
    changeTeacherPIN() {
        const np = document.getElementById('new-teacher-pin').value;
        if(np.length !== 4) return alert("4 dígitos.");
        state.data.config.teachers[state.user.role].pin = np; state.save();
        alert("PIN Actualizado."); document.getElementById('new-teacher-pin').value = '';
    },
    teacherValidate(pid, ok) {
        const reqIdx = state.data.pendingCustom.findIndex(p => p.id == pid);
        if(ok) {
            const price = parseFloat(document.getElementById(`val-price-${pid}`).value);
            if(!price) return alert("Falta precio €v.");
            state.data.catalog.unshift({ id: 'CUST-'+pid, name: `[ESP] ${state.data.pendingCustom[reqIdx].name}`, price, unit: 'Especial', category: 'Externo' });
        }
        state.data.pendingCustom.splice(reqIdx, 1); state.save(); this.render();
    },
    teacherCapital(cid, amount, desc, tier) { 
        state.addToLedger(cid, desc, 'DOCENTE', amount); 
        if(tier) state.data.companies[cid].sponsorAwarded = tier;
        this.render(); 
    },
    teacherFine(cid, amount, desc) { state.addToLedger(cid, desc, 'DOCENTE', amount); this.render(); },
    
    // EXPORT & BACKUP
    exportCSV() {
        let csv = "Empresa,Fecha,Concepto,Departamento,Variacion_Virtual,Saldo_Final_Virtual\n";
        for (const coId in state.data.companies) state.data.companies[coId].ledger.forEach(l => { csv += `"${state.data.companies[coId].name}","${l.date}","${l.concept}","${l.dept}",${l.delta},${l.final}\n`; });
        this.downloadFile(csv, 'csv', 'marsket_ledger_export.csv');
    },
    exportActaCSV() {
        let csv = "Empresa,FYQ,ECO,LYE,LEN,MAT,ING,Media_Global\n";
        Object.values(state.data.companies).forEach(co => {
            const g = co.grades || {};
            const vals = ['FYQ','ECO','LYE','LEN','MAT','ING'].map(s => g[s] ? g[s].final.toFixed(2) : '');
            const numVals = vals.filter(v => v !== '').map(Number);
            const avg = numVals.length > 0 ? (numVals.reduce((a,b)=>a+b,0)/numVals.length).toFixed(2) : '';
            csv += `"${co.name}",${vals.join(',')},${avg}\n`;
        });
        this.downloadFile(csv, 'csv', 'marsket_acta_notas.csv');
    },
    exportJSON() { this.downloadFile(JSON.stringify(state.data, null, 2), 'json', `marsket_backup_${new Date().getTime()}.json`); },
    downloadFile(content, ext, filename) {
        const blob = new Blob([content], { type: ext === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
        const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    },
    importJSON(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { try { state.data = state.migrate(JSON.parse(ev.target.result)); state.save(); location.reload(); } catch(err) { alert("JSON inválido."); } };
        reader.readAsText(file);
    },
    showModal(title, body, actions) {
        document.getElementById('modal-title').innerText = title; document.getElementById('modal-body').innerHTML = body; document.getElementById('modal-actions').innerHTML = actions + `<button onclick="ui.closeModal()" class="bg-slate-800 text-white px-4 py-2 text-[10px] font-bold uppercase hover:bg-slate-700 transition-all shadow-md border border-slate-600">Cerrar</button>`; document.getElementById('modal-overlay').classList.remove('hidden');
    },
    closeModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
};