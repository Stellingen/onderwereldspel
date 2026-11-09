// Pixelstad: de kaart. Wegen, water, gebouwen, ingangen en spullen op straat, plus de route-planner.
// Puur rekenwerk (geen tekenwerk), dus ook in node te testen. 1 eenheid = 1 meter; x loopt naar het oosten, z naar het zuiden.
(function(root){
'use strict';
const W=384,H=264,RW=4,SW=3,FL=3.4;            // kaartmaat, halve wegbreedte, stoepbreedte, hoogte van een verdieping
const RX=[30,80,130,178,204,254,304],RZ=[36,88,140,192];
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
for(let z=0;z<H;z++)for(let x=0;x<W;x++)if(x<6||x>=378||z<6||z>=250)g[z*W+x]=T.WATER;
set(6,228,300,250,T.SAND);
set(300,200,378,250,T.WATER);
set(340,6,378,250,T.WATER);
[[44,54],[100,110],[156,166]].forEach(([a,b])=>set(340,a,372,b,T.DOCK));   // steigers in de haven
set(185,6,197,250,T.WATER);                                                  // de gracht
set(308,6,340,200,T.DOCK);                                                   // havenkade

/* ---------- wegen en stoepen (over water worden het bruggen) ---------- */
const roads=[];
RX.forEach(x=>roads.push([x-RW,RZ[0]-RW,x+RW,RZ[3]+RW]));
RZ.forEach(z=>roads.push([RX[0]-RW,z-RW,RX[6]+RW,z+RW]));
[88,140].forEach(z=>roads.push([RX[6]+RW,z-RW,340,z+RW]));
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
 {n:'De Haven',x:352,z:130},{n:'Boulevard',x:150,z:236},{n:'Noorderpark',x:152,z:14},{n:'De Bajes',x:298,z:14},{n:'Villapark',x:58,z:14}];

/* --- de bijzondere plekken: elk opent een scherm van het spel --- */
// pagina-id's zoals in het klikspel (ui.js PAGES)
place({id:'casino',page:'casino',name:'Casino Royaal',sign:'CASINO',st:'casino',fl:3,face:'S',x0:213,z0:45,x1:245,z1:73,
  parts:[[213,45,245,73,3],[221,50,237,66,11,'casino']],res:[211,43,247,81],ic:'casino'});
set(211,73,247,81,T.PLAZA,[T.GRASS]);
place({id:'bank',page:'bank',name:'Nederlandsche Onderbank',sign:'BANK',st:'bank',fl:4,face:'S',x0:139,z0:46,x1:169,z1:74,res:[137,43,171,81],ic:'bank'});
set(137,74,171,81,T.PLAZA,[T.GRASS]);
place({id:'politie',page:'politie',name:'Politiebureau',sign:'POLITIE',st:'police',fl:3,face:'S',x0:139,z0:98,x1:169,z1:124,res:[137,95,171,133],ic:'politie'});
set(137,124,171,133,T.PLAZA,[T.GRASS]);
place({id:'biz',page:'biz',name:'Makelaardij De Sleutel',sign:'MAKELAAR',st:'plaster',fl:4,face:'S',x0:139,z0:171,x1:159,z1:185,ic:'biz'});
set(211,95,247,133,T.PLAZA,[T.GRASS]);                                       // Het Plein
place({id:'crimes',page:'crimes',name:'Café Het Gat',sign:'HET GAT',st:'pub',fl:3,face:'S',x0:213,z0:96,x1:229,z1:106,ic:'crimes',roof:'gableX'});
place({id:'wit',page:'wit',name:'Wasserette Schoon Geld',sign:'WASSERETTE',st:'shop',fl:2,face:'N',x0:212,z0:147,x1:228,z1:160,ic:'wit'});
place({id:'hits',page:'hits',name:'Het Contact',sign:'CONTACT',st:'brick2',fl:3,face:'E',x0:284,z0:96,x1:297,z1:110,ic:'hits'});
place({id:'shop',page:'shop',name:'Wapenhandel Kogel & Zn',sign:'WAPENS',st:'gun',fl:2,face:'S',x0:261,z0:172,x1:277,z1:185,ic:'shop'});
place({id:'cars',page:'cars',name:'Garage Van der Plaat',sign:'GARAGE',st:'garage',fl:2,face:'N',x0:313,z0:97,x1:338,z1:118,ic:'cars'});
place({id:'werk',page:'werk',name:'Havenloods 7',sign:'HAVEN',st:'ware',fl:3,face:'N',x0:313,z0:149,x1:338,z1:176,ic:'werk'});
place({id:'skills',page:'skills',name:'Sportschool De Bokszak',sign:'GYM',st:'gym',fl:2,face:'N',x0:40,z0:200,x1:66,z1:214,ic:'skills'});
place({id:'relax',page:'relax',name:'Spa Zeezicht',sign:'SPA',st:'beach',fl:2,face:'N',x0:90,z0:200,x1:116,z1:214,ic:'relax'});
place({id:'look',page:'look',name:'Kledingzaak Maatwerk',sign:'KLEDING',st:'boutique',fl:2,face:'N',x0:140,z0:200,x1:166,z1:214,ic:'look'});
// je eigen woning: het gebouw hangt af van waar je woont (stad-lots.js)
place({id:'verblijf',page:'verblijf',name:'Jouw woning',sign:'THUIS',face:'N',dx:45,x0:37,z0:96,x1:56,z1:116,res:[37,95,56,116],ic:'verblijf',dyn:'home'});
// kavels voor je zaken (Bezit): leeg met een bord 'te koop', of jouw pand dat groeit met vestigingen en upgrades
const LOTS=[['wash',37,147,48,159,'N'],['boven',49,147,61,160,'N'],['winkelpand',62,147,73,160,'N'],['snack',88,147,99,158,'N'],['shop',100,147,111,158,'N'],['barber',112,147,123,158,'N'],
 ['hotel',137,147,153,161,'N'],['speelhal',154,147,171,160,'N'],['shisha',229,147,246,159,'N'],['club',261,43,279,58,'N'],['vastgoed',280,43,297,61,'N'],
 ['garage',313,44,338,70,'S'],['autogarage',313,124,338,136,'N'],['dealer',313,182,338,196,'N'],['bedrijfshal',346,44,370,54,'W'],['port',346,100,370,110,'W'],['jet',346,156,370,166,'W']];
LOTS.forEach(([b,x0,z0,x1,z1,f])=>place({id:'biz_'+b,biz:b,page:'biz',name:'Kavel',sign:'TE KOOP',face:f,x0,z0,x1,z1,ic:'biz',dyn:'biz'}));
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
function fill(x0,z0,x1,z1,o){
  const d=o.d||ri(o.dmin,o.dmax),gap=o.gap||0;
  const side=(ax,bx,mk)=>{let x=ax;while(x<bx){let w=ri(o.wmin,o.wmax);if(bx-x-w<o.wmin)w=bx-x;if(gap&&rng()<gap&&x>ax&&bx-x>o.wmin+3){x+=3;continue}mk(x,Math.min(bx,x+w));x+=w}};
  const B=(a,b,c,e,f)=>{const r=[a,b,c,e];if(c-a<3||e-b<3||reserved.some(q=>over(q,r)))return;
    addB({x0:a,z0:b,x1:c,z1:e,fl:ri(o.fmin,o.fmax),st:pick(o.st),roof:o.roof?(f==='N'||f==='S'?'gableX':'gableZ'):'flat',front:f})};
  side(x0,x1,(a,b)=>B(a,z0,b,z0+d,'N'));
  side(x0,x1,(a,b)=>B(a,z1-d,b,z1,'S'));
  if(z1-z0>2*d+o.wmin){side(z0+d,z1-d,(a,b)=>B(x0,a,x0+d,b,'W'));side(z0+d,z1-d,(a,b)=>B(x1-d,a,x1,b,'E'))}
  set(x0+d,z0+d,x1-d,z1-d,o.inner||T.GARDEN,[T.GRASS]);
}
const WEST={wmin:6,wmax:9,dmin:10,dmax:13,fmin:3,fmax:5,st:STY.west,roof:1,gap:.08};
const CEN={wmin:7,wmax:12,dmin:11,dmax:14,fmin:4,fmax:6,st:STY.centrum,gap:.06};
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

// noordkant: kantoren tussen gracht en bajes, park tussen villa en gracht
set(123,6,185,29,T.PARK);set(6,6,46,29,T.PARK);set(197,6,262,29,T.GRASS);
[[200,9,214,27,6],[216,11,232,27,8],[234,9,252,27,7]].forEach(([a,b,c,e,f])=>addB({x0:a,z0:b,x1:c,z1:e,fl:f,st:pick(STY.noord),roof:'flat'}));
// boulevard aan het strand: strandtenten en winkeltjes tussen de grote plekken
(function(){let x=8;while(x<298){const w=ri(9,13);const r=[x,200,x+w,211];if(x+w<298&&!reserved.some(q=>over(q,[r[0]-1,r[1],r[2]+1,r[3]]))&&rng()<.7)addB({x0:x,z0:200,x1:x+w,z1:211,fl:ri(1,2),st:pick(STY.strand),roof:'flat'});x+=w+ri(3,6)}})();
// westkust: promenade met bomen
set(6,43,23,185,T.PARK);

/* ---------- spullen op straat (decor, sommige blokkeren) ---------- */
function prop(k,x,z,o){const p=Object.assign({k,x,z},o||{});props.push(p);if(p.solid){const r=p.solid;block(Math.floor(x-r),Math.floor(z-r),Math.ceil(x+r),Math.ceil(z+r))}return p}
const free=(x,z,r)=>{for(let a=Math.floor(z-r);a<=Math.ceil(z+r);a++)for(let b=Math.floor(x-r);b<=Math.ceil(x+r);b++){if(!inb(b,a)||solid[a*W+b])return false;const t=g[a*W+b];if(t===T.WATER||t===T.ROAD||t===T.BRIDGE)return false}return true};
// bomen in parken en tuinen
for(let i=0;i<7000;i++){const x=6+rng()*372,z=6+rng()*244,t=at(x|0,z|0);
  if((t===T.PARK&&rng()<.55)||(t===T.GARDEN&&rng()<.18)){if(free(x,z,1.6))prop('tree',x,z,{s:.8+rng()*.6,v:ri(0,2),solid:.5})}}
// palmen op het strand
for(let x=12;x<296;x+=ri(9,16)){const z=230+rng()*6;if(free(x,z,1))prop('palm',x,z,{s:.9+rng()*.4,solid:.4})}
// strandstoelen en parasols
for(let x=16;x<296;x+=ri(7,12)){const z=238+rng()*7;if(at(x|0,z|0)===T.SAND)prop('umbrella',x,z,{v:ri(0,3)})}
// lantaarns langs de wegen (buitenrand van de stoep)
RX.forEach(x=>{for(let z=RZ[0]+12;z<RZ[3]-8;z+=16){[[x-RW-SW+.5,z],[x+RW+SW-.5,z+8]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)])prop('lamp',a,b,{solid:.2})})}});
RZ.forEach(z=>{for(let x=RX[0]+12;x<RX[6]-8;x+=16){[[x,z-RW-SW+.5],[x+8,z+RW+SW-.5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&!solid[(b|0)*W+(a|0)])prop('lamp',a,b,{solid:.2})})}});
// bomen langs de gracht
for(let z=12;z<246;z+=10){[[183.4,z],[198.6,z+5]].forEach(([a,b])=>{if(at(a|0,b|0)===T.WALK&&free(a,b,.6))prop('tree',a,b,{s:.7,v:1,solid:.4})})}
// containers op de kade en de steigers
const free2=(x,z,hw,hd)=>{for(let a=Math.floor(z-hd);a<=Math.ceil(z+hd);a++)for(let b=Math.floor(x-hw);b<=Math.ceil(x+hw);b++){if(!inb(b,a)||solid[a*W+b]||g[a*W+b]!==T.DOCK)return false}return true};
for(let i=0,n=0;i<900&&n<46;i++){const x=312+rng()*60,z=8+rng()*190,rot=rng()<.5?0:1;const w=rot?3:7,d=rot?7:3;
  if(free2(x,z,w/2+.6,d/2+.6)&&!(x<342&&z>80&&z<96)){n++;
    const p=prop('container',x,z,{rot,h:ri(1,3),v:ri(0,4)});block(Math.floor(x-w/2),Math.floor(z-d/2),Math.ceil(x+w/2),Math.ceil(z+d/2))}}
