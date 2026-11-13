// Pixelstad: de fiets (verhaal "De Bezorger" en de bijbaan in de Stad).
// - Een pixelfiets van blokjes: frame, spatborden, draaiende spaken, trappers, ketting die meeloopt, bel, lampjes en twee rode
//   bezorgtassen (voor en achter) waar je de pizzadozen in ziet zitten. Op de fiets zit je eigen poppetje (G.avatarMake(), in het
//   verhaal dus Luca) met echte knieën: het trapt mee, gaat staan bij een sprint en zet een voet neer als je stilstaat.
// - Rijden: sneller dan rennen, trager dan een auto, wendbaar. Op de stoep, door parken, stegen en over parkpaden mag het (auto's
//   niet). Shift (of de stick helemaal uit) = staand trappen: sneller, kost adem. B = bel. F = afstappen. Gras en zand zijn
//   zwaar, zand en een natte weg zijn glad (G.weerFx().grip). Met lading (G.fiets.last(n)) stuurt hij trager en remt hij langer.
// - Balans (G.fiets.balans): bij tramrails onder een schuine hoek en bij stoepranden met vaart kantelt de tas. Stuur tegen tot
//   hij weer recht hangt. Lukt het niet, dan schuift er een pizza scheef (G.fiets.onScheef, de bezorging telt het).
// - Werkt met de bestaande voertuigen: G.driving=true en G.car=de fiets, zodat camera (boven/achter/ogen), politie, verkeer dat
//   remt en deuren gewoon werken. De camera achter en door je ogen wordt hier bijgesteld voor de fiets (dichterbij, hoger).
// API: G.fiets.spawn(x,z,ry,{kleur}) · op() · af() · actief() · last(n) · balans(o)→Promise<bool> · bel() · scheef() ·
//      pos() · weg() · rails · onVal/onScheef/onOp/onAf (callbacks).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const T=M.T,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const wrap=a=>{while(a>Math.PI)a-=Math.PI*2;while(a<-Math.PI)a+=Math.PI*2;return a};
const story=()=>{try{return !!(G.story&&G.story.on&&G.story.on())}catch(e){return false}};
const ease=()=>{try{return G.vak?G.vak.ease('bezorgen'):0}catch(e){return 0}};
const toast=(t,c)=>{try{G.toast&&G.toast(t,c||'info')}catch(e){}};
const float=(t,x,z,c)=>{try{G.fx2&&G.fx2.float(t,x,z,c)}catch(e){}};

/* =================== blokjes samenvoegen (één tekenopdracht per onderdeel) =================== */
const ML=new TH.MeshLambertMaterial({vertexColors:true}),MB=new TH.MeshBasicMaterial({vertexColors:true});
const _m=new TH.Matrix4(),_q=new TH.Quaternion(),_e=new TH.Euler(),_v=new TH.Vector3(),_s=new TH.Vector3(1,1,1),_c=new TH.Color(),UP=new TH.Vector3(0,1,0),DOWN=new TH.Vector3(0,-1,0);
function Kit(){this.A=[[],[],[]];this.B=[[],[],[]]}
Kit.prototype.box=function(w,h,d,x,y,z,col,glow,rx,ry,rz){const g=new TH.BoxGeometry(w,h,d).toNonIndexed();_e.set(rx||0,ry||0,rz||0);_q.setFromEuler(_e);_m.compose(_v.set(x,y,z),_q,_s);g.applyMatrix4(_m);this._add(g,col,glow);return this};
// buis van a naar b (dikte t), voor het frame
Kit.prototype.tube=function(a,b,t,col,glow){const d=new TH.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),L=d.length();const g=new TH.BoxGeometry(t,L,t).toNonIndexed();_q.setFromUnitVectors(UP,d.normalize());
  _m.compose(_v.set((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2),_q,_s);g.applyMatrix4(_m);this._add(g,col,glow);return this};
Kit.prototype._add=function(g,col,glow){const P=g.attributes.position.array,N=g.attributes.normal.array,D=glow?this.B:this.A;_c.set(col);
  for(let i=0;i<P.length;i+=3){D[0].push(P[i],P[i+1],P[i+2]);D[1].push(N[i],N[i+1],N[i+2]);D[2].push(_c.r,_c.g,_c.b)}g.dispose()};
Kit.prototype.mesh=function(shadow){const grp=new TH.Group();[[this.A,ML,shadow!==false],[this.B,MB,false]].forEach(([D,mat,sh])=>{if(!D[0].length)return;const g=new TH.BufferGeometry();
  g.setAttribute('position',new TH.Float32BufferAttribute(D[0],3));g.setAttribute('normal',new TH.Float32BufferAttribute(D[1],3));g.setAttribute('color',new TH.Float32BufferAttribute(D[2],3));
  const m=new TH.Mesh(g,mat);m.castShadow=sh;m.receiveShadow=false;grp.add(m)});return grp};
// ring van blokjes (wiel, spatbord): n stukjes op straal r rond de x-as, van hoek a0 tot a1
Kit.prototype.ring=function(r,t,w,n,col,x,cy,cz,a0,a1){a0=a0||0;a1=a1==null?Math.PI*2:a1;const full=Math.abs(a1-a0)>=6.28,seg=(a1-a0)/n,len=Math.abs(seg)*r*1.08;
  for(let i=0;i<n+(full?0:0);i++){const a=a0+seg*(i+.5);this.box(w,t,len,x,cy+Math.sin(a)*r,cz+Math.cos(a)*r,col,0,Math.PI/2-a,0,0)}return this};

/* =================== de fiets =================== */
const R=.4,AX_R=-.62,AX_F=.64,BB=[0,.38,-.02],GEAR=2.3,CR=.17;
const RED='#c62a22',RED2='#8f1a15',WHITE='#f1ece0',GREEN='#1f7a3e',KRAFT='#e3cfa2',KRAFT2='#c9b27f';
function wheelMesh(){const k=new Kit();
  k.ring(R-.035,.075,.075,18,'#18191c',0,0,0);                     // band
  k.ring(R-.09,.035,.05,18,'#c9cfd6',0,0,0);                       // velg
  for(let i=0;i<6;i++){const a=i/6*Math.PI;k.box(.016,(R-.1)*2,.016,0,0,0,'#aeb4bb',0,a,0,0)}// spaken (12)
  k.box(.12,.07,.07,0,0,0,'#5a5f66');k.box(.02,.05,.05,0,R-.04,0,'#d6a63e');// naaf, ventiel
  return k.mesh()}
function crankMesh(){const k=new Kit(),x=.11;
  // kettingblad met tandjes, en de crankarmen naar de trappers
  k.ring(.12,.035,.03,12,'#9aa1a9',x,0,0);k.box(.03,.2,.03,x,0,0,'#7c838b');k.box(.03,.03,.2,x,0,0,'#7c838b');
  k.box(.035,CR+.03,.035,x+.03,-CR/2,0,'#2a2c30');k.box(.035,CR+.03,.035,-x-.03,CR/2,0,'#2a2c30');k.box(.24,.04,.04,0,0,0,'#2a2c30');
  return k.mesh()}
function pedalMesh(){const k=new Kit();k.box(.13,.035,.075,0,0,0,'#1c1d20');k.box(.135,.012,.08,0,.02,0,'#5a5f66');return k.mesh()}
// tas: rood, met een wit-groene band en het logo, open aan de bovenkant (de klep ligt naar achteren)
function bagMesh(w,h,d,front){const k=new Kit(),t=.035;
  k.box(w,.04,d,0,.02,0,RED2);                                              // bodem
  k.box(t,h,d,-w/2+t/2,h/2,0,RED);k.box(t,h,d,w/2-t/2,h/2,0,RED);          // zijkanten
  k.box(w,h,t,0,h/2,d/2-t/2,RED);k.box(w,h,t,0,h/2,-d/2+t/2,RED);          // voor en achter
  k.box(w+.01,.06,d+.01,0,h*.55,0,WHITE);                                    // witte band rondom
  [[GREEN,-.07],[WHITE,0],[RED,.07]].forEach(([c,o])=>{k.box(w+.016,.05,.06,0,h*.55,o+(front?.0:0),c)});// vlaggetje op de zijkant
  k.box(w+.015,.035,d+.015,0,h-.0175,0,'#e8e4da');                          // witte rand bovenop (isolatie)
  k.box(w*.36,.1,.01,0,h*.3,d/2+.008,WHITE);k.box(w*.22,.06,.012,0,h*.3,d/2+.012,RED2);// logo voorop: BN-plaatje
  if(front)k.box(w,.025,d*.55,0,h-.06,d/2+d*.2,RED,0,1.15,0,0);else k.box(w,.025,d*.62,0,h+.08,-d/2-d*.22,RED,0,-.95,0,0);// klep: voor hangt hij naar voren, achter staat hij open
  k.box(.02,.03,.02,-w/2+.06,h+.01,d/2-.04,'#2a2c30');k.box(.02,.03,.02,w/2-.06,h+.01,d/2-.04,'#2a2c30');// clipjes
  return k.mesh()}
