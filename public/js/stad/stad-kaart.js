// Pixelstad: de grote kaart (M) en de minikaart. Eén beeldtaal voor allebei: elke soort plek heeft een eigen VORM (laag) en KLEUR
// (soort), met een pixelicoon erin. Ruit = verhaal, vierkant = gebouw om binnen te gaan, rondje = iets te doen, schild = bendes,
// huisje = jouw bezit, druppel = jouw route. Een legenda ("Wat betekent wat") legt het uit; tik op een regel om die soort aan of
// uit te zetten. Plekken van dezelfde soort die dicht bij elkaar staan worden één markering met een getal; inzoomen haalt ze uit
// elkaar. Namen verschijnen vanzelf als er plek is. Slepen, knijpen, scrollwiel, + en −, en 'Ik ben hier'.
//
// Voor andere onderdelen:
//   G.kaart.highlight(x,z,naam,{c:'#4da3ff',ic:'moer',sh:'sq',id:'garage',t:0,keep:false,route:false})
//     → laat een bestemming pulseren op de grote kaart én de minikaart (met een pijl aan de rand als hij buiten beeld is).
//       c kleur, ic K.ic-sleutel of svg, sh vorm (ci|sq|dia|shd|hs), id om hem later te vervangen of weg te halen,
//       t seconden (0 = blijft), keep: niet vanzelf weg als je er bent, route: ook meteen een route zetten. Geeft het id terug.
//   G.kaart.unhighlight(id)  (zonder id: alles weg)
//   G.kaart.pin(soort,{ic,c,L})  → html van een markering (zelfde look als op de kaart), G.kaart.cats  → alle soorten.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,X=STAD_GFX,K=G.kit,$s=id=>document.getElementById(id),E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const pageName=k=>{const p=(typeof PAGES!=='undefined'&&PAGES.find(x=>x[0]===k));return p?p[1]:k};
const ownedPlaces=()=>M.places.filter(p=>p.dyn&&p.own&&p.zone!=='brug');
const strip=s=>String(s==null?'':s).replace(/<[^>]+>/g,'');
const SEA='#2a66a8';

/* =================== soorten: vorm, kleur, icoon =================== */
// g = groep in de legenda, lay = laag (knop bovenin), sh = vorm, imp = belang voor namen (3 altijd, 2 halverwege, 1 dichtbij)
const CAT={
 jij:{g:'route',n:'Jij',s:'De punt wijst je looprichting',sh:'me',fixed:1},
 wp:{g:'route',n:'Jouw route',s:'Roze lijn naar je markering',sh:'drop',c:'#ff4fd8',ic:'route',imp:3,nocl:1,fixed:1,pulse:1},
 doel:{g:'route',n:'Doel',s:'Waar je missie of klus heen moet',sh:'dia',c:'#ffd35a',ic:'star',imp:3,nocl:1,pulse:1,fixed:1},
 hl:{g:'route',n:'Uitgelicht',s:'Hier moet je zijn',sh:'ci',c:'#ffd35a',ic:'star',imp:3,nocl:1,pulse:1,fixed:1,only:1},
 opdr:{g:'verhaal',lay:'verhaal',n:'Opdrachtgever',s:'Letter = wie. Fel = nieuwe missie',sh:'dia',c:'#ffd35a',imp:2,nocl:1},
 klus:{g:'plek',lay:'plek',n:'Klussen & straat',s:'Café Het Gat, Het Contact, haven, heler',sh:'sq',c:'#ff8a1f',ic:'masker',imp:2},
 geld:{g:'plek',lay:'plek',n:'Geld',s:'Bank, casino, wasserette, notaris',sh:'sq',c:'#3fe395',ic:'euro',imp:2},
 winkel:{g:'plek',lay:'plek',n:'Winkels',s:'Wapens, kleding, gym, spa',sh:'sq',c:'#b48cff',ic:'bag',imp:2},
 pizza:{g:'plek',lay:'plek',n:'Pizzeria',s:'Bella Napoli: bezorgen',sh:'sq',c:'#e2453a',ic:'pizza',imp:2},
 garage:{g:'plek',lay:'plek',n:'Garage & sloop',s:'Auto wegzetten of slopen',sh:'sq',c:'#4da3ff',ic:'moer',imp:2},
 overheid:{g:'plek',lay:'plek',n:'Politie & bajes',s:'Bureau en gevangenis',sh:'sq',c:'#ff4d5e',ic:'badge',imp:2},
 atm:{g:'doen',lay:'doen',n:'Geldautomaat',s:'Geld opnemen',sh:'ci',c:'#3fe395',ic:'atm',sm:1,dz:1.3},
 vis:{g:'doen',lay:'doen',n:'Visstek',s:'Hengel uitgooien',sh:'ci',c:'#35d0e0',ic:'vis',dz:1.1},
 kijk:{g:'doen',lay:'doen',n:'Uitkijkpunt',s:'Verzamel ze. Grijs = gezien',sh:'ci',c:'#f0dca0',ic:'kijker',dz:1.1},
 eten:{g:'doen',lay:'doen',n:'Kraampjes',s:'Koffie, snacks, vis, dobbelen',sh:'ci',c:'#b48cff',ic:'kop',dz:1.3},
 race:{g:'doen',lay:'doen',n:'Straatrace',s:'Start met een auto',sh:'ci',c:'#f1ece0',ic:'vlag',dz:1.1},
 hond:{g:'doen',lay:'doen',n:'Zwerfhond',s:'Neem hem in huis',sh:'ci',c:'#d9a27a',ic:'poot',dz:1.1},
 krant:{g:'doen',lay:'doen',n:'Krantenbak',s:'Het laatste nieuws',sh:'ci',c:'#9fb0c4',ic:'krant',sm:1,dz:2.2,hz:1.2},
 lading:{g:'doen',lay:'doen',n:'Iets op te halen',s:'Lading, pakketje',sh:'ci',c:'#ffd35a',ic:'gift',pulse:1,imp:3},
 overig:{g:'doen',lay:'doen',n:'Overig',s:'',sh:'ci',c:'#e8e4da',ic:'route',only:1},
 fam:{g:'bende',lay:'bende',n:'Familie',s:'Villa Cosa Nostra',sh:'shd',c:'#ff6f9f',ic:'hoed',imp:2},
 baas:{g:'bende',lay:'bende',n:'Wijkbaas',s:'Versla hem en de wijk is van jou',sh:'shd',c:'#ff6f9f',ic:'kroon',dz:1},
 bgeld:{g:'bende',lay:'bende',n:'Beschermgeld',s:'Klaar om op te halen',sh:'shd',c:'#ff6f9f',ic:'euro',imp:2},
 tag:{g:'bende',lay:'bende',n:'Tagmuur',s:'Zet je tag voor respect',sh:'shd',c:'#ff6f9f',ic:'spuit',sm:1,dz:1.6,hz:1},
 kooi:{g:'bende',lay:'bende',n:'Vechtclub',s:'De Kooi',sh:'shd',c:'#ff6f9f',ic:'vuist',dz:1},
 thuis:{g:'bezit',lay:'bezit',n:'Thuis',s:'Waar je slaapt',sh:'hs',c:'#5fd35a',ic:'home',imp:3,nocl:1},
 bezit:{g:'bezit',lay:'bezit',n:'Jouw pand',s:'Woning of zaak',sh:'hs',c:'#5fd35a',ic:'key',imp:2},
 mijnauto:{g:'auto',lay:'auto',n:'Mijn auto',s:'Waar je hem liet staan',sh:'ci',c:'#4da3ff',ic:'auto',imp:2,nocl:1},
 aflever:{g:'auto',lay:'auto',n:'Gestolen auto kwijt',s:'Garage, heler, sloop of chop shop',sh:'sq',c:'#4da3ff',ic:'key',imp:3,pulse:1,nocl:1},
 zoekauto:{g:'auto',lay:'auto',n:'Auto voor de heler',s:'Die moet je hebben',sh:'ci',c:'#ff8a1f',ic:'auto',imp:3,nocl:1},
 agent:{g:'politie',lay:'politie',n:'Agent',s:'Blauw = zoekt, rood = ziet je',sh:'dot',c:'#ff3d52'},
 zoek:{g:'politie',lay:'politie',n:'Zoekgebied',s:'Blijf eruit tot het weg is',sh:'ring',c:'#4d7dff'}};
