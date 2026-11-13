// Verhaalstad "De Bezorger" (/verhaal): de kaart. Zelfde interface als stad-map.js (window.STAD_MAP), zodat de hele Pixelstad-engine
// ongewijzigd werkt, maar een eigen, veel grotere stad (1400 × 1200 m) die om het verhaal heen is gebouwd.
// Puur rekenwerk (plus tekenhaakjes in M.gfx die stad-gfx.js aanroept). 1 eenheid = 1 meter; x naar het oosten, z naar het zuiden.
//
// Indeling (noord → zuid):
//  - Noorden: De Haven. Drie havenbekkens met pieren ertussen: containerterrein, loodsen, de Noordkade (Havenloods 7, schepen) en
//    de douanekade. Kranen langs het water. Linksboven De Bajes, rechtsboven het Bedrijventerrein (hallen, silo's, schoorstenen,
//    garage, autokerkhof). Langs de Havenweg loopt het spoor met Centraal Station.
//  - Westen: de Westbuurt (galerijflats, portiekflats, het Westbuurt College, flat De Santis, Bella Napoli, buurthuis, sportschool,
//    speeltuin, voetbalveld, het Westerpark). Daaronder de Villawijk aan zee.
//  - Midden: het Centrum met grachten (twee lange en één dwarse), Het Plein, de bank, het politiebureau en het ziekenhuis.
//    Daaronder Oud-Zuid: rijtjeshuizen met voortuintjes.
//  - Oosten: de Zuidas (torens, pleinen, het kantoor, het hotel, een bouwplaats), daarachter de Ringweg (snelweg) met de afslag
//    'de stad uit' door een tunnel in de dijk.
//  - Zuiden: de Boulevard met palmen (Lounge Sahara, Pizza Rapido, de parkeergarage, het Grand Hotel), het strand met strandtenten
//    en over de brug Het Eiland: Villa Cosa Nostra, villa's, de jachthaven en een vuurtoren.
//  - Trams: lijn 7 over de Tramlaan (west-oost) en lijn 5 over de Vijzelstraat (station → strand). M.TRAM en M.tramAt(x,z).
// Wegen zijn 14 m breed (RW = 7) met stoepen van 5 m; de Boulevard heeft een brede promenade. De Ringweg heeft geen stoepen.
//
// Extra's bovenop de interface van stad-map.js (andere onderdelen mogen ze gebruiken):
//   M.CHUNK        stukgrootte: de engine bouwt en tekent de stad in stukken (zie chunkWorld in stad-gfx.js)
//   M.A            vaste punten van het verhaal (school, thuis, napoli, sahara, … zie onderaan) — altijd op een loopbare plek
//   M.PLEKKEN      plekken voor de verhaalkaart: {id,n,sub,ic,c,x,z,cat}
//   M.adres(x,z)   straatnaam + huisnummer ("Merelstraat 14"); M.straatAt(x,z) alleen de straat
//   M.ADRESSEN     voordeuren om aan te bellen: {x,z,adres,soort:'flat'|'rij'|'villa'|'kantoor'|'winkel'|'portiek',wijk}
//   M.TRAM         tramlijnen [{dir:'h'|'v',c,a,b,lijn}] (c = midden van de weg); M.tramAt(x,z) → true op de rails
//   M.SIGNS        losse borden met tekst (station, snelweg) — getekend door chunkWorld
(function(root){
'use strict';
const W=1400,H=1200,RW=7,SW=5,FL=3.4,LANE=3.4,CHUNK=160,RS=RW+SW;
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,SAND:4,PLAZA:5,LOT:6,DOCK:7,YARD:8,BRIDGE:9,PARK:10,GARDEN:11};
const g=new Uint8Array(W*H),solid=new Uint8Array(W*H);
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(20261113);
const ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=a=>a[Math.floor(rng()*a.length)];
const inb=(x,z)=>x>=0&&z>=0&&x<W&&z<H;
const at=(x,z)=>inb(x,z)?g[z*W+x]:T.WATER;
function set(x0,z0,x1,z1,t,only){x0=Math.floor(x0);z0=Math.floor(z0);x1=Math.ceil(x1);z1=Math.ceil(z1);for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++){const i=z*W+x;if(only==null||only.includes(g[i]))g[i]=t}}
function block(x0,z0,x1,z1,v){x0=Math.floor(x0);z0=Math.floor(z0);x1=Math.ceil(x1);z1=Math.ceil(z1);for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++)solid[z*W+x]=v==null?1:v}

/* ---------- het raster: wegen ---------- */
// noord-zuid (x) en oost-west (z) hoofdwegen
const X={kust:60,merel:150,sperwer:245,kraai:340,wester:430,heren:520,dam:610,vijzel:700,kerk:790,stadh:880,zuidas:980,brug:1080,toren:1180,ring:1300};
const Z={haven:200,station:300,rozen:380,tram:470,lijn:560,park:650,baerle:740,zuider:830,blvd:920,ind:110,eiland:1075};
const VR=[
 {x:X.kust,a:Z.haven,b:Z.blvd,n:'Kustweg'},{x:X.merel,a:Z.station,b:Z.blvd,n:'Merelstraat'},{x:X.sperwer,a:Z.rozen,b:Z.blvd,n:'Sperwerstraat'},
 {x:X.kraai,a:Z.station,b:Z.blvd,n:'Kraaienstraat'},{x:X.wester,a:Z.haven,b:Z.blvd,n:'Westerweg'},{x:X.heren,a:Z.station,b:Z.blvd,n:'Herenstraat'},
 {x:X.dam,a:Z.station,b:Z.blvd,n:'Damstraat'},{x:X.vijzel,a:Z.station,b:Z.blvd,n:'Vijzelstraat',tram:5},{x:X.kerk,a:Z.station,b:Z.blvd,n:'Kerkstraat'},
 {x:X.stadh,a:Z.haven,b:Z.blvd,n:'Stadhouderslaan'},{x:X.zuidas,a:Z.station,b:Z.blvd,n:'Zuidaslaan'},{x:X.brug,a:40,b:Z.eiland,n:'Brugweg'},
 {x:X.toren,a:40,b:Z.blvd,n:'Torenlaan'},{x:X.ring,a:Z.ind,b:Z.blvd,n:'Ringweg A10',hw:1},
 // kades op de pieren in de haven
 {x:330,a:40,b:Z.haven,n:'Containerkade'},{x:535,a:40,b:Z.haven,n:'Loodsenkade'},{x:735,a:40,b:Z.haven,n:'Noordkade'},{x:935,a:40,b:Z.haven,n:'Douanekade'}];
const HR=[
 {z:Z.ind,a:935,b:X.ring,n:'Industrieweg'},{z:Z.haven,a:X.kust,b:X.toren,n:'Havenweg'},{z:Z.station,a:X.kust,b:X.toren,n:'Stationsweg'},
 {z:Z.rozen,a:X.kust,b:X.toren,n:'Rozenstraat'},{z:Z.tram,a:X.kust,b:X.ring,n:'Tramlaan',tram:7},{z:Z.lijn,a:X.kust,b:X.toren,n:'Lijnbaan'},
 {z:Z.park,a:X.kust,b:X.toren,n:'Parkweg'},{z:Z.baerle,a:X.kust,b:X.toren,n:'Van Baerlestraat'},{z:Z.zuider,a:X.kust,b:X.toren,n:'Zuiderstraat'},
 {z:Z.blvd,a:X.kust,b:X.ring,n:'Boulevard'},
 {z:560,a:X.ring,b:1362,n:'A10 (de stad uit)',hw:1},{z:Z.eiland,a:1050,b:1330,n:'Eilandweg'}];
const XS=[...new Set(VR.map(v=>v.x))].sort((a,b)=>a-b),ZS=[...new Set(HR.map(h=>h.z))].sort((a,b)=>a-b);
// blok tussen twee wegen (binnenkant, zonder stoep)
const IN=(a,b)=>[a+RS,b-RS];
const CX=[X.kust,X.merel,X.sperwer,X.kraai,X.wester,X.heren,X.dam,X.vijzel,X.kerk,X.stadh,X.zuidas,X.brug,X.toren,X.ring];
const RZ=[Z.station,Z.rozen,Z.tram,Z.lijn,Z.park,Z.baerle,Z.zuider,Z.blvd];
const cb=i=>IN(CX[i],CX[i+1]),rb=j=>IN(RZ[j],RZ[j+1]);   // kolom i (0 = Kustweg-Merelstraat), rij j (0 = Stationsweg-Rozenstraat)

/* ---------- grond: zee, land, havenbekkens, grachten, strand, Het Eiland ---------- */
g.fill(T.WATER);
set(20,20,1392,938,T.GRASS);                                   // het vasteland
set(20,938,1240,1000,T.SAND);                                  // het strand
set(1240,938,1392,985,T.GRASS);                                // duinen achter het strand (oost)
set(1030,1040,1385,1188,T.GRASS);                              // Het Eiland
// haven: de kades (dok) met drie bekkens
set(200,20,1000,188,T.DOCK);
const BEKKEN=[[400,470],[600,670],[800,870]];
BEKKEN.forEach(([a,b])=>set(a,0,b,175,T.WATER));
// spoor langs de Havenweg (grind), van de Westkust tot het Bedrijventerrein
const SPOOR={x0:20,x1:1288,z0:212,z1:228,tracks:[216.5,223.5]};
set(SPOOR.x0,SPOOR.z0,SPOOR.x1,SPOOR.z1,T.YARD);
// grachten in het Centrum: twee in de lengte, één dwars
const GRACHT=[{x0:556,z0:312,x1:574,z1:638},{x0:736,z0:312,x1:754,z1:638},{x0:442,z0:506,x1:868,z1:524}];
GRACHT.forEach(r=>set(r.x0,r.z0,r.x1,r.z1,T.WATER));

/* ---------- wegen en stoepen (over water worden het bruggen; de snelweg heeft geen stoep) ---------- */
const isRoad=t=>t===T.ROAD||t===T.BRIDGE;
const bridgeWalk=new Uint8Array(W*H);
const rrect=r=>r.x!=null?[r.x-RW,r.a-RW,r.x+RW,r.b+RW]:[r.a-RW,r.z-RW,r.b+RW,r.z+RW];
[...VR,...HR].forEach(r=>{const [x0,z0,x1,z1]=rrect(r);for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){if(!inb(x,z))continue;const i=z*W+x;g[i]=g[i]===T.WATER?T.BRIDGE:T.ROAD}});
[...VR,...HR].forEach(r=>{if(r.hw)return;const [x0,z0,x1,z1]=rrect(r);for(let z=z0-SW;z<z1+SW;z++)for(let x=x0-SW;x<x1+SW;x++){if(!inb(x,z))continue;const i=z*W+x,t=g[i];
  if(isRoad(t))continue;if(t===T.WATER){g[i]=T.BRIDGE;bridgeWalk[i]=1}else if(t!==T.SAND)g[i]=T.WALK}});
// snelweg: berm van grind langs de rijbaan
[...VR,...HR].forEach(r=>{if(!r.hw)return;const [x0,z0,x1,z1]=rrect(r);set(x0-2,z0-2,x1+2,z1+2,T.YARD,[T.GRASS])});
// kades langs de grachten (5 m)
GRACHT.forEach(r=>{if(r.x1-r.x0<30){set(r.x0-5,r.z0,r.x0,r.z1,T.WALK,[T.GRASS]);set(r.x1,r.z0,r.x1+5,r.z1,T.WALK,[T.GRASS])}else{set(r.x0,r.z0-5,r.x1,r.z0,T.WALK,[T.GRASS]);set(r.x0,r.z1,r.x1,r.z1+5,T.WALK,[T.GRASS])}});
// de promenade langs het strand (breed, met palmen)
set(20,927,1240,938,T.WALK,[T.SAND,T.GRASS]);

/* ---------- gebouwen en plekken ---------- */
const buildings=[],props=[],places=[],reserved=[];
const over=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
const isRes=r=>reserved.some(q=>over(q,r));
function addB(b){b.i=buildings.length;buildings.push(b);set(b.x0,b.z0,b.x1,b.z1,T.LOT);block(b.x0,b.z0,b.x1,b.z1);return b}
const doorOf=(f,o,mx,mz)=>f==='N'?{x:mx,z:o.z0-1.2}:f==='S'?{x:mx,z:o.z1+1.2}:f==='W'?{x:o.x0-1.2,z:mz}:{x:o.x1+1.2,z:mz};
// een plek uit het verhaal: een gebouw met een deur (bord, ring en ruit bij de ingang); res = gereserveerd stuk eromheen
function place(o){const r=[o.x0,o.z0,o.x1,o.z1];reserved.push(o.res||r);
  const mx=o.dx!=null?o.dx:(o.x0+o.x1)/2,mz=o.dz!=null?o.dz:(o.z0+o.z1)/2;
  const parts=(o.parts||[r]).map((p,k)=>addB({x0:p[0],z0:p[1],x1:p[2],z1:p[3],fl:p[4]||o.fl,st:p[5]||o.st,roof:p[6]||o.roof||'flat',pl:o.id,main:k===0}));
  const pl=Object.assign({},o,{door:doorOf(o.face,o,mx,mz),b:parts[0].i,page:o.page||o.id,story:1});delete pl.parts;delete pl.res;places.push(pl);return pl}

/* --- De Bajes (noordwest) --- */
set(40,40,180,182,T.YARD);
place({id:'bajes',name:'De Bajes',sign:'BAJES',st:'jail',fl:4,face:'S',dx:110,x0:76,z0:62,x1:144,z1:90,res:[38,38,182,184],ic:'tralies'});
const jailGate={x:110,z:181.2};

/* --- Centrum --- */
const [c5a,c5b]=cb(4),[c6a,c6b]=cb(5),[c7a,c7b]=cb(6),[c8a,c8b]=cb(7),[c9a,c9b]=cb(8);
const [r0a,r0b]=rb(0),[r1a,r1b]=rb(1),[r2a,r2b]=rb(2),[r3a,r3b]=rb(3),[r4a,r4b]=rb(4),[r5a,r5b]=rb(5),[r6a,r6b]=rb(6);
// Centraal Station (tussen spoor en Stationsweg), met fietsenstalling en een tramplein
const STATION={x0:560,z0:236,x1:760,z1:280};
set(442,228,868,288,T.PLAZA,[T.GRASS]);
place({id:'station',name:'Centraal Station',sign:'CENTRAAL',st:'station',fl:4,face:'S',x0:STATION.x0,z0:STATION.z0,x1:STATION.x1,z1:STATION.z1,roof:'gableX',
  parts:[[560,236,760,280,4,'station','gableX'],[648,230,672,280,7,'station','flat']],ic:'door'});
place({id:'politie',name:'Politiebureau Centrum',sign:'POLITIE',st:'police',fl:4,face:'S',x0:c7a+4,z0:r0a+2,x1:c7b-4,z1:r0b-20,res:[c7a,r0a,c7b,r0b],ic:'badge'});
set(c7a,r0b-20,c7b,r0b,T.PLAZA,[T.GRASS]);
place({id:'bank',name:'Pixelbank',sign:'BANK',st:'bank',fl:4,face:'S',x0:c5a+4,z0:r1a+2,x1:c5b-4,z1:r1b-22,res:[c5a,r1a,c5b,r1b],ic:'bank'});
set(c5a,r1b-22,c5b,r1b,T.PLAZA,[T.GRASS]);
place({id:'ziekenhuis',name:'Ziekenhuis Pixelstad',sign:'ZIEKENHUIS',st:'hospital',fl:6,face:'S',x0:c9a+3,z0:r0a+2,x1:c9b-3,z1:r0b-20,res:[c9a,r0a,c9b,r0b],ic:'hart',
  parts:[[c9a+3,r0a+2,c9b-3,r0b-20,6],[c9a+18,r0a+6,c9b-18,r0b-26,9,'hospital']]});
set(c9a,r0b-20,c9b,r0b,T.PLAZA,[T.GRASS]);
// Het Plein (de Dam van de Pixelstad)
const PLEIN={x0:c7a,z0:r1a,x1:c7b,z1:r1b};PLEIN.x=(c7a+c7b)/2;PLEIN.z=(r1a+r1b)/2;
set(c7a,r1a,c7b,r1b,T.PLAZA,[T.GRASS]);reserved.push([c7a,r1a,c7b,r1b]);

/* --- Westbuurt --- */
const [c0a,c0b]=cb(0),[c1a,c1b]=cb(1),[c2a,c2b]=cb(2),[c3a,c3b]=cb(3);
// Westbuurt College: twee blokken samen (de Sperwerstraat begint pas bij de Rozenstraat), schoolplein met hek
const SCHOOL={x0:c1a,z0:r0a,x1:c2b,z1:r0b};
place({id:'school',name:'Westbuurt College',sign:'WESTBUURT COLLEGE',st:'school',fl:3,face:'S',x0:c1a+4,z0:r0a+2,x1:c2b-30,z1:r0a+24,res:[c1a,r0a,c2b,r0b],ic:'lijst',
  parts:[[c1a+4,r0a+2,c2b-30,r0a+24,3],[c2b-28,r0a+2,c2b-4,r0a+36,2,'school2']]});
