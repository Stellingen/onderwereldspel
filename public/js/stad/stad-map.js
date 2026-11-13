// Pixelstad: de kaart. Wegen, water, gebouwen, ingangen en spullen op straat, plus de route-planner.
// Puur rekenwerk (geen tekenwerk), dus ook in node te testen. 1 eenheid = 1 meter; x loopt naar het oosten, z naar het zuiden.
//
// Indeling (november 2026, de grote stad): één eiland in zee, met een klein eiland in het zuidoosten.
//  - Noorden: de haven en de industrie. De Bajes (noordwest), het containerterrein en de kade, het Noorderpark,
//    De Haven (garage, autokerkhof, havenloods, pier en hangar), en de IJ-oever en het Bedrijventerrein waar de grote
//    zaken komen die niet in een woonwijk passen (transport, groothandel, importeur, haven, jet, rederij, kantoren).
//  - Midden: het Centrum met de gracht dwars erdoor, Het Plein met Café Het Gat, het casino, de bank, het politiebureau,
//    Oud-Zuid en de torens van de Zuidas. Westbuurt en Villapark in het westen.
//  - Zuiden: de Boulevard (winkels, horeca, toerisme: de zaken die je in de stad koopt) en het strand. In het zuidoosten de
//    Oosterstraat, de uitgaansstrook.
//  - Oosten, over het havenkanaal: Oostland, jouw gebied. Van een kraakpand en een kamer tot penthouses aan het kanaal.
//  - Zuidoost, over de brug: Het Eiland. Villa Cosa Nostra en de grootste villa's. Daar woont de peetvader.
// Wegen zijn 12 m breed (RW = 6 halve breedte) met stoepen van 4 m. Alle wegen liggen op één raster (VR en HR).
(function(root){
'use strict';
const W=800,H=660,RW=6,SW=4,FL=3.4,LANE=3;
const XS=[40,110,180,250,320,400,470,540,640,710,775];   // noord-zuid wegen (midden)
const ZS=[40,105,170,240,310,380,450,515];                 // oost-west wegen (midden)
const T={GRASS:0,ROAD:1,WALK:2,WATER:3,SAND:4,PLAZA:5,LOT:6,DOCK:7,YARD:8,BRIDGE:9,PARK:10,GARDEN:11};
const g=new Uint8Array(W*H),solid=new Uint8Array(W*H);
const rng=(s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296})(20261112);
const ri=(a,b)=>a+Math.floor(rng()*(b-a+1)),pick=a=>a[Math.floor(rng()*a.length)];
const inb=(x,z)=>x>=0&&z>=0&&x<W&&z<H;
const at=(x,z)=>inb(x,z)?g[z*W+x]:T.WATER;
function set(x0,z0,x1,z1,t,only){for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++){const i=z*W+x;if(only==null||only.includes(g[i]))g[i]=t}}
function block(x0,z0,x1,z1,v){for(let z=Math.max(0,z0);z<Math.min(H,z1);z++)for(let x=Math.max(0,x0);x<Math.min(W,x1);x++)solid[z*W+x]=v==null?1:v}
// blok tussen twee wegen (binnenkant, zonder stoep)
const bx=i=>[XS[i]+RW+SW,XS[i+1]-RW-SW],bz=j=>[ZS[j]+RW+SW,ZS[j+1]-RW-SW];

/* ---------- grond: zee, eilanden, strand, gracht, havenkanaal ---------- */
g.fill(T.WATER);
set(16,14,790,548,T.GRASS);                                   // het grote eiland
set(16,525,580,548,T.SAND);                                   // strand
set(596,574,790,652,T.GRASS);                                 // Het Eiland
set(200,14,790,30,T.DOCK);                                    // de kade langs de noordkust
set(352,176,368,548,T.WATER);                                 // de gracht
set(580,176,612,548,T.WATER);                                 // het havenkanaal
set(762,638,790,652,T.WATER);                                 // jachthaventje op Het Eiland
// steigers in het noorden (de pier van De Haven)
set(588,4,604,14,T.DOCK);set(700,4,712,14,T.DOCK);

/* ---------- wegen en stoepen (over water worden het bruggen) ---------- */
const VR=XS.map(x=>({x,a:ZS[0],b:ZS[ZS.length-1]}));
const HR=ZS.map(z=>({z,a:XS[0],b:XS[XS.length-1]}));
VR.find(v=>v.x===110).a=ZS[1];                               // De Bajes ligt over deze weg heen
VR.push({x:640,a:515,b:610});                                 // de brug naar Het Eiland
HR.push({z:610,a:640,b:770});                                 // de weg over Het Eiland
const roads=[];VR.forEach(v=>roads.push([v.x-RW,v.a-RW,v.x+RW,v.b+RW]));HR.forEach(h=>roads.push([h.a-RW,h.z-RW,h.b+RW,h.z+RW]));
roads.forEach(([x0,z0,x1,z1])=>{for(let z=z0;z<z1;z++)for(let x=x0;x<x1;x++){if(!inb(x,z))continue;const i=z*W+x;g[i]=g[i]===T.WATER?T.BRIDGE:T.ROAD}});
const isRoad=t=>t===T.ROAD||t===T.BRIDGE;
const bridgeWalk=new Uint8Array(W*H);
roads.forEach(([x0,z0,x1,z1])=>{for(let z=z0-SW;z<z1+SW;z++)for(let x=x0-SW;x<x1+SW;x++){if(!inb(x,z))continue;const i=z*W+x,t=g[i];
  if(isRoad(t))continue;if(t===T.WATER){g[i]=T.BRIDGE;bridgeWalk[i]=1}else if(t!==T.SAND)g[i]=T.WALK}});
// kades langs de gracht (je kunt langs het water lopen)
set(346,176,352,548,T.WALK,[T.GRASS,T.SAND]);set(368,176,374,548,T.WALK,[T.GRASS,T.SAND]);
set(574,176,580,548,T.WALK,[T.GRASS,T.SAND]);                // kade langs het havenkanaal (stadskant)
set(16,521,580,525,T.WALK,[T.SAND,T.GRASS]);                 // stoep tussen boulevard en strand

/* ---------- gebouwen en plekken ---------- */
const buildings=[],props=[],places=[],reserved=[];
const over=(a,b)=>a[0]<b[2]&&a[2]>b[0]&&a[1]<b[3]&&a[3]>b[1];
function addB(b){b.i=buildings.length;buildings.push(b);set(b.x0,b.z0,b.x1,b.z1,T.LOT);block(b.x0,b.z0,b.x1,b.z1);return b}
const doorOf=(f,o,mx,mz)=>f==='N'?{x:mx,z:o.z0-1.2}:f==='S'?{x:mx,z:o.z1+1.2}:f==='W'?{x:o.x0-1.2,z:mz}:{x:o.x1+1.2,z:mz};
function place(o){const r=[o.x0,o.z0,o.x1,o.z1];reserved.push(o.res||r);
  const mx=o.dx!=null?o.dx:(o.x0+o.x1)/2,mz=o.dz!=null?o.dz:(o.z0+o.z1)/2;
  if(o.dyn){set(o.x0,o.z0,o.x1,o.z1,T.LOT);const pl=Object.assign({},o,{door:doorOf(o.face,o,mx,mz),b:-1,rect:{x0:o.x0,z0:o.z0,x1:o.x1,z1:o.z1}});places.push(pl);return pl}
  const parts=(o.parts||[r]).map((p,k)=>addB({x0:p[0],z0:p[1],x1:p[2],z1:p[3],fl:p[4]||o.fl,st:p[5]||o.st,roof:p[6]||o.roof||'flat',pl:o.id,main:k===0}));
  const pl=Object.assign({},o,{door:doorOf(o.face,o,mx,mz),b:parts[0].i});delete pl.parts;places.push(pl);return pl}

