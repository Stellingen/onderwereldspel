// Tab: Families — klimmen binnen je familie, eigen voordeel per familie en 5 dagelijkse missies
// Eer verdien je met geslaagde klussen (je straatcredit telt ook als eer), gestolen auto's, auto's afleveren en missies.
// Elke dag 5 missies: haal er minimaal 3, anders verlies je 10% van je eer. Alle 5 = extra eer en straatcredit.
// Grotere families geven zwaardere missies, met een grote klus die bepaalde wapens en uitrusting vraagt.
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
 const b=famRankIdx();S.fr.eer=Math.max(0,S.fr.eer+x);const a=famRankIdx();
 if(a>b){const pay=famPromoPay(a,famTier());S.cash+=pay;toast(`Promotie in ${famBase().n}: je bent nu ${FAM_RANKS[a][0]}! +${fmt(pay)}`,'lvl');log(`Familie: gepromoveerd tot ${FAM_RANKS[a][0]} (+${fmt(pay)})`,'ok')}
 else if(a<b){toast(`Gedegradeerd tot ${FAM_RANKS[a][0]} in ${famBase().n}`,'bad');log(`Familie: gedegradeerd tot ${FAM_RANKS[a][0]}`,'bad')}}
// gebeurtenissen uit de rest van het spel
function famEv(ev,e){if(!S.family)return;e=e||{};famDaily();
 if(ev==='crime'&&e.cr)famAddEer(e.cr);if(ev==='car')famAddEer(1);
 S.fm.list.forEach(m=>{if(m.done)return;const D=FM_DEF[m.k];if(D.ev!==ev||(D.ok&&!D.ok(m,e)))return;m.p=Math.min(m.n,m.p+(D.amt?D.amt(e):1));
  if(m.p>=m.n){m.done=true;const pay=fmPay(m);famAddEer(m.eer);if(pay)S.cash+=pay;toast(`Familiemissie gehaald: +${m.eer} eer${pay?' en '+fmt(pay):''}`,'lvl');log(`Familiemissie: ${D.t(m)} (+${m.eer} eer)`,'ok')}});
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
 if(fx.flee)o.push('+'+p(fx.flee)+' groen gat bij vluchten');if(fx.esc)o.push('+'+p(fx.esc)+' ontsnappen uit de bajes');if(fx.car)o.push('+'+p(fx.car)+' waarde gestolen auto\'s');
 if(fx.free)o.push(p(fx.free)+' kans dat je zaak wordt geseponeerd');if(fx.xp)o.push('+'+p(fx.xp)+' XP');if(fx.heat)o.push('−'+p(fx.heat)+' hitte');if(fx.hit)o.push('+'+p(fx.hit)+' bij huurmoorden (rustiger vizier, meer geld)');return o.join(' · ')}
const famHits=()=>(S.stats&&S.stats.hits)||0;

