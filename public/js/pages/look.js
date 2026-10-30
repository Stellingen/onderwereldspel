// Tab: Outfit. Kleding en sieraden die je echt draagt. Elk stuk geeft een voordeel (soms met een nadeel), en drie of meer
// stukken in dezelfde stijl geven een setbonus. Zes plekken: hoofd, kleding, schoenen, nek, pols en ring. Vaak zijn er
// stukken van dezelfde prijs met andere voordelen, zodat je kiest wat voor figuur je wordt.
// Zevende plek: een geluksdobbelsteen. Die gebruik je: 10 minuten een percentage extra op je winst in Kluiskraker en
// Visdief, daarna 5 uur rust. Andere casinospellen (roulette, blackjack, poker, mines, hoogvlieger, munt) houden de echte kansen.
// Effecten (fitFx in state.js): kans = %-punten slaagkans, buit/inc/xp/bail/cd/flee/en/car/esc = fractie (.05 = 5%),
// heat = minder hitte (negatief = opvallend, dus meer hitte).
const FIT_SLOTS=[{id:'hoofd',n:'Hoofd'},{id:'kleding',n:'Kleding'},{id:'schoenen',n:'Schoenen'},{id:'nek',n:'Ketting'},{id:'pols',n:'Pols'},{id:'ring',n:'Ring'},{id:'geluk',n:'Geluk'}];
const FIT_STYLE_SLOTS=6; // geluk telt niet mee voor een set
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
 {id:'snapback',slot:'hoofd',st:'patser',n:'Snapback met platte klep',d:'Rood, gouden embleem. Iedereen weet dat je er bent.',p:400,r:1,fx:{buit:.02,heat:-.02}},
 {id:'helm',slot:'hoofd',st:'sport',n:'Motorhelm met donker vizier',d:'Op de scooter ziet niemand wie je bent, en je bent sneller weg.',p:2500,r:3,fx:{flee:.08,heat:.03}},
 {id:'pruik',slot:'hoofd',st:'stil',n:'Pruik en plaksnor',d:'Een ander kapsel en een snor. De camera ziet een vreemde.',p:12000,r:4,fx:{heat:.08,kans:1,bail:-.05}},
 {id:'grill',slot:'hoofd',st:'patser',n:'Gouden grill',d:'Goud over je tanden. Een lach die niemand vergeet.',p:24000,r:6,fx:{buit:.04,inc:.04,heat:-.04}},
 // kleding
 {id:'hoodie',slot:'kleding',st:'stil',n:'Grijze hoodie',d:'Capuchon op, handen in de buidel. Je bent iedereen en niemand.',p:250,r:0,fx:{kans:1,heat:.05}},
 {id:'trainingspak',slot:'kleding',st:'sport',n:'Trainingspak',d:'Rits tot boven. Je bent sneller weg dan zij uit de auto zijn.',p:700,r:1,fx:{flee:.08,en:.04}},
 {id:'werkjas',slot:'kleding',st:'stil',n:'Werkjas met reflectie',d:'Met een hesje loop je overal binnen. Niemand vraagt wat je komt doen.',p:1800,r:2,fx:{kans:2,car:.04}},
 {id:'designer',slot:'kleding',st:'patser',n:'Designerjas',d:'Felle kleuren, dure stof. Je ziet er rijk uit en dat merken ze aan de prijs. De politie ook.',p:14000,r:4,fx:{buit:.06,inc:.03,heat:-.06}},
 {id:'jas',slot:'kleding',st:'stil',n:'Lange zwarte jas',d:'Genoeg binnenzakken voor alles wat niemand mag zien.',p:26000,r:5,fx:{kans:3,heat:.06}},
 {id:'pak',slot:'kleding',st:'zaken',n:'Italiaans maatpak',d:'Op maat gesneden in Napels. Rechters en bankdirecteuren praten anders tegen je.',p:55000,r:6,fx:{inc:.08,bail:.12,xp:.02}},
 {id:'velours',slot:'kleding',st:'patser',n:'Velours joggingpak',d:'Bordeauxrood met een gouden rits. Comfortabel en niet te missen.',p:700,r:1,fx:{buit:.02,en:.02,heat:-.02}},
 {id:'bomber',slot:'kleding',st:'sport',n:'Bomberjack',d:'Licht, warm en met een oranje voering. Gemaakt om in te rennen.',p:1800,r:2,fx:{flee:.06,en:.03,cd:.02}},
 {id:'leer',slot:'kleding',st:'stil',n:'Leren motorjas',d:'Zwart leer, schuine rits. Je ziet eruit als iedereen op de Wallen.',p:14000,r:4,fx:{kans:2,esc:.03,heat:.03}},
 {id:'trench',slot:'kleding',st:'zaken',n:'Trenchcoat',d:'Beige, met een ceintuur. Advocaten en rechercheurs dragen hem ook.',p:26000,r:5,fx:{inc:.05,bail:.06,heat:.03}},
 {id:'bont',slot:'kleding',st:'patser',n:'Bontjas',d:'Lang, zwaar en duur. Je loopt een club binnen zonder te wachten.',p:120000,r:7,fx:{buit:.07,inc:.06,heat:-.08}},
 {id:'smoking',slot:'kleding',st:'zaken',n:'Smoking',d:'Zwart met satijnen revers. Voor galadiners met burgemeesters en bankiers.',p:180000,r:8,fx:{inc:.10,xp:.04,bail:.08}},
 // schoenen
 {id:'sneakers',slot:'schoenen',st:'sport',n:'Witte sneakers',d:'Schoon, licht en snel.',p:180,r:0,fx:{flee:.05}},
 {id:'kisten',slot:'schoenen',st:'stil',n:'Zwarte kisten',d:'Stalen neus. Handig bij deuren en bij ruzie.',p:650,r:1,fx:{kans:1,esc:.03}},
 {id:'renners',slot:'schoenen',st:'sport',n:'Hardloopschoenen',d:'Licht, veerkrachtig en gemaakt om weg te rennen.',p:1500,r:2,fx:{flee:.12,cd:.03}},
 {id:'instappers',slot:'schoenen',st:'zaken',n:'Italiaanse instappers',d:'Zacht leer, geen veters. Je hoeft nergens heen te rennen.',p:18000,r:5,fx:{inc:.03,bail:.05}},
 {id:'laarzen',slot:'schoenen',st:'patser',n:'Laarzen van slangenleer',d:'Niemand vergeet wie die laarzen draagt. De politie ook niet.',p:90000,r:8,fx:{buit:.05,xp:.03,heat:-.04}},
 {id:'slippers',slot:'schoenen',st:'sport',n:'Badslippers met witte sokken',d:'Niet mooi, wel lekker. Je bent uitgerust voor je het weet.',p:180,r:0,fx:{en:.03}},
 {id:'basket',slot:'schoenen',st:'patser',n:'Hoge basketbalschoenen',d:'Wit en rood, net uit de doos. Snel en opvallend.',p:1500,r:2,fx:{buit:.02,flee:.06}},
 {id:'werkschoen',slot:'schoenen',st:'stil',n:'Veiligheidsschoenen',d:'Met stalen neus en zool. Zo loop je elke bouwplaats en garage in.',p:4500,r:3,fx:{kans:2,car:.04}},
 {id:'gympen',slot:'schoenen',st:'stil',n:'Zwarte gympen',d:'Zachte zool, geen geluid. Ideaal voor een trappenhuis om drie uur \'s nachts.',p:18000,r:4,fx:{kans:2,flee:.06}},
 {id:'brogues',slot:'schoenen',st:'zaken',n:'Handgemaakte brogues',d:'Bruin leer met gaatjes. De schoenen van mensen die nooit rennen.',p:40000,r:6,fx:{inc:.05,xp:.02,bail:.05}},
 // nek
 {id:'kruisje',slot:'nek',st:'stil',n:'Klein kruisje',d:'Van je oma. Brengt geluk, zegt ze.',p:300,r:0,fx:{esc:.02,bail:.03}},
 {id:'koptel',slot:'nek',st:'sport',n:'Koptelefoon om je nek',d:'Muziek aan, wereld uit. Je houdt het langer vol.',p:800,r:1,fx:{en:.04,cd:.02}},
 {id:'zilver',slot:'nek',st:'patser',n:'Zilveren schakelketting',d:'Een eerste teken dat het goed gaat.',p:1200,r:1,fx:{buit:.02,inc:.02}},
 {id:'das',slot:'nek',st:'zaken',n:'Zijden das',d:'Donkerrood, strak geknoopt. Voor afspraken waar je niet te laat komt.',p:6000,r:4,fx:{inc:.04,bail:.08}},
 {id:'goud',slot:'nek',st:'patser',n:'Gouden ketting',d:'Dik en zwaar. Laat zien dat het je goed gaat, en dat trekt goede zaken aan.',p:16000,r:3,fx:{inc:.07,buit:.03,heat:-.04}},
 {id:'diamant',slot:'nek',st:'patser',n:'Ketting met diamanten',d:'Een hanger die het licht vangt in elke club van de stad.',p:250000,r:9,fx:{inc:.12,xp:.03,heat:-.06}},
 {id:'bandana',slot:'nek',st:'stil',n:'Bandana',d:'Om je nek, of over je neus als het moet.',p:1200,r:1,fx:{heat:.05}},
 {id:'dogtag',slot:'nek',st:'sport',n:'Hondenpenning',d:'Een kogelketting met je naam. Je bent niet zomaar iemand die opgeeft.',p:3000,r:2,fx:{esc:.04,flee:.04}},
 {id:'sjaal',slot:'nek',st:'zaken',n:'Kasjmier sjaal',d:'Zacht, grijs en duur. Mensen luisteren beter als je zachtjes praat.',p:16000,r:3,fx:{inc:.05,xp:.02}},
 {id:'medaillon',slot:'nek',st:'zaken',n:'Gouden medaillon',d:'Met een foto van je moeder erin. Familie gaat voor alles.',p:60000,r:6,fx:{xp:.04,esc:.03,bail:.05}},
 // pols
 {id:'digitaal',slot:'pols',st:'sport',n:'Digitaal horloge',d:'Met stopwatch. Je weet precies hoe lang je hebt.',p:90,r:0,fx:{cd:.02}},
 {id:'duik',slot:'pols',st:'stil',n:'Stalen duikhorloge',d:'Waterdicht en verlicht in het donker.',p:2200,r:2,fx:{cd:.04,kans:1}},
 {id:'goudhorloge',slot:'pols',st:'patser',n:'Gouden horloge',d:'Zwaar om je pols en niet te missen aan de bar.',p:30000,r:4,fx:{buit:.04,inc:.04,heat:-.03}},
 {id:'zwitsers',slot:'pols',st:'zaken',n:'Zwitsers horloge',d:'Handgemaakt, vijftig jaar garantie. Mensen met macht herkennen het meteen.',p:420000,r:9,fx:{inc:.08,xp:.05}},
 {id:'armband',slot:'pols',st:'stil',n:'Leren armband',d:'Een simpel bandje. Valt niet op, zit altijd goed.',p:300,r:1,fx:{esc:.02,heat:.02}},
 {id:'smartwatch',slot:'pols',st:'sport',n:'Sporthorloge met hartslag',d:'Telt je stappen en je rust. Je weet precies wanneer je weer kunt.',p:2200,r:3,fx:{cd:.03,en:.04}},
 {id:'chrono',slot:'pols',st:'zaken',n:'Stalen chronograaf',d:'Drie kleine wijzerplaten en een stopwatch. Afspraak is afspraak.',p:30000,r:5,fx:{inc:.05,cd:.03}},
 {id:'tennis',slot:'pols',st:'patser',n:'Diamanten armband',d:'Een rij steentjes die schittert onder elke lamp.',p:30000,r:6,fx:{buit:.05,heat:-.04}},
 // ring
 {id:'trouwring',slot:'ring',st:'stil',n:'Gladde trouwring',d:'Niemand verdenkt een getrouwde man.',p:400,r:0,fx:{heat:.03}},
 {id:'zegel',slot:'ring',st:'stil',n:'Zilveren zegelring',d:'Met een wapen dat niemand kent. Ziet er oud en betrouwbaar uit.',p:900,r:1,fx:{bail:.04,esc:.02}},
 {id:'kampioen',slot:'ring',st:'sport',n:'Kampioensring',d:'Van een kickboksgala in Den Haag. Of het jouwe was, vraagt niemand.',p:2500,r:2,fx:{flee:.04,en:.03}},
 {id:'pinkring',slot:'ring',st:'patser',n:'Gouden pinkring',d:'Met een rode steen. De ring van iemand die geld uitleent.',p:9000,r:3,fx:{buit:.03,inc:.03,heat:-.02}},
 {id:'famring',slot:'ring',st:'zaken',n:'Familiering',d:'Zwaar goud met een donkerrode steen. Oude families kussen hem.',p:45000,r:5,fx:{xp:.03,inc:.04,bail:.06}},
 {id:'zwartdiamant',slot:'ring',st:'patser',n:'Ring met zwarte diamant',d:'Platina, met een steen zo zwart als je reputatie.',p:300000,r:8,fx:{buit:.06,inc:.08,heat:-.05}},
 // geluk: gebruik je, niet dragen voor een setbonus. luck = extra op je winst in de slots, 10 minuten, daarna 5 uur rust.
 {id:'dob1',slot:'geluk',st:'geluk',n:'Gebroken dobbelsteen',d:'Een hoekje eraf en een barst erdoor. Een heel klein beetje geluk.',p:2500,r:0,luck:.01,dc:['#8a8f98','#5d626b','#454950']},
 {id:'dob2',slot:'geluk',st:'geluk',n:'Houten dobbelsteen',d:'Met de hand gesneden door een oude man in de Jordaan.',p:20000,r:2,luck:.02,dc:['#a8743f','#86582d','#6b4523']},
 {id:'dob5',slot:'geluk',st:'geluk',n:'Benen dobbelsteen',d:'Uit een speelhol in Marseille. Hij heeft vaker gewonnen dan verloren.',p:150000,r:4,luck:.05,dc:['#e8dcc2','#c9bb9b','#ab9e80']},
 {id:'dob8',slot:'geluk',st:'geluk',n:'Zilveren dobbelsteen',d:'Massief zilver, gewogen tot op de milligram.',p:750000,r:6,luck:.08,dc:['#dfe3e8','#b4bac3','#8f969f']},
 {id:'dob15',slot:'geluk',st:'geluk',n:'Gouden dobbelsteen',d:'Alleen voor High rollers. Het casino ziet hem liever niet.',p:5000000,r:0,hr:1,luck:.15,dc:['#f2c230','#d9a520','#b8890f']}];