set(c1a,r0a+24,c2b,r0b,T.PLAZA);
// Flat De Santis (thuis): galerijflat aan de Tramlaan, met een tweede flat erachter
const [r2a_,r2b_]=[r2a,r2b];
place({id:'thuis',name:'Flat De Santis',sign:'KASTANJEFLAT',st:'flat1',fl:10,face:'N',x0:c1a+2,z0:r2a+2,x1:c1b-2,z1:r2a+16,res:[c1a,r2a,c1b,r2b],ic:'home',binnen:'thuis'});
addB({x0:c1a+2,z0:r2b-15,x1:c1b-2,z1:r2b-1,fl:9,st:'flat2',roof:'flat',front:'S'});
set(c1a,r2a+16,c1b,r2b-15,T.GARDEN);
// Pizzeria Bella Napoli: hoekpand Westerweg / Tramlaan, met een plaatsje erachter
place({id:'napoli',name:'Pizzeria Bella Napoli',sign:'BELLA NAPOLI',st:'napoli',fl:2,face:'E',x0:c3b-24,z0:r2a+1,x1:c3b,z1:r2a+19,res:[c3b-36,r2a,c3b,r2a+24],ic:'kop',binnen:'napoli',roof:'flat'});
set(c3b-35,r2a+3,c3b-25,r2a+17,T.YARD);
// buurthuis en sportschool aan de Lijnbaan
place({id:'buurthuis',name:'Buurthuis De Kastanje',sign:'BUURTHUIS',st:'brick3',fl:2,face:'N',x0:c0a+4,z0:r3a+2,x1:c0a+44,z1:r3a+22,ic:'mensen',roof:'gableX'});
place({id:'sportschool',name:'Boksschool De Bokszak',sign:'DE BOKSZAK',st:'gym',fl:2,face:'N',x0:c2a+4,z0:r3a+2,x1:c2a+40,z1:r3a+20,ic:'vuist'});

/* --- Boulevard --- */
const [c10a,c10b]=cb(9),[c11a,c11b]=cb(10),[c12a,c12b]=cb(11),[c13a,c13b]=cb(12);
place({id:'sahara',name:'Lounge Sahara',sign:'SAHARA LOUNGE',st:'sahara',fl:2,face:'S',x0:c7a+6,z0:r6b-30,x1:c7b-6,z1:r6b,res:[c7a,r6b-44,c7b,r6b],ic:'music',binnen:'sahara'});
set(c7a+6,r6b-42,c7b-6,r6b-30,T.YARD);             // achterplaats van Sahara (achteringang, afvalcontainers)
place({id:'rapido',name:'Pizza Rapido',sign:'PIZZA RAPIDO',st:'rapido',fl:2,face:'S',x0:c9a+4,z0:r6b-20,x1:c9a+28,z1:r6b,ic:'kop'});
place({id:'parkeergarage',name:'Parkeergarage Boulevard',sign:'P GARAGE',st:'parking',fl:5,face:'W',x0:c10a+4,z0:r6a+4,x1:c10b-4,z1:r6b-4,res:[c10a,r6a,c10b,r6b],ic:'auto'});
place({id:'hotel',name:'Grand Hotel Pixel',sign:'GRAND HOTEL',st:'hotel',fl:3,face:'S',x0:c11a+2,z0:r6b-14,x1:c11b-2,z1:r6b-2,res:[c11a,r6a,c11b,r6b],ic:'kroon',
  parts:[[c11a+2,r6b-14,c11b-2,r6b-2,3],[c11a+6,r6a+12,c11b-6,r6b-14,18,'hotel']]});
set(c11a,r6a,c11b,r6b,T.PLAZA,[T.GRASS]);
// strandtent (aan zee, ten zuiden van Sahara)
place({id:'strandtent',name:'Strandtent De Zeemeeuw',sign:'DE ZEEMEEUW',st:'beach',fl:1,face:'N',x0:640,z0:952,x1:668,z1:964,ic:'kop',roof:'flat'});
set(636,948,672,968,T.DOCK);    // houten terras rond de tent (dok-vloer)

/* --- Oud-Zuid: het rijtjeshuis (aan de rand, bij de Zuidas) --- */
place({id:'rijtjeshuis',name:'Rijtjeshuis Ceintuurbaan 77',sign:'77',st:'row2',fl:3,face:'N',x0:c9b-14,z0:r5a+3,x1:c9b-7,z1:r5a+14,res:[c9b-15,r5a,c9b-6,r5a+15],ic:'home',roof:'gableX',binnen:'rijtjeshuis'});

/* --- Zuidas --- */
place({id:'kantoor',name:'Kantoor Zuidas (Van Dijk & Partners)',sign:'VAN DIJK & PARTNERS',st:'office1',fl:24,face:'W',x0:c11a+8,z0:r2a+6,x1:c11a+44,z1:r2b-6,res:[c11a,r2a,c11b,r2b],ic:'akte'});
set(c11a,r2a,c11b,r2b,T.PLAZA,[T.GRASS]);
place({id:'advocaat',name:'Hoefnagel Advocaten',sign:'HOEFNAGEL',st:'office3',fl:14,face:'W',x0:c10a+6,z0:r3a+6,x1:c10a+36,z1:r3b-12,res:[c10a,r3a,c10b,r3b],ic:'akte'});
set(c10a,r3a,c10b,r3b,T.PLAZA,[T.GRASS]);

/* --- De Haven --- */
// pieren: containerterrein (200-400), loodsen (470-600), Noordkade (670-800), douanekade (870-1000)
place({id:'havenloods',name:'Havenloods 7',sign:'HAVENLOODS 7',st:'ware',fl:3,face:'W',x0:748,z0:118,x1:790,z1:172,roof:'gableZ',ic:'helm'});
place({id:'douane',name:'Douanepost',sign:'DOUANE',st:'police',fl:2,face:'W',x0:948,z0:146,x1:976,z1:166,ic:'badge'});

/* --- Bedrijventerrein --- */
place({id:'garage',name:'Garage Van der Plaat',sign:'GARAGE',st:'garage',fl:2,face:'E',x0:1010,z0:142,x1:1064,z1:184,ic:'moer'});
set(1000,122,1068,188,T.YARD,[T.GRASS,T.DOCK]);
set(1192,122,1288,188,T.YARD,[T.GRASS]);
place({id:'sloop',name:'Autokerkhof De Sloop',sign:'AUTOKERKHOF',st:'ware2',fl:1,face:'N',x0:1196,z0:124,x1:1218,z1:138,ic:'wrak'});
place({id:'loods',name:'Loods 12 (Bedrijventerrein)',sign:'LOODS 12',st:'ware2',fl:3,face:'S',x0:1096,z0:232,x1:1164,z1:282,roof:'gableX',ic:'helm'});

/* --- Het Eiland --- */
const COSA={x0:1192,z0:1090,x1:1312,z1:1172};
set(COSA.x0,COSA.z0,COSA.x1,COSA.z1,T.GARDEN);
place({id:'villa_cosa',name:'Villa Cosa Nostra',sign:'COSA NOSTRA',st:'villa',fl:2,face:'N',x0:1236,z0:1102,x1:1268,z1:1112,res:[COSA.x0-2,COSA.z0-2,COSA.x1+2,COSA.z1+2],ic:'hoed',
  parts:[[1236,1102,1268,1112,2],[1222,1110,1282,1150,3,'villa','gableX']]});
// jachthaven: kade langs de noordkant van het eiland met steigers in het water
set(1100,1040,1260,1048,T.DOCK);
for(let x=1110;x<=1250;x+=20)set(x,1006,x+2,1040,T.DOCK);
set(1100,1006,1252,1009,T.DOCK);
place({id:'jachthaven',name:'Jachthaven Het Eiland',sign:'JACHTHAVEN',st:'beach2',fl:1,face:'N',x0:1150,z0:1050,x1:1172,z1:1062,ic:'vis'});

/* ---------- vul de rest van de stad ---------- */
const STY={west:['brick','brick2','brick3','plaster'],portiek:['portiek1','portiek2','brick','brick3'],centrum:['plaster','brick','brick2','shop','brick3'],gracht:['brick','brick2','brick3','plaster','gracht1'],
  zuid:['glass','glass2','office1','office2','office3'],haven:['ware','ware2'],strand:['beach','beach2'],villa:['villa','plaster','brick3','villa2'],row:['row1','row2','row1','brick3'],ind:['ware','ware2','garage','hall1']};
const alleys=[];
// rand van een blok vol panden (zoals in stad-map.js); o.inner = ondergrond in het midden
function fill(x0,z0,x1,z1,o){
  const d=o.d||ri(o.dmin,o.dmax),gap=o.gap||0;
  const alley=(f,a,b)=>{const r=f==='N'?[a,z0,b,z0+d]:f==='S'?[a,z1-d,b,z1]:f==='W'?[x0,a,x0+d,b]:[x1-d,a,x1,b];if(!isRes(r))alleys.push({x0:r[0],z0:r[1],x1:r[2],z1:r[3],f,cx:(r[0]+r[2])/2,cz:(r[1]+r[3])/2})};
  const side=(ax,bx_,mk,f)=>{let x=ax,made=0;const mid=(ax+bx_)/2;while(x<bx_){let w=ri(o.wmin,o.wmax);if(bx_-x-w<o.wmin)w=bx_-x;if(((gap&&rng()<gap)||(!made&&x>=mid-5))&&x>ax&&bx_-x>o.wmin+3){alley(f,x,x+3);made=1;x+=3;continue}mk(x,Math.min(bx_,x+w));x+=w}};
  const B=(a,b,c,e,f)=>{const r=[a,b,c,e];if(c-a<3||e-b<3||isRes(r))return;
    addB({x0:a,z0:b,x1:c,z1:e,fl:ri(o.fmin,o.fmax),st:pick(o.st),roof:o.roof?(f==='N'||f==='S'?'gableX':'gableZ'):'flat',front:f,soort:o.soort})};
  if(!o.noN)side(x0,x1,(a,b)=>B(a,z0,b,z0+d,'N'),'N');
  if(!o.noS)side(x0,x1,(a,b)=>B(a,z1-d,b,z1,'S'),'S');
  if(z1-z0>2*d+o.wmin&&!o.noWE){side(z0+d,z1-d,(a,b)=>B(x0,a,x0+d,b,'W'),'W');side(z0+d,z1-d,(a,b)=>B(x1-d,a,x1,b,'E'),'E')}
  set(x0+d,z0+d,x1-d,z1-d,o.inner||T.GARDEN,[T.GRASS]);
}
// galerijflats: lange schijven aan twee kanten van het blok, met een doorgang (steeg) in het midden en groen ertussen
function slabs(x0,z0,x1,z1,o){const d=o.d||13,along=o.dir||'x';
  const mk=(a,b,c,e,f)=>{if(c-a<6||e-b<6||isRes([a,b,c,e]))return;addB({x0:a,z0:b,x1:c,z1:e,fl:ri(o.fmin,o.fmax),st:pick(o.st),roof:'flat',front:f,soort:'flat'})};
  if(along==='x'){const mid=Math.round((x0+x1)/2);
    [['N',z0+1],['S',z1-1-d]].forEach(([f,za])=>{if(o['no'+f])return;mk(x0+1,za,mid-2,za+d,f);mk(mid+2,za,x1-1,za+d,f);
      const r=[mid-2,za,mid+2,za+d];if(!isRes(r))alleys.push({x0:r[0],z0:r[1],x1:r[2],z1:r[3],f,cx:mid,cz:za+d/2})});
    set(x0,z0+d+1,x1,z1-d-1,o.inner||T.GARDEN,[T.GRASS])}
  else{const mid=Math.round((z0+z1)/2);
    [['W',x0+1],['E',x1-1-d]].forEach(([f,xa])=>{if(o['no'+f])return;mk(xa,z0+1,xa+d,mid-2,f);mk(xa,mid+2,xa+d,z1-1,f);
      const r=[xa,mid-2,xa+d,mid+2];if(!isRes(r))alleys.push({x0:r[0],z0:r[1],x1:r[2],z1:r[3],f,cx:xa+d/2,cz:mid})});
    set(x0+d+1,z0,x1-d-1,z1,o.inner||T.GARDEN,[T.GRASS])}}
// rijtjeshuizen met een voortuintje aan de straat en achtertuinen in het midden
function rows(x0,z0,x1,z1,o){const d=o.d||11,tuin=3;
  [['N',z0+tuin],['S',z1-tuin-d]].forEach(([f,za])=>{set(x0,f==='N'?z0:z1-tuin,x1,f==='N'?z0+tuin:z1,T.GARDEN,[T.GRASS]);let x=x0,run=0,st=pick(STY.row),fl=ri(2,3);
    while(x<x1-5){let w=ri(6,7);if(x1-x-w<6)w=x1-x;if(run>=ri(5,8)&&x1-x>12){const r=[x,za,x+3,za+d];if(!isRes(r)){alleys.push({x0:x,z0:za,x1:x+3,z1:za+d,f,cx:x+1.5,cz:za+d/2});set(x,f==='N'?z0:z1-tuin,x+3,f==='N'?z0+tuin:z1,T.WALK)}x+=3;run=0;st=pick(STY.row);fl=ri(2,3);continue}
      const r=[x,za,x+w,za+d];if(!isRes(r))addB({x0:x,z0:za,x1:x+w,z1:za+d,fl,st,roof:'gableX',front:f,soort:'rij'});x+=w;run++}});
  set(x0,z0+tuin+d,x1,z1-tuin-d,T.GARDEN,[T.GRASS])}
// torens van de Zuidas op een plein
function towers(x0,z0,x1,z1,o){set(x0,z0,x1,z1,T.PLAZA,[T.GRASS]);const made=[],BW=x1-x0,BD=z1-z0;
  const put=(r,fl,st)=>{r=r.map(Math.round);if(r[0]<x0+3||r[1]<z0+3||r[2]>x1-3||r[3]>z1-3||r[2]-r[0]<8||r[3]-r[1]<8)return false;if(isRes(r)||made.some(q=>over([q[0]-5,q[1]-5,q[2]+5,q[3]+5],r)))return false;
    made.push(r);addB({x0:r[0],z0:r[1],x1:r[2],z1:r[3],fl,st:st||pick(STY.zuid),roof:'flat',front:'S',soort:'kantoor'});return true};
  // 1: een hoge toren in een hoek, 2: een middelhoge in de andere hoek, 3: laagbouw langs een rand
  const cn=ri(0,3),w1=Math.min(BW-10,ri(o.wmin||26,o.wmax||36)),d1=Math.min(BD-10,ri(o.dmin||24,o.dmax||32));
  const cx1=cn%2?x1-3-w1:x0+3,cz1=cn<2?z0+3:z1-3-d1;put([cx1,cz1,cx1+w1,cz1+d1],ri(o.fmin||16,o.fmax||34));
  if(o.n!==1){const w2=ri(16,24),d2=ri(16,22),cx2=cn%2?x0+3:x1-3-w2,cz2=cn<2?z1-3-d2:z0+3;put([cx2,cz2,cx2+w2,cz2+d2],ri(8,16))||put([cx2,cn<2?z0+3:z1-3-d2,cx2+w2,(cn<2?z0+3:z1-3-d2)+d2],ri(8,14));
    const ez=cn<2?z1-17:z0+3;for(let t=0;t<4;t++){const L=ri(18,30),sx=x0+3+rng()*(BW-6-L);if(put([sx,ez,sx+L,ez+14],ri(3,6),pick(['concrete','office3','glass2'])))break}}
  return made}
// bedrijfshallen met een erf
function hallen(x0,z0,x1,z1,o){set(x0,z0,x1,z1,o.inner||T.YARD,[T.GRASS,T.DOCK]);const n=o.n||ri(1,3),made=[];
  for(let k=0,t=0;k<n&&t<40;t++){const w=ri(24,44),d=ri(18,30),a=x0+3+rng()*Math.max(0,(x1-x0-6-w)),b=z0+3+rng()*Math.max(0,(z1-z0-6-d));
    const r=[Math.round(a),Math.round(b),Math.round(a)+w,Math.round(b)+d];if(r[2]>x1-2||r[3]>z1-2)continue;if(isRes(r)||made.some(q=>over([q[0]-6,q[1]-6,q[2]+6,q[3]+6],r)))continue;
    made.push(r);addB({x0:r[0],z0:r[1],x1:r[2],z1:r[3],fl:ri(2,4),st:pick(STY.ind),roof:rng()<.5?(w>d?'gableX':'gableZ'):'flat',front:'S'})}
  return made}
