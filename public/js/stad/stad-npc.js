// Pixelstad: mensen op straat. Elke voorbijganger heeft een soort (toerist, zakenman, student, oma, zwerver, straatmuzikant,
// heler, agent, bendelid) met een eigen uiterlijk, eigen praatjes en eigen reacties. Loop naar iemand toe en druk op E (of tik):
// je praat, helpt, geeft een fooi, verkoopt spullen aan de heler of berooft iemand (met een wapen).
// Getuigen: zien mensen een misdaad, dan rennen ze weg, gillen of bellen 112 (je kunt de beller nog tegenhouden). Komt het
// gesprek door, dan stuurt de meldkamer politie (stad-police.js). Opbrengst van een straatroof zit op de schaal van de klussen van
// jouw rang (energie, wachttijd, buit: zie roofRef). Respect per wijk (S.stadRep) bepaalt hoe mensen op je reageren.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const los=(a,b)=>{const dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz),n=Math.ceil(L*2);for(let i=1;i<n;i++){const x=a.x+dx*i/n,z=a.z+dz*i/n;if(M.solid[(z|0)*M.W+(x|0)])return false}return true};
G.los=los;
const SK=['#e9b98f','#d9a27a','#b97a52','#8d5a3a','#f1caa5','#6e4630'];
/* ---------- soorten mensen ---------- */
const A={
 toerist:{n:'Toerist',col:'#3ad6ff',wallet:.7,tough:1,call:.35,v:[.9,1.3],look:()=>({top:pick(['#e8584a','#f0b23a','#3a8ad6','#ff7fb3','#3fe395']),arm:'skin',pants:pick(['#c9b48a','#e8e4da','#3a5a8a']),shoe:'#e8e4da',hat:Math.random()<.5?'cap':'none',hatC:pick(['#e8e4da','#c0261e','#2f5d9a'])}),
  names:['Hans uit Keulen','Emma uit Leeds','Kenji uit Osaka','Lucía uit Madrid','Mike uit Ohio','Ingrid uit Oslo','Paolo uit Milaan'],
  talk:['Excuse me, waar is de Dam? Ik loop al een uur rondjes.','Wat een mooie stad! Alleen die fietsers, pff.','Is dit de rosse buurt? Nee? Jammer.','Ik ben mijn groep kwijt. Heb jij een gele paraplu gezien?','Iedereen spreekt hier Engels, handig hoor.']},
 zakenman:{n:'Zakenman',col:'#c9a227',wallet:1.3,tough:2,call:.7,v:[1.3,1.7],look:()=>({top:pick(['#1f2430','#2a2c30','#3a3d42','#2f3a52']),arm:'top',pants:'same',shoe:'#0e0f12',hat:'none',hair:pick(['#151517','#4a2e1a','#8a8c90']),tie:pick(['#7a1f2a','#2f5d9a','#c9a227']),glasses:Math.random()<.35}),
  names:['Meneer De Wit','Meneer Bakker','Mevrouw Smit','Meneer Jansen','Mevrouw Visser'],
  talk:['Geen tijd, ik heb om twee uur een call.','Weet je wat mijn uurtarief is? Dan weet je dat dit gesprek duur is.','Die beurs, man. Rood, rood, rood.','Mijn secretaresse regelt mijn afspraken. Bel haar.']},
 student:{n:'Student',col:'#b8a1ff',wallet:.3,tough:3,call:.5,v:[1.1,1.6],look:()=>({top:pick(['#5a3a7a','#2f6a8a','#7a2f2a','#3c8a4a','#2a2c30']),arm:'top',pants:'#2c3a4d',shoe:pick(['#e8e4da','#2a2c30']),hat:Math.random()<.4?'beanie':'none',hatC:pick(['#2a2c30','#c0261e','#d6a63e'])}),
  names:['Daan','Sanne','Mo','Lotte','Youssef','Fleur','Bram'],
  talk:['Ik heb morgen een tentamen en ik heb nog niks gedaan.','Weet jij waar je hier goedkoop kunt eten?','Mijn fiets is alweer gejat. Derde deze maand.','Huur in deze stad, joh. Ik woon in een kast.']},
 oma:{n:'Oma',col:'#ff9ac2',wallet:.5,tough:0,call:.3,scream:1,v:[.55,.75],look:()=>({top:pick(['#7a5a8a','#4a6a5a','#8a4a4a','#5a6a8a']),arm:'top',pants:'#5a5a62',shoe:'#3a2a20',hat:'none',hair:'#d8d4cc',long:1}),
  names:['Oma Truus','Oma Riek','Oma Joke','Oma Bep','Oma Fien'],
  talk:['Vroeger was hier een bakker. Nu een telefoonwinkel.','Jongen, wat ben je groot geworden. Ken ik jou?','Mijn kleinzoon zit ook in de... handel. Zegt hij.','Heb je wel genoeg gegeten? Je ziet zo bleek.']},
 zwerver:{n:'Zwerver',col:'#9aa1ab',wallet:0,tough:1,call:0,fixed:'sit',look:()=>({top:'#4a4a3a',arm:'top',pants:'#3a3a30',shoe:'#2a2420',hat:Math.random()<.6?'beanie':'none',hatC:'#5a4a3a',hair:'#4a3a2a',beard:1}),
  names:['Ome Kees','Gekke Gerrit','Sjonnie','Lange Lies'],
  talk:['Heb je een euro? Of twee? Twee is beter.','Ik zie alles, hè. Niemand ziet mij, maar ik zie alles.','Vroeger had ik een zaak. Nu heb ik een steeg.','Die agenten lopen hier elke ochtend rond. Elke ochtend.']},
 muzikant:{n:'Straatmuzikant',col:'#ffd35a',wallet:.4,tough:1,call:.2,fixed:'play',look:()=>({top:'#c28a2a',arm:'top',pants:'#3a3c40',shoe:'#5a3a24',hat:'hat',hatC:'#3a2a1a',hair:'#3a2a1a',beard:1}),
  names:['Sjaak met de gitaar'],talk:['Dit nummer heb ik zelf geschreven. Over de gracht.','Een verzoeknummer? Kost een tientje.','Ik speel hier al twintig jaar. De stad verandert, ik niet.']},
 heler:{n:'Heler',col:'#ff7a1a',wallet:0,tough:5,call:0,fixed:'stand',look:()=>({top:'#1d1d1f',arm:'top',pants:'#1d1d1f',shoe:'#e8e4da',hat:'cap',hatC:'#e8e4da',hair:'#151517',chain:1}),
  names:['Ome Henk','Rooie Ron'],talk:['Ik koop alles. Telefoons, horloges, sieraden. Vragen stel ik niet.','Jij ziet eruit als iemand met spullen in z\'n zakken.','Hou je ogen open. De wouten rijden hier rond.']},
 agent:{n:'Agent',col:'#4d7dff',wallet:0,tough:9,call:1,cop:1,v:[1.0,1.3],look:()=>({top:'#1d2a4a',arm:'top',pants:'#151c30',shoe:'#0e0f12',hat:'cap',hatC:'#1d2a4a',hair:'#2a1d14'}),
  names:['Agent Bakker','Agent De Groot','Agent Yilmaz','Agent Mulder'],talk:['Doorlopen, meneer.','Alles goed hier?','Heeft u iets gezien? Nee? Mooi.','Fijne dag verder.']},
 rivaal:{n:'Bendelid',col:'#ff3d52',wallet:.8,tough:6,call:0,fight:1,v:[1.1,1.4],look:()=>({top:'#8a1f2a',arm:'top',pants:'#151517',shoe:'#151517',hat:Math.random()<.5?'beanie':'none',hatC:'#151517',chain:1}),
  names:['Dennis','Kevin','Ricardo','Jamal','Bas'],talk:['Wat moet je? Dit is onze straat.','Zoek je problemen? Die kun je krijgen.','Ik ken jou. Jij bent die nieuwe.']},
 jogger:{n:'Hardloper',col:'#7fd1c7',wallet:.15,tough:3,call:.4,v:[3.1,3.8],run:1,look:()=>({top:pick(['#ff4fd8','#3ad6ff','#f2c230','#3fe395','#ff7a1a']),arm:'skin',pants:'#1d2531',shoe:'#e8e4da',hat:Math.random()<.3?'cap':'none',hatC:'#e8e4da'}),
  names:['Tim','Eva','Karim','Noor','Jeroen'],talk:['Geen tijd, ik zit in mijn schema.','Nog vier kilometer. Hijg.','Morgen de halve marathon.','Je moet ook eens gaan lopen, man.']},
 barista:{n:'Koffiekar',col:'#ffad6b',wallet:0,tough:2,call:.6,fixed:'stand',look:()=>({top:'#f1efe9',arm:'top',pants:'#2a2c30',shoe:'#2a2c30',hat:'beanie',hatC:'#7a4a2c',hair:'#2a1d14',beard:1}),
  names:['Luigi'],talk:['Vers gebrand, vanochtend nog.','Een espresso lost alles op. Bijna alles.','Suiker? Nee. Zo hoort het.']},
 snack:{n:'Snackkar',col:'#ffd166',wallet:0,tough:4,call:.5,fixed:'stand',look:()=>({top:'#c0261e',arm:'top',pants:'#1d1d1f',shoe:'#2a2c30',hat:'cap',hatC:'#f1efe9',hair:'#151517'}),
  names:['Ali van de shoarma'],talk:['Extra knoflook? Altijd extra knoflook.','Ik sta hier tot diep in de nacht.','Mijn saus is geheim. Familierecept.']},
 visboer:{n:'Visboer',col:'#7fb8d6',wallet:0,tough:4,call:.4,fixed:'stand',look:()=>({top:'#2f6a8a',arm:'top',pants:'#e8e4da',shoe:'#5a3a24',hat:'cap',hatC:'#1f3a5a',hair:'#8a8c90',beard:1}),
  names:['Ouwe Jaap'],talk:['De beste stek? Bij de brug, als het schemert.','Paling bijt alleen in het donker.','In het havenkanaal zit zeebaars. Grote.','Met regen bijt de vis beter. Echt waar.']},
 dobbelaar:{n:'Dobbelaar',col:'#b8a1ff',wallet:0,tough:5,call:0,fixed:'stand',look:()=>({top:'#3a2a4a',arm:'top',pants:'#1d1d1f',shoe:'#151517',hat:'hat',hatC:'#1d1d1f',hair:'#151517',chain:1}),
  names:['Snelle Eddy'],talk:['Twee stenen, hoogste wint. Simpeler wordt het niet.','Het geluk is met de dommen. Kom maar op.','Ik speel eerlijk. Meestal.']},
 racer:{n:'Straatracer',col:'#ff7a1a',wallet:0,tough:5,call:0,fixed:'stand',look:()=>({top:'#ff7a1a',arm:'top',pants:'#1d1d1f',shoe:'#e8e4da',hat:'cap',hatC:'#1d1d1f',hair:'#151517'}),
  names:['Rico'],talk:['Kom met een auto, dan praten we.','Mijn rondje centrum staat nog steeds.','Goud haal je alleen met een echte bak.']},
 burger:{n:'Voorbijganger',col:'#a9dcff',wallet:.6,tough:2,call:.45,look:null,names:['Peter','Linda','Ahmed','Marieke','Joost','Fatima','Rik'],
  talk:['Druk vandaag, hè?','Pas op je tas hier, hoor.','Heb je dat nieuws gezien? Weer een overval.','Mooi weer voor de tijd van het jaar.']}};
