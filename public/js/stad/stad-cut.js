// Verhaal: cutscènes en acteurs (G.cut).
//   await G.cut.play([...stappen], {blijf, hq})  speelt een cutscène: zwarte balken, ondertitels met naam en portret, camerapad,
//   acteurs die lopen, rennen, zitten, dragen, wijzen, geven en praten; overslaan met de knop, Esc of lang drukken.
// Stappen (alles optioneel, coördinaten in de wereld; in een interieur: G.binnen.p(id,x,z) → [x,z]):
//   {cam:{pos:[x,y,z],look:[x,y,z],to:{pos,look},t:3,fov:40,wacht:false}}   camera (beweegt in t seconden naar 'to'; zonder wacht:false wacht het script)
//   {cam:{volg:'rafiq',af:[dx,dy,dz],kijk:[dx,dy,dz]}}                      camera hangt aan een acteur ({cam:null} = terug naar het spel)
//   {actor:'rafiq',at:[x,z],ry,anim:'sit',sitY:-.45,y:0,look:{…},blijf:true}  acteur neerzetten (look = eigen uiterlijk, anders uit G.cut.actors)
//   {move:'rafiq',to:[x,z],t:2,anim:'walk'|'run'|'carry',wacht:false}        lopen (t = duur, anders loopsnelheid)
//   {anim:'rafiq',a:'point'|'give'|'talk'|'sit'|'turn'|…,ry,naar:[x,z]|'luca',prop:'envelop'|'geld'|'telefoon'|null,dozen:n}
//   {say:'rafiq',text:'Hé, jongen.',t:2.4,mood:'blij'}                      ondertitel; wacht op tik of t seconden
//   {keuze:[{t:'Ja',f(){}},{t:'Nee',f(){}}],wie:'rafiq',text:'…'}            keuze in de ondertitel (kan niet overgeslagen worden)
//   {fade:'out'|'in',t:.6} {wait:1} {snd:'notify'} {fn:async()=>{}} {dream:true|false} {titel:'Avond 1',sub:'De eerste dienst',t:3}
//   {speler:false} speler verbergen · {speler:[x,z,ry]} speler daar neerzetten en tonen · {weg:'rafiq'} acteur weg
//   {par:[stap,stap]} tegelijk · {binnen:'sahara'} / {buiten:true} interieur in en uit (zonder eigen fade)
// G.cut.actors: de cast (naam, kleur, rol, look = 3D-poppetje voor stad-avatar, face = portret voor K.face).
// G.cut.persoon(idOfLook,{x,z,ry,anim}) = los poppetje (figuranten in interieurs), G.cut.acteur(id) = acteur in de huidige scène.
// Hooks voor de mooiere cutscène-look (agent LOOK): G.cut.hq = {pix, portret, schaduw}, G.cut.onStart[], G.cut.onEnd[],
//   G.cut.bouwer = (spec,o)=>({g,P}) eigen poppetjes, G.uiterlijk.spec(id) / .face(id) gaan voor de looks hieronder.
(function(){
'use strict';
const G=STAD,TH=window.THREE,K=G.kit,E=K.E,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sin=Math.sin,cos=Math.cos,abs=Math.abs;
const ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
const CUT=G.cut={};

/* =================== de cast van hoofdstuk 1 =================== */
// look: stad-avatar spec (skin, hair, hs, fh, eye, mood, mouth, top{kind,c,c2}, legs, shoes, head, nek, pols, glasses, sun, gloves) · schaal
// face: K.face-portret (skin, hair, hs, fh, fw, jaw, age, eye, v, col, top, hat, hatC, acc)
const A={
 luca:{n:'Luca',col:'#ff4fd8',rol:'16 · bezorger',look:null,face:null},
 dex:{n:'Dex',col:'#ff5a4a',rol:'Beste vriend',look:{skin:'#8d5a3a',hair:'#16161a',hs:'opgeschoren',eye:'#24160e',mood:'blij',mouth:'breed',top:{kind:'track',c:'#b0221e',c2:'#16161a'},legs:{kind:'track',c:'#16161a',c2:'#b0221e'},shoes:{kind:'sneaker',c:'#f1efe9',c2:'#b0221e'},head:{kind:'cap',c:'#16161a',c2:'#b0221e'},nek:'zilver ketting'},
   face:{skin:'#8d5a3a',hair:'#16161a',hs:'opgeschoren',eye:'#24160e',top:'#b0221e',col:'track',hat:'pet',hatC:'#16161a',age:0,fw:18,mouth:'breed',acc:{oor:1}}},
 giovanni:{n:'Giovanni',col:'#3fe395',rol:'Pizzeria Bella Napoli',look:{skin:'#e0ab84',hair:'#e4dfd4',hs:'kaal',fh:'snor',eye:'#5a3a22',mood:'blij',top:{kind:'jacket',c:'#f1efe9',c2:'#b8333a'},legs:{kind:'jeans',c:'#3a3c40'},shoes:{kind:'boot',c:'#3a2418'}},
   face:{skin:'#e0ab84',hair:'#e4dfd4',hs:'kalend',fh:'snor',eye:'#5a3a22',top:'#f1efe9',col:'schort',age:2,fw:20,jaw:'rond'},schaal:.97},
 rafiq:{n:'Rafiq',col:'#ffd35a',rol:'Eigenaar Lounge Sahara',look:{skin:'#b97a52',hair:'#16161a',hs:'kuif',fh:'ringbaard',eye:'#24160e',mood:'koel',top:{kind:'jacket',c:'#16161a',c2:'#c9a227'},legs:{kind:'jeans',c:'#1a1a1c'},shoes:{kind:'boot',c:'#2a1a12'},nek:'goud ketting',pols:{band:'#d6a63e',face:'#f1efe9'}},
   face:{skin:'#b97a52',hair:'#16161a',hs:'kuif',fh:'ringbaard',eye:'#24160e',top:'#16161a',col:'leer',age:1,fw:18,jaw:'hoekig',chain:1,acc:{oor:1}}},
 uitsmijter:{n:'Uitsmijter',col:'#9aa1ab',rol:'Lounge Sahara',look:{skin:'#6e4630',hair:'#16161a',hs:'kaal',fh:'sik',eye:'#24160e',mood:'boos',top:{kind:'jacket',c:'#121316',c2:'#2a2c30'},legs:{kind:'jeans',c:'#121316'},shoes:{kind:'boot',c:'#121316'},sun:'#0b0b0d'},
   face:{skin:'#6e4630',hair:'#16161a',hs:'kaal',fh:'sik',top:'#121316',col:'pak',age:1,fw:20,jaw:'hoekig',w:1,acc:{zon:1,oor:1}},schaal:1.16},
 elena:{n:'Elena',col:'#7fd1ff',rol:'Moeder · verpleegster',look:{skin:'#d9a27a',hair:'#3a2418',hs:'knot',eye:'#5a3a22',mood:'neutraal',mouth:'vol',top:{kind:'tee',c:'#7fb8c9'},legs:{kind:'jeans',c:'#7fb8c9',c2:'#6fa6b6'},shoes:{kind:'sneaker',c:'#f1efe9',c2:'#c9cfd6'}},
   face:{skin:'#d9a27a',hair:'#3a2418',hs:'knot',eye:'#5a3a22',top:'#7fb8c9',col:'uniform',age:1,v:1,fw:16,jaw:'spits',lip:'#a0504a'},schaal:.94},
 marco:{n:'Marco',col:'#d6a63e',rol:'Vader · havenwerker',look:{skin:'#c8956a',hair:'#3a3632',hs:'kort',fh:'stoppel',eye:'#3a2414',mood:'neutraal',top:{kind:'tee',c:'#8a8c90'},legs:{kind:'track',c:'#2a2c30'},shoes:{kind:'sneaker',c:'#3a3f48',c2:'#24282f'}},
   face:{skin:'#c8956a',hair:'#4a4642',hs:'kalend',fh:'stoppel',eye:'#3a2414',top:'#8a8c90',col:'shirt',age:1,fw:20,jaw:'hoekig'},schaal:1.03},
 giulia:{n:'Giulia',col:'#c49bff',rol:'Zus · studeert rechten',look:{skin:'#d0a07a',hair:'#1a1410',hs:'lang',eye:'#3a2414',mood:'neutraal',mouth:'vol',top:{kind:'jacket',c:'#6a2a3a',c2:'#e8e4da'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'boot',c:'#2a1a12'},glasses:'#2a2c30'},
   face:{skin:'#d0a07a',hair:'#1a1410',hs:'lang',eye:'#3a2414',top:'#6a2a3a',col:'blouse',age:0,v:1,fw:16,jaw:'spits',acc:{bril:1}},schaal:.95},
 docent:{n:'Meneer Visser',col:'#a9dcff',rol:'Docent economie',look:{skin:'#f1caa5',hair:'#8e8c88',hs:'opgeschoren',fh:'baard',eye:'#3f6fb8',mood:'neutraal',top:{kind:'jacket',c:'#6a5a3a',c2:'#d8cdb5'},legs:{kind:'jeans',c:'#4a3a2a'},shoes:{kind:'boot',c:'#3a2418'},glasses:'#2a2c30'},
   face:{skin:'#f1caa5',hair:'#8e8c88',hs:'kalend',fh:'baard',eye:'#3f6fb8',top:'#6a5a3a',col:'trui',age:2,fw:18,acc:{bril:1}}},
 klant_student:{n:'Student',col:'#3fe395',rol:'Klant',look:{skin:'#f1caa5',hair:'#a8461e',hs:'lang',eye:'#3d7a42',mood:'blij',top:{kind:'hoodie',c:'#2f5d3a',c2:'#3c7a4a'},legs:{kind:'track',c:'#3a3c40'},shoes:{kind:'sneaker',c:'#e8e4da',c2:'#2f5d3a'},head:{kind:'beanie',c:'#c28a2a'}},
   face:{skin:'#f1caa5',hair:'#a8461e',hs:'lang',eye:'#3d7a42',top:'#2f5d3a',col:'hoodie',hat:'beanie',hatC:'#c28a2a',age:0,fw:16}},
 klant_oude_man:{n:'Meneer De Wit',col:'#d6a63e',rol:'Klant',look:{skin:'#ecc2a0',hair:'#e4dfd4',hs:'kort',eye:'#7d8b97',mood:'blij',top:{kind:'jacket',c:'#7a5a3a',c2:'#e8e0cc'},legs:{kind:'jeans',c:'#5a5a62'},shoes:{kind:'boot',c:'#3a2418'},glasses:'#8a6a2a'},
   face:{skin:'#ecc2a0',hair:'#e4dfd4',hs:'kalend',eye:'#7d8b97',top:'#7a5a3a',col:'trui',age:2,fw:18,acc:{bril:1}},schaal:.93},
 receptioniste:{n:'Receptioniste',col:'#a9dcff',rol:'Kantoor Zuidas',look:{skin:'#f1caa5',hair:'#d4ac5a',hs:'knot',eye:'#3f6fb8',mood:'koel',mouth:'smal',top:{kind:'suit',c:'#1f2d4a',c2:'#f1efe9'},legs:{kind:'jeans',c:'#1f2d4a'},shoes:{kind:'boot',c:'#16161a'}},
   face:{skin:'#f1caa5',hair:'#d4ac5a',hs:'knot',eye:'#3f6fb8',top:'#1f2d4a',col:'pak',age:1,v:1,fw:16,jaw:'spits',lip:'#b0404a'},schaal:.94},
 agent:{n:'Agent',col:'#4d7dff',rol:'Politie',look:{skin:'#e9b98f',hair:'#5a3a22',hs:'kort',eye:'#3f6fb8',mood:'neutraal',top:{kind:'jacket',c:'#1f2d4a',c2:'#e8e4da'},legs:{kind:'jeans',c:'#1a2236'},shoes:{kind:'boot',c:'#121316'},head:{kind:'cap',c:'#1a2236',c2:'#e8e4da'}},
   face:{skin:'#e9b98f',hair:'#5a3a22',hs:'kort',eye:'#3f6fb8',top:'#1f2d4a',col:'uniform',hat:'pet',hatC:'#1a2236',age:1,fw:18}},
 nova:{n:'Nova',col:'#ff3d7a',rol:'Rechterhand van Ray',look:{skin:'#b97a52',hair:'#16161a',hs:'lang',eye:'#24160e',mood:'koel',top:{kind:'jacket',c:'#121316',c2:'#3a3d44'},legs:{kind:'jeans',c:'#121316'},shoes:{kind:'boot',c:'#121316'},head:{kind:'skimask',c:'#16161a'},gloves:'#121316'},
   face:{skin:'#b97a52',hair:'#16161a',hs:'lang',top:'#121316',col:'leer',hat:'mask',hatC:'#16161a',age:1,v:1,fw:16,jaw:'spits'},schaal:.96},
 ray:{n:'Grote Ray',col:'#e8e4da',rol:'',look:{skin:'#4a2e20',hair:'#16161a',hs:'opgeschoren',fh:'baard',eye:'#24160e',mood:'koel',top:{kind:'suit',c:'#2a2c30',c2:'#16161a'},legs:{kind:'jeans',c:'#1a1a1c'},shoes:{kind:'boot',c:'#16161a'},pols:{band:'#c9cfd6',face:'#16161a'}},
   face:{skin:'#4a2e20',hair:'#16161a',hs:'kaal',fh:'baard',eye:'#24160e',top:'#2a2c30',col:'pak',age:1,fw:20,jaw:'hoekig',w:1},schaal:1.22},
 rapido:{n:'Bezorger van Rapido',col:'#f2c230',rol:'Pizza Rapido',look:{skin:'#e9b98f',hair:'#c9a24a',hs:'kuif',eye:'#3f6fb8',mood:'boos',top:{kind:'jacket',c:'#f2c230',c2:'#2f5d3a'},legs:{kind:'track',c:'#2f5d3a'},shoes:{kind:'sneaker',c:'#16161a',c2:'#f2c230'},head:{kind:'cap',c:'#2f5d3a',c2:'#f2c230'}},
   face:{skin:'#e9b98f',hair:'#c9a24a',hs:'kuif',eye:'#3f6fb8',top:'#f2c230',col:'werk',hat:'pet',hatC:'#2f5d3a',age:0,fw:18}},
 scooterdief:{n:'Scooterdief',col:'#9aa1ab',rol:'',look:{skin:'#d9a27a',hair:'#16161a',hs:'kort',eye:'#24160e',mood:'boos',top:{kind:'hoodie',c:'#2a2c30',c2:'#3a3d44'},legs:{kind:'track',c:'#16161a',c2:'#8a8c90'},shoes:{kind:'sneaker',c:'#e8e4da',c2:'#16161a'},head:{kind:'beanie',c:'#16161a'}},
   face:{skin:'#d9a27a',hair:'#16161a',hs:'kort',eye:'#24160e',top:'#2a2c30',col:'hoodie',hat:'beanie',hatC:'#16161a',age:0,fw:16}},
 brugklasser:{n:'Brugklasser',col:'#7fd1ff',rol:'',look:{skin:'#e9b98f',hair:'#8a5a2a',hs:'kort',eye:'#5a3a22',mood:'neutraal',top:{kind:'hoodie',c:'#2f6a8a',c2:'#3a7a9a'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'sneaker',c:'#e8e4da',c2:'#2f6a8a'},head:{kind:'cap',c:'#2f6a8a',c2:'#e8e4da'}},
   face:{skin:'#e9b98f',hair:'#8a5a2a',hs:'kort',eye:'#5a3a22',top:'#2f6a8a',col:'hoodie',hat:'pet',hatC:'#2f6a8a',age:0,fw:16},schaal:.8},
 oudere_jongen:{n:'Oudere jongen',col:'#ff9a5a',rol:'',look:{skin:'#e9b98f',hair:'#2a1d14',hs:'opgeschoren',eye:'#24160e',mood:'boos',top:{kind:'jacket',c:'#3a4a2a',c2:'#c28a2a'},legs:{kind:'track',c:'#16161a'},shoes:{kind:'sneaker',c:'#16161a',c2:'#e8e4da'}},
   face:{skin:'#e9b98f',hair:'#2a1d14',hs:'opgeschoren',eye:'#24160e',top:'#3a4a2a',col:'leer',age:0,fw:18,jaw:'hoekig'},schaal:1.06},
 buurvrouw_ans:{n:'Buurvrouw Ans',col:'#ffb0d0',rol:'Buurvrouw',look:{skin:'#f1caa5',hair:'#d8d4cc',hs:'knot',eye:'#7d8b97',mood:'blij',top:{kind:'jacket',c:'#7a4a8a',c2:'#d8cdb5'},legs:{kind:'jeans',c:'#5a5a62'},shoes:{kind:'boot',c:'#3a2418'},glasses:'#c9cfd6'},
   face:{skin:'#f1caa5',hair:'#d8d4cc',hs:'knot',eye:'#7d8b97',top:'#7a4a8a',col:'trui',age:2,v:1,fw:16,acc:{bril:1}},schaal:.88}};
CUT.actors=A;
CUT.look=function(id){if(G.uiterlijk&&G.uiterlijk.spec){try{const x=G.uiterlijk.spec(id);if(x)return x}catch(e){}}if(id==='luca'&&G.story)return G.story.lucaLook();const a=A[id];return a&&a.look?a.look:null};
CUT.face=function(id){if(G.uiterlijk&&G.uiterlijk.face){try{const x=G.uiterlijk.face(id);if(x)return x}catch(e){}}if(id==='luca'&&G.story)return G.story.lucaFace();const a=A[id];return a&&a.face?a.face:{skin:'#d9a27a',hair:'#2a1d14',top:'#30353e'}};
// willekeurige figuranten (gasten, leerlingen, voorbijgangers)
const SK=['#f1caa5','#e9b98f','#d9a27a','#c8956a','#b97a52','#8d5a3a','#6e4630','#4a2e20'],HC=['#16161a','#2a1d14','#5a3a22','#8a5a2a','#d4ac5a','#a8461e'],
  TC=['#3a4a6a','#7a2f2a','#2f5d3a','#d8d4cc','#2a2c30','#c28a2a','#5a3a7a','#2f6a8a','#8a8c90','#b04a6a','#16161a','#e8e4da'],HS=['kort','kuif','opgeschoren','lang','krul','afro','knot','kaal'],
  TK=['tee','tee','hoodie','jacket','track','suit'];
const pick=a=>a[Math.floor(Math.random()*a.length)];
CUT.figurant=function(o){o=o||{};const v=o.v!=null?o.v:Math.random()<.4,hs=o.hs||(v?pick(['lang','knot','krul','afro','lang']):pick(['kort','kuif','opgeschoren','krul','kaal','afro'])),tk=o.top||pick(TK),tc=pick(TC);
  return {skin:pick(SK),hair:pick(HC),hs,fh:!v&&Math.random()<.35?pick(['stoppel','sik','ringbaard','baard','snor']):'',eye:pick(['#5a3a22','#24160e','#8a6a2a','#3d7a42','#3f6fb8']),mood:pick(['neutraal','blij','koel']),mouth:v?'vol':pick(['normaal','breed','smal']),
    top:{kind:tk,c:tc,c2:K.shade(tc,1.3)},legs:{kind:pick(['jeans','jeans','track']),c:pick(['#1d2531','#2c3a4d','#3a3c40','#16161a','#4a3a2a'])},shoes:{kind:pick(['sneaker','sneaker','boot']),c:pick(['#e8e4da','#2a2c30','#3a2418']),c2:pick(['#b8333a','#2f6a8a','#16161a'])},
    head:Math.random()<.15?{kind:pick(['cap','beanie']),c:pick(TC)}:{kind:'none'},nek:Math.random()<.2?'goud ketting':null}};

/* =================== poppetjes bouwen (stad-avatar) en samenvoegen =================== */
const MATV=new TH.MeshLambertMaterial({vertexColors:true});
const BAKE=['root','legL','legR','torso','armL','armR','head','hand'];
function bake(P){BAKE.forEach(k=>{const node=P[k];if(!node)return;const ms=node.children.filter(c=>c.isMesh&&c.visible!==false);if(ms.length<2)return;
  const pos=[],nor=[],col=[],c=new TH.Color();
  ms.forEach(m=>{m.updateMatrix();let g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrix);const p=g.attributes.position.array,n=g.attributes.normal.array;c.copy(m.material.color);
    for(let i=0;i<p.length;i+=3){pos.push(p[i],p[i+1],p[i+2]);nor.push(n[i],n[i+1],n[i+2]);col.push(c.r,c.g,c.b)}g.dispose();node.remove(m)});
  const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(pos,3));g.setAttribute('normal',new TH.Float32BufferAttribute(nor,3));g.setAttribute('color',new TH.Float32BufferAttribute(col,3));
  const me=new TH.Mesh(g,MATV);me.castShadow=true;me.receiveShadow=false;node.add(me)});
  if(P.props)Object.values(P.props).forEach(o=>{o.parent&&o.parent.remove(o)});return P}
