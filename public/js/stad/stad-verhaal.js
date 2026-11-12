// Pixelstad: het verhaal. Missies zoals in een gangsterspel: drie opdrachtgevers met elk een eigen hoofdstuk, een rivaal (De Slang)
// en missies die uit echte doelen bestaan: ergens heen, een auto stelen en kortsluiten, iemand schaduwen zonder gezien te worden,
// foto's maken (door je ogen), een verklikker inhalen, knokken, sluipen langs bewaking, een kluis kraken, de politie afschudden.
// - Opdrachtgevers staan in de stad met een letter boven hun hoofd (J, K, L) en op de kaart. Loop erheen en druk op E.
// - Mislukt? Je kunt het meteen opnieuw proberen. Geslaagd: zwart geld (zelfde schaal als de straatklussen), XP en straat-XP.
// - Bewaard in S.stadVerhaal ({d:{missie:tijd}}). Elke missie betaalt één keer.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,E=K.E,T=M.T,$s=id=>document.getElementById(id);
const touch=matchMedia('(pointer:coarse)').matches;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const sv=()=>{try{save()}catch(e){}};
const fmtE=n=>{try{return fmt(n)}catch(e){return '€'+n}};
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(k*100);
const snap=(x,z)=>M.nearestWalk(x,z,14)||{x,z};
const st=()=>{if(!S.stadVerhaal||typeof S.stadVerhaal!=='object')S.stadVerhaal={d:{}};if(!S.stadVerhaal.d)S.stadVerhaal.d={};return S.stadVerhaal};
const done=id=>!!st().d[id];
// vaste punten van de kaart (M.A) als [x,z], met een kleine verschuiving
const A=(k,dx,dz)=>[M.A[k].x+(dx||0),M.A[k].z+(dz||0)];
function roadNear(x,z){let best=null,bd=1e9;for(let dz=-14;dz<=14;dz++)for(let dx=-14;dx<=14;dx++){const xi=Math.floor(x)+dx,zi=Math.floor(z)+dz;if(xi<2||zi<2||xi>=M.W-2||zi>=M.H-2)continue;
  const i=zi*M.W+xi;if(M.ground[i]!==T.ROAD||M.solid[i])continue;let ok=true;for(let a=-1;a<=1&&ok;a++)for(let b=-1;b<=1;b++){const j=(zi+a)*M.W+xi+b;if(M.solid[j]||M.ground[j]!==T.ROAD){ok=false;break}}if(!ok)continue;const d=dx*dx+dz*dz;if(d<bd){bd=d;best={x:xi+.5,z:zi+.5}}}
  return best||snap(x,z)}

/* ---------- de mensen van het verhaal ---------- */
const PPL={
 joop:{n:'Ome Joop',role:'Café Het Gat',L:'J',col:'#f2c230',at:A('cafe',3.5,1.4),ry:0,
   look:{skin:'#e9b98f',hair:'#d8d4cc',top:'#e8e4da',arm:'#e8e4da',pants:'#3a3c40',shoe:'#2a2c30',hat:'none',hs:'kalend',fh:'snor',age:2,col:'schort',fw:20,jaw:'rond'}},
 kees:{n:'Kees Brouwer',role:'Havenbaas',L:'K',col:'#3a8ad6',at:A('havenloods',6,1.4),ry:0,
   look:{skin:'#d9a27a',hair:'#8a6a3a',top:'#2f4a6a',arm:'#2f4a6a',pants:'#1d2531',shoe:'#3a2a1a',hat:'beanie',hatC:'#1a2a3a',hs:'kort',fh:'baard',age:1,col:'werk',fw:20,jaw:'hoekig'}},
 lin:{n:'Madame Lin',role:'Casino Royaal',L:'L',col:'#e05a9a',at:A('casino',5,1.4),ry:0,
   look:{skin:'#f1caa5',hair:'#151517',top:'#7a1a3a',arm:'#7a1a3a',pants:'#151517',shoe:'#151517',hat:'none',hs:'bob',age:1,col:'blouse',v:1,lip:'#b0203a',fw:16,jaw:'spits',acc:{oor:1}}},
 slang:{n:'De Slang',role:'Rivaal',col:'#3fbf5a',look:{skin:'#b97a52',hair:'#151517',top:'#1f5a2a',arm:'#1f5a2a',pants:'#151517',shoe:'#e8e4da',hat:'none',hs:'opgeschoren',fh:'sik',age:1,col:'leer',acc:{zon:1,kop:1}}},
 rat:{n:'Benny de Rat',role:'Verklikker',col:'#b8a1ff',look:{skin:'#e9b98f',hair:'#6a2a1a',top:'#8a8c90',arm:'#8a8c90',pants:'#3a3c40',shoe:'#2a2c30',hat:'cap',hatC:'#5a5d63',hs:'kort',fh:'stoppel',age:1,col:'hoodie'}},
 wout:{n:'Wout',role:'Man van De Slang',col:'#3fbf5a',look:{skin:'#d9a27a',hair:'#2a1d14',top:'#1f5a2a',arm:'#d9a27a',pants:'#1d2531',shoe:'#151517',hat:'none',hs:'kaal',fh:'ringbaard',age:1,col:'tank',w:1}},
 roller:{n:'De high roller',role:'Gast van het casino',col:'#f2c230',look:{skin:'#f1caa5',hair:'#c9a24a',top:'#d8d4cc',arm:'#d8d4cc',pants:'#d8d4cc',shoe:'#e8e4da',hat:'hat',hatC:'#e8d8a0',hs:'kuif',age:2,col:'pak'}},
 winkel:{n:'Winkelier',role:'',col:'#9aa1ab',look:{skin:'#b97a52',hair:'#151517',top:'#3a8ad6',arm:'#3a8ad6',pants:'#3a3c40',shoe:'#2a2c30',hat:'none',hs:'kort',fh:'snor',age:1,col:'schort'}},
 agent:{n:'Agent',role:'',col:'#4d7dff',look:{skin:'#e9b98f',hair:'#2a1d14',top:'#1d2a4a',arm:'#1d2a4a',pants:'#151c30',shoe:'#0e0f12',hat:'cap',hatC:'#1d2a4a',hs:'kort',col:'uniform'}},
 bewaker:{n:'Bewaker',role:'',col:'#ff3d52',look:{skin:'#d9a27a',hair:'#151517',top:'#1a1a1c',arm:'#1a1a1c',pants:'#1a1a1c',shoe:'#0e0f12',hat:'none',hs:'kaal',col:'uniform'}}};
const GIVERS=['joop','kees','lin'];

/* ---------- de missies ----------
 stap-soorten: go · talk · mini · car · drive · tail · foto · run · fight · loot · wanted · wait
 p = [x,z] (wordt op een begaanbare plek gezet) of de naam van een acteur */
