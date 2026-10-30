// Tab: Outfit. Kleding en sieraden die je echt draagt. Elk stuk geeft een voordeel (soms met een nadeel), en drie of meer
// stukken in dezelfde stijl geven een setbonus. Vijf plekken: hoofd, kleding, schoenen, nek en pols.
// Effecten (fitFx in state.js): kans = %-punten slaagkans, buit/inc/xp/bail/cd/flee/en/car/esc = fractie (.05 = 5%),
// heat = minder hitte (negatief = opvallend, dus meer hitte).
const FIT_SLOTS=[{id:'hoofd',n:'Hoofd'},{id:'kleding',n:'Kleding'},{id:'schoenen',n:'Schoenen'},{id:'nek',n:'Sieraden'},{id:'pols',n:'Pols'}];
const FIT_STYLES={
 stil:{n:'Grijze muis',d:'Onopvallend. Niemand die je herkent.',col:'#a9b3c1',set3:{kans:2,heat:.06},set5:{kans:4,heat:.12}},
 sport:{n:'Atleet',d:'Snel weg en lang fit.',col:'#a9dcff',set3:{flee:.08,en:.04},set5:{flee:.15,en:.08}},
 patser:{n:'Patser',d:'Je ziet er rijk uit. Dat levert geld op, en aandacht.',col:'#f2c230',set3:{buit:.04,inc:.04,heat:-.04},set5:{buit:.06,inc:.08,heat:-.06}},
 zaken:{n:'Zakenman',d:'Respect bij rechters, bankiers en oude families.',col:'#b8a1ff',set3:{inc:.05,bail:.08},set5:{inc:.08,bail:.15,xp:.03}}};