/* --- De Bajes (noordwest): binnenplaats met muur, de poort aan de straatkant (zuid) --- */
set(50,50,170,95,T.YARD);
place({id:'jail',page:'jail',name:'De Bajes',sign:'BAJES',st:'jail',fl:4,face:'S',dx:110,x0:80,z0:56,x1:140,z1:78,res:[48,48,172,97],ic:'jail'});
const jailGate={x:110,z:95.5};
places.find(p=>p.id==='jail').door={x:110,z:96.6};

/* --- het Centrum --- */
const [c4x0,c4x1]=bx(3),[c6x0,c6x1]=bx(5),[c7x0,c7x1]=bx(6);
const [r2z0,r2z1]=bz(2),[r3z0,r3z1]=bz(3),[r4z0,r4z1]=bz(4),[r5z0,r5z1]=bz(5);
place({id:'bank',page:'bank',name:'Nederlandsche Onderbank',sign:'BANK',st:'bank',fl:4,face:'S',x0:c4x0+2,z0:r2z0+2,x1:c4x1-2,z1:r2z1-8,res:[c4x0,r2z0,c4x1,r2z1],ic:'bank'});
set(c4x0,r2z1-8,c4x1,r2z1,T.PLAZA,[T.GRASS]);
place({id:'casino',page:'casino',name:'Casino Royaal',sign:'CASINO',st:'casino',fl:3,face:'S',x0:c6x0+2,z0:r2z0+2,x1:c6x1-2,z1:r2z1-8,
  parts:[[c6x0+2,r2z0+2,c6x1-2,r2z1-8,3],[c6x0+12,r2z0+7,c6x1-12,r2z1-14,11,'casino']],res:[c6x0,r2z0,c6x1,r2z1],ic:'casino'});
set(c6x0,r2z1-8,c6x1,r2z1,T.PLAZA,[T.GRASS]);
place({id:'politie',page:'politie',name:'Politiebureau',sign:'POLITIE',st:'police',fl:3,face:'S',x0:c4x0+2,z0:r3z0+2,x1:c4x1-2,z1:r3z1-12,res:[c4x0,r3z0,c4x1,r3z1],ic:'politie'});
set(c4x0,r3z1-12,c4x1,r3z1,T.PLAZA,[T.GRASS]);
// Het Plein: het hele blok, met Café Het Gat aan de noordkant
set(c6x0,r3z0,c6x1,r3z1,T.PLAZA,[T.GRASS]);
place({id:'crimes',page:'crimes',name:'Café Het Gat',sign:'HET GAT',st:'pub',fl:3,face:'S',x0:c6x0+1,z0:r3z0+1,x1:c6x0+19,z1:r3z0+12,ic:'crimes',roof:'gableX'});
place({id:'biz',page:'biz',name:'Notaris De Sleutel',sign:'NOTARIS',st:'plaster',fl:4,face:'N',x0:c4x0+2,z0:r4z0,x1:c4x0+22,z1:r4z0+15,ic:'biz'});
place({id:'wit',page:'wit',name:'Wasserette Schoon Geld',sign:'WASSERETTE',st:'shop',fl:2,face:'N',x0:c6x0+2,z0:r4z0,x1:c6x0+18,z1:r4z0+13,ic:'wit'});
place({id:'hits',page:'hits',name:'Het Contact',sign:'CONTACT',st:'brick2',fl:3,face:'W',x0:c7x0,z0:r3z0+10,x1:c7x0+14,z1:r3z0+24,ic:'hits'});
place({id:'shop',page:'shop',name:'Wapenhandel Kogel & Zn',sign:'WAPENS',st:'gun',fl:2,face:'N',x0:c7x0+2,z0:r4z0,x1:c7x0+18,z1:r4z0+13,ic:'shop'});
place({id:'look',page:'look',name:'Kledingzaak Maatwerk',sign:'KLEDING',st:'boutique',fl:2,face:'N',x0:c4x0+2,z0:r5z0,x1:c4x0+26,z1:r5z0+14,ic:'look'});
/* --- het westen --- */
const [c2x0,c2x1]=bx(1),[c1x0,c1x1]=bx(0);
place({id:'skills',page:'skills',name:'Sportschool De Bokszak',sign:'GYM',st:'gym',fl:2,face:'N',x0:c2x0+2,z0:r4z0,x1:c2x0+28,z1:r4z0+14,ic:'skills'});
/* --- het zuiden: spa aan de boulevard --- */
const [r6z0,r6z1]=bz(6);
place({id:'relax',page:'relax',name:'Spa Zeezicht',sign:'SPA',st:'beach',fl:2,face:'S',x0:c1x0+2,z0:r6z1-16,x1:c1x0+30,z1:r6z1,ic:'relax'});
/* --- De Haven (noord) --- */
const [r0z0,r0z1]=bz(0),[r1z0,r1z1]=bz(1),[c8x0,c8x1]=bx(7),[c9x0,c9x1]=bx(8),[c10x0,c10x1]=bx(9);
place({id:'werk',page:'werk',name:'Havenloods 7',sign:'HAVEN',st:'ware',fl:3,face:'S',x0:c7x0+1,z0:r0z0+6,x1:c7x1-1,z1:r0z1,ic:'werk'});
place({id:'cars',page:'cars',name:'Garage Van der Plaat',sign:'GARAGE',st:'garage',fl:2,face:'S',x0:c6x0+2,z0:r1z0+6,x1:c6x1-4,z1:r1z1,ic:'cars'});
place({id:'sloop',page:'cars',name:'Autokerkhof De Sloop',sign:'AUTOKERKHOF',st:'ware2',fl:1,face:'S',x0:c7x0+30,z0:r1z1-12,x1:c7x1,z1:r1z1,res:[c7x0,r1z0,c7x1,r1z1],ic:'cars'});
set(c7x0,r1z0,c7x1,r1z1,T.YARD);
// de hangar op de pier (alleen decor, met bewaking in een missie)
addB({x0:c8x0+20,z0:r0z0+4,x1:c8x0+56,z1:r0z0+30,fl:3,st:'ware',roof:'gableZ'});set(c8x0,r0z0,c8x1,r0z1,T.DOCK);set(c8x0+20,r0z0+4,c8x0+56,r0z0+30,T.LOT);
// containerterrein (het oude haventerrein): kade met containers
set(...[bx(3)[0],r0z0,bx(3)[1],r0z1],T.DOCK);set(...[bx(2)[0],r0z0,bx(2)[1],r0z1],T.DOCK);set(bx(4)[0],r0z0,bx(4)[1],r0z1,T.DOCK);set(c6x0,r0z0,c6x1,r0z1,T.DOCK);
/* --- Het Eiland: Villa Cosa Nostra --- */
set(670,576,762,602,T.GARDEN);
place({id:'fam',page:'fam',name:'Villa Cosa Nostra',sign:'FAMILIE',st:'villa',fl:3,face:'S',x0:696,z0:580,x1:734,z1:598,res:[668,574,764,603],ic:'fam'});

