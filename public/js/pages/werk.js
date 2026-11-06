// Straat → Werk en dealen
// Klusjes: gewoon werk voor mensen in de buurt. Kost energie, levert wit geld en een beetje XP op, zonder risico. Soms een keuze.
// Dealen (pages/dealen.js): je begint als loopjongen van Mo (je verkoopt zijn spul voor 30%). Met elke verkoop groeit je naam (rep):
// eigen klantjes → vaste lijn → groothandel met straatdealers → direct bij de bron → drugsbaron met een eigen lab.
// Per buurt schuift de vraag door de tijd, er komen afspraken binnen (soms een tip van de politie) en op straat kun je beroofd worden.
// S.dl = {rep, stock:{id:aantal}, dealers, dp: product voor de dealers, day: laatste verwerkte speldag, sold, rev,
//         bu: buurt waar je staat, or: afspraken, orT: volgende afspraak, sat:{'buurt:product':verzadiging}, satT}
/* ---------------- Klusjes ---------------- */
// p = loon (wit), en = energie, cd = wachttijd (s), xp. Loon per energiepunt volgt één curve over de rangen (±×1,4 per rang).
// ev = soms (55%) een kort moment met een keuze. Per keuze: m = [loonfactor goed, loonfactor slecht], k = kans op goed (geen k = zeker),
// t = [tekst goed, tekst slecht], en = extra energie, xp = XP-factor. Altijd legaal en zonder politie.
const JOB_EV=.55;
const JOBS=[
 {id:'statiegeld',n:'Statiegeld ophalen',d:'Blikjes uit de bosjes van het Vondelpark. Vijftien cent per stuk.',r:0,en:2,cd:35,p:[30,50],xp:2,ic:'can',
  ev:{q:'Achter een bankje staat een volle vuilniszak.',a:[{l:'Erin graaien',k:.5,m:[1.8,1],t:['Een krat vol lege flesjes.','Alleen hondenpoep. Bah.']},{l:'Laten staan',m:[1],t:['Handen schoon, zakken half vol.']}]}},
 {id:'folders',n:'Folders rondbrengen',d:'Een tas vol folders van de pizzeria, door de brievenbussen in Noord.',r:0,en:3,cd:40,p:[35,70],xp:2,ic:'mail'},
 {id:'honden',n:'Honden uitlaten',d:'Vier labradors in Oud-Zuid. Eén wil altijd de gracht in.',r:0,en:3,cd:50,p:[45,80],xp:2,ic:'dog',
  ev:{q:'De labradors trekken richting de gracht.',a:[{l:'Vasthouden',m:[1],t:['Vier droge honden. Keurig.']},{l:'Laat ze maar',k:.45,m:[1.6,.6],t:['Doodmoe en blij. Het baasje geeft fooi.','Vier natte honden op een witte bank. Korting.']}]}},
 {id:'autowas',n:'Auto\'s wassen',d:'Zaterdag bij de wasstraat aan de Ring. Sponzen, zemen, fooien.',r:0,en:4,cd:55,p:[60,110],xp:3,ic:'car',
  ev:{q:'Er rijdt een Ferrari de wasstraat in.',a:[{l:'Extra poetsen',k:.7,m:[1.5,1],en:1,t:['Hij glimt. De eigenaar geeft fooi.','Hij stapt in zonder iets te zeggen.']},{l:'Standaardbeurt',m:[1],t:['Volgende.']}]}},
 {id:'fietsvis',n:'Fietsen uit de gracht vissen',d:'Met de gemeente op de kraanboot. Elke haak een verrassing.',r:1,en:4,cd:90,p:[90,160],xp:3,ic:'hook',
  ev:{q:'De haak blijft ergens zwaar aan hangen.',a:[{l:'Doortrekken',k:.5,m:[1.7,1],en:2,t:['Een Gazelle uit 1983. Een verzamelaar betaalt.','Een winkelwagen. Alweer.']},{l:'Loslaten',m:[1],t:['Laat maar liggen. Volgende.']}]}},
 {id:'afwas',n:'Afwassen in een snackbar',d:'Achter de frituur op het Rembrandtplein. Vet tot je ellebogen.',r:1,en:5,cd:90,p:[110,200],xp:4,ic:'plate'},
 {id:'verhuis',n:'Helpen met een verhuizing',d:'Drie hoog, geen lift. Een kast, een bank en veertig dozen boeken.',r:1,en:6,cd:90,p:[140,260],xp:5,ic:'box',
  ev:{q:'Er moet ook nog een piano naar drie hoog.',a:[{l:'Doen we',k:.7,m:[1.5,.8],en:3,t:['Hij past. Extra loon.','Kras in het parket. Korting.']},{l:'Op is op',m:[1],t:['Je rug blijft heel.']}]}},
 {id:'bezorg',n:'Maaltijden bezorgen',d:'Op de scooter door de regen. Hoe sneller je bent, hoe meer fooi.',r:2,en:5,cd:75,p:[180,320],xp:6,ic:'bike',
  ev:{q:'Het stoplicht springt op oranje.',a:[{l:'Doorrijden',k:.6,m:[1.4,.6],t:['Warm eten, dikke fooi.','Flitspaal. Boete van je loon.']},{l:'Wachten',m:[1],t:['Lauw, maar heel.']}]}},
 {id:'sorteer',n:'Nachtdienst pakketsorteerder',d:'Pakketjes op de band in Westpoort. Niet schudden, staat erop.',r:2,en:6,cd:75,p:[210,360],xp:7,ic:'box',
  ev:{q:'Een pakket rammelt verdacht.',a:[{l:'Melden bij de chef',m:[1],xp:2,t:['De chef knikt. Je staat goed aangeschreven.']},{l:'Doorschuiven',m:[1.1],t:['Niet jouw probleem. Norm gehaald.']}]}},
 {id:'kraam',n:'Kraam opbouwen op de markt',d:'Om vijf uur \'s ochtends op de Albert Cuyp. De handelaar betaalt contant.',r:3,en:7,cd:110,p:[350,600],xp:9,ic:'tent'},
 {id:'bar',n:'Achter de bar in de Jordaan',d:'Bier tappen, bitterballen, en Henk die altijd nog één wil.',r:3,en:7,cd:110,p:[320,580],xp:9,ic:'beer',
  ev:{q:'Laatste ronde. De vaste klanten willen nog één.',a:[{l:'Doorschenken',k:.75,m:[1.4,.8],en:2,t:['Ze geven goed fooi.','Een dienblad met glazen gaat om.']},{l:'Lampen aan',m:[1],t:['Op tijd naar huis.']}]}},
 {id:'rondvaart',n:'Schipper op een rondvaartboot',d:'Een microfoon, veertig toeristen en de krappe bocht bij de Magere Brug.',r:4,en:8,cd:130,p:[530,940],xp:12,ic:'boat',
  ev:{q:'De krappe bocht bij de Magere Brug.',a:[{l:'Strak erdoor',k:.6,m:[1.5,.6],t:['Applaus van veertig Amerikanen. Fooienpot vol.','Kras in de boot. Gaat van je loon af.']},{l:'Rustig aan',m:[1],t:['Niemand merkt iets. Prima.']}]}},
 {id:'portier',n:'Portier bij een club',d:'Zwart pak, oortje in. Jij bepaalt wie er binnenkomt.',r:5,en:9,cd:150,p:[900,1600],xp:16,ic:'door',
  ev:{q:'Een BN\'er zonder pasje wil naar binnen.',a:[{l:'Laat hem door',k:.5,m:[1.6,.7],t:['Hij stopt je een flinke fooi toe.','Hij gaat los op de bar. Je baas is boos.']},{l:'Nee is nee',m:[1],t:['Hij scheldt. Jij blijft staan.']}]}},
 {id:'steward',n:'Steward in de ArenA',d:'Oranje hesje, Ajax tegen Feyenoord. Jij kijkt de verkeerde kant op.',r:6,en:10,cd:175,p:[1300,2300],xp:20,ic:'vest'},
 {id:'taxi',n:'Nachttaxi rijden',d:'Van het Leidseplein naar Amstelveen. Achterin zingt iemand.',r:7,en:11,cd:195,p:[1900,3400],xp:25,ic:'taxi',
  ev:{q:'De toerist achterin vraagt of Schiphol ver is.',a:[{l:'Gewoon rechtdoor',m:[1],xp:1.5,t:['Vijf sterren in de app.']},{l:'Via de Ring',k:.5,m:[1.6,.5],t:['Hij merkt niks en geeft nog fooi ook.','Hij kent de weg. Klacht bij de centrale.']}]}},
 {id:'chauffeur',n:'Chauffeur voor een zakenman',d:'Een dag lang rijden in een Mercedes. Niets vragen, niets horen.',r:8,en:12,cd:220,p:[3000,5200],xp:30,ic:'key',
  ev:{q:'Hij moet om drie uur op Schiphol zijn. Het is krap.',a:[{l:'Gas erop',k:.65,m:[1.4,.8],t:['Op tijd. Hij geeft een envelop.','Flitspaal op de A10.']},{l:'Netjes rijden',m:[1],t:['Hij haalt het net.']}]}},
 {id:'makelaar',n:'Bezichtigingen voor een makelaar',d:'Dertig man voor een studio van 28 m² in de Pijp. Jij houdt de lijst bij.',r:9,en:13,cd:245,p:[4000,7200],xp:37,ic:'house'},
 {id:'veiling',n:'Afslager bij een kunstveiling',d:'Een zaal aan de Keizersgracht. Eén knik is twintigduizend.',r:10,en:14,cd:275,p:[5800,10000],xp:45,ic:'hammer',
  ev:{q:'Het bieden stokt bij twee ton.',a:[{l:'Nog even rekken',k:.55,m:[1.6,.75],t:['Iemand achterin knikt. Provisie omhoog.','Iedereen haakt af. Lagere provisie.']},{l:'Afhameren',m:[1],t:['Verkocht. Volgende kavel.']}]}},
 {id:'beveilig',n:'Beveiliging op een evenement',d:'Een gala in het Concertgebouw. Jij en twaalf collega\'s in pak.',r:11,en:15,cd:300,p:[9000,15000],xp:55,ic:'shield'},
 {id:'jacht',n:'Schipper op een jacht',d:'Een techmiljonair wil naar Volendam. Niet te snel, de champagne.',r:12,en:16,cd:340,p:[12000,21000],xp:66,ic:'boat',
  ev:{q:'De miljonair wil zelf even sturen.',a:[{l:'Laat hem maar',k:.6,m:[1.5,.7],t:['Hij voelt zich kapitein. Dikke fooi.','Hij raakt de kade in Volendam.']},{l:'Beleefd nee',m:[1],t:['Jij stuurt. Hij drinkt.']}]}},
 {id:'sterren',n:'Gastheer in een sterrenzaak',d:'Jij bepaalt wie het tafeltje bij het raam krijgt.',r:13,en:17,cd:380,p:[16000,29000],xp:79,ic:'star'},
 {id:'adviseur',n:'Adviseur voor een vastgoedbaas',d:'Hij wil weten hoe je een pand rustig leeg krijgt. Jij weet dat.',r:14,en:18,cd:420,p:[26000,42000],xp:95,ic:'brief'},
 {id:'lobby',n:'Lobbyist in Den Haag',d:'Koffie met een Kamerlid. Over geld heb je het nooit.',r:15,en:20,cd:480,p:[33000,59000],xp:120,ic:'brief',
  ev:{q:'Het Kamerlid vraagt om een gunst.',a:[{l:'Ik regel het',k:.65,m:[1.5,.6],t:['De motie gaat de goede kant op. Bonus.','Het lekt uit naar de krant. Opdrachtgever boos.']},{l:'Netjes nee',m:[1],xp:1.5,t:['Je blijft schoon. Dat onthouden ze.']}]}},
 {id:'spreker',n:'Spreker op een congres',d:'Twintig minuten over "ondernemen in de schaduw". Staande ovatie.',r:16,en:21,cd:540,p:[45000,81000],xp:143,ic:'mic'},
 {id:'bestuur',n:'Plekje in een raad van bestuur',d:'Drie vergaderingen per jaar, een dikke vergoeding. Iedereen weet wie je bent.',r:17,en:22,cd:600,p:[70000,110000],xp:170,ic:'crown'},
 {id:'commissaris',n:'Commissaris bij een pensioenfonds',d:'Vier vergaderingen, één handtekening. De vergoeding is dik.',r:18,en:24,cd:660,p:[87000,154000],xp:211,ic:'pen'},
 {id:'gala',n:'Gezicht van een goed doel',d:'Een gala, een cheque met jouw naam en morgen in Het Parool.',r:19,en:26,cd:720,p:[122000,217000],xp:259,ic:'glass',
  ev:{q:'De fotograaf van Het Parool wil een foto.',a:[{l:'Lachen',k:.7,m:[1.4,.9],t:['Op de voorpagina. De sponsors betalen extra.','Je oog dicht op de foto. Jammer.']},{l:'Liever niet',m:[1],t:['Je blijft liever onder de radar.']}]}}];

