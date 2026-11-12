// Pixelstad: de mensen van de stad. Naast toeristen en voorbijgangers wonen er 72 vaste bewoners (9 per wijk) met een eigen naam,
// gezicht, postuur, beroep en karakter. Je komt ze in hun eigen wijk steeds weer tegen. Met iedereen heb je een band (−100 … 100):
//   praten, een compliment, een grap, trakteren en een cadeau maken de band beter (praatjes tellen tot 10 punten per dag per persoon);
//   beroven, zakkenrollen, uitschelden, vechten en misdaad waar ze bij staan maken hem slechter.
// - Bekenden groeten je. Vrienden bellen de politie niet, geven korting en doen één keer per dag iets voor je (een gunst die bij hun
//   beroep past). Vijanden praten niet met je en bellen sneller. Zie je iemand dagen niet, dan zakt de band langzaam weer weg.
// - Bekendheid (0 … 100) komt uit je rang, je straatnaam, je wijken, je plek op de ranglijst en het nieuws. Hoe bekender, hoe vaker
//   mensen je herkennen: in een wijk waar je respect hebt knikken ze en zeggen ze baas, in een wijk waar je veel misdaad pleegt
//   lopen ze met een boog om je heen en durven ze minder snel te bellen. Met een bivakmuts op herkent niemand je.
// Bewaard in S.stadBand = {id:{v band, d laatste dag, g/gd praatpunten vandaag, f gunst-dag, c cadeau-dag, td trakteer-dag, k gekend}}.
(function(){
'use strict';
const G=STAD,M=STAD_MAP,K=G.kit,E=K.E;
const rr=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)],clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const sv=()=>{try{save()}catch(e){}};
const obj=(k,d)=>{try{if(!S[k]||typeof S[k]!=='object')S[k]=d;return S[k]}catch(e){return d}};
const dayN=()=>Math.floor((Date.now()-6*3600e3+3600e3)/864e5);
const zS=k=>G.schaal?G.schaal.zwart(k):Math.round(50*k),wS=k=>G.schaal?Math.round(G.schaal.wit()*k):Math.round(20*k),
  zK=k=>G.schaal&&G.schaal.kost?G.schaal.kost(k):zS(k);   // prijzen (trakteren, cadeaus, lenen): zonder lidbonus
