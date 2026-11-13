// Verhaal "De Bezorger": het uiterlijk van Luca en de cast (G.uiterlijk, agent LOOK).
// - Cast met geboortejaar: iedereen wordt mee ouder met het verhaal (Luca 16 → 24). Grijzer haar (eerst bij de slapen, peper en zout),
//   inhammen → kalend → kaal, rimpels en wallen, baardgroei. Luca van een bos krullen naar korter haar, stoppels en een baard;
//   Giulia van studente naar advocaat, Sanne van de kassa naar een mantelpak.
// - Kleding per situatie en route: school, bezorger (rode jas van Bella Napoli), thuis, straat (trainingspakken), zakelijk (pakken),
//   casual, klus (alles zwart, handschoenen, capuchon op, zonnebril; 'masker' = bivakmuts), gala, gevangenis. Automatisch uit de
//   Koers (S.story.m.koers: + zakelijk, − straat), de plek (G.binnen), de stap van het verhaal en het soort missie (U.situatie).
//   Luca's gezicht ligt vast: de speler kiest alleen kapsel, baard (vanaf 18) en de kleur binnen de stijl van zijn route.
// - Drie vormen van één look: spec(id) = stad-avatar-poppetje (spel), face(id) = K.face-portret, look(id) = platte look.
// - Cutscènes: gedetailleerde voxel-personen (ogen met wit, iris en glans, wenkbrauwen, monden om mee te praten, handen met vingers,
//   ritsen, kragen, plooien, haar met volume), een filmische beeldmodus (hogere resolutie, zachte schaduw, randlicht, scherptediepte
//   met bokeh, filmkorrel, vignet) en grote 3D-portretten in pixels voor de ondertitels. Hooks: G.cut.bouwer, G.cut.portret,
//   G.cut.onStart/onEnd, G.cut.hq (stad-cut.js roept dit zelf aan).
// Bewaard in S.story.look = {age, ageCh, hs, fh, kl:{stijl:n}, outfit, vast}. Raakt het klikspel niet.
(function(){
'use strict';
if(!window.STAD||!window.THREE)return;
const G=STAD,TH=window.THREE;
const U=G.uiterlijk={};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),sin=Math.sin,cos=Math.cos,abs=Math.abs;
const isHex=h=>typeof h==='string'&&/^#[0-9a-f]{6}$/i.test(h);
const hx=h=>{const n=parseInt(String(h).slice(1),16);return [n>>16&255,n>>8&255,n&255]};
const toHex=(r,g,b)=>'#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const shade=(h,k)=>{if(!isHex(h))return h;const c=hx(h);return toHex(c[0]*k,c[1]*k,c[2]*k)};
const mix=(a,b,t)=>{if(!isHex(a)||!isHex(b))return a;const A=hx(a),B=hx(b);return toHex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t)};
const hsh=(a,b,c,s)=>{let h=(Math.imul(a|0,374761393)+Math.imul(b|0,668265263)+Math.imul(c|0,1274126177)+Math.imul(s|0,265443576))|0;h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;return (h>>>0)/4294967296};
const sid=s=>{let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0};
const sv=()=>{try{save()}catch(e){}};
const story=()=>!!(G.story&&G.story.on&&G.story.on());

/* =================== de cast =================== */
// born: geboortejaar (Luca 2010, het verhaal begint in 2026). grijs: leeftijd waarop het grijs begint (na 25 jaar wit),
// kaal: leeftijd van de eerste inhammen (+7 kalend, +16 kaal), kmax: verder dan die fase niet. hs/fh: vast of (leeftijd)=>…
// kl: kleding per situatie (std = standaard); een kledingstuk mag ook (leeftijd)=>{…} zijn.
// kleding: k soort (hoodie bezorger jack tee polo track suit tux blazer overhemd trui vest blouse scrubs schort coat leer bomber
//   uniform werk sweat jurk), c/c2/c3 kleuren (c3 = shirt eronder), b broek (jeans jogger track pantalon chino werk scrub rok bloot),
//   bc/b2, s schoen (sneaker nette laars slipper), sc/s2, hat (cap beanie pet mask hood hat), hatC, tie, bow, ch (goud zilver parel),
//   wt horloge, gl handschoenen, zon, tas (rugzak), pochet, krijt (krijtstreep), riem, dubbel, col (col-trui), hood:'up'.
const LUCA_GEBOREN=2010,START=2026;
const CH_AGE={1:16,2:16,3:17,4:17,5:18,6:18,7:19,8:20,9:21,10:22};
const CAST={
 luca:{n:'Luca',col:'#ff4fd8',rol:'Bezorger',born:2010,skin:'#c8956a',eye:'#3a2414',hair:'#1a1410',fw:18,jaw:'rond',mood:'neutraal',mouth:'normaal',
   hs:a=>a<18?'krul':a<19?'krulkort':a<21?'kort':'kuif',fh:a=>a<17?'':a<18?'dons':a<21?'stoppel':'kortbaard',h:a=>a<17?.95:a<18?.97:1},
 elena:{n:'Elena',col:'#7fd1ff',rol:'Moeder · verpleegster',born:1980,v:1,skin:'#d9a27a',eye:'#5a3a22',hair:'#3a2418',grijs:46,hs:'knot',mouth:'vol',lip:'#a0504a',fw:16,jaw:'spits',h:.94,
   kl:{std:{k:'scrubs',c:'#7fb8c9',b:'scrub',bc:'#7fb8c9',s:'sneaker',sc:'#f1efe9',s2:'#c9cfd6'},thuis:{k:'vest',c:'#8a6a5a',c3:'#e8e4da',b:'jeans',bc:'#2c3a4d',s:'slipper',sc:'#5a3a2a'}}},
 marco:{n:'Marco',col:'#d6a63e',rol:'Vader · havenwerker',born:1976,skin:'#c8956a',eye:'#3a2414',hair:'#2a2622',grijs:40,kaal:46,kmax:2,hs:'kort',fh:'stoppel',fw:20,jaw:'hoekig',h:1.03,w:1.06,
   kl:{std:{k:'tee',c:'#8a8c90',b:'jogger',bc:'#2a2c30',s:'sneaker',sc:'#3a3f48',s2:'#24282f'},haven:{k:'werk',c:'#e8742a',b:'werk',bc:'#2a3040',s:'laars',sc:'#3a2a1a'}}},
 giulia:{n:'Giulia',col:'#c49bff',rol:'Zus',born:2007,v:1,skin:'#d0a07a',eye:'#3a2414',hair:'#1a1410',hs:a=>a<22?'lang':'bob',mouth:'vol',fw:16,jaw:'spits',bril:'#2a2c30',h:.95,
   rolA:a=>a<23?'Zus · studeert rechten':'Zus · advocaat',
   kl:{std:a=>a<23?{k:'jack',c:'#6a2a3a',c2:'#e8e4da',b:'jeans',bc:'#2c3a4d',s:'laars',sc:'#2a1a12'}:{k:'blazer',c:'#1f2433',c3:'#f1efe9',b:'pantalon',bc:'#1f2433',s:'nette',sc:'#16161a',ch:'parel'},
     thuis:{k:'trui',c:'#8a4a5a',b:'jeans',bc:'#2c3a4d',s:'slipper',sc:'#3a2a2a'}}},
 giovanni:{n:'Giovanni',col:'#3fe395',rol:'Pizzeria Bella Napoli',born:1958,skin:'#e0ab84',eye:'#5a3a22',hair:'#3a2a20',grijs:36,kaal:40,kmax:2,hs:'kort',fh:'snor',mood:'blij',fw:20,jaw:'rond',h:.97,w:1.12,
   kl:{std:{k:'schort',c:'#f1efe9',c2:'#b8333a',b:'pantalon',bc:'#3a3c40',s:'nette',sc:'#3a2418'}}},
 dex:{n:'Dex',col:'#ff5a4a',rol:'Beste vriend',born:2010,skin:'#8d5a3a',eye:'#24160e',hair:'#16161a',hs:'opgeschoren',fh:a=>a<18?'':a<20?'sik':'ringbaard',mood:'blij',mouth:'breed',oor:1,h:a=>a<17?.96:1,
   kl:{std:a=>({k:'track',c:'#b0221e',c2:'#16161a',b:'track',bc:'#16161a',b2:'#b0221e',s:'sneaker',sc:'#f1efe9',s2:'#b0221e',hat:'cap',hatC:'#16161a',capAchter:1,ch:a<19?'zilver':'goud',wt:a>=20?'#d6a63e':null})}},
 rafiq:{n:'Rafiq',col:'#ffd35a',rol:'Eigenaar Lounge Sahara',born:1984,skin:'#b97a52',eye:'#24160e',hair:'#16161a',grijs:41,hs:'achterover',fh:'ringbaard',mood:'koel',jaw:'hoekig',oor:1,
   kl:{std:{k:'leer',c:'#16161a',c2:'#c9a227',c3:'#2a2c30',b:'jeans',bc:'#1a1a1c',s:'laars',sc:'#2a1a12',ch:'goud',wt:'#d6a63e'}}},
 ray:{n:'Grote Ray',col:'#e8e4da',rol:'',born:1978,skin:'#4a2e20',eye:'#24160e',hair:'#16161a',grijs:43,hs:'kaal',fh:'kortbaard',mood:'koel',fw:20,jaw:'hoekig',h:1.1,w:1.22,
   kl:{std:{k:'suit',c:'#2a2c30',c3:'#16161a',b:'pantalon',bc:'#1a1a1c',s:'nette',sc:'#16161a',wt:'#c9cfd6'}}},
 nova:{n:'Nova',col:'#ff3d7a',rol:'Rechterhand van Ray',born:1994,v:1,skin:'#b97a52',eye:'#24160e',hair:'#16161a',hs:'staart',mood:'koel',fw:16,jaw:'spits',h:.96,
   kl:{std:a=>({k:'leer',c:'#121316',c2:'#3a3d44',c3:'#121316',b:'jeans',bc:'#121316',s:'laars',sc:'#121316',gl:'#121316',hat:a<19?'mask':'none',hatC:'#16161a'})}},
 sanne:{n:'Sanne',col:'#ffb35a',rol:'Dochter van Giovanni',born:2007,v:1,skin:'#e8b890',eye:'#3d7a42',hair:'#6a3a20',hs:'bob',mouth:'vol',lip:'#b04a50',fw:16,h:.95,
   kl:{std:a=>a<21?{k:'blouse',c:'#e8e0cc',b:'jeans',bc:'#2c3a4d',s:'laars',sc:'#3a2418'}:{k:'blazer',c:'#3a2a3a',c3:'#f1efe9',b:'pantalon',bc:'#2a2028',s:'nette',sc:'#16161a',ch:'goud'}}},
 bakker:{n:'Inspecteur Bakker',col:'#a9dcff',rol:'Recherche',born:1970,skin:'#e6b896',eye:'#5a6a7a',hair:'#5a4a3a',grijs:44,kaal:47,kmax:2,hs:'kort',fh:'snor',bril:'#3a3c40',fw:20,w:1.08,
   kl:{std:{k:'coat',c:'#8a7a5a',c3:'#e8e4da',tie:'#5a2a2a',b:'pantalon',bc:'#4a4a48',s:'nette',sc:'#3a2418'}}},
 henk_vos:{n:'Henk Vos',col:'#5aa0ff',rol:'De haven',born:1962,skin:'#e8a888',eye:'#5a7a9a',hair:'#b8a070',grijs:50,hs:'kort',fh:'baard',fw:20,jaw:'hoekig',h:1.05,w:1.15,
   kl:{std:{k:'coat',c:'#1d2740',c3:'#2a2c30',col:1,dubbel:1,b:'werk',bc:'#2a2c30',s:'laars',sc:'#2a1a12'}}},
 jesse_vos:{n:'Jesse Vos',col:'#7ab0ff',rol:'Zoon van Henk',born:1999,skin:'#f0c8a8',eye:'#5a7a9a',hair:'#c8a050',hs:'opgeschoren',fh:'stoppel',
   kl:{std:{k:'bomber',c:'#2f3a2a',c2:'#d68a2a',b:'jeans',bc:'#2c3a4d',s:'laars',sc:'#3a2418'}}},
 teun:{n:'Kapitein Teun',col:'#8ad0c0',rol:'Havenman',born:1968,skin:'#d8a07a',eye:'#5a7a9a',hair:'#4a3a2a',grijs:40,hs:'kort',fh:'baard',fw:20,w:1.08,
   kl:{std:{k:'trui',c:'#1d2740',b:'werk',bc:'#3a3c40',s:'laars',sc:'#2a2018',hat:'beanie',hatC:'#2a2c30'}}},
 eva_brandt:{n:'Eva Brandt',col:'#f2c230',rol:'Journalist',born:1990,v:1,skin:'#f2cfb0',eye:'#3f6fb8',hair:'#d0a860',hs:'bob',mouth:'smal',bril:'#2a2c30',fw:16,
   kl:{std:{k:'coat',c:'#b8a07a',c2:'#8a7050',c3:'#16161a',riem:1,b:'jeans',bc:'#16161a',s:'laars',sc:'#16161a'}}},
 hoefnagel:{n:'Mr. Hoefnagel',col:'#c9a227',rol:'Advocaat',born:1968,skin:'#eac0a0',eye:'#5a6a7a',hair:'#4a4a4a',grijs:35,hs:'achterover',bril:'#c9a227',jaw:'spits',
   kl:{std:{k:'suit',c:'#1d2235',c3:'#f1efe9',tie:'#6a1f2a',pochet:'#e8e4da',krijt:1,b:'pantalon',bc:'#1d2235',s:'nette',sc:'#16161a',wt:'#c9a227'}}},
 van_rijn:{n:'Wethouder Van Rijn',col:'#ff9a5a',rol:'Politicus',born:1966,skin:'#e6b896',eye:'#5a6a7a',hair:'#7a6a5a',grijs:42,hs:'zij',
   kl:{std:{k:'suit',c:'#55595f',c3:'#dfe6ee',tie:'#c86a2a',b:'pantalon',bc:'#55595f',s:'nette',sc:'#2a1a12'}}},
 claes:{n:'Madame Claes',col:'#9ae6b4',rol:'Antwerpen',born:1961,v:1,skin:'#f0d0b8',eye:'#5a7a5a',hair:'#8a7a6a',grijs:45,hs:'knot',lip:'#8a2a3a',fw:16,jaw:'spits',h:.95,
   kl:{std:{k:'jurk',c:'#1f3a2e',ch:'parel',b:'bloot',s:'nette',sc:'#16161a'}}},
 kraus:{n:'Dieter Kraus',col:'#c9cfd6',rol:'Hamburg',born:1967,skin:'#ecc4a4',eye:'#7d8b97',hair:'#8a7a6a',grijs:40,hs:'opgeschoren',jaw:'hoekig',fw:20,
   kl:{std:{k:'coat',c:'#16171b',c3:'#2a2c30',col:1,b:'pantalon',bc:'#16171b',s:'nette',sc:'#16161a'}}},
 moreau:{n:'Inès Moreau',col:'#5a8aff',rol:'Europol',born:1985,v:1,skin:'#c48a62',eye:'#3a2414',hair:'#1a1210',hs:'staart',fw:16,
   kl:{std:{k:'blazer',c:'#1d2740',c3:'#f1efe9',b:'pantalon',bc:'#1d2740',s:'nette',sc:'#16161a'}}},
 buurvrouw_ans:{n:'Buurvrouw Ans',col:'#ffb0d0',rol:'Buurvrouw',born:1944,v:1,skin:'#f1caa5',eye:'#7d8b97',hair:'#d8d4cc',hs:'permanent',bril:'#c9cfd6',mood:'blij',fw:16,h:.88,
   kl:{std:{k:'vest',c:'#7a4a8a',c3:'#d8cdb5',b:'rok',bc:'#5a5a62',s:'nette',sc:'#3a2418'}}},
 // figuranten van hoofdstuk 1
 docent:{n:'Meneer Visser',col:'#a9dcff',rol:'Docent economie',born:1972,skin:'#f1caa5',eye:'#3f6fb8',hair:'#5a4a3a',grijs:40,kaal:44,kmax:2,hs:'kort',fh:'baard',bril:'#2a2c30',
   kl:{std:{k:'trui',c:'#6a5a3a',c3:'#d8cdb5',b:'chino',bc:'#4a3a2a',s:'nette',sc:'#3a2418'}}},
 uitsmijter:{n:'Uitsmijter',col:'#9aa1ab',rol:'Lounge Sahara',born:1988,skin:'#6e4630',eye:'#24160e',hair:'#16161a',hs:'kaal',fh:'sik',mood:'boos',fw:20,jaw:'hoekig',oor:1,h:1.1,w:1.2,
   kl:{std:{k:'bomber',c:'#121316',c2:'#2a2c30',b:'jeans',bc:'#121316',s:'laars',sc:'#121316',zon:1,oortje:1}}},
 klant_student:{n:'Student',col:'#3fe395',rol:'Klant',born:2005,skin:'#f1caa5',eye:'#3d7a42',hair:'#a8461e',hs:'lang',mood:'blij',fw:16,
   kl:{std:{k:'hoodie',c:'#2f5d3a',b:'jogger',bc:'#3a3c40',s:'sneaker',sc:'#e8e4da',s2:'#2f5d3a',hat:'beanie',hatC:'#c28a2a'}}},
 klant_oude_man:{n:'Meneer De Wit',col:'#d6a63e',rol:'Klant',born:1945,skin:'#ecc2a0',eye:'#7d8b97',hair:'#6a6058',grijs:38,kaal:45,kmax:2,hs:'kort',bril:'#8a6a2a',mood:'blij',h:.93,
   kl:{std:{k:'vest',c:'#7a5a3a',c3:'#e8e0cc',b:'pantalon',bc:'#5a5a62',s:'nette',sc:'#3a2418'}}},
 receptioniste:{n:'Receptioniste',col:'#a9dcff',rol:'Kantoor Zuidas',born:1996,v:1,skin:'#f1caa5',eye:'#3f6fb8',hair:'#d4ac5a',hs:'knot',mood:'koel',mouth:'smal',lip:'#b0404a',fw:16,jaw:'spits',h:.94,
   kl:{std:{k:'blazer',c:'#1f2d4a',c3:'#f1efe9',b:'pantalon',bc:'#1f2d4a',s:'nette',sc:'#16161a'}}},
 agent:{n:'Agent',col:'#4d7dff',rol:'Politie',born:1992,skin:'#e9b98f',eye:'#3f6fb8',hair:'#5a3a22',hs:'kort',
   kl:{std:{k:'uniform',c:'#1f2d4a',b:'pantalon',bc:'#1a2236',s:'laars',sc:'#121316',hat:'pet',hatC:'#1a2236'}}},
 rapido:{n:'Bezorger van Rapido',col:'#f2c230',rol:'Pizza Rapido',born:2006,skin:'#e9b98f',eye:'#3f6fb8',hair:'#c9a24a',hs:'kuif',mood:'boos',
   kl:{std:{k:'bezorger',c:'#f2c230',c2:'#2f5d3a',c3:'#2f5d3a',b:'track',bc:'#2f5d3a',b2:'#f2c230',s:'sneaker',sc:'#16161a',s2:'#f2c230',hat:'cap',hatC:'#2f5d3a'}}},
 scooterdief:{n:'Scooterdief',col:'#9aa1ab',rol:'',born:2007,skin:'#d9a27a',eye:'#24160e',hair:'#16161a',hs:'kort',mood:'boos',fw:16,
   kl:{std:{k:'hoodie',c:'#2a2c30',b:'track',bc:'#16161a',b2:'#8a8c90',s:'sneaker',sc:'#e8e4da',s2:'#16161a',hat:'beanie',hatC:'#16161a'}}},
 brugklasser:{n:'Brugklasser',col:'#7fd1ff',rol:'',born:2014,skin:'#e9b98f',eye:'#5a3a22',hair:'#8a5a2a',hs:'kort',fw:16,h:.8,w:.9,
   kl:{std:{k:'hoodie',c:'#2f6a8a',b:'jeans',bc:'#2c3a4d',s:'sneaker',sc:'#e8e4da',s2:'#2f6a8a',hat:'cap',hatC:'#2f6a8a',c2:'#e8e4da',tas:'#3a3c40'}}},
 oudere_jongen:{n:'Oudere jongen',col:'#ff9a5a',rol:'',born:2009,skin:'#e9b98f',eye:'#24160e',hair:'#2a1d14',hs:'opgeschoren',mood:'boos',jaw:'hoekig',h:1.06,
   kl:{std:{k:'bomber',c:'#3a4a2a',c2:'#c28a2a',b:'track',bc:'#16161a',b2:'#e8e4da',s:'sneaker',sc:'#16161a',s2:'#e8e4da'}}}};
