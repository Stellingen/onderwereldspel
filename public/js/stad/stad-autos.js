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
function boostAt(x,z){const d=M.districtAt(x,z);return /Zuidas|IJ-oever|Villawijk/.test(d)?3:/Centrum|Plein|Oosterstraat/.test(d)?1.6:/Westbuurt|Haven|Tuinwijk/.test(d)?.6:1}
function rollModel(x,z){if(typeof pickCar!=='function'||typeof findTier!=='function'||typeof CARS==='undefined')return null;
  for(let i=0;i<6;i++){const m=pickCar(findTier(),boostAt(x,z));if(m)return m}return CARS[0]}
function carData(m,spot){try{return spawnCar(m,spot)}catch(e){return {id:m.id,spot,year:2018,km:60000,staat:'Goed',v:Math.round((m.lo+m.hi)/2),c:'#8a929c',plate:'XX-000-X'}}}
// verkeer: ook echte modellen (zie stad-cars.js)
G.trafModel=function(A){const m=rollModel(A?A.x:200,A?A.z:120);if(!m)return null;const x=carData(m,'In het verkeer');x.c=qcol(x.c);return {m,x}};
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
const mp=document.createElement('div');mp.className='sd-mini';mp.id='sdMini';mp.hidden=true;document.body.appendChild(mp);
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
function alarm(p,why){p.alarmT=10;G.snd&&G.snd.fx('carAlarm');G.crime&&G.crime(p.x,p.z,{why:why||'autokraak',stars:1});G.bubble&&G.bubble(p,'BIEP BIEP',{col:'#ffb04a',y:2.4,life:3})}
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
  const r=await gameWire(p);if(r==='cancel'){G.toast('Je laat de draadjes hangen','info');return}
  if(r!=='ok'){if(p.sec)alarm(p,'autodiefstal');G.toast('Kortsluiten mislukt: de motor slaat niet aan','bad');p.wireFail=(p.wireFail||0)+1;return}
  G.snd&&G.snd.fx('engineStart');steal(p.mesh,p.m,p.data,p.kind,{sec:p.sec,x:p.x,z:p.z,ry:p.ry,src:'straat'});p.st='gestolen';const i=PK.indexOf(p);if(i>=0)PK.splice(i,1)}
function steal(mesh,m,data,kind,o){const t=tierOf(m),v={d:{name:m.n,max:16+t*3.4,col:data.c,kind},x:o.x,z:o.z,ry:o.ry,v:0,mesh,stolen:{m,data,sec:o.sec,src:o.src,t0:performance.now(),rep:o.rep?1:0},dmg:0};
  G.addVehicle(v);G.enterCar(v);G.toast('Je rijdt in een gestolen '+m.n+'. Breng hem naar de garage, de heler of de sloop.','lvl');
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
/* ---------- afleveren ---------- */
const units=id=>typeof bizUnits==='function'?bizUnits(id):[];
function points(){const v=G.driving&&G.car&&G.car.stolen?G.car:null;if(!v)return [];const m=v.stolen.m,out=[];
  const gar=M.placeById('cars');out.push({k:'garage',x:gar.door.x,z:gar.door.z,n:'Garage Van der Plaat',t:'In je garage zetten'});
  const hn=G.NPC.find(n=>n.arch==='heler'&&n.x>250);let o=null;try{o=typeof helerWants==='function'?helerWants(m.id):null}catch(e){}
  let any=0;try{any=HELER_LV[helerLv()].any||0}catch(e){}
  if(hn&&(o||any))out.push({k:'heler',x:hn.x+3,z:hn.z,n:'Ome Henk (heler)',t:o?'Afleveren bij de heler · ×'+String(o.k).replace('.',','):'Aan de heler verkopen · ×'+String(any).replace('.',','),o});
  const sl=M.placeById('sloop');out.push({k:'sloop',x:sl.door.x,z:sl.door.z,n:'Autokerkhof De Sloop',t:S.sloop?'Slopen voor onderdelen':'Autokerkhof (nog niet van jou)'});
  const ch=M.placeById('biz_garage');if(ch&&units('garage').length)out.push({k:'chop',x:ch.door.x,z:ch.door.z,n:'Jouw chop shop',t:'Slopen in je eigen chop shop'});
  return out}
G.autoPoints=points;
const dp=document.createElement('button');dp.className='sd-prompt sd-deliver';dp.hidden=true;document.body.appendChild(dp);
let nearPt=null;
function deliverStep(){const L=points();nearPt=null;let bd=9;L.forEach(p=>{const d=Math.hypot(G.P.x-p.x,G.P.z-p.z);if(d<bd){bd=d;nearPt=p}});ringsFor(L);
  if(!nearPt){dp.hidden=true;return}dp.hidden=false;dp.style.setProperty('--c','#f2c230');dp.innerHTML=`<i class="sd-pi">${K.ic.key}</i><span class="sd-pt"><small>${E(nearPt.n)}</small><b>${E(nearPt.t)}</b></span><span class="sd-pk">${touch?'Tik':'<kbd>E</kbd>'}</span>`}
dp.addEventListener('click',()=>{if(nearPt)deliver(nearPt)});
// gouden ringen in de wereld waar je kunt afleveren
const RINGS=[];function ringsFor(L){while(RINGS.length<L.length){const r=new TH.Mesh(new TH.RingGeometry(2.6,3.2,20),new TH.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.7,depthWrite:false}));r.rotation.x=-Math.PI/2;G.scene().add(r);RINGS.push(r)}
  RINGS.forEach((r,i)=>{const p=L[i];r.visible=!!p;if(p){r.position.set(p.x,.08,p.z);const s=1+Math.sin(performance.now()/250)*.06;r.scale.set(s,s,s)}})}
