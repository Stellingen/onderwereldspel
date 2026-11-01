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
 if(ri>RK[3])return '';
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
const gidsBack=()=>{const G=gidsS();return (rankIdx(S.xp)<=RK[3]&&G.off&&gidsSteps().some(x=>!x.done)?`<button class="gd-back" onclick="gidsOn()">Beginnersdossier tonen</button>`:'')+(rankIdx(S.xp)<=RK[4]?`<button class="gd-back" onclick="tourStart(true)">Rondleiding door het spel</button>`:'')};
function gidsOk(k){gidsS()[k]=1;save();render()}
function gidsOff(){gidsS().off=1;save();render();toast('Verborgen. Terughalen kan onderaan het dashboard.')}
function gidsOn(){const G=gidsS();G.off=0;G.forced=1;save();render();window.scrollTo(0,0)}
function gidsMode(m){gidsS().mode=m;save();render()}
// Wat een rang opent: klussen, trainingen, woningen, spullen, casino, huurmoorden en de rangbeloning
function rankUnlocks(ri){const U=[],add=(ic,t,s)=>U.push({ic,t,s});if(!RANKS[ri])return U;
 const cr=CRIMES.filter(c=>c.r===ri);if(cr.length)add('crimes',cr.length===1?cr[0].n:cr.length+' nieuwe klussen',cr.length>1?cr.slice(0,3).map(c=>c.n).join(', ')+(cr.length>3?'…':''):'nieuwe klus');
 TRAININGS.filter(t=>(t.r||0)===ri&&ri>0).forEach(t=>add('skills',t.n,'nieuwe training · '+t.place));
 (typeof HOUSES!=='undefined'?HOUSES:[]).filter(h=>h.r===ri&&ri>0).forEach(h=>add('verblijf',h.n,'woning · '+h.place+' · '+fmt(h.p)));
 (typeof GEAR!=='undefined'?GEAR:[]).filter(g=>g.r===ri&&ri>0).slice(0,3).forEach(g=>add('shop',g.n,'te koop'));
 if(typeof CAS_MIN_R!=='undefined'&&ri===CAS_MIN_R)add('casino','Casino open','tafels, Mines, Hoogvlieger, Dubbel of niks');
 if(typeof CAS_SLOT_R!=='undefined'&&ri===CAS_SLOT_R)add('casino','Slots open','Kluiskraker, Visdief, Suikerbaron');
 if(typeof JACK_R!=='undefined'&&ri===JACK_R)add('cars','Carjacken','auto\'s van de weg plukken');
 if(typeof SLOOP_R!=='undefined'&&ri===SLOOP_R)add('cars','Sloperij','auto\'s slopen voor onderdelen');
 if(typeof HIT_TIERS!=='undefined')HIT_TIERS.filter(h=>h.r===ri).forEach(h=>add('hits','Huurmoorden: '+h.n,'nieuwe contracten'));
 const rw=typeof RANK_CODES!=='undefined'&&RANK_CODES[RANKS[ri][0].toLowerCase()];if(rw)add('profiel','Rangbeloning '+fmt(rw),'claimen op je profiel');
 return U}