const me=()=>String(window.__USER__||'jij');
const masked=()=>!!(G.P&&G.P.look&&G.P.look.hat==='mask');
function rng(seed){let s=seed>>>0;return ()=>{s=(s+0x6D2B79F5)>>>0;let t=Math.imul(s^(s>>>15),1|s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}}
/* =================== wie woont waar =================== */
const ZN={west:'Westbuurt',noord:'Noordkant',strand:'Boulevard',centrum:'Centrum',plein:'Het Plein',haven:'De Haven',zuidas:'Zuidas',oost:'Oostland'};
// een van de zeven wijken, of 'oost' (Oostland, over het havenkanaal); de rest (haven-industrie, Oosterstraat, Het Eiland) is van niemand
const zoneAt=(x,z)=>{try{const w=G.wijk&&G.wijk.at(x,z);return w?w.id:M.estateAt(x,z)?'oost':null}catch(e){return M.estateAt(x,z)?'oost':null}};
// per zone het gebied waarin we een thuisplek zoeken (eenmalig uitgerekend)
let ZBOX=null;
function zoneBox(zn){if(!ZBOX&&G.wijk){ZBOX={};for(let z=2;z<M.H;z+=4)for(let x=2;x<M.W;x+=4){const k=zoneAt(x,z);if(!k)continue;const b=ZBOX[k]||(ZBOX[k]={x0:x,z0:z,x1:x,z1:z});if(x<b.x0)b.x0=x;if(x>b.x1)b.x1=x;if(z<b.z0)b.z0=z;if(z>b.z1)b.z1=z}}
  return (ZBOX&&ZBOX[zn])||{x0:12,z0:12,x1:M.W-12,z1:M.H-12}}
// beroep: naam, soort mens, kleding, gunst
const JOB={bakker:['Bakker','burger','schort','eten'],kok:['Kok','burger','schort','eten'],zuster:['Verpleegkundige','burger','blouse','zorg'],arts:['Huisarts','zakenman','pak','zorg'],
  taxi:['Taxichauffeur','burger','leer','rit'],monteur:['Automonteur','burger','werk','monteur'],haven:['Havenwerker','burger','werk','tip'],advocaat:['Advocaat','zakenman','pak','alibi'],
  bankier:['Bankier','zakenman','pak','beurs'],journalist:['Journalist','burger','trui','pers'],student:['Student','student','hoodie','uitkijk'],kapper:['Kapper','burger','shirt','roddel'],
  barman:['Barman','burger','shirt','roddel'],markt:['Marktkoopman','burger','shirt','roddel'],pensioen:['Gepensioneerd','oma','trui','eten'],koerier:['Fietskoerier','student','track','uitkijk'],
  bende:['Bendelid','rivaal','leer','deel']};
const ZJ={west:['student','koerier','pensioen','kapper','bakker','zuster','bende','student','markt'],noord:['pensioen','arts','advocaat','pensioen','zuster','journalist','taxi','student','kok'],
  strand:['kok','barman','student','koerier','taxi','pensioen','markt','bende','zuster'],centrum:['markt','barman','kapper','journalist','bakker','student','taxi','advocaat','pensioen'],
  plein:['bakker','arts','zuster','taxi','barman','kok','student','journalist','bankier'],haven:['haven','haven','monteur','monteur','bende','bende','kok','taxi','haven'],
  zuidas:['advocaat','bankier','bankier','journalist','advocaat','arts','barman','koerier','bankier'],oost:['monteur','pensioen','bakker','zuster','taxi','student','markt','haven','kapper']};
const GUNST={eten:['Iets te eten','Hier, neem mee. Vers van vandaag.'],zorg:['Laat je oplappen','Ga zitten. Dit prikt even.'],rit:['Een gratis rit','Bel de centrale maar. Je volgende rit is van mij.'],
  monteur:['Auto laten nakijken','Zet hem neer. Kwartiertje werk.'],tip:['Een tip','Ik hoorde iets op de kade. Kijk op je kaart.'],alibi:['Een goed woordje','Ik bel iemand. Ze kijken even niet naar je.'],
  beurs:['Een beurstip','Koop vandaag, verkoop morgen. Hier is je deel.'],pers:['Een mooi stukje','Morgen staat het erin. Positief, beloofd.'],uitkijk:['Op de uitkijk staan','Ik fluit als ik blauw zie.'],
  roddel:['Het laatste nieuws','Wat ik nu ga zeggen heb je niet van mij.'],deel:['Je deel','We hadden een goede week. Dit is voor jou.']};
const AARD={hartelijk:'Hartelijk: de band groeit sneller',wantrouwig:'Wantrouwig: de band groeit langzaam, belt sneller',roddelaar:'Roddelaar: wat jij doet weet de hele wijk',stoer:'Stoer: niet bang, belt niet snel',nuchter:'Nuchter'};
const FM=['Peter','Ahmed','Joost','Rik','Daan','Mo','Youssef','Bram','Kees','Henk','Sven','Jeroen','Karim','Tim','Dennis','Ricardo','Jamal','Bas','Wim','Cor','Stefan','Mehmet','Ruben','Lars','Hassan','Gerrit','Theo','Marco','Nico','Rachid','Tom','Sjoerd','Winston','Erik','Frank','Ivo','Murat','Cees','Hugo','Dirk'];
const FV=['Linda','Marieke','Fatima','Sanne','Lotte','Fleur','Eva','Noor','Truus','Riek','Joke','Bep','Fien','Anouk','Samira','Ingrid','Petra','Yasmin','Kim','Esther','Naima','Roos','Mila','Chantal','Annie','Hanna','Zoë','Laila','Wilma','Sophie','Priya','Ans','Carla','Dewi','Meryem','Tineke','Iris','Shanti','Greet','Marit'];
const LN=['de Vries','Jansen','Bakker','Visser','Smit','de Boer','Mulder','Bos','Vos','Peters','Hendriks','van Dijk','El Amrani','Yilmaz','Kaya','van den Berg','Dekker','Brouwer','de Wit','Dijkstra','Smits','de Graaf','Kok','Jacobs','Öztürk','Bouzid','Pinas','Wijntuin','van Leeuwen','Koning','Meijer','Schouten','Hoekstra','Prins','Huisman','Tahiri','Sedney','de Haan','Kramer','Postma','Aksoy','Ramdin','van Vliet','Groen','Benali','Verhoeven','Blom','Çelik','Zijlstra','Doorn','Maas','Oosterhuis','Amrabat','Kuiper','Wolters','Biharie','van Beek','Timmer','Arslan','Veenstra','Hermans','Chin','de Jong','Willems','Bulut','Lammers','Scholten','Idrissi','Gerritsen','Rietveld','Tak','Molenaar'];
const SKIN=['#f1caa5','#e9b98f','#d9a27a','#b97a52','#8d5a3a','#6e4630'];
const TOPS={pak:['#1f2430','#2a2c30','#3a3d42','#2f3a52','#4a3a2a'],schort:['#c0261e','#2f6a8a','#3c8a4a','#e8e4da'],blouse:['#e8e4da','#7a5a8a','#c0506a','#3a8ad6','#f0b23a','#4a6a5a'],leer:['#1d1d1f','#3a2418','#2a2c30','#5a2a1a'],
  werk:['#f07a1a','#2f5d9a','#4a4a3a','#d6a63e'],trui:['#7a5a8a','#4a6a5a','#8a4a4a','#5a6a8a','#c9b48a','#2f6a8a'],hoodie:['#5a3a7a','#2f6a8a','#7a2f2a','#3c8a4a','#2a2c30','#d6a63e'],shirt:['#e8584a','#3a8ad6','#3fe395','#e8e4da','#f0b23a','#ff7fb3','#2a2c30'],
  track:['#1d1d1f','#c0261e','#2f5d9a','#3c8a4a']};
function mkLook(r,v,age,job){const J=JOB[job],col=J[2],P=a=>a[Math.floor(r()*a.length)],skin=P(SKIN);
  const hair=age===2?P(['#d8d4cc','#b8b4ac','#8a8c90','#e8e4da']):P(['#151517','#151517','#2a1d14','#4a2e1a','#8a6a3a','#c9a24a','#8a2f1a','#3a2a1a']);
  let hs=v?P(age===2?['bob','knot','krul','kort','bob']:['lang','lang','bob','knot','staart','krul','afro','vlecht','kort']):P(age===2?['kalend','kalend','kaal','kort','zij']:['kort','kort','kuif','zij','opgeschoren','kaal','krul','afro','lang','hanenkam']);
  if(job==='bende'&&!v)hs=P(['opgeschoren','kaal','hanenkam','kort']);if(job==='advocaat'||job==='bankier'||job==='arts')hs=v?P(['bob','knot','lang']):P(['zij','kort','kalend']);
  let hat='none',hatC=P(['#2a2c30','#c0261e','#e8e4da','#2f5d9a','#d6a63e','#3c8a4a']);const q=r();
  if(v&&q<.12){hat='hijab';hatC=P(['#2f6a8a','#7a5a8a','#1d1d1f','#c9b48a','#8a2f4a','#3c8a4a'])}
  else if(job==='monteur'||job==='haven'){if(q<.6)hat=P(['cap','beanie'])}else if(job==='student'||job==='koerier'){if(q<.55)hat=P(['beanie','cap','hood'])}
  else if(job==='bende'){if(q<.5)hat=P(['beanie','cap','hood']);hatC='#151517'}else if(job==='pensioen'){if(!v&&q<.4){hat='hat';hatC=P(['#3a2a1a','#4a4a3a','#2a2c30'])}}
  else if((job==='bakker'||job==='kok')&&q<.5){hat='cap';hatC='#f1efe9'}else if(job==='taxi'&&q<.35){hat='cap';hatC='#1d1d1f'}
  const top=P(TOPS[col]||TOPS.shirt),acc={};
  if(r()<(age===2?.55:.22))acc.bril=r()<.25?2:1;else if(r()<.07)acc.zon=1;if(r()<(v?.5:.08))acc.oor=v&&r()<.5?2:1;if(r()<.1)acc.spr=1;if(r()<.09)acc.mv=1;
  if(job==='bende'){if(r()<.45)acc.lit=1;if(r()<.4)acc.tat=r()<.4?2:1;if(r()<.2)acc.tand=1}else if(job==='haven'&&r()<.3)acc.tat=1;if((job==='student'||job==='koerier')&&r()<.25&&hat==='none')acc.kop=1;
  const fh=v?'':P(age===0?['','','','stoppel','snor','sik']:['','','stoppel','snor','sik','ringbaard','baard','baard']);
  const L={skin,hair,top,arm:col==='shirt'&&r()<.5?skin:top,pants:col==='pak'?top:P(['#2c3a4d','#1d1d1f','#3a3c40','#5a5a62','#c9b48a','#2a2c30']),shoe:P(['#0e0f12','#e8e4da','#3a2a20','#2a2c30']),
    hat,hatC,hs,fh,col,fw:P(v?[16,16,18,18]:[16,18,18,20,20]),jaw:P(v?['rond','rond','spits']:['rond','hoekig','hoekig','spits']),age,eye:P(['#3a2a1a','#3a2a1a','#3a2a1a','#2a4a6a','#3a6a3a','#5a3a1a']),nose:P(['','','breed','lang']),
    v:v?1:0,w:+(v?.88+r()*.16:.94+r()*.22).toFixed(2),h:+(age===2?.9+r()*.07:v?.93+r()*.1:.98+r()*.11).toFixed(2),acc,bg:'#1a1d23'};
  if(v&&r()<.5)L.lip=P(['#b0303a','#c0506a','#8a2a4a','#d0605a']);if(col==='pak')L.tie=v?null:P(['#7a1f2a','#2f5d9a','#c9a227','#3c8a4a','#5a3a7a']);if(col==='pak'&&v){L.col='blouse'}
  if(job==='bende')L.chain=r()<.6?1:0;if(hs==='lang'||hs==='bob')L.long=1;if(!v&&r()<.3)L.brow=2;return L}
const ROS=[],REG={};
(function build(){const r=rng(71173),sh=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};const fm=sh(FM),fv=sh(FV),ln=sh(LN);let im=0,iv=0,il=0;
  const TR=['hartelijk','wantrouwig','roddelaar','stoer','nuchter','nuchter','hartelijk'];
  Object.keys(ZJ).forEach(zone=>ZJ[zone].forEach((job,i)=>{const J=JOB[job],v=job==='zuster'?r()<.8:job==='bende'||job==='haven'||job==='monteur'?r()<.2:r()<.5,age=job==='pensioen'?2:job==='student'||job==='koerier'?0:r()<.3?0:1;
    const nm=(v?fv[iv++%fv.length]:fm[im++%fm.length])+' '+ln[il++%ln.length],arch=job==='pensioen'?(v?'oma':'burger'):J[1];
    const p={id:'r_'+zone+i,nm,v:v?1:0,age,job,jobN:J[0],arch,zone,gunst:J[3],trait:job==='kapper'||job==='barman'||job==='markt'?'roddelaar':job==='bende'?'stoer':TR[Math.floor(r()*TR.length)],kind:'res',seed:Math.floor(r()*1e9)};
    p.look=mkLook(rng(p.seed),p.v,age,job);ROS.push(p);REG[p.id]=p}))})();
