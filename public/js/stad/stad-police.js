// Pixelstad: de politie op straat (zoals afgesproken).
// - Een getuige belt 112 (stad-npc.js): na ongeveer 10 seconden komt er een politieauto met sirene naar de plek; je krijgt sterren.
//   Agenten stappen uit en zoeken je. Politieauto's rijden alleen over de weg (en pleinen), niet door de stegen.
// - Agenten zien je alleen als je in hun blikveld staat en er niets tussen zit. Zien ze je niet meer, dan lopen ze naar waar ze je
//   het laatst zagen en zoeken ze in een cirkel (op de minikaart). Achter een container of in een steeg kun je je verstoppen (E).
// - Blijf lang genoeg uit zicht en je bent ze kwijt. Pakken ze je, dan volgt dezelfde arrestatie als in het klikspel.
// - Kies je bij een arrestatie 'Vluchten', dan ren je hier in de stad weg in plaats van in het klikspel-scherm (escapeGame).
//   Lukt het, dan ben je vrij; pakken ze je toch, dan +20% straf (de regels van het klikspel).
// - Sprinten kost adem als de politie achter je aan zit; je training (Conditie, Uithouding, Ademhaling) telt mee.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id),E=K.E,T=M.T;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z),los=(a,b)=>G.los(a,b);
const SKIN=['#e9b98f','#d9a27a','#b97a52','#8d5a3a','#f1caa5'];
const copLook=()=>({skin:pick(SKIN),hair:'#2a1d14',top:'#1d2a4a',arm:'#1d2a4a',pants:'#151c30',shoe:'#0e0f12',hat:'cap',hatC:'#1d2a4a'});
/* ---------- wegen voor de politieauto ---------- */
const roadOK=(x,z)=>{x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return false;const i=z*M.W+x,t=M.ground[i];return (t===T.ROAD||t===T.BRIDGE||t===T.PLAZA)&&!M.solid[i]};
const N=M.NET;
function nearNode(x,z){let b=null,bd=1e9;N.forEach(n=>{const d=Math.hypot(n.x-x,n.z-z);if(d<bd){bd=d;b=n}});return b}
function roadPoint(x,z){let best=null,bd=1e9;N.forEach(A=>A.n.forEach(B=>{const vx=B.x-A.x,vz=B.z-A.z,L2=vx*vx+vz*vz||1;let t=((x-A.x)*vx+(z-A.z)*vz)/L2;t=clamp(t,0,1);const px=A.x+vx*t,pz=A.z+vz*t,d=Math.hypot(px-x,pz-z);if(d<bd){bd=d;best={x:px,z:pz,A,B}}}));return best}
function route(ax,az,bx,bz){const s=nearNode(ax,az),tp=roadPoint(bx,bz),e=Math.hypot(tp.A.x-bx,tp.A.z-bz)<Math.hypot(tp.B.x-bx,tp.B.z-bz)?tp.A:tp.B;
  const D=new Map(),prev=new Map(),Q=new Set(N);N.forEach(n=>D.set(n,1e9));D.set(s,0);
  while(Q.size){let u=null,ud=1e9;Q.forEach(n=>{if(D.get(n)<ud){ud=D.get(n);u=n}});if(!u||u===e)break;Q.delete(u);u.n.forEach(v=>{const nd=ud+Math.hypot(v.x-u.x,v.z-u.z);if(nd<D.get(v)){D.set(v,nd);prev.set(v,u)}})}
  const path=[];for(let n=e;n;n=prev.get(n)){path.unshift({x:n.x,z:n.z});if(n===s)break}
  // laatste knoop overslaan als het doel op hetzelfde stuk weg ligt (anders rijdt hij eerst voorbij en terug)
  if(path.length>1){const l=path[path.length-1],k=path[path.length-2];if((tp.A.x===l.x&&tp.A.z===l.z&&tp.B.x===k.x&&tp.B.z===k.z)||(tp.B.x===l.x&&tp.B.z===l.z&&tp.A.x===k.x&&tp.A.z===k.z))path.pop()}
  path.push({x:tp.x,z:tp.z});return path}
/* ---------- staat van de achtervolging ---------- */
const P0={on:false,mode:null,stars:0,lkp:null,seenAgo:0,cops:[],cars:[],t:0,arrived:false,res:null,why:'',sawFirst:false,dispatchT:0,ref:null};
const LOSE=[0,8,14,20];
function active(){return P0.on}
function settings(){// adem: je training telt (fleeParams uit het klikspel), lidmaatschap ook
  let P=null;try{P=typeof fleeParams==='function'?fleeParams(Math.max(1,Math.min(5,P0.level||2)),{}):null}catch(e){}
  const c=P?P.c:0,u=P?P.u:0,a=P?P.a:0,tk=P&&P.X?P.X.tk:0;G.useStam=true;G.stamDrain=.2*(1-.4*c)/(1+.5*tk);G.stamRegen=.1*(1+.6*u);G.windSp=7.2*(.95+.08*a);if(G.stam==null)G.stam=1}
