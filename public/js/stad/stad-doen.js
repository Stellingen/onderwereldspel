// Pixelstad: dingen om te doen op straat (alleen in de Pixelstad).
// - Plekken waar je iets kunt: loop erheen en druk op E (of tik op het label). Bankjes (zitten, even bijkomen), prullenbakken en
//   containers (doorzoeken), geldautomaten (storten en opnemen, de regels van de bank), de koffiekar en de snackkar (zelfde
//   prijs, effect en wachttijd als bij Ontspannen), visstekken, uitkijkpunten, de dobbelaar en de straatmuzikant.
// - Vissen: uitgooien, wachten op beet, binnenhalen. 14 soorten (sommige alleen 's nachts of op één plek), een visboek met je
//   records, en Ouwe Jaap de visboer koopt alles (wit geld, op de schaal van gewoon werk voor jouw rang).
// - Dobbelen met Snelle Eddy: twee stenen, hoogste wint. Eerlijk spel, met een dagplafond.
// - Straatoptreden met de muzikant: een ritmespel, het publiek geeft fooi.
// - Fotomodus: HUD weg, filter kiezen, een pose, en de foto opslaan.
// Andere onderdelen (wijken, races, hond, gebeurtenissen) melden hun plekken hier ook aan met G.spot().
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id),E=K.E,T=M.T;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv=()=>{try{save()}catch(e){}};
const perk=k=>G.perk?G.perk(k):0;
const obj=(k,d)=>{try{if(!S[k]||typeof S[k]!=='object')S[k]=d;return S[k]}catch(e){return d}};
const dayKey=()=>{try{return new Date(Date.now()-6*3600e3).toLocaleDateString('nl-NL',{timeZone:'Europe/Amsterdam'})}catch(e){return new Date(Date.now()-6*3600e3).toDateString()}};
// schaal: zwart = de straatklussen van je rang (zoals straatroof), wit = gewoon werk van je rang per energiepunt
const zScale=k=>{const c=(G.roofRef&&G.roofRef())||{min:20,max:60};return Math.max(5,Math.round(((c.min+c.max)/2)*(typeof lootMult==='function'?lootMult():1)*k/5)*5)};
const witPE=()=>{try{const ri=rankIdx(S.xp);let j=JOBS[0];JOBS.forEach(x=>{if(x.r<=ri)j=x});return (j.p[0]+j.p[1])/2/j.en*(1+(typeof tierK==='function'?tierK():0)*.5)}catch(e){return 20}};
G.schaal={zwart:zScale,wit:witPE};
const busy=()=>G.driving||G.talking||G.paused||G.hidden||(G.mini&&G.mini.active())||(G.mission&&G.mission());
const say=(t,o)=>G.zeg&&G.zeg(t,o);
const fl=(t,x,z,c)=>G.fx2&&G.fx2.float(t,x,z,c);
/* =================== plekken (spots) =================== */
// {k:soort, x,z, r:afstand, n:label, col, ic, act(), show():bool, dot:kleur op de minikaart, map:{n,ic,c} voor de grote kaart, drive:ook in de auto}
const SP=[];G.spots=SP;
G.spot=function(o){o.r=o.r||2.2;SP.push(o);return o};
G.unspot=function(o){const i=SP.indexOf(o);if(i>=0)SP.splice(i,1)};
const pr=document.createElement('div');pr.className='sd-npcp sd-spot';pr.hidden=true;document.body.appendChild(pr);
const V3=new TH.Vector3();let cur=null,ring=null;
function pickSpot(){const P=G.P;cur=null;if(G.talking||G.paused||G.hidden||(G.mini&&G.mini.active())||G.sitting)return;const mis=G.mission&&G.mission();let bd=1e9;
  for(const s of SP){if(!s.act)continue;if(G.driving?!s.drive:s.driveOnly)continue;if(mis&&!s.mis)continue;const d=Math.hypot(s.x-P.x,s.z-P.z);if(d>s.r||d>=bd)continue;if(s.show&&!s.show())continue;bd=d;cur=s}
  if(cur){const door=G.near&&Math.hypot(P.x-G.near.door.x,P.z-G.near.door.z);if(door!=null&&door<bd-.3&&!cur.drive)cur=null}
  // staat er ook iemand voor je: die gaat voor, tenzij de plek duidelijk dichterbij is
  if(cur&&!cur.prio&&!G.driving){const n=G.lookNpc;if(n){const dn=Math.hypot(n.x-P.x,n.z-P.z);if(bd>dn-(LOW[cur.k]?1.2:.4))cur=null}}}