const ALIAS={ans:'buurvrouw_ans',grote_ray:'ray',henk:'henk_vos',jesse:'jesse_vos',eva:'eva_brandt',brandt:'eva_brandt',madame_claes:'claes',dieter_kraus:'kraus',
  ines:'moreau',ines_moreau:'moreau',van_rijn_wethouder:'van_rijn',wethouder:'van_rijn',klant_oud:'klant_oude_man',student:'klant_student',kapitein_teun:'teun',inspecteur:'bakker'};
const cid=id=>{id=String(id||'').toLowerCase();return CAST[id]?id:ALIAS[id]||null};

/* =================== leeftijd, keuzes, situatie =================== */
const LS0={hs:null,fh:null,kl:{}};let LSmem=JSON.parse(JSON.stringify(LS0));
function lst(){const s=G.story&&G.story.st?G.story.st():null;if(!s||typeof s!=='object')return LSmem;
  if(!s.look||typeof s.look!=='object')s.look=JSON.parse(JSON.stringify(LS0));if(!s.look.kl||typeof s.look.kl!=='object')s.look.kl={};return s.look}
const ch=()=>{try{const s=G.story&&G.story.st&&G.story.st();return s&&s.ch||1}catch(e){return 1}};
function lucaAge(){const L=lst(),c=ch();if(L.age!=null&&(L.ageCh==null||L.ageCh===c))return clamp(+L.age||16,12,30);return CH_AGE[c]||16}
const yearNow=()=>LUCA_GEBOREN+lucaAge();
function ageOf(id,la){const C=CAST[id];return (LUCA_GEBOREN+(la!=null?la:lucaAge()))-C.born}
const val=(v,a)=>typeof v==='function'?v(a):v;
// grijs 0..1, kaalfase 0..3, rimpels 0..4, wallen 0..2
const greyAt=(C,a)=>C.grijs==null?0:clamp((a-C.grijs)/25,0,1);
const baldAt=(C,a)=>{if(C.kaal==null)return 0;const s=a<C.kaal?0:a<C.kaal+7?1:a<C.kaal+16?2:3;return Math.min(s,C.kmax!=null?C.kmax:3)};
const rimpelAt=a=>a<30?0:a<42?1:a<55?2:a<70?3:4;
let SIT=null,SITsrc=null;     // situatie (missie/stap)
const SITMAP={school:'school',les:'school',bezorg:'bezorger',bezorgen:'bezorger',pizza:'bezorger',thuis:'thuis',klus:'klus',overval:'klus',inbraak:'klus',ontvoering:'klus',aanslag:'masker',masker:'masker',
  onderhandelen:'zakelijk',vergadering:'zakelijk',veiling:'zakelijk',rechtbank:'zakelijk',zakelijk:'zakelijk',kantoor:'zakelijk',gala:'gala',diner:'gala',gevangenis:'gevangenis',cel:'gevangenis',
  straat:'straat',vuurgevecht:'straat',achtervolging:'straat',hoek:'straat',casual:'casual',vrij:null};
const OUTFITS=['school','bezorger','thuis','straat','zakelijk','casual','klus','masker','gala','gevangenis'];
function koers(){try{if(G.story&&G.story.meter)return +G.story.meter('koers')||0;const s=G.story.st();return +(s.m&&s.m.koers)||0}catch(e){return 0}}
// de outfit van Luca nu (handmatig vast > situatie > plek > jas van Giovanni > route)
function lucaOutfit(){const L=lst(),a=lucaAge();if(L.vast&&L.outfit&&OUTFITS.includes(L.outfit))return L.outfit;
  if(SIT)return SIT;
  let w=null;try{w=G.binnen&&G.binnen.waar&&G.binnen.waar()}catch(e){}
  if(w==='thuis')return 'thuis';if(w==='klas')return 'school';
  let s=null;try{s=G.story&&G.story.st&&G.story.st()}catch(e){}
  if(s&&(s.outfit==='bezorger'||(s.flags&&s.flags.jas)))return 'bezorger';
  if(s&&s.outfit&&OUTFITS.includes(s.outfit))return s.outfit;
  if(L.outfit&&OUTFITS.includes(L.outfit))return L.outfit;
  const k=koers();if(a<18)return k<=-35?'straat':'school';return k>=20?'zakelijk':k<=-20?'straat':'casual'}
// welke stijl de keuze van de speler (kleurvariant) volgt
const STIJL={straat:'straat',zakelijk:'zakelijk',casual:'casual',thuis:'thuis'};
function lucaKl(n,a,v){v=v|0;const pk=L=>L[((v%L.length)+L.length)%L.length];
  switch(n){
  case 'school':return {k:'hoodie',c:'#7d8088',b:'jeans',bc:'#2c3a4d',s:'sneaker',sc:'#e8e4da',s2:'#b8333a',tas:a<18?'#2a2c30':null};
  case 'bezorger':return {k:'bezorger',c:'#c0261e',c2:'#f1efe9',c3:'#7d8088',b:'jeans',bc:'#2c3a4d',s:'sneaker',sc:'#e8e4da',s2:'#b8333a'};
  case 'thuis':return {k:'tee',c:pk(['#2f5d3a','#2a2c30','#7a2f2a','#2f4a6a']),c2:v%2?null:'#e8e4da',b:'jogger',bc:'#5a5d63',s:'slipper',sc:'#1a1a1c'};
  case 'straat':{const T=pk([['#16171b','#e8e4da'],['#1f2a4a','#e8e4da'],['#5a1a22','#e8b923'],['#e8e4da','#16171b'],['#2a3a2a','#c9a227']]);
    return {k:'track',c:T[0],c2:T[1],b:'track',bc:T[0],b2:T[1],s:'sneaker',sc:'#f4f1ea',s2:T[1],ch:a>=18?'goud':null,wt:a>=20?'#d6a63e':null,hat:a<18&&v%3===1?'cap':'none',hatC:T[0]}}
  case 'zakelijk':{const C=pk(['#2e3238','#1d2740','#16171b','#5a4a3a']);
    if(a<18)return {k:'overhemd',c:'#e8e4da',jas:C,b:'chino',bc:'#2a3040',s:'sneaker',sc:'#f4f1ea',s2:'#16171b'};
    return {k:'suit',c:C,c3:'#f1efe9',tie:a>=20?pk(['#6a1f2a','#1d2740','#2a2c30','#4a3a1a']):null,pochet:a>=21?'#e8e4da':null,b:'pantalon',bc:C,s:'nette',sc:'#16161a',wt:a>=20?'#c9cfd6':null}}
  case 'casual':if(a<18)return {k:'hoodie',c:pk(['#16171b','#3a4a6a','#5a1a22']),b:'jeans',bc:'#1d2531',s:'sneaker',sc:'#e8e4da',s2:'#16171b'};
    return {k:'leer',c:pk(['#16171b','#4a2e1e','#2a3040']),c3:'#e8e4da',b:'jeans',bc:'#1d2531',s:'sneaker',sc:'#e8e4da',s2:'#16171b',wt:a>=20?'#c9cfd6':null};
  case 'klus':return {k:'hoodie',c:'#121316',hood:'up',b:'jogger',bc:'#121316',s:'sneaker',sc:'#121316',s2:'#2a2c30',gl:'#0c0d0f',zon:1};
  case 'masker':return {k:'hoodie',c:'#121316',b:'jogger',bc:'#121316',s:'sneaker',sc:'#121316',s2:'#2a2c30',gl:'#0c0d0f',hat:'mask',hatC:'#121316'};
  case 'gala':return {k:'tux',c:'#121316',c3:'#f4f1ea',bow:'#121316',b:'pantalon',bc:'#121316',s:'nette',sc:'#0c0c0e',wt:'#c9cfd6',pochet:'#f4f1ea'};
  case 'gevangenis':return {k:'sweat',c:'#5a6a7a',b:'jogger',bc:'#5a6a7a',s:'slipper',sc:'#2a2c30'}}
  return lucaKl('school',a,v)}
// algemene kleding voor de rest van de cast als ze iets anders aan moeten
function algKl(n,C,a){const v=!!C.v;
  if(n==='klus'||n==='masker')return {k:'hoodie',c:'#121316',hood:n==='klus'?'up':null,b:'jogger',bc:'#121316',s:'sneaker',sc:'#121316',gl:'#0c0d0f',zon:n==='klus'?1:0,hat:n==='masker'?'mask':'none',hatC:'#121316'};
  if(n==='gala')return v?{k:'jurk',c:'#5a1020',ch:'goud',b:'bloot',s:'nette',sc:'#16161a'}:{k:'tux',c:'#121316',c3:'#f4f1ea',bow:'#121316',b:'pantalon',bc:'#121316',s:'nette',sc:'#0c0c0e'};
  if(n==='gevangenis')return {k:'sweat',c:'#5a6a7a',b:'jogger',bc:'#5a6a7a',s:'slipper',sc:'#2a2c30'};
  return null}
const KLV={};   // per persoon een vaste outfit (U.outfit(naam,{wie}))

/* =================== één look uitrekenen =================== */
const HS_KAR={krulkort:'krul',permanent:'krul',achterover:'kort',inham:'kort'};
const FH_KAR={kortbaard:'baard',dons:''};
const HS_AV={krulkort:'krul',permanent:'krul',achterover:'kuif',inham:'kort'};
function lookOf(id,o){o=o||{};id=cid(id);if(!id)return null;const C=CAST[id],la=o.lucaAge!=null?o.lucaAge:lucaAge(),a=ageOf(id,la),L0=lst();
  const g=greyAt(C,a),b=baldAt(C,a);
  let hs=val(C.hs,a)||'kort',fh=val(C.fh,a)||'';
  if(id==='luca'){if(L0.hs)hs=L0.hs;if(L0.fh!=null&&a>=18)fh=L0.fh}
  if(b>=3)hs='kaal';else if(b===2&&hs!=='kaal')hs='kalend';else if(b===1&&(hs==='kort'||hs==='zij'||hs==='kuif'||hs==='achterover'))hs='inham';
  // outfit
  let on=o.outfit||KLV[id]||null,O=null;
  if(id==='luca'){on=on||lucaOutfit();const st=STIJL[on];O=lucaKl(on,a,st?(L0.kl[st]|0):0)}
  else{const kl=C.kl||{};if(on&&kl[on])O=val(kl[on],a);else if(on)O=algKl(on,C,a);if(!O)O=val(kl.std,a)||{k:'tee',c:'#30353e',b:'jeans',bc:'#1d2531',s:'sneaker',sc:'#3a3f48'};on=on||'std'}
  O=Object.assign({},O);if(o.masker===true){O.hat='mask';O.hatC=O.hatC&&O.hat!=='none'?O.hatC:'#121316'}
  const hairBase=C.hair,hair=g>0?(g<.75?mix(hairBase,'#a9a6a1',Math.min(1,g*1.25)):mix('#a9a6a1','#e6e2dc',(g-.75)*4)):hairBase;
  const h=val(C.h,a)||1,w=val(C.w,a)||1;
  let wallen=a>=62?2:a>=45?1:0;if(id==='luca'&&a>=20&&koers()<=-20)wallen=1;
  return {_id:id,_u:1,_age:a,_jaar:LUCA_GEBOREN+la,_outfit:on,n:C.n,col:C.col,skin:C.skin,eye:C.eye,hair,hairBase,grey:g,bald:b,hs2:hs,fh2:fh,hs:HS_KAR[hs]||hs,fh:FH_KAR[fh]!=null?FH_KAR[fh]:fh,
    mood:o.mood||C.mood||'neutraal',mouth:C.mouth||'normaal',fw:C.fw||18,jaw:C.jaw||'rond',nose:C.nose||'',v:C.v?1:0,lip:C.lip||null,bril:C.bril||null,oor:C.oor||0,
    age:a<38?0:a<60?1:2,rimpel:rimpelAt(a),wallen,h,w,o:O}}

// stad-avatar spec (3D-poppetje in het spel)
const TOPK={hoodie:'hoodie',bezorger:'jacket',jack:'jacket',tee:'tee',polo:'tee',scrubs:'tee',track:'track',suit:'suit',tux:'suit',blazer:'suit',overhemd:'jacket',trui:'trui',vest:'jacket',
  blouse:'jacket',schort:'jacket',coat:'jacket',leer:'jacket',bomber:'jacket',uniform:'jacket',werk:'jacket',sweat:'sweat',jurk:'dress'};