function copSpeed(){return P0.mode==='flee'?7.9+.25*(P0.level||2):8.2+.3*P0.stars}
function loseT(){return P0.mode==='flee'?6+2*(P0.level||2):LOSE[clamp(P0.stars,1,3)]}
function begin(o){const fresh=!P0.on;P0.on=true;P0.mode=o.mode||P0.mode||'roof';P0.stars=clamp(Math.max(P0.stars,o.stars||1),1,3);P0.why=o.why||P0.why;if(o.ref)P0.ref=o.ref;
  if(o.x!=null)P0.lkp={x:o.x,z:o.z};if(fresh){P0.seenAgo=0;P0.t=0;P0.wt=0;P0.arrived=false;P0.cops=[];P0.cars=[];P0.sawFirst=false;settings();hud(true)}
  if(o.resolve)P0.res=o.resolve;if(o.level)P0.level=o.level}
// melding van een getuige: de meldkamer stuurt een auto
function report(x,z,o){o=o||{};if(!P0.on&&G.smeer&&G.smeer.intercept(x,z,o))return;if(P0.on){P0.stars=clamp(P0.stars+(o.stars>1?1:0),1,3);if(!P0.sawFirst)P0.lkp={x,z};need();hud();return}
  const d=M.districtAt(x,z),delay=/Zuidas|Centrum|Plein/.test(d)?8:/Villawijk/.test(d)?7:/Haven|Bedrijven|Oosterstraat|IJ-oever|Tuinwijk/.test(d)?13:10;
  begin({mode:'roof',stars:o.stars||1,why:o.why||'straatroof',x,z,ref:G.roofRef&&G.roofRef()});P0.dispatchT=delay;G.toast&&G.toast('Een getuige heeft 112 gebeld','bad');G.snd&&G.snd.fx('phoneRing');banner('112','bad');need()}
// direct: een agent ziet het (of je bent gezocht en wordt herkend)
function start(o){o=o||{};const P=G.P;if(P0.on){P0.stars=clamp(Math.max(P0.stars,o.stars||1),1,3);P0.lkp={x:P.x,z:P.z};P0.seenAgo=0;hud();return}
  begin({mode:o.wanted?'wanted':'roof',stars:o.stars||1,why:o.why,x:P.x,z:P.z,ref:G.roofRef&&G.roofRef()});P0.dispatchT=0;P0.arrived=true;P0.sawFirst=true;
  if(o.at&&(o.at.arch==='agent'||o.at.arch==='wijkagent')){// de agent op straat gaat zelf achter je aan
    const n=o.at,x=n.x,z=n.z;if(n.arch==='wijkagent'){G.smeer&&G.smeer.away(n)}else{const i=G.NPC.indexOf(n);if(i>=0){G.NPC.splice(i,1);setTimeout(()=>{const k=G.spawnNpc(false);G.NPC.push(k)},20000)}}const c=addCop(x,z,n.look);if(c)c.nm=n.nm}
  if(o.car){o.car.chase=true;P0.cars.push(o.car)}
  need();banner(o.wanted?'Herkend':'Politie','bad');G.snd&&G.snd.fx('whistle')}
// vluchten bij een arrestatie: agenten vlak achter je, een auto komt eraan
function flee(level,opts){return new Promise(res=>{level=clamp(Math.round(+level)||2,1,5);
  if(G.ui&&G.ui.cur&&G.ui.cur()){G.ui.leaveQuiet&&G.ui.leaveQuiet()}if(G.ui&&G.ui.closeAll)G.ui.closeAll();if(G.driving&&G.exitCar)G.exitCar(true);
  if(P0.on)end(true);window.__chase=true;begin({mode:'flee',stars:level<=2?1:level<=4?2:3,why:'vlucht',x:G.P.x,z:G.P.z,level,resolve:res});P0.arrived=true;P0.sawFirst=true;P0.dispatchT=0;
  const n=1+(level>=3?1:0)+(level>=5?1:0),P=G.P,back=P.ry+Math.PI;let g0=11;try{g0=clamp((fleeParams(level,opts).G0||11),8,16)}catch(e){}
  for(let i=0;i<n;i++){const a=back+rr(-.6,.6),p=M.nearestWalk(P.x+Math.sin(a)*(g0+i*2),P.z+Math.cos(a)*(g0+i*2),10)||{x:P.x+3,z:P.z+3};addCop(p.x,p.z)}
  setTimeout(()=>{if(P0.on&&P0.mode==='flee')need()},6000);
  G.resume();G.stam=1;banner('Rennen!','bad');G.toast&&G.toast('Rennen! Ga uit het zicht: steegjes, hoeken, containers','bad');G.snd&&G.snd.fx('whistle')})}
