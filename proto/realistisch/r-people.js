// Mensen voor het realistische prototype: ronde lichamen uit capsules en bollen, met kleding, kapsel, hoofddeksel en een gezicht.
import * as THREE from 'three';
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {rng,shade} from './r-util.js';

export const LOOKS=[
 {skin:'#e7b68e',hair:'#6a1a22',hs:'kort',top:'#1c2740',pants:'#191b21',shoe:'#e8e4da',col:'jas'},                 // 0 jij
 {skin:'#f1caa5',hair:'#c9a24a',hs:'lang',top:'#b0303a',pants:'#22304a',shoe:'#2a2c30',v:1},
 {skin:'#8d5a3a',hair:'#151517',hs:'kort',top:'#e8e4da',pants:'#3a3c40',shoe:'#0e0f12',fh:'baard'},
 {skin:'#d9a27a',hair:'#2a1d14',hs:'zij',top:'#2a2c30',pants:'#2a2c30',shoe:'#0e0f12',col:'pak',tie:'#7a1f2a'},      // 3 zakenman
 {skin:'#e9b98f',hair:'#4a2e1a',hs:'staart',top:'#3a8ad6',pants:'#1d1d1f',shoe:'#e8e4da',v:1},
 {skin:'#b97a52',hair:'#151517',hs:'kort',top:'#5a3a7a',pants:'#2c3a4d',shoe:'#e8e4da',hat:'beanie',hatC:'#c0261e',col:'hoodie'},
 {skin:'#f1caa5',hair:'#8a6a3a',hs:'bob',top:'#c9b48a',pants:'#5a5a62',shoe:'#3a2a20',v:1,acc:{bril:1}},
 {skin:'#6e4630',hair:'#151517',hs:'afro',top:'#f0b23a',pants:'#22304a',shoe:'#e8e4da'},
 {skin:'#e9b98f',hair:'#d8d4cc',hs:'kalend',top:'#4a6a5a',pants:'#3a3c40',shoe:'#3a2a20',hat:'hat',hatC:'#3a2a1a',age:2},
 {skin:'#d9a27a',hair:'#151517',hs:'kort',top:'#7a5a8a',pants:'#1d1d1f',shoe:'#2a2c30',v:1,hat:'hijab',hatC:'#2f6a8a'},
 {skin:'#f1caa5',hair:'#2a1d14',hs:'kuif',top:'#f07a1a',pants:'#2f5d9a',shoe:'#3a2a20',hat:'cap',hatC:'#2a2c30',col:'werk'},
 {skin:'#d9a27a',hair:'#3a2a1a',hs:'zij',top:'#f1efe9',pants:'#2c3a4d',shoe:'#3a2a20',fh:'snor',col:'schort',age:1,acc:{}}, // 11 Luigi van de koffiekar
 {skin:'#8d5a3a',hair:'#151517',hs:'vlecht',top:'#3fe395',pants:'#1d1d1f',shoe:'#e8e4da',v:1},
 {skin:'#e9b98f',hair:'#8a2f1a',hs:'krul',top:'#2f6a8a',pants:'#c9b48a',shoe:'#3a2a20',v:1},
 {skin:'#b97a52',hair:'#2a1d14',hs:'opgeschoren',top:'#1d1d1f',pants:'#3a3c40',shoe:'#0e0f12',fh:'stoppel',col:'leer'}
];