// vaste figuren (koffiekar, visboer, wijkbazen …): een eigen ontwerp erbij
const FIXL={'Luigi':{hs:'zij',fh:'snor',col:'schort',age:1,acc:{}},'Ali van de shoarma':{hs:'kort',fh:'ringbaard',col:'schort',fw:20,age:1,nose:'breed'},'Ouwe Jaap':{hs:'kalend',fh:'baard',col:'trui',age:2,fw:20,acc:{mv:1}},
  'Snelle Eddy':{hs:'kort',fh:'sik',col:'pak',tie:'#c9a227',acc:{zon:1,tand:1,oor:1},jaw:'spits',fw:16},'Rico':{hs:'opgeschoren',fh:'stoppel',col:'leer',acc:{lit:1},jaw:'hoekig'},'Sjaak met de gitaar':{hs:'lang',fh:'baard',col:'shirt',age:1,acc:{oor:1}},
  'Ome Henk':{hs:'kalend',fh:'stoppel',col:'leer',age:2,fw:20,jaw:'hoekig',acc:{tand:1}},'Rooie Ron':{hs:'kuif',hair:'#b0401a',fh:'snor',col:'track',acc:{spr:1}},'Ome Kees':{hs:'lang',fh:'baard',col:'hoodie',age:2,acc:{pl:1}},
  'Gekke Gerrit':{hs:'krul',fh:'stoppel',col:'trui',age:1,acc:{mv:1}},'Sjonnie':{hs:'kort',fh:'baard',col:'hoodie',age:1},'Lange Lies':{hs:'lang',fh:'',v:1,col:'trui',age:2,fw:16,jaw:'spits',h:1.08,w:.86},
  'Dikke Dries':{hs:'kort',fh:'baard',col:'hoodie',fw:20,w:1.22,acc:{tat:1}},'Lange Loes':{hs:'lang',fh:'',v:1,col:'leer',fw:16,jaw:'spits',lip:'#8a2a4a',h:1.12,w:.88,acc:{oor:2}},'Surf-Sjors':{hs:'lang',fh:'stoppel',col:'tank',acc:{zon:1},jaw:'hoekig'},
  'Kale Karel':{hs:'kaal',fh:'sik',col:'leer',fw:20,jaw:'hoekig',w:1.14,acc:{lit:1,tat:2},brow:2},'Mooie Mo':{hs:'zij',fh:'snor',col:'pak',tie:'#ff7fb3',acc:{oor:1,tand:1},jaw:'spits'},
  'IJzeren Inge':{hs:'staart',fh:'',v:1,col:'werk',jaw:'hoekig',w:1.1,acc:{lit:1},brow:2},'De Advocaat':{hs:'zij',col:'pak',age:2,acc:{bril:2},jaw:'spits',fw:16,h:1.05,w:.9}};
const cntA={};const af0=G.addFixed;
G.addFixed=function(arch,x,z,ry){const n=af0(arch,x,z,ry);try{const A=G.npcA[arch],k=cntA[arch]=(cntA[arch]||0)+1;if(A&&A.names&&A.names.length>1)n.nm=A.names[(k-1)%A.names.length];n._af=1}catch(e){}return n};
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,'');
function idOf(n){if(!n)return null;if(n.rid)return REG[n.rid]?n.rid:null;if(!n._af||n.arch==='vechter'||!n.nm||(n.arch==='wijkbaas'&&!n.wijk))return null;const id='v_'+slug(n.nm);
  if(!REG[id]){const A=G.npcA[n.arch]||{};const X=FIXL[n.nm];if(X){Object.assign(n.look,X,{acc:X.acc||{}});if(X.hs==='lang'||X.hs==='bob')n.look.long=1}REG[id]={id,nm:n.nm,jobN:A.n||'',arch:n.arch,zone:zoneAt(n.x,n.z),trait:'nuchter',kind:'vast',look:n.look,n}}
  n.rid=id;return id}
/* =================== de band =================== */
const CAP=10;
const LV=[[-100,'Vijand','#ff3d52'],[-40,'Mag je niet','#ff9a3a'],[-10,'Onbekende','#8a8f98'],[10,'Bekende','#a9dcff'],[25,'Goede bekende','#7fd1c7'],[45,'Vriend','#3fe395'],[70,'Vertrouweling','#ffd35a']];
const lvI=v=>{let i=0;LV.forEach((l,j)=>{if(v>=l[0])i=j});return i};
const BD=()=>obj('stadBand',{});
const rec=(id,mk)=>{const b=BD();if(!b[id]&&mk)b[id]={v:0,d:dayN()};return b[id]||null};
const val=id=>{const r=id&&rec(id);return r?r.v:0};
function lvMsg(P,l1,up){const L=LV[l1];G.toast&&G.toast(P.nm+': '+L[1].toLowerCase(),up?'ok':'bad');if(up){G.snd&&G.snd.fx(l1>=5?'lvl':'ok')}
  const r=rec(P.id,1);if(up&&l1>=5&&!r.f5){r.f5=1;G.ev&&G.ev('vriend');if(P.kind==='res'&&P.gunst)G.msg&&G.msg('stad',P.nm+' is nu je vriend. Eén keer per dag kun je om een gunst vragen: '+GUNST[P.gunst][0].toLowerCase()+'.',{k:'app',a:'bekenden'},true)}
  if(up&&l1>=6&&!r.f6){r.f6=1;G.ev&&G.ev('vertrouw')}}
// t = iemand op straat of een id; o: soc = praatpunten (dagplafond), quiet = geen zwevende tekst
function band(t,d,o){o=o||{};const id=typeof t==='string'?t:idOf(t);if(!id||!REG[id])return 0;const P=REG[id],r=rec(id,1),day=dayN(),l0=lvI(r.v);
  if(d>0&&!o.raw){if(P.trait==='hartelijk')d*=1.3;else if(P.trait==='wantrouwig')d*=.7;d*=1+.2*(G.perk?G.perk('charme'):0);}
  if(d>0){
    if(o.soc){if(r.gd!==day){r.gd=day;r.g=0}d=Math.min(d,Math.max(0,CAP-(r.g||0)));r.g=(r.g||0)+d}}
  d=Math.round(d);r.v=clamp(r.v+d,-100,100);r.d=day;r.k=1;const l1=lvI(r.v);
  if(d&&typeof t==='object'&&!o.quiet)setTimeout(()=>G.fx2&&G.fx2.float((d>0?'+':'')+d+' band',t.x,t.z,d>0?'#7fd1c7':'#ff9a9a'),o.wait||650);
  if(l1!==l0)lvMsg(P,l1,l1>l0);
  if(d&&P.trait==='roddelaar'&&Math.abs(d)>=3&&typeof t==='object'&&G.rep)G.rep.add(t.x,t.z,d>0?1:-1);
  sv();return r.v}
// wie je dagen niet ziet, vergeet je een beetje (en wie boos is ook)
function decay(){const day=dayN(),b=BD();let ch=0;Object.keys(b).forEach(id=>{const r=b[id];if(!r||typeof r!=='object'){delete b[id];return}const from=Math.max((r.d||day)+2,r.u||0),n=Math.min(30,day-from);if(n<=0)return;r.u=day;const l0=lvI(r.v);
    for(let i=0;i<n;i++){if(r.v>=20)r.v-=2;else if(r.v<=-20)r.v+=2}ch=1;const P=REG[id];if(P&&l0>=5&&lvI(r.v)<5)G.msg&&G.msg('stad',P.nm+' hoort niets meer van je. Ga eens langs, anders ben je een vriend kwijt.',{k:'app',a:'bekenden'},true)});if(ch)sv()}
// acties van de speler → band
const DAAD={roof:-45,zakrol:-25,zakrol2:-15,scheld:-8,intim:-12,knok:-10,grapmis:-1,help:10,foto:4,geholpen:15};
const SOC={praat:2,compl:3,grap:3,fooi:3,deal:2,eet:1,trakteer:4};
function daad(n,k){const id=idOf(n);if(!id)return;const r=rec(id,1),day=dayN();if(k==='roof')r.rb=day;if(k==='zakrol'||k==='zakrol2'||k==='zakrolok')r.pk=day;if(k==='zakrolok'){sv();return}
  if(SOC[k]!=null)band(n,SOC[k],{soc:1});else if(DAAD[k]!=null)band(n,DAAD[k])}
