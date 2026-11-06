// Hulpfuncties en spelgegevens: rangen, misdaden, auto's, bedrijven, wapens, families
const $=s=>document.querySelector(s);
const fmt=n=>'€'+Math.floor(n).toLocaleString('nl-NL');
// Kort bedrag voor krappe plekken: €1,7 mln · €37,8 mld · €1,2 bln (biljoen). Onder het miljoen gewoon het hele bedrag.
const fmtS=n=>{n=+n||0;const a=Math.abs(n),sg=n<0?'−':'',f=(v,u)=>sg+'€'+(v>=100?Math.round(v):Math.floor(v*10)/10).toLocaleString('nl-NL',{maximumFractionDigits:1})+' '+u;
 return a>=1e12?f(a/1e12,'bln'):a>=1e9?f(a/1e9,'mld'):a>=1e6?f(a/1e6,'mln'):fmt(n)};
// Het hele bedrag als het past (max tekens), anders kort. fitN(k): hoeveel tekens er op dit scherm passen (k = tekens bij 390 px breed).
const fmtFit=(n,max)=>{const f=fmt(n);return f.length>max?fmtS(n):f};
const fitN=k=>innerWidth>900?99:Math.max(8,Math.floor(k*Math.min(1.6,innerWidth/390)));
const now=()=>Date.now();
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

// 20 rangen (sinds november 2026; daarvoor 12). De oude rangen staan op RK[oud]; daartussen nieuwe tussenrangen.
// De weg omhoog is zwaarder: Peetvader op 380.000 XP (was 100.000). Bestaande spelers zakken niet (zie state.js load).
const RANKS=[
 ['Rookie',0],['Straatschoffie',150],['Loopjongen',500],['Sjacheraar',900],['Dief',1500],['Inbreker',2600],
 ['Boef',4000],['Ritselaar',6500],['Gangster',10000],['Handhaver',15000],['Soldaat',22000],['Luitenant',32000],
 ['Huurmoordenaar',45000],['Kapitein',62000],['Capo',85000],['Rechterhand',115000],['Onderbaas',155000],['Schaduwbaas',210000],
 ['Consigliere',280000],['Peetvader',380000]];
// oude rang-index (0..11) → nieuwe index; en terug: hoe 'sterk' een rang is op de oude schaal (voor buit, kans, prijzen)
const RK=[0,1,2,4,6,8,10,12,14,16,18,19];
const RKP=[0,1,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5,10,11];
const rkPow=ri=>RKP[Math.max(0,Math.min(RKP.length-1,ri|0))];
// Vaste spelregels op één plek: het spel (state.js, carjack.js, hits.js, autos.js) en de voorpagina (server, lp-views.js) lezen ze hier.
// startCash = startgeld, enBase/enRegenS = basisenergie en seconden per energiepunt, jackR/hitR = rang-index waarop carjacken en
// huurmoorden opengaan, garageMax = hoeveel plekken je garage maximaal heeft.
const GAME_CONST={startCash:250,enBase:100,enRegenS:12,jackR:RK[4],hitR:RK[7],garageMax:10};
// zet de rang (r) van spullen en klussen om naar de nieuwe indeling. split: de goedkopere helft van een rang gaat naar de
// tussenrang eronder, zodat elke nieuwe rang ook iets opent.
function rkRemap(arr,split,key){if(!arr||arr._rk)return arr;arr._rk=1;const k=key||'p';
 arr.forEach(x=>{if(typeof x.r==='number'&&x.r<RK.length)x.r=RK[x.r]});
 if(split){const by={};arr.forEach(x=>{if(typeof x.r==='number'&&x.r>2&&RK.indexOf(x.r-1)<0)(by[x.r]=by[x.r]||[]).push(x)});
  Object.values(by).forEach(L=>{L.sort((a,b)=>(a[k]||0)-(b[k]||0)).slice(0,Math.floor(L.length/2)).forEach(x=>x.r-=1)})}
 return arr}
const CRIMES=[
 // r = minimale rang, en = energie, cd = wachttijd (s), jail = straf (s), cr = straatcredit
 {id:'bedelen',n:'Bedelen bij Centraal',d:'Een zielig verhaal en een bekertje. Weinig geld, weinig risico.',min:5,max:25,xp:3,base:95,cd:4,jail:30,r:0,cr:0,en:3,flee:1,sev:'A'},
 {id:'zakken',n:'Zakkenrollen op de Dam',d:'Een toerist met een open rugzak is een cadeautje.',min:20,max:80,xp:8,base:85,cd:8,jail:30,r:0,cr:1,en:5,flee:1},
 {id:'winkeldief',n:'Winkeldiefstal bij de drogist',d:'Parfum en scheermesjes. Verkoopt altijd.',min:30,max:110,xp:10,base:80,cd:10,jail:40,r:0,cr:1,en:6,flee:2},
 {id:'fiets',n:'Fietsendiefstal bij het station',d:'Kniptang, één minuut, weg ben je.',min:40,max:140,xp:11,base:78,cd:12,jail:45,r:0,cr:1,en:6,flee:1},
 {id:'pakket',n:'Pakketjes van de stoep',d:'Volg de bezorgbus en wees sneller dan de bewoner.',min:50,max:180,xp:13,base:75,cd:14,jail:50,r:0,cr:1,en:7,flee:1},
 {id:'telefoon',n:'Beller voor een fraudebende',d:'Een script, een headset en een nummer dat op de bank lijkt. Jij belt, zij cashen.',min:110,max:360,xp:18,base:72,cd:18,jail:60,r:1,cr:2,en:8,flee:1},
 {id:'autokraak',n:'Autokraak in de parkeergarage',d:'Laptops op de achterbank. Mensen leren het nooit.',min:120,max:380,xp:20,base:70,cd:20,jail:70,r:1,cr:2,en:9,flee:2},
 {id:'winkel',n:'Avondwinkel overvallen',d:'Snel de kassa leeghalen voordat de eigenaar de knop vindt.',min:650,max:1750,xp:52,base:58,cd:52,jail:190,r:3,cr:3,en:15,flee:3},
 {id:'fruitautomaat',n:'"Hoi mam, nieuw nummer"',d:'Een berichtje van "je zoon" met een rekening die vandaag nog betaald moet.',min:300,max:950,xp:32,base:65,cd:30,jail:105,r:2,cr:2,en:11,flee:1},
 {id:'tickets',n:'Valse festivaltickets',d:'Uitverkocht festival, wanhopige fans, mooie QR-codes.',min:300,max:900,xp:34,base:65,cd:32,jail:110,r:2,cr:3,en:12,flee:1},
 {id:'scooter',n:'E-bikes en fatbikes',d:'Een accuslot is ook maar een slot. De bestelbus staat om de hoek; morgen staan ze online.',min:400,max:1100,xp:38,base:63,cd:36,jail:120,r:2,cr:3,en:13,flee:2},
 {id:'inbraak',n:'Villa inbreken in Wassenaar',d:'De eigenaren zitten in Saint-Tropez. Hun kluis niet.',min:500,max:1500,xp:45,base:60,cd:45,jail:140,r:3,cr:3,en:14,flee:4},
 {id:'snackbar',n:'Beschermingsgeld bij snackbars',d:'Het zou zonde zijn als er iets met die frituur gebeurt.',min:700,max:1800,xp:50,base:60,cd:50,jail:210,r:3,cr:3,en:15,flee:2},
 {id:'pand',n:'Kantoor leeghalen op de Zuidas',d:'Servers, laptops en een kluis vol bedrijfsgeheimen.',min:1200,max:3200,xp:70,base:56,cd:70,jail:180,r:4,cr:4,en:17,flee:4},
 {id:'witwas',n:'Valse facturen schrijven',d:'Facturen voor werk dat nooit gedaan is. De aannemer betaalt contant terug.',min:1500,max:3800,xp:75,base:58,cd:80,jail:180,r:4,cr:4,en:18,flee:2},
 {id:'smokkel',n:'Smokkelroute via de haven',d:'Een container die nooit gescand wordt.',min:2000,max:5000,xp:90,base:50,cd:90,jail:220,r:5,cr:5,en:20,flee:3},
 {id:'juwelier',n:'Juwelier in de P.C. Hooft',d:'Dertig seconden. Meer tijd krijg je niet.',min:3000,max:7000,xp:110,base:48,cd:110,jail:240,r:5,cr:6,en:22,flee:4},
 {id:'vrachtwagen',n:'Ladingdiefstal op een truckparking',d:'Een oplegger vol telefoons, een chauffeur die ligt te slapen en een mes door het zeil.',min:5000,max:11000,xp:150,base:45,cd:140,jail:280,r:6,cr:6,en:24,flee:3},
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
 {id:'parkeer',n:'Koplampen en airbags',d:'Een straat vol leaseauto\'s, en de onderdelen zijn meer waard dan de auto.',min:600,max:1700,xp:48,base:59,cd:48,jail:140,r:3,cr:3,en:14,flee:3},
 {id:'ramkraak',n:'Ramkraak bij een elektronicazaak',d:'Een gestolen bestelbus, een etalage en negentig seconden.',min:800,max:2100,xp:55,base:58,cd:55,jail:160,r:3,cr:4,en:15,flee:3},
 {id:'gokhal',n:'Illegale pokerkelder runnen',d:'Drie tafels, een portier en de pot gaat altijd naar het huis.',min:1400,max:3600,xp:72,base:57,cd:75,jail:185,r:4,cr:4,en:17,flee:2},
 {id:'horloge',n:'Horlogeroof op een terras',d:'Een Patek aan een pols in de zon. Even groeten en weg.',min:1800,max:4200,xp:80,base:54,cd:85,jail:270,r:4,cr:5,en:18,flee:3},
 {id:'afpersing',n:'Een vastgoedbaron chanteren',d:'Hij heeft foto\'s die niemand mag zien. Jij nu ook.',min:2500,max:6000,xp:95,base:50,cd:95,jail:170,r:5,cr:5,en:20,flee:2},
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
 {id:'minister',n:'Een lobbyist op de loonlijst',d:'Hij weet welk amendement wanneer langskomt, en welke Kamerleden graag uit eten gaan.',min:70000,max:160000,xp:820,base:27,cd:490,jail:600,r:10,cr:16,en:40,flee:2},
 {id:'cryptobeurs',n:'Een cryptobeurs laten verdwijnen',d:'Op maandag is de website weg. Het geld ook.',min:80000,max:180000,xp:880,base:26,cd:510,jail:600,r:10,cr:17,en:41,flee:1},
 {id:'kaaiman',n:'Stichting op de Kaaimaneilanden',d:'Liefdadigheid op papier, een villa aan het strand in het echt.',min:90000,max:190000,xp:920,base:25,cd:530,jail:600,r:10,cr:17,en:42,flee:2},
 {id:'kartelvrede',n:'Vrede tussen twee kartels',d:'Jij zit aan het hoofd van de tafel. Iedereen betaalt.',min:120000,max:260000,xp:1100,base:24,cd:560,jail:600,r:11,cr:20,en:44,flee:3},
 {id:'tanker',n:'Een olietanker kapen',d:'Een schip vol olie dat nooit in de haven aankomt.',min:150000,max:320000,xp:1250,base:22,cd:590,jail:600,r:11,cr:22,en:46,flee:5},
 {id:'rotterdam',n:'De haven van Rotterdam',d:'Elke kraan, elke douanier en elke loods: van jou.',min:180000,max:380000,xp:1400,base:21,cd:620,jail:600,r:11,cr:24,en:48,flee:3},
 {id:'kroon',n:'De kroonjuwelen',d:'De klus waar ze over honderd jaar nog over praten.',min:250000,max:500000,xp:1800,base:18,cd:720,jail:600,r:11,cr:30,en:50,flee:5},
 // nieuw: een vijfde klus voor elke rang vanaf Dief
 {id:'webshop',n:'Nepwebshop met sneakers',d:'Een mooie site, een advertentie op Instagram en nul pakketjes.',min:550,max:1700,xp:47,base:59,cd:47,jail:145,r:3,cr:3,en:14,flee:1},
 {id:'garagebox',n:'Garageboxen leeghalen in Almere',d:'Tweehonderd boxen en één sleutel die op allemaal past.',min:1300,max:3400,xp:71,base:57,cd:72,jail:182,r:4,cr:4,en:17,flee:2},
 {id:'bouwfraude',n:'Zwartwerk op een bouwproject',d:'Veertig man op de loonlijst die nooit hebben bestaan.',min:2600,max:6200,xp:97,base:50,cd:97,jail:225,r:5,cr:5,en:20,flee:1},
 {id:'matchfix',n:'Een voetbalwedstrijd kopen',d:'Een keeper met schulden en een opvallende 0-3.',min:5800,max:12500,xp:160,base:45,cd:150,jail:290,r:6,cr:6,en:24,flee:1},
 {id:'kasteel',n:'Een kasteel in de Ardennen',d:'Familiezilver, oude meesters en een butler die alles vergeet.',min:10000,max:24000,xp:230,base:39,cd:200,jail:390,r:7,cr:8,en:29,flee:4},
 {id:'datalek',n:'Losgeld van een verzekeraar',d:'Twee miljoen dossiers en een directie die stilletjes betaalt.',min:21000,max:46000,xp:360,base:36,cd:285,jail:490,r:8,cr:10,en:32,flee:1},
 {id:'renbaan',n:'Illegaal online casino',d:'Een gokwebsite met een buitenlandse licentie en Nederlandse spelers.',min:32000,max:80000,xp:540,base:31,cd:380,jail:360,r:9,cr:12,en:36,flee:2},
 {id:'rechter',n:'Een rechter in je zak',d:'Een vrijspraak hier, een kwijtgeraakt dossier daar.',min:75000,max:170000,xp:850,base:26,cd:500,jail:600,r:10,cr:16,en:41,flee:1},
 {id:'goudreserve',n:'De goudreserve van een land',d:'Een land dat zijn eigen goud nooit meer terugziet.',min:200000,max:420000,xp:1550,base:20,cd:650,jail:600,r:11,cr:26,en:49,flee:5},
 // nieuw: een zesde klus voor elke rang
 {id:'flessen',n:'Statiegeld van andermans krat',d:'Een volle krat achter de supermarkt. Tien cent per fles, maar wel cash.',min:10,max:45,xp:5,base:92,cd:6,jail:30,r:0,cr:0,en:4,flee:1,sev:'A'},
 {id:'deurbel',n:'Je bankpas verhuren',d:'Vijftig euro voor je pas. Wat er op je rekening gebeurt, merk je later.',min:80,max:260,xp:17,base:74,cd:19,jail:55,r:1,cr:1,en:8,flee:1},
 {id:'katalysator',n:'Katalysatoren zagen',d:'Tien minuten onder een auto en je hebt platina in je tas.',min:330,max:950,xp:35,base:64,cd:33,jail:110,r:2,cr:3,en:12,flee:3},
 {id:'apotheek',n:'Apotheek na sluitingstijd',d:'Een achterdeur, een alarm van tien jaar oud en kasten vol pillen.',min:650,max:1700,xp:52,base:59,cd:52,jail:150,r:3,cr:3,en:15,flee:3},
 {id:'drukkerij',n:'Valse briefjes van vijftig',d:'Een drukpers in een schuur in Brabant. Het watermerk is bijna echt.',min:1600,max:3900,xp:78,base:55,cd:82,jail:195,r:4,cr:4,en:18,flee:2},
 {id:'wapenlading',n:'Wapenlading uit de Balkan',d:'Kisten met "landbouwmachines". Niemand maakt ze open.',min:3200,max:7200,xp:115,base:47,cd:115,jail:245,r:5,cr:6,en:22,flee:3},
 {id:'stroom',n:'Stroom aftappen voor een kwekerij',d:'Een kabel onder de stoep en een meter die stilstaat.',min:5200,max:11500,xp:155,base:46,cd:145,jail:285,r:6,cr:6,en:24,flee:2},
 {id:'stadion',n:'Stadionkassa op een topwedstrijd',d:'Vijftigduizend man, en de kassa wordt pas morgen geteld.',min:13000,max:29000,xp:270,base:38,cd:225,jail:425,r:7,cr:9,en:30,flee:4},
 {id:'scheepswerf',n:'Een megajacht op de werf',d:'Nog niet afgebouwd, wel al verkocht. Twee keer.',min:23000,max:50000,xp:380,base:34,cd:295,jail:505,r:8,cr:11,en:33,flee:3},
 {id:'satelliet',n:'Een eigen ondergrondse bank',d:'Geld dat de grens over gaat zonder ooit de grens over te gaan.',min:50000,max:120000,xp:580,base:28,cd:400,jail:480,r:9,cr:13,en:37,flee:1},
 {id:'olympisch',n:'Vastgoed in Dubai',d:'Twintig appartementen, en niemand vraagt waar het geld vandaan kwam.',min:85000,max:190000,xp:900,base:25,cd:520,jail:450,r:10,cr:17,en:42,flee:2},
 {id:'wereldbank',n:'Een lening van de Wereldbank',d:'Een land dat niet bestaat, met een president die jij bent.',min:220000,max:450000,xp:1650,base:19,cd:680,jail:600,r:11,cr:28,en:49,flee:2}];