function bouw(spec,o){if(CUT.bouwer){try{const r=CUT.bouwer(spec,o);if(r&&r.g)return r}catch(e){console.error(e)}}
  const r=G.avatarBuild({spec});bake(r.P);return r}
// pizzadozen (ook voor G.draag)
function doos(){const m=K.model([[.64,.13,.64,0,.065,0,'#e8dcc0'],[.66,.02,.66,0,.13,0,'#d8c8a4'],[.5,.012,.14,0,.142,.12,'#c0261e'],[.14,.013,.14,-.17,.143,-.12,'#2f6a3a'],[.2,.014,.04,.12,.143,-.14,'#c0261e'],[.64,.04,.02,0,.065,.33,'#c8b890']]);return m}
CUT.doos=doos;
function stapel(n){const g=new TH.Group();for(let i=0;i<n;i++){const d=doos();d.position.y=i*.135;d.rotation.y=(i%2?.05:-.04);g.add(d)}return g}
CUT.stapel=stapel;
const PROP={envelop:()=>K.model([[.32,.03,.2,0,0,.1,'#e8dcc0'],[.32,.032,.06,0,.001,.17,'#d8c8a4']]),
  geld:()=>K.model([[.11,.11,.24,0,0,.1,'#5a8a4a'],[.115,.02,.12,0,0,.1,'#c9a227']]),
  telefoon:()=>K.model([[.12,.24,.05,0,.02,.06,'#15171b'],[.09,.18,.01,0,.02,.09,'#7fd1ff',1]]),
  tas:()=>K.model([[.5,.42,.3,0,-.25,.12,'#1a1c21'],[.06,.3,.04,-.12,.05,.12,'#2a2c30'],[.06,.3,.04,.12,.05,.12,'#2a2c30'],[.5,.04,.31,0,-.06,.12,'#c0261e']]),
  waterpijp:()=>K.model([[.06,.4,.06,0,.2,.1,'#c9a227']]),
  pet:()=>K.model([[.32,.12,.3,0,0,.12,'#2f6a8a'],[.3,.03,.16,0,-.05,.28,'#e8e4da']]),
  krijt:()=>K.model([[.04,.04,.12,0,0,.1,'#f1efe9']]),
  sleutel:()=>K.model([[.05,.12,.02,0,0,.08,'#d6a63e']]),
  pakket:()=>K.model([[.22,.14,.18,0,0,.1,'#c9cfd6'],[.23,.02,.19,0,.02,.1,'#8a8c90']])};

