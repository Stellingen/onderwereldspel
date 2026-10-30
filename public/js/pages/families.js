// Tab: Families — klimmen binnen je familie, eigen voordeel per familie en 5 dagelijkse missies
// Eer verdien je met geslaagde klussen (je straatcredit telt ook als eer), gestolen auto's, auto's afleveren en missies.
// Elke dag 5 missies: haal er minimaal 3, anders verlies je 10% van je eer. Alle 5 = extra eer en straatcredit.
// Grotere families geven zwaardere missies, met een grote klus die bepaalde wapens en uitrusting vraagt.
// Boven Erelid: Onderbaas (genoeg eer + 3 gewonnen oorlogsslagen) en Baas (genoeg eer + de overname winnen, zie famwar.js).
// De stand in de stad, de bendeoorlog en het duel om de leiding staan in famwar.js. Klik op een familie voor het verhaal (lore.js).
const FM_DEF={
 crime:{t:m=>`Doe ${m.n} geslaagde klussen`,ev:'crime',eer:10,ic:'crimes'},
 heavy:{t:m=>`Doe ${m.n} geslaagde klussen van ${RANKS[m.r][0]} of hoger`,ev:'crime',ok:(m,e)=>e.r>=m.r,eer:14,ic:'crimes'},
 cash:{t:m=>`Verdien ${fmt(m.n)} met klussen`,ev:'crime',amt:e=>e.g,eer:12,ic:'bank',money:1},
 cars:{t:m=>`Steel ${m.n} auto${m.n>1?"'s":''}`,ev:'car',eer:14,ic:'cars'},
 deliver:{t:m=>`Lever ${m.n} auto${m.n>1?"'s":''} af bij de familie`,ev:'deliver',eer:16,ic:'cars'},
 dval:{t:m=>`Lever auto's af ter waarde van samen ${fmt(m.n)}`,ev:'deliver',amt:e=>e.v,eer:16,ic:'cars',money:1},
 train:{t:m=>`Train ${m.n} keer`,ev:'train',eer:10,ic:'skills'},
 heist:{t:()=>famHeist().n,ev:'heist',eer:40,ic:'fam'}};
const fmTarget=(k,T)=>({crime:6+2*T,heavy:3+T,cash:Math.round(8000*Math.pow(2.1,T)/1000)*1000,cars:3+T,deliver:1+T,dval:Math.round(4000*Math.pow(1.8,T)/1000)*1000,train:1+Math.floor(T/3),heist:1})[k];
const fmDay=()=>new Date().toLocaleDateString('sv-SE');
const fmLeft=()=>{const d=new Date();d.setHours(24,0,0,0);return d-new Date()};
const famHeist=()=>FAM_HEISTS[famTier()];
const FM_BONUS=T=>({eer:Math.round(60*(1+T*.5)),cred:5*(T+1)});
const famPromoPay=(a,T)=>Math.round(5000*Math.pow(2,T)*a);
// missiegeld groeit met je familielevel: Aspirant ×1, Erelid ×2
const fmPay=m=>Math.round(m.cash*(1+famRankIdx()*.2));
function fmNew(grace){const T=famTier(),pool=['crime','heavy','cash','cars','deliver','dval','train'],pick=[];
 while(pick.length<4){const k=pool[Math.floor(Math.random()*pool.length)];if(pick.includes(k)||(k==='deliver'&&pick.includes('dval'))||(k==='dval'&&pick.includes('deliver')))continue;pick.push(k)}
 S.fm={day:fmDay(),fam:S.family,grace:!!grace,bonus:false,
  list:[...pick,'heist'].map(k=>({k,n:fmTarget(k,T),r:k==='heavy'?famBase().r:undefined,p:0,done:false,eer:Math.round(FM_DEF[k].eer*(1+T*.5)),cash:k==='heist'?0:Math.round(1500*Math.pow(2,T))}))}}
// nieuwe dag: eerst de vorige dag afrekenen (minder dan 3 gehaald = 10% eer kwijt), dan 5 nieuwe missies
function famDaily(){if(!S.family)return;const today=fmDay();if(S.fm&&S.fm.fam===S.family&&S.fm.day===today)return;
 if(S.fm&&S.fm.fam===S.family&&!S.fm.grace){const d=S.fm.list.filter(m=>m.done).length;
  if(d<3){const lose=Math.ceil(famEer()*.1);if(lose>0)famAddEer(-lose);log(`Familie: gisteren maar ${d} van de 5 missies gehaald, −${lose} eer`,'bad');toast(`Je haalde gisteren maar ${d} van de 5 familiemissies: −${lose} eer`,'bad')}}
 fmNew(!S.fm||S.fm.fam!==S.family)}