function boxMesh(){const k=new Kit(),w=.42,h=.07;k.box(w,h,w,0,h/2,0,KRAFT);k.box(w+.004,.012,w+.004,0,h-.006,0,KRAFT2);
  k.box(.2,.005,.2,0,h+.002,0,'#c0352a');k.box(.1,.006,.1,0,h+.004,0,'#f1ece0');k.box(.05,.007,.05,.03,h+.006,-.03,GREEN);// opdruk: tomaat, mozzarella, basilicum
  return k.mesh()}
function frameMesh(col){const k=new Kit(),t=.07,ST=[0,1.0,-.3],HT=[0,1.0,.42],HB=[0,.74,.47],c2=new TH.Color(col).multiplyScalar(.7).getStyle();
  k.tube(BB,ST,t,col);k.tube(ST,HT,t,col);k.tube(BB,HB,t*1.1,col);k.tube(HB,HT,t*1.2,c2);
  [-1,1].forEach(s=>{k.tube([s*.06,BB[1],BB[2]],[s*.075,R,AX_R],.045,col);k.tube([s*.04,.93,-.28],[s*.075,R,AX_R],.045,col)});
  k.box(.05,.12,.05,0,1.03,-.3,'#2a2c30');k.box(.17,.06,.3,0,1.08,-.34,'#2a2420');k.box(.1,.04,.12,0,1.07,-.2,'#2a2420');// zadelpen en zadel
  k.box(.09,.09,.1,0,BB[1],BB[2],'#2a2c30');                                  // trapas
  k.box(.04,.04,.06,.075,R,AX_R,'#5a5f66');k.box(.04,.04,.06,-.075,R,AX_R,'#5a5f66');// achterpad
  k.ring(.065,.03,.025,8,'#9aa1a9',.1,R,AX_R);                                 // achtertandwiel
  // spatbord achter (met rode reflector) en bagagedrager met de grote tas
  k.ring(R+.06,.03,.1,10,col,0,R,AX_R,.35,Math.PI+.3);k.box(.06,.06,.02,0,R+.22,AX_R-.42,'#ff3a2a',1);
  k.box(.5,.03,.5,0,.86,-.62,'#2a2c30');k.tube([.18,.86,-.4],[.07,R,AX_R],.03,'#2a2c30');k.tube([-.18,.86,-.4],[-.07,R,AX_R],.03,'#2a2c30');
  k.tube([.18,.86,-.86],[.07,R,AX_R],.03,'#2a2c30');k.tube([-.18,.86,-.86],[-.07,R,AX_R],.03,'#2a2c30');k.box(.07,.05,.03,0,.82,-.88,'#ff3a2a',1);// achterlicht
  // voordrager (vast aan het frame, stuurt niet mee) voor de voortas
  k.box(.46,.03,.46,0,.92,.8,'#2a2c30');k.tube([0,.9,.48],[0,.92,.62],.04,'#2a2c30');k.tube([.16,.92,.98],[.06,.55,.6],.03,'#2a2c30');k.tube([-.16,.92,.98],[-.06,.55,.6],.03,'#2a2c30');
  k.box(.1,.08,.06,0,.86,1.04,'#e8e4da');k.box(.07,.05,.02,0,.86,1.075,'#fff6d0',1);// koplamp
  // kettingkast-lijn: boven- en onderpart van de ketting
  k.tube([.1,BB[1]+.12,BB[2]],[.1,R+.065,AX_R],.018,'#3a3d42');k.tube([.1,BB[1]-.12,BB[2]],[.1,R-.065,AX_R],.018,'#3a3d42');
  return k.mesh()}
function frontMesh(col){const k=new Kit();// voorvork, stuur, handvatten (in de stuurgroep, oorsprong bij de balhoofdbuis)
  const top=[0,0,0],ax=[0,R-1.0+.0,AX_F-.44];// balhoofd boven (0,1,.44) → as
  [-1,1].forEach(s=>k.tube([s*.06,-.24,.03],[s*.07,ax[1],ax[2]],.045,col));k.box(.16,.05,.08,0,-.24,.03,col);
  k.tube(top,[0,.22,-.06],.05,'#3a3d42');k.box(.62,.04,.04,0,.24,-.08,'#3a3d42');
  [-1,1].forEach(s=>{k.box(.04,.04,.14,s*.31,.24,-.14,'#3a3d42');k.box(.06,.06,.13,s*.31,.24,-.24,'#1b1c1f')});
  k.ring(R+.06,.03,.1,8,col,0,ax[1],ax[2],-.15,2.3);                    // spatbord voor
  k.box(.03,.03,.04,0,ax[1],ax[2],'#5a5f66');
  return k.mesh()}
function bellMesh(){const k=new Kit();k.box(.09,.035,.09,0,0,0,'#e8c547');k.box(.06,.03,.06,0,.03,0,'#f5e08a');k.box(.02,.02,.04,.05,.0,0,'#5a5f66');return k.mesh()}
function standMesh(){const k=new Kit();k.tube([0,0,0],[.0,-.38,-.06],.035,'#2a2c30');return k.mesh()}

// lichtvlek van de koplamp: een waaier die naar voren uitloopt, in pixelringen
let BEAMT=null;function beamTex(){if(BEAMT)return BEAMT;const cv=document.createElement('canvas');cv.width=16;cv.height=24;const c=cv.getContext('2d');
  for(let y=0;y<24;y++)for(let x=0;x<16;x++){const t=y/23,half=1.5+t*6.5,dx=Math.abs(x-7.5);if(dx>half)continue;const v=(1-t)*.85*(1-dx/half*.6);const q=Math.floor(v*4)/4;if(q<=0)continue;c.fillStyle='rgba(255,240,200,'+q+')';c.fillRect(x,y,1,1)}
  BEAMT=new TH.CanvasTexture(cv);BEAMT.magFilter=BEAMT.minFilter=TH.NearestFilter;return BEAMT}
function buildBike(o){o=o||{};const col=o.kleur||'#2d6c8c';
  const root=new TH.Group(),lean=new TH.Group();root.add(lean);
  lean.add(frameMesh(col));
  const steer=new TH.Group();steer.position.set(0,1.0,.44);lean.add(steer);steer.add(frontMesh(col));
  const wF=wheelMesh();wF.position.set(0,R-1.0,AX_F-.44);steer.add(wF);
  const bell=bellMesh();bell.position.set(-.22,.29,-.12);steer.add(bell);
  const wR=wheelMesh();wR.position.set(0,R,AX_R);lean.add(wR);
  const crank=crankMesh();crank.position.set(BB[0],BB[1],BB[2]);lean.add(crank);
  const pedL=pedalMesh(),pedR=pedalMesh();lean.add(pedL,pedR);
  // kettingschakels die meelopen (boven en onder)
  const lk=new Kit();lk.box(.022,.03,.05,0,0,0,'#c9cfd6');const linkProto=lk.mesh(false);const links=[];for(let i=0;i<12;i++){const m=linkProto.clone();lean.add(m);links.push(m)}
  const stand=standMesh();stand.position.set(.09,BB[1],BB[2]-.1);lean.add(stand);
  // tassen en dozen
  const bagR=bagMesh(.56,.4,.5,false);bagR.position.set(0,.875,-.62);lean.add(bagR);
  const bagF=bagMesh(.5,.33,.44,true);bagF.position.set(0,.935,.8);lean.add(bagF);
  const proto=boxMesh(),boxes={F:[],R:[]};
  for(let i=0;i<4;i++){const a=proto.clone(),b=proto.clone();a.position.set(0,.935+.045+i*.075,.8);b.position.set(0,.875+.045+i*.075,-.62);lean.add(a,b);boxes.F.push(a);boxes.R.push(b);a.visible=b.visible=false}
  // koplamp-bundel 's nachts
  const beam=new TH.Mesh(new TH.PlaneGeometry(3,5),new TH.MeshBasicMaterial({map:beamTex(),color:0xfff2c8,transparent:true,opacity:0,depthWrite:false,blending:TH.AdditiveBlending}));beam.rotation.x=-Math.PI/2;beam.position.set(0,.04,3.4);root.add(beam);
  root.traverse(m=>{if(m.isMesh&&m.material===ML)m.castShadow=true});
  return {root,lean,steer,wF,wR,crank,pedL,pedR,links,stand,bagF,bagR,boxes,bell,beam,col}}
// los decorfietsje (voor het rek bij de pizzeria): alles samengevoegd tot één model
function decorBike(col,bags){const b=buildBike({kleur:col});b.stand.visible=true;b.lean.rotation.z=-.12;posePedals(b,0,0);b.links.forEach(l=>l.visible=false);
  if(!bags){b.bagF.visible=false}b.beam.visible=false;return bake(b.root)}
