// Verhaal "De Bezorger" · Seizoen 1 (nieuw, november 2026) · de kern: hulpjes, cast, minispellen, telefoon, achterlicht, het huis,
// de hoofdstuk-loper en vrij rondrijden. De hoofdstukken zelf staan in verhaal-s1a.js (proloog–H5), verhaal-s1b.js (H6–H10) en
// verhaal-s1c.js (H11–epiloog + side quests). Draaiboek: drie verhaalschrijvers (hoofdschrijver, narratief ontwerper, regisseur).
// - Elk hoofdstuk is een ST.step ('s1_h1' …) met blokken; na elk blok een hervatpunt (S.story.flags.s1_cp) voor na het herladen.
// - De tijd volgt het verhaal (stad-story.js: de klok loopt niet vanzelf); elk blok zet zijn eigen dagdeel.
// - Meters: vertrouwen (Rafiq), naam (reputatie in de Westbuurt), band_marco/elena/giulia → ST.meter (fam_*, loy_rafiq, imago).
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
window.S1_NIEUW=true;
const $s=id=>document.getElementById(id),PI=Math.PI,sin=Math.sin,cos=Math.cos,hyp=Math.hypot;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const touch=matchMedia('(pointer:coarse)').matches;
let ST,C,B,K,L;
const S1=G.s1={RUN:0};
const nieuw=()=>++S1.RUN;S1.nieuw=nieuw;
const levend=t=>t===S1.RUN;S1.levend=levend;

/* =================== kleine hulpjes =================== */
const F=(k,v)=>v===undefined?ST.flag(k):ST.flag(k,v);
const fx=n=>{try{G.snd&&G.snd.fx(n,{scene:1})}catch(e){}};
const eur=n=>'€'+Math.round(n).toLocaleString('nl-NL');
// meters: eigen namen → de meters van stad-story.js
const MM={vertrouwen:'loy_rafiq',naam:'imago',band_marco:'fam_marco',band_elena:'fam_elena',band_giulia:'fam_giulia',dex:'loy_dex',ray:'loy_ray'};
const meter=(n,d)=>{const k=MM[n]||n;if(d==null)return ST.meter(k);return ST.meter(k,d)};
const zetMeter=(n,v)=>{const k=MM[n]||n,nu=ST.meter(k);ST.meter(k,v-nu)};
const geld=(n,label)=>ST.geld(n,label);
const plusF=(k,d)=>F(k,(F(k)||0)+(d||1));
// plekken in de stad (M.A) en in interieurs
const A=(k,fx_,fz)=>{const a=M.A&&M.A[k];if(a&&a.x!=null)return {x:a.x,z:a.z};return {x:fx_||0,z:fz||0}};
const W=(id,x,z)=>B.p(id,x,z),W3=(id,x,y,z)=>{const p=W(id,x,z);return [p[0],y,p[1]]};
const plek=(id,n)=>{try{return B.plek(id,n)||null}catch(e){return null}};
const voorDeur=(id,d)=>{const pl=M.placeById&&M.placeById(id);if(!pl||!pl.door)return null;const f={N:[0,-1],S:[0,1],E:[1,0],W:[-1,0]}[pl.face||'S']||[0,1];return walk(pl.door.x+f[0]*(d||2),pl.door.z+f[1]*(d||2),4)};S1.voorDeur=voorDeur;
const walk=(x,z,r)=>(M.nearestWalk&&M.nearestWalk(x,z,r||8))||{x,z};
const P=()=>({x:G.P.x,z:G.P.z,ry:G.P.ry||0});
const naar=(a,b)=>Math.atan2(b.x-a.x,b.z-a.z);
// een scène aan een voordeur: de ontvanger op de stoep vlak voor de gevel, Luca op straat ervoor, de camera van opzij
// (beide gezichten in profiel). Zo staan ze niet allebei tegen de gevel gedrukt met de camera op hun achterhoofd.
function deur(p){p=p||P();const w=walk(p.x,p.z,4);let best=null,bd=9;
  for(let i=0;i<24;i++){const a=i/24*PI*2;for(let d=.4;d<5;d+=.2){if(C.blok&&C.blok(w.x+sin(a)*d,w.z+cos(a)*d,1.5)){if(d<bd){bd=d;best=a}break}}}
  if(best==null)best=P().ry||0;const ix=sin(best),iz=cos(best),k=Math.max(0,bd-.8);
  const q=walk(w.x+ix*k,w.z+iz*k,3),l=walk(q.x-ix*2.5,q.z-iz*2.5,4),mx=(q.x+l.x)/2,mz=(q.z+l.z)/2;let c=null;
  zoek:for(const D of [4.3,3.7,5.2])for(const kant of [1,-1]){const x=mx+iz*kant*D-ix*1.3,z=mz-ix*kant*D-iz*1.3;
    if(C.blok(x,z,2.45))continue;if(C.vrijZicht&&!C.vrijZicht(x,2.45,z,q.x,2.2,q.z))continue;if(C.vrijZicht&&!C.vrijZicht(x,2.45,z,l.x,2.2,l.z))continue;
    c=cam(x,2.45,z,mx,2.05,mz,{fov:48,strak:true});break zoek}
  return {q,l,cam:c||rond(q,naar(q,l)+1.2,3,1.7,1.5)}}
const voor=(d,zij)=>{const p=P(),fx_=sin(p.ry),fz_=cos(p.ry);return walk(p.x+fx_*d+(zij||0)*fz_,p.z+fz_*d-(zij||0)*fx_,8)};
// adressen: deterministisch een voordeur in een wijk van een soort (zelfde adres bij elke speler)
function adres(wijk,soort,n,bij){const L=(M.ADRESSEN||[]).filter(a=>(!wijk||M.districtAt(a.x,a.z)===wijk)&&(!soort||a.soort===soort));if(!L.length)return null;
  if(bij){L.sort((a,b)=>hyp(a.x-bij.x,a.z-bij.z)-hyp(b.x-bij.x,b.z-bij.z));return L[Math.min(L.length-1,n||0)]}
  return L[((n||0)*7919+13)%L.length]}
