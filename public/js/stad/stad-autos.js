// Pixelstad: auto's op straat. Alleen in de Pixelstad, met de regels en bedragen van het klikspel (autos.js, carjack.js).
// - Geparkeerde auto's zijn echte modellen uit het spel (zelfde kans op zeldzame auto's als 'straat afzoeken', in de Zuidas en op
//   Oostland vaker dure). Loop erheen: je ziet model en zeldzaamheid, glinstert er iets achter het raam, dan ligt er iets in.
// - Inbreken: ruit inslaan (snel en luid) of het slot openbreken (stil, een spelletje met timing). Binnen: doorzoeken (spullen voor de
//   heler, soms geld in het dashboardkastje) of kortsluiten (draadjes in de goede volgorde) en wegrijden.
// - Gestolen auto afleveren: Garage Van der Plaat (in je garage, zoals stelen in het klikspel), Ome Henk de heler (als hij dit model
//   zoekt), Autokerkhof De Sloop of je eigen chop shop op Oostland (slopen voor onderdelen). Schade door botsen kost waarde.
// - Carjacken: staat een auto stil in het verkeer, dan kun je met een wapen de bestuurder eruit trekken.
// - Alarm: getuigen, 112, politie (stad-npc.js en stad-police.js). Een auto met tracker wordt na een tijdje gemeld.
// - Garage Van der Plaat en het autokerkhof hebben een eigen menu: je auto's (rijden, bod vragen en verkopen, heler, slopen,
//   overspuiten, nieuwe papieren), wat de heler zoekt (met 'zoek er een in de stad'), slopen en je garage uitbouwen.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
M.dynCars=true;   // geparkeerde auto's niet in het stadsmodel bakken: ze worden hier los getekend
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const sv=()=>{try{save()}catch(e){}};
const tierOf=m=>typeof carTier==='function'?carTier(m):(m.leg?6:m.d||1);
const rar=m=>{try{return carRarity(m)}catch(e){return ['Gewoon','#9aa1ab']}};
// mesh-kleuren beperkt tot een palet (het texture-atlas heeft maar zoveel vakjes); het plaatje in het menu krijgt de echte kleur
const PAL=['#c9cfd6','#8a929c','#3a5fa8','#b8333a','#e6e1d6','#2f6b4a','#d8a23a','#50565f','#1d1d1f','#7a3c8a','#c23b2e','#2f5d9a','#e8c547','#f08a24','#7fd1c7','#ff4fd8'];
const hexRgb=h=>{const n=parseInt(String(h).slice(1),16);return [n>>16&255,n>>8&255,n&255]};
const qcol=c=>{if(!/^#[0-9a-f]{6}$/i.test(c||''))return '#8a929c';const a=hexRgb(c);let b=PAL[0],bd=1e9;PAL.forEach(p=>{const q=hexRgb(p),d=(a[0]-q[0])**2+(a[1]-q[1])**2+(a[2]-q[2])**2;if(d<bd){bd=d;b=p}});return b};
/* ---------- welk model staat er ---------- */
function boostAt(x,z){const d=M.districtAt(x,z);return /Zuidas|IJ-oever|Villawijk|Eiland/.test(d)?3:/Centrum|Plein|Oosterstraat|Villapark|Oud-Zuid/.test(d)?1.6:/Westbuurt|Haven|Tuinwijk|Bedrijventerrein/.test(d)?.6:1}
function rollModel(x,z){if(typeof pickCar!=='function'||typeof findTier!=='function'||typeof CARS==='undefined')return null;
  for(let i=0;i<6;i++){const m=pickCar(findTier(),boostAt(x,z));if(m)return m}return CARS[0]}
function carData(m,spot){try{return spawnCar(m,spot)}catch(e){return {id:m.id,spot,year:2018,km:60000,staat:'Goed',v:Math.round((m.lo+m.hi)/2),c:'#8a929c',plate:'XX-000-X'}}}
// verkeer: ook echte modellen (zie stad-cars.js)
G.trafModel=function(A){const m=rollModel(A?A.x:M.A.pleinMid.x,A?A.z:M.A.pleinMid.z);if(!m)return null;const x=carData(m,'In het verkeer');x.c=qcol(x.c);return {m,x}};
/* ---------- geparkeerde auto's ---------- */
const PK=[];G.parked=PK;
const LOOT=[['Laptoptas',1.3],['Navigatiesysteem',.8],['Zonnebril',.4],['Gereedschapskist',.7],['Sporttas',.5],['Pakket van een webshop',.7],['Golftas',1.6],['Dashcam',.6],['Designerjas',1.1],['Kinderzitje',.08]];
function kraakRef(){if(typeof CRIMES==='undefined')return null;return CRIMES.find(c=>c.id==='autokraak')||(G.roofRef&&G.roofRef())}
function makeParked(sp){const m=rollModel(sp.x,sp.z);if(!m)return null;const x=carData(m,M.districtAt(sp.x,sp.z));const kind=G.carKind(m.b),mesh=G.carMesh(qcol(x.c),kind,false);
  const ry=sp.rot?(sp.dir>0?Math.PI:0):(sp.dir>0?Math.PI/2:-Math.PI/2);mesh.position.set(sp.x,0,sp.z);mesh.rotation.y=ry;G.scene().add(mesh);
  const t=tierOf(m),sec=typeof jackSecRoll==='function'?jackSecRoll(m):(Math.random()<.4?1:0),loot=Math.random()<.42+t*.04?1+(Math.random()<.3?1:0):0;
  return {sp,m,data:x,kind,mesh,ry,x:sp.x,z:sp.z,sec,loot,cash:Math.random()<.35,st:'dicht',seen:0,alarmT:0}}
// de gegevens van het klikspel staan in p.data (bouwjaar, km, staat, waarde, kleur, kenteken); p.x/p.z is de plek
function setupParked(){M.props.filter(p=>p.k==='car').forEach(sp=>{if(Math.random()<.78){const p=makeParked(sp);if(p)PK.push(p)}})}
/* ---------- glinster (er ligt iets) en ring om het doelwit ---------- */
let glint=null,frame=null;
function setupFx(){const sc=G.scene();glint=new TH.Mesh(new TH.OctahedronGeometry(.16,0),new TH.MeshBasicMaterial({color:0xfff3c8}));glint.visible=false;sc.add(glint);
  const mk=(w,d)=>{const g=new TH.Group(),m=new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false});[[0,-d/2,w,.12],[0,d/2,w,.12],[-w/2,0,.12,d],[w/2,0,.12,d]].forEach(([x,z,a,b])=>{const q=new TH.Mesh(new TH.PlaneGeometry(a,b),m);q.rotation.x=-Math.PI/2;q.position.set(x,.07,z);g.add(q)});return g};
  frame=mk(2.6,5.2);frame.visible=false;sc.add(frame)}
const GL=[];function glints(ts){// kleine schittering achter het raam van auto's met spullen, alleen dichtbij
  const P=G.P;let n=0;PK.forEach(p=>{if(!p.loot||p.st==='gestolen'||p.searched)return;const d=dist(p,P);if(d>16)return;let g=GL[n];if(!g){g=glint.clone();G.scene().add(g);GL.push(g)}n++;
    const on=Math.sin(ts*4+p.x)>.55;g.visible=on;g.position.set(p.x,1.45,p.z);g.rotation.y=ts*3;g.scale.setScalar(.6+Math.sin(ts*9+p.z)*.3)});for(let i=n;i<GL.length;i++)GL[i].visible=false}
/* ---------- wie of wat staat er voor je ---------- */
let target=null,jackT=null;
const pr=document.createElement('div');pr.className='sd-npcp sd-carq';pr.hidden=true;document.body.appendChild(pr);
const V3=new TH.Vector3();
function pickTarget(){const P=G.P;target=null;jackT=null;if(G.driving||G.talking||G.paused||mini||(G.mission&&G.mission())||G.hidden)return;
  let bd=3.1;PK.forEach(p=>{if(p.st==='gestolen')return;const d=dist(p,P);if(d<bd){bd=d;target=p}});
  // carjacken: een auto die stilstaat in het verkeer, vlak naast je
  if(!target&&weapon()){let jd=2.8;(G.TRAF||[]).forEach(c=>{if(c.police||c.chase||!c.md||Math.abs(c.v)>1.2)return;const d=dist(c,P);if(d<jd){jd=d;jackT=c}})}
  const door=G.near&&Math.hypot(P.x-G.near.door.x,P.z-G.near.door.z);if(door!=null&&door<1.6){target=null;jackT=null}}
function promptStep(){pickTarget();const t=target||jackT;if(!t){pr.hidden=true;if(frame)frame.visible=false;return}
  const m=target?target.m:t.md.m,R=rar(m);if(target&&!target.seen){target.seen=1;try{S.carDex=S.carDex||{};const d=S.carDex[m.id]||[0,0];d[0]++;S.carDex[m.id]=d}catch(e){}}
  if(frame){frame.visible=true;frame.position.set(t.x,0,t.z);frame.rotation.y=target?target.ry:t.ry;frame.children.forEach(q=>q.material.color.set(R[1]))}
  V3.set(t.x,2.4,t.z).project(G.camera());pr.hidden=false;pr.style.left=(V3.x*.5+.5)*innerWidth+'px';pr.style.top=(-V3.y*.5+.5)*innerHeight+'px';pr.style.setProperty('--c',R[1]);
  pr.innerHTML=`<kbd>${touch?'Tik':'E'}</kbd><span>${E(m.n)}</span><em>${target?(target.st==='dicht'?R[0]:target.st==='ruit'?'ruit kapot':'open'):'carjacken'}</em>`}
pr.addEventListener('click',()=>{if(target)carMenu(target);else if(jackT)jackMenu(jackT)});
/* ---------- regels en kosten (klikspel) ---------- */
const weapon=()=>{try{return typeof gearBest==='function'?gearBest('wapen'):null}catch(e){return null}};
const cdLeftMs=k=>{try{return Math.max(0,(S.cd&&S.cd[k]||0)-now())}catch(e){return 0}};
const secTxt=s=>(typeof JACK_SECN!=='undefined'?JACK_SECN[s]:['Geen alarm','Alarm','Alarm + tracker'][s])||'';
function kraakWhy(){const c=kraakRef();if(!c)return 'Kan nu niet';if(rankIdx(S.xp)<c.r)return 'Vanaf '+RANKS[c.r][0];if(typeof inJail==='function'&&inJail())return 'Je zit vast';
  const l=cdLeftMs('stadKraak');if(l)return 'Even wachten: nog '+Math.ceil(l/1000)+' s';if(S.energy<crEn(c))return 'Te moe: '+crEn(c)+' energie nodig';return ''}
function stealWhy(p){const m=p.m,en=typeof carEn==='function'?carEn(m):6;const l=cdLeftMs('car');if(l)return 'Je handen trillen nog: '+Math.ceil(l/1000)+' s';if(S.energy<en)return 'Te moe: '+en+' energie nodig';if(G.police&&G.police.active())return 'Niet met de politie in de buurt';return ''}
/* ---------- menu bij een geparkeerde auto ---------- */
function drawP(p){return cv=>K.carPic(cv,p.data.c,p.kind,{loot:p.loot&&!p.searched,smash:p.st==='ruit',open:p.st==='open',alarm:p.alarmT>0})}
function carMenu(p){G.talking=true;const m=p.m,R=rar(m),x=p.data,ch=[],kw=kraakWhy();
  const lines=[`${x.year} · ${(x.km||0).toLocaleString('nl-NL')} km · ${x.staat} · straatwaarde ${fmt(x.v)}. ${secTxt(p.sec)}.${p.loot&&!p.searched?' Er ligt iets op de achterbank.':''}`];
  if(p.st==='dicht'){ch.push({t:'Slot openbreken',sub:'Stil, maar het kost tijd',ic:K.ic.key,risk:p.sec?2:1,dis:!!kw,why:kw,f:()=>{K.closeDialog(true);breakIn(p,'pick')}});
    ch.push({t:'Ruit inslaan',sub:'Snel, maar luid',ic:K.ic.hand,risk:3,dis:!!kw,why:kw,f:()=>{K.closeDialog(true);breakIn(p,'smash')}})}
  else{if(p.loot&&!p.searched)ch.push({t:'Doorzoeken',sub:'Achterbank, dashboardkastje, kofferbak',ic:K.ic.bag,f:()=>{K.closeDialog(true);search(p)}});
    const sw=stealWhy(p);ch.push({t:'Kortsluiten en wegrijden',sub:'Waarde '+fmt(x.v)+' · '+(typeof carEn==='function'?carEn(m):6)+' energie',ic:K.ic.route,risk:p.sec>=2?3:2,dis:!!sw,why:sw,f:()=>{K.closeDialog(true);hotwire(p)}})}
  ch.push({t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()});
  K.dialog({name:m.n,role:R[0]+' · '+x.plate,draw:drawP(p),lines,col:R[1],choices:ch,onClose:()=>{G.talking=false}})}
