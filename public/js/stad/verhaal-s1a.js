// Seizoen 1 (nieuw) · proloog en hoofdstuk 1–5: Het dossier, Zes pizza's, Driehonderd, Gymles, Licht uit, Rafiqs regels.
// Plus: Hugo's vertelzinnen (n01–n40), Hugo's bord, de vaste plekken en adressen van het seizoen.
(function(){
'use strict';
const G=window.STAD,M=window.STAD_MAP,TH=window.THREE;if(!G||!M||!TH||!G.s1)return;
const S1=G.s1,PI=Math.PI,sin=Math.sin,cos=Math.cos;
let ST,C,B,K,L;
/* ---------- Hugo Lindeboom: de vertelzinnen van seizoen 1 (audio/verhaal/verteller/nNN.mp3) ---------- */
const NT={
 n01:'Dit zou een verhaal over Big Ray worden. Zes jaar hing hij in het midden van mijn bord.',
 n02:'Eén streep naar Rafiq, van Lounge Sahara. Een kleine koper, dacht ik. Ik zat ernaast.',
 n03:'Op een nacht lag er een rode fiets op de Noordkade. Van wie hij was, wist ik toen nog niet.',
 n04:'Lounge Sahara, aan de Boulevard. Iedereen kende de voorkant. Bijna niemand kende de achterkamer.',
 n05:"Die kamer heb ik later gezien, op foto's van de politie. Toen was hij al bijna leeg.",
 n06:'Zo begint het bijna altijd. Niet met een wapen. Met een cadeau.',
 n07:"Zes briefjes van vijftig, voor zes pizza's. Zijn vader moest er drie dagen voor sjouwen.",
 n08:'Op het sportveld was hij gewoon een jongen van zestien. Zo zag iedereen hem nog.',
 n09:'Van de flats in de Westbuurt naar de torens op de Zuidas. Tien minuten fietsen. Een ander leven.',
 n10:'Agent Kramer schreef die avond twee regels in zijn boekje. Eén ervan ging over een achterlicht.',
 n11:'In de Villawijk kregen de oude dealers ineens minder telefoontjes. Op Het Eiland begon iemand te tellen.',
 n12:'Twee telefoons. Eén voor zijn moeder, één voor Rafiq. Er ging er altijd één op het verkeerde moment.',
 n13:'Dex kende hem sinds groep drie. Die avond in de kooi was het tussen hen nog simpel. Voor het laatst.',
 n14:'Twee lekke banden. Geen enkel rapport vermeldt ze. Toch begon daar iets.',
 n15:'Rafiq leerde hem dat een deur vanzelf opengaat, als je maar lang genoeg blijft staan.',
 n16:'Eerste rapportage. Sahara draait meer geld dan een shishazaak kan draaien. Waar komt dat vandaan?',
 n17:'Ik had hem toen al op de foto. Een rode jas bij de achterdeur. Ik keek eroverheen.',
 n18:'Een hoek aan de Tramlaan, bij de speeltuin. Overdag spelen er kinderen. In de avond staat er een jongen.',
 n19:'Om tien voor elf reed tram zeven over de Tramlaan. Op de vierde bank zat iemand die hem kende.',
 n20:'Vanaf die avond liep hij anders door de Westbuurt. Mensen gingen opzij. Dat hoorde ik pas later.',
 n21:'In de haven gaat niks van A naar B zonder een handtekening. De vraag is alleen wiens handtekening.',
 n22:'Zijn vader loste die nacht containers op de Containerkade. Tweehonderd meter verder regelde zijn zoon er een.',
 n23:'Tweede rapportage. Rafiq reed niet meer alleen. Naast hem zat de bezorger van de achterdeur.',
 n24:'Ik trok een streep onder Rafiq en schreef erbij: de jongen in de rode jas. Wie is dit eigenlijk?',
 n25:'Zeventien. Op zijn verjaardag zat hij naast Rafiq op de bank. Voor wie binnenkwam, waren ze even groot.',
 n26:'Derde rapportage. Een filmpje van een feest in Sahara. Nu had de jongen in de rode jas een gezicht.',
 n27:'Over De Harp is het één minuut fietsen. Achter je de stad. Aan de overkant het geld.',
 n28:'Big Ray liet zich nooit fotograferen. Die avond zat een pizzajongen naast hem en at van zijn calzone.',
 n29:'Een sporttas in een flat in de Westbuurt. Twee kilo. Het veiligste adres van de stad, dacht Rafiq.',
 n30:'Zondagmiddag, de Boulevard. Busjes, lint, Rafiq zonder handboeien. Toen fietste de rode jas voorbij.',
 n31:'Die dinsdag bestelde Ray weer een calzone. Giovanni pakte hem zelf in. Daarna heeft hij er nooit over gepraat.',
 n32:'Ray stelde nooit twee keer dezelfde vraag. Iedereen op Het Eiland wist dat. Luca nog niet.',
 n33:'Dat bericht staat in het dossier. Rafiq las het binnen een minuut.',
 n34:'De Noordkade, twee uur in de nacht. Het regende. Dat staat in elk rapport, alsof het ertoe doet.',
 n35:'Havenloods zeven staat er nog. Er hangt geen lamp meer. Niemand zegt wat daar die nacht gebeurde.',
 n36:'Dex belde om zijn vriend te zoeken. Hij vond hem niet. Hij gaf ze wel een adres.',
 n37:'Bilal werkte twaalf jaar voor Rafiq. Het telefoontje duurde negentien seconden.',
 n38:'Ray heeft nooit iemand een bevel gegeven. Hij gaf je alleen iets in handen.',
 n39:'Een achterlicht dat knippert. Meer heeft de camera op de Noordkade die nacht niet opgenomen.',
 n40:'Vierde rapportage. Rafiq is van mijn bord. De jongen niet. Ik weet nog steeds niet hoe hij heet.'};
S1.NT=NT;
function reg(){ST=S1.ST;C=S1.C;B=S1.B;K=S1.K;L=S1.L;
try{if(G.verteller&&G.verteller.tekst)Object.assign(G.verteller.tekst,NT)}catch(e){}
const {F,fx,eur,meter,zetMeter,geld,plusF,A,W,W3,walk,P,naar,voor,tijd,Z,T_,cam,camNaar,rond,ots,verteller,titel,speel,keuze,sleep,hyp,
  doelNaar,fietsAf,zorgFiets,binnen,buiten,bericht,sein,mgTiming,mgHold,mgGesprek,licht,lichtKnop,echteRit,nepRit,levend,hoofdstuk}=S1;
const outfit=n=>{try{const s=ST.st();s.outfit=n;G.uiterlijk&&G.uiterlijk.situatie&&G.uiterlijk.situatie(n);G.avatarSync&&G.avatarSync()}catch(e){}};S1.outfit=outfit;
const dag=(d,h,m)=>{try{ST.avond(d)}catch(e){}tijd(h,m||0)};S1.dag=dag;
// vaste plekken van dit seizoen (bestaande kaart: zie de kaartvertaling in het draaiboek)
const PL=S1.PL={
 napoli:()=>A('napoli'),sahara:()=>A('sahara'),thuis:()=>A('thuis'),school:()=>A('school'),rapido:()=>A('rapido'),kooi:()=>A('voetbalveld'),
 hoek:()=>A('hoek'),speeltuin:()=>A('speeltuin'),politie:()=>A('politie'),ziekenhuis:()=>A('ziekenhuis'),hotel:()=>A('hotel'),jacht:()=>A('jacht'),jachthaven:()=>A('jachthaven'),
 noordkade:()=>A('noordkade'),havenloods:()=>A('havenloods'),containers:()=>A('containers'),douane:()=>A('douane'),kade:()=>A('kade'),brug:()=>A('brug'),
 brugNoord:()=>A('brug_noord'),brugZuid:()=>A('brug_zuid'),parkeergarage:()=>A('parkeergarage'),steeg:()=>A('sahara_achter'),ans:()=>A('ans'),rijtjeshuis:()=>A('rijtjeshuis'),
 zuidas:()=>A('zuidas'),villawijk:()=>A('villapark'),gracht:()=>A('gracht')};
// adressen (echte voordeuren, altijd dezelfde)
const AD=S1.AD={};
function adressen(){const nap=PL.napoli();
  AD.bakkal=S1.adres('Westbuurt','portiek',3,nap)||S1.adres('Westbuurt',null,3,nap);
  AD.dewit=S1.adres('Oud-Zuid','rij',4,{x:640,z:700})||S1.adres('Oud-Zuid',null,2);
  AD.toren=S1.adres('Zuidas','kantoor',1,A('zuidas'))||S1.adres('Zuidas',null,1);
  AD.villa=S1.adres('Villawijk','villa',2,A('villapark'))||S1.adres('Villawijk',null,2);
  AD.westbuurt2=S1.adres('Westbuurt','portiek',9,nap)||S1.adres('Westbuurt',null,9);
  AD.westbuurt3=S1.adres('Westbuurt','flat',4,PL.hoek())||S1.adres('Westbuurt',null,14)}
adressen();S1.adressen=adressen;
const pt=a=>a?{x:a.x,z:a.z}:PL.napoli();S1.pt=pt;
const adr=(a,f)=>(a&&a.adres)||f;S1.adr=adr;

/* ---------- Hugo's bord in zijn studio: stand 0 (Ray → Rafiq), 1 (+ de jongen in de rode jas ?), 2 (Rafiq doorgekruist, draad los) ---------- */
let bordM=null;
function bordCanvas(stand){const cv=document.createElement('canvas');cv.width=336;cv.height=186;const c=cv.getContext('2d');const R=(x,y,w,h,k)=>{c.fillStyle=k;c.fillRect(x,y,w,h)};
  R(0,0,336,186,'#8a6a42');for(let i=0;i<40;i++)R((i*53)%330,(i*29)%180,3,2,'#7a5a36');
  const foto=(x,y,naam,kleur,leeg)=>{R(x-22,y-28,44,52,'#f1efe9');R(x-18,y-24,36,32,leeg?'#2a2c30':kleur);if(leeg){c.fillStyle='#4a4d54';c.beginPath();c.arc(x,y-12,8,0,7);c.fill();R(x-12,y-3,24,10,'#4a4d54')}else{R(x-8,y-20,16,14,'#c8956a');R(x-12,y-6,24,14,kleur)}
    c.fillStyle='#1a1a1c';c.font='bold 8px monospace';c.textAlign='center';c.fillText(naam,x,y+20);R(x-2,y-31,4,4,'#c0261e')};
  const draad=(a,b)=>{c.strokeStyle='#c0261e';c.lineWidth=2;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()};
  const ray=[168,62],raf=[96,122],jo=[176,150];
  draad(ray,raf);draad(ray,[262,118]);draad(ray,[42,40]);if(stand===1)draad(raf,jo);
  foto(...ray,'BIG RAY','#3a2a20',true);foto(...raf,'RAFIQ','#16161a');foto(262,118,'HAVEN','#2f4a6a');foto(42,40,'?','#5a5d63',true);
  R(270,152,62,22,'#f2e27a');c.fillStyle='#3a3020';c.font='7px monospace';c.textAlign='left';c.fillText('Sahara:',274,161);c.fillText('busjes na 00u',274,170);
  if(stand>=1){foto(jo[0],jo[1],'RODE JAS','#c0261e');c.fillStyle='#c0261e';c.font='bold 26px sans-serif';c.textAlign='center';c.fillText('?',jo[0]+34,jo[1]+2);
    if(stand===2){c.strokeStyle='#c0261e';c.lineWidth=2;c.beginPath();c.moveTo(jo[0],jo[1]-30);c.quadraticCurveTo(jo[0]-24,jo[1]-50,jo[0]-40,jo[1]-38);c.stroke()}}
  if(stand===2){c.strokeStyle='#c0261e';c.lineWidth=4;c.beginPath();c.moveTo(raf[0]-20,raf[1]-26);c.lineTo(raf[0]+20,raf[1]+22);c.moveTo(raf[0]+20,raf[1]-26);c.lineTo(raf[0]-20,raf[1]+22);c.stroke()}
  const t=new TH.CanvasTexture(cv);t.magFilter=t.minFilter=TH.NearestFilter;t.colorSpace=TH.SRGBColorSpace;return t}
function bord(stand){const p=W3('studio',8.9,1.62,1.12);if(!bordM){bordM=new TH.Mesh(new TH.PlaneGeometry(3.36,1.86),new TH.MeshLambertMaterial({map:bordCanvas(stand)}));bordM.binnenId=1;G.scene().add(bordM)}
  else{bordM.material.map=bordCanvas(stand);bordM.material.needsUpdate=true}bordM.position.set(p[0],p[1],p[2]);bordM.visible=true;F('hugo_bord',stand)}
S1.bord=bord;S1.bordWeg=()=>{if(bordM)bordM.visible=false};
// een scène in Hugo's studio: het bord, Hugo aan zijn bureau, een langzame camera en zijn zinnen
function studioScene(stand,lijnen,extra){return [{binnen:'studio'},{speler:false},{fn:()=>bord(stand)},
  {actor:'hugo',at:W('studio',4.2,2.75),ry:PI,anim:'schrijfzit',sitY:-.42},{fn:()=>{const a=C.acteur('hugo');if(a)a.g.binnenId=1}},
  cam(...W3('studio',8.6,1.75,4.6),...W3('studio',8.9,1.62,1.1),{fov:40}),{fade:'in',t:1},camNaar(...W3('studio',8.8,1.7,3.0),...W3('studio',8.9,1.62,1.1),8,{wacht:false}),
  ...(extra||[]),...lijnen.map(id=>verteller(id))]}
S1.studioScene=studioScene;
async function studio(t,stand,lijnen,extra){await speel(t,[{fade:'out',t:.6},...studioScene(stand,lijnen,extra),{fade:'out',t:.8},{weg:'hugo'}]);S1.bordWeg()}
S1.studio=studio;

/* ---------- de rode fiets op de Noordkade (proloog, epiloog): op zijn kant, achterlicht knippert ---------- */
let kadeFiets=null,kadeTick=0;
function fietsOpKade(on,jas){if(kadeFiets){kadeFiets.parent&&kadeFiets.parent.remove(kadeFiets);kadeFiets=null;clearInterval(kadeTick)}if(!on)return null;
  const k=PL.noordkade(),p=walk(k.x+4,k.z+3,6),g=new TH.Group();
  g.add(K.model([[1.7,.09,.09,0,.36,0,'#c0261e'],[.09,.09,.6,.55,.36,.22,'#c0261e'],[.06,.72,.72,-.78,.36,0,'#16161a'],[.06,.72,.72,.78,.36,0,'#16161a'],[.06,.5,.5,-.78,.36,0,'#3a3d44'],[.06,.5,.5,.78,.36,0,'#3a3d44'],
    [.5,.1,.36,.05,.42,.42,'#f1efe9'],[.06,.06,.5,-.7,.4,.5,'#2a2c30']]));
  const lamp=new TH.PointLight('#ff2a1a',2.4,6,2);lamp.position.set(.92,.38,.25);g.add(lamp);const kap=K.model([[.1,.08,.08,.92,.38,.04,'#ff3a2a',1]]);g.add(kap);
  if(jas)g.add(K.model([[.9,.06,.7,-.2,.04,.9,'#c0261e'],[.3,.05,.6,.35,.05,.95,'#a81e18']]));
  g.position.set(p.x,0,p.z);g.rotation.y=.6;G.scene().add(g);kadeFiets=g;let n=0;kadeTick=setInterval(()=>{n++;const on=n%2===0;lamp.visible=on;kap.visible=on},520);return p}
S1.fietsOpKade=fietsOpKade;S1.kadeStop=()=>{clearInterval(kadeTick);if(kadeFiets)kadeFiets.traverse(o=>{if(o.isLight)o.visible=false})};

/* =================== START: wacht op het welkomkaartje, dan de proloog =================== */
ST.step('start',{async start(){const t=S1.nieuw();let w=0;while(((!ST.st().welkom&&w<15)||document.querySelector('.sv-ov')||G.paused)&&w<1200){await sleep(300);w++}
  if(!levend(t))return;
  zetMeter('vertrouwen',40);zetMeter('naam',0);zetMeter('band_marco',50);zetMeter('band_elena',50);zetMeter('band_giulia',50);zetMeter('dex',60);
  ST.goto('s1_p')}});

/* =================== PROLOOG · Het dossier =================== */
hoofdstuk({id:'s1_p',na:'s1_h1',blokken:[
 async t=>{tijd(1,40);await speel(t,[{fade:'out',t:.01},...studioScene(0,['n01','n02'],[{snd:'click'}]),{fade:'out',t:.8},{weg:'hugo'}]);S1.bordWeg()},
 async t=>{await buiten();const p=fietsOpKade(true)||PL.noordkade();
  await speel(t,[{speler:false},cam(p.x-3.4,.5,p.z+2.6,p.x,.32,p.z,{fov:36}),{fade:'in',t:1.4},{snd:'gull'},camNaar(p.x-2.4,.42,p.z+1.8,p.x,.32,p.z,7,{wacht:false}),
    verteller('n03'),{snd:'heart'},{fade:'out',t:1},{fn:()=>fietsOpKade(false)},titel('ONDERWERELD · De Bezorger','Seizoen 1',3.4),titel('Drie weken eerder','Maandag',2.4)])}]});

/* =================== HOOFDSTUK 1 · Zes pizza's =================== */
const NAP={giovanni:[8,6.65],luca:[7.4,9.7]};S1.NAP=NAP;
const actIn=ids=>({fn:()=>ids.forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1})});S1.actIn=actIn;
// Rafiq en zijn jongens in de hoek (acteurs); jongen2 maakt plaats voor Bilal
function rafiqActeur(){return [{actor:'rafiq',at:W('sahara',21.4,13.9),ry:0,anim:'sit',sitY:-.38,y:.24},{actor:'bilal',at:W('sahara',23.1,13.9),ry:0,anim:'sit',sitY:-.38,y:.24},
  {fn:()=>{['rafiq','bilal'].forEach(k=>{const a=C.acteur(k);if(a)a.g.binnenId=1});B.toon('sahara','jongen2',false);zetRafiq(false)}}]}
function hoek(lucaZit){return [{speler:false},...rafiqActeur(),{actor:'luca',at:W('sahara',21.4,lucaZit?16.9:17.6),ry:PI,anim:lucaZit?'sit':'idle',sitY:-.42,y:lucaZit?.24:0},actIn(['luca'])]}
function hoekWeg(){['rafiq','bilal','luca','tarik'].forEach(k=>C.weg(k));B.toon('sahara','jongen2',true)}
// Rafiq als vaste figurant in zijn hoek als je zelf door Sahara loopt
let rafiqVast=null;
function zetRafiq(on){try{if(!on){if(rafiqVast)rafiqVast.g.visible=false;return}if(!rafiqVast){const p=W('sahara',21.4,13.9);rafiqVast=C.persoon(C.look('rafiq'),{x:p[0],z:p[1],ry:0,anim:'sit'});rafiqVast.sitY=-.38;rafiqVast.y=.24;rafiqVast.g.binnenId=1}
  rafiqVast.g.visible=B.waar()==='sahara'&&!F('rafiq_dood')}catch(e){}}
S1.zetRafiq=zetRafiq;
setInterval(()=>{if(rafiqVast&&B&&B.waar()!=='sahara')rafiqVast.g.visible=false},700);
async function zetBuitenSahara(){await buiten();const d=PL.sahara();G.P.x=d.x;G.P.z=d.z+2.2;G.P.ry=0}
Object.assign(S1,{rafiqActeur,hoek,hoekWeg,zetBuitenSahara});

hoofdstuk({id:'s1_h1',na:'s1_h2',outfit:'bezorger',blokken:[
 async t=>{dag(1,19,30);outfit('bezorger');fietsAf();await binnen('napoli');if(!levend(t))return;B.toon('napoli','giovanni',false);
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 1',"Zes pizza's",3),
   {actor:'giovanni',at:W('napoli',...NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',...NAP.luca),ry:PI,anim:'leun'},actIn(['giovanni','luca']),
   cam(...W3('napoli',11.6,2.3,11.2),...W3('napoli',7.6,1.4,7.8),{fov:44}),{fade:'in',t:1},camNaar(...W3('napoli',11.0,2.2,10.6),...W3('napoli',7.6,1.4,7.8),6,{wacht:false}),
   Z('giovanni','Twee voor een portiekflat in de Westbuurt. Vierde verdieping. De lift is weer kapot.'),Z('luca','Doet hij het ooit?'),
   Z('giovanni','Dan neem je de trap. Vai, ragazzo. Warm aankomen.',{mood:'blij'}),{fade:'out',t:.6}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli());
  sein('Fietsen: pijltjes/WASD · remmen: S · op en af: E','#3fe395')},
 async t=>{const a=AD.bakkal;await echteRit(t,[{adres:adr(a,'Westbuurt'),x:pt(a).x,z:pt(a).z,klant:'familie',pizzas:2,naam:'Familie Bakkal',id:'h1a'}]);
  if(!levend(t))return;await doelNaar(t,'Terug naar Bella Napoli',PL.napoli(),{actie:'Naar binnen',sub:'Bella Napoli',gebouw:'napoli'})},
 async t=>{await binnen('napoli');B.toon('napoli','giovanni',false);
  await speel(t,[{fade:'out',t:.01},{speler:false},{actor:'giovanni',at:W('napoli',...NAP.giovanni),ry:0,anim:'bel',prop:'telefoon'},{actor:'luca',at:W('napoli',...NAP.luca),ry:PI},actIn(['giovanni','luca']),
   cam(...W3('napoli',4.4,2.2,10.8),...W3('napoli',7.8,1.4,7.6),{fov:44}),{fade:'in',t:.6},
   {anim:'giovanni',a:'kok',prop:null},Z('giovanni',"Zes pizza's. Lounge Sahara, aan de Boulevard. Voor Rafiq."),Z('giovanni','Brengen, afrekenen, terugkomen. Daar niet blijven hangen.'),
   {anim:'luca',a:'carry',dozen:6},{fade:'out',t:.5}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli());try{G.fiets.last(6)}catch(e){}
  sein('Zes dozen achterop: rustig sturen, op tijd remmen','#ffd35a')},
 async t=>{if(!await doelNaar(t,'Lounge Sahara · Boulevard',PL.sahara(),{actie:'Afstappen',sub:'Lounge Sahara'}))return;try{G.fiets.last(0)}catch(e){}
  const d=PL.sahara(),mo={x:d.x+1.6,z:d.z+1.0},l=walk(d.x-1.2,d.z+3.4,3);const bu=G.binnen.uitsmijterBuiten;if(bu&&bu.g)bu.g.visible=false;
  await speel(t,[{speler:false},{actor:'mo',at:[mo.x,mo.z],ry:naar(mo,l),anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:naar(l,d),dozen:6},
   cam(d.x-9,3.2,d.z+12,d.x,2.4,d.z,{fov:46}),{snd:'tram'},verteller('n04'),
   rond(mo,naar(mo,l)+.9,3.4,1.8,1.5),Z('mo','Bella Napoli. Voor de baas?'),Z('luca',"Zes pizza's. Ik moet afrekenen."),
   {anim:'mo',a:'bel'},Z('mo','Tarik. Pizza komt binnen.'),{fade:'out',t:.5}]);
  C.weg('mo');C.weg('luca');if(bu&&bu.g)bu.g.visible=true},
 async t=>{await binnen('sahara');B.toon('sahara','uitsmijter',false);try{G.draag&&G.draag.zet(6)}catch(e){}
  await speel(t,[{speler:false},{actor:'tarik',at:W('sahara',13.9,31.9),ry:PI*.9,anim:'armen'},{actor:'luca',at:W('sahara',12.8,33.6),ry:PI,dozen:6},actIn(['tarik','luca']),
   cam(...W3('sahara',11.0,2.0,34.6),...W3('sahara',13.4,1.5,32.4),{fov:46}),{fade:'in',t:.5},
   T_('Tarik tilt het deksel van de bovenste doos een centimeter op. Ruikt. Laat het vallen.'),Z('tarik','Achterin. De hoek.'),{fade:'out',t:.4}]);
  C.weg('tarik');C.weg('luca');B.toon('sahara','uitsmijter',true);const q=W('sahara',13,30.4);G.P.x=q[0];G.P.z=q[1];G.P.ry=PI;
  zetRafiq(true);sein('Loop met de dozen naar achteren','#ffd35a')},
 async t=>{zetRafiq(true);const p=W('sahara',21.4,18.2);if(!await doelNaar(t,'De hoek van Rafiq',{x:p[0],z:p[1],binnen:'sahara'},{actie:'Dozen neerzetten',sub:'Rafiq'}))return;
  try{await G.draag.af({binnen:'sahara',plek:'rafiq_tafel'})}catch(e){try{G.draag.leeg()}catch(e2){}}
  await speel(t,[...hoek(),cam(...W3('sahara',17.4,1.9,19.0),...W3('sahara',21.4,1.2,14.6),{fov:40}),{fade:'in',t:.4},
   {anim:'rafiq',a:'tel',prop:'geld'},Z('rafiq','Zes. En niet één scheef.'),Z('luca','Vierentachtig euro, graag.'),
   cam(...W3('sahara',21.0,2.6,16.2),...W3('sahara',21.4,.6,15.2),{fov:34}),{snd:'cash'},T_('Rafiq telt het bedrag af zonder te kijken en schuift het over tafel.'),{anim:'rafiq',a:'sit',prop:null},{fade:'out',t:.4}]);
  hoekWeg();zetRafiq(true);geld(84,'kassa Sahara (voor Giovanni)');F('h1_kassa',84);const q=W('sahara',21.4,18.4);G.P.x=q[0];G.P.z=q[1];G.P.ry=PI;
  sein('Afgerekend. Terug naar Giovanni.','#3fe395')},
 async t=>{zetRafiq(true);const p=W('sahara',14,24);if(!await doelNaar(t,'Naar de uitgang',{x:p[0],z:p[1],binnen:'sahara'},{actie:'Verder',sub:'Lounge',r:3.4}))return;
  // het signaal: twee tikken met zijn ring tegen de waterpijp; Tarik stapt in je pad
  const l=W('sahara',14,24.6),tk=W('sahara',14.3,27.0);B.toon('sahara','uitsmijter',false);
  await speel(t,[{speler:false},{actor:'luca',at:l,ry:0},{actor:'tarik',at:W('sahara',15.6,29.6),ry:PI,anim:'armen'},...rafiqActeur(),actIn(['luca','tarik']),
   cam(...W3('sahara',21.0,1.7,15.4),...W3('sahara',14,1.3,24.6),{fov:30}),{wait:.6},
   cam(...W3('sahara',20.4,1.5,16.6),...W3('sahara',21.4,1.2,14.4),{fov:26}),{snd:'glass'},{wait:.35},{snd:'glass'},{anim:'rafiq',a:'point',naar:[tk[0],tk[1]]},
   T_('Twee tikken met zijn ring tegen de waterpijp. Twee vingers omhoog. Zijn ogen blijven op het geld.'),
   {move:'tarik',to:tk,t:1.2},cam(...W3('sahara',14,1.8,21.4),...W3('sahara',14.1,1.4,25.6),{fov:40}),{anim:'tarik',a:'duw',naar:'luca'},
   Z('tarik','Rustig, pizzaman. De baas is nog niet klaar met je.'),Z('luca','Hij heeft betaald. Tot op de cent.'),Z('tarik','Weet ik. Kom.'),
   {cam:{volg:'luca',af:[0,2.2,3.2],kijk:[0,1.2,-3]}},{par:[{move:'luca',to:W('sahara',21.4,17.6),t:3.2,wacht:false},{move:'tarik',to:W('sahara',20.2,18.6),t:3.2}]},{cam:null},{fade:'out',t:.4}]);
  C.weg('tarik');C.weg('luca');B.toon('sahara','uitsmijter',true)},
 async t=>{// aan tafel: laten zien, niet duwen. Luca spreekt het bedrag zelf uit.
  const r=await speel(t,[...hoek(true),{actor:'tarik',at:W('sahara',19.4,17.4),ry:PI*.85,anim:'armen'},actIn(['tarik']),
   cam(...W3('sahara',18.4,1.8,18.4),...W3('sahara',21.4,1.0,15.4),{fov:40}),{fade:'in',t:.5},T_('Rafiq knikt één keer. De jongens naast hem staan op en gaan.'),
   ots({x:W('sahara',21.4,16.9)[0],z:W('sahara',21.4,16.9)[1]},{x:W('sahara',21.4,13.9)[0],z:W('sahara',21.4,13.9)[1]},2.0,.7,2.0),
   Z('rafiq','Eén minuut. Hoeveel krijg je bij Giovanni? Per uur.'),Z('luca','Negen euro. Plus fooi.'),Z('rafiq','Plus fooi.'),{anim:'bilal',a:'lach'},
   cam(...W3('sahara',21.4,3.0,15.6),...W3('sahara',21.4,.5,15.4),{fov:30}),{anim:'rafiq',a:'give',prop:'geld'},
   {snd:'cash'},{wait:.35},{snd:'cash'},{wait:.35},{snd:'cash'},{wait:.35},{snd:'cash'},{wait:.35},{snd:'cash'},{wait:.35},{snd:'cash'},
   T_('Zes briefjes van vijftig. Eén voor één, in een rij. Eén per pizza.'),Z('rafiq',"Zes pizza's. Zes briefjes."),
   ots({x:W('sahara',21.4,13.9)[0],z:W('sahara',21.4,13.9)[1]},{x:W('sahara',21.4,16.9)[0],z:W('sahara',21.4,16.9)[1]},2.0,.7,2.0),{snd:'heart'},
   Z('luca','Dat is driehonderd euro.'),Z('rafiq','Je kunt tellen. Dat kunnen de meesten hier niet.'),{anim:'rafiq',a:'sit',prop:null},
   ots({x:W('sahara',21.4,16.9)[0],z:W('sahara',21.4,16.9)[1]},{x:W('sahara',21.4,13.9)[0],z:W('sahara',21.4,13.9)[1]},2.2,.8,2.0),
   Z('rafiq',"Jij komt overal binnen met zo'n doos. Niemand kijkt wat erin zit."),Z('rafiq','Ik heb ook klanten. Die bestellen soms iets anders dan pizza.'),
   Z('rafiq','Je rijdt toch al. Waarom niet twee keer betaald voor één rit? Interesse?'),
   cam(...W3('sahara',24.6,1.6,15.4),...W3('sahara',21.4,1.1,15.4),{fov:36}),
   keuze('luca','',[{t:'"Wat zou ik moeten doen?"',id:'ja'},{t:'"Ik bezorg alleen pizza."',id:'nee'}])]);
  if(!levend(t))return;F('h1_interesse',r);if(r==='ja')meter('vertrouwen',5);geld(300,'fooi van Rafiq');F('fooi300',1);
  await speel(t,[T_('Het geld gaat de rode jas in.'),Z('rafiq',r==='ja'?'Kom. Ik laat het je zien.':'Dat zei ik vroeger ook. Kom even kijken. Kijken kost niks.'),{fade:'out',t:.5}]);hoekWeg()},
 async t=>{// de gang en de achterkamer
  await binnen('sahara');
  const r=await speel(t,[{speler:false},{actor:'rafiq',at:W('sahara',2.4,11.4),ry:PI},{actor:'luca',at:W('sahara',2.2,12.6),ry:PI},{actor:'tarik',at:W('sahara',2.0,13.8),ry:PI},actIn(['rafiq','luca','tarik']),
   cam(...W3('sahara',2.2,2.0,14.6),...W3('sahara',2.2,1.4,8.0),{fov:46}),{fade:'in',t:.4},{snd:'close'},
   {par:[{move:'rafiq',to:W('sahara',2.4,5.6),t:3.2,wacht:false},{move:'luca',to:W('sahara',2.2,6.8),t:3.2,wacht:false},{move:'tarik',to:W('sahara',2.0,8.4),t:3.2}]},{snd:'open'},{snd:'telmachine'},
   {actor:'bilal',at:W('sahara',21.0,4.6),ry:PI,anim:'tel'},actIn(['bilal']),
   cam(...W3('sahara',2.6,2.4,6.4),...W3('sahara',10,1.0,3.2),{fov:52}),camNaar(...W3('sahara',6.0,2.2,6.0),...W3('sahara',17,1.0,3.0),6,{wacht:false}),verteller('n05'),
   {actor:'rafiq',at:W('sahara',19.2,5.6),ry:PI},{actor:'luca',at:W('sahara',20.6,5.8),ry:PI*.8,anim:'armen'},
   cam(...W3('sahara',22.4,2.0,6.4),...W3('sahara',19.8,1.2,4.6),{fov:40}),{wait:1.2},{anim:'rafiq',a:'give',prop:'geld',naar:'luca'},
   Z('rafiq','Voel maar.'),cam(...W3('sahara',20.4,2.6,6.6),...W3('sahara',20.4,1.0,5.4),{fov:30}),Z('rafiq','Vijfduizend. Een gewone maandag.'),
   cam(...W3('sahara',22.4,2.0,6.4),...W3('sahara',19.8,1.2,4.6),{fov:40}),
   Z('rafiq','Je vader werkt op de Containerkade. Slechte rug, toch?'),Z('luca','Hoe weet jij dat?'),Z('rafiq','Ik weet wie er bij mij binnenkomt.'),{anim:'rafiq',a:'idle',prop:null},
   Z('rafiq','Ik vraag je niet om te dealen. Doos erin, doos eruit. Vijftig per doos.'),
   keuze('luca','',[{t:'"Ja."',id:'ja'},{t:'"Nee."',id:'nee'}])]);
  if(!levend(t))return;
  if(r==='ja'){F('rafiq_ja','direct');F('tarief',50);meter('vertrouwen',10);await speel(t,[Z('rafiq','Snel besloten. Goed. Bilal regelt de rest.')])}
  else{const r2=await speel(t,[{anim:'rafiq',a:'give',prop:'geld'},{snd:'cash'},T_('Rafiq legt een tweede pak bovenop het eerste. Hij houdt ze samen omhoog, als een weegschaal.'),
     Z('rafiq','Honderd per doos. Jij bepaalt hoeveel ritten.'),cam(...W3('sahara',17.6,2.0,5.0),...W3('sahara',20.4,1.2,5.6),{fov:42}),{anim:'bilal',a:'leun'},
     Z('rafiq','Niemand hoeft het te weten. Giovanni ook niet.'),
     keuze('luca','',[{t:'"Oké. Honderd."',id:'ok'},{t:'"Ik moet erover nadenken."',id:'denk'}])]);if(!levend(t))return;F('tarief',100);
    if(r2==='ok'){F('rafiq_ja','na_bod');meter('vertrouwen',5);await speel(t,[Z('rafiq','Onderhandelaar. Dat mag één keer.')])}
    else{F('rafiq_ja','bedenktijd');await speel(t,[Z('rafiq','Denk maar. Morgen ligt er iets klaar. Haal je het, dan weet ik genoeg.')])}}
  await speel(t,[{anim:'bilal',a:'tel'},{snd:'telmachine'},{fade:'out',t:.5}]);['rafiq','luca','tarik','bilal'].forEach(k=>C.weg(k))},
 async t=>{// naar buiten: Mo, het geld in zijn zak
  await zetBuitenSahara();const d=PL.sahara(),l=walk(d.x+.5,d.z+2.6,3),mo={x:d.x+1.6,z:d.z+1.0};const bu=G.binnen.uitsmijterBuiten;if(bu&&bu.g)bu.g.visible=false;
  await speel(t,[{speler:false},{actor:'mo',at:[mo.x,mo.z],ry:naar(mo,l),anim:'armen'},{actor:'luca',at:[l.x,l.z],ry:PI*.1},rond(l,PI*.8,4.2,1.9,1.5),{fade:'in',t:.5},
   Z('mo','Rij voorzichtig, pizzaman.',{mood:'blij'}),cam(l.x-1.5,1.6,l.z+3.2,l.x+18,3,l.z+40,{fov:44}),{snd:'tram'},verteller('n06'),{fade:'out',t:.5}]);
  C.weg('mo');C.weg('luca');if(bu&&bu.g)bu.g.visible=true;
  // geen terugrit: Bella Napoli, de jas aan de haak
  geld(-84,'kassa Bella Napoli');await binnen('napoli');B.toon('napoli','giovanni',false);
  await speel(t,[{speler:false},{actor:'giovanni',at:W('napoli',...NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',2.2,7.4),ry:-PI/2},actIn(['giovanni','luca']),
   cam(...W3('napoli',5.2,2.0,10.4),...W3('napoli',2.0,1.4,7.0),{fov:44}),{fade:'in',t:.4},
   T_('Luca hangt de rode jas aan de haak.'),{fn:()=>outfit('school')},Z('giovanni','Vierentachtig. Klopt. Je bleef lang weg, ragazzo.'),Z('luca','Druk daar.'),Z('giovanni','Naar huis. Je moeder belde al twee keer.'),{fade:'out',t:.6}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);await buiten();zorgFiets(PL.napoli())}]});

/* =================== HOOFDSTUK 2 · Driehonderd =================== */
S1.giuliaWerk=()=>Object.assign({},C.look('giulia')||{},{top:{kind:'scrubs',c:'#7fb8c9'},legs:{kind:'scrub',c:'#7fb8c9'},glasses:null});
function portiekScene(lijnen){const d=PL.thuis(),g=walk(d.x+1.4,d.z+1.8,3),l=walk(d.x-.4,d.z+2.4,3);
  return [{actor:'giulia',at:[g.x,g.z],ry:naar(g,l),look:S1.giuliaWerk()},{actor:'luca',at:[l.x,l.z],ry:naar(l,g)},rond(g,naar(g,l)+1.1,3,1.7,1.5),{fade:'in',t:.4},...lijnen]}
hoofdstuk({id:'s1_h2',na:'s1_h3',blokken:[
 async t=>{dag(1,22,10);outfit('school');F('s1_geldgeven',1);if(!await doelNaar(t,'Naar huis',PL.thuis(),{actie:'Naar binnen',sub:'Thuis',gebouw:'thuis'}))return;
  await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 2','Driehonderd',2.6),
   {actor:'marco',at:W('thuis',3.6,6.25),ry:PI,anim:'tv',sitY:-.4},{actor:'elena',at:W('thuis',12.2,2.25),ry:0,anim:'kok'},{actor:'giulia',at:W('thuis',4.6,8.6),ry:PI/2,look:S1.giuliaWerk()},
   {actor:'luca',at:W('thuis',2.6,8.6),ry:PI/2},actIn(['marco','elena','giulia','luca']),
   cam(...W3('thuis',7.2,2.3,8.8),...W3('thuis',4.0,1.2,5.4),{fov:50}),{fade:'in',t:.8},
   Z('elena','Daar is hij. Hoe was werk?'),Z('luca',"Druk. Zes pizza's naar één adres."),Z('marco',"Zes? Wie bestelt er nou zes pizza's?"),
   Z('luca','Een lounge. Aan de Boulevard.'),Z('marco','Sahara. Brengen, afrekenen, wegwezen. Daar.'),
   rond({x:W('thuis',3.6,8.6)[0],z:W('thuis',3.6,8.6)[1]},PI*.5,2.4,1.7,1.5),{anim:'giulia',a:'turn',naar:'luca'},
   Z('giulia','Nachtdienst tot zeven. Afdeling 4, als iemand me zoekt.'),Z('giulia','Jij ruikt naar shisha.'),Z('luca','Klant.'),
   T_('Giulia kijkt hem even aan. Dan gaat ze.'),{snd:'door'},{weg:'giulia'},{fade:'out',t:.4}]);
  ['marco','elena','luca'].forEach(k=>C.weg(k));F('giulia_weg',1)},
 async t=>{const r=await speel(t,[{speler:false},{actor:'luca',at:W('thuis',5.4,8.6),ry:PI/2},actIn(['luca']),
   cam(...W3('thuis',6.4,1.4,9.2),...W3('thuis',5.4,1.0,8.6),{fov:34}),{fade:'in',t:.4},T_('Driehonderd euro. Zes briefjes van vijftig.'),
   keuze('luca','Wat doe je met de driehonderd?',[{t:'Honderd aan mama ("fooi"), de rest houd je',id:'ouders'},{t:'Giulia inhalen en haar stiekem honderd geven',id:'giulia'},{t:'Alles in de schoenendoos onder je bed',id:'doos'}])]);
  if(!levend(t))return;F('geld_300',r);C.weg('luca');
  if(r==='ouders'){geld(-100,'aan mama');meter('band_elena',10);meter('band_marco',5);plusF('marco_vermoeden');plusF('ouders_gekregen',100);
   await speel(t,[{speler:false},{actor:'elena',at:W('thuis',12.2,2.25),ry:0,anim:'kok'},{actor:'luca',at:W('thuis',12.0,3.6),ry:PI},{actor:'marco',at:W('thuis',3.6,6.25),ry:PI,anim:'tv',sitY:-.4},actIn(['marco','elena','luca']),
    cam(...W3('thuis',9.6,2.1,4.6),...W3('thuis',12.2,1.2,2.8),{fov:42}),{anim:'luca',a:'give',naar:'elena'},
    Z('elena','Honderd euro? Nee joh. Dat is van jou. Spaar voor je scooter.'),Z('luca','Mam. Pak nou gewoon. Voor de boodschappen.'),Z('elena','…Eén keer dan. Dankjewel, lieverd.'),
    rond({x:W('thuis',3.6,6.25)[0],z:W('thuis',3.6,6.25)[1]},PI,2.2,1.4,1.2),T_('Marco houdt zijn ogen op de tv.'),Z('marco','Honderd euro fooi. Voor pizza.'),{fade:'out',t:.5}]);['elena','luca','marco'].forEach(k=>C.weg(k))}
  else if(r==='giulia'){geld(-100,'aan Giulia');F('giulia_weet',1);meter('band_giulia',15);
   await speel(t,[{fade:'out',t:.3},{buiten:true},{speler:false},...portiekScene([Z('luca','Voor nieuwe schoenen. Je loopt al maanden op gaten.'),{anim:'luca',a:'give',naar:'giulia'},
    Z('giulia','Waar heb jij honderd euro vandaan?'),Z('luca','Fooi. Zeg niks tegen mam en pap.'),T_('Giulia vouwt het geld dubbel.'),Z('giulia','Eén keer, Luca.')]),{fade:'out',t:.5}]);
   C.weg('giulia');C.weg('luca');await binnen('thuis')}
  else{await speel(t,[{speler:false},{actor:'luca',at:W('thuis',13.9,11.4),ry:PI,anim:'hurk'},actIn(['luca']),
    cam(...W3('thuis',15.8,1.6,12.8),...W3('thuis',13.8,.4,11.0),{fov:40}),{fade:'in',t:.4},{wait:.4}]);
   const g=await mgHold({kop:'Onder het bed',titel:'Doos eruit, geld erin, doos terug',uitleg:'Houd vast (E). Hoor je mama in de gang? Loslaten tot ze weg is.',stappen:3,duur:1.3,storing:true,kijkTekst:'Mama in de gang! Loslaten.',waarschuw:'Voetstappen…',betrapt:'Te hard. Ze blijft staan…'});
   if(g&&g.fout>=1)await speel(t,[{snd:'door'},Z('elena','Ben je nog wakker?'),Z('luca','Bijna slapen.')]);
   await speel(t,[T_('Een schoenendoos, maat 43. Niemand kijkt ooit onder dat bed.'),{fade:'out',t:.4}]);C.weg('luca')}
  await binnen('thuis');S1.huisZet();sein('Thuis kun je nu praten, helpen en altijd geld geven aan papa of mama (E)','#7fd1ff')},
 async t=>{const p=W('thuis',14.2,9.6);if(!await doelNaar(t,'Naar je kamer (eerst praten mag)',{x:p[0],z:p[1],binnen:'thuis'},{actie:'Naar bed',sub:'Je kamer'}))return;
  const sms=F('rafiq_ja')==='bedenktijd'?'Morgen 20:00, achterdeur. Of niet. — B.':'Goed gewerkt. Morgen 20:00, achterdeur. — B.';
  await speel(t,[{speler:false},{actor:'luca',at:W('thuis',14.2,10.4),ry:0,anim:'slaap',sitY:-.3},actIn(['luca']),
   cam(...W3('thuis',16.4,1.9,12.6),...W3('thuis',14.2,.6,10.4),{fov:40}),{fade:'in',t:.6},{fn:()=>{try{L.tril&&L.tril()}catch(e){}bericht('Onbekend nummer',sms,{kleur:'#5a5d63'})}},{wait:2.6},
   T_('Hoe hebben ze mijn nummer?'),verteller('n07'),{fade:'out',t:1},titel('Dinsdag','',2)]);C.weg('luca');F('giulia_weg',null)}]});

/* =================== HOOFDSTUK 3 · Gymles =================== */
hoofdstuk({id:'s1_h3',na:'s1_h4',blokken:[
 async t=>{dag(2,7,20);await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));const g=F('geld_300');
  const v=g==='ouders'?[Z('elena','Van jouw fooi. Verse broodjes van de bakker.'),Z('marco','Van zijn fooi.')]
   :g==='giulia'?[T_('Giulia draagt nieuwe witte schoenen.'),Z('elena','Nieuwe schoenen?'),Z('giulia','Afgeprijsd. Van een collega.'),T_('Giulia kijkt niet naar Luca. Luca niet naar haar.')]
   :[Z('elena','Heb jij gisteren nog wat verdiend?'),Z('luca','Beetje fooi. Niks bijzonders.')];
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 3','Gymles',2.6),
   {actor:'marco',at:W('thuis',7.4,4.5),ry:0,anim:'sit',sitY:-.42},{actor:'elena',at:W('thuis',9.0,3.8),ry:-PI/2},{actor:'giulia',at:W('thuis',6.8,5.9),ry:PI,anim:'slaap',sitY:-.42},
   {actor:'luca',at:W('thuis',8.0,5.9),ry:PI,anim:'sit',sitY:-.42},actIn(['marco','elena','giulia','luca']),
   cam(...W3('thuis',10.6,2.3,7.6),...W3('thuis',7.4,1.1,5.0),{fov:46}),{fade:'in',t:.8},...v,Z('marco','School. En vanavond om tien uur thuis, niet om elf.'),{fade:'out',t:.5}]);
  ['marco','elena','giulia','luca'].forEach(k=>C.weg(k));outfit('school');await buiten()},
 async t=>{// naar school, Dex bij het hek, dan gym op het veld
  if(!await doelNaar(t,'Naar school · Westbuurt College',PL.school(),{actie:'Naar binnen',sub:'Gymles'}))return;
  const s=A('schoolhek'),d=walk(s.x+1.6,s.z+2.4,3),l=walk(s.x,s.z+2.8,3);
  await speel(t,[{speler:false},{actor:'dex',at:[d.x,d.z],ry:naar(d,l)},{actor:'luca',at:[l.x,l.z],ry:naar(l,d)},rond(d,naar(d,l)+1.2,3.2,1.8,1.5),
   Z('dex','Je appte niet terug, broer.'),Z('luca','Werken. Laat.'),Z('dex','Wie eet er om elf uur nog pizza?',{mood:'blij'}),{fade:'out',t:.5}]);C.weg('dex');C.weg('luca');
  outfit('sport');tijd(11,10);const v=A('voetbalveld'),lp=walk(v.x-3,v.z-6,6),dp=walk(v.x+6,v.z-6,6),k=walk(v.x+1,v.z-9,6);
  await speel(t,[{speler:false},{actor:'gymdocent',at:[k.x,k.z],ry:naar(k,lp)},{actor:'luca',at:[lp.x,lp.z],ry:naar(lp,dp)},{actor:'dex',at:[dp.x,dp.z],ry:naar(dp,lp)},
   rond(k,PI*1.2,7,3,1.3),{fade:'in',t:.6},{snd:'whistle'},Z('gymdocent',"Penalty's! Tweetallen. De Santis, jij tegen Dex.")]);
  const g=await mgTiming({kop:'Gymles',titel:"Penalty's tegen Dex",uitleg:'Schiet als het streepje in het groene vak staat. Dex keept.',rondes:3,snel:1.1,vak:.2,knop:'Schieten'});F('penalties',g);
  await speel(t,[Z('dex',g>=3?'Oké. Profvoetballer.':g>=2?'Mazzel, broer.':"Ga maar pizza's bezorgen, mattie.",{mood:'blij'}),{fade:'out',t:.4},
   {actor:'luca',at:[lp.x,lp.z],ry:0,anim:'sit',sitY:-.5},{actor:'dex',at:[lp.x+1.1,lp.z],ry:0,anim:'drink',sitY:-.5},rond(lp,PI*.9,3.2,1.4,.9),{fade:'in',t:.4},
   {fn:()=>bericht('B.','20:00. Achterdeur. Vergeet het niet.',{kleur:'#5a5d63'})},{wait:1.8},Z('dex','Wie is B?'),Z('luca','Niemand. Iemand van werk.'),
   Z('dex','Je bent de hele ochtend al stil, broer.'),verteller('n08'),{fade:'out',t:.6}]);['luca','dex','gymdocent'].forEach(k=>C.weg(k));outfit('school');tijd(16,30)},
 async t=>{// na school: Kenny van Pizza Rapido
  zorgFiets();ST.doel('Naar Bella Napoli',PL.napoli());
  const nap=PL.napoli();let ok=false;for(let i=0;i<2400&&levend(t);i++){await sleep(250);if(hyp(G.P.x-nap.x,G.P.z-nap.z)<70&&!B.waar()&&!C.active()){ok=true;break}}if(!ok||!levend(t))return;
  fietsAf();const l=P(),q=voor(4,1.2);const sc=L.scooter?L.scooter('#e8c823'):null;if(sc){sc.position.set(q.x+1.2,0,q.z);sc.rotation.y=naar(q,l)+PI/2;G.scene().add(sc)}
  await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:naar(l,q)},{actor:'kenny',at:[q.x,q.z],ry:naar(q,l),anim:'leun'},rond(q,naar(q,l)+1,3.4,1.7,1.5),{snd:'engineStart'},
   Z('kenny','Napoli. Jij bent die nieuwe van Giovanni?'),Z('kenny','De Westbuurt bestelt voortaan bij Rapido. Zeg dat maar tegen die ouwe.'),Z('luca','Bestel zelf maar wat. Ik moet werken.'),
   {anim:'kenny',a:'duw',naar:'luca'},Z('kenny','Volgende keer rij ik je van je fiets. Met pizza en al.',{mood:'boos'}),{snd:'engineStart'},{fade:'out',t:.4}]);
  if(sc)sc.parent&&sc.parent.remove(sc);C.weg('kenny');C.weg('luca');F('kenny_dreigt',1);ST.doel(null)},
 async t=>{// de jas aan, en de margherita's voor Sahara
  if(!await doelNaar(t,'Bella Napoli',PL.napoli(),{actie:'Naar binnen',sub:'Bella Napoli',gebouw:'napoli'}))return;await binnen('napoli');B.toon('napoli','giovanni',false);tijd(19,15);
  await speel(t,[{speler:false},{actor:'giovanni',at:W('napoli',...NAP.giovanni),ry:0,anim:'kok'},{actor:'luca',at:W('napoli',2.2,7.4),ry:-PI/2},actIn(['giovanni','luca']),
   cam(...W3('napoli',4.6,1.8,9.8),...W3('napoli',1.6,1.5,7.0),{fov:40}),{fade:'in',t:.4},{fn:()=>outfit('bezorger')},{anim:'luca',a:'turn',naar:'giovanni'},
   cam(...W3('napoli',4.4,2.2,10.6),...W3('napoli',7.6,1.4,7.6),{fov:44}),
   Z('giovanni','Vanavond: meneer De Wit, vier voor het ziekenhuis.'),Z('giovanni',"En drie margherita's voor Sahara. Elke avond nu. Rafiq betaalt, ik vraag niks."),
   Z('luca','Elke avond?'),Z('giovanni','Elke avond. Vai.'),{fade:'out',t:.3}]);
  C.weg('giovanni');C.weg('luca');B.toon('napoli','giovanni',true);F('jas',1)}]});