S1.adres=adres;
// tijd en dag
const DAGEN=['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];
function tijd(h,m){ST.tijd(h,m||0)}

/* =================== cast =================== */
function cast(){const CA=C.actors;const mk=(id,n,rol,col,look,face)=>{CA[id]=Object.assign({},CA[id]||{},{n,col,rol,look,face})};
  const LK=(skin,hair,hs,fh,eye,mood,top,legs,shoes,head,extra)=>Object.assign({skin,hair,hs,fh,eye,mood,top,legs,shoes,head:head||{kind:'none'}},extra||{});
  const FC=(skin,hair,hs,fh,top,col,age,o)=>Object.assign({skin,hair,hs,fh,top,col,age:age||1,fw:18,jaw:'hoekig'},o||{});
  mk('bilal','Bilal','Rafiqs man in de achterkamer','#ff9a3a',LK('#9a6a4a','#16161a','kort','sik','#24160e','koel',{kind:'hoodie',c:'#16171b'},{kind:'track',c:'#16171b'},{kind:'sneaker',c:'#e8e4da'},{kind:'cap',c:'#16171b'}),FC('#9a6a4a','#16161a','kort','sik','#16171b','hoodie',1));
  mk('mo','Mo','Portier Lounge Sahara','#9aa1ab',LK('#6e4630','#16161a','kaal','kortbaard','#24160e','blij',{kind:'bomber',c:'#121316'},{kind:'jeans',c:'#1a1a1c'},{kind:'boot',c:'#16161a'}),FC('#6e4630','#16161a','kaal','kortbaard','#121316','bomber',2,{fw:22}));
  mk('tarik','Tarik','Uitsmijter · Rafiqs schaduw','#c0c4cc',LK('#8d5a3a','#16161a','opgeschoren','sik','#24160e','koel',{kind:'suit',c:'#16171b',c2:'#2a2c30'},{kind:'pantalon',c:'#16171b'},{kind:'nette',c:'#0c0c0e'}),FC('#8d5a3a','#16161a','opgeschoren','sik','#16171b','pak',1,{fw:21}));
  mk('sem','Sem','Uithaler in de haven','#8ac0ff',LK('#e0b48a','#6a4a2a','kort','','#3a4a60','koel',{kind:'track',c:'#5a5d63'},{kind:'track',c:'#5a5d63'},{kind:'sneaker',c:'#2a2c30'},{kind:'beanie',c:'#2a2c30'}),FC('#e0b48a','#6a4a2a','kort','','#5a5d63','track',0));
  mk('kenny','Kenny','Bezorger · Pizza Rapido','#f2d23a',LK('#f0c8a0','#e8c870','kuif','','#3a6a9a','boos',{kind:'jacket',c:'#e8c823',c2:'#2f8a3a'},{kind:'jeans',c:'#2c3a4d'},{kind:'sneaker',c:'#e8e4da'},{kind:'cap',c:'#2f8a3a'}),FC('#f0c8a0','#e8c870','kuif','','#e8c823','jacket',0));
  mk('edwin','Edwin','Planner containerterminal','#9ad0a0',LK('#e8c09a','#8a8478','kalend','snor','#4a5a6a','bang',{kind:'vest',c:'#2f4a6a',c2:'#e8e4da'},{kind:'jeans',c:'#2c3a4d'},{kind:'nette',c:'#3a2a1a'}),FC('#e8c09a','#8a8478','kalend','snor','#2f4a6a','vest',2,{bril:'#2a2c30'}));
  mk('yasmina','Yasmina','Gast op het feest','#ffb0d0',LK('#c8956a','#2a1a12','lang','','#3a2414','blij',{kind:'jurk',c:'#e8dcc8'},{kind:'bloot',c:'#c8956a'},{kind:'nette',c:'#c9a227'},null,{v:1}),FC('#c8956a','#2a1a12','lang','','#e8dcc8','jurk',0,{v:1,fw:16,jaw:'spits'}));
  mk('kramer','Agent Kramer','Wijkagent','#4d7dff',Object.assign({},C.look('agent')||{}),C.face('agent'));
  mk('dino','Dino','Kapper · Fade Factory','#9aa1ab',LK('#a87a52','#16161a','opgeschoren','kortbaard','#24160e','koel',{kind:'schort',c:'#16171b'},{kind:'jeans',c:'#1a1a1c'},{kind:'sneaker',c:'#16161a'}),FC('#a87a52','#16161a','opgeschoren','kortbaard','#16171b','schort',1));
  mk('jasper','Jasper','Villa op Het Eiland','#d8d0c0',LK('#f0d0b0','#c9a46a','kort','','#3a6a9a','koel',{kind:'trui',c:'#d8d0c0'},{kind:'chino',c:'#8a7a62'},{kind:'slipper',c:'#5a3a2a'}),FC('#f0d0b0','#c9a46a','kort','','#d8d0c0','trui',1));
  mk('badjas','Man in badjas','Toren aan de Zuidas','#e8e4da',LK('#e8c4a0','#5a4a3a','kalend','stoppel','#3a4a60','koel',{kind:'coat',c:'#f1efe9'},{kind:'bloot',c:'#e8c4a0'},{kind:'slipper',c:'#f1efe9'}),FC('#e8c4a0','#5a4a3a','kalend','stoppel','#f1efe9','coat',2));
  mk('dewit','Meneer De Wit','Vaste klant','#c9cfd6',LK('#f0d4b8','#e8e4da','kalend','snor','#4a5a6a','blij',{kind:'vest',c:'#5a4a3a',c2:'#e8e4da'},{kind:'pantalon',c:'#3a3c40'},{kind:'slipper',c:'#3a2a1a'}),FC('#f0d4b8','#e8e4da','kalend','snor','#5a4a3a','vest',3));
  mk('vos','Meneer Vos','Drie weken te laat','#c09a6a',LK('#e8c4a0','#8a6a3a','kalend','stoppel','#3a4a60','bang',{kind:'tee',c:'#8a8c90'},{kind:'jogger',c:'#2a2c30'},{kind:'slipper',c:'#2a2c30'}),FC('#e8c4a0','#8a6a3a','kalend','stoppel','#8a8c90','tee',2));
  mk('sanne','Sanne','Collega van Giulia','#7fd1ff',LK('#f0c8a0','#a0602a','staart','','#3a6a9a','blij',{kind:'scrubs',c:'#7fb8c9'},{kind:'scrub',c:'#7fb8c9'},{kind:'sneaker',c:'#f1efe9'},null,{v:1}),FC('#f0c8a0','#a0602a','staart','','#7fb8c9','scrubs',0,{v:1,fw:16,jaw:'spits'}));
  mk('gymdocent','Meneer Kok','Gymdocent','#3fe395',LK('#d9a27a','#3a2a20','kort','stoppel','#3a2414','neutraal',{kind:'track',c:'#2e5f9a'},{kind:'track',c:'#2e5f9a'},{kind:'sneaker',c:'#f1efe9'}),FC('#d9a27a','#3a2a20','kort','stoppel','#2e5f9a','track',1));
  mk('kok','Kok van Rapido','','#f2d23a',LK('#f0c8a0','#3a2a20','kort','','#3a4a60','neutraal',{kind:'schort',c:'#f1efe9'},{kind:'jeans',c:'#2c3a4d'},{kind:'sneaker',c:'#e8e4da'}),FC('#f0c8a0','#3a2a20','kort','','#f1efe9','schort',1));
  mk('raysman','Man van Ray','','#5a5d63',LK('#6e4630','#16161a','kaal','','#24160e','koel',{kind:'coat',c:'#16171b'},{kind:'pantalon',c:'#16171b'},{kind:'nette',c:'#0c0c0e'}),FC('#6e4630','#16161a','kaal','','#16171b','coat',1));
  mk('bakkal','Mevrouw Bakkal','Klant','#ffb0d0',LK('#c8956a','#2a1a12','knot','','#3a2414','blij',{kind:'vest',c:'#7a3a5a'},{kind:'jeans',c:'#2c3a4d'},{kind:'slipper',c:'#3a2a2a'},null,{v:1}),FC('#c8956a','#2a1a12','knot','','#7a3a5a','vest',1,{v:1,fw:16,jaw:'spits'}));
  // Giulia: verpleegkunde in opleiding (de rol in stad-leeftijd.js gaat mee als die er is)
  try{const U=G.uiterlijk,c=U&&U.cast&&U.cast();if(c&&c.giulia){c.giulia.rolA=()=>'Zus · verpleegkunde (in opleiding)';c.giulia.kl=Object.assign({},c.giulia.kl,{werk:{k:'scrubs',c:'#7fb8c9',b:'scrub',bc:'#7fb8c9',s:'sneaker',sc:'#f1efe9',s2:'#c9cfd6'}})}}catch(e){}
  if(CA.ray){CA.ray.n='Big Ray';CA.ray.rol='Het Eiland'}
  if(CA.elena)CA.elena.rol='Moeder · schoonmaakster op de Zuidas';if(CA.giulia)CA.giulia.rol='Zus · verpleegkunde in opleiding';if(CA.marco)CA.marco.rol='Vader · havenwerker, Containerkade';
  if(CA.nova){CA.nova.look=Object.assign({},CA.nova.look,{head:{kind:'none'},hs:'staart'});CA.nova.face=Object.assign({},CA.nova.face,{hat:null,hs:'staart'})}
  if(CA.buurvrouw_ans)CA.ans=CA.buurvrouw_ans;
  // figuranten op de hoek en bij de inval
  mk('klant1','Klant','','#9aa1ab',LK('#e9b98f','#5a3a22','kort','stoppel','#3a4a60','neutraal',{kind:'coat',c:'#3a4a2a'},{kind:'jeans',c:'#2c3a4d'},{kind:'sneaker',c:'#e8e4da'},{kind:'beanie',c:'#5a3a22'}),FC('#e9b98f','#5a3a22','kort','stoppel','#3a4a2a','coat',1));
  mk('klant2','Klant','','#9aa1ab',LK('#8d5a3a','#16161a','kuif','','#24160e','neutraal',{kind:'hoodie',c:'#5a2a3a'},{kind:'track',c:'#16161a'},{kind:'sneaker',c:'#16161a'}),FC('#8d5a3a','#16161a','kuif','','#5a2a3a','hoodie',0));
  mk('klant3','Klant','','#9aa1ab',LK('#f1caa5','#c9a24a','lang','','#3f6fb8','neutraal',{kind:'jacket',c:'#2a3a5a'},{kind:'jeans',c:'#1a2236'},{kind:'boot',c:'#2a1a12'},null,{v:1}),FC('#f1caa5','#c9a24a','lang','','#2a3a5a','leer',1,{v:1,fw:16,jaw:'spits'}));
  mk('klant4','Klant','','#9aa1ab',LK('#c8956a','#3a2a20','opgeschoren','sik','#24160e','koel',{kind:'bomber',c:'#2a2c30'},{kind:'track',c:'#2a2c30'},{kind:'sneaker',c:'#c0261e'},{kind:'cap',c:'#c0261e'}),FC('#c8956a','#3a2a20','opgeschoren','sik','#2a2c30','bomber',1));
  mk('agent2','Agent','Politie','#4d7dff',Object.assign({},C.look('agent')||{},{skin:'#8d5a3a',hair:'#16161a'}),C.face('agent'));}
S1.cast=cast;

/* =================== cutscène-bouwstenen =================== */
// een zin: duur volgt de lengte
const dur=t=>clamp(1.5+t.length/16,2.2,6.2);
const Z=(wie,tekst,o)=>Object.assign({say:wie,text:tekst,t:dur(tekst)},o||{});
const T_=(tekst,o)=>Object.assign({say:null,text:tekst,t:dur(tekst)},o||{});
// de poppetjes zijn groot: korte afstanden en smalle lenzen worden bij het afspelen ruimer gemaakt (niet door muren heen),
// en op een staand scherm (telefoon) nog wat ruimer
const staand=()=>innerWidth<innerHeight;
function ruimer(p,l,uit){const dx=p[0]-l[0],dz=p[2]-l[2],D=hyp(dx,dz);if(uit)uit.tekort=1;if(D<.6||D>9)return p;const k=staand()?1.55:1.35;const doel=Math.min(D*k,D+4);let D2=doel;const ux=dx/D,uz=dz/D;
  try{const bin=B&&B.waar&&B.waar();if(bin&&B.muurAt){for(let q=D;q<=D2+.35;q+=.2)if(B.muurAt(l[0]+ux*q,l[2]+uz*q)){D2=Math.max(D,q-.45);break}}
    else if(!bin&&M.canStand&&p[1]<7){for(let q=D;q<=D2;q+=.4)if(!M.canStand(l[0]+ux*q,l[2]+uz*q,.2)){D2=Math.max(D,q-.6);break}}}catch(e){}
  if(uit)uit.tekort=doel/Math.max(.1,D2);return [l[0]+ux*D2,p[1]+(D2-D)*.12,l[2]+uz*D2]}
// lens: smalle lenzen ruimer; kon de camera niet ver genoeg naar achteren, dan de lens nog wat wijder
const lens=(f,tekort)=>{const f0=f||(staand()?62:42),f1=f?f*(staand()?1.45:1.1):f0,t=Math.max(1,tekort||1);if(!f&&t<1.02)return undefined;
  return Math.min(74,2*Math.atan(Math.tan(f1*Math.PI/360)*t)*360/Math.PI)};
function camObj(pos,look,o){o=Object.assign({},o||{});const fov=o.fov;delete o.fov;const strak=o.strak;delete o.strak;if(strak)return Object.assign({pos,look,vrij:true},o,fov?{fov}:{});   // strak: precies dit shot (niet ruimer, geen automatische kadrering op de gezichten)
  const c=Object.assign({look},o),uit={tekort:1};
  Object.defineProperty(c,'pos',{enumerable:true,get(){return ruimer(pos,look,uit)}});Object.defineProperty(c,'fov',{enumerable:true,get(){return lens(fov,uit.tekort)}});return c}
const cam=(px,py,pz,lx,ly,lz,o)=>({cam:camObj([px,py,pz],[lx,ly,lz],o)});
const camNaar=(px,py,pz,lx,ly,lz,t,o)=>{o=Object.assign({},o||{});const fov=o.fov;delete o.fov;if(o.strak){delete o.strak;return {cam:Object.assign({to:{pos:[px,py,pz],look:[lx,ly,lz]},t:t||3,vrij:true},o,fov?{fov}:{})}}const to={look:[lx,ly,lz]};const P_=[px,py,pz];Object.defineProperty(to,'pos',{enumerable:true,get(){return ruimer(P_,[lx,ly,lz])}});
  const c=Object.assign({to,t:t||3},o);if(fov)Object.defineProperty(c,'fov',{enumerable:true,get(){return lens(fov)}});return {cam:c}};
// schot rond een punt in de wereld (of [x,z]): hoek a, afstand d, hoogte h, kijkhoogte ly
// de poppetjes zijn ±2,6 m: een rondom-shot op 1,5-1,8 m kijkt tegen kinnen en achterhoofden aan. Op ooghoogte brengen
// (lage camera's onder 1,2 m en shots op handen/tafels onder 1,0 m blijven zoals ze zijn).
const ooghoogte=(h,ly)=>[h==null?2.3:(h>=1.2&&h<2.3?h+.6:h),ly==null?1.9:(ly>=1.0&&ly<2.0?ly+.5:ly)];
const rond=(p,a,d,h,ly,o)=>{const x=p.x!=null?p.x:p[0],z=p.z!=null?p.z:p[1];d*=1.3;[h,ly]=ooghoogte(h,ly);return L&&L.rond?L.rond(x,z,a,d,h,ly,o):cam(x+sin(a)*d,h,z+cos(a)*d,x,ly==null?1.3:ly,z,o)};
const rondNaar=(p,a,d,h,ly,t,o)=>{const x=p.x!=null?p.x:p[0],z=p.z!=null?p.z:p[1];d*=1.3;[h,ly]=ooghoogte(h,ly);return L&&L.rondNaar?L.rondNaar(x,z,a,d,h,ly,t,o):camNaar(x+sin(a)*d,h,z+cos(a)*d,x,ly==null?1.3:ly,z,t,o)};
// over de schouder van a naar b
function ots(a,b,d,zij,h){const dx=a.x-b.x,dz=a.z-b.z,n=hyp(dx,dz)||1,ux=dx/n,uz=dz/n;d=(d||2.6)*1.45;zij=(zij==null?1.0:zij)*1.35;h=Math.max(2.4,(h||2.2)+.3);
  return cam(a.x+ux*d-uz*zij,h,a.z+uz*d+ux*zij,b.x,1.95,b.z)}
const verteller=id=>({fn:async()=>{if(G.verteller)await G.verteller(id)},vt:id});
const titel=(t,sub,d)=>({titel:t,sub:sub||'',t:d||3});
// speel een scène; geeft de keuze terug (of null). Stopt stil als het verhaal intussen verder is.
/* ---------- het doek: zwart tussen twee scènes en bij binnen/buiten ----------
   Een scène die op zwart eindigt laat het doek dicht; de volgende scène haalt het weg op het moment dat zijn eigen beeld klaar is.
   Zo zie je tussen twee scènes nooit even de spelcamera, en wisselen binnen/buiten zonder extra fade of deurgeluid.
   Komt er geen scène meer (je gaat spelen), dan gaat het doek na een paar honderd ms zacht open. Ligt onder de cutscène-laag (z 70). */
const doekEl=document.createElement('div');doekEl.id='s1Doek';doekEl.style.cssText='position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:69';
document.body.appendChild(doekEl);
let doekDicht=false,doekT=0,doekBezig=0;
function doek(dicht,t){doekDicht=!!dicht;doekT=performance.now();doekEl.style.transition=t?`opacity ${t}s ease`:'none';doekEl.style.opacity=dicht?1:0;doekEl.style.pointerEvents=dicht?'auto':'none';
  return t?new Promise(r=>setTimeout(r,t*1000+30)):Promise.resolve()}
let doekVast=0;   // tot dit moment blijft het doek dicht (na het titelscherm: zwart tot de eerste scène begint)
setInterval(()=>{const nu=performance.now();if(doekDicht&&!doekBezig&&nu-doekT>420&&nu>doekVast)doek(false,.55)},100);
S1.doek=doek;S1.doekDicht=()=>doekDicht;S1.doekVast=ms=>{doek(true);doekVast=performance.now()+(ms||2500)};
const INHOUD=x=>x&&(x.text!=null||x.titel||x.wait||x.keuze||x.vt||(x.cam&&x.cam.to));
async function speel(t,steps,o){if(!levend(t))return null;let st=steps.flat().filter(Boolean);o=o||{};
  // een buitenscène terwijl de speler binnen staat (bijv. na hervatten): eerst naar buiten, anders blijft het beeld zwart
  try{if(B.waar()&&!st.some(x=>x.binnen||x.buiten)){const eerste=st.find(x=>(x.actor&&Array.isArray(x.at))||(x.cam&&!x.cam.volg&&x.cam.look));
    const xx=eerste?(eerste.actor?eerste.at[0]:eerste.cam.look[0]):null;if(xx!=null&&xx<4000)await buiten()}}catch(e){}
  if(!levend(t))return null;
  // doek dicht (vorige scène eindigde zwart, of net binnen/buiten): pas weghalen als deze scène zelf beeld heeft
  if(doekDicht){const i=st.findIndex(x=>x.fade),voor=i<0?[]:st.slice(0,i),open={fn:()=>{doek(false)}};
    if(i>=0&&!voor.some(INHOUD)&&st[i].fade==='out')st.splice(i+1,0,open);
    else if(i>=0&&!voor.some(INHOUD)&&st[i].fade==='in')st.splice(i,0,{fade:'out',t:.01},open);
    else{const j=st.findIndex(x=>x.cam);st.splice(j<0?0:j+1,0,{fn:()=>{doek(false,.45)}})}}
  // eindigt deze scène op zwart? dan blijft het doek dicht tot de volgende scène (of tot je weer speelt)
  if(!o.blijfZwart){let k=-1;for(let n=st.length-1;n>=0;n--){if(st[n].fade){k=n;break}}
    if(k>=0&&st[k].fade==='out'&&!st.slice(k+1).some(INHOUD))st.push({fn:()=>{doek(true)}})}
  try{return await C.play(st,Object.assign({blijf:true},o))}catch(e){console.error(e);return null}}
// keuze in de ondertitel: opties [{t,id}] → id
// een minispel in beeld laten spelen: de camera blijft op de scène (de spelerscamera kan elders staan)
async function inScene(t,steps,f){let r;await speel(t,[{speler:false},...steps,{fn:async()=>{try{r=await f()}catch(e){console.error(e)}}}]);return r}
S1.inScene=inScene;
const keuze=(wie,tekst,opties)=>({keuze:opties.map(o=>typeof o==='string'?{t:o,id:o}:o),wie,text:tekst||''});
Object.assign(S1,{F,fx,eur,meter,zetMeter,geld,plusF,A,W,W3,plek,walk,P,naar,voor,deur,tijd,DAGEN,Z,T_,cam,camNaar,rond,rondNaar,ots,verteller,titel,speel,keuze,dur,sleep,pick,rr,clamp,hyp});

/* =================== doelen: ergens heen, op de knop drukken =================== */
function doelNaar(t,tekst,p,o){o=o||{};if(!levend(t))return Promise.resolve(false);ST.doel(tekst,p.binnen?p:{x:p.x,z:p.z});
  return ST.aankomst(p.binnen?p:{x:p.x,z:p.z},{r:o.r||(p.binnen?2.2:8),actie:o.actie,sub:o.sub,gebouw:o.gebouw,geldig:()=>levend(t)}).then(ok=>{if(!ok)return false;if(o.fietsAf!==false&&!p.binnen)fietsAf();ST.doel(null);return true})}
const fietsAf=()=>{try{if(G.fiets&&G.fiets.actief())G.fiets.af(true)}catch(e){}};
const zorgFiets=p=>{try{L&&L.zorgFiets&&L.zorgFiets(p)}catch(e){}};
// binnen/buiten in het verhaal: achter het doek, zonder eigen fade en deurgeluid (dat hoort bij zelf naar binnen lopen)
async function wissel(f){doekBezig++;try{if(!doekDicht)await doek(true,.3);await f()}catch(e){console.error(e)}finally{doekBezig--;doekT=performance.now()}}
const binnen=async id=>{if(B.waar()!==id)await wissel(()=>B.in(id,{forceer:true,fade:false}))};
const buiten=async()=>{if(B.waar())await wissel(()=>B.uit({fade:false}))};
// buiten neerzetten op een punt (na een scène binnen)
async function zetBuiten(p,ry){await buiten();if(p){G.P.x=p.x;G.P.z=p.z;if(ry!=null)G.P.ry=ry}}
Object.assign(S1,{doelNaar,fietsAf,zorgFiets,binnen,buiten,zetBuiten});

/* =================== stijl voor minispellen, telefoon en kaarten =================== */
function css(){if($s('s1Css'))return;const s=document.createElement('style');s.id='s1Css';s.textContent=`
.s1-mg{position:fixed;inset:0;z-index:80;display:flex;align-items:flex-end;justify-content:center;pointer-events:none;padding:0 max(12px,env(safe-area-inset-right,0px)) max(18px,calc(env(safe-area-inset-bottom,0px) + 14px)) max(12px,env(safe-area-inset-left,0px))}
.s1-mg>div{pointer-events:auto;width:min(560px,100%);background:#120f16ee;border:2px solid #2e2836;box-shadow:0 8px 0 #0008;padding:14px 16px;color:#f1efe9;font:500 14px/1.4 'Space Grotesk',system-ui,sans-serif}
.s1-mg.mid{align-items:center}.s1-mg small{font:700 11px monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--c,#ffd35a)}
.s1-mg h4{margin:2px 0 6px;font:800 19px 'Space Grotesk',system-ui}.s1-mg p{margin:0 0 10px;color:#c9c4b8}
.s1-bar{position:relative;height:30px;background:#231d2a;border:2px solid #3a3442;overflow:hidden;margin:6px 0 10px}
.s1-bar i{position:absolute;top:0;bottom:0;background:#3fe39555;border-left:2px solid #3fe395;border-right:2px solid #3fe395}
.s1-bar b{position:absolute;top:-2px;bottom:-2px;width:5px;background:#ffd35a;box-shadow:0 0 8px #ffd35a}
.s1-bar u{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#ffd35a,#ff9a3a);text-decoration:none}
.s1-knop{font:800 15px 'Space Grotesk',system-ui;color:#121016;background:#ffd35a;border:0;border-bottom:4px solid #b8902a;padding:12px 18px;cursor:pointer;touch-action:manipulation;user-select:none;-webkit-user-select:none}
.s1-knop.g{background:#2a2630;color:#f1efe9;border-color:#16131a}.s1-knop[disabled]{opacity:.4}
.s1-opt{display:grid;gap:8px}.s1-opt button{text-align:left;font:600 14px 'Space Grotesk',system-ui;color:#f1efe9;background:#1d1924;border:2px solid #3a3442;border-left:6px solid var(--c,#ffd35a);padding:10px 12px;cursor:pointer;touch-action:manipulation}
.s1-opt button:hover{background:#28222f}.s1-opt button em{display:block;font-style:normal;font-size:12px;color:#8a8f98}
.s1-meter{display:flex;gap:10px;align-items:center;margin:4px 0 10px}.s1-meter span{font:700 11px monospace;letter-spacing:.1em;min-width:92px;color:#c9c4b8}
.s1-meter div{flex:1;height:12px;background:#231d2a;border:2px solid #3a3442;position:relative}.s1-meter div i{position:absolute;left:0;top:0;bottom:0;background:var(--c,#ff5a4a);transition:width .4s}
.s1-dots{display:flex;gap:6px;margin:6px 0}.s1-dots i{width:16px;height:16px;border:2px solid #3a3442;background:#231d2a}.s1-dots i.ok{background:#3fe395}.s1-dots i.mis{background:#ff5a4a}
.s1-tel{position:fixed;top:max(14px,calc(env(safe-area-inset-top,0px) + 10px));left:50%;transform:translate(-50%,-140%);z-index:90;width:min(380px,calc(100vw - 24px));background:#1c2030f2;border-radius:18px;padding:11px 14px;color:#f2f5fb;
 font:500 14px/1.35 system-ui,sans-serif;box-shadow:0 10px 30px #0008;transition:transform .45s cubic-bezier(.2,.9,.2,1);pointer-events:none}
.s1-tel.in{transform:translate(-50%,0)}.s1-tel small{display:flex;justify-content:space-between;font:600 11px system-ui;letter-spacing:.06em;color:#aab4c8;text-transform:uppercase;margin-bottom:3px}
.s1-tel small span:first-child:before{content:'';display:inline-block;width:12px;height:12px;border-radius:3px;background:var(--c,#34c759);margin-right:6px;vertical-align:-2px}
.s1-tel b{display:block;font-weight:700}
.s1-tease{position:fixed;inset:0;z-index:95;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;color:#fff;text-align:center;padding:20px;opacity:0;transition:opacity 1.2s}
.s1-tease.in{opacity:1}.s1-tease h2{font:800 clamp(26px,6vw,54px)/1.05 'Space Grotesk',system-ui;margin:0;letter-spacing:.02em}.s1-tease h2 small{display:block;font:600 clamp(13px,2.4vw,18px) monospace;letter-spacing:.3em;color:#bbb;margin-top:8px}
.s1-tease p{font:800 clamp(16px,3.6vw,26px) 'Space Grotesk',system-ui;letter-spacing:.12em;margin:0;display:flex;align-items:center;gap:12px}.s1-tease p i{width:14px;height:14px;border-radius:50%;background:#ff2a1a;box-shadow:0 0 14px #ff2a1a;animation:s1knip 1.1s steps(2,end) infinite}
@keyframes s1knip{50%{opacity:.1}}.s1-tease .s1-sam{max-width:520px;font:500 14px/1.5 system-ui;color:#c9c4b8}.s1-tease .rij{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.s1-hud2{position:fixed;left:max(12px,env(safe-area-inset-left,0px));top:max(100px,calc(env(safe-area-inset-top,0px) + 96px));max-width:min(290px,calc(100vw - 24px));z-index:40;display:flex;flex-direction:column;gap:6px;pointer-events:none}
.s1-hud2 div{background:#120f16d8;border:2px solid #2e2836;color:#f1efe9;font:700 12px 'Space Grotesk',system-ui;padding:5px 8px}
.s1-licht{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:max(150px,calc(env(safe-area-inset-bottom,0px) + 140px));z-index:45;font:800 13px 'Space Grotesk',system-ui;color:#f1efe9;background:#2a1414;border:2px solid #ff3a2a;padding:9px 12px;cursor:pointer;touch-action:manipulation}
.s1-licht.uit{background:#1a1a1c;border-color:#5a5d63;color:#8a8f98}`;document.head.appendChild(s)}
S1.css=css;
function mgOpen(html,o){css();o=o||{};const el=document.createElement('div');el.className='s1-mg'+(o.mid?' mid':'');el.style.setProperty('--c',o.kleur||'#ffd35a');el.innerHTML=`<div>${html}</div>`;document.body.appendChild(el);return el}
S1.mgOpen=mgOpen;

/* =================== telefoonbericht (bovenaan, glijdt in beeld) =================== */
let telQ=Promise.resolve();
function bericht(van,tekst,o){o=o||{};telQ=telQ.then(()=>new Promise(res=>{css();const el=document.createElement('div');el.className='s1-tel';el.style.setProperty('--c',o.kleur||'#34c759');
  el.innerHTML=`<small><span>${o.app||'Berichten'}</span><span>nu</span></small><b>${K.E(van)}</b>${K.E(tekst)}`;document.body.appendChild(el);fx(o.geluid||'notify');try{navigator.vibrate&&navigator.vibrate([50,40,50])}catch(e){}
  requestAnimationFrame(()=>el.classList.add('in'));const d=o.t||clamp(2.6+tekst.length/22,3,7);setTimeout(()=>{el.classList.remove('in');setTimeout(()=>{el.remove();res()},500)},d*1000)}));return telQ}
S1.bericht=bericht;
const sein=(t,c)=>{try{ST.seintje(t,c)}catch(e){}};S1.sein=sein;

/* =================== minispellen =================== */
// 1. timing: een balkje gaat heen en weer; druk als het in het groene vak staat. o = {titel,uitleg,rondes,snel,vak,knop}
function mgTiming(o){return new Promise(res=>{o=Object.assign({rondes:3,snel:1,vak:.22,knop:'Nu!'},o||{});
  const el=mgOpen(`<small>${o.kop||'Minispel'}</small><h4>${o.titel}</h4><p>${o.uitleg||'Druk als het streepje in het groene vak staat.'}</p><div class="s1-bar"><i></i><b></b></div><div class="s1-dots">${'<i></i>'.repeat(o.rondes)}</div><button class="s1-knop">${o.knop} <span style="opacity:.6">(spatie)</span></button>`,o);
  const bar=el.querySelector('.s1-bar'),vak=bar.querySelector('i'),st=bar.querySelector('b'),dots=[...el.querySelectorAll('.s1-dots i')];let r=0,goed=0,t0=performance.now(),v0=0,klaar=false,lock=0;
  const nieuwVak=()=>{v0=rr(.1,.9-o.vak);vak.style.left=(v0*100)+'%';vak.style.width=(o.vak*100)+'%'};nieuwVak();
  const pos=()=>{const t=(performance.now()-t0)/1000*(0.75+o.snel*.45+r*.18);return (1-cos(t*PI))/2};
  let raf=0;const loop=()=>{if(klaar)return;st.style.left='calc('+(pos()*100)+'% - 2px)';raf=requestAnimationFrame(loop)};loop();
  const druk=()=>{if(klaar||performance.now()<lock)return;lock=performance.now()+350;const p=pos(),ok=p>=v0&&p<=v0+o.vak;dots[r].className=ok?'ok':'mis';if(ok){goed++;fx('click')}else fx('hit');r++;
    if(r>=o.rondes){klaar=true;cancelAnimationFrame(raf);setTimeout(()=>{weg();res(goed)},500)}else{nieuwVak();t0=performance.now()-rr(0,800)}};
  const key=e=>{if(e.code==='Space'||e.key==='Enter'||e.key==='e'||e.key==='E'){e.preventDefault();e.stopImmediatePropagation();druk()}};
  el.querySelector('.s1-knop').addEventListener('pointerdown',e=>{e.preventDefault();druk()});addEventListener('keydown',key,true);
  const weg=()=>{removeEventListener('keydown',key,true);el.remove()}})}
// 2. vasthouden: houd de knop vast tot de balk vol is; bij 'storing' (iemand kijkt) loslaten. o = {titel,uitleg,stappen,duur,storing:bool}
function mgHold(o){return new Promise(res=>{o=Object.assign({stappen:1,duur:1.5,knop:'Houd vast'},o||{});
  const el=mgOpen(`<small>${o.kop||'Minispel'}</small><h4>${o.titel}</h4><p>${o.uitleg||'Houd de knop (of E) vast tot de balk vol is.'}</p><div class="s1-bar"><u style="width:0"></u></div><p class="s1-st" style="min-height:20px;margin:0 0 8px;color:#ff9a8a"></p><div class="s1-dots">${'<i></i>'.repeat(o.stappen)}</div><button class="s1-knop">${o.knop} <span style="opacity:.6">(E)</span></button>`,o);
  const u=el.querySelector('u'),stEl=el.querySelector('.s1-st'),dots=[...el.querySelectorAll('.s1-dots i')];let st=0,v=0,houd=false,klaar=false,kijkt=false,kT=rr(1.5,3),fout=0,last=performance.now();
  const loop=()=>{if(klaar)return;const nu=performance.now(),dt=Math.min(.1,(nu-last)/1000);last=nu;
    if(o.storing){kT-=dt;if(kT<=0){kijkt=!kijkt;kT=kijkt?rr(1,1.8):rr(1.8,3.4);if(kijkt)fx('heart')}
      const bijna=!kijkt&&kT<.9;if(bijna&&!el._w){el._w=1;fx('tab')}if(!bijna)el._w=0;
      stEl.textContent=kijkt?'👁 '+(o.kijkTekst||'Er kijkt iemand! Loslaten.'):bijna?(o.waarschuw||'Hij draait zich om…'):'';stEl.style.color=kijkt?'#ff5a4a':'#ffd35a'}
    if(houd){if(kijkt){fout++;houd=false;v=Math.max(0,v-.35);stEl.textContent=o.betrapt||'Bijna gezien…';fx('hit');if(o.maxFout&&fout>=o.maxFout){klaar=true;setTimeout(()=>{weg();res({ok:false,fout})},500);return}}else v+=dt/o.duur}
    u.style.width=(clamp(v,0,1)*100)+'%';
    if(v>=1){dots[st].className='ok';st++;v=0;houd=false;fx('click');if(st>=o.stappen){klaar=true;setTimeout(()=>{weg();res({ok:true,fout})},350);return}}
    requestAnimationFrame(loop)};requestAnimationFrame(loop);
  const knop=el.querySelector('.s1-knop'),aan=e=>{e&&e.preventDefault();houd=true},uit=()=>{houd=false};
  knop.addEventListener('pointerdown',aan);knop.addEventListener('pointerup',uit);knop.addEventListener('pointerleave',uit);
  const kd=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)houd=true}},ku=e=>{if(e.key==='e'||e.key==='E'||e.code==='Space'){e.stopImmediatePropagation();houd=false}};
  addEventListener('keydown',kd,true);addEventListener('keyup',ku,true);
  const weg=()=>{removeEventListener('keydown',kd,true);removeEventListener('keyup',ku,true);el.remove()}})}
