// Pixelstad: Pizzeria Bella Napoli en het bezorgen.
// - Bella Napoli: een pand met een groene pui, rood-wit gestreepte luifel, een groot bord, warme ramen met de houtoven erachter,
//   een krijtbord, een schoorsteen die rookt en drie rode bezorgfietsen ervoor. In de verhaalstad staat hij op M.A.napoli (of de
//   plek 'napoli'); in de Pixelstad op een eigen pand in de Westbuurt. G.bezorg.napoli = {x,z,door:{x,z},face,ry,b}.
// - G.bezorg.start([{adres,x,z,naam,pizzas,extra,klant,betaald,tijd}], {onKlaar,onAlles,loon,laden}) → Promise met de uitslag.
//   Route met waypoint en uitlichting op de kaart, een tijd per bestelling, een warmtemeter, aanbellen (E), een kort gesprek met
//   de klant (2–3 antwoorden per soort klant), afrekenen en fooi (warm + vriendelijk = meer). In het verhaal gaat het geld via
//   G.story.geld (nooit S.cash); in de Stad is het een bijbaan met wit geld (G.schaal.wit) en vakmanschap 'bezorgen'.
// - Klanten: student (betaalt met muntjes), oude_man (wil praten), kantoor (receptioniste wil je weg), familie, feest, chagrijn.
// - G.bezorg.adres({klant,min,max}) en G.bezorg.plek(klant) geven een echt adres (straat + nummer) bij een voordeur.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const K=G.kit,E=K?K.E:(s=>String(s)),$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const story=()=>{try{return !!(G.story&&G.story.on&&G.story.on())}catch(e){return false}};
const toast=(t,c)=>{try{G.toast&&G.toast(t,c||'info')}catch(e){}};
const fx=n=>{try{G.snd&&G.snd.fx(n)}catch(e){}};
const fmtE=n=>{try{return fmt(n)}catch(e){return '€'+n}};
const sv=()=>{try{save()}catch(e){}};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const FL=M.FL||3.4;

/* =================== waar staat Bella Napoli =================== */
function bAt(x,z,m){m=m||0;return M.buildings.find(b=>x>=b.x0-m&&x<=b.x1+m&&z>=b.z0-m&&z<=b.z1+m)}
function faceOf(b,p){const d={S:p.z-b.z1,N:b.z0-p.z,E:p.x-b.x1,W:b.x0-p.x};let f='S',m=-1e9;for(const k in d)if(d[k]>m){m=d[k];f=k}return f}
function resolveNapoli(){
  // 1. de verhaalstad: plek 'napoli' of M.A.napoli
  let door=null,b=null;const pl=M.placeById&&M.placeById('napoli');
  if(pl){door=pl.door;b=M.buildings[pl.b]||bAt(door.x,door.z,3)}else if(M.A&&M.A.napoli){door=M.A.napoli;b=bAt(door.x,door.z,.5)||bAt(door.x,door.z,3.5)}
  // 2. de Pixelstad: een laag bakstenen pand in de Westbuurt, aan de grote weg, met een steeg ernaast (de achteringang)
  if(!b){b=M.buildings.find(q=>!q.pl&&q.x0<=203.5&&q.x1>=203.5&&q.z0<=293&&q.z1>=293);
    if(!b){const c=M.DISTRICTS&&M.DISTRICTS.find(d=>d.n==='Westbuurt')||{x:M.W/3,z:M.H/2};let bd=1e9;M.buildings.forEach(q=>{if(q.pl||!q.front||q.fl>5)return;const d=Math.hypot((q.x0+q.x1)/2-c.x,(q.z0+q.z1)/2-c.z);if(d<bd&&q.x1-q.x0>=7){bd=d;b=q}})}}
  if(!b)return null;
  const face=door?faceOf(b,door):(b.front||'S');
  const ns=face==='N'||face==='S',len=ns?b.x1-b.x0:b.z1-b.z0,mid=ns?(b.x0+b.x1)/2:(b.z0+b.z1)/2;
  let along=door?(ns?door.x:door.z):mid;along=clamp(along,(ns?b.x0:b.z0)+1.4,(ns?b.x1:b.z1)-1.4);
  const out=face==='S'?[0,1]:face==='N'?[0,-1]:face==='E'?[1,0]:[-1,0],wallC=face==='S'?b.z1:face==='N'?b.z0:face==='E'?b.x1:b.x0;
  const dp=ns?{x:along,z:wallC+out[1]*1.3}:{x:wallC+out[0]*1.3,z:along};const d2=M.nearestWalk(dp.x,dp.z,4)||dp;
  const ry=Math.atan2(out[0],out[1]);
  return {x:d2.x,z:d2.z,door:{x:d2.x,z:d2.z},face,ry,b:b.i,bld:b,ns,len,mid,along,wallC,out,name:'Pizzeria Bella Napoli',place:pl||null}}
const NAP=resolveNapoli();

/* =================== het pand aankleden =================== */
function cvTex(w,h,draw){const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;draw(c,w,h);
  const t=new TH.CanvasTexture(cv);t.magFilter=t.minFilter=TH.NearestFilter;if(TH.SRGBColorSpace)t.colorSpace=TH.SRGBColorSpace;return t}
// pixel-letters (5×7) voor het bord, zodat het scherp en groot leest
const FONT={A:'01110100011000111111100011000110001',B:'11110100011000111110100011000111110',E:'11111100001000011110100001000011111',L:'10000100001000010000100001000011111',
  N:'10001110011010110011100011000110001',P:'11110100011000111110100001000010000',O:'01110100011000110001100011000101110',I:'01110001000010000100001000010001110',Z:'11111000010001000100010001000011111',
  T:'11111001000010000100001000010000100',R:'11110100011000111110101001001010001',S:'01111100001000001110000010000111110',C:'01110100011000010000100001000101110',' ':'00000000000000000000000000000000000',
  '·':'00000000000000000100000000000000000',F:'11111100001000011110100001000010000',G:'01110100011000010111100011000101111',D:'11110100011000110001100011000111110',U:'10001100011000110001100011000101110'};
function pix(c,txt,x,y,s,col){c.fillStyle=col;let cx=x;for(const ch of txt){const g=FONT[ch]||FONT[' '];for(let i=0;i<35;i++)if(g[i]==='1')c.fillRect(cx+(i%5)*s,y+Math.floor(i/5)*s,s,s);cx+=6*s}}
const pw=(txt,s)=>txt.length*6*s-s;
function signTex(){return cvTex(156,24,(c,w,h)=>{c.fillStyle='#7d1712';c.fillRect(0,0,w,h);c.fillStyle='#a8241c';c.fillRect(1,1,w-2,h-2);c.fillStyle='#e8c870';c.fillRect(2,2,w-4,1);c.fillRect(2,h-3,w-4,1);
  [['#1f7a3e',0],['#f1ece0',1],['#c62a22',2]].forEach(([col,i])=>{c.fillStyle=col;c.fillRect(4+i*3,5,3,14);c.fillRect(w-13+i*3,5,3,14)});
  const t='BELLA NAPOLI';pix(c,t,Math.round((w-pw(t,2))/2)+1,6,2,'#3a0a08');pix(c,t,Math.round((w-pw(t,2))/2),5,2,'#fff3d6')})}