V.fam=()=>{const ri=rankIdx(S.xp),f=famBase();famDaily();
 const card=x=>{const okR=ri>=x.r,okC=S.cred>=x.cred&&famHits()>=(x.hits||0),isMine=S.family===x.id,T=FAMILIES.indexOf(x),cf=famUI.confirm===x.id;
  return `<article class="fm-card ${isMine?'on':''} ${okR?'':'lock'}" style="--fc:${x.col}">
   <header><div class="crest" style="color:${x.col}">${x.m}</div><div><h3>${x.n}</h3><span class="label">Vanaf ${RANKS[x.r][0]} · ${x.cred} straatcredit${x.hits?` · ${x.hits} huurmoorden`:''}</span></div></header>
   <p>${x.d}</p>
   <div class="fm-perk"><span class="label">Eigen voordeel · ${x.perk.n}</span><b>${famPerkTxt(x,1)}</b></div>
   <div class="fm-tags"><span>+${x.chance}% kans</span>${x.loot?`<span>+${x.loot}% buit</span>`:''}${x.jail?`<span>−${x.jail}% straf</span>`:''}<span>Grote klus: ${FAM_HEISTS[T].n.toLowerCase()}</span></div>
   <div class="fm-req"><span class="${okR?'ok':'no'}">${okR?'✓':'✗'} ${RANKS[x.r][0]}</span><span class="${S.cred>=x.cred?'ok':'no'}">${S.cred>=x.cred?'✓':'✗'} ${S.cred}/${x.cred} cred</span>${x.hits?`<span class="${famHits()>=x.hits?'ok':'no'}">${famHits()>=x.hits?'✓':'✗'} ${famHits()}/${x.hits} huurmoorden</span>`:''}</div>
   ${isMine?`<div class="fm-mine">Jouw familie</div>`
    :cf?`<div class="fm-cf"><span>${S.family?`Je verlaat ${f.n} en verliest al je eer daar. Bij ${x.n} begin je onderaan als Aspirant.`:`Je begint onderaan als Aspirant.`}</span><button class="btn sm" onclick="act.join('${x.id}')">Ja, ${S.family?'overstappen':'aansluiten'}</button><button class="btn sm ghost" onclick="famUI.confirm=null;render()">Toch niet</button></div>`
    :`<button class="btn ${okR&&okC?'':'ghost'}" onclick="famUI.confirm='${x.id}';render()" ${okR&&okC&&!inJail()?'':'disabled'}>${okR&&okC?(S.family?'Overstappen':'Aansluiten'):'Nog niet toegelaten'}</button>`}</article>`};
 if(!f)return `<h1>Families</h1>
  <section class="card hud fm-intro"><div><span class="label">Je hoort nog nergens bij</span><h2>Kies een familie</h2>
   <p>Met de juiste rang en genoeg straatcredit word je toegelaten. De vier zwaarste families nemen alleen Huurmoordenaars en hoger aan die al een aantal huurmoorden op hun naam hebben. Iedereen begint onderaan als Aspirant. Met klussen, auto's voor de familie en de dagelijkse missies klim je op tot Erelid. Als Aspirant krijg je de helft van de familiebonus en het eigen voordeel, elk level +10%, als Erelid alles (de getallen hieronder).</p></div>
   <div class="fm-intro-k"><div><span class="label">Jouw straatcredit</span><b>${S.cred}</b></div><div><span class="label">Jouw rang</span><b>${RANKS[ri][0]}</b></div></div></section>
  <div class="fm-grid">${FAMILIES.map(card).join('')}</div>`;
 const T=famTier(),fr=famRankIdx(),eer=famEer(),nx=FAM_RANKS[fr+1],need=nx?famNeed(fr+1):null,cur=famNeed(fr),sc=famScale(),F=fam();
 const done=S.fm.list.filter(m=>m.done).length,B=FM_BONUS(T),H=famHeist(),req=famHeistReq(),can=req.every(r=>r.ok)&&!inJail()&&!cdLeft('fam_heist'),hm=S.fm.list.find(m=>m.k==='heist'),[l0,l1]=famHeistLoot();
 const mcard=m=>{const D=FM_DEF[m.k],pct=Math.min(100,m.p/m.n*100),val=v=>D.money?fmt(v):Math.floor(v);
  if(m.k==='heist')return '';
  return `<div class="fm-m ${m.done?'done':''}"><div class="fm-m-h"><i>${svg(D.ic)}</i><b>${D.t(m)}</b>${m.done?'<em>✓</em>':''}</div>
   <div class="bar"><i style="width:${pct}%"></i></div>
   <div class="fm-m-f"><span>${val(m.p)} / ${val(m.n)}</span><span>+${m.eer} eer · ${fmt(fmPay(m))}</span></div></div>`};
 const hBtn=hm.done?'<div class="fm-mine">Gelukt vandaag</div>':inJail()?'<button class="btn" disabled>Je zit vast</button>':cdLeft('fam_heist')?`<button class="btn" disabled>Weer over ${fmtClock(cdLeft('fam_heist'))}</button>`
  :`<button class="btn ${can?'':'ghost'}" onclick="act.famHeist()" ${can?'':'disabled'}>${can?'Uitvoeren · '+famHeistChance()+'% kans':'Je mist nog iets'}</button>`;
 return `<h1>Families</h1>
 <section class="card hud fm-hero" style="--fc:${f.col}">
  <div class="fm-h-id"><div class="crest" style="color:${f.col}">${f.m}</div><div><span class="label">Jouw familie</span><h2>${f.n}</h2>
   <div class="fm-rank"><b>${FAM_RANKS[fr][0]}</b><span>familielevel ${fr+1} van ${FAM_RANKS.length}</span></div></div></div>
  <div class="fm-h-eer"><div class="fm-eer-t"><span class="label">Eer</span><b>${Math.floor(eer).toLocaleString('nl-NL')}</b>${nx?`<em>nog ${Math.ceil(need-eer).toLocaleString('nl-NL')} tot ${nx[0]} (+${fmt(famPromoPay(fr+1,T))})</em>`:'<em>Hoogste level in de familie</em>'}</div>
   <div class="bar"><i style="width:${nx?Math.min(100,(eer-cur)/(need-cur)*100):100}%;background:${f.col}"></i></div>
   <ol class="fm-ladder">${FAM_RANKS.map((r,i)=>`<li class="${i<fr?'got':i===fr?'now':''}"><b>${r[0]}</b><span>${Math.round((.5+.1*i)*100)}%</span></li>`).join('')}</ol></div>
  <div class="fm-h-fx"><div><span class="label">Slaagkans</span><b>+${F.chance}%</b></div><div><span class="label">Buit</span><b>+${F.loot}%</b></div><div><span class="label">Straf</span><b>−${F.jail}%</b></div>
   <div class="fm-h-perk"><span class="label">${f.perk.n} · nu ${Math.round(sc*100)}%</span><b>${famPerkTxt(f,sc)}</b></div></div>
 </section>
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
  <div class="fm-how"><span class="label">Zo verdien je eer</span><div><span>Geslaagde klus</span><b>+ je straatcredit</b></div><div><span>Auto gestolen</span><b>+1</b></div><div><span>Auto afleveren (Auto's → garage)</span><b>+2 tot +50</b></div><div><span>Missie</span><b>+${S.fm.list[0].eer} tot +${hm.eer}</b></div></div>
 </section>
 <div class="fm-foot"><div class="tierhead"><h2>Andere families</h2><span>Overstappen kan, maar je begint dan weer onderaan</span></div>
  ${famUI.confirm==='leave'?`<div class="fm-cf"><span>Weet je het zeker? Je verliest al je eer bij ${f.n}.</span><button class="btn sm red" onclick="act.leave()">Ja, verlaten</button><button class="btn sm ghost" onclick="famUI.confirm=null;render()">Toch niet</button></div>`:`<button class="bk-link" onclick="famUI.confirm='leave';render()">${f.n} verlaten</button>`}</div>
 <div class="fm-grid">${FAMILIES.filter(x=>x.id!==f.id).map(card).join('')}</div>`};