/* ---------------- Dealen ---------------- */
// niveaus in je netwerk: rep nodig, rang nodig, korting bij het inkopen, hoeveel je per keer verkoopt, opslag, dealers
const DL_LV=[
 {n:'Loopjongen van Mo',who:'Mo van het pleintje',rep:0,r:0,disc:0,cap:8,store:0,dealers:0,d:'Mo geeft je zijn spul mee. Jij verkoopt het op straat en houdt 30%.'},
 {n:'Eigen klantjes',who:'Mo verkoopt aan jou',rep:60,r:1,disc:0,cap:12,store:300,dealers:0,d:'Je koopt in bij Mo en verkoopt aan je eigen klanten. Alles is van jou.'},
 {n:'Vaste lijn',who:'Jopie van de groothandel',rep:400,r:4,disc:.1,cap:40,store:1500,dealers:0,d:'Jopie levert grotere partijen en partydrugs, tien procent goedkoper.'},
 {n:'Groothandel',who:'De Antwerpenaar',rep:2000,r:8,disc:.2,cap:60,store:6000,dealers:3,d:'Jij levert aan andere dealers en zet straatdealers voor je aan het werk.'},
 {n:'Direct bij de bron',who:'Contact in de haven',rep:8000,r:12,disc:.35,cap:120,store:25000,dealers:6,d:'Rechtstreeks uit de containers. Veel goedkoper, en meer mensen op straat.'},
 {n:'Drugsbaron',who:'Je eigen lijn',rep:25000,r:16,disc:.45,cap:200,store:100000,dealers:12,lab:1,d:'Je eigen netwerk, je eigen lab en kilo\'s door de stad.'}];