function famAddEer(x){if(!S.family)return;if(!S.fr||S.fr.id!==S.family)S.fr={id:S.family,eer:0,since:now()};
 const b=famRankIdx(),L=famLead();S.fr.eer=Math.max(0,S.fr.eer+x);
 // leiding kwijt als je eer onder Erelid zakt (je moet het daarna opnieuw verdienen)
 if(L&&famRankEer()<FAM_TOP){S.fr.lead=0;const a=famRankIdx();toast(`Je eer zakte onder ${FAM_RANKS[FAM_TOP][0]}: je bent geen ${FAM_RANKS[FAM_TOP+L][0]} meer, nu ${FAM_RANKS[a][0]}`,'bad');log(`Familie: je plek als ${FAM_RANKS[FAM_TOP+L][0]} kwijt, nu ${FAM_RANKS[a][0]}`,'bad');return}
 const a=famRankIdx();
 if(a>b){const pay=famPromoPay(a,famTier());S.cash+=pay;addZwart(pay);toast(`Promotie in ${famBase().n}: je bent nu ${FAM_RANKS[a][0]}! +${fmt(pay)}`,'lvl');log(`Familie: gepromoveerd tot ${FAM_RANKS[a][0]} (+${fmt(pay)})`,'ok')}
 else if(a<b){toast(`Gedegradeerd tot ${FAM_RANKS[a][0]} in ${famBase().n}`,'bad');log(`Familie: gedegradeerd tot ${FAM_RANKS[a][0]}`,'bad')}}
// gebeurtenissen uit de rest van het spel
function famEv(ev,e){if(!S.family)return;e=e||{};famDaily();
 if(ev==='crime'&&e.cr)famAddEer(e.cr);if(ev==='car')famAddEer(1);
 S.fm.list.forEach(m=>{if(m.done)return;const D=FM_DEF[m.k];if(D.ev!==ev||(D.ok&&!D.ok(m,e)))return;m.p=Math.min(m.n,m.p+(D.amt?D.amt(e):1));
  if(m.p>=m.n){m.done=true;const pay=fmPay(m);famAddEer(m.eer);if(pay){S.cash+=pay;addZwart(pay)}toast(`Familiemissie gehaald: +${m.eer} eer${pay?' en '+fmt(pay):''}`,'lvl');log(`Familiemissie: ${D.t(m)} (+${m.eer} eer)`,'ok')}});
 if(!S.fm.bonus&&S.fm.list.every(m=>m.done)){S.fm.bonus=true;const B=FM_BONUS(famTier());famAddEer(B.eer);S.cred+=B.cred;toast(`Alle 5 familiemissies gehaald! +${B.eer} eer en +${B.cred} straatcredit`,'lvl');log(`Familie: alle missies gehaald (+${B.eer} eer, +${B.cred} cred)`,'ok')}}
// grote klus van de dag
function famHeistReq(){const H=famHeist(),o=[{l:`Vuurkracht ${H.vk} (jij ${gearVk()})`,ok:gearVk()>=H.vk}];
 H.need.forEach(id=>{const g=GEAR.find(x=>x.id===id),best=gearBest(g.cat),ok=!!best&&GEAR.indexOf(best)>=GEAR.indexOf(g);o.push({l:`${g.n} of beter`,ok})});
 o.push({l:`${H.en} energie (jij ${Math.floor(S.energy)})`,ok:S.energy>=H.en});return o}
const famHeistChance=()=>Math.round(Math.max(10,Math.min(85,35+rankIdx(S.xp)*1.5+gearBonus()*.8+fam().chance+sk('schiet')*.3+focusPct()-S.heat/3)));
const famHeistLoot=()=>{const H=famHeist(),k=lootMult();return [H.loot[0]*k,H.loot[1]*k]};
const famUI={confirm:null};
function famPerkTxt(f,scale){const fx=f.perk.fx,o=[];const p=v=>Math.round(v*scale*100)+'%';
 if(fx.cd)o.push('−'+p(fx.cd)+' wachttijd klussen');if(fx.inc)o.push('+'+p(fx.inc)+' passief inkomen');if(fx.bail)o.push('−'+p(fx.bail)+' borg');
 if(fx.flee)o.push('+'+p(fx.flee)+' makkelijker vluchten');if(fx.esc)o.push('+'+p(fx.esc)+' ontsnappen uit de bajes');if(fx.car)o.push('+'+p(fx.car)+' waarde gestolen auto\'s');
 if(fx.free)o.push(p(fx.free)+' kans dat je zaak wordt geseponeerd');if(fx.xp)o.push('+'+p(fx.xp)+' XP');if(fx.heat)o.push('−'+p(fx.heat)+' hitte');if(fx.hit)o.push('+'+p(fx.hit)+' bij huurmoorden (rustiger vizier, meer geld)');return o.join(' · ')}
const famHits=()=>(S.stats&&S.stats.hits)||0;