/* =================== animaties =================== */
// per poppetje een doelhouding per frame; de onderdelen bewegen er soepel naartoe (zelfde assen als stad-avatar.js)
const POSE={
 idle:(T,t,a)=>{T.sy=1+sin(t*2.3+a.seed)*.012;T.aL=sin(t*1.15+a.seed)*.045;T.aR=-T.aL;T.zL=-.05;T.zR=.05;T.tz=sin(t*.55+a.seed)*.025;T.hy=a.lookY||0},
 sit:(T,t,a)=>{T.lL=T.lR=-1.52;T.y=a.sitY!=null?a.sitY:-.5;T.tx=-.06;T.aL=T.aR=-.55;T.zL=.12;T.zR=-.12;T.hy=a.lookY||0;T.sy=1+sin(t*2.3+a.seed)*.01},
 laag:(T,t,a)=>{T.lL=-1.2;T.lR=-1.35;T.y=a.sitY!=null?a.sitY:-.78;T.tx=-.18;T.aL=-.35;T.aR=-.5;T.zL=.25;T.zR=-.2;T.hy=a.lookY||0},
 tv:(T,t,a)=>{POSE.sit(T,t,a);T.tx=-.22;T.aL=-.2;T.aR=-.25;T.hx=-.05},
 slaap:(T,t,a)=>{POSE.sit(T,t,a);T.tx=.15;T.hx=.5;T.aL=T.aR=-.3},
 carry:(T,t,a,mv)=>{T.aL=T.aR=-1.18;T.zL=.2;T.zR=-.2;T.tx=-.05;if(!mv)POSE.idle(T,t,a),T.aL=T.aR=-1.18,T.zL=.2,T.zR=-.2},
 point:(T,t,a)=>{T.aR=-1.62;T.zR=.08;T.aL=.05;T.hy=0;T.tx=-.03},
 give:(T,t,a)=>{T.aR=-1.2;T.zR=-.1;T.aL=.05;T.tx=.08;T.hx=.15},
 talk:(T,t,a)=>{POSE.idle(T,t,a);T.aR=-.55+sin(t*3.1+a.seed)*.28;T.zR=-.15;T.aL=-.2+sin(t*2.3)*.12;T.hx=sin(t*4.2)*.05;T.hy=(a.lookY||0)+sin(t*1.7)*.1},
 armen:(T,t,a)=>{T.aL=T.aR=-1.15;T.zL=.72;T.zR=-.72;T.sy=1+sin(t*2)*.01;T.hy=(a.lookY||0)+sin(t*.4+a.seed)*.25;T.tx=-.04},
 handenzij:(T,t,a)=>{T.aL=T.aR=-.3;T.zL=-.25;T.zR=.25;T.hy=a.lookY||0},
 rook:(T,t,a)=>{POSE.laag(T,t,a);const k=(t*.35+a.seed)%3;const p=k<.8?sin(k/.8*Math.PI):0;T.aR=-.6-1.45*p;T.zR=-.3*p;T.hx=-.12*p;if(a.onPuff&&p>.95&&!a._puffed){a._puffed=1;a.onPuff(a)}if(p<.1)a._puffed=0},
 kaart:(T,t,a)=>{POSE.sit(T,t,a);T.aL=-1.05+sin(t*1.3+a.seed)*.05;T.aR=-1.0+(sin(t*.9+a.seed)>.85?-.4:0);T.zL=.25;T.zR=-.25;T.hx=.25;T.tx=.08},
 dans:(T,t,a)=>{const b=sin(t*6.4+a.seed);T.y=abs(b)*.12;T.ty=b*.4;T.aL=-1.1+b*.8;T.aR=-1.1-b*.8;T.zL=-.4;T.zR=.4;T.lL=b*.34;T.lR=-b*.34;T.hy=sin(t*3.2)*.3;T.tz=sin(t*3.2)*.08},
 dans2:(T,t,a)=>{const b=sin(t*5.2+a.seed);T.y=abs(b)*.06;T.ty=b*.25;T.aL=-.6;T.aR=-2.5+b*.3;T.zR=.3;T.lL=b*.2;T.lR=-b*.2;T.hx=-.1+abs(b)*.15},
 dj:(T,t,a)=>{const b=sin(t*8.4);T.aL=-1.2;T.zL=.2;T.aR=-1.15+sin(t*11)*.12;T.zR=-.25+sin(t*5.5)*.2;T.hx=.18+b*.12;T.y=abs(b)*.025;T.tx=.12},
 tel:(T,t,a)=>{POSE.sit(T,t,a);T.aL=-1.1;T.aR=-1.05+sin(t*14+a.seed)*.12;T.zL=.28;T.zR=-.28+sin(t*7)*.08;T.hx=.35;T.tx=.15},
 kok:(T,t,a)=>{T.aL=-1.0+sin(t*5+a.seed)*.25;T.aR=-1.1-sin(t*5+a.seed)*.25;T.zL=.2;T.zR=-.2;T.tx=.18;T.hx=.3;T.y=abs(sin(t*5))*.015},
 bar:(T,t,a)=>{T.aL=-.95;T.aR=-1.25+sin(t*4+a.seed)*.3;T.zL=.15;T.zR=-.1;T.tx=.1;T.hx=.2},
 leun:(T,t,a)=>{T.tx=-.12;T.aL=-.2;T.aR=-.9;T.zR=-.6;T.lL=.15;T.lR=-.1;T.hy=(a.lookY||0)+sin(t*.5+a.seed)*.3},
 zwaai:(T,t,a)=>{T.aR=0;T.zR=2.85+sin(t*11)*.32;T.hy=.12;T.tz=-.05},
 handenop:(T,t,a)=>{T.zL=-2.7;T.zR=2.7;T.aL=T.aR=0;T.hx=.1;T.sy=1+sin(t*9)*.006},
 hurk:(T,t,a)=>{T.y=-.62;T.lL=-1.45;T.lR=-1.25;T.tx=.35;T.aL=-.9;T.aR=-.75;T.zL=.2;T.zR=-.2;T.hx=-.2},
 duw:(T,t,a)=>{T.aL=T.aR=-1.55;T.zL=.1;T.zR=-.1;T.tx=.25;T.lL=-.4;T.lR=.25},
 bel:(T,t,a)=>{T.aR=-2.45;T.zR=-.42;T.hy=.18;T.tz=sin(t*1.3)*.04;T.aL=.05},
 drink:(T,t,a)=>{T.aR=-2.2+sin(t*2.6)*.3;T.zR=-.3;T.hx=-.1-sin(t*2.6)*.12},
 schrijf:(T,t,a)=>{T.aR=-2.05+sin(t*3)*.15;T.zR=.2+sin(t*4.5)*.25;T.aL=-.2;T.hx=-.1},
 schrik:(T,t,a)=>{T.tx=-.3;T.hx=-.3;T.aL=T.aR=-.9;T.zL=-.5;T.zR=.5},
 bang:(T,t,a)=>{T.tx=.25;T.hx=.45;T.aL=T.aR=-1.0;T.zL=.65;T.zR=-.65;T.y=-.04;T.sy=.97+sin(t*14)*.008},
 juich:(T,t,a)=>{T.zL=-2.6-sin(t*12)*.16;T.zR=2.6+sin(t*12)*.16;T.aL=T.aR=0;T.y=abs(sin(t*7))*.25;T.hx=-.28},
 klap:(T,t,a)=>{const b=sin(t*16);T.aL=-1.35;T.aR=-1.35;T.zL=.34+b*.16;T.zR=-.34-b*.16},
 dag:(T,t,a)=>{POSE.sit(T,t,a);T.aL=-1.3;T.zL=.5;T.hx=-.1;T.hy=.6;T.aR=-.45;T.tx=.05},
 schrijfzit:(T,t,a)=>{POSE.sit(T,t,a);T.aR=-1.2+sin(t*6+a.seed)*.06;T.zR=-.1+sin(t*9)*.05;T.aL=-1.0;T.zL=.3;T.hx=.38;T.tx=.15},
 turn:(T,t,a)=>{POSE.idle(T,t,a)}};
