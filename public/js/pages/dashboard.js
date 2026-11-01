// Tab: Dashboard
// Beginnersdossier: maximaal vijf stappen voor nieuwe spelers (tot en met de tweede rang), op basis van wat je echt al
// gedaan hebt. Geen beloningen (dus niets dubbel bij herladen); wegklikken kan, terugvinden via de knop op het dashboard.
// S.guide = {off, en, wz, mode}: off = verborgen, en/wz = uitleg over energie en wit/zwart geld gelezen, mode = aanrader op geld/xp/risico.
const gidsS=()=>S.guide||(S.guide={});
function gidsPick(mode){const ri=rankIdx(S.xp),av=CRIMES.filter(c=>c.r<=ri);if(!av.length)return null;
 const sc=c=>mode==='geld'?chance(c)/100*(c.min+c.max)/2/crEn(c):mode==='xp'?chance(c)/100*(c.xp||1)/crEn(c):chance(c)-crEn(c)*.01;
 return av.slice().sort((a,b)=>sc(b)-sc(a))[0]}
function gidsSteps(){const G=gidsS(),ri=rankIdx(S.xp),nxt=RANKS[ri+1],sk=Object.values(S.skills||{}).some(v=>v>0);
 return [{k:'klus',done:(S.stats&&S.stats.crimes||0)>=1,t:'Doe je eerste klus',href:'#crimes'},
  {k:'en',done:!!G.en,t:'Snap je energie',ok:1},
  {k:'train',done:sk,t:'Train één keer',href:'#skills'},
  {k:'wz',done:!!G.wz,t:'Wit en zwart geld',ok:1,href:'#wit'},
  {k:'rang',done:ri>=1,t:nxt?'Haal '+RANKS[1][0]:'Volgende rang',href:'#crimes'}]}
function gidsHtml(){const G=gidsS(),ri=rankIdx(S.xp),st=gidsSteps(),n=st.filter(x=>x.done).length;
 if(ri>3)return '';
 if(G.off||n>=st.length)return '';
 if(ri>1&&!G.forced)return '';
 const mode=G.mode||'risico',c=gidsPick(mode),cur=st.find(x=>!x.done);
 const body={klus:c?`<p>Elke klus kost energie en kan mislukken: dan kun je de cel in. Begin met iets dat bij je past.</p>
   <div class="gd-modes" role="group" aria-label="Aanrader op">${[['risico','Laag risico'],['geld','Meeste geld'],['xp','Meeste XP']].map(([m,l])=>`<button class="${mode===m?'on':''}" aria-pressed="${mode===m}" onclick="gidsMode('${m}')">${l}</button>`).join('')}</div>
   <div class="gd-pick"><b>${c.n}</b><span>${chance(c)}% kans · ${crEn(c)} energie · ${fmt(c.min*lootMult())}–${fmt(c.max*lootMult())}</span><em>${mode==='geld'?'Levert per energiepunt het meeste geld op.':mode==='xp'?'Levert per energiepunt de meeste ervaring op.':'De hoogste kans van wat je nu kunt doen.'} Mislukt hij, dan kun je opgepakt worden.</em></div>`:'',
  en:`<p>Klussen kosten energie. Die komt vanzelf terug (1 punt per ${EN_REGEN_S} seconden, ook als je in het casino zit of vastzit). Thuis rusten gaat veel sneller.</p>`,
  train:`<p>Een training maakt je blijvend beter, bijvoorbeeld meer kans bij klussen of sneller wegrennen. Daarna wacht je even tot de volgende sessie.</p>`,
  wz:`<p>Klussen leveren <b class="z">zwart</b> geld op. De bank en je zaken nemen alleen <b class="w">wit</b> geld: was het eerst wit. Word je gepakt met meer dan ${fmt(typeof seizeKeep==='function'?seizeKeep():10000)} zwart op zak, dan neemt de politie de rest mee.</p>`,
  rang:(()=>{const nx=RANKS[ri+1];if(!nx)return '';const p=Math.max(0,Math.min(100,(S.xp-RANKS[ri][1])/(nx[1]-RANKS[ri][1])*100));return `<p>Met ervaring (XP) uit klussen klim je in rang. Een nieuwe rang opent nieuwe klussen en meer buit.</p><div class="bar"><i style="width:${p}%;background:var(--acc)"></i></div><small>${Math.floor(S.xp).toLocaleString('nl-NL')} / ${nx[1].toLocaleString('nl-NL')} XP voor ${nx[0]}</small>`})()};
 return `<section class="card gids" aria-label="Beginnersdossier">
  <div class="gd-h"><div><span class="label">Beginnersdossier</span><b>${n} van ${st.length} gedaan</b></div><button class="gd-x" onclick="gidsOff()" aria-label="Beginnersdossier verbergen">Verbergen</button></div>
  <ol class="gd-steps">${st.map((x,i)=>`<li class="${x.done?'done':''} ${cur&&cur.k===x.k?'cur':''}"><i aria-hidden="true">${x.done?'✓':i+1}</i><span>${x.t}${x.done?'<span class="sr"> (gedaan)</span>':''}</span></li>`).join('')}</ol>
  ${cur?`<div class="gd-now"><h3>${cur.t}</h3>${body[cur.k]||''}<div class="gd-act">${cur.ok?`<button class="btn sm" onclick="gidsOk('${cur.k}')">Begrepen</button>`:''}${cur.href?`<a class="btn sm ${cur.ok?'ghost':''}" href="${cur.href}">${cur.k==='klus'?'Naar de klussen':cur.k==='train'?'Naar training':cur.k==='wz'?'Naar witwassen':'Verder klussen'} ›</a>`:''}</div></div>`:''}
 </section>`}
