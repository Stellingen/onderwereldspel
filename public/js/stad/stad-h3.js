// Verhaal "De Bezorger" · Seizoen 3 · Hoofdstuk 3 · De hoek (VIP en High roller).
// Luca (17) stopt bij de pizzeria en krijgt een eigen hoek in de Westbuurt. Nieuw: de hoek (voorraad, prijs, klanten, uitkijkers)
// met een leesspel per klant (student, verslaafde, agent in burger, concurrent). Verder: de Hoek-boys (deal of wegjagen),
// Inspecteur Bakker en het bord, Sami (waarschuwt of verkoopt je), een jongen van 13 die wil lopen, Giulia op het dak,
// en een klus met Nova. Geld-poort: de eerste voorraad kost €3.000.
// Release: LIVE hieronder. Zolang die uit staat, ziet de speler na Seizoen 2 "coming soon" (stad-h2.js).
(function(){
'use strict';
const LIVE=false;
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const $s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const PI=Math.PI;
let ST,C,B,L;
const live=()=>{if(LIVE)return true;try{return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('verhaal_s3_test')==='1'}catch(e){return false}};
const mag=()=>{try{return !!(G.story&&G.story.vip&&G.story.vip())}catch(e){return false}};
G.h3={live,mag,begin:()=>{if(!ST||!mag())return false;const s=ST.st();s.ch=3;try{save()}catch(e){}ST.goto('h3_start');return true}};
const pick=a=>a[Math.floor(Math.random()*a.length)];
let RUN=0;const nieuw=()=>++RUN;
function doelNaar(tekst,p,r){return new Promise(res=>{ST.doel(tekst,{x:p.x,z:p.z});const t0=RUN;const iv=setInterval(()=>{if(RUN!==t0){clearInterval(iv);res(false);return}
  if(G.cut&&G.cut.active())return;if(!B.waar()&&Math.hypot(G.P.x-p.x,G.P.z-p.z)<(r||8)){clearInterval(iv);L.fietsAf();res(true)}},250)})}
const baas=()=>L.F('envelop')==='verraden'?'ray':'rafiq';   // wie levert je hoek (hoofdstuk 1)

/* =================== cast erbij =================== */
function cast(){const CA=C.actors;const mk=(id,n,rol,col,look,face)=>{if(!CA[id])CA[id]={n,col,rol,look,face}};
  mk('hoekbaas','Yassin','Baas van de Hoek-boys','#ff9a5a',{skin:'#a8714c',hair:'#16161a',hs:'opgeschoren',fh:'ringbaard',eye:'#24160e',mood:'koel',top:{kind:'track',c:'#1a3a6a',c2:'#f1efe9'},legs:{kind:'track',c:'#1a3a6a',c2:'#f1efe9'},shoes:{kind:'sneaker',c:'#f1efe9'},head:{kind:'cap',c:'#1a3a6a'},nek:'goud ketting'},
    {skin:'#a8714c',hair:'#16161a',hs:'opgeschoren',fh:'ringbaard',eye:'#24160e',top:'#1a3a6a',col:'track',hat:'pet',hatC:'#1a3a6a',age:1,fw:18,chain:1});
  mk('jongen13','Milan','13 jaar','#7fd1ff',{skin:'#d9a27a',hair:'#3a2418',hs:'krul',eye:'#3a2414',mood:'blij',top:{kind:'hoodie',c:'#d6a63e'},legs:{kind:'track',c:'#2a2c30'},shoes:{kind:'sneaker',c:'#e8e4da'}},
    {skin:'#d9a27a',hair:'#3a2418',hs:'krul',eye:'#3a2414',top:'#d6a63e',col:'hoodie',age:0,fw:16});
  mk('prater','Ferry','Praat te veel','#c9c4b8',{skin:'#f1caa5',hair:'#8a6a4a',hs:'kort',fh:'stoppel',eye:'#3a4a60',mood:'blij',top:{kind:'tee',c:'#8a2a2a'},legs:{kind:'jeans',c:'#3a4a60'},shoes:{kind:'sneaker',c:'#3a3f48'}},
    {skin:'#f1caa5',hair:'#8a6a4a',hs:'kort',fh:'stoppel',eye:'#3a4a60',top:'#8a2a2a',col:'shirt',age:1,fw:20});
  mk('collega','Rechercheur De Vries','Recherche','#a9dcff',{skin:'#d9a27a',hair:'#3a2418',hs:'knot',eye:'#3a2414',mood:'neutraal',top:{kind:'jacket',c:'#3a3f48'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'boot',c:'#1a1a1c'}},
    {skin:'#d9a27a',hair:'#3a2418',hs:'knot',eye:'#3a2414',top:'#3a3f48',col:'blouse',age:1,v:1,fw:16})}

/* =================== de hoek: het leesspel per klant =================== */
// Elke klant heeft een houding (wat je ziet). Kies: verkopen, duurder, weigeren of wegsturen. Een agent in burger moet je weigeren.
const SOORT={
  student:{n:'Student',hint:['Rugtas, gehaast, telt muntjes','Kijkt op zijn telefoon, wil snel weg','Lacht te hard, vriendengroep op afstand'],goed:['verkoop','duur']},
  verslaafde:{n:'Vaste klant',hint:['Trillende handen, kijkt naar de grond','Te dunne jas, praat te veel','Biedt een horloge aan in plaats van geld'],goed:['verkoop','weiger']},
  agent:{n:'Agent in burger',hint:['Nette schoenen, kijkt telkens om','Oortje, vraagt "wat heb je allemaal?"','Te schoon, te rustig, staat te lang stil'],goed:['weiger','weg']},
  concurrent:{n:'Iemand van de concurrent',hint:['Vraagt naar je prijs en je leverancier','Koopt niks, kijkt naar je uitkijkers','Tatoeage van de Hoek-boys op zijn hand'],goed:['weg']}};
function hoekDienst(o){o=o||{};return new Promise(res=>{L.css();const n=o.n||6;const reeks=o.reeks||Array.from({length:n},(_,i)=>i===2?'agent':pick(['student','student','verslaafde','student','concurrent','verslaafde']));
  let voorraad=o.voorraad||10,geld=0,hitte=0,i=0,fout=0,klaar=false;const prijs=o.prijs||40;
  const el=L.mgOpen(`<h4>De hoek · ${o.titel||'jouw portiek'}</h4><p>Lees de klant. Agent in burger? Weigeren. Concurrent? Wegsturen.</p>
    <div class="h1-hp"><span id="h3n">Klant 1/${n}</span><span id="h3v">Voorraad ${voorraad}</span><span id="h3g">€0</span></div>
    <div class="h3-k" style="background:#1d1924;border:2px solid #3a3442;padding:10px;margin:8px 0;min-height:64px"><b id="h3s" style="font-size:15px"></b><div id="h3h" style="color:#c9c4b8;font-size:13px;margin-top:4px"></div><div id="h3w" style="color:#ffd35a;font-size:12px;margin-top:4px"></div></div>
    <div class="h1-warn" id="h3r"></div>
    <div class="h1-knop"><button data-a="verkoop">Verkopen<kbd>${touch?'':'1'}</kbd></button><button data-a="duur" style="background:#ff9a5a;border-color:#b86a3a">Duurder<kbd>${touch?'':'2'}</kbd></button><button class="b" data-a="weiger">Weigeren<kbd>${touch?'':'3'}</kbd></button><button class="r" data-a="weg">Wegsturen<kbd>${touch?'':'4'}</kbd></button></div>`,'hoek');
  const show=()=>{const k=reeks[i],S=SOORT[k];el.querySelector('#h3n').textContent='Klant '+(i+1)+'/'+n;el.querySelector('#h3s').textContent='Iemand komt aanlopen…';el.querySelector('#h3h').textContent=pick(S.hint);
    el.querySelector('#h3w').textContent=o.waarschuw&&o.waarschuw(k,i)||'';el.querySelector('#h3r').textContent='';L.fx('step')};
  const kies=a=>{if(klaar)return;const k=reeks[i],S=SOORT[k],ok=S.goed.includes(a);const r=el.querySelector('#h3r');
    if(k==='agent'&&(a==='verkoop'||a==='duur')){hitte+=25;fout++;r.textContent='Het was een agent in burger. Hij noteert je gezicht.';r.className='h1-warn';L.fx('bad')}
    else if(k==='concurrent'&&a!=='weg'){fout++;hitte+=5;r.textContent=a==='verkoop'||a==='duur'?'Hij koopt, en weet nu je prijs.':'Hij blijft rondhangen en telt je uitkijkers.';r.className='h1-warn';L.fx('jank')}
    else if((a==='verkoop'||a==='duur')&&voorraad>0){const p=a==='duur'?(k==='student'&&Math.random()<.75?prijs*1.5:0):(k==='verslaafde'?prijs*.6:prijs);
      if(p>0){voorraad--;geld+=p;hitte+=2;r.textContent='+'+L.eur(p)+(k==='verslaafde'?' (hij had niet meer)':'');r.className='h1-warn ok';L.fx('coin')}else{r.textContent='Te duur. Hij loopt weg.';r.className='h1-warn';L.fx('jank')}}
    else{r.textContent=ok?(k==='agent'?'Goed gezien. Dat was een agent.':'Netjes afgehandeld.'):'Je liet een klant gaan.';r.className='h1-warn'+(ok?' ok':'');if(ok)L.fx('ok')}
    el.querySelector('#h3v').textContent='Voorraad '+voorraad;el.querySelector('#h3g').textContent=L.eur(geld);i++;
    if(i>=n||voorraad<=0){klaar=true;setTimeout(()=>{removeEventListener('keydown',key,true);el.remove();res({geld,hitte,fout,voorraad})},900)}else setTimeout(show,900)};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(b)kies(b.dataset.a)});
  const key=e=>{const m={'1':'verkoop','2':'duur','3':'weiger','4':'weg'}[e.key];if(m){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)kies(m)}};addEventListener('keydown',key,true);show()})}