const LOW={bak:1,bank:1,kat:1};
function promptStep(){if(!ring&&G.ready){ring=new TH.Mesh(new TH.RingGeometry(.5,.66,14),new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.85,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;G.scene().add(ring)}
  pickSpot();const s=cur;if(!s){pr.hidden=true;if(ring)ring.visible=false;return}
  if(ring){ring.visible=!s.noRing;ring.position.set(s.x,.07,s.z);ring.material.color.set(s.col||'#ffffff');const k=(s.ring||1)*(1+Math.sin(performance.now()/260)*.07);ring.scale.set(k,k,k)}
  V3.set(s.x,s.h||1.9,s.z).project(G.camera());pr.hidden=false;pr.style.left=(V3.x*.5+.5)*innerWidth+'px';pr.style.top=(-V3.y*.5+.5)*innerHeight+'px';pr.style.setProperty('--c',s.col||'#fff');
  const lbl=typeof s.n==='function'?s.n():s.n;pr.innerHTML=`<kbd>${touch?'Tik':'E'}</kbd><span>${E(lbl)}</span>${s.sub?`<em>${E(typeof s.sub==='function'?s.sub():s.sub)}</em>`:''}`}
pr.addEventListener('click',()=>{if(cur)use(cur)});
function use(s){if(!s)return;try{s.act(s)}catch(e){console.error(e)}}
// E: eerst wat er al was (verstoppen, praten, auto), tenzij een plek dichterbij is
const prevI=G.interact;
G.interact=function(){if(G.mini&&G.mini.active())return true;if(G.sitting&&!G.driving){G.standUp&&G.standUp();return true}
  const pol=G.police&&G.police.active&&G.police.active();
  if(cur&&!pol){use(cur);return true}
  if(prevI&&prevI())return true;if(cur){use(cur);return true}return false};
G.spotDots=()=>{const out=[],P=G.P;SP.forEach(s=>{if(!s.dot)return;const d=Math.hypot(s.x-P.x,s.z-P.z);if(d<(s.dotR||90)&&(!s.dotIf||s.dotIf()))out.push({x:s.x,z:s.z,c:s.dot,big:s.big})});
  // Scherpe neus: pakketjes in de buurt
  if(perk('neus')){const C=S.stadCol||{};(G.pakketten||[]).forEach(p=>{if(!C[p.id]&&Math.hypot(p.x-P.x,p.z-P.z)<55)out.push({x:p.x,z:p.z,c:'#ffd35a'})})}return out};
G.spotMap=()=>SP.filter(s=>s.map&&(!s.mapIf||s.mapIf())).map(s=>({x:s.x,z:s.z,n:typeof s.map.n==='function'?s.map.n():s.map.n,c:s.map.c||s.col||'#fff',ic:s.map.ic||K.ic.route,pri:s.map.pri||2,big:s.map.big}));
/* =================== modellen =================== */
const scene=()=>G.scene();
function put(m,x,z,ry){m.position.set(x,0,z);m.rotation.y=ry||0;scene().add(m);return m}
const solid=(x,z,r)=>M.setSolid({x0:x-r,z0:z-r,x1:x+r,z1:z+r},true);
// dichtstbijzijnde muur (voor een geldautomaat): plek ervoor en kijkrichting
function wallSpot(x,z){const D=[[0,-1,0],[1,0,-Math.PI/2],[0,1,Math.PI],[-1,0,Math.PI/2]];let best=null;for(const [dx,dz,ry] of D){for(let k=.5;k<6;k+=.25){const cx=Math.floor(x+dx*k),cz=Math.floor(z+dz*k);if(M.solid[cz*M.W+cx]){if(!best||k<best.k)best={k,x:x+dx*(k-.42),z:z+dz*(k-.42),ry:Math.atan2(-dx,-dz),dx,dz};break}}}return best}
const MOD={
  atm:()=>K.model([[.9,1.9,.5,0,.95,0,'#2e3540'],[.7,.5,.06,0,1.35,.26,'#3ad6ff',1],[.5,.18,.08,0,.95,.27,'#1a1d23'],[.3,.06,.1,0,.78,.28,'#3fe395',1],[.94,.16,.56,0,1.98,0,'#f2c230',1]]),
  koffie:()=>K.model([[2.2,.9,1.1,0,.75,0,'#7a4a2c'],[2.3,.08,1.2,0,1.24,0,'#e8e4da'],[.5,.5,.5,-.6,1.52,0,'#c9cfd6'],[.2,.3,.2,.5,1.42,.2,'#f1efe9'],[.2,.3,.2,.75,1.42,-.1,'#f1efe9'],[.1,1.5,.1,-1.05,1.95,-.5,'#2a2c30'],[.1,1.5,.1,1.05,1.95,-.5,'#2a2c30'],[.1,1.5,.1,-1.05,1.95,.5,'#2a2c30'],[.1,1.5,.1,1.05,1.95,.5,'#2a2c30'],
    [2.6,.12,1.5,0,2.74,0,'#c0261e'],[2.6,.12,.3,0,2.74,-.35,'#f1efe9'],[2.6,.12,.3,0,2.74,.35,'#f1efe9'],[.5,.5,.2,-1.0,.25,0,'#1d1d1f'],[.5,.5,.2,1.0,.25,0,'#1d1d1f'],[.4,.1,.4,.1,1.34,-.2,'#ffad6b',1]]),
  snack:()=>K.model([[2.6,1.0,1.3,0,.8,0,'#e8e4da'],[2.6,.3,1.32,0,.5,0,'#c0261e'],[2.7,.08,1.4,0,1.34,0,'#8a8c90'],[.1,1.3,.1,-1.25,1.95,-.6,'#8a8c90'],[.1,1.3,.1,1.25,1.95,-.6,'#8a8c90'],[.1,1.3,.1,-1.25,1.95,.6,'#8a8c90'],[.1,1.3,.1,1.25,1.95,.6,'#8a8c90'],
    [2.9,.14,1.7,0,2.66,0,'#f2c230'],[2.9,.14,.34,0,2.66,-.5,'#c0261e'],[2.9,.14,.34,0,2.66,.5,'#c0261e'],[.35,.9,.35,.8,1.8,-.1,'#8a4a2a'],[.5,.5,.2,-1.0,.25,0,'#1d1d1f'],[.5,.5,.2,1.0,.25,0,'#1d1d1f'],[.6,.1,.3,-.5,1.42,.3,'#ffd166',1]]),
  vis:()=>K.model([[2.6,.9,1.2,0,.6,0,'#2f6a8a'],[2.7,.1,1.3,0,1.1,0,'#dfe9f0'],[.5,.08,.25,-.8,1.2,.2,'#c9cfd6'],[.5,.08,.25,-.2,1.2,-.1,'#8a929c'],[.5,.08,.25,.5,1.2,.25,'#ff9a6a'],[.4,.08,.2,.9,1.2,-.2,'#c9cfd6'],
    [.1,1.5,.1,-1.25,1.85,-.55,'#e8e4da'],[.1,1.5,.1,1.25,1.85,-.55,'#e8e4da'],[.1,1.5,.1,-1.25,1.85,.55,'#e8e4da'],[.1,1.5,.1,1.25,1.85,.55,'#e8e4da'],[2.9,.12,1.6,0,2.64,0,'#2f6a8a'],[2.9,.12,.3,0,2.64,-.4,'#f1efe9'],[2.9,.12,.3,0,2.64,.4,'#f1efe9']]),
  kijker:()=>K.model([[.5,.12,.5,0,.06,0,'#3a3d42'],[.14,1.3,.14,0,.7,0,'#55585e'],[.36,.3,.7,0,1.5,.05,'#d6a63e'],[.22,.22,.1,0,1.5,.42,'#3ad6ff',1]]),
  stek:()=>K.model([[.1,1.3,.1,0,.65,0,'#6a4a2c'],[.9,.42,.06,0,1.25,0,'#2f6a8a'],[.74,.08,.08,0,1.25,.02,'#e8e4da'],[.34,.34,.34,.55,.17,.1,'#8a929c'],[.26,.06,.26,.55,.36,.1,'#3a8ad6']]),
  kist:()=>K.model([[1.1,.7,.8,0,.35,0,'#8a6a42'],[1.14,.08,.84,0,.72,0,'#6a4a2c'],[.18,.18,.18,-.2,.85,.05,'#f1efe9'],[.18,.18,.18,.15,.85,-.1,'#f1efe9'],[.5,.5,.5,-1.1,.25,.3,'#6a4a2c'],[.5,.5,.5,1.1,.25,-.2,'#6a4a2c']]),
  dobber:()=>K.model([[.2,.22,.2,0,.06,0,'#e8e4da'],[.21,.12,.21,0,.2,0,'#ff3d52',1],[.05,.3,.05,0,.38,0,'#1d1d1f']],{noShadow:1})};
G.MOD=MOD;
/* =================== bankje: zitten en even bijkomen =================== */
let sit=null;
function sitDown(b){if(busy())return;const P=G.P;G.stopPath&&G.stopPath();sit={t:0,got:0,b,yaw:G.yawT};P.x=b.sx;P.z=b.sz;P.vx=P.vz=0;P.ry=b.ry;G.sitting=true;G.sitY=-.3;G.emote=null;G.snd&&G.snd.fx('hide');
  if(!sitDown.told){sitDown.told=1;G.toast('Even zitten. Loop weg om op te staan.','info')}}
G.onStand=function(){if(!sit)return;const b=sit.b;G.yawT=sit.yaw;sit=null;G.sitY=null;if(Math.hypot(G.P.x-b.sx,G.P.z-b.sz)>1.6)return;const p=M.nearestWalk(b.x,b.z,3);if(p){G.P.x=p.x;G.P.z=p.z}};
function sitStep(dt){if(!sit||!G.sitting)return;sit.t+=dt;G.yawT+=dt*.04;
  // om de 10 tellen een beetje energie en gezondheid terug, hooguit 5 per keer zitten en dan 10 minuten niet
  if(sit.t>10&&sit.got<5){sit.t=0;const cd=(S.cd&&S.cd.stadZit||0)-now();if(cd>0)return;let t='';if(S.energy<EN_MAX){S.energy=Math.min(EN_MAX,S.energy+1);t='+1 energie'}if(S.hp<100){S.hp=Math.min(100,S.hp+1);t+=(t?' · ':'')+'+1 gezondheid'}
    if(t){sit.got++;fl(t,G.P.x,G.P.z,'#7fd1c7');if(sit.got>=5){S.cd=S.cd||{};S.cd.stadZit=now()+600000}sv()}}}
function setupBenches(){M.props.forEach((p,i)=>{if(p.k!=='bench')return;const al=p.rot%2===0;// lange kant langs x (rot even) of langs z
    let best=null;[[al?0:1,al?1:0],[al?0:-1,al?-1:0]].forEach(([dx,dz])=>{const q=M.nearestWalk(p.x+dx*1.5,p.z+dz*1.5,1.3);if(!q)return;const d=Math.hypot(q.x-p.x,q.z-p.z);if(d<3&&(!best||d<best.d))best={d,x:q.x,z:q.z,sx:p.x+dx*.22,sz:p.z+dz*.22,ry:Math.atan2(dx,dz)}});if(!best)return;
    const b={x:best.x,z:best.z,sx:best.sx,sz:best.sz,ry:best.ry,px:p.x,pz:p.z,i};benches.push(b);G.spot({k:'bank',x:best.x,z:best.z,r:1.7,n:'Zitten',col:'#7fd1c7',h:1.6,show:()=>!b.npc,act:()=>sitDown(b)})})}
const benches=[];G.benches=benches;
/* =================== prullenbak en container: doorzoeken =================== */
const bakS=()=>{const B=obj('stadBak',{});const k=dayKey();if(B.k!==k){B.k=k;B.ids={}}if(!B.ids)B.ids={};return B};
async function zoekBak(s){if(busy())return;const B=bakS();if(B.ids[s.id]){G.toast('Hier heb je vandaag al gezocht','info');return}if(S.energy<1){G.toast('Te moe','bad');return}
  G.stopPath&&G.stopPath();G.pose='zoek';G.P.ry=Math.atan2(s.bx-G.P.x,s.bz-G.P.z);const r=await G.mini.hold({label:'Doorzoeken',d:s.big?2:1.4,wait:2.5,can:()=>G.pose==='zoek'&&Math.hypot(s.x-G.P.x,s.z-G.P.z)<2.8&&!G.driving,tick:()=>{if(Math.random()<.1)G.snd&&G.snd.fx('step')}});
  if(G.pose==='zoek')G.pose=null;if(r!=='ok')return;S.energy-=1;B.ids[s.id]=1;const ri=rankIdx(S.xp),x=Math.random()*(s.big?.9:1),P=G.P;G.ev&&G.ev('bak');
  if(x<.05){const p=G.pakketTip&&G.pakketTip();if(p){G.toast('Een briefje: er ligt iets verstopt in '+p.w+'. Op je kaart gezet.','lvl');G.snd&&G.snd.fx('ok');sv();return}}
  if(x<.09){const g=zScale(.5);S.cash+=g;fl('Portemonnee · +'+fmt(g),P.x,P.z,'#ffd35a');G.snd&&G.snd.fx('cash');say('Kijk nou.');sv();return}
  if(x<.21&&G.zak&&G.zak().length<G.zakMax()){const it=pick([['Oude telefoon',.3],['Kapotte laptop',.35],['Koperdraad',.25],['Merkschoenen',.3],['Oud horloge',.4]]);G.zak().push({n:it[0],v:Math.max(5,zScale(it[1]))});fl(it[0]+' (voor de heler)',P.x,P.z,'#ffd35a');G.snd&&G.snd.fx('grab');sv();return}
  if(x<.5){const g=Math.round(rr(3,22)*(1+ri*.6));S.cash+=g;fl('Statiegeld · +'+fmt(g),P.x,P.z,'#3fe395');G.snd&&G.snd.fx('coin');sv();return}
  if(x<.56){S.hp=Math.max(5,S.hp-1);fl('Een rat! −1 gezondheid',P.x,P.z,'#ff9a9a');G.snd&&G.snd.fx('scream');G.pose='au';setTimeout(()=>{if(G.pose==='au')G.pose=null},500);G.shake&&G.shake(.3);if(G.critter)G.critter('rat',s.bx,s.bz);sv();return}
  fl(pick(['Niks','Alleen lege blikjes','Bananenschillen','Oude kranten']),P.x,P.z,'#9aa1ab');sv()}
function setupBins(){M.props.forEach((p,i)=>{if(p.k!=='bin'&&p.k!=='dumpster')return;const q=M.nearestWalk(p.x,p.z,3);if(!q)return;const big=p.k==='dumpster';
    G.spot({k:'bak',id:(big?'d':'b')+i,x:q.x,z:q.z,bx:p.x,bz:p.z,big,r:big?2.1:1.6,n:'Doorzoeken',col:'#9aa1ab',h:1.7,noRing:1,show:()=>!bakS().ids[(big?'d':'b')+i]&&!(G.police&&G.police.active()),act:zoekBak})})}
/* =================== geldautomaat =================== */
function drawAtm(cv){cv.width=40;cv.height=24;const c=cv.getContext('2d'),R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};R(0,0,40,24,'#1a1d23');R(8,2,24,20,'#2e3540');R(8,2,24,3,'#f2c230');R(11,7,18,8,'#0e2a3a');R(12,8,16,1,'#3ad6ff');R(12,10,10,1,'#3ad6ff');R(12,12,13,1,'#3fe395');R(12,17,10,2,'#111');R(25,17,4,2,'#3fe395')}
function atm(){if(busy())return;if(typeof inJail==='function'&&inJail())return;G.talking=true;G.snd&&G.snd.fx('tab');
  const line=()=>`Spaarrekening ${fmt(Math.floor(S.bank||0))}. Op zak ${fmt(Math.floor(S.cash))}, waarvan ${fmt(Math.floor(typeof wit==='function'?wit():S.cash))} wit.`;
  const ch=()=>{const w=Math.floor(typeof wit==='function'?wit():S.cash),b=Math.floor(S.bank||0),L=[];
    L.push({t:'Alles storten',sub:w>0?fmt(w)+' wit geld':'',ic:K.ic.bank,dis:w<1,why:(typeof zwart==='function'&&zwart()>=1)?'De bank neemt geen zwart geld aan':'Niets om te storten',f:()=>{act.bkAll();G.snd&&G.snd.fx('coin');G.ev&&G.ev('pin');K.say(line(),null,ch())}});
    [1000,10000,100000].filter(v=>v<b).forEach(v=>L.push({t:fmt(v)+' opnemen',ic:K.ic.money,f:()=>{act.bkQuick(v);G.snd&&G.snd.fx('cash');G.ev&&G.ev('pin');K.say(line(),null,ch())}}));
    L.push({t:'Alles opnemen',sub:b>0?fmt(b):'',ic:K.ic.money,dis:b<1,why:'Er staat niets op je rekening',f:()=>{act.bkQuick(b);G.snd&&G.snd.fx('cash');G.ev&&G.ev('pin');K.say(line(),null,ch())}});
    L.push({t:'Klaar',ic:K.ic.no,f:()=>K.closeDialog()});return L};
  K.dialog({name:'Geldautomaat',role:'Nederlandsche Onderbank',draw:drawAtm,lines:[line()],col:'#3ad6ff',choices:ch(),onClose:()=>{G.talking=false}})}
