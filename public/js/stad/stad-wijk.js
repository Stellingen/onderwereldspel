// Pixelstad: wijken. De stad (buiten Oostland) bestaat uit zeven wijken, elk met een wijkbaas van een andere bende.
// - Respect: wat je in een wijk doet telt (S.stadRep): mensen helpen, complimenten, fooien, tags zetten en rivalen verslaan geven
//   respect, mensen beroven kost respect.
// - Tags: op de muren in de stegen kun je jouw tag zetten (een timing-spelletje, 2 energie, één keer per dag per muur). Getuigen
//   kunnen 112 bellen, net als bij andere dingen die niet mogen.
// - Wijkbaas: heb je genoeg respect, dan kun je hem uitdagen. Een vuistgevecht: ontwijk zijn klap in de goede richting en sla terug.
//   Win je, dan is de wijk van jou: minder getuigen die bellen, minder rivalen op straat en elke dag beschermgeld.
// - Beschermgeld: drie zaken per wijk betalen elke dag (ophalen bij de deur, 1 energie, zwart geld op de schaal van je straatklussen).
//   Kom je dagen niet langs, dan zakt je respect en kun je de wijk weer kwijtraken.
// - Vechtclub De Kooi in de haven: vijf tegenstanders op een rij, elke dag opnieuw. Inleg, prijzengeld, 4 energie per gevecht.
// - Rivalen op straat: uitdagen (emote of in een gesprek) wordt een echt gevecht.
// Bewaard in S.stadWijk = {wijk:{own, since, seen, col:{zaak:dag}, tags:{muur:dag}, cd}} en S.stadKooi = {d:dag, n:gewonnen vandaag, top}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,X=STAD_GFX,E=K.E,T=M.T;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sv=()=>{try{save()}catch(e){}};
const perk=k=>G.perk?G.perk(k):0;
const obj=(k,d)=>{try{if(!S[k]||typeof S[k]!=='object')S[k]=d;return S[k]}catch(e){return d}};
const dayN=()=>Math.floor((Date.now()-6*3600e3+3600e3)/864e5);       // dag wisselt om 6 uur (wintertijd)
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k);
const fl=(t,x,z,c)=>G.fx2&&G.fx2.float(t,x,z,c);
const REQ=40;
const WIJK=[
 {id:'west',n:'Westbuurt',d:['Westbuurt','Westkust'],c:[74.5,160],baas:'Dikke Dries',lv:1,col:'#3fe395',look:{top:'#2f5d3a',pants:'#1d1d1f',hat:'beanie',hatC:'#151517',beard:1}},
 {id:'noord',n:'Noordkant',d:['Villapark','Noorderpark','Noordkade','De Bajes'],c:[140,24],baas:'Lange Loes',lv:2,col:'#7fd1c7',look:{top:'#2f6a8a',pants:'#151517',hat:'none',hair:'#c9a24a',long:1}},
 {id:'strand',n:'Boulevard',d:['Boulevard','Het Strand'],c:[70,227],baas:'Surf-Sjors',lv:2,col:'#ffd166',look:{top:'#f0b23a',arm:'skin',pants:'#3a5a8a',hat:'cap',hatC:'#e8584a',hair:'#c9a24a'}},
 {id:'centrum',n:'Centrum',d:['Centrum','De Gracht'],c:[135.5,165],baas:'Kale Karel',lv:3,col:'#b8a1ff',look:{top:'#3a2a4a',pants:'#1d1d1f',hat:'bald',chain:1}},
 {id:'plein',n:'Het Plein',d:['Het Plein','Oud-Zuid'],c:[229,186.5],baas:'Mooie Mo',lv:4,col:'#ff7fb3',look:{top:'#e8e4da',pants:'#2a2c30',hat:'hat',hatC:'#e8e4da',hair:'#151517',chain:1}},
 {id:'haven',n:'De Haven',d:['De Haven','Havenkanaal'],c:[332,180],baas:'IJzeren Inge',lv:5,col:'#ff7a1a',look:{top:'#5a5d63',pants:'#2a2c30',hat:'beanie',hatC:'#ff7a1a',hair:'#8a2f1a'}},
 {id:'zuidas',n:'Zuidas',d:['Zuidas'],c:[279,93.5],baas:'De Advocaat',lv:6,col:'#3ad6ff',look:{top:'#1f2430',pants:'#1f2430',hat:'none',hair:'#8a8c90',tie:'#c9a227',glasses:1}}];
