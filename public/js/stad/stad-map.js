// Pixelstad: de kaart. Wegen, water, gebouwen, ingangen en spullen op straat, plus de route-planner.
// Puur rekenwerk (geen tekenwerk), dus ook in node te testen. 1 eenheid = 1 meter; x loopt naar het oosten, z naar het zuiden.
(function(root){
'use strict';
const W=576,H=360,RW=4,SW=3,FL=3.4;            // kaartmaat, halve wegbreedte, stoepbreedte, hoogte van een verdieping
const RX=[30,80,130,178,204,254,304],RZ=[36,88,140,192];
// oostkant (over het havenkanaal): IJ-oever, bedrijventerrein, villawijk en tuinwijk
const RXE=[404,486,562],RZE=[52,124,196,272,340];
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,SAND:4,PLAZA:5,LOT:6,DOCK:7,YARD:8,BRIDGE:9,PARK:10,GARDEN:11};
const g=new Uint8Array(W*H),solid=new Uint8Array(W*H);
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(20261109);
const ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=a=>a[Math.floor(rng()*a.length)];
const inb=(x,z)=>x>=0&&z>=0&&x<W&&z<H;
const at=(x,z)=>inb(x,z)?g[z*W+x]:T.WATER;
function set(x0,z0,x1,z1,t,only){for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++){const i=z*W+x;if(only==null||only.includes(g[i]))g[i]=t}}
function block(x0,z0,x1,z1,v){for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++)solid[z*W+x]=v==null?1:v}

/* ---------- grond: zee, strand, gracht, haven ---------- */
g.fill(T.GRASS);
for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(x<6||x>=570||z<6||z>=354)g[z*W+x]=T.WATER;
set(6,250,392,354,T.WATER);                                                  // zee ten zuiden van het strand
set(6,228,300,250,T.SAND);
set(300,200,392,354,T.WATER);
set(340,6,392,354,T.WATER);                                                  // havenkanaal
set(392,6,570,12,T.PLAZA);                                                   // kade van de IJ-oever
[[44,54],[100,110],[156,166]].forEach(([a,b])=>set(340,a,372,b,T.DOCK));   // steigers in de haven
set(185,6,197,250,T.WATER);                                                  // de gracht
set(308,6,340,200,T.DOCK);                                                   // havenkade

/* ---------- wegen en stoepen (over water worden het bruggen) ---------- */
const roads=[];
RX.forEach(x=>roads.push([x-RW,RZ[0]-RW,x+RW,RZ[3]+RW]));
RZ.forEach(z=>roads.push([RX[0]-RW,z-RW,RX[6]+RW,z+RW]));
// havenbruggen naar de oostkant
[88,140,192].forEach(z=>roads.push([RX[6]+RW,z-RW,RXE[0],z+RW]));
RXE.forEach(x=>roads.push([x-RW,RZE[0]-RW,x+RW,RZE[4]+RW]));
RZE.forEach(z=>roads.push([RXE[0]-RW,z-RW,RXE[2]+RW,z+RW]));
roads.forEach(([x0,z0,x1,z1])=>{for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){const i=z*W+x;g[i]=g[i]===T.WATER?T.BRIDGE:T.ROAD}});
const isRoad=t=>t===T.ROAD||t===T.BRIDGE;
roads.forEach(([x0,z0,x1,z1])=>{for(let z=z0-SW;z<z1+SW;z++)for(let x=x0-SW;x<x1+SW;x++){if(!inb(x,z))continue;const i=z*W+x,t=g[i];
  if(isRoad(t))continue;if(t===T.WATER){if(x>=185&&x<197)g[i]=T.BRIDGE+16}else if(t!==T.SAND)g[i]=T.WALK}});
// brugstoep: zelfde soort als brug, maar we onthouden het verschil voor het tekenen (16 = voetpad op de brug)
const bridgeWalk=new Uint8Array(W*H);for(let i=0;i<W*H;i++)if(g[i]===T.BRIDGE+16){g[i]=T.BRIDGE;bridgeWalk[i]=1}
// stoep langs het strand en de kade
set(6,226,300,228,T.WALK,[T.SAND]);

/* ---------- blokken ---------- */
const COLS=[[6,23],[37,73],[87,123],[137,171],[211,247],[261,297],[311,340]];
const ROWS=[[6,29],[43,81],[95,133],[147,185],[199,226]];
const buildings=[],props=[],places=[],reserved=[];
const over=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function addB(b){b.i=buildings.length;buildings.push(b);set(b.x0,b.z0,b.x1,b.z1,T.LOT);block(b.x0,b.z0,b.x1,b.z1);return b}
// bijzonder gebouw met ingang: door = punt op de stoep vlak voor de deur
function place(o){const r=[o.x0,o.z0,o.x1,o.z1];reserved.push(o.res||r);
  if(o.dyn){set(o.x0,o.z0,o.x1,o.z1,T.LOT);const f=o.face,mx=o.dx!=null?o.dx:(o.x0+o.x1)/2,mz=(o.z0+o.z1)/2;
    const door=f==='N'?{x:mx,z:o.z0-1.2}:f==='S'?{x:mx,z:o.z1+1.2}:f==='W'?{x:o.x0-1.2,z:mz}:{x:o.x1+1.2,z:mz};
    const pl=Object.assign({},o,{door,b:-1,rect:{x0:o.x0,z0:o.z0,x1:o.x1,z1:o.z1}});places.push(pl);return pl}
  const parts=(o.parts||[r]).map((p,k)=>addB({x0:p[0],z0:p[1],x1:p[2],z1:p[3],fl:p[4]||o.fl,st:p[5]||o.st,roof:p[6]||o.roof||'flat',pl:o.id,main:k===0}));
  const f=o.face,mx=o.dx!=null?o.dx:(o.x0+o.x1)/2,mz=o.dz!=null?o.dz:(o.z0+o.z1)/2;
  const door=f==='N'?{x:mx,z:o.z0-1.2}:f==='S'?{x:mx,z:o.z1+1.2}:f==='W'?{x:o.x0-1.2,z:mz}:{x:o.x1+1.2,z:mz};
  const pl=Object.assign({},o,{door,b:parts[0].i});delete pl.parts;places.push(pl);return pl}

