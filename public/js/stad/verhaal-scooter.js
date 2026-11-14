// Verhaal "De Bezorger": de scooter van Bella Napoli.
// - Avond 3 (stap h3_scooter, of later via de plek bij de zaak): Giovanni geeft je Mario's scooter. Jij kiest:
//   rijbewijs halen (€1500 verhaalgeld, spoedcursus bij zijn neef Salvo), zwart rijden, of voorlopig blijven fietsen.
// - Zwart rijden: af en toe een politiecontrole (agent met een stopteken en een politieauto aan de kant).
//     stoppen     → gesprek: eerlijk en rustig blijven kan je eruit praten; liegen of brutaal zijn = €350 boete
//     doorrijden  → een politieauto zit achter je aan: ben je ze kwijt, dan niks (wel hitte); pakken ze je, dan €350 boete
// - Telefoon-app 'Vervoer': wisselen tussen fiets en scooter en alsnog je rijbewijs halen.
// Vlaggen: scooter (1 = mag je gebruiken), voertuig ('fiets'|'scooter'), rijbewijs (1), scooter_aanbod (1 = gesprek gehad),
//          controles, boetes, gevlucht, gewaarschuwd (aantal).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const $s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),hyp=Math.hypot,PI=Math.PI;
const wrap=a=>{while(a>PI)a-=PI*2;while(a<-PI)a+=PI*2;return a};
const eur=n=>'€'+Math.round(n).toLocaleString('nl-NL');
const PRIJS=1500,BOETE=350;
let ST,C,L,F;

/* =================== vervoer: welke, en spawnen =================== */
const heeft=()=>!!(F&&F('scooter'));
const voertuig=()=>heeft()&&F('voertuig')==='scooter'?'scooter':'fiets';
const zwart=()=>voertuig()==='scooter'&&!F('rijbewijs');
function zetVoorkeur(){try{G.fiets&&G.fiets.voorkeur(voertuig())}catch(e){}}
// het geparkeerde voertuig omwisselen (op dezelfde plek), of naast je zetten
function wissel(ty){if(!G.fiets)return false;if(G.fiets.actief()){G.toast&&G.toast('Stap eerst af','info');return false}
  F('voertuig',ty);zetVoorkeur();const p=G.fiets.pos(),P=G.P;
  if(G.binnen&&G.binnen.waar&&G.binnen.waar()){G.toast&&G.toast(ty==='scooter'?'De scooter staat buiten klaar':'Je fiets staat buiten klaar','ok');if(p)G.fiets.spawn(p.x,p.z,p.ry,{kleur:'#c0261e',type:ty});return true}
  if(p&&hyp(p.x-P.x,p.z-P.z)<60)G.fiets.spawn(p.x,p.z,p.ry,{kleur:'#c0261e',type:ty});else{const q=M.nearestWalk(P.x+1.6,P.z+1.2,6)||{x:P.x+1.6,z:P.z+1.2};G.fiets.spawn(q.x,q.z,P.ry||0,{kleur:'#c0261e',type:ty})}
  return true}

/* =================== het aanbod van Giovanni =================== */
// Salvo, de neef van Giovanni met de rijschool: een eigen look (in de cast van stad-leeftijd.js, anders lijkt hij op Giovanni)
function castErbij(){const CA=C.actors;
  try{const U=G.uiterlijk;if(U&&U.CAST&&!U.CAST.salvo)U.CAST.salvo={n:'Salvo',col:'#7fd1ff',rol:'Rijschool Salvo',born:1983,skin:'#c98e62',eye:'#3a2a1a',hair:'#16161a',hs:'kort',fh:'kortbaard',mood:'blij',fw:18,jaw:'hoekig',h:1.02,w:1.04,
    kl:{std:{k:'jack',c:'#1f4f8a',c2:'#f2c230',b:'jeans',bc:'#2c3a4d',s:'sneaker',sc:'#e8e4da',s2:'#1f4f8a'}}}}catch(e){}
  if(CA.salvo)return;
  CA.salvo={n:'Salvo',col:'#7fd1ff',rol:'Rijschool Salvo',look:{skin:'#c98e62',hair:'#16161a',hs:'kort',fh:'baard',eye:'#3a2a1a',mood:'blij',top:{kind:'jacket',c:'#1f4f8a',c2:'#f2c230'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'sneaker',c:'#e8e4da',c2:'#1f4f8a'}},
    face:{skin:'#c98e62',hair:'#16161a',hs:'kort',fh:'baard',eye:'#3a2a1a',top:'#1f4f8a',col:'jas',age:1,fw:18,jaw:'hoekig'}}}