// Rangbonus op elke buit: +6% per rang (Peetvader +66%)
const RANK_LOOT=.06;
// Families. r = vanaf rang, cred = straatcredit om binnen te komen. chance/loot/jail = familiebonus op het hoogste familielevel
// (je begint als Aspirant met 50% daarvan, elk familielevel +10%). perk = het eigen voordeel van de familie (ook 50% → 100%).
const FAMILIES=[
 {id:'garde',n:'De Nieuwe Garde',m:'NG',d:'Jonge honden uit Amsterdam-West. Snel, brutaal en loyaal tot op het bot.',r:2,cred:30,chance:4,loot:0,jail:0,col:'var(--ice)',
  perk:{n:'Snel en brutaal',d:'kortere wachttijd bij klussen',fx:{cd:.2}}},
 {id:'kurogumi',n:'Kurogumi',m:'黒',d:'Een stille clan met tatoeages tot aan de pols. Bezit de helft van de nachtclubs.',r:3,cred:70,chance:5,loot:5,jail:5,col:'var(--fg)',
  perk:{n:'De nachtclubs',d:'meer passief inkomen',fx:{inc:.2}}},
 {id:'colombra',n:'Famiglia Colombra',m:'FC',d:'Ouderwetse Italianen die nooit vergeten wie hen een gunst schuldig is.',r:4,cred:120,chance:6,loot:12,jail:10,col:'var(--green)',
  perk:{n:'Een gunst terug',d:'lagere borg',fx:{bail:.4}}},
 {id:'volkov',n:'Bratva Volkov',m:'BV',d:'Oost-Europese broederschap. Gedisciplineerd, hard en onverwoestbaar.',r:5,cred:200,chance:7,loot:15,jail:15,col:'var(--blue)',
  perk:{n:'Onverwoestbaar',d:'makkelijker vluchten en ontsnappen',fx:{flee:.25,esc:.1}}},
 {id:'halcones',n:'Los Halcones',m:'LH',d:'Een kartel met routes van de Rotterdamse haven tot diep in Zuid-Amerika.',r:6,cred:300,chance:8,loot:22,jail:20,col:'var(--acc2)',
  perk:{n:'De routes',d:'gestolen auto\'s zijn meer waard',fx:{car:.25}}},
 {id:'lucchetti',n:'Famiglia Lucchetti',m:'FL',d:'Kleermakers, advocaten en twee rechters op de loonlijst.',r:7,cred:450,chance:9,loot:28,jail:28,col:'var(--violet)',
  perk:{n:'Rechters op de loonlijst',d:'kans dat je zaak meteen wordt geseponeerd',fx:{free:.2}}},
 {id:'gambrino',n:'Famiglia Gambrino',m:'FG',d:'De grootste van de Vijf Families. Wie hier binnenkomt, gaat er niet meer uit.',r:8,cred:700,chance:10,loot:34,jail:34,col:'var(--red)',
  perk:{n:'De grootste naam',d:'meer XP',fx:{xp:.2}}},
 {id:'cupola',n:'La Cupola',m:'LC',d:'De raad van peetvaders. Alleen de allergrootsten krijgen een stoel aan tafel.',r:9,cred:1000,chance:12,loot:40,jail:40,col:'var(--acc)',
  perk:{n:'De raad',d:'meer XP en inkomen, minder hitte',fx:{xp:.1,inc:.1,heat:.2}}},
 // De vier zwaarste families: pas vanaf Huurmoordenaar, veel straatcredit en een aantal geslaagde huurmoorden (hits).
 {id:'schaduw',n:'Het Schaduwcontract',m:'SC',d:'Huurmoordenaars zonder naam en zonder gezicht. Ze bestaan niet, tot iemand ze nodig heeft.',r:7,cred:1400,hits:3,chance:12,loot:44,jail:42,col:'#9aa4b2',
  perk:{n:'Stille handen',d:'huurmoorden zijn makkelijker en betalen meer',fx:{hit:.25}}},
 {id:'nachtwacht',n:'De Nachtwacht',m:'NW',d:'Corrupte rechercheurs en oud-commando\'s. Ze weten vandaag al waar de politie morgen staat.',r:8,cred:2000,hits:8,chance:13,loot:48,jail:50,col:'#5fb3ff',
  perk:{n:'Tipgevers bij de politie',d:'veel minder hitte en lagere borg',fx:{heat:.3,bail:.3}}},
 {id:'tafel',n:'De Ronde Tafel',m:'RT',d:'Bankiers, havenbaronnen en een minister. Geld dat zo schoon is dat het glimt.',r:10,cred:3000,hits:15,chance:14,loot:55,jail:55,col:'#f2c230',
  perk:{n:'Schoon geld',d:'veel meer passief inkomen',fx:{inc:.3}}},
 {id:'erven',n:'De Erven Morano',m:'EM',d:'De oudste familie van Europa. Twaalf stoelen, en er komt er zelden één vrij.',r:11,cred:4500,hits:25,chance:15,loot:60,jail:60,col:'#ff5fa2',
  perk:{n:'Twaalf stoelen',d:'meer XP en inkomen, kortere wachttijd',fx:{xp:.15,inc:.1,cd:.15}}}];
// Familielevels: eer verdien je met klussen, auto's voor de familie en de dagelijkse missies. Grotere families vragen meer eer.
// De laatste twee (derde waarde = leiding) krijg je niet vanzelf: Onderbaas vraagt ook 3 gewonnen oorlogsslagen, Baas een gewonnen overname.
const FAM_RANKS=[['Aspirant',0],['Lid',150],['Vertrouweling',450],['Luitenant',1000],['Rechterhand',2000],['Erelid',3500],['Onderbaas',5500,1],['Baas',8000,2]];
// Grote klus van de dag (één per familie, zwaarder naarmate de familie groter is). need = dit item of beter in die soort.
const FAM_HEISTS=[
 {n:'Overval een avondwinkel',d:'Kassa leeg, camera kapot, binnen een minuut weer buiten.',vk:1,need:[],en:25,jail:90,loot:[6000,14000]},
 {n:'Beroof een gokhal',d:'De kluis achter de fruitautomaten zit elke vrijdag vol.',vk:3,need:[],en:30,jail:120,loot:[15000,35000]},
 {n:'Overval een geldtransport',d:'Twee bewakers, één busje en een route die je al weken kent.',vk:3,need:['vest'],en:35,jail:150,loot:[40000,90000]},
 {n:'Leeg een wapendepot',d:'Een kazerne in Brabant met een hek dat al jaren kapot is.',vk:5,need:['vest'],en:40,jail:180,loot:[90000,180000]},
 {n:'Onderschep een lading in de haven',d:'Een container die nooit is aangekomen, als je het de douane vraagt.',vk:7,need:['jammer'],en:45,jail:210,loot:[180000,380000]},
 {n:'Overval de bank',d:'Het hoofdkantoor op de Zuidas. Binnen in vier minuten, anders is het te laat.',vk:7,need:['vest','jammer'],en:50,jail:240,loot:[350000,750000]},
 {n:'Kraak de kluis van een privébank',d:'Kluizen vol goud van mensen die liever niet zeggen waar het vandaan komt.',vk:9,need:['helm','laptop'],en:55,jail:270,loot:[700000,1500000]},
 {n:'Overval De Nederlandsche Bank',d:'De goudvoorraad van het land. Dit doet niemand twee keer.',vk:12,need:['mil','lans'],en:60,jail:300,loot:[1500000,3500000]},
 {n:'Bevrijd een van jullie uit een gevangenentransport',d:'Een busje van de DJI, een vaste route over de A12 en een broeder die er vandaag uit moet. Niemand raakt gewond als het plan klopt.',vk:12,need:['mil','lans','crypto'],en:62,jail:330,loot:[2500000,5000000]},
 {n:'Kaap een vrachtvliegtuig op Schiphol',d:'Een pallet met bankbiljetten, vijf minuten tussen landen en de douane.',vk:12,need:['mil','lans','mol'],en:65,jail:360,loot:[4000000,8000000]},
 {n:'Beroof de diamantbeurs van Antwerpen',d:'Honderdzestig kluizen, één nacht en een alarm dat niemand ooit heeft gekraakt.',vk:12,need:['mg','mil','lans','mol'],en:68,jail:390,loot:[6000000,12000000]},
 {n:'Kraak de goudkluis onder Zürich',d:'Veertig meter onder de stad. Het goud van zeven landen, en geen weg terug.',vk:12,need:['mg','mil','lans','mol'],en:72,jail:420,loot:[10000000,20000000]}];