/* --- kavels: woningen (Oostland en Het Eiland) en zaken (industrie in het noorden, winkels en horeca in het zuiden) --- */
const ESTATE={x0:612,z0:176,x1:790,z1:548,n:'Oostland',gate:{x:624,z:310}};
const EST_H=[],EST_B=[];
const [c9a,c9b]=bx(8),[c10a,c10b]=bx(9);
// Oostland noord: penthouses aan het kanaal
EST_H.push(['penthouse',c9a,r2z0,c9a+25,r2z0+31,'N'],['ijpent',c9a+25,r2z0,c9b,r2z0+31,'N'],['omval',c10a,r2z0,c10a+25,r2z0+31,'N']);
// Oostland midden: grachtenpanden, kraakpand, kamers
EST_H.push(['gracht',c9a,r3z0,c9a+15,r3z0+28,'N'],['jordaan',c9a+16,r3z0,c9a+29,r3z0+28,'N']);
EST_B.push(['boven',c9a+30,r3z0,c9a+45,r3z0+29,'N'],['studenten',c10a,r3z0,c10a+13,r3z0+29,'N'],['winkelpand',c10a+14,r3z0,c10b,r3z0+28,'N']);
EST_H.push(['kraak',c9a,r4z0,c9a+30,r4z0+26,'N'],['kamer',c9a+31,r4z0,c9a+47,r4z0+26,'N'],['studio',c10a,r4z0,c10a+16,r4z0+26,'N']);
EST_B.push(['markt',c10a+18,r4z0,c10a+36,r4z0+20,'N'],['garagebox',c9a,r5z0,c9a+22,r5z0+20,'N'],['parkeer',c9a+24,r5z0,c9a+46,r5z0+20,'N']);
// Het Eiland: villa's en een woonboot
EST_H.push(['villa',622,620,656,648,'N'],['gooi',668,620,728,650,'N'],['boot',766,638,782,646,'N']);
// noord: de industrie (zaken die niet in een woonwijk passen)
const IND=[['autogarage',15],['dealer',15],['garage',15],['wasstraat',15],['taxi',15],['verhuur',15],['importeur',15],['bedrijfshal',15],['koerier',15],['groothandel',15],['transport',22],['diamant',22]];
function row(list,x0,x1,z0,z1,face,out){let x=x0;list.forEach(([id,w])=>{if(x+w>x1+.01)return;out.push([id,x,z0,x+w,z1,face]);x+=w+1})}
row(IND.slice(0,5),c8x0,c8x1,r1z0,r1z0+20,'N',EST_B);row(IND.slice(5,10),c8x0,c8x1,r1z1-20,r1z1,'S',EST_B);
row(IND.slice(10,12),c9x0,c9x1,r1z0,r1z0+22,'N',EST_B);
row([['port',22],['jet',26]],c9x0,c9x1,r0z0+2,r0z1,'S',EST_B);
row([['rederij',22],['vastgoed',22]],c10x0,c10x1,r0z0+2,r0z1,'S',EST_B);row([['kantoor',24]],c10x0,c10x1,r1z0,r1z0+22,'N',EST_B);
// zuid en zuidoost: winkels, horeca en toerisme (zaken in de stad)
const LOC_N=[['wash',15],['avond',15],['nagel',15],['shop',15],['barber',15],['sport',15],['wissel',15],['juwelier',15],['fiets',15],['souvenir',15],['coffeeshop',16],['hostel',16]];
const LOC_S=[['snack',15],['pizza',15],['bruin',15],['shisha',15],['restaurant',15],['club',15],['speelhal',15],['beach',15],['rondvaart',15],['galerie',15],['hotel',16],['gcasino',16]];
[[2,0],[3,3],[5,6],[6,9]].forEach(([ci,k])=>{const [a,b]=bx(ci);row(LOC_N.slice(k,k+3),a,b,r6z0,r6z0+19,'N',EST_B);row(LOC_S.slice(k,k+3),a,b,r6z1-19,r6z1,'S',EST_B)});
// hoe elk pand eruitziet: stijl, verdiepingen bij aankoop, + per upgrade-niveau, + per 3 vestigingen, maximum, dak
const BIZ_LOOK={wash:['shop',1,.5,0,3],avond:['shop',1,.5,0,3],nagel:['boutique',1,.5,0,3],shop:['shop',1,.5,0,3],barber:['boutique',1,.5,0,3],sport:['gym',1,.5,0,3],wissel:['shop',1,.5,0,3],juwelier:['boutique',1,.5,0,3],
  fiets:['shop',1,.5,0,2],souvenir:['shop',1,.5,0,3],coffeeshop:['pub',1,.5,0,3],hostel:['brick2',2,1,0,6,'gableZ'],rondvaart:['beach2',1,.5,0,2],galerie:['glass2',1,.5,0,3],
  snack:['beach2',1,.5,0,3],pizza:['pub',1,.5,0,3],bruin:['pub',2,.5,0,4,'gableX'],shisha:['pub',2,.5,0,4],restaurant:['plaster',2,.5,0,4],club:['club',2,.5,0,4],speelhal:['casino',2,.5,0,4],beach:['beach',1,.5,0,3],
  hotel:['villa',3,1,1,10],gcasino:['casino',3,1,1,8],
  wasstraat:['garage',1,.5,0,2],taxi:['garage',1,.5,0,3],autogarage:['garage',1,.5,0,3],dealer:['glass2',1,.5,0,3],garage:['ware2',2,.5,0,4],verhuur:['garage',1,.5,0,3],importeur:['glass',2,.5,0,5],
  markt:['shop',1,0,0,1],koerier:['ware',1,.5,0,3],groothandel:['ware2',2,.5,0,4],transport:['ware',2,.5,0,4],port:['ware',2,.5,0,4],diamant:['glass',2,1,0,6],rederij:['glass2',4,2,1,16],jet:['garage',2,.5,0,3,'gableZ'],
  garagebox:['garage',1,0,0,1],boven:['brick',2,1,1,8,'gableX'],studenten:['brick3',3,1,1,9,'gableX'],winkelpand:['plaster',2,1,1,7],parkeer:['concrete',2,1,1,8],bedrijfshal:['ware',1,.5,1,4],vastgoed:['glass',5,2,1,20],kantoor:['glass2',4,2,1,18]};
// vijver in de Tuinwijk
const [r6a,r6b]=bz(6);set(c10a+4,r6a+4,c10b-4,r6b-6,T.WATER);
// gratis slaapplek: op de kade onder de brug over de gracht
place({id:'plot_brug',plot:'brug',zone:'brug',hid:'brug',page:'verblijf',name:'Onder de brug',sign:'KAVEL',face:'E',x0:346,z0:321,x1:349,z1:327,ic:'verblijf',dyn:'plot'});set(346,321,349,327,T.WALK);
EST_H.forEach(([id,x0,z0,x1,z1,f])=>{place({id:'plot_'+id,plot:id,zone:id,hid:id,page:'verblijf',name:'Kavel',sign:'KAVEL',face:f,x0,z0,x1,z1,ic:'verblijf',dyn:'plot',est:1});
  if(id!=='boot')set(x0,z0,x1,z1,T.GARDEN)});