const WEST={wmin:8,wmax:14,dmin:12,dmax:14,fmin:4,fmax:5,st:STY.portiek,gap:.15,soort:'portiek'};
const CEN={wmin:7,wmax:12,dmin:12,dmax:15,fmin:4,fmax:6,st:STY.centrum,gap:.14,soort:'winkel'};
const VILLA={wmin:16,wmax:22,dmin:15,dmax:17,fmin:2,fmax:3,st:STY.villa,roof:1,gap:.45,soort:'villa'};
const BOUL={wmin:12,wmax:18,dmin:14,dmax:16,fmin:5,fmax:9,st:['beach','beach2','plaster','hotelb'],gap:.2,soort:'winkel'};
const HAVEN={wmin:16,wmax:24,dmin:16,dmax:20,fmin:2,fmax:3,st:STY.haven,roof:1,gap:.3,inner:T.DOCK};

// Westbuurt: kolommen 0-3, rijen 0-4 (school, thuis, Napoli, park en veld zijn al gereserveerd of krijgen iets eigens)
const [r0w,r0e]=[r0a,r0b];
// rij 0: flats aan de Kustweg, school (al), portiek aan de Westerweg
slabs(c0a,r0a,c0b,r0b,{dir:'z',fmin:8,fmax:10,st:['flat1','flat2','flat3']});
fill(c3a,r0a,c3b,r0b,WEST);
// rij 1: flats, 'de hoek' (portiekflats + speeltuin), flats, portiek
slabs(c0a,r1a,c0b,r1b,{dir:'x',fmin:8,fmax:11,st:['flat1','flat2','flat3']});
fill(c1a,r1a,c1b,r1b,Object.assign({},WEST,{noS:1,noWE:1,d:13}));
const SPEELTUIN={x0:c1a+4,z0:r1a+18,x1:c1b-4,z1:r1b-2};set(SPEELTUIN.x0,SPEELTUIN.z0,SPEELTUIN.x1,SPEELTUIN.z1,T.PARK);
slabs(c2a,r1a,c2b,r1b,{dir:'x',fmin:9,fmax:11,st:['flat1','flat2','flat3']});
fill(c3a,r1a,c3b,r1b,WEST);
// rij 2: flats, thuis (al), flats (Dex woont hier), Napoli + portiek
slabs(c0a,r2a,c0b,r2b,{dir:'z',fmin:8,fmax:10,st:['flat1','flat2','flat3']});
slabs(c2a,r2a,c2b,r2b,{dir:'x',fmin:7,fmax:9,st:['flat2','flat3','portiek1']});
fill(c3a,r2a,c3b,r2b,WEST);
// rij 3: buurthuis + flats, voetbalveld, sportschool + flats, park
fill(c0a,r3a,c0b,r3b,Object.assign({},WEST,{noN:1}));
const VELD={x0:c1a+4,z0:r3a+6,x1:c1b-4,z1:r3b-6};set(c1a,r3a,c1b,r3b,T.PARK);set(VELD.x0,VELD.z0,VELD.x1,VELD.z1,T.GRASS);
fill(c2a,r3a,c2b,r3b,Object.assign({},WEST,{noN:1}));
// rij 4: flats
slabs(c0a,r4a,c0b,r4b,{dir:'x',fmin:8,fmax:10,st:['flat1','flat2','flat3']});
slabs(c1a,r4a,c1b,r4b,{dir:'z',fmin:9,fmax:12,st:['flat1','flat2','flat3']});
slabs(c2a,r4a,c2b,r4b,{dir:'x',fmin:8,fmax:10,st:['flat1','flat2','flat3']});
// het Westerpark (twee blokken, de Parkweg loopt erdoor)
const WPARK={x0:c3a,z0:r3a,x1:c3b,z1:r4b};set(c3a,r3a,c3b,r3b,T.PARK);set(c3a,r4a,c3b,r4b,T.PARK);
const VIJVER={x0:c3a+14,z0:r4a+18,x1:c3b-14,z1:r4b-16};set(VIJVER.x0,VIJVER.z0,VIJVER.x1,VIJVER.z1,T.WATER);
// strook tussen spoor en Stationsweg in het westen: volkstuintjes met schuurtjes
set(72,232,418,288,T.GARDEN,[T.GRASS]);
// Villawijk (rij 5 en 6, kolom 0-3)
[0,1,2,3].forEach(i=>[5,6].forEach(j=>{const [a,b]=cb(i),[c,d]=rb(j);set(a,c,b,d,T.GARDEN);fill(a,c,b,d,VILLA)}));
// Westkust: strook duin/park langs het water
set(20,212,48,927,T.PARK,[T.GRASS]);

// Centrum: blokken zonder gracht krijgen gewone panden; langs de grachten smalle grachtenpanden
fill(c5a,r0a,c5b,r0b,CEN);fill(c9a,r1a,c9b,r1b,CEN);fill(c5a,r3a,c5b,r3b,CEN);fill(c7a,r3a,c7b,r3b,CEN);fill(c9a,r3a,c9b,r3b,CEN);
// grachtenpanden: langs elke gracht, in elk stuk tussen twee wegen
function grachtPanden(){
  GRACHT.forEach(gr=>{const vert=gr.x1-gr.x0<30;
    if(vert){[[gr.x0-5-19,gr.x0-5,'E'],[gr.x1+5,gr.x1+5+19,'W']].forEach(([a,b,f])=>{let z=gr.z0;while(z<gr.z1-4){
        if(at(Math.floor((a+b)/2),z)!==T.GRASS&&at(Math.floor((a+b)/2),z)!==T.GARDEN){z++;continue}
        const w=ri(6,8);let e=Math.min(gr.z1,z+w);let ok=true;for(let q=z;q<e;q++){const t=at(Math.floor((a+b)/2),q);if(t!==T.GRASS&&t!==T.GARDEN){e=q;break}}
        if(e-z>=4&&!isRes([a,z,b,e]))addB({x0:a,z0:z,x1:b,z1:e,fl:ri(3,5),st:pick(STY.gracht),roof:'gableZ',front:f,soort:'gracht'});z=e+(rng()<.15?3:0)}})}
    else{[[gr.z0-5-19,gr.z0-5,'S'],[gr.z1+5,gr.z1+5+19,'N']].forEach(([a,b,f])=>{let x=gr.x0;while(x<gr.x1-4){
        const t0=at(x,Math.floor((a+b)/2));if(t0!==T.GRASS&&t0!==T.GARDEN){x++;continue}
        const w=ri(6,8);let e=Math.min(gr.x1,x+w);for(let q=x;q<e;q++){const t=at(q,Math.floor((a+b)/2));if(t!==T.GRASS&&t!==T.GARDEN){e=q;break}}
        if(e-x>=4&&!isRes([x,a,e,b]))addB({x0:x,z0:a,x1:e,z1:b,fl:ri(3,5),st:pick(STY.gracht),roof:'gableX',front:f,soort:'gracht'});x=e+(rng()<.15?3:0)}})}})}
grachtPanden();
// achtertuinen/binnenplaatsen in de grachtblokken: wat over is wordt tuin
[[5,0],[5,1],[5,2],[5,3],[7,0],[7,1],[7,2],[7,3]].forEach(([i,j])=>{const [a,b]=cb(i),[c,d]=rb(j);set(a,c,b,d,T.GARDEN,[T.GRASS])});
[[4,2],[6,2],[8,2]].forEach(([i,j])=>{const [a,b]=cb(i),[c,d]=rb(j);set(a,c,b,d,T.GARDEN,[T.GRASS])});
// Oud-Zuid: rijtjeshuizen (rij 4 en 5, kolom 4-8)
[4,5,6,7,8].forEach(i=>[4,5].forEach(j=>{const [a,b]=cb(i),[c,d]=rb(j);rows(a,c,b,d,{})}));
// Boulevard (rij 6): strandhotels, winkels en horeca
fill(c5a,r6a,c5b,r6b,BOUL);fill(c6a,r6a,c6b,r6b,BOUL);fill(c7a,r6a,c7b,r6b-44,Object.assign({},BOUL,{noS:1,noWE:1,d:16}));
fill(c8a,r6a,c8b,r6b,BOUL);fill(c9a,r6a,c9b,r6b,BOUL);fill(c12a,r6a,c12b,r6b,BOUL);
set(c13a,r6a,c13b,r6b,T.PARK,[T.GRASS]);
// Zuidas: torens (kolom 9-12, rij 0-5), met een bouwplaats
const BOUW={x0:c12a,z0:r5a,x1:c12b,z1:r5b};set(BOUW.x0,BOUW.z0,BOUW.x1,BOUW.z1,T.YARD);reserved.push([BOUW.x0,BOUW.z0,BOUW.x1,BOUW.z1]);
addB({x0:c12a+20,z0:r5a+14,x1:c12a+50,z1:r5a+42,fl:7,st:'concrete',roof:'flat'});
const ZPLEIN={x0:c11a,z0:r3a,x1:c11b,z1:r3b};set(ZPLEIN.x0,ZPLEIN.z0,ZPLEIN.x1,ZPLEIN.z1,T.PLAZA,[T.GRASS]);reserved.push([ZPLEIN.x0+10,ZPLEIN.z0+10,ZPLEIN.x1-10,ZPLEIN.z1-10]);
[[9,0],[10,0],[11,0],[12,0],[9,1],[10,1],[11,1],[12,1],[9,2],[12,2],[11,3],[12,3],[9,4],[10,4],[11,4],[9,5],[10,5],[12,4],[12,5]].forEach(([i,j])=>{const [a,b]=cb(i),[c,d]=rb(j);towers(a,c,b,d,{n:i===12?1:2,fmin:i===12?10:16,fmax:i>=10&&j<=3?40:28})});
{const [a,b]=cb(11),[c,d]=rb(2);set(a,c,b,d,T.PARK,[T.GRASS])}   // Zuidaspark
// strook tussen spoor en Stationsweg bij de Zuidas: kantoren
towers(892,228,968,288,{n:2,fmin:8,fmax:14,wmin:22,wmax:30,dmin:20,dmax:26});
// geluidswal langs de Ringweg (westkant)
// Bedrijventerrein (noordoost): hallen
hallen(1000,22,1068,98,{n:2});hallen(1092,22,1168,98,{n:2});hallen(1192,22,1288,98,{n:2});
hallen(1092,122,1168,188,{n:2});hallen(1000,232,1068,288,{n:1});hallen(1192,232,1288,288,{n:2});
// De Haven: loodsen op de pieren (de randen langs het water blijven vrij voor kranen en containers)
function loodsen(x0,x1,z0,z1,face){let z=z0;while(z<z1-12){const L=ri(26,40),e=Math.min(z1,z+L);if(e-z>=12&&!isRes([x0,z,x1,e]))addB({x0,z0:z,x1,z1:e,fl:ri(2,3),st:pick(STY.haven),roof:'gableZ',front:face,soort:'loods'});z=e+ri(8,14)}}
loodsen(484,522,26,176,'E');loodsen(548,586,26,176,'W');loodsen(684,722,26,176,'E');loodsen(748,790,26,110,'W');loodsen(882,922,26,176,'E');
// Het Eiland: villa's
[[1048,1090,1178,1176]].forEach(([a,b,c,d])=>{set(a,b,c,d,T.GARDEN);fill(a,b,c,d,Object.assign({},VILLA,{noS:1}))});
// de tunnel in de dijk (oostrand): de A10 rijdt de stad uit
const DIJK={x0:1362,z0:500,x1:1398,z1:620};
addB({x0:DIJK.x0,z0:DIJK.z0,x1:DIJK.x1,z1:DIJK.z1,fl:4,st:'dijk',roof:'flat'});
// stegen: donker asfalt
alleys.forEach(a=>set(a.x0,a.z0,a.x1,a.z1,T.YARD,[T.GRASS,T.GARDEN,T.PLAZA]));

/* ---------- spullen (decor; sommige blokkeren) ---------- */
function prop(k,x,z,o){const p=Object.assign({k,x,z},o||{});props.push(p);if(p.solid){const r=p.solid;block(Math.floor(x-r),Math.floor(z-r),Math.ceil(x+r),Math.ceil(z+r))}return p}
function propR(k,x0,z0,x1,z1,o,sol){const p=Object.assign({k,x0,z0,x1,z1},o||{});props.push(p);if(sol)block(x0,z0,x1,z1);return p}
const nearRoadCorner=(x,z)=>XS.some(q=>Math.abs(q-x)<RS+1)&&ZS.some(q=>Math.abs(q-z)<RS+1);
const nearDoor=(x,z)=>places.some(p=>Math.hypot(p.door.x-x,p.door.z-z)<3);
const free=(x,z,r)=>{if(nearDoor(x,z))return false;for(let a=Math.floor(z-r);a<=Math.ceil(z+r);a++)for(let b=Math.floor(x-r);b<=Math.ceil(x+r);b++){if(!inb(b,a)||solid[a*W+b])return false;const t=g[a*W+b];if(t===T.WATER||t===T.ROAD||t===T.BRIDGE)return false}return true};
// paden door de parken
const parkPaths=[];
[[c3a,r3a,c3b,r3b],[c3a,r4a,c3b,r4b],[c1a,r3a,c1b,r3b]].forEach(([a,b,c,d])=>{const mx=Math.floor((a+c)/2),mz=Math.floor((b+d)/2);parkPaths.push({x0:a,z0:mz-1,x1:c,z1:mz+1},{x0:mx-1,z0:b,x1:mx+1,z1:d})});
parkPaths.push({x0:30,z0:212,x1:32,z1:927});
const onPath=(x,z,r)=>parkPaths.some(p=>x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r);
const inR=(x,z,r,m)=>x>r.x0-(m||0)&&x<r.x1+(m||0)&&z>r.z0-(m||0)&&z<r.z1+(m||0);
// bomen in parken en tuinen (niet op paden, niet op het voetbalveld)
for(let i=0;i<60000;i++){const x=6+rng()*(W-12),z=6+rng()*(H-12),t=at(x|0,z|0);
  if((t===T.PARK&&rng()<.42)||(t===T.GARDEN&&rng()<.075)){if(inR(x,z,VELD,2)||inR(x,z,SPEELTUIN,1))continue;if(free(x,z,1.6)&&!onPath(x,z,1.3)){const s=.8+rng()*.6,v=ri(0,2);prop('tree',x,z,{s,v,solid:.5})}}}
// palmen op de promenade en Het Eiland, parasols op het strand
for(let x=26;x<1236;x+=ri(11,15)){const z=933.5;if(XS.some(q=>Math.abs(q-x)<RS+2))continue;if(free(x,z,.8))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
for(let x=1060;x<1380;x+=ri(12,18)){const z=1178+rng()*5;if(at(x|0,z|0)===T.GRASS&&free(x,z,1))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
for(let x=30;x<1230;x+=ri(8,12)){const z=968+rng()*22;if(at(x|0,z|0)===T.SAND&&!(x>1066&&x<1094)&&free(x,z,1.4))prop('umbrella',x,z,{v:ri(0,3)})}
// lantaarns langs de wegen (buitenrand van de stoep); langs de snelweg hoge masten
const okLamp=(a,b)=>at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b);
VR.forEach(v=>{if(v.hw){for(let z=v.a+20;z<v.b-10;z+=60)prop('lamp',v.x-RW-1.2,z,{solid:.2});return}for(let z=v.a+14;z<v.b-8;z+=26){[[v.x-RS+.5,z],[v.x+RS-.5,z+13]].forEach(([a,b])=>{if(okLamp(a,b))prop('lamp',a,b,{solid:.2})})}});
HR.forEach(h=>{if(h.hw){for(let x=h.a+20;x<h.b-10;x+=60)prop('lamp',x,h.z+RW+1.2,{solid:.2});return}for(let x=h.a+14;x<h.b-8;x+=26){[[x,h.z-RS+.5],[x+13,h.z+RS-.5]].forEach(([a,b])=>{if(okLamp(a,b))prop('lamp',a,b,{solid:.2})})}});
// bomen en paaltjes langs de grachten, fietsen tegen de reling
GRACHT.forEach(gr=>{const vert=gr.x1-gr.x0<30;
  if(vert){for(let z=gr.z0+4;z<gr.z1-2;z+=10){[[gr.x0-3.5,z],[gr.x1+3.5,z+5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.6))prop('tree',a,b,{s:.7,v:1,solid:.4})})}
    for(let z=gr.z0+2;z<gr.z1-2;z+=3){[[gr.x0-.6,z],[gr.x1+.6,z]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.3))prop('bollard',a,b,{solid:.15})})}
    for(let z=gr.z0+8;z<gr.z1-4;z+=17){const a=gr.x0-1.6,b=z+5;if([b-1.4,b,b+1.4].every(q=>at(a|0,q|0)===T.WALK&&!solid[(q|0)*W+(a|0)]))prop('bikes',a,b,{rot:1,v:ri(0,4)})}
    for(let z=gr.z0+10;z<gr.z1-6;z+=ri(18,30)){if(ZS.some(q=>Math.abs(q-z)<16))continue;prop('boat',rng()<.5?gr.x0+3.6:gr.x1-3.6,z,{rot:1,v:ri(0,4),l:ri(5,8)})}}
  else{for(let x=gr.x0+4;x<gr.x1-2;x+=10){[[x,gr.z0-3.5],[x+5,gr.z1+3.5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.6))prop('tree',a,b,{s:.7,v:1,solid:.4})})}
    for(let x=gr.x0+2;x<gr.x1-2;x+=3){[[x,gr.z0-.6],[x,gr.z1+.6]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.3))prop('bollard',a,b,{solid:.15})})}
    for(let x=gr.x0+10;x<gr.x1-6;x+=ri(18,30)){if(XS.some(q=>Math.abs(q-x)<16)||GRACHT.some(q=>q!==gr&&x>q.x0-8&&x<q.x1+8))continue;prop('boat',x,rng()<.5?gr.z0+3.6:gr.z1-3.6,{rot:0,v:ri(0,4),l:ri(5,8)})}}});