// 3. gesprek met meters: per beurt een vraag en antwoorden met effect op één of meer meters. o = {kop,titel,wie,meters:{naam:[label,start,kleur]},beurten:[{vraag,opties:[{t,eff:{m:+n},reactie,id}],tijd}]}
function mgGesprek(o){return new Promise(res=>{const m={};Object.keys(o.meters).forEach(k=>m[k]=o.meters[k][1]);const gekozen=[];let i=0,timer=0;
  const el=mgOpen('',{kleur:o.kleur,mid:false});const inn=el.firstChild;
  const tekenM=()=>Object.keys(o.meters).map(k=>`<div class="s1-meter" style="--c:${o.meters[k][2]||'#ff5a4a'}"><span>${o.meters[k][0]}</span><div><i style="width:${clamp(m[k],0,100)}%"></i></div></div>`).join('');
  const toon=()=>{clearInterval(timer);const b=typeof o.beurten[i]==='function'?o.beurten[i](m,gekozen):o.beurten[i];if(!b){klaar();return}
    let rest=b.tijd||0;inn.innerHTML=`<small>${o.kop||'Gesprek'}</small><h4>${K.E(b.vraag)}</h4>${tekenM()}${rest?`<p class="s1-tijd" style="margin:0 0 8px;color:#ff9a8a">${rest} s</p>`:''}<div class="s1-opt">${b.opties.map((x,j)=>`<button data-j="${j}">${K.E(x.t)}${x.sub?`<em>${K.E(x.sub)}</em>`:''}</button>`).join('')}</div>`;
    fx('click');
    inn.querySelectorAll('[data-j]').forEach(bt=>bt.onclick=()=>kies(b,b.opties[+bt.dataset.j]));
    if(rest){const tEl=inn.querySelector('.s1-tijd');timer=setInterval(()=>{rest--;if(tEl)tEl.textContent=rest+' s';if(rest<=0){clearInterval(timer);kies(b,b.geenAntwoord||{t:'(niks)',eff:b.stilEff||{},reactie:b.stilReactie})}},1000)}};
  const kies=async(b,x)=>{clearInterval(timer);inn.querySelectorAll('button').forEach(z=>z.disabled=true);gekozen.push(x.id||x.t);const eff=typeof x.eff==='function'?x.eff(m):x.eff||{};Object.keys(eff).forEach(k=>{m[k]=clamp((m[k]||0)+eff[k],0,100)});
    inn.querySelectorAll('.s1-meter i').forEach((z,j)=>{z.style.width=clamp(m[Object.keys(o.meters)[j]],0,100)+'%'});
    if(x.fn)try{await x.fn(m)}catch(e){console.error(e)}
    const rc=typeof x.reactie==='function'?x.reactie(m):x.reactie;if(rc){el.style.display='none';await C.zeg(o.wie,rc,{t:dur(rc)});el.style.display=''}
    if(o.naBeurt)try{await o.naBeurt(m,i)}catch(e){}
    i++;if(i>=o.beurten.length||(o.stop&&o.stop(m)))klaar();else toon()};
  const klaar=()=>{clearInterval(timer);el.remove();res({m,gekozen})};toon()})}