// Wijken (namen voor de kaart)
const DISTRICTS=[{n:'Westbuurt',x:80,z:114},{n:'Centrum',x:154,z:140},{n:'De Gracht',x:191,z:160},{n:'Het Plein',x:229,z:127},{n:'Zuidas',x:279,z:140},
 {n:'De Haven',x:352,z:130},{n:'Boulevard',x:150,z:236},{n:'Noorderpark',x:152,z:14},{n:'De Bajes',x:298,z:14},{n:'Villapark',x:58,z:14},{n:'IJ-oever',x:478,z:8},{n:'Bedrijventerrein',x:483,z:90},{n:'Oosterstraat',x:483,z:160},{n:'Villawijk',x:483,z:234},{n:'Tuinwijk',x:445,z:318}];

/* --- de bijzondere plekken: elk opent een scherm van het spel --- */
// pagina-id's zoals in het klikspel (ui.js PAGES)
place({id:'casino',page:'casino',name:'Casino Royaal',sign:'CASINO',st:'casino',fl:3,face:'S',x0:213,z0:45,x1:245,z1:73,
  parts:[[213,45,245,73,3],[221,50,237,66,11,'casino']],res:[211,43,247,81],ic:'casino'});
set(211,73,247,81,T.PLAZA,[T.GRASS]);
place({id:'bank',page:'bank',name:'Nederlandsche Onderbank',sign:'BANK',st:'bank',fl:4,face:'S',x0:139,z0:46,x1:169,z1:74,res:[137,43,171,81],ic:'bank'});
set(137,74,171,81,T.PLAZA,[T.GRASS]);
place({id:'politie',page:'politie',name:'Politiebureau',sign:'POLITIE',st:'police',fl:3,face:'S',x0:139,z0:98,x1:169,z1:124,res:[137,95,171,133],ic:'politie'});
set(137,124,171,133,T.PLAZA,[T.GRASS]);
place({id:'biz',page:'biz',name:'Notaris De Sleutel',sign:'NOTARIS',st:'plaster',fl:4,face:'S',x0:139,z0:171,x1:159,z1:185,ic:'biz'});
set(211,95,247,133,T.PLAZA,[T.GRASS]);                                       // Het Plein
place({id:'crimes',page:'crimes',name:'Café Het Gat',sign:'HET GAT',st:'pub',fl:3,face:'S',x0:213,z0:96,x1:229,z1:106,ic:'crimes',roof:'gableX'});
place({id:'wit',page:'wit',name:'Wasserette Schoon Geld',sign:'WASSERETTE',st:'shop',fl:2,face:'N',x0:212,z0:147,x1:228,z1:160,ic:'wit'});
place({id:'hits',page:'hits',name:'Het Contact',sign:'CONTACT',st:'brick2',fl:3,face:'E',x0:284,z0:96,x1:297,z1:110,ic:'hits'});
place({id:'shop',page:'shop',name:'Wapenhandel Kogel & Zn',sign:'WAPENS',st:'gun',fl:2,face:'S',x0:261,z0:172,x1:277,z1:185,ic:'shop'});
place({id:'cars',page:'cars',name:'Garage Van der Plaat',sign:'GARAGE',st:'garage',fl:2,face:'N',x0:313,z0:97,x1:338,z1:118,ic:'cars'});
// Autokerkhof De Sloop op de havenkade: slopen voor onderdelen (S.sloop), met een kantoortje en stapels wrakken
place({id:'sloop',page:'cars',name:'Autokerkhof De Sloop',sign:'AUTOKERKHOF',st:'ware2',fl:1,face:'W',x0:328,z0:126,x1:338,z1:142,res:[312,121,340,147],ic:'cars'});
place({id:'werk',page:'werk',name:'Havenloods 7',sign:'HAVEN',st:'ware',fl:3,face:'N',x0:313,z0:149,x1:338,z1:176,ic:'werk'});
place({id:'skills',page:'skills',name:'Sportschool De Bokszak',sign:'GYM',st:'gym',fl:2,face:'N',x0:40,z0:200,x1:66,z1:214,ic:'skills'});
place({id:'relax',page:'relax',name:'Spa Zeezicht',sign:'SPA',st:'beach',fl:2,face:'N',x0:90,z0:200,x1:116,z1:214,ic:'relax'});
place({id:'look',page:'look',name:'Kledingzaak Maatwerk',sign:'KLEDING',st:'boutique',fl:2,face:'N',x0:140,z0:200,x1:166,z1:214,ic:'look'});
// Oostland (de oostkant over het havenkanaal) is JOUW terrein: elke woning en elke zaak uit het spel heeft daar een vaste kavel.
// Leeg = bomen (woning) of grind (zaak) met een klein bord; koop je hem (bij de notaris of ter plekke), dan wordt hij gebouwd.
// Onder de brug in de stad blijft de gratis slaapplek.
const ESTATE={x0:392,z0:6,x1:570,z1:354,n:'Oostland',gate:{x:398,z:140}};
const EST_H=[['penthouse',398,14,423,45,'S'],['ijpent',425,14,450,45,'S'],['omval',452,14,477,45,'S'],
 ['villa',412,204,446,233,'N'],['gooi',494,204,554,264,'N'],['gracht',448,236,463,264,'S'],['jordaan',465,236,478,264,'S'],
 ['kamer',412,280,428,306,'N'],['studio',430,280,446,306,'N'],['kraak',448,280,478,306,'N'],['boot',512,288,528,296,'N']];