// straatbomen langs de brede lanen (Tramlaan, Westerweg, Stadhouderslaan, Zuidaslaan, Lijnbaan, Boulevard)
HR.filter(h=>/Tramlaan|Lijnbaan|Parkweg/.test(h.n)).forEach(h=>{for(let x=h.a+12;x<h.b-8;x+=14){[[x,h.z-RS+.7],[x+7,h.z+RS-.7]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.8))prop('stree',a,b,{s:.8+rng()*.3,v:ri(0,2),solid:.25})})}});
VR.filter(v=>/Westerweg|Stadhouderslaan|Zuidaslaan|Torenlaan/.test(v.n)).forEach(v=>{for(let z=v.a+12;z<v.b-8;z+=14){[[v.x-RS+.7,z],[v.x+RS-.7,z+7]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.8))prop('stree',a,b,{s:.8+rng()*.3,v:ri(0,2),solid:.25})})}});
for(let i=0,n=0;i<12000&&n<200;i++){const x=20+rng()*(W-40),z=20+rng()*(H-40);if(at(x|0,z|0)===T.WALK&&free(x,z,.7)&&!nearRoadCorner(x,z)){n++;prop('bin',x,z,{solid:.3})}}
// lichtreclame op de daken van de Zuidas
buildings.filter(b=>b.soort==='kantoor'&&b.fl>=16).slice(0,10).forEach((b,i)=>prop('billboard',(b.x0+b.x1)/2,(b.z0+b.z1)/2,{y:b.fl*FL+.5,v:i}));

/* --- haven: kranen, containers, schepen --- */
// kranen staan op de rand van een pier; de giek steekt over het water (dir +1 = naar het oosten)
const KRANEN=[];
[[392,40,1],[392,95,1],[392,150,1],[478,60,-1],[478,130,-1],[592,70,1],[592,140,1],[676,60,-1],[676,120,-1],[794,60,1],[794,140,1],[876,80,-1],[876,140,-1]].forEach(([x,z,d],i)=>{prop('kraan',x,z,{dir:d,v:i%3});block(x-4,z-5,x+4,z+5);KRANEN.push({x:x+d*3,z,dir:d})});
const free2=(x,z,hw,hd,tt)=>{for(let a=Math.floor(z-hd);a<=Math.ceil(z+hd);a++)for(let b=Math.floor(x-hw);b<=Math.ceil(x+hw);b++){if(!inb(b,a)||solid[a*W+b]||g[a*W+b]!==(tt||T.DOCK))return false}return true};
// containers op het containerterrein en de douanekade (in rijen, zoals echt)
for(let x=214;x<386;x+=9)for(let z=30;z<180;z+=4.2){if(Math.abs(x-330)<16||rng()<.18)continue;if(free2(x,z,4.2,2.3))
  {prop('container',x,z,{rot:0,h:ri(1,4),v:ri(0,4)});block(Math.floor(x-3.5),Math.floor(z-1.5),Math.ceil(x+3.5),Math.ceil(z+1.5))}}
for(let x=956;x<996;x+=9)for(let z=30;z<136;z+=4.2){if(rng()<.25)continue;if(free2(x,z,4.2,2.3)){prop('container',x,z,{rot:0,h:ri(1,3),v:ri(0,4)});block(Math.floor(x-3.5),Math.floor(z-1.5),Math.ceil(x+3.5),Math.ceil(z+1.5))}}
// losse containers op het bedrijventerrein
for(let i=0,n=0;i<4000&&n<40;i++){const x=1000+rng()*290,z=22+rng()*266,rot=rng()<.5?0:1;const w=rot?3:7,d=rot?7:3;
  if(free2(x,z,w/2+.8,d/2+.8,T.YARD)){n++;prop('container',x,z,{rot,h:ri(1,2),v:ri(0,4)});block(Math.floor(x-w/2),Math.floor(z-d/2),Math.ceil(x+w/2),Math.ceil(z+d/2))}}
// schepen in de bekkens (langs de kade)
[[412,95,1,0],[626,90,1,1],[822,100,1,2]].forEach(([x,z,rot,v])=>prop('ship',x,z,{rot,v,l:120}));
prop('ship',300,8,{rot:0,v:4,l:110});
// sleepboot en bolders
prop('boat',620,160,{rot:1,v:0,l:10});prop('boat',862,165,{rot:1,v:3,l:9});
for(let z=24;z<175;z+=12){[[399,z],[471,z],[599,z],[671,z],[799,z],[871,z]].forEach(([a,b])=>{if(at(a|0,b|0)===T.DOCK&&free(a,b,.3))prop('bollard',a,b,{solid:.15})})}
// bedrijventerrein: silo's, tanks, schoorstenen
[[1050,60],[1062,60],[1050,72]].forEach(([x,z])=>{if(free(x,z,3.2)){prop('silo',x,z,{h:22,r:5});block(x-3,z-3,x+3,z+3)}});
[[1230,50,9],[1256,50,9],[1230,76,8]].forEach(([x,z,r])=>{if(free(x,z,r*.6)){prop('tank',x,z,{r,h:9});block(x-r*.6,z-r*.6,x+r*.6,z+r*.6)}});
[[1150,40],[1280,250]].forEach(([x,z])=>{if(free(x,z,2)){prop('schoorsteen',x,z,{h:38});block(x-2,z-2,x+2,z+2)}});
// autokerkhof
for(let k=0;k<12;k++){const x=1230+(k%6)*9,z=146+Math.floor(k/6)*14;prop('wreck',x+1.5,z+2,{h:1+(k%3),v:k});block(x,z,x+3,z+5)}

/* --- spoor, station, trams --- */
// trein bij het station en perronkappen
[[700,SPOOR.tracks[0],6,0],[566,SPOOR.tracks[1],4,1]].forEach(([x,z,n,v])=>{prop('trein',x,z,{n,v});block(x-n*12.5,z-1.6,x+n*12.5,z+1.6)});
propR('perron',570,228.5,750,231.5,{},false);
// spoorbomen bij de overwegen
VR.forEach(v=>{if(v.a<SPOOR.z0&&v.b>SPOOR.z1&&v.x<SPOOR.x1){prop('spoorboom',v.x-RW-1,SPOOR.z1+1.5,{side:1});prop('spoorboom',v.x+RW+1,SPOOR.z0-1.5,{side:-1})}});
// stootblok aan het eind van het spoor
prop('stootblok',SPOOR.x1-2,SPOOR.tracks[0],{});prop('stootblok',SPOOR.x1-2,SPOOR.tracks[1],{});
// tramhaltes
const TRAM=[];
HR.filter(h=>h.tram).forEach(h=>TRAM.push({dir:'h',c:h.z,a:h.a,b:h.b,lijn:h.tram}));
VR.filter(v=>v.tram).forEach(v=>TRAM.push({dir:'v',c:v.x,a:v.a,b:v.b,lijn:v.tram}));
const HALTES=[];
const vrij=(x,z,hw,hd)=>{for(let a=Math.floor(z-hd);a<=Math.ceil(z+hd);a++)for(let q=Math.floor(x-hw);q<=Math.ceil(x+hw);q++){if(!inb(q,a)||solid[a*W+q]||g[a*W+q]!==T.WALK)return false}return !nearDoor(x,z)};
const HNAAM={[X.merel]:'Merelstraat',[X.kraai]:'Kraaienstraat',[X.heren]:'Herenstraat',[X.kerk]:'Kerkstraat',[X.zuidas]:'Zuidaslaan',[X.toren]:'Torenlaan',[Z.rozen]:'Rozenstraat',[Z.park]:'Parkweg',[Z.zuider]:'Zuiderstraat'};
[X.merel,X.kraai,X.heren,X.kerk,X.zuidas,X.toren].forEach(x0=>{const z=Z.tram-RS+1.6;for(let o=24;o<60;o+=2){const x=x0+o;if(vrij(x,z,3,1.2)){prop('halte',x,z,{rot:0,lijn:7});block(x-2.4,z-.9,x+2.4,z-.7);HALTES.push({x,z:z+2.2,lijn:7,n:HNAAM[x0]});break}}});
[Z.rozen,Z.park,Z.zuider].forEach(z0=>{const x=X.vijzel+RS-2.4;for(let o=24;o<60;o+=2){const z=z0+o;if(vrij(x,z,1.2,3)){prop('halte',x,z,{rot:1,lijn:5});block(x+.7,z-2.4,x+.9,z+2.4);HALTES.push({x:x-2.2,z,lijn:5,n:HNAAM[z0]});break}}});
// fietsenstalling bij het station (veel fietsen)
for(let x=452;x<548;x+=5.5)for(const z of [244,252,268,276]){if(free(x,z,1.2))prop('bikes',x,z,{rot:0,v:ri(0,4)})}
// tramplein bij het station: abri's
[[790,262],[820,262],[850,262]].forEach(([x,z])=>{if(free(x,z,1.2))prop('halte',x,z,{rot:0,lijn:5})});

/* --- Westbuurt: school, speeltuin, veld, hoek --- */
// hek rond het schoolplein met een poort aan de Rozenstraat
const SH=[SCHOOL.x0+1,SCHOOL.z0+24,SCHOOL.x1-1,SCHOOL.z1-1];
const POORT={x0:228,x1:240};
propR('hek',SH[0],SH[3]-.3,POORT.x0,SH[3]+.3,{},true);propR('hek',POORT.x1,SH[3]-.3,SH[2],SH[3]+.3,{},true);
propR('hek',SH[0]-.3,SH[1],SH[0]+.3,SH[3],{},true);propR('hek',SH[2]-.3,SH[1]+12,SH[2]+.3,SH[3],{},true);
prop('kooi',266,354,{w:24,d:14});block(254,347,278,361);
for(let x=196;x<226;x+=3.2)prop('bikes',x,363.5,{rot:0,v:ri(0,4)});
// speeltuin
[[SPEELTUIN.x0+10,SPEELTUIN.z0+10,0],[SPEELTUIN.x0+28,SPEELTUIN.z0+12,1],[SPEELTUIN.x0+46,SPEELTUIN.z0+10,2],[SPEELTUIN.x0+20,SPEELTUIN.z0+26,3]].forEach(([x,z,v])=>{if(free(x,z,2)){prop('speel',x,z,{v});block(x-2,z-1.5,x+2,z+1.5)}});
for(let k=0;k<3;k++){const x=SPEELTUIN.x0+8+k*20,z=SPEELTUIN.z1-4;if(free(x,z,1))prop('bench',x,z,{rot:0,solid:.6})}
// voetbalveld met doelen
prop('goal',VELD.x0+1.5,(VELD.z0+VELD.z1)/2,{rot:1});prop('goal',VELD.x1-1.5,(VELD.z0+VELD.z1)/2,{rot:1,flip:1});
// bezorgfietsen voor Bella Napoli
const NAP=places.find(p=>p.id==='napoli');for(let k=0;k<3;k++)prop('scooter',NAP.x1+2.4,NAP.z0+3+k*2.2,{rot:1,v:0});
// volkstuintjes: schuurtjes
for(let x=80;x<410;x+=ri(18,26))for(const z of [240,266]){if(free(x,z,3))addB({x0:x,z0:z,x1:x+5,z1:z+4,fl:1,st:'brick2',roof:'gableX'})}

/* --- Centrum: plein, terrassen, ziekenhuis --- */
prop('statue',PLEIN.x,PLEIN.z,{solid:2.2});
[[PLEIN.x0+8,PLEIN.z0+8],[PLEIN.x1-8,PLEIN.z0+8],[PLEIN.x0+8,PLEIN.z1-8],[PLEIN.x1-8,PLEIN.z1-8]].forEach(([x,z])=>{if(free(x,z,1))prop('stree',x,z,{s:1,v:1,solid:.25})});
for(let k=0;k<6;k++){const x=PLEIN.x0+14+k*8,z=PLEIN.z0+4;if(free(x,z,1.2))prop('terras',x,z,{v:k%3})}
const ZH=places.find(p=>p.id==='ziekenhuis');prop('ambulance',ZH.x0+8,ZH.z1+6,{rot:1});prop('ambulance',ZH.x0+14,ZH.z1+6,{rot:1});
prop('heli',(ZH.x0+ZH.x1)/2,(ZH.z0+ZH.z1)/2,{y:9*FL+.6});
const POL=places.find(p=>p.id==='politie');[-12,-4,4,12].forEach(o=>prop('police',(POL.x0+POL.x1)/2+o,POL.z1+5,{rot:1}));
// terrassen langs de gracht en de boulevard
for(let x=c5a+6;x<c5b-6;x+=7){const z=GRACHT[2].z0-7.5;if(free(x,z,1.2))prop('terras',x,z,{v:ri(0,2)})}
/* --- Boulevard en strand --- */
const SAH=places.find(p=>p.id==='sahara');
[[SAH.x0+3,SAH.z1+3.4],[SAH.x1-3,SAH.z1+3.4]].forEach(([x,z])=>prop('palm',x,z,{s:1.1,solid:.4}));
[[SAH.x0+4,SAH.z0-9],[SAH.x1-4,SAH.z0-9]].forEach(([x,z],i)=>{prop('dumpster',x,z,{rot:0,v:i});block(x-1,z-.6,x+1,z+.6)});
const RAP=places.find(p=>p.id==='rapido');for(let k=0;k<2;k++)prop('scooter',RAP.x1+2,RAP.z1+2.5+k*2.2,{rot:0,v:1});
// strandtenten (decor) + de echte bij Sahara; strandwacht, volleybal
[[480,950],[560,950],[760,950],[860,952],[960,950],[1140,952]].forEach(([x,z])=>{if(free2(x,z,12,7,T.SAND)){set(x-14,z-4,x+14,z+14,T.DOCK,[T.SAND]);addB({x0:x-11,z0:z,x1:x+11,z1:z+11,fl:1,st:pick(STY.strand),roof:'flat',soort:'strand'})}});
prop('post',600,985,{});prop('post',1000,985,{});prop('volley',900,982,{rot:0});prop('volley',380,982,{rot:0});
// parkeergarage: ingang van de hellingbaan
const PG=places.find(p=>p.id==='parkeergarage');prop('slagboom',PG.x0-2.5,PG.z0+10,{rot:1});
/* --- Zuidas: fontein, bouwkraan --- */
prop('fontein',(ZPLEIN.x0+ZPLEIN.x1)/2,(ZPLEIN.z0+ZPLEIN.z1)/2,{solid:4});
prop('torenkraan',BOUW.x0+12,BOUW.z0+50,{h:58,dir:1});block(BOUW.x0+10,BOUW.z0+48,BOUW.x0+14,BOUW.z0+52);
/* --- snelweg: vangrails, geluidswal, borden, windmolens --- */
const RG=VR.find(v=>v.hw);
propR('vangrail',RG.x-RW-1.4,RG.a+10,RG.x-RW-1.1,RG.b-10,{},true);propR('vangrail',RG.x+RW+1.1,RG.a+10,RG.x+RW+1.4,RG.b-10,{},true);
// openingen in de vangrail bij de op- en afritten
[Z.tram,560,Z.blvd].forEach(z=>{block(RG.x-RW-2,z-RS-2,RG.x-RW,z+RS+2,0);block(RG.x+RW,z-RS-2,RG.x+RW+2,z+RS+2,0)});
propR('geluidswal',1288.5,Z.station+20,1290,Z.blvd-20,{},true);block(1288,Z.tram-RS-1,1291,Z.tram+RS+1,0);
prop('portaal',RG.x,520,{w:RW*2+4});prop('portaal',RG.x,620,{w:RW*2+4});prop('portaal',1336,560,{w:RW*2+4,rot:1});
prop('tunnel',DIJK.x0,560,{w:RW*2+2});
[[1340,180],[1350,330],[1345,760],[1355,880]].forEach(([x,z])=>{prop('molen',x,z,{h:44});block(x-1.5,z-1.5,x+1.5,z+1.5)});
prop('reclame',1320,420,{v:0});prop('reclame',1320,700,{v:1});
// verzorgingsplaats aan de A10 (parkeerplaats voor overdrachten)
const VZP={x0:1314,z0:572,x1:1356,z1:600};set(VZP.x0,VZP.z0,VZP.x1,VZP.z1,T.YARD);
/* --- Het Eiland --- */
(function(){const hedge=(x0,z0,x1,z1)=>{for(let x=x0;x<x1;x+=2)for(let z=z0;z<z1;z+=2)prop('hedge',x+1,z+1,{})};
  const C=COSA,gx=1252;hedge(C.x0,C.z0,C.x1,C.z0+2);hedge(C.x0,C.z0,C.x0+2,C.z1);hedge(C.x1-2,C.z0,C.x1,C.z1);hedge(C.x0,C.z1-2,C.x1,C.z1);
  block(C.x0,C.z0,gx-4,C.z0+2);block(gx+4,C.z0,C.x1,C.z0+2);block(C.x0,C.z0,C.x0+2,C.z1);block(C.x1-2,C.z0,C.x1,C.z1);block(C.x0,C.z1-2,C.x1,C.z1);
  props.splice(0,props.length,...props.filter(p=>!(p.k==='hedge'&&p.z<C.z0+2.5&&Math.abs(p.x-gx)<4)));
  prop('gate',gx,C.z0+1,{});
  // zwembad achter de villa
  set(1236,1156,1268,1166,T.WATER);})();