const LUCK_MIN=10,LUCK_CD=5*60; // minuten actief, minuten rust
const luckPct=()=>S.luck&&S.luck.until>now()?(+S.luck.pct||0):0;
const luckLeft=()=>S.luck?Math.max(0,S.luck.until-now()):0;
const luckWait=()=>S.luck?Math.max(0,S.luck.ready-now()):0;
const FIT_FX={kans:['kans',1],buit:['buit',0],inc:['inkomen bedrijven',0],xp:['XP',0],bail:['borg',0,1],cd:['wachttijd klussen',0,1],flee:['makkelijker vluchten',0],
 en:['sneller energie',0],car:['waarde auto\'s',0],esc:['ontsnappen uit de bajes',0],heat:['hitte',0,1]};
const fitS=()=>S.fit&&S.fit.own?S.fit:(S.fit={own:{},wear:{}});
const fitItem=id=>OUTFITS.find(o=>o.id===id);
const fitWorn=()=>FIT_SLOTS.map(s=>fitItem(fitS().wear[s.id])).filter(o=>o&&FIT_STYLES[o.st]);
function fitSets(list){const c={};(list||fitWorn()).forEach(o=>{if(FIT_STYLES[o.st])c[o.st]=(c[o.st]||0)+1});return c}
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
function dollParts(w){const g=id=>w.includes(id);const o={back:'',legs:'',shoes:'',top:'',neck:'',head:'',face:'',wrist:'',ring:''};
 // broek: hoort bij het pak of het trainingspak, anders een donkere spijkerbroek
 const pants=g('pak')?'#262b35':g('smoking')?'#121317':g('trainingspak')?'#1b2a44':g('velours')?'#5e1a33':DOLL.jeans;
 o.legs=`<path d="${LEG_L}" stroke="${pants}" stroke-width="23" stroke-linecap="round" fill="none"/><path d="${LEG_R}" stroke="${pants}" stroke-width="23" stroke-linecap="round" fill="none"/>
  <path d="M74 190h52v22H74z" fill="${pants}"/>${g('trainingspak')?`<path d="M77 202 L75 346M123 202 L125 346" stroke="#ff7a1a" stroke-width="2"/>`:''}${g('pak')?`<path d="M88 206 L86 340M112 206 L114 340" stroke="#323845" stroke-width="1"/>`:''}${g('smoking')?`<path d="M88 206 L86 340M112 206 L114 340" stroke="#2a2b31" stroke-width="2"/>`:''}`;
 // schoenen
 const shoe=(c,sole,h)=>`<path d="M74 ${352-h} L95 ${352-h} L97 362 L62 362 Q62 354 74 350Z" fill="${c}"/><path d="M126 ${352-h} L105 ${352-h} L103 362 L138 362 Q138 354 126 350Z" fill="${c}"/>${sole?`<path d="M62 362h35M103 362h35" stroke="${sole}" stroke-width="3"/>`:''}`;
 o.shoes=g('sneakers')?shoe('#e9e6df','#bdb9b0',0):g('renners')?shoe('#ff7a1a','#f4f1ea',0)+`<path d="M70 354h16M114 354h16" stroke="#f4f1ea" stroke-width="1.6"/>`:g('kisten')?shoe('#121316','#000',14)+`<path d="M78 342h14M108 342h14" stroke="#2c2f35" stroke-width="1.5"/>`
  :g('instappers')?shoe('#5a3a22','#3b2513',0)+`<path d="M74 352h10M116 352h10" stroke="#8a6343" stroke-width="2"/>`:g('laarzen')?shoe('#7a6644','#3a2f1e',16)+`<path d="M76 340l4 4 4-4 4 4 4-4M106 340l4 4 4-4 4 4 4-4" stroke="#4d3f27" stroke-width="1.4" fill="none"/>`
  :g('slippers')?`<path d="M77 338h16v14H77zM107 338h16v14h-16z" fill="#efece6"/>`+shoe('#111214','#000',0)+`<path d="M70 352h22M108 352h22" stroke="#2b2e34" stroke-width="3"/>`
  :g('basket')?shoe('#e9e6df','#c43a3a',12)+`<path d="M78 344h14M108 344h14" stroke="#c43a3a" stroke-width="4"/>`:g('werkschoen')?shoe('#8a6a2e','#3a2c12',10)+`<path d="M63 356h10M127 356h10" stroke="#a8acb3" stroke-width="3"/>`
  :g('gympen')?shoe('#18191d','#55595f',0):g('brogues')?shoe('#4a2f1c','#2a1a0f',0)+`<path d="M70 354h18M112 354h18" stroke="#7d5638" stroke-width="1.6" stroke-dasharray="1 2"/>`:shoe('#3a3f48','#24282f',0);
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
 else if(g('velours')){o.top=arms+sleeves('#5e1a33',212,18)+torso('#5e1a33',202)+`<path d="M100 92v110" stroke="#e8b923" stroke-width="2"/><path d="M86 92 L100 104 L114 92" stroke="#7a2443" stroke-width="3" fill="none"/><path d="M64 122 Q78 114 90 122M110 122 Q122 114 136 122" stroke="rgba(255,255,255,.07)" stroke-width="5" fill="none"/>`}
 else if(g('bomber')){o.top=arms+sleeves('#4b5a3a',210,19)+torso('#4b5a3a',196)+`<path d="M63 189h74v9H63z" fill="#38442b"/><path d="M84 92 Q100 102 116 92" stroke="#ff7a1a" stroke-width="3.5" fill="none"/><path d="M100 97v100" stroke="#2f3a25" stroke-width="2"/><path d="M47 206l10 1M153 206l-10 1" stroke="#38442b" stroke-width="7" stroke-linecap="round"/><path d="M60 132h13" stroke="#3d4a2f" stroke-width="5"/>`}
 else if(g('leer')){o.top=arms+sleeves('#17181c',212,18)+torso('#17181c',200)+`<path d="M90 95 L112 200" stroke="#4a4e57" stroke-width="2"/><path d="M84 94 L97 121 L86 127M116 94 L107 112" stroke="#2c2e34" stroke-width="2.5" fill="none"/><path d="M66 122 Q80 113 92 119" stroke="rgba(255,255,255,.09)" stroke-width="4" fill="none"/><circle cx="72" cy="162" r="1.6" fill="#8a8f98"/><circle cx="128" cy="162" r="1.6" fill="#8a8f98"/><path d="M63 196h74" stroke="#2c2e34" stroke-width="4"/>`}
 else if(g('trench')){o.top=arms+sleeves('#a08a63',214,19)+`<path d="M62 98 C82 88 118 88 138 98 L146 120 L146 282 L54 282 L54 120Z" fill="#a08a63"/><path d="M84 94 L100 128 L116 94" fill="${DOLL.tee}"/><path d="M82 94 L99 130 L88 146M118 94 L101 130 L112 146" stroke="#8a7550" stroke-width="2.5" fill="none"/><path d="M55 186h90v8H55z" fill="#7d6a4a"/><rect x="96" y="184" width="8" height="12" fill="none" stroke="#c9b48a" stroke-width="1.5"/><g fill="#6e5c3e"><circle cx="90" cy="150" r="2"/><circle cx="110" cy="150" r="2"/><circle cx="90" cy="168" r="2"/><circle cx="110" cy="168" r="2"/></g><path d="M100 194v88" stroke="#8a7550" stroke-width="1.5"/>`}
 else if(g('bont')){const fl=(x,y)=>`<circle cx="${x}" cy="${y}" r="6.5"/>`;let fur='';for(let x=56;x<=144;x+=8)fur+=fl(x,272);[[80,94],[86,104],[92,114],[98,122],[120,94],[114,104],[108,114],[102,122],[48,210],[56,212],[152,210],[144,212]].forEach(([x,y])=>{fur+=fl(x,y)});
  o.top=arms+sleeves('#6b4f3a',212,22)+`<path d="M60 98 C82 86 118 86 140 98 L148 120 L148 272 L52 272 L52 120Z" fill="#6b4f3a"/><path d="M80 94 L100 126 L120 94" fill="${DOLL.tee}"/><g fill="#8a6a50">${fur}</g><path d="M70 150 Q76 200 68 250M130 150 Q124 200 132 250" stroke="#5d4433" stroke-width="2" fill="none"/>`}
 else if(g('smoking')){o.top=arms+sleeves('#121317',214,17)+torso('#121317',206)+`<path d="M86 93 L100 140 L114 93Z" fill="#f2efe8"/><path d="M84 93 L99 142 L90 160M116 93 L101 142 L110 160" stroke="#2a2b31" stroke-width="4.5" fill="none"/>${g('das')?'':`<path d="M91 99 l9 3.5 9-3.5 v8 l-9-3.5 -9 3.5z" fill="#0b0b0d"/>`}<circle cx="100" cy="164" r="2" fill="#2a2b31"/><path d="M118 124h10" stroke="#f2efe8" stroke-width="2"/>`}
 else o.top=arms+sleeves(DOLL.tee,132,18)+torso(DOLL.tee,202);
 // handen
 o.top+=`<circle cx="48" cy="222" r="7" fill="${DOLL.body2}"/><circle cx="152" cy="222" r="7" fill="${DOLL.body2}"/>`;
 // nek
 if(g('das'))o.neck=g('pak')||g('smoking')?`<path d="M95 95h10l-2 6h-6z" fill="#8c1d2c"/><path d="M97 101h6l2.4 32-5.4 6-5.4-6z" fill="#7a1626"/>`:`<path d="M95 96h10l-2 6h-6z" fill="#8c1d2c"/><path d="M97 102h6l4 64-7 9-7-9z" fill="#7a1626"/>`;
 if(g('kruisje'))o.neck+=`<path d="M90 92 Q100 122 110 92" stroke="#c9cdd3" stroke-width="1" fill="none"/><path d="M100 118v12M96 122h8" stroke="#d9dde3" stroke-width="2"/>`;
 if(g('zilver'))o.neck+=`<path d="M88 92 Q100 128 112 92" stroke="#d0d4da" stroke-width="2.6" stroke-dasharray="3 1.6" fill="none"/>`;
 if(g('goud'))o.neck+=`<path d="M86 92 Q100 134 114 92" stroke="#e8b923" stroke-width="4.5" stroke-dasharray="4 2" fill="none"/><path d="M86 92 Q100 134 114 92" stroke="#fff3b0" stroke-width="1" stroke-dasharray="1 5" fill="none" opacity=".6"/>`;
 if(g('diamant'))o.neck+=`<path d="M87 92 Q100 126 113 92" stroke="#e8b923" stroke-width="2.4" fill="none"/><path d="M100 122 l7 8 -7 12 -7 -12z" fill="#bfefff"/><path d="M100 122 l7 8h-14z" fill="#e8fbff"/><path d="M109 118 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#fff" class="fit-spark"/>`;
 if(g('koptel'))o.neck+=`<path d="M80 96 Q100 120 120 96" stroke="#111318" stroke-width="5" fill="none"/><rect x="72" y="88" width="13" height="17" rx="5" fill="#111318"/><rect x="115" y="88" width="13" height="17" rx="5" fill="#111318"/><rect x="74" y="92" width="9" height="9" rx="3" fill="#ff7a1a"/><rect x="117" y="92" width="9" height="9" rx="3" fill="#ff7a1a"/>`;
 if(g('bandana'))o.neck+=`<path d="M84 91 L116 91 L100 117Z" fill="#7a1a24"/><path d="M84 91 L116 91" stroke="#5e131c" stroke-width="3"/><g fill="#e9e6df" opacity=".55"><circle cx="93" cy="97" r="1.1"/><circle cx="105" cy="98" r="1.1"/><circle cx="100" cy="106" r="1.1"/><circle cx="97" cy="111" r=".9"/></g>`;
 if(g('dogtag'))o.neck+=`<path d="M89 92 Q100 124 111 92" stroke="#b8bdc5" stroke-width="1.3" stroke-dasharray="1.2 1" fill="none"/><rect x="95.5" y="117" width="9" height="13" rx="2.2" fill="#c9ced6"/><path d="M98 121h4M98 124h4" stroke="#8a8f98" stroke-width=".8"/>`;
 if(g('sjaal'))o.neck+=`<path d="M83 89 Q100 105 117 89 L119 98 Q100 113 81 98Z" fill="#8c8f96"/><path d="M103 101 l7 0 l3 46 l-8 2z" fill="#7d8087"/><path d="M106 143h7M106 147h7" stroke="#62656c" stroke-width="1"/>`;
 if(g('medaillon'))o.neck+=`<path d="M88 92 Q100 124 112 92" stroke="#e8b923" stroke-width="1.6" fill="none"/><ellipse cx="100" cy="127" rx="5.5" ry="7" fill="#e8b923"/><ellipse cx="100" cy="127" rx="3.4" ry="4.8" fill="none" stroke="#b8890f" stroke-width="1"/>`;
 // hoofd en gezicht
 if(g('pet'))o.head=`<path d="M80 46 Q80 22 100 22 Q120 22 120 46Z" fill="#111317"/><path d="M78 44 Q100 54 122 44 L124 50 Q100 60 76 50Z" fill="#08090b"/><circle cx="100" cy="23" r="2" fill="#2a2d34"/>`;
 if(g('muts'))o.head=`<path d="M79 48 Q79 18 100 18 Q121 18 121 48Z" fill="#7d2632"/><path d="M78 42h44v9H78z" fill="#6a1f2a"/><path d="M84 30v10M92 26v14M100 24v16M108 26v14M116 30v10" stroke="#8f3340" stroke-width="1.5"/>`;
 if(g('hoed'))o.head=`<path d="M66 46 Q100 56 134 46 Q132 52 100 56 Q68 52 66 46Z" fill="#221d1a"/><path d="M80 46 L84 24 Q100 16 116 24 L120 46Z" fill="#2b2420"/><path d="M80 40h40v6H80z" fill="#8c1d2c"/><path d="M92 22 Q100 28 108 22" stroke="#1a1513" stroke-width="2" fill="none"/>`;
 if(g('bivak'))o.head=`<path d="M80 52 Q78 24 100 24 Q122 24 120 52 L118 72 Q100 82 82 72Z" fill="#0c0d10"/><path d="M86 48h28v9H86z" fill="${DOLL.body2}"/><circle cx="93" cy="52" r="2" fill="#0c0d10"/><circle cx="107" cy="52" r="2" fill="#0c0d10"/>`;
 if(g('snapback'))o.head=`<path d="M80 46 Q80 22 100 22 Q120 22 120 46Z" fill="#a3202f"/><path d="M75 43h50v6H75z" fill="#7a1622"/><rect x="94" y="30" width="12" height="7" rx="1" fill="#e8b923"/>`;
 if(g('helm'))o.head=`<path d="M76 54 Q74 19 100 19 Q126 19 124 54 L122 70 Q100 79 78 70Z" fill="#1d2430"/><path d="M80 43 h40 v13 q-20 7 -40 0z" fill="#0a0d12"/><path d="M84 46h11" stroke="rgba(169,220,255,.4)" stroke-width="2"/><path d="M88 24 Q100 21 113 25" stroke="#3a4558" stroke-width="2.5" fill="none"/>`;
 if(g('pruik')){o.head=`<path d="M79 46 Q77 20 100 20 Q123 20 121 46 Q117 33 100 32 Q83 33 79 46Z" fill="#4a3524"/><path d="M79 46 Q76 56 80 64M121 46 Q124 56 120 64" stroke="#4a3524" stroke-width="4" fill="none"/>`;o.face+=`<path d="M90 61 q5 -3.5 10 0 q5 -3.5 10 0 q-5 4.5 -10 1 q-5 3.5 -10 -1z" fill="#3a2a1c"/>`}
 if(g('grill'))o.face+=`<rect x="92" y="60" width="16" height="4.6" rx="1.6" fill="#e8b923"/><path d="M96 60v4.6M100 60v4.6M104 60v4.6" stroke="#b8890f" stroke-width=".8"/>`;
 if(g('bril'))o.face+=`<path d="M84 49h13q1 9-6 10-7-1-7-10zM103 49h13q0 9-7 10-7-1-6-10z" fill="#1b1d22"/><path d="M84 49h13q1 9-6 10-7-1-7-10zM103 49h13q0 9-7 10-7-1-6-10z" stroke="#d9a520" stroke-width="1.3" fill="none"/><path d="M97 50h6" stroke="#d9a520" stroke-width="1.3"/><path d="M87 51l5 5M106 51l5 5" stroke="rgba(255,255,255,.25)" stroke-width="1.5"/>`;
 // pols (linker hand van de pop = rechts in beeld)
 const watch=(band,face,dial)=>`<path d="M144 206 l14 2" stroke="${band}" stroke-width="7" stroke-linecap="round"/><circle cx="151" cy="207" r="5.5" fill="${face}"/><circle cx="151" cy="207" r="3.6" fill="${dial}"/>`;
 o.wrist=g('digitaal')?`<path d="M144 206 l14 2" stroke="#16181c" stroke-width="7" stroke-linecap="round"/><rect x="146" y="202" width="10" height="9" rx="1.5" fill="#16181c"/><rect x="148" y="204" width="6" height="4" fill="#9fd8a8"/>`
  :g('duik')?watch('#9aa1ab','#c9ced6','#1d2b44'):g('goudhorloge')?watch('#d9a520','#f2c230','#f6e7b0'):g('zwitsers')?watch('#d9a520','#e8b923','#16233f')+`<path d="M151 207 l0-2.6M151 207 l2 1" stroke="#e8b923" stroke-width=".9"/>`
  :g('armband')?`<path d="M144 206 l14 2" stroke="#6b4a2e" stroke-width="5" stroke-linecap="round"/>`:g('smartwatch')?`<path d="M144 206 l14 2" stroke="#16181c" stroke-width="7" stroke-linecap="round"/><rect x="145.5" y="201.5" width="11" height="11" rx="2.5" fill="#16181c"/><rect x="147.5" y="203.5" width="7" height="7" rx="1.5" fill="#0d2a1d"/><path d="M148.5 207h1.5l1-2 1.5 4 1-2h1" stroke="#3fe395" stroke-width=".8" fill="none"/>`
  :g('chrono')?watch('#9aa1ab','#c9ced6','#1b1d22')+`<circle cx="149.5" cy="206" r=".9" fill="#c9ced6"/><circle cx="152.5" cy="206" r=".9" fill="#c9ced6"/><circle cx="151" cy="208.6" r=".9" fill="#c9ced6"/>`
  :g('tennis')?`<path d="M144 206 l14 2" stroke="#e8fbff" stroke-width="3.6" stroke-dasharray="1.6 1.3" stroke-linecap="round"/><path d="M152 203 l.8 2 2 .8 -2 .8 -.8 2 -.8 -2 -2 -.8 2 -.8z" fill="#fff" class="fit-spark2"/>`:'';
 // ring (rechterhand van de pop = links in beeld)
 const ring=(m,st)=>`<circle cx="47.5" cy="227" r="2.7" fill="none" stroke="${m}" stroke-width="1.8"/>${st?`<circle cx="47.5" cy="224.3" r="1.8" fill="${st}"/>`:''}`;
 o.ring=g('trouwring')?ring('#e8b923'):g('zegel')?ring('#c9ced6')+`<rect x="45" y="222.4" width="5" height="3.4" rx=".6" fill="#c9ced6"/>`:g('kampioen')?ring('#e8b923','#4d7dff')+`<circle cx="47.5" cy="224.3" r="2.6" fill="none" stroke="#e8b923" stroke-width=".8"/>`
  :g('pinkring')?ring('#e8b923','#d12b3f'):g('famring')?ring('#d9a520','#7a1626')+`<circle cx="47.5" cy="224.3" r="2.5" fill="none" stroke="#d9a520" stroke-width=".9"/>`:g('zwartdiamant')?ring('#dfe3e8','#0b0b0d')+`<path d="M50 221 l.6 1.4 1.4 .6 -1.4 .6 -.6 1.4 -.6 -1.4 -1.4 -.6 1.4 -.6z" fill="#fff" class="fit-spark2"/>`:'';
 return o}