// terugvinden als je hem verborgen hebt (zolang je nog in de eerste rangen zit)
const gidsBack=()=>{const G=gidsS();return (rankIdx(S.xp)<=3&&G.off&&gidsSteps().some(x=>!x.done)?`<button class="gd-back" onclick="gidsOn()">Beginnersdossier tonen</button>`:'')+(rankIdx(S.xp)<=4?`<button class="gd-back" onclick="tourStart(true)">Rondleiding door het spel</button>`:'')};
function gidsOk(k){gidsS()[k]=1;save();render()}
function gidsOff(){gidsS().off=1;save();render();toast('Verborgen. Terughalen kan onderaan het dashboard.')}
function gidsOn(){const G=gidsS();G.off=0;G.forced=1;save();render();window.scrollTo(0,0)}
function gidsMode(m){gidsS().mode=m;save();render()}
V.dash=()=>{
  const ri=rankIdx(S.xp),cur=RANKS[ri][1],nxt=RANKS[ri+1];
  const pct=nxt?((S.xp-cur)/(nxt[1]-cur))*100:100;
  const carsV=S.cars.reduce((a,c)=>a+c.v,0),net=S.cash+bankNet()+carsV;
  const all=[...S.npcs.map(n=>n.xp),S.xp].sort((a,b)=>b-a);const pos=all.indexOf(S.xp)+1;
  const h=new Date().getHours(),greet=h<6?'Goedenacht':h<12?'Goedemorgen':h<18?'Goedemiddag':'Goedenavond';
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const recs=CRIMES.filter(c=>c.r<=ri).map(c=>({c,ev:chance(c)/100*(c.min+c.max)/2/crEn(c)})).sort((a,b)=>b.ev-a.ev).slice(0,3);
  const nextC=CRIMES.find(c=>c.r>ri);
  const meter=(label,val,max,col,sub)=>`<div class="card kpi"><div class="label">${label}</div><div class="big" style="color:${col}">${val}</div>
    <div class="bar"><i style="width:${Math.max(0,Math.min(100,max))}%;background:${col}"></i></div><div class="kpi-sub">${sub}</div></div>`;
  return `
  ${S.wanted?`<div class="card alert"><b>▲ Je staat op de gezochtlijst</b><span>${S.wanted.lv&&typeof WANT_LV!=='undefined'?`${WANT_LV[S.wanted.lv].n} na de huurmoord op ${esc(S.wanted.t||'je doelwit')}, nog ${fmtClock(S.wanted.until-now())}. Bij elke actie kan de politie een controle doen. <a href="#verblijf">Onderduiken</a> laat het drie keer zo snel zakken.`:'Je bent ontsnapt. Bij elke actie kan de politie een controle doen en je herkennen. Je straf wordt dan langer.'}</span></div>`:''}
  ${gidsHtml()}
  <div class="dash">
   <section class="card hud d-hero">
    <div class="label">${greet}, ${esc(S.name)}</div>
    <h1 class="d-rank"><span data-fit="28">${RANKS[ri][0]}</span> ${rankStars(S.xp)}</h1>
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
    <div class="row"><span>Bedrijven</span><b style="color:var(--green)">${fmt(income())}/speldag</b></div>
    <div class="row"><span>In de kas · uitbetaling ${new Date(nextPayout()).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</span><b>${fmt(S.kas||0)}</b></div>
   </section>
   ${meter('Energie',Math.floor(S.energy)+'/'+EN_MAX,S.energy/EN_MAX*100,'var(--ice)',full?`<a class="btn ghost sm" href="#ontspannen">Vol over ${full} min · ontspannen</a>`:'Helemaal vol')}
   ${meter('Gezondheid',S.hp+'%',S.hp,S.hp>50?'var(--green)':'var(--red)',`<button class="btn ghost sm" onclick="act.heal()" ${S.hp>=100?'disabled':''}>Kliniek · ${fmt(healCost())}</button>`)}
   ${meter('Politie-hitte',S.heat+'%',S.heat,S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--mute)',`<button class="btn ghost sm" onclick="act.bribe()" ${S.heat<=0?'disabled':''}>Omkopen · ${fmt(bribeCost())}</button>`)}
   <a class="card kpi" href="#rank" style="text-decoration:none;color:inherit"><div class="label">Ranglijst</div><div class="big">#${pos}<span style="font-size:15px;color:var(--faint)"> / ${all.length}</span></div>
    <div class="bar"><i style="width:${(1-(pos-1)/all.length)*100}%;background:var(--violet)"></i></div><div class="kpi-sub">Bekijk de ranglijst →</div></a>
   <section class="card d-todo"><h3>Klaar voor je</h3>${(()=>{const td=todoItems();return td.length?`<div class="todos">${todoHtml(td)}</div>`:'<p class="sub" style="margin:4px 0 0">Alles is gedaan. Wacht tot je energie weer vol is of kijk in het casino.</p>'})()}</section>
   <section class="card d-recs"><h3>Aanbevolen klussen</h3><p class="sub" style="margin:0 0 6px">Beste opbrengst per energiepunt voor jouw rang.</p>
    ${recs.map(({c})=>{const left=cdLeft(c.id),ok=!inJail()&&!left&&S.energy>=crEn(c);return `<div class="d-rec"><div><b>${c.n}</b><span>${fmt(c.min*lootMult())}–${fmt(c.max*lootMult())} · ${chance(c)}% kans · ${crEn(c)} energie</span></div>
     <button class="btn sm" onclick="act.crime('${c.id}')" ${ok?'':'disabled'}>${inJail()?'Vast':left?Math.ceil(left/1000)+'s':S.energy<crEn(c)?'Te moe':'Doen'}</button></div>`}).join('')}
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
  </div>${gidsBack()}`;
};
const healCost=()=>(100-S.hp)*15;
const bribeCost=()=>S.heat*(40+rankIdx(S.xp)*30);