// producten: inkoop per stuk, straatprijs, vanaf welk niveau, risico per verkoop, hitte, rep per stuk, aantal per verkoop (×cap)
const DRUGS=[
 {id:'vape',n:'Ongekeurde vapes',u:'stuk',u2:'stuks',buy:6,sell:[14,20],lv:0,risk:.02,heat:1,rep:1,k:1.5,col:'#7fd1c7',ic:'vape'},
 {id:'wiet',n:'Wiet',u:'zakje',u2:'zakjes',buy:25,sell:[45,60],lv:0,risk:.03,heat:2,rep:1,k:1,col:'#3fe395',ic:'leaf'},
 {id:'hasj',n:'Hasj',u:'blokje',u2:'blokjes',buy:30,sell:[55,75],lv:1,risk:.03,heat:2,rep:1,k:1,col:'#c9a227',ic:'block'},
 {id:'sigaret',n:'Sigaretten zonder accijns',u:'slof',u2:'sloffen',buy:30,sell:[48,62],lv:1,risk:.015,heat:1,rep:1,k:1,col:'#d9b98a',ic:'pack'},
 {id:'tas',n:'Namaaktassen',u:'tas',u2:'tassen',buy:22,sell:[45,70],lv:1,risk:.015,heat:1,rep:1,k:.8,col:'#e07a5f',ic:'bag'},
 {id:'xtc',n:'XTC-pillen',u:'pil',u2:'pillen',buy:3,sell:[8,12],lv:2,risk:.05,heat:3,rep:.5,k:4,col:'#ff7ab8',ic:'pill'},
 {id:'miauw',n:'Miauw (3-MMC)',u:'gram',u2:'gram',buy:12,sell:[25,40],lv:2,risk:.05,heat:3,rep:2,k:1,col:'#b8a1ff',ic:'crystal'},
 {id:'speed',n:'Speed',u:'gram',u2:'gram',buy:6,sell:[15,22],lv:2,risk:.05,heat:3,rep:1.5,k:1.5,col:'#ffd36a',ic:'powder'},
 {id:'vuurwerk',n:'Zwaar vuurwerk',u:'doos',u2:'dozen',buy:45,sell:[70,100],lv:2,risk:.04,heat:3,rep:2,k:.4,col:'#ff5d5d',ic:'boom'},
 {id:'keta',n:'Ketamine',u:'gram',u2:'gram',buy:15,sell:[30,45],lv:3,risk:.06,heat:4,rep:2.5,k:1,col:'#a9dcff',ic:'vial'},
 {id:'coke',n:'Cocaïne',u:'gram',u2:'gram',buy:35,sell:[60,85],lv:3,risk:.07,heat:5,rep:4,k:1,col:'#f4f1ea',ic:'powder'},
 {id:'horloge',n:'Nephorloges',u:'horloge',u2:'horloges',buy:70,sell:[130,190],lv:3,risk:.03,heat:2,rep:3,k:.25,col:'#cfd6e2',ic:'watch'},
 {id:'kilo',n:'Kilo coke (aan dealers)',u:'kilo',u2:'kilo',buy:21000,sell:[27000,33000],lv:5,risk:.1,heat:8,rep:60,k:.015,nodisc:1,col:'#e8b923',ic:'brick'}];