const MIS=[
 {id:'j1',g:'joop',n:'Eerste klus',k:3,xp:20,
  intro:['Jij bent dat nieuwe gezicht. Mooi. In deze stad betaalt iedereen. Ook de winkels rond het plein.','Haal mijn geld op bij drie zaken. Vriendelijk vragen, en als dat niet werkt: minder vriendelijk.'],
  out:'Netjes. Je hebt het in je. Kom morgen terug, ik heb meer.',
  steps:[{t:'mini',p:A('elektro'),game:'timing',act:'Geld vragen',txt:'Haal het geld op bij de <b>elektronicazaak</b>',o:{title:'Overtuigen',sub:'Druk als het streepje in het groen staat',n:3,sp:1.5,w:.22}},
   {t:'mini',p:A('juwelier'),game:'timing',act:'Geld vragen',txt:'Nu de <b>juwelier</b> in het Centrum',o:{title:'Overtuigen',sub:'Hij kijkt je recht aan. Blijf rustig.',n:3,sp:1.9,w:.18}},
   {t:'talk',who:'winkel',at:A('apotheek',0,-1.5),lines:['Betalen? Aan Joop? Ik betaal niemand meer. Mijn neef staat achter.'],txt:'Praat met de eigenaar van de <b>apotheek</b>'},
   {t:'fight',who:'wout',name:'De neef',hp:90,win:.65,txt:'Laat de neef zien hoe het werkt'},
   {t:'talk',who:'winkel',lines:['Oké, oké! Hier. Zeg tegen Joop dat het niet meer gebeurt.'],txt:'Haal het geld op'},
   {t:'go',p:'joop',r:2.6,txt:'Breng het geld naar <b>Ome Joop</b>'}]},
 {id:'j2',g:'joop',n:'Wielen',k:4,xp:25,need:['j1'],
  intro:['Een klant wil een rode Alfa. Er staat er eentje bij de parkeergarage op de Zuidas.','Sleutels heb je niet nodig, toch? Breng hem naar Garage Van der Plaat. En hij heeft een tracker: wees snel.'],
  out:'Hij staat binnen. Van der Plaat is tevreden, dus ik ook.',
  steps:[{t:'car',at:A('parkeer'),col:'#c8202a',kind:'sport',name:'Alfa Spider',wire:.45,txt:'Steel de <b>rode Alfa</b> bij de parkeergarage'},
   {t:'drive',p:[M.A.garage.x,M.ZS[2]-M.RW+2],r:5,timer:80,tracker:28,txt:'Breng hem naar <b>Garage Van der Plaat</b>'}]},
 {id:'j3',g:'joop',n:'De verklikker',k:4,xp:30,need:['j2'],
  intro:['Iemand praat met de politie. Ik denk dat het Benny is, Benny de Rat.','Volg hem. Laat je niet zien. Als hij met een agent praat, wil ik foto\'s.'],
  out:'Benny. Ik wist het. Die praat voorlopig met niemand meer.',
  steps:[{t:'go',p:A('plein'),r:7,txt:'Zoek <b>Benny</b> op het plein'},
   {t:'tail',who:'rat',from:A('cafe',1,3),to:[371,288],near:4,far:30,txt:'Volg <b>Benny</b>. Niet te dichtbij, niet uit het oog'},
   {t:'foto',targets:['rat','agent'],spawn:{agent:[373,287]},txt:'Maak een <b>foto</b> van Benny en de agent'},
   {t:'run',who:'rat',time:40,txt:'Hij heeft je gezien! <b>Haal hem in</b>'},
   {t:'choice',who:'rat',line:'Niet slaan! Ik vertelde ze niks! Bijna niks!',opts:[{t:'Laat hem lopen',say:'Wegwezen. En hou je mond voortaan.',eff:'zacht'},{t:'Neem zijn geld af',say:'Hier, alles! Pak maar!',eff:'geld'}]},
   {t:'go',p:'joop',r:2.6,txt:'Terug naar <b>Ome Joop</b>'}]},
 {id:'j4',g:'joop',n:'Les voor de Slangen',k:6,xp:40,need:['j3'],
  intro:['De Slang heeft Benny betaald. Zijn boekhouding ligt in een kluis op het containerterrein.','Daar loopt bewaking. Sluip erin, kraak de kluis en breng me dat boekje.'],
  out:'Hier staat alles in. Wie hij betaalt, waar zijn geld zit. De Slang gaat dit voelen. Kees in de haven wil je spreken.',
  steps:[{t:'go',p:[(M.Z.yard[0]+M.Z.yard[2])/2,M.Z.yard[1]-2],r:4,txt:'Ga naar het <b>containerterrein</b>'},
   {t:'mini',p:[288,70],game:'kluis',d:.4,act:'Kluis kraken',guards:{zone:[M.Z.yard[0]+1,M.Z.yard[1]+1,M.Z.yard[2]-1,M.Z.yard[3]-1],n:3,R:9},txt:'Sluip naar de <b>kluis</b>. Blijf uit het licht van de bewaking'},
   {t:'loot',pts:[[288,73]],kind:'box',txt:'Pak het <b>boekje</b>',guards:1},
   {t:'wanted',stars:2,why:'inbraak',txt:'Het alarm gaat. <b>Schud de politie af</b>'},
   {t:'go',p:'joop',r:2.6,txt:'Breng het boekje naar <b>Ome Joop</b>'}]},
 {id:'k1',g:'kees',n:'Lossen',k:5,xp:40,need:['j4'],
  intro:['Joop zegt dat je kunt rijden. Mooi. Mijn busje staat vol, en de klanten wachten niet.','Drie adressen. De klok loopt. Krassen op de lak trek ik van je loon af.'],
  out:'Op tijd. Dat zie je niet vaak in deze haven.',
  steps:[{t:'car',at:A('havenloods',-8,1.4),col:'#e8e4da',kind:'van',name:'Busje van Kees',txt:'Stap in het <b>busje</b>'},
   {t:'drive',p:[M.A.drogist.x,M.ZS[4]-3],r:6,timer:200,txt:'Lever af in de <b>Westbuurt</b>'},
   {t:'drive',p:[M.A.boulevard.x,M.ZS[7]-3],r:6,txt:'Nu de <b>Boulevard</b>'},
   {t:'drive',p:[M.A.oosterstraat.x,M.ZS[6]+3],r:6,txt:'En de <b>Oosterstraat</b>',end:1},
   {t:'drive',p:[M.A.havenloods.x,M.ZS[1]-3],r:7,txt:'Breng het busje terug naar <b>de haven</b>'}]},
 {id:'k2',g:'kees',n:'Douane',k:6,xp:45,need:['k1'],
  intro:['Morgen komt de douane bij de hangar in de haven. Ze gaan iets vinden, en dat wordt de Slang z\'n spullen.','Peuter het hek open, leg dit pakket in de hangar en ga weg zonder dat iemand je ziet.'],
  out:'Hahaa. Morgen staat de Slang z\'n naam in de krant.',
  steps:[{t:'go',p:[M.Z.hangar[0]+6,M.Z.hangar[3]+2],r:5,txt:'Ga naar de <b>hangar in de haven</b>'},
   {t:'mini',p:A('hangar',0,1.5),game:'slot',d:.5,act:'Hek openpeuteren',guards:{zone:[M.Z.hangar[0]+2,M.Z.hangar[1]+2,M.Z.hangar[2]-2,M.Z.hangar[3]-2],n:2,R:8},txt:'Peuter het <b>hek</b> open'},
   {t:'mini',p:[568.5,67],game:'hold',d:2.5,act:'Pakket neerleggen',guards:1,txt:'Leg het <b>pakket</b> in de hangar'},
   {t:'go',p:[M.XS[7]-M.RW-2,M.ZS[1]+14],r:5,guards:1,txt:'Verdwijn <b>ongezien</b>'}]},
 {id:'k3',g:'kees',n:'Een rat aan boord',k:6,xp:50,need:['k2'],
  intro:['Een van mijn mannen werkt voor de Slang. Wout. Hij staat nu bij de pier te bellen.','Ga met hem praten. Op jouw manier.'],
  out:'Wout is weg en hij komt niet terug. Lin van het casino vroeg naar je. Ga maar.',
  steps:[{t:'talk',who:'wout',at:A('pier',-6,6),lines:['Wat moet jij? Kees heeft je gestuurd, hè. Dan los ik het zelf wel op.'],txt:'Praat met <b>Wout</b> op de pier'},
   {t:'fight',who:'wout',name:'Wout',hp:130,win:.6,dmg:1.2,txt:'Knokken met <b>Wout</b>'},
   {t:'run',who:'wout',time:45,txt:'Hij gaat ervandoor! <b>Pak hem</b>'},
   {t:'choice',who:'wout',line:'Oké, oké! De Slang betaalt me. Hij wil de haven. Morgen, bij het casino. Meer weet ik niet!',opts:[{t:'Zeg dat hij moet verdwijnen',say:'Ik ben al weg. Je ziet me nooit meer.',eff:'zacht'},{t:'Pak zijn telefoon',say:'Hier! Alle nummers staan erin.',eff:'geld'}]}]},
 {id:'l1',g:'lin',n:'Fiches',k:7,xp:60,need:['k3'],
  intro:['Jij bent dus degene over wie iedereen praat. Ga zitten. Nee, blijf maar staan.','De Slang wil mijn casino. Zijn bankier, een high roller, loopt hier rond met een pasje van de kluis van de Onderbank.','Pak dat pasje. En maak foto\'s van de camera\'s bij de bank. Dan praten we verder.'],
  out:'Het pasje en de camera\'s. Dan is het tijd voor het grote werk.',
  steps:[{t:'go',p:A('casinoPlein',-6,2),r:9,txt:'Zoek de <b>high roller</b> voor het casino'},
   {t:'lift',who:'roller',at:A('casinoPlein',-6,2),d:1.6,txt:'Sluip achter hem en <b>pak zijn pasje</b>'},
   {t:'go',p:A('bankPlein',0,2),r:10,txt:'Ga naar de <b>Onderbank</b>'},
   // twee camera's op de gevel van de bank, links en rechts van de deur op 4,6 m hoogte
   {t:'foto',targets:(b=>[[b.door.x-6,b.z1+.2,4.6],[b.door.x+6,b.z1+.2,4.6]])(M.placeById('bank')),txt:'Fotografeer de twee <b>camera\'s</b> boven de deur'},
   {t:'go',p:'lin',r:2.6,txt:'Terug naar <b>Madame Lin</b>'}]},
 {id:'l2',g:'lin',n:'De Onderbank',k:14,xp:120,need:['l1'],
  intro:['Vannacht. De kluis van de Onderbank. Daar ligt het geld van de Slang.','Steel een snelle auto, kraak de kluis, pak wat je dragen kunt en kom naar mijn jacht op de pier. Niet stoppen.'],
  out:'Dat ging de krant halen, en de Slang is blut. Welkom bij de familie.',
  steps:[{t:'car',at:A('casinoPlein',12,10),col:'#151517',kind:'sport',name:'Zwarte Porsche',wire:.6,txt:'Steel de <b>zwarte Porsche</b> bij het casino'},
   {t:'drive',p:[M.A.bank.x,M.ZS[3]-M.RW+2],r:6,txt:'Rij naar de <b>Onderbank</b>'},
   {t:'mini',p:A('bank',0,.6),game:'kluis',d:.75,act:'Kluis kraken',txt:'Kraak de <b>kluis</b>',timer:90},
   {t:'loot',pts:[A('bank',-3,1.6),A('bank',3,1.6),A('bank',0,2.8)],kind:'cash',txt:'Pak de <b>geldzakken</b>'},
   {t:'wanted',stars:3,why:'bankoverval',until:'drive',txt:'Naar de auto en <b>weg hier</b>!'},
   {t:'drive',p:A('jacht',0,6),r:7,txt:'Naar het <b>jacht van Lin</b> op de pier',keepWanted:1},
   {t:'wanted',stars:0,txt:'<b>Schud de politie af</b>'}]}];