/* ---------- spelletjes (onderin, de wereld loopt door) ---------- */
let mini=null;
const mp=document.createElement('div');mp.className='sd-mini';mp.id='sdMiniP';mp.hidden=true;document.body.appendChild(mp);
function miniOpen(title,sub,body){mp.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub)}</small><button class="sd-x" data-mx aria-label="Stoppen">×</button></div><div class="sd-mini-b">${body}</div>`;mp.hidden=false;mp.classList.remove('go');void mp.offsetWidth;mp.classList.add('go');G.talking=true}
function miniClose(){mp.hidden=true;mini=null;G.talking=false}
mp.addEventListener('click',e=>{if(e.target.closest('[data-mx]')){mini&&mini.end('cancel');return}const b=e.target.closest('[data-k]');if(b&&mini&&mini.key)mini.key(b.dataset.k)});
mp.addEventListener('pointerdown',e=>{const b=e.target.closest('[data-tap]');if(b&&mini&&mini.key){e.preventDefault();mini.key('tap')}});
addEventListener('keydown',e=>{if(!mini)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();mini.end('cancel');return}
  const map={' ':'tap',e:'tap',enter:'tap',arrowleft:'L',arrowup:'U',arrowright:'R',arrowdown:'D',a:'L',w:'U',d:'R',s:'D'};if(map[k]&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();mini.key(map[k])}},true);
// slot openbreken: druk op het goede moment (de pin moet in het groene vlak staan)
function gamePick(p){return new Promise(res=>{const t=tierOf(p.m),skill=typeof cxpF==='function'?cxpF():0,n=2+Math.min(3,Math.ceil(t/2)),w=clamp(.26-.025*t+.1*skill,.09,.3),sp=1.1+.18*t,allow=p.sec?1:2;
  let pin=0,miss=0,c=rr(.2,.8),t0=performance.now(),raf=0;
  miniOpen('Slot openbreken',`${n} pinnen · druk als het streepje in het groen staat`,`<div class="sd-pick"><div class="sd-pick-bar"><i class="z"></i><i class="m"></i></div><div class="sd-pick-pins">${Array.from({length:n},(_,i)=>`<i data-p="${i}"></i>`).join('')}</div><div class="sd-pick-miss"></div></div><button class="btn sd-mini-go" data-tap>${touch?'Nu!':'<kbd>E</kbd> Nu!'}</button>`);
  const bar=mp.querySelector('.sd-pick-bar'),z=bar.querySelector('.z'),mk=bar.querySelector('.m');const zone=()=>{z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%'};zone();
  const pos=()=>(Math.sin((performance.now()-t0)/1000*sp*Math.PI)+1)/2;
  const loop=()=>{if(!mini)return;mk.style.left=pos()*100+'%';raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  mini={key:k=>{if(k!=='tap')return;const q=pos();if(Math.abs(q-c)<=w/2){mp.querySelector(`[data-p="${pin}"]`).classList.add('ok');pin++;G.snd&&G.snd.fx('click');if(pin>=n){mini.end('ok');return}c=rr(.15,.85);zone();t0=performance.now()-rr(0,800)}
      else{miss++;G.snd&&G.snd.fx('bad');G.shake&&G.shake(.2);mp.querySelector('.sd-pick-miss').textContent='Mis: '+miss+(p.sec?' · het alarm reageert…':'');if(miss>allow){mini.end('alarm')}}},
    end:r=>{cancelAnimationFrame(raf);miniClose();res(r)}}})}
// ruit inslaan: snel een paar keer slaan
function gameSmash(){return new Promise(res=>{let n=0;const need=3,t0=performance.now();
  miniOpen('Ruit inslaan','Sla drie keer snel achter elkaar',`<div class="sd-smash"><i></i><i></i><i></i></div><button class="btn sd-mini-go" data-tap>${touch?'Sla!':'<kbd>E</kbd> Sla!'}</button>`);
  mini={key:k=>{if(k!=='tap')return;mp.querySelectorAll('.sd-smash i')[n]&&mp.querySelectorAll('.sd-smash i')[n].classList.add('ok');n++;G.snd&&G.snd.fx('hit');G.shake&&G.shake(.35);if(n>=need)mini.end(performance.now()-t0<4000?'ok':'slow')},end:r=>{miniClose();res(r)}}})}
// kortsluiten: de draadjes in de goede volgorde (pijltjes of de gekleurde knoppen)
const WIRES={L:['Rood','#ff3d52','←'],U:['Geel','#f2c230','↑'],R:['Blauw','#4d9dff','→'],D:['Groen','#3fe395','↓']};
function gameWire(p){return new Promise(res=>{const t=tierOf(p.m),skill=typeof cxpF==='function'?cxpF():0,n=3+Math.min(3,Math.floor(t/2)),T=clamp(6.5-.4*t+2*skill,3.5,8),seq=Array.from({length:n},()=>pick(['L','U','R','D']));let i=0,t0=performance.now(),raf=0,pen=0;
  miniOpen('Kortsluiten',`Verbind de draadjes in deze volgorde`,`<div class="sd-wire"><div class="sd-wire-s">${seq.map((k,j)=>`<i data-w="${j}" style="--w:${WIRES[k][1]}">${WIRES[k][2]}</i>`).join('')}</div><i class="sd-wire-t"><i></i></i></div>
    <div class="sd-wire-b">${['L','U','R','D'].map(k=>`<button data-k="${k}" style="--w:${WIRES[k][1]}" aria-label="${WIRES[k][0]}"><b>${WIRES[k][2]}</b><small>${WIRES[k][0]}</small></button>`).join('')}</div>`);
  const tb=mp.querySelector('.sd-wire-t>i');const loop=()=>{if(!mini)return;const left=T-(performance.now()-t0)/1000-pen;tb.style.width=clamp(left/T,0,1)*100+'%';if(left<=0){mini.end('time');return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  mini={key:k=>{if(!WIRES[k])return;if(k===seq[i]){mp.querySelector(`[data-w="${i}"]`).classList.add('ok');i++;G.snd&&G.snd.fx('blip');if(i>=n)mini.end('ok')}else{pen+=1.2;G.snd&&G.snd.fx('hit');G.shake&&G.shake(.3);G.fx2&&G.fx2.burst(G.P.x,1,G.P.z,'#ffe9a8',5)}},end:r=>{cancelAnimationFrame(raf);miniClose();res(r)}}})}
// worstelen (carjacken): snel drukken voordat de bestuurder wegrijdt
function gameStruggle(){return new Promise(res=>{let n=0;const need=6,T=3.2,t0=performance.now();let raf=0;
  miniOpen('Bestuurder eruit','Druk snel achter elkaar!',`<i class="sd-wire-t big"><i></i></i><button class="btn sd-mini-go" data-tap>${touch?'Trek!':'<kbd>E</kbd> Trek!'}</button>`);
  const tb=mp.querySelector('.sd-wire-t>i');const loop=()=>{if(!mini)return;tb.style.width=clamp(n/need,0,1)*100+'%';if((performance.now()-t0)/1000>T){mini.end('fail');return}raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  mini={key:k=>{if(k!=='tap')return;n++;G.snd&&G.snd.fx('grab');G.shake&&G.shake(.2);if(n>=need)mini.end('ok')},end:r=>{cancelAnimationFrame(raf);miniClose();res(r)}}})}
/* ---------- inbreken, doorzoeken, alarm ---------- */
function alarm(p,why){p.alarmT=10;p.alarmed=1;G.snd&&G.snd.fx('carAlarm');G.crime&&G.crime(p.x,p.z,{why:why||'autokraak',stars:1});G.bubble&&G.bubble(p,'BIEP BIEP',{col:'#ffb04a',y:2.4,life:3})}
async function breakIn(p,how){const why=kraakWhy();if(why){G.toast(why,'bad');return}const c=kraakRef();S.energy-=crEn(c);S.cd=S.cd||{};S.cd.stadKraak=now()+crimeCd(c);sv();
  if(how==='smash'){const r=await gameSmash();if(r==='cancel')return;p.st='ruit';G.snd&&G.snd.fx('glass');G.fx2&&G.fx2.burst(p.x,1.3,p.z,'#e8f2ff',12);if(p.sec||Math.random()<.4)alarm(p);else G.crime&&G.crime(p.x,p.z,{why:'autokraak',stars:1,rep:-1})}
  else{const r=await gamePick(p);if(r==='cancel')return;if(r==='alarm'){alarm(p);if(p.sec>=1){G.toast('Het alarm gaat af! Wegwezen of snel zijn.','bad')}}p.st='open';G.snd&&G.snd.fx('carDoor')}
  S.stats=S.stats||{};S.stats.stadKraak=(S.stats.stadKraak||0)+1;G.ev&&G.ev('kraak');sv();setTimeout(()=>{if(dist(p,G.P)<3.5&&!mini&&!G.driving)carMenu(p)},350)}
function search(p){const c=kraakRef(),t=tierOf(p.m),k=(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1)*(1+.25*(t-1)),got=[],z=G.zak?G.zak():[];
  for(let i=0;i<p.loot;i++){const it=pick(LOOT),v=Math.max(5,Math.round(rnd(c.min,c.max)*k*it[1]*.6));if(z.length<6){z.push({n:it[0],v});got.push(it[0])}}
  let cash=0;if(p.cash){cash=Math.max(5,Math.round(rnd(c.min,c.max)*.25*k));S.cash+=cash;if(typeof addZwart==='function')addZwart(cash)}
  p.searched=1;if(typeof addXp==='function')addXp(Math.max(1,Math.round(c.xp*.5)));if(typeof addHeat==='function')addHeat(1);sv();G.snd&&G.snd.fx(got.length?'grab':'coin');
  G.fx2&&G.fx2.float((got.length?got.join(' + ').toLowerCase():'niks bruikbaars')+(cash?' + '+fmt(cash):''),p.x,p.z,got.length||cash?'#ffd35a':'#9aa1ab');
  if(got.length&&(G.zak?G.zak().length:0)>=6)G.toast('Je zakken zitten vol. Verkoop eerst iets bij de heler.','info');
  if(typeof log==='function')log('Pixelstad: auto opengebroken ('+p.m.n+')'+(got.length?', '+got.join(', '):'')+(cash?', '+fmt(cash):''),'ok');
  setTimeout(()=>{if(dist(p,G.P)<3.5&&!G.driving)carMenu(p)},500)}
/* ---------- kortsluiten en wegrijden ---------- */
async function hotwire(p){const why=stealWhy(p);if(why){G.toast(why,'bad');return}const m=p.m,en=typeof carEn==='function'?carEn(m):6;S.energy-=en;S.cd=S.cd||{};S.cd.car=now()+(typeof carCd==='function'?carCd():30000);sv();
  let r;if(G.kraak){const k=await G.kraak.draad({d:Math.min(1,.15+.18*(p.sec||0)+.08*(tierOf(m)-1)),title:'Kortsluiten · '+m.n,vak:'kortsluit'});r=k==='cancel'?'cancel':k&&k.ok?'ok':'fail'}else r=await gameWire(p);if(r==='cancel'){G.toast('Je laat de draadjes hangen','info');return}
  if(r!=='ok'){if(p.sec)alarm(p,'autodiefstal');G.toast('Kortsluiten mislukt: de motor slaat niet aan','bad');p.wireFail=(p.wireFail||0)+1;return}
  G.snd&&G.snd.fx('engineStart');steal(p.mesh,p.m,p.data,p.kind,{sec:p.sec,x:p.x,z:p.z,ry:p.ry,src:'straat',alarm:p.alarmed||p.st==='ruit'});p.st='gestolen';const i=PK.indexOf(p);if(i>=0)PK.splice(i,1)}
// gestolen: rep = de eigenaar heeft hem als gestolen opgegeven (dan wil geen koper hem zonder nieuwe papieren), heat = hoe makkelijk
// de politie hem herkent (carjacking en alarm maken hem heet, overspuiten en papieren koelen hem af), papers = geregistreerd
function steal(mesh,m,data,kind,o){const t=tierOf(m),v={d:{name:m.n,max:16+t*3.4,col:data.c,kind},x:o.x,z:o.z,ry:o.ry,v:0,mesh,
    stolen:{m,data,sec:o.sec,src:o.src,t0:performance.now(),rep:o.rep||Math.random()<(.12+t*.05)?1:0,heat:clamp((o.src==='jack'?72:o.alarm?52:28)+t*3,0,100),papers:0},dmg:0};
  G.addVehicle(v);G.enterCar(v);
  S.stats=S.stats||{};S.stats.stadSteal=(S.stats.stadSteal||0)+1;G.ev&&G.ev('steel');sv();
  // tracker: na een tijdje meldt de eigenaar hem (de politie weet dan waar je bent)
  if(o.sec>=2)setTimeout(()=>{if(G.driving&&G.car===v&&!(G.police&&G.police.active())){G.toast('De tracker in de '+m.n+' heeft je verraden','bad');G.police&&G.police.report(G.P.x,G.P.z,{why:'autodiefstal',stars:1})}},rr(25000,45000));
  return v}
/* ---------- carjacken in het verkeer ---------- */
function jackWhy(){const R=typeof JACK_R!=='undefined'?JACK_R:4;if(rankIdx(S.xp)<R)return 'Carjacken kan vanaf '+RANKS[R][0];if(!weapon())return 'Je hebt een wapen nodig';const l=cdLeftMs('jack');if(l)return 'Even wachten: nog '+Math.ceil(l/1000)+' s';
  const en=typeof JACK_EN!=='undefined'?JACK_EN:8;if(S.energy<en)return 'Te moe: '+en+' energie nodig';if(G.police&&G.police.active())return 'Niet met de politie in de buurt';return ''}
function jackMenu(c){G.talking=true;const m=c.md.m,R=rar(m),x=c.md.x,w=jackWhy();c.hold=1;
  K.dialog({name:m.n,role:R[0]+' · staat stil',draw:cv=>K.carPic(cv,x.c,G.carKind(m.b),{}),lines:[`Er zit iemand achter het stuur. Straatwaarde ${fmt(x.v)}. Met een wapen trek je de bestuurder eruit, maar dit ziet iedereen.`],col:R[1],
    choices:[{t:'Bestuurder eruit trekken',sub:weapon()?'Met je '+weapon().n.toLowerCase():'',ic:K.ic.rob,risk:3,dis:!!w,why:w,f:()=>{K.closeDialog(true);jack(c)}},{t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()}],onClose:()=>{G.talking=false;c.hold=0}})}
async function jack(c){const w=jackWhy();if(w){G.toast(w,'bad');return}S.energy-=(typeof JACK_EN!=='undefined'?JACK_EN:8);S.cd=S.cd||{};S.cd.jack=now()+4*60000*(typeof waitK==='function'?waitK():1);sv();c.hold=1;G.pArm=-1.5;
  const r=await gameStruggle();G.pArm=0;c.hold=0;
  if(r!=='ok'){G.toast('De bestuurder geeft gas en is weg','bad');c.max=16;G.crime&&G.crime(c.x,c.z,{why:'carjacking',stars:1});return}
  // de bestuurder rent weg en belt 112; de auto is van jou (en wordt als gestolen gemeld)
  const TR=G.TRAF,i=TR.indexOf(c);if(i>=0)TR.splice(i,1);const p=M.nearestWalk(c.x+Math.cos(c.ry)*2,c.z-Math.sin(c.ry)*2,6)||{x:c.x+2,z:c.z};
  const n=G.spawnNpc(false);Object.assign(n,{x:p.x,z:p.z,st:'flee',t:0,from:G.P,flee:6});G.NPC.push(n);G.bubble&&G.bubble(n,'Mijn auto!',{col:'#ff9a9a'});G.snd&&G.snd.fx('scream');
  setTimeout(()=>{if(n.st==='flee'||n.st==='walk'){n.st='call';n.t=0;n.callT=rr(2.5,5);n.cx=n.x;n.cz=n.z;n.why='carjacking';n.stars=1}},rr(3000,6000));
  G.crime&&G.crime(c.x,c.z,{why:'carjacking',stars:1,victim:n});S.stats=S.stats||{};S.stats.jacks=(S.stats.jacks||0)+1;G.ev&&G.ev('jack');
  setTimeout(()=>{if(G.traf)G.traf.spawn(false,true)},4000);
  steal(c.mesh,c.md.m,c.md.x,G.carKind(c.md.m.b),{sec:typeof jackSecRoll==='function'?jackSecRoll(c.md.m):1,x:c.x,z:c.z,ry:c.ry,src:'jack',rep:1})}
/* ---------- afleveren: waar breng je hem heen ----------
 Garage Van der Plaat en je eigen chop shop hebben een werkplaats: rij voor de deur, sta stil en het menu gaat open (repareren,
 overspuiten, valse papieren, afleveren, verkopen, slopen). Ome Henk en het autokerkhof nemen hem zo van je over (E).
 Zodra je in een gestolen auto stapt staat de route naar de beste plek aan: een gouden lichtbaken in de stad, een knipperend punt
 op de minikaart en een markering op de grote kaart (G.autoGoal() voor wie het anders wil tekenen). */
const units=id=>typeof bizUnits==='function'?bizUnits(id):[];
const hasChop=()=>{try{return units('garage').length>0}catch(e){return false}};
const r10=x=>Math.round(x/10)*10;
// de plek voor de deur (stoeprand), waar een auto kan staan
const WERK={};
function werkAt(id){if(WERK[id])return WERK[id];const p=M.placeById(id);if(!p)return null;const f=p.face,o=f==='S'?[0,1]:f==='N'?[0,-1]:f==='E'?[1,0]:[-1,0];
  let x=p.door.x+o[0]*3.2,z=p.door.z+o[1]*3.2;const q=M.nearestWalk(x,z,5);if(q){x=q.x;z=q.z}return WERK[id]={x,z}}
const helerNpc=()=>G.helerContact||(G.NPC||[]).find(n=>n.arch==='heler'&&n.contact);
function points(){const v=G.driving&&G.car?G.car:null;if(!v)return [];const out=[],st=v.stolen,sh=!!st||(v.dmg||0)>=20;
  const gw=werkAt('cars');if(gw)out.push({k:'werk',id:'cars',x:gw.x,z:gw.z,n:'Garage Van der Plaat',t:st?'Werkplaats · afleveren':'Werkplaats · repareren',sh});
  if(hasChop()){const cw=werkAt('biz_garage');if(cw)out.push({k:'werk',id:'chop',x:cw.x,z:cw.z,n:'Jouw chop shop',t:st?'Werkplaats · slopen':'Werkplaats',sh})}
  if(st){const m=st.m,hn=helerNpc();let o=null;try{o=typeof helerWants==='function'?helerWants(m.id):null}catch(e){}
    let any=0;try{any=HELER_LV[helerLv()].any||0}catch(e){}
    // afleveren op straat voor Ome Henk (hij kijkt naar de weg)
    const hry=hn&&hn.home?hn.home.ry:-Math.PI/2;
    if(hn&&(o||any))out.push({k:'heler',x:hn.x+Math.sin(hry)*5,z:hn.z+Math.cos(hry)*5,n:'Ome Henk (heler)',t:o?'Afleveren bij de heler · ×'+String(o.k).replace('.',','):'Aan de heler verkopen · ×'+String(any).replace('.',','),o,sh:1});
    const sl=M.placeById('sloop');out.push({k:'sloop',x:sl.door.x,z:sl.door.z,n:'Autokerkhof De Sloop',t:S.sloop?'Slopen voor onderdelen':'Autokerkhof (nog niet van jou)',sh:1})}
  if(goal)out.forEach(p=>{if((goal.k==='heler'&&p.k==='heler')||(p.k==='werk'&&((goal.k==='garage'&&p.id==='cars')||(goal.k==='chop'&&p.id==='chop')))){p.goal=1;p.sh=1;p.t='Breng hem hier · '+p.n}});
  return out}
// voor de kaarten: wat je ziet (de bestemming ook als je even bent uitgestapt)
function shownPoints(){const L=points().filter(p=>p.sh);if(goal&&!L.some(p=>p.goal))L.push({k:goal.k,x:goal.x,z:goal.z,n:goal.n,t:'Breng hem hier · '+goal.n,goal:1,sh:1});return L}
G.autoPoints=shownPoints;
const dp=document.createElement('button');dp.className='sd-prompt sd-deliver';dp.hidden=true;document.body.appendChild(dp);
let nearPt=null,werkLatch=null;
function deliverStep(){const L=points();nearPt=null;let bd=9;L.forEach(p=>{const d=Math.hypot(G.P.x-p.x,G.P.z-p.z);if(d<(p.k==='werk'?7:9)&&d<bd){bd=d;nearPt=p}});ringsFor(L.filter(p=>p.sh&&!p.goal));
  // werkplaats: rij voor de deur en sta (bijna) stil, dan gaat het menu vanzelf open
  const c=G.car;if(werkLatch&&(!nearPt||nearPt.id!==werkLatch||bd>8))werkLatch=null;
  if(nearPt&&nearPt.k==='werk'&&bd<4.8&&c&&G.driving&&Math.abs(c.v)<2.5&&!W&&!wg&&!mini&&!G.talking&&werkLatch!==nearPt.id&&!(G.police&&G.police.active())){werkLatch=nearPt.id;dp.hidden=true;werkOpen(nearPt);return}
  if(!nearPt||W){dp.hidden=true;return}dp.hidden=false;dp.style.setProperty('--c','#f2c230');
  dp.innerHTML=`<i class="sd-pi">${nearPt.k==='werk'?K.ic.build:K.ic.key}</i><span class="sd-pt"><small>${E(nearPt.n)}</small><b>${E(nearPt.k==='werk'?'Werkplaats':nearPt.t)}</b></span><span class="sd-pk">${touch?'Tik':'<kbd>E</kbd>'}</span>`}
dp.addEventListener('click',()=>{if(!nearPt)return;if(nearPt.k==='werk')werkOpen(nearPt);else deliver(nearPt)});
// gouden ringen in de wereld waar je kunt afleveren (de bestemming zelf krijgt het grote baken)
const RINGS=[];function ringsFor(L){while(RINGS.length<L.length){const r=new TH.Mesh(new TH.RingGeometry(2.6,3.2,20),new TH.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.7,depthWrite:false}));r.rotation.x=-Math.PI/2;G.scene().add(r);RINGS.push(r)}
  RINGS.forEach((r,i)=>{const p=L[i];r.visible=!!p;if(p){r.position.set(p.x,.08,p.z);const s=1+Math.sin(performance.now()/250)*.06;r.scale.set(s,s,s)}})}
// waarde: schade kost tot 60% (waarde × (1 − 0,6 · schade/100)); geregistreerd (valse papieren) is 10% meer waard
const dmgK=d=>1-.6*clamp(d||0,0,100)/100;
const sellV=x=>typeof carSell==='function'?carSell(x):x;
function carOf(v){const st=v.stolen,m=st.m,x=st.data,d=Math.round(v.dmg||0),full=r10(sellV(x.v)*(st.papers?1.1:1)),val=r10(full*dmgK(d));
  const car={id:m.id,n:m.n,v:val,b:m.b,c:x.c,year:x.year,km:x.km,staat:d>50?'Slecht':d>20&&x.staat!=='Slecht'?'Redelijk':x.staat,rep:st.papers?0:st.rep?1:0};if(d>0){car.dmg=d;car.v0=full}if(st.papers)car.pap=1;return car}
// zelfde beloning als een gelukte diefstal in het klikspel (stealCar)
function credit(m,car){S.stats=S.stats||{};S.stats.cars=(S.stats.cars||0)+1;try{cxpAdd(m)}catch(e){}S.cred=(S.cred||0)+(tierOf(m)>=3?2:1);if(typeof addHeat==='function')addHeat(m.d*2);if(typeof addXp==='function')addXp(6+m.d*m.d*4+(m.leg?200:0));
  try{if(typeof famEv==='function')famEv('car',{v:car.v})}catch(e){}try{S.carDex=S.carDex||{};const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d}catch(e){}}
const garCap=()=>typeof garageCap==='function'?garageCap():2;
function toGarage(v){const m=v.stolen.m,cap=garCap();if(S.cars.length>=cap){G.toast('Je garage zit vol ('+cap+'). Verkoop of sloop eerst iets, of breng hem naar de heler of de sloop.','bad');return null}
  const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);clearGoal();G.snd&&G.snd.fx('lvl');G.fx2&&G.fx2.float(m.n+' · '+fmt(car.v),G.P.x,G.P.z,'#ffd35a');
  if(typeof log==='function')log(m.n+' gestolen in de Pixelstad ('+fmt(car.v)+')','ok');sv();G.ev&&G.ev('lever');return car}
function chopNow(v){const m=v.stolen.m,car=carOf(v);credit(m,car);G.removeVehicle(v);clearGoal();const R=typeof sloopRoll==='function'?sloopRoll(car):{net:Math.round(car.v*.5)},a=R.net;S.cash+=a;if(typeof addZwart==='function')addZwart(a);S.sloopN=(typeof sloopN==='function'?sloopN():S.sloopN||0)+1;
  G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.float('+'+fmt(a),G.P.x,G.P.z);G.toast(m.n+' gesloopt in je chop shop: '+fmt(a)+' zwart','ok');if(typeof log==='function')log(m.n+' gesloopt in je chop shop ('+fmt(a)+')','ok');G.ev&&G.ev('lever');sv();return a}
function deliver(pt){if(pt.k==='werk'){werkOpen(pt);return}const v=G.car;if(!v||!v.stolen)return;if(G.police&&G.police.active()){G.toast('Schud eerst de politie af','bad');return}const m=v.stolen.m;
  if(v.dead){G.toast('Total loss. Hier geeft niemand meer iets voor.','bad');return}
  if(pt.k==='heler'){const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);clearGoal();const ci=S.cars.indexOf(car);
    if(pt.o){const oi=carOrders().list.indexOf(pt.o);act.carOrder(oi,ci)}else act.carHelerAny(ci);G.snd&&G.snd.fx('cash');G.ev&&G.ev('lever');sv();return}
  if(pt.k==='sloop'){if(!S.sloop){G.toast('Het autokerkhof is nog niet van jou. Koop het in de garage of hier binnen.','bad');garageOpen('sloop');return}
    const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);clearGoal();act.carSloop(S.cars.indexOf(car));G.snd&&G.snd.fx('build');G.ev&&G.ev('lever');sv()}}
/* ---------- bestemming: route, baken, knipperend punt ---------- */
let goal=null,myWp=null,goalSpot=null,bcn=null;
function goalFor(v){if(!v||!v.stolen||v.dead)return null;const m=v.stolen.m;let o=null;try{o=typeof helerWants==='function'?helerWants(m.id):null}catch(e){}
  const hn=helerNpc();if(o&&hn){const hry=hn.home?hn.home.ry:-Math.PI/2;return {k:'heler',x:hn.x+Math.sin(hry)*5,z:hn.z+Math.cos(hry)*5,n:'Ome Henk (heler)',msg:'Ome Henk zoekt precies deze. Breng hem naar Ome Henk · route staat aan',v}}
  const gw=werkAt('cars'),cw=hasChop()?werkAt('biz_garage'):null,full=S.cars.length>=garCap(),d=p=>Math.hypot(p.x-v.x,p.z-v.z);
  if(cw&&(full||d(cw)<d(gw)))return {k:'chop',x:cw.x,z:cw.z,n:'Jouw chop shop',msg:'Breng hem naar je chop shop · route staat aan',v};
  return {k:'garage',x:gw.x,z:gw.z,n:'Garage Van der Plaat',msg:'Breng hem naar Garage Van der Plaat · route staat aan',v}}
function setGoal(v){const g=goalFor(v);if(!g)return;goal=g;if(goalSpot){goalSpot.x=g.x;goalSpot.z=g.z}
  if(G.setWaypoint){const t=G.toast;G.toast=()=>{};try{G.setWaypoint(g.x,g.z,g.n)}catch(e){}finally{G.toast=t}myWp=G.waypoint||null}
  // grote kaart en minikaart: de bestemming pulseert (met een pijl aan de rand als hij buiten beeld is)
  try{if(G.kaart&&G.kaart.highlight)G.kaart.highlight(g.x,g.z,g.k==='heler'?'Breng hem naar Ome Henk':'Zet hem hier neer',{id:'autodoel',keep:true,c:'#4da3ff',ic:g.k==='heler'?'bag':'moer',sh:'sq'})}catch(e){}
  G.toast(g.msg,'lvl');G.snd&&G.snd.fx('notify')}
function clearGoal(){goal=null;if(myWp&&G.waypoint===myWp&&G.clearWaypoint)G.clearWaypoint();myWp=null;try{G.kaart&&G.kaart.unhighlight&&G.kaart.unhighlight('autodoel')}catch(e){}}
G.autoGoal=()=>goal?{k:goal.k,x:goal.x,z:goal.z,n:goal.n}:null;
{const oe=G.onEnterCar;G.onEnterCar=v=>{oe&&oe(v);if(v&&v.stolen&&!v.dead)setGoal(v)}}
// uitstappen: route en markering weg (stap je weer in, dan staan ze er meteen weer)
{const ox=G.onExitCar;G.onExitCar=v=>{ox&&ox(v);if(goal&&goal.v===v)clearGoal()}}
{const orv=G.onRemoveVehicle;G.onRemoveVehicle=v=>{orv&&orv(v);if(goal&&goal.v===v)clearGoal()}}
// het baken: een gouden lichtzuil, ringen op de grond, een draaiend ruitje en een bordje
function beaconMk(){const g=new TH.Group(),add=(geo,mat,y)=>{const m=new TH.Mesh(geo,mat);m.position.y=y;m.renderOrder=4;g.add(m);return m};
  const beam=add(new TH.CylinderGeometry(1.6,1.6,90,14,1,true),new TH.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.2,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}),45);
  const core=add(new TH.CylinderGeometry(.5,.5,90,8,1,true),new TH.MeshBasicMaterial({color:0xffe9a8,transparent:true,opacity:.4,blending:TH.AdditiveBlending,depthWrite:false}),45);
  const ring=add(new TH.RingGeometry(3.4,4.2,36),new TH.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.9,depthWrite:false,side:TH.DoubleSide}),.1);ring.rotation.x=-Math.PI/2;
  const ring2=add(new TH.RingGeometry(4.4,4.75,36),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.8,depthWrite:false,side:TH.DoubleSide}),.11);ring2.rotation.x=-Math.PI/2;
  const gem=add(new TH.OctahedronGeometry(1.1,0),new TH.MeshBasicMaterial({color:0xffd35a}),7);
  let sign=null;try{sign=K.sign('BRENG HEM HIER','#111111','#f2c230','#000000',1.1);sign.position.y=9.4;sign.renderOrder=5;g.add(sign)}catch(e){}
  g.userData={beam,core,ring,ring2,gem,sign};g.visible=false;G.scene().add(g);return g}
function beaconStep(ts){if(!bcn)return;bcn.visible=!!goal;if(!goal)return;const u=bcn.userData,ph=(ts*.8)%1;bcn.position.set(goal.x,0,goal.z);
  u.beam.material.opacity=.15+Math.sin(ts*3)*.06;u.core.material.opacity=.3+Math.sin(ts*3)*.1;u.ring2.scale.setScalar(1+ph*.4);u.ring2.material.opacity=.8*(1-ph);
  u.ring.scale.setScalar(1+Math.sin(ts*4)*.04);u.gem.rotation.y=ts*1.8;u.gem.position.y=7+Math.sin(ts*2.2)*.35;if(u.sign)u.sign.rotation.y=G.yaw||0}
/* ---------- E: afleveren, werkplaats, auto, carjacken ---------- */
const prevI=G.interact;G.interact=function(){if(mini||wg||W)return true;if(G.driving){if(nearPt){deliver(nearPt);return true}return false}if(prevI&&prevI())return true;if(target){carMenu(target);return true}if(jackT){jackMenu(jackT);return true}return false};
/* ---------- verkeer dat stilstaat voor carjacken (c.hold) ---------- */
// (stad-cars.js laat een auto met c.hold stilstaan via blockedAhead: de speler staat ervoor)
/* ---------- kaartjes op de minikaart: de bestemming knippert (wit/goud) ---------- */
const blink=()=>Math.floor(performance.now()/320)%2===0;
G.autoDots=()=>{const out=[],b=blink();shownPoints().forEach(p=>out.push({x:p.x,z:p.z,c:p.goal?(b?'#ffffff':'#f2c230'):'#f2c230',big:p.goal?1:0,goal:p.goal?1:0,n:p.n}));if(G.orderCar&&G.orderCar.st!=='gestolen')out.push({x:G.orderCar.x,z:G.orderCar.z,c:'#ff7a1a'});return out};
/* ---------- de heler zoekt: zet er een in de stad ---------- */
function findOrder(id){const m=CARS.find(k=>k.id===id);if(!m)return;let p=PK.find(q=>q.m.id===id&&q.st!=='gestolen');
  if(!p){const P=G.P,free=M.props.filter(sp=>sp.k==='car'&&!PK.some(q=>q.sp===sp)).sort((a,b)=>Math.abs(dist(a,P)-90)-Math.abs(dist(b,P)-90));const sp=free[0]||M.props.find(q=>q.k==='car');
    const old=PK.find(q=>q.sp===sp);if(old){G.scene().remove(old.mesh);PK.splice(PK.indexOf(old),1)}const x=carData(m,M.districtAt(sp.x,sp.z));const kind=G.carKind(m.b),mesh=G.carMesh(qcol(x.c),kind,false),ry=sp.rot?0:Math.PI/2;mesh.position.set(sp.x,0,sp.z);mesh.rotation.y=ry;G.scene().add(mesh);
    p={sp,m,data:x,kind,mesh,ry,x:sp.x,z:sp.z,sec:typeof jackSecRoll==='function'?jackSecRoll(m):1,loot:0,st:'dicht',alarmT:0};PK.push(p)}
  G.orderCar=p;G.setWaypoint&&G.setWaypoint(p.x,p.z,m.n+' (voor de heler)');G.toast('Ome Henk weet waar er een '+m.n+' staat. Op je kaart gezet.','info')}
/* ---------- Garage Van der Plaat en het autokerkhof ---------- */
const MECH={skin:'#f1caa5',hair:'#4a2e1a',top:'#2e5f9a',hat:'cap',hatC:'#f0b23a',beard:1,bg:'#141c2a'};
const gui=document.createElement('div');gui.className='sd-board sd-vg sd-gar';gui.id='sdGar';gui.hidden=true;document.body.appendChild(gui);
gui.innerHTML=`<div class="sd-bd"><div class="sd-vg-top"><canvas class="sd-vg-por" id="sdGarPor" width="24" height="24"></canvas><div class="sd-vg-who"><small id="sdGarK">Garage Van der Plaat</small><b id="sdGarT">Jouw auto's</b><p id="sdGarSay"></p></div>
 <div class="sd-vg-money"><span><i>Contant</i><b id="sdGarCash"></b></span><span><i>Wit</i><b id="sdGarWit"></b></span></div><button class="sd-x" data-close aria-label="Sluiten">×</button></div>
 <div class="sd-bd-tabs" id="sdGarTabs"></div><div class="sd-vg-list" id="sdGarList"></div></div>`;
let gtab='mine',gfocus=null;
const mOf=c=>(typeof CARS!=='undefined'&&CARS.find(m=>m.id===c.id))||{d:1,n:c.n,b:c.b};
function gbtn(l,d,o){o=o||{};return `<button class="btn sm${o.ghost?' ghost':''}" ${d} ${o.dis?'disabled':''} ${o.title?`title="${E(o.title)}"`:''}>${E(l)}</button>`}
function carCard(c,i){const m=mOf(c),R=rar(m),rep=typeof carRep==='function'&&carRep(c),o=c.offer,amt=o&&typeof offerAmt==='function'?offerAmt(c):0;let order=null;try{order=helerWants(c.id)}catch(e){}
  const any=(()=>{try{return HELER_LV[helerLv()].any||0}catch(e){return 0}})(),left=typeof saleLeft==='function'?saleLeft():0,T=tCar(c),paint=costPaint(T),papers=costPap(T),dm=Math.round(c.dmg||0),fix=costRep(T);
  let acts=gbtn('Rijden','data-drive="'+i+'"',{dis:dm>=100,title:dm>=100?'Total loss: eerst repareren':''});
  if(dm>0)acts+=gbtn('Repareren · '+fmt(fix),'data-rpr="'+i+'"',{dis:S.cash<fix,title:'Deuken uitkloppen: de waarde komt terug'});
  if(!rep){if(o)acts+=`<span class="sd-gar-offer"><b>${fmt(amt)}</b><small>${E(o.who)} · ${o.bank?'naar je bank':'contant'} · wit</small></span>`+gbtn('Verkopen','data-acc="'+i+'"')+gbtn(left?'Ander bod':'Geen kopers meer','data-rej="'+i+'"',{ghost:1,dis:!left});
    else acts+=gbtn(left?'Bod vragen':'Wacht op kopers','data-off="'+i+'"',{ghost:1,dis:!left})}
  else acts+=gbtn('Valse papieren · '+fmt(papers),'data-pap="'+i+'"',{ghost:1,dis:S.cash<papers,title:'Dan kun je hem weer gewoon verkopen'});
  if(order)acts+=gbtn('Heler ×'+String(order.k).replace('.',',')+' · '+fmt(Math.round(c.v*order.k/10)*10),'data-ord="'+i+'"');else if(any)acts+=gbtn('Heler ×'+String(any).replace('.',','),'data-any="'+i+'"',{ghost:1});
  if(S.sloop)acts+=gbtn('Slopen · ±'+fmt(typeof sloopEst==='function'?sloopEst(c):Math.round(c.v*.6)),'data-slp="'+i+'"',{ghost:1});
  acts+=gbtn('Overspuiten · '+fmt(paint),'data-pnt="'+i+'"',{ghost:1,dis:S.cash<paint});
  return `<article class="sd-vg-c${gfocus===i?' focus':''}" style="--k:${R[1]}"><span class="sd-vg-th sd-car-th" data-cp="${i}"></span><div class="sd-vg-m"><b>${E(c.n)}</b><small>${c.year||''} · ${(c.km||0).toLocaleString('nl-NL')} km · ${E(c.staat||'')}</small>
   <div class="sd-vg-ch"><em style="background:${R[1]};color:#111">${E(R[0])}</em><em class="ok">${fmt(c.v)}</em>${dm>=100?'<em class="b">total loss</em>':dm>0?'<em class="b">schade '+dm+'%</em>':''}${c.pap?'<em>geregistreerd</em>':''}${rep?'<em class="b">gemeld als gestolen</em>':''}${c.hot?'<em>heet</em>':''}</div></div><div class="sd-vg-a">${acts}</div></article>`}
function grender(){if(gui.hidden)return;$s('sdGarCash').textContent=fmt(S.cash);$s('sdGarWit').textContent=fmt(typeof wit==='function'?wit():S.cash);
  const cap=typeof garageCap==='function'?garageCap():2,O=(()=>{try{return carOrders()}catch(e){return {list:[]}}})(),open=O.list.filter(o=>!o.done).length;
  $s('sdGarTabs').innerHTML=[['mine',"Jouw auto's ("+S.cars.length+'/'+cap+')'],['heler','Heler zoekt'+(open?' ('+open+')':'')],['sloop','Sloop'],['garage','Garage']].map(([k,n])=>`<button data-tab="${k}" class="${gtab===k?'on':''}">${n}</button>`).join('')+'<span class="sd-vg-sp"></span><button data-klik class="sd-vg-klik">Alle details ↗</button>';
  let h='';
  if(gtab==='mine'){h=S.cars.length?S.cars.map(carCard).join(''):`<div class="sd-vg-empty"><b>Je garage is leeg</b><p>Op straat staan genoeg auto's. Breek er een open, sluit hem kort en rij hem hierheen.</p></div>`;
    h+=`<div class="sd-vg-hint">${K.ic.key}<span>Rij een auto voor de deur en sta stil: dan gaat de werkplaats open (repareren, overspuiten, valse papieren, afleveren). Schade kost waarde.</span></div>`}
  else if(gtab==='heler'){let L=null;try{L=HELER_LV[helerLv()]}catch(e){}
    h=`<div class="sd-vg-hint">${K.ic.bag}<span>Ome Henk staat bij Het Contact. ${L?'Jouw niveau bij hem: <b>'+E(L.n)+'</b>. ':''}Lever een gevraagd model af en hij betaalt een veelvoud van de waarde.</span></div>`+
     (O.list.map((o,i)=>{const m=CARS.find(k=>k.id===o.id)||{n:o.id,d:1},R=rar(m),ci=S.cars.findIndex(c=>c.id===o.id);
      return `<article class="sd-vg-c${o.done?' lock':''}" style="--k:${R[1]}"><span class="sd-vg-th sd-car-th" data-mp="${o.id}"></span><div class="sd-vg-m"><b>${E(m.n)}${o.spoed?' · spoed':''}</b><small>${E(R[0])} · ${fmt(m.lo)} tot ${fmt(m.hi)}</small><div class="sd-vg-ch"><em class="ok">×${String(o.k).replace('.',',')}</em>${o.done?'<em>geleverd</em>':o.hired?'<em class="b">iemand is onderweg</em>':''}</div></div>
       <div class="sd-vg-a">${o.done||o.hired?'':(ci>=0?gbtn('Leveren uit je garage','data-ord="'+ci+'"'):'')+gbtn('Zoek er een in de stad','data-find="'+o.id+'"',{ghost:ci>=0})}</div></article>`}).join('')||'<p class="sd-bd-none">De heler heeft nu geen bestellingen.</p>')}
  else if(gtab==='sloop'){if(!S.sloop){const ok=rankIdx(S.xp)>=(typeof SLOOP_R!=='undefined'?SLOOP_R:3);h=`<div class="sd-vg-empty"><b>Autokerkhof De Sloop</b><p>Op de havenkade. Een auto die niemand wil kopen (gemeld als gestolen) haal je hier uit elkaar: zwart geld voor de onderdelen.</p>${ok?gbtn('Kopen · '+fmt(typeof SLOOP_P!=='undefined'?SLOOP_P:80000)+' wit','data-buysl',{dis:(typeof wit==='function'?wit():0)<(typeof SLOOP_P!=='undefined'?SLOOP_P:80000)}):`<p>Vanaf ${E(RANKS[SLOOP_R][0])}.</p>`}</div>`}
    else{let lv='';try{lv=SLOOP_LV[sloopLv()][0]}catch(e){}h=`<div class="sd-vg-hint">${K.ic.build}<span>Sloop-ervaring: <b>${E(lv)}</b>. Hoe vaker je sloopt, hoe minder schade en kosten. Rij een gestolen auto het terrein op en druk op E om hem meteen te slopen.</span>${S.cars.length?gbtn('Alles slopen','data-slpall',{ghost:1}):''}</div>`+S.cars.map(carCard).join('')}}
  else{const L=typeof garageLvl==='function'?garageLvl():0,max=typeof GARAGE_CAPS!=='undefined'?GARAGE_CAPS.length-1:4;h=`<div class="sd-vg-empty"><b>${cap} plekken</b><p>Uitbouwen betaal je met wit geld.</p>${L<max?gbtn('Uitbouwen naar '+GARAGE_CAPS[L+1]+' plekken · '+fmt(GARAGE_UP[L+1]),'data-gup',{dis:(typeof wit==='function'?wit():0)<GARAGE_UP[L+1]}):'<p>Je garage is zo groot als hij kan worden.</p>'}</div>`}
  const list=$s('sdGarList'),top=list.scrollTop;list.innerHTML=h;list.scrollTop=top;
  list.querySelectorAll('[data-cp]').forEach(s=>{const c=S.cars[+s.dataset.cp];if(c)s.appendChild(K.carPic(document.createElement('canvas'),c.c,G.carKind(c.b),{}))});
  list.querySelectorAll('[data-mp]').forEach(s=>{const m=CARS.find(k=>k.id===s.dataset.mp);if(m)s.appendChild(K.carPic(document.createElement('canvas'),typeof carSig==='function'?carSig(m):'#8a929c',G.carKind(m.b),{}))})}