function dollSvg(wear,opts){opts=opts||{};const w=Object.values(wear||{}).filter(Boolean),P=dollParts(w);
 const vb=opts.vb||'0 0 200 372';
 return `<svg class="doll" viewBox="${vb}" role="img" aria-label="${opts.label||'Outfit'}"${opts.vb?' preserveAspectRatio="xMidYMid meet"':''}>
  ${opts.vb?'':`<ellipse cx="100" cy="366" rx="58" ry="6" fill="rgba(0,0,0,.45)"/>`}
  ${P.back}${P.legs}${P.shoes}${P.top}
  <path d="M93 72h14v22H93z" fill="${DOLL.body}"/>
  <ellipse cx="100" cy="50" rx="19" ry="23" fill="${DOLL.body2}"/><path d="M84 40 Q100 28 116 40" stroke="${DOLL.body}" stroke-width="3" fill="none" opacity=".6"/>
  ${P.face}${P.head}${P.neck}${P.wrist}${P.ring}</svg>`}
const FIT_VB={hoofd:'64 14 72 72',kleding:'34 76 132 156',schoenen:'52 318 96 52',nek:'66 78 68 72',pols:'128 186 46 46',ring:'31 207 34 34'};
// geluksdobbelsteen: een kubus in drie tinten, met ogen op de bovenkant en de zijkanten; de gebroken heeft een barst
function diceSvg(o,big){const [t,l,r]=o.dc||['#ddd','#bbb','#999'],pip=o.id==='dob15'?'#7a4b00':o.id==='dob8'?'#4a5058':'#1b1d22';
 return `<svg class="dice${big?' big':''}" viewBox="0 0 64 64" role="img" aria-label="${esc(o.n)}"><ellipse cx="32" cy="57" rx="20" ry="4" fill="rgba(0,0,0,.4)"/>
  <path d="M32 8 L54 20 L32 32 L10 20Z" fill="${t}"/><path d="M10 20 L32 32 L32 56 L10 44Z" fill="${l}"/><path d="M54 20 L32 32 L32 56 L54 44Z" fill="${r}"/>
  <g fill="${pip}"><ellipse cx="32" cy="20" rx="3" ry="1.8"/><ellipse cx="18" cy="31" rx="1.8" ry="2.4"/><ellipse cx="24" cy="44" rx="1.8" ry="2.4"/><ellipse cx="40" cy="30" rx="1.8" ry="2.4"/><ellipse cx="46" cy="37" rx="1.8" ry="2.4"/><ellipse cx="40" cy="44" rx="1.8" ry="2.4"/><ellipse cx="46" cy="27" rx="1.6" ry="2.1"/></g>
  <path d="M32 8 L54 20 L32 32 L10 20Z" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>
  ${o.id==='dob1'?'<path d="M14 23 L22 30 L19 36 L26 44" stroke="#2c2f35" stroke-width="1.6" fill="none"/><path d="M54 20 L50 18 L49 24Z" fill="#2c3139"/>':''}
  ${o.id==='dob2'?'<path d="M12 27 Q22 30 30 40M12 34 Q20 38 30 48M36 36 Q44 32 52 26" stroke="#6b4523" stroke-width="1" fill="none" opacity=".7"/>':''}
  ${o.luck>=.08?`<path d="M50 9 l1.5 3.5 3.5 1.5 -3.5 1.5 -1.5 3.5 -1.5 -3.5 -3.5 -1.5 3.5 -1.5z" fill="#fff" class="fit-spark3"/>`:''}</svg>`}