const byId=id=>MIS.find(m=>m.id===id);
const avail=g=>MIS.filter(m=>m.g===g&&!done(m.id)&&(m.need||[]).every(done));
const giverOn=g=>{const m=MIS.filter(x=>x.g===g);return m.some(x=>(x.need||[]).every(done))};

/* ---------- acteurs (tellen mee in G.actors en worden getekend door stad-game) ---------- */
let scene=null;const keep=[];
function mkActor(key,x,z,o){const p=snap(x,z),pp=PPL[key]||PPL.winkel;const a=Object.assign({kind:'verhaal',key,x:p.x,z:p.z,ry:0,ph:rr(0,6),sp:0,look:Object.assign({},pp.look),nm:pp.n},o||{});G.actors.push(a);return a}
function rmActor(a){const i=G.actors.indexOf(a);if(i>=0)G.actors.splice(i,1)}
function moveTo(a,tx,tz,speed,dt){const dx=tx-a.x,dz=tz-a.z,d=Math.hypot(dx,dz);if(d<.15){a.sp=0;return true}const v=Math.min(speed*dt,d),nx=a.x+dx/d*v,nz=a.z+dz/d*v;let moved=false;
  if(M.canStand(nx,a.z,.3)){a.x=nx;moved=true}if(M.canStand(a.x,nz,.3)){a.z=nz;moved=true}const tr=Math.atan2(dx,dz);let r=tr-a.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;
  a.ry+=r*Math.min(1,dt*10);a.ph+=dt*speed*1.25;a.sp=Math.min(1.3,speed/4.2);a.stuck=moved?0:(a.stuck||0)+dt;return false}
function follow(a,path,speed,dt){if(!path||!path.length){a.sp=0;return true}const w=path[0];if(moveTo(a,w.x,w.z,speed,dt)||Math.hypot(w.x-a.x,w.z-a.z)<.4)path.shift();return !path.length}
const los=(a,b)=>G.los?G.los(a,b):true;
function sees(a,P,R,half){const dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);if(d>R)return 0;let g=Math.atan2(dx,dz)-a.ry;while(g>Math.PI)g-=Math.PI*2;while(g<-Math.PI)g+=Math.PI*2;if(Math.abs(g)>half)return 0;if(!los(a,P))return 0;return 1-d/R*.6}

/* ---------- markeringen ---------- */
let beam,ring,dia,coneMat;const cones=[],lootObjs=[];
function ensure3d(){if(beam)return;scene=G.scene();
  beam=new TH.Mesh(new TH.CylinderGeometry(.8,.8,60,10,1,true),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.3,blending:TH.AdditiveBlending,depthWrite:false,side:TH.DoubleSide}));beam.renderOrder=4;beam.visible=false;scene.add(beam);
  ring=new TH.Mesh(new TH.RingGeometry(1.3,1.8,24),new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;scene.add(ring);
  dia=new TH.Mesh(new TH.OctahedronGeometry(.32,0),new TH.MeshBasicMaterial({color:0xffd35a}));dia.scale.set(1,1.5,1);dia.visible=false;scene.add(dia);
  coneMat=new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.2,depthWrite:false})}
function mark(p,col){ensure3d();beam.visible=ring.visible=!!p;if(!p)return;beam.material.color.set(col||'#ffd35a');ring.material.color.set(col||'#ffd35a');beam.position.set(p.x,30,p.z);ring.position.set(p.x,.08,p.z)}
function cone(R,half){ensure3d();const g=new TH.CircleGeometry(R,16,-half,half*2);g.rotateX(-Math.PI/2);const m=new TH.Mesh(g,coneMat.clone());m.position.y=.07;m.renderOrder=3;scene.add(m);cones.push(m);return m}
function lootObj(p,kind){const g=new TH.Group(),c={box:0x8a6a42,cash:0x3fe395,bag:0x2a2c30}[kind]||0xd6a63e;const b=new TH.Mesh(new TH.BoxGeometry(.7,.5,.5),new TH.MeshLambertMaterial({color:c,emissive:c,emissiveIntensity:.25}));b.position.y=.28;g.add(b);
  const d=new TH.Mesh(new TH.OctahedronGeometry(.26,0),new TH.MeshBasicMaterial({color:0xffd35a}));d.position.y=1.5;g.add(d);g.userData.d=d;g.position.set(p.x,0,p.z);scene.add(g);lootObjs.push(g);return g}
// letters boven de opdrachtgevers (sprite met een pixelletter)
const letters={};
function letterSprite(L,col){const cv=document.createElement('canvas');cv.width=cv.height=32;const c=cv.getContext('2d');c.fillStyle='#000';c.fillRect(4,4,24,24);c.fillStyle=col;c.fillRect(6,6,20,20);c.fillStyle='#111';c.font='900 18px monospace';c.textAlign='center';c.textBaseline='middle';c.fillText(L,16,17);
  const t=new TH.CanvasTexture(cv);t.magFilter=t.minFilter=TH.NearestFilter;const s=new TH.Sprite(new TH.SpriteMaterial({map:t,depthTest:false,transparent:true}));s.scale.set(1.3,1.3,1);s.renderOrder=6;return s}

