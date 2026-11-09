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
 burger:{n:'Voorbijganger',col:'#a9dcff',wallet:.6,tough:2,call:.45,look:null,names:['Peter','Linda','Ahmed','Marieke','Joost','Fatima','Rik'],
  talk:['Druk vandaag, hè?','Pas op je tas hier, hoor.','Heb je dat nieuws gezien? Weer een overval.','Mooi weer voor de tijd van het jaar.']}};
const TIPS=['Met een bivakmuts op herkent niemand je. Getuigen bellen dan minder snel.','In de stegen tussen de panden kun je je verstoppen achter een container.','\'s Nachts zien minder mensen wat je doet.','De heler bij Het Contact koopt alles wat je op straat vindt.','Bij Notaris De Sleutel koop je grond in Oostland.','Wie de politie belt, kun je nog tegenhouden. Als je snel bent.','Politieauto\'s kunnen niet door de stegen.','Hoe meer respect je in een wijk hebt, hoe minder mensen er de politie bellen.'];
// welke soorten waar (en wanneer) lopen
function archFor(x,z){const d=M.districtAt(x,z),night=G.night>.55,W={burger:3,toerist:1,student:1,oma:.6,zakenman:.4,rivaal:.15,agent:.25};
  if(/Plein|Centrum|Gracht/.test(d)){W.toerist=3.5;W.zakenman=.8}
  if(/Zuidas/.test(d)){W.zakenman=4;W.toerist=.6;W.student=.5}
  if(/Westbuurt|Westkust/.test(d)){W.student=2.5;W.oma=1.5;W.rivaal=.7}
  if(/Haven|Bajes|Noordkade/.test(d)){W.rivaal=1.2;W.toerist=.2;W.oma=.2}
  if(/Strand|Boulevard/.test(d)){W.toerist=3;W.student=1.5}
  if(M.estateAt(x,z)){W.zakenman=1.2;W.oma=1;W.rivaal=0;W.toerist=.4}
  if(night){W.oma*=.2;W.toerist*=.6;W.zakenman*=.5;W.rivaal*=2.2;W.student*=1.4}
  const tot=Object.values(W).reduce((a,b)=>a+b,0);let r=Math.random()*tot;for(const k in W){r-=W[k];if(r<=0)return k}return 'burger'}
function lookFor(arch,base){const a=A[arch];if(!a.look)return base;const L=a.look(),sk=pick(SK);
  return Object.assign({skin:sk,hair:L.hair||pick(['#2a1d14','#151517','#4a2e1a','#8a6a3a']),hat:'none'},L,{arm:L.arm==='skin'?sk:L.arm==='top'?L.top:L.arm,pants:L.pants==='same'?L.top:L.pants})}
