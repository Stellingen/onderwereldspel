// Wraak en bendegevecht. Een doelwit van een huurmoord heeft vaak eigen mensen. Na een contract (of als hij ontsnapt of je mist)
// kunnen die je komen zoeken. Dan volgt een bendegevecht: met je familie (of alleen als je nergens bij hoort).
// Meedoen kan alleen met genoeg gezondheid en energie. Zit je in een familie en kom je niet opdagen (weigeren of de tijd laten verlopen),
// dan word je uit die familie gezet en ben je er 30 speldagen verbannen (1 speldag = 4 uur, dus 5 echte dagen).
// De uitslag wordt meteen bij het begin van het gevecht vastgelegd; verversen helpt dus niet.
const FEUD_BAN_DAYS=30,FEUD_WAIT=30*60000,FEUD_EN=15;
const feudNeed=d=>45+d*7;
const feudBanLeft=id=>{const b=S.famBan&&S.famBan[id];return b&&b>now()?b-now():0};
const feudDur=ms=>{const m=Math.max(0,Math.ceil(ms/60000)),d=Math.floor(m/1440),h=Math.floor(m%1440/60);return d?d+'d '+h+'u':h?h+'u '+(m%60)+'m':m+'m'};
const feudYou=()=>{const fb=S.family?8+famTier()*3+famRankIdx()*2:0;return Math.round(30+gearBonus()*.9+sk('schiet')*.35+sk('conditie')*.15+fb+Math.max(0,S.hp-60)*.25)};
const feudThem=d=>30+d*6;
const feudP=d=>Math.max(.2,Math.min(.85,.5+(feudYou()-feudThem(d))/90));
const feudWin=p=>p*p*(3-2*p); // kans om 2 van de 3 rondes te winnen
const feudHit=F=>(typeof HITS!=='undefined'&&HITS.find(h=>h.id===F.h))||{id:'x',t:F.t,d:F.d,pay:[20000,36000]};
const feudLoot=F=>{const [a,b]=hitPay(feudHit(F));return [Math.round(a*.3),Math.round(b*.3)]};
const feudWhy={hit:t=>`${t} is dood, maar zijn mensen weten wie het deed. Ze zijn naar je op zoek.`,
 missed:t=>`${t} belde niet de politie, maar zijn neven. Ze zijn naar je op zoek.`,
 escaped:t=>`${t} is ontkomen en heeft zijn mensen opgetrommeld. Ze zijn naar je op zoek.`};

function feudStart(H,why){if(S.feud)return;const f=famBase();
 S.feud={h:H.id,t:H.t,d:H.d,why,fam:f?f.id:null,at:now(),until:now()+FEUD_WAIT};S.stats.feuds=(S.stats.feuds||0)+1;
 log(`Wraak: de mensen van ${H.t} zoeken je${f?'. '+f.n+' roept iedereen op voor een bendegevecht':''}`,'bad');save();pushState();
 try{SFX.lose()}catch(e){}toast(`De mensen van ${H.t} komen eraan. ${f?'Je familie rekent op je.':'Je staat er alleen voor.'}`,'bad');
 if(!window.__hitG&&!window.__chase)feudOpen();render()}

// balk bovenaan elke pagina (behalve het casino) zolang er een bendegevecht openstaat
function feudBar(){const F=S.feud;if(!F||page==='casino'||document.getElementById('feudLayer'))return '';const f=F.fam&&FAMILIES.find(x=>x.id===F.fam);
 return `<div class="fd-bar"><i class="fd-ic">${feudIc()}</i><div><b>Bendegevecht: de mensen van ${esc(F.t)} zoeken je</b><span>${f&&S.family===f.id?`${esc(f.n)} rekent op je. Niet komen = ${FEUD_BAN_DAYS} speldagen verbannen.`:'Vecht, of ze vinden je toch.'} Nog <b id="fdLeft">${fmtClock(F.until-now())}</b></span></div><button class="btn red sm" onclick="feudOpen()">Bekijken</button></div>`}