const byD={};WIJK.forEach(w=>w.d.forEach(d=>byD[d]=w));
const wijkAt=(x,z)=>byD[M.districtAt(x,z)]||null;
const st=w=>{const W=obj('stadWijk',{});if(!W[w.id]||typeof W[w.id]!=='object')W[w.id]={};const s=W[w.id];if(!s.col)s.col={};if(!s.tags)s.tags={};return s};
const resp=w=>{const R=(S.stadRep&&typeof S.stadRep==='object')?S.stadRep:{};return clamp(w.d.reduce((a,d)=>a+(R[d]||0),0),-100,100)};
const own=w=>!!st(w).own;
G.wijkOwn=(x,z)=>{try{const w=wijkAt(x,z);return !!(w&&own(w))}catch(e){return false}};
/* =================== vechten =================== */
const skl=id=>{try{return (S.skills&&S.skills[id])||0}catch(e){return 0}};
const power=()=>1+.004*(skl('conditie')+skl('speed'))+.12*perk('vuist');
let fighting=false;
// n = tegenstander (iemand op straat of een vaste figuur), o = {hp,dmg,win,block,name,sub}
async function fight(n,o){if(fighting||!G.mini)return null;fighting=true;const P=G.P;K.closeDialog&&K.closeDialog(true);G.stopPath&&G.stopPath();
  // tegenover elkaar zetten
  const a=Math.atan2(P.x-n.x,P.z-n.z),q=M.nearestWalk(n.x+Math.sin(a)*1.7,n.z+Math.cos(a)*1.7,2);if(q&&Math.hypot(q.x-P.x,q.z-P.z)<6){P.x=q.x;P.z=q.z}P.vx=P.vz=0;P.ry=Math.atan2(n.x-P.x,n.z-P.z);
  const prev=n.st;n.st='duel';n.duel='klaar';n.t=0;G.pose='klaar';G.poseLock=true;G.camK=.62;G.camOff={x:(n.x-P.x)/2,z:(n.z-P.z)/2};G.lookAt=n;let side=0;
  const flash=(k,ms)=>{n.duel=k;setTimeout(()=>{if(n.st==='duel'&&n.duel===k)n.duel='klaar'},ms||260)},pose=(k,ms)=>{G.pose=k;setTimeout(()=>{if(G.pose===k&&fighting)G.pose='klaar'},ms||220)};
  const r=await G.mini.vecht({name:o.name||n.nm,short:(o.name||n.nm).split(' ').pop(),sub:o.sub||'Ontwijk de klap, sla dan terug',hp:o.hp,dmg:o.dmg,win:o.win,block:o.block,pow:power(),on:ev=>{
    if(ev==='jab'||ev==='crit'){side^=1;pose(side?'slaL':'slaR',200);flash('au',240);G.fx2&&G.fx2.burst(n.x,1.5,n.z,ev==='crit'?'#ffd35a':'#f1efe9',ev==='crit'?7:3);G.snd&&G.snd.fx('punch')}
    else if(ev==='blok'){side^=1;pose(side?'slaL':'slaR',200);flash('blok',300)}
    else if(ev.startsWith('tele')){n.duel='tele'}
    else if(ev.startsWith('dodge')){const d=ev.split(':')[1];pose(d==='L'?'duikL':d==='R'?'duikR':'blok',700);flash('sla',320);G.snd&&G.snd.fx('whoosh')}
    else if(ev==='hit'){flash('sla',300);pose('au',380);G.fx2&&G.fx2.burst(P.x,1.5,P.z,'#ff5a6a',5)}
    else if(ev==='win'){n.duel='ko'}}});
  G.poseLock=false;G.pose=null;G.camK=null;G.camOff=null;G.lookAt=null;fighting=false;
  if(r==='cancel'){n.st=prev==='duel'?'walk':prev;n.t=0;return {ok:false,cancel:true}}
  if(r.ok){n.st='duel';n.duel='ko';n.t=0;G.hitStop=.1;G.shake&&G.shake(.8);setTimeout(()=>{if(G.doEmote)G.doEmote('juich')},300)}
  else{n.st='duel';n.duel='klaar';G.pose='au';G.frozen=1.1;setTimeout(()=>{if(G.pose==='au')G.pose=null},1000);const hp=Math.round(rr(8,14));try{S.hp=Math.max(8,S.hp-hp);sv()}catch(e){}}
  return r}