/* =================== HOOFDSTUK 4 · Licht uit =================== */
// route zonder terugrit: steeg (Bilal) → N1 Grand Hotel → N2 toren Zuidas → E1 ziekenhuis (Giulia) → E2 De Wit (Oud-Zuid) → N3 villa Villawijk (de controle)
hoofdstuk({id:'s1_h4',na:'s1_h5',blokken:[
 async t=>{dag(2,19,40);outfit('bezorger');await buiten();zorgFiets(PL.napoli());try{G.fiets.last(8)}catch(e){}
  await speel(t,[{fade:'out',t:.01},titel('Hoofdstuk 4','Licht uit',2.6),{fade:'in',t:.6}]);
  sein("Acht pizza's achterop: eerst de drie voor Sahara",'#ffd35a');
  if(!await doelNaar(t,'Steeg achter Sahara · de achterdeur',PL.steeg(),{actie:'Kloppen',sub:'Stalen deur'}))return;
  const s=PL.steeg(),b=walk(s.x+1.2,s.z-1,3),l=walk(s.x-1,s.z+1.4,3);const bed=F('rafiq_ja')==='bedenktijd';
  await speel(t,[{speler:false},{actor:'bilal',at:[b.x,b.z],ry:naar(b,l),prop:'pakket'},{actor:'luca',at:[l.x,l.z],ry:naar(l,b)},rond(b,naar(b,l)+1.2,3,1.7,1.5),{snd:'door'},
   bed?Z('bilal','Dus je bent er toch. Rafiq wist het.'):null,Z('bilal',"De margherita's. Geef."),
   cam(b.x+.6,2.4,b.z+.8,b.x,.9,b.z,{fov:34}),{anim:'bilal',a:'kok'},T_("Bilal tilt drie pizza's op en legt onder elke pizza een plat pakketje. Luca raakt niks aan."),
   rond(b,naar(b,l)+1.2,3,1.7,1.5),Z('bilal','Drie adressen, op je telefoon. Al betaald. Jij geeft af, verder niks.'),Z('bilal','Licht uit als je de straat in rijdt. Niemand hoeft te zien waar je stopt.'),{fade:'out',t:.3}]);
  C.weg('bilal');C.weg('luca');if(F('rafiq_ja')==='bedenktijd')F('rafiq_ja','bedenktijd_ja');F('nep_dozen',0);
  bericht('B.','1) Grand Hotel, nachtportier. 2) Toren, Zuidas. 3) '+adr(AD.villa,'Villawijk')+'. Licht uit.',{kleur:'#5a5d63'});zorgFiets();lichtKnop(true);licht(true)},
 async t=>{// N1 Grand Hotel
  const ok=await nepRit(t,{p:PL.hotel(),tekst:'Grand Hotel · nachtportier',sub:'Nep-bestelling (Rafiq)',scene:async()=>{const q=voor(1.6);
   await speel(t,[{speler:false},{actor:'raysman',at:[q.x,q.z],ry:naar(q,P()),look:Object.assign({},C.look('receptioniste')||{},{top:{kind:'suit',c:'#5a1a1a',c2:'#d6b25a'}})},{actor:'luca',at:[P().x,P().z],ry:naar(P(),q)},rond(q,naar(q,P())+1,2.8,1.6,1.4),
    {anim:'luca',a:'give',naar:'raysman'},Z('raysman','Napoli. Achterom volgende keer. Gasten kijken.'),{fade:'out',t:.3}]);C.weg('raysman');C.weg('luca')}});if(ok)plusF('nep_dozen')},
 async t=>{// N2 toren aan de Zuidas
  let gezegd=false;const iv=setInterval(()=>{if(!levend(t)){clearInterval(iv);return}if(!gezegd&&G.P.x>880&&G.P.z<780&&!C.active()){gezegd=true;clearInterval(iv);verteller('n09').fn()}},500);
  const ok=await nepRit(t,{p:pt(AD.toren),tekst:'Toren · Zuidas',sub:'Nep-bestelling (Rafiq)',scene:async()=>{const q=voor(1.6);
   await speel(t,[{speler:false},{actor:'badjas',at:[q.x,q.z],ry:naar(q,P())},{actor:'luca',at:[P().x,P().z],ry:naar(P(),q)},rond(q,naar(q,P())+1,2.8,1.6,1.4),
    {anim:'luca',a:'give',naar:'badjas'},Z('badjas','Jij bent sneller dan de vorige. Die kwam altijd een uur te laat.'),{fade:'out',t:.3}]);C.weg('badjas');C.weg('luca')}});
  clearInterval(iv);if(ok)plusF('nep_dozen')},
 async t=>{// E2 ziekenhuis: Giulia en Sanne
  if(!await doelNaar(t,'Ziekenhuis · afdeling 4',PL.ziekenhuis(),{actie:'Afgeven',sub:"Vier pizza's"}))return;tijd(21,40);
  const z=PL.ziekenhuis(),g=walk(z.x+1,z.z+1.2,3),s=walk(z.x+2.2,z.z+1.5,3),l=walk(z.x+.8,z.z+3.2,3);
  await speel(t,[{speler:false},{actor:'giulia',at:[g.x,g.z],ry:naar(g,l),look:S1.giuliaWerk()},{actor:'sanne',at:[s.x,s.z],ry:naar(s,l)},{actor:'luca',at:[l.x,l.z],ry:naar(l,g)},rond(l,naar(l,g)+2.4,3.4,1.8,1.5),
   Z('giulia','Jij? Bezorg jij nu ook hier?'),Z('luca','Overal, zus. Vier stuks, afdeling 4.'),{anim:'luca',a:'give',naar:'giulia'},{anim:'sanne',a:'point'},Z('sanne','En die doos? Ook voor ons?'),
   Z('luca','Andere klant.'),T_('Giulia kijkt naar de tas. Dan naar hem.'),F('giulia_weet')?Z('giulia','De schoenen lopen goed.'):Z('giulia','Om tien uur thuis, zei papa toch?'),{fade:'out',t:.4}]);
  ['giulia','sanne','luca'].forEach(k=>C.weg(k));geld(8,'fooi afdeling 4');try{G.fiets.last(2)}catch(e){}zorgFiets()},
 async t=>{// E1 meneer De Wit (Oud-Zuid)
  const a=AD.dewit;await echteRit(t,[{adres:adr(a,'Oud-Zuid'),x:pt(a).x,z:pt(a).z,klant:'oude_man',pizzas:1,naam:'Meneer De Wit',id:'e1'}])},
 async t=>{// N3: villa in de Villawijk, de politie (praatspel met vermoedensmeter)
  const a=AD.villa,p=pt(a);tijd(23,30);let gesprint=false;ST.doel('Laatste adres · '+adr(a,'Villawijk'),p);zorgFiets();let ok=false,zone=0;
  for(let i=0;i<6000&&levend(t);i++){await sleep(200);const d=hyp(G.P.x-p.x,G.P.z-p.z);if(d<95&&!zone){zone=1;sein('Licht uit (Rafiqs regel) · L','#ff5a4a')}
   if(d<70&&zone===1){zone=2;await sleep(2500);if(S1.lichtAan()){sein('(Licht uit. Zoals Bilal zei.)','#ff9a8a');licht(false)}}
   if(d<40){ok=true;try{gesprint=!!(G.fiets.snelheid&&G.fiets.snelheid()>24)}catch(e){}break}}if(!ok||!levend(t))return;
  fietsAf();ST.doel(null);licht(false);const l=P(),car=walk(l.x-sin(l.ry)*10,l.z-cos(l.ry)*10,6);
  const auto=S1.politieAuto();auto.position.set(car.x,0,car.z);auto.rotation.y=naar(car,l);G.scene().add(auto);S1._auto=auto;
  await speel(t,[{speler:false},{actor:'luca',at:[l.x,l.z],ry:l.ry},{actor:'kramer',at:[car.x+1.4,car.z+1.4],ry:naar(car,l)},cam(l.x+sin(l.ry)*2.6,1.2,l.z+cos(l.ry)*2.6,car.x,1.0,car.z,{fov:44}),
   {snd:'carDoor'},rond(l,l.ry+PI*.75,4.6,1.8,1.4),{move:'kramer',to:[l.x-sin(l.ry)*1.6,l.z-cos(l.ry)*1.6],t:2.2},verteller('n10'),
   Z('kramer','Goedenavond. Weet je waarom ik je aanhoud?'),Z('kramer','Je achterlicht. Daar staat een bon op.')]);
  const uitslag=await S1.aanhouding(t,{gesprint,wijk:'de Villawijk'});if(!levend(t))return;F('controle',uitslag);
  if(uitslag==='bureau'){await S1.naarBureau(t);auto.parent&&auto.parent.remove(auto);C.weg('kramer');C.weg('luca');return}
  setTimeout(()=>{auto.parent&&auto.parent.remove(auto)},2500);C.weg('kramer');
  const j=voor(2.2);await speel(t,[{speler:false},{actor:'jasper',at:[j.x,j.z],ry:naar(j,P())},{actor:'luca',at:[P().x,P().z],ry:naar(P(),j)},rond(j,naar(j,P())+1,3,1.6,1.4),{fade:'in',t:.3},
   {anim:'luca',a:'give',naar:'jasper'},Z('jasper','Eindelijk. Was dat politie daar?'),Z('luca','Achterlicht.'),Z('jasper','Zeg tegen je baas: vrijdag weer. Dubbel.'),{fade:'out',t:.4}]);
  C.weg('jasper');C.weg('luca');plusF('nep_dozen');licht(true);lichtKnop(false)},
 async t=>{if(F('controle')==='bureau')return;
  if(!await doelNaar(t,'Fiets terug naar Bella Napoli',PL.napoli(),{actie:'Fiets wegzetten',sub:'Bella Napoli'}))return;outfit('school');
  const j=A('eiland');await speel(t,[{speler:false},cam(j.x-80,30,j.z-70,j.x,2,j.z,{fov:40}),{fade:'in',t:.6},verteller('n11'),{fade:'out',t:.8},titel('Woensdag','',2)])}]});