const TIPS=['Langs de gracht, op de kades in het noorden en op het strand kun je vissen. De visboer op de boulevard koopt alles.','Zwaai eens naar iemand (T). Mensen zwaaien terug.','Snelle Eddy dobbelt op de kade in de haven. Hij wint niet altijd.','Heb je respect in een wijk, dan kun je de wijkbaas uitdagen.','Rico zoekt racers bij het plein. Kom met een auto.','In het Noorderpark loopt een zwerfhond rond. Hij zoekt een baas.','Met een bivakmuts op herkent niemand je. Getuigen bellen dan minder snel.','In de stegen tussen de panden kun je je verstoppen achter een container.','\'s Nachts zien minder mensen wat je doet.','De heler bij Het Contact koopt alles wat je op straat vindt.','Bij Notaris De Sleutel koop je grond in Oostland en op Het Eiland, en panden voor je zaken.','Wie de politie belt, kun je nog tegenhouden. Als je snel bent.','Politieauto\'s kunnen niet door de stegen.','Hoe meer respect je in een wijk hebt, hoe minder mensen er de politie bellen.'];
// welke soorten waar (en wanneer) lopen
function archFor(x,z){const d=M.districtAt(x,z),night=G.night>.55,W={burger:3,toerist:1,student:1,oma:.6,zakenman:.4,rivaal:.15,agent:.25,jogger:.2};
  if(/Noorderpark|Villapark|Westkust|Boulevard|Strand|Gracht|Eiland/.test(d))W.jogger=1.6;if(G.rain)W.jogger*=.3;
  if(/Plein|Centrum|Gracht/.test(d)){W.toerist=3.5;W.zakenman=.8}
  if(/Zuidas/.test(d)){W.zakenman=4;W.toerist=.6;W.student=.5}
  if(/Westbuurt|Westkust/.test(d)){W.student=2.5;W.oma=1.5;W.rivaal=.7}
  if(/Haven|Bajes|Noordkade|IJ-oever|Bedrijventerrein/.test(d)){W.rivaal=1.2;W.toerist=.2;W.oma=.2}
  if(/IJ-oever|Bedrijventerrein/.test(d))W.zakenman=1.4;
  if(/Strand|Boulevard/.test(d)){W.toerist=3;W.student=1.5}
  if(/Oosterstraat/.test(d)){W.student=2.2;W.toerist=1.6;W.rivaal=.6;W.oma=.3}
  if(/Eiland/.test(d)){W.zakenman=2;W.oma=.8;W.toerist=.3;W.student=.2;W.rivaal=.3}
  if(M.estateAt(x,z)){W.zakenman=1.2;W.oma=1;W.rivaal=0;W.toerist=.4}
  if(night){W.oma*=.2;W.toerist*=.6;W.zakenman*=.5;W.rivaal*=2.2;W.student*=1.4;W.jogger*=.3}
  if(G.wijkOwn&&G.wijkOwn(x,z))W.rivaal*=.25;
  const tot=Object.values(W).reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(const k in W){r-=W[k];if(r<=0)return k}return 'burger'}
function lookFor(arch,base){const a=A[arch];if(!a.look)return base;const L=a.look(),sk=pick(SK);
  return Object.assign({skin:sk,hair:L.hair||pick(['#2a1d14','#151517','#4a2e1a','#8a6a3a']),hat:'none'},L,{arm:L.arm==='skin'?sk:L.arm==='top'?L.top:L.arm,pants:L.pants==='same'?L.top:L.pants})}
G.npcInit=function(n){if(n.arch)return;const a=archFor(n.x,n.z);n.arch=a;n.look=lookFor(a,n.look);const sp=A[a].v;if(sp)n.v=rr(sp[0],sp[1]);if(A[a].run)n.run=1;n.nm=pick(A[a].names);n.st='walk';n.t=0;klantRoll(n)};
/* ---------- vaste mensen: muzikant op het plein, zwervers in de stegen, helers ---------- */
const FIXED=[];
function addFixed(arch,x,z,ry){const p=M.nearestWalk(x,z,6)||{x,z};const n={x:p.x,z:p.z,dx:0,dz:1,v:0,ph:0,ry:ry||0,turn:99,stop:0,fixed:1,home:{x:p.x,z:p.z,ry:ry||0}};n.arch=arch;n.look=lookFor(arch,null)||lookFor('student',null);n.nm=pick(A[arch].names);n.st=A[arch].fixed||'stand';n.t=0;G.NPC.push(n);FIXED.push(n);return n}
G.addFixed=addFixed;
// iemand van een bepaalde soort op een plek zetten (voor gebeurtenissen)
G.npcMake=function(arch,x,z){const n=G.spawnNpc(false),p=M.nearestWalk(x,z,6)||{x,z},a=A[arch]||A.burger;n.x=p.x;n.z=p.z;n.arch=A[arch]?arch:'burger';n.look=lookFor(n.arch,null)||n.look;n.v=a.v?rr(a.v[0],a.v[1]):1.3;n.run=a.run?1:0;n.nm=pick(a.names);n.st='walk';n.t=0;n.klant=null;n.rid=null;n.aid=null;n.robbed=n.picked=0;G.NPC.push(n);return n};
G.npcRemove=function(n){const i=G.NPC.indexOf(n);if(i>=0)G.NPC.splice(i,1)};
// de muzikant speelt op Het Plein (kijkt naar het standbeeld), Ome Henk staat naast de deur van Het Contact (n.contact: zo vinden
// andere onderdelen hem terug), Rooie Ron in een steeg in de Westbuurt
function setupFixed(){const addFixed=G.addFixed;addFixed('muzikant',418,292,Math.PI);
  const hp=M.placeById('hits'),hc=hp?hp.door:M.A.contact,f=hp?hp.face:'W',ew=f==='W'||f==='E',hry={W:-Math.PI/2,E:Math.PI/2,N:Math.PI,S:0}[f]||0;
  const h=addFixed('heler',hc.x+(ew?0:5),hc.z+(ew?5:0),hry);h.nm='Ome Henk';h.contact=1;G.helerContact=h;
  const al=M.alleys.slice().sort((a,b)=>a.cx-b.cx);[al[2],al[Math.floor(al.length/2)],al[al.length-3]].filter(Boolean).forEach(a=>{const ns=a.f==='N'||a.f==='S';addFixed('zwerver',ns?a.x0+.7:a.cx,ns?a.cz:a.z0+.7,ns?Math.PI/2:0)});
  const wb=al.filter(a=>M.districtAt(a.cx,a.cz)==='Westbuurt'),ha=wb[Math.floor(wb.length/2)];if(ha){const r=addFixed('heler',ha.cx,ha.cz,0);r.nm='Rooie Ron'}}
/* ---------- tekstwolkjes boven hoofden ---------- */
const BUB=[];
function bubbleTex(text,col){const cv=document.createElement('canvas'),c=cv.getContext('2d');c.font='bold 9px monospace';const w=Math.ceil(c.measureText(text).width)+10;cv.width=w;cv.height=17;
  c.fillStyle='#000';c.fillRect(1,0,w-2,13);c.fillRect(0,1,w,11);c.fillStyle=col||'#fff';c.fillRect(2,1,w-4,11);c.fillRect(1,2,w-2,9);c.fillStyle='#000';c.fillRect(5,13,4,2);c.fillRect(6,15,2,1);c.fillStyle=col||'#fff';c.fillRect(6,13,2,1);
  c.font='bold 9px monospace';c.fillStyle='#111';c.textBaseline='middle';c.fillText(text,5,7);const t=new TH.CanvasTexture(cv);t.magFilter=t.minFilter=TH.NearestFilter;t.colorSpace=TH.SRGBColorSpace;return {t,w}}