// zaken: aan de IJ-oever de torens, op het bedrijventerrein auto's en handel, in de Oosterstraat winkels, horeca en toerisme,
// in de woonwijken het verhuurvastgoed
const EST_B=[['vastgoed',482,14,507,45,'S'],['kantoor',509,14,533,45,'S'],['rederij',535,14,558,45,'S'],
 ['autogarage',412,60,428,86,'N'],['dealer',429,60,445,86,'N'],['garage',446,60,462,86,'N'],['wasstraat',463,60,478,86,'N'],
 ['taxi',412,90,428,116,'S'],['verhuur',429,90,445,116,'S'],['importeur',446,90,462,116,'S'],['bedrijfshal',463,90,478,116,'S'],
 ['koerier',494,60,508,86,'N'],['groothandel',509,60,523,86,'N'],['transport',524,60,538,86,'N'],['diamant',539,60,554,86,'N'],
 ['port',494,90,516,116,'S'],['jet',518,90,554,116,'S'],
 ['wash',412,132,425,147,'N'],['avond',426,132,439,147,'N'],['nagel',440,132,452,147,'N'],['shop',453,132,465,147,'N'],['barber',466,132,478,147,'N'],
 ['sport',412,173,425,188,'S'],['wissel',426,173,439,188,'S'],['juwelier',440,173,452,188,'S'],['fiets',453,173,465,188,'S'],['souvenir',466,173,478,188,'S'],
 ['coffeeshop',412,150,427,170,'W'],['hostel',463,150,478,170,'E'],
 ['snack',494,132,506,147,'N'],['pizza',507,132,519,147,'N'],['bruin',520,132,531,147,'N'],['shisha',532,132,543,147,'N'],['restaurant',544,132,554,147,'N'],
 ['club',494,173,506,188,'S'],['speelhal',507,173,519,188,'S'],['beach',520,173,531,188,'S'],['rondvaart',532,173,543,188,'S'],['galerie',544,173,554,188,'S'],
 ['hotel',494,150,509,170,'W'],['gcasino',539,150,554,170,'E'],
 ['boven',448,204,463,233,'N'],['studenten',465,204,478,233,'N'],['winkelpand',412,236,446,264,'S'],
 ['garagebox',412,312,434,332,'S'],['parkeer',436,312,458,332,'S'],['markt',460,312,478,332,'S']];
// hoe elk pand eruitziet: stijl, verdiepingen bij aankoop, + per upgrade-niveau, + per 3 vestigingen, maximum, dak
const BIZ_LOOK={wash:['shop',1,.5,0,3],avond:['shop',1,.5,0,3],nagel:['boutique',1,.5,0,3],shop:['shop',1,.5,0,3],barber:['boutique',1,.5,0,3],sport:['gym',1,.5,0,3],wissel:['shop',1,.5,0,3],juwelier:['boutique',1,.5,0,3],
  fiets:['shop',1,.5,0,2],souvenir:['shop',1,.5,0,3],coffeeshop:['pub',1,.5,0,3],hostel:['brick2',2,1,0,6,'gableZ'],rondvaart:['beach2',1,.5,0,2],galerie:['glass2',1,.5,0,3],
  snack:['beach2',1,.5,0,3],pizza:['pub',1,.5,0,3],bruin:['pub',2,.5,0,4,'gableX'],shisha:['pub',2,.5,0,4],restaurant:['plaster',2,.5,0,4],club:['club',2,.5,0,4],speelhal:['casino',2,.5,0,4],beach:['beach',1,.5,0,3],
  hotel:['villa',3,1,1,10],gcasino:['casino',3,1,1,8],
  wasstraat:['garage',1,.5,0,2],taxi:['garage',1,.5,0,3],autogarage:['garage',1,.5,0,3],dealer:['glass2',1,.5,0,3],garage:['ware2',2,.5,0,4],verhuur:['garage',1,.5,0,3],importeur:['glass',2,.5,0,5],
  markt:['shop',1,0,0,1],koerier:['ware',1,.5,0,3],groothandel:['ware2',2,.5,0,4],transport:['ware',2,.5,0,4],port:['ware',2,.5,0,4],diamant:['glass',2,1,0,6],rederij:['glass2',4,2,1,16],jet:['garage',2,.5,0,3,'gableZ'],
  garagebox:['garage',1,0,0,1],boven:['brick',2,1,1,8,'gableX'],studenten:['brick3',3,1,1,9,'gableX'],winkelpand:['plaster',2,1,1,7],parkeer:['concrete',2,1,1,8],bedrijfshal:['ware',1,.5,1,4],vastgoed:['glass',5,2,1,20],kantoor:['glass2',4,2,1,18]};