const PLACES={dash:'op straat',crimes:'tijdens een klus',hits:'op een dak',cars:'bij een parkeergarage',casino:'in het casino',biz:'bij je bedrijf',shop:'bij de wapenhandelaar',bank:'bij de bank',fam:'bij het familiehuis',rank:'in een café'};
// Auto's: d = moeilijkheid (1-5), b = carrosserie, lo/hi = straatwaarde, y = bouwjaren, w = hoe vaak hij op straat staat, leg = mythisch
const CARS=[
 {id:'panda',n:'Fiat Panda',b:'city2',lo:400,hi:1400,y:[2008,2019],d:1,w:26},{id:'corsa',n:'Opel Corsa',b:'hatch',lo:500,hi:1900,y:[2009,2020],d:1,w:26},
 {id:'yaris',n:'Toyota Yaris',b:'hatch3',lo:600,hi:2100,y:[2010,2020],d:1,w:24},{id:'clio',n:'Renault Clio',b:'hatch2',lo:600,hi:2250,y:[2010,2021],d:1,w:24},
 {id:'p208',n:'Peugeot 208',b:'hatch4',lo:750,hi:2500,y:[2013,2021],d:1,w:22},{id:'picanto',n:'Kia Picanto',b:'city',lo:500,hi:1600,y:[2012,2021],d:1,w:22},
 {id:'polo',n:'Volkswagen Polo',b:'hatch5',lo:750,hi:2600,y:[2011,2021],d:1,w:22},{id:'c3',n:'Citroën C3',b:'city3',lo:600,hi:2000,y:[2012,2021],d:1,w:20},
 {id:'golf',n:'Volkswagen Golf GTI',b:'hot',lo:2250,hi:7000,y:[2014,2022],d:2,w:12},{id:'focus',n:'Ford Focus ST',b:'hot2',lo:2100,hi:6000,y:[2013,2021],d:2,w:11},
 {id:'leon',n:'Cupra Leon',b:'hot3',lo:2700,hi:7500,y:[2016,2023],d:2,w:10},{id:'a3',n:'Audi S3',b:'sedan',lo:3300,hi:8500,y:[2015,2023],d:2,w:10},
 {id:'octavia',n:'Škoda Octavia RS',b:'estate',lo:2700,hi:7000,y:[2015,2023],d:2,w:10},{id:'mini',n:'Mini Cooper S',b:'hot4',lo:2400,hi:6500,y:[2014,2023],d:2,w:10},
 {id:'v60',n:'Volvo V60',b:'estate2',lo:3000,hi:8000,y:[2016,2023],d:2,w:9},{id:'gr86',n:'Toyota GR86',b:'coupe',lo:4500,hi:10000,y:[2021,2024],d:2,w:6},
 {id:'m3',n:'BMW M3',b:'sedan2',lo:10000,hi:24000,y:[2015,2024],d:3,w:5},{id:'c63',n:'Mercedes-AMG C63',b:'sedan3',lo:11000,hi:25000,y:[2015,2023],d:3,w:4.5},
 {id:'tesla',n:'Tesla Model S Plaid',b:'liftback',lo:14000,hi:28000,y:[2021,2024],d:3,w:4},{id:'rs6',n:'Audi RS6 Avant',b:'estate3',lo:16000,hi:32000,y:[2018,2024],d:3,w:4},
 {id:'rr',n:'Range Rover Sport',b:'suv',lo:16000,hi:34000,y:[2016,2024],d:3,w:4},{id:'macan',n:'Porsche Macan GTS',b:'cross',lo:14000,hi:30000,y:[2017,2024],d:3,w:4},
 {id:'x5m',n:'BMW X5 M',b:'suv2',lo:17000,hi:33000,y:[2018,2024],d:3,w:3.5},
 {id:'911',n:'Porsche 911 Carrera',b:'sport',lo:39000,hi:78000,y:[2016,2024],d:4,w:2.2},{id:'r8',n:'Audi R8',b:'super',lo:47000,hi:88500,y:[2015,2023],d:4,w:1.8},
 {id:'taycan',n:'Porsche Taycan Turbo S',b:'liftback2',lo:41500,hi:78000,y:[2020,2024],d:4,w:1.8},{id:'g63',n:'Mercedes-AMG G63',b:'offroad',lo:52000,hi:99000,y:[2018,2024],d:4,w:1.8},
 {id:'mase',n:'Maserati GranTurismo',b:'gt',lo:44000,hi:83000,y:[2018,2024],d:4,w:1.5},{id:'bent',n:'Bentley Continental GT',b:'gt2',lo:57000,hi:110000,y:[2018,2024],d:4,w:1.4},
 {id:'db12',n:'Aston Martin DB12',b:'gt3',lo:67500,hi:120000,y:[2023,2024],d:4,w:1},
 {id:'hura',n:'Lamborghini Huracán',b:'super2',lo:155000,hi:290000,y:[2017,2024],d:5,w:.6},{id:'urus',n:'Lamborghini Urus',b:'supersuv',lo:135000,hi:255000,y:[2019,2024],d:5,w:.7},
 {id:'f8',n:'Ferrari F8 Tributo',b:'super3',lo:170000,hi:305000,y:[2020,2023],d:5,w:.5},{id:'mc720',n:'McLaren 720S',b:'super4',lo:185000,hi:325000,y:[2018,2023],d:5,w:.45},
 {id:'cull',n:'Rolls-Royce Cullinan',b:'luxsuv',lo:205000,hi:375000,y:[2019,2024],d:5,w:.4},{id:'sf90',n:'Ferrari SF90 Stradale',b:'super5',lo:305000,hi:510000,y:[2020,2024],d:5,w:.22},
 {id:'chiron',n:'Bugatti Chiron',b:'hyper',lo:720000,hi:1280000,y:[2017,2023],d:5,w:.07,leg:1},{id:'jesko',n:'Koenigsegg Jesko',b:'hyper2',lo:880000,hi:1520000,y:[2022,2024],d:5,w:.05,leg:1},
 // nieuw: busjes, pick-ups, muscle cars, luxe sedans, klassiekers
 {id:'transporter',n:'Volkswagen Transporter',b:'van',lo:900,hi:3000,y:[2012,2022],d:1,w:18},{id:'prius',n:'Toyota Prius (taxi)',b:'liftback',lo:600,hi:2400,y:[2012,2021],d:1,w:18},
 {id:'i30',n:'Hyundai i30',b:'hatch2',lo:750,hi:2500,y:[2013,2022],d:1,w:18},{id:'sprinter',n:'Mercedes Sprinter',b:'van',lo:2400,hi:7000,y:[2015,2023],d:2,w:9},
 {id:'xc90',n:'Volvo XC90',b:'suv',lo:3900,hi:9500,y:[2016,2023],d:2,w:8},{id:'mustang',n:'Ford Mustang GT',b:'muscle',lo:11000,hi:25000,y:[2016,2024],d:3,w:4},
 {id:'raptor',n:'Ford Ranger Raptor',b:'pickup',lo:12000,hi:27000,y:[2019,2024],d:3,w:3.5},{id:'challenger',n:'Dodge Challenger SRT',b:'muscle',lo:14000,hi:30000,y:[2017,2023],d:3,w:3},
 {id:'sklasse',n:'Mercedes S-Klasse',b:'luxury',lo:41500,hi:78000,y:[2019,2024],d:4,w:1.8},{id:'e280',n:'Mercedes 280 SE (1971)',b:'classic',lo:36500,hi:73000,y:[1968,1972],d:4,w:1.2},
 {id:'limo',n:'Stretch-limousine',b:'limo',lo:47000,hi:93500,y:[2010,2020],d:4,w:1},{id:'etype',n:'Jaguar E-Type (1965)',b:'classic',lo:135000,hi:265000,y:[1961,1968],d:5,w:.35},
 {id:'phantom',n:'Rolls-Royce Phantom',b:'luxury',lo:220000,hi:390000,y:[2018,2024],d:5,w:.3}
 // exclusief (zeldzaam en veel waard): hypercars en topklassiekers
 ,{id:'p918',n:'Porsche 918 Spyder',b:'super',lo:300000,hi:520000,y:[2014,2015],d:5,w:.16},{id:'p1',n:'McLaren P1',b:'super4',lo:320000,hi:560000,y:[2013,2015],d:5,w:.14},
 {id:'spectre',n:'Rolls-Royce Spectre',b:'luxury',lo:230000,hi:400000,y:[2023,2024],d:5,w:.2},{id:'laf',n:'Ferrari LaFerrari',b:'super3',lo:650000,hi:1150000,y:[2013,2016],d:5,w:.04,leg:1},
 {id:'huayra',n:'Pagani Huayra',b:'hyper',lo:700000,hi:1250000,y:[2012,2022],d:5,w:.035,leg:1},{id:'amgone',n:'Mercedes-AMG One',b:'hyper2',lo:750000,hi:1350000,y:[2022,2024],d:5,w:.03,leg:1}
 // k = klasse (zie autos.js carClassW): 1 = de markt van Ritselaar t/m Huurmoordenaar, 2 = Kapitein t/m Peetvader.
 // Hoe meer steelervaring, hoe vaker je ze tegenkomt; onder die rang zie je ze minder vaak. Zonder k: de gewone straatmarkt.
 ,{id:'m5',n:'BMW M5 Competition',b:'sedan2',lo:22000,hi:42000,y:[2018,2024],d:3,w:3,k:1},{id:'rs7',n:'Audi RS7 Sportback',b:'liftback2',lo:24000,hi:45000,y:[2019,2024],d:3,w:2.8,k:1},
 {id:'e63',n:'Mercedes-AMG E63 S',b:'sedan3',lo:24000,hi:44000,y:[2018,2023],d:3,w:2.8,k:1},{id:'gtr',n:'Nissan GT-R Nismo',b:'coupe',lo:26000,hi:52000,y:[2017,2023],d:3,w:2.4,k:1},
 {id:'z06',n:'Chevrolet Corvette Z06',b:'sport',lo:28000,hi:55000,y:[2020,2024],d:3,w:2.2,k:1},{id:'cayenne',n:'Porsche Cayenne Turbo GT',b:'cross',lo:30000,hi:56000,y:[2021,2024],d:3,w:2.4,k:1},
 {id:'lc500',n:'Lexus LC 500',b:'gt',lo:26000,hi:48000,y:[2018,2024],d:3,w:2.2,k:1},{id:'defender',n:'Land Rover Defender V8',b:'offroad',lo:25000,hi:48000,y:[2021,2024],d:3,w:2.6,k:1},
 {id:'gt3rs',n:'Porsche 911 GT3 RS',b:'sport',lo:70000,hi:130000,y:[2019,2024],d:4,w:1.2,k:1},{id:'amggt',n:'Mercedes-AMG GT Black Series',b:'sport',lo:80000,hi:150000,y:[2020,2023],d:4,w:.9,k:1},
 {id:'vantage',n:'Aston Martin Vantage',b:'gt3',lo:60000,hi:110000,y:[2019,2024],d:4,w:1.2,k:1},{id:'m8',n:'BMW M8 Competition',b:'gt',lo:55000,hi:100000,y:[2019,2024],d:4,w:1.3,k:1},
 {id:'maybach',n:'Mercedes-Maybach S 680',b:'luxury',lo:75000,hi:140000,y:[2021,2024],d:4,w:1,k:1},{id:'ghost',n:'Rolls-Royce Ghost',b:'luxury',lo:90000,hi:165000,y:[2020,2024],d:4,w:.8,k:1},
 {id:'emira',n:'Lotus Emira',b:'sport',lo:50000,hi:90000,y:[2022,2024],d:4,w:1.3,k:1},{id:'bentayga',n:'Bentley Bentayga Speed',b:'luxsuv',lo:70000,hi:130000,y:[2020,2024],d:4,w:1,k:1},
 {id:'dbx',n:'Aston Martin DBX707',b:'supersuv',lo:75000,hi:135000,y:[2022,2024],d:4,w:.9,k:1},
 {id:'f296',n:'Ferrari 296 GTB',b:'super3',lo:220000,hi:380000,y:[2022,2024],d:5,w:.3,k:2},{id:'revuelto',n:'Lamborghini Revuelto',b:'super2',lo:380000,hi:650000,y:[2023,2024],d:5,w:.18,k:2},
 {id:'f812',n:'Ferrari 812 Competizione',b:'gt',lo:300000,hi:520000,y:[2021,2023],d:5,w:.2,k:2},{id:'senna',n:'McLaren Senna',b:'super4',lo:600000,hi:950000,y:[2018,2020],d:5,w:.1,k:2},
 {id:'cullbb',n:'Rolls-Royce Cullinan Black Badge',b:'luxsuv',lo:260000,hi:420000,y:[2020,2024],d:5,w:.25,k:2},{id:'g650',n:'Mercedes-Maybach G 650 Landaulet',b:'offroad',lo:450000,hi:800000,y:[2017,2018],d:5,w:.12,k:2},
 {id:'nevera',n:'Rimac Nevera',b:'hyper',lo:1000000,hi:1700000,y:[2021,2024],d:5,w:.04,leg:1,k:2},{id:'sl300',n:'Mercedes 300 SL Gullwing (1955)',b:'classic',lo:1100000,hi:1800000,y:[1954,1957],d:5,w:.035,leg:1,k:2},
 {id:'miura',n:'Lamborghini Miura SV (1971)',b:'classic',lo:1500000,hi:2400000,y:[1971,1973],d:5,w:.03,leg:1,k:2},{id:'f40',n:'Ferrari F40',b:'super3',lo:1600000,hi:2600000,y:[1987,1992],d:5,w:.03,leg:1,k:2},
 {id:'sp3',n:'Ferrari Daytona SP3',b:'super5',lo:1500000,hi:2500000,y:[2022,2024],d:5,w:.03,leg:1,k:2},{id:'utopia',n:'Pagani Utopia',b:'hyper',lo:1800000,hi:3000000,y:[2023,2024],d:5,w:.025,leg:1,k:2},
 {id:'valkyrie',n:'Aston Martin Valkyrie',b:'hyper2',lo:2200000,hi:3500000,y:[2021,2024],d:5,w:.02,leg:1,k:2},{id:'speedtail',n:'McLaren Speedtail',b:'super4',lo:2000000,hi:3200000,y:[2020,2021],d:5,w:.02,leg:1,k:2},
 {id:'divo',n:'Bugatti Divo',b:'hyper2',lo:2800000,hi:4200000,y:[2019,2021],d:5,w:.012,leg:1,k:2},{id:'mistral',n:'Bugatti Mistral',b:'hyper',lo:3000000,hi:4500000,y:[2024,2024],d:5,w:.01,leg:1,k:2}];