function toSpec(L){const O=L.o||{},k=O.k||'tee',tk=TOPK[k]||'tee';
  let c2=O.c2||shade(O.c||'#30353e',1.3);if(tk==='suit')c2=O.tie||O.bow||O.c3||'#f1efe9';if(k==='overhemd')c2=shade(O.c,.85);if(k==='schort')c2='#f4f1ea';
  const hk={cap:'cap',pet:'cap',beanie:'beanie',mask:'skimask',hat:'hat',hood:'beanie'}[O.hood==='up'?'hood':O.hat]||'none';
  const hc=O.hood==='up'?O.c:(O.hatC||'#2a2c30');
  const nek=O.ch==='goud'?'goud ketting':O.ch?'zilver ketting':(O.tie&&tk!=='suit'?'das':null);
  const sole=O.s==='nette'||O.s==='laars'?'#1a1410':O.s==='slipper'?(O.sc||'#2a2c30'):'#e8e4da';
  return {_id:L._id,_look:L,skin:L.skin,hair:L.hair,hs:HS_AV[L.hs2]||L.hs2,fh:FH_KAR[L.fh2]!=null?FH_KAR[L.fh2]:L.fh2,eye:L.eye,mood:L.mood,mouth:L.mouth,
    glasses:L.bril||null,sun:O.zon?'#0b0b0d':null,band:null,
    top:{kind:tk,c:O.jas&&k==='overhemd'?O.jas:(O.c||'#30353e'),c2},legs:{kind:O.b==='track'?'track':O.b==='jeans'?'jeans':'pants',c:O.bc||'#1d2531',c2:O.b2||null},
    shoes:{kind:O.s==='laars'?'boot':'sneaker',c:O.sc||'#3a3f48',c2:O.s2||shade(O.sc||'#3a3f48',.7),sole},head:{kind:hk,c:hc,c2:shade(hc,.7)},
    nek,pols:O.wt?{band:O.wt,face:'#e8e4da'}:null,gloves:O.gl||null}}
// K.face-portret
const COLK={hoodie:'hoodie',bezorger:'leer',jack:'leer',tee:'shirt',polo:'shirt',track:'track',suit:'pak',tux:'pak',blazer:'blouse',overhemd:'blouse',trui:'trui',vest:'trui',blouse:'blouse',
  scrubs:'blouse',schort:'schort',coat:'leer',leer:'leer',bomber:'leer',uniform:'uniform',werk:'werk',sweat:'trui',jurk:'blouse'};
function toFace(L){const O=L.o||{},k=O.k||'tee';let col=COLK[k]||'shirt',tie=null;if(k==='suit'){if(O.tie)tie=O.tie;else col='blouse'}if(k==='tux')tie='#101012';
  const hat=O.hood==='up'?'hood':({cap:'cap',beanie:'beanie',pet:'pet',mask:'mask',hat:'hat'}[O.hat]||'none');
  return {_u:1,_id:L._id,skin:L.skin,hair:L.hair,hs:L.hs,fh:L.fh,eye:L.eye,mouth:L.mouth,mood:L.mood,fw:L.fw,jaw:L.jaw,v:L.v,lip:L.lip,age:L.age,
    top:O.jas&&k==='overhemd'?O.jas:(O.c||'#30353e'),col,tie,hat,hatC:O.hatC||'#2a2c30',chain:O.ch?1:0,w:clamp(L.w||1,.9,1.15),
    acc:{bril:L.bril?(L.bril==='#c9a227'||L.bril==='#8a6a2a'?2:1):0,zon:O.zon?1:0,oor:L.oor||0},rimpel:L.rimpel,wallen:L.wallen,grey:L.grey}}
// platte look (instanced voetgangers G.actors + portret in één)
function toFlat(L){const F=toFace(L),O=L.o||{},short=['tee','polo','scrubs'].includes(O.k);
  return Object.assign(F,{arm:short?L.skin:F.top,pants:O.b==='bloot'?L.skin:(O.bc||'#1d2531'),shoe:O.sc||'#3a3f48',long:['lang','bob'].includes(L.hs2)?1:0,h:L.h,w:L.w})}

/* =================== voxels: blokjes per lichaamsdeel samenvoegen =================== */
const UB=(()=>{const g=new TH.BoxGeometry(1,1,1).toNonIndexed();const r={p:Array.from(g.attributes.position.array),n:Array.from(g.attributes.normal.array)};g.dispose();return r})();
let MATL=null,MATB=null;const mats=()=>{if(!MATL){MATL=new TH.MeshLambertMaterial({vertexColors:true});MATB=new TH.MeshBasicMaterial({vertexColors:true})}};
const CC={};const lin=h=>CC[h]||(CC[h]=(()=>{const c=new TH.Color(isHex(h)?h:'#ff00ff');return [c.r,c.g,c.b]})());
function Vox(){const A={p:[],n:[],c:[]},B={p:[],n:[],c:[]};
  function put(T,w,h,d,x,y,z,col,rz,rx,mask){const c=lin(col),p=UB.p,n=UB.n,cz=rz?cos(rz):1,sz=rz?sin(rz):0,cx=rx?cos(rx):1,sx=rx?sin(rx):0;
    for(let i=0;i<p.length;i+=3){if(mask!=null&&!(mask>>((i/18)|0)&1))continue;let X=p[i]*w,Y=p[i+1]*h,Z=p[i+2]*d,NX=n[i],NY=n[i+1],NZ=n[i+2];
      if(rz){const a=X*cz-Y*sz,b=X*sz+Y*cz;X=a;Y=b;const na=NX*cz-NY*sz,nb=NX*sz+NY*cz;NX=na;NY=nb}
      if(rx){const a=Y*cx-Z*sx,b=Y*sx+Z*cx;Y=a;Z=b;const na=NY*cx-NZ*sx,nb=NY*sx+NZ*cx;NY=na;NZ=nb}
      T.p.push(X+x,Y+y,Z+z);T.n.push(NX,NY,NZ);T.c.push(c[0],c[1],c[2])}}
  return {b:(w,h,d,x,y,z,col,rz,rx)=>put(A,w,h,d,x,y,z,col,rz,rx),bm:(w,h,d,x,y,z,col,mask)=>put(A,w,h,d,x,y,z,col,0,0,mask),gl:(w,h,d,x,y,z,col,rz,rx)=>put(B,w,h,d,x,y,z,col,rz,rx),
    into(par,o){mats();const mk=(T,m,sh)=>{if(!T.p.length)return null;const g=new TH.BufferGeometry();g.setAttribute('position',new TH.Float32BufferAttribute(T.p,3));g.setAttribute('normal',new TH.Float32BufferAttribute(T.n,3));g.setAttribute('color',new TH.Float32BufferAttribute(T.c,3));
        g.computeBoundingSphere();const me=new TH.Mesh(g,m);me.castShadow=sh;me.receiveShadow=false;me.userData.ul=1;par.add(me);return me};
      const a=mk(A,MATL,!(o&&o.noShadow));mk(B,MATB,false);return a}}}
function grp(par,x,y,z){const g=new TH.Group();g.position.set(x||0,y||0,z||0);par.add(g);return g}

/* =================== het gedetailleerde cutscène-poppetje =================== */
// zelfde skelet als stad-avatar (root, legL/R, torso, armL/R, head, hand, eyeL/R …), zodat stad-cut.js het gewoon kan bewegen
const F=.18;   // voorkant van de romp
function been(V,L,O,sg){const b=O.b||'jeans',c=O.bc||'#1d2531',cD=shade(c,.8),cL=shade(c,1.18),bare=b==='bloot',pc=bare?L.skin:c;
  V.b(.25,.44,.29,0,-.22,0,pc);V.b(.235,.36,.275,0,-.6,0,pc);
  if(!bare){V.b(.2,.012,.012,0,-.44,.141,cD);
    if(b==='jeans'){V.b(.012,.76,.012,.126*sg,-.42,.03,cL);V.b(.236,.012,.278,0,-.77,0,cL)}
    else if(b==='track'){const s2=O.b2||'#e8e4da';V.b(.014,.78,.03,.127*sg,-.4,-.025,s2);V.b(.014,.78,.03,.127*sg,-.4,.025,s2)}
    else if(b==='jogger'||b==='scrub'){if(b==='jogger'){V.b(.25,.07,.29,0,-.745,0,cD);V.b(.255,.04,.295,0,-.69,0,c)}V.b(.07,.1,.012,.06*sg,-.28,.146,cD)}
    else if(b==='pantalon'||b==='chino'){V.b(.012,.78,.008,0,-.42,.14,cL)}
    else if(b==='werk'){V.b(.11,.13,.03,.11*sg,-.36,.0,cD);V.b(.236,.04,.278,0,-.52,0,cD)}}
  // schoenen
  const s=O.s||'sneaker',sc=O.sc||'#3a3f48',s2=O.s2||shade(sc,.7);
  if(s==='sneaker'){const sole=O.sole||(sc==='#e8e4da'||sc==='#f4f1ea'||sc==='#f1efe9'?'#d8d2c6':'#ece8e0'),lace=mix(sc,'#ffffff',.5);
    V.b(.28,.12,.4,0,-.74,.05,sc);V.b(.27,.06,.08,0,-.775,.25,shade(sc,1.04));V.b(.3,.05,.44,0,-.815,.05,sole);V.b(.302,.012,.442,0,-.836,.05,shade(sole,.72));
    for(let k=0;k<3;k++)V.b(.13,.014,.022,0,-.672,.11+k*.045,lace);V.b(.012,.045,.2,.142*sg,-.745,.07,s2);V.b(.1,.06,.022,0,-.695,-.155,s2)}
  else if(s==='nette'){V.b(.26,.1,.38,0,-.765,.04,sc);V.b(.2,.07,.07,0,-.78,.26,sc);V.b(.27,.03,.44,0,-.825,.06,'#1a1410');V.gl(.05,.01,.05,-.04*sg,-.714,.21,shade(sc,2.4))}
  else if(s==='laars'){V.b(.28,.26,.3,0,-.64,0,sc);V.b(.28,.12,.42,0,-.75,.06,sc);V.b(.29,.05,.44,0,-.82,.06,'#1a1410');V.b(.284,.02,.304,0,-.52,0,shade(sc,.78));V.b(.06,.012,.012,0,-.6,.152,shade(sc,1.3))}
  else{V.b(.22,.07,.34,0,-.785,.05,L.skin);V.b(.27,.035,.4,0,-.828,.05,sc);V.b(.25,.035,.07,0,-.775,.13,sc)}}