const famOpen=id=>{famUI.view=id||null;famUI.confirm=null;render();window.scrollTo(0,0)};
window.addEventListener('hashchange',()=>{famUI.view=null});
const famPct=i=>i>FAM_TOP+1?125:Math.round((.5+.1*i)*100);
const famDate=t=>new Date(t).toLocaleDateString('nl-NL',{day:'numeric',month:'long'});
// aansluiten, overstappen of de reden waarom het (nog) niet kan: op de kaart en in het familieoverzicht
function famJoinArea(x){const ri=rankIdx(S.xp),okR=ri>=x.r,okC=S.cred>=x.cred&&famHits()>=(x.hits||0),f=famBase();
 if(S.family===x.id)return `<div class="fm-mine">Jouw familie</div>`;
 if(famUI.confirm===x.id)return `<div class="fm-cf"><span>${S.family?`Je verlaat ${f.n} en verliest al je eer daar${famLead()?` en je plek als ${FAM_RANKS[famRankIdx()][0]}`:''}. Bij ${x.n} begin je onderaan als Aspirant.`:`Je begint onderaan als Aspirant.`} Eerst volgt een gesprek: ze stellen 3 vragen over de familie (lees de kaart dus goed). Charisma helpt.</span><button class="btn sm" onclick="famInterview('${x.id}')">Naar het gesprek</button><button class="btn sm ghost" onclick="famUI.confirm=null;render()">Toch niet</button></div>`;
 const wait=cdLeft('famint_'+x.id),ban=feudBanLeft(x.id);
 if(ban)return `<div class="fm-ban"><b>Verbannen</b><span>Je kwam niet opdagen bij een bendegevecht. Nog ${feudDur(ban)} (${Math.ceil(ban/DAY_MS)} speldagen).</span></div>`;
 return `<button class="btn ${okR&&okC&&!wait?'':'ghost'}" onclick="famUI.confirm='${x.id}';render()" ${okR&&okC&&!inJail()&&!wait?'':'disabled'}>${!(okR&&okC)?'Nog niet toegelaten':wait?'Nieuw gesprek over '+fmtClock(wait):(S.family?'Overstappen':'Aansluiten')}</button>`}
const famReqHtml=x=>{const ri=rankIdx(S.xp),okR=ri>=x.r;return `<div class="fm-req"><span class="${okR?'ok':'no'}">${okR?'✓':'✗'} ${RANKS[x.r][0]}</span><span class="${S.cred>=x.cred?'ok':'no'}">${S.cred>=x.cred?'✓':'✗'} ${S.cred}/${x.cred} cred</span>${x.hits?`<span class="${famHits()>=x.hits?'ok':'no'}">${famHits()>=x.hits?'✓':'✗'} ${famHits()}/${x.hits} huurmoorden</span>`:''}</div>`};
const famTagsHtml=x=>{const T=FAMILIES.indexOf(x);return `<div class="fm-tags"><span>+${x.chance}% kans</span>${x.loot?`<span>+${x.loot}% buit</span>`:''}${x.jail?`<span>−${x.jail}% straf</span>`:''}<span>Grote klus: ${FAM_HEISTS[T].n.toLowerCase()}</span></div>`};
function famCard(x,pos){const okR=rankIdx(S.xp)>=x.r,isMine=S.family===x.id;
 return `<article class="fm-card ${isMine?'on':''} ${okR?'':'lock'}" style="--fc:${x.col}">
  <header><div class="crest" style="color:${x.col}">${x.m}</div><div><h3><button class="fm-open" onclick="famOpen('${x.id}')">${x.n}</button></h3><span class="label">Vanaf ${RANKS[x.r][0]} · ${x.cred} straatcredit${x.hits?` · ${x.hits} huurmoorden`:''}</span></div><em class="fm-pos${pos===1?' top':''}" title="Plek in de stad deze periode">#${pos}</em></header>
  <p>${x.d}</p>
  <div class="fm-perk"><span class="label">Eigen voordeel · ${x.perk.n}</span><b>${famPerkTxt(x,1)}</b></div>
  ${famTagsHtml(x)}${famReqHtml(x)}
  <button class="fm-more" onclick="famOpen('${x.id}')">Verhaal, rangen en macht <span>›</span></button>
  ${famJoinArea(x)}</article>`}
