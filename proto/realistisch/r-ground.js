// Grond voor het realistische prototype: één grote textuur (kleur, ruwheid, reliëf) uit de tegelkaart, met verhoogde stoepen,
// stoepranden, kademuren, wegmarkering, zebrapaden, putdeksels, vlekken en (bij regen) plassen.
import * as THREE from 'three';
import {rng,clamp,mk,canvasTex,noiseCanvas,tint} from './r-util.js';

export const CURB=.14;
export function buildGround(M,o){
  const T=M.T,W=M.W,H=M.H,g=M.ground;
  const x0=Math.max(0,Math.floor(o.cx-o.R)),x1=Math.min(W,Math.ceil(o.cx+o.R)),z0=Math.max(0,Math.floor(o.cz-o.R)),z1=Math.min(H,Math.ceil(o.cz+o.R));
  const PX=o.PX||6,cw=(x1-x0)*PX,ch=(z1-z0)*PX,wet=!!o.wet;
  const C=mk(cw,ch),Rg=mk(cw,ch),B=mk(cw,ch),c=C.getContext('2d'),r=Rg.getContext('2d'),b=B.getContext('2d');
  const at=(x,z)=>x<0||z<0||x>=W||z>=H?T.WATER:g[z*W+x];
  const isRoad=t=>t===T.ROAD||t===T.BRIDGE,isWater=t=>t===T.WATER,raised=t=>!isRoad(t)&&!isWater(t);
  const COL={[T.GRASS]:'#5a8236',[T.ROAD]:'#38393d',[T.WALK]:'#a7a39b',[T.WATER]:'#1b3644',[T.SAND]:'#d9c89c',[T.PLAZA]:'#b3a48d',[T.LOT]:'#8c8375',[T.DOCK]:'#8d8d88',[T.YARD]:'#7f7a6e',[T.BRIDGE]:'#414347',[T.PARK]:'#56883a',[T.GARDEN]:'#65903e'};
  const RGH={[T.GRASS]:1,[T.ROAD]:wet?.34:.9,[T.WALK]:wet?.5:.86,[T.WATER]:.1,[T.SAND]:1,[T.PLAZA]:wet?.45:.84,[T.LOT]:.95,[T.DOCK]:wet?.5:.85,[T.YARD]:.95,[T.BRIDGE]:wet?.34:.9,[T.PARK]:1,[T.GARDEN]:1};
  const gy=v=>{v=Math.round(clamp(v,0,1)*255);return `rgb(${v},${v},${v})`};
  b.fillStyle='rgb(128,128,128)';b.fillRect(0,0,cw,ch);
  // ---- basis per tegel
  for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){const t=g[z*W+x],px=(x-x0)*PX,pz=(z-z0)*PX;c.fillStyle=COL[t]||'#777';c.fillRect(px,pz,PX,PX);r.fillStyle=gy(RGH[t]==null?.9:RGH[t]);r.fillRect(px,pz,PX,PX)}
  // ---- stoeptegels, klinkers, betonplaten
  for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){const t=g[z*W+x],px=(x-x0)*PX,pz=(z-z0)*PX;
    if(t===T.WALK){c.fillStyle='rgba(0,0,0,.10)';c.fillRect(px,pz,PX,1);c.fillRect(px+((z&1)?0:PX/2),pz,1,PX);c.fillStyle='rgba(255,255,255,.045)';if((x+z)&1)c.fillRect(px+1,pz+1,PX-1,PX-1);
      b.fillStyle='rgb(92,92,92)';b.fillRect(px,pz,PX,1);b.fillRect(px+((z&1)?0:PX/2),pz,1,PX)}
    else if(t===T.PLAZA){const h=PX/2;for(let a=0;a<2;a++)for(let d=0;d<2;d++){const k=((x*2+d)+(z*2+a)*3)%4;c.fillStyle=k===0?'rgba(0,0,0,.07)':k===1?'rgba(255,255,255,.05)':k===2?'rgba(90,60,30,.06)':'rgba(0,0,0,0)';c.fillRect(px+d*h,pz+a*h,h,h)}
      c.fillStyle='rgba(0,0,0,.09)';c.fillRect(px,pz,PX,1);c.fillRect(px,pz+PX/2,PX,1);c.fillRect(px+((z&1)?1:PX/2),pz,1,PX/2);c.fillRect(px+((z&1)?PX/2:1),pz+PX/2,1,PX/2);
      b.fillStyle='rgb(96,96,96)';b.fillRect(px,pz,PX,1);b.fillRect(px,pz+PX/2,PX,1);b.fillRect(px+((z&1)?1:PX/2),pz,1,PX/2);b.fillRect(px+((z&1)?PX/2:1),pz+PX/2,1,PX/2)}
    else if(t===T.DOCK){if(x%4===0){c.fillStyle='rgba(0,0,0,.12)';c.fillRect(px,pz,1,PX);b.fillStyle='rgb(90,90,90)';b.fillRect(px,pz,1,PX)}if(z%4===0){c.fillStyle='rgba(0,0,0,.12)';c.fillRect(px,pz,PX,1);b.fillStyle='rgb(90,90,90)';b.fillRect(px,pz,PX,1)}}
    // stoeprand (lichte band) en gele kaderand
    if(raised(t)&&t!==T.GRASS&&t!==T.PARK&&t!==T.GARDEN&&t!==T.SAND){const e=[[1,0],[-1,0],[0,1],[0,-1]];e.forEach(([dx,dz])=>{const n=at(x+dx,z+dz);if(isRoad(n)||(isWater(n)&&t===T.DOCK)){const col=isRoad(n)?'#c9c6bf':'#e0b02c';c.fillStyle=col;r.fillStyle=gy(wet?.5:.8);b.fillStyle='rgb(170,170,170)';
        const bw=isRoad(n)?2:3;const rx=dx>0?px+PX-bw:px,rz=dz>0?pz+PX-bw:pz,rw=dx?bw:PX,rh=dz?bw:PX;c.fillRect(rx,rz,rw,rh);r.fillRect(rx,rz,rw,rh);b.fillRect(rx,rz,rw,rh)}})}}
  // ---- wegen: lengte van aaneengesloten wegtegels in beide richtingen
  const road=new Uint8Array(W*H);for(let i=0;i<W*H;i++)road[i]=isRoad(g[i])?1:0;
  const rx=new Uint16Array(W*H),rz=new Uint16Array(W*H),sz=new Uint16Array(W*H),sx=new Uint16Array(W*H);
  for(let z=0;z<H;z++){let x=0;while(x<W){if(!road[z*W+x]){x++;continue}let e=x;while(e<W&&road[z*W+e])e++;for(let k=x;k<e;k++){rx[z*W+k]=e-x;sx[z*W+k]=x}x=e}}
  for(let x=0;x<W;x++){let z=0;while(z<H){if(!road[z*W+x]){z++;continue}let e=z;while(e<H&&road[e*W+x])e++;for(let k=z;k<e;k++){rz[k*W+x]=e-z;sz[k*W+x]=z}z=e}}
  const cls=(x,z)=>{if(x<0||z<0||x>=W||z>=H||!road[z*W+x])return 0;const a=rx[z*W+x],d=rz[z*W+x];return a>12&&d<=10?1:d>12&&a<=10?2:a>10&&d>10?3:0}; // 1 oost-west, 2 noord-zuid, 3 kruising
  const mark=(px,pz,w,h)=>{c.fillStyle='rgba(232,232,222,.9)';c.fillRect(px,pz,w,h);r.fillStyle=gy(wet?.4:.62);r.fillRect(px,pz,w,h);b.fillStyle='rgb(150,150,150)';b.fillRect(px,pz,w,h)};
  for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){const k=cls(x,z);if(k!==1&&k!==2)continue;const px=(x-x0)*PX,pz=(z-z0)*PX;
    // afstand tot de kruising langs de rijrichting
    let near=99;for(let d=1;d<=6;d++){if(k===1){if(cls(x+d,z)===3||cls(x-d,z)===3){near=d;break}}else{if(cls(x,z+d)===3||cls(x,z-d)===3){near=d;break}}}
    if(near>=2&&near<=4){// zebrapad: strepen in de rijrichting
      if(k===1)mark(px,pz+1,PX,Math.round(PX/2));else mark(px+1,pz,Math.round(PX/2),PX);continue}
    if(near===1){// stopstreep
      continue}
    if(near<=6)continue;
    if(k===1){const mid=sz[z*W+x]+(rz[z*W+x]>>1);if(z===mid&&(x%6)<3)mark(px,pz-1,PX,2)}
    else{const mid=sx[z*W+x]+(rx[z*W+x]>>1);if(x===mid&&(z%6)<3)mark(px-1,pz,2,PX)}}
  // ---- vlekken, putdeksels, scheuren
  const rr=rng(o.seed||7),area=(x1-x0)*(z1-z0);
  for(let i=0;i<area/260;i++){const x=x0+rr()*(x1-x0),z=z0+rr()*(z1-z0);if(!road[(z|0)*W+(x|0)])continue;c.fillStyle=`rgba(${rr()<.5?12:70},${rr()<.5?12:68},${rr()<.5?14:66},${.05+rr()*.1})`;c.beginPath();c.ellipse((x-x0)*PX,(z-z0)*PX,(1+rr()*5)*PX*.5,(1+rr()*3)*PX*.5,rr()*3,0,7);c.fill()}
  for(let i=0;i<area/1400;i++){const x=x0+rr()*(x1-x0),z=z0+rr()*(z1-z0);if(!road[(z|0)*W+(x|0)])continue;const px=(x-x0)*PX,pz=(z-z0)*PX,rad=.38*PX;c.fillStyle='#2a2b2e';c.beginPath();c.arc(px,pz,rad,0,7);c.fill();c.strokeStyle='#4a4b4e';c.lineWidth=1;c.stroke();b.fillStyle='rgb(105,105,105)';b.beginPath();b.arc(px,pz,rad,0,7);b.fill();r.fillStyle=gy(.5);r.beginPath();r.arc(px,pz,rad,0,7);r.fill()}
  for(let i=0;i<area/500;i++){const x=x0+rr()*(x1-x0),z=z0+rr()*(z1-z0);if(!road[(z|0)*W+(x|0)])continue;c.strokeStyle='rgba(10,10,12,.28)';c.lineWidth=1;c.beginPath();let px=(x-x0)*PX,pz=(z-z0)*PX;c.moveTo(px,pz);for(let k=0;k<5;k++){px+=(rr()-.5)*PX*2.4;pz+=(rr()-.3)*PX*1.6;c.lineTo(px,pz)}c.stroke()}
  // ---- plassen bij regen
  if(wet){for(let i=0;i<area/60;i++){const x=x0+rr()*(x1-x0),z=z0+rr()*(z1-z0),t=at(x|0,z|0);if(!(isRoad(t)||t===T.WALK||t===T.PLAZA||t===T.DOCK))continue;const px=(x-x0)*PX,pz=(z-z0)*PX,a=(1+rr()*4)*PX*.5,d=(1+rr()*2.4)*PX*.5,rot=rr()*3;
      c.fillStyle='rgba(8,10,14,.32)';c.beginPath();c.ellipse(px,pz,a,d,rot,0,7);c.fill();r.fillStyle=gy(.03);r.beginPath();r.ellipse(px,pz,a,d,rot,0,7);r.fill();b.fillStyle='rgb(120,120,120)';b.beginPath();b.ellipse(px,pz,a,d,rot,0,7);b.fill()}}
  // ---- ruis
  noiseCanvas(c,cw,ch,5,7,PX*2.4,11);
  noiseCanvas(c,cw,ch,9,16,PX*3.4,12,(R,G,Bv)=>G>R+14&&G>Bv+22);     // gras extra vlekkerig
  noiseCanvas(b,cw,ch,16,6,PX*2,13);
  if(!wet)noiseCanvas(r,cw,ch,6,8,PX*3,14);else noiseCanvas(r,cw,ch,10,22,PX*4,14);
  const map=canvasTex(C,true),rough=canvasTex(Rg,false);
  // fijn reliëf (korrel) dat van dichtbij zichtbaar is, los van de grote textuur
  const D=mk(512,512),dx2=D.getContext('2d');dx2.fillStyle='rgb(128,128,128)';dx2.fillRect(0,0,512,512);noiseCanvas(dx2,512,512,34,10,9,31);const dr=rng(33);for(let i=0;i<900;i++){const v=60+Math.floor(dr()*150);dx2.fillStyle=`rgb(${v},${v},${v})`;dx2.fillRect(dr()*512,dr()*512,1+dr()*2.5,1+dr()*2.5)}
  const bump=canvasTex(D,false,true);bump.channel=1;const bigB=canvasTex(B,false);
  const mat=new THREE.MeshStandardMaterial({map,roughnessMap:rough,bumpMap:o.near?bump:bigB,bumpScale:wet?.35:(o.near?.9:1.1),metalness:0,roughness:1,envMapIntensity:wet?1.5:.55});
  // ---- geometrie: bovenvlakken per rij samengevoegd
  const pos=[],uv=[],uv1=[],nor=[],idx=[],U=x=>(x-x0)/(x1-x0),V=z=>1-(z-z0)/(z1-z0);
  const quad=(xa,xb,z,y)=>{const n=pos.length/3;pos.push(xa,y,z,xb,y,z,xb,y,z+1,xa,y,z+1);uv.push(U(xa),V(z),U(xb),V(z),U(xb),V(z+1),U(xa),V(z+1));uv1.push(xa/2.5,z/2.5,xb/2.5,z/2.5,xb/2.5,(z+1)/2.5,xa/2.5,(z+1)/2.5);nor.push(0,1,0,0,1,0,0,1,0,0,1,0);idx.push(n,n+2,n+1,n,n+3,n+2)};
  const hOf=t=>isRoad(t)?0:CURB;
  for(let z=z0;z<z1;z++){let x=x0;while(x<x1){const t=g[z*W+x];if(isWater(t)){x++;continue}const hh=hOf(t);let e=x;while(e<x1&&!isWater(g[z*W+e])&&hOf(g[z*W+e])===hh)e++;quad(x,e,z,hh);x=e}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2));geo.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));geo.setIndex(idx);
  const mesh=new THREE.Mesh(geo,mat);mesh.receiveShadow=true;mesh.name='grond';
  // ---- stoepranden en kademuren (verticale vlakken)
  const vq=(P,N,I,ax,az,bx,bz,ya,yb,nx,nz)=>{const n=P.length/3;P.push(ax,ya,az,bx,ya,bz,bx,yb,bz,ax,yb,az);N.push(nx,0,nz,nx,0,nz,nx,0,nz,nx,0,nz);I.push(n,n+1,n+2,n,n+2,n+3,n,n+2,n+1,n,n+3,n+2)};
  const cp=[],cn=[],ci=[],qp=[],qn=[],qi=[];const rails=[];
  for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){const t=g[z*W+x];if(isWater(t))continue;const hh=hOf(t);
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dz])=>{const n=at(x+dx,z+dz);const ax=dx>0?x+1:x,az=dz>0?z+1:z,bx=dx?ax:x+1,bz=dz?az:z+1;
      if(isWater(n)){const deep=t===T.BRIDGE?-.55:-2;vq(qp,qn,qi,dx?ax:x,dz?az:z,bx,bz,deep,hh,dx,dz);if(t===T.BRIDGE)rails.push({x:dx?ax:x+.5,z:dz?az:z+.5,dx,dz})}
      else if(raised(t)&&isRoad(n))vq(cp,cn,ci,dx?ax:x,dz?az:z,bx,bz,0,CURB,dx,dz)})}
  const mkG=(P,N,I)=>{const g2=new THREE.BufferGeometry();g2.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g2.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g2.setIndex(I);return g2};
  const curb=new THREE.Mesh(mkG(cp,cn,ci),new THREE.MeshStandardMaterial({color:'#b7b4ac',roughness:wet?.5:.85}));curb.receiveShadow=true;
  const quay=new THREE.Mesh(mkG(qp,qn,qi),new THREE.MeshStandardMaterial({color:'#5c5a54',roughness:.9}));quay.receiveShadow=true;quay.castShadow=true;
  const grp=new THREE.Group();grp.add(mesh,curb,quay);
  const hAt=(x,z)=>{const t=at(Math.floor(x),Math.floor(z));return isRoad(t)?0:isWater(t)?-.5:CURB};
  return {grp,mat,hAt,rails,bounds:{x0,x1,z0,z1},cls,at};
}