const ATMS=[[161.5,75.5],[226,106.8],[258.6,118],[146,198.2],[322,118.6],[118,134.3],[156,186.2]];
function setupAtms(){ATMS.forEach(([x,z])=>{const p=M.nearestWalk(x,z,5);if(!p)return;const w=wallSpot(p.x,p.z);if(!w)return;put(MOD.atm(),w.x,w.z,w.ry);const fx=w.x-w.dx*.95,fz=w.z-w.dz*.95,q=M.nearestWalk(fx,fz,2)||{x:fx,z:fz};
    G.spot({k:'atm',x:q.x,z:q.z,r:1.9,n:'Geldautomaat',col:'#3ad6ff',h:2.3,act:atm,dot:'#3ad6ff',dotR:60,map:{n:'Geldautomaat',ic:K.ic.bank,c:'#3ad6ff',pri:1}})})}
/* =================== koffiekar en snackkar =================== */
function eetKeuze(id,pose){return (n,ch,main)=>{let r=null;try{r=RELAX.find(x=>x.id===id)}catch(e){}if(!r)return;const cost=relaxCost(r,rankIdx(S.xp),rankLevel(S.xp)),cd=typeof cdLeft==='function'?cdLeft('rx_'+id):0;
    const eff=[r.energy?'energie +'+r.energy:'',r.hp?'gezondheid +'+r.hp:''].filter(Boolean).join(', ');let why='';if(cd)why='Net gehad: nog '+Math.ceil(cd/60000)+' min';else if(S.cash<cost)why='Kost '+fmt(cost)+' contant';
    ch.push({t:r.n+' · '+fmt(cost),sub:why?'':eff,ic:K.ic.kop,dis:!!why,why,f:()=>{const e0=S.energy,h0=S.hp,c0=S.cash;act.relax(id);if(S.cash<c0){G.ev&&G.ev('eet');G.volk&&G.volk.daad(n,'eet');const kk=G.korting?G.korting(n):0,back=Math.round((c0-S.cash)*kk);if(back>0){S.cash+=back;setTimeout(()=>G.fx2&&G.fx2.float('Vaste klant: '+fmt(back)+' terug',n.x,n.z,'#ffd35a'),900)}K.closeDialog(true);G.pose=pose;setTimeout(()=>{if(G.pose===pose)G.pose=null},2600);G.snd&&G.snd.fx('ok');
        fl([S.energy>e0?'+'+Math.round(S.energy-e0)+' energie':'',S.hp>h0?'+'+Math.round(S.hp-h0)+' gezondheid':''].filter(Boolean).join(' · ')||r.n,G.P.x,G.P.z,'#7fd1c7');G.bubble&&G.bubble(n,pick(['Alsjeblieft.','Eet smakelijk.','Tot morgen!']))}}})}}