prop('vuurtoren',1368,1112,{});block(1364,1108,1372,1116);
// jachten en speedboten in de jachthaven
for(let x=1119;x<1250;x+=20){prop('jacht',x+(rng()<.5?-4.5:5.5),1024,{rot:1,v:ri(0,3),l:ri(10,15)})}
prop('speedboot',1104,1022,{rot:1,v:0});prop('speedboot',1256,1020,{rot:1,v:1});

/* --- geparkeerde auto's langs de stoeprand (stad-autos.js maakt er echte auto's van) --- */
for(let i=0;i<300;i++){const vert=rng()<.5;if(vert){const v=pick(VR),side=rng()<.5?-1:1;if(v.hw)continue;const z=v.a+12+rng()*(v.b-v.a-24);if(ZS.some(q=>Math.abs(q-z)<14))continue;const x=v.x+side*(RW-1.3);if(at(x|0,z|0)!==T.ROAD)continue;
    if(TRAM.some(t=>t.dir==='v'&&t.c===v.x))continue;prop('car',x,z,{rot:1,v:ri(0,6),dir:side})}
  else{const h=pick(HR),side=rng()<.5?-1:1;if(h.hw)continue;const x=h.a+12+rng()*(h.b-h.a-24);if(XS.some(q=>Math.abs(q-x)<14))continue;const z=h.z+side*(RW-1.3);if(at(x|0,z|0)!==T.ROAD)continue;
    if(TRAM.some(t=>t.dir==='h'&&t.c===h.z))continue;prop('car',x,z,{rot:0,v:ri(0,6),dir:side})}}

/* --- stegen: afvalcontainer (verstopplek), graffiti, soms een lamp --- */
const hides=[];
alleys.forEach((a,i)=>{const f=a.f,ns=f==='N'||f==='S';
  const ex=f==='N'?[a.cx,a.z1]:f==='S'?[a.cx,a.z0]:f==='W'?[a.x1,a.cz]:[a.x0,a.cz],io=f==='N'||f==='W'?1:-1,C=[];
  [2.8,3.6,-2.8,-3.6].forEach(o=>C.push(ns?[ex[0]+o,ex[1]+io*1.1]:[ex[0]+io*1.1,ex[1]+o]));
  let ok=null;for(const [x,z] of C)if(free(x,z,1.1)){ok=[x,z,0];break}
  if(!ok)return;
  const [x,z]=ok,rot=ns?0:1;prop('dumpster',x,z,{rot,v:i%3});block(Math.floor(x-.9),Math.floor(z-.9),Math.ceil(x+.9),Math.ceil(z+.9));
  hides.push({x,z,k:'dumpster'});
  const wx=ns?a.x0:a.cx,wz=ns?a.cz:a.z0;
  {const len=Math.min(5,(ns?a.z1-a.z0:a.x1-a.x0)-2),h=Math.max(2,len)/2;
    if(i%2===0&&buildings.some(b=>ns?Math.abs(b.x1-wx)<.3&&b.z0<=wz-h&&b.z1>=wz+h:Math.abs(b.z1-wz)<.3&&b.x0<=wx-h&&b.x1>=wx+h))prop('graffiti',wx,wz,{ns:ns?1:0,v:i%5,len})}});
props.filter(p=>p.k==='container').forEach(p=>hides.push({x:p.x,z:p.z,k:'container',r:p.rot?[1.5,3.5]:[3.5,1.5]}));
props.filter(p=>p.k==='hedge').forEach((p,i)=>{if(i%3===0)hides.push({x:p.x,z:p.z,k:'hedge'})});
// bankjes in de parken
for(let i=0,n=0;i<9000&&n<70;i++){const x=20+rng()*(W-40),z=20+rng()*(H-40);if(at(x|0,z|0)===T.PARK&&free(x,z,1.4)&&!onPath(x,z,1)){n++;prop('bench',x,z,{rot:ri(0,3),solid:.6})}}
// muur om de bajes (met poort)
(function(){const wall=(x0,z0,x1,z1)=>{props.push({k:'wall',x0,z0,x1,z1});block(x0,z0,x1,z1)};
  wall(40,40,180,42);wall(40,40,42,182);wall(178,40,180,182);wall(40,180,107,182);wall(113,180,180,182);
  [[41,41],[179,41],[41,181],[179,181]].forEach(([x,z])=>prop('tower',x,z,{}));prop('gate',110,181,{});block(107,180,113,182)})();

/* ---------- bruggen (voor de relingen): waar een weg over water gaat ---------- */
const bridges=[];
HR.forEach(h=>{let s=null;for(let x=h.a-RW;x<=h.b+RW;x++){const b=at(x,h.z)===T.BRIDGE;if(b&&s==null)s=x;if(!b&&s!=null){if(x-s>3)bridges.push({x0:s,x1:x,z0:h.z-RS,z1:h.z+RS});s=null}}});
VR.forEach(v=>{let s=null;for(let z=v.a-RW;z<=v.b+RW;z++){const b=at(v.x,z)===T.BRIDGE;if(b&&s==null)s=z;if(!b&&s!=null){if(z-s>3)bridges.push({x0:v.x-RS,x1:v.x+RS,z0:s,z1:z,v:1});s=null}}});

/* ---------- lopen en routes ---------- */
const walkable=(x,z)=>{x=Math.floor(x);z=Math.floor(z);return inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER};
function canStand(x,z,r){r=r||.35;return walkable(x-r,z-r)&&walkable(x+r,z-r)&&walkable(x-r,z+r)&&walkable(x+r,z+r)}
function nearestWalk(x,z,max){max=max||40;if(canStand(x,z))return{x,z};for(let r=1;r<=max;r++)for(let a=0;a<r*8;a++){const t=a/(r*8)*Math.PI*2,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;if(canStand(px,pz))return{x:px,z:pz}}return null}
// A* over het raster (8 richtingen), daarna rechte stukken waar dat kan. Snel genoeg voor een grote kaart: vaste typed-array-heap,
// een iets 'gretige' schatting (×1.4) en eerst kijken of het doel wel bereikbaar is (samenhangende gebieden, één keer uitgerekend;
// opnieuw na setSolid). Ligt het doel in een afgesloten stuk, dan loop je naar het dichtstbijzijnde bereikbare punt.
const N_=W*H,gs=new Float32Array(N_),from=new Int32Array(N_),closed=new Uint8Array(N_),stamp=new Uint32Array(N_);let STAMP=0;
let HP=new Int32Array(1<<18),HF=new Float32Array(1<<18),HN=0;
function hpush(i,f){if(HN>=HP.length){const a=new Int32Array(HP.length*2),b=new Float32Array(HP.length*2);a.set(HP);b.set(HF);HP=a;HF=b}let k=HN++;while(k>0){const p=(k-1)>>1;if(HF[p]<=f)break;HP[k]=HP[p];HF[k]=HF[p];k=p}HP[k]=i;HF[k]=f}
function hpop(){const top=HP[0],li=HP[--HN],lf=HF[HN];if(HN>0){let k=0;for(;;){const l=2*k+1,r=l+1;let m=-1,mf=lf;if(l<HN&&HF[l]<mf){m=l;mf=HF[l]}if(r<HN&&HF[r]<mf){m=r;mf=HF[r]}if(m<0)break;HP[k]=HP[m];HF[k]=HF[m];k=m}HP[k]=li;HF[k]=lf}return top}
const okc=i=>!solid[i]&&g[i]!==T.WATER;
let COMP=null,COMP0=null;
function comps(){if(COMP)return COMP;COMP=COMP0||(COMP0=new Int32Array(N_));COMP.fill(0);const q=from;let id=0;   // 'from' is hier kladpapier (A* zet het zelf weer goed)
  for(let s0=0;s0<N_;s0++){if(COMP[s0]||!okc(s0))continue;id++;let qh=0,qt=0;q[qt++]=s0;COMP[s0]=id;
    while(qh<qt){const i=q[qh++],x=i%W;if(x>0&&!COMP[i-1]&&okc(i-1)){COMP[i-1]=id;q[qt++]=i-1}if(x<W-1&&!COMP[i+1]&&okc(i+1)){COMP[i+1]=id;q[qt++]=i+1}
      if(i>=W&&!COMP[i-W]&&okc(i-W)){COMP[i-W]=id;q[qt++]=i-W}if(i<N_-W&&!COMP[i+W]&&okc(i+W)){COMP[i+W]=id;q[qt++]=i+W}}}
  return COMP}
// dichtstbijzijnde punt in gebied c rond (x,z)
function nearestIn(c,x,z,max){const C=comps();for(let r=0;r<=max;r++)for(let a=0;a<Math.max(1,r*8);a++){const t=a/Math.max(1,r*8)*Math.PI*2,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r,ix=Math.floor(px),iz=Math.floor(pz);
  if(inb(ix,iz)&&C[iz*W+ix]===c&&canStand(px,pz))return{x:px,z:pz}}return null}
function findPath(ax,az,bx_,bz_){
  const s=nearestWalk(ax,az,6);let e=nearestWalk(bx_,bz_,30);if(!s||!e)return null;
  const C=comps(),cs=C[Math.floor(s.z)*W+Math.floor(s.x)];if(C[Math.floor(e.z)*W+Math.floor(e.x)]!==cs){e=nearestIn(cs,e.x,e.z,120);if(!e)return null}
  const sx=Math.floor(s.x),sz=Math.floor(s.z),ex=Math.floor(e.x),ez=Math.floor(e.z);
  STAMP++;if(STAMP>4e9){stamp.fill(0);STAMP=1}
  const touch=i=>{if(stamp[i]!==STAMP){stamp[i]=STAMP;gs[i]=1e9;from[i]=-1;closed[i]=0}};
  const ok=(x,z)=>inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER;
  const h=(x,z)=>{const dx=Math.abs(x-ex),dz=Math.abs(z-ez);return dx>dz?dx+.414*dz:dz+.414*dx};
  const si=sz*W+sx,ei=ez*W+ex;touch(si);touch(ei);gs[si]=0;HN=0;hpush(si,h(sx,sz));let n=0;
  const DX=[1,-1,0,0,1,1,-1,-1],DZ=[0,0,1,-1,1,-1,1,-1],DC=[1,1,1,1,1.414,1.414,1.414,1.414];
  while(HN&&n++<900000){const i=hpop();if(i===ei)break;touch(i);if(closed[i])continue;closed[i]=1;const x=i%W,z=(i/W)|0;
    for(let d=0;d<8;d++){const dx=DX[d],dz=DZ[d],nx=x+dx,nz=z+dz;if(!ok(nx,nz))continue;if(dx&&dz&&(!ok(x+dx,z)||!ok(x,z+dz)))continue;
      const ni=nz*W+nx;touch(ni);const ng=gs[i]+DC[d]*(g[ni]===T.ROAD?1.6:1);if(ng<gs[ni]){gs[ni]=ng;from[ni]=i;hpush(ni,ng+h(nx,nz)*1.4)}}}
  if(from[ei]<0&&ei!==si)return null;
  const raw=[];for(let i=ei;i!==-1&&i!==si;i=from[i])raw.push([i%W+.5,((i/W)|0)+.5]);raw.reverse();
  const clear=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.ceil(L*3);for(let k=0;k<=n;k++){const x=a[0]+dx*k/n,z=a[1]+dz*k/n;if(!canStand(x,z,.3))return false}return true};
  const out=[];let cur=[s.x,s.z];for(let k=0;k<raw.length;){let j=Math.min(raw.length-1,k+60);while(j>k&&!clear(cur,raw[j]))j--;out.push(raw[j]);cur=raw[j];k=j+1}
  if(out.length)out[out.length-1]=[e.x,e.z];
  return out.map(([x,z])=>({x,z}));
}

/* ---------- wijken ---------- */
// Namen sluiten aan bij de Pixelstad (agenten, auto's en voetgangers kijken naar de naam), met een paar nieuwe.
const inGracht=(x,z)=>GRACHT.some(r=>x>r.x0-26&&x<r.x1+26&&z>r.z0-26&&z<r.z1+26);
function districtAt(x,z){
  if(x>=1000&&z>=1000)return 'Het Eiland';
  if(z>=938)return 'Het Strand';
  if(x>=1290)return 'Ringweg';
  if(z<190){if(x<200)return 'De Bajes';if(x<1000)return x>=670&&x<870?'Noordkade':'De Haven';return 'Bedrijventerrein'}
  if(z<300){if(x>=1000)return 'Bedrijventerrein';if(x<430)return 'Westbuurt';if(x<880)return 'Centrum';return 'Zuidas'}
  if(x<48)return 'Westkust';
  if(x<430)return z<740?'Westbuurt':'Villawijk';
  if(z>=830)return 'Boulevard';
  if(x<880){if(z>=650)return 'Oud-Zuid';if(x>=PLEIN.x0-6&&x<PLEIN.x1+6&&z>=PLEIN.z0-6&&z<PLEIN.z1+6)return 'Het Plein';if(inGracht(x,z))return 'De Gracht';return 'Centrum'}
  return 'Zuidas'}
const DISTRICTS=[{n:'Westbuurt',x:240,z:420},{n:'Villawijk',x:240,z:830},{n:'Westkust',x:34,z:600},{n:'De Bajes',x:110,z:120},{n:'De Haven',x:430,z:110},{n:'Noordkade',x:735,z:100},
 {n:'Bedrijventerrein',x:1150,z:150},{n:'Centrum',x:660,z:330},{n:'De Gracht',x:655,z:515},{n:'Het Plein',x:655,z:425},{n:'Oud-Zuid',x:655,z:740},{n:'Zuidas',x:1080,z:520},
 {n:'Boulevard',x:780,z:875},{n:'Het Strand',x:560,z:975},{n:'Ringweg',x:1350,z:470},{n:'Het Eiland',x:1200,z:1130}];

/* ---------- straatnamen en adressen ---------- */
function straatAt(x,z){let best=null,bd=1e9;
  VR.forEach(v=>{if(z<v.a-RS||z>v.b+RS)return;const d=Math.abs(x-v.x);if(d<bd){bd=d;best={r:v,d,pos:z-v.a,side:x<v.x?0:1}}});
  HR.forEach(h=>{if(x<h.a-RS||x>h.b+RS)return;const d=Math.abs(z-h.z);if(d<bd){bd=d;best={r:h,d,pos:x-h.a,side:z<h.z?0:1}}});
  return best&&bd<60?best:null}
function adres(x,z){const s=straatAt(x,z);if(!s)return districtAt(x,z);const nr=Math.max(1,Math.floor(Math.max(0,s.pos)/7))*2+(s.side?0:1);return s.r.n+' '+nr}
// voordeuren om aan te bellen (bezorgen): per pand met een voorkant
const ADRESSEN=[];
buildings.forEach(b=>{if(!b.front||b.pl||!b.soort)return;const f=b.front,mx=(b.x0+b.x1)/2,mz=(b.z0+b.z1)/2,d=doorOf(f,b,mx,mz);
  const q=nearestWalk(d.x,d.z,3);if(!q)return;ADRESSEN.push({x:+q.x.toFixed(1),z:+q.z.toFixed(1),adres:adres(d.x,d.z),soort:b.soort,wijk:districtAt(d.x,d.z),b:b.i,face:f})});

