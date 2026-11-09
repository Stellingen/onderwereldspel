// Pixelstad: jouw bezit in de stad.
// - Woningen: kavels per soort woning (kraakpand in De Haven, woonboot in de gracht, rijtjeshuis in de woonwijk, grachtenpand aan de
//   gracht, penthouse aan de IJ-oever, villa in Villawijk Duinzicht). Lege kavel = bomen en een bord. Je koopt er een woning op
//   (zelfde aankoop en prijs als het klikspel: act.buyHouse, de kavel zit in de prijs) en dan wordt hij gebouwd. Welke woning op welke
//   kavel staat bewaart S.stadPlots = {kavel-id: woning-id}; woningen zonder kavel krijgen vanzelf een vrije kavel van hun soort.
// - Zaken: elke zaak uit Bezit heeft een kavel (winkels en horeca in de stad, grote panden op het bedrijventerrein). Leeg = bord
//   'te koop'; kopen, upgraden en meer vestigingen = steiger en kraan, verdieping voor verdieping.
(function(){
'use strict';
const TH=window.THREE,M=STAD_MAP,X=STAD_GFX,G=STAD,FL=M.FL,$s=id=>document.getElementById(id);
const E=s=>typeof esc==='function'?esc(s):String(s);
// stijl, verdiepingen bij aankoop, extra verdiepingen per upgrade, extra per 3 vestigingen, maximum, dak
const BS={wash:['shop',1,.5,0,3],boven:['brick',2,1,1,8,'gableX'],winkelpand:['plaster',2,1,1,7],snack:['beach2',1,.5,0,3],shop:['shop',1,.5,0,3],barber:['boutique',1,.5,0,3],
  hotel:['villa',3,1,1,10],speelhal:['casino',2,.5,0,4],shisha:['pub',2,.5,0,4],club:['club',2,.5,0,4],vastgoed:['glass',5,2,1,20],
  garage:['ware2',2,.5,0,4],autogarage:['garage',1,.5,0,3],dealer:['glass2',1,.5,0,3],bedrijfshal:['ware',1,.5,1,4],port:['ware',2,.5,0,4],jet:['garage',2,.5,0,3,'gableZ']};
// woning per HOUSES.id: stijl, verdiepingen, dak
const HS={kraak:['kraak',2],boot:['beach2',1],kamer:['brick3',3,'gable'],studio:['brick',3,'gable'],gracht:['plaster',4,'gable'],jordaan:['brick2',5,'gable'],
  penthouse:['glass',9],ijpent:['glass2',11],omval:['glass',13],villa:['villa',2],gooi:['villa',3]};
const mat=()=>G.city.material;
const LOT=[];G.lots=LOT;G.lotMeshes=[];
const bizOf=p=>typeof BIZ!=='undefined'&&BIZ.find(b=>b.id===p.biz);
const hOf=id=>typeof houseOf==='function'?houseOf(id):{id,n:id,t:id};
function units(p){try{return (S.biz2&&S.biz2[p.biz])||[]}catch(e){return[]}}
/* ---------- welke woning op welke kavel ---------- */
const plotsS=()=>S.stadPlots&&typeof S.stadPlots==='object'?S.stadPlots:(S.stadPlots={});
const zoneFor=id=>Object.keys(M.PLOT_ZONES).find(z=>M.PLOT_ZONES[z].includes(id));
function mine(){const o=Object.keys(S.owned||{});if(S.rent&&S.rent.id&&!o.includes(S.rent.id))o.push(S.rent.id);if(S.home&&S.home!=='brug'&&!o.includes(S.home))o.push(S.home);return o.filter(id=>id!=='brug'&&zoneFor(id))}
function assign(){const P=plotsS(),my=mine();let ch=false;
  for(const k in P){const pl=M.placeById('plot_'+k);if(!my.includes(P[k])||!pl||!M.PLOT_ZONES[pl.zone].includes(P[k])){delete P[k];ch=true}}
  my.forEach(id=>{if(Object.values(P).includes(id))return;const z=zoneFor(id),fr=M.places.find(p=>p.dyn==='plot'&&p.zone===z&&!P[p.plot]);if(fr){P[fr.plot]=id;ch=true}});
  if(ch)try{save()}catch(e){}}
const houseOn=p=>p.zone==='brug'?((S.home||'brug')==='brug'?'brug':null):plotsS()[p.plot]||null;
/* ---------- hoe het gebouw hoort te zijn ---------- */
function inset(r,a,b,c,d){return {x0:r.x0+a,z0:r.z0+b,x1:r.x1-c,z1:r.z1-d}}
function front(r,f,depth,side){// strook aan de voorkant (rijtjeshuis)
  side=side||.5;if(f==='N')return {x0:r.x0+side,z0:r.z0,x1:r.x1-side,z1:r.z0+depth};if(f==='S')return {x0:r.x0+side,z0:r.z1-depth,x1:r.x1-side,z1:r.z1};
  if(f==='W')return {x0:r.x0,z0:r.z0+side,x1:r.x0+depth,z1:r.z1-side};return {x0:r.x1-depth,z0:r.z0+side,x1:r.x1,z1:r.z1-side}}
function want(p){
  if(p.dyn==='plot'){const id=houseOn(p);if(!id)return {own:0,fl:0,key:'leeg',empty:1};const home=(S.home||'brug')===id,key=id+(home?':thuis':'');
    if(id==='brug')return {own:1,fl:0,camp:1,key,home,id};
    const h=HS[id]||['brick',2],t=hOf(id).t,r=p.rect,f=p.face,gable=h[2]==='gable'?(f==='N'||f==='S'?'gableX':'gableZ'):'flat';let rect=r;
    if(t==='kraak'&&id==='boot')rect=inset(r,1.2,2,1.2,2);else if(t==='kraak')rect=inset(r,3,3,3,3);else if(t==='kamer')rect=front(r,f,11);
    else if(t==='gracht')rect=inset(r,.3,.3,.3,.3);else if(t==='penthouse')rect=inset(r,5,f==='S'?6:4,5,f==='S'?3:6);else if(t==='villa')rect=f==='N'?inset(r,5,7,5,6):inset(r,5,6,5,7);
    return {own:1,fl:h[1],st:h[0],roof:gable,rect,key,home,id,villa:t==='villa',boat:id==='boot',pent:t==='penthouse'}}
  const u=units(p);if(!u.length)return {own:0,fl:0,key:'leeg'};const s=BS[p.biz]||['shop',1,.5,0,3],mx=Math.max(...u);
  const fl=Math.min(s[4],Math.max(1,Math.round(s[1]+s[2]*mx+s[3]*Math.floor((u.length-1)/3))));
  const r=p.rect,m=.5,f=p.face,rect={x0:r.x0+(f==='W'?0:m),z0:r.z0+(f==='N'?0:m),x1:r.x1-(f==='E'?0:m),z1:r.z1-(f==='S'?0:m)};
  return {own:1,fl,st:s[0],roof:s[5]||'flat',rect,key:p.biz+':'+u.length+':'+mx,n:u.length,lv:mx}}
function signText(p,w){if(p.dyn==='plot')return null;const b=bizOf(p);const nm=(b?b.n:p.biz).toUpperCase();return w.own?nm+(w.n>1?' ×'+w.n:''):'TE KOOP'}
function labelOf(p,w){if(p.dyn==='plot'){if(!w.own)return p.zone==='brug'?'Onder de brug':'Kavel te koop · '+M.ZONE_N[p.zone];const h=hOf(w.id);return (w.home?'Thuis: ':'Jouw ')+(w.id==='brug'?'plek onder de brug':h.n)}
  const b=bizOf(p);return w.own?'Jouw '+(b?b.n:'zaak'):'Te koop: '+(b?b.n:'kavel')}
/* ---------- tekenen ---------- */
function trees(gb,p){// lege kavel: bomen en struiken (vast per kavel)
  const r=p.rect,n=Math.max(2,Math.round((r.x1-r.x0)*(r.z1-r.z0)/110)),sw=X.swatch,leaf=['#2f6e2a','#3c8a34','#4f7a26'];
  for(let i=0;i<n;i++){const hx=X.hash(i,p.door.x|0,31),hz=X.hash(i,p.door.z|0,32),x=r.x0+2+hx*(r.x1-r.x0-4),z=r.z0+2.5+hz*(r.z1-r.z0-5),s=.75+X.hash(i,7,33)*.6,c=sw(leaf[i%3]);
    if(X.hash(i,3,34)<.3){gb.cbox(x,z,1.6*s,1.6*s,0,1.1*s,sw('#3a6a2c'));continue}
    gb.cbox(x,z,.45*s,.45*s,0,1.7*s,sw('#5a3d26'));gb.cbox(x,z,2.6*s,2.6*s,1.5*s,3.2*s,c);gb.cbox(x,z,1.8*s,1.8*s,3.2*s,4.1*s,c)}
  // paaltjes op de hoeken
  [[r.x0+.3,r.z0+.3],[r.x1-.3,r.z0+.3],[r.x0+.3,r.z1-.3],[r.x1-.3,r.z1-.3]].forEach(([x,z])=>{gb.cbox(x,z,.15,.15,0,.9,sw('#e8e4da'));gb.cbox(x,z,.17,.17,.7,.85,sw('#c0261e'))})}
function buildMesh(p,w,fl){const gb=new X.GB(),sw=X.swatch;
  if(w.empty&&p.zone!=='brug'&&p.zone!=='boot')trees(gb,p);
  if(fl>0){const r=w.rect;
    if(w.boat){gb.box(r.x0-.3,-.7,r.z0-.4,r.x1+.3,.25,r.z1+.4,sw('#3a2a20'),{top:sw('#6a4a2c')});gb.box(r.x0-.4,.15,r.z0-.5,r.x1+.4,.35,r.z1+.5,sw('#e8e4da'))}
    X.drawBuilding(gb,{x0:r.x0,z0:r.z0,x1:r.x1,z1:r.z1,fl,st:w.st,roof:fl>=w.fl?w.roof:'flat',pl:'lot'},500+LOT.indexOf(p.__l)*7);
    // deur aan de straatkant
    const e=.04,ww=1.3,dh=2.6,x=p.door.x,z=p.door.z,dx=Math.max(r.x0+1.4,Math.min(r.x1-1.4,x)),dz=Math.max(r.z0+1.4,Math.min(r.z1-1.4,z));
    if(p.face==='N')gb.quad([dx+ww,0,r.z0-e],[dx-ww,0,r.z0-e],[dx-ww,dh,r.z0-e],[dx+ww,dh,r.z0-e],0,0,1,1,X.DOORT);
    if(p.face==='S')gb.quad([dx-ww,0,r.z1+e],[dx+ww,0,r.z1+e],[dx+ww,dh,r.z1+e],[dx-ww,dh,r.z1+e],0,0,1,1,X.DOORT);
    if(p.face==='W')gb.quad([r.x0-e,0,dz-ww],[r.x0-e,0,dz+ww],[r.x0-e,dh,dz+ww],[r.x0-e,dh,dz-ww],0,0,1,1,X.DOORT);
    if(p.face==='E')gb.quad([r.x1+e,0,dz+ww],[r.x1+e,0,dz-ww],[r.x1+e,dh,dz-ww],[r.x1+e,dh,dz+ww],0,0,1,1,X.DOORT);
    if(fl>=w.fl&&w.villa){const pr=p.rect,f=p.face,pz0=f==='N'?pr.z0+1.5:r.z1+1.2,pz1=f==='N'?r.z0-1.2:pr.z1-1.5;// zwembad en terras
      gb.box(r.x0+1,0,pz0,r.x1-1,.12,pz1,sw('#d8cbb0'));gb.box(r.x0+2,0,pz0+.8,r.x1-6,.22,pz1-.8,sw('#2f8fd6','#123a5a'));
      [[pr.x0+.5,pr.x1-.5,pr.z0+.2,pr.z0+.8],[pr.x0+.5,pr.x1-.5,pr.z1-.8,pr.z1-.2],[pr.x0+.2,pr.x0+.8,pr.z0+.5,pr.z1-.5],[pr.x1-.8,pr.x1-.2,pr.z0+.5,pr.z1-.5]].forEach(([a,b,c,d])=>{
        const gate=(f==='N'&&c<pr.z0+1)||(f==='S'&&d>pr.z1-1);if(gate){gb.box(a,0,c,p.door.x-2.2,1.3,d,sw('#2f6a2c',null,18));gb.box(p.door.x+2.2,0,c,b,1.3,d,sw('#2f6a2c',null,18))}else gb.box(a,0,c,b,1.3,d,sw('#2f6a2c',null,18))})}
    if(fl>=w.fl&&w.pent){const top=fl*FL;gb.box(r.x0+.5,top+.5,r.z0+.5,r.x1-.5,top+.62,r.z1-.5,sw('#c9b48a'));gb.box(r.x0+2,top+.6,r.z0+2,r.x0+5,top+.85,r.z0+4,sw('#2f8fd6','#123a5a'));gb.box(r.x1-6,top+.5,r.z1-5,r.x1-2,top+3.2,r.z1-2,sw('#e8e4da','#ffe7a8'))}}
  if(w.camp){const r=p.rect,cx=(r.x0+r.x1)/2;// onder de brug: tentje, matras en een vuurton
    gb.box(r.x0+.2,0,r.z0+.5,r.x1-.2,1.3,r.z0+3,sw('#3c5a3a'),{top:sw('#2f4a2e')});gb.box(r.x0+.2,0,r.z0+3.4,r.x1-.6,.25,r.z0+5.2,sw('#8a6a5a'));gb.cbox(cx,r.z1-.5,.8,.8,0,1,sw('#5a4a3a'));gb.cbox(cx,r.z1-.5,.6,.6,1,1.25,sw('#ff8a2a','#ffb04a'))}
  const m=gb.mesh(mat());m.castShadow=true;m.receiveShadow=true;m.userData.pl=p;return m}
function scaffold(p,w,fl){const gb=new X.GB(),r=w.rect,sw=X.swatch('#c9a227'),pl=X.swatch('#8a6a42'),top=fl*FL;if(!r)return null;
  const yb=Math.max(0,top-FL),yt=top+FL*.9;
  for(let x=r.x0-.6;x<=r.x1+.6;x+=3){gb.box(x-.08,yb,r.z0-.7,x+.08,yt,r.z0-.54,sw);gb.box(x-.08,yb,r.z1+.54,x+.08,yt,r.z1+.7,sw)}
  for(let z=r.z0-.6;z<=r.z1+.6;z+=3){gb.box(r.x0-.7,yb,z-.08,r.x0-.54,yt,z+.08,sw);gb.box(r.x1+.54,yb,z-.08,r.x1+.7,yt,z+.08,sw)}
  [yb+.05,top,yt-.1].forEach(y=>{gb.box(r.x0-.8,y,r.z0-.8,r.x1+.8,y+.12,r.z0-.45,pl);gb.box(r.x0-.8,y,r.z1+.45,r.x1+.8,y+.12,r.z1+.8,pl);gb.box(r.x0-.8,y,r.z0-.8,r.x0-.45,y+.12,r.z1+.8,pl);gb.box(r.x1+.45,y,r.z0-.8,r.x1+.8,y+.12,r.z1+.8,pl)});
  const cx=r.x1+1.6,cz=(r.z0+r.z1)/2,ch=Math.max(top+FL*2.5,12),cr=X.swatch('#e8b030'),dk=X.swatch('#3a3d42');
  gb.box(cx-.5,0,cz-.5,cx+.5,ch,cz+.5,cr);gb.box(cx-(r.x1-r.x0)-1,ch,cz-.4,cx+5,ch+.8,cz+.4,cr);gb.box(cx-.8,ch+.8,cz-.8,cx+.8,ch+2,cz+.8,dk);gb.box(cx+3.4,ch-1.4,cz-.7,cx+5,ch,cz+.7,dk);
  const hx=(r.x0+r.x1)/2;gb.box(hx-.04,top+1,cz-.04,hx+.04,ch,cz+.04,dk);gb.box(hx-.7,top+.4,cz-.4,hx+.7,top+1,cz+.4,X.swatch('#b03a2e'));
  const m=gb.mesh(mat());m.castShadow=true;return m}
function board(p){const b=bizOf(p),txt=p.dyn==='plot'?'KAVEL TE KOOP · '+(M.ZONE_N[p.zone]||'').toUpperCase():'TE KOOP · '+(b?b.n.toUpperCase():'');
  const cv=X.textCanvas(txt,'#ffffff',p.dyn==='plot'?'#2b7a55':'#c0261e','#ffffff'),tex=X.nearestTex(cv);
  const w=cv.width/13*1.0,g=new TH.Group(),panel=new TH.Mesh(new TH.PlaneGeometry(w,1),new TH.MeshBasicMaterial({map:tex,side:TH.DoubleSide}));panel.position.y=2.2;g.add(panel);
  const post=new TH.Mesh(new TH.BoxGeometry(.14,2.2,.14),new TH.MeshLambertMaterial({color:0x6a4a2c}));[-w/2+.3,w/2-.3].forEach(x=>{const q=post.clone();q.position.set(x,1.1,0);g.add(q)});
  const r=p.rect,f=p.face;if(f==='N'){g.position.set(p.door.x,0,r.z0+1.2);g.rotation.y=Math.PI}else if(f==='S'){g.position.set(p.door.x,0,r.z1-1.2)}else if(f==='W'){g.position.set(r.x0+1.2,0,p.door.z);g.rotation.y=-Math.PI/2}else{g.position.set(r.x1-1.2,0,p.door.z);g.rotation.y=Math.PI/2}
  g.traverse(o=>{o.userData.pl=p});return {g,panel}}
function signMesh(p,w){const t=signText(p,w);if(!t)return null;const b=bizOf(p),col=b&&b.col||'#f2c230';const cv=X.textCanvas(t,col,'#101216',col),tex=X.nearestTex(cv);
  const r=w.rect,fw=(p.face==='W'||p.face==='E'?r.z1-r.z0:r.x1-r.x0)*.92,k=Math.min(1,fw/(cv.width/13*1.1)),sw=cv.width/13*1.1*k,m=new TH.Mesh(new TH.PlaneGeometry(sw,1.1*k),new TH.MeshBasicMaterial({map:tex}));const y=Math.min(FL*.98,3.2)+.55,e=.08;
  if(p.face==='N'){m.position.set(p.door.x,y,r.z0-e);m.rotation.y=Math.PI}else if(p.face==='S')m.position.set(p.door.x,y,r.z1+e);else if(p.face==='W'){m.position.set(r.x0-e,y,p.door.z);m.rotation.y=-Math.PI/2}else{m.position.set(r.x1+e,y,p.door.z);m.rotation.y=Math.PI/2}
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
  if(fl>0||w.camp||(w.empty&&p.zone!=='brug'&&p.zone!=='boot')){l.mesh=buildMesh(p,w,fl);scene.add(l.mesh);G.lotMeshes.push(l.mesh)}
  if(l.building&&w.rect){l.scaf=scaffold(p,w,fl);if(l.scaf)scene.add(l.scaf)}
  if(!w.own&&p.zone!=='brug'){const bd=board(p);l.extra=bd.g;scene.add(bd.g);G.lotMeshes.push(bd.panel);l.mark.sign=bd.panel}
  else if(fl>0){const sm=signMesh(p,w);if(sm){l.extra=sm;scene.add(sm);G.lotMeshes.push(sm);l.mark.sign=sm}}
  // botsen: gebouw = dicht; lege kavel of in aanbouw zonder verdiepingen = je kunt erover lopen (bomen niet)
  if(p.rect&&p.zone!=='boot')M.setSolid(p.rect,false);if(w.rect&&fl>0&&!w.boat)M.setSolid(w.rect,true);
  if(w.camp){const r=p.rect;M.setSolid({x0:r.x0,z0:r.z0+.5,x1:r.x1,z1:r.z0+3},true)}
  const own=w.own;l.mark.ring.material.color.set(own?(w.home?0xffd35a:0xf2c230):0x9aa1ab);l.mark.pin.visible=own;l.mark.ring.visible=true;l.mark.ring.material.opacity=own?.85:.45;
  p.name=labelOf(p,w);p.own=own;p.home=!!w.home;p.building=!!l.building;p.houseId=w.id||null}
function sync(first){if(!G.ready||typeof S==='undefined')return;const scene=G.scene();try{assign()}catch(e){console.error(e)}
  LOT.forEach(l=>{const w=want(l.p);if(w.key===l.key)return;const prev=l.w;l.key=w.key;l.w=w;
    const grow=!first&&prev&&w.own&&w.fl>Math.max(0,Math.floor(l.shown));
    if(grow){l.building=true;if(l.shown<0)l.shown=0;if(!prev.own||prev.id!==w.id)l.shown=0;
      const b=bizOf(l.p),what=l.p.dyn==='plot'?'Je '+hOf(w.id).n.toLowerCase():'Je '+(b?b.n:'pand');G.toast&&G.toast(what+' wordt gebouwd in '+M.districtAt(l.p.door.x,l.p.door.z)+'. Loop erheen om te kijken.','lvl')}
    else{l.building=false;l.shown=w.fl}
    place(l,scene)});
  G.onLots&&G.onLots()}
let acc=0;
G.lotStep=function(dt){acc+=dt;if(acc<.1)return;const d=acc;acc=0;const scene=G.scene();
  LOT.forEach(l=>{if(!l.building)return;const p=l.p,near=Math.hypot(G.P.x-p.door.x,G.P.z-p.door.z)<75;if(!near)return;
    l.t+=d;if(l.t<Math.min(1.1,10/Math.max(1,l.w.fl)))return;l.t=0;l.shown=Math.floor(l.shown)+1;if(l.shown>=l.w.fl){l.shown=l.w.fl;l.building=false;const b=bizOf(p);G.toast&&G.toast((p.dyn==='plot'?'Je '+hOf(l.w.id).n.toLowerCase():'Je '+(b?b.n:'pand'))+' is klaar','ok')}
    place(l,scene)})};
M.places.filter(p=>p.dyn==='biz').forEach(p=>{p.before=()=>{try{window.bz=window.bz||{};bz.sel=p.biz;bz.mode=null}catch(e){}}});
M.places.filter(p=>p.dyn==='plot').forEach(p=>{p.before=()=>{try{if(window.vb){vb.view=null;vb.sel=null}}catch(e){}}});

/* ---------- kavelscherm: kopen, bouwen, verhuizen, verkopen ---------- */
const ui=document.createElement('div');ui.className='sd-board';ui.id='sdPlot';ui.hidden=true;document.body.appendChild(ui);
let cur=null;
function rankOk(L){return rankIdx(S.xp)>=(L.r||0)}
function render(){const p=cur;if(!p)return;const w=p.__l.w||want(p),zone=p.zone,ids=M.PLOT_ZONES[zone]||[],P=plotsS();
  let body='';
  if(w.own){const id=w.id,L=hOf(id),home=(S.home||'brug')===id,owned=id==='brug'||!!(S.owned&&S.owned[id]),rented=S.rent&&S.rent.id===id;
    body=`<div class="sd-pl-cur"><small>${home?'Hier woon je':'Van jou'}${rented?' · huur':''}</small><b>${E(L.n)}</b><p>${E(L.d||'')}</p></div>
     <div class="sd-pl-act">${home?`<button class="btn" data-in>Naar binnen</button>`:`<button class="btn" data-move="${id}">Hier gaan wonen</button>`}
      ${owned&&id!=='brug'?`<button class="btn ghost" data-sell="${id}">Verkopen · ${fmt(typeof houseSell==='function'?houseSell(id):0)}</button>`:''}</div>`}
  else if(zone==='brug'){body=`<div class="sd-pl-cur"><small>Altijd gratis</small><b>Onder de brug</b><p>Een matras, een vuurton en het geraas van de tram. Je kunt hier altijd slapen.</p></div><div class="sd-pl-act"><button class="btn" data-move="brug">Hier gaan wonen</button></div>`}
  else body=`<p class="sd-pl-lede">Op deze kavel kun je bouwen. Je betaalt de gewone prijs van de woning, de grond zit erbij.</p>`+ids.map(id=>{const L=hOf(id),pr=typeof mktPrice==='function'?mktPrice(id):L.p,have=!!(S.owned&&S.owned[id]),lock=!rankOk(L);
    const where=Object.keys(P).find(k=>P[k]===id),wpl=where&&M.placeById('plot_'+where);
    return `<article class="sd-pl-h ${lock?'lock':''}"><div><b>${E(L.n)}</b><small>${E(L.d||'')}</small></div><div class="sd-pl-p"><b>${fmt(pr)}</b>${L.rent?`<small>of huur ${fmt(L.rent)} per speldag</small>`:''}</div>
      <div class="sd-pl-b">${lock?`<span class="sd-pl-l">Vanaf ${E(RANKS[L.r][0])}</span>`:have?`<button class="btn sm" data-here="${id}">Hierheen verplaatsen</button><span class="sd-pl-l">Staat nu op ${E(wpl?M.districtAt(wpl.door.x,wpl.door.z):'een andere kavel')}</span>`
       :`<button class="btn sm" data-buy="${id}" ${typeof wit==='function'&&wit()<pr?'disabled':''}>Kopen (wit)</button><button class="btn ghost sm" data-bank="${id}" ${S.bank<pr?'disabled':''}>Van de bank</button>${L.rent?`<button class="btn ghost sm" data-rent="${id}">Huren</button>`:''}`}</div></article>`}).join('');
  ui.innerHTML=`<div class="sd-bd sd-pl"><div class="sd-bd-top"><div><small>${E(M.districtAt(p.door.x,p.door.z))}</small><b>${w.own?'Jouw woning':zone==='brug'?'Onder de brug':'Kavel te koop'}</b></div><span><i>Wit geld</i><b>${fmt(typeof wit==='function'?wit():S.cash)}</b></span><button class="sd-x" data-close aria-label="Sluiten">×</button></div><div class="sd-pl-body">${body}</div></div>`}
G.plotUI=function(p){cur=p;ui.hidden=false;G.pause();render()};
function close(){ui.hidden=true;cur=null;if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
ui.addEventListener('click',e=>{const t=e.target.closest('button');if(e.target===ui||(t&&t.dataset.close!=null)){close();return}if(!t||!cur)return;const p=cur,P=plotsS();
  if(t.dataset.buy||t.dataset.bank){const id=t.dataset.buy||t.dataset.bank;act.buyHouse(id,t.dataset.bank?'bank':undefined);if(S.owned&&S.owned[id]){for(const k in P)if(P[k]===id)delete P[k];P[p.plot]=id;save();close();sync(false)}else render();return}
  if(t.dataset.rent){const id=t.dataset.rent;act.rentHouse(id);if(S.rent&&S.rent.id===id){for(const k in P)if(P[k]===id)delete P[k];P[p.plot]=id;save();close();sync(false)}else render();return}
  if(t.dataset.here){const id=t.dataset.here;for(const k in P)if(P[k]===id)delete P[k];P[p.plot]=id;save();G.toast('Je '+hOf(id).n.toLowerCase()+' komt op deze kavel','lvl');close();sync(false);return}
  if(t.dataset.move){act.moveHouse(t.dataset.move);sync(false);render();return}
  if(t.dataset.sell){const id=t.dataset.sell;if(cur._sell!==id){cur._sell=id;G.toast('Nog een keer klikken om te verkopen','info');return}act.sellHouse(id);sync(false);close();return}
  if(t.dataset.in!=null){const pl=p;close();G.ui&&G.ui.enterDirect&&G.ui.enterDirect(pl)}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!ui.hidden)close()});
G.lotsSetup=setup;G.lotSync=()=>sync(false);
})();