// de top van de familie: Onderbaas en Baas
function famLeadHtml(f,T){const L=famLead(),e=famEer(),lore=famLore(f.id),boss=(lore&&lore.baas)||'de oude baas';
 const li=(ok,t)=>`<li class="${ok?'ok':'no'}">${ok?'✓':'✗'} ${t}</li>`;
 const trib=()=>{const av=famTribAvail(),ok=av>=famTribMin();return `<button class="btn sm ${ok?'':'ghost'}" onclick="act.famTrib()" ${ok?'':'disabled'}>${ok?'Afdracht ophalen':'Afdracht spaart op'} · ${fmt(av)}</button>`};
 if(L===2)return `<div class="fm-lead boss"><div class="fm-lead-t"><span class="label">Jij leidt ${f.n}</span><b>Baas${S.fr.boss?' sinds '+famDate(S.fr.boss):''}</b>
   <small>Familiebonus en eigen voordeel op 125% · jouw oorlogsslagen tellen dubbel · afdracht ${fmt(famTribRate())} per speldag, tot 3 speldagen sparen. Zakt je eer onder ${FAM_RANKS[FAM_TOP][0]}, dan ben je de leiding kwijt.</small></div><div class="fm-lead-b">${trib()}</div></div>`;
 if(L===1){const need=famNeed(FAM_TOP+2,T),why=famTakeoverWhy();
  return `<div class="fm-lead"><div class="fm-lead-t"><span class="label">Volgende stap: Baas</span><b>De overname van ${esc(boss)}</b>
   <small>Een duel van drie rondes: wie het snelst trekt. Win je, dan leid jij de familie. Verlies je, dan kost het gezondheid en wat eer, en mag je het een speldag later opnieuw proberen.</small>
   <ul class="fm-lead-req">${li(e>=need,'Eer '+Math.floor(e).toLocaleString('nl-NL')+' / '+need.toLocaleString('nl-NL'))}${li(S.hp>=FDU_HP,'Gezondheid '+FDU_HP+'% (jij '+S.hp+'%)')}${li(S.energy>=FDU_EN,FDU_EN+' energie')}</ul></div>
   <div class="fm-lead-b"><button class="btn ${why?'ghost':'red'}" onclick="famTakeover()" ${why?'disabled':''}>${why||'De overname · '+FDU_EN+' energie'}</button>${trib()}</div></div>`}
 if(famRankEer()>=FAM_TOP){const need=famNeed(FAM_TOP+1,T),ww=(S.fr&&S.fr.ww)||0,ok=e>=need&&ww>=3;
  return `<div class="fm-lead"><div class="fm-lead-t"><span class="label">Volgende stap: Onderbaas</span><b>Laat zien dat je de familie kunt leiden</b>
   <small>Als Onderbaas krijg je 110% familiebonus en een deel van de afdracht. Daarna kun je ${esc(boss)} uitdagen voor de leiding.</small>
   <ul class="fm-lead-req">${li(e>=need,'Eer '+Math.floor(e).toLocaleString('nl-NL')+' / '+need.toLocaleString('nl-NL'))}${li(ww>=3,'Gewonnen oorlogsslagen '+Math.min(ww,3)+' / 3')}</ul></div>
   <div class="fm-lead-b"><button class="btn ${ok?'':'ghost'}" onclick="act.famUp()" ${ok?'':'disabled'}>${ok?'Word Onderbaas · +'+fmt(famPromoPay(FAM_TOP+1,T)):'Nog niet'}</button></div></div>`}
 return `<div class="fm-lead dim"><div class="fm-lead-t"><span class="label">De top van de familie</span><small>Boven ${FAM_RANKS[FAM_TOP][0]} kom je alleen met lef. Onderbaas word je na 3 gewonnen slagen in de bendeoorlog, Baas door ${esc(boss)} te verslaan in de overname.</small></div></div>`}
// één familie: verhaal, plek in de stad, toelating, wat het oplevert en de rangen
function famDetailHtml(id){const x=FAMILIES.find(f=>f.id===id),T=FAMILIES.indexOf(x),L=famLore(id),tab=fwTable(),row=tab.find(r=>r.f.id===id),hist=fwPosHist(id),mine=S.family===id,isBoss=mine&&famLead()===2,cur=mine?famRankIdx():-1;
 const d=row.prev-row.pos,story=(L&&L.story&&L.story.length?L.story:[x.d]).map(t=>`<p>${esc(t)}</p>`).join('');
 const fact=(k,v)=>v!=null&&v!==''?`<div><span class="label">${k}</span><b>${esc(v)}</b></div>`:'';
 const W=240,H=58,n=hist.length,px=i=>8+i*(W-16)/(n-1),py=p=>7+(p-1)*(H-14)/(FAMILIES.length-1);
 const spark=`<svg class="fmd-spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Plek per periode: ${hist.join(', ')}"><line x1="0" x2="${W}" y1="${py(1)}" y2="${py(1)}"/><polyline points="${hist.map((p,i)=>px(i).toFixed(1)+','+py(p).toFixed(1)).join(' ')}"/>${hist.map((p,i)=>`<circle cx="${px(i).toFixed(1)}" cy="${py(p).toFixed(1)}" r="${i===n-1?4:2.2}"/>`).join('')}</svg>
  <div class="fmd-spark-k"><span>8 perioden terug: #${hist[0]}</span><b>nu #${hist[n-1]}</b></div>`;
 const ladder=FAM_RANKS.map((r,i)=>`<li class="${i===cur?'now':i<cur?'got':''}${r[2]?' lead':''}"><b>${r[0]}</b><span>${i?famNeed(i,T).toLocaleString('nl-NL')+' eer':'bij binnenkomst'}</span><em>${famPct(i)}% van de bonus</em>${r[2]===1?'<small>en 3 gewonnen oorlogsslagen</small>':r[2]===2?`<small>en de overname winnen${L&&L.baas&&!isBoss?' van '+esc(L.baas):''}</small>`:''}</li>`).join('');
 return `<div class="fmd" style="--fc:${x.col}">
  <button class="fm-back" onclick="famOpen(null)"><span>‹</span> Alle families</button>
  <section class="fmd-hero">
   <div class="crest" style="color:${x.col}">${x.m}</div>
   <div class="fmd-id"><span class="label">${row.pos===1?'Heerst over de stad':'Plek '+row.pos+' van '+tab.length+' in de stad'}${d?` · ${d>0?'▲ '+d+' gestegen':'▼ '+(-d)+' gezakt'} sinds vorige periode`:''}</span><h1>${x.n}</h1>${L&&L.motto?`<p class="fmd-motto">“${esc(L.motto)}”</p>`:`<p class="fmd-motto">${x.d}</p>`}</div>
   <div class="fmd-facts">${fact('Wijk',L&&L.wijk)}${fact('Sinds',L&&L.sinds)}${fact('Baas',isBoss?'Jij':L&&L.baas)}${fact('Macht',Math.round(row.pow))}</div>
  </section>
  <div class="fmd-grid">
   <article class="fmd-story"><span class="label">Het verhaal</span>${story}${isBoss?`<p class="fmd-now">Sinds ${famDate(S.fr.boss||now())} heb jij het hier voor het zeggen${L&&L.baas?`. ${esc(L.baas)} zit niet meer aan het hoofd van de tafel`:''}.</p>`:''}</article>
   <aside class="fmd-side">
    <div class="fmd-box"><span class="label">Plek in de stad</span>${spark}</div>
    <div class="fmd-box"><span class="label">Toelating · vanaf ${RANKS[x.r][0]}</span>${famReqHtml(x)}${famJoinArea(x)}</div>
    <div class="fmd-box"><span class="label">Eigen voordeel · ${x.perk.n}</span><b class="fmd-perk">${famPerkTxt(x,1)}</b>${famTagsHtml(x)}<div class="fmd-heist"><span class="label">Grote klus van de dag</span><b>${FAM_HEISTS[T].n}</b><small>${FAM_HEISTS[T].d}</small></div></div>
   </aside></div>
  <section class="fmd-ladder"><div class="tierhead"><h2>Rangen binnen ${x.n}</h2><span>Eer per rang · hoeveel van de familiebonus je krijgt</span></div><ol>${ladder}</ol></section>
 </div>`}

