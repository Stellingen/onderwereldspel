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
 {id:'bedelen',n:'Bedelen bij Centraal',d:'Een zielig verhaal en een bekertje. Weinig geld, weinig risico.',min:5,max:25,xp:3,base:95,cd:4,jail:30,r:0,cr:0,en:3},
 {id:'zakken',n:'Zakkenrollen op de Dam',d:'Een toerist met een open rugzak is een cadeautje.',min:20,max:80,xp:8,base:85,cd:8,jail:30,r:0,cr:1,en:5},
 {id:'winkeldief',n:'Winkeldiefstal bij de drogist',d:'Parfum en scheermesjes. Verkoopt altijd.',min:30,max:110,xp:10,base:80,cd:10,jail:40,r:0,cr:1,en:6},
 {id:'fiets',n:'Fietsendiefstal bij het station',d:'Kniptang, één minuut, weg ben je.',min:40,max:140,xp:11,base:78,cd:12,jail:45,r:0,cr:1,en:6},
 {id:'pakket',n:'Pakketjes van de stoep',d:'Volg de bezorgbus en wees sneller dan de bewoner.',min:50,max:180,xp:13,base:75,cd:14,jail:50,r:0,cr:1,en:7},
 {id:'telefoon',n:'Telefoonfraude',d:'"Goedemiddag, u spreekt met de afdeling fraude van uw bank."',min:90,max:300,xp:18,base:72,cd:18,jail:60,r:1,cr:2,en:8},
 {id:'autokraak',n:'Autokraak in de parkeergarage',d:'Laptops op de achterbank. Mensen leren het nooit.',min:120,max:380,xp:20,base:70,cd:20,jail:70,r:1,cr:2,en:9},
 {id:'winkel',n:'Avondwinkel overvallen',d:'Snel de kassa leeghalen voordat de eigenaar de knop vindt.',min:150,max:450,xp:22,base:68,cd:22,jail:80,r:1,cr:2,en:10},
 {id:'fruitautomaat',n:'Fruitautomaat kraken',d:'Het café is leeg, de kast staat vol muntgeld.',min:250,max:700,xp:30,base:66,cd:28,jail:100,r:2,cr:2,en:11},
 {id:'tickets',n:'Valse festivaltickets',d:'Uitverkocht festival, wanhopige fans, mooie QR-codes.',min:300,max:900,xp:34,base:65,cd:32,jail:110,r:2,cr:3,en:12},
 {id:'scooter',n:'Scooters voor de export',d:'Een vrachtwagen vol, morgen staan ze in Marokko.',min:400,max:1100,xp:38,base:63,cd:36,jail:120,r:2,cr:3,en:13},
 {id:'inbraak',n:'Villa inbreken in Wassenaar',d:'De eigenaren zitten in Saint-Tropez. Hun kluis niet.',min:500,max:1500,xp:45,base:60,cd:45,jail:140,r:3,cr:3,en:14},
 {id:'snackbar',n:'Beschermingsgeld bij snackbars',d:'Het zou zonde zijn als er iets met die frituur gebeurt.',min:700,max:1800,xp:50,base:60,cd:50,jail:150,r:3,cr:3,en:15},
 {id:'pand',n:'Kantoor leeghalen op de Zuidas',d:'Servers, laptops en een kluis vol bedrijfsgeheimen.',min:1200,max:3200,xp:70,base:56,cd:70,jail:180,r:4,cr:4,en:17},
 {id:'witwas',n:'Witwassen via een nagelstudio',d:'Tweehonderd klanten per dag, op papier.',min:1500,max:3800,xp:75,base:58,cd:80,jail:190,r:4,cr:4,en:18},
 {id:'smokkel',n:'Smokkelroute via de haven',d:'Een container die nooit gescand wordt.',min:2000,max:5000,xp:90,base:50,cd:90,jail:220,r:5,cr:5,en:20},
 {id:'juwelier',n:'Juwelier in de P.C. Hooft',d:'Dertig seconden. Meer tijd krijg je niet.',min:3000,max:7000,xp:110,base:48,cd:110,jail:240,r:5,cr:6,en:22},
 {id:'vrachtwagen',n:'Vrachtwagen kapen op de A15',d:'Vol met telefoons, op weg naar een distributiecentrum.',min:5000,max:11000,xp:150,base:45,cd:140,jail:280,r:6,cr:6,en:24},
 {id:'transport',n:'Geldtransport onderscheppen',d:'Een gepantserde bus, een vaste route, een binnenman.',min:6500,max:14000,xp:170,base:43,cd:160,jail:300,r:6,cr:7,en:26},
 {id:'bank',n:'Bankoverval',d:'Met je crew de kluis van een bank kraken.',min:8000,max:20000,xp:200,base:40,cd:180,jail:360,r:7,cr:8,en:28},
 {id:'kunst',n:'Kunstroof uit het museum',d:'Een meesterwerk dat nooit meer aan de muur hangt.',min:12000,max:28000,xp:260,base:38,cd:220,jail:420,r:7,cr:9,en:30},
 {id:'diamant',n:'Diamantroof in Antwerpen',d:'De beurs ligt vol stenen. De beveiliging heeft een gat.',min:20000,max:45000,xp:350,base:35,cd:280,jail:480,r:8,cr:10,en:32},
 {id:'casino',n:'Casino-kraak',d:'De ultieme klus: de kluis van het grootste casino van het land.',min:30000,max:80000,xp:500,base:30,cd:360,jail:600,r:9,cr:12,en:35},
 {id:'centralebank',n:'De kluis van de Centrale Bank',d:'Goud, obligaties en een plek in de geschiedenisboeken.',min:60000,max:150000,xp:800,base:25,cd:480,jail:600,r:10,cr:16,en:40}];
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
const CARS=[
 {n:'Fiat Panda',v:400,c:80,r:0},{n:'VW Golf',v:1500,c:65,r:1},{n:'BMW M3',v:6000,c:50,r:3},
 {n:'Porsche 911',v:18000,c:38,r:5},{n:'Lamborghini Huracán',v:60000,c:25,r:8}];
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