const fitThumb=o=>o.slot==='geluk'?diceSvg(o):dollSvg({[o.slot]:o.id},{vb:FIT_VB[o.slot],label:o.n});

// ---------- Pagina ----------
const fitUI={tab:'kleding',prev:null};
function fitPreview(id){fitUI.prev=id;const el=document.getElementById('fitDoll');if(!el)return;const w=Object.assign({},fitS().wear);if(id){const o=fitItem(id);if(o)w[o.slot]=o.id}
 el.innerHTML=dollSvg(w);el.classList.toggle('try',!!id)}
function fitSumHtml(){const t=fitTotals(),c=fitSets(),chips=fitChips(t);
 return `<div class="fit-sum"><span class="label">Wat je outfit je nu geeft</span><div class="fit-chips">${chips||'<em>Nog niks. Trek iets aan.</em>'}</div></div>
  <div class="fit-sets">${Object.entries(FIT_STYLES).map(([k,s])=>{const n=c[k]||0,on=n>=3;return `<div class="fit-set ${on?'on':''}" style="--sc:${s.col}"><div><b>${s.n}</b><span>${n}/${FIT_STYLE_SLOTS}</span></div>
   <i class="fit-pips">${Array.from({length:FIT_STYLE_SLOTS},(_,i)=>`<i class="${i<n?'f':''} ${i===2||i===4?'m':''}"></i>`).join('')}</i><small>${n>=5?'Volle set: ':n>=3?'Actief: ':'Vanaf 3: '}${fitFxStrs(n>=5?s.set5:s.set3).map(x=>x.t).join(', ')}${n>=3&&n<5?'. Bij 5 nog meer':''}</small></div>`}).join('')}</div>`}
