// Verhaal "De Bezorger" · Seizoen 2 · Hoofdstuk 2 · Twee bazen (VIP en High roller).
// Het dubbelleven: twee telefoons, twee bazen, school, thuis en de pizzeria. Elke speldag maak je een planning
// (drie blokken, vier dingen die iemand van je wil): wat je laat liggen, kost vertrouwen.
// Missies: geld ophalen voor Ray, op de uitkijk bij de parkeergarage, Dex erbij, de tweede telefoon (Marco),
// de scooterdief (als je hem liet gaan), de inval bij Sahara (als je Rafiq verraadde) of Rafiq die de lekker zoekt,
// en Dex die voor de school wordt opgepakt. Geld-poort: de moeder van Dex helpen kost €2.000.
// Speciale klussen van een onbekend nummer staan niet op de kaart.
// Release: LIVE hieronder. Zolang die uit staat, ziet de speler na Seizoen 1 "coming soon" (stad-h1.js).
(function(){
'use strict';
const LIVE=false;
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH)return;
const $s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const PI=Math.PI,sin=Math.sin,cos=Math.cos;
let ST,C,B,L;   // L = hulpjes uit hoofdstuk 1
// testen kan alleen lokaal (localhost) met een vlag in localStorage; op de echte site telt alleen LIVE
const live=()=>{if(LIVE)return true;try{return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('verhaal_s2_test')==='1'}catch(e){return false}};
G.h2={live,begin:()=>{if(!ST)return;const s=ST.st();s.ch=2;try{save()}catch(e){}ST.goto('h2_start')}};

/* =================== auto's (politie, burgers) =================== */
function auto(kleur,politie){const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c});const box=(w,h,d,c,x,y,z,em)=>{const mm=em?new TH.MeshBasicMaterial({color:c}):m(c);const o=new TH.Mesh(new TH.BoxGeometry(w,h,d),mm);o.position.set(x,y,z);o.castShadow=true;g.add(o);return o};
  box(1.8,.62,4.2,kleur,0,.62,0);box(1.62,.5,2.2,politie?'#f1efe9':kleur,0,1.18,-.2);box(1.64,.38,2.0,'#1a2430',0,1.2,-.2);
  [[-.82,1.3],[.82,1.3],[-.82,-1.3],[.82,-1.3]].forEach(([x,z])=>box(.26,.62,.62,'#121214',x,.32,z));
  box(.36,.12,.06,'#fff6c8',-.6,.66,2.11,1);box(.36,.12,.06,'#fff6c8',.6,.66,2.11,1);box(.36,.12,.06,'#ff3a2a',-.6,.66,-2.11,1);box(.36,.12,.06,'#ff3a2a',.6,.66,-2.11,1);
  if(politie){box(1.82,.16,4.22,'#2a5bd7',0,.72,0);g.userData.lamp=[box(.34,.14,.3,'#3a7bff',-.24,1.5,-.2,1),box(.34,.14,.3,'#ff3a3a',.24,1.5,-.2,1)]}
  return g}
// de dichtstbijzijnde weg en welke kant hij op loopt: twee punten over 'len' meter
function wegLijn(x,z,len){const T=M.T;let best=null;for(let r=0;r<30&&!best;r++)for(let a=0;a<16;a++){const px=Math.round(x+cos(a/16*PI*2)*r),pz=Math.round(z+sin(a/16*PI*2)*r);if(M.at(px,pz)===T.ROAD){best={x:px+.5,z:pz+.5};break}}
  if(!best)return [{x:x-len/2,z},{x:x+len/2,z}];let nx=0,nz=0;for(let k=-12;k<=12;k++){if(M.at(Math.floor(best.x+k),Math.floor(best.z))===T.ROAD)nx++;if(M.at(Math.floor(best.x),Math.floor(best.z+k))===T.ROAD)nz++}
  return nx>=nz?[{x:best.x-len/2,z:best.z},{x:best.x+len/2,z:best.z}]:[{x:best.x,z:best.z-len/2},{x:best.x,z:best.z+len/2}]}
// één gedeelde frame-hook voor alles wat hier beweegt
const TICK=new Set();let hooked=false;function tick(f){if(!hooked){hooked=true;const f0=G.onFrame;G.onFrame=dt=>{f0&&f0(dt);TICK.forEach(fn=>{try{fn(dt)}catch(e){console.error(e)}})}}TICK.add(f);return ()=>TICK.delete(f)}
// laat een auto langs een lijn rijden (Promise); op het eind wacht hij of verdwijnt hij
function rij(g,pts,v,o){o=o||{};return new Promise(res=>{let i=1,x=pts[0].x,z=pts[0].z;g.position.set(x,0,z);G.scene().add(g);let alive=true,t=0,un=null;
  const stop=()=>{if(!alive)return;alive=false;un&&un();if(!o.blijf)g.parent&&g.parent.remove(g);res()};g.userData.stop=stop;
  let pt=performance.now();un=tick(()=>{const nu=performance.now(),dt=Math.min(.25,(nu-pt)/1000);pt=nu;if(!alive||G.paused)return;t+=dt;const p=pts[i];if(!p){stop();return}const dx=p.x-x,dz=p.z-z,d=Math.hypot(dx,dz);const sp=(o.rem&&i===pts.length-1&&d<14?Math.max(1.5,v*d/14):v)*dt;
    if(d<sp+.05){x=p.x;z=p.z;i++}else{x+=dx/d*sp;z+=dz/d*sp;g.rotation.y=Math.atan2(dx,dz)}g.position.set(x,0,z);g.userData.x=x;g.userData.z=z;
    const lamp=g.userData.lamp;if(lamp){const on=(t*4|0)%2;lamp[0].visible=!!on;lamp[1].visible=!on}if(o.tick)o.tick(x,z)})})}

/* =================== de dagplanning =================== */
const TAAK={
  school:{n:'School',wie:'docent',c:'#a9dcff',sub:'Les van Meneer Visser',mis:'Familie omlaag (spijbelen)',alleen:0},
  giovanni:{n:'Dienst bij Giovanni',wie:'giovanni',c:'#3fe395',sub:"Pizza's bezorgen",mis:'Giovanni moet het zelf doen'},
  rafiq:{n:'Rit voor Rafiq',wie:'rafiq',c:'#ffd35a',sub:'Pakketjes onder de pizza',mis:'Rafiq wacht · loyaliteit omlaag'},
  ray:{n:'Klus voor Ray',wie:'nova',c:'#ff3d7a',sub:'Via Nova',mis:'Ray wacht · loyaliteit omlaag'},
  dex:{n:'Ritten met Dex',wie:'dex',c:'#ff5a4a',sub:'Samen twee adressen',mis:'Dex rijdt alleen'}};
