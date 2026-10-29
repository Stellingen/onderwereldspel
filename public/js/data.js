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
 {id:'centralebank',n:'De kluis van de Centrale Bank',d:'Goud, obligaties en een plek in de geschiedenisboeken.',min:60000,max:150000,xp:800,base:25,cd:480,jail:600,r:10,cr:16,en:40,flee:5},
 // extra klussen per rang
 {id:'spuiten',n:'Muren taggen voor een crew',d:'Een rivaliserende crew betaalt je om hun wijk te claimen.',min:70,max:240,xp:15,base:76,cd:15,jail:50,r:1,cr:1,en:7,flee:1},
 {id:'envelop',n:'Envelop afleveren in Noord',d:'Niet openmaken, niet vragen. Gewoon brengen.',min:100,max:320,xp:17,base:74,cd:17,jail:55,r:1,cr:2,en:8,flee:1},
 {id:'heling',n:'Heling op Marktplaats',d:'"Nieuw in doos, cadeau gekregen." Iedereen gelooft het.',min:280,max:800,xp:32,base:66,cd:30,jail:100,r:2,cr:2,en:11,flee:1},
 {id:'koper',n:'Koperkabel van een bouwplaats',d:'De sloper is met vakantie. Het koper niet.',min:350,max:1000,xp:36,base:64,cd:34,jail:115,r:2,cr:3,en:12,flee:2},
 {id:'parkeer',n:'Parkeerautomaten legen',d:'Een hele straat vol muntgeld, en niemand die kijkt.',min:600,max:1600,xp:48,base:60,cd:48,jail:145,r:3,cr:3,en:14,flee:2},
 {id:'ramkraak',n:'Ramkraak bij een elektronicazaak',d:'Een gestolen bestelbus, een etalage en negentig seconden.',min:800,max:2100,xp:55,base:58,cd:55,jail:160,r:3,cr:4,en:15,flee:3},
 {id:'gokhal',n:'Illegale pokerkelder runnen',d:'Drie tafels, een portier en de pot gaat altijd naar het huis.',min:1400,max:3600,xp:72,base:57,cd:75,jail:185,r:4,cr:4,en:17,flee:2},
 {id:'horloge',n:'Horlogeroof op een terras',d:'Een Patek aan een pols in de zon. Even groeten en weg.',min:1800,max:4200,xp:80,base:54,cd:85,jail:200,r:4,cr:5,en:18,flee:3},
 {id:'afpersing',n:'Vastgoedbaron afpersen',d:'Hij heeft foto\'s die niemand mag zien. Jij nu ook.',min:2500,max:6000,xp:95,base:50,cd:95,jail:225,r:5,cr:5,en:20,flee:2},
 {id:'container',n:'Zeecontainer omleiden',d:'Een ander nummer in het systeem en de vracht staat in jouw loods.',min:2800,max:6500,xp:100,base:49,cd:100,jail:230,r:5,cr:6,en:21,flee:3},
 {id:'veiling',n:'Vervalste kunst veilen',d:'Een "vergeten" Karel Appel. De koper is dolblij.',min:5500,max:12000,xp:155,base:46,cd:145,jail:285,r:6,cr:6,en:24,flee:2},
 {id:'rivaal',n:'Opslag van een rivaal leeghalen',d:'Zij hebben het al gestolen. Jij steelt het nog een keer.',min:6000,max:13000,xp:165,base:44,cd:155,jail:295,r:6,cr:7,en:25,flee:4},
 {id:'jacht',n:'Superjacht uit Monaco',d:'Een jacht van veertig meter, op weg naar een haven zonder vragen.',min:11000,max:26000,xp:240,base:39,cd:210,jail:400,r:7,cr:8,en:29,flee:4},
 {id:'goud',n:'Goudtransport op Schiphol',d:'Een pallet goud tussen de vrachtvliegtuigen.',min:14000,max:30000,xp:280,base:37,cd:230,jail:430,r:7,cr:9,en:30,flee:5},
 {id:'havenbaas',n:'De havenbaas omkopen',d:'Hij kijkt de andere kant op, voor elke container.',min:18000,max:40000,xp:320,base:38,cd:260,jail:460,r:8,cr:10,en:31,flee:2},
 {id:'londen',n:'Veilinghuis in Londen',d:'Een avondveiling, een vals alarm en een lege vitrine.',min:22000,max:48000,xp:370,base:35,cd:290,jail:500,r:8,cr:10,en:33,flee:5},
 {id:'voorkennis',n:'Beurshandel met voorkennis',d:'Een tip van een bestuurder en een mooie dag op het Damrak.',min:25000,max:52000,xp:390,base:36,cd:300,jail:510,r:8,cr:11,en:33,flee:1},
 {id:'jet',n:'Privéjet vol cash onderscheppen',d:'De piloot werkt voor jou. De passagiers weten van niks.',min:35000,max:85000,xp:520,base:31,cd:370,jail:600,r:9,cr:12,en:36,flee:4},
 {id:'aanbesteding',n:'Een gemeentelijke aanbesteding',d:'Een nieuwe brug, drie wethouders en een factuur die nooit klopt.',min:40000,max:90000,xp:560,base:32,cd:390,jail:600,r:9,cr:13,en:36,flee:1},
 {id:'geneve',n:'Vrijhavenkluis in Genève',d:'Schilderijen, goud en horloges die nooit het daglicht zien.',min:45000,max:100000,xp:600,base:29,cd:410,jail:600,r:9,cr:13,en:38,flee:5},
 {id:'minister',n:'Een minister onder druk zetten',d:'Een dossier op het juiste bureau verandert hele wetten.',min:70000,max:160000,xp:820,base:27,cd:490,jail:600,r:10,cr:16,en:40,flee:2},
 {id:'cryptobeurs',n:'Een cryptobeurs laten verdwijnen',d:'Op maandag is de website weg. Het geld ook.',min:80000,max:180000,xp:880,base:26,cd:510,jail:600,r:10,cr:17,en:41,flee:1},
 {id:'kaaiman',n:'Stichting op de Kaaimaneilanden',d:'Liefdadigheid op papier, een villa aan het strand in het echt.',min:90000,max:190000,xp:920,base:25,cd:530,jail:600,r:10,cr:17,en:42,flee:2},
 {id:'kartelvrede',n:'Vrede tussen twee kartels',d:'Jij zit aan het hoofd van de tafel. Iedereen betaalt.',min:120000,max:260000,xp:1100,base:24,cd:560,jail:600,r:11,cr:20,en:44,flee:3},
 {id:'tanker',n:'Een olietanker kapen',d:'Een schip vol olie dat nooit in de haven aankomt.',min:150000,max:320000,xp:1250,base:22,cd:590,jail:600,r:11,cr:22,en:46,flee:5},
 {id:'rotterdam',n:'De haven van Rotterdam',d:'Elke kraan, elke douanier en elke loods: van jou.',min:180000,max:380000,xp:1400,base:21,cd:620,jail:600,r:11,cr:24,en:48,flee:3},
 {id:'kroon',n:'De kroonjuwelen',d:'De klus waar ze over honderd jaar nog over praten.',min:250000,max:500000,xp:1800,base:18,cd:720,jail:600,r:11,cr:30,en:50,flee:5}];