// knokken met een rivaal op straat
G.knok=async function(n){if(fighting||n.beaten||G.driving)return;if(G.police&&G.police.active()){return}
  // te moe om te vechten: je krijgt gewoon een klap
  if(S.energy<2){n.st='fight';n.t=0;setTimeout(()=>{G.snd&&G.snd.fx('hit');G.shake&&G.shake(.8);const hp=Math.round(rr(6,14));S.hp=Math.max(10,(S.hp||100)-hp);G.frozen=.5;sv();G.toast('Te moe om terug te slaan (−'+hp+' gezondheid)','bad')},420);return}S.energy-=2;
  G.bubble&&G.bubble(n,pick(['Kom maar op!','Jij vraagt erom.','Dit is onze straat.']),{col:'#ff9a9a'});
  const r=await fight(n,{name:n.nm,hp:58,dmg:11,win:.8,block:.22});if(!r||r.cancel){if(r&&r.cancel){n.st='walk';G.rep&&G.rep.add(n.x,n.z,-1)}return}
  if(r.ok){n.beaten=1;const g=Math.max(5,zS(.3));S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(4);G.rep&&G.rep.add(n.x,n.z,5);G.ev&&G.ev('knok');fl('+'+fmt(g)+' · respect',n.x,n.z,'#ffd35a');sv();
    setTimeout(()=>{n.st='flee';n.t=0;n.from=G.P;n.flee=7;G.bubble&&G.bubble(n,pick(['Oké, oké!','Ik ga al.','Je hebt gewonnen.']))},1500)}
  else{G.rep&&G.rep.add(n.x,n.z,-2);G.toast('Je bent tegen de grond gegaan','bad');setTimeout(()=>{n.st='walk';n.t=0;G.bubble&&G.bubble(n,pick(['Volgende keer beter.','Wegwezen.']))},900)}};
/* =================== tags op de muren =================== */
const TAGS=[];let tagTex=null;
function myTagTex(col){const cv=document.createElement('canvas');cv.width=44;cv.height=20;const c=cv.getContext('2d'),nm=String(window.__USER__||'JIJ').replace(/[^A-Za-z0-9]/g,'').slice(0,4).toUpperCase()||'JIJ';
  c.font='900 15px Impact,"Arial Black",sans-serif';c.textBaseline='middle';c.textAlign='center';c.lineJoin='round';c.strokeStyle='#111';c.lineWidth=4;c.strokeText(nm,22,10);c.fillStyle=col;c.fillText(nm,22,10);c.fillStyle='#fff';c.fillRect(6,15,2,3);c.fillRect(30,16,2,4);c.fillStyle=col;c.fillRect(14,16,2,4);
  const im=c.getImageData(0,0,44,20),d=im.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>110?255:0;c.putImageData(im,0,0);return X.nearestTex(cv)}
// muren: de graffiti in de stegen, en waar een wijk geen stegen heeft een blinde zijmuur van een pand
function wallCands(w){const out=[];M.buildings.forEach(b=>{if(wijkAt((b.x0+b.x1)/2,(b.z0+b.z1)/2)!==w)return;const mx=(b.x0+b.x1)/2,mz=(b.z0+b.z1)/2;
    [[mx,b.z1,0,0,1],[mx,b.z0,Math.PI,0,-1],[b.x1,mz,Math.PI/2,1,0],[b.x0,mz,-Math.PI/2,-1,0]].forEach(([x,z,rot,dx,dz])=>{if((dx?b.z1-b.z0:b.x1-b.x0)<5)return;const sx=x+dx*1.15,sz=z+dz*1.15;if(!M.canStand(sx,sz,.35))return;const t=M.at(Math.floor(sx),Math.floor(sz));if(t===T.ROAD||t===T.BRIDGE)return;
      if(M.places.some(p=>Math.hypot(p.door.x-sx,p.door.z-sz)<5))return;out.push({x:sx,z:sz,wx:x+dx*.12,wz:z+dz*.12,rot})})});return out}
function setupTags(){const per={};M.props.forEach((p,i)=>{if(p.k!=='graffiti')return;const w=wijkAt(p.x,p.z);if(!w)return;const sx=p.ns?p.x+1.15:p.x,sz=p.ns?p.z:p.z+1.15,q=M.nearestWalk(sx,sz,2);if(!q)return;(per[w.id]=per[w.id]||[]).push({x:q.x,z:q.z,wx:p.ns?p.x+.12:p.x,wz:p.ns?p.z:p.z+.12,rot:p.ns?Math.PI/2:0})});
  WIJK.forEach(w=>{let L=per[w.id]||[];if(L.length>3)L=[L[0],L[Math.floor(L.length/2)],L[L.length-1]];
    if(L.length<3){const C=wallCands(w).filter(c=>L.every(o=>Math.hypot(o.x-c.x,o.z-c.z)>14));for(let k=0;L.length<3&&C.length;k++){const c=C.splice(Math.floor(C.length*((k*.37+.2)%1)),1)[0];if(L.every(o=>Math.hypot(o.x-c.x,o.z-c.z)>14))L.push(c)}}
    L.forEach((c,k)=>{const m=new TH.Mesh(new TH.PlaneGeometry(2.6,1.2),new TH.MeshBasicMaterial({transparent:true,alphaTest:.5}));m.position.set(c.wx,1.55,c.wz);m.rotation.y=c.rot;m.visible=false;G.scene().add(m);
      const t={w,i:k,x:c.x,z:c.z,m,wx:c.wx,wz:c.wz};TAGS.push(t);
      G.spot({k:'tag',x:c.x,z:c.z,r:1.9,n:'Tag zetten',sub:w.n,col:w.col,h:2.3,show:()=>st(w).tags[k]!==dayN(),act:()=>tag(t),dot:w.col,dotR:50,dotIf:()=>perk('neus')>0&&st(w).tags[k]!==dayN(),map:{n:'Tagmuur · '+w.n,ic:K.ic.spuit,c:w.col,pri:1},mapIf:()=>st(w).tags[k]!==dayN()})})});tagShow()}