const OUTFITS=[
 // hoofd
 {id:'pet',slot:'hoofd',st:'stil',n:'Zwarte pet',d:'Klep laag. Camera\'s zien alleen je kin.',p:150,r:0,fx:{heat:.05}},
 {id:'muts',slot:'hoofd',st:'sport',n:'Gebreide muts',d:'Warm op de scooter en niemand kijkt twee keer.',p:400,r:1,fx:{heat:.03,en:.03}},
 {id:'bril',slot:'hoofd',st:'patser',n:'Pilotenbril',d:'Spiegelglazen. Jij ziet alles, zij zien niks.',p:900,r:2,fx:{heat:.03,car:.03}},
 {id:'bivak',slot:'hoofd',st:'stil',n:'Bivakmuts',d:'Bij een overval weet niemand wie je bent. De rechter vindt het minder grappig.',p:2500,r:3,fx:{kans:3,bail:-.1}},
 {id:'hoed',slot:'hoofd',st:'zaken',n:'Borsalino',d:'Een hoed van vilt. Oude families nemen je serieuzer.',p:24000,r:7,fx:{xp:.04,inc:.03}},
 // kleding
 {id:'hoodie',slot:'kleding',st:'stil',n:'Grijze hoodie',d:'Capuchon op, handen in de buidel. Je bent iedereen en niemand.',p:250,r:0,fx:{kans:1,heat:.05}},
 {id:'trainingspak',slot:'kleding',st:'sport',n:'Trainingspak',d:'Rits tot boven. Je bent sneller weg dan zij uit de auto zijn.',p:700,r:1,fx:{flee:.08,en:.04}},
 {id:'werkjas',slot:'kleding',st:'stil',n:'Werkjas met reflectie',d:'Met een hesje loop je overal binnen. Niemand vraagt wat je komt doen.',p:1800,r:2,fx:{kans:2,car:.04}},
 {id:'designer',slot:'kleding',st:'patser',n:'Designerjas',d:'Felle kleuren, dure stof. Je ziet er rijk uit en dat merken ze aan de prijs. De politie ook.',p:14000,r:4,fx:{buit:.06,inc:.03,heat:-.06}},
 {id:'jas',slot:'kleding',st:'stil',n:'Lange zwarte jas',d:'Genoeg binnenzakken voor alles wat niemand mag zien.',p:26000,r:5,fx:{kans:3,heat:.06}},
 {id:'pak',slot:'kleding',st:'zaken',n:'Italiaans maatpak',d:'Op maat gesneden in Napels. Rechters en bankdirecteuren praten anders tegen je.',p:55000,r:6,fx:{inc:.08,bail:.12,xp:.02}},
 // schoenen
 {id:'sneakers',slot:'schoenen',st:'sport',n:'Witte sneakers',d:'Schoon, licht en snel.',p:180,r:0,fx:{flee:.05}},
 {id:'kisten',slot:'schoenen',st:'stil',n:'Zwarte kisten',d:'Stalen neus. Handig bij deuren en bij ruzie.',p:650,r:1,fx:{kans:1,esc:.03}},
 {id:'renners',slot:'schoenen',st:'sport',n:'Hardloopschoenen',d:'Licht, veerkrachtig en gemaakt om weg te rennen.',p:1500,r:2,fx:{flee:.12,cd:.03}},
 {id:'instappers',slot:'schoenen',st:'zaken',n:'Italiaanse instappers',d:'Zacht leer, geen veters. Je hoeft nergens heen te rennen.',p:18000,r:5,fx:{inc:.03,bail:.05}},
 {id:'laarzen',slot:'schoenen',st:'patser',n:'Laarzen van slangenleer',d:'Niemand vergeet wie die laarzen draagt. De politie ook niet.',p:90000,r:8,fx:{buit:.05,xp:.03,heat:-.04}},
 // nek
 {id:'kruisje',slot:'nek',st:'stil',n:'Klein kruisje',d:'Van je oma. Brengt geluk, zegt ze.',p:300,r:0,fx:{esc:.02,bail:.03}},
 {id:'koptel',slot:'nek',st:'sport',n:'Koptelefoon om je nek',d:'Muziek aan, wereld uit. Je houdt het langer vol.',p:800,r:1,fx:{en:.04,cd:.02}},
 {id:'zilver',slot:'nek',st:'patser',n:'Zilveren schakelketting',d:'Een eerste teken dat het goed gaat.',p:1200,r:1,fx:{buit:.02,inc:.02}},
 {id:'das',slot:'nek',st:'zaken',n:'Zijden das',d:'Donkerrood, strak geknoopt. Voor afspraken waar je niet te laat komt.',p:6000,r:4,fx:{inc:.04,bail:.08}},
 {id:'goud',slot:'nek',st:'patser',n:'Gouden ketting',d:'Dik en zwaar. Laat zien dat het je goed gaat, en dat trekt goede zaken aan.',p:16000,r:3,fx:{inc:.07,buit:.03,heat:-.04}},
 {id:'diamant',slot:'nek',st:'patser',n:'Ketting met diamanten',d:'Een hanger die het licht vangt in elke club van de stad.',p:250000,r:9,fx:{inc:.12,xp:.03,heat:-.06}},
 // pols
 {id:'digitaal',slot:'pols',st:'sport',n:'Digitaal horloge',d:'Met stopwatch. Je weet precies hoe lang je hebt.',p:90,r:0,fx:{cd:.02}},
 {id:'duik',slot:'pols',st:'stil',n:'Stalen duikhorloge',d:'Waterdicht en verlicht in het donker.',p:2200,r:2,fx:{cd:.04,kans:1}},
 {id:'goudhorloge',slot:'pols',st:'patser',n:'Gouden horloge',d:'Zwaar om je pols en niet te missen aan de bar.',p:30000,r:4,fx:{buit:.04,inc:.04,heat:-.03}},
 {id:'zwitsers',slot:'pols',st:'zaken',n:'Zwitsers horloge',d:'Handgemaakt, vijftig jaar garantie. Mensen met macht herkennen het meteen.',p:420000,r:9,fx:{inc:.08,xp:.05}}];
const FIT_FX={kans:['kans',1],buit:['buit',0],inc:['inkomen bedrijven',0],xp:['XP',0],bail:['borg',0,1],cd:['wachttijd klussen',0,1],flee:['makkelijker vluchten',0],
 en:['sneller energie',0],car:['waarde auto\'s',0],esc:['ontsnappen uit de bajes',0],heat:['hitte',0,1]};
