// Hulpfuncties en spelgegevens: rangen, misdaden, auto's, bedrijven, wapens, families
const $=s=>document.querySelector(s);
const fmt=n=>'€'+Math.floor(n).toLocaleString('nl-NL');
const now=()=>Date.now();
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const RANKS=[
 ['Rookie',0],['Straatschoffie',150],['Loopjongen',500],['Dief',1200],['Boef',2500],['Gangster',5000],
 ['Soldaat',9000],['Huurmoordenaar',15000],['Capo',25000],['Onderbaas',40000],['Consigliere',65000],['Peetvader',100000]];
const CRIMES=[
 // r = minimale rang, en = energie, cd = wachttijd (s), jail = straf (s), cr = straatcredit
 {id:'bedelen',n:'Bedelen bij Centraal',d:'Een zielig verhaal en een bekertje. Weinig geld, weinig risico.',min:5,max:25,xp:3,base:95,cd:4,jail:30,r:0,cr:0,en:3,flee:1},
 {id:'zakken',n:'Zakkenrollen op de Dam',d:'Een toerist met een open rugzak is een cadeautje.',min:20,max:80,xp:8,base:85,cd:8,jail:30,r:0,cr:1,en:5,flee:1},
 {id:'winkeldief',n:'Winkeldiefstal bij de drogist',d:'Parfum en scheermesjes. Verkoopt altijd.',min:30,max:110,xp:10,base:80,cd:10,jail:40,r:0,cr:1,en:6,flee:2},
 {id:'fiets',n:'Fietsendiefstal bij het station',d:'Kniptang, één minuut, weg ben je.',min:40,max:140,xp:11,base:78,cd:12,jail:45,r:0,cr:1,en:6,flee:1},
 {id:'pakket',n:'Pakketjes van de stoep',d:'Volg de bezorgbus en wees sneller dan de bewoner.',min:50,max:180,xp:13,base:75,cd:14,jail:50,r:0,cr:1,en:7,flee:1},
 {id:'telefoon',n:'Telefoonfraude',d:'"Goedemiddag, u spreekt met de afdeling fraude van uw bank."',min:90,max:300,xp:18,base:72,cd:18,jail:60,r:1,cr:2,en:8,flee:1},
 {id:'autokraak',n:'Autokraak in de parkeergarage',d:'Laptops op de achterbank. Mensen leren het nooit.',min:120,max:380,xp:20,base:70,cd:20,jail:70,r:1,cr:2,en:9,flee:2},
 {id:'winkel',n:'Avondwinkel overvallen',d:'Snel de kassa leeghalen voordat de eigenaar de knop vindt.',min:150,max:450,xp:22,base:68,cd:22,jail:80,r:1,cr:2,en:10,flee:3},
 {id:'fruitautomaat',n:'Fruitautomaat kraken',d:'Het café is leeg, de kast staat vol muntgeld.',min:250,max:700,xp:30,base:66,cd:28,jail:100,r:2,cr:2,en:11,flee:3},
 {id:'tickets',n:'Valse festivaltickets',d:'Uitverkocht festival, wanhopige fans, mooie QR-codes.',min:300,max:900,xp:34,base:65,cd:32,jail:110,r:2,cr:3,en:12,flee:1},
 {id:'scooter',n:'Scooters voor de export',d:'Een vrachtwagen vol, morgen staan ze in Marokko.',min:400,max:1100,xp:38,base:63,cd:36,jail:120,r:2,cr:3,en:13,flee:2},
 {id:'inbraak',n:'Villa inbreken in Wassenaar',d:'De eigenaren zitten in Saint-Tropez. Hun kluis niet.',min:500,max:1500,xp:45,base:60,cd:45,jail:140,r:3,cr:3,en:14,flee:4},
 {id:'snackbar',n:'Beschermingsgeld bij snackbars',d:'Het zou zonde zijn als er iets met die frituur gebeurt.',min:700,max:1800,xp:50,base:60,cd:50,jail:150,r:3,cr:3,en:15,flee:2},
 {id:'pand',n:'Kantoor leeghalen op de Zuidas',d:'Servers, laptops en een kluis vol bedrijfsgeheimen.',min:1200,max:3200,xp:70,base:56,cd:70,jail:180,r:4,cr:4,en:17,flee:4},
 {id:'witwas',n:'Witwassen via een nagelstudio',d:'Tweehonderd klanten per dag, op papier.',min:1500,max:3800,xp:75,base:58,cd:80,jail:190,r:4,cr:4,en:18,flee:2},
 {id:'smokkel',n:'Smokkelroute via de haven',d:'Een container die nooit gescand wordt.',min:2000,max:5000,xp:90,base:50,cd:90,jail:220,r:5,cr:5,en:20,flee:3},
 {id:'juwelier',n:'Juwelier in de P.C. Hooft',d:'Dertig seconden. Meer tijd krijg je niet.',min:3000,max:7000,xp:110,base:48,cd:110,jail:240,r:5,cr:6,en:22,flee:4},
 {id:'vrachtwagen',n:'Vrachtwagen kapen op de A15',d:'Vol met telefoons, op weg naar een distributiecentrum.',min:5000,max:11000,xp:150,base:45,cd:140,jail:280,r:6,cr:6,en:24,flee:3},
 {id:'transport',n:'Geldtransport onderscheppen',d:'Een gepantserde bus, een vaste route, een binnenman.',min:6500,max:14000,xp:170,base:43,cd:160,jail:300,r:6,cr:7,en:26,flee:3},
 {id:'bank',n:'Bankoverval',d:'Met je crew de kluis van een bank kraken.',min:8000,max:20000,xp:200,base:40,cd:180,jail:360,r:7,cr:8,en:28,flee:5},
 {id:'kunst',n:'Kunstroof uit het museum',d:'Een meesterwerk dat nooit meer aan de muur hangt.',min:12000,max:28000,xp:260,base:38,cd:220,jail:420,r:7,cr:9,en:30,flee:5},
 {id:'diamant',n:'Diamantroof in Antwerpen',d:'De beurs ligt vol stenen. De beveiliging heeft een gat.',min:20000,max:45000,xp:350,base:35,cd:280,jail:480,r:8,cr:10,en:32,flee:5},
 {id:'casino',n:'Casino-kraak',d:'De ultieme klus: de kluis van het grootste casino van het land.',min:30000,max:80000,xp:500,base:30,cd:360,jail:600,r:9,cr:12,en:35,flee:5},
 {id:'centralebank',n:'De kluis van de Centrale Bank',d:'Goud, obligaties en een plek in de geschiedenisboeken.',min:60000,max:150000,xp:800,base:25,cd:480,jail:600,r:10,cr:16,en:40,flee:5}];