async function dienstOpHoek(t,o){o=o||{};G.frozen=1e9;const r=await hoekDienst(o);G.frozen=0;if(t!==RUN)return r;
  const deel=Math.round(r.geld*(L.F('h3_deel')||.5));if(deel)ST.geld(deel,'je deel van de hoek');if(r.hitte)ST.meter('hitte',Math.round(r.hitte/5));if(r.fout>1)ST.meter('dossier',4);
  ST.flag('h3_dienst',(ST.flag('h3_dienst')||0)+1);return r}

/* =================== de missies =================== */
async function mAfscheid(t){const N=L.A('napoli',419,492);if(!await doelNaar('Naar Bella Napoli',N,9))return;await L.binnen('napoli');if(t!==RUN)return;
  B.toon('napoli','giovanni',false);const g=L.W('napoli',7.2,8.0),l=L.W('napoli',8.2,10.6),s=L.W('napoli',5.2,8.8),j=B.plek('napoli','jassen');
  await C.play([{fade:'out',t:.01},{speler:false},{actor:'giovanni',at:g,ry:0},{actor:'luca',at:l,ry:PI},{actor:'sanne',at:s,ry:PI*.25},
   {fn:()=>['giovanni','luca','sanne'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},L.cam(...L.W3('napoli',11.5,2.4,11.5),...L.W3('napoli',7.4,1.2,8.6)),{fade:'in',t:.8},
   {titel:'Seizoen 3',sub:'Hoofdstuk 3 · De hoek',t:3.4},
   {say:null,text:'Luca is zeventien. Het is zijn laatste dienst. Hij weet het. Giovanni weet het ook.',t:3.4},
   ...(j?[{move:'luca',to:[j.x+.4,j.z+.6],t:1.6},{anim:'luca',a:'give'},{fn:()=>ST.jas(false)},{say:null,text:'Hij hangt de rode jas aan de haak.',t:2.2}]:[{fn:()=>ST.jas(false)}]),
   {anim:'giovanni',a:'give',prop:'pakket',naar:'luca'},{say:null,text:'Giovanni zegt niets. Hij legt een pizza voor je neer. Margherita. Zoals de eerste dag.',t:3.4},
   {say:'giovanni',text:'Je opa had ook ooit een rode jas. Weet je wat er met hem gebeurde? …Niks. Hij bleef. Hij werd oud.',t:4,mood:'neutraal'},
   L.rond(s[0],s[1],PI*.25,2.4,1.5,1.4),{say:'sanne',text:'Doe voorzichtig, Luca.',t:2,mood:'neutraal'},{say:null,text:'Sanne kijkt vanaf de kassa. Ze lacht niet.',t:2.4},
   {fade:'out',t:.6},{weg:'giovanni'},{weg:'sanne'},{weg:'luca'},{speler:true},{fade:'in',t:.6}]);
  B.toon('napoli','giovanni',true);L.F('jas_haak',1)}

async function mVoorraad(t){const b=baas();
  await C.play([{fn:L.tril},{say:b,text:b==='ray'?'Een hoek, Luca. De portiek bij de speeltuin. Nova brengt je spul. Drieduizend voor de eerste voorraad, en die betaal je zelf. Zo weet ik dat je het meent.':'Je wilt een hoek? De portiek bij de speeltuin. Drieduizend voor de eerste voorraad. Ik geef niks cadeau, jongen. Zelfs jou niet.',t:4.6,mood:'koel'}]);
  if(t!==RUN)return;if(ST.geld()<3000)L.sein('Je hebt nog '+L.eur(3000-ST.geld())+' nodig: diensten, ritten, speciale klussen','#ffd35a');
  if(G.h1)G.h1.dienstAan(true);await ST.poort(3000,'Eerste voorraad',{betaal:true});if(t!==RUN)return;if(G.h1)G.h1.dienstAan(false);L.F('h3_voorraad',1);L.F('h3_deel',.5)}

async function mHoek1(t){const P0=L.A('portiek',182,390);if(!await doelNaar('Naar je hoek: de portiek bij de speeltuin',P0,5))return;L.tijd(17,0);const l=L.P(),q=L.voor(2.2),b=baas();
  const wie=b==='ray'?'nova':'koerier';
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:wie,at:[q.x,q.z],ry:L.naar(q,l),prop:'tas'},L.rond(q.x,q.z,L.naar(q,l)+1,3.4,1.7,1.4),{fade:'in',t:.3},
   {say:wie,text:'Tien zakjes. Veertig per stuk. De helft is van jou. Twee jongens op de uitkijk: bij de speeltuin en bij de tramhalte.',t:3.8,mood:'koel'},
   {say:wie,text:'En: lees je klanten. Nette schoenen, oortje, te rustig? Dan verkoop je niks. Ook niet als hij zielig kijkt.',t:3.8},
   {anim:wie,a:'give',naar:'luca'},{anim:'luca',a:'give',prop:'tas'},{fade:'out',t:.3},{weg:wie},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);
  if(t!==RUN)return;const r=await dienstOpHoek(t,{titel:'eerste avond',n:6,voorraad:10});if(t!==RUN)return;
  await C.zeg('luca',r.fout?'(Dat ging niet overal goed. Morgen beter kijken.)':'(Zes klanten. Geen gedoe. Dit kan ik.)',{t:2.8})}