G.police={active,report,start,flee,stars:()=>P0.stars,_s:P0};
/* ---------- auto's ---------- */
function need(){const want=P0.mode==='flee'?1:P0.stars;let have=P0.cars.length;while(have<want){addCar(have*5);have++}}
function addCar(delay){if(!G.traf)return;const tgt=P0.lkp||G.P;const far=N.filter(n=>{const d=Math.hypot(n.x-tgt.x,n.z-tgt.z);return d>55&&d<110});const s=far.length?pick(far):pick(N);
  const c=G.traf.spawn(true,false);c.chase=true;c.wait=(P0.dispatchT||0)+(delay||0);c.x=s.x;c.z=s.z;c.ry=0;c.v=0;c.mode='edge';c.mesh.position.set(s.x,-50,s.z);c.deployed=false;P0.cars.push(c)}
function carTarget(c){if(G.driving&&G.car)return {x:G.car.x,z:G.car.z};const sees=P0.sawFirst&&P0.seenAgo<.5;return sees?{x:G.P.x,z:G.P.z}:(P0.lkp||G.P)}
// wordt aangeroepen door het verkeer (stad-cars.js) voor elke auto met c.chase
G.policeCarStep=function(c,dt){if(c.wait>0){c.wait-=dt;c.mesh.position.y=-50;return}c.mesh.position.y=0;
  if(c.leaving){c.v=Math.min(16,c.v+dt*6);const nx=c.x+Math.sin(c.ry)*c.v*dt,nz=c.z+Math.cos(c.ry)*c.v*dt;if(roadOK(nx,nz)){c.x=nx;c.z=nz}else c.ry+=dt*2;c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;if(dist(c,G.P)>90||c.t0++>900){c.gone=1}return}
  const tg=carTarget(c);c.rt=(c.rt||0)-dt;if(c.rt<=0||!c.route||!c.route.length){c.rt=G.driving?.8:1.6;c.route=route(c.x,c.z,tg.x,tg.z)}
  let w=c.route[0];while(w&&Math.hypot(w.x-c.x,w.z-c.z)<3.2&&c.route.length>1){c.route.shift();w=c.route[0]}
  const dl=w?Math.hypot(w.x-c.x,w.z-c.z):0,last=c.route.length<=1;
  if(!w||(last&&dl<4)){c.v*=Math.pow(.02,dt);arrive(c)}else{const want=Math.atan2(w.x-c.x,w.z-c.z);let r=want-c.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;c.ry+=clamp(r,-2.8*dt,2.8*dt);
    const tv=Math.abs(r)>.7?5:last?Math.max(3,Math.min(18,dl*1.2)):17+P0.stars*1.5+(G.driving?4:0);c.v+=(tv-c.v)*Math.min(1,dt*2.2);
    const nx=c.x+Math.sin(c.ry)*c.v*dt,nz=c.z+Math.cos(c.ry)*c.v*dt;if(roadOK(nx,nz)&&roadOK(nx+Math.sin(c.ry)*2,nz+Math.cos(c.ry)*2)){c.x=nx;c.z=nz}else{c.v*=.3;c.rt=0;if(!roadOK(c.x,c.z)){const p=roadPoint(c.x,c.z);c.x=p.x;c.z=p.z}}}
  // als hij de speler ziet terwijl die vlakbij te voet is: uitstappen
  if(!G.driving&&!c.deployed&&dist(c,G.P)<16&&los(c,G.P))arrive(c,true);
  c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;
  // stilstaan naast een politiewagen = gepakt; versuft na een klap telt het half (dan heb je nog een kans om weg te komen)
  if(G.driving&&G.car&&dist(c,G.car)<4.5&&Math.abs(G.car.v)<3){c.hold=(c.hold||0)+dt*(G.versuft&&G.versuft()?.5:1);if(c.hold>1.6)caught()}else c.hold=0};
function arrive(c,force){if(c.deployed)return;if(G.driving&&!force)return;c.deployed=true;P0.arrived=true;
  const s=Math.cos(c.ry),k=-Math.sin(c.ry);[[1.6,0],[-1.6,0]].forEach(([o])=>{const p=M.nearestWalk(c.x+s*o*1.4,c.z+k*o*1.4,8);if(p)addCop(p.x,p.z)});
  G.snd&&G.snd.fx('carDoor')}
/* ---------- agenten te voet ---------- */
function addCop(x,z,look){if(P0.cops.length>=6)return;const a={kind:'cop',x,z,ry:0,ph:Math.random()*6,sp:0,look:look||copLook(),st:'go',pt:0,path:null,sees:0,saw:false};P0.cops.push(a);G.actors.push(a);return a}
function removeCop(a){const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1)}
function canSee(a){const P=G.P,d=dist(a,P),R=G.night>.55?16:22;if(d>R)return false;if(G.hidden)return d<2;let ang=Math.atan2(P.x-a.x,P.z-a.z)-a.ry;ang=Math.atan2(Math.sin(ang),Math.cos(ang));
  if(Math.abs(ang)>.9&&d>4)return false;return los(a,P)}