// 4. kaartjes (overhoren): vragen met drie antwoorden; geeft het aantal goed
function mgQuiz(o){return mgGesprek({kop:o.kop||'Overhoren',wie:o.wie,kleur:o.kleur,meters:{goed:['Goed',0,'#3fe395']},beurten:o.vragen.map(v=>({vraag:v[0],opties:v[1].map((t,j)=>({t,eff:{goed:j===v[2]?20:0},reactie:j===v[2]?(v[3]||'Goed.'):(v[4]||'Nee. Nog eens kijken.')}))}))}).then(r=>Math.round(r.m.goed/20))}
// 5. snel tikken (aanbellen, tassen dragen): zo vaak mogelijk in de tijd
function mgMash(o){return new Promise(res=>{o=Object.assign({tijd:5,doel:20},o||{});const el=mgOpen(`<small>${o.kop||'Minispel'}</small><h4>${o.titel}</h4><p>${o.uitleg||'Tik zo snel je kunt.'}</p><div class="s1-bar"><u style="width:0"></u></div><button class="s1-knop">${o.knop||'Tik!'} <span style="opacity:.6">(spatie)</span></button>`,o);
  const u=el.querySelector('u');let n=0;const t0=performance.now();const tik=()=>{n++;u.style.width=Math.min(100,n/o.doel*100)+'%';fx('tab');if(n>=o.doel)stop()};
  el.querySelector('.s1-knop').addEventListener('pointerdown',e=>{e.preventDefault();tik()});const kd=e=>{if(e.code==='Space'||e.key==='e'||e.key==='E'){e.preventDefault();e.stopImmediatePropagation();if(!e.repeat)tik()}};addEventListener('keydown',kd,true);
  let dood=false;const stop=()=>{if(dood)return;dood=true;removeEventListener('keydown',kd,true);el.remove();res(n>=o.doel)};setTimeout(stop,o.tijd*1000)})}