function romp(V,L,O){const k=O.k||'tee',c=O.c||'#30353e',cD=shade(c,.78),cL=shade(c,1.16),c3=O.c3||'#f1efe9',sk=L.skin,skD=shade(sk,.86),zip='#cfd2d6';
  const collarRing=(col)=>{V.b(.15,.1,.05,-.1,.765,.13,col);V.b(.15,.1,.05,.1,.765,.13,col);V.b(.42,.1,.06,0,.765,-.15,col);V.b(.05,.1,.28,-.2,.765,0,col);V.b(.05,.1,.28,.2,.765,0,col)};
  const vNeck=()=>{V.b(.14,.04,.02,0,.7,F,skD);V.b(.09,.04,.02,0,.665,F,skD);V.b(.04,.03,.02,0,.635,F,skD)};
  const shirtV=(col)=>{V.b(.16,.06,.012,0,.69,F+.004,col);V.b(.13,.08,.012,0,.63,F+.004,col);V.b(.09,.08,.012,0,.56,F+.004,col);V.b(.05,.07,.012,0,.49,F+.004,col)};
  const knoppen=(n,x,col,y0,dy)=>{for(let i=0;i<n;i++)V.b(.022,.022,.016,x,y0-i*dy,F+.01,col)};
  const top=k==='overhemd'&&O.jas?O.jas:c;
  // basis: smalle taille, bredere borst, schouders
  V.b(.56,.32,.33,0,.16,0,c);V.b(.62,.42,.36,0,.51,0,c);V.b(.52,.04,.32,0,.735,0,c);
  V.b(.09,.012,.01,-.2,.31,F+.004,cD,.45);V.b(.09,.012,.01,.2,.31,F+.004,cD,-.45);V.b(.07,.01,.01,-.24,.62,F+.004,cD,-.6);V.b(.07,.01,.01,.24,.62,F+.004,cD,.6);
  switch(k){
  case 'hoodie':case 'sweat':{V.b(.58,.07,.345,0,.035,0,cD);for(let x=-.26;x<.27;x+=.045)V.b(.01,.07,.35,x,.035,0,shade(c,.66));
    if(k==='hoodie'){V.b(.34,.15,.012,0,.19,F+.006,shade(c,.92));V.b(.34,.012,.014,0,.265,F+.008,cD);V.b(.012,.13,.014,-.17,.19,F+.008,cD);V.b(.012,.13,.014,.17,.19,F+.008,cD);
      if(O.hood!=='up'){V.b(.46,.13,.15,0,.73,-.17,c);V.b(.38,.11,.1,0,.63,-.255,cD);V.b(.08,.09,.12,-.17,.755,.05,c);V.b(.08,.09,.12,.17,.755,.05,c)}
      else{V.b(.18,.08,.06,0,.75,-.2,cD)}
      V.b(.016,.15,.016,-.055,.62,F+.01,'#e8e4da');V.b(.016,.15,.016,.055,.62,F+.01,'#e8e4da');V.b(.022,.03,.02,-.055,.535,F+.01,'#b8b4aa');V.b(.022,.03,.02,.055,.535,F+.01,'#b8b4aa');
}
    else{V.b(.22,.05,.2,0,.73,.02,cD)}break}
  case 'bezorger':case 'jack':{V.b(.6,.05,.35,0,.025,0,cD);collarRing(c);V.b(.018,.74,.012,0,.37,F+.006,zip);V.b(.03,.045,.016,0,.66,F+.012,'#a8acb2');
    V.b(.11,.014,.012,-.19,.2,F+.006,cD,.5);V.b(.11,.014,.012,.19,.2,F+.006,cD,-.5);
    if(k==='bezorger'){const c3h=O.c3||'#7d8088';V.b(.36,.12,.12,0,.74,-.24,c3h);V.b(.3,.1,.08,0,.65,-.29,shade(c3h,.85));V.b(.625,.035,.365,0,.32,0,'#d4d8dc');
      V.b(.13,.085,.012,-.16,.56,F+.006,'#f4f1ea');V.b(.045,.045,.014,-.16,.57,F+.008,c==='#c0261e'?'#c0261e':(O.c2||'#c0261e'));V.b(.04,.018,.014,-.2,.528,F+.008,'#2f8a3a');V.b(.04,.018,.014,-.12,.528,F+.008,'#c0261e');
      V.b(.36,.15,.012,0,.52,-F-.006,'#f4f1ea');V.b(.3,.026,.014,0,.55,-F-.008,c);V.b(.22,.026,.014,0,.5,-F-.008,c)}
    else V.b(.1,.06,.012,-.16,.56,F+.006,O.c2||cL);break}
  case 'track':{V.b(.6,.05,.35,0,.025,0,cD);collarRing(c);V.b(.018,.74,.012,0,.37,F+.006,zip);V.b(.03,.045,.016,0,.66,F+.012,'#a8acb2');V.b(.622,.016,.362,0,.6,0,O.c2||'#e8e4da');V.b(.045,.04,.012,-.15,.53,F+.008,O.c2||'#e8e4da');break}
  case 'tee':{V.b(.2,.045,.02,0,.705,F,skD);V.b(.24,.02,.022,0,.727,F,cD);V.b(.6,.02,.35,0,.012,0,cD);if(O.c2){V.b(.18,.11,.012,0,.49,F+.006,O.c2);V.b(.1,.03,.014,0,.49,F+.008,shade(O.c2,.7))}break}
  case 'polo':{V.b(.1,.04,.012,-.07,.715,F+.01,cL,-.4);V.b(.1,.04,.012,.07,.715,F+.01,cL,.4);V.b(.05,.15,.012,0,.64,F+.006,cL);knoppen(2,0,'#f1efe9',.68,.06);break}
  case 'scrubs':{vNeck();V.b(.02,.12,.014,-.06,.66,F+.006,cD,.45);V.b(.02,.12,.014,.06,.66,F+.006,cD,-.45);V.b(.12,.1,.012,-.15,.5,F+.006,shade(c,.94));V.b(.12,.012,.014,-.15,.55,F+.008,cD);
    V.b(.015,.07,.016,-.12,.57,F+.012,'#2f4ea8');V.b(.015,.02,.016,-.12,.605,F+.012,'#e8e4da');V.b(.07,.035,.012,.15,.56,F+.006,'#f4f1ea');V.b(.05,.008,.014,.15,.565,F+.008,'#3a6aa8');V.b(.6,.02,.35,0,.012,0,cD);break}
  case 'suit':case 'tux':case 'blazer':{const lp=k==='tux'?'#2c2c34':shade(c,.86),dk=k==='tux'?'#060608':shade(c,.72);
    V.b(.62,.13,.37,0,-.04,0,c);shirtV(c3);
    if(O.tie){V.b(.05,.045,.022,0,.69,F+.012,O.tie);V.b(.055,.2,.016,0,.56,F+.012,O.tie);V.b(.04,.04,.016,0,.445,F+.012,shade(O.tie,.85));V.b(.056,.01,.018,0,.6,F+.016,shade(O.tie,1.35),.5);V.b(.056,.01,.018,0,.52,F+.016,shade(O.tie,1.35),.5)}
    else if(O.bow){V.b(.05,.04,.02,-.03,.69,F+.012,O.bow);V.b(.05,.04,.02,.03,.69,F+.012,O.bow);V.b(.02,.025,.024,0,.69,F+.014,shade(O.bow,1.6))}
    else{V.b(.05,.04,.014,-.06,.715,F+.01,c3,.5);V.b(.05,.04,.014,.06,.715,F+.01,c3,-.5)}
    V.b(.075,.3,.016,-.105,.56,F+.014,lp,-.3);V.b(.075,.3,.016,.105,.56,F+.014,lp,.3);V.b(.42,.08,.06,0,.765,-.15,c);
    V.b(.012,.42,.014,.0,.2,F+.006,dk);knoppen(2,.028,dk,.32,.11);V.b(.12,.02,.014,-.17,.14,F+.006,dk);V.b(.12,.02,.014,.17,.14,F+.006,dk);V.b(.09,.015,.012,-.16,.58,F+.006,dk);
    if(O.pochet)V.b(.06,.035,.016,-.16,.6,F+.012,O.pochet);
    if(O.krijt)for(let x=-.27;x<.28;x+=.055)if(abs(x)>.09){V.b(.006,.72,.004,x,.36,F+.002,shade(c,1.45))}
    break}
  case 'overhemd':case 'blouse':{const sh=k==='overhemd'?c:c;
    if(O.jas){V.b(.2,.72,.364,-.21,.36,0,O.jas);V.b(.2,.72,.364,.21,.36,0,O.jas);V.b(.06,.2,.016,-.12,.62,F+.012,shade(O.jas,.85),-.25);V.b(.06,.2,.016,.12,.62,F+.012,shade(O.jas,.85),.25)}
    V.b(.07,.04,.014,-.07,.715,F+.01,shade(sh,1.08),-.5);V.b(.07,.04,.014,.07,.715,F+.01,shade(sh,1.08),.5);V.b(.1,.05,.02,0,.7,F,skD);
    V.b(.012,.62,.014,0,.36,F+.006,shade(sh,.85));knoppen(5,.0,shade(sh,.75),.62,.11);if(!O.jas)V.b(.1,.09,.012,-.15,.54,F+.006,shade(sh,.93));
    if(k==='overhemd'){V.b(.58,.04,.345,0,.02,0,'#2a1a12');V.b(.05,.04,.016,0,.02,F+.01,'#c9a227')}break}
  case 'trui':{V.b(.22,.05,.22,0,.735,0,cD);V.b(.6,.06,.35,0,.03,0,cD);for(let x=-.26;x<.27;x+=.045)V.b(.01,.06,.355,x,.03,0,shade(c,.66));
    for(let y=.14;y<.66;y+=.065){V.b(.03,.03,.01,-.1,y,F+.004,cL,.6);V.b(.03,.03,.01,.1,y,F+.004,cL,-.6)}
    if(O.c3){V.b(.05,.035,.012,-.05,.765,.1,O.c3,-.4);V.b(.05,.035,.012,.05,.765,.1,O.c3,.4)}break}
  case 'vest':{V.b(.14,.7,.012,0,.36,F+.004,O.c3||'#e8e4da');V.b(.012,.6,.014,-.075,.36,F+.008,cD);V.b(.012,.6,.014,.075,.36,F+.008,cD);knoppen(4,.088,shade(c,.6),.55,.13);
    V.b(.1,.05,.014,0,.7,F+.006,skD);V.b(.12,.1,.012,-.17,.18,F+.006,shade(c,.92));V.b(.12,.1,.012,.17,.18,F+.006,shade(c,.92));V.b(.6,.05,.35,0,.025,0,cD);break}
  case 'schort':{V.b(.2,.05,.02,0,.705,F,skD);const ap='#f4f1ea';V.b(.46,.6,.012,0,.36,F+.008,ap);V.b(.03,.12,.012,-.13,.71,F+.008,ap);V.b(.03,.12,.012,.13,.71,F+.008,ap);
    V.b(.62,.02,.364,0,.3,0,'#e8e4da');V.b(.46,.36,.012,0,-.17,F+.02,ap);V.b(.46,.012,.014,0,-.35,F+.022,'#dcd8cc');
    V.b(.03,.02,.014,-.1,.42,F+.012,'#e0d8c4');V.b(.02,.02,.014,.12,.24,F+.012,'#b8332a');V.b(.025,.015,.014,.05,-.1,F+.026,'#d8d0bc');if(O.c2)V.b(.6,.03,.35,0,.705,0,O.c2);break}
  case 'coat':{const len=.36;V.b(.29,len,.04,-.155,-len/2,.165,c);V.b(.29,len,.04,.155,-len/2,.165,c);V.b(.62,len,.04,0,-len/2,-.165,c);V.b(.04,len,.3,-.3,-len/2,0,c);V.b(.04,len,.3,.3,-len/2,0,c);
    V.b(.14,.32,.012,0,.58,F+.004,O.c3||'#e8e4da');
    if(O.col)V.b(.22,.08,.22,0,.75,0,O.c3||'#2a2c30');
    if(O.tie){V.b(.05,.04,.02,0,.69,F+.012,O.tie);V.b(.05,.2,.016,0,.56,F+.012,O.tie)}
    V.b(.075,.3,.016,-.105,.58,F+.014,cL,-.3);V.b(.075,.3,.016,.105,.58,F+.014,cL,.3);V.b(.44,.1,.06,0,.765,-.15,c);
    V.b(.012,.44+len,.014,0,.22-len/2,F+.006,cD);
    if(O.dubbel){knoppen(3,-.07,'#c9cfd6',.38,.13);knoppen(3,.07,'#c9cfd6',.38,.13)}else knoppen(3,.03,cD,.38,.13);
    if(O.riem){V.b(.62,.045,.37,0,.18,0,O.c2||cD);V.b(.05,.045,.02,0,.18,F+.012,'#c9a227')}
    V.b(.12,.018,.014,-.17,-.06,.19,cD);V.b(.12,.018,.014,.17,-.06,.19,cD);break}
  case 'leer':{V.b(.6,.06,.35,0,.03,0,cD);V.b(.14,.18,.012,0,.64,F+.004,O.c3||'#2a2c30');
    V.b(.016,.34,.012,.08,.2,F+.006,'#c9cfd6');V.b(.016,.26,.012,.045,.5,F+.006,'#c9cfd6',.3);
    V.b(.12,.18,.016,-.13,.63,F+.012,cL,-.25);V.b(.12,.18,.016,.13,.63,F+.012,cL,.25);V.b(.44,.1,.06,0,.765,-.15,c);
    V.b(.18,.012,.01,-.18,.7,F+.008,shade(c,1.9));V.b(.1,.012,.012,-.18,.24,F+.006,'#9aa1ab',.4);V.b(.1,.012,.012,.18,.24,F+.006,'#9aa1ab',-.4);break}
  case 'bomber':{const rib=O.c2||cD;V.b(.42,.07,.32,0,.75,0,rib);V.b(.6,.07,.35,0,.035,0,rib);for(let x=-.26;x<.27;x+=.045)V.b(.01,.07,.355,x,.035,0,shade(rib,.75));
    V.b(.018,.66,.012,0,.4,F+.006,'#9aa1ab');V.b(.1,.012,.012,-.18,.24,F+.006,cD,.4);V.b(.1,.012,.012,.18,.24,F+.006,cD,-.4);V.b(.62,.01,.362,0,.46,0,cD);break}
  case 'uniform':{V.b(.6,.05,.35,0,.05,0,'#121316');V.b(.05,.04,.016,0,.05,F+.01,'#c9cfd6');V.b(.08,.16,.1,.31,-.0,.06,'#121316');
    V.b(.07,.04,.014,-.07,.715,F+.01,cL,-.5);V.b(.07,.04,.014,.07,.715,F+.01,cL,.5);V.b(.1,.05,.02,0,.7,F,skD);V.b(.012,.6,.014,0,.38,F+.006,cD);
    V.b(.05,.06,.014,-.16,.55,F+.008,'#c9a227');V.b(.08,.02,.012,.16,.56,F+.006,'#e8e4da');V.b(.1,.02,.2,-.25,.745,0,'#121316');V.b(.1,.02,.2,.25,.745,0,'#121316');
    V.b(.06,.1,.04,.15,.62,F+.02,'#16171b');V.b(.625,.03,.365,0,.42,0,'#c9cfd6');break}
  case 'werk':{collarRing(c);V.b(.018,.74,.012,0,.37,F+.006,zip);V.b(.625,.035,.365,0,.3,0,'#d4d8dc');V.b(.625,.035,.365,0,.5,0,'#d4d8dc');V.b(.6,.05,.35,0,.025,0,cD);break}
  case 'jurk':{V.b(.66,.5,.42,0,-.2,0,c);V.b(.7,.12,.46,0,-.4,0,c);V.b(.22,.08,.02,0,.69,F,skD);V.b(.57,.03,.335,0,.3,0,shade(c,.8));V.b(.01,.4,.43,.15,-.18,0,cD);break}
  default:V.b(.6,.03,.35,0,.015,0,cD)}
  if(O.b==='rok')V.b(.6,.4,.4,0,-.18,0,O.bc||'#5a5a62');
  if((O.b==='jeans'||O.b==='chino'||O.b==='pantalon')&&['tee','polo','uniform'].includes(k)){V.b(.58,.045,.345,0,.022,0,'#2a1a12');V.b(.05,.04,.016,0,.022,F+.01,'#c9a227')}
  if(O.ch){const cc=O.ch==='goud'?['#e8b923','#ffd35a']:O.ch==='zilver'?['#b8bec6','#e2e6ea']:['#f4f1ea','#d8d0c4'];
    for(let i=0;i<9;i++){const t=(i-4)/4;V.b(.032,.024,.016,t*.13,.6+t*t*.07,F+.018,cc[i%2])}if(O.ch==='goud')V.b(.035,.045,.016,0,.565,F+.02,cc[1])}
  if(O.tas){V.b(.4,.44,.15,0,.42,-.26,O.tas);V.b(.34,.1,.03,0,.3,-.345,shade(O.tas,.8));V.b(.035,.26,.016,-.17,.57,F+.01,shade(O.tas,1.1));V.b(.035,.26,.016,.17,.57,F+.01,shade(O.tas,1.1))}}
function arm(V,L,O,sg){const k=O.k||'tee',c=k==='overhemd'&&O.jas?O.jas:(O.c||'#30353e'),cD=shade(c,.78),sk=L.skin,short=k==='tee'||k==='polo'||k==='scrubs',bare=k==='jurk';
  if(bare){V.b(.17,.62,.2,0,-.33,0,sk)}
  else if(short){V.b(.21,.22,.25,0,-.11,0,c);V.b(.215,.022,.255,0,-.21,0,cD);V.b(.17,.42,.2,0,-.43,0,sk)}
  else{V.b(.2,.36,.24,0,-.17,0,c);V.b(.19,.3,.23,0,-.49,0,c);V.b(.17,.012,.012,0,-.35,.12,cD);V.b(.012,.05,.012,.1*sg,-.42,.04,cD,.5);
    if(['hoodie','sweat','bomber','track','trui'].includes(k))V.b(.2,.05,.24,0,-.63,0,k==='bomber'&&O.c2?O.c2:cD);
    if(['suit','tux','blazer','coat'].includes(k))V.b(.192,.03,.232,0,-.656,0,O.c3&&k!=='coat'?O.c3:'#f1efe9');
    if(k==='track'){const s2=O.c2||'#e8e4da';V.b(.014,.62,.035,.1*sg,-.33,-.024,s2);V.b(.014,.62,.035,.1*sg,-.33,.024,s2)}
    if(k==='bezorger'||k==='werk'||k==='uniform')V.b(.205,.035,.245,0,-.24,0,'#d4d8dc');
    if(k==='leer')V.b(.012,.4,.012,.1*sg,-.38,.06,shade(c,1.9));
    if(k==='bomber'&&sg<0)V.b(.012,.1,.1,.1*sg,-.16,0,cD)}
  const hc=O.gl||sk,hD=shade(hc,.84);
  V.b(.16,.1,.19,0,-.705,0,hc);V.b(.165,.012,.17,0,-.752,.005,hD);
  [[-.066,.075],[-.022,.088],[.022,.085],[.064,.07]].forEach(f=>V.b(.036,f[1],.038,.012*sg,-.755-f[1]/2,f[0],hc));
  V.b(.045,.075,.045,-.07*sg,-.705,.085,hc);
  if(O.gl)V.b(.18,.04,.21,0,-.648,0,shade(hc,.75));
  if(O.wt&&sg<0){V.b(.2,.035,.235,0,-.635,0,O.wt);V.b(.014,.055,.07,.106*sg,-.635,0,shade(O.wt,1.2));V.b(.016,.04,.05,.108*sg,-.635,0,'#e8e4da')}}
// het haar als veld van blokjes rond het hoofd (per kapsel een vorm); alleen de buitenste laag wordt gebouwd
const NB=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const HSD={kort:{t:.05,s:.028,b:.035,hl:.4,lo:.3,bl:.17,n:.012},krul:{t:.13,s:.09,b:.11,hl:.405,lo:.16,bl:.0,n:.06,fr:1},krulkort:{t:.085,s:.05,b:.065,hl:.405,lo:.24,bl:.1,n:.04,fr:1},
  kuif:{t:.04,s:.014,b:.024,hl:.41,lo:.28,bl:.16,n:.01,kuif:1,fade:1},zij:{t:.05,s:.03,b:.035,hl:.4,lo:.29,bl:.15,n:.01,zij:1},opgeschoren:{t:.028,s:.012,b:.014,hl:.42,lo:.25,bl:.08,n:.004,fade:1},
  achterover:{t:.05,s:.022,b:.045,hl:.44,lo:.28,bl:.04,n:.006,glans:1},lang:{t:.05,s:.05,b:.06,hl:.39,lo:-.3,bl:-.38,n:.015,lang:1},bob:{t:.055,s:.055,b:.06,hl:.36,lo:.04,bl:.04,n:.01,lang:1},
  staart:{t:.03,s:.022,b:.03,hl:.41,lo:.28,bl:.1,n:.005,staart:1},knot:{t:.03,s:.022,b:.03,hl:.41,lo:.28,bl:.1,n:.005,knot:1},kalend:{t:0,s:.03,b:.035,hl:.9,lo:.2,bl:.05,n:.01,kaal:.36},
  inham:{t:.045,s:.026,b:.033,hl:.43,lo:.29,bl:.15,n:.01,inham:1},permanent:{t:.07,s:.06,b:.065,hl:.38,lo:.22,bl:.1,n:.035,fr:1},afro:{t:.2,s:.17,b:.18,hl:.36,lo:.12,bl:.05,n:.03},
  hanenkam:{t:.11,s:.008,b:.01,hl:.42,lo:.25,bl:.1,n:.01,kam:1,fade:1}};