async function mCrew(t){const S=L.A('speeltuin',198,413);if(!await doelNaar('Er staan jongens bij jouw speeltuin',S,7))return;const l=L.P(),q=L.voor(3),q2=L.walk(q.x+1.6,q.z+.8,3),q3=L.walk(q.x-1.4,q.z+1,3);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'hoekbaas',at:[q.x,q.z],ry:L.naar(q,l),anim:'armen'},{actor:'masker2',at:[q2.x,q2.z],ry:L.naar(q2,l),look:C.figurant&&C.figurant({v:false})},{actor:'oudere_jongen',at:[q3.x,q3.z],ry:L.naar(q3,l)},
   L.rond(q.x,q.z,L.naar(q,l)+.9,5,2,1.4),{fade:'in',t:.3},
   {say:'hoekbaas',text:'Jij bent die pizzajongen. Deze speeltuin was van ons voordat jij je fietsje kreeg.',t:3.2,mood:'koel'},
   {say:'hoekbaas',text:'Twee hoeken, één straat. Dat gaat niet, broer.',t:2.4},
   {keuze:[{t:'Zaken doen: zij verkopen jouw spul',id:'zak',sub:'Zakelijk · minder per zakje, meer hoeken'},{t:'Ze vannacht wegjagen, met Dex',id:'straat',sub:'Straat · gevecht'}],wie:'luca',text:'Yassin wacht.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='zak'){await C.play([{say:'luca',text:'Jullie hebben jongens. Ik heb spul en een leverancier die jullie niet hebben. Jullie verkopen, ik lever. Zeventig dertig.',t:4,mood:'koel'},
     {say:'hoekbaas',text:'Zestig veertig.',t:1.4},{say:'luca',text:'Vijfenzestig. En niemand loopt op mijn portiek.',t:2.2},{anim:'hoekbaas',a:'give',naar:'luca'},{say:'hoekbaas',text:'…Deal, pizzaman.',t:1.6,mood:'blij'}]);
    L.F('crew','deal');ST.koers(6,'zakelijk');ST.meter('imago',3);L.F('h3_deel',.55)}
  else{await C.play([{say:'luca',text:'We zien elkaar vannacht.',t:1.6,mood:'koel'},{fade:'out',t:.6},{weg:'hoekbaas'},{weg:'masker2'},{weg:'oudere_jongen'},{fn:()=>L.tijd(23,30)},
     {actor:'dex',at:[l.x+1.2,l.z+.6],ry:l.ry},{actor:'hoekbaas',at:[q.x,q.z],ry:L.naar(q,l),anim:'armen'},L.rond(q.x,q.z,L.naar(q,l)+.9,5,2,1.4),{fade:'in',t:.6},
     {say:'dex',text:L.F('dex_hulp')==='niets'?'Ik doe dit voor de straat. Niet voor jou.':'Ik heb je rug, broer. Altijd.',t:2.4,mood:'boos'},{say:'hoekbaas',text:'Twee kinderen. Echt?',t:1.6}],{blijf:true});
    G.frozen=1e9;const win=await G.h1.vechten({wie:'Yassin'});G.frozen=0;if(t!==RUN)return;
    await C.play(win?[{anim:'hoekbaas',a:'laag'},{say:'hoekbaas',text:'Oké! Neem die speeltuin. Gek.',t:1.8,mood:'bang'},{move:'hoekbaas',to:[q.x+12,q.z+8],t:2,anim:'run',wacht:false},{say:'dex',text:'HA! Zag je dat? Zag je dat?!',t:2,mood:'blij'}]
      :[{anim:'luca',a:'laag'},{say:'hoekbaas',text:'Volgende keer neem je een groter vriendje mee.',t:2.2,mood:'koel'},{say:'dex',text:'…Gaat het? Je bloedt, broer.',t:2}]);
    L.F('crew',win?'weggejaagd':'verloren');ST.koers(6,'straat');ST.meter('hitte',6);ST.meter('loy_dex',win?6:2);if(!win)ST.meter('imago',-3)}
  await C.play([{fade:'out',t:.3},{weg:'hoekbaas'},{weg:'masker2'},{weg:'oudere_jongen'},{weg:'dex'},{weg:'luca'},{speler:true},{fade:'in',t:.3}])}