function moveTo(a,tx,tz,sp,dt){const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d<.2){a.sp=0;return true}const v=Math.min(sp*dt,d),nx=a.x+dx/d*v,nz=a.z+dz/d*v;let mv=false;
  if(M.canStand(nx,a.z,.3)){a.x=nx;mv=true}if(M.canStand(a.x,nz,.3)){a.z=nz;mv=true}let r=Math.atan2(dx,dz)-a.ry;r=Math.atan2(Math.sin(r),Math.cos(r));a.ry+=r*Math.min(1,dt*10);a.ph+=dt*sp*1.25;a.sp=Math.min(1.3,sp/4.2);a.stuck=mv?0:(a.stuck||0)+dt;return false}
function goPath(a,tx,tz,sp,dt){a.pt-=dt;const d=Math.hypot(tx-a.x,tz-a.z);if(d<7&&los(a,{x:tx,z:tz})){return moveTo(a,tx,tz,sp,dt)}
  if(a.pt<=0||!a.path||!a.path.length||a.stuck>.8){a.pt=.8+Math.random()*.4;a.path=M.findPath(a.x,a.z,tx,tz)||[{x:tx,z:tz}];a.stuck=0}
  const w=a.path[0];if(!w)return true;if(moveTo(a,w.x,w.z,sp,dt)||Math.hypot(w.x-a.x,w.z-a.z)<.5)a.path.shift();return !a.path.length&&d<1}
// aangereden agent: even omver (zitten, sterretjes), dan weer overeind en verder
function knock(a){a.down=2.6;a.sees=0;a.sp=0;G.bubble&&G.bubble(a,'Au!',{col:'#a9c8ff'})}
function downStep(a,dt){a.down-=dt;const t=2.6-a.down;a.sp=0;
  if(t<.45){const k=1-t/.45,nx=a.x+(a.kvx||0)*dt*k,nz=a.z+(a.kvz||0)*dt*k;if(M.canStand(nx,a.z,.3))a.x=nx;if(M.canStand(a.x,nz,.3))a.z=nz;const q=t/.45;a.y=-.84*q;a.lean=-.6*q;a.legL=a.legR=-1.5*q}
  else if(a.down>.5){a.y=-.84;a.lean=-.5;a.legL=-1.5;a.legR=-1.3;a.armL=a.armR=.55;a.hy=Math.sin(t*5)*.45}
  else{const k=1-a.down/.5;a.y=-.84*(1-k);a.lean=-.5*(1-k);a.legL=a.legR=-1.5*(1-k);a.armL=a.armR=undefined}
  if(a.down<=0){a.down=0;a.y=0;a.lean=0;a.legL=a.legR=a.armL=a.armR=undefined;a.hy=0}}
function copStep(a,dt){const P=G.P;
  if(a.down>0){downStep(a,dt);return}
  if(a.st==='leave'){moveTo(a,a.away.x,a.away.z,3,dt);a.lt=(a.lt||0)+dt;if(a.lt>8||dist(a,P)>45)a.gone=1;return}
  const see=canSee(a);
  if(G.hidden&&see&&dist(a,P)<2&&Math.random()<dt*.25*2.5){caught();return}
  if(see&&!G.hidden){a.sees=1;P0.lkp={x:P.x,z:P.z};P0.seenAgo=0;P0.sawFirst=true;if(a.st!=='chase'){a.st='chase';G.bubble&&G.bubble(a,'!',{col:'#ff5a5a'});if(!a.saw){a.saw=true;G.snd&&G.snd.fx('whistle')}}}else a.sees=0;
  const sp=copSpeed();
  if(a.st==='chase'){if(see&&!G.hidden){goPath(a,P.x,P.z,sp,dt);if(dist(a,P)<1.1&&!G.driving)caught()}else{a.st='go';G.bubble&&G.bubble(a,'?',{col:'#ffd35a'})}}
  else if(a.st==='post'){a.sp=0;a.ry+=Math.sin(P0.t*1.3+a.ph)*dt*.4}
  else if(a.st==='go'){const l=P0.lkp||P;if(goPath(a,l.x,l.z,sp*.9,dt)||dist(a,l)<1.4){a.st='search';a.wp=null}}
  else if(a.st==='search'){const l=P0.lkp||P,Rr=20+10*P0.stars;if(!a.wp||goPath(a,a.wp.x,a.wp.z,3.6,dt)||dist(a,a.wp)<1.2||(a.stuck||0)>1.5){if(!a.wait){a.wait=rr(.8,2)}a.wait-=dt;a.sp=0;a.ry+=dt*1.5;if(a.wait<=0){a.wait=0;const q=M.nearestWalk(l.x+rr(-Rr,Rr),l.z+rr(-Rr,Rr),10);a.wp=q||l;a.path=null}}}}