function tagShow(){const d=dayN();TAGS.forEach(t=>{const v=st(t.w).tags[t.i];const on=v!=null&&d-v<4;if(on&&!t.m.material.map){if(!tagTex)tagTex={};const key=t.w.col;t.m.material.map=tagTex[key]||(tagTex[key]=myTagTex(key));t.m.material.needsUpdate=true}t.m.visible=on})}
async function tag(t){if(G.driving||G.talking||(G.mini&&G.mini.active()))return;if(G.police&&G.police.active()){G.toast('Niet nu: de politie zit achter je aan','bad');return}if(S.energy<2){G.toast('Te moe: 2 energie nodig','bad');return}
  S.energy-=2;sv();const P=G.P;G.stopPath&&G.stopPath();P.ry=Math.atan2(t.wx-P.x,t.wz-P.z);G.pose='spuit';G.poseLock=true;
  const r=await G.mini.timing({title:'Tag zetten',sub:'Druk als het streepje in het groen staat',n:3,w:.2+.02*perk('vingers'),sp:1.35,allow:1,label:'Spuit!',hit:()=>{G.snd&&G.snd.fx('spray');G.fx2&&G.fx2.burst(t.wx,1.5,t.wz,t.w.col,4)}});
  G.pose=null;G.poseLock=false;if(r==='cancel')return;
  if(!r.ok){G.toast('Verknoeid. De verf druipt van de muur.','bad');G.snd&&G.snd.fx('bad');return}
  st(t.w).tags[t.i]=dayN();st(t.w).seen=dayN();tagShow();G.rep&&G.rep.add(t.x,t.z,7);G.ev&&G.ev('tag');if(typeof addXp==='function')addXp(2);G.snd&&G.snd.fx('ok');fl('Jouw tag · '+t.w.n,P.x,P.z,t.w.col);sv();
  G.crime&&G.crime(t.x,t.z,{why:'graffiti',stars:1,rep:0,soft:1})}
/* =================== beschermgeld =================== */
const SHOPN=['Bakkerij Bol','Slijterij De Kurk','Kapsalon Knip','Stomerij Fris','Tabakszaak','Bloemenhuis','Toko Sari','Fietsenmaker','Snackbar Het Hoekje','Boekhandel','Groenteboer','Slagerij Van Dam','Telefoonwinkel','Wasserette','IJssalon','Drogist','Viswinkel','Schoenmaker','Havenkantine','Scheepswinkel','Strandtent'];
const SHOPS=[];let coinG=null;
function frontPoint(b){const mx=(b.x0+b.x1)/2,mz=(b.z0+b.z1)/2,all={S:[mx,b.z1+1.3],N:[mx,b.z0-1.3],E:[b.x1+1.3,mz],W:[b.x0-1.3,mz]};
  for(const f of (b.front?[b.front,'S','N','E','W']:['S','N','E','W'])){const [x,z]=all[f],t=M.at(Math.floor(x),Math.floor(z));if((t===T.WALK||t===T.PLAZA||t===T.SAND||t===T.DOCK)&&M.canStand(x,z,.35))return {x,z}}return null}
function setupShops(){let ni=0;WIJK.forEach(w=>{const L=M.buildings.filter(b=>!b.pl&&wijkAt((b.x0+b.x1)/2,(b.z0+b.z1)/2)===w).map(b=>({b,p:frontPoint(b)})).filter(o=>o.p&&!M.places.some(pl=>Math.hypot(pl.door.x-o.p.x,pl.door.z-o.p.z)<4));
    let take=[];if(L.length>=3)take=[L[Math.floor(L.length*.15)],L[Math.floor(L.length*.5)],L[Math.floor(L.length*.85)]].map(o=>o.p);else take=L.map(o=>o.p);
    for(let k=take.length;k<3;k++){const a=k*2.1+w.lv,p=M.nearestWalk(w.c[0]+Math.cos(a)*16,w.c[1]+Math.sin(a)*12,14);if(p)take.push(p)}
    take.slice(0,3).forEach((p,i)=>{const s={w,i,x:p.x,z:p.z,n:SHOPN[(ni++)%SHOPN.length]};SHOPS.push(s);
      G.spot({k:'geld',x:p.x,z:p.z,r:2,n:'Beschermgeld',sub:s.n,col:'#ffd35a',h:2.2,show:()=>due(s),act:()=>collect(s),dot:'#ffd35a',dotR:120,dotIf:()=>due(s),map:{n:'Beschermgeld · '+s.n,ic:K.ic.euro,c:'#ffd35a',pri:4,big:1},mapIf:()=>due(s)})})});
  const g=new TH.OctahedronGeometry(.34,0),m=new TH.MeshBasicMaterial({color:0xffd35a});SHOPS.forEach(s=>{s.m=new TH.Mesh(g,m);s.m.scale.set(1,1.3,.35);s.m.position.set(s.x,2.2,s.z);s.m.visible=false;G.scene().add(s.m)})}