CUT.POSE=POSE;
const PERS=new Set();
let blinkG=0;
function step(dt){const tt=performance.now()/1000;
  PERS.forEach(a=>{if(!a.g.parent||a.slaap){return}
    // lopen naar een doel
    let mv=false;if(a.tgt){const dx=a.tgt.x-a.x,dz=a.tgt.z-a.z,d=Math.hypot(dx,dz),sp=a.tgt.v;
      if(d<=sp*dt||d<.02){a.x=a.tgt.x;a.z=a.tgt.z;const r=a.tgt.res;a.tgt=null;a.v=0;r&&r()}else{a.x+=dx/d*sp*dt;a.z+=dz/d*sp*dt;a.v=sp;mv=true;a.ryT=Math.atan2(dx,dz)}}
    else a.v=0;
    if(a.naar){const nx=typeof a.naar==='function'?a.naar():a.naar;if(nx)a.ryT=Math.atan2(nx.x-a.x,nx.z-a.z)}
    if(a.ryT!=null){let d=a.ryT-a.ry;d=Math.atan2(sin(d),cos(d));a.ry+=d*Math.min(1,dt*(mv?10:6))}
    const run=a.v>6,sp=Math.min(1,a.v/4.2);a.ph+=dt*a.v*1.25;
    const T=a.T;for(const k in T)T[k]=0;T.sy=1;
    if(mv&&a.anim!=='carry'||(mv&&a.anim==='carry')){const sw=sin(a.ph)*(run?.95:.75)*Math.max(.35,sp);T.lL=sw;T.lR=-sw;T.aL=-sw*(run?1.2:.8);T.aR=sw*(run?1.2:.8);T.zL=run?-.12:-.03;T.zR=run?.12:.03;T.tx=run?.2:.05;T.ty=sin(a.ph)*(run?.16:.07);T.y=abs(cos(a.ph))*(run?.1:.06);T.hx=run?-.1:0}
    const f=POSE[a.anim]||POSE.idle;if(!mv||a.anim==='carry'){if(!mv)f(T,tt,a,mv);else{T.aL=T.aR=-1.18;T.zL=.2;T.zR=-.2;T.tx=-.05}}
    if(a.kijk!=null&&!mv)T.hy=a.kijk;
    const k=Math.min(1,dt*(mv?30:a.snel||12)),kh=Math.min(1,dt*7),c=a.cur,P=a.P;
    for(const n in c){const tv=T[n]==null?0:T[n];c[n]+=(tv-c[n])*(n==='hy'||n==='hx'?kh:k)}
    a.g.position.set(a.x,a.y||0,a.z);a.g.rotation.y=a.ry;a.g.scale.set(a.schaal,a.schaal*c.sy,a.schaal);
    P.root.position.y=c.y;P.legL.rotation.x=c.lL;P.legR.rotation.x=c.lR;P.armL.rotation.set(c.aL,0,c.zL);P.armR.rotation.set(c.aR,0,c.zR);P.torso.rotation.set(c.tx,c.ty,c.tz);P.head.rotation.set(c.hx,c.hy,0);
    a.blink-=dt;if(a.blink<=0){a.blinkOn=.12;a.blink=1.8+Math.random()*3.6}const bs=a.blinkOn>0?.12:1;if(a.blinkOn>0)a.blinkOn-=dt;if(P.eyeL)P.eyeL.scale.y=bs;if(P.eyeR)P.eyeR.scale.y=bs;
    if(a.tick)try{a.tick(dt,a)}catch(e){}})}