const GROUPS=[['route','Route'],['verhaal','Verhaal'],['plek','Plekken'],['doen','Te doen'],['bende','Bendes'],['bezit','Bezit'],['auto','Auto'],['politie','Politie']];
const LAYS=[['verhaal','Verhaal','dia','#ffd35a'],['plek','Plekken','sq','#ff8a1f'],['doen','Te doen','ci','#35d0e0'],['bende','Bendes','shd','#ff6f9f'],['bezit','Bezit','hs','#5fd35a'],['auto','Auto','ci','#4da3ff'],['politie','Politie','ci','#ff3d52']];
// vaste gebouwen: soort en icoon
const PL={jail:['overheid','tralies'],politie:['overheid','badge'],bank:['geld','bank'],casino:['geld','schop'],wit:['geld','was'],biz:['geld','akte'],
  crimes:['klus','masker'],hits:['klus','vizier'],werk:['klus','helm'],shop:['winkel','pistool'],look:['winkel','shirt'],skills:['winkel','halter'],relax:['winkel','spa'],
  cars:['garage','moer'],sloop:['garage','wrak'],fam:['fam','hoed']};
const PLSUB={crimes:'Klussenbord',hits:'Opdrachten',werk:'Werk',jail:'Gevangenis',biz:'Vastgoed',wit:'Witwassen',cars:'Auto wegzetten',sloop:'Slopen'};
// plekken (G.spot) per soort
const SPOT={atm:'atm',vis:'vis',kijk:'kijk',npc:'eten',race:'race',hond:'hond',krant:'krant',ev:'lading',baas:'baas',tag:'tag',geld:'bgeld',kooi:'kooi'};
const AFL={garage:'moer',heler:'bag',sloop:'wrak',chop:'moer'};
const LET={'Ome Joop':'J','Kees Brouwer':'K','Madame Lin':'L'};
const letterOf=n=>{for(const k in LET)if(String(n).startsWith(k))return LET[k];return String(n||'?').trim().charAt(0).toUpperCase()};

/* =================== markeringen tekenen (svg) =================== */
const SHP={sq:'<rect x="2" y="2" width="22" height="22" rx="3"/>',ci:'<circle cx="13" cy="13" r="11.2"/>',dia:'<path d="M13 .9 25.1 13 13 25.1 .9 13Z"/>',
  shd:'<path d="M2.5 2.2H23.5V12.6C23.5 18.2 18.7 21.6 13 24.6 7.3 21.6 2.5 18.2 2.5 12.6Z"/>',hs:'<path d="M13 1.4 24.6 11.2V24.4H1.4V11.2Z"/>',
  drop:'<path d="M13 25.4C9 21 3.2 15.6 3.2 10.4A9.8 9.8 0 0 1 22.8 10.4C22.8 15.6 17 21 13 25.4Z"/>'};
const icOf=k=>typeof k==='string'&&k.charAt(0)==='<'?k:(K.ic[k]||K.ic.route);
const HC=new Map();
// in een markering is het icoon donker op de kleur; de 'gaatjes' (half zwart) worden de kleur van de markering
const hole=s=>{let r=HC.get(s);if(r)return r;r=s.replace(/fill="#000[0-9a-f]"/g,'fill="currentColor" style="fill:var(--c)"').replace(/fill="#fff"/g,'fill="currentColor" style="fill:var(--c)"');HC.set(s,r);return r};
function pinHtml(o){const C=CAT[o.cat]||CAT.overig,sh=o.sh||C.sh,col=o.c||C.c;
  if(sh==='me')return `<span class="kp kp-me"><svg viewBox="0 0 26 26" aria-hidden="true"><path d="M13 2 22 23 13 18 4 23Z"/></svg></span>`;
  if(sh==='dot')return `<span class="kp kp-dot"><i style="background:#4d7dff"></i><i style="background:#ff3d52"></i></span>`;
  if(sh==='ring')return `<span class="kp kp-ring" style="--c:${col}"></span>`;
  const L=o.L||(o.cat==='opdr'?'?':'');
  return `<span class="kp kp-${sh}" style="--c:${col}"><svg class="kps" viewBox="0 0 26 26" aria-hidden="true">${SHP[sh]||SHP.ci}</svg>${o.bare?'':L?`<b>${E(L)}</b>`:`<i>${hole(icOf(o.ic||C.ic))}</i>`}</span>`}

/* =================== opbouw =================== */
const LAY={verhaal:1,plek:1,doen:1,bende:1,bezit:1,auto:1,politie:1};try{Object.assign(LAY,JSON.parse(localStorage.getItem('stad_kaart')||'{}'))}catch(e){}
const ST={off:{},leg:1};try{Object.assign(ST,JSON.parse(localStorage.getItem('stad_kaart2')||'{}'))}catch(e){}if(!ST.off||typeof ST.off!=='object')ST.off={};
const saveSt=()=>{try{localStorage.setItem('stad_kaart',JSON.stringify(LAY));localStorage.setItem('stad_kaart2',JSON.stringify(ST))}catch(e){}};
const mapCv=X.mapCanvas();
const ov=document.createElement('div');ov.className='sd-kaart kmap';ov.id='sdKaart';ov.hidden=true;document.body.appendChild(ov);
ov.innerHTML=`<div class="sd-k-box"><div class="sd-k-top"><div class="sd-k-t"><small>Pixelstad</small><b>Kaart</b></div><div class="sd-k-chips kchips" id="sdKChips" role="toolbar" aria-label="Lagen"></div><button class="sd-x" data-close aria-label="Sluiten">×</button></div>
 <div class="sd-k-main kmain" id="sdKMain"><div class="sd-k-view kview" id="sdKView"><canvas id="sdKCv"></canvas><div class="kpins" id="sdKPins"></div><div class="kedges" id="sdKEdges"></div>
  <button class="klegb" data-leg aria-controls="sdKLeg"><i aria-hidden="true">?</i><span>Wat is wat?</span></button>
  <div class="kctl"><button data-z="1" aria-label="Inzoomen">+</button><button data-z="-1" aria-label="Uitzoomen">−</button></div>
  <button class="kme-b" data-me aria-label="Ik ben hier"><i>${K.ic.ikhier}</i><span>Ik ben hier</span></button>
  <div class="kscale" id="sdKScale" aria-hidden="true"><i></i><span></span></div>
  <div class="sd-k-card kcard" id="sdKCard" hidden></div></div>
  <aside class="kleg" id="sdKLeg" hidden aria-label="Legenda"><div class="kleg-h"><i class="kleg-grab"></i><b>Wat betekent wat</b><button data-legx aria-label="Legenda sluiten">×</button></div><div class="kleg-b" id="sdKLegB"></div>
   <div class="kleg-f"><button data-all>Alles tonen</button><small>${touch?'Tik':'Klik'} op een regel om hem aan of uit te zetten</small></div></aside></div></div>`;
const view=$s('sdKView'),cv=$s('sdKCv'),cx=cv.getContext('2d'),pins=$s('sdKPins'),card=$s('sdKCard'),leg=$s('sdKLeg'),legB=$s('sdKLegB'),edges=$s('sdKEdges'),mainEl=$s('sdKMain');
let Z=2,CX=M.W/2,CZ=M.H/2,VW=1,VH=1,dpr=1;
const minZ=()=>Math.min(VW/M.W,VH/M.H)*.96,maxZ=9;
const sx=x=>(x-CX)*Z+VW/2,sz=z=>(z-CZ)*Z+VH/2,wx=x=>(x-VW/2)/Z+CX,wz=y=>(y-VH/2)/Z+CZ;
function clampView(){Z=Math.max(minZ(),Math.min(maxZ,Z));const hw=VW/2/Z,hh=VH/2/Z,m=40/Z;
  CX=M.W+2*m<=2*hw?M.W/2:Math.max(hw-m,Math.min(M.W+m-hw,CX));CZ=M.H+2*m<=2*hh?M.H/2:Math.max(hh-m,Math.min(M.H+m-hh,CZ))}
function size(){const r=view.getBoundingClientRect();VW=Math.max(1,r.width);VH=Math.max(1,r.height);dpr=Math.min(2,devicePixelRatio||1);cv.width=Math.round(VW*dpr);cv.height=Math.round(VH*dpr);cv.style.width=VW+'px';cv.style.height=VH+'px';clampView()}