EST_B.forEach(([b,x0,z0,x1,z1,f])=>place({id:'biz_'+b,biz:b,page:'biz',name:'Kavel',sign:'TE KOOP',face:f,x0,z0,x1,z1,ic:'biz',dyn:'biz',est:1}));

/* --- straten vol panden --- */
const STY={west:['brick','brick','brick2','plaster','brick3'],centrum:['plaster','brick','brick2','shop','brick3'],zuid:['glass','glass2','concrete'],haven:['ware','ware2'],strand:['beach','beach2'],noord:['concrete','glass2'],villa:['villa','plaster','brick3'],gracht:['brick','brick2','brick3','plaster']};
const alleys=[];
function fill(x0,z0,x1,z1,o){
  const d=o.d||ri(o.dmin,o.dmax),gap=o.gap||0;
  const alley=(f,a,b)=>{const r=f==='N'?[a,z0,b,z0+d]:f==='S'?[a,z1-d,b,z1]:f==='W'?[x0,a,x0+d,b]:[x1-d,a,x1,b];if(!reserved.some(q=>over(q,r)))alleys.push({x0:r[0],z0:r[1],x1:r[2],z1:r[3],f,cx:(r[0]+r[2])/2,cz:(r[1]+r[3])/2})};
  const side=(ax,bx_,mk,f)=>{let x=ax,made=0;const mid=(ax+bx_)/2;while(x<bx_){let w=ri(o.wmin,o.wmax);if(bx_-x-w<o.wmin)w=bx_-x;if(((gap&&rng()<gap)||(!made&&x>=mid-5))&&x>ax&&bx_-x>o.wmin+3){alley(f,x,x+3);made=1;x+=3;continue}mk(x,Math.min(bx_,x+w));x+=w}};
  const B=(a,b,c,e,f)=>{const r=[a,b,c,e];if(c-a<3||e-b<3||reserved.some(q=>over(q,r)))return;
    addB({x0:a,z0:b,x1:c,z1:e,fl:ri(o.fmin,o.fmax),st:pick(o.st),roof:o.roof?(f==='N'||f==='S'?'gableX':'gableZ'):'flat',front:f})};
  side(x0,x1,(a,b)=>B(a,z0,b,z0+d,'N'),'N');
  side(x0,x1,(a,b)=>B(a,z1-d,b,z1,'S'),'S');
  if(z1-z0>2*d+o.wmin){side(z0+d,z1-d,(a,b)=>B(x0,a,x0+d,b,'W'),'W');side(z0+d,z1-d,(a,b)=>B(x1-d,a,x1,b,'E'),'E')}
  set(x0+d,z0+d,x1-d,z1-d,o.inner||T.GARDEN,[T.GRASS]);
}
const WEST={wmin:6,wmax:9,dmin:11,dmax:14,fmin:3,fmax:5,st:STY.west,roof:1,gap:.15};
const CEN={wmin:7,wmax:12,dmin:12,dmax:15,fmin:4,fmax:6,st:STY.centrum,gap:.14};
const ZUID={wmin:12,wmax:18,dmin:13,dmax:17,fmin:8,fmax:16,st:STY.zuid,gap:.22,inner:T.PLAZA};
const TUIN={wmin:7,wmax:9,dmin:10,dmax:12,fmin:2,fmax:3,st:STY.west,roof:1,gap:.2};
const VILLA={wmin:14,wmax:18,dmin:14,dmax:16,fmin:2,fmax:3,st:STY.villa,roof:1,gap:.4};
// westen: Westkust (park langs het water), Westbuurt, Villapark
set(16,176,30,515,T.PARK);
[2,3,4,5].forEach(j=>[0,1,2].forEach(i=>{if(i===0&&j===2){const [a,b]=bx(0),[c,d]=bz(2);set(a,c,b,d,T.PARK);return}const [a,b]=bx(i),[c,d]=bz(j);fill(a,c,b,d,WEST)}));
[0,1,2].forEach(i=>{const [a,b]=bx(i),[c,d]=bz(1);set(a,c,b,d,T.GARDEN);fill(a,c,b,d,VILLA)});
// centrum
[[3,4],[3,5],[5,4],[5,5]].forEach(([i,j])=>{const [a,b]=bx(i),[c,d]=bz(j);fill(a,c,b,d,CEN)});
// gracht: smalle grachtenpanden aan beide kades
[2,3,4,5,6].forEach(j=>{const [c,d]=bz(j);[[330,346],[374,390]].forEach(([a,b])=>{let z=c;while(z<d-4){const w=ri(6,8);const e=Math.min(d,z+w);if(e-z>=4&&!reserved.some(q=>over(q,[a,z,b,e])))addB({x0:a,z0:z,x1:b,z1:e,fl:ri(3,5),st:pick(STY.gracht),roof:'gableZ',front:a<352?'E':'W'});z=e+(rng()<.2?3:0)}})});
// Het Plein: panden langs de randen, open midden
[[c6x0+21,r3z0+1,c6x0+34,r3z0+11,4],[c6x0+35,r3z0+1,c6x1-1,r3z0+11,5],[c6x1-11,r3z0+14,c6x1-1,r3z0+30,4],[c6x1-11,r3z0+32,c6x1-1,r3z1-1,5]].forEach(([a,b,c,e,f])=>addB({x0:a,z0:b,x1:c,z1:e,fl:f,st:pick(STY.centrum),roof:'flat'}));
// Zuidas: torens (en de strook tussen de Zuidas en het havenkanaal)
[2,3,4,5].forEach(j=>{const [c,d]=bz(j);fill(c7x0,c,c7x1,d,ZUID);fill(c8x0,c,574,d,Object.assign({},ZUID,{wmin:10,wmax:14,dmin:12,dmax:14}))});
// zuid: tussen de zakenkavels en het strand een paar strandtenten; bouwplaats aan de boulevard
const [c3x0,c3x1]=bx(2);
(function(){let x=20;while(x<574){const w=ri(9,13);const r=[x,526,x+w,534];if(x+w<574&&rng()<.45&&!(x>340&&x<380))addB({x0:x,z0:526,x1:x+w,z1:534,fl:1,st:pick(STY.strand),roof:'flat'});x+=w+ri(10,18)}})();
const BOUW={x0:bx(1)[0],z0:r6z0,x1:bx(1)[1],z1:r6z1};set(BOUW.x0,BOUW.z0,BOUW.x1,BOUW.z1,T.YARD);
// Oosterstraat (zuidoost, tussen Zuidas en kanaal, rij 6): horeca-panden
fill(c7x0,r6z0,c7x1,r6z1,Object.assign({},CEN,{st:['club','pub','casino','plaster']}));fill(c8x0,r6z0,574,r6z1,Object.assign({},CEN,{st:['club','pub','plaster']}));
// Oostland: tuinwijk (rijtjes) waar geen kavels zijn
[[9,4],[9,5]].forEach(([i,j])=>{const [a,b]=bx(i),[c,d]=bz(j);fill(a,c+(j===4?22:0),b,d,TUIN)});
{const [a,b]=bx(8),[c,d]=bz(6);fill(a,c,b,d,TUIN)}
{const [a,b]=bx(8),[c,d]=bz(5);set(a,c+22,b,d,T.PARK)}
set(c9a,r2z0+32,c10b,r2z1,T.GARDEN,[T.GRASS]);set(c9a,r3z0+30,c10b,r3z1,T.GARDEN,[T.GRASS]);set(c9a,r4z0+27,c10b,r4z1,T.GARDEN,[T.GRASS]);
set(785,176,790,548,T.PARK,[T.GRASS]);
// noord: Noorderpark, Villapark-groen, industrie
const NPARK={x0:bx(3)[0],z0:r1z0,x1:bx(5)[1],z1:r1z1};set(bx(3)[0],r1z0,bx(5)[1],r1z1,T.PARK,[T.GRASS,T.DOCK,T.GARDEN]);
// industrieblokken die geen kavels hebben: loodsen
[[9,1]].forEach(([i,j])=>{const [a,b]=bx(i),[c,d]=bz(j);set(a,c,b,d,T.DOCK)});
set(c8x0,r1z0,c8x1,r1z1,T.DOCK);set(c9x0,r0z0,c9x1,r0z1,T.DOCK);set(c10x0,r0z0,c10x1,r0z1,T.DOCK);set(c9x0,r1z0,c9x1,r1z1,T.DOCK);
set(bx(2)[0],r1z0,bx(2)[1],r1z1,T.GARDEN);
// loodsen in de haven en op het bedrijventerrein (het containerterrein zelf blijft open)
const HAVEN={wmin:14,wmax:20,dmin:14,dmax:17,fmin:2,fmax:3,st:STY.haven,roof:1,gap:.3,inner:T.DOCK};
[[2,0],[4,0],[5,0]].forEach(([i,j])=>{const [a,b]=bx(i),[c,d]=bz(j);fill(a,c,b,d,HAVEN)});
{const k=EST_B.find(e=>e[0]==='kantoor');if(k)fill(k[3]+2,r1z0,c10x1,r1z1,Object.assign({},HAVEN,{st:['ware','ware2','concrete']}))}
{const ix=EST_B.filter(e=>e[0]==='transport'||e[0]==='diamant');const x0=Math.max(...ix.map(e=>e[3]))+2;if(x0<c9x1-12)fill(x0,r1z0,c9x1,r1z0+24,Object.assign({},HAVEN,{d:20}));fill(c9x0,r1z0+26,c9x1,r1z1,Object.assign({},HAVEN,{d:14}))}
// stegen: donker asfalt
alleys.forEach(a=>set(a.x0,a.z0,a.x1,a.z1,T.YARD,[T.GRASS,T.GARDEN,T.PLAZA]));