/* ---------- opdrachtgevers in de stad ---------- */
const GA={};
function giversSetup(){scene=G.scene();GIVERS.forEach(g=>{const pp=PPL[g],p=snap(pp.at[0],pp.at[1]);pp.p=p;
  const s=letterSprite(pp.L,pp.col);scene.add(s);letters[g]=s;
  G.spot({k:'verhaal',x:p.x,z:p.z,r:2.6,prio:1,h:3.1,col:pp.col,n:pp.n,sub:()=>{const a=avail(g)[0];return a?'Missie: '+a.n:'Nu niets'},show:()=>!RUN&&giverOn(g),act:()=>offer(g),
    dot:pp.col,dotR:400})})}
// voor de grote kaart: opdrachtgevers met een missie, en tijdens een missie je doel
G.verhaalMap=()=>{const out=[];if(RUN){const p=target();if(p)out.push({x:p.x,z:p.z,n:'Doel: '+String(RUN.s&&RUN.s.txt||'').replace(/<[^>]+>/g,''),c:'#ffd35a',ic:K.ic.route,pri:10,big:1})}
  else GIVERS.forEach(g=>{const pp=PPL[g];if(!pp.p||!giverOn(g))return;const a=avail(g)[0];out.push({x:pp.p.x,z:pp.p.z,n:pp.n+(a?' · '+a.n:' · '+pp.role),c:pp.col,ic:K.ic.talk||K.ic.route,pri:a?9:3,big:!!a})});return out};
function giverStep(dt,ts){GIVERS.forEach(g=>{const pp=PPL[g];if(!pp.p)return;const on=giverOn(g)&&!(RUN&&RUN.def.g!==g&&false);let a=GA[g];
  if(on&&!a){a=GA[g]=mkActor(g,pp.p.x,pp.p.z,{ry:pp.ry,giver:1})}if(a&&!G.actors.includes(a)&&on)G.actors.push(a);
  if(a){a.sp=0;a.ph+=dt*.3;const P=G.P,d=dist(a,P);if(d<8){const want=Math.atan2(P.x-a.x,P.z-a.z);let r=want-a.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;a.ry+=r*Math.min(1,dt*4)}}
  const s=letters[g];if(s){const has=on&&avail(g).length&&!RUN;s.visible=!!has;s.position.set(pp.p.x,3.6+Math.sin(ts*2.4+pp.p.x)*.15,pp.p.z)}})}
function look(key){const pp=PPL[key];return Object.assign({bg:'#1b1c22'},pp.look)}
function offer(g){const pp=PPL[g],list=avail(g);if(RUN)return;if(G.mission&&G.mission()){G.toast('Maak eerst je klus af','bad');return}
  if(!list.length){K.dialog({name:pp.n,role:pp.role,look:look(g),mood:'blij',col:pp.col,lines:[pick(['Rustig aan. Ik bel je als ik iets heb.','Niks voor je vandaag. Ga wat drinken.','Alles loopt. Kom later terug.'])],choices:[{t:'Tot later',ic:K.ic.no,f:()=>K.closeDialog()}],onClose:()=>{G.talking=false}});G.talking=true;return}
  const m=list[0];let li=0;G.talking=true;G.lookAt=GA[g]||null;
  const ch=()=>li<m.intro.length-1?[{t:'Verder',ic:K.ic.route,f:()=>{li++;K.say(m.intro[li],'neutraal',ch())}}]:[{t:'Ik doe het',sub:'Missie: '+m.n+' · '+fmtE(zS(m.k)),ic:K.ic.rob||K.ic.route,risk:m.k>8?3:m.k>4?2:1,f:()=>{K.closeDialog(true);G.talking=false;start(m)}},{t:'Nu even niet',ic:K.ic.no,f:()=>K.closeDialog()}];
  K.dialog({name:pp.n,role:pp.role+' · '+ (CH[g]||''),look:look(g),mood:'neutraal',col:pp.col,lines:[m.intro[0]],choices:ch(),onClose:()=>{G.talking=false;G.lookAt=null}})}
const CH={joop:'Hoofdstuk 1',kees:'Hoofdstuk 2',lin:'Hoofdstuk 3'};

/* ---------- een missie spelen ---------- */
let RUN=null;G.verhaal={run:()=>RUN,done,list:()=>MIS,start:id=>{const m=byId(id);if(m)start(m)},_next:()=>next(),_win:()=>win()};
function start(def){if(RUN)return;if(G.police&&G.police.active()){G.toast('Schud eerst de politie af','bad');return}ensure3d();
  RUN={def,i:-1,t:0,act:[],car:null,timer:null,guards:[],gsus:0,extra:{},fotoPrev:null};G.verhaalOn=true;
  titleCard(def.n,CH[def.g]+' · '+PPL[def.g].n);G.snd&&G.snd.fx('go');hud(true);next()}
function cleanup(){if(!RUN)return;const R=RUN;try{G.kraak&&G.kraak.stop();G.mini&&G.mini.active()&&G.mini.stop();if(K.dialogOpen&&K.dialogOpen())K.closeDialog(true)}catch(e){}G.talking=false;G.lookAt=null;R.act.forEach(rmActor);R.guards.forEach(g=>{rmActor(g);if(g.cone){scene.remove(g.cone)}});R.guards=[];
  lootObjs.forEach(o=>scene.remove(o));lootObjs.length=0;mark(null);if(dia)dia.visible=false;spotOff();
  if(R.car){if(G.driving&&G.car===R.car.v&&G.exitCar)G.exitCar(true);G.removeVehicle&&G.removeVehicle(R.car.v)}
  if(R.fotoPrev!=null&&G.setCam){G.setCam(R.fotoPrev,true)}G.missionPath=null;G.verhaalOn=false;RUN=null;hud(false)}
function fail(why){if(!RUN)return;const def=RUN.def;cleanup();G.snd&&G.snd.fx('bad');result(false,def,why)}
function win(){if(!RUN)return;const def=RUN.def,first=!done(def.id);let g=0;
  if(first){g=zS(def.k)+(RUN.bonus||0);S.cash+=g;if(typeof addZwart==='function')addZwart(g);if(typeof addXp==='function')addXp(def.xp||20);st().d[def.id]=Date.now();sv()}
  G.ev&&G.ev('verhaal');cleanup();G.snd&&G.snd.fx('lvl');result(true,def,null,g);
  if(typeof log==='function')try{log('Pixelstad: missie "'+def.n+'" geslaagd'+(g?' (+'+fmtE(g)+')':''),'ok')}catch(e){}}