const cap=(r,len,seg)=>{const g=new THREE.CapsuleGeometry(r,len,5,seg||12);g.translate(0,-len/2,0);return g};
// geeft een lijst {g, part} terug; voeten op y=0, kijkrichting +z
export function personParts(look,o){look=look||LOOKS[0];o=o||{};const L=[],add=(g,part)=>{L.push({g,part});return g};const r=rng(o.seed||7);
  const W=(look.v?.93:1)*(look.w||1),pose=o.pose||'sta',ph=o.ph||0;
  // houding
  let lf=0,rf=0,lk=.04,rk=.04,la=0,ra=0,le=.18,re=.18,laz=.07,raz=.07,lean=0,bob=0;
  if(pose==='loop'){const s=Math.sin(ph);rf=s*.52;lf=-s*.52;rk=Math.max(0,-Math.cos(ph))*.75+.06;lk=Math.max(0,Math.cos(ph))*.75+.06;la=s*.42;ra=-s*.42;le=.38;re=.38;lean=.05;bob=Math.abs(Math.cos(ph))*.02}
  else if(pose==='bel'){ra=.95;re=2.25;raz=.25;lf=.03}
  else if(pose==='praat'){ra=.55;re=1.35;raz=.1;la=.12;le=.5}
  else if(pose==='wijs'){ra=2.7;re=.05;raz=.12;la=-.15;lf=.12;rf=-.06}
  else if(pose==='sta'){lf=.03;rf=-.03;le=.2;re=.26}
  if(o.umb){ra=1.25;re=1.75;raz=.05}
  const root=new THREE.Object3D();root.position.y=bob;root.rotation.x=lean;
  const J=(parent,x,y,z,rx,rz)=>{const j=new THREE.Object3D();j.position.set(x,y,z);j.rotation.set(rx||0,0,rz||0);parent.add(j);return j};
  const hipY=.94,Lu=.44,Ll=.43;
  const legs=[[-1,lf,lk],[1,rf,rk]].map(([s,f,k])=>{const hip=J(root,s*.092*W,hipY,0,-f,0),knee=J(hip,0,-Lu,0,k,0),ank=J(knee,0,-Ll,0,-k+f*.6,0);return {hip,knee,ank}});
  const shY=1.445,arms=[[-1,la,le,laz],[1,ra,re,raz]].map(([s,f,e,z])=>{const sh=J(root,s*.212*W,shY,0,-f,s*z),el=J(sh,0,-.28,0,-e,0),ha=J(el,0,-.27,0,0,0);return {sh,el,ha}});
  root.updateMatrixWorld(true);
  const at=(g,obj)=>{g.applyMatrix4(obj.matrixWorld);return g};
  const armSkin=look.arm==='skin'||look.col==='tank';
  legs.forEach(l=>{add(at(cap(.076,Lu,10),l.hip),'pants');add(at(cap(.058,Ll,10),l.knee),'pants');const f=new RoundedBoxGeometry(.105,.085,.265,2,.035);f.translate(0,-.03,.065);add(at(f,l.ank),'shoe')});
  arms.forEach(a=>{add(at(cap(.052,.28,10),a.sh),'top');add(at(cap(.044,.27,10),a.el),armSkin?'skin':'top');const h=new THREE.SphereGeometry(.047,10,8);h.scale(.85,1.25,.7);h.translate(0,-.03,0);add(at(h,a.ha),'skin')});
  // romp
  const pel=new THREE.SphereGeometry(.172,14,10);pel.scale(1.02*W*(look.v?1.05:1),.72,.74);pel.translate(0,.985,0);add(at(pel,root),'pants');
  const tor=new THREE.CapsuleGeometry(.168,.3,6,16);tor.scale(1.1*W,1,.7);tor.translate(0,1.265,0);add(at(tor,root),'top');
  const sho=new THREE.CapsuleGeometry(.07,.3*W,4,10);sho.rotateZ(Math.PI/2);sho.translate(0,1.455,0);add(at(sho,root),'top');
  if(look.col==='pak'||look.col==='jas'||look.col==='leer'){// jas: onderrand en revers
    const hem=new THREE.CylinderGeometry(.205*W,.215*W,.16,16,1,true);hem.scale(1,1,.72);hem.translate(0,1.0,0);add(at(hem,root),'top');
    if(look.col==='pak'){const sh=new THREE.BoxGeometry(.09,.25,.02);sh.translate(0,1.36,.118);add(at(sh,root),'white');const t=new THREE.BoxGeometry(.035,.22,.012);t.translate(0,1.35,.131);add(at(t,root),'tie')}}
  if(look.col==='schort'){const ap=new THREE.BoxGeometry(.3*W,.5,.02);ap.translate(0,1.1,.125);add(at(ap,root),'white')}
  if(look.col==='hoodie'){const hd=new THREE.SphereGeometry(.1,10,8);hd.scale(1.3,.7,.8);hd.translate(0,1.5,-.1);add(at(hd,root),'top')}
  if(look.col==='werk'){const st=new THREE.CylinderGeometry(.19*W,.19*W,.05,14,1,true);st.scale(1,1,.72);st.translate(0,1.2,0);add(at(st,root),'white')}
  const neck=new THREE.CylinderGeometry(.05,.056,.1,10);neck.translate(0,1.555,0);add(at(neck,root),'skin');
  // hoofd: bol met een smallere kaak, een getekend gezicht (blos, lippen, schaduw) en losse ogen, neus, oren en lippen
  const HY=1.69,hr=.108,HS=[.94,1.2,1.1];const head=new THREE.SphereGeometry(hr,36,26);
  {const p=head.attributes.position;for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const t=Math.max(0,Math.min(1,-y/hr)),u=Math.max(0,Math.min(1,y/hr));x*=1-.2*t*t-.05*u*u;z*=1-.1*t*t;if(z>0)z+=.004*t;if(z<0)z*=1-.05*u;p.setXYZ(i,x,y,z)}head.computeVertexNormals()}
  head.scale(HS[0],HS[1],HS[2]);head.translate(0,HY,0);add(at(head,root),'face');
  const H=(g,x,y,z)=>{g.translate(x||0,HY+(y||0),z||0);return at(g,root)};
  [-1,1].forEach(s=>{const e=new THREE.SphereGeometry(.0195,14,10);e.scale(1.25,.84,.7);add(H(e,s*.0375,.012,.0925),'white');const i=new THREE.SphereGeometry(.0098,12,8);i.scale(1,1,.5);add(H(i,s*.0375,.011,.1045),'iris');
    const pu=new THREE.SphereGeometry(.005,8,6);pu.scale(1,1,.5);add(H(pu,s*.0375,.011,.1082),'dark');const hl=new THREE.SphereGeometry(.002,6,4);add(H(hl,s*.0375+.004,.015,.1098),'white');
    const lid=new THREE.SphereGeometry(.0212,14,6,0,6.283,0,.86);lid.scale(1.25,.88,.72);add(H(lid,s*.0375,.0125,.0925),'skin');const ls=new THREE.TorusGeometry(.0215,.0016,4,14,2.5);ls.rotateZ(.32);ls.scale(1.2,.55,1);add(H(ls,s*.0375,.0135,.107),'dark');
    const ck=new THREE.SphereGeometry(.03,10,8);ck.scale(1,.78,.55);add(H(ck,s*.05,-.022,.066),'skin');
    const br=new THREE.BoxGeometry(.036,.0085,.012);br.rotateZ(s*.07);add(H(br,s*.039,.041,.0985),'hair');const ear=new THREE.SphereGeometry(.024,10,8);ear.scale(.45,1,.72);add(H(ear,s*.1,.0,-.004),'skin')});
  const rid=new THREE.CapsuleGeometry(.011,.062,3,8);rid.rotateZ(Math.PI/2);rid.scale(1,1,.7);add(H(rid,0,.036,.088),'skin');const chin=new THREE.SphereGeometry(.028,10,8);chin.scale(1.1,.75,.75);add(H(chin,0,-.1,.064),'skin');
  const nose=new THREE.SphereGeometry(.0165,12,10);nose.scale(.82,1.2,1.25);add(H(nose,0,-.016,.104),'skin');const nb=new THREE.CapsuleGeometry(.0085,.03,3,8);nb.rotateX(.28);add(H(nb,0,.006,.1),'skin');
  const ul=new THREE.SphereGeometry(.022,12,8);ul.scale(1,.2,.4);add(H(ul,0,-.0535,.0925),'lip');const ll=new THREE.SphereGeometry(.02,12,8);ll.scale(1,.27,.42);add(H(ll,0,-.0625,.0915),'lip');
  // gezichtshaar en bril
  const fh=look.fh||'';if(fh==='baard'||fh==='ringbaard'){const b=new THREE.SphereGeometry(hr*1.04,20,10,Math.PI/2-1.75,3.5,1.72,1.2);b.scale(1,1.2,1.1);add(H(b,0,0,.006),'hair')}
  if(fh==='snor'||fh==='ringbaard'){const m=new THREE.BoxGeometry(.05,.012,.014);add(H(m,0,-.04,.103),'hair')}
  if(fh==='sik'){const m=new THREE.SphereGeometry(.018,8,6);m.scale(1,1.3,.8);add(H(m,0,-.095,.09),'hair')}
  const A=look.acc||{};if(A.bril||A.zon){[-1,1].forEach(s=>{if(A.zon){const g=new THREE.BoxGeometry(.04,.026,.008);add(H(g,s*.037,.012,.114),'dark')}else{const g=new THREE.TorusGeometry(.019,.0035,6,16);add(H(g,s*.037,.012,.112),'dark')}});const br=new THREE.BoxGeometry(.03,.004,.004);add(H(br,0,.014,.114),'dark');
    [-1,1].forEach(s=>{const t=new THREE.BoxGeometry(.004,.004,.11);add(H(t,s*.062,.016,.06),'dark')})}
  // haar
  const hat=look.hat||'none',hs=look.hs||'kort';const capG=(k,th,tilt)=>{const g=new THREE.SphereGeometry(hr*k,22,12,0,6.283,0,th||1.62);g.rotateX(tilt==null?-.44:tilt);g.scale(HS[0],HS[1],HS[2]);return g};
  if(hat==='none'||hat==='cap'||hat==='beanie'||hat==='hat'||hat==='pet'){
    if(hs==='kaal'){}
    else if(hs==='kalend'){const g=new THREE.SphereGeometry(hr*1.04,20,8,Math.PI/2+1.0,6.283-2.0,.95,.8);g.scale(1,1.2,1.08);add(H(g,0,0,-.012),'hair')}
    else if(hs==='afro'){const g=new THREE.SphereGeometry(hr*1.5,18,14);add(H(g,0,.05,-.02),'hair')}
    else if(hs==='krul'){for(let i=0;i<14;i++){const a=r()*6.28,e=.2+r()*1.3,g=new THREE.SphereGeometry(.045+r()*.02,8,6);add(H(g,Math.sin(a)*Math.sin(e)*hr*1.02,Math.cos(e)*hr*1.2+.01,Math.cos(a)*Math.sin(e)*hr*1.05-.02),'hair')}}
    else{add(H(capG(hs==='opgeschoren'?1.03:1.08,hs==='zij'?1.5:1.58),0,.008,-.014),'hair');if(hs!=='opgeschoren')[-1,1].forEach(s=>{const sb=new THREE.SphereGeometry(.03,8,6);sb.scale(.45,1.3,1);add(H(sb,s*.094,.03,.022),'hair')});
      if(hs==='zij'){const fr=new THREE.SphereGeometry(.05,10,8);fr.scale(1.5,.5,.8);add(H(fr,.02,.098,.062),'hair')}
      if(hs==='lang'||hs==='vlecht'){const g=new THREE.CapsuleGeometry(.1,.2,5,12);g.scale(1.08,1,.62);add(H(g,0,-.13,-.06),'hair')}
      if(hs==='bob'){const g=new THREE.SphereGeometry(.125,14,10);g.scale(1,1.05,.95);add(H(g,0,-.04,-.03),'hair')}
      if(hs==='knot'){const g=new THREE.SphereGeometry(.05,10,8);add(H(g,0,.13,-.06),'hair')}
      if(hs==='staart'){const g=cap(.03,.2,8);g.rotateX(-.5);add(H(g,0,.02,-.11),'hair')}
      if(hs==='kuif'){const g=new THREE.SphereGeometry(.06,10,8);g.scale(1.2,.8,1);add(H(g,0,.115,.05),'hair')}
      if(hs==='hanenkam'){const g=new THREE.BoxGeometry(.03,.09,.2);add(H(g,0,.15,-.01),'hair')}}}
  if(hat==='cap'||hat==='pet'){const g=capG(1.1,1.45,-.3);add(H(g,0,.012,-.006),'hat');const b=new THREE.CylinderGeometry(.085,.085,.012,14,1,false,-1.1,2.2);b.scale(1,1,1.25);add(H(b,0,.045,.075),hat==='pet'?'dark':'hat');if(hat==='pet'){const t=new THREE.CylinderGeometry(.125,.112,.045,18);add(H(t,0,.105,-.005),'hat');const bd=new THREE.BoxGeometry(.03,.03,.01);add(H(bd,0,.08,.112),'gold')}}
  else if(hat==='beanie'){add(H(capG(1.13,1.5,-.36),0,.016,-.008),'hat')}
  else if(hat==='hat'){const c=new THREE.CylinderGeometry(.098,.11,.1,18);add(H(c,0,.125,-.005),'hat');const b=new THREE.CylinderGeometry(.19,.19,.012,22);add(H(b,0,.078,-.005),'hat')}
  else if(hat==='hijab'){const g=new THREE.SphereGeometry(hr*1.14,22,16,0,6.283,0,2.5);g.scale(1,1.22,1.1);add(H(g,0,.004,-.016),'hat');const d=new THREE.CapsuleGeometry(.1,.06,4,12);d.scale(1.25,1,.9);add(H(d,0,-.2,.0),'hat');
    const face=new THREE.SphereGeometry(hr*.98,18,12);face.scale(.86,1.02,.6);add(H(face,0,-.012,.062),'skin')}
  else if(hat==='hood'){const g=new THREE.SphereGeometry(hr*1.2,20,14,0,6.283,0,2.3);g.scale(1,1.2,1.12);add(H(g,0,.01,-.03),'top')}
  // telefoon, paraplu
  if(pose==='bel'){const p=new THREE.BoxGeometry(.012,.14,.07);p.translate(.0,-.02,.03);add(at(p,arms[1].ha),'dark')}
  if(o.umb){const st=new THREE.CylinderGeometry(.008,.008,.95,6);st.translate(0,.42,.02);const m=arms[1].ha.matrixWorld.clone();const pos=new THREE.Vector3().setFromMatrixPosition(m);st.translate(pos.x,pos.y,pos.z);add(st,'dark');
    const cn=new THREE.ConeGeometry(.62,.2,10,1,true);cn.translate(pos.x,pos.y+.92,pos.z);add(cn,'umb')}
  const sc=(look.h||1)*(o.scale||1);if(sc!==1)L.forEach(p=>p.g.scale(sc,sc,sc));
  return L}