const BLOK=['Middag · 15:00','Avond · 19:00','Nacht · 22:30'],BLOKT=[[15,0],[19,0],[22,30]];
function planning(dag,taken){return new Promise(res=>{L.css();const el=document.createElement('div');el.className='h2-plan';
  const st=document.createElement('style');st.textContent=`.h2-plan{position:fixed;inset:0;z-index:70;background:#0b0a0ecc;display:flex;align-items:center;justify-content:center;padding:max(14px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(14px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));font:500 14px/1.35 'Space Grotesk',system-ui,sans-serif;color:#f1efe9}
  .h2-in{width:min(560px,100%);max-height:100%;overflow:auto;background:#141118;border:2px solid #2c2734;box-shadow:0 8px 0 #0008;padding:16px}
  .h2-in small{font:700 11px monospace;letter-spacing:.14em;text-transform:uppercase;color:#ffd35a}.h2-in h3{margin:2px 0 4px;font:800 22px 'Space Grotesk',system-ui}.h2-in p{margin:0 0 12px;color:#c9c4b8}
  .h2-blok{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.h2-blok div{border:2px dashed #3a3442;min-height:66px;padding:6px;font-size:12px;color:#8a8f98;display:flex;flex-direction:column;gap:4px}
  .h2-blok div.vol{border-style:solid;color:#f1efe9}.h2-blok b{font-size:13px}
  .h2-taken{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}.h2-taken button{text-align:left;font:600 13px 'Space Grotesk',system-ui;color:#f1efe9;background:#1d1924;border:2px solid #3a3442;border-left:6px solid var(--c);padding:9px 10px;cursor:pointer;touch-action:manipulation}
  .h2-taken button[disabled]{opacity:.35}.h2-taken button em{display:block;font-style:normal;font-size:11px;color:#8a8f98;margin-top:2px}.h2-taken button.weg{opacity:.55;border-left-color:#555}
  .h2-voet{display:flex;gap:8px;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap}.h2-voet span{font-size:12px;color:#ff9a8a}
  .h2-voet button{font:800 14px 'Space Grotesk',system-ui;color:#121016;background:#ffd35a;border:0;border-bottom:4px solid #b8902a;padding:11px 16px;cursor:pointer}.h2-voet button[disabled]{opacity:.4}.h2-voet .ghost{background:#2a2630;color:#f1efe9;border-color:#16131a}`;
  el.appendChild(st);const inn=document.createElement('div');inn.className='h2-in';el.appendChild(inn);document.body.appendChild(el);G.pause&&G.pause();
  let plan=[null,null,null];
  const draw=()=>{const vrij=plan.indexOf(null),gekozen=plan.filter(Boolean),mis=taken.filter(k=>!gekozen.includes(k));
    inn.innerHTML=`<small>Dag ${dag} · twee telefoons</small><h3>Je planning</h3><p>Drie blokken, ${taken.length} mensen die iets van je willen. Wie je laat wachten, wordt achterdochtig.${taken.includes('school')?' School kan alleen in de middag.':''}</p>
     <div class="h2-blok">${plan.map((k,i)=>`<div class="${k?'vol':''}" data-b="${i}" style="${k?'border-color:'+TAAK[k].c:''}"><span>${BLOK[i]}</span>${k?`<b>${TAAK[k].n}</b><em style="font-style:normal;color:#8a8f98">tik om te wissen</em>`:'leeg'}</div>`).join('')}</div>
     <div class="h2-taken">${taken.map(k=>{const t=TAAK[k],in_=gekozen.includes(k),kan=!in_&&vrij>=0&&!(k==='school'&&plan[0]);return `<button data-k="${k}" style="--c:${t.c}" ${kan||in_?'':'disabled'} class="${in_?'weg':''}">${t.n}<em>${in_?'gepland':t.sub}</em></button>`}).join('')}</div>
     <div class="h2-voet"><span>${vrij<0&&mis.length?'Laat je liggen: '+mis.map(k=>TAAK[k].n+' ('+TAAK[k].mis+')').join(', '):''}</span><button data-ok ${vrij<0?'':'disabled'}>Dag beginnen</button></div>`};
  inn.addEventListener('click',e=>{const t=e.target.closest('[data-k]');if(t&&!t.disabled){const k=t.dataset.k;if(plan.includes(k)){plan[plan.indexOf(k)]=null}else if(k==='school'){if(!plan[0])plan[0]='school';else return}else{let j=plan.findIndex((v,x)=>!v&&x>0);if(j<0)j=plan.indexOf(null);if(j>=0)plan[j]=k}L.fx('click');draw();return}
    const b=e.target.closest('[data-b]');if(b){plan[+b.dataset.b]=null;draw();return}
    if(e.target.closest('[data-ok]')&&plan.indexOf(null)<0){el.remove();G.resume&&G.resume();res(plan.slice())}});
  draw()})}
// gevolgen van wat je liet liggen
function gemist(k){if(k==='school'){ST.meter('fam_elena',-4);ST.meter('fam_marco',-2);ST.flag('spijbel',(ST.flag('spijbel')||0)+1);L.sein('De school belt naar huis: Luca was er niet','#ff6a5a')}
  else if(k==='giovanni'){ST.flag('giovanni_mis',(ST.flag('giovanni_mis')||0)+1);L.sein('Giovanni bezorgt zelf. Met zijn rug.','#ff9a5a')}
  else if(k==='rafiq'){ST.meter('loy_rafiq',-6);L.sein('Rafiq heeft lang gewacht','#ff9a5a')}
  else if(k==='ray'){ST.meter('loy_ray',-6);L.sein('Nova: "Ray wacht niet graag."','#ff3d7a')}
  else if(k==='dex'){ST.meter('loy_dex',-4);L.sein('Dex rijdt zijn eerste rit alleen','#ff9a5a')}}

/* =================== cast erbij =================== */
function cast(){const CA=C.actors;const mk=(id,n,rol,col,look,face,o)=>{if(!CA[id])CA[id]=Object.assign({n,col,rol,look,face},o||{})};
  mk('kevin','Kevin','Loopt drie weken achter','#9aa1ab',{skin:'#e8c4a0',hair:'#c9a46a',hs:'kort',fh:'stoppel',eye:'#3a4a60',mood:'bang',top:{kind:'tee',c:'#3a4a60'},legs:{kind:'track',c:'#2a2c30'},shoes:{kind:'sneaker',c:'#e8e4da'}},
    {skin:'#e8c4a0',hair:'#c9a46a',hs:'kort',fh:'stoppel',eye:'#3a4a60',top:'#3a4a60',col:'shirt',age:1,fw:18});
  mk('moeder_dex','Moeder van Dex','','#ffb0d0',{skin:'#8d5a3a',hair:'#16161a',hs:'knot',eye:'#24160e',mood:'bang',top:{kind:'jacket',c:'#7a3a5a'},legs:{kind:'jeans',c:'#2c3a4d'},shoes:{kind:'boot',c:'#2a1a12'}},
    {skin:'#8d5a3a',hair:'#16161a',hs:'knot',eye:'#24160e',top:'#7a3a5a',col:'blouse',age:1,v:1,fw:16});
  mk('agent2','Agent','Politie','#4d7dff',Object.assign({},C.look('agent')||{}),C.face('agent'));}

/* =================== de missies =================== */
// elke missie: async (t) → klaar. t = RUN-teken; als het verhaal ondertussen verder springt, stoppen we.
let RUN=0;const nieuw=()=>++RUN;
function doelNaar(tekst,p,r,o){o=o||{};return new Promise(res=>{ST.doel(tekst,p.binnen?p:{x:p.x,z:p.z});const t0=RUN;const iv=setInterval(()=>{if(RUN!==t0){clearInterval(iv);res(false);return}
  if(G.cut&&G.cut.active())return;const w=B.waar();if(p.binnen?w===p.binnen&&(p.x==null||Math.hypot(G.P.x-p.x,G.P.z-p.z)<(r||2)):(!w&&Math.hypot(G.P.x-p.x,G.P.z-p.z)<(r||8))){clearInterval(iv);if(o.fietsAf!==false)L.fietsAf();res(true)}},250)})}
const pct=()=>L.F('aanbod')||20;
// over de schouder van a naar b kijken (camera achter a, een stukje opzij en hoger)
function schouder(a,b,d,zij,h){const dx=a.x-b.x,dz=a.z-b.z,n=Math.hypot(dx,dz)||1,ux=dx/n,uz=dz/n;d=d||3.2;zij=zij==null?1.2:zij;h=h||2.4;
  return L.cam(a.x+ux*d-uz*zij,h,a.z+uz*d+ux*zij,b.x,1.2,b.z)}