// alles van één fiets samenvoegen tot één model (decor: scheelt tekenopdrachten)
function bake(root){root.updateMatrixWorld(true);const inv=new TH.Matrix4().copy(root.matrixWorld).invert(),D={ML:[[],[],[]],MB:[[],[],[]]},m=new TH.Matrix4(),nm=new TH.Matrix3();
  root.traverse(o=>{if(!o.isMesh||(o.material!==ML&&o.material!==MB))return;let v=o;while(v){if(!v.visible)return;if(v===root)break;v=v.parent}
    m.multiplyMatrices(inv,o.matrixWorld);nm.getNormalMatrix(m);const g=o.geometry,P=g.attributes.position,N=g.attributes.normal,C=g.attributes.color,T=D[o.material===ML?'ML':'MB'];
    for(let i=0;i<P.count;i++){_v.fromBufferAttribute(P,i).applyMatrix4(m);T[0].push(_v.x,_v.y,_v.z);_v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();T[1].push(_v.x,_v.y,_v.z);T[2].push(C.getX(i),C.getY(i),C.getZ(i))}});
  const k=new Kit();k.A=D.ML;k.B=D.MB;return k.mesh()}
G.fietsModel=decorBike;

/* =================== de berijder: jouw poppetje met knieën =================== */
const ARM=.87,HIPW=.18,THIGH=.5,SHIN=.5;
function legSeg(len,w,d,col){const g=new TH.Group(),k=new Kit();k.box(w,len,d,0,-len/2,0,col);g.add(k.mesh());return g}
function findParts(g){const ud=g.userData&&g.userData.P;if(ud)return ud;const root=g.children[0];if(!root)return null;
  const gr=root.children.filter(c=>c.isGroup);if(gr.length<3)return null;const legL=gr[0],legR=gr[1],torso=gr[2];
  const tg=torso.children.filter(c=>c.isGroup);// rugzak, armL, armR, hoofd
  return {root,legL,legR,torso,bag:tg[0],armL:tg[1],armR:tg[2],head:tg[tg.length-1]}}
function lookKey(){let k='';try{k=JSON.stringify(G.P.look||{})}catch(e){}try{k+=JSON.stringify((S.fit&&S.fit.wear)||{})}catch(e){}try{k+=typeof karGet==='function'?JSON.stringify(karGet()):''}catch(e){}
  try{if(G.avatarSpec)k+=JSON.stringify(G.avatarSpec()||'')}catch(e){}try{if(G.uiterlijk&&G.uiterlijk.key)k+=G.uiterlijk.key()}catch(e){}return k+(story()?'V':'S')}
function buildRider(){let g=null,P=null;try{if(G.avatarBuild){const r=G.avatarBuild();g=r.g;P=r.P}else g=G.avatarMake?G.avatarMake():null}catch(e){console.error(e)}if(!g)return null;P=P&&P.legL&&P.torso?P:findParts(g);if(!P)return null;
  const colOf=(grp,i,d)=>{try{const m=grp.children.filter(c=>c.isMesh)[i];return '#'+m.material.color.getHexString()}catch(e){return d}};
  const pants=colOf(P.legL,0,'#1d2531'),shoe=colOf(P.legL,1,'#3a3f48'),sole=colOf(P.legL,2,'#e8e4da');
  P.legL.visible=P.legR.visible=false;P.bag.visible=false;
  const L={};['L','R'].forEach(s=>{const th=legSeg(THIGH,.31,.35,pants),sh=legSeg(SHIN,.29,.32,pants),ft=new TH.Group(),k=new Kit();
    k.box(.33,.17,.46,0,.02,.07,shoe);k.box(.34,.05,.47,0,-.06,.07,sole);ft.add(k.mesh());L[s]={th,sh,ft}});
  g.traverse(m=>{if(m.isMesh)m.castShadow=true});
  return {g,P,L,key:lookKey()}}
const _a=new TH.Vector3(),_b=new TH.Vector3(),_d=new TH.Vector3(),_w=new TH.Vector3(),_k=new TH.Vector3(),FWD=new TH.Vector3(0,0,1);
// twee botten: heup H → knie → enkel E, knie naar voren (of opzij met hint)
function ik(leg,H,E,hint){_d.subVectors(E,H);let d=_d.length();const max=THIGH+SHIN-.005;if(d>max){_d.multiplyScalar(max/d);d=max}if(d<.12)d=.12;const u=_d.clone().normalize();
  _w.copy(hint||FWD).addScaledVector(u,-(hint||FWD).dot(u));if(_w.lengthSq()<1e-6)_w.set(0,0,1);_w.normalize();
  const ca=clamp((THIGH*THIGH+d*d-SHIN*SHIN)/(2*THIGH*d),-1,1),sa=Math.sqrt(1-ca*ca);
  const td=u.clone().multiplyScalar(ca).addScaledVector(_w,sa);_k.copy(H).addScaledVector(td,THIGH);
  leg.th.position.copy(H);leg.th.quaternion.setFromUnitVectors(DOWN,td);
  _a.copy(H).add(_d);const sd=_b.subVectors(_a,_k).normalize();leg.sh.position.copy(_k);leg.sh.quaternion.setFromUnitVectors(DOWN,sd);
  leg.ft.position.copy(_a)}

/* =================== toestand =================== */
const F={bike:null,on:false,rider:null,last:0,scheef:0,adem:1,sprint:false,bal:null,val:0,ring:0,
  dbg:{ped:0,wall:0,car:0},x:0,z:0,ry:0,v:0,lat:0,lean:0,steerV:0,crank:0,wheel:0,bump:0,bumpV:0,tick:0,prevT:null,curbCd:0,railCd:0,surf:'',ogen:false,prevCar:null,kleur:null};
const bikeObj={fiets:1,x:0,z:0,ry:0,v:0,d:{name:'Fiets',max:14},dmg:0,kind:'city',mesh:null};
// welke kant: lokaal +x is links van de berijder
function posePedals(b,phase,pedalOn){const x=.16;
  const pr=[BB[1]+Math.sin(phase)*CR,BB[2]+Math.cos(phase)*CR],pl=[BB[1]-Math.sin(phase)*CR,BB[2]-Math.cos(phase)*CR];
  b.crank.rotation.x=-phase+Math.PI/2;b.pedL.position.set(x,pl[0],pl[1]);b.pedR.position.set(-x,pr[0],pr[1]);
  return {L:pl,R:pr}}
// de ketting: 12 schakels lopen rond (boven naar achter, onder naar voren)
function chainStep(b,phase){const n=b.links.length,top=[[.1,BB[1]+.12,BB[2]],[.1,R+.065,AX_R]],bot=[[.1,R-.065,AX_R],[.1,BB[1]-.12,BB[2]]];
  b.links.forEach((m,i)=>{let u=((i/n)+phase*.22)%1;if(u<0)u+=1;const s=u<.5?top:bot,t=(u%.5)*2;m.position.set(.1,s[0][1]+(s[1][1]-s[0][1])*t,s[0][2]+(s[1][2]-s[0][2])*t);
    m.rotation.x=Math.atan2(s[1][1]-s[0][1],s[1][2]-s[0][2])})}
function setBoxes(){const b=F.bike;if(!b)return;const n=clamp(F.last|0,0,8),f=Math.floor(n/2),r=n-f;
  b.boxes.F.forEach((m,i)=>{m.visible=i<f;m.rotation.set(0,0,0);m.position.x=0});b.boxes.R.forEach((m,i)=>{m.visible=i<r;m.rotation.set(0,0,0);m.position.x=0});
  // scheve pizza's: de bovenste dozen hangen scheef
  let s=Math.min(F.scheef,n);const tilt=(m,k)=>{m.rotation.z=(k%2?-.22:.25);m.rotation.y=(k%2?.18:-.12);m.position.x=k%2?-.05:.05};
  for(let i=r-1;i>=0&&s>0;i--,s--)tilt(b.boxes.R[i],s);for(let i=f-1;i>=0&&s>0;i--,s--)tilt(b.boxes.F[i],s)}

/* =================== op de kaart: ondergrond, tramrails, zand =================== */
const isRoadT=(t,i)=>t===T.ROAD||(t===T.BRIDGE&&!(M.bridgeWalk&&M.bridgeWalk[i]));
function tileAt(x,z){x=Math.floor(x);z=Math.floor(z);if(x<0||z<0||x>=M.W||z>=M.H)return {t:T.WATER,i:-1};const i=z*M.W+x;return {t:M.ground[i],i}}
const onPark=(x,z)=>(M.parkPaths||[]).some(p=>x>p.x0-.3&&x<p.x1+.3&&z>p.z0-.3&&z<p.z1+.3);
// Tramlijnen: twee wegen dwars door de stad (de middelste oost-west en noord-zuid weg), alleen over land
const RAILS=[];
(function(){if(Array.isArray(M.TRAM)){M.TRAM.forEach(t=>RAILS.push({dir:t.dir,c:t.c,a:t.a,b:t.b,lijn:t.lijn}));return}// de verhaalstad heeft echte tramlijnen
  const HR=M.HR||[],VR=M.VR||[];if(!HR.length||!VR.length)return;
  const midH=HR.slice().sort((a,b)=>a.z-b.z)[Math.floor(HR.length/2)],midV=VR.slice().sort((a,b)=>a.x-b.x)[Math.floor((VR.length-1)/2)];
  const seg=(dir,c,a,b)=>{// splits op water: rails alleen waar de weg geen brug is
    let s=null;for(let p=a;p<=b;p++){const x=dir==='h'?p:c,z=dir==='h'?c:p,t=tileAt(x,z).t,ok=t===T.ROAD;if(ok&&s==null)s=p;if((!ok||p===b)&&s!=null){if(p-s>20)RAILS.push({dir,c,a:s,b:ok?p:p-1});s=null}}};
  if(midH)seg('h',midH.z,midH.a,midH.b);if(midV)seg('v',midV.x,midV.a,midV.b)})();