function haar(V,L,O,Y,W,seed){let st=L.hs2||'kort';if(st==='kaal'||st==='vlecht')st=st==='vlecht'?'lang':'kaal';const S=HSD[st];if(!S)return;
  const hat=O.hood==='up'?'hood':(O.hat||'none');if(hat==='mask')return;
  const hw=W/2,c=.036,x0=-.52,y0=-.42,z0=-.5,NX=29,NY=36,NZ=27;const grid=new Uint8Array(NX*NY*NZ),ix=(i,j,k)=>(k*NY+j)*NX+i;
  const noise=(x,y,z)=>{const q=.07;const a=Math.floor(x/q),b=Math.floor(y/q),d=Math.floor(z/q);return hsh(a,b,d,seed)};
  const cap={cap:.4,pet:.43,beanie:.36,hat:.46}[hat];
  const inHead=(x,y,z)=>abs(x)<hw&&y>0&&y<.5&&abs(z)<.24;
  const f=(x,y,z)=>{const ox=Math.max(abs(x)-hw,0),oy=Math.max(y-.5,0)+Math.max(-y,0),oz=Math.max(abs(z)-.24,0),d=Math.hypot(ox,oy,oz);if(d<=0)return false;
    let T=S.s;if(z<-.1)T=Math.max(T,S.b);if(y>.42)T=Math.max(T,S.kuif?.03+(abs(x)<.16?Math.max(0,z+.02)*.3*(1-abs(x)/.2):0):S.t);if(S.kam)T=abs(x)<.06&&y>.38?S.t:S.s;
    if(S.n)T+=(noise(x,y,z)-.5)*2*S.n;if(d>T)return false;
    const back=z<-.08;if(y<(back?S.bl:S.lo)){if(!(S.lang&&y>(back?S.bl:S.lo)))return false}
    if(z>.15&&abs(x)<hw+.02&&y<S.hl){if(!(S.fr&&y>S.hl-.07&&noise(x+.03,y,z)>.55))return false}
    if(z>.1&&abs(x)>=hw-.01&&y<.31&&!(S.lang&&z<.2)&&!(L.v&&S.lang))return false;
    if(S.inham&&z>.08&&abs(x)>.08&&y<.47+abs(x)*.1&&y>.3)return false;
    if(S.kaal&&y>S.kaal&&(z>-.14||y>.44))return false;
    if(S.zij&&y>.45&&abs(x+.09)<.02)return false;
    if(cap!=null&&y>cap)return false;
    if(hat==='hood')return S.fr&&z>.2&&y>.4&&y<.48&&abs(x)<.18;
    return true};
  for(let k=0;k<NZ;k++)for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const x=x0+(i+.5)*c,y=y0+(j+.5)*c,z=z0+(k+.5)*c;if(f(x,y,z))grid[ix(i,j,k)]=1}
  // paardenstaart en knot
  const blob=(cx,cy,cz,r)=>{for(let k=0;k<NZ;k++)for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const x=x0+(i+.5)*c,y=y0+(j+.5)*c,z=z0+(k+.5)*c;if(Math.hypot(x-cx,y-cy,z-cz)<r&&!inHead(x,y,z)&&(cap==null||y<cap))grid[ix(i,j,k)]=1}};
  if(S.staart&&hat!=='hood')for(let t=0;t<=1;t+=.1)blob(0,.44-.42*t,-.29-.06*sin(t*Math.PI*.5),.055-.02*t);
  if(S.knot&&hat==='none')blob(0,.56,-.14,.085);
  const col0=L.hairBase||L.hair,g=L.grey||0,sk=L.skin,HL=mix(col0,'#b08a64',.55);if(!L.hairT)L.hairT=g>0?mix(L.hair,'#e6e2dc',Math.min(.6,g*.8)):L.hair;
  for(let k=0;k<NZ;k++)for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){if(!grid[ix(i,j,k)])continue;
    const x=x0+(i+.5)*c,y=y0+(j+.5)*c,z=z0+(k+.5)*c;let mask=0;
    for(let q=0;q<6;q++){const N=NB[q],a=i+N[0],b=j+N[1],d=k+N[2];if(a<0||b<0||d<0||a>=NX||b>=NY||d>=NZ||(!grid[ix(a,b,d)]&&!inHead(x0+(a+.5)*c,y0+(b+.5)*c,z0+(d+.5)*c)))mask|=1<<q}
    if(!mask)continue;
    const r=hsh(i,j,k,seed),r2=hsh(k,i,j,seed+7);const temple=abs(x)>hw-.03&&y<.44;
    let col=g>0?(temple?L.hairT:L.hair):col0;if(g>0&&r2<g*.22)col=mix(col,'#ece8e2',.55);
    if(S.fade&&(abs(x)>hw-.01||z<-.2)&&y<.42)col=mix(sk,col,.55);
    if(S.kam&&abs(x)>.06)col=mix(sk,col,.5);
    let kk=.86+clamp((y-.2)/.35,0,1)*.2+(r-.5)*.1;const lok=noise(x+.11,y,z-.07);
    if(S.fr&&(r>.8||lok>.78)){col=mix(col,HL,.3);kk+=.1}if(S.glans&&y>.44&&r>.7)col=mix(col,HL,.35);if(y>.5&&r>.86)col=mix(col,HL,.22);if(lok<.18)kk*=.82;
    V.bm(c*1.02,c*1.02,c*1.02,x,Y+y,z,shade(col,kk),mask)}}
function baard(V,L,Y,W,jw,seed){const f=L.fh2||'';if(!f)return;const hc=L.hairBase||L.hair,g=L.grey||0,sk=L.skin,c=.025;
  const fz=y=>y<.07?.21:y<.13?.23:.24,hwy=y=>y<.07?jw/2:y<.13?W*.47:W/2;
  const flat=f==='stoppel'||f==='dons',th=f==='baard'?.04:f==='kortbaard'?.016:.018;
  const inB=(x,y)=>{const ax=abs(x);
    if(f==='dons')return y>.128&&y<.15&&ax<.07;
    if(f==='snor')return (y>.128&&y<.16&&ax<.085)||(ax>.06&&ax<.085&&y>.1&&y<.16);
    if(f==='sik')return (ax<.05&&y<.085)||(y>.128&&y<.155&&ax<.075);
    if(f==='ringbaard')return (ax<.075&&y<.085)||(y>.128&&y<.16&&ax<.085)||(ax>.06&&ax<.085&&y<.16);
    if(ax<.075&&y>.082&&y<.13)return false;if(ax<.045&&y>.13)return false;if(flat||f==='kortbaard')return y<.15+Math.max(0,ax-.12)*.4&&y<.2;return y<.16+Math.max(0,ax-.1)*.6&&y<.24};
  const bc=g>0?mix(hc,g>.6?'#e2ded8':'#a9a6a1',Math.min(1,g*1.3)):hc;
  const colAt=(i,j)=>{const r=hsh(i,j,3,seed);let col=bc;if(g>.35&&r<g*.25)col=mix(bc,'#ece8e2',.45);return flat?mix(sk,col,(f==='dons'?.16:.26)+r*.05):shade(col,.93+r*.12)};
  // voorkant
  for(let x=-W/2;x<W/2;x+=c)for(let y=(f==='baard'?-.04:0);y<.24;y+=c){const cx=x+c/2,cy=y+c/2;if(abs(cx)>hwy(Math.max(0,cy)))continue;if(!inB(cx,cy))continue;const i=Math.round(cx/c),j=Math.round(cy/c);
    const t=flat?.004:th*(f==='baard'?.6+hsh(i,j,5,seed)*.8:1);const z=fz(Math.max(0,cy));V.bm(c,c,t,cx,Y+cy,z+t/2,colAt(i,j),f==='baard'?31:16)}
  if(f==='snor'||f==='sik'||f==='dons')return;
  // zijkanten en onder de kaak
  for(const sg of [-1,1])for(let z=-.04;z<.22;z+=c)for(let y=0;y<.28;y+=c){const cz=z+c/2,cy=y+c/2;if(f==='ringbaard')continue;
    const lim=cz<.05?.3:(flat||f==='kortbaard'?.15:.2);if(cy>lim)continue;const hx2=hwy(cy);const i=Math.round(cz/c),j=Math.round(cy/c)+40*sg;const t=flat?.004:th*.8;V.bm(t,c,c,sg*(hx2+t/2),Y+cy,cz,colAt(i,j),f==='baard'?(sg>0?61:62):(sg>0?1:2))}
  if(f!=='ringbaard')for(let x=-jw/2;x<jw/2;x+=c)for(let z=0;z<.21;z+=c){const cx=x+c/2,cz=z+c/2,t=flat?.004:th;V.bm(c,t,c,cx,Y-t/2,cz,colAt(Math.round(cx/c),Math.round(cz/c)+90),f==='baard'?59:8)}
  if(f==='baard')for(let x=-jw/2+.02;x<jw/2-.02;x+=c)V.b(c,.05,.05,x+c/2,Y-.04,.19,colAt(Math.round(x/c),77))}
const MONDEN=['dicht','half','open','o','lach','boos','koel','bang'];
function hoofd(head,P,L,O,seed){const V=Vox(),sk=L.skin,skD=shade(sk,.88),skDD=shade(sk,.74),skL=shade(sk,1.05),Y=.06;
  const W=.5*(L.fw===16?.94:L.fw===20?1.04:1),jw={rond:.4,hoekig:.45,spits:.34}[L.jaw]||.4,hat=O.hood==='up'?'hood':(O.hat||'none'),mask=hat==='mask';
  // nek en schedel (smallere kaak, afgeronde kruin)
  V.b(.2,.1,.19,0,.03,0,skD);V.b(.21,.012,.2,0,.06,0,skDD);
  V.b(W,.36,.48,0,Y+.31,0,sk);V.b(W*.94,.07,.46,0,Y+.095,0,sk);V.b(jw,.07,.42,0,Y+.035,0,sk);V.b(W*.9,.03,.44,0,Y+.505,0,sk);V.b(jw*.5,.02,.012,0,Y+.025,.215,shade(sk,.95));
  if(L.v)[-1,1].forEach(s=>V.b(.05,.025,.006,.15*s,Y+.19,.243,mix(sk,'#e07a72',.28)));
  // oren
  [-1,1].forEach(s=>{V.b(.04,.11,.09,s*(W/2+.015),Y+.255,-.01,sk);V.b(.012,.06,.04,s*(W/2+.036),Y+.255,0,skDD);
    if(L.oor&&(L.oor===2||s<0))V.b(.02,.03,.02,s*(W/2+.03),Y+.19,0,'#e8b923');if(O.oortje&&s>0){V.b(.02,.04,.02,W/2+.04,Y+.25,.02,'#1a1a1a');V.b(.01,.2,.01,W/2+.035,Y+.12,-.04,'#e8e4da')}});
  // ogen: oogkas, wit, iris, pupil, glans, wimperlijn; leden voor de stemming
  const eyeOf=s=>{const o=grp(head,.105*s,Y+.272,.24),e=grp(o),W2=Vox(),ix=-.008*s;
    W2.b(.094,.046,.012,0,0,.006,'#e6e0d6');W2.b(.05,.048,.014,ix,0,.008,L.eye||'#3a2414');W2.b(.024,.03,.016,ix,0,.01,'#0d0d10');W2.gl(.012,.012,.017,ix+.012,.012,.011,'#ffffff');
    W2.b(.112,.014,.018,0,.03,.008,'#1a1210');if(L.v)W2.b(.022,.012,.018,.06*s,.037,.008,'#1a1210');W2.into(e,{noShadow:true});
    const lu=grp(o,0,.022,.016),lb=Vox();lb.b(.118,.032,.012,0,0,0,sk);lb.b(.118,.008,.014,0,-.016,.001,shade(sk,.7));lb.into(lu,{noShadow:true});lu.visible=false;
    const ll=grp(o,0,-.024,.016),lc=Vox();lc.b(.112,.022,.012,0,0,0,sk);lc.into(ll,{noShadow:true});ll.visible=false;return {e,lu,ll}};
  V.b(.13,.075,.008,-.105,Y+.268,.242,skD);V.b(.13,.075,.008,.105,Y+.268,.242,skD);V.b(.09,.008,.008,-.105,Y+.238,.244,skDD);V.b(.09,.008,.008,.105,Y+.238,.244,skDD);
  const EL=eyeOf(-1),ER=eyeOf(1);P.eyeL=EL.e;P.eyeR=ER.e;
  // wenkbrauwen (grijzen mee)
  const browC=L.grey>.45?mix(L.hairBase,'#c8c4bc',L.grey):(parseInt(String(L.hair).slice(1,3),16)>150?shade(L.hair,.62):shade(L.hair,.9));
  const brow=s=>{const b=grp(head,.105*s,Y+.338,.25),bv=Vox(),th=L.v?.02:.032;bv.b(.125,th,.022,0,0,0,browC);bv.b(.035,th+.008,.024,-.045*s,.002,0,browC);bv.b(.025,th*.7,.022,.07*s,-.008,0,browC);if(L.grey>.5&&!L.v)bv.b(.03,.012,.024,.05*s,.012,0,'#e6e2dc');bv.into(b,{noShadow:true});return b};
  const BL=brow(-1),BR=brow(1);
  // neus
  const nw=L.nose==='breed'?1.3:1,nl=L.nose==='lang'?1.2:1;
  V.b(.046,.1*nl,.03,0,Y+.215,.252,sk);V.b(.07*nw,.05,.045,0,Y+.165,.262,skL);V.b(.02,.035,.03,-.04*nw,Y+.152,.25,skD);V.b(.02,.035,.03,.04*nw,Y+.152,.25,skD);
  V.b(.018,.01,.01,-.019*nw,Y+.142,.283,'#3a2018');V.b(.018,.01,.01,.019*nw,Y+.142,.283,'#3a2018');V.b(.06,.012,.006,0,Y+.13,.243,skD);
  // leeftijd: voorhoofdsrimpels, kraaienpootjes, lachlijnen, wallen, vlekjes
  const r=L.rimpel|0,rc=shade(sk,.84);
  if(r>=1&&!mask){V.b(.2,.007,.006,0,Y+.43,.243,rc);[-1,1].forEach(s=>{V.b(.024,.006,.006,s*.172,Y+.285,.243,rc,s*.3);if(r>=2)V.b(.022,.006,.006,s*.17,Y+.265,.243,rc,-s*.3)})}
  if(r>=2&&!mask){V.b(.16,.007,.006,0,Y+.405,.243,rc);[-1,1].forEach(s=>V.b(.012,.07,.008,s*.062,Y+.128,.244,rc,s*.43))}
  if(r>=3&&!mask){V.b(.12,.007,.006,0,Y+.455,.243,rc);[-1,1].forEach(s=>{V.b(.06,.04,.006,s*.17,Y+.06,.215,shade(sk,.86));V.b(.08,.007,.006,s*.105,Y+.225,.244,rc)});V.b(.16,.008,.006,0,.04,.096,shade(sk,.78))}
  if(r>=4&&!mask)[[.13,.41],[-.16,.36],[.17,.17],[-.08,.44]].forEach(p=>V.b(.016,.016,.006,p[0],Y+p[1],.243,mix(sk,'#8a5a3a',.35)));
  if(L.wallen>=1&&!mask)[-1,1].forEach(s=>{V.b(.085,.018,.006,s*.105,Y+.232,.244,mix(shade(sk,.86),'#6a4a5a',.1));if(L.wallen>=2)V.b(.07,.006,.006,s*.105,Y+.222,.245,shade(sk,.74))});
  // mond: een vorm per stand (praten en stemming)
  const lipC=L.lip||mix(shade(sk,.78),'#a04a44',.38),lipD=shade(lipC,.8),dark='#2a0e0c',teeth='#ece8de',line=mix(dark,lipC,.35);
  const MV={dicht:v=>{v.b(.12,.016,.014,0,.012,0,lipD);v.b(.124,.008,.016,0,.001,0,line);v.b(.1,.02,.014,0,-.013,0,lipC);v.b(.07,.01,.01,0,-.031,-.002,shade(sk,.84))},
    half:v=>{v.b(.1,.028,.012,0,-.004,0,dark);v.b(.08,.012,.014,0,.006,.001,teeth);v.b(.12,.014,.016,0,.019,0,lipD);v.b(.1,.018,.016,0,-.026,0,lipC)},
    open:v=>{v.b(.1,.056,.012,0,-.012,0,dark);v.b(.084,.014,.014,0,.01,.001,teeth);v.b(.06,.02,.013,0,-.03,.001,'#a8443e');v.b(.12,.014,.016,0,.023,0,lipD);v.b(.1,.018,.016,0,-.047,0,lipC)},
    o:v=>{v.b(.05,.046,.012,0,-.006,0,dark);v.b(.064,.014,.016,0,.024,0,lipD);v.b(.06,.016,.016,0,-.036,0,lipC);v.b(.014,.044,.016,-.034,-.006,0,lipC);v.b(.014,.044,.016,.034,-.006,0,lipC)},
    lach:v=>{v.b(.13,.03,.012,0,-.002,0,dark);v.b(.11,.016,.014,0,.004,.001,teeth);v.b(.024,.02,.012,-.072,.014,0,dark);v.b(.024,.02,.012,.072,.014,0,dark);v.b(.12,.012,.016,0,.019,0,lipD);v.b(.1,.016,.016,0,-.024,0,lipC);
      v.b(.03,.026,.008,-.11,.03,-.002,shade(sk,1.04));v.b(.03,.026,.008,.11,.03,-.002,shade(sk,1.04))},
    boos:v=>{v.b(.11,.012,.014,0,0,0,line);v.b(.026,.016,.014,-.062,-.01,0,line,-.5);v.b(.026,.016,.014,.062,-.01,0,line,.5);v.b(.09,.016,.014,0,-.017,0,lipC);v.b(.11,.012,.012,0,.014,0,lipD)},
    koel:v=>{v.b(.11,.01,.014,-.006,0,0,line);v.b(.026,.016,.014,.06,.01,0,line,.5);v.b(.1,.014,.014,-.004,.013,0,lipD);v.b(.09,.016,.014,-.004,-.014,0,lipC)},
    bang:v=>{v.b(.07,.06,.012,0,-.012,0,dark);v.b(.06,.012,.014,0,.012,.001,teeth);v.b(.08,.014,.016,0,.024,0,lipD);v.b(.08,.016,.016,0,-.048,0,lipC)}};
  const mg=grp(head,0,Y+.112,.243),MS={};MONDEN.forEach(n=>{const g=grp(mg),v=Vox();MV[n](v);v.into(g,{noShadow:true});g.visible=n==='dicht';MS[n]=g});P.mouth=mg;
  // baard, haar
  if(!mask)baard(V,L,Y,W,jw,seed);
  haar(V,L,O,Y,W,seed);
  // bril, zonnebril
  if(O.zon&&!mask){[-1,1].forEach(s=>{V.b(.13,.066,.014,s*.105,Y+.272,.262,'#0c0d10');V.gl(.034,.014,.004,s*.105-.03,Y+.29,.27,'#56667a');V.b(.012,.012,.27,s*(W/2+.006),Y+.29,.12,'#0c0d10')});V.b(.05,.014,.016,0,Y+.29,.262,'#0c0d10')}
  else if(L.bril&&!mask){const f=L.bril;[-1,1].forEach(s=>{const x=.105*s;V.b(.135,.014,.016,x,Y+.31,.262,f);V.b(.135,.012,.016,x,Y+.235,.262,f);V.b(.012,.085,.016,x-.067,Y+.272,.262,f);V.b(.012,.085,.016,x+.067,Y+.272,.262,f);
    V.gl(.03,.01,.004,x+.03,Y+.29,.258,'#c8d8e8');V.b(.012,.012,.27,s*(W/2+.006),Y+.29,.12,f)});V.b(.05,.012,.016,0,Y+.29,.262,f)}
  // hoofddeksels
  const hc=O.hatC||'#2a2c30',hD=shade(hc,.72);
  if(hat==='cap'){V.b(W+.04,.15,.52,0,Y+.56,0,hc);V.b(W,.04,.48,0,Y+.645,0,hc);V.b(.04,.03,.04,0,Y+.675,0,hD);V.b(.008,.15,.53,-.09,Y+.56,0,hD);V.b(.008,.15,.53,.09,Y+.56,0,hD);
    if(O.capAchter){V.b(.46,.03,.22,0,Y+.5,-.33,hD);V.b(.14,.04,.012,0,Y+.5,.266,hD)}else{V.b(.46,.03,.24,0,Y+.5,.34,hD);V.b(.08,.05,.012,0,Y+.57,.268,O.c2||'#e8e4da')}}
  else if(hat==='beanie'){V.b(W+.04,.22,.52,0,Y+.6,0,hc);V.b(W+.06,.08,.54,0,Y+.5,0,hD);for(let x=-W/2;x<=W/2+.001;x+=.05)V.b(.01,.075,.545,x,Y+.5,0,shade(hc,.6));V.b(W-.04,.04,.44,0,Y+.72,0,hc)}
  else if(hat==='pet'){V.b(W+.06,.12,.54,0,Y+.585,0,hc);V.b(W+.03,.06,.51,0,Y+.505,0,'#121316');V.b(.42,.025,.16,0,Y+.48,.3,'#0c0c0e');V.gl(.2,.008,.04,0,Y+.494,.33,'#3a3c44');V.b(.05,.05,.014,0,Y+.56,.275,'#c9a227');V.b(W+.1,.02,.58,0,Y+.65,0,shade(hc,1.1))}
  else if(hat==='hat'){V.b(.78,.03,.74,0,Y+.5,0,hc);V.b(.5,.2,.48,0,Y+.62,0,hc);V.b(.51,.05,.49,0,Y+.545,0,hD)}
  else if(hat==='mask'){V.b(W+.03,.53,.5,0,Y+.26,-.005,hc);V.b(W+.03,.21,.02,0,Y+.105,.252,hc);V.b(W+.03,.15,.02,0,Y+.445,.252,hc);[-1,1].forEach(s=>V.b(.05,.15,.02,s*(W/2-.01),Y+.28,.252,hc));
    V.b(.03,.06,.02,0,Y+.25,.252,hc);V.b(.08,.08,.06,0,Y+.17,.27,hc);for(let x=-W/2+.03;x<W/2;x+=.05)V.b(.01,.2,.022,x,Y+.105,.253,hD);V.b(.13,.012,.02,0,Y+.33,.253,hD)}
  else if(hat==='hood'){const c=O.c||'#121316',cD=shade(c,.7);V.b(W+.1,.07,.56,0,Y+.565,-.02,c);[-1,1].forEach(s=>{V.b(.05,.52,.52,s*(W/2+.035),Y+.29,-.02,c);V.b(.04,.42,.05,s*(W/2+.03),Y+.32,.23,cD)});
    V.b(W+.1,.52,.06,0,Y+.29,-.285,c);V.b(W+.1,.05,.06,0,Y+.53,.24,cD);V.b(W+.02,.03,.02,0,Y+.505,.236,'#0c0c0e');V.b(.3,.06,.12,0,Y+.05,-.2,c)}
  V.into(head);
  P._ul={seed,BL,BR,EL,ER,MS,mood:null,mond:'dicht',L}}