async function mSchool(t,dag){const S=L.A('school',232,337);if(!await doelNaar('Naar school',S,9))return;await L.binnen('klas');if(t!==RUN)return;
  const seat=B.plek('klas','luca');const Q=[
   [['Wat is btw?','Belasting op wat je koopt','Belasting op je loon','Een boete'],0],
   [['Iemand verdient €100 en houdt €63 over. Hoeveel procent ging weg?','63%','37%','100%'],1],
   [['Waarom witwassen criminelen geld?','Om het schoon te maken voor de wasmachine','Zodat het lijkt alsof het eerlijk verdiend is','Omdat het verplicht is'],1],
   [['Wat is rente?','Geld dat je betaalt om te mogen lenen','Een soort belasting','Wat je spaart'],0],
   [['Wat doet de Belastingdienst als je veel geld uitgeeft maar weinig verdient?','Niks','Vragen stellen','Je een prijs geven'],1]];
  const vr=[Q[(dag*2)%5],Q[(dag*2+1)%5]];let goed=0;
  const sc=[{fade:'out',t:.01},{speler:false},{actor:'luca',at:[seat.x,seat.z],ry:PI,anim:'sit',sitY:-.42},{fn:()=>{const a=C.acteur('luca');if(a)a.g.binnenId=1}},
   L.cam(...L.W3('klas',13.8,3.0,1.2),...L.W3('klas',10.6,.9,6.8)),{fade:'in',t:.5},
   {say:'docent',text:dag===1?'Overhoring. Telefoons in de tas. Ja, De Santis, ook die tweede.':'Goedemiddag. Even kijken wie er nog wakker is.',t:3}];
  vr.forEach(([q,a])=>{sc.push({keuze:q.slice(1).map((x,i)=>({t:x,id:'q'+i,f:()=>{if(i===a)goed++}})),wie:'docent',text:q[0]});sc.push({fn:()=>{}})});
  sc.push({say:'docent',text:'…Hm. Niet slecht, De Santis. Niet slecht.',t:2},{fade:'out',t:.4},{weg:'luca'},{speler:true},{fade:'in',t:.4});
  // de reactie hangt af van de antwoorden: na de keuzes aanpassen
  await C.play(sc.slice(0,-5));if(t!==RUN)return;
  await C.play([{say:'docent',text:goed===2?'Twee goed. Jij snapt meer van geld dan je laat zien, De Santis.':goed===1?'Eén goed. Je hoofd zit ergens anders, hè?':'Nul. Waar ben jij met je gedachten?',t:2.8},
    {say:'dex',text:goed===2?'Nerd.':'Hij denkt aan pizza.',t:1.6,mood:'blij'},{fade:'out',t:.4},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);
  if(goed===2){ST.meter('fam_elena',2);L.sein('Goed cijfer · mama is trots','#3fe395')}ST.flag('school_'+dag,goed);await L.buiten()}

async function mGiovanni(t,dag){const N=L.A('napoli',419,492);if(!await doelNaar('Dienst bij Bella Napoli',N,9))return;
  await C.zeg('giovanni',ST.flag('giovanni_mis')?'Ah, kijk wie er is. Gisteren deed ik het zelf. Mijn rug, ragazzo. Mijn rug.':pick(['Op tijd! Bravo. Twee bestellingen, vai!','Ragazzo! Sanne helpt vandaag aan de kassa, jij rijdt.','Ze wachten al. Nooit scheef, hè!']),{t:2.8});if(t!==RUN)return;
  L.zorgFiets(N);
  // dag 3 en Rafiq verraden: de bestelling gaat naar Sahara (de inval)
  if(dag===3&&L.F('envelop')==='verraden'&&!L.F('inval')){await mInval(t);return}
  const b=['familie','student','oude_man','feest','kantoor'].sort(()=>Math.random()-.5).slice(0,2).map((k,i)=>Object.assign({},G.bezorg.adres({klant:k,min:80,max:380}),{klant:k,pizzas:1+(i===0?1:0),id:'g'+dag+i})).filter(o=>o.x!=null);
  const sum=await G.bezorg.start(b);if(t!==RUN)return;if(sum&&sum.ok===b.length)ST.flag('giovanni_mis',0)}
function pick(a){return a[Math.floor(Math.random()*a.length)]}

async function mRafiq(t,dag){const A2=L.A('napoli_achter',388,492);if(!await doelNaar('Ophalen achter Bella Napoli',A2,4))return;
  const gelaten=L.F('dief')==='gelaten',l=L.P(),k=L.voor(2.2);const wie=gelaten?'scooterdief':'koerier';
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:wie,at:[k.x,k.z],ry:L.naar(k,l),prop:'tas'},L.rond(k.x,k.z,L.naar(k,l)+1.1,3.4,1.6,1.3),
   {say:wie,text:pick(['Twee adressen. Rafiq zegt: niet treuzelen.','Vandaag zwaarder dan anders. Fiets voorzichtig.','Hier. En niet tellen waar mensen bij zijn.']),t:2.6,mood:'koel'},
   {anim:wie,a:'give',naar:'luca'},{anim:'luca',a:'give',prop:'tas'},{snd:'grab'},{fade:'out',t:.3},{weg:wie},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);if(t!==RUN)return;
  // de scooterdief weet van Ray (alleen als je hem liet gaan)
  if(gelaten&&dag===2&&!L.F('dief2'))await mDief(t);if(t!==RUN)return;
  L.zorgFiets();const b=[0,1].map(i=>Object.assign({},G.bezorg.adres({klant:pick(['feest','chagrijn','familie']),min:110,max:420}),{klant:pick(['feest','chagrijn']),pizzas:1,extra:true,id:'r'+dag+i})).filter(o=>o.x!=null);
  await G.bezorg.start(b,{onKlaar(r){if(r.ok)ST.geld(Math.round(500*pct()/100),pct()+'% van Rafiq')}})}

async function mDief(t){const l=L.P(),k=L.voor(2);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'scooterdief',at:[k.x,k.z],ry:L.naar(k,l),anim:'leun'},L.rond(k.x,k.z,L.naar(k,l)+.9,3,1.6,1.4),
   {say:'scooterdief',text:'Nog één ding, Napoli. Ik zag je gisteren. Bij Nova. Ray’s Nova.',t:3,mood:'koel'},
   {say:'scooterdief',text:'Rafiq zou dat heel interessant vinden, denk je niet?',t:2.4},
   {keuze:[{t:'Omkopen',id:'koop',sub:'€500'},{t:'Bang maken',id:'bang',sub:'Straat'},{t:'Hem voor zijn: zelf aan Rafiq vertellen',id:'voor',sub:'Rafiq weet het dan'}],wie:'luca',text:'Hij weet het.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='koop'){const kan=ST.geld()>=500;await C.play(kan?[{anim:'luca',a:'give',prop:'geld',naar:'scooterdief'},{fn:()=>ST.geld(-500,'zwijggeld')},{say:'scooterdief',text:'Niks gezien. Niks gehoord. Fijne dag, Napoli.',t:2.4,mood:'blij'}]
      :[{say:'luca',text:'Ik heb het nu niet. Morgen.',t:1.8},{say:'scooterdief',text:'Morgen is de prijs duizend.',t:2,mood:'koel'}]);L.F('dief2',kan?'gekocht':'schuld')}
  else if(r==='bang'){await C.play([{anim:'luca',a:'duw',naar:'scooterdief'},{snd:'hit'},{say:'luca',text:'Jij hebt mij nooit gezien. Want als Rafiq hoort dat jij praat, wie denk je dat hij gelooft? Jou? Met jouw verleden?',t:4,mood:'koel'},
     {anim:'scooterdief',a:'bang'},{say:'scooterdief',text:'Rustig… rustig. Ik zeg niks.',t:2,mood:'bang'}]);L.F('dief2','bang');ST.koers(4,'straat');if(Math.random()<.4)L.F('dief_praat',1)}
  else{await C.play([{anim:'luca',a:'bel',prop:'telefoon'},{fn:L.tril},{say:'luca',text:'Rafiq. Ray heeft me benaderd. Na die avond in Oud-Zuid. Ik wilde dat je het van mij hoorde.',t:3.6},
     {say:'rafiq',text:'…Dat waardeer ik. Echt. Maar vanaf nu let ik op je, jongen.',t:3,mood:'koel'}]);L.F('dief2','voor');L.F('rafiq_weet',1);ST.meter('loy_rafiq',L.F('envelop')==='verraden'?-4:6)}
  C.weg('scooterdief');C.weg('luca')}