const due=s=>own(s.w)&&st(s.w).col[s.i]!==dayN();
const pay=()=>Math.max(5,Math.round(zS(.5)*(1+.15*perk('incasso'))/5)*5);
async function collect(s){if(!due(s)||G.driving||(G.mini&&G.mini.active()))return;if(S.energy<1){G.toast('Te moe','bad');return}if(G.police&&G.police.active()){G.toast('Niet nu','bad');return}
  G.stopPath&&G.stopPath();G.pose='pak';const r=await G.mini.hold({label:'Beschermgeld ophalen',d:1.3,wait:2.5,can:()=>Math.hypot(s.x-G.P.x,s.z-G.P.z)<2.8&&G.pose==='pak'});if(G.pose==='pak')G.pose=null;if(r!=='ok'||!due(s))return;
  const g=pay(),W=st(s.w);S.energy-=1;W.col[s.i]=dayN();W.seen=dayN();S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addHeat==='function')addHeat(1);G.ev&&G.ev('bescherm');G.snd&&G.snd.fx('cash');fl('+'+fmt(g)+' · '+s.n,s.x,s.z,'#ffd35a');
  G.zeg&&G.zeg(pick(['Zo. Tot morgen.','Netjes op tijd.','Dank u vriendelijk.']));if(typeof log==='function')log('Beschermgeld in '+s.w.n+': '+s.n+' betaalt '+fmt(g),'ok');sv();
  if(SHOPS.filter(o=>o.w===s.w).every(o=>!due(o)))G.toast(s.w.n+': alles opgehaald voor vandaag','ok')}
/* =================== wijkbazen =================== */
const BOSS={};
function bossStats(w){return {hp:70+22*w.lv,dmg:11+2.2*w.lv,win:Math.max(.44,.8-.055*w.lv),block:.2+.03*w.lv}}
function setupBosses(){const A=G.npcA;A.wijkbaas={n:'Wijkbaas',col:'#ff3d52',wallet:0,tough:9,call:0,fixed:'stand',look:()=>({top:'#8a1f2a',arm:'top',pants:'#151517',shoe:'#151517',hat:'none',chain:1}),names:['De wijkbaas'],talk:['Dit is mijn wijk.']};
  A.vechter={n:'Vechter',col:'#ff7a1a',wallet:0,tough:9,call:0,fixed:'stand',look:()=>({top:'#2a2c30',arm:'skin',pants:'#8a1f2a',shoe:'#151517',hat:'bald'}),names:['De Kooi'],talk:['Hier wordt gevochten, niet gepraat.']};
  WIJK.forEach(w=>{const p=M.nearestWalk(w.c[0],w.c[1],14);if(!p)return;const n=G.addFixed('wijkbaas',p.x,p.z,rr(0,6.28));n.nm=w.baas;n.wijk=w.id;Object.assign(n.look,w.look,{arm:w.look.arm==='skin'?n.look.skin:(w.look.top||n.look.top)});BOSS[w.id]=n;
    G.spot({k:'baas',x:n.x,z:n.z,r:0,n:w.baas,dot:w.col,dotR:70,dotIf:()=>!own(w)&&resp(w)>=REQ,map:{n:()=>own(w)?w.n+' · van jou':w.n+' · '+w.baas,ic:K.ic.kroon,c:own(w)?'#ffd35a':w.col,pri:3}})})}
G.npcOpen=function(n){if(n.arch==='wijkbaas'){const w=WIJK.find(x=>x.id===n.wijk);if(!w)return '';if(own(w)){const L=SHOPS.filter(s=>s.w===w),d=L.filter(due).length;return d?'Alles rustig, baas. Er liggen nog '+d+' enveloppen voor je klaar in de wijk.':'Alles rustig, baas. Iedereen heeft betaald.'}
    const r=resp(w);return r>=REQ?'Zo zo. Ze praten over jou in '+w.n+'. Denk je dat je mij aankunt?':'Wie ben jij? In '+w.n+' kent niemand jou. Kom terug als je iets voorstelt.'}
  if(n.arch==='vechter')return kooiLine();return ''};
