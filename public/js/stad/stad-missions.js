// Pixelstad: klussen als missies in de stad. Zelfde klussen, kans, buit, energie, wachttijd en straf als het klikspel
// (CRIMES, chance(), crimeResolve(), crimeFail()), maar je speelt ze zelf: sluipen langs bewakers, sloten kraken, overvallen
// en vluchten voor de politie, koerierswerk met een stille agent op je hielen. Overslaan (met de kans op de kaart) kan ook.
// Moeilijkheid volgt de kans: hoe hoger je kans (rang, professionaliteit, spullen), hoe makkelijker de missie.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const E=s=>typeof esc==='function'?esc(s):String(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
/* ---------- soorten missies ---------- */
const KIND={bedelen:'beg',zakken:'lift',horloge:'lift',winkeldief:'grab',fiets:'grab',pakket:'grab',scooter:'grab',koper:'grab',parkeer:'grab',autokraak:'grab',garagebox:'grab',heling:'grab',
 spuiten:'tag',inbraak:'sneak',pand:'sneak',rivaal:'sneak',kunst:'sneak',kasteel:'sneak',geneve:'sneak',londen:'sneak',kroon:'sneak',diamant:'sneak',
 flessen:'grab',katalysator:'grab',apotheek:'grab',wapenlading:'grab',stroom:'tag',stadion:'rob',scheepswerf:'sneak',winkel:'rob',ramkraak:'rob',juwelier:'rob',bank:'rob',transport:'rob',casino:'rob',centralebank:'rob',goud:'rob',jet:'rob',vrachtwagen:'rob',tanker:'rob',rotterdam:'rob',goudreserve:'rob',jacht:'rob',container:'rob'};
const KN={beg:'Bedelen',lift:'Zakkenrollen',grab:'Graaien',tag:'Taggen',sneak:'Inbraak',rob:'Overval',courier:'Koerier'};
const kindOf=c=>KIND[c.id]||'courier';
// plekken in de stad (worden op de dichtstbijzijnde begaanbare plek gezet)
const SP={plein:[229,114,'Het Plein'],apotheek:[140,134.5,'de apotheek in het Centrum'],bank:[154,78,'de Onderbank'],casino:[229,76,'Casino Royaal'],drogist:[64,134.5,'de drogist in de Westbuurt'],juwelier:[160,145.5,'de juwelier in het Centrum'],
 avond:[100,93.5,'de avondwinkel in de Westbuurt'],elektro:[236,145.5,'de elektronicazaak op Oud-Zuid'],fiets:[183.5,110,'het fietsenrek aan de Gracht'],stoep:[120,93.5,'een portiek in de Westbuurt'],
 parkeer:[290,93.5,'de parkeergarage op de Zuidas'],bouw:[234,206,'de bouwplaats aan de Boulevard'],box:[325,80,'de garageboxen in De Haven'],geldauto:[166,86,'de geldauto voor de bank'],
 pier:[360,105,'de pier in De Haven'],hangar:[360,161,'de hangar op de pier'],yard:[324,24,'het containerterrein'],heler:[298.4,103,'Het Contact (de heler)'],
 kade:[200,60,'de kade bij de Gracht'],brug:[191,140,'de brug over de Gracht'],strand:[150,236,'het strand'],park:[150,18,'het Noorderpark'],villa:[80,26,'het Villapark'],zuidas:[279,136,'de Zuidas']};
const LOC={flessen:'stoep',katalysator:'parkeer',apotheek:'apotheek',wapenlading:'yard',stroom:'bouw',stadion:'zuidas',bedelen:'bank',zakken:'plein',horloge:'plein',winkeldief:'drogist',fiets:'fiets',pakket:'stoep',scooter:'brug',koper:'bouw',parkeer:'parkeer',autokraak:'parkeer',garagebox:'box',heling:'kade',
 spuiten:'zuidas',winkel:'avond',ramkraak:'elektro',juwelier:'juwelier',bank:'bank',centralebank:'bank',goudreserve:'bank',transport:'geldauto',casino:'casino',goud:'hangar',jet:'hangar',vrachtwagen:'box',tanker:'pier',rotterdam:'pier',jacht:'pier',container:'yard'};
// sluip-gebieden (open terrein met bewaking) per inbraak
const ZONE={villa:{r:[49,9,113,26],crack:[98,14],n:'het Villapark'},park:{r:[126,8,182,27],crack:[152,12],n:'het beeldenpark'},yard:{r:[310,8,338,42],crack:[330,12],n:'het containerterrein'},
 strand:{r:[20,229,180,246],crack:[100,231],n:'het strandpaviljoen'}};
const ZLOC={scheepswerf:'yard',inbraak:'villa',kasteel:'villa',kunst:'park',kroon:'park',londen:'park',rivaal:'yard',diamant:'yard',geneve:'yard',pand:'strand'};
const GETAWAY=[[14,60],[14,170],[30,32],[150,30],[214,28],[318,198],[150,232],[250,236],[60,232],[200,180],[110,186],[350,170],[286,190]];
const snap=(x,z)=>M.nearestWalk(x,z,12)||{x,z};
const spot=k=>{const s=SP[k]||SP.plein,p=snap(s[0],s[1]);p.n=s[2];return p};