// vijver in de Tuinwijk (voor de woonboot)
set(496,288,552,330,T.WATER);
place({id:'plot_brug',plot:'brug',zone:'brug',hid:'brug',page:'verblijf',name:'Onder de brug',sign:'KAVEL',face:'W',x0:182,z0:96,x1:185,z1:102,ic:'verblijf',dyn:'plot'});set(182,96,185,102,T.WALK);
EST_H.forEach(([id,x0,z0,x1,z1,f])=>{place({id:'plot_'+id,plot:id,zone:id,hid:id,page:'verblijf',name:'Kavel',sign:'KAVEL',face:f,x0,z0,x1,z1,ic:'verblijf',dyn:'plot',est:1});
  if(id!=='boot')set(x0,z0,x1,z1,T.GARDEN)});
EST_B.forEach(([b,x0,z0,x1,z1,f])=>place({id:'biz_'+b,biz:b,page:'biz',name:'Kavel',sign:'TE KOOP',face:f,x0,z0,x1,z1,ic:'biz',dyn:'biz',est:1}));
// villapark: de familievilla in een tuin met heg
set(46,6,116,29,T.GARDEN);
place({id:'fam',page:'fam',name:'Villa Cosa Nostra',sign:'FAMILIE',st:'villa',fl:3,face:'S',x0:66,z0:9,x1:96,z1:22,res:[46,6,116,29],ic:'fam'});
// de bajes: binnenplaats met muur, de poort aan de straatkant
set(262,7,336,29,T.YARD);
place({id:'jail',page:'jail',name:'De Bajes',sign:'BAJES',st:'jail',fl:4,face:'S',dx:299,x0:280,z0:10,x1:318,z1:22,res:[262,7,336,29],ic:'jail'});
const jailGate={x:299,z:29.5};
places.find(p=>p.id==='jail').door={x:299,z:30.4};

/* --- straten vol panden --- */
const STY={west:['brick','brick','brick2','plaster','brick3'],centrum:['plaster','brick','brick2','shop','brick3'],zuid:['glass','glass2','concrete'],haven:['ware','ware2'],strand:['beach','beach2'],noord:['concrete','glass2']};
// stegen: de gaten tussen de panden (3 m breed) lopen door naar de binnenplaats. Politieauto's kunnen er niet in.
const alleys=[];
function fill(x0,z0,x1,z1,o){
  const d=o.d||ri(o.dmin,o.dmax),gap=o.gap||0;
  const alley=(f,a,b)=>{const r=f==='N'?[a,z0,b,z0+d]:f==='S'?[a,z1-d,b,z1]:f==='W'?[x0,a,x0+d,b]:[x1-d,a,x1,b];if(!reserved.some(q=>over(q,r)))alleys.push({x0:r[0],z0:r[1],x1:r[2],z1:r[3],f,cx:(r[0]+r[2])/2,cz:(r[1]+r[3])/2})};
  // elke kant krijgt minstens één steeg (rond het midden), zodat elke binnenplaats van alle kanten te bereiken is
  const side=(ax,bx,mk,f)=>{let x=ax,made=0;const mid=(ax+bx)/2;while(x<bx){let w=ri(o.wmin,o.wmax);if(bx-x-w<o.wmin)w=bx-x;if(((gap&&rng()<gap)||(!made&&x>=mid-5))&&x>ax&&bx-x>o.wmin+3){alley(f,x,x+3);made=1;x+=3;continue}mk(x,Math.min(bx,x+w));x+=w}};
  const B=(a,b,c,e,f)=>{const r=[a,b,c,e];if(c-a<3||e-b<3||reserved.some(q=>over(q,r)))return;
    addB({x0:a,z0:b,x1:c,z1:e,fl:ri(o.fmin,o.fmax),st:pick(o.st),roof:o.roof?(f==='N'||f==='S'?'gableX':'gableZ'):'flat',front:f})};
  side(x0,x1,(a,b)=>B(a,z0,b,z0+d,'N'),'N');
  side(x0,x1,(a,b)=>B(a,z1-d,b,z1,'S'),'S');
  if(z1-z0>2*d+o.wmin){side(z0+d,z1-d,(a,b)=>B(x0,a,x0+d,b,'W'),'W');side(z0+d,z1-d,(a,b)=>B(x1-d,a,x1,b,'E'),'E')}
  set(x0+d,z0+d,x1-d,z1-d,o.inner||T.GARDEN,[T.GRASS]);
}
const WEST={wmin:6,wmax:9,dmin:10,dmax:13,fmin:3,fmax:5,st:STY.west,roof:1,gap:.17};
const CEN={wmin:7,wmax:12,dmin:11,dmax:14,fmin:4,fmax:6,st:STY.centrum,gap:.15};
const ZUID={wmin:12,wmax:18,dmin:12,dmax:16,fmin:8,fmax:16,st:STY.zuid,gap:.25,inner:T.PLAZA};
// Westbuurt (kolom 1 en 2, rij 1 is het park)
set(37,43,73,81,T.PARK);
fill(87,43,123,81,WEST);fill(37,95,73,133,WEST);fill(87,95,123,133,WEST);fill(37,147,73,185,WEST);fill(87,147,123,185,WEST);
// Centrum
fill(137,147,171,185,CEN);fill(211,147,247,185,CEN);
// Het Plein: panden langs de randen, open midden
[[230,96,246,105,4],[212,109,221,118,4],[212,120,221,132,5],[238,109,246,120,5],[238,122,246,132,4]].forEach(([a,b,c,e,f])=>{const r=[a,b,c,e];if(!reserved.some(q=>over(q,r)))addB({x0:a,z0:b,x1:c,z1:e,fl:f,st:pick(STY.centrum),roof:'flat'})});
// Zuidas: torens
fill(261,43,297,81,ZUID);fill(261,95,297,133,ZUID);fill(261,147,297,185,ZUID);
// haven: loodsen en containers