/* =================== vissen =================== */
// id, naam, zeldzaamheid 1-4, water (g gracht, h haven, z zee, v vijver), alleen 's nachts, waarde, kilo van-tot
const VIS=[['voorn','Voorn',1,'gv',0,.5,.1,.4],['baars','Baars',1,'gvh',0,.7,.2,.9],['brasem','Brasem',1,'gv',0,.8,.5,2.5],['bot','Bot',1,'zh',0,.7,.2,.8],['makreel','Makreel',1,'zh',0,.8,.3,.9],
  ['paling','Paling',2,'gh',1,1.7,.3,1.5],['snoekbaars','Snoekbaars',2,'gh',0,1.5,.8,4],['zeebaars','Zeebaars',2,'zh',0,1.7,.8,5],['karper','Karper',2,'vg',0,1.4,2,12],
  ['snoek','Snoek',3,'gv',0,3,2,10],['kabeljauw','Kabeljauw',3,'z',0,3.2,2,12],['meerval','Meerval',3,'hg',1,3.6,5,40],['koi','Gouden koi',4,'v',0,8,1,4],['steur','Steur',4,'hz',0,9,5,30]];
const VCOL=['','#9aa1ab','#3ad6ff','#b8a1ff','#ffd35a'],VZ=['','Gewoon','Bijzonder','Zeldzaam','Legendarisch'];
const visS=()=>{const V=obj('stadVis',{});if(!Array.isArray(V.bag))V.bag=[];if(!V.dex||typeof V.dex!=='object')V.dex={};return V};
const visDef=id=>VIS.find(v=>v[0]===id);
const kg=w=>w.toLocaleString('nl-NL',{minimumFractionDigits:1,maximumFractionDigits:1})+' kg';
function rollVis(w){const night=G.night>.55,hk=perk('hengel'),rain=G.rain>.4?1:0,W=[0,62,27+4*hk+3*rain,9+2*hk+rain,2+.7*hk];let tot=W[1]+W[2]+W[3]+W[4],x=Math.random()*tot,r=1;for(let i=1;i<=4;i++){x-=W[i];if(x<=0){r=i;break}}
  for(;r>=1;r--){const L=VIS.filter(v=>v[2]===r&&v[3].includes(w)&&(!v[4]||night));if(L.length)return pick(L)}return VIS[0]}