// het gesprek begint: één keer per dag telt het praatje
function contact(n){const id=idOf(n);if(!id)return null;const r=rec(id,1),day=dayN();r.k=1;if(r.pd!==day){r.pd=day;if(r.v>-40)band(n,SOC.praat,{soc:1,wait:1200});if(lvI(r.v)>=3)G.ev&&G.ev('bekend')}else r.d=day;return REG[id]}
/* =================== bekendheid =================== */
let LBpos=0;
function loadPos(){try{fetch('/api/leaderboard').then(r=>r.json()).then(j=>{const L=j.players||[],i=L.findIndex(p=>p.name===window.__USER__);LBpos=i>=0?i+1:0;G.volk.pos=LBpos;G.onPos&&G.onPos(LBpos)}).catch(()=>{})}catch(e){}}
function faam(){try{const ri=typeof rankIdx==='function'?rankIdx(S.xp):0,nl=G.naam?G.naam.level():1,wn=G.wijk?G.wijk.n():0;
    let f=ri*2.8+(nl-1)*.6+wn*1.6+(LBpos===1?12:LBpos&&LBpos<=3?9:LBpos&&LBpos<=10?6:LBpos?3:0);if(G.nieuws&&G.nieuws.heet())f+=8;return clamp(Math.round(f),0,100)}catch(e){return 0}}
const FT=[[0,'Onbekend'],[12,'Bekend gezicht'],[30,'Bekende naam'],[50,'Berucht'],[70,'Legende']];
const faamT=f=>{let t=FT[0][1];FT.forEach(x=>{if(f>=x[0])t=x[1]});return t};
// hoe bang zijn ze hier voor je (0 … 1)
function angst(x,z){if(masked())return 0;const f=faam()/100,rp=G.rep?G.rep.at(x,z):0;return clamp(f*(rp<=-15?1:rp<0?.6:.35),0,1)}
/* =================== getuigen =================== */
// mensen uit de onderwereld (bendeleden, de heler, wijkbazen, de dobbelaar …) kijken niet op van een misdaad
const ONDER=['rivaal','heler','wijkbaas','dobbelaar','racer','dealer','vechter','zwerver'];
const onder=P=>!!P&&(P.job==='bende'||ONDER.includes(P.arch));
let LOOK=null;   // {zone, until}
const uitkijkOn=(x,z)=>!!(LOOK&&LOOK.until>Date.now()&&LOOK.zone===zoneAt(x,z));
function getuige(n,c){let mul=1,never=false;const rp=G.rep?G.rep.at(c.x,c.z):0;if(rp<0&&!masked())mul*=1-.35*faam()/100;if(uitkijkOn(c.x,c.z))mul*=.5;
  const id=idOf(n);if(id&&onder(REG[id])){if(Math.random()<.35)band(n,1,{soc:1,quiet:1});return {never:true,mul:0}}
  if(id&&!masked()){const P=REG[id],v=val(id);if(v>=45)never=true;else if(v>=10)mul*=.6;else if(v<=-40)mul*=1.7;if(P.trait==='wantrouwig')mul*=1.25;else if(P.trait==='stoer')mul*=.7;band(n,v>=45?-2:c.soft?-3:-6,{quiet:1})}
  return {never,mul}}
/* =================== korting en gunsten =================== */
function korting(n){const v=val(idOf(n));let k=v>=45?.2:v>=25?.15:v>=10?.1:0;try{if(!k&&faam()>=50&&G.rep.at(n.x,n.z)>=25)k=.1}catch(e){}return k}
const helerK=n=>{const v=val(idOf(n));return v>=45?.1:v>=25?.05:0};
const bon=()=>obj('stadBon',{});
function gunst(n,P,main){const r=rec(P.id,1),g=P.gunst,T=GUNST[g];if(!T||r.f===dayN())return;let txt=T[1],ok=true;const fl=(t,c)=>G.fx2&&G.fx2.float(t,G.P.x,G.P.z,c||'#7fd1c7');
  if(g==='eten'){const e0=S.energy;S.energy=Math.max(e0,Math.min(typeof EN_MAX!=='undefined'?EN_MAX:100,S.energy+6));S.hp=Math.min(100,(S.hp||100)+6);fl('+'+Math.round(S.energy-e0)+' energie');G.pose='eet';setTimeout(()=>{if(G.pose==='eet')G.pose=null},2400)}
  else if(g==='zorg'){if((S.hp||100)>=100){txt='Jij mankeert niks. Kom terug als je iets hebt.';ok=false}else{const h0=S.hp;S.hp=Math.min(100,S.hp+30);fl('+'+Math.round(S.hp-h0)+' gezondheid','#ff9ac2')}}
  else if(g==='rit'){bon().taxi=1;fl('Volgende taxi gratis','#f2c230')}
  else if(g==='monteur'){const L=(G.vehicles||[]).filter(v=>v.own&&((v.dmg||0)>0||v.flat));if(!L.length){txt='Je wagen is in orde. Kom terug als er iets aan mankeert.';ok=false}else{L.forEach(v=>{v.dmg=0;v.flat=0});G.carHud&&G.carHud();fl('Auto gemaakt','#f0b23a')}}
  else if(g==='tip'){const p=G.pakketTip&&G.pakketTip();if(!p){const c=zS(.3);S.cash+=c;if(typeof addZwart==='function')addZwart(c);fl('+'+fmt(c),'#3fe395');txt='Er lag nog wat. Hier, jouw deel.'}}
  else if(g==='alibi'){if((S.heat||0)<=0){txt='Niemand let op je. Bewaar het voor als het nodig is.';ok=false}else{const h0=S.heat;S.heat=Math.max(0,S.heat-8);fl('Hitte −'+Math.round(h0-S.heat)+'%','#a9c8ff')}}
  else if(g==='beurs'){const c=Math.max(10,Math.round(wS(4)/5)*5);S.cash+=c;fl('+'+fmt(c),'#3fe395')}
  else if(g==='pers'){G.rep&&G.rep.add(n.x,n.z,5);G.nieuws&&G.nieuws.add('pers',{w:M.districtAt(n.x,n.z)})}
  else if(g==='uitkijk'){LOOK={zone:P.zone,until:Date.now()+15*60000};fl('Uitkijk in '+ZN[P.zone]+' · 15 min')}
  else if(g==='roddel'){const t=G.smeer&&G.smeer.roddel&&G.smeer.roddel();if(t)txt=t;else{G.rep&&G.rep.add(n.x,n.z,2);txt='Ze praten goed over je hier. Dat is ook wat waard.'}}
  else if(g==='deel'){const c=zS(.4);S.cash+=c;if(typeof addZwart==='function')addZwart(c);fl('+'+fmt(c),'#3fe395')}
  if(ok){r.f=dayN();G.ev&&G.ev('gunst');G.snd&&G.snd.fx('ok');sv()}K.say(txt,ok?'blij':null,main())}
const trakP=()=>Math.max(5,Math.round(zK(.04)/5)*5),cadP=()=>Math.max(15,Math.round(zK(.15)/5)*5),goedP=v=>Math.max(10,Math.round(zK(v<=-40?.6:.25)/5)*5);
function geef(n,P,main){const r=rec(P.id,1),day=dayN(),a=trakP(),b=cadP(),pay=c=>{if(S.cash<c){G.toast('Niet genoeg contant geld','bad');return false}S.cash-=c;G.fx2&&G.fx2.float('−'+fmt(c),G.P.x,G.P.z,'#ffd35a');G.snd&&G.snd.fx('coin');return true};
  K.say(pick(['Voor mij?','Nou, dat hoeft toch niet.','Wat heb je bij je?']),null,[
   {t:'Trakteren · '+fmt(a),sub:r.td===day?'':'Koffie of een broodje',ic:K.ic.kop,dis:r.td===day,why:'Vandaag al gedaan',f:()=>{if(!pay(a))return;r.td=day;band(n,SOC.trakteer,{soc:1});K.say(pick(['Lekker. Dank je!','Daar was ik aan toe.','Jij bent een goeie.']),'blij',main())}},
   {t:'Cadeau geven · '+fmt(b),sub:r.c===day?'':'Blijft lang hangen',ic:K.ic.cadeau,dis:r.c===day,why:'Vandaag al gedaan',f:()=>{if(!pay(b))return;r.c=day;band(n,7);G.ev&&G.ev('cadeau');K.say(pick(['Voor mij? Dat is echt lief.','Dit vergeet ik niet.','Wauw. Dank je wel!']),'blij',main())}},
   {t:'Terug',ic:K.ic.no,f:()=>K.say(pick(['Goed.','Zeg het maar.']),null,main())}])}