// Rangbonus op elke buit: +6% per rang (Peetvader +66%)
const RANK_LOOT=.06;
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
// Auto's: d = moeilijkheid (1-5), b = carrosserie, lo/hi = straatwaarde, y = bouwjaren, w = hoe vaak hij op straat staat, leg = mythisch
const CARS=[
 {id:'panda',n:'Fiat Panda',b:'hatch',lo:300,hi:1100,y:[2008,2019],d:1,w:26},{id:'corsa',n:'Opel Corsa',b:'hatch',lo:400,hi:1500,y:[2009,2020],d:1,w:26},
 {id:'yaris',n:'Toyota Yaris',b:'hatch',lo:500,hi:1700,y:[2010,2020],d:1,w:24},{id:'clio',n:'Renault Clio',b:'hatch',lo:500,hi:1800,y:[2010,2021],d:1,w:24},
 {id:'p208',n:'Peugeot 208',b:'hatch',lo:600,hi:2000,y:[2013,2021],d:1,w:22},{id:'picanto',n:'Kia Picanto',b:'hatch',lo:400,hi:1300,y:[2012,2021],d:1,w:22},
 {id:'polo',n:'Volkswagen Polo',b:'hatch',lo:600,hi:2100,y:[2011,2021],d:1,w:22},{id:'c3',n:'Citroën C3',b:'hatch',lo:500,hi:1600,y:[2012,2021],d:1,w:20},
 {id:'golf',n:'Volkswagen Golf GTI',b:'hatch',lo:1500,hi:4500,y:[2014,2022],d:2,w:12},{id:'focus',n:'Ford Focus ST',b:'hatch',lo:1400,hi:4000,y:[2013,2021],d:2,w:11},
 {id:'leon',n:'Cupra Leon',b:'hatch',lo:1800,hi:5000,y:[2016,2023],d:2,w:10},{id:'a3',n:'Audi S3',b:'sedan',lo:2200,hi:5800,y:[2015,2023],d:2,w:10},
 {id:'octavia',n:'Škoda Octavia RS',b:'estate',lo:1800,hi:4800,y:[2015,2023],d:2,w:10},{id:'mini',n:'Mini Cooper S',b:'hatch',lo:1600,hi:4200,y:[2014,2023],d:2,w:10},
 {id:'v60',n:'Volvo V60',b:'estate',lo:2000,hi:5200,y:[2016,2023],d:2,w:9},{id:'gr86',n:'Toyota GR86',b:'coupe',lo:3000,hi:6500,y:[2021,2024],d:2,w:6},
 {id:'m3',n:'BMW M3',b:'sedan',lo:5000,hi:12000,y:[2015,2024],d:3,w:5},{id:'c63',n:'Mercedes-AMG C63',b:'sedan',lo:5500,hi:12500,y:[2015,2023],d:3,w:4.5},
 {id:'tesla',n:'Tesla Model S Plaid',b:'sedan',lo:7000,hi:14000,y:[2021,2024],d:3,w:4},{id:'rs6',n:'Audi RS6 Avant',b:'estate',lo:8000,hi:16000,y:[2018,2024],d:3,w:4},
 {id:'rr',n:'Range Rover Sport',b:'suv',lo:8000,hi:17000,y:[2016,2024],d:3,w:4},{id:'macan',n:'Porsche Macan GTS',b:'suv',lo:7000,hi:15000,y:[2017,2024],d:3,w:4},
 {id:'x5m',n:'BMW X5 M',b:'suv',lo:8500,hi:16500,y:[2018,2024],d:3,w:3.5},
 {id:'911',n:'Porsche 911 Carrera',b:'coupe',lo:15000,hi:30000,y:[2016,2024],d:4,w:2.2},{id:'r8',n:'Audi R8',b:'super',lo:18000,hi:34000,y:[2015,2023],d:4,w:1.8},
 {id:'taycan',n:'Porsche Taycan Turbo S',b:'sedan',lo:16000,hi:30000,y:[2020,2024],d:4,w:1.8},{id:'g63',n:'Mercedes-AMG G63',b:'offroad',lo:20000,hi:38000,y:[2018,2024],d:4,w:1.8},
 {id:'mase',n:'Maserati GranTurismo',b:'coupe',lo:17000,hi:32000,y:[2018,2024],d:4,w:1.5},{id:'bent',n:'Bentley Continental GT',b:'luxury',lo:22000,hi:42000,y:[2018,2024],d:4,w:1.4},
 {id:'db12',n:'Aston Martin DB12',b:'coupe',lo:26000,hi:46000,y:[2023,2024],d:4,w:1},
 {id:'hura',n:'Lamborghini Huracán',b:'super',lo:45000,hi:85000,y:[2017,2024],d:5,w:.6},{id:'urus',n:'Lamborghini Urus',b:'suv',lo:40000,hi:75000,y:[2019,2024],d:5,w:.7},
 {id:'f8',n:'Ferrari F8 Tributo',b:'super',lo:50000,hi:90000,y:[2020,2023],d:5,w:.5},{id:'mc720',n:'McLaren 720S',b:'super',lo:55000,hi:95000,y:[2018,2023],d:5,w:.45},
 {id:'cull',n:'Rolls-Royce Cullinan',b:'luxury',lo:60000,hi:110000,y:[2019,2024],d:5,w:.4},{id:'sf90',n:'Ferrari SF90 Stradale',b:'super',lo:90000,hi:150000,y:[2020,2024],d:5,w:.22},
 {id:'chiron',n:'Bugatti Chiron',b:'super',lo:180000,hi:320000,y:[2017,2023],d:5,w:.07,leg:1},{id:'jesko',n:'Koenigsegg Jesko',b:'super',lo:220000,hi:380000,y:[2022,2024],d:5,w:.05,leg:1}];
