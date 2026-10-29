// Tab: Ranglijst
V.rank=()=>{
 const key=rankTab;const me={n:'★ '+S.name+' (jij)',xp:S.xp,cash:S.cash+S.bank,me:1};
 const list=[...S.npcs,me].sort((a,b)=>b[key]-a[key]);
 return `<h1>Ranglijst</h1><p class="sub">Je rivalen worden ook sterker terwijl jij speelt. Laat ze niet ontsnappen.</p>
 <div class="tabs"><button class="${key==='xp'?'on':''}" onclick="rankTab='xp';render()">Op rang</button><button class="${key==='cash'?'on':''}" onclick="rankTab='cash';render()">Op vermogen</button></div>
 <div class="card" style="overflow-x:auto"><table class="lb"><thead><tr><th>#</th><th>Naam</th><th>Rang</th><th style="text-align:right">${key==='xp'?'XP':'Vermogen'}</th></tr></thead><tbody>
 ${list.map((p,i)=>`<tr class="${p.me?'me':''}"><td class="pos" style="color:${i===0?'var(--gold)':i<3?'var(--cyan)':'inherit'}">${i+1}</td><td>${p.n}</td><td>${RANKS[rankIdx(p.xp)][0]}</td><td class="num">${key==='xp'?Math.floor(p.xp).toLocaleString('nl-NL'):fmt(p.cash)}</td></tr>`).join('')}
 </tbody></table></div>`};