V.look=()=>{const ri=rankIdx(S.xp),F=fitS(),tab=fitUI.tab,worn=F.wear[tab];
 const items=OUTFITS.filter(o=>o.slot===tab).sort((a,b)=>a.r-b.r||a.p-b.p);
 const card=o=>{const own=!!F.own[o.id],on=F.wear[o.slot]===o.id,hrLock=o.hr&&tier()<2,lock=ri<o.r||hrLock,poor=S.cash<o.p,s=FIT_STYLES[o.st]||{n:'Geluk +'+Math.round((o.luck||0)*100)+'%',col:'#f2c230'};
  const fxH=o.luck?`<span class="g">+${Math.round(o.luck*100)}% op je winst in Kluiskraker en Visdief</span><span class="g">${LUCK_MIN} min actief</span><span>${LUCK_CD/60} uur rust</span>`:fitChips(o.fx);
  const btn=on?`<button class="btn ghost" onclick="act.fitOff('${o.slot}')">${o.luck?'Wegleggen':'Uittrekken'}</button>`:own?`<button class="btn act-btn" onclick="act.fitWear('${o.id}')">${o.luck?'Meenemen':'Aantrekken'}</button>`
   :hrLock?`<button class="btn ghost" disabled>Alleen High roller</button>`:lock?`<button class="btn ghost" disabled>Vanaf ${RANKS[o.r][0]}</button>`:`<button class="btn ${poor?'ghost':'act-btn'}" onclick="act.fitBuy('${o.id}')" ${poor?'disabled':''}>${poor?'Te duur · ':'Koop · '}${fmt(o.p)}</button>`;
  return `<article class="fit-item ${on?'on':own?'own':lock?'lock':''}" style="--sc:${s.col}" onmouseenter="fitPreview('${o.id}')" onmouseleave="fitPreview(null)" onfocusin="fitPreview('${o.id}')" onfocusout="fitPreview(null)">
   <div class="fit-th">${fitThumb(o)}</div>
   <div class="fit-b"><div class="fit-t"><h4>${o.n}</h4><span class="fit-st">${s.n}</span></div><p>${o.d}</p><div class="fit-chips">${fxH}</div></div>
   <div class="fit-btn">${on?`<span class="fit-on">${o.luck?'Op zak':'Draag je'}</span>`:own?'<span class="fit-own">In je kast</span>':''}${btn}</div></article>`};
 const luckPanel=tab==='geluk'?luckPanelHtml():'';
 return `<h1>Outfit</h1><p class="sub">Wat je draagt bepaalt hoe de straat naar je kijkt. Elk stuk geeft een voordeel, en drie of meer stukken in dezelfde stijl geven een setbonus. Vaak kies je tussen stukken van dezelfde prijs met een ander voordeel. Wat je koopt blijft in je kast; omkleden is gratis.</p>
 <div class="fit">
  <section class="card fit-left"><div class="fit-stage" id="fitDoll">${dollSvg(F.wear)}</div>
   <div class="fit-worn">${FIT_SLOTS.map(sl=>{const o=fitItem(F.wear[sl.id]);return `<button class="${tab===sl.id?'on':''}" onclick="fitUI.tab='${sl.id}';render()"><span class="label">${sl.n}</span><b>${o?o.n:'Niets'}</b></button>`}).join('')}</div>
   ${fitSumHtml()}</section>
  <section class="fit-right"><div class="tabs fit-tabs" role="tablist">${FIT_SLOTS.map(sl=>`<button role="tab" class="${tab===sl.id?'on':''}" aria-selected="${tab===sl.id}" onclick="fitUI.tab='${sl.id}';render()">${sl.n}${F.wear[sl.id]?'<i></i>':''}</button>`).join('')}</div>
   <p class="fit-hint">${worn?`Je draagt nu: <b>${fitItem(worn).n}</b>. `:''}<span class="hv">Ga met je muis over een stuk om het te passen.</span></p>
   ${luckPanel}<div class="fit-grid">${items.map(card).join('')}</div></section>
 </div>`};
