// js/ui-empresa-core.js
// --- MÓDULO CORE: LOGIN, NOTIFICACIONES Y DOSSIER ---

Object.assign(ui, {
    viewLogin(el) {
        if (!el) return; // REGLA 3: Manipulación segura del DOM
        let coOptions = Object.keys(state.data.companies).map(k => `<option value="${k}">${state.data.companies[k].name}</option>`).join('');
        el.innerHTML = `
        <div class="min-h-[75vh] flex items-center justify-center w-full px-4">
            <div class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300">
                <img src="/logo.png" alt="MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
                <h2 class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-6 tracking-widest uppercase font-black">Secure_Access</h2>
                <select id="login-co" onchange="auth.updateRoleOptions()" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-4 outline-none focus:border-mars-cyan text-white">
                    ${coOptions}
                    <option value="admin" class="text-mars-yellow font-bold">CLAUSTRO DOCENTE</option>
                </select>
                <select id="login-role" class="w-full bg-slate-900 border border-mars-border p-3 text-sm mb-6 outline-none focus:border-mars-cyan uppercase text-white font-bold">
                    <option>CEO</option><option>Técnico</option><option>Finanzas</option><option>Marketing</option><option>Operaciones IA</option><option>Auxiliar</option>
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
            </div>
        </div>`;
        setTimeout(() => auth.updateRoleOptions(), 50);
    },

    renderNotifications() {
        if (!state.user) return ''; // REGLA 2: Ghost clicks y sesión
        const co = state.data.companies[state.user.coId];
        if (!co) return ''; // REGLA 4: Sesión huérfana
        
        co.notifications = co.notifications || []; // REGLA 1: Blindaje
        
        const myNotifs = co.notifications.filter(n => n.role === state.user.role && !n.read);
        if (myNotifs.length === 0) return '';
        
        return `<div class="mb-6 space-y-2 animate-in fade-in slide-in-from-top-4">
            ${myNotifs.map(n => {
                let colors = 'border-mars-cyan bg-mars-cyan/10 text-mars-cyan';
                if (n.type === 'error') colors = 'border-mars-magenta bg-mars-magenta/10 text-mars-magenta';
                if (n.type === 'success') colors = 'border-mars-green bg-mars-green/10 text-mars-green';
                if (n.type === 'warning') colors = 'border-mars-yellow bg-mars-yellow/10 text-mars-yellow';
                
                return `
                <div class="flex justify-between items-center p-3 border ${colors} shadow-sm">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-bold uppercase leading-tight">${n.message}</span>
                        <span class="text-[8px] opacity-70 mt-1">${n.date}</span>
                    </div>
                    <button onclick="ui.dismissNotification('${n.id}')" class="px-3 py-1 font-black hover:text-white transition-colors text-xs">X</button>
                </div>`;
            }).join('')}
        </div>`;
    },

    dismissNotification(id) {
        if (!state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        co.notifications = co.notifications || [];
        const notif = co.notifications.find(n => n.id === id);
        if (notif) notif.read = true;
        state.save();
        this.render();
    },

    viewDossier(el) {
        if (!el || !state.user) return;
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        const tab = this.dossierTab || 'eval';
        
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
        <div class="flex gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showDossierTab('eval')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Evaluación Continua</button>
            <button onclick="ui.showDossierTab('docs')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Archivo Documental</button>
        </div>
        <div id="dossier-content" class="w-full"></div>
        `;
        el.appendChild(wrapper);
        this.renderDossierContent(tab);
    },

    showDossierTab(tab) {
        this.dossierTab = tab;
        this.render();
    },

    renderDossierContent(tab) {
        const container = document.getElementById('dossier-content');
        if (!container || !state.user) return; 
        
        const co = state.data.companies[state.user.coId];
        if (!co) return auth.logout();
        
        if(tab === 'eval') {
            const subjects = ['FYQ', 'ECO', 'LYE', 'LEN', 'MAT', 'ING'];
            let html = `<div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">`;
            
            subjects.forEach(sub => {
                const config = RUBRIC_CONFIG[sub];
                const grade = (co.grades && co.grades[sub]) ? co.grades[sub] : { scores: {}, feedback: '', final: null };
                
                html += `
                <div class="terminal-border bg-mars-card p-4 border-t-2 border-t-mars-cyan w-full">
                    <div class="flex justify-between items-center mb-3 border-b border-mars-border/50 pb-2">
                        <h3 class="font-orbitron text-mars-cyan text-xs uppercase">${config.name}</h3>
                        <span class="text-lg font-mono font-black ${grade.final !== null ? 'text-mars-green' : 'text-slate-600'}">${grade.final !== null ? grade.final.toFixed(2) : '--'}</span>
                    </div>
                    <div class="space-y-2 mb-3 w-full">
                        ${config.criteria.map(c => `
                        <div class="flex justify-between text-[9px] uppercase w-full">
                            <span class="text-slate-400">${c.name} (${c.weight*100}%)</span>
                            <span class="font-bold ${grade.scores[c.id] ? 'text-white' : 'text-slate-600'}">${grade.scores[c.id] || '-'}</span>
                        </div>`).join('')}
                    </div>
                    ${grade.feedback ? `<div class="bg-black p-2 border border-slate-800 text-[9px] text-slate-300 italic w-full">"${grade.feedback}"</div>` : ''}
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;
        } else {
            const docs = co.deliverables || {};
            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-6 w-full">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase">Archivo Documental</h3>
                <div class="space-y-4 w-full">
                    ${this.renderDocBadge('Informe Técnico (FYQ)', docs.technicalReport)}
                    ${this.renderDocBadge('Libro de Cuentas (ECO)', docs.financeBook)}
                    ${this.renderDocBadge('Micro-Pitch Fase I (ING/LYE)', docs.presPhase1)}
                    ${this.renderDocBadge('Pitch Final Fase III (LEN)', docs.presPhase3)}
                    ${this.renderDocBadge('Propuesta de Valor (LYE)', docs.valuePropDoc)}
                </div>
            </div>`;
        }
    }
});