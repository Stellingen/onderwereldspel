// Pixelstad: straatraces. Vier routes door de stad, te rijden met elke auto (je eigen of een gestolen). Rij naar de startboog,
// druk op E en na het aftellen rijd je de controlepunten af. Brons, zilver en goud: hoe sneller je auto, hoe makkelijker goud.
// Een nieuwe medaille betaalt één keer uit (zwart geld op de schaal van je straatklussen), en elke dag is er startgeld voor je
// eerste rit binnen de bronstijd per route. Het verkeer rijdt gewoon door. De tijd telt in speltijd, dus een traag toestel is
// geen nadeel. Bewaard in S.stadRace = {route:{best, m:medaille 1-3, d:dag van het laatste startgeld}}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const sv=()=>{try{save()}catch(e){}};
const obj=(k,d)=>{try{if(!S[k]||typeof S[k]!=='object')S[k]=d;return S[k]}catch(e){return d}};
const dayN=()=>Math.floor((Date.now()-5*3600e3)/864e5);
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k);
// Alle punten liggen op de middenlijn van een weg (M.VR / M.HR) en de bochten zitten op kruisingen.
// Let op: de wegen x=320 en x=400 lopen niet door het Noorderpark (z 115-160), daar rijdt geen route.
const X=M.XS,Z=M.ZS;
const ROUTES=[
 // rond het Centrum: van Het Plein naar het westen, langs de bank en het casino, de Zuidas af en over de gracht terug
 {id:'centrum',n:'Rondje Centrum',pts:[[435,Z[4]],[X[3],Z[4]],[X[3],Z[2]],[X[7],Z[2]],[X[7],Z[5]],[X[5],Z[5]],[X[5],Z[4]],[435,Z[4]]]},
 // van de Zuidas naar de noordkade, langs de Bajes en het Villapark, door De Haven en over de kade naar de IJ-oever
 {id:'haven',n:'Havensprint',pts:[[X[6],285],[X[6],Z[0]],[X[2],Z[0]],[X[2],Z[1]],[X[7],Z[1]],[X[7],Z[0]],[X[10],Z[0]]]},
 // langs de Boulevard naar de westkust, de hele kust omhoog en dwars door de Westbuurt terug naar de zee
 {id:'kust',n:'Kustrace',pts:[[505,Z[7]],[X[0],Z[7]],[X[0],Z[2]],[X[2],Z[2]],[X[2],Z[6]],[X[4],Z[6]],[X[4],Z[7]],[X[5],Z[7]]]},
 // Oostland rond, de Tuinwijk door en over de brug naar de finish op Het Eiland
 {id:'oost',n:'Grote Prijs van Oostland',pts:[[X[8],275],[X[8],Z[1]],[X[10],Z[1]],[X[10],Z[5]],[X[9],Z[5]],[X[9],Z[7]],[X[8],Z[7]],[X[8],610],[770,610]]}];
// tussenpunten op lange stukken, lengte en richttijden
ROUTES.forEach(r=>{const cp=[];let len=0;for(let i=1;i<r.pts.length;i++){const a=r.pts[i-1],b=r.pts[i],d=Math.hypot(b[0]-a[0],b[1]-a[1]),n=Math.max(1,Math.round(d/95));len+=d;for(let k=1;k<=n;k++)cp.push({x:a[0]+(b[0]-a[0])*k/n,z:a[1]+(b[1]-a[1])*k/n})}
  r.cp=cp;r.len=len;r.par=[len/11.8,len/15,len/18.6];r.sx=r.pts[0][0];r.sz=r.pts[0][1];r.ry=Math.atan2(r.pts[1][0]-r.sx,r.pts[1][1]-r.sz)});
