// Pixelstad: geheimen van de stad. Kleine missies die NIET op de kaart staan: je komt ze tegen door rond te lopen.
// - Een gouden cirkel op de grond (vanaf ±14 m) laat zien dat er iets is. Sta je erin, dan zie je wat het is en druk je op E.
// - Iemand staat er (een persoon) of er ligt iets (een koffer, een envelop, een telefoon die overgaat).
// - Elk geheim speel je één keer. Het draait op de motor van het verhaal (stad-verhaal.js: G.verhaal.side), met dezelfde
//   stappen: lopen, praten, minigames, kraken, achtervolgen, vechten, foto's, rijden, spullen pakken, de politie afschudden.
// - Gevonden geheimen staan in je telefoon: Verhaal → Geheimen van de stad (x van 12). Bewaard in S.stadVerhaal.d['g_…'].
(function(){
'use strict';
const G=STAD,M=STAD_MAP,TH=window.THREE,K=G.kit,E=K.E;
const touch=matchMedia('(pointer:coarse)').matches;
const GOLD='#ffd35a';
const nacht=()=>(+G.night||0)>.5;
const done=id=>!!(G.verhaal&&G.verhaal.done(id));
const walk=(x,z)=>{const q=M.nearestWalk(x,z,10);return q?[q.x,q.z]:[x,z]};

/* ---------- de mensen ---------- */
const PPL={
 zwerver:{n:'Zwerver Henkie',role:'Woont in de steeg',col:'#9aa1ab',look:{skin:'#d9a27a',hair:'#8e8c88',top:'#5a4a3a',arm:'#5a4a3a',pants:'#3a3c40',shoe:'#2a2c30',hat:'beanie',hatC:'#6a2a1a',hs:'lang',fh:'baard',age:2,col:'jas'}},
 mevrouw:{n:'Mevrouw Van Dam',role:'Villapark',col:'#e8a0c0',look:{skin:'#f1caa5',hair:'#c9a24a',top:'#e8e4da',arm:'#e8e4da',pants:'#5a3a7a',shoe:'#2a2c30',hat:'none',hs:'bob',age:2,col:'blouse',v:1,lip:'#b0203a'}},
 koerier:{n:'Man op de pier',role:'Wacht op Mo',col:'#3a8ad6',look:{skin:'#8d5a3a',hair:'#151517',top:'#1d2531',arm:'#1d2531',pants:'#151517',shoe:'#e8e4da',hat:'cap',hatC:'#151517',hs:'kort',fh:'stoppel',age:1,col:'hoodie'}},
 klant:{n:'De klant',role:'Oosterstraat',col:'#b8a1ff',look:{skin:'#e9b98f',hair:'#2a1d14',top:'#2a2c30',arm:'#2a2c30',pants:'#151517',shoe:'#151517',hat:'none',hs:'kuif',age:1,col:'leer',acc:{zon:1}}},
 gokker:{n:'De bekertjesman',role:'Boulevard',col:'#f2c230',look:{skin:'#b97a52',hair:'#151517',top:'#c8202a',arm:'#c8202a',pants:'#3a3c40',shoe:'#2a2c30',hat:'hat',hatC:'#2a2c30',hs:'kort',fh:'snor',age:1,col:'shirt'}},
 spuiter:{n:'Kiki',role:'De Natte Verf',col:'#3fe395',look:{skin:'#e9b98f',hair:'#3fe395',top:'#151517',arm:'#151517',pants:'#2f4a6a',shoe:'#e8e4da',hat:'none',hs:'opgeschoren',age:1,col:'hoodie'}},
 studente:{n:'Studente',role:'Centrum',col:'#3ad6ff',look:{skin:'#f1caa5',hair:'#a8461e',top:'#3a8ad6',arm:'#3a8ad6',pants:'#2f4a6a',shoe:'#e8e4da',hat:'none',hs:'lang',age:1,col:'shirt',v:1}},
 fietsdief:{n:'De fietsendief',role:'',col:'#ff3d52',look:{skin:'#d9a27a',hair:'#2a1d14',top:'#5a5d63',arm:'#5a5d63',pants:'#1d2531',shoe:'#2a2c30',hat:'cap',hatC:'#c8202a',hs:'kort',age:1,col:'hoodie'}},
 smokkelaar:{n:'Smokkelaar',role:'Het strand',col:'#3a8ad6',look:{skin:'#d9a27a',hair:'#2a1d14',top:'#1a2a3a',arm:'#1a2a3a',pants:'#151517',shoe:'#151517',hat:'beanie',hatC:'#1a1a1c',hs:'kort',fh:'baard',age:1,col:'jas'}},
 visser:{n:'Oude Gerrit',role:'Visser op het eiland',col:'#e8d8a0',look:{skin:'#e9b98f',hair:'#d8d4cc',top:'#d6a63e',arm:'#d6a63e',pants:'#2f4a6a',shoe:'#3a2a1a',hat:'cap',hatC:'#2f4a6a',hs:'kalend',fh:'baard',age:2,col:'werk'}},
 racer:{n:'Snelle Sem',role:'Bedrijventerrein',col:'#f2c230',look:{skin:'#f1caa5',hair:'#d4ac5a',top:'#f2c230',arm:'#151517',pants:'#151517',shoe:'#e8e4da',hat:'none',hs:'kuif',age:1,col:'leer',acc:{zon:1}}},
 detective:{n:'Privédetective',role:'Zuidas',col:'#9aa1ab',look:{skin:'#d9a27a',hair:'#5a3a22',top:'#8a6a42',arm:'#8a6a42',pants:'#3a3c40',shoe:'#3a2a1a',hat:'hat',hatC:'#5a4a3a',hs:'kort',fh:'snor',age:2,col:'jas'}},
 zakenman:{n:'De echtgenoot',role:'',col:'#9aa1ab',look:{skin:'#f1caa5',hair:'#5a5d63',top:'#2a3a5a',arm:'#2a3a5a',pants:'#2a3a5a',shoe:'#151517',hat:'none',hs:'kort',age:2,col:'pak'}},
 dame:{n:'Het gezelschap',role:'',col:'#e05a9a',look:{skin:'#e9b98f',hair:'#151517',top:'#c8202a',arm:'#c8202a',pants:'#151517',shoe:'#151517',hat:'none',hs:'bob',age:1,col:'blouse',v:1,lip:'#b0203a'}}};

/* ---------- de geheimen ----------
 at: waar de cirkel ligt · who: wie er staat (of obj: wat er ligt) · when: alleen dan te vinden · rest: zoals een verhaalmissie */
const SEC=[
 {id:'g_koffer',n:'De koffer in de steeg',where:'Westbuurt',at:[141.5,190],obj:'koffer',label:'Een koffer',
  intro:['Achter de container ligt een dure leren koffer. Niemand in de buurt.','Er zit een slot op. Zonde om hem te laten liggen.'],yes:'Openpeuteren',
  out:'In de koffer: een stapel briefjes en een bankpas van een bank die niet bestaat.',k:2,xp:15,
  steps:[{t:'mini',p:[141.5,190],game:'slot',d:.32,act:'Koffer openpeuteren',txt:'Peuter het slot van de <b>koffer</b> open'},
   {t:'choice',who:'zwerver',at:[141.5,184.5],line:'Hé! Die koffer lag hier al dagen. Ik zag hem eerst! Delen?',
    opts:[{t:'Geef hem de helft',say:'Echt? Je bent een goeie. Kijk eens bij de pier, daar gebeurt van alles.',eff:'zacht'},{t:'Alles voor mij',say:'Ach. Het is jouw stad. Neem maar.',eff:'geld'}]}]},
 {id:'g_band',n:'Lekke band',where:'Villapark',at:[73.6,113.8],who:'mevrouw',when:()=>!nacht(),
  intro:['O, gelukkig, iemand! Mijn band is lek en mijn man neemt niet op.','Kun jij hem wisselen? Ik betaal je ervoor.'],yes:'Ik help even',
  out:'Een goede daad. In deze stad is dat ook een soort geld.',k:1,xp:10,
  steps:[{t:'mini',p:[76,112.2],game:'hold',d:3,vak:'klus',act:'Band wisselen',txt:'Wissel de <b>band</b> van de auto'},
   {t:'talk',who:'mevrouw',mood:'blij',lines:['Wat ben jij handig! Hier, voor de moeite. Zeg maar niks tegen mijn man.'],txt:'Praat met <b>mevrouw Van Dam</b>'}]},
 {id:'g_brief',n:'De envelop onder het bankje',where:'Noorderpark',at:[300,140],bench:1,obj:'envelop',label:'Een envelop',
  intro:['Onder het bankje zit een envelop vastgeplakt.','Op de achterkant: "Pier. Vraag naar Mo." Er zit een sleuteltje in.'],yes:'Naar de pier',
  out:'Een envelop, een pakje en een nieuwe connectie op de Oosterstraat.',k:3,xp:20,
  steps:[{t:'go',p:[596,24],r:6,txt:'Ga naar <b>de pier</b> in de haven'},
   {t:'talk',who:'koerier',at:[594,26],mood:'koel',lines:['Jij bent Mo niet. Maar je hebt het sleuteltje... Ook goed.','Breng dit pakje naar de Oosterstraat. Niet openmaken. Niet stoppen.'],txt:'Praat met de man op de pier'},
   {t:'go',p:[520,459],r:5,timer:150,txt:'Breng het pakje naar de <b>Oosterstraat</b>'},
   {t:'talk',who:'klant',at:[523,459],timer:0,mood:'koel',lines:['Op tijd. Mo stuurt nooit nieuwe gezichten. Jij bent beter dan Mo.'],txt:'Geef het pakje aan <b>de klant</b>'}]},
 {id:'g_bekers',n:'Balletje-balletje',where:'Boulevard',at:[250,523.5],who:'gokker',when:()=>!nacht(),
  intro:['Balletje, balletje! Waar is het balletje?','Eerste keer gratis voor nieuwe gezichten. Wie wint, krijgt de pot!'],yes:'Ik speel mee',
  out:'Wie vals speelt, betaalt dubbel.',k:2,xp:15,
  steps:[{t:'mini',p:[250,522],game:'timing',act:'Kies een bekertje',o:{title:'Balletje-balletje',sub:'Druk als het streepje bij het balletje is',n:3,sp:2,w:.16,label:'Die!',vak:'graaien'},txt:'Volg het <b>balletje</b>'},
   {t:'talk',who:'gokker',mood:'boos',lines:['Eh... dat telt niet. Je keek vals. Geen geld voor jou.'],txt:'Haal je winst op'},
   {t:'fight',who:'gokker',name:'De bekertjesman',hp:70,win:.7,txt:'Hij wil niet betalen. <b>Overtuig hem</b>'}]},
 {id:'g_crew',n:'De Natte Verf',where:'Oosterstraat',at:[560.5,463],who:'spuiter',
  intro:['Jij ziet eruit alsof je een spuitbus vast kunt houden. Wij zijn De Natte Verf.','Drie muren in deze steeg, anderhalve minuut. Lukt het, dan hoor je bij ons.'],yes:'Geef die bus',
  out:'Je tag staat nu naast die van De Natte Verf. Dat zegt iets in deze buurt.',k:2,xp:15,
  steps:[{t:'mini',p:[559.7,467],game:'timing',act:'Tag zetten',o:{title:'Tag zetten',sub:'Druk als het streepje in het groen staat',n:3,sp:1.4,w:.2,label:'Spuit!',vak:'tag'},timer:90,txt:'Zet je <b>eerste tag</b>'},
   {t:'mini',p:[554,480.8],game:'timing',act:'Tag zetten',o:{title:'Tag zetten',sub:'Sneller nu',n:3,sp:1.6,w:.19,label:'Spuit!',vak:'tag'},txt:'Nu de <b>tweede</b>'},
   {t:'mini',p:[557.8,500],game:'timing',act:'Tag zetten',o:{title:'Tag zetten',sub:'De laatste',n:4,sp:1.7,w:.18,label:'Spuit!',vak:'tag'},txt:'En de <b>derde</b>'},
   {t:'talk',who:'spuiter',timer:0,mood:'blij',lines:['Niet slecht! Welkom bij De Natte Verf. Hier, voor nieuwe bussen.'],txt:'Terug naar <b>Kiki</b>'}]},
 {id:'g_fiets',n:'Fietsendief',where:'De Gracht',at:[351.3,266.7],who:'studente',when:()=>!nacht(),
  intro:['Hij heeft mijn fiets! Die gast daar met de rode pet!','Alsjeblieft, haal hem terug!'],yes:'Ik pak hem',
  out:'Held van de gracht. Voor even.',k:1,xp:15,
  steps:[{t:'run',who:'fietsdief',at:[349.5,257],time:35,txt:'<b>Haal de fietsendief in</b>'},
   {t:'fight',who:'fietsdief',name:'De fietsendief',hp:60,win:.72,txt:'Hij wil vechten'},
   {t:'go',p:'studente',r:2.8,txt:'Breng de fiets terug naar de <b>studente</b>'},
   {t:'talk',who:'studente',mood:'blij',lines:['Mijn fiets! Dankjewel! Mijn vader heeft een snackbar. Zeg maar dat ik je stuur.'],txt:'Praat met de studente'}]},
 {id:'g_smokkel',n:'Lichtjes op het strand',where:'Het Strand',at:[120,538],who:'smokkelaar',when:()=>nacht(),
  intro:['Psst. Jij. Mijn maat is niet komen opdagen en de boot ligt al te wachten.','Drie kratten van het strand naar het busje. Snel en stil. Er zit wat in voor je.'],yes:'Ik help',
  out:'Het busje rijdt weg. In het dashboardkastje lag jouw deel.',k:3,xp:20,
  steps:[{t:'loot',pts:[[106,543],[121,544],[136,543]],kind:'box',timer:75,txt:'Pak de <b>kratten</b> bij de waterlijn'},
   {t:'go',p:[125,512],r:4,txt:'Breng ze naar het <b>busje</b> aan de Boulevard'}]},
 {id:'g_kluis',n:'De bouwkeet',where:'Boulevard',at:[145,463],obj:'keet',label:'Licht op de bouwplaats',
  intro:['De gele bouwkeet staat op een kier. Binnen staat een kluis met de lonen: morgen is het betaaldag.','Twee bewakers lopen rondjes over het terrein.'],yes:'Ik ga erin',
  out:'De lonen van een hele ploeg. Morgen staat het in de krant.',k:4,xp:25,
  steps:[{t:'mini',p:[147.6,482],game:'kluis',d:.42,act:'Kluis kraken',guards:{zone:[124,466,166,503],n:2,R:8},txt:'Sluip naar de <b>kluis</b>. Blijf uit het licht van de bewaking'},
   {t:'loot',pts:[[147.4,483.6]],kind:'cash',guards:1,txt:'Pak de <b>lonen</b>'},
   {t:'wanted',stars:1,why:'inbraak',txt:'Het alarm gaat! <b>Schud de politie af</b>'}]},
 {id:'g_visser',n:'Wat de zee teruggaf',where:'Het Eiland',at:[760,626],who:'visser',
  intro:['Vannacht zag ik een speedboot iets overboord gooien, vlak bij de westpunt van het eiland.','Mijn rug wil niet meer. Als jij het vindt, delen we.'],yes:'Ik ga kijken',
  out:'Wat de zee teruggeeft, is van wie het vindt. Of van wie het deelt.',k:2,xp:20,
  steps:[{t:'loot',pts:[[612,587]],kind:'bag',txt:'Zoek de <b>tas</b> aan de westpunt van het eiland'},
   {t:'go',p:'visser',r:2.8,txt:'Terug naar <b>Oude Gerrit</b>'},
   {t:'choice',who:'visser',line:'En? Heb je hem? Wat zit erin?',opts:[{t:'Eerlijk delen',say:'Jij bent een fatsoenlijk mens. Die zijn hier zeldzaam.',eff:'zacht'},{t:'"Er zat niks in"',say:'Niks? Hm. Nou ja. Bedankt voor het kijken.',eff:'geld'}]}]},
 {id:'g_race',n:'Snelle Sem',where:'Bedrijventerrein',at:[690,114],who:'racer',
  intro:['Mooie schoenen. Kun je ook rijden?','Naar de Noordkade en terug, binnen twee minuten. Lukt het, dan is de pot voor jou. Mijn auto, jouw handen.'],yes:'Sleutels',
  out:'Sem telt het geld uit. "Volgende keer rij ik zelf."',k:3,xp:20,
  steps:[{t:'car',at:[700,105],col:'#f2c230',kind:'sport',name:'Gele Supra',txt:'Stap in de <b>gele Supra</b>'},
   {t:'drive',p:[300,40],r:8,timer:120,txt:'Rij naar de <b>Noordkade</b>'},
   {t:'drive',p:[692,105],r:8,txt:'En terug naar <b>Snelle Sem</b>'},
   {t:'talk',who:'racer',timer:0,mood:'blij',lines:['Niet slecht! Hier is de pot. En mijn auto heeft geen kras? Dan zijn we vrienden.'],txt:'Stap uit en praat met <b>Sem</b>'}]},
 {id:'g_foto',n:'De lunch',where:'Zuidas',at:[507,296],who:'detective',
  intro:['Privédetective. Een klant wil weten met wie haar man luncht.','Ze zitten op het terras op de Zuidas. Eén foto van elk. Ik ben te bekend, jij niet.'],yes:'Geef die camera',
  out:'De detective bekijkt de foto\'s. "Dit wordt een dure scheiding. Voor hem."',k:2,xp:20,
  steps:[{t:'go',p:[513,331],r:9,spawn:{zakenman:[513.4,335.4,0],dame:[515.2,335.4,Math.PI]},txt:'Ga naar het <b>terras</b> op de Zuidas'},
   {t:'foto',targets:['zakenman','dame'],txt:'Maak een <b>foto</b> van het stel'},
   {t:'go',p:'detective',r:2.8,txt:'Breng de foto\'s naar de <b>detective</b>'}]},
 {id:'g_telefoon',n:'Onbekend nummer',where:'De Haven',at:[441.5,60],obj:'telefoon',label:'Een telefoon die overgaat',
  intro:['Op de grond ligt een telefoon. Hij gaat over. Onbekend nummer.','Je neemt op. Een zware stem: "Container op de Noordkade. Pak de tas en zeg niks." Dan hangt hij op.'],yes:'Gaan kijken',
  out:'Iemand wilde dat jij gepakt werd. Maar de tas is van jou.',k:3,xp:20,
  steps:[{t:'loot',pts:[[366.5,66]],kind:'bag',txt:'Zoek de <b>tas</b> bij de container op de Noordkade'},
   {t:'wanted',stars:1,why:'heling',txt:'Het was een val! <b>Schud de politie af</b>'}]}];

/* ---------- in de stad: wie er staat, wat er ligt, de cirkel ---------- */
const open=s=>!done(s.id)&&(!s.when||s.when());
function setup(){const V=G.verhaal,P0=V.ppl;Object.keys(PPL).forEach(k=>{if(!P0[k])P0[k]=PPL[k]});
  SEC.forEach(s=>{if(s.bench){const pk=M.Z.park,b=M.props.filter(q=>q.k==='bench'&&q.x>pk[0]&&q.x<pk[2]&&q.z>pk[1]&&q.z<pk[3]).sort((a,c)=>Math.hypot(a.x-s.at[0],a.z-s.at[1])-Math.hypot(c.x-s.at[0],c.z-s.at[1]))[0];if(b){s.bx=b.x;s.bz=b.z;s.at=[b.x,b.z]}}
    const p=walk(s.at[0],s.at[1]);s.x=p[0];s.z=p[1];
    s.def={id:s.id,side:1,n:s.n,where:s.where,k:s.k,xp:s.xp,out:s.out,steps:s.steps,
      pre:s.who?()=>{idleOff(s);return {[s.who]:V.mkActor(s.who,s.x,s.z,{ry:s.ry||0})}}:null};
    s.spot=G.spot({k:'geheim',x:s.x,z:s.z,r:2.6,h:s.who?2.3:1.4,hint:1,hintR:14,col:GOLD,prio:1,
      n:s.who?PPL[s.who].n:s.label,sub:s.who?PPL[s.who].role:'Geheim',show:()=>open(s)&&!busy(),act:()=>talk(s)})});
  bouwDecor();
  const f0=G.onFrame;G.onFrame=function(dt){f0&&f0(dt);try{frame(dt)}catch(e){console.error(e)}}}
// de bouwplaats aan de Boulevard: een bouwkeet met licht (daar staat de kluis), pallets en een zandhoop. De keet is vast.
function bouwDecor(){const z=M.Z&&M.Z.bouw;if(!z)return;const g=new TH.Group(),mat=c=>new TH.MeshLambertMaterial({color:c}),box=(x0,y0,z0,x1,y1,z1,c,basic)=>{const m=new TH.Mesh(new TH.BoxGeometry(x1-x0,y1-y0,z1-z0),basic?new TH.MeshBasicMaterial({color:c}):mat(c));m.position.set((x0+x1)/2,(y0+y1)/2,(z0+z1)/2);g.add(m)};
  const k={x0:148.4,z0:479.6,x1:153,z1:484.6};box(k.x0,0,k.z0,k.x1,2.6,k.z1,0xd6a63e);box(k.x0-.08,2.6,k.z0-.08,k.x1+.08,2.75,k.z1+.08,0x5a5d63);
  box(k.x0-.05,.05,481.4,k.x0+.02,2.1,482.6,0x3a3c40);box(k.x0-.05,1.2,483.2,k.x0+.02,1.9,484.1,0xfff0a0,1);box(k.x0-.05,1.2,479.9,k.x0+.02,1.9,480.8,0xfff0a0,1);
  for(let i=0;i<3;i++)box(156,i*.16,470+i*.05,157.4,i*.16+.14,471.2,0x8a6a42);box(126,0,496,129,.9,499,0xc2b28a);box(127,.9,496.8,128.4,1.4,498.2,0xc2b28a);
  for(let i=0;i<4;i++){const m=new TH.Mesh(new TH.CylinderGeometry(.22,.22,4,8),mat(0x9aa1ab));m.rotation.z=Math.PI/2;m.position.set(160,.22+Math.floor(i/2)*.42,490+(i%2)*.46+(i>1?.23:0));g.add(m)}
  G.scene().add(g);try{M.setSolid(k,1)}catch(e){}}
const busy=()=>!!(G.verhaal.run()||(G.mission&&G.mission()));
// personen: alleen als je in de buurt bent (en ze er mogen zijn); ze kijken je aan
function idleOff(s){if(s.a){G.verhaal.rmActor(s.a);s.a=null}}
let objs=null;
function frame(dt){const P=G.P,R=G.verhaal.run(),t=performance.now()/1000;if(!objs)objs=SEC.filter(s=>s.obj).map(s=>(s.mesh=objMesh(s),s));
  SEC.forEach(s=>{const d=Math.hypot(s.x-P.x,s.z-P.z),mine=R&&R.def===s.def,on=open(s)&&d<70&&!mine;
    if(s.who){if(on&&!s.a)s.a=G.verhaal.mkActor(s.who,s.x,s.z,{ry:0});if(!on&&s.a)idleOff(s);
      if(s.a){s.a.sp=0;s.a.ph+=dt*.3;if(d<9){const want=Math.atan2(P.x-s.a.x,P.z-s.a.z);let r=want-s.a.ry;while(r>Math.PI)r-=Math.PI*2;while(r<-Math.PI)r+=Math.PI*2;s.a.ry+=r*Math.min(1,dt*4)}}}
    if(s.mesh){s.mesh.visible=open(s)&&d<90&&!mine;if(s.mesh.visible&&s.blink){s.blink.visible=Math.sin(t*9)>0||d>20}}
    // de telefoon gaat over als je dichtbij komt
    if(s.obj==='telefoon'&&s.mesh&&s.mesh.visible&&d<12&&!busy()){s.rt=(s.rt||0)-dt;if(s.rt<=0){s.rt=2.4;G.snd&&G.snd.fx('notify')}}})}
function objMesh(s){const g=new TH.Group(),mat=c=>new TH.MeshLambertMaterial({color:c}),box=(w,h,d,c,x,y,z)=>{const m=new TH.Mesh(new TH.BoxGeometry(w,h,d),mat(c));m.position.set(x||0,y,z||0);g.add(m);return m};
  if(s.obj==='koffer'){box(.62,.42,.2,0x5a3a22,0,.21,0);box(.2,.06,.06,0x2a1d14,0,.45,0);box(.06,.06,.22,0xd6a63e,.18,.3,0)}
  else if(s.obj==='envelop'){box(.34,.03,.24,0xe8e4da,0,.5,0);box(.08,.035,.06,0xc8202a,0,.51,0)}
  else if(s.obj==='telefoon'){box(.16,.03,.3,0x151517,0,.02,0);const l=new TH.Mesh(new TH.BoxGeometry(.12,.035,.2),new TH.MeshBasicMaterial({color:0x3fe395}));l.position.set(0,.04,0);g.add(l);s.blink=l}
  else if(s.obj==='keet'){box(.06,1.5,.06,0x3a3c40,.8,.75,.6);const l=new TH.Mesh(new TH.BoxGeometry(.34,.24,.12),new TH.MeshBasicMaterial({color:0xfff0a0}));l.position.set(.8,1.55,.6);g.add(l);box(.5,.06,.5,0x3a3c40,.8,.03,.6)}
  g.position.set(s.bx!=null?s.bx:s.x,0,s.bz!=null?s.bz:s.z);g.visible=false;G.scene().add(g);return g}

/* ---------- aanspreken: wie het is en wat er speelt ---------- */
function draw(kind){return pc=>{const c=pc.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle='#1b1c22';c.fillRect(0,0,40,24);const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(x,y,w,h)};
  if(kind==='koffer'){R(10,9,20,12,'#5a3a22');R(10,9,20,2,'#7a5232');R(17,6,6,3,'#2a1d14');R(26,13,2,3,'#d6a63e')}
  else if(kind==='envelop'){R(9,7,22,13,'#e8e4da');for(let i=0;i<7;i++){R(9+i*1.5,7+i,3,1,'#b8b4aa');R(29-i*1.5,7+i,3,1,'#b8b4aa')}R(18,12,4,3,'#c8202a')}
  else if(kind==='telefoon'){R(15,3,10,18,'#151517');R(16,5,8,12,'#3fe395');R(18,18,4,1,'#5a5d63');R(4,6,3,1,'#f2c230');R(33,6,3,1,'#f2c230');R(3,10,3,1,'#f2c230');R(34,10,3,1,'#f2c230')}
  else{R(6,6,28,15,'#3a3c40');R(9,9,8,6,'#f2c230');R(22,9,8,12,'#2a2c30')}}}
function talk(s){if(busy()){G.toast('Maak eerst af waar je mee bezig bent','bad');return}if(G.police&&G.police.active()){G.toast('Schud eerst de politie af','bad');return}
  const pp=s.who?PPL[s.who]:null;let li=0;G.talking=true;if(s.a)G.lookAt=s.a;
  const ch=()=>li<s.intro.length-1?[{t:'Verder',ic:K.ic.route,f:()=>{li++;K.say(s.intro[li],null,ch())}}]
    :[{t:s.yes||'Ik doe het',sub:'Geheim · '+s.where,ic:K.ic.star||K.ic.route,risk:s.k>=4?3:s.k>=3?2:1,f:()=>{K.closeDialog(true);G.talking=false;G.lookAt=null;first(s);G.verhaal.side(s.def)}},
      {t:'Laat maar',ic:K.ic.no,f:()=>K.closeDialog()}];
  const d={name:pp?pp.n:s.label,role:pp?pp.role:'Geheim · '+s.where,col:GOLD,lines:[s.intro[0]],choices:ch(),onClose:()=>{G.talking=false;G.lookAt=null}};
  if(pp){d.look=Object.assign({bg:'#1b1c22'},pp.look);d.mood='neutraal'}else d.draw=draw(s.obj);
  K.dialog(d)}
// de eerste keer gevonden: even melden (niet op de kaart, wel in je telefoon)
function first(s){const st=S.stadGeheim||(S.stadGeheim={});if(!st[s.id]){st[s.id]=Date.now();try{save()}catch(e){}}}

/* ---------- telefoon: Verhaal → Geheimen van de stad ---------- */
G.geheimHtml=()=>{const n=SEC.filter(s=>done(s.id)).length;
  return `<div class="sd-vl-ch sd-geh" style="--c:${GOLD}"><div class="sd-vl-h"><i>?</i><span><b>Geheimen van de stad · ${n} van ${SEC.length}</b><small>Staan niet op de kaart. Loop rond en let op gouden cirkels op de grond.</small></span></div>
   <ul>${SEC.map(s=>{const d=done(s.id),f=S.stadGeheim&&S.stadGeheim[s.id];return `<li class="${d?'ok':f?'nx':''}"><span>${d?'✓':f?'▶':'·'}</span>${d||f?E(s.n):'???'}<em>${d||f?E(s.where):''}</em></li>`}).join('')}</ul></div>`};
G.geheim={list:()=>SEC,open:id=>{const s=SEC.find(q=>q.id===id);if(s)talk(s)}};
const w=setInterval(()=>{if(!G.ready||!G.verhaal||!G.verhaal.side||!G.scene||!G.spot)return;clearInterval(w);setup()},300);
})();
