// Klus-spellen, deel 2: zeven spelsoorten die passen bij wat je in de klus echt doet. Bouwt op crimegames.js (CG_TYPES,
// CG_VIEW, CG_INFO, cgSolve en het model van een gemiddelde speler) en wordt daarna geladen.
//  call    Bellen/appen: een echt gesprek in beeld (telefoon of chat). De ander vraagt iets, jij kiest wat je terugzegt.
//  peek    Meekijken: kijk mee hoe iemand een code intoetst en toets hem daarna zelf in.
//  wire    Alarm: lees welke draad eruit moet, volg de kleur en knip.
//  sort    Keuren: goed of weg (valse briefjes keuren, lading uitzoeken).
//  lookout Uitkijken: het werk gaat vanzelf; tik op de plek waar iemand opduikt.
//  follow  Volgen: onthoud welke container van jou is en volg hem terwijl ze schuiven.
//  check   Nakijken: vergelijk twee papieren en tik het vakje dat niet klopt.
// Kalibratie zoals bij de andere spellen: de kans per poging p komt uit cgSolve(doel, k, m); de ruimte per poging
// (antwoordtijd, reactietijd, schuifsnelheid) wordt daaruit teruggerekend met een gemiddelde speler (mu, s per soort).
//  - keuzespellen: tijd = mu + s·Φ⁻¹(p/(1−e)), e = kans op een fout antwoord (lager naarmate je professioneler bent)
//  - uitkijken: reactietijd = 0,80 + 0,17·Φ⁻¹(p) s (zien waar het is + tikken)
//  - volgen: per schuif houdt een speler hem bij met kans Φ((D − 0,30)/0,09), D = duur van één schuif; kwijt = gokken.

// ---------- gegevens per thema ----------
// gesprekken: [wat de ander zegt, goed antwoord, [twee slechte antwoorden]]. Geen echte belscripts: het gaat om toon en
// geloofwaardigheid (rustig, vriendelijk, consequent) tegenover opdringerig, raar of tegenstrijdig.
const CG_CALL={
 bank:{mode:'call',who:'Mevr. De Vries',av:'DV',ok:['Ze gelooft je','Ze ontspant','Goed zo'],no:['Ze twijfelt','Ze wordt argwanend'],turns:[
  ['Met De Vries?','Goedemiddag mevrouw, u spreekt met Mark van de bank.',['Ja hallo, met wie spreek ik eigenlijk?','Mevrouw, snel, het is heel erg!']],
  ['Van de bank? Is er iets?','We zien een betaling die u volgens mij niet zelf deed.',['Nee hoor, ik bel zomaar even.','Dat mag ik niet zeggen.']],
  ['Wat? Ik heb niks betaald!','Dat dacht ik al. Fijn dat ik u te pakken heb.',['Dan heeft u een groot probleem.','Weet u dat zeker? Denk eens na.']],
  ['Hoe weet ik dat u echt van de bank bent?','Goede vraag. Neemt u gerust even de tijd.',['Dat moet u gewoon geloven.','Wilt u nou geholpen worden of niet?']],
  ['Mijn kleinzoon zegt dat ik dan moet ophangen.','Verstandige jongen. Ik vraag u ook niks geheims.',['Uw kleinzoon weet er niks van.','Dan bent u straks alles kwijt.']],
  ['Ik word er zenuwachtig van.','Begrijpelijk. We doen het rustig, stap voor stap.',['Daar heb ik geen tijd voor.','Stel u niet zo aan.']],
  ['Moet ik nu iets doen?','Alleen even meekijken. Ik loop alles met u door.',['Ja, en wel nu meteen!','Zoekt u dat zelf maar uit.']]]},
 mam:{mode:'chat',who:'Mam',av:'M',ok:['Ze trapt erin','Ze appt lief terug'],no:['Ze twijfelt','Dat klopt niet, denkt ze'],turns:[
  ['Wie is dit?','Hoi mam, ik ben het! Telefoon kapot, dit is mijn nieuwe nummer.',['Raad maar 😉','Doet er niet toe, mam.']],
  ['O lieverd! Wat is er gebeurd?','Gevallen in de tram. Scherm helemaal kapot 😩',['Lang verhaal, geen tijd.','Niks, waarom vraag je dat?']],
  ['Waarom bel je niet even?','Microfoon doet het niet, daarom app ik.',['Bellen is te duur.','Ik mag niet bellen van mijn baas.']],
  ['Hoe heet de hond van oma ook alweer?','Haha mam, alsof ik dat vergeet ❤️',['Weet ik niet meer.','Max? Of Bobby?']],
  ['Kom je zondag eten?','Tuurlijk! Neem ik een taart mee 🎂',['Nee, nooit meer.','Ik woon toch in het buitenland?']],
  ['Wat heb je nodig?','Er moet vandaag een rekening weg. Morgen krijg je het terug!',['Gewoon al je geld.','Alles wat je hebt, snel.']],
  ['Ik weet het niet hoor…','Geen stress mam, het mag ook morgen. Kusje!',['Doe nou maar gewoon!','Dan vraag ik het wel aan papa.']]]},
 mule:{mode:'call',who:'Bank · afd. fraude',av:'B',ok:['Hij gelooft je','Klinkt normaal'],no:['Hij noteert iets','Hij wordt achterdochtig'],turns:[
  ['Spreek ik met de rekeninghouder?','Ja, dat ben ik.',['Nee, nooit van gehoord.','Welke rekening bedoelt u?']],
  ['Er kwam gisteren € 2.400 binnen. Van wie?','Van een vriend, voor een tweedehands scooter.',['Geen idee, zomaar.','Dat gaat u niks aan.']],
  ['Het is meteen contant opgenomen. Door u?','Ja, ik heb hem contant betaald.',['Nee, door een kennis van me.','Dat weet ik niet meer.']],
  ['Waar is die scooter nu?','In de schuur. Komt u gerust kijken.',['Al weer verkocht.','Welke scooter?']],
  ['Heeft iemand anders uw pas?','Nee, die zit gewoon in mijn portemonnee.',['Even een vriend, heel kort.','Mag dat niet dan?']],
  ['Waarom zoveel geld op één dag?','Ik spaarde er al maanden voor.',['Gewoon, omdat het kan.','Was niet mijn geld.']]]},
 chantage:{mode:'call',who:'Van Laar',av:'VL',ok:['Hij luistert','Hij slikt'],no:['Hij lacht je uit','Hij wordt kwaad'],turns:[
  ['Met Van Laar.','Meneer Van Laar. Ik heb foto\'s die u wilt zien.',['Hoi! Hoe gaat het met u?','Ik ben het, raad eens.']],
  ['Wie is dit? Hoe kom je aan dit nummer?','Dat doet er niet toe. De foto\'s wel.',['Sorry, verkeerd verbonden.','Van uw vrouw.']],
  ['Ik bel de politie.','Doe maar. Dan zien zij de foto\'s ook.',['Nee! Alstublieft niet!','Prima, dan hang ik op.']],
  ['Wat wil je?','Een redelijk bedrag. Daarna hoort u nooit meer van me.',['Alles wat u heeft.','Weet ik nog niet precies.']],
  ['Hoe weet ik dat je ze weggooit?','Mijn woord. Ik wil geen gedoe, u ook niet.',['Dat weet u niet, haha.','Die gooi ik nooit weg.']],
  ['Ik moet erover nadenken.','Morgen om twaalf uur bel ik terug.',['Je hebt tien seconden.','Neem gerust een jaar.']],
  ['Je bent een rat.','Ik ben een zakenman. Net als u.',['Jij bent zelf een rat!','Sorry, zo bedoelde ik het niet.']]]},
 shop:{mode:'chat',who:'Klant: Kevin',av:'K',ok:['Hij wacht nog even','Hij kalmeert'],no:['Hij wordt bozer','Hij dreigt met de bank'],turns:[
  ['Waar blijft mijn bestelling?? Al drie weken!','Wat vervelend! Ik zoek het meteen voor je uit.',['Weet ik veel.','Geduld is een schone zaak.']],
  ['Track & trace doet het niet.','Klopt, er is een storing bij de bezorger.',['Welke track & trace?','Raar, bij mij doet hij het.']],
  ['Ik wil mijn geld terug.','Natuurlijk. De terugbetaling staat klaar, binnen 14 dagen.',['Geld terug? Nee hoor.','Dat kan helaas niet.']],
  ['Jullie zijn gewoon oplichters!','Ik snap je boosheid. Als excuus krijg je 10% korting.',['En jij bent een zeur.','Bewijs het maar.']],
  ['Ik ga een slechte review schrijven.','Wacht nog even, je pakket is echt onderweg.',['Doe maar, niemand leest ze.','Ga je gang.']],
  ['Waarom staat er geen adres op jullie site?','We verhuizen. Het nieuwe adres staat er volgende week op.',['Adres? Waarvoor?','Wij zitten overal.']],
  ['Ik bel mijn bank.','Dat hoeft echt niet, ik regel het vandaag nog.',['Prima, succes ermee.','De bank kan toch niks.']]]}};