const FAMILIES=[
 {id:'garde',n:'De Nieuwe Garde',m:'NG',d:'Jonge honden uit Amsterdam-West. Snel, brutaal en loyaal tot op het bot.',r:2,cred:20,chance:4,loot:0,jail:0,col:'var(--ice)'},
 {id:'kurogumi',n:'Kurogumi',m:'黒',d:'Een stille clan met tatoeages tot aan de pols. Bezit de helft van de nachtclubs.',r:3,cred:45,chance:5,loot:5,jail:5,col:'var(--fg)'},
 {id:'colombra',n:'Famiglia Colombra',m:'FC',d:'Ouderwetse Italianen die nooit vergeten wie hen een gunst schuldig is.',r:4,cred:80,chance:6,loot:12,jail:10,col:'var(--green)'},
 {id:'volkov',n:'Bratva Volkov',m:'BV',d:'Oost-Europese broederschap. Gedisciplineerd, hard en onverwoestbaar.',r:5,cred:130,chance:7,loot:15,jail:15,col:'var(--blue)'},
 {id:'halcones',n:'Los Halcones',m:'LH',d:'Een kartel met routes van de Rotterdamse haven tot diep in Zuid-Amerika.',r:6,cred:200,chance:8,loot:22,jail:20,col:'var(--acc2)'},
 {id:'lucchetti',n:'Famiglia Lucchetti',m:'FL',d:'Kleermakers, advocaten en twee rechters op de loonlijst.',r:7,cred:300,chance:9,loot:28,jail:28,col:'var(--violet)'},
 {id:'gambrino',n:'Famiglia Gambrino',m:'FG',d:'De grootste van de Vijf Families. Wie hier binnenkomt, gaat er niet meer uit.',r:8,cred:450,chance:10,loot:34,jail:34,col:'var(--red)'},
 {id:'cupola',n:'La Cupola',m:'LC',d:'De raad van peetvaders. Alleen de allergrootsten krijgen een stoel aan tafel.',r:9,cred:650,chance:12,loot:40,jail:40,col:'var(--acc)'}];