const GSAY=['Wat kan ik voor je doen, baas?','Laat maar zien wat je hebt.','Kentekens, papieren, een likje verf. Alles kan.','Die heler belde weer. Hij zoekt iets.'];
function garageOpen(tab){gtab=tab||'mine';gfocus=null;gui.hidden=false;G.pause();K.portrait(MECH,'blij',$s('sdGarPor'));$s('sdGarK').textContent=tab==='sloop'?'Autokerkhof De Sloop':'Garage Van der Plaat';$s('sdGarT').textContent=tab==='sloop'?'Slopen':"Jouw auto's";
  K.type($s('sdGarSay'),tab==='sloop'?'Alles wat rijdt, krijg ik uit elkaar.':pick(GSAY),{blip:false});G.snd&&G.snd.fx('door');grender();clearInterval(gui._t);gui._t=setInterval(()=>{if(gui.hidden)clearInterval(gui._t);else grender()},2000)}
function garageClose(){if(gui.hidden)return;gui.hidden=true;G.snd&&G.snd.fx('close');if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
G.garage={open:garageOpen,close:garageClose};
gui.addEventListener('click',e=>{const t=e.target.closest('button');if(e.target===gui||(t&&t.dataset.close!=null)){garageClose();return}if(!t)return;G.snd&&G.snd.fx('click');const d=t.dataset;
  if(d.tab){gtab=d.tab;grender();return}
  if(d.klik!=null){garageClose();G.ui&&G.ui.enterDirect(M.placeById('cars'));return}
  if(d.drive){const i=+d.drive;garageClose();G.bringCar&&G.bringCar(i);return}
  if(d.off){act.carOffer(+d.off);grender();return}
  if(d.rej){act.carReject(+d.rej);grender();return}
  if(d.acc){act.carAccept(+d.acc);G.snd&&G.snd.fx('cash');grender();return}
  if(d.ord){const i=+d.ord,c=S.cars[i];const o=helerWants(c.id);if(o)act.carOrder(carOrders().list.indexOf(o),i);grender();return}
  if(d.any){act.carHelerAny(+d.any);grender();return}
  if(d.slp){act.carSloop(+d.slp);G.snd&&G.snd.fx('build');grender();return}
  if(d.slpall!=null){if(gui._sa&&performance.now()-gui._sa<3000){act.sloopAll();gui._sa=0}else{gui._sa=performance.now();G.toast('Nog een keer om al je auto\'s te slopen','info')}grender();return}
  if(d.buysl!=null){act.buySloop();grender();return}
  if(d.gup!=null){act.garageUp();grender();return}
  if(d.find){garageClose();findOrder(d.find);return}
  // werk aan een auto in je garage: het bord gaat even dicht voor het spelletje en daarna weer open
  if(d.rpr||d.pap||d.pnt){const c=S.cars[+(d.rpr||d.pap||d.pnt)];if(!c)return;garageClose();werkFor(tCar(c),d.rpr?'rep':d.pap?'pap':'spuit');return}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!gui.hidden){e.stopImmediatePropagation();garageClose()}},true);
