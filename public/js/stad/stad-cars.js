// Pixelstad: auto's. Verkeer dat rechts rijdt en op kruisingen afslaat, politieauto's op patrouille die achter je aan gaan als
// je gezocht wordt (zelfde politiecontrole als het klikspel: policeRaid), en je eigen auto uit je garage (S.cars) om in te rijden.
(function(){
'use strict';
const TH=window.THREE,M=STAD_MAP,X=STAD_GFX,G=STAD,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches,LANE=M.LANE||2,RW=M.RW;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
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
  // gewone auto's krijgen een echt model uit het spel (stad-autos.js), zodat je ziet wat je kunt carjacken
  const md=!police&&G.trafModel?G.trafModel(A):null,kd=police?'sedan':md?kindOf(md.m.b):pick(['city','hatch','sedan','suv','van']);
  const c={police,A,B,d:dirOf(A,B),t:Math.random(),v:0,max:police?12:rr(8,12),kind:kd,mesh:carMesh(police?'#eef0f2':md?md.x.c:pick(CC),kd,police),mode:'edge',md};
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
function trafficStep(c,dt){if(c.block)return;if(c.chase)return G.policeCarStep?G.policeCarStep(c,dt):chaseStep(c,dt);
  if(c.hold){c.v=0;place(c);return}
  // aangereden: de bestuurder staat even stil (en schudt nog na)
  if(c.bumpT>0){c.bumpT-=dt;c.v=0;place(c);c.mesh.rotation.z=Math.sin(c.bumpT*28)*.03*Math.min(1,c.bumpT);if(c.bumpT<=0)c.mesh.rotation.z=0;return}
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
  if(G.driving&&G.car&&d<4.5&&Math.abs(G.car.v)<3){c.hold=(c.hold||0)+dt*(DZ.on?.5:1);if(c.hold>1.6)caught()}else c.hold=0}
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
  if(wantedLevel()>0&&!(G.mission&&G.mission())&&!G.hidden){const pol=TRAF.find(c=>c.police&&!c.chase&&!c.block&&Math.hypot(c.x-G.P.x,c.z-G.P.z)<26&&G.los&&G.los(c,G.P));
    if(pol){G.police.start({stars:Math.min(3,wantedLevel()),why:'gezocht',wanted:1,car:pol});G.toast&&G.toast('Een politieauto herkent je!','bad');cool=20;return}}
  // een gestolen auto zonder papieren valt op: hoe heter (alarm, carjacking, kleur), hoe sneller een patrouille hem herkent
  const st=G.driving&&mine&&mine.stolen;if(st&&!st.papers&&!(G.mission&&G.mission())&&(st.heat||0)>12){
    const pol=TRAF.find(c=>c.police&&!c.chase&&!c.block&&Math.hypot(c.x-mine.x,c.z-mine.z)<24&&G.los&&G.los(c,G.P));
    if(pol&&Math.random()<dt*st.heat/100*.9){G.police.start({stars:1,why:'gestolen auto',car:pol});G.toast&&G.toast('De politie herkent de gestolen '+mine.d.name+'!','bad');cool=25}}}
G.traf={spawn:(pol,near)=>spawnCar(pol,near),remove:c=>{G.scene().remove(c.mesh);const i=TRAF.indexOf(c);if(i>=0)TRAF.splice(i,1);if(c.police&&TRAF.filter(o=>o.police&&!o.chase).length<3)spawnCar(true,true)},carMesh,list:TRAF};
/* ---------- je eigen auto ---------- */
function myCars(){try{return (S.cars||[]).map((c,i)=>({c,i})).filter(o=>o.c&&o.c.id)}catch(e){return[]}}
function bestCar(){const L=myCars();if(!L.length)return null;let pref=-1;try{pref=+localStorage.getItem('stad_carIdx')}catch(e){}const f=L.find(o=>o.i===pref);if(f)return f;return L.slice().sort((a,b)=>(b.c.v||0)-(a.c.v||0))[0]}
function myCarObj(){const o=bestCar();if(!o)return null;let m=null;try{m=GAME_MODELS().find(x=>x.id===o.c.id)}catch(e){}
  const tier=m?(m.leg?6:m.d||1):1,kind=kindOf(o.c.b||(m&&m.b));return {o,tier,kind,col:/^#/.test(o.c.c||'')?o.c.c:'#8a929c',name:o.c.n||(m&&m.n)||'Auto',max:16+tier*3.4}}
// automodellen van het klikspel (data.js heeft een globale CARS); hier heet ons verkeer TRAF
const GAME_MODELS=new Function('return typeof CARS!=="undefined"?CARS:[]');
// Voertuigen waar je in kunt: je eigen auto (uit S.cars) en auto's die je in de Pixelstad steelt of carjackt (stad-autos.js).
// mine = de auto waar je nu in zit (of het laatst in zat); own = je eigen auto.
const VEH=[];G.vehicles=VEH;let mine=null,own=null;
function spawnMine(x,z,ry){const d=myCarObj();if(!d)return;if(own){G.scene().remove(own.mesh);const i=VEH.indexOf(own);if(i>=0)VEH.splice(i,1)}
  own={d,x,z,ry:ry||0,v:0,mesh:carMesh(d.col,d.kind,false),own:1,dmg:Math.max(0,Math.min(100,+d.o.c.dmg||0))};own.dead=own.dmg>=100;G.scene().add(own.mesh);own.mesh.position.set(x,0,z);own.mesh.rotation.y=own.ry;VEH.push(own);look(own);if(!G.driving){mine=own;G.car=own}savePos()}
function savePos(){if(!own)return;try{localStorage.setItem('stad_carpos',JSON.stringify({x:+own.x.toFixed(1),z:+own.z.toFixed(1),ry:+own.ry.toFixed(2),id:own.d.o.c.id}))}catch(e){}}
function roadNear(x,z){let best=null,bd=1e9;N.forEach(A=>A.n.forEach(B=>{const d=dirOf(A,B),[a,b]=[pOut(A,d),pIn(B,d)];const vx=b.x-a.x,vz=b.z-a.z,L2=vx*vx+vz*vz||1;let t=((x-a.x)*vx+(z-a.z)*vz)/L2;t=Math.max(0,Math.min(1,t));const px=a.x+vx*t,pz=a.z+vz*t,dd=Math.hypot(px-x,pz-z);if(dd<bd){bd=dd;best={x:px,z:pz,ry:Math.atan2(d.x,d.z)}}}));return best}
G.roadNear=roadNear;
G.bringCar=function(idx){if(idx!=null)try{localStorage.setItem('stad_carIdx',idx)}catch(e){}const d=myCarObj();if(!d){G.toast&&G.toast("Je hebt nog geen auto. Steel er een op straat of via Auto's.",'bad');return}
  if((+d.o.c.dmg||0)>=100){G.toast&&G.toast('Je '+d.name+' is total loss. Laat hem eerst maken bij Garage Van der Plaat.','bad');return}if(G.driving&&mine===own)exitCar(true);const r=roadNear(G.P.x,G.P.z);if(!r)return;spawnMine(r.x,r.z,r.ry);G.toast&&G.toast('Je '+d.name+' staat op je te wachten','ok')};
// een ander voertuig (gestolen, gecarjackt) toevoegen; hooguit 3 achtergelaten gestolen auto's, de oudste wordt weggesleept
G.addVehicle=function(v){VEH.push(v);const st=VEH.filter(o=>!o.own&&o!==mine&&o!==v);if(st.length>3){const o=st[0];G.scene().remove(o.mesh);VEH.splice(VEH.indexOf(o),1)}return v};
G.removeVehicle=function(v){if(!v)return;if(G.driving&&mine===v)exitCar(true);G.scene().remove(v.mesh);const i=VEH.indexOf(v);if(i>=0)VEH.splice(i,1);if(mine===v){mine=own;G.car=own}if(own===v)own=null;G.onRemoveVehicle&&G.onRemoveVehicle(v)};
function enterCar(v){v=v||G.nearCar;if(!v||G.driving)return;if(v.dead){G.toast&&G.toast('Total loss. Die rijdt nergens meer heen.','bad');return}mine=v;G.car=v;G.snd&&G.snd.fx('carDoor');if(G.hidden&&G.unhide)G.unhide();G.driving=true;G.stopPath&&G.stopPath();G.distT=Math.max(G.distT,56);v.safe=null;v.stk=0;v.bad=0;hud();G.onEnterCar&&G.onEnterCar(v)}
G.enterCar=enterCar;
function exitCar(quiet){if(!G.driving||!mine)return;if(DZ.on&&!quiet){G.toast&&G.toast('Je zit nog even versuft…','info');return}G.driving=false;if(quiet)dazeEnd(true);const s=Math.cos(mine.ry),c=-Math.sin(mine.ry);const p=M.nearestWalk(mine.x+s*2.2,mine.z+c*2.2,6)||M.nearestWalk(mine.x,mine.z,8);if(p){G.P.x=p.x;G.P.z=p.z}G.P.vx=G.P.vz=0;mine.v=0;mine.kx=mine.kz=mine.spin=0;G.distT=46;savePos();hud();G.onExitCar&&G.onExitCar(mine)
  // je eigen auto die total loss is: Van der Plaat sleept hem weg naar de garage
  if(mine.dead&&mine===own){const v=mine;setTimeout(()=>{if(!(G.driving&&mine===v)){G.removeVehicle(v);G.toast&&G.toast('Van der Plaat heeft je '+v.d.name+' weggesleept. Maken kan in de garage.','info')}},2500)}}
G.exitCar=exitCar;
/* ---------- botsen ----------
 De auto is een rechthoek (lengte en breedte van het model). Elke frame: eerst andere auto's (verkeer, politie, geparkeerd), dan de
 stad: punten van de auto die in een muur, paal of gebouw staan en hoeken van vaste tegels die in de auto steken, duwen hem eruit
 (langs de kortste vrije kant). De snelheid richting het obstakel gaat eraf; wat overblijft glijdt langs de muur. Lukt het niet om
 vrij te komen, dan terug naar de laatste vrije plek; zit je meer dan een seconde echt klem, dan zet hij je op de dichtstbijzijnde weg. */
const DIMS=k=>{const d=KINDS[k]||KINDS.sedan;return [d[0]/2,d[1]/2]};
function dimsOf(v){if(!v._hl){const [a,b]=DIMS(v.kind||(v.d&&v.d.kind)||'sedan');v._hl=a;v._hw=b}return [v._hl,v._hw]}
const SMP={};
function smp(hl,hw){const k=hl+','+hw;if(SMP[k])return SMP[k];const S=[],nl=Math.ceil(2*hl/.8),nw=Math.ceil(2*hw/.8);
  for(let i=0;i<=nl;i++){const a=-hl+2*hl*i/nl;S.push([a,-hw],[a,hw]);if(i>0&&i<nl)S.push([a,0])}
  for(let j=1;j<nw;j++){const b=-hw+2*hw*j/nw;S.push([hl,b],[-hl,b])}return SMP[k]=S}
const solidT=(tx,tz)=>!M.walkable(tx+.5,tz+.5),EPS=.02;
function pen(x,z,ry,hl,hw){const fx=Math.sin(ry),fz=Math.cos(ry),rx=fz,rz=-fx;let xp=0,xn=0,zp=0,zn=0,hit=0,deep=0;
  const add=(dx,dz)=>{hit++;if(dx>xp)xp=dx;if(dx<xn)xn=dx;if(dz>zp)zp=dz;if(dz<zn)zn=dz};
  for(const [a,b] of smp(hl,hw)){const px=x+fx*a+rx*b,pz=z+fz*a+rz*b,tx=Math.floor(px),tz=Math.floor(pz);if(!solidT(tx,tz))continue;let best=9,bx=0,bz=0;
    if(!solidT(tx-1,tz)){const d=px-tx+EPS;if(d<best){best=d;bx=-d;bz=0}}if(!solidT(tx+1,tz)){const d=tx+1-px+EPS;if(d<best){best=d;bx=d;bz=0}}
    if(!solidT(tx,tz-1)){const d=pz-tz+EPS;if(d<best){best=d;bx=0;bz=-d}}if(!solidT(tx,tz+1)){const d=tz+1-pz+EPS;if(d<best){best=d;bx=0;bz=d}}
    if(best<9)add(bx,bz);else deep++}
  // hoeken van vaste tegels die in de auto steken (lantaarnpalen, paaltjes, de hoek van een gebouw)
  const R=Math.hypot(hl,hw)+.1,x0=Math.floor(x-R),x1=Math.ceil(x+R),z0=Math.floor(z-R),z1=Math.ceil(z+R);
  for(let tz=z0;tz<=z1;tz++)for(let tx=x0;tx<=x1;tx++){const s=solidT(tx-1,tz-1)+solidT(tx,tz-1)+solidT(tx-1,tz)+solidT(tx,tz);if(s===0||s===4)continue;
    const dx=tx-x,dz=tz-z,la=dx*fx+dz*fz,lb=dx*rx+dz*rz,pa=hl-Math.abs(la),pb=hw-Math.abs(lb);if(pa<=0||pb<=0)continue;
    if(pa<pb){const k=-(Math.sign(la)||1)*(pa+EPS);add(fx*k,fz*k)}else{const k=-(Math.sign(lb)||1)*(pb+EPS);add(rx*k,rz*k)}}
  return {x:xp+xn,z:zp+zn,hit,deep}}
const fits=(x,z,ry,hl,hw)=>{const p=pen(x,z,ry,hl,hw);return !p.hit&&!p.deep};
function resolve(c,hl,hw){let tx=0,tz=0;for(let i=0;i<5;i++){const p=pen(c.x,c.z,c.ry,hl,hw);if(!p.hit&&!p.deep)return {x:tx,z:tz,ok:true};
    if(p.deep&&!p.hit)break;if(Math.abs(p.x)+Math.abs(p.z)<1e-5)break;c.x+=p.x;c.z+=p.z;tx+=p.x;tz+=p.z}
  const p=pen(c.x,c.z,c.ry,hl,hw);return {x:tx,z:tz,ok:!p.deep&&Math.abs(p.x)+Math.abs(p.z)<.06}}
// twee draaiende rechthoeken (SAT): hoe ver moet A weg (n wijst van B naar A)
function obb(ax,az,ar,ahl,ahw,bx,bz,br,bhl,bhw){const sa=Math.sin(ar),ca=Math.cos(ar),sb=Math.sin(br),cb=Math.cos(br),dx=ax-bx,dz=az-bz;let best=1e9,nx=0,nz=0;
  for(const [ux,uz] of [[sa,ca],[ca,-sa],[sb,cb],[cb,-sb]]){const ra=ahl*Math.abs(ux*sa+uz*ca)+ahw*Math.abs(ux*ca-uz*sa),rb=bhl*Math.abs(ux*sb+uz*cb)+bhw*Math.abs(ux*cb-uz*sb),d=dx*ux+dz*uz,ov=ra+rb-Math.abs(d);
    if(ov<=0)return null;if(ov<best){best=ov;const s=d<0?-1:1;nx=ux*s;nz=uz*s}}return {d:best,nx,nz}}
// alles waar je tegenaan kunt rijden: verkeer, politie (ook versperringen), geparkeerde auto's en andere voertuigen
function carsNear(c,R){const out=[],P=c;TRAF.forEach(o=>{if(o.noCol||o.wait>0||o.gone||o.sunk)return;if(Math.abs(o.x-P.x)<R&&Math.abs(o.z-P.z)<R)out.push(o)});
  VEH.forEach(o=>{if(o!==c&&Math.abs(o.x-P.x)<R&&Math.abs(o.z-P.z)<R)out.push(o)});
  (G.parked||[]).forEach(o=>{if(o.st!=='gestolen'&&Math.abs(o.x-P.x)<R&&Math.abs(o.z-P.z)<R){o.parked=1;out.push(o)}});return out}
G.carFits=(v,x,z,ry)=>{const [hl,hw]=dimsOf(v);return fits(x,z,ry,hl,hw)};
// echt klem: naar de dichtstbijzijnde vrije plek op de weg (eerst je eigen rijstrook, dan steeds verder)
function unstick(c,why){const [hl,hw]=dimsOf(c),free=(x,z,ry)=>fits(x,z,ry,hl,hw)&&!carsNear({x,z},6).some(o=>{const [a,b]=dimsOf(o);return obb(x,z,ry,hl,hw,o.x,o.z,o.ry,a,b)});
  const C=[],r=roadNear(c.x,c.z);if(r){C.push(r);const fx=Math.sin(r.ry),fz=Math.cos(r.ry);for(let k=1;k<=6;k++)C.push({x:r.x+fx*k*3,z:r.z+fz*k*3,ry:r.ry},{x:r.x-fx*k*3,z:r.z-fz*k*3,ry:r.ry})}
  for(let rad=2;rad<=30;rad+=2)for(let a=0;a<12;a++){const t=a/12*Math.PI*2;C.push({x:c.x+Math.cos(t)*rad,z:c.z+Math.sin(t)*rad,ry:c.ry})}
  for(const p of C){for(const ry of [p.ry,p.ry+Math.PI,p.ry+Math.PI/2,p.ry-Math.PI/2]){if(free(p.x,p.z,ry)){c.x=p.x;c.z=p.z;c.ry=ry;c.v=0;c.kx=c.kz=c.spin=0;c.safe={x:c.x,z:c.z,ry};c.stk=0;c.bad=0;
    if(c===mine){G.yawT=ry+Math.PI;G.toast&&G.toast(why||'Je zat klem. Weer op de weg gezet.','info')}return true}}}return false}
G.carUnstick=v=>unstick(v||mine);
/* ---------- schade, rook en vuur ----------
 v.dmg loopt van 0 tot 100. Hoe meer schade, hoe donkerder en scheever de auto, hoe lager de topsnelheid en hoe slechter hij stuurt.
 Boven 50: rook. Boven 85: vlammetjes (motor oververhit). Op 100: de motor is dood, total loss. */
let baseMat=null;
function look(c){if(!c||!c.mesh)return;const d=Math.min(1,(c.dmg||0)/100);if(d<=0&&!c._mat)return;
  if(!c._mat){baseMat=baseMat||G.city.material;const m=baseMat.clone();m.onBeforeCompile=baseMat.onBeforeCompile;m.customProgramCacheKey=baseMat.customProgramCacheKey;c._mat=m;c.mesh.material=m}
  c._mat.color.setRGB(1-.5*d,1-.55*d,1-.6*d);c._tilt=d>.4?(d-.4)/.6*.055*(c._tsgn||(c._tsgn=Math.random()<.5?-1:1)):0;c.mesh.rotation.z=c._tilt;c.mesh.scale.set(1,1-.06*d,1-.035*d)}
G.carLook=look;
function persistOwn(c){if(!c||!c.own||!c.d||!c.d.o)return;const e=c.d.o.c;if(!e)return;const d=Math.round(c.dmg||0);if(e.dmg===d)return;e.dmg=d;if(e.v0==null)e.v0=e.v;e.v=Math.round(e.v0*(1-.6*d/100)/10)*10;clearTimeout(persistOwn.t);persistOwn.t=setTimeout(()=>{try{save()}catch(e){}},1500)}
G.carPersist=persistOwn;
function addDmg(c,a,o){if(!c||!(a>0)||c.dead)return;o=o||{};const d0=c.dmg||0;c.dmg=Math.min(100,d0+a);look(c);persistOwn(c);
  if(c===mine&&G.driving){if(c.dmg>=100){c.dead=1;c.v*=.4;G.snd&&G.snd.fx('bad');G.flash&&G.flash('#ff7a1a',.45);G.toast&&G.toast('Total loss! De motor is dood. Stap uit (F).','bad');for(let i=0;i<10;i++)puff(c,'vuur')}
    else if(d0<85&&c.dmg>=85)G.toast&&G.toast('De motor raakt oververhit. Nog een klap en hij is total loss.','bad');else if(d0<50&&c.dmg>=50&&!o.quiet)G.toast&&G.toast('Je auto begint te roken','info');hud()}
  else if(c.dmg>=100)c.dead=1}
G.carDamage=addDmg;
const SMK=[];let smkGeo=null;
function puff(c,kind){if(SMK.filter(p=>p.life>0).length>70)return;let p=SMK.find(p=>p.life<=0);if(!p){smkGeo=smkGeo||new TH.BoxGeometry(.55,.55,.55);p={m:new TH.Mesh(smkGeo,new TH.MeshBasicMaterial({color:0xffffff,transparent:true,depthWrite:false})),life:0};p.m.renderOrder=3;G.scene().add(p.m);SMK.push(p)}
  const [hl]=dimsOf(c),fx=Math.sin(c.ry),fz=Math.cos(c.ry),fire=kind==='vuur',dark=c.dead||(c.dmg||0)>80;
  p.m.position.set(c.x+fx*hl*.62+rr(-.4,.4),fire?1:1.15,c.z+fz*hl*.62+rr(-.4,.4));p.fire=fire;p.T=p.life=fire?rr(.35,.6):rr(1.3,2.2);p.vy=fire?rr(1.4,2.4):rr(1.1,1.8);p.vx=rr(-.3,.3)-fx*Math.min(6,Math.abs(c.v||0))*.25;p.vz=rr(-.3,.3)-fz*Math.min(6,Math.abs(c.v||0))*.25;
  p.m.material.color.set(fire?pick(['#ffb02a','#ff6a1a','#ffd35a']):dark?'#2a2b2f':'#8f9298');p.m.material.opacity=fire?.95:.55;p.m.scale.setScalar(fire?.5:.6);p.m.visible=true}
function burstAt(x,z,col,n){if(G.fx2)G.fx2.burst(x,.9,z,col,n)}
function smokeStep(dt){VEH.forEach(v=>{const d=v.dmg||0;if(d<50)return;if(Math.abs(v.x-G.P.x)>70||Math.abs(v.z-G.P.z)>70)return;
    v._sm=(v._sm||0)+dt*((d-50)/50*7+(v.dead?5:1));while(v._sm>=1){v._sm--;puff(v)}if(d>=85&&!v.dead||v.dead&&(v.fireT=(v.fireT||0)+dt)<6){v._fi=(v._fi||0)+dt*6;while(v._fi>=1){v._fi--;puff(v,'vuur')}}});
  SMK.forEach(p=>{if(p.life<=0)return;p.life-=dt;if(p.life<=0){p.m.visible=false;return}const k=1-p.life/p.T;p.m.position.x+=p.vx*dt;p.m.position.z+=p.vz*dt;p.m.position.y+=p.vy*dt;
    p.m.scale.setScalar(p.fire?.5*(1-k*.7):.6+k*1.6);p.m.material.opacity=(p.fire?.95:.55)*(1-k);p.m.rotation.y+=dt*1.5})}
/* ---------- ongeluk: versuft ----------
 Een harde klap (de snelheid richting het obstakel of de andere auto ≥ 7,5 m/s, zo'n 27 km/u): flits, het beeld schudt, de auto
 rookt, je verliest gezondheid en je zit 2 tot 4 seconden versuft. Dan reageert de auto eerst niet en daarna langzaam weer. */
const ACC=7.5,DZ={on:false,t:0,T:0};G.versuft=()=>DZ.on;
const kl=document.createElement('div');kl.className='sd-klap';kl.id='sdKlap';kl.hidden=true;kl.innerHTML='<div class="sd-klap-in"><b id="sdKlapT">Klap!</b><span>Je zit even versuft</span><i><i id="sdKlapB"></i></i></div>';document.body.appendChild(kl);
function daze(T,title){DZ.on=true;DZ.t=0;DZ.T=Math.max(DZ.T&&DZ.on?DZ.T-DZ.t:0,T);$s('sdKlapT').textContent=title||'Klap!';kl.hidden=false;kl.classList.remove('go');void kl.offsetWidth;kl.classList.add('go');document.body.classList.add('sd-versuft');if(navigator.vibrate)try{navigator.vibrate([90,40,60])}catch(e){}}
function dazeEnd(quiet){if(!DZ.on)return;DZ.on=false;kl.hidden=true;document.body.classList.remove('sd-versuft');if(!quiet&&G.driving)G.fx2&&G.fx2.float('Weer bij de les',G.P.x,G.P.z,'#9fe8c0')}
function dazeStep(dt){if(!DZ.on)return;DZ.t+=dt;$s('sdKlapB').style.width=Math.max(0,1-DZ.t/DZ.T)*100+'%';if(DZ.t>=DZ.T||!G.driving)dazeEnd(!G.driving)}
// tegen iets aan: imp = snelheid richting het obstakel (m/s); by = de andere auto (of null voor een muur, paal of gebouw)
function crash(c,imp,by,nx,nz){const now=performance.now();if(now-(c._crT||0)<300&&imp<(c._crI||0)+3)return;c._crT=now;c._crI=imp;if(imp<3.5)return;
  const hx=c.x-nx*1.6,hz=c.z-nz*1.6;G.snd&&G.snd.fx('hit');G.shake&&G.shake(Math.min(1,imp*.05));burstAt(hx,hz,'#c8ccd2',Math.min(14,4+Math.round(imp/2)));
  const rammed=by&&by.v&&!by.parked&&!by.block&&(Math.sin(by.ry)*by.v*nx+Math.cos(by.ry)*by.v*nz)>Math.abs(c.v)*.5;
  if(imp<ACC||G.talking){addDmg(c,(imp-3)*1.1,{quiet:1});G.onCrash&&G.onCrash(c,imp);return}
  addDmg(c,imp*1.3+2);G.flash&&G.flash('#ffffff',.55);G.hitStop=.07;if(imp>11)G.snd&&G.snd.fx('glass');for(let i=0;i<5;i++)puff(c);
  const hp=Math.round(clamp((imp-6)*.8,1,22));try{S.hp=Math.max(5,(S.hp||100)-hp);if(typeof save==='function')save()}catch(e){}
  G.fx2&&G.fx2.float('Klap! −'+hp+' gezondheid',c.x,c.z,'#ff9a9a');
  daze(2+2*clamp((imp-ACC)/15,0,1),rammed?'Geramd!':'Klap!');G.onCrash&&G.onCrash(c,imp)}
// iets anders raakt jou (een politiewagen die ramt): stad-police.js kan dit aanroepen
G.carHit=(imp,by)=>{if(G.driving&&mine)crash(mine,imp,by||null,0,0)};
/* ---------- voetgangers: vanaf een stapvoets tempo duw je ze opzij, harder rijden = omver (en getuigen bellen) ---------- */
let lastAanr=0;
function hitPeds(c,hl,hw){const sp=Math.abs(c.v);if(sp<4.5)return;const fx=Math.sin(c.ry),fz=Math.cos(c.ry),rx=fz,rz=-fx,R=hl+1;
  const test=n=>{const dx=n.x-c.x,dz=n.z-c.z;if(Math.abs(dx)>R||Math.abs(dz)>R)return false;const la=dx*fx+dz*fz,lb=dx*rx+dz*rz;return Math.abs(la)<hl+.3&&Math.abs(lb)<hw+.3};
  (G.NPC||[]).forEach(n=>{if(n.fixed||n.st==='aangereden'||n.st==='sitb'||n.st==='sit'||!test(n))return;const side=((n.x-c.x)*rx+(n.z-c.z)*rz)>0?1:-1;
    n.st='aangereden';n.t=0;n.kvx=fx*sp*.55+rx*side*3;n.kvz=fz*sp*.55+rz*side*3;n.kdB=0;G.bubble&&G.bubble(n,pick(['Au!','Hé!','Kijk uit!','Aaah!']),{col:'#ff9a9a'});
    G.snd&&G.snd.fx('hit');G.shake&&G.shake(.35);burstAt(n.x,n.z,'#d8cfb8',8);addDmg(c,1.5+sp*.12,{quiet:1});c.v*=.82;
    try{S.stats=S.stats||{};S.stats.aangereden=(S.stats.aangereden||0)+1}catch(e){}
    if(n.arch==='agent'||n.arch==='wijkagent'){G.toast&&G.toast('Je hebt een agent aangereden!','bad');G.police&&G.police.start&&G.police.start({stars:2,why:'agent aangereden'})}
    else if(performance.now()-lastAanr>3000){lastAanr=performance.now();G.crime&&G.crime(n.x,n.z,{why:'aanrijding',stars:1,victim:n})}});
  // agenten te voet (achtervolging): ook omver, en dan heb je echt een probleem
  (G.actors||[]).forEach(a=>{if(a.kind!=='cop'||a.down>0||!test(a))return;const side=((a.x-c.x)*rx+(a.z-c.z)*rz)>0?1:-1;a.kvx=fx*sp*.5+rx*side*3;a.kvz=fz*sp*.5+rz*side*3;
    if(G.police&&G.police.knock)G.police.knock(a);else a.down=2.6;G.snd&&G.snd.fx('hit');G.shake&&G.shake(.4);burstAt(a.x,a.z,'#d8cfb8',8);addDmg(c,2,{quiet:1});c.v*=.8;
    if(G.police&&G.police.start)G.police.start({stars:2,why:'agent aangereden'});G.toast&&G.toast('Je hebt een agent aangereden!','bad')})}
// omver en weer overeind (geen bloed: even zitten, sterretjes, opstaan en wegwezen)
function downBrain(n,dt){n.t=(n.t||0)+dt;const t=n.t;n.arm=n.armR=n.armL=undefined;n.armRz=n.armLz=0;n.hop=0;n.legL=n.legR=undefined;n.hx=0;n.y=0;n.lean=0;n.sp=0;
  if(t<.45){const k=1-t/.45,nx=n.x+(n.kvx||0)*dt*k,nz=n.z+(n.kvz||0)*dt*k;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;const q=t/.45;n.y=-.84*q;n.lean=-.6*q;n.legL=n.legR=-1.5*q;n.armL=n.armR=-2.3;n.armLz=.5;n.armRz=-.5}
  else if(t<2.9){n.y=-.84;n.lean=-.5;n.legL=-1.5;n.legR=-1.3;n.armL=n.armR=.55;n.hy=Math.sin(t*5)*.45;if(!n.kdB&&t>.6){n.kdB=1;G.bubble&&G.bubble(n,'✶ ✶ ✶',{col:'#ffd35a',life:1.8})}}
  else if(t<3.5){const k=(t-2.9)/.6;n.y=-.84*(1-k);n.lean=-.5*(1-k);n.legL=n.legR=-1.5*(1-k)}
  else{n.kdB=0;n.st='flee';n.t=0;n.from={x:G.P.x,z:G.P.z};n.flee=5;if(Math.random()<.5)G.bubble&&G.bubble(n,pick(['Wegpiraat!','Idioot!','Mijn knie…']),{col:'#ff9a9a'})}
  return true}
const brainHook=setInterval(()=>{if(!G.npcBrain)return;clearInterval(brainHook);const b0=G.npcBrain;G.npcBrain=function(n,dt){if(n.st==='aangereden')return downBrain(n,dt);return b0(n,dt)}},300);
/* ---------- rijden ---------- */
function driveStep(dt){const K=G.K,c=mine;let thr=0,steer=0;
  if(G.joy.on){// stick: de auto draait naar de richting van de stick (ten opzichte van de camera) en geeft gas
    const jx=G.joy.x,jy=G.joy.y,mag=Math.min(1,Math.hypot(jx,jy));if(mag>.2){const fx=-Math.sin(G.yaw),fz=-Math.cos(G.yaw),rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw),wx=rx*jx+fx*jy,wz=rz*jx+fz*jy,want=Math.atan2(wx,wz);
      let r=want-c.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;if(Math.abs(r)>2.2&&Math.abs(c.v)<4){thr=-mag;steer=r>0?-1:1}else{steer=Math.max(-1,Math.min(1,r*1.6));thr=mag}}}
  else{thr=(K.w||K.arrowup?1:0)-(K.s||K.arrowdown?1:0);steer=(K.a||K.arrowleft?1:0)-(K.d||K.arrowright?1:0)}
  if(G.carFreeze){thr=0;steer=0;c.v=0}
  if(G.talking||c.dead){thr=0;steer=0}
  // versuft: eerst reageert de auto niet, daarna komen gas en stuur langzaam terug (en het stuur trekt een beetje)
  if(DZ.on){const k=clamp((DZ.t/DZ.T-.4)/.6,0,1);thr*=k;steer=steer*k+Math.sin(DZ.t*6.5)*.4*(1-k)}
  const [hl,hw]=dimsOf(c),dm=clamp((c.dmg||0)/100,0,1),max=c.d.max*(K.shift?1.12:1)*(G.carK||1)*(c.flat?.5:1)*(1-.35*dm),acc=1-.3*dm;
  if(thr>0)c.v+=(c.v<0?18:9*acc)*thr*dt;else if(thr<0)c.v+=(c.v>0?-18:-7*acc)*(-thr)*dt;else c.v*=Math.pow(G.talking?.02:c.dead?.5:.35,dt);
  c.v=Math.max(-7,Math.min(max,c.v));if(c.v>max+.5)c.v=max;
  const turn=steer*Math.min(1,Math.abs(c.v)/5)*(2.1-Math.min(1,Math.abs(c.v)/max)*.8)*Math.sign(c.v||1)*(1-.3*dm);
  const x0=c.x,z0=c.z;if(!c.safe)c.safe=fits(c.x,c.z,c.ry,hl,hw)?{x:c.x,z:c.z,ry:c.ry}:null;
  c.ry+=turn*dt+(c.spin||0)*dt;if(c.spin){c.spin*=Math.pow(.03,dt);if(Math.abs(c.spin)<.02)c.spin=0}
  let fx=Math.sin(c.ry),fz=Math.cos(c.ry);
  c.x+=fx*c.v*dt+(c.kx||0)*dt;c.z+=fz*c.v*dt+(c.kz||0)*dt;if(c.kx||c.kz){const k=Math.pow(.03,dt);c.kx*=k;c.kz*=k;if(Math.abs(c.kx)+Math.abs(c.kz)<.05)c.kx=c.kz=0}
  // 1. andere auto's: uit elkaar duwen; de snelheid richting de ander gaat eraf, een zijdelingse klap duwt je opzij en laat je tollen
  let imp=0,by=null,iX=0,iZ=0;
  for(const o of carsNear(c,9)){if(o.block&&Math.abs(c.v)>=12.5)continue;// met vaart door een versperring: dat regelt stad-police.js (rammen)
    const [ohl,ohw]=dimsOf(o),m=obb(c.x,c.z,c.ry,hl,hw,o.x,o.z,o.ry||0,ohl,ohw);if(!m)continue;c.x+=m.nx*(m.d+EPS);c.z+=m.nz*(m.d+EPS);
    const mov=!o.parked&&!o.block&&o.v&&!VEH.includes(o),ovx=mov?Math.sin(o.ry)*o.v:0,ovz=mov?Math.cos(o.ry)*o.v:0,vx=fx*c.v+(c.kx||0),vz=fz*c.v+(c.kz||0),vr=(vx-ovx)*m.nx+(vz-ovz)*m.nz;
    if(vr<0){const j=-vr,w=mov?.55:1,dvx=1.25*j*w*m.nx,dvz=1.25*j*w*m.nz,along=dvx*fx+dvz*fz;c.v+=along;c.kx=(c.kx||0)+(dvx-along*fx)*.7;c.kz=(c.kz||0)+(dvz-along*fz)*.7;
      const la=(o.x-c.x)*fx+(o.z-c.z)*fz,lat=(dvx*fz-dvz*fx);if(j>2)c.spin=(c.spin||0)+clamp(-lat*Math.sign(la||1)*.09,-1.6,1.6);
      if(j>imp){imp=j;by=o;iX=m.nx;iZ=m.nz}
      if(j>3){if(o.parked){if(j>5&&!(o.alarmT>0)){o.alarmT=8;G.snd&&G.snd.fx('carAlarm')}}else if(VEH.includes(o))addDmg(o,j*.8);else if(o.chase){o.v*=.3}else if(!o.block){o.bumpT=1.4+Math.random();o.v=0;if(j>6&&Math.random()<.6)G.bubble&&G.bubble(o,pick(['Hé!','Kun je niet kijken?','Toet toet!','Idioot!']),{col:'#ffe0a0',y:2.4})}}}}
  // 2. de stad: muren, palen, gebouwen, water. Eruit duwen langs de kortste vrije kant, de rest glijdt langs de muur
  const r=resolve(c,hl,hw);fx=Math.sin(c.ry);fz=Math.cos(c.ry);
  if(r.x||r.z){const L=Math.hypot(r.x,r.z),nx=r.x/L,nz=r.z/L,fn=fx*nx+fz*nz,vn=c.v*fn+(c.kx||0)*nx+(c.kz||0)*nz;
    if(vn<0){const j=-vn;c.v-=1.25*c.v*fn*fn;const kn=(c.kx||0)*nx+(c.kz||0)*nz;if(kn<0){c.kx-=1.25*kn*nx;c.kz-=1.25*kn*nz}c.v*=Math.pow(1-.5*Math.abs(fn),dt);
      if(j>imp){imp=j;by=null;iX=nx;iZ=nz}
      // langs de muur glijden: de neus draait een beetje mee
      if(Math.abs(fn)<.8&&Math.abs(c.v)>1.5){const tx=fx-fn*nx,tz=fz-fn*nz;let a=Math.atan2(tx,tz)-c.ry;while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;if(c.v<0)a=0;c.ry+=clamp(a,-1,1)*Math.min(1,dt*4)}}}
  // 3. nog steeds niet vrij? terug naar de laatste vrije plek
  if(!r.ok){if(c.safe){c.x=c.safe.x;c.z=c.safe.z;c.ry=c.safe.ry}else{c.x=x0;c.z=z0}c.v*=-.2;c.kx=c.kz=c.spin=0;c.bad=(c.bad||0)+dt}else{c.safe={x:c.x,z:c.z,ry:c.ry};c.bad=0}
  // 4. echt klem (vooruit en achteruit lukt allebei niet), of al een seconde geen vrije plek: naar de weg
  const moved=Math.hypot(c.x-x0,c.z-z0),want=Math.abs(thr)>.3;
  if(want&&moved<dt*.6&&(r.x||r.z||!r.ok||imp>0))c.stk=(c.stk||0)+dt;else c.stk=Math.max(0,(c.stk||0)-dt*2);
  if(c.bad>1||c.stk>1){const s=Math.sign(thr)||1,bx=c.x-Math.sin(c.ry)*s*.6,bz=c.z-Math.cos(c.ry)*s*.6;if(c.bad>1||!fits(bx,bz,c.ry,hl,hw))unstick(c);else c.stk=0}
  if(imp>0)crash(c,imp,by,iX,iZ);
  hitPeds(c,hl,hw);
  fx=Math.sin(c.ry);fz=Math.cos(c.ry);
  c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;if(c._tilt)c.mesh.rotation.z=c._tilt;G.P.x=c.x;G.P.z=c.z;G.P.vx=fx*c.v;G.P.vz=fz*c.v;G.P.ry=c.ry;
  // camera achter de auto, tenzij je zelf net hebt gedraaid
  if(Math.abs(c.v)>3&&performance.now()-(G.manualRotT||0)>1500){let want=c.ry+Math.PI-G.yawT;while(want>Math.PI)want-=Math.PI*2;while(want<-Math.PI)want+=Math.PI*2;G.yawT+=want*Math.min(1,dt*(G.camMode==='achter'?4.5:1.6))}}
G.carStep=function(dt){if(!TRAF.length)for(let i=0;i<26;i++)spawnCar(i<3,false);
  TRAF.slice().forEach(c=>trafficStep(c,dt));policeTick(dt);
  // zwaailichten
  const fl=Math.floor(performance.now()/180)%2;TRAF.forEach(c=>{const b=c.mesh.userData.bar;if(b){const on=c.chase||c.block||G.night>.5;b[0].visible=on?fl===0:true;b[1].visible=on?fl===1:true}});
  if(G.driving&&mine)driveStep(dt);
  dazeStep(dt);smokeStep(dt);
  // een gestolen auto koelt langzaam af (niet onder wat de politie al weet: gemeld = minstens lauw)
  VEH.forEach(v=>{const s=v.stolen;if(s&&!s.papers&&s.heat>0){const fl=s.paint?0:s.rep?30:8;if(s.heat>fl)s.heat=Math.max(fl,s.heat-dt*.12)}
    // een wrak dat je hebt laten staan wordt na een tijdje weggesleept
    if(v.dead&&!v.own&&!(G.driving&&mine===v)){v.deadT=(v.deadT||0)+dt;if(v.deadT>40&&Math.hypot(v.x-G.P.x,v.z-G.P.z)>30)G.removeVehicle(v)}});
  // instappen: het dichtstbijzijnde voertuig binnen 3,4 meter (geen wrakken)
  let near=null;if(!G.driving){let bd=3.4;VEH.forEach(v=>{if(v.dead)return;const d=Math.hypot(G.P.x-v.x,G.P.z-v.z);if(d<bd){bd=d;near=v}})}if(near!==G.nearCar){G.nearCar=near;hud()}
  if(G.driving&&mine){$s('sdSpdV').textContent=Math.round(Math.abs(mine.v)*3.6);const dm=Math.round(mine.dmg||0),h=mine.stolen?Math.round((mine.stolen.heat||0)/10):0;if(dm!==hud._dm||h!==hud._h){hud._dm=dm;hud._h=h;hud()}}
  if(G.snd)G.snd.engine(G.driving&&mine&&!mine.dead?mine.v:null);
  hudT+=dt;if(hudT>.5){hudT=0;hudPol()}};
let hudT=0;
/* ---------- knoppen en snelheidsmeter ---------- */
const ui=document.createElement('div');ui.id='sdCarUi';document.body.appendChild(ui);
ui.innerHTML=`<button class="sd-carp" id="sdCarP" hidden></button><div class="sd-spd" id="sdSpd" hidden><b id="sdSpdV">0</b><small>km/u</small><span id="sdSpdN"></span><em id="sdSpdX"></em><div class="sd-cdmg" id="sdCDmg"><small>Schade</small><i><i id="sdCDmgB"></i></i><b id="sdCDmgV">0%</b></div><button id="sdOutCar">${touch?'Uitstappen':'<kbd>F</kbd> Uitstappen'}</button></div><div class="sd-pol" id="sdPol" hidden>Politie zit achter je</div>`;
const heatTxt=h=>h>=60?'heet':h>=30?'lauw':'';
function hud(){const p=$s('sdCarP'),n=G.nearCar;p.hidden=!n||G.driving;if(!p.hidden)p.innerHTML=(touch?'':'<kbd>F</kbd> ')+'Instappen · <b>'+(n?n.d.name:'')+'</b>'+(n&&n.stolen?' <i class="sd-hot">gestolen</i>':'')+(n&&(n.dmg||0)>=50?' <i class="sd-dmg">schade '+Math.round(n.dmg)+'%</i>':'');
  $s('sdSpd').hidden=!G.driving;if(G.driving&&mine){$s('sdSpdN').textContent=mine.d.name;const dm=Math.round(mine.dmg||0),s=mine.stolen,ht=s&&!s.papers?heatTxt(s.heat||0):'';
    $s('sdSpdX').innerHTML=(s?(s.papers?'<i class="sd-reg">geregistreerd</i>':'<i class="sd-hot">gestolen'+(ht?' · '+ht:'')+'</i>'):'')+(mine.flat?'<i class="sd-dmg">lekke banden</i>':'')+(mine.dead?'<i class="sd-dmg sd-dead">total loss</i>':dm>=85?'<i class="sd-dmg sd-fire">motor oververhit</i>':'');
    const b=$s('sdCDmg');b.hidden=dm<1;b.classList.toggle('mid',dm>=50);b.classList.toggle('hi',dm>=85);$s('sdCDmgB').style.width=dm+'%';$s('sdCDmgV').textContent=dm+'%';$s('sdOutCar').classList.toggle('dz',DZ.on)}
  document.body.classList.toggle('stad-drive',!!G.driving);document.body.classList.toggle('stad-hotcar',!!(G.driving&&mine&&mine.stolen&&!mine.stolen.papers))}
G.carHud=hud;
function hudPol(){$s('sdPol').hidden=true}
$s('sdCarP').onclick=()=>enterCar();$s('sdOutCar').onclick=()=>exitCar();
addEventListener('keydown',e=>{if(G.paused||e.repeat)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;if(G.carLock&&G.carLock())return;if(e.key.toLowerCase()==='f'){if(!G.driving&&G.missionAction&&G.missionAction())return;if(G.driving){exitCar();e.stopImmediatePropagation()}else if(G.nearCar&&!(G.near)){enterCar();e.stopImmediatePropagation()}}},true);
// opstarten: je auto staat waar je hem liet, anders bij het plein
G.carsInit=function(){let s=null;try{s=JSON.parse(localStorage.getItem('stad_carpos')||'null')}catch(e){}
  const d=myCarObj();if(!d)return;if(s&&s.id===d.o.c.id&&M.walkable(s.x,s.z))spawnMine(s.x,s.z,s.ry);else{const r=roadNear(G.P.x,G.P.z-6);if(r)spawnMine(r.x,r.z,r.ry)}};
G.carMesh=carMesh;G.carKind=kindOf;G.TRAF=TRAF;
G.missionCarsHook=true;
})();