const fitS=()=>S.fit&&S.fit.own?S.fit:(S.fit={own:{},wear:{}});
const fitItem=id=>OUTFITS.find(o=>o.id===id);
const fitWorn=()=>FIT_SLOTS.map(s=>fitItem(fitS().wear[s.id])).filter(Boolean);
function fitSets(list){const c={};(list||fitWorn()).forEach(o=>{c[o.st]=(c[o.st]||0)+1});return c}
function fitTotals(list){const t={};const add=fx=>Object.entries(fx||{}).forEach(([k,v])=>{t[k]=(t[k]||0)+v});const L=list||fitWorn();L.forEach(o=>add(o.fx));
 const c=fitSets(L);Object.entries(c).forEach(([st,n])=>{const S_=FIT_STYLES[st];if(n>=5)add(S_.set5);else if(n>=3)add(S_.set3)});return t}
let _fitCache=null,_fitKey='';
function outfitFx(k){const key=JSON.stringify(S.fit&&S.fit.wear||{});if(key!==_fitKey){_fitKey=key;_fitCache=fitTotals()}return _fitCache[k]||0}
// gezocht (huurmoorden): onopvallende kleding maakt het minder waarschijnlijk dat je gezocht wordt of gecontroleerd; opvallende kleding juist meer
function wantMod(){return Math.max(.6,Math.min(1.4,1-outfitFx('heat')))}
// tekst van één effect: kans in punten, de rest in procenten. inv = minder is beter (borg, wachttijd, hitte)
function fitFxTxt(k,v){const f=FIT_FX[k];if(!f||!v)return null;const pct=Math.round(Math.abs(v)*(f[1]?1:100));const good=v>0;
 const sign=f[2]?(good?'−':'+'):(good?'+':'−');return {t:`${sign}${pct}% ${f[0]}`,good}}
const fitFxStrs=fx=>Object.entries(fx||{}).map(([k,v])=>fitFxTxt(k,v)).filter(Boolean);
const fitChips=fx=>fitFxStrs(fx).map(x=>`<span class="${x.good?'g':'b'}">${x.t}</span>`).join('');