G.npcService=G.npcService||{};
G.npcService.wijkbaas=(n,ch)=>{const w=WIJK.find(x=>x.id===n.wijk);if(!w)return;const W=st(w);
  if(own(w)){const nx=SHOPS.filter(s=>s.w===w&&due(s))[0];if(nx)ch.push({t:'Waar moet ik nog langs?',sub:nx.n,ic:K.ic.euro,f:()=>{K.closeDialog(true);G.setWaypoint&&G.setWaypoint(nx.x,nx.z,'Beschermgeld · '+nx.n)}});return}
  const r=resp(w),cd=(W.cd||0)-Date.now();let why='';if(r<REQ)why='Te weinig respect in '+w.n+' ('+Math.max(0,r)+'/'+REQ+')';else if(cd>0)why='Hij wil je even niet zien: nog '+Math.ceil(cd/60000)+' min';else if(G.police&&G.police.active())why='Niet met de politie in de buurt';else if(S.energy<5)why='Te moe: 5 energie nodig';
  ch.push({t:'Uitdagen om de wijk',sub:why?'':'Vuistgevecht · 5 energie',ic:K.ic.vuist,risk:Math.min(3,1+Math.floor(w.lv/2)),dis:!!why,why,f:()=>challenge(w,n)});
  if(r<REQ)ch.push({t:'Hoe krijg ik respect?',ic:K.ic.star,f:()=>K.say('Zet je tag op de muren in de stegen. Help mensen. Geef een fooi. En laat mijn jongens met rust… of juist niet.',null)})};
async function challenge(w,n){const W=st(w);S.energy-=5;sv();G.bubble&&G.bubble(n,pick(['Dan moet je het zelf weten.','Dit ga je voelen.','Kom maar.']),{col:'#ff9a9a'});
  const r=await fight(n,Object.assign({name:w.baas,sub:'Om '+w.n+' · ontwijk en sla terug'},bossStats(w)));if(!r)return;
  if(r.cancel){W.cd=Date.now()+5*60000;n.st='stand';G.rep&&G.rep.add(n.x,n.z,-5);G.toast('Je loopt weg. Dat onthoudt hij.','bad');sv();return}
  if(r.ok){W.own=1;W.since=Date.now();W.seen=dayN();W.col={};sv();G.ev&&G.ev('wijk');if(typeof addXp==='function')addXp(20+10*w.lv);G.snd&&G.snd.fx('lvl');
    const el=document.createElement('div');el.className='sd-ach sd-lvl';el.innerHTML=`<i>${K.ic.kroon}</i><span><small>Wijk overgenomen</small><b>${E(w.n)}</b><em>${E(w.baas)} werkt nu voor jou</em></span>`;document.body.appendChild(el);setTimeout(()=>el.remove(),4200);
    G.msg&&G.msg('contact',w.n+' is van jou. Drie zaken betalen elke dag beschermgeld. Vergeet niet langs te gaan.',{k:'wijk'},true);if(typeof log==='function')log('Wijk overgenomen in de Pixelstad: '+w.n,'ok');
    setTimeout(()=>{n.st='stand';n.t=0;G.bubble&&G.bubble(n,'Oké… jij bent de baas.',{col:'#ffe0a0'})},2200)}
  else{W.cd=Date.now()+10*60000;G.rep&&G.rep.add(n.x,n.z,-6);G.toast(w.baas+' was te sterk. Probeer het later opnieuw.','bad');sv();setTimeout(()=>{n.st='stand';n.t=0;G.bubble&&G.bubble(n,pick(['Ha! Kom terug als je groot bent.','Dat dacht ik al.']))},800)}}
// elke dag: wie niet langskomt, verliest respect; onder de 15 ben je de wijk kwijt
function upkeep(){const d=dayN(),U=obj('stadWijkU',{});if(U.d===d)return;U.d=d;WIJK.forEach(w=>{const W=st(w);if(!W.own)return;const gone=d-(W.seen||d);if(gone>=3){const R=obj('stadRep',{});R[w.d[0]]=(R[w.d[0]]||0)-6}
    if(resp(w)<15){W.own=0;G.msg&&G.msg('contact','Slecht nieuws: '+w.baas+' heeft '+w.n+' terug. Je liet je daar te weinig zien.',{k:'wijk'})}
    else if(gone>=3)G.msg&&G.msg('contact','Ze morren in '+w.n+'. Laat je gezicht weer eens zien, anders ben je de wijk kwijt.',{k:'wijk'})});sv()}