/* ---------- wegversperringen ---------- */
// Zit de politie met twee of drie sterren achter je aan terwijl je rijdt, dan zetten ze verderop twee wagens dwars over de weg, met
// spijkermatten op de stoep ernaast. Rammen kan (met vaart): schade, een ster erbij, maar je bent erdoor. Over een mat rijden geeft
// lekke banden tot de achtervolging voorbij is. Stilstaan bij de versperring = gepakt. Omrijden of te voet verder kan altijd.
const BLK={cur:null,cd:6,n:0};
function edgeAhead(){const c=G.car;if(!c)return null;const fx=Math.sin(c.ry),fz=Math.cos(c.ry);let best=null,bs=-9;
  N.forEach(A=>A.n.forEach(B=>{const mx=(A.x+B.x)/2,mz=(A.z+B.z)/2,dx=mx-c.x,dz=mz-c.z,d=Math.hypot(dx,dz);if(d<55||d>125)return;const al=(dx*fx+dz*fz)/d;if(al<.75)return;
    const L=Math.hypot(B.x-A.x,B.z-A.z);if(L<18)return;const ux=(B.x-A.x)/L,uz=(B.z-A.z)/L;if(Math.abs(ux*fx+uz*fz)<.8)return;if(!roadOK(mx,mz)||!roadOK(mx-uz*3,mz+ux*3)||!roadOK(mx+uz*3,mz-ux*3))return;
    const sc=al*2-Math.abs(d-85)/85+Math.random()*.15;if(sc>bs){bs=sc;best={x:mx,z:mz,ux,uz}}}));return best}
let stripM=null;
function stripMesh(){return K.model([[2.6,.05,.55,0,.03,0,'#16171a'],[2.6,.06,.08,0,.09,-.16,'#c8ccd2',1],[2.6,.06,.08,0,.09,0,'#c8ccd2',1],[2.6,.06,.08,0,.09,.16,'#c8ccd2',1]],{noShadow:1})}
function coneMesh(){return K.model([[.42,.06,.42,0,.03,0,'#16171a'],[.3,.22,.3,0,.17,0,'#ff6a1a'],[.22,.1,.22,0,.33,0,'#f1efe9',1],[.16,.2,.16,0,.48,0,'#ff6a1a']],{noShadow:1})}
function blockPlace(e){if(!G.traf)return;const px=-e.uz,pz=e.ux,ry=Math.atan2(px,pz),sc=G.scene(),meshes=[];
  const cars=[-1,1].map(s=>{const c=G.traf.spawn(true,false);c.block=1;c.x=e.x+px*s*2.35;c.z=e.z+pz*s*2.35;c.ry=ry+(s>0?0:Math.PI);c.v=0;c.mesh.position.set(c.x,0,c.z);c.mesh.rotation.y=c.ry;return c});
  // je wijkagent op de loonlijst 'vergeet' één mat
  const w=G.wijk&&G.wijk.at(e.x,e.z),paid=!!(w&&G.smeer&&G.smeer.loon(w.id)),skip=paid?(Math.random()<.5?-1:1):0;
  const strips=[];[-1,1].forEach(s=>{if(s===skip)return;const x=e.x+px*s*5.6,z=e.z+pz*s*5.6;if(!M.walkable(x,z))return;const m=stripMesh();m.position.set(x,0,z);m.rotation.y=ry;sc.add(m);meshes.push(m);strips.push({x,z})});
  [[-1,-3.4],[1,-3.4],[-1,3.4],[1,3.4],[0,-4.2],[0,4.2]].forEach(([s,k])=>{const m=coneMesh();m.position.set(e.x+px*s*3.2+e.ux*k,0,e.z+pz*s*3.2+e.uz*k);sc.add(m);meshes.push(m)});
  const b={e,cars,strips,meshes,t:0,cops:[],vPrev:0,paid};[-1,1].forEach(s=>{const q=M.nearestWalk(e.x+px*s*5.2+e.ux*1.6,e.z+pz*s*5.2+e.uz*1.6,4);if(!q)return;const a=addCop(q.x,q.z);if(a){a.st='post';a.ry=Math.atan2(G.P.x-a.x,G.P.z-a.z);b.cops.push(a)}});
  BLK.cur=b;BLK.n++;banner('Wegversperring','bad');G.snd&&G.snd.fx('whistle');
  G.toast&&G.toast(paid?'Tip van je wijkagent: fuik verderop, één stoep is vrij':BLK.n<3?'Wegversperring verderop: rammen met vaart, omrijden of te voet verder':'Wegversperring verderop','bad')}
function blockClear(){const b=BLK.cur;if(!b)return;BLK.cur=null;b.cars.forEach(c=>{try{G.traf.remove(c)}catch(e){}});b.meshes.forEach(m=>G.scene().remove(m));
  b.cops.forEach(a=>{if(a.st==='post'){a.st='leave';a.away={x:a.x+rr(-20,20),z:a.z+rr(-20,20)};a.lt=0}})}
