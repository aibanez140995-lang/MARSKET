// js/ui-docente-core.js
// --- MÓDULO DOCENTE: ENRUTADOR, TABS Y CENTRO DE SEGURIDAD/BACKUPS (v1.0.17) ---

Object.assign(ui, {
    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        const wrapper = document.createElement('div');
        
        const isCoord = state.user.role.startsWith('COORD');
        const tab = this.adminTab || 'dash';

        let tabsHtml = `
        <div class="flex gap-1 mb-6 border-b border-mars-border pb-2 overflow-x-auto scrollbar-hide">
            <button onclick="ui.adminTab='dash'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='dash'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'}">🚀 Startups & PINs</button>
            <button onclick="ui.adminTab='eval'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='eval'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'}">📊 Rúbricas & Dossier</button>
            <button onclick="ui.adminTab='telemetry'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='telemetry'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'}">📡 Telemetría</button>
            ${isCoord ? `<button onclick="ui.adminTab='hr'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='hr'?'bg-mars-magenta text-white':'text-slate-400 hover:text-white'}">🚨 Alertas HR & Dev</button>` : ''}
            ${isCoord ? `<button onclick="ui.adminTab='catalog'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='catalog'?'bg-mars-yellow text-black':'text-slate-400 hover:text-white'}">🛒 Catálogo I+D</button>` : ''}
            ${isCoord ? `<button onclick="ui.adminTab='backups'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase transition-colors whitespace-nowrap ${tab==='backups'?'bg-blue-500 text-white':'text-slate-400 hover:text-white'}">💾 Backups & D1</button>` : ''}
        </div>`;

        wrapper.innerHTML = tabsHtml;

        const content = document.createElement('div');
        try {
            if (tab === 'dash') {
                content.innerHTML = this.renderAdminDash() + (typeof this.renderAdminStartups === 'function' ? this.renderAdminStartups() : '');
            } else if (tab === 'eval' && typeof this.renderAdminEval === 'function') {
                content.innerHTML = this.renderAdminEval();
            } else if (tab === 'telemetry' && typeof this.renderAdminTelemetry === 'function') {
                content.innerHTML = this.renderAdminTelemetry();
            } else if (tab === 'hr' && isCoord && typeof this.renderAdminHR === 'function') {
                content.innerHTML = this.renderAdminHR();
            } else if (tab === 'catalog' && isCoord && typeof this.renderAdminCatalog === 'function') {
                content.innerHTML = this.renderAdminCatalog();
            } else if (tab === 'backups' && isCoord && typeof this.renderAdminBackups === 'function') {
                content.innerHTML = this.renderAdminBackups();
            } else if (tab === 'settings' && isCoord && typeof this.renderAdminStartups === 'function') {
                content.innerHTML = this.renderAdminStartups();
            }
        } catch (err) {
            console.error("Error renderizando pestaña docente:", err);
            content.innerHTML = `<div class="terminal-border bg-red-950/30 border-red-500 p-4 text-xs text-red-400">Error al renderizar vista docente: ${err.message}</div>`;
        }
        
        wrapper.appendChild(content);
        el.appendChild(wrapper);
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

    downloadFile(content, extension, customName) {
        const a = document.createElement('a');
        const blob = new Blob([content], { type: extension === 'csv' ? 'text/csv;charset=utf-8;' : 'text/json;charset=utf-8;' });
        a.href = URL.createObjectURL(blob);
        a.download = customName || `marsket_data_${new Date().toISOString().split('T')[0]}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
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
                location.reload();
            } catch(err) {
                alert("❌ Error al leer o restaurar el archivo JSON: " + err.message);
            }
        };
        reader.readAsText(fileInput.files[0]);
    }
});