V.fam=()=>{const ri=rankIdx(S.xp),f=famBase();famDaily();
 if(famUI.view&&FAMILIES.some(x=>x.id===famUI.view))return famDetailHtml(famUI.view);
 const pos={};fwTable().forEach(r=>pos[r.f.id]=r.pos);
 if(!f)return `<h1>Families</h1>
  <section class="card hud fm-intro"><div><span class="label">Je hoort nog nergens bij</span><h2>Kies een familie</h2>
   <p>Met de juiste rang en genoeg straatcredit word je toegelaten. De vier zwaarste families nemen alleen Huurmoordenaars en hoger aan die al een aantal huurmoorden op hun naam hebben. Iedereen begint onderaan als Aspirant en klimt met eer op tot Erelid: als Aspirant krijg je de helft van de familiebonus en het eigen voordeel, elk level +10%, als Erelid alles (de getallen hieronder). Daarboven kun je Onderbaas worden en uiteindelijk de familie overnemen.</p></div>
   <div class="fm-intro-k"><div><span class="label">Jouw straatcredit</span><b>${S.cred}</b></div><div><span class="label">Jouw rang</span><b>${RANKS[ri][0]}</b></div></div></section>
  ${fwCityHtml()}
  <div class="tierhead"><h2>Alle families</h2><span>Klik op een naam voor het verhaal en de rangen</span></div>
  <div class="fm-grid">${FAMILIES.map(x=>famCard(x,pos[x.id])).join('')}</div>`;
 const T=famTier(),fr=famRankIdx(),eer=famEer(),nx=FAM_RANKS[fr+1],need=nx?famNeed(fr+1):null,cur=famNeed(fr),sc=famScale(),F=fam();
 const done=S.fm.list.filter(m=>m.done).length,B=FM_BONUS(T),H=famHeist(),req=famHeistReq(),can=req.every(r=>r.ok)&&!inJail()&&!cdLeft('fam_heist'),hm=S.fm.list.find(m=>m.k==='heist'),[l0,l1]=famHeistLoot();
 const mcard=m=>{const D=FM_DEF[m.k],pct=Math.min(100,m.p/m.n*100),val=v=>D.money?fmt(v):Math.floor(v);
  if(m.k==='heist')return '';
  return `<div class="fm-m ${m.done?'done':''}"><div class="fm-m-h"><i>${svg(D.ic)}</i><b>${D.t(m)}</b>${m.done?'<em>✓</em>':''}</div>
   <div class="bar"><i style="width:${pct}%"></i></div>
   <div class="fm-m-f"><span>${val(m.p)} / ${val(m.n)}</span><span>+${m.eer} eer · ${fmt(fmPay(m))}</span></div></div>`};
 const hBtn=hm.done?'<div class="fm-mine">Gelukt vandaag</div>':inJail()?'<button class="btn" disabled>Je zit vast</button>':cdLeft('fam_heist')?`<button class="btn" disabled>Weer over ${fmtClock(cdLeft('fam_heist'))}</button>`
  :`<button class="btn ${can?'':'ghost'}" onclick="act.famHeist()" ${can?'':'disabled'}>${can?'Uitvoeren · '+famHeistChance()+'% kans':'Je mist nog iets'}</button>`;
 const prog=nx?Math.min(100,Math.max(0,(eer-cur)/(need-cur))*100):100;
 return `<h1>Families</h1>
 <section class="card hud fm-hero" style="--fc:${f.col}">
  <div class="fm-h-id"><div class="crest" style="color:${f.col}">${f.m}</div><div><span class="label">Jouw familie · #${pos[f.id]} in de stad</span><h2><button class="fm-open" onclick="famOpen('${f.id}')">${f.n}</button></h2>
   <div class="fm-rank"><b>${FAM_RANKS[fr][0]}</b><span>familielevel ${fr+1} van ${FAM_RANKS.length}</span></div></div></div>
  <div class="fm-h-eer"><div class="fm-eer-t"><span class="label">Eer</span><b>${Math.floor(eer).toLocaleString('nl-NL')}</b>${nx?`<em>${eer>=need?'genoeg eer voor '+nx[0]:'nog '+Math.ceil(need-eer).toLocaleString('nl-NL')+' tot '+nx[0]} (+${fmt(famPromoPay(fr+1,T))})</em>`:'<em>Hoogste plek in de familie</em>'}</div>
   <div class="bar"><i style="width:${prog}%;background:${f.col}"></i></div>
   <ol class="fm-ladder">${FAM_RANKS.map((r,i)=>`<li class="${i<fr?'got':i===fr?'now':''}${r[2]?' lead':''}"><b>${r[0]}</b><span>${famPct(i)}%</span></li>`).join('')}</ol></div>
  ${famLeadHtml(f,T)}
  <div class="fm-h-fx"><div><span class="label">Slaagkans</span><b>+${F.chance}%</b></div><div><span class="label">Buit</span><b>+${F.loot}%</b></div><div><span class="label">Straf</span><b>−${F.jail}%</b></div>
   <div class="fm-h-perk"><span class="label">${f.perk.n} · nu ${Math.round(sc*100)}%</span><b>${famPerkTxt(f,sc)}</b></div></div>
 </section>
 ${fwCityHtml()}
 <section class="fm-day">
  <div class="fm-day-h"><div><h2>Missies van vandaag</h2><p>Haal er minimaal 3, anders verlies je 10% van je eer. Hoe hoger je in de familie staat, hoe meer elke missie betaalt. Alle 5: <b>+${B.eer} eer</b> en <b>+${B.cred} straatcredit</b>.${S.fm.grace?' Vandaag telt nog niet mee: je bent net binnen.':''}</p></div>
   <div class="fm-day-k"><div class="fm-dots">${S.fm.list.map((m,i)=>`<i class="${m.done?'on':''} ${i===2?'min':''}"></i>`).join('')}</div><b>${done}/5</b><span>nieuwe missies over ${bkDur(fmLeft())}</span></div></div>
  <div class="fm-day-g">
   <div class="fm-ms">${S.fm.list.map(mcard).join('')}</div>
   <article class="fm-heist ${hm.done?'done':''}"><span class="label">Grote klus van ${f.n}</span><h3>${H.n}</h3><p>${H.d}</p>
    <ul class="fm-hreq">${req.map(r=>`<li class="${r.ok?'ok':'no'}">${r.ok?'✓':'✗'} ${r.l}</li>`).join('')}</ul>
    <div class="fm-hk"><div><span class="label">Buit</span><b>${fmt(l0)} – ${fmt(l1)}</b></div><div><span class="label">Kans</span><b>${famHeistChance()}%</b></div><div><span class="label">Eer</span><b>+${hm.eer}</b></div></div>
    ${hBtn}<div class="fm-note">Mislukt? Dan volgt een achtervolging en kun je de cel in (${fmtTime(jailSec(H.jail))}). Na een mislukte poging 20 minuten wachten.</div></article>
  </div>
  <div class="fm-how"><span class="label">Zo verdien je eer</span><div><span>Geslaagde klus</span><b>+ je straatcredit</b></div><div><span>Auto gestolen</span><b>+1</b></div><div><span>Auto afleveren (Auto's → garage)</span><b>+2 tot +50</b></div><div><span>Missie</span><b>+${S.fm.list[0].eer} tot +${hm.eer}</b></div><div><span>Oorlogsslag gewonnen</span><b>+${Math.round(18*(1+T*.5))}</b></div></div>
 </section>
 <div class="fm-foot"><div class="tierhead"><h2>Andere families</h2><span>Overstappen kan, maar je begint dan weer onderaan</span></div>
  ${famUI.confirm==='leave'?`<div class="fm-cf"><span>Weet je het zeker? Je verliest al je eer bij ${f.n}${famLead()?` en je plek als ${FAM_RANKS[fr][0]}`:''}.</span><button class="btn sm red" onclick="act.leave()">Ja, verlaten</button><button class="btn sm ghost" onclick="famUI.confirm=null;render()">Toch niet</button></div>`:`<button class="bk-link" onclick="famUI.confirm='leave';render()">${f.n} verlaten</button>`}</div>
 <div class="fm-grid">${FAMILIES.filter(x=>x.id!==f.id).map(x=>famCard(x,pos[x.id])).join('')}</div>`};