let fish=null,bob=null;
async function vissen(s){if(busy()||fish)return;const V=visS();if(G.police&&G.police.active()){G.toast('Niet nu','bad');return}if(V.bag.length>=G.zakMax()){G.toast('Je emmer zit vol. Verkoop je vis bij Ouwe Jaap op de boulevard.','bad');if(!vissen.wp){vissen.wp=1;const j=G.NPC.find(n=>n.arch==='visboer');if(j&&G.setWaypoint)G.setWaypoint(j.x,j.z,'Ouwe Jaap (visboer)')}return}
  if(S.energy<2){G.toast('Te moe: 2 energie nodig','bad');return}S.energy-=2;sv();fish=s;const P=G.P;G.stopPath&&G.stopPath();P.ry=s.ry;P.vx=P.vz=0;G.pose='vis';G.poseLock=true;G.snd&&G.snd.fx('splash');
  if(!bob){bob=MOD.dobber();scene().add(bob)}bob.visible=true;bob.position.set(s.wx,-.5,s.wz);
  let ph='wait',t=rr(2.2,6.2)*(G.rain>.4?.75:1),win=0,res=null,raf=0,last=performance.now();
  const pan=G.mini.paneel('Vissen','Wacht op beet…',`<div class="sd-vs"><i class="sd-vs-w"><i></i></i><b id="sdVsT">…</b></div><button class="btn sd-mini-go" data-tap>${touch?'Haal op':'<kbd>E</kbd> Haal op'}</button>`,{key:k=>{if(k!=='tap')return;
      if(ph==='wait'){t+=1.6;pan.el.querySelector('#sdVsT').textContent='Te vroeg. Rustig…';G.snd&&G.snd.fx('click')}else if(ph==='bite'){res='hook';pan.close('hook')}},onEnd:r=>{cancelAnimationFrame(raf);done(r)}});
  const dobEl=pan.el.querySelector('.sd-vs-w');
  const loop=()=>{const now=performance.now(),dt=Math.min(.1,(now-last)/1000);last=now;if(!fish)return;if(!G.paused){t-=dt;
      if(ph==='wait'&&t<=0){ph='bite';win=1.15;dobEl.classList.add('bite');pan.el.querySelector('#sdVsT').textContent='BEET!';pan.set(null,'Nu ophalen!');G.snd&&G.snd.fx('splash');G.snd&&G.snd.fx('notify');say('!',{col:'#ffd35a',life:1});if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){}}
      else if(ph==='bite'){win-=dt;if(win<=0){pan.close('late');return}}
      bob.position.y=-.5+(ph==='bite'?-.16+Math.sin(now/40)*.06:Math.sin(now/420)*.04)}
    raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop);
  async function done(r){if(r!=='hook'){end(r==='late'?'Te laat. De vis is weg.':'');return}
    const v=rollVis(s.w),junk=Math.random();
    if(junk<.12){// geen vis maar rommel
      end('');const P=G.P;if(junk<.01){const g=zScale(1.5);S.cash+=g;if(typeof addZwart==='function')addZwart(g);fl('Een kluisje! +'+fmt(g),P.x,P.z,'#ffd35a');G.snd&&G.snd.fx('cash');say('Hebbes.')}
      else if(junk<.03){const p=G.pakketTip&&G.pakketTip();fl(p?'Flessenpost: een kaart naar '+p.w:'Een lege fles',P.x,P.z,'#ffd35a');if(p)G.snd&&G.snd.fx('ok')}
      else if(junk<.07){const g=Math.round(rr(5,25));S.cash+=g;fl('Roestige fiets · schroot +'+fmt(g),P.x,P.z,'#9aa1ab');G.snd&&G.snd.fx('coin')}
      else{fl('Een oude schoen',P.x,P.z,'#9aa1ab');say('Pff.')}sv();return}
    G.pose='vishaal';const hk=perk('hengel'),R=await G.mini.haal({title:'Beet!',sub:'Houd ingedrukt om in te halen. Houd de vis in het vak.',kracht:[0,.18,.42,.68,.92][v[2]]-.07*hk,vak:.27+.03*hk});
    if(!R.ok){end(R==='cancel'?'':'Ontsnapt!');return}
    const w=Math.round((v[6]+Math.pow(Math.random(),1.7)*(v[7]-v[6]))*10)/10,val=Math.max(5,Math.round(witPE()*2*v[5]*(.8+.4*(w-v[6])/Math.max(.1,v[7]-v[6]))/5)*5);
    V.bag.push({id:v[0],w,v:val});const d=V.dex[v[0]]||[0,0],rec=w>d[1];V.dex[v[0]]=[d[0]+1,Math.max(d[1],w)];V.n=(V.n||0)+1;if(typeof addXp==='function')addXp(v[2]);sv();
    end('');const P=G.P;G.snd&&G.snd.fx(v[2]>=3?'lvl':'ok');G.fx2&&G.fx2.burst(s.wx,.3,s.wz,'#a9dcff',10);fl(v[1]+' · '+kg(w)+(rec&&d[0]?' · record!':''),P.x,P.z,VCOL[v[2]]);G.ev&&G.ev(v[2]>=3?'visz':'vis');G.ev&&G.ev('vangst');
    if(!d[0])G.toast('Nieuw in je visboek: '+v[1]+' ('+VZ[v[2]].toLowerCase()+')','lvl');if(v[2]>=3&&G.doEmote)setTimeout(()=>G.doEmote('juich'),200);
    if(Object.keys(V.dex).length===VIS.length&&!V.all){V.all=1;G.msg&&G.msg('stad','Je visboek is vol: alle '+VIS.length+' soorten gevangen.')}}
  function end(msg){fish=null;if(bob)bob.visible=false;G.pose=null;G.poseLock=false;if(msg)G.toast(msg,'info')}}
G.vis={VIS,VCOL,VZ,S:visS,def:visDef,kg,waarde:()=>visS().bag.reduce((a,f)=>a+f.v,0)};
const units=id=>{try{return typeof bizUnits==='function'?bizUnits(id):[]}catch(e){return []}};
function verkoopVis(n){const V=visS();if(!V.bag.length)return;const k=units('restaurant').length?1.15:1,tot=Math.round(V.bag.reduce((a,f)=>a+f.v,0)*k/5)*5,c=V.bag.length;V.bag.length=0;S.cash+=tot;S.stats=S.stats||{};S.stats.visVerk=(S.stats.visVerk||0)+c;sv();
  G.snd&&G.snd.fx('cash');fl('+'+fmt(tot),n.x,n.z);if(typeof log==='function')log('Vis verkocht aan Ouwe Jaap: '+c+' stuks voor '+fmt(tot),'ok');return tot}