function carOf(v){const m=v.stolen.m,x=v.stolen.data,val=Math.round((typeof carSell==='function'?carSell(x.v):x.v)*(1-(v.dmg||0))/10)*10;
  return {id:m.id,n:m.n,v:val,b:m.b,c:x.c,year:x.year,km:x.km,staat:(v.dmg||0)>.25?'Slecht':x.staat,rep:v.stolen.rep?1:Math.random()<(.12+tierOf(m)*.05)?1:0}}
// zelfde beloning als een gelukte diefstal in het klikspel (stealCar)
function credit(m,car){S.stats=S.stats||{};S.stats.cars=(S.stats.cars||0)+1;try{cxpAdd(m)}catch(e){}S.cred=(S.cred||0)+(tierOf(m)>=3?2:1);if(typeof addHeat==='function')addHeat(m.d*2);if(typeof addXp==='function')addXp(6+m.d*m.d*4+(m.leg?200:0));
  try{if(typeof famEv==='function')famEv('car',{v:car.v})}catch(e){}try{S.carDex=S.carDex||{};const d=S.carDex[m.id]||[1,0];d[1]++;S.carDex[m.id]=d}catch(e){}}
function deliver(pt){const v=G.car;if(!v||!v.stolen)return;if(G.police&&G.police.active()){G.toast('Schud eerst de politie af','bad');return}const m=v.stolen.m;
  if(pt.k==='garage'){const cap=typeof garageCap==='function'?garageCap():2;if(S.cars.length>=cap){G.toast('Je garage zit vol ('+cap+'). Verkoop of sloop eerst iets, of breng hem naar de heler of de sloop.','bad');return}
    const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);G.snd&&G.snd.fx('lvl');G.fx2&&G.fx2.float(m.n+' · '+fmt(car.v),G.P.x,G.P.z,'#ffd35a');
    G.toast(m.n+' staat in je garage. Waarde '+fmt(car.v)+(car.rep?' (gemeld als gestolen)':''),'lvl');if(typeof log==='function')log(m.n+' gestolen in de Pixelstad ('+fmt(car.v)+')','ok');sv();G.ev&&G.ev('lever');return}
  if(pt.k==='heler'){const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);const ci=S.cars.indexOf(car);
    if(pt.o){const oi=carOrders().list.indexOf(pt.o);act.carOrder(oi,ci)}else act.carHelerAny(ci);G.snd&&G.snd.fx('cash');G.ev&&G.ev('lever');sv();return}
  if(pt.k==='sloop'){if(!S.sloop){G.toast('Het autokerkhof is nog niet van jou. Koop het in de garage of hier binnen.','bad');garageOpen('sloop');return}
    const car=carOf(v);S.cars.push(car);credit(m,car);G.removeVehicle(v);act.carSloop(S.cars.indexOf(car));G.snd&&G.snd.fx('build');G.ev&&G.ev('lever');sv();return}
  if(pt.k==='chop'){const car=carOf(v);credit(m,car);G.removeVehicle(v);const R=typeof sloopRoll==='function'?sloopRoll(car):{net:Math.round(car.v*.5)},a=R.net;S.cash+=a;if(typeof addZwart==='function')addZwart(a);S.sloopN=(typeof sloopN==='function'?sloopN():S.sloopN||0)+1;
    G.snd&&G.snd.fx('cash');G.fx2&&G.fx2.float('+'+fmt(a),G.P.x,G.P.z);G.toast(m.n+' gesloopt in je chop shop: '+fmt(a)+' zwart','ok');if(typeof log==='function')log(m.n+' gesloopt in je chop shop ('+fmt(a)+')','ok');G.ev&&G.ev('lever');sv()}}