Object.assign(act,{
 join(id){const x=FAMILIES.find(k=>k.id===id);if(!x||inJail()||feudBanLeft(id)||rankIdx(S.xp)<x.r||S.cred<x.cred||famHits()<(x.hits||0)||S.family===id)return;const old=famBase();
  S.family=id;S.fr={id,eer:0,since:now()};fmNew(true);famUI.confirm=null;toast('Welkom bij '+x.n+'. Je begint als Aspirant.','lvl');log((old?old.n+' verlaten, ':'')+'aangesloten bij '+x.n,'ok');save();pushState();render()},
 famUp(){const T=famTier();if(!S.family||famLead()||famRankEer()<FAM_TOP||famEer()<famNeed(FAM_TOP+1,T)||((S.fr&&S.fr.ww)||0)<3)return;
  S.fr.lead=1;S.fr.trib=now();const pay=famPromoPay(FAM_TOP+1,T),cr=5+T;S.cash+=pay;addZwart(pay);S.cred+=cr;
  toast(`Je bent nu Onderbaas van ${famBase().n}! +${fmt(pay)}`,'lvl');log(`Familie: Onderbaas van ${famBase().n} (+${fmt(pay)}, +${cr} cred)`,'ok');save();pushState();render()},
 leave(){const f=famBase();if(!f)return;log('Familie '+f.n+' verlaten','info');S.family=null;S.fr=null;S.fm=null;famUI.confirm=null;toast('Je bent weer op jezelf');save();pushState();render()},
 famCar(i){const c=S.cars[i];if(!c||!S.family)return;S.cars.splice(i,1);const pay=Math.round(c.v*.3),e=Math.round(2+Math.sqrt(c.v)/20);S.cash+=pay;addZwart(pay);famAddEer(e);
  toast(`${c.n} afgeleverd bij ${famBase().n}: +${e} eer en ${fmt(pay)}`,'ok');log(`${c.n} afgeleverd bij de familie (+${e} eer)`,'ok');famEv('deliver',{v:c.v});save();render()},
 famHeist(){famDaily();const H=famHeist(),m=S.fm.list.find(x=>x.k==='heist');if(!m||m.done||inJail()||cdLeft('fam_heist')||!famHeistReq().every(r=>r.ok))return;
  S.energy-=H.en;const ch=famHeistChance();
  if(rnd(1,100)<=ch){const [a,b]=famHeistLoot(),g=Math.floor(a+Math.random()*(b-a));S.cash+=g;addZwart(g);S.stats.crimes++;addHeat(15);addXp(20+10*famTier());famEv('heist');
   toast(H.n+' gelukt: +'+fmt(g),'lvl');log(H.n+' gelukt, buit '+fmt(g),'ok');save();render()}
  else{S.cd.fam_heist=now()+20*60000*waitK();S.hp=Math.max(10,S.hp-rnd(10,25));addHeat(20);addXp(5);log(H.n+' mislukt','bad');save();
   arrest(H.jail,'Overval mislukt!','De politie stond al te wachten bij '+H.n.toLowerCase().replace(/^\w+ /,'')+'.',{flee:4})}}
});