G.npcInit=function(n){if(n.arch)return;const a=archFor(n.x,n.z);n.arch=a;n.look=lookFor(a,n.look);const sp=A[a].v;if(sp)n.v=rr(sp[0],sp[1]);n.nm=pick(A[a].names);n.st='walk';n.t=0};
/* ---------- vaste mensen: muzikant op het plein, zwervers in de stegen, helers ---------- */
const FIXED=[];
function addFixed(arch,x,z,ry){const p=M.nearestWalk(x,z,6)||{x,z};const n={x:p.x,z:p.z,dx:0,dz:1,v:0,ph:0,ry:ry||0,turn:99,stop:0,fixed:1,home:{x:p.x,z:p.z,ry:ry||0}};n.arch=arch;n.look=lookFor(arch,null);n.nm=pick(A[arch].names);n.st=A[arch].fixed;n.t=0;G.NPC.push(n);FIXED.push(n);return n}
function setupFixed(){addFixed('muzikant',223.5,111.5,Math.PI);addFixed('heler',300.5,108.5,-Math.PI/2);
  const al=M.alleys.slice().sort((a,b)=>a.cx-b.cx);[al[2],al[Math.floor(al.length/2)],al[al.length-3]].filter(Boolean).forEach(a=>{const ns=a.f==='N'||a.f==='S';addFixed('zwerver',ns?a.x0+.7:a.cx,ns?a.cz:a.z0+.7,ns?Math.PI/2:0)});
  const ha=al.find(a=>a.cx>60&&a.cx<130);if(ha)addFixed('heler',ha.cx,ha.cz,0)}
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
function rep(x,z,d){const k=M.districtAt(x,z),R=repS();R[k]=clamp((R[k]||0)+d,-100,100);if(d&&Math.abs(d)>=3)G.toast&&G.toast((d>0?'+':'')+d+' respect in '+k,d>0?'ok':'bad');return R[k]}
const repAt=(x,z)=>repS()[M.districtAt(x,z)]||0;G.rep={add:rep,at:repAt};
/* ---------- spullen op zak (voor de heler) ---------- */
const zak=()=>{try{return Array.isArray(S.stadZak)?S.stadZak:(S.stadZak=[])}catch(e){return []}};
const ITEMS=[['Telefoon',.5],['Horloge',.9],['Gouden ketting',1.2],['Laptop',1],['Portemonnee met pasjes',.4],['Zonnebril',.3],['Oorbellen',.7]];
G.zak=zak;G.zakLeeg=why=>{const z=zak();if(!z.length)return;const n=z.length;z.length=0;try{save()}catch(e){}G.toast&&G.toast((why||'Je spullen zijn in beslag genomen')+' ('+n+')','bad')};
/* ---------- gedrag (staat per persoon) ---------- */
let R=null,target=null;   // R = lopende overval
function face(n,x,z){n.ry=Math.atan2(x-n.x,z-n.z)}
function moveAway(n,from,sp,dt){let dx=n.x-from.x,dz=n.z-from.z;const d=Math.hypot(dx,dz)||1;dx/=d;dz/=d;
  if(!n.fl||n.flT<=0){// kies een vluchtrichting die vrij is
    let best=null,bs=-9;for(let i=0;i<8;i++){const a=Math.atan2(dx,dz)+rr(-1.2,1.2),fx=Math.sin(a),fz=Math.cos(a);if(M.canStand(n.x+fx*2,n.z+fz*2,.3)){const sc=fx*dx+fz*dz;if(sc>bs){bs=sc;best={x:fx,z:fz}}}}n.fl=best||{x:dx,z:dz};n.flT=rr(.6,1.2)}
  n.flT-=dt;const nx=n.x+n.fl.x*sp*dt,nz=n.z+n.fl.z*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;else n.flT=0;if(M.canStand(n.x,nz,.3))n.z=nz;else n.flT=0;
  n.ry=Math.atan2(n.fl.x,n.fl.z);n.ph+=dt*sp*1.25;n.sp=1.3}