function bubble(who,text,o){o=o||{};if(!G.ready)return;let b=BUB.find(b=>b.who===who)||BUB.find(b=>b.life<=0);
  if(!b){if(BUB.length>=10)b=BUB.reduce((a,c)=>a.life<c.life?a:c);else{b={sp:new TH.Sprite(new TH.SpriteMaterial({depthTest:false,transparent:true})),life:0};b.sp.renderOrder=20;G.scene().add(b.sp);BUB.push(b)}}
  if(b.tx)b.tx.dispose();const {t,w}=bubbleTex(text,o.col);b.tx=t;b.sp.material.map=t;b.sp.material.needsUpdate=true;b.sp.scale.set(w/17*1.1,1.1,1);b.who=who;b.life=o.life||2.6;b.y=o.y||3.0;b.sp.visible=true}
function bubStep(dt){BUB.forEach(b=>{if(b.life<=0)return;b.life-=dt;const w=b.who;if(!w||b.life<=0){b.sp.visible=false;b.life=0;return}b.sp.position.set(w.x,b.y+(w.y||0),w.z);b.sp.material.opacity=Math.min(1,b.life*3)})}
G.bubble=bubble;
/* ---------- deeltjes en zwevende tekst ---------- */
const PRT=[];let pg=null;
function burst(x,y,z,col,n){if(!pg)pg=new TH.BoxGeometry(.22,.12,.01);for(let i=0;i<(n||8);i++){let p=PRT.find(p=>p.life<=0);if(!p){p={m:new TH.Mesh(pg,new TH.MeshBasicMaterial({color:0xffffff})),life:0};G.scene().add(p.m);PRT.push(p)}
  p.m.material.color.set(col||'#3fe395');p.m.position.set(x,y,z);p.v={x:rr(-2.2,2.2),y:rr(3,5.5),z:rr(-2.2,2.2)};p.r={x:rr(-9,9),y:rr(-9,9)};p.life=rr(.7,1.1);p.m.visible=true}}
function prtStep(dt){PRT.forEach(p=>{if(p.life<=0)return;p.life-=dt;if(p.life<=0){p.m.visible=false;return}p.v.y-=12*dt;p.m.position.x+=p.v.x*dt;p.m.position.y=Math.max(.05,p.m.position.y+p.v.y*dt);p.m.position.z+=p.v.z*dt;p.m.rotation.x+=p.r.x*dt;p.m.rotation.y+=p.r.y*dt})}
const V3=new TH.Vector3();
function float(text,x,z,col){const el=document.createElement('div');el.className='sd-float';el.textContent=text;el.style.color=col||'#3fe395';document.body.appendChild(el);
  const pos=()=>{V3.set(x,2.6,z).project(G.camera());el.style.left=(V3.x*.5+.5)*innerWidth+'px';el.style.top=(-V3.y*.5+.5)*innerHeight+'px'};pos();setTimeout(()=>el.remove(),1600)}
G.fx2={burst,float};
/* ---------- respect per wijk ---------- */
const repS=()=>{try{return S.stadRep&&typeof S.stadRep==='object'?S.stadRep:(S.stadRep={})}catch(e){return {}}};
const perk=k=>G.perk?G.perk(k):0;
function rep(x,z,d){const k=M.districtAt(x,z),R=repS();if(d>0)d=Math.max(1,Math.round(d*(1+.25*perk('charme'))));R[k]=clamp((R[k]||0)+d,-100,100);if(d&&Math.abs(d)>=3)G.toast&&G.toast((d>0?'+':'')+d+' respect in '+k,d>0?'ok':'bad');return R[k]}
const repAt=(x,z)=>repS()[M.districtAt(x,z)]||0;G.rep={add:rep,at:repAt};
/* ---------- spullen op zak (voor de heler) ---------- */
const zak=()=>{try{return Array.isArray(S.stadZak)?S.stadZak:(S.stadZak=[])}catch(e){return []}};
const ITEMS=[['Telefoon',.5],['Horloge',.9],['Gouden ketting',1.2],['Laptop',1],['Portemonnee met pasjes',.4],['Zonnebril',.3],['Oorbellen',.7]];
G.zak=zak;G.zakMax=()=>6+2*perk('zakken');G.zakLeeg=why=>{const z=zak();if(!z.length)return;const n=z.length;z.length=0;try{save()}catch(e){}G.toast&&G.toast((why||'Je spullen zijn in beslag genomen')+' ('+n+')','bad')};
/* ---------- gedrag (staat per persoon) ---------- */
let R=null,target=null;   // R = lopende overval
function face(n,x,z){n.ry=Math.atan2(x-n.x,z-n.z)}
function moveAway(n,from,sp,dt){let dx=n.x-from.x,dz=n.z-from.z;const d=Math.hypot(dx,dz)||1;dx/=d;dz/=d;
  if(!n.fl||n.flT<=0){// kies een vluchtrichting die vrij is
    let best=null,bs=-9;for(let i=0;i<8;i++){const a=Math.atan2(dx,dz)+rr(-1.2,1.2),fx=Math.sin(a),fz=Math.cos(a);if(M.canStand(n.x+fx*2,n.z+fz*2,.3)){const sc=fx*dx+fz*dz;if(sc>bs){bs=sc;best={x:fx,z:fz}}}}n.fl=best||{x:dx,z:dz};n.flT=rr(.6,1.2)}
  n.flT-=dt;const nx=n.x+n.fl.x*sp*dt,nz=n.z+n.fl.z*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;else n.flT=0;if(M.canStand(n.x,nz,.3))n.z=nz;else n.flT=0;
  n.ry=Math.atan2(n.fl.x,n.fl.z);n.ph+=dt*sp*1.25;n.sp=1.3}
// kijken naar jou (als je langsloopt of iets doet) en knipperen
function headLook(n,dt,dP){let tg=0;const near=dP<5.5&&!G.driving;if(near&&!n._near){n._near=1;if(Math.random()<.45)n.lookT=rr(1.2,3)}else if(!near&&dP>7)n._near=0;
  if((G.emote||G.optreden)&&dP<10)n.lookT=Math.max(n.lookT||0,.6);
  if(n.lookT>0){n.lookT-=dt;let a=Math.atan2(G.P.x-n.x,G.P.z-n.z)-n.ry;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)<1.9)tg=clamp(a,-1.15,1.15)}
  else if(n.fixed&&n.st!=='play')tg=Math.sin((n.t||0)*.6+n.x)*.5;
  n.hy=(n.hy||0)+(tg-(n.hy||0))*Math.min(1,dt*6);n.bl=(n.bl==null?rr(1,5):n.bl)-dt;n.blink=n.bl<.12;if(n.bl<=0)n.bl=rr(2,6)}
// af en toe iets doen onderweg: bellen, een praatje met een ander, een foto maken, op je horloge kijken
const SMALL=['Ja. Nee. Ja, is goed.','Ik bel je zo terug.','Echt waar?','Nee joh.','Tot zo.'];
const CHAT=['Hoe is het?','Druk, druk.','En thuis?','Heb je het gehoord?','Nee, vertel!','Ach ja.','Zo gaat dat.','Precies!','Tot ziens hè.','Doe de groeten.','Wat een weer.','Zeg dat wel.'];
function ambient(n,dt,dP){if(dP>42||dP<3.2||n.fixed)return false;n.amb=(n.amb==null?rr(5,30):n.amb)-dt;if(n.amb>0)return false;n.amb=rr(14,42);const r=Math.random(),a=n.arch;
  if(a==='jogger'||a==='agent'||G.rain>.5)return false;
  if(a==='toerist'&&r<.5){n.st='photo';n.t=0;n.dur=rr(2.4,3.6);n.shot=0;return true}
  if(r<.42){const o=G.NPC.find(m=>m!==n&&m.st==='walk'&&!m.fixed&&m.arch!=='agent'&&m.arch!=='jogger'&&dist(m,n)<7&&los(m,n));if(o){n.st=o.st='chat';n.t=o.t=0;n.dur=o.dur=rr(5,9);n.mate=o;o.mate=n;n.lead=1;o.lead=0;return true}}
  if(r<.78){n.st='phone';n.t=0;n.dur=rr(3,7);return true}
  n.st='wait';n.t=0;n.dur=rr(2,3.5);return true}