// oostkant: bedrijventerrein (beton, loodsen, containers), villawijk en tuinwijk (tuinen met bomen)
set(411,59,479,117,T.DOCK);set(493,59,555,117,T.DOCK);set(411,131,479,189,T.PLAZA);set(493,131,555,189,T.PLAZA);

set(411,203,479,265,T.GARDEN,[T.GRASS]);set(493,203,555,265,T.GARDEN,[T.GRASS]);set(411,279,479,333,T.GARDEN,[T.GRASS]);set(493,279,555,333,T.PARK,[T.GRASS]);
set(392,12,570,48,T.GRASS,[T.GRASS]);
// tuinwijk: een paar rijtjes aan de zuidkant van het blok (vaste huizen naast de kavels)

// noordkant: kantoren tussen gracht en bajes, park tussen villa en gracht
set(123,6,185,29,T.PARK);set(6,6,46,29,T.PARK);set(197,6,262,29,T.GRASS);
[[200,9,214,27,6],[216,11,232,27,8],[234,9,252,27,7]].forEach(([a,b,c,e,f])=>addB({x0:a,z0:b,x1:c,z1:e,fl:f,st:pick(STY.noord),roof:'flat'}));
// boulevard aan het strand: strandtenten en winkeltjes tussen de grote plekken
(function(){let x=8;while(x<298){const w=ri(9,13);const r=[x,200,x+w,211];if(x+w<298&&!reserved.some(q=>over(q,[r[0]-1,r[1],r[2]+1,r[3]]))&&rng()<.7)addB({x0:x,z0:200,x1:x+w,z1:211,fl:ri(1,2),st:pick(STY.strand),roof:'flat'});x+=w+ri(3,6)}})();
// westkust: promenade met bomen
set(6,43,23,185,T.PARK);
// stegen: donker asfalt
alleys.forEach(a=>set(a.x0,a.z0,a.x1,a.z1,T.YARD,[T.GRASS,T.GARDEN,T.PLAZA]));

/* ---------- spullen op straat (decor, sommige blokkeren) ---------- */
function prop(k,x,z,o){const p=Object.assign({k,x,z},o||{});props.push(p);if(p.solid){const r=p.solid;block(Math.floor(x-r),Math.floor(z-r),Math.ceil(x+r),Math.ceil(z+r))}return p}
function M_nearRoadCorner(x,z){return RX.some(q=>Math.abs(q-x)<RW+SW+1)&&RZ.some(q=>Math.abs(q-z)<RW+SW+1)}
const inPlot=(x,z,m)=>places.some(p=>p.rect&&x>p.rect.x0-(m||0)&&x<p.rect.x1+(m||0)&&z>p.rect.z0-(m||0)&&z<p.rect.z1+(m||0));
const nearDoor=(x,z)=>places.some(p=>Math.hypot(p.door.x-x,p.door.z-z)<2.4);
const free=(x,z,r)=>{if(inPlot(x,z,r+.5)||nearDoor(x,z))return false;for(let a=Math.floor(z-r);a<=Math.ceil(z+r);a++)for(let b=Math.floor(x-r);b<=Math.ceil(x+r);b++){if(!inb(b,a)||solid[a*W+b])return false;const t=g[a*W+b];if(t===T.WATER||t===T.ROAD||t===T.BRIDGE)return false}return true};
// bomen in parken en tuinen
for(let i=0;i<12000;i++){const x=6+rng()*(W-12),z=6+rng()*(H-12),t=at(x|0,z|0);
  if((t===T.PARK&&rng()<.55)||(t===T.GARDEN&&rng()<.18)){if(free(x,z,1.6))prop('tree',x,z,{s:.8+rng()*.6,v:ri(0,2),solid:.5})}}