// ---------- Sollicitatiegesprek ----------
// Een familie neemt alleen mensen aan die weten bij wie ze aankloppen: 3 vragen over de familie (alles staat op de familiekaart).
// Charisma (training) helpt: elke 15 levels een hint (er valt een fout antwoord weg), vanaf level 25 mag je één keer fout zitten.
// Afgewezen = 15 minuten wachten (korter als VIP/High roller). Het gesprek telt meteen, dus verversen helpt niet.
const FAM_INT_CD=15;
const famIntHints=()=>Math.floor(sk('charisma')/15);
const famIntMiss=()=>sk('charisma')>=25?1:0;
function famQuestions(x){const T=FAMILIES.indexOf(x),others=FAMILIES.filter(f=>f.id!==x.id);
 const shuf=a=>a.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);const cap=t=>t.charAt(0).toUpperCase()+t.slice(1);
 const Q=[];const mk=(q,right,wrong)=>{const w=shuf([...new Set(wrong)].filter(v=>v!==right)).slice(0,3);if(w.length>=2)Q.push({q,right,opts:shuf([right,...w])})};
 mk(`Wat is het eigen voordeel van ${x.n}?`,cap(x.perk.d),others.map(f=>cap(f.perk.d)));
 mk(`Welke grote klus doet ${x.n}?`,FAM_HEISTS[T].n,FAM_HEISTS.filter((h,i)=>i!==T).map(h=>h.n));
 mk(`Vanaf welke rang neemt ${x.n} mensen aan?`,RANKS[x.r][0],RANKS.slice(1).map(r=>r[0]));
 mk(`Wie zijn ${x.n}?`,x.d,others.map(f=>f.d));
 mk(`Hoeveel straatcredit vraagt ${x.n} minimaal?`,x.cred.toLocaleString('nl-NL'),others.map(f=>f.cred.toLocaleString('nl-NL')));
 if(x.loot)mk(`Hoeveel extra buit geeft ${x.n} je als Erelid?`,'+'+x.loot+'%',others.filter(f=>f.loot).map(f=>'+'+f.loot+'%'));
 return shuf(Q).slice(0,3)}