// draadkleuren voor het alarm
const CG_WIRE_COL=[['rood','#ff4d5e'],['blauw','#4d8dff'],['geel','#ffd23f'],['groen','#3fe395'],['wit','#e8e4da'],['paars','#b98cff']];
// keuren: wat er voorbijkomt. note = bankbiljetten (een fout biljet heeft één duidelijk gebrek); box = dozen met een label
const CG_SORT={
 note:{kind:'note',no:'Afkeuren',yes:'Goed',hitY:'Goed biljet',hitN:'Eruit',bad:['Dat was een fout biljet','Dat biljet was goed']},
 lading:{kind:'box',no:'Laten staan',yes:'Meenemen',hitY:'In de bus',hitN:'Laten staan',bad:['Rommel meegenomen','Waardevol laten staan'],
  take:[['Telefoons','phone'],['Laptops','laptop'],['Tablets','tablet'],['Parfum','bottle'],['Sneakers','shoe']],
  junk:[['Luiers','roll'],['Hondenvoer','sack'],['Wc-papier','roll'],['Tuinaarde','sack'],['Kattenbakkorrels','sack']]},
 loods:{kind:'box',no:'Laten',yes:'Pakken',hitY:'Gepakt',hitN:'Laten liggen',bad:['Rommel gepakt','Waardevol laten liggen'],
  take:[['Cash','cash'],['Telefoons','phone'],['Horloges','watch'],['Sigaretten','box'],['Sneakers','shoe']],
  junk:[['Lege dozen','empty'],['Oud ijzer','scrap'],['Kapotte tv','tv'],['Bouwpuin','sack'],['Isolatie','roll']]}};
const CG_NOTE_FLAW={vlek:'inktvlek',scheef:'scheef gedrukt',kleur:'kleur mist',strip:'geen hologram'};
// uitkijken: vier plekken (van links naar rechts), wie er opduikt en wat je intussen doet
const CG_LOOK={
 tag:{who:'Buurtbewoner',spots:['Raam','Balkon','Portiek','Steeg'],job:'tag',hit:'Op tijd gezien'},
 krat:{who:'Bedrijfsleider',spots:['Kantoor','Achterdeur','Laadperron','Hek'],job:'krat',hit:'Op tijd gezien'},
 pakket:{who:'Bewoner',spots:['Nr. 12','Nr. 14','Nr. 16','Nr. 18'],job:'pakket',hit:'Op tijd gezien'}};
// nakijken: velden met waarden die op elkaar lijken
const CG_CHECK={
 factuur:{a:'Werkbon',b:'Factuur',ok:'Verbeterd',fields:[['Opdrachtgever',['Bouwbedrijf Van Dijk','Bouwbedrijf Van Dam','Klusbedrijf Öztürk','Sloopwerken Noord','Sloopwerken Zuid']],
  ['Werk',['Dakgoten','Dakkapel','Tegelwerk','Sloopwerk','Steigerbouw']],['Bedrag',['€ 12.750','€ 12.570','€ 21.750','€ 8.400','€ 8.040']],
  ['Datum',['3 maart','13 maart','17 april','7 april','2 juni']],['Factuurnr.',['F-2041','F-2014','F-2077','F-2071','F-2113']],['Uren',['84','48','120','102']]]},
 bouw:{a:'Pasje',b:'Loonlijst',ok:'Rechtgezet',fields:[['Naam',['Kees Bakker','Kees Backer','Ahmed Yilmaz','Ahmet Yilmaz','Piotr Nowak','Piotr Novak']],
  ['Functie',['Metselaar','Timmerman','Stukadoor','Steigerbouwer']],['Geboren',['12-03-1988','21-03-1988','04-11-1975','14-11-1975']],
  ['BSN',['1844.27.391','1844.72.391','2093.11.584','2039.11.584']],['Ploeg',['Ploeg A','Ploeg B','Ploeg C']],['Uren',['38','36','40','32']]]},
 offerte:{a:'Eisen gemeente',b:'Jouw offerte',ok:'Aangepast',fields:[['Brug',['80 meter','60 meter','90 meter','68 meter']],['Oplevering',['mei 2028','maart 2028','mei 2029','juni 2028']],
  ['Budget',['€ 9,4 mln','€ 9,8 mln','€ 4,9 mln','€ 8,4 mln']],['Materiaal',['Staal','Beton','Hout','Staal en beton']],['Rijstroken',['2 stroken','4 stroken','3 stroken']],['Fietspad',['Ja, twee kanten','Ja, één kant','Nee']]]}};