/* =================== wat er op de kaart staat =================== */
const HL=[];let HLN=0;
function safe(f){try{return f()}catch(e){return false}}
// G.kaartMode (verhaal-kaart.js): eigen soorten en lagen; zonder base:true komen de Pixelstad-plekken er niet op
const VMODE=()=>G.kaartMode||null,GRP=()=>VMODE()&&VMODE().groups||GROUPS,LYS=()=>VMODE()&&VMODE().lays||LAYS;
function items(){const out=[],add=o=>{out.push(o);return o};const VM=VMODE();
  if(VM&&VM.items)safe(()=>VM.items(add));
  if(!VM||VM.base)M.places.forEach(p=>{if(p.dyn)return;const d=PL[p.id]||['overig','door'];add({cat:d[0],id:p.id,x:p.door.x,z:p.door.z,n:p.name,sub:PLSUB[p.id]||pageName(p.page),ic:d[1],pri:5,big:p.id==='cars'||p.id==='crimes'?1:0})});
  const home=M.places.find(p=>p.dyn==='plot'&&p.home);if(home)add({cat:'thuis',id:home.id,x:home.door.x,z:home.door.z,n:'Thuis',sub:home.name.replace(/^Thuis: /,''),pri:8,big:1});
  const own=ownedPlaces().filter(p=>!p.home);
  own.forEach(p=>{if(p.biz==='garage')add({cat:'garage',id:p.id,x:p.door.x,z:p.door.z,n:'Jouw chop shop',sub:'Slopen voor jezelf',ic:'moer',pri:7,big:1,own:1});
    else add({cat:'bezit',id:p.id,x:p.door.x,z:p.door.z,n:p.name.replace(/^(Thuis: |Jouw )/,''),sub:p.building?'In aanbouw':'Van jou',pri:4,own:1})});
  if(!own.length&&!VM)add({cat:'bezit',k:'oost',x:M.ESTATE.gate.x+40,z:M.ESTATE.gate.z+40,n:'Oostland',sub:'Nog niets van jou',pri:2,dim:1});
  const hl=G.helerContact||(G.NPC||[]).find(n=>n.arch==='heler'&&n.contact);if(hl)add({cat:'klus',x:hl.x,z:hl.z,n:'Ome Henk (heler)',sub:'Heler',ic:'bag',pri:4});
  const oc=(G.vehicles||[]).find(v=>v.own);if(oc)add({cat:'mijnauto',x:oc.x,z:oc.z,n:'Mijn auto',pri:6});
  const ap=G.autoPoints&&safe(()=>G.autoPoints());if(ap&&ap.forEach)ap.forEach(p=>add({cat:'aflever',x:p.x,z:p.z,n:p.n,sub:p.t,ic:AFL[p.k]||'key',pri:9,big:1}));
  if(G.orderCar&&G.orderCar.st!=='gestolen'&&G.orderCar.m)add({cat:'zoekauto',x:G.orderCar.x,z:G.orderCar.z,n:G.orderCar.m.n,sub:'Voor de heler',pri:8,big:1});
  if(G.spots)G.spots.forEach(s=>{if(!s.map||(s.mapIf&&!safe(s.mapIf)))return;if(G.story&&!s.story&&s.k!=='bank')return;const cat=SPOT[s.k]||'overig',n=typeof s.map.n==='function'?safe(s.map.n):s.map.n;
    add({cat,x:s.x,z:s.z,n:strip(n),ic:s.map.ic,c:cat==='overig'?(s.map.c||s.col):null,pri:s.map.pri||2,big:s.map.big&&cat!=='bgeld'?1:0,dim:s.k==='kijk'&&s.dotIf&&!safe(s.dotIf)})});
  else if(G.spotMap)(safe(()=>G.spotMap())||[]).forEach(o=>add({cat:'overig',x:o.x,z:o.z,n:strip(o.n),ic:o.ic,c:o.c,pri:o.pri||2}));
  if(G.verhaalMap)(safe(()=>G.verhaalMap())||[]).forEach(o=>{if(/^Doel/.test(o.n))add({cat:'doel',x:o.x,z:o.z,n:strip(o.n).replace(/^Doel:\s*/,''),sub:'Missie',pri:10,big:1});
    else add({cat:'opdr',x:o.x,z:o.z,n:strip(o.n),L:letterOf(o.n),dim:!o.big,pri:o.big?9:3,big:o.big?1:0})});
  if(G.missionDots){const ms=G.mission&&G.mission(),st=ms&&ms.steps&&ms.steps[ms.i];(safe(()=>G.missionDots())||[]).forEach(d=>{if(!d.big)return;if(out.some(q=>q.cat==='doel'&&Math.hypot(q.x-d.x,q.z-d.z)<5))return;
    add({cat:'doel',x:d.x,z:d.z,n:st&&st.txt?strip(st.txt):'Doel',sub:ms?'Klus':'Doel',pri:10,big:1})})}
  if(G.bezorg&&G.bezorg.kaart)(safe(()=>G.bezorg.kaart())||[]).forEach(o=>add(o));
  if(G.waypoint)add({cat:'wp',x:G.waypoint.x,z:G.waypoint.z,n:G.waypoint.n||'Gemarkeerd',sub:'Jouw markering',pri:11,big:1});
  const now=performance.now();for(let i=HL.length-1;i>=0;i--){const h=HL[i];if((h.until&&now>h.until)||(!h.keep&&G.P&&Math.hypot(G.P.x-h.x,G.P.z-h.z)<6)){HL.splice(i,1);continue}
    add({cat:'hl',x:h.x,z:h.z,n:h.n,sub:'Hier moet je zijn',c:h.c,ic:h.ic,sh:h.sh,pri:12,big:1})}
  // staat een uitgelichte plek of afleverpunt precies bij een gebouw: dan gaat dat gebouw pulseren (geen stapel markeringen)
  const host=out.filter(o=>{const g=(CAT[o.cat]||{}).g;return (g==='plek'||g==='bezit'||o.cat==='fam')&&o.cat!=='overig'});
  for(let i=out.length-1;i>=0;i--){const o=out[i];if(o.cat!=='hl'&&o.cat!=='aflever')continue;const h=host.find(q=>Math.hypot(q.x-o.x,q.z-o.z)<6);if(!h)continue;
    h.big=1;h.pulse=1;h.force=1;h.tgt=h.tgt||o.cat==='hl';h.pri=Math.max(h.pri,o.pri);if(o.cat==='hl'&&o.n&&o.n!==h.n)h.n=h.n+' · '+o.n;if(o.cat==='aflever')h.sub=o.sub;out.splice(i,1)}
  return out}
const shown=o=>{const C=CAT[o.cat]||CAT.overig;if(o.force)return true;if(C.lay&&!LAY[C.lay])return false;if(ST.off[o.cat]&&!C.fixed)return false;return true};