// politieauto (wit-blauw, zwaailicht) of politiebusje
S1.politieAuto=function(o){o=o||{};const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c});const box=(w,h,d,c,x,y,z,em)=>{const ob=new TH.Mesh(new TH.BoxGeometry(w,h,d),em?new TH.MeshBasicMaterial({color:c}):m(c));ob.position.set(x,y,z);g.add(ob);return ob};
  const busje=!!o.busje,Lg=busje?5.2:4.2,H=busje?1.5:.62;
  box(1.9,H,Lg,'#f1efe9',0,.32+H/2,0);if(!busje){box(1.62,.5,2.2,'#f1efe9',0,1.18,-.2);box(1.64,.38,2.0,'#1a2430',0,1.2,-.2)}else box(1.92,.5,1.0,'#1a2430',0,1.5,Lg/2-.6);
  box(1.92,.18,Lg+.02,'#2a5bd7',0,.82,0);box(1.92,.08,Lg+.02,'#f2a23a',0,.98,0);
  [[-.86,Lg*.32],[.86,Lg*.32],[-.86,-Lg*.32],[.86,-Lg*.32]].forEach(([x,z])=>box(.26,.62,.62,'#121214',x,.32,z));box(.36,.12,.06,'#fff6c8',-.6,.66,Lg/2+.01,1);box(.36,.12,.06,'#fff6c8',.6,.66,Lg/2+.01,1);
  const y=busje?2.1:1.5,l1=box(.34,.14,.3,'#3a7bff',-.24,y,-.2,1),l2=box(.34,.14,.3,'#3a7bff',.24,y,-.2,1);let k=0;const iv=setInterval(()=>{if(!g.parent&&k>4){clearInterval(iv);return}k++;l1.visible=k%2===0;l2.visible=k%2===1},260);
  const kl=new TH.PointLight('#5a8aff',2.2,12,1.6);kl.position.set(0,y+.3,0);g.add(kl);return g};