const back=n=>{n.st=n.fixed?(n.fixSt||A[n.arch].fixed||'stand'):'walk';n.t=0};
// publiek bij een optreden komt dichterbij staan
function gather(n,dt,dP){if(!n.party||dP<5.5)return;const dx=G.P.x-n.x,dz=G.P.z-n.z,sp=2.4,nx=n.x+dx/dP*sp*dt,nz=n.z+dz/dP*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;n.ph+=dt*sp*1.6;n.sp=.7}
G.npcBrain=function(n,dt){const st=n.st||'walk',dP=dist(n,G.P);n.t=(n.t||0)+dt;n.arm=undefined;n.armR=undefined;n.armL=undefined;n.armRz=0;n.armLz=0;n.hop=0;n.legL=n.legR=undefined;n.hx=0;n.y=0;n.lean=0;
  if(dP<34)headLook(n,dt,dP);else{n.hy=0;n.blink=0}
  if(st==='walk'){if(n.arch==='agent'&&copWatch(n,dt))return true;if(n.klant&&!n.psst&&dP<5&&!G.driving){n.psst=1;if(Math.random()<.6)bubble(n,'Psst…',{col:'#c8ffd8'})}if(ambient(n,dt,dP))return true;return false}
  if(st==='talk'){n.sp=0;face(n,G.P.x,G.P.z);if(!K.dialogOpen()&&n.t>.4)back(n);return true}
  if(st==='hold'){n.sp=0;face(n,G.P.x,G.P.z);n.hy=.5;if(n.t>(n.dur||6))back(n);return true}
  if(st==='handsup'){n.sp=0;face(n,G.P.x,G.P.z);n.arm=-2.8;n.armR=-2.8;if(n.t>12){n.st='flee';n.t=0}return true}
  if(st==='flee'){moveAway(n,n.from||G.P,n.fleeSp||4.6,dt);n.arm=-1;n.armR=-1;if(n.t>(n.flee||6)){back(n);if(n.fixed){n.x=n.home.x;n.z=n.home.z;n.ry=n.home.ry}}return true}
  if(st==='call'){n.sp=0;face(n,G.P.x,G.P.z);n.armR=-2.5;n.armRz=-.35;if(dP<2.3&&!G.driving){n.st='flee';n.t=0;n.from=G.P;bubble(n,'Nee! Niet doen!');G.toast&&G.toast('Je hield de beller tegen','ok');G.snd&&G.snd.fx('grab');return true}
    if(n.t>=n.callT){n.st='flee';n.t=0;n.from=G.P;bubble(n,'Politie? Kom snel!',{col:'#a9c8ff'});G.police&&G.police.report(n.cx,n.cz,{why:n.why||'straatroof',stars:n.stars||1,mask:n.masked})}return true}
  if(st==='cower'){n.sp=0;n.arm=-2.2;n.armR=-2.2;n.y=-.25;if(n.t>5)back(n);return true}
  if(st==='follow'){const d=dP;if(d>1.6){const dx=G.P.x-n.x,dz=G.P.z-n.z,sp=Math.min(n.escort?6:3.2,d*1.4),nx=n.x+dx/d*sp*dt,nz=n.z+dz/d*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;n.ry=Math.atan2(dx,dz);n.ph+=dt*sp*1.25;n.sp=Math.min(1,sp/3)}else n.sp=0;
    if(n.t>n.followT){n.st='walk';n.t=0;if(n.onFollowed)n.onFollowed(n);else helpDone(n)}return true}
  if(st==='sit'){n.sp=0;n.y=-.42;n.lean=.25;n.arm=-.6;n.armR=-.6;n.ry=n.home.ry;if(Math.random()<dt*.04&&dP<14)bubble(n,pick(['Euro\'tje?','Hé, jij daar!','Kleingeld?']));return true}
  if(st==='sitb'){n.sp=0;n.y=-.3;n.legL=n.legR=-1.5;n.ry=n.home.ry;n.armL=-.5;n.armR=n.sub==='duiven'?-.9+Math.max(0,Math.sin(n.t*1.3))*-.8:n.sub==='lees'?-1.25:-.5;if(n.sub==='lees'){n.armL=-1.25;n.hx=.35;n.hy=0}
    if(Math.random()<dt*.03&&dP<12)bubble(n,pick(n.sub==='duiven'?['Kom maar, kom maar.','Roekoe.']:n.sub==='lees'?['Hm.','Interessant.']:['Lekker zitten.','Even rust.']));return true}
  if(st==='play'){n.sp=0;n.ry=n.home.ry;n.arm=-1.1+Math.sin(n.t*9)*.25;n.armR=-1.3;n.ph+=dt*2;n.hop=Math.abs(Math.sin(n.t*3))*.03;if(Math.random()<dt*.05&&dP<18)bubble(n,'♪ ♫ ♪',{col:'#ffe9a8'});return true}
  if(st==='stand'){n.sp=0;n.ry=n.home.ry+Math.sin(n.t*.5)*.4;n.arm=-.3;n.armR=-.3;return true}
  if(st==='duel'){n.sp=0;face(n,G.P.x,G.P.z);const d=n.duel||'klaar',b=Math.sin(n.t*5);n.armL=-1.5+b*.08;n.armR=-1.3-b*.08;n.armLz=.35;n.armRz=-.35;n.hop=Math.abs(b)*.04;
    if(d==='tele'){n.armR=-.2;n.armRz=-.9;n.lean=-.25}else if(d==='sla'){n.armR=-1.7;n.armRz=0;n.lean=.3}else if(d==='au'){n.lean=-.45;n.armL=.4;n.armR=.4;n.hx=-.3}else if(d==='blok'){n.armL=n.armR=-2;n.armLz=.5;n.armRz=-.5}else if(d==='ko'){n.y=-.62;n.lean=-1.2;n.legL=n.legR=-1.3;n.armL=n.armR=.3;n.hop=0}return true}
  if(st==='fight'){n.sp=0;face(n,G.P.x,G.P.z);n.arm=-1.6+Math.sin(n.t*14)*.6;n.armR=-1.6-Math.sin(n.t*14)*.6;if(n.t>.9){n.st='flee';n.t=0;n.from=G.P}return true}
  // ---- onderweg ----
  if(st==='phone'){n.sp=0;n.armR=-2.45;n.armRz=-.4;n.hy=.25;if(!n.said&&n.t>1&&dP<14){n.said=1;bubble(n,pick(SMALL))}if(n.t>n.dur){n.said=0;back(n)}return true}
  if(st==='wait'){n.sp=0;n.armL=-1.3;n.armLz=.45;n.hx=.4;if(n.t>n.dur)back(n);return true}
  if(st==='photo'){n.sp=0;n.arm=-1.5;n.armR=-1.5;n.hx=-.05;if(!n.shot&&n.t>1.2){n.shot=1;if(dP<22){burst(n.x+Math.sin(n.ry)*.5,1.7,n.z+Math.cos(n.ry)*.5,'#ffffff',4);if(dP<12)G.snd&&G.snd.fx('click')}if(dP<12&&Math.random()<.5)bubble(n,pick(['Cheese!','Beautiful!','Wow!']))}if(n.t>n.dur)back(n);return true}
  if(st==='chat'){const m=n.mate;if(!m||m.st!=='chat'||m.mate!==n){n.mate=null;back(n);return true}n.sp=0;face(n,m.x,m.z);const turn=Math.floor(n.t/1.7)%2===(n.lead?0:1);
    if(turn){n.armR=-.9+Math.sin(n.t*7)*.35;n.armRz=.25;if(n.said!==Math.floor(n.t/1.7)){n.said=Math.floor(n.t/1.7);if(dP<16)bubble(n,pick(CHAT),{life:1.6})}}else n.hx=Math.sin(n.t*5)*.08;
    if(n.t>n.dur){n.mate=null;n.said=0;back(n)}return true}
  // ---- reacties op jou ----
  if(st==='wave'){n.sp=0;face(n,G.P.x,G.P.z);n.armR=0;n.armRz=2.85+Math.sin(n.t*11)*.32;if(n.t>(n.dur||1.7)){n.st=n.back||'walk';n.t=0}return true}
  if(st==='watch'){n.sp=0;face(n,G.P.x,G.P.z);gather(n,dt,dP);const b=Math.sin(n.t*15);n.armL=-1.35;n.armR=-1.35;n.armLz=.34+b*.16;n.armRz=-.34-b*.16;n.hop=Math.abs(Math.sin(n.t*4))*.03;if(n.t>n.dur||(!G.emote&&!G.optreden&&n.t>1.5)||(dP>12&&!n.party)){n.st=n.back||'walk';n.t=0}return true}
  if(st==='dance'){n.sp=0;face(n,G.P.x,G.P.z);const b=Math.sin(n.t*6.4);n.armL=-1.15+b*.9;n.armR=-1.15-b*.9;n.armLz=-.4;n.armRz=.4;n.legL=b*.35;n.legR=-b*.35;n.hop=Math.abs(b)*.12;n.hy=Math.sin(n.t*3.2)*.3;if(n.t>n.dur||(!G.emote&&!G.optreden&&!n.party&&n.t>1.5)||(dP>14&&!n.party)){n.st=n.back||'walk';n.t=0}return true}
  if(st==='scramble'){const dx=n.tx-n.x,dz=n.tz-n.z,d=Math.hypot(dx,dz);if(d>.7&&n.t<5){const sp=4.8,nx=n.x+dx/d*sp*dt,nz=n.z+dz/d*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;n.ry=Math.atan2(dx,dz);n.ph+=dt*sp*1.25;n.sp=1.2;n.arm=-.8;n.armR=-.8}
    else{n.sp=0;n.grab=(n.grab||0)+dt;n.y=-.3;n.lean=.7;n.arm=-1.2;n.armR=-1.2;if(n.grab>1){n.grab=0;n.st='wave';n.t=0;n.dur=1.5;n.back='walk';bubble(n,pick(['Dank je!','Gratis geld!','Wat een held!','Yes!']),{col:'#c8ffd8'})}}return true}
  return false};
/* ---------- agenten op straat: zien ze iets, dan begint de achtervolging ---------- */
function copWatch(n,dt){n.cw=(n.cw||0)-dt;if(n.cw>0)return false;n.cw=.4;const P=G.P,d=dist(n,P);if(d>16||G.driving)return false;
  const lv=typeof S!=='undefined'&&S.wanted?(typeof S.wanted==='object'?(S.wanted.lv||1):1):0;
  if((lv>0&&d<11*(1+(G.faam?G.faam():0)/250)&&los(n,P)&&!(G.police&&G.police.active()))&&!G.hidden){if(G.smeer&&G.smeer.blind(n))return false;bubble(n,'Hé! Jou ken ik!',{col:'#a9c8ff'});G.snd&&G.snd.fx('whistle');G.police&&G.police.start({stars:Math.min(3,lv),why:'gezocht',at:n,wanted:1});n.st='walk';return false}
  return false}