/* =================== indeling: samenvoegen, uit elkaar duwen, namen =================== */
const mc0=document.createElement('canvas').getContext('2d');const MW=new Map();
const measure=t=>{let w=MW.get(t);if(w==null){mc0.font='700 12.5px "Big Shoulders Text","Arial Narrow",sans-serif';w=Math.ceil(mc0.measureText(t).width);MW.set(t,w)}return w};
let L={cells:[],labs:[],z:0,sig:''},cnt={};
function layout(){const all=items();cnt={};all.forEach(o=>{cnt[o.cat]=(cnt[o.cat]||0)+1});
  // ver weg: kleine soorten worden stipjes in hun kleur (of verdwijnen even), en alles wordt iets kleiner
  const its=all.filter(o=>shown(o)&&!(CAT[o.cat].hz&&Z<CAT[o.cat].hz)).sort((a,b)=>b.pri-a.pri);
  const R=Z>=6?16:Z>=3.2?26:34,cells=[],lo=Z<1.1,vlo=Z<.75,S=vlo?.72:lo?.85:1;pins.classList.toggle('lo',lo&&!vlo);pins.classList.toggle('vlo',vlo);
  its.forEach(o=>{const C=CAT[o.cat]||CAT.overig,px=o.x*Z,py=o.z*Z,tiny=!!(C.dz&&Z<C.dz&&!o.big);
    if(!C.nocl&&!o.big){const rr=tiny?9:R*(C.sm?1.35:1),c=cells.find(c=>c.cat===o.cat&&!c.solo&&!!c.tiny===tiny&&Math.abs(c.px-px)<rr&&Math.abs(c.py-py)<rr);
      if(c){c.more.push(o);const n=c.more.length+1;c.px+=(px-c.px)/n;c.py+=(py-c.py)/n;c.dim=c.dim&&o.dim;if(c.ic!==o.ic)c.mixed=1;return}}
    cells.push(Object.assign({},o,{px,py,more:[],tiny,solo:!!(C.nocl||o.big)}))});
  cells.forEach(c=>{const C=CAT[c.cat]||CAT.overig;c.big=c.big||0;c.sm=!c.big&&!c.more.length&&C.sm;c.r=Math.round((c.big?16:c.sm?10:13)*S);c.imp=C.imp||(c.more.length?0:1);
    if(c.more.length){c.ic=c.mixed?C.ic:c.ic;c.L=null;c.r=Math.round(14*S)}if(c.tiny){c.r=6;c.imp=0;c.pri-=20}if(c.pulse)c.imp=3;c.qx=c.px;c.qy=c.py;c.oy=(c.sh||C.sh)==='drop'?-c.r:0});
  // uit elkaar duwen: niets over elkaar heen (belangrijke markeringen schuiven het minst)
  for(let it=0;it<10;it++){let moved=0;for(let i=0;i<cells.length;i++){const a=cells[i];for(let j=i+1;j<cells.length;j++){const b=cells[j];
      const dx=b.qx-a.qx,dy=(b.qy+b.oy)-(a.qy+a.oy),min=a.r+b.r+2;if(Math.abs(dx)>=min||Math.abs(dy)>=min)continue;const d=Math.hypot(dx,dy);if(d>=min)continue;
      const ux=d>.01?dx/d:(i%2?1:-1),uy=d>.01?dy/d:.3,p=(min-d),wa=a.pri>b.pri?.2:a.pri<b.pri?.8:.5;a.qx-=ux*p*wa;a.qy-=uy*p*wa;b.qx+=ux*p*(1-wa);b.qy+=uy*p*(1-wa);moved=1}}
    if(!moved)break}
  cells.forEach(c=>{const dx=c.qx-c.px,dy=c.qy-c.py,d=Math.hypot(dx,dy),mx=24;if(d>mx){c.qx=c.px+dx/d*mx;c.qy=c.py+dy/d*mx}c.dx=c.qx-c.px;c.dy=c.qy-c.py;c.wx=c.px/Z;c.wz=c.py/Z});
  // namen: belangrijkste eerst, alleen waar ruimte is
  const rects=cells.map(c=>[c.qx-c.r,c.qy+c.oy-c.r,c.qx+c.r,c.qy+c.oy+c.r]),labs=[],ov=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
  const want=c=>!c.more.length&&c.n&&!(c.cat==='wp'&&cells.some(q=>q.tgt&&Math.hypot(q.x-c.x,q.z-c.z)<14))&&(c.imp>=3||(c.imp>=2&&Z>=1.55)||(c.imp>=1&&Z>=3.6)||Z>=6.5);
  cells.map((c,i)=>[c,i]).filter(([c])=>want(c)).sort((a,b)=>(b[0].imp-a[0].imp)||(b[0].pri-a[0].pri)).forEach(([c,i])=>{
    const t=c.n.length>34?c.n.slice(0,32)+'…':c.n,w=measure(t)+16,h=20,y=c.qy+c.oy;
    const cand=[[c.qx+c.r+3,y-h/2,'r'],[c.qx-c.r-3-w,y-h/2,'l'],[c.qx-w/2,y+c.r+2,'b'],[c.qx-w/2,y-c.r-2-h,'t']];
    for(const [lx,ly,s] of cand){const r=[lx,ly,lx+w,ly+h];if(rects.some((q,k)=>k!==i&&!(c.imp>=3&&cells[k].imp<2)&&ov(q,r))||labs.some(q=>ov(q.r,r)))continue;labs.push({i,t,lx:lx-c.qx,ly:ly-c.qy,s,r});break}});
  const sig=Z.toFixed(3)+'|'+cells.map(c=>c.cat+(c.ic&&c.ic.length)+(c.L||'')+Math.round(c.qx)+','+Math.round(c.qy)+(c.dim?'d':'')+c.more.length).join(';')+'|'+labs.map(l=>l.i+l.s).join(',');
  L={cells,labs,z:Z,sig:L.sig};if(sig===L.sig){reposition();return}L.sig=sig;
  pins.innerHTML=cells.map((c,i)=>{const C=CAT[c.cat]||CAT.overig;const nm=c.more.length?(c.more.length+1)+'× '+C.n:c.n;
    return `<button class="kpin${c.tiny?' tiny':''}${c.big?' big':''}${c.sm?' sm':''}${(c.sh||C.sh)==='drop'?' drop':''}${c.more.length?' clu':''}${c.dim?' dim':''}${(C.pulse||c.pulse)&&!c.more.length?' pulse':''} k-${c.cat}" data-c="${i}" style="--c:${c.c||C.c};left:${c.qx}px;top:${c.qy}px" aria-label="${E(nm)}"${touch?'':` title="${E(nm)}"`}>${pinHtml(c.tiny?Object.assign({},c,{bare:1}):c)}${c.more.length&&!c.tiny?`<em>${c.more.length+1}</em>`:''}</button>`}).join('')+
    labs.map(l=>{const c=cells[l.i],C=CAT[c.cat]||CAT.overig;return `<span class="klab s-${l.s}${c.imp>=3?' imp':''}" data-l="${l.i}" style="--c:${c.c||C.c};left:${c.qx+l.lx}px;top:${c.qy+l.ly}px">${E(l.t)}</span>`}).join('')+
    `<div class="kme" id="sdKMe"><i class="kme-p"></i>${pinHtml({cat:'jij'})}</div>`;
  meEl=$s('sdKMe');legCounts()}
let meEl=null;
// tussen twee indelingen in (tijdens knijpen of scrollen): alleen de plekken bijwerken, dat is goedkoop
function reposition(){const k=Z;for(const el of pins.children){if(el.classList.contains('kpin')){const c=L.cells[+el.dataset.c];if(c){el.style.left=(c.wx*k+c.dx)+'px';el.style.top=(c.wz*k+c.dy)+'px'}}
    else if(el.classList.contains('klab')){const l=L.labs.find(q=>q.i===+el.dataset.l),c=l&&L.cells[l.i];if(c){el.style.left=(c.wx*k+c.dx+l.lx)+'px';el.style.top=(c.wz*k+c.dy+l.ly)+'px';el.style.visibility=Math.abs(k/L.z-1)>.12?'hidden':''}}}}