G.npcBrain=function(n,dt){const st=n.st||'walk';n.t=(n.t||0)+dt;n.arm=undefined;n.armR=undefined;n.y=0;n.lean=0;
  if(st==='walk'){if(n.arch==='agent'&&copWatch(n,dt))return true;return false}
  if(st==='talk'){n.sp=0;face(n,G.P.x,G.P.z);if(!K.dialogOpen()&&n.t>.4){n.st=n.fixed?A[n.arch].fixed:'walk';n.t=0}return true}
  if(st==='handsup'){n.sp=0;face(n,G.P.x,G.P.z);n.arm=-2.8;n.armR=-2.8;if(n.t>12){n.st='flee';n.t=0}return true}
  if(st==='flee'){moveAway(n,n.from||G.P,4.6,dt);n.arm=-1;n.armR=-1;if(n.t>(n.flee||6)){n.st=n.fixed?A[n.arch].fixed:'walk';n.t=0;if(n.fixed){n.x=n.home.x;n.z=n.home.z;n.ry=n.home.ry}}return true}
  if(st==='call'){n.sp=0;face(n,G.P.x,G.P.z);n.armR=-2.5;if(dist(n,G.P)<2.3&&!G.driving){n.st='flee';n.t=0;n.from=G.P;bubble(n,'Nee! Niet doen!');G.toast&&G.toast('Je hield de beller tegen','ok');G.snd&&G.snd.fx('grab');return true}
    if(n.t>=n.callT){n.st='flee';n.t=0;n.from=G.P;bubble(n,'Politie? Kom snel!',{col:'#a9c8ff'});G.police&&G.police.report(n.cx,n.cz,{why:n.why||'straatroof',stars:n.stars||1,mask:n.masked})}return true}
  if(st==='cower'){n.sp=0;n.arm=-2.2;n.armR=-2.2;n.y=-.25;if(n.t>5){n.st='walk';n.t=0}return true}
  if(st==='follow'){const d=dist(n,G.P);if(d>1.6){const dx=G.P.x-n.x,dz=G.P.z-n.z,sp=Math.min(3.2,d*1.4),nx=n.x+dx/d*sp*dt,nz=n.z+dz/d*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;n.ry=Math.atan2(dx,dz);n.ph+=dt*sp*1.25;n.sp=Math.min(1,sp/3)}else n.sp=0;
    if(n.t>n.followT){n.st='walk';n.t=0;helpDone(n)}return true}
  if(st==='sit'){n.sp=0;n.y=-.42;n.lean=.25;n.arm=-.6;n.armR=-.6;n.ry=n.home.ry;if(Math.random()<dt*.04&&dist(n,G.P)<14)bubble(n,pick(['Euro\'tje?','Hé, jij daar!','Kleingeld?']));return true}
  if(st==='play'){n.sp=0;n.ry=n.home.ry;n.arm=-1.1+Math.sin(n.t*9)*.25;n.armR=-1.3;n.ph+=dt*2;if(Math.random()<dt*.05&&dist(n,G.P)<18)bubble(n,'♪ ♫ ♪',{col:'#ffe9a8'});return true}
  if(st==='stand'){n.sp=0;n.ry=n.home.ry+Math.sin(n.t*.5)*.4;n.arm=-.3;n.armR=-.3;return true}
  if(st==='fight'){n.sp=0;face(n,G.P.x,G.P.z);n.arm=-1.6+Math.sin(n.t*14)*.6;n.armR=-1.6-Math.sin(n.t*14)*.6;if(n.t>.9){n.st='flee';n.t=0;n.from=G.P}return true}
  return false};
/* ---------- agenten op straat: zien ze iets, dan begint de achtervolging ---------- */
function copWatch(n,dt){n.cw=(n.cw||0)-dt;if(n.cw>0)return false;n.cw=.4;const P=G.P,d=dist(n,P);if(d>16||G.driving)return false;
  const lv=typeof S!=='undefined'&&S.wanted?(typeof S.wanted==='object'?(S.wanted.lv||1):1):0;
  if((lv>0&&d<11&&los(n,P)&&!(G.police&&G.police.active()))&&!G.hidden){bubble(n,'Hé! Jou ken ik!',{col:'#a9c8ff'});G.snd&&G.snd.fx('whistle');G.police&&G.police.start({stars:Math.min(3,lv),why:'gezocht',at:n,wanted:1});n.st='walk';return false}
  return false}
/* ---------- getuigen ---------- */
// x,z = waar het gebeurt; victim = het slachtoffer; stars = hoe zwaar
function crime(x,z,o){o=o||{};const night=G.night>.55,Rr=night?10:14,masked=G.P.look&&G.P.look.hat==='mask',pt={x,z};let callers=0;
  rep(x,z,o.rep!=null?o.rep:-2);
  G.NPC.forEach(n=>{if(n===o.victim||n.st==='call')return;const d=dist(n,pt);if(d>Rr||!los(n,pt))return;const a=A[n.arch]||A.burger;
    if(a.cop){if(!(G.police&&G.police.active())){bubble(n,'Staan blijven!',{col:'#a9c8ff'});G.snd&&G.snd.fx('whistle');G.police&&G.police.start({stars:o.stars||1,why:o.why||'straatroof',at:n})}return}
    const rp=repAt(x,z),pc=a.call*(masked?.5:1)*(1-rp/200)*(callers<2?1:0);
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
  const a=A[n.arch],w=vk(),fight=Math.random()<Math.max(0,(a.tough-w))*.08;n.t=0;
  G.shake&&G.shake(.35);G.snd&&G.snd.fx('grab');G.pArm=-1.5;
  if(fight){n.st='fight';bubble(n,pick(['Blijf van me af!','Probeer het maar!','Rot op!']),{col:'#ff9a9a'});setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.9);G.hitStop=.08;const hp=Math.round(rr(5,15));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.6;G.pArm=0;G.toast('Hij verzet zich! Je krijgt een duw (−'+hp+' gezondheid)','bad');if(navigator.vibrate)try{navigator.vibrate(60)}catch(e){};try{save()}catch(e){}},500);crime(n.x,n.z,{victim:n,why:'straatroof',stars:1});return}
  n.st='handsup';bubble(n,pick(['Niet schieten!','Oké, oké!','Rustig!','Neem alles!']),{col:'#ffe0a0'});
  R={n,c,t:0,need:clamp(2.6-.25*w,1,2.6)};hold(true);crime(n.x,n.z,{victim:n,why:'straatroof',stars:G.police&&G.police.active()?2:1})}