// water en kijkrichting bij een stek
function stek(x,z,w,nm){const p=M.nearestWalk(x,z,4);if(!p)return;let best=null;for(let a=0;a<8;a++){const an=a*Math.PI/4,dx=Math.sin(an),dz=Math.cos(an);for(let k=1;k<5;k+=.5){if(M.at(Math.floor(p.x+dx*k),Math.floor(p.z+dz*k))===T.WATER){if(!best||k<best.k)best={k,dx,dz,an};break}}}
  if(!best)return;put(MOD.stek(),p.x-best.dz*1.1,p.z+best.dx*1.1,best.an);
  G.spot({k:'vis',x:p.x,z:p.z,r:2,w,ry:best.an,wx:p.x+best.dx*(best.k+2.2),wz:p.z+best.dz*(best.k+2.2),n:'Vissen',sub:nm,col:'#3a8ad6',h:2.1,act:vissen,dot:'#3a8ad6',dotR:70,map:{n:'Visstek · '+nm,ic:K.ic.vis,c:'#3a8ad6',pri:1}})}
const STEK=[[184.3,58,'g','De Gracht'],[184.3,168,'g','De Gracht'],[198.6,116,'g','De Gracht'],[370.5,105,'h','Havensteiger'],[370.5,49,'h','Havensteiger'],[92,248.6,'z','Het strand'],[250,248.6,'z','Het strand'],[494.6,304,'v','De vijver'],[462,7.4,'h','IJ-oever']];
/* =================== uitkijkpunten =================== */
const KIJK=[['strand',40,248,'Strandpunt'],['haven',336.2,62,'Havenkraan'],['park',152,9,'Noorderpark'],['ij',540,8,'IJ-oever'],['west',8.5,110,'Westkust'],['vijver',524,285,'De vijver']];
let kijk=null;
function uitkijk(s){if(busy()||kijk)return;const sc=scene();kijk={t:0,w:performance.now(),f0:sc.fog.far,n0:sc.fog.near,y0:G.yawT};G.camK=2.5;sc.fog.near=170;sc.fog.far=460;document.body.classList.add('sd-cine');G.snd&&G.snd.fx('open');G.stopPath&&G.stopPath();
  const H=obj('stadKijk',{});if(!H[s.id]){H[s.id]=Date.now();const n=Object.keys(H).length;G.ev&&G.ev('uitkijk');fl('Uitkijkpunt '+n+'/'+KIJK.length,G.P.x,G.P.z,'#ffd35a');if(n===KIJK.length){const g=zScale(6);S.cash+=g;G.msg&&G.msg('stad','Alle uitkijkpunten gevonden. De stad ligt aan je voeten. Bonus: '+fmt(g)+'.')}sv()}}
function kijkStep(dt){if(!kijk)return;kijk.t+=dt;G.yawT+=dt*.12;const P=G.P;if(kijk.t>9||performance.now()-kijk.w>11000||Math.hypot(P.vx,P.vz)>1||G.talking||G.driving){const sc=scene();sc.fog.near=kijk.n0;sc.fog.far=kijk.f0;G.camK=null;kijk=null;document.body.classList.remove('sd-cine')}}
/* =================== dobbelen met Snelle Eddy =================== */
const dobS=()=>{const D=obj('stadDob',{});const k=dayKey();if(D.k!==k){D.k=k;D.net=0;D.n=0}return D};
const die=n=>`<i class="sd-die d${n}">${'<u></u>'.repeat(n)}</i>`;
function dobbel(n){const D=dobS(),cap=zScale(10);if(D.net>=cap){K.say('Ik ben blut voor vandaag. Jij hebt me kaalgeplukt. Kom morgen terug.','boos');return}
  const bets=[zScale(.2),zScale(1),zScale(4)].filter((v,i,a)=>a.indexOf(v)===i);K.closeDialog(true);let bet=0,st='bet',my=[1,1],his=[1,1],tmr=0,onClick=null;
  const body=()=>`<div class="sd-dob"><div><small>Jij</small><span id="sdDbM">${die(my[0])}${die(my[1])}</span></div><b id="sdDbR">${st==='bet'?'Inzet?':''}</b><div><small>Eddy</small><span id="sdDbH">${die(his[0])}${die(his[1])}</span></div></div><div class="sd-dob-b" id="sdDbB"></div>`;
  const pan=G.mini.paneel('Dobbelen','Twee stenen, hoogste wint. Gelijk is opnieuw.',body(),{onEnd:()=>{clearInterval(tmr);pan.el.removeEventListener('click',onClick);n.st=n.fixed?'stand':'walk';n.t=0}});n.st='hold';n.t=0;n.dur=600;
  const q=s=>pan.el.querySelector(s);
  const btns=()=>{const B=q('#sdDbB');if(st==='bet')B.innerHTML=bets.map(v=>`<button class="btn sm" data-bet="${v}" ${S.cash<v?'disabled':''}>${fmt(v)}</button>`).join('')+'<button class="btn ghost sm" data-stop>Stoppen</button>';
    else if(st==='won')B.innerHTML=`<button class="btn sm" data-dub ${S.cash<bet*2?'disabled':''}>Dubbel of niks · ${fmt(bet*2)}</button><button class="btn ghost sm" data-again>Nog een keer</button><button class="btn ghost sm" data-stop>Stoppen</button>`;
    else if(st==='lost')B.innerHTML='<button class="btn sm" data-again>Nog een keer</button><button class="btn ghost sm" data-stop>Stoppen</button>';else B.innerHTML=''};
  const roll=(b,free)=>{if(!free&&S.cash<b){G.toast('Niet genoeg contant geld','bad');return}bet=b;st='roll';btns();q('#sdDbR').textContent=fmt(bet);let k=0;G.snd&&G.snd.fx('grab');clearInterval(tmr);
    tmr=setInterval(()=>{k++;my=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];his=[1+Math.floor(Math.random()*6),1+Math.floor(Math.random()*6)];q('#sdDbM').innerHTML=die(my[0])+die(my[1]);q('#sdDbH').innerHTML=die(his[0])+die(his[1]);if(k%2)G.snd&&G.snd.fx('click');
      if(k>=11){clearInterval(tmr);const a=my[0]+my[1],h=his[0]+his[1];if(a===h){q('#sdDbR').textContent='Gelijk! Opnieuw…';setTimeout(()=>{if(q('#sdDbR'))roll(bet,true)},700);return}
        const D=dobS();D.n=(D.n||0)+1;if(D.n<=10)G.ev&&G.ev('dobbel');S.stats=S.stats||{};
        if(a>h){S.cash+=bet;if(typeof addZwart==='function')addZwart(bet);D.net+=bet;S.stats.won=(S.stats.won||0)+bet;st='won';q('#sdDbR').innerHTML='<em class="ok">+'+fmt(bet)+'</em>';G.snd&&G.snd.fx('cash');G.bubble&&G.bubble(n,pick(['Geluk.','Hmpf.','Nog een keer.']))}
        else{S.cash-=bet;D.net-=bet;S.stats.lost=(S.stats.lost||0)+bet;st='lost';q('#sdDbR').innerHTML='<em class="bad">−'+fmt(bet)+'</em>';G.snd&&G.snd.fx('bad');G.bubble&&G.bubble(n,pick(['Ha!','Dank je wel.','Het geluk is met de dommen.']))}
        sv();if(D.net>=cap){st='done';q('#sdDbB').innerHTML='<button class="btn ghost sm" data-stop>Eddy is blut</button>';return}btns()}},80)};
  onClick=e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.bet){roll(+t.dataset.bet)}else if(t.dataset.again!=null){st='bet';q('#sdDbR').textContent='Inzet?';btns()}else if(t.dataset.dub!=null){roll(bet*2)}else if(t.dataset.stop!=null){pan.close()}};
  pan.el.addEventListener('click',onClick);
  btns()}
