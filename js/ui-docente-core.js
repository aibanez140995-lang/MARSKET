// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES DE PLAZOS Y BACKUPS D1 (v1.1.00) ---

Object.assign(ui, {
    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        
        const wrapper = document.createElement('div');
        const currentTab = this.adminTab || 'dash';
        const isCoord = state.user.role.startsWith('COORD');
        
        const tabsHtml = `
        <div role="tablist" aria-label="Pestañas del Panel Docente" class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3">
            <button role="tab" aria-selected="${currentTab==='dash'}" onclick="ui.adminTab='dash'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='dash'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                📊 Visión Global & Aduana
            </button>
            <button role="tab" aria-selected="${currentTab==='eval'}" onclick="ui.adminTab='eval'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='eval'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                🎖️ Rúbricas & Entregas (100%)
            </button>
            <button role="tab" aria-selected="${currentTab==='startups'}" onclick="ui.adminTab='startups'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='startups'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                🚀 Startups & PINs
            </button>
            <button role="tab" aria-selected="${currentTab==='telemetry'}" onclick="ui.adminTab='telemetry'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='telemetry'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                📈 Telemetría & Conexiones
            </button>
            ${isCoord ? `
            <button role="tab" aria-selected="${currentTab==='hr'}" onclick="ui.adminTab='hr'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='hr'?'bg-mars-magenta text-white border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                ⚖️ Alertas HR
            </button>
            <button role="tab" aria-selected="${currentTab==='catalog'}" onclick="ui.adminTab='catalog'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='catalog'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                🛒 SUPERMARS-KET
            </button>
            <button role="tab" aria-selected="${currentTab==='settings'}" onclick="ui.adminTab='settings'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='settings'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                ⚙️ Ajustes & Buzón Dev
            </button>
            <button role="tab" aria-selected="${currentTab==='backups'}" onclick="ui.adminTab='backups'; ui.render()" class="min-h-[44px] px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all ${currentTab==='backups'?'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]':'bg-mars-card text-slate-300 border-mars-border hover:text-white'}">
                💾 Backups & D1
            </button>` : ''}
        </div>`;

        wrapper.innerHTML = tabsHtml;
        const subContainer = document.createElement('div');
        subContainer.setAttribute('role', 'tabpanel');

        try {
            switch(currentTab) {
                case 'dash': subContainer.innerHTML = this.renderAdminDash(); break;
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

        wrapper.appendChild(subContainer);
        el.appendChild(wrapper);
    },

    renderAdminSettings() {
        const dl = state.data.config.deadlines || {};
        const suggestions = state.data.suggestionsToAlex || [];

        const suggsHtml = suggestions.map((sugg) => {
            const cat = sugg.category || 'MEJORA';
            const status = sugg.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            
            return `
            <div class="bg-slate-900 border border-mars-border p-4 text-xs mb-2">
                <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-black uppercase px-2 py-0.5 border ${catBadge}">${this.escapeHTML(cat)}</span>
                        <span class="text-white font-bold uppercase break-words">${this.escapeHTML(sugg.author)}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <select aria-label="Estado de sugerencia" onchange="ui.updateSuggestionStatus('${this.escapeHTML(sugg.id)}', this.value)" class="min-h-[44px] bg-black border border-slate-700 text-white p-1.5 text-xs uppercase font-bold outline-none">
                            <option value="RECIBIDO" ${status==='RECIBIDO'?'selected':''}>Recibido</option>
                            <option value="EN_REVISION" ${status==='EN_REVISION'?'selected':''}>En Revisión</option>
                            <option value="IMPLEMENTADO" ${status==='IMPLEMENTADO'?'selected':''}>Implementado</option>
                        </select>
                        <button onclick="ui.deleteSuggestion('${this.escapeHTML(sugg.id)}')" aria-label="Eliminar sugerencia" class="min-h-[44px] min-w-[44px] text-mars-magenta hover:text-white font-bold px-2 border border-mars-magenta/40">X</button>
                    </div>
                </div>
                <p class="text-slate-200 italic mb-2 bg-black/50 p-2 border border-slate-800 break-words">"${this.escapeHTML(sugg.text)}"</p>
                <span class="text-xs text-slate-300 block text-right">${this.escapeHTML(sugg.date)}</span>
            </div>`;
        }).join('') || '<p class="text-slate-300 italic text-xs">No hay sugerencias ni reportes en el buzón.</p>';

        return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Configuración de Plazos Granulares -->
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Configuración Granular de Plazos (Resumen)</h3>
                <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <div>
                        <label for="dl-technicalReport" class="text-xs text-slate-300 uppercase font-bold block mb-1">Informe Técnico (FYQ)</label>
                        <input type="datetime-local" id="dl-technicalReport" value="${this.escapeHTML(dl.technicalReport || dl.techReport || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="dl-brandIdentity_dec" class="text-xs text-slate-300 uppercase font-bold block mb-1">Identidad de Marca - Diciembre (LYE)</label>
                        <input type="datetime-local" id="dl-brandIdentity_dec" value="${this.escapeHTML(dl.brandIdentity_dec || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="dl-brandIdentity_apr" class="text-xs text-slate-300 uppercase font-bold block mb-1">Identidad de Marca - Abril (LYE)</label>
                        <input type="datetime-local" id="dl-brandIdentity_apr" value="${this.escapeHTML(dl.brandIdentity_apr || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="dl-businessModelDoc" class="text-xs text-slate-300 uppercase font-bold block mb-1">Business Model Escrito (LYE)</label>
                        <input type="datetime-local" id="dl-businessModelDoc" value="${this.escapeHTML(dl.businessModelDoc || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="dl-investorDossier" class="text-xs text-slate-300 uppercase font-bold block mb-1">Dossier para Inversores (Lengua)</label>
                        <input type="datetime-local" id="dl-investorDossier" value="${this.escapeHTML(dl.investorDossier || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none">
                    </div>
                    <div>
                        <label for="dl-balanceSheet" class="text-xs text-slate-300 uppercase font-bold block mb-1">Balance de Situación (Economía)</label>
                        <input type="datetime-local" id="dl-balanceSheet" value="${this.escapeHTML(dl.balanceSheet || '')}" class="min-h-[44px] w-full bg-slate-900 border border-slate-700 p-2.5 text-base sm:text-xs text-white outline-none">
                    </div>
                    <button onclick="ui.saveDeadlines()" class="min-h-[44px] w-full bg-mars-cyan text-black font-black py-3 text-xs uppercase tracking-widest hover:bg-white transition-all mt-4">Actualizar Plazos Oficiales</button>
                    <p class="text-xs text-slate-300 mt-2">* Para editar los 19 plazos completos, ve a la pestaña "Startups & PINs".</p>
                </div>
            </div>

            <!-- Buzón Alex y Sugerencias -->
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Buzón Alex (Desarrollo & Feedback)</h3>
                    <span class="text-xs text-slate-300 uppercase">${suggestions.length} Reportes</span>
                </div>
                <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    ${suggsHtml}
                </div>
            </div>
        </div>`;
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
        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-red-600 mt-6 shadow-[0_0_20px_rgba(255,0,0,0.2)]">
            <div class="flex justify-between items-center mb-4 border-b border-red-900/50 pb-2 flex-wrap gap-2">
                <div>
                    <h3 class="font-orbitron text-red-500 text-xs sm:text-sm uppercase tracking-widest font-black">🚨 RESET GENERAL PRE-LANZAMIENTO (FÁBRICA)</h3>
                    <p class="text-xs text-slate-300 uppercase mt-0.5">Inicialización limpia de simulación para el arranque oficial v1.1.00 en aula.</p>
                </div>
                <span class="bg-red-950/80 border border-red-500 text-red-400 px-3 py-1 text-xs font-black uppercase">ACCIÓN DESTRUCTIVA PROTEGIDA</span>
            </div>
            <p class="text-xs text-slate-200 mb-4 leading-relaxed">
                Restaura todas las startups al estado base de inicio: <strong>2400.00 €v de tesorería</strong>, libro mayor limpio, 19 entregables reseteados a pendiente, 0 multas, 0 transferencias, 0 mociones y telemetría purgada. <strong>Conserva intactas las empresas, sus nombres, códigos de acceso, PINs de roles, catálogo y docentes.</strong>
            </p>
            <div class="bg-red-950/40 border border-red-600/40 p-4 mb-4 text-xs font-mono text-red-300 space-y-1">
                <p>⚠️ Requiere clave de autorización docente maestra.</p>
                <p>🔒 Incrementa la versión de sincronización Cloudflare D1 (+50) para forzar replicación inmediata.</p>
            </div>
            <button type="button" onclick="ui.promptFactoryResetLaunch()" class="min-h-[44px] bg-red-600 hover:bg-red-500 text-white font-black px-6 py-2.5 text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(255,0,0,0.5)] border border-red-400">
                [ 🚨 INICIALIZAR RESET DE FÁBRICA PRE-LANZAMIENTO ]
            </button>
        </div>
        `;
    },

    saveDeadlines() {
        const fields = ['technicalReport', 'brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'investorDossier', 'balanceSheet'];
        state.data.config.deadlines = state.data.config.deadlines || {};
        
        fields.forEach(f => {
            const el = document.getElementById(`dl-${f}`);
            if (el) state.data.config.deadlines[f] = el.value;
        });

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
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(x => x.id !== suggId);
        state.save();
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
        if (key !== 'JOVE2025') {
            this.notify("Clave de autorización maestra INCORRECTA. Operación abortada.", "error");
            if (input) input.value = '';
            return;
        }
        this.closeModal();
        this.confirmAction(
            "ÚLTIMA CONFIRMACIÓN CRÍTICA",
            "¿Estás absolutamente seguro de ejecutar el RESET GENERAL DE FÁBRICA? Esta acción reescribirá la base de datos D1.",
            () => this.factoryResetLaunch(),
            "EJECUTAR RESET DE FÁBRICA"
        );
    },

    async factoryResetLaunch() {
        if (!state.user || !state.user.role.startsWith('COORD')) {
            this.notify("Acceso restringido.", "error");
            return;
        }
        try {
            if (state.data && state.data.companies) {
                Object.keys(state.data.companies).forEach(cid => {
                    const co = state.data.companies[cid];
                    co.balance = 2400.00;
                    co.logo = null;
                    co.slogan = "";
                    co.valueProposition = "";
                    co.brandApproval = { status: 'APROBADO', pendingLogo: null, pendingSlogan: "", feedback: "" };

                    co.ledger = [];
                    co.orders = [];
                    co.realCosts = [];
                    co.flightTests = [];
                    co.votingMotions = [];
                    co.aiPrompts = [];
                    co.marketingCampaigns = [];
                    co.inactivityReports = [];
                    co.notifications = [];
                    co.sanctions = [];
                    co.crisisAlerts = [];
                    co.cart = [];
                    co.bom = [];

                    co.deliverables = {};
                    if (typeof DELIVERABLES_DEF !== 'undefined' && Array.isArray(DELIVERABLES_DEF)) {
                        DELIVERABLES_DEF.forEach(d => {
                            co.deliverables[d.key] = null;
                        });
                    }

                    delete co.nameChangeRequest;
                    delete co.auxRoleRequest;
                    delete co.brandPendingLogo;
                    delete co.brandPendingSlogan;

                    co.updatedAt = Date.now();
                    co.authUpdatedAt = Date.now();
                });
            }

            state.data.b2bMarket = [];
            state.data.b2bContracts = [];
            state.data.securityIncidents = [];
            state.data.suggestionsToAlex = [];
            state.data.telemetry = { totalLogins: 0, sessions: [] };

            state.data.version = (Number(state.data.version) || 1) + 50;
            state.data.lastUpdated = Date.now();

            state.saveLocalOnly();
            await state.pushToCloud(false);

            this.notify("🚀 RESET GENERAL PRE-LANZAMIENTO EJECUTADO CON ÉXITO.", "success");
            this.render();
        } catch (err) {
            console.error("Error durante el factory reset:", err);
            this.notify("Error al ejecutar el reset: " + err.message, "error");
        }
    }
});