/* =================== vechtclub De Kooi =================== */
const KOOI=[['Rooie Rinus',74,11,.78,.2],['Tante Sjaan',92,13,.72,.24],['De Slager',112,15,.66,.27],['Tatoeage-Tom',136,18,.6,.3],['De Beer van Noord',165,21,.54,.34]];
const kS=()=>{const Q=obj('stadKooi',{});if(Q.d!==dayN()){Q.d=dayN();Q.n=0}return Q};
let kooiN=null;
const kooiFee=i=>Math.max(5,zS(.3)*(i+1)),kooiPrize=i=>Math.max(10,Math.round(zS(.9)*(i+1)/5)*5);
function kooiLine(){const Q=kS();return Q.n>=KOOI.length?'Je hebt ze vandaag allemaal gehad, kampioen. Morgen staan er nieuwe klaar.':'Welkom in De Kooi. Vandaag sta je tegenover '+KOOI[Q.n][0]+'. Inleg '+fmt(kooiFee(Q.n))+', de winnaar krijgt '+fmt(kooiPrize(Q.n))+'.'}
function kooiLook(n){const i=Math.min(KOOI.length-1,kS().n);n.nm=KOOI[i][0];const L=[['#8a2f1a','#2a2c30','bald'],['#7a5a8a','#5a5a62','none'],['#e8e4da','#8a1f2a','bald'],['#151517','#2a2c30','beanie'],['#5a3a24','#151517','bald']][i];n.look.top=L[0];n.look.arm=i%2?n.look.skin:L[0];n.look.pants=L[1];n.look.hat=L[2];n.look.hatC='#151517';n.look.hair=i===1?'#d8d4cc':'#2a1d14'}
G.npcService.vechter=(n,ch)=>{const Q=kS(),i=Q.n;if(i>=KOOI.length)return;let why='';if(S.energy<4)why='Te moe: 4 energie nodig';else if(S.cash<kooiFee(i))why='Inleg '+fmt(kooiFee(i))+' contant';else if(G.police&&G.police.active())why='Niet nu';else if(S.hp<25)why='Je bent er te slecht aan toe (laat je oplappen)';
  ch.push({t:'Vechten tegen '+KOOI[i][0],sub:why?'':'Gevecht '+(i+1)+' van '+KOOI.length+' · prijs '+fmt(kooiPrize(i)),ic:K.ic.vuist,risk:Math.min(3,1+Math.floor(i/2)),dis:!!why,why,f:()=>kooi(n)})};
async function kooi(n){const Q=kS(),i=Q.n,F=KOOI[i];S.energy-=4;S.cash-=kooiFee(i);sv();const r=await fight(n,{name:F[0],sub:'De Kooi · gevecht '+(i+1)+' van '+KOOI.length,hp:F[1],dmg:F[2],win:F[3],block:F[4]});if(!r)return;
  if(r.ok){const g=kooiPrize(i);S.cash+=g;if(typeof addZwart==='function')addZwart(g);Q.n=i+1;Q.top=Math.max(Q.top||0,i+1);Q.tot=(Q.tot||0)+1;if(typeof addXp==='function')addXp(6+4*i);G.ev&&G.ev('knok');G.ev&&G.ev('kooi');G.snd&&G.snd.fx('cash');fl('+'+fmt(g),n.x,n.z,'#ffd35a');
    if(Q.n>=KOOI.length){G.ev&&G.ev('kampioen');G.toast('Kampioen van De Kooi! Alle vijf verslagen.','lvl')}sv();setTimeout(()=>{kooiLook(n);n.st='stand';n.t=0},2400)}
  else{G.toast(r.cancel?'Je stapt uit de ring. Je inleg ben je kwijt.':F[0]+' wint. Je inleg ben je kwijt.','bad');setTimeout(()=>{n.st='stand';n.t=0},700)}}
function setupKooi(){const p=M.nearestWalk(311.5,182,8);if(!p)return;const n=G.addFixed('vechter',p.x,p.z,-Math.PI/2);kooiN=n;kooiLook(n);
  const m=K.model([[.2,2.6,.2,-1.6,1.3,0,'#2a2c30'],[.2,2.6,.2,1.6,1.3,0,'#2a2c30'],[3.4,.9,.12,0,2.5,0,'#111214'],[3.0,.5,.14,0,2.5,.02,'#ff3d52',1],[.3,.3,.3,-1.6,2.75,0,'#ffd35a',1],[.3,.3,.3,1.6,2.75,0,'#ffd35a',1]]);m.position.set(p.x+2.4,0,p.z);m.rotation.y=Math.PI/2;G.scene().add(m);
  const sg=K.sign('DE KOOI','#ffffff','#b0221e','#111111',.7);sg.position.set(p.x+2.3,2.5,p.z);sg.rotation.y=-Math.PI/2;G.scene().add(sg);
  G.spot({k:'kooi',x:n.x,z:n.z,r:0,n:'Vechtclub De Kooi',dot:'#ff3d52',dotR:80,map:{n:'Vechtclub De Kooi',ic:K.ic.vuist,c:'#ff3d52',pri:2}})}