// een poppetje: spec (look) of id uit de cast
CUT.persoon=function(wie,o){o=o||{};const id=typeof wie==='string'?wie:null,spec=id?(CUT.look(id)||CUT.figurant()):(wie||CUT.figurant());
  const r=bouw(spec,o),a={id,g:r.g,P:r.P,x:o.x||0,z:o.z||0,y:o.y||0,ry:o.ry||0,ryT:null,ph:Math.random()*6,v:0,anim:o.anim||'idle',sitY:o.sitY,seed:Math.random()*10,blink:Math.random()*3,blinkOn:0,
    schaal:(o.schaal||(id&&A[id]&&A[id].schaal)||1),cur:{lL:0,lR:0,aL:0,aR:0,zL:0,zR:0,tx:0,ty:0,tz:0,hx:0,hy:0,y:0,sy:1},T:{},tgt:null,lookY:0,kijk:null,naar:null,tick:o.tick||null,onPuff:o.onPuff||null};
  a.g.traverse(m=>{if(m.isMesh)m.castShadow=true});
  (o.parent||G.scene()).add(a.g);PERS.add(a);
  a.zet=(x,z,ry)=>{a.x=x;a.z=z;if(ry!=null){a.ry=ry;a.ryT=ry}a.tgt=null;return a};
  a.doe=(an,opt)=>{a.anim=an||'idle';if(opt&&opt.sitY!=null)a.sitY=opt.sitY;return a};
  a.loop=(x,z,opt)=>{opt=opt||{};return new Promise(res=>{const d=Math.hypot(x-a.x,z-a.z);const v=opt.t?Math.max(.3,d/opt.t):(opt.run?8.5:opt.v||3.6);a.tgt={x,z,v,res};if(opt.anim)a.anim=opt.anim;else if(a.anim==='sit'||a.anim==='laag')a.anim='idle'})};
  a.draai=(ry)=>{a.ryT=ry;return a};
  a.kijkNaar=p=>{a.naar=p?(typeof p==='string'?()=>{const q=acteur(p)||(p==='luca'?G.P:null);return q}:{x:p[0]!=null?p[0]:p.x,z:p[1]!=null?p[1]:p.z}):null;return a};
  a.prop=function(k){if(a._prop){a._prop.parent&&a._prop.parent.remove(a._prop);a._prop=null}if(k&&PROP[k]){a._prop=PROP[k]();a.P.hand.add(a._prop)}return a};
  a.dozen=function(n){if(a._doos){a._doos.parent&&a._doos.parent.remove(a._doos);a._doos=null}n=n|0;if(n>0){const g=new TH.Group();const two=n>2;const L=stapel(two?Math.ceil(n/2):n);
      if(two){const R=stapel(Math.floor(n/2));L.position.set(-.36,0,0);R.position.set(.36,0,0);g.add(L,R)}else g.add(L);g.position.set(0,.18,.62);g.scale.setScalar(1/1.18);a.P.torso.add(g);a._doos=g;a.anim='carry'}else if(a.anim==='carry')a.anim='idle';return a};
  a.weg=()=>{PERS.delete(a);a.g.parent&&a.g.parent.remove(a.g)};
  if(o.prop)a.prop(o.prop);if(o.dozen)a.dozen(o.dozen);if(o.kijk!=null)a.kijk=o.kijk;
  return a};