/* ---------- werkplaats: repareren, overspuiten, valse papieren ----------
 Rij voor de deur van Garage Van der Plaat (of je eigen chop shop) en sta stil: het menu gaat open. Betalen gaat contant (eerst je
 zwarte geld). Repareren = waarde × schade% × 0,25 (minstens G.schaal.zwart(0,6)), overspuiten = 4% van de waarde (minstens
 G.schaal.zwart(1)), valse papieren = 15% (minstens G.schaal.zwart(3)). Elk klusje is een spelletje met eigen vakmanschap
 ('repareren', 'spuiten', 'vervalsen'). Stop je halverwege (Esc of ×), dan krijg je je geld terug; mislukte papieren kosten wel geld.
 - Repareren: elke deuk één klap op het goede moment. Alles raak = schade weg; anders een deel.
 - Overspuiten: houd het spuitpistool op de lijn (drie banen). Hoe netter, hoe minder heet de auto daarna is (tot −85%).
 - Valse papieren: trek de handtekening over voor de tijd op is. Gelukt = geregistreerd: niet meer 'gemeld', 10% meer waard, koud. */
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k);
const ease=k=>{try{return G.vak?clamp(G.vak.ease(k),0,1):0}catch(e){return 0}};
const slp=ms=>new Promise(r=>setTimeout(r,ms));
function recolor(v,col){if(!v||!v.mesh)return;const m=G.carMesh(qcol(col),v.d.kind,false);m.position.copy(v.mesh.position);m.rotation.copy(v.mesh.rotation);m.scale.copy(v.mesh.scale);G.scene().remove(v.mesh);G.scene().add(m);v.mesh=m;v._mat=null;v.d.col=col;G.carLook&&G.carLook(v)}
// een auto om aan te werken: in de stad (v) of in je garage (c = een auto uit S.cars)
function tVeh(v){const st=v.stolen,e=v.own&&v.d&&v.d.o?v.d.o.c:null;
  return {v,e,st,name:v.d.name,kind:v.d.kind,own:!!v.own,col:()=>st?st.data.c:e?e.c:v.d.col,raw:()=>st?st.data.v:e?(e.v0||e.v):12000,
    full:()=>st?r10(sellV(st.data.v)*(st.papers?1.1:1)):e?(e.v0||e.v):0,dmg:()=>v.dmg||0,
    setDmg:d=>{v.dmg=d;if(d<100){v.dead=0;v.deadT=0}v.fireT=0;G.carLook&&G.carLook(v);G.carPersist&&G.carPersist(v);G.carHud&&G.carHud()},
    paint:c=>{recolor(v,c);if(st)st.data.c=c;if(e)e.c=c;sv()},
    stolen:!!st,rep:()=>!!(st&&st.rep&&!st.papers),papers:()=>!!(st&&st.papers),heat:()=>st?Math.round(st.heat||0):0,
    setPapers:()=>{if(st){st.papers=1;st.rep=0;st.heat=0}},cool:k=>{if(st){st.heat=Math.round((st.heat||0)*k);st.paint=1}}}}
