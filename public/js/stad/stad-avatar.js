// Pixelstad: jouw poppetje, precies zoals je outfit in het spel (outfitLook() uit look.js plus ketting en pols).
// Pak met das en revers, hoodie met capuchon en buidelzak, trainingspak met strepen, jurk, pet, hoed, muts, bivakmuts,
// sneakers met zool, laarzen, ketting, das, koptelefoon, horloge en handschoenen. Gebouwd van blokjes, net als de stad.
(function(){
'use strict';
const TH=window.THREE,G=STAD;
const MAT={},GEO={};
const mat=c=>MAT[c]||(MAT[c]=new TH.MeshLambertMaterial({color:new TH.Color(c)}));
const geo=(w,h,d)=>{const k=w+'|'+h+'|'+d;return GEO[k]||(GEO[k]=new TH.BoxGeometry(w,h,d))};
function shade(c,k){const x=new TH.Color(c);x.multiplyScalar(k);return '#'+x.getHexString()}
// (geen röntgen meer: de stad maakt zelf een doorkijkje rond je poppetje)
function box(par,w,h,d,x,y,z,c){const m=new TH.Mesh(geo(w,h,d),mat(c));m.position.set(x,y,z);m.castShadow=true;par.add(m);return m}
// wat je draagt
function spec(){let L=null,w={};try{L=outfitLook()}catch(e){}try{w=(S.fit&&S.fit.wear)||{}}catch(e){}
  const skin=(()=>{try{return localStorage.getItem('stad_skin')||'#d9a27a'}catch(e){return '#d9a27a'}})();
  const find=id=>typeof OUTFITS!=='undefined'&&OUTFITS.find(o=>o.id===id);
  const nek=find(w.nek),pols=find(w.pols),handen=[w.kleding,w.hoofd,w.pols].map(find).find(o=>o&&o.look&&o.look.kind==='gloves');
  const d={skin,hair:'#2a1d14',top:L&&L.bovenlijf||{kind:'tee',c:'#30353e',c2:'#454b55'},head:L&&L.hoofd||{kind:'none'},legs:L&&L.benen||{kind:'jeans',c:'#1d2531',c2:'#2c3a4d'},
    shoes:L&&L.schoenen||{kind:'sneaker',c:'#3a3f48',c2:'#24282f'},nek:nek?nek.id:null,pols:pols&&pols.look?pols.look:pols?{band:'#d6a63e'}:null,gloves:handen?handen.look.c:null};
  if(d.top.kind==='thief')d.gloves=d.gloves||'#15171b';
  // sole: zit in de look van de schoen, anders licht voor sneakers en donker voor laarzen
  const so=find(w.schoenen);d.shoes.sole=so&&so.look&&so.look.sole||(d.shoes.kind==='boot'?'#1a120c':'#e8e4da');
  return d}
function build(){const d=spec(),g=new TH.Group(),P={};const top=d.top,tk=top.kind||'tee',tc=top.c||'#30353e',t2=top.c2||shade(tc,1.3);
  const legs=d.legs,lc=legs.c||'#1d2531',l2=legs.c2||shade(lc,1.25),sh=d.shoes,hd=d.head,hk=hd.kind||'none';
  const root=new TH.Group();g.add(root);root.scale.setScalar(1.18);P.root=root;
  // benen
  ['L','R'].forEach((s,i)=>{const x=i?.15:-.15,leg=new TH.Group();leg.position.set(x,.84,0);root.add(leg);P['leg'+s]=leg;
    if(tk==='dress'){box(leg,.22,.84,.26,0,-.42,0,d.skin)}else{box(leg,.26,.84,.3,0,-.42,0,lc);if(legs.kind==='track'||legs.kind==='tracksuit'||tk==='tracksuit')box(leg,.03,.8,.08,i?.135:-.135,-.42,0,'#e8e4da',false)}
    const boot=sh.kind==='boot';box(leg,.3,boot?.3:.16,.42,0,boot?-.7:-.76,.05,sh.c||'#3a3f48');box(leg,.31,.05,.43,0,-.82,.05,sh.sole,false);if(sh.kind==='sneaker'&&sh.c2)box(leg,.31,.04,.18,0,-.72,.12,sh.c2,false)});
  // bovenlijf (romp, armen en hoofd hangen aan de heupen, zodat buigen en draaien alles meeneemt)
  const tor=new TH.Group();tor.position.set(0,.84,0);root.add(tor);P.torso=tor;
  box(tor,.62,.72,.36,0,.36,0,tc);
  if(tk==='tee'){box(tor,.18,.06,.02,0,.69,.18,d.skin,false)}
  if(tk==='suit'){box(tor,.18,.34,.02,0,.52,.185,'#f1efe9',false);box(tor,.07,.34,.03,0,.47,.19,t2,false);box(tor,.66,.12,.4,0,0,0,tc);box(tor,.04,.28,.025,-.11,.5,.19,shade(tc,1.5),false);box(tor,.04,.28,.025,.11,.5,.19,shade(tc,1.5),false)}
  if(tk==='jacket'){box(tor,.03,.68,.02,0,.36,.19,t2,false);box(tor,.5,.08,.4,0,.7,0,shade(tc,.8))}
  if(tk==='hoodie'){box(tor,.44,.3,.16,0,.66,-.22,tc);box(tor,.34,.14,.02,0,.16,.19,shade(tc,.75),false);box(tor,.02,.12,.02,-.06,.6,.19,'#e8e4da',false);box(tor,.02,.12,.02,.06,.6,.19,'#e8e4da',false)}
  if(tk==='track'||tk==='tracksuit'){box(tor,.5,.07,.38,0,.7,0,t2);box(tor,.03,.7,.02,0,.36,.19,t2,false)}
  if(tk==='dress'){box(tor,.7,.42,.44,0,-.2,0,tc)}
  if(legs.kind==='jeans'&&tk!=='suit'&&tk!=='dress'&&tk!=='hoodie')box(tor,.63,.06,.37,0,.02,0,'#3a2418',false);
  // ketting, das, koptelefoon, kruisje, sjaal
  const nk=d.nek||'';
  if(/das/.test(nk)&&tk!=='suit'){box(tor,.07,.34,.03,0,.47,.19,'#8a1f2a',false)}
  if(/ketting|zilver|goud|chain|schakel/.test(nk))box(tor,.3,.035,.02,0,.62,.19,/zilver/.test(nk)?'#c9cfd6':'#e8b923',false);
  if(/kruis/.test(nk)){box(tor,.03,.09,.02,0,.56,.19,'#e8b923',false);box(tor,.07,.025,.02,0,.58,.19,'#e8b923',false)}
  if(/koptel/.test(nk)){box(tor,.5,.06,.12,0,.74,-.02,'#1a1c21',false);box(tor,.08,.12,.12,-.24,.74,.04,'#1a1c21',false);box(tor,.08,.12,.12,.24,.74,.04,'#1a1c21',false)}
  if(hk==='scarf'||/sjaal/.test(nk))box(tor,.5,.12,.42,0,.72,0,hd.c||'#1a1c21');
  // rugzak met buit (alleen zichtbaar als je iets draagt)
  const bag=new TH.Group();box(bag,.44,.46,.2,0,.4,-.28,'#3a3226');box(bag,.36,.1,.22,0,.62,-.28,'#2a241a');box(bag,.08,.08,.03,0,.42,-.39,'#d6a63e',false);tor.add(bag);bag.visible=false;P.bag=bag;
  // armen
  ['L','R'].forEach((s,i)=>{const x=i?.41:-.41,arm=new TH.Group();arm.position.set(x,.66,0);tor.add(arm);P['arm'+s]=arm;
    if(tk==='tee'){box(arm,.2,.26,.24,0,-.13,0,tc);box(arm,.18,.4,.22,0,-.46,0,d.skin)}else if(tk==='dress'){box(arm,.18,.66,.22,0,-.33,0,d.skin)}
    else{box(arm,.2,.66,.24,0,-.33,0,tc);if(tk==='track'||tk==='tracksuit')box(arm,.03,.62,.08,i?.1:-.1,-.33,0,t2,false);if(tk==='suit')box(arm,.21,.05,.25,0,-.64,0,'#f1efe9',false)}
    box(arm,.2,.16,.22,0,-.74,0,d.gloves||d.skin);
    if(i===0&&d.pols){box(arm,.22,.06,.26,0,-.6,0,d.pols.band||'#d6a63e',false);if(d.pols.face)box(arm,.1,.07,.02,0,-.6,.13,d.pols.dial||d.pols.face,false)}});
  // wat je in je rechterhand kunt hebben: telefoon, hengel, spuitbus, broodje
  const hand=new TH.Group();hand.position.set(0,-.78,.06);P.armR.add(hand);P.hand=hand;
  const ph=new TH.Group();box(ph,.12,.24,.05,0,.02,.06,'#15171b',false);box(ph,.09,.18,.01,0,.02,.09,'#7fd1ff',false);hand.add(ph);
  const rod=new TH.Group();box(rod,.05,.05,2.6,0,0,1.3,'#6a4a2c',false);box(rod,.07,.12,.16,0,-.06,.25,'#2a2c30',false);const ln=box(rod,.02,1.7,.02,0,-.85,2.58,'#e8e4da',false);hand.add(rod);
  const can=new TH.Group();box(can,.14,.26,.14,0,-.02,.06,'#c9cfd6',false);box(can,.08,.06,.08,0,.14,.06,'#ff4fd8',false);hand.add(can);
  const eat=new TH.Group();box(eat,.2,.12,.14,0,.02,.08,'#d9b06a',false);box(eat,.16,.04,.1,0,.1,.08,'#b8333a',false);hand.add(eat);
  const cup=new TH.Group();box(cup,.12,.18,.12,0,.02,.07,'#f1efe9',false);box(cup,.13,.04,.13,0,.12,.07,'#4a2e1a',false);hand.add(cup);
  P.props={phone:ph,rod,can,eat,cup};Object.values(P.props).forEach(o=>{o.visible=false});P.line=ln;
  // hoofd
  const head=new TH.Group();head.position.set(0,.72,0);tor.add(head);P.head=head;
  box(head,.5,.5,.48,0,.25,0,d.skin);
  P.eyeL=box(head,.07,.08,.02,-.11,.27,.245,'#15161a',false);P.eyeR=box(head,.07,.08,.02,.11,.27,.245,'#15161a',false);box(head,.06,.07,.05,0,.2,.25,shade(d.skin,.85),false);P.mouth=box(head,.14,.03,.02,0,.11,.245,hd.id==='grill'?'#e8b923':shade(d.skin,.6));
  const hc=hd.c||'#2a2c30',h2=hd.c2||shade(hc,.7);
  if(hk==='cap'){box(head,.54,.16,.52,0,.55,0,hc);box(head,.5,.04,.26,0,.49,.34,h2)}
  else if(hk==='hat'){box(head,.8,.04,.76,0,.52,0,hc);box(head,.52,.24,.5,0,.66,0,hc);box(head,.53,.06,.51,0,.57,0,h2)}
  else if(hk==='beanie'){box(head,.54,.24,.52,0,.6,0,hc);box(head,.56,.08,.54,0,.49,0,h2)}
  else if(hk==='skimask'){box(head,.53,.53,.5,0,.26,0,hc);box(head,.34,.1,.02,0,.27,.255,d.skin,false);P.eyeL=box(head,.07,.07,.02,-.11,.27,.262,'#15161a',false);P.eyeR=box(head,.07,.07,.02,.11,.27,.262,'#15161a',false)}
  else{box(head,.54,.14,.52,0,.54,0,d.hair);box(head,.54,.32,.1,0,.36,-.21,d.hair);box(head,.05,.18,.4,-.255,.4,-.02,d.hair,false);box(head,.05,.18,.4,.255,.4,-.02,d.hair,false)}
  return {g,P,key:JSON.stringify(d)}}
let av=null;
function ensure(){let k='';try{k=JSON.stringify(spec())}catch(e){}if(av&&av.key===k)return;const sc=G.scene();if(av)sc.remove(av.g);av=build();sc.add(av.g)}
G.avatarSync=ensure;
// ---- beweging: elke frame een doelhouding (lopen, stilstaan, emote of bezigheid), waar het poppetje soepel naartoe beweegt ----
// G.emote = {id,t0} (zwaaien, dansen …), G.pose = 'vis'|'spuit'|'zoek'|'eet'|'drink'|'aai'|'slaL'|'slaR'|'blok'|'duikL'|'duikR'|'au'|'klap'|'bel',
// G.sitting = zitten, G.lookAt = {x,z} waar je hoofd naar kijkt, G.carry = rugzak met buit.
const cur={lL:0,lR:0,aL:0,aR:0,zL:0,zR:0,tx:0,ty:0,tz:0,hx:0,hy:0,y:0,sy:1},T={};
let idleT=0,blinkT=2,blinkOn=0,lookT=1,lookY=0,fidT=9,fid=null,fidS=0,lastV=0,land=0,tm=0;
const sin=Math.sin,abs=Math.abs;
const EM={
  zwaai:t=>{T.aR=0;T.zR=2.85+sin(t*11)*.32;T.hy=.12;T.tz=-.05},
  dans:t=>{const b=sin(t*6.4);T.y=abs(b)*.13;T.ty=b*.45;T.aL=-1.15+b*.9;T.aR=-1.15-b*.9;T.zL=-.45;T.zR=.45;T.lL=b*.38;T.lR=-b*.38;T.hy=sin(t*3.2)*.35;T.tz=sin(t*3.2)*.08},
  juich:t=>{T.zL=-2.6-sin(t*12)*.16;T.zR=2.6+sin(t*12)*.16;T.aL=T.aR=0;T.y=abs(sin(t*7))*.3;T.hx=-.28},
  buig:t=>{const k=t<.35?t/.35:t>1.5?Math.max(0,1-(t-1.5)/.35):1;T.tx=.95*k;T.hx=.2*k;T.aL=T.aR=.35*k},
  uitdaag:t=>{const b=sin(t*9);T.aL=-1.45+b*.28;T.aR=-1.45-b*.28;T.tx=-.14;T.y=abs(b)*.05;T.hx=-.12},
  duim:t=>{T.aR=-1.65;T.zR=.3;T.y=t<.25?sin(t/.25*Math.PI)*.12:0;T.hy=.1},
  flex:t=>{const b=sin(t*5)*.08;T.zL=-1.75-b;T.zR=1.75+b;T.aL=T.aR=-.2;T.tx=-.1;T.hx=-.1;T.sy=1.02},
  strooi:t=>{const b=sin(t*10);T.aR=-2.1+b*.9;T.zR=.4;T.aL=-.5;T.hy=sin(t*2)*.3;T.y=abs(b)*.04},
  bel:t=>{T.aR=-2.45;T.zR=-.42;T.hy=.18;T.tz=sin(t*1.3)*.04;T.aL=.05},
  klap:t=>{const b=sin(t*16);T.aL=-1.35;T.aR=-1.35;T.zL=.34+b*.16;T.zR=-.34-b*.16;T.y=abs(sin(t*4))*.03}
};
const PO={
  vis:t=>{T.aR=-1.15+sin(t*1.3)*.05;T.aL=-.85;T.zL=.3;T.tx=.06;T.hx=.12},
  vishaal:t=>{T.aR=-1.9+sin(t*14)*.18;T.aL=-1.6-sin(t*14)*.18;T.zL=.3;T.tx=-.22;T.y=abs(sin(t*14))*.03},
  spuit:t=>{T.aR=-1.5+sin(t*17)*.12;T.zR=sin(t*4.4)*.45;T.tx=.05;T.hx=-.05},
  zoek:t=>{T.tx=.78;T.aL=-1.2+sin(t*9)*.32;T.aR=-1.2-sin(t*9)*.32;T.hx=.3;T.lL=.12;T.lR=-.12},
  eet:t=>{T.aR=-2.05+sin(t*5.5)*.38;T.zR=-.3;T.hx=.12+sin(t*5.5)*.05},
  drink:t=>{T.aR=-2.2+sin(t*2.6)*.3;T.zR=-.3;T.hx=-.1-sin(t*2.6)*.12},
  aai:t=>{T.y=-.5;T.sy=.82;T.tx=.45;T.aR=-1.25+sin(t*8)*.22;T.aL=-.3;T.hx=.2},
  pak:t=>{T.tx=.55;T.aR=-1.35;T.aL=-1.1;T.hx=.25},
  slaL:t=>{T.aL=-1.65;T.aR=-1.2;T.zR=-.3;T.ty=.45;T.tx=.14},
  slaR:t=>{T.aR=-1.65;T.aL=-1.2;T.zL=.3;T.ty=-.45;T.tx=.14},
  blok:t=>{T.aL=T.aR=-2.0;T.zL=.45;T.zR=-.45;T.tx=-.06;T.y=-.06},
  klaar:t=>{T.aL=-1.5+sin(t*5)*.08;T.aR=-1.3-sin(t*5)*.08;T.zL=.35;T.zR=-.35;T.y=abs(sin(t*5))*.04;T.tx=.08},
  duikL:t=>{T.tz=.55;T.y=-.22;T.aL=-1.2;T.aR=-1.2},
  duikR:t=>{T.tz=-.55;T.y=-.22;T.aL=-1.2;T.aR=-1.2},
  au:t=>{T.tx=-.4;T.hx=-.35;T.aL=.5;T.aR=.5;T.zL=-.5;T.zR=.5},
  klap:EM.klap,bel:EM.bel,
  moe:t=>{T.tx=.62;T.aL=T.aR=-.72;T.hx=.25;T.sy=1+sin(t*7)*.03}
};
const PROP={vis:'rod',vishaal:'rod',spuit:'can',eet:'eat',drink:'cup',bel:'phone'};
G.avatarPose=function(h){if(!av)ensure();if(!av)return;const g=av.g,P=av.P,dt=Math.min(.05,h.dt||.016),v=h.v||0;tm+=dt;g.visible=!h.hide;if(h.hide)return;
  const sp=Math.min(1,h.sp),run=v>7,sw=sin(h.ph)*(run?.95:.75)*sp,moving=sp>.06;
  // lopen en rennen
  T.lL=sw;T.lR=-sw;T.aL=-sw*(run?1.2:.8)+(h.arm||0);T.aR=sw*(run?1.2:.8)+(h.arm||0);T.zL=run?-.12:-.03;T.zR=run?.12:.03;T.tx=h.lean||0;T.ty=moving?sin(h.ph)*(run?.16:.07):0;T.tz=0;T.hx=run?-.1:0;T.hy=0;T.sy=1;
  T.y=abs(Math.cos(h.ph))*(run?.1:.06)*sp;
  let fast=moving?30:12,prop=null;const em=G.emote,po=h.crouch?null:G.pose;
  // net gestopt na een sprint: even naar achteren hangen
  if(lastV>7&&v<2)land=.22;lastV=v;if(land>0){land-=dt;T.tx-=.22*Math.min(1,land/.15)}
  if(!moving){idleT+=dt;
    // ademen, gewicht verplaatsen, rondkijken
    T.sy=1+sin(tm*2.3)*.012;T.aL+=sin(tm*1.15)*.045;T.aR-=sin(tm*1.15)*.045;T.tz=sin(tm*.55)*.028;T.zL=-.05-sin(tm*2.3)*.012;T.zR=.05+sin(tm*2.3)*.012;
    lookT-=dt;if(lookT<=0){lookT=1.6+Math.random()*3.4;lookY=Math.random()<.35?0:(Math.random()-.5)*1.5}T.hy=lookY;
    // af en toe iets doen als je lang stilstaat: op je horloge kijken, uitrekken, om je heen kijken
    fidT-=dt;if(fidT<=0&&!fid&&!em&&!po&&!G.sitting){fid=['horloge','rek','kijk','voet'][Math.floor(Math.random()*4)];fidS=tm;fidT=7+Math.random()*9}
    if(fid){const t=tm-fidS,k=Math.min(1,t/.3)*Math.min(1,Math.max(0,(1.9-t)/.3));
      if(fid==='horloge'){T.aL=-1.35*k;T.zL=.5*k;T.hx=.42*k;T.hy=-.25*k}else if(fid==='rek'){T.zL=-2.5*k;T.zR=2.5*k;T.tx=-.16*k;T.hx=-.3*k;T.y=.04*k}
      else if(fid==='kijk'){T.hy=sin(t*3.2)*1.1*k;T.ty=sin(t*3.2)*.2*k}else{T.lR=-.5*k*abs(sin(t*6));T.hx=.3*k}
      if(t>1.9)fid=null}
  }else{idleT=0;fid=null;fidT=6+Math.random()*6;lookT=.4}
  // moe (buiten adem tijdens een achtervolging)
  if(!moving&&G.useStam&&G.stam<.14&&!em&&!po){PO.moe(tm);fast=8}
  // zitten
  if(G.sitting){T.lL=T.lR=-1.52;T.y=G.sitY!=null?G.sitY:-.5;T.tx=-.1;T.aL=T.aR=-.55;T.zL=.12;T.zR=-.12;T.sy=1;T.tz=0;fast=10}
  // emote of bezigheid
  if(em&&EM[em.id]){const t=(performance.now()-em.t0)/1000;T.lL=T.lR=0;T.ty=0;EM[em.id](t);fast=18;if(em.id==='bel')prop='phone'}
  else if(po&&PO[po]){if(!moving){T.lL=T.lR=0}PO[po](tm);fast=po.startsWith('sla')||po==='au'||po.startsWith('duik')||po==='blok'?34:16;prop=PROP[po]||null}
  if(h.crouch){T.y=-.55;T.sy=.8;T.aR=-1.2;T.aL=-.4;T.tx=.2}
  // kijken naar wie of wat er voor je staat
  const la=G.lookAt||G.lookNpc;if(la&&!run&&!(em&&em.id==='dans')){let a=Math.atan2(la.x-h.x,la.z-h.z)-h.ry;a=Math.atan2(sin(a),Math.cos(a));if(abs(a)<1.9&&Math.hypot(la.x-h.x,la.z-h.z)<9)T.hy=Math.max(-1.15,Math.min(1.15,a))}
  const k=Math.min(1,dt*fast),kh=Math.min(1,dt*7);
  for(const n in cur){const tv=T[n]==null?0:T[n];cur[n]+=(tv-cur[n])*(n==='hy'||n==='hx'?kh:k)}
  g.position.set(h.x,(h.y||0),h.z);g.rotation.y=h.ry;g.scale.y=cur.sy;
  P.root.position.y=cur.y;P.legL.rotation.x=cur.lL;P.legR.rotation.x=cur.lR;
  P.armL.rotation.set(cur.aL,0,cur.zL);P.armR.rotation.set(cur.aR,0,cur.zR);P.torso.rotation.set(cur.tx,cur.ty,cur.tz);P.head.rotation.set(cur.hx,cur.hy,0);
  // knipperen
  blinkT-=dt;if(blinkT<=0){blinkOn=.12;blinkT=1.8+Math.random()*3.6}const bs=blinkOn>0?.12:1;if(blinkOn>0)blinkOn-=dt;P.eyeL.scale.y=bs;P.eyeR.scale.y=bs;
  for(const n in P.props)P.props[n].visible=n===prop;if(prop==='rod')P.line.visible=po==='vis';
  P.bag.visible=!!G.carry};
G.avatarHand=function(v){if(!av)return null;av.g.updateMatrixWorld(true);av.P.hand.getWorldPosition(v);return v};
G.avatarRodTip=function(v){if(!av)return null;av.g.updateMatrixWorld(true);return av.P.line.getWorldPosition(v)};
setInterval(()=>{if(G.ready&&!G.paused)ensure()},2000);
})();
