// Verhaalstad (/verhaal): trams. Lijn 7 rijdt over de Tramlaan (west ↔ oost), lijn 5 over de Vijzelstraat (station ↔ strand), over
// de rails van M.TRAM. Ze rijden rechts, stoppen bij de haltes (M.HALTES), remmen en bellen als er iets op het spoor staat, en duwen
// je opzij als je er toch voor gaat staan ("Pas op, de tram!").
// Voor andere onderdelen: G.tram.lijst() → [{lijn,x,z,ry,v,lengte}], G.tram.dichtbij(x,z,r) → dichtstbijzijnde tram binnen r meter,
// G.tram.on('raak',fn(tram)) als de tram de speler raakt (bijv. de fiets laat vallen), G.tram.stop(true|false) alle trams stil (cutscenes).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,X=window.STAD_GFX,TH=window.THREE;if(!G||!M||!M.TRAM||!X)return;
const TRACK=1.7,L=28,HW=1.25,VMAX=9;
const lijnen=M.TRAM.map(t=>Object.assign({},t,{haltes:(M.HALTES||[]).filter(h=>h.lijn===t.lijn).map(h=>t.dir==='h'?h.x:h.z).sort((a,b)=>a-b)}));
const trams=[],LST={raak:[]};let stil=false,mesh0=null;
function bouw(){const gb=new X.GB(),sw=X.swatch,body=sw('#f1efe9'),band=sw('#c0261e'),glas=sw('#24323f','#3a4a5a'),dak=sw('#8a9098'),zw=sw('#1d1d1f');
  // twee bakken met een harmonica ertussen; lengte langs z (draaien gebeurt met de mesh)
  [[-L/2,-1],[1,L/2]].forEach(([a,b])=>{gb.box(-HW,.35,a,HW,3.2,b,body,{top:dak});gb.box(-HW-.01,1.4,a+.6,HW+.01,2.5,b-.6,glas);gb.box(-HW-.02,.5,a,HW+.02,.9,b,band)});
  gb.box(-HW+.15,.35,-1,HW-.15,3.1,1,zw);
  [[-L/2,1],[L/2,-1]].forEach(([e,s])=>{gb.box(-HW+.2,1.3,e-.02*s,HW-.2,2.7,e+.03*s,glas);gb.box(-.4,2.75,e-.04*s,.4,3.05,e+.02*s,sw('#ffd35a','#ffd35a'));
    gb.box(-HW+.25,.55,e-.04*s,-HW+.6,.8,e+.02*s,sw('#fff3c8','#fff3c8'));gb.box(HW-.6,.55,e-.04*s,HW-.25,.8,e+.02*s,sw('#fff3c8','#fff3c8'))});
  gb.box(-.5,3.2,-4,.5,3.5,4,dak);gb.box(-.06,3.5,-1.5,.06,4.6,1.5,zw);gb.box(-.8,4.6,-.1,.8,4.7,.1,zw);
  [-L/2+3,-4,4,L/2-3].forEach(z=>gb.box(-HW+.1,0,z-1,HW-.1,.4,z+1,zw));
  return gb.mesh(G.city.material).geometry}
function maak(li,s,dir){if(!mesh0)mesh0=bouw();const m=new TH.Mesh(mesh0,G.city.material);m.castShadow=true;G.scene().add(m);
  const t={li,s,dir,v:0,wacht:0,halte:null,m,x:0,z:0,ry:0,bel:0};trams.push(t);plaats(t);return t}
function plaats(t){const li=t.li,o=t.dir*TRACK;if(li.dir==='h'){t.x=t.s;t.z=li.c+o;t.ry=t.dir>0?Math.PI/2:-Math.PI/2}else{t.z=t.s;t.x=li.c-o;t.ry=t.dir>0?0:Math.PI}
  t.m.position.set(t.x,0,t.z);t.m.rotation.y=t.ry}