const CAR_LEVEL=['','makkelijk','redelijk','lastig','moeilijk','extreem'];
const CAR_RARITY=[null,['Gewoon','#9aa1ab'],['Ongewoon','#3fe395'],['Zeldzaam','#4d9dff'],['Episch','#b8a1ff'],['Legendarisch','#ffad6b']];
const CAR_MYTH=['Mythisch','#ff3d52'];
const CAR_SPOTS=['Op de stoep in De Pijp','Parkeergarage aan de Zuidas','Voor een villa in Amsterdam-Zuid','Bedrijventerrein Westpoort','Tankstation aan de A10',
 'Donker steegje bij de Wallen','Parkeerplaats van een sportschool','Oprit in Amstelveen','Achter een nachtclub op het Rembrandtplein','Laadpaal in Oost','Hotel aan de Amstel','Showroom op het Gooiplein'];
// Bedrijven: p = prijs eerste vestiging (elke volgende ×1,25), r = minimale rang. Inkomen telt per SPELDAG (4 uur) en wordt
// om de 4 uur uitbetaald (00:00, 04:00, 08:00 ...). inc = euro per speldag op level 1 (wordt hieronder uit de prijs berekend).
// Elke vestiging kan 4 keer upgraden (level 1-5); up = de namen van die upgrades.
const BIZ=[
 {id:'wash',cat:'dienst',n:'Wasserette',d:'Wast meer dan alleen kleding.',p:5000,inc:40,r:1,col:'#a9dcff',up:['Extra machines','Droogtrommels','Bezorgservice','Witwasafdeling']},
 {id:'boven',cat:'vastgoed',n:'Bovenwoningen',d:'Een rij bovenhuizen boven de winkels. De huur komt contant binnen.',p:30000,inc:0,r:2,col:'#d9b48a',up:['Nieuwe keukens','Dakkapellen','Kamerverhuur','Hele portiek']},
 {id:'snack',cat:'horeca',n:'Snackbar',d:'Frikandellen voor de buurt, enveloppen voor de baas.',p:12000,inc:95,r:2,col:'#ffad6b',up:['Nieuwe frituur','Bezorgscooters','Nachtloket','Tweede keuken']},
 {id:'shop',cat:'dienst',n:'Belwinkel',d:'Goede dekmantel, constante cashflow.',p:20000,inc:180,r:3,col:'#3fe395',up:['Simkaarten in bulk','Reparatiebalie','Geld overmaken','Eigen prepaid-netwerk']},
 {id:'barber',cat:'dienst',n:'Barbershop',d:'Fades, baardolie en de roddels uit de hele wijk.',p:35000,inc:300,r:3,col:'#ff7fb3',up:['Extra stoelen','Tattoohoek','VIP-kamer','Eigen productlijn']},
 {id:'autogarage',cat:'auto',n:'Autogarage',d:'APK, banden en zo nu en dan een ander kenteken.',p:60000,inc:520,r:4,col:'#ff7a1a',up:['Hefbrug','Spuitcabine','Tuningafdeling','Showroom']},
 {id:'shisha',cat:'horeca',n:'Shishalounge',d:'Rook, muziek en een achterkamer zonder camera\'s.',p:75000,inc:650,r:4,col:'#b8a1ff',up:['Loungebanken','Dakterras','Eigen DJ','Privékamers']},
 {id:'club',cat:'horeca',n:'Nachtclub',d:'VIP-ruimte, portiers en dure flessen.',p:90000,inc:900,r:5,col:'#ff3d52',up:['Lichtshow','Extra bar','Bekende DJ\'s','Skybox']},
 {id:'dealer',cat:'auto',n:'Autodealer',d:'Dure wagens, contant betaald, geen vragen.',p:150000,inc:1500,r:6,col:'#4d9dff',up:['Grotere showroom','Leasedesk','Exportlijn','Exclusieve merken']},
 {id:'garage',cat:'auto',n:'Chop shop',d:'Gestolen auto\'s omkatten en doorverkopen.',p:250000,inc:2800,r:7,col:'#c9a227',up:['Snijbranders','Onderdelenmagazijn','Containerexport','Valse papieren']},
 {id:'winkelpand',cat:'vastgoed',n:'Winkelpanden',d:'Panden in de winkelstraat. Jij int de huur, de huurders vragen niks.',p:300000,inc:0,r:7,col:'#8fd3ff',up:['Nieuwe puien','Bovenverdieping erbij','Hoekpand','Hele straatkant']},
 {id:'hotel',cat:'horeca',n:'Boetiekhotel',d:'Kamers op uurbasis en een kluis achter de receptie.',p:450000,inc:5000,r:8,col:'#e6e1d6',up:['Rooftop bar','Spa','Suites','Privé-ingang']},
 {id:'speelhal',cat:'horeca',n:'Speelhal',d:'Gokkasten, pokertafels en een kassa die nooit leeg is.',p:650000,inc:7500,r:9,col:'#f2c230',up:['Meer kasten','Pokerzaal','High-roller-kamer','Eigen wisselkantoor']},
 {id:'port',cat:'handel',n:'Havenloods',d:'Controle over de smokkel in Rotterdam.',p:900000,inc:11000,r:9,col:'#38bdf8',up:['Eigen kraan','Koelcontainers','Contact bij de douane','Tweede kade']},
 {id:'bedrijfshal',cat:'vastgoed',n:'Bedrijfshallen',d:'Loodsen op het industrieterrein. Niemand vraagt wat er binnen staat.',p:1100000,inc:0,r:9,col:'#a3b18a',up:['Laadperrons','Koelcel','Hek en camera\'s','Tweede hal']},
 {id:'vastgoed',cat:'vastgoed',n:'Vastgoedportefeuille',d:'Panden in de hele stad, de huur gaat contant.',p:2000000,inc:26000,r:10,col:'#9aa1ab',up:['Studentenpanden','Kantoortoren','Projectontwikkeling','Grond in de haven']},
 {id:'jet',cat:'handel',n:'Privéjet-charter',d:'Vluchten zonder passagierslijst.',p:4000000,inc:55000,r:11,col:'#ffffff',up:['Tweede toestel','Eigen hangar','Internationale route','Luchthavenlounge']}];
// Categorieën voor Bezit. Vastgoed verdient 20% meer huur dan een zaak van dezelfde prijs, maar daar kun je niet door witwassen.
const BIZ_CATS=[
 {id:'dienst',n:'Winkels en diensten',d:'Kleine zaken in de buurt. Goedkoop, en elke kassa is een wasstraat.'},
 {id:'horeca',n:'Horeca en nachtleven',d:'Contant geld, laat open en veel klanten: daar valt een zwarte bon niet op.'},
 {id:'auto',n:"Auto's",d:'Garages en showrooms. Grote bedragen per klant en weinig vragen.'},
 {id:'handel',n:'Handel en transport',d:'De haven en vliegtuigen. Duur, maar daar gaat het grote geld doorheen.'},
 {id:'vastgoed',n:'Vastgoed',d:'Huur komt vanzelf binnen, 20% meer dan een zaak van dezelfde prijs. Witwassen kan hier niet: er gaat niks over de toonbank.',nowash:1}];
// Maximaal aantal vestigingen per zaak hangt af van je lidmaatschap: gewoon 10, VIP 12, High roller 15 (tier() staat in state.js).
const BIZ_MAX_TIER=[10,12,15];const bizMax=()=>BIZ_MAX_TIER[typeof tier==='function'?tier():0]||BIZ_MAX_TIER[0];
const BIZ_MAX=10,BIZ_LVL=['Basis','Opgeknapt','Uitgebreid','Topzaak','Imperium'],BIZ_MULT=[1,1.5,2.2,3.1,4.3],BIZ_UPK=[.6,1.1,1.9,3.2];
const BIZ_PLACES=['De Pijp','Oost','Noord','West','Zuidoost','Jordaan','Zaandam','Rotterdam','Den Haag','Utrecht'];
const bizPrice=(b,n)=>Math.floor(b.p*Math.pow(1.25,n));
const bizUpCost=(b,l)=>Math.floor(b.p*BIZ_UPK[l-1]);
// Passief inkomen groeit mee met je imperium: +25% basis, +0,5% per vestiging en +0,25% per upgrade (samen max +50%),
// en +3% per rang (+0,5% per level binnen je rang). bizMult() staat in state.js.
const BIZ_BOOST=1.25,BIZ_IMP_UNIT=.005,BIZ_IMP_UP=.0025,BIZ_IMP_MAX=.5,BIZ_RANK=.03;
// Inkomen per speldag (4 uur) op level 1: een vast deel van de prijs. Goedkope zaken verdienen zich sneller terug
// (wasserette ±25% van de prijs per dag), dure langzamer (privéjet ±10%). Zo kun je het spel niet in een paar uur uitspelen.
const DAY_MS=4*3600000,BIZ_DAY_RATE=p=>.25*Math.pow(p/5000,-.14);
BIZ.forEach(b=>{b.inc=Math.round(b.p*BIZ_DAY_RATE(b.p)*(b.cat==='vastgoed'?1.2:1)/10)*10});
const bizIncRaw=(b,l)=>b.inc*BIZ_MULT[l-1];
const bizInc=(b,l)=>bizIncRaw(b,l)*(typeof bizMult==='function'?bizMult().total:1);
// Uitrusting in 4 soorten. Per soort telt alleen je beste item; wat je koopt houd je.
// kans = slaagkans (+%), buit = buit (+%), car = meer tijd bij auto stelen (+%), heat = minder hitte (−%),
// jail = kortere celstraf (−%), vk = vuurkracht (zware familiemissies vragen om een minimum). r = vanaf rang.
const GEAR_CATS=[
 {id:'wapen',n:'Wapens',d:'Meer kans dat een klus lukt. Zware familiemissies vragen om vuurkracht.',ic:'gun',col:'#ff6b6b'},
 {id:'pantser',n:'Bescherming',d:'Je durft meer en zit korter vast als het toch misgaat.',ic:'vest',col:'#a9dcff'},
 {id:'tools',n:'Gereedschap',d:'Je weet beter waar het geld ligt en krijgt auto\'s sneller open.',ic:'tool',col:'#ffd166'},
 {id:'comm',n:'Communicatie',d:'Je hoort de politie eerder aankomen: minder hitte na elke klus.',ic:'radio',col:'#b8a1ff'},
 {id:'vervoer',n:'Vervoer',d:'Iets om mee weg te komen. Als het misgaat, ben je sneller weg.',ic:'cars',col:'#7fd1c7'}];