/* =================== tekenen =================== */
let raf=0,needLayout=true,lastLay=0,gest=0,lt=0;
function req(lay){if(lay)needLayout=true;if(!raf)raf=requestAnimationFrame(()=>{raf=0;draw()})}
function draw(){if(ov.hidden)return;const P=G.P;cx.setTransform(dpr,0,0,dpr,0,0);cx.imageSmoothingEnabled=false;cx.fillStyle=SEA;cx.fillRect(0,0,VW,VH);
  cx.drawImage(mapCv,sx(0),sz(0),M.W*Z,M.H*Z);
  // Oostland: jouw terrein (groen gestippeld), jouw panden groen ingekleurd, vrije kavels dun gestippeld
  const es=M.ESTATE;if(VMODE()&&VMODE().drawUnder)safe(()=>VMODE().drawUnder(cx,sx,sz,Z));if(!VMODE()){cx.save();cx.strokeStyle='rgba(95,211,90,.75)';cx.lineWidth=2;cx.setLineDash([7,5]);cx.strokeRect(sx(es.x0+1),sz(es.z0+1),(es.x1-es.x0-2)*Z,(es.z1-es.z0-2)*Z);cx.restore();
  if(LAY.bezit&&Z>=1.3){cx.lineWidth=1;cx.setLineDash([3,3]);cx.strokeStyle='rgba(255,255,255,.35)';M.places.forEach(p=>{if(!p.est||p.own||!p.rect)return;const r=p.rect;cx.strokeRect(sx(r.x0)+.5,sz(r.z0)+.5,(r.x1-r.x0)*Z-1,(r.z1-r.z0)*Z-1)});cx.setLineDash([])}
  if(LAY.bezit)ownedPlaces().forEach(p=>{const r=p.rect;if(!r)return;cx.fillStyle='rgba(95,211,90,.55)';cx.fillRect(sx(r.x0),sz(r.z0),(r.x1-r.x0)*Z,(r.z1-r.z0)*Z);cx.strokeStyle='#1d5a24';cx.lineWidth=1.5;cx.strokeRect(sx(r.x0)+.75,sz(r.z0)+.75,(r.x1-r.x0)*Z-1.5,(r.z1-r.z0)*Z-1.5)});}
  // wijknamen: groot als je ver weg kijkt, weg als je inzoomt
  cx.textAlign='center';cx.textBaseline='middle';cx.lineJoin='round';
  if(Z<3.8){const a=Z<2.6?1:Math.max(0,(3.8-Z)/1.2),fs=Math.round(Math.max(10,Math.min(17,Z*7.5)));cx.font=`800 ${fs}px "Big Shoulders Display","Arial Narrow",sans-serif`;
    cx.globalAlpha=a;M.DISTRICTS.forEach(d=>{if(M.estateAt(d.x,d.z))return;const t=d.n.toUpperCase().split('').join(String.fromCharCode(8202));cx.strokeStyle='rgba(12,14,18,.9)';cx.lineWidth=4;cx.strokeText(t,sx(d.x),sz(d.z));cx.fillStyle='#fff';cx.fillText(t,sx(d.x),sz(d.z))});cx.globalAlpha=1}
  if(!VMODE()){const fs=Math.round(Math.max(12,Math.min(24,Z*8)));cx.font=`900 ${fs}px "Big Shoulders Display","Arial Narrow",sans-serif`;const y=sz(es.z0+20);cx.strokeStyle='rgba(12,14,18,.9)';cx.lineWidth=4;cx.strokeText('OOSTLAND',sx((es.x0+es.x1)/2),y);cx.fillStyle='#8ff07f';cx.fillText('OOSTLAND',sx((es.x0+es.x1)/2),y);
    if(Z>=1){cx.font='700 10px ui-monospace,monospace';cx.strokeText('JOUW TERREIN',sx((es.x0+es.x1)/2),y+fs*.8);cx.fillStyle='#cfeec9';cx.fillText('JOUW TERREIN',sx((es.x0+es.x1)/2),y+fs*.8)}}
  // routes: donkere rand, felle lijn, witte stippels in het midden
  const route=(pts,col)=>{if(!pts||!pts.length)return;cx.lineJoin='round';cx.lineCap='round';cx.beginPath();cx.moveTo(sx(P.x),sz(P.z));pts.forEach(q=>cx.lineTo(sx(q.x),sz(q.z)));
    cx.strokeStyle='rgba(10,10,16,.85)';cx.lineWidth=8;cx.stroke();cx.strokeStyle=col;cx.lineWidth=4.5;cx.stroke();cx.setLineDash([2,7]);cx.strokeStyle='rgba(255,255,255,.85)';cx.lineWidth=1.6;cx.stroke();cx.setLineDash([])};
  if(G.waypoint)route(G.gpsPath,'#ff4fd8');if(G.missionPath&&G.missionPath.length)route(G.missionPath,'#ffd35a');
  // missie: kleine stipjes (bewakers, agenten, je schaduw)
  if(G.missionDots)(safe(()=>G.missionDots())||[]).forEach(d=>{if(d.big)return;const r=4;cx.fillStyle='#000';cx.fillRect(sx(d.x)-r-1.5,sz(d.z)-r-1.5,2*r+3,2*r+3);cx.fillStyle=d.c;cx.fillRect(sx(d.x)-r,sz(d.z)-r,2*r,2*r)});
  // politie: zoekgebied en agenten (knipperend rood/blauw)
  if(LAY.politie&&G.police&&G.police.dots){const fl=RM()?0:Math.floor(performance.now()/350)%2;(safe(()=>G.police.dots())||[]).forEach(d=>{const X0=sx(d.x),Y0=sz(d.z);
    if(d.r){if(ST.off.zoek)return;cx.beginPath();cx.arc(X0,Y0,d.r*Z,0,Math.PI*2);cx.fillStyle='rgba(77,125,255,.16)';cx.fill();cx.setLineDash([6,5]);cx.strokeStyle='#4d7dff';cx.lineWidth=2;cx.stroke();cx.setLineDash([]);return}
    if(ST.off.agent)return;const c=d.c==='#ff3d52'?'#ff3d52':(fl?'#4d7dff':'#ff3d52');cx.fillStyle='#000';cx.beginPath();cx.arc(X0,Y0,6.5,0,Math.PI*2);cx.fill();cx.fillStyle=c;cx.beginPath();cx.arc(X0,Y0,4.5,0,Math.PI*2);cx.fill()})}
  // markeringen: de laag schuift mee met de kaart
  // tijdens knijpen of scrollen alleen verschuiven (goedkoop); opnieuw indelen als je even stilstaat
  const now=performance.now(),busy=now-gest<160&&L.cells.length;if(needLayout&&!busy&&(now-lastLay>110||!L.cells.length)){needLayout=false;lastLay=now;layout()}else if(Math.abs(L.z-Z)>1e-6)reposition();
  if(needLayout&&!lt)lt=setTimeout(()=>{lt=0;req()},busy?170:120);
  pins.style.transform=`translate(${VW/2-CX*Z}px,${VH/2-CZ*Z}px)`;
  if(meEl){meEl.style.left=P.x*Z+'px';meEl.style.top=P.z*Z+'px';meEl.firstElementChild.nextElementSibling.style.transform=`rotate(${Math.atan2(Math.cos(P.ry),Math.sin(P.ry))+Math.PI/2}rad)`}
  edgeArrows();scaleBar()}
// pijltjes aan de rand voor jou en je doel als die buiten beeld zijn
function edgeArrows(){const P=G.P,T=[];
  L.cells.forEach(c=>{if(c.cat==='doel'||c.cat==='hl'||c.tgt)T.push({k:c.cat,x:c.x,z:c.z,c:c.c||CAT[c.cat].c,n:c.n})});
  if(G.waypoint)T.push({k:'wp',x:G.waypoint.x,z:G.waypoint.z,c:'#ff4fd8',n:G.waypoint.n||'Route'});T.push({k:'jij',x:P.x,z:P.z,c:'#ffffff',n:'Jij'});
  const m=22,h=[],used=[];T.forEach((t,i)=>{if(T.slice(0,i).some(q=>Math.hypot(q.x-t.x,q.z-t.z)<10))return;const X0=sx(t.x),Y0=sz(t.z);if(X0>=0&&Y0>=0&&X0<=VW&&Y0<=VH)return;
    const cx0=VW/2,cy0=VH/2,dx=X0-cx0,dy=Y0-cy0,k=Math.min((VW/2-m)/Math.abs(dx||1e-6),(VH/2-m)/Math.abs(dy||1e-6)),a=Math.atan2(dy,dx),lab=t.k==='jij'?'Jij':t.n.length>22?t.n.slice(0,21)+'…':t.n;
    let ex=cx0+dx*k,ey=cy0+dy*k;const w=Math.min(150,measure(lab)+34),side=Math.abs(Math.abs(ey-cy0)-(VH/2-m))<1;
    ex=Math.max(w/2+4,Math.min(VW-w/2-4,ex));for(let n=0;n<6&&used.some(u=>Math.abs(u[0]-ex)<(u[2]+w)/2+4&&Math.abs(u[1]-ey)<26);n++){if(side)ex+=(ex>cx0?-1:1)*(w+8);else ey+=(ey>cy0?-1:1)*30}
    used.push([ex,ey,w]);h.push(`<button class="kedge k-${t.k}" data-ex="${t.x},${t.z}" style="left:${ex}px;top:${ey}px;--c:${t.c}" aria-label="Naar ${E(t.n)}"><i style="transform:rotate(${a}rad)"></i><span>${E(lab)}</span></button>`)});
  const s=h.join('');if(s!==edges._s){edges._s=s;edges.innerHTML=s}}
function scaleBar(){const el=$s('sdKScale');const opts=[5,10,20,50,100,200,500];let m=opts.find(v=>v*Z>=56)||500;el.firstChild.style.width=Math.round(m*Z)+'px';el.lastChild.textContent=m+' m'}

/* =================== legenda =================== */
function legHtml(){LYS().forEach(l=>{if(LAY[l[0]]==null)LAY[l[0]]=1});return GRP().map(([g,gn])=>{const lay=LYS().find(l=>l[0]===g),on=!lay||LAY[g];
    const rows=Object.keys(CAT).filter(k=>CAT[k].g===g&&(!CAT[k].only||cnt[k])).map(k=>{const C=CAT[k],off=!C.fixed&&(ST.off[k]||!on);
      return `<button class="kleg-r${off?' off':''}${C.fixed?' fix':''}" data-cat="${k}" aria-pressed="${!off}"${C.fixed?' disabled':''}>${pinHtml({cat:k,L:k==='opdr'?'J':null})}<span><b>${E(C.n)}</b>${C.s?`<small>${E(C.s)}</small>`:''}</span><em data-n="${k}">${cnt[k]||''}</em></button>`}).join('');
    return `<section class="kleg-g${on?'':' off'}"><h4>${lay?`<button data-lay="${g}" aria-pressed="${!!on}"><i class="ksw"></i>${E(gn)}</button>`:`<span>${E(gn)}</span>`}</h4>${rows}</section>`}).join('')}