// zwarte auto (Rafiq) of donkere SUV (Ray)
S1.auto=function(kleur,suv){const g=new TH.Group(),m=c=>new TH.MeshLambertMaterial({color:c});const box=(w,h,d,c,x,y,z,em)=>{const ob=new TH.Mesh(new TH.BoxGeometry(w,h,d),em?new TH.MeshBasicMaterial({color:c}):m(c));ob.position.set(x,y,z);g.add(ob);return ob};
  const H=suv?.95:.66;box(1.9,H,4.5,kleur||'#121316',0,.32+H/2,0);box(1.7,.55,2.3,kleur||'#121316',0,.32+H+.27,-.2);box(1.72,.42,2.1,'#0a0c10',0,.32+H+.27,-.2);
  [[-.86,1.4],[.86,1.4],[-.86,-1.4],[.86,-1.4]].forEach(([x,z])=>box(.26,.66,.66,'#0c0c0e',x,.33,z));box(.4,.12,.06,'#fff6c8',-.62,.62,2.26,1);box(.4,.12,.06,'#fff6c8',.62,.62,2.26,1);
  box(.4,.1,.06,'#ff2a1a',-.62,.64,-2.26,1);box(.4,.1,.06,'#ff2a1a',.62,.64,-2.26,1);const kl=new TH.SpotLight('#fff2c8',6,26,.5,.6,1.4);kl.position.set(0,.8,2.4);kl.target.position.set(0,0,12);g.add(kl,kl.target);g.koplamp=kl;return g};