function bouwCine(L,o){o=o||{};const O=L.o||{},g=new TH.Group(),P={};const seed=sid(L._id||L.skin+L.hair);
  const root=grp(g);const wk=o.w!=null?o.w:1;root.scale.set(1.18*wk,1.18,1.18*wk);P.root=root;
  ['L','R'].forEach((s,i)=>{const sg=i?1:-1,leg=grp(root,.15*sg,.84,0);P['leg'+s]=leg;const V=Vox();been(V,L,O,sg);V.into(leg)});
  const tor=grp(root,0,.84,0);P.torso=tor;{const V=Vox();romp(V,L,O);V.into(tor)}
  const bag=grp(tor);bag.visible=false;P.bag=bag;
  ['L','R'].forEach((s,i)=>{const sg=i?1:-1,a=grp(tor,.41*sg,.66,0);P['arm'+s]=a;const V=Vox();arm(V,L,O,sg);V.into(a)});
  const hand=grp(P.armR,0,-.78,.06);P.hand=hand;P.props={};P.line=new TH.Object3D();hand.add(P.line);
  const head=grp(tor,0,.72,0);P.head=head;hoofd(head,P,L,O,seed);
  g.userData.P=P;g.userData.ul=1;setMood(P,L.mood||'neutraal');return {g,P,cine:1}}
// stemming op het gezicht: wenkbrauwen, oogleden, mond
function setMood(P,m){const F=P&&P._ul;if(!F||F.mood===m)return;F.mood=m;const B=[F.BL,F.BR];
  B.forEach((b,i)=>{const s=i?1:-1;b.rotation.z=0;b.position.y=F.L?.06+.338:.398});
  const by=.398;F.EL.lu.visible=F.ER.lu.visible=false;F.EL.ll.visible=F.ER.ll.visible=false;F.EL.lu.rotation.z=F.ER.lu.rotation.z=0;F.EL.e.parent.scale.set(1,1,1);F.ER.e.parent.scale.set(1,1,1);
  if(m==='boos'){F.BL.rotation.z=-.32;F.BR.rotation.z=.32;F.BL.position.y=F.BR.position.y=by-.012;F.EL.lu.visible=F.ER.lu.visible=true;F.EL.lu.rotation.z=-.25;F.ER.lu.rotation.z=.25}
  else if(m==='bang'){F.BL.rotation.z=.25;F.BR.rotation.z=-.25;F.BL.position.y=F.BR.position.y=by+.022;F.EL.e.parent.scale.set(1,1.18,1);F.ER.e.parent.scale.set(1,1.18,1)}
  else if(m==='blij'){F.BL.position.y=F.BR.position.y=by+.012;F.EL.ll.visible=F.ER.ll.visible=true}
  else if(m==='koel'){F.BR.position.y=by+.014;F.BR.rotation.z=-.12;F.EL.lu.visible=F.ER.lu.visible=true}
  else{F.BL.position.y=F.BR.position.y=by}
  setMond(P,{blij:'lach',boos:'boos',koel:'koel',bang:'bang'}[m]||'dicht')}
function setMond(P,n){const F=P&&P._ul;if(!F||F.mond===n||!F.MS[n])return;F.MS[F.mond].visible=false;F.MS[n].visible=true;F.mond=n}

/* =================== looks naar het spel en naar stad-cut.js =================== */
// stad-avatar-spec terug naar een look (figuranten en eigen looks in cutscènes krijgen zo ook het gedetailleerde poppetje)
const KMAP={tee:'tee',suit:'suit',jacket:'jack',hoodie:'hoodie',track:'track',tracksuit:'track',dress:'jurk',thief:'hoodie',trui:'trui',sweat:'sweat'};
function specNaarLook(s){s=s||{};const t=s.top||{},l=s.legs||{},sh=s.shoes||{},h=s.head||{},nk=String(s.nek||''),hs=s.hs||'kort';
  const v=/lang|knot|bob|staart|vlecht/.test(hs)||s.mouth==='vol';
  const O={k:KMAP[t.kind]||'tee',c:t.c||'#30353e',c2:t.c2||null,c3:t.kind==='suit'?'#f1efe9':null,tie:t.kind==='suit'?t.c2:(/das/.test(nk)?'#8a1f2a':null),b:l.kind==='track'||l.kind==='tracksuit'?'track':l.kind==='jeans'?'jeans':'pantalon',bc:l.c||'#1d2531',b2:l.c2||null,
    s:sh.kind==='boot'?'laars':'sneaker',sc:sh.c||'#3a3f48',s2:sh.c2||null,sole:sh.sole||null,hat:{cap:'cap',beanie:'beanie',skimask:'mask',hat:'hat'}[h.kind]||'none',hatC:h.c||'#2a2c30',
    ch:/goud|gold/.test(nk)?'goud':/zilver|ketting|chain/.test(nk)?'zilver':null,gl:s.gloves||null,zon:s.sun?1:0,wt:s.pols&&s.pols.band||null};
  if(O.k==='jurk')O.b='bloot';if(t.kind==='thief'){O.c='#16171b';O.gl=O.gl||'#15171b'}
  return {_id:null,skin:s.skin||'#d9a27a',eye:s.eye||'#3a2414',hair:s.hair||'#2a1d14',hairBase:s.hair||'#2a1d14',grey:0,bald:0,hs2:hs,fh2:s.fh||'',hs,fh:s.fh||'',mood:s.mood||'neutraal',mouth:s.mouth||'normaal',
    fw:v?16:18,jaw:'rond',v:v?1:0,lip:null,bril:s.glasses||null,oor:0,age:0,rimpel:0,wallen:0,h:1,w:1,o:O}}
const KEYC={};
function keyOf(L){return L?JSON.stringify([L._id,L._age,L.hs2,L.fh2,L.grey,L.bald,L.mood,L.o]):''}

/* =================== portretten =================== */
// K.face (48×48) met leeftijd erbij: wallen, voorhoofdsrimpels, kraaienpootjes
function ageOverlay(cv,L,mood){if(!L||L.hat==='mask')return;const c=cv.getContext('2d'),R=(x,y,w,h,col,a)=>{c.globalAlpha=a==null?1:a;c.fillStyle=col;c.fillRect(x,y,w,h);c.globalAlpha=1};
  const sk=L.skin||'#d9a27a',skD=shade(sk,.8),skDD=shade(sk,.66),fw=L.fw||18,x0=24-(fw>>1),y0=12,ey=y0+10,exL=18,exR=27;
  if(L.wallen>=1&&mood!=='bang'){R(exL,ey+2,3,1,skD,.75);R(exR,ey+2,3,1,skD,.75)}if(L.wallen>=2){R(exL+1,ey+3,2,1,skDD,.55);R(exR,ey+3,2,1,skDD,.55)}
  const fore=L.hat==='none'&&!['lang','bob','krul','afro'].includes(L.hs);
  if(L.rimpel>=2&&fore)R(x0+5,y0+3,fw-10,1,skD,.5);if(L.rimpel>=3&&fore)R(x0+6,y0+5,fw-12,1,skD,.4);
  if(L.rimpel>=3){R(exL-2,ey,1,1,skD,.6);R(exR+3,ey,1,1,skD,.6)}}
(function(){if(!window.KAR||!KAR.face||KAR.face._ul)return;const f0=KAR.face;const f=function(look,mood,cv){cv=f0(look,mood,cv);try{if(look&&look._u)ageOverlay(cv,look,mood==null?look.mood:mood)}catch(e){}return cv};f._ul=1;KAR.face=f;
  const fix=()=>{if(G.kit&&G.kit.face===f0)G.kit.face=f};fix();setTimeout(fix,0)})();
// groot portret: het gedetailleerde poppetje, 3D-gerenderd met key-, vul- en randlicht, in pixels met een donkere rand
let PR=null;const PCACHE=new Map(),MCACHE=new Map();
const S2L=(()=>{const t=new Uint8ClampedArray(256);for(let i=0;i<256;i++){const c=i/255;t[i]=Math.round(255*(c<=.0031308?c*12.92:1.055*Math.pow(c,1/2.4)-.055))}return t})();
function prInit(){if(PR)return PR;const sc=new TH.Scene(),cam=new TH.PerspectiveCamera(19,1,.1,30);
  const key=new TH.DirectionalLight(0xfff0e0,2.6);key.position.set(-1.6,3.4,2.6);const fill=new TH.HemisphereLight(0xc8d4ff,0x4a3a30,1.35);const rim=new TH.DirectionalLight(0xffffff,2.4);rim.position.set(2.2,3,-2.4);
  sc.add(key,fill,rim);PR={sc,cam,key,rim,rt:{}};return PR}