const PLACES={dash:'op straat',crimes:'tijdens een klus',cars:'bij een parkeergarage',casino:'in het casino',biz:'bij je bedrijf',shop:'bij de wapenhandelaar',bank:'bij de bank',fam:'bij het familiehuis',rank:'in een café'};
// Auto's: d = moeilijkheid van de minigame (1-5), w = hoe vaak hij op straat staat
const CARS=[
 {id:'panda',n:'Fiat Panda',v:400,d:1,w:30},{id:'corsa',n:'Opel Corsa',v:650,d:1,w:28},{id:'yaris',n:'Toyota Yaris',v:800,d:1,w:26},{id:'clio',n:'Renault Clio',v:900,d:1,w:24},
 {id:'golf',n:'VW Golf GTI',v:1800,d:2,w:18},{id:'focus',n:'Ford Focus ST',v:2000,d:2,w:16},{id:'leon',n:'Seat Leon Cupra',v:3000,d:2,w:14},{id:'a3',n:'Audi S3',v:3800,d:2,w:12},
 {id:'m3',n:'BMW M3',v:6000,d:3,w:9},{id:'c63',n:'Mercedes C63 AMG',v:8000,d:3,w:8},{id:'tesla',n:'Tesla Model S Plaid',v:9500,d:3,w:7},{id:'rs6',n:'Audi RS6',v:11000,d:3,w:6},{id:'rr',n:'Range Rover Sport',v:13000,d:3,w:6},
 {id:'911',n:'Porsche 911',v:18000,d:4,w:4},{id:'mase',n:'Maserati GranTurismo',v:24000,d:4,w:3},{id:'bent',n:'Bentley Continental',v:32000,d:4,w:2.5},
 {id:'hura',n:'Lamborghini Huracán',v:60000,d:5,w:1.4},{id:'f8',n:'Ferrari F8',v:70000,d:5,w:1.2},{id:'cull',n:'Rolls-Royce Cullinan',v:85000,d:5,w:.9},{id:'chiron',n:'Bugatti Chiron',v:250000,d:5,w:.25}];
const CAR_LEVEL=['','makkelijk','redelijk','lastig','moeilijk','extreem'];
const CAR_SPOTS=['Op de stoep in De Pijp','In een parkeergarage aan de Zuidas','Voor een villa in Amsterdam-Zuid','Op een bedrijventerrein','Naast een tankstation aan de A10','In een donker steegje'];
const BIZ=[
 {id:'wash',n:'Wasserette',d:'Wast meer dan alleen kleding.',p:5000,inc:40,r:1},
 {id:'shop',n:'Belwinkel',d:'Goede dekmantel, constante cashflow.',p:20000,inc:180,r:3},
 {id:'club',n:'Nachtclub',d:'VIP-ruimte, portiers en dure flessen.',p:90000,inc:900,r:5},
 {id:'garage',n:'Chop shop',d:'Gestolen auto\'s omkatten en doorverkopen.',p:250000,inc:2800,r:7},
 {id:'port',n:'Havenloods',d:'Controle over de smokkel in Rotterdam.',p:900000,inc:11000,r:9}];