function winTex(seed){return cvTex(32,24,(c,w,h)=>{c.fillStyle='#ffcf86';c.fillRect(0,0,w,h);
  c.fillStyle='#ffe2a8';c.fillRect(0,0,w,9);c.fillStyle='#f0b468';c.fillRect(0,15,w,9);
  if(seed===0){// de houtoven met vuur
    c.fillStyle='#b8a48c';c.fillRect(6,6,20,14);c.fillStyle='#9a8670';c.fillRect(8,5,16,2);c.fillStyle='#2a1a12';c.fillRect(11,11,10,7);c.fillStyle='#ff7a1a';c.fillRect(12,14,8,4);c.fillStyle='#ffd35a';c.fillRect(14,15,4,3);
  }else{// tafeltjes met rode kleedjes en een lamp
    c.fillStyle='#3a2a20';c.fillRect(15,0,1,5);c.fillStyle='#fff3c8';c.fillRect(13,5,5,2);c.fillStyle='#c62a22';c.fillRect(4,15,10,2);c.fillRect(19,15,10,2);c.fillStyle='#f1ece0';c.fillRect(5,15,2,1);c.fillRect(9,15,2,1);c.fillRect(21,15,2,1);c.fillRect(25,15,2,1);
    c.fillStyle='#4a3020';c.fillRect(5,17,1,6);c.fillRect(12,17,1,6);c.fillRect(20,17,1,6);c.fillRect(27,17,1,6);c.fillStyle='#2f2a26';c.fillRect(8,9,2,6)}
  c.fillStyle='rgba(255,255,255,.35)';c.fillRect(2,2,1,8);c.fillRect(3,2,1,4);c.fillStyle='#ff4d5e';if(seed===1){c.fillRect(20,3,9,1);c.fillRect(20,7,9,1);c.fillRect(20,3,1,5);c.fillRect(28,3,1,5);c.fillRect(22,5,5,1)}})}
function awningTex(){return cvTex(16,8,(c,w,h)=>{for(let x=0;x<w;x++){c.fillStyle=Math.floor(x/2)%2?'#f1ece0':'#c62a22';c.fillRect(x,0,1,h)}c.fillStyle='rgba(0,0,0,.12)';c.fillRect(0,h-1,w,1)})}
function menuTex(){return cvTex(16,20,(c,w,h)=>{c.fillStyle='#2b2f2c';c.fillRect(0,0,w,h);c.fillStyle='#6a4a2c';c.fillRect(0,0,w,1);c.fillRect(0,h-1,w,1);c.fillRect(0,0,1,h);c.fillRect(w-1,0,1,h);
  c.fillStyle='#f1ece0';[[3,3,10],[3,6,7],[3,9,9],[3,12,6],[3,15,8]].forEach(([x,y,l])=>c.fillRect(x,y,l,1));c.fillStyle='#ffd35a';c.fillRect(11,6,2,1);c.fillRect(11,12,2,1);c.fillStyle='#ff6a5a';c.fillRect(11,9,2,1)})}
function bladeTex(){return cvTex(16,16,(c,w,h)=>{c.fillStyle='#1f4a2e';c.fillRect(0,0,w,h);c.fillStyle='#e8c870';c.fillRect(1,1,w-2,h-2);c.fillStyle='#d99a3e';c.fillRect(3,3,10,10);c.fillStyle='#c0352a';c.fillRect(4,4,8,8);
  c.fillStyle='#f1ece0';c.fillRect(5,5,2,2);c.fillRect(9,8,2,2);c.fillRect(6,9,1,1);c.fillStyle='#1f7a3e';c.fillRect(8,5,1,1);c.fillRect(6,8,1,1);c.fillStyle='#3a0a08';c.fillRect(7,4,1,8)})}