function mixc(a,b,t){const h=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)],A=h(a),B=h(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
export function personGeo(o){return personParts(null,o).filter(p=>!['white','dark','lip','iris'].includes(p.part)).map(p=>p.g.index?p.g.toNonIndexed():p.g)}

const MAT={};const FT=new Map();
function faceTex(look){if(FT.has(look))return FT.get(look);const c=document.createElement('canvas');c.width=512;c.height=256;const x=c.getContext('2d'),sk=look.skin||'#d9a27a';x.fillStyle=sk;x.fillRect(0,0,512,256);
  const E=(cx,cy,rx,ry,col)=>{const g=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(rx,ry));g.addColorStop(0,col);g.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));x.save();x.translate(cx,cy);x.scale(rx/Math.max(rx,ry),ry/Math.max(rx,ry));x.translate(-cx,-cy);x.fillStyle=g;x.fillRect(cx-90,cy-90,180,180);x.restore()};
  // schaduw onder de kaak en bij de haargrens, blos, oogkassen, neus
  const g=x.createLinearGradient(0,150,0,256);g.addColorStop(0,'rgba(60,25,15,0)');g.addColorStop(1,'rgba(60,25,15,.3)');x.fillStyle=g;x.fillRect(0,150,512,106);
  E(100,137,26,18,'rgba(225,95,80,.2)');E(156,137,26,18,'rgba(225,95,80,.2)');E(100,118,17,10,'rgba(70,35,25,.2)');E(156,118,17,10,'rgba(70,35,25,.2)');E(128,146,10,5,'rgba(70,30,20,.28)');E(128,104,40,26,'rgba(255,235,215,.1)');
  // mond: lijn en hoekjes (de lippen zelf zijn 3D)
  x.strokeStyle='rgba(70,25,25,.75)';x.lineWidth=1.6;x.beginPath();x.moveTo(113,163);x.quadraticCurveTo(128,167.5,143,163);x.stroke();E(111,162,5,4,'rgba(70,30,25,.3)');E(145,162,5,4,'rgba(70,30,25,.3)');
  if(look.age>=1){x.strokeStyle='rgba(70,35,25,.22)';x.lineWidth=1.4;x.beginPath();x.moveTo(110,146);x.quadraticCurveTo(105,156,108,166);x.moveTo(146,146);x.quadraticCurveTo(151,156,148,166);x.stroke()}
  if(look.age>=2){x.strokeStyle='rgba(70,35,25,.2)';x.lineWidth=1.1;[92,98].forEach(y=>{x.beginPath();x.moveTo(104,y);x.quadraticCurveTo(128,y-3,152,y);x.stroke()});[[84,120],[172,120]].forEach(([a,b])=>{x.beginPath();x.moveTo(a,b-3);x.lineTo(a+(a<128?-7:7),b-5);x.moveTo(a,b+1);x.lineTo(a+(a<128?-7:7),b+2);x.stroke()})}
  if(look.fh==='stoppel'||look.fh==='baard'||look.fh==='ringbaard'||look.fh==='sik'){const h=look.hair||'#2a1d14';x.fillStyle=h;x.globalAlpha=.16;for(let i=0;i<2600;i++){const a=60+Math.random()*136,b2=150+Math.random()*70;if(b2<158&&Math.abs(a-128)<12)continue;x.fillRect(a,b2,1.3,1.3)}x.globalAlpha=1}
  const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=8;FT.set(look,t);return t}
