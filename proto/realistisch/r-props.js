// Spullen op straat voor het realistische prototype: bomen, lantaarns, auto's, bankjes, containers, het standbeeld, brugleuningen.
import * as THREE from 'three';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {rng,mk,canvasTex,shade,mix,jitter,tint,place,clamp,noiseCanvas} from './r-util.js';
import {personGeo} from './r-people.js';

const CARCOL=['#b3261e','#1f3f6a','#d9d9d6','#1d1d1f','#8a8f98','#2f6d3e','#e8e4da','#5a2a1a','#c9a227','#3a5a7a'];

function blob(r0,rr,det){let g=new THREE.IcosahedronGeometry(r0,det==null?2:det);g=BGU.mergeVertices(g,1e-4);const p=g.attributes.position,v=new THREE.Vector3();
  for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const k=1+(rr()-.5)*.42;v.multiplyScalar(k);v.y*=.82;p.setXYZ(i,v.x,v.y,v.z)}g.computeVertexNormals();
  const uv=g.attributes.uv;if(uv)for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*3,uv.getY(i)*2);return g}
function tree(batch,x,y,z,s,r,kind){const th=(kind==='stree'?3.2:2.7)*s;batch.add('bark',place(tint(new THREE.CylinderGeometry(.12*s,.22*s,th,8),jitter('#4a3a2a',r,10)),x,y+th/2,z));
  for(let i=0;i<3;i++){const a=r()*6.28,g=new THREE.CylinderGeometry(.04*s,.08*s,1.5*s,6);g.translate(0,.75*s,0);g.rotateZ(.7);g.rotateY(a);batch.add('bark',place(tint(g,'#4a3a2a'),x,y+th*.82,z))}
  const aut=r();const base=aut<.12?'#b98a2a':aut<.2?'#a8602a':aut<.27?'#8a9a34':['#3f6f2a','#4a7a2e','#55843a','#3a6628'][Math.floor(r()*4)];const n=9+Math.floor(r()*4),R0=(kind==='stree'?1.55:1.9)*s;
  for(let i=0;i<n;i++){const a=r()*6.28,e=r(),d=i===0?0:R0*(.3+e*.7),rad=R0*(i===0?.78:.36+r()*.26),yy=i===0?rad*.5:R0*(.15+(1-e)*.75+r()*.2);const k=.72+.4*clamp(yy/(R0*1.1),0,1);
    const gg=tint(blob(rad,r,2),shade(jitter(base,r,12),k),.2,r);batch.add('leaf',place(gg,x+Math.cos(a)*d,y+th+yy,z+Math.sin(a)*d,r()*6))}}
function palm(batch,x,y,z,s,r){const h=5.5*s;for(let i=0;i<6;i++){const t=i/6;batch.add('bark',place(tint(new THREE.CylinderGeometry(.16-.05*t,.19-.05*t,h/6+.02,8),jitter('#7a6a50',r,8)),x+Math.sin(t*1.2)*.5,y+h*(t+1/12),z))}
  for(let i=0;i<9;i++){const a=i/9*6.28+r()*.3;const g=new THREE.PlaneGeometry(.55,2.9,1,5);const p=g.attributes.position;for(let k=0;k<p.count;k++){const yy=p.getY(k)+1.45;p.setXYZ(k,p.getX(k)*(1-yy/3.4),yy,-(yy*yy)*.16)}g.computeVertexNormals();g.rotateX(1.05);g.rotateY(a);batch.add('leaf2',place(tint(g,jitter('#3f7a34',r,14)),x+.55,y+h,z))}}