function roofStep(dt){if(!R)return;const n=R.n,d=dist(n,G.P);G.pArm=-1.5;
  if(d>3||G.driving){bubble(n,'Hè hè.');n.st='flee';n.t=0;n.from=G.P;R=null;hold(false);G.pArm=0;G.toast('Overval afgebroken','bad');return}
  const h=!!(G.K[' ']||G.K.e||G.actHold);if(h)R.t+=dt;else R.t=Math.max(0,R.t-dt*.6);holdBar(R.t/R.need);
  if(R.t>=R.need){const c=R.c,a=A[n.arch],al=(G.alert&&G.alert())||0,g=Math.max(1,Math.floor(rnd(c.min,c.max)*(typeof lootMult==='function'?lootMult():1)*(typeof crLootK==='function'?crLootK(c):1)*a.wallet*(1-al/200)));
    let cash=g,item=null;if(Math.random()<.3&&zak().length<6){const it=pick(ITEMS);item={n:it[0],v:Math.max(5,Math.round(g*.6*it[1]))};cash=Math.round(g*.5);zak().push(item)}
    S.cash+=cash;if(typeof addZwart==='function')addZwart(cash);if(typeof addXp==='function')addXp(Math.max(1,Math.round(c.xp*.75)));if(typeof addHeat==='function')addHeat(rnd(2,4));S.stats=S.stats||{};S.stats.roof=(S.stats.roof||0)+1;
    try{save()}catch(e){}G.snd&&G.snd.fx('cash');G.hitStop=.07;G.shake&&G.shake(.4);burst(n.x,1.4,n.z,'#3fe395',10);float('+'+fmt(cash)+(item?' + '+item.n.toLowerCase():''),n.x,n.z);
    if(navigator.vibrate)try{navigator.vibrate(40)}catch(e){}
    n.st='flee';n.t=0;n.from=G.P;n.flee=8;n.robbed=1;bubble(n,pick(['Help! Overval!','Politie!','Mijn tas!']),{col:'#ff9a9a'});if(A[n.arch].scream||Math.random()<.5)G.snd&&G.snd.fx('scream');
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
function helpDone(n){bubble(n,'Dank je wel, jongen!',{col:'#ffe0a0'});const g=Math.round(rr(2,12));S.cash+=g;if(typeof addXp==='function')addXp(2);rep(n.x,n.z,5);S.stats=S.stats||{};S.stats.oma=(S.stats.oma||0)+1;try{save()}catch(e){}float('+'+fmt(g)+' · respect',n.x,n.z,'#ffd35a');G.snd&&G.snd.fx('ok')}
function tipMoney(n,amt){if(S.cash<amt){G.toast('Niet genoeg contant geld','bad');return false}S.cash-=amt;try{save()}catch(e){}rep(n.x,n.z,2);G.snd&&G.snd.fx('coin');float('−'+fmt(amt),G.P.x,G.P.z,'#ffd35a');return true}
/* ---------- gesprek ---------- */
function portraitLook(n){const L=n.look||{};return Object.assign({},L,{bg:'#1a1d23'})}
function opener(n){const a=A[n.arch],rp=repAt(n.x,n.z);if(a.cop&&typeof S!=='undefined'&&S.wanted)return 'Wacht eens even... jou ken ik van het bureau.';
  if(rp>40&&!a.cop)return pick(['Hé, jij bent die van '+M.districtAt(n.x,n.z)+'. Respect.','Ah, jij weer. Alles goed?']);if(rp<-40&&!a.cop)return pick(['Blijf uit mijn buurt.','Jij bent die gast die hier mensen beroofd. Wegwezen.']);
  if(n.robbed)return 'Jij! Jij hebt me beroofd!';return pick(a.talk)}
function talk(n){const a=A[n.arch];G.talking=true;n.st='talk';n.t=0;target=null;G.snd&&G.snd.fx('blip');
  const rw=roofWhy(n),wpn=weapon(),ch=[];
  ch.push({t:'Praten',ic:K.ic.talk,f:()=>{const tip=Math.random()<.45;K.say(tip?pick(TIPS):pick(a.talk),tip?'blij':null)}});
  if(n.arch==='toerist')ch.push({t:'Foto voor ze maken',ic:K.ic.photo,dis:n.photo,why:'Al gedaan',f:()=>{n.photo=1;const g=Math.round(rr(3,15));S.cash+=g;rep(n.x,n.z,2);try{save()}catch(e){}G.snd&&G.snd.fx('coin');float('+'+fmt(g),n.x,n.z);K.say('Thank you! Hier, voor de moeite.','blij')}});
  if(n.arch==='oma')ch.push({t:'Even helpen met de boodschappen',ic:K.ic.hand,dis:n.helped,why:'Al geholpen',f:()=>{n.helped=1;K.say('Wat aardig! Loop je even een stukje mee?','blij');setTimeout(()=>{K.closeDialog(true);n.st='follow';n.t=0;n.followT=8},1300)}});
  if(n.arch==='zwerver')ch.push({t:'Geef '+fmt(10),ic:K.ic.money,dis:n.gave,why:'Al gegeven',f:()=>{if(!tipMoney(n,10))return;n.gave=1;K.say(pick(TIPS),'blij')}});
  if(n.arch==='muzikant')ch.push({t:'Fooi geven · '+fmt(5),ic:K.ic.music,dis:n.gave,why:'Al gegeven',f:()=>{if(!tipMoney(n,5))return;n.gave=1;K.say('Dank je! Deze is voor jou.','blij');[523,659,784,659,523].forEach((f,i)=>setTimeout(()=>G.snd&&G.snd.fx('blip'),i*150))}});
  if(n.arch==='heler'){const z=zak(),tot=z.reduce((s,i)=>s+i.v,0);ch.push({t:z.length?'Spullen verkopen · '+fmt(tot):'Spullen verkopen',ic:K.ic.bag,dis:!z.length,why:'Je hebt niets op zak',sub:z.length?z.map(i=>i.n).join(', '):'',f:()=>{S.cash+=tot;if(typeof addZwart==='function')addZwart(tot);z.length=0;S.stats=S.stats||{};S.stats.heling=(S.stats.heling||0)+1;try{save()}catch(e){}G.snd&&G.snd.fx('cash');float('+'+fmt(tot),n.x,n.z);K.say('Mooi spul. Hier, tel maar na.','blij',[{t:'Bedankt',ic:K.ic.hand,f:()=>K.closeDialog()}])}})}
  if(a.fight)ch.push({t:'Intimideren',ic:K.ic.scare,risk:wpn?1:3,f:()=>{if(wpn&&Math.random()<.5+vk()*.06){K.say('Oké, oké, rustig maar. Ik ga al.','bang');rep(n.x,n.z,4);setTimeout(()=>{K.closeDialog(true);n.st='flee';n.t=0;n.from=G.P},1100)}
    else{K.say('Wat zei je? Kom maar op!','boos');setTimeout(()=>{K.closeDialog(true);n.st='fight';n.t=0;setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.9);G.hitStop=.08;const hp=Math.round(rr(6,16));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.5;try{save()}catch(e){}G.toast('Klap gehad (−'+hp+' gezondheid)','bad')},450)},800)}}});
  if(!a.cop&&a.wallet)ch.push({t:'Beroven',ic:K.ic.rob,risk:n.arch==='zakenman'||n.arch==='rivaal'?3:2,dis:!!rw,why:rw,sub:!rw&&wpn?'Met je '+wpn.n.toLowerCase():'',f:()=>roofStart(n)});
  ch.push({t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()});
  K.dialog({name:n.nm,role:a.n+(n.robbed?' · beroofd':''),look:portraitLook(n),mood:n.robbed?'boos':a.cop?'neutraal':null,lines:[opener(n)],col:a.col,choices:ch,onClose:()=>{G.talking=false;if(n.st==='talk'){n.st=n.fixed?A[n.arch].fixed:'walk';n.t=0}}});
  if(a.cop&&typeof S!=='undefined'&&S.wanted){setTimeout(()=>{K.closeDialog(true);G.police&&G.police.start({stars:Math.min(3,S.wanted.lv||1),why:'gezocht',at:n,wanted:1})},1600)}}