/* ---------- mensen in de missie (bewakers, agenten, doelwit, stille agent) ---------- */
const SKIN=['#e9b98f','#d9a27a','#b97a52','#8d5a3a','#f1caa5'];
const LOOK={cop:()=>({skin:pick(SKIN),hair:'#2a1d14',top:'#1d2a4a',arm:'#1d2a4a',pants:'#151c30',shoe:'#0e0f12',hat:'cap',hatC:'#1d2a4a'}),
 guard:()=>({skin:pick(SKIN),hair:'#151517',top:'#1a1a1c',arm:'#1a1a1c',pants:'#1a1a1c',shoe:'#0e0f12',hat:Math.random()<.5?'bald':'none',hatC:'#111'}),
 target:()=>({skin:pick(SKIN),hair:'#c9a24a',top:pick(['#e8584a','#3a8ad6','#f0b23a']),arm:'#f1caa5',pants:'#e8e4da',shoe:'#e8e4da',hat:'hat',hatC:'#e8d8a0'}),
 tail:()=>({skin:pick(SKIN),hair:'#3a2a1a',top:'#5a5d63',arm:'#5a5d63',pants:'#2a2c30',shoe:'#2a2c30',hat:'none'}),
 ped:()=>({skin:pick(SKIN),hair:pick(['#2a1d14','#151517','#8a6a3a']),top:pick(['#3a4a6a','#7a2f2a','#2f5d3a','#d8d4cc','#c28a2a']),arm:'#d9a27a',pants:pick(['#1d2531','#3a3c40','#4a3a2a']),shoe:'#2a2c30',hat:'none'})};
function los(a,b){const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.ceil(L*2);for(let i=1;i<n;i++){const x=a.x+dx*i/n,z=a.z+dz*i/n,xi=x|0,zi=z|0;if(M.solid[zi*M.W+xi])return false}return true}
let scene=null;
function cone(R,half){const g=new TH.CircleGeometry(R,16,-half,half*2);g.rotateX(-Math.PI/2);const m=new TH.Mesh(g,new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.22,depthWrite:false}));m.position.y=.07;m.renderOrder=3;scene.add(m);return m}
function actor(kind,x,z,o){const p=snap(x,z),a=Object.assign({kind,x:p.x,z:p.z,ry:rr(0,6.28),ph:rr(0,6),sp:0,look:LOOK[kind](),sus:0,path:null,pt:0},o||{});
  if(a.R)a.cone=cone(a.R,a.half||.66);G.actors.push(a);return a}
function removeActor(a){const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1);if(a.cone){scene.remove(a.cone);a.cone.geometry.dispose()}}
function moveTo(a,tx,tz,speed,dt){const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d<.15){a.sp=0;return true}const v=Math.min(speed*dt,d),nx=a.x+dx/d*v,nz=a.z+dz/d*v;
  let moved=false;if(M.canStand(nx,a.z,.3)){a.x=nx;moved=true}if(M.canStand(a.x,nz,.3)){a.z=nz;moved=true}
  const tr=Math.atan2(dx,dz);let r=tr-a.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;a.ry+=r*Math.min(1,dt*10);a.ph+=dt*speed*1.25;a.sp=Math.min(1.3,speed/4.2);a.stuck=moved?0:(a.stuck||0)+dt;return false}
// achtervolgen via een route (elke 1,2 s opnieuw), dichtbij recht op je af
function chase(a,tx,tz,speed,dt){a.pt-=dt;const d=Math.hypot(tx-a.x,tz-a.z);
  if(d<6&&los(a,{x:tx,z:tz})){moveTo(a,tx,tz,speed,dt);return}
  if(a.pt<=0||!a.path||!a.path.length){a.pt=1.2+Math.random()*.4;a.path=M.findPath(a.x,a.z,tx,tz)||[{x:tx,z:tz}]}
  const w=a.path[0];if(moveTo(a,w.x,w.z,speed,dt)||Math.hypot(w.x-a.x,w.z-a.z)<.5)a.path.shift()}
// kijken: zit de speler in de kegel en is er zicht?
function sees(a,P,R,half){const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);if(d>R)return 0;let ang=Math.atan2(dx,dz)-a.ry;while(ang>Math.PI)ang-=Math.PI*2;while(ang<-Math.PI)ang+=Math.PI*2;
  if(Math.abs(ang)>half)return 0;if(!los(a,P))return 0;return 1-d/R*.6}

/* ---------- markeringen in de wereld ---------- */
let beam=null,ring=null,objs=[];
function marker(p,col){if(!beam){beam=new TH.Mesh(new TH.CylinderGeometry(.9,.9,46,10,1,true),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.28,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}));beam.renderOrder=4;scene.add(beam);
  ring=new TH.Mesh(new TH.RingGeometry(1.4,1.9,20),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;scene.add(ring)}
  beam.visible=ring.visible=!!p;if(!p)return;beam.material.color.set(col||0xffd35a);ring.material.color.set(col||0xffd35a);beam.position.set(p.x,23,p.z);ring.position.set(p.x,.08,p.z)}