// ---------- De etalagepop ----------
// Eén SVG met lagen; elk kledingstuk tekent zijn eigen stukje. Kleuren gedempt, zodat de pop past bij de rest van het spel.
const DOLL={body:'#2c3139',body2:'#3a414c',tee:'#30353e',jeans:'#1d2531'};
const ARM_L='M64 104 L53 166 L48 218',ARM_R='M136 104 L147 166 L152 218',LEG_L='M88 198 L86 276 L85 346',LEG_R='M112 198 L114 276 L115 346';
function dollParts(w){const g=id=>w.includes(id);const o={back:'',legs:'',shoes:'',top:'',neck:'',head:'',face:'',wrist:''};
 // broek: hoort bij het pak of het trainingspak, anders een donkere spijkerbroek
 const pants=g('pak')?'#262b35':g('trainingspak')?'#1b2a44':DOLL.jeans;
 o.legs=`<path d="${LEG_L}" stroke="${pants}" stroke-width="23" stroke-linecap="round" fill="none"/><path d="${LEG_R}" stroke="${pants}" stroke-width="23" stroke-linecap="round" fill="none"/>
  <path d="M74 190h52v22H74z" fill="${pants}"/>${g('trainingspak')?`<path d="M77 202 L75 346M123 202 L125 346" stroke="#ff7a1a" stroke-width="2"/>`:''}${g('pak')?`<path d="M88 206 L86 340M112 206 L114 340" stroke="#323845" stroke-width="1"/>`:''}`;
 // schoenen
 const shoe=(c,sole,h)=>`<path d="M74 ${352-h} L95 ${352-h} L97 362 L62 362 Q62 354 74 350Z" fill="${c}"/><path d="M126 ${352-h} L105 ${352-h} L103 362 L138 362 Q138 354 126 350Z" fill="${c}"/>${sole?`<path d="M62 362h35M103 362h35" stroke="${sole}" stroke-width="3"/>`:''}`;
 o.shoes=g('sneakers')?shoe('#e9e6df','#bdb9b0',0):g('renners')?shoe('#ff7a1a','#f4f1ea',0)+`<path d="M70 354h16M114 354h16" stroke="#f4f1ea" stroke-width="1.6"/>`:g('kisten')?shoe('#121316','#000',14)+`<path d="M78 342h14M108 342h14" stroke="#2c2f35" stroke-width="1.5"/>`
  :g('instappers')?shoe('#5a3a22','#3b2513',0)+`<path d="M74 352h10M116 352h10" stroke="#8a6343" stroke-width="2"/>`:g('laarzen')?shoe('#7a6644','#3a2f1e',16)+`<path d="M76 340l4 4 4-4 4 4 4-4M106 340l4 4 4-4 4 4 4-4" stroke="#4d3f27" stroke-width="1.4" fill="none"/>`:shoe('#3a3f48','#24282f',0);
 // bovenkleding
 const torso=(c,len)=>`<path d="M64 98 C82 88 118 88 136 98 L142 116 L137 ${len} L63 ${len} L58 116Z" fill="${c}"/>`;
 const armPath=(L,to)=>{const [x0,y0,x1,y1,x2,y2]=L?[64,104,53,166,48,218]:[136,104,147,166,152,218];
  if(to<=y1){const t=(to-y0)/(y1-y0);return `M${x0} ${y0} L${(x0+(x1-x0)*t).toFixed(1)} ${to}`}
  const t=(to-y1)/(y2-y1);return `M${x0} ${y0} L${x1} ${y1} L${(x1+(x2-x1)*t).toFixed(1)} ${to}`};
 const sleeves=(c,to,wd)=>[1,0].map(L=>`<path d="${armPath(L,to)}" stroke="${c}" stroke-width="${wd||17}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`).join('');
 const arms=`<path d="${ARM_L}" stroke="${DOLL.body}" stroke-width="14" stroke-linecap="round" fill="none"/><path d="${ARM_R}" stroke="${DOLL.body}" stroke-width="14" stroke-linecap="round" fill="none"/>`;
 if(g('hoodie')){o.back=`<path d="M74 70 Q100 30 126 70 L130 100 L70 100Z" fill="#454b55"/>`;
  o.top=arms+sleeves('#4b515b',212,18)+torso('#4b515b',206)+`<path d="M78 160h44l-4 26H82z" fill="#424852"/><path d="M95 98v20M105 98v20" stroke="#cfd3d9" stroke-width="1.5"/>`}
 else if(g('trainingspak')){o.top=arms+sleeves('#1b2a44',212,18)+torso('#1b2a44',202)+`<path d="M100 92v110" stroke="#0f1828" stroke-width="2"/><path d="M58 112 L52 166 L47 210M142 112 L148 166 L153 210" stroke="#ff7a1a" stroke-width="2" fill="none"/><path d="M86 92 L100 104 L114 92" stroke="#ff7a1a" stroke-width="2" fill="none"/>`}
 else if(g('werkjas')){o.top=arms+sleeves('#f2a515',212,18)+torso('#f2a515',204)+`<path d="M60 140h80v7H60zM62 172h76v7H62z" fill="#dfe3e8"/><path d="M50 170l8 1M150 170l-8 1" stroke="#dfe3e8" stroke-width="5"/><path d="M100 94v110" stroke="#c98500" stroke-width="2"/>`}
 else if(g('jas')){o.top=arms+sleeves('#121418',214,19)+`<path d="M62 98 C82 88 118 88 138 98 L146 120 L144 288 L56 288 L54 120Z" fill="#121418"/><path d="M100 96 L100 288" stroke="#06070a" stroke-width="2"/><path d="M86 94 L100 132 L114 94" fill="${DOLL.tee}"/><path d="M84 94 L98 134 L92 150M116 94 L102 134 L108 150" stroke="#2a2d34" stroke-width="2" fill="none"/><circle cx="106" cy="170" r="2" fill="#2a2d34"/><circle cx="106" cy="200" r="2" fill="#2a2d34"/><circle cx="106" cy="230" r="2" fill="#2a2d34"/>`}
 else if(g('designer')){o.top=arms+sleeves('#7b3ff2',212,20)+torso('#7b3ff2',202)+`<path d="M60 116 L140 116 L139 150 L61 150Z" fill="#14b8a6"/><path d="M63 176 L137 176 L137 202 L63 202Z" fill="#ff4d8d"/><path d="M52 150l7 2M148 150l-7 2" stroke="#14b8a6" stroke-width="10"/><path d="M100 92v110" stroke="#e9e6df" stroke-width="2"/><path d="M60 133h80M61 189h76" stroke="rgba(0,0,0,.18)" stroke-width="1"/>`}
 else if(g('pak')){o.top=arms+sleeves('#262b35',214,17)+torso('#262b35',206)+`<path d="M86 93 L100 140 L114 93Z" fill="#e9e6df"/><path d="M84 93 L99 142 L90 160M116 93 L101 142 L110 160" stroke="#353b48" stroke-width="2.5" fill="none"/><circle cx="100" cy="166" r="2" fill="#11141a"/><circle cx="100" cy="184" r="2" fill="#11141a"/><path d="M118 124h10" stroke="#e9e6df" stroke-width="2"/>`}
 else o.top=arms+sleeves(DOLL.tee,132,18)+torso(DOLL.tee,202);
 // handen
 o.top+=`<circle cx="48" cy="222" r="7" fill="${DOLL.body2}"/><circle cx="152" cy="222" r="7" fill="${DOLL.body2}"/>`;
 // nek
 if(g('das'))o.neck=g('pak')?`<path d="M95 95h10l-2 6h-6z" fill="#8c1d2c"/><path d="M97 101h6l2.4 32-5.4 6-5.4-6z" fill="#7a1626"/>`:`<path d="M95 96h10l-2 6h-6z" fill="#8c1d2c"/><path d="M97 102h6l4 64-7 9-7-9z" fill="#7a1626"/>`;
 if(g('kruisje'))o.neck+=`<path d="M90 92 Q100 122 110 92" stroke="#c9cdd3" stroke-width="1" fill="none"/><path d="M100 118v12M96 122h8" stroke="#d9dde3" stroke-width="2"/>`;
 if(g('zilver'))o.neck+=`<path d="M88 92 Q100 128 112 92" stroke="#d0d4da" stroke-width="2.6" stroke-dasharray="3 1.6" fill="none"/>`;
 if(g('goud'))o.neck+=`<path d="M86 92 Q100 134 114 92" stroke="#e8b923" stroke-width="4.5" stroke-dasharray="4 2" fill="none"/><path d="M86 92 Q100 134 114 92" stroke="#fff3b0" stroke-width="1" stroke-dasharray="1 5" fill="none" opacity=".6"/>`;
 if(g('diamant'))o.neck+=`<path d="M87 92 Q100 126 113 92" stroke="#e8b923" stroke-width="2.4" fill="none"/><path d="M100 122 l7 8 -7 12 -7 -12z" fill="#bfefff"/><path d="M100 122 l7 8h-14z" fill="#e8fbff"/><path d="M109 118 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#fff" class="fit-spark"/>`;
 if(g('koptel'))o.neck+=`<path d="M80 96 Q100 120 120 96" stroke="#111318" stroke-width="5" fill="none"/><rect x="72" y="88" width="13" height="17" rx="5" fill="#111318"/><rect x="115" y="88" width="13" height="17" rx="5" fill="#111318"/><rect x="74" y="92" width="9" height="9" rx="3" fill="#ff7a1a"/><rect x="117" y="92" width="9" height="9" rx="3" fill="#ff7a1a"/>`;
 // hoofd en gezicht
 if(g('pet'))o.head=`<path d="M80 46 Q80 22 100 22 Q120 22 120 46Z" fill="#111317"/><path d="M78 44 Q100 54 122 44 L124 50 Q100 60 76 50Z" fill="#08090b"/><circle cx="100" cy="23" r="2" fill="#2a2d34"/>`;
 if(g('muts'))o.head=`<path d="M79 48 Q79 18 100 18 Q121 18 121 48Z" fill="#7d2632"/><path d="M78 42h44v9H78z" fill="#6a1f2a"/><path d="M84 30v10M92 26v14M100 24v16M108 26v14M116 30v10" stroke="#8f3340" stroke-width="1.5"/>`;
 if(g('hoed'))o.head=`<path d="M66 46 Q100 56 134 46 Q132 52 100 56 Q68 52 66 46Z" fill="#221d1a"/><path d="M80 46 L84 24 Q100 16 116 24 L120 46Z" fill="#2b2420"/><path d="M80 40h40v6H80z" fill="#8c1d2c"/><path d="M92 22 Q100 28 108 22" stroke="#1a1513" stroke-width="2" fill="none"/>`;
 if(g('bivak'))o.head=`<path d="M80 52 Q78 24 100 24 Q122 24 120 52 L118 72 Q100 82 82 72Z" fill="#0c0d10"/><path d="M86 48h28v9H86z" fill="${DOLL.body2}"/><circle cx="93" cy="52" r="2" fill="#0c0d10"/><circle cx="107" cy="52" r="2" fill="#0c0d10"/>`;
 if(g('bril'))o.face=`<path d="M84 49h13q1 9-6 10-7-1-7-10zM103 49h13q0 9-7 10-7-1-6-10z" fill="#1b1d22"/><path d="M84 49h13q1 9-6 10-7-1-7-10zM103 49h13q0 9-7 10-7-1-6-10z" stroke="#d9a520" stroke-width="1.3" fill="none"/><path d="M97 50h6" stroke="#d9a520" stroke-width="1.3"/><path d="M87 51l5 5M106 51l5 5" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>`;
 // pols (linker hand van de pop = rechts in beeld)
 const watch=(band,face,dial)=>`<path d="M144 206 l14 2" stroke="${band}" stroke-width="7" stroke-linecap="round"/><circle cx="151" cy="207" r="5.5" fill="${face}"/><circle cx="151" cy="207" r="3.6" fill="${dial}"/>`;
 o.wrist=g('digitaal')?`<path d="M144 206 l14 2" stroke="#16181c" stroke-width="7" stroke-linecap="round"/><rect x="146" y="202" width="10" height="9" rx="1.5" fill="#16181c"/><rect x="148" y="204" width="6" height="4" fill="#9fd8a8"/>`
  :g('duik')?watch('#9aa1ab','#c9ced6','#1d2b44'):g('goudhorloge')?watch('#d9a520','#f2c230','#f6e7b0'):g('zwitsers')?watch('#d9a520','#e8b923','#16233f')+`<path d="M151 207 l0-2.6M151 207 l2 1" stroke="#e8b923" stroke-width=".9"/>`:'';
 return o}