async function mBakker(t){const p=L.A('politie',655,349);
  await C.play([{fade:'out',t:.6},{speler:false},{actor:'bakker',at:[p.x+1,p.z+3],ry:PI,anim:'point'},{actor:'collega',at:[p.x+2.6,p.z+4.4],ry:PI*1.2,prop:'telefoon'},
   L.cam(p.x+3.6,1.9,p.z+7.2,p.x+1,1.5,p.z+3),{fade:'in',t:.6},{say:null,text:'Hoofdbureau. Een kantoor met koffievlekken. Op een kurken bord: foto’s, lijntjes, namen. Rafiq. Ray. Een grote lege plek in het midden.',t:4.4},
   {say:'collega',text:'Deze komt van een bewakingscamera bij de Boulevard. Een jongen met een rode fietsjas. Steeds op dezelfde avonden bij Sahara.',t:3.8},
   {anim:'bakker',a:'point'},{say:'bakker',text:'Een pizzajongen.',t:1.6,mood:'koel'},{say:null,text:'Inspecteur Bakker prikt de korrelige foto midden op het bord.',t:2.6},
   {say:'bakker',text:'Wie ben jij?',t:2,mood:'koel'},{fade:'out',t:.8},{weg:'bakker'},{weg:'collega'},{speler:true},{fade:'in',t:.6}]);
  ST.meter('dossier',8);L.F('bakker_bord',1)}

