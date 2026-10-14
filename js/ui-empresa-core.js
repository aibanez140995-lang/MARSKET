// js/ui-empresa-core.js

Object.assign(ui, {
    viewLogin(el) {
        if (!el) return; 
        let coOptions = Object.keys(state.data.companies).map(k => `<option value="${k}">${ui.escapeHTML(state.data.companies[k].name)}</option>`).join('');
        el.innerHTML = `
        <div class="min-h-[75vh] flex items-center justify-center w-full px-4">
            <div id="login-box" class="max-w-md w-full terminal-border bg-mars-card p-6 sm:p-8 glow-cyan animate-in fade-in zoom-in duration-300 transition-all">
                <img src="/logo.png" alt="MARS-KET 2.0" class="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,240,255,0.8)]" onerror="this.style.display='none'">
                <h2 id="login-title" class="font-orbitron text-center text-mars-cyan text-lg sm:text-xl mb-6 tracking-widest uppercase font-black">Secure_Access</h2>
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
                <div id="login-keypad" class="grid grid-cols-3 gap-2 max-w-[220px] mx-auto transition-all">
                    ${[1,2,3,4,5,6,7,8,9].map(n => `<button onclick="auth.press('${n}')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">${n}</button>`).join('')}
                    <button onclick="auth.clear()" class="bg-slate-800 p-4 text-mars-magenta text-xs font-bold hover:bg-mars-magenta hover:text-white transition-all active:scale-95">CLR</button>
                    <button onclick="auth.press('0')" class="bg-slate-800 p-4 text-sm font-bold hover:bg-mars-cyan hover:text-mars-bg transition-all active:scale-95">0</button>
                    <button onclick="auth.verify()" class="bg-mars-green/20 border border-mars-green text-mars-green p-4 text-xs font-bold hover:bg-mars-green hover:text-mars-bg transition-all active:scale-95">ENT</button>
                </div>
            </div>
        </div>`;
        setTimeout(() => auth.updateRoleOptions(), 50);
    },

    playLoginAnimation(role) {
        const container = document.getElementById('login-box');
        const title = document.getElementById('login-title');
        const keypad = document.getElementById('login-keypad');
        
        if (container) {
            container.classList.remove('glow-cyan', 'border-mars-border');
            container.classList.add('shadow-[0_0_20px_#00ff66]', 'border-mars-green');
        }
        if (title) {
            title.innerText = `ACCESS_GRANTED: ${role.replace('_', ' ')}`;
            title.classList.remove('text-mars-cyan');
            title.classList.add('text-mars-green', 'glitch-text');
        }
        if (keypad) {
            keypad.classList.add('hidden');
        }
    },

    renderNotifications() {
        if (!state.user) return ''; 
        const co = state.data.companies[state.user.coId];
        if (!co) return ''; 
        
        co.notifications = co.notifications || []; 
        
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
                        <span class="text-[10px] font-bold uppercase leading-tight">${ui.escapeHTML(n.message)}</span>
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
        
        let coId = state.user.coId;
        if (state.user.admin) {
            coId = this.dossierSelectedCo || Object.keys(state.data.companies)[0];
        }
        
        const co = state.data.companies[coId];
        if (!state.user.admin && !co) return auth.logout();
        if (state.user.admin && !co) {
            el.innerHTML = `<div class="p-6 text-center text-slate-500">No hay startups registradas.</div>`;
            return;
        }
        
        const tab = this.dossierTab || 'eval';
        const wrapper = document.createElement('div');
        
        let adminSelector = '';
        if (state.user.admin) {
            adminSelector = `
            <div class="mb-6 bg-slate-900 p-3 border border-mars-border flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span class="text-mars-cyan font-bold text-[10px] uppercase">Viendo Dossier de:</span>
                <select onchange="ui.dossierSelectedCo=this.value; ui.render()" class="bg-black border border-mars-cyan text-white text-xs p-2 outline-none w-full sm:w-auto">
                    ${Object.keys(state.data.companies).map(k => `<option value="${k}" ${coId===k?'selected':''}>${ui.escapeHTML(state.data.companies[k].name)}</option>`).join('')}
                </select>
            </div>`;
        }
        
        wrapper.innerHTML = `
        ${adminSelector}
        <div class="flex gap-2 mb-6 border-b border-mars-border pb-2">
            <button onclick="ui.showDossierTab('eval')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='eval'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Evaluación Continua</button>
            <button onclick="ui.showDossierTab('docs')" class="px-4 py-2 text-[10px] font-bold uppercase ${tab==='docs'?'bg-mars-cyan text-black':'text-slate-400 hover:text-white'} transition-colors">Archivo Documental</button>
        </div>
        <div id="dossier-content" class="w-full"></div>
        `;
        el.appendChild(wrapper);
        this.renderDossierContent(tab, coId);
    },

    showDossierTab(tab) {
        this.dossierTab = tab;
        this.render();
    },

    renderDossierContent(tab, coId) {
        const container = document.getElementById('dossier-content');
        if (!container || !state.user) return; 
        
        const targetCoId = coId || state.user.coId;
        const co = state.data.companies[targetCoId];
        if (!state.user.admin && !co) return auth.logout();
        if (!co) return;
        
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
                    ${grade.feedback ? `<div class="bg-black p-2 border border-slate-800 text-[9px] text-slate-300 italic w-full">"${ui.escapeHTML(grade.feedback)}"</div>` : ''}
                </div>`;
            });
            html += `</div>`;
            container.innerHTML = html;
        // M-09: Despliegue Matriz de los 16 Entregables Oficiales
        } else {
            const docs = co.deliverables || {};
            container.innerHTML = `
            <div class="terminal-border bg-mars-card p-6 w-full">
                <h3 class="font-orbitron text-mars-cyan text-sm mb-4 uppercase tracking-widest">Archivo Documental Completo</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div>
                        <h4 class="text-[10px] text-mars-cyan font-bold uppercase mb-2 border-b border-mars-cyan/50 pb-1 tracking-widest">Física y Química</h4>
                        ${this.renderDocBadge('Informe Preliminar', docs.informePreliminar)}
                        ${this.renderDocBadge('Boceto / Diseño', docs.boceto)}
                        ${this.renderDocBadge('Foto Prototipo', docs.fotoPrototipo)}
                        ${this.renderDocBadge('Informe Técnico Final', docs.technicalReport)}
                    </div>
                    <div>
                        <h4 class="text-[10px] text-mars-yellow font-bold uppercase mb-2 border-b border-mars-yellow/50 pb-1 tracking-widest">Matemáticas</h4>
                        ${this.renderDocBadge('1. Goniómetro', docs.mathGoniometro)}
                        ${this.renderDocBadge('2. Medición Simple', docs.mathMedicion1)}
                        ${this.renderDocBadge('3. Medición Doble', docs.mathMedicion2)}
                        ${this.renderDocBadge('4. Comparativa Final', docs.mathComparativa)}
                    </div>
                    <div>
                        <h4 class="text-[10px] text-mars-green font-bold uppercase mb-2 border-b border-mars-green/50 pb-1 tracking-widest">Liderazgo y Emprendimiento</h4>
                        ${this.renderDocBadge('Business Model', docs.businessModel)}
                        ${this.renderDocBadge('BM Canvas', docs.canvas)}
                        ${this.renderDocBadge('Propuesta de Valor', docs.valuePropDoc)}
                        ${this.renderDocBadge('Micro-Pitch Fase I', docs.presPhase1)}
                    </div>
                    <div>
                        <h4 class="text-[10px] text-mars-magenta font-bold uppercase mb-2 border-b border-mars-magenta/50 pb-1 tracking-widest">Lengua Castellana e Inglés</h4>
                        ${this.renderDocBadge('Dossier Inversores (LEN)', docs.dossierInversores)}
                        ${this.renderDocBadge('Pitch Final Fase III (LEN)', docs.presPhase3)}
                        ${this.renderDocBadge('Micro-Pitch Fase I (ING)', docs.presPhase1)}
                    </div>
                    <div>
                        <h4 class="text-[10px] text-orange-400 font-bold uppercase mb-2 border-b border-orange-400/50 pb-1 tracking-widest">Economía</h4>
                        ${this.renderDocBadge('Libro de Cuentas y Ledger', docs.financeBook)}
                    </div>
                    <div>
                        <h4 class="text-[10px] text-purple-400 font-bold uppercase mb-2 border-b border-purple-400/50 pb-1 tracking-widest">Marketing Audiovisual</h4>
                        ${this.renderDocBadge('Vídeo Promocional V2.0', docs.videoPromo)}
                    </div>
                </div>
            </div>`;
        }
    }
});