function mat(part,look){if(part==='face'){if(!look._fm)look._fm=new THREE.MeshPhysicalMaterial({map:faceTex(look),roughness:.56,sheen:.5,sheenRoughness:.6,sheenColor:new THREE.Color('#ffb090')});return look._fm}
  const col={iris:look.eye||'#4a3320',skin:look.skin,top:look.top,pants:look.pants,shoe:look.shoe,hair:look.hair,hat:look.hatC||'#2a2c30',white:'#f1efe9',dark:'#15161a',lip:look.lip||mixc(look.skin,look.v?'#b04a58':'#9a5a52',look.v?.62:.45),tie:look.tie||'#7a1f2a',gold:'#e8b923',umb:look.umbC||'#1d1d1f'}[part]||'#888';
  const k=part+col;if(MAT[k])return MAT[k];const P=part==='skin'?{roughness:.58,sheen:.5,sheenRoughness:.6,sheenColor:new THREE.Color('#ffb090')}:part==='hair'?{roughness:.45}:part==='shoe'?{roughness:.5}:part==='dark'?{roughness:.25}:part==='white'?{roughness:.3}:part==='gold'?{roughness:.3,metalness:1}:{roughness:.86};
  return MAT[k]=part==='skin'?new THREE.MeshPhysicalMaterial(Object.assign({color:col},P)):new THREE.MeshStandardMaterial(Object.assign({color:col,side:part==='umb'||part==='top'?THREE.DoubleSide:THREE.FrontSide},P))}
export function makePerson(look,o){const by={};personParts(look,o).forEach(p=>{let g=p.g.index?p.g.toNonIndexed():p.g;if(p.part!=='face')g.deleteAttribute('uv');(by[p.part]=by[p.part]||[]).push(g)});const grp=new THREE.Group();
  Object.keys(by).forEach(part=>{const g=BGU.mergeGeometries(by[part],false);if(!g)return;const m=new THREE.Mesh(g,mat(part,look));m.castShadow=true;m.receiveShadow=true;grp.add(m)});return grp}
