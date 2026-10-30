// Tab: Dashboard
V.dash=()=>{
  const ri=rankIdx(S.xp),cur=RANKS[ri][1],nxt=RANKS[ri+1];
  const pct=nxt?((S.xp-cur)/(nxt[1]-cur))*100:100;
  const carsV=S.cars.reduce((a,c)=>a+c.v,0),net=S.cash+bankNet()+carsV;
  const all=[...S.npcs.map(n=>n.xp),S.xp].sort((a,b)=>b-a);const pos=all.indexOf(S.xp)+1;
  const h=new Date().getHours(),greet=h<6?'Goedenacht':h<12?'Goedemorgen':h<18?'Goedemiddag':'Goedenavond';
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const recs=CRIMES.filter(c=>c.r<=ri).map(c=>({c,ev:chance(c)/100*(c.min+c.max)/2/c.en})).sort((a,b)=>b.ev-a.ev).slice(0,3);
  const nextC=CRIMES.find(c=>c.r>ri);
  const meter=(label,val,max,col,sub)=>`<div class="card kpi"><div class="label">${label}</div><div class="big" style="color:${col}">${val}</div>
    <div class="bar"><i style="width:${Math.max(0,Math.min(100,max))}%;background:${col}"></i></div><div class="kpi-sub">${sub}</div></div>`;
  return `
  ${S.wanted?`<div class="card alert"><b>▲ Je staat op de gezochtlijst</b><span>${S.wanted.lv&&typeof WANT_LV!=='undefined'?`${WANT_LV[S.wanted.lv].n} na de huurmoord op ${esc(S.wanted.t||'je doelwit')}, nog ${fmtClock(S.wanted.until-now())}. Bij elke actie kan de politie een controle doen. <a href="#verblijf">Onderduiken</a> laat het drie keer zo snel zakken.`:'Je bent ontsnapt. Bij elke actie kan de politie een controle doen en je herkennen. Je straf wordt dan langer.'}</span></div>`:''}
  <div class="dash">
   <section class="card hud d-hero">
    <div class="label">${greet}, ${esc(S.name)}</div>
    <h1 class="d-rank">${RANKS[ri][0]} ${rankStars(S.xp)}</h1>
    <div class="d-lvl">${rankLvlInfo()}</div>
    <div class="d-prog"><div class="bar"><i style="width:${pct}%;background:var(--acc)"></i></div>
     <span>${nxt?`${Math.floor(S.xp).toLocaleString('nl-NL')} / ${nxt[1].toLocaleString('nl-NL')} XP · nog ${Math.ceil(nxt[1]-S.xp).toLocaleString('nl-NL')} tot <b>${nxt[0]}</b>`:'Je bent de Peetvader. Hoger kan niet.'}</span></div>
    <div class="d-actions">
     <a class="btn" href="#crimes">Naar misdaden</a><a class="btn ghost" href="#casino">Casino</a><a class="btn ghost" href="#fam">Families</a>
    </div>
    ${nextC?`<div class="d-next">Volgende rang opent: <b>${nextC.n}</b></div>`:''}
   </section>
   <section class="card d-money">
    <div class="label">Totaal vermogen</div><div class="d-big" style="--n:${fmt(net).length}">${fmt(net)}</div>
    <div class="row"><span>Wit geld <small>op zak</small></span><b style="color:var(--wit)">${fmt(wit())}</b></div>
    <div class="row"><span>Zwart geld ${zwart()>=1?'<a href="#wit" style="color:var(--acc);font-size:12px">witwassen ›</a>':''}</span><b style="color:${zwart()>=1?'var(--zw)':'var(--faint)'}">${fmt(zwart())}</b></div>
    <div class="row"><span>Bank</span><b>${fmt(bankNet())}</b></div>
    <div class="row"><span>Auto's (${S.cars.length})</span><b>${fmt(carsV)}</b></div>
    <div class="row"><span>Bedrijven</span><b style="color:var(--green)">${fmt(income())}/dag</b></div>
    <div class="row"><span>In de kas · uitbetaling ${new Date(nextPayout()).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</span><b>${fmt(S.kas||0)}</b></div>
   </section>
   ${meter('Energie',Math.floor(S.energy)+'/'+EN_MAX,S.energy/EN_MAX*100,'var(--ice)',full?`<a class="btn ghost sm" href="#ontspannen">Vol over ${full} min · ontspannen</a>`:'Helemaal vol')}
   ${meter('Gezondheid',S.hp+'%',S.hp,S.hp>50?'var(--green)':'var(--red)',`<button class="btn ghost sm" onclick="act.heal()" ${S.hp>=100?'disabled':''}>Kliniek · ${fmt(healCost())}</button>`)}
   ${meter('Politie-hitte',S.heat+'%',S.heat,S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--mute)',`<button class="btn ghost sm" onclick="act.bribe()" ${S.heat<=0?'disabled':''}>Omkopen · ${fmt(bribeCost())}</button>`)}
   <a class="card kpi" href="#rank" style="text-decoration:none;color:inherit"><div class="label">Ranglijst</div><div class="big">#${pos}<span style="font-size:15px;color:var(--faint)"> / ${all.length}</span></div>
    <div class="bar"><i style="width:${(1-(pos-1)/all.length)*100}%;background:var(--violet)"></i></div><div class="kpi-sub">Bekijk de ranglijst →</div></a>
   <section class="card d-todo"><h3>Klaar voor je</h3>${(()=>{const td=todoItems();return td.length?`<div class="todos">${todoHtml(td)}</div>`:'<p class="sub" style="margin:4px 0 0">Alles is gedaan. Wacht tot je energie weer vol is of kijk in het casino.</p>'})()}</section>
   <section class="card d-recs"><h3>Aanbevolen klussen</h3><p class="sub" style="margin:0 0 6px">Beste opbrengst per energiepunt voor jouw rang.</p>
    ${recs.map(({c})=>{const left=cdLeft(c.id),ok=!inJail()&&!left&&S.energy>=c.en;return `<div class="d-rec"><div><b>${c.n}</b><span>${fmt(c.min*lootMult())}–${fmt(c.max*lootMult())} · ${chance(c)}% kans · ${c.en} energie</span></div>
     <button class="btn sm" onclick="act.crime('${c.id}')" ${ok?'':'disabled'}>${inJail()?'Vast':left?Math.ceil(left/1000)+'s':S.energy<c.en?'Te moe':'Doen'}</button></div>`}).join('')}
   </section>
   <section class="card d-stats"><h3>Statistieken</h3>
     <div class="row"><span>Familie</span><b style="color:${S.family?fam().col:'var(--mute)'}">${S.family?fam().n:'Geen'}</b></div>
     <div class="row"><span>Straatcredit</span><b style="color:var(--violet)">${S.cred}</b></div>
     <div class="row"><span>Geslaagde klussen</span><b>${S.stats.crimes}</b></div>
     <div class="row"><span>Mislukt / gepakt</span><b>${S.stats.fails}</b></div>
     <div class="row"><span>Auto's gestolen</span><b>${S.stats.cars}</b></div>
     <div class="row"><span>Casino +/−</span><b style="color:${S.stats.won-S.stats.lost>=0?'var(--green)':'var(--red)'}">${S.stats.won-S.stats.lost>=0?'+':'−'}${fmt(Math.abs(S.stats.won-S.stats.lost))}</b></div>
   </section>
   <section class="card d-log"><h3>Laatste gebeurtenissen</h3><div class="log">${logShown().length?logShown().map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd. Begin met een klus hierboven.</div>'}</div></section>
  </div>`;
};
const healCost=()=>(100-S.hp)*15;
const bribeCost=()=>S.heat*(40+rankIdx(S.xp)*30);
