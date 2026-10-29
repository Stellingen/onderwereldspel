// Hulpfuncties en spelgegevens: rangen, misdaden, auto's, bedrijven, wapens, families
const $=s=>document.querySelector(s);
const fmt=n=>'€'+Math.floor(n).toLocaleString('nl-NL');
const now=()=>Date.now();
const rnd=(a,b)=>Math.floor(Math.random()*(b-a+1))+a;

const RANKS=[
 ['Rookie',0],['Straatschoffie',150],['Loopjongen',500],['Dief',1200],['Boef',2500],['Gangster',5000],
 ['Soldaat',9000],['Huurmoordenaar',15000],['Capo',25000],['Onderbaas',40000],['Consigliere',65000],['Peetvader',100000]];
const CRIMES=[
 {id:'zakken',n:'Zakkenrollen',d:'Een toerist op de Dam lichter maken.',min:20,max:80,xp:8,base:85,cd:8,jail:30,r:0,cr:1},
 {id:'winkel',n:'Winkel overvallen',d:'Snel de kassa leeghalen bij de avondwinkel.',min:120,max:400,xp:20,base:70,cd:20,jail:60,r:1,cr:2},
 {id:'inbraak',n:'Villa inbreken',d:'Juwelen en elektronica uit een villa in Wassenaar.',min:500,max:1500,xp:45,base:60,cd:45,jail:120,r:3,cr:3},
 {id:'smokkel',n:'Smokkelroute',d:'Een lading via de haven naar binnen krijgen.',min:2000,max:5000,xp:90,base:50,cd:90,jail:200,r:5,cr:5},
 {id:'bank',n:'Bankoverval',d:'Met je crew de kluis van een bank kraken.',min:8000,max:20000,xp:200,base:40,cd:180,jail:360,r:7,cr:8},
 {id:'casino',n:'Casino-kraak',d:'De ultieme klus: het geld van het Holland Casino.',min:30000,max:80000,xp:500,base:30,cd:360,jail:600,r:9,cr:12}];
const FAMILIES=[
 {id:'garde',n:'De Nieuwe Garde',d:'Jonge honden uit Amsterdam-West. Snel, brutaal, loyaal.',r:2,cred:20,chance:4,loot:0,jail:0,col:'var(--cyan)'},
 {id:'rossi',n:'Familia Rossi',d:'Oude Italiaanse familie met connecties in de haven.',r:4,cred:75,chance:6,loot:15,jail:10,col:'var(--gold)'},
 {id:'syndicaat',n:'Het Syndicaat',d:'Zakelijk, meedogenloos en met advocaten op de loonlijst.',r:6,cred:200,chance:8,loot:25,jail:25,col:'var(--violet)'},
 {id:'cupola',n:'La Cupola',d:'De raad van peetvaders. Alleen de grootsten worden toegelaten.',r:9,cred:600,chance:12,loot:40,jail:40,col:'var(--red)'}];
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