async function mRayGeld(t){const ad=G.bezorg.adres({klant:'student',min:180,max:520})||{x:L.A('portiek',182,390).x,z:L.A('portiek',182,390).z,adres:'Portiek'};
  await C.play([{fn:L.tril},{say:'nova',text:'Kevin. '+(ad.adres||'Westbuurt')+'. Loopt drie weken achter. Twaalfhonderd. Ray wil het vandaag.',t:3.6,mood:'koel'},{say:'luca',text:'En als hij het niet heeft?',t:1.8},{say:'nova',text:'Dan ben je creatief.',t:1.8}]);
  if(t!==RUN)return;L.zorgFiets();if(!await doelNaar('Geld ophalen bij Kevin',ad,6))return;
  const l=L.P(),k=L.voor(1.6),sc=L.scooter('#2a6ad0'),sp=L.walk(k.x+2.6,k.z+1,3);sc.position.set(sp.x,0,sp.z);G.scene().add(sc);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'kevin',at:[k.x,k.z],ry:L.naar(k,l)},{snd:'deurbel'},L.rond(k.x,k.z,L.naar(k,l)+1,2.8,1.6,1.4),
   {say:'kevin',text:'Jij? Een kind? Stuurt Ray tegenwoordig kinderen?',t:2.6},{say:'luca',text:'Twaalfhonderd, Kevin. Drie weken.',t:2},
   {say:'kevin',text:'Ik héb het niet, man. Mijn uitkering komt pas volgende week. Kijk dan, er staat niks in huis.',t:3.2,mood:'bang'},
   {keuze:[{t:'Praten: een afbetalingsregeling',id:'zak',sub:'Zakelijk · minder nu, meer later'},{t:'Dreigen',id:'straat',sub:'Straat · alles nu, de buurt ziet het'},{t:'Zijn scooter meenemen',id:'scooter',sub:'Ray verkoopt hem'}],wie:'luca',text:'Kevin trilt.'}],{blijf:true});
  if(t!==RUN){sc.parent&&sc.parent.remove(sc);return}let geld=0;
  if(r==='zak'){await C.play([{say:'luca',text:'Vierhonderd nu. De rest in drie weken, plus tweehonderd voor het wachten. Schrijf het op.',t:3.4,mood:'koel'},{say:'kevin',text:'Dat… dat kan ik. Ja. Dank je.',t:2,mood:'blij'},{anim:'kevin',a:'give',prop:'geld',naar:'luca'},{snd:'cash'}]);geld=400;ST.koers(4,'zakelijk');L.F('kevin','regeling')}
  else if(r==='straat'){await C.play([{anim:'luca',a:'duw',naar:'kevin'},{snd:'hit'},{say:'luca',text:'Je hebt een tv. Een PlayStation. Een moeder die hier om de hoek woont. Twaalfhonderd. Nu.',t:3.4,mood:'boos'},
     {anim:'kevin',a:'bang'},{say:null,text:'Achter Luca gaan gordijnen open. Een buurvrouw met een telefoon in haar hand.',t:2.8},{anim:'kevin',a:'give',prop:'geld',naar:'luca'},{snd:'cash'}]);geld=1200;ST.koers(5,'straat');ST.meter('hitte',6);ST.meter('imago',-2);L.F('kevin','gedreigd')}
  else{await C.play([{say:'luca',text:'Sleutels van die scooter.',t:1.8,mood:'koel'},{say:'kevin',text:'Nee man, daar ga ik mee naar mijn werk!',t:2,mood:'bang'},{say:'luca',text:'Dan ga je lopen. Als je betaalt, krijg je hem terug.',t:2.4},
     {anim:'kevin',a:'give',prop:'sleutel',naar:'luca'},{snd:'grab'}]);geld=0;ST.koers(2,'straat');L.F('kevin','scooter')}
  await C.play([{fade:'out',t:.3},{weg:'kevin'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);sc.parent&&sc.parent.remove(sc);if(t!==RUN)return;
  // naar Nova
  const nv=L.A('hoek',236,461);if(!await doelNaar('Breng het naar Nova bij de hoek',nv,6))return;
  const l2=L.P(),q=L.voor(2.2);const deel=r==='zak'?120:r==='straat'?300:200;
  await C.play([{speler:false},{actor:'luca',at:[l2.x,l2.z],ry:l2.ry},{actor:'nova',at:[q.x,q.z],ry:L.naar(q,l2),anim:'leun'},L.rond(q.x,q.z,L.naar(q,l2)+1,3.2,1.6,1.4),
   ...(r==='zak'?[{say:'nova',text:'Vierhonderd? Een regeling? …Met rente. Hm. Ray houdt van rente.',t:3,mood:'koel'}]:r==='straat'?[{say:'nova',text:'Alles. Netjes. Al heeft de halve straat je gezien.',t:2.8,mood:'koel'}]:[{say:'nova',text:'Een scooter. Creatief. Ray kent iemand die scooters koopt.',t:2.8,mood:'koel'}]),
   {anim:'nova',a:'give',prop:'geld',naar:'luca'},{snd:'cash'},{fn:()=>ST.geld(deel,'van Ray')},{say:'nova',text:'Je deel. Ray rekent eerlijk. Zolang jij dat ook doet.',t:2.6},
   {fade:'out',t:.3},{weg:'nova'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);ST.meter('loy_ray',r==='straat'?6:4)}

async function mUitkijk(t){const g=L.A('parkeergarage',895,875),post={x:888,z:906};
  await C.play([{fn:L.tril},{say:'nova',text:'Parkeergarage aan de Boulevard. Tien uur. Jij staat op de hoek en je kijkt. Zie je blauw: seintje.',t:3.6,mood:'koel'}]);if(t!==RUN)return;
  L.zorgFiets();if(!await doelNaar('Op de uitkijk bij de parkeergarage',post,4))return;L.tijd(22,0);
  const l=L.P(),bus={x:g.x+3,z:g.z+2};
  await C.play([{actor:'nova',at:[bus.x,bus.z],ry:L.naar(bus,l),anim:'leun'},L.rond(bus.x,bus.z,L.naar(bus,l)+.6,6,2.4,1.4),
   {say:'nova',text:'Drie auto’s rijden zo de garage in. Wij doen de rest. Jij: ogen op de Boulevard.',t:3,mood:'koel'},
   {say:'nova',text:'En jongen. Een vals alarm kost ons evenveel als een gemist alarm.',t:2.8},{weg:'nova'}]);if(t!==RUN)return;
  G.frozen=1e9;const res=await uitkijk();G.frozen=0;if(t!==RUN)return;
  L.F('uitkijk',res);const ok=res.gemist===0&&res.vals<=1;
  if(res.gemist>0){ST.meter('hitte',10);ST.meter('loy_ray',-8)}else if(res.vals>1)ST.meter('loy_ray',-3);else{ST.meter('loy_ray',8);ST.geld(350,'van Ray')}
  await C.zeg('nova',res.gemist>0?'Ze hebben ons gezien. Twee man opgepakt, Luca. Twéé.':res.vals>1?'Je schreeuwt te vaak wolf. Volgende keer kijk je beter.':'Netjes. Je hebt ogen. Ray hoort het van me.',{t:3})}
// minispel: auto's over de Boulevard; alleen bij politie een seintje
function uitkijk(){return new Promise(async res=>{const lijn=[{x:775,z:918},{x:880,z:918},{x:880,z:860}],langs=[{x:775,z:918},{x:990,z:918}];
  const el=L.mgOpen(`<h4>Op de uitkijk · parkeergarage</h4><p>Auto's op de Boulevard. Alleen bij politie: seintje geven. Let op: niet elke politieauto is blauw-wit.</p>
    <div class="h1-hp"><span id="h2uN">Auto 1/5</span><span id="h2uS">0 seintjes</span></div><div class="h1-warn" id="h2uW">…</div>
    <div class="h1-knop"><button data-s="fluit">Fluiten<kbd>${touch?'':'E'}</kbd></button><button class="b" data-s="bel">Bellen<kbd>${touch?'':'Q'}</kbd></button></div>`,'uitkijk');
  const w=el.querySelector('#h2uW');let cur=null,goed=0,vals=0,gemist=0,ns=0;
  const sein=s=>{if(!cur||cur.sein)return;cur.sein=s;ns++;el.querySelector('#h2uS').textContent=ns+' seintjes';L.fx(s==='fluit'?'whistle':'notify');if(cur.pol){goed++;w.textContent=s==='fluit'?'Gefloten! De mannen zijn binnen weg.':'Gebeld. Stil en op tijd.';w.className='h1-warn ok'}else{vals++;w.textContent='Vals alarm. Dat was een gewone auto.';w.className='h1-warn'}};
  el.addEventListener('click',e=>{const b=e.target.closest('[data-s]');if(b)sein(b.dataset.s)});
  const key=e=>{const k=e.key.toLowerCase();if(k==='e'||k===' '){e.preventDefault();e.stopImmediatePropagation();sein('fluit')}else if(k==='q'){e.preventDefault();e.stopImmediatePropagation();sein('bel')}};addEventListener('keydown',key,true);
  // camera: vanaf de hoek over de Boulevard (zolang het minispel loopt)
  const r0=G.camRig;G.camRig=(dt,cam)=>{cam.position.set(892,7.5,912);cam.lookAt(800,1.2,919);if(cam.fov!==55){cam.fov=55;cam.updateProjectionMatrix()}return true};
  const reeks=['burger','politie','burger','onopvallend','burger'].map((k,i)=>({k,i}));
  for(const r of reeks){el.querySelector('#h2uN').textContent='Auto '+(r.i+1)+'/5';w.textContent='…';w.className='h1-warn';
    const pol=r.k==='politie'||r.k==='onopvallend';const g=auto(r.k==='politie'?'#f1efe9':r.k==='onopvallend'?'#2a2c30':pick(['#b0221e','#3a6a9a','#c9c4b8','#2f5d3a','#d6a63e']),r.k==='politie');
    if(r.k==='onopvallend'){const lamp=new TH.Mesh(new TH.BoxGeometry(.3,.1,.3),new TH.MeshBasicMaterial({color:'#3a7bff'}));lamp.position.set(.5,1.42,.6);g.add(lamp);g.userData.lamp=[lamp,new TH.Object3D()]}
    cur={pol,sein:null};const pad=pol||Math.random()<.4?lijn:langs;
    await rij(g,pad,pol?11:15,{});if(pol&&!cur.sein){gemist++;w.textContent='Gemist! Die reed zo de garage in.';w.className='h1-warn';L.fx('bad');await L.sleep(900)}else await L.sleep(400)}
  G.camRig=r0;try{const c=G.camera();c.fov=G.fov0||c.fov;c.updateProjectionMatrix()}catch(e){}if(G.camC)G.camC.init=false;
  removeEventListener('keydown',key,true);el.remove();res({goed,vals,gemist})})}

async function mDexErbij(t){const d=L.A('dex',277,480);if(!await doelNaar('Dex wacht bij de hoek',d,5))return;const l=L.P(),q=L.voor(2.2),wist=L.F('dex')==='weet';
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'dex',at:[q.x,q.z],ry:L.naar(q,l),anim:'leun'},L.rond(q.x,q.z,L.naar(q,l)+1,3.2,1.6,1.4),
   ...(wist?[{say:'dex',text:'En? Heb je het gevraagd? Zeg dat je het gevraagd hebt.',t:2.6,mood:'blij'},{say:'luca',text:'Rafiq zegt ja. Jij wordt tweede koerier.',t:2.2},{anim:'dex',a:'juich'},{say:'dex',text:'JAAA! Broer!',t:1.6,mood:'blij'}]
     :[{say:'dex',text:'Fooi, hè? Rijke mensen op de Zuidas? Ik heb je gezien, Luca. Achter de pizzeria. Met die gast van Rafiq.',t:3.8,mood:'boos'},{say:'luca',text:'…Dex.',t:1.4},{say:'dex',text:'Je had het gewoon kunnen zeggen. Ik wil meedoen. En ik wil dat je me niet meer voorliegt.',t:3.4},{fn:()=>ST.meter('loy_dex',-4)}]),
   {say:'dex',text:'Welke routes krijg ik?',t:1.8},
   {keuze:[{t:'De makkelijke routes',id:'veilig',sub:'Veilig · hij verveelt zich'},{t:'De spannende routes',id:'spannend',sub:'Hij wordt beter · en roekelozer'}],wie:'luca',text:'Dex is je beste vriend.'}],{blijf:true});
  if(t!==RUN)return;
  await C.play(r==='veilig'?[{say:'luca',text:'Westbuurt. Overdag. Geen gedoe.',t:2},{say:'dex',text:'Saai. Maar oké. Voor jou.',t:2}]:[{say:'luca',text:'Boulevard en Centrum. ’s Avonds. Hou je ogen open.',t:2.4},{say:'dex',text:'Eindelijk. Dit wordt een film, broer.',t:2.2,mood:'blij'}]);
  L.F('dex_routes',r);ST.meter('loy_dex',r==='spannend'?6:2);await C.play([{fade:'out',t:.3},{weg:'dex'},{weg:'luca'},{speler:true},{fade:'in',t:.3}])}