/* =================== straatoptreden met de muzikant =================== */
async function optreden(n){const cd=(S.cd&&S.cd.stadOptreden||0)-now();if(cd>0||S.energy<3)return;K.closeDialog(true);S.energy-=3;S.cd=S.cd||{};S.cd.stadOptreden=now()+240000*(typeof waitK==='function'?waitK():1);sv();
  G.optreden=true;G.emote={id:'dans',t0:performance.now()};G.poseLock=true;let crowd=0;G.NPC.forEach(m=>{if(m===n||m.fixed||!['walk','phone','wait','chat','photo'].includes(m.st))return;const d=Math.hypot(m.x-G.P.x,m.z-G.P.z);if(d<15&&crowd<8&&G.los(m,G.P)){crowd++;m.back='walk';m.st=Math.random()<.3?'dance':'watch';m.t=0;m.dur=40;m.party=1}});
  G.bubble&&G.bubble(n,'Daar gaan we! ♪',{col:'#ffe9a8'});
  const r=await G.mini.ritme({title:'Straatoptreden',sub:'Druk de pijl als hij in het vak staat',n:18,hit:c=>{if(c%3===0)G.fx2&&G.fx2.burst(G.P.x+rr(-2,2),.3,G.P.z+rr(-2,2),'#ffd35a',3)}});
  G.optreden=false;G.poseLock=false;G.emote=null;G.NPC.forEach(m=>{if(m.party){m.party=0;m.dur=1.5;m.t=0}});
  if(r==='cancel'){G.toast('Je stopt ermee','info');return}
  const tips=Math.max(5,Math.round(witPE()*3*r.score*(1+.1*Math.min(5,crowd))*(1+.25*perk('charme'))/5)*5);
  if(r.score>=.5){S.cash+=tips;G.ev&&G.ev('optreden');G.rep&&G.rep.add(G.P.x,G.P.z,3);if(typeof addXp==='function')addXp(3);G.snd&&G.snd.fx('cash');fl('Fooi +'+fmt(tips)+' · '+r.hits+'/'+r.n+' raak',G.P.x,G.P.z,'#ffd35a');G.bubble&&G.bubble(n,r.score>.85?'Wat een show!':'Lekker gespeeld!',{col:'#ffe9a8'});if(G.doEmote)G.doEmote('buig')}
  else{G.toast('Het publiek loopt door ('+r.hits+'/'+r.n+' raak)','bad');G.snd&&G.snd.fx('bad')}sv()}
/* =================== fotomodus =================== */
const FILT=[['Normaal',1.12,[1,1,1]],['Warm',1.25,[1.08,1,.86]],['Koel',1.05,[.88,.98,1.12]],['Zwart-wit',0,[1,1,1]],['Fel',1.6,[1.04,1.02,1]],['Sepia',.15,[1.12,.98,.78]]];
const fb=document.createElement('div');fb.className='sd-foto';fb.id='sdFoto';fb.hidden=true;document.body.appendChild(fb);let fi=0,fOn=false;
function fotoUI(){fb.innerHTML=`<div class="sd-foto-in"><button data-f="-1" aria-label="Vorig filter">‹</button><b>${E(FILT[fi][0])}</b><button data-f="1" aria-label="Volgend filter">›</button><button data-pose title="Pose">${G.emoteIc?G.emoteIc.smile:''}</button><button class="btn sm" data-snap>${K.ic.photo} Foto</button><button class="sd-x" data-fclose aria-label="Sluiten">×</button></div>`}
function fotoSet(){const u=G.post.material.uniforms;fOn=true;u.uSat.value=FILT[fi][1];G.fotoTint=FILT[fi][2]}
function fotoOpen(){if(G.driving||G.talking){return}if(G.phone&&G.phone.isOpen())G.phone.close();if(G.paused)G.resume();document.body.classList.add('sd-fotomode');fb.hidden=false;fi=0;fotoUI();fotoSet();G.snd&&G.snd.fx('open');if(!fotoOpen.t){fotoOpen.t=1;G.toast(touch?'Veeg om te draaien, knijp om te zoomen':'Z en C draaien, scrollen zoomt','info')}}
function fotoClose(){if(fb.hidden)return;fb.hidden=true;fOn=false;document.body.classList.remove('sd-fotomode');G.post.material.uniforms.uSat.value=1.12;G.fotoTint=null;G.snd&&G.snd.fx('close')}
function fotoSnap(){try{G.render();const src=G.canvas,k=Math.max(1,Math.round(1280/src.width)),c=document.createElement('canvas');c.width=src.width*k;c.height=src.height*k+26*k/2;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.fillStyle='#0b0c0f';x.fillRect(0,0,c.width,c.height);x.drawImage(src,0,0,src.width*k,src.height*k);
    const bh=13*k;x.fillStyle='#f2c230';x.font=`bold ${Math.round(bh*.5)}px monospace`;x.textBaseline='middle';x.fillText('PIXELSTAD · '+M.districtAt(G.P.x,G.P.z).toUpperCase(),Math.round(bh*.4),src.height*k+bh/2);
    x.fillStyle='#c9c5bb';x.textAlign='right';x.fillText((window.__USER__||'')+' · '+new Date().toLocaleDateString('nl-NL'),c.width-Math.round(bh*.4),src.height*k+bh/2);
    const a=document.createElement('a');a.href=c.toDataURL('image/png');a.download='pixelstad-'+Date.now()+'.png';document.body.appendChild(a);a.click();a.remove();G.snd&&G.snd.fx('click');G.flash&&G.flash('#ffffff',.7);G.ev&&G.ev('stadfoto')}catch(e){console.error(e);G.toast('De foto kon niet worden opgeslagen','bad')}}