const GEAR=[
 {id:'mes',cat:'wapen',n:'Vlindermes',d:'Klein, snel en makkelijk weg te gooien.',p:800,r:0,kans:3,vk:1,ic:'knife'},
 {id:'pistool',cat:'wapen',n:'Glock 17',d:'Het standaardwerk. Betrouwbaar en niet te zwaar.',p:6000,r:2,kans:6,vk:3,ic:'gun'},
 {id:'uzi',cat:'wapen',n:'Uzi',d:'Compact en veel kogels in weinig tijd.',p:28000,r:4,kans:9,vk:5,ic:'gun'},
 {id:'ak',cat:'wapen',n:'AK-47',d:'Iedereen weet wat het is. Iedereen doet wat je zegt.',p:75000,r:5,kans:12,vk:7,ic:'rifle'},
 {id:'sniper',cat:'wapen',n:'Scherpschuttersgeweer',d:'Voor werk van een afstand.',p:320000,r:7,kans:15,vk:9,ic:'rifle'},
 {id:'mg',cat:'wapen',n:'Machinegeweer',d:'Voor als het echt niet anders kan.',p:1250000,r:9,kans:18,vk:12,ic:'rifle'},
 {id:'jack',cat:'pantser',n:'Leren jack',d:'Beter dan niks, en het staat goed.',p:1500,r:0,kans:1,jail:3,ic:'vest'},
 {id:'vest',cat:'pantser',n:'Kogelvrij vest',d:'Onder je jas zie je het niet.',p:20000,r:3,kans:5,jail:8,ic:'vest'},
 {id:'helm',cat:'pantser',n:'Zwaar vest met helm',d:'Je loopt er niet mee over straat, maar bij een overval wel.',p:140000,r:6,kans:7,jail:12,ic:'helmet'},
 {id:'mil',cat:'pantser',n:'Militaire uitrusting',d:'Van een legerbasis die er niet over praat.',p:650000,r:8,kans:9,jail:16,ic:'helmet'},
 {id:'koevoet',cat:'tools',n:'Koevoet',d:'Elke deur gaat open als je maar hard genoeg duwt.',p:500,r:0,buit:2,car:3,ic:'tool'},
 {id:'lockpick',cat:'tools',n:'Lockpickset',d:'Zonder krassen naar binnen.',p:4500,r:1,buit:4,car:6,ic:'tool'},
 {id:'jammer',cat:'tools',n:'Signaalverstoorder',d:'Alarmen en sleutelkastjes zwijgen.',p:32000,r:4,buit:7,car:10,ic:'chip'},
 {id:'laptop',cat:'tools',n:'Hackerslaptop',d:'Camera\'s uit, startonderbreker uit.',p:160000,r:6,buit:10,car:14,ic:'laptop'},
 {id:'lans',cat:'tools',n:'Thermische lans',d:'Door een kluisdeur in een paar minuten.',p:750000,r:8,buit:14,car:18,ic:'torch'},
 {id:'prepaid',cat:'comm',n:'Prepaid telefoon',d:'Op naam van niemand.',p:300,r:0,heat:10,ic:'phone'},
 {id:'scanner',cat:'comm',n:'Politiescanner',d:'Je hoort de meldkamer mee.',p:12000,r:2,heat:25,ic:'radio'},
 {id:'crypto',cat:'comm',n:'Versleutelde telefoon',d:'Berichten die niemand kan lezen.',p:85000,r:5,heat:40,ic:'phone'},
 {id:'mol',cat:'comm',n:'Mol bij de politie',d:'Een agent die je op tijd belt.',p:600000,r:8,heat:55,ic:'ear'},
 {id:'scooter',cat:'vervoer',n:'Opgevoerde fatbike',d:'Haalt vijftig in de binnenstad, zonder trappen, en past door elke steeg.',p:1200,r:0,flee:6,ic:'moto'},
 {id:'cross',cat:'vervoer',n:'Crossmotor',d:'Over stoepen, door parken en dwars door het Vondelpark.',p:9500,r:2,flee:10,ic:'moto'},
 {id:'sedan',cat:'vervoer',n:'Grijze sedan met valse platen',d:'Niemand kijkt om, maar onder de motorkap zit een beest.',p:48000,r:4,flee:14,heat:5,ic:'cars'},
 {id:'speedboot',cat:'vervoer',n:'Speedboot in de haven',d:'Via de grachten naar het IJ, en dan ben je weg.',p:210000,r:6,flee:18,heat:5,ic:'yacht'},
 {id:'heli',cat:'vervoer',n:'Helikopter op afroep',d:'Een piloot die geen vragen stelt, twintig minuten van elke plek.',p:1800000,r:9,flee:25,heat:8,ic:'heli'}];
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
// Soorten misdaad: per soort bouw je ervaring op (S.crx). Elke klus telt (gelukt 1, mislukt een half);
// hoe meer ervaring in een soort, hoe hoger je kans op álle klussen van die soort (zie crxBonus in state.js).
const CR_CATS={straat:['Straatwerk','#ffb36b','Zakkenrollen, stelen van de straat, klusjes'],kraak:['Inbraak en kraken','#ff7a1a','Inbreken, kluizen en grote kraken'],
 geweld:['Overvallen','#ff5a5f','Overvallen, afpersen en transporten'],fraude:['Oplichting','#b8a1ff','Fraude, valse spullen en heling'],
 smokkel:['Smokkel en handel','#5ce1c4','Havens, wapens, wiet en gokken'],invloed:['Witteboord en invloed','#f2c230','Omkopen, witwassen en invloed']};
const CR_CAT={bedelen:'straat',zakken:'straat',winkeldief:'straat',fiets:'straat',pakket:'straat',flessen:'straat',deurbel:'fraude',spuiten:'straat',envelop:'straat',koper:'straat',katalysator:'straat',scooter:'straat',
 autokraak:'kraak',horloge:'geweld',stadion:'kraak',inbraak:'kraak',pand:'kraak',parkeer:'kraak',ramkraak:'kraak',garagebox:'kraak',apotheek:'kraak',kasteel:'kraak',kunst:'kraak',diamant:'kraak',casino:'kraak',centralebank:'kraak',londen:'kraak',geneve:'kraak',kroon:'kraak',goudreserve:'kraak',
 winkel:'geweld',snackbar:'geweld',juwelier:'geweld',vrachtwagen:'geweld',transport:'geweld',bank:'geweld',afpersing:'geweld',rivaal:'geweld',goud:'geweld',jet:'geweld',tanker:'geweld',
 telefoon:'fraude',fruitautomaat:'fraude',tickets:'fraude',heling:'fraude',webshop:'fraude',veiling:'fraude',bouwfraude:'fraude',drukkerij:'fraude',datalek:'fraude',cryptobeurs:'fraude',scheepswerf:'fraude',
 smokkel:'smokkel',container:'smokkel',wapenlading:'smokkel',stroom:'smokkel',gokhal:'smokkel',jacht:'smokkel',rotterdam:'smokkel',
 witwas:'invloed',satelliet:'invloed',havenbaas:'invloed',voorkennis:'invloed',aanbesteding:'invloed',matchfix:'invloed',renbaan:'invloed',rechter:'invloed',minister:'invloed',kaaiman:'invloed',kartelvrede:'invloed',olympisch:'invloed',wereldbank:'invloed'};
// ervaring nodig per level (0 = nieuw, 10 = meester van het vak)
const CRX_T=[0,5,15,35,70,120,200,320,500,750,1100];
const TRAIN_MAX=50;
// Percentages met passende precisie: kleine effecten (+0,4% of +0,08%) worden nooit als +0% getoond.
// pt = procentpunten (iets dat direct bij een kans opgeteld wordt), anders gewoon procent.
const pctTxt=(v,sign,pt)=>{if(!v)return '0'+(pt?'%-punt':'%');const a=Math.abs(v),d=a>=10?0:a>=1?1:a>=.1?1:2;
 return sign+a.toLocaleString('nl-NL',{maximumFractionDigits:d,minimumFractionDigits:0})+(pt?'%-punt':'%')};
// Effect per level (op level 50 haal je het maximum). Eén sessie = één level.
const SK={conditie:{en:3,zone:.008},duur:{save:.006,regen:.006},ademhaling:{focus:.06,flee:.004,adem:.012},sloten:{zone:.0045,speed:.009,kans:.3},steal:{all:.4,zakken:.8},speed:{cd:.01,mark:.006},cars:{time:.01,price:.008},charisma:{talk:.9,bail:.008},
 schiet:{heavy:.5},hack:{loot:.5},handel:{inc:.4,fee:1},rechten:{jail:1,bail:.4}};
const HEAVY_R=RK[5]; // zware klussen: vanaf Gangster
// Prijs per sessie stijgt steil: level 1 kost een paar tientjes, de laatste levels honderdduizenden euro's.
const trainCost=(t,l)=>Math.round(t.base*Math.pow(1+l,1.9)*Math.pow(1.04,l)/10)*10;
const TRAIN_MILES=[10,20,30,40,50];
// Effect van training op het vluchtspel (Rennen!, flee.js FL_K), in % per level: conditie → adem gaat langzamer op,
// snelheid → sneller van baan, ademhaling → minder adem kwijt bij struikelen, uithouding → sneller weer op snelheid
const FLK_TXT={drain:1,lane:.6,hit:1,rec:.3};
const TRAININGS=[
 {id:'conditie',place:'Sportschool',n:'Conditie',col:'#3fe395',ic:'gym',base:60,cd:12,
  d:'Krachttraining en cardio. Je hebt meer energie en houdt het langer vol als je moet vluchten.',
  eff:l=>[['Max. energie','+'+Math.round(SK.conditie.en*l)],['Adem bij vluchten (Rennen!)',pctTxt(l*FLK_TXT.drain,'-')]]},
 {id:'steal',place:'Albert Cuypmarkt',n:'Vingervlugheid',col:'#a9dcff',ic:'hand',base:80,cd:15,
  d:'Oefenen tussen de kraampjes. Je handen worden sneller dan hun ogen.',
  eff:l=>[['Slaagkans alle klussen',pctTxt(SK.steal.all*l,'+',1)],['Bij zakkenrollen',pctTxt(SK.steal.zakken*l,'+',1)]]},
 {id:'speed',place:'Atletiekbaan',n:'Snelheid',col:'#b8a1ff',ic:'run',base:100,cd:15,
  d:'Sprinten en intervallen. Je bent sneller klaar en sneller weg.',
  eff:l=>[['Kortere wachttijd',pctTxt(SK.speed.cd*100*l,'-')],['Sneller van baan wisselen bij vluchten',pctTxt(l*FLK_TXT.lane,'-')]]},
 {id:'cars',place:'Circuit Zandvoort',n:'Rijvaardigheid',col:'#ffad6b',ic:'wheel',base:120,cd:20,
  d:'Rondjes op het circuit. Je hebt meer tijd bij het contact maken en weet beter wat een wagen waard is.',
  eff:l=>[['Meer tijd bij contact maken',pctTxt(SK.cars.time*100*l,'+')],['Verkoopwaarde gestolen auto',pctTxt(SK.cars.price*100*l,'+')]]},
 {id:'charisma',place:'Toneelschool',n:'Charisma',col:'#ff7fb3',ic:'mask',base:150,cd:20,
  d:'Acteerles in de Jordaan. Agenten geloven je verhaal sneller, en bij een familiegesprek praat je je overal doorheen.',
  eff:l=>[['Kans om je eruit te praten',pctTxt(Math.min(45,SK.charisma.talk*l),'',1)],['Korting op borg',pctTxt(SK.charisma.bail*100*l,'')],['Familiegesprek',Math.floor(l/15)+' hint'+(Math.floor(l/15)===1?'':'s')+(l>=25?', 1 fout mag':'')]]},
 // nieuwe plekken: pas open vanaf een bepaalde rang (r), duurder en met een langer tijdslot
 {id:'schiet',place:'Schietvereniging Ede',n:'Schieten',col:'#ff6b6b',ic:'target',base:180,cd:25,r:3,
  d:'Op de baan tussen jagers en agenten in hun vrije tijd. Zware klussen lukken vaker.',
  eff:l=>[['Slaagkans zware klussen (vanaf Gangster)',pctTxt(SK.schiet.heavy*l,'+',1)],['Rustiger vizier bij huurmoorden',pctTxt(Math.min(40,l*.8),'−')],['Vastere hand bij huurmoorden (minder trillen)',pctTxt(Math.min(45,l*45/40),'+')]]},
 {id:'hack',place:'Hackerskelder in Delft',n:'Hacken',col:'#5ce1c4',ic:'chip',base:220,cd:25,r:4,
  d:'Alarmcodes, camera\'s en bankapps. Je weet beter waar het geld ligt.',
  eff:l=>[['Buit bij alle klussen',pctTxt(SK.hack.loot*l,'+')]]},
 {id:'handel',place:'Zakenschool Nyenrode',n:'Handelsgeest',col:'#ffd166',ic:'brief',base:260,cd:30,r:5,
  d:'Boekhouden, onderhandelen en witwassen voor gevorderden. Je zaken draaien beter.',
  eff:l=>[['Passief inkomen',pctTxt(SK.handel.inc*l,'+')],['Kosten bij beleggen',pctTxt(SK.handel.fee*l,'-')]]},
 {id:'rechten',place:'Avondstudie rechten',n:'Rechtenkennis',col:'#9db4ff',ic:'scale',base:300,cd:30,r:6,
  d:'Wetboeken op de Zuidas. Je weet precies wat ze wel en niet kunnen bewijzen.',
  eff:l=>[['Kortere celstraf',pctTxt(SK.rechten.jail*l,'-')],['Lagere borg',pctTxt(SK.rechten.bail*l,'-')]]},
 // nieuw: uithoudingsvermogen (minder energie per klus) en ademhaling (rustiger bij klussen en vluchten)
 {id:'duur',place:'Hardloopclub langs de Amstel',n:'Uithouding',col:'#5fe3a6',ic:'run',base:90,cd:15,
  d:'Lange rondjes in een rustig tempo. Je lijf leert zuinig met energie om te gaan: elke klus kost minder en je laadt sneller op.',
  eff:l=>[['Energie per klus',pctTxt(SK.duur.save*100*l,'-')],['Energie laadt sneller op',pctTxt(SK.duur.regen*100*l,'+')],['Sneller herstel bij vluchten',pctTxt(l*FLK_TXT.rec,'+')]]},
 {id:'ademhaling',place:'Yogaschool in Oost',n:'Ademhaling',col:'#c9a2ff',ic:'spa',base:110,cd:15,r:1,game:'breath',
  d:'Ademen in vier tellen, vasthouden, uitademen. Je hartslag blijft laag als het spannend wordt. Je traint het zelf: tik op het ritme van de ademhaling.',
  eff:l=>[['Slaagkans alle klussen',pctTxt(SK.ademhaling.focus*l,'+',1)],['Ruimte bij paniek',pctTxt(SK.ademhaling.adem*100*l,'+')],['Adem kwijt bij struikelen (vluchten)',pctTxt(l*FLK_TXT.hit,'-')]]},
 {id:'sloten',place:'Werkplaats van een oud-inbreker',n:'Slotenkraken',col:'#ffd166',ic:'key',base:95,cd:15,r:1,game:'lock',
  d:'Een gepensioneerde inbreker met een muur vol sloten. Je traint het zelf: zet de pinnen op het juiste moment. Hoe hoger je level, hoe groter het groene stuk en hoe rustiger de naald.',
  eff:l=>[['Groen stuk bij een slot',pctTxt(SK.sloten.zone*100*l,'+')],['Naald trager',pctTxt(SK.sloten.speed*100*l,'−')],['Slaagkans bij een slot',pctTxt(SK.sloten.kans*l,'+',1)]]}];