/* ---------- spullen op straat (decor, sommige blokkeren) ---------- */
function prop(k,x,z,o){const p=Object.assign({k,x,z},o||{});props.push(p);if(p.solid){const r=p.solid;block(Math.floor(x-r),Math.floor(z-r),Math.ceil(x+r),Math.ceil(z+r))}return p}
const nearRoadCorner=(x,z)=>XS.some(q=>Math.abs(q-x)<RW+SW+1)&&ZS.some(q=>Math.abs(q-z)<RW+SW+1);
const inPlot=(x,z,m)=>places.some(p=>p.rect&&x>p.rect.x0-(m||0)&&x<p.rect.x1+(m||0)&&z>p.rect.z0-(m||0)&&z<p.rect.z1+(m||0));
const nearDoor=(x,z)=>places.some(p=>Math.hypot(p.door.x-x,p.door.z-z)<2.6);
const free=(x,z,r)=>{if(inPlot(x,z,r+.5)||nearDoor(x,z))return false;for(let a=Math.floor(z-r);a<=Math.ceil(z+r);a++)for(let b=Math.floor(x-r);b<=Math.ceil(x+r);b++){if(!inb(b,a)||solid[a*W+b])return false;const t=g[a*W+b];if(t===T.WATER||t===T.ROAD||t===T.BRIDGE)return false}return true};
// tuinpaden: een kruis door elk park-blok, van stoep tot stoep (alleen over park, nooit over de weg), en het pad langs de Westkust
const parkPaths=[];for(let i=0;i<XS.length-1;i++)for(let j=0;j<ZS.length-1;j++){const [a,b]=bx(i),[c,d]=bz(j);if(b-a<20||d-c<20)continue;const mx=Math.floor((a+b)/2),mz=Math.floor((c+d)/2);
  if(at(mx,mz)!==T.PARK)continue;parkPaths.push({x0:a,z0:mz-1,x1:b,z1:mz+1},{x0:mx-1,z0:c,x1:mx+1,z1:d})}
parkPaths.push({x0:17,z0:176,x1:19,z1:515});
const onPath=(x,z,r)=>parkPaths.some(p=>x>p.x0-r&&x<p.x1+r&&z>p.z0-r&&z<p.z1+r);
// bomen in parken en tuinen (niet op de paden; de random-volgorde blijft gelijk)
for(let i=0;i<26000;i++){const x=6+rng()*(W-12),z=6+rng()*(H-12),t=at(x|0,z|0);
  if((t===T.PARK&&rng()<.5)||(t===T.GARDEN&&rng()<.16)){if(free(x,z,1.6)){const s=.8+rng()*.6,v=ri(0,2);if(!onPath(x,z,1.3))prop('tree',x,z,{s,v,solid:.5})}}}