Object.assign(act,{
 join(id){const x=FAMILIES.find(k=>k.id===id);if(!x||inJail()||rankIdx(S.xp)<x.r||S.cred<x.cred||famHits()<(x.hits||0)||S.family===id)return;const old=famBase();
  S.family=id;S.fr={id,eer:0,since:now()};fmNew(true);famUI.confirm=null;toast('Welkom bij '+x.n+'. Je begint als Aspirant.','lvl');log((old?old.n+' verlaten, ':'')+'aangesloten bij '+x.n,'ok');save();pushState();render()},
 leave(){const f=famBase();if(!f)return;log('Familie '+f.n+' verlaten','info');S.family=null;S.fr=null;S.fm=null;famUI.confirm=null;toast('Je bent weer op jezelf');save();pushState();render()},
 famCar(i){const c=S.cars[i];if(!c||!S.family)return;S.cars.splice(i,1);const pay=Math.round(c.v*.3),e=Math.round(2+Math.sqrt(c.v)/20);S.cash+=pay;famAddEer(e);
  toast(`${c.n} afgeleverd bij ${famBase().n}: +${e} eer en ${fmt(pay)}`,'ok');log(`${c.n} afgeleverd bij de familie (+${e} eer)`,'ok');famEv('deliver',{v:c.v});save();render()},
 famHeist(){famDaily();const H=famHeist(),m=S.fm.list.find(x=>x.k==='heist');if(!m||m.done||inJail()||cdLeft('fam_heist')||!famHeistReq().every(r=>r.ok))return;
  S.energy-=H.en;const ch=famHeistChance();
  if(rnd(1,100)<=ch){const [a,b]=famHeistLoot(),g=Math.floor(a+Math.random()*(b-a));S.cash+=g;S.stats.crimes++;addHeat(15);addXp(20+10*famTier());famEv('heist');
   toast(H.n+' gelukt: +'+fmt(g),'lvl');log(H.n+' gelukt, buit '+fmt(g),'ok');save();render()}
  else{S.cd.fam_heist=now()+20*60000*waitK();S.hp=Math.max(10,S.hp-rnd(10,25));addHeat(20);addXp(5);log(H.n+' mislukt','bad');save();
   arrest(H.jail,'Overval mislukt!','De politie stond al te wachten bij '+H.n.toLowerCase().replace(/^\w+ /,'')+'.',{flee:4})}}
});