const landOK=(x,z)=>{x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return false;return M.ground[z*M.W+x]!==T.WATER};
function ram(b,c){b.hit=1;b.hitT=b.t;const px=-b.e.uz,pz=b.e.ux;b.cars.forEach(k=>{const s=((k.x-b.e.x)*px+(k.z-b.e.z)*pz)>0?1:-1;k.px=px*s;k.pz=pz*s;k.push=1.5;k.spin=s*1.6;k.noCol=1;k.x+=k.px*2.3;k.z+=k.pz*2.3;k.mesh.position.set(k.x,0,k.z)});
  c.v=Math.sign(c.v||1)*b.vPrev*.5;if(G.carDamage)G.carDamage(c,14);else c.dmg=Math.min(100,(c.dmg||0)+14);G.shake&&G.shake(1);G.hitStop=.1;G.snd&&G.snd.fx('hit');G.flash&&G.flash('#ffffff',.5);G.fx2&&G.fx2.burst(c.x,1,c.z,'#c8ccd2',14);
  P0.stars=clamp(P0.stars+1,1,3);need();hud();banner('Erdoorheen!','bad');G.ev&&G.ev('ram');G.carHud&&G.carHud();b.cops.forEach(a=>{if(a.st==='post')a.st='go'})}
function blockStep(dt){const b=BLK.cur;BLK.cd-=dt;
  if(!b){if(G.driving&&G.car&&P0.stars>=2&&P0.arrived&&BLK.cd<=0&&Math.abs(G.car.v)>6&&!(G.mission&&G.mission())){const e=edgeAhead();if(e){blockPlace(e);BLK.cd=24}else BLK.cd=3}return}
  b.t+=dt;const d=Math.hypot(G.P.x-b.e.x,G.P.z-b.e.z),c=G.driving&&G.car?G.car:null;
  if(d>175||b.t>75||(b.hit&&b.t>b.hitT+10)){blockClear();BLK.cd=b.hit?28:10;return}
  if(c){const v=Math.abs(c.v);
    if(!b.hit){const dl=(c.x-b.e.x)*b.e.ux+(c.z-b.e.z)*b.e.uz,dw=(c.x-b.e.x)*-b.e.uz+(c.z-b.e.z)*b.e.ux;if(Math.abs(dl)<4.2&&Math.abs(dw)<4.6&&b.vPrev>=13)ram(b,c)}
    b.strips.forEach(s=>{if(!s.used&&Math.hypot(c.x-s.x,c.z-s.z)<2.2&&v>3){s.used=1;if(!c.flat){c.flat=1;G.toast&&G.toast('Lekke banden! Je auto trekt niet meer','bad');G.snd&&G.snd.fx('hit');G.shake&&G.shake(.5);G.carHud&&G.carHud()}}});
    if(!b.hit&&d<8.5&&v<2.5){b.hold=(b.hold||0)+dt;if(b.hold>1.8){caught();return}}else b.hold=0;b.vPrev=v}else b.vPrev=0;
  // bij de versperring zien ze je aankomen
  if(d<42&&!G.hidden&&los(b.e,G.P)){P0.lkp={x:G.P.x,z:G.P.z};P0.seenAgo=0;P0.sawFirst=true}
  // geramde wagens schuiven opzij; staan ze boven het water (een brug), dan gaan ze eroverheen
  if(b.hit)b.cars.forEach(k=>{if(k.push>0){k.x+=k.px*k.push*dt*4;k.z+=k.pz*k.push*dt*4;k.ry+=k.spin*k.push*dt;k.push-=dt*1.8}
    if(!landOK(k.x,k.z)&&!k.sunk){k.vy=(k.vy||0)+16*dt;k.y=(k.y||0)-k.vy*dt;k.mesh.rotation.z=(k.mesh.rotation.z||0)+dt*1.4*(k.spin>0?1:-1);if(k.y<-1&&!k.spl){k.spl=1;G.snd&&G.snd.fx('splash');G.fx2&&G.fx2.burst(k.x,.3,k.z,'#a9dcff',16)}if(k.y<-3.5){k.sunk=1;k.mesh.visible=false}}
    k.mesh.position.set(k.x,k.y||0,k.z);k.mesh.rotation.y=k.ry})}