/* ---------- getuigen ---------- */
// x,z = waar het gebeurt; victim = het slachtoffer; stars = hoe zwaar
function crime(x,z,o){o=o||{};const night=G.night>.55,Rr=night?10:14,masked=G.P.look&&G.P.look.hat==='mask',pt={x,z};let callers=0;
  rep(x,z,o.rep!=null?o.rep:-2);
  G.NPC.forEach(n=>{if(n===o.victim||n.st==='call')return;const d=dist(n,pt);if(d>Rr||!los(n,pt))return;const a=A[n.arch]||A.burger;
    if(a.cop){if(G.smeer&&G.smeer.blind(n,o)){if(d<9)bubble(n,pick(['…','Ik zag niks.','Hm.']),{col:'#a9c8ff'});return}if(!(G.police&&G.police.active())){bubble(n,'Staan blijven!',{col:'#a9c8ff'});G.snd&&G.snd.fx('whistle');G.smeer&&G.smeer.zag&&G.smeer.zag(n);G.police&&G.police.start({stars:o.stars||1,why:o.why||'straatroof',at:n})}return}
    const vw=G.volk?G.volk.getuige(n,{x,z,soft:o.soft}):null,vm=vw?vw.mul:1;if(vw&&vw.never){if(d<8&&Math.random()<.5)bubble(n,pick(['Ik heb niks gezien.','Ik kijk wel even weg.']),{col:'#c8ffd8'});return}
    if(o.soft&&!a.cop){const rp2=repAt(x,z);if(callers<1&&Math.random()<a.call*.45*vm*(1-rp2/200)*(1-.12*perk('prater'))*(G.wijkOwn&&G.wijkOwn(x,z)?.4:1)){callers++;n.st='call';n.t=0;n.callT=rr(3,6);n.cx=x;n.cz=z;n.why=o.why;n.stars=1;bubble(n,pick(['Hé! Dat mag niet!','Vandaal!']),{col:'#ffd35a'})}return}
    const rp=repAt(x,z),pc=a.call*vm*(masked?.5:1)*(1-rp/200)*(callers<2?1:0)*(1-.12*perk('prater'))*(G.wijkOwn&&G.wijkOwn(x,z)?.6:1);
    if(Math.random()<pc){callers++;n.st='call';n.t=0;n.callT=rr(2.5,6)*(n.arch==='zakenman'?.7:1);n.cx=x;n.cz=z;n.why=o.why;n.stars=o.stars;n.masked=masked;bubble(n,'112!',{col:'#ffd35a'});return}
    if(a.fight&&Math.random()<.5){n.st='walk';bubble(n,pick(['Ha, lekker bezig.','Niet mijn probleem.']));return}
    n.st=Math.random()<.35?'cower':'flee';n.t=0;n.from=pt;n.flee=rr(4,8);if(a.scream||Math.random()<.4){bubble(n,pick(['Help!','Aaah!','Hij heeft een wapen!','Politie!']),{col:'#ff9a9a'});if(Math.random()<.5)G.snd&&G.snd.fx('scream')}});
  return callers}
G.crime=crime;
/* ---------- straatroof: schaal van de klussen van jouw rang ---------- */
function roofRef(){if(typeof CRIMES==='undefined')return null;const ri=rankIdx(S.xp),L=['zakken','scooter','horloge'].map(id=>CRIMES.find(c=>c.id===id)).filter(Boolean);let r=L[0];L.forEach(c=>{if(c.r<=ri)r=c});return r}
const weapon=()=>{try{return typeof gearBest==='function'?gearBest('wapen'):null}catch(e){return null}};
const vk=()=>{try{return typeof gearVk==='function'?gearVk():0}catch(e){return 0}};
function roofWhy(n){const c=roofRef();if(!c)return 'Kan nu niet';if(!weapon())return 'Je hebt een wapen nodig (Wapenhandel)';if(typeof inJail==='function'&&inJail())return 'Je zit vast';if(G.mission&&G.mission())return 'Maak eerst je klus af';
  const cd=(S.cd&&S.cd.straatroof||0)-now();if(cd>0)return 'Even wachten: nog '+Math.ceil(cd/1000)+' s';if(S.energy<crEn(c))return 'Te moe: '+crEn(c)+' energie nodig';if(!(A[n.arch]||{}).wallet)return 'Daar valt niets te halen';return ''}
function roofStart(n){const c=roofRef(),why=roofWhy(n);if(why){G.toast(why,'bad');return}
  K.closeDialog(true);S.energy-=crEn(c);S.cd=S.cd||{};S.cd.straatroof=now()+crimeCd(c);try{save()}catch(e){}
  const a=A[n.arch],w=vk(),ang=G.volk?G.volk.angst(n.x,n.z):0,fight=Math.random()<Math.max(0,(a.tough-w))*.08*(1-.6*ang);n.t=0;
  G.shake&&G.shake(.35);G.snd&&G.snd.fx('grab');G.pArm=-1.5;
  if(fight){n.st='fight';bubble(n,pick(['Blijf van me af!','Probeer het maar!','Rot op!']),{col:'#ff9a9a'});setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.9);G.hitStop=.08;const hp=Math.round(rr(5,15));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.6;G.pArm=0;G.toast('Hij verzet zich! Je krijgt een duw (−'+hp+' gezondheid)','bad');if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){};try{save()}catch(e){}},500);crime(n.x,n.z,{victim:n,why:'straatroof',stars:1});return}
  n.st='handsup';bubble(n,pick(['Niet schieten!','Oké, oké!','Rustig!','Neem alles!']),{col:'#ffe0a0'});
  R={n,c,t:0,need:clamp(2.6-.25*w,1,2.6)*(1-.3*ang)};if(G.mini&&G.mini.hold){const me=R;R.mini=1;G.mini.hold({d:R.need,label:'Geld afpakken',vak:'roof',can:()=>R===me&&dist(me.n,G.P)<3.2&&!G.driving}).then(r=>{if(R!==me)return;if(r==='ok'||(r&&r.ok))me.t=me.need+1;else me.cancel=1})}else hold(true);crime(n.x,n.z,{victim:n,why:'straatroof',stars:G.police&&G.police.active()?2:1})}
function roofStep(dt){if(!R)return;const n=R.n,d=dist(n,G.P);G.pArm=-1.5;
  if(d>3||G.driving){bubble(n,'Hè hè.');n.st='flee';n.t=0;n.from=G.P;R=null;hold(false);G.pArm=0;G.toast('Overval afgebroken','bad');return}
  if(R.mini){if(R.cancel){bubble(n,'Hè hè.');n.st='flee';n.t=0;n.from=G.P;R=null;G.pArm=0;G.toast('Overval afgebroken','bad');return}if(R.t<R.need)return}
  else{const h=!!(G.K[' ']||G.K.e||G.actHold);if(h)R.t+=dt;else R.t=Math.max(0,R.t-dt*.6);holdBar(R.t/R.need)}
  if(R.t>=R.need){const c=R.c,a=A[n.arch],al=(G.alert&&G.alert())||0,g=Math.max(1,Math.floor(rnd(c.min,c.max)*(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1)*a.wallet*(1-al/200)));
    const lb=G.lidBonus?G.lidBonus():1;let cash=Math.round(g*lb),item=null;if(Math.random()<.3&&zak().length<G.zakMax()){const it=pick(ITEMS);item={n:it[0],v:Math.max(5,Math.round(g*.6*it[1]))};cash=Math.round(g*.5*lb);zak().push(item)}
    S.cash+=cash;if(typeof addZwart==='function')addZwart(cash);if(typeof addXp==='function')addXp(Math.max(1,Math.round(c.xp*.75)));if(typeof addHeat==='function')addHeat(rnd(2,4));S.stats=S.stats||{};S.stats.roof=(S.stats.roof||0)+1;G.ev&&(G.ev('roof'),G.ev('roof:'+n.arch));
    try{save()}catch(e){}G.snd&&G.snd.fx('cash');G.hitStop=.07;G.shake&&G.shake(.4);burst(n.x,1.4,n.z,'#3fe395',10);float('+'+fmt(cash)+(item?' + '+item.n.toLowerCase():''),n.x,n.z);G.lidFloat&&G.lidFloat(n.x,n.z);
    if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
    n.st='flee';n.t=0;n.from=G.P;n.flee=8;n.robbed=1;G.volk&&G.volk.daad(n,'roof');bubble(n,pick(['Help! Overval!','Politie!','Mijn tas!']),{col:'#ff9a9a'});if(A[n.arch].scream||Math.random()<.5)G.snd&&G.snd.fx('scream');
    // het slachtoffer belt zelf ook (als jij weg bent)
    if(Math.random()<A[n.arch].call*(G.P.look&&G.P.look.hat==='mask'?.5:1)){setTimeout(()=>{if(n.st==='flee'||n.st==='walk'){n.st='call';n.t=0;n.callT=rr(3,6);n.cx=n.x;n.cz=n.z;n.why='straatroof';n.stars=1;n.masked=G.P.look&&G.P.look.hat==='mask'}},rr(2500,5000))}
    if(n.arch==='oma')rep(n.x,n.z,-10);else rep(n.x,n.z,-3);
    G.alertAdd&&G.alertAdd(n.x,n.z);R=null;hold(false);G.pArm=0;if(typeof log==='function')log('Straatroof: '+A[n.arch].n.toLowerCase()+' beroofd, '+fmt(cash)+(item?' en '+item.n.toLowerCase():''),'ok')}}