// 6. kiezen uit opties (telefoonscherm, menu) zonder meters
function mgKies(o){return mgGesprek({kop:o.kop,wie:o.wie,kleur:o.kleur,meters:{},beurten:[{vraag:o.vraag,opties:o.opties.map(x=>Object.assign({},x,{eff:{}}))}]}).then(r=>r.gekozen[0])}
Object.assign(S1,{mgTiming,mgHold,mgGesprek,mgQuiz,mgMash,mgKies});

/* =================== het achterlicht van de fiets (toets L / knop) =================== */
const LICHT={aan:true,cap:null,glow:null,knop:null,zone:null,actief:false};
function lichtObj(){const F_=G.fiets&&G.fiets._F;const g=F_&&F_.bike&&(F_.bike.root||(F_.bike.add?F_.bike:null));if(!g)return null;if(LICHT.g!==g||!LICHT.cap||!LICHT.glow){LICHT.g=g;const scoot=F_.type==='scooter',y=scoot?.46:.82,z=scoot?-.8:-.88;
  LICHT.cap=new TH.Mesh(new TH.BoxGeometry(.085,.065,.045),new TH.MeshLambertMaterial({color:'#2a1010'}));LICHT.cap.position.set(0,y,z-.004);g.add(LICHT.cap);
  LICHT.glow=new TH.PointLight('#ff2a1a',1.6,3.2,2);LICHT.glow.position.set(0,y,z-.25);g.add(LICHT.glow)}
  if(LICHT.cap)LICHT.cap.visible=!LICHT.aan;if(LICHT.glow)LICHT.glow.visible=LICHT.aan;return g}