function goed(n,P,main){const r=rec(P.id,1),c=goedP(r.v);if(S.cash<c){G.toast('Niet genoeg contant geld','bad');return}S.cash-=c;const d=-8-r.v;r.rb=0;band(n,d>0?d:0,{raw:1});G.snd&&G.snd.fx('coin');G.fx2&&G.fx2.float('−'+fmt(c),G.P.x,G.P.z,'#ffd35a');
  K.say(pick(['Goed. Zand erover. Maar ik hou je in de gaten.','Oké. Iedereen verdient een tweede kans.','Vooruit dan. Doe het niet weer.']),null,main())}
/* =================== verzoeken: bekenden vragen je iets =================== */
// Af en toe (hooguit drie keer per dag) stuurt iemand die je kent een bericht: kom even langs, leen me wat, of jaag iemand weg.
// Doen = een betere band (en soms iets terug). Laten liggen = de band zakt een beetje. Geleend geld komt na twee dagen terug.
const VQ=()=>obj('stadVraag',{});
const VTXT={langs:['Kom je even langs? Ik heb iets voor je.','Lang niet gezien. Loop even binnen als je in de buurt bent.','Heb je even? Ik wil je iets geven.'],
  leen:['Ik zit krap deze week. Kun je me {x} lenen? Je krijgt het terug.','Vervelend om te vragen… kun je {x} missen tot overmorgen?','Mijn huur moet betaald. Kun je me {x} voorschieten?'],
  hulp:['Er hangt een vervelende gast voor mijn deur. Kun jij hem wegjagen?','Iemand valt me lastig in de straat. Jij weet daar wel raad mee, toch?','Er staat hier een vent die geld van me wil. Help je me?']};
const vraagOn=()=>{const q=VQ();return q.id&&REG[q.id]&&q.t>Date.now()?q:null};
function plaats(id){const P=REG[id];if(!P)return null;let n=G.NPC.find(m=>m.rid===id);
  if(!n&&P.kind==='res'){const h=homeOf(P),free=G.NPC.filter(m=>!m.fixed&&!m.rid&&!m._af&&!m.evt&&!m.klant&&(m.st||'walk')==='walk'&&!(G.npcA[m.arch]||{}).cop&&dist(m,G.P)>45);
    if(free.length){n=free[Math.floor(Math.random()*free.length)];n.x=h.x;n.z=h.z;n.spoke=n.compl=n.grap=n.scold=n.photo=0}else if(G.NPC.length<82)n=G.npcMake(P.arch,h.x,h.z);if(n)become(n,P)}
  if(n&&!n.fixed&&n.st!=='talk'){n.st='wacht';n.t=0;n.dur=1500;n.wv=0}return n}
let pest=null;
function pestWeg(){if(pest){const n=pest;pest=null;n.fixed=0;setTimeout(()=>{try{G.npcRemove(n)}catch(e){}},9000)}}
function vraagNieuw(force){const q=VQ(),day=dayN(),now=Date.now();if(q.d!==day){q.d=day;q.n=0}if(vraagOn())return false;
  if(!force&&(now<(q.nx||0)||q.n>=3||G.driving||G.talking||(G.police&&G.police.active())||(G.mission&&G.mission())||(G.race&&G.race.active&&G.race.active())))return false;
  const b=BD(),L=ROS.filter(p=>b[p.id]&&b[p.id].v>=10&&b[p.id].rb!==day&&!onder(p));if(!L.length){q.nx=now+5*60000;return false}
  const P=pick(L),r=rec(P.id,1);let k=pick(['langs','langs','leen','hulp']);if(k==='leen'&&(r.ln||r.v<25))k='langs';if(force&&VTXT[force])k=force;
  const a=k==='leen'?Math.max(20,Math.round(zK(.3)/10)*10):0;Object.assign(q,{id:P.id,k,t:now+25*60000,a,n:(q.n||0)+1,nx:now+rr(9,15)*60000});
  const n=plaats(P.id);if(k==='hulp'&&n){const pp=M.nearestWalk(n.x+rr(-3,3),n.z+rr(2.5,4),5)||{x:n.x+2.5,z:n.z+2.5},m=G.npcMake('rivaal',pp.x,pp.z);m.evt='lastig';m.fixed=1;m.st='stand';m.fixSt='stand';m.home={x:m.x,z:m.z,ry:Math.atan2(n.x-m.x,n.z-m.z)};m.ry=m.home.ry;m.nm=pick(['Een lastpak','Schreeuwer','Geldwolf']);pest=m}
  con(P);G.msg&&G.msg(P.id,pick(VTXT[k]).replace('{x}',fmt(a)),{k:'pers',id:P.id});sv();return true}
function vraagKlaar(n,ok){const q=VQ(),P=REG[q.id];if(!P)return;const k=q.k;q.id=null;q.t=0;pestWeg();
  if(ok){band(n||P.id,k==='hulp'?12:k==='leen'?10:5);G.ev&&G.ev('verzoek');G.snd&&G.snd.fx('ok')}else band(n||P.id,-3,{quiet:!n});
  if(n&&n.st==='wacht'){n.st='walk';n.t=0}sv()}
function vraagTick(){try{const q=VQ(),now=Date.now(),day=dayN(),b=BD();
    if(q.id&&REG[q.id]&&q.t<=now){const P=REG[q.id];q.id=null;pestWeg();band(P.id,-2,{quiet:1});con(P);G.msg&&G.msg(P.id,pick(['Laat maar. Het hoeft niet meer.','Ik heb het zelf al opgelost.']),null,true);const n=G.NPC.find(m=>m.rid===P.id);if(n&&n.st==='wacht'){n.st='walk';n.t=0}sv()}
    // geleend geld komt terug
    Object.keys(b).forEach(id=>{const r=b[id],P=REG[id];if(!r||!r.ln||!P||day<r.ln.d)return;const a=r.ln.a;delete r.ln;con(P);
      if(Math.random()<(P.trait==='roddelaar'?.85:.95)){const back=Math.round(a*1.1);S.cash+=back;G.msg&&G.msg(id,'Hier is je geld terug: '+fmt(back)+'. Met een beetje extra. Bedankt dat je me hielp.',null)}
      else{band(id,-4,{quiet:1});G.msg&&G.msg(id,'Het lukt me niet om je terug te betalen. Sorry. Je houdt het van me tegoed.',null)}sv()});
    if(G.ready&&!q.nx){q.nx=now+rr(4,7)*60000;sv()}vraagNieuw()}catch(e){console.error(e)}}
// de lastpak is weggejaagd of verslagen
function pestTick(){try{if(!pest)return;const q=vraagOn();if(!q||q.k!=='hulp'){pestWeg();return}if(!(pest.beaten||pest.st==='flee'))return;
    const P=REG[q.id],n=G.NPC.find(m=>m.rid===P.id);vraagKlaar(n,true);G.toast&&G.toast(P.nm+' is je dankbaar','ok');if(n&&dist(n,G.P)<30)G.bubble&&G.bubble(n,pick(['Dank je! Hij is weg.','Je bent een held.','Dat vergeet ik niet.']),{col:'#c8ffd8'});else G.msg&&G.msg(P.id,'Hij is weg. Dank je, dat vergeet ik niet.',null)}catch(e){}}