// wijkalarm: na een roof in dezelfde wijk letten mensen beter op en hebben ze minder bij zich
const ALERT={};G.alertAdd=(x,z)=>{const k=M.districtAt(x,z);ALERT[k]=Math.min(100,(ALERT[k]||0)+25)};G.alert=()=>ALERT[M.districtAt(G.P.x,G.P.z)]||0;
setInterval(()=>{for(const k in ALERT)ALERT[k]=Math.max(0,ALERT[k]-1)},60000);
/* ---------- vasthoudknop (straatroof) ---------- */
const hb=document.createElement('button');hb.className='sd-act sd-hold';hb.id='sdHold';hb.hidden=true;hb.innerHTML=`<i></i><span>${touch?'Houd vast · Geld afpakken':'<kbd>E</kbd> vasthouden · Geld afpakken'}</span>`;document.body.appendChild(hb);
const on=e=>{e.preventDefault();G.actHold=true},off=()=>{G.actHold=false};hb.addEventListener('pointerdown',on);hb.addEventListener('pointerup',off);hb.addEventListener('pointercancel',off);hb.addEventListener('pointerleave',off);
function hold(v){hb.hidden=!v;if(!v){G.actHold=false;hb.style.setProperty('--p','0%')}}
function holdBar(p){hb.style.setProperty('--p',clamp(p,0,1)*100+'%')}
/* ---------- helpen, fooi, tips ---------- */
function helpDone(n){G.volk&&G.volk.daad(n,'help');bubble(n,'Dank je wel, jongen!',{col:'#ffe0a0'});const g=Math.round(rr(2,12));S.cash+=g;if(typeof addXp==='function')addXp(2);rep(n.x,n.z,5);S.stats=S.stats||{};S.stats.oma=(S.stats.oma||0)+1;G.ev&&G.ev('oma');try{save()}catch(e){}float('+'+fmt(g)+' · respect',n.x,n.z,'#ffd35a');G.snd&&G.snd.fx('ok')}
function tipMoney(n,amt){if(S.cash<amt){G.toast('Niet genoeg contant geld','bad');return false}S.cash-=amt;G.ev&&G.ev('fooi');G.volk&&G.volk.daad(n,'fooi');try{save()}catch(e){}rep(n.x,n.z,2);G.snd&&G.snd.fx('coin');float('−'+fmt(amt),G.P.x,G.P.z,'#ffd35a');return true}
/* ---------- zakkenrollen: zonder wapen, met vlugge vingers (klus 'zakken' uit het klikspel: energie en wachttijd) ---------- */
const zakRef=()=>{try{return CRIMES.find(c=>c.id==='zakken')||roofRef()}catch(e){return null}};
const skl=id=>{try{return (S.skills&&S.skills[id])||0}catch(e){return 0}};
function zakWhy(n){const c=zakRef();if(!c)return 'Kan nu niet';if(typeof inJail==='function'&&inJail())return 'Je zit vast';if(G.mission&&G.mission())return 'Maak eerst je klus af';if(G.police&&G.police.active())return 'Niet met de politie in de buurt';
  const cd=(S.cd&&S.cd.stadZakrol||0)-now();if(cd>0)return 'Even wachten: nog '+Math.ceil(cd/1000)+' s';if(S.energy<crEn(c))return 'Te moe: '+crEn(c)+' energie nodig';if(!(A[n.arch]||{}).wallet)return 'Daar valt niets te halen';if(n.robbed||n.picked)return 'Die heeft niets meer op zak';return ''}
async function zakrol(n){const c=zakRef(),why=zakWhy(n);if(why){G.toast(why,'bad');return}const a=A[n.arch];K.closeDialog(true);S.energy-=crEn(c);S.cd=S.cd||{};S.cd.stadZakrol=now()+crimeCd(c);try{save()}catch(e){}
  n.st='hold';n.t=0;n.dur=14;G.pose='pak';G.poseLock=true;G.lookAt=n;
  const w=clamp(.25-.014*a.tough+.0025*skl('steal')+.03*perk('vingers'),.1,.36);
  const r=await G.mini.timing({title:'Zakkenrollen',sub:'Hij let even niet op. Druk als het streepje in het groen staat.',n:2+(a.tough>2?1:0),w,sp:1.15+.11*a.tough,allow:0,label:'Pak!',vak:'zakken',tick:()=>dist(n,G.P)<3.4});
  G.pose=null;G.poseLock=false;G.lookAt=null;
  if(r==='cancel'){n.st='walk';n.t=0;G.toast('Je bedenkt je','info');return}
  if(r.ok){const al=G.alert()||0,g0=Math.max(1,Math.floor(rnd(c.min,c.max)*(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1)*a.wallet*.8*(1-al/200))),g=Math.round(g0*(G.lidBonus?G.lidBonus():1));let item=null;
    if(Math.random()<.2&&zak().length<G.zakMax()){const it=pick(ITEMS);item={n:it[0],v:Math.max(5,Math.round(g0*.5*it[1]))};zak().push(item)}
    S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(Math.max(1,Math.round(c.xp*.6)));if(typeof addHeat==='function')addHeat(1);S.stats=S.stats||{};S.stats.zakrol=(S.stats.zakrol||0)+1;G.ev&&G.ev('zakrol');try{save()}catch(e){}
    G.snd&&G.snd.fx('coin');float('+'+fmt(g)+(item?' + '+item.n.toLowerCase():''),n.x,n.z);G.lidFloat&&G.lidFloat(n.x,n.z);n.picked=1;G.volk&&G.volk.daad(n,'zakrolok');n.st='walk';n.t=0;if(typeof log==='function')log('Zakkenrollen in de Pixelstad: '+fmt(g)+(item?' en '+item.n.toLowerCase():''),'ok');
    // soms merkt hij het een paar tellen later
    if(Math.random()<.14)setTimeout(()=>{if(n.st!=='walk'||dist(n,G.P)>40)return;bubble(n,'Hé… mijn portemonnee!',{col:'#ff9a9a'});n.robbed=1;G.volk&&G.volk.daad(n,'zakrol2');if(Math.random()<a.call){n.st='call';n.t=0;n.callT=rr(3,6);n.cx=n.x;n.cz=n.z;n.why='zakkenrollen';n.stars=1}},rr(3500,7000));return}
  // betrapt
  G.snd&&G.snd.fx('bad');G.shake&&G.shake(.4);n.robbed=1;G.volk&&G.volk.daad(n,'zakrol');bubble(n,pick(['Blijf van me af!','Dief!','Hé! Mijn zak!']),{col:'#ff9a9a'});rep(n.x,n.z,n.arch==='oma'?-8:-3);
  if(a.fight){n.st='fight';n.t=0;setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.8);const hp=Math.round(rr(5,12));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.5;try{save()}catch(e){}G.toast('Betrapt. Je krijgt een klap (−'+hp+' gezondheid)','bad')},420)}
  else{G.toast('Betrapt!','bad');if(Math.random()<a.call){n.st='call';n.t=0;n.callT=rr(2.5,5);n.cx=n.x;n.cz=n.z;n.why='zakkenrollen';n.stars=1;bubble(n,'112!',{col:'#ffd35a'})}else{n.st='flee';n.t=0;n.from=G.P;n.flee=6}}
  crime(n.x,n.z,{victim:n,why:'zakkenrollen',stars:1,rep:0})}
/* ---------- dealen op straat: de regels van 'Werk en dealen' (act.dlSell), maar je klant staat echt voor je ---------- */
// dealbuurten (ids uit pages/dealen.js): de haven en de industrie horen bij Noord, Het Eiland bij (Oud-)Zuid, de Oosterstraat en Oostland bij Zuidoost
function buurtAt(x,z){const d=M.districtAt(x,z);if(/Centrum|Plein|Gracht/.test(d))return 'centrum';if(/Oud-Zuid|Zuidas|Eiland/.test(d))return 'zuid';if(/West/.test(d))return 'west';if(/Noord|Villapark|Bajes|De Haven|IJ-oever|Bedrijventerrein/.test(d))return 'noord';if(/Strand|Boulevard/.test(d))return 'pijp';return 'zo'}
function klantRoll(n){try{if(typeof DRUGS==='undefined'||typeof dlAvail!=='function')return;const p={student:.4,toerist:.32,zakenman:.22,rivaal:.3,burger:.16,zwerver:.2}[n.arch]||0;if(Math.random()<p){const av=dlAvail().filter(g=>g.id!=='kilo');if(av.length)n.klant=pick(av).id}}catch(e){}}
function dealInfo(n){try{const g=DRUGS.find(x=>x.id===n.klant);if(!g||g.lv>dlLv())return null;const D=dlS(),mo=dlLv()===0,have=mo?dlCap(g):Math.min(dlCap(g),D.stock[g.id]||0);let why='';
    if(typeof inJail==='function'&&inJail())why='Je zit vast';else if(typeof cdLeft==='function'&&cdLeft('deal_'+g.id))why='Even wachten met '+g.n.toLowerCase();else if(S.energy<DL_EN)why='Te moe: '+DL_EN+' energie nodig';else if(have<1)why='Je hebt geen '+g.n.toLowerCase()+' bij je (inkopen bij Havenloods 7)';
    return {g,have,mo,why}}catch(e){return null}}
function deal(n,g){K.closeDialog(true);try{const D=dlS();D.bu=buurtAt(n.x,n.z);const c0=S.cash;act.dlSell(g.id);const got=S.cash-c0;n.klant=null;
    if(got>0){float('+'+fmt(got),n.x,n.z);bubble(n,pick(['Top. Tot de volgende keer.','Je bent een held.','Je hebt me niet gezien.']),{col:'#c8ffd8'});G.snd&&G.snd.fx('cash');G.ev&&G.ev('deal');G.volk&&G.volk.daad(n,'deal');n.st='wave';n.t=0;n.dur=1.2;n.back='walk'}}catch(e){console.error(e)}}
/* ---------- gesprek ---------- */
function portraitLook(n){const L=n.look||{};return Object.assign({},L,{bg:'#1a1d23'})}
function opener(n){const a=A[n.arch],rp=repAt(n.x,n.z);if(G.npcOpen){const t=G.npcOpen(n);if(t)return t}if(a.cop&&typeof S!=='undefined'&&S.wanted&&!(G.smeer&&G.smeer.blind(n)))return 'Wacht eens even... jou ken ik van het bureau.';
  if(n.klant&&dealInfo(n))return pick(['Psst. Heb jij toevallig '+dealInfo(n).g.n.toLowerCase()+'?','Hé. Ze zeggen dat jij '+dealInfo(n).g.n.toLowerCase()+' hebt.']);
  if(G.wijkOwn&&G.wijkOwn(n.x,n.z)&&!a.cop&&Math.random()<.6)return pick(['Dag baas.','Alles rustig in de wijk, baas.','Fijn dat je er bent.']);
  if(rp>40&&!a.cop)return pick(['Hé, jij bent die van '+M.districtAt(n.x,n.z)+'. Respect.','Ah, jij weer. Alles goed?']);if(rp<-40&&!a.cop)return pick(['Blijf uit mijn buurt.','Jij bent die gast die hier mensen beroofd. Wegwezen.']);
  if(n.robbed)return 'Jij! Jij hebt me beroofd!';return pick(a.talk)}