/* ---------- waar je begint ---------- */
const THUIS=places.find(p=>p.id==='thuis');
const spawn={x:THUIS.door.x+4,z:THUIS.door.z-3};

/* ---------- vaste punten (M.A) ---------- */
// Altijd een loopbaar punt (vlak voor de deur of op de stoep). Liever deze namen gebruiken dan losse getallen.
const P=id=>places.find(p=>p.id===id).door;
const W_=(x,z)=>{const q=nearestWalk(x,z,25);return q?{x:+q.x.toFixed(1),z:+q.z.toFixed(1)}:{x,z}};
const SCH=places.find(p=>p.id==='school');
const A={
  // verhaal (hoofdstuk 1 en verder)
  school:P('school'),schoolhek:W_((POORT.x0+POORT.x1)/2,SCHOOL.z1+3),schoolplein:W_(200,350),fietsenrek:W_(210,361),klas:P('school'),
  thuis:P('thuis'),flatdak:{x:(THUIS.x0+THUIS.x1)/2,z:(THUIS.z0+THUIS.z1)/2,y:10*FL},ans:W_(THUIS.x1-8,THUIS.z0-1.5),
  napoli:P('napoli'),napoli_achter:W_(NAP.x0-6,(NAP.z0+NAP.z1)/2),napoli_fietsen:W_(NAP.x1+2.4,NAP.z0+8),
  sahara:P('sahara'),sahara_achter:W_((SAH.x0+SAH.x1)/2,SAH.z0-6),rapido:P('rapido'),rijtjeshuis:P('rijtjeshuis'),
  strandtenten:P('strandtent'),strandtent:P('strandtent'),strand:W_(700,975),strand_nacht:W_(900,960),promenade:W_(700,932),
  parkeergarage:P('parkeergarage'),garagedak:{x:(PG.x0+PG.x1)/2,z:(PG.z0+PG.z1)/2,y:5*FL},
  haven:W_(735,120),noordkade:W_(735,150),kade:W_(760,182),kranen:W_(700,90),kraan_teun:W_(KRANEN[8].x,KRANEN[8].z+7),loodsen:W_(535,110),havenloods:P('havenloods'),
  containers:W_(330,100),douane:P('douane'),speedboot:W_(640,184),
  bedrijventerrein:W_(1130,200),loods:P('loods'),garage:P('garage'),sloop:P('sloop'),
  zakendistrict:W_((ZPLEIN.x0+ZPLEIN.x1)/2,ZPLEIN.z0+4),zuidas:W_((ZPLEIN.x0+ZPLEIN.x1)/2,ZPLEIN.z0+4),kantoor:P('kantoor'),advocaat:P('advocaat'),bouw:W_((BOUW.x0+BOUW.x1)/2,BOUW.z1+3),
  hotel:P('hotel'),villa_cosa:P('villa_cosa'),villa:P('villa_cosa'),villa_poort:W_(1252,COSA.z0-3),jachthaven:P('jachthaven'),eiland:W_(1100,1075),
  brug:W_(X.brug,1020),brug_noord:W_(X.brug,996),brug_zuid:W_(X.brug,1050),
  snelweg_uit:{x:DIJK.x0-8,z:560},snelweg:{x:X.ring,z:400},ringweg:{x:X.ring,z:700},snelweg_parkeer:W_((VZP.x0+VZP.x1)/2,(VZP.z0+VZP.z1)/2),
  ziekenhuis:P('ziekenhuis'),politiebureau:P('politie'),politie:P('politie'),buurthuis:P('buurthuis'),sportschool:P('sportschool'),gym:P('sportschool'),
  park:W_((WPARK.x0+WPARK.x1)/2,WPARK.z0+30),westerpark:W_((WPARK.x0+WPARK.x1)/2,WPARK.z0+30),vijver:W_((VIJVER.x0+VIJVER.x1)/2,VIJVER.z0-3),
  speeltuin:W_((SPEELTUIN.x0+SPEELTUIN.x1)/2,SPEELTUIN.z0+3),portiek:W_(c1a+20,r1a-2),hoek:W_(c1b+3,r1b+3),voetbalveld:W_((VELD.x0+VELD.x1)/2,VELD.z1+2),
  dex:W_(c2a+20,r2a-2),stashflat:W_(c0a+20,r4a-2),steeg_hond:null,
  station:P('station'),bank:P('bank'),plein:{x:PLEIN.x,z:PLEIN.z-10},pleinMid:{x:PLEIN.x,z:PLEIN.z+6},gracht:W_(565,420),grachten:W_(745,420),
  bajes:P('bajes'),tramhalte:HALTES[0]?{x:HALTES[0].x,z:HALTES[0].z}:null,
  // de stad uit, het verhaal hervatten
  start:P('sahara'),
  // compat met stad-map.js (andere modules van de engine)
  cafe:P('sahara'),casino:P('hotel'),casinoPlein:W_(PLEIN.x,PLEIN.z1-4),bankPlein:W_((c5a+c5b)/2,r1b-4),notaris:P('advocaat'),wasserette:P('rapido'),contact:P('sahara'),
  wapens:P('garage'),kleding:P('hotel'),spa:P('hotel'),
  apotheek:W_(c5a+30,Z.lijn-RS-2),juwelier:W_(c9a+12,Z.lijn+RS+2),drogist:W_(c3a+20,Z.tram-RS-2),avond:W_(c0a+30,Z.rozen+RS+2),elektro:W_(c9a+30,Z.rozen+RS+2),
  stoep:W_(c2a+20,Z.rozen-RS-2),fietsrek:W_(549,262),parkeer:W_(c10a+20,Z.rozen+RS+2),box:W_(1030,Z.haven-RS-2),geldauto:W_((c5a+c5b)/2,Z.rozen-RS-1),
  pier:W_(735,40),hangar:W_(935,60),villapark:W_(240,Z.baerle+RS+2),oostland:W_(1100,Z.tram+RS+2),jacht:W_(1180,1044),
  boulevard:W_(780,Z.blvd-RS-2),oosterstraat:W_(1120,Z.blvd-RS-2),tuinwijk:W_(655,Z.park+RS+2),westkust:W_(30,600),
  bedrijven:W_(1130,Z.ind+RS+2),vechter:W_(c2a+30,Z.lijn-RS-2),wijkagent:W_(PLEIN.x+10,PLEIN.z1-4),wijkbaas:W_(c1b+3,r1b+3)};
// de steeg met de hond: een steeg in de Westbuurt tussen school en Napoli
{const al=alleys.filter(a=>districtAt(a.cx,a.cz)==='Westbuurt'&&a.cx>250&&a.cz>380&&a.cz<560).sort((a,b)=>Math.hypot(a.cx-330,a.cz-430)-Math.hypot(b.cx-330,b.cz-430))[0];
  A.steeg_hond=al?W_(al.cx,al.cz):W_(340,430)}
Object.keys(A).forEach(k=>{if(!A[k])delete A[k]});
// gebieden (x0,z0,x1,z1) voor sluipklussen en missies
const Zn={villapark:[c0a,r5a,c3b,r6b],park:[WPARK.x0,WPARK.z0,WPARK.x1,WPARK.z1],yard:[214,30,390,182],strand:[24,940,1236,996],
  hangar:[882,30,996,140],bajes:[42,42,178,180],eiland:[1030,1040,1385,1188],bouw:[BOUW.x0,BOUW.z0,BOUW.x1,BOUW.z1],plein:[PLEIN.x0,PLEIN.z0,PLEIN.x1,PLEIN.z1],
  haven:[200,20,1000,188],bedrijventerrein:[1000,20,1290,290],zuidas:[892,312,1288,818],westbuurt:[72,312,418,728],oudzuid:[442,662,868,818],centrum:[442,312,868,638],
  boulevard:[442,842,1288,938],villawijk:[72,752,418,908],speeltuin:[SPEELTUIN.x0,SPEELTUIN.z0,SPEELTUIN.x1,SPEELTUIN.z1],schoolplein:[SH[0],SH[1],SH[2],SH[3]],
  parkeergarage:[PG.x0,PG.z0,PG.x1,PG.z1],cosa:[COSA.x0,COSA.z0,COSA.x1,COSA.z1],jachthaven:[1100,1004,1260,1048],snelweg:[1286,110,1314,932],verzorgingsplaats:[VZP.x0,VZP.z0,VZP.x1,VZP.z1]};

/* ---------- plekken voor de verhaalkaart ---------- */
// cat: thuis | werk | school | plek | gevaar. ch = vanaf welk hoofdstuk zichtbaar (de kaart toont alleen bekende plekken, zie stad-kaart.js)
const PLEKKEN=[
 {id:'thuis',n:'Thuis',sub:'Flat De Santis',ic:'home',c:'#5fd35a',cat:'thuis',ch:1},
 {id:'school',n:'Westbuurt College',sub:'School',ic:'lijst',c:'#7fb2ff',cat:'school',ch:1},
 {id:'napoli',n:'Bella Napoli',sub:'Werk · pizzeria van Giovanni',ic:'kop',c:'#ff8a3a',cat:'werk',ch:1},
 {id:'sahara',n:'Lounge Sahara',sub:'Rafiq · Boulevard',ic:'music',c:'#c58cff',cat:'plek',ch:1},
 {id:'rapido',n:'Pizza Rapido',sub:'De concurrent',ic:'kop',c:'#e8584a',cat:'plek',ch:1},
 {id:'buurthuis',n:'Buurthuis De Kastanje',sub:'Westbuurt',ic:'mensen',c:'#e8e4da',cat:'plek',ch:1},
 {id:'sportschool',n:'De Bokszak',sub:'Boksschool',ic:'vuist',c:'#e8e4da',cat:'plek',ch:1},
 {id:'ziekenhuis',n:'Ziekenhuis',sub:'Hier werkt Elena',ic:'hart',c:'#ff6f8a',cat:'plek',ch:1},
 {id:'politie',n:'Politiebureau',sub:'Centrum',ic:'badge',c:'#4d7dff',cat:'gevaar',ch:1},
 {id:'station',n:'Centraal Station',sub:'Treinen en trams',ic:'route',c:'#ffd35a',cat:'plek',ch:1},
 {id:'strandtent',n:'Strandtenten',sub:'Het strand',ic:'kop',c:'#f0dca0',cat:'plek',ch:1},
 {id:'parkeergarage',n:'Parkeergarage',sub:'Boulevard',ic:'auto',c:'#9fb0c4',cat:'plek',ch:2},
 {id:'havenloods',n:'De Haven',sub:'Havenloods 7 · Noordkade',ic:'helm',c:'#4da3ff',cat:'plek',ch:6},
 {id:'kantoor',n:'Zuidas',sub:'Kantoren',ic:'akte',c:'#3fe395',cat:'plek',ch:1},
 {id:'hotel',n:'Grand Hotel Pixel',sub:'Boulevard',ic:'kroon',c:'#d6b25a',cat:'plek',ch:5},
 {id:'villa_cosa',n:'Villa Cosa Nostra',sub:'Het Eiland',ic:'hoed',c:'#ff6f9f',cat:'gevaar',ch:9},
 {id:'jachthaven',n:'Jachthaven',sub:'Het Eiland',ic:'vis',c:'#35d0e0',cat:'plek',ch:6}];
PLEKKEN.forEach(p=>{const d=places.find(q=>q.id===p.id);if(d){p.x=d.door.x;p.z=d.door.z}});
// kleuren van de borden (tekst, achtergrond, rand) en op de kaart
const SIGNC={school:['#1d1d1f','#f2c230','#1d1d1f'],thuis:['#ffffff','#3a4a5a','#ffffff'],napoli:['#ffffff','#1f7a3a','#c0392b'],sahara:['#ffcf5a','#1a0f24','#b48cff'],
  rapido:['#ffffff','#c0261e','#ffd35a'],strandtent:['#1f4a5a','#f1e4c8','#ffffff'],parkeergarage:['#ffffff','#1f4ea8','#ffffff'],ziekenhuis:['#ffffff','#c0261e','#ffffff'],
  buurthuis:['#3a2418','#f1e4c8','#7a5a3a'],sportschool:['#ffffff','#e8a03a','#38486a'],station:['#1f2a6a','#f2c230','#1f2a6a'],havenloods:['#ffffff','#2e5f9a','#ffffff'],
  douane:['#ffffff','#1f4ea8','#ffffff'],garage:['#1d1d1f','#f0b23a','#1d1d1f'],sloop:['#1d1d1f','#f0b23a','#1d1d1f'],loods:['#ffffff','#5a5d63','#ffffff'],
  hotel:['#d6b25a','#1d1d1f','#d6b25a'],kantoor:['#ffffff','#1f3a4a','#9fb6c6'],advocaat:['#d6b25a','#1d1d1f','#d6b25a'],villa_cosa:['#d6b25a','#1a1418','#d6b25a'],
  jachthaven:['#1f4a5a','#bfe8e0','#ffffff'],bajes:['#e8e4da','#2c2e32','#7b7d80'],rijtjeshuis:['#1d1d1f','#e8e4da','#1d1d1f']};
const MAPPL={school:'#f2c230',thuis:'#5fd35a',napoli:'#ff8a3a',sahara:'#b48cff',rapido:'#ff4d5e',ziekenhuis:'#ff6f8a',politie:'#4d7dff',bajes:'#ff4d5e',station:'#ffd35a',
  hotel:'#d6b25a',villa_cosa:'#ff6f9f',parkeergarage:'#9fb0c4',havenloods:'#4da3ff',garage:'#4da3ff',sloop:'#4da3ff',kantoor:'#3fe395',advocaat:'#3fe395',bank:'#3fe395'};
// losse borden met tekst
const SIGNS=[{t:'CENTRAAL STATION',x:660,z:229.8,y:15.5,ry:Math.PI,fg:'#1f2a6a',bg:'#f2c230',s:2.2},{t:'CENTRAAL STATION',x:660,z:280.2,y:15.5,ry:0,fg:'#1f2a6a',bg:'#f2c230',s:2.2},
 {t:'A10 · DE STAD UIT →',x:X.ring,z:520,y:6.6,ry:0,s:1.3,two:1},{t:'↑ A10 RING ZUID',x:X.ring,z:620,y:6.6,ry:Math.PI,s:1.3,two:1},{t:'→ A10 · UTRECHT · ANTWERPEN',x:1336,z:560,y:6.6,ry:-Math.PI/2,s:1.3,two:1},
 {t:'PIXELSTAD',x:1318,z:140,y:2.2,ry:-Math.PI/2,fg:'#1d1d1f',bg:'#ffffff',bd:'#c0261e',s:1.6,two:1},{t:'HET EILAND',x:X.brug+RS+1,z:1062,y:2.4,ry:Math.PI,fg:'#1d1d1f',bg:'#ffffff',s:1.2,two:1},
 {t:'WESTBUURT COLLEGE',x:233,z:SCHOOL.z1-.4,y:3.4,ry:0,fg:'#1d1d1f',bg:'#f2c230',s:1.1}];

/* ---------- tram ---------- */
const GAUGE=.72,TRACK=1.7;
function tramAt(x,z){for(const t of TRAM){const along=t.dir==='h'?x:z,across=t.dir==='h'?z:x;if(along<t.a||along>t.b)continue;const o=Math.abs(across-t.c);if(Math.abs(o-TRACK)<GAUGE+.18)return true}return false}