function loot(p,kind){const g=new TH.Group(),c={bag:0x2a2c30,box:0x8a6a42,gold:0xd6a63e,bike:0x3a8ad6,art:0xb03a2e,cash:0x3fe395}[kind]||0xd6a63e;
  const b=new TH.Mesh(new TH.BoxGeometry(kind==='bike'?1.8:.8,kind==='bike'?1:.6,kind==='bike'?.4:.6),new TH.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.25}));b.position.y=kind==='bike'?.6:.32;b.castShadow=true;g.add(b);
  const d=new TH.Mesh(new TH.OctahedronGeometry(.28,0),new TH.MeshBasicMaterial({color:0xffd35a}));d.position.y=1.6;g.add(d);g.userData.d=d;g.position.set(p.x,0,p.z);scene.add(g);objs.push(g);return g}
function clearObjs(){objs.forEach(o=>scene.remove(o));objs=[]}

/* ---------- de missie ---------- */
let MS=null;G.mission=()=>MS;
function far(from,min,max){const c=GETAWAY.map(([x,z])=>snap(x,z)).filter(p=>{const d=dist(p,from);return d>=min&&d<=max});return c.length?pick(c):snap(...pick(GETAWAY))}
function build(c){const k=kindOf(c),ch=typeof chance==='function'?chance(c):50,D=clamp(1-ch/100,0,.9);const P=G.P;
  const m={c,k,D,ch,steps:[],i:0,t:0,miss:0,alarm:false,cops:[],guards:[],extra:[],held:0,carry:null,limit:0,txt:'',sus:0,start:performance.now()};
  const add=s=>m.steps.push(s);
  if(k==='beg'){const s=spot(LOC[c.id]||'bank');m.where=s.n;add({t:'go',p:s,r:4,txt:'Ga naar '+s.n});add({t:'beg',p:s,need:4+Math.round(D*3),time:50,txt:'Spreek voorbijgangers aan'});
    for(let i=0;i<7;i++)m.extra.push(actor('ped',s.x+rr(-14,14),s.z+rr(-6,6),{walker:1,home:s}))}
  else if(k==='lift'){const s=spot(LOC[c.id]||'plein');m.where=s.n;add({t:'go',p:s,r:12,txt:'Zoek je doelwit op '+s.n});
    const tg=actor('target',s.x+rr(-3,3),s.z+rr(-3,3),{home:s,turn:rr(2,4)});m.target=tg;const dm=new TH.Mesh(new TH.OctahedronGeometry(.3,0),new TH.MeshBasicMaterial({color:0xffd35a}));dm.scale.set(1,1.5,1);scene.add(dm);objs.push(dm);tg.dia=dm;add({t:'lift',txt:'Sluip achter het doelwit en grijp toe',d:1+D*1.4});add({t:'away',from:tg,dist:30,txt:'Loop rustig weg'})}
  else if(k==='grab'){const s=spot(LOC[c.id]||'stoep');m.where=s.n;const kind=/fiets|scooter/.test(c.id)?'bike':/koper/.test(c.id)?'box':'bag';
    m.obj=loot(s,kind);add({t:'go',p:s,r:2.2,txt:'Ga naar '+s.n});add({t:'hold',p:s,r:2.2,d:2+D*3,txt:/fiets|scooter/.test(c.id)?'Knip het slot door':'Pak het',act:/fiets|scooter/.test(c.id)?'Slot knippen':'Pakken',take:1});
    const h=spot('heler');add({t:'deliver',p:h,r:2.5,txt:'Breng het naar Het Contact (de heler)'});
    const g=1+Math.round(D*2);for(let i=0;i<g;i++)m.guards.push(actor(i%2?'cop':'guard',s.x+rr(-10,10),s.z+rr(-10,10),{R:7+D*5,half:.6,home:s,rad:12}))}
  else if(k==='tag'){const s=spot(LOC[c.id]||'zuidas');m.where=s.n;const pts=[0,1,2].map(i=>snap(s.x+rr(-18,18),s.z+rr(-14,14))),tt=c.id==='stroom'?['Tap stroom af bij kast','Aftappen']:['Tag muur','Spuiten'];
    pts.forEach((p,i)=>add({t:'hold',p,r:2,d:2.5+D*2,txt:tt[0]+' '+(i+1)+' van 3',act:tt[1]}));add({t:'getaway',p:far(s,45,90),txt:'Maak dat je wegkomt'});
    for(let i=0;i<1+Math.round(D*2);i++)m.guards.push(actor('cop',s.x+rr(-14,14),s.z+rr(-10,10),{R:8+D*4,half:.62,home:s,rad:18}))}
  else if(k==='sneak'){const z=ZONE[ZLOC[c.id]||'villa'],r=z.r;m.where=z.n;const cr=snap(z.crack[0],z.crack[1]);
    add({t:'go',p:snap((r[0]+r[2])/2,r[1]-1),r:6,txt:'Ga naar '+z.n});add({t:'hold',p:cr,r:2,d:3+D*4,txt:'Kraak het slot',act:'Slot kraken'});
    const n=2+Math.round(D*2),lp=[];for(let i=0;i<n;i++){let p;for(let k=0;k<30;k++){p=snap(rr(r[0]+2,r[2]-2),rr(r[1]+1,r[3]-1));if(lp.every(q=>dist(q,p)>8))break}lp.push(p)}
    add({t:'loot',pts:lp,txt:'Pak de buit',kind:/kunst|kroon|londen/.test(c.id)?'art':/diamant|geneve/.test(c.id)?'gold':'bag'});add({t:'getaway',p:far(cr,60,120),txt:'Naar je vluchtauto'});
    for(let i=0;i<1+Math.round(D*3);i++)m.guards.push(actor('guard',rr(r[0]+3,r[2]-3),rr(r[1]+2,r[3]-2),{R:8+D*5,half:.66,zone:r}))}
  else if(k==='rob'){const s=spot(LOC[c.id]||'avond');m.where=s.n;add({t:'go',p:s,r:2.5,txt:'Ga naar '+s.n});add({t:'hold',p:s,r:2.6,d:2.5+D*2.5,txt:'Overval! Houd ze in bedwang',act:'Overvallen',alarm:1});
    const n=1+Math.round(D*2),lp=[];for(let i=0;i<n;i++)lp.push(snap(s.x+rr(-7,7),s.z+rr(-7,7)));add({t:'loot',pts:lp,txt:'Grijp de buit',kind:/bank|transport|centrale|goud/.test(c.id)?'cash':'gold'});
    add({t:'getaway',p:far(s,80,140),txt:'Vlucht naar je vluchtauto'})}
  else{// koerier: ophalen, eventueel een gesprek, afleveren; soms een stille agent erachteraan
    const all=Object.keys(SP).filter(k=>!['heler'].includes(k)).map(spot).sort(()=>Math.random()-.5);
    const a=all.find(p=>dist(p,P)>25&&dist(p,P)<110)||all[0],b=all.find(p=>p!==a&&dist(p,a)>50&&dist(p,a)<140)||all[1],cc=all.find(p=>p!==a&&p!==b&&dist(p,b)>45&&dist(p,b)<150)||all[2];
    m.where=a.n;add({t:'go',p:a,r:2.5,txt:'Haal het pakket op bij '+a.n});add({t:'hold',p:a,r:2.5,d:1.2,txt:'Pak het pakket aan',act:'Aanpakken',take:1});
    if(D>.2)add({t:'hold',p:b,r:2.5,d:2+D*2,txt:'Praat met je contact bij '+b.n,act:'Praten'});add({t:'deliver',p:cc,r:2.5,txt:'Lever af bij '+cc.n});
    if(D>.25)m.tailAt=1}
  return m}