function next(){const R=RUN;if(!R)return;R.i++;const s=R.def.steps[R.i];if(!s){win();return}
  R.s=s;s.st=0;s.busy=0;R.hint='';R.prog=null;spotOff();
  if(s.timer)R.timer={left:s.timer,max:s.timer};if(s.timer===0)R.timer=null;
  // bewaking voor deze en volgende stappen
  if(s.guards&&typeof s.guards==='object'){const z=s.guards.zone;for(let k=0;k<s.guards.n;k++){const g=mkActor('bewaker',rr(z[0]+2,z[2]-2),rr(z[1]+2,z[3]-2),{zone:z,R:s.guards.R||8,half:.62,sus:0,ry:rr(0,6.28)});g.cone=cone(g.R,g.half);R.guards.push(g)}}
  if(!s.guards&&R.guards.length){R.guards.forEach(g=>{rmActor(g);if(g.cone)scene.remove(g.cone)});R.guards=[]}
  const P=G.P,pt=v=>typeof v==='string'?(PPL[v]&&PPL[v].p)||(R.extra[v]):v?snap(v[0],v[1]):null;
  s.pp=pt(s.p);if(s.at&&s.t!=='car')s.pat=snap(s.at[0],s.at[1]);
  if(s.t==='talk'||s.t==='fight'||s.t==='choice'||s.t==='run'||s.t==='lift'){let a=R.extra[s.who];if(!a){const at=s.pat||P;a=R.extra[s.who]=mkActor(s.who,at.x+(s.pat?0:2),at.z,{});R.act.push(a)}s.a=a}
  if(s.t==='tail'){let a=R.extra[s.who];if(!a){a=R.extra[s.who]=mkActor(s.who,s.from[0],s.from[1],{});R.act.push(a)}s.a=a;a.path=M.findPath(a.x,a.z,s.to[0],s.to[1])||[];s.lost=0;s.sus=0;
    if(s.to){const ag=R.extra.agent||(R.extra.agent=mkActor('agent',s.to[0]+2,s.to[1]-1,{}));if(!R.act.includes(ag))R.act.push(ag)}}
  if(s.t==='foto'){s.left=s.targets.slice();s.targets.forEach(t=>{if(Array.isArray(t)){const g=new TH.Group();const b=new TH.Mesh(new TH.BoxGeometry(.5,.32,.32),new TH.MeshLambertMaterial({color:0x2a2c30}));g.add(b);const l=new TH.Mesh(new TH.BoxGeometry(.1,.1,.06),new TH.MeshBasicMaterial({color:0xff3d52}));l.position.set(0,0,.18);g.add(l);g.position.set(t[0],t[2],t[1]);G.scene().add(g);lootObjs.push(g);g.userData.d=l}});if(G.camMode!=='ogen'&&G.setCam){R.fotoPrev=G.camMode;G.setCam('ogen',true);G.toast(touch?'Door je ogen: richt de stip en tik':'Door je ogen: richt de stip en druk op E (of klik)','info')}}
  if(s.t==='car'){const p=roadNear(s.at[0],s.at[1]);const v={d:{name:s.name,max:s.kind==='sport'?24:15,col:s.col,kind:s.kind},x:p.x,z:p.z,ry:Math.PI/2,v:0,mesh:G.carMesh(s.col,s.kind,false),dmg:0,verhaal:1};
    v.mesh.position.set(v.x,0,v.z);v.mesh.rotation.y=v.ry;G.scene().add(v.mesh);G.addVehicle(v);R.car={v,wired:!s.wire};s.v=v;
    spotOn({k:'vcar',x:v.x,z:v.z,r:3.2,prio:1,h:2.4,col:'#ffd35a',n:s.wire?'Kortsluiten':'Instappen',sub:s.name,act:()=>carUse(s)})}
  if(s.t==='mini'){spotOn({k:'vmini',x:s.pp.x,z:s.pp.z,r:2.4,prio:1,h:2.2,col:'#ffd35a',n:s.act||'Doen',act:()=>miniUse(s)})}
  if(s.t==='loot'){s.left=s.pts.map(q=>snap(q[0],q[1]));s.objs=s.left.map(q=>lootObj(q,s.kind))}
  if(s.t==='wanted'){if(s.stars){G.police&&G.police.start({stars:s.stars,why:s.why||'verhaal'});}else if(!(G.police&&G.police.active())){next();return}}
  if(s.t==='talk')talkStep(s);if(s.t==='choice')choiceStep(s);if(s.t==='fight')s.wait=.6;
  if(s.t==='run'){s.left=s.time;s.a.flee=1;G.snd&&G.snd.fx('whistle')}
  if(s.t==='lift'){s.a.home={x:s.a.x,z:s.a.z};s.sus=0}
  route();hud()}
function target(){const R=RUN,s=R&&R.s;if(!s)return null;if(s.t==='car')return s.v;if(s.t==='loot')return s.left[0]||null;if(s.t==='foto'){const t=s.left[0];return typeof t==='string'?R.extra[t]:t?snap(t[0],t[1]):null}
  if(s.a&&s.t!=='tail')return s.a;if(s.t==='tail')return s.a;if(s.t==='wanted')return null;return s.pp||s.pat||null}
function route(){const p=target();if(!p){G.missionPath=null;return}G.missionPath=M.findPath(G.P.x,G.P.z,p.x,p.z)}
/* spots voor de stap (actieknop bij een plek of de auto) */
let SPT=null;function spotOn(o){spotOff();o.mis=1;o.drive=false;SPT=G.spot(o)}function spotOff(){if(SPT){G.unspot&&G.unspot(SPT);SPT=null}}
async function carUse(s){if(s.busy||G.driving)return;const R=RUN;if(!R.car.wired){s.busy=1;const r=await G.kraak.draad({d:s.wire,title:'Kortsluiten · '+s.name,vak:'kortsluit'});s.busy=0;if(!RUN||RUN!==R)return;
    if(r==='cancel')return;if(!r.ok){G.toast('De motor slaat niet aan. Nog een keer.','bad');G.police&&Math.random()<.35&&G.police.report(G.P.x,G.P.z,{why:'autodiefstal',stars:1});return}R.car.wired=true}
  G.snd&&G.snd.fx('engineStart');G.enterCar(s.v)}
async function miniUse(s){if(s.busy||!RUN)return;const R=RUN;s.busy=1;let r;
  if(s.game==='timing')r=await G.mini.timing(Object.assign({allow:1},s.o||{}));
  else if(s.game==='hold')r=await G.mini.hold({d:s.d||2,label:s.act});
  else if(s.game==='kluis')r=await G.kraak.kluis({d:s.d,vak:'kluis'});
  else if(s.game==='slot')r=await G.kraak.slot({d:s.d,vak:'inbraak'});
  else if(s.game==='draad')r=await G.kraak.draad({d:s.d,vak:'kortsluit'});
  s.busy=0;if(RUN!==R)return;if(r==='cancel'||r==null)return;
  if(r===true||r.ok||r==='ok'){G.ev&&G.ev('kraak');next()}
  else{s.tries=(s.tries||0)+1;if(R.guards.length&&s.game!=='timing'){R.gsus=1;fail('Het ging mis en de bewaking hoorde je');return}G.toast(s.tries>2?'Nog één keer, anders is het voorbij':'Mis. Probeer het opnieuw','bad');if(s.tries>3)fail('Het lukte niet')}}
function talkStep(s){const pp=PPL[s.who];let li=0;G.talking=true;G.lookAt=s.a;
  const go=()=>{if(s.a.x!=null&&dist(s.a,G.P)>3.4){setTimeout(go,200);return}
    const ch=()=>li<s.lines.length-1?[{t:'Verder',ic:K.ic.route,f:()=>{li++;K.say(s.lines[li],'neutraal',ch())}}]:[{t:'Verder',ic:K.ic.route,f:()=>{K.closeDialog(true);G.talking=false;G.lookAt=null;next()}}];
    K.dialog({name:pp.n,role:pp.role,look:look(s.who),mood:s.mood||'boos',col:pp.col,lines:[s.lines[0]],choices:ch(),onClose:()=>{G.talking=false;G.lookAt=null;if(RUN&&RUN.s===s&&!s.ok){s.wantTalk=1}}})};
  G.talking=false;s.wantTalk=1;s.go=()=>{s.wantTalk=0;G.talking=true;go()}}
function choiceStep(s){const pp=PPL[s.who];G.talking=true;G.lookAt=s.a;
  K.dialog({name:pp.n,role:pp.role,look:look(s.who),mood:'bang',col:pp.col,lines:[s.line],choices:s.opts.map(o=>({t:o.t,ic:o.eff==='geld'?K.ic.rob||K.ic.route:K.ic.no,f:()=>{
    if(o.eff==='geld'){const g=zS(.8);RUN.bonus=(RUN.bonus||0)+g;G.fx2&&G.fx2.float('+'+fmtE(g),G.P.x,G.P.z,'#3fe395')}K.say(o.say,o.eff==='geld'?'bang':'blij',[{t:'Verder',ic:K.ic.route,f:()=>{K.closeDialog(true);G.talking=false;G.lookAt=null;
      const a=s.a;if(a){a.flee=2;a.fleeTo=snap(a.x+rr(-40,40),a.z+rr(-40,40))}next()}}])}})),onClose:()=>{G.talking=false;G.lookAt=null}})}