function legCounts(){if(leg.hidden)return;legB.querySelectorAll('[data-n]').forEach(e=>{const n=cnt[e.dataset.n]||0;e.textContent=n?n:''});
  const need=Object.keys(CAT).filter(k=>CAT[k].only&&cnt[k]).join();if(need!==legB._only){legB._only=need;legB.innerHTML=legHtml()}}
function legShow(on){ST.leg=on?1:0;saveSt();leg.hidden=!on;mainEl.classList.toggle('leg-on',!!on);if(on){legB.innerHTML=legHtml();legB._only=Object.keys(CAT).filter(k=>CAT[k].only&&cnt[k]).join()}
  size();req(true)}
function chipsHtml(){LYS().forEach(l=>{if(LAY[l[0]]==null)LAY[l[0]]=1});const L0=LYS().filter(l=>l[0]!=='politie'||(G.police&&G.police.active&&G.police.active()));
  $s('sdKChips').innerHTML=L0.map(([k,n,sh,c])=>`<button data-lay="${k}" class="${LAY[k]?'on':''}" aria-pressed="${!!LAY[k]}" style="--c:${c}"><svg viewBox="0 0 26 26" aria-hidden="true">${SHP[sh]}</svg>${n}</button>`).join('')}
function refreshUi(){chipsHtml();if(!leg.hidden)legB.innerHTML=legHtml();req(true)}

/* =================== kaartje van een gekozen plek =================== */
function dist(x,z){return Math.round(Math.hypot(x-G.P.x,z-G.P.z))}
function walkT(d){const s=d/7;return s<60?'minder dan een minuut lopen':Math.round(s/60)+' min lopen'}
function showCard(o){let h='';const d=o.x!=null?dist(o.x,o.z):0,C=CAT[o.cat]||{n:'Plek op de kaart',c:'#ff4fd8'};
  if(o.list){h=`<div class="sd-k-ch">${pinHtml(o.list[0])}<div><small>${E(C.n)} · ${o.list.length} plekken</small><b>Hier in de buurt</b></div></div>
    <div class="sd-k-own">${o.list.map((q,i)=>`<button data-li="${i}"><span>${E(q.n||C.n)}</span><small>${dist(q.x,q.z)} m</small></button>`).join('')}</div>`;card._list=o.list}
  else if(o.cat==='bezit'&&o.k==='oost'||o.allOwn){const own=ownedPlaces();h=`<div class="sd-k-ch">${pinHtml({cat:'bezit'})}<div><small>Oostland · jouw terrein</small><b>${own.length?'Jouw bezit':'Nog niets van jou'}</b></div></div>
    <div class="sd-k-own">${own.map(p=>`<button data-go="${p.id}"><span>${E(p.name.replace(/^(Thuis: |Jouw )/,''))}</span><small>${E(M.districtAt(p.door.x,p.door.z))}${p.building?' · bouwt':''}</small></button>`).join('')||'<p>Bij Notaris De Sleutel koop je een woning of zaak. Die wordt hier gebouwd.</p>'}</div>
    <div class="sd-k-b"><button class="btn sm" data-not>${K.ic.key} Notaris</button><button class="btn ghost sm" data-wp="${M.ESTATE.gate.x},${M.ESTATE.gate.z},Oostland">${K.ic.route} Route naar Oostland</button></div>`}
  else{const sub=o.cat?C.n+(o.sub&&o.sub!==C.n?' · '+o.sub:''):'Plek op de kaart';
    h=`<div class="sd-k-ch">${o.cat?pinHtml(o):`<span class="kp kp-drop" style="--c:#ff4fd8"><svg class="kps" viewBox="0 0 26 26">${SHP.drop}</svg></span>`}<div><small>${E(sub)}</small><b>${E(o.n||'Plek op de kaart')}</b></div></div><p class="sd-k-d">${E(M.districtAt(o.x,o.z))} · ${d} m · ${walkT(d)}</p>
    <div class="sd-k-b"><button class="btn sm" data-wp="${o.x},${o.z},${E(o.n||'Gemarkeerd')}"${o.id?` data-pl="${o.id}"`:''}>${K.ic.route} Route zetten</button><button class="btn ghost sm" data-walk="${o.x},${o.z}"${o.id?` data-pl="${o.id}"`:''}>${K.ic.walk} Erheen lopen</button>${o.cat==='wp'?'<button class="btn ghost sm" data-clear>Wissen</button>':''}${o.cat==='bezit'&&o.own||o.cat==='thuis'?'<button class="btn ghost sm" data-allown>Al je bezit</button>':''}</div>`}
  card.innerHTML=`<button class="sd-x" data-cclose aria-label="Sluiten">×</button>${h}`;card.hidden=false;mainEl.classList.add('card-on');G.snd&&G.snd.fx('tab')}
function hideCard(){card.hidden=true;mainEl.classList.remove('card-on')}

/* =================== route (GPS) =================== */
let beam=null;
function setWp(x,z,n,plId){const p=M.nearestWalk(x,z,30)||{x,z};G.waypoint={x:p.x,z:p.z,n,pl:plId||null};gps();
  const sc=G.scene();if(!beam){beam=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,60,10,1,true),new THREE.MeshBasicMaterial({color:0xff4fd8,transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide}));beam.renderOrder=4;sc.add(beam)}
  beam.visible=true;beam.position.set(p.x,30,p.z);G.toast&&G.toast('Route gezet: '+n,'info');hudWp();req(true)}
function clearWp(){G.waypoint=null;G.gpsPath=null;if(beam)beam.visible=false;hudWp();req(true)}
function gps(){const w=G.waypoint;if(!w)return;const fiets=(G.fiets&&G.fiets.actief&&G.fiets.actief())||G.driving;const p=G.fiets&&G.fiets.actief&&G.fiets.actief()&&G.fiets.pos?G.fiets.pos():G.P;G.gpsPath=M.findPath(p.x,p.z,w.x,w.z,fiets?'fiets':undefined)}
G.setWaypoint=setWp;G.clearWaypoint=clearWp;
// chip onder de minikaart: waar je heen gaat en hoe ver nog
const chip=document.createElement('button');chip.className='sd-wp';chip.id='sdWp';chip.hidden=true;document.body.appendChild(chip);
function hudWp(){const w=G.waypoint;chip.hidden=!w;if(!w)return;const d=dist(w.x,w.z);chip.innerHTML=`<i>${K.ic.route}</i><span><b>${E(w.n)}</b><small>${d} m</small></span><em data-x aria-label="Route wissen">×</em>`}
chip.addEventListener('click',e=>{if(e.target.closest('[data-x]')){clearWp();return}const w=G.waypoint;if(w){if(w.pl)G.goPlace(M.placeById(w.pl));else G.goTo(w.x,w.z)}});
let gt=0;setInterval(()=>{if(!G.ready||G.paused||!G.waypoint)return;gt++;if(gt%3===0)gps();hudWp();if(beam)beam.material.opacity=.22+Math.sin(performance.now()/300)*.08;
  if(dist(G.waypoint.x,G.waypoint.z)<5){G.toast&&G.toast('Je bent er','ok');G.snd&&G.snd.fx('ok');clearWp()}},500);

/* =================== uitlichten (voor andere onderdelen) =================== */
function highlight(x,z,n,o){o=o||{};const id=o.id||('h'+(++HLN));unhighlight(id,1);HL.push({id,x,z,n:n||'Hier',c:o.c||'#ffd35a',ic:o.ic||'star',sh:o.sh||'ci',keep:!!o.keep,until:o.t?performance.now()+o.t*1000:0});
  if(o.route&&G.setWaypoint)G.setWaypoint(x,z,n||'Hier');req(true);return id}
function unhighlight(id,quiet){if(id==null)HL.length=0;else{const i=HL.findIndex(h=>h.id===id);if(i>=0)HL.splice(i,1)}if(!quiet)req(true)}

/* =================== openen, sluiten, bedienen =================== */
function open(){if(G.ui&&G.ui.closeAll)G.ui.closeAll();ov.hidden=false;if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.pause();
  leg.hidden=!ST.leg;mainEl.classList.toggle('leg-on',!!ST.leg);if(ST.leg)legB.innerHTML=legHtml();size();
  if(!open._z){Z=Math.max(minZ(),Math.min(maxZ,Math.min(VW,VH)/(touch?240:300)));open._z=1}CX=G.P.x;CZ=G.P.z;clampView();hideCard();chipsHtml();L.sig='';needLayout=true;draw();if(!leg.hidden)legB.innerHTML=legHtml();G.snd&&G.snd.fx('open')}