// iets op het spoor voor de tram? (speler, verkeer)
function vrij(t){const li=t.li,ahead=(px,pz)=>{const along=(li.dir==='h'?px:pz)-t.s,lat=(li.dir==='h'?pz:px)-(li.dir==='h'?t.z:t.x);const d=along*t.dir;return d>L/2-1&&d<L/2+10&&Math.abs(lat)<2.1};
  const P=G.driving&&G.car?G.car:G.P;if(P&&ahead(P.x,P.z))return false;
  for(const c of (G.traffic||[]))if(ahead(c.x,c.z))return false;return true}
function stap(t,dt){const li=t.li;
  if(t.wacht>0){t.wacht-=dt;t.v=0;return}
  if(stil){t.v=Math.max(0,t.v-dt*6);return}
  // eind van de lijn: omdraaien naar het andere spoor
  const eind=t.dir>0?li.b-L/2-4:li.a+L/2+4;if((t.dir>0&&t.s>=eind)||(t.dir<0&&t.s<=eind)){t.dir*=-1;t.wacht=8;t.halte=null;plaats(t);return}
  // halte: stoppen als we erlangs komen
  const vlg=li.haltes.find(h=>(h-t.s)*t.dir>0&&(h-t.s)*t.dir<26&&t.halte!==h);let want=VMAX;
  if(vlg!=null){const d=Math.abs(vlg-t.s);want=Math.min(VMAX,Math.max(1.2,d*.6));if(d<.8){t.wacht=6;t.halte=vlg;t.v=0;return}}
  if(!vrij(t)){want=0;t.bel-=dt;if(t.bel<=0&&Math.hypot(G.P.x-t.x,G.P.z-t.z)<40){t.bel=2.5;try{G.snd&&G.snd.fx('notify')}catch(e){}}}
  t.v+=(want-t.v)*Math.min(1,dt*(want<t.v?3:.8));t.s+=t.v*dt*t.dir;plaats(t)}
// de speler opzij duwen als hij in de tram staat
let hitT=0;function duw(dt){hitT-=dt;if(G.driving)return;const P=G.P;for(const t of trams){const li=t.li;
  const along=(li.dir==='h'?P.x:P.z)-t.s,lat=(li.dir==='h'?P.z:P.x)-(li.dir==='h'?t.z:t.x);if(Math.abs(along)>L/2+.4||Math.abs(lat)>HW+.45)continue;
  const s=lat>=0?1:-1,push=(HW+.5-Math.abs(lat))*s;let nx=P.x,nz=P.z;if(li.dir==='h')nz+=push;else nx+=push;if(M.canStand(nx,nz,.35)){P.x=nx;P.z=nz}
  if(t.v>1.5&&hitT<=0){hitT=3;G.shake&&G.shake(.35);G.toast&&G.toast('Pas op, de tram!','bad');LST.raak.forEach(f=>{try{f(t)}catch(e){}})}}}
function init(){if(!G.ready||!G.city){setTimeout(init,400);return}
  lijnen.forEach((li,i)=>{const n=li.lijn===7?3:2,len=li.b-li.a;for(let k=0;k<n;k++)maak(li,li.a+L/2+8+((k+.3)/n)*(len-L-16),k%2?-1:1)});
  // eigen frame-lus (los van G.onFrame, dat andere onderdelen ook gebruiken)
  let last=performance.now();const loop=now=>{requestAnimationFrame(loop);const dt=Math.min(.05,(now-last)/1000);last=now;if(G.paused||!(dt>0))return;
    for(const t of trams){stap(t,dt);t.m.visible=Math.hypot(t.x-G.P.x,t.z-G.P.z)<260}duw(dt)};requestAnimationFrame(loop)}
init();
G.tram={lijst:()=>trams.map(t=>({lijn:t.li.lijn,x:t.x,z:t.z,ry:t.ry,v:t.v,lengte:L})),dichtbij(x,z,r){let b=null,bd=r||30;for(const t of trams){const d=Math.hypot(t.x-x,t.z-z);if(d<bd){bd=d;b={lijn:t.li.lijn,x:t.x,z:t.z,ry:t.ry,v:t.v,d}}}return b},
  on(k,f){(LST[k]=LST[k]||[]).push(f)},stop(on){stil=!!on}};
})();