async function mDexRit(t){const d=L.A('dex',277,480);if(!await doelNaar('Rijd mee met Dex',d,6))return;const sp=L.F('dex_routes')==='spannend',l=L.P(),q=L.voor(2.2);
  await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'dex',at:[q.x,q.z],ry:L.naar(q,l),prop:'tas'},L.rond(q.x,q.z,L.naar(q,l)+1,3.2,1.6,1.4),
   {say:'dex',text:sp?'Kijk, ik heb al drie ritten gedaan vandaag. Drie! Ik reed door rood bij de tram, man, je had het moeten zien.':'Westbuurt, Westbuurt, Westbuurt. Ik ken elke stoeptegel nu.',t:3.4,mood:'blij'},
   {say:'luca',text:sp?'Door rood? Met spullen in je tas? Ben je gek?':'Saai is veilig, Dex.',t:2.2},{say:'dex',text:sp?'Relax. Niemand pakt Dex.':'Ja ja. Veilig. Kom, we doen er samen twee.',t:2.2,mood:'blij'},
   {fade:'out',t:.3},{weg:'dex'},{weg:'luca'},{speler:true},{fade:'in',t:.3}]);if(t!==RUN)return;
  L.zorgFiets();const b=[0,1].map(i=>Object.assign({},G.bezorg.adres({klant:pick(['feest','student']),min:100,max:360}),{klant:pick(['feest','student']),pizzas:1,extra:true,id:'dx'+i})).filter(o=>o.x!=null);
  await G.bezorg.start(b,{onKlaar(r){if(r.ok)ST.geld(Math.round(500*pct()/100),'rit met Dex')}});if(t!==RUN)return;
  ST.meter('loy_dex',5);await C.zeg('dex',sp?'Zie je? Een team, broer. Niemand pakt ons.':'Oké, oké. Dit was eigenlijk best chill.',{t:2.6})}