const decor={bikes:[],smoke:[],group:null,rack:[]};
function dressNapoli(){if(!NAP||decor.group)return;const sc=G.scene(),g=new TH.Group(),b=NAP.bld;decor.group=g;
  // lokaal assenstelsel: x langs de gevel, +z de straat in; oorsprong midden van de gevel op de grond
  const ns=NAP.ns,mid=NAP.mid,o=NAP.out;g.position.set(ns?mid:NAP.wallC,0,ns?NAP.wallC:mid);g.rotation.y=NAP.ry;sc.add(g);
  // langs-as van lokaal x: met ry draait (1,0,0) naar (cos ry, -sin ry)
  const ax=[Math.cos(NAP.ry),-Math.sin(NAP.ry)],sgn=ns?ax[0]:ax[1];const W=Math.min(14,NAP.len-.2),dX=(NAP.along-mid)*sgn;
  const lam=c=>new TH.MeshLambertMaterial({color:c}),bas=t=>new TH.MeshBasicMaterial({map:t}),B=(w,h,d,x,y,z,m)=>{const q=new TH.Mesh(new TH.BoxGeometry(w,h,d),m);q.position.set(x,y,z);q.castShadow=true;q.receiveShadow=true;g.add(q);return q};
  const pl=(w,h,x,y,z,m,rx)=>{const q=new TH.Mesh(new TH.PlaneGeometry(w,h),m);q.position.set(x,y,z);if(rx)q.rotation.x=rx;g.add(q);return q};
  const grn=lam('#1f4a2e'),grn2=lam('#2c6a42'),gold=lam('#c9a24a'),dark=lam('#1b1d20');
  const full=!(NAP.place&&NAP.place.st);// in de verhaalstad tekent de stad zelf de pui, luifel en het bord
  const dw=1.3,lw=(dX-dw/2)-(-W/2+.22),rw=(W/2-.22)-(dX+dw/2);
  if(full){
  // pui: groen houtwerk, plint, twee ramen en de deur
  B(W,.5,.16,0,.25,.08,grn);B(W,.18,.18,0,2.78,.09,grn);B(.22,2.6,.18,-W/2+.11,1.3,.09,grn);B(.22,2.6,.18,W/2-.11,1.3,.09,grn);
  if(lw>.6){pl(lw-.1,1.95,(-W/2+.22+dX-dw/2)/2,1.55,.1,bas(winTex(0)));B(.1,2.1,.2,dX-dw/2-.05,1.45,.1,grn)}
  if(rw>.6){pl(rw-.1,1.95,(dX+dw/2+W/2-.22)/2,1.55,.1,bas(winTex(1)));B(.1,2.1,.2,dX+dw/2+.05,1.45,.1,grn)}
  B(dw,.12,.2,dX,2.56,.1,grn);pl(dw-.24,2.2,dX,1.2,.06,new TH.MeshBasicMaterial({color:0xffd99a}));B(.06,2.3,.12,dX-dw/2+.1,1.2,.1,gold);B(.06,2.3,.12,dX+dw/2-.1,1.2,.1,gold);B(.5,.05,.06,dX,1.2,.15,gold);
  B(dw+.4,.08,.6,dX,.04,.35,lam('#8a8c90'));// stoepje voor de deur
  // luifel: rood-wit gestreept, schuin naar de straat, met een geschulpte rand
  const at=awningTex();at.wrapS=TH.RepeatWrapping;at.repeat.set(W/1.1,1);const aw=new TH.Mesh(new TH.PlaneGeometry(W,1.5),new TH.MeshLambertMaterial({map:at,side:TH.DoubleSide}));aw.position.set(0,3.08,.68);aw.rotation.x=-Math.PI/2+.42;aw.castShadow=true;aw.receiveShadow=true;g.add(aw);
  const vt=awningTex();vt.wrapS=TH.RepeatWrapping;vt.repeat.set(W/1.1,1);const va=new TH.Mesh(new TH.PlaneGeometry(W,.32),new TH.MeshLambertMaterial({map:vt,side:TH.DoubleSide}));va.position.set(0,2.62,1.37);g.add(va);
  for(let x=-W/2+.275;x<W/2;x+=.55)B(.5,.08,.04,x,2.44,1.37,lam(Math.round((x+W/2)/.55)%2?'#f1ece0':'#c62a22'));
  // het grote bord (in de verhaalstad tekent de plek zelf al een bord; dan alleen het uithangbord)
  if(!(NAP.place&&NAP.place.sign)){B(Math.min(W-.4,7.4)+.2,1.25,.14,0,3.95,.08,lam('#5a120e'));pl(Math.min(W-.4,7.4),1.12,0,3.95,.16,bas(signTex()));
    const lamp=lam('#2a2c30');[-2.4,0,2.4].forEach(x=>{if(Math.abs(x)<W/2-.6){B(.06,.06,.5,x,4.68,.3,lamp);B(.22,.1,.16,x,4.62,.55,new TH.MeshBasicMaterial({color:0xfff0c0}))}})}
  }
  // uithangbord haaks op de gevel (zie je goed vanaf de straat)
  const bx=-W/2+.45;B(.06,.06,1.1,bx,4.55,.55,dark);const bl=new TH.Mesh(new TH.PlaneGeometry(.9,.9),new TH.MeshBasicMaterial({map:bladeTex(),side:TH.DoubleSide}));bl.position.set(bx,4.0,.95);bl.rotation.y=Math.PI/2;g.add(bl);
  // krijtbord en planten bij de deur
  const bside=NAP.place?-1:1,mside=-bside,mx=dX+mside*(dw/2+.75);const mb=new TH.Group();mb.position.set(mx,0,1.15);mb.rotation.y=mside*.4;g.add(mb);
  const mt=menuTex();[.18,-.18].forEach((z,i)=>{const q=new TH.Mesh(new TH.PlaneGeometry(.6,.85),new TH.MeshLambertMaterial({map:mt,side:TH.DoubleSide}));q.position.set(0,.5,z*.5);q.rotation.x=i?.2:-.2;if(i)q.rotation.y=Math.PI;q.castShadow=true;mb.add(q)});
  [dX-dw/2-.3,dX+dw/2+.3].forEach(x=>{B(.42,.4,.42,x,.2,.32,lam('#9a5a36'));B(.36,.06,.36,x,.42,.32,lam('#3a2a1c'));B(.3,.34,.3,x,.6,.32,lam('#3f8a3a'));B(.2,.2,.2,x+.04,.82,.3,lam('#56a84a'))});
  // schoorsteen van de houtoven, met rook
  const H=(b.fl||3)*FL,dep=ns?b.z1-b.z0:b.x1-b.x0;B(.8,1.5,.8,-W/2+1.2,H+.75,-Math.min(dep-1,4),lam('#7a4a36'));B(.95,.18,.95,-W/2+1.2,H+1.55,-Math.min(dep-1,4),lam('#5a3426'));
  const smG=new TH.BoxGeometry(.45,.45,.45);for(let i=0;i<7;i++){const m=new TH.Mesh(smG,new TH.MeshBasicMaterial({color:0xd8d4cc,transparent:true,opacity:.5,depthWrite:false}));g.add(m);decor.smoke.push({m,t:i/7,x:-W/2+1.2,y:H+1.6,z:-Math.min(dep-1,4)})}
  // de rode bezorgfietsen, met de neus naar de gevel
  const slots=[];for(let k=0,j=0;k<3;k++){const x=dX+bside*(dw/2+.95+k*.95);if(Math.abs(x)<=W/2-.35)slots.push(x);else{slots.push(dX-bside*(dw/2+1.9+j*.95));j++}}
  slots.forEach((x,k)=>{const m=G.fietsModel?G.fietsModel('#b8261e',true):null;if(!m)return;m.position.set(x,0,1.15);m.rotation.y=Math.PI;g.add(m);
    g.updateMatrixWorld(true);const wp=new TH.Vector3(x,0,1.15).applyMatrix4(g.matrixWorld);decor.bikes.push({m,x:wp.x,z:wp.z,ry:NAP.ry+Math.PI,taken:false});
    const r=.3,L=.95;const a=new TH.Vector3(x-r,0,1.15-L).applyMatrix4(g.matrixWorld),c=new TH.Vector3(x+r,0,1.15+L).applyMatrix4(g.matrixWorld);
    M.setSolid({x0:Math.min(a.x,c.x)+.15,z0:Math.min(a.z,c.z)+.15,x1:Math.max(a.x,c.x)-.15,z1:Math.max(a.z,c.z)-.15},true)});
  g.traverse(q=>{if(q.isMesh&&q.material&&q.material.isMeshLambertMaterial)q.castShadow=true});
  // het wereldpunt voor het rek (voor de huur- en terugzetplek)
  const rk=new TH.Vector3(slots[1]!=null?slots[1]:dX+1.5,0,2.7).applyMatrix4(g.matrixWorld);decor.rack={x:rk.x,z:rk.z};
  const jb=new TH.Vector3(mx,0,2.1).applyMatrix4(g.matrixWorld);decor.job=M.nearestWalk(jb.x,jb.z,3)||{x:jb.x,z:jb.z}}
function decorStep(dt){decor.smoke.forEach(s=>{s.t+=dt*.16;if(s.t>1)s.t-=1;const k=s.t;s.m.position.set(s.x+Math.sin(k*5+s.y)*.3+k*.8,s.y+k*4.5,s.z+k*.4);s.m.scale.setScalar(.6+k*1.8);s.m.material.opacity=.42*(1-k)})}

/* =================== adressen =================== */
const STR_V=['Bajesweg','Westerstraat','Marnixstraat','Kerkstraat','Lijnbaan','Spuistraat','Vijzelstraat','Zuidasweg','Kanaalstraat','Tuinlaan','Duinweg','Molenweg','Rozengracht','Singel','Prinsenstraat'];
const STR_H=['Havenkade','Noorderweg','Villalaan','Haarlemmerstraat','Overtoom','Elandsgracht','Ferdinand Bolstraat','Strandweg','Eilandweg','Jan Pieterszstraat','Bloemstraat','Dijkstraat','Looiersgracht'];
function streetOf(b,f){if(M.straat)try{const s=M.straat(b,f);if(s)return s}catch(e){}
  const ns=f==='N'||f==='S';if(ns){const z=f==='S'?b.z1:b.z0,L=(M.HR||[]).map((r,i)=>({r,i,d:Math.abs(r.z-z)})).sort((a,c)=>a.d-c.d)[0];if(!L)return {n:'Dorpsstraat',a:0};return {n:STR_H[L.i%STR_H.length]+(L.i>=STR_H.length?' '+(Math.floor(L.i/STR_H.length)+1):''),a:L.r.a}}
  const x=f==='E'?b.x1:b.x0,L=(M.VR||[]).map((r,i)=>({r,i,d:Math.abs(r.x-x)})).sort((a,c)=>a.d-c.d)[0];if(!L)return {n:'Dorpsstraat',a:0};return {n:STR_V[L.i%STR_V.length]+(L.i>=STR_V.length?' '+(Math.floor(L.i/STR_V.length)+1):''),a:L.r.a}}
