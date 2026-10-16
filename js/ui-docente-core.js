// js/ui-docente-core.js
// --- MÓDULO DOCENTE CORE: ENRUTADOR, AJUSTES DE PLAZOS Y BUZÓN ALEX ---

Object.assign(ui, {
    viewAdmin(el) {
        if (!el || !state.user || !state.user.admin) return auth.logout();
        
        const wrapper = document.createElement('div');
        const currentTab = this.adminTab || 'dash';
        
        const tabsHtml = `
        <div class="flex flex-wrap gap-2 mb-6 border-b border-mars-border pb-3">
            <button onclick="ui.adminTab='dash'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='dash'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                📊 Visión Global & Aduana B2B
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
            <button onclick="ui.adminTab='hr'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='hr'?'bg-mars-magenta text-white border-mars-magenta shadow-[0_0_10px_rgba(255,0,85,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                ⚖️ Alertas HR
            </button>
            <button onclick="ui.adminTab='catalog'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='catalog'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                🛒 SUPERMARS-KET
            </button>
            <button onclick="ui.adminTab='settings'; ui.render()" class="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all ${currentTab==='settings'?'bg-mars-cyan text-black border-mars-cyan shadow-[0_0_10px_rgba(0,240,255,0.3)]':'bg-mars-card text-slate-400 border-mars-border hover:text-white'}">
                ⚙️ Ajustes & Buzón Dev
            </button>
        </div>`;

        wrapper.innerHTML = tabsHtml;
        const subContainer = document.createElement('div');

        switch(currentTab) {
            case 'dash': subContainer.innerHTML = this.renderAdminDash(); break;
            case 'eval': subContainer.innerHTML = this.renderAdminEval(); break;
            case 'startups': subContainer.innerHTML = this.renderAdminStartups(); break;
            case 'telemetry': subContainer.innerHTML = this.renderAdminTelemetry(); break;
            case 'hr': subContainer.innerHTML = this.renderAdminHR(); break;
            case 'catalog': subContainer.innerHTML = this.renderAdminCatalog(); break;
            case 'settings': subContainer.innerHTML = this.renderAdminSettings(); break;
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
            <div class="bg-slate-900 border border-mars-border p-4 text-[10px]">
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
                <h3 class="font-orbitron text-mars-cyan text-xs mb-4 uppercase tracking-widest">Configuración Granular de Plazos</h3>
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
    }
});