Object.assign(act,{
 fitBuy(id){const o=fitItem(id),F=fitS();if(!o||F.own[id])return;if(o.hr&&tier()<2){toast('Alleen voor High rollers','bad');return}if(rankIdx(S.xp)<o.r){toast('Vanaf '+RANKS[o.r][0],'bad');return}if(S.cash<o.p){toast('Niet genoeg contant geld','bad');return}
  S.cash-=o.p;F.own[id]=1;F.wear[o.slot]=id;try{SFX.buy&&SFX.buy()}catch(e){}toast(`${o.n} gekocht en aangetrokken`,'ok');log(`Outfit: ${o.n} gekocht (${fmt(o.p)})`,'info');save();render()},
 fitWear(id){const o=fitItem(id),F=fitS();if(!o||!F.own[id])return;F.wear[o.slot]=id;const c=fitSets()[o.st]||0;if(c===3||c===5)toast(`Setbonus ${FIT_STYLES[o.st].n}${c===5?' (volle set)':''}`,'lvl');save();render()},
 fitOff(slot){const F=fitS();delete F.wear[slot];save();render()},
 luckUse(){const o=fitItem(fitS().wear.geluk);if(!o||!o.luck){toast('Neem eerst een geluksdobbelsteen mee (Outfit, Geluk)','bad');return}
  if(luckLeft()){toast('Je geluk loopt al','bad');return}if(luckWait()){toast('Je dobbelsteen moet nog '+fmtClock(luckWait())+' rusten','bad');return}
  S.luck={pct:o.luck,id:o.id,until:now()+LUCK_MIN*60000,ready:now()+LUCK_CD*60000};try{SFX.win&&SFX.win(2)}catch(e){}
  toast(`${o.n}: ${LUCK_MIN} minuten +${Math.round(o.luck*100)}% op je winst in Kluiskraker en Visdief`,'lvl');log(`Geluk: ${o.n} gebruikt (+${Math.round(o.luck*100)}% in de slots, ${LUCK_MIN} min)`,'ok');save();render()}});