/* ---------- E: afleveren, auto, carjacken ---------- */
const prevI=G.interact;G.interact=function(){if(mini)return true;if(G.driving){if(nearPt){deliver(nearPt);return true}return false}if(prevI&&prevI())return true;if(target){carMenu(target);return true}if(jackT){jackMenu(jackT);return true}return false};
/* ---------- verkeer dat stilstaat voor carjacken (c.hold) ---------- */
// (stad-cars.js laat een auto met c.hold stilstaan via blockedAhead: de speler staat ervoor)
/* ---------- kaartjes op de minikaart ---------- */
G.autoDots=()=>{const out=[];points().forEach(p=>out.push({x:p.x,z:p.z,c:'#f2c230'}));if(G.orderCar&&G.orderCar.st!=='gestolen')out.push({x:G.orderCar.x,z:G.orderCar.z,c:'#ff7a1a'});return out};
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
  const any=(()=>{try{return HELER_LV[helerLv()].any||0}catch(e){return 0}})(),left=typeof saleLeft==='function'?saleLeft():0,paint=Math.max(150,Math.round(c.v*.04/10)*10),papers=Math.round(c.v*.3/10)*10;
  let acts=gbtn('Rijden','data-drive="'+i+'"');
  if(!rep){if(o)acts+=`<span class="sd-gar-offer"><b>${fmt(amt)}</b><small>${E(o.who)} · ${o.bank?'naar je bank':'contant'} · wit</small></span>`+gbtn('Verkopen','data-acc="'+i+'"')+gbtn(left?'Ander bod':'Geen kopers meer','data-rej="'+i+'"',{ghost:1,dis:!left});
    else acts+=gbtn(left?'Bod vragen':'Wacht op kopers','data-off="'+i+'"',{ghost:1,dis:!left})}
  else acts+=gbtn('Nieuwe papieren · '+fmt(papers),'data-pap="'+i+'"',{ghost:1,dis:S.cash<papers,title:'Dan kun je hem weer gewoon verkopen'});
  if(order)acts+=gbtn('Heler ×'+String(order.k).replace('.',',')+' · '+fmt(Math.round(c.v*order.k/10)*10),'data-ord="'+i+'"');else if(any)acts+=gbtn('Heler ×'+String(any).replace('.',','),'data-any="'+i+'"',{ghost:1});
  if(S.sloop)acts+=gbtn('Slopen · ±'+fmt(typeof sloopEst==='function'?sloopEst(c):Math.round(c.v*.6)),'data-slp="'+i+'"',{ghost:1});
  acts+=gbtn('Overspuiten · '+fmt(paint),'data-pnt="'+i+'"',{ghost:1,dis:S.cash<paint});
  return `<article class="sd-vg-c${gfocus===i?' focus':''}" style="--k:${R[1]}"><span class="sd-vg-th sd-car-th" data-cp="${i}"></span><div class="sd-vg-m"><b>${E(c.n)}</b><small>${c.year||''} · ${(c.km||0).toLocaleString('nl-NL')} km · ${E(c.staat||'')}</small>
   <div class="sd-vg-ch"><em style="background:${R[1]};color:#111">${E(R[0])}</em><em class="ok">${fmt(c.v)}</em>${rep?'<em class="b">gemeld als gestolen</em>':''}${c.hot?'<em>heet</em>':''}</div></div><div class="sd-vg-a">${acts}</div></article>`}