const GEAR=[
 {id:'mes',n:'Vlindermes',p:800,bonus:3},{id:'pistool',n:'Glock 17',p:6000,bonus:6},
 {id:'vest',n:'Kogelvrij vest',p:20000,bonus:5},{id:'ak',n:'AK-47',p:75000,bonus:10}];
const NPC_NAMES=['Vito "De Haai"','Ricardo B.','Mo Taxi','Sjaak de Kraker','Lola V.','Don Petrov','Kleine Johnny','Yasmina R.','Big Dre','De Belg','Nico Stilletto','Frenkie Fluit'];

// Vluchtspel: hoe besloten de plek, hoe moeilijker het is om weg te komen
const FLEE_LEVELS={
 // zone = breedte groen gat (deel van de balk), speed = keer per seconde heen of terug, shrink/accel per rake klik
 1:{label:'makkelijk',where:'Je staat op straat, er zijn genoeg steegjes.',zone:.25,speed:.9,hits:3,miss:2,time:10,shrink:.95,accel:1.03},
 2:{label:'redelijk',where:'Het is druk, maar er is ruimte om te rennen.',zone:.18,speed:1.15,hits:3,miss:2,time:9,shrink:.92,accel:1.05},
 3:{label:'lastig',where:'Je bent binnen en er is maar één uitgang.',zone:.13,speed:1.45,hits:4,miss:1,time:9,shrink:.9,accel:1.06},
 4:{label:'moeilijk',where:'Je zit in een gebouw en de agent blokkeert de deur.',zone:.10,speed:1.8,hits:4,miss:1,time:8,shrink:.88,accel:1.07},
 5:{label:'bijna onmogelijk',where:'Alles zit op slot en de beveiliging heeft je ingesloten.',zone:.09,speed:2.0,hits:4,miss:0,time:8,shrink:.88,accel:1.07,drift:true}};

// Training: blijvende skills via sessies met een wachttijd (tijdslot) per plek
// need(l): aantal sessies om van level l naar l+1 te gaan; kosten per sessie stijgen per level
const TRAIN_MAX=10;
const pctTxt=(v,sign)=>v?sign+(+v.toFixed(1)).toLocaleString('nl-NL')+'%':'0%';
const trainNeed=l=>2+Math.floor(l/2);
const TRAININGS=[
 {id:'conditie',place:'Sportschool',n:'Conditie',col:'#3fe395',ic:'gym',base:60,cd:12,
  d:'Krachttraining en cardio. Je hebt meer energie en houdt het langer vol als je moet vluchten.',
  eff:l=>[['Max. energie',(100+5*l)+''],['Groter groen gat bij vluchten',pctTxt(4*l,'+')]]},
 {id:'steal',place:'Albert Cuypmarkt',n:'Vingervlugheid',col:'#a9dcff',ic:'hand',base:80,cd:15,
  d:'Oefenen tussen de kraampjes. Je handen worden sneller dan hun ogen.',
  eff:l=>[['Slaagkans alle klussen',pctTxt(2*l,'+')],['Extra bij zakkenrollen',pctTxt(2*l,'+')]]},
 {id:'speed',place:'Atletiekbaan',n:'Snelheid',col:'#b8a1ff',ic:'run',base:100,cd:15,
  d:'Sprinten en intervallen. Je bent sneller klaar en sneller weg.',
  eff:l=>[['Kortere wachttijd',pctTxt(5*l,'-')],['Tragere vluchtwijzer',pctTxt(3*l,'-')]]},
 {id:'cars',place:'Circuit Zandvoort',n:'Rijvaardigheid',col:'#ffad6b',ic:'wheel',base:120,cd:20,
  d:'Rondjes op het circuit. Je herkent een goede wagen en weet hem weg te krijgen.',
  eff:l=>[['Kans auto stelen',pctTxt(3*l,'+')],['Waarde gestolen auto',pctTxt(4*l,'+')]]},
 {id:'charisma',place:'Toneelschool',n:'Charisma',col:'#ff7fb3',ic:'mask',base:150,cd:20,
  d:'Acteerles in de Jordaan. Agenten geloven je verhaal sneller.',
  eff:l=>[['Kans om je eruit te praten',Math.min(45,4.5*l).toLocaleString('nl-NL')+'%'],['Korting op borg',pctTxt(4*l,'')]]}];