function con(P){try{if(G.contacts&&!G.contacts[P.id])G.contacts[P.id]={n:P.nm,look:Object.assign({},P.look,{bg:'#16232a'}),col:'#7fd1c7'}}catch(e){}}
function vraagKeuze(n,P,ch,main){const q=vraagOn();if(!q||q.id!==P.id)return;
  if(q.k==='langs')ch.splice(0,0,{t:'Je wilde me spreken?',sub:'Je kreeg een bericht',ic:K.ic.hart,f:()=>{const e0=S.energy;S.energy=Math.max(e0,Math.min(typeof EN_MAX!=='undefined'?EN_MAX:100,S.energy+3));vraagKlaar(n,true);const de=Math.round(S.energy-e0);if(de>0)G.fx2&&G.fx2.float('+'+de+' energie',G.P.x,G.P.z,'#7fd1c7');else{const c=Math.max(5,Math.round(wS(.5)/5)*5);S.cash+=c;G.fx2&&G.fx2.float('+'+fmt(c),G.P.x,G.P.z,'#3fe395')}sv();K.say(pick(['Fijn dat je er bent. Hier, dit is voor jou.','Ik dacht aan je. Neem dit mee.','Zomaar. Omdat je altijd langskomt.']),'blij',main())}});
  else if(q.k==='leen'){ch.splice(0,0,{t:'Lenen · '+fmt(q.a),sub:'Komt over twee dagen terug',ic:K.ic.euro,dis:S.cash<q.a,why:'Te weinig contant',f:()=>{S.cash-=q.a;rec(P.id,1).ln={d:dayN()+2,a:q.a};G.fx2&&G.fx2.float('−'+fmt(q.a),G.P.x,G.P.z,'#ffd35a');G.snd&&G.snd.fx('coin');vraagKlaar(n,true);K.say(pick(['Je redt me. Overmorgen heb je het terug.','Dank je. Dit vergeet ik niet.']),'blij',main())}},
    {t:'Nee, sorry',ic:K.ic.no,f:()=>{vraagKlaar(n,false);K.say(pick(['Oké. Ik vraag het wel aan iemand anders.','Jammer. Maar ik snap het.']),null,main())}})}
  else if(q.k==='hulp')ch.splice(0,0,{t:'Waar is hij?',sub:'Jaag hem weg: intimideren of uitdagen',ic:K.ic.scare,f:()=>{if(pest)G.setWaypoint&&G.setWaypoint(pest.x,pest.z,'Lastpak');const had=!!pest;if(!had)vraagKlaar(n,true);K.say(had?'Daar. Die met dat rode jack. Wees voorzichtig.':'Hij is net weggelopen. Toch bedankt dat je kwam.',had?'bang':'blij',main())}})}
/* =================== gesprek: openingszin, rol en keuzes =================== */
function fameOpen(n){const f=faam();if(f<30||masked()||Math.random()>.6)return '';const a=G.npcA[n.arch]||{};if(a.cop||n.fixed)return '';const rp=G.rep?G.rep.at(n.x,n.z):0;
  if(rp<=-15)return pick(['Jij bent… laat maar. Ik wil geen problemen.','Ik heb niks gezien en niks gehoord. Echt niet.','Alsjeblieft. Ik heb een gezin.']);
  if(rp>=15)return pick(['Jij bent toch '+me()+'? Iedereen heeft het over jou.','Meneer '+me()+'. Wat een eer.','Ze zeggen dat jij hier de zaken regelt. Respect.']);
  return pick(['Wacht… jouw gezicht ken ik. Uit de krant?','Ben jij niet die '+(typeof RANKS!=='undefined'?RANKS[rankIdx(S.xp)][0].toLowerCase():'gast')+' waar ze over praten?'])}
const o0=G.npcOpen;G.npcOpen=function(n){const t=o0?o0(n):'';if(t)return t;const id=idOf(n);if(!id)return fameOpen(n);const P=REG[id],v=val(id);if(P.kind==='agent'||n.robbed)return '';
  const q=vraagOn();if(q&&q.id===id&&v>-40)return q.k==='hulp'?pick(['Gelukkig, daar ben je. Hij staat er nog.','Je bent er. Kijk, daar staat hij.']):q.k==='leen'?pick(['Fijn dat je er bent. Het gaat om '+fmt(q.a)+'.','Dank dat je komt. Ik durfde het bijna niet te vragen.']):pick(['Daar ben je! Ik heb iets voor je.','Goed dat je even langskomt.']);
  if(v<=-40)return pick(['Jij. Ik heb jou niks te zeggen.','Ga weg. Ik weet wat je gedaan hebt.','Blijf bij me uit de buurt.']);
  if(v>=70)return pick(['Hé '+me()+'! Voor jou heb ik altijd tijd.','Daar is mijn maat. Wat kan ik voor je doen?']);
  if(v>=45)return pick(['Hé '+me()+', goed je te zien!','Ha, daar ben je. Alles goed?']);
  if(v>=10)return pick(['O, hallo. Jij weer.','Hé, ik ken jou. Hoe is het?']);return fameOpen(n)};
const x0=G.npcExtra;G.npcExtra=function(n,ch,main){if(x0)x0(n,ch,main);const id=idOf(n);if(!id)return;const P=REG[id];if(P.kind==='agent')return;const r=rec(id,1),v=r.v,day=dayN(),at=Math.min(1,ch.length);
  try{if(v>-40)vraagKeuze(n,P,ch,main)}catch(e){}
  if(v<-10){const c=goedP(v);ch.splice(at,0,{t:'Goedmaken · '+fmt(c),sub:'Zand erover',ic:K.ic.hand,dis:S.cash<c,why:'Te weinig contant',f:()=>goed(n,P,main)});return}
  ch.splice(at,0,{t:'Iets geven',sub:'Trakteren of een cadeau',ic:K.ic.cadeau,f:()=>geef(n,P,main)});
  if(P.gunst&&v>=45){const used=r.f===day;ch.splice(at,0,{t:'Gunst: '+GUNST[P.gunst][0].toLowerCase(),sub:used?'':'Eén keer per dag',ic:K.ic.hart,dis:used,why:'Morgen weer',f:()=>gunst(n,P,main)})}};
// regel onder de naam in het gesprek, en de stemming van het portret
function rol(n){const id=idOf(n);if(!id)return '';const P=REG[id],r=rec(id);return (P.jobN||'')+(r&&r.k?' · '+LV[lvI(r.v)][1]:'')}
function stem(n){const v=val(idOf(n));return v<=-40?'boos':v>=45?'blij':null}
/* =================== op straat: wie loopt er =================== */
const present=id=>G.NPC.some(m=>m.rid===id);
function become(n,p){n.rid=p.id;n.arch=p.arch;n.look=Object.assign({},p.look);n.nm=p.nm;n.robbed=n.picked=0;const a=G.npcA[p.arch]||{};n.v=a.v?rr(a.v[0],a.v[1]):1.3;if(p.age===2)n.v=Math.min(n.v,.85);n.run=0;
  if(n.klant&&!['student','zakenman','burger','rivaal'].includes(p.arch))n.klant=null;const r=rec(p.id),day=dayN();if(r){if(r.rb===day)n.robbed=1;if(r.pk===day)n.picked=1}}
function assign(n){if(n.arch==='agent'){G.smeer&&G.smeer.patrol&&G.smeer.patrol(n);return}if(n.arch==='toerist'||n.arch==='jogger'||Math.random()>.62)return;
  const z=zoneAt(n.x,n.z),night=G.night>.55,L=ROS.filter(p=>p.zone===z&&!(night&&p.age===2)&&!present(p.id));if(!L.length)return;
  let tot=0;const W=L.map(p=>{const w=val(p.id)>=10?2.5:1;tot+=w;return w});let q=Math.random()*tot,p=L[0];for(let i=0;i<L.length;i++){q-=W[i];if(q<=0){p=L[i];break}}become(n,p)}