const dUnl=u=>`<li><i>${svg(u.ic)}</i><div><b>${u.t}</b><span>${u.s}</span></div></li>`;
V.dash=()=>{
  const ri=rankIdx(S.xp),cur=RANKS[ri][1],nxt=RANKS[ri+1],lv=rankLevel(S.xp);
  const pct=nxt?Math.max(0,Math.min(100,((S.xp-cur)/(nxt[1]-cur))*100)):100;
  const carsV=S.cars.reduce((a,c)=>a+c.v,0),net=S.cash+bankNet()+carsV;
  const lb=lbAll(),pos=lb.findIndex(x=>x.me)+1;
  const h=new Date().getHours(),greet=h<6?'Goedenacht':h<12?'Goedemorgen':h<18?'Goedemiddag':'Goedenavond';
  const full=Math.max(0,Math.ceil((EN_MAX-S.energy)*EN_REGEN_S/60));
  const recs=CRIMES.filter(c=>c.r<=ri).map(c=>({c,ev:chance(c)/100*(c.min+c.max)/2/crEn(c)})).sort((a,b)=>b.ev-a.ev).slice(0,3);
  const unl=nxt?rankUnlocks(ri+1):[],later=RANKS.slice(ri+2,ri+4).map((r,k)=>({r,u:rankUnlocks(ri+2+k)}));
  const F=S.family?fam():null,st=S.stats||{},tries=(st.crimes||0)+(st.fails||0),succ=tries?Math.round(st.crimes/tries*100):0,cz=(st.won||0)-(st.lost||0);
  const hc=S.heat>60?'var(--red)':S.heat>30?'var(--acc)':'var(--green)',pc=S.hp>50?'var(--green)':S.hp>25?'var(--acc)':'var(--red)';
  const bl=buffLoot(),fp=focusPct(),lk=typeof luckPct==='function'?luckPct():0;
  const vit=(cls,label,val,max,col,sub,act)=>`<section class="card dv ${cls}"><div class="label">${label}</div><b style="color:${col}">${val}</b><div class="bar"><i style="width:${Math.max(0,Math.min(100,max))}%;background:${col}"></i></div><small>${sub}</small>${act||''}</section>`;
  const td=todoItems();
  const segs=Array.from({length:RANK_SUB},(_,k)=>`<i class="${k<lv-1?'done':k===lv-1?'now':''}"></i>`).join('');
  return `
  ${S.wanted?`<div class="card alert"><b>▲ Je staat op de gezochtlijst</b><span>${S.wanted.lv&&typeof WANT_LV!=='undefined'?`${WANT_LV[S.wanted.lv].n} na de huurmoord op ${esc(S.wanted.t||'je doelwit')}, nog ${fmtClock(S.wanted.until-now())}. Bij elke actie kan de politie een controle doen. <a href="#verblijf">Onderduiken</a> laat het drie keer zo snel zakken.`:'Je bent ontsnapt. Bij elke actie kan de politie een controle doen en je herkennen. Je straf wordt dan langer.'}</span></div>`:''}
  ${gidsHtml()}
  <div class="dash dash2">
   <section class="card hud d-hero dh2">
    <div class="dh-top"><div class="label">${greet}</div><a class="dh-name" href="#profiel" style="font-size:${nameFs(S.name,26,16)}px">${esc(S.name)}${vipTag()}</a>${statusTag()}</div>
    <h1 class="d-rank"><span data-fit="28">${RANKS[ri][0]}</span></h1>
    <div class="dh-lv">${rankStars(S.xp)}<span>${rankLvlInfo()}</span></div>
    <div class="dh-xp"><div class="dh-xp-h"><b>${Math.floor(S.xp).toLocaleString('nl-NL')} XP</b><span>${nxt?`nog <b>${Math.ceil(nxt[1]-S.xp).toLocaleString('nl-NL')}</b> tot ${nxt[0]}`:'Hoogste rang'}</span></div>
     <div class="dh-bar"><i style="width:${pct.toFixed(1)}%"></i><em style="left:${pct.toFixed(1)}%">${Math.floor(pct)}%</em></div>
     <div class="dh-segs" title="Levels in deze rang">${segs}</div></div>
    <div class="d-actions"><a class="btn" href="#crimes">Naar misdaden</a><a class="btn ghost" href="#casino">Casino</a><a class="btn ghost" href="#fam">Families</a></div>
   </section>
   <section class="card d-unl">
    <div class="du-h"><span class="label">Volgende rang</span>${nxt?`<b>${nxt[0]}</b><em>${Math.floor(pct)}% · nog ${Math.ceil(nxt[1]-S.xp).toLocaleString('nl-NL')} XP</em>`:'<b>Peetvader</b><em>Alles is open</em>'}</div>
    ${nxt?(unl.length?`<ul class="du-l">${unl.map(dUnl).join('')}</ul>`:'<p class="sub">Meer buit per klus.</p>'):'<p class="sub">Je hebt de hoogste rang. Levels geven nog meer buit.</p>'}
    ${later.filter(x=>x.u.length).length?`<div class="du-later"><span class="label">Daarna</span>${later.filter(x=>x.u.length).map(x=>`<div><b>${x.r[0]}</b><span>${x.u.slice(0,3).map(u=>u.t).join(' · ')}</span></div>`).join('')}</div>`:''}
   </section>
   <section class="card d-money dm2">
    <div class="label">Totaal vermogen</div><div class="d-big" style="--n:${fmt(net).length}">${fmt(net)}</div>
    <div class="dm2-rows dos-money">${moneyRows(window.slotPending||0)}</div>
    <div class="row"><span>Auto's (${S.cars.length})</span><b>${fmt(carsV)}</b></div>
    <div class="row"><span>Bedrijven</span><b style="color:var(--green)">${fmt(income())}/speldag</b></div>
    <div class="row"><span>In de kas · uitbetaling ${new Date(nextPayout()).toLocaleTimeString('nl-NL',{hour:'2-digit',minute:'2-digit'})}</span><b>${fmt(S.kas||0)}</b></div>
   </section>
   <div class="d-vits">
    ${vit('en','Energie',Math.floor(S.energy)+'<small>/'+EN_MAX+'</small>',S.energy/EN_MAX*100,'var(--ice)',full?'vol over '+full+' min':'helemaal vol',full?'<a class="btn ghost sm" href="#relax">Ontspannen</a>':'<a class="btn ghost sm" href="#crimes">Doe een klus</a>')}
    ${vit('hp','Gezondheid',S.hp+'%',S.hp,pc,S.hp>=100?'fit':S.hp>50?'gaat wel':'oppassen',`<button class="btn ghost sm" onclick="act.heal()" ${S.hp>=100?'disabled':''}>Kliniek · ${fmt(healCost())}</button>`)}
    ${vit('heat','Politie-hitte',S.heat+'%',S.heat,S.heat>30?hc:'var(--mute)',S.heat>60?'politie let op':S.heat>30?'lauw':'koel',`<button class="btn ghost sm" onclick="act.bribe()" ${S.heat<=0?'disabled':''}>Omkopen · ${fmt(bribeCost())}</button>`)}
    <a class="card dv fam" href="#fam"><div class="label">Familie</div><b style="color:${F?F.col:'var(--faint)'}">${F?esc(F.n):'Geen'}</b><small>${F?'naar je familie':'sluit je aan'}</small><span class="btn ghost sm">${F?'Bekijken':'Families'} ›</span></a>
   </div>
   <div class="d-buffs"><span>Straatcredit <b style="color:var(--violet)">${S.cred}</b></span>${bl?`<span>Buit <b style="color:var(--green)">+${bl}%</b> ${fmtClock(S.buffs.loot.until-now())}</span>`:''}${fp?`<span>Focus <b style="color:#ff6b7c">+${fp}%</b>${buffFocus()?' '+fmtClock(S.buffs.focus.until-now()):''}</span>`:''}${lk?`<a href="#casino">Geluk <b style="color:#f2c230">+${Math.round(lk*100)}%</b> ${fmtClock(luckLeft())}</a>`:''}${typeof klemPct==='function'&&klemPct()?`<a href="#biz">Inkomen <b style="color:#5fe08f">${klemLab(klemPct()).replace('Inkomen ','')}</b> ${fmtClock(klemLeft())}</a>`:''}<span>Woning <b>${house().n}</b></span></div>
   <section class="card d-todo"><h3>Klaar voor je${td.length?` <small>${td.length}</small>`:''}</h3>${td.length?`<div class="todos">${todoHtml(td)}</div>`:'<p class="sub" style="margin:4px 0 0">Alles is gedaan. Wacht tot je energie weer vol is of kijk in het casino.</p>'}</section>
   <section class="card d-top"><h3>Ranglijst <small>#${pos} van ${lb.length}</small></h3>
    <ol class="rtop">${lb.slice(0,5).map((p,i)=>`<li class="${p.me?'me':''}"><span>${i+1}</span><b><button class="lb-name" onclick="${p.me?(window.__USER__?`pvShow('${window.__USER__}')`:''):p.u?`pvShow('${p.u}')`:`pvNpc(${p.npc})`}">${p.n}</button></b><em>${RANKS[rankIdx(p.xp)][0]}</em></li>`).join('')}${pos>5?`<li class="me gap"><span>${pos}</span><b>${lb[pos-1].n}</b><em>${RANKS[ri][0]}</em></li>`:''}</ol>
    <a class="btn ghost sm" href="#rank">Hele ranglijst ›</a></section>
   <section class="card d-recs"><h3>Aanbevolen klussen</h3><p class="sub" style="margin:0 0 6px">Beste opbrengst per energiepunt voor jouw rang.</p>
    ${recs.map(({c})=>{const left=cdLeft(c.id),ok=!inJail()&&!left&&S.energy>=crEn(c);return `<div class="d-rec"><div><b>${c.n}</b><span>${fmt(c.min*lootMult())}–${fmt(c.max*lootMult())} · ${chance(c)}% kans · ${crEn(c)} energie</span></div>
     <button class="btn sm" onclick="act.crime('${c.id}')" ${ok?'':'disabled'}>${inJail()?'Vast':left?Math.ceil(left/1000)+'s':S.energy<crEn(c)?'Te moe':'Doen'}</button></div>`}).join('')}
   </section>
   <section class="card d-stats ds2"><h3>Jouw cijfers</h3>
    <div class="ds-g">
     <div><b>${(st.crimes||0).toLocaleString('nl-NL')}</b><span>klussen gelukt</span></div>
     <div><b>${succ}%</b><span>slaagt</span></div>
     <div><b>${(st.fails||0).toLocaleString('nl-NL')}</b><span>mislukt of gepakt</span></div>
     <div><b>${(st.cars||0).toLocaleString('nl-NL')}</b><span>auto's gestolen</span></div>
     <div><b>${(st.hits||0).toLocaleString('nl-NL')}</b><span>huurmoorden</span></div>
     <div><b>${(st.escaped||0).toLocaleString('nl-NL')}</b><span>ontsnapt</span></div>
     <div><b style="color:${cz>=0?'var(--green)':'var(--red)'}">${cz>=0?'+':'−'}${fmt(Math.abs(cz))}</b><span>casino +/−</span></div>
     <div><b style="color:var(--violet)">${S.cred}</b><span>straatcredit</span></div>
    </div></section>
   <section class="card d-log"><h3>Laatste gebeurtenissen</h3><div class="log">${logShown().length?logShown().map(l=>`<div class="${l.c}">${l.m}</div>`).join(''):'<div class="info">Nog niks gebeurd. Begin met een klus hierboven.</div>'}</div></section>
  </div>${gidsBack()}`;
};
const healCost=()=>(100-S.hp)*15;
const bribeCost=()=>S.heat*(40+rankPow()*30);