function tCar(c){const live=()=>(G.vehicles||[]).find(v=>v.own&&v.d&&v.d.o&&v.d.o.c===c);
  return {c,name:c.n,kind:G.carKind(c.b),own:true,garage:true,col:()=>c.c,raw:()=>c.v0||c.v,full:()=>c.v0||c.v,dmg:()=>c.dmg||0,
    setDmg:d=>{d=Math.round(d);if(c.v0==null)c.v0=c.v;c.dmg=d;c.v=r10(c.v0*dmgK(d));if(!d)delete c.dmg;const l=live();if(l){l.dmg=d;if(d<100)l.dead=0;G.carLook&&G.carLook(l)}sv()},
    paint:col=>{c.c=col;const l=live();if(l)recolor(l,col);sv()},stolen:false,rep:()=>typeof carRep==='function'?carRep(c):!!c.rep,papers:()=>!!c.pap,heat:()=>0,
    setPapers:()=>{c.rep=0;c.hot=0;if(!c.pap){c.pap=1;c.v=r10(c.v*1.1);if(c.v0!=null)c.v0=r10(c.v0*1.1)}sv()},cool:()=>{}}}
const costRep=T=>{const d=T.dmg();return d<1?0:Math.max(zS(.6),r10(T.raw()*Math.min(100,d)/100*.25))};
const costPaint=T=>Math.max(zS(1),r10(T.raw()*.04));
const costPap=T=>Math.max(zS(3),r10(T.raw()*.15));
const valNow=T=>r10(T.full()*dmgK(T.dmg()));
const KLEUR=[['#c9cfd6','Zilver'],['#1d1d1f','Zwart'],['#e6e1d6','Wit'],['#b8333a','Rood'],['#3a5fa8','Blauw'],['#2f6b4a','Groen'],['#d8a23a','Goud'],['#50565f','Grafiet'],['#7a3c8a','Paars'],['#f08a24','Oranje'],['#e8c547','Geel'],['#7fd1c7','Mint']];
const WSAY=['Zet hem maar neer. Wat moet er gebeuren?','Mooi ding. Waar is de eigenaar? Grapje.','Deuken, verf, papieren. Alles kan, contant.','Rustig. De buren kijken mee.'];
const wk=document.createElement('div');wk.className='sd-werk';wk.id='sdWerk';wk.hidden=true;wk.setAttribute('role','dialog');document.body.appendChild(wk);
let W=null;
function werkOpen(pt){const v=G.car;if(!v||!G.driving||W||wg)return;if(G.police&&G.police.active()){G.toast('Schud eerst de politie af','bad');return}
  if(Math.abs(v.v)>3){G.toast('Eerst stilstaan','info');return}v.v=0;W={pt,T:tVeh(v),view:'main',sel:-1,say:pick(WSAY),chop:!!(pt&&pt.id==='chop')};wShow()}