const GAUGE=.72,TRACK=1.7;// halve spoorwijdte, afstand van het spoor tot het midden van de weg
function railLines(){const L=[];RAILS.forEach(r=>[-TRACK,TRACK].forEach(o=>[-GAUGE,GAUGE].forEach(g=>L.push({dir:r.dir,c:r.c+o+g,a:r.a,b:r.b}))));return L}
const RL=railLines();
// (de verhaalstad tekent zijn rails zelf)
function buildRails(sc){if(!RAILS.length||Array.isArray(M.TRAM))return;const k=new Kit();
  RL.forEach(l=>{const len=l.b-l.a,mid=(l.a+l.b)/2;if(l.dir==='h'){k.box(len,.03,.22,mid,.012,l.c,'#2b2d31');k.box(len,.036,.07,mid,.016,l.c+.05,'#9aa1a9')}else{k.box(.22,.03,len,l.c,.012,mid,'#2b2d31');k.box(.07,.036,len,l.c+.05,.016,mid,'#9aa1a9')}});
  const m=k.mesh(false);m.traverse(o=>{if(o.isMesh)o.receiveShadow=true});sc.add(m)}
// Zand op de weg: waar de weg vlak langs het strand loopt waait zand op het asfalt (gladder, trager)
const SAND=[];
(function(){const seen=new Set();const W=M.W,H=M.H;let n=0;
  for(let i=0;i<4000&&n<26;i++){const x=Math.floor(rr(10,W-10)),z=Math.floor(rr(10,H-10));const t=tileAt(x,z);if(!isRoadT(t.t,t.i))continue;
    let near=false;for(let dz=-9;dz<=9&&!near;dz+=3)for(let dx=-9;dx<=9;dx+=3){if(tileAt(x+dx,z+dz).t===T.SAND){near=true;break}}if(!near)continue;
    const key=Math.floor(x/14)+','+Math.floor(z/14);if(seen.has(key))continue;seen.add(key);n++;SAND.push({x0:x-rr(2,4.5),z0:z-rr(1.2,2.5),x1:x+rr(2,4.5),z1:z+rr(1.2,2.5)})}})();
function sandTex(){const cv=document.createElement('canvas');cv.width=cv.height=16;const c=cv.getContext('2d');
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){const d=Math.hypot(x-7.5,y-7.5)/8+Math.random()*.35;if(d>1)continue;c.fillStyle=pick(['#d8c08a','#cdb37a','#e3cf9c','#c4a96e']);c.globalAlpha=d>.8?.55:.9;c.fillRect(x,y,1,1)}
  const t=new TH.CanvasTexture(cv);t.magFilter=t.minFilter=TH.NearestFilter;t.colorSpace=TH.SRGBColorSpace||t.colorSpace;return t}
function buildSand(sc){if(!SAND.length)return;const mat=new TH.MeshLambertMaterial({map:sandTex(),transparent:true,depthWrite:false});
  SAND.forEach(s=>{const m=new TH.Mesh(new TH.PlaneGeometry(s.x1-s.x0,s.z1-s.z0),mat);m.rotation.x=-Math.PI/2;m.position.set((s.x0+s.x1)/2,.02,(s.z0+s.z1)/2);m.receiveShadow=true;m.renderOrder=1;sc.add(m)})}
const inSand=(x,z)=>SAND.some(s=>x>s.x0&&x<s.x1&&z>s.z0&&z<s.z1);
function surface(x,z){const t=tileAt(x,z);if(t.t===T.SAND)return {k:'zand',max:.55,grip:.5,roll:2.4};
  if(inSand(x,z))return {k:'zand',max:.82,grip:.58,roll:1.4};
  if((t.t===T.PARK||t.t===T.GARDEN||t.t===T.GRASS)&&!onPark(x,z))return {k:'gras',max:.66,grip:.85,roll:2};
  return {k:isRoadT(t.t,t.i)?'weg':'stoep',max:1,grip:1,roll:1}}

/* =================== geluid (eigen kleine Web Audio, volgt de geluidsinstellingen) =================== */
let AC=null,OUT=null;
function ac(){try{if(G.snd&&G.snd.fxOn===false)return null}catch(e){}if(!AC){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{AC=new A();OUT=AC.createGain();OUT.connect(AC.destination)}catch(e){return null}}
  if(AC.state==='suspended')try{AC.resume()}catch(e){}OUT.gain.value=.5*((G.snd&&G.snd.vol)||.8);return AC}
function ping(f,t,d,v,type){const c=ac();if(!c)return;const T0=c.currentTime+(t||0),o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,T0);
  g.gain.setValueAtTime(0,T0);g.gain.linearRampToValueAtTime(v,T0+.004);g.gain.exponentialRampToValueAtTime(.0001,T0+d);o.connect(g);g.connect(OUT);o.start(T0);o.stop(T0+d+.05)}
function rattle(t,d,v,f0){const c=ac();if(!c)return;const T0=c.currentTime+(t||0),n=Math.floor(c.sampleRate*d),b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
  const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=b;f.type='bandpass';f.frequency.value=f0||1800;g.gain.value=v;s.connect(f);f.connect(g);g.connect(OUT);s.start(T0)}
const SND={
  bel:()=>{[0,.17].forEach(t=>{ping(2637,t,.55,.16);ping(3951,t,.35,.07);ping(5274,t,.18,.03)})},
  tik:v=>ping(3200+Math.random()*300,0,.018,v||.05,'square'),
  hobbel:v=>{ping(140,0,.12,.25*(v||1),'sine');rattle(0,.12,.25*(v||1),900)},
  rem:()=>{ping(1900,0,.32,.035,'sawtooth');ping(2100,.03,.28,.025,'sawtooth')},
  klap:()=>{ping(110,0,.2,.4,'sine');rattle(0,.25,.5,700);rattle(.05,.2,.25,3200)},
  stand:()=>rattle(0,.08,.2,2400),
  dozen:()=>rattle(0,.14,.22,1300),
  op:()=>{rattle(0,.06,.18,2000);ping(880,.05,.05,.04,'square')}};
G.fietsSnd=SND;

/* =================== spawnen, op- en afstappen =================== */
function ensureBike(){if(F.bike)return F.bike;const b=buildBike({kleur:F.kleur||undefined});F.bike=b;G.scene().add(b.root);bikeObj.mesh=b.root;setBoxes();return b}
function place(){const b=F.bike;if(!b)return;b.root.position.set(F.x,F.bump,F.z);b.root.rotation.y=F.ry;bikeObj.x=F.x;bikeObj.z=F.z;bikeObj.ry=F.ry;bikeObj.v=F.v}
const okAt=(x,z,ry)=>{const fx=Math.sin(ry),fz=Math.cos(ry);return M.canStand(x,z,.22)&&M.canStand(x+fx*.62,z+fz*.62,.17)&&M.canStand(x-fx*.6,z-fz*.6,.17)};
// een vrije plek voor de hele fiets (wielen en tassen), zo dicht mogelijk bij x,z; eerst in de gevraagde richting
function freeAt(x,z,ry){const R=[ry,ry+Math.PI,ry+Math.PI/2,ry-Math.PI/2];if(okAt(x,z,ry))return {x,z,ry};
  for(let r=.5;r<=8;r+=.5)for(let a=0;a<16;a++){const t=a/16*Math.PI*2,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;for(const q of R)if(okAt(px,pz,q))return {x:px,z:pz,ry:q}}
  const p=M.nearestWalk(x,z,12)||{x,z};return {x:p.x,z:p.z,ry}}
function spawn(x,z,ry,o){o=o||{};if(o.kleur&&F.kleur!==o.kleur){F.kleur=o.kleur;if(F.bike&&!F.on){G.scene().remove(F.bike.root);F.bike=null}}
  if(F.on)af(true);const p=freeAt(x,z,ry||0);F.x=p.x;F.z=p.z;F.ry=p.ry;F.v=0;F.lat=0;
  ensureBike();F.bike.root.visible=true;parkPose();place();spotSync();return bikeObj}