/* ---------- tekenhaakjes voor stad-gfx.js: eigen gevels, eigen spullen, eigen grondtekeningen ---------- */
const STY_EXTRA={
 flat1:{w:'#c9bfa8',m:'#a99f88',f:'#e8e2d4',g:'#2b3946',gnd:'door',roof:'#6a6c70',pat:'gal'},
 flat2:{w:'#9c5a3e',m:'#7e4630',f:'#e9e1cf',g:'#26323f',gnd:'door',roof:'#5d5850',pat:'gal'},
 flat3:{w:'#8a9aa6',m:'#6f7f8b',f:'#eef0f2',g:'#24323f',gnd:'lobby',roof:'#6a6c70',pat:'gal'},
 portiek1:{w:'#7a3a2a',m:'#5e2b1f',f:'#e6dccb',g:'#22303c',gnd:'door',roof:'#4a3a32',pat:'brick'},
 portiek2:{w:'#5c4a3e',m:'#46382e',f:'#d9cdb6',g:'#22303c',gnd:'shop',aw:'#2f6d3e',roof:'#4a3a32',pat:'brick'},
 school:{w:'#d6b24a',m:'#b8953a',f:'#f1ece0',g:'#2b4a6a',gnd:'lobby',roof:'#5d5850',pat:'brick'},
 school2:{w:'#3f7a4a',m:'#2f5d3a',f:'#e8e4da',g:'#24323f',gnd:'roll',roof:'#4a5260',pat:'panel'},
 napoli:{w:'#efe6d2',m:'#d8cdb4',f:'#1f7a3a',g:'#3a2a1a',gnd:'pub',aw:'#c0392b',roof:'#7a2f22',pat:'plain'},
 rapido:{w:'#e8e4da',m:'#cfc9bb',f:'#c0261e',g:'#2a3440',gnd:'shopbig',aw:'#c0261e',roof:'#6a6c70',pat:'panel'},
 sahara:{w:'#1a1220',m:'#110b16',f:'#d6a63e',g:'#2a1238',gnd:'casino',roof:'#22182a',pat:'casino',n1:'#b46cff',n2:'#7a3cff',n3:'#ffcf5a'},
 hospital:{w:'#eef0f2',m:'#d4d8dc',f:'#c0261e',g:'#2a4a6a',gnd:'lobby',roof:'#8a9098',pat:'panel'},
 station:{w:'#8a3b2a',m:'#6a2a1e',f:'#d6b25a',g:'#26323f',gnd:'columns',roof:'#3c4148',pat:'stone'},
 parking:{w:'#a6a8ac',m:'#8c8e92',f:'#55585e',g:'#1c1f24',gnd:'roll',roof:'#6a6c70',pat:'deck'},
 hotel:{w:'#efe9da',m:'#d6ccb4',f:'#b8953a',g:'#26323f',gnd:'villa',roof:'#5d5850',pat:'stone'},
 hotelb:{w:'#f1e4c8',m:'#d9c9a8',f:'#ffffff',g:'#2a5a7a',gnd:'kiosk',aw:'#2a8ad6',roof:'#a8a090',pat:'plain'},
 office1:{w:'#1d2a38',m:'#141e28',f:'#6a7a88',g:'#2a4e6a',gnd:'lobby',roof:'#4a525a',pat:'curtain'},
 office2:{w:'#5a4a32',m:'#46392a',f:'#c9a24a',g:'#4a3a22',gnd:'lobby',roof:'#4a4038',pat:'curtain'},
 office3:{w:'#cfd6dc',m:'#b4bcc4',f:'#eef2f6',g:'#5a8aaa',gnd:'lobby',roof:'#7a8088',pat:'curtain'},
 row1:{w:'#7e3424',m:'#62281c',f:'#efe6d2',g:'#22303c',gnd:'door',roof:'#5a2620',pat:'brick'},
 row2:{w:'#5e3a2e',m:'#482c22',f:'#e6dccb',g:'#22303c',gnd:'door',roof:'#3c4148',pat:'brick'},
 gracht1:{w:'#2f3a46',m:'#232c36',f:'#efe6d2',g:'#1c2630',gnd:'door',roof:'#3c4148',pat:'brick'},
 villa2:{w:'#e6e2d8',m:'#cfc9bb',f:'#3a3d42',g:'#1f2a33',gnd:'villa',roof:'#2a2c30',pat:'plain'},
 hall1:{w:'#4f6a5a',m:'#3d5446',f:'#2a3430',g:'#2a3440',gnd:'roll',roof:'#4a524c',pat:'corr'},
 dijk:{w:'#4f8a3a',m:'#3f7a34',f:'#5d9a44',g:'#3f7a34',gnd:'roll',roof:'#4f8a3a',pat:'plain'}};
// spullen die stad-gfx.js niet kent (geeft true terug als het getekend is)
function gfxProp(gb,p,pi,X){const sw=X.swatch,h=X.hash;switch(p.k){
 case 'kraan':{const d=p.dir||1,c=sw(['#d8a52a','#c0392b','#2e5f9a'][p.v%3]),dk=sw('#2a2d32'),H0=24;
   [[-3,-4],[3,-4],[-3,4],[3,4]].forEach(([a,b])=>gb.cbox(p.x+a,p.z+b,.8,.8,0,H0,c));
   gb.box(p.x-3.4,H0-1.5,p.z-4.4,p.x+3.4,H0,p.z+4.4,c);gb.box(p.x-3.4,6,p.z-4.2,p.x+3.4,6.8,p.z-3.6,c);gb.box(p.x-3.4,6,p.z+3.6,p.x+3.4,6.8,p.z+4.2,c);
   const x0=d>0?p.x-12:p.x-36,x1=d>0?p.x+36:p.x+12;gb.box(x0,H0,p.z-1,x1,H0+1.4,p.z+1,c);
   gb.box(p.x-d*12-1.5,H0-3,p.z-1.8,p.x-d*12+1.5,H0,p.z+1.8,dk);gb.box(p.x+d*4-1.4,H0-3.2,p.z-1.3,p.x+d*4+1.4,H0-1,p.z+1.3,sw('#e8e4da','#ffe9a8'));
   gb.cbox(p.x,p.z,1,1,H0+1.4,H0+8,c);gb.box(Math.min(p.x,p.x+d*30),H0+1.3,p.z-.15,Math.max(p.x,p.x+d*30),H0+1.6,p.z+.15,dk);
   gb.cbox(p.x+d*24,p.z,.12,.12,10,H0,dk);gb.cbox(p.x+d*24,p.z,2.6,6.4,9,10,sw('#3a3d42'));return true}
 case 'ship':{const L=p.l||100,w=18,rot=p.rot,hull=sw(['#7a2a24','#2a3a5a','#2a4a3a','#3a3d42','#5a2a4a'][p.v%5]),dk=sw('#6a6c70'),wh=sw('#e8e4da','#ffe9a8');
   const B=(along0,along1,acr0,acr1,y0,y1,t,o)=>rot?gb.box(p.x+acr0,y0,p.z+along0,p.x+acr1,y1,p.z+along1,t,o):gb.box(p.x+along0,y0,p.z+acr0,p.x+along1,y1,p.z+acr1,t,o);
   B(-L/2,L/2,-w/2,w/2,-1.2,3,hull,{top:dk});B(L/2,L/2+4,-w/2+3,w/2-3,-1.2,3,hull);B(L/2-L*.12,L/2,-w/2+1,w/2-1,3,13,wh,{top:sw('#9a9ca0')});B(L/2-L*.1,L/2-L*.02,-1,1,13,18,sw('#2a2d32'));
   for(let k=-L/2+4;k<L/2-L*.14;k+=7.5)for(let q=-w/2+1.5;q<w/2-2;q+=3.2){const hh=1+((h(k|0,q|0,7)*3)|0),t=X.CONT[(h(k|0,q|0,8)*5)|0];B(k,k+7,q,q+3,3,3+hh*2.5,t,{top:t})}return true}
 case 'silo':{const c=sw('#c9c4b8'),r=p.r||5;gb.cbox(p.x,p.z,r,r*.6,0,p.h,c);gb.cbox(p.x,p.z,r*.6,r,0,p.h,c);gb.cbox(p.x,p.z,r*.85,r*.85,0,p.h,c);gb.cbox(p.x,p.z,r*.5,r*.5,p.h,p.h+2,sw('#8a8c90'));return true}
 case 'tank':{const c=sw('#e8e4da'),r=p.r||8;gb.cbox(p.x,p.z,r,r*.6,0,p.h,c);gb.cbox(p.x,p.z,r*.6,r,0,p.h,c);gb.cbox(p.x,p.z,r*.86,r*.86,0,p.h,c,0,{top:sw('#9a9ca0')});gb.cbox(p.x,p.z,r*.9,r*.9,p.h*.45,p.h*.5,sw('#c0392b'));return true}
 case 'schoorsteen':{const H0=p.h||36;for(let k=0;k<6;k++)gb.cbox(p.x,p.z,3-k*.2,3-k*.2,k*H0/6,(k+1)*H0/6,sw(k%2?'#e8e4da':'#c0392b'));gb.cbox(p.x,p.z,2,2,H0,H0+.4,sw('#2a2c30','#ff6a3a'));return true}
 case 'hek':{const c=sw('#3a5a3a'),y=2.2;const lx=p.x1-p.x0>p.z1-p.z0;if(lx){gb.box(p.x0,y-.1,p.z0,p.x1,y,p.z1,c);gb.box(p.x0,.9,p.z0,p.x1,1,p.z1,c);for(let x=p.x0;x<=p.x1;x+=.6)gb.box(x,0,p.z0+.1,x+.07,y,p.z1-.1,c)}
   else{gb.box(p.x0,y-.1,p.z0,p.x1,y,p.z1,c);gb.box(p.x0,.9,p.z0,p.x1,1,p.z1,c);for(let z=p.z0;z<=p.z1;z+=.6)gb.box(p.x0+.1,0,z,p.x1-.1,y,z+.07,c)}return true}
 case 'vangrail':{const c=sw('#b8bcc2'),lx=p.x1-p.x0>p.z1-p.z0;gb.box(p.x0,.5,p.z0,p.x1,.85,p.z1,c);if(lx){for(let x=p.x0;x<p.x1;x+=4)gb.box(x,0,p.z0,x+.15,.85,p.z1,sw('#6a6c70'))}else{for(let z=p.z0;z<p.z1;z+=4)gb.box(p.x0,0,z,p.x1,.85,z+.15,sw('#6a6c70'))}return true}
 case 'geluidswal':{const c=sw('#5a7a5a',null,10);gb.box(p.x0,0,p.z0,p.x1,4.5,p.z1,c,{top:sw('#3a4a3a')});return true}
 case 'portaal':{const w=p.w||18,c=sw('#9a9ca0');if(!p.rot){gb.cbox(p.x-w/2,p.z,.5,.5,0,7.5,c);gb.cbox(p.x+w/2,p.z,.5,.5,0,7.5,c);gb.box(p.x-w/2,7,p.z-.3,p.x+w/2,7.6,p.z+.3,c)}
   else{gb.cbox(p.x,p.z-w/2,.5,.5,0,7.5,c);gb.cbox(p.x,p.z+w/2,.5,.5,0,7.5,c);gb.box(p.x-.3,7,p.z-w/2,p.x+.3,7.6,p.z+w/2,c)}return true}
 case 'tunnel':{const w=p.w||16,c=sw('#9a9ca0'),dk=sw('#0e0f12');gb.box(p.x-.6,0,p.z-w/2-2,p.x,9,p.z-w/2,c);gb.box(p.x-.6,0,p.z+w/2,p.x,9,p.z+w/2+2,c);gb.box(p.x-.6,7,p.z-w/2,p.x,9,p.z+w/2,c);gb.box(p.x-.05,0,p.z-w/2,p.x+.05,7,p.z+w/2,dk);
   for(let z=p.z-w/2+1;z<p.z+w/2;z+=2.5)gb.box(p.x-.1,6.4,z,p.x,6.6,z+1,sw('#fff3c8','#ffe9a8'));return true}
 case 'halte':{const rot=p.rot,gl=sw('#2a3f52','#1a2a38'),fr=sw('#3a3d42'),rf=sw('#e8e4da');const B=(a0,a1,c0,c1,y0,y1,t)=>rot?gb.box(p.x+c0,y0,p.z+a0,p.x+c1,y1,p.z+a1,t):gb.box(p.x+a0,y0,p.z+c0,p.x+a1,y1,p.z+c1,t);
   B(-2.4,2.4,-.9,.9,2.5,2.7,rf);B(-2.4,2.4,-.9,-.8,.2,2.5,gl);B(-2.4,-2.3,-.9,.9,.2,2.5,gl);B(2.3,2.4,-.9,.9,.2,2.5,gl);B(-1.8,1.8,-.6,-.2,.45,.6,sw('#6a4a2c'));
   B(2.8,3,-.1,.1,0,3.2,fr);B(2.6,3.2,-.12,.12,3,3.6,sw('#f2c230'));return true}
 case 'speel':{const v=p.v%4;if(v===0){const c=sw('#c0392b');gb.box(p.x-2,0,p.z-1.5,p.x-1.8,2.6,p.z-1.3,c);gb.box(p.x+1.8,0,p.z-1.5,p.x+2,2.6,p.z-1.3,c);gb.box(p.x-2,0,p.z+1.3,p.x-1.8,2.6,p.z+1.5,c);gb.box(p.x+1.8,0,p.z+1.3,p.x+2,2.6,p.z+1.5,c);gb.box(p.x-2,2.5,p.z-1.5,p.x+2,2.7,p.z+1.5,c);gb.box(p.x-1,.5,p.z-.3,p.x-.3,.6,p.z+.3,sw('#2a2c30'));gb.box(p.x+.3,.5,p.z-.3,p.x+1,.6,p.z+.3,sw('#2a2c30'))}
   else if(v===1){gb.box(p.x-.6,0,p.z-1.6,p.x+.6,2.2,p.z-.8,sw('#2e5f9a'));gb.box(p.x-.5,.2,p.z-.8,p.x+.5,2.1,p.z+1.8,sw('#f2c230'))}
   else if(v===2){const c=sw('#3f7a4a');for(let k=-1;k<=1;k++)for(let q=-1;q<=1;q++)gb.box(p.x+k*1.2-.06,0,p.z+q*1-.06,p.x+k*1.2+.06,2,p.z+q*1+.06,c);gb.box(p.x-1.3,1.9,p.z-1.1,p.x+1.3,2,p.z+1.1,c)}
   else{gb.box(p.x-1.6,0,p.z-1.6,p.x+1.6,.3,p.z+1.6,sw('#6a4a2c'));gb.box(p.x-1.4,.3,p.z-1.4,p.x+1.4,.35,p.z+1.4,sw('#e2cf98'))}return true}
 case 'kooi':{const w=p.w||24,d=p.d||14,c=sw('#3a3d42'),x0=p.x-w/2,z0=p.z-d/2,x1=p.x+w/2,z1=p.z+d/2,y=3;
   gb.box(x0,0,z0,x1,.05,z1,sw('#3f7a4a'));[[x0,z0,x1,z0+.1],[x0,z1-.1,x1,z1],[x0,z0,x0+.1,z1],[x1-.1,z0,x1,z1]].forEach(([a,b,c2,e])=>{gb.box(a,y-.1,b,c2,y,e,c);for(let s=0;s<=1;s+=.04){const x=a+(c2-a)*s,z=b+(e-b)*s;gb.box(x-.04,0,z-.04,x+.04,y,z+.04,c)}});
   gb.box(x0+.2,0,p.z-1.5,x0+.4,1.8,p.z+1.5,sw('#e8e4da'));gb.box(x1-.4,0,p.z-1.5,x1-.2,1.8,p.z+1.5,sw('#e8e4da'));return true}
 case 'goal':{const c=sw('#f1efe9'),f=p.flip?-1:1;gb.box(p.x-.1,0,p.z-3.6,p.x+.1,2.4,p.z-3.4,c);gb.box(p.x-.1,0,p.z+3.4,p.x+.1,2.4,p.z+3.6,c);gb.box(p.x-.1,2.3,p.z-3.6,p.x+.1,2.5,p.z+3.6,c);gb.box(p.x-f*1.4-.05,0,p.z-3.6,p.x-f*1.4+.05,1.2,p.z+3.6,sw('#d8d4cc'));return true}
 case 'post':{const c=sw('#e8e4da'),r=sw('#c0392b');[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>gb.cbox(p.x+a,p.z+b,.2,.2,0,3,c));gb.box(p.x-1.5,3,p.z-1.5,p.x+1.5,5.4,p.z+1.5,r,{top:sw('#e8e4da')});gb.cbox(p.x,p.z,.08,.08,5.4,7.6,c);gb.box(p.x,6.8,p.z-.05,p.x+1.2,7.6,p.z+.05,sw('#f2c230'));return true}
 case 'volley':{const c=sw('#e8e4da');gb.cbox(p.x-4.5,p.z,.15,.15,0,2.6,c);gb.cbox(p.x+4.5,p.z,.15,.15,0,2.6,c);gb.box(p.x-4.5,1.7,p.z-.03,p.x+4.5,2.5,p.z+.03,sw('#2a2c30'));return true}
 case 'molen':{const H0=p.h||44,c=sw('#eef0f2');gb.cbox(p.x,p.z,1.2,1.2,0,H0,c);gb.box(p.x-1,H0-1,p.z-2,p.x+1,H0+1,p.z+1.5,c);
   [[0,1],[.866,-.5],[-.866,-.5]].forEach(([a,b])=>{const L=16;gb.box(Math.min(p.x,p.x+a*L)-.3,H0+Math.min(0,b*L)-.3,p.z+1.5,Math.max(p.x,p.x+a*L)+.3,H0+Math.max(0,b*L)+.3,p.z+1.8,c)});return true}
 case 'vuurtoren':{for(let k=0;k<6;k++)gb.cbox(p.x,p.z,5-k*.35,5-k*.35,k*3.5,(k+1)*3.5,sw(k%2?'#e8e4da':'#c0392b'));gb.cbox(p.x,p.z,3,3,21,23.5,sw('#2a3f52','#ffe9a8'));gb.cbox(p.x,p.z,3.4,3.4,23.5,24.3,sw('#2a2c30'));return true}
 case 'fontein':{gb.cbox(p.x,p.z,9,9,0,.7,sw('#b7ad9a'));gb.cbox(p.x,p.z,8,8,.2,.65,sw('#3a7aa8','#1a3a5a'));gb.cbox(p.x,p.z,1.2,1.2,0,2,sw('#b7ad9a'));gb.cbox(p.x,p.z,.5,.5,2,4,sw('#cfe8ff','#5a8aaa'));return true}
 case 'terras':{const cols=['#c0392b','#2a8ad6','#2f6d3e'],c=sw(cols[(p.v||0)%3]),wd=sw('#6a4a2c');gb.cbox(p.x,p.z,.9,.9,.72,.8,wd);gb.cbox(p.x,p.z,.12,.12,0,.72,wd);
   [[-1,0],[1,0]].forEach(([a])=>{gb.cbox(p.x+a,p.z,.45,.45,.42,.48,wd);gb.cbox(p.x+a,p.z,.06,.06,0,.42,wd);gb.box(p.x+a*1.2-.03,.42,p.z-.22,p.x+a*1.2+.03,.95,p.z+.22,wd)});gb.cbox(p.x,p.z,.06,.06,.8,2.3,sw('#e8e4da'));gb.cbox(p.x,p.z,2.4,2.4,2.2,2.4,c);return true}
 case 'scooter':{const rot=p.rot,c=sw(p.v?'#e8e4da':'#c0261e'),B=(a0,a1,c0,c1,y0,y1,t)=>rot?gb.box(p.x+c0,y0,p.z+a0,p.x+c1,y1,p.z+a1,t):gb.box(p.x+a0,y0,p.z+c0,p.x+a1,y1,p.z+c1,t);
   B(-.85,.85,-.06,.06,.3,.8,c);B(-.9,-.6,-.1,.1,0,.6,sw('#1d1d1f'));B(.6,.9,-.1,.1,0,.6,sw('#1d1d1f'));B(-.95,-.25,-.32,.32,.8,1.3,sw(p.v?'#c0261e':'#e8e4da'));B(.65,.75,-.3,.3,1,1.1,sw('#2a2c30'));return true}
 case 'ambulance':{const rot=p.rot,B=(a0,a1,c0,c1,y0,y1,t,o)=>rot?gb.box(p.x+c0,y0,p.z+a0,p.x+c1,y1,p.z+a1,t,o):gb.box(p.x+a0,y0,p.z+c0,p.x+a1,y1,p.z+c1,t,o);
   B(-2.6,2.6,-1,1,.35,2.6,sw('#f1ece0'),{top:sw('#e8e4da')});B(-2.62,2.62,-1.02,1.02,1.1,1.4,sw('#f2c230'));B(1.4,2.62,-1.02,1.02,1.6,2.4,sw('#24323f','#000000'));B(.4,1.2,-.6,.6,2.6,2.8,sw('#2a5fd8','#3a6aff'));
   [[-1.7,-1],[1.7,-1],[-1.7,1],[1.7,1]].forEach(([a,b])=>B(a-.35,a+.35,b-.15,b+.15,0,.65,sw('#16171a')));return true}
 case 'heli':{const y=p.y||30;gb.cbox(p.x,p.z,12,12,y-.1,y+.05,sw('#3a3d42'));gb.cbox(p.x,p.z,1,6,y+.05,y+.1,sw('#f1efe9'));gb.box(p.x-2.5,y+.05,p.z-.5,p.x+2.5,y+.1,p.z+.5,sw('#f1efe9'));return true}
 case 'torenkraan':{const H0=p.h||50,c=sw('#f2c230'),dk=sw('#2a2c30');gb.cbox(p.x,p.z,1.8,1.8,0,H0,c);for(let y=2;y<H0;y+=3)gb.cbox(p.x,p.z,2,2,y,y+.3,c);gb.box(p.x-12,H0,p.z-.7,p.x+40,H0+1.4,p.z+.7,c);gb.box(p.x-12,H0-2,p.z-1.5,p.x-6,H0,p.z+1.5,sw('#9a9ca0'));gb.box(p.x-1.5,H0-2.5,p.z-1.2,p.x+1.5,H0,p.z+1.2,sw('#e8e4da','#ffe9a8'));gb.cbox(p.x+28,p.z,.1,.1,H0-26,H0,dk);gb.box(p.x+26,H0-28,p.z-1.5,p.x+30,H0-26,p.z+1.5,sw('#7d8288'));return true}
 case 'trein':{const n=p.n||5,L=24,c=sw(p.v?'#2a4a8a':'#f2c230'),c2=sw(p.v?'#f2c230':'#2a4a8a');for(let k=0;k<n;k++){const x0=p.x-n*L/2+k*(L+1);gb.box(x0,.6,p.z-1.5,x0+L,4.4,p.z+1.5,c,{top:sw('#8a8c90')});gb.box(x0,2.4,p.z-1.52,x0+L,3.4,p.z+1.52,sw('#24323f','#3a4a5a'));gb.box(x0,.6,p.z-1.53,x0+L,1,p.z+1.53,c2);gb.box(x0+2,0,p.z-1.2,x0+6,.6,p.z+1.2,sw('#2a2c30'));gb.box(x0+L-6,0,p.z-1.2,x0+L-2,.6,p.z+1.2,sw('#2a2c30'))}return true}
 case 'perron':{const c=sw('#3a3d42'),rf=sw('#8a9098');for(let x=p.x0;x<=p.x1;x+=12){gb.cbox(x,(p.z0+p.z1)/2,.3,.3,0,5,c)}gb.box(p.x0,5,p.z0-1.5,p.x1,5.4,p.z1+1.5,rf);return true}
 case 'spoorboom':{const c=sw('#e8e4da'),r=sw('#c0261e'),s=p.side||1;gb.cbox(p.x,p.z,.4,.4,0,1.4,sw('#2a2c30'));for(let k=0;k<8;k++){const a=p.x+s*k*.8,b=p.x+s*(k+1)*.8;gb.box(Math.min(a,b),1.1,p.z-.08,Math.max(a,b),1.25,p.z+.08,k%2?c:r)}gb.cbox(p.x,p.z,.5,.2,1.6,2.1,sw('#c0261e','#ff3a2a'));return true}
 case 'stootblok':gb.box(p.x-.6,0,p.z-1.2,p.x+.6,1.2,p.z+1.2,sw('#c0261e'));return true;
 case 'jacht':{const L=p.l||12,w=3.6,rot=p.rot,B=(a0,a1,c0,c1,y0,y1,t,o)=>rot?gb.box(p.x+c0,y0,p.z+a0,p.x+c1,y1,p.z+a1,t,o):gb.box(p.x+a0,y0,p.z+c0,p.x+a1,y1,p.z+c1,t,o);
   B(-L/2,L/2,-w/2,w/2,-.8,.6,sw('#f1efe9'),{top:sw('#b48c62')});B(-L/2+2,L/2-4,-w/2+.4,w/2-.4,.6,1.8,sw('#e8e4da'),{top:sw('#f1efe9')});B(-L/2+2.5,L/2-4.5,-w/2+.38,w/2-.38,1,1.5,sw('#1d2a38','#3a4a5a'));
   if(p.v%2)B(-1,0,-.1,.1,1.8,9,sw('#d8d4cc'));return true}
 case 'speedboot':{const rot=p.rot,B=(a0,a1,c0,c1,y0,y1,t,o)=>rot?gb.box(p.x+c0,y0,p.z+a0,p.x+c1,y1,p.z+a1,t,o):gb.box(p.x+a0,y0,p.z+c0,p.x+a1,y1,p.z+c1,t,o);
   B(-3.5,3.5,-1.2,1.2,-.6,.5,sw(p.v?'#1d1d1f':'#c0261e'),{top:sw('#e8e4da')});B(-1,.6,-1,1,.5,1.1,sw('#24323f','#000000'));B(3.5,4,-.3,.3,-.3,.6,sw('#2a2c30'));return true}
 case 'reclame':{const c=sw('#2a2d32');gb.cbox(p.x,p.z-4,.5,.5,0,8,c);gb.cbox(p.x,p.z+4,.5,.5,0,8,c);gb.box(p.x-.3,8,p.z-7,p.x+.3,13,p.z+7,sw(p.v?'#ff4fd8':'#3ad6ff',p.v?'#ff4fd8':'#3ad6ff'));gb.box(p.x-.35,9.5,p.z-5,p.x+.35,11,p.z+3,sw('#111214','#000000'));return true}
 case 'slagboom':{gb.cbox(p.x,p.z,.6,.6,0,1.2,sw('#2a2c30'));for(let k=0;k<6;k++)gb.box(p.x-.08,1,p.z+k*.9,p.x+.08,1.15,p.z+(k+1)*.9,sw(k%2?'#e8e4da':'#c0261e'));return true}
 }return false}
