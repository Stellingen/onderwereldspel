// Tab: Ranglijst
V.rank=()=>{
 const key=rankTab;const me={n:'★ '+esc(S.name)+(window.__TOKEN__?playerTags(tier()):vipTag())+' (jij)',xp:S.xp,cash:S.cash+bankNet(),me:1};
 if(window.__TOKEN__&&!window.__LB_LOADING__&&(!window.__LB__||Date.now()-window.__LB_AT__>30000))loadLeaderboard();
 const real=(window.__LB__||[]).filter(p=>!window.__USER__||p.name.toLowerCase()!==window.__USER__.toLowerCase()).map(p=>({n:esc(p.name)+playerTags(p.vip),xp:+p.xp,cash:+p.networth,u:p.name,pub:!!+p.pub}));
 const list=[...S.npcs.map((x,i)=>Object.assign({},x,{n:esc(x.n),npc:i})),...real,me].sort((a,b)=>b[key]-a[key]);
 const who=p=>p.me?(window.__USER__?`pvShow('${window.__USER__}')`:''):p.u?`pvShow('${p.u}')`:`pvNpc(${p.npc})`;
 const top=list.slice(0,3),rest=list.slice(3),val=p=>key==='xp'?Math.floor(p.xp).toLocaleString('nl-NL')+' XP':fmt(p.cash);
 const meIdx=list.findIndex(p=>p.me);
 const ini=p=>{const t=String(p.n).replace(/<[^>]*>/g,'').replace(/[★"]/g,'').trim();return esc((t.match(/[A-Za-zÀ-ÿ0-9]/g)||['?']).slice(0,2).join('').toUpperCase())};
 const pod=(p,i)=>p?`<div class="lb-pod p${i+1} ${p.me?'me':''}" ${who(p)?`role="button" tabindex="0" onclick="${who(p)}"`:''}>
   <span class="lb-medal">${i+1}</span><span class="lb-av">${ini(p)}</span><b class="lb-pn">${p.n}</b><span class="lb-pr">${RANKS[rankIdx(p.xp)][0]}</span><span class="lb-pv">${val(p)}</span><i class="lb-step"></i></div>`:'';
 const RC=['#9aa3ad','#d9a066','#ffad6b','#ff7a1a','#ff5c6c','#ff3d52','#b8a1ff','#7c5cff','#5ad1ff','#3fe395','#f2c230','#ffd84d'];
 return `<h1>Ranglijst</h1><p class="sub">Echte spelers staan hier tussen de rivalen uit de onderwereld. Je rivalen worden ook sterker terwijl jij speelt. Klik op een naam om het profiel te bekijken.</p>
 <div class="tabs"><button class="${key==='xp'?'on':''}" onclick="rankTab='xp';render()">Op rang</button><button class="${key==='cash'?'on':''}" onclick="rankTab='cash';render()">Op vermogen</button></div>
 <section class="lb-podium">${pod(top[1],1)}${pod(top[0],0)}${pod(top[2],2)}</section>
 ${meIdx>=3?`<div class="lb-mine">Jij staat op plek <b>#${meIdx+1}</b>${meIdx>0?` · nog ${key==='xp'?Math.ceil(list[meIdx-1].xp-list[meIdx].xp).toLocaleString('nl-NL')+' XP':fmt(list[meIdx-1].cash-list[meIdx].cash)} tot #${meIdx}`:''}</div>`:''}
 <div class="card lb-card"><table class="lb lb2"><thead><tr><th>#</th><th>Naam</th><th>Rang</th><th style="text-align:right">${key==='xp'?'XP':'Vermogen'}</th></tr></thead><tbody>
 ${rest.map((p,j)=>{const i=j+3,ri=rankIdx(p.xp);return `<tr class="${p.me?'me':''}"><td class="pos">${i+1}</td><td>${who(p)?`<button class="lb-name" onclick="${who(p)}">${p.n}</button>`:p.n}${p.u&&!p.pub?'<span class="lb-priv" title="Privé profiel">privé</span>':''}</td><td><span class="lb-rk" style="--rc:${RC[ri]}">${RANKS[ri][0]}</span></td><td class="num">${key==='xp'?Math.floor(p.xp).toLocaleString('nl-NL'):fmt(p.cash)}</td></tr>`}).join('')}
 </tbody></table></div>`};
function loadLeaderboard(){window.__LB_LOADING__=true;
 fetch('/api/leaderboard').then(r=>r.json()).then(j=>{window.__LB__=j.players||[];window.__LB_AT__=Date.now()}).catch(()=>{window.__LB__=[];window.__LB_AT__=Date.now()})
 .finally(()=>{window.__LB_LOADING__=false;if(page==='rank')render()})}
