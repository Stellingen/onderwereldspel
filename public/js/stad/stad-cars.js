// Pixelstad: auto's. Verkeer dat rechts rijdt en op kruisingen afslaat, politieauto's op patrouille die achter je aan gaan als
// je gezocht wordt (zelfde politiecontrole als het klikspel: policeRaid), en je eigen auto uit je garage (S.cars) om in te rijden.
(function(){
'use strict';
const TH=window.THREE,M=STAD_MAP,X=STAD_GFX,G=STAD,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches,LANE=2,RW=M.RW;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
/* ---------- auto's van blokjes ---------- */
const KINDS={city:[3.5,1.7,.62,.62,1.2,.9],hatch:[3.9,1.8,.66,.62,1.5,.6],sedan:[4.5,1.85,.62,.6,1.4,1.1],suv:[4.6,2,.9,.72,1.0,.7],sport:[4.4,1.95,.5,.46,1.6,1.2],van:[5,2,.9,1.0,.4,.3],pickup:[5,2,.8,.7,.9,2.0]};
function kindOf(b){b=b||'';if(/^city/.test(b))return 'city';if(/hatch|hot/.test(b))return 'hatch';if(/suv|cross|offroad/.test(b))return 'suv';if(/sport|super|hyper|gt|coupe|muscle/.test(b))return 'sport';if(/van|limo/.test(b))return /limo/.test(b)?'sedan':'van';if(/pickup/.test(b))return 'pickup';return 'sedan'}
const meshCache={};
function carMesh(col,kind,police){const key=col+kind+(police?'p':'');let geo=meshCache[key];
  if(!geo){const k=KINDS[kind]||KINDS.sedan,[L,W,bh,ch,cf,cr]=k,gb=new X.GB(),sw=X.swatch,y0=.32;
    gb.box(-W/2,y0,-L/2,W/2,y0+bh,L/2,sw(col),{top:sw(col)});
    gb.box(-W/2+.12,y0+bh,-L/2+cr,W/2-.12,y0+bh+ch,L/2-cf,sw('#24323f','#000000'),{top:sw(col)});
    if(kind==='pickup')gb.box(-W/2+.1,y0+bh,-L/2+.2,W/2-.1,y0+bh+.25,-L/2+cr-.1,sw('#2a2c30'));
    if(police){gb.box(-W/2-.01,y0+.12,-L/2+.6,W/2+.01,y0+.38,L/2-.6,sw('#1f4ea8'))}
    [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([sx,sz])=>gb.box(sx*W/2-(sx>0?.22:-.02)-.1,0,sz*(L/2-.75)-.35,sx*W/2+(sx>0?.02:.22)-.1+(sx>0?.1:0),.64,sz*(L/2-.75)+.35,sw('#16171a')));
    gb.box(-W/2+.15,y0+.2,L/2-.02,-W/2+.55,y0+.42,L/2+.04,sw('#fff3c8','#fff3c8'));gb.box(W/2-.55,y0+.2,L/2-.02,W/2-.15,y0+.42,L/2+.04,sw('#fff3c8','#fff3c8'));
    gb.box(-W/2+.15,y0+.22,-L/2-.04,-W/2+.5,y0+.42,-L/2+.02,sw('#b0221e','#ff3a2a'));gb.box(W/2-.5,y0+.22,-L/2-.04,W/2-.15,y0+.42,-L/2+.02,sw('#b0221e','#ff3a2a'));
    geo=meshCache[key]=gb.mesh(G.city.material).geometry}
  const m=new TH.Mesh(geo,G.city.material);m.castShadow=true;
  if(police){const bar=new TH.Group(),k=KINDS[kind]||KINDS.sedan,y=.32+k[2]+k[3]+.05;
    const r=new TH.Mesh(new TH.BoxGeometry(.5,.18,.3),new TH.MeshBasicMaterial({color:0xff2a2a})),b=new TH.Mesh(new TH.BoxGeometry(.5,.18,.3),new TH.MeshBasicMaterial({color:0x2a6aff}));
    r.position.set(-.28,y,0);b.position.set(.28,y,0);bar.add(r,b);m.add(bar);m.userData.bar=[r,b]}
  return m}
/* ---------- verkeer ---------- */
const N=M.NET,TRAF=[];G.traffic=TRAF;
const dirOf=(a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;return {x:dx/l,z:dz/l}};
const off=d=>({x:-d.z*LANE,z:d.x*LANE});
const pOut=(n,d)=>{const o=off(d);return {x:n.x+d.x*(RW+.6)+o.x,z:n.z+d.z*(RW+.6)+o.z}};
const pIn=(n,d)=>{const o=off(d);return {x:n.x-d.x*(RW+.6)+o.x,z:n.z-d.z*(RW+.6)+o.z}};
const CC=['#c23b2e','#2f5d9a','#e8e4da','#2a2c30','#d7a530','#3f7a4a','#7a3c8a','#8a929c','#1d1d1f'];
function spawnCar(police,near){let A,B;for(let k=0;k<60;k++){A=pick(N);B=pick(A.n);const mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,d=Math.hypot(mx-G.P.x,mz-G.P.z);if(!near||(d>45&&d<150))break}
  const c={police,A,B,d:dirOf(A,B),t:Math.random(),v:0,max:police?12:rr(8,12),mesh:carMesh(police?'#eef0f2':pick(CC),police?'sedan':pick(['city','hatch','sedan','suv','van']),police),mode:'edge'};
  G.scene().add(c.mesh);TRAF.push(c);place(c);return c}
function edgePts(c){return [pOut(c.A,c.d),pIn(c.B,c.d)]}
function place(c){let x,z,ry;if(c.mode==='edge'){const [a,b]=edgePts(c);x=a.x+(b.x-a.x)*c.t;z=a.z+(b.z-a.z)*c.t;ry=Math.atan2(c.d.x,c.d.z)}
  else{const t=c.t,u=1-t,P0=c.cv[0],P1=c.cv[1],P2=c.cv[2];x=u*u*P0.x+2*u*t*P1.x+t*t*P2.x;z=u*u*P0.z+2*u*t*P1.z+t*t*P2.z;const dx=2*u*(P1.x-P0.x)+2*t*(P2.x-P1.x),dz=2*u*(P1.z-P0.z)+2*t*(P2.z-P1.z);ry=Math.atan2(dx,dz)}
  c.x=x;c.z=z;c.ry=ry;c.mesh.position.set(x,0,z);c.mesh.rotation.y=ry}
function startTurn(c){const B=c.B,opts=B.n.filter(n=>n!==c.A),C=opts.length?pick(opts):c.A,d2=dirOf(B,C),P0=pIn(B,c.d),P2=pOut(B,d2);
  const P1=Math.abs(c.d.x*d2.x+c.d.z*d2.z)>.9?{x:(P0.x+P2.x)/2,z:(P0.z+P2.z)/2}:(Math.abs(c.d.x)<.5?{x:P0.x,z:P2.z}:{x:P2.x,z:P0.z});
  c.mode='turn';c.cv=[P0,P1,P2];c.len=Math.hypot(P1.x-P0.x,P1.z-P0.z)+Math.hypot(P2.x-P1.x,P2.z-P1.z);c.t=0;c.node=B;c.next={A:B,B:C,d:d2}}
function busy(node,self){return TRAF.some(o=>o!==self&&o.mode==='turn'&&o.node===node)}
function blockedAhead(c){const fx=Math.sin(c.ry),fz=Math.cos(c.ry);const chk=(x,z,r)=>{const dx=x-c.x,dz=z-c.z,ahead=dx*fx+dz*fz,side=Math.abs(dx*fz-dz*fx);return ahead>0&&ahead<r&&side<1.6};
  if(!G.driving&&chk(G.P.x,G.P.z,5.5))return true;if(G.driving&&G.car&&chk(G.car.x,G.car.z,7))return true;return TRAF.some(o=>o!==c&&chk(o.x,o.z,6.5))}
function trafficStep(c,dt){if(c.chase)return G.policeCarStep?G.policeCarStep(c,dt):chaseStep(c,dt);
  const stop=blockedAhead(c);c.v+=((stop?0:c.max)-c.v)*Math.min(1,dt*(stop?6:1.5));
  if(c.mode==='edge'){const [a,b]=edgePts(c),L=Math.hypot(b.x-a.x,b.z-a.z)||1;c.t+=c.v*dt/L;
    if(c.t>=1){if(busy(c.B,c)){c.t=1;c.v=0}else startTurn(c)}}
  else{c.t+=c.v*dt/Math.max(1,c.len);if(c.t>=1){c.A=c.next.A;c.B=c.next.B;c.d=c.next.d;c.mode='edge';c.t=0}}
  place(c);
  if(Math.hypot(c.x-G.P.x,c.z-G.P.z)>190){G.scene().remove(c.mesh);TRAF.splice(TRAF.indexOf(c),1);spawnCar(c.police,true)}}
/* ---------- politie ---------- */
let lostT=0,cool=0;
function drivable(x,z){return M.walkable(x,z)}
function chaseStep(c,dt){const P=G.driving&&G.car?G.car:G.P,d=Math.hypot(P.x-c.x,P.z-c.z);c.pt=(c.pt||0)-dt;
  if(c.pt<=0||!c.path||!c.path.length){c.pt=1;c.path=M.findPath(c.x,c.z,P.x,P.z)||[{x:P.x,z:P.z}]}
  const w=d<14?{x:P.x,z:P.z}:c.path[0];if(!w)return;const dx=w.x-c.x,dz=w.z-c.z,wd=Math.hypot(dx,dz);if(wd<2&&c.path.length)c.path.shift();
  const want=Math.atan2(dx,dz);let r=want-c.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;c.ry+=Math.max(-2.6*dt,Math.min(2.6*dt,r));
  const tv=d<6?Math.max(0,d-3):17;c.v+=(tv-c.v)*Math.min(1,dt*2);const nx=c.x+Math.sin(c.ry)*c.v*dt,nz=c.z+Math.cos(c.ry)*c.v*dt;
  if(drivable(nx,nz)&&drivable(nx+Math.sin(c.ry)*1.8,nz+Math.cos(c.ry)*1.8)){c.x=nx;c.z=nz}else{c.v*=-.3;c.pt=0}
  c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;
  // agent stapt uit als je te voet dichtbij bent; met de auto: blijf je stilstaan naast een politieauto, dan ben je gepakt
  if(!G.driving&&d<9&&!c.cop){c.cop=footCop(c.x+2,c.z)}
  if(G.driving&&G.car&&d<4.5&&Math.abs(G.car.v)<3){c.hold=(c.hold||0)+dt;if(c.hold>1.6)caught()}else c.hold=0}
const COPS=[];
function footCop(x,z){const p=M.nearestWalk(x,z,6)||{x,z};const a={kind:'cop',x:p.x,z:p.z,ry:0,ph:0,sp:0,look:{skin:pick(['#e9b98f','#d9a27a','#b97a52','#8d5a3a']),hair:'#2a1d14',top:'#1d2a4a',arm:'#1d2a4a',pants:'#151c30',shoe:'#0e0f12',hat:'cap',hatC:'#1d2a4a'},pt:0,path:null};G.actors.push(a);COPS.push(a);return a}
function copStep(a,dt){const P=G.P,d=Math.hypot(P.x-a.x,P.z-a.z);a.pt-=dt;
  let tx=P.x,tz=P.z;if(d>5){if(a.pt<=0||!a.path||!a.path.length){a.pt=1;a.path=M.findPath(a.x,a.z,P.x,P.z)||[{x:P.x,z:P.z}]}const w=a.path[0];if(w){tx=w.x;tz=w.z;if(Math.hypot(w.x-a.x,w.z-a.z)<.6)a.path.shift()}}
  const dx=tx-a.x,dz=tz-a.z,l=Math.hypot(dx,dz)||1,sp=7,nx=a.x+dx/l*sp*dt,nz=a.z+dz/l*sp*dt;if(M.canStand(nx,a.z,.3))a.x=nx;if(M.canStand(a.x,nz,.3))a.z=nz;
  a.ry=Math.atan2(dx,dz);a.ph+=dt*sp*1.2;a.sp=1.3;if(d<1.15&&!G.driving)caught()}
function chasers(){return TRAF.filter(c=>c.chase)}
function caught(){if(G._caught)return;G._caught=1;setTimeout(()=>{G._caught=0},3000);
  const mis=G.mission&&G.mission();if(mis&&G.missionAbortCaught){G.missionAbortCaught();endChase(true);return}
  if(G.driving)exitCar(true);endChase(true);if(typeof policeRaid==='function')policeRaid()}
function endChase(silent){TRAF.forEach(c=>{if(c.chase){c.chase=false;c.cop=null;G.scene().remove(c.mesh);TRAF.splice(TRAF.indexOf(c),1)}});COPS.splice(0).forEach(a=>{const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1)});
  for(let i=TRAF.filter(c=>c.police).length;i<2;i++)spawnCar(true,true);cool=silent?45:30;lostT=0;hud()}
// gezocht (of alarm tijdens een missie): politie komt eraan
function wantedLevel(){const w=S.wanted;if(!w)return 0;return typeof w==='object'?(w.lv||1):1}
function policeTick(dt){if(cool>0)cool-=dt;if(!G.police||G.police.active()||cool>0)return;
  // gezocht (klikspel): ziet een patrouillewagen je, dan begint de achtervolging (stad-police.js)
  if(wantedLevel()>0&&!(G.mission&&G.mission())&&!G.hidden){const pol=TRAF.find(c=>c.police&&!c.chase&&Math.hypot(c.x-G.P.x,c.z-G.P.z)<26&&G.los&&G.los(c,G.P));
    if(pol){G.police.start({stars:Math.min(3,wantedLevel()),why:'gezocht',wanted:1,car:pol});G.toast&&G.toast('Een politieauto herkent je!','bad');cool=20}}}
G.traf={spawn:(pol,near)=>spawnCar(pol,near),remove:c=>{G.scene().remove(c.mesh);const i=TRAF.indexOf(c);if(i>=0)TRAF.splice(i,1);if(c.police&&TRAF.filter(o=>o.police&&!o.chase).length<3)spawnCar(true,true)},carMesh,list:TRAF};
/* ---------- je eigen auto ---------- */
function myCars(){try{return (S.cars||[]).map((c,i)=>({c,i})).filter(o=>o.c&&o.c.id)}catch(e){return[]}}
function bestCar(){const L=myCars();if(!L.length)return null;let pref=-1;try{pref=+localStorage.getItem('stad_carIdx')}catch(e){}const f=L.find(o=>o.i===pref);if(f)return f;return L.slice().sort((a,b)=>(b.c.v||0)-(a.c.v||0))[0]}
function myCarObj(){const o=bestCar();if(!o)return null;let m=null;try{m=GAME_MODELS().find(x=>x.id===o.c.id)}catch(e){}
  const tier=m?(m.leg?6:m.d||1):1,kind=kindOf(o.c.b||(m&&m.b));return {o,tier,kind,col:/^#/.test(o.c.c||'')?o.c.c:'#8a929c',name:o.c.n||(m&&m.n)||'Auto',max:16+tier*3.4}}
// automodellen van het klikspel (data.js heeft een globale CARS); hier heet ons verkeer TRAF
const GAME_MODELS=new Function('return typeof CARS!=="undefined"?CARS:[]');
let mine=null;
function spawnMine(x,z,ry){const d=myCarObj();if(!d){mine=null;return}if(mine)G.scene().remove(mine.mesh);
  mine={d,x,z,ry:ry||0,v:0,mesh:carMesh(d.col,d.kind,false)};G.scene().add(mine.mesh);mine.mesh.position.set(x,0,z);mine.mesh.rotation.y=mine.ry;G.car=mine;savePos()}
function savePos(){if(!mine)return;try{localStorage.setItem('stad_carpos',JSON.stringify({x:+mine.x.toFixed(1),z:+mine.z.toFixed(1),ry:+mine.ry.toFixed(2),id:mine.d.o.c.id}))}catch(e){}}
function roadNear(x,z){let best=null,bd=1e9;N.forEach(A=>A.n.forEach(B=>{const d=dirOf(A,B),[a,b]=[pOut(A,d),pIn(B,d)];const vx=b.x-a.x,vz=b.z-a.z,L2=vx*vx+vz*vz||1;let t=((x-a.x)*vx+(z-a.z)*vz)/L2;t=Math.max(0,Math.min(1,t));const px=a.x+vx*t,pz=a.z+vz*t,dd=Math.hypot(px-x,pz-z);if(dd<bd){bd=dd;best={x:px,z:pz,ry:Math.atan2(d.x,d.z)}}}));return best}
G.bringCar=function(){const d=myCarObj();if(!d){G.toast&&G.toast("Je hebt nog geen auto. Steel er een via Auto's.",'bad');return}const r=roadNear(G.P.x,G.P.z);if(!r)return;spawnMine(r.x,r.z,r.ry);G.toast&&G.toast('Je '+d.name+' staat op je te wachten','ok')};
function enterCar(){if(!mine||G.driving)return;G.snd&&G.snd.fx('carDoor');if(G.hidden&&G.unhide)G.unhide();if(G.mission&&G.mission()&&['hold','lift','beg'].includes((G.mission().steps[G.mission().i]||{}).t)&&false)return;G.driving=true;G.stopPath&&G.stopPath();G.distT=Math.max(G.distT,56);hud()}
function exitCar(quiet){if(!G.driving||!mine)return;G.driving=false;const s=Math.cos(mine.ry),c=-Math.sin(mine.ry);const p=M.nearestWalk(mine.x+s*2.2,mine.z+c*2.2,6)||M.nearestWalk(mine.x,mine.z,8);if(p){G.P.x=p.x;G.P.z=p.z}G.P.vx=G.P.vz=0;mine.v=0;G.distT=46;savePos();hud()}
G.exitCar=exitCar;
function driveStep(dt){const K=G.K,c=mine;let thr=0,steer=0;
  if(G.joy.on){// stick: de auto draait naar de richting van de stick (ten opzichte van de camera) en geeft gas
    const jx=G.joy.x,jy=G.joy.y,mag=Math.min(1,Math.hypot(jx,jy));if(mag>.2){const fx=-Math.sin(G.yaw),fz=-Math.cos(G.yaw),rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw),wx=rx*jx+fx*jy,wz=rz*jx+fz*jy,want=Math.atan2(wx,wz);
      let r=want-c.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;if(Math.abs(r)>2.2&&Math.abs(c.v)<4){thr=-mag;steer=r>0?-1:1}else{steer=Math.max(-1,Math.min(1,r*1.6));thr=mag}}}
  else{thr=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0);steer=(K.a||K.arrowleft?1:0)-(K.d||K.arrowright?1:0)}
  const max=c.d.max*(K.shift?1.12:1);
  if(thr>0)c.v+=(c.v<0?18:9)*thr*dt;else if(thr<0)c.v+=(c.v>0?-18:-7)*(-thr)*dt;else c.v*=Math.pow(.35,dt);
  c.v=Math.max(-7,Math.min(max,c.v));
  const turn=steer*Math.min(1,Math.abs(c.v)/5)*(2.1-Math.min(1,Math.abs(c.v)/max)*.8)*Math.sign(c.v||1);c.ry+=turn*dt;
  const fx=Math.sin(c.ry),fz=Math.cos(c.ry),nx=c.x+fx*c.v*dt,nz=c.z+fz*c.v*dt,L=2.1;
  const ok=(x,z)=>drivable(x+fx*L,z+fz*L)&&drivable(x-fx*L,z-fz*L)&&drivable(x+fz*.9,z-fx*.9)&&drivable(x-fz*.9,z+fx*.9);
  if(ok(nx,nz)){c.x=nx;c.z=nz}else if(ok(nx,c.z)){c.x=nx;c.v*=.7}else if(ok(c.x,nz)){c.z=nz;c.v*=.7}else c.v*=-.3;
  TRAF.forEach(o=>{const dx=c.x-o.x,dz=c.z-o.z,d=Math.hypot(dx,dz);if(d<3.2&&d>.01){c.x+=dx/d*(3.2-d)*.5;c.z+=dz/d*(3.2-d)*.5;c.v*=.6}});
  c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;G.P.x=c.x;G.P.z=c.z;G.P.vx=fx*c.v;G.P.vz=fz*c.v;G.P.ry=c.ry;
  // camera achter de auto, tenzij je zelf net hebt gedraaid
  if(Math.abs(c.v)>3&&performance.now()-(G.manualRotT||0)>1500){let want=c.ry+Math.PI-G.yawT;while(want>Math.PI)want-=Math.PI*2;while(want<-Math.PI)want+=Math.PI*2;G.yawT+=want*Math.min(1,dt*1.6)}}
G.carStep=function(dt){if(!TRAF.length)for(let i=0;i<26;i++)spawnCar(i<3,false);
  TRAF.slice().forEach(c=>trafficStep(c,dt));policeTick(dt);
  // zwaailichten
  const fl=Math.floor(performance.now()/180)%2;TRAF.forEach(c=>{const b=c.mesh.userData.bar;if(b){const on=c.chase||G.night>.5;b[0].visible=on?fl===0:true;b[1].visible=on?fl===1:true}});
  if(G.driving&&mine)driveStep(dt);
  // instappen
  const nearMine=mine&&!G.driving&&Math.hypot(G.P.x-mine.x,G.P.z-mine.z)<3.4;if(nearMine!==G.nearCar){G.nearCar=nearMine;hud()}
  if(G.driving&&mine)$s('sdSpdV').textContent=Math.round(Math.abs(mine.v)*3.6);
  if(G.snd)G.snd.engine(G.driving&&mine?mine.v:null);
  hudT+=dt;if(hudT>.5){hudT=0;hudPol()}};
let hudT=0;
/* ---------- knoppen en snelheidsmeter ---------- */
const ui=document.createElement('div');ui.id='sdCarUi';document.body.appendChild(ui);
ui.innerHTML=`<button class="sd-carp" id="sdCarP" hidden></button><div class="sd-spd" id="sdSpd" hidden><b id="sdSpdV">0</b><small>km/u</small><span id="sdSpdN"></span><button id="sdOutCar">${touch?'Uitstappen':'<kbd>F</kbd> Uitstappen'}</button></div><div class="sd-pol" id="sdPol" hidden>Politie zit achter je</div>`;
function hud(){const p=$s('sdCarP');p.hidden=!G.nearCar||G.driving;if(!p.hidden)p.innerHTML=(touch?'':'<kbd>F</kbd> ')+'Instappen · <b>'+(mine?mine.d.name:'')+'</b>';
  $s('sdSpd').hidden=!G.driving;if(G.driving&&mine)$s('sdSpdN').textContent=mine.d.name;document.body.classList.toggle('stad-drive',!!G.driving)}
function hudPol(){$s('sdPol').hidden=true}
$s('sdCarP').onclick=enterCar;$s('sdOutCar').onclick=()=>exitCar();
addEventListener('keydown',e=>{if(G.paused||e.repeat)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(e.key.toLowerCase()==='f'){if(!G.driving&&G.missionAction&&G.missionAction())return;if(G.driving){exitCar();e.stopImmediatePropagation()}else if(G.nearCar&&!(G.near)){enterCar();e.stopImmediatePropagation()}}},true);
// opstarten: je auto staat waar je hem liet, anders bij het plein
G.carsInit=function(){let s=null;try{s=JSON.parse(localStorage.getItem('stad_carpos')||'null')}catch(e){}
  const d=myCarObj();if(!d)return;if(s&&s.id===d.o.c.id&&M.walkable(s.x,s.z))spawnMine(s.x,s.z,s.ry);else{const r=roadNear(G.P.x,G.P.z-6);if(r)spawnMine(r.x,r.z,r.ry)}};
G.missionCarsHook=true;
})();