function parkPose(){const b=F.bike;if(!b)return;b.stand.visible=true;b.stand.rotation.x=0;F.lean=0;b.lean.rotation.z=-.13;b.steer.rotation.y=.35;posePedals(b,.4,0);if(F.rider)F.rider.g.visible=false;b.beam.material.opacity=0}
function riderSync(force){if(!F.bike)return;const k=lookKey();if(!force&&F.rider&&F.rider.key===k)return;
  if(F.rider){F.bike.lean.remove(F.rider.g);['L','R'].forEach(s=>{const l=F.rider.L[s];F.bike.lean.remove(l.th,l.sh,l.ft)})}
  F.rider=buildRider();if(!F.rider)return;F.bike.lean.add(F.rider.g);['L','R'].forEach(s=>{const l=F.rider.L[s];F.bike.lean.add(l.th,l.sh,l.ft)});F.rider.g.visible=F.on;['L','R'].forEach(s=>{const l=F.rider.L[s];l.th.visible=l.sh.visible=l.ft.visible=F.on})}
function riderShow(on){if(!F.rider)return;F.rider.g.visible=on;['L','R'].forEach(s=>{const l=F.rider.L[s];l.th.visible=l.sh.visible=l.ft.visible=on})}
function op(o){o=o||{};if(F.on)return true;if(!F.bike){toast('Er staat hier geen fiets','bad');return false}
  if(G.driving&&G.exitCar)G.exitCar(true);if(G.driving)return false;
  if(G.sitting&&G.standUp)G.standUp();if(G.hidden&&G.unhide)G.unhide();if(G.stopPath)G.stopPath();
  try{if(G.draag&&G.draag.n&&G.draag.n()>0&&!o.houd){const n=G.draag.n();G.draag.leeg();last(F.last+n)}}catch(e){}
  F.on=true;F.prevCar=G.car;G.car=bikeObj;G.driving=true;F.v=0;F.lat=0;F.bal=null;F.val=0;F.prevT=null;
  const b=ensureBike();b.stand.visible=false;riderSync(true);riderShow(true);place();SND.op();
  G.P.x=F.x;G.P.z=F.z;G.P.ry=F.ry;G.P.vx=G.P.vz=0;
  if(performance.now()-(G.manualRotT||0)>800)G.yawT=F.ry+Math.PI;
  spotSync();hud();if(G.carHud)G.carHud();document.body.classList.add('sd-fiets');
  if(!op.told){op.told=1;toast(touch?'Stuur met de stick. Helemaal uit = staand trappen. Bel met de knop.':'W/S trappen en remmen · A/D sturen · Shift staand trappen · B bel · F afstappen','info')}
  try{F.onOp&&F.onOp()}catch(e){}return true}
function af(quiet){if(!F.on)return;F.on=false;G.driving=false;G.car=F.prevCar&&F.prevCar!==bikeObj?F.prevCar:null;F.v=0;F.lat=0;F.bal&&balEnd(null);
  const b=F.bike;riderShow(false);parkPose();place();
  // naast de fiets gaan staan (rechts van de berijder), anders de dichtstbijzijnde vrije plek
  const rx=-Math.cos(F.ry),rz=Math.sin(F.ry);let p=null;for(const s of [1,-1]){const x=F.x+rx*s*.95,z=F.z+rz*s*.95;if(M.canStand(x,z,.3)){p={x,z};break}}p=p||M.nearestWalk(F.x,F.z,6)||{x:F.x,z:F.z};
  G.P.x=p.x;G.P.z=p.z;G.P.vx=G.P.vz=0;G.P.ry=F.ry;
  if(!quiet)SND.stand();spotSync();hud();if(G.carHud)G.carHud();document.body.classList.remove('sd-fiets');
  try{F.onAf&&F.onAf()}catch(e){}}
function weg(){if(F.on)af(true);if(F.bike){G.scene().remove(F.bike.root);F.bike=null;F.rider=null;bikeObj.mesh=null}spotSync()}
function last(n){if(n==null)return F.last;const before=F.last;F.last=clamp(Math.round(n),0,8);if(F.scheef>F.last)F.scheef=F.last;if(F.last===0)F.scheef=0;setBoxes();if(F.on&&F.last!==before)SND.dozen();hud();return F.last}

/* =================== opstappen: E bij de fiets (of F) =================== */
let SP=null;
function spotSync(){if(!G.spot)return;if(!SP){SP=G.spot({k:'fiets',story:1,x:0,z:0,r:2.4,n:()=>F.last?'Opstappen · '+F.last+' pizza'+(F.last>1?"'s":''):'Opstappen',col:'#ff6a4a',h:1.7,prio:1,
    show:()=>!!F.bike&&!F.on&&!G.driving&&!(G.binnen&&G.binnen.waar&&G.binnen.waar()),act:()=>op()})}
  SP.x=F.x;SP.z=F.z}
addEventListener('keydown',e=>{if(G.paused||e.repeat||!G.ready)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;const k=e.key.toLowerCase();
  if(k==='f'&&!G.driving&&F.bike&&!F.on&&Math.hypot(G.P.x-F.x,G.P.z-F.z)<2.6&&!G.talking){if(G.nearCar&&Math.hypot(G.P.x-G.nearCar.x,G.P.z-G.nearCar.z)<Math.hypot(G.P.x-F.x,G.P.z-F.z))return;e.stopImmediatePropagation();op()}
  if(k==='b'&&F.on){bel()}},true);

/* =================== bel =================== */
function bel(){if(!F.on&&!F.bike)return;if(F.ring>0)return;F.ring=.55;SND.bel();
  // mensen voor je stappen opzij
  const fx=Math.sin(F.ry),fz=Math.cos(F.ry);(G.NPC||[]).forEach(n=>{const dx=n.x-F.x,dz=n.z-F.z,a=dx*fx+dz*fz,s=Math.abs(dx*fz-dz*fx);if(a>0&&a<12&&s<3.2&&!n.fixed&&n.st!=='aangereden'){n.stop=0;n.dx=Math.abs(fz)>.5?(dx>0?1:-1):0;n.dz=Math.abs(fx)>.5?(dz>0?1:-1):0;
    if(Math.random()<.35&&G.bubble)G.bubble(n,pick(['Ja ja!','Oei!','Rustig aan!','Sorry!','Pizzajongen!']),{col:'#ffe0a0'})}});
  try{F.onBel&&F.onBel()}catch(e){}}

/* =================== balans =================== */
// o: {waarom, duur}. Promise<true|false>. De tas kantelt; stuur tegen (A/D of de stick) tot hij weer recht hangt.
const BAL_UI=document.createElement('div');BAL_UI.className='sdf-bal';BAL_UI.hidden=true;BAL_UI.innerHTML='<b id="sdfBalT">Hou je tas recht!</b><div class="sdf-bal-g"><i class="sdf-bal-z"></i><i class="sdf-bal-n" id="sdfBalN"><svg viewBox="0 0 16 16" shape-rendering="crispEdges"><rect x="2" y="5" width="12" height="9" fill="#c62a22"/><rect x="2" y="8" width="12" height="2" fill="#f1ece0"/><rect x="3" y="3" width="10" height="2" fill="#e3cfa2"/><rect x="2" y="14" width="12" height="1" fill="#8f1a15"/></svg></i></div><small id="sdfBalS">'+(touch?'Stuur tegen met de stick':'Stuur tegen met A en D')+'</small><i class="sdf-bal-t"><i id="sdfBalB"></i></i>';
document.body.appendChild(BAL_UI);
function balans(o){o=o||{};if(F.bal)return F.bal.p;if(!F.on)return Promise.resolve(true);const e=ease();
  const dur=(o.duur||2.1)*(1-.25*e),dir=Math.random()<.5?-1:1;let res;const p=new Promise(r=>res=r);
  F.bal={t:0,dur,a:dir*rr(.28,.42),va:dir*rr(.6,1.1),k:1.5-.5*e,res,p,why:o.waarom||'',noise:rr(0,9)};
  $s('sdfBalT').textContent=o.waarom||'Hou je tas recht!';BAL_UI.hidden=false;BAL_UI.classList.remove('ok','fout');void BAL_UI.offsetWidth;BAL_UI.classList.add('go');
  SND.hobbel(1);G.shake&&G.shake(.18);return p}
function balStep(dt,steerIn){const b=F.bal;if(!b)return;b.t+=dt;
  // instabiel: de hoek groeit vanzelf, plus geschud; tegensturen duwt hem terug
  const drift=Math.sin(b.t*5.3+b.noise)*.9+Math.sin(b.t*11.7)*.45,spd=clamp(F.v/8,.4,1.3);
  b.va+=(b.a*b.k*1.6+drift*.9*spd+steerIn*2.6)*dt;b.va*=Math.pow(.25,dt);b.a+=b.va*dt;
  $s('sdfBalN').style.transform=`translateX(${clamp(b.a,-1,1)*46}px) rotate(${clamp(b.a,-1,1)*38}deg)`;$s('sdfBalB').style.width=Math.max(0,1-b.t/b.dur)*100+'%';
  BAL_UI.classList.toggle('warn',Math.abs(b.a)>.6);
  if(Math.abs(b.a)>=1){balEnd(false);return}if(b.t>=b.dur)balEnd(true)}