// grondtekeningen: spoor, tramrails, voetbalveld, schoolplein, parkeervakken
function gfxGround(cx,GP,r,X){const ov=(x0,z0,x1,z1)=>x1>=r.x0-2&&x0<=r.x1+2&&z1>=r.z0-2&&z0<=r.z1+2;
  if(r.lo){// grof: alleen het spoor als donkere streep
    if(ov(SPOOR.x0,SPOOR.z0,SPOOR.x1,SPOOR.z1)){cx.fillStyle='#4a4038';SPOOR.tracks.forEach(t=>cx.fillRect(SPOOR.x0*GP,(t-1)*GP,(SPOOR.x1-SPOOR.x0)*GP,Math.max(1,2*GP)))}return}
  // spoor: dwarsliggers en twee rails per spoor (ook over de overweg)
  if(ov(SPOOR.x0,SPOOR.z0,SPOOR.x1,SPOOR.z1)){const xa=Math.max(SPOOR.x0,r.x0-1),xb=Math.min(SPOOR.x1,r.x1+1);
    SPOOR.tracks.forEach(t=>{cx.fillStyle='#5a4a3a';for(let x=xa;x<xb;x+=.65)cx.fillRect(Math.round(x*GP),Math.round((t-1.35)*GP),Math.max(1,GP*.3|0),Math.round(2.7*GP));
      cx.fillStyle='#b8bcc2';[-.72,.72].forEach(o=>cx.fillRect(xa*GP,Math.round((t+o)*GP)-1,(xb-xa)*GP,2));cx.fillStyle='#4a4d54';[-.72,.72].forEach(o=>cx.fillRect(xa*GP,Math.round((t+o)*GP)+1,(xb-xa)*GP,1))})}
  // tramrails (twee sporen in het midden van de weg)
  TRAM.forEach(t=>{const h=t.dir==='h';if(!(h?ov(t.a,t.c-4,t.b,t.c+4):ov(t.c-4,t.a,t.c+4,t.b)))return;const a=Math.max(t.a,(h?r.x0:r.z0)-1),b=Math.min(t.b,(h?r.x1:r.z1)+1);
    [-TRACK,TRACK].forEach(o=>[-GAUGE,GAUGE].forEach(gg=>{const c=t.c+o+gg;cx.fillStyle='#9aa1a9';if(h)cx.fillRect(a*GP,Math.round(c*GP)-1,(b-a)*GP,2);else cx.fillRect(Math.round(c*GP)-1,a*GP,2,(b-a)*GP);
      cx.fillStyle='#2b2d31';if(h)cx.fillRect(a*GP,Math.round(c*GP)+1,(b-a)*GP,1);else cx.fillRect(Math.round(c*GP)+1,a*GP,1,(b-a)*GP)}))});
  // voetbalveld: witte lijnen
  if(ov(VELD.x0,VELD.z0,VELD.x1,VELD.z1)){cx.strokeStyle='#f1efe9';cx.lineWidth=Math.max(1,GP*.25);cx.strokeRect(VELD.x0*GP+1,VELD.z0*GP+1,(VELD.x1-VELD.x0)*GP-2,(VELD.z1-VELD.z0)*GP-2);
    const mx=(VELD.x0+VELD.x1)/2*GP,mz=(VELD.z0+VELD.z1)/2*GP;cx.beginPath();cx.moveTo(mx,VELD.z0*GP);cx.lineTo(mx,VELD.z1*GP);cx.stroke();cx.beginPath();cx.arc(mx,mz,6*GP,0,Math.PI*2);cx.stroke();
    [VELD.x0,VELD.x1-12].forEach(x=>cx.strokeRect(x*GP,(mz/GP-9)*GP,12*GP,18*GP))}
  // schoolplein: hinkelbaan en een basketbalcirkel
  if(ov(SH[0],SH[1],SH[2],SH[3])){cx.fillStyle='#f2c230';for(let k=0;k<6;k++)cx.fillRect((182+(k%2)*1.1)*GP,(342+k*1.2)*GP,GP,GP);cx.strokeStyle='#e8e4da';cx.lineWidth=2;cx.beginPath();cx.arc(215*GP,348*GP,4*GP,0,Math.PI*2);cx.stroke()}
  // parkeervakken (verzorgingsplaats, garage-oprit, station)
  [[VZP.x0+2,VZP.z0+2,VZP.x1-2,VZP.z0+8],[VZP.x0+2,VZP.z1-8,VZP.x1-2,VZP.z1-2]].forEach(([x0,z0,x1,z1])=>{if(!ov(x0,z0,x1,z1))return;cx.fillStyle='#e8e4da';for(let x=x0;x<=x1;x+=2.6)cx.fillRect(Math.round(x*GP),z0*GP,1,(z1-z0)*GP)})}

/* ---------- wegennet voor het verkeer: knooppunten (kruisingen en einden) en stukken weg ertussen ---------- */
const NET=(function(){const key=(x,z)=>x+','+z,nodes={};const node=(x,z)=>nodes[key(x,z)]||(nodes[key(x,z)]={x,z,n:[]});
  VR.forEach(v=>{const zs=new Set([v.a,v.b]);HR.forEach(h=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)zs.add(h.z)});const L=[...zs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A_=node(v.x,L[i]),B=node(v.x,L[i+1]);A_.n.push(B);B.n.push(A_)}});
  HR.forEach(h=>{const xs=new Set([h.a,h.b]);VR.forEach(v=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)xs.add(v.x)});const L=[...xs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A_=node(L[i],h.z),B=node(L[i+1],h.z);if(!A_.n.includes(B)){A_.n.push(B);B.n.push(A_)}}});
  return Object.values(nodes)})();
function setSolid(r,on){block(Math.floor(r.x0),Math.floor(r.z0),Math.ceil(r.x1),Math.ceil(r.z1),on?1:0);COMP=null}
// oude namen voor plekken uit de Pixelstad (modules die placeById('jail') e.d. vragen)
const ALIAS={jail:'bajes',fam:'villa_cosa',werk:'havenloods',cars:'garage',skills:'sportschool',crimes:'sahara',hits:'sahara',relax:'hotel',casino:'hotel',look:'hotel',shop:'garage',wit:'rapido',biz:'advocaat'};
const placeById=id=>places.find(p=>p.id===id)||(ALIAS[id]?places.find(p=>p.id===ALIAS[id]):undefined);
// geen Oostland in de verhaalstad: een leeg terrein buiten de kaart
const ESTATE={x0:-100,z0:-100,x1:-90,z1:-90,n:'',gate:{x:A.thuis.x,z:A.thuis.z}};
root.STAD_MAP={NET,districtAt,setSolid,ESTATE,EST_H:[],EST_B:[],BIZ_LOOK:{},alleys,hides,parkPaths,estateAt:()=>false,W,H,FL,T,RW,SW,LANE,
  XS,ZS,VR,HR,RX:XS,RZ:ZS,RXE:[],RZE:[],GATES:[],A,Z:Zn,ground:g,solid,bridgeWalk,buildings,props,places,bridges,DISTRICTS,spawn,jailGate,
  at,walkable,canStand,nearestWalk,findPath,placeById,placeByPage:pg=>places.find(p=>p.page===pg),
  // verhaalstad-extra's
  VERHAAL:true,CHUNK,PLEKKEN,ADRESSEN,TRAM,tramAt,HALTES,KRANEN,SPOOR,GRACHT,straatAt:(x,z)=>{const s=straatAt(x,z);return s?s.r.n:''},adres,
  STY_EXTRA,SIGNC,MAPPL,SIGNS,gfx:{prop:gfxProp,ground:gfxGround}};
})(typeof window!=='undefined'?window:globalThis);