function dollSvg(wear,opts){opts=opts||{};const w=Object.values(wear||{}).filter(Boolean),P=dollParts(w);
 const vb=opts.vb||'0 0 200 372';
 return `<svg class="doll" viewBox="${vb}" role="img" aria-label="${opts.label||'Outfit'}"${opts.vb?' preserveAspectRatio="xMidYMid meet"':''}>
  ${opts.vb?'':`<ellipse cx="100" cy="366" rx="58" ry="6" fill="rgba(0,0,0,.45)"/>`}
  ${P.back}${P.legs}${P.shoes}${P.top}
  <path d="M93 72h14v22H93z" fill="${DOLL.body}"/>
  <ellipse cx="100" cy="50" rx="19" ry="23" fill="${DOLL.body2}"/><path d="M84 40 Q100 28 116 40" stroke="${DOLL.body}" stroke-width="3" fill="none" opacity=".6"/>
  ${P.face}${P.head}${P.neck}${P.wrist}</svg>`}
const FIT_VB={hoofd:'64 14 72 72',kleding:'34 76 132 150',schoenen:'52 318 96 52',nek:'66 78 68 72',pols:'128 186 46 46'};
const fitThumb=o=>dollSvg({[o.slot]:o.id},{vb:FIT_VB[o.slot],label:o.n});