function balEnd(ok){const b=F.bal;if(!b)return;F.bal=null;BAL_UI.classList.remove('go','warn');
  if(ok==null){BAL_UI.hidden=true;b.res(true);return}
  BAL_UI.classList.add(ok?'ok':'fout');$s('sdfBalT').textContent=ok?'Netjes!':'Scheef!';setTimeout(()=>{if(!F.bal)BAL_UI.hidden=true},ok?700:1100);
  if(ok){try{G.snd&&G.snd.fx('blip')}catch(e){}}else{scheefErbij();F.v*=.55}
  try{G.vak&&G.vak.add&&F.last>0&&G.vak.add('bezorgen',ok)}catch(e){}
  try{F.onBalans&&F.onBalans(ok)}catch(e){}b.res(ok)}
function scheefErbij(n){if(F.last<=0)return;F.scheef=Math.min(F.last,F.scheef+(n||1));setBoxes();SND.dozen();float('Pizza scheef!',F.x,F.z,'#ffb0a0');try{F.onScheef&&F.onScheef(F.scheef)}catch(e){}}

/* =================== vallen =================== */
function val(why,hard){if(F.val>0||!F.on)return;F.val=1.4;F.valSide=F.lean<0?-1:1;F.v=0;F.lat=0;if(F.bal)balEnd(false);SND.klap();G.shake&&G.shake(.5);try{G.flash&&G.flash('#ffffff',.3)}catch(e){}
  float(why||'Gevallen!',F.x,F.z,'#ffb0a0');if(F.last>0)scheefErbij(hard?2:1);
  // in de Stad kost een harde val wat gezondheid (het verhaal raakt je klikspel niet)
  if(hard&&!story()){try{S.hp=Math.max(5,(S.hp||100)-Math.round(rr(3,8)));typeof save==='function'&&save()}catch(e){}}
  try{F.onVal&&F.onVal(why||'val')}catch(e){}}

/* =================== rijden =================== */
const CARD={city:[1.75,.85],hatch:[1.95,.9],sedan:[2.25,.93],suv:[2.3,1],sport:[2.2,.98],van:[2.5,1],pickup:[2.5,1]};
function carDims(o){if(o._hl)return [o._hl,o._hw];return CARD[o.kind]||CARD.sedan}
function pushCars(dt){const out={imp:0,by:null};const lists=[G.traffic||[],G.vehicles||[],G.parked||[]];const fx=Math.sin(F.ry),fz=Math.cos(F.ry);
  for(const L of lists)for(const o of L){if(!o||o===bikeObj||o.gone||o.sunk||o.st==='gestolen'||o.noCol)continue;if(Math.abs(o.x-F.x)>6||Math.abs(o.z-F.z)>6)continue;const [hl,hw]=carDims(o),ry=o.ry||0,s=Math.sin(ry),c=Math.cos(ry);
    for(const off of [.62,0,-.6]){const px=F.x+fx*off,pz=F.z+fz*off,dx=px-o.x,dz=pz-o.z,la=dx*s+dz*c,lb=dx*c-dz*s,pa=hl+.22-Math.abs(la),pb=hw+.22-Math.abs(lb);if(pa<=0||pb<=0)continue;
      let nx,nz,d;if(pa<pb){d=pa;const sg=Math.sign(la)||1;nx=s*sg;nz=c*sg}else{d=pb;const sg=Math.sign(lb)||1;nx=c*sg;nz=-s*sg}
      F.x+=nx*(d+.01);F.z+=nz*(d+.01);const ov=(o.v&&!o.parked&&L!==G.parked)?o.v:0,ovx=Math.sin(ry)*ov,ovz=Math.cos(ry)*ov,vx=fx*F.v,vz=fz*F.v,vr=(vx-ovx)*nx+(vz-ovz)*nz;
      F.dbg.car++;if(vr<0){const j=-vr;F.v=Math.max(0,F.v-j*Math.abs(fx*nx+fz*nz)*1.1);if(j>out.imp){out.imp=j;out.by=o}}break}}
  return out}
function hitPeds(){if(F.v<2.5)return;const fx=Math.sin(F.ry),fz=Math.cos(F.ry);(G.NPC||[]).forEach(n=>{if(n.fixed||n.st==='aangereden'||n.st==='sit'||n.st==='sitb')return;const dx=n.x-F.x,dz=n.z-F.z;if(Math.abs(dx)>1.6||Math.abs(dz)>1.6)return;
    const a=dx*fx+dz*fz,s=Math.abs(dx*fz-dz*fx);if(a<-.7||a>1.1||s>.6)return;
    if(F.v>8.5&&G.npcBrain){const sd=(dx*fz-dz*fx)>0?1:-1;n.st='aangereden';n.t=0;n.kvx=fx*F.v*.3-fz*sd*3;n.kvz=fz*F.v*.3+fx*sd*3;n.kdB=0;G.bubble&&G.bubble(n,pick(['Au!','Hé!','Kijk uit!']),{col:'#ff9a9a'});F.v*=.35;SND.klap();if(F.last>0&&!F.bal)balans({waarom:'Botsing! Hou je tas recht'})}
    else{F.dbg.ped++;const now=performance.now();if(now-(n._fbT||0)>900){n._fbT=now;F.v*=.7;n.stop=0;G.bubble&&G.bubble(n,pick(['Hé!','Kijk uit, pizzajongen!','Bel dan!','Ho!']),{col:'#ffe0a0'})}
      // opzij duwen
      const sd=(dx*fz-dz*fx)>0?1:-1,nx=n.x+fz*sd*.12,nz=n.z-fx*sd*.12;if(M.canStand(nx,nz,.3)){n.x=nx;n.z=nz}}})}
function input(){const K=G.K||{};let thr=0,brk=0,steer=0,sprint=false;
  if(G.joy&&G.joy.on){const jx=G.joy.x,jy=G.joy.y,mag=Math.min(1,Math.hypot(jx,jy));if(mag>.18){const fx=-Math.sin(G.yaw),fz=-Math.cos(G.yaw),rx=Math.cos(G.yaw),rz=-Math.sin(G.yaw),wx=rx*jx+fx*jy,wz=rz*jx+fz*jy;
      const r=wrap(Math.atan2(wx,wz)-F.ry);if(Math.abs(r)>2.3&&F.v>.6){brk=mag;steer=0}else{steer=clamp(r*1.7,-1,1);thr=mag*(Math.abs(r)>1.4&&F.v>4?.4:1)}sprint=mag>.9||!!G.runToggle}}
  else{thr=(K.w||K.arrowup)?1:0;brk=(K.s||K.arrowdown)?1:0;steer=((K.a||K.arrowleft)?1:0)-((K.d||K.arrowright)?1:0);sprint=!!K.shift||!!G.runToggle}
  if(G.talking||G.carFreeze||G.frozen>0||F.val>0){thr=0;brk=G.talking?1:brk;steer=0;sprint=false}
  return {thr,brk,steer,sprint}}