function licht(on){if(on!=null)LICHT.aan=!!on;lichtObj();if(LICHT.knop){LICHT.knop.classList.toggle('uit',!LICHT.aan);LICHT.knop.textContent=LICHT.aan?'Achterlicht · aan (L)':'Achterlicht · uit (L)'}fx('click');return LICHT.aan}
function lichtKnop(on){css();LICHT.actief=!!on;if(on&&!LICHT.knop){const b=document.createElement('button');b.className='s1-licht';b.addEventListener('pointerdown',e=>{e.preventDefault();licht(!LICHT.aan)});document.body.appendChild(b);LICHT.knop=b;licht(LICHT.aan)}
  if(!on&&LICHT.knop){LICHT.knop.remove();LICHT.knop=null}}
addEventListener('keydown',e=>{if((e.key==='l'||e.key==='L')&&LICHT.actief&&!e.repeat&&!(document.activeElement&&/INPUT|TEXTAREA/.test(document.activeElement.tagName)))licht(!LICHT.aan)});
setInterval(()=>{try{if(G.fiets&&G.fiets.pos())lichtObj()}catch(e){}},1000);
S1.licht=licht;S1.lichtKnop=lichtKnop;S1.lichtAan=()=>LICHT.aan;

/* =================== bezorgen: echte bestellingen (G.bezorg) en nep-adressen (alleen afgeven) =================== */
async function echteRit(t,lijst,o){if(!levend(t)||!G.bezorg)return null;zorgFiets();try{return await G.bezorg.start(lijst,Object.assign({loon:3},o||{}))}catch(e){console.error(e);return null}}
// nep-adres: rijd erheen, licht uit in de straat, afgeven (E) → korte scène
async function nepRit(t,o){if(!levend(t))return false;zorgFiets();const p=o.p;let zone=false,gezegd=false;
  const iv=setInterval(()=>{if(!levend(t)){clearInterval(iv);return}const d=hyp(G.P.x-p.x,G.P.z-p.z);const inZ=d<(o.zone||45);
    if(inZ&&!zone){zone=true;if(o.lichtRegel!==false){sein('Licht uit (Rafiqs regel) · L','#ff5a4a');lichtKnop(true)}}
    if(zone&&o.lichtRegel!==false&&LICHT.aan&&d<18&&!gezegd){gezegd=true;F('licht_vergeten',(F('licht_vergeten')||0)+1)}},300);
  const ok=await doelNaar(t,o.tekst,p,{actie:o.actie||'Afgeven',sub:o.sub,r:5});clearInterval(iv);if(!ok)return false;
  if(o.lichtRegel!==false){if(!LICHT.aan&&!gezegd)meter('vertrouwen',2);else{meter('vertrouwen',-3);bericht('B.','Licht. Ik zei licht uit.',{kleur:'#ff3a2a'})}}
  if(o.scene){const r=await o.scene();if(r===false){if(o.lichtRegel!==false)licht(true);return false}}
  if(o.lichtRegel!==false){licht(true);sein('Licht weer aan','#3fe395')}return true}