// palmen op het strand en Het Eiland
for(let x=22;x<574;x+=ri(10,16)){const z=536+rng()*4;if(free(x,z,1))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
for(let x=604;x<760;x+=ri(12,18)){const z=640+rng()*6;if(at(x|0,z|0)===T.GRASS&&free(x,z,1))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
for(let x=24;x<574;x+=ri(8,12)){const z=541+rng()*5;if(at(x|0,z|0)===T.SAND)prop('umbrella',x,z,{v:ri(0,3)})}
// lantaarns langs de wegen (buitenrand van de stoep)
const okLamp=(a,b)=>at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)]&&!nearDoor(a,b);
VR.forEach(v=>{for(let z=v.a+14;z<v.b-8;z+=18){[[v.x-RW-SW+.5,z],[v.x+RW+SW-.5,z+9]].forEach(([a,b])=>{if(okLamp(a,b))prop('lamp',a,b,{solid:.2})})}});
HR.forEach(h=>{for(let x=h.a+14;x<h.b-8;x+=18){[[x,h.z-RW-SW+.5],[x+9,h.z+RW+SW-.5]].forEach(([a,b])=>{if(okLamp(a,b))prop('lamp',a,b,{solid:.2})})}});
// bomen en paaltjes langs de gracht, fietsen tegen de reling
for(let z=182;z<520;z+=10){[[347.5,z],[372.5,z+5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.6))prop('tree',a,b,{s:.7,v:1,solid:.4})})}
for(let z=180;z<520;z+=3){[[351.4,z],[368.6,z]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.3))prop('bollard',a,b,{solid:.15})})}
for(let z=186;z<520;z+=17){const a=349.6,b=z+5;if([b-1.4,b,b+1.4].every(q=>at(a|0,q|0)===T.WALK&&!solid[(q|0)*W+(a|0)])&&!inPlot(a,b,1))prop('bikes',a,b,{rot:1,v:ri(0,4)})}
// straatbomen in de Westbuurt, het Centrum en Oostland
ZS.slice(2,7).forEach(z=>{for(let x=XS[0]+12;x<XS[XS.length-1]-8;x+=15){if(x>XS[6]&&x<XS[8])continue;[[x,z-RW-SW+.6],[x+7,z+RW+SW-.6]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.8))prop('stree',a,b,{s:.8+rng()*.3,v:ri(0,2),solid:.25})})}});
for(let i=0,n=0;i<8000&&n<110;i++){const x=20+rng()*(W-40),z=20+rng()*(H-40);if(at(x|0,z|0)===T.WALK&&free(x,z,.7)&&!nearRoadCorner(x,z)){n++;prop('bin',x,z,{solid:.3})}}
// bootjes in de gracht, het havenkanaal en in zee
for(let z=190;z<530;z+=ri(16,28)){if(ZS.some(q=>Math.abs(q-z)<14))continue;prop('boat',rng()<.5?355.3:364.7,z,{rot:1,v:ri(0,4),l:ri(5,8)})}
for(let z=190;z<530;z+=ri(20,34)){if(ZS.some(q=>Math.abs(q-z)<16))continue;prop('boat',rng()<.5?588:604,z,{rot:1,v:ri(0,4),l:ri(7,11)})}
prop('boat',596,8,{rot:1,v:2,l:12,jacht:1});prop('boat',786,646,{rot:1,v:1,l:6});
// lichtreclame op de daken van de Zuidas
buildings.filter(b=>b.x0>=c7x0&&b.x1<=574&&b.fl>=10).slice(0,7).forEach((b,i)=>prop('billboard',(b.x0+b.x1)/2,(b.z0+b.z1)/2,{y:b.fl*FL+.5,v:i}));
// containers op de kade, het containerterrein en het bedrijventerrein
const free2=(x,z,hw,hd)=>{for(let a=Math.floor(z-hd);a<=Math.ceil(z+hd);a++)for(let b=Math.floor(x-hw);b<=Math.ceil(x+hw);b++){if(!inb(b,a)||solid[a*W+b]||g[a*W+b]!==T.DOCK)return false}return true};
const YARD={x0:bx(3)[0],z0:r0z0,x1:bx(3)[1],z1:r0z1};
for(let i=0,n=0;i<6000&&n<150;i++){const x=200+rng()*590,z=14+rng()*150,rot=rng()<.5?0:1;const w=rot?3:7,d=rot?7:3;
  if(free2(x,z,w/2+.7,d/2+.7)&&!inPlot(x,z,3)&&!(x>c8x0+16&&x<c8x0+60&&z<r0z0+34)){n++;
    prop('container',x,z,{rot,h:ri(1,3),v:ri(0,4)});block(Math.floor(x-w/2),Math.floor(z-d/2),Math.ceil(x+w/2),Math.ceil(z+d/2))}}
// stegen: afvalcontainer (verstopplek), graffiti, soms een lamp
const hides=[];
alleys.forEach((a,i)=>{const f=a.f,ns=f==='N'||f==='S';
  const ex=f==='N'?[a.cx,a.z1]:f==='S'?[a.cx,a.z0]:f==='W'?[a.x1,a.cz]:[a.x0,a.cz],io=f==='N'||f==='W'?1:-1,C=[];
  [2.8,3.6,-2.8,-3.6].forEach(o=>C.push(ns?[ex[0]+o,ex[1]+io*1.1]:[ex[0]+io*1.1,ex[1]+o]));
  let ok=null;for(const [x,z] of C)if(free(x,z,1.1)){ok=[x,z,0];break}
  if(!ok)ok=ns?[a.x0+.6,f==='N'?a.z1-1.4:a.z0+1.4,1]:[f==='W'?a.x1-1.4:a.x0+1.4,a.z0+.6,1];
  const [x,z,inA]=ok,rot=ns?(inA?1:0):(inA?0:1);prop('dumpster',x,z,{rot,v:i%3});
  if(inA){if(ns)block(a.x0,Math.floor(z-1),a.x0+1,Math.ceil(z+1));else block(Math.floor(x-1),a.z0,Math.ceil(x+1),a.z0+1)}else block(Math.floor(x-.9),Math.floor(z-.9),Math.ceil(x+.9),Math.ceil(z+.9));
  hides.push({x,z,k:'dumpster'});
  const wx=ns?a.x0:a.cx,wz=ns?a.cz:a.z0;
  // graffiti alleen op een echte gevel (een pand dat precies tegen de steeg staat), anders zweeft hij in de lucht
  {const len=Math.min(5,(ns?a.z1-a.z0:a.x1-a.x0)-2),h=Math.max(2,len)/2;
    if(buildings.some(b=>ns?Math.abs(b.x1-wx)<.3&&b.z0<=wz-h&&b.z1>=wz+h:Math.abs(b.z1-wz)<.3&&b.x0<=wx-h&&b.x1>=wx+h))prop('graffiti',wx,wz,{ns:ns?1:0,v:i%5,len})}
  if(i%2===0)prop('lamp',ns?a.x1-.35:a.cx,ns?a.cz:a.z1-.35,{})});
props.filter(p=>p.k==='container').forEach(p=>hides.push({x:p.x,z:p.z,k:'container',r:p.rot?[1.5,3.5]:[3.5,1.5]}));
// Oostland: poorten over de weg aan het eind van de bruggen over het havenkanaal
const GATES=[240,310,380,450,515].map(z=>({x:618,z}));
GATES.forEach(({x,z})=>{prop('arch',x,z,{});block(x-1,z-RW-3,x+1,z-RW-1);block(x-1,z+RW+1,x+1,z+RW+3)});
// kranen langs de noordkade
[230,290,420,470,640,690,750].forEach(x=>{prop('crane',x,24,{});block(x-2,22,x+3,27)});
// geparkeerde auto's langs de stoeprand (decor)
for(let i=0;i<260;i++){const vert=rng()<.5;if(vert){const v=pick(VR),side=rng()<.5?-1:1,z=v.a+10+rng()*(v.b-v.a-20);if(ZS.some(q=>Math.abs(q-z)<12))continue;const x=v.x+side*(RW-1.3);if(at(x|0,z|0)!==T.ROAD)continue;prop('car',x,z,{rot:1,v:ri(0,6),dir:side})}
  else{const h=pick(HR),side=rng()<.5?-1:1,x=h.a+10+rng()*(h.b-h.a-20);if(XS.some(q=>Math.abs(q-x)<12))continue;const z=h.z+side*(RW-1.3);if(at(x|0,z|0)!==T.ROAD)continue;prop('car',x,z,{rot:0,v:ri(0,6),dir:side})}}