// ---------- de spellen ----------
const cgQTick=(T,G,dt,late)=>{if(G.q){G.q.left-=dt;if(G.q.left<=0){G.q=null;G.gap=T.gapT||.9;G.dirty=1;if(T.onLate)T.onLate(G);G.bad(late||'Te laat')}}else{G.gap-=dt;if(G.gap<=0)T.ask(G)}};
Object.assign(CG_TYPES,{
 call:{n:'Bellen',lbl:'Bellen',ic:'phonewave',sk:['charisma','handel'],kind:'choice',mu:3.4,s:.8,e:[.02,.06],km:w=>[4+Math.round(w),1],
  how:'De ander vraagt iets: kies steeds wat je terugzegt.',
  init(G){const C=CG_CALL[G.th.set]||CG_CALL.bank,mid=C.turns.slice(1);if(mid.length>G.k+G.m-1)mid.splice(1+Math.floor(Math.random()*(mid.length-1)),1);
   G.cs=C;G.turns=[C.turns[0]].concat(mid);G.ti=0;G.log=[];G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=1;G.qid=0;G.trust=.3;G.dirty=1},
  ask(G){const t=G.turns[G.ti++%G.turns.length],opts=cgShuffle([{t:t[1],ok:1},{t:t[2][0]},{t:t[2][1]}]);
   G.q={opts,ans:opts.findIndex(o=>o.ok),left:G.Tc,id:++G.qid};G.log.push({w:'them',t:t[0]});G.dirty=1},
  onLate(G){G.log.push({w:'me',t:'…',no:1});G.trust=Math.max(0,G.trust-.2)},gapT:1.3,
  tick(G,dt){cgQTick(this,G,dt,'Te lang stil');const ty=!G.q&&G.gap<.8&&!G.done;if(ty!==G.typing){G.typing=ty;G.dirty=1}G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:3}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>2)return;const o=G.q.opts[+a],ok=+a===G.q.ans;G.q=null;G.gap=1.3;G.log.push({w:'me',t:o.t,no:!ok});G.dirty=1;
   if(ok){G.trust=Math.min(1,G.trust+.7/G.k);G.hit(cgPick(G.cs.ok))}else{G.trust=Math.max(0,G.trust-.2);G.bad(cgPick(G.cs.no))}},
  time:G=>4+(G.k+G.m)*(G.Tc*.75+1.5)},
 peek:{n:'Meekijken',lbl:'Meekijken',ic:'card',sk:['steal','hack'],kind:'choice',mu:.95,s:.25,e:[.015,.05],km:w=>[4+Math.round(2*w),1],
  how:'Kijk mee hoe de code wordt ingetoetst en toets hem daarna zelf in.',
  init(G){const c=[];while(c.length<G.k){const d=String(Math.floor(Math.random()*10));if(c[c.length-1]!==d)c.push(d)}G.code=c;
   G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.step=(.62+.2*G.d)*G.slow;G.ph='show';G.si=-1;G.st=.7;G.i=0;G.left=0;G.qid=0;G.lit=null;G.dirty=1},
  tick(G,dt){if(G.ph==='show'){G.st-=dt;if(G.st<=0){G.si++;if(G.si>=G.k){G.ph='gap';G.st=.6;G.si=-1}else G.st=G.step;G.dirty=1}
    const l=G.si>=0&&G.st>G.step*.3?G.code[G.si]:null;if(l!==G.lit){G.lit=l;G.dirty=1}}
   else if(G.ph==='gap'){G.st-=dt;if(G.st<=0){G.ph='in';G.left=G.Tc+.2;G.qid++;G.dirty=1}}
   else{G.left-=dt;if(G.left<=0){G.left=G.Tc;G.qid++;G.dirty=1;G.bad('Te traag')}}
   G.hint={kind:'choice',id:G.ph==='in'?G.qid:0,ans:G.ph==='in'?'k'+G.code[G.i]:null,n:10}},
  press(G,a){if(G.ph!=='in'||a==null)return;a=String(a);if(a[0]!=='k')return;const d=a.slice(1);G.qid++;G.left=G.Tc;G.flash={d,t:G.t,ok:d===G.code[G.i]};G.dirty=1;
   if(d===G.code[G.i]){G.i++;G.hit('Goed')}else G.bad('Fout cijfer')},
  time:G=>3+G.k*G.step+(G.k+G.m)*(G.Tc*.75+.4)},
 wire:{n:'Alarm',lbl:'Alarm',ic:'bolt',sk:['sloten','hack'],kind:'choice',mu:1.8,s:.4,e:[.01,.03],km:w=>[4+Math.round(w),1],
  how:'Lees welke draad eruit moet, volg de kleur en knip.',
  init(G){G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=.4;G.qid=0;G.lastT=-1;G.labels=G.th.labels||['SIRENE','LAMP','BEL','GSM'];G.verb=G.th.verb||'Knip';this.deal(G)},
  deal(G){G.cols=cgShuffle(CG_WIRE_COL).slice(0,4);let p;do{p=cgShuffle([0,1,2,3])}while(p.filter((x,i)=>x===i).length>1);G.perm=p;G.dirty=1},
  ask(G){this.deal(G);let t;do{t=Math.floor(Math.random()*4)}while(t===G.lastT);G.lastT=t;G.q={tgt:t,ans:G.perm[t],left:G.Tc,id:++G.qid};G.cut=null;G.dirty=1},
  onLate(G){},
  tick(G,dt){cgQTick(this,G,dt);G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:4}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>3)return;const ok=+a===G.q.ans;G.cut={pos:+a,ok,t:G.t};G.q=null;G.gap=.8;G.dirty=1;
   if(ok)G.hit(G.verb==='Knip'?'Geknipt':'Afgetapt');else G.bad('Verkeerde draad')},
  time:G=>5+(G.k+G.m)*(G.Tc*.75+1.2)},
 sort:{n:'Keuren',lbl:'Keuren',ic:'crate',sk:['handel','steal'],kind:'choice',mu:1.15,s:.3,e:[.01,.04],km:w=>[6+Math.round(2*w),2],
  how:'Bekijk wat er voorbijkomt en kies: goed of weg.',
  init(G){G.cs=CG_SORT[G.th.set]||CG_SORT.note;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=.5;G.qid=0;G.run=[];G.queue=[this.make(G),this.make(G),this.make(G)];G.last=null},
  make(G){const r=G.run;let good=Math.random()<.5;if(r.length>=2&&r[r.length-1]===good&&r[r.length-2]===good)good=!good;r.push(good);const cs=G.cs;
   if(cs.kind==='note')return {good,flaw:good?null:cgPick(Object.keys(CG_NOTE_FLAW)),serial:'NL'+Math.floor(1e7+Math.random()*9e7)};
   const it=cgPick(good?cs.take:cs.junk);return {good,lbl:it[0],ic:it[1],tilt:cgU(-3,3)}},
  ask(G){const it=G.queue.shift();G.queue.push(this.make(G));G.q={it,ans:it.good?1:0,left:G.Tc,id:++G.qid};G.dirty=1},
  onLate(G){},
  tick(G,dt){const q=G.q;cgQTick(this,G,dt);if(q&&!G.q&&!G.last)G.last={it:q.it,a:-1,t:G.t};G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:2}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>1)return;const ok=+a===G.q.ans;G.last={it:G.q.it,a:+a,t:G.t};G.q=null;G.gap=.55;G.dirty=1;
   if(ok)G.hit(+a?G.cs.hitY:G.cs.hitN);else G.bad(G.cs.bad[+a?0:1])},
  time:G=>5+(G.k+G.m)*(G.Tc*.75+.7)},
 lookout:{n:'Uitkijken',lbl:'Uitkijken',ic:'house',sk:['speed','steal'],kind:'react',km:w=>[4+Math.round(w),2],
  how:'Het werk gaat vanzelf: tik op de plek waar iemand opduikt.',
  init(G){G.cs=CG_LOOK[G.th.set]||CG_LOOK.tag;G.L=cgReact(G.p,.8,.17)*G.slow;G.spot=-1;G.pt=cgU(1.1,1.8);G.wid=0;G.lastS=-1;G.mark=null;G.dirty=1},
  tick(G,dt){G.pt-=dt;if(G.spot>=0){if(G.pt<=0){G.mark={s:G.spot,ok:0,t:G.t};G.goneT=G.t;G.spot=-1;G.pt=cgU(.9,1.6);G.dirty=1;G.bad('Gezien')}}
   else if(G.pt<=0){let s;do{s=Math.floor(Math.random()*4)}while(s===G.lastS);G.lastS=s;G.spot=s;G.pt=G.L;G.wid++;G.dirty=1}
   G.hint={kind:'react',id:G.spot>=0?G.wid:0,on:G.spot>=0,spot:G.spot}},
  press(G,a){if(a==null||a==='go')return;a=+a;if(!(a>=0&&a<4))return;const was=G.spot;if(was<0&&G.goneT!=null&&G.t-G.goneT<.7)return; // net te laat: telt al als fout
   G.mark={s:a,ok:a===was,t:G.t};G.dirty=1;
   if(a===was){G.spot=-1;G.pt=cgU(.9,1.6);G.hit(G.cs.hit)}else if(was>=0){G.spot=-1;G.pt=cgU(.9,1.6);G.bad('Verkeerde kant')}else G.bad('Daar is niemand')},
  time:G=>6+(G.k+G.m)*(1.35+G.L)},
 follow:{n:'Volgen',lbl:'Volgen',ic:'container',sk:['cars','hack'],kind:'track',mu:.3,s:.09,e:[.01,.03],km:()=>[3,1],
  how:'Onthoud welke van jou is en volg hem terwijl ze schuiven.',
  init(G){G.N=G.th.N||3;G.S=3+Math.round(2*G.w);G.D=cgFollowD(G.p,G.N,G.S,G.e,this.mu,this.s)*G.slow;G.Ta=4*G.slow;
   G.slot=Array.from({length:G.N},(_,i)=>i);G.mine=Math.floor(Math.random()*G.N);G.qid=0;this.round(G)},
  round(G){G.mine=Math.floor(Math.random()*G.N);G.ph='show';G.pt=1.5*G.slow;G.sw=null;G.nsw=0;G.pick=null;G.dirty=1},
  tick(G,dt){G.pt-=dt;
   if(G.ph==='show'&&G.pt<=0){G.ph='hide';G.pt=.45;G.dirty=1}
   else if(G.ph==='hide'&&G.pt<=0){G.ph='swap';G.pt=0}
   if(G.ph==='swap'&&G.pt<=0){if(G.sw){const [a,b]=G.sw;G.slot=G.slot.map(s=>s===a?b:s===b?a:s);G.sw=null}
    if(G.nsw>=G.S){G.ph='ask';G.pt=G.Ta;G.qid++;G.dirty=1}
    else{let a=Math.floor(Math.random()*G.N),b;do{b=Math.floor(Math.random()*G.N)}while(b===a);if(G.nsw===0&&G.slot[G.mine]!==a&&G.slot[G.mine]!==b)a=G.slot[G.mine];G.sw=[a,b];G.swT=G.D;G.pt=G.D;G.nsw++;G.dirty=1}}
   else if(G.ph==='ask'&&G.pt<=0){G.pick={s:-1,ok:0};G.ph='reveal';G.pt=1;G.dirty=1;G.bad('Te laat')}
   else if(G.ph==='reveal'&&G.pt<=0&&!G.done)this.round(G);
   G.hint={kind:'choice',id:G.ph==='ask'?G.qid:0,ans:G.ph==='ask'?G.slot[G.mine]:null,n:G.N,track:{S:G.S,D:G.D}}},
  press(G,a){if(G.ph!=='ask'||a==null||a==='go')return;a=+a;if(!(a>=0&&a<G.N))return;const ok=G.slot[G.mine]===a;G.pick={s:a,ok};G.ph='reveal';G.pt=1;G.dirty=1;
   if(ok)G.hit('Die is het');else G.bad('Verkeerde')},
  time:G=>4+(G.k+G.m)*(1.5*G.slow+.45+G.S*G.D+2.2+1)},
 check:{n:'Nakijken',lbl:'Nakijken',ic:'invoice',sk:['rechten','charisma'],kind:'choice',mu:3.2,s:.8,e:[.02,.05],km:w=>[3+Math.round(w),1],
  how:'Vergelijk de twee papieren en tik het vakje dat niet klopt.',
  init(G){G.cs=CG_CHECK[G.th.set]||CG_CHECK.factuur;G.Tc=cgChoiceT(G.p,this.mu,this.s,G.e)*G.slow;G.q=null;G.gap=.4;G.qid=0;G.mark=null},
  ask(G){const F=cgShuffle(G.cs.fields).slice(0,4),A=F.map(f=>cgPick(f[1])),B=A.slice(),bad=Math.floor(Math.random()*4);B[bad]=cgPick(F[bad][1].filter(v=>v!==A[bad]));
   G.q={F,A,B,ans:bad,left:G.Tc,id:++G.qid};G.cur=G.q;G.mark=null;G.dirty=1},
  onLate(G){G.mark={i:G.cur.ans,ok:0,late:1}},gapT:1.1,
  tick(G,dt){cgQTick(this,G,dt);G.hint={kind:'choice',id:G.q?G.q.id:0,ans:G.q?G.q.ans:null,n:4}},
  press(G,a){if(!G.q||a==null||a==='go'||+a>3)return;const ok=+a===G.q.ans;G.mark={i:+a,ok,ans:G.q.ans};G.q=null;G.gap=1.1;G.dirty=1;if(ok)G.hit(G.cs.ok);else G.bad('Dat klopte wel')},
  time:G=>4+(G.k+G.m)*(G.Tc*.75+1.4)}});