function rideStep(dt){const I=input(),e=ease(),n=F.last;
  // vallen: even liggen, dan weer overeind
  if(F.val>0){F.val-=dt;const k=F.val>.5?1:F.val/.5;F.lean+=(F.valSide*1.3*k-F.lean)*Math.min(1,dt*10);if(F.val<=0)F.lean=0;F.v=0;applyPose(dt,0,0);place();syncP(dt);return}
  const su=surface(F.x,F.z);F.surf=su.k;
  let wg=1;try{wg=G.weerFx?clamp(+G.weerFx().grip||1,.4,1):1}catch(err){}
  const grip=clamp(Math.min(su.grip,1-(1-wg)*1.7),.32,1);
  // adem: staand trappen kost adem, uitrollen en rustig trappen geeft hem terug
  const canSpr=I.sprint&&I.thr>.2&&(F.adem>.02)&&!(F.sprint===false&&F.adem<.25&&F.ademLeeg);
  F.sprint=canSpr;if(canSpr){F.adem=Math.max(0,F.adem-dt*(.16+.012*n)*(1-.3*e));if(F.adem<=0)F.ademLeeg=true}else{F.adem=Math.min(1,F.adem+dt*(I.thr>.2?.07:.14));if(F.adem>.3)F.ademLeeg=false}
  const loadK=1-.04*n,accK=1/(1+.09*n),brkK=1/(1+.14*n),turnK=1/(1+.075*n);
  const vmax=(canSpr?14.2:10.4)*loadK*su.max*(F.bal?.85:1);
  // gas, remmen en uitrollen
  if(I.thr>0&&F.v<vmax)F.v=Math.min(vmax,F.v+(canSpr?7.2:5)*I.thr*accK*dt*(F.v<3?1.3:1));
  if(F.v>vmax)F.v=Math.max(vmax,F.v-4.5*dt);
  if(I.brk>0){if(F.v>.05){const was=F.v;F.v=Math.max(0,F.v-12*brkK*(.55+.45*grip)*I.brk*dt);if(was>6&&!F.remT){F.remT=.6;SND.rem()}}else F.v=Math.max(-1.3,F.v-3*dt)}
  else if(I.thr<=0)F.v-=Math.sign(F.v)*Math.min(Math.abs(F.v),(.35+Math.abs(F.v)*.04)*su.roll*dt);
  if(F.remT>0)F.remT-=dt;
  // sturen: wendbaar bij lage snelheid, stabieler bij hoge; met lading en op gladde grond trager
  const sp=Math.abs(F.v),stIn=I.steer+(F.bal?Math.sin(F.bal.t*9)*.25:0);
  F.steerV+=(stIn-F.steerV)*Math.min(1,dt*(9*turnK));
  const rate=F.steerV*(2.8-1.35*Math.min(1,sp/14))*turnK*Math.min(1,(sp+.5)/2.2)*(.75+.25*grip)*(F.v<0?-1:1);
  const r0=F.ry;F.ry+=rate*dt;if(!okAt(F.x,F.z,F.ry))F.ry=r0;
  // glijden: op zand of een natte weg schuift de fiets in een scherpe bocht naar buiten
  if(grip<.98&&sp>5)F.lat+=(-rate*sp*(1-grip)*.55)*dt;F.lat*=Math.pow(.02+.2*(1-grip),dt);
  if(Math.abs(F.lat)>2.4&&grip<.75)val('Uitgegleden!');
  const fx=Math.sin(F.ry),fz=Math.cos(F.ry),rx=Math.cos(F.ry),rz=-Math.sin(F.ry);
  const dx=(fx*F.v+rx*F.lat)*dt,dz=(fz*F.v+rz*F.lat)*dt,x0=F.x,z0=F.z;let imp=0;
  if(okAt(F.x+dx,F.z+dz,F.ry)){F.x+=dx;F.z+=dz}
  else if(okAt(F.x+dx,F.z,F.ry)&&Math.abs(dx)>1e-4){F.x+=dx;imp=Math.abs(fz*F.v);F.v*=Math.abs(fx)*.9+.05;F.lat*=.3}
  else if(okAt(F.x,F.z+dz,F.ry)&&Math.abs(dz)>1e-4){F.z+=dz;imp=Math.abs(fx*F.v);F.v*=Math.abs(fz)*.9+.05;F.lat*=.3}
  else{imp=Math.abs(F.v);F.v=-F.v*.15;F.lat=0;F.dbg.wall++}
  if(!okAt(F.x,F.z,F.ry)){const p=M.nearestWalk(F.x,F.z,4);if(p){F.x=p.x;F.z=p.z}}
  const pc=pushCars(dt);if(pc.imp>imp)imp=pc.imp;
  if(imp>7.5)val(pc.by?'Tegen een auto!':'Klap!',imp>10);else if(imp>3.2){SND.hobbel(.6);G.shake&&G.shake(.12);if(F.last>0&&!F.bal&&Math.random()<.5)balans({waarom:'Bonk! Hou je tas recht'})}
  // een rijdende auto die jou raakt
  if(!F.val)(G.traffic||[]).forEach(o=>{if(!o||o.parked||!(o.v>4))return;const d=Math.hypot(o.x-F.x,o.z-F.z);if(d<1.6){const [hl]=carDims(o);const a=(F.x-o.x)*Math.sin(o.ry)+(F.z-o.z)*Math.cos(o.ry);if(a>0&&a<hl+.6)val('Aangereden!',true)}});
  hitPeds();
  // stoepranden en tramrails
  bumps(x0,z0,dt);
  if(F.bal)balStep(dt,-I.steer);
  if(F.ring>0)F.ring-=dt;
  applyPose(dt,I.thr,I.steer);place();syncP(dt);
  // vrijloop: tikken als je uitrolt
  if(F.v>1.5&&I.thr<=0){F.tick+=dt*F.v*2.2;if(F.tick>1){F.tick=0;SND.tik(.025+Math.min(.035,F.v*.003))}}}
function bumps(x0,z0,dt){F.curbCd-=dt;F.railCd-=dt;if(F.v<.5)return;
  const a=tileAt(x0,z0),b=tileAt(F.x,F.z),ra=isRoadT(a.t,a.i),rb=isRoadT(b.t,b.i),walkish=t=>t===T.WALK||t===T.PLAZA||(t===T.BRIDGE);
  if(ra!==rb&&(walkish(ra?b.t:a.t))&&F.curbCd<=0){F.curbCd=.6;const sp=F.v;F.bumpV=Math.min(1.6,sp*.11);SND.hobbel(.5+Math.min(.6,sp*.05));
    if(sp>4.5&&F.last>0&&!F.bal){const ch=clamp((sp-4.5)/7,0,.75)*(1-.55*ease())*(rb?1:.7);if(Math.random()<ch)balans({waarom:rb?'Stoeprand af!':'Stoeprand op!'})}}
  // rails: over een lijn heen gereden?
  if(F.railCd<=0)for(const l of RL){const p0=l.dir==='h'?z0:x0,p1=l.dir==='h'?F.z:F.x,q=l.dir==='h'?F.x:F.z;if(q<l.a||q>l.b)continue;if((p0-l.c)*(p1-l.c)>0)continue;
    const hd=l.dir==='h'?Math.abs(Math.cos(F.ry)):Math.abs(Math.sin(F.ry));// sin van de hoek met de rails
    F.railCd=.35;F.bumpV=Math.max(F.bumpV,.35);SND.hobbel(.35);
    if(hd<.5&&F.v>2.5&&!F.bal){const ch=(F.last>0?.85:.5)*(1-.5*ease());if(Math.random()<ch){if(F.last>0)balans({waarom:'Tramrails! Hou je tas recht'});else if(F.v>6&&hd<.3&&Math.random()<.4)val('Wiel in de tramrails!');else{F.v*=.7;float('Tramrails!',F.x,F.z,'#ffe0a0')}}}
    break}}
// houding van fiets en berijder
function applyPose(dt,thr,steer){const b=F.bike,rd=F.rider,sp=Math.abs(F.v),moving=sp>.25;
  // wielen en trappers
  F.wheel+=F.v/R*dt;b.wF.rotation.x=F.wheel;b.wR.rotation.x=F.wheel;
  const pedal=thr>0&&F.v>-.1&&!F.val;if(pedal)F.crank+=Math.max(2.2,F.v/R/GEAR)*dt*(F.sprint?1.15:1);else if(!moving){const tgt=Math.round((F.crank-.0)/Math.PI)*Math.PI;F.crank+=(tgt-F.crank)*Math.min(1,dt*3)}
  const ped=posePedals(b,F.crank,pedal);chainStep(b,F.wheel/GEAR);
  // stuur en schuin in de bocht (en wiebelen bij staand trappen); stilstaan = voet aan de grond, fiets een beetje schuin
  b.steer.rotation.y=F.steerV*.42*(1-Math.min(1,sp/13)*.55)+(F.bal?Math.sin(F.bal.t*13)*.12*F.bal.a:0);
  let tl=0;if(!F.val){if(!moving&&!pedal)tl=.13;else tl=-F.steerV*Math.min(1,sp/6)*.38+(F.sprint?Math.sin(F.crank)*.09:0)+(F.bal?F.bal.a*.22:0)}
  if(!F.val)F.lean+=(tl-F.lean)*Math.min(1,dt*7);b.lean.rotation.z=F.lean;
  // hobbel (stoeprand, rails)
  F.bump+=F.bumpV*dt;F.bumpV-=14*dt;if(F.bump<0){F.bump=0;F.bumpV=F.bumpV<-1?-F.bumpV*.25:0}
  b.beam.material.opacity=Math.max(0,(G.night||0)-.35)*.55;
  if(!rd)return;
  // berijder: zitten, of staan op de trappers
  const stand=F.sprint&&pedal,foot=!moving&&!pedal&&!F.val;
  const hipY=stand?1.3+Math.abs(Math.sin(F.crank))*.04:1.07,hipZ=stand?-.14:-.31,tx=stand?.62:.5;
  rd.g.position.set(stand?Math.sin(F.crank)*.06:0,hipY-.99,hipZ);rd.g.rotation.set(0,0,stand?-Math.sin(F.crank)*.1:0);
  const P=rd.P;P.torso.rotation.set(tx,0,foot?.04:0);P.head.rotation.set(-tx*.8+(foot?.05:0),foot?Math.sin(performance.now()/1400)*.4:-F.steerV*.25,0);P.root.position.y=0;
  // armen naar de handvatten
  const tp=new TH.Vector3(0,.84*1.18,0);const ch=Math.cos(tx),sh=Math.sin(tx);
  ['L','R'].forEach((s,i)=>{const arm=i?P.armR:P.armL,sx=i?.41:-.41;// schouder in de wereld (fiets-lokaal)
    const so=new TH.Vector3(sx*1.18,.66*1.18*ch,.66*1.18*sh).add(tp).add(rd.g.position);
    const gx=Math.sign(sx)*.31,grip=new TH.Vector3(gx,1.24,.44-.24);// handvat in de stuurgroep, ruwweg (stuur draait mee)
    const sa=b.steer.rotation.y;const gz=grip.z-.44;grip.x=gx*Math.cos(sa)+gz*Math.sin(sa);grip.z=.44-gx*Math.sin(sa)+gz*Math.cos(sa);grip.y=1.0+.24;
    const dv=grip.sub(so);const dist=dv.length();// naar torso-ruimte (alleen de x-draaiing van de romp)
    const ly=dv.y*ch+dv.z*sh,lz=-dv.y*sh+dv.z*ch,lx=dv.x;const dir=new TH.Vector3(lx,ly,lz).normalize();
    arm.quaternion.setFromUnitVectors(DOWN,dir);arm.scale.set(1,clamp(dist/ARM,.5,1.05),1)});
  // benen: knie naar voren, voeten op de trappers (of links op de grond)
  const L=rd.L,hip=new TH.Vector3();['L','R'].forEach((s,i)=>{const sx=i?-HIPW:HIPW;hip.set(sx+rd.g.position.x,hipY-.02,hipZ+.02);
    const p=i?ped.R:ped.L;let E=new TH.Vector3(i?-.16:.16,p[0]+.09,p[1]-.02),hint=null;
    if(foot&&i===1){E.set(-.55,.1,-.05);hint=new TH.Vector3(-.4,0,1).normalize()}
    ik(L[s],hip,E,hint);L[s].ft.rotation.set(0,0,0)});
  // door je ogen: hoofd en romp weg (je ziet je armen, je knieën, het stuur en de voortas)
  const og=G.camMode==='ogen';if(og!==F.ogen){F.ogen=og;P.head.visible=!og;P.torso.children.forEach(c=>{if(c.isMesh)c.visible=!og})}}