function grender(){if(gui.hidden)return;$s('sdGarCash').textContent=fmt(S.cash);$s('sdGarWit').textContent=fmt(typeof wit==='function'?wit():S.cash);
  const cap=typeof garageCap==='function'?garageCap():2,O=(()=>{try{return carOrders()}catch(e){return {list:[]}}})(),open=O.list.filter(o=>!o.done).length;
  $s('sdGarTabs').innerHTML=[['mine',"Jouw auto's ("+S.cars.length+'/'+cap+')'],['heler','Heler zoekt'+(open?' ('+open+')':'')],['sloop','Sloop'],['garage','Garage']].map(([k,n])=>`<button data-tab="${k}" class="${gtab===k?'on':''}">${n}</button>`).join('')+'<span class="sd-vg-sp"></span><button data-klik class="sd-vg-klik">Alle details ↗</button>';
  let h='';
  if(gtab==='mine'){h=S.cars.length?S.cars.map(carCard).join(''):`<div class="sd-vg-empty"><b>Je garage is leeg</b><p>Op straat staan genoeg auto's. Breek er een open, sluit hem kort en rij hem hierheen.</p></div>`;
    h+=`<div class="sd-vg-hint">${K.ic.key}<span>Een gestolen auto lever je hier af door ermee voor de garage te stoppen en op E te drukken. Botsen kost waarde.</span></div>`}
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
  if(d.pap){const c=S.cars[+d.pap],f=Math.round(c.v*.3/10)*10;if(S.cash<f)return;S.cash-=f;c.rep=0;c.hot=0;sv();G.toast('Nieuwe papieren voor de '+c.n+': hij is weer te koop','ok');if(typeof log==='function')log('Nieuwe papieren voor de '+c.n+' ('+fmt(f)+')','info');grender();return}
  if(d.pnt){const c=S.cars[+d.pnt],m=mOf(c),f=Math.max(150,Math.round(c.v*.04/10)*10);if(S.cash<f)return;const P=(typeof CAR_COLORS!=='undefined'&&CAR_COLORS[Math.min(5,m.d||1)])||PAL;S.cash-=f;const i=P.indexOf(c.c);c.c=P[(i+1)%P.length];sv();G.snd&&G.snd.fx('build');grender();return}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!gui.hidden){e.stopImmediatePropagation();garageClose()}},true);
/* ---------- elke frame ---------- */
let tt=0;
function step(dt){const ts=performance.now()/1000;tt+=dt;if(tt>.08){tt=0;promptStep();deliverStep()}if(glint)glints(ts);
  PK.forEach(p=>{if(p.alarmT>0){p.alarmT-=dt;const on=Math.floor(ts*4)%2===0;p.mesh.visible=true;if(!p.al){p.al=new TH.Group();[-.7,.7].forEach(s=>{const b=new TH.Mesh(new TH.BoxGeometry(.25,.2,.1),new TH.MeshBasicMaterial({color:0xffa030}));b.position.set(s,.6,2.25);p.al.add(b);const c=b.clone();c.position.z=-2.25;p.al.add(c)});p.mesh.add(p.al)}p.al.visible=on;if(p.alarmT<=0)p.al.visible=false}})}
const wait=setInterval(()=>{if(!G.ready||!G.carMesh)return;clearInterval(wait);setupParked();setupFx();const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},200);
G.autos={findOrder,parked:PK,_t:{search,steal,deliver,points,carMenu,breakIn,hotwire}};
})();