// palmen op het strand
for(let x=12;x<296;x+=ri(9,16)){const z=230+rng()*6;if(free(x,z,1))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
// strandstoelen en parasols
for(let x=16;x<296;x+=ri(7,12)){const z=238+rng()*7;if(at(x|0,z|0)===T.SAND)prop('umbrella',x,z,{v:ri(0,3)})}
// lantaarns langs de wegen (buitenrand van de stoep)
RX.forEach(x=>{for(let z=RZ[0]+12;z<RZ[3]-8;z+=16){[[x-RW-SW+.5,z],[x+RW+SW-.5,z+8]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b))prop('lamp',a,b,{solid:.2})})}});
RZ.forEach(z=>{for(let x=RX[0]+12;x<RX[6]-8;x+=16){[[x,z-RW-SW+.5],[x+8,z+RW+SW-.5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b))prop('lamp',a,b,{solid:.2})})}});
RXE.forEach(x=>{for(let z=RZE[0]+12;z<RZE[4]-8;z+=16){[[x-RW-SW+.5,z],[x+RW+SW-.5,z+8]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b))prop('lamp',a,b,{solid:.2})})}});
RZE.forEach(z=>{for(let x=RXE[0]+12;x<RXE[2]-8;x+=16){[[x,z-RW-SW+.5],[x+8,z+RW+SW-.5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b))prop('lamp',a,b,{solid:.2})})}});
// bomen langs de gracht
for(let z=12;z<246;z+=10){[[183.4,z],[198.6,z+5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.6))prop('tree',a,b,{s:.7,v:1,solid:.4})})}
// Amsterdammertjes langs de gracht en fietsen tegen de reling
for(let z=10;z<246;z+=3){[[182.4,z],[199.6,z]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.3))prop('bollard',a,b,{solid:.15})})}
for(let z=14;z<246;z+=17){const a=183.6,b=z+5;if([b-1.4,b,b+1.4].every(q=>at(a|0,q|0)===T.WALK&&!solid[(q|0)*W+(a|0)])&&!inPlot(a,b,1))prop('bikes',a,b,{rot:1,v:ri(0,4)})}
// bomen langs de stoep in de Westbuurt en het Centrum, prullenbakken
RZ.forEach(z=>{for(let x=RX[0]+10;x<RX[3];x+=13){[[x,z-RW-SW+.6],[x+6,z+RW+SW-.6]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.8))prop('stree',a,b,{s:.8+rng()*.3,v:ri(0,2),solid:.25})})}});
for(let i=0,n=0;i<4000&&n<60;i++){const x=10+rng()*(W-20),z=10+rng()*(H-20);if(at(x|0,z|0)===T.WALK&&free(x,z,.7)&&!M_nearRoadCorner(x,z)){n++;prop('bin',x,z,{solid:.3})}}
// bootjes in de gracht en in het havenkanaal
for(let z=14;z<240;z+=ri(14,26)){const x=rng()<.5?187.3:194.7;prop('boat',x,z,{rot:1,v:ri(0,4),l:ri(5,8)})}
for(let z=20;z<330;z+=ri(18,34)){if([88,140,192].some(q=>Math.abs(q-z)<12))continue;if([[44,54],[100,110],[156,166]].some(([a,b])=>z>a-6&&z<b+6))continue;prop('boat',rng()<.5?380:388,z,{rot:1,v:ri(0,4),l:ri(7,11)})}
// lichtreclame op de daken van de Zuidas
buildings.filter(b=>b.x0>=261&&b.x1<=297&&b.fl>=9).slice(0,5).forEach((b,i)=>prop('billboard',(b.x0+b.x1)/2,(b.z0+b.z1)/2,{y:b.fl*FL+.5,v:i}));
// containers op de kade en de steigers
const free2=(x,z,hw,hd)=>{for(let a=Math.floor(z-hd);a<=Math.ceil(z+hd);a++)for(let b=Math.floor(x-hw);b<=Math.ceil(x+hw);b++){if(!inb(b,a)||solid[a*W+b]||g[a*W+b]!==T.DOCK)return false}return true};
for(let i=0,n=0;i<2400&&n<80;i++){const east=rng()<.5,x=east?412+rng()*142:312+rng()*60,z=east?60+rng()*128:8+rng()*190,rot=rng()<.5?0:1;const w=rot?3:7,d=rot?7:3;
  if(free2(x,z,w/2+.6,d/2+.6)&&!(x<342&&z>80&&z<96)){n++;
    const p=prop('container',x,z,{rot,h:ri(1,3),v:ri(0,4)});block(Math.floor(x-w/2),Math.floor(z-d/2),Math.ceil(x+w/2),Math.ceil(z+d/2))}}
// in elke steeg: een afvalcontainer net bij de binnenplaats (verstopplek), graffiti op de muur en soms een lamp
const hides=[];
alleys.forEach((a,i)=>{const f=a.f,ns=f==='N'||f==='S';
  // eerst naast de uitgang op de binnenplaats, anders in de steeg zelf tegen de muur (er blijft 2 m over om te rennen)
  const ex=f==='N'?[a.cx,a.z1]:f==='S'?[a.cx,a.z0]:f==='W'?[a.x1,a.cz]:[a.x0,a.cz],io=f==='N'||f==='W'?1:-1,C=[];
  [2.8,3.6,-2.8,-3.6].forEach(o=>C.push(ns?[ex[0]+o,ex[1]+io*1.1]:[ex[0]+io*1.1,ex[1]+o]));
  let ok=null;for(const [x,z] of C)if(free(x,z,1.1)){ok=[x,z,0];break}
  if(!ok)ok=ns?[a.x0+.6,f==='N'?a.z1-1.4:a.z0+1.4,1]:[f==='W'?a.x1-1.4:a.x0+1.4,a.z0+.6,1];
  const [x,z,inA]=ok,rot=ns?(inA?1:0):(inA?0:1);prop('dumpster',x,z,{rot,v:i%3});
  if(inA){if(ns)block(a.x0,Math.floor(z-1),a.x0+1,Math.ceil(z+1));else block(Math.floor(x-1),a.z0,Math.ceil(x+1),a.z0+1)}else block(Math.floor(x-.9),Math.floor(z-.9),Math.ceil(x+.9),Math.ceil(z+.9));
  hides.push({x,z,k:'dumpster'});
  const wx=ns?a.x0:a.cx,wz=ns?a.cz:a.z0;
  if(ns?solid[(a.cz|0)*W+(a.x0-1)]:solid[(a.z0-1)*W+(a.cx|0)])prop('graffiti',wx,wz,{ns:ns?1:0,v:i%5,len:Math.min(5,(ns?a.z1-a.z0:a.x1-a.x0)-2)});
  if(i%2===0)prop('lamp',ns?a.x1-.35:a.cx,ns?a.cz:a.z1-.35,{})});