/* ---------- starten, slagen, mislukken ---------- */
function canStart(c){if(typeof inJail==='function'&&inJail())return 'Je zit vast';if(cdLeftMs(c))return 'Nog even wachten';if(rankIdx(S.xp)<c.r)return 'Vanaf '+RANKS[c.r][0];
  if(typeof arBanLeft==='function'&&arBanLeft(c))return typeof arBanMsg==='function'?arBanMsg(c):'Even niet';if(S.energy<crEn(c))return 'Te moe: '+crEn(c)+' energie nodig';if(S.pendingGame||S.pendingLock||window.__chase)return 'Er loopt al iets';if(MS)return 'Je bent al bezig';return ''}
const cdLeftMs=c=>{try{return cdLeft(c.id)}catch(e){return 0}};
function start(c){const why=canStart(c);if(why){G.toast(why,'bad');return}
  S.energy-=crEn(c);S.cd[c.id]=now()+crimeCd(c);S.pendingGame={id:c.id,t:now()};save();
  scene=G.scene();MS=build(c);G.actors.length=0;MS.guards.concat(MS.extra).forEach(a=>{if(!G.actors.includes(a))G.actors.push(a)});if(MS.target&&!G.actors.includes(MS.target))G.actors.push(MS.target);
  // de tijd die je hebt: ruim genoeg om te lopen (en het moeilijker te maken naarmate je kans lager is)
  let len=0,last=G.P;MS.steps.forEach(s=>{const p=s.p||(s.pts&&s.pts[0]);if(p){len+=dist(last,p);last=p}});MS.limit=Math.round(70+len/4.4*(1.5-MS.D*.4));
  hud(true);stepStart();G.toast(KN[MS.k]+': '+c.n,'lvl')}
function finish(ok,why){if(!MS)return;const m=MS,c=m.c;MS=null;cleanup();delete S.pendingGame;S.stats.games=(S.stats.games||0)+1;
  if(ok){S.stats.missions=(S.stats.missions||0)+1;if(!m.miss)S.stats.clean=(S.stats.clean||0)+1;banner(m.miss?'Gelukt':'Schone klus','ok');crimeResolve(c,{game:{ok:true,miss:Math.min(3,m.miss)}})}
  else{S.stats.gameFail=(S.stats.gameFail||0)+1;banner('Mislukt','bad');crimeFail(c,why?why.replace(/\.?$/,'. '):'')}
  save();watchOverlay()}
function cleanup(){G.actors.slice().forEach(removeActor);G.actors.length=0;clearObjs();marker(null);hud(false);G.missionPath=null}
G.missionAbort=()=>{if(MS)finish(false,'Je liet de klus schieten')};
G.missionAbortCaught=()=>{if(MS)finish(false,'De politie had je te pakken')};
/* ---------- elke frame ---------- */
function stepStart(){const s=MS.steps[MS.i];if(!s){finish(true);return}MS.held=0;s.st=0;MS.prog=0;MS.hint="";MS.txt=s.txt;
  const tp=s.p||(s.pts&&s.pts[0])||(MS.target);marker(tp&&!MS.target?tp:(s.t==='lift'?null:tp));
  if(s.t==='loot'){s.left=s.pts.slice();s.objs=s.pts.map(p=>loot(p,s.kind))}
  if(s.t==='beg'){s.got=0;s.time0=s.time;s.cool=0}
  if(s.t==='deliver'&&MS.tailAt&&!MS.tail){const p=G.P;MS.tail=actor('tail',p.x-rr(14,18),p.z+rr(-4,4),{R:16,half:.9});MS.tail.cone.visible=false}
  route(tp);hud()}