/* ---------- de aanhouding: vier vragen, vermoedensmeter (eruit gepraat · de tas · mee naar het bureau) ---------- */
S1.aanhouding=async function(t,o){o=o||{};let aanGezet=false;const kort=!!o.kort;
  const Q1={vraag:'Kramer: "Waarom staat dat licht uit?"',tijd:8,stilEff:{v:10},stilReactie:'Ik wacht.',opties:[
     {t:'"Sorry. Vergeten aan te zetten." (en het licht aan doen)',eff:{v:-10},fn:()=>{licht(true);aanGezet=true},reactie:'Kijk eens aan.'},
     {t:'"Hij is kapot."',eff:{v:20},fn:async()=>{await C.zeg('kramer','Laat zien.',{t:1.6});licht(true);aanGezet=true},reactie:'Hij doet het gewoon. Een wonder.'},
     {t:'"Ik had het niet gezien."',eff:{v:5},fn:async()=>{await C.zeg('kramer','Zet aan.',{t:1.4});licht(true);aanGezet=true},reactie:'Goed zo.'},
     {t:'"Nieuwe batterijen. Zit nog los." (en aan doen)',eff:{v:-5},fn:()=>{licht(true);aanGezet=true},reactie:'Zit nu wel goed.'}]};
  const Q2={vraag:'Kramer: "Jij woont hier niet. Wat doe je om half twaalf in '+(o.wijk||'deze wijk')+'?"',tijd:8,stilEff:{v:10},stilReactie:'Ik wacht.',opties:[
     {t:'"Bezorgen. Laatste rit, dan naar huis."',eff:{v:-10},reactie:'Op dit uur.'},{t:'"Mag ik hier niet fietsen dan?"',eff:{v:20},reactie:'Mag alles. Ik vraag het alleen.'},
     {t:'"Mijn oom woont hier."',eff:{v:15},reactie:'Welk huis?'}]};
  const Q3={vraag:'Kramer: "Welk adres?"',tijd:8,stilEff:{v:10},stilReactie:'Ik wacht.',opties:(()=>{const a=adr(AD.villa,'Lindelaan 14'),m=a.match(/^(.*?)(\d+)$/),
      f1=m?m[1]+(+m[2]+27):'Lindelaan 41',f2=m?m[1].trim()+'hof '+m[2]:'Lindehof 14';return [{t:a,eff:{v:-10},reactie:'Hm.'},{t:f1,eff:{v:20},reactie:'Weet je je eigen bestelling niet?'},{t:f2,eff:{v:20},reactie:'Dat bestaat niet.'}].sort(()=>Math.random()-.5)})()};
  const Q4={vraag:'Kramer kijkt naar de tas: "En wat zit er in die tas?"',tijd:8,stilEff:{v:10},stilReactie:'Ik wacht.',opties:[
     {t:'"Pizza\'s. Voor de klant."',eff:{v:-10},reactie:'Zo.'},{t:'"Een margherita en een calzone."',eff:{v:-5},reactie:'Lekker.'},{t:'"Gaat u niks aan."',eff:{v:25},reactie:'O nee?'}]};
  const r=await mgGesprek({kop:'Aanhouding · Agent Kramer',wie:'kramer',kleur:'#4d7dff',meters:{v:['VERMOEDEN',35+(o.gesprint?5:0),'#4d7dff']},
   naBeurt:m=>{if(m.v>=50)fx('heart')},beurten:kort?[Q1,Q4]:[Q1,Q2,Q3,Q4]});
  if(!aanGezet)licht(true);const v=r.m.v;
  if(kort){if(v<45){await speel(t,[Z('kramer','Licht aanlaten. Rij door.')]);return 'gepraat'}await speel(t,[Z('kramer','Zestig euro. Voor het licht. En ik onthoud je gezicht.')]);geld(-60,'bon achterlicht');return 'bon'}
  if(v<40){await speel(t,[Z('kramer','Licht aanlaten. En rij door voor ik me bedenk.'),Z('luca','Komt goed. Fijne avond.'),{snd:'carDoor'}]);meter('vertrouwen',10);return 'gepraat'}
  if(v<70){const k=await speel(t,[Z('kramer','Vind je het goed als ik even in die tas kijk?'),keuze('luca','',[{t:'"Ga uw gang."',id:'ja'},{t:'"Liever niet."',id:'nee'}])]);
   if(k==='nee')await speel(t,[Z('kramer','Dan doen we het zo.')]);
   await speel(t,[{anim:'luca',a:'hurk'},T_('Kramer tilt het deksel van de bovenste doos op. Een margherita. Koud.'),T_('Hij steekt zijn hand uit naar de doos eronder.')]);
   const g=await mgTiming({kop:'Rustig blijven',titel:'Je hart bonkt',uitleg:'Druk precies op de piek van je hartslag (groen vak). Twee van de drie.',rondes:3,snel:1.2,vak:k==='nee'?.15:.18,knop:'Ademen'});
   if(g>=2){await speel(t,[Z('luca','Die is voor de klant. Als u hem openmaakt, betaalt hij niet.'),T_('Kramer houdt zijn hand stil. Dan klapt hij de tas dicht.'),
     Z('kramer','De Santis, staat op je fietsplaatje. Ik onthoud namen. Licht aan, en weg.'),{snd:'carDoor'}]);F('kramer_kent',1);meter('vertrouwen',5);return 'doos'}
   await speel(t,[T_('Zijn hand trilt. Kramer ziet het.')])}
  // mee naar het bureau: geen ID op zak
  const k=await speel(t,[Z('kramer','Heb je een ID bij je? Vanaf veertien moet dat.'),Z('luca','…Thuis.'),Z('kramer','Dan zoeken we op het bureau uit wie je bent. Fiets op slot.'),{anim:'kramer',a:'bel',prop:'telefoon'},
   T_('Kramer loopt naar zijn auto om een busje te vragen. Zijn rug naar Luca.'),keuze('luca','De doos moet weg. Nu.',[{t:'In de container bij de oprit',id:'container'},{t:'Diep onder de heg',id:'heg'}])]);
  F('pakket',k||'container');F('kramer_kent',1);plusF('marco_vermoeden',2);if(k==='heg')F('heg_gevonden',1);return 'bureau'};