const CAR_LEVEL=['','makkelijk','redelijk','lastig','moeilijk','extreem'];
const CAR_RARITY=[null,['Gewoon','#9aa1ab'],['Ongewoon','#3fe395'],['Zeldzaam','#4d9dff'],['Episch','#b8a1ff'],['Legendarisch','#ffad6b']];
const CAR_MYTH=['Mythisch','#ff3d52'];
const CAR_SPOTS=['Op de stoep in De Pijp','Parkeergarage aan de Zuidas','Voor een villa in Amsterdam-Zuid','Bedrijventerrein Westpoort','Tankstation aan de A10',
 'Donker steegje bij de Wallen','Parkeerplaats van een sportschool','Oprit in Amstelveen','Achter een nachtclub op het Rembrandtplein','Laadpaal in Oost','Hotel aan de Amstel','Showroom op het Gooiplein'];
// Bedrijven: p = prijs eerste vestiging (elke volgende ×1,25), inc = euro per minuut op level 1, r = minimale rang.
// Elke vestiging kan 4 keer upgraden (level 1-5); up = de namen van die upgrades.
const BIZ=[
 {id:'wash',n:'Wasserette',d:'Wast meer dan alleen kleding.',p:5000,inc:40,r:1,col:'#a9dcff',up:['Extra machines','Droogtrommels','Bezorgservice','Witwasafdeling']},
 {id:'snack',n:'Snackbar',d:'Frikandellen voor de buurt, enveloppen voor de baas.',p:12000,inc:95,r:2,col:'#ffad6b',up:['Nieuwe frituur','Bezorgscooters','Nachtloket','Tweede keuken']},
 {id:'shop',n:'Belwinkel',d:'Goede dekmantel, constante cashflow.',p:20000,inc:180,r:3,col:'#3fe395',up:['Simkaarten in bulk','Reparatiebalie','Geld overmaken','Eigen prepaid-netwerk']},
 {id:'barber',n:'Barbershop',d:'Fades, baardolie en de roddels uit de hele wijk.',p:35000,inc:300,r:3,col:'#ff7fb3',up:['Extra stoelen','Tattoohoek','VIP-kamer','Eigen productlijn']},
 {id:'autogarage',n:'Autogarage',d:'APK, banden en zo nu en dan een ander kenteken.',p:60000,inc:520,r:4,col:'#ff7a1a',up:['Hefbrug','Spuitcabine','Tuningafdeling','Showroom']},
 {id:'shisha',n:'Shishalounge',d:'Rook, muziek en een achterkamer zonder camera\'s.',p:75000,inc:650,r:4,col:'#b8a1ff',up:['Loungebanken','Dakterras','Eigen DJ','Privékamers']},
 {id:'club',n:'Nachtclub',d:'VIP-ruimte, portiers en dure flessen.',p:90000,inc:900,r:5,col:'#ff3d52',up:['Lichtshow','Extra bar','Bekende DJ\'s','Skybox']},
 {id:'dealer',n:'Autodealer',d:'Dure wagens, contant betaald, geen vragen.',p:150000,inc:1500,r:6,col:'#4d9dff',up:['Grotere showroom','Leasedesk','Exportlijn','Exclusieve merken']},
 {id:'garage',n:'Chop shop',d:'Gestolen auto\'s omkatten en doorverkopen.',p:250000,inc:2800,r:7,col:'#c9a227',up:['Snijbranders','Onderdelenmagazijn','Containerexport','Valse papieren']},
 {id:'hotel',n:'Boetiekhotel',d:'Kamers op uurbasis en een kluis achter de receptie.',p:450000,inc:5000,r:8,col:'#e6e1d6',up:['Rooftop bar','Spa','Suites','Privé-ingang']},
 {id:'speelhal',n:'Speelhal',d:'Gokkasten, pokertafels en een kassa die nooit leeg is.',p:650000,inc:7500,r:9,col:'#f2c230',up:['Meer kasten','Pokerzaal','High-roller-kamer','Eigen wisselkantoor']},
 {id:'port',n:'Havenloods',d:'Controle over de smokkel in Rotterdam.',p:900000,inc:11000,r:9,col:'#38bdf8',up:['Eigen kraan','Koelcontainers','Contact bij de douane','Tweede kade']},
 {id:'vastgoed',n:'Vastgoedportefeuille',d:'Panden in de hele stad, de huur gaat contant.',p:2000000,inc:26000,r:10,col:'#9aa1ab',up:['Studentenpanden','Kantoortoren','Projectontwikkeling','Grond in de haven']},
 {id:'jet',n:'Privéjet-charter',d:'Vluchten zonder passagierslijst.',p:4000000,inc:55000,r:11,col:'#ffffff',up:['Tweede toestel','Eigen hangar','Internationale route','Luchthavenlounge']}];