function modelVoor(L){const k=keyOf(L);let m=MCACHE.get(k);if(!m){m=bouwCine(L);if(MCACHE.size>24){const [k0,m0]=MCACHE.entries().next().value;MCACHE.delete(k0);dispose(m0.g)}MCACHE.set(k,m)}return m}
function dispose(g){g.traverse(o=>{if(o.isMesh&&o.geometry)o.geometry.dispose()})}
function renderPortret(L,mood,size,mond){const R=G.renderer&&G.renderer();if(!R)return null;const pr=prInit();
  let rt=pr.rt[size];if(!rt)rt=pr.rt[size]=new TH.WebGLRenderTarget(size,size,{minFilter:TH.NearestFilter,magFilter:TH.NearestFilter});
  const m=modelVoor(L);setMood(m.P,mood||L.mood||'neutraal');if(mond)setMond(m.P,mond);
  const P=m.P;['legL','legR','armL','armR','torso','head'].forEach(k=>P[k].rotation.set(0,0,0));P.armL.rotation.z=-.05;P.armR.rotation.z=.05;P.head.rotation.set(.04,-.16,0);P.eyeL.scale.y=P.eyeR.scale.y=1;
  m.g.position.set(0,0,0);m.g.rotation.set(0,.32,0);const hh=L.h||1;m.g.scale.setScalar(1);pr.sc.add(m.g);m.g.updateMatrixWorld(true);
  const v=new TH.Vector3();P.head.getWorldPosition(v);const hy=v.y+.3,hat=(L.o&&(L.o.hat==='hat'||L.o.hat==='pet'))?.06:0;
  const tgt=new TH.Vector3(0,hy-.02+hat,0),dist=4.15;pr.cam.position.set(sin(.2)*dist,hy+.1+hat,cos(.2)*dist);pr.cam.lookAt(tgt);pr.cam.updateProjectionMatrix();
  pr.rim.color.set(mix('#ffffff',L.col||'#ffffff',.35));{const q=hx(L.skin||'#c8956a'),lum=(q[0]*.3+q[1]*.59+q[2]*.11)/255;pr.key.intensity=2.6+Math.max(0,.6-lum)*3.2}
  const oc=new TH.Color();R.getClearColor(oc);const oa=R.getClearAlpha(),ot=R.getRenderTarget(),osh=R.shadowMap.autoUpdate;
  R.setRenderTarget(rt);R.setClearColor(0x000000,0);R.clear(true,true,true);R.shadowMap.autoUpdate=false;R.render(pr.sc,pr.cam);R.shadowMap.autoUpdate=osh;
  const buf=new Uint8Array(size*size*4);R.readRenderTargetPixels(rt,0,0,size,size,buf);R.setRenderTarget(ot);R.setClearColor(oc,oa);pr.sc.remove(m.g);
  // samenstellen: achtergrond in pixelbanden, poppetje (sRGB), donkere rand eromheen
  const cv=document.createElement('canvas');cv.width=cv.height=size;const cx=cv.getContext('2d'),img=cx.createImageData(size,size),d=img.data;
  const bgIn=hx(mix('#2a2234',L.col||'#5a4a6a',.28)),bgOut=hx('#0e0b12'),ol=hx('#07060a');
  const A=(x,y)=>x>=0&&y>=0&&x<size&&y<size&&buf[((size-1-y)*size+x)*4+3]>8;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const o=(y*size+x)*4,s=((size-1-y)*size+x)*4;
    if(buf[s+3]>8){d[o]=S2L[buf[s]];d[o+1]=S2L[buf[s+1]];d[o+2]=S2L[buf[s+2]];d[o+3]=255;continue}
    if(A(x-1,y)||A(x+1,y)||A(x,y-1)||A(x,y+1)){d[o]=ol[0];d[o+1]=ol[1];d[o+2]=ol[2];d[o+3]=255;continue}
    const dd=Math.hypot((x-size*.55)/size,(y-size*.4)/size),t=clamp(Math.floor(dd*7)/5,0,1);d[o]=bgIn[0]+(bgOut[0]-bgIn[0])*t;d[o+1]=bgIn[1]+(bgOut[1]-bgIn[1])*t;d[o+2]=bgIn[2]+(bgOut[2]-bgIn[2])*t;d[o+3]=255}
  for(let x=0;x<size;x++){const o=x*4;d[o]=Math.min(255,d[o]+20);d[o+1]=Math.min(255,d[o+1]+20);d[o+2]=Math.min(255,d[o+2]+24)}
  cx.putImageData(img,0,0);return cv}
// tekent het grote portret in canvas c (pixelgrootte = c.width); geeft c terug
function tekenPortret(id,mood,c,o){o=o||{};const L=typeof id==='object'?id:lookOf(id);c=c||document.createElement('canvas');
  const size=o.size||c.width>=48&&c.width||64;if(!L){return c}
  const k=keyOf(L)+'|'+(mood||'')+'|'+size+'|'+(o.mond||'');let pic=PCACHE.get(k);
  if(!pic){try{pic=renderPortret(L,mood,size,o.mond)}catch(e){console.error(e);pic=null}if(pic){if(PCACHE.size>60)PCACHE.delete(PCACHE.keys().next().value);PCACHE.set(k,pic)}}
  if(!pic){if(G.kit&&G.kit.face){G.kit.face(Object.assign({bg:'#14101a'},toFace(L)),mood||null,c)}return c}
  c.width=c.height=size;c.style.imageRendering='pixelated';c.getContext('2d').drawImage(pic,0,0);return c}

/* =================== filmische beeldmodus (cutscènes) =================== */
const CINE={on:false,mat:null,prev:null,rim:null,fill:null,t:0,fd:-1,focus:null,saved:null,ml:null};
const touch=matchMedia('(pointer:coarse)').matches,small=()=>innerWidth<700;
function cineMat(){if(CINE.mat)return CINE.mat;const m0=G.post&&G.post.material;if(!m0||!m0.fragmentShader)return null;let fs=m0.fragmentShader;
  const un=Object.assign({},m0.uniforms,{uFocus:{value:-1},uFocusUV:{value:new TH.Vector2(.5,.55)},uAper:{value:12},uMaxR:{value:7},uTime:{value:0},uGrain:{value:.03},uVig2:{value:.3},uLv:{value:110}});
  const R=[['varying vec2 vUv;','varying vec2 vUv;uniform float uFocus,uAper,uMaxR,uTime,uGrain,uVig2,uLv;uniform vec2 uFocusUV;'],
    ['vec3 toS(',`float cocR(float z){float f=uFocus>0.?uFocus:ld(uFocusUV);return clamp(abs(z-f)/max(z,1.)*uAper,0.,uMaxR);}
      float hsh2(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      vec3 dofC(vec2 uv,float d){vec2 px=1./uRes;float r0=cocR(d);vec3 acc=texture2D(tColor,uv).rgb;float ws=1.;
        for(int i=0;i<24;i++){float fi=float(i)+.5;float a=fi*2.39996;float rr=sqrt(fi/24.)*uMaxR;vec2 o=vec2(cos(a),sin(a))*rr;vec2 su=uv+o*px;
          float sd=ld(su);float sr=cocR(sd);float rr2=sd<d?sr:min(sr,r0);float w=clamp(rr2-rr+1.,0.,1.);
          vec3 sc=texture2D(tColor,su).rgb;float l=dot(sc,vec3(.299,.587,.114));w*=1.+max(l-.62,0.)*6.;acc+=sc*w;ws+=w;}
        return acc/ws;}
      vec3 toS(`],
    ['vec3 c=texture2D(tColor,vUv).rgb;float d=ld(vUv);','float d=ld(vUv);vec3 c=dofC(vUv,d);'],
    ['float edge=step(th,behind)*uOutline','float edge=step(th,behind)*uOutline*(1.-smoothstep(.8,3.,cocR(d)))'],
    ['float lv=72.;','s+=(hsh2(gl_FragCoord.xy+fract(uTime*7.31)*97.)-.5)*uGrain;s*=1.-smoothstep(.12,.62,vg)*uVig2;float lv=uLv;']];
  for(const [a,b] of R){if(fs.indexOf(a)<0){console.warn('LOOK: post-shader anders dan verwacht, geen filmische nabewerking');return null}fs=fs.replace(a,b)}
  CINE.mat=new TH.ShaderMaterial({uniforms:un,vertexShader:m0.vertexShader,fragmentShader:fs,depthTest:false,depthWrite:false});return CINE.mat}
const findSun=()=>{const sc=G.scene&&G.scene();if(!sc)return null;return sc.children.find(o=>o.isDirectionalLight&&o.castShadow&&o!==CINE.rim)||null};
function recompile(){const sc=G.scene&&G.scene();if(!sc)return;sc.traverse(o=>{const m=o.material;if(!m)return;(Array.isArray(m)?m:[m]).forEach(x=>{x.needsUpdate=true})})}
U.cinePix=()=>small()?560:touch?640:760;
U.cineOn=function(o){o=o||{};if(CINE.on||!G.ready)return false;const R=G.renderer(),sc=G.scene(),sun=findSun();CINE.on=true;CINE.t=0;CINE.fd=-1;
  const sv0={pix:G.pixPref,type:R.shadowMap.type};if(sun){const s=sun.shadow,c=s.camera;sv0.ms=s.mapSize.clone();sv0.cam=[c.left,c.right,c.top,c.bottom];sv0.rad=s.radius;sv0.bias=s.bias}CINE.saved=sv0;
  if(o.pix!==false){G.pixPref=o.pix||U.cinePix();G.resize&&G.resize()}
  // zachte schaduw met een fijnere schaduwkaart rond de scène
  if(sun&&o.schaduw!==false){const s=sun.shadow,c=s.camera,n=touch?2048:4096,soft=!touch&&U.zachteSchaduw!==false;if(soft)R.shadowMap.type=TH.PCFShadowMap;s.mapSize.set(n,n);if(s.map){s.map.dispose();s.map=null}c.left=-18;c.right=18;c.top=18;c.bottom=-18;c.updateProjectionMatrix();s.radius=3;s.bias=-.0004;if(soft)recompile()}
  // randlicht van achteren en een zacht vullicht vanaf de camera
  if(!CINE.rim){CINE.rim=new TH.DirectionalLight(0xffe2c0,0);CINE.fill=new TH.DirectionalLight(0xc8d8ff,0)}
  sc.add(CINE.rim,CINE.rim.target,CINE.fill,CINE.fill.target);
  // nabewerking: scherptediepte met bokeh, filmkorrel, vignet
  const m=cineMat();if(m&&G.post){CINE.prev=G.post.material;G.post.material=m}
  G.avatarSync&&G.avatarSync();return true};
U.cineOff=function(){if(!CINE.on)return false;CINE.on=false;const R=G.renderer(),sc=G.scene(),sun=findSun(),s0=CINE.saved||{};
  if(CINE.prev&&G.post){G.post.material=CINE.prev;CINE.prev=null}
  if(CINE.rim){sc.remove(CINE.rim,CINE.rim.target,CINE.fill,CINE.fill.target)}
  if(sun&&s0.ms){const s=sun.shadow,c=s.camera,re=R.shadowMap.type!==s0.type;R.shadowMap.type=s0.type;s.mapSize.copy(s0.ms);if(s.map){s.map.dispose();s.map=null}[c.left,c.right,c.top,c.bottom]=s0.cam;c.updateProjectionMatrix();s.radius=s0.rad;s.bias=s0.bias;if(re)recompile()}
  if(s0.pix!==undefined&&G.pixPref!==s0.pix&&!CINE.cutPix){G.pixPref=s0.pix;G.resize&&G.resize()}
  lucaMirrorOff();CINE.focus=null;return true};
U.cineAan=()=>CINE.on;U._cine=CINE;U._spk=()=>SPK;
// scherpstellen: {x,y,z} | id van een acteur | een poppetje | null (automatisch: wie praat of wie in het midden staat)
U.focus=function(t){CINE.focus=t||null};
const v1=new TH.Vector3(),v2=new TH.Vector3(),v3=new TH.Vector3();
function headPos(o,out){const P=o&&(o.P||(o.userData&&o.userData.P));if(!P||!P.head)return null;P.head.getWorldPosition(out);out.y+=.3;return out}
function focusDepth(cam){const C=G.cut,t=CINE.focus;let p=null;
  if(t&&t.x!=null&&t.y!=null)p=v2.set(t.x,t.y,t.z);else if(t&&typeof t==='string'&&C&&C.acteur){const a=C.acteur(t);if(a)p=headPos(a,v2)}else if(t&&(t.P||t.g))p=headPos(t.P?t:{P:t.g.userData.P},v2);
  if(!p){let best=1e9;const cand=[];if(C&&C.personen)C.personen.forEach(a=>{if(a.g&&a.g.parent&&a.g.visible)cand.push(a)});MINE.forEach(a=>{if(a.g.parent)cand.push(a)});
    if(CINE.ml&&CINE.ml.g.visible)cand.push({P:CINE.ml.P,id:'luca'});
    const sub=document.getElementById('svSub'),spk=SPK.id&&((sub&&!sub.hidden)||performance.now()-SPK.t<6000)?SPK.id:null;
    for(const a of cand){if(!headPos(a,v3))continue;const q=v1.copy(v3).project(cam);if(q.z>1||abs(q.x)>.9||abs(q.y)>.95)continue;let sc=Math.hypot(q.x,q.y*.8)+(spk&&a.id===spk?-.6:0);if(sc<best){best=sc;p=v2.copy(v3)}}}
  if(!p)return -1;v1.copy(p).applyMatrix4(cam.matrixWorldInverse);return Math.max(.5,-v1.z)}
function cineFrame(dt){const cam=G.camera&&G.camera();if(!cam)return;CINE.t+=dt;const u=CINE.mat&&CINE.mat.uniforms;
  if(u&&G.post&&G.post.material===CINE.mat){u.uTime.value=CINE.t;const fd=focusDepth(cam);if(fd>0){CINE.fd=CINE.fd<0?fd:CINE.fd+(fd-CINE.fd)*Math.min(1,dt*5)}else CINE.fd=-1;u.uFocus.value=CINE.fd;
    const ry=u.uRes.value.y||360;u.uAper.value=11*ry/720*(cam.fov<30?1.4:1);u.uMaxR.value=Math.max(2,Math.round(7*ry/720));}
  // licht: randlicht achter de mensen (warm overdag, koel 's nachts), vullicht vanaf de camera
  if(CINE.rim){cam.getWorldDirection(v1);const tg=v2.copy(cam.position).addScaledVector(v1,Math.max(4,CINE.fd>0?CINE.fd:10));const right=v3.set(-v1.z,0,v1.x).normalize();
    const n=G.night||0;CINE.rim.position.copy(tg).addScaledVector(v1,14).addScaledVector(right,7);CINE.rim.position.y+=9;CINE.rim.target.position.copy(tg);
    CINE.rim.color.set(n>.5?'#9ab8ff':'#ffe2c0');CINE.rim.intensity=1.2+n*1.1;
    CINE.fill.position.copy(cam.position).addScaledVector(right,-3);CINE.fill.position.y+=3;CINE.fill.target.position.copy(tg);CINE.fill.intensity=.35+n*.25}
  lucaMirror()}
// Luca (de speler) in een cutscène: het gedetailleerde poppetje beweegt precies mee met het gewone poppetje
function lucaMirror(){if(!story()&&!CINE.ml)return;const av=G.avatarObj&&G.avatarObj(),AP=G.avatarParts&&G.avatarParts();
  if(!av||!AP||!av.visible||!av.parent||U.cineModellen===false){if(CINE.ml)CINE.ml.g.visible=false;return}
  const L=lookOf('luca'),k=keyOf(L);let ml=CINE.ml;
  if(!ml||ml.key!==k){if(ml){ml.g.parent&&ml.g.parent.remove(ml.g);dispose(ml.g)}const r=bouwCine(L);ml=CINE.ml={g:r.g,P:r.P,key:k,av:null,hid:[]};G.scene().add(ml.g)}
  if(ml.av!==av){ml.hid.forEach(m=>m.visible=true);ml.hid=[];const skip=new Set([AP.hand,AP.bag]);
    const walk=n=>{if(!n||skip.has(n))return;n.children.forEach(ch=>{if(skip.has(ch))return;if(ch.isMesh){const m=ch.material;if(m&&!m.vertexColors&&ch.visible){ch.visible=false;ml.hid.push(ch)}}else if(!ch.userData.ul)walk(ch)})};walk(AP.root);ml.av=av}
  ml.g.visible=true;ml.g.position.copy(av.position);ml.g.rotation.copy(av.rotation);ml.g.scale.copy(av.scale);const Q=ml.P;Q.root.position.y=AP.root.position.y;
  ['legL','legR','armL','armR','torso','head'].forEach(n=>{if(AP[n])Q[n].rotation.copy(AP[n].rotation)});if(AP.eyeL&&AP.eyeL.scale){Q.eyeL.scale.y=AP.eyeL.scale.y;Q.eyeR.scale.y=AP.eyeR.scale.y}
  if(!ml.st)ml.st={id:'luca',P:Q,anim:null};faceStep(ml.st,1/60)}