// Kalmte: groeit door te ontspannen (punten per ontspanning: kort 1, echt 3, luxe 8). Level 0–10 (KALM_T).
// Hoe kalmer, hoe meer energie je uit ontspannen haalt, hoe langzamer de paniek oploopt bij een slot en hoe ruimer het ademvenster.
const KALM_T=[0,4,12,25,45,70,100,140,190,250,320],KALM_PTS=[1,3,8];
const KALM_LV=['Gespannen','Onrustig','Wat rustiger','Stabiel','Kalm','Heel kalm','Koelbloedig','IJskoud','Onverstoorbaar','Zen','Meester van de rust'];
// Klussen waar een slot op kan zitten (kans per keer)
const CR_LOCK={fiets:.35,scooter:.3,autokraak:.4,inbraak:.5,pand:.45,garagebox:.5,apotheek:.45,parkeer:.35,ramkraak:.25,kasteel:.45,kunst:.45,diamant:.5,casino:.5,centralebank:.55,londen:.45,geneve:.55,kroon:.5,goudreserve:.55,koper:.25,stroom:.3};
// Oude saves telden sessies per level (2, 2, 3, 3, ...). Nu telt elke gedane sessie als één level.
function migrateTrain(d){if(d.trainV===2)return;d.skills=d.skills||{};d.train=d.train||{};
 TRAININGS.forEach(t=>{const L=d.skills[t.id]||0;let n=d.train[t.id]||0;for(let l=0;l<L;l++)n+=2+Math.floor(l/2);d.skills[t.id]=Math.min(TRAIN_MAX,n)});d.train={};d.trainV=2}

// Ontspanning: tijdelijke effecten, elk met een eigen wachttijd (min). Hoe beter, hoe duurder en hoe langer je moet wachten.
// Prijs = basis × (1 + 0,5 per rang) × (1 + 10% per level binnen je rang). r = vanaf welke rang. tier: 0 snel, 1 ontspannen, 2 luxe.
// focus = slaagkans (+%, mins), loot = buit (+%, mins), hp/energy (999 = vol), heat = minder hitte, clearWanted = van de gezochtlijst
const RELAX_TIERS=['Even bijkomen','Echt ontspannen','Luxe'];
const RELAX=[
 {id:'espresso',tier:0,place:'Italiaanse bar',n:'Dubbele espresso',col:'#ffad6b',ic:'cup',cd:20,base:15,
  d:'Snel een bakje bij Luigi. Kleine oppepper.',energy:12},
 {id:'shoarma',tier:0,place:'Shoarmazaak in De Pijp',n:'Broodje shoarma',col:'#ffd166',ic:'snack',cd:30,base:50,
  d:'Om drie uur \'s nachts, extra knoflooksaus. Het doet wonderen.',hp:15,energy:8},
 {id:'kapper',tier:0,place:'Barbershop in West',n:'Nieuwe look',col:'#ff7fb3',ic:'scissors',cd:45,base:220,
  d:'Een andere snit en een strakke baard. Agenten herkennen je minder snel.',heat:20},
 {id:'sauna',tier:1,place:'Sauna & massage',n:'Herstellen',col:'#a9dcff',ic:'steam',cd:45,base:150,
  d:'Stoom, een massage en een uur niemand aan je hoofd.',hp:35,energy:20},
 {id:'club',tier:1,place:'Privéclub op de Wallen',n:'Hoofd leegmaken',col:'#ff3d52',ic:'glass',cd:60,base:400,
  d:'Een dure avond in een privéclub. Daarna is je hoofd leeg en ben je scherp.',focus:8,mins:20},
 {id:'onderduik',tier:1,place:'Onderduikadres',n:'Onderduiken',col:'#b8a1ff',ic:'house',cd:90,base:500,
  d:'Een paar uur van de radar op een adres dat niemand kent. Je hitte zakt en de gezochtlijst vergeet je.',heat:40,clearWanted:true},
 {id:'wellness',tier:2,r:5,place:'Wellnessresort in Zeeland',n:'Weekendje weg',col:'#3fe395',ic:'spa',cd:180,base:4000,
  d:'Zee, stilte en een kamer met uitzicht. Je komt terug als nieuw.',hp:999,energy:50,focus:10,mins:45},
 {id:'jacht',tier:2,r:8,place:'Jacht voor de kust van Monaco',n:'Op het water',col:'#4d9dff',ic:'yacht',cd:300,base:30000,
  d:'Champagne aan dek en zakendoen met mensen die je anders nooit spreekt.',energy:999,heat:30,focus:15,loot:10,mins:60},
 {id:'ibiza',tier:2,r:10,place:'Privéjet naar Ibiza',n:'Weekend Ibiza',col:'#ff7a1a',ic:'plane',cd:480,base:200000,
  d:'Je verdwijnt een weekend. Als je terugkomt is de stad je vergeten en ben je scherper dan ooit.',hp:999,energy:999,heat:60,clearWanted:true,focus:20,loot:15,mins:90}];
const relaxCost=(r,ri,lv)=>Math.round(r.base*(1+rkPow(ri)*.5)*(1+((lv||1)-1)*.1)/5)*5;

// Rangcodes: typ de naam van een rang bij Profiel > Code inwisselen (één keer, zodra je die rang hebt)
const RANK_CODES={straatschoffie:150,loopjongen:400,sjacheraar:700,dief:1000,inbreker:1800,ritselaar:4000,handhaver:9000,luitenant:18000,kapitein:36000,rechterhand:75000,schaduwbaas:150000,boef:2500,gangster:6000,soldaat:12000,huurmoordenaar:25000,capo:50000,onderbaas:100000,consigliere:200000,peetvader:500000};
const CODE_ALIAS={kapo:'capo'};
// zo toon je een code in 'gebruikte codes' (m1v2 → M1)
const codeShow=c=>c==='highroller'?'HIGH ROLLER':c.replace(/v\d+$/,'').toUpperCase();
// Codes die nu bestaan (zelfde als CODES in server.js). Oude codes verdwijnen uit 'gebruikte codes'.
const LIVE_CODES={lotto:1500,welkom:500,casino:5000,vip:20000,spinnetje:25000,jackpot:1000000,trainwreck:3000000,highroller:50000};

// Verblijf: je begint onder de brug. Rusten vult je energie in `rest` seconden, maar alleen zolang je blijft.
// Huizenmarkt: ±12 woningen. t = soort (HOMES hieronder: bepaalt rust, energie, plekken en het tafereel), p = koopprijs,
// rent = huur per speldag (4 uur), r = vanaf welke rang, g = waardestijging per speldag, cap = hoogste waarde (× aankoopprijs).
// slots = plekken voor spullen in deze woning (Onder de brug 2 … Landgoed 15); VIP +2 en High roller +5 erbij (TIER_SLOTS).
// Hoe beter de woning, hoe sneller hij in waarde stijgt. Verkopen kost 5% makelaarskosten.
const HOUSES=[
 {id:'brug',t:'brug',n:'Onder de brug',place:'Berlagebrug',d:'Een vochtig matras, een vuurton en het geraas van de tram boven je hoofd.',p:0,rent:0,r:0,g:0,cap:1,slots:2},
 {id:'kraak',t:'kraak',n:'Kraakpand',place:'Amsterdam-West',d:'Een leegstaand kantoor met een kapotte lift. Je hebt een deur die op slot kan.',p:6500,rent:180,r:2,g:.0012,cap:1.12,slots:3},
 {id:'boot',t:'kraak',n:'Lekke woonboot',place:'Houthavens',d:'Een roestige woonboot aan een vergeten steiger. Bij harde wind deint je bed mee.',p:11000,rent:280,r:2,g:.0014,cap:1.14,slots:4},
 {id:'kamer',t:'kamer',n:'Zolderkamer',place:'De Pijp',d:'Zestien vierkante meter, een eigen douche en een huisbaas die geen vragen stelt.',p:38000,rent:720,r:4,g:.0025,cap:1.22,slots:5},
 {id:'studio',t:'kamer',n:'Studio',place:'Oost',d:'Een studio boven een kapperszaak. Klein, maar alles is van jou.',p:55000,rent:980,r:4,g:.0028,cap:1.25,slots:6},
 {id:'gracht',t:'gracht',n:'Grachtenappartement',place:'Keizersgracht',d:'Hoge plafonds, uitzicht op het water. Niemand verwacht hier een crimineel.',p:260000,rent:3750,r:6,g:.0045,cap:1.32,slots:7},
 {id:'jordaan',t:'gracht',n:'Herenhuisetage',place:'Jordaan',d:'De bel-etage van een herenhuis uit 1680, met een tuin aan de achterkant.',p:340000,rent:4750,r:6,g:.005,cap:1.35,slots:8},
 {id:'penthouse',t:'penthouse',n:'Penthouse',place:'Zuidas',d:'Bovenste verdieping, eigen lift, bewaking in de lobby.',p:850000,rent:11250,r:8,g:.0065,cap:1.42,slots:10},
 {id:'ijpent',t:'penthouse',n:'Penthouse IJ-oever',place:'Amsterdam-Noord',d:'Glazen wanden boven het IJ. Je ziet de pont, de stad en iedereen die eraan komt.',p:1250000,rent:15000,r:8,g:.007,cap:1.45,slots:11},
 {id:'omval',t:'penthouse',n:'Toppenthouse',place:'De Omval',d:'De top van de hoogste woontoren van de stad, met een dakterras rondom.',p:1800000,rent:17500,r:9,g:.0075,cap:1.48,slots:12},
 {id:'villa',t:'villa',n:'Villa',place:'Wassenaar',d:'Een hek, camera\'s, een zwembad en personeel. Zo slaapt een peetvader.',p:2600000,rent:22500,r:10,g:.008,cap:1.5,slots:14},
 {id:'gooi',t:'villa',n:'Landgoed',place:'Het Gooi',d:'Een landhuis achter een bos, met een oprijlaan van vierhonderd meter en een eigen helikopterplatform.',p:3900000,rent:32500,r:11,g:.0085,cap:1.55,slots:15}];
// extra plekken voor spullen per lidmaatschap (gewoon / VIP / High roller), in elke woning, los van je rang
const TIER_SLOTS=[0,2,5];
// oude woningprijzen (vóór de huizenmarkt): wat bestaande spelers ervoor betaalden, voor de waarde van hun woning
const HOME_OLD_P={kraak:2500,kamer:15000,gracht:80000,penthouse:400000,villa:1500000};
const HOUSE_FEE=.05;
const HOMES=[
 // rest = seconden rusten, cd = wachttijd tussen rustbeurten (s), en = extra max. energie, hp = gezondheid per rustbeurt, heat = minder hitte per rustbeurt,
 // slots = plekken voor de goedkoopste woning van deze soort (elke woning in HOUSES heeft zijn eigen aantal, zie houseSlots)
 {id:'brug',n:'Onder de brug',place:'Berlagebrug',d:'Een vochtig matras, een vuurton en het geraas van de tram boven je hoofd. Het is niet veel, maar je kunt er even je ogen dicht doen.',p:0,r:0,rest:10,cd:300,en:0,hp:20,heat:0,slots:2},
 {id:'kraak',n:'Kraakpand',place:'Amsterdam-West',d:'Een leegstaand kantoor met een kapotte lift. Je hebt een deur die op slot kan.',p:2500,r:2,rest:9,cd:270,en:20,hp:25,heat:0,slots:3},
 {id:'kamer',n:'Huurkamer',place:'De Pijp',d:'Zestien vierkante meter, een eigen douche en een huisbaas die geen vragen stelt.',p:15000,r:4,rest:8,cd:240,en:40,hp:30,heat:0,slots:5},
 {id:'gracht',n:'Grachtenappartement',place:'Keizersgracht',d:'Hoge plafonds, uitzicht op het water. Niemand verwacht hier een crimineel.',p:80000,r:6,rest:7,cd:210,en:60,hp:40,heat:5,slots:7},
 {id:'penthouse',n:'Penthouse',place:'Zuidas',d:'Bovenste verdieping, eigen lift, bewaking in de lobby.',p:400000,r:8,rest:6,cd:180,en:80,hp:55,heat:10,slots:10},
 {id:'villa',n:'Villa',place:'Wassenaar',d:'Een hek, camera\'s, een zwembad en personeel. Zo slaapt een peetvader.',p:1500000,r:10,rest:5,cd:150,en:100,hp:70,heat:20,slots:14}];