function route(p){if(!p||!p.x){G.missionPath=null;return}G.missionPath=M.findPath(G.P.x,G.P.z,p.x,p.z)}
function next(){MS.i++;stepStart()}
function alarm(why){if(!MS||MS.alarm)return;MS.alarm=true;MS.miss+=2;G.toast(why||'Alarm! De politie komt eraan','bad');banner('Alarm','bad');
  const n=2+Math.round(MS.D*2.5),P=G.P;for(let i=0;i<n;i++){const a=rr(0,6.28),r=rr(30,46);const cp=actor('cop',P.x+Math.cos(a)*r,P.z+Math.sin(a)*r,{R:9,half:.7,chaser:1,delay:i*.6});MS.cops.push(cp)}
  // geen vluchtstap meer over? dan komt er een bij
  const rest=MS.steps.slice(MS.i);if(!rest.some(s=>s.t==='getaway'||s.t==='deliver'))MS.steps.push({t:'getaway',p:far(P,70,130),txt:'Vlucht naar een schuilplek'});
  if(MS.steps[MS.i].t==='lift'||MS.steps[MS.i].t==='beg'){MS.i=MS.steps.findIndex((s,i)=>i>=MS.i&&(s.t==='getaway'||s.t==='deliver'));if(MS.i<0)MS.i=MS.steps.length-1;stepStart()}
  hud()}