// foto: kijk je er recht naar (door je ogen)?
const V=new TH.Vector3(),F=new TH.Vector3();
function aimAt(t){const cam=G.camera();const p=typeof t==='string'?RUN.extra[t]:t;if(!p)return 0;const tx=p.x!=null&&!Array.isArray(t)?p.x:t[0],tz=p.z!=null&&!Array.isArray(t)?p.z:t[1],ty=Array.isArray(t)?t[2]:1.7;
  V.set(tx,ty,tz).sub(cam.position);const d=V.length();if(d>32)return 0;V.normalize();cam.getWorldDirection(F);const a=F.dot(V);return a>Math.cos(.075+.6/d)?1:0}
function fotoTry(){const R=RUN,s=R&&R.s;if(!s||s.t!=='foto')return false;if(G.camMode==='boven'){G.toast('Wissel naar een andere camera (V) om te richten','info');return true}
  const i=s.left.findIndex(t=>aimAt(t));G.flash&&G.flash('#ffffff',.6);G.snd&&G.snd.fx('click');if(i<0){G.toast('Niets op de foto. Richt de stip erop','bad');return true}
  s.left.splice(i,1);G.toast('Klik! Foto '+(s.targets.length-s.left.length)+' van '+s.targets.length,'ok');if(!s.left.length){setTimeout(()=>{if(R.fotoPrev!=null&&G.setCam){G.setCam(R.fotoPrev,true);R.fotoPrev=null}next()},500)}else route();return true}
G.verhaalAct=()=>fotoTry()||talkTry();
function talkTry(){const s=RUN&&RUN.s;if(s&&s.t==='talk'&&s.wantTalk&&s.a&&dist(s.a,G.P)<3.4){s.go();return true}return false}
const i0=setInterval(()=>{if(!G.interact)return;clearInterval(i0);const prev=G.interact;G.interact=function(){if(RUN&&G.verhaalAct())return true;return prev()}},400);

/* ---------- elke frame ---------- */
function step(dt){const R=RUN;if(!R)return;const P=G.P,s=R.s;if(!s)return;R.t+=dt;
  if(R.timer){R.timer.left-=dt;if(R.timer.left<=0){fail('Te laat');return}}
  // gepakt door de politie = mislukt
  if(G.police&&G.police._s&&G.police._s.ending){fail('De politie had je te pakken');return}
  if(R.car&&R.car.v&&R.car.v.dmg>=100&&!G.driving){fail('De auto is total loss');return}
  // bewaking
  R.guards.forEach(g=>{if(!g.wp||moveTo(g,g.wp.x,g.wp.z,1.4,dt)||g.stuck>1.2){g.wait=(g.wait||0)-dt;g.sp=0;g.ry+=Math.sin(R.t*1.3+g.x)*dt*.8;if(g.wait<=0){g.wait=rr(1,2.6);g.wp=snap(rr(g.zone[0]+2,g.zone[2]-2),rr(g.zone[1]+2,g.zone[3]-2))}}
    const v=G.hidden?0:sees(g,P,g.R,g.half),noise=Math.hypot(P.vx,P.vz)>7&&dist(g,P)<6?.8:0,k=Math.max(v*1.6,noise);g.sus=clamp(g.sus+(k?k*dt*1.2:-dt*.3),0,1);
    if(g.cone){g.cone.position.set(g.x,.07,g.z);g.cone.rotation.y=g.ry-Math.PI/2;g.cone.material.color.setRGB(1,.83-g.sus*.6,.35-g.sus*.3);g.cone.material.opacity=.18+g.sus*.28}});
  R.gsus=R.guards.reduce((a,g)=>Math.max(a,g.sus),0);if(R.gsus>=1){if(!R.alarmed){R.alarmed=1;R.guards.forEach(g=>{if(g.cone)g.cone.visible=false});fail('De bewaking heeft je gezien')}return}
  // weglopende mensen
  R.act.forEach(a=>{if(a.flee===2&&a.fleeTo){if(moveTo(a,a.fleeTo.x,a.fleeTo.z,4,dt)||a.stuck>1){a.flee=0;rmActor(a)}}});
  const hold=!!(G.K[' ']||G.K.f||G.K.e||G.actHold);
  switch(s.t){
  case 'go':{if(s.p==='joop'||s.p==='kees'||s.p==='lin'){const gp=PPL[s.p].p;if(dist(P,gp)<(s.r||2.6)&&!G.driving){next();return}}else if(s.pp&&dist(P,s.pp)<(s.r||3)){next();return}break}
  case 'car':{if(G.driving&&G.car===s.v){next();return}if(G.driving&&G.car!==s.v)R.hint='Stap uit, je hebt de goede auto nodig';else R.hint='';if(SPT){SPT.x=s.v.x;SPT.z=s.v.z}break}
  case 'drive':{const inCar=G.driving&&(!R.car||G.car===R.car.v);R.hint=inCar?'':(R.car?'Stap weer in de auto':'Je hebt een auto nodig');
    if(s.tracker&&!R.tracked&&R.t>(s.tracker||30)&&inCar){R.tracked=1;G.toast('De tracker verraadt je! Politie onderweg','bad');G.police&&G.police.report(P.x,P.z,{why:'autodiefstal',stars:1})}
    if(R.tracked&&G.police&&G.police.active()&&s.tracker){R.hint='Eerst de politie kwijt, dan pas naar de garage'}
    if(inCar&&dist(G.car,s.pp)<s.r){if(s.tracker&&R.tracked&&G.police&&G.police.active()){/* eerst afschudden */}else{if(s.end)R.timer=null;if(R.i===R.def.steps.length-1||R.def.steps.slice(R.i+1).every(x=>x.t==='wanted'&&!(G.police&&G.police.active()))){G.exitCar&&G.exitCar(true)}next();return}}
    break}
  case 'wanted':{if(s.until==='drive'){const nx=R.def.steps[R.i+1];if(G.driving&&R.car&&G.car===R.car.v){next();return}R.hint='';break}if(!(G.police&&G.police.active())){G.toast('Je bent de politie kwijt','ok');next();return}break}
  case 'loot':{for(let i=s.left.length-1;i>=0;i--){if(dist(P,s.left[i])<1.5&&!G.driving){scene.remove(s.objs[i]);s.left.splice(i,1);s.objs.splice(i,1);G.snd&&G.snd.fx('grab');G.toast('Gepakt ('+(s.pts.length-s.left.length)+'/'+s.pts.length+')','ok')}}
    R.prog=1-s.left.length/s.pts.length;if(!s.left.length){next();return}break}
  case 'talk':{const d=dist(P,s.a);s.a.sp=0;s.a.ry=Math.atan2(P.x-s.a.x,P.z-s.a.z);R.hint=d<3.4?(touch?'Tik om te praten':'Druk op E om te praten'):'';if(s.wantTalk&&d<2.2&&!G.talking&&!G.driving){s.go()}break}
  case 'fight':{const d=dist(P,s.a);if(d>2.2){moveTo(s.a,P.x,P.z,4.6,dt);break}s.a.sp=0;s.wait-=dt;if(s.wait>0||s.busy||G.driving)break;s.busy=1;
    G.mini.vecht({name:s.name,short:s.name.split(' ').pop(),sub:'Ontwijk de klap, sla dan terug',hp:s.hp,dmg:s.dmg||1,win:s.win||.65,pow:1,vak:'vecht'}).then(r=>{if(RUN!==R)return;s.busy=0;
      if(r&&r.ok){G.snd&&G.snd.fx('punch');const nx=R.def.steps[R.i+1];if(!nx||nx.who!==s.who){s.a.flee=2;s.a.fleeTo=snap(s.a.x+rr(-30,30),s.a.z+rr(-30,30))}next()}else if(r==='cancel'){s.wait=2;G.toast('Je kunt niet weglopen. Vechten!','bad')}else fail('Je ging neer')});break}
  case 'run':{const a=s.a;s.left-=dt;R.prog=null;if(s.left<=0){fail('Hij is ontsnapt');return}
    s.rp=(s.rp||0)-dt;if(s.rp<=0&&(!a.fleeTo||a.stuck>.8||dist(a,a.fleeTo)<2||dist(a.fleeTo,P)<8)){s.rp=.6;const ang=Math.atan2(a.x-P.x,a.z-P.z)+rr(-.9,.9);a.fleeTo=snap(a.x+Math.sin(ang)*22,a.z+Math.cos(ang)*22);a.path=M.findPath(a.x,a.z,a.fleeTo.x,a.fleeTo.z)}
    const tired=clamp(1-(s.time-s.left)/s.time*.35,.6,1);if(a.path&&a.path.length)follow(a,a.path,7.6*tired,dt);else moveTo(a,a.fleeTo.x,a.fleeTo.z,7.6*tired,dt);
    if(dist(a,P)<1.4&&!G.driving){a.sp=0;a.flee=0;G.shake&&G.shake(.5);G.hitStop=.08;G.snd&&G.snd.fx('grab');next();return}break}
  case 'tail':{const a=s.a,d=dist(a,P);const done=follow(a,a.path,1.55,dt);
    // omkijken: af en toe blijft hij staan en kijkt achterom
    s.lt=(s.lt||rr(4,7))-dt;if(s.lt<0){s.look=(s.look||0)+dt;a.sp=0;a.ry=Math.atan2(P.x-a.x,P.z-a.z)+Math.sin(s.look*3)*.5;if(s.look>1.6){s.look=0;s.lt=rr(4,8)}}
    const v=(s.look>0?sees(a,P,14,.9):0)+(d<s.near?1:0);s.sus=clamp(s.sus+(v?dt*.9*v:-dt*.25),0,1);R.prog=null;R.sus=s.sus;
    if(s.sus>=1){fail('Benny had je door');return}if(d>s.far||(!los(a,P)&&d>14)){s.lost+=dt;R.hint='Je raakt hem kwijt!';if(s.lost>7){fail('Je bent hem kwijtgeraakt');return}}else{s.lost=0;R.hint=d<s.near+2?'Te dichtbij!':''}
    if(done&&!(s.look>0)){R.sus=0;next();return}break}
  case 'foto':{const any=s.left.some(t=>aimAt(t));dot(any);R.hint=G.camMode==='boven'?'Wissel van camera met V':any?(touch?'Tik om de foto te maken':'Druk op E of klik: foto'):'Richt de stip op het doel';
    const ag=R.extra.agent,ra=R.extra.rat;if(ag&&ra){ag.ry=Math.atan2(ra.x-ag.x,ra.z-ag.z);ra.ry=Math.atan2(ag.x-ra.x,ag.z-ra.z);ag.sp=ra.sp=0}break}
  case 'lift':{const a=s.a;if(!a.wp||moveTo(a,a.wp.x,a.wp.z,1.2,dt)||a.stuck>1)a.wp=snap(a.home.x+rr(-8,8),a.home.z+rr(-6,6));
    s.lt=(s.lt||rr(3,5))-dt;if(s.lt<0){a.sp=0;a.ry=Math.atan2(P.x-a.x,P.z-a.z);s.lk=(s.lk||0)+dt;if(s.lk>1.3){s.lk=0;s.lt=rr(2.5,5)}}
    const d=dist(P,a),front=sees(a,P,4.5,.8);if(front&&d<4.5)s.sus=clamp(s.sus+dt*.9,0,1);else s.sus=Math.max(0,s.sus-dt*.25);R.sus=s.sus;if(s.sus>=1){fail('Hij had je door en riep de beveiliging');return}
    let ang=Math.atan2(P.x-a.x,P.z-a.z)-a.ry;while(ang>Math.PI)ang-=Math.PI*2;while(ang<-Math.PI)ang+=Math.PI*2;const behind=Math.abs(ang)>1.6;
    if(d<1.9&&behind&&hold)s.st+=dt;else s.st=Math.max(0,s.st-dt*2);R.prog=s.st/s.d;R.hint=d<1.9&&!behind?'Niet van voren: ga achter hem staan':d<1.9?(touch?'Houd de knop vast':'Houd E vast'):'';
    if(s.st>=s.d){R.sus=0;G.snd&&G.snd.fx('grab');next();return}break}
  }
  if(s.t!=='foto')dot(false);
  // markering
  const p=target();if(p&&s.t!=='wanted'&&!(s.t==='drive'&&!G.driving)){mark(s.t==='loot'||s.t==='car'||s.t==='go'||s.t==='drive'||s.t==='mini'?p:null,'#ffd35a');if(dia){dia.visible=!!(s.a||s.t==='car');if(dia.visible){dia.position.set(p.x,(s.t==='car'?2.6:3.2)+Math.sin(R.t*3)*.12,p.z);dia.rotation.y+=dt*2}}}
  else if(s.t==='drive'&&!G.driving&&R.car){const v=R.car.v;mark(v);dia.visible=true;dia.position.set(v.x,2.6,v.z)}else{mark(null);if(dia)dia.visible=false}
  if(ring){const k=1+Math.sin(R.t*4)*.08;ring.scale.set(k,k,k)}lootObjs.forEach(o=>{o.userData.d.rotation.y+=dt*2});
  R.rt=(R.rt||0)+dt;if(R.rt>1.5){R.rt=0;route()}
  R.ht=(R.ht||0)+dt;if(R.ht>.1){R.ht=0;hud()}}