// wrakken op het autokerkhof
for(let k=0;k<6;k++){const x=c7x0+3+(k%3)*8,z=r1z0+4+Math.floor(k/3)*9;prop('wreck',x+1.5,z+2,{h:1+(k%3),v:k});block(x,z,x+3,z+5)}
// politieauto's voor het bureau, standbeeld op het plein, bankjes in het park
const POL=places.find(p=>p.id==='politie');[-12,-4,4,12].forEach(o=>prop('police',(POL.x0+POL.x1)/2+o,POL.z1+5,{rot:1}));
const PLEIN={x0:c6x0,z0:r3z0,x1:c6x1,z1:r3z1,x:(c6x0+c6x1)/2-4,z:(r3z0+r3z1)/2+4};
prop('statue',PLEIN.x,PLEIN.z,{solid:2.2});
for(let i=0,n=0;i<6000&&n<60;i++){const x=20+rng()*760,z=20+rng()*620;if(at(x|0,z|0)===T.PARK&&free(x,z,1.4)){const rot=ri(0,3);if(onPath(x,z,1))continue;n++;prop('bench',x,z,{rot,solid:.6})}}
// heg om Villa Cosa Nostra, muur om de bajes (met poort)
(function(){const hedge=(x0,z0,x1,z1)=>{for(let x=x0;x<x1;x+=2)for(let z=z0;z<z1;z+=2)prop('hedge',x+1,z+1,{})};
  hedge(668,574,764,576);hedge(668,574,670,603);hedge(762,574,764,603);hedge(668,601,710,603);hedge(722,601,764,603);
  block(668,574,764,576);block(668,574,670,603);block(762,574,764,603);block(668,601,710,603);block(722,601,764,603);
  const wall=(x0,z0,x1,z1)=>{props.push({k:'wall',x0,z0,x1,z1});block(x0,z0,x1,z1)};
  wall(48,48,172,50);wall(48,48,50,95);wall(170,48,172,95);wall(48,93,107,95);wall(113,93,172,95);
  [[49,49],[171,49],[49,94],[171,94]].forEach(([x,z])=>prop('tower',x,z,{}));
  prop('gate',110,94,{});block(107,93,113,95);
})();
props.filter(p=>p.k==='hedge').forEach((p,i)=>{if(i%3===0)hides.push({x:p.x,z:p.z,k:'hedge'})});
// bruggen: waar een weg over water gaat (voor de relingen)
const bridges=[];HR.forEach(h=>{[[352,368],[580,612]].forEach(([a,b])=>{if(h.a<a&&h.b>b&&at(a+2,h.z)===T.BRIDGE)bridges.push({x0:a,x1:b,z0:h.z-RW-SW,z1:h.z+RW+SW})})});
bridges.push({x0:640-RW-SW,x1:640+RW+SW,z0:548,z1:574,v:1});

/* ---------- waar je begint ---------- */
const spawn={x:PLEIN.x+3,z:PLEIN.z+10};

/* ---------- lopen en routes ---------- */
const walkable=(x,z)=>{x=Math.floor(x);z=Math.floor(z);return inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER};
function canStand(x,z,r){r=r||.35;return walkable(x-r,z-r)&&walkable(x+r,z-r)&&walkable(x-r,z+r)&&walkable(x+r,z+r)}
function nearestWalk(x,z,max){max=max||40;if(canStand(x,z))return{x,z};for(let r=1;r<=max;r++)for(let a=0;a<r*8;a++){const t=a/(r*8)*Math.PI*2,px=x+Math.cos(t)*r,pz=z+Math.sin(t)*r;if(canStand(px,pz))return{x:px,z:pz}}return null}
// A* over het raster (8 richtingen, niet schuin langs hoeken), daarna rechte stukken waar dat kan. Buffers worden hergebruikt.
const N_=W*H,gs=new Float32Array(N_),from=new Int32Array(N_),closed=new Uint8Array(N_),stamp=new Uint32Array(N_);let STAMP=0;
function findPath(ax,az,bx_,bz_){
  const s=nearestWalk(ax,az,6),e=nearestWalk(bx_,bz_,30);if(!s||!e)return null;
  const sx=Math.floor(s.x),sz=Math.floor(s.z),ex=Math.floor(e.x),ez=Math.floor(e.z);
  STAMP++;if(STAMP>4e9){stamp.fill(0);STAMP=1}
  const touch=i=>{if(stamp[i]!==STAMP){stamp[i]=STAMP;gs[i]=1e9;from[i]=-1;closed[i]=0}};
  const ok=(x,z)=>inb(x,z)&&!solid[z*W+x]&&g[z*W+x]!==T.WATER;
  const heap=[],hf=[];const push=(i,f)=>{heap.push(i);hf.push(f);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(hf[p]<=hf[k])break;[heap[p],heap[k]]=[heap[k],heap[p]];[hf[p],hf[k]]=[hf[k],hf[p]];k=p}};
  const pop=()=>{const top=heap[0],lf=hf.pop(),li=heap.pop();if(heap.length){heap[0]=li;hf[0]=lf;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<heap.length&&hf[l]<hf[m])m=l;if(r<heap.length&&hf[r]<hf[m])m=r;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];[hf[m],hf[k]]=[hf[k],hf[m]];k=m}}return top};
  const h=(x,z)=>{const dx=Math.abs(x-ex),dz=Math.abs(z-ez);return Math.max(dx,dz)+.414*Math.min(dx,dz)};
  const si=sz*W+sx,ei=ez*W+ex;touch(si);touch(ei);gs[si]=0;push(si,h(sx,sz));let n=0;
  const D=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.414],[1,-1,1.414],[-1,1,1.414],[-1,-1,1.414]];
  while(heap.length&&n++<420000){const i=pop();if(i===ei)break;touch(i);if(closed[i])continue;closed[i]=1;const x=i%W,z=(i/W)|0;
    for(const [dx,dz,c] of D){const nx=x+dx,nz=z+dz;if(!ok(nx,nz))continue;if(dx&&dz&&(!ok(x+dx,z)||!ok(x,z+dz)))continue;
      const ni=nz*W+nx;touch(ni);const tt=g[ni],cost=c*(tt===T.ROAD?1.6:1);const ng=gs[i]+cost;if(ng<gs[ni]){gs[ni]=ng;from[ni]=i;push(ni,ng+h(nx,nz)*1.05)}}}
  if(from[ei]<0&&ei!==si)return null;
  const raw=[];for(let i=ei;i!==-1&&i!==si;i=from[i])raw.push([i%W+.5,((i/W)|0)+.5]);raw.reverse();
  const clear=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),n=Math.ceil(L*3);for(let k=0;k<=n;k++){const x=a[0]+dx*k/n,z=a[1]+dz*k/n;if(!canStand(x,z,.3))return false}return true};
  const out=[];let cur=[s.x,s.z];for(let k=0;k<raw.length;){let j=raw.length-1;while(j>k&&!clear(cur,raw[j]))j--;out.push(raw[j]);cur=raw[j];k=j+1}
  if(out.length)out[out.length-1]=[e.x,e.z];
  return out.map(([x,z])=>({x,z}));
}