CUT.personen=PERS;
const hook=setInterval(()=>{if(!G.ready)return;clearInterval(hook);const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);try{step(dt);cutFrame(dt)}catch(e){console.error(e)}}},120);

/* =================== acteurs in een scène =================== */
const ACT={};   // id → poppetje
function acteur(id){return ACT[id]||null}
CUT.acteur=acteur;
CUT.zet=function(id,x,z,ry,o){o=o||{};let a=ACT[id];if(!a){a=CUT.persoon(o.look||id,Object.assign({},o,{x,z,ry}));a.id=id;ACT[id]=a}else a.zet(x,z,ry);if(o.anim)a.doe(o.anim,o);a.blijf=!!o.blijf;if(o.y!=null)a.y=o.y;return a};
// een bestaand poppetje (bv. een figurant uit een interieur, G.binnen.extra) als acteur in scènes gebruiken
CUT.neem=function(id,a){if(!a)return null;a.id=id;a.blijf=true;ACT[id]=a;return a};
CUT.weg=function(id){const a=ACT[id];if(a){a.weg();delete ACT[id]}};
CUT.allesWeg=function(alles){for(const id in ACT){if(alles||!ACT[id].blijf)CUT.weg(id)}};

/* =================== UI: balken, ondertitels, overslaan, droom =================== */
const ui=document.createElement('div');ui.id='svCut';ui.hidden=true;
ui.innerHTML=`<i class="sv-cb t"></i><i class="sv-cb b"></i><div class="sv-fade" id="svFade"></div><div class="sv-droom" id="svDroom"></div>
 <div class="sv-titel" id="svTitel" hidden><small></small><b></b></div>
 <div class="sv-sub" id="svSub" hidden><canvas id="svSubPor" width="48" height="48"></canvas><div><b id="svSubN"></b><p id="svSubT"></p><div class="sv-sub-k" id="svSubK"></div></div></div>
 <button class="sv-skip" id="svSkip">${touch?'Overslaan':'Overslaan <kbd>Esc</kbd>'} ›</button><i class="sv-hold" id="svHold"></i>`;
document.body.appendChild(ui);
let active=false,skip=false,advance=null,tw=null,keuzeOpen=null,droom=false;
CUT.active=()=>active;
CUT.hq={pix:560,portret:112,schaduw:true};CUT.onStart=[];CUT.onEnd=[];
function setPor(id,mood){const c=$s('svSubPor');const sz=(CUT.hq&&CUT.hq.portret)||112;c.style.width=c.style.height=sz+'px';if(!id){c.hidden=true;return}c.hidden=false;
  try{if(CUT.portret)return CUT.portret(id,mood,c);K.face(Object.assign({bg:'#14101a'},CUT.face(id)),mood||null,c)}catch(e){}}