function close(){if(ov.hidden)return;ov.hidden=true;G.snd&&G.snd.fx('close');if(!(G.ui&&G.ui.cur&&G.ui.cur()))G.resume()}
addEventListener('resize',()=>{if(!ov.hidden){size();req(true)}});
setInterval(()=>{if(!ov.hidden)req(true)},600);
function zoomAt(f,mx,my){const ax=wx(mx),az=wz(my);Z*=f;clampView();CX=ax-(mx-VW/2)/Z;CZ=az-(my-VH/2)/Z;clampView();req(true)}
function flyTo(x,z,z2){CX=x;CZ=z;if(z2)Z=z2;clampView();req(true)}
// slepen, knijpen, scrollen (vastpakken pas als je echt sleept, zodat tikken op een markering gewoon werkt)
const pts=new Map();let drag=null,pinch=null,dragged=false;
const isUi=t=>t.closest('.kctl,.kme-b,.klegb,.kcard,.kedge');
view.addEventListener('pointerdown',e=>{if(isUi(e.target))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pts.size===2){const [a,b]=[...pts.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:Z,mx:(a.x+b.x)/2,my:(a.y+b.y)/2};drag=null;dragged=true;try{view.setPointerCapture(e.pointerId)}catch(_){}return}
  dragged=false;drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,t:performance.now(),id:e.pointerId,cap:false}});
view.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch&&pts.size===2){gest=performance.now();const [a,b]=[...pts.values()],r=view.getBoundingClientRect(),mx=(a.x+b.x)/2-r.left,my=(a.y+b.y)/2-r.top;const ax=wx(mx),az=wz(my);
    Z=pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(20,pinch.d);clampView();CX=ax-(mx-VW/2)/Z;CZ=az-(my-VH/2)/Z;
    const pmx=pinch.mx-r.left,pmy=pinch.my-r.top;CX-=(mx-pmx)/Z;CZ-=(my-pmy)/Z;pinch.mx=(a.x+b.x)/2;pinch.my=(a.y+b.y)/2;clampView();req(true);return}
  if(!drag)return;if(!drag.cap&&Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>6){drag.cap=true;dragged=true;view.classList.add('drag');try{view.setPointerCapture(e.pointerId)}catch(_){}}
  if(!drag.cap)return;CX-=(e.clientX-drag.x)/Z;CZ-=(e.clientY-drag.y)/Z;drag.x=e.clientX;drag.y=e.clientY;clampView();req()});
const up=e=>{pts.delete(e.pointerId);if(pts.size<2&&pinch){pinch=null;gest=0;req(true)}view.classList.remove('drag');if(!drag)return;const d=drag;drag=null;
  if(!d.cap&&performance.now()-d.t<600&&!e.target.closest('.kpin,.klab')&&!isUi(e.target)){const r=view.getBoundingClientRect(),x=wx(e.clientX-r.left),z=wz(e.clientY-r.top);
    if(x>=0&&z>=0&&x<M.W&&z<M.H){if(!card.hidden){hideCard();return}showCard({x,z,n:'Plek op de kaart'})}}};
view.addEventListener('pointerup',up);view.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);drag=null;pinch=null;view.classList.remove('drag')});
view.addEventListener('wheel',e=>{e.preventDefault();gest=performance.now();const r=view.getBoundingClientRect();zoomAt(Math.pow(1.0018,-(e.deltaMode?e.deltaY*30:e.deltaY)),e.clientX-r.left,e.clientY-r.top)},{passive:false});
view.addEventListener('dblclick',e=>{if(e.target.closest('.kpin')||isUi(e.target))return;const r=view.getBoundingClientRect();zoomAt(1.8,e.clientX-r.left,e.clientY-r.top)});
ov.addEventListener('click',e=>{const t=e.target;
  if(t===ov||t.closest('[data-close]')){close();return}
  if(t.closest('[data-cclose]')){hideCard();return}
  const lay=t.closest('[data-lay]');if(lay){const k=lay.dataset.lay;LAY[k]=LAY[k]?0:1;saveSt();refreshUi();G.snd&&G.snd.fx('tab');return}
  const cr=t.closest('[data-cat]');if(cr){const k=cr.dataset.cat,C=CAT[k];if(C.fixed)return;if(C.lay&&!LAY[C.lay]){LAY[C.lay]=1;ST.off[k]=0}else ST.off[k]=ST.off[k]?0:1;saveSt();refreshUi();G.snd&&G.snd.fx('tab');return}
  if(t.closest('[data-all]')){ST.off={};Object.keys(LAY).forEach(k=>LAY[k]=1);saveSt();refreshUi();return}
  if(t.closest('[data-leg]')){legShow(leg.hidden);return}
  if(t.closest('[data-legx]')){legShow(false);return}
  const zb=t.closest('[data-z]');if(zb){zoomAt(+zb.dataset.z>0?1.5:1/1.5,VW/2,VH/2);return}
  if(t.closest('[data-me]')){flyTo(G.P.x,G.P.z,Math.max(Z,2.6));return}
  const ex=t.closest('[data-ex]');if(ex){const [x,z]=ex.dataset.ex.split(',').map(Number);flyTo(x,z);return}
  const pin=t.closest('[data-c]');if(pin){if(dragged)return;const o=L.cells[+pin.dataset.c];if(!o)return;
    if(o.more.length){const all=[o,...o.more];let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;all.forEach(q=>{x0=Math.min(x0,q.x);x1=Math.max(x1,q.x);z0=Math.min(z0,q.z);z1=Math.max(z1,q.z)});
      const fit=Math.min(VW/Math.max(30,(x1-x0)*1.6),VH/Math.max(30,(z1-z0)*1.6)),nz=Math.min(maxZ,Math.max(Z*1.8,Math.min(fit,Z*3)));
      if(Z>=maxZ*.95||nz<=Z*1.05){showCard({cat:o.cat,list:all,x:o.x,z:o.z});return}flyTo((x0+x1)/2,(z0+z1)/2,nz);G.snd&&G.snd.fx('tab');return}
    showCard(o);return}
  const lab=t.closest('[data-l]');if(lab){const o=L.cells[+lab.dataset.l];if(o)showCard(o);return}
  const li=t.closest('[data-li]');if(li){const o=card._list&&card._list[+li.dataset.li];if(o)showCard(o);return}
  const wp=t.closest('[data-wp]');if(wp){const [x,z,...n]=wp.dataset.wp.split(',');setWp(+x,+z,n.join(','),wp.dataset.pl);close();return}
  const wk=t.closest('[data-walk]');if(wk){const [x,z]=wk.dataset.walk.split(',');close();if(G.ui&&G.ui.cur&&G.ui.cur())G.ui.leaveQuiet&&G.ui.leaveQuiet();G.resume();if(wk.dataset.pl)G.goPlace(M.placeById(wk.dataset.pl));else G.goTo(+x,+z);return}
  if(t.closest('[data-clear]')){clearWp();hideCard();return}
  if(t.closest('[data-allown]')){showCard({allOwn:1});return}
  if(t.closest('[data-not]')){close();G.vastgoed&&G.vastgoed.open();return}
  const go=t.closest('[data-go]');if(go){const p=M.placeById(go.dataset.go);if(p){setWp(p.door.x,p.door.z,p.name.replace(/^(Thuis: |Jouw )/,''),p.id);close()}return}});
addEventListener('keydown',e=>{if(ov.hidden)return;const k=e.key.toLowerCase();const t=e.target;if(t&&/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))return;
  if(k==='escape'){e.preventDefault();e.stopImmediatePropagation();if(!card.hidden)hideCard();else if(!leg.hidden&&touch)legShow(false);else close();return}
  if(k==='m'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();close();return}
  if(k==='l'&&!e.repeat){e.preventDefault();e.stopImmediatePropagation();legShow(leg.hidden);return}
  const st=60/Z;if(k==='arrowleft'||k==='a'){CX-=st}else if(k==='arrowright'||k==='d'){CX+=st}else if(k==='arrowup'||k==='w'){CZ-=st}else if(k==='arrowdown'||k==='s'){CZ+=st}
  else if(k==='+'||k==='='){zoomAt(1.5,VW/2,VH/2)}else if(k==='-'){zoomAt(1/1.5,VW/2,VH/2)}else if(k==='h'){flyTo(G.P.x,G.P.z,Math.max(Z,2.6))}else return;
  e.preventDefault();e.stopImmediatePropagation();clampView();req(true)},true);