function lucaMirrorOff(){const ml=CINE.ml;if(!ml)return;ml.hid.forEach(m=>m.visible=true);ml.g.parent&&ml.g.parent.remove(ml.g);dispose(ml.g);CINE.ml=null}
// gezichten van de acteurs: wie praat beweegt zijn mond, iedereen heeft zijn laatste stemming
const SPK={id:null,t:0,txt:'',tt:0},MOOD={};
function praatNu(id){if(!id||SPK.id!==id)return false;const el=document.getElementById('svSubT'),now=performance.now();if(el){const t=el.textContent||'';if(t!==SPK.txt){SPK.txt=t;SPK.tt=now}}const sub=document.getElementById('svSub');return now-SPK.tt<220&&(!sub||!sub.hidden)}
function faceStep(a,dt){const P=a.P;if(!P||!P._ul)return;const m=a.mood||MOOD[a.id]||P._ul.L.mood||'neutraal';setMood(P,m);
  const praat=a.praat||a.anim==='talk'||praatNu(a.id)||P._ul.praat;
  if(praat){a._mt=(a._mt||0)-dt;if(a._mt<=0){a._mt=.06+Math.random()*.09;const L=['half','open','o','half','dicht','open'];setMond(P,L[Math.floor(Math.random()*L.length)])}}
  else if(P._ul.mond!==({blij:'lach',boos:'boos',koel:'koel',bang:'bang'}[m]||'dicht')){const f=P._ul;f.mood=null;setMood(P,m)}}

/* =================== eigen poppetjes (los te gebruiken) =================== */
const MINE=new Set();
U.persoon=function(id,o){o=o||{};const L=typeof id==='object'&&id.o?id:lookOf(id,o);if(!L)return null;const detail=o.detail||(CINE.on?'cine':'spel');
  let r;if(detail==='cine')r=bouwCine(L,{w:(L.w||1)/(L.h||1)});else{r=G.avatarBuild?G.avatarBuild({spec:toSpec(L)}):bouwCine(L)}
  const p={id:L._id,detail,g:r.g,P:r.P,L,anim:o.anim||'idle',mood:o.mood||null,praat:false,seed:Math.random()*10,ph:0,v:0,cur:{lL:0,lR:0,aL:0,aR:0,zL:0,zR:0,tx:0,ty:0,tz:0,hx:0,hy:0,y:0,sy:1},T:{},blink:1+Math.random()*2,blinkOn:0,px:null,pz:null,kijk:null};
  p.g.scale.setScalar(L.h||1);p.g.position.set(o.x||0,o.y||0,o.z||0);p.g.rotation.y=o.ry||0;
  p.zet=(x,z,ry,y)=>{p.g.position.set(x,y!=null?y:p.g.position.y,z);if(ry!=null)p.g.rotation.y=ry;return p};
  p.doe=a=>{p.anim=a||'idle';return p};p.stemming=m=>{p.mood=m;return p};p.zeg=on=>{p.praat=!!on;return p};
  p.weg=()=>{MINE.delete(p);p.g.parent&&p.g.parent.remove(p.g);dispose(p.g)};
  // opnieuw bouwen (ouder geworden, andere kleren): zelfde object, zelfde plek; p.g en p.P zijn daarna nieuw
  p.herbouw=function(o2){o2=o2||{};const L2=lookOf(p.id,Object.assign({},o,o2));if(!L2)return p;if(keyOf(L2)===keyOf(p.L)&&!o2.detail)return p;const det=o2.detail||p.detail;
    const r2=det==='cine'?bouwCine(L2,{w:(L2.w||1)/(L2.h||1)}):(G.avatarBuild?G.avatarBuild({spec:toSpec(L2)}):bouwCine(L2));
    const old=p.g,par=old.parent;r2.g.position.copy(old.position);r2.g.rotation.copy(old.rotation);r2.g.scale.setScalar(L2.h||1);if(par){par.add(r2.g);par.remove(old)}dispose(old);
    p.g=r2.g;p.P=r2.P;p.L=L2;p.detail=det;return p};
  p.update=function(dt){const g=p.g,x=g.position.x,z=g.position.z;let v=0;if(p.px!=null&&dt>0)v=Math.hypot(x-p.px,z-p.pz)/dt;p.px=x;p.pz=z;p.v+=(v-p.v)*Math.min(1,dt*8);
    const mv=p.v>.3,run=p.v>6,sp=Math.min(1,p.v/4.2),T=p.T;for(const k in T)T[k]=0;T.sy=1;p.ph+=dt*p.v*1.25;const t=performance.now()/1000;
    if(mv){const sw=sin(p.ph)*(run?.95:.75)*Math.max(.35,sp);T.lL=sw;T.lR=-sw;T.aL=-sw*(run?1.2:.8);T.aR=sw*(run?1.2:.8);T.tx=run?.2:.05;T.y=abs(cos(p.ph))*(run?.1:.06)}
    const POSE=G.cut&&G.cut.POSE;const f=POSE&&POSE[p.anim];if(f&&(!mv||p.anim==='carry'))f(T,t,p,mv);else if(!mv){T.sy=1+sin(t*2.3+p.seed)*.012;T.aL=sin(t*1.15+p.seed)*.045;T.aR=-T.aL;T.zL=-.05;T.zR=.05}
    if(p.kijk!=null)T.hy=p.kijk;const c=p.cur,P=p.P,k=Math.min(1,dt*(mv?30:12)),kh=Math.min(1,dt*7);for(const n in c){const tv=T[n]==null?0:T[n];c[n]+=(tv-c[n])*(n==='hy'||n==='hx'?kh:k)}
    P.root.position.y=c.y;P.legL.rotation.x=c.lL;P.legR.rotation.x=c.lR;P.armL.rotation.set(c.aL,0,c.zL);P.armR.rotation.set(c.aR,0,c.zR);P.torso.rotation.set(c.tx,c.ty,c.tz);P.head.rotation.set(c.hx,c.hy,0);
    p.blink-=dt;if(p.blink<=0){p.blinkOn=.12;p.blink=1.8+Math.random()*3.6}const bs=p.blinkOn>0?.12:1;if(p.blinkOn>0)p.blinkOn-=dt;if(P.eyeL)P.eyeL.scale.y=bs;if(P.eyeR)P.eyeR.scale.y=bs;
    faceStep(p,dt)};
  if(o.scene!==false&&G.scene&&G.scene())(o.parent||G.scene()).add(p.g);if(o.auto!==false)MINE.add(p);return p};

/* =================== koppelen aan het spel en aan stad-cut.js =================== */
let lastKey='';
U.key=()=>{try{return keyOf(lookOf('luca'))}catch(e){return ''}};
function sync(force){const k=U.key();if(!force&&k===lastKey)return;lastKey=k;PCACHE.clear();
  try{G.avatarSync&&G.avatarSync()}catch(e){}
  // acteurs van G.cut, losse G.actors met een cast-id en mijn eigen poppetjes
  const C=G.cut;if(C&&C.actors)for(const id in CAST){const a=C.actors[id];if(a){const L=lookOf(id);a.schaal=L.h;if(!a.rol&&CAST[id].rol)a.rol=CAST[id].rol}}
  if(story())(G.actors||[]).forEach(a=>{const id=cid(a.cast||a.castId||(a.look&&a.look._id));if(id)a.look=toFlat(lookOf(id))});
  MINE.forEach(p=>{if(p.id&&!p.vast)p.herbouw()})}
U.sync=()=>sync(true);
function koppelCut(){const C=G.cut;if(!C||C._ul)return;C._ul=1;
  // ontbrekende cast (latere hoofdstukken) in de registry: naam, kleur, rol, schaal
  if(C.actors)for(const id in CAST){const L=lookOf(id);if(!C.actors[id])C.actors[id]={n:CAST[id].n,col:CAST[id].col,rol:CAST[id].rol||'',look:null,face:null,schaal:L.h};else C.actors[id].schaal=L.h}
  C.bouwer=(spec,o)=>{if(U.cineModellen===false)return null;if(!(CINE.on||(C.active&&C.active())))return null;const L=spec&&spec._look?spec._look:specNaarLook(spec);return bouwCine(L,{w:(L.w||1)/(L.h||1)})};
  C.portret=(id,mood,c)=>{SPK.id=id;SPK.t=performance.now();SPK.txt='';if(id)MOOD[id]=mood||null;const sz=(C.hq&&C.hq.portret)||112;c.width=c.height=Math.round(sz/2);
    if(!cid(id)&&id!=='luca'){if(G.kit&&G.kit.face&&C.face){c.width=c.height=48;G.kit.face(Object.assign({bg:'#14101a'},C.face(id)),mood||null,c)}return c}
    return tekenPortret(id,mood,c,{size:Math.round(sz/2)})};
  if(C.onStart)C.onStart.push(o=>{CINE.cutPix=true;U.cineOn({pix:false})});if(C.onEnd)C.onEnd.push(()=>{U.cineOff();CINE.cutPix=false});
  if(C.hq){C.hq.pix=U.cinePix();C.hq.portret=small()?112:136}}
function koppelStory(){const S0=G.story;if(!S0||S0._ul)return;S0._ul=1;
  if(Array.isArray(S0.onStep))S0.onStep.push((id,def)=>{const t=def&&(def.outfit||def.soort||def.situatie);if(t){U.situatie(t);SITsrc='stap'}else if(SITsrc==='stap'){U.situatie(null)}})}
function opwarmen(){if(!story())return;try{const c=document.createElement('canvas');tekenPortret('luca',null,c,{size:16});PCACHE.clear()}catch(e){}
  try{const m=cineMat(),R=G.renderer();if(m&&G.post&&R&&R.compile){const was=G.post.material;G.post.material=m;R.compile(G.post,G.camera());G.post.material=was}}catch(e){}}
let tick=0;
const hook=setInterval(()=>{if(!G.ready)return;clearInterval(hook);koppelCut();koppelStory();sync(true);
  const f0=G.onFrame;G.onFrame=function(dt){f0&&f0(dt);try{frame(dt)}catch(e){console.error(e)}};setTimeout(()=>{(window.requestIdleCallback||setTimeout)(opwarmen)},2500)},150);
function frame(dt){MINE.forEach(p=>{try{p.update(dt)}catch(e){}});
  const C=G.cut;if(C&&C.personen)C.personen.forEach(a=>{if(a.P&&a.P._ul)faceStep(a,dt)});
  if(CINE.on)cineFrame(dt);
  tick+=dt;if(tick>1){tick=0;koppelCut();koppelStory();sync(false)}}

/* =================== API =================== */
U.CAST=CAST;U.personen=MINE;U.allesWeg=()=>{[...MINE].forEach(p=>p.weg())};U.ids=()=>Object.keys(CAST);U.id=cid;
U.info=id=>{id=cid(id);if(!id)return null;const C=CAST[id],a=ageOf(id);return {id,n:C.n,rol:C.rolA?C.rolA(a):C.rol,col:C.col,geboren:C.born,leeftijd:a,jaar:yearNow()}};
U.leeftijd=function(a){const L=lst();if(a==null)return lucaAge();L.age=clamp(+a||16,12,30);L.ageCh=ch();sv();sync(true);return L.age};
U.jaar=()=>yearNow();
U.look=(id,o)=>{const L=lookOf(id,o);return L?toFlat(L):null};
U.spec=(id,o)=>{const L=lookOf(id,o);return L?toSpec(L):null};
U.face=(id,o)=>{const L=lookOf(id,o);return L?toFace(L):null};
U.lookRuw=(id,o)=>lookOf(id,o);
U.tekenFace=(id,mood,cv)=>{const F=U.face(id);if(!F||!G.kit||!G.kit.face)return cv;return G.kit.face(F,mood||null,cv||document.createElement('canvas'))};
U.portret=(id,o)=>{o=o||{};return tekenPortret(id,o.mood||null,o.cv||null,{size:o.size||64,mond:o.mond})};
// outfit: U.outfit('zakelijk') = vast voor Luca, U.outfit(null|'auto') = weer automatisch; {wie:'nova'} voor iemand anders
U.outfit=function(n,o){o=o||{};const wie=cid(o.wie||'luca');if(n==='auto')n=null;
  if(wie&&wie!=='luca'){if(n)KLV[wie]=n;else delete KLV[wie];sync(true);return n}
  const L=lst();if(n&&!OUTFITS.includes(n))return lucaOutfit();L.outfit=n||null;L.vast=!!n&&o.vast!==false;sv();sync(true);return lucaOutfit()};
U.huidig=()=>lucaOutfit();U.outfits=()=>OUTFITS.slice();
// situatie van de missie of plek (null = vrij): bepaalt de kleding zolang er niets vast staat
U.situatie=function(t){SITsrc=null;SIT=t?(SITMAP[t]!==undefined?SITMAP[t]:(OUTFITS.includes(t)?t:null)):null;sync(false);return SIT};
U.auto=ctx=>{if(ctx&&ctx.situatie!==undefined)U.situatie(ctx.situatie);return lucaOutfit()};
// keuzes van de speler: kapsel, baard (vanaf 18), kleur binnen de stijl
const KAPSELS=a=>a<18?['krul','krulkort','kort','opgeschoren','kuif']:['krul','krulkort','kort','kuif','opgeschoren','achterover','zij'];
const BAARDEN=a=>a<18?[]:['','stoppel','kortbaard','baard','sik','ringbaard','snor'];
const NM={krul:'Krullen',krulkort:'Korte krullen',kort:'Kort',opgeschoren:'Opgeschoren',kuif:'Kuif',achterover:'Achterover',zij:'Zijscheiding','':'Glad',stoppel:'Stoppels',kortbaard:'Korte baard',baard:'Volle baard',sik:'Sik',ringbaard:'Ringbaard',snor:'Snor'};
U.opties=()=>{const a=lucaAge(),on=lucaOutfit(),st=STIJL[on];return {kapsels:KAPSELS(a),baarden:BAARDEN(a),stijl:st||null,kleuren:st?(st==='straat'?5:st==='zakelijk'?4:st==='thuis'?4:3):0,namen:NM}};
U.kies=function(o){o=o||{};const L=lst(),a=lucaAge(),op=U.opties();if(o.hs!==undefined){L.hs=o.hs&&KAPSELS(a).includes(o.hs)?o.hs:null}
  if(o.fh!==undefined){L.fh=o.fh==null?null:(BAARDEN(a).includes(o.fh)?o.fh:L.fh)}
  if(o.kleur!=null&&op.stijl){L.kl[op.stijl]=((o.kleur|0)%op.kleuren+op.kleuren)%op.kleuren}
  sv();sync(true);return {hs:L.hs,fh:L.fh,kl:Object.assign({},L.kl)}};
// klein keuzemenu (K.dialog): kapsel, baard en kleur; het gezicht zelf ligt vast
U.kiesUI=function(){const K=G.kit;if(!K||!K.dialog)return;const a=lucaAge();let menu='hoofd';
  const ch=()=>{const L=lst(),op=U.opties(),cur=lookOf('luca');
    if(menu==='kapsel')return op.kapsels.map(h=>({t:NM[h]||h,sub:cur.hs2===h?'Nu':'',f:()=>{U.kies({hs:h});upd()}})).concat([{t:'Terug',f:()=>{menu='hoofd';upd()}}]);
    if(menu==='baard')return op.baarden.map(h=>({t:NM[h]||h,sub:cur.fh2===h?'Nu':'',f:()=>{U.kies({fh:h});upd()}})).concat([{t:'Vanzelf (past bij je leeftijd)',f:()=>{U.kies({fh:null});upd()}},{t:'Terug',f:()=>{menu='hoofd';upd()}}]);
    const L0=[{t:'Kapsel',sub:NM[cur.hs2]||cur.hs2,f:()=>{menu='kapsel';upd()}}];if(op.baarden.length)L0.push({t:'Baard',sub:NM[cur.fh2]||'',f:()=>{menu='baard';upd()}});
    if(op.stijl&&op.kleuren>1)L0.push({t:'Andere kleur',sub:'Binnen je stijl',f:()=>{U.kies({kleur:((L.kl[op.stijl]|0)+1)});upd()}});L0.push({t:'Klaar',f:()=>K.closeDialog()});return L0};
  const txt=()=>menu==='kapsel'?'Welk kapsel?':menu==='baard'?'En je gezicht?':'Je gezicht blijft je gezicht. Kapsel en kleren kun je kiezen.';
  const upd=()=>{K.say(txt(),'neutraal',ch());if(G.kit.face){const pc=document.getElementById('sdDlgPor');if(pc)G.kit.face(Object.assign({bg:'#1b1c22'},U.face('luca')),'neutraal',pc)}};
  K.dialog({name:'Luca',role:a+' jaar · '+yearNow(),look:Object.assign({bg:'#1b1c22'},U.face('luca')),mood:'neutraal',col:CAST.luca.col,lines:[txt()],choices:ch()})};
U.setMood=setMood;U.setMond=setMond;U.bouw=(id,o)=>{const L=typeof id==='object'&&id.o?id:lookOf(id,o);return L?bouwCine(L,o):null};
U.specNaarLook=specNaarLook;
})();