// vanuit het garagemenu: meteen een klus aan een auto in je garage
function werkFor(T,k){if(W||wg)return;W={pt:null,T,view:'main',sel:-1,say:'',board:1};G.talking=true;G.vak&&G.vak.stage('werk',1);wAct(k)}
function wShow(say){if(!W)return;if(say!=null)W.say=say;G.talking=true;G.stopPath&&G.stopPath();G.vak&&G.vak.stage('werk',1);const was=wk.hidden;wk.hidden=false;
  if(was){wk.classList.remove('go');void wk.offsetWidth;wk.classList.add('go');G.snd&&G.snd.fx('door')}wrender()}
function werkClose(quiet){if(!W)return;const b=W.board;W=null;wk.hidden=true;G.talking=false;G.vak&&G.vak.stage('werk',0);if(!quiet)G.snd&&G.snd.fx('close');if(b)setTimeout(()=>garageOpen('mine'),60)}
G.werk={open:()=>{if(nearPt&&nearPt.k==='werk')werkOpen(nearPt)},close:werkClose,isOpen:()=>!!W};
G.carLock=()=>!!W||!!wg;
function wbtn(b,cls){return `<button class="sd-werk-b ${cls}${b.ghost?' ghost':''}${b.dis?' dis':''}" data-w="${E(b.k)}" ${b.dis?'aria-disabled="true"':''} ${b.dis&&b.why?`data-why="${E(b.why)}"`:''}>${b.ic?`<i>${b.ic}</i>`:''}<span><b>${E(b.t)}</b>${b.dis&&b.why?`<small>${E(b.why)}</small>`:b.sub?`<small>${E(b.sub)}</small>`:''}</span></button>`}
function wrender(){if(!W)return;const T=W.T,d=Math.round(T.dmg()),st=T.stolen,cash=S.cash,dead=d>=100;let h='';
  const head=`<div class="sd-werk-h"><canvas class="sd-werk-por" width="24" height="24"></canvas><div class="sd-werk-who"><small>${W.chop?'Jouw chop shop · werkplaats':'Garage Van der Plaat · werkplaats'}</small><b>${E(T.name)}</b><p>${E(W.say||'')}</p></div><button class="sd-x" data-w="weg" aria-label="Sluiten">×</button></div>`;
  if(W.view==='kleur'){const cP=costPaint(T),cur=qcol(T.col());
    h=head+`<p class="sd-werk-q">Welke kleur wordt het? Overspuiten kost <b>${fmt(cP)}</b>.${st&&!T.papers()?' Een andere kleur maakt hem minder herkenbaar.':''}</p>
      <div class="sd-werk-kl">${KLEUR.map(([c,n])=>`<button class="sd-werk-b kl${c===cur?' nu':''}" data-w="kleur:${c}" style="--k:${c}"><i></i><span><b>${n}</b></span></button>`).join('')}</div>
      <div class="sd-werk-end">${wbtn({k:'terug',t:'Terug',ghost:1},'end')}</div>`}
  else{const cR=costRep(T),cP=costPaint(T),cX=costPap(T),val=valNow(T),full=r10(T.full()),heat=T.heat();
    const pap=!st?(T.own?'Op jouw naam':'In orde'):T.papers()?'Geregistreerd':st.rep?'Gemeld als gestolen':'Nog niet gemeld';
    const svc=[{k:'rep',t:'Repareren',ic:K.ic.moer||K.ic.build,sub:'Deuken uitkloppen · '+fmt(cR),dis:d<1||cash<cR,why:d<1?'Hij is nog heel':'Je hebt '+fmt(cR)+' contant nodig'},
      {k:'spuit',t:'Overspuiten',ic:K.ic.spuit,sub:(st&&!T.papers()?'Minder herkenbaar · ':'Nieuwe kleur · ')+fmt(cP),dis:cash<cP||!!(T.v&&T.v.verhaal),why:T.v&&T.v.verhaal?'Deze niet':'Je hebt '+fmt(cP)+' contant nodig'}];
    if(st)svc.push({k:'pap',t:'Valse papieren',ic:K.ic.akte||K.ic.krant,sub:'Geregistreerd: verkoopt beter · '+fmt(cX),dis:T.papers()||cash<cX||dead,why:T.papers()?'Al geregistreerd':dead?'Total loss':'Je hebt '+fmt(cX)+' contant nodig'});
    const end=[];
    if(st&&!W.chop){const full2=S.cars.length>=garCap(),rep=T.rep(),left=typeof saleLeft==='function'?saleLeft():0;
      end.push({k:'garage',t:'In je garage zetten',ic:K.ic.key,sub:'Waarde '+fmt(val),dis:full2||dead,why:dead?'Total loss':'Je garage zit vol ('+S.cars.length+'/'+garCap()+')'});
      end.push({k:'verkoop',t:'Verkopen',ic:K.ic.sell,sub:'Een koper laten bieden',dis:full2||rep||!left||dead,why:dead?'Total loss':full2?'Je garage zit vol':rep?'Gemeld: eerst valse papieren':'Geen kopers meer dit uur'})}
    if(st&&W.chop)end.push({k:'sloop',t:'Slopen voor onderdelen',ic:K.ic.build,sub:'± '+fmt(typeof sloopEst==='function'?sloopEst({v:val}):r10(val*.6))+' zwart',dis:dead,why:'Total loss'});
    end.push({k:'weg',t:'Wegrijden',ic:K.ic.route,ghost:1});
    h=head+`<div class="sd-werk-car"><span class="sd-werk-pic"><canvas></canvas></span><div class="sd-werk-st">
      <div class="sd-werk-row"><span>Schade</span><i class="sd-werk-bar dmg${d>=85?' hi':d>=50?' mid':''}"><i style="width:${d}%"></i></i><b>${dead?'total loss':d+'%'}</b></div>
      ${st?`<div class="sd-werk-row"><span>Hitte</span><i class="sd-werk-bar heat"><i style="width:${T.papers()?0:heat}%"></i></i><b>${T.papers()?'koud':heat>=60?'heet':heat>=30?'lauw':'koel'}</b></div>`:''}
      <div class="sd-werk-row"><span>Papieren</span><b class="${st&&T.rep()?'bad':T.papers()?'ok':''}">${pap}</b></div>
      <div class="sd-werk-val"><span>Waarde nu</span><b>${fmt(dead?0:val)}</b>${d>0&&!dead?`<small>heel ${fmt(full)}</small>`:''}</div></div></div>
     <div class="sd-werk-svc">${svc.map(b=>wbtn(b,'svc')).join('')}</div><div class="sd-werk-end">${end.map(b=>wbtn(b,'end')).join('')}</div>`}
  wk.innerHTML=`<div class="sd-werk-in">${h}</div>`;K.portrait(MECH,'blij',wk.querySelector('.sd-werk-por'));const pc=wk.querySelector('.sd-werk-pic canvas');if(pc)K.carPic(pc,T.col(),T.kind,{});
  wsel(W.sel<0?firstOn():W.sel)}
const wBtns=()=>[...wk.querySelectorAll('.sd-werk-b')];
function firstOn(){const L=wBtns(),i=L.findIndex(b=>!b.classList.contains('dis'));return i<0?L.length-1:i}
function wsel(i){const L=wBtns();if(!L.length||!W)return;W.sel=(i+L.length)%L.length;L.forEach((b,j)=>b.classList.toggle('on',j===W.sel))}
wk.addEventListener('click',e=>{const b=e.target.closest('[data-w]');if(!b||!W)return;if(b.classList.contains('dis')){G.toast(b.dataset.why||'Kan nu niet','bad');G.snd&&G.snd.fx('bad');return}G.snd&&G.snd.fx('click');wAct(b.dataset.w)});
addEventListener('keydown',e=>{if(!W||wg||wk.hidden)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;const k=e.key.toLowerCase();
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();if(W.view==='kleur'&&!W.board){W.view='main';W.sel=-1;wrender()}else werkClose();return}
  if(['arrowdown','s','arrowright','d'].includes(k)){e.preventDefault();e.stopImmediatePropagation();wsel(W.sel+1);G.snd&&G.snd.fx('tab');return}
  if(['arrowup','w','arrowleft','a'].includes(k)){e.preventDefault();e.stopImmediatePropagation();wsel(W.sel-1);G.snd&&G.snd.fx('tab');return}
  if((k==='e'||k===' '||k==='enter')&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();const b=wBtns()[W.sel];if(b)b.click();return}
  if(k==='f')e.stopImmediatePropagation()},true);
async function wAct(k){if(!W)return;const T=W.T;
  if(k==='weg'){werkClose();return}
  if(k==='terug'){if(W.board){werkClose();return}W.view='main';W.sel=-1;wrender();return}
  if(k==='spuit'){W.view='kleur';W.sel=-1;wShow();return}
  const pay=c=>{if(S.cash<c){G.toast('Je hebt '+fmt(c)+' contant nodig','bad');if(W&&W.board)werkClose(true);return false}S.cash-=c;sv();G.snd&&G.snd.fx('coin');return true};
  const back=(msg,cls)=>{if(!W)return;W.view='main';W.sel=-1;if(W.board){G.toast(msg,cls||'ok');werkClose(true)}else{wShow(msg);if(cls==='bad')G.snd&&G.snd.fx('bad')}};
  if(k==='rep'){const c=costRep(T);if(!c||!pay(c))return;wk.hidden=true;const r=await gameDeuk(T);
    if(r==='cancel'){S.cash+=c;sv();back('Dan niet. Hier is je geld terug.','info');return}
    const d0=T.dmg(),nd=r.ok?0:Math.round(d0*(1-r.fixed/r.n*.85));T.setDmg(nd);await slp(1150);
    back(r.ok?'Als nieuw. Nou ja, bijna.':nd<d0?'Half werk. Schade nog '+nd+'%.':'Dat werd niks. Schade nog '+nd+'%.',r.ok?'ok':'info');return}
  if(k.startsWith('kleur:')){const col=k.slice(6),c=costPaint(T);if(!pay(c))return;wk.hidden=true;const r=await gameSpuit(T,col);
    if(r==='cancel'){S.cash+=c;sv();back('Dan niet. Hier is je geld terug.','info');return}
    T.paint(col);T.cool(1-.85*r.score);await slp(1150);
    back(r.score>=.85?'Strak gespoten. Herken hem maar eens.':r.score>=.6?'Netjes genoeg.'+(T.stolen?' Hij valt minder op.':''):'Vlekkerig, maar wel een andere kleur.');return}
  if(k==='pap'){const c=costPap(T);if(!pay(c))return;wk.hidden=true;const r=await gameVervals(T);
    if(r==='cancel'){S.cash+=c;sv();back('Dan niet. Hier is je geld terug.','info');return}
    await slp(1150);if(r.ok){T.setPapers();if(typeof log==='function')log('Valse papieren voor de '+T.name+' ('+fmt(c)+')','info');back('Kenteken, papieren, alles klopt. Hij staat op een nieuwe naam.')}
    else back('De handtekening klopt niet. Papieren verscheurd, geld weg.','bad');return}
  if(k==='garage'){const car=toGarage(T.v);if(!car)return;werkClose(true);G.toast(T.name+' staat in je garage. Waarde '+fmt(car.v)+(car.rep?' (gemeld als gestolen)':''),'lvl');return}
  if(k==='verkoop'){const car=toGarage(T.v);if(!car)return;werkClose(true);const i=S.cars.indexOf(car);try{act.carOffer(i)}catch(e){}garageOpen('mine');gfocus=i;grender();return}
  if(k==='sloop'){chopNow(T.v);werkClose(true)}}