Object.assign(S1,{echteRit,nepRit});

/* =================== het huis: praten, helpen en geld geven (altijd, vanaf H2) =================== */
// gezinsleden staan per dagdeel op vaste plekken in 'thuis'; E bij iemand = praatje of het geldmenu
const HUIS={spots:[]};
const dagdeel=()=>{const h=ST.klok().h;return h<6?'nacht':h<12?'ochtend':h<17?'middag':h<22?'avond':'nacht'};
const PRAAT={
 marco:{ochtend:['Mijn rug. Elke ochtend hetzelfde liedje.','School. En vanavond om tien uur thuis.'],middag:['Ze zeggen dat er weer ontslagen vallen op Kade 4.','Haal jij straks brood bij de bakker?'],avond:['Er is voetbal. Kom zitten.','Giovanni betaalt je toch wel netjes, hè?'],nacht:['Ga slapen, jongen.']},
 elena:{ochtend:['Er staat thee. Neem een boterham mee.','Ik ben om twee uur terug. De torens van de Zuidas wachten niet.'],middag:['Heb je huiswerk?','Je vader doet alsof hij niks voelt. Let jij een beetje op hem?'],avond:['Eet je mee? Er is soep.','Je bent zo vaak weg, Luca.'],nacht:['Slaap lekker, lieverd.']},
 giulia:{ochtend:['Nachtdienst. Ik ga slapen. Niet stofzuigen.'],middag:['Ik moet leren. Tentamen farmacologie.'],avond:['Ik heb vannacht dienst. Afdeling 4.'],nacht:['…']}};
function praatje(wie){const lijst=(PRAAT[wie]||{})[dagdeel()]||['Hé.'];let t=pick(lijst);
  // vlaggen kleuren de toon
  if(wie==='giulia'&&F('giulia_ruzie')&&!F('sq3_klaar'))t=pick(['Laat me.','Ik heb niks tegen je te zeggen.','Je weet wat je moet doen.']);
  if(wie==='marco'&&(F('marco_vermoeden')||0)>=3)t=pick(['Waar was jij gisteravond?','Fooi. Elke dag fooi. Vreemd werk, pizza.']);
  return t}
async function geefGeld(wie){const g=ST.geld();if(F('geld_terug')&&!F('sq1_klaar')&&wie==='marco'){await C.zeg('marco','Nee. Dat geld wil ik niet in dit huis.',{t:2.6});return}
  const keus=await mgKies({kop:'Geld geven · '+(wie==='marco'?'papa':'mama'),wie,vraag:'Je hebt '+eur(g)+'. Hoeveel geef je?',opties:[{t:'€20',id:20},{t:'€50',id:50},{t:'€100',id:100},{t:'Toch niet',id:0}].filter(x=>!x.id||x.id<=g)});
  const n=+keus||0;if(!n)return;geld(-n,'aan '+(wie==='marco'?'papa':'mama'));meter(wie==='marco'?'band_marco':'band_elena',Math.round(n/10));plusF('ouders_gekregen',n);
  await C.zeg(wie,wie==='marco'?pick(['…Dank je. Zeg niks tegen je moeder dat ik het aannam.','Dat had je niet hoeven doen.']):pick(['Lieverd. Waar haal jij dat toch allemaal vandaan?','Dankjewel. Voor de boodschappen.']),{t:2.8});
  const tot=F('ouders_gekregen')||0;if(tot>=150&&!F('sq1_start')){F('sq1_start',1);sein('Side quest: Het loonstrookje (papa)','#d6a63e')}
  if(tot>=300&&!F('sq2_start')){F('sq2_start',1);sein('Side quest: Het oudergesprek (mama)','#7fd1ff')}}
const HELP={marco:['Warmtekussen brengen','Hij legt zijn hand op je schouder. "Goeie jongen."','band_marco'],elena:['Afwassen','Ze droogt af, jij wast. Even is het gewoon.','band_elena'],giulia:['Haar overhoren','Drie vragen. Ze is goed. Beter dan ze denkt.','band_giulia']};
async function huisMenu(wie){const naam={marco:'Papa',elena:'Mama',giulia:'Giulia'}[wie];const opts=[{t:'Praten',id:'praat'}];
  if(!F('geholpen_'+wie+'_'+(ST.st().avond||0)))opts.push({t:HELP[wie][0],id:'help'});
  if(wie!=='giulia'&&F('s1_geldgeven'))opts.push({t:'Geld geven',id:'geld'});
  const vrijNu=/^(tussen:|vrij)/.test(F('s1_hfd')||'')&&!S1.bezig;
  if(vrijNu&&wie==='marco'&&F('sq1_start')&&!F('sq1_klaar'))opts.push({t:'"Wil je mijn loonstrookje zien?"',id:'sq1'});
  if(vrijNu&&wie==='elena'&&F('sq2_start')&&!F('sq2_klaar'))opts.push({t:'"Wat is er, mam?"',id:'sq2'});
  if(vrijNu&&wie==='giulia'&&F('giulia_ruzie')&&!F('sq3_klaar')&&!F('sq3_start'))opts.push({t:'"Kunnen we praten?"',id:'sq3'});
  opts.push({t:'Niks',id:'weg'});const k=await mgKies({kop:naam,wie,vraag:naam,opties:opts});
  if(k==='praat')await C.zeg(wie,praatje(wie),{t:2.8});
  else if(k==='help'){F('geholpen_'+wie+'_'+(ST.st().avond||0),1);await C.zeg(null,HELP[wie][1],{t:2.8});meter(HELP[wie][2],3)}
  else if(k==='geld')await geefGeld(wie);
  else if(k==='sq1'&&S1.sq1)S1.sq1();else if(k==='sq2'&&S1.sq2)S1.sq2();else if(k==='sq3'&&S1.sq3)S1.sq3()}