/* =================== minikaart (getekend vanuit stad-ui.js) =================== */
// zelfde vormen en kleuren als de grote kaart, kleiner; je route; een pijl aan de rand naar je doel als het buiten beeld is
const MMR=192;
function mmShape(c,sh,x,y,r,col,dim){c.save();c.translate(Math.round(x),Math.round(y));c.beginPath();
  if(sh==='sq'){const q=r*.86;c.rect(-q,-q,2*q,2*q)}else if(sh==='dia'){c.moveTo(0,-r*1.15);c.lineTo(r*1.15,0);c.lineTo(0,r*1.15);c.lineTo(-r*1.15,0);c.closePath()}
  else if(sh==='shd'){c.moveTo(-r*.9,-r*.9);c.lineTo(r*.9,-r*.9);c.lineTo(r*.9,r*.15);c.quadraticCurveTo(r*.8,r*.75,0,r*1.1);c.quadraticCurveTo(-r*.8,r*.75,-r*.9,r*.15);c.closePath()}
  else if(sh==='hs'){c.moveTo(0,-r*1.05);c.lineTo(r,-r*.15);c.lineTo(r,r*.95);c.lineTo(-r,r*.95);c.lineTo(-r,-r*.15);c.closePath()}
  else if(sh==='drop'){c.arc(0,-r*.55,r*.8,Math.PI*.8,Math.PI*.2,false);c.lineTo(0,r*.8);c.closePath()}
  else c.arc(0,0,r,0,Math.PI*2);
  c.lineJoin='round';c.lineWidth=2.4;c.strokeStyle='#0b0c0f';c.stroke();c.fillStyle=dim?'#8a8f98':col;c.fill();c.restore()}
function mini(cvm,c,walk){const P=G.P;if(!P)return;if(cvm.width!==MMR){cvm.width=cvm.height=MMR}
  const w=cvm.width,h=w/2,s=1.3*w/144,yaw=G.yaw||0,cs=Math.cos(yaw),sn=Math.sin(yaw);
  c.setTransform(1,0,0,1,0,0);c.imageSmoothingEnabled=false;c.fillStyle=SEA;c.fillRect(0,0,w,w);
  c.save();c.translate(h,h);c.rotate(yaw);c.scale(s,s);c.translate(-P.x,-P.z);c.drawImage(mapCv,0,0);
  if(LAY.bezit)ownedPlaces().forEach(p=>{const r=p.rect;if(!r)return;c.fillStyle='rgba(95,211,90,.5)';c.fillRect(r.x0,r.z0,r.x1-r.x0,r.z1-r.z0)});
  if(G.police&&G.police.dots)(safe(()=>G.police.dots())||[]).forEach(d=>{if(!d.r)return;c.beginPath();c.arc(d.x,d.z,d.r,0,Math.PI*2);c.fillStyle='rgba(77,125,255,.15)';c.fill();c.strokeStyle='#4d7dff';c.lineWidth=2/s;c.stroke()});
  const line=(pts,col)=>{if(!pts||!pts.length)return;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(P.x,P.z);pts.forEach(q=>c.lineTo(q.x,q.z));c.strokeStyle='rgba(10,10,16,.8)';c.lineWidth=5/s;c.stroke();c.strokeStyle=col;c.lineWidth=2.8/s;c.stroke()};
  if(walk&&P.path)line(P.path,'#ffffff');if(G.missionPath&&G.missionPath.length)line(G.missionPath,'#ffd35a');if(G.gpsPath&&G.waypoint)line(G.gpsPath,'#ff4fd8');
  c.restore();
  const toS=(x,z)=>{const dx=(x-P.x)*s,dz=(z-P.z)*s;return [h+dx*cs-dz*sn,h+dx*sn+dz*cs]},R=h-2,inR=(p,m)=>Math.hypot(p[0]-h,p[1]-h)<R-(m||0);
  const dot=(x,z,col,r)=>{const p=toS(x,z);if(!inR(p,r))return;c.fillStyle='#0b0c0f';c.fillRect(Math.round(p[0]-r-1),Math.round(p[1]-r-1),2*r+2,2*r+2);c.fillStyle=col;c.fillRect(Math.round(p[0]-r),Math.round(p[1]-r),2*r,2*r)};
  // stipjes: mensen in de buurt, plekken zonder kaarticoon, auto-afleverpunten, missie, politie
  if(G.npcDots)(safe(()=>G.npcDots())||[]).forEach(d=>dot(d.x,d.z,d.c,1.6));
  if(G.spots)G.spots.forEach(sp=>{if(sp.map||!sp.dot)return;if(G.story&&!sp.story)return;if(Math.hypot(sp.x-P.x,sp.z-P.z)>(sp.dotR||90))return;if(sp.dotIf&&!safe(sp.dotIf))return;if(sp.k==='verhaal')return;dot(sp.x,sp.z,sp.dot,sp.big?3:2)});
  if(G.missionDots)(safe(()=>G.missionDots())||[]).forEach(d=>{if(!d.big)dot(d.x,d.z,d.c,2.6)});
  const fl=RM()?0:Math.floor(performance.now()/350)%2;
  if(G.police&&G.police.dots)(safe(()=>G.police.dots())||[]).forEach(d=>{if(d.r)return;const p=toS(d.x,d.z);if(!inR(p,4))return;c.beginPath();c.arc(p[0],p[1],4.6,0,Math.PI*2);c.fillStyle='#0b0c0f';c.fill();c.beginPath();c.arc(p[0],p[1],3.2,0,Math.PI*2);c.fillStyle=d.c==='#ff3d52'?'#ff3d52':(fl?'#4d7dff':'#ff3d52');c.fill()});
  // markeringen in dezelfde taal als de grote kaart (gefilterd zoals op de grote kaart)
  const its=items(),tg=[];its.sort((a,b)=>a.pri-b.pri).forEach(o=>{const C=CAT[o.cat]||CAT.overig;if(!shown(o))return;const p=toS(o.x,o.z);
    if(o.cat==='wp'||o.cat==='doel'||o.cat==='hl'||o.tgt){tg.push([o,p]);return}
    const far=Math.hypot(o.x-P.x,o.z-P.z);if(C.sm&&far>55)return;if(!inR(p,5))return;
    const r=o.big?6.2:C.sm?3.8:5;mmShape(c,o.sh||C.sh,p[0],p[1],r,o.c||C.c,o.dim);
    if(o.L){c.font='900 9px "Big Shoulders Display",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#111';c.fillText(o.L,Math.round(p[0]),Math.round(p[1])+1)}});
  // doelen: in beeld als markering, buiten beeld als pijl op de rand
  const pul=RM()?0:(Math.sin(performance.now()/220)+1)/2;
  tg.sort((a,b)=>b[0].pri-a[0].pri);tg.forEach(([o,p])=>{const C=CAT[o.cat],col=o.c||C.c,sh=o.sh||C.sh;
    if(inR(p,8)){c.beginPath();c.arc(p[0],p[1]-(sh==='drop'?6:0),8+pul*3,0,Math.PI*2);c.strokeStyle=col;c.globalAlpha=.55-pul*.35;c.lineWidth=2;c.stroke();c.globalAlpha=1;mmShape(c,sh,p[0],p[1],7,col);return}
    if(tg.some(q=>q[2]&&Math.hypot(q[0].x-o.x,q[0].z-o.z)<10))return;tg.find(q=>q[0]===o).push(1);const a=Math.atan2(p[1]-h,p[0]-h),ex=h+Math.cos(a)*(R-20),ey=h+Math.sin(a)*(R-20);c.save();c.translate(ex,ey);c.rotate(a);c.beginPath();c.moveTo(10,0);c.lineTo(-6,-8.5);c.lineTo(-2,0);c.lineTo(-6,8.5);c.closePath();
    c.lineJoin='round';c.lineWidth=3;c.strokeStyle='#0b0c0f';c.stroke();c.fillStyle=col;c.fill();c.restore()});
  // jij: witte pijl met zwarte rand, in je looprichting
  c.save();c.translate(h,h);c.rotate(yaw+Math.atan2(Math.cos(P.ry),Math.sin(P.ry)));c.beginPath();c.moveTo(9,0);c.lineTo(-6,6.5);c.lineTo(-2.6,0);c.lineTo(-6,-6.5);c.closePath();c.lineJoin='round';c.lineWidth=3.2;c.strokeStyle='#0b0c0f';c.stroke();c.fillStyle='#fff';c.fill();c.restore()}

G.kaart={open,close,isOpen:()=>!ov.hidden,draw:()=>{if(!ov.hidden)req(true)},highlight,unhighlight,mini,items,cats:CAT,pin:(cat,o)=>pinHtml(Object.assign({cat},o||{})),legend:on=>legShow(on==null?leg.hidden:!!on),
  fly:(x,z,zoom)=>flyTo(x,z,zoom),refresh:()=>{L.sig='';refreshUi()},el:ov,setWp,clearWp};
})();
