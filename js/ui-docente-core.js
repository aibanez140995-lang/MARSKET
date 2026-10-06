// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES Y UTILIDADES ---

Object.assign(ui, {
    // Enrutador principal del panel docente (Refactorizado)
    viewAdmin(el) {
        if (!state.user || !state.user.admin) return; // REGLA 4: Validación de sesión
        if (!el) return; // REGLA 3
        
        const isAlex = state.user.role === 'COORD_ALEX';
        const isCoord = state.user.role.startsWith('COORD');
        
        // Detección de Alertas HR Pendientes para mostrar banner
        let pendingHR = 0;
        Object.keys(state.data.companies).forEach(cid => {
            const co = state.data.companies[cid];
            if (co && co.inactivityReports) {
                pendingHR += co.inactivityReports.filter(r => r.status === 'PENDIENTE').length;
            }
        });

        let hrBanner = '';
        if (isCoord && pendingHR > 0) {
            hrBanner = `
            <div class="bg-mars-magenta/20 border border-mars-magenta text-mars-magenta p-3 mb-6 animate-pulse shadow-[0_0_15px_rgba(255,0,85,0.3)] flex justify-between items-center">
                <span class="font-bold uppercase text-xs tracking-widest">⚠️ ALERTA HR: Hay ${pendingHR} reporte(s) de inactividad pendiente(s) de mediación.</span>
                <button onclick="ui.adminTab='hr'; ui.render()" class="bg-mars-magenta text-white px-4 py-1 text-[10px] font-black uppercase hover:bg-white hover:text-mars-magenta transition-colors">Revisar</button>
            </div>`;
        }
        
        let adminHtml = `
        ${hrBanner}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h2 class="font-orbitron text-mars-yellow text-xl uppercase tracking-widest font-black">Centro_de_Mando_Docente</h2>
            <div class="flex flex-wrap gap-2 border border-mars-border bg-mars-card p-1">
                <button onclick="ui.adminTab='dash'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='dash'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">AEE & Finanzas</button>
                <button onclick="ui.adminTab='eval'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='eval'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Rúbricas & Entregas</button>
                <button onclick="ui.adminTab='startups'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='startups'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Startups</button>
                <button onclick="ui.adminTab='telemetry'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='telemetry'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Telemetría</button>
                ${isCoord ? `<button onclick="ui.adminTab='hr'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='hr'?'bg-mars-magenta text-white':'text-mars-magenta'} hover:text-white transition-colors shadow-[0_0_10px_rgba(255,0,85,0.2)]">Alertas HR ${pendingHR > 0 ? `(${pendingHR})` : ''}</button>` : ''}
                ${isCoord ? `<button onclick="ui.adminTab='catalog'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='catalog'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Catálogo</button>` : ''}
                <button onclick="ui.adminTab='settings'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='settings'?'bg-mars-yellow text-black':'text-slate-400'} hover:text-white transition-colors">Ajustes</button>
                ${isAlex ? `<button onclick="ui.adminTab='alexbox'; ui.render()" class="px-3 sm:px-4 py-2 text-[9px] font-bold uppercase ${this.adminTab==='alexbox'?'bg-mars-cyan text-black':'text-mars-cyan'} hover:text-white transition-colors border-l border-mars-cyan/30">Buzón Alex</button>` : ''}
            </div>
        </div>`;

        // Delegación de renderizado a los submódulos
        if (this.adminTab === 'dash' && typeof this.renderAdminDash === 'function') adminHtml += this.renderAdminDash();
        else if (this.adminTab === 'eval' && typeof this.renderAdminEval === 'function') adminHtml += this.renderAdminEval();
        else if (this.adminTab === 'startups' && typeof this.renderAdminStartups === 'function') adminHtml += this.renderAdminStartups();
        else if (this.adminTab === 'telemetry' && typeof this.renderAdminTelemetry === 'function') adminHtml += this.renderAdminTelemetry();
        else if (this.adminTab === 'hr' && typeof this.renderAdminHR === 'function') adminHtml += this.renderAdminHR();
        else if (this.adminTab === 'catalog' && typeof this.renderAdminCatalog === 'function') adminHtml += this.renderAdminCatalog();
        else if (this.adminTab === 'settings') adminHtml += this.renderAdminSettings();
        else if (this.adminTab === 'alexbox') adminHtml += this.renderAdminAlexBox();
        
        el.innerHTML = adminHtml;
    },

    renderAdminSettings() {
        const currentTeacher = state.data.config.teachers[state.user.role];
        const dl = state.data.config.deadlines;
        const gl = state.data.config.guidelines;
        const role = state.user.role;
        const isCoord = role.startsWith('COORD');

        let configHtml = '';

        if (isCoord) {
            configHtml = `
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
            `;
        } else {
            switch(role) {
                case 'FYQ':
                    configHtml = `
                        <div class="space-y-3 text-[10px]">
                            <div><label class="text-mars-cyan font-bold block mb-1">Cierre Informe Técnico FYQ</label><input type="datetime-local" id="dl-tech" value="${dl.techReport}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div>
                            <div class="border-t border-mars-border/50 pt-3 mt-3">
                                <label class="text-mars-magenta font-bold block mb-1">Enlace a Guía Oficial Informe FYQ (URL)</label>
                                <input type="text" id="gl-url" value="${gl.techReportDocUrl}" placeholder="https://..." class="w-full bg-slate-900 border border-mars-border p-2 text-white mb-2">
                                <input type="text" id="gl-notes" value="${gl.techReportNotes}" placeholder="Notas breves..." class="w-full bg-slate-900 border border-mars-border p-2 text-white">
                            </div>
                        </div>`;
                    break;
                case 'LYE':
                    configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Doc. Propuesta de Valor</label><input type="datetime-local" id="dl-vp" value="${dl.valuePropDoc}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                    break;
                case 'ECO':
                    configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Libro Cuentas FIN</label><input type="datetime-local" id="dl-fin" value="${dl.financeBook}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                    break;
                case 'ING':
                    configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase I (Inglés)</label><input type="datetime-local" id="dl-pres1" value="${dl.presPhase1}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                    break;
                case 'LEN':
                    configHtml = `<div class="text-[10px]"><div><label class="text-mars-cyan font-bold block mb-1">Cierre Pitch Fase III (Castellano)</label><input type="datetime-local" id="dl-pres3" value="${dl.presPhase3}" class="w-full bg-slate-900 border border-mars-border p-2 text-white"></div></div>`;
                    break;
                default:
                    configHtml = `<p class="text-slate-500 italic text-xs col-span-full">No hay plazos ni guías configurables para esta asignatura en el sistema central.</p>`;
            }
        }

        return `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="terminal-border bg-mars-card p-6 border-t-4 border-t-mars-yellow md:col-span-2">
                <h3 class="font-orbitron text-mars-yellow text-xs mb-4 uppercase">Configuración de Plazos (Deadlines) y Guías</h3>
                ${configHtml}
                ${configHtml.includes('input') ? `<button onclick="ui.saveSettings()" class="w-full bg-mars-yellow text-black font-black py-3 mt-4 text-[10px] uppercase hover:bg-white transition-all">Guardar Configuración</button>` : ''}
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
                    ${typeof ui.exportActaCSV === 'function' ? `<button onclick="ui.exportActaCSV()" class="bg-mars-green/20 border border-mars-green text-mars-green px-4 py-3 text-[10px] font-bold uppercase hover:bg-mars-green hover:text-black transition-all text-left truncate">2. Exportar Acta de Notas (CSV)</button>` : ''}
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
    },

    renderAdminAlexBox() {
        return `
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
    },

    saveSettings() {
        const dl = state.data.config.deadlines;
        const gl = state.data.config.guidelines;
        
        const elPres1 = document.getElementById('dl-pres1');
        if(elPres1) dl.presPhase1 = elPres1.value;
        
        const elVp = document.getElementById('dl-vp');
        if(elVp) dl.valuePropDoc = elVp.value;
        
        const elTech = document.getElementById('dl-tech');
        if(elTech) dl.techReport = elTech.value;
        
        const elFin = document.getElementById('dl-fin');
        if(elFin) dl.financeBook = elFin.value;
        
        const elPres3 = document.getElementById('dl-pres3');
        if(elPres3) dl.presPhase3 = elPres3.value;
        
        const elGlUrl = document.getElementById('gl-url');
        if(elGlUrl) gl.techReportDocUrl = elGlUrl.value;
        
        const elGlNotes = document.getElementById('gl-notes');
        if(elGlNotes) gl.techReportNotes = elGlNotes.value;
        
        state.save();
        alert("Configuración guardada con éxito.");
        this.render();
    },

    changeTeacherPIN() {
        const elPin = document.getElementById('new-teacher-pin');
        if (!elPin) return; // REGLA 3
        const np = elPin.value;
        if(np.length !== 4) return alert("4 dígitos.");
        if (state.data.config.teachers[state.user.role]) {
            state.data.config.teachers[state.user.role].pin = np; 
            state.save();
            alert("PIN Actualizado."); 
            elPin.value = '';
        }
    },
    
    deleteSuggestion(id) {
        state.data.suggestionsToAlex = state.data.suggestionsToAlex.filter(s => s.id !== id);
        state.save();
        this.render();
    },

    exportCSV() {
        let csv = "Empresa,Fecha,Concepto,Departamento,Variacion_Virtual,Saldo_Final_Virtual\n";
        for (const coId in state.data.companies) {
            const co = state.data.companies[coId];
            if (co && co.ledger) {
                co.ledger.forEach(l => { 
                    csv += `"${co.name}","${l.date}","${l.concept}","${l.dept}",${l.delta},${l.final}\n`; 
                });
            }
        }
        this.downloadFile(csv, 'csv', 'marsket_ledger_export.csv');
    },

    exportJSON() { 
        this.downloadFile(JSON.stringify(state.data, null, 2), 'json', `marsket_backup_${new Date().getTime()}.json`); 
    },

    downloadFile(content, ext, filename) {
        const blob = new Blob([content], { type: ext === 'csv' ? 'text/csv;charset=utf-8;' : 'application/json' });
        const a = document.createElement('a'); 
        a.href = URL.createObjectURL(blob); 
        a.download = filename; 
        a.click();
    },

    importJSON(e) {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { 
            try { 
                state.data = state.migrate(JSON.parse(ev.target.result)); 
                state.save(); 
                location.reload(); 
            } catch(err) { 
                alert("JSON inválido."); 
            } 
        };
        reader.readAsText(file);
    }
});