let FI=null;
function famInterview(id){const x=FAMILIES.find(f=>f.id===id);if(!x||inJail()||feudBanLeft(id)||cdLeft('famint_'+id))return;
 S.cd['famint_'+id]=now()+FAM_INT_CD*60000*waitK();save();famUI.confirm=null;
 FI={x,qs:famQuestions(x),i:0,miss:0,hints:famIntHints(),gone:{},ans:null};famIntDraw()}
function famIntDraw(){let el=document.getElementById('famInt');if(!FI){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='famInt';document.body.appendChild(el)}
 const x=FI.x,Q=FI.qs[FI.i],done=FI.i>=FI.qs.length,allowed=famIntMiss();
 if(done){const ok=FI.miss<=allowed;
  el.innerHTML=`<div class="fi-card ${ok?'ok':'bad'}" style="--fc:${x.col}"><div class="fi-crest">${x.m}</div><span class="label">${esc(x.n)}</span>
   <h2>${ok?'Welkom in de familie':'Afgewezen'}</h2><p>${ok?`Je wist precies bij wie je aanklopte${FI.miss?' (op één foutje na, maar je praatte het recht)':''}. Je begint als Aspirant.`:`Je had ${FI.miss} van de ${FI.qs.length} vragen fout. Ze vertrouwen je nog niet. Lees de familiekaart nog eens goed en probeer het over ${Math.round(FAM_INT_CD*waitK())} minuten opnieuw.`}</p>
   <button class="btn ${ok?'':'red'}" onclick="famIntEnd(${ok})">${ok?'Aansluiten':'Sluiten'}</button></div>`;return}
 const ansd=FI.ans!=null;
 el.innerHTML=`<div class="fi-card" style="--fc:${x.col}"><div class="fi-top"><div class="fi-crest">${x.m}</div><div><span class="label">Gesprek bij ${esc(x.n)}</span><b>Vraag ${FI.i+1} van ${FI.qs.length}</b></div>
   <div class="fi-dots">${FI.qs.map((q,i)=>`<i class="${i<FI.i?(q.ok?'ok':'no'):i===FI.i?'now':''}"></i>`).join('')}</div></div>
  <h2>${esc(Q.q)}</h2>
  <div class="fi-opts">${Q.opts.map((o,k)=>{const gone=FI.gone[k],right=o===Q.right,cls=ansd?(right?'right':FI.ans===k?'wrong':'dim'):gone?'gone':'';
   return `<button class="${cls}" onclick="famIntAns(${k})" ${ansd||gone?'disabled':''}>${esc(o)}</button>`}).join('')}</div>
  <div class="fi-foot"><span>Charisma ${sk('charisma')}: ${FI.hints} hint${FI.hints===1?'':'s'} over${allowed?' · 1 fout toegestaan':''}${FI.miss?` · ${FI.miss} fout`:''}</span>
   ${ansd?`<button class="btn" onclick="FI.i++;FI.ans=null;FI.gone={};famIntDraw()">${FI.i+1<FI.qs.length?'Volgende vraag':'Uitslag'}</button>`
   :`<button class="btn ghost sm" onclick="famIntHint()" ${FI.hints<1||Object.keys(FI.gone).length>=2?'disabled':''}>Hint gebruiken</button>`}</div></div>`}
function famIntHint(){if(!FI||FI.hints<1||FI.ans!=null)return;const Q=FI.qs[FI.i];const c=Q.opts.map((o,k)=>k).filter(k=>Q.opts[k]!==Q.right&&!FI.gone[k]);if(c.length<=1)return;
 FI.gone[c[Math.floor(Math.random()*c.length)]]=1;FI.hints--;SFX.click&&SFX.click();famIntDraw()}
function famIntAns(k){if(!FI||FI.ans!=null)return;const Q=FI.qs[FI.i];FI.ans=k;Q.ok=Q.opts[k]===Q.right;if(!Q.ok)FI.miss++;famIntDraw()}
function famIntEnd(ok){const x=FI&&FI.x;FI=null;famIntDraw();if(!x)return;
 if(ok){delete S.cd['famint_'+x.id];act.join(x.id)}else{log('Afgewezen door '+x.n,'bad');toast('Afgewezen door '+x.n+'. Probeer het later opnieuw.','bad');save();render()}}