/* =================== telefoon: wijken =================== */
function html(){const d=dayN();return `<div class="sd-p2-list sd-wk">${WIJK.map(w=>{const r=resp(w),o=own(w),L=SHOPS.filter(s=>s.w===w),got=L.filter(s=>!due(s)&&o).length,tg=TAGS.filter(t=>t.w===w),td=tg.filter(t=>st(w).tags[t.i]===d).length;
    return `<div class="sd-wk-c${o?' own':''}" style="--k:${w.col}"><div class="sd-wk-h"><b>${E(w.n)}</b><em>${o?'Van jou':E(w.baas)+' · sterkte '+w.lv}</em></div>
     <i class="sd-p2-pb"><i style="width:${clamp(r,0,100)}%"></i>${o?'':`<u style="left:${REQ}%"></u>`}</i>
     <div class="sd-wk-s"><span>Respect ${r}${o?'':' / '+REQ}</span><span>Tags ${td}/${tg.length}</span>${o?`<span class="${got<L.length?'due':''}">Beschermgeld ${got}/${L.length}</span>`:''}</div>
     <div class="sd-wk-b">${o&&got<L.length?`<button class="btn sm" data-wgeld="${w.id}">Route naar een zaak</button>`:''}${!o?`<button class="btn sm${r>=REQ?'':' ghost'}" data-wbaas="${w.id}">${r>=REQ?'Naar de wijkbaas':'Waar zit hij?'}</button>`:''}${td<tg.length?`<button class="btn ghost sm" data-wtag="${w.id}">Tagmuur</button>`:''}</div></div>`}).join('')}
   <p class="sd-p2-note">Respect vanaf ${REQ}: daag de wijkbaas uit. Jouw wijk betaalt elke dag beschermgeld (${fmt(pay())} per zaak). Blijf je drie dagen weg, dan zakt je respect.</p></div>`}
function click(t,close){const P=G.P,near=L=>L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0];let b;
  if((b=t.closest('[data-wgeld]'))){const w=WIJK.find(x=>x.id===b.dataset.wgeld),s=near(SHOPS.filter(s=>s.w===w&&due(s)));if(s){close();G.setWaypoint&&G.setWaypoint(s.x,s.z,'Beschermgeld · '+s.n)}return true}
  if((b=t.closest('[data-wbaas]'))){const w=WIJK.find(x=>x.id===b.dataset.wbaas),n=BOSS[w.id];if(n){close();G.setWaypoint&&G.setWaypoint(n.x,n.z,w.baas+' ('+w.n+')')}return true}
  if((b=t.closest('[data-wtag]'))){const w=WIJK.find(x=>x.id===b.dataset.wtag),s=near(TAGS.filter(q=>q.w===w&&st(w).tags[q.i]!==dayN()));if(s){close();G.setWaypoint&&G.setWaypoint(s.x,s.z,'Tagmuur · '+w.n)}return true}return false}
G.wijk={list:WIJK,at:wijkAt,own,resp,html,click,open:()=>SHOPS.filter(due).length,n:()=>WIJK.filter(own).length,
  kooiRow:row=>{const Q=kS();return row(K.ic.vuist,'#ff3d52','Vechtclub De Kooi',Q.n>=KOOI.length?'Vandaag kampioen':'Gevecht '+(Q.n+1)+' van '+KOOI.length+' · prijs '+fmt(kooiPrize(Q.n)),{k:'npc',a:'vechter',n:'Vechtclub De Kooi'})},_t:{fight,challenge,collect,tag,TAGS,SHOPS,BOSS,st}};
/* =================== koppelen =================== */
let tt=0;
function step(dt){tt+=dt;const ts=performance.now()/1000;SHOPS.forEach(s=>{if(!s.m)return;const v=s.m.visible;if(v){s.m.rotation.y=ts*2.2;s.m.position.y=2.2+Math.sin(ts*3+s.x)*.14}});
  if(tt>1){tt=0;const P=G.P;SHOPS.forEach(s=>{s.m.visible=due(s)&&Math.hypot(s.x-P.x,s.z-P.z)<60});const w=wijkAt(P.x,P.z);if(w&&own(w)&&st(w).seen!==dayN()){st(w).seen=dayN()}}}
const wait=setInterval(()=>{if(!G.ready||!G.addFixed||!G.spot||!G.npcA)return;clearInterval(wait);
  try{setupBosses();setupTags();setupShops();setupKooi();upkeep()}catch(e){console.error(e)}
  setInterval(()=>{try{upkeep();tagShow();const Q=kS();if(kooiN&&kooiN.st==='stand'&&KOOI[Math.min(KOOI.length-1,Q.n)][0]!==kooiN.nm)kooiLook(kooiN)}catch(e){}},60000);
  const f=G.onFrame;G.onFrame=dt=>{f&&f(dt);if(!G.paused)step(dt)}},260);
})();