const COMPL=['Mooie jas heb je aan.','Jij ziet er goed uit vandaag.','Wat een fijne buurt is dit, hè?','Jij lijkt me iemand die weet wat hij doet.'];
const COMPL_R={oma:'Och, wat lief van je.',zakenman:'Dank je. Maatwerk.',rivaal:'Slijmbal.',agent:'Dank u. Doorlopen.',student:'Haha, dank je!',toerist:'Oh, thank you!',zwerver:'Dat hoor ik niet vaak meer.',jogger:'Dank je. Hijg.'};
const GRAP=[['Waarom nemen Amsterdammers nooit de trap? Omdat ze alles al op de fiets doen.','Haha!'],['Wat doet een agent in de gracht? Zijn fiets zoeken.','Die ken ik nog niet!'],['Mijn huur is zo hoog, ik woon er alleen nog in het weekend.','Zo herkenbaar.'],['Ik zocht een parkeerplek. Nu heb ik een hypotheek.','Haha, ja.'],['Een toerist vraagt de weg. Ik zeg: rechtdoor tot je natte voeten krijgt.','Ha!']];
const SCHELD={oma:['Wel alle… Dat zeg je niet tegen een dame!',1],zakenman:['Mijn advocaat hoort hiervan.',0],rivaal:['Wat zei je daar? Kom hier!',2],agent:['Weet u wel tegen wie u praat? Doorlopen.',0],student:['Doe normaal, man.',0],toerist:['Sorry? I don\'t understand.',0],zwerver:['Ja ja. Jij ook.',0],jogger:['Geen adem voor jou.',0]};
const WEG=[['bank','De bank'],['crimes','Café Het Gat'],['cars','De garage'],['biz','De notaris'],['casino','Het casino'],['shop','De wapenhandel']];
function talk(n){const a=A[n.arch];G.talking=true;if(!n.spoke){n.spoke=1;G.ev&&G.ev('praat')}n.st='talk';n.t=0;target=null;G.lookAt=n;G.snd&&G.snd.fx('blip');const VP=G.volk?G.volk.contact(n):null,vij=!!(VP&&G.volk.val(VP.id)<=-40&&VP.kind!=='agent');
  const wpn=weapon(),fin=[{t:'Tot ziens',ic:K.ic.hand,f:()=>K.closeDialog()}];
  const praat=()=>{const tip=Math.random()<.4;K.say(tip?pick(TIPS):pick(a.talk),tip?'blij':null,[
    {t:'Compliment geven',ic:K.ic.star,dis:n.compl,why:'Al gedaan',f:()=>{n.compl=1;G.ev&&G.ev('compl');G.volk&&G.volk.daad(n,'compl');rep(n.x,n.z,1);K.say(COMPL_R[n.arch]||'Dank je!',a.fight?null:'blij',main())}},
    {t:'Grap vertellen',ic:K.ic.talk,dis:n.grap,why:'Al gedaan',f:()=>{n.grap=1;const g=pick(GRAP),ok=Math.random()<.55+(perk('charme')?.15:0);G.zeg&&G.zeg(g[0].length>34?'Ken je die van…':g[0]);G.volk&&G.volk.daad(n,ok?'grap':'grapmis');if(ok){rep(n.x,n.z,2);G.snd&&G.snd.fx('ok')}K.say(ok?g[1]:pick(['…','Die was flauw.','Hm.']),ok?'blij':null,main())}},
    {t:'De weg vragen',ic:K.ic.route,f:()=>{K.say('Waar moet je heen?',null,WEG.map(([id,nm])=>({t:nm,ic:K.ic.route,f:()=>{const pl=M.placeById(id);if(pl&&G.setWaypoint){K.closeDialog(true);G.setWaypoint(pl.door.x,pl.door.z,pl.name,pl.id);bubble(n,pick(['Die kant op.','Rechtdoor, dan zie je het.','Niet te missen.']));n.st='wave';n.t=0;n.dur=1.2;n.back=n.fixed?(n.fixSt||A[n.arch].fixed||'stand'):'walk'}}})).concat([{t:'Laat maar',ic:K.ic.no,f:()=>K.say(pick(a.talk),null,main())}]))}},
    {t:'Uitschelden',ic:K.ic.scare,risk:a.fight?3:1,dis:n.scold,why:'Al gedaan',f:()=>{n.scold=1;const r=SCHELD[n.arch]||['Nou zeg!',0];G.volk&&G.volk.daad(n,'scheld');rep(n.x,n.z,-3);K.say(r[0],'boos',fin);
      if(r[1]===1)setTimeout(()=>{K.closeDialog(true);n.st='fight';n.t=0;setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.5);S.hp=Math.max(10,(S.hp||100)-2);G.pose='au';setTimeout(()=>{if(G.pose==='au')G.pose=null},500);G.toast('Oma slaat je met haar tas (−2 gezondheid)','bad');try{save()}catch(e){}},350)},1300);
      if(r[1]===2)setTimeout(()=>{K.closeDialog(true);if(G.knok)G.knok(n);else{n.st='fight';n.t=0}},1300)}},
    {t:'Terug',ic:K.ic.no,f:()=>K.say(pick(a.talk),null,main())}])};
  const main=()=>{const rw=roofWhy(n),ch=[];
    ch.push({t:'Praten',sub:vij?'':'Compliment, grap, de weg vragen',ic:K.ic.talk,dis:vij,why:'Wil niet met je praten',f:praat});
    if(G.npcService&&G.npcService[n.arch])try{G.npcService[n.arch](n,ch,main)}catch(e){console.error(e)}
    if(n.klant){const d=dealInfo(n);if(d)ch.push({t:'Verkoop '+d.g.n.toLowerCase(),sub:d.why?'':d.have+' '+(d.have===1?d.g.u:d.g.u2)+(d.mo?' van Mo':'')+' · '+DL_EN+' energie',ic:K.ic.bag,risk:2,dis:!!d.why,why:d.why,f:()=>deal(n,d.g)})}
    if(n.arch==='toerist')ch.push({t:'Foto voor ze maken',ic:K.ic.photo,dis:n.photo,why:'Al gedaan',f:()=>{n.photo=1;G.ev&&G.ev('foto');G.volk&&G.volk.daad(n,'foto');const g=Math.round(rr(3,15));S.cash+=g;rep(n.x,n.z,2);try{save()}catch(e){}G.snd&&G.snd.fx('coin');float('+'+fmt(g),n.x,n.z);K.say('Thank you! Hier, voor de moeite.','blij',main())}});
    if(n.arch==='oma')ch.push({t:'Even helpen met de boodschappen',ic:K.ic.hand,dis:n.helped,why:'Al geholpen',f:()=>{n.helped=1;K.say('Wat aardig! Loop je even een stukje mee?','blij',[]);setTimeout(()=>{K.closeDialog(true);n.st='follow';n.t=0;n.followT=8},1300)}});
    if(n.arch==='zwerver')ch.push({t:'Geef '+fmt(10),ic:K.ic.money,dis:n.gave,why:'Al gegeven',f:()=>{if(!tipMoney(n,10))return;n.gave=1;const p=Math.random()<.6&&G.pakketTip&&G.pakketTip();K.say(p?'Ik zag laatst iemand iets verstoppen. In '+p.w+', hier niet ver vandaan. Ik heb het op je kaart gezet.':pick(TIPS),'blij',main())}});
    if(n.arch==='muzikant'){ch.push({t:'Fooi geven · '+fmt(5),ic:K.ic.music,dis:n.gave,why:'Al gegeven',f:()=>{if(!tipMoney(n,5))return;n.gave=1;K.say('Dank je! Deze is voor jou.','blij',main());[523,659,784,659,523].forEach((f,i)=>setTimeout(()=>G.snd&&G.snd.fx('blip'),i*150))}})}
    if(n.arch==='heler'){const z=zak(),hk=G.volk?G.volk.helerK(n):0,lt=G.lidTxt?G.lidTxt():'',tot=Math.round(z.reduce((s,i)=>s+i.v,0)*(1+hk)*(G.lidBonus?G.lidBonus():1));ch.push({t:z.length?'Spullen verkopen · '+fmt(tot):'Spullen verkopen',ic:K.ic.bag,dis:!z.length,why:'Je hebt niets op zak',sub:z.length?z.map(i=>i.n).join(', ')+(lt?' · '+lt:''):'',f:()=>{S.cash+=tot;if(typeof addZwart==='function')addZwart(tot);z.length=0;S.stats=S.stats||{};S.stats.heling=(S.stats.heling||0)+1;G.ev&&G.ev('heler');try{save()}catch(e){}G.snd&&G.snd.fx('cash');float('+'+fmt(tot),n.x,n.z);G.lidFloat&&G.lidFloat(n.x,n.z);K.say('Mooi spul. Hier, tel maar na.','blij',[{t:'Bedankt',ic:K.ic.hand,f:()=>K.closeDialog()}])}})}
    if(G.npcExtra)try{G.npcExtra(n,ch,main)}catch(e){console.error(e)}
    if(a.fight)ch.push({t:'Intimideren',ic:K.ic.scare,risk:wpn?1:3,f:()=>{G.volk&&G.volk.daad(n,'intim');if(wpn&&Math.random()<.5+vk()*.06+.3*(G.volk?G.volk.angst(n.x,n.z):0)){K.say('Oké, oké, rustig maar. Ik ga al.','bang',[]);rep(n.x,n.z,4);setTimeout(()=>{K.closeDialog(true);n.st='flee';n.t=0;n.from=G.P},1100)}
      else{K.say('Wat zei je? Kom maar op!','boos',[]);setTimeout(()=>{K.closeDialog(true);if(G.knok){G.knok(n);return}n.st='fight';n.t=0;setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.9);G.hitStop=.08;const hp=Math.round(rr(6,16));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.5;try{save()}catch(e){}G.toast('Klap gehad (−'+hp+' gezondheid)','bad')},450)},800)}}});
    if(!a.cop&&a.wallet){const zw=zakWhy(n);ch.push({t:'Zakkenrollen',sub:zw?'':'Zonder wapen, met vlugge vingers',ic:K.ic.hand,risk:a.tough>2?2:1,dis:!!zw,why:zw,f:()=>zakrol(n)})}
    if(!a.cop&&a.wallet)ch.push({t:'Beroven',ic:K.ic.rob,risk:n.arch==='zakenman'||n.arch==='rivaal'?3:2,dis:!!rw,why:rw,sub:!rw&&wpn?'Met je '+wpn.n.toLowerCase():'',f:()=>roofStart(n)});
    ch.push({t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()});return ch};
  K.dialog({name:n.nm,role:((G.volk&&G.volk.rol(n))||a.n)+(n.robbed?' · beroofd':'')+(n.klant&&dealInfo(n)?' · klant':''),look:portraitLook(n),mood:n.robbed?'boos':a.cop?'neutraal':(G.volk&&G.volk.stem(n))||null,lines:[opener(n)],col:a.col,choices:main(),onClose:()=>{G.talking=false;if(G.lookAt===n)G.lookAt=null;if(n.st==='talk')back(n)}});
  if(a.cop&&typeof S!=='undefined'&&S.wanted&&!(G.smeer&&G.smeer.blind(n))){setTimeout(()=>{K.closeDialog(true);G.smeer&&G.smeer.zag&&G.smeer.zag(n);G.police&&G.police.start({stars:Math.min(3,S.wanted.lv||1),why:'gezocht',at:n,wanted:1})},1600)}}