// paneel bovenaan Geluk en in de casinobalk: wat je dobbelsteen nu kan
function luckState(){const o=fitItem(fitS().wear.geluk),L=luckLeft(),W=luckWait();return {o,L,W,ready:!!(o&&o.luck)&&!L&&!W}}
function luckPanelHtml(){const {o,L,W,ready}=luckState();
 return `<div class="luck-p ${L?'on':''}">${o?diceSvg(o,1):''}<div class="luck-t"><span class="label">Geluksdobbelsteen</span><b>${o?esc(o.n)+' · +'+Math.round(o.luck*100)+'%':'Geen dobbelsteen op zak'}</b>
  <small>${L?`Actief: nog ${fmtClock(L)} extra winst in Kluiskraker en Visdief`:W?`Rust nog ${bkDurL(W)}`:o?`Klaar. Gebruik hem vlak voor je gaat spelen.`:'Koop er een hieronder en neem hem mee. Roulette, blackjack, poker en de andere spellen houden de echte kansen.'}</small></div>
  ${o?`<button class="btn ${ready?'act-btn':'ghost'}" onclick="act.luckUse()" ${ready?'':'disabled'}>${L?'Actief':W?'Rust':'Gebruiken'}</button>`:''}</div>`}
const bkDurL=ms=>{const m=Math.ceil(ms/60000),h=Math.floor(m/60);return h?h+'u '+String(m%60).padStart(2,'0')+'m':m+' min'};
