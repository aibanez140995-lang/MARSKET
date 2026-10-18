// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES DE PLAZOS Y BACKUPS D1 (v1.0.17) ---

Object.assign(ui, {
    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        
        const wrapper = document.createElement('div');
        const currentTab = this.adminTab || 'dash';
        const isCoord = state.user.role.startsWith('COORD');
        
        const tabsHtml = `
        <div class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3">
            <button onclick="ui.adminTab='dash'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='dash'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                📊 Visión Global & Aduana
            </button>
            <button onclick="ui.adminTab='eval'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='eval'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                🎖️ Rúbricas & Entregas (100%)
            </button>
            <button onclick="ui.adminTab='startups'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='startups'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                🚀 Startups & PINs
            </button>
            <button onclick="ui.adminTab='telemetry'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='telemetry'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                📈 Telemetría & Conexiones
            </button>
            ${isCoord ? `
            <button onclick="ui.adminTab='hr'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='hr'?'bg-mars-magenta text-white border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                ⚖️ Alertas HR
            </button>
            <button onclick="ui.adminTab='catalog'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='catalog'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                🛒 SUPERMARS-KET
            </button>
            <button onclick="ui.adminTab='settings'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='settings'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                ⚙️ Ajustes & Buzón Dev
            </button>
            <button onclick="ui.adminTab='backups'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='backups'?'bg-blue-500 text-white border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                💾 Backups & D1
            </button>` : ''}
        </div>`;

        wrapper.innerHTML = tabsHtml;
        const subContainer = document.createElement('div');

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
            subContainer.innerHTML = `<div class="bg-red-900/50 border border-red-500 p-4 text-white">Error de renderizado en pestaña ${currentTab}: ${err.message}</div>`;
        }

        wrapper.appendChild(subContainer);
        el.appendChild(wrapper);
    },

    renderAdminSettings() {
        const dl = state.data.config.deadlines || {};
        const suggestions = state.data.suggestionsToAlex || [];

        const suggsHtml = suggestions.map((sugg, idx) => {
            const cat = sugg.category || 'MEJORA';
            const status = sugg.status || 'RECIBIDO';
            const catBadge = cat === 'BUG' ? 'text-mars-magenta border-mars-magenta bg-mars-magenta/10' : (cat === 'REGLAS' ? 'text-mars-cyan border-mars-cyan bg-mars-cyan/10' : 'text-mars-yellow border-mars-yellow bg-mars-yellow/10');
            
            return `
            <div class="bg-slate-900 border border-mars-border p-4 text-[10px] mb-2">
                <div class="flex justify-between items-center mb-2 flex-wrap gap-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[8px] font-black uppercase px-1.5 py-0.5 border ${catBadge}">${cat}</span>
                        <span class="text-white font-bold uppercase">${sugg.author}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <select onchange="ui.updateSuggestionStatus('${sugg.id}', this.value)" class="bg-black border border-slate-700 text-white p-1 text-[9px] uppercase font-bold outline-none">
                            <option value="RECIBIDO" ${status==='RECIBIDO'?'selected':''}>Recibido</option>
                            <option value="EN_REVISION" ${status==='EN_REVISION'?'selected':''}>En Revisión</option>
                            <option value="IMPLEMENTADO" ${status==='IMPLEMENTADO'?'selected':''}>Implementado</option>
                        </select>
                        <button onclick="ui.deleteSuggestion('${sugg.id}')" class="text-mars-magenta hover:text-white font-bold px-2">X</button>
                    </div>
                </div>
                <p class="text-slate-300 italic mb-2 bg-black/50 p-2 border border-slate-800">"${sugg.text}"</p>
                <span class="text-[8px] text-slate-500 block text-right">${sugg.date}</span>
            </div>`;
        }).join('') || '<p class="text-slate-600 italic text-xs">No hay sugerencias ni reportes en el buzón.</p>';

        return `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Configuración de Plazos Granulares -->
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-cyan">
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Configuración Granular de Plazos (Resumen)</h3>
                <div class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Informe Técnico (FYQ)</label>
                        <input type="datetime-local" id="dl-techReport" value="${dl.techReport || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Identidad de Marca - Diciembre (LYE)</label>
                        <input type="datetime-local" id="dl-brandIdentity_dec" value="${dl.brandIdentity_dec || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Identidad de Marca - Abril (LYE)</label>
                        <input type="datetime-local" id="dl-brandIdentity_apr" value="${dl.brandIdentity_apr || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Business Model Escrito (LYE)</label>
                        <input type="datetime-local" id="dl-businessModelDoc" value="${dl.businessModelDoc || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Dossier para Inversores (Lengua)</label>
                        <input type="datetime-local" id="dl-investorDossier" value="${dl.investorDossier || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <div>
                        <label class="text-[9px] text-slate-400 uppercase font-bold block mb-1">Balance de Situación (Economía)</label>
                        <input type="datetime-local" id="dl-balanceSheet" value="${dl.balanceSheet || ''}" class="w-full bg-slate-900 border border-slate-700 p-2 text-xs text-white outline-none">
                    </div>
                    <button onclick="ui.saveDeadlines()" class="w-full bg-mars-cyan text-black font-black py-3 text-[10px] uppercase tracking-widest hover:bg-white transition-all mt-4">Actualizar Plazos Oficiales</button>
                    <p class="text-[8px] text-slate-500 mt-2">* Para editar los 19 plazos completos, ve a la pestaña "Startups & PINs".</p>
                </div>
            </div>

            <!-- Buzón Alex y Sugerencias -->
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow">
                <div class="flex justify-between items-center mb-4 border-b border-mars-border pb-2">
                    <h3 class="font-orbitron text-mars-yellow text-xs uppercase tracking-widest">Buzón Alex (Desarrollo & Feedback)</h3>
                    <span class="text-[9px] text-slate-400 uppercase">${suggestions.length} Reportes</span>
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
                    <p class="text-[9px] text-slate-400 uppercase mt-0.5">Control de estado global. Protegido mediante bindings nativos de Cloudflare.</p>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-slate-900 border border-slate-700 p-4 flex flex-col justify-between">
                    <div>
                        <h4 class="text-white font-bold text-xs uppercase mb-2 text-center border-b border-slate-700 pb-2">1. Backup Manual Local</h4>
                        <p class="text-[9px] text-slate-400 text-center mb-4 leading-relaxed">Descarga el estado de todas las empresas en un archivo JSON seguro en tu ordenador.</p>
                    </div>
                    <button onclick="ui.downloadStateJSON()" class="w-full bg-slate-800 text-slate-300 border border-slate-600 font-black py-3 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Descargar JSON</button>
                </div>

                <div class="bg-slate-900 border border-blue-500/50 p-4 flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-blue-500 text-white text-[7px] font-black px-2 py-0.5 uppercase">Sobreescribible</div>
                    <div>
                        <h4 class="text-blue-400 font-bold text-xs uppercase mb-2 text-center border-b border-blue-500/50 pb-2">2. Snapshot Diario (Cloud)</h4>
                        <p class="text-[9px] text-slate-400 text-center mb-4 leading-relaxed">Fuerza un volcado del estado actual en el slot diario de la base de datos D1. Reemplaza el de ayer.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('daily')" class="w-full bg-blue-600/20 text-blue-400 border border-blue-500 font-black py-3 text-[10px] uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all">Generar Backup Diario</button>
                </div>

                <div class="bg-slate-900 border border-mars-yellow/50 p-4 flex flex-col justify-between relative overflow-hidden">
                    <div class="absolute top-0 right-0 bg-mars-yellow text-black text-[7px] font-black px-2 py-0.5 uppercase">Inmutable</div>
                    <div>
                        <h4 class="text-mars-yellow font-bold text-xs uppercase mb-2 text-center border-b border-mars-yellow/50 pb-2">3. Archivo Semanal (Cloud)</h4>
                        <p class="text-[9px] text-slate-400 text-center mb-4 leading-relaxed">Genera un snapshot inmutable fechado. Ideal para cerrar trimestres o hitos de evaluación.</p>
                    </div>
                    <button onclick="ui.forceCloudBackup('weekly')" class="w-full bg-mars-yellow/20 text-mars-yellow border border-mars-yellow font-black py-3 text-[10px] uppercase tracking-widest hover:bg-mars-yellow hover:text-black transition-all">Crear Archivo Semanal</button>
                </div>
            </div>
        </div>

        <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-magenta">
            <h3 class="font-orbitron text-mars-magenta text-xs mb-4 uppercase tracking-widest border-b border-mars-magenta/50 pb-2">Punto de Restauración (Rollback de Emergencia)</h3>
            <p class="text-[10px] text-slate-300 mb-4 leading-relaxed">Si un fallo o ataque altera gravemente la economía o el inventario, sube un archivo JSON previamente descargado (Backup 1) para sobreescribir la base de datos completa y restaurar la normalidad.</p>
            <div class="flex items-center gap-4 flex-wrap">
                <input type="file" id="restore-json-file" accept=".json" class="text-[10px] text-slate-400 bg-black border border-slate-700 p-2 w-full md:w-auto flex-grow">
                <button onclick="ui.restoreStateFromJSON()" class="bg-mars-magenta text-white font-black px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-white hover:text-mars-magenta transition-all border border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.4)] whitespace-nowrap w-full md:w-auto">⚠ Ejecutar Restauración</button>
            </div>
        </div>
        `;
    },

    saveDeadlines() {
        const fields = ['techReport', 'brandIdentity_dec', 'brandIdentity_apr', 'businessModelDoc', 'investorDossier', 'balanceSheet'];
        state.data.config.deadlines = state.data.config.deadlines || {};
        
        fields.forEach(f => {
            const el = document.getElementById(`dl-${f}`);
            if (el) state.data.config.deadlines[f] = el.value;
        });

        state.save();
        alert("✅ Plazos institucionales actualizados.");
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
        if(!confirm(`¿Deseas generar un backup ${type === 'weekly' ? 'Semanal Inmutable' : 'Diario Sobreescribible'} en Cloudflare D1?`)) return;
        try {
            const res = await fetch('/api/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'force_backup', type: type })
            });
            if(res.ok) alert(`✅ Backup ${type} generado con éxito en Cloudflare D1.`);
            else alert("❌ Error al generar el backup en el servidor.");
        } catch(e) {
            alert("❌ Error de conexión al generar el backup.");
        }
    },

    restoreStateFromJSON() {
        const fileInput = document.getElementById('restore-json-file');
        if (!fileInput || !fileInput.files.length) return alert("Selecciona un archivo JSON válido primero.");
        if (!confirm("⚠ CUIDADO: Vas a SOBREESCRIBIR toda la base de datos de MARS-KET con los datos de este archivo. Esta acción no se puede deshacer. ¿Proceder?")) return;

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
                
                alert("✅ Restauración completada. La base de datos D1 y el almacenamiento local han vuelto al estado del backup.");
                location.reload(true);
            } catch(err) {
                alert("❌ Error al leer o restaurar el archivo JSON: " + err.message);
            }
        };
        reader.readAsText(fileInput.files[0]);
    }
});