const BIZ_MAX=10,BIZ_LVL=['Basis','Opgeknapt','Uitgebreid','Topzaak','Imperium'],BIZ_MULT=[1,1.5,2.2,3.1,4.3],BIZ_UPK=[.6,1.1,1.9,3.2];
const BIZ_PLACES=['De Pijp','Oost','Noord','West','Zuidoost','Jordaan','Zaandam','Rotterdam','Den Haag','Utrecht'];
const bizPrice=(b,n)=>Math.floor(b.p*Math.pow(1.25,n));
const bizUpCost=(b,l)=>Math.floor(b.p*BIZ_UPK[l-1]);
const bizInc=(b,l)=>b.inc*BIZ_MULT[l-1];
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
const TRAIN_MAX=50;
const pctTxt=(v,sign)=>v?sign+(+v.toFixed(1)).toLocaleString('nl-NL')+'%':'0%';
// Effect per level (op level 50 haal je het maximum). Eén sessie = één level.
const SK={conditie:{en:1,zone:.008},steal:{all:.4,zakken:.8},speed:{cd:.01,mark:.006},cars:{time:.01,price:.008},charisma:{talk:.9,bail:.008}};
// Prijs per sessie stijgt steil: level 1 kost een paar tientjes, de laatste levels honderdduizenden euro's.
const trainCost=(t,l)=>Math.round(t.base*Math.pow(1+l,1.9)*Math.pow(1.04,l)/10)*10;
const TRAIN_MILES=[10,20,30,40,50];
const TRAININGS=[
 {id:'conditie',place:'Sportschool',n:'Conditie',col:'#3fe395',ic:'gym',base:60,cd:12,
  d:'Krachttraining en cardio. Je hebt meer energie en houdt het langer vol als je moet vluchten.',
  eff:l=>[['Max. energie','+'+Math.round(SK.conditie.en*l)],['Groter groen gat bij vluchten',pctTxt(SK.conditie.zone*100*l,'+')]]},
 {id:'steal',place:'Albert Cuypmarkt',n:'Vingervlugheid',col:'#a9dcff',ic:'hand',base:80,cd:15,
  d:'Oefenen tussen de kraampjes. Je handen worden sneller dan hun ogen.',
  eff:l=>[['Slaagkans alle klussen',pctTxt(SK.steal.all*l,'+')],['Bij zakkenrollen',pctTxt(SK.steal.zakken*l,'+')]]},
 {id:'speed',place:'Atletiekbaan',n:'Snelheid',col:'#b8a1ff',ic:'run',base:100,cd:15,
  d:'Sprinten en intervallen. Je bent sneller klaar en sneller weg.',
  eff:l=>[['Kortere wachttijd',pctTxt(SK.speed.cd*100*l,'-')],['Tragere vluchtwijzer',pctTxt(SK.speed.mark*100*l,'-')]]},
 {id:'cars',place:'Circuit Zandvoort',n:'Rijvaardigheid',col:'#ffad6b',ic:'wheel',base:120,cd:20,
  d:'Rondjes op het circuit. Je hebt meer tijd bij het contact maken en weet beter wat een wagen waard is.',
  eff:l=>[['Meer tijd bij contact maken',pctTxt(SK.cars.time*100*l,'+')],['Verkoopwaarde gestolen auto',pctTxt(SK.cars.price*100*l,'+')]]},
 {id:'charisma',place:'Toneelschool',n:'Charisma',col:'#ff7fb3',ic:'mask',base:150,cd:20,
  d:'Acteerles in de Jordaan. Agenten geloven je verhaal sneller.',
  eff:l=>[['Kans om je eruit te praten',pctTxt(Math.min(45,SK.charisma.talk*l),'')],['Korting op borg',pctTxt(SK.charisma.bail*100*l,'')]]}];