let bezig=false;
// o.plek: {x,z} waar de scooter staat (voor de zaak); speelt het gesprek en geeft de keuze terug
async function aanbod(o){o=o||{};if(bezig||F('scooter_aanbod'))return null;bezig=true;try{return await aanbod2(o)}finally{bezig=false}}
async function aanbod2(o){castErbij();const l=L.P(),n=L.A('napoli',419,492);
  const sp=L.walk(l.x+2.2,l.z+1.4,4),gp=L.walk(sp.x+1.4,sp.z-1.2,3);const sc=G.scooterModel?G.scooterModel({kleur:'#c62a22'}):L.scooter('#c62a22');
  sc.position.set(sp.x,0,sp.z);sc.rotation.y=L.naar(sp,l)+PI/2;G.scene().add(sc);
  const geld=ST.geld(),genoeg=geld>=PRIJS;
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:L.naar(l,sp)},{actor:'giovanni',at:[gp.x,gp.z],ry:L.naar(gp,l),anim:'idle'},
    L.rond(sp.x,sp.z,L.naar(sp,l)+.9,4.2,1.7,.9),{fade:'in',t:.4},
    {say:'giovanni',text:'Ragazzo! Kijk eens. Mario\'s scooter. Nieuwe band, nieuwe ketting. Hij loopt als een zonnetje.',t:3.4,mood:'blij'},
    {anim:'giovanni',a:'point',naar:[sp.x,sp.z]},
    {say:'giovanni',text:'Mario komt niet meer terug. Met die scooter rijd je twee keer zoveel ritten. Meer fooi.',t:3.2},
    L.rond(l.x,l.z,L.naar(l,gp)+1.1,3.0,1.75,1.5),
    {say:'luca',text:'Ik heb geen rijbewijs, Giovanni.',t:2},
    {anim:'giovanni',a:'talk'},
    {say:'giovanni',text:'Mijn neef Salvo heeft een rijschool. Spoedcursus: theorie, één les, examen. Vijftienhonderd euro.',t:3.6},
    {say:'giovanni',text:'Of… je rijdt zonder. Ik zeg niks. Maar stopt de politie je: driehonderdvijftig boete. En dan ken ik jou niet.',t:4,mood:'koel'},
    {keuze:[{t:'Rijbewijs halen · '+eur(PRIJS),id:'rb',sub:genoeg?'Je hebt '+eur(geld):'Je hebt maar '+eur(geld)},
      {t:'Zwart rijden',id:'zwart',sub:'Kans op controles · '+eur(BOETE)+' boete'},
      {t:'Ik blijf fietsen',id:'fiets',sub:'Later kan het nog: app Vervoer'}],wie:'luca',text:'Vijftienhonderd. Of de gok.'}],{blijf:true});
  F('scooter',1);F('scooter_aanbod',1);let keus=r;
  if(r==='rb'&&!genoeg){await C.play([{say:'giovanni',text:'Dat heb je nog niet, ragazzo. Spaar eerst. Of rij zwart, maar dan weet ik van niks.',t:3.2},
      {keuze:[{t:'Dan rij ik zwart',id:'zwart',sub:'Kans op controles'},{t:'Ik spaar eerst',id:'fiets',sub:'Fietsen; later via app Vervoer'}],wie:'luca',text:''}],{blijf:true});keus=C.laatste}
  if(keus==='rb'){ST.geld(-PRIJS,'rijbewijs scooter');await C.play([{say:'giovanni',text:'Bravo! Ik bel Salvo, hij komt meteen. Streng, maar eerlijk.',t:2.6,mood:'blij'},{fade:'out',t:.5},{weg:'giovanni'}],{blijf:true});
    sc.parent&&sc.parent.remove(sc);await examen({inScene:true});F('voertuig','scooter')}
  else if(keus==='zwart'){await C.play([{say:'luca',text:'Ik pas wel op.',t:1.6,mood:'koel'},{say:'giovanni',text:'Dat zeggen ze allemaal. Helm op. Altijd.',t:2.2},
      {fade:'out',t:.4},{weg:'giovanni'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);F('voertuig','scooter');F('rijbewijs',null);sc.parent&&sc.parent.remove(sc)}
  else{await C.play([{say:'luca',text:'Ik fiets nog even. Mijn benen zijn gratis.',t:2},{say:'giovanni',text:'Ha! Hij staat hier als je van gedachten verandert.',t:2.4,mood:'blij'},
      {fade:'out',t:.4},{weg:'giovanni'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);F('voertuig','fiets');sc.parent&&sc.parent.remove(sc)}
  zetVoorkeur();
  // het gekozen voertuig staat waar de scooter stond
  try{if(G.fiets&&!G.fiets.actief())G.fiets.spawn(sp.x,sp.z,L.naar(sp,l),{kleur:'#c0261e',type:voertuig()})}catch(e){}
  if(voertuig()==='scooter')L.sein(F('rijbewijs')?'Scooter · rijbewijs op zak':'Scooter · zonder rijbewijs: let op controles',F('rijbewijs')?'#3fe395':'#ffd35a');
  return keus}

// spoedcursus bij Salvo: drie vragen, Salvo legt uit; daarna het pasje
async function examen(o){o=o||{};castErbij();const vr=[
  {q:'Kruispunt zonder borden. Een tram komt van links. Wie gaat er voor?',a:[['De tram','ok'],['Jij, want je komt van rechts','nee'],['Wie het eerst toetert','nee']],
   uit:'De tram. Altijd. Een tram remt niet voor een pizzajongen.'},
  {q:'Moet je een helm op als je op de scooter rijdt?',a:[['Ja, altijd','ok'],['Alleen buiten de stad','nee'],['Alleen als het regent','nee']],
   uit:'Altijd. Ook voor twee straten. Vooral voor twee straten.'},
  {q:'Een agent steekt zijn hand omhoog en kijkt naar jou. Wat doe je?',a:[['Rustig stoppen','ok'],['Gas geven, hij bedoelt een ander','nee'],['Toeteren','nee']],
   uit:'Stoppen. Een stopteken van de politie gaat boven alles.'}];
  let goed=0;
  // Salvo komt naar je toe (met zijn lesscooter): de vragen worden buiten gesteld, in beeld (geen zwart scherm)
  const l=L.P(),fx=Math.sin(l.ry||0),fz=Math.cos(l.ry||0),sp=L.walk(l.x+fx*2.1-fz*.6,l.z+fz*2.1+fx*.6,3),ls=L.walk(sp.x-fz*1.8,sp.z+fx*1.8,3);
  const les=G.scooterModel?G.scooterModel({kleur:'#2a6ac0'}):L.scooter('#2a6ac0');les.position.set(ls.x,0,ls.z);les.rotation.y=L.naar(ls,l)+PI/2;G.scene().add(les);
  const opSalvo=L.rond(sp.x,sp.z,L.naar(sp,l)+.75,3.3,1.75,1.4),opLuca=L.rond(l.x,l.z,L.naar(l,sp)-1.15,3.1,1.75,1.5);
  await C.play([{fade:'out',t:.3},{speler:false},{actor:'luca',at:[l.x,l.z],ry:L.naar(l,sp)},{actor:'salvo',at:[sp.x,sp.z],ry:L.naar(sp,l),anim:'idle'},
    opSalvo,{fade:'in',t:.4},{titel:'Rijschool Salvo',sub:'Spoedcursus scooter',t:2.2},
    {anim:'salvo',a:'talk'},{say:'salvo',text:'Zo. Jij bent Luca? Giovanni zegt dat je snel bent. Drie vragen, één rondje, en je bent klaar.',t:3.6,mood:'blij'}],{blijf:true});
  let i=0;for(const v of vr){const opts=v.a.slice().sort(()=>Math.random()-.5);
    await C.play([i%2?opLuca:opSalvo,{keuze:opts.map(([t,id])=>({t,id})),wie:'salvo',text:v.q}],{blijf:true});const ok=C.laatste==='ok';if(ok)goed++;i++;
    await C.play([{anim:'salvo',a:ok?'talk':'armen'},{say:'salvo',text:(ok?'Goed. ':'Nee. ')+v.uit,t:2.8,mood:ok?'blij':'neutraal'}],{blijf:true})}
  await C.play([{say:'salvo',text:'En nu een rondje om het blok. Ik rij achter je aan.',t:2.4},{fade:'out',t:.4},
    {say:null,text:goed===3?'Een rondje om het blok. Luca rijdt alsof hij nooit anders heeft gedaan.':'Een rondje om het blok. Bij de rotonde gaat het bijna mis, maar Salvo knikt.',t:2.6},
    opLuca,{fade:'in',t:.4},{anim:'salvo',a:'give',prop:'envelop',naar:'luca'},{snd:'ok'},{titel:'Geslaagd',sub:'Rijbewijs scooter · op zak',t:2.4},{anim:'luca',a:'idle',prop:null},
    {say:'salvo',text:'Gefeliciteerd. En onthoud: helm op, en niet harder dan je engeltje kan vliegen.',t:3,mood:'blij'},
    {fade:'out',t:.3},{weg:'salvo'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);
  les.parent&&les.parent.remove(les);
  F('rijbewijs',1);F('examen_goed',goed);ST.meter('imago',2);try{G.snd&&G.snd.fx('cash')}catch(e){}
  if(!o.inScene){F('voertuig','scooter');zetVoorkeur()}
  L.sein('Rijbewijs scooter op zak · geen controles meer','#3fe395')}

/* =================== politiecontrole (zwart rijden) =================== */
const CTRL={on:false,ritT:0,volgende:rr(45,80),laatste:0,stap:null};
let raf=0,tPrev=0;
function magControle(){if(!ST||!G.fiets||!G.fiets.actief()||G.fiets.type()!=='scooter'||!zwart())return false;
  if(G.paused||(C.active&&C.active())||window.__chase)return false;if(G.binnen&&G.binnen.waar&&G.binnen.waar())return false;
  try{if(G.police&&G.police.active&&G.police.active())return false}catch(e){}
  if(ST.inZiekenhuis&&ST.inZiekenhuis())return false;
  const d=(ST.doelTekst&&ST.doelTekst())||'';if(/achtervolg|pak de dief|vlucht/i.test(d))return false;
  return true}
// een plek vóór je op straat: de agent op de stoep, de auto aan de kant van de weg
function plekVoor(){const P=G.P,ry=P.ry||0,fx=Math.sin(ry),fz=Math.cos(ry);
  for(let d=40;d<=64;d+=4){const x=P.x+fx*d,z=P.z+fz*d;if(!M.canStand(x,z,.4))continue;
    // vrij pad tussen jou en daar
    let vrij=true;for(let k=6;k<d;k+=3){if(!M.canStand(P.x+fx*k,P.z+fz*k,.3)){vrij=false;break}}if(!vrij)continue;
    const rx=fz,rz=-fx;let car=null,ag=null;
    for(const s of [1,-1]){const cx=x+rx*s*2.6,cz=z+rz*s*2.6,ax=x+rx*s*1.2+fx*3,az=z+rz*s*1.2+fz*3;if(M.canStand(cx,cz,.9)&&M.canStand(ax,az,.3)){car={x:cx,z:cz};ag={x:ax,z:az};break}}
    if(!car)continue;return {x,z,car,ag,ry}}
  return null}
function kaart(html){let el=$s('vsCtrl');if(!html){if(el)el.remove();return null}if(!el){el=document.createElement('div');el.id='vsCtrl';el.className='vs-ctrl';document.body.appendChild(el)}el.innerHTML=html;return el}
function css(){if($s('vsCss'))return;const s=document.createElement('style');s.id='vsCss';s.textContent=`
.vs-ctrl{position:fixed;left:50%;top:max(96px,calc(env(safe-area-inset-top,0px) + 96px));transform:translateX(-50%);z-index:58;width:min(420px,calc(100vw - 24px));background:#0e1220f2;border:2px solid #4d7dff;box-shadow:4px 4px 0 #000a;color:#e8e4da;padding:10px 12px;font:600 13px/1.35 var(--f-body,system-ui);animation:vsIn .2s steps(4)}
@keyframes vsIn{from{transform:translate(-50%,-10px);opacity:0}}
.vs-ctrl b{display:block;font:800 15px var(--f-mono,monospace);letter-spacing:.04em;color:#a9c4ff;text-transform:uppercase}
.vs-ctrl b i{display:inline-block;width:10px;height:10px;margin-right:6px;background:#ff3a3a;animation:vsBl .5s steps(2) infinite}.vs-ctrl b i+i{background:#3a6aff;animation-delay:.25s}
@keyframes vsBl{50%{opacity:.2}}
.vs-ctrl p{margin:4px 0 8px;color:#c9cdd6}.vs-ctrl .vs-b{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.vs-ctrl button{min-height:44px;font:800 14px var(--f-mono,monospace);border:2px solid #000;box-shadow:2px 2px 0 #000;cursor:pointer;color:#111}
.vs-ctrl button.s{background:#7fd1ff}.vs-ctrl button.d{background:#ff8a6a}.vs-ctrl .vs-t{height:4px;background:#1b2236;margin-top:8px}.vs-ctrl .vs-t i{display:block;height:100%;background:#4d7dff}
.vs-ctrl.chase{border-color:#ff3a3a}.vs-ctrl.chase b{color:#ffb0a0}
@media (max-width:700px){.vs-ctrl{top:auto;bottom:calc(150px + env(safe-area-inset-bottom,0px))}}
.vv-app{display:grid;gap:10px;padding:4px 2px}.vv-app .vv-k{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.vv-app .vv-o{display:grid;gap:4px;padding:10px;border:2px solid #2c3140;background:#141822;color:#e8e4da;text-align:left;cursor:pointer;font:inherit}
.vv-app .vv-o.on{border-color:#ff4fd8;background:#24142a}.vv-app .vv-o[disabled]{opacity:.45;cursor:default}
.vv-app .vv-o b{font:800 14px var(--f-mono,monospace)}.vv-app .vv-o small{color:#9aa1ab}
.vv-app .vv-s{padding:10px;border:2px solid #2c3140;background:#10141c}.vv-app .vv-s b{display:block;margin-bottom:2px}.vv-app .vv-s.ok{border-color:#3fe395}.vv-app .vv-s.bad{border-color:#ffb84a}
.vv-app .vv-s p{margin:2px 0 8px;color:#9aa1ab;font-size:12px}.vv-app .vv-n{color:#9aa1ab;font-size:12px}
`;document.head.appendChild(s)}

async function controle(){const pl=plekVoor();if(!pl)return false;css();CTRL.on=true;CTRL.laatste=performance.now();F('controles',(F('controles')||0)+1);
  // decor: politieauto (zwaailicht) aan de kant en een agent met een stopteken
  const car=G.carMesh?G.carMesh('#eef0f2','sedan',true):null;const cry=pl.ry+(Math.random()<.5?0:PI);
  if(car){car.position.set(pl.car.x,0,pl.car.z);car.rotation.y=cry;G.scene().add(car)}
  const blok={x:pl.car.x,z:pl.car.z,ry:cry,kind:'sedan',parked:true,ctrl:1};try{(G.parked||(G.parked=[])).push(blok)}catch(e){}
  const ag=C.persoon('agent',{x:pl.ag.x,z:pl.ag.z,ry:wrap(pl.ry+PI),anim:'handenop'});
  try{G.snd&&G.snd.fx('whistle')}catch(e){}
  const opruimen=()=>{try{ag&&ag.weg&&ag.weg()}catch(e){}if(car&&car.parent)car.parent.remove(car);try{const i=(G.parked||[]).indexOf(blok);if(i>=0)G.parked.splice(i,1)}catch(e){}kaart(null)};
  const TMAX=13;let t=0,dichtbij=false,res=null,stilT=0;
  const el=kaart(`<b><i></i><i></i>Politiecontrole</b><p>Een agent geeft je een stopteken. Je rijdt zonder rijbewijs.</p><div class="vs-b"><button class="s" data-v="stop">Stoppen</button><button class="d" data-v="weg">Doorrijden</button></div><div class="vs-t"><i id="vsCtrlT"></i></div>`);
  el.onclick=e=>{const b=e.target.closest('[data-v]');if(b)res=b.dataset.v};['pointerdown','touchstart'].forEach(n=>el.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
  res=await new Promise(done=>{const iv=setInterval(()=>{if(res){clearInterval(iv);done(res);return}if(G.paused||(C.active&&C.active()))return;t+=.1;
      const P=G.P,d=hyp(P.x-pl.ag.x,P.z-pl.ag.z),v=G.fiets&&G.fiets.actief()?G.fiets.snelheid():0;const bar=$s('vsCtrlT');if(bar)bar.style.width=Math.max(0,1-t/TMAX)*100+'%';
      if(ag&&ag.draai)try{ag.draai(Math.atan2(P.x-ag.x,P.z-ag.z))}catch(e){}
      if(d<15)dichtbij=true;
      if(d<10&&v<4){stilT+=.1;if(stilT>.4){clearInterval(iv);done('stop');return}}else stilT=0;
      if(!G.fiets||!G.fiets.actief()){if(d<14){clearInterval(iv);done('stop');return}}
      if(dichtbij&&d>18&&v>8){clearInterval(iv);done('weg');return}
      if(t>=TMAX){clearInterval(iv);done(d<14?'stop':'weg');return}},100)});
  if(res==='stop'){kaart(null);await gesprek(pl,ag,car);opruimen()}
  else{kaart(null);try{ag&&ag.doe&&ag.doe('point')}catch(e){}try{G.snd&&G.snd.fx('whistle')}catch(e){}try{G.fx2&&G.fx2.float('HÉ! Stoppen!',pl.ag.x,pl.ag.z,'#a9c4ff')}catch(e){}
    if(ag&&ag.weg)setTimeout(()=>{try{ag.weg()}catch(e){}},4000);try{const i=(G.parked||[]).indexOf(blok);if(i>=0)G.parked.splice(i,1)}catch(e){}
    await achtervolging(car,pl);}
  CTRL.on=false;CTRL.ritT=0;CTRL.volgende=rr(110,200);return true}

// stoppen: het gesprek met de agent
async function gesprek(pl,ag,car){try{if(G.fiets&&G.fiets.actief())G.fiets.af(true)}catch(e){}const l=L.P();try{ag&&ag.weg&&ag.weg()}catch(e){}
  const a=L.walk(l.x+Math.sin(l.ry+.9)*1.7,l.z+Math.cos(l.ry+.9)*1.7,3),waarsch=F('gewaarschuwd')||0;
  const sc1=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:L.naar(l,a)},{actor:'agent',at:[a.x,a.z],ry:L.naar(a,l),anim:'idle'},
    L.rond(a.x,a.z,L.naar(a,l)+.8,3.4,1.7,1.4),{fade:'in',t:.3},
    {say:'agent',text:waarsch?'Hé. Jij weer? Pizzajongen op een scooter.':'Goedenavond. Controle. Rijbewijs en kenteken, graag.',t:2.6},
    ...(waarsch?[{say:'agent',text:'Laat maar eens zien dan. Rijbewijs.',t:2}]:[]),
    {keuze:[{t:'"Dat ligt thuis. Ik kan het morgen laten zien."',id:'lieg'},{t:'"Eerlijk gezegd… ik heb er nog geen."',id:'eerlijk'},{t:'"Waarom houdt u míj aan? Ik doe niks."',id:'brutaal'}],wie:'luca',text:''}],{blijf:true});
  let vrij=false;
  if(sc1==='brutaal'){await C.play([{anim:'agent',a:'armen'},{say:'agent',text:'Omdat ik dat mag. En nu wil ik helemaal je papieren zien.',t:2.6,mood:'boos'},{say:null,text:'Geen rijbewijs. Natuurlijk niet.',t:2}],{blijf:true})}
  else if(sc1==='lieg'){await C.play([{anim:'agent',a:'bel',prop:'telefoon'},{say:'agent',text:'Even in het systeem kijken… Luca, zeventien. Er staat geen rijbewijs op jouw naam.',t:3.4},
      {anim:'agent',a:'armen',prop:null},{say:'agent',text:'Dus je liegt ook nog.',t:1.8,mood:'boos'}],{blijf:true})}
  else{const sc2=await C.play([{say:'agent',text:'Geen rijbewijs. En toch rij je. Waarom?',t:2.2},
      {keuze:[{t:'"Mijn vader is ziek. Ik werk voor het geld thuis. Ik doe snel examen."',id:'waar'},{t:'"Iedereen doet het."',id:'iedereen'},{t:'"Mijn baas zei dat het mocht."',id:'baas'}],wie:'luca',text:''}],{blijf:true});
    if(sc2==='waar'&&waarsch<2){vrij=true;await C.play([{say:null,text:'De agent kijkt naar de rode jas. Naar de pizzadozen. Hij zucht.',t:2.8},
        {say:'agent',text:'Oké. Deze keer een waarschuwing. Haal dat rijbewijs. Volgende keer schrijf ik je wel op.',t:3.4},{say:'luca',text:'Dank u. Echt.',t:1.6}],{blijf:true})}
    else if(sc2==='waar'){await C.play([{say:'agent',text:'Dat verhaal ken ik al van je. Nee, nu schrijf ik je op.',t:2.6,mood:'boos'}],{blijf:true})}
    else if(sc2==='baas'){await C.play([{say:'agent',text:'Dan krijgt je baas ook een briefje. Maar jij eerst.',t:2.4,mood:'boos'}],{blijf:true});ST.meter('imago',-2)}
    else{await C.play([{say:'agent',text:'Iedereen? Dan begin ik bij jou.',t:2,mood:'boos'}],{blijf:true})}}
  if(vrij){F('gewaarschuwd',waarsch+1);ST.meter('imago',1);await C.play([{fade:'out',t:.3},{weg:'agent'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);L.sein('Waarschuwing · je mag door','#3fe395')}
  else{await C.play([{anim:'agent',a:'give',prop:'envelop',naar:'luca'},{snd:'click'},{say:'agent',text:'Rijden zonder rijbewijs. Driehonderdvijftig euro. Fijne avond nog.',t:3,mood:'neutraal'},
      {fn:()=>boete('boete: zwart rijden')},{fade:'out',t:.3},{weg:'agent'},{weg:'luca'},{speler:true},{fade:'in',t:.3}])}
  if(car&&car.parent)car.parent.remove(car)}
function boete(why){const had=ST.geld();ST.geld(-BOETE,why);F('boetes',(F('boetes')||0)+1);ST.meter('hitte',3);if(had<BOETE)L.sein('Niet genoeg geld: alles wat je had is weg','#ff6a5a');else L.sein('Boete · '+eur(BOETE),'#ff6a5a')}

// doorrijden: een politieauto achter je aan
function achtervolging(car,pl){return new Promise(res=>{if(!car){res('weg');return}F('gevlucht',(F('gevlucht')||0)+1);ST.meter('hitte',4);document.body.classList.add('sd-siren');
  const el=kaart(`<b><i></i><i></i>Politie achter je aan</b><p>Schud ze af: smalle straten, stegen, parken. Ze moeten je niet inhalen.</p><div class="vs-t"><i id="vsCtrlT" style="background:#ff3a3a"></i></div>`);el.classList.add('chase');
  const c={x:car.position.x,z:car.position.z,ry:car.rotation.y,v:0,pad:[],pi:0,padT:0};let t=0,ver=0,dicht=0,blink=0,klaar=false;const WACHT=1.8;// de agent stapt eerst in
  const stop=r=>{if(klaar)return;klaar=true;cancelAnimationFrame(c.raf);document.body.classList.remove('sd-siren');try{G.snd&&G.snd.siren(null)}catch(e){}kaart(null);
    if(r==='weg'){L.sein('Je bent ze kwijt','#3fe395');ST.meter('hitte',2);setTimeout(()=>{if(car.parent)car.parent.remove(car)},100);res('weg')}
    else{gepakt(car).then(()=>res('gepakt'))}};
  let last=performance.now();const step=()=>{if(klaar)return;c.raf=requestAnimationFrame(step);const now=performance.now(),dt=Math.min(.05,(now-last)/1000);last=now;if(G.paused||(C.active&&C.active()))return;t+=dt;
    const P=G.P,d=hyp(P.x-c.x,P.z-c.z);
    blink+=dt;{const bar=car.userData&&car.userData.bar;if(bar){const on=Math.floor(blink*6)%2;bar[0].visible=!!on;bar[1].visible=!on}}
    if(t<WACHT){try{G.snd&&G.snd.siren&&G.snd.siren(d,0)}catch(e){}return}
    // route opnieuw berekenen
    c.padT-=dt;if(c.padT<=0){c.padT=.6;const p=M.findPath(c.x,c.z,P.x,P.z,'fiets');c.pad=p||[];c.pi=0}
    let n=c.pad[c.pi];while(n&&hyp(n.x-c.x,n.z-c.z)<1.2){c.pi++;n=c.pad[c.pi]}if(!n)n={x:P.x,z:P.z};
    const dx=n.x-c.x,dz=n.z-c.z,dd=hyp(dx,dz)||1,want=Math.atan2(dx,dz),turn=Math.abs(wrap(want-c.ry));
    const vmax=(turn>.9?6:turn>.45?9.5:13.4)*(d<10?.8:1);c.v+=(vmax-c.v)*Math.min(1,dt*(c.v<vmax?1.6:4));
    c.ry+=wrap(want-c.ry)*Math.min(1,dt*5);c.x+=Math.sin(c.ry)*c.v*dt;c.z+=Math.cos(c.ry)*c.v*dt;
    car.position.set(c.x,0,c.z);car.rotation.y=c.ry;
    try{if(G.snd&&G.snd.siren){const rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw);G.snd.siren(d,((c.x-P.x)*rx+(c.z-P.z)*rz)/Math.max(1,d))}}catch(e){}
    const tb=$s('vsCtrlT');if(tb)tb.style.width=clamp(1-ver/4,0,1)*100+'%';
    if(d>60)ver+=dt;else ver=Math.max(0,ver-dt*2);
    const v=G.fiets&&G.fiets.actief()?G.fiets.snelheid():0;
    if(d<3.2&&v<14)dicht+=dt;else dicht=Math.max(0,dicht-dt);
    if(ver>=4||d>120||t>75){stop('weg');return}
    if(t>WACHT+1.5&&(dicht>.8||(d<1.6&&v<20)||(!G.fiets||!G.fiets.actief())&&d<6)){stop('gepakt');return}};
  c.raf=requestAnimationFrame(step)})}
async function gepakt(car){try{if(G.fiets&&G.fiets.actief())G.fiets.af(true)}catch(e){}const l=L.P();const a=L.walk(l.x+Math.sin(l.ry-.9)*1.8,l.z+Math.cos(l.ry-.9)*1.8,3);
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:L.naar(l,a)},{actor:'agent',at:[a.x,a.z],ry:L.naar(a,l),anim:'armen'},L.rond(a.x,a.z,L.naar(a,l)+.8,3.4,1.7,1.4),{fade:'in',t:.3},
    {say:'agent',text:'Zo. Klaar met racen? Zonder rijbewijs, en dan ook nog wegrijden.',t:3,mood:'boos'},
    {say:'luca',text:'…',t:1.2},{anim:'agent',a:'give',prop:'envelop',naar:'luca'},{snd:'click'},
    {say:'agent',text:'Driehonderdvijftig euro. En als ik je nog één keer zie wegrijden, staat die scooter bij ons.',t:3.4,mood:'boos'},
    {fn:()=>boete('boete: zwart rijden en doorgereden')},{fade:'out',t:.3},{weg:'agent'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);
  ST.meter('hitte',3);if(car&&car.parent)car.parent.remove(car)}

function lus(){raf=requestAnimationFrame(lus);const now=performance.now(),dt=Math.min(.1,(now-(tPrev||now))/1000);tPrev=now;if(CTRL.on)return;
  if(!magControle())return;const v=G.fiets.snelheid();if(v>14)CTRL.ritT+=dt;
  if(CTRL.ritT>CTRL.volgende&&now-CTRL.laatste>150000){CTRL.ritT=CTRL.volgende-6;controle().catch(e=>{console.error(e);CTRL.on=false})}}

/* =================== telefoon: app Vervoer =================== */
const IC='<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="9" width="4" height="4" fill="currentColor"/><rect x="11" y="9" width="4" height="4" fill="currentColor"/><rect x="5" y="7" width="7" height="3" fill="currentColor"/><rect x="9" y="3" width="2" height="5" fill="currentColor"/><rect x="8" y="3" width="4" height="1" fill="currentColor"/><rect x="3" y="10" width="2" height="2" fill="#0008"/><rect x="12" y="10" width="2" height="2" fill="#0008"/></svg>';
function appRender(scr,head){css();const h=heeft(),ty=voertuig(),rb=!!F('rijbewijs'),g=ST.geld();
  scr.innerHTML=head('Vervoer',h?(ty==='scooter'?'Scooter':'Fiets'):'Fiets')+`<div class="vv-app">
   <div class="vv-k"><button class="vv-o${ty==='fiets'?' on':''}" data-vv="fiets"><b>Fiets</b><small>Gratis · hard trappen kost energie</small></button>
   <button class="vv-o${ty==='scooter'?' on':''}" data-vv="scooter"${h?'':' disabled'}><b>Scooter</b><small>${h?'Sneller · geen energie nodig':'Nog niet: Giovanni heeft er misschien een'}</small></button></div>
   ${h?(rb?'<div class="vv-s ok"><b>Rijbewijs scooter</b><p>Op zak. Geen gedoe bij controles.</p></div>'
     :`<div class="vv-s bad"><b>Geen rijbewijs</b><p>Zwart rijden: kans op een politiecontrole (${eur(BOETE)} boete als het misgaat). Spoedcursus bij Salvo: ${eur(PRIJS)}. Je hebt ${eur(g)}.</p><button class="btn sm" data-vv="examen"${g<PRIJS?' disabled':''}>Rijbewijs halen · ${eur(PRIJS)}</button></div>`)
     :(F('scooter_aanbod')?'':'<div class="vv-s"><b>Scooter</b><p>Giovanni zei iets over Mario\'s scooter. Vraag het hem bij Bella Napoli (vanaf avond 3).</p></div>')}
   <p class="vv-n">Controles ${F('controles')||0} · boetes ${F('boetes')||0} · weggereden ${F('gevlucht')||0}</p></div>`}
function appClick(t,close){const b=t.closest('[data-vv]');if(!b||b.disabled)return false;const a=b.dataset.vv;
  if(a==='fiets'||a==='scooter'){if(a==='scooter'&&!heeft())return true;if(wissel(a))G.toast&&G.toast(a==='scooter'?'Je pakt de scooter':'Je pakt de fiets','ok');return true}
  if(a==='examen'){if((C.active&&C.active())||(G.fiets&&G.fiets.actief())){G.toast&&G.toast('Stap eerst af','info');return true}if(G.bezorg&&G.bezorg.actief&&G.bezorg.actief()){G.toast&&G.toast('Kan straks: maak eerst je rit af','info');return true}
    if(ST.geld()<PRIJS)return true;close();ST.geld(-PRIJS,'rijbewijs scooter');examen().then(()=>{zetVoorkeur();try{const p=G.fiets.pos();if(p)G.fiets.spawn(p.x,p.z,p.ry,{kleur:'#c0261e',type:'scooter'})}catch(e){}});return true}
  return false}

/* =================== plek bij de zaak (voor wie avond 3 al voorbij is) =================== */
let SP=null;
function plekBijZaak(){if(SP||!G.spot)return;const n=L.A('napoli',419,492);
  SP=G.spot({k:'vs_scooter',story:1,x:n.x+2,z:n.z+1.5,r:3.2,n:'Giovanni · de scooter',sub:'Mario\'s scooter',col:'#ff6a4a',h:1.6,prio:2,
    show:()=>{const s=ST.st();return !F('scooter_aanbod')&&((s.ch||1)>=2||(s.avond||1)>=3)&&!(C.active&&C.active())&&!(G.bezorg&&G.bezorg.actief&&G.bezorg.actief())&&!(G.binnen&&G.binnen.waar&&G.binnen.waar())&&!G.driving},
    act:()=>{aanbod().then(()=>{if(SP){G.unspot(SP);SP=null}})}})}

/* =================== opstarten =================== */
function init(){ST=G.story;C=G.cut;L=G.h1.lib;F=L.F;castErbij();zetVoorkeur();
  // het voertuig na laden goed zetten (de fietsplek wordt ook bewaard; type erbij)
  try{const s=ST.st(),sf=s.fiets;if(sf&&sf.type&&G.fiets&&G.fiets.pos()&&G.fiets.type()!==voertuig()){const p=G.fiets.pos();G.fiets.spawn(p.x,p.z,p.ry,{kleur:'#c0261e',type:voertuig()})}}catch(e){}
  if(G.phone&&G.phone.add)G.phone.add({k:'vervoer',n:'Vervoer',ic:IC,c:'#ff8a4a',story:1,after:'verhaal',render:appRender,click:appClick,badge:()=>0});
  plekBijZaak();css();raf=requestAnimationFrame(lus)}
G.verhaalScooter={aanbod,examen,voertuig,wissel,zwart,controle:()=>controle(),_CTRL:CTRL};
const wait=setInterval(()=>{if(!G.ready||!G.story||!G.story.st||!G.h1||!G.h1.lib||!G.fiets||!G.cut)return;clearInterval(wait);try{init()}catch(e){console.error('scooter',e)}},200);
})();