props.filter(p=>p.k==='container').forEach(p=>hides.push({x:p.x,z:p.z,k:'container',r:p.rot?[1.5,3.5]:[3.5,1.5]}));
// Oostland: poorten over de weg aan het eind van de drie havenbruggen
[88,140,192].forEach(z=>{prop('arch',398,z,{});block(397,z-7,399,z-5);block(397,z+5,399,z+7)});
// kranen langs het water
[20,34,77,179].forEach(z=>{prop('crane',337,z,{});block(335,z-2,340,z+2)});
// geparkeerde auto's langs de stoeprand (decor)
for(let i=0;i<120;i++){const vert=rng()<.5;if(vert){const x=pick(RX),side=rng()<.5?-1:1,z=RZ[0]+8+rng()*(RZ[3]-RZ[0]-16);if(RZ.some(q=>Math.abs(q-z)<9))continue;prop('car',x+side*(RW-1.2),z,{rot:1,v:ri(0,6),dir:side})}
  else{const z=pick(RZ),side=rng()<.5?-1:1,x=RX[0]+8+rng()*(RX[6]-RX[0]-16);if(RX.some(q=>Math.abs(q-x)<9)||(x>174&&x<208))continue;prop('car',x,z+side*(RW-1.2),{rot:0,v:ri(0,6),dir:side})}}
// geparkeerde auto's op Oostland (langs de stoeprand)
for(let i=0;i<46;i++){const vert=rng()<.5;if(vert){const x=pick(RXE),side=rng()<.5?-1:1,z=RZE[0]+8+rng()*(RZE[4]-RZE[0]-16);if(RZE.some(q=>Math.abs(q-z)<9)||[88,140,192].some(q=>Math.abs(q-z)<9&&x===RXE[0]))continue;prop('car',x+side*(RW-1.2),z,{rot:1,v:ri(0,6),dir:side})}
  else{const z=pick(RZE),side=rng()<.5?-1:1,x=RXE[0]+8+rng()*(RXE[2]-RXE[0]-16);if(RXE.some(q=>Math.abs(q-x)<9))continue;prop('car',x,z+side*(RW-1.2),{rot:0,v:ri(0,6),dir:side})}}
// wrakken op het autokerkhof
[[315,124],[315,131],[315,138],[321,124],[321,131],[321,138]].forEach(([x,z],i)=>{prop('wreck',x+1.5,z+2,{h:1+(i%3),v:i});block(x,z,x+3,z+5)});
// politieauto's voor het bureau, standbeeld op het plein, bankjes in het park
[[146,129],[154,129],[162,129]].forEach(([x,z])=>prop('police',x,z,{rot:1}));
prop('statue',229,119,{solid:2.2});
for(let i=0,n=0;i<3000&&n<30;i++){const x=6+rng()*372,z=6+rng()*244;if(at(x|0,z|0)===T.PARK&&free(x,z,1.4)){n++;prop('bench',x,z,{rot:ri(0,3),solid:.6})}}
// heg om de villa, muur om de bajes (met poort)
(function(){const hedge=(x0,z0,x1,z1)=>{for(let x=x0;x<x1;x+=2)for(let z=z0;z<z1;z+=2)prop('hedge',x+1,z+1,{})};
  hedge(46,6,116,8);hedge(46,6,48,29);hedge(114,6,116,29);hedge(46,27,76,29);hedge(86,27,116,29);
  block(46,6,116,8);block(46,6,48,29);block(114,6,116,29);block(46,27,76,29);block(86,27,116,29);
  const wall=(x0,z0,x1,z1)=>{props.push({k:'wall',x0,z0,x1,z1});block(x0,z0,x1,z1)};
  wall(262,7,336,9);wall(262,7,264,29);wall(334,7,336,29);wall(262,27,296,29);wall(302,27,336,29);
  [[263,8],[335,8],[263,28],[335,28]].forEach(([x,z])=>prop('tower',x,z,{}));
  prop('gate',299,28,{});block(296,27,302,29);   // de poort is dicht: binnenkomen gaat via de ingang
})();
// steigerpalen en relingen op de bruggen tekenen we in de wereld zelf; hier alleen de plekken
props.filter(p=>p.k==='hedge').forEach((p,i)=>{if(i%3===0)hides.push({x:p.x,z:p.z,k:'hedge'})});
const bridges=[];RZ.forEach(z=>bridges.push({x0:185,x1:197,z0:z-RW-SW,z1:z+RW+SW}));[88,140,192].forEach(z=>bridges.push({x0:340,x1:392,z0:z-RW,z1:z+RW}));

/* ---------- waar je begint ---------- */
const spawn={x:229,z:126};