S1.naarBureau=async function(t){const b=PL.politie(),q=(dx,dz,r)=>{const w=walk(b.x+dx,b.z+dz,r||3);return [w.x,w.z]};
  await speel(t,[{fade:'out',t:.6},{fn:()=>{try{if(S1._auto)S1._auto.parent&&S1._auto.parent.remove(S1._auto)}catch(e){}}},titel('Politiebureau','Veertig minuten later',2.4),{fn:()=>{tijd(0,40)}},
  {actor:'luca',at:q(0,2.6),ry:0,anim:'sit',sitY:-.4},{actor:'kramer',at:q(1.4,2.4),ry:-.4},
  {actor:'marco',at:q(-3,7),ry:PI*.9,look:Object.assign({},C.look('marco')||{},{top:{kind:'jacket',c:'#e8742a',c2:'#f2e27a'}})},
  rond({x:q(0,3)[0],z:q(0,3)[1]},PI*.75,5,2.2,1.3),{fade:'in',t:.6},{move:'marco',to:q(-.6,4.2),t:2.4},
  Z('kramer','Meneer De Santis. We hebben niks gevonden. Zijn naam staat wel genoteerd.'),Z('kramer','Een ID, de volgende keer. En een achterlicht.'),Z('marco','Dank u.'),{fade:'out',t:.5},{weg:'kramer'},
  {actor:'luca',at:q(0,12,4),ry:PI},{actor:'marco',at:q(1,13,4),ry:PI},
  {cam:{volg:'luca',af:[1.6,1.8,-3.6],kijk:[0,1.2,2]}},{fade:'in',t:.5},Z('marco','Je moeder weet hier niks van. Dat houden we zo.'),Z('marco','Wat zat er in die tas, Luca?'),
  Z('luca','Pizza.'),T_('De rest van de weg zeggen ze niks.'),{fade:'out',t:.8},{cam:null},titel('Woensdag','',2)]);C.weg('marco');C.weg('luca');outfit('school');lichtKnop(false);licht(true);
  const th=PL.thuis();G.P.x=th.x;G.P.z=th.z+1.5;F('fiets_villawijk',1)};