function doorOfB(b){const f=b.front||'S',ns=f==='N'||f==='S',mid=ns?(b.x0+b.x1)/2:(b.z0+b.z1)/2,out=f==='S'?[0,1]:f==='N'?[0,-1]:f==='E'?[1,0]:[-1,0];
  const w=f==='S'?b.z1:f==='N'?b.z0:f==='E'?b.x1:b.x0,p=ns?{x:mid,z:w+out[1]*1.3}:{x:w+out[0]*1.3,z:mid};if(!M.canStand(p.x,p.z,.3))return null;
  const st=streetOf(b,f),num=Math.max(1,Math.round(Math.abs(mid-st.a)/5))*2+((f==='S'||f==='E')?1:0);return {x:p.x,z:p.z,b:b.i,face:f,adres:st.n+' '+num,wijk:M.districtAt?M.districtAt(p.x,p.z):''}}
const KL_PREF={student:b=>b.fl>=3&&b.fl<=6,oude_man:b=>b.fl<=4,kantoor:b=>b.fl>=8,familie:b=>b.fl<=3,feest:b=>b.fl>=3&&b.fl<=6,chagrijn:()=>true};
// verhaalstad: echte voordeuren (M.ADRESSEN) met een soort pand per klant
const KL_SOORT={student:['flat','portiek'],oude_man:['rij','flat'],kantoor:['kantoor'],familie:['rij','villa'],feest:['flat','portiek','rij'],chagrijn:null};
function adresV(o){const from=o.van||NAP||G.P,mn=o.min!=null?o.min:70,mx=o.max!=null?o.max:420,want=KL_SOORT[o.klant];
  for(let pass=0;pass<3;pass++){const L=M.ADRESSEN.filter(a=>{const d=Math.hypot(a.x-from.x,a.z-from.z);return d>=mn*(pass?.5:1)&&d<=mx*(pass>1?2.5:1)&&(pass>1||!want||want.includes(a.soort))&&(!o.wijk||a.wijk===o.wijk||pass>0)&&!(o.niet||[]).includes(a.b)});
    if(L.length){const a=pick(L);return {x:a.x,z:a.z,b:a.b,face:a.face,adres:a.adres,wijk:a.wijk,soort:a.soort}}}return null}
function adres(o){o=o||{};if(Array.isArray(M.ADRESSEN)&&M.ADRESSEN.length)return adresV(o);const from=o.van||NAP||G.P,mn=o.min!=null?o.min:70,mx=o.max!=null?o.max:340,pref=KL_PREF[o.klant]||(()=>true);
  const C=M.buildings.filter(b=>!b.pl&&b.front&&!(NAP&&b.i===NAP.b));let best=null;
  for(let pass=0;pass<3&&!best;pass++){const L=C.filter(b=>{const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,d=Math.hypot(cx-from.x,cz-from.z);return d>=mn*(pass?.6:1)&&d<=mx*(pass>1?2:1)&&(pass>1||pref(b))&&(!o.wijk||!M.districtAt||M.districtAt(cx,cz)===o.wijk||pass>0)&&!(o.niet||[]).includes(b.i)});
    for(let k=0;k<40&&L.length&&!best;k++){const d=doorOfB(pick(L));if(d)best=d}}
  return best}
const PLEK={};
function plek(kl){if(PLEK[kl])return PLEK[kl];const a=adres({klant:kl,min:kl==='kantoor'?120:80,max:kl==='kantoor'?700:360,niet:Object.values(PLEK).map(p=>p.b)});if(a)PLEK[kl]=a;return a}

/* =================== klanten =================== */
const LOOKS={
  student:{skin:'#e9b98f',hair:'#8a6a3a',top:'#5a3a7a',arm:'#5a3a7a',pants:'#2c3a4d',shoe:'#e8e4da',hat:'beanie',hatC:'#d6a63e',glasses:1},
  oude_man:{skin:'#f1caa5',hair:'#d8d4cc',top:'#6a5a4a',arm:'#6a5a4a',pants:'#3a3c40',shoe:'#3a2a1a',hat:'hat',hatC:'#4a4038'},
  kantoor:{skin:'#d9a27a',hair:'#151517',top:'#2a2c30',arm:'#2a2c30',pants:'#1a1a1c',shoe:'#1a1a1c',hat:'none',tie:0},
  familie:{skin:'#b97a52',hair:'#2a1d14',top:'#2f6a8a',arm:'#b97a52',pants:'#2c3a4d',shoe:'#e8e4da',hat:'none'},
  feest:{skin:'#8d5a3a',hair:'#151517',top:'#ff4fd8',arm:'#8d5a3a',pants:'#1d2531',shoe:'#e8e4da',hat:'cap',hatC:'#f2c230'},
  chagrijn:{skin:'#e9b98f',hair:'#4a2e1a',top:'#8a8c90',arm:'#8a8c90',pants:'#4a3a2a',shoe:'#3a2a1a',hat:'bald'}};