// ---------- Pagina ----------
const fitUI={tab:'kleding',prev:null};
function fitPreview(id){fitUI.prev=id;const el=document.getElementById('fitDoll');if(!el)return;const w=Object.assign({},fitS().wear);if(id){const o=fitItem(id);if(o)w[o.slot]=o.id}
 el.innerHTML=dollSvg(w);el.classList.toggle('try',!!id)}
function fitSumHtml(){const t=fitTotals(),c=fitSets(),chips=fitChips(t);
 return `<div class="fit-sum"><span class="label">Wat je outfit je nu geeft</span><div class="fit-chips">${chips||'<em>Nog niks. Trek iets aan.</em>'}</div></div>
  <div class="fit-sets">${Object.entries(FIT_STYLES).map(([k,s])=>{const n=c[k]||0,on=n>=3;return `<div class="fit-set ${on?'on':''}" style="--sc:${s.col}"><div><b>${s.n}</b><span>${n}/5</span></div>
   <i class="fit-pips">${[0,1,2,3,4].map(i=>`<i class="${i<n?'f':''} ${i===2||i===4?'m':''}"></i>`).join('')}</i><small>${n>=5?'Volle set: ':n>=3?'Actief: ':'Vanaf 3: '}${fitFxStrs(n>=5?s.set5:s.set3).map(x=>x.t).join(', ')}${n>=3&&n<5?'. Bij 5 nog meer':''}</small></div>`}).join('')}</div>`}