/* ---------- wijken ---------- */
// De namen zijn dezelfde als vroeger (wijken, respect, bendes en agenten hangen eraan), alleen de plekken zijn nieuw.
function districtAt(x,z){
  if(x>=592&&z>=560)return 'Het Eiland';
  if(z>=548)return 'Het Strand';
  if(x>=578&&x<614&&z>=172)return 'Havenkanaal';
  if(x>=612&&z>=172)return z<380?'Villawijk':'Tuinwijk';
  if(z<172){
    if(x<215)return z<102?'De Bajes':'Villapark';
    if(x<390)return z<102?'Noordkade':'Noorderpark';
    if(x<612)return 'De Haven';
    return z<102?'IJ-oever':'Bedrijventerrein'}
  if(z>=520)return 'Het Strand';
  if(z>=446){if(x>=462)return 'Oosterstraat';return 'Boulevard'}
  if(x<30)return 'Westkust';if(x<215)return 'Westbuurt';
  if(x>=340&&x<380)return 'De Gracht';
  if(x<340)return 'Centrum';
  if(x>=395&&x<475&&z>=236&&z<314)return 'Het Plein';
  if(x<462)return 'Oud-Zuid';
  return 'Zuidas'}
const DISTRICTS=[{n:'Westbuurt',x:110,z:310},{n:'Westkust',x:22,z:420},{n:'Villapark',x:110,z:138},{n:'De Bajes',x:110,z:72},{n:'Noordkade',x:300,z:72},{n:'Noorderpark',x:300,z:138},
 {n:'De Haven',x:500,z:72},{n:'IJ-oever',x:700,z:72},{n:'Bedrijventerrein',x:700,z:138},{n:'Centrum',x:285,z:340},{n:'De Gracht',x:360,z:420},{n:'Het Plein',x:435,z:275},
 {n:'Oud-Zuid',x:435,z:410},{n:'Zuidas',x:520,z:300},{n:'Boulevard',x:220,z:482},{n:'Oosterstraat',x:520,z:482},{n:'Het Strand',x:300,z:540},
 {n:'Villawijk',x:700,z:260},{n:'Tuinwijk',x:700,z:450},{n:'Het Eiland',x:690,z:625}];

/* ---------- vaste punten voor de rest van het spel (missies, verhaal, sfeer) ----------
 Liever deze namen gebruiken dan losse getallen: dan kan de kaart veranderen zonder dat de rest stuk gaat. */
const P=id=>places.find(p=>p.id===id).door;
const A={
  plein:{x:PLEIN.x,z:PLEIN.z-8},pleinMid:{x:PLEIN.x,z:PLEIN.z},cafe:P('crimes'),casino:P('casino'),casinoPlein:{x:(c6x0+c6x1)/2,z:r2z1-4},bank:P('bank'),bankPlein:{x:(c4x0+c4x1)/2,z:r2z1-4},
  politie:P('politie'),notaris:P('biz'),wasserette:P('wit'),contact:P('hits'),wapens:P('shop'),kleding:P('look'),gym:P('skills'),spa:P('relax'),garage:P('cars'),sloop:P('sloop'),
  havenloods:P('werk'),bajes:P('jail'),villa:P('fam'),brug:{x:347.5,z:324},
  // winkels en hoeken voor straatklussen (op de stoep)
  apotheek:{x:bx(3)[0]+30,z:ZS[5]-RW-2},juwelier:{x:bx(3)[0]+12,z:ZS[5]+RW+2},drogist:{x:bx(1)[0]+20,z:ZS[4]-RW-2},avond:{x:bx(0)[0]+30,z:ZS[3]+RW+2},
  elektro:{x:bx(5)[0]+30,z:ZS[5]-RW-2},stoep:{x:bx(2)[0]+20,z:ZS[3]-RW-2},fietsrek:{x:349.5,z:262},parkeer:{x:bx(6)[0]+20,z:ZS[2]+RW+2},
  bouw:{x:(BOUW.x0+BOUW.x1)/2,z:BOUW.z1+2.5},box:{x:bx(8)[0]+10,z:ZS[1]+RW+2},geldauto:{x:(c4x0+c4x1)/2,z:ZS[3]-RW-1},
  pier:{x:596,z:16},hangar:{x:c8x0+38,z:r0z0+32},kade:{x:420,z:28},strand:{x:300,z:538},park:{x:(NPARK.x0+NPARK.x1)/2,z:(NPARK.z0+NPARK.z1)/2},
  villapark:{x:110,z:ZS[1]+RW+2},zuidas:{x:(c7x0+c7x1)/2,z:ZS[4]-RW-2},oostland:{x:624,z:310},eiland:{x:640,z:590},jacht:{x:600,z:17},
  boulevard:{x:240,z:ZS[7]-RW-2},oosterstraat:{x:520,z:ZS[6]+RW+2},tuinwijk:{x:700,z:ZS[6]-RW-2},westkust:{x:22,z:300},noordkade:{x:300,z:34.5},
  vijver:{x:(c10a+c10b)/2,z:r6a+2},jachthaven:{x:770,z:630},bedrijven:{x:690,z:ZS[1]+RW+2}};
// gebieden (x0,z0,x1,z1) voor sluipklussen en missies
const Z={villapark:[bx(0)[0],r1z0,bx(2)[1],r1z1],park:[NPARK.x0,NPARK.z0,NPARK.x1,NPARK.z1],yard:[YARD.x0,YARD.z0,YARD.x1,YARD.z1],strand:[20,526,574,546],
  hangar:[c8x0,r0z0,c8x1,r0z1],bajes:[50,50,170,95],eiland:[600,576,790,650],bouw:[BOUW.x0,BOUW.z0,BOUW.x1,BOUW.z1],plein:[PLEIN.x0,PLEIN.z0,PLEIN.x1,PLEIN.z1]};

/* ---------- wegennet voor het verkeer: knooppunten (kruisingen en einden) en stukken weg ertussen ---------- */
const NET=(function(){const key=(x,z)=>x+','+z,nodes={};const node=(x,z)=>nodes[key(x,z)]||(nodes[key(x,z)]={x,z,n:[]});
  VR.forEach(v=>{const zs=new Set([v.a,v.b]);HR.forEach(h=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)zs.add(h.z)});const L=[...zs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A_=node(v.x,L[i]),B=node(v.x,L[i+1]);A_.n.push(B);B.n.push(A_)}});
  HR.forEach(h=>{const xs=new Set([h.a,h.b]);VR.forEach(v=>{if(v.x>=h.a&&v.x<=h.b&&h.z>=v.a&&h.z<=v.b)xs.add(v.x)});const L=[...xs].sort((a,b)=>a-b);for(let i=0;i<L.length-1;i++){const A_=node(L[i],h.z),B=node(L[i+1],h.z);if(!A_.n.includes(B)){A_.n.push(B);B.n.push(A_)}}});
  return Object.values(nodes)})();
function setSolid(r,on){block(Math.floor(r.x0),Math.floor(r.z0),Math.ceil(r.x1),Math.ceil(r.z1),on?1:0)}
root.STAD_MAP={NET,districtAt,setSolid,ESTATE,EST_H,EST_B,BIZ_LOOK,alleys,hides,parkPaths,estateAt:(x,z)=>x>=ESTATE.x0&&z>=ESTATE.z0&&z<ESTATE.z1,W,H,FL,T,RW,SW,LANE,
  XS,ZS,VR,HR,RX:XS,RZ:ZS,RXE:[],RZE:[],GATES,A,Z,ground:g,solid,bridgeWalk,buildings,props,places,bridges,DISTRICTS,spawn,jailGate,
  at,walkable,canStand,nearestWalk,findPath,placeById:id=>places.find(p=>p.id===id),placeByPage:pg=>places.find(p=>p.page===pg)};
})(typeof window!=='undefined'?window:globalThis);