/* ---------- de spelletjes van de werkplaats (zelfde podium als de andere spelletjes) ---------- */
const gbx=document.createElement('div');gbx.className='sd-mini sd-stage sd-wg';gbx.hidden=true;document.body.appendChild(gbx);
let wg=null,ghT=0;const gk={L:0,R:0,U:0,D:0,tap:0};
function gOpen(title,sub,body,vk){clearTimeout(ghT);gbx.className='sd-mini sd-stage sd-wg';
  gbx.innerHTML=`<div class="sd-mini-h"><b>${E(title)}</b><small>${E(sub)}</small><button class="sd-x" data-gx aria-label="Stoppen">×</button></div>${vk&&G.vak?G.vak.bar(vk):''}<div class="sd-mini-b">${body}</div>`;
  gbx.hidden=false;gbx.classList.remove('go');void gbx.offsetWidth;gbx.classList.add('go');for(const k in gk)gk[k]=0;G.talking=true;G.vak&&G.vak.stage('werkg',1);G.snd&&G.snd.fx('whoosh')}
function gClose(r,vk,lab){wg=null;for(const k in gk)gk[k]=0;const hide=()=>{gbx.hidden=true;gbx.classList.remove('res','win','lose')};if(G.vak)ghT=G.vak.finish(gbx,'werkg',vk,r,hide,lab);else hide()}
const GMAP={arrowleft:'L',a:'L',arrowright:'R',d:'R',arrowup:'U',w:'U',arrowdown:'D',s:'D',' ':'tap',e:'tap',enter:'tap',f:'tap'};
addEventListener('keydown',e=>{if(!wg)return;const k=e.key.toLowerCase();if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();wg.end('cancel');return}
  const m=GMAP[k];if(!m)return;e.preventDefault();e.stopImmediatePropagation();if(!gk[m]&&wg.press)wg.press(m);gk[m]=1},true);
addEventListener('keyup',e=>{const m=GMAP[e.key.toLowerCase()];if(m)gk[m]=0},true);
gbx.addEventListener('pointerdown',e=>{if(e.target.closest('[data-gx]')){wg&&wg.end('cancel');return}const b=e.target.closest('[data-k]');if(!b||!wg)return;e.preventDefault();const m=b.dataset.k;if(!gk[m]&&wg.press)wg.press(m);gk[m]=1;b.classList.add('dn')});
const gUp=()=>{gbx.querySelectorAll('.dn').forEach(b=>{gk[b.dataset.k]=0;b.classList.remove('dn')})};addEventListener('pointerup',gUp);addEventListener('pointercancel',gUp);
function gLoop(f){let last=performance.now(),raf=0;const L=t=>{if(!wg)return;const dt=Math.min(.05,(t-last)/1000);last=t;f(dt,t);raf=requestAnimationFrame(L)};raf=requestAnimationFrame(L);return ()=>cancelAnimationFrame(raf)}
// het plaatje van de auto (K.carPic, 40×24) komt 4× zo groot in een doek van 192×104; carBody = waar de carrosserie zit
const SX=4,OX=16,OY=4;
function carBody(k){const low=k==='sport',tall=k==='suv'||k==='van'||k==='pickup',x0=k==='city'?6:3,x1=k==='city'?34:37,by=low?12:tall?9:11,bh=low?6:tall?9:7;return {x0,x1,by,bh,cy:low?by-4:tall?by-6:by-5}}
const popT=(el,t,cls)=>{if(!el)return;el.textContent=t;el.className='sd-pop '+cls;void el.offsetWidth;el.classList.add('on')};
// 1. deuken uitkloppen: per deuk één klap, op het moment dat het streepje in het groen staat
function gameDeuk(T){return new Promise(res=>{const vk='repareren',e=ease(vk),d=Math.max(5,T.dmg()),n=clamp(2+Math.round(d/22),2,6),allow=2+(e>.6?1:0),B=carBody(T.kind),sp=(1+.1*n)*(1-.3*e),w=clamp((.24-.015*n)*(.75+.6*e),.08,.34);
  let c=rr(.2,.8),t0=performance.now(),i=0,miss=0,over=false,lock=0,spark=0,shk=0;
  const dents=[];for(let j=0;j<n;j++){let x,y,k=0;do{x=B.x0+3+Math.random()*(B.x1-B.x0-6);y=B.by+1.5+Math.random()*Math.max(1,B.bh-3);k++}while(k<30&&dents.some(q=>Math.abs(q.x-x)<4.2));dents.push({x:OX+x*SX,y:OY+y*SX,r:rr(4,6.5),fix:0})}
  dents.sort((a,b)=>a.x-b.x);
  gOpen('Deuken uitkloppen',touch?'Tik als het streepje in het groen staat. Elke deuk één klap.':'Spatie als het streepje in het groen staat. Elke deuk één klap.',
   `<div class="sd-wg-vis"><canvas class="sd-wg-cv" width="192" height="104"></canvas></div>
    <div class="sd-pick"><div class="sd-pick-bar"><i class="z"><i></i></i><i class="m"></i><b class="sd-pop"></b></div><div class="sd-pick-ft"><div class="sd-pick-pins">${dents.map((_,j)=>`<i data-p="${j}"></i>`).join('')}</div><div class="sd-pick-miss"></div></div></div>
    <button class="btn sd-mini-go" data-k="tap">${touch?'':'<kbd>Spatie</kbd> '}Klop!</button>`,vk);
  const cv=gbx.querySelector('.sd-wg-cv'),x=cv.getContext('2d'),pic=K.carPic(document.createElement('canvas'),T.col(),T.kind,{}),bar=gbx.querySelector('.sd-pick-bar'),z=gbx.querySelector('.z'),mk=gbx.querySelector('.m'),pp=gbx.querySelector('.sd-pop'),ms=gbx.querySelector('.sd-pick-miss');
  const zone=()=>{z.style.left=(c-w/2)*100+'%';z.style.width=w*100+'%'};zone();
  const lives=()=>{const l=allow-miss;ms.textContent=l<=0?'Je mag niet meer missen':'Je mag nog '+l+' keer missen';ms.classList.toggle('last',l<=0)};lives();
  const pos=t=>(Math.sin((t-t0)/1000*sp*Math.PI)+1)/2;
  const stop=gLoop((dt,t)=>{const p=pos(t);mk.style.left=p*100+'%';spark=Math.max(0,spark-dt*3);shk=Math.max(0,shk-dt*4);const sx=shk?Math.round(rr(-1,1))*2:0;
    x.imageSmoothingEnabled=false;x.fillStyle='#14161b';x.fillRect(0,0,192,104);x.drawImage(pic,OX+sx,OY,160,96);
    dents.forEach((q,j)=>{if(q.fix){if(q.fix<1){q.fix=Math.min(1,q.fix+dt*2.5);x.fillStyle='rgba(255,255,230,'+((1-q.fix)*.85).toFixed(2)+')';x.fillRect(q.x-7+sx,q.y-4,14,8)}return}
      const r=q.r;x.fillStyle='rgba(0,0,0,.42)';x.fillRect(q.x-r+sx,q.y-r*.6,r*2,r*1.2);x.fillStyle='rgba(0,0,0,.3)';x.fillRect(q.x-r*.6+sx,q.y-r,r*1.2,r*2);x.fillStyle='rgba(255,255,255,.3)';x.fillRect(q.x-r+1+sx,q.y-r*.6,3,1);x.fillRect(q.x+r*.3+sx,q.y+r*.4,2,1);
      if(j===i&&!over){x.strokeStyle=Math.floor(t/180)%2?'#f2c230':'#fff3c8';x.lineWidth=2;x.strokeRect(q.x-r-3+sx,q.y-r-3,r*2+6,r*2+6)}});
    // de hamer boven de deuk: hoe dichter bij het groen, hoe lager hij hangt
    const q=dents[Math.min(i,n-1)];if(q&&!over){const hy=Math.round(q.y-12-Math.min(1,Math.abs(p-c)*2.2)*22),hx=q.x+5;x.fillStyle='#7a5430';x.fillRect(hx,hy-1,16,3);x.fillStyle='#8a929c';x.fillRect(hx-4,hy-6,7,11);x.fillStyle='#d8dde4';x.fillRect(hx-4,hy-6,7,2)}
    if(spark>0){const s=dents[Math.max(0,i-1)];x.fillStyle='#ffe9a8';for(let k=0;k<8;k++){const a=k/8*6.28,r2=3+(1-spark)*12;x.fillRect(Math.round(s.x+Math.cos(a)*r2),Math.round(s.y+Math.sin(a)*r2),2,2)}}});
  wg={dbg:()=>({pos:pos(performance.now()),c,w,i,n,miss}),press:k=>{if(k!=='tap'||over)return;const now=performance.now();if(now<lock)return;const dd=Math.min(Math.abs(pos(now)-c),Math.abs(pos(now-40)-c));
      if(dd<=w/2){dents[i].fix=.01;const P=gbx.querySelector(`[data-p="${i}"]`);P&&P.classList.add('ok');i++;spark=1;popT(pp,dd<w/7?'Perfect!':'Raak!','ok');bar.classList.remove('bad','hit');void bar.offsetWidth;bar.classList.add('hit');G.snd&&G.snd.fx('punch');G.shake&&G.shake(.12);
        if(i>=n){over=true;setTimeout(()=>wg&&wg.end({ok:true,fixed:n,n,miss}),450);return}
        lock=now+240;setTimeout(()=>{if(!wg||over)return;let nc;do{nc=rr(.14,.86)}while(Math.abs(nc-c)<.18);c=nc;zone();t0=performance.now()-rr(0,700)},170)}
      else{miss++;shk=1;popT(pp,'Mis!','bad');bar.classList.remove('bad','hit');void bar.offsetWidth;bar.classList.add('bad');G.snd&&G.snd.fx('bad');G.shake&&G.shake(.2);lock=now+200;
        if(miss>allow){over=true;ms.textContent='Te vaak mis';setTimeout(()=>wg&&wg.end({ok:false,fixed:i,n,miss}),380)}else lives()}},
    end:r=>{stop();gClose(r,vk,['Als nieuw','Half werk']);res(r)}}})}