const NAMEN={student:['Noor','Sem','Fleur','Daan'],oude_man:['Meneer Visser','Meneer Kok','Meneer Bos'],kantoor:['Receptie'],familie:['Familie Bakker','Familie Jansen','Familie El Amrani'],feest:['Huisfeest','Feestje bij Daan'],chagrijn:['Meneer De Wit','Meneer Smit']};
const ROL={student:'Student',oude_man:'Vaste klant',kantoor:'Receptioniste',familie:'Gezin',feest:'Feestje',chagrijn:'Klant'};
const CAST={student:'klant_student',oude_man:'klant_oude_man',kantoor:'receptioniste'};
function lookOf(kl){try{const a=G.cut&&G.cut.actors&&G.cut.actors[CAST[kl]];if(a&&a.look)return a.look}catch(e){}return LOOKS[kl]||LOOKS.chagrijn}
// d = toestand van de bestelling: {warm, laat, scheef, klant}. Antwoorden: t knop, r antwoord, v vriendelijk (−2..2), f fooi-basis (verhaaleuro's), k klacht, kost (sec)
function gesprek(kl,d){const koud=d.warm<35,lauw=d.warm<65,laat=d.laat,sch=d.scheef>0;
  const op={student:koud?'Hij voelt een beetje koud… maar ik heb honger. Wacht, ik heb het gepast. Denk ik.':'Eh, wacht… ik heb het gepast. Denk ik.',
    oude_man:'Ah, de pizzajongen! Kom even binnen, jongen. Mijn vrouw bakte vroeger ook pizza, op zondag…',
    kantoor:'Leveringen via de achteringang. Dat staat op het bord.',
    familie:'PIZZAAA! — Sorry, ze zijn een beetje druk. Hoeveel krijg je van me?',
    feest:'YOOO! De pizza is er! Kom erin, pak een drankje!',
    chagrijn:laat?'Dat duurde lang. Véél te lang.':koud?'Hm. Hij is koud, zie ik zo al.':'Hm. Eindelijk.'}[kl];
  const A={
    student:[{t:'Geen haast, tel maar rustig',r:'Twee… veertig… vijftig. Hier! En die laatste muntjes zijn voor jou.',v:1,f:1,kost:4},
      {t:'Ik heb ook een pinapparaat',r:'Pinnen? Ze zeiden contant… Hier, gewoon alles in muntjes.',v:0,f:0},
      {t:'Kan het iets sneller?',r:'Oké, oké. Stress. Hier, precies gepast.',v:-1,f:0}],
    oude_man:[{t:'Even dan. Vertelt u maar',r:'Napels, 1971. Meel tot op haar ellebogen, en de hele straat rook het. Dank je dat je luistert, jongen. Hier, voor jou.',v:2,f:4,kost:14},
      {t:'Sorry meneer, ik moet door',r:'Natuurlijk, natuurlijk. Jullie hebben het druk tegenwoordig. Hier.',v:0,f:1},
      {t:'Een andere keer, beloofd',r:'Dat zeggen ze allemaal. Nou, toch bedankt.',v:1,f:1,flag:'oude_man_beloofd'}],
    kantoor:[{t:'Het is voor boven. Ik wacht wel even',r:'…Prima. Ik bel even. Ze komen eraan.',v:1,f:1,kost:6},
      {t:'Dan is hij koud als ik omloop',r:'Zucht. Geef maar hier dan. Niet op de balie!',v:0,f:0},
      {t:'Ik zet hem hier neer. Fijne dag!',r:'Hé! Zo werkt dat hier niet!',v:-1,f:0,k:1}],
    familie:[{t:'Eet smakelijk allemaal!',r:'Wat lief. Hier, en hou de rest maar.',v:1,f:2},
      {t:'High five voor de kleine?',r:'Hij praat er nog weken over. Hier, voor jou.',v:2,f:3,kost:2,emote:'klap'},
      {t:'Gepast graag',r:'Eh… ja. Hier.',v:0,f:0}],
    feest:[{t:'Ik ben aan het werk, sorry',r:'Respect, man! Hier, voor de moeite.',v:1,f:2},
      {t:'Eén dansje dan',r:'HAHA! Legende! Iedereen een euro voor de pizzajongen!',v:2,f:5,kost:8,emote:'dans'},
      {t:'Wie betaalt er eigenlijk?',r:'Eh… wie had er besteld? DAAN? DAAN!',v:0,f:1,kost:7}],
    chagrijn:[{t:'Sorry, het is druk vanavond',r:'Druk, druk. Altijd maar druk.',v:1,f:0},
      lauw?{t:'Voel maar, hij is nog warm',r:'Warm? Noem jij dit warm? Ik bel je baas.',v:-1,f:0,k:1}:{t:'Voel maar, hij is nog warm',r:'…Hm. Inderdaad. Hier.',v:1,f:1},
      {t:'Dan bestelt u voortaan ergens anders',r:'Dat ga ik zeker doen. En ik bel je baas.',v:-2,f:0,k:1}]}[kl]||[];
  return {op,A,koud,lauw,laat,sch}}

/* =================== de ronde =================== */
let R=null;// {orders, i, opts, res, t, sum}
const WARM_K=.3;// warmte per seconde (regen en sneeuw sneller)
function routeLen(a,b){const p=M.findPath(a.x,a.z,b.x,b.z);if(!p||!p.length)return Math.hypot(a.x-b.x,a.z-b.z)*1.3;let d=0,x=a.x,z=a.z;p.forEach(q=>{d+=Math.hypot(q.x-x,q.z-z);x=q.x;z=q.z});return d}
function start(list,opts){if(R)stop('nieuw');opts=opts||{};const orders=(list||[]).map((o,i)=>Object.assign({id:o.id||('b'+i),naam:o.naam||pick(NAMEN[o.klant]||['Klant']),pizzas:clamp(o.pizzas||1,1,8),klant:o.klant||'chagrijn',betaald:!!o.betaald,extra:!!o.extra},o,
    {warm:100,t:0,klaar:false,ok:null,scheef:0}));
  if(!orders.length)return Promise.resolve({ok:0,fooi:0});
  // tijd per bestelling: langs de route (vanaf hier), fietstempo, plus wat marge per stop
  let from={x:G.P.x,z:G.P.z},acc=0;orders.forEach(o=>{const L=routeLen(from,o);acc+=L/6.3+22;o.tijd=o.tijd||Math.round(acc+18);o.afstand=Math.round(L);from=o});
  let res;const p=new Promise(r=>res=r);R={orders,i:0,opts,res,t:0,sum:{ok:0,mis:0,fooi:0,loon:0,klachten:0,res:[]},p};
  const tot=orders.reduce((a,o)=>a+o.pizzas,0);if(opts.laden!==false&&G.fiets){G.fiets.last(tot);G.fiets.scheef(0)}
  marks();card(true);fx('notify');toast(orders.length>1?orders.length+' bestellingen · '+tot+" pizza's":'Bestelling voor '+orders[0].naam,'info');return p}
function cur(){return R&&R.orders[R.i]}
function marks(){if(!R)return;try{G.kaart&&G.kaart.unhighlight&&R.orders.forEach(o=>G.kaart.unhighlight('bz_'+o.id))}catch(e){}
  const o=cur();if(!o)return;R.orders.forEach((q,k)=>{if(q.klaar||k<R.i)return;try{G.kaart&&G.kaart.highlight(q.x,q.z,q.naam+' · '+q.adres,{id:'bz_'+q.id,c:k===R.i?'#ff6a4a':'#e8a0a0',ic:'pizza',keep:true})}catch(e){}});
  try{G.setWaypoint&&G.setWaypoint(o.x,o.z,o.naam+' · '+(o.adres||''))}catch(e){}ensureSpot()}
function stop(why){if(!R)return;const r=R;R=null;try{r.orders.forEach(o=>G.kaart&&G.kaart.unhighlight&&G.kaart.unhighlight('bz_'+o.id))}catch(e){}try{G.clearWaypoint&&G.clearWaypoint()}catch(e){}
  if(SPOT)SPOT.on=false;card(false);if(cust)custGone();r.sum.gestopt=why||'';r.res(r.sum)}
// aanbellen: op de fiets binnen 7 m, te voet binnen 2,6 m
let SPOT=null,walk=null,cust=null;
function ensureSpot(){if(!G.spot)return;if(!SPOT)SPOT=G.spot({k:'bezorg',story:1,x:0,z:0,r:7,drive:true,prio:1,col:'#ff6a4a',h:2.1,mis:1,n:()=>{const o=cur();return o?'Aanbellen · '+o.naam:''},sub:()=>{const o=cur();return o?o.adres||'':''},
  show:()=>{const o=cur();if(!SPOT.on||!o||walk||cust||G.talking)return false;const d=dist(G.P,o);return G.driving?d<7:d<2.8},act:()=>aanbellen()});
  const o=cur();SPOT.on=!!o;if(o){SPOT.x=o.x;SPOT.z=o.z}}