// Oude saves telden sessies per level (2, 2, 3, 3, ...). Nu telt elke gedane sessie als één level.
function migrateTrain(d){if(d.trainV===2)return;d.skills=d.skills||{};d.train=d.train||{};
 TRAININGS.forEach(t=>{const L=d.skills[t.id]||0;let n=d.train[t.id]||0;for(let l=0;l<L;l++)n+=2+Math.floor(l/2);d.skills[t.id]=Math.min(TRAIN_MAX,n)});d.train={};d.trainV=2}

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
const CODE_ALIAS={kapo:'capo',m1:'m1v2',m2:'m2v2',m3:'m3v2',m4:'m4v2',m5:'m5v2',m6:'m6v2',m7:'m7v2',m8:'m8v2',m9:'m9v2'};
// zo toon je een code in 'gebruikte codes' (m1v2 → M1)
const codeShow=c=>c.replace(/v\d+$/,'').toUpperCase();
// Codes die nu bestaan (zelfde als CODES in server.js). Oude codes verdwijnen uit 'gebruikte codes'.
const LIVE_CODES={lotto:1500,welkom:500,casino:5000,vip:20000,spinnetje:25000,jackpot:1000000,trainwreck:3000000,m1v2:5000000,m2v2:5000000,m3v2:5000000,m4v2:5000000,m5v2:5000000,m6v2:5000000,m7v2:5000000,m8v2:5000000,m9v2:5000000};

