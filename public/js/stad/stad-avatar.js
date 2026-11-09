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
  const root=new TH.Group();g.add(root);root.scale.setScalar(1.18);
  // benen
  ['L','R'].forEach((s,i)=>{const x=i?.15:-.15,leg=new TH.Group();leg.position.set(x,.84,0);root.add(leg);P['leg'+s]=leg;
    if(tk==='dress'){box(leg,.22,.84,.26,0,-.42,0,d.skin)}else{box(leg,.26,.84,.3,0,-.42,0,lc);if(legs.kind==='track'||legs.kind==='tracksuit'||tk==='tracksuit')box(leg,.03,.8,.08,i?.135:-.135,-.42,0,'#e8e4da',false)}
    const boot=sh.kind==='boot';box(leg,.3,boot?.3:.16,.42,0,boot?-.7:-.76,.05,sh.c||'#3a3f48');box(leg,.31,.05,.43,0,-.82,.05,sh.sole,false);if(sh.kind==='sneaker'&&sh.c2)box(leg,.31,.04,.18,0,-.72,.12,sh.c2,false)});
  // romp
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
  // armen
  ['L','R'].forEach((s,i)=>{const x=i?.41:-.41,arm=new TH.Group();arm.position.set(x,1.5,0);root.add(arm);P['arm'+s]=arm;
    if(tk==='tee'){box(arm,.2,.26,.24,0,-.13,0,tc);box(arm,.18,.4,.22,0,-.46,0,d.skin)}else if(tk==='dress'){box(arm,.18,.66,.22,0,-.33,0,d.skin)}
    else{box(arm,.2,.66,.24,0,-.33,0,tc);if(tk==='track'||tk==='tracksuit')box(arm,.03,.62,.08,i?.1:-.1,-.33,0,t2,false);if(tk==='suit')box(arm,.21,.05,.25,0,-.64,0,'#f1efe9',false)}
    box(arm,.2,.16,.22,0,-.74,0,d.gloves||d.skin);
    if(i===0&&d.pols){box(arm,.22,.06,.26,0,-.6,0,d.pols.band||'#d6a63e',false);if(d.pols.face)box(arm,.1,.07,.02,0,-.6,.13,d.pols.dial||d.pols.face,false)}});
  // hoofd
  const head=new TH.Group();head.position.set(0,1.56,0);root.add(head);P.head=head;
  box(head,.5,.5,.48,0,.25,0,d.skin);
  box(head,.07,.08,.02,-.11,.27,.245,'#15161a',false);box(head,.07,.08,.02,.11,.27,.245,'#15161a',false);box(head,.06,.07,.05,0,.2,.25,shade(d.skin,.85),false);box(head,.14,.03,.02,0,.11,.245,hd.id==='grill'?'#e8b923':shade(d.skin,.6));
  const hc=hd.c||'#2a2c30',h2=hd.c2||shade(hc,.7);
  if(hk==='cap'){box(head,.54,.16,.52,0,.55,0,hc);box(head,.5,.04,.26,0,.49,.34,h2)}
  else if(hk==='hat'){box(head,.8,.04,.76,0,.52,0,hc);box(head,.52,.24,.5,0,.66,0,hc);box(head,.53,.06,.51,0,.57,0,h2)}
  else if(hk==='beanie'){box(head,.54,.24,.52,0,.6,0,hc);box(head,.56,.08,.54,0,.49,0,h2)}
  else if(hk==='skimask'){box(head,.53,.53,.5,0,.26,0,hc);box(head,.34,.1,.02,0,.27,.255,d.skin,false);box(head,.07,.07,.02,-.11,.27,.262,'#15161a',false);box(head,.07,.07,.02,.11,.27,.262,'#15161a',false)}
  else{box(head,.54,.14,.52,0,.54,0,d.hair);box(head,.54,.32,.1,0,.36,-.21,d.hair);box(head,.05,.18,.4,-.255,.4,-.02,d.hair,false);box(head,.05,.18,.4,.255,.4,-.02,d.hair,false)}
  return {g,P,key:JSON.stringify(d)}}
let av=null;
function ensure(){let k='';try{k=JSON.stringify(spec())}catch(e){}if(av&&av.key===k)return;const sc=G.scene();if(av)sc.remove(av.g);av=build();sc.add(av.g)}
G.avatarSync=ensure;
G.avatarPose=function(h){if(!av)ensure();if(!av)return;const g=av.g,P=av.P;g.visible=!h.hide;g.position.set(h.x,(h.y||0),h.z);g.rotation.y=h.ry;
  const sw=Math.sin(h.ph)*.75*Math.min(1,h.sp),bob=Math.abs(Math.cos(h.ph))*.06*Math.min(1,h.sp);
  P.legL.rotation.x=sw;P.legR.rotation.x=-sw;P.armL.rotation.x=-sw*.8+(h.arm||0);P.armR.rotation.x=sw*.8+(h.arm||0);P.torso.rotation.x=h.lean||0;
  g.children[0].position.y=bob;P.head.rotation.y=Math.sin(h.ph*.5)*.04*Math.min(1,h.sp)};
setInterval(()=>{if(G.ready&&!G.paused)ensure()},2000);
})();