function wallNear(x,z){let best=null;for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]])for(let k=.4;k<4.5;k+=.25){const cx=Math.floor(x+dx*k),cz=Math.floor(z+dz*k);if(cx<0||cz<0||cx>=M.W||cz>=M.H)break;if(M.solid[cz*M.W+cx]){if(!best||k<best.k)best={k,dx,dz};break}}return best}
function aanbellen(){const o=cur();if(!o||walk||cust)return;
  // de pizza's van de fiets pakken
  const F=G.fiets;let n=o.pizzas,sch=0;if(F&&F.actief())F.af();
  if(F&&F.pos()&&dist(F.pos(),G.P)<14&&F.last()>0){const L=F.last(),S0=F.scheef();sch=Math.min(S0,n);F.last(Math.max(0,L-n));F.scheef(Math.max(0,S0-sch))}
  else if(!(G.draag&&G.draag.n&&G.draag.n()>0)&&!(o.zonderFiets)){toast("Je pizza's zitten nog in de fietstas",'bad');return}
  o.scheef+=sch;try{G.draag&&G.draag.zet&&G.draag.zet(Math.min(4,n),'pizza')}catch(e){}
  // naar de voordeur lopen
  const w=wallNear(o.x,o.z),door=w?{x:o.x+w.dx*(w.k-.35),z:o.z+w.dz*(w.k-.35)}:{x:o.x,z:o.z},stand=w?{x:door.x-w.dx*1.25,z:door.z-w.dz*1.25}:{x:o.x+(G.P.x-o.x)*.3,z:o.z+(G.P.z-o.z)*.3};
  const sp=M.nearestWalk(stand.x,stand.z,2)||stand;walk={o,door,stand:sp,t:0,face:w?Math.atan2(w.dx,w.dz):0};
  if(dist(G.P,sp)>.6&&G.goTo)G.goTo(sp.x,sp.z)}
function walkStep(dt){if(!walk)return;walk.t+=dt;const d=dist(G.P,walk.stand);
  if(d<.7||walk.t>9||(!G.P.path&&d<2.2&&walk.t>.4)){const o=walk.o,dr=walk.door;walk=null;G.stopPath&&G.stopPath();G.P.ry=Math.atan2(dr.x-G.P.x,dr.z-G.P.z);ring(o,dr)}}
function dingdong(){const s=G.fietsSnd;try{if(G.snd&&G.snd.fxOn===false)return;const A=window.AudioContext||window.webkitAudioContext;if(!dingdong.c&&A)dingdong.c=new A();const c=dingdong.c;if(!c)return;if(c.state==='suspended')c.resume();
  [[659,0],[523,.32]].forEach(([f,t])=>{const o=c.createOscillator(),g=c.createGain(),T0=c.currentTime+t;o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(0,T0);g.gain.linearRampToValueAtTime(.18*((G.snd&&G.snd.vol)||.8),T0+.01);g.gain.exponentialRampToValueAtTime(.0001,T0+.9);o.connect(g);g.connect(c.destination);o.start(T0);o.stop(T0+1)})}catch(e){}}
function ring(o,dr){dingdong();G.talking=true;const wait=o.klant==='oude_man'?2.4:rr(1,1.8);
  setTimeout(()=>{if(!R||cur()!==o){G.talking=false;return}
    const a={kind:'klant',x:dr.x,z:dr.z,ry:Math.atan2(G.P.x-dr.x,G.P.z-dr.z),ph:0,sp:0,look:lookOf(o.klant)};G.actors.push(a);cust=a;G.lookAt=a;
    if(o.klant==='feest')try{G.bubble&&G.bubble(a,'♪ ♫ ♪',{col:'#ff4fd8',life:2})}catch(e){}
    praat(o,a)},wait*1000)}
function custGone(){const a=cust;cust=null;if(G.lookAt===a)G.lookAt=null;if(!a)return;setTimeout(()=>{const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1)},1400);a.ry+=Math.PI}
function praat(o,a){const d={warm:o.warm,laat:o.t>o.tijd,scheef:o.scheef,klant:o.klant},g=gesprek(o.klant,d);
  let first=g.op;if(g.sch&&o.klant!=='chagrijn')first+=' …Hij is wel een beetje scheef.';if(o.betaald)first+=' Online betaald, toch?';
  const look=Object.assign({},lookOf(o.klant));
  const done=(ch)=>{const pay=uitbetalen(o,ch,d);const r=o.res||{},geld=v=>story()?'€'+v:fmtE(v);K.say(ch.r,ch.v>0?'blij':ch.v<0?'boos':'neutraal',[{t:pay.fooi>0?'Bedankt, fijne avond!':'Fijne avond',sub:(r.loon?geld(r.loon)+' voor de rit · ':'')+(r.fooi?geld(r.fooi)+' fooi':'geen fooi')+(r.klacht?' · klacht':''),f:()=>{K.closeDialog()}}]);
    if(ch.emote&&G.doEmote){try{G.doEmote(ch.emote)}catch(e){}}};
  if(!K||!K.dialog){done(g.A[0]);return}
  K.dialog({name:o.naam,role:ROL[o.klant]+(o.adres?' · '+o.adres:''),look,mood:g.koud||g.laat?'boos':'neutraal',col:'#ff6a4a',lines:[first],
    choices:g.A.map(ch=>({t:ch.t,f:()=>done(ch)})),
    onClose:()=>{G.talking=false;try{G.draag&&G.draag.leeg&&G.draag.leeg()}catch(e){}custGone();if(!o.klaar)uitbetalen(o,g.A[1]||g.A[0],d);volgende()}})}