const DL_EN=8,DL_CD=45;
const dgU=(g,n)=>n===1?g.u:(g.u2||g.u+'s');
const dlS=()=>{if(!S.dl||typeof S.dl!=='object')S.dl={rep:0,stock:{},dealers:0,dp:'wiet',day:0,sold:0,rev:0};const D=S.dl;D.stock=D.stock||{};
 if(!D.bu)D.bu='west';if(!Array.isArray(D.or))D.or=[];D.orT=D.orT||0;if(!D.sat||typeof D.sat!=='object')D.sat={};D.satT=D.satT||0;return D};
const dlLvRaw=()=>{const D=dlS(),ri=rankIdx(S.xp);let l=0;DL_LV.forEach((x,i)=>{if(D.rep>=x.rep&&ri>=x.r)l=i});return l};
const dlLv=()=>dlLvRaw();
const dlBuy=g=>Math.max(1,Math.round(g.buy*(g.nodisc?1:1-DL_LV[dlLv()].disc)*100)/100);
const dlStockN=()=>Object.values(dlS().stock).reduce((a,b)=>a+b,0);
const dlCap=g=>Math.max(1,Math.round(DL_LV[dlLv()].cap*g.k));
const dlRisk=g=>Math.min(.45,g.risk*(1+S.heat/80)*(1-tierK()*.3)*(1-((typeof fitFx==='function'?fitFx('heat'):0)||0)));
// betaal met je contante geld, zwart eerst (drugs koop je niet met een bankpas)
function dlPay(x){const z=Math.min(zwart(),x);S.zwart=zwart()-z;S.cash-=x}
const dlXp=rev=>Math.max(1,Math.round(1.2*Math.pow(Math.max(0,rev),.55)));
// straatdealers en het lab: één keer per speldag (4 uur), ook offline ingehaald
function dlTick(){const D=dlS();const cur=dayStart(now());if(!D.day){D.day=cur;return}let n=0;
 while(D.day<cur&&n<30){D.day=dayStart(D.day+DAY_MS+5400000);n++;const L=DL_LV[dlLv()];
  if(L.lab){['xtc','speed'].forEach(id=>{const room=Math.max(0,L.store-dlStockN()),q=Math.min(room,id==='xtc'?600:250);if(q>0)D.stock[id]=(D.stock[id]||0)+q})}
  if(D.dealers>0){const g=DRUGS.find(x=>x.id===D.dp)||DRUGS[1];let have=D.stock[g.id]||0,sold=0,lostDealer=0;
   for(let i=0;i<D.dealers;i++){if(Math.random()<.04){lostDealer++;have=Math.max(0,have-Math.round(30*g.k));continue}const q=Math.min(have,Math.round(30*g.k));have-=q;sold+=q}
   D.stock[g.id]=have;const rev=Math.round(sold*(g.sell[0]+g.sell[1])/2*.75);if(rev>0){S.cash+=rev;addZwart(rev);D.rev=(D.rev||0)+rev;D.sold=(D.sold||0)+sold}
   if(lostDealer){D.dealers-=lostDealer;log(`Dealen: ${lostDealer} straatdealer${lostDealer>1?'s':''} opgepakt`,'bad')}
   if(rev>0)log(`Je straatdealers verkochten ${sold} ${dgU(g,sold)} ${g.n.toLowerCase()}: +${fmt(rev)} (na hun 25%)`,'ok')}}}