function nm(id){if(id==='luca')return 'Luca';const a=A[id];return a?a.n:(id||'')}
// tik = verder (eerst de tekst afmaken), Esc of lang drukken = overslaan
function tap(){if(keuzeOpen)return;if(tw&&!tw.done){tw.skip();return}if(advance){const f=advance;advance=null;f()}}
let holdT=0,holdS=0;
ui.addEventListener('pointerdown',e=>{if(e.target.closest('#svSkip,.sv-sub-k'))return;holdS=performance.now();clearTimeout(holdT);$s('svHold').classList.add('on');holdT=setTimeout(()=>{$s('svHold').classList.remove('on');doSkip()},800)});
ui.addEventListener('pointerup',e=>{clearTimeout(holdT);$s('svHold').classList.remove('on');if(e.target.closest('#svSkip,.sv-sub-k'))return;if(performance.now()-holdS<600)tap()});
ui.addEventListener('pointercancel',()=>{clearTimeout(holdT);$s('svHold').classList.remove('on')});
$s('svSkip').addEventListener('click',e=>{e.stopPropagation();doSkip()});
addEventListener('keydown',e=>{if(!active)return;const k=e.key.toLowerCase();const t=e.target;if(t&&/^(INPUT|TEXTAREA)$/.test(t.tagName))return;
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();doSkip();return}
  if(keuzeOpen){const n=keuzeOpen.length;if(['arrowdown','s','arrowup','w'].includes(k)){e.preventDefault();e.stopImmediatePropagation();keuzeOpen.sel=(keuzeOpen.sel+(k==='arrowdown'||k==='s'?1:-1)+n)%n;drawK();return}
    if(k==='e'||k===' '||k==='enter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)keuzeOpen.pick(keuzeOpen.sel);return}}
  if(k==='e'||k===' '||k==='enter'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)tap();return}
  // geen telefoon, kaart, camera of lopen tijdens een cutscène
  if(['j','m','v','f','t','w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.stopImmediatePropagation();if(k.startsWith('arrow'))e.preventDefault()}},true);
function doSkip(){if(!active||keuzeOpen)return;skip=true;if(tw)tw.skip();if(advance){const f=advance;advance=null;f()}WAITS.forEach(f=>f());WAITS.clear();G.snd&&G.snd.fx('tab')}
const WAITS=new Set();
function wacht(s){return new Promise(res=>{if(skip||!(s>0)){res();return}const t=setTimeout(()=>{WAITS.delete(f);res()},s*1000);const f=()=>{clearTimeout(t);res()};WAITS.add(f)})}
CUT.wacht=wacht;
function fadeTo(v,t){const f=$s('svFade');f.style.transition=skip?'none':`opacity ${t||.6}s`;f.style.opacity=v;return wacht(skip?0:(t||.6))}
CUT.fade=(dir,t)=>{const f=$s('svFade');if(!active)ui.hidden=false;return fadeTo(dir==='out'?1:0,t)};
function setDroom(on){droom=!!on;$s('svDroom').classList.toggle('on',droom);G.canvas&&(G.canvas.style.filter=droom?'saturate(1.45) contrast(.92) brightness(1.08) sepia(.18) hue-rotate(-8deg)':'');
  try{const u=G.post.material.uniforms;if(droom){u.uVig.value=.85}else G.applyLight&&G.applyLight()}catch(e){}}
CUT.droom=setDroom;

/* =================== camera =================== */
let CAM=null;const v1=new TH.Vector3(),v2=new TH.Vector3();
const arr=(p,d)=>p?new TH.Vector3(p[0],p[1],p[2]):d;
function camSet(c){if(c==null){CAM=null;return 0}const cam=G.camera();
  if(c.volg){CAM={volg:c.volg,af:c.af||[0,2.2,4.5],kijk:c.kijk||[0,1.4,0],fov:c.fov||null,pos:cam.position.clone(),look:null};return 0}
  const from={pos:arr(c.pos,cam.position.clone()),look:arr(c.look,null)};if(!from.look){cam.getWorldDirection(v1);from.look=cam.position.clone().add(v1.multiplyScalar(10))}
  const to=c.to?{pos:arr(c.to.pos,from.pos.clone()),look:arr(c.to.look,from.look.clone())}:null;
  CAM={from,to,t:c.t||0,e:0,fov:c.fov||null,fov2:c.to&&c.to.fov||null,shake:c.shake||0};if(skip&&to)CAM.e=CAM.t;
  return to&&c.wacht!==false?CAM.t:0}
// eigen camerarig: G.binnen roept dit als eerste aan (ook buiten interieurs)
CUT.rig=function(dt,cam){if(!active||!CAM)return false;let p,l;
  if(CAM.volg){const a=acteur(CAM.volg)||(CAM.volg==='luca'?{x:G.P.x,z:G.P.z,ry:G.P.ry,y:0}:null);if(!a)return false;const s=sin(a.ry),c=cos(a.ry),o=CAM.af,k=CAM.kijk;
    v1.set(a.x+s*o[2]+c*o[0],(a.y||0)+o[1],a.z+c*o[2]-s*o[0]);CAM.pos.lerp(v1,Math.min(1,dt*4));p=CAM.pos;v2.set(a.x+s*k[2]+c*k[0],(a.y||0)+k[1],a.z+c*k[2]-s*k[0]);l=v2}
  else{CAM.e=Math.min(CAM.t,CAM.e+dt);const k=CAM.to&&CAM.t>0?ease(CAM.e/CAM.t):(CAM.to?1:0);p=v1.copy(CAM.from.pos);l=v2.copy(CAM.from.look);if(CAM.to){p.lerp(CAM.to.pos,k);l.lerp(CAM.to.look,k)}}
  cam.position.copy(p);if(CAM.shake){cam.position.x+=(Math.random()-.5)*CAM.shake;cam.position.y+=(Math.random()-.5)*CAM.shake}cam.lookAt(l);
  const asp=innerWidth/innerHeight,f0=CAM.fov||(asp<1?62:42);let f=f0;if(CAM.fov2&&CAM.t>0)f=f0+(CAM.fov2-f0)*ease(CAM.e/CAM.t);if(Math.abs(cam.fov-f)>.01){cam.fov=f;cam.updateProjectionMatrix()}
  G.shadowC={x:l.x,z:l.z};return true};
// zonder eigen binnen-rig (geen stad-binnen.js): zelf aanhaken
setTimeout(function hk(){if(!G.ready||!G.camRig){setTimeout(hk,200);return}if(G.binnen&&G.binnen.rigHooked)return;const r0=G.camRig;G.camRig=(dt,cam)=>CUT.rig(dt,cam)||r0(dt,cam);CUT._own=1},900);

/* =================== afspelen =================== */
let running=null,spelerVerborgen=false,pixWas=null;
function cutFrame(dt){if(!active)return;G.frozen=Math.max(G.frozen||0,.2);G.stopPath&&G.stopPath();
  // Luca als acteur: dan het echte poppetje verbergen
  G.spelerWeg=!!(spelerVerborgen||ACT.luca);const av=G.avatarObj&&G.avatarObj();if(av&&G.spelerWeg)av.visible=false}
async function stap(s){if(!s)return;
  if(s.par){await Promise.all(s.par.map(stap));return}
  if(s.cam!==undefined){const t=camSet(s.cam);if(t)await wacht(t);return}
  if(s.actor){const at=s.at||[0,0];const a=CUT.zet(s.actor,at[0],at[1],s.ry!=null?s.ry:0,s);if(s.prop)a.prop(s.prop);if(s.dozen!=null)a.dozen(s.dozen);if(s.naar)a.kijkNaar(s.naar);if(s.kijk!=null)a.kijk=s.kijk;return}
  if(s.move){const a=acteur(s.move);if(!a)return;const to=s.to||[a.x,a.z];if(skip){a.zet(to[0],to[1]);if(s.anim&&s.anim!=='walk'&&s.anim!=='run')a.doe(s.anim);return}
    const pr=a.loop(to[0],to[1],{t:s.t,run:s.anim==='run',anim:s.anim==='carry'?'carry':(s.na||null)});if(s.wacht===false)return;await Promise.race([pr,new Promise(r=>WAITS.add(r))]);if(skip)a.zet(to[0],to[1]);if(s.na)a.doe(s.na);return}
  if(s.anim){const a=acteur(s.anim);if(!a)return;if(s.a)a.doe(s.a,s);if(s.ry!=null)a.draai(s.ry);if(s.naar!==undefined)a.kijkNaar(s.naar);if(s.prop!==undefined)a.prop(s.prop);if(s.dozen!=null)a.dozen(s.dozen);if(s.t)await wacht(s.t);return}
  if(s.say!==undefined){await zeg(s.say,s.text,s);return}
  if(s.keuze){await keuze(s);return}
  if(s.fade){await fadeTo(s.fade==='out'?1:0,s.t);return}
  if(s.wait!=null){await wacht(s.wait);return}
  if(s.snd){G.snd&&G.snd.fx(s.snd);return}
  if(s.dream!==undefined){setDroom(s.dream);return}
  if(s.titel){const el=$s('svTitel');el.querySelector('small').textContent=s.sub?s.titel:'';el.querySelector('b').textContent=s.sub||s.titel;el.hidden=false;el.classList.remove('go');void el.offsetWidth;el.classList.add('go');await wacht(s.t||3);el.hidden=true;return}
  if(s.speler!==undefined){if(s.speler===false){spelerVerborgen=true}else{spelerVerborgen=false;if(Array.isArray(s.speler)){G.P.x=s.speler[0];G.P.z=s.speler[1];if(s.speler[2]!=null)G.P.ry=s.speler[2];G.P.vx=G.P.vz=0}}return}
  if(s.weg){CUT.weg(s.weg);return}
  if(s.binnen){if(G.binnen)await G.binnen.in(s.binnen,{fade:false});return}
  if(s.buiten){if(G.binnen)await G.binnen.uit({fade:false});return}
  if(s.fn){try{await s.fn()}catch(e){console.error(e)}return}}
function zeg(id,text,s){if(skip)return Promise.resolve();const sub=$s('svSub');sub.hidden=false;sub.classList.toggle('n',!id);sub.style.setProperty('--c',(A[id]&&A[id].col)||(id==='luca'?'#ff4fd8':'#e8e4da'));
  $s('svSubN').textContent=id?(s&&s.naam)||nm(id):'';setPor(id,s&&s.mood);$s('svSubK').innerHTML='';
  const a=acteur(id);if(a&&s&&s.praat!==false&&a.anim==='idle'){a.doe('talk');setTimeout(()=>{if(a.anim==='talk')a.doe('idle')},Math.max(1200,(text||'').length*55))}
  tw=K.type($s('svSubT'),text||'',{blip:true});
  const dur=s&&s.t?s.t:Math.max(1.6,1.0+(text||'').length*.06);
  return new Promise(res=>{let done=false;const fin=()=>{if(done)return;done=true;advance=null;WAITS.delete(fin);clearTimeout(tm);res()};
    const tm=setTimeout(()=>{if(tw&&!tw.done){tw.then(()=>setTimeout(fin,900))}else fin()},(dur+(s&&s.wacht?999:0))*1000);
    advance=fin;WAITS.add(fin)})}
function drawK(){const k=keuzeOpen;if(!k)return;$s('svSubK').innerHTML=k.map((c,i)=>`<button class="${i===k.sel?'on':''}" data-i="${i}">${E(c.t)}${c.sub?`<small>${E(c.sub)}</small>`:''}</button>`).join('')}
function keuze(s){skip=false;const sub=$s('svSub');sub.hidden=false;const id=s.wie||null;sub.classList.toggle('n',!id);$s('svSubN').textContent=id?nm(id):'';setPor(id,s.mood);
  tw=K.type($s('svSubT'),s.text||'');const opts=s.keuze.slice();opts.sel=0;
  return new Promise(res=>{opts.pick=async i=>{const c=opts[i];if(!c)return;keuzeOpen=null;$s('svSubK').innerHTML='';G.snd&&G.snd.fx('click');CUT.laatste=c.id!=null?c.id:i;try{if(c.f)await c.f()}catch(e){console.error(e)}res(CUT.laatste)};
    keuzeOpen=opts;const show=()=>{drawK()};if(tw)tw.then(show);else show();
    $s('svSubK').onclick=e=>{const b=e.target.closest('[data-i]');if(b&&keuzeOpen)keuzeOpen.pick(+b.dataset.i)}})}
// het hele script
CUT.play=async function(script,o){o=o||{};while(running)await running;let rel;running=new Promise(r=>rel=r);
  active=true;skip=false;spelerVerborgen=!!o.zonderSpeler;ui.hidden=false;document.body.classList.add('sv-incut');G.talking=true;G.story&&G.story.klokPauze&&G.story.klokPauze(true);
  if(G.kit.dialogOpen&&G.kit.dialogOpen())G.kit.closeDialog(true);if(G.phone&&G.phone.isOpen&&G.phone.isOpen())G.phone.close();
  const hq=Object.assign({},CUT.hq,o.hq||{});if(hq.pix){pixWas=G.pixPref;G.pixPref=hq.pix;G.resize&&G.resize()}
  CUT.onStart.forEach(f=>{try{f(o)}catch(e){}});
  requestAnimationFrame(()=>ui.classList.add('on'));
  try{for(const s of script){await stap(s)}}catch(e){console.error(e)}
  // afronden
  $s('svSub').hidden=true;$s('svTitel').hidden=true;keuzeOpen=null;advance=null;
  if(!o.blijfZwart)await fadeTo(0,.01);
  if(!o.blijf)CUT.allesWeg(false);CAM=null;setDroom(false);spelerVerborgen=false;
  ui.classList.remove('on');active=false;skip=false;ui.hidden=!o.blijfZwart;document.body.classList.remove('sv-incut');G.talking=false;G.frozen=0;G.story&&G.story.klokPauze&&G.story.klokPauze(false);
  if(hq.pix){G.pixPref=pixWas;G.resize&&G.resize()}
  G.spelerWeg=false;const av=G.avatarObj&&G.avatarObj();if(av)av.visible=true;
  CUT.onEnd.forEach(f=>{try{f(o)}catch(e){}});
  // de camera van het spel weer achter Luca
  try{const c=G.camera();c.fov=G.fov0||c.fov;c.updateProjectionMatrix()}catch(e){}
  rel();running=null;return CUT.laatste};
// los zinnetje zonder cutscène (ondertitel onderin, de wereld loopt door)
CUT.zeg=async function(id,text,o){o=o||{};const was=active;if(!was){ui.hidden=false;ui.classList.add('los')}const r=await zeg(id,text,Object.assign({t:o.t||Math.max(2.2,text.length*.065)},o));$s('svSub').hidden=true;if(!was&&!active){ui.hidden=true;ui.classList.remove('los')}return r};
})();