function lamp(ctx,x,y,z,r){const b=ctx.batch,h=5.4;b.add('metalD',place(tint(new THREE.CylinderGeometry(.06,.09,h,8),'#2a2d31'),x,y+h/2,z));b.add('metalD',place(tint(new THREE.CylinderGeometry(.13,.15,.5,8),'#2a2d31'),x,y+.25,z));
  // arm naar de dichtstbijzijnde weg
  let ax=0,az=0;const M=ctx.M,T=M.T;for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){for(let k=1;k<=4;k++){const t=M.ground[Math.floor(z+dz*k)*M.W+Math.floor(x+dx*k)];if(t===T.ROAD||t===T.BRIDGE){ax=dx;az=dz;break}}if(ax||az)break}
  const L=1.3,ry=Math.atan2(ax,az);const arm=new THREE.BoxGeometry(.07,.07,L);arm.translate(0,0,L/2);b.add('metalD',place(tint(arm,'#2a2d31'),x,y+h-.05,z,ry));
  const hx=x+ax*L,hz=z+az*L;const head=new THREE.BoxGeometry(.3,.1,.62);b.add('metalD',place(tint(head,'#2a2d31'),hx,y+h-.06,hz,ry));
  b.add(ctx.night?'lampHeadOn':'lampHead',place(tint(new THREE.BoxGeometry(.22,.04,.5),'#fff2d0'),hx,y+h-.125,hz,ry));ctx.extra.lamps.push({x:hx,y:y+h-.2,z:hz})}

// auto: onderbak (geëxtrudeerd profiel), cabine van glas, dak, wielen, lampen
function carParts(){const body=new THREE.Shape();[[-2.18,.3],[-2.2,.72],[-2.02,.84],[-1.25,.9],[1.05,.92],[1.95,.8],[2.2,.62],[2.2,.32],[1.62,.3],[1.62,.44],[1.52,.6],[1.2,.66],[.88,.6],[.78,.44],[.78,.3],[-.95,.3],[-.95,.44],[-1.05,.6],[-1.37,.66],[-1.69,.6],[-1.79,.44],[-1.79,.3]].forEach((p,i)=>i?body.lineTo(p[0],p[1]):body.moveTo(p[0],p[1]));body.closePath();
  const bg=new THREE.ExtrudeGeometry(body,{depth:1.56,bevelEnabled:true,bevelThickness:.1,bevelSize:.07,bevelSegments:3,curveSegments:4});bg.translate(0,0,-.78);
  const cab=new THREE.Shape();[[-1.42,.9],[-.98,1.4],[.42,1.42],[1.02,.92]].forEach((p,i)=>i?cab.lineTo(p[0],p[1]):cab.moveTo(p[0],p[1]));cab.closePath();
  const cg=new THREE.ExtrudeGeometry(cab,{depth:1.3,bevelEnabled:true,bevelThickness:.08,bevelSize:.05,bevelSegments:2});cg.translate(0,0,-.65);
  const roof=new RoundedBoxGeometry(1.5,.07,1.42,2,.03);roof.translate(-.28,1.445,0);
  const pil=[];[[-1.2,1.15,.72,-.72],[.72,1.16,.72,.82],[-.3,1.18,.72,0]].forEach(([x,y,z,rot])=>{[1,-1].forEach(s=>{const p=new THREE.BoxGeometry(.07,.56,.05);p.rotateZ(rot);p.translate(x,y,z*s);pil.push(p)})});
  const wheels=[],rims=[];[[1.2,.33],[-1.37,.33]].forEach(([x,y])=>[1,-1].forEach(s=>{const w=new THREE.CylinderGeometry(.33,.33,.22,20);w.rotateX(Math.PI/2);w.translate(x,y,s*.8);wheels.push(w);const rm=new THREE.CylinderGeometry(.2,.2,.23,14);rm.rotateX(Math.PI/2);rm.translate(x,y,s*.8);rims.push(rm)}));
  const hl=[],tl=[];[1,-1].forEach(s=>{const h=new THREE.BoxGeometry(.06,.14,.36);h.translate(2.24,.66,s*.55);hl.push(h);const t=new THREE.BoxGeometry(.06,.12,.4);t.translate(-2.26,.74,s*.52);tl.push(t)});
  return {bg,cg,roof,pil,wheels,rims,hl,tl}}