// fooi: basis van het antwoord × warmte × op tijd, min scheve pizza's. Verhaal: hele euro's via G.story.geld; Stad: wit geld.
function uitbetalen(o,ch,d){if(o.klaar)return {fooi:0,txt:''};o.klaar=true;
  const wk=d.warm>=65?1:d.warm>=35?.5:0,tk=d.laat?0:1;let f=Math.max(0,Math.round(((ch.f||0)+(ch.v>0&&wk===1?1:0))*wk*tk-Math.min(1,o.scheef)*(ch.f>2?1:0)));
  if(o.klant==='student'&&f>0)f=Math.min(f,2);
  const klacht=!!(ch.k||d.warm<35||(d.laat&&o.t>o.tijd*1.5));
  // in de Stad: loon per rit en fooi, wit geld
  let loon=0,txt='';
  if(story()){loon=R&&R.opts.loon!=null?R.opts.loon:2;try{if(loon>0)G.story.geld(loon,'rit');if(f>0)G.story.geld(f,'fooi')}catch(e){}}
  else{const w=G.schaal&&G.schaal.wit?G.schaal.wit():20;loon=R&&R.opts.loon!=null?R.opts.loon:Math.max(5,Math.round(w*.9/5)*5);const fs=f>0?Math.max(5,Math.round(w*.3*f/5)*5):0;
    try{S.cash+=loon+fs;S.stats=S.stats||{};S.stats.bezorgd=(S.stats.bezorgd||0)+1;sv()}catch(e){}f=fs;fx('cash');try{G.fx2&&G.fx2.float('+'+fmtE(loon+fs)+(fs?' (fooi '+fmtE(fs)+')':''),G.P.x,G.P.z,'#ffd35a')}catch(e){}}
  if(ch.flag&&story())try{G.story.flag(ch.flag,1)}catch(e){}
  const ok=!d.laat&&d.warm>=35&&!ch.k;try{G.vak&&G.vak.add&&G.vak.add('bezorgen',ok)}catch(e){}
  const r={ok,fooi:f,loon,warm:Math.round(d.warm),tijd:Math.round(o.t),teLaat:!!d.laat,scheef:o.scheef,klacht,klant:o.klant,antwoord:ch.t,vriendelijk:ch.v||0,id:o.id,extra:o.extra};o.res=r;
  if(R){R.sum.res.push(r);R.sum.fooi+=f;R.sum.loon+=loon;if(ok)R.sum.ok++;else R.sum.mis++;if(klacht)R.sum.klachten++;try{R.opts.onKlaar&&R.opts.onKlaar(r,o)}catch(e){console.error(e)}}
  if(f>0&&!story())txt='';else if(f===0&&klacht)txt='';
  return {fooi:f,txt}}
function volgende(){if(!R)return;try{G.kaart&&G.kaart.unhighlight&&G.kaart.unhighlight('bz_'+cur().id)}catch(e){}R.i++;
  if(R.i>=R.orders.length){const r=R;R=null;try{G.clearWaypoint&&G.clearWaypoint()}catch(e){}if(SPOT)SPOT.on=false;card(false);
    const s=r.sum;toast(s.ok+'/'+r.orders.length+' goed bezorgd'+(s.fooi?' · fooi '+(story()?'€'+s.fooi:fmtE(s.fooi)):''),s.klachten?'info':'ok');fx(s.klachten?'blip':'ok');
    try{r.opts.onAlles&&r.opts.onAlles(s)}catch(e){console.error(e)}r.res(s);return}
  marks();card(true);const o=cur();toast('Volgende: '+o.naam+' · '+(o.adres||''),'info')}