function dot(on){const d=document.querySelector('.sd-dot');if(d){d.classList.toggle('aim',!!on)}}

/* ---------- HUD: titel, opdracht onderin, klok, verdacht-meter ---------- */
const ui=document.createElement('div');ui.className='sd-vh';ui.hidden=true;document.body.appendChild(ui);
ui.innerHTML=`<div class="sd-vh-top"><small id="vhCh"></small><b id="vhN"></b><em id="vhT" hidden></em></div><div class="sd-vh-sus" id="vhSus" hidden><span>Opgemerkt</span><i><i></i></i></div>
 <p class="sd-vh-obj" id="vhObj"></p><small class="sd-vh-hint" id="vhHint"></small><i class="sd-vh-bar" id="vhBar" hidden><i></i></i><button class="sd-vh-x" id="vhX">Afbreken</button>`;
$s('vhX').addEventListener('click',()=>{if(RUN&&confirmQuit())fail('Je hebt de missie afgebroken')});
let qT=0;function confirmQuit(){const n=performance.now();if(n-qT<2500)return true;qT=n;G.toast('Nog een keer tikken om af te breken','info');return false}
function hud(on){if(on===false){ui.hidden=true;document.body.classList.remove('sd-vh-on');return}if(!RUN)return;ui.hidden=false;document.body.classList.add('sd-vh-on');const R=RUN,s=R.s;
  $s('vhCh').textContent=CH[R.def.g]+' · '+PPL[R.def.g].n;$s('vhN').textContent=R.def.n;
  const t=$s('vhT');t.hidden=!R.timer;if(R.timer){const l=Math.max(0,Math.ceil(R.timer.left));t.textContent=Math.floor(l/60)+':'+String(l%60).padStart(2,'0');t.classList.toggle('low',l<=15)}
  if(s){let txt=s.txt||'';if(s.t==='loot'&&s.pts.length>1)txt+=' ('+(s.pts.length-s.left.length)+'/'+s.pts.length+')';if(s.t==='foto'&&s.targets.length>1)txt+=' ('+(s.targets.length-s.left.length)+'/'+s.targets.length+')';
    if(s.t==='run')txt+=' · '+Math.max(0,Math.ceil(s.left))+' s';const o=$s('vhObj');if(o._t!==txt){o._t=txt;o.innerHTML=txt;o.classList.remove('go');void o.offsetWidth;o.classList.add('go')}}
  $s('vhHint').textContent=R.hint||'';const b=$s('vhBar');b.hidden=R.prog==null;if(R.prog!=null)b.firstElementChild.style.width=Math.round(clamp(R.prog,0,1)*100)+'%';
  const sus=Math.max(R.sus||0,R.gsus||0),sb=$s('vhSus');sb.hidden=!(sus>.02);if(sus>.02)sb.querySelector('i>i').style.width=Math.round(sus*100)+'%'}