/* ---------- lopen en routes ---------- */
const walkable=(x,z)=>{x=Math.floor(x);z=Math.floor(z);return inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER};
// vrij voor een rondje met straal r (botsen tegen muren)
function canStand(x,z,r){r=r||.35;return walkable(x-r,z-r)&&walkable(x+r,z-r)&&walkable(x-r,z+r)&&walkable(x+r,z+r)}
// dichtstbijzijnde plek waar je kunt staan
function nearestWalk(x,z,max){max=max||40;if(canStand(x,z))return{x,z};for(let r=1;r<=max;r++)for(let a=0;a<r*8;a++){const t=a/(r*8)*Math.PI*2,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;if(canStand(px,pz))return{x:px,z:pz}}return null}
// A* over het raster (8 richtingen, niet schuin langs hoeken), daarna rechte stukken waar dat kan
function findPath(ax,az,bx,bz){
  const s=nearestWalk(ax,az,6),e=nearestWalk(bx,bz,30);if(!s||!e)return null;
  const sx=Math.floor(s.x),sz=Math.floor(s.z),ex=Math.floor(e.x),ez=Math.floor(e.z),N=W*H;
  const ok=(x,z)=>inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER;
  const gs=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const heap=[],hf=[];const push=(i,f)=>{heap.push(i);hf.push(f);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[heap[p],heap[k]]=[heap[k],heap[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const top=heap[0],lf=hf.pop(),li=heap.pop();if(heap.length){heap[0]=li;hf[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return top};
  const h=(x,z)=>{const dx=Math.abs(x-ex),dz=Math.abs(z-ez);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
  const si=sz*W+sx,ei=ez*W+ex;gs[si]=0;push(si,h(sx,sz));let n=0;
  const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
  while(heap.length&&n++<200000){const i=pop();if(i===ei)break;if(closed[i])continue;closed[i]=1;const x=i%W,z=(i/W)|0;
    for(const [dx,dz,c] of D){const nx=x+dx,nz=z+dz;if(!ok(nx,nz))continue;if(dx&&dz&&(!ok(x+dx,z)||!ok(x,z+dz)))continue;
      // liever over de stoep dan over de weg (wegen kosten iets meer)
      const ni=nz*W+nx,tt=g[ni],cost=c*(tt===T.ROAD?1.6:1);const ng=gs[i]+cost;if(ng<gs[ni]){gs[ni]=ng;from[ni]=i;push(ni,ng+h(nx,nz))}}}
  if(from[ei]<0&&ei!==si)return null;
  const raw=[];for(let i=ei;i!==-1&&i!==si;i=from[i])raw.push([i%W+.5,((i/W)|0)+.5]);raw.reverse();
  // gladstrijken: sla tussenpunten over zolang de lijn vrij is
  const clear=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.ceil(L*3);for(let k=0;k<=n;k++){const x=a[0]+dx*k/n,z=a[1]+dz*k/n;if(!canStand(x,z,.3))return false}return true};
  const out=[];let cur=[s.x,s.z];for(let k=0;k<raw.length;){let j=raw.length-1;while(j>k&&!clear(cur,raw[j]))j--;out.push(raw[j]);cur=raw[j];k=j+1}
  if(out.length)out[out.length-1]=[e.x,e.z];
  return out.map(([x,z])=>({x,z}));
}

// in welke wijk sta je (voor de naam in beeld en op de minikaart)
function districtAt(x,z){
  if(x>=392){if(z<49)return 'IJ-oever';if(z<120)return 'Bedrijventerrein';if(z<199)return 'Oosterstraat';if(z<275)return 'Villawijk';return 'Tuinwijk'}
  if(x>=340)return 'Havenkanaal';
  if(x>=211&&x<247&&z>=88&&z<137)return 'Het Plein';
  if(x>=180&&x<202)return 'De Gracht';
  if(z<33)return x<120?'Villapark':x<197?'Noorderpark':x<258?'Noordkade':'De Bajes';
  if(z>=197)return z>=226?'Het Strand':'Boulevard';
  if(x<26)return 'Westkust';if(x<126)return 'Westbuurt';if(x<180)return 'Centrum';if(x<258)return 'Oud-Zuid';if(x<308)return 'Zuidas';return 'De Haven'}
// wegennet voor het verkeer: knooppunten (kruisingen en doodlopende einden) en stukken weg ertussen
const NET=(function(){const V=[],Hz=[];RX.forEach(x=>V.push({x,a:RZ[0],b:RZ[3]}));RXE.forEach(x=>V.push({x,a:RZE[0],b:RZE[4]}));
  RZ.forEach(z=>Hz.push({z,a:RX[0],b:RX[6]}));[88,140,192].forEach(z=>Hz.push({z,a:RX[6],b:RXE[0]}));RZE.forEach(z=>Hz.push({z,a:RXE[0],b:RXE[2]}));
  const key=(x,z)=>x+','+z,nodes={};const node=(x,z)=>nodes[key(x,z)]||(nodes[key(x,z)]={x,z,n:[]});
  V.forEach(v=>{const zs=new Set([v.a,v.b]);Hz.forEach(h=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)zs.add(h.z)});const L=[...zs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A=node(v.x,L[i]),B=node(v.x,L[i+1]);A.n.push(B);B.n.push(A)}});
  Hz.forEach(h=>{const xs=new Set([h.a,h.b]);V.forEach(v=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)xs.add(v.x)});const L=[...xs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A=node(L[i],h.z),B=node(L[i+1],h.z);if(!A.n.includes(B)){A.n.push(B);B.n.push(A)}}});
  return Object.values(nodes)})();
function setSolid(r,on){block(Math.floor(r.x0),Math.floor(r.z0),Math.ceil(r.x1),Math.ceil(r.z1),on?1:0)}
root.STAD_MAP={NET,districtAt,setSolid,ESTATE,EST_H,EST_B,BIZ_LOOK,alleys,hides,estateAt:(x,z)=>x>=ESTATE.x0,RXE,RZE,W,H,FL,T,RX,RZ,RW,SW,ground:g,solid,bridgeWalk,buildings,props,places,bridges,DISTRICTS,spawn,jailGate,
  at,walkable,canStand,nearestWalk,findPath,placeById:id=>places.find(p=>p.id===id),placeByPage:pg=>places.find(p=>p.page===pg)};
})(typeof window!=='undefined'?window:globalThis);