/* =================== HOOFDSTUK 5 · Rafiqs regels =================== */
hoofdstuk({id:'s1_h5',na:'s1_h6',vrij:true,blokken:[
 async t=>{// (na het bureau) papa aan het ontbijt; de fiets staat nog in de Villawijk
  if(F('controle')!=='bureau')return;dag(3,7,30);await binnen('thuis');['marco','elena','giulia'].forEach(k=>B.toon('thuis',k,false));
  await speel(t,[{fade:'out',t:.01},{speler:false},titel('Hoofdstuk 5','Rafiqs regels',2.4),{actor:'marco',at:W('thuis',7.4,4.5),ry:0,anim:'sit',sitY:-.42},{actor:'luca',at:W('thuis',7.4,5.9),ry:PI,anim:'sit',sitY:-.42},actIn(['marco','luca']),
   cam(...W3('thuis',10.2,2.0,6.8),...W3('thuis',7.4,1.1,5.2),{fov:42}),{fade:'in',t:.6},Z('marco','Je fiets staat nog in de Villawijk. Haal hem na school op.'),
   F('geld_300')==='ouders'?{anim:'marco',a:'give',naar:'luca'}:null,F('geld_300')==='ouders'?Z('marco','En deze wil ik niet in dit huis. Fooi of geen fooi.'):null,{fade:'out',t:.5}]);
  if(F('geld_300')==='ouders'){F('geld_terug',1);geld(100,'terug van papa');F('sq1_start',1)}C.weg('marco');C.weg('luca');await buiten();outfit('school');tijd(15,10);
  const v=pt(AD.villa),f=walk(v.x+2,v.z+2,4);try{G.fiets.spawn(f.x,f.z,0,{kleur:'#c0261e'})}catch(e){}
  if(!await doelNaar(t,'Je fiets ophalen · Villawijk',f,{actie:'Opstappen',sub:'Je fiets',fietsAf:false}))return;
  if(F('heg_gevonden')){await speel(t,[{speler:false},{actor:'luca',at:[P().x,P().z],ry:P().ry},rond(P(),P().ry+PI,3.4,1.6,1.3),T_('Bij de villa knipt een hovenier de heg. Naast hem, op het gras, een pizzadoos. Dicht.'),T_('Luca rijdt door.'),{fade:'out',t:.3}]);C.weg('luca')}},
 async t=>{// naar Sahara, overdag
  dag(3,15,30);outfit('school');if(F('controle')!=='bureau')await speel(t,[{fade:'out',t:.01},titel('Hoofdstuk 5','Rafiqs regels',2.4),{fade:'in',t:.5}]);
  if(!await doelNaar(t,'Lounge Sahara',PL.sahara(),{actie:'Naar binnen',sub:'Lounge Sahara',gebouw:'sahara'}))return;await binnen('sahara');
  const c=F('controle'),pk=F('pakket');const v=c==='gepraat'?[Z('rafiq','Een agent. Vier vragen. En jij fietst gewoon door naar de klant.'),Z('rafiq','Bilal zei dat je zou piepen. Bilal had het mis.')]
   :c==='doos'?[Z('rafiq','Hij tilde het deksel op en zag een koude margherita. Zie je? Regels.')]
   :pk==='container'?[Z('rafiq','Een doos in een container in de Villawijk. Duizend euro. Die werk je terug.'),Z('rafiq','Maar op dat bureau zei je niks. Dat telt ook.')]
   :[Z('rafiq','Onder een heg. In de Villawijk. Een hovenier heeft hem gevonden.'),Z('rafiq','Geen schuld. Maar iemand heeft nu een pizzadoos gezien die niet klopt.')];
  if(pk==='container'){F('schuld_rafiq',1000);meter('vertrouwen',-5)}
  const n=F('nep_dozen')||0,loon=n*(F('tarief')||50),schuld=F('schuld_rafiq')||0,af=Math.min(schuld,loon);
  await speel(t,[...hoek(true),cam(...W3('sahara',18.6,2.0,18.6),...W3('sahara',21.4,1.2,15.0),{fov:40}),{fade:'in',t:.5},...v,
   {anim:'bilal',a:'give',prop:'envelop',naar:'luca'},T_('Bilal legt een envelop neer. '+eur(loon-af)+(af?' (de rest gaat van je schuld af)':'')+'.'),Z('rafiq','Kom. Je gaat leren tellen.'),{fade:'out',t:.4}]);
  if(af)F('schuld_rafiq',schuld-af);if(loon-af>0)geld(loon-af,'Rafiq · '+n+' dozen');hoekWeg()},
 async t=>{// geld tellen in de achterkamer, de vriezer, de tweede telefoon
  await binnen('sahara');await speel(t,[{speler:false},{actor:'rafiq',at:W('sahara',19.2,5.6),ry:PI},{actor:'luca',at:W('sahara',20.4,5.7),ry:PI},{actor:'bilal',at:W('sahara',22.6,5.4),ry:-PI*.7,anim:'leun'},actIn(['rafiq','luca','bilal']),
   cam(...W3('sahara',22.4,2.2,7.0),...W3('sahara',20,1.0,4.4),{fov:42}),{fade:'in',t:.4},
   Z('rafiq','Een rol tel je met je duim. Niet met je ogen.'),Z('rafiq','Er zit vals tussen. Verkeerde kleur, of geen strip.')]);
  let score=50;try{const r=await G.h1.tellen();score=r&&r.score!=null?r.score:(typeof r==='number'?r:60)}catch(e){}
  if(score>=70){meter('vertrouwen',5);F('bilal_jaloers',1);await speel(t,[Z('rafiq','Bilal. Kijk. Zo doe je dat.'),{anim:'bilal',a:'turn',ry:PI}])}else await speel(t,[Z('rafiq','Morgen weer. Tot je het blind kan.')]);
  await speel(t,[{actor:'rafiq',at:W('sahara',8.0,3.6),ry:PI},{actor:'luca',at:W('sahara',9.4,3.6),ry:-PI*.6},{actor:'bilal',at:W('sahara',6.6,3.4),ry:PI*.6},
   cam(...W3('sahara',9.8,2.4,4.8),...W3('sahara',8.0,.9,2.0),{fov:38}),{snd:'open'},
   T_('Koude damp. Twee stapels blokken: de ene met een kroontje gestempeld, de andere met een schorpioen.'),
   Z('bilal','Kroon is van de boot. Schorpioen is van ons.'),Z('rafiq','Bilal.'),T_('Bilal kijkt naar de grond.'),
   Z('rafiq','Jij hebt een vriezer gezien. Vol ijs. Je kent mij van de pizza.'),{anim:'rafiq',a:'give',prop:'telefoon',naar:'luca'},
   Z('rafiq','Deze is voor mij. Die andere is voor je moeder.'),verteller('n12'),{fade:'out',t:.5}]);['rafiq','luca','bilal'].forEach(k=>C.weg(k));F('tweede_telefoon',1);F('vriezer_gezien',1);
  await zetBuitenSahara();sein('Tweede telefoon · ritten voor Rafiq staan open bij Sahara (vrij rondrijden)','#ffd35a')},
 async t=>{// de kooi met Dex
  tijd(18,30);if(!await doelNaar(t,'De kooi · Westbuurt',PL.kooi(),{actie:'Naar Dex',sub:'Voetbalkooi'}))return;const v=PL.kooi(),d=walk(v.x+1,v.z-2,4),l=walk(v.x-1.4,v.z-1,4);
  const r=await speel(t,[{speler:false},{actor:'dex',at:[d.x,d.z],ry:naar(d,l)},{actor:'luca',at:[l.x,l.z],ry:naar(l,d),anim:'leun'},rond(d,naar(d,l)+1.3,3.4,1.7,1.4),{fade:'in',t:.4},
   {snd:'tril'},Z('dex','Twee telefoons. Sinds wanneer heb jij twee telefoons?'),Z('dex','En mijn neef zag je bij Sahara. Bij de achterdeur.'),
   keuze('luca','',[{t:'Vertellen',id:'ja'},{t:'Liegen',id:'nee'}])]);if(!levend(t))return;
  if(r==='ja'){F('dex_weet',1);const r2=await speel(t,[Z('luca','Rafiq. Ik neem soms iets mee. Onder de pizza.'),Z('dex','Serieus? Rafiq? …Broer, vraag of ik ook mag.',{mood:'blij'}),
    keuze('luca','',[{t:'"Nee. Jij blijft erbuiten."',id:'buiten'},{t:'"Ik zal het vragen."',id:'erin'}])]);F('dex_wil',r2);
   await speel(t,[Z('dex',r2==='buiten'?'Oké. Maar als het misgaat, bel je mij. Eerst mij.':'Samen geld maken, broer. Zoals vroeger.')])}
  else{F('dex_weet',0);await speel(t,[Z('luca','Fooi. Rijke klanten op de Zuidas. Dat is alles.'),Z('dex','Ja ja. Fooi.'),{snd:'hit'},T_('Dex schiet de bal keihard tegen het hek.')]);meter('dex',-5)}
  await speel(t,[verteller('n13'),{fade:'out',t:.5}]);C.weg('dex');C.weg('luca')}]});
}
if(S1.ST)reg();else S1.onStart.push(reg);
})();
