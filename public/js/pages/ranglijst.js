// Tab: Ranglijst
V.rank=()=>{
 const key=rankTab;const me={n:'★ '+esc(S.name)+' (jij)',xp:S.xp,cash:S.cash+S.bank,me:1};
 if(window.__TOKEN__&&!window.__LB_LOADING__&&(!window.__LB__||Date.now()-window.__LB_AT__>30000))loadLeaderboard();
 const real=(window.__LB__||[]).filter(p=>!window.__USER__||p.name.toLowerCase()!==window.__USER__.toLowerCase()).map(p=>({n:esc(p.name)+' <span class="tag gr">speler</span>',xp:+p.xp,cash:+p.networth}));
 const list=[...S.npcs,...real,me].sort((a,b)=>b[key]-a[key]);
 return `<h1>Ranglijst</h1><p class="sub">Echte spelers staan hier tussen de rivalen uit de onderwereld. Je rivalen worden ook sterker terwijl jij speelt.</p>
 <div class="tabs"><button class="${key==='xp'?'on':''}" onclick="rankTab='xp';render()">Op rang</button><button class="${key==='cash'?'on':''}" onclick="rankTab='cash';render()">Op vermogen</button></div>
 <div class="card" style="overflow-x:auto"><table class="lb"><thead><tr><th>#</th><th>Naam</th><th>Rang</th><th style="text-align:right">${key==='xp'?'XP':'Vermogen'}</th></tr></thead><tbody>
 ${list.map((p,i)=>`<tr class="${p.me?'me':''}"><td class="pos" style="color:${i===0?'var(--gold)':i<3?'var(--cyan)':'inherit'}">${i+1}</td><td>${p.n}</td><td>${RANKS[rankIdx(p.xp)][0]}</td><td class="num">${key==='xp'?Math.floor(p.xp).toLocaleString('nl-NL'):fmt(p.cash)}</td></tr>`).join('')}
 </tbody></table></div>`};
function loadLeaderboard(){window.__LB_LOADING__=true;
 fetch('/api/leaderboard').then(r=>r.json()).then(j=>{window.__LB__=j.players||[];window.__LB_AT__=Date.now()}).catch(()=>{window.__LB__=[];window.__LB_AT__=Date.now()})
 .finally(()=>{window.__LB_LOADING__=false;if(page==='rank')render()})}