/* ---------- reacties op je emotes ---------- */
G.onEmote=function(id){const P=G.P;let k=0,got=0;G.NPC.forEach(m=>{const d=dist(m,P);if(d>9.5||['flee','call','handsup','fight','follow','talk','scramble','hold','duel'].includes(m.st)||!los(m,P))return;const a=A[m.arch]||A.burger;
  const set=(st,dur)=>{if(st!=='wave'&&st!=='watch'&&m.fixed)return;if(!['wave','watch','dance'].includes(m.st))m.back=m.st;m.st=st;m.t=0;m.dur=dur};
  if(id==='zwaai'){if(Math.random()<.7&&k<3){k++;set('wave',1.7);setTimeout(()=>bubble(m,pick(['Hoi!','Hé!','Dag!','Goeiedag!'])),250+k*220);if(!m.waved){m.waved=1;got++}}}
  else if(id==='dans'){if(a.cop){if(!k++)bubble(m,'Leuk hoor. Doorlopen.');return}if(Math.random()<.75&&k<5){k++;set((m.arch==='student'||m.arch==='toerist'||G.night>.55)&&Math.random()<.5?'dance':'watch',rr(4,8))}}
  else if(id==='juich'){if(k<2&&Math.random()<.6){k++;setTimeout(()=>bubble(m,pick(['Gefeliciteerd?','Wat valt er te vieren?','Hup!'])),300)}}
  else if(id==='buig'){if(k<2){k++;if(m.arch==='oma'){bubble(m,'Wat een nette jongen.');if(!m.bow){m.bow=1;got+=2}}else{set('wave',1.3)}}}
  else if(id==='duim'){if(k<2&&Math.random()<.7){k++;set('wave',1.2);setTimeout(()=>bubble(m,pick(['Jij ook!','Top!','Lekker bezig.'])),300)}}
  else if(id==='flex'){if(k<2&&Math.random()<.7){k++;bubble(m,m.arch==='oma'?'Trek een trui aan, jongen.':m.arch==='rivaal'?'Stel je niet aan.':m.arch==='student'?'Wow.':'Zo zo.')}}
  else if(id==='uitdaag'){if(m.arch==='rivaal'&&!k){k++;bubble(m,'Kom maar op dan!',{col:'#ff9a9a'});setTimeout(()=>{if(G.knok&&dist(m,G.P)<10)G.knok(m);else{m.st='fight';m.t=0}},700)}
    else if(a.cop){if(!k)bubble(m,'Rustig aan, vriend.',{col:'#a9c8ff'})}else if(Math.random()<.35&&!m.fixed){m.st='flee';m.t=0;m.from=P;m.flee=3;bubble(m,pick(['Doe normaal!','Gek.']))}}
  else if(id==='strooi'){if(!a.cop&&m.arch!=='zakenman'&&!m.fixed&&k<6){k++;m.back='walk';m.st='scramble';m.t=0;m.grab=0;const an=rr(0,6.28),r=rr(.8,2.2);m.tx=P.x+Math.sin(an)*r;m.tz=P.z+Math.cos(an)*r;if(!m.strooi){m.strooi=1;got+=2}}
    else if(a.cop&&!k)bubble(m,'Dat ruim je wel op, hè.',{col:'#a9c8ff'})}
  else if(id==='zit'){if(m.arch==='zwerver'&&!k++)bubble(m,'Kom erbij zitten.')}});
  if(got)rep(P.x,P.z,Math.min(8,got))};
/* ---------- wie is er in de buurt (prompt boven het hoofd) ---------- */
const pr=document.createElement('div');pr.className='sd-npcp';pr.hidden=true;document.body.appendChild(pr);
const ring=new TH.Mesh(new TH.RingGeometry(.55,.72,14),new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;
let ringAdded=false;
function pickTarget(){const P=G.P;if(G.driving||G.talking||R||G.hidden||G.paused||(G.mission&&G.mission()))return null;let best=null,bd=2.4;
  G.NPC.forEach(n=>{if(['flee','call','handsup','fight','follow','scramble','hold','duel'].includes(n.st))return;const d=dist(n,P);if(d>bd)return;const ang=Math.atan2(n.x-P.x,n.z-P.z)-P.ry;const a=Math.abs(Math.atan2(Math.sin(ang),Math.cos(ang)));if(a>1.3&&d>1.2)return;bd=d;best=n});return best}
function promptStep(){if(!ringAdded&&G.ready){G.scene().add(ring);ringAdded=true}const n=pickTarget();target=n;G.lookNpc=n||null;
  const door=G.near&&Math.hypot(G.P.x-G.near.door.x,G.P.z-G.near.door.z);if(n&&door!=null&&door<dist(n,G.P)){target=null}
  if(!target){pr.hidden=true;ring.visible=false;return}ring.visible=true;ring.position.set(n.x,.06,n.z);V3.set(n.x,2.7,n.z).project(G.camera());
  pr.hidden=false;pr.style.left=(V3.x*.5+.5)*innerWidth+'px';pr.style.top=(-V3.y*.5+.5)*innerHeight+'px';pr.style.setProperty('--c',A[n.arch].col);const kn=G.volk&&n.rid&&G.volk.rec(n.rid);pr.innerHTML=`<kbd>${touch?'Tik':'E'}</kbd><span>${E(kn&&kn.k?n.nm:A[n.arch].n)}</span>`}
pr.addEventListener('click',()=>{if(target)talk(target)});
// E / Spatie: eerst verstoppen (stad-police), dan praten. Een deur die dichterbij is gaat voor.
G.interact=function(){if(R)return true;if(G.police&&G.police.tryHide&&G.police.tryHide())return true;if(target){talk(target);return true}return false};
// tik op iemand in de wereld: ook praten
G.canvas&&G.canvas.addEventListener('pointerup',e=>{if(!target||e.button)return});
G.npcDots=()=>{const out=[],ns=perk('neus');if(R)out.push({x:R.n.x,z:R.n.z,c:'#ffd35a'});G.NPC.forEach(n=>{if(ns&&n.klant&&n.st==='walk'&&dist(n,G.P)<50)out.push({x:n.x,z:n.z,c:'#3fe395'});if(n.st==='call')out.push({x:n.x,z:n.z,c:'#ffd35a'});else if(n.arch==='agent'&&dist(n,G.P)<70)out.push({x:n.x,z:n.z,c:'#4d7dff'})});return out};
/* ---------- praatjes op straat ---------- */
let chatT=4;function chatter(dt){chatT-=dt;if(chatT>0)return;chatT=rr(5,10);const near=G.NPC.filter(n=>n.st==='walk'&&dist(n,G.P)<16&&dist(n,G.P)>3);if(!near.length)return;const n=pick(near),a=A[n.arch];
  const L=G.night>.55?['Koud, hè.','Nog één biertje dan.','Waar is mijn fiets?','Wat een stilte.']:(a.talk||[]).map(t=>t.split(/[.?!]/)[0]).filter(t=>t.length<26).concat(['Hoi!','Goedemiddag.','Pff, druk.']);bubble(n,pick(L))}
/* ---------- elke frame ---------- */
let tt=0;const _of=G.onFrame;
G.npcFrame=function(dt){roofStep(dt);bubStep(dt);prtStep(dt);chatter(dt);tt+=dt;if(tt>.08){tt=0;promptStep()}};
const wait=setInterval(()=>{if(!G.ready)return;clearInterval(wait);setupFixed();const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)G.npcFrame(dt)}},200);
G.npcA=A;G.roofRef=roofRef;
})();