async function mHoek2(t){const P0=L.A('portiek',182,390);if(!await doelNaar('Tweede avond op de hoek',P0,5))return;L.tijd(18,30);const hielp=L.F('sami');
  if(hielp)await C.zeg('brugklasser','Luca! Die man met die nette schoenen bij de tram. Die stond gisteren ook bij de school. Met een oortje.',{t:3.4});
  if(t!==RUN)return;
  const r=await dienstOpHoek(t,{titel:'tweede avond',n:7,voorraad:8,reeks:['student','agent','verslaafde','student','concurrent','student','agent'],waarschuw:hielp?(k,i)=>k==='agent'?'Sami seint: dat is hem.':'':null});
  if(t!==RUN)return;
  if(!hielp){const l=L.P(),q=L.voor(2.6);await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'brugklasser',at:[q.x+6,q.z+4],ry:0},{actor:'hoekbaas',at:[q.x,q.z],ry:L.naar(q,l)},
     L.rond(q.x,q.z,L.naar(q,l)+1,4,1.8,1.4),{say:null,text:'Achter Yassin staat Sami. De brugklasser van het schoolplein. Hij wijst naar de kapotte tegel waar jij je spul verstopt.',t:4},
     {say:'hoekbaas',text:'Dank je, kleintje.',t:1.6,mood:'blij'},{say:null,text:'Je stash is weg. Vijfhonderd euro aan spul.',t:2.4},{fade:'out',t:.3},{weg:'brugklasser'},{weg:'hoekbaas'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);
    ST.geld(-Math.min(500,ST.geld()),'stash weg');L.F('sami_verraad',1)}
  else{L.F('sami_hielp',1);ST.meter('imago',2)}}

async function mJongen(t){const l=L.P(),q=L.voor(2);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'jongen13',at:[q.x,q.z],ry:L.naar(q,l)},L.rond(q.x,q.z,L.naar(q,l)+1,2.8,1.4,1.2),
   {say:'jongen13',text:'Jij bent Luca, toch? Iedereen kent je. Mag ik voor je lopen? Ik ben snel. Ik ben dertien, maar ik ben echt snel.',t:3.8,mood:'blij'},
   {keuze:[{t:'Wegsturen: "Ga naar school, Milan."',id:'weg',sub:'Imago omhoog'},{t:'Aannemen',id:'aan',sub:'Meer geld · een keuze die terugkomt'}],wie:'luca',text:'Hij is dertien.'}],{blijf:true});
  if(t!==RUN)return;
  await C.play(r==='weg'?[{say:'luca',text:'Ga naar school, Milan. Echt. Als ik je hier nog één keer zie, bel ik je moeder.',t:3,mood:'koel'},{say:'jongen13',text:'…Oké. Oké.',t:1.4,mood:'neutraal'},
     {say:null,text:'Een week later zie je hem met een rugtas de school in lopen. Hij zwaait niet.',t:3}]
    :[{say:'luca',text:'Alleen overdag. Alleen briefjes, nooit spul. En als iemand je iets vraagt, ken je mij niet.',t:3.4,mood:'koel'},{say:'jongen13',text:'YES! Je krijgt er geen spijt van!',t:1.8,mood:'blij'}]);
  if(r==='weg'){ST.meter('imago',4);L.F('milan','school')}else{L.F('milan','loopt');L.F('h3_deel',(L.F('h3_deel')||.5)+.05);ST.meter('dossier',3)}
  await C.play([{fade:'out',t:.3},{weg:'jongen13'},{weg:'luca'},{speler:true},{fade:'in',t:.3}])}