let CP=null;
export function car(ctx,x,y,z,ry,o){o=o||{};CP=CP||carParts();const b=ctx.batch,r=ctx.rand,col=o.police?'#f1f1ee':o.taxi?'#e8b923':CARCOL[(o.v!=null?o.v:Math.floor(r()*CARCOL.length))%CARCOL.length];const ang=(ry||0)-Math.PI/2;
  const put=(key,g,c)=>b.add(key,place(tint(g.clone(),c),x,y,z,ang));
  put('paint',CP.bg,col);put('paint',CP.roof,o.taxi?'#e8b923':col);CP.pil.forEach(p=>put('paint',p,col));put('glassD',CP.cg,'#1a232c');CP.wheels.forEach(w=>put('rubber',w,'#17181a'));CP.rims.forEach(w=>put('metal',w,'#b9bcc0'));
  CP.hl.forEach(h=>put(ctx.night?'headOn':'head',h,'#fff6e0'));CP.tl.forEach(t=>put(ctx.night?'tailOn':'tail',t,'#c0261e'));
  if(o.police){const s=new THREE.BoxGeometry(4.2,.12,1.73);s.translate(0,.62,0);put('plain',s,'#1f4ea8');const lb=new THREE.BoxGeometry(.3,.12,1.0);lb.translate(-.28,1.54,0);put(ctx.night?'blueOn':'plain',lb,'#2a6cff')}
  if(o.taxi){const s=new THREE.BoxGeometry(.3,.14,.5);s.translate(-.28,1.55,0);put(ctx.night?'lampHeadOn':'plain',s,'#fff2a0')}
  if(ctx.night&&o.on){ctx.extra.lights.push({x:x+Math.sin(ry)*3.6,y:.7,z:z+Math.cos(ry)*3.6,c:0xfff0d0,i:10,d:22})}}

function bench(b,x,y,z,ry,r){const wood=jitter('#7a5a3a',r,10);for(let i=0;i<4;i++){const g=new THREE.BoxGeometry(1.7,.04,.1);g.translate(0,.46,(i-1.5)*.12);b.add('plain',place(tint(g,wood),x,y,z,ry))}
  for(let i=0;i<3;i++){const g=new THREE.BoxGeometry(1.7,.09,.035);g.translate(0,.62+i*.14,-.24-i*.03);b.add('plain',place(tint(g,wood),x,y,z,ry))}
  [-.72,.72].forEach(s=>{const g=new THREE.BoxGeometry(.06,.46,.5);g.translate(s,.23,0);b.add('metalD',place(tint(g,'#2a2d31'),x,y,z,ry));const g2=new THREE.BoxGeometry(.06,.6,.06);g2.translate(s,.6,-.27);b.add('metalD',place(tint(g2,'#2a2d31'),x,y,z,ry))})}
function container(ctx,x,y,z,rot,h,v){const cols=['#b3402a','#2f5d9a','#3c8a4a','#d6a63e','#7a8088','#8a3a5a'];for(let i=0;i<(h||1);i++){const g=new THREE.BoxGeometry(6.06,2.59,2.44);const uv=g.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*8,uv.getY(k));ctx.batch.add('corr',place(tint(g,cols[((v||0)+i)%cols.length]),x,y+1.3+i*2.6,z,rot?Math.PI/2:0))}}
function statue(ctx,x,y,z){const b=ctx.batch;b.add('stone',place(tint(new THREE.BoxGeometry(3.6,.4,3.6),'#a9a498'),x,y+.2,z));b.add('stone',place(tint(new THREE.BoxGeometry(2.4,1.7,2.4),'#b9b4a8'),x,y+1.25,z));b.add('stone',place(tint(new THREE.BoxGeometry(2.7,.2,2.7),'#c9c4b8'),x,y+2.2,z));
  personGeo({pose:'wijs',scale:1.9}).forEach(g=>b.add('gold',place(tint(g,'#d9a52a'),x,y+2.3,z,0)))}