// Verblijf: je begint onder de brug. Rusten vult je energie in `rest` seconden, maar alleen zolang je blijft.
const HOMES=[
 // rest = seconden rusten, cd = wachttijd tussen rustbeurten (s), en = extra max. energie, hp = gezondheid per rustbeurt, heat = minder hitte per rustbeurt
 {id:'brug',n:'Onder de brug',place:'Berlagebrug',d:'Een vochtig matras, een slaapzak en het geraas van de tram. Het is niet veel, maar je kunt er even je ogen dicht doen.',p:0,r:0,rest:10,cd:300,en:0,hp:20,heat:0},
 {id:'kraak',n:'Kraakpand',place:'Amsterdam-West',d:'Een leegstaand kantoor met een kapotte lift. Je hebt een deur die op slot kan.',p:2500,r:2,rest:9,cd:270,en:10,hp:25,heat:0},
 {id:'kamer',n:'Huurkamer',place:'De Pijp',d:'Zestien vierkante meter, een eigen douche en een huisbaas die geen vragen stelt.',p:15000,r:4,rest:8,cd:240,en:20,hp:30,heat:0},
 {id:'gracht',n:'Grachtenappartement',place:'Keizersgracht',d:'Hoge plafonds, uitzicht op het water. Niemand verwacht hier een crimineel.',p:80000,r:6,rest:7,cd:210,en:30,hp:40,heat:5},
 {id:'penthouse',n:'Penthouse',place:'Zuidas',d:'Bovenste verdieping, eigen lift, bewaking in de lobby.',p:400000,r:8,rest:6,cd:180,en:40,hp:55,heat:10},
 {id:'villa',n:'Villa',place:'Wassenaar',d:'Een hek, camera\'s, een zwembad en personeel. Zo slaapt een peetvader.',p:1500000,r:10,rest:5,cd:150,en:50,hp:70,heat:20}];