// volgen: schuifduur D uit de kans per ronde p (N plekken, S schuiven, e = kans op misklikken)
function cgFollowD(p,N,S,e,mu,s){const pp=Math.min(.9995,p/(1-e)),Q=Math.max(.02,(pp-1/N)/(1-1/N)),q=Math.pow(Q,1/S);return Math.max(.16,mu+s*cgNinv(q))}

// ---------- uitleg ----------
Object.assign(CG_INFO,{
 call:{noun:'goed',ctl:'three',steps:['{who} zegt iets.','Kies wat je terugzegt.','Blijf rustig en geloofwaardig.']},
 peek:{noun:'cijfers',ctl:'pad',steps:['Kijk mee hoe {who} de code intoetst.','Toets daarna dezelfde code in.','Elk cijfer heeft zijn eigen tijd.']},
 wire:{noun:'draden',ctl:'four',steps:['Lees welke draad eruit moet.','Volg zijn kleur naar beneden.','Tik die kleur.']},
 sort:{noun:'goed',ctl:'two',steps:['Bekijk wat er voorbijkomt.','Goed? Rechts. Fout? Links.','Op tijd kiezen.']},
 lookout:{noun:'op tijd',ctl:'spot',steps:['Het werk gaat vanzelf.','Duikt er iemand op? Tik op die plek.','Te laat of de verkeerde plek telt als fout.']},
 follow:{noun:'goed',ctl:'slot',steps:['Onthoud welke van jou is.','Volg hem terwijl ze schuiven.','Tik daarna de goede aan.']},
 check:{noun:'gevonden',ctl:'field',steps:['Vergelijk de twee papieren.','Eén vakje klopt niet.','Tik dat vakje aan.']}});