G.police.blok=()=>BLK.cur?{x:BLK.cur.e.x,z:BLK.cur.e.z}:null;G.police._b={BLK,edgeAhead,blockPlace,blockClear};G.police.knock=knock;
/* ---------- verstoppen ---------- */
function hideNear(){const P=G.P;let best=null,bd=2.1;M.hides.forEach(h=>{let d;if(h.r){const dx=Math.max(0,Math.abs(P.x-h.x)-h.r[0]),dz=Math.max(0,Math.abs(P.z-h.z)-h.r[1]);d=Math.hypot(dx,dz)+.6}else d=Math.hypot(P.x-h.x,P.z-h.z);if(d<bd){bd=d;best=h}});return best}
G.police.tryHide=function(){if(G.hidden){G.unhide();return true}if(!P0.on||G.driving)return false;const h=hideNear();if(!h)return false;G.hidden=true;G.ev&&G.ev('verstop');G.stopPath&&G.stopPath();G.snd&&G.snd.fx('hide');hud();return true};
G.unhide=()=>{if(!G.hidden)return;G.hidden=false;G.snd&&G.snd.fx('hide');hud()};
/* ---------- gepakt of ontkomen ---------- */
function caught(){if(!P0.on||P0.ending)return;P0.ending=true;const mode=P0.mode,res=P0.res,ref=P0.ref;G.snd&&G.snd.fx('caught');G.shake&&G.shake(1);G.hitStop=.12;G.hidden=false;
  if(navigator.vibrate)try{navigator.vibrate([80,40,80])}catch(e){}
  const stars0=P0.stars,cp=P0.cops.slice().sort((a,b)=>dist(a,G.P)-dist(b,G.P))[0];
  banner('Gepakt','bad');end(false);
  const go=()=>{if(mode==='flee'){window.__chase=false;res&&res(false);return}
    if(G.zakLeeg)G.zakLeeg('De politie neemt je spullen in beslag');
    if(mode==='wanted'){if(typeof policeRaid==='function'&&!policeRaid())G.toast&&G.toast('De agent laat je gaan','ok');return}
    if(ref&&typeof crimeFail==='function'){crimeFail(ref,'Straatroof. ')}else if(typeof arrest==='function')arrest(120,'Gepakt!','De politie heeft je te pakken.',{flow:true,cat:'straat'})};
  // alleen in de Pixelstad: je kunt de agent een envelop aanbieden (stad-smeer.js). Mislukt het, dan volgt de gewone arrestatie.
  if(G.smeer&&G.smeer.kan(mode,stars0)&&!G.driving){if(cp){cp.st='post';cp.sp=0;cp.ry=Math.atan2(G.P.x-cp.x,G.P.z-cp.z)}const weg=()=>{if(cp&&cp.st==='post'){cp.st='leave';cp.lt=0}};
    setTimeout(()=>{G.smeer.aanbod({mode,stars:stars0,look:cp&&cp.look,nm:cp&&cp.nm}).then(ok=>{weg();if(ok){G.toast&&G.toast(mode==='wanted'?'De agent kijkt weg. Je staat nog wel op de gezochtlijst.':'De agent kijkt de andere kant op. Je bent vrij.','ok');if(typeof log==='function')log('Agent omgekocht bij een aanhouding in de Pixelstad','ok')}else setTimeout(go,250)}).catch(()=>{weg();go()})},450);return}
  setTimeout(go,450)}
function escaped(){if(!P0.on||P0.ending)return;P0.ending=true;const mode=P0.mode,res=P0.res;G.ev&&(G.ev('ontsnap'),P0.stars>=3&&G.ev('ontsnap3'));G.snd&&G.snd.fx('ok');banner('Ontkomen','ok');
  end(true);
  if(mode==='flee'){window.__chase=false;res&&res(true);return}
  try{if(typeof addXp==='function')addXp(3);S.cred=(S.cred||0)+1;S.stats=S.stats||{};S.stats.ontsnapt=(S.stats.ontsnapt||0)+1;save()}catch(e){}
  G.toast&&G.toast(mode==='wanted'?'Je bent ze kwijt. Je staat nog wel op de gezochtlijst.':'Je bent de politie kwijt. +3 XP','ok');if(typeof log==='function')log('In de Pixelstad de politie afgeschud','ok')}
function end(calm){const P=G.P;blockClear();try{(G.vehicles||[]).forEach(v=>{v.flat=0})}catch(e){}P0.cops.forEach(a=>{a.st='leave';const ang=Math.atan2(a.x-P.x,a.z-P.z);a.away={x:a.x+Math.sin(ang)*30,z:a.z+Math.cos(ang)*30};a.lt=0});
  P0.cars.forEach(c=>{c.leaving=true;c.t0=0});P0.on=false;P0.res=null;P0.stars=0;P0.lkp=null;G.useStam=false;G.hidden=false;setTimeout(()=>{P0.ending=false},600);hud(false)}
/* ---------- elke frame ---------- */
let sirenK=0;
function step(dt){// opruimen van vertrekkende agenten en auto's
  P0.cops=P0.cops.filter(a=>{if(a.gone){removeCop(a);return false}return true});
  P0.cars=P0.cars.filter(c=>{if(c.gone){G.traf&&G.traf.remove(c);return false}return true});
  P0.cops.forEach(a=>{if(a.st==='leave')copStep(a,dt)});
  if(!P0.on){sirenOut();return}
  P0.t+=dt;if(P0.dispatchT>0)P0.dispatchT-=dt;
  P0.cops.forEach(a=>{if(a.st!=='leave')copStep(a,dt)});if(!P0.on)return;
  // de auto ziet je ook (als hij rijdt)
  const carSees=P0.cars.some(c=>!(c.wait>0)&&!c.leaving&&dist(c,G.P)<(G.driving?40:20)&&los(c,G.P)&&!G.hidden);if(carSees){P0.lkp={x:G.P.x,z:G.P.z};P0.seenAgo=0;P0.sawFirst=true}
  // de teller 'uit het zicht' loopt pas als de politie er is (of na 20 s wachten op een vastgelopen auto)
  if(!P0.arrived&&P0.dispatchT<=0){P0.wt=(P0.wt||0)+dt;if(P0.wt>20)P0.arrived=true}
  const counting=P0.arrived||P0.cops.length>0;
  if(counting){const seen=P0.cops.some(a=>a.sees)||carSees;if(!seen)P0.seenAgo+=dt*(G.hidden?2:1)}
  try{blockStep(dt)}catch(e){console.error(e)}if(!P0.on)return;
  if(counting&&P0.seenAgo>=loseT()){escaped();return}
  // sirene en blauw-rood aan de rand van het scherm
  let nd=1e9,nc=null;P0.cars.forEach(c=>{if(c.wait>0||c.leaving)return;const d=dist(c,G.P);if(d<nd){nd=d;nc=c}});
  if(nc&&G.snd){const dx=nc.x-G.P.x,dz=nc.z-G.P.z,rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw);G.snd.siren(nd,(dx*rx+dz*rz)/Math.max(1,nd))}else sirenOut();
  document.body.classList.toggle('sd-siren',nd<35);
  sirenK+=dt;if(sirenK>.15){sirenK=0;hud()}}