window.wk=window.wk||{view:null,amt:{}};
/* ---------------- Iconen ---------------- */
const WK_IC={mail:'<path d="M4 6h16v12H4z"/><path d="M4 7l8 6 8-6"/>',car:'<path d="M5 16l1.5-5h11L19 16"/><path d="M4 16h16v3H4z"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>',
 box:'<path d="M4 8l8-4 8 4v9l-8 4-8-4z"/><path d="M4 8l8 4 8-4M12 12v9"/>',bike:'<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l4-7h5l3 7M10 10l-1-3h3"/>',
 tent:'<path d="M3 20L12 4l9 16z"/><path d="M12 4v16M9 20l3-6 3 6"/>',door:'<path d="M6 21V4h10v17"/><path d="M4 21h16"/><circle cx="13" cy="13" r="1"/>',key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l3 3"/>',
 shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2M3 13h18"/>',crown:'<path d="M3 18h18l-2-10-5 4-2-6-2 6-5-4z"/>',
 can:'<path d="M8 5h8l1 3v11a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z"/><path d="M7 9h10M10 3h4"/>',dog:'<path d="M5 13c0-3 2-5 5-5h4l3-3 1 4v4c0 3-2 6-6 6H9"/><path d="M5 13l-2 2M9 19v2M14 19v2"/><circle cx="16" cy="9.5" r=".6"/>',
 hook:'<path d="M12 3v11a4 4 0 1 1-8 0"/><path d="M4 14l2-2"/><path d="M8 3h8"/>',plate:'<circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="3.5"/><path d="M4 4l3 3M20 4l-3 3"/>',
 beer:'<path d="M6 7h10v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M16 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2M6 7c0-2 2-3 3-2 1-2 4-2 5 0 1-1 3 0 2 2"/>',
 boat:'<path d="M3 15h18l-3 5H6z"/><path d="M6 15V10h9l3 5M9 10V7h3"/>',vest:'<path d="M8 3l4 3 4-3 4 4v14H4V7z"/><path d="M12 6v15M4 12h4M16 12h4"/>',
 taxi:'<path d="M5 16l1.5-5h11L19 16"/><path d="M4 16h16v3H4z"/><path d="M10 8h4v3h-4z"/><circle cx="8" cy="19" r="1.5"/><circle cx="16" cy="19" r="1.5"/>',
 house:'<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-5h4v5"/>',hammer:'<path d="M13 4l7 7-3 3-7-7z"/><path d="M11.5 8.5L4 16l2 2 7.5-7.5"/>',star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
 mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6"/>',pen:'<path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M14 7l3 3M4 20h16"/>',
 glass:'<path d="M8 3h8l-1 7a3 3 0 0 1-6 0z"/><path d="M12 13v7M9 21h6M8.6 6h6.8"/>',
 work:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5h8v2"/>',deal:'<path d="M3 12l4-4 4 3 4-4 6 6"/><path d="M3 18h18"/>'};
const wkI=(k,c)=>`<svg viewBox="0 0 24 24" fill="none" stroke="${c||'currentColor'}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${WK_IC[k]||WK_IC.work}</svg>`;
// producticonen in kleur
function dgIc(g){const c=g.col;const I={
 vape:`<rect x="10" y="3" width="4" height="15" rx="2" fill="#2b2f37" stroke="${c}" stroke-width="1.4"/><rect x="10.6" y="5" width="2.8" height="4" rx="1" fill="${c}" opacity=".7"/><path d="M12 18v3" stroke="${c}" stroke-width="2"/><path d="M15 4c2-1 2 1 4 0M16 7c2-1 2 1 4 0" stroke="#cfd6e2" stroke-width="1" fill="none" opacity=".6"/>`,
 leaf:`<path d="M12 21v-6M12 15c-1-4-5-6-8-6 2 3 4 6 8 6zM12 15c1-4 5-6 8-6-2 3-4 6-8 6zM12 15c-2-4-2-8 0-12 2 4 2 8 0 12z" fill="${c}" stroke="#1d5a3a" stroke-width=".8"/>`,
 block:`<path d="M5 9l7-4 7 4v7l-7 4-7-4z" fill="#8a6a1e"/><path d="M5 9l7 4 7-4M12 13v7" stroke="#5b4510" stroke-width="1" fill="none"/><path d="M5 9l7-4 7 4-7 4z" fill="${c}"/>`,
 pill:`<circle cx="12" cy="12" r="7.5" fill="${c}" stroke="#7a2350" stroke-width="1"/><path d="M8 10.5l2 2 3-4 2 2" stroke="#fff" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="9.5" cy="9" r="1.3" fill="#fff" opacity=".5"/>`,
 crystal:`<path d="M12 3l5 6-5 12-5-12z" fill="${c}" stroke="#5b4a9a" stroke-width="1"/><path d="M7 9h10M12 3v18" stroke="#fff" stroke-width=".7" opacity=".5"/>`,
 powder:`<path d="M6 8h12l-1 11H7z" fill="#e9eef7" stroke="#9aa6bb" stroke-width="1"/><path d="M6 8l2-3h8l2 3" fill="#cfd6e2"/><path d="M8 15c2-2 6-2 8 0v4H8z" fill="${c}" opacity=".9"/>`,
 vial:`<path d="M10 3h4v4l3 11a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3l3-11z" fill="#1b2333" stroke="${c}" stroke-width="1.2"/><path d="M8.2 14h7.6l.9 4a2 2 0 0 1-2 2h-5.4a2 2 0 0 1-2-2z" fill="${c}"/>`,
 pack:`<path d="M6 7h12v13H6z" fill="${c}" stroke="#6b5537" stroke-width="1"/><path d="M6 7h12v4H6z" fill="#f4efe6"/><path d="M8 4h8l2 3H6z" fill="#b8955f"/><path d="M9 14h6" stroke="#6b5537" stroke-width="1.2"/>`,
 bag:`<path d="M5 10h14l-1.5 10h-11z" fill="${c}" stroke="#7a3322" stroke-width="1"/><path d="M9 10V8a3 3 0 0 1 6 0v2" stroke="#d9b98a" stroke-width="1.6" fill="none"/><path d="M8 14l1 1M12 13l1 1M16 14l-1 1M10 17l1 1M14 17l1 1" stroke="#fbd38d" stroke-width="1"/>`,
 boom:`<path d="M8 9h8v11H8z" fill="${c}" stroke="#7a1f1f" stroke-width="1"/><path d="M8 13h8M8 16h8" stroke="#ffd166" stroke-width="1.2"/><path d="M12 9V6" stroke="#cfd6e2" stroke-width="1.2"/><path d="M12 6l-2-3M12 6l2-3M12 6l-3 0M12 6l3 0" stroke="#ffd166" stroke-width="1"/>`,
 watch:`<path d="M9 3h6l-1 4h-4zM9 21h6l-1-4h-4z" fill="#8a909c"/><circle cx="12" cy="12" r="5.5" fill="#1b2333" stroke="${c}" stroke-width="1.6"/><path d="M12 9v3l2 1.5" stroke="#ffd166" stroke-width="1.2" fill="none" stroke-linecap="round"/>`,
 brick:`<path d="M3 10l9-4 9 4v6l-9 4-9-4z" fill="#d9b25a" stroke="#8a6a20" stroke-width="1"/><path d="M3 10l9 4 9-4M12 14v6" stroke="#8a6a20" stroke-width="1" fill="none"/><path d="M7 9l4-2" stroke="#fff" stroke-width=".8" opacity=".6"/>`};
 return `<svg viewBox="0 0 24 24" aria-hidden="true">${I[g.ic]||I.powder}</svg>`}
/* ---------------- Pagina ---------------- */
V.werk=()=>{if(wk.view==='jobs')return wkJobsHtml();if(wk.view==='deal'&&typeof wkDealHtml==='function')return wkDealHtml();
 const D=dlS(),L=DL_LV[dlLv()],ri=rankIdx(S.xp),open=JOBS.filter(j=>ri>=j.r),ready=open.filter(j=>!cdLeft('job_'+j.id)).length,B=typeof dlBuurt==='function'?dlBuurt():null;
 return `<h1>Werk en dealen</h1><p class="sub">Eerlijk werk of de straat op.</p>
 <div class="wk-ban">
  <button class="wk-b jobs" onclick="wk.view='jobs';render();scrollTo(0,0)"><span class="wk-b-ic">${wkI('work')}</span><span class="wk-b-t"><span class="label">Wit geld · geen risico</span><b>Klusjes</b><span>Van statiegeld tot een gala. Soms moet je kiezen.</span>
   <span class="wk-b-f"><em><b>${open.length}</b> van ${JOBS.length} open</em><em><b>${ready}</b> klaar</em></span><span class="wk-b-go">Aan het werk ›</span></span></button>
  <button class="wk-b deal" onclick="wk.view='deal';render();scrollTo(0,0)"><span class="wk-b-ic">${dgIc(DRUGS[1])}</span><span class="wk-b-t"><span class="label">Zwart geld · hitte · risico</span><b>Dealen</b><span>Inkopen, de goede buurt kiezen, afspraken nakomen.</span>
   <span class="wk-b-f"><em>Jij: <b>${L.n}</b></em><em><b>${Math.floor(D.rep).toLocaleString('nl-NL')}</b> rep</em>${B?`<em>In <b>${B.n}</b></em>`:''}${D.or&&D.or.length&&dlLv()>0?`<em><b>${D.or.length}</b> afspraken</em>`:''}</span><span class="wk-b-go">De straat op ›</span></span></button>
 </div>`};
const wkBack=t=>`<div class="vb-bar"><button class="vb-back" onclick="wk.view=null;wk.ev=null;render()"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg><span>Werk en dealen</span></button><h2>${t}</h2></div>`;
// lijst: open klusjes (beste bovenaan), daarna de eerstvolgende drie op slot als kleine regel
function wkJobsHtml(){const ri=rankIdx(S.xp),open=JOBS.filter(j=>ri>=j.r).reverse(),later=JOBS.filter(j=>ri<j.r),ready=open.filter(j=>!cdLeft('job_'+j.id)&&S.energy>=j.en).length;
 if(wk.ev&&!JOBS.some(j=>j.id===wk.ev.id))wk.ev=null;
 const card=j=>{const left=cdLeft('job_'+j.id),tired=S.energy<j.en,jail=inJail(),ok=!left&&!tired&&!jail,E=wk.ev&&wk.ev.id===j.id?j.ev:null;
  return `<article class="wk-job${E?' ev':''}${ok?'':' wait'}"><span class="wk-j-ic">${wkI(j.ic)}</span><div class="wk-j-b"><b>${j.n}</b><p>${j.d}</p>
   <div class="wk-j-f"><em class="w">${fmt(j.p[0])}–${fmt(j.p[1])}</em><em>${j.en} energie</em><em>+${j.xp} XP</em>${j.ev?'<em class="c">keuze</em>':''}</div></div>
   ${E?`<div class="wk-ev" role="group" aria-label="${j.ev.q}"><b>${E.q}</b><div>${E.a.map((a,i)=>`<button class="btn ${i?'ghost':''}" onclick="act.jobPick('${j.id}',${i})">${a.l}${a.en?` <small>+${a.en} energie</small>`:''}</button>`).join('')}</div></div>`
   :`<button class="btn ${ok?'':'ghost'}" onclick="act.job('${j.id}')" ${ok?'':'disabled'}>${jail?'Je zit vast':left?'Nog '+fmtClock(left):tired?'Te moe':'Doen'}</button>`}</article>`};
 return `${wkBack('Klusjes')}
 <div class="wk-sum"><div><span class="label">Klaar</span><b>${ready}</b></div><div><span class="label">Open</span><b>${open.length}/${JOBS.length}</b></div><div><span class="label">Energie</span><b>${Math.floor(S.energy)}</b></div><div><span class="label">Gedaan</span><b>${(S.stats.jobs||0).toLocaleString('nl-NL')}</b></div></div>
 <div class="wk-jobs">${open.map(card).join('')}</div>
 ${later.length?`<div class="wk-later"><span class="label">Later</span>${later.slice(0,3).map(j=>`<em>${wkI(j.ic)}${j.n}<small>${RANKS[j.r][0]}</small></em>`).join('')}${later.length>3?`<em class="more">+${later.length-3}</em>`:''}</div>`:''}`}
// loon voor een klus (wit), met de bestaande lidmaatschapsbonus
const jobPay=j=>Math.round(rnd(j.p[0],j.p[1])*(1+tierK()*.5));
function jobDo(j,o){const en=j.en+((o&&o.en)||0);if(S.energy<en){toast('Te moe','bad');return}
 S.energy-=en;S.cd['job_'+j.id]=now()+j.cd*1000*waitK();let good=true,m=1,xpK=1,txt='';
 if(o){good=o.k==null||Math.random()<o.k;m=good?o.m[0]:(o.m[1]!=null?o.m[1]:o.m[0]);xpK=o.xp||1;txt=good?o.t[0]:(o.t[1]||o.t[0])}
 const g=Math.max(1,Math.round(jobPay(j)*m)),xp=Math.max(1,Math.round(j.xp*xpK));S.cash+=g;addXp(xp);S.stats.jobs=(S.stats.jobs||0)+1;
 if(good)SFX.chip();toast(`${j.n}: +${fmt(g)} wit`+(txt?` · ${txt}`:''),good?'ok':'bad');log(`${j.n}: ${fmt(g)} verdiend (wit)`+(txt?`. ${txt}`:''),good?'ok':'info');wk.ev=null;save();render()}
Object.assign(act,{
 job(id){const j=JOBS.find(x=>x.id===id);if(!j||inJail()||rankIdx(S.xp)<j.r||cdLeft('job_'+id))return;if(S.energy<j.en){toast('Te moe','bad');return}
  if(j.ev&&Math.random()<JOB_EV){wk.ev={id};try{SFX.click()}catch(e){}render();return}jobDo(j,null)},
 jobPick(id,i){const j=JOBS.find(x=>x.id===id);if(!j||!j.ev||!wk.ev||wk.ev.id!==id||inJail()||cdLeft('job_'+id))return;jobDo(j,j.ev.a[i]||j.ev.a[0])}});