// Inrichting: spullen voor je woning (vanaf de huurkamer). Ze verhuizen mee en geven een blijvend voordeel.
// h = vanaf welke woning (index in HOMES). fx: hpRegen/enRegen/heat = sneller herstel, focus = % slaagkans, en = max. energie,
// restHp = extra gezondheid per rustbeurt, restCd = kortere wachttijd rusten, zone = groter groen gat bij vluchten, safe = minder verlies bij mislukken
const FURN=[
 {id:'plant',n:'Planten',h:2,p:1500,col:'#3fe395',d:'Een hoek vol groen. Frisse lucht en een rustig hoofd.',fx:{hpRegen:.25,focus:2}},
 {id:'espresso',n:'Espressomachine',h:2,p:2500,col:'#ffad6b',d:'Elke ochtend een dubbele. Je gaat langer door.',fx:{en:10}},
 {id:'bed',n:'Goed bed',h:2,p:4000,col:'#a9dcff',d:'Pocketvering en een dekbed van ganzendons.',fx:{restHp:10,restCd:.15}},
 {id:'bokszak',n:'Bokszak',h:2,p:6000,col:'#ff7a1a',d:'Elke dag tien rondes. Je benen blijven sterk.',fx:{zone:.06}},
 {id:'aquarium',n:'Aquarium',h:3,p:15000,col:'#4d9dff',d:'Tropische vissen en een zacht blauw licht.',fx:{hpRegen:.25,focus:3}},
 {id:'camera',n:'Camera\'s',h:3,p:25000,col:'#b8a1ff',d:'Je ziet wie er aanbelt voordat zij jou zien.',fx:{heat:.5}},
 {id:'kluis',n:'Kluis in de muur',h:4,p:60000,col:'#c9a227',d:'Contant geld dat niet op straat ligt, raak je ook niet kwijt.',fx:{safe:.5}},
 {id:'bios',n:'Thuisbioscoop',h:4,p:90000,col:'#ff7fb3',d:'Leren stoelen en een scherm van drie meter.',fx:{enRegen:.15}},
 {id:'sauna',n:'Eigen sauna',h:5,p:250000,col:'#ff3d52',d:'Een cederhouten sauna met uitzicht op de tuin.',fx:{hpRegen:.5,restCd:.15}},
 {id:'zen',n:'Meditatieruimte',h:5,p:400000,col:'#e6e1d6',d:'Stilte, een gong en een Japanse tuin.',fx:{focus:5}}];
const FURN_FX={hpRegen:['Gezondheid herstelt',v=>'+'+Math.round(v*100)+'% sneller'],enRegen:['Energie laadt op',v=>'+'+Math.round(v*100)+'% sneller'],heat:['Hitte zakt',v=>'+'+Math.round(v*100)+'% sneller'],
 focus:['Rust in je hoofd',v=>'+'+v+'% slaagkans'],en:['Max. energie',v=>'+'+v],restHp:['Per rustbeurt',v=>'+'+v+'% gezondheid'],restCd:['Wachttijd rusten',v=>'-'+Math.round(v*100)+'%'],
 zone:['Groen gat bij vluchten',v=>'+'+Math.round(v*100)+'%'],safe:['Verlies bij mislukken',v=>'-'+Math.round(v*100)+'%']};
const DOC={dur:10,cd:600,hp:20};
