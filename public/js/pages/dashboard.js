// Tab: Dashboard
V.dash=()=>{
  const ri=rankIdx(S.xp),cur=RANKS[ri][1],nxt=RANKS[ri+1];
  const pct=nxt?((S.xp-cur)/(nxt[1]-cur))*100:100;
  const all=[...S.npcs.map(n=>n.xp),S.xp].sort((a,b)=>b-a);const pos=all.indexOf(S.xp)+1;
  const net=S.cash+S.bank+S.cars.reduce((a,c)=>a+c.v,0);
  return `<h1>Welkom terug, baas</h1><p class="sub">Je imperium in één oogopslag. Elke actie hieronder brengt je dichter bij de top.</p>
  ${S.wanted?`<div class="card" style="border-color:#ff8a3d;margin-bottom:14px"><h3 style="color:#ff8a3d">⚠ Je staat op de gezochtlijst</h3><div style="color:var(--mute)">Je bent ontsnapt. Bij elke actie, waar je ook bent, kan de politie een controle doen en je herkennen. Je straf wordt dan langer.</div></div>`:''}
  <div class="grid">
   <div class="card hud"><div class="label">Rang ${ri+1} / ${RANKS.length}</div><div class="big" style="color:var(--cyan);font-family:var(--f-display)">${RANKS[ri][0]}</div>
     <div class="bar"><i style="width:${pct}%;background:var(--acc)"></i></div>
     <div class="label" style="margin-top:8px">${nxt?S.xp.toLocaleString('nl-NL')+' / '+nxt[1].toLocaleString('nl-NL')+' XP naar '+nxt[0]:'Hoogste rang bereikt'}</div></div>
   <div class="card"><div class="label">Totaal vermogen</div><div class="big" style="color:var(--gold)">${fmt(net)}</div><div class="label" style="margin-top:8px">Contant + bank + auto's</div></div>
   <div class="card"><div class="label">Passief inkomen</div><div class="big" style="color:var(--green)">${fmt(income())}<span style="font-size:14px;color:var(--mute)"> /min</span></div><div class="label" style="margin-top:8px">${Object.values(S.biz).reduce((a,b)=>a+b,0)} bedrijven in bezit</div></div>
   <a class="card" href="#rank" style="text-decoration:none;color:inherit"><div class="label">Positie ranglijst</div><div class="big">#${pos}<span style="font-size:14px;color:var(--mute)"> van ${all.length}</span></div><div class="label" style="margin-top:8px">Bekijk ranglijst →</div></a>
  </div>
  <div class="grid2" style="margin-top:14px">
   <div class="card"><h3>Conditie</h3>
     <div class="label">Energie · ${Math.floor(S.energy)}/${EN_MAX}</div><div class="bar" style="margin-bottom:12px"><i style="width:${S.energy/EN_MAX*100}%;background:var(--ice)"></i></div>
     <div class="label">Gezondheid</div><div class="bar"><i style="width:${S.hp}%;background:var(--green)"></i></div>
     <div class="label" style="margin-top:12px">Politie-hitte (verlaagt slaagkans)</div><div class="bar"><i style="width:${S.heat}%;background:var(--red)"></i></div>
     <div class="flex" style="margin-top:14px"><button class="btn sm" onclick="act.heal()" ${S.hp>=100?'disabled':''}>Dokter · ${fmt(healCost())}</button><button class="btn sm gold" onclick="act.bribe()" ${S.heat<=0?'disabled':''}>Agent omkopen · ${fmt(bribeCost())}</button></div></div>
   <div class="card"><h3>Statistieken</h3>
     <div class="row"><span>Familie</span><b style="color:${S.family?fam().col:'var(--mute)'}">${S.family?fam().n:'Geen'}</b></div>
     <div class="row"><span>Straatcredit</span><b style="color:var(--violet)">${S.cred}</b></div>
     <div class="row"><span>Geslaagde misdaden</span><b>${S.stats.crimes}</b></div>
     <div class="row"><span>Politiecontroles gepakt</span><b>${S.stats.raids||0}</b></div>
     <div class="row"><span>Mislukt / gepakt</span><b>${S.stats.fails}</b></div>
     <div class="row"><span>Auto's gestolen</span><b>${S.stats.cars}</b></div>
     <div class="row"><span>Casino gewonnen</span><b style="color:var(--green)">${fmt(S.stats.won)}</b></div>
     <div class="row"><span>Casino verloren</span><b style="color:var(--red)">${fmt(S.stats.lost)}</b></div></div>
  </div>
  <div class="card" style="margin-top:14px"><h3>Laatste gebeurtenissen</h3><div class="log">${S.log.length?S.log.map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd. Ga naar Misdaden om te beginnen.</div>'}</div></div>`;
};
const healCost=()=>(100-S.hp)*15;
const bribeCost=()=>S.heat*(40+rankIdx(S.xp)*30);