V.look=()=>{const ri=rankIdx(S.xp),F=fitS(),tab=fitUI.tab,worn=F.wear[tab];
 const items=OUTFITS.filter(o=>o.slot===tab).sort((a,b)=>a.r-b.r||a.p-b.p);
 const card=o=>{const own=!!F.own[o.id],on=F.wear[o.slot]===o.id,lock=ri<o.r,poor=S.cash<o.p,s=FIT_STYLES[o.st];
  const btn=on?`<button class="btn ghost" onclick="act.fitOff('${o.slot}')">Uittrekken</button>`:own?`<button class="btn act-btn" onclick="act.fitWear('${o.id}')">Aantrekken</button>`
   :lock?`<button class="btn ghost" disabled>Vanaf ${RANKS[o.r][0]}</button>`:`<button class="btn ${poor?'ghost':'act-btn'}" onclick="act.fitBuy('${o.id}')" ${poor?'disabled':''}>${poor?'Te duur · ':'Koop · '}${fmt(o.p)}</button>`;
  return `<article class="fit-item ${on?'on':own?'own':lock?'lock':''}" style="--sc:${s.col}" onmouseenter="fitPreview('${o.id}')" onmouseleave="fitPreview(null)" onfocusin="fitPreview('${o.id}')" onfocusout="fitPreview(null)">
   <div class="fit-th">${fitThumb(o)}</div>
   <div class="fit-b"><div class="fit-t"><h4>${o.n}</h4><span class="fit-st">${s.n}</span></div><p>${o.d}</p><div class="fit-chips">${fitChips(o.fx)}</div></div>
   <div class="fit-btn">${on?'<span class="fit-on">Draag je</span>':own?'<span class="fit-own">In je kast</span>':''}${btn}</div></article>`};
 return `<h1>Outfit</h1><p class="sub">Wat je draagt bepaalt hoe de straat naar je kijkt. Elk stuk geeft een voordeel, en drie of meer stukken in dezelfde stijl geven een setbonus. Wat je koopt blijft in je kast; omkleden is gratis.</p>
 <div class="fit">
  <section class="card fit-left"><div class="fit-stage" id="fitDoll">${dollSvg(F.wear)}</div>
   <div class="fit-worn">${FIT_SLOTS.map(sl=>{const o=fitItem(F.wear[sl.id]);return `<button class="${tab===sl.id?'on':''}" onclick="fitUI.tab='${sl.id}';render()"><span class="label">${sl.n}</span><b>${o?o.n:'Niets'}</b></button>`}).join('')}</div>
   ${fitSumHtml()}</section>
  <section class="fit-right"><div class="tabs fit-tabs" role="tablist">${FIT_SLOTS.map(sl=>`<button role="tab" class="${tab===sl.id?'on':''}" aria-selected="${tab===sl.id}" onclick="fitUI.tab='${sl.id}';render()">${sl.n}${F.wear[sl.id]?'<i></i>':''}</button>`).join('')}</div>
   <p class="fit-hint">${worn?`Je draagt nu: <b>${fitItem(worn).n}</b>. `:''}<span class="hv">Ga met je muis over een stuk om het te passen.</span></p>
   <div class="fit-grid">${items.map(card).join('')}</div></section>
 </div>`};
Object.assign(act,{
 fitBuy(id){const o=fitItem(id),F=fitS();if(!o||F.own[id])return;if(rankIdx(S.xp)<o.r){toast('Vanaf '+RANKS[o.r][0],'bad');return}if(S.cash<o.p){toast('Niet genoeg contant geld','bad');return}
  S.cash-=o.p;F.own[id]=1;F.wear[o.slot]=id;try{SFX.buy&&SFX.buy()}catch(e){}toast(`${o.n} gekocht en aangetrokken`,'ok');log(`Outfit: ${o.n} gekocht (${fmt(o.p)})`,'info');save();render()},
 fitWear(id){const o=fitItem(id),F=fitS();if(!o||!F.own[id])return;F.wear[o.slot]=id;const c=fitSets()[o.st]||0;if(c===3||c===5)toast(`Setbonus ${FIT_STYLES[o.st].n}${c===5?' (volle set)':''}`,'lvl');save();render()},
 fitOff(slot){const F=fitS();delete F.wear[slot];save();render()}});