async function mTelefoon(t){await L.binnen('thuis');if(t!==RUN)return;['marco','giulia','elena'].forEach(k=>B.toon('thuis',k,false));
  const tafel=B.plek('thuis','eettafel'),mp=L.W('thuis',7.4,4.2),lp=L.W('thuis',7.4,6.3);
  const r=await C.play([{fade:'out',t:.01},{speler:false},{actor:'marco',at:mp,ry:0,anim:'sit',sitY:-.4,prop:'telefoon'},{actor:'luca',at:lp,ry:PI,anim:'sit',sitY:-.4},
   {fn:()=>['marco','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},L.cam(tafel.x+2.4,2.0,tafel.z+1.8,tafel.x,1.0,tafel.z),{fade:'in',t:.8},
   {say:null,text:'Zeven uur ’s ochtends. Mama slaapt na haar nachtdienst. Marco zit aan de keukentafel. Voor hem ligt een telefoon. Niet die van Luca. De andere.',t:4.4},
   {say:'marco',text:'Deze zat in je jaszak. Hij ging vannacht vier keer. Onbekend nummer.',t:3},
   {say:'marco',text:'Ik ben niet dom, Luca. Ik werk dertig jaar in de haven. Ik weet wat een tweede telefoon is.',t:3.4},
   L.rond(lp[0],lp[1],PI-.5,2.2,1.5,1.2),
   {keuze:[{t:'"Hij is van Dex."',id:'dex',sub:'Hij belt de moeder van Dex'},{t:'"Voor werk. Giovanni wil me kunnen bereiken."',id:'werk',sub:'Hij belt Giovanni'},{t:'De waarheid half vertellen',id:'half',sub:'Hij houdt het voor mama geheim'}],wie:'luca',text:'Marco wacht.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='dex'){await C.play([{anim:'marco',a:'bel',prop:'telefoon'},{say:'marco',text:'Dan bel ik even met de moeder van Dex.',t:2},{say:null,text:'Het gesprek duurt twee minuten. Marco zegt niets. Dan legt hij neer.',t:3},
     {say:'marco',text:'Ze wist van niks. Ze wist zelfs niet dat Dex een tweede telefoon heeft. Dus nu heeft Dex er ook een probleem bij.',t:3.6,mood:'boos'}]);ST.meter('fam_marco',-6);ST.meter('loy_dex',-6);L.F('telefoon','dex')}
  else if(r==='werk'){const gi=Math.random()<.5;await C.play([{anim:'marco',a:'bel',prop:'telefoon'},{say:'marco',text:'Giovanni? Met Marco. Heb jij mijn zoon een telefoon gegeven?',t:2.6},
     ...(gi?[{say:null,text:'Giovanni zwijgt even. Dan zegt hij: "Ja. Ja, voor de ritten." Hij liegt voor je. Je weet niet waarom.',t:3.8}]:[{say:null,text:'"Een telefoon? Nee, Marco. Hoezo?"',t:2.4},{say:'marco',text:'Hoezo. Ja. Hoezo.',t:2,mood:'boos'}])]);
    ST.meter('fam_marco',gi?-2:-8);L.F('telefoon',gi?'giovanni_liegt':'werk_mis')}
  else{await C.play([{say:'luca',text:'Ik verdien iets bij. Voor mensen van wie je dat niet wil weten. Geen drugs gebruiken, niks stelen. Ik rijd. Dat is alles.',t:4},
     {say:null,text:'Marco kijkt lang naar zijn handen. Havenhanden. Vol eelt.',t:2.8},{say:'marco',text:'Ik zeg niks tegen je moeder. Nog niet. Maar als zij het van iemand anders hoort, ben ik het die liegt. Begrijp je dat?',t:4.2},
     {say:'luca',text:'Ja, pa.',t:1.4}]);ST.meter('fam_marco',-3);L.F('telefoon','half');L.F('marco_weet',1)}
  await C.play([{fade:'out',t:.5},{weg:'marco'},{weg:'luca'},{speler:true},{fade:'in',t:.5}]);['marco','giulia'].forEach(k=>B.toon('thuis',k,true))}

async function mInval(t){const S=L.A('sahara',655,909);L.F('inval',1);L.zorgFiets();if(G.fiets)G.fiets.last(3);
  if(!await doelNaar('Breng de bestelling naar Lounge Sahara',S,8))return;if(G.fiets)G.fiets.last(0);
  await L.binnen('sahara');if(t!==RUN)return;G.draag.zet(3);const sp=L.W('sahara',11.1,25.4);G.P.x=sp[0];G.P.z=sp[1];G.P.ry=PI;
  const ag=[[8.5,21],[13.5,18.5],[6,24.5],[15.2,23]].map(([x,z],i)=>L.zetBinnen('inval'+i,...L.W('sahara',x,z),PI*(i%2?.5:1.5),{look:C.look('agent'),anim:i%2?'armen':'point'}));
  const r=await C.play([L.cam(...L.W3('sahara',11,3.3,27),...L.W3('sahara',10,1.2,18)),{snd:'whistle'},
   {say:'agent',text:'POLITIE! Iedereen blijft zitten! Handen op tafel!',t:2.6,mood:'boos'},{say:null,text:'Een inval. Blauwe jassen overal. Achterin hoor je de telmachine stoppen. Iemand gooit iets door een raam.',t:3.6},
   {keuze:[{t:'Rustig naar buiten lopen, dozen in je handen',id:'loop',sub:'Niet rennen'},{t:'Dozen laten vallen en rennen',id:'ren',sub:'Achtervolging'}],wie:'luca',text:'Je bent maar de pizzajongen. Toch?'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='ren'){G.draag.leeg();await L.buiten();ST.meter('hitte',12);L.F('inval_uit','gerend');try{G.police.report(G.P.x,G.P.z,{story:1,stars:2,why:'gevlucht bij een inval'})}catch(e){}L.sein('Ze zitten achter je aan!','#ff6a5a');await L.sleep(2000)}
  else{// stil naar buiten: niet rennen in de buurt van een agent
   ST.doel('Loop rustig naar de uitgang (niet rennen)',null);let gepakt=false;
   await new Promise(res=>{const iv=setInterval(()=>{if(t!==RUN){clearInterval(iv);res();return}if(B.waar()!=='sahara'){clearInterval(iv);res();return}
     const v=Math.hypot(G.P.vx||0,G.P.vz||0);for(const a of ag){if(Math.hypot(a.x-G.P.x,a.z-G.P.z)<5&&v>6.2){gepakt=true;clearInterval(iv);res();return}}},150)});
   if(gepakt){await C.play([{say:'agent',text:'Hé! Jij daar! Waarom heb jij zo’n haast?',t:2.2,mood:'boos'},{say:'luca',text:'Ik… de pizza’s worden koud.',t:1.8,mood:'bang'},{say:null,text:'Hij schrijft je naam op. Luca De Santis. 16. Bezorger.',t:2.8}]);ST.meter('hitte',8);ST.meter('dossier',6);L.F('inval_uit','genoteerd')}
   else{L.F('inval_uit','stil');ST.meter('imago',2);L.sein('Niemand keek naar de pizzajongen','#3fe395')}}
  ag.forEach((a,i)=>C.weg('inval'+i));G.draag.leeg();await L.buiten();ST.doel(null);
  await C.play([{fn:L.tril},{say:'nova',text:'Mooi werk, Luca. Rafiq is zijn hele voorraad kwijt. Hij gaat zoeken wie er gepraat heeft. Zorg dat jij het niet bent.',t:4,mood:'koel'}]);ST.meter('loy_rafiq',-10)}

async function mLekker(t){const S=L.A('sahara',655,909);if(!await doelNaar('Rafiq wil je zien in Sahara',S,8))return;await L.binnen('sahara');if(t!==RUN)return;
  const rp=L.W('sahara',6.4,2.2),lp=L.W('sahara',6.4,4.6),z=L.F('envelop');
  const r=await C.play([{speler:false},{actor:'rafiq',at:rp,ry:0,anim:'sit',sitY:-.45},{actor:'luca',at:lp,ry:PI},{fn:()=>['rafiq','luca'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})},
   L.cam(...L.W3('sahara',9.6,2.2,5.2),...L.W3('sahara',6.4,1.0,3.2)),{fade:'in',t:.5},
   {say:'rafiq',text:'Ray’s mensen waren laatst in Oud-Zuid. Een rijtjeshuis. Een pizzajongen. Dat ben jij, toch?',t:3.6,mood:'koel'},
   ...(L.F('rafiq_weet')?[{say:'rafiq',text:'Je zei het zelf al. Goed. Nu wil ik weten wat je hém hebt verteld.',t:3}]:[]),
   {keuze:z==='gelogen'?[{t:'"Ik gaf ze een verkeerde naam. Teun, uit de haven."',id:'teun'},{t:'"Niks. Ik heb niks gezegd."',id:'niks'}]:[{t:'"Niks. Ik heb gezwegen. Hij gaf me zijn nummer."',id:'eerlijk'},{t:'"Niks. Ze lieten me gewoon gaan."',id:'lieg'}],wie:'luca',text:'Rafiq kijkt je aan zonder te knipperen.'}],{blijf:true});
  if(t!==RUN)return;
  if(r==='teun'){await C.play([{snd:'lach'},{say:'rafiq',text:'Teun? De kraanman? Ha! Die arme ziel heeft schulden tot aan zijn nek. Ray zal hem vinden… en niks vinden.',t:3.8,mood:'blij'},{say:'rafiq',text:'Slim. Gevaarlijk slim. Ik onthoud dat.',t:2.4,mood:'koel'}]);ST.meter('loy_rafiq',10)}
  else if(r==='eerlijk'){await C.play([{say:'rafiq',text:'Zijn nummer. En je komt het mij vertellen. Weet je hoe zeldzaam dat is?',t:3,mood:'koel'},{anim:'rafiq',a:'give',prop:'geld',naar:'luca'},{snd:'cash'},{fn:()=>ST.geld(500,'van Rafiq')},{say:'rafiq',text:'Houd dat nummer. Misschien hebben we het nog nodig.',t:2.6}]);ST.meter('loy_rafiq',12);L.F('rafiq_weet',1)}
  else{await C.play([{say:null,text:'Rafiq zegt niets. Dan glimlacht hij. Het is geen fijne glimlach.',t:3},{say:'rafiq',text:'Goed. Dan geloof ik je. Voor nu.',t:2.2,mood:'koel'}]);ST.meter('loy_rafiq',-4);L.F('rafiq_twijfel',1)}
  await C.play([{fade:'out',t:.4},{weg:'rafiq'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);await L.buiten()}

async function mDexOpgepakt(t){const S=L.A('schoolhek',234,371);L.tijd(15,10);if(!await doelNaar('Naar school',S,10))return;
  const lijn=wegLijn(S.x,S.z+6,90),l=L.P(),over=L.walk(S.x+(lijn[0].x===lijn[1].x?7:0),S.z+(lijn[0].z===lijn[1].z?7:0),6);
  const dx=L.walk((lijn[0].x+lijn[1].x)/2,(lijn[0].z+lijn[1].z)/2,6);const pol=auto('#f1efe9',true);
  const r=await C.play([{speler:false},{actor:'luca',at:[l.x,l.z],ry:L.naar(l,dx)},{actor:'dex',at:[dx.x-8,dx.z-8],ry:L.naar({x:dx.x-8,z:dx.z-8},dx),prop:'tas'},
   schouder(l,dx,3.4,1.4,2.6),{fade:'in',t:.3},
   {say:null,text:'Dex komt aanfietsen. Rode BMX, tas op zijn rug. Hij zwaait naar je van de overkant.',t:3},{move:'dex',to:[dx.x,dx.z],t:2.4,anim:'run'},{anim:'dex',a:'zwaai',naar:'luca'},
   {fn:()=>{rij(pol,[lijn[0],{x:dx.x+1.5,z:dx.z+1.5}],14,{blijf:true,rem:true})}},{snd:'whistle'},{wait:2.2},
   {actor:'agent',at:[dx.x+2,dx.z+1.4],ry:L.naar({x:dx.x+2,z:dx.z+1.4},dx)},{actor:'agent2',at:[dx.x+1.2,dx.z+2.6],ry:L.naar({x:dx.x+1.2,z:dx.z+2.6},dx)},
   L.rond(dx.x,dx.z,.8,6,2.2,1.2),{say:'agent',text:'Stop! Tas af. Handen waar ik ze kan zien.',t:2.4,mood:'boos'},{anim:'dex',a:'handenop',prop:null},
   {say:null,text:'Ze halen de tas leeg op de stoep. Een pakketje in folie. Zo groot als een pak boter.',t:3.2},{anim:'agent2',a:'duw',naar:'dex'},
   L.rond(dx.x,dx.z,L.naar(dx,l)+.35,3.2,1.7,1.4),{say:null,text:'Dex kijkt naar de overkant. Naar jou. Hij zegt niets. Hij kijkt meteen weer weg.',t:3.4},
   {fade:'out',t:.8},{weg:'dex'},{weg:'agent'},{weg:'agent2'},{weg:'luca'},{fn:()=>{pol.userData.stop&&pol.userData.stop();pol.parent&&pol.parent.remove(pol)}},
   {binnen:'thuis'},{speler:false},{actor:'luca',at:L.W('thuis',12.6,10.2),ry:PI*.5,anim:'sit',sitY:-.45,prop:'telefoon'},{fn:()=>{const a=C.acteur('luca');if(a)a.g.binnenId=1;L.tijd(22,40)}},
   L.cam(...L.W3('thuis',14.6,2.1,8.2),...L.W3('thuis',12.6,.9,10.2)),{fade:'in',t:.6},
   {say:null,text:'Die avond. Je kamer. Je twee telefoons op je bed. Allebei stil.',t:3},
   {keuze:[{t:'Een advocaat betalen via Ray',id:'ray',sub:'Dex snel vrij · Ray heeft iets van je tegoed'},{t:'Zijn moeder geld geven',id:'moeder',sub:'€2.000 · Dex vergeet dit nooit'},{t:'Niets doen',id:'niets',sub:'Hij noemt je naam niet'}],wie:'luca',text:'Wat doe je voor Dex?'}],{blijf:true});
  if(t!==RUN)return;L.F('dex_opgepakt',1);const kamer=L.cam(...L.W3('thuis',14.6,2.1,8.2),...L.W3('thuis',12.6,.9,10.2));
  if(r==='ray'){await C.play([kamer,{fn:L.tril},{say:'luca',text:'Ray. Dex is opgepakt. Hij heeft een advocaat nodig.',t:2.4},{say:'ray',text:'Mr. Hoefnagel. Morgen staat hij buiten. En Luca? Nu sta jij bij mij in het krijt.',t:3.4,mood:'koel'},{weg:'luca'}]);L.F('dex_hulp','ray');L.F('ray_tegoed',1);ST.meter('loy_dex',6);ST.meter('loy_ray',4);ST.koers(3,'zakelijk')}
  else if(r==='moeder'){C.weg('luca');if(ST.geld()<2000){L.sein('Je hebt nog '+L.eur(2000-ST.geld())+' nodig','#ffd35a');await C.zeg('luca','Tweeduizend. Ik moet het bij elkaar krijgen. Extra ritten, extra diensten. Wat dan ook.',{t:3})}
    await ST.poort(2000,'Geld voor de moeder van Dex',{betaal:true});if(t!==RUN)return;
    const m=L.A('dex',277,480);if(!await doelNaar('Breng het geld naar de moeder van Dex',m,5))return;const l2=L.P(),q=L.voor(1.8);
    await C.play([{speler:false},{actor:'luca',at:[l2.x,l2.z],ry:l2.ry},{actor:'moeder_dex',at:[q.x,q.z],ry:L.naar(q,l2)},{snd:'deurbel'},L.rond(q.x,q.z,L.naar(q,l2)+1,2.8,1.6,1.4),
     {anim:'luca',a:'give',prop:'envelop',naar:'moeder_dex'},{say:'moeder_dex',text:'Wat is dit? …Luca. Nee. Dit kan ik niet aannemen.',t:2.6,mood:'bang'},{say:'luca',text:'Voor de advocaat. Dex zou hetzelfde doen.',t:2.2},
     {say:'moeder_dex',text:'Hij had altijd al één echte vriend.',t:2.4},{fade:'out',t:.4},{weg:'moeder_dex'},{weg:'luca'},{speler:true},{fade:'in',t:.4}]);L.F('dex_hulp','moeder');ST.meter('loy_dex',20)}
  else{C.weg('luca');await C.zeg('luca','(Hij noemt mijn naam niet. Dat weet ik. Dat moet genoeg zijn.)',{t:3});L.F('dex_hulp','niets');ST.meter('loy_dex',-15);L.F('dex_vergeet_niet',1)}}

async function mEinde(t){await C.play([{fn:L.tril},{say:'nova',text:'Luca. Iemand heeft Dex verraden. Niet de politie: die wisten waar hij zou zijn. Precies waar. Precies wanneer.',t:4,mood:'koel'},
   {say:'luca',text:'Wie dan?',t:1.4},{say:'nova',text:'Het spoor leidt naar Sahara.',t:2.4},{fade:'out',t:1},{dream:true},
   L.cam(...(()=>{const s=L.A('sahara',655,909);return [s.x+14,9,s.z+18,s.x,2,s.z]})()),{fade:'in',t:.6},{wait:2.4},{fade:'out',t:.6},{dream:false},
   {titel:'Seizoen 3',sub:'Coming soon',t:3.6},{fade:'in',t:1}]);
  L.F('h2_klaar',Date.now());ST.goto('h2_vrij');
  const vip=ST.vip&&ST.vip();ST.kaart(`<small>De Bezorger · Seizoen 2 uitgespeeld</small><b>Twee bazen, en een verrader</b>
   <p>Dex: <b>${L.F('dex_hulp')==='ray'?'vrij via Ray':L.F('dex_hulp')==='moeder'?'geholpen via zijn moeder':'alleen gelaten'}</b> · Verhaalgeld: <b>${L.eur(ST.geld())}</b></p>
   <p><b>Seizoen 3 · coming soon.</b> Je eigen hoek in de Westbuurt, een eerste crew, Inspecteur Bakker en Giulia die je ziet staan. Al je keuzes blijven bewaard.</p>
   <div class="sv-k-b"><button class="btn" data-x>Verder rondfietsen</button></div>`)}

/* =================== speciale klussen (niet op de kaart) =================== */
// Een onbekend nummer stuurt een adres. Pakket ophalen bij een tramhalte, afleveren, €300. Niet op de kaart, geen route.
let speciaalSpot=null,speciaalCd=0;
function speciaal(){if(speciaalSpot||!live()||!ST)return;const s=ST.st();if(!(s.ch>=2)||Date.now()<speciaalCd)return;if(G.cut.active()||B.waar()||(G.bezorg&&G.bezorg.actief()))return;
  const H=(M.HALTES||[]).filter(h=>Math.hypot(h.x-G.P.x,h.z-G.P.z)>80&&Math.hypot(h.x-G.P.x,h.z-G.P.z)<500);if(!H.length)return;const h=pick(H);
  speciaalCd=Date.now()+6*60e3;L.tril();L.sein('Onbekend nummer: "Pakket bij halte '+h.n+'. Nu."','#c49bff');
  speciaalSpot=G.spot({story:1,k:'speciaal',x:h.x,z:h.z,r:2.4,prio:2,n:'Pakket ophalen',sub:'Onbekend nummer',col:'#c49bff',h:1.2,act:async()=>{G.unspot(speciaalSpot);speciaalSpot=null;L.fx('grab');
    const a=G.bezorg.adres({klant:pick(['feest','chagrijn','student']),min:120,max:420});if(!a)return;L.zorgFiets();
    const sum=await G.bezorg.start([Object.assign({},a,{klant:'chagrijn',pizzas:1,extra:true,id:'sp'})],{loon:0});if(sum&&sum.ok){ST.geld(300,'speciale klus');ST.meter('hitte',2)}}});
  setTimeout(()=>{if(speciaalSpot){G.unspot(speciaalSpot);speciaalSpot=null}},4*60e3)}

/* =================== de stappen =================== */
function registreer(){const S=(id,d)=>ST.step(id,d);
S('h2_start',{muziek:'ray',async start(o){const t=nieuw();const s=ST.st();s.ch=2;try{save()}catch(e){}ST.avond(1);ST.tijd(9,30);await L.buiten();if(t!==RUN)return;L.zorgFiets();
  const env=L.F('envelop');
  await C.play([{fade:'out',t:.01},{titel:'Seizoen 2',sub:'Hoofdstuk 2 · Twee bazen',t:3.6},{fn:L.tril},
   {say:null,text:'Twee telefoons. De ene van Rafiq. De andere van een nummer dat Luca niet heeft opgeslagen, maar wel uit zijn hoofd kent.',t:4},
   ...(env==='verraden'?[{say:'ray',text:'Goedemorgen, Luca. Vanaf vandaag werk je voor mij. En voor Rafiq. Want Rafiq mag niet weten dat je voor mij werkt.',t:4.2,mood:'koel'}]
     :env==='gelogen'?[{say:'ray',text:'Mijn mensen zoeken Teun nog. Tot ze hem vinden, werk jij voor mij. Gewoon zoals altijd voor Rafiq, en daarnaast voor mij.',t:4.4,mood:'koel'}]
     :[{say:'ray',text:'Je hebt mijn nummer niet gebeld. Dus bel ik jou. Ik bied het nog één keer aan: rijd voor mij. Rafiq hoeft het niet te weten.',t:4.4,mood:'koel'},
       {keuze:[{t:'"Oké. Maar Rafiq mag het nooit weten."',id:'ja'},{t:'"Ik denk erover na."',id:'later'}],wie:'luca',text:'Ray wacht.'},{fn:()=>{if(C.laatste==='later'){ST.meter('loy_ray',-3)}}},
       {say:'ray',text:'Nadenken is goed. Doe het snel.',t:2.2}]),
   {say:null,text:'Vanaf nu plan je elke dag. School. Giovanni. Rafiq. Ray. Je kunt niet alles. Wie wacht, wordt achterdochtig.',t:4},{fade:'in',t:.5}]);
  if(t!==RUN)return;L.F('h2_dag',1);L.F('h2_plan',null);L.F('h2_i',0);ST.goto('h2_dag')}});

// één speldag: planning maken, dan de blokken afwerken
const DAGEN={1:['school','giovanni','rafiq','ray'],2:['school','giovanni','rafiq','ray'],3:['school','giovanni','rafiq','dex']};
S('h2_dag',{muziek:null,async start(o){const t=nieuw();const dag=L.F('h2_dag')||1;ST.avond(dag);if(G.h1)G.h1.dienstAan(false);
  if(dag===3&&!L.F('telefoon')){await mTelefoon(t);if(t!==RUN)return}
  let plan=L.F('h2_plan');if(!plan){ST.tijd(14,30);plan=await planning(dag,DAGEN[dag]);if(t!==RUN)return;L.F('h2_plan',plan);L.F('h2_i',0);DAGEN[dag].filter(k=>!plan.includes(k)).forEach(gemist)}
  for(let i=L.F('h2_i')||0;i<3;i++){if(t!==RUN)return;const k=plan[i];L.F('h2_i',i);L.tijd(...BLOKT[i]);L.sein(BLOK[i]+' · '+TAAK[k].n,TAAK[k].c);
    try{if(k==='school')await mSchool(t,dag);else if(k==='giovanni')await mGiovanni(t,dag);else if(k==='rafiq')await mRafiq(t,dag);
      else if(k==='ray')await(dag===1?mRayGeld(t):mUitkijk(t));else if(k==='dex')await mDexRit(t)}catch(e){console.error(e)}}
  if(t!==RUN)return;
  // na de dag: Dex erbij (dag 2, als je hem niet zelf plande), de lekker (dag 3, als er geen inval was)
  if(dag===1&&!L.F('dex_routes'))await mDexErbij(t);
  if(dag===3&&L.F('envelop')!=='verraden')await mLekker(t);
  if(t!==RUN)return;
  if(dag<3){await C.play([{fade:'out',t:.8},{say:null,text:dag===1?'Luca valt in slaap met twee telefoons onder zijn kussen.':'Twee telefoons. Twee bazen. Eén Luca. Hij slaapt vier uur.',t:3},{titel:'Dag '+(dag+1),sub:dag===1?'De uitkijk':'De tweede telefoon',t:2.6},{fade:'in',t:.8}]);
    L.F('h2_dag',dag+1);L.F('h2_plan',null);L.F('h2_i',0);ST.goto('h2_dag')}
  else{await C.play([{fade:'out',t:.8},{titel:'Dag 4',sub:'De overkant',t:2.6},{fade:'in',t:.8}]);ST.avond(4);ST.goto('h2_dex')}}});
S('h2_dex',{muziek:'spanning',async start(o){const t=nieuw();await mDexOpgepakt(t);if(t!==RUN)return;ST.goto('h2_slot')}});
S('h2_slot',{muziek:'ray',async start(o){const t=nieuw();await mEinde(t)}});
S('h2_vrij',{doel:'Seizoen 3 · coming soon. Extra diensten bij Giovanni',start(o){if(G.h1)G.h1.dienstAan(true);L.zorgFiets()}});
}

/* =================== opstarten =================== */
const iv=setInterval(()=>{if(!G.ready||!G.story||!G.cut||!G.binnen||!G.h1||!G.h1.lib||!G.story.step)return;clearInterval(iv);
  ST=G.story;C=G.cut;B=G.binnen;L=G.h1.lib;try{cast()}catch(e){console.error(e)}
  if(!live())return;registreer();
  setInterval(()=>{try{speciaal()}catch(e){}},45e3);
  G.h2.test={planning,uitkijk,mInval,mDexOpgepakt,mTelefoon,mRayGeld,mLekker,mDexErbij,mSchool,wegLijn,auto,nieuw:()=>nieuw()};
},150);
})();