fb.addEventListener('click',e=>{const t=e.target.closest('button');if(!t)return;if(t.dataset.f){fi=(fi+(+t.dataset.f)+FILT.length)%FILT.length;fotoUI();fotoSet();G.snd&&G.snd.fx('tab');return}if(t.dataset.pose!=null){G.emoteWheel&&G.emoteWheel.toggle();return}if(t.dataset.snap!=null){fotoSnap();return}if(t.dataset.fclose!=null)fotoClose()});
addEventListener('keydown',e=>{if(fb.hidden)return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();fotoClose()}},true);
G.foto={open:fotoOpen,close:fotoClose,isOpen:()=>!fb.hidden};
/* =================== diensten van mensen (koffie, snack, vis, dobbelen, optreden) =================== */
G.npcService=G.npcService||{};
G.npcService.barista=eetKeuze('espresso','drink');
G.npcService.snack=eetKeuze('shoarma','eet');
G.npcService.visboer=(n,ch)=>{const V=visS(),k=units('restaurant').length?1.15:1,tot=Math.round(V.bag.reduce((a,f)=>a+f.v,0)*k/5)*5;
  ch.push({t:V.bag.length?'Vis verkopen · '+fmt(tot):'Vis verkopen',sub:V.bag.length?V.bag.length+' in je emmer'+(k>1?' · +15% (jouw restaurant)':''):'',ic:K.ic.vis,dis:!V.bag.length,why:'Je emmer is leeg',f:()=>{verkoopVis(n);K.say(pick(['Mooie vangst. Hier, eerlijk geld.','Die gaat vanavond nog de pan in.','Verser krijg je het niet.']),'blij',[{t:'Bedankt',ic:K.ic.hand,f:()=>K.closeDialog()}])}});
  ch.push({t:'Waar bijt het?',ic:K.ic.route,f:()=>{const P=G.P,L=SP.filter(s=>s.k==='vis').sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z));const s=L[0];if(s&&G.setWaypoint){K.closeDialog(true);G.setWaypoint(s.x,s.z,'Visstek · '+s.sub)}}});
  ch.push({t:'Visboek',sub:Object.keys(V.dex).length+' van '+VIS.length+' soorten',ic:K.ic.star,f:()=>{K.closeDialog(true);G.phone&&G.phone.open('visboek')}})};
G.npcService.dobbelaar=(n,ch)=>{const D=dobS();ch.push({t:'Dobbelen',sub:'Inzet vanaf '+fmt(zScale(.2)),ic:K.ic.dobbel,risk:2,dis:S.cash<zScale(.2),why:'Je hebt minstens '+fmt(zScale(.2))+' nodig',f:()=>dobbel(n)})};
G.npcService.muzikant=(n,ch)=>{const cd=(S.cd&&S.cd.stadOptreden||0)-now();let why='';if(cd>0)why='Even pauze: nog '+Math.ceil(cd/60000)+' min';else if(S.energy<3)why='Te moe: 3 energie nodig';
  ch.push({t:'Samen optreden',sub:why?'':'Ritmespel · het publiek geeft fooi',ic:K.ic.music,dis:!!why,why,f:()=>optreden(n)})};
/* =================== opstarten =================== */
let tt=0;
function step(dt){tt+=dt;if(tt>.08){tt=0;promptStep()}sitStep(dt);kijkStep(dt);if(bob&&bob.visible)bob.rotation.y+=dt}
const wait=setInterval(()=>{if(!G.ready||!G.addFixed||!G.post)return;clearInterval(wait);
  try{setupBenches();setupBins();setupAtms()}catch(e){console.error(e)}
  try{// koffiekar op Het Plein, snackkar en viskraam op de boulevard, de dobbelaar in de haven
    put(MOD.koffie(),234.5,128.6,Math.PI);solid(234.5,128.6,1);G.addFixed('barista',232.6,128.4,Math.PI);
    put(MOD.snack(),128,230.6,Math.PI);solid(128,230.6,1.1);G.addFixed('snack',125.9,230.4,Math.PI);
    put(MOD.vis(),176,230.6,Math.PI);solid(176,230.6,1.1);G.addFixed('visboer',173.9,230.4,Math.PI);
    const ed=M.nearestWalk(319,66,6)||{x:319,z:66};put(MOD.kist(),ed.x,ed.z+1.2,0);G.addFixed('dobbelaar',ed.x,ed.z,0);
    const kar=(arch,nm,ic,c)=>{const n=G.NPC.find(q=>q.arch===arch);if(n)G.spot({k:'npc',x:n.x,z:n.z,r:0,n:nm,dot:c,dotR:80,map:{n:nm,ic,c,pri:1}})};
    kar('barista','Koffiekar van Luigi',K.ic.kop,'#ffad6b');kar('snack','Snackkar van Ali',K.ic.kop,'#ffd166');kar('visboer','Ouwe Jaap (visboer)',K.ic.vis,'#7fb8d6');kar('dobbelaar','Snelle Eddy (dobbelen)',K.ic.dobbel,'#b8a1ff');
    // mensen op bankjes
    const SUB=[['oma','duiven'],['student','lees'],['zakenman',''],['burger',''],['oma',''],['toerist','']];let bi=0;benches.filter((b,i)=>i%4===1).slice(0,SUB.length).forEach(b=>{const s=SUB[bi++],n=G.addFixed(s[0],b.x,b.z,b.ry);n.x=b.sx;n.z=b.sz;n.home={x:b.sx,z:b.sz,ry:b.ry};n.st='sitb';n.sub=s[1];n.fixSt='sitb';b.npc=n})
  }catch(e){console.error(e)}
  try{STEK.forEach(s=>stek(s[0],s[1],s[2],s[3]))}catch(e){console.error(e)}
  try{KIJK.forEach(([id,x,z,nm])=>{const p=M.nearestWalk(x,z,6);if(!p)return;put(MOD.kijker(),p.x,p.z,0);const q=M.nearestWalk(p.x,p.z+.9,2)||p;
    G.spot({k:'kijk',id,x:q.x,z:q.z,r:1.9,n:'Uitkijken',sub:nm,col:'#d6a63e',h:2.2,act:uitkijk,dot:'#d6a63e',dotR:70,dotIf:()=>!(S.stadKijk||{})[id],map:{n:'Uitkijkpunt · '+nm,ic:K.ic.eye,c:'#d6a63e',pri:1}})})}catch(e){console.error(e)}
  // eenmalig bericht over wat er nieuw is
  try{if(!localStorage.getItem('stad_nieuw3')){localStorage.setItem('stad_nieuw3','1');setTimeout(()=>G.msg&&G.msg('stad','Nieuw in de stad: emotes (T), vissen, dobbelen, straatraces, wijken om over te nemen en een zwerfhond in het Noorderpark.',{k:'app',a:'doen'}),5200)}}catch(e){}
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},250);
})();