// grote titel bij de start, en het resultaatscherm
const tc=document.createElement('div');tc.className='sd-vh-card';tc.hidden=true;document.body.appendChild(tc);
let tcT=0;function titleCard(n,sub){tc.innerHTML=`<small>${E(sub)}</small><b>${E(n)}</b>`;tc.hidden=false;tc.classList.remove('go');void tc.offsetWidth;tc.classList.add('go');clearTimeout(tcT);tcT=setTimeout(()=>{tc.hidden=true},3200)}
const rs=document.createElement('div');rs.className='sd-vh-res';rs.hidden=true;document.body.appendChild(rs);
function result(ok,def,why,g){const pp=PPL[def.g];G.talking=false;
  rs.className='sd-vh-res '+(ok?'ok':'bad');rs.innerHTML=`<div class="sd-vh-res-in"><small>${E(def.n)}</small><b>${ok?'Missie geslaagd':'Missie mislukt'}</b>
   ${ok?`<p>${E(def.out)}</p><div class="sd-vh-rw">${g?`<span>+${E(fmtE(g))}</span>`:'<span>Al eerder betaald</span>'}<span>+${def.xp||20} XP</span><span>Respect</span></div>`:`<p>${E(why||'Het liep mis.')}</p>`}
   <div class="sd-vh-btns">${ok?'':'<button class="btn" data-r="again">Opnieuw</button>'}<button class="btn ${ok?'':'ghost'}" data-r="ok">${ok?'Verder':'Stoppen'}</button></div></div>`;
  rs.hidden=false;rs.classList.remove('go');void rs.offsetWidth;rs.classList.add('go');
  rs.onclick=e=>{const b=e.target.closest('[data-r]');if(!b)return;rs.hidden=true;if(b.dataset.r==='again')start(def);else if(ok){const nx=MIS.find(m=>(m.need||[]).includes(def.id));if(nx&&nx.g!==def.g){G.msg&&G.msg(nx.g,PPL[nx.g].n+' wil je spreken. Je vindt '+(nx.g==='lin'?'haar':'hem')+' bij '+PPL[nx.g].role+'.')}}};
  if(ok&&G.msg){/* het nieuws pakt het op via G.ev */}}
addEventListener('keydown',e=>{if(rs.hidden)return;const k=e.key.toLowerCase();if(k==='enter'||k==='e'||k===' '||k==='escape'){e.preventDefault();e.stopImmediatePropagation();const b=rs.querySelector(k==='escape'?'[data-r="ok"]':'.btn:not(.ghost)')||rs.querySelector('[data-r]');b&&b.click()}},true);

/* ---------- koppelen aan de rest ---------- */
const hook=setInterval(()=>{if(!G.ready||!G.scene)return;clearInterval(hook);giversSetup();
  const f0=G.onFrame;G.onFrame=function(dt){f0&&f0(dt);try{const ts=performance.now()/1000;giverStep(dt,ts);if(!G.paused)step(dt);routeLine(dt)}catch(e){console.error(e)}};
  const md0=G.missionDots;G.missionDots=()=>{const out=md0?md0():[];if(RUN){const p=target();if(p)out.push({x:p.x,z:p.z,c:'#ffd35a',big:1});RUN.guards.forEach(g=>out.push({x:g.x,z:g.z,c:'#ff3d52'}));if(RUN.s&&RUN.s.a&&RUN.s.a!==p)out.push({x:RUN.s.a.x,z:RUN.s.a.z,c:'#b8a1ff'})}return out};
  // nieuwe speler: Joop stuurt een berichtje
  if(!done('j1')&&!S.stadVerhaalHi){S.stadVerhaalHi=1;sv();setTimeout(()=>{G.msg&&G.msg('joop','Kom eens langs bij Café Het Gat op het plein. Ik heb werk voor je.')},6000)}},150);
// telefoon-app: het verhaal per hoofdstuk, met route naar de volgende missie
const pa=setInterval(()=>{if(!G.phone||!G.phone.add||!G.ready)return;clearInterval(pa);
  G.phone.add({k:'verhaal',n:'Verhaal',ic:K.ic.rob||K.ic.talk,c:'#ffd35a',after:'berichten',badge:()=>RUN?0:GIVERS.filter(g=>giverOn(g)&&avail(g).length).length?1:0,
    render:(scr,head)=>{const n=MIS.filter(m=>done(m.id)).length;
      scr.innerHTML=head('Verhaal',n+' van '+MIS.length+' missies')+`<div class="sd-vl">${GIVERS.map(g=>{const pp=PPL[g],on=giverOn(g),ms=MIS.filter(m=>m.g===g);
        return `<div class="sd-vl-ch${on?'':' off'}" style="--c:${pp.col}"><div class="sd-vl-h"><i>${pp.L}</i><span><b>${E(CH[g])} · ${E(pp.n)}</b><small>${E(on?pp.role:'Nog niet bekend')}</small></span>${on&&avail(g).length&&!RUN?`<button class="btn" data-vroute="${g}">Route</button>`:''}</div>
          <ul>${ms.map(m=>{const d=done(m.id),nx=!d&&(m.need||[]).every(done);return `<li class="${d?'ok':nx?'nx':''}"><span>${d?'✓':nx?'▶':'·'}</span>${on||d?E(m.n):'???'}<em>${d?'Gedaan':nx?fmtE(zS(m.k)):''}</em></li>`}).join('')}</ul></div>`}).join('')}</div>`},
    click:(t,close)=>{const b=t.closest('[data-vroute]');if(!b)return false;const pp=PPL[b.dataset.vroute];close();G.setWaypoint&&G.setWaypoint(pp.p.x,pp.p.z,pp.n);return true}})},500);
// de opdrachtgevers als contacten in je telefoon (berichten)
const cn=setInterval(()=>{if(!G.contacts)return;clearInterval(cn);GIVERS.forEach(g=>{const pp=PPL[g];if(!G.contacts[g])G.contacts[g]={n:pp.n,look:Object.assign({bg:'#1b1c22'},pp.look),col:pp.col}})},300);

/* ---------- route op straat: lichtpuntjes over de grond naar je doel (missie of gemarkeerde plek) ---------- */
let RL=null;const RN=90;
function routeLine(dt){if(!RL){const g=new TH.PlaneGeometry(.34,.34);g.rotateX(-Math.PI/2);RL=new TH.InstancedMesh(g,new TH.MeshBasicMaterial({color:0xffd35a,transparent:true,opacity:.85,depthWrite:false}),RN);RL.renderOrder=3;RL.frustumCulled=false;G.scene().add(RL);RL.userData.t=0}
  const path=G.missionPath&&G.missionPath.length?G.missionPath:(G.waypoint&&G.gpsPath&&G.gpsPath.length?G.gpsPath:null);
  const show=path&&!G.paused&&localStorageOk();if(!show){RL.count=0;return}
  RL.material.color.set(G.missionPath&&G.missionPath.length?'#ffd35a':'#ff4fd8');RL.userData.t+=dt*2.4;const P=G.P,m=new TH.Matrix4(),sp=1.6;let n=0,px=P.x,pz=P.z,s=sp-(RL.userData.t%sp);
  for(let i=0;i<path.length&&n<RN;i++){const q=path[i],dx=q.x-px,dz=q.z-pz,L=Math.hypot(dx,dz);if(L<1e-4)continue;while(s<L&&n<RN){const x=px+dx/L*s,z=pz+dz/L*s;if(Math.hypot(x-P.x,z-P.z)>1.4){m.makeTranslation(x,.09,z);RL.setMatrixAt(n++,m)}s+=sp}s-=L;px=q.x;pz=q.z}
  RL.count=n;RL.instanceMatrix.needsUpdate=true}
function localStorageOk(){try{return localStorage.getItem('stad_routelijn')!=='0'}catch(e){return true}}
})();