const MED=['','Brons','Zilver','Goud'],MC=['#5a606a','#c98a4a','#c9cfd6','#ffd35a'];
const tm=s=>{s=Math.max(0,s);const m=Math.floor(s/60);return m+':'+(s%60).toFixed(1).padStart(4,'0').replace('.',',')};
const rs=r=>{const Q=obj('stadRace',{});if(!Q[r.id]||typeof Q[r.id]!=='object')Q[r.id]={};return Q[r.id]};
const medal=(r,t)=>t<=r.par[2]?3:t<=r.par[1]?2:t<=r.par[0]?1:0;
/* ---------- HUD en markeringen ---------- */
const hud=document.createElement('div');hud.className='sd-race';hud.id='sdRace';hud.hidden=true;document.body.appendChild(hud);
const big=document.createElement('div');big.className='sd-race-big';big.hidden=true;document.body.appendChild(big);
let beam=null,ring=null,cpSpot=null,RC=null;
function marks(p){if(!beam){beam=new TH.Mesh(new TH.CylinderGeometry(3,3,44,12,1,true),new TH.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.3,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}));beam.renderOrder=4;G.scene().add(beam);
    ring=new TH.Mesh(new TH.RingGeometry(5.6,6.6,24),new TH.MeshBasicMaterial({color:0xff7a1a,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;G.scene().add(ring)}
  beam.visible=ring.visible=!!p;if(p){beam.position.set(p.x,22,p.z);ring.position.set(p.x,.09,p.z)}}
function say(t,ms){big.textContent=t;big.hidden=false;big.style.animationDuration=((ms||900)/1000)+'s';big.classList.remove('go');void big.offsetWidth;big.classList.add('go');clearTimeout(say.t);say.t=setTimeout(()=>{big.hidden=true},ms||900)}
/* ---------- starten, rijden, finish ---------- */
function why(){if(!G.driving)return 'Kom met een auto';if(RC)return 'Je rijdt al';if(G.police&&G.police.active())return 'Schud eerst de politie af';if(G.mission&&G.mission())return 'Maak eerst je klus af';if(typeof inJail==='function'&&inJail())return 'Je zit vast';return ''}
function start(r){const w=why();if(w){G.toast(w,'bad');return}const c=G.car;if(!c)return;c.x=r.sx;c.z=r.sz;c.ry=r.ry;c.v=0;c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;G.yawT=c.ry+Math.PI;G.manualRotT=0;
  RC={r,i:0,t:0,st:'count',ct:3.2,last:3};big.style.color='#fff';G.carFreeze=true;hud.hidden=false;document.body.classList.add('stad-race');marks(r.cp[0]);if(!cpSpot)cpSpot=G.spot({k:'cp',x:0,z:0,n:'',dot:'#ff7a1a',dotR:9999,big:1});cpSpot.x=r.cp[0].x;cpSpot.z=r.cp[0].z;cpSpot.dotIf=()=>!!RC;draw();G.snd&&G.snd.fx('beep');say('3',900)}
function stop(msg){if(!RC)return;RC=null;G.carFreeze=false;hud.hidden=true;document.body.classList.remove('stad-race');marks(null);if(msg)G.toast(msg,'bad')}
function finish(){const r=RC.r,t=Math.round(RC.t*10)/10,Q=rs(r),m=medal(r,t),m0=Q.m||0,d=dayN();stop();G.snd&&G.snd.fx('lvl');G.shake&&G.shake(.4);
  const rec=!Q.best||t<Q.best;if(rec)Q.best=t;let g=0;const got=[];
  if(m>m0){for(let k=m0+1;k<=m;k++){g+=zS([0,1.5,2.5,4][k]);got.push(MED[k]);G.ev&&G.ev(['','brons','zilver','goud'][k])}Q.m=m}
  if(m>=1){G.ev&&G.ev('finish')}
  if(m>=1&&Q.d!==d){Q.d=d;g+=zS(.6);G.ev&&G.ev('race')}
  if(g){S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(4+3*m)}S.stats=S.stats||{};S.stats.races=(S.stats.races||0)+1;sv();
  say(m?MED[m]+'!':'Finish',2200);big.style.color=MC[m]||'#fff';
  G.toast(r.n+': '+tm(t)+(m?' · '+MED[m].toLowerCase():' · geen medaille (brons '+tm(r.par[0])+')')+(rec&&Q.best?' · record':'')+(g?' · +'+fmt(g):''),m?'lvl':'info');
  if(typeof log==='function')log('Straatrace '+r.n+': '+tm(t)+(m?' ('+MED[m].toLowerCase()+')':'')+(g?', '+fmt(g):''),m?'ok':'info');
  if(got.length)G.msg&&G.msg('stad','Nieuwe medaille op '+r.n+': '+got.join(' en ').toLowerCase()+'. '+(m<3?'Voor '+MED[m+1].toLowerCase()+' moet je onder de '+tm(r.par[m])+'.':'Sneller kan bijna niet.'),null,true)}
function draw(){if(!RC)return;const r=RC.r,Q=rs(r),t=RC.t,nx=medal(r,t);hud.innerHTML=`<small>${E(r.n)}</small><b>${tm(t)}</b><span>${RC.i}/${r.cp.length}</span><em style="color:${MC[Math.max(1,nx)]}">${nx?MED[nx]+' tot '+tm(r.par[nx-1]):'Te laat voor brons'}</em>${Q.best?`<i>Record ${tm(Q.best)}</i>`:''}`}
let ht=0;
function step(dt){if(!RC)return;const r=RC.r,c=G.car;
  if(!G.driving||!c){stop('Race afgebroken: je bent uitgestapt');return}if(G.police&&G.police.active()){stop('Race afgebroken: politie');return}
  if(RC.st==='count'){RC.ct-=dt;const n=Math.ceil(RC.ct-.2);if(n!==RC.last&&n>=1&&n<=3){RC.last=n;say(String(n),900);G.snd&&G.snd.fx('beep')}if(RC.ct<=.2){RC.st='go';G.carFreeze=false;say('GO!',900);big.style.color='#3fe395';G.snd&&G.snd.fx('go')}return}
  RC.t+=dt;const p=r.cp[RC.i];if(Math.hypot(c.x-p.x,c.z-p.z)<7.5){RC.i++;G.snd&&G.snd.fx('coin');if(RC.i>=r.cp.length){finish();return}marks(r.cp[RC.i]);cpSpot.x=r.cp[RC.i].x;cpSpot.z=r.cp[RC.i].z}
  if(RC.t>r.par[0]*2.2){stop('Te langzaam. De race is voorbij.');return}
  if(ring){const k=1+Math.sin(performance.now()/160)*.06;ring.scale.set(k,k,k)}ht+=dt;if(ht>.1){ht=0;draw()}}
addEventListener('keydown',e=>{if(RC&&e.key==='Escape'&&!G.paused){stop('Race afgebroken')}});
/* ---------- bord bij de start en Rico ---------- */
function flagPic(cv){cv.width=40;cv.height=24;const c=cv.getContext('2d'),R=(x,y,w,h,f)=>{c.fillStyle=f;c.fillRect(x,y,w,h)};R(0,0,40,24,'#1a1d23');R(0,19,40,5,'#3a3c42');R(5,3,2,18,'#c9cfd6');R(33,3,2,18,'#c9cfd6');for(let y=0;y<2;y++)for(let x=0;x<7;x++)R(7+x*4-(y?0:0),4+y*4,4,4,(x+y)%2?'#111':'#f1efe9');R(14,14,12,5,'#ff7a1a');R(16,12,8,2,'#ff7a1a');R(15,18,3,2,'#111');R(22,18,3,2,'#111')}
function line(r){const Q=rs(r);return `${Math.round(r.len)} meter. Brons ${tm(r.par[0])}, zilver ${tm(r.par[1])}, goud ${tm(r.par[2])}.${Q.best?' Jouw record: '+tm(Q.best)+(Q.m?' ('+MED[Q.m].toLowerCase()+')':'')+'.':''}`}
function board(r){if(G.talking)return;G.talking=true;const w=why();K.dialog({name:r.n,role:'Straatrace',draw:flagPic,lines:[line(r)],col:'#ff7a1a',choices:[
    {t:'Start de race',sub:w?'':'Met de auto waar je in zit',ic:K.ic.vlag,dis:!!w,why:w,f:()=>{K.closeDialog(true);start(r)}},{t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()}],onClose:()=>{G.talking=false}})}
function route(id){const r=ROUTES.find(x=>x.id===id);if(r&&G.setWaypoint)G.setWaypoint(r.sx,r.sz,'Start · '+r.n)}
G.npcService=G.npcService||{};
G.npcService.racer=(n,ch)=>{ROUTES.forEach(r=>{const Q=rs(r);ch.push({t:r.n,sub:(Q.m?MED[Q.m]+' · ':'')+(Q.best?'record '+tm(Q.best):Math.round(r.len)+' m · nog niet gereden'),ic:K.ic.vlag,f:()=>{K.closeDialog(true);route(r.id)}})})};
G.race={ROUTES,start,stop,route,active:()=>!!RC,medals:()=>ROUTES.reduce((a,r)=>a+(rs(r).m||0),0),
  rows:row=>ROUTES.map(r=>{const Q=rs(r);return row(K.ic.vlag,MC[Q.m||0]==='#5a606a'?'#ff7a1a':MC[Q.m],r.n,Q.best?(Q.m?MED[Q.m]+' · ':'')+'record '+tm(Q.best):'Straatrace · '+Math.round(r.len)+' m',{k:'race',id:r.id},Q.m?MED[Q.m]:'')}).join(''),_t:{rs,medal,rc:()=>RC}};
/* ---------- opstarten ---------- */
const wait=setInterval(()=>{if(!G.ready||!G.spot||!G.addFixed)return;clearInterval(wait);
  ROUTES.forEach((r,i)=>{try{// startboog over de weg
      // palen net buiten het wegdek (halve wegbreedte M.RW), de streep over de hele breedte
      const px=Math.cos(r.ry),pz=-Math.sin(r.ry),po=M.RW+.7,B=[[.4,3,.4,-po,1.5,0,'#2a2c30'],[.4,3,.4,po,1.5,0,'#2a2c30'],[.7,.5,.7,-po,3.2,0,'#ff7a1a',1],[.7,.5,.7,po,3.2,0,'#ff7a1a',1],[1.3,.8,.1,-po,2.3,.26,'#f1efe9'],[1.3,.8,.1,po,2.3,.26,'#f1efe9']];
      // geblokte startstreep op het wegdek
      const nq=Math.round(2*M.RW/.8);for(let k=0;k<nq;k++)for(let j=0;j<2;j++)B.push([.8,.03,.8,-M.RW+.4+k*.8,.03,-.4+j*.8,(k+j)%2?'#111214':'#f1efe9']);
      const m=K.model(B,{noShadow:1});m.position.set(r.sx,0,r.sz);m.rotation.y=r.ry;G.scene().add(m);
      G.spot({k:'race',id:r.id,x:r.sx,z:r.sz,r:8,drive:1,driveOnly:1,prio:1,n:'Start race',sub:r.n,col:'#ff7a1a',h:3,ring:8,show:()=>!RC,act:()=>start(r),dot:'#ff7a1a',dotR:140,dotIf:()=>!RC,map:{n:'Straatrace · '+r.n,ic:K.ic.vlag,c:'#ff7a1a',pri:2}});
      const q=M.nearestWalk(r.sx+px*(M.RW+M.SW/2+.6),r.sz+pz*(M.RW+M.SW/2+.6),4);if(q)G.spot({k:'raceb',x:q.x,z:q.z,r:2.6,n:'Straatrace',sub:r.n,col:'#ff7a1a',h:2.2,show:()=>!RC,act:()=>board(r)});
      if(i===0&&q)G.addFixed('racer',q.x+1.6,q.z,Math.PI)}catch(e){console.error(e)}});
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},270);
})();