const i0=G.npcInit;G.npcInit=function(n){const had=!!n.arch;i0&&i0(n);if(had||n.fixed)return;try{assign(n)}catch(e){}};
// een vaste plek per bewoner (voor 'Route' in de telefoon)
function homeOf(p){if(p.home)return p.home;const r=rng(p.seed^0x9e37),bb=zoneBox(p.zone);for(let i=0;i<400;i++){const x=bb.x0+r()*(bb.x1-bb.x0),z=bb.z0+r()*(bb.z1-bb.z0);if(zoneAt(x,z)!==p.zone)continue;const t=M.ground[(z|0)*M.W+(x|0)];if(t!==M.T.WALK&&t!==M.T.PLAZA)continue;if(!M.canStand(x,z,.4))continue;const xi=x|0,zi=z|0,rd=(a,b)=>{const t=M.ground[(zi+b)*M.W+xi+a];return t===M.T.ROAD};if(i<320&&!(rd(2,0)||rd(-2,0)||rd(0,2)||rd(0,-2)||rd(3,0)||rd(-3,0)||rd(0,3)||rd(0,-3)))continue;return p.home={x,z}}
  return p.home={x:M.spawn.x,z:M.spawn.z}}
function zoek(id){const P=REG[id];if(!P)return;const n=plaats(id);if(!n)return;if(!n.fixed&&n.dur>300&&!(vraagOn()&&VQ().id===id))n.dur=300;G.setWaypoint&&G.setWaypoint(n.x,n.z,P.nm)}
/* =================== herkennen, groeten, bang zijn =================== */
const BANG=['Niet kijken…','Dat is \'m.','Goedemiddag…','Ik zag niks.','Loop door, loop door.'],RESP=['Dag baas.','Respect.','Goeiedag, '+'baas.','Alles goed, baas?','Meneer.'],WIE=['Is dat niet…?','Die ken ik ergens van.','Dat is toch die van de krant?'];
let recCool=0;
function recog(n){const P=G.P,d=dist(n,P);if(d>5.2||G.driving||G.talking||G.hidden){if(d>9)n._rc=0;return}if(n._rc)return;const t=performance.now();if(t<recCool||(G.police&&G.police.active()))return;n._rc=1;
  const mk=masked(),id=n.rid&&REG[n.rid]?n.rid:null,v=id?val(id):0,a=G.npcA[n.arch]||{};
  if(id&&!mk&&v>=10){n.back='walk';n.st='wave';n.t=0;n.dur=1.4;G.bubble(n,pick(v>=45?['Hé '+me()+'!','Daar is \'ie!','Alles goed, maat?']:['Hoi!','Dag '+me()+'.','Hé, hallo.']),{col:'#c8ffd8'});recCool=t+2400;return}
  if(id&&!mk&&v<=-40){n.st='shy';n.t=0;n.dur=1.6;G.bubble(n,pick(['Jij…','Blijf uit mijn buurt.','Dief.']),{col:'#ff9a9a'});recCool=t+2400;return}
  const f=faam();if(mk||f<12||a.cop||Math.random()>Math.min(.95,.25+f/100*.9))return;const rp=G.rep?G.rep.at(n.x,n.z):0,wanted=typeof S!=='undefined'&&S.wanted;
  if(rp<=-15||(wanted&&f>=30)){if(n.arch==='oma'){if(Math.random()<.5)G.bubble(n,pick(['Foei.','Schaam je.','Tuig.']))}else if(a.fight&&f<50){n.lookT=2}else{n.st='shy';n.t=0;n.dur=rr(1.2,1.9);if(Math.random()<.55)G.bubble(n,pick(BANG),{col:'#ffd9d9'})}}
  else if(rp>=15||(G.wijkOwn&&G.wijkOwn(n.x,n.z))){n.st='nod';n.t=0;n.dur=1.5;if(Math.random()<.65)G.bubble(n,pick(RESP),{col:'#ffe9a8'})}
  else{n.lookT=2.6;if(f>=40&&(n.arch==='student'||n.arch==='toerist')&&Math.random()<.3){n.st='photo';n.t=0;n.dur=2.6;n.shot=0;n.ry=Math.atan2(P.x-n.x,P.z-n.z);G.bubble(n,pick(['Mag ik een foto?','Selfie!','Jij bent beroemd!']))}else if(Math.random()<.4)G.bubble(n,pick(WIE))}
  recCool=t+1500}
const b0=G.npcBrain;
G.npcBrain=function(n,dt){const st=n.st;
  if(st==='shy'||st==='nod'||st==='wacht'){n.t=(n.t||0)+dt;n.arm=n.armL=n.armR=undefined;n.armRz=n.armLz=0;n.hop=0;n.legL=n.legR=undefined;n.y=0;n.blink=0;const P=G.P,d=dist(n,P);
    if(st==='shy'){// met een boog om je heen, hoofd omlaag
      let dx=n.x-P.x,dz=n.z-P.z;const l=Math.hypot(dx,dz)||1;dx/=l;dz/=l;const sp=2.6,nx=n.x+dx*sp*dt,nz=n.z+dz*sp*dt;if(M.canStand(nx,n.z,.3))n.x=nx;if(M.canStand(n.x,nz,.3))n.z=nz;n.ry=Math.atan2(dx,dz);n.ph+=dt*sp*1.6;n.sp=.8;n.hx=.4;n.hy=0;n.lean=.12;if(n.t>(n.dur||1.5)){n.st='walk';n.t=0;n.hx=0;n.lean=0}return true}
    if(st==='nod'){n.sp=0;n.ry=Math.atan2(P.x-n.x,P.z-n.z);const k=Math.sin(Math.min(1,n.t/.9)*Math.PI);n.lean=.3*k;n.hx=.35*k;n.hy=0;if(n.t>(n.dur||1.5)){n.st='walk';n.t=0;n.hx=0;n.lean=0}return true}
    n.sp=0;n.lean=0;n.hx=0;if(d<7){n.ry=Math.atan2(P.x-n.x,P.z-n.z);if(!n.wv){n.wv=1;n.t0=n.t}if(n.t-n.t0<1.6){n.armR=0;n.armRz=2.85+Math.sin(n.t*11)*.32}}else{n.hy=Math.sin(n.t*.7)*.6;n.wv=0}
    if(n.t>(n.dur||300)||d>140){n.st='walk';n.t=0}return true}
  const r=b0(n,dt);if((n.st||'walk')==='walk'&&!n.fixed&&!r)try{recog(n)}catch(e){}return r};
// vrienden en vijanden op de minikaart
const d0=G.npcDots;G.npcDots=()=>{const out=d0?d0():[];try{G.NPC.forEach(n=>{if(!n.rid||n.fixed)return;if(n.st==='wacht'){out.push({x:n.x,z:n.z,c:'#ffffff'});return}if(dist(n,G.P)>70)return;const v=val(n.rid);if(v>=25)out.push({x:n.x,z:n.z,c:'#3fe395'});else if(v<=-40)out.push({x:n.x,z:n.z,c:'#ff9a3a'})})}catch(e){}return out};
/* =================== telefoon: Bekenden =================== */
let tab='mensen';
function faamCard(){const f=faam(),P=G.P,rp=G.rep?G.rep.at(P.x,P.z):0,w=M.districtAt(P.x,P.z);
  const how=masked()?'Met je bivakmuts op herkent niemand je.':f<12?'Op straat kent nog niemand je.':rp<=-15?'In '+w+' zijn ze bang voor je. Ze bellen minder snel.':rp>=15?'In '+w+' heb je respect. Mensen groeten je.':'In '+w+' kennen ze je gezicht.';
  return `<div class="sd-bk-f"><div><small>Bekendheid</small><b>${E(faamT(f))}</b></div><i class="sd-p2-pb"><i style="width:${f}%"></i></i><p>${E(how)}${LBpos?' Plek '+LBpos+' op de ranglijst.':''}</p></div>`}