// kranen langs het water
[20,34,77,179].forEach(z=>{prop('crane',337,z,{});block(335,z-2,340,z+2)});
// geparkeerde auto's langs de stoeprand (decor)
for(let i=0;i<120;i++){const vert=rng()<.5;if(vert){const x=pick(RX),side=rng()<.5?-1:1,z=RZ[0]+8+rng()*(RZ[3]-RZ[0]-16);if(RZ.some(q=>Math.abs(q-z)<9))continue;prop('car',x+side*(RW-1.2),z,{rot:1,v:ri(0,6),dir:side})}
  else{const z=pick(RZ),side=rng()<.5?-1:1,x=RX[0]+8+rng()*(RX[6]-RX[0]-16);if(RX.some(q=>Math.abs(q-x)<9)||(x>174&&x<208))continue;prop('car',x,z+side*(RW-1.2),{rot:0,v:ri(0,6),dir:side})}}
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
const bridges=[];RZ.forEach(z=>bridges.push({x0:185,x1:197,z0:z-RW-SW,z1:z+RW+SW}));

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
  if(x>=211&&x<247&&z>=88&&z<137)return 'Het Plein';
  if(x>=180&&x<202)return 'De Gracht';
  if(z<33)return x<120?'Villapark':x<197?'Noorderpark':x<258?'Noordkade':'De Bajes';
  if(z>=197)return z>=226?'Het Strand':'Boulevard';
  if(x<26)return 'Westkust';if(x<126)return 'Westbuurt';if(x<180)return 'Centrum';if(x<258)return 'Oud-Zuid';if(x<308)return 'Zuidas';return 'De Haven'}
function setSolid(r,on){block(Math.floor(r.x0),Math.floor(r.z0),Math.ceil(r.x1),Math.ceil(r.z1),on?1:0)}
root.STAD_MAP={districtAt,setSolid,W,H,FL,T,RX,RZ,RW,SW,ground:g,solid,bridgeWalk,buildings,props,places,bridges,DISTRICTS,spawn,jailGate,
  at,walkable,canStand,nearestWalk,findPath,placeById:id=>places.find(p=>p.id===id),placeByPage:pg=>places.find(p=>p.page===pg)};
})(typeof window!=='undefined'?window:globalThis);