function sirenOut(){if(G.snd)G.snd.siren(null);document.body.classList.remove('sd-siren')}
/* ---------- HUD: sterren, wat de politie doet, adem ---------- */
const box=document.createElement('div');box.className='sd-pur';box.id='sdPur';box.hidden=true;
box.innerHTML=`<div class="sd-pur-h"><b id="sdPurS"></b><span id="sdPurT"></span></div><i class="sd-pur-l" title="Uit het zicht"><i id="sdPurL"></i></i><div class="sd-stam"><small>Adem</small><i><i id="sdStam"></i></i></div>`;
document.body.appendChild(box);
const hp=document.createElement('button');hp.className='sd-npcp sd-hidep';hp.hidden=true;document.body.appendChild(hp);hp.addEventListener('click',()=>G.police.tryHide());
const V3=new TH.Vector3();
function hud(show){if(show===false){box.hidden=true;hp.hidden=true;document.body.classList.remove('stad-pur');return}if(!P0.on)return;box.hidden=false;document.body.classList.add('stad-pur');
  $s('sdPurS').innerHTML='★'.repeat(P0.stars)+'<i>'+'★'.repeat(3-P0.stars)+'</i>';
  const seen=P0.seenAgo<.6&&P0.sawFirst,t=P0.dispatchT>0?'Politie komt · '+Math.ceil(P0.dispatchT)+' s':!P0.arrived?'Politie komt eraan':G.hidden?'Verstopt':seen?'Ze zien je!':'Ze zoeken je';
  $s('sdPurT').textContent=t;box.classList.toggle('seen',seen&&!G.hidden);box.classList.toggle('hid',!!G.hidden);
  $s('sdPurL').style.width=clamp(P0.seenAgo/loseT(),0,1)*100+'%';$s('sdStam').style.width=clamp(G.stam,0,1)*100+'%';box.querySelector('.sd-stam').classList.toggle('low',G.stam<.25);
  // knop/prompt bij een verstopplek
  const h=!G.driving&&!G.hidden&&hideNear();if(h||G.hidden){const p=G.hidden?G.P:h;V3.set(p.x,G.hidden?1.6:1.9,p.z).project(G.camera());hp.hidden=false;hp.style.left=(V3.x*.5+.5)*innerWidth+'px';hp.style.top=(-V3.y*.5+.5)*innerHeight+'px';
    hp.innerHTML=`<kbd>${touch?'Tik':'E'}</kbd><span>${G.hidden?'Tevoorschijn komen':'Verstoppen'}</span>`}else hp.hidden=true}
G.police.dots=()=>{const out=[];if(P0.on&&P0.lkp&&!(P0.seenAgo<.6))out.push({x:P0.lkp.x,z:P0.lkp.z,r:20+10*P0.stars,c:'#4d7dff'});P0.cops.forEach(a=>{if(a.st!=='leave')out.push({x:a.x,z:a.z,c:a.sees?'#ff3d52':'#4d7dff'})});P0.cars.forEach(c=>{if(!(c.wait>0)&&!c.leaving)out.push({x:c.x,z:c.z,c:'#4d7dff'})});if(BLK.cur)BLK.cur.cars.forEach(c=>out.push({x:c.x,z:c.z,c:'#ffffff'}));return out};
/* ---------- koppelen ---------- */
const wait=setInterval(()=>{if(!G.ready)return;clearInterval(wait);const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},200);
// vluchten bij een arrestatie: in de stad (behalve een achtervolging met de auto, die blijft het klikspel-scherm)
const orig=window.escapeGame;window.escapeGame=function(level,opts){if(!G.ready||(opts&&opts.chase))return orig?orig(level,opts):fleeGame(level,opts);return flee(level,opts)};
let banT=0;function banner(t,c){const a=$s('sdArea');if(!a)return;a.querySelector('small').textContent='Politie';a.querySelector('b').textContent=t;a.hidden=false;a.classList.toggle('bad',c==='bad');a.classList.remove('go');void a.offsetWidth;a.classList.add('go');clearTimeout(banT);banT=setTimeout(()=>{a.hidden=true;a.classList.remove('bad')},2600)}
})();