const holding=()=>!!(G.K[' ']||G.K.f||G.actHold);
G.missionAction=()=>{if(!MS)return false;const s=MS.steps[MS.i];if(!s)return false;return ['hold','lift','beg'].includes(s.t)&&inRange(s)};
function inRange(s){const P=G.P;if(G.driving)return false;if(s.t==='hold')return dist(P,s.p)<s.r;if(s.t==='lift')return MS.target&&dist(P,MS.target)<1.8;if(s.t==='beg')return dist(P,s.p)<9;return false}
let rt=0;
G.missionStep=function(dt){if(!MS)return;const m=MS,P=G.P,s=m.steps[m.i];if(!s)return;m.t+=dt;rt+=dt;
  if(rt>3){rt=0;const p=s.p||(m.target&&s.t!=='away'?m.target:null)||(s.left&&s.left[0]);if(p&&dist(P,p)>6)route(p)}
  if(m.t>m.limit){finish(false,'Te laat: de kans is voorbij');return}
  // bewakers en agenten
  let seen=0;
  m.guards.forEach(g=>{if(g.chaser)return;g.pt-=dt;
    if(m.alarm){g.chaser=1;m.cops.push(g);return}
    if(!g.wp||g.pt<=0||moveTo(g,g.wp.x,g.wp.z,1.5,dt)||g.stuck>1.2){if(!g.wait){g.wait=rr(.8,2.6);g.look=g.ry}g.wait-=dt;g.sp=0;g.ry=g.look+Math.sin(m.t*1.4+g.x)*.9;
      if(g.wait<=0){g.wait=0;const b=g.zone?{x:rr(g.zone[0]+2,g.zone[2]-2),z:rr(g.zone[1]+1,g.zone[3]-1)}:{x:g.home.x+rr(-g.rad,g.rad),z:g.home.z+rr(-g.rad,g.rad)};g.wp=snap(b.x,b.z);g.pt=rr(6,12)}}
    const v=sees(g,P,g.R,g.half),noise=Math.hypot(P.vx,P.vz)>7&&dist(g,P)<7?.7:0;const k=Math.max(v*1.7,noise);seen=Math.max(seen,k);g.sus=clamp(g.sus+(k?k*dt*(1+m.D):-dt*.35),0,1);
    if(g.sus>.55&&!g.noted){g.noted=1;m.miss+=1}
    if(g.cone){g.cone.position.set(g.x,.07,g.z);g.cone.rotation.y=g.ry-Math.PI/2;g.cone.material.color.setRGB(1,.83-g.sus*.6,.35-g.sus*.3);g.cone.material.opacity=.18+g.sus*.25}
    if(g.sus>=1)alarm(g.kind==='cop'?'Een agent heeft je gezien!':'De bewaking slaat alarm!')});
  m.sus=m.guards.reduce((a,g)=>Math.max(a,g.chaser?0:g.sus),0);
  // agenten die je achterna zitten
  m.cops.forEach(cp=>{if(cp.delay>0){cp.delay-=dt;return}if(cp.cone){cp.cone.visible=false}chase(cp,P.x,P.z,6.6+m.D*1.6,dt);if(dist(cp,P)<1.15)finish(false,'De politie had je te pakken')});
  if(!MS)return;
  // stille agent: volgt je, ziet hij je te lang, dan belt hij de politie
  if(m.tail){const t=m.tail,d=dist(t,P);if(d>9)chase(t,P.x,P.z,4.6,dt);else t.sp=0;const v=d<16&&los(t,P)?1:0;m.tsus=clamp((m.tsus||0)+(v?dt*.11*(1+m.D):-dt*.08),0,1);if(m.tsus>=1&&!m.alarm)alarm('Je werd gevolgd door een stille agent!');if(d>45){removeActor(t);m.tail=null;G.toast('Je bent je achtervolger kwijt','ok')}}
  // voetgangers bij het bedelen lopen heen en weer
  m.extra.forEach(a=>{if(!a.wp||moveTo(a,a.wp.x,a.wp.z,1.3,dt)||a.stuck>1)a.wp=snap(a.home.x+rr(-16,16),a.home.z+rr(-5,5))});
  // de stap zelf
  const hold=holding();
  if(s.t==='go'){if(dist(P,s.p)<s.r)next()}
  else if(s.t==='hold'){const ok=dist(P,s.p)<s.r;if(ok&&hold){s.st+=dt;if(s.alarm&&!m.alarm&&s.st>.2)alarm('Overval! De politie is gebeld')}else s.st=Math.max(0,s.st-dt*1.5);m.prog=s.st/s.d;
    if(s.st>=s.d){if(s.take&&m.obj){scene.remove(m.obj);m.obj=null;m.carry=1}next()}}
  else if(s.t==='loot'){for(let i=s.left.length-1;i>=0;i--){if(dist(P,s.left[i])<1.4){scene.remove(s.objs[i]);s.left.splice(i,1);s.objs.splice(i,1);G.toast('Buit gepakt ('+(s.pts.length-s.left.length)+'/'+s.pts.length+')','ok')}}
    m.prog=1-s.left.length/s.pts.length;marker(s.left[0]||null);if(!s.left.length)next()}
  else if(s.t==='lift'){const tg=m.target;// doelwit slentert en kijkt af en toe om
    tg.turn-=dt;if(tg.look>0){tg.look-=dt;tg.sp=0;tg.ry=tg.lookRy}else{if(!tg.wp||moveTo(tg,tg.wp.x,tg.wp.z,1.2,dt)||tg.stuck>1)tg.wp=snap(tg.home.x+rr(-9,9),tg.home.z+rr(-9,9))}
    if(tg.turn<=0){tg.turn=rr(2.4,5.4)-m.D*1.4;tg.look=rr(.9,1.8);tg.lookRy=Math.atan2(P.x-tg.x,P.z-tg.z)+rr(-.6,.6)}
    const d=dist(P,tg),front=sees(tg,P,4.5,.75);if(front&&d<4.5){m.lsus=clamp((m.lsus||0)+dt*(.7+m.D),0,1)}else m.lsus=Math.max(0,(m.lsus||0)-dt*.25);m.sus=m.lsus;
    if(m.lsus>=1){finish(false,'Het doelwit had je door en riep de politie');return}
    let ang=Math.atan2(P.x-tg.x,P.z-tg.z)-tg.ry;while(ang>Math.PI)ang-=Math.PI*2;while(ang<-Math.PI)ang+=Math.PI*2;const behind=Math.abs(ang)>1.6;
    if(d<1.8&&behind&&hold){s.st+=dt}else s.st=Math.max(0,s.st-dt*2);m.prog=s.st/s.d;m.hint=d<1.8&&!behind?'Niet van voren: ga achter hem staan':'';
    if(s.st>=s.d){m.carry=1;tg.home={x:tg.x,z:tg.z};next()}}
  else if(s.t==='away'){const d=dist(P,s.from);m.prog=clamp(d/s.dist,0,1);if(d>=s.dist)next();
    const tg=m.target;if(tg){if(!tg.wp||moveTo(tg,tg.wp.x,tg.wp.z,1.2,dt)||tg.stuck>1)tg.wp=snap(tg.home.x+rr(-6,6),tg.home.z+rr(-6,6));if(Math.hypot(P.vx,P.vz)>7&&d<10&&!m.alarm)alarm('Het doelwit ziet je wegrennen!')}}
  else if(s.t==='beg'){s.time-=dt;s.cool-=dt;m.prog=s.got/s.need;
    if(s.time<=0){if(s.got>=Math.ceil(s.need*.6)){m.miss+=1;next()}else finish(false,'Bijna niemand gaf iets en een agent stuurde je weg');return}
    const near=m.extra.find(a=>dist(a,P)<2.4&&!(a.gave>0));m.hint=near?'':'Wacht tot er iemand langsloopt';
    if(near&&hold&&s.cool<=0){s.cool=.5;near.gave=8;if(Math.random()<.72-m.D*.25){s.got++;G.toast('+1 muntje ('+s.got+'/'+s.need+')','ok')}else G.toast('Loopt door…','bad');if(s.got>=s.need)next()}
    m.extra.forEach(a=>{if(a.gave>0)a.gave-=dt})}
  else if(s.t==='deliver'||s.t==='getaway'){const d=dist(P,s.p);if(d<(s.r||3)+.5){if(m.cops.length&&m.cops.some(cp=>!(cp.delay>0)&&dist(cp,P)<4)){m.hint='Schud ze eerst af'}else{next();return}}
    // politie afgeschud: allemaal ver weg
    if(m.cops.length&&m.cops.every(cp=>dist(cp,P)>55)){m.lost=(m.lost||0)+dt;if(m.lost>5){m.cops.forEach(removeActor);m.cops=[];G.toast('Je bent de politie kwijt','ok')}}else m.lost=0}
  if(m.target&&m.target.dia){m.target.dia.position.set(m.target.x,3.2+Math.sin(m.t*3)*.12,m.target.z);m.target.dia.rotation.y+=dt*2}
  // voorwerpen draaien
  objs.forEach(o=>{if(o.userData.d){o.userData.d.rotation.y+=dt*2;o.userData.d.position.y=1.6+Math.sin(m.t*3)*.12}});
  if(ring){const k=1+Math.sin(m.t*4)*.08;ring.scale.set(k,k,k)}
  m.hudT=(m.hudT||0)+dt;if(m.hudT>.1){m.hudT=0;hud()}};