// 2. overspuiten: drie banen over de auto; houd het spuitpistool op de stippellijn (slepen, of ▲ ▼ / W S)
function gameSpuit(T,col){return new Promise(res=>{const vk='spuiten',e=ease(vk),B=carBody(T.kind),tol=4.5+4*e,dur=3.3+1.3*e,N=44;
  const X0=OX+(B.x0+1)*SX,X1=OX+(B.x1-1)*SX,cw=(B.x1-B.x0)*SX,cab0=OX+B.x0*SX+cw*.24,cab1=OX+B.x1*SX-cw*.24;
  const PS=[{y:OY+(B.cy+1.6)*SX,a:2,f:2,x0:cab0,x1:cab1},{y:OY+(B.by+B.bh*.4)*SX,a:3.5,f:3,x0:X0,x1:X1},{y:OY+(B.by+B.bh-1.3)*SX,a:3,f:4.2,x0:X0,x1:X1}].map(p=>Object.assign(p,{ph:rr(0,6),cov:new Array(N).fill(0),cy:new Array(N).fill(0)}));
  const ty=(P,u)=>P.y+Math.sin(u*Math.PI*P.f+P.ph)*P.a;
  let pi=0,u=0,ny=ty(PS[0],0),good=0,tot=0,lastJ=-1,done=false,drag=null,fin=0;
  gOpen('Overspuiten',touch?'Houd het spuitpistool op de stippellijn. Sleep omhoog en omlaag, of gebruik ▲ ▼.':'Houd het spuitpistool op de stippellijn: W en S, de pijltjes, of slepen met de muis.',
   `<div class="sd-wg-vis"><canvas class="sd-wg-cv sd-wg-drag" width="192" height="104"></canvas></div><div class="sd-wg-info"><b class="sd-wg-n">Baan 1 van 3</b><i class="sd-wg-meter"><i></i></i><small class="sd-wg-s">Rustig en gelijkmatig</small></div>
    <div class="sd-kr-pad"><button class="btn sd-kr-b" data-k="U" aria-label="Omhoog">▲</button><button class="btn sd-kr-b" data-k="D" aria-label="Omlaag">▼</button></div>`,vk);
  const cv=gbx.querySelector('.sd-wg-cv'),x=cv.getContext('2d'),prim=K.carPic(document.createElement('canvas'),'#80848c',T.kind,{}),neu=K.carPic(document.createElement('canvas'),col,T.kind,{}),nl=gbx.querySelector('.sd-wg-n'),cm=gbx.querySelector('.sd-wg-meter>i'),sl=gbx.querySelector('.sd-wg-s');
  const toY=ev=>{const r=cv.getBoundingClientRect();return (ev.clientY-r.top)/r.height*104};
  cv.addEventListener('pointerdown',ev=>{ev.preventDefault();try{cv.setPointerCapture(ev.pointerId)}catch(x){}drag=toY(ev)});cv.addEventListener('pointermove',ev=>{if(drag!=null)drag=toY(ev)});
  const upd=()=>{drag=null};cv.addEventListener('pointerup',upd);cv.addEventListener('pointercancel',upd);
  const stop=gLoop((dt,t)=>{x.imageSmoothingEnabled=false;x.fillStyle='#14161b';x.fillRect(0,0,192,104);x.drawImage(prim,OX,OY,160,96);
    if(!done){u+=dt/dur;const dir=(gk.D?1:0)-(gk.U?1:0);ny+=dir*62*dt;if(drag!=null)ny+=(drag-ny)*Math.min(1,dt*14);ny=clamp(ny,4,100);
      const P=PS[pi],j=Math.min(N-1,Math.floor(u*N));if(j!==lastJ&&u<1){lastJ=j;const off=Math.abs(ny-ty(P,(j+.5)/N));P.cov[j]=off<=tol?1:-1;P.cy[j]=ny;tot++;if(off<=tol)good++;else if(Math.random()<.4)G.snd&&G.snd.fx('click')}
      if(u>=1){pi++;u=0;lastJ=-1;if(pi>=PS.length){done=true;fin=performance.now();const score=tot?good/tot:0;sl.textContent=score>=.85?'Strak!':score>=.6?'Netjes':'Vlekkerig';setTimeout(()=>wg&&wg.end({ok:score>=.7,score}),700)}
        else{ny=ty(PS[pi],0);nl.textContent='Baan '+(pi+1)+' van 3';G.snd&&G.snd.fx('blip')}}
      cm.style.width=(tot?good/tot*100:0)+'%';cm.classList.toggle('lo',tot>4&&good/tot<.6)}
    // de nieuwe kleur: per baan een strook, en spetters waar je ernaast zat
    PS.forEach((P,k)=>{const cw2=(P.x1-P.x0)/N;for(let j=0;j<N;j++){const cv2=P.cov[j];if(!cv2)continue;const xx=P.x0+j*cw2,yy=ty(P,(j+.5)/N);
      if(cv2>0){x.drawImage(neu,(xx-OX)/SX,(yy-8-OY)/SX,cw2/SX+.3,16/SX,xx,yy-8,cw2+1.2,16)}else{x.fillStyle=col;x.fillRect(Math.round(xx),Math.round(P.cy[j]),2,2);x.fillRect(Math.round(xx+1),Math.round(P.cy[j]+3),1,1)}}});
    if(done){const k=clamp((performance.now()-fin)/500,0,1),sc=tot?good/tot:0;if(sc>=.6){x.globalAlpha=k*.85;x.drawImage(neu,OX,OY,160,96);x.globalAlpha=1}return}
    // de stippellijn voor de huidige baan en het spuitpistool
    const P=PS[pi];x.fillStyle='#ffffff';for(let s=u;s<1;s+=.02){const xx=P.x0+(P.x1-P.x0)*s;if(Math.floor(s*50)%2===0)x.fillRect(Math.round(xx),Math.round(ty(P,s)),2,1)}
    const nx=P.x0+(P.x1-P.x0)*u,on=Math.abs(ny-ty(P,u))<=tol;x.fillStyle=on?col:'#ff3d52';x.globalAlpha=.55;x.beginPath();x.moveTo(nx,ny);x.lineTo(nx-5,ny-14);x.lineTo(nx+5,ny-14);x.fill();x.globalAlpha=1;
    x.fillStyle='#2a2d33';x.fillRect(Math.round(nx-3),Math.round(ny-24),7,10);x.fillStyle='#c9cfd6';x.fillRect(Math.round(nx-1),Math.round(ny-15),3,2);x.fillStyle=col;x.fillRect(Math.round(nx-3),Math.round(ny-26),7,2);
    if(on){x.fillStyle=col;for(let k=0;k<3;k++)x.fillRect(Math.round(nx+rr(-4,4)),Math.round(ny+rr(-3,3)),1,1)}});
  wg={dbg:()=>({ny,ty:done?ny:ty(PS[pi],u),good,tot,done}),press:k=>{if(done)return;if(k==='U')ny-=3;else if(k==='D')ny+=3},end:r=>{stop();gClose(r,vk,['Gespoten','Vlekkerig']);res(r)}}})}
// 3. valse papieren: trek de handtekening over (vinger, muis of pijltjes) voor de tijd op is; te slordig = afgekeurd
function gameVervals(T){return new Promise(res=>{const vk='vervalsen',e=ease(vk),tol=6.5+4*e,TT=8.5+3.5*e;
  const P=[],ph=rr(0,6),lo=rr(3,4.6),amp=rr(6,8.5);for(let k=0;k<=120;k++){const t=k/120,x=34+t*124+Math.cos(t*Math.PI*2*lo+ph)*6*(t<.9?1:1-(t-.9)*10),y=80+Math.sin(t*Math.PI*2*lo+ph)*amp*(1-.35*t)+Math.sin(t*7+ph)*3;P.push({x,y})}
  const CP=P.filter((_,k)=>k%4===0);let ni=0,hit=0,stray=0,sacc=0,ink=[],pen=null,kp=null,down=false,tm=TT,done=false,ok=false;
  gOpen('Valse papieren',touch?'Trek de handtekening over met je vinger. Begin bij de stip, blijf op de lijn.':'Trek de handtekening over met de muis (of de pijltjes). Begin bij de stip, blijf op de lijn.',
   `<div class="sd-wg-vis paper"><canvas class="sd-wg-cv sd-wg-pen" width="192" height="104"></canvas></div><div class="sd-wg-info"><b class="sd-wg-n"></b><i class="sd-wg-meter tm"><i></i></i><small class="sd-wg-s">Begin bij de rode stip</small></div>
    <button class="btn sd-mini-go" data-k="tap">${touch?'':'<kbd>Spatie</kbd> '}Klaar</button>`,vk);
  const cv=gbx.querySelector('.sd-wg-cv'),x=cv.getContext('2d'),nl=gbx.querySelector('.sd-wg-n'),tb=gbx.querySelector('.sd-wg-meter>i'),sl=gbx.querySelector('.sd-wg-s'),plate=(T.c&&T.c.plate)||(T.st&&T.st.data.plate)||'XX-000-X';
  const toCv=ev=>{const r=cv.getBoundingClientRect();return {x:(ev.clientX-r.left)/r.width*192,y:(ev.clientY-r.top)/r.height*104}};
  const near=q=>{let m=1e9;for(const p of P){const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<m)m=d}return m};
  function addPt(q,from){if(done)return;if(from){const dl=Math.hypot(q.x-from.x,q.y-from.y);if(dl<.5)return from;const bad=near(q)>tol*2;ink.push([from.x,from.y,q.x,q.y,bad]);if(bad){sacc+=dl;if(sacc>7){sacc=0;stray++;G.snd&&G.snd.fx('click')}}}
    for(let k=ni;k<Math.min(CP.length,ni+3);k++){if(Math.hypot(q.x-CP[k].x,q.y-CP[k].y)<=tol){hit++;ni=k+1;break}}
    if(ni>=CP.length)finish();return q}
  function finish(){if(done)return;done=true;const score=hit/CP.length-stray*.04;ok=score>=.72-.08*e&&ink.length>3;sl.textContent=ok?'Goedgekeurd':'Afgekeurd';G.snd&&G.snd.fx(ok?'build':'bad');setTimeout(()=>wg&&wg.end({ok,score}),900)}
  cv.addEventListener('pointerdown',ev=>{ev.preventDefault();try{cv.setPointerCapture(ev.pointerId)}catch(z){}down=true;pen=addPt(toCv(ev),null)});
  cv.addEventListener('pointermove',ev=>{if(down&&pen)pen=addPt(toCv(ev),pen)});const up=()=>{down=false;pen=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  const stop=gLoop((dt,t)=>{if(!done){tm-=dt;if(tm<=0){tm=0;finish()}const dx=(gk.R?1:0)-(gk.L?1:0),dy=(gk.D?1:0)-(gk.U?1:0);if(dx||dy){if(!kp)kp={x:CP[ni]?CP[Math.max(0,ni-1)].x:P[0].x,y:CP[ni]?CP[Math.max(0,ni-1)].y:P[0].y};const l=Math.hypot(dx,dy),q={x:clamp(kp.x+dx/l*48*dt,2,190),y:clamp(kp.y+dy/l*48*dt,2,102)};kp=addPt(q,kp)||kp}}
    nl.textContent=Math.ceil(tm)+' s · '+Math.round(hit/CP.length*100)+'%';tb.style.width=clamp(tm/TT,0,1)*100+'%';tb.classList.toggle('lo',tm<3);
    // het papier: kentekenbewijs met een pasfoto en velden
    x.fillStyle='#efe6cf';x.fillRect(0,0,192,104);x.fillStyle='#d9ccab';x.fillRect(0,0,192,15);x.fillStyle='#3a5f8a';x.fillRect(0,15,192,2);
    x.fillStyle='#2a2d33';x.font='bold 8px monospace';x.textBaseline='top';x.fillText('KENTEKENBEWIJS',6,4);x.font='7px monospace';x.fillText(plate,136,5);
    x.fillStyle='#cfc2a2';x.fillRect(8,22,24,28);x.fillStyle='#b5a684';x.fillRect(13,27,14,12);x.fillRect(11,40,18,8);
    x.fillStyle='#a89b7c';for(let k=0;k<4;k++)x.fillRect(40,24+k*7,70+(k%2)*30,1);x.fillStyle='#5a564c';x.font='6px monospace';x.fillText('HANDTEKENING',34,58);x.fillStyle='#a89b7c';x.fillRect(30,96,136,1);
    // de lijn om over te trekken
    x.fillStyle='#bfb18f';P.forEach((p,k)=>{if(k%2===0)x.fillRect(Math.round(p.x),Math.round(p.y),1,1)});
    if(!done&&CP[ni]){const q=CP[ni],bl=Math.floor(t/220)%2;x.strokeStyle=ni===0?'#d8382a':bl?'#3a5f8a':'#7a9cc4';x.lineWidth=1;x.strokeRect(Math.round(q.x)-3,Math.round(q.y)-3,6,6);if(ni===0){x.fillStyle='#d8382a';x.fillRect(Math.round(q.x)-1,Math.round(q.y)-1,3,3)}}
    // inkt
    x.lineWidth=1.6;x.lineCap='round';ink.forEach(s=>{x.strokeStyle=s[4]?'#8a2a2a':'#1d2c6b';x.beginPath();x.moveTo(s[0],s[1]);x.lineTo(s[2],s[3]);x.stroke()});
    if(kp&&!done){x.fillStyle='#1d2c6b';x.fillRect(Math.round(kp.x)-1,Math.round(kp.y)-1,3,3)}
    if(done){x.save();x.translate(150,40);x.rotate(-.22);x.strokeStyle=ok?'#2a7a3a':'#b0221e';x.lineWidth=2;x.strokeRect(-34,-9,68,18);x.fillStyle=ok?'#2a7a3a':'#b0221e';x.font='bold 9px monospace';x.textAlign='center';x.fillText(ok?'GOEDGEKEURD':'AFGEKEURD',0,-4);x.restore();x.textAlign='left'}});
  wg={dbg:()=>({cp:CP,ni,hit,done}),press:k=>{if(k==='tap'&&!done&&ink.length>3)finish()},end:r=>{stop();gClose(r,vk,['Goedgekeurd','Afgekeurd']);res(r)}}})}
/* ---------- elke frame ---------- */
let tt=0;
function step(dt){const ts=performance.now()/1000;tt+=dt;if(tt>.08){tt=0;promptStep();deliverStep()}if(glint)glints(ts);beaconStep(ts);
  PK.forEach(p=>{if(p.alarmT>0){p.alarmT-=dt;const on=Math.floor(ts*4)%2===0;p.mesh.visible=true;if(!p.al){p.al=new TH.Group();[-.7,.7].forEach(s=>{const b=new TH.Mesh(new TH.BoxGeometry(.25,.2,.1),new TH.MeshBasicMaterial({color:0xffa030}));b.position.set(s,.6,2.25);p.al.add(b);const c=b.clone();c.position.z=-2.25;p.al.add(c)});p.mesh.add(p.al)}p.al.visible=on;if(p.alarmT<=0)p.al.visible=false}})}
const wait=setInterval(()=>{if(!G.ready||!G.carMesh)return;clearInterval(wait);setupParked();setupFx();try{bcn=beaconMk()}catch(e){console.error(e)}
  // de bestemming als plek: een knipperend punt op de minikaart (ook als je even bent uitgestapt)
  if(G.spot){goalSpot=G.spot({k:'autodoel',x:0,z:0,r:.1,n:'',dotR:1e5,big:1,dotIf:()=>!!goal});Object.defineProperty(goalSpot,'dot',{get:()=>goal?(blink()?'#ffffff':'#f2c230'):''})}
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},200);
G.autos={findOrder,parked:PK,_wg:()=>wg,_w:()=>W,_goal:()=>goal,_t:{search,steal,deliver,points,carMenu,breakIn,hotwire,werkOpen,werkFor,tVeh,tCar,gameDeuk,gameSpuit,gameVervals,setGoal,goalFor,costRep,costPaint,costPap,carOf}};
})();
