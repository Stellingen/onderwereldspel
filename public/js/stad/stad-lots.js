// Pixelstad: jouw bezit in de stad. Je woning (Verblijf) en je zaken (Bezit) staan als echte gebouwen op hun eigen kavel.
// Lege kavel = bord 'te koop'. Koop je de zaak, upgrade je hem of open je meer vestigingen, dan wordt er gebouwd:
// steiger en bouwkraan, verdieping voor verdieping (je ziet het gebeuren zodra je in de buurt bent).
(function(){
'use strict';
const TH=window.THREE,M=STAD_MAP,X=STAD_GFX,G=STAD,FL=M.FL;
// stijl, verdiepingen bij aankoop, extra verdiepingen per upgrade, extra per 3 vestigingen, maximum, dak
const BS={wash:['shop',1,.5,0,3],boven:['brick',2,1,1,8,'gableX'],winkelpand:['plaster',2,1,1,7],snack:['beach2',1,.5,0,3],shop:['shop',1,.5,0,3],barber:['boutique',1,.5,0,3],
  hotel:['villa',3,1,1,10],speelhal:['casino',2,.5,0,4],shisha:['pub',2,.5,0,4],club:['club',2,.5,0,4],vastgoed:['glass',5,2,1,20],
  garage:['ware2',2,.5,0,4],autogarage:['garage',1,.5,0,3],dealer:['glass2',1,.5,0,3],bedrijfshal:['ware',1,.5,1,4],port:['ware',2,.5,0,4],jet:['garage',2,.5,0,3,'gableZ']};
// je woning per soort huis (HOUSES.id): stijl, verdiepingen, dak, rechthoek binnen de kavel
const HS={kraak:['kraak',2,'flat',[38,96,50,107]],boot:['kraak',2,'flat',[38,96,50,107]],kamer:['brick3',3,'gableX',[38,96,49,108]],studio:['brick',3,'gableX',[38,96,50,108]],
  gracht:['plaster',4,'gableX',[38,96,50,110]],jordaan:['brick2',5,'gableX',[38,96,51,111]],penthouse:['glass',9,'flat',[38,96,54,111]],ijpent:['glass2',11,'flat',[38,96,54,112]],
  omval:['glass',13,'flat',[38,96,55,113]],villa:['villa',2,'flat',[39,96,55,108]],gooi:['villa',3,'flat',[38,96,55,110]]};
const mat=()=>G.city.material;
const LOT=[];G.lots=LOT;G.lotMeshes=[];
const isHome=p=>p.dyn==='home';
const bizOf=p=>typeof BIZ!=='undefined'&&BIZ.find(b=>b.id===p.biz);
function units(p){try{return (S.biz2&&S.biz2[p.biz])||[]}catch(e){return[]}}
// hoe het gebouw nu hoort te zijn: {fl, st, roof, rect, own, key}
function want(p){
  if(isHome(p)){const id=(S&&S.home)||'brug';if(id==='brug'||!HS[id])return {own:1,fl:0,camp:1,key:'brug'};const h=HS[id];
    return {own:1,fl:h[1],st:h[0],roof:h[2],rect:{x0:h[3][0],z0:h[3][1],x1:h[3][2],z1:h[3][3]},key:id,villa:id==='villa'||id==='gooi'}}
  const u=units(p);if(!u.length)return {own:0,fl:0,key:'leeg'};const s=BS[p.biz]||['shop',1,.5,0,3],mx=Math.max(...u);
  const fl=Math.min(s[4],Math.max(1,Math.round(s[1]+s[2]*mx+s[3]*Math.floor((u.length-1)/3))));
  const r=p.rect,m=.5,f=p.face,rect={x0:r.x0+(f==='W'?0:m),z0:r.z0+(f==='N'?0:m),x1:r.x1-(f==='E'?0:m),z1:r.z1-(f==='S'?0:m)};
  return {own:1,fl,st:s[0],roof:s[5]||'flat',rect,key:p.biz+':'+u.length+':'+mx,n:u.length,lv:mx}}
function signText(p,w){if(isHome(p))return null;const b=bizOf(p);const nm=(b?b.n:p.biz).toUpperCase();return w.own?nm+(w.n>1?' ×'+w.n:''):'TE KOOP'}
function labelOf(p,w){if(isHome(p)){const h=typeof houseOf==='function'?houseOf((S&&S.home)||'brug'):null;return 'Jouw woning'+(h?': '+h.n:'')}
  const b=bizOf(p);return w.own?'Jouw '+(b?b.n:'zaak'):'Te koop: '+(b?b.n:'kavel')}
/* ---------- tekenen ---------- */
function buildMesh(p,w,fl){const gb=new X.GB();if(fl>0){const r=w.rect;X.drawBuilding(gb,{x0:r.x0,z0:r.z0,x1:r.x1,z1:r.z1,fl,st:w.st,roof:fl>=w.fl?w.roof:'flat',pl:'lot'},500+LOT.indexOf(p.__l)*7);
    // deur
    const e=.04,ww=1.3,dh=2.6,x=p.door.x,z=p.door.z;if(p.face==='N')gb.quad([x+ww,0,r.z0-e],[x-ww,0,r.z0-e],[x-ww,dh,r.z0-e],[x+ww,dh,r.z0-e],0,0,1,1,X.DOORT);
    if(p.face==='S')gb.quad([x-ww,0,r.z1+e],[x+ww,0,r.z1+e],[x+ww,dh,r.z1+e],[x-ww,dh,r.z1+e],0,0,1,1,X.DOORT);
    if(p.face==='W')gb.quad([r.x0-e,0,z-ww],[r.x0-e,0,z+ww],[r.x0-e,dh,z+ww],[r.x0-e,dh,z-ww],0,0,1,1,X.DOORT)
    if(w.villa){const sw=X.swatch;gb.box(r.x0,0,r.z1+.6,r.x1,.25,Math.min(115.5,r.z1+6),sw('#2f8fd6','#123a5a'),{});gb.box(r.x0-.4,0,r.z1+.2,r.x1+.4,.35,r.z1+.6,sw('#e8e4da'))}}
  if(w.camp){const sw=X.swatch;// onder de brug: tentje, matras en een vuurton
    gb.box(40,0,99,44,1.4,102,sw('#3c5a3a'),{top:sw('#2f4a2e')});gb.box(45,0,99,47,.25,102,sw('#8a6a5a'));gb.cbox(48.6,100.5,.9,.9,0,1.1,sw('#5a4a3a'));gb.cbox(48.6,100.5,.7,.7,1.1,1.35,sw('#ff8a2a','#ffb04a'))}
  const m=gb.mesh(mat());m.castShadow=true;m.receiveShadow=true;m.userData.pl=p;return m}
function scaffold(p,w,fl){const gb=new X.GB(),r=w.rect,sw=X.swatch('#c9a227'),pl=X.swatch('#8a6a42'),top=fl*FL;if(!r)return null;
  const yb=Math.max(0,top-FL),yt=top+FL*.9;
  for(let x=r.x0-.6;x<=r.x1+.6;x+=3){gb.box(x-.08,yb,r.z0-.7,x+.08,yt,r.z0-.54,sw);gb.box(x-.08,yb,r.z1+.54,x+.08,yt,r.z1+.7,sw)}
  for(let z=r.z0-.6;z<=r.z1+.6;z+=3){gb.box(r.x0-.7,yb,z-.08,r.x0-.54,yt,z+.08,sw);gb.box(r.x1+.54,yb,z-.08,r.x1+.7,yt,z+.08,sw)}
  [yb+.05,top,yt-.1].forEach(y=>{gb.box(r.x0-.8,y,r.z0-.8,r.x1+.8,y+.12,r.z0-.45,pl);gb.box(r.x0-.8,y,r.z1+.45,r.x1+.8,y+.12,r.z1+.8,pl);gb.box(r.x0-.8,y,r.z0-.8,r.x0-.45,y+.12,r.z1+.8,pl);gb.box(r.x1+.45,y,r.z0-.8,r.x1+.8,y+.12,r.z1+.8,pl)});
  // bouwkraan naast het pand
  const cx=r.x1+1.6,cz=(r.z0+r.z1)/2,ch=Math.max(top+FL*2.5,12),cr=X.swatch('#e8b030'),dk=X.swatch('#3a3d42');
  gb.box(cx-.5,0,cz-.5,cx+.5,ch,cz+.5,cr);gb.box(cx-(r.x1-r.x0)-1,ch,cz-.4,cx+5,ch+.8,cz+.4,cr);gb.box(cx-.8,ch+.8,cz-.8,cx+.8,ch+2,cz+.8,dk);gb.box(cx+3.4,ch-1.4,cz-.7,cx+5,ch,cz+.7,dk);
  const hx=(r.x0+r.x1)/2;gb.box(hx-.04,top+1,cz-.04,hx+.04,ch,cz+.04,dk);gb.box(hx-.7,top+.4,cz-.4,hx+.7,top+1,cz+.4,X.swatch('#b03a2e'));
  const m=gb.mesh(mat());m.castShadow=true;return m}
function board(p){// bord 'te koop' aan de voorkant van een lege kavel
  const b=bizOf(p),cv=X.textCanvas('TE KOOP · '+(b?b.n.toUpperCase():''),'#ffffff','#c0261e','#ffffff'),tex=X.nearestTex(cv);
  const w=cv.width/13*1.0,g=new TH.Group(),panel=new TH.Mesh(new TH.PlaneGeometry(w,1),new TH.MeshBasicMaterial({map:tex,side:TH.DoubleSide}));panel.position.y=2.2;g.add(panel);
  const post=new TH.Mesh(new TH.BoxGeometry(.14,2.2,.14),new TH.MeshLambertMaterial({color:0x6a4a2c}));[-w/2+.3,w/2-.3].forEach(x=>{const q=post.clone();q.position.set(x,1.1,0);g.add(q)});
  const r=p.rect,f=p.face;if(f==='N'){g.position.set(p.door.x,0,r.z0+1.2);g.rotation.y=Math.PI}else if(f==='S'){g.position.set(p.door.x,0,r.z1-1.2)}else if(f==='W'){g.position.set(r.x0+1.2,0,p.door.z);g.rotation.y=-Math.PI/2}
  g.traverse(o=>{o.userData.pl=p});return {g,panel}}
function signMesh(p,w){const t=signText(p,w);if(!t)return null;const b=bizOf(p),col=b&&b.col||'#f2c230';const cv=X.textCanvas(t,col,'#101216',col),tex=X.nearestTex(cv);
  const r=w.rect,fw=(p.face==='W'||p.face==='E'?r.z1-r.z0:r.x1-r.x0)*.92,k=Math.min(1,fw/(cv.width/13*1.1)),sw=cv.width/13*1.1*k,m=new TH.Mesh(new TH.PlaneGeometry(sw,1.1*k),new TH.MeshBasicMaterial({map:tex}));const y=Math.min(FL*.98,3.2)+.55,e=.08;
  if(p.face==='N'){m.position.set(p.door.x,y,r.z0-e);m.rotation.y=Math.PI}else if(p.face==='S')m.position.set(p.door.x,y,r.z1+e);else{m.position.set(r.x0-e,y,p.door.z);m.rotation.y=-Math.PI/2}
  m.userData.pl=p;return m}
/* ---------- bijhouden ---------- */
function setup(scene){
  M.places.filter(p=>p.dyn).forEach(p=>{const l={p,shown:-1,key:null,w:null,mesh:null,scaf:null,extra:null,t:0};p.__l=l;LOT.push(l);
    const ring=new TH.Mesh(new TH.RingGeometry(.75,1.05,16),new TH.MeshBasicMaterial({color:0xf2c230,transparent:true,opacity:.85,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(p.door.x,.06,p.door.z);scene.add(ring);
    const pin=new TH.Mesh(new TH.OctahedronGeometry(.42,0),new TH.MeshBasicMaterial({color:0xf2c230}));pin.scale.set(1,1.5,1);pin.position.set(p.door.x,3,p.door.z);scene.add(pin);
    l.mark={p,ring,pin,sign:pin};G.marks.push(l.mark)});
  sync(true);setInterval(()=>sync(false),1200)}
function place(l,scene){const p=l.p,w=l.w;
  ['mesh','scaf'].forEach(k=>{if(l[k]){scene.remove(l[k]);l[k].geometry.dispose();G.lotMeshes=G.lotMeshes.filter(m=>m!==l[k]);l[k]=null}});
  if(l.extra){scene.remove(l.extra);l.extra=null}
  const fl=Math.max(0,Math.floor(l.shown));
  if(fl>0||w.camp){l.mesh=buildMesh(p,w,fl);scene.add(l.mesh);G.lotMeshes.push(l.mesh)}
  if(l.building&&w.rect){l.scaf=scaffold(p,w,fl);if(l.scaf)scene.add(l.scaf)}
  if(!w.own){const bd=board(p);l.extra=bd.g;scene.add(bd.g);G.lotMeshes.push(bd.panel);l.mark.sign=bd.panel}
  else if(fl>0){const sm=signMesh(p,w);if(sm){l.extra=sm;scene.add(sm);G.lotMeshes.push(sm);l.mark.sign=sm}}
  // botsen: gebouw = dicht, leeg of in aanbouw zonder verdiepingen = je kunt erover lopen
  if(w.rect&&p.rect)M.setSolid(p.rect,false);if(w.rect&&fl>0)M.setSolid(w.rect,true);if(w.camp)M.setSolid({x0:40,z0:99,x1:44,z1:102},true);
  // markering: eigen = goud, te koop = grijs en klein
  const own=w.own;l.mark.ring.material.color.set(own?0xf2c230:0x9aa1ab);l.mark.pin.visible=own;l.mark.ring.visible=true;l.mark.ring.material.opacity=own?.85:.45;
  p.name=labelOf(p,w);p.own=own;p.building=!!l.building}
function sync(first){if(!G.ready||typeof S==='undefined')return;const scene=G.scene();
  LOT.forEach(l=>{const w=want(l.p);if(w.key===l.key)return;const prev=l.w;l.key=w.key;l.w=w;
    const grow=!first&&prev&&w.own&&w.fl>Math.max(0,Math.floor(l.shown));
    if(grow){l.building=true;if(l.shown<0)l.shown=0;if(!prev.own||(w.rect&&prev.rect&&(w.rect.x1-w.rect.x0)!==(prev.rect.x1-prev.rect.x0)))l.shown=0;
      const b=bizOf(l.p);G.toast&&G.toast((isHome(l.p)?'Je nieuwe woning':('Je '+(b?b.n:'pand')))+' wordt gebouwd in '+M.districtAt(l.p.door.x,l.p.door.z)+'. Loop erheen om te kijken.','lvl')}
    else{l.building=false;l.shown=w.fl}
    place(l,scene)});
  G.onLots&&G.onLots()}
// elke frame: bouwen gaat door zolang je in de buurt bent (dan zie je het gebeuren)
let acc=0;
G.lotStep=function(dt){acc+=dt;if(acc<.1)return;const d=acc;acc=0;const scene=G.scene();
  LOT.forEach(l=>{if(!l.building)return;const p=l.p,near=Math.hypot(G.P.x-p.door.x,G.P.z-p.door.z)<75;if(!near)return;
    l.t+=d;if(l.t<Math.min(1.1,10/Math.max(1,l.w.fl)))return;l.t=0;l.shown=Math.floor(l.shown)+1;if(l.shown>=l.w.fl){l.shown=l.w.fl;l.building=false;const b=bizOf(p);G.toast&&G.toast((isHome(p)?'Je woning':'Je '+(b?b.n:'pand'))+' is klaar','ok')}
    place(l,scene)})};
// voor het binnengaan: het Bezit-scherm meteen op deze zaak openen
M.places.filter(p=>p.dyn==='biz').forEach(p=>{p.before=()=>{try{window.bz=window.bz||{};bz.sel=p.biz;bz.mode=null}catch(e){}}});
M.places.filter(p=>p.dyn==='home').forEach(p=>{p.before=()=>{try{if(window.vb){vb.view=null;vb.sel=null}}catch(e){}}});
G.lotsSetup=setup;G.lotSync=()=>sync(false);
})();