G.missionDots=()=>{if(!MS)return[];const out=[];const s=MS.steps[MS.i];const p=s&&(s.p||(s.left&&s.left[0]));if(p)out.push({x:p.x,z:p.z,c:'#ffd35a',big:1});if(MS.target)out.push({x:MS.target.x,z:MS.target.z,c:'#ffd35a'});
  MS.guards.forEach(g=>out.push({x:g.x,z:g.z,c:g.kind==='cop'?'#4d7dff':'#ff3d52'}));MS.cops.forEach(g=>out.push({x:g.x,z:g.z,c:'#4d7dff'}));if(MS.tail&&MS.tsus>.3)out.push({x:MS.tail.x,z:MS.tail.z,c:'#b8a1ff'});return out};

/* ---------- HUD van de missie ---------- */
const ui=document.createElement('div');ui.id='sdMisUi';document.body.appendChild(ui);
ui.innerHTML=`<div class="sd-mis" id="sdMis" hidden><div class="sd-mis-h"><small id="sdMisK"></small><b id="sdMisN"></b></div><p id="sdMisT"></p>
  <div class="sd-mis-row"><i class="sd-mis-bar" id="sdMisBar"><i></i></i><em id="sdMisTime"></em></div><div class="sd-mis-sus" id="sdMisSus" hidden><span>Opgemerkt</span><i><i></i></i></div>
  <button class="sd-mis-x" id="sdMisX" title="Afbreken (telt als mislukt)">Afbreken</button></div>
 <button class="sd-act" id="sdAct" hidden><i></i><span id="sdActT"></span></button>
 <div class="sd-board" id="sdBoard" hidden><div class="sd-bd"><div class="sd-bd-top"><div><small>Café Het Gat</small><b>Klussen</b></div><span id="sdBdEn"></span><button class="sd-x" data-bclose aria-label="Sluiten">×</button></div>
  <div class="sd-bd-tabs" id="sdBdTabs"></div><div class="sd-bd-list" id="sdBdList"></div></div></div>`;
const fmtT=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function hud(on){const box=$s('sdMis'),ab=$s('sdAct');if(on===false){box.hidden=true;ab.hidden=true;document.body.classList.remove('stad-mis');return}if(!MS)return;
  if(on){box.hidden=false;document.body.classList.add('stad-mis');$s('sdMisK').textContent='Missie · '+KN[MS.k]+(MS.alarm?' · alarm':'');$s('sdMisN').textContent=MS.c.n}
  const s=MS.steps[MS.i];if(!s)return;$s('sdMisK').textContent='Missie · '+KN[MS.k]+(MS.alarm?' · politie!':'');box.classList.toggle('alarm',MS.alarm);
  $s('sdMisT').textContent=(MS.alarm&&(s.t==='getaway'||s.t==='deliver')?'Vlucht! ':'')+s.txt+(MS.hint?' · '+MS.hint:'')+(s.t==='loot'?' ('+(s.pts.length-s.left.length)+'/'+s.pts.length+')':s.t==='beg'?' ('+s.got+'/'+s.need+', '+fmtT(s.time)+')':'');
  $s('sdMisBar').firstChild.style.width=clamp(((MS.i+(MS.prog||0))/MS.steps.length)*100,0,100)+'%';
  const left=MS.limit-MS.t;$s('sdMisTime').textContent=fmtT(left);$s('sdMisTime').classList.toggle('low',left<20);
  const sus=Math.max(MS.sus||0,MS.tsus||0);$s('sdMisSus').hidden=!(sus>.02)||MS.alarm;$s('sdMisSus').querySelector('i>i').style.width=sus*100+'%';
  // actieknop: vasthouden
  const need=['hold','lift','beg'].includes(s.t)&&inRange(s);ab.hidden=!need;if(need){const a=s.act||(s.t==='lift'?'Grijpen':'Aanspreken');$s('sdActT').innerHTML=(touch?'Houd vast · ':'<kbd>Spatie</kbd> ')+E(a);
    ab.style.setProperty('--p',(s.t==='beg'?0:clamp(MS.prog||0,0,1))*100+'%')}MS.prog=s.t==='hold'||s.t==='lift'?MS.prog:MS.prog}
