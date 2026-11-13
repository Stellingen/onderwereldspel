// Verhaal: voorbijgangers van dichtbij net zo gedetailleerd als in de cutscènes (G.verhaalNpc).
// De stad tekent mensen als snelle blokjes (stad-gfx.js, instanced). Wie dichter dan ~22 m bij je (of bij de camera) loopt,
// krijgt hier hetzelfde poppetje als in de cutscènes (gezicht, kleding, haar, pet), met dezelfde kleuren als de blokjesversie,
// zodat spel en cutscène niet van elkaar verschillen. Hooguit MAX tegelijk; bouwen gaat één per keer, zodat het niet hapert.
(function(){
'use strict';
const G=window.STAD;if(!G)return;
const R_IN=22,R_UIT=27,MAX=12;
const LIJST=new Map();   // npc → poppetje
let C=null,bouwT=0;
// een vast getal per voorbijganger (zelfde haar, ogen en stemming elke keer dat je hem tegenkomt)
function zaad(n){if(n._zaad==null){n._zaad=Math.floor(Math.random()*1e6)}return n._zaad}
const kies=(a,z,k)=>a[(z>>>(k||0))%a.length];
const KIND={zakenman:'suit',agent:'jacket',jogger:'track',rivaal:'track',student:'hoodie',oma:'jacket',zwerver:'jacket',muzikant:'jacket',heler:'track',barista:'tee',snack:'tee',toerist:'tee'};
function spec(n){const L=n.look||{},z=zaad(n),arch=n.arch||'burger';const vrouw=!!L.long||(z%5===0&&arch!=='zakenman'&&arch!=='agent');
  const hs=L.hat==='bald'?'kaal':L.long?kies(['lang','knot','lang'],z,3):vrouw?kies(['lang','knot','krul','afro'],z,3):kies(['kort','kuif','opgeschoren','krul','kort','afro'],z,3);
  const kind=KIND[arch]||(L.arm&&L.arm===L.skin?'tee':kies(['hoodie','jacket','tee','track'],z,5));
  const hoofd=L.hat==='cap'||L.hat==='pet'||L.hat==='hat'?{kind:'cap',c:L.hatC||'#2a2c30'}:L.hat==='beanie'?{kind:'beanie',c:L.hatC||'#2a2c30'}:L.hat==='mask'?{kind:'skimask',c:'#141416'}:{kind:'none'};
  return {skin:L.skin||'#c8956a',hair:L.hair||'#2a1d14',hs,fh:!vrouw&&L.beard?'baard':(!vrouw&&z%7===1?'stoppel':''),eye:kies(['#5a3a22','#24160e','#8a6a2a','#3d7a42','#3f6fb8'],z,7),
    mood:arch==='rivaal'?'boos':arch==='agent'?'koel':kies(['neutraal','blij','koel','neutraal'],z,9),mouth:vrouw?'vol':kies(['normaal','breed','smal'],z,11),
    top:{kind,c:L.top||'#3a4a6a',c2:(L.tie&&kind==='suit')?'#e8e4da':(G.kit&&G.kit.shade?G.kit.shade(L.top||'#3a4a6a',1.25):'#e8e4da')},
    legs:{kind:arch==='jogger'||arch==='rivaal'?'track':'jeans',c:L.pants||'#2c3a4d'},shoes:{kind:arch==='zakenman'||arch==='agent'||arch==='oma'?'boot':'sneaker',c:L.shoe||'#e8e4da',c2:'#2a2c30'},
    head:hoofd,nek:L.chain?'goud ketting':null,sun:L.glasses?'#0b0b0d':undefined}}
// wat doet de voorbijganger: lopen, zitten, bellen, zwaaien…
const ANIM={call:'bel',photo:'point',wave:'zwaai',shy:'bang',nod:'dag',play:'kaart',smoke:'rook',sit:'sit'};
function sync(n,a,dt){const px=a._px==null?n.x:a._px,pz=a._pz==null?n.z:a._pz,d=Math.hypot(n.x-px,n.z-pz),v=dt>0?d/dt:0;a._px=n.x;a._pz=n.z;
  a._v=(a._v||0)*.7+Math.min(9,v)*.3;a.x=n.x;a.z=n.z;
  const zit=(n.y||0)<-.2||n.st==='sit';
  if(zit){a.tgt=null;a.anim='sit';a.sitY=n.y||-.42;a.ryT=n.ry;return}
  if(a._v>.25){const s=Math.sin(n.ry),c=Math.cos(n.ry);a.anim=n.st==='flee'?'idle':'idle';a.tgt={x:n.x+s*.8,z:n.z+c*.8,v:Math.max(.6,a._v),res:null}}
  else{a.tgt=null;a.anim=ANIM[n.st]||'idle';a.ryT=n.ry}}
function weg(n){const a=LIJST.get(n);if(a){try{a.weg()}catch(e){}}LIJST.delete(n);n.verborgen=false}
function tick(dt){C=G.cut;if(!C||!C.persoon||!G.NPC)return;
  const P=G.P,cam=G.camera&&G.camera(),inCut=C.active&&C.active(),aan=!(G.verhaalInst&&G.verhaalInst.get&&G.verhaalInst.get('npcDetail')===false);
  const binnen=G.binnen&&G.binnen.waar&&G.binnen.waar();
  // wie komt in aanmerking: dichtbij de speler (of de camera in een cutscène), zichtbaar, niet binnen
  const kandidaten=[];
  if(aan&&!binnen)for(const n of G.NPC){if(n.dead||n.gone||n.hidden)continue;const dP=Math.hypot(n.x-P.x,n.z-P.z),dC=cam?Math.hypot(n.x-cam.position.x,n.z-cam.position.z):1e9,d=inCut?Math.min(dC,dP):dP;
    if(d<(LIJST.has(n)?R_UIT:R_IN))kandidaten.push([d,n])}
  kandidaten.sort((a,b)=>a[0]-b[0]);const wil=new Set(kandidaten.slice(0,MAX).map(k=>k[1]));
  for(const n of [...LIJST.keys()])if(!wil.has(n)||!G.NPC.includes(n))weg(n);
  const nu=performance.now();
  for(const n of wil){let a=LIJST.get(n);
    if(!a){if(nu-bouwT<60)continue;bouwT=nu;try{a=C.persoon(spec(n),{x:n.x,z:n.z,ry:n.ry,anim:'idle'});a.npc=1;LIJST.set(n,a)}catch(e){continue}}
    n.verborgen=true;sync(n,a,dt)}}
// vóór de stap van de cutscène-poppetjes (zo lopen ze met de juiste snelheid)
const iv=setInterval(()=>{if(!G.ready||!G.cut||!G.cut.persoon)return;clearInterval(iv);const f0=G.onFrame;G.onFrame=dt=>{try{tick(dt)}catch(e){}f0&&f0(dt)}},300);
G.verhaalNpc={aantal:()=>LIJST.size,allesWeg(){for(const n of [...LIJST.keys()])weg(n)}};
})();