// ---------- tekeningen ----------
const cgClock=t=>{const s=Math.floor(t);return String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0')};
const CG_PEEK_KEYS=['1','2','3','4','5','6','7','8','9','*','0','#'];
// pictogrammen op dozen (24×24, lijnen)
const CG_BOXIC={phone:'<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M11 18h2"/>',laptop:'<rect x="5" y="5" width="14" height="10" rx="1"/><path d="M3 18h18"/>',tablet:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="18" r=".6"/>',
 bottle:'<path d="M10 3h4v3l2 3v11H8V9l2-3z"/><path d="M8 13h8"/>',shoe:'<path d="M3 16v-5l5 1 3-3 4 4 6 1v2z"/><path d="M3 19h18"/>',cash:'<rect x="3" y="7" width="18" height="10" rx="1"/><circle cx="12" cy="12" r="2.5"/>',
 watch:'<circle cx="12" cy="12" r="5"/><path d="M12 9.5V12l1.5 1M9 4h6M9 20h6"/>',box:'<rect x="5" y="7" width="14" height="11"/><path d="M5 10h14M9 7v11"/>',
 roll:'<ellipse cx="9" cy="12" rx="4" ry="6"/><path d="M9 6h8v12H9"/><ellipse cx="9" cy="12" rx="1.3" ry="2"/>',sack:'<path d="M8 5h8l-1 3c3 2 4 5 4 8a4 4 0 01-4 4H9a4 4 0 01-4-4c0-3 1-6 4-8z"/>',
 empty:'<path d="M4 9l8-4 8 4v8l-8 4-8-4z"/><path d="M4 9l8 4 8-4"/>',scrap:'<path d="M4 17l5-9 3 5 3-3 5 7z"/>',tv:'<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M9 21h6M8 9l3 4-2 2"/>'};
Object.assign(CG_VIEW,{
 call:{who:G=>G.cs.who,
  stage:G=>{const C=G.cs,chat=C.mode==='chat';return `<div class="cg-ph ${chat?'chat':'call'}"><div class="cg-ph-scr">
   <div class="cg-ph-top"><i class="cg-ph-av">${cgEsc(C.av)}</i><div class="cg-ph-id"><b>${cgEsc(C.who)}</b><small id="cgPhSt">${chat?'online':'00:00'}</small></div>${chat?'':'<span class="cg-ph-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>'}</div>
   <div class="cg-ph-log" id="cgLog" aria-live="polite"></div>
   <div class="cg-ph-trust"><span>Vertrouwen</span><i><i id="cgTrust"></i></i></div></div></div>`+cgFxEl},
  ctl:()=>'<div class="cg-ask">Wat zeg je?<i class="cg-ring"><i id="cgQt"></i></i></div><div class="cg-opts cg-reply" id="cgOpts"></div>',
  paint(G,ov){if(G.dirty){const lg=ov.querySelector('#cgLog'),op=ov.querySelector('#cgOpts');
    if(lg)lg.innerHTML=G.log.slice(-4).map(m=>`<p class="cg-ph-b ${m.w}${m.no?' no':''}">${m.w==='them'?`<span>${cgEsc(G.cs.who)}</span>`:''}${cgEsc(m.t)}</p>`).join('')+(G.typing?'<p class="cg-ph-b them typing"><i></i><i></i><i></i></p>':'');
    if(op)op.innerHTML=G.q?G.q.opts.map((o,i)=>cgBtn(i,cgEsc(o.t),'ghost cg-rb')).join(''):'';
    const tr=ov.querySelector('#cgTrust');if(tr)tr.style.width=(G.trust*100).toFixed(0)+'%'}
   const st=ov.querySelector('#cgPhSt');if(st){const v=G.cs.mode==='chat'?(G.typing?'typt…':'online'):cgClock(G.t);if(st._v!==v){st._v=v;st.textContent=v}}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.q?(G.q.left/G.Tc*100).toFixed(1)+'%':'0%';cgFxPaint(G,ov)}},
 peek:{who:()=>'',key:(G,k)=>/^[0-9]$/.test(k)?'k'+k:undefined,
  stage:G=>`<div class="cg-pk"><div class="cg-pk-pad"><div class="cg-pk-scr" id="cgPkScr"></div>
   <div class="cg-pk-keys">${CG_PEEK_KEYS.map(k=>/\d/.test(k)?`<button type="button" class="cg-pk-k" data-a="k${k}" id="cgK${k}">${k}</button>`:`<span class="cg-pk-k off">${k}</span>`).join('')}</div>
   <svg class="cg-pk-hand" id="cgHandP" viewBox="0 0 60 80" aria-hidden="true"><path d="M22 4c4 0 6 3 6 7v22l3-1c3-1 6 1 6 4v1l3-1c3 0 5 2 5 5v1l3-1c3 0 5 2 5 5v14c0 10-8 18-18 18H30c-7 0-12-4-15-10L5 46c-2-3 0-7 4-7 2 0 4 1 5 3l3 5V11c0-4 2-7 5-7z" fill="#d9a77c" stroke="#7a5236" stroke-width="2"/></svg></div>
   <div class="cg-pk-st" id="cgPkSt"></div></div>`+cgFxEl,
  ctl:()=>'<div class="cg-ask" id="cgAsk"></div>',
  paint(G,ov){if(G.dirty){const sc=ov.querySelector('#cgPkScr'),st=ov.querySelector('#cgPkSt'),ak=ov.querySelector('#cgAsk'),h=ov.querySelector('#cgHandP');
    if(sc)sc.innerHTML=Array.from({length:G.k},(_,i)=>`<i class="${G.ph==='in'&&i<G.i?'on':''}${G.ph==='in'&&i===G.i?' cur':''}">${G.ph==='in'&&i<G.i?G.code[i]:''}</i>`).join('');
    ov.querySelectorAll('.cg-pk-k[data-a]').forEach(b=>{const d=b.dataset.a.slice(1);b.classList.toggle('lit',G.lit===d);b.disabled=G.ph!=='in'});
    if(st)st.innerHTML=G.ph==='in'?'<b>Jouw beurt</b>':`<b>Kijk mee</b><span>${cgEsc(G.th.who||'')}</span>`;
    if(ak)ak.innerHTML=G.ph==='in'?'Toets de code in<i class="cg-ring"><i id="cgQt"></i></i>':'Let goed op…';
    if(h){const k=G.lit||(G.ph==='show'&&G.si>=0?G.code[G.si]:null),el=k?ov.querySelector('#cgK'+k):null,pad=ov.querySelector('.cg-pk-pad');
     if(el&&pad&&G.ph!=='in'){const r=el.getBoundingClientRect(),p=pad.getBoundingClientRect();h.style.opacity='1';h.style.transform=`translate(${(r.left-p.left+r.width*.5-18).toFixed(0)}px,${(r.top-p.top+r.height*.45).toFixed(0)}px)`}
     else if(G.ph==='in'||G.ph==='gap')h.style.opacity='0'}}
   if(G.flash){const b=ov.querySelector('#cgK'+G.flash.d),on=G.t-G.flash.t<.25;if(b){b.classList.toggle('ok',on&&G.flash.ok);b.classList.toggle('no',on&&!G.flash.ok)}if(!on)G.flash=null}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=Math.max(0,Math.min(1,G.left/G.Tc))*100+'%';cgFxPaint(G,ov)}},
 wire:{
  stage:G=>CG_SVG(`<defs><linearGradient id="cgBoxG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2f37"/><stop offset="1" stop-color="#1b1f25"/></linearGradient></defs>
   <rect width="400" height="240" fill="#0b0d10"/><rect x="34" y="8" width="332" height="224" rx="10" fill="url(#cgBoxG)" stroke="#3a404a" stroke-width="2"/>
   ${[[46,20],[354,20],[46,220],[354,220]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="4" fill="#4a515c"/><path d="M${x-2.5} ${y}h5" stroke="#1b1f25" stroke-width="1.5"/>`).join('')}
   <rect x="56" y="48" width="288" height="16" rx="3" fill="#121519"/><rect x="56" y="192" width="288" height="16" rx="3" fill="#121519"/>
   <g id="cgWires"></g><g id="cgTerm"></g>`)+cgFxEl,
  ctl:G=>`<div class="cg-ask" id="cgAsk"></div><div class="cg-wbtn" id="cgWb"></div>`,
  paint(G,ov){if(G.dirty){const X=i=>80+i*80,w=ov.querySelector('#cgWires'),tm=ov.querySelector('#cgTerm'),ak=ov.querySelector('#cgAsk'),wb=ov.querySelector('#cgWb');
    const inv=[];G.perm.forEach((p,i)=>inv[p]=i);const tg=G.q?G.q.tgt:-1;
    if(w)w.innerHTML=G.perm.map((p,i)=>{const c=G.cols[i][1],d=`M${X(i)} 62C${X(i)} 128 ${X(p)} 126 ${X(p)} 194`,cut=G.cut&&G.cut.pos===p;
     return `<path d="${d}" stroke="#07080a" stroke-width="12" fill="none" stroke-linecap="round" opacity=".7"/><path d="${d}" stroke="${c}" stroke-width="7.5" fill="none" stroke-linecap="round"${cut?' stroke-dasharray="118 14 200"':''}/><path d="${d}" stroke="#fff" stroke-opacity=".22" stroke-width="2" fill="none" transform="translate(-1.5 0)"/>`}).join('');
    if(tm)tm.innerHTML=G.labels.map((l,i)=>`<g class="${i===tg?'cg-wt on':'cg-wt'}"><rect x="${X(i)-34}" y="20" width="68" height="22" rx="4" fill="${i===tg?'#ffd166':'#121519'}" stroke="${i===tg?'#ffd166':'#3a404a'}"/><text x="${X(i)}" y="35" text-anchor="middle" class="cg-wl">${cgEsc(l)}</text>
     <rect x="${X(i)-9}" y="48" width="18" height="16" rx="2" fill="#5b626d"/><circle cx="${X(i)}" cy="56" r="3.5" fill="#c9d1da"/></g>`).join('')
     +G.perm.map((p,i)=>`<g><rect x="${X(p)-9}" y="192" width="18" height="16" rx="2" fill="#5b626d"/><circle cx="${X(p)}" cy="200" r="3.5" fill="#c9d1da"/>${G.cut&&G.cut.pos===p?`<circle cx="${X(p)}" cy="182" r="11" fill="none" stroke="${G.cut.ok?'#3fe395':'#ff3d52'}" stroke-width="3"/>`:''}
      <rect x="${X(p)-38}" y="150" width="76" height="90" fill="transparent" data-a="${p}" class="cg-wcut"/></g>`).join('');
    if(ak)ak.innerHTML=G.q?`<div>${cgEsc(G.verb)}: <b>${cgEsc(G.labels[tg])}</b></div><i class="cg-ring"><i id="cgQt"></i></i>`:'<span>Volgende draad…</span>';
    if(wb)wb.innerHTML=[0,1,2,3].map(j=>{const c=G.cols[inv[j]];return cgBtn(j,`<i style="background:${c[1]}"></i><span>${c[0]}</span>`,'ghost',G.q?'':' disabled')}).join('')}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.q?(G.q.left/G.Tc*100).toFixed(1)+'%':'0%';cgFxPaint(G,ov)}},
 sort:{key:(G,k)=>k==='ArrowLeft'||k==='a'||k==='A'?0:k==='ArrowRight'||k==='d'||k==='D'?1:undefined,
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0c0e11"/>
   <rect x="-600" y="176" width="1600" height="26" fill="#1c2027"/><rect x="-600" y="202" width="1600" height="700" fill="#101216"/><g id="cgBelt">${Array.from({length:80},(_,i)=>`<rect x="${i*20-600}" y="178" width="10" height="22" fill="#262b33"/>`).join('')}</g>
   ${Array.from({length:31},(_,i)=>`<circle cx="${20+(i-11)*45}" cy="212" r="9" fill="#14171c" stroke="#2b3038"/>`).join('')}
   <g opacity=".85"><path d="M10 120h44l-6 56H16z" fill="#1d1416" stroke="#5a2a30" stroke-width="2"/><path d="M22 136l20 20M42 136l-20 20" stroke="#ff5c6c" stroke-width="3" stroke-linecap="round"/></g>
   <g opacity=".85"><path d="M346 120h44l-6 56h-32z" fill="#132017" stroke="#2a5a3a" stroke-width="2"/><path d="M358 146l8 8 14-16" stroke="#3fe395" stroke-width="3" fill="none" stroke-linecap="round"/></g>
   <g id="cgQ"></g><g id="cgItm"></g><rect id="cgItT" x="140" y="160" width="120" height="5" rx="2.5" fill="#3fe395"/>`)+cgFxEl,
  ctl:G=>`<div class="cg-yn">${cgBtn(0,`<svg viewBox="0 0 24 24" aria-hidden="true">${CG_SI.no}</svg>${cgEsc(G.cs.no)}`,'ghost cg-no')}${cgBtn(1,`<svg viewBox="0 0 24 24" aria-hidden="true">${CG_SI.ok}</svg>${cgEsc(G.cs.yes)}`,'ghost cg-yes')}</div>`,
  item(G,it,s){if(G.cs.kind==='note'){const f=it.flaw,col=f==='kleur'?'#9a958c':'#e8893a',col2=f==='kleur'?'#b9b4aa':'#f2b36d';
    return `<g transform="scale(${s})"><g ${f==='scheef'?'':''}><rect x="-92" y="-46" width="184" height="92" rx="5" fill="${col2}" stroke="#7a4a1a" stroke-width="1.5"/>
     <g ${f==='scheef'?'transform="translate(13 7) rotate(4)"':''}><rect x="-84" y="-38" width="168" height="76" rx="3" fill="none" stroke="${col}" stroke-width="2"/><path d="M-70 26v-30a22 22 0 0144 0v30" fill="none" stroke="${col}" stroke-width="5"/>
     <text x="40" y="12" text-anchor="middle" class="cg-note">50</text><text x="-78" y="-26" class="cg-noteS">EURO</text><text x="12" y="30" class="cg-noteS">${it.serial}</text></g>
     ${f==='strip'?'<rect x="-14" y="-46" width="16" height="92" fill="none" stroke="#7a4a1a" stroke-dasharray="3 3" opacity=".6"/>':'<rect x="-14" y="-46" width="16" height="92" fill="url(#cgHolo)"/>'}
     ${f==='vlek'?'<path d="M18 -22c10-8 26-6 30 4s-2 20-14 22-24-2-24-12 2-8 8-14z" fill="#2a1a12" opacity=".85"/><circle cx="54" cy="-14" r="4" fill="#2a1a12"/><circle cx="10" cy="6" r="3" fill="#2a1a12"/>':''}</g>
     <defs><linearGradient id="cgHolo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7e7ff"/><stop offset=".5" stop-color="#ffe7f6"/><stop offset="1" stop-color="#c9fff0"/></linearGradient></defs></g>`}
   return `<g transform="scale(${s}) rotate(${it.tilt.toFixed(1)})"><rect x="-70" y="-52" width="140" height="104" rx="3" fill="#b8854f" stroke="#7a5430" stroke-width="2"/><rect x="-70" y="-52" width="140" height="14" fill="#a5743f"/><rect x="-8" y="-52" width="16" height="104" fill="#d9b27a" opacity=".55"/>
    <rect x="-56" y="-26" width="112" height="58" rx="4" fill="#f1ece0"/><g transform="translate(-48 -18) scale(1.7)" fill="none" stroke="#1a1c20" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${CG_BOXIC[it.ic]||''}</g>
    <text x="22" y="10" text-anchor="middle" class="cg-boxl">${cgEsc(it.lbl.toUpperCase())}</text></g>`},
  paint(G,ov){const V=CG_VIEW.sort,itm=ov.querySelector('#cgItm');
   if(G.dirty){const q=ov.querySelector('#cgQ');if(q)q.innerHTML=G.queue.slice(0,2).map((it,i)=>`<g transform="translate(${300+i*70} 34)" opacity="${.5-i*.2}">${V.item(G,it,.36)}</g>`).join('');
    if(itm)itm.innerHTML=G.q?V.item(G,G.q.it,G.cs.kind==='note'?1:.95):G.last?V.item(G,G.last.it,G.cs.kind==='note'?1:.95):''}
   if(itm){let x=200,o=1;if(!G.q&&G.last){const u=Math.min(1,(G.t-G.last.t)/.35);x=200+(G.last.a===1?1:-1)*u*170;o=1-u}else if(G.q){const u=Math.min(1,(G.Tc-G.q.left)/.25);x=200+(1-u)*120;o=u}else o=0;
    itm.setAttribute('transform',`translate(${x.toFixed(1)} 112)`);itm.setAttribute('opacity',o.toFixed(2))}
   const b=ov.querySelector('#cgBelt');if(b&&!G.reduce)b.setAttribute('transform',`translate(${(-(G.t*40)%20).toFixed(1)} 0)`);
   const tt=ov.querySelector('#cgItT');if(tt){const f=G.q?G.q.left/G.Tc:0;tt.setAttribute('width',(120*f).toFixed(1));tt.setAttribute('x',(200-60*f).toFixed(1));tt.setAttribute('fill',f<.3?'#ff5c6c':f<.6?'#ffd166':'#3fe395')}
   cgFxPaint(G,ov)}},
 lookout:{key:(G,k)=>/^[1-4]$/.test(k)?+k-1:undefined,
  geo:{tag:[[34,40,58,62,'win'],[128,30,70,46,'bal'],[230,48,44,98,'door'],[318,22,48,124,'alley']],
   krat:[[30,36,70,44,'win'],[126,46,48,100,'door'],[208,74,92,72,'dock'],[322,58,58,88,'gate']],
   pakket:[[22,40,62,58,'win'],[118,40,62,58,'win'],[214,40,62,58,'win'],[310,40,62,58,'win']]},
  stage:G=>{const cs=G.cs,geo=CG_VIEW.lookout.geo[cs.job]||CG_VIEW.lookout.geo.tag;
   const back=cs.job==='pakket'?[0,1,2,3].map(i=>`<rect x="${i*96+6}" y="14" width="92" height="148" fill="${['#1b1f27','#1f1c24','#1a2024','#211d1d'][i]}"/><path d="M${i*96+6} 14l46-12 46 12" fill="${['#232833','#28232e','#22292e','#2b2525'][i]}"/><rect x="${i*96+40}" y="112" width="26" height="50" rx="2" fill="#121418"/><circle cx="${i*96+60}" cy="138" r="1.6" fill="#8a929c"/>`).join('')
    :cs.job==='krat'?'<rect x="-300" y="16" width="1000" height="146" fill="#1a1d22"/><path d="M-300 16h1000" stroke="#2b3038" stroke-width="4"/>'+Array.from({length:26},(_,i)=>`<path d="M${i*40-320} 20v142" stroke="#20242a"/>`).join('')
    :'<rect x="-300" y="10" width="1000" height="152" fill="#1a1c22"/>'+Array.from({length:8},(_,r)=>Array.from({length:34},(_,c)=>`<rect x="${c*30+(r%2?15:0)-308}" y="${12+r*19}" width="28" height="17" fill="#1f2229"/>`).join('')).join('');
   return CG_SVG(`<rect width="400" height="240" fill="#0b0d10"/>${back}
    ${geo.map((g,i)=>`<g class="cg-lo" data-a="${i}"><rect x="${g[0]}" y="${g[1]}" width="${g[2]}" height="${g[3]}" rx="${g[4]==='alley'?0:3}" fill="#0a0c0f" stroke="#2f343c" stroke-width="2"/>
     <rect id="cgLw${i}" x="${g[0]+3}" y="${g[1]+3}" width="${g[2]-6}" height="${g[3]-6}" fill="#ffcf7a" opacity="0"/>
     <g id="cgLp${i}" opacity="0"><circle cx="${g[0]+g[2]/2}" cy="${g[1]+g[3]*.42}" r="${Math.min(12,g[2]*.2)}" fill="#141218"/><path d="M${g[0]+g[2]/2-Math.min(22,g[2]*.36)} ${g[1]+g[3]-3}q0-${Math.min(28,g[3]*.4)} ${Math.min(22,g[2]*.36)}-${Math.min(28,g[3]*.4)}t${Math.min(22,g[2]*.36)} ${Math.min(28,g[3]*.4)}z" fill="#141218"/></g>
     <rect id="cgLr${i}" x="${g[0]-4}" y="${g[1]-4}" width="${g[2]+8}" height="${g[3]+8}" rx="6" fill="none" stroke="#ff5c6c" stroke-width="3" opacity="0"/>
     <rect x="${g[0]-6}" y="${g[1]-6}" width="${g[2]+12}" height="${g[3]+12}" fill="transparent"/></g>`).join('')}
    <rect x="-600" y="162" width="1600" height="700" fill="#111317"/><path d="M-600 162h1600" stroke="#2b3038" stroke-width="2"/>
    <g id="cgJob"></g>`)+cgFxEl},
  ctl:G=>`<div class="cg-spots">${G.cs.spots.map((s,i)=>cgBtn(i,cgEsc(s),'ghost')).join('')}</div>`,
  paint(G,ov){const cs=G.cs;
   for(let i=0;i<4;i++){const on=G.spot===i,w=ov.querySelector('#cgLw'+i),p=ov.querySelector('#cgLp'+i),r=ov.querySelector('#cgLr'+i);
    if(w)w.setAttribute('opacity',on?'.85':'0');if(p)p.setAttribute('opacity',on?'1':'0');
    if(r){const mk=G.mark&&G.mark.s===i&&G.t-G.mark.t<.5;r.setAttribute('opacity',on||mk?'1':'0');r.setAttribute('stroke',mk?(G.mark.ok?'#3fe395':'#ff5c6c'):'#ff5c6c');
     if(on){const f=Math.max(0,G.pt/G.L),len=2*(+r.getAttribute('width')+ +r.getAttribute('height'));r.setAttribute('stroke-dasharray',`${(len*f).toFixed(1)} ${len}`)}else r.removeAttribute('stroke-dasharray')}}
   if(G.dirty){const j=ov.querySelector('#cgJob'),f=G.hits/G.k;if(j){
    if(cs.job==='tag')j.innerHTML=`<defs><clipPath id="cgTc"><rect x="70" y="168" width="${(260*f).toFixed(1)}" height="70"/></clipPath></defs><text x="200" y="222" text-anchor="middle" class="cg-tagt" opacity=".12">KRAAK</text><text x="200" y="222" text-anchor="middle" class="cg-tagt" clip-path="url(#cgTc)">KRAAK</text>`;
    else if(cs.job==='krat')j.innerHTML=Array.from({length:G.k},(_,i)=>`<g transform="translate(${130+(i%4)*36} ${206-Math.floor(i/4)*26})" opacity="${i<G.hits?1:.15}"><rect x="-16" y="-12" width="32" height="24" rx="2" fill="#c0563a"/>${[-9,0,9].map(x=>`<circle cx="${x}" cy="-5" r="3" fill="#7a2a1a"/><circle cx="${x}" cy="5" r="3" fill="#7a2a1a"/>`).join('')}</g>`).join('');
    else j.innerHTML=Array.from({length:G.k},(_,i)=>`<g transform="translate(${120+i*34} 214)" opacity="${i<G.hits?1:.15}"><rect x="-14" y="-12" width="28" height="24" rx="2" fill="#b8854f"/><rect x="-3" y="-12" width="6" height="24" fill="#d9b27a"/></g>`).join('')}}
   cgFxPaint(G,ov)}},
 follow:{key:(G,k)=>/^[1-9]$/.test(k)?+k-1:k==='ArrowLeft'?0:k==='ArrowDown'&&G.N===3?1:k==='ArrowRight'?G.N-1:undefined,
  sx:(G,s)=>G.N===4?80+s*80:110+s*90,
  obj(G,i,mine,state){if(G.th.obj==='pallet')return `<g><ellipse cx="0" cy="34" rx="36" ry="5" fill="#000" opacity=".45"/><rect x="-34" y="22" width="68" height="10" fill="#8a6a3a"/><rect x="-30" y="-16" width="60" height="38" rx="3" fill="#cfc9b8" opacity=".9"/><path d="M-30 -2h60M-30 10h60" stroke="#a8a294"/>
    <rect x="-30" y="-16" width="60" height="38" rx="3" fill="${state==='mine'?'#ffd166':state==='ok'?'#3fe395':state==='no'?'#ff5c6c':'#9aa3ad'}" opacity="${state?'.55':'.12'}"/></g>`;
   const c=state==='mine'?'#c98a1a':state==='ok'?'#2a9d63':state==='no'?'#b8323f':'#2f5d8a';
   return `<g><ellipse cx="0" cy="30" rx="44" ry="5" fill="#000" opacity=".45"/><rect x="-40" y="-26" width="80" height="54" rx="2" fill="${c}"/>${Array.from({length:9},(_,k)=>`<path d="M${-34+k*8} -22v46" stroke="#000" stroke-opacity=".22" stroke-width="2"/>`).join('')}
    <rect x="-40" y="-26" width="80" height="6" fill="#fff" opacity=".12"/><path d="M28 -20v42M34 -20v42" stroke="#000" stroke-opacity=".35" stroke-width="2"/></g>`},
  stage:G=>CG_SVG(`<rect width="400" height="240" fill="#0b0e12"/><rect x="-600" y="150" width="1600" height="700" fill="#15181d"/><path d="M-600 150h1600" stroke="#2b3038" stroke-width="2"/>
   ${Array.from({length:30},(_,i)=>`<path d="M${i*44-440} 196h22" stroke="#ffd166" stroke-opacity=".25" stroke-width="3"/>`).join('')}
   <path d="M30 20h340" stroke="#2b3038" stroke-width="6"/><path d="M60 20v128M340 20v128" stroke="#2b3038" stroke-width="6"/>
   ${Array.from({length:G.N},(_,s)=>`<rect x="${CG_VIEW.follow.sx(G,s)-46}" y="70" width="92" height="120" fill="transparent" data-a="${s}"/>`).join('')}
   <g id="cgObjs">${Array.from({length:G.N},(_,i)=>`<g id="cgO${i}"></g>`).join('')}</g><g id="cgMk"></g>`)+cgFxEl,
  ctl:G=>`<div class="cg-ask" id="cgAsk"></div><div class="cg-spots n${G.N}" id="cgSp">${Array.from({length:G.N},(_,s)=>cgBtn(s,'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 14l6-6 6 6"/></svg>','ghost',` aria-label="Plek ${s+1}" disabled`)).join('')}</div>`,
  paint(G,ov){const V=CG_VIEW.follow;
   if(G.dirty){const ak=ov.querySelector('#cgAsk');if(ak)ak.innerHTML=G.ph==='show'?'Deze is van jou: onthoud hem':G.ph==='ask'?'Welke is van jou?<i class="cg-ring"><i id="cgQt"></i></i>':G.ph==='reveal'?(G.pick&&G.pick.ok?'Goed gevolgd':'Mis'):'Volg hem…';
    ov.querySelectorAll('#cgSp [data-a]').forEach(b=>b.disabled=G.ph!=='ask')}
   for(let i=0;i<G.N;i++){const g=ov.querySelector('#cgO'+i);if(!g)continue;let x=V.sx(G,G.slot[i]),y=150,sc=1;
    if(G.ph==='swap'&&G.sw){const [a,b]=G.sw,u0=1-Math.max(0,G.pt)/G.swT,u=u0<.5?2*u0*u0:1-2*(1-u0)*(1-u0);
     if(G.slot[i]===a||G.slot[i]===b){const from=G.slot[i],to=from===a?b:a,dir=from===a?-1:1;x=V.sx(G,from)+(V.sx(G,to)-V.sx(G,from))*u;y=150+dir*Math.sin(Math.PI*u)*18;sc=1+dir*.06*Math.sin(Math.PI*u)}}
    const state=G.ph==='show'&&i===G.mine?'mine':G.ph==='reveal'&&i===G.mine?(G.pick&&G.pick.ok?'ok':'mine'):G.ph==='reveal'&&G.pick&&G.pick.s===G.slot[i]&&!G.pick.ok?'no':'';
    if(g._st!==state||!g.firstChild){g._st=state;g.innerHTML=V.obj(G,i,i===G.mine,state)}
    g.setAttribute('transform',`translate(${x.toFixed(1)} ${(y-30).toFixed(1)}) scale(${sc.toFixed(3)})`)}
   // laag: wie vooraan schuift, staat bovenop
   if(G.ph==='swap'&&G.sw&&G.dirty){const os=ov.querySelector('#cgObjs');const fr=G.slot.findIndex(s=>s===G.sw[1]);const el=ov.querySelector('#cgO'+fr);if(os&&el)os.appendChild(el)}
   const mk=ov.querySelector('#cgMk');if(mk){if(G.ph==='show'){const x=V.sx(G,G.slot[G.mine]);mk.innerHTML=`<path d="M${x} 66l-10-14h20z" fill="#ffd166"/><text x="${x}" y="46" text-anchor="middle" class="cg-small y">JOUW</text>`}else mk.innerHTML=''}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.ph==='ask'?Math.max(0,G.pt/G.Ta)*100+'%':'0%';cgFxPaint(G,ov)}},
 check:{
  stage:G=>`<div class="cg-ck"><div class="cg-ck-d a"><h5>${cgEsc(G.cs.a)}</h5><div id="cgCkA"></div></div><div class="cg-ck-d b"><h5>${cgEsc(G.cs.b)}</h5><div id="cgCkB"></div></div></div>`+cgFxEl,
  ctl:G=>`<div class="cg-ask" id="cgAsk"></div>`,
  paint(G,ov){if(G.dirty){const q=G.q||G.cur,A=ov.querySelector('#cgCkA'),B=ov.querySelector('#cgCkB'),ak=ov.querySelector('#cgAsk');
    if(q){A.innerHTML=q.F.map((f,i)=>`<div class="cg-ck-r"><span>${cgEsc(f[0])}</span><b>${cgEsc(q.A[i])}</b></div>`).join('');
     B.innerHTML=q.F.map((f,i)=>{const mk=G.mark&&!G.q?(G.mark.i===i?(G.mark.ok?' ok':' no'):(G.mark.ans===i||G.mark.late&&i===q.ans)&&!G.mark.ok?' was':''):'';
      return `<button type="button" class="cg-ck-r${mk}" data-a="${i}"${G.q?'':' disabled'}><span>${cgEsc(f[0])}</span><b>${cgEsc(q.B[i])}</b></button>`}).join('')}
    if(ak)ak.innerHTML=G.q?`Wat klopt er niet op de ${cgEsc(G.cs.b.toLowerCase())}?<i class="cg-ring"><i id="cgQt"></i></i>`:'<span>Volgende…</span>'}
   const qt=ov.querySelector('#cgQt');if(qt)qt.style.width=G.q?(G.q.left/G.Tc*100).toFixed(1)+'%':'0%';cgFxPaint(G,ov)}}});
cgRegPractice();