// Ontspanning: tijdelijke effecten, elk met een eigen wachttijd
const RELAX=[
 {id:'club',place:'Privéclub op de Wallen',n:'Hoofd leegmaken',col:'#ff3d52',ic:'glass',cd:60,cost:r=>300+r*150,
  d:'Een dure avond in een privéclub. Daarna is je hoofd leeg en ben je scherp.',focus:8,mins:20},
 {id:'sauna',place:'Sauna & massage',n:'Herstellen',col:'#a9dcff',ic:'steam',cd:40,cost:r=>120+r*40,
  d:'Stoom, een massage en een uur niemand aan je hoofd.',hp:35,energy:15},
 {id:'espresso',place:'Italiaanse bar',n:'Dubbele espresso',col:'#ffad6b',ic:'cup',cd:20,cost:()=>15,
  d:'Snel een bakje bij Luigi. Kleine oppepper.',energy:10},
 {id:'onderduik',place:'Onderduikadres',n:'Onderduiken',col:'#b8a1ff',ic:'house',cd:90,cost:r=>400+r*250,
  d:'Een paar uur van de radar op een adres dat niemand kent. Je hitte zakt en de gezochtlijst vergeet je.',heat:40,clearWanted:true}];

// Rangcodes: typ de naam van een rang bij Profiel > Code inwisselen (één keer, zodra je die rang hebt)
const RANK_CODES={straatschoffie:150,loopjongen:400,dief:1000,boef:2500,gangster:6000,soldaat:12000,huurmoordenaar:25000,capo:50000,onderbaas:100000,consigliere:200000,peetvader:500000};
const CODE_ALIAS={kapo:'capo'};

// Verblijf: je begint onder de brug. Rusten vult je energie in `rest` seconden, maar alleen zolang je blijft.
const HOMES=[
 {id:'brug',n:'Onder de brug',place:'Berlagebrug',d:'Een vochtig matras, een slaapzak en het geraas van de tram. Het is niet veel, maar je kunt er even je ogen dicht doen.',p:0,r:0,rest:10,en:0,hp:0,heat:0},
 {id:'kraak',n:'Kraakpand',place:'Amsterdam-West',d:'Een leegstaand kantoor met een kapotte lift. Je hebt een deur die op slot kan.',p:2500,r:2,rest:9,en:10,hp:10,heat:0},
 {id:'kamer',n:'Huurkamer',place:'De Pijp',d:'Zestien vierkante meter, een eigen douche en een huisbaas die geen vragen stelt.',p:15000,r:4,rest:8,en:20,hp:25,heat:0},
 {id:'gracht',n:'Grachtenappartement',place:'Keizersgracht',d:'Hoge plafonds, uitzicht op het water. Niemand verwacht hier een crimineel.',p:80000,r:6,rest:7,en:30,hp:50,heat:5},
 {id:'penthouse',n:'Penthouse',place:'Zuidas',d:'Bovenste verdieping, eigen lift, bewaking in de lobby.',p:400000,r:8,rest:6,en:40,hp:100,heat:10},
 {id:'villa',n:'Villa',place:'Wassenaar',d:'Een hek, camera\'s, een zwembad en personeel. Zo slaapt een peetvader.',p:1500000,r:10,rest:5,en:50,hp:100,heat:20}];