// Inrichting: spullen voor je woning. Elke woning heeft een aantal plekken (HOUSES.slots, + TIER_SLOTS); wat neerstaat (S.furn) geeft een blijvend voordeel,
// wat in de opslag staat (S.furnStore) niet. h = vanaf welke woning (index in HOMES), hmax = tot en met welke woning (spullen van de straat neem je niet mee).
// fx: hpRegen/enRegen/heat = sneller herstel, focus = % slaagkans, en = max. energie, restHp = extra gezondheid per rustbeurt, restCd = kortere wachttijd rusten,
// zone = meer ruimte bij vluchten, safe = minder verlies bij mislukken, docHp/docCd = dokter, hideRate = sneller onderduiken, hideRisk = minder kans herkend te worden
const FURN=[
 {id:'slaapzak',n:'Legerslaapzak',h:0,hmax:1,p:150,col:'#9bb06a',d:'Van de dumpzaak. Warm, droog en het ruikt een beetje naar diesel.',fx:{restHp:5}},
 {id:'kar',n:'Winkelwagen',h:0,hmax:1,p:90,col:'#a9b4c2',d:'Je spullen onder een stapel lege flessen. Niemand kijkt erin.',fx:{safe:.1}},
 {id:'hond',n:'Zwerfhond',h:0,p:350,col:'#d9a066',d:'Hij liep je achterna en bleef. Met een hond aan de lijn kijkt niemand twee keer.',fx:{hideRisk:.3}},
 {id:'kaarsen',n:'Kaarsen en wierook',h:1,p:350,col:'#ffd166',d:'Licht dat niet van een zwaailicht komt.',fx:{focus:1}},
 {id:'sloten',n:'Extra sloten',h:1,p:1200,col:'#9aa3ad',d:'Drie sloten, een ketting en een stalen plaat op de deur.',fx:{hideRate:.2}},
 {id:'plant',n:'Planten',h:2,p:1500,col:'#3fe395',d:'Een hoek vol groen. Frisse lucht en een rustig hoofd.',fx:{hpRegen:.25,focus:2}},
 {id:'espresso',n:'Espressomachine',h:2,p:2500,col:'#ffad6b',d:'Elke ochtend een dubbele. Je gaat langer door.',fx:{en:20}},
 {id:'ehbo',n:'EHBO-kist',h:2,p:3000,col:'#ff5c6c',d:'Verband, hechtpleisters en pijnstillers. Scheelt een ritje naar de huisartsenpost.',fx:{docHp:5,docCd:.2}},
 {id:'bed',n:'Goed bed',h:2,p:4000,col:'#a9dcff',d:'Pocketvering en een dekbed van ganzendons.',fx:{restHp:10,restCd:.15}},
 {id:'bokszak',n:'Bokszak',h:2,p:6000,col:'#ff7a1a',d:'Elke dag tien rondes. Je benen blijven sterk.',fx:{zone:.06}},
 {id:'aquarium',n:'Aquarium',h:3,p:15000,col:'#4d9dff',d:'Tropische vissen en een zacht blauw licht.',fx:{hpRegen:.25,focus:3}},
 {id:'camera',n:'Camera\'s',h:3,p:25000,col:'#b8a1ff',d:'Je ziet wie er aanbelt voordat zij jou zien.',fx:{heat:.5}},
 {id:'wapenkast',n:'Wapenkast',h:3,p:35000,col:'#d07a52',d:'Achter een vals paneel. Alles ligt klaar en niemand ziet het.',fx:{focus:3}},
 {id:'kluis',n:'Kluis in de muur',h:4,p:60000,col:'#c9a227',d:'Contant geld dat niet op straat ligt, raak je ook niet kwijt.',fx:{safe:.5}},
 {id:'bios',n:'Thuisbioscoop',h:4,p:90000,col:'#ff7fb3',d:'Leren stoelen en een scherm van drie meter.',fx:{enRegen:.15}},
 {id:'fitness',n:'Fitnesshoek',h:4,p:120000,col:'#5ce1c4',d:'Loopband, halters en een bank. Je houdt het langer vol.',fx:{en:20,zone:.05}},
 {id:'sauna',n:'Eigen sauna',h:5,p:250000,col:'#ff3d52',d:'Een cederhouten sauna met uitzicht op de tuin.',fx:{hpRegen:.5,restCd:.15}},
 {id:'zen',n:'Japanse tuin',h:5,p:400000,col:'#e6e1d6',d:'Geharkt grind, drie stenen en een esdoorn. Stilte.',fx:{focus:5}},
 {id:'hek',n:'Hek met bewaking',h:5,p:600000,col:'#7fb8ff',d:'Een man in een hokje, twee honden en schijnwerpers. Je slaapt.',fx:{hideRate:.3,heat:.25}},
 // uitbreiding: meer voor gezondheid, energie, onderduiken, veiligheid, focus en vluchten (eigen tekening, staan op vrije plekken in je woning)
 {id:'meditatie',n:'Meditatiekussen',h:1,p:600,col:'#c9a2ff',d:'Tien minuten zitten en ademen. Je handen worden rustiger.',fx:{focus:2}},
 {id:'koelkast',n:'Koelkast vol energiedrank',h:1,p:900,col:'#5fe3a6',d:'Blikjes met namen die je niet kunt uitspreken. Ze werken wel.',fx:{en:12}},
 {id:'medkast',n:'Medicijnkastje',h:1,p:1100,col:'#ff8f9c',d:'Pijnstillers, zalf en een rol tape. Kleine wonden heel je zelf.',fx:{hpRegen:.15,docHp:2}},
 {id:'schaak',n:'Schaaktafel',h:1,p:1400,col:'#e6d3a3',d:'Elke avond een potje tegen jezelf. Je leert drie zetten vooruit denken.',fx:{focus:2}},
 {id:'scanner',n:'Politiescanner',h:2,p:3500,col:'#ff5c6c',d:'Je hoort de meldkamer mee. Zodra ze je straat noemen, ben je al weg.',fx:{heat:.25,hideRisk:.1}},
 {id:'blender',n:'Smoothiebar',h:2,p:4500,col:'#ffad6b',d:'Spinazie, banaan en een schep eiwitpoeder. Vies, maar je gaat langer door.',fx:{en:16,enRegen:.05}},
 {id:'daglamp',n:'Daglichtlamp',h:2,p:5500,col:'#ffe36b',d:'Een halfuur per ochtend en je lijf denkt dat het zomer is.',fx:{hpRegen:.15,enRegen:.08}},
 {id:'stadskaart',n:'Stadskaart met routes',h:2,p:7000,col:'#7cc4ff',d:'Elke steeg, elk hek en elke achteruitgang met rood aangestreept.',fx:{zone:.05,focus:1}},
 {id:'alarm',n:'Alarmsysteem',h:2,p:9000,col:'#ff7a1a',d:'Bewegingsmelders, een sirene en een knop naast je bed.',fx:{safe:.15,hideRate:.1}},
 {id:'spinning',n:'Spinningfiets',h:3,p:18000,col:'#4cc6ff',d:'Elke dag twintig minuten. Je conditie gaat omhoog en je energie raakt minder snel op.',fx:{en:20,enRegen:.1}},
 {id:'vermomming',n:'Vermommingskast',h:3,p:22000,col:'#b8a1ff',d:'Pruiken, petten, een nepsnor en drie jassen die je nooit draagt als jezelf.',fx:{hideRisk:.3}},
 {id:'massage',n:'Massagestoel',h:3,p:28000,col:'#d07a52',d:'Twaalf programma\'s en een stand die "Na een lange nacht" heet.',fx:{restHp:8,restCd:.1}},
 {id:'boekenkast',n:'Draaiende boekenkast',h:4,p:70000,col:'#a8794f',d:'Trek aan het rode boek en de kast draait open naar een kamertje.',fx:{hideRate:.25,hideRisk:.15}},
 {id:'klimmuur',n:'Klimmuur',h:4,p:85000,col:'#3fe395',d:'Grepen tot aan het plafond. Over een hek klimmen gaat je nu makkelijk af.',fx:{zone:.08}},
 {id:'capsule',n:'Powernap-capsule',h:4,p:110000,col:'#a9dcff',d:'Twintig minuten in een eitje met zacht licht en je bent weer fris.',fx:{enRegen:.2,en:10}},
 {id:'ijsbad',n:'IJsbad',h:4,p:130000,col:'#7fe0ff',d:'Drie minuten bij twee graden. Daarna voel je je onverwoestbaar.',fx:{enRegen:.12,hpRegen:.2}},
 {id:'hottub',n:'Bubbelbad',h:5,p:300000,col:'#5ad1ff',d:'Warm water, bubbels en een glas champagne op de rand.',fx:{hpRegen:.4,restHp:10}},
 {id:'paniekkamer',n:'Paniekkamer',h:5,p:750000,col:'#9aa3ad',d:'Stalen deur, eigen lucht en een kluis voor het geld. Hier komt niemand binnen.',fx:{safe:.4,heat:.25}},
 // uitbreiding (november 2026): van de stoep tot het landgoed. Duurdere spullen doen vaak twee of drie dingen tegelijk; geen extra max. energie
 // (inrichting blijft samen +98, zie FURN_CAP), wel sneller opladen. Alles staat op een vrije plek (VH_SPOT, tekening in VH_GEN).
 {id:'matras',n:'Matras van de stoep',h:0,hmax:2,p:120,col:'#8fb4d9',d:'Stond bij het grofvuil. Er zit een vlek op die je liever niet uitlegt, maar hij is zacht.',fx:{restHp:3,hpRegen:.05}},
 {id:'campingstoel',n:'Campingstoel',h:0,hmax:3,p:60,col:'#3fa36b',d:'Groen, inklapbaar en met een bekerhouder. Even zitten en je kop is weer helder.',fx:{restCd:.05,focus:1}},
 {id:'radio',n:'Transistorradio',h:0,p:220,col:'#e2b23a',d:'Op de lokale zender hoor je waar de controles staan, lang voordat jij erlangs moet.',fx:{heat:.1,hideRisk:.05}},
 {id:'gasstel',n:'Campinggasstel',h:1,hmax:3,p:450,col:'#4d9dff',d:'Een blik soep, een pan en een blauw vlammetje. Warm eten doet wonderen.',fx:{enRegen:.05,hpRegen:.05}},
 {id:'hangmat',n:'Hangmat',h:2,p:2800,col:'#e07a5f',d:'Tussen twee palen in je kamer. Je ligt er na tien minuten zo diep in dat de wereld even weg is.',fx:{restCd:.08,hpRegen:.1}},
 {id:'laptop',n:'Laptop met VPN',h:2,p:6500,col:'#5fe3a6',d:'Drie VPN\'s, een stapel prepaid simkaarten en een script dat je sporen wist.',fx:{heat:.15,hideRisk:.08}},
 {id:'roeier',n:'Roeitrainer',h:3,p:20000,col:'#4cc6ff',d:'Twintig minuten op het water zonder nat te worden. Je longen worden groter, je benen sneller.',fx:{enRegen:.1,zone:.04}},
 {id:'kunst',n:'Kunstwerk',h:3,p:32000,col:'#d9a441',d:'Een bronzen beeld op een sokkel. Niemand weet wat het voorstelt, maar je wordt er rustig van.',fx:{focus:2,restHp:4}},
 {id:'wijnkast',n:'Wijnklimaatkast',h:4,p:65000,col:'#a8324a',d:'Achtenveertig flessen op de juiste temperatuur. Eén glas na een lange nacht en je slaapt als een roos.',fx:{restCd:.1,restHp:5}},
 {id:'biljart',n:'Biljarttafel',h:4,p:95000,col:'#2f8a4a',d:'Groen laken, zware ballen. Wie elke bal drie stoten vooruit ziet, ziet ook een klus drie stappen vooruit.',fx:{focus:3,restCd:.05}},
 {id:'meldkamer',n:'Beveiligingsruimte',h:4,p:160000,col:'#7fb8ff',d:'Een muur vol schermen, een eigen server en een knop die alles wist. Hier zie je ze aankomen.',fx:{safe:.15,heat:.2,hideRisk:.05}},
 {id:'kliniek',n:'Behandelkamer',h:5,p:350000,col:'#3fe395',d:'Een behandeltafel, een infuus en een arts die op afroep komt en nooit iets opschrijft.',fx:{docHp:8,docCd:.2,hpRegen:.15}},
 {id:'tunnel',n:'Vluchttunnel',h:5,p:550000,col:'#9a7b5a',d:'Onder het tapijt een luik, daaronder tweehonderd meter tunnel naar de garage van de buren.',fx:{zone:.06,hideRate:.25}}];