$s('sdMisX').onclick=()=>{if(!MS)return;if(MS._ask&&performance.now()-MS._ask<3000){G.missionAbort();return}MS._ask=performance.now();G.toast('Nog een keer drukken om af te breken. Dat telt als mislukt.','bad')};
// vasthouden met de knop (telefoon) of muis
(function(){const b=$s('sdAct');const on=e=>{e.preventDefault();G.actHold=true},off=()=>{G.actHold=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)})();
let banT=0;function banner(t,c){const a=$s('sdArea');if(!a)return;a.querySelector('small').textContent='Missie';a.querySelector('b').textContent=t;a.hidden=false;a.classList.toggle('bad',c==='bad');a.classList.remove('go');void a.offsetWidth;a.classList.add('go');clearTimeout(banT);banT=setTimeout(()=>{a.hidden=true;a.querySelector('small').textContent='Pixelstad';a.classList.remove('bad')},3200)}
// arrestatie, vluchten en andere schermen van het spel: de wereld staat dan stil
function overlayUp(){const m=$s('modal');return (m&&!m.hidden)||!!document.querySelector('.chase-ov,.ar-ov,.ba-ov,.pr-ov,.fwg-ov,.pv-ov,.pb-ov,.jj-ov')}
let ovT=0;function watchOverlay(){clearInterval(ovT);let n=0;ovT=setInterval(()=>{const up=overlayUp(),inside=G.ui&&G.ui.cur&&G.ui.cur();if(up){if(!G.paused&&!inside){G.pause();G._ovPause=1}}else if(G._ovPause){G._ovPause=0;if(!inside)G.resume()}if(++n>600&&!up)clearInterval(ovT)},300)}
setInterval(()=>{if(overlayUp()&&!G.paused&&!(G.ui&&G.ui.cur&&G.ui.cur())){G.pause();G._ovPause=1;watchOverlay()}},700);

/* ---------- klussenbord (Café Het Gat en de telefoon) ---------- */
let tab='open';
function card(c){const why=canStart(c),lock=rankIdx(S.xp)<c.r,k=kindOf(c),ch=typeof chance==='function'?chance(c):0,cdl=cdLeftMs(c);
  const lo=Math.floor(c.min*(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1)),hi=Math.floor(c.max*(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1));
  const where=(SP[LOC[c.id]]||[0,0,ZONE[ZLOC[c.id]]?ZONE[ZLOC[c.id]].n:'op een paar plekken in de stad'])[2];
  return `<article class="sd-job ${lock?'lock':''} k-${k}"><div class="sd-job-h"><span class="sd-job-k">${KN[k]}</span><b>${E(c.n)}</b><small>${E(where)}</small></div>
   <div class="sd-job-s"><span><i>Kans</i><b class="${ch>=70?'ok':ch<35?'bad':''}">${ch}%</b></span><span><i>Buit</i><b>${fmt(lo)}–${fmt(hi)}</b></span><span><i>Energie</i><b>${crEn(c)}</b></span><span><i>Straf</i><b>${typeof fmtTime==='function'?fmtTime(c.jail):c.jail+'s'}</b></span></div>
   ${lock?`<div class="sd-job-l">Vanaf ${E(RANKS[c.r][0])}</div>`:cdl?`<div class="sd-job-l">Weer over ${fmtT(cdl/1000)}</div>`:`<div class="sd-job-b"><button class="btn sm" data-go="${c.id}" ${why?'disabled':''}>Start missie</button><button class="btn ghost sm" data-skip="${c.id}" ${why?'disabled':''}>Overslaan ${ch}%</button></div>${why&&!lock?`<div class="sd-job-w">${E(why)}</div>`:''}`}</article>`}
function renderBoard(){if(typeof CRIMES==='undefined')return;const ri=rankIdx(S.xp);let list=CRIMES.slice();
  if(tab==='open')list=list.filter(c=>c.r<=ri).reverse();else if(tab==='next')list=list.filter(c=>c.r>ri).slice(0,8);else list=list.filter(c=>c.r<=ri&&kindOf(c)===tab).reverse();
  const kinds=['sneak','rob','grab','courier','lift','tag','beg'].filter(k=>CRIMES.some(c=>c.r<=ri&&kindOf(c)===k));
  $s('sdBdTabs').innerHTML=[['open','Alles'],...kinds.map(k=>[k,KN[k]]),['next','Straks']].map(([k,n])=>`<button data-tab="${k}" class="${tab===k?'on':''}">${n}</button>`).join('');
  $s('sdBdList').innerHTML=list.length?list.map(card).join(''):'<p class="sd-bd-none">Geen klussen in deze lijst.</p>';
  $s('sdBdEn').innerHTML=`<i>Energie</i><b>${Math.floor(S.energy)} / ${EN_MAX}</b>`}
G.openBoard=function(){if(MS){G.toast('Maak eerst je klus af','bad');return}const b=$s('sdBoard');b.hidden=false;G.pause();renderBoard();clearInterval(b._t);b._t=setInterval(()=>{if(b.hidden)clearInterval(b._t);else renderBoard()},1000)};
function closeBoard(){$s('sdBoard').hidden=true;if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
$s('sdBoard').addEventListener('click',e=>{const t=e.target.closest('button');if(e.target.id==='sdBoard'||(t&&t.dataset.bclose!=null)){closeBoard();return}if(!t)return;
  if(t.dataset.tab){tab=t.dataset.tab;renderBoard();return}
  if(t.dataset.go){const c=CRIMES.find(x=>x.id===t.dataset.go);closeBoard();start(c);return}
  if(t.dataset.skip){const c=CRIMES.find(x=>x.id===t.dataset.skip);closeBoard();if(typeof act!=='undefined'&&act.crime)act.crime(c.id,true);watchOverlay()}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$s('sdBoard').hidden){closeBoard()}});
G.missionsReady=true;
})();