/* =================== HUD: de bonnetjes =================== */
const hud=document.createElement('div');hud.className='sdb-card';hud.hidden=true;document.body.appendChild(hud);
hud.addEventListener('click',()=>{if(innerWidth<=700)hud.classList.toggle('open');else hud.classList.toggle('mini')});['pointerdown','touchstart'].forEach(n=>hud.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
const ICB='<svg viewBox="0 0 12 8" shape-rendering="crispEdges" aria-hidden="true"><rect x="0" y="2" width="12" height="6" fill="#e3cfa2"/><rect x="0" y="2" width="12" height="1" fill="#f3e6c4"/><rect x="4" y="4" width="4" height="2" fill="#c0352a"/><rect x="0" y="7" width="12" height="1" fill="#b39a68"/></svg>';
function mmss(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
function card(on){if(!on||!R){hud.hidden=true;document.body.classList.remove('sdb-on');return}hud.hidden=false;document.body.classList.add('sdb-on');paint(true)}
let pT=0;
function paint(full){const o=cur();if(!o)return;const left=o.tijd-o.t,wl=o.warm>=65?'Warm':o.warm>=35?'Lauw':'Koud',wc=o.warm>=65?'w':o.warm>=35?'l':'k';
  const F=G.fiets,n=F?F.last():0,sch=F?F.scheef():0,fN=Math.floor(n/2),rN=n-fN;
  const bag=(k,lab,s0)=>`<span class="sdb-bag"><small>${lab}</small>${Array.from({length:Math.max(k,0)},(_,i)=>`<i class="${i>=k-s0?'sch':''}">${ICB}</i>`).join('')||'<em>leeg</em>'}</span>`;
  const sR=Math.min(sch,rN),sF=Math.min(sch-sR,fN);
  if(full||!hud._b){hud.innerHTML=`<div class="sdb-h"><b>Bella Napoli</b><span id="sdbN"></span></div><div class="sdb-o"><div class="sdb-who"><b id="sdbNm"></b><small id="sdbAd"></small></div><div class="sdb-t" id="sdbT"></div></div>
    <div class="sdb-w"><small>Warmte</small><i><i id="sdbWb"></i></i><em id="sdbWl"></em></div><div class="sdb-bags" id="sdbBags"></div><div class="sdb-next" id="sdbNx"></div>`;hud._b=1}
  $s('sdbN').textContent='Bon '+(R.i+1)+'/'+R.orders.length;$s('sdbNm').textContent=o.naam+' · '+o.pizzas+(o.pizzas>1?" pizza's":' pizza')+(o.betaald?' · betaald':'');$s('sdbAd').textContent=(o.adres||'')+(o.afstand?' · '+Math.round(dist(G.P,o))+' m':'');
  const t=$s('sdbT');t.textContent=left>=0?mmss(left):'+'+mmss(-left);t.className='sdb-t'+(left<0?' laat':left<15?' bijna':'');
  $s('sdbWb').style.width=Math.max(0,o.warm)+'%';$s('sdbWb').className=wc;$s('sdbWl').textContent=wl;$s('sdbWl').className=wc;
  const bh=bag(fN,'Voor',sF)+bag(rN,'Achter',sR)+(G.draag&&G.draag.n&&G.draag.n()?`<span class="sdb-bag"><small>Handen</small>${Array.from({length:G.draag.n()},()=>`<i>${ICB}</i>`).join('')}</span>`:'');if(hud._bh!==bh){hud._bh=bh;$s('sdbBags').innerHTML=bh}
  const nx=R.orders.slice(R.i+1).map(q=>`<span>${E(q.naam)} · ${mmss(q.tijd-q.t)}</span>`).join('');if(hud._nx!==nx){hud._nx=nx;$s('sdbNx').innerHTML=nx}}
function tick(dt){if(!R)return;const paused=G.talking||(G.cut&&((G.cut.playing&&G.cut.playing())||G.cut.on===true));
  let wf=1;try{const w=G.weerFx&&G.weerFx();if(w)wf=1+(w.nat||0)*.35+(G.night>.6?.1:0)}catch(e){}
  if(!paused)R.orders.forEach((o,k)=>{if(o.klaar)return;o.t+=dt;o.warm=Math.max(0,o.warm-dt*WARM_K*wf*(k===R.i&&walk?1.4:1))});
  pT+=dt;if(pT>.25){pT=0;paint(false)}}

/* =================== Stad: bijbaan bij de pizzeria, fiets huren =================== */
const JOB_CD=8*60e3;
const gio={skin:'#e9b98f',hair:'#d8d4cc',top:'#f1efe9',arm:'#f1efe9',pants:'#3a3c40',shoe:'#3a2a1a',hat:'none'};
function lookGio(){try{const a=G.cut&&G.cut.actors&&G.cut.actors.giovanni;if(a&&a.look)return a.look}catch(e){}return gio}
function jobMenu(){if(!K||!K.dialog||R)return;const cd=((S.cd&&S.cd.bezorg)||0)-Date.now();G.talking=true;
  const close=()=>{K.closeDialog()};
  if(cd>0){K.dialog({name:'Giovanni',role:'Bella Napoli',look:lookGio(),col:'#c62a22',lines:['Even rustig nu. Kom over '+Math.ceil(cd/60000)+' minuten terug, dan staan de dozen weer klaar.'],choices:[{t:'Tot zo',f:close}],onClose:()=>{G.talking=false}});return}
  const n=2+(Math.random()<.5?1:0),w=G.schaal&&G.schaal.wit?G.schaal.wit():20,loon=Math.max(5,Math.round(w*.9/5)*5);
  K.dialog({name:'Giovanni',role:'Bella Napoli',look:lookGio(),col:'#c62a22',lines:[pick(['Ragazzo! Ik heb '+n+' bestellingen en niemand om ze te brengen.','Druk, druk! '+n+' bonnen liggen klaar. Fiets staat buiten.'])+' '+fmtE(loon)+' per rit, plus je fooi.'],
    choices:[{t:'Ik breng ze weg',sub:n+' adressen · warm = fooi',f:()=>{K.closeDialog(true);G.talking=false;dienst(n)}},{t:'Een andere keer',f:close}],onClose:()=>{G.talking=false}})}
function dienst(n){const kl=['student','oude_man','kantoor','familie','feest','chagrijn'];const used=[],list=[];
  for(let i=0;i<n;i++){const k=pick(kl.filter(x=>!list.some(o=>o.klant===x)));const a=adres({klant:k,min:60+i*40,max:260+i*80,niet:used});if(!a)continue;used.push(a.b);list.push({adres:a.adres,x:a.x,z:a.z,klant:k,pizzas:k==='feest'?3:k==='familie'?2:1})}
  if(!list.length){toast('Geen adressen gevonden','bad');return}
  // een rode fiets van het rek pakken (of je eigen fiets als die er al staat)
  if(G.fiets&&!G.fiets.pos())huurFiets(true);
  S.cd=S.cd||{};S.cd.bezorg=Date.now()+JOB_CD;sv();
  start(list,{onAlles:()=>{toast('Klaar! Zet de fiets terug bij Bella Napoli als je wilt.','ok')}});
  setTimeout(()=>{if(G.fiets&&!G.fiets.actief()&&G.fiets.pos()&&dist(G.fiets.pos(),G.P)<5)G.fiets.op()},350)}
function huurFiets(gratis){if(!G.fiets||!decor.bikes.length)return;const b=decor.bikes.find(q=>!q.taken)||decor.bikes[0];
  if(!gratis&&!story()){const p=Math.max(5,Math.round(((G.schaal&&G.schaal.kost)?G.schaal.kost(.05):5)/5)*5);try{if(S.cash<p){toast('Je hebt '+fmtE(p)+' nodig','bad');return}S.cash-=p;sv();fx('cash')}catch(e){}toast('Fiets gehuurd · '+fmtE(p),'ok')}
  decor.bikes.forEach(q=>{if(q.taken){q.taken=false;q.m.visible=true}});b.taken=true;b.m.visible=false;G.fiets.spawn(b.x+Math.sin(NAP.ry)*1.3,b.z+Math.cos(NAP.ry)*1.3,NAP.ry,{kleur:'#b8261e'});G.fiets.op();G.yawT=G.yaw=NAP.ry+Math.PI}
function terugzetten(){if(!G.fiets)return;G.fiets.weg();decor.bikes.forEach(q=>{q.taken=false;q.m.visible=true});toast('Fiets teruggezet','ok');fx('ok')}
function stadSpots(){if(!G.spot||!NAP||stadSpots.done)return;stadSpots.done=1;const sp=decor.job||NAP.door;
  G.spot({k:'napoli',x:sp.x,z:sp.z,r:2.2,n:'Bijbaan: pizza\'s bezorgen',sub:'Bella Napoli',col:'#ff6a4a',h:2.2,show:()=>!story()&&!R&&!G.driving,act:jobMenu,dot:'#ff6a4a',dotR:70});
  const rk=decor.rack;if(rk){G.spot({k:'fietsrek',x:rk.x,z:rk.z,r:2.2,n:()=>G.fiets&&G.fiets.pos()&&dist(G.fiets.pos(),rk)<6&&!G.fiets.actief()?'Fiets terugzetten':'Fiets huren',col:'#ff9a6a',h:1.6,
    show:()=>!story()&&!G.driving&&!R&&!!G.fiets&&(!G.fiets.pos()||dist(G.fiets.pos(),rk)<6),act:()=>{if(G.fiets.pos()&&dist(G.fiets.pos(),rk)<6)terugzetten();else huurFiets(false)}})}}

/* =================== kaart =================== */
if(K&&K.ic&&!K.ic.pizza)K.ic.pizza='<svg viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true"><rect x="2" y="2" width="12" height="3" fill="currentColor"/><rect x="3" y="5" width="10" height="2" fill="currentColor"/><rect x="4" y="7" width="8" height="2" fill="currentColor"/><rect x="5" y="9" width="6" height="2" fill="currentColor"/><rect x="6" y="11" width="4" height="2" fill="currentColor"/><rect x="7" y="13" width="2" height="2" fill="currentColor"/><rect x="5" y="5" width="2" height="2" fill="#0008"/><rect x="9" y="7" width="2" height="2" fill="#0008"/><rect x="7" y="9" width="1" height="1" fill="#0008"/></svg>';
function kaart(){if(!NAP)return [];return [{cat:'pizza',id:'napoli',x:NAP.door.x,z:NAP.door.z,n:'Pizzeria Bella Napoli',sub:story()?'Giovanni':'Bijbaan: bezorgen',ic:'pizza',pri:5}]}

/* =================== elke frame =================== */
let ready=false;
const hook=setInterval(()=>{if(!G.ready||!G.carStep)return;clearInterval(hook);const c0=G.carStep;
  G.carStep=function(dt){c0(dt);try{if(!ready){ready=true;dressNapoli();stadSpots()}decorStep(dt);walkStep(dt);tick(dt)}catch(e){console.error('bezorg',e)}}},120);

G.bezorg={start,stop,actief:()=>!!R,huidig:()=>cur()||null,lijst:()=>R?R.orders.slice():[],napoli:NAP?{x:NAP.door.x,z:NAP.door.z,door:{x:NAP.door.x,z:NAP.door.z},face:NAP.face,ry:NAP.ry,b:NAP.b,name:NAP.name}:null,
  adres,plek,kaart,klanten:Object.keys(LOOKS),gesprek,aanbellen,huurFiets,terugzetten,dienst,rek:()=>decor.rack||null,fietsen:()=>decor.bikes.map(b=>({x:b.x,z:b.z,ry:b.ry,taken:b.taken})),
  // voor tests en het hoofdstukscript: warmte of tijd van de huidige bestelling bijstellen
  zet:(k,v)=>{const o=cur();if(o&&k in o)o[k]=v;return o}};
})();