// Plafonds per effect: hoeveel alle spullen samen maximaal doen. Meer stapelen helpt daarboven niet (staat bij in de winkel).
// en = 98: met alles op max blijft je max. energie 500 (zie EN_MAX). safe < 1, anders zou mislukken geld opleveren.
const FURN_CAP={hpRegen:2,enRegen:.75,heat:1.5,focus:20,en:98,restHp:30,restCd:.45,zone:.3,safe:.75,docHp:15,docCd:.4,hideRate:1,hideRisk:.8};
const FURN_FX={hpRegen:['Gezondheid herstelt',v=>'+'+Math.round(v*100)+'% sneller'],enRegen:['Energie laadt op',v=>'+'+Math.round(v*100)+'% sneller'],heat:['Hitte zakt',v=>'+'+Math.round(v*100)+'% sneller'],
 focus:['Rust in je hoofd',v=>'+'+v+'% slaagkans'],en:['Max. energie',v=>'+'+v],restHp:['Per rustbeurt',v=>'+'+v+'% gezondheid'],restCd:['Wachttijd rusten',v=>'-'+Math.round(v*100)+'%'],
 zone:['Groen gat bij vluchten',v=>'+'+Math.round(v*100)+'%'],safe:['Verlies bij mislukken',v=>'-'+Math.round(v*100)+'%'],
 docHp:['Bij de dokter',v=>'+'+v+'% gezondheid'],docCd:['Wachttijd dokter',v=>'-'+Math.round(v*100)+'%'],
 hideRate:['Onderduiken',v=>'+'+Math.round(v*100)+'% sneller'],hideRisk:['Kans herkend te worden',v=>'-'+Math.round(v*100)+'%']};
const DOC={dur:10,cd:600,hp:20};

// rangen omzetten naar de nieuwe indeling (20 rangen)
rkRemap(CRIMES,1,'max');rkRemap(FAMILIES);rkRemap(BIZ,1);rkRemap(GEAR,1);rkRemap(TRAININGS);rkRemap(RELAX,1,'base');rkRemap(HOUSES);rkRemap(HOMES);

// ---------- Meer zaken (november 2026) ----------
// Na de rangomzetting: r is hier al de nieuwe rang (0-19). kind = soort gevel op de banner (zie bezit-extra.js).
// Inkomen volgt dezelfde formule als de rest (BIZ_DAY_RATE, vastgoed +20%); daarna staat BIZ weer op prijs.
BIZ_CATS.splice(2,0,{id:'toer',n:'Toerisme',d:'Amsterdam leeft van toeristen. Ze betalen contant, vragen geen bon en zijn morgen weer weg.'});
BIZ_PLACES.push('Amstelveen','Haarlem','Almere','Hoofddorp','Purmerend');
[{id:'fiets',cat:'toer',n:'Fietsverhuur',d:'Huurfietsen voor toeristen die nog nooit een tramrail hebben gezien.',p:4000,r:1,col:'#ffd166',up:['Elektrische fietsen','Bakfietsen','Fietstours','Eigen stalling']},
 {id:'markt',cat:'handel',n:'Marktkraam',d:'Een kraam op de Albert Cuyp. Zonnebrillen, hoesjes en merktassen die bijna echt zijn.',p:6500,r:1,col:'#ff9f43',kind:'stall',up:['Tweede kraam','Partytent','Opslagbusje','Hoekplek bij de ingang']},
 {id:'avond',cat:'dienst',n:'Avondwinkel',d:'Bier, chips en vloei tot diep in de nacht. Niemand vraagt om een bonnetje.',p:8000,r:2,col:'#7ee081',up:['Koelwand','Pinautomaat','Bezorgen per scooter','Dag en nacht open']},
 {id:'garagebox',cat:'vastgoed',n:'Garageboxen',d:'Een rij boxen achter de flat. De huur komt contant, wat erin staat gaat je niks aan.',p:10000,r:2,col:'#b7a58f',kind:'garage',up:['Nieuwe kanteldeuren','Stroom in elke box','Camera bij de poort','Tweede rij']},
 {id:'nagel',cat:'dienst',n:'Nagelstudio',d:'Gellak, wimpers en een pinautomaat die altijd net stuk is.',p:15000,r:3,col:'#f472b6',up:['Extra tafels','Wimperhoek','Pedicurestoelen','Eigen academie']},
 {id:'souvenir',cat:'toer',n:'Souvenirwinkel',d:'Klompen, tulpen en magneetjes. Alles contant, en de klant komt nooit meer terug.',p:17000,r:3,col:'#ff5d73',up:['Klompen op maat','Kaashoek','Kaartjesbalie','Plek aan het Damrak']},
 {id:'wasstraat',cat:'auto',n:'Autowasstraat',d:'Wassen, poetsen, en in de kofferbak kijkt niemand.',p:24000,r:3,col:'#5ec8ff',kind:'garage',up:['Tweede borstelstraat','Handwasploeg','Poetsabonnementen','Truckwasplaats']},
 {id:'pizza',cat:'horeca',n:'Pizzeria',d:'Een houtoven, bezorgers op scooters en een kassa die ook pizza\'s verkoopt die nooit gebakken zijn.',p:26000,r:4,col:'#ff6f3c',up:['Tweede houtoven','Bezorgvloot','Terras','Eigen bezorgapp']},
 {id:'taxi',cat:'auto',n:'Taxibedrijf',d:'Twintig zwarte Priussen en een centrale die alles hoort.',p:42000,r:4,col:'#ffd400',kind:'garage',up:['Meer wagens','Eigen centrale','Ritten naar Schiphol','Limousines']},
 {id:'bruin',cat:'horeca',n:'Bruin café',d:'Jenever, een biljart en vaste klanten die alles zien en niks zeggen.',p:48000,r:5,col:'#c08552',kind:'canal',up:['Biljarttafel','Terras aan de gracht','Achterzaaltje','Eigen jenever']},
 {id:'koerier',cat:'handel',n:'Koeriersdienst',d:'Pakjes door de hele stad. Wat erin zit, weet de bezorger niet.',p:55000,r:5,col:'#f59e0b',kind:'garage',up:['Bakfietsen','Bestelbusjes','Nachtbezorging','Eigen sorteercentrum']},
 {id:'coffeeshop',cat:'toer',n:'Coffeeshop',d:'Gedoogd aan de voordeur. Hoe het spul binnenkomt, is een ander verhaal.',p:85000,r:7,col:'#5bd96b',kind:'canal',up:['Rookruimte','Tweede toonbank','Toeristenmenu','Eigen kweker']},
 {id:'studenten',cat:'vastgoed',n:'Studentenkamers',d:'Kamers van negen vierkante meter voor negenhonderd euro. Er staat een rij voor de deur.',p:95000,r:7,col:'#c9b28f',kind:'row',up:['Kamers splitsen','Gedeelde keukens','Zolder verbouwd','Heel blok']},
 {id:'sport',cat:'dienst',n:'Sportschool',d:'Gewichten, eiwitshakes en jongens die geen vragen stellen.',p:120000,r:9,col:'#ef4444',up:['Nieuwe apparaten','Boksring','Sauna','Eigen supplementen']},
 {id:'groothandel',cat:'handel',n:'Groothandel',d:'Pallets vol frisdrank, sigaretten en wat er onderop ligt.',p:180000,r:10,col:'#60a5fa',kind:'garage',up:['Heftrucks','Koelhal','Eigen vrachtwagens','Import uit het buitenland']},
 {id:'rondvaart',cat:'toer',n:'Rondvaartboot',d:'Een glazen boot door de grachten. Toeristen kijken naar buiten, niet naar de kas.',p:210000,r:10,col:'#7dd3fc',kind:'boat',up:['Tweede boot','Avondvaart met diner','Eigen steiger','Partyboot']},
 {id:'restaurant',cat:'horeca',n:'Grachtenrestaurant',d:'Witte tafelkleden, uitzicht op de Herengracht en rekeningen van vier cijfers.',p:280000,r:12,col:'#e9c46a',kind:'canal',up:['Sterrenchef','Wijnkelder','Terras op het water','Privékamer']},
 {id:'hostel',cat:'toer',n:'Hostel',d:'Stapelbedden, lockers en elke week een nieuwe lading backpackers.',p:340000,r:12,col:'#a78bfa',kind:'canal',up:['Extra slaapzalen','Bar in de kelder','Fietsen aan de balie','Dakterras']},
 {id:'wissel',cat:'dienst',n:'Wisselkantoor',d:'Euro\'s, dollars en roebels. De koers is wat jij zegt dat hij is.',p:420000,r:13,col:'#34d399',up:['Tweede loket','Crypto-automaat','Goud en zilver','Loket op Schiphol']},
 {id:'verhuur',cat:'auto',n:'Luxe autoverhuur',d:'Lamborghini\'s per dag, de borg in een envelop.',p:520000,r:13,col:'#f97316',kind:'garage',up:['Meer supercars','Chauffeurs','Bezorgen aan huis','Filiaal in Monaco']},
 {id:'parkeer',cat:'vastgoed',n:'Parkeergarage',d:'Duizend plekken in het centrum. Elke slagboom is een kassa.',p:750000,r:13,col:'#94a3b8',kind:'tower',up:['Kentekencamera\'s','Laadpalen','Valetservice','Extra verdieping']},
 {id:'transport',cat:'handel',n:'Transportbedrijf',d:'Dertig trucks naar Polen en terug. Lege kilometers bestaan hier niet.',p:800000,r:14,col:'#3b82f6',kind:'garage',up:['Nieuwe trekkers','Koeltrailers','Eigen distributiecentrum','Vaste lijn naar het oosten']},
 {id:'juwelier',cat:'dienst',n:'Juwelier',d:'Horloges, ringen en kettingen in de P.C. Hooftstraat. Eén klant per uur is genoeg.',p:1400000,r:17,col:'#fde68a',up:['Kluis','Eigen goudsmid','Privéshowroom','Horlogeveilingen']},
 {id:'importeur',cat:'auto',n:'Sportwagenimporteur',d:'Hele containers vol Duitse en Italiaanse sportwagens. De papieren komen later.',p:1700000,r:17,col:'#dc2626',kind:'port',up:['Eigen kade','Keuringsstation','Exportlijn naar Dubai','Exclusief dealerschap']},
 {id:'beach',cat:'horeca',n:'Beachclub',d:'Een paviljoen in Bloemendaal. Bedden van duizend euro en champagne met sterretjes.',p:2500000,r:18,col:'#fbbf24',kind:'beach',up:['Groter terras','Bekende DJ\'s','VIP-strandbedden','Eigen festival']},
 {id:'diamant',cat:'handel',n:'Diamanthandel',d:'Amsterdamse stenen, Antwerpse papieren. Klein, duur en makkelijk mee te nemen.',p:2800000,r:18,col:'#bae6fd',kind:'canal',up:['Slijperij','Kluis in de kelder','Kantoor in Antwerpen','Lijn naar Dubai']},
 {id:'galerie',cat:'toer',n:'Kunstgalerie',d:'Een doek van een onbekende schilder gaat voor drie ton weg. Niemand vraagt waarom.',p:3200000,r:18,col:'#f0abfc',kind:'canal',up:['Tweede zaal','Eigen kunstenaars','Veilinghuis','Opslag in de vrijhaven']},
 {id:'kantoor',cat:'vastgoed',n:'Kantoortoren Zuidas',d:'Twintig verdiepingen vol advocaten en bankiers. Die betalen de huur altijd op tijd.',p:5500000,r:19,col:'#cbd5e1',kind:'tower',up:['Nieuwe lobby','Dakterras','Parkeerkelder','Tweede toren']},
 {id:'rederij',cat:'handel',n:'Rederij',d:'Eigen containerschepen. Wat er aan boord gaat, staat nergens op papier.',p:7000000,r:19,col:'#0ea5e9',kind:'port',up:['Tweede schip','Eigen terminal','Route naar Zuid-Amerika','Vlag van gemak']},
 {id:'gcasino',cat:'horeca',n:'Grand Casino',d:'Roulette, blackjack en kroonluchters. Het huis wint altijd, en het huis ben jij.',p:9000000,r:19,col:'#d4af37',kind:'tower',up:['Pokerzaal','High-roller-salon','Hotel erbij','Privéjet voor gasten']}
].forEach(b=>{if(BIZ.some(x=>x.id===b.id))return;b.inc=Math.round(b.p*BIZ_DAY_RATE(b.p)*(b.cat==='vastgoed'?1.2:1)/10)*10;BIZ.push(b)});
BIZ.sort((a,b)=>a.p-b.p);