export function buildProps(ctx){const {M,S,night,scene,batch,mats,fx,fz,R,G,extra}=ctx,r=ctx.rand,T=M.T;
  // materialen
  mats.bark=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.95});const lf=mk(256,256),lx=lf.getContext('2d');lx.fillStyle='#d6d6d6';lx.fillRect(0,0,256,256);const lr=rng(21);for(let i=0;i<2600;i++){const v=110+Math.floor(lr()*145);lx.fillStyle=`rgb(${v},${v},${v})`;lx.beginPath();lx.ellipse(lr()*256,lr()*256,2+lr()*5,1.5+lr()*3,lr()*3,0,7);lx.fill()}
  const lt=canvasTex(lf,true,true),lb=canvasTex(lf,false,true);mats.leaf=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,map:lt,bumpMap:lb,bumpScale:3});mats.leaf2=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.85,side:THREE.DoubleSide});
  mats.metalD=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.5,metalness:.7});mats.rubber=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9});
  mats.paint=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.48,metalness:.0,envMapIntensity:.14});
  mats.glassD=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.06,metalness:.85,envMapIntensity:1.1});
  mats.lampHead=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.4});mats.lampHeadOn=new THREE.MeshStandardMaterial({color:0xfff2d0,emissive:0xffd9a0,emissiveIntensity:5});
  mats.head=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.15,metalness:.3});mats.headOn=new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xfff2d8,emissiveIntensity:5});
  mats.tail=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.3});mats.tailOn=new THREE.MeshStandardMaterial({color:0xff2a1a,emissive:0xff1a0a,emissiveIntensity:5});
  mats.blueOn=new THREE.MeshStandardMaterial({color:0x2a6cff,emissive:0x2a6cff,emissiveIntensity:8});
  mats.stone=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8});mats.gold=new THREE.MeshStandardMaterial({color:0xd9a52a,roughness:.28,metalness:1,envMapIntensity:1.4});
  const cc=mk(128,64),cx2=cc.getContext('2d'),cb=mk(128,64),cbx=cb.getContext('2d');cx2.fillStyle='#fff';cx2.fillRect(0,0,128,64);cbx.fillStyle='#808080';cbx.fillRect(0,0,128,64);for(let x=0;x<128;x+=16){cx2.fillStyle='rgba(0,0,0,.16)';cx2.fillRect(x,0,5,64);cbx.fillStyle='#404040';cbx.fillRect(x,0,6,64);cbx.fillStyle='#b0b0b0';cbx.fillRect(x+8,0,6,64)}
  mats.corr=new THREE.MeshStandardMaterial({map:canvasTex(cc,true,true),bumpMap:canvasTex(cb,false,true),bumpScale:2,vertexColors:true,roughness:.55,metalness:.4});
  mats.glow=new THREE.MeshBasicMaterial({map:glowTex(),transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,color:0xffc27a,opacity:night?(ctx.TM.glow||.15):0});
  const near=(p,m)=>Math.abs(p.x-fx)<R+(m||0)&&Math.abs(p.z-fz)<R+(m||0);
  M.props.forEach((p,i)=>{if(!near(p,4))return;const y=G.hAt(p.x,p.z),pr=rng(i*7919+3);
    switch(p.k){
      case 'tree':tree(batch,p.x,y,p.z,p.s||1,pr,'tree');break;
      case 'stree':tree(batch,p.x,y,p.z,(p.s||1)*.9,pr,'stree');batch.add('metalD',place(tint(new THREE.BoxGeometry(1.3,.03,1.3),'#3a3d42'),p.x,y+.015,p.z));break;
      case 'palm':palm(batch,p.x,y,p.z,p.s||1,pr);break;
      case 'lamp':lamp(ctx,p.x,y,p.z,pr);break;
      case 'bin':batch.add('metalD',place(tint(new THREE.CylinderGeometry(.26,.22,.85,12),'#2f4a36'),p.x,y+.43,p.z));batch.add('metalD',place(tint(new THREE.CylinderGeometry(.29,.29,.07,12),'#1d2a22'),p.x,y+.88,p.z));break;
      case 'bollard':batch.add('metalD',place(tint(new THREE.CylinderGeometry(.09,.1,.9,10),'#3a3d42'),p.x,y+.45,p.z));batch.add('metalD',place(tint(new THREE.SphereGeometry(.1,10,6),'#3a3d42'),p.x,y+.9,p.z));break;
      case 'bench':bench(batch,p.x,y,p.z,(p.rot||0)*Math.PI/2,pr);break;
      case 'hedge':{const g=new RoundedBoxGeometry(1.04,1.0,1.04,2,.16);batch.add('leaf',place(tint(g,jitter('#3a6a2c',pr,12),.25,pr),p.x,y+.5,p.z));break}
      case 'car':car(ctx,p.x,G.hAt(p.x,p.z)>0?0:0,p.z,p.rot?(p.dir>0?0:Math.PI):(p.dir>0?Math.PI/2:-Math.PI/2),{v:p.v});break;
      case 'police':car(ctx,p.x,0,p.z,p.rot?0:Math.PI/2,{police:1});break;
      case 'container':container(ctx,p.x,y,p.z,p.rot,p.h,p.v);break;
      case 'dumpster':batch.add('corr',place(tint(new THREE.BoxGeometry(1.9,1.15,1.1),'#2f5a3a'),p.x,y+.6,p.z,(p.rot||0)*Math.PI/2));batch.add('plain',place(tint(new THREE.BoxGeometry(1.95,.07,1.15),'#1d1d1f'),p.x,y+1.2,p.z,(p.rot||0)*Math.PI/2));break;
      case 'wreck':for(let k=0;k<(p.h||1);k++)batch.add('corr',place(tint(new RoundedBoxGeometry(2.6,.85,4.4,2,.25),['#7a4a2a','#5a5d62','#8a3a2a'][(p.v+k)%3]),p.x,y+.45+k*.9,p.z,(pr()-.5)*.3));break;
      case 'umbrella':{const cols=['#e8584a','#f0b23a','#3a8ad6','#f1efe9'];batch.add('metalD',place(tint(new THREE.CylinderGeometry(.03,.03,2.3,6),'#d9d9d9'),p.x,y+1.15,p.z));const g=new THREE.ConeGeometry(1.5,.5,12,1,true);batch.add('cloth',place(tint(g,cols[(p.v||0)%4]),p.x,y+2.25,p.z));break}
      case 'statue':statue(ctx,p.x,y,p.z);break;
      case 'boat':{const L=p.l||5;const g=new RoundedBoxGeometry(1.9,.9,L,3,.4);batch.add('paint',place(tint(g,['#f1efe9','#2f5d9a','#b3261e'][(p.v||0)%3]),p.x,-.3,p.z,p.rot?0:Math.PI/2));const c2=new RoundedBoxGeometry(1.3,.7,L*.35,2,.15);batch.add('plain',place(tint(c2,'#e8e4da'),p.x,.4,p.z,p.rot?0:Math.PI/2));break}
      case 'billboard':{[-2.6,2.6].forEach(s=>batch.add('metalD',place(tint(new THREE.CylinderGeometry(.12,.12,7,8),'#3a3d42'),p.x+s,y+3.5,p.z)));batch.add('plain',place(tint(new THREE.BoxGeometry(7,3.2,.2),['#e8584a','#2f5d9a','#f0b23a'][(p.v||0)%3]),p.x,y+6,p.z));break}
      case 'arch':{[-5,5].forEach(s=>batch.add('metalD',place(tint(new THREE.BoxGeometry(.8,6.5,.8),'#2a2d31'),p.x,3.25,p.z+s)));batch.add('plain',place(tint(new THREE.BoxGeometry(1,1.3,11),'#e8a021'),p.x,6.6,p.z));break}
      case 'crane':{if(S.noCrane)break;const yb='#e0b020';[[-3,-3],[3,-3],[-3,3],[3,3]].forEach(([a,c])=>batch.add('plain',place(tint(new THREE.BoxGeometry(.6,22,.6),yb),p.x+a,11,p.z+c)));batch.add('plain',place(tint(new THREE.BoxGeometry(7,1.2,7),yb),p.x,22,p.z));const boom=new THREE.BoxGeometry(34,1.4,1.6);batch.add('plain',place(tint(boom,yb),p.x+8,24,p.z));batch.add('plain',place(tint(new THREE.BoxGeometry(4,3,3),'#55585c'),p.x-4,24.5,p.z));break}
      case 'wall':batch.add('stone',place(tint(new THREE.BoxGeometry(p.w||6,2.2,.4),'#9a968e'),p.x,y+1.1,p.z,(p.rot||0)*Math.PI/2));break;
      case 'tower':batch.add('stone',place(tint(new THREE.BoxGeometry(3,9,3),'#8a8c90'),p.x,y+4.5,p.z));batch.add('plain',place(tint(new THREE.BoxGeometry(4,.3,4),'#55585c'),p.x,y+9.1,p.z));break;
    }});
  // extra spullen voor dit beeld (koffiekar)
  (S.props||[]).forEach(p=>{const y=G.hAt(p.x,p.z),ry=p.ry||0,P=(g,c,key)=>batch.add(key||'plain',place(tint(g,c),p.x,y,p.z,ry));
    if(p.k==='kar'){let g=new RoundedBoxGeometry(2.0,.95,1.0,2,.05);g.translate(0,.78,0);P(g,'#b3261e');g=new THREE.BoxGeometry(2.1,.06,1.1);g.translate(0,1.28,0);P(g,'#e8dcc4');
      [-.7,.7].forEach(sx=>{const w=new THREE.CylinderGeometry(.3,.3,.08,18);w.rotateX(Math.PI/2);w.translate(sx,.3,.52);P(w,'#2a2c30','rubber');const w2=w.clone();w2.translate(0,0,-1.04);P(w2,'#2a2c30','rubber')});
      [[-.95,-.48],[.95,-.48],[-.95,.48],[.95,.48]].forEach(([a,c])=>{const q=new THREE.CylinderGeometry(.025,.025,1.25,6);q.translate(a,1.9,c);P(q,'#d9d9d9','metalD')});
      for(let i=0;i<8;i++){const q=new THREE.BoxGeometry(.3,.05,1.5);q.rotateX(0);q.translate(-1.05+i*.3,2.55,0);P(q,i%2?'#f1efe9':'#b3261e','cloth')}
      g=new RoundedBoxGeometry(.6,.45,.45,2,.04);g.translate(-.45,1.55,-.1);P(g,'#c8ccd2','metal');g=new THREE.CylinderGeometry(.09,.09,.3,10);g.translate(.3,1.45,-.15);P(g,'#c8ccd2','metal');
      [[.55,.2],[.7,.2],[.62,.32]].forEach(([a,c])=>{const q=new THREE.CylinderGeometry(.04,.032,.09,10);q.translate(a,1.355,c);P(q,'#f1efe9')});
      g=new THREE.BoxGeometry(1.2,.3,.03);g.translate(0,.85,.515);P(g,'#f1efe9')}});
  // extra auto's op de weg voor dit beeld
  (S.cars||[]).forEach(c=>car(ctx,c.x,0,c.z,c.ry,{v:c.v,taxi:c.taxi,police:c.police,on:1}));
  // lichtvlekken onder lantaarns (nacht)
  if(night)extra.lamps.forEach(l=>{if(Math.hypot(l.x-fx,l.z-fz)>R)return;const g=new THREE.PlaneGeometry(13,13);g.rotateX(-Math.PI/2);batch.add('glow',place(g,l.x,G.hAt(l.x,l.z)+.03,l.z))});
  // brugleuningen
  (G.rails||[]).forEach(q=>{const along=q.dx?[0,1]:[1,0];const g=new THREE.BoxGeometry(along[0]?1:.08,.06,along[1]?1:.08);batch.add('metalD',place(tint(g,'#3a3d42'),q.x-(q.dx<0?0:0)+(q.dx>0?-.06:q.dx<0?.06:0),1.02,q.z+(q.dz>0?-.06:q.dz<0?.06:0)));
    const g2=g.clone();batch.add('metalD',place(tint(g2,'#3a3d42'),q.x+(q.dx>0?-.06:q.dx<0?.06:0),.55,q.z+(q.dz>0?-.06:q.dz<0?.06:0)));
    if((Math.floor(q.x)+Math.floor(q.z))%2===0)batch.add('metalD',place(tint(new THREE.BoxGeometry(.1,1.05,.1),'#3a3d42'),q.x+(q.dx>0?-.06:q.dx<0?.06:0),.52,q.z+(q.dz>0?-.06:q.dz<0?.06:0)))});
}
function glowTex(){const c=mk(128,128),x=c.getContext('2d'),g=x.createRadialGradient(64,64,0,64,64,64);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.42)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,128,128);return new THREE.CanvasTexture(c)}