function syncP(dt){const P=G.P,fx=Math.sin(F.ry),fz=Math.cos(F.ry);P.x=F.x;P.z=F.z;P.ry=F.ry;P.vx=fx*F.v;P.vz=fz*F.v;bikeObj.v=F.v;
  // camera achter de fiets aan (tenzij je net zelf hebt gedraaid)
  if(Math.abs(F.v)>2.5&&performance.now()-(G.manualRotT||0)>1500){const want=wrap(F.ry+Math.PI-G.yawT);G.yawT+=want*Math.min(1,dt*(G.camMode==='achter'?4.2:G.camMode==='ogen'?6:1.3))}}

/* =================== camera: achter en door je ogen, voor de fiets =================== */
const cam={pos:new TH.Vector3(),init:false,d:5.6},_dir=new TH.Vector3();
let BLD=null;function bmap(){BLD=new Uint8Array(M.W*M.H);M.buildings.forEach(b=>{for(let z=b.z0;z<b.z1;z++)for(let x=b.x0;x<b.x1;x++)if(x>=0&&z>=0&&x<M.W&&z<M.H)BLD[z*M.W+x]=1})}
const wallAt=(x,z)=>{x=Math.floor(x);z=Math.floor(z);return x>=0&&z>=0&&x<M.W&&z<M.H&&!!BLD[z*M.W+x]};
const rigHook=setInterval(()=>{if(!G.camRig)return;clearInterval(rigHook);const rig0=G.camRig;
  G.camRig=function(dt,c){const r=rig0(dt,c);if(!r||!F.on||G.paused)return r;try{bikeCam(dt,c)}catch(e){console.error(e)}return r}},100);
addEventListener('wheel',e=>{if(F.on&&G.camMode==='achter')cam.d=clamp(cam.d*(e.deltaY>0?1.1:.9),3.2,11)},{passive:true});
function bikeCam(dt,c){if(!BLD)bmap();c.getWorldDirection(_dir);const yaw=G.yaw;
  if(G.camMode==='achter'){let p=Math.asin(clamp(-_dir.y,-1,1));p=clamp(p,.12,.85);const por=innerWidth<innerHeight,d=cam.d*(por?1.35:1),ly=1.75+(F.sprint?.15:0);
    const lx=F.x,lz=F.z,cp=Math.cos(p),sp=Math.sin(p),dx=Math.sin(yaw)*cp,dz=Math.cos(yaw)*cp;let dd=d;for(let s=.4;s<=d;s+=.25){if(wallAt(lx+dx*s,lz+dz*s)&&ly+sp*s<40){dd=Math.max(.8,s-.45);break}}
    _v.set(lx+dx*dd,Math.max(.4,ly+sp*dd),lz+dz*dd);if(!cam.init||cam.pos.distanceTo(_v)>12){cam.pos.copy(_v);cam.init=true}else cam.pos.lerp(_v,Math.min(1,dt*11));
    c.position.copy(cam.pos);c.lookAt(lx,ly+.15,lz)}
  else if(G.camMode==='ogen'){cam.init=false;const fx=Math.sin(F.ry),fz=Math.cos(F.ry),ey=(F.sprint?2.38:2.1)+F.bump,back=F.sprint?-.05:-.22;
    c.position.set(F.x+fx*back,ey,F.z+fz*back);c.lookAt(c.position.x+_dir.x,c.position.y+_dir.y,c.position.z+_dir.z)}
  else cam.init=false}

/* =================== HUD: adem en bel (de snelheid laat de auto-meter zien) =================== */
const ui=document.createElement('div');ui.className='sdf-ui';ui.hidden=true;
ui.innerHTML=`<div class="sdf-adem" id="sdfAdem" title="Adem (staand trappen)"><small>Adem</small><i><i id="sdfAdemB"></i></i></div><button class="sdf-belb" id="sdfBel" aria-label="Bellen">${touch?'':'<kbd>B</kbd>'}<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="7" y="1" width="2" height="2" fill="currentColor"/><rect x="5" y="3" width="6" height="2" fill="currentColor"/><rect x="4" y="5" width="8" height="5" fill="currentColor"/><rect x="2" y="10" width="12" height="2" fill="currentColor"/><rect x="7" y="12" width="2" height="2" fill="currentColor"/></svg><span>Bel</span></button>`;
document.body.appendChild(ui);
$s('sdfBel').addEventListener('click',e=>{e.stopPropagation();bel()});
['pointerdown','touchstart'].forEach(n=>ui.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
function hud(){ui.hidden=!F.on;const o=$s('sdOutCar');if(o){const w=F.on?'Afstappen':'Uitstappen';o.innerHTML=touch?w:'<kbd>F</kbd> '+w}}
let hudT=0;function hudStep(dt){hudT+=dt;if(hudT<.1)return;hudT=0;if(!F.on)return;$s('sdfAdemB').style.width=(F.adem*100).toFixed(0)+'%';$s('sdfAdem').classList.toggle('low',F.adem<.25);$s('sdfAdem').classList.toggle('on',F.sprint);
  const n=$s('sdSpdN');if(n){const t=(F.last?F.last+(F.last>1?" pizza's":' pizza')+(F.scheef?' · '+F.scheef+' scheef':''):'Fiets')+(F.surf==='zand'?' · zand':F.surf==='gras'?' · gras':'');if(n.textContent!==t)n.textContent=t}}

/* =================== elke frame =================== */
let built=false;
const stepHook=setInterval(()=>{if(!G.ready||!G.carStep)return;clearInterval(stepHook);const c0=G.carStep;
  G.carStep=function(dt){c0(dt);try{if(!built){built=true;buildRails(G.scene());buildSand(G.scene())}
      if(F.on)rideStep(dt);else if(F.bike&&F.v){F.v=0}
      // berijder bijwerken als je uiterlijk verandert
      F.lk=(F.lk||0)+dt;if(F.lk>3){F.lk=0;if(F.on)riderSync(false)}
      hudStep(dt);
      // ergens anders van de fiets gehaald (binnen, cutscene, gepakt)? Dan klopt G.driving niet meer
      if(F.on&&(!G.driving||G.car!==bikeObj)){F.on=false;riderShow(false);parkPose();place();ui.hidden=true;document.body.classList.remove('sd-fiets');if(G.driving&&G.car!==bikeObj){} }
    }catch(e){console.error('fiets',e)}}},100);

G.fiets={spawn,op,af,actief:()=>F.on,last,balans,bel,weg,
  scheef:n=>{if(n!=null){F.scheef=clamp(n|0,0,F.last);setBoxes()}return F.scheef},
  pos:()=>F.bike?{x:F.x,z:F.z,ry:F.ry}:null,snelheid:()=>Math.round(Math.abs(F.v)*3.6),adem:()=>F.adem,ondergrond:()=>F.surf,
  geparkeerd:()=>!!F.bike&&!F.on,obj:bikeObj,rails:RAILS,zand:SAND,model:decorBike,rijder:()=>riderSync(true),
  set onVal(f){F.onVal=f},get onVal(){return F.onVal},set onScheef(f){F.onScheef=f},get onScheef(){return F.onScheef},
  set onBalans(f){F.onBalans=f},get onBalans(){return F.onBalans},set onOp(f){F.onOp=f},get onOp(){return F.onOp},set onAf(f){F.onAf=f},get onAf(){return F.onAf},
  set onBel(f){F.onBel=f},get onBel(){return F.onBel},_F:F};
})();