function list(){const b=BD(),L=Object.keys(b).filter(id=>REG[id]&&REG[id].kind!=='agent'&&b[id]&&(b[id].k||b[id].v)).sort((x,y)=>b[y].v-b[x].v),day=dayN();
  return L.length?L.map(id=>{const P=REG[id],r=b[id],l=LV[lvI(r.v)],vq=vraagOn(),ask=vq&&vq.id===id,fav=!ask&&P.gunst&&r.v>=45&&r.f!==day,gone=day-(r.d||day);
    return `<button class="sd-p2-row sd-bk-r" data-pers="${id}"><canvas data-fc="${id}" width="24" height="24"></canvas><span><b>${E(P.nm)}</b><small>${E(P.jobN)} · ${E(ZN[P.zone]||'')}${gone>=3&&r.v>=20?' · '+gone+' dagen niet gezien':''}</small><i class="sd-p2-pb" style="--k:${l[2]}"><i style="width:${(r.v+100)/2}%"></i></i></span><em style="color:${l[2]}">${ask?'<u class="q">Vraagt iets</u>':fav?'<u>Gunst</u>':''}${E(l[1])}</em></button>`}).join(''):'<p class="sd-p2-none">Je kent nog niemand. Praat met mensen op straat: vaste bewoners onthouden je.</p>'}
function detail(id){const P=REG[id],r=rec(id,1),li=lvI(r.v),l=LV[li],nx=LV[li+1],day=dayN(),gone=day-(r.d||day);
  return `<div class="sd-bk-d"><canvas id="sdBkFace" width="48" height="48"></canvas><div><b>${E(P.nm)}</b><small>${E(P.jobN)} · ${E(ZN[P.zone]||'')}</small><em style="color:${l[2]}">${E(l[1])}</em></div></div>
   <div class="sd-p2-list"><div class="sd-p2-dag"><b>Band ${r.v}</b><i class="sd-p2-pb"><i style="width:${(r.v+100)/2}%;background:${l[2]}"></i></i><span>${nx?'Nog '+(nx[0]-r.v)+' tot '+nx[1].toLowerCase():'Hoger kan niet'} · ${gone<=0?'vandaag gesproken':gone===1?'gisteren gesproken':gone+' dagen niet gezien'}</span></div>
   ${(()=>{const q=vraagOn();if(!q||q.id!==id)return '';const m=Math.max(1,Math.ceil((q.t-Date.now())/60000));return `<div class="sd-p2-ach ok sd-bk-q"><i>${K.ic.talk}</i><span><b>${q.k==='leen'?'Wil '+fmt(q.a)+' lenen':q.k==='hulp'?'Wordt lastiggevallen':'Wil je spreken'}</b><small>Nog ${m} min · ga erheen via Route</small></span></div>`})()}
   ${r.ln?`<div class="sd-p2-ach"><i>${K.ic.euro}</i><span><b>Lening: ${fmt(r.ln.a)}</b><small>${r.ln.d-day<=0?'Komt vandaag terug':r.ln.d-day===1?'Komt morgen terug':'Komt over '+(r.ln.d-day)+' dagen terug'}</small></span></div>`:''}
   ${li>=3&&P.trait?`<div class="sd-p2-ach ok"><i>${K.ic.mensen}</i><span><b>Karakter</b><small>${E(AARD[P.trait]||'')}</small></span></div>`:''}
   ${P.gunst?`<div class="sd-p2-ach${r.v>=45?' ok':''}"><i>${K.ic.hart}</i><span><b>Gunst: ${E(GUNST[P.gunst][0].toLowerCase())}</b><small>${r.v>=45?(r.f===day?'Vandaag al gevraagd':'Staat voor je klaar'):'Vanaf vriend, één keer per dag'}</small></span></div>`:''}
   ${r.v>=10?`<div class="sd-p2-ach ok"><i>${K.ic.euro}</i><span><b>${P.kind==='vast'?'Vaste klant':'Getuige'}</b><small>${P.kind==='vast'?(korting({rid:id})*100|0)+'% korting':r.v>=45?'Belt nooit de politie over jou':'Belt minder snel de politie'}</small></span></div>`:''}
   <button class="sd-p2-row" data-zoek="${id}"><i class="sd-p2-ri">${K.ic.route}</i><span><b>Route</b><small>${P.kind==='vast'?'Staat op een vaste plek':'Wacht op je in '+E(ZN[P.zone]||'de wijk')}</small></span></button>
   <p class="sd-p2-note">Praatjes tellen tot ${CAP} punten per dag. Zie je iemand drie dagen niet, dan zakt de band.</p></div>`}
function render(scr,head,sub){if(sub&&REG[sub]){scr.innerHTML=head('Bekenden',REG[sub].kind==='vast'?'Vaste figuur':'Bewoner van '+(ZN[REG[sub].zone]||'de stad'))+detail(sub);const c=scr.querySelector('#sdBkFace');if(c)K.face(Object.assign({},REG[sub].look,{bg:'#1d2230'}),stem({rid:sub})||null,c);return}
  const ag=G.smeer&&G.smeer.html;scr.innerHTML=head('Bekenden','Je band met de mensen in de stad')+faamCard()+(ag?`<div class="sd-seg sd-bk-t"><button data-bt="mensen" class="${tab==='mensen'?'on':''}">Mensen</button><button data-bt="politie" class="${tab==='politie'?'on':''}">Politie</button></div>`:'')
   +`<div class="sd-p2-list">${tab==='politie'&&ag?G.smeer.html():list()}</div>`;
  scr.querySelectorAll('[data-fc]').forEach(c=>{const P=REG[c.dataset.fc];if(P)K.portrait(P.look,null,c)})}
function click(t,close,go){let b;if((b=t.closest('[data-bt]'))){tab=b.dataset.bt;return true}if((b=t.closest('[data-zoek]'))){close();zoek(b.dataset.zoek);return true}
  if((b=t.closest('[data-pers]'))){go('bekenden',b.dataset.pers);return true}if(tab==='politie'&&G.smeer&&G.smeer.click&&G.smeer.click(t,close,go))return true;return false}
G.volk={ROS,REG,LV,lvI,val,rec,band,daad,contact,getuige,korting,helerK,faam,faamT,angst,rol,stem,idOf,zoneAt,ZN,zoek,become,present,bon,uitkijkOn,reg:P=>{REG[P.id]=P},pos:0,vraag:{on:vraagOn,nieuw:vraagNieuw,tick:vraagTick,pest:()=>pest},
  vrienden:()=>{const b=BD();return Object.keys(b).filter(id=>REG[id]&&b[id].v>=45).length},_t:{decay,recog,homeOf,gunst,FIXL}};
G.faam=faam;G.korting=korting;
const wait=setInterval(()=>{if(!G.ready||!G.phone)return;clearInterval(wait);try{decay();loadPos()}catch(e){}setTimeout(()=>{try{G.NPC.forEach(n=>{if(n._af)idOf(n)})}catch(e){}},2500);setInterval(()=>{try{decay()}catch(e){}},600000);setInterval(()=>{try{const P=G.P,f=masked()?0:faam()/100,rp=G.rep?G.rep.at(P.x,P.z):0;G.ruim=f<.12?0:f*(rp<=-15?1.5:rp>=15||(G.wijkOwn&&G.wijkOwn(P.x,P.z))?.9:.5)}catch(e){}},1500);setInterval(loadPos,300000);
  G.phone.add&&G.phone.add({k:'bekenden',n:'Bekenden',ic:K.ic.mensen,c:'#7fd1c7',render,click,badge:()=>{const b=BD(),day=dayN();return Object.keys(b).filter(id=>REG[id]&&REG[id].gunst&&b[id].v>=45&&b[id].f!==day).length+(vraagOn()?1:0)}});
  try{const b=BD();Object.keys(b).forEach(id=>{if(REG[id])con(REG[id])});const q=vraagOn();if(q)setTimeout(()=>{try{plaats(q.id)}catch(e){}},3000)}catch(e){}setInterval(vraagTick,20000);setInterval(pestTick,600);
  // eerste keer: kort bericht
  try{if(!localStorage.getItem('stad_nieuw4')){localStorage.setItem('stad_nieuw4','1');G.msg&&G.msg('stad','Nieuw: de stad onthoudt je. Vaste bewoners hebben een naam en een band met jou. Vrienden helpen je, vijanden bellen de politie. Kijk bij Bekenden.',{k:'app',a:'bekenden'},true)}}catch(e){}},300);
})();