function feudIc(){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/></svg>'}

let FD={confirm:false};
function feudOpen(){const F=S.feud;let el=document.getElementById('feudLayer');if(!F){if(el)el.remove();return}
 if(!el){el=document.createElement('div');el.id='feudLayer';document.body.appendChild(el)}
 const f=F.fam&&FAMILIES.find(x=>x.id===F.fam),inFam=f&&S.family===f.id,need=feudNeed(F.d),hpOk=S.hp>=need,enOk=S.energy>=FEUD_EN,jail=inJail();
 const p=feudP(F.d),w=Math.round(feudWin(p)*100),[l0,l1]=feudLoot(F),you=feudYou(),them=feudThem(F.d),can=hpOk&&enOk&&!jail;
 el.innerHTML=`<div class="fd-card" role="dialog" aria-modal="true" aria-labelledby="fdT">
  <div class="fd-top"><i class="fd-ic">${feudIc()}</i><div><span class="label">Wraak · moeilijkheid ${F.d} van 6</span><h2 id="fdT">De mensen van ${esc(F.t)}</h2></div><div class="fd-clock"><span class="label">Nog</span><b id="fdLeft2">${fmtClock(F.until-now())}</b></div></div>
  <p>${feudWhy[F.why]?feudWhy[F.why](esc(F.t)):''} ${inFam?`<b>${esc(f.n)}</b> trommelt iedereen op voor een bendegevecht en verwacht jou vooraan.`:'Je hoort bij geen familie, dus je staat er alleen voor.'}</p>
  <div class="fd-vs"><div><span class="label">${inFam?'Jullie kant':'Jij'}</span><b>${you}</b><small>wapens, Schieten, Conditie${inFam?', familie':''}, gezondheid</small></div><em>vs</em><div><span class="label">Hun kant</span><b>${them}</b><small>${F.d>=5?'zwaar bewapend':F.d>=3?'goed bewapend':'een paar neven met messen'}</small></div></div>
  <div class="fd-bar2"><i style="width:${w}%"></i><span>${w}% kans om te winnen · 3 rondes, 2 winnen</span></div>
  <ul class="fd-req"><li class="${hpOk?'ok':'no'}">${hpOk?'✓':'✗'} Gezondheid ${need}% nodig (jij ${S.hp}%)</li><li class="${enOk?'ok':'no'}">${enOk?'✓':'✗'} ${FEUD_EN} energie (jij ${Math.floor(S.energy)})</li>${jail?'<li class="no">✗ Je zit vast</li>':''}</ul>
  <div class="fd-out"><div><span class="label">Winnen</span><b class="g">${fmt(l0)} – ${fmt(l1)}</b><small>+${6+F.d*3} cred · +${120+F.d*60} XP${inFam?` · +${15+F.d*8} eer`:''}</small></div>
   <div><span class="label">Verliezen</span><b class="r">veel gezondheid</b><small>en ze nemen wat geld mee${inFam?' · je blijft wel in de familie':''}</small></div>
   <div><span class="label">Niet komen</span><b class="r">${inFam?FEUD_BAN_DAYS+' speldagen weg':'ze vinden je toch'}</b><small>${inFam?`uit ${esc(f.n)} gezet en ${FEUD_BAN_DAYS} speldagen (5 echte dagen) verbannen`:'−20% gezondheid en een deel van je geld'}</small></div></div>
  <div class="fd-btns">${can?`<button class="btn red" onclick="feudFight()">Meevechten · ${FEUD_EN} energie</button>`
   :!hpOk&&!jail?`<button class="btn" onclick="act.heal();feudOpen()" ${S.cash<healCost()?'disabled':''}>Eerst naar de kliniek · ${fmt(healCost())}</button>`:`<button class="btn" disabled>${jail?'Je zit vast':'Te moe'}</button>`}
   ${FD.confirm?`<button class="btn ghost" onclick="feudRefuse(false)">Ja, ik kom niet</button>`:`<button class="btn ghost" onclick="FD.confirm=true;feudOpen()">Weigeren</button>`}
   <button class="btn ghost sm" onclick="feudClose()">Later</button></div>
  ${FD.confirm?`<p class="fd-warn">${inFam?`Zeker weten? Je wordt uit ${esc(f.n)} gezet en bent ${FEUD_BAN_DAYS} speldagen verbannen. Al je eer daar ben je kwijt.`:'Zeker weten? Ze vinden je toch: je verliest gezondheid en geld.'}</p>`:''}
 </div>`}
function feudClose(){FD.confirm=false;const el=document.getElementById('feudLayer');if(el)el.remove();render()}

// niet komen opdagen (weigeren of tijd verlopen)
function feudRefuse(auto){const F=S.feud;if(!F)return;delete S.feud;FD.confirm=false;
 const f=F.fam&&FAMILIES.find(x=>x.id===F.fam);
 if(f){S.famBan=S.famBan||{};S.famBan[f.id]=now()+FEUD_BAN_DAYS*DAY_MS;
  if(S.family===f.id){S.family=null;S.fr=null;S.fm=null}
  log(`${f.n} heeft je eruit gezet: ${auto?'je kwam niet opdagen':'je weigerde'} bij het bendegevecht. ${FEUD_BAN_DAYS} speldagen verbannen.`,'bad');
  toast(`${auto?'Je kwam niet opdagen.':'Je weigerde.'} ${f.n} zet je eruit: ${FEUD_BAN_DAYS} speldagen verbannen.`,'bad')}
 else{const [a]=feudLoot(F),lose=Math.min(Math.round(S.cash*.04),a);S.cash-=lose;S.hp=Math.max(5,S.hp-20);
  log(`De mensen van ${F.t} vonden je toch (−20% gezondheid${lose?', −'+fmt(lose):''})`,'bad');toast(`De mensen van ${F.t} vonden je toch. −20% gezondheid${lose?' en '+fmt(lose):''}.`,'bad')}
 const el=document.getElementById('feudLayer');if(el)el.remove();save();pushState();render()}

// het gevecht: uitslag meteen vastleggen, daarna 3 rondes laten zien
function feudFight(){const F=S.feud;if(!F||inJail()||S.hp<feudNeed(F.d)||S.energy<FEUD_EN)return;
 const f=F.fam&&FAMILIES.find(x=>x.id===F.fam),inFam=f&&S.family===f.id,p=feudP(F.d),rounds=[];let w=0,l=0,dmg=0;
 while(w<2&&l<2){const ok=Math.random()<p;rounds.push(ok);if(ok){w++;dmg+=rnd(3,7)}else{l++;dmg+=rnd(9,16)}}
 const won=w>=2;delete S.feud;S.energy-=FEUD_EN;S.hp=Math.max(5,S.hp-dmg);S.stats.feudFights=(S.stats.feudFights||0)+1;let got='';
 if(won){const [a,b]=feudLoot(F),g=Math.round(rnd(a,b)),cr=credGain(6+F.d*3,'netjes');S.cash+=g;S.cred+=cr;S.stats.feudWins=(S.stats.feudWins||0)+1;addXp(120+F.d*60);
  if(inFam)famAddEer(15+F.d*8);got=`+${fmt(g)} · +${cr} cred · +${120+F.d*60} XP${inFam?` · +${15+F.d*8} eer`:''}`;
  log(`Bendegevecht tegen de mensen van ${F.t} gewonnen (${got})`,'ok')}
 else{const [a]=feudLoot(F),lose=Math.min(Math.round(S.cash*.05),a);S.cash-=lose;if(inFam)famAddEer(5);addXp(40+F.d*15);
  got=`−${dmg}% gezondheid${lose?' · −'+fmt(lose):''}${inFam?' · +5 eer omdat je er was':''}`;log(`Bendegevecht tegen de mensen van ${F.t} verloren (${got})`,'bad')}
 save();pushState();
 const el=document.getElementById('feudLayer')||document.body.appendChild(Object.assign(document.createElement('div'),{id:'feudLayer'}));
 el.innerHTML=`<div class="fd-card fight"><div class="fd-top"><i class="fd-ic">${feudIc()}</i><div><span class="label">Bendegevecht</span><h2>${inFam?esc(f.n):'Jij'} tegen de mensen van ${esc(F.t)}</h2></div></div>
  <div class="fd-arena"><div class="fd-side a"><b>${inFam?esc(f.n):'Jij'}</b></div><div class="fd-tug"><i id="fdTug"></i></div><div class="fd-side b"><b>${esc(F.t.split(' ').slice(-1)[0])}</b></div></div>
  <ol class="fd-rounds">${rounds.map((r,i)=>`<li id="fdR${i}"><span>Ronde ${i+1}</span><b></b></li>`).join('')}</ol>
  <div class="fd-res" id="fdRes"></div></div>`;
 const RW=['Jullie drijven ze de straat uit','Ze vluchten een portiek in','Hun auto rijdt met piepende banden weg'],RL=['Ze hebben de overhand','Je wordt geraakt in je schouder','Jullie moeten terug naar de hoek'];
 let pos=50,i=0;const tug=()=>{const t=el.querySelector('#fdTug');if(t)t.style.left=pos+'%'};tug();
 const next=()=>{if(i>=rounds.length){const r=el.querySelector('#fdRes');if(r)r.innerHTML=`<h3 class="${won?'ok':'bad'}">${won?'Gewonnen':'Verloren'}</h3><p>${got}</p><button class="btn ${won?'':'red'}" onclick="feudClose()">Sluiten</button>`;
   try{won?SFX.win(3):SFX.lose()}catch(e){}if(won)toast('Bendegevecht gewonnen: '+got,'lvl');else toast('Bendegevecht verloren: '+got,'bad');return}
  const ok=rounds[i],li=el.querySelector('#fdR'+i);pos=Math.max(8,Math.min(92,pos+(ok?18:-18)));tug();
  if(li){li.className=ok?'ok':'bad';li.querySelector('b').textContent=ok?RW[Math.floor(Math.random()*RW.length)]:RL[Math.floor(Math.random()*RL.length)]}
  try{SFX.shot()}catch(e){}i++;setTimeout(next,1100)};
 setTimeout(next,700)}

// tijd verlopen = niet komen opdagen (zat je vast, dan regelt de familie het zonder jou)
setInterval(()=>{if(typeof S==='undefined'||!S||!S.feud)return;const F=S.feud,left=F.until-now();
 ['fdLeft','fdLeft2'].forEach(id=>{const e=document.getElementById(id);if(e)e.textContent=fmtClock(left)});
 if(left>0)return;
 if(inJail()){delete S.feud;log(`Je zat vast tijdens het bendegevecht tegen de mensen van ${F.t}. Het is zonder jou geregeld.`,'info');const el=document.getElementById('feudLayer');if(el)el.remove();save();pushState();render();return}
 feudRefuse(true)},1000);