function huisInit(){if(!G.spot||HUIS.init)return;HUIS.init=1;
  ['marco','elena','giulia'].forEach(wie=>{const sp=G.spot({story:1,k:'fam_'+wie,x:0,z:0,r:1.9,prio:2,n:{marco:'Papa',elena:'Mama',giulia:'Giulia'}[wie],sub:'Praten · helpen'+(wie!=='giulia'?' · geld geven':''),col:{marco:'#d6a63e',elena:'#7fd1ff',giulia:'#c49bff'}[wie],h:2.3,
    show:()=>{if(B.waar()!=='thuis'||C.active()||F('s1_huis_stil')||S1.bezig)return false;const a=B.extra('thuis',wie);if(!a||a.uit||!a.g||!a.g.visible)return false;return true},
    act:()=>huisMenu(wie)});sp.wie=wie;HUIS.spots.push(sp)});
  setInterval(()=>{if(!B||B.waar()!=='thuis')return;HUIS.spots.forEach(sp=>{try{const a=B.extra('thuis',sp.wie);if(a){sp.x=a.x;sp.z=a.z}}catch(e){}})},400)}
// wie is waar thuis (per dagdeel); verborgen als ze weg zijn
function huisZet(){try{const d=dagdeel(),ex=B.extra('thuis');if(!ex)return;const zet=(wie,aan,x,z,ry,anim,sitY)=>{const a=ex[wie];if(!a)return;B.toon('thuis',wie,aan);if(!aan)return;a.zet(W('thuis',x,z)[0],W('thuis',x,z)[1],ry);a.doe(anim,{sitY})};
  const giuliaWeg=F('giulia_weg')||(d==='nacht');
  if(d==='ochtend'){zet('marco',true,7.4,4.6,0,'sit',-.42);zet('elena',true,12.2,2.25,0,'kok');zet('giulia',!giuliaWeg,7.0,5.9,PI,'sit',-.42)}
  else if(d==='middag'){zet('marco',true,3.6,6.25,PI,'tv',-.4);zet('elena',!F('elena_werk'),12.2,2.25,0,'kok');zet('giulia',!giuliaWeg,8.5,11.0,PI/2,'sit',-.42)}
  else if(d==='avond'){zet('marco',true,3.6,6.25,PI,'tv',-.4);zet('elena',true,12.2,2.25,0,'kok');zet('giulia',!giuliaWeg,7.4,5.95,PI,'schrijfzit',-.42)}
  else{zet('marco',false);zet('elena',false);zet('giulia',false)}}catch(e){console.error(e)}}
S1.huisZet=huisZet;
let wasThuis=false;setInterval(()=>{if(!ST||!B)return;const t=B.waar()==='thuis';if(t&&!wasThuis&&!C.active())huisZet();wasThuis=t},500);

/* =================== vrij rondrijden en het volgende hoofdstuk =================== */
// tussen hoofdstukken: een gouden markering op de plek van het volgende hoofdstuk; daar drukken = verder
const VOLG={};S1.VOLG=VOLG;   // id → {tekst, p(), sub, binnen}
let poortT=0;
async function tussen(t,volgend){const v=VOLG[volgend];if(!v){ST.goto(volgend);return}
  ST.doel(v.tekst,typeof v.p==='function'?v.p():v.p);
  const p=typeof v.p==='function'?v.p():v.p;const ok=await ST.aankomst(p,{r:v.binnen?2.4:8,actie:v.actie||'Verder met het verhaal',sub:v.sub,gebouw:v.gebouw,geldig:()=>levend(t)});
  if(!ok||!levend(t))return;ST.doel(null);if(!p.binnen)fietsAf();ST.goto(volgend)}
S1.tussen=tussen;

/* =================== hoofdstuk-loper met hervatpunten =================== */
// def: {id, titel, sub, blokken:[async (t)=>…], na:'volgende stap', vrij:bool, outfit}
const HFD=[];S1.HFD=HFD;
const PLEKVAN={s1_h4:['hotel','kantoor'],s1_h7:['rijtjeshuis'],s1_h10:['parkeergarage','havenloods'],s1_h12:['jachthaven']};
function hoofdstuk(def){HFD.push(def);ST.step(def.id,{doel:null,outfit:def.outfit||null,async start(o){const t=nieuw();css();
  const s=ST.st();if(F('s1_hfd')!==def.id){F('s1_hfd',def.id);F('s1_cp',0)}
  try{(PLEKVAN[def.id]||[]).forEach(k=>{if(!F('plek_'+k))F('plek_'+k,1)})}catch(e){}
  let i=F('s1_cp')||0;if(o&&o.hervat&&i>0&&def.hervat)try{await def.hervat(t,i)}catch(e){console.error(e)}
  for(;i<def.blokken.length;i++){if(!levend(t))return;F('s1_cp',i);try{const r=await def.blokken[i](t);if(r==='stop')return;if(typeof r==='string'&&r.startsWith('goto:')){F('s1_cp',0);ST.goto(r.slice(5));return}}catch(e){console.error('s1 '+def.id+' blok '+i,e)}}
  if(!levend(t))return;F('s1_cp',0);F('s1_klaar_'+def.id,Date.now());
  if(def.na){const n=typeof def.na==='function'?def.na():def.na;if(def.vrij&&VOLG[n]){F('s1_hfd','tussen:'+n);await tussen(t,n)}else ST.goto(n)}}});}
S1.hoofdstuk=hoofdstuk;

/* =================== de teaser aan het eind (en als iemand Seizoen 2 probeert) =================== */
function teaser(o){o=o||{};css();return new Promise(res=>{const el=document.createElement('div');el.className='s1-tease';
  const sam=o.samenvatting?`<div class="s1-sam">${o.samenvatting}</div>`:'';
  el.innerHTML=`<h2>ONDERWERELD<small>DE BEZORGER</small></h2><p><i></i>SEIZOEN 2 KOMT 24 NOVEMBER</p>${sam}<div class="rij">${o.knoppen?'<button class="s1-knop" data-v>Vrij rondrijden</button><button class="s1-knop g" data-o>Opnieuw beginnen</button>':'<button class="s1-knop" data-v>Oké</button>'}</div>`;
  document.body.appendChild(el);requestAnimationFrame(()=>el.classList.add('in'));let tik=setInterval(()=>fx('tab'),2200);try{G.pause&&G.pause()}catch(e){}
  const dicht=v=>{clearInterval(tik);el.classList.remove('in');setTimeout(()=>el.remove(),900);try{G.resume&&G.resume()}catch(e){}res(v)};
  el.querySelector('[data-v]').onclick=()=>dicht('vrij');const ob=el.querySelector('[data-o]');if(ob)ob.onclick=()=>{if(confirm&&0)return;dicht('opnieuw')}})}
S1.teaser=teaser;

/* =================== starten =================== */
const iv=setInterval(()=>{if(!G.ready||!G.story||!G.cut||!G.binnen||!G.story.step||!G.h1||!G.h1.lib)return;clearInterval(iv);
  ST=G.story;C=G.cut;B=G.binnen;K=G.kit;L=G.h1.lib;S1.ST=ST;S1.C=C;S1.B=B;S1.K=K;S1.L=L;
  try{cast()}catch(e){console.error(e)}css();
  // de oude hoofdstuk-1-sloten: Sahara en het rijtjeshuis zijn gewoon open in het nieuwe verhaal (Sahara via het verhaal)
  try{B.slot('rijtjeshuis',true,'Je hebt hier niks te zoeken')}catch(e){}
  setTimeout(huisInit,600);
  (S1.onStart||[]).forEach(f=>{try{f()}catch(e){console.error(e)}});
  // oude voortgang (hoofdstukken van het vorige verhaal): seizoen 1 begint opnieuw
  // release van Seizoen 1: iedereen begint één keer helemaal opnieuw aan De Bezorger (S1.RESET_V ophogen = nog een keer)
  try{const st=ST.st();if(st.s1reset!==S1.RESET_V){const inst=st.inst;Object.keys(st).forEach(k=>{if(k!=='inst')delete st[k]});st.v=3;st.inst=inst||{};st.step='start';st.s1reset=S1.RESET_V;st.reset=Date.now();
    try{window.save&&window.save()}catch(e){}}}catch(e){console.error(e)}
  try{const st=ST.st();if(st.step&&!/^(s1_|start$)/.test(st.step)){const inst=st.inst;Object.keys(st).forEach(k=>{if(k!=='inst')delete st[k]});st.v=3;st.inst=inst||{};st.s1reset=S1.RESET_V;st.step='start';st.reset=Date.now();
    try{window.save&&window.save()}catch(e){}setTimeout(()=>{try{if(ST.st().step==='start'&&!G.titelOpen)ST.goto('start')}catch(e){}},900)}}catch(e){console.error(e)}
},120);
S1.onStart=[];
S1.RESET_V='release-1';
})();