/* ---------- wie is er in de buurt (prompt boven het hoofd) ---------- */
const pr=document.createElement('div');pr.className='sd-npcp';pr.hidden=true;document.body.appendChild(pr);
const ring=new TH.Mesh(new TH.RingGeometry(.55,.72,14),new TH.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;
let ringAdded=false;
function pickTarget(){const P=G.P;if(G.driving||G.talking||R||G.hidden||G.paused||(G.mission&&G.mission()))return null;let best=null,bd=2.4;
  G.NPC.forEach(n=>{if(['flee','call','handsup','fight','follow'].includes(n.st))return;const d=dist(n,P);if(d>bd)return;const ang=Math.atan2(n.x-P.x,n.z-P.z)-P.ry;const a=Math.abs(Math.atan2(Math.sin(ang),Math.cos(ang)));if(a>1.3&&d>1.2)return;bd=d;best=n});return best}
function promptStep(){if(!ringAdded&&G.ready){G.scene().add(ring);ringAdded=true}const n=pickTarget();target=n;
  const door=G.near&&Math.hypot(G.P.x-G.near.door.x,G.P.z-G.near.door.z);if(n&&door!=null&&door<dist(n,G.P)){target=null}
  if(!target){pr.hidden=true;ring.visible=false;return}ring.visible=true;ring.position.set(n.x,.06,n.z);V3.set(n.x,2.7,n.z).project(G.camera());
  pr.hidden=false;pr.style.left=(V3.x*.5+.5)*innerWidth+'px';pr.style.top=(-V3.y*.5+.5)*innerHeight+'px';pr.style.setProperty('--c',A[n.arch].col);pr.innerHTML=`<kbd>${touch?'Tik':'E'}</kbd><span>${E(A[n.arch].n)}</span>`}
pr.addEventListener('click',()=>{if(target)talk(target)});
// E / Spatie: eerst verstoppen (stad-police), dan praten. Een deur die dichterbij is gaat voor.
G.interact=function(){if(R)return true;if(G.police&&G.police.tryHide&&G.police.tryHide())return true;if(target){talk(target);return true}return false};
// tik op iemand in de wereld: ook praten
G.canvas&&G.canvas.addEventListener('pointerup',e=>{if(!target||e.button)return});
G.npcDots=()=>{const out=[];if(R)out.push({x:R.n.x,z:R.n.z,c:'#ffd35a'});G.NPC.forEach(n=>{if(n.st==='call')out.push({x:n.x,z:n.z,c:'#ffd35a'});else if(n.arch==='agent'&&dist(n,G.P)<70)out.push({x:n.x,z:n.z,c:'#4d7dff'})});return out};
/* ---------- praatjes op straat ---------- */
let chatT=4;function chatter(dt){chatT-=dt;if(chatT>0)return;chatT=rr(5,10);const near=G.NPC.filter(n=>n.st==='walk'&&dist(n,G.P)<16&&dist(n,G.P)>3);if(!near.length)return;const n=pick(near),a=A[n.arch];
  const L=G.night>.55?['Koud, hè.','Nog één biertje dan.','Waar is mijn fiets?','Wat een stilte.']:(a.talk||[]).map(t=>t.split(/[.?!]/)[0]).filter(t=>t.length<26).concat(['Hoi!','Goedemiddag.','Pff, druk.']);bubble(n,pick(L))}
/* ---------- elke frame ---------- */
let tt=0;const _of=G.onFrame;
G.npcFrame=function(dt){roofStep(dt);bubStep(dt);prtStep(dt);chatter(dt);tt+=dt;if(tt>.08){tt=0;promptStep()}};
const wait=setInterval(()=>{if(!G.ready)return;clearInterval(wait);setupFixed();const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)G.npcFrame(dt)}},200);
G.npcA=A;G.roofRef=roofRef;
})();