async function mGiulia(t){const th=L.A('tramhalte',188,462),P0=L.A('portiek',182,390),d=L.A('flatdak',198,491);
  await C.play([{fade:'out',t:.4},{speler:false},{actor:'luca',at:[P0.x,P0.z],ry:0,anim:'leun'},{actor:'giulia',at:[th.x,th.z],ry:L.naar(th,P0)},L.cam(th.x-3,2.2,th.z+3,P0.x,1.4,P0.z),{fade:'in',t:.5},
   {say:null,text:'Giulia, in de tram naar de universiteit. Ze kijkt naar buiten. Naar de portiek. Naar haar broertje, met een tas en twee jongens op de uitkijk.',t:4.2},
   L.rond(th.x,th.z,L.naar(th,P0)+PI,1.6,1.6,1.6),{say:null,text:'Ze zegt niets. Die avond aan tafel kijkt ze hem de hele tijd aan.',t:3.2},{fade:'out',t:.6},{weg:'giulia'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);
  if(t!==RUN)return;if(!await doelNaar('Giulia wacht op het dak van de flat',L.A('thuis',198,483),8))return;
  const y=d.y||34;
  const r=await C.play([{fade:'out',t:.4},{speler:false},{actor:'luca',at:[d.x-.8,d.z],ry:PI*.5,y},{actor:'giulia',at:[d.x+.8,d.z],ry:-PI*.5,y},{fn:()=>L.tijd(22,10)},
   L.cam(d.x-1.4,y+2.6,d.z+4.6,d.x,y+1.2,d.z),{fade:'in',t:.8},{say:null,text:'Het dak van de flat. De hele stad onder hen: de haven, de Zuidas, het licht van de Boulevard.',t:3.6},
   {say:'giulia',text:'Ik studeer rechten, Luca. Weet je wat ik vandaag leerde? Hoeveel jaar je krijgt voor handel. Voor minderjarigen. En voor meerderjarigen.',t:4.4,mood:'boos'},
   {say:'giulia',text:'Over vier maanden ben je achttien.',t:2,mood:'neutraal'},
   {keuze:[{t:'Liegen: "Ik stond daar gewoon met vrienden."',id:'lieg',sub:'Giulia sterk omlaag'},{t:'Half vertellen',id:'half'},{t:'Alles vertellen',id:'alles',sub:'Ze houdt het geheim, als je belooft te stoppen voor je 18e'}],wie:'luca',text:'Giulia kijkt je aan.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='lieg'){await C.play([{say:'luca',text:'Ik stond daar gewoon met vrienden.',t:1.8},{say:'giulia',text:'Met een tas. En twee kinderen op de uitkijk. Ik ben niet dom, Luca.',t:3,mood:'boos'},{say:null,text:'Ze gaat naar beneden. Ze doet de deur niet hard dicht. Dat is erger.',t:3}]);ST.meter('fam_giulia',-15);L.F('giulia','gelogen')}
  else if(r==='half'){await C.play([{say:'luca',text:'Ik verdien geld. Voor mama, voor papa’s rug, voor jouw studie. Hoe, dat wil je niet weten.',t:3.4},{say:'giulia',text:'Ik wíl het niet weten. Maar ik weet het al.',t:2.6,mood:'neutraal'}]);ST.meter('fam_giulia',-4);L.F('giulia','half')}
  else{await C.play([{say:null,text:'Luca vertelt alles. Rafiq. Ray. De envelop. Dex. Het duurt een uur. Giulia huilt één keer, heel kort.',t:4},
     {say:'giulia',text:'Ik zeg niks. Tegen niemand. Maar je belooft me iets: voor je achttiende stap je eruit.',t:3.4,mood:'neutraal'},{say:'luca',text:'…Ik beloof het.',t:1.8},{say:null,text:'Het spel onthoudt deze belofte.',t:2.2}]);ST.meter('fam_giulia',8);L.F('giulia','alles');L.F('belofte_18',1)}
  await C.play([{fade:'out',t:.5},{weg:'luca'},{weg:'giulia'},{speler:true},{fade:'in',t:.5}])}

async function mNova(t){const s=L.A('stashflat',92,660);
  await C.play([{fn:L.tril},{say:'nova',text:'Klus. Een man in de flats bij het water. Ferry. Hij bewaart iets voor ons, en hij praat. In de kroeg, tegen zijn vriendin, tegen iedereen. We halen het op.',t:4.4,mood:'koel'}]);
  if(t!==RUN)return;L.zorgFiets();if(!await doelNaar('Naar Ferry, bij de flats aan het water',s,6))return;L.tijd(21,0);const l=L.P(),q=L.voor(1.8),n=L.walk(l.x+1.4,l.z+.6,3);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'nova',at:[n.x,n.z],ry:L.naar(n,q)},{actor:'prater',at:[q.x,q.z],ry:L.naar(q,l)},{snd:'deurbel'},
   L.rond(q.x,q.z,L.naar(q,l)+1.1,3.2,1.7,1.4),{say:'prater',text:'Hé! De vrouw met het masker! En wie is dit? Jij bent die pizzajongen! Ik heb over je gehoord, man, iedereen heeft het over je!',t:3.8,mood:'blij'},
   {say:'nova',text:'Zie je wat ik bedoel.',t:1.6,mood:'koel'},{say:null,text:'Nova kijkt naar jou. Ze laat het aan jou over.',t:2.4},
   {keuze:[{t:'Praten: "Ferry, als jij praat, praat ik ook. Over jou."',id:'praat',sub:'Slim'},{t:'Dreigen',id:'dreig',sub:'Straat'},{t:'Hem betalen om te verhuizen',id:'betaal',sub:'€1.000 · zakelijk'}],wie:'luca',text:'Ferry blijft maar praten.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='praat'){await C.play([{say:'luca',text:'Ferry. Je vriendin weet niet van dat meisje in de kroeg. Nog niet. Jij houdt je mond, en ik ook.',t:3.6,mood:'koel'},{say:'prater',text:'…Hoe weet jij…? Oké. Oké. Hier. Neem alles mee.',t:2.6,mood:'bang'},{say:'nova',text:'Hm.',t:1}]);ST.meter('loy_ray',4);L.F('ferry','praat')}
  else if(r==='dreig'){await C.play([{anim:'luca',a:'duw',naar:'prater'},{snd:'hit'},{say:'luca',text:'Nog één woord in de kroeg, en je praat nooit meer.',t:2.4,mood:'boos'},{say:'prater',text:'Ja! Ja. Ik ben stil.',t:1.6,mood:'bang'}]);ST.koers(4,'straat');ST.meter('hitte',4);L.F('ferry','dreig')}
  else{const kan=ST.geld()>=1000;await C.play(kan?[{fn:()=>ST.geld(-1000,'Ferry verhuist')},{say:'luca',text:'Duizend euro. Morgen woon je in Almere. Je vertelt niemand waarom.',t:3,mood:'koel'},{say:'prater',text:'Almere? …Voor duizend? Ja!',t:2,mood:'blij'}]
      :[{say:'luca',text:'Ik… heb het nu niet bij me.',t:1.6},{say:'nova',text:'Dan doen we het op mijn manier.',t:1.8,mood:'koel'},{anim:'nova',a:'duw',naar:'prater'},{snd:'hit'}]);ST.koers(kan?5:-3,kan?'zakelijk':'straat');L.F('ferry',kan?'betaald':'nova')}
  await C.play([{anim:'prater',a:'give',prop:'tas',naar:'luca'},{anim:'luca',a:'give',prop:'tas'},{snd:'grab'},L.rond(n.x,n.z,L.naar(n,l)+.8,2.6,1.6,1.5),
   {say:'nova',text:'Je zegt weinig, pizzajongen. Ik ook. Ik onthoud alles.',t:2.8,mood:'koel'},{fade:'out',t:.3},{weg:'nova'},{weg:'prater'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);
  ST.meter('loy_nova',6);ST.geld(400,'klus met Nova')}

async function mEinde(t){const d=L.A('dex',277,480);if(!await doelNaar('Dex is vrij. Hij wacht bij de hoek',d,6))return;const l=L.P(),q=L.voor(2.2);const boos=L.F('dex_vergeet_niet');
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'dex',at:[q.x,q.z],ry:L.naar(q,l),anim:'armen'},L.rond(q.x,q.z,L.naar(q,l)+1,3.2,1.6,1.4),{fade:'in',t:.3},
   {say:'dex',text:boos?'Twee maanden, Luca. Twee maanden heb ik je naam niet genoemd. En jij deed niks.':L.F('dex_hulp')==='moeder'?'Mijn moeder heeft het me verteld. Van het geld. Dat vergeet ik nooit, broer.':'Mr. Hoefnagel. Dure pakken. Ray betaalde. Ik weet dat jij dat regelde.',t:3.8,mood:boos?'boos':'neutraal'},
   {say:'dex',text:'Maar luister. Ze wisten precies waar ik zou zijn. Precies wanneer. Iemand heeft me verraden.',t:3.4,mood:'boos'},
   {say:'dex',text:'En ik ga uitzoeken wie. En dan…',t:2.4,mood:'boos'},{say:'luca',text:'Dex. Rustig.',t:1.4},
   {say:null,text:'Er zit een lek in het netwerk. En het is iemand dichtbij.',t:3.2},{fade:'out',t:1},{titel:'Seizoen 4',sub:'Coming soon',t:3.6},{weg:'dex'},{weg:'luca'},{speler:true},{fade:'in',t:1}]);
  L.F('h3_klaar',Date.now());ST.goto('h3_vrij');
  ST.kaart(`<small>De Bezorger · Seizoen 3 uitgespeeld</small><b>Je eigen hoek, en een lek</b><p>Crew: <b>${L.F('crew')==='deal'?'deal met de Hoek-boys':L.F('crew')==='weggejaagd'?'Hoek-boys weggejaagd':'verloren van de Hoek-boys'}</b> · Giulia: <b>${L.F('giulia')==='alles'?'weet alles (belofte)':L.F('giulia')==='half'?'weet half':'voorgelogen'}</b></p>
   <p><b>Seizoen 4 · coming soon.</b> Ploegleider: vier tot zes hoeken, je eigen crew, en de jacht op de lekker. Je hoek blijft open: elke avond kun je er staan.</p><div class="sv-k-b"><button class="btn" data-x>Verder</button></div>`)}

/* =================== de hoek als vaste bijverdienste (na de eerste avond) =================== */
let hoekSpot=null,hoekCd=0;
function hoekInit(){if(hoekSpot||!G.spot)return;const p=L.A('portiek',182,390);
  hoekSpot=G.spot({story:1,k:'hoek',x:p.x,z:p.z,r:2.4,prio:2,n:'Op je hoek staan',sub:'Een avond verkopen',col:'#ff9a5a',h:2,
    show:()=>live()&&(ST.st().ch>=3)&&!!L.F('h3_dienst')&&!B.waar()&&!C.active()&&Date.now()>hoekCd&&!(G.bezorg&&G.bezorg.actief())&&['h3_vrij','h3_wacht'].includes(ST.huidig()),
    act:async()=>{hoekCd=Date.now()+5*60e3;const t=RUN;await dienstOpHoek(t,{titel:'een avond',n:5,voorraad:6})}})}

/* =================== de stappen =================== */
function registreer(){const S=(id,d)=>ST.step(id,d);
S('h3_start',{muziek:'thuis',async start(o){const t=nieuw();const s=ST.st();s.ch=3;try{save()}catch(e){}ST.avond(1);ST.tijd(16,0);try{G.uiterlijk&&G.uiterlijk.leeftijd&&G.uiterlijk.leeftijd(17)}catch(e){}
  await mAfscheid(t);if(t!==RUN)return;ST.goto('h3_voorraad')}});
S('h3_voorraad',{muziek:null,async start(o){const t=nieuw();await mVoorraad(t);if(t!==RUN)return;ST.goto('h3_hoek1')}});
S('h3_hoek1',{muziek:'spanning',async start(o){const t=nieuw();await mHoek1(t);if(t!==RUN)return;ST.avond(2);ST.goto('h3_crew')}});
S('h3_crew',{muziek:'spanning',async start(o){const t=nieuw();await mCrew(t);if(t!==RUN)return;await mBakker(t);if(t!==RUN)return;ST.goto('h3_hoek2')}});
S('h3_hoek2',{muziek:'spanning',async start(o){const t=nieuw();await mHoek2(t);if(t!==RUN)return;await mJongen(t);if(t!==RUN)return;ST.avond(3);ST.goto('h3_giulia')}});
S('h3_giulia',{muziek:'thuis',async start(o){const t=nieuw();await mGiulia(t);if(t!==RUN)return;ST.avond(4);ST.goto('h3_nova')}});
S('h3_nova',{muziek:'spanning',async start(o){const t=nieuw();await mNova(t);if(t!==RUN)return;ST.goto('h3_slot')}});
S('h3_slot',{muziek:'ray',async start(o){const t=nieuw();await mEinde(t)}});
S('h3_vrij',{doel:'Seizoen 4 · coming soon. Je hoek staat open',start(o){nieuw();if(G.h1)G.h1.dienstAan(true);L.zorgFiets()}});
}

const iv=setInterval(()=>{if(!G.ready||!G.story||!G.cut||!G.binnen||!G.h1||!G.h1.lib||!G.h2||!G.story.step)return;clearInterval(iv);
  ST=G.story;C=G.cut;B=G.binnen;L=G.h1.lib;try{cast()}catch(e){console.error(e)}
  if(!live())return;registreer();setTimeout(hoekInit,1000);
  G.h3.test={hoekDienst,mAfscheid,mHoek1,mCrew,mBakker,mHoek2,mJongen,mGiulia,mNova,mEinde,nieuw:()=>nieuw()};
},